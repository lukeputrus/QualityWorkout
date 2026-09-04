import { useEffect, useState } from "react";
import type { ArAgingRow, BillableHoursRow, TrustLiabilityRow } from "@billbuddy/shared";
import { api } from "../api/client";
import { formatCurrencyCents, formatHours } from "../lib/format";
import { Card, EmptyState, PageHeader } from "../components/ui";

const TABS = ["Billable Hours", "A/R Aging", "Trust Liability", "Revenue"] as const;

export default function Reports() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Billable Hours");

  return (
    <div>
      <PageHeader title="Reports" />
      <div className="mb-4 flex gap-1 rounded-lg bg-ink-100 p-1 text-sm w-fit overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 ${tab === t ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Billable Hours" && <BillableHoursReport />}
      {tab === "A/R Aging" && <ArAgingReport />}
      {tab === "Trust Liability" && <TrustLiabilityReport />}
      {tab === "Revenue" && <RevenueReport />}
    </div>
  );
}

function BillableHoursReport() {
  const [rows, setRows] = useState<BillableHoursRow[]>([]);
  useEffect(() => {
    api.reports.billableHours().then((r) => setRows(r.rows));
  }, []);
  if (rows.length === 0) return <EmptyState title="No time tracked yet" />;
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
          <tr>
            <th className="px-4 py-2 font-medium">Timekeeper</th>
            <th className="px-4 py-2 font-medium">Billable hours</th>
            <th className="px-4 py-2 font-medium">Non-billable hours</th>
            <th className="px-4 py-2 font-medium">Billed value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <tr key={r.userId}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{r.userName}</td>
              <td className="px-4 py-2.5 text-ink-600">{formatHours(r.billableSeconds)}</td>
              <td className="px-4 py-2.5 text-ink-500">{formatHours(r.nonBillableSeconds)}</td>
              <td className="px-4 py-2.5 text-ink-800">{formatCurrencyCents(r.billedAmountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ArAgingReport() {
  const [rows, setRows] = useState<ArAgingRow[]>([]);
  useEffect(() => {
    api.reports.arAging().then((r) => setRows(r.rows));
  }, []);
  if (rows.length === 0) return <EmptyState title="No outstanding invoices" hint="Nice - your receivables are clean." />;
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
          <tr>
            <th className="px-4 py-2 font-medium">Client</th>
            <th className="px-4 py-2 font-medium">Current</th>
            <th className="px-4 py-2 font-medium">1-30</th>
            <th className="px-4 py-2 font-medium">31-60</th>
            <th className="px-4 py-2 font-medium">61-90</th>
            <th className="px-4 py-2 font-medium">90+</th>
            <th className="px-4 py-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <tr key={r.clientId}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{r.clientName}</td>
              <td className="px-4 py-2.5 text-ink-500">{formatCurrencyCents(r.current)}</td>
              <td className="px-4 py-2.5 text-ink-500">{formatCurrencyCents(r.d1_30)}</td>
              <td className="px-4 py-2.5 text-amber-600">{formatCurrencyCents(r.d31_60)}</td>
              <td className="px-4 py-2.5 text-amber-700">{formatCurrencyCents(r.d61_90)}</td>
              <td className="px-4 py-2.5 font-medium text-red-600">{formatCurrencyCents(r.d90_plus)}</td>
              <td className="px-4 py-2.5 font-semibold text-ink-900">{formatCurrencyCents(r.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TrustLiabilityReport() {
  const [rows, setRows] = useState<TrustLiabilityRow[]>([]);
  useEffect(() => {
    api.reports.trustLiability().then((r) => setRows(r.rows));
  }, []);
  const total = rows.reduce((sum, r) => sum + r.balanceCents, 0);
  if (rows.length === 0) return <EmptyState title="No trust ledgers yet" />;
  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
          <tr>
            <th className="px-4 py-2 font-medium">Client</th>
            <th className="px-4 py-2 font-medium">Balance held</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r) => (
            <tr key={`${r.clientId}-${r.matterId ?? ""}`}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{r.clientName}</td>
              <td className="px-4 py-2.5 text-ink-800">{formatCurrencyCents(r.balanceCents)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-ink-200 bg-ink-50">
            <td className="px-4 py-2.5 font-semibold text-ink-900">Total held in trust</td>
            <td className="px-4 py-2.5 font-semibold text-ink-900">{formatCurrencyCents(total)}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

function RevenueReport() {
  const [rows, setRows] = useState<Array<{ month: string; totalCents: number }>>([]);
  useEffect(() => {
    api.reports.revenue().then((r) => setRows(r.rows));
  }, []);
  if (rows.length === 0) return <EmptyState title="No payments recorded yet" />;
  const max = Math.max(...rows.map((r) => r.totalCents), 1);
  return (
    <Card className="p-4">
      <div className="flex items-end gap-3" style={{ height: 200 }}>
        {rows.map((r) => (
          <div key={r.month} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="text-xs font-medium text-ink-700">{formatCurrencyCents(r.totalCents)}</div>
            <div className="w-full rounded-t bg-brand-500" style={{ height: `${Math.max(4, (r.totalCents / max) * 160)}px` }} />
            <div className="text-xs text-ink-500">{r.month}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
