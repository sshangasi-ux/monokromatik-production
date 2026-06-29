// The Weekly Signal dispatch — assembled from live content so the newsletter has
// a real, current, shareable web sample (the #1 driver of newsletter signups) and
// a single source of truth the email render can reuse.

import { getBreaks } from './breaking-feed';
import { getAllArticles } from './articles';
import { getPublicCaseStudies } from './case-studies';
import { rankIndex, brandSlug } from './signal-index';
import { getMovers } from './index-history';

export interface DispatchBreak { title: string; source: string; link: string; why: string; }
export interface DispatchRead { title: string; slug: string; category: string; pullQuote: string; }
export interface DispatchMover { brand: string; slug: string; score: number; scoreDelta: number; newcomer: boolean; }

export interface Dispatch {
  generatedAt: string;
  breaks: DispatchBreak[];
  reads: DispatchRead[];
  mover: DispatchMover | null;
}

/** This week's dispatch: the top confirmed breaks, the latest authored brand-reads,
 *  and the standout Index move — the three things the newsletter delivers. */
export function buildDispatch(): Dispatch {
  const breaks: DispatchBreak[] = getBreaks()
    .slice(0, 3)
    .map((b) => ({ title: b.title, source: b.source, link: b.link, why: b.why }));

  const reads: DispatchRead[] = getAllArticles()
    .filter((a) => a.brandRead?.take && a.brandRead?.pullQuote)
    .slice(0, 3)
    .map((a) => ({ title: a.title, slug: a.slug, category: a.category, pullQuote: a.brandRead!.pullQuote ?? '' }));

  let mover: DispatchMover | null = null;
  const climbers = getMovers(1).climbers;
  if (climbers[0]) {
    const c = climbers[0];
    mover = { brand: c.brand, slug: c.slug, score: c.score, scoreDelta: c.scoreDelta, newcomer: false };
  } else {
    const top = rankIndex(getPublicCaseStudies())[0];
    if (top) mover = { brand: top.brand, slug: brandSlug(top.brand), score: top.score, scoreDelta: 0, newcomer: false };
  }

  return { generatedAt: new Date().toISOString(), breaks, reads, mover };
}
