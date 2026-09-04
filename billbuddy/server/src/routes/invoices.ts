import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { generateInvoiceForClient, NoUnbilledItemsError, recalculateInvoiceTotals } from "../services/invoiceService.js";
import { streamInvoicePdf } from "../services/pdfService.js";

export const invoicesRouter = Router();
invoicesRouter.use(requireAuth);

interface InvoiceRow {
  id: string;
  firm_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  notes: string | null;
  created_at: string;
}

interface LineItemRow {
  id: string;
  invoice_id: string;
  type: string;
  time_entry_id: string | null;
  expense_id: string | null;
  description: string;
  quantity: number;
  rate_cents: number;
  amount_cents: number;
}

function toInvoiceDto(row: InvoiceRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    clientId: row.client_id,
    invoiceNumber: row.invoice_number,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    status: row.status,
    subtotalCents: row.subtotal_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    amountPaidCents: row.amount_paid_cents,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toLineItemDto(row: LineItemRow) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    type: row.type,
    timeEntryId: row.time_entry_id,
    expenseId: row.expense_id,
    description: row.description,
    quantity: row.quantity,
    rateCents: row.rate_cents,
    amountCents: row.amount_cents,
  };
}

function refreshOverdueStatus(row: InvoiceRow): InvoiceRow {
  if (
    row.status === "sent" &&
    row.amount_paid_cents < row.total_cents &&
    new Date(row.due_date).getTime() < Date.now()
  ) {
    db.prepare("UPDATE invoices SET status = 'overdue' WHERE id = ?").run(row.id);
    return { ...row, status: "overdue" };
  }
  return row;
}

invoicesRouter.get("/", (req, res) => {
  const { status, clientId } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM invoices WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (clientId) {
    sql += " AND client_id = ?";
    params.push(clientId);
  }
  sql += " ORDER BY issue_date DESC, created_at DESC";
  const rows = db.prepare<unknown[], InvoiceRow>(sql).all(...params).map(refreshOverdueStatus);
  res.json({ invoices: rows.map(toInvoiceDto) });
});

invoicesRouter.get("/:id", (req, res) => {
  const row = db
    .prepare<[string, string], InvoiceRow>(
      "SELECT * FROM invoices WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  const refreshed = refreshOverdueStatus(row);
  const lineItems = db
    .prepare<[string], LineItemRow>("SELECT * FROM invoice_line_items WHERE invoice_id = ?")
    .all(req.params.id);
  const client = db.prepare("SELECT id, name, email, address FROM clients WHERE id = ?").get(row.client_id);
  res.json({ invoice: { ...toInvoiceDto(refreshed), lineItems: lineItems.map(toLineItemDto) }, client });
});

const generateSchema = z.object({
  clientId: z.string().min(1),
  matterIds: z.array(z.string()).optional(),
});

invoicesRouter.post("/generate", (req, res) => {
  const data = parseBody(generateSchema, req.body, res);
  if (!data) return;
  try {
    const invoiceId = generateInvoiceForClient(req.user!.firmId, data.clientId, data.matterIds);
    const row = db.prepare<[string], InvoiceRow>("SELECT * FROM invoices WHERE id = ?").get(invoiceId)!;
    const lineItems = db
      .prepare<[string], LineItemRow>("SELECT * FROM invoice_line_items WHERE invoice_id = ?")
      .all(invoiceId);
    res.status(201).json({ invoice: { ...toInvoiceDto(row), lineItems: lineItems.map(toLineItemDto) } });
  } catch (err) {
    if (err instanceof NoUnbilledItemsError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

invoicesRouter.post("/:id/send", (req, res) => {
  const row = db
    .prepare<[string, string], InvoiceRow>("SELECT * FROM invoices WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  if (row.status !== "draft") {
    res.status(400).json({ error: "Only draft invoices can be sent" });
    return;
  }
  db.prepare("UPDATE invoices SET status = 'sent' WHERE id = ?").run(req.params.id);
  res.json({ invoice: toInvoiceDto({ ...row, status: "sent" }) });
});

invoicesRouter.post("/:id/void", (req, res) => {
  const row = db
    .prepare<[string, string], InvoiceRow>("SELECT * FROM invoices WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  if (row.amount_paid_cents > 0) {
    res.status(400).json({ error: "Cannot void an invoice that has payments applied" });
    return;
  }
  db.prepare("UPDATE invoices SET status = 'void' WHERE id = ?").run(req.params.id);
  // Free up the underlying time/expenses so they can be re-billed.
  db.prepare("UPDATE time_entries SET invoice_id = NULL WHERE invoice_id = ?").run(req.params.id);
  db.prepare("UPDATE expenses SET invoice_id = NULL WHERE invoice_id = ?").run(req.params.id);
  res.json({ invoice: toInvoiceDto({ ...row, status: "void" }) });
});

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  rateCents: z.number().int(),
  type: z.enum(["flat", "custom"]).default("custom"),
});

invoicesRouter.post("/:id/line-items", (req, res) => {
  const data = parseBody(lineItemSchema, req.body, res);
  if (!data) return;
  const invoice = db
    .prepare<[string, string], InvoiceRow>("SELECT * FROM invoices WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  if (invoice.status !== "draft") {
    res.status(400).json({ error: "Only draft invoices can be edited" });
    return;
  }
  const id = newId();
  const amountCents = Math.round(data.quantity * data.rateCents);
  db.prepare(
    `INSERT INTO invoice_line_items (id, invoice_id, type, time_entry_id, expense_id, description, quantity, rate_cents, amount_cents)
     VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?)`
  ).run(id, req.params.id, data.type, data.description, data.quantity, data.rateCents, amountCents);
  recalculateInvoiceTotals(req.params.id);
  const updated = db.prepare<[string], InvoiceRow>("SELECT * FROM invoices WHERE id = ?").get(req.params.id)!;
  res.status(201).json({ invoice: toInvoiceDto(updated) });
});

invoicesRouter.delete("/:id/line-items/:lineItemId", (req, res) => {
  const invoice = db
    .prepare<[string, string], InvoiceRow>("SELECT * FROM invoices WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  if (invoice.status !== "draft") {
    res.status(400).json({ error: "Only draft invoices can be edited" });
    return;
  }
  const lineItem = db
    .prepare<[string, string], LineItemRow>(
      "SELECT * FROM invoice_line_items WHERE id = ? AND invoice_id = ?"
    )
    .get(req.params.lineItemId, req.params.id);
  if (!lineItem) {
    res.status(404).json({ error: "Line item not found" });
    return;
  }
  if (lineItem.time_entry_id) db.prepare("UPDATE time_entries SET invoice_id = NULL WHERE id = ?").run(lineItem.time_entry_id);
  if (lineItem.expense_id) db.prepare("UPDATE expenses SET invoice_id = NULL WHERE id = ?").run(lineItem.expense_id);
  db.prepare("DELETE FROM invoice_line_items WHERE id = ?").run(req.params.lineItemId);
  recalculateInvoiceTotals(req.params.id);
  const updated = db.prepare<[string], InvoiceRow>("SELECT * FROM invoices WHERE id = ?").get(req.params.id)!;
  res.json({ invoice: toInvoiceDto(updated) });
});

invoicesRouter.get("/:id/pdf", (req, res) => {
  const row = db
    .prepare<[string, string], InvoiceRow>("SELECT * FROM invoices WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  const lineItems = db
    .prepare<[string], LineItemRow>("SELECT * FROM invoice_line_items WHERE invoice_id = ?")
    .all(req.params.id);
  const client = db
    .prepare<[string], { name: string; email: string | null; address: string | null }>(
      "SELECT name, email, address FROM clients WHERE id = ?"
    )
    .get(row.client_id)!;
  const firm = db
    .prepare<[string], { name: string; address: string | null; email: string | null; phone: string | null }>(
      "SELECT name, address, email, phone FROM firms WHERE id = ?"
    )
    .get(req.user!.firmId)!;

  streamInvoicePdf(res, {
    firm,
    client,
    invoice: toInvoiceDto(row),
    lineItems: lineItems.map(toLineItemDto),
  });
});
