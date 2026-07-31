// The Cultural-Signal Index — composite score + rollups over the four-axis
// `decode` that already lives on every case study. See docs/CULTURAL_SIGNAL_INDEX.md.
//
// Decisions (locked 2026-06-22): /100 headline · authorship-weighted ·
// work → brand → index. Pure + deterministic; returns null for unscored works
// so callers can render gracefully.

import type { CaseStudy, CaseStudyDecode } from './case-studies';

/**
 * The scoring rubric currently in force (docs/SCORING-RUBRIC.md).
 *
 * Stamped onto every Index snapshot so movement can never be computed across a
 * methodology change. When the rubric version differs between two snapshots the
 * scores are not comparable: v2.0 re-scored the whole corpus and the mean fell
 * 79.4 → 70.2, which is our ruler changing, not 60 brands declining in a week.
 * Bump this ONLY alongside a dated change to the rubric doc.
 */
export const RUBRIC_VERSION = 'v2.0';

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

/**
 * Letter bands over the /100 composite — a rating, not a mark out of a hundred.
 *
 * Why this exists: Brand Finance, Interbrand, Kantar and YouGov all publish a
 * score and NONE of them publish the band cut-offs behind it. Publishing ours —
 * with the boundaries stated — is the cheapest credibility available to an
 * independent index, and it's the thing that reads as "rating agency" rather
 * than "review score". Cut-offs are fixed and versioned; changing them is a
 * methodology change and must be dated in docs/CULTURAL_SIGNAL_INDEX.md.
 */
export interface SignalBand {
  band: string;
  min: number;
  label: string;
}

export const SIGNAL_BANDS: SignalBand[] = [
  { band: 'AAA', min: 90, label: 'Exceptional — authored, executed and consequential' },
  { band: 'AA', min: 80, label: 'Strong — clear authorship, real consequence' },
  { band: 'A', min: 70, label: 'Sound — good work, incomplete capture' },
  { band: 'BBB', min: 60, label: 'Mixed — the idea outruns the ownership' },
  { band: 'BB', min: 50, label: 'Weak — visibility without value capture' },
  { band: 'B', min: 40, label: 'Poor — borrowed authorship, thin consequence' },
  { band: 'C', min: 0, label: 'Failing — value created, value surrendered' },
];

/** The letter band for a composite score; null when unscored. */
export function signalBand(score: number | null | undefined): SignalBand | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  return SIGNAL_BANDS.find((b) => score >= b.min) ?? SIGNAL_BANDS[SIGNAL_BANDS.length - 1];
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

/** Ranked brand leaderboard — the brand roll-up. */
export function rankIndex(caseStudies: Pick<CaseStudy, 'brand' | 'decode'>[]): BrandIndexEntry[] {
  return brandIndex(caseStudies).map((e, i) => ({ ...e, rank: i + 1 }));
}

/**
 * THE INDEX RANKS WORK, NOT BRANDS.
 *
 * The unit of the Index is a single scored work, because that is the unit we
 * actually assess and the unit the evidence attaches to. A brand-level ranking
 * would imply a body of evidence that does not exist: almost every brand in the
 * corpus carries exactly one scored work, so a "brand score" is one judgement
 * wearing a company's name.
 *
 * `rankIndex` (brand roll-up) is retained for the per-brand pages, where it is
 * correctly framed as the mean of that brand's works. It is NOT the Index.
 *
 * See docs/EDITION-01-PLAN.md §1.
 */
export interface WorkIndexEntry {
  slug: string;
  title: string;
  brand: string;
  brandSlug: string;
  score: number;
  rank: number;
  levels: Record<string, number>;
}

export function rankWorks(
  caseStudies: Pick<CaseStudy, 'slug' | 'title' | 'brand' | 'decode'>[],
): WorkIndexEntry[] {
  return caseStudies
    .map((c) => {
      const score = compositeScore(c.decode);
      if (score === null) return null; // unscored / withheld — never ranked
      const levels: Record<string, number> = {};
      for (const ax of c.decode ?? []) levels[up(ax.label)] = ax.level;
      return {
        slug: c.slug,
        title: c.title,
        brand: c.brand,
        brandSlug: brandSlug(c.brand),
        score,
        levels,
      };
    })
    .filter((w): w is Omit<WorkIndexEntry, 'rank'> => w !== null)
    .sort((a, b) => b.score - a.score || a.brand.localeCompare(b.brand))
    .map((w, i) => ({ ...w, rank: i + 1 }));
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

/**
 * Canonical primary region for a work, derived from its free-text `market`.
 * The raw markets are high-cardinality and inconsistently cased ("SOUTH AFRICA /
 * GLOBAL", "Nigeria · Diaspora"), so a raw market filter offers 60+ near-unusable
 * options. This maps each to a fixed facet — real countries first, then the
 * meta-regions — so the Index league table gets a clean, cut-able Region filter.
 */
export const REGION_FACETS = [
  'South Africa', 'Nigeria', 'Ghana', 'Kenya', 'Senegal', 'Morocco', 'Botswana',
  'Ethiopia', 'Rwanda', 'Côte d’Ivoire', 'DR Congo', 'Eswatini',
  'Pan-African', 'Diaspora', 'Global',
] as const;

export function primaryRegion(market?: string | null): string | undefined {
  if (!market) return undefined;
  const m = market.toLowerCase().replace(/[’']/g, "'");
  for (const r of REGION_FACETS) {
    if (m.includes(r.toLowerCase().replace(/[’']/g, "'"))) return r;
  }
  const first = market.split(/[·/,]/)[0]?.trim();
  return first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : undefined;
}
