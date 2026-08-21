# Going live with a one-time app store purchase

This web preview has **no paywall at all** — everything is free to click
through, with or without an account. The plan is to charge a single
**one-time fee** through Apple's and Google's native in-app purchase
systems once the iOS/Android apps exist, rather than a recurring web
subscription. This doc is the checklist for that, once you're ready to
build the native apps. None of this applies to the current web build.

## Why in-app purchase (not Stripe) for the native apps

Apple and Google generally **require using their own in-app purchase
systems** (StoreKit / Google Play Billing) for digital purchases unlocked
inside a native app, and they take a 15–30% cut. Fitness/workout content
doesn't typically qualify for the "external purchase" exceptions some
categories get — so once there's a native iOS/Android app, the one-time
unlock needs to go through Apple/Google's billing, not a card processor
you control directly.

## 1. Set up developer accounts

- Apple Developer Program — $99/yr
- Google Play Developer account — $25 one-time

## 2. Create the one-time in-app purchase product

- **iOS (App Store Connect)**: create a **Non-Consumable** in-app purchase
  (this is the correct type for "pay once, unlock forever" — not
  Auto-Renewable Subscription).
- **Android (Google Play Console)**: create a **one-time product** under
  Monetize → Products (not a subscription).

Price both consistently (App Store and Play Store pricing are set
per-store, so you'll pick the equivalent tier on each).

## 3. Verify purchases without a backend at first, or with one for real security

The simplest version: the native app itself asks StoreKit / Play Billing
"has this device purchased the unlock," and that's enough for a v1. For
stronger protection against piracy/refund abuse, verify receipts
server-side (Apple's App Store Server API, Google's Play Developer API) —
this needs a small backend, similar in shape to what a real accounts system
would need anyway.

## 4. Consider RevenueCat

[RevenueCat](https://www.revenuecat.com/) is the common way to manage
one-time purchases and subscriptions across both iOS and Android from a
single SDK/dashboard, instead of writing StoreKit and Play Billing
integration code separately. Worth using even for a single one-time
product — it also gives you the server-side receipt verification from step
3 without building it yourself.

## 5. (code) Wire the native app to check purchase state

Once you've built the native wrapper (see the "Path to native iOS &
Android apps" section in `README.md`), the purchase flow slots in at the
same place the removed `Subscribe.jsx` screen used to sit: check purchase
state on launch, and if not yet purchased, show a single "Unlock
QualityWorkout — $X one-time" screen that calls StoreKit / Play Billing (or
RevenueCat) directly. Happy to help wire this once the native project
exists — just ask.

## If you ever want a web purchase path too

Apple/Google's rules only bind purchases made *inside* a native app. A
separate website-only purchase (e.g. via Stripe Checkout) is allowed as
long as it's not offered as a way to unlock the native app's content from
inside that app. If you want that later, Stripe's one-time Checkout Session
flow is simpler than what recurring billing would have needed.

## Security notes

- Never commit App Store Connect API keys, Google Play service account
  keys, or RevenueCat secret keys to this (or any) git repository.
- Store secrets as environment variables on whatever server/function
  platform you choose, not in frontend or native app code.
