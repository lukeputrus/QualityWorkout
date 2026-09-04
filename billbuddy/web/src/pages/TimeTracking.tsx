import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTabs } from "../context/TabsContext";
import { formatDuration } from "../lib/format";
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { ClockIcon, PauseIcon, PlayIcon, PlusIcon, StopIcon, TrashIcon } from "../components/icons";
import { api } from "../api/client";
import type { Matter } from "@billbuddy/shared";

export default function TimeTracking() {
  const { tabs, liveSecondsFor, pauseTab, resumeTab, discardTab, closeTab, updateTab } = useTabs();
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const totalSeconds = tabs.reduce((sum, t) => sum + liveSecondsFor(t), 0);

  return (
    <div>
      <PageHeader
        title="Open Tabs"
        subtitle="Every matter you have a live timer running or paused on right now"
        actions={
          <Button onClick={() => setShowNew(true)}>
            <PlusIcon className="h-4 w-4" /> Open a tab
          </Button>
        }
      />

      <Card className="mb-6 flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-ink-600">
          <ClockIcon className="h-5 w-5" />
          <span className="text-sm">Total across {tabs.length} open tab{tabs.length === 1 ? "" : "s"}</span>
        </div>
        <span className="font-mono text-xl font-semibold tabular-nums text-ink-900">{formatDuration(totalSeconds)}</span>
      </Card>

      {tabs.length === 0 ? (
        <EmptyState title="No tabs open" hint="Open a tab from a matter's page, or use the button above, to start tracking time." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tabs.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="min-w-0">
                  <button className="truncate text-left font-medium text-ink-900 hover:text-brand-600" onClick={() => navigate(`/matters/${t.matterId}`)}>
                    {t.matterTitle}
                  </button>
                  <div className="text-xs text-ink-500">{t.clientName}</div>
                </div>
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.status === "running" ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
              </div>
              <input
                value={t.description}
                onChange={(e) => updateTab(t.id, { description: e.target.value })}
                placeholder="What are you working on?"
                className="mb-3 w-full rounded border-0 bg-ink-50 px-2 py-1 text-sm text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-semibold tabular-nums text-ink-900">{formatDuration(liveSecondsFor(t))}</span>
                <div className="flex gap-1">
                  {t.status === "running" ? (
                    <Button variant="secondary" onClick={() => pauseTab(t.id)}>
                      <PauseIcon className="h-4 w-4" /> Pause
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => resumeTab(t.id)}>
                      <PlayIcon className="h-4 w-4" /> Resume
                    </Button>
                  )}
                  <Button onClick={() => closeTab(t.id)}>
                    <StopIcon className="h-4 w-4" /> Bill it
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Discard this tab without billing ${formatDuration(liveSecondsFor(t))}?`)) discardTab(t.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showNew && <NewTabModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewTabModal({ onClose }: { onClose: () => void }) {
  const { openTab } = useTabs();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [matterId, setMatterId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.matters.list({ status: "open" }).then((r) => {
      setMatters(r.matters);
      if (r.matters.length > 0) setMatterId(r.matters[0].id);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!matterId) return;
    setSaving(true);
    try {
      await openTab(matterId, description);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Open a new tab" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Matter">
          <Select value={matterId} onChange={(e) => setMatterId(e.target.value)} required>
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What are you working on? (optional)">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !matterId}>
            {saving ? "Opening…" : "Open tab"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
