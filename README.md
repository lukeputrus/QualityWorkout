# QualityWorkout

A personalized workout app: users enter their sex, age, weight and goal, then
get a weekly training split with a **live follow-along coach** for every
workout day — set/rest timers plus an animated movement demonstration for
each exercise. Programming is different for the male and female plans.

This preview is **free, with no subscription and no required account**.
The plan is to charge a single **one-time purchase** through the App Store /
Google Play once native apps ship — see `SUBSCRIPTION_SETUP.md`.

This repo currently contains an **interactive web prototype** — the fastest
way to see and click through the whole product before investing in native
iOS/Android builds or real payment infrastructure.

## What's implemented

- Marketing landing page (how-it-works, program previews, pricing model)
- A weekly plan works entirely as a **guest** — no account required
- Optional mock sign up / log in (stored only in the browser, no real
  backend) for anyone who wants their plan to feel more permanent
- Onboarding: gender, age, weight, goal → builds a personalized weekly split
- Separate **male** and **female** workout programs (7 days each), with a
  matching accent color per program
- Home dashboard with today's recommended workout + full weekly split
- **Nutrition tab**: log a meal two ways — build it from individual
  ingredients with exact gram/ounce amounts (`src/data/ingredients.js`, ~65
  common ingredients), or pick a region/cuisine and a common dish from it,
  then enter how much you ate (`src/data/cuisines/`, 10 cuisines — Iraqi,
  American, Mexican, Italian, Indian, Chinese, Japanese, Thai, Korean,
  Mediterranean — roughly 25 dishes each, 253 total). Either way it logs
  calories/protein/carbs/fat/fiber against daily targets computed from your
  weight and goal. Insights call out what to prioritize next — e.g. low
  fiber, or protein behind for today's workout — and a summary card on Home
  ties it back to today's training day
- Workout day screen listing every exercise (sets/reps or timed)
- A fully functional **follow-along player**: work timers, rest timers,
  set-by-set progression, an animated per-exercise movement demonstration,
  and a workout-complete screen with an estimated calorie/duration summary
- Profile screen: edit plan details, create/log out of an optional account,
  reset demo data

## What's intentionally mocked (and why)

This is a prototype meant to be clicked through, not a production backend.
A couple of things are simulated on purpose rather than half-implemented:

- **Video** — this deliberately does *not* embed real video (YouTube or
  otherwise). We tried a YouTube embed first; it turned out unreliable
  (broken/unavailable videos) and would put ads in front of users on every
  workout. What's here instead, in `src/components/ExercisePhoto.jsx`:
  - **Primary**: real exercise photos from
    [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public
    domain / Unlicense — no licensing risk), crossfaded between the two
    provided angles to read like a GIF. Mapped per exercise in
    `src/data/exercisePhotos.js`. Images are hotlinked from GitHub's raw
    content CDN rather than downloaded into this repo — reasonable given
    it's a stable, widely-used dataset, but it is a live external
    dependency, unlike everything else in this app.
  - **Fallback**: `src/components/ExerciseAnimation.jsx`, a fully
    self-contained animated illustration of the exercise's movement pattern
    (squat, hinge, push, pull, curl, etc. — see
    `src/data/movementPatterns.js`) with no network request at all. Used for
    the handful of exercises with no good photo match, and automatically for
    ANY exercise if its photos fail to load or simply never finish loading
    within 6 seconds (a network reset doesn't always fire a clean image
    error, so this timeout matters — verified by testing in a sandbox that
    genuinely couldn't reach external hosts).
- **Nutrition data** — every calorie/macro figure in `src/data/ingredients.js`
  and `src/data/cuisines/` is an estimate (standard per-100g nutrition
  figures for that ingredient/dish), same spirit as the calorie-burn
  estimate in `lib/estimate.js` — not lab-measured, and composite dishes in
  particular vary a lot by recipe and restaurant. There's deliberately no
  photo-based auto-detection here: that would need a real vision-model API
  call, which needs a paid key and a backend to hold it safely (this static
  frontend can't), and free client-side image classifiers are trained on
  generic categories (pizza, sushi, ImageNet classes) that wouldn't
  recognize most of these dishes anyway — they'd just be confidently wrong.
  Typing in exact ingredients/amounts or picking a known dish is slower but
  actually accurate.
- **Payments** — there's no paywall in this build at all. See
  `SUBSCRIPTION_SETUP.md` for the plan to charge a one-time fee through
  native app store in-app purchase once iOS/Android apps exist.
- **Accounts** — sign up/login is entirely optional and just stores a name +
  email in `localStorage`. There's no real backend, database, or password
  security, and the app works fully without ever creating one.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

- `npm run build` — production build to `dist/`
- `npm run preview` — preview that production build locally

## Project structure

```
src/
  pages/        One file per screen (Landing, Auth, Onboarding, Home,
                 WorkoutDay, Player, Nutrition, LogMeal, Profile)
  components/    Shared UI: phone frame, nav, exercise animation, buttons
  data/          Workout programs (male/female) + goals, nutrition dish
                 library
  context/       App-wide state (profile, progress, food log) via
                 React Context + localStorage
```

Built with React + React Router + Tailwind CSS (via Vite). Routing uses a
`HashRouter` so the built site works as a static site (e.g. GitHub Pages)
with no server-side routing configuration required. Typography pairs
[Fraunces](https://fonts.google.com/specimen/Fraunces) (headlines) with
Inter (body) on a warm cream/off-black palette with a single muted
terracotta/sage accent per program.

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
notification setup, app icons/screenshots, and store listings, and native
in-app-purchase wiring for the one-time unlock fee — see
`SUBSCRIPTION_SETUP.md`.

## Path to a real backend

Right now everything lives in the browser. Going live needs:

- A real backend + database for accounts and progress, if you want optional
  accounts to actually sync across devices (e.g. Supabase, Firebase, or a
  small Node/Postgres API)
- Real authentication (password hashing at minimum, ideally OAuth too)
- Real one-time-purchase billing via App Store / Play Store — see
  `SUBSCRIPTION_SETUP.md`
- If you want real video eventually: licensed or self-produced workout
  footage, hosted on a real video platform you control (not embedded from
  a third party) — see the note above
