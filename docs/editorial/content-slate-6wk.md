# The 6-Week Content Slate — Three Niches, One Ladder

_Carved from a strategic review of the leading interests in the MonoKromatik founder's
LinkedIn network (Oct 2026): the densest, most senior clusters are **commercial sport /
sponsorship / rights**, **premium & luxury brand-building**, and **music / screen / culture
IP**. This slate concentrates the editorial engine on those three, and ladders every piece
from a free on-site read up to the consultant positioning._

See also: [deep-dive-standard](./deep-dive-standard.md) · [paid-deliverable-standard](./paid-deliverable-standard.md) · [signalling-lens](./signalling-lens.md) · `docs/INTELLIGENCE-SERVICES-MODEL.md`.

---

## The content ladder (every piece runs these four rungs)

| Tier | What it is | Revenue / role | Editorial rule |
|------|-----------|----------------|----------------|
| **T0 — Free read** | Quick on-site explainer (~800–1,200w), **interrogative**, carries contextual **affiliate/partner links** (`affiliate: true` → disclosure band) and funnels down | SEO + reach + affiliate + email capture | Free-feature standard: unpack, hold both branches open, value-capture as a _lens_ |
| **T1 — Deeper report** | Weightier insights-led deep dive, **concludes**, carries the **Bear Case** (R220 entry study, auto-linked via `lib/article-report.ts`) | Direct paid revenue | Paid-deliverable standard: verdict allowed + `counterCase` |
| **T2 — Flagship / Index** | The annual authority piece — a ranked **index / scoreboard** (R3,500 or bundle) | Signature credential + premium revenue | Named sourcing, evidence modules, real-photo-or-none |
| **T3 — Consulting** | The index _is the sales asset_ for bespoke **Culture-DD / Value-Capture** engagements (`advisory` band → `/work-with-us`) | High-ticket pipeline | This is where the BCG/Bain/McKinsey-tier positioning cashes in |

**Wiring already in the repo:** T0 `affiliate` flag → `AffiliateDisclosure`. T0→T1 funnel → `entryReportForArticle` (`lib/article-report.ts`) auto-maps on title/category/tags. T3 → `article.advisory` (interest id must match a `SERVICES` id in `lib/commerce.ts`; `signal-fit` for sport/sponsor pieces).

**Affiliate inventory by niche (T0, disclosed, never fabricated):** sport → kit/merch, match tickets, broadcast/streaming subs; premium → retailers, bottle shops, watch sellers; culture → concert tickets, streaming, books.

---

## Niche A — "The Deal Behind the Jersey" → _Leading Business-of-Sport Analyst / Consultant_

The densest, most senior cluster in the network (Playmakers, SAIL, Betway, Rugby Africa, FNB sponsorship). **The tentpole — lead with it.**

| Wk | T0 free read (affiliate hook) | T1/T2 report it feeds | Positioning |
|----|-------------------------------|-----------------------|-------------|
| 1 | **"Who funds the Springbok jersey now?"** — 2026 all-local line-up (FNB + Pick n Pay) _(kit/merch, broadcast)_ — **SHIPPED** | → `brand-study-the-springbok-world-champion-under-owned` (auto) + `whos-buying-african-sport-2026` (inline) | Analyst |
| 2 | **"What is a Springbok actually worth to a brand?"** — athlete-endorsement economics _(jerseys, boots)_ | → T1: Athlete-IP & Endorsement Value-Capture | Analyst + Consultant |
| 3 | **"Who owns the broadcast?"** — AFCON 2027 + rugby rights, free-to-air vs Canal+/SuperSport _(streaming subs)_ | → T1: African Sports Rights | BCG-tier (rights economics) |
| 4 | **"The gambling dividend"** — betting money as SA sport's new bankroll (Betway/Sunbet) _(responsible-play disclosure)_ | → T1: Who Bankrolls African Sport | Analyst |
| 5 | **"Who owns the club?"** — PSL / Durban City commercialisation & ownership | → T1: African Football Value-Capture | Consultant |
| 6 | **Teaser: the Retention Scoreboard** | → **T2: "The Business of Sport in Africa 2026"** index (companion to Who's Buying Africa + Ownership-100) | **T3** — annual credential that sells sport-DD |

## Niche B — "Premium, Made in Africa" → _Globally Leading Consultant (BCG/Bain/McKinsey vein)_

Kuiper/Resonance (ex-Global Brand Director SABMiller), luxury, premium drinks — the founder's own category gives it authority.

| Wk | T0 free read (affiliate hook) | T1/T2 report | Positioning |
|----|-------------------------------|--------------|-------------|
| 1 | **"Why can't an African premium brand charge premium?"** — the pricing-power question | → T1: Premium Pricing-Power | Consultant |
| 2 | **"Aspiration, imported"** — luxury & watches in Africa, who captures the margin _(watch/retail)_ | → T1: African Luxury Value-Capture | Consultant |
| 3 | **"Local spirit, global owner?"** — premium drinks ownership map _(bottle-shop)_ | → T1: African Premium Drinks | Analyst + Consultant |
| 4 | **"Culture is the pricing power"** — how culture-led brands earn the premium | → T1: Culture-to-Premium framework | BCG-tier (named framework) |
| 5 | **"The 15% podium"** — revisiting Brand Africa: why African brands lose the premium slot | → T1 | Consultant |
| 6 | **Teaser: Premium Africa Index** | → **T2: "The Premium Africa Index"** — ranked premium-retention benchmark (ties to Ownership-100) | **T3** — McKinsey-tier benchmark |

## Niche C — "Who Owns the Culture" → _Culture Thought Leader_

Already core (amapiano, Nollywood); the music/entertainment commercial bench (ex-Universal/EMPIRE/Warner) + experiential network validate buyer demand.

| Wk | T0 free read (affiliate hook) | T1/T2 report | Positioning |
|----|-------------------------------|--------------|-------------|
| 1 | **Amapiano value-capture** explainer (existing) _(streaming, tickets)_ | → `who-captures-amapiano-value-capture-report` (auto) | Culture Thought Leader |
| 2 | **"After the platform leaves"** — Nollywood box-office vs Netflix retreat _(streaming)_ | → T1: Screen Value-Capture | Thought Leader |
| 3 | **"Who owns the catalogue?"** — African music IP & publishing | → T1: African Music IP | Thought Leader + Analyst |
| 4 | **"The festival economy"** — live & activation value-capture _(ticket affiliates)_ | → T1: Live-Culture Value-Capture | Thought Leader |
| 5 | **"Who owns the creator?"** — influencer/creator IP & ownership | → T1 | Thought Leader |
| 6 | **Teaser: Culture Ownership Ledger** | → **T2: "Who Owns the Culture 2026"** — Culture Ownership Ledger (ties to Ownership-100) | **T3** — culture-DD authority flagship |

---

## How it resolves into positioning

- **Niche A → "Leading Business-of-Sport Analyst/Consultant"** — richest, most senior buyer bench; lead here.
- **Niche B → "Globally Leading Consultant (BCG/Bain/McKinsey)"** — frameworks + indexes are the tells; this niche manufactures them.
- **Niche C → "Culture Thought Leader"** — the reach / brand-equity engine that feeds the other two.

Each niche's **Week-6 index is the T3 credential** that converts a reader into a `/intelligence` consulting lead. Three indexes a year = three reasons to be cited as _the_ authority.
