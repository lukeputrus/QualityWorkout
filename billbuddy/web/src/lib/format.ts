export { formatCurrencyCents, formatHours } from "@billbuddy/shared";

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function centsFromDollarsInput(value: string): number {
  const n = Number(value.replace(/[^0-9.-]/g, ""));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

export function dollarsInputFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
