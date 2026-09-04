import { Router } from "express";
import { computeAgingBucket, computeBalanceDueCents } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { today } from "../utils/ids.js";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.get("/dashboard-summary", (req, res) => {
  const firmId = req.user!.firmId;

  const openMattersCount = db
    .prepare<[string], { c: number }>("SELECT COUNT(*) as c FROM matters WHERE firm_id = ? AND status = 'open'")
    .get(firmId)!.c;

  const unbilledTime = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(amount_cents) as total FROM time_entries WHERE firm_id = ? AND invoice_id IS NULL AND billable = 1"
    )
    .get(firmId)!.total ?? 0;
  const unbilledExpenses = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(amount_cents) as total FROM expenses WHERE firm_id = ? AND invoice_id IS NULL AND billable = 1"
    )
    .get(firmId)!.total ?? 0;

  const outstandingArCents = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(total_cents - amount_paid_cents) as total FROM invoices WHERE firm_id = ? AND status IN ('sent','partial','overdue')"
    )
    .get(firmId)!.total ?? 0;

  const trustBalanceCents = db
    .prepare<[string], { total: number | null }>(
      "SELECT SUM(balance_cents) as total FROM trust_accounts WHERE firm_id = ?"
    )
    .get(firmId)!.total ?? 0;

  const todayEntriesSeconds = db
    .prepare<[string, string, string], { total: number | null }>(
      "SELECT SUM(duration_seconds) as total FROM time_entries WHERE firm_id = ? AND user_id = ? AND date = ?"
    )
    .get(firmId, req.user!.id, today())!.total ?? 0;

  const openTabs = db
    .prepare<[string, string], { status: string; accumulated_seconds: number; last_started_at: string | null }>(
      "SELECT status, accumulated_seconds, last_started_at FROM tabs WHERE firm_id = ? AND user_id = ?"
    )
    .all(firmId, req.user!.id);
  const openTabsSeconds = openTabs.reduce((sum, t) => {
    if (t.status === "running" && t.last_started_at) {
      return sum + t.accumulated_seconds + Math.max(0, Math.floor((Date.now() - new Date(t.last_started_at).getTime()) / 1000));
    }
    return sum + t.accumulated_seconds;
  }, 0);

  res.json({
    openMattersCount,
    unbilledCents: unbilledTime + unbilledExpenses,
    outstandingArCents,
    trustBalanceCents,
    todaySecondsTracked: todayEntriesSeconds + openTabsSeconds,
    openTabsCount: openTabs.length,
  });
});

reportsRouter.get("/billable-hours", (req, res) => {
  const { dateFrom, dateTo } = req.query as Record<string, string | undefined>;
  let sql = `
    SELECT u.id as user_id, u.name as user_name,
      SUM(CASE WHEN te.billable = 1 THEN te.duration_seconds ELSE 0 END) as billable_seconds,
      SUM(CASE WHEN te.billable = 0 THEN te.duration_seconds ELSE 0 END) as non_billable_seconds,
      SUM(CASE WHEN te.billable = 1 THEN te.amount_cents ELSE 0 END) as billed_amount_cents
    FROM time_entries te JOIN users u ON u.id = te.user_id
    WHERE te.firm_id = ?
  `;
  const params: unknown[] = [req.user!.firmId];
  if (dateFrom) {
    sql += " AND te.date >= ?";
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += " AND te.date <= ?";
    params.push(dateTo);
  }
  sql += " GROUP BY u.id, u.name ORDER BY u.name";
  const rows = db
    .prepare<unknown[], { user_id: string; user_name: string; billable_seconds: number; non_billable_seconds: number; billed_amount_cents: number }>(sql)
    .all(...params);
  res.json({
    rows: rows.map((r) => ({
      userId: r.user_id,
      userName: r.user_name,
      billableSeconds: r.billable_seconds,
      nonBillableSeconds: r.non_billable_seconds,
      billedAmountCents: r.billed_amount_cents,
    })),
  });
});

reportsRouter.get("/ar-aging", (req, res) => {
  const invoices = db
    .prepare<[string], { client_id: string; client_name: string; due_date: string; total_cents: number; amount_paid_cents: number }>(
      `SELECT i.client_id, c.name as client_name, i.due_date, i.total_cents, i.amount_paid_cents
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.firm_id = ? AND i.status IN ('sent','partial','overdue')`
    )
    .all(req.user!.firmId);

  const byClient = new Map<
    string,
    { clientId: string; clientName: string; current: number; d1_30: number; d31_60: number; d61_90: number; d90_plus: number; totalCents: number }
  >();

  for (const inv of invoices) {
    const balance = computeBalanceDueCents({ totalCents: inv.total_cents, amountPaidCents: inv.amount_paid_cents });
    if (balance <= 0) continue;
    const bucket = computeAgingBucket(inv.due_date);
    const row = byClient.get(inv.client_id) ?? {
      clientId: inv.client_id,
      clientName: inv.client_name,
      current: 0,
      d1_30: 0,
      d31_60: 0,
      d61_90: 0,
      d90_plus: 0,
      totalCents: 0,
    };
    if (bucket === "current") row.current += balance;
    else if (bucket === "1-30") row.d1_30 += balance;
    else if (bucket === "31-60") row.d31_60 += balance;
    else if (bucket === "61-90") row.d61_90 += balance;
    else row.d90_plus += balance;
    row.totalCents += balance;
    byClient.set(inv.client_id, row);
  }

  res.json({ rows: Array.from(byClient.values()).sort((a, b) => b.totalCents - a.totalCents) });
});

reportsRouter.get("/trust-liability", (req, res) => {
  const rows = db
    .prepare<[string], { client_id: string; client_name: string; matter_id: string | null; balance_cents: number }>(
      `SELECT ta.client_id, c.name as client_name, ta.matter_id, ta.balance_cents
       FROM trust_accounts ta JOIN clients c ON c.id = ta.client_id
       WHERE ta.firm_id = ? ORDER BY c.name`
    )
    .all(req.user!.firmId);
  res.json({
    rows: rows.map((r) => ({
      clientId: r.client_id,
      clientName: r.client_name,
      matterId: r.matter_id,
      balanceCents: r.balance_cents,
    })),
  });
});

reportsRouter.get("/revenue", (req, res) => {
  const { dateFrom, dateTo } = req.query as Record<string, string | undefined>;
  let sql = "SELECT strftime('%Y-%m', paid_at) as month, SUM(amount_cents) as total_cents FROM payments WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (dateFrom) {
    sql += " AND paid_at >= ?";
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += " AND paid_at <= ?";
    params.push(dateTo);
  }
  sql += " GROUP BY month ORDER BY month";
  const rows = db.prepare<unknown[], { month: string; total_cents: number }>(sql).all(...params);
  res.json({ rows: rows.map((r) => ({ month: r.month, totalCents: r.total_cents })) });
});
