# Architecture

BillBuddy is built around one idea: **the desktop app is the server.**
There is no cloud backend. Everything - the database, the API, the UI - runs
on the machine the firm installs it on, and the "companion app" is just a
phone opening a web page served by that same machine over the office WiFi.

```
                      ┌─────────────────────────────────────────┐
                      │            Desktop machine               │
                      │                                           │
                      │  ┌───────────┐      ┌──────────────────┐ │
electron shell ─loads→│  │  React UI │◄────►│  Express API      │ │
(desktop-shell/)      │  │  (web/)   │ fetch │  (server/)        │ │
                      │  └───────────┘      │  + better-sqlite3  │ │
                      │                     │  (billbuddy.db)    │ │
                      │                     └──────────────────┘ │
                      │                            ▲              │
                      └────────────────────────────┼──────────────┘
                                                    │ same LAN,
                                       http://<lan-ip>:4000
                                                    │
                                          ┌─────────┴─────────┐
                                          │   Phone browser     │
                                          │  (installed as a     │
                                          │   PWA - "companion")│
                                          └─────────────────────┘
```

## Packages (npm workspaces)

- **`shared/`** - Framework-free TypeScript: domain types (`Client`,
  `Matter`, `Invoice`, ...) and pure billing math (rounding, invoice
  totals, aging buckets, the trust-ledger-can't-go-negative rule). No I/O.
  Both `server` and `web` depend on it so the money math is defined
  exactly once. Consumed as compiled output (`npm run build --workspace=shared`)
  so plain Node can load it without a TypeScript loader at runtime.
- **`server/`** - Express + better-sqlite3. Owns the database and all
  business logic (auth, invoicing, trust accounting, reports). Serves
  `/api/*`, and in production also serves `web`'s built static files, so
  a single process on a single port is the entire application.
- **`web/`** - One React app, two audiences. A responsive layout switches
  between a full desktop sidebar and a phone-sized bottom-nav/companion
  view at the same breakpoint Tailwind uses for `md:`. It's loaded inside
  the Electron shell *and* served to phones on the LAN - there is
  deliberately only one frontend codebase to keep in sync.
- **`desktop-shell/`** - A thin Electron wrapper: it starts the compiled
  `server` in-process (`app.getPath('userData')` for the SQLite file) and
  opens a `BrowserWindow` onto `http://localhost:4000`. See "Known
  limitation" below.

## Why this shape

- **"Offline downloadable software"** rules out a multi-tenant cloud
  service. Running the real server on the user's own machine, rather than
  faking offline support on top of a hosted backend, is what actually
  satisfies that requirement.
- **A companion app without a second codebase.** Because the phone talks
  to the exact same API the desktop UI does, "the companion app" is a
  deployment target, not a rewrite. Pairing a phone (Settings → Companion
  App generates a 6-digit code) creates a device-scoped session token,
  the same auth mechanism the desktop UI uses - just handed out over a
  more phone-friendly flow than typing a firm password on a phone
  keyboard.
- **SQLite via better-sqlite3.** Synchronous, zero-config, one file,
  battle-tested inside Electron apps. There's no separate database server
  to install or for the firm to manage.
- **Money as integer cents, everywhere.** No floating point ever touches
  a dollar amount, from the SQL schema up through the shared billing math
  to the UI's `formatCurrencyCents`.

## The "tabs" model

The product brief's "track tabs opened" is modeled literally:

- A **`Tab`** (`tabs` table) is a *live, in-progress* timer on a matter -
  ephemeral working state. You can have several open at once, pause the
  ones you're not actively on, and each keeps accumulating time
  independently, the same way browser tabs stay open in the background.
- Closing a tab converts its accumulated time into a **`TimeEntry`** - a
  permanent row on the billing ledger with a resolved rate and computed
  amount. Once that happens the tab is gone; the time entry is what
  invoicing, reports, and history all read from.
- Discarding a tab (with confirmation) throws the time away without
  billing it - for false starts.

This separation keeps "what am I doing right now" (tabs) cleanly apart
from "what actually gets billed" (time entries), which is also how Clio
and MyCase's timers work under the hood.

## Known limitation: Electron packaging is unverified here

This code was written in a sandboxed container with no display server and
no outbound access to Electron's binary CDN, so `electron` could not
actually be launched or packaged into an installer in this environment.
What *was* verified here: the Express API, the SQLite data layer, and the
React UI running as an ordinary web app in a real browser against the
real local server (see the repo's README "Verified" section for exactly
what was exercised).

To build real installers:

```
npm run build            # builds shared, server, and web
npm run dist --workspace=desktop-shell
```

Two things to watch for on a real machine, since they couldn't be
exercised here:

1. **Native module ABI.** `better-sqlite3` compiles a native addon against
   Node's ABI. Electron bundles its own Node build, so `electron-builder`
   needs to rebuild native deps for Electron's ABI before packaging
   (typically automatic via `electron-builder`'s postinstall rebuild, or
   run `npx electron-rebuild` explicitly if packaging fails on
   `better_sqlite3.node`).
2. **First run.** The packaged app points its SQLite file at
   `app.getPath('userData')`, which doesn't exist until Electron creates
   it on first launch - this path was code-reviewed but not exercised by
   an actual first launch in this environment.
