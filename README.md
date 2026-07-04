# BeOwned Politics — Full-Stack App (MVP)

A working Next.js app implementing the Phase 1 MVP from the product brief:
citizen sign-in, issue reporting (photo + GPS + category), automatic
department routing, ticket tracking, a staff dashboard, and a Rights /
Citizen Charter knowledge base — all styled in the NOT.A / BeOwned Politics
brand system.

This is real, running code (not a mockup) built to be deployable by a
non-technical maintainer, per the low-opex plan in
`BeOwned-Politics-Development-Prompt.md`.

## What's included

- **Frontend**: Next.js 14 (App Router), no separate mobile app needed —
  it's a mobile-first responsive web app that citizens can add to their
  phone's home screen.
- **Backend**: Next.js API routes (`app/api/**`) — same codebase, no
  separate server to run.
- **Auth**: Email/phone + one-time code (OTP) sign-in, session stored in a
  secure cookie. In development, the code is shown on screen so you can test
  without an email/SMS provider.
- **Data storage**: a simple JSON file (`data/db.json`) for local development
  — see "Moving to production" below before you have real users.
- **Roles**: `citizen` (default), `staff`, `admin`. Staff/admin access is
  granted **only** to identifiers listed in the `ADMIN_EMAILS` /
  `STAFF_EMAILS` environment variables (comma-separated) — never inferred
  from the email text. Set these in `.env.local` to test the staff
  dashboard locally; see `.env.example`.

## Security hardening (v1.0.1)

An earlier build of this app had five issues that were fixed before this
version — worth knowing if you're reviewing the code or diffing against an
older copy:

1. **Role assignment was substring-based** (any email containing "staff" or
   "admin" got that role). Fixed: roles now come only from the
   `ADMIN_EMAILS`/`STAFF_EMAILS` allowlist, re-checked on every login.
2. **Anonymous reports couldn't be tracked by their own submitter** — the
   report record dropped the owner's `userId` entirely. Fixed: the owner
   link is always kept so "My Reports" works for anonymous tips too;
   anonymity now controls what *staff* can see (their view has `userId`
   stripped for anonymous reports), not what the citizen can see.
3. **No fallback protection if `AUTH_SECRET` is unset.** Fixed: in
   production the app now throws immediately when signing/verifying a
   session rather than silently using a guessable default secret.
4. **No rate limiting** on OTP request/verify. Fixed: both are now
   throttled per-identifier (see `lib/rateLimit.js` for the current
   single-instance limitation and the note on moving to a shared store).
5. **No CSRF protection.** Fixed: all state-changing routes now verify the
   request's Origin/Referer matches the serving host before proceeding.

Also fixed: the confirmation screen previously promised "you'll be
notified at every status change" with no notification system behind it —
copy now accurately reflects that notifications aren't built yet. Sensitive
categories (Corruption, Crime Tip) now require an explicit consent
checkbox before submission. All screen titles use real `<h1>`/`<h2>`
elements and form inputs have associated `<label>`s, instead of styled
`<div>`s standing in for both. Dependencies were upgraded to Next.js
15.5.20 / React 19 (the 14.x line has no further patches for several
moderate/high advisories) with a `postcss` override for a transitive
vulnerability Next itself still bundles.

## Features implemented

- Citizen sign-up/sign-in (OTP)
- Report an issue: category, photo, GPS auto-tag, optional description,
  anonymous toggle (forced on for Corruption / Crime Tip)
- Automatic department routing by category
- Ticket generation with a stamped confirmation screen
- "My Reports" tracking with a full status timeline
- Staff dashboard: view all reports, filter by status, update status
- "Know Your Rights" knowledge base (Fundamental Rights, Consumer Rights,
  Women's Rights, Child Rights, Citizen Charter, Government Schemes)
- Profile screen with impact score, and a link to the staff dashboard for
  staff/admin accounts

Not yet built (see the original phased roadmap for when to add them): NGOs
and volunteering, polls, sustainability challenges, rewards/badges, GIS
heatmaps, AI-assisted classification, SMS/WhatsApp notifications.

## Running it locally

You need [Node.js](https://nodejs.org) 18 or newer installed.

```bash
npm install
cp .env.example .env.local
# open .env.local and set:
#  - AUTH_SECRET to a random string
#  - STAFF_EMAILS (and/or ADMIN_EMAILS) to an email you'll sign in with,
#    if you want to test the staff dashboard
npm run dev
```

Open http://localhost:3000. Sign in with any email — the 6-digit code will
be shown directly on the screen (development mode only). To test the staff
dashboard, sign in with the exact email you listed in `STAFF_EMAILS` or
`ADMIN_EMAILS`.

## Deploying (non-technical path)

1. Push this folder to a GitHub repository.
2. Create a free account at [vercel.com](https://vercel.com) and click
   "Import Project," pointing it at your GitHub repo. Vercel detects Next.js
   automatically — no configuration needed.
3. In Vercel's project settings, add environment variables: `AUTH_SECRET`
   (required — a long random string), and optionally `ADMIN_EMAILS` /
   `STAFF_EMAILS` to grant staff-dashboard access to specific people.
4. Click deploy. Every future update is: push to GitHub → Vercel redeploys
   automatically. No servers, no command line, no Docker.

**Important:** the built-in JSON file storage does **not** persist on
Vercel (or most serverless hosts) — each deploy/redeploy starts fresh, and
data can be lost between requests. This is fine for a demo or internal
review, but before inviting real citizens, complete the step below.

## Moving to production (real data persistence + real OTP delivery)

The whole app talks to the database through one file, `lib/db.js`, and to
OTP delivery through one file, `app/api/auth/request-otp/route.js` — so the
swap is contained:

1. **Database**: create a free [Supabase](https://supabase.com) project
   (managed Postgres, no server to run). Replace the contents of `lib/db.js`
   with equivalent functions that call the Supabase client instead of
   reading/writing `data/db.json`. The function names and shapes
   (`createReport`, `listReportsForUser`, `updateReportStatus`, etc.) can
   stay the same, so no other file needs to change.
2. **OTP delivery**: sign up for a free tier of a transactional email
   provider (e.g. Resend, Postmark) and call their API from
   `request-otp/route.js` instead of returning `devCode`. Add SMS (e.g.
   Twilio) later only once budget allows — it's the one feature with real
   per-message cost.
3. **Photo storage**: photos are currently stored inline as base64 in the
   report record, which is fine for a small pilot but not efficient at
   scale. Once on Supabase, switch to Supabase Storage: upload the photo,
   store the resulting URL on the report instead of the base64 string.
4. Redeploy — Vercel picks up the change automatically on your next push.

This keeps the opex near-zero at pilot scale and gives a clear, low-risk
path to scale up, matching the plan in the original development prompt.

## Project structure

```
app/
  page.js                  Splash screen
  login/page.js             OTP sign-in
  (shell)/                  Authenticated screens (share TopBar + BottomNav)
    home/                    Dashboard
    report/                  Category picker → capture form → confirmation
    reports/                 My Reports list + detail/timeline
    learn/                   Rights & Citizen Charter knowledge base
    profile/                 Profile, impact score, sign out
    admin/                   Staff dashboard (role-protected)
  api/                      Backend routes (auth, reports, me)
components/                 Shared UI: BottomNav, TopBar, AdminDashboard, ...
lib/
  db.js                      Data layer (swap this file for production)
  auth.js                    Session/JWT helpers
  content.js                 Rights & Citizen Charter static content
data/db.json                 Local dev "database" (auto-created, gitignored)
```

## Accessibility & UX notes

- Bottom tab navigation, large tap targets, mobile-first layout that goes
  edge-to-edge on real phones.
- Visible keyboard focus outlines throughout; every interactive element is
  reachable and operable by keyboard.
- Respects the operating system's "reduce motion" setting.
- Emergency-category reports (Corruption, Crime Tip) are anonymous by
  default and the reporting screen reminds citizens to contact emergency
  services directly for anything urgent — the app forwards reports, it does
  not replace an emergency response.
