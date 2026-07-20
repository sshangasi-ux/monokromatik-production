// Edition 01 of the Cultural-Signal Index — the derivation layer.
//
// Everything the flagship states about itself is computed here from live data, so
// the report cannot drift from the corpus it describes. Backfilling case studies
// between now and the 30 September 2026 baseline updates the report automatically:
// no hand-typed totals anywhere in the prose.
//
// See docs/EDITION-01-PLAN.md for the decisions behind this, in particular:
//   - Edition 01 ranks WORK, not brands (68 of 69 brands have exactly one work).
//   - Ties are real and must stay visible (75% of brands share a score).
//   - The mean fall is only ever quoted like-for-like, never snapshot-to-snapshot.

import { getAllCaseStudies, type CaseStudy } from './case-studies';
import { compositeScore, signalBand, AXIS_WEIGHTS, SIGNAL_BANDS, RUBRIC_VERSION } from './signal-index';

export const EDITION = {
  number: '01',
  title: 'The Cultural-Signal Index',
  /** The baseline snapshot. Scores are as at this date; see the rubric. */
  baseline: '2026-09-30',
  rubric: RUBRIC_VERSION,
} as const;

const AXES = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;
export type Axis = (typeof AXES)[number];

export interface ScoredWork {
  slug: string;
  title: string;
  brand: string;
  market: string;
  collection: string;
  score: number;
  band: string;
  levels: Record<Axis, number>;
  access: string;
  verification: string;
}

const level = (c: CaseStudy, axis: Axis): number =>
  c.decode.find((d) => d.label.toUpperCase() === axis)?.level ?? 0;

/** Every scored work, highest first. Withheld works (no decode) are excluded by design. */
export function scoredWorks(): ScoredWork[] {
  return getAllCaseStudies()
    .filter((c) => (c.decode?.length ?? 0) > 0)
    .map((c) => {
      const score = compositeScore(c.decode)!;
      return {
        slug: c.slug,
        title: c.title,
        brand: c.brand,
        market: c.market ?? '',
        collection: c.collection ?? '',
        score,
        band: signalBand(score)?.band ?? '',
        levels: Object.fromEntries(AXES.map((a) => [a, level(c, a)])) as Record<Axis, number>,
        access: c.access,
        verification: c.verification,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export interface AxisSummary {
  axis: Axis;
  weight: number;
  mean: number;
  /** Count of works at each level, index 0 = level 1. */
  distribution: number[];
}

/** Per-axis means and level distributions across every scored work. */
export function axisSummary(works = scoredWorks()): AxisSummary[] {
  return AXES.map((axis) => {
    const levels = works.map((w) => w.levels[axis]).filter((l) => l > 0);
    const mean = levels.reduce((s, v) => s + v, 0) / (levels.length || 1);
    return {
      axis,
      weight: AXIS_WEIGHTS[axis],
      mean: Math.round(mean * 100) / 100,
      distribution: [1, 2, 3, 4, 5].map((l) => levels.filter((v) => v === l).length),
    };
  });
}

/**
 * The headline finding: the gap between how well the work is MADE and what it RETURNS.
 *
 * This is the edition's "one number" — and deliberately a deficit rather than a
 * winner. A #1 goes stale (the same work tops the list until it's displaced); a gap
 * is an argument, it moves every edition, and it recruits desks a ranking never
 * reaches. See docs/EDITION-01-PLAN.md §2.
 */
export function craftCaptureGap(works = scoredWorks()) {
  const s = axisSummary(works);
  const execution = s.find((a) => a.axis === 'EXECUTION')!.mean;
  const consequence = s.find((a) => a.axis === 'CONSEQUENCE')!.mean;
  return {
    execution,
    consequence,
    gap: Math.round((execution - consequence) * 100) / 100,
  };
}

export interface BandCount {
  band: string;
  label: string;
  min: number;
  max: number;
  count: number;
}

/** Works per band, in rating order (never sorted by count — the order IS the scale). */
export function bandCounts(works = scoredWorks()): BandCount[] {
  return SIGNAL_BANDS.map((b, i) => ({
    band: b.band,
    label: b.label,
    min: b.min,
    max: i === 0 ? 100 : SIGNAL_BANDS[i - 1].min - 1,
    count: works.filter((w) => w.band === b.band).length,
  }));
}

/**
 * Ties, stated plainly. Four axes at 1–5 on weights .25/.35/.15/.25 reduce to a
 * lattice of ~75 achievable values, so a ranked 1..N table is largely tie-break
 * noise. The report says so rather than hiding it behind rank numbers.
 */
export function tieProfile(works = scoredWorks()) {
  const byScore = new Map<number, number>();
  for (const w of works) byScore.set(w.score, (byScore.get(w.score) ?? 0) + 1);
  const tiedGroups = [...byScore.entries()].filter(([, n]) => n > 1);
  const tiedWorks = tiedGroups.reduce((s, [, n]) => s + n, 0);
  return {
    total: works.length,
    distinctScores: byScore.size,
    tiedWorks,
    tiedShare: works.length ? Math.round((tiedWorks / works.length) * 100) : 0,
    largestGroup: tiedGroups.sort((a, b) => b[1] - a[1])[0] ?? null,
  };
}

/**
 * Limitations, computed rather than remembered — so they can never quietly stop
 * being true. Rendered in the report's own Limitations chapter.
 */
export function limitations(works = scoredWorks()) {
  const brands = new Map<string, number>();
  for (const w of works) brands.set(w.brand, (brands.get(w.brand) ?? 0) + 1);
  const single = [...brands.values()].filter((n) => n === 1).length;
  const ideaLevels = works.map((w) => w.levels.IDEA);
  return {
    brands: brands.size,
    singleWorkBrands: single,
    singleWorkShare: brands.size ? Math.round((single / brands.size) * 100) : 0,
    /** Range restriction: we write about notable work, so we never rate a boring campaign. */
    lowestIdeaLevel: Math.min(...ideaLevels),
    ties: tieProfile(works),
  };
}

/** Headline counters used across the cover and chapter furniture. */
export function editionStats(works = scoredWorks()) {
  const scores = works.map((w) => w.score);
  return {
    works: works.length,
    brands: new Set(works.map((w) => w.brand)).size,
    markets: new Set(works.map((w) => w.market).filter(Boolean)).size,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    mean: Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
  };
}
