// MonoKromatik — coverage Planner (the "self-creating" layer).
//
// The Curator alone is reactive: it picks the best of whatever Scout happened to
// surface. The Planner makes the system intentional — it models WHAT the site
// should cover (Region × Franchise), measures what's actually been published
// lately, and turns the gaps into (a) priority multipliers the Curator applies
// so incoming stories that fill thin cells rise, and (b) a ranked gap brief that
// surfaces where we have NO sourcing at all (e.g. Diaspora, North/Central Africa)
// — the actionable "commission queue".
//
// Pure + deterministic (pass `now` for tests). No editorial-value calls; it only
// nudges story-priority by coverage, exactly like the learning loop nudges by
// performance. Fail-open: an empty plan leaves curation unchanged.

import { RSS_FEEDS } from './rss-feeds';

// Canonical coverage axes. Regions deliberately include cells we cannot yet
// source (North/Central Africa, Diaspora) so the plan SURFACES those as sourcing
// gaps rather than hiding them.
export const REGIONS = [
  'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa', 'Pan-African', 'Diaspora',
] as const;
export const FRANCHISES = ['culture', 'sports', 'music', 'entertainment', 'news'] as const;

const WINDOW_DAYS = 21;
const TARGET_PER_CELL = 2; // healthy cadence per cell per window
const GAP = 0.34; // score below this = under-covered
const SAT = 0.85; // score above this (+ volume) = saturated
const WMIN = 0.7; // dampen saturated cells
const WMAX = 1.6; // boost empty cells

const norm = (s?: string) => (s || '').trim().toLowerCase();
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;
const cellKey = (region: string, category: string) => `${region}|${norm(category)}`;

const REGION_BY_SOURCE: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const f of RSS_FEEDS) m[norm(f.name)] = f.region;
  return m;
})();

// (region, category) cells that at least one feed can produce — used to mark a
// gap as "fillable now" vs "needs a new source".
const SOURCED_CELLS: Set<string> = (() => {
  const s = new Set<string>();
  for (const f of RSS_FEEDS) s.add(cellKey(f.region, f.category));
  return s;
})();

/** Map a source/outlet name to its region via the feed registry; Pan-African default. */
export function sourceRegion(source?: string): string {
  const key = norm(source);
  if (!key) return 'Pan-African';
  if (REGION_BY_SOURCE[key]) return REGION_BY_SOURCE[key];
  for (const name in REGION_BY_SOURCE) {
    if (key.includes(name) || name.includes(key)) return REGION_BY_SOURCE[name];
  }
  return 'Pan-African';
}

export interface CoverageItem {
  category: string;
  source?: string;
  region?: string;
  publishedAt: string;
}
export interface GapBrief {
  region: string;
  category: string;
  score: number;
  ageDays: number | null; // null = nothing in window
  count: number;
  sourced: boolean; // can existing feeds fill this?
}
export interface CoveragePlan {
  cellWeights: Record<string, number>; // cellKey → priority multiplier
  gaps: GapBrief[]; // thinnest first
  saturated: string[]; // over-covered cellKeys
  windowDays: number;
  generatedAt: string;
}

/** Build a coverage plan from recently-published items. Pure; pass `now` for tests. */
export function buildCoveragePlan(items: CoverageItem[], opts?: { windowDays?: number; now?: number }): CoveragePlan {
  const windowDays = opts?.windowDays ?? WINDOW_DAYS;
  const now = opts?.now ?? Date.now();
  const horizon = now - windowDays * 86_400_000;

  const tally: Record<string, { count: number; latest: number }> = {};
  for (const it of items) {
    const t = new Date(it.publishedAt).getTime();
    if (!isFinite(t) || t < horizon) continue;
    const region = it.region || sourceRegion(it.source);
    const key = cellKey(region, it.category);
    const cur = tally[key] || { count: 0, latest: 0 };
    cur.count += 1;
    if (t > cur.latest) cur.latest = t;
    tally[key] = cur;
  }

  const cellWeights: Record<string, number> = {};
  const gaps: GapBrief[] = [];
  const saturated: string[] = [];

  for (const region of REGIONS) {
    for (const category of FRANCHISES) {
      const key = cellKey(region, category);
      const cur = tally[key];
      const count = cur?.count ?? 0;
      const ageDays = cur ? Math.round((now - cur.latest) / 86_400_000) : null;
      const freshness = ageDays === null ? 0 : Math.max(0, 1 - ageDays / windowDays);
      const volume = Math.min(1, count / TARGET_PER_CELL);
      const score = 0.6 * freshness + 0.4 * volume; // 1 = well-covered, 0 = empty

      let w = 1;
      if (score < GAP) w = WMAX - (WMAX - 1) * (score / GAP); // → WMAX as score → 0
      else if (score > SAT) w = WMIN + (1 - WMIN) * ((1 - score) / (1 - SAT)); // → WMIN as score → 1
      cellWeights[key] = round2(clamp(w, WMIN, WMAX));

      if (score < GAP) gaps.push({ region, category, score: round2(score), ageDays, count, sourced: SOURCED_CELLS.has(key) });
      if (score > SAT && count >= TARGET_PER_CELL) saturated.push(key);
    }
  }

  gaps.sort((a, b) => a.score - b.score || b.count - a.count);
  return { cellWeights, gaps, saturated, windowDays, generatedAt: new Date(now).toISOString() };
}

/** Priority multiplier for an incoming story's (region←source, category) cell. */
export function coverageMultiplier(plan: CoveragePlan | undefined, source?: string, category?: string): number {
  if (!plan) return 1;
  return plan.cellWeights[cellKey(sourceRegion(source), category || '')] ?? 1;
}

/** Compact summary for the Curator prompt / audit logs. */
export function describeCoveragePlan(plan: CoveragePlan | undefined, top = 5): string {
  if (!plan) return '';
  const fillable = plan.gaps.filter((g) => g.sourced).slice(0, top);
  const unsourced = plan.gaps.filter((g) => !g.sourced);
  const fmt = (g: GapBrief) => `${g.region}×${g.category}${g.ageDays === null ? ' (none)' : ` (${g.ageDays}d)`}`;
  const parts: string[] = [];
  if (fillable.length) parts.push(`fill now: ${fillable.map(fmt).join(', ')}`);
  if (unsourced.length) parts.push(`${unsourced.length} unsourced cells (need feeds: ${[...new Set(unsourced.map((g) => g.region))].join(', ')})`);
  return parts.join(' · ');
}
