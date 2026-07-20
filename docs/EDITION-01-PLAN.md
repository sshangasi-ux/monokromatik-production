# The Cultural-Signal Index — Edition 01

**Baseline snapshot:** 30 September 2026 · **Rubric:** v2.0 · **Status:** in build (live, backfilled to launch)

The plan of record. Four research streams (flagship anatomy, web-report design, African
distribution precedent, ratings data-visualisation) plus an audit of our own corpus.
Where research and our data disagreed, the data won — those cases are marked 🔴.

---

## 1. The three findings that shape everything

### 🔴 Finding 1 — 68 of 69 brands have exactly ONE scored work
Only Flutterwave has two. Our methodology page currently promises the opposite:

> *"A brand's position is the mean of its scored works, so one strong campaign doesn't
> permanently define a brand."*

With n=1 for 99% of the panel, one campaign **is** the brand. Shipping Edition 01 as
"the definitive ranking of African brands" invites the first competent analyst to find a
single case study behind each rating.

**Decision: Edition 01 ranks WORK, not brands.** *"The 70 pieces of African brand-culture
work we rated this year."* This is more defensible, more distinctive (Brand Finance ranks
financial value; Brand Africa 100 ranks consumer admiration; nobody ranks the work), and
it is what we actually measured. Brand-level roll-up ships as a secondary view, explicitly
marked provisional until brands carry 3+ works.

The alternative — backfilling to 3 works per brand — needs ~140 more case studies in ten
weeks. Not achievable at quality.

### 🔴 Finding 2 — 75% of brands are tied; only 34 distinct scores exist
Four axes at 1–5, weighted .25/.35/.15/.25, reduce to `5·IDEA + 7·AUTH + 3·EXEC + 5·CONS`
— a lattice with ~75 achievable values. Seven brands sit at 68; five at 82; five at 79.

**A ranked 1–69 league table is fake precision** and is a bigger misleading-chart risk than
the rebase. Ranks 40–47 are tie-break noise presented as findings.

**Decision: the hero exhibit is a banded dot-strip (Universe Strip), not a league table.**
Ties render as ties. The sortable table survives as a utility, below the fold.

### 🔴 Finding 3 — the mean fall must be quoted like-for-like, never snapshot-to-snapshot

| Date | Rubric | n | Mean |
|---|---|---|---|
| 23 Jun | v1 | 24 | 83.8 |
| 13 Jul | v1 | 64 | **80.0** |
| 20 Jul | v2.0 | 69 | **70.2** |

The mean fell 83.8 → 80.0 **under the unchanged v1 rubric**, purely because the panel grew
from 24 to 64. Quoting "83.8 → 70.2" blends panel growth with rescoring and overstates our
own rigour.

**The only honest figures:** like-for-like on the 62 brands present in both snapshots,
**79.9 → 69.7 (−10.1)**; or work-level on the identical 72 works, **79.4 → 70.0 (−9.4)**.
Publish the decomposition — it pre-empts "your mean fell because you added weaker brands".

---

## 2. The headline finding

| Axis | Mean | Reading |
|---|---|---|
| EXECUTION | **3.84** | the work is well made |
| IDEA | 3.70 | and well conceived |
| AUTHORSHIP | 3.53 | less well owned |
| CONSEQUENCE | **3.10** | and least well captured |

> **The craft is there. The capture isn't.**

**Ship two numbers: a winner and a gap.** The Henley Passport Index is the cleanest case —
Singapore has been #1 three years running, so the winner is stale by design, but the
*mobility gap* (192 − 24 = **168 destinations**) is stated as a finished sentence in every
release, moves every cycle, and recruits policy and opinion desks that a travel ranking never
reaches. A winner is trivia; a gap is an argument.

**Our gap is the 0.74 between EXECUTION and CONSEQUENCE.** That is our 168. The #1-rated work
is the trivia; the craft/capture gap is the story, and it regenerates every edition.

**The press number: 76% — three in four works could not show an outcome a third party could
check** (only 17 of 70 score CONSEQUENCE 4+). A deficit, and already in "three in four" form.

**The comparison is the product.** Stripe attaches its headline to an external yardstick every
reader already holds — "roughly 1.6% of global GDP", the same construction three years running.
a16z does the same: "$46 trillion in stablecoin volume — more than double PayPal". In both
cases the press reproduces *the comparison*, verbatim, not the raw figure. A number alone does
not travel; a number with a yardstick does. Every edition headline must carry one.

The 0.74 gap between how well African brand-culture work is *made* and what it *returns* is
the founding thesis, measured rather than asserted. Supporting: 23% of works pair a strong
idea (4+) with weak authorship (≤3); 20% score AUTHORSHIP ≤2 (African talent as input only).

Research note: across State of JS, Stack Overflow and JetBrains, **a well-chosen declining
or deficit number outperforms every growth number for press pickup** ("trust fell 40% → 29%"
was the most-quoted 2025 developer-survey finding). Our headline is a deficit number. Good.

**Limitation to disclose, not bury:** IDEA has zero scores below 3. That is range
restriction from a selected sample — we write about notable work, so we never rate a boring
campaign. Saying so first is cheaper than being caught.

---

## 3. Charts we must never build

- **Sankey / transition matrix / alluvial from v1 bands to v2.0 bands.** The canonical
  rating-migration form, and it requires a stable cohort under a stable methodology. We have
  neither. It would render our methodology change as ~60 brand downgrades. This is the single
  most defamatory chart available to us.
- **Radar / spider.** Cannot represent unequal weights — renders AUTHORSHIP (35%) and
  EXECUTION (15%) as equal spokes. Enclosed area is not proportional to the composite.
- **Bump chart across snapshots.** Panel composition changes every snapshot, so a "fall" may
  just be new entrants above. Hides magnitude entirely.
- **Any line drawn through the rubric boundary** (including sparklines). Split the path;
  render same-rubric runs only. Already enforced in `lib/index-history.ts`.
- **A 1–69 ordered bar as the primary view.** See Finding 2.
- **Pie/donut of band shares.** Seven slices, several tiny. The waffle is strictly better at n=69.

---

## 4. Language we must never use

We have no fieldwork. These are Afrobarometer / GeoPoll / Kantar words and misusing them is
disqualifying rather than merely sloppy:

> ❌ survey · respondents · ±% margin of error · n= · representative · sample

**Our line:** *a transparent, rubric-based expert rating of creative work — not a survey, not
a valuation, not an admiration poll.*

Also never: an advisory board that isn't real and written; partner or "as featured in" logos
without agreement; academic affiliation or peer review; ISO/audit/certification claims;
traffic or subscriber numbers while traffic is near zero; "Africa's leading/most trusted".

The category claim — **the only rating agency for African brand-culture craft** — is
defensible and sufficient.

---

## 5. Anatomy

Chaptered long-scroll, hub-and-spoke. Each chapter readable alone; the hub is a cover.

**URL strategy: an evergreen hub plus dated edition permalinks — never fragment authority
across annual URLs.** Henley's `/passport-index` always holds the current ranking and
accumulates all the SEO equity, while each edition's analysis gets its own citable archive
address. We already have the evergreen half.

```
/intelligence/signal-index                         EVERGREEN — always the live ranking (exists)
/intelligence/signal-index/edition-01              cover + contents + the decision object
/intelligence/signal-index/edition-01/[chapter]    chapter (1,200–1,800 words)
/intelligence/signal-index/edition-01/exhibits     every exhibit, stripped, for deck-lifting
/intelligence/signal-index/methodology             already live
```

Methodology sits **last** in the report nav (State of JS, Stack Overflow and JetBrains all do
this — disclosed, but not in the reader's way). Note this does not conflict with publishing
the methodology page *before* launch at T-7d; that is a separate act.

Chapters:
1. **The finding** — the craft/capture gap, the one number, the decision object.
2. **How we score** — the rubric, the four axes, the worked examples (already live).
3. **The universe** — all 70 works, the bands, the distribution.
4. **Authorship** — the 35% axis; who originated vs who controls. The heart of the thesis.
5. **Consequence** — the announcement rule; why 41 of 70 works sit at level 3.
6. **What moved, and what didn't** — the rebase, disclosed. Panel growth vs rescoring.
7. **Limitations** — n=1, ties, range restriction, selection. Loudly.

Each chapter ends with "What this means" (3 bullets) and a next-chapter card — seven
completions rather than one marathon.

---

## 6. Exhibits

**The `<Exhibit>` shell is the product, not the charts.** Economist-style chrome: amber top
rule, numbered tag, title/subtitle flush left, and a source line always ending
`MONOKROMATIK CULTURAL-SIGNAL INDEX · RUBRIC v2.0 · 30 SEP 2026`. That string is what makes
a screenshot in someone else's deck still credit us. It is the distribution mechanic.

Priority order (build 1–3 first; they are the 80%):

| # | Exhibit | What it shows | Must not overclaim |
|---|---|---|---|
| 1 | **Universe Strip** | all works on 0–100 with band gutters as fixed furniture; ties stack vertically | no rank numbers; caption states each tick is one work |
| 2 | **Band Ledger** | waffle, one square per work, per band | don't imply the shape was designed; bands are absolute cut-offs |
| 3 | **Weighted Contribution Bar** | four axis slots at true widths 25/35/15/25, filled to level/5 | label as 1–5 judgements, not measurements; never render 3/5 as "60%" |
| 4 | **Evidence Row** | works-dots (n=1 unmissable) + evidence tier ladder | never render a confidence interval we haven't computed |
| 5 | **Scorecard** | composes 1 + 3 + 4 for one work | show rank only with "tied with N others" |
| 6 | **Rebase Exhibit** | v1 and v2.0 distributions side by side, hard break rule | **no connector, arrow or slope between them** |
| 7 | **Axis Ladder** | the 1–5 rubric levels with the achieved level marked | don't imply equal intervals |
| 8 | **Panel Ledger** | n per snapshot with rubric bands | never plot mean as a continuous line |

**Colour rule: bands are never colour-coded.** The band *is* a position on the axis;
colouring it too is redundant encoding that reads as good/bad. Band identity = position +
alternating neutral gutters + a direct letter. **Amber is reserved for one job: "the thing
you are currently looking at."** Never for "high score". Density (opacity 0.45 vs 1.0)
carries the third level — works in monochrome print and under every colour-vision deficiency.

**Accessibility:** simple exhibits get `role="img"` + `<title>`/`<desc>`. Data-dense ones get
`aria-hidden` on the SVG plus a real `<table>` in a `<details>` — which doubles as the no-JS
fallback and as SEO-visible content.

**Export:** per-exhibit PNG server-side via `next/og`, reusing `lib/og-card.tsx`. Client-side
SVG→PNG is not viable (loses web fonts; Safari blocks `toDataURL` on inline SVG).

**Pre-clear the charts for republishing.** Buffer's State of Remote Work — a small team with
samples an order of magnitude below Edelman's — produced the most-quoted remote-work statistic
of its period, and its substitute for a raw-data release was one sentence on the page:
*"You are welcome to share and republish all of the charts on this page."* It makes the chart
the citable unit and removes the permission step entirely. Paired with the credit baked into
the exhibit footer, a lifted screenshot is both licensed and self-attributing.

This is the cheapest distribution mechanic available to us and it ships with Exhibit 01.

---

## 7. Design

- **Fraunces becomes the flagship's voice** — already loaded, used only ~24 times site-wide.
  Chapter titles `clamp(2.5rem, 6vw, 4.5rem)`, weight 300–400. Body stays Inter 19px/1.65.
- **Ink, not black:** `--mono-ink #141210` on `--mono-paper #FAF8F4`. Both tokens exist and
  are barely used.
- **Pull-stat blocks**, not pull-quotes: one number at `clamp(3rem, 9vw, 7rem)`, one per
  chapter maximum.
- **Amber rationing:** exhibit rule + tag, active chapter, pull stats, links, highlighted
  series. If a page has more than five amber events, delete one.
- **Dark mode: not in these ten weeks.** It is dead code sitewide; one dark-aware report
  against a hard-coded site is worse than none. But build exhibits against semantic tokens so
  a later migration is free.

**Interaction budget.** Build: table sort, filter/search (exists), compare (exists),
"highlight this work across every exhibit" via one `?work=` param, anchors, per-exhibit PNG.
Skip: scrollytelling, tooltip-first reading, animated entrances, zoom/pan, a chart library.

---

## 8. Launch

**30 September 2026 is validated.** It dodges the Jan–Feb funding-report pile-up (Partech,
Disrupt Africa, TechCabal SOTIA within two weeks) and — critically — **late May, when Brand
Finance Africa 200 and Brand Africa 100 both land**, at editions 13 and 16. We would be a
footnote to two incumbents on our own beat.

**The reason to keep it:** Loeries Creative Week runs early October in Cape Town. Launching
30 September puts a craft-rating index in front of the African creative industry the week it
convenes to judge craft. Pitch MarkLives and Bizcommunity as a Creative Week curtain-raiser.

**Hazard:** 1 October is Nigeria's Independence Day. Publish 30 Sept morning; hold
Nigeria-angled derivatives until 2 Oct. (24 Sept, SA Heritage Day, warms a culture frame.)

### Sequence
- **T-21d** — full Index under embargo to a named shortlist, with methodology note, CSV, three pre-cut charts.
- **T-14d** — **notify every rated brand**: score, rubric, corrections route, response published alongside. *(Operator action — Sibu sends. This is the single highest-value credibility act available to us, and basic fairness given we rate Coca-Cola, Visa and Budweiser at AUTHORSHIP 1.)*
- **T-7d** — publish the methodology page alone, before the scores. Gives sceptics something to attack early.
- **Day 0** — Index live, **ungated**, permanent URL. CSV + PDF pay-what-you-want with $0 allowed. Operator's personal LinkedIn, not the brand page.
- **Day 0** — **pre-cut the release by market ourselves.** Henley publishes its UAE angle the
  same day as the flagship rather than waiting for local media to find it. A ranked list of
  70 works is 70 simultaneous local stories — every market is up, down or notably flat, and
  each is a headline somewhere. Ship the Nigeria, SA and Kenya cuts on day one.
- **Day +1 to +5** — one derivative per day: biggest riser, the AAA cohort, sector cut, country cut.
- **Day +7** — a **citation page**: "how to cite the Cultural-Signal Index", suggested citation string, chart pack under a permissive licence. Almost nobody in African BI does this.
- **Day 0** — **publicly commit to Edition 02's date.** Google/IFC's e-Conomy Africa 2020 was massively cited, never repeated, and left no franchise. One line, enormous compounding value.

### Citability — the mechanics, not the aspiration

Being quotable is a build task, not a hope. The evidence:

- **Data-availability statements that link to an actual URL or persistent identifier are
  associated with up to +25% citation impact** (531,889 articles analysed). Vague "available on
  request" language shows no such effect.
- **Open-access material is ~65% more likely to be cited on Wikipedia** than paywalled material.
- Journalists stall when data isn't public and complete. **Anything that requires emailing us is
  a story that doesn't get written.**

What to build, cheapest first:

1. **Pre-write the citation line, in two lengths, printed on the artefact itself** — top and
   bottom, not on a separate page. Nobody composes a citation who wasn't handed one. Our World
   in Data publishes both a short and a long form and a dual-attribution norm; copy the shape.
2. **A machine-readable file at a predictable URL suffix.** OWID's pattern is
   `/grapher/<slug>.csv`, `.metadata.json`, `.zip` (both + a README). We already serve
   `/api/index`; extending exhibits to `?format=csv` is small and is the single highest-leverage
   citability item after ungating.
3. **Never let a URL carry the citation alone.** Author, title and year must be on the page and
   in the recommended citation, so the work stays findable when a URL dies.
4. **An archived embed alongside the live one.** OWID lets an embedder choose a frozen version.
   This removes the reuser's fear that the number moves under their published article — a real
   objection for us, since our whole product is that scores move.
5. **Mint a DOI.** Not academic-only: DataCite covers grey literature and datasets, and needs
   five fields (creator, title, publisher, year, resource type). It removes our dependence on
   our own URL structure surviving, which matters for a series meant to run for years.
6. **`schema.org/Dataset` JSON-LD on every data surface** — `license` (version-specific URL),
   `identifier`, `isAccessibleForFree`, `temporalCoverage`, `spatialCoverage`, and
   `DataDownload`/`contentUrl`. We already ship Dataset JSON-LD on the Index; extend it to the
   edition and the exhibits.
7. **Methodology as its own addressable URL**, not a section inside the report. Pew publishes it
   as a separate document per study — it makes the method independently citable and separately
   attackable, which is the point.
8. **Build the trend line into the appendix.** Pew prints prior-wave results beside current ones
   as standard, which is what makes edition N+1 automatically newsworthy. Our equivalent: every
   score carries its rubric version and prior value once a same-rubric comparison exists.

### Embargo — the template

Adopt PLOS's shape for the T-21d send: materials **7 days** ahead, embargo lifts at **one fixed
clock time** (08:00 SAST / 07:00 WAT on 30 September), **no exclusives**, recipients must credit
and link to the source page, and the sanction for breaking it is removal from the list. Say all
of that in the email, bolded, and repeat the lift time in the subject line.

### Gating
Ungate everything citable. Every African report that achieved citation is free (Partech,
Disrupt Africa, UNESCO, Africa No Filter); every paid-first consumer play struggled (Stears
wound down its consumer subscription Oct 2023). **Our existing "ratings public, analysis
gated" split is already correct — do not tighten it for launch.**

The report is the funnel. The subscription is the product. The Index is the brand.

Price anchor: **Africa: The Big Deal at $219/yr** (verified 20 Jul 2026 — previously recorded
as $249). The one proven self-serve price in African BI.

### Targets
**Tier 1 (our beat):** MarkLives (Herman Manson) — best first call · Bizcommunity ·
The Media Online · Modern Marketing.
**Tier 2:** African Business (publishes Brand Africa 100 *and* Top 100 Banks) · The Africa
Report · Semafor Africa (Yinka Adegoke — highest-value single name) · BusinessDay NG.
**Tier 4 (subject matter):** Music In Africa · Rolling Stone Africa · TurnTable Charts
(a chart operator — natural peer).
**Tier 5:** Communiqué · Africa: The Big Deal · Africa No Filter.

**Thebe Ikalafeng / Brand Africa:** do not pitch as a rival. Position the Cultural-Signal
Index as measuring *craft*, where Brand Africa 100 measures *consumer admiration*. Making the
distinction ourselves, first, is cheap insurance.

---

## 9. What makes Edition 02 inevitable

- **Freeze the metric definitions.** State of JS's ten-year trend lines exist only because the
  four ratio definitions never changed since ~2016. Our four axes and weights are published
  and versioned — treat changing them as a methodology event, never a tweak.
- **Fixed section budget.** New chapters displace old ones. Growth by addition destroys
  comparability.
- **Cadence beats scale.** Africa: The Big Deal is two people; its citation dominance comes
  from a free weekly "one graph, one paragraph" drip, not from methodology. The report is one
  spike; the drip is the habit.
