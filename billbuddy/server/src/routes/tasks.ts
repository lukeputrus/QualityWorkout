import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

interface TaskRow {
  id: string;
  firm_id: string;
  matter_id: string | null;
  assigned_to_user_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: string;
  priority: string;
  created_at: string;
}

function toDto(row: TaskRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    assignedToUserId: row.assigned_to_user_id,
    title: row.title,
    description: row.description,
    dueAt: row.due_at,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

tasksRouter.get("/", (req, res) => {
  const { status, matterId, assignedToUserId } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM tasks WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (matterId) {
    sql += " AND matter_id = ?";
    params.push(matterId);
  }
  if (assignedToUserId) {
    sql += " AND assigned_to_user_id = ?";
    params.push(assignedToUserId);
  }
  sql += " ORDER BY (due_at IS NULL), due_at";
  const rows = db.prepare<unknown[], TaskRow>(sql).all(...params);
  res.json({ tasks: rows.map(toDto) });
});

const schema = z.object({
  matterId: z.string().nullable().optional(),
  assignedToUserId: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  status: z.enum(["open", "in_progress", "done"]).default("open"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

tasksRouter.post("/", (req, res) => {
  const data = parseBody(schema, req.body, res);
  if (!data) return;
  const id = newId();
  db.prepare(
    `INSERT INTO tasks (id, firm_id, matter_id, assigned_to_user_id, title, description, due_at, status, priority, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.matterId ?? null,
    data.assignedToUserId ?? null,
    data.title,
    data.description ?? null,
    data.dueAt ?? null,
    data.status,
    data.priority,
    nowISO()
  );
  res.status(201).json({ task: toDto(db.prepare<[string], TaskRow>("SELECT * FROM tasks WHERE id = ?").get(id)!) });
});

tasksRouter.patch("/:id", (req, res) => {
  const data = parseBody(schema.partial(), req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], TaskRow>("SELECT * FROM tasks WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const merged = { ...toDto(existing), ...data };
  db.prepare(
    `UPDATE tasks SET matter_id=?, assigned_to_user_id=?, title=?, description=?, due_at=?, status=?, priority=? WHERE id=?`
  ).run(
    merged.matterId ?? null,
    merged.assignedToUserId ?? null,
    merged.title,
    merged.description ?? null,
    merged.dueAt ?? null,
    merged.status,
    merged.priority,
    req.params.id
  );
  res.json({ task: toDto(db.prepare<[string], TaskRow>("SELECT * FROM tasks WHERE id = ?").get(req.params.id)!) });
});

tasksRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ? AND firm_id = ?").run(req.params.id, req.user!.firmId);
  res.status(204).end();
});
