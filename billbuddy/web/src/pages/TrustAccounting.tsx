import { useEffect, useState } from "react";
import type { Client, TrustAccount, TrustTransaction } from "@billbuddy/shared";
import { api } from "../api/client";
import { centsFromDollarsInput, formatCurrencyCents, formatDateTime } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { PlusIcon } from "../components/icons";

export default function TrustAccounting() {
  const [accounts, setAccounts] = useState<TrustAccount[]>([]);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TrustTransaction[]>([]);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [txModal, setTxModal] = useState<"deposit" | "withdraw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankBalance, setBankBalance] = useState("0.00");
  const [reconciliation, setReconciliation] = useState<Awaited<ReturnType<typeof api.trust.reconciliation>> | null>(null);

  async function loadAccounts() {
    const { trustAccounts } = await api.trust.accounts();
    setAccounts(trustAccounts);
    const { clients } = await api.clients.list();
    setClientNames(Object.fromEntries(clients.map((c) => [c.id, c.name])));
    if (!selectedId && trustAccounts.length > 0) setSelectedId(trustAccounts[0].id);
  }

  async function loadTransactions(accountId: string) {
    const { transactions: tx } = await api.trust.transactions(accountId);
    setTransactions(tx);
  }

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadTransactions(selectedId);
  }, [selectedId]);

  const selectedAccount = accounts.find((a) => a.id === selectedId) ?? null;

  async function runReconciliation() {
    const result = await api.trust.reconciliation(centsFromDollarsInput(bankBalance));
    setReconciliation(result);
  }

  return (
    <div>
      <PageHeader
        title="Trust Accounting"
        subtitle="Client trust (IOLTA) ledgers - one client's funds can never fall below zero"
        actions={
          <Button onClick={() => setShowNewAccount(true)}>
            <PlusIcon className="h-4 w-4" /> New trust ledger
          </Button>
        }
      />

      <ErrorBanner message={error} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-ink-900">Client ledgers</h2>
          {accounts.length === 0 ? (
            <EmptyState title="No trust ledgers yet" />
          ) : (
            <ul className="divide-y divide-ink-100">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`cursor-pointer rounded px-2 py-2 text-sm ${selectedId === a.id ? "bg-brand-50" : "hover:bg-ink-50"}`}
                >
                  <div className="font-medium text-ink-800">{clientNames[a.clientId] ?? "Client"}</div>
                  <div className="text-ink-500">{formatCurrencyCents(a.balanceCents)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 lg:col-span-2">
          {!selectedAccount ? (
            <EmptyState title="Select a ledger" />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-ink-900">{clientNames[selectedAccount.clientId]}</h2>
                  <p className="text-2xl font-semibold text-ink-900">{formatCurrencyCents(selectedAccount.balanceCents)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setTxModal("deposit")}>
                    Deposit
                  </Button>
                  <Button variant="secondary" onClick={() => setTxModal("withdraw")}>
                    Withdraw
                  </Button>
                </div>
              </div>
              {transactions.length === 0 ? (
                <EmptyState title="No transactions yet" />
              ) : (
                <ul className="divide-y divide-ink-100 text-sm">
                  {transactions.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2">
                      <div>
                        <div className="capitalize text-ink-800">{t.type.replace(/_/g, " ")}</div>
                        <div className="text-xs text-ink-500">
                          {formatDateTime(t.createdAt)} {t.memo ? `· ${t.memo}` : ""}
                        </div>
                      </div>
                      <span className={`font-medium ${t.type === "deposit" ? "text-emerald-600" : "text-ink-800"}`}>
                        {t.type === "deposit" ? "+" : "-"}
                        {formatCurrencyCents(t.amountCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <h2 className="mb-1 font-semibold text-ink-900">Three-way reconciliation</h2>
        <p className="mb-3 text-xs text-ink-500">
          Type in your trust bank account's current statement balance to check it against the sum of every client's ledger.
        </p>
        <div className="flex items-end gap-2">
          <div className="w-48">
            <Field label="Bank statement balance ($)">
              <Input value={bankBalance} onChange={(e) => setBankBalance(e.target.value)} inputMode="decimal" />
            </Field>
          </div>
          <Button onClick={runReconciliation}>Check</Button>
        </div>
        {reconciliation && (
          <div className={`mt-3 rounded-lg p-3 text-sm ${reconciliation.balanced ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
            {reconciliation.balanced ? (
              "Balanced - your bank statement matches the sum of all client ledgers."
            ) : (
              <>
                Out of balance by {formatCurrencyCents(Math.abs(reconciliation.differenceCents))}. Ledger total:{" "}
                {formatCurrencyCents(reconciliation.ledgerTotalCents)}, bank statement: {formatCurrencyCents(reconciliation.bankBalanceCents)}.
              </>
            )}
          </div>
        )}
      </Card>

      {showNewAccount && (
        <NewTrustAccountModal
          onClose={() => setShowNewAccount(false)}
          onCreated={(a) => {
            setShowNewAccount(false);
            loadAccounts();
            setSelectedId(a.id);
          }}
        />
      )}

      {txModal && selectedAccount && (
        <TrustTxModal
          type={txModal}
          accountId={selectedAccount.id}
          maxCents={selectedAccount.balanceCents}
          onClose={() => setTxModal(null)}
          onDone={() => {
            setTxModal(null);
            setError(null);
            loadAccounts();
            loadTransactions(selectedAccount.id);
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function NewTrustAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: TrustAccount) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.clients.list().then((r) => {
      setClients(r.clients);
      if (r.clients.length > 0) setClientId(r.clients[0].id);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { trustAccount } = await api.trust.createAccount({ clientId });
      onCreated(trustAccount);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New trust ledger" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Client">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !clientId}>
            {saving ? "Creating…" : "Create ledger"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TrustTxModal({
  type,
  accountId,
  maxCents,
  onClose,
  onDone,
  onError,
}: {
  type: "deposit" | "withdraw";
  accountId: string;
  maxCents: number;
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [amount, setAmount] = useState("0.00");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const amountCents = centsFromDollarsInput(amount);
      if (type === "deposit") await api.trust.deposit(accountId, { amountCents, memo });
      else await api.trust.withdraw(accountId, { amountCents, memo });
      onDone();
    } catch (err) {
      onError((err as Error).message);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={type === "deposit" ? "Deposit to trust" : "Withdraw from trust"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Amount ($)">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required />
        </Field>
        {type === "withdraw" && <p className="text-xs text-ink-500">Available: {formatCurrencyCents(maxCents)}</p>}
        <Field label="Memo">
          <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g. Retainer deposit" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
