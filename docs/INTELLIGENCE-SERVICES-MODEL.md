# The MonoKromatik Intelligence Services model

*Repurposing the Analytics FC playbook — across every vertical, not just sport.*

The premise: MonoKromatik currently **publishes** intelligence (articles, reports, the Index).
Analytics FC's lesson is to also **sell decisions** off the same engine — a ladder of
named advisory services, each answering one high-stakes question for one buyer. This doc
is the teardown of their model and the mapped MonoKromatik offering built from it.

---

## 1. What Analytics FC actually is (the transferable pattern)

Analytics FC is a football-only, data-driven consultancy. Strip out the football and the
architecture is a repeatable template:

1. **A proprietary engine** — databases + algorithms nobody else has. The moat.
2. **A SaaS platform** on top of it — *TransferLab* (scouting), recurring revenue.
3. **A ladder of decision-specific advisory products**, each aimed at a different buyer:
   - *Signature* — transfer/contract advisory (the player/agent).
   - *Coach ID* — recruitment/fit profiling (the executive).
   - *Acquisition* — M&A / investment due diligence (the investor) — their highest-value
     line, delivered **with a professional-services partner** (Ankura) for the legal/
     financial DD they don't do in-house.
   - *API Connect* — license the algorithms into a client's own stack.
   - *GBE Calculator* — a **free interactive tool** as the top-of-funnel lead magnet.
4. **One engine, many buyers.** The same data is packaged differently for clubs, players,
   agents, investors and media. That's the leverage.
5. **A skill base that fuses three things**: technical (data science, engineering, stats,
   maths, economics) × domain (coaching, scouting, player development) × commercial/
   advisory (banking, finance, sports-marketing, M&A), plus an **advisory board** of
   ex-sporting-directors and a **partner network** across 25+ countries.
6. **An authority engine** — podcast, articles, case studies, tier-1 media features — that
   feeds the funnel and justifies the fees.

**The one-line lesson:** turn a proprietary framework into a *ladder of productised
advisory services for named buyers*, keep a free tool at the bottom and a data licence at
the top, and partner out the work you don't own.

---

## 2. MonoKromatik already owns the engine

We don't need to build the moat — we have it, and it's **category-agnostic** where theirs
is football-only:

| Analytics FC asset | MonoKromatik equivalent (already built) |
|---|---|
| Proprietary database/algorithms | **The Cultural-Signal Index** + the **Who's Buying Africa** tracker + the **Ownership 100** ledger |
| Their analytical framework | **Authorship → Ownership → Capture (AOC)** + the four archetypes + the **signalling lens** |
| Case studies / articles / podcast | 189 articles, 34 reports, YouTube, the Sunday Pulse |
| TransferLab (SaaS) | The **Index API / Dashboard** (`DATA_PRODUCTS`, from $15k/yr) — exists, under-sold |
| API Connect | **License the Index** (from $6k) — exists |

What we *don't* yet do is Analytics FC's middle rungs: the **named, decision-specific
advisory services** sold to specific buyers. That's the gap this model fills — and unlike
Analytics FC, we apply it across **brand, culture, sport, music, spirits, retail, beauty
and fintech**, because AOC and the signalling lens are vertical-agnostic.

---

## 3. The MonoKromatik Intelligence Services ladder

Each service = one buyer, one decision, one deliverable, powered by our engine. Prices are
indicative bands to be quoted; they extend the existing `study → report → enterprise`
ladder in `lib/commerce.ts` upward into bespoke advisory.

| Service | The Analytics FC analogue | Buyer | The decision it answers | Draws on |
|---|---|---|---|---|
| **Signal Scorecard** *(exists, expand)* | — | A brand / artist / franchise | "What is our authorship worth, who's capturing it, how do we keep more?" | Index + AOC + signalling |
| **Signal Fit** *(new)* | Coach ID | Brands & agencies | "Which culture property / talent / moment actually fits — on authenticity, not reach?" | Index + signalling lens |
| **Value-Capture Advisory** *(new)* | Signature | A rights holder / IP or catalogue owner / founder | "How do we own the certification apparatus and stop the leak?" | AOC + signalling + the report method |
| **Culture Due Diligence** *(new, flagship)* | Acquisition | PE / VC / corp-dev / sovereign capital | "Should we buy in, at what value, and what's the authorship/reputational risk?" | AOC as a DD framework + the leakage model |
| **The Index — Licence / API / Dashboard** *(exists)* | TransferLab + API Connect | Media, agencies, research, platforms | "Give us the data / scores in our stack." | The Index dataset |
| **Free: the Value-Capture Checker** *(new)* | GBE Calculator | Everyone (lead magnet) | "Enter a brand → get a quick authorship→ownership→capture read." | A thin slice of the Index/AOC |

**Culture Due Diligence** is the equivalent of their Acquisition line and the highest-value
rung: a PE fund or corporate buying into an African brand, league, catalogue or fintech
gets a value-capture + authorship + reputational read that no bank or Big-Four DD provides —
because none of them read *culture* as an ownable asset. Like Analytics FC/Ankura, the
legal/financial DD is delivered **with a partner** (an African corporate-finance or law
house); we own the culture-and-capture layer.

---

## 4. The skill base to bring in ("and more")

Analytics FC's fusion, adapted — and broadened past sport because our verticals are wider:

- **Technical:** data science / analytics, data engineering, statisticians and **economists**
  (the value-leakage and valuation models need real quant), visualization.
- **Domain specialists, per vertical** — not just sport: music/catalogue, spirits & drinks,
  beauty, retail/FMCG, fintech, fashion/luxury. Contributor-network model, not headcount.
- **Commercial / advisory:** ex-brand and ex-agency operators (we have this in the founder),
  and critically **ex-PE / corporate-finance / M&A** talent to make Culture DD credible to
  capital — the skill we most lack today.
- **An advisory board** of operators and ex-executives (the *Boardroom/Backroom* founding
  targets are the seed list) for credibility and deal flow.
- **A partner network** for the enterprise tier: corporate-finance, legal, and on-the-ground
  research houses across African markets — the Ankura analogue.

We buy none of this as fixed cost up front: it's a **credentialed contributor + partner
network**, activated per engagement, the same way the editorial desk already commissions.

---

## 5. The cross-vertical principle (the MonoKromatik edge)

Analytics FC is trapped in football. Our differentiator is that the **same engine reads any
category**: who authored the value, who owns the certification apparatus, who captures the
premium. So every service above ships in *n* vertical flavours:

- *Sport* — the Springbok / African-sport work (live).
- *Music* — amapiano, Afrobeats catalogues and rights (live content, no service yet).
- *Spirits & luxury* — the "who owns the pour" work → a Value-Capture Advisory for an
  African-owned spirits house.
- *Beauty* — the coil/black-hair economy → Signal Fit for a beauty brand.
- *Retail / FMCG, fintech, fashion* — same template.

One playbook, many categories. That breadth is the thing a football-only shop structurally
can't copy.

---

## 6. Phased rollout

1. **Package what exists.** A single `/services` (or `/intelligence-services`) page that
   presents the full ladder — study → report → enterprise → the four advisory services →
   licence/API — routed to the existing `/work-with-us` enquiry. Formalise the four new
   services in `lib/commerce.ts` (`SERVICES` / `DATA_PRODUCTS` already scaffold this).
2. **Ship the free lead magnet.** The Value-Capture Checker (GBE-Calculator analogue) — a
   free interactive that returns a quick AOC read for a named brand and captures the email.
   Highest-ROI top-of-funnel; also the most shareable.
3. **Stand up Culture Due Diligence** as the flagship advisory line — pick the first partner
   (an African corp-finance/legal house), and lead-generate off the African-sport flagship
   (PE is already the audience of that report).
4. **Recruit the contributor + advisory network** against the vertical map, starting with the
   ex-PE/corporate-finance gap.

---

## 7. What already exists vs. the gap

- **Exists:** `lib/commerce.ts` `SERVICES` (scorecard, case-study, market-read, sponsor,
  license, partner) + `DATA_PRODUCTS` (scorecard $900, league table $1,250, full index
  $6k, API $15k/yr) + the `/work-with-us` enquiry + the three-rung report ladder.
- **The gap:** these are listed as a menu, not built as a *ladder of named advisory products
  with a buyer and a decision each*, there's no `/services` shopfront that tells the story,
  and there's no free interactive lead magnet. Sections 3–6 close that gap.

The engine is built and paid for. This is about *packaging and selling the decisions it can
already answer* — which is exactly the move Analytics FC made, and exactly what turns a
publication into an intelligence business.
