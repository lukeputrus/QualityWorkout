# QualityWorkout

A personalized workout app: users enter their sex, age, weight and goal, then
get a weekly training split with **live follow-along video** for every
workout day. Programming is different for the male and female plans.
Membership is **$10/month**.

This repo currently contains an **interactive web prototype** — the fastest
way to see and click through the whole product before investing in native
iOS/Android builds or real payment infrastructure.

## What's implemented

- Marketing landing page (pricing, program previews, how-it-works)
- Mock sign up / log in (stored only in the browser, no real backend)
- Onboarding: gender, age, weight, goal → builds a personalized weekly split
- Separate **male** and **female** workout programs (7 days each), with a
  matching accent color per program
- Home dashboard with today's recommended workout + full weekly split
- Workout day screen listing every exercise (sets/reps or timed)
- A fully functional **follow-along player**: work timers, rest timers,
  set-by-set progression, and a workout-complete screen
- Subscription paywall UI for the $10/mo plan (checkout is simulated)
- Profile screen: edit plan details, cancel membership, log out, reset demo

## What's intentionally mocked (and why)

This is a prototype meant to be clicked through, not a production backend.
Three things are simulated on purpose rather than half-implemented:

- **Video** — each workout screen shows an animated placeholder "live"
  player instead of real footage. No workout video content is licensed or
  produced yet. Swap `src/components/VideoPlayer.jsx` for a real player
  (e.g. Mux, Cloudflare Stream, or embedded YouTube) once you have hosted
  video.
- **Payments** — the subscribe screen simulates a checkout after a short
  delay. No card is ever charged. See `SUBSCRIPTION_SETUP.md` for exactly
  what's needed to take real $10/mo payments and link a bank account for
  payout.
- **Accounts** — sign up/login just stores a name + email in
  `localStorage`. There's no real backend, database, or password security.

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in VITE_ADMIN_PASSWORD
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

- `npm run build` — production build to `dist/`
- `npm run preview` — preview that production build locally

### Free-access admin login

Logging in with `admin@qualityworkout.app` and the password from
`VITE_ADMIN_PASSWORD` skips the $10/mo paywall entirely (Profile shows it as
a comped account). The password lives in `.env.local` locally (gitignored,
copy it from `.env.example`) and, for the GitHub Pages build, in a repo
secret: **Settings → Secrets and variables → Actions → New repository
secret**, name `VITE_ADMIN_PASSWORD`. See the comment above `ADMIN_PASSWORD`
in `src/pages/Auth.jsx` for what this does and doesn't protect against —
short version: it keeps the password out of git history, but Vite still
inlines it into the built JS bundle, so it's not a real secret once
deployed.

## Project structure

```
src/
  pages/        One file per screen (Landing, Auth, Onboarding, Subscribe,
                 Home, WorkoutDay, Player, Profile)
  components/    Shared UI: phone frame, nav, video player, buttons
  data/          Workout programs (male/female) + goals
  context/       App-wide state (profile, subscription, progress) via
                 React Context + localStorage
```

Built with React + React Router + Tailwind CSS (via Vite). Routing uses a
`HashRouter` so the built site works as a static site (e.g. GitHub Pages)
with no server-side routing configuration required.

## Path to native iOS & Android apps

This prototype is a mobile-first web app on purpose, so the UI and app
logic can carry forward. Two realistic paths from here:

1. **Fastest**: wrap this exact web app with [Capacitor](https://capacitorjs.com/)
   to ship real iOS/Android app store builds backed by the same React code.
2. **Most native feel**: rebuild the screens in React Native (the
   components, routes, and data model here translate directly), for
   platform-native performance and gestures.

Either way you'll still need: an Apple Developer account ($99/yr) and a
Google Play Developer account ($25 one-time) to publish, plus push
notification setup, app icons/screenshots, and store listings.

## Path to a real backend

Right now everything lives in the browser. Going live needs:

- A real backend + database for accounts, subscriptions and progress
  (e.g. Supabase, Firebase, or a small Node/Postgres API)
- Real authentication (password hashing at minimum, ideally OAuth too)
- Real payments — see `SUBSCRIPTION_SETUP.md`
- Licensed or self-produced workout video, hosted on a real video platform
