import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { hashPassword } from "../utils/auth.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

interface UserRow {
  id: string;
  firm_id: string;
  name: string;
  email: string;
  role: string;
  default_hourly_rate_cents: number;
  active: number;
  created_at: string;
}

function toDto(row: UserRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    name: row.name,
    email: row.email,
    role: row.role,
    defaultHourlyRateCents: row.default_hourly_rate_cents,
    active: !!row.active,
    createdAt: row.created_at,
  };
}

usersRouter.get("/", (req, res) => {
  const rows = db
    .prepare<[string], UserRow>(
      "SELECT id, firm_id, name, email, role, default_hourly_rate_cents, active, created_at FROM users WHERE firm_id = ? ORDER BY name"
    )
    .all(req.user!.firmId);
  res.json({ users: rows.map(toDto) });
});

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["owner", "attorney", "paralegal", "admin"]).default("attorney"),
  defaultHourlyRateCents: z.number().int().nonnegative().default(0),
});

usersRouter.post("/", requireRole("owner", "admin"), (req, res) => {
  const data = parseBody(createSchema, req.body, res);
  if (!data) return;
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }
  const id = newId();
  db.prepare(
    `INSERT INTO users (id, firm_id, name, email, password_hash, role, default_hourly_rate_cents, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(id, req.user!.firmId, data.name, data.email, hashPassword(data.password), data.role, data.defaultHourlyRateCents, nowISO());
  res.status(201).json({
    user: toDto(db.prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?").get(id)!),
  });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["owner", "attorney", "paralegal", "admin"]).optional(),
  defaultHourlyRateCents: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
});

usersRouter.patch("/:id", requireRole("owner", "admin"), (req, res) => {
  const data = parseBody(updateSchema, req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], UserRow>("SELECT * FROM users WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const merged = { ...toDto(existing), ...data };
  db.prepare(
    `UPDATE users SET name=?, role=?, default_hourly_rate_cents=?, active=? WHERE id=?`
  ).run(merged.name, merged.role, merged.defaultHourlyRateCents, merged.active ? 1 : 0, req.params.id);
  res.json({ user: toDto(db.prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?").get(req.params.id)!) });
});
