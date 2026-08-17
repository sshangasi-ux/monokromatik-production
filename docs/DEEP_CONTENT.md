# Deep, Citeable Content — authoring contract

The system that lets a MonoKromatik article carry real depth **without padding**,
with every claim traceable. Three additive layers on the `Article` schema
(`lib/articles.ts`). All fields are optional — an article without them renders
exactly as before, and the legacy single `sourceLink`/`sourceName` still works
(it is synthesised as reference `[1]`).

## Layer 1 — Multi-source + inline citations

- Add a **`sources`** array: `{ publisher, label, url, use? }[]`. This is the
  reference list, rendered as a numbered **References** block at the foot of the
  piece. Order matters — the array is **1-indexed**.
- In `content`, put inline **`[n]`** markers right after the claim each source
  backs (e.g. `…grossed ₦2.26bn [1].`). They render as superscript links that
  jump to reference _n_. Rendering: `lib/remark-citations.ts` (a remark plugin)
  + the `a.citation-ref` override in `ArticleClient`.
- Machine-readable: every source is also emitted as `schema.org` `citation` in
  the article JSON-LD — a real signal to search/AI crawlers that the piece is
  sourced.
- **Invariant (enforced by `validate:data`):** every inline `[n]` and every
  module `source: n` must resolve to a real entry in `sources` (or the legacy
  source when `sources` is absent). A dangling `[n]` fails CI.

`remark-gfm` is enabled, so **markdown tables** also work in `content` — use them
for structured comparison inside the prose.

## Layer 2 — Structured evidence modules

Add a **`modules`** array. Each module renders as a titled block between the prose
and the Brand Read (`app/components/article/ArticleModules.tsx`). Types:

| type | shape | use |
|---|---|---|
| `numbers` | `{ type, title?, items: [{ value, label, source? }] }` | headline figures as stat cards |
| `timeline` | `{ type, title?, items: [{ date, event, source? }] }` | a dated, sourced sequence |
| `evidence` | `{ type, title?, confirmed[], reported[], notClaimed[] }` | the confirmed / reported / not-claimed ledger. Each entry is a string **or** `{ text, source? }` where `source` is a 1-indexed citation (renders a `[n]` on the line) |
| `precedents` | `{ type, title?, works?: string[] }` | comparable scored works from our corpus |

- Each stat/timeline item may carry a `source` (1-indexed into `sources`) — it
  renders as a `[n]` superscript on the datum.
- **Precedents**: omit `works` to auto-resolve the most relevant scored works
  from the Index (shared entity/topic); or pass explicit case-study slugs.
  Resolution lives in `lib/article-modules.ts` (`resolveModules`).

## Layer 3 — The entity flywheel

Add an **`entities`** array: `{ kind: 'brand' | 'person' | 'campaign', name, brand? }[]`.

- The article renders an **"In the Index"** rail (`EntityRail.tsx`): for each
  entity, its Cultural-Signal score (when the corpus has a matching scored work)
  and related coverage across articles + case studies.
- Reverse lookup: brand profile pages (`/intelligence/signal-index/[brand]`) now
  show a **"Latest coverage"** list of articles that tag or name the brand.
- Resolution: `lib/entities.ts` (`resolveEntities`, `getArticlesForBrand`).
  Matching is conservative — no score/coverage shown unless it genuinely matches.
- Set `brand` to bind a person/campaign entity to a specific brand slug when the
  name alone wouldn't match (e.g. a campaign whose Index work is under the brand).

## How it flows through the pipeline

- **Autonomous generator** (`lib/generate-article.ts`): feature-depth drafts are
  prompted to emit `sources` + inline `[n]` + `modules` + `entities`. Captured on
  the strict-parse path; the lenient fallback degrades gracefully (fields absent).
- **Agent/editorial drafting**: follow the scratchpad `DRAFT-SPEC` (same schema).
- **Rendering** is entirely server-resolved in `app/article/[id]/page.tsx`
  (`getReferences`, `resolveModules`, `resolveEntities`) and passed to
  `ArticleClient` — the corpus JSON never ships to the client.

## Authoring rules

1. **No fabrication.** Every `url` must resolve; every figure must trace to a
   source. If you can't verify it, don't assert it — soften or drop it.
2. Length is earned by **evidence**, not adjectives. Prefer a sourced number, a
   timeline row, or a precedent over another paragraph of prose.
3. Keep the voice. Modules carry the facts _out_ of the prose so the prose can
   stay argument-led.
