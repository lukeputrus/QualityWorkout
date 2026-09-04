import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { newId, nowISO } from "../utils/ids.js";
import { parseBody } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

export const calendarEventsRouter = Router();
calendarEventsRouter.use(requireAuth);

interface EventRow {
  id: string;
  firm_id: string;
  matter_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: number;
  location: string | null;
  reminder_minutes: number | null;
  created_at: string;
}

function toDto(row: EventRow) {
  return {
    id: row.id,
    firmId: row.firm_id,
    matterId: row.matter_id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    allDay: !!row.all_day,
    location: row.location,
    reminderMinutes: row.reminder_minutes,
    createdAt: row.created_at,
  };
}

calendarEventsRouter.get("/", (req, res) => {
  const { from, to, matterId } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM calendar_events WHERE firm_id = ?";
  const params: unknown[] = [req.user!.firmId];
  if (from) {
    sql += " AND end_at >= ?";
    params.push(from);
  }
  if (to) {
    sql += " AND start_at <= ?";
    params.push(to);
  }
  if (matterId) {
    sql += " AND matter_id = ?";
    params.push(matterId);
  }
  sql += " ORDER BY start_at";
  const rows = db.prepare<unknown[], EventRow>(sql).all(...params);
  res.json({ events: rows.map(toDto) });
});

const schema = z.object({
  matterId: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startAt: z.string(),
  endAt: z.string(),
  allDay: z.boolean().default(false),
  location: z.string().nullable().optional(),
  reminderMinutes: z.number().int().nullable().optional(),
});

calendarEventsRouter.post("/", (req, res) => {
  const data = parseBody(schema, req.body, res);
  if (!data) return;
  const id = newId();
  db.prepare(
    `INSERT INTO calendar_events (id, firm_id, matter_id, user_id, title, description, start_at, end_at, all_day, location, reminder_minutes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.firmId,
    data.matterId ?? null,
    req.user!.id,
    data.title,
    data.description ?? null,
    data.startAt,
    data.endAt,
    data.allDay ? 1 : 0,
    data.location ?? null,
    data.reminderMinutes ?? null,
    nowISO()
  );
  res.status(201).json({ event: toDto(db.prepare<[string], EventRow>("SELECT * FROM calendar_events WHERE id = ?").get(id)!) });
});

calendarEventsRouter.patch("/:id", (req, res) => {
  const data = parseBody(schema.partial(), req.body, res);
  if (!data) return;
  const existing = db
    .prepare<[string, string], EventRow>("SELECT * FROM calendar_events WHERE id = ? AND firm_id = ?")
    .get(req.params.id, req.user!.firmId);
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const merged = { ...toDto(existing), ...data };
  db.prepare(
    `UPDATE calendar_events SET matter_id=?, title=?, description=?, start_at=?, end_at=?, all_day=?, location=?, reminder_minutes=? WHERE id=?`
  ).run(
    merged.matterId ?? null,
    merged.title,
    merged.description ?? null,
    merged.startAt,
    merged.endAt,
    merged.allDay ? 1 : 0,
    merged.location ?? null,
    merged.reminderMinutes ?? null,
    req.params.id
  );
  res.json({ event: toDto(db.prepare<[string], EventRow>("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id)!) });
});

calendarEventsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM calendar_events WHERE id = ? AND firm_id = ?").run(req.params.id, req.user!.firmId);
  res.status(204).end();
});
