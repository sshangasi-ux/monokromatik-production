# Supabase → subscriptions go-live runbook (Jul 2026)

**Why this exists.** The subscription *code* is built and safe, but the Supabase
half was never wired to production: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are absent from
Vercel prod, so sign-in shows "Accounts open soon" and the Paystack webhook
returns 503. Because production auth never ran, **there are zero real users and
zero data** in any existing project — so we start one clean project rather than
resurrect a paused generic default. The account currently holds ~12 orgs (mostly
empty) and 4 paused projects, none named `monokromatik`; this ends that.

**What only Sibu does (never Claude):** create the project, copy keys, upgrade
billing, register the webhook. Claude never handles the `service_role` key or any
secret — copy each straight from Supabase into Vercel.

---

## Step 1 — Create one clean project
1. supabase.com/dashboard → pick (or make) a single home org, e.g. **MonoKromatik Network**.
   *(Don't use the "23 NOV 2025" org — it hosts Abantu OS, a different product.)*
2. **New project.** Name it **`monokromatik-prod`**. Region **West EU (Ireland) / eu-west-1**.
   Generate a strong database password and save it in your password manager.
3. Wait for it to finish provisioning (~2 min).

## Step 2 — Create the entitlements table
Open the new project → **SQL Editor** → New query → paste and **Run**:

```sql
-- The single table the Paystack webhook writes and the app reads.
create table public.entitlements (
  email                       text primary key,
  status                      text not null default 'inactive',  -- active | inactive
  tier                        text,                               -- individual | team
  current_period_end          timestamptz,
  paystack_customer_code      text,
  paystack_subscription_code  text,
  updated_at                  timestamptz not null default now()
);

-- Signed-in users may read ONLY their own row (matched by auth email).
alter table public.entitlements enable row level security;

create policy "owner reads own entitlement"
  on public.entitlements for select
  using (email = (auth.jwt() ->> 'email'));

-- No insert/update/delete policy on purpose: writes happen only via the
-- service-role key in the webhook, which bypasses RLS.
```

*(This matches `app/api/paystack/webhook/route.ts` and `lib/entitlements.ts` exactly.)*

## Step 3 — Put the three keys in Vercel
In the project: **Settings → API**. Copy three values:

| Supabase (Settings → API) | Vercel env var (Production) | Secret? |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | no |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **YES — never share** |

Add each in Vercel → Project → Settings → Environment Variables → **Production**.
(`PAYSTACK_SECRET_KEY`, plan codes and checkout URLs are already set.)

## Step 4 — Auth redirect URLs
Supabase project → **Authentication → URL Configuration**:
- **Site URL:** `https://www.monokromatik.com`
- **Redirect URLs — add both:**
  - `https://www.monokromatik.com/auth/callback`
  - `https://*-monokromatik.vercel.app/auth/callback`  *(preview deploys)*

## Step 5 — Register the Paystack webhook
Paystack dashboard → **Settings → API Keys & Webhooks** → Webhook URL:
`https://www.monokromatik.com/api/paystack/webhook`
Confirm the two plan codes there match `PAYSTACK_PLAN_INDIVIDUAL` / `PAYSTACK_PLAN_TEAM` in Vercel.

## Step 6 — Redeploy & smoke-test (no card yet)
Redeploy prod (or push any commit). Then:
- `https://www.monokromatik.com/account` → should show the **magic-link sign-in form**, not "Accounts open soon".
- `curl -s -X POST https://www.monokromatik.com/api/paystack/webhook -d '{}'` → should return **401 invalid signature** (was 503). 401 = it's live and rejecting unsigned calls. Good.

## Step 7 — One real end-to-end test, then refund
The failure mode that burns trust is "customer pays, gets nothing." Rule it out:
1. Sign in at `/account` with your own email (magic link).
2. Subscribe on `/membership` with a live card.
3. Confirm `/account` flips to **Active** (webhook wrote the row).
4. **Refund yourself** in the Paystack dashboard.

## Step 8 — Before you market it: go Pro
Free-tier projects can pause during quiet spells and have no backups. Before a
public subscription push, **Upgrade to Pro (~$25/mo)** on `monokromatik-prod`
only. Not required for the Step 7 test; required before real customers rely on it.

## Step 9 — Housekeeping (later, low priority)
Delete the empty look-alike orgs so this never confuses us again. Orgs with no
project can be removed in **Org → Settings → General → Delete organization**.
Leave Abantu OS untouched.

---

### Definition of done
`/account` shows sign-in · webhook returns 401 not 503 · a test subscription
flips `/account` to Active · project on Pro. Only then is the site ready to take
subscription money.
