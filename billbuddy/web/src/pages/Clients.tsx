import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Client, ClientType } from "@billbuddy/shared";
import { api } from "../api/client";
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from "../components/ui";
import { PlusIcon, SearchIcon } from "../components/icons";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  async function load(query = "") {
    const { clients: rows } = await api.clients.list(query);
    setClients(rows);
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Clients"
        actions={
          <Button onClick={() => setShowNew(true)}>
            <PlusIcon className="h-4 w-4" /> New client
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      {clients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add your first client to start opening matters." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {clients.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/clients/${c.id}`)}>
                  <td className="px-4 py-2.5 font-medium text-ink-800">{c.name}</td>
                  <td className="px-4 py-2.5 capitalize text-ink-500">{c.type}</td>
                  <td className="px-4 py-2.5 text-ink-500">{c.email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-500">{c.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showNew && (
        <NewClientModal
          onClose={() => setShowNew(false)}
          onCreated={(c) => {
            setShowNew(false);
            navigate(`/clients/${c.id}`);
          }}
        />
      )}
    </div>
  );
}

function NewClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Client) => void }) {
  const [type, setType] = useState<ClientType>("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { client } = await api.clients.create({
        type,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
      });
      onCreated(client);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New client" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        <Field label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as ClientType)}>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </Select>
        </Field>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Field label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Notes">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
