# MonoKromatik — Monetization Strategy

**Positioning:** *The Intelligence Behind African Influence.* The brand sits between editorial media and a research/intelligence product. That dual nature is the monetization edge: **audiences pay attention; professionals pay for intelligence.** Don't monetize the audience with cheap ads — monetize the *intelligence and access* the brand earns.

## Principles
1. **Trust first.** The review-gated, source-credited editorial is the asset. Never let monetization compromise the "distinct African judgment" promise — it's what a sponsor/subscriber is actually buying.
2. **Sell the analysis, not the pageview.** Generic display ads cheapen a premium intelligence brand and pay poorly at this scale. Lead with sponsorship, premium research, and partnerships.
3. **Build on what exists.** Signal, Intelligence, Issues, Reports, and The Weekly Signal newsletter are already the product surfaces — each maps to a revenue line.

## Phased plan

### Phase 0 — Foundation (now, $0)
Prerequisite for everything: **audience + proof**.
- Grow **The Weekly Signal** newsletter (the conversion we now track) — this list is the sellable asset.
- Stand up analytics conversions (see `docs/ANALYTICS.md`) so you can quote real numbers to sponsors/partners.
- Publish consistently (the daily review-gated pipeline) to build the archive + SEO surface.
**Metric:** subscribers, organic traffic, returning readers.

### Phase 1 — Sponsorship (first revenue, low build)
- **Newsletter sponsorship** — a single tasteful sponsor slot in The Weekly Signal ("Presented by…"). Sellable as soon as the list has a few thousand engaged African-marketing readers. *Build: a sponsor block in the email template + a media-kit page.*
- **Sponsored Brand Weather / Signal** — a brand underwrites a recurring intelligence briefing, clearly labelled, editorially independent. Fits the franchise model perfectly.
- **Media kit** — a `/partners` page: audience, reach, the franchises, contact. (Cheap, high-leverage.)
**Build:** sponsor slot component, `/partners` media-kit page, a contact/inbound form.

### Phase 2 — Premium Intelligence (recurring revenue)
The Intelligence + Reports surfaces are built for this.
- **Paid Reports** — the commissioning slate (Reports page) becomes downloadable premium PDFs / designed briefings, sold individually or via subscription.
- **Membership / paywall** — gate the deepest case studies + the research library + an "Ask MonoKromatik" tool behind a subscription (individual + team/agency tiers). Keep Signal essays free (top of funnel); paywall the *structured intelligence*.
- **Build:** Stripe (Checkout + Billing), a lightweight entitlement check (subscriber cookie/JWT), a paywall component, and report delivery. Start with one flagship paid report to validate willingness to pay before building the full membership.
**Pricing hypotheses (validate):** report $49–199; individual membership ~$15–25/mo; agency/brand team ~$200–500/mo.

### Phase 3 — Partnerships & Productized Intelligence (scale)
- **Brand-partnership packages** — bespoke intelligence + content for brands/agencies entering African markets (the "Will It Land?" and "The Work" competencies as a service).
- **Licensing / syndication** — license Brand Weather or case studies to agencies, or white-label intelligence.
- **Events / briefings** — paid roundtables or quarterly state-of-African-influence briefings for executives.

## Recommended sequencing
1. **Now:** newsletter growth + analytics conversions (done/underway) + a `/partners` media-kit page.
2. **Next 1–2 features:** sponsor slot in the newsletter; one flagship **paid report** (Stripe Checkout + email/PDF delivery) to prove willingness-to-pay — minimal build, real signal.
3. **Then:** membership/paywall on the research library once there's depth (ties directly to "deeper case work").
4. **Later:** partnership packages + licensing.

## What I can build next (engineering)
- `/partners` media-kit page (immediate).
- Newsletter sponsor slot (component + email template hook).
- Stripe Checkout + a single paid-report flow (entitlement + delivery) as the paywall MVP.
- GA4 ecommerce events (`checkout_start`, `purchase`) for revenue reporting.

> Decision needed before Phase 2 build: **subscription vs à-la-carte reports first**, and the **payment stack** (Stripe is the default). Everything else is sequenceable without external dependencies.

---

## Decision record — Phase 2: paid reports first (recommended)

**Recommendation: yes, lead with paid reports, then graduate to a membership/“Intelligence Pass.”** Reasoned argument:

1. **Validation economics favour the single ‘yes’.** A subscription asks for a *recurring* commitment before recurring value is proven; at pre-scale, paywall conversion is brutal (low single-digit % of engaged audience) and depends on retention you can’t yet demonstrate. A one-off report is one decision, and it tests willingness-to-pay for the *actual* product (intelligence) — not for a content treadmill.
2. **Production reality.** Subscriptions punish missed cadence with churn. MonoKromatik is review-gated, quality-first, low-volume — cadence pressure is in tension with the “distinct African judgement” promise. Reports are discrete, art-directable, and don’t expire like a feed; one excellent quarterly dossier is still a sellable asset. You cannot run a subscription on one drop a quarter.
3. **Price/value legibility for a B2B buyer.** Agencies and brand teams entering African markets already buy research à la carte (WARC/GWI/Nielsen single reports, consultancy briefings). “$X for *this* dossier on *this* market” is instantly evaluable; forecasting a year of value from a brand they just met is not. Sell to the muscle memory the buyer already has.
4. **Reports de-risk and *build* the subscription.** Each sale produces a **proven payer** (money, not just an email) — the warm cohort you later convert to membership. And a library is only subscribable once it has depth: reports first create the back-catalogue that makes an all-access Pass worth buying.
5. **Cash + signal now, optionality later.** Early non-dilutive revenue, plus hard willingness-to-pay data to quote to sponsors/partners (Phase 1) and to price the eventual Pass.

**Honest counter-weights (and mitigations):**
- Subscriptions give predictable MRR / higher LTV — *but only at scale with cadence + retention infra you don’t have yet.*
- Reports are a “sell it every time” treadmill with lumpy revenue → mitigate with a predictable publishing rhythm and an early **founding / season pass pre-sell** (a subscription-like commitment without needing a full library).
- One-off CAC can be high vs price → sell to the **warm newsletter list + B2B outbound**, not cold paid acquisition.

**Sharpened plan (where I’d refine the “reports first” instinct):**
- **Price as research, not an ebook.** $99–249 individual; multi-seat **agency/brand licence** $399–599 for the same report. B2B is where the money is.
- **Keep the funnel free.** Signal essays + Brand Weather stay open (trust, SEO, list growth). Paywall only the *structured intelligence* — reports, deepest case studies, the research library.
- **Ladder, not a leap:** free Signal → one flagship **paid report** → 2–4 reports build a catalogue → launch the **annual Intelligence Pass** (all reports + library + “Ask MonoKromatik”) once the catalogue justifies it.
- **Lighter engineering, too.** Reports need only **Stripe Checkout (one-off `payment` mode)** + an entitlement check + gated/PDF delivery. Defer Stripe **Billing** (subscriptions, dunning, proration) until the Pass. So “reports first” is also the cheaper, faster build.
- **Set an explicit gate before building membership:** e.g. *one report clears N sales / $X*, or an all-access waitlist crosses a threshold → then commit to subscription infra.

**Net:** ship the case-study generator’s output (the dossiers/reports we now produce) behind Stripe Checkout as the first paid product; treat every buyer as the seed list for the Pass; introduce the subscription only once the back-catalogue and cadence are real.
