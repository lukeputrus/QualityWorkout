import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { z } from "zod";
import { db, documentsDir } from "../db/index.js";
import { newId, nowISO, today } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const expensesRouter = Router();
expensesRouter.use(requireAuth);

const upload = multer({ dest: path.join(documentsDir, "receipts") });

interface ExpenseRow {
  id: string;
  firm_id: string;
  matter_id: string;
  user_id: string;
  description: string;
  date: string;
  amount_cents: number;
  billable: number;
  receipt_path: string | null;
  invoice_id: string | null;
  created_at: string;
}

function toDto(row: ExpenseRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    userId: row.user_id,
    description: row.description,
    date: row.date,
    amountCents: row.amount_cents,
    billable: !!row.billable,
    receiptPath: row.receipt_path,
    invoiceId: row.invoice_id,
    createdAt: row.created_at,
  };
}

expensesRouter.get("/", (req, res) => {
  const { matterId, unbilled } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM expenses WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (matterId) {
    sql += " AND matter_id = ?";
    params.push(matterId);
  }
  if (unbilled === "true") sql += " AND invoice_id IS NULL AND billable = 1";
  sql += " ORDER BY date DESC, created_at DESC";
  const rows = db.prepare<unknown[], ExpenseRow>(sql).all(...params);
  res.json({ expenses: rows.map(toDto) });
});

const createSchema = z.object({
  matterId: z.string().min(1),
  description: z.string().min(1),
  date: z.string().default(() => today()),
  amountCents: z.number().int().positive(),
  billable: z.boolean().default(true),
});

expensesRouter.post("/", (req, res) => {
  const data = parseBody(createSchema, req.body, res);
  if (!data) return;
  const matter = db
    .prepare("SELECT id FROM matters WHERE id = ? AND firm_id = ?")
    .get(data.matterId, req.user!.firmId);
  if (!matter) {
    res.status(400).json({ error: "Unknown matterId" });
    return;
  }
  const id = newId();
  db.prepare(
    `INSERT INTO expenses (id, firm_id, matter_id, user_id, description, date, amount_cents, billable, receipt_path, invoice_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.matterId,
    req.user!.id,
    data.description,
    data.date,
    data.amountCents,
    data.billable ? 1 : 0,
    nowISO()
  );
  res.status(201).json({ expense: toDto(db.prepare<[string], ExpenseRow>("SELECT * FROM expenses WHERE id = ?").get(id)!) });
});

const updateSchema = z.object({
  description: z.string().optional(),
  date: z.string().optional(),
  amountCents: z.number().int().positive().optional(),
  billable: z.boolean().optional(),
});

expensesRouter.patch("/:id", (req, res) => {
  const data = parseBody(updateSchema, req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], ExpenseRow>(
      "SELECT * FROM expenses WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (existing.invoice_id) {
    res.status(400).json({ error: "Cannot edit an expense that has already been invoiced" });
    return;
  }
  const merged = { ...toDto(existing), ...data };
  db.prepare(
    `UPDATE expenses SET description=?, date=?, amount_cents=?, billable=? WHERE id=?`
  ).run(merged.description, merged.date, merged.amountCents, merged.billable ? 1 : 0, req.params.id);
  res.json({ expense: toDto(db.prepare<[string], ExpenseRow>("SELECT * FROM expenses WHERE id = ?").get(req.params.id)!) });
});

expensesRouter.delete("/:id", (req, res) => {
  const existing = db
    .prepare<[string, string], ExpenseRow>(
      "SELECT * FROM expenses WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (existing.invoice_id) {
    res.status(400).json({ error: "Cannot delete an expense that has already been invoiced" });
    return;
  }
  db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

expensesRouter.post("/:id/receipt", upload.single("receipt"), (req, res) => {
  const existing = db
    .prepare<[string, string], ExpenseRow>(
      "SELECT * FROM expenses WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  db.prepare("UPDATE expenses SET receipt_path = ? WHERE id = ?").run(
    req.file.filename,
    req.params.id
  );
  res.status(201).json({ expense: toDto(db.prepare<[string], ExpenseRow>("SELECT * FROM expenses WHERE id = ?").get(req.params.id)!) });
});
