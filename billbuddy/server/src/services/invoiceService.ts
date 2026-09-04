import { computeInvoiceTotals, nextInvoiceNumber, secondsToHours } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { newId, nowISO, today, addDaysISO } from "../utils/ids.js";

export class NoUnbilledItemsError extends Error {
  constructor() {
    super("There is no unbilled, billable time or expenses for this client");
    this.name = "NoUnbilledItemsError";
  }
}

interface UnbilledTimeRow {
  id: string;
  matter_id: string;
  matter_title: string;
  description: string;
  duration_seconds: number;
  rate_cents: number;
  amount_cents: number;
}

interface UnbilledExpenseRow {
  id: string;
  matter_id: string;
  matter_title: string;
  description: string;
  amount_cents: number;
}

/** Pulls every unbilled, billable time entry and expense for a client
 * (optionally scoped to specific matters), turns each into an invoice line
 * item, and marks the source records as invoiced - all inside one
 * transaction so a crash mid-generation can never leave time "half billed".
 */
export function generateInvoiceForClient(
  firmId: string,
  clientId: string,
  matterIds: string[] | undefined,
  paymentTermDays = 30
) {
  const run = db.transaction(() => {
    const matterFilter = matterIds && matterIds.length > 0;
    const matterPlaceholders = matterFilter ? matterIds!.map(() => "?").join(",") : "";

    const timeSql = `
      SELECT te.id, te.matter_id, m.title as matter_title, te.description, te.duration_seconds, te.rate_cents, te.amount_cents
      FROM time_entries te
      JOIN matters m ON m.id = te.matter_id
      WHERE m.client_id = ? AND te.firm_id = ? AND te.invoice_id IS NULL AND te.billable = 1
      ${matterFilter ? `AND te.matter_id IN (${matterPlaceholders})` : ""}
    `;
    const expenseSql = `
      SELECT e.id, e.matter_id, m.title as matter_title, e.description, e.amount_cents
      FROM expenses e
      JOIN matters m ON m.id = e.matter_id
      WHERE m.client_id = ? AND e.firm_id = ? AND e.invoice_id IS NULL AND e.billable = 1
      ${matterFilter ? `AND e.matter_id IN (${matterPlaceholders})` : ""}
    `;
    const params = matterFilter ? [clientId, firmId, ...matterIds!] : [clientId, firmId];

    const timeRows = db.prepare<unknown[], UnbilledTimeRow>(timeSql).all(...params);
    const expenseRows = db.prepare<unknown[], UnbilledExpenseRow>(expenseSql).all(...params);

    if (timeRows.length === 0 && expenseRows.length === 0) {
      throw new NoUnbilledItemsError();
    }

    const firm = db
      .prepare<[string], { invoice_sequence: number; tax_rate_percent: number }>(
        "SELECT invoice_sequence, tax_rate_percent FROM firms WHERE id = ?"
      )
      .get(firmId)!;
    const invoiceNumber = nextInvoiceNumber(firm.invoice_sequence);
    db.prepare("UPDATE firms SET invoice_sequence = invoice_sequence + 1 WHERE id = ?").run(firmId);

    const invoiceId = newId();
    const issueDate = today();
    const dueDate = addDaysISO(issueDate, paymentTermDays);
    const now = nowISO();

    const lineItems = [
      ...timeRows.map((t) => ({
        id: newId(),
        type: "time" as const,
        timeEntryId: t.id,
        expenseId: null as string | null,
        description: `${t.matter_title} - ${t.description}`,
        quantity: Number(secondsToHours(t.duration_seconds).toFixed(2)),
        rateCents: t.rate_cents,
        amountCents: t.amount_cents,
      })),
      ...expenseRows.map((e) => ({
        id: newId(),
        type: "expense" as const,
        timeEntryId: null as string | null,
        expenseId: e.id,
        description: `${e.matter_title} - ${e.description}`,
        quantity: 1,
        rateCents: e.amount_cents,
        amountCents: e.amount_cents,
      })),
    ];

    const totals = computeInvoiceTotals(lineItems, firm.tax_rate_percent);

    db.prepare(
      `INSERT INTO invoices (id, firm_id, client_id, invoice_number, issue_date, due_date, status, subtotal_cents, tax_cents, total_cents, amount_paid_cents, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, 0, NULL, ?)`
    ).run(
      invoiceId,
      firmId,
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      totals.subtotalCents,
      totals.taxCents,
      totals.totalCents,
      now
    );

    const insertLineItem = db.prepare(
      `INSERT INTO invoice_line_items (id, invoice_id, type, time_entry_id, expense_id, description, quantity, rate_cents, amount_cents)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const li of lineItems) {
      insertLineItem.run(
        li.id,
        invoiceId,
        li.type,
        li.timeEntryId,
        li.expenseId,
        li.description,
        li.quantity,
        li.rateCents,
        li.amountCents
      );
    }

    const markTimeInvoiced = db.prepare("UPDATE time_entries SET invoice_id = ? WHERE id = ?");
    for (const t of timeRows) markTimeInvoiced.run(invoiceId, t.id);
    const markExpenseInvoiced = db.prepare("UPDATE expenses SET invoice_id = ? WHERE id = ?");
    for (const e of expenseRows) markExpenseInvoiced.run(invoiceId, e.id);

    return invoiceId;
  });

  return run();
}

/** Recomputes and persists an invoice's totals from its current line items,
 * e.g. after a custom line item is added or removed from a draft. */
export function recalculateInvoiceTotals(invoiceId: string) {
  const invoice = db
    .prepare<[string], { firm_id: string }>("SELECT firm_id FROM invoices WHERE id = ?")
    .get(invoiceId);
  if (!invoice) return;
  const firm = db
    .prepare<[string], { tax_rate_percent: number }>(
      "SELECT tax_rate_percent FROM firms WHERE id = ?"
    )
    .get(invoice.firm_id)!;
  const lineItems = db
    .prepare<[string], { amount_cents: number }>(
      "SELECT amount_cents FROM invoice_line_items WHERE invoice_id = ?"
    )
    .all(invoiceId);
  const totals = computeInvoiceTotals(
    lineItems.map((li) => ({ amountCents: li.amount_cents })),
    firm.tax_rate_percent
  );
  db.prepare(
    "UPDATE invoices SET subtotal_cents=?, tax_cents=?, total_cents=? WHERE id=?"
  ).run(totals.subtotalCents, totals.taxCents, totals.totalCents, invoiceId);
}
