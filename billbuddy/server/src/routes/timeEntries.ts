import { Router } from "express";
import { z } from "zod";
import { computeTimeAmountCents, roundDurationSeconds } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { newId, nowISO, today } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const timeEntriesRouter = Router();
timeEntriesRouter.use(requireAuth);

interface TimeEntryRow {
  id: string;
  firm_id: string;
  matter_id: string;
  user_id: string;
  description: string;
  date: string;
  duration_seconds: number;
  rate_cents: number;
  amount_cents: number;
  billable: number;
  source: "tab" | "manual";
  invoice_id: string | null;
  created_at: string;
}

function toDto(row: TimeEntryRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    userId: row.user_id,
    description: row.description,
    date: row.date,
    durationSeconds: row.duration_seconds,
    rateCents: row.rate_cents,
    amountCents: row.amount_cents,
    billable: !!row.billable,
    source: row.source,
    invoiceId: row.invoice_id,
    createdAt: row.created_at,
  };
}

timeEntriesRouter.get("/", (req, res) => {
  const { matterId, userId, unbilled, dateFrom, dateTo } = req.query as Record<
    string,
    string | undefined
  >;
  let sql = "SELECT * FROM time_entries WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (matterId) {
    sql += " AND matter_id = ?";
    params.push(matterId);
  }
  if (userId) {
    sql += " AND user_id = ?";
    params.push(userId);
  }
  if (unbilled === "true") sql += " AND invoice_id IS NULL AND billable = 1";
  if (dateFrom) {
    sql += " AND date >= ?";
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += " AND date <= ?";
    params.push(dateTo);
  }
  sql += " ORDER BY date DESC, created_at DESC";
  const rows = db.prepare<unknown[], TimeEntryRow>(sql).all(...params);
  res.json({ timeEntries: rows.map(toDto) });
});

const createSchema = z.object({
  matterId: z.string().min(1),
  description: z.string().default(""),
  date: z.string().default(() => today()),
  durationSeconds: z.number().int().positive(),
  rateCents: z.number().int().nonnegative().optional(),
  billable: z.boolean().default(true),
});

timeEntriesRouter.post("/", (req, res) => {
  const data = parseBody(createSchema, req.body, res);
  if (!data) return;

  const matter = db
    .prepare<[string, string], { default_rate_cents: number | null }>(
      "SELECT default_rate_cents FROM matters WHERE id = ? AND firm_id = ?"
    )
    .get(data.matterId, req.user!.firmId);
  if (!matter) {
    res.status(400).json({ error: "Unknown matterId" });
    return;
  }

  const rateCents = data.rateCents ?? matter.default_rate_cents ?? req.user!.defaultHourlyRateCents;
  // Round first so the stored duration always matches what was actually
  // billed (computeTimeAmountCents rounds internally for the amount, but
  // won't rewrite the duration you pass it).
  const durationSeconds = roundDurationSeconds(data.durationSeconds);
  const amountCents = computeTimeAmountCents(durationSeconds, rateCents);
  const id = newId();
  db.prepare(
    `INSERT INTO time_entries (id, firm_id, matter_id, user_id, description, date, duration_seconds, rate_cents, amount_cents, billable, source, invoice_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', NULL, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.matterId,
    req.user!.id,
    data.description,
    data.date,
    durationSeconds,
    rateCents,
    amountCents,
    data.billable ? 1 : 0,
    nowISO()
  );
  res.status(201).json({ timeEntry: toDto(db.prepare<[string], TimeEntryRow>("SELECT * FROM time_entries WHERE id = ?").get(id)!) });
});

const updateSchema = z.object({
  description: z.string().optional(),
  date: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  rateCents: z.number().int().nonnegative().optional(),
  billable: z.boolean().optional(),
});

timeEntriesRouter.patch("/:id", (req, res) => {
  const data = parseBody(updateSchema, req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], TimeEntryRow>(
      "SELECT * FROM time_entries WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Time entry not found" });
    return;
  }
  if (existing.invoice_id) {
    res.status(400).json({ error: "Cannot edit a time entry that has already been invoiced" });
    return;
  }
  const merged = { ...toDto(existing), ...data };
  const durationSeconds = roundDurationSeconds(merged.durationSeconds);
  const amountCents = computeTimeAmountCents(durationSeconds, merged.rateCents);
  db.prepare(
    `UPDATE time_entries SET description=?, date=?, duration_seconds=?, rate_cents=?, amount_cents=?, billable=? WHERE id=?`
  ).run(
    merged.description,
    merged.date,
    durationSeconds,
    merged.rateCents,
    amountCents,
    merged.billable ? 1 : 0,
    req.params.id
  );
  res.json({ timeEntry: toDto(db.prepare<[string], TimeEntryRow>("SELECT * FROM time_entries WHERE id = ?").get(req.params.id)!) });
});

timeEntriesRouter.delete("/:id", (req, res) => {
  const existing = db
    .prepare<[string, string], TimeEntryRow>(
      "SELECT * FROM time_entries WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Time entry not found" });
    return;
  }
  if (existing.invoice_id) {
    res.status(400).json({ error: "Cannot delete a time entry that has already been invoiced" });
    return;
  }
  db.prepare("DELETE FROM time_entries WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
