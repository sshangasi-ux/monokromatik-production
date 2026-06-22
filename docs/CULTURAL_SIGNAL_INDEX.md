# The Cultural-Signal Index — design spec (RFC v0)

Status: **RFC — open decisions flagged at the end.** This is the keystone of the
content engine's value ladder: a single proprietary metric that is, at once, a
**brand-identity device**, an **IA / discovery backbone**, and a **monetisable
data product**. Pitchfork proved one scored atom can carry a publication's whole
identity; this is MonoKromatik's equivalent for African cultural/brand work.

## The unlock: the score already exists

Every one of the **24/24** published case studies already carries a four-axis
`decode` (`lib/case-studies.ts` → `CaseStudyDecode[]`), each axis scored **1–5**
with a one-line note:

| Axis | Reads | Example note |
|---|---|---|
| **IDEA** | originality / cultural force of the idea | "Heritage carried as design language, not decoration." |
| **AUTHORSHIP** | *who shaped it* — African-authored vs localised | "African creative collective central to the work." |
| **EXECUTION** | craft, narrative, product detail | "Craft, narrative and product in lockstep." |
| **CONSEQUENCE** | did it move culture / commerce | "Africa-first launch signals intent beyond a drop." |

The data already expresses the founding thesis: African-authored work scores
AUTHORSHIP 4–5; global sponsors cluster at **2**. The Index just **names,
composites, rolls up, surfaces, and monetises** what's already there — so Phase 1
needs **zero new data entry**.

## The metric

**Cultural-Signal Score (CSS)** — a composite of the four axes, surfaced as one
headline number plus the four-axis breakdown.

- **Display:** headline scaled to **/100** (Pitchfork-style recognisable atom),
  with the 1–5 axis breakdown shown as a small radar/bars. *(Open decision A.)*
- **Composite:** recommended **authorship-weighted** mean — AUTHORSHIP carries the
  brand thesis, so it should weigh heaviest (e.g. IDEA 0.25 · AUTHORSHIP 0.35 ·
  EXECUTION 0.15 · CONSEQUENCE 0.25). *(Open decision B.)*
- **Scored unit + rollups:** the **work** (case study) is the atom; scores roll up
  to a **brand-level** index (mean of that brand's works) and an overall **Index /
  leaderboard** across the corpus, sliceable by collection, market, and region.
  *(Open decision C.)*

## Where it lives (IA)

1. **Score chip** on every case-study card and the detail hero — the recognisable
   atom (number + tiny axis sparkline).
2. **Sort & filter** the case-study library by CSS and by any single axis
   ("highest AUTHORSHIP", "biggest CONSEQUENCE") — discovery backbone.
3. **Brand index pages** — a brand's CSS, its works, trajectory over time.
4. **The Cultural-Signal Index** — a periodic ranked leaderboard / report: the
   flagship data artifact and the thing brands want to be measured by.

## Monetisation (the keystone)

- The aggregate **Index report / dataset** sits in the premium / partner tier (it
  *is* the Intelligence product), powering the free→paid funnel.
- Per-brand scores are a **shareable hook** — brands will want to see and improve
  their standing; that's distribution and inbound.
- It gives the paid tier a defensible, proprietary spine no competitor has.

## Governance & provenance (credibility, not vanity)

- The CSS is **editorial judgment**, labelled interpretive — it reuses the existing
  `verification` tier (`verified | partial | interpretive`) so every score carries
  a confidence signal.
- **Publish the methodology** (a public page): axes, weights, how levels are set.
  Provenance-as-product — the transparency is the moat.
- AUTHORSHIP claims must be **evidence-backed** (tie to `evidence.confirmed` /
  `sources`); a low authorship score on a global brand is a *defensible reported
  reading*, never a cheap shot.

## Data model & computation

- New `lib/signal-index.ts`: pure functions — `compositeScore(decode, weights)`,
  `brandIndex(caseStudies)`, `rankIndex(caseStudies)`. Derives everything from the
  existing `decode`; **no schema change required for Phase 1.**
- Optional later: persist a computed `signalScore` onto each case study for SEO /
  static rendering, and an AI-drafted decode in the case-study pipeline.

## Phased build

- **Phase 1 — Compute + surface (SHIPPED):** `lib/signal-index.ts`; `SignalScore`
  chip on case-study cards + detail; "Top signal" sort on the library.
- **Phase 2 — Index as product (SHIPPED):** `/intelligence/signal-index` ranked
  leaderboard + on-page methodology; `/intelligence/signal-index/[brand]` brand
  pages (aggregate score, dimension averages, works). Entry point from the
  case-studies page.
- **Phase 3 — Scale the scoring:** AI-drafts the decode from each case study's
  evidence (context / strategicBet / creativeMove / africanRead / evidence) with
  rationale → **human approval** (matches the autonomy matrix — case studies are
  human-gated). Closes the loop with the content engine.
- **Phase 4 — Monetise:** gate the aggregate Index report behind premium/partner;
  per-brand share cards as the inbound hook.

## Decisions — LOCKED (2026-06-22)

- **A — Headline scale:** **/100 composite**, with the 1–5 axis breakdown beneath.
- **B — Composite weighting:** **authorship-weighted** — `IDEA 0.25 · AUTHORSHIP
  0.35 · EXECUTION 0.15 · CONSEQUENCE 0.25`. Composite = Σ(level/5 × weight) × 100.
- **C — Scored unit / rollup:** **work → brand → index** (per-case-study score,
  brand-level mean, overall ranked leaderboard).
- **D — Derivation:** **hybrid** — AI drafts axis levels from evidence, editor
  approves (Phase 3; matches the human-gate on case studies).
