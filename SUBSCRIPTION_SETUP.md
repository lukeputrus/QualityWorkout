# Going live with real $10/month billing + bank payouts

The prototype's "Start Membership" button only *simulates* a checkout —
nothing is charged and no money moves. This doc is the checklist for making
it real. None of this requires code changes from me until the step marked
**(code)** — everything before that is account/dashboard setup on your end,
because it involves your legal business details and bank account, which
shouldn't be typed into a chat or committed to a repo.

## 1. Choose a payment processor

For a website charging a recurring $10/mo, **Stripe** is the standard
choice (Stripe Billing + Stripe Checkout). This guide assumes Stripe.

## 2. Create your Stripe account & connect your bank

1. Sign up at https://dashboard.stripe.com/register.
2. Complete Stripe's business verification (your legal name/business,
   address, tax ID/SSN as required).
3. Go to **Settings → Bank accounts and scheduling** and add your bank
   account and routing number directly in Stripe's dashboard. This is how
   you "link your bank account to receive payment" — it happens entirely
   inside Stripe, never in this app's code, and Stripe never hands your
   bank details to the app.
4. Set your payout schedule (daily/weekly/monthly).

## 3. Create the $10/mo product

In **Product catalog → Add product**:
- Name: `QualityWorkout Premium`
- Pricing: Recurring, $10.00, Monthly

Copy the resulting **Price ID** (`price_...`) — you'll need it later.

## 4. Get your API keys

In **Developers → API keys** you'll see a **Publishable key** (safe for the
browser) and a **Secret key** (never expose this in frontend code or commit
it to git — it must live only in server-side environment variables).

## 5. You need a backend for real payments

This repo is currently a static frontend with no server. Stripe Checkout
Sessions and subscription webhooks must be created/verified server-side
with your secret key — a static site can't do this safely. The lightest
options:

- A single serverless function (Vercel/Netlify Function, or a Supabase Edge
  Function) that creates a Checkout Session and returns its URL
- A webhook endpoint that listens for `checkout.session.completed`,
  `customer.subscription.deleted`, and `invoice.payment_failed` to keep
  subscription status in sync with your database

## 6. (code) Wire the frontend to your backend

Once the backend above exists, replace the `setTimeout` simulation in
`src/pages/Subscribe.jsx` with a real call to your backend to create a
Checkout Session, then redirect the browser to the returned Stripe URL.
Happy to do this step once the backend/API keys exist — just ask.

## Important: this changes for a native iOS/Android app

Apple and Google generally **require using their own in-app purchase
systems** (StoreKit / Google Play Billing) — not Stripe directly — for
digital subscriptions unlocked inside a native app, and they take a
15–30% cut. Fitness/workout content doesn't typically qualify for the
"external purchase" exceptions some categories get. Practical options once
you build the native apps:

- Use Apple/Google in-app purchase for the native apps (often via
  [RevenueCat](https://www.revenuecat.com/) to manage both platforms +
  Stripe from one place), while the website can keep using Stripe directly.
- Or keep the native apps as a companion to a paid website ("sign up on
  the web") — allowed as long as you don't sell digital subscriptions
  in-app outside their billing system.

Worth deciding before investing heavily in the native build, since it
affects both revenue share and how the paywall screen works per platform.

## Security notes

- Never commit Stripe secret keys, webhook signing secrets, or bank details
  to this (or any) git repository.
- Store secrets as environment variables on whatever server/function
  platform you choose, not in this frontend code.
- The publishable key is safe to expose in frontend code; the secret key
  is not.
