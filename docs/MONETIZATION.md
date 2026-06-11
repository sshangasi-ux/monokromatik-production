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
