import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

interface ClientRow {
  id: string;
  firm_id: string;
  type: "individual" | "organization";
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

function toClientDto(row: ClientRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

clientsRouter.get("/", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const rows = q
    ? db
        .prepare<[string, string], ClientRow>(
          "SELECT * FROM clients WHERE firm_id = ? AND name LIKE ? ORDER BY name"
        )
        .all(req.user!.firmId, `%${q}%`)
    : db
        .prepare<[string], ClientRow>(
          "SELECT * FROM clients WHERE firm_id = ? ORDER BY name"
        )
        .all(req.user!.firmId);
  res.json({ clients: rows.map(toClientDto) });
});

clientsRouter.get("/:id", (req, res) => {
  const row = db
    .prepare<[string, string], ClientRow>(
      "SELECT * FROM clients WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!row) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({ client: toClientDto(row) });
});

const clientSchema = z.object({
  type: z.enum(["individual", "organization"]).default("individual"),
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

clientsRouter.post("/", (req, res) => {
  const data = parseBody(clientSchema, req.body, res);
  if (!data) return;
  const id = newId();
  const now = nowISO();
  db.prepare(
    `INSERT INTO clients (id, firm_id, type, name, email, phone, address, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.type,
    data.name,
    data.email ?? null,
    data.phone ?? null,
    data.address ?? null,
    data.notes ?? null,
    now
  );
  const row = db.prepare<[string], ClientRow>("SELECT * FROM clients WHERE id = ?").get(id)!;
  res.status(201).json({ client: toClientDto(row) });
});

clientsRouter.patch("/:id", (req, res) => {
  const data = parseBody(clientSchema.partial(), req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], ClientRow>(
      "SELECT * FROM clients WHERE id = ? AND firm_id = ?"
    )
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  const merged = { ...existing, ...data };
  db.prepare(
    `UPDATE clients SET type=?, name=?, email=?, phone=?, address=?, notes=? WHERE id=?`
  ).run(
    merged.type,
    merged.name,
    merged.email ?? null,
    merged.phone ?? null,
    merged.address ?? null,
    merged.notes ?? null,
    req.params.id
  );
  const row = db.prepare<[string], ClientRow>("SELECT * FROM clients WHERE id = ?").get(req.params.id)!;
  res.json({ client: toClientDto(row) });
});

clientsRouter.delete("/:id", (req, res) => {
  const matterCount = db
    .prepare<[string], { count: number }>(
      "SELECT COUNT(*) as count FROM matters WHERE client_id = ?"
    )
    .get(req.params.id)!.count;
  if (matterCount > 0) {
    res.status(400).json({ error: "Cannot delete a client with matters on file" });
    return;
  }
  db.prepare("DELETE FROM clients WHERE id = ? AND firm_id = ?").run(
    req.params.id,
    req.user!.firmId
  );
  res.status(204).end();
});
