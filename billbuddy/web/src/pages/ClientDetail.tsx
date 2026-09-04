import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Client, Invoice, TrustAccount } from "@billbuddy/shared";
import { api, type MatterListItem } from "../api/client";
import { formatCurrencyCents } from "../lib/format";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { PlusIcon } from "../components/icons";
import NewMatterModal from "../components/NewMatterModal";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [matters, setMatters] = useState<MatterListItem[]>([]);
  const [trustAccounts, setTrustAccounts] = useState<TrustAccount[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showNewMatter, setShowNewMatter] = useState(false);

  async function load() {
    if (!id) return;
    const [c, m, ta, inv] = await Promise.all([
      api.clients.get(id),
      api.matters.list({ clientId: id }),
      api.trust.accounts(id),
      api.invoices.list({ clientId: id }),
    ]);
    setClient(c.client);
    setMatters(m.matters);
    setTrustAccounts(ta.trustAccounts);
    setInvoices(inv.invoices);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!client) return <div className="text-ink-400">Loading…</div>;

  const trustTotal = trustAccounts.reduce((sum, a) => sum + a.balanceCents, 0);

  return (
    <div>
      <PageHeader
        title={client.name}
        subtitle={`${client.type === "organization" ? "Organization" : "Individual"}${client.email ? ` · ${client.email}` : ""}`}
        actions={
          <Button onClick={() => setShowNewMatter(true)}>
            <PlusIcon className="h-4 w-4" /> New matter
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="text-xs text-ink-500">Phone</div>
          <div className="text-sm font-medium text-ink-800">{client.phone ?? "—"}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Address</div>
          <div className="text-sm font-medium text-ink-800">{client.address ?? "—"}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Trust balance</div>
          <div className="text-sm font-medium text-ink-800">{formatCurrencyCents(trustTotal)}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-ink-500">Open matters</div>
          <div className="text-sm font-medium text-ink-800">{matters.filter((m) => m.status === "open").length}</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Matters</h2>
          {matters.length === 0 ? (
            <EmptyState title="No matters for this client yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {matters.map((m) => (
                <li key={m.id} className="cursor-pointer py-2 hover:bg-ink-50" onClick={() => navigate(`/matters/${m.id}`)}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-800">{m.title}</span>
                    <Badge>{m.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Invoices</h2>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {invoices.map((inv) => (
                <li key={inv.id} className="cursor-pointer py-2 hover:bg-ink-50" onClick={() => navigate(`/billing/${inv.id}`)}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-800">{inv.invoiceNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-600">{formatCurrencyCents(inv.totalCents)}</span>
                      <Badge>{inv.status}</Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {trustAccounts.length > 0 && (
        <Card className="mt-4 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Trust ledgers</h2>
            <Link to="/trust" className="text-xs font-medium text-brand-600 hover:underline">
              Manage in Trust Accounting →
            </Link>
          </div>
          <ul className="divide-y divide-ink-100 text-sm">
            {trustAccounts.map((a) => (
              <li key={a.id} className="flex justify-between py-1.5">
                <span className="text-ink-600">{a.matterId ? "Matter-specific ledger" : "General retainer"}</span>
                <span className="font-medium text-ink-800">{formatCurrencyCents(a.balanceCents)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showNewMatter && (
        <NewMatterModal
          presetClientId={client.id}
          onClose={() => setShowNewMatter(false)}
          onCreated={(m) => {
            setShowNewMatter(false);
            navigate(`/matters/${m.id}`);
          }}
        />
      )}
    </div>
  );
}
