# MonoKromatik — Conversion funnel: how to see the leak

*The funnel is fully instrumented in code (events below are live). What was missing
is the assembled view. This is the playbook to turn ~30 scattered GA4 events into a
readable drop-off funnel — and the honest read on where the real constraint is.*

## The two funnels (the business has two conversions, not one)

**A — Audience → Email (grow the list):**

| Step | GA4 event | Fires from |
|---|---|---|
| 1. Land | `page_view` (GA4 auto) | every route |
| 2. Read | `article_view` | `app/article/[id]/ArticleClient.tsx` |
| 3. Engage lead magnet | `lead_magnet_view` | `app/ownership-map/PrintButton.tsx` |
| 4. **Capture email** ⭐ | `newsletter_signup` | `NewsletterSignup`, `LeadMagnetCapture`, `FlagshipGate`, (+ `registration_wall_signup`, `flagship_gate_unlock`) |

**B — Email/Reader → Revenue (sell reports):**

| Step | GA4 event | Fires from |
|---|---|---|
| 1. View a paid report | `report_view` (carries `slug`, `tier`, `access`, `locked`) | `app/components/ReportView.tsx` |
| 2. Click BUY | `report_buy_click` (carries `provider`, `price`) | `BuyButton`, `CheckoutRails`, `RelatedReportCTA`, `InlineReportTeaser` |
| 3. **Purchase** ⭐ | `purchase` | **server-side** `trackPurchase` (`lib/ga-measurement.ts`) from the PayPal **and** Paystack webhooks |

> `purchase` is fired server-side from the payment webhooks (not the browser), because
> checkout completes off-site on PayPal/Paystack. Both rails verify the signature,
> deliver the PDF, then fire `purchase`. So GA4 sees **real sales**, not just clicks.

## Set it up in GA4 (10 minutes, one-time — only you can, it's the GA4 UI)

1. **Mark Key Events** — Admin → Events (or Key events) → toggle these on:
   `newsletter_signup`, `report_buy_click`, `purchase`, `lead_submit`. Now GA4 computes
   conversion rates for them.
2. **Build the funnel** — Explore → blank → **Funnel exploration**. Make it an **open
   funnel** and add steps. Build *two* explorations:
   - **List-build:** `page_view` → `article_view` → `newsletter_signup`
   - **Revenue:** `report_view` → `report_buy_click` → `purchase`
3. **Breakdown** — add **Session source / medium** and **Landing page** as the breakdown
   dimension, so you see which *traffic* and which *article* actually convert.
4. **Register custom dimensions** (Admin → Custom definitions) for the params you'll want
   to segment by: `provider` (paypal/paystack), `tier`, `source`, `slug`.

## Reading the leak — what each drop means

- **`article_view` → `newsletter_signup` low:** the lead magnet / capture isn't
  compelling or isn't placed where attention peaks. (Funnel fix.)
- **`report_view` → `report_buy_click` low:** the report page isn't making the case /
  price objection. (Offer/copy fix.)
- **`report_buy_click` → `purchase` low:** friction at checkout (rail, currency, trust),
  or off-site drop. (Checkout fix.)
- **All steps thin but ratios OK:** not a funnel problem — a **traffic** problem.

## The honest constraint (read this before "optimising the funnel")

As of the last check the site had on the order of **~91 total search clicks** and **~1
recorded sale**. With that little top-of-funnel volume, **the funnel is starved, not
leaky** — conversion-rate tweaks on a near-empty funnel move almost nothing in absolute
terms. The binding constraint is **traffic / distribution** (backlinks, social, AEO),
not the already-excellent conversion machinery.

**Rule of thumb:** below ~1,000 organic sessions/month, spend the marginal hour on
**distribution** (the Index badge backlink engine, social auto-distribution, answer-engine
optimisation). Once GA4 shows the funnel filling, *then* the per-step fixes above start to
pay back — and you'll have the exact numbers to know which one to attack first.

*Cross-ref: `docs/ops/seo-indexing.md` (traffic), `docs/ANALYTICS.md` (event catalogue).*
