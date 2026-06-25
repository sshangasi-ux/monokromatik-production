// Read layer for The Wire — the audience-facing surface of the breaking radar.
// data/breaking.json is the source of truth (written by scripts/breaking-watch.ts
// when a major break clears the bar, published via a review PR). This module is
// the typed accessor the /breaking page and the homepage strip render from —
// mirrors lib/issues.ts / lib/articles.ts (JSON is truth, this is the accessor).

import breakingData from '../data/breaking.json';
import type { BreakingFeed, PublishedBreak } from './breaking';

export type { PublishedBreak };

export function getBreakingFeed(): BreakingFeed {
  const feed = breakingData as BreakingFeed;
  return { updatedAt: feed.updatedAt ?? '', breaks: feed.breaks ?? [] };
}

/** All published breaks, newest-first (the file is already stored that way). */
export function getBreaks(): PublishedBreak[] {
  return getBreakingFeed().breaks;
}

/**
 * Breaks confirmed within the last `hours` — for the homepage "JUST BROKE"
 * strip, which should stay quiet rather than show a stale wire. `now` is
 * injectable for testing; defaults to build/request time.
 */
export function getRecentBreaks(hours = 168, now = Date.now()): PublishedBreak[] {
  const cutoff = now - hours * 3_600_000;
  return getBreaks().filter((b) => {
    const t = new Date(b.detectedAt).getTime();
    return isFinite(t) && t >= cutoff;
  });
}
