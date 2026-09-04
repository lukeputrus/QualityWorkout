// Shared domain types for BillBuddy.
// Used by both the local API server and the web/companion UI so requests
// and responses are typed consistently on both sides of the LAN boundary.

export type UUID = string;
export type ISODateTime = string; // e.g. 2026-09-03T14:30:00.000Z
export type ISODate = string; // e.g. 2026-09-03

export type UserRole = "owner" | "attorney" | "paralegal" | "admin";

export interface Firm {
  id: UUID;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  plan: "billbuddy_pro";
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled";
  trialEndsAt: ISODateTime | null;
  monthlyPriceCents: number; // 50000 = $500.00
  taxRatePercent: number; // applied to invoices, 0 if not used
  trustAccountName: string | null; // e.g. "IOLTA - First National Bank"
  createdAt: ISODateTime;
}

export interface User {
  id: UUID;
  firmId: UUID;
  name: string;
  email: string;
  role: UserRole;
  defaultHourlyRateCents: number;
  active: boolean;
  createdAt: ISODateTime;
}

export type ClientType = "individual" | "organization";

export interface Client {
  id: UUID;
  firmId: UUID;
  type: ClientType;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: ISODateTime;
}

export type MatterStatus = "open" | "pending" | "closed";
export type BillingType = "hourly" | "flat" | "contingency";

export interface Matter {
  id: UUID;
  firmId: UUID;
  clientId: UUID;
  title: string;
  practiceArea: string | null;
  status: MatterStatus;
  responsibleUserId: UUID | null;
  billingType: BillingType;
  flatFeeAmountCents: number | null;
  defaultRateCents: number | null; // overrides user default rate for this matter
  openedAt: ISODateTime;
  closedAt: ISODateTime | null;
  notes: string | null;
}

/** A "Tab" is a live, in-progress working session on a matter - the literal
 * "tabs opened" concept from the product brief. It is ephemeral working
 * state; closing a tab converts its accumulated time into a permanent
 * TimeEntry on the billing ledger. */
export type TabStatus = "running" | "paused";

export interface Tab {
  id: UUID;
  firmId: UUID;
  matterId: UUID;
  userId: UUID;
  description: string;
  status: TabStatus;
  accumulatedSeconds: number;
  lastStartedAt: ISODateTime | null; // null when paused
  rateOverrideCents: number | null;
  billable: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TimeEntrySource = "tab" | "manual";

export interface TimeEntry {
  id: UUID;
  firmId: UUID;
  matterId: UUID;
  userId: UUID;
  description: string;
  date: ISODate;
  durationSeconds: number;
  rateCents: number;
  amountCents: number;
  billable: boolean;
  source: TimeEntrySource;
  invoiceId: UUID | null;
  createdAt: ISODateTime;
}

export interface Expense {
  id: UUID;
  firmId: UUID;
  matterId: UUID;
  userId: UUID;
  description: string;
  date: ISODate;
  amountCents: number;
  billable: boolean;
  receiptPath: string | null;
  invoiceId: UUID | null;
  createdAt: ISODateTime;
}

export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue" | "void";
export type InvoiceLineItemType = "time" | "expense" | "flat" | "custom";

export interface InvoiceLineItem {
  id: UUID;
  invoiceId: UUID;
  type: InvoiceLineItemType;
  timeEntryId: UUID | null;
  expenseId: UUID | null;
  description: string;
  quantity: number; // hours for time, 1 for flat/expense/custom
  rateCents: number;
  amountCents: number;
}

export interface Invoice {
  id: UUID;
  firmId: UUID;
  clientId: UUID;
  invoiceNumber: string;
  issueDate: ISODate;
  dueDate: ISODate;
  status: InvoiceStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  amountPaidCents: number;
  notes: string | null;
  createdAt: ISODateTime;
  lineItems?: InvoiceLineItem[];
}

export type PaymentMethod = "check" | "cash" | "credit_card" | "ach" | "trust_transfer";

export interface Payment {
  id: UUID;
  firmId: UUID;
  invoiceId: UUID | null;
  clientId: UUID;
  amountCents: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: ISODateTime;
  createdAt: ISODateTime;
}

export interface TrustAccount {
  id: UUID;
  firmId: UUID;
  clientId: UUID;
  matterId: UUID | null;
  balanceCents: number;
  createdAt: ISODateTime;
}

export type TrustTransactionType = "deposit" | "withdrawal" | "transfer_to_invoice";

export interface TrustTransaction {
  id: UUID;
  firmId: UUID;
  trustAccountId: UUID;
  type: TrustTransactionType;
  amountCents: number; // always positive; type determines direction
  memo: string | null;
  relatedInvoiceId: UUID | null;
  performedByUserId: UUID;
  createdAt: ISODateTime;
}

export interface CalendarEvent {
  id: UUID;
  firmId: UUID;
  matterId: UUID | null;
  userId: UUID;
  title: string;
  description: string | null;
  startAt: ISODateTime;
  endAt: ISODateTime;
  allDay: boolean;
  location: string | null;
  reminderMinutes: number | null;
  createdAt: ISODateTime;
}

export type TaskStatus = "open" | "in_progress" | "done";
export type TaskPriority = "low" | "normal" | "high";

export interface TaskItem {
  id: UUID;
  firmId: UUID;
  matterId: UUID | null;
  assignedToUserId: UUID | null;
  title: string;
  description: string | null;
  dueAt: ISODateTime | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: ISODateTime;
}

export interface MatterDocument {
  id: UUID;
  firmId: UUID;
  matterId: UUID;
  uploadedByUserId: UUID;
  filename: string;
  storedPath: string;
  sizeBytes: number;
  contentType: string;
  createdAt: ISODateTime;
}

/** A paired companion device (phone) that can reach this firm's local
 * server over the LAN. */
export interface Device {
  id: UUID;
  firmId: UUID;
  userId: UUID;
  label: string;
  pairedAt: ISODateTime;
  lastSeenAt: ISODateTime | null;
}

export interface Session {
  token: string;
  userId: UUID;
  firmId: UUID;
  deviceId: UUID | null; // set for companion-device sessions
  createdAt: ISODateTime;
  expiresAt: ISODateTime;
}

export interface AuthedUser extends User {
  firm: Firm;
}

export type AgingBucket = "current" | "1-30" | "31-60" | "61-90" | "90+";

export interface ArAgingRow {
  clientId: UUID;
  clientName: string;
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  d90_plus: number;
  totalCents: number;
}

export interface BillableHoursRow {
  userId: UUID;
  userName: string;
  billableSeconds: number;
  nonBillableSeconds: number;
  billedAmountCents: number;
}

export interface TrustLiabilityRow {
  clientId: UUID;
  clientName: string;
  matterId: UUID | null;
  balanceCents: number;
}
