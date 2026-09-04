import { test } from "node:test";
import assert from "node:assert/strict";
import {
  roundDurationSeconds,
  computeTimeAmountCents,
  computeInvoiceTotals,
  computeBalanceDueCents,
  computeAgingBucket,
  computeRealizationRate,
  applyTrustTransaction,
  assertSufficientTrustBalance,
  InsufficientTrustBalanceError,
  nextInvoiceNumber,
  formatCurrencyCents,
} from "./billing.js";

test("roundDurationSeconds rounds up to the nearest 6-minute increment", () => {
  assert.equal(roundDurationSeconds(1), 360); // 1 second -> 0.1h
  assert.equal(roundDurationSeconds(360), 360); // exactly on the line
  assert.equal(roundDurationSeconds(361), 720); // just over -> next increment
  assert.equal(roundDurationSeconds(0), 0);
});

test("computeTimeAmountCents multiplies rounded hours by rate", () => {
  // 400 raw seconds -> rounds up to 720s (0.2h) at $300/hr (30000 cents)
  assert.equal(computeTimeAmountCents(400, 30000), 6000);
});

test("computeInvoiceTotals sums line items and applies tax", () => {
  const totals = computeInvoiceTotals(
    [{ amountCents: 10000 }, { amountCents: 5000 }],
    8.25
  );
  assert.equal(totals.subtotalCents, 15000);
  assert.equal(totals.taxCents, 1238); // round(15000 * 0.0825)
  assert.equal(totals.totalCents, 16238);
});

test("computeBalanceDueCents never goes negative", () => {
  assert.equal(
    computeBalanceDueCents({ totalCents: 1000, amountPaidCents: 1500 }),
    0
  );
  assert.equal(
    computeBalanceDueCents({ totalCents: 1000, amountPaidCents: 400 }),
    600
  );
});

test("computeAgingBucket buckets by days past due", () => {
  const asOf = new Date("2026-09-03T00:00:00.000Z");
  assert.equal(computeAgingBucket("2026-09-10", asOf), "current");
  assert.equal(computeAgingBucket("2026-08-20", asOf), "1-30");
  assert.equal(computeAgingBucket("2026-07-20", asOf), "31-60");
  assert.equal(computeAgingBucket("2026-05-01", asOf), "90+");
});

test("computeRealizationRate divides billed by worked value", () => {
  assert.equal(computeRealizationRate(8000, 10000), 0.8);
  assert.equal(computeRealizationRate(100, 0), 0);
});

test("trust ledger never goes negative", () => {
  assert.equal(applyTrustTransaction(10000, "deposit", 5000), 15000);
  assert.equal(applyTrustTransaction(10000, "withdrawal", 4000), 6000);
  assert.throws(
    () => applyTrustTransaction(10000, "withdrawal", 10001),
    InsufficientTrustBalanceError
  );
  assert.throws(() => assertSufficientTrustBalance(500, 501));
});

test("nextInvoiceNumber is sequential and prefixed", () => {
  assert.equal(nextInvoiceNumber(0), "INV-1001");
  assert.equal(nextInvoiceNumber(6), "INV-1007");
});

test("formatCurrencyCents formats as USD", () => {
  assert.equal(formatCurrencyCents(50000), "$500.00");
});
