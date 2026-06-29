// Cultural-Signal Index history — reads the dated snapshots in
// data/index-history.json so the Index can show movement (▲/▼ score + rank
// change) since the previous snapshot. Pure; returns null gracefully when there
// isn't yet a prior snapshot to compare against.

import historyData from '../data/index-history.json';

export interface IndexHistoryEntry {
  brand: string;
  slug: string;
  score: number;
  rank: number;
  works: number;
}
export interface IndexSnapshot {
  date: string; // YYYY-MM-DD
  generatedAt: string;
  entries: IndexHistoryEntry[];
}

const history = (historyData as IndexSnapshot[])
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date));

/** All snapshots, oldest first. */
export function getHistory(): IndexSnapshot[] {
  return history;
}

/** The date the Index has been tracked from (earliest snapshot), or null. */
export function trackingSince(): string | null {
  return history[0]?.date ?? null;
}

export interface Movement {
  scoreDelta: number; // current − previous composite
  rankDelta: number; // previous rank − current rank (positive = climbed)
  since: string; // the previous snapshot's date
}

/**
 * Movement for one brand since the previous snapshot. null when there's no
 * prior snapshot, or the brand wasn't in it (i.e. newly ranked).
 */
export function getMovement(slug: string): Movement | null {
  if (history.length < 2) return null;
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const now = current.entries.find((e) => e.slug === slug);
  const then = previous.entries.find((e) => e.slug === slug);
  if (!now || !then) return null;
  return {
    scoreDelta: now.score - then.score,
    rankDelta: then.rank - now.rank,
    since: previous.date,
  };
}

/** True when a brand appears in the latest snapshot but not the previous one. */
export function isNewlyRanked(slug: string): boolean {
  if (history.length < 2) return false;
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  return Boolean(current.entries.find((e) => e.slug === slug)) && !previous.entries.find((e) => e.slug === slug);
}

export interface BrandPoint { date: string; score: number; rank: number; }

/** A brand's score/rank across every snapshot, oldest first — for the trajectory
 *  sparkline on the per-brand page. */
export function getBrandHistory(slug: string): BrandPoint[] {
  const out: BrandPoint[] = [];
  for (const snap of history) {
    const e = snap.entries.find((x) => x.slug === slug);
    if (e) out.push({ date: snap.date, score: e.score, rank: e.rank });
  }
  return out;
}

export interface Mover { brand: string; slug: string; score: number; scoreDelta: number; rankDelta: number; }
export interface Movers { since: string | null; climbers: Mover[]; newcomers: Mover[]; }

/** What moved since the previous snapshot — climbers (score up) and newly-ranked
 *  brands. Powers the "Movers" surface + the auto-briefing. Empty until ≥2 snapshots. */
export function getMovers(limit = 5): Movers {
  if (history.length < 2) return { since: null, climbers: [], newcomers: [] };
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const prevSlugs = new Set(previous.entries.map((e) => e.slug));

  const climbers: Mover[] = [];
  const newcomers: Mover[] = [];
  for (const e of current.entries) {
    if (!prevSlugs.has(e.slug)) {
      newcomers.push({ brand: e.brand, slug: e.slug, score: e.score, scoreDelta: 0, rankDelta: 0 });
      continue;
    }
    const then = previous.entries.find((p) => p.slug === e.slug)!;
    const scoreDelta = e.score - then.score;
    if (scoreDelta > 0) climbers.push({ brand: e.brand, slug: e.slug, score: e.score, scoreDelta, rankDelta: then.rank - e.rank });
  }
  climbers.sort((a, b) => b.scoreDelta - a.scoreDelta || b.rankDelta - a.rankDelta);
  return { since: previous.date, climbers: climbers.slice(0, limit), newcomers: newcomers.slice(0, limit) };
}
