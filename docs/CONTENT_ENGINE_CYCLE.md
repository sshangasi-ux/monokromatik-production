# The Content Engine Cycle — autonomous, AI-led, integrity-gated

An always-on cycle that **sources and drafts topical content across all five
sections** — Signal, Intelligence, Issues, Conversations, Culture — and routes it
to a **human-approval review queue**. AI does discovery + drafting; humans gate
publish for everything that carries a claim. This is how the engine scales
coverage without spending the brand's credibility.

## The workflow
`.claude/workflows/content-engine-cycle.js` — one web-research + draft agent per
section, run in parallel, each returning structured, cited, confidence-flagged
output. Re-run any time:

```
Workflow({ scriptPath: ".claude/workflows/content-engine-cycle.js" })
```

Per-section remit:
| Section | Output |
|---|---|
| Signal | 2 dispatches + a Brand Read each (what moved · who shaped it · who captured value) |
| Intelligence | a six-dimension case-study decode + the four-axis Cultural-Signal scores |
| Issues | the next issue's theme + a 5–6 feature slate mapped to the franchises (a plan, not fabricated features) |
| Conversations | 3 **real, named** contributor targets + interview briefs — never fabricated interviews |
| Culture | 2 Roots/Arena/Waves pieces |

## The integrity contract (non-negotiable)
Baked into every agent prompt, and proven in the first run:
- **Web-sourced + cited** — every factual claim carries a real source URL.
- **No fabrication** — never invents quotes, stats, names, or sources. (First run:
  *dropped* a stale UMG/Mavin lead, *corrected* a false "official anthem" claim,
  *refused* tabloid net-worth figures and a conflated Burberry campaign.)
- **Confidence flagged** — `verified | partial | interpretive` per item; the
  MonoKromatik "take" is labelled interpretive, not asserted as fact.
- **`needsHumanApproval: true`** on everything that carries analysis/claims —
  nothing is auto-published. Output lands in `output/engine-cycle/` as a review
  queue (see `INDEX.md`).

This matches the autonomy matrix in `AI_ORCHESTRATION_ARCHITECTURE.md`: discovery
+ drafting are automated; Signal case studies and Brand Reads are human-gated.

## The staging gate (queue → merge-or-close inbox)
`scripts/stage-engine-drafts.ts` + `lib/staging.ts` turn the review *queue* into a
review *PR*. After each cycle it: **extracts** structured candidates from the
markdown (an LLM proposes the structure), runs **deterministic gates**, then
**auto-patches** the safe lane and writes `output/engine-cycle/STAGED.md` with a
per-item verdict.

| Verdict | What it means |
|---|---|
| 🟢 AUTO_PATCH | Low-stakes **Culture** article, ≥2 independent sources, no duplicate → appended to `data/articles.json` |
| 🟠 NEEDS_AUTHORING | Claim-bearing (Signal/Intelligence/Issue) → human authors it; gates already passed |
| 🔵 ENRICH | Duplicates an existing entry → enrich it, don't add a second |
| 📇 OUTREACH | Conversations brief → reach out, don't publish |
| 🟡 HOLD | <2 independent source domains → needs corroboration |
| 🔴 REJECT | Failed schema → not usable as-is |

The gates (pure, in `lib/staging.ts`): **source-count** (≥2 distinct domains —
two articles from one outlet count as one), **dedup-vs-archive** (strict similarity
→ ENRICH; a softer signal, e.g. a shared brand in the same lane, → a *possible
duplicate* warning rather than a silent miss or a wrong auto-merge), and **schema**.
Only plain Culture articles are auto-written; claim-bearing kinds are never
fabricated whole — they're staged as proposals. Run `npm run engine:stage` (or
`engine:stage:dry` to classify without writing). **Publish is the human merge.**

## Making it "always-on"
The cycle is the unit; "always-on" = scheduling it + the review gate:
1. **Schedule** a recurring run (e.g. daily/weekly) via a cron cloud agent
   (`/schedule`) or the existing CI cadence. Each run refreshes the review queue.
2. **Review gate**: an editor reviews `output/engine-cycle/`, approves items, and
   only approved items are wired into `data/*.json` (the publish step) — exactly
   as the article pipeline already gates via the Editor-in-Chief.
3. **Compounds with the rest of the engine**: the learning loop tunes what gets
   surfaced; the coverage Planner steers toward thin Region × Franchise cells.

*Cadence is an operator decision (it runs autonomously + bills), so the recurring
schedule is set deliberately, not auto-created.*

## First cycle (this PR)
5/5 sections, 11 items, all cited + flagged — committed under
`output/engine-cycle/` as the inaugural review queue. Notably it drafted a
ready-to-build **Issue 002 "Culture Is Business: Who Owns the Upside"** slate that
maps onto the existing `data/issues.json` stub.
