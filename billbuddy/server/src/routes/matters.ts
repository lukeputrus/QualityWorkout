import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const mattersRouter = Router();
mattersRouter.use(requireAuth);

interface MatterRow {
  id: string;
  firm_id: string;
  client_id: string;
  title: string;
  practice_area: string | null;
  status: "open" | "pending" | "closed";
  responsible_user_id: string | null;
  billing_type: "hourly" | "flat" | "contingency";
  flat_fee_amount_cents: number | null;
  default_rate_cents: number | null;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
  client_name?: string;
}

function toMatterDto(row: MatterRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    clientId: row.client_id,
    title: row.title,
    practiceArea: row.practice_area,
    status: row.status,
    responsibleUserId: row.responsible_user_id,
    billingType: row.billing_type,
    flatFeeAmountCents: row.flat_fee_amount_cents,
    defaultRateCents: row.default_rate_cents,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    notes: row.notes,
    clientName: row.client_name ?? null,
  };
}

// IMPORTANT: register before "/:id" so "conflict-check" isn't parsed as an id.
mattersRouter.get("/conflict-check", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    res.json({ clients: [], matters: [] });
    return;
  }
  const clients = db
    .prepare(
      "SELECT id, name, type FROM clients WHERE firm_id = ? AND name LIKE ? ORDER BY name"
    )
    .all(req.user!.firmId, `%${q}%`);
  const matters = db
    .prepare(
      `SELECT m.id, m.title, m.status, c.name as client_name
       FROM matters m JOIN clients c ON c.id = m.client_id
       WHERE m.firm_id = ? AND (m.title LIKE ? OR c.name LIKE ?)
       ORDER BY m.title`
    )
    .all(req.user!.firmId, `%${q}%`, `%${q}%`);
  res.json({ clients, matters });
});

mattersRouter.get("/", (req, res) => {
  const { status, clientId, responsibleUserId } = req.query as Record<string, string | undefined>;
  let sql = "SELECT m.*, c.name as client_name FROM matters m JOIN clients c ON c.id = m.client_id WHERE m.firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (status) {
    sql += " AND m.status = ?";
    params.push(status);
  }
  if (clientId) {
    sql += " AND m.client_id = ?";
    params.push(clientId);
  }
  if (responsibleUserId) {
    sql += " AND m.responsible_user_id = ?";
    params.push(responsibleUserId);
  }
  sql += " ORDER BY m.opened_at DESC";
  const rows = db.prepare<unknown[], MatterRow>(sql).all(...params);
  res.json({ matters: rows.map(toMatterDto) });
});

mattersRouter.get("/:id", (req, res) => {
  const row = db
    .prepare<[string, string], MatterRow>(
      "SELECT * FROM matters WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }

  const unbilledTime = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(amount_cents) as total FROM time_entries WHERE matter_id = ? AND invoice_id IS NULL AND billable = 1"
    )
    .get(req.params.id);
  const unbilledExpenses = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(amount_cents) as total FROM expenses WHERE matter_id = ? AND invoice_id IS NULL AND billable = 1"
    )
    .get(req.params.id);
  const client = db
    .prepare("SELECT id, name, type FROM clients WHERE id = ?")
    .get(row.client_id);

  res.json({
    matter: toMatterDto(row),
    client,
    unbilledCents: (unbilledTime?.total ?? 0) + (unbilledExpenses?.total ?? 0),
  });
});

const matterSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  practiceArea: z.string().nullable().optional(),
  status: z.enum(["open", "pending", "closed"]).default("open"),
  responsibleUserId: z.string().nullable().optional(),
  billingType: z.enum(["hourly", "flat", "contingency"]).default("hourly"),
  flatFeeAmountCents: z.number().int().nullable().optional(),
  defaultRateCents: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
});

mattersRouter.post("/", (req, res) => {
  const data = parseBody(matterSchema, req.body, res);
  if (!data) return;
  const client = db
    .prepare("SELECT id FROM clients WHERE id = ? AND firm_id = ?")
    .get(data.clientId, req.user!.firmId);
  if (!client) {
    res.status(400).json({ error: "Unknown clientId" });
    return;
  }
  const id = newId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO matters (id, firm_id, client_id, title, practice_area, status, responsible_user_id, billing_type, flat_fee_amount_cents, default_rate_cents, opened_at, closed_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.clientId,
    data.title,
    data.practiceArea ?? null,
    data.status,
    data.responsibleUserId ?? null,
    data.billingType,
    data.flatFeeAmountCents ?? null,
    data.defaultRateCents ?? null,
    now,
    data.notes ?? null
  );
  const row = db.prepare<[string], MatterRow>("SELECT * FROM matters WHERE id = ?").get(id)!;
  res.status(201).json({ matter: toMatterDto(row) });
});

mattersRouter.patch("/:id", (req, res) => {
  const data = parseBody(matterSchema.partial(), req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], MatterRow>(
      "SELECT * FROM matters WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  // Merge camelCase-onto-camelCase (both sides use the same key casing) so
  // every field's fallback to its previous value actually works - merging
  // the raw snake_case row with camelCase patch data silently drops updates
  // to any multi-word column.
  const merged = { ...toMatterDto(existing), ...data };
  const closedAt = merged.status === "closed" ? existing.closed_at ?? nowISO() : null;
  db.prepare(
    `UPDATE matters SET client_id=?, title=?, practice_area=?, status=?, responsible_user_id=?, billing_type=?, flat_fee_amount_cents=?, default_rate_cents=?, closed_at=?, notes=?
     WHERE id=?`
  ).run(
    merged.clientId,
    merged.title,
    merged.practiceArea ?? null,
    merged.status,
    merged.responsibleUserId ?? null,
    merged.billingType,
    merged.flatFeeAmountCents ?? null,
    merged.defaultRateCents ?? null,
    closedAt,
    merged.notes ?? null,
    req.params.id
  );
  const row = db.prepare<[string], MatterRow>("SELECT * FROM matters WHERE id = ?").get(req.params.id)!;
  res.json({ matter: toMatterDto(row) });
});
