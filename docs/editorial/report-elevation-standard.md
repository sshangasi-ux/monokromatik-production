# The report-elevation standard — lifting the library to the paid bar

*The program for turning the free report library into the paid shelf. Each report
we elevate becomes a decision-grade, beautifully-designed flagship — and therefore
a sellable product (and a bundle member, see `lib/commerce.ts` → `BUNDLES`).*

**The bar in one line:** *culture thought-leader × leading global consultancy ×
visually rich, strongly art-directed.* The first two legs are already defined in
[`paid-deliverable-standard.md`](./paid-deliverable-standard.md) — this doc adds the
**third leg (design)** and the **elevation workflow**.

---

## The three legs

1. **Consultancy rigour** — per the paid standard: a defensible framework spine
   (Authorship → Ownership → Capture), a **bottom-up, quantified** evidence base
   (not just a ranking — a model: where value is created vs captured, how much
   leaks, to whom), an original sourced exhibit per major claim, 8–15 named
   sources graded reported/verified, a Bear Case, and a **segmented "so what"**
   (founders / capital / policymakers / brands). 2,500–3,500 words.
2. **Culture thought-leadership** — the two-house voice: culture as an ownable
   asset, read with operator fluency, not observed. It reads as a *point of view*,
   not a database. The cultural read is a section, not a garnish.
3. **Visually rich / strongly art-directed** *(the new leg)* — see below.

## Leg 3 — the design bar (what "visually rich, strongly led" means here)

A paid report is a **designed document**, not a wall of text. To clear the leg:

- **An exhibit roughly every ~400–500 words**, each a *typed* exhibit from the
  design system (`app/components/dataviz/Charts.tsx`: bar / line / stack / matrix /
  quadrant / donut) — never a raw table where a chart would read better. Every
  featured `exhibit.note` names its source (the `media:relevance` guard enforces this).
- **One signature exhibit** per report — the chart that travels (screenshotted,
  cited, lifted into a deck). Usually the quantified value-capture/leakage model.
- **A strong cover / OG card** — the dynamic `/reports/<slug>/opengraph-image`
  already renders the branded cover; the title must earn it.
- **Pull-quotes and key-stat chips** (`keyStats`) that let a skimmer get the thesis
  in 20 seconds, and a reader go deep.
- **Rhythm** — short section headers in the house caps style, generous spacing, a
  figure-led open and an open/segmented close. Print-worthy (the
  `/ownership-100/edition` print pattern is the reference).
- **No fabricated or stock imagery** — real sourced photo or none; the visual
  richness comes from *data design*, not decoration ([`MEDIA-STANDARD.md`]).

> Test: could a reader hand this to an exec and have it hold its own next to a
> McKinsey deck *and* feel like it came from a brand with taste? If not, it's not done.

---

## The elevation program

### 1. Triage the 56 reports into tiers (do NOT elevate all)
- **Tier A — flagship candidates (~10–15):** the league tables, Culture-DD pieces
  and scorecards that carry the franchise. These are elevated to this bar **and
  made paid** (PDF + Paystack product + `access: 'premium'` + a bundle member).
- **Tier B — keep free, polish (~20):** strong deep-dives that earn SEO/authority.
  Give them a design + depth pass; they stay free (the moat taste).
- **Tier C — leave or retire:** lighter pieces; not worth the lift.

### 2. The elevation checklist (per Tier-A report)
- [ ] ≥ 2,500 words, 7–8 named sections per the paid standard.
- [ ] A **quantified** value-capture / leakage model + its signature exhibit.
- [ ] An exhibit roughly every ~400–500 words, all typed, all sourced.
- [ ] 8–15 named sources, graded; a real Bear Case (`counterCase`).
- [ ] Segmented "so what" by audience.
- [ ] Culture read as its own section (authorship/ownership/signalling).
- [ ] Preflight green: `tsc` + `validate:data` + `media:relevance`.

### 3. Production: pilot → line
- **Pilot:** elevate 1 Tier-A report fully (the reference build) + confirm the
  effort-per-report before committing to the tier.
- **Production line:** extend the weekly thought-leadership cron to elevate **one
  existing Tier-A report per week** (agent-in-the-loop, PR you review) — ~a
  quarter clears Tier A.

### 4. The paid-conversion path (per elevated Tier-A report)
1. Generate the designed **PDF** (manual for now — there is no auto-pipeline;
   `/reports/<slug>` + print, or a per-report `/edition` route). Upload to the
   private Supabase `reports` bucket.
2. Create the **Paystack product**; add its id to `REPORTS` in
   `lib/report-delivery.ts` and its checkout URL to `PAID_REPORTS` in
   `lib/commerce.ts`; set the report's `access: 'premium'`.
3. Add it to a **bundle** (`BUNDLES`) — the shelf grows, the bundles get richer.

**The payoff loop:** elevated report → paid PDF → new bundle SKU → bigger paid
shelf → bundles finally have mass → revenue. From 4 paid products toward 15–20.
