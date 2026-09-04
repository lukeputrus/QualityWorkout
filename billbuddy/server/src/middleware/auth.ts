import type { NextFunction, Request, Response } from "express";
import type { AuthedUser } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { nowISO } from "../utils/ids.js";

interface SessionRow {
  token: string;
  user_id: string;
  firm_id: string;
  device_id: string | null;
  expires_at: string;
}

interface UserRow {
  id: string;
  firm_id: string;
  name: string;
  email: string;
  role: AuthedUser["role"];
  default_hourly_rate_cents: number;
  active: number;
  created_at: string;
}

interface FirmRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  plan: AuthedUser["firm"]["plan"];
  subscription_status: AuthedUser["firm"]["subscriptionStatus"];
  trial_ends_at: string | null;
  monthly_price_cents: number;
  tax_rate_percent: number;
  trust_account_name: string | null;
  created_at: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const session = db
    .prepare<[string], SessionRow>("SELECT * FROM sessions WHERE token = ?")
    .get(token);
  if (!session) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  const userRow = db
    .prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?")
    .get(session.user_id);
  const firmRow = db
    .prepare<[string], FirmRow>("SELECT * FROM firms WHERE id = ?")
    .get(session.firm_id);
  if (!userRow || !firmRow || !userRow.active) {
    res.status(401).json({ error: "Account not found or inactive" });
    return;
  }

  req.user = {
    id: userRow.id,
    firmId: userRow.firm_id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    defaultHourlyRateCents: userRow.default_hourly_rate_cents,
    active: !!userRow.active,
    createdAt: userRow.created_at,
    firm: {
      id: firmRow.id,
      name: firmRow.name,
      address: firmRow.address,
      phone: firmRow.phone,
      email: firmRow.email,
      plan: firmRow.plan,
      subscriptionStatus: firmRow.subscription_status,
      trialEndsAt: firmRow.trial_ends_at,
      monthlyPriceCents: firmRow.monthly_price_cents,
      taxRatePercent: firmRow.tax_rate_percent,
      trustAccountName: firmRow.trust_account_name,
      createdAt: firmRow.created_at,
    },
  };
  req.deviceId = session.device_id;

  if (session.device_id) {
    db.prepare("UPDATE devices SET last_seen_at = ? WHERE id = ?").run(
      nowISO(),
      session.device_id
    );
  }

  next();
}

/** Restricts a route to specific roles, e.g. requireRole('owner','admin'). */
export function requireRole(...roles: AuthedUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
