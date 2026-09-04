# BillBuddy

Offline, downloadable time tracking, billing, and trust accounting
software for law firms - with a phone companion app for logging time on
the go. $500/month per firm, no per-seat pricing.

BillBuddy covers the core of what Clio, MyCase, and QuickBooks overlap on
for a firm's billing workflow - it does not claim to be a full replacement
for all three. **Read [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md)
first** for an honest, feature-by-feature comparison of what's built, what's
stubbed, and what's deliberately out of scope (live payment processing,
e-signature, payroll, tax filing, court-rules deadline engines).

## The idea

Every open matter gets its own **tab** - literally, like a browser tab.
Open one when you start work on a matter, switch between several through
the day, pause the ones you step away from, and when you're done, close
the tab: its accumulated time becomes a permanent billing entry. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how that's modeled.

There's no cloud service. The desktop app *is* the server - a phone on the
firm's WiFi pairs to it and becomes the companion app, installable to a
home screen as a PWA. Nothing about billing data ever leaves the firm's
own machine.

## Features

- **Time tracking** - concurrent "tabs" (live timers) per matter, plus
  manual entry, with standard 6-minute-increment rounding
- **Client & matter management** - individuals or organizations, practice
  areas, billing type (hourly/flat/contingency), conflict-of-interest search
- **Expense tracking** - billable/non-billable, with receipt uploads
- **Invoicing** - generate a draft invoice from a client's unbilled time and
  expenses, add custom line items, export a PDF, track partial payments
- **Trust (IOLTA) accounting** - per-client ledgers that can never be
  overdrawn, deposit/withdrawal/transfer-to-invoice, three-way
  reconciliation against a bank statement balance
- **Reports** - billable hours by timekeeper, A/R aging, trust liability,
  revenue by month
- **Calendar & tasks** - matter-linked deadlines and to-dos
- **Document storage** - upload/download files per matter
- **Companion app** - pair a phone over LAN (no password typed on the
  phone) to track time and expenses from anywhere in the office

## Quick start

Requires Node.js 20+.

```bash
npm install                          # installs all workspaces
npm run build:shared                 # compiles shared/ (required once, and after editing it)
npm run seed --workspace=server      # creates a demo firm + sample data
npm run dev                          # runs the API server and the web UI together
```

Then open **http://localhost:5173** and log in with the seeded demo
account: `demo@billbuddy.test` / `password123`.

To try the companion app, run `npm run dev:server` on its own (so it's
reachable on your LAN IP, not just localhost) and open
`http://<your-machine's-LAN-IP>:4000/pair` on your phone, having generated
a pairing code from Settings → Companion App on the desktop UI first.

### Building the real offline installer

```bash
npm run build                              # shared, server, web
npm run dist --workspace=desktop-shell     # packages an Electron installer
```

This packaging step needs a machine with normal internet access (to fetch
Electron's binary) and a display toolchain appropriate to the target OS -
see the "Known limitation" note in `docs/ARCHITECTURE.md` for exactly what
was and wasn't exercised while building this in a sandboxed environment.

## Project layout

```
shared/         framework-free types + billing math, shared by server and web
server/         Express API + SQLite database (the whole backend)
web/            React UI - desktop layout and phone/companion layout in one app
desktop-shell/  Electron wrapper that packages the above as an offline app
docs/           architecture notes and the feature-comparison matrix
```

## Security notes

- Passwords are hashed with bcrypt; sessions are opaque tokens, not JWTs.
- All money is stored and computed as integer cents - never floating point.
- `npm audit` is clean for runtime dependencies. The remaining flagged
  vulnerabilities live inside `electron-builder`'s own build tooling
  (`node-gyp` → `make-fetch-happen` → `cacache`/`tar`), which runs only on
  a developer's machine at packaging time and is never shipped to or
  reachable by an end user.
- There is no bundled payment processor - see `docs/FEATURE_MATRIX.md`.
