import { useEffect, useState } from "react";
import type { BillingType, Client, Matter } from "@billbuddy/shared";
import { api } from "../api/client";
import { centsFromDollarsInput } from "../lib/format";
import { Button, Field, Input, Modal, Select } from "./ui";

export default function NewMatterModal({
  presetClientId,
  onClose,
  onCreated,
}: {
  presetClientId?: string;
  onClose: () => void;
  onCreated: (m: Matter) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(presetClientId ?? "");
  const [title, setTitle] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [billingType, setBillingType] = useState<BillingType>("hourly");
  const [rate, setRate] = useState("300.00");
  const [flatFee, setFlatFee] = useState("0.00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!presetClientId) {
      api.clients.list().then((r) => {
        setClients(r.clients);
        if (r.clients.length > 0) setClientId(r.clients[0].id);
      });
    }
  }, [presetClientId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { matter } = await api.matters.create({
        clientId,
        title,
        practiceArea: practiceArea || null,
        billingType,
        defaultRateCents: billingType === "hourly" ? centsFromDollarsInput(rate) : null,
        flatFeeAmountCents: billingType === "flat" ? centsFromDollarsInput(flatFee) : null,
      });
      onCreated(matter);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New matter" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        {!presetClientId && (
          <Field label="Client">
            {clients.length === 0 ? (
              <p className="text-xs text-ink-500">Add a client first.</p>
            ) : (
              <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <Field label="Matter title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Smith v. Jones" required autoFocus />
        </Field>
        <Field label="Practice area">
          <Input value={practiceArea} onChange={(e) => setPracticeArea(e.target.value)} placeholder="e.g. Family Law" />
        </Field>
        <Field label="Billing type">
          <Select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)}>
            <option value="hourly">Hourly</option>
            <option value="flat">Flat fee</option>
            <option value="contingency">Contingency</option>
          </Select>
        </Field>
        {billingType === "hourly" && (
          <Field label="Default rate ($/hr)">
            <Input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" />
          </Field>
        )}
        {billingType === "flat" && (
          <Field label="Flat fee ($)">
            <Input value={flatFee} onChange={(e) => setFlatFee(e.target.value)} inputMode="decimal" />
          </Field>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !clientId}>
            {saving ? "Creating…" : "Create matter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
