# MonoKromatik — Case Study Generator (#3)

Research-grade case studies in the brand's competencies — **The Work**, **Will It Land?**, **Intelligence** — produced by the pipeline, **staged for human review**, and rendered from data.

## Why it exists

The Issue 001 dossiers (e.g. *Nike × Air Afrique*) are the brand's most valuable, most defensible content: source-led, evidence-disciplined, distinctly African judgement. This extends that format into a repeatable, review-gated generator so the slate (`/reports`) can be filled with decision-grade pieces without hand-coding each page.

## The pieces

| File | Role |
|---|---|
| `lib/case-study.ts` | The `CaseStudy` data model + the four-axis decode, sources, verification ledger. |
| `lib/generate-case-study.ts` | `generateCaseStudy(brief)` — flagship-model generation with strict evidence discipline. |
| `lib/case-studies.ts` | Loader. Only `status: "published"` studies surface (the review gate). |
| `app/issues/case-study/[slug]/page.tsx` | Data-driven renderer (reuses `IssueFeature` + decode + `CoverArt` hero). |
| `scripts/generate-case-study.ts` | CLI: brief → staged JSON under `data/case-studies/`. |
| `data/case-studies/*.json` | Generated/seed studies. |

## Evidence discipline (the product promise)

The generator is built around the rule that makes the brand trustworthy:

- **Every factual claim is anchored to a supplied source.** The model is given the source material as ground truth and told not to exceed it. Generated `sources` are filtered to URLs that were actually provided — the model can't introduce citations we didn't give it.
- **Fact is separated from judgement.** The `decode` levels (1–5) are explicitly editorial judgement, each justified in a note — never a fabricated metric.
- **A verification ledger** records what's *confirmed* (primary source), *reported* (independent media), and *not claimed* (left open pending evidence).
- **No invented media.** Hero uses a self-hosted photo if supplied, otherwise the owned `CoverArt` composition — never an un-hotlinkable remote image.

## Workflow (review-gated)

1. Write a brief (`CaseStudyBrief`) — subject, competency, market, and the **sources** (URLs, optionally with text):
   ```jsonc
   {
     "competency": "WILL IT LAND",
     "subject": "…",
     "market": "NIGERIA / WEST AFRICA / DIASPORA",
     "caseNumber": "002",
     "sources": [{ "publisher": "…", "href": "https://…" }]
   }
   ```
2. Generate (runs where `ANTHROPIC_API_KEY` exists — CI or local):
   ```bash
   ANTHROPIC_API_KEY=… npm run generate:case-study briefs/my-brief.json
   ```
3. It writes `data/case-studies/<slug>.json` with `status: "review"`.
4. **A human reviews**, edits if needed, and sets `"status": "published"` (or merges the staging PR). Only then does it appear at `/issues/case-study/<slug>`.

## Status

- ✅ Generator, model, renderer, loader, CLI and one seed study (`nike-air-afrique-…`, ported from the reviewed live dossier) are in.
- ▶️ Next: a staging workflow (like the article agents) that opens a PR per generated study; a `/reports` slate that lists published case studies; commissioning 2–3 new briefs (Will It Land? dossiers).
