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
| **EIC digest + breaking-alert email (Resend)** | 🟡 | `RESEND_API_KEY` must exist as a **GitHub Actions secret** (the crons send from Actions, not Vercel). Sender is `onboarding@resend.dev` until the domain is verified, then `editor@monokromatik.com` | GitHub secret + Resend dashboard |
| **Bot PRs trigger CI (optional `GH_PAT`)** | 🟡 | Without it, agent/engine/coverage/index PRs are opened by `GITHUB_TOKEN`, which **does not trigger `ci.yml`** → the required `build` check never runs → the PR can't be merged without an operator nudge. Add a fine-grained PAT as secret `GH_PAT` and the content workflows push as a real user, so CI runs and the PR is mergeable | GitHub secret |
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
6. **Always-on alert email (`RESEND_API_KEY` in Actions):** the breaking-news radar and the daily run email their alerts/digests **from GitHub Actions**, so the key must be a repo **Actions secret**, not only a Vercel env var. In the repo: _Settings → Secrets and variables → Actions → New repository secret_ → name `RESEND_API_KEY`, paste the key. (Optionally also `EIC_DIGEST_TO` for the digest recipient.) Until then the crons run but silently skip the email.
7. **`GH_PAT` (powers auto-mergeable bot PRs + the reliable heartbeat):** create a **fine-grained personal access token** scoped to this repo with **Contents: read/write**, **Pull requests: read/write**, and **Actions: read/write**, then add it as Actions secret `GH_PAT`. Two jobs: (a) the content workflows fall back to `GITHUB_TOKEN` when it's absent (`${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}`), so with the PAT their branches push as a real user, `ci.yml` runs, the required `build` check appears, and the PR becomes mergeable without manual intervention; (b) the **heartbeat** (`heartbeat.yml`) uses it to trigger the scheduled workflows — `GITHUB_TOKEN` can't, so the **Actions: read/write** scope is required for reliable scheduling. _(Use the bot account's PAT if you want the actor to read "MonoKromatik Agent" rather than your own login.)_
8. **Reliable scheduling (`heartbeat.yml` + one external cron):** GitHub's native `schedule:` crons are best-effort and get dropped under load (observed 25 Jun: the daily run was skipped). Set up one free external cron (e.g. cron-job.org) to ping the repo's `repository_dispatch` every ~25 min; the in-repo heartbeat fans out to the due workflows with dedup + time gates. Needs the `GH_PAT` from step 7 (incl. **Actions: read/write**). Full setup — URL, headers, body, scopes — in **`docs/RELIABLE_TRIGGERS.md`**.
9. **Instagram auto-posting (`social-publish.yml`):** posts the next Wire break / article (branded card from `/api/social-card` + generated caption) to Instagram via the Meta Graph API. Operator setup: (a) switch the IG account to **Business/Creator** and link it to a **Facebook Page**; (b) create a **Meta app** (developers.facebook.com) with the **Instagram Graph API** product, generate a **long-lived access token** and get the **IG account ID** (App Review may be required for `instagram_content_publish`); (c) add Actions secrets **`IG_USER_ID`** + **`IG_ACCESS_TOKEN`**. **Mode:** *review-gated by default* — scheduled runs only preview the next post in the run summary; you publish by dispatching the workflow with `publish=true`. For *fully-auto*, set repo **variable** `SOCIAL_AUTOPOST=on` (Settings → Secrets and variables → Actions → **Variables**). Without the secrets every run is a no-op preview. Stories link-stickers aren't postable via the API (stay manual); the `/studio` page covers manual posting.

## Optional enhancements (codeable, no operator key)
- **Plausible** alongside GA4 (privacy-first, no cookie banner) — set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and add the script.
- **PostHog** for funnels + A/B + feature flags (free to ~1M events) — the growth review's recommended analytics for conversion work.
- More `track()` conversion events (checkout intent, ask submitted, badge copied) for a tighter funnel view.

> Guardrail: Claude never enters payment credentials, secrets, or card data, and won't change the financial dashboard. All keys above are operator-set.
