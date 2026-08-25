# Meal-photo analysis backend

This is what makes the Nutrition tab's photo capture actually identify the
dish and calculate calories from the photo, instead of asking you to search
for it. It's a small [Cloudflare Worker](https://workers.cloudflare.com/)
that receives the photo from the app, calls Claude's vision API to identify
the food and estimate its macros (scaled to the portion size visible in the
photo), and sends the result back — so the app never needs your Anthropic
API key, only this Worker does.

This step is **optional** — until you deploy it and point the app at it,
`LogMeal.jsx` falls back to the manual search-and-confirm flow it already
had, so nothing breaks if you skip this.

## Why this needs its own deployment

The web app is a static site (GitHub Pages) — there's no server to hold a
secret API key. Putting the key directly in the frontend's JS would mean
anyone who opens dev tools on the live site could read it and rack up
charges on your Anthropic account. This Worker is a minimal server that
keeps the key out of the browser entirely.

## 1. Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (the free tier
  covers this easily)
- An [Anthropic API key](https://console.anthropic.com/) — Settings → API
  Keys → Create Key. This is billed per request (Claude Haiku vision calls
  are cheap — a small fraction of a cent each — but not free; keep an eye on
  usage at console.anthropic.com if you deploy this somewhere public)
- Node.js installed locally

## 2. Deploy the Worker

```bash
cd worker
npm install -g wrangler   # Cloudflare's CLI, if you don't have it
wrangler login            # opens a browser to authorize your Cloudflare account

wrangler secret put ANTHROPIC_API_KEY
# paste your key when prompted

wrangler secret put APP_SHARED_SECRET
# optional — paste any random string of your choosing. This is a second,
# app-level check on top of the Anthropic key so a random person who finds
# your Worker's URL can't spend your API credits by hitting it directly.
# Skip this by just not setting it — the Worker works fine either way.

wrangler deploy
```

That last command prints your Worker's URL, something like
`https://qualityworkout-meal-analyze.<your-subdomain>.workers.dev`.

Before deploying, check `wrangler.toml` — set `ALLOWED_ORIGIN` to your
actual GitHub Pages origin if it's different from what's there, and adjust
`MODEL_ID` if you want a different Claude model (a more capable model will
identify dishes more accurately but costs more per photo).

## 3. Point the app at it

Add the Worker URL as a **repository variable** (not a secret — it's a
public URL, safe to expose) in the `QualityWorkout` repo:
**Settings → Secrets and variables → Actions → Variables tab → New
repository variable**

- `VITE_MEAL_ANALYZE_URL` = the Worker URL from step 2
- `VITE_MEAL_ANALYZE_SECRET` = the same string you set for
  `APP_SHARED_SECRET`, if you set one

For local development, put the same two values in `.env.local` (copy from
`.env.example`).

Push any commit (or re-run the "Deploy web preview to GitHub Pages" Action)
to rebuild the site with these baked in.

## Honest limitations

- **Not real security.** `VITE_MEAL_ANALYZE_SECRET` still ends up in the
  built JS bundle like everything else client-side — it only raises the bar
  from "anyone can find this Worker and call it" to "someone has to
  actually read your JS bundle first." If you expect real abuse, add proper
  rate limiting or auth in front of the Worker.
- **Vision models can misidentify food**, especially visually similar stews
  or mixed plates. The app always shows a confidence level and a "Not
  right? Search instead" link to fall back to the manual dish list — don't
  remove that escape hatch.
- Nothing here changes billing on your Anthropic account automatically —
  it's pay-as-you-go per request, so monitor usage if this gets real
  traffic.
