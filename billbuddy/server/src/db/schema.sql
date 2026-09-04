-- BillBuddy local database schema (SQLite).
-- All money is stored as integer cents. All timestamps are ISO-8601 text
-- (UTC). IDs are UUIDs (TEXT). This file is applied idempotently with
-- CREATE TABLE IF NOT EXISTS on every server start.

CREATE TABLE IF NOT EXISTS firms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'billbuddy_pro',
  subscription_status TEXT NOT NULL DEFAULT 'trialing',
  trial_ends_at TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 50000,
  tax_rate_percent REAL NOT NULL DEFAULT 0,
  trust_account_name TEXT,
  invoice_sequence INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'attorney',
  default_hourly_rate_cents INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  firm_id TEXT NOT NULL REFERENCES firms(id),
  device_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  label TEXT NOT NULL,
  paired_at TEXT NOT NULL,
  last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS pairing_codes (
  code TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  type TEXT NOT NULL DEFAULT 'individual',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS matters (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  practice_area TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  responsible_user_id TEXT REFERENCES users(id),
  billing_type TEXT NOT NULL DEFAULT 'hourly',
  flat_fee_amount_cents INTEGER,
  default_rate_cents INTEGER,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS tabs (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT NOT NULL REFERENCES matters(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'running',
  accumulated_seconds INTEGER NOT NULL DEFAULT 0,
  last_started_at TEXT,
  rate_override_cents INTEGER,
  billable INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT NOT NULL REFERENCES matters(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  rate_cents INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  billable INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'manual',
  invoice_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT NOT NULL REFERENCES matters(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  billable INTEGER NOT NULL DEFAULT 1,
  receipt_path TEXT,
  invoice_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id),
  type TEXT NOT NULL,
  time_entry_id TEXT,
  expense_id TEXT,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  rate_cents INTEGER NOT NULL DEFAULT 0,
  amount_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  invoice_id TEXT REFERENCES invoices(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL,
  reference TEXT,
  paid_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_accounts (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  client_id TEXT NOT NULL REFERENCES clients(id),
  matter_id TEXT REFERENCES matters(id),
  balance_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_transactions (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  trust_account_id TEXT NOT NULL REFERENCES trust_accounts(id),
  type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  memo TEXT,
  related_invoice_id TEXT,
  performed_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT REFERENCES matters(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  all_day INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  reminder_minutes INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT REFERENCES matters(id),
  assigned_to_user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  matter_id TEXT NOT NULL REFERENCES matters(id),
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matters_firm ON matters(firm_id);
CREATE INDEX IF NOT EXISTS idx_matters_client ON matters(client_id);
CREATE INDEX IF NOT EXISTS idx_tabs_firm_user ON tabs(firm_id, user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_matter ON time_entries(matter_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_invoice ON time_entries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_expenses_matter ON expenses(matter_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_trust_accounts_client ON trust_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_trust_transactions_account ON trust_transactions(trust_account_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_firm ON calendar_events(firm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_firm ON tasks(firm_id);
CREATE INDEX IF NOT EXISTS idx_documents_matter ON documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
