import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Expense } from "@billbuddy/shared";
import { api } from "../api/client";
import { formatCurrencyCents, formatDate } from "../lib/format";
import { Badge, Card, EmptyState, PageHeader, Select } from "../components/ui";
import { TrashIcon } from "../components/icons";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [matterTitles, setMatterTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "unbilled" | "billed">("unbilled");

  async function load() {
    const params = filter === "unbilled" ? { unbilled: "true" } : undefined;
    const { expenses: rows } = await api.expenses.list(params);
    setExpenses(filter === "billed" ? rows.filter((e) => e.invoiceId) : rows);
    const { matters } = await api.matters.list();
    setMatterTitles(Object.fromEntries(matters.map((m) => [m.id, m.title])));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function remove(id: string) {
    await api.expenses.remove(id);
    load();
  }

  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle={`${expenses.length} expenses · ${formatCurrencyCents(totalCents)}`}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="w-40">
            <option value="unbilled">Unbilled</option>
            <option value="billed">Billed</option>
            <option value="all">All</option>
          </Select>
        }
      />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses" hint="Log costs from a matter's page so they can be billed back to the client." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Matter</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(e.date)}</td>
                  <td className="px-4 py-2.5">
                    <Link to={`/matters/${e.matterId}`} className="text-brand-600 hover:underline">
                      {matterTitles[e.matterId] ?? "Matter"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-800">
                    {e.description} {!e.billable && <Badge>non-billable</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-ink-800">{formatCurrencyCents(e.amountCents)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {!e.invoiceId && (
                      <button onClick={() => remove(e.id)} className="text-ink-400 hover:text-red-600" aria-label="Delete">
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
