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
- **Phase 2 — Auth:** Supabase project + `@supabase/ssr`; sign-in/up (magic-link +
  Google); session in middleware; a minimal account page.
- **Phase 3 — Billing + entitlement:** Paystack plans for both tiers; checkout
  bound to the signed-in user; a webhook (`/api/paystack/webhook`, verifies the
  signature with the server-only secret) writes an `entitlements` row; a server
  helper `isMember(user)`.
- **Phase 4 — Flip the gates:** wrap premium case studies/reports/Index report in
  `PaywallGate` keyed off `access` + `isMember`; set the genuinely-premium items
  to `access:'premium'`. Free discovery (scores, signals) stays free.

## Env (set when each phase goes live; no secrets in code)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_INDIVIDUAL_URL`, `…_TEAM_URL` (public plan links)
- `PAYSTACK_SECRET_KEY` (server-only — webhook verification)

## Guardrail
Claude never enters payment credentials or copies secret keys into the repo; all
secrets are env vars the operator sets. Paystack dashboards block browser
automation, so plan creation is operator-done.
