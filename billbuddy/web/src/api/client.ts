import type {
  AuthedUser,
  Client,
  Matter,
  TimeEntry,
  Expense,
  Invoice,
  InvoiceLineItem,
  Payment,
  TrustAccount,
  TrustTransaction,
  CalendarEvent,
  TaskItem,
  MatterDocument,
  Device,
  User,
  Firm,
  ArAgingRow,
  BillableHoursRow,
  TrustLiabilityRow,
} from "@billbuddy/shared";

const TOKEN_KEY = "billbuddy_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, { method, headers, body: fetchBody });

  if (res.status === 401) {
    setToken(null);
    if (!location.pathname.startsWith("/login") && !location.pathname.startsWith("/pair")) {
      location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

/** A Tab as returned by the API, including the server-computed live
 * elapsed seconds (accounts for time passed since it was last started). */
/** A Matter as returned by list endpoints, with the client's name joined
 * in so pages don't need a separate lookup just to label a row. */
export interface MatterListItem extends Matter {
  clientName: string | null;
}

export interface TabDto {
  id: string;
  firmId: string;
  matterId: string;
  userId: string;
  description: string;
  status: "running" | "paused";
  accumulatedSeconds: number;
  lastStartedAt: string | null;
  rateOverrideCents: number | null;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
  liveElapsedSeconds: number;
  matterTitle: string | null;
  clientName: string | null;
}

export const api = {
  auth: {
    registerFirm: (data: { firmName: string; userName: string; email: string; password: string }) =>
      request<{ token: string }>("POST", "/auth/register-firm", data),
    login: (data: { email: string; password: string }) =>
      request<{ token: string }>("POST", "/auth/login", data),
    logout: () => request<void>("POST", "/auth/logout"),
    me: () => request<{ user: AuthedUser }>("GET", "/auth/me"),
    pairingCode: () => request<{ code: string; expiresAt: string; ttlMinutes: number }>("POST", "/auth/pairing-code"),
    pair: (data: { code: string; deviceLabel: string }) => request<{ token: string }>("POST", "/auth/pair", data),
    devices: () => request<{ devices: Device[] }>("GET", "/auth/devices"),
    unpairDevice: (id: string) => request<void>("DELETE", `/auth/devices/${id}`),
  },

  users: {
    list: () => request<{ users: User[] }>("GET", "/users"),
    create: (data: { name: string; email: string; password: string; role: string; defaultHourlyRateCents: number }) =>
      request<{ user: User }>("POST", "/users", data),
    update: (id: string, data: Partial<{ name: string; role: string; defaultHourlyRateCents: number; active: boolean }>) =>
      request<{ user: User }>("PATCH", `/users/${id}`, data),
  },

  firm: {
    get: () => request<{ firm: Firm }>("GET", "/firm"),
    update: (data: Partial<Pick<Firm, "name" | "address" | "phone" | "email" | "taxRatePercent" | "trustAccountName">>) =>
      request<{ firm: Firm }>("PATCH", "/firm", data),
    subscription: () =>
      request<{ plan: string; subscriptionStatus: string; monthlyPriceCents: number; trialEndsAt: string | null; trialDaysLeft: number | null }>(
        "GET",
        "/firm/subscription"
      ),
    simulateActivate: () => request<{ subscriptionStatus: string }>("POST", "/firm/subscription/simulate-activate"),
  },

  clients: {
    list: (q?: string) => request<{ clients: Client[] }>("GET", `/clients${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    get: (id: string) => request<{ client: Client }>("GET", `/clients/${id}`),
    create: (data: Partial<Client>) => request<{ client: Client }>("POST", "/clients", data),
    update: (id: string, data: Partial<Client>) => request<{ client: Client }>("PATCH", `/clients/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/clients/${id}`),
  },

  matters: {
    list: (params?: { status?: string; clientId?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ matters: MatterListItem[] }>("GET", `/matters${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<{ matter: Matter; client: Client; unbilledCents: number }>("GET", `/matters/${id}`),
    create: (data: Partial<Matter>) => request<{ matter: Matter }>("POST", "/matters", data),
    update: (id: string, data: Partial<Matter>) => request<{ matter: Matter }>("PATCH", `/matters/${id}`, data),
    conflictCheck: (q: string) =>
      request<{ clients: Array<{ id: string; name: string; type: string }>; matters: Array<{ id: string; title: string; status: string; client_name: string }> }>(
        "GET",
        `/matters/conflict-check?q=${encodeURIComponent(q)}`
      ),
  },

  tabs: {
    list: () => request<{ tabs: TabDto[] }>("GET", "/tabs"),
    open: (data: { matterId: string; description?: string; billable?: boolean }) =>
      request<{ tab: TabDto }>("POST", "/tabs", data),
    update: (id: string, data: Partial<{ description: string; billable: boolean; rateOverrideCents: number | null }>) =>
      request<{ tab: TabDto }>("PATCH", `/tabs/${id}`, data),
    pause: (id: string) => request<{ tab: TabDto }>("POST", `/tabs/${id}/pause`),
    resume: (id: string) => request<{ tab: TabDto }>("POST", `/tabs/${id}/resume`),
    discard: (id: string) => request<void>("DELETE", `/tabs/${id}`),
    close: (id: string) => request<{ timeEntry: TimeEntry }>("POST", `/tabs/${id}/close`),
  },

  timeEntries: {
    list: (params?: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ timeEntries: TimeEntry[] }>("GET", `/time-entries${qs ? `?${qs}` : ""}`);
    },
    create: (data: Partial<TimeEntry> & { matterId: string; durationSeconds: number }) =>
      request<{ timeEntry: TimeEntry }>("POST", "/time-entries", data),
    update: (id: string, data: Partial<TimeEntry>) => request<{ timeEntry: TimeEntry }>("PATCH", `/time-entries/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/time-entries/${id}`),
  },

  expenses: {
    list: (params?: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ expenses: Expense[] }>("GET", `/expenses${qs ? `?${qs}` : ""}`);
    },
    create: (data: Partial<Expense> & { matterId: string; description: string; amountCents: number }) =>
      request<{ expense: Expense }>("POST", "/expenses", data),
    update: (id: string, data: Partial<Expense>) => request<{ expense: Expense }>("PATCH", `/expenses/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/expenses/${id}`),
    uploadReceipt: (id: string, file: File) => {
      const form = new FormData();
      form.append("receipt", file);
      return request<{ expense: Expense }>("POST", `/expenses/${id}/receipt`, form);
    },
  },

  invoices: {
    list: (params?: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ invoices: Invoice[] }>("GET", `/invoices${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<{ invoice: Invoice & { lineItems: InvoiceLineItem[] }; client: Client }>("GET", `/invoices/${id}`),
    generate: (data: { clientId: string; matterIds?: string[] }) =>
      request<{ invoice: Invoice & { lineItems: InvoiceLineItem[] } }>("POST", "/invoices/generate", data),
    send: (id: string) => request<{ invoice: Invoice }>("POST", `/invoices/${id}/send`),
    void: (id: string) => request<{ invoice: Invoice }>("POST", `/invoices/${id}/void`),
    addLineItem: (id: string, data: { description: string; quantity?: number; rateCents: number; type?: "flat" | "custom" }) =>
      request<{ invoice: Invoice }>("POST", `/invoices/${id}/line-items`, data),
    removeLineItem: (id: string, lineItemId: string) => request<{ invoice: Invoice }>("DELETE", `/invoices/${id}/line-items/${lineItemId}`),
    pdfUrl: (id: string) => `/api/invoices/${id}/pdf`,
  },

  payments: {
    list: (params?: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ payments: Payment[] }>("GET", `/payments${qs ? `?${qs}` : ""}`);
    },
    create: (data: { invoiceId?: string | null; clientId: string; amountCents: number; method: string; reference?: string | null }) =>
      request<{ payment: Payment }>("POST", "/payments", data),
  },

  trust: {
    accounts: (clientId?: string) =>
      request<{ trustAccounts: TrustAccount[] }>("GET", `/trust/accounts${clientId ? `?clientId=${clientId}` : ""}`),
    createAccount: (data: { clientId: string; matterId?: string | null }) =>
      request<{ trustAccount: TrustAccount }>("POST", "/trust/accounts", data),
    transactions: (accountId: string) =>
      request<{ trustAccount: TrustAccount; transactions: TrustTransaction[] }>("GET", `/trust/accounts/${accountId}/transactions`),
    deposit: (accountId: string, data: { amountCents: number; memo?: string }) =>
      request<{ account: TrustAccount; transaction: TrustTransaction }>("POST", `/trust/accounts/${accountId}/deposit`, data),
    withdraw: (accountId: string, data: { amountCents: number; memo?: string }) =>
      request<{ account: TrustAccount; transaction: TrustTransaction }>("POST", `/trust/accounts/${accountId}/withdraw`, data),
    reconciliation: (bankBalanceCents: number) =>
      request<{
        bankBalanceCents: number;
        ledgerTotalCents: number;
        differenceCents: number;
        balanced: boolean;
        accounts: TrustLiabilityRow[];
      }>("GET", `/trust/reconciliation?bankBalanceCents=${bankBalanceCents}`),
  },

  calendarEvents: {
    list: (params?: { from?: string; to?: string; matterId?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ events: CalendarEvent[] }>("GET", `/calendar-events${qs ? `?${qs}` : ""}`);
    },
    create: (data: Partial<CalendarEvent> & { title: string; startAt: string; endAt: string }) =>
      request<{ event: CalendarEvent }>("POST", "/calendar-events", data),
    update: (id: string, data: Partial<CalendarEvent>) => request<{ event: CalendarEvent }>("PATCH", `/calendar-events/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/calendar-events/${id}`),
  },

  tasks: {
    list: (params?: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ tasks: TaskItem[] }>("GET", `/tasks${qs ? `?${qs}` : ""}`);
    },
    create: (data: Partial<TaskItem> & { title: string }) => request<{ task: TaskItem }>("POST", "/tasks", data),
    update: (id: string, data: Partial<TaskItem>) => request<{ task: TaskItem }>("PATCH", `/tasks/${id}`, data),
    remove: (id: string) => request<void>("DELETE", `/tasks/${id}`),
  },

  documents: {
    list: (matterId: string) => request<{ documents: MatterDocument[] }>("GET", `/documents?matterId=${matterId}`),
    upload: (matterId: string, file: File) => {
      const form = new FormData();
      form.append("matterId", matterId);
      form.append("file", file);
      return request<{ document: MatterDocument }>("POST", "/documents", form);
    },
    downloadUrl: (id: string) => `/api/documents/${id}/download`,
    remove: (id: string) => request<void>("DELETE", `/documents/${id}`),
  },

  reports: {
    dashboardSummary: () =>
      request<{
        openMattersCount: number;
        unbilledCents: number;
        outstandingArCents: number;
        trustBalanceCents: number;
        todaySecondsTracked: number;
        openTabsCount: number;
      }>("GET", "/reports/dashboard-summary"),
    billableHours: (params?: { dateFrom?: string; dateTo?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ rows: BillableHoursRow[] }>("GET", `/reports/billable-hours${qs ? `?${qs}` : ""}`);
    },
    arAging: () => request<{ rows: ArAgingRow[] }>("GET", "/reports/ar-aging"),
    trustLiability: () => request<{ rows: TrustLiabilityRow[] }>("GET", "/reports/trust-liability"),
    revenue: (params?: { dateFrom?: string; dateTo?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ rows: Array<{ month: string; totalCents: number }> }>("GET", `/reports/revenue${qs ? `?${qs}` : ""}`);
    },
  },
};
