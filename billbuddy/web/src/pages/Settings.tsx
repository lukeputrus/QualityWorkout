import { useEffect, useState } from "react";
import type { Device, User, UserRole } from "@billbuddy/shared";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { centsFromDollarsInput, formatCurrencyCents, formatDateTime } from "../lib/format";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { PlusIcon, SmartphoneIcon, TrashIcon } from "../components/icons";

export default function Settings() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState<"firm" | "team" | "subscription" | "companion">("firm");

  return (
    <div>
      <PageHeader title="Settings" subtitle={user?.firm.name} />
      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 text-sm w-fit">
        {(["firm", "team", "subscription", "companion"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 capitalize ${tab === t ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "firm" && <FirmSettings onSaved={refresh} />}
      {tab === "team" && <TeamSettings />}
      {tab === "subscription" && <SubscriptionSettings />}
      {tab === "companion" && <CompanionSettings />}
    </div>
  );
}

function FirmSettings({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.firm.name ?? "");
  const [address, setAddress] = useState(user?.firm.address ?? "");
  const [phone, setPhone] = useState(user?.firm.phone ?? "");
  const [email, setEmail] = useState(user?.firm.email ?? "");
  const [taxRate, setTaxRate] = useState(String(user?.firm.taxRatePercent ?? 0));
  const [trustAccountName, setTrustAccountName] = useState(user?.firm.trustAccountName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.firm.update({
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        taxRatePercent: Number(taxRate) || 0,
        trustAccountName: trustAccountName || null,
      });
      onSaved();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-lg p-4">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Firm name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Field label="Default invoice tax rate (%)">
          <Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="Trust account name">
          <Input value={trustAccountName} onChange={(e) => setTrustAccountName(e.target.value)} placeholder="e.g. IOLTA - First National Bank" />
        </Field>
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-xs text-emerald-600">Saved</span>}
        </div>
      </form>
    </Card>
  );
}

function TeamSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    const { users: rows } = await api.users.list();
    setUsers(rows);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(u: User) {
    await api.users.update(u.id, { active: !u.active });
    load();
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button onClick={() => setShowNew(true)}>
          <PlusIcon className="h-4 w-4" /> Add teammate
        </Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Default rate</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5 font-medium text-ink-800">{u.name}</td>
                <td className="px-4 py-2.5 text-ink-500">{u.email}</td>
                <td className="px-4 py-2.5 capitalize text-ink-500">{u.role}</td>
                <td className="px-4 py-2.5 text-ink-500">{formatCurrencyCents(u.defaultHourlyRateCents)}/hr</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => toggleActive(u)}>
                    <Badge>{u.active ? "active" : "canceled"}</Badge>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showNew && (
        <NewUserModal
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

function NewUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("attorney");
  const [rate, setRate] = useState("300.00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.users.create({ name, email, password, role, defaultHourlyRateCents: centsFromDollarsInput(rate) });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add teammate" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Temporary password">
          <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="attorney">Attorney</option>
              <option value="paralegal">Paralegal</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </Select>
          </Field>
          <Field label="Default rate ($/hr)">
            <Input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add teammate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SubscriptionSettings() {
  const [sub, setSub] = useState<Awaited<ReturnType<typeof api.firm.subscription>> | null>(null);

  async function load() {
    setSub(await api.firm.subscription());
  }
  useEffect(() => {
    load();
  }, []);

  async function activate() {
    await api.firm.simulateActivate();
    load();
  }

  if (!sub) return null;

  return (
    <Card className="max-w-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-ink-900">BillBuddy Pro</div>
          <div className="text-sm text-ink-500">{formatCurrencyCents(sub.monthlyPriceCents)}/month, billed per firm</div>
        </div>
        <Badge>{sub.subscriptionStatus}</Badge>
      </div>
      {sub.subscriptionStatus === "trialing" && sub.trialDaysLeft !== null && (
        <p className="mb-3 text-sm text-ink-600">{sub.trialDaysLeft} day(s) left in your free trial.</p>
      )}
      <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
        BillBuddy is offline software with no bundled payment processor. In a real deployment this screen collects a
        card via your payment processor of choice (e.g. Stripe Billing) and a webhook flips your subscription to
        active. The button below just simulates that for this local install.
      </div>
      {sub.subscriptionStatus !== "active" && (
        <Button className="mt-3" onClick={activate}>
          Simulate activation
        </Button>
      )}
    </Card>
  );
}

function CompanionSettings() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [pairing, setPairing] = useState<{ code: string; expiresAt: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  async function load() {
    const { devices: rows } = await api.auth.devices();
    setDevices(rows);
  }
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!pairing) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((new Date(pairing.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) setPairing(null);
    }, 1000);
    return () => clearInterval(id);
  }, [pairing]);

  async function generateCode() {
    const result = await api.auth.pairingCode();
    setPairing(result);
  }

  async function unpair(id: string) {
    await api.auth.unpairDevice(id);
    load();
  }

  const lanHint = `${location.protocol}//${location.hostname}:${location.port || "4000"}/pair`;

  return (
    <div className="space-y-4">
      <Card className="max-w-lg p-4">
        <h2 className="mb-1 font-semibold text-ink-900">Pair a phone</h2>
        <p className="mb-3 text-xs text-ink-500">
          On your phone (connected to the same office WiFi), open <span className="font-mono">{lanHint}</span> and enter the
          code below.
        </p>
        {pairing ? (
          <div className="rounded-lg bg-brand-50 p-4 text-center">
            <div className="font-mono text-3xl tracking-[0.4em] text-brand-700">{pairing.code}</div>
            <div className="mt-1 text-xs text-brand-600">Expires in {secondsLeft}s</div>
          </div>
        ) : (
          <Button onClick={generateCode}>
            <SmartphoneIcon className="h-4 w-4" /> Generate pairing code
          </Button>
        )}
      </Card>

      <Card className="max-w-lg p-4">
        <h2 className="mb-2 font-semibold text-ink-900">Paired devices</h2>
        {devices.length === 0 ? (
          <p className="text-sm text-ink-500">No devices paired yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100 text-sm">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-ink-800">{d.label}</div>
                  <div className="text-xs text-ink-500">
                    Paired {formatDateTime(d.pairedAt)} {d.lastSeenAt && `· last seen ${formatDateTime(d.lastSeenAt)}`}
                  </div>
                </div>
                <button onClick={() => unpair(d.id)} className="text-ink-400 hover:text-red-600">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
