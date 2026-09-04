import { Router } from "express";
import { z } from "zod";
import { assertSufficientTrustBalance } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

interface PaymentRow {
  id: string;
  firm_id: string;
  invoice_id: string | null;
  client_id: string;
  amount_cents: number;
  method: string;
  reference: string | null;
  paid_at: string;
  created_at: string;
}

function toDto(row: PaymentRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    invoiceId: row.invoice_id,
    clientId: row.client_id,
    amountCents: row.amount_cents,
    method: row.method,
    reference: row.reference,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

paymentsRouter.get("/", (req, res) => {
  const { invoiceId, clientId } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM payments WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (invoiceId) {
    sql += " AND invoice_id = ?";
    params.push(invoiceId);
  }
  if (clientId) {
    sql += " AND client_id = ?";
    params.push(clientId);
  }
  sql += " ORDER BY paid_at DESC";
  const rows = db.prepare<unknown[], PaymentRow>(sql).all(...params);
  res.json({ payments: rows.map(toDto) });
});

const createSchema = z.object({
  invoiceId: z.string().nullable().optional(),
  clientId: z.string().min(1),
  amountCents: z.number().int().positive(),
  method: z.enum(["check", "cash", "credit_card", "ach", "trust_transfer"]),
  reference: z.string().nullable().optional(),
  paidAt: z.string().optional(),
});

paymentsRouter.post("/", (req, res) => {
  const data = parseBody(createSchema, req.body, res);
  if (!data) return;

  const invoice = data.invoiceId
    ? db
        .prepare<[string, string], { id: string; status: string; total_cents: number; amount_paid_cents: number }>(
          "SELECT id, status, total_cents, amount_paid_cents FROM invoices WHERE id = ? AND firm_id = ?"
        )
        .get(data.invoiceId, req.user!.firmId) ?? null
    : null;
  if (data.invoiceId && !invoice) {
    res.status(400).json({ error: "Unknown invoiceId" });
    return;
  }
  if (invoice && (invoice.status === "draft" || invoice.status === "void")) {
    res.status(400).json({ error: `Cannot record a payment against a ${invoice.status} invoice` });
    return;
  }

  if (data.method === "trust_transfer") {
    if (!invoice) {
      res.status(400).json({ error: "A trust transfer must be applied to a specific invoice" });
      return;
    }
    const trustAccount = db
      .prepare<[string, string], { id: string; balance_cents: number }>(
        "SELECT id, balance_cents FROM trust_accounts WHERE client_id = ? AND firm_id = ? ORDER BY created_at LIMIT 1"
      )
      .get(data.clientId, req.user!.firmId);
    if (!trustAccount) {
      res.status(400).json({ error: "This client has no trust account on file" });
      return;
    }
    try {
      assertSufficientTrustBalance(trustAccount.balance_cents, data.amountCents);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
      return;
    }

    const applyTransfer = db.transaction(() => {
      const trustTxId = newId();
      db.prepare(
        `INSERT INTO trust_transactions (id, firm_id, trust_account_id, type, amount_cents, memo, related_invoice_id, performed_by_user_id, created_at)
         VALUES (?, ?, ?, 'transfer_to_invoice', ?, ?, ?, ?, ?)`
      ).run(
        trustTxId,
        req.user!.firmId,
        trustAccount.id,
        data.amountCents,
        `Applied to invoice ${data.invoiceId}`,
        data.invoiceId,
        req.user!.id,
        nowISO()
      );
      db.prepare("UPDATE trust_accounts SET balance_cents = balance_cents - ? WHERE id = ?").run(
        data.amountCents,
        trustAccount.id
      );
      return recordPaymentAndUpdateInvoice(data, invoice);
    });
    res.status(201).json({ payment: toDto(applyTransfer()) });
    return;
  }

  res.status(201).json({ payment: toDto(recordPaymentAndUpdateInvoice(data, invoice)) });

  function recordPaymentAndUpdateInvoice(
    input: z.infer<typeof createSchema>,
    inv: { id: string; total_cents: number; amount_paid_cents: number } | null
  ): PaymentRow {
    const id = newId();
    const now = nowISO();
    const paidAt = input.paidAt ?? now;
    db.prepare(
      `INSERT INTO payments (id, firm_id, invoice_id, client_id, amount_cents, method, reference, paid_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, req.user!.firmId, input.invoiceId ?? null, input.clientId, input.amountCents, input.method, input.reference ?? null, paidAt, now);

    if (inv) {
      const newPaid = inv.amount_paid_cents + input.amountCents;
      const newStatus = newPaid >= inv.total_cents ? "paid" : "partial";
      db.prepare("UPDATE invoices SET amount_paid_cents = ?, status = ? WHERE id = ?").run(
        newPaid,
        newStatus,
        inv.id
      );
    }

    return db.prepare<[string], PaymentRow>("SELECT * FROM payments WHERE id = ?").get(id)!;
  }
});
