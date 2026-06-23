// MonoKromatik — franchise coverage (Planner v3).
//
// Parallel to the Region × Category plan (lib/coverage-planner.ts), this measures
// production across the editorial FRANCHISES and surfaces which product lines are
// thin — the input to commissioning. Pure + deterministic (pass `now` for tests).
//
// Franchises move slower than region/topic cells (a Brand Weather briefing is not a
// daily thing), so the window is wider and the per-franchise target lower.

import { EDITORIAL_FRANCHISES, type EditorialFranchise } from './editorial-franchises';

const WINDOW_DAYS = 42;
const TARGET = 1; // a healthy franchise produces ≥1 piece per window
const GAP = 0.34;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

export interface FranchiseItem {
  franchise: EditorialFranchise;
  publishedAt: string;
}

export interface FranchiseGap {
  franchise: EditorialFranchise;
  score: number;
  count: number;
  ageDays: number | null; // null = nothing in window
}

export interface FranchisePlan {
  scores: Record<string, number>; // franchise → coverage score 0..1
  weights: Record<string, number>; // franchise → commission priority (1 = neutral, >1 = thin)
  gaps: FranchiseGap[]; // thinnest first (Unclassified excluded)
  windowDays: number;
  generatedAt: string;
}

/** Build a franchise coverage plan from recently-published, franchise-tagged items. */
export function buildFranchisePlan(
  items: FranchiseItem[],
  opts?: { windowDays?: number; now?: number }
): FranchisePlan {
  const windowDays = opts?.windowDays ?? WINDOW_DAYS;
  const now = opts?.now ?? Date.now();
  const horizon = now - windowDays * 86_400_000;

  const tally: Record<string, { count: number; latest: number }> = {};
  for (const it of items) {
    if (it.franchise === 'Unclassified') continue;
    const t = new Date(it.publishedAt).getTime();
    if (!isFinite(t) || t < horizon) continue;
    const cur = tally[it.franchise] || { count: 0, latest: 0 };
    cur.count += 1;
    if (t > cur.latest) cur.latest = t;
    tally[it.franchise] = cur;
  }

  const scores: Record<string, number> = {};
  const weights: Record<string, number> = {};
  const gaps: FranchiseGap[] = [];

  for (const franchise of EDITORIAL_FRANCHISES) {
    const cur = tally[franchise];
    const count = cur?.count ?? 0;
    const ageDays = cur ? Math.round((now - cur.latest) / 86_400_000) : null;
    const freshness = ageDays === null ? 0 : Math.max(0, 1 - ageDays / windowDays);
    const volume = Math.min(1, count / TARGET);
    const score = round2(0.6 * freshness + 0.4 * volume);
    scores[franchise] = score;
    // Thin franchises get a >1 commission weight (mirrors coverage cell weights).
    weights[franchise] = round2(clamp(1 + (GAP - score) * 1.8, 1, 1.8));
    if (score < GAP) gaps.push({ franchise, score, count, ageDays });
  }

  gaps.sort((a, b) => a.score - b.score || (a.ageDays ?? Infinity) - (b.ageDays ?? Infinity));
  return { scores, weights, gaps, windowDays, generatedAt: new Date(now).toISOString() };
}

/** Compact one-line summary for logs / the commission brief. */
export function describeFranchisePlan(plan: FranchisePlan, top = 4): string {
  if (!plan.gaps.length) return 'all franchises covered this window';
  const fmt = (g: FranchiseGap) => `${g.franchise}${g.ageDays === null ? ' (none)' : ` (${g.ageDays}d)`}`;
  return `thin franchises: ${plan.gaps.slice(0, top).map(fmt).join(', ')}`;
}
