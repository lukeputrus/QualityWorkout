import { Router } from "express";
import { z } from "zod";
import { computeTimeAmountCents, roundDurationSeconds } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { newId, nowISO, today } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

/** "Tabs" are the live, in-progress working sessions an attorney has open
 * across matters right now - the literal "tabs opened" concept from the
 * product brief, modeled like browser tabs: you can open several, switch
 * between them, pause ones you're not actively on, and close a tab to turn
 * its accumulated time into a permanent, billable time entry. */
export const tabsRouter = Router();
tabsRouter.use(requireAuth);

interface TabRow {
  id: string;
  firm_id: string;
  matter_id: string;
  user_id: string;
  description: string;
  status: "running" | "paused";
  accumulated_seconds: number;
  last_started_at: string | null;
  rate_override_cents: number | null;
  billable: number;
  created_at: string;
  updated_at: string;
  matter_title?: string;
  client_name?: string;
}

const TAB_SELECT = `
  SELECT t.*, m.title as matter_title, c.name as client_name
  FROM tabs t
  JOIN matters m ON m.id = t.matter_id
  JOIN clients c ON c.id = m.client_id
`;

function liveElapsedSeconds(row: TabRow): number {
  if (row.status !== "running" || !row.last_started_at) {
    return row.accumulated_seconds;
  }
  const runningSeconds = Math.floor(
    (Date.now() - new Date(row.last_started_at).getTime()) / 1000
  );
  return row.accumulated_seconds + Math.max(0, runningSeconds);
}

function toTabDto(row: TabRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    userId: row.user_id,
    description: row.description,
    status: row.status,
    accumulatedSeconds: row.accumulated_seconds,
    lastStartedAt: row.last_started_at,
    rateOverrideCents: row.rate_override_cents,
    billable: !!row.billable,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    liveElapsedSeconds: liveElapsedSeconds(row),
    matterTitle: row.matter_title ?? null,
    clientName: row.client_name ?? null,
  };
}

function getOwnedTab(id: string, req: import("express").Request): TabRow | undefined {
  return db
    .prepare<[string, string], TabRow>(`${TAB_SELECT} WHERE t.id = ? AND t.firm_id = ?`)
    .get(id, req.user!.firmId);
}

tabsRouter.get("/", (req, res) => {
  const mine = req.query.all === "true" ? null : req.user!.id;
  const rows = mine
    ? db
        .prepare<[string, string], TabRow>(`${TAB_SELECT} WHERE t.firm_id = ? AND t.user_id = ? ORDER BY t.updated_at DESC`)
        .all(req.user!.firmId, mine)
    : db
        .prepare<[string], TabRow>(`${TAB_SELECT} WHERE t.firm_id = ? ORDER BY t.updated_at DESC`)
        .all(req.user!.firmId);
  res.json({ tabs: rows.map(toTabDto) });
});

const createTabSchema = z.object({
  matterId: z.string().min(1),
  description: z.string().default(""),
  billable: z.boolean().default(true),
  rateOverrideCents: z.number().int().nullable().optional(),
});

tabsRouter.post("/", (req, res) => {
  const data = parseBody(createTabSchema, req.body, res);
  if (!data) return;
  const matter = db
    .prepare("SELECT id FROM matters WHERE id = ? AND firm_id = ?")
    .get(data.matterId, req.user!.firmId);
  if (!matter) {
    res.status(400).json({ error: "Unknown matterId" });
    return;
  }
  const id = newId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO tabs (id, firm_id, matter_id, user_id, description, status, accumulated_seconds, last_started_at, rate_override_cents, billable, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'running', 0, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.matterId,
    req.user!.id,
    data.description,
    now,
    data.rateOverrideCents ?? null,
    data.billable ? 1 : 0,
    now,
    now
  );
  const row = getOwnedTab(id, req)!;
  res.status(201).json({ tab: toTabDto(row) });
});

const updateTabSchema = z.object({
  description: z.string().optional(),
  billable: z.boolean().optional(),
  rateOverrideCents: z.number().int().nullable().optional(),
});

tabsRouter.patch("/:id", (req, res) => {
  const data = parseBody(updateTabSchema, req.body, res);
  if (!data) return;
  const existing = getOwnedTab(req.params.id, req);
  if (!existing) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }
  const merged = { ...toTabDto(existing), ...data };
  db.prepare(
    `UPDATE tabs SET description=?, billable=?, rate_override_cents=?, updated_at=? WHERE id=?`
  ).run(
    merged.description,
    merged.billable ? 1 : 0,
    merged.rateOverrideCents ?? null,
    nowISO(),
    req.params.id
  );
  res.json({ tab: toTabDto(getOwnedTab(req.params.id, req)!) });
});

tabsRouter.post("/:id/pause", (req, res) => {
  const existing = getOwnedTab(req.params.id, req);
  if (!existing) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }
  if (existing.status === "paused") {
    res.json({ tab: toTabDto(existing) });
    return;
  }
  const accumulated = liveElapsedSeconds(existing);
  db.prepare(
    `UPDATE tabs SET status='paused', accumulated_seconds=?, last_started_at=NULL, updated_at=? WHERE id=?`
  ).run(accumulated, nowISO(), req.params.id);
  res.json({ tab: toTabDto(getOwnedTab(req.params.id, req)!) });
});

tabsRouter.post("/:id/resume", (req, res) => {
  const existing = getOwnedTab(req.params.id, req);
  if (!existing) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }
  if (existing.status === "running") {
    res.json({ tab: toTabDto(existing) });
    return;
  }
  const now = nowISO();
  db.prepare(
    `UPDATE tabs SET status='running', last_started_at=?, updated_at=? WHERE id=?`
  ).run(now, now, req.params.id);
  res.json({ tab: toTabDto(getOwnedTab(req.params.id, req)!) });
});

tabsRouter.delete("/:id", (req, res) => {
  const existing = getOwnedTab(req.params.id, req);
  if (!existing) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }
  db.prepare("DELETE FROM tabs WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

/** Closes a tab and converts its accumulated time into a permanent,
 * billable time entry - the moment untracked "working time" becomes
 * ledgered "billing time". */
tabsRouter.post("/:id/close", (req, res) => {
  const existing = getOwnedTab(req.params.id, req);
  if (!existing) {
    res.status(404).json({ error: "Tab not found" });
    return;
  }

  const matter = db
    .prepare<[string], { default_rate_cents: number | null }>(
      "SELECT default_rate_cents FROM matters WHERE id = ?"
    )
    .get(existing.matter_id);
  const user = db
    .prepare<[string], { default_hourly_rate_cents: number }>(
      "SELECT default_hourly_rate_cents FROM users WHERE id = ?"
    )
    .get(existing.user_id);

  const rateCents =
    existing.rate_override_cents ??
    matter?.default_rate_cents ??
    user?.default_hourly_rate_cents ??
    0;

  // Store the rounded (billable) duration, not the raw stopwatch time - the
  // amount charged reflects rounding, so the entry's duration must too, or
  // an invoice can show "$45.00" next to "0 hours" for a two-second tab.
  const durationSeconds = roundDurationSeconds(liveElapsedSeconds(existing));
  const amountCents = computeTimeAmountCents(durationSeconds, rateCents);

  const timeEntryId = newId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO time_entries (id, firm_id, matter_id, user_id, description, date, duration_seconds, rate_cents, amount_cents, billable, source, invoice_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'tab', NULL, ?)`
  ).run(
    timeEntryId,
    req.user!.firmId,
    existing.matter_id,
    existing.user_id,
    existing.description || "(no description)",
    today(),
    durationSeconds,
    rateCents,
    amountCents,
    existing.billable ? 1 : 0,
    now
  );
  db.prepare("DELETE FROM tabs WHERE id = ?").run(req.params.id);

  const timeEntry = db
    .prepare("SELECT * FROM time_entries WHERE id = ?")
    .get(timeEntryId);
  res.status(201).json({ timeEntry });
});
