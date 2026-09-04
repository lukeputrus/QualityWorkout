import express from "express";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { firmRouter } from "./routes/firm.js";
import { clientsRouter } from "./routes/clients.js";
import { mattersRouter } from "./routes/matters.js";
import { tabsRouter } from "./routes/tabs.js";
import { timeEntriesRouter } from "./routes/timeEntries.js";
import { expensesRouter } from "./routes/expenses.js";
import { invoicesRouter } from "./routes/invoices.js";
import { paymentsRouter } from "./routes/payments.js";
import { trustRouter } from "./routes/trust.js";
import { calendarEventsRouter } from "./routes/calendarEvents.js";
import { tasksRouter } from "./routes/tasks.js";
import { documentsRouter } from "./routes/documents.js";
import { reportsRouter } from "./routes/reports.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "billbuddy-server" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/firm", firmRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/matters", mattersRouter);
app.use("/api/tabs", tabsRouter);
app.use("/api/time-entries", timeEntriesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/trust", trustRouter);
app.use("/api/calendar-events", calendarEventsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/reports", reportsRouter);

// Production/LAN mode: the built web app (the same responsive UI used
// inside the Electron shell) is served directly from this server, so a
// phone on the firm's WiFi can open http://<this-machine-lan-ip>:PORT and
// use BillBuddy as an installable companion PWA with zero extra hosting.
const webDist = path.join(__dirname, "..", "..", "web", "dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

function lanAddresses(): string[] {
  const addresses: string[] = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal) addresses.push(addr.address);
    }
  }
  return addresses;
}

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`BillBuddy server listening on port ${PORT}`);
  console.log(`  Local:   http://localhost:${PORT}`);
  for (const ip of lanAddresses()) {
    console.log(`  Network: http://${ip}:${PORT}  (open this on a phone on the same WiFi to use the companion app)`);
  }
});
