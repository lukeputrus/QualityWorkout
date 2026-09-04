import { useEffect, useState } from "react";
import type { Matter, TaskItem, TaskPriority, TaskStatus, User } from "@billbuddy/shared";
import { api } from "../api/client";
import { formatDateTime } from "../lib/format";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { PlusIcon, TrashIcon } from "../components/icons";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function load() {
    const { tasks: rows } = await api.tasks.list();
    setTasks(rows);
    const { users: u } = await api.users.list();
    setUsers(u);
  }

  useEffect(() => {
    load();
  }, []);

  async function cycleStatus(t: TaskItem) {
    const next: TaskStatus = t.status === "open" ? "in_progress" : t.status === "in_progress" ? "done" : "open";
    await api.tasks.update(t.id, { status: next });
    load();
  }

  async function remove(id: string) {
    await api.tasks.remove(id);
    load();
  }

  const visible = tasks.filter((t) => showDone || t.status !== "done");

  return (
    <div>
      <PageHeader
        title="Tasks"
        actions={
          <>
            <label className="flex items-center gap-1.5 text-sm text-ink-600">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show done
            </label>
            <Button onClick={() => setShowNew(true)}>
              <PlusIcon className="h-4 w-4" /> New task
            </Button>
          </>
        }
      />

      {visible.length === 0 ? (
        <EmptyState title="No tasks" />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {visible.map((t) => {
              const assignee = users.find((u) => u.id === t.assignedToUserId);
              return (
                <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => cycleStatus(t)}
                      className={`h-5 w-5 shrink-0 rounded border ${
                        t.status === "done" ? "border-emerald-500 bg-emerald-500" : t.status === "in_progress" ? "border-amber-500 bg-amber-100" : "border-ink-300"
                      }`}
                      aria-label="Toggle status"
                    />
                    <div>
                      <div className={t.status === "done" ? "text-ink-400 line-through" : "text-ink-800"}>{t.title}</div>
                      <div className="text-xs text-ink-500">
                        {assignee?.name ?? "Unassigned"} {t.dueAt && `· due ${formatDateTime(t.dueAt)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{t.priority}</Badge>
                    <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {showNew && (
        <NewTaskModal
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

function NewTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [matterId, setMatterId] = useState("");
  const [matters, setMatters] = useState<Matter[]>([]);
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.matters.list().then((r) => setMatters(r.matters));
    api.users.list().then((r) => setUsers(r.users));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.tasks.create({
        title,
        matterId: matterId || null,
        assignedToUserId: assignedToUserId || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        priority,
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </Field>
        <Field label="Related matter (optional)">
          <Select value={matterId} onChange={(e) => setMatterId(e.target.value)}>
            <option value="">None</option>
            {matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assign to">
            <Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>
        <Field label="Due (optional)">
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
