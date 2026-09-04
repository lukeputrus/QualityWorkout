import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { TaskItem, CalendarEvent } from "@billbuddy/shared";
import { formatCurrencyCents, formatDateTime, formatDuration } from "../lib/format";
import { Badge, Card, EmptyState, PageHeader, StatCard } from "../components/ui";
import { useAuth } from "../context/AuthContext";

interface Summary {
  openMattersCount: number;
  unbilledCents: number;
  outstandingArCents: number;
  trustBalanceCents: number;
  todaySecondsTracked: number;
  openTabsCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    api.reports.dashboardSummary().then(setSummary);
    api.tasks.list({ status: "open" }).then((r) => setTasks(r.tasks.slice(0, 5)));
    const now = new Date().toISOString();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    api.calendarEvents.list({ from: now, to: in7Days }).then((r) => setEvents(r.events.slice(0, 5)));
  }, []);

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name.split(" ")[0]}`} subtitle={user?.firm.name} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Open matters" value={summary?.openMattersCount ?? "—"} />
        <StatCard label="Unbilled" value={summary ? formatCurrencyCents(summary.unbilledCents) : "—"} hint="Ready to invoice" />
        <StatCard label="Outstanding A/R" value={summary ? formatCurrencyCents(summary.outstandingArCents) : "—"} />
        <StatCard label="Trust on hand" value={summary ? formatCurrencyCents(summary.trustBalanceCents) : "—"} />
        <StatCard
          label="Tracked today"
          value={summary ? formatDuration(summary.todaySecondsTracked) : "—"}
          hint={summary ? `${summary.openTabsCount} open tab${summary.openTabsCount === 1 ? "" : "s"}` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Upcoming tasks</h2>
            <Link to="/task-list" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="No open tasks" hint="You're all caught up." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink-800">{t.title}</span>
                  <div className="flex items-center gap-2">
                    {t.dueAt && <span className="text-xs text-ink-500">{formatDateTime(t.dueAt)}</span>}
                    <Badge>{t.priority}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Next 7 days</h2>
            <Link to="/calendar" className="text-xs font-medium text-brand-600 hover:underline">
              View calendar
            </Link>
          </div>
          {events.length === 0 ? (
            <EmptyState title="Nothing on the calendar" hint="Deadlines and appointments will show up here." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {events.map((e) => (
                <li key={e.id} className="py-2 text-sm">
                  <div className="text-ink-800">{e.title}</div>
                  <div className="text-xs text-ink-500">{formatDateTime(e.startAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
