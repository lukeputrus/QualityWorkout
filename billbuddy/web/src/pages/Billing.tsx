import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Client, Invoice } from "@billbuddy/shared";
import { api, type MatterListItem } from "../api/client";
import { formatCurrencyCents, formatDate } from "../lib/format";
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Select } from "../components/ui";
import { PlusIcon } from "../components/icons";

const STATUS_FILTERS = ["all", "draft", "sent", "overdue", "paid"] as const;

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const navigate = useNavigate();

  async function load() {
    const { invoices: rows } = await api.invoices.list(status === "all" ? undefined : { status });
    setInvoices(rows);
    const { clients } = await api.clients.list();
    setClientNames(Object.fromEntries(clients.map((c) => [c.id, c.name])));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <PageHeader
        title="Billing"
        actions={
          <Button onClick={() => setShowGenerate(true)}>
            <PlusIcon className="h-4 w-4" /> Generate invoice
          </Button>
        }
      />

      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 text-sm w-fit">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1.5 capitalize ${status === s ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices" hint="Generate one from unbilled time and expenses." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Invoice</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Issued</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Balance</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/billing/${inv.id}`)}>
                  <td className="px-4 py-2.5 font-medium text-ink-800">{inv.invoiceNumber}</td>
                  <td className="px-4 py-2.5 text-ink-600">{clientNames[inv.clientId] ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-2.5 text-ink-500">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-2.5 text-ink-800">{formatCurrencyCents(inv.totalCents)}</td>
                  <td className="px-4 py-2.5 text-ink-800">{formatCurrencyCents(inv.totalCents - inv.amountPaidCents)}</td>
                  <td className="px-4 py-2.5">
                    <Badge>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showGenerate && (
        <GenerateInvoiceModal
          onClose={() => setShowGenerate(false)}
          onGenerated={(inv) => {
            setShowGenerate(false);
            navigate(`/billing/${inv.id}`);
          }}
        />
      )}
    </div>
  );
}

function GenerateInvoiceModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: (inv: Invoice) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [matters, setMatters] = useState<Array<MatterListItem & { unbilledCents: number }>>([]);
  const [selectedMatterIds, setSelectedMatterIds] = useState<Set<string>>(new Set());
  const [loadingMatters, setLoadingMatters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.clients.list().then((r) => {
      setClients(r.clients);
      if (r.clients.length > 0) setClientId(r.clients[0].id);
    });
  }, []);

  useEffect(() => {
    if (!clientId) return;
    setLoadingMatters(true);
    api.matters.list({ clientId }).then(async (r) => {
      const withUnbilled = await Promise.all(
        r.matters.map(async (m) => {
          const detail = await api.matters.get(m.id);
          return { ...m, unbilledCents: detail.unbilledCents };
        })
      );
      setMatters(withUnbilled);
      setSelectedMatterIds(new Set(withUnbilled.filter((m) => m.unbilledCents > 0).map((m) => m.id)));
      setLoadingMatters(false);
    });
  }, [clientId]);

  const totalSelectedCents = matters.filter((m) => selectedMatterIds.has(m.id)).reduce((sum, m) => sum + m.unbilledCents, 0);

  function toggle(id: string) {
    setSelectedMatterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { invoice } = await api.invoices.generate({ clientId, matterIds: Array.from(selectedMatterIds) });
      onGenerated(invoice);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Generate invoice" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        <Field label="Client">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        {loadingMatters ? (
          <p className="text-sm text-ink-400">Loading unbilled work…</p>
        ) : matters.length === 0 ? (
          <p className="text-sm text-ink-400">This client has no matters yet.</p>
        ) : (
          <div>
            <Field label="Include matters">
              <ul className="divide-y divide-ink-100 rounded-lg border border-ink-200">
                {matters.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedMatterIds.has(m.id)} onChange={() => toggle(m.id)} disabled={m.unbilledCents === 0} />
                      <span className={m.unbilledCents === 0 ? "text-ink-400" : "text-ink-800"}>{m.title}</span>
                    </label>
                    <span className="text-ink-500">{formatCurrencyCents(m.unbilledCents)}</span>
                  </li>
                ))}
              </ul>
            </Field>
            <div className="mt-2 text-right text-sm font-medium text-ink-800">Total: {formatCurrencyCents(totalSelectedCents)}</div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || totalSelectedCents === 0}>
            {saving ? "Generating…" : "Generate draft invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
