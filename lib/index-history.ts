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
  /** The scoring rubric in force when this snapshot was taken. Snapshots taken
   *  under different rubrics are NOT comparable — see `rebased` below. */
  rubricVersion?: string;
  /** What each entry counts: a brand roll-up, or a single scored work. Changing
   *  the unit is a bigger methodology break than changing the rubric — the rows
   *  stop being the same kind of thing — so it suppresses movement identically. */
  unit?: 'brand' | 'work';
  entries: IndexHistoryEntry[];
}

/** Treat an unstamped snapshot as v1 — everything before the rubric was written. */
const rubricOf = (s: IndexSnapshot): string => s.rubricVersion ?? 'v1';
/** Snapshots predating the work-level Index ranked brands. */
const unitOf = (s: IndexSnapshot): string => s.unit ?? 'brand';
/** The comparability key. Movement is only ever computed within one of these. */
const basisOf = (s: IndexSnapshot): string => `${rubricOf(s)}/${unitOf(s)}`;

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
  /** True when the two snapshots were scored under DIFFERENT rubrics. The deltas
   *  are forced to 0 — the scores aren't comparable, so there is no movement to
   *  report, only a rebase to disclose. */
  rebased?: boolean;
  rubricFrom?: string;
  rubricTo?: string;
}

/** True when the latest snapshot was scored under a different rubric than the
 *  one before it — i.e. the Index has just been rebased and cross-snapshot
 *  deltas are meaningless until the next same-rubric pair exists. */
export function isRebased(): boolean {
  if (history.length < 2) return false;
  return basisOf(history[history.length - 1]) !== basisOf(history[history.length - 2]);
}

/** The rubric the latest snapshot was scored under. */
export function currentRubric(): string | null {
  return history.length ? rubricOf(history[history.length - 1]) : null;
}

/**
 * Movement for one brand since the previous snapshot. null when there's no
 * prior snapshot, or the brand wasn't in it (i.e. newly ranked).
 *
 * Across a rubric change this returns a `rebased` marker with zero deltas rather
 * than a real delta: comparing a v2.0 score to a v1 score would render our own
 * methodology change as ~60 brands declining in a week. Movement is the product,
 * so it has to be honest movement.
 */
export function getMovement(slug: string): Movement | null {
  if (history.length < 2) return null;
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const now = current.entries.find((e) => e.slug === slug);
  const then = previous.entries.find((e) => e.slug === slug);
  if (!now || !then) return null;
  const from = basisOf(previous);
  const to = basisOf(current);
  if (from !== to) {
    return { scoreDelta: 0, rankDelta: 0, since: previous.date, rebased: true, rubricFrom: from, rubricTo: to };
  }
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

export interface BrandPoint { date: string; score: number; rank: number; rubricVersion: string; }

/** A brand's score/rank across every snapshot, oldest first — for the trajectory
 *  sparkline on the per-brand page. Each point carries its rubric so the line can
 *  mark where the scale changed; a v1→v2.0 step is a rebase, not a fall. */
export function getBrandHistory(slug: string): BrandPoint[] {
  const out: BrandPoint[] = [];
  for (const snap of history) {
    const e = snap.entries.find((x) => x.slug === slug);
    if (e) out.push({ date: snap.date, score: e.score, rank: e.rank, rubricVersion: basisOf(snap) });
  }
  return out;
}

export interface Mover { brand: string; slug: string; score: number; scoreDelta: number; rankDelta: number; }
export interface Movers {
  since: string | null;
  climbers: Mover[];
  newcomers: Mover[];
  /** The latest snapshot crosses a rubric change — climbers are suppressed
   *  because score deltas across rubrics aren't real movement. Newcomers are
   *  still valid: entering the Index doesn't depend on the scale. */
  rebased?: boolean;
  rubricFrom?: string;
  rubricTo?: string;
}

/** What moved since the previous snapshot — climbers (score up) and newly-ranked
 *  brands. Powers the "Movers" surface + the auto-briefing. Empty until ≥2 snapshots.
 *
 *  Across a rubric change, climbers are suppressed and `rebased` is set. Every
 *  downstream narrator (Pulse digest, dispatch, monthly review) already degrades
 *  gracefully on an empty climbers list, so none of them can invent movement. */
export function getMovers(limit = 5): Movers {
  if (history.length < 2) return { since: null, climbers: [], newcomers: [] };
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const prevSlugs = new Set(previous.entries.map((e) => e.slug));
  const from = basisOf(previous);
  const to = basisOf(current);
  if (from !== to) {
    const newcomers = current.entries
      .filter((e) => !prevSlugs.has(e.slug))
      .map((e) => ({ brand: e.brand, slug: e.slug, score: e.score, scoreDelta: 0, rankDelta: 0 }));
    return { since: previous.date, climbers: [], newcomers: newcomers.slice(0, limit), rebased: true, rubricFrom: from, rubricTo: to };
  }

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
