# Backend activation checklist
_What's on, what's dormant, and the exact operator step to fully turn it on._

Most of the backend is **already live**. The remaining items are **operator-gated**
(they need a key/secret or a dashboard action Claude can't perform — payment
credentials, account settings, env vars). This is the map.

Legend: ✅ live · 🟡 wired, needs a key/action · ⛔ blocked on an external party.

| Service | State | What it needs | Where |
|---|---|---|---|
| **Analytics (GA4)** | ✅ live | `G-9F5R5FM8NS` hardcoded in `app/layout.tsx`; `track()` fires on newsletter + article reads; GA4 enhanced measurement auto-captures page views, scroll, outbound (Paystack) clicks, site search | — |
| **Content pipeline + engine** | ✅ live | `ANTHROPIC_API_KEY` (set). Weekly engine cycle, coverage discovery, light cron, monthly Index snapshot all run | GitHub secret / Vercel |
| **Media sourcing** | ✅ live | `PEXELS_API_KEY` (set); `UNSPLASH_ACCESS_KEY` optional | GitHub/Vercel |
| **Newsletter (Kit)** | ✅ live | `KIT_API_KEY` + form id (set) | Vercel |
| **EIC digest email (Resend)** | 🟡 | `RESEND_API_KEY` set; sender is `onboarding@resend.dev` until the domain is verified, then `editor@monokromatik.com` | Resend dashboard (verify domain) |
| **Supabase auth** | 🟡 | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel prod; add prod **redirect URLs** in Supabase Auth | Vercel + Supabase dashboard |
| **Entitlements / webhook** | 🟡 | `SUPABASE_SERVICE_ROLE_KEY` + `PAYSTACK_SECRET_KEY` in Vercel; register webhook `…/api/paystack/webhook` in Paystack | Vercel + Paystack |
| **Report sale (R899)** | ✅ live | `NEXT_PUBLIC_PAYSTACK_REPORT_URL` set; checkout works | — |
| **Membership (subscriptions)** | ⛔ | Paystack account still in review. Then: create 2 plans; set `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_{INDIVIDUAL,TEAM}_URL` + `PAYSTACK_PLAN_{INDIVIDUAL,TEAM}` + the secret/webhook above | Paystack + Vercel |
| **Actions → PRs** | ✅ live | `can_approve_pull_request_reviews` enabled (the autonomous workflows open review PRs) | — |

## To fully turn on — operator steps, in order

1. **Membership billing (when Paystack clears):** create the two subscription plans, then in Vercel set `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_INDIVIDUAL_URL`, `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_TEAM_URL`, `PAYSTACK_PLAN_INDIVIDUAL`, `PAYSTACK_PLAN_TEAM`, `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; register the webhook in Paystack. Then mark chosen content `access: "premium"`. _(See `docs/SUBSCRIPTIONS.md`.)_
2. **Dual-track payments (from the growth review):** Paystack recurring is **card-only** and African cross-border cards throttle — add **Stripe/Atlas** for diaspora auto-renew + keep Paystack one-off "pay-again" + PPP local tiers. This is a build, not just a key — flag when ready.
3. **Supabase prod:** confirm the two `NEXT_PUBLIC_SUPABASE_*` vars are in Vercel production and add the prod + preview redirect URLs in Supabase Auth.
4. **Resend domain:** verify `monokromatik.com` in Resend, then set the digest sender to `editor@monokromatik.com`.
5. **Kit sender:** set the newsletter sender/reply-to to `editor@monokromatik.com` in the Kit dashboard.

## Optional enhancements (codeable, no operator key)
- **Plausible** alongside GA4 (privacy-first, no cookie banner) — set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and add the script.
- **PostHog** for funnels + A/B + feature flags (free to ~1M events) — the growth review's recommended analytics for conversion work.
- More `track()` conversion events (checkout intent, ask submitted, badge copied) for a tighter funnel view.

> Guardrail: Claude never enters payment credentials, secrets, or card data, and won't change the financial dashboard. All keys above are operator-set.
