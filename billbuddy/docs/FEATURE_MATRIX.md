# BillBuddy vs. Clio, MyCase, and QuickBooks

Clio, MyCase, and QuickBooks together represent well over a decade each of
engineering, compliance work, and integrations (live payment processing,
tax filing, e-signature, document automation, court-rules calendaring,
and more). Building a literal superset of all three in one pass isn't a
realistic claim, and this document exists so nobody has to guess where
BillBuddy actually stands - it says plainly what's implemented, what's
stubbed, and what's deliberately left as a roadmap item.

Legend: ✅ implemented and working · 🟡 partial / stubbed · ⬜ not built

| Feature area | Clio | MyCase | QuickBooks | BillBuddy | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Client & matter management | ✅ | ✅ | 🟡 | ✅ | Clients, matters, practice area, status, responsible attorney |
| Conflict-of-interest search | ✅ | 🟡 | ⬜ | ✅ | Name search across clients + matters (`/matters/conflict-check`) |
| Time tracking (timers) | ✅ | ✅ | 🟡 | ✅ | "Tabs" - open multiple concurrent timers per matter, pause/resume/close |
| Manual time entry | ✅ | ✅ | ✅ | ✅ | With configurable rounding (default 6-minute increments, rounds up) |
| Expense tracking | ✅ | ✅ | ✅ | ✅ | Billable/non-billable, receipt upload |
| Invoice generation from unbilled work | ✅ | ✅ | 🟡 | ✅ | Pulls unbilled time + expenses per client/matter into a draft invoice |
| Invoice PDF export | ✅ | ✅ | ✅ | ✅ | Generated server-side with pdfkit |
| Partial payments / payment history | ✅ | ✅ | ✅ | ✅ | Check, cash, credit card, ACH, or trust transfer |
| **Live payment processing** (charging a card) | ✅ | ✅ | ✅ | ⬜ | No bundled processor - see "What's intentionally not built" below |
| Client trust / IOLTA accounting | ✅ | ✅ | ⬜ | ✅ | Per-client ledgers, deposits/withdrawals, hard floor at $0 per client |
| Three-way trust reconciliation | ✅ | 🟡 | ⬜ | 🟡 | Ledger-total-vs-bank-statement check; no live bank feed |
| A/R aging report | ✅ | ✅ | ✅ | ✅ | Current / 1-30 / 31-60 / 61-90 / 90+ |
| Billable hours / productivity report | ✅ | ✅ | 🟡 | ✅ | By timekeeper, billable vs. non-billable |
| Revenue report | 🟡 | 🟡 | ✅ | ✅ | By month, from recorded payments |
| Calendar & deadlines | ✅ | ✅ | ⬜ | ✅ | Month view, matter-linked events |
| **Court-rules deadline calculators** | ✅ | 🟡 | ⬜ | ⬜ | Jurisdiction-specific rule engines are a substantial project on their own |
| Tasks | ✅ | ✅ | ⬜ | ✅ | Assignable, priority, due dates |
| Document storage (per matter) | ✅ | ✅ | 🟡 | ✅ | Upload/download/delete, stored on the local machine |
| **Document automation / templates & merge fields** | ✅ | 🟡 | ⬜ | ⬜ | Roadmap |
| **E-signature** | ✅ (add-on) | 🟡 | ⬜ | ⬜ | Roadmap - would integrate a third-party e-sign API |
| Client portal | ✅ | ✅ | 🟡 | 🟡 | The companion app covers phone access for staff; a client-facing portal is a roadmap item |
| Team roles & permissions | ✅ | ✅ | ✅ | 🟡 | Owner/attorney/paralegal/admin roles exist; fine-grained per-matter permissions are a roadmap item |
| **Payroll** | ⬜ | ⬜ | ✅ | ⬜ | Out of scope - this is legal-billing software, not a payroll system |
| **Tax filing / accountant integrations** | ⬜ | ⬜ | ✅ | ⬜ | Roadmap - likely as a QuickBooks/Xero export rather than reimplementing tax logic |
| Offline desktop install | ⬜ (cloud-only) | ⬜ (cloud-only) | 🟡 (has a desktop edition) | ✅ | The whole point of this build - see ARCHITECTURE.md |
| Companion mobile app | ✅ | ✅ | ✅ | ✅ | Installable PWA served over the firm's LAN by the same local server |

## What's intentionally not built, and why

- **Live payment processing.** Actually charging a client's card requires
  a real merchant account and processor credentials (Stripe, LawPay,
  etc.) that belong to the firm, not to this codebase. `POST
  /api/payments` records that a payment happened (for bookkeeping and
  invoice status), but nothing in this repo moves real money. Wiring a
  processor in is a matter of adding one integration at the point where
  a payment is recorded.
- **The $500/month subscription charge itself.** Same reasoning: BillBuddy
  is offline software with no backend of its own to bill through. The
  Settings → Subscription screen models the plan, trial period, and
  status, with a "simulate activation" button standing in for the real
  webhook a payment processor would send.
- **Court-rules deadline calculators, document automation, e-signature,
  payroll, tax filing.** Each of these is a substantial product area in
  its own right (jurisdiction-specific legal rule sets, a template/merge
  engine, e-sign vendor integration, full payroll compliance). They're
  left as clearly-scoped future work rather than faked with a shallow
  stub that would mislead someone into relying on it.
