# Always-on: the weekly thought-leadership draft

The video half of the editorial engine is already autonomous (`braam-weekly-shorts`,
Mondays). This closes the other half: the **Consultant × Culture-Curator** written
thought-leadership, drafted to standard on a cadence — but **agent-in-the-loop**,
because paid work does not publish unreviewed.

## What the scheduled task does (each run)

1. **Pick the piece.** Read `data/articles.json`, `data/reports.json`, the tracker
   (`data/acquisitions.json`) and the Index. Choose the single highest-leverage gap
   for the week — a flagship essay, a deep report, or a brand study — biasing toward
   the ownership / value-capture spine and toward topics with fresh, sourced material.
   Do not repeat a topic already covered; check existing slugs first.
2. **Draft to the standard.** Write it to
   [`docs/editorial/paid-deliverable-standard.md`](../editorial/paid-deliverable-standard.md):
   2,500–3,500 words, 7–8 named sections, the two-house register (strategy-house
   rigour × culture-house fluency), an original sourced exhibit, 8–15 named sources,
   segmented "so what", **and a real `counterCase` (the Bear Case module)**.
3. **Verify.** Every figure traceable to named reporting; "reported" vs "verified"
   labelled; no `imageUrl` unless a properly sourced image exists.
4. **Gate it.** Run `npx tsc --noEmit`, `npm run validate:data`,
   `npm run media:relevance`. Fix until green.
5. **Open a PR — do not merge.** Branch from `origin/main`, commit, push, open a PR
   titled `draft: <piece>` with a summary of what it is, the sources, and the CI
   status. Leave it for Sibu to review, edit and merge. The task's job is to put a
   standard-clearing draft on the desk every week, not to publish.

## Why agent-in-the-loop
The whole brand rests on the paid shelf being defensible. Autonomous drafting keeps
the cadence and does the heavy assembly; the human keeps the final say. The PR is the
handoff.

## The task
- id: `weekly-thought-leadership`
- schedule: Tuesdays (a day after the Shorts run, so the week's flagship is fresh)
- output: one PR per run, `draft: …`, never merged by the task.

Related: [`braam-shorts.md`](./braam-shorts.md) · the standard is
[`paid-deliverable-standard.md`](../editorial/paid-deliverable-standard.md).
