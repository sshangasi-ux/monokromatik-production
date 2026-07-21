# How subscriptions were actually wired (July 2026)

**Status: record of work done, not a task list.** Subscriptions went live 16–17 July
2026 and were proven end to end with a real R149 charge. Nothing here is outstanding.

This exists because the runbook we wrote *before* the work described a state that no
longer exists, and a stale runbook reads as an open action item to whoever finds it
next. What follows is the opposite: the decisions and the two non-obvious fixes, so
that if any of it has to be rebuilt, the reasoning survives.

Written from the code as it stands, not from memory. Every file path below is real.

---

## The shape of the thing

Five pieces, in the order a paying reader moves through them:

1. **Sign-in** — Supabase magic link → `app/auth/callback/route.ts` → session cookie.
2. **Checkout** — a hosted Paystack page per plan. We never touch card details.
3. **Webhook** — `app/api/paystack/webhook/route.ts` verifies the signature and
   upserts an entitlement row keyed by email.
4. **Gate** — `lib/entitlements.ts` reads that row through RLS as the signed-in user.
5. **Cancel** — `app/account/manage/route.ts` mints a Paystack-hosted management link.

The design decision underneath all of it: **the app never stores a card, a token or a
plan price.** Paystack holds the payment relationship; we hold one row saying whether
someone is entitled. That keeps our breach surface to an email address and a tier.

---

## The two fixes that were not obvious

### 1. The magic link delivered a `token_hash`, not a `code`

This is the one that cost the most time and would cost it again.

The original callback handled only `?code=` and called `exchangeCodeForSession`. That
is the OAuth/PKCE shape. **Supabase's email magic links deliver `?token_hash=…&type=…`
instead**, which needs `verifyOtp`. With a code-only callback the session was never
established, and the user was bounced back to the sign-in page having done everything
right — no error, no clue.

The fix, now in `app/auth/callback/route.ts`, handles both shapes:

```ts
if (code) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (!error) return NextResponse.redirect(`${origin}${next}`);
} else if (tokenHash && type) {
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (!error) return NextResponse.redirect(`${origin}${next}`);
}
```

**Symptom to recognise:** sign-in appears to work, the email arrives, the link opens
the site — and you land back on the sign-in page. Look at the query string on the
callback URL before anything else. If it says `token_hash`, this is the bug.

### 2. Two Supabase dashboard settings that no amount of code will fix

Both live in **Authentication → URL Configuration**, and neither is discoverable from
the codebase:

- **Site URL** must be the production origin (`https://www.monokromatik.com`). If it
  is `localhost`, the email link points at a machine the reader does not have.
- **Redirect URLs** must include the callback path explicitly. Supabase refuses to
  redirect anywhere not on that allow-list, and the failure is a silent bounce rather
  than an error.

If auth breaks after an infrastructure change, check these two before reading any code.

---

## What lives where

**Vercel production env** — three Supabase values plus the Paystack set. The
`service_role` key is server-only and must never appear in a `NEXT_PUBLIC_` name:

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server |
| `SUPABASE_SERVICE_ROLE_KEY` | webhook only — bypasses RLS |
| `PAYSTACK_SECRET_KEY` | webhook signature verification |
| `PAYSTACK_PLAN_INDIVIDUAL` / `PAYSTACK_PLAN_TEAM` | plan code → tier mapping |
| `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_*_URL` | the hosted checkout links |

**The operator sets these, never Claude.** Copy each straight from the Supabase and
Paystack dashboards into Vercel. No secret should pass through a chat window, a commit,
or a file in this repo.

**Supabase — one table, `entitlements`**, keyed by email, with RLS "owner reads own".
The webhook writes with the service-role client (bypassing RLS); the app reads as the
signed-in user (through RLS). That asymmetry is deliberate: a reader can see their own
entitlement and nobody else's, and only a signature-verified webhook can create one.

---

## Why the gate fails safe

`membershipsLive()` in `lib/commerce.ts` returns true only if at least one checkout URL
is configured. `CaseStudyFeature` gates on `isLocked(c) && membershipsLive()`.

So marking content premium is safe *before* billing exists — with no checkout URL set,
nothing locks and free readers see everything. The gate switches on when payment
becomes possible, not when someone edits a flag. This is what let premium content ship
weeks ahead of the payment rails.

`getEntitlement()` also swallows every error and returns `null`. A Supabase outage
therefore degrades to "not a member" rather than a 500. Losing a paying reader's access
for the length of an outage is bad; taking the site down is worse.

---

## Verification that it actually worked

- A real **R149 charge** completed against the live plan.
- A card decline during testing was traced to the **issuing bank**, not our chain —
  the request reached Paystack and was refused there. Worth knowing, because a decline
  looks identical to a broken integration from the outside.
- The webhook upserted the entitlement row and `/account` reflected active membership.
- Self-serve cancel returns a Paystack-hosted management link; if that call fails the
  route redirects to `/account?manage=<reason>` with an email fallback rather than
  dead-ending.

---

## If this has to be rebuilt

Order matters. Auth first, because everything downstream needs a session:

1. Supabase project → `entitlements` table → RLS policy → **the two URL settings above**.
2. Env vars into Vercel, redeploy, confirm sign-in end to end before touching payments.
3. Paystack plans → checkout URLs → webhook endpoint registered → signature verified.
4. Test with a real card, then cancel, then re-subscribe.

The failure that will cost you an afternoon is the `token_hash` one. Check the callback
query string first.
