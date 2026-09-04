import { useEffect, useState } from "react";
import { useTabs } from "../context/TabsContext";
import { api, type TabDto } from "../api/client";
import type { Matter } from "@billbuddy/shared";
import { formatDuration } from "../lib/format";
import { Button, Field, Input, Modal, Select } from "./ui";
import { PauseIcon, PlayIcon, PlusIcon, StopIcon, TrashIcon } from "./icons";

/** Always-visible strip of the attorney's currently open "tabs" - the
 * literal browser-tab metaphor the product is built around. Lives in the
 * app shell so it's on screen no matter which page you're looking at. */
export default function OpenTabsBar() {
  const { tabs, liveSecondsFor, pauseTab, resumeTab, discardTab, closeTab } = useTabs();
  const [showNewTab, setShowNewTab] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function withBusy(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="border-b border-ink-200 bg-white px-3 py-2 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-400">Open tabs</span>
        {tabs.length === 0 && <span className="shrink-0 text-xs text-ink-400">Nothing open right now</span>}
        {tabs.map((tab) => (
          <TabChip
            key={tab.id}
            tab={tab}
            seconds={liveSecondsFor(tab)}
            busy={busyId === tab.id}
            onPause={() => withBusy(tab.id, () => pauseTab(tab.id))}
            onResume={() => withBusy(tab.id, () => resumeTab(tab.id))}
            onDiscard={() => {
              if (confirm(`Discard this tab without billing ${formatDuration(liveSecondsFor(tab))}?`)) {
                withBusy(tab.id, () => discardTab(tab.id));
              }
            }}
            onClose={() => withBusy(tab.id, () => closeTab(tab.id))}
          />
        ))}
        <button
          onClick={() => setShowNewTab(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-500 hover:border-brand-400 hover:text-brand-600"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Open tab
        </button>
      </div>
      {showNewTab && <NewTabModal onClose={() => setShowNewTab(false)} />}
    </div>
  );
}

function TabChip({
  tab,
  seconds,
  busy,
  onPause,
  onResume,
  onDiscard,
  onClose,
}: {
  tab: TabDto;
  seconds: number;
  busy: boolean;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
  onClose: () => void;
}) {
  const running = tab.status === "running";
  return (
    <div
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        running ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
      <div className="max-w-[10rem] truncate font-medium text-ink-800" title={`${tab.clientName ?? ""} - ${tab.matterTitle ?? ""}`}>
        {tab.matterTitle ?? "Matter"}
      </div>
      <span className="font-mono tabular-nums text-ink-700">{formatDuration(seconds)}</span>
      <div className="flex items-center gap-0.5">
        {running ? (
          <IconBtn label="Pause" onClick={onPause} disabled={busy}>
            <PauseIcon className="h-3.5 w-3.5" />
          </IconBtn>
        ) : (
          <IconBtn label="Resume" onClick={onResume} disabled={busy}>
            <PlayIcon className="h-3.5 w-3.5" />
          </IconBtn>
        )}
        <IconBtn label="Close and bill" onClick={onClose} disabled={busy}>
          <StopIcon className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn label="Discard" onClick={onDiscard} disabled={busy}>
          <TrashIcon className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full p-1 text-ink-500 hover:bg-white hover:text-ink-900 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function NewTabModal({ onClose }: { onClose: () => void }) {
  const { openTab } = useTabs();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [matterId, setMatterId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      await openTab(matterId, description);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Open a new tab" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {error && <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}
        <Field label="Matter">
          {matters.length === 0 ? (
            <p className="text-xs text-ink-500">No open matters yet - create one first from the Matters page.</p>
          ) : (
            <Select value={matterId} onChange={(e) => setMatterId(e.target.value)} required>
              {matters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="What are you working on? (optional)">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Draft settlement letter" />
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
