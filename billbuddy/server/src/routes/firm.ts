import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const firmRouter = Router();
firmRouter.use(requireAuth);

firmRouter.get("/", (req, res) => {
  res.json({ firm: req.user!.firm });
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
  trustAccountName: z.string().nullable().optional(),
});

firmRouter.patch("/", requireRole("owner", "admin"), (req, res) => {
  const data = parseBody(updateSchema, req.body, res);
  if (!data) return;
  const f = req.user!.firm;
  const merged = { ...f, ...data };
  db.prepare(
    `UPDATE firms SET name=?, address=?, phone=?, email=?, tax_rate_percent=?, trust_account_name=? WHERE id=?`
  ).run(
    merged.name,
    merged.address ?? null,
    merged.phone ?? null,
    merged.email ?? null,
    merged.taxRatePercent,
    merged.trustAccountName ?? null,
    f.id
  );
  res.json({ firm: db.prepare("SELECT * FROM firms WHERE id = ?").get(f.id) });
});

firmRouter.get("/subscription", (req, res) => {
  const f = req.user!.firm;
  const trialDaysLeft = f.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(f.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  res.json({
    plan: f.plan,
    subscriptionStatus: f.subscriptionStatus,
    monthlyPriceCents: f.monthlyPriceCents,
    trialEndsAt: f.trialEndsAt,
    trialDaysLeft,
  });
});

/** BillBuddy is offline software with no bundled payment processor - a real
 * deployment wires this route to whatever billing platform (Stripe
 * Billing, etc.) the firm's card is actually charged $500/mo through, then
 * flips subscriptionStatus from a webhook. This demo endpoint exists only
 * so the UI's subscription screen has something real to call locally. */
firmRouter.post("/subscription/simulate-activate", requireRole("owner"), (req, res) => {
  db.prepare("UPDATE firms SET subscription_status = 'active' WHERE id = ?").run(req.user!.firmId);
  res.json({ subscriptionStatus: "active" });
});
