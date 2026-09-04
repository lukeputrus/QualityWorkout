import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Client, Expense, Matter, MatterDocument, MatterStatus, TimeEntry } from "@billbuddy/shared";
import { api } from "../api/client";
import { centsFromDollarsInput, formatCurrencyCents, formatDate, formatHours } from "../lib/format";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, Textarea } from "../components/ui";
import { ClockIcon, DownloadIcon, PlusIcon, TrashIcon } from "../components/icons";
import { useTabs } from "../context/TabsContext";

export default function MatterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openTab } = useTabs();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [unbilledCents, setUnbilledCents] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<MatterDocument[]>([]);
  const [tab, setTab] = useState<"time" | "expenses" | "documents">("time");

  async function load() {
    if (!id) return;
    const [m, te, ex, docs] = await Promise.all([
      api.matters.get(id),
      api.timeEntries.list({ matterId: id }),
      api.expenses.list({ matterId: id }),
      api.documents.list(id),
    ]);
    setMatter(m.matter);
    setClient(m.client);
    setUnbilledCents(m.unbilledCents);
    setTimeEntries(te.timeEntries);
    setExpenses(ex.expenses);
    setDocuments(docs.documents);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!matter || !client) return <div className="text-ink-400">Loading…</div>;

  async function setStatus(status: MatterStatus) {
    if (!id) return;
    await api.matters.update(id, { status });
    load();
  }

  return (
    <div>
      <PageHeader
        title={matter.title}
        subtitle={
          <>
            <Link to={`/clients/${client.id}`} className="text-brand-600 hover:underline">
              {client.name}
            </Link>
            {matter.practiceArea && ` · ${matter.practiceArea}`}
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => openTab(matter.id)}>
              <ClockIcon className="h-4 w-4" /> Open a tab
            </Button>
            {matter.status !== "closed" ? (
              <Button variant="secondary" onClick={() => setStatus("closed")}>
                Close matter
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setStatus("open")}>
                Reopen matter
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="text-xs text-ink-500">Status</div>
          <Badge>{matter.status}</Badge>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Billing</div>
          <div className="text-sm font-medium capitalize text-ink-800">
            {matter.billingType}
            {matter.billingType === "hourly" && matter.defaultRateCents ? ` · ${formatCurrencyCents(matter.defaultRateCents)}/hr` : ""}
            {matter.billingType === "flat" && matter.flatFeeAmountCents ? ` · ${formatCurrencyCents(matter.flatFeeAmountCents)}` : ""}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Unbilled</div>
          <div className="text-sm font-medium text-ink-800">{formatCurrencyCents(unbilledCents)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Opened</div>
          <div className="text-sm font-medium text-ink-800">{formatDate(matter.openedAt)}</div>
        </Card>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 text-sm w-fit">
        {(["time", "expenses", "documents"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 capitalize ${tab === t ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "time" && <TimeEntriesPanel matterId={matter.id} entries={timeEntries} defaultRateCents={matter.defaultRateCents} onChange={load} />}
      {tab === "expenses" && <ExpensesPanel matterId={matter.id} expenses={expenses} onChange={load} />}
      {tab === "documents" && <DocumentsPanel matterId={matter.id} documents={documents} onChange={load} />}

      <div className="mt-6">
        <Button variant="ghost" onClick={() => navigate("/billing")} className="text-xs">
          Ready to bill this client? Generate an invoice from the Billing page →
        </Button>
      </div>
    </div>
  );
}

function TimeEntriesPanel({
  matterId,
  entries,
  defaultRateCents,
  onChange,
}: {
  matterId: string;
  entries: TimeEntry[];
  defaultRateCents: number | null;
  onChange: () => void;
}) {
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("1.0");
  const [rate, setRate] = useState(defaultRateCents ? (defaultRateCents / 100).toFixed(2) : "300.00");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.timeEntries.create({
        matterId,
        description,
        durationSeconds: Math.round(Number(hours) * 3600),
        rateCents: centsFromDollarsInput(rate),
      });
      setDescription("");
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await api.timeEntries.remove(id);
    onChange();
  }

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="mb-4 grid grid-cols-2 gap-2 border-b border-ink-100 pb-4 md:grid-cols-5">
        <div className="col-span-2 md:col-span-2">
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Field>
        </div>
        <Field label="Hours">
          <Input value={hours} onChange={(e) => setHours(e.target.value)} inputMode="decimal" required />
        </Field>
        <Field label="Rate ($/hr)">
          <Input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" required />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={saving}>
            <PlusIcon className="h-4 w-4" /> Add
          </Button>
        </div>
      </form>

      {entries.length === 0 ? (
        <EmptyState title="No time logged yet" />
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="py-1.5 font-medium">Date</th>
              <th className="py-1.5 font-medium">Description</th>
              <th className="py-1.5 font-medium">Hours</th>
              <th className="py-1.5 font-medium">Amount</th>
              <th className="py-1.5 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {entries.map((t) => (
              <tr key={t.id}>
                <td className="py-2 text-ink-500">{formatDate(t.date)}</td>
                <td className="py-2 text-ink-800">
                  {t.description} {!t.billable && <Badge>non-billable</Badge>} {t.invoiceId && <Badge>sent</Badge>}
                </td>
                <td className="py-2 text-ink-500">{formatHours(t.durationSeconds)}</td>
                <td className="py-2 text-ink-800">{formatCurrencyCents(t.amountCents)}</td>
                <td className="py-2 text-right">
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
      )}
    </Card>
  );
}

function ExpensesPanel({ matterId, expenses, onChange }: { matterId: string; expenses: Expense[]; onChange: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.expenses.create({ matterId, description, amountCents: centsFromDollarsInput(amount) });
      setDescription("");
      setAmount("0.00");
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await api.expenses.remove(id);
    onChange();
  }

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="mb-4 grid grid-cols-3 gap-2 border-b border-ink-100 pb-4">
        <div className="col-span-2">
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Field>
        </div>
        <Field label="Amount ($)">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required />
        </Field>
        <div className="col-span-3">
          <Button type="submit" disabled={saving}>
            <PlusIcon className="h-4 w-4" /> Add expense
          </Button>
        </div>
      </form>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses logged yet" />
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-ink-100">
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="py-2 text-ink-500">{formatDate(e.date)}</td>
                <td className="py-2 text-ink-800">
                  {e.description} {e.invoiceId && <Badge>sent</Badge>}
                </td>
                <td className="py-2 text-ink-800">{formatCurrencyCents(e.amountCents)}</td>
                <td className="py-2 text-right">
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
      )}
    </Card>
  );
}

function DocumentsPanel({ matterId, documents, onChange }: { matterId: string; documents: MatterDocument[]; onChange: () => void }) {
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.documents.upload(matterId, file);
      onChange();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(id: string) {
    await api.documents.remove(id);
    onChange();
  }

  return (
    <Card className="p-4">
      <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-2 text-sm text-ink-600 hover:border-brand-400">
        <PlusIcon className="h-4 w-4" />
        {uploading ? "Uploading…" : "Upload document"}
        <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
      </label>

      {documents.length === 0 ? (
        <EmptyState title="No documents on file for this matter" />
      ) : (
        <ul className="divide-y divide-ink-100 text-sm">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-2">
              <span className="text-ink-800">{d.filename}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-400">{(d.sizeBytes / 1024).toFixed(0)} KB</span>
                <a href={api.documents.downloadUrl(d.id)} target="_blank" rel="noreferrer" className="text-ink-500 hover:text-brand-600">
                  <DownloadIcon className="h-4 w-4" />
                </a>
                <button onClick={() => remove(d.id)} className="text-ink-400 hover:text-red-600">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
