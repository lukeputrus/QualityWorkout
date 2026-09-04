import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  generatePairingCode,
} from "../utils/auth.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const SESSION_TTL_DAYS = 30;
const TRIAL_DAYS = 14;
const PAIRING_CODE_TTL_MINUTES = 10;

function sessionExpiry(): string {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

const registerSchema = z.object({
  firmName: z.string().min(1),
  userName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register-firm", (req, res) => {
  const data = parseBody(registerSchema, req.body, res);
  if (!data) return;

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(data.email);
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }

  const firmId = newId();
  const userId = newId();
  const now = nowISO();
  const trialEndsAt = new Date(
    Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    `INSERT INTO firms (id, name, plan, subscription_status, trial_ends_at, monthly_price_cents, tax_rate_percent, invoice_sequence, created_at)
     VALUES (?, ?, 'billbuddy_pro', 'trialing', ?, 50000, 0, 0, ?)`
  ).run(firmId, data.firmName, trialEndsAt, now);

  db.prepare(
    `INSERT INTO users (id, firm_id, name, email, password_hash, role, default_hourly_rate_cents, active, created_at)
     VALUES (?, ?, ?, ?, ?, 'owner', 0, 1, ?)`
  ).run(userId, firmId, data.userName, data.email, hashPassword(data.password), now);

  const token = generateSessionToken();
  db.prepare(
    `INSERT INTO sessions (token, user_id, firm_id, device_id, created_at, expires_at)
     VALUES (?, ?, ?, NULL, ?, ?)`
  ).run(token, userId, firmId, now, sessionExpiry());

  res.status(201).json({ token });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", (req, res) => {
  const data = parseBody(loginSchema, req.body, res);
  if (!data) return;

  const user = db
    .prepare<[string], { id: string; firm_id: string; password_hash: string; active: number }>(
      "SELECT id, firm_id, password_hash, active FROM users WHERE email = ?"
    )
    .get(data.email);

  if (!user || !user.active || !verifyPassword(data.password, user.password_hash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateSessionToken();
  db.prepare(
    `INSERT INTO sessions (token, user_id, firm_id, device_id, created_at, expires_at)
     VALUES (?, ?, ?, NULL, ?, ?)`
  ).run(token, user.id, user.firm_id, nowISO(), sessionExpiry());

  res.json({ token });
});

authRouter.post("/logout", requireAuth, (req, res) => {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/** Owner/attorney generates a short-lived pairing code on the desktop UI;
 * the companion phone browser (on the same LAN) enters it to link a
 * device-scoped session without ever typing a password on the phone. */
authRouter.post("/pairing-code", requireAuth, (req, res) => {
  const code = generatePairingCode();
  const expiresAt = new Date(
    Date.now() + PAIRING_CODE_TTL_MINUTES * 60 * 1000
  ).toISOString();
  db.prepare(
    `INSERT INTO pairing_codes (code, firm_id, user_id, created_at, expires_at, used)
     VALUES (?, ?, ?, ?, ?, 0)`
  ).run(code, req.user!.firmId, req.user!.id, nowISO(), expiresAt);
  res.status(201).json({ code, expiresAt, ttlMinutes: PAIRING_CODE_TTL_MINUTES });
});

const pairSchema = z.object({
  code: z.string().length(6),
  deviceLabel: z.string().min(1).max(80),
});

authRouter.post("/pair", (req, res) => {
  const data = parseBody(pairSchema, req.body, res);
  if (!data) return;

  const pairing = db
    .prepare<[string], { code: string; firm_id: string; user_id: string; expires_at: string; used: number }>(
      "SELECT * FROM pairing_codes WHERE code = ?"
    )
    .get(data.code);

  if (!pairing || pairing.used || new Date(pairing.expires_at).getTime() < Date.now()) {
    res.status(401).json({ error: "Pairing code is invalid or has expired" });
    return;
  }

  db.prepare("UPDATE pairing_codes SET used = 1 WHERE code = ?").run(data.code);

  const deviceId = newId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO devices (id, firm_id, user_id, label, paired_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(deviceId, pairing.firm_id, pairing.user_id, data.deviceLabel, now, now);

  const token = generateSessionToken();
  db.prepare(
    `INSERT INTO sessions (token, user_id, firm_id, device_id, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(token, pairing.user_id, pairing.firm_id, deviceId, now, sessionExpiry());

  res.status(201).json({ token });
});

interface DeviceRow {
  id: string;
  firm_id: string;
  user_id: string;
  label: string;
  paired_at: string;
  last_seen_at: string | null;
}

authRouter.get("/devices", requireAuth, (req, res) => {
  const rows = db
    .prepare<[string], DeviceRow>("SELECT * FROM devices WHERE firm_id = ? ORDER BY paired_at DESC")
    .all(req.user!.firmId);
  res.json({
    devices: rows.map((d) => ({
      id: d.id,
      firmId: d.firm_id,
      userId: d.user_id,
      label: d.label,
      pairedAt: d.paired_at,
      lastSeenAt: d.last_seen_at,
    })),
  });
});

authRouter.delete("/devices/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE device_id = ?").run(req.params.id);
  db.prepare("DELETE FROM devices WHERE id = ? AND firm_id = ?").run(
    req.params.id,
    req.user!.firmId
  );
  res.status(204).end();
});
