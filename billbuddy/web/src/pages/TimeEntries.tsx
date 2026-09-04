import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { TimeEntry } from "@billbuddy/shared";
import { api } from "../api/client";
import { formatCurrencyCents, formatDate, formatHours } from "../lib/format";
import { Badge, Card, EmptyState, PageHeader, Select } from "../components/ui";
import { TrashIcon } from "../components/icons";

export default function TimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [matterTitles, setMatterTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "unbilled" | "billed">("unbilled");

  async function load() {
    const params = filter === "unbilled" ? { unbilled: "true" } : undefined;
    const { timeEntries } = await api.timeEntries.list(params);
    const rows = filter === "billed" ? timeEntries.filter((t) => t.invoiceId) : timeEntries;
    setEntries(rows);
    const { matters } = await api.matters.list();
    setMatterTitles(Object.fromEntries(matters.map((m) => [m.id, m.title])));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function remove(id: string) {
    await api.timeEntries.remove(id);
    load();
  }

  const totalCents = entries.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <div>
      <PageHeader
        title="Time Entries"
        subtitle={`${entries.length} entries · ${formatCurrencyCents(totalCents)}`}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-40">
            <option value="unbilled">Unbilled</option>
            <option value="billed">Billed</option>
            <option value="all">All</option>
          </Select>
        }
      />

      {entries.length === 0 ? (
        <EmptyState title="No time entries" hint="Log time from a matter's page, or close a tab from Open Tabs." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Matter</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Hours</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {entries.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5">
                    <Link to={`/matters/${t.matterId}`} className="text-brand-600 hover:underline">
                      {matterTitles[t.matterId] ?? "Matter"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-800">{t.description}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatHours(t.durationSeconds)}</td>
                  <td className="px-4 py-2.5 text-ink-800">
                    {formatCurrencyCents(t.amountCents)} {!t.billable && <Badge>non-billable</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!t.invoiceId && (
                      <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-red-600" aria-label="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
