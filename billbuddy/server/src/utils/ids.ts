import { randomUUID } from "node:crypto";

export const newId = (): string => randomUUID();
export const nowISO = (): string => new Date().toISOString();
export const today = (): string => new Date().toISOString().slice(0, 10);

export function addDaysISO(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
