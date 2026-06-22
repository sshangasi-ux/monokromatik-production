# The Intelligence Membership — build spec

The recurring-revenue tier: one membership unlocks the full Cultural-Signal Index,
premium case studies, reports, and the searchable archive. The last big revenue
unlock, and the first feature needing **accounts/auth**.

## Decisions (locked 2026-06-22)
- **Auth + data:** **Supabase** (email magic-link + Google OAuth; Postgres for
  users + entitlements). Reusable later for Ask MonoKromatik, saved reports.
- **Bundle (full Intelligence):** Index report + quarterly refreshes · all premium
  case studies · all reports · full archive. **Two tiers:** Individual **R149/mo
  (R1,490/yr)** · Team/Agency **R690/mo** (≤5 seats + licensing). In the proven
  ~$30–$1,135/yr corridor.
- **Billing:** **Paystack** subscription plans (consistent with the one-off
  report). Card data stays on Paystack; the secret key lives in a server-only env.

## Architecture
```
Supabase auth (sign-in) → Paystack subscription plan → webhook → entitlement row
  → middleware/server check → isLocked()/PaywallGate gates premium content
```

## Phases
- **Phase 1 — Gating UX (SHIPPED, this PR):** `PaywallGate` (teaser + upgrade CTA
  over locked content) + `/membership` pricing page (two tiers, Paystack-plan URLs
  via env with a waitlist fallback) + `MEMBERSHIP`/`membershipCheckoutUrl` in
  commerce.ts + footer link. Decoupled from auth/billing — nothing gated yet.
- **Phase 2 — Auth (SHIPPED):** Supabase project `monokromatik` (eu-west-1, free)
  created via MCP; `@supabase/ssr` browser + server clients; fail-open session
  `middleware.ts`; magic-link sign-in at `/account` + `/auth/callback` exchange;
  account view + sign-out. Operator still: add redirect URLs in Supabase Auth
  (site + Vercel domains), set `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` in Vercel,
  and (optional) configure Google OAuth + production SMTP. Google OAuth deferred —
  magic-link works now.
- **Phase 3 — Billing + entitlement (SHIPPED):** `entitlements` table created in
  Supabase (keyed by email, RLS: owner-reads-own; writes only via service role).
  `/api/paystack/webhook` verifies the HMAC-SHA512 signature with
  `PAYSTACK_SECRET_KEY` and upserts the entitlement via the service-role client
  (`lib/supabase/admin.ts`); one-off `charge.success` without a plan is ignored so
  report-buyers aren't marked members. `lib/entitlements.ts` (`getEntitlement` /
  `entitlementActive` / `isMember`). Membership page binds the signed-in user's
  email to the Paystack plan URL (`?email=`) and shows a member banner; account
  page shows live membership status. **Operator to go live:** create the two
  Paystack subscription **plans**, set `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_*_URL`
  (plan pages) + `PAYSTACK_PLAN_INDIVIDUAL`/`PAYSTACK_PLAN_TEAM` (plan codes) +
  `PAYSTACK_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY`, and register the webhook URL
  (`/api/paystack/webhook`) in the Paystack dashboard.
- **Phase 4 — Flip the gates (SHIPPED):** `CaseStudyFeature` + `ReportFeature` now
  gate the deep body behind a "become a member" upsell when an item is
  `access:'premium'`, memberships are live, and the viewer isn't a member —
  keeping the hero/standfirst as a free teaser. `membershipsLive()` (commerce.ts)
  means a gate only enforces once a Paystack plan URL is set, so marking content
  premium is **safe before billing goes live** (stays fully visible). Member check
  runs only for premium items, so free pages stay statically rendered.
  **To activate:** set selected items to `access:'premium'` in
  `data/case-studies.json` / `data/reports.json` (an editorial call), and set the
  Phase-3 Paystack/membership envs. Verified end-to-end with a temporary premium
  item + dummy plan URL (reverted). Free discovery (scores, signals, live Index)
  stays free.

## Env (set when each phase goes live; no secrets in code)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_INDIVIDUAL_URL`, `…_TEAM_URL` (public plan links)
- `PAYSTACK_PLAN_INDIVIDUAL`, `PAYSTACK_PLAN_TEAM` (plan codes → tier mapping)
- `PAYSTACK_SECRET_KEY` (server-only — webhook signature verification)

## Guardrail
Claude never enters payment credentials or copies secret keys into the repo; all
secrets are env vars the operator sets. Paystack dashboards block browser
automation, so plan creation is operator-done.
