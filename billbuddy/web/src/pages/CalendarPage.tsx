import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent, Matter } from "@billbuddy/shared";
import { api } from "../api/client";
import { Button, Card, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { PlusIcon } from "../components/icons";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showNew, setShowNew] = useState(false);

  const gridStart = useMemo(() => {
    const d = new Date(month);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [month]);

  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)), [gridStart]);

  async function load() {
    const from = days[0].toISOString();
    const to = days[days.length - 1].toISOString();
    const { events: rows } = await api.calendarEvents.list({ from, to });
    setEvents(rows);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = e.startAt.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  return (
    <div>
      <PageHeader
        title="Calendar"
        actions={
          <>
            <Button variant="secondary" onClick={() => setMonth((m) => addMonths(m, -1))}>
              ←
            </Button>
            <Button variant="secondary" onClick={() => setMonth(startOfMonth(new Date()))}>
              Today
            </Button>
            <Button variant="secondary" onClick={() => setMonth((m) => addMonths(m, 1))}>
              →
            </Button>
            <Button onClick={() => setShowNew(true)}>
              <PlusIcon className="h-4 w-4" /> New event
            </Button>
          </>
        }
        subtitle={month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ink-100 bg-ink-50 text-center text-xs font-medium uppercase text-ink-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const inMonth = d.getMonth() === month.getMonth();
            const dayEvents = eventsByDay.get(toDateKey(d)) ?? [];
            const isToday = toDateKey(d) === toDateKey(new Date());
            return (
              <div key={d.toISOString()} className={`min-h-24 border-b border-r border-ink-100 p-1.5 ${inMonth ? "" : "bg-ink-50/50"}`}>
                <div className={`mb-1 text-xs ${isToday ? "font-bold text-brand-600" : inMonth ? "text-ink-600" : "text-ink-300"}`}>{d.getDate()}</div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div key={e.id} title={e.title} className="truncate rounded bg-brand-100 px-1 py-0.5 text-[11px] text-brand-800">
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div className="text-[11px] text-ink-400">+{dayEvents.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showNew && (
        <NewEventModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [matterId, setMatterId] = useState<string>("");
  const [matters, setMatters] = useState<Matter[]>([]);
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.matters.list().then((r) => setMatters(r.matters));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.calendarEvents.create({
        title,
        matterId: matterId || null,
        startAt: new Date(start).toISOString(),
        endAt: new Date(end).toISOString(),
        location: location || null,
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New calendar event" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </Field>
        <Field label="Related matter (optional)">
          <Select value={matterId} onChange={(e) => setMatterId(e.target.value)}>
            <option value="">None</option>
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start">
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="End">
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </Field>
        </div>
        <Field label="Location (optional)">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
