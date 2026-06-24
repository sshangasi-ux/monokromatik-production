# MonoKromatik — Deep Site Review, Competitive Benchmark & Growth Plan
_2026-06-23 · review of `main` @ commit 84769c7_

A candid review of the site as it stands, benchmarked against the field, with a
prioritised plan to make it fully **engaging** and **monetizable**. Sourced from a
full codebase audit + competitive/monetization research (citations inline).

---

## 1. Honest state of play

**What's genuinely strong (the moat):**
- **Editorial depth, already shipped:** 39 articles, **24 case-study decodes**, the Founding Report, Issue 001 (fully published with cover + 7 feature pages), a searchable **Archive** across all lanes, and **Ask MonoKromatik** (grounded, cited corpus Q&A — a real differentiator almost no competitor has).
- **The Cultural-Signal Index** — a proprietary 0–100 scoring system (Idea/Authorship/Execution/Consequence) over real work. This is the single most valuable asset on the site.
- **An autonomous, integrity-gated content engine** — weekly cycle (discover → draft → cite → gate → stage PR → human merge), coverage planner (region × category × franchise), gap discovery. Provenance-as-product is baked in. Few publishers of any size have this.
- **Media + sourcing discipline** — every write-up now has a working, credited, self-hosted hero (just fixed); claims are sourced or dropped.

**What's thin, scaffolded, or dark:**
- **Monetization is not actually on.** The report (R899) checkout is live, but **membership checkout falls back to lead-capture** (Paystack plan URLs unset), and **no content is gated** yet. The site earns ~nothing today.
- **No measurement.** GA4 is a stub; there's no analytics, no funnel, no conversion tracking. We're optimizing blind.
- **No middle funnel.** Anonymous → paid with nothing in between: no registration wall, no metered paywall, no email capture on content.
- **The Index is inert.** It's a static leaderboard — no historical tracking, no filters/compare, no embeddable badges, no annual "class," no programmatic per-brand SEO pages. The asset that should be the growth engine just sits there.
- **Stubs leak into the product:** `/listen`, `/watch`, `/shop` are "Coming Soon"; `/arena` (sports) is empty; Conversations has formats but zero instances; Issue 002 features have dead `href=""`.
- **IA sprawl/redundancy:** `/roots` vs `/culture`, `/pulse` vs `/signal` vs `/weekly` overlap confusingly.
- **SEO depth missing:** no JSON-LD (Article/Dataset schema), no explicit sitemap/robots, not optimised for AI-citation (GEO).
- **Distribution is email/web only** — no WhatsApp/Telegram, which is where African reach actually compounds.

---

## 2. Competitive benchmark

| Player | What they are | What they do that we don't |
|---|---|---|
| **Business of Fashion** | The closest analog: premium vertical intelligence + the **BoF 500 / BoF Index** + Professional paywall + **VOICES** event | Monetises the Index as an annual franchise; metered paywall; **group/B2B tiers**; flagship invite-only event. [BoF500](https://www.businessoffashion.com/bof500/), [Groups](https://www.businessoffashion.com/subscriptions/groups/) |
| **The Information** | Hard-paywall premium tech journalism | 90%+ revenue from subs; **$749–999/yr Pro "data" tier**. Tiering discipline. [Digiday](https://digiday.com/media/information-launches-new-199-749-annual-subscription-tiers/) |
| **Brand Finance / YouGov BrandIndex** | The index-as-product benchmark | **Licenses league tables ($1,250–6,000)**, sells custom scorecards, **historical tracking** as the stickiness moat, ISO-certified methodology. [Brand Finance](https://brandfinance.com/data), [YouGov](https://yougov.com/en-us/business/products/brandindex) |
| **G2** | Software review marketplace | **Programmatic SEO** (37k+ compare pages → ~2.3M of 2.5M monthly organic visits) + **embeddable badges** (30M+ backlinks). [daydream](https://www.withdaydream.com/library/g2) |
| **The Continent** | African weekly, WhatsApp/PDF native | **WhatsApp-first distribution** (~⅔ of 31k subs) — built for African sharing. [The Continent](https://www.thecontinent.org/subscribe) |
| **Daily Maverick** | SA general news | **Membership (not paywall) = ~40% of revenue**, ~30k members. Proof the contribution model works in-market. [WAN-IFRA](https://wan-ifra.org/2024/05/membership-now-accounts-for-40-percent-of-overall-revenues-for-south-africas-daily-maverick/) |
| **Semafor** | News with a format gimmick | **"Semaform"** (facts / reporter's view / room to disagree) — a rigor signal that fits an intelligence brand. [Wikipedia](https://en.wikipedia.org/wiki/Semafor_(website)) |
| **Stratechery / Lenny's** | Solo/expert subscription | Simple one-tier (~$10–12/mo, annual push); community + research lead magnets drive most growth. [Stratechery](https://stratechery.com/stratechery-plus/) |

**Read:** MonoKromatik is essentially **"Business of Fashion for African & Diaspora brand-culture"** — and on *editorial/analytical depth and AI tooling* it's already credible. The gap is entirely on the **commercial and product mechanics** that turn depth into a business: BoF monetises its index, runs tiers, events and B2B; we have the better automation but none of the money machinery switched on.

---

## 3. FIX (correctness · trust · UX)

1. **Turn on monetization** (biggest single gap). Membership checkout is dark. See §6 — needs the dual-track payment reality solved, not just env vars.
2. **Wire analytics** (Plausible or PostHog). Table stakes; nothing else in this doc is tunable without it. PostHog also gives funnels + A/B + flags free to ~1M events. [thebomb](https://thebomb.ca/blog/website-analytics-ga4-alternatives-2026/)
3. **Add a registration wall + metered paywall** (not hard). Captures the email that converts at ~19% (Piano); metered publishers get ~23 subs/1k visits vs ~7.6 freemium. [theaudiencers](https://theaudiencers.com/the-conversion-funnel-benchmark-report-compare-your-performance-to-85-digital-publishing-brands/), [WebsitePlanet](https://www.websiteplanet.com/blog/2025-paywall-index-a-data-driven-study-across-industries/)
4. **Resolve the stubs.** Hide `/listen`, `/watch`, `/shop` from nav until real, or kill them. Fill or hide `/arena`. Clearly label in-development Issue 002 features (dead hrefs read as broken).
5. **Consolidate IA.** Pick one home for culture (`/roots` **or** `/culture`), clarify `/pulse` vs `/signal` vs `/weekly`. Reduce reader confusion + crawl waste.
6. **SEO foundations.** Add `sitemap.ts`, explicit `robots`, and **JSON-LD: `Article` on pieces + `Dataset` on the Index** (Google removed FAQ rich results May–June 2026 — don't build on FAQ schema). [Google Dataset](https://developers.google.com/search/docs/appearance/structured-data/dataset)

---

## 4. ADD (engagement)

**The headline move: make the Index a living product, not a page.** It's simultaneously the best SEO asset, the most shareable content, the most defensible paid product, and the B2B line.
- **Historical tracking** — store score snapshots over time; "how the score moved" turns a static rank into a reason to return. [YouGov](https://yougov.com/en-us/business/products/brandindex)
- **Filters + "X vs Y" compare views** — each combination is a new engagement reason and a sellable cut. [G2](https://www.withdaydream.com/library/g2)
- **Embeddable badges** brands proudly display → manufactured backlinks + pre-qualified referral traffic.
- **Annual "Class of" franchise** — a dated reveal moment that earns media and a back-catalog of evergreen pages. [BoF500](https://www.businessoffashion.com/bof500/)
- **Programmatic per-brand / per-category pages** off the Index dataset → thousands of long-tail SEO entries.

**Then the funnel + habit loop:**
- **Newsletter as funnel** (not the product): fixed weekly sectioned deep-dive, a "Semaform"-style fact/opinion split, a 3–6 email welcome flow, a 90-day win-back, referral/recommendation growth. [simonowens](https://simonowens.substack.com/p/inside-the-informations-paywall-strategy)
- **Personalization:** save items, **follow-a-brand**, and **alerts when an Index score changes** (ties engagement to the data product).
- **WhatsApp/Telegram distribution** for African reach (~200M WhatsApp users in Africa).
- **Community in the paid tier** + later an invite-only briefing/event; an **awards program built on the Index** is self-funding (entry fees + sponsorship).

---

## 5. BACKEND to add / enhance

- **Analytics + events:** Plausible (privacy, cheap) or **PostHog** (funnels, A/B, flags). Wire conversion events (signup, paywall hit, checkout).
- **Dual-track payments (critical):** Paystack/Flutterwave recurring is **card-only** and African cross-border cards throttle/fail — so **Stripe/Atlas for diaspora auto-renew + Paystack one-off "pay-again" + PPP local tiers** for African subscribers. [Paystack](https://support.paystack.com/en/articles/2133058), [GR4VY](https://gr4vy.com/posts/subscription-payment-decline-recovery-handling-failed-recurring-charges-and-retry-strategies-that-work/) The entitlement infra (Supabase `entitlements`) already exists — extend it for one-off renewals.
- **Index as data:** persist historical score snapshots, an export/API, and a **badge-embed endpoint**. This is what unlocks tracking, programmatic pages, and B2B licensing.
- **SEO infra:** `sitemap.ts`, `robots`, JSON-LD components (Article + Dataset), OG-image routes for case studies + Index (articles have them; others don't).
- **Email/CRM automation:** Kit is wired — add the welcome + win-back flows.
- **Defer:** dynamic/propensity paywall (needs traffic volume first); vector search (lexical corpus is fine at this scale).

---

## 6. MONETIZATION roadmap (make it earn)

**Now — operator (Paystack account in review):** finish go-live. Report (R899) is live; membership needs plan URLs + the dual-track setup above. _Claude can't enter payment credentials or change the financial dashboard._

**Tier 1 (ship first):** registration wall + **one paid tier (~$10–12/mo, annual discount pushed)** + metered access. Annual removes 11 monthly cancel decisions. [Piano](https://www.piano.io/resources/monthly-vs-annual-subscriptions-why-the-answer-isnt-either-or)

**Tier 2:** a **C-suite "Index/data" tier** at 3–6× base (expensable, signals authority) + **team/group memberships** to capture institutional budgets.

**Tier 3 (high margin, off the Index):** license **league tables** ($1,250–6,000 band), sell **custom single-brand scorecards** (every ranked brand is a warm lead — we already scaffolded this), **entry/badge fees** to be considered/ranked, and **sponsorship around the Index reveal + events**.

**Pricing reality:** dual-track is non-negotiable — **PPP/local tiers** (sub-$1–$5 entry) for African readers + **full diaspora USD/GBP price**. Budget ~0.5–1% anonymous→paid sitewide, ~2–5% newsletter→paid; only ~18% of people pay for any online news. [Reuters Institute](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/dnr-executive-summary)

---

## 7. Prioritised roadmap

- **P0 — unblock revenue + sight:** wire analytics (PostHog/Plausible); finish payments (dual-track) when Paystack clears; registration wall + email capture.
- **P1 — turn the moat into a product:** Index stickiness — historical snapshots, filters + compare, embeddable badges, programmatic per-brand pages, JSON-LD `Dataset`. (One build that is simultaneously SEO, engagement, and the B2B product.)
- **P2 — engagement loop:** newsletter funnel + welcome/win-back flows; WhatsApp distribution; save/follow-a-brand/score alerts.
- **P3 — IA cleanup:** consolidate redundant routes; resolve/hide stubs; finish or hide audio/video/shop.
- **P4 — B2B revenue:** custom scorecards, license tables, sponsorship around the reveal, events/awards.

**What I can build now (no Paystack dependency):** P0 analytics + registration/metered wall, **all of P1 (the Index product — highest leverage)**, P2 engagement, P3 cleanup, the SEO/JSON-LD work, and the scorecard/license surfaces. The only hard blocker is the live payment switch-on.
