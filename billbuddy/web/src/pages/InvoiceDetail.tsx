import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Client, Invoice, InvoiceLineItem, Payment, PaymentMethod } from "@billbuddy/shared";
import { api } from "../api/client";
import { centsFromDollarsInput, formatCurrencyCents, formatDate, formatDateTime } from "../lib/format";
import { Badge, Button, Card, ErrorBanner, Field, Input, PageHeader, Select } from "../components/ui";
import { DownloadIcon, PlusIcon, TrashIcon } from "../components/icons";

type InvoiceWithItems = Invoice & { lineItems: InvoiceLineItem[] };

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showLineItem, setShowLineItem] = useState(false);

  async function load() {
    if (!id) return;
    const { invoice: inv, client: c } = await api.invoices.get(id);
    setInvoice(inv);
    setClient(c);
    const { payments: pays } = await api.payments.list({ invoiceId: id });
    setPayments(pays);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!invoice || !client) return <div className="text-ink-400">Loading…</div>;

  const balanceDue = invoice.totalCents - invoice.amountPaidCents;

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeLineItem(lineItemId: string) {
    if (!id) return;
    act(() => api.invoices.removeLineItem(id, lineItemId));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={invoice.invoiceNumber}
        subtitle={`${client.name} · issued ${formatDate(invoice.issueDate)} · due ${formatDate(invoice.dueDate)}`}
        actions={
          <>
            <a href={api.invoices.pdfUrl(invoice.id)} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <DownloadIcon className="h-4 w-4" /> PDF
              </Button>
            </a>
            {invoice.status === "draft" && (
              <Button variant="secondary" onClick={() => act(() => api.invoices.send(invoice.id))}>
                Send invoice
              </Button>
            )}
            {(invoice.status === "draft" || invoice.status === "sent") && invoice.amountPaidCents === 0 && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm("Void this invoice? Its time and expenses will become unbilled again.")) act(() => api.invoices.void(invoice.id));
                }}
              >
                Void
              </Button>
            )}
            {invoice.status !== "draft" && invoice.status !== "void" && balanceDue > 0 && (
              <Button onClick={() => setShowPayment(true)}>Record payment</Button>
            )}
          </>
        }
      />

      <ErrorBanner message={error} />

      <div className="mb-4 flex items-center gap-3">
        <Badge>{invoice.status}</Badge>
        {balanceDue > 0 && invoice.status !== "draft" && invoice.status !== "void" && (
          <span className="text-sm text-ink-600">{formatCurrencyCents(balanceDue)} balance due</span>
        )}
      </div>

      <Card className="overflow-hidden p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Rate</th>
              <th className="pb-2 font-medium">Amount</th>
              {invoice.status === "draft" && <th></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {invoice.lineItems.map((li) => (
              <tr key={li.id}>
                <td className="py-2 text-ink-800">{li.description}</td>
                <td className="py-2 text-ink-500">{li.quantity}</td>
                <td className="py-2 text-ink-500">{formatCurrencyCents(li.rateCents)}</td>
                <td className="py-2 text-ink-800">{formatCurrencyCents(li.amountCents)}</td>
                {invoice.status === "draft" && (
                  <td className="py-2 text-right">
                    <button onClick={() => removeLineItem(li.id)} className="text-ink-400 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {invoice.status === "draft" && (
          <button onClick={() => setShowLineItem((v) => !v)} className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            <PlusIcon className="h-3.5 w-3.5" /> Add custom line item
          </button>
        )}
        {showLineItem && <AddLineItemForm invoiceId={invoice.id} onAdded={() => { setShowLineItem(false); load(); }} />}

        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{formatCurrencyCents(invoice.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Tax</span>
              <span>{formatCurrencyCents(invoice.taxCents)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-1 font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatCurrencyCents(invoice.totalCents)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Paid</span>
              <span>{formatCurrencyCents(invoice.amountPaidCents)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink-900">
              <span>Balance due</span>
              <span>{formatCurrencyCents(balanceDue)}</span>
            </div>
          </div>
        </div>
      </Card>

      {payments.length > 0 && (
        <Card className="mt-4 p-4">
          <h2 className="mb-2 font-semibold text-ink-900">Payments</h2>
          <ul className="divide-y divide-ink-100 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between py-1.5">
                <span className="text-ink-600">
                  {formatDateTime(p.paidAt)} · <span className="capitalize">{p.method.replace("_", " ")}</span>
                  {p.reference ? ` (${p.reference})` : ""}
                </span>
                <span className="font-medium text-ink-800">{formatCurrencyCents(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showPayment && (
        <RecordPaymentModal
          invoiceId={invoice.id}
          clientId={invoice.clientId}
          maxCents={balanceDue}
          onClose={() => setShowPayment(false)}
          onRecorded={() => {
            setShowPayment(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddLineItemForm({ invoiceId, onAdded }: { invoiceId: string; onAdded: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.invoices.addLineItem(invoiceId, { description, rateCents: centsFromDollarsInput(amount), quantity: 1, type: "custom" });
      onAdded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 flex items-end gap-2 rounded-lg bg-ink-50 p-3">
      <div className="flex-1">
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Field>
      </div>
      <div className="w-32">
        <Field label="Amount ($)">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required />
        </Field>
      </div>
      <Button type="submit" disabled={saving}>
        Add
      </Button>
    </form>
  );
}

function RecordPaymentModal({
  invoiceId,
  clientId,
  maxCents,
  onClose,
  onRecorded,
}: {
  invoiceId: string;
  clientId: string;
  maxCents: number;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const [amount, setAmount] = useState((maxCents / 100).toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>("check");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.payments.create({ invoiceId, clientId, amountCents: centsFromDollarsInput(amount), method, reference: reference || null });
      onRecorded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/40 p-4 pt-16" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-base font-semibold text-ink-900">Record payment</h2>
        {error && <div className="mb-3 rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <Field label="Amount ($)">
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required />
          </Field>
          <Field label="Method">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit card</option>
              <option value="ach">ACH</option>
              <option value="trust_transfer">Trust transfer</option>
            </Select>
          </Field>
          <Field label="Reference (optional)">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Check #, last 4, etc." />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Recording…" : "Record payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
