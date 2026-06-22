// The Cultural-Signal Index — composite score + rollups over the four-axis
// `decode` that already lives on every case study. See docs/CULTURAL_SIGNAL_INDEX.md.
//
// Decisions (locked 2026-06-22): /100 headline · authorship-weighted ·
// work → brand → index. Pure + deterministic; returns null for unscored works
// so callers can render gracefully.

import type { CaseStudy, CaseStudyDecode } from './case-studies';

/** Authorship-weighted axis weights — AUTHORSHIP carries the founding thesis. */
export const AXIS_WEIGHTS: Record<string, number> = {
  IDEA: 0.25,
  AUTHORSHIP: 0.35,
  EXECUTION: 0.15,
  CONSEQUENCE: 0.25,
};

const AXIS_ORDER = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'];
const up = (s: string) => (s || '').trim().toUpperCase();
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Composite Cultural-Signal Score (0–100) from a 4-axis decode; null if unscored. */
export function compositeScore(decode?: CaseStudyDecode[]): number | null {
  if (!decode || decode.length === 0) return null;
  let wsum = 0;
  let acc = 0;
  for (const ax of decode) {
    const w = AXIS_WEIGHTS[up(ax.label)] ?? 1 / decode.length; // unknown axis → equal-share fallback
    wsum += w;
    acc += (ax.level / 5) * w;
  }
  return wsum === 0 ? null : Math.round((acc / wsum) * 100);
}

export interface AxisScore {
  label: string;
  level: number;
  note: string;
}
export interface SignalScore {
  score: number; // 0–100 composite
  axes: AxisScore[]; // ordered IDEA, AUTHORSHIP, EXECUTION, CONSEQUENCE, then extras
}

/** Full signal score for one work (case study); null if unscored. */
export function workSignal(cs: Pick<CaseStudy, 'decode'>): SignalScore | null {
  const score = compositeScore(cs.decode);
  if (score === null) return null;
  const axes = [...(cs.decode ?? [])]
    .sort((a, b) => {
      const ai = AXIS_ORDER.indexOf(up(a.label));
      const bi = AXIS_ORDER.indexOf(up(b.label));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map((a) => ({ label: a.label, level: a.level, note: a.note }));
  return { score, axes };
}

export interface BrandIndexEntry {
  brand: string;
  score: number; // mean composite across the brand's scored works
  works: number;
  rank?: number;
  axisAverages: Record<string, number>; // mean level per axis (1–5)
}

/** Brand-level index: mean composite + per-axis means across a brand's scored works. */
export function brandIndex(caseStudies: Pick<CaseStudy, 'brand' | 'decode'>[]): BrandIndexEntry[] {
  const byBrand = new Map<string, { scores: number[]; axisLevels: Record<string, number[]> }>();
  for (const cs of caseStudies) {
    const s = compositeScore(cs.decode);
    if (s === null) continue;
    const brand = (cs.brand || 'Unknown').trim();
    const cur = byBrand.get(brand) ?? { scores: [], axisLevels: {} };
    cur.scores.push(s);
    for (const ax of cs.decode ?? []) {
      const k = up(ax.label);
      (cur.axisLevels[k] = cur.axisLevels[k] ?? []).push(ax.level);
    }
    byBrand.set(brand, cur);
  }
  const entries: BrandIndexEntry[] = [];
  for (const [brand, { scores, axisLevels }] of byBrand) {
    const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const axisAverages: Record<string, number> = {};
    for (const k in axisLevels) {
      axisAverages[k] = round1(axisLevels[k].reduce((a, b) => a + b, 0) / axisLevels[k].length);
    }
    entries.push({ brand, score, works: scores.length, axisAverages });
  }
  return entries.sort((a, b) => b.score - a.score);
}

/** Ranked brand leaderboard — the Index. */
export function rankIndex(caseStudies: Pick<CaseStudy, 'brand' | 'decode'>[]): BrandIndexEntry[] {
  return brandIndex(caseStudies).map((e, i) => ({ ...e, rank: i + 1 }));
}

/** URL-safe slug for a brand name (handles ×, /, & and punctuation). */
export function brandSlug(brand: string): string {
  return (
    (brand || '')
      .toLowerCase()
      .replace(/[×&/]/g, ' ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'unknown'
  );
}

/** The authorship axis weight, exposed for the methodology surface. */
export const AXIS_LABELS = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;
