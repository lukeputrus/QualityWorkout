import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type MatterListItem } from "../api/client";
import { Badge, Button, Card, EmptyState, PageHeader } from "../components/ui";
import { PlusIcon } from "../components/icons";
import NewMatterModal from "../components/NewMatterModal";

const STATUS_TABS = ["open", "pending", "closed", "all"] as const;

export default function Matters() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("open");
  const [matters, setMatters] = useState<MatterListItem[]>([]);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  async function load() {
    const { matters: rows } = await api.matters.list(status === "all" ? undefined : { status });
    setMatters(rows);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <PageHeader
        title="Matters"
        actions={
          <Button onClick={() => setShowNew(true)}>
            <PlusIcon className="h-4 w-4" /> New matter
          </Button>
        }
      />

      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 text-sm w-fit">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1.5 capitalize ${status === s ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {matters.length === 0 ? (
        <EmptyState title="No matters here" hint="Create a matter to start tracking time against it." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-2 font-medium">Matter</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Practice area</th>
                <th className="px-4 py-2 font-medium">Billing</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {matters.map((m) => (
                <tr key={m.id} className="cursor-pointer hover:bg-ink-50" onClick={() => navigate(`/matters/${m.id}`)}>
                  <td className="px-4 py-2.5 font-medium text-ink-800">{m.title}</td>
                  <td className="px-4 py-2.5 text-ink-500">{m.clientName}</td>
                  <td className="px-4 py-2.5 text-ink-500">{m.practiceArea ?? "—"}</td>
                  <td className="px-4 py-2.5 capitalize text-ink-500">{m.billingType}</td>
                  <td className="px-4 py-2.5">
                    <Badge>{m.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showNew && (
        <NewMatterModal
          onClose={() => setShowNew(false)}
          onCreated={(m) => {
            setShowNew(false);
            navigate(`/matters/${m.id}`);
          }}
        />
      )}
    </div>
  );
}
