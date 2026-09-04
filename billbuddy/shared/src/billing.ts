// Pure, unit-testable billing math shared by the server (source of truth)
// and the UI (for live previews before a request round-trip). No I/O here.

import type { AgingBucket, InvoiceLineItem } from "./types.js";

/** Standard legal-billing rounding: round a raw duration up to the nearest
 * billing increment (default 6 minutes = 0.1 hour, the industry-standard
 * "tenth of an hour" increment used by Clio/MyCase). Always rounds UP,
 * matching how legal timekeeping software protects against undercounting
 * partial units - never round in the firm's favor by truncating. */
export function roundDurationSeconds(
  rawSeconds: number,
  incrementMinutes = 6
): number {
  if (rawSeconds <= 0) return 0;
  const incrementSeconds = incrementMinutes * 60;
  return Math.ceil(rawSeconds / incrementSeconds) * incrementSeconds;
}

export function secondsToHours(seconds: number): number {
  return seconds / 3600;
}

/** amountCents for a time entry: hours (rounded) * hourly rate in cents. */
export function computeTimeAmountCents(
  durationSeconds: number,
  rateCents: number,
  incrementMinutes = 6
): number {
  const roundedSeconds = roundDurationSeconds(durationSeconds, incrementMinutes);
  const hours = secondsToHours(roundedSeconds);
  return Math.round(hours * rateCents);
}

export function formatCurrencyCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );
}

export function formatHours(seconds: number): string {
  return secondsToHours(seconds).toFixed(1);
}

export interface InvoiceTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeInvoiceTotals(
  lineItems: Pick<InvoiceLineItem, "amountCents">[],
  taxRatePercent = 0
): InvoiceTotals {
  const subtotalCents = lineItems.reduce((sum, li) => sum + li.amountCents, 0);
  const taxCents = Math.round((subtotalCents * taxRatePercent) / 100);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export function computeBalanceDueCents(invoice: {
  totalCents: number;
  amountPaidCents: number;
}): number {
  return Math.max(0, invoice.totalCents - invoice.amountPaidCents);
}

/** Buckets an outstanding invoice by days past its due date, for AR aging
 * reports (a QuickBooks/Clio staple). */
export function computeAgingBucket(
  dueDate: string,
  asOfDate: Date = new Date()
): AgingBucket {
  const due = new Date(dueDate);
  const diffDays = Math.floor(
    (asOfDate.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return "current";
  if (diffDays <= 30) return "1-30";
  if (diffDays <= 60) return "31-60";
  if (diffDays <= 90) return "61-90";
  return "90+";
}

/** Realization rate: how much of the value actually worked was actually
 * billed out (a core profitability metric in legal billing software). */
export function computeRealizationRate(
  billedAmountCents: number,
  workedValueCents: number
): number {
  if (workedValueCents <= 0) return 0;
  return billedAmountCents / workedValueCents;
}

export class InsufficientTrustBalanceError extends Error {
  constructor(availableCents: number, requestedCents: number) {
    super(
      `Trust withdrawal of ${formatCurrencyCents(
        requestedCents
      )} exceeds available balance of ${formatCurrencyCents(availableCents)}`
    );
    this.name = "InsufficientTrustBalanceError";
  }
}

/** Core IOLTA safeguard: a client's trust ledger may never go negative.
 * Every withdrawal/transfer must be checked against this before it is
 * committed - overdrawing a single client's trust ledger (even if the
 * pooled bank account has funds from other clients) is a serious bar
 * compliance violation. */
export function assertSufficientTrustBalance(
  availableCents: number,
  requestedCents: number
): void {
  if (requestedCents > availableCents) {
    throw new InsufficientTrustBalanceError(availableCents, requestedCents);
  }
}

export function applyTrustTransaction(
  currentBalanceCents: number,
  type: "deposit" | "withdrawal" | "transfer_to_invoice",
  amountCents: number
): number {
  if (type === "deposit") return currentBalanceCents + amountCents;
  assertSufficientTrustBalance(currentBalanceCents, amountCents);
  return currentBalanceCents - amountCents;
}

/** Generates the next sequential invoice number for a firm, e.g. INV-1007.
 * Pure given the current max sequence; the server is responsible for
 * reading that value transactionally so numbers never collide. */
export function nextInvoiceNumber(currentMaxSequence: number): string {
  return `INV-${1000 + currentMaxSequence + 1}`;
}
