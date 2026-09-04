// Seeds a demo firm so the app can be explored immediately after install.
// Run with: npm run seed --workspace=server
import { db } from "./index.js";
import { newId, nowISO, today, addDaysISO } from "../utils/ids.js";
import { hashPassword } from "../utils/auth.js";
import { computeTimeAmountCents } from "@billbuddy/shared";

const DEMO_EMAIL = "demo@billbuddy.test";
const DEMO_PASSWORD = "password123";

const already = db.prepare("SELECT id FROM users WHERE email = ?").get(DEMO_EMAIL);
if (already) {
  console.log(`Demo firm already seeded. Login with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  process.exit(0);
}

const firmId = newId();
const ownerId = newId();
const paralegalId = newId();
const now = nowISO();

db.prepare(
  `INSERT INTO firms (id, name, address, phone, email, plan, subscription_status, trial_ends_at, monthly_price_cents, tax_rate_percent, trust_account_name, invoice_sequence, created_at)
   VALUES (?, 'Putrus & Associates', '123 Main St, Springfield, IL', '(555) 010-2020', 'hello@putruslaw.test', 'billbuddy_pro', 'trialing', ?, 50000, 0, 'IOLTA - First National Bank', 0, ?)`
).run(firmId, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), now);

db.prepare(
  `INSERT INTO users (id, firm_id, name, email, password_hash, role, default_hourly_rate_cents, active, created_at) VALUES (?, ?, 'Luke Putrus', ?, ?, 'owner', 35000, 1, ?)`
).run(ownerId, firmId, DEMO_EMAIL, hashPassword(DEMO_PASSWORD), now);

db.prepare(
  `INSERT INTO users (id, firm_id, name, email, password_hash, role, default_hourly_rate_cents, active, created_at) VALUES (?, ?, 'Jordan Reyes', 'paralegal@billbuddy.test', ?, 'paralegal', 15000, 1, ?)`
).run(paralegalId, firmId, hashPassword(DEMO_PASSWORD), now);

function client(name: string, type: "individual" | "organization", email: string) {
  const id = newId();
  db.prepare(
    `INSERT INTO clients (id, firm_id, type, name, email, phone, address, notes, created_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`
  ).run(id, firmId, type, name, email, now);
  return id;
}

const acmeId = client("Acme Manufacturing Inc.", "organization", "ap@acme.test");
const doeId = client("Jane Doe", "individual", "jane.doe@example.test");

function matter(clientId: string, title: string, practiceArea: string, rateCents: number) {
  const id = newId();
  db.prepare(
    `INSERT INTO matters (id, firm_id, client_id, title, practice_area, status, responsible_user_id, billing_type, flat_fee_amount_cents, default_rate_cents, opened_at, closed_at, notes)
     VALUES (?, ?, ?, ?, ?, 'open', ?, 'hourly', NULL, ?, ?, NULL, NULL)`
  ).run(id, firmId, clientId, title, practiceArea, ownerId, rateCents, today());
  return id;
}

const acmeMatterId = matter(acmeId, "Acme v. Beta Supply Contract Dispute", "Commercial Litigation", 45000);
const doeMatterId = matter(doeId, "Doe Estate Planning", "Estate Planning", 30000);

function timeEntry(matterId: string, description: string, hours: number, rateCents: number, daysAgo: number) {
  const id = newId();
  const durationSeconds = Math.round(hours * 3600);
  db.prepare(
    `INSERT INTO time_entries (id, firm_id, matter_id, user_id, description, date, duration_seconds, rate_cents, amount_cents, billable, source, invoice_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'manual', NULL, ?)`
  ).run(id, firmId, matterId, ownerId, description, addDaysISO(today(), -daysAgo), durationSeconds, rateCents, computeTimeAmountCents(durationSeconds, rateCents), now);
}

timeEntry(acmeMatterId, "Draft and review breach-of-contract complaint", 3.2, 45000, 6);
timeEntry(acmeMatterId, "Client strategy call re: settlement posture", 0.8, 45000, 4);
timeEntry(doeMatterId, "Draft revocable trust and pour-over will", 2.5, 30000, 3);

const trustId = newId();
db.prepare(
  `INSERT INTO trust_accounts (id, firm_id, client_id, matter_id, balance_cents, created_at) VALUES (?, ?, ?, ?, 500000, ?)`
).run(trustId, firmId, doeId, doeMatterId, now);
db.prepare(
  `INSERT INTO trust_transactions (id, firm_id, trust_account_id, type, amount_cents, memo, related_invoice_id, performed_by_user_id, created_at)
   VALUES (?, ?, ?, 'deposit', 500000, 'Initial retainer', NULL, ?, ?)`
).run(newId(), firmId, trustId, ownerId, now);

console.log("Seeded demo firm 'Putrus & Associates'.");
console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
