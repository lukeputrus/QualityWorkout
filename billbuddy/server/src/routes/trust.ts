import { Router } from "express";
import { z } from "zod";
import { applyTrustTransaction, InsufficientTrustBalanceError } from "@billbuddy/shared";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

/** Client trust (IOLTA) ledgers. The one rule that overrides everything
 * else in this file: a single client's ledger must never go negative, even
 * if the pooled trust bank account holds funds belonging to other clients.
 * Every balance change is funneled through shared.applyTrustTransaction so
 * that rule is enforced in exactly one place. */
export const trustRouter = Router();
trustRouter.use(requireAuth);

interface TrustAccountRow {
  id: string;
  firm_id: string;
  client_id: string;
  matter_id: string | null;
  balance_cents: number;
  created_at: string;
}

interface TrustTransactionRow {
  id: string;
  firm_id: string;
  trust_account_id: string;
  type: string;
  amount_cents: number;
  memo: string | null;
  related_invoice_id: string | null;
  performed_by_user_id: string;
  created_at: string;
}

function toAccountDto(row: TrustAccountRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    clientId: row.client_id,
    matterId: row.matter_id,
    balanceCents: row.balance_cents,
    createdAt: row.created_at,
  };
}

function toTxDto(row: TrustTransactionRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    trustAccountId: row.trust_account_id,
    type: row.type,
    amountCents: row.amount_cents,
    memo: row.memo,
    relatedInvoiceId: row.related_invoice_id,
    performedByUserId: row.performed_by_user_id,
    createdAt: row.created_at,
  };
}

trustRouter.get("/accounts", (req, res) => {
  const { clientId } = req.query as Record<string, string | undefined>;
  const rows = clientId
    ? db
        .prepare<[string, string], TrustAccountRow>(
          "SELECT * FROM trust_accounts WHERE firm_id = ? AND client_id = ?"
        )
        .all(req.user!.firmId, clientId)
    : db
        .prepare<[string], TrustAccountRow>(
          "SELECT * FROM trust_accounts WHERE firm_id = ? ORDER BY created_at DESC"
        )
        .all(req.user!.firmId);
  res.json({ trustAccounts: rows.map(toAccountDto) });
});

const createAccountSchema = z.object({
  clientId: z.string().min(1),
  matterId: z.string().nullable().optional(),
});

trustRouter.post("/accounts", (req, res) => {
  const data = parseBody(createAccountSchema, req.body, res);
  if (!data) return;
  const id = newId();
  db.prepare(
    `INSERT INTO trust_accounts (id, firm_id, client_id, matter_id, balance_cents, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`
  ).run(id, req.user!.firmId, data.clientId, data.matterId ?? null, nowISO());
  const row = db.prepare<[string], TrustAccountRow>("SELECT * FROM trust_accounts WHERE id = ?").get(id)!;
  res.status(201).json({ trustAccount: toAccountDto(row) });
});

trustRouter.get("/accounts/:id/transactions", (req, res) => {
  const account = db
    .prepare<[string, string], TrustAccountRow>(
      "SELECT * FROM trust_accounts WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!account) {
    res.status(404).json({ error: "Trust account not found" });
    return;
  }
  const rows = db
    .prepare<[string], TrustTransactionRow>(
      "SELECT * FROM trust_transactions WHERE trust_account_id = ? ORDER BY created_at DESC"
    )
    .all(req.params.id);
  res.json({ trustAccount: toAccountDto(account), transactions: rows.map(toTxDto) });
});

const txSchema = z.object({
  amountCents: z.number().int().positive(),
  memo: z.string().nullable().optional(),
});

type TrustTxResult =
  | { error: string; status: 404 | 400 }
  | { account: ReturnType<typeof toAccountDto>; transaction: ReturnType<typeof toTxDto> };

function performTrustTransaction(
  accountId: string,
  firmId: string,
  performedByUserId: string,
  type: "deposit" | "withdrawal",
  amountCents: number,
  memo: string | null
): TrustTxResult {
  const account = db
    .prepare<[string, string], TrustAccountRow>(
      "SELECT * FROM trust_accounts WHERE id = ? AND firm_id = ?"
    )
    .get(accountId, firmId);
  if (!account) return { error: "Trust account not found", status: 404 as const };

  let newBalance: number;
  try {
    newBalance = applyTrustTransaction(account.balance_cents, type, amountCents);
  } catch (err) {
    if (err instanceof InsufficientTrustBalanceError) {
      return { error: err.message, status: 400 as const };
    }
    throw err;
  }

  const run = db.transaction(() => {
    const id = newId();
    db.prepare(
      `INSERT INTO trust_transactions (id, firm_id, trust_account_id, type, amount_cents, memo, related_invoice_id, performed_by_user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`
    ).run(id, firmId, accountId, type, amountCents, memo, performedByUserId, nowISO());
    db.prepare("UPDATE trust_accounts SET balance_cents = ? WHERE id = ?").run(newBalance, accountId);
    return id;
  });
  const txId = run();

  return {
    account: toAccountDto({ ...account, balance_cents: newBalance }),
    transaction: toTxDto(
      db.prepare<[string], TrustTransactionRow>("SELECT * FROM trust_transactions WHERE id = ?").get(txId)!
    ),
  };
}

trustRouter.post("/accounts/:id/deposit", (req, res) => {
  const data = parseBody(txSchema, req.body, res);
  if (!data) return;
  const result = performTrustTransaction(
    req.params.id,
    req.user!.firmId,
    req.user!.id,
    "deposit",
    data.amountCents,
    data.memo ?? null
  );
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
});

trustRouter.post("/accounts/:id/withdraw", (req, res) => {
  const data = parseBody(txSchema, req.body, res);
  if (!data) return;
  const result = performTrustTransaction(
    req.params.id,
    req.user!.firmId,
    req.user!.id,
    "withdrawal",
    data.amountCents,
    data.memo ?? null
  );
  if ("error" in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
});

/** Three-way reconciliation: the sum of every client's trust ledger should
 * always equal the firm's actual pooled trust bank balance. The bank
 * balance is whatever the firm last typed in from their bank statement -
 * BillBuddy has no live bank feed, so this is a manual check, same as the
 * paper worksheet it replaces. */
trustRouter.get("/reconciliation", (req, res) => {
  const bankBalanceCents = Number(req.query.bankBalanceCents ?? 0);
  const rows = db
    .prepare<[string], { client_id: string; client_name: string; matter_id: string | null; balance_cents: number }>(
      `SELECT ta.client_id, c.name as client_name, ta.matter_id, ta.balance_cents
       FROM trust_accounts ta JOIN clients c ON c.id = ta.client_id
       WHERE ta.firm_id = ? ORDER BY c.name`
    )
    .all(req.user!.firmId);
  const ledgerTotalCents = rows.reduce((sum, r) => sum + r.balance_cents, 0);
  res.json({
    bankBalanceCents,
    ledgerTotalCents,
    differenceCents: bankBalanceCents - ledgerTotalCents,
    balanced: bankBalanceCents === ledgerTotalCents,
    accounts: rows.map((r) => ({
      clientId: r.client_id,
      clientName: r.client_name,
      matterId: r.matter_id,
      balanceCents: r.balance_cents,
    })),
  });
});
