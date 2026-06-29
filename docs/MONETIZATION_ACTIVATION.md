# Monetization activation — the playbook

_The build side is done; this is the human sales motion. Everything here is yours
to run (outreach, contracts, payment); the site assets that make the sale exist._

## The thesis (from the deep-review)
Free flagship ranking = the PR/credibility flywheel → **license the data + sell sponsorship + run one event** = the revenue. The Index is the wedge. Don't sell coverage; sell the **measurement standard** and access to the room that trusts it. Protect the editorial firewall above all — it's the moat that makes the room worth reaching.

## What's live to sell with (the assets)
| Surface | What it does |
|---|---|
| **`/partner`** | The consolidated media kit — all four revenue paths, one "request the media kit" CTA. |
| **`/intelligence/license`** | The data tiers: Scorecard $900 · League table $1,250 · Full Index $6,000 · **Enterprise API & Dashboard $15k+**. |
| **`/intelligence/signal-index/api`** | The developer/API docs — proof the data is a real product (citable, versioned). |
| **`/events`** | The Upside summit — title $15k+, curated dinner / co-branded report $10k+, invite capture. |
| **`/weekly`** | The Weekly Signal with a live dispatch sample + the **SPONSOR THE WEEKLY** slot. |
| **`/work-with-us?interest=…`** | The lead-capture form (interests: scorecard, case-study, market-read, sponsor, license, partner). |

## Sequence (works around the Paystack block)

### Now — no new billing needed
1. **Push Index licensing + scorecards** (highest-margin, already built, lead-capture live). Send `/partner` + `/intelligence/license` to warm contacts.
2. **Sell one-off dossiers** — the existing Paystack hosted-checkout handles one-time purchases today (set `NEXT_PUBLIC_PAYSTACK_REPORT_URL` + `NEXT_PUBLIC_INDEX_REPORT_PRICE`). Package a report as a paid dossier.
3. **Land 1–2 desk/franchise sponsors** — the Spirits desk → a drinks brand; the Wire or an Issue → a relevant brand. Single-sponsor, clearly disclosed. Point them at `/partner`.
4. **Newsletter** — `/weekly` is a real product now; grow the list (it's the asset every later stream compounds on).

### Next 90 days — unlock recurring
5. **Dual-track payments** — add **Stripe/Atlas** for diaspora auto-renew + keep **Paystack local** + **PPP/auto-localized** tiers (BoF-style). Then launch the **metered membership** (~$8–12/mo; gate Signal/Intelligence/Issues, keep Wire/Pulse free). _(See `docs/SUBSCRIPTIONS.md`, `docs/BACKEND_ACTIVATION.md`.)_
6. **Sponsored research** — package a **"State of African Brand Authorship"** report; sell it to a single sponsor (TechCabal-Insights / BoF-Insights model).
7. **Newsletter + Wire sponsorships** — single-sponsor weekly takeover; publish structured audience data (role/seniority) — the #1 rate driver.

### Later — the high-margin engines
8. **The Upside summit** — Semafor's playbook (events ~50% of revenue, ~75% margin). Title sponsor $15–40k + co-branded report.
9. **Enterprise Index** — the authenticated API + dashboard tier ($15k+), once a buyer commits.

## Who to approach
- **Agencies & brand teams** — African/diaspora-focused creative + media agencies; CMO/brand/insights leads at consumer brands active in Africa (drinks, fashion, telco, fintech, sport).
- **Investors** — Africa-focused VC/PE, creative-economy funds.
- **Press / platforms** — outlets and AI/data platforms that would cite or license the Index.
- **Sponsors** — brands wanting brand-safe adjacency to African culture (the Spirits desk is the warmest first sell).

## Paystack / payments — operator steps
- **One-off (now):** create a Paystack Payment Page → set `NEXT_PUBLIC_PAYSTACK_REPORT_URL` + `NEXT_PUBLIC_INDEX_REPORT_PRICE` in Vercel. Dossiers/reports become purchasable; until then the buttons fall back to lead-capture.
- **Recurring (when Paystack clears):** create the two plans; set `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_*_URL`, `PAYSTACK_PLAN_*`, `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; register the webhook. Then mark chosen content `access: "premium"`.
- **Dual-track:** Paystack recurring is card-only and African cross-border cards throttle — add Stripe/Atlas for diaspora + PPP local tiers (a build; flag when ready).

## The firewall — non-negotiable (it's the product)
- Every commercial placement **clearly labeled**; branded content via a **separate Studio**, never an editorial byline.
- **No sponsor influences coverage**, and **no sponsor ever sits near an Index score.**
- Subscriptions/data anchor revenue (Stratechery logic) so incentives align with readers.
- No cheap programmatic display early — keep premium inventory **direct-sold / PMP only**.
