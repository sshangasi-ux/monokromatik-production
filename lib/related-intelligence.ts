// Cross-link layer: given an article, surface the related Intelligence (case
// studies in the Cultural-Signal Index) so every article becomes a door into the
// scored corpus. Matches on shared brand / proper-noun tokens between the
// article (title + tags) and a case study (title + brand + tags). Conservative —
// better to show 0 case studies + the Index CTA than an irrelevant link.

import { getPublicCaseStudies, type CaseStudy } from './case-studies';
import { brandSlug } from './signal-index';

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'this', 'that', 'what', 'who', 'how', 'why', 'now',
  'african', 'africa', 'diaspora', 'brand', 'brands', 'culture', 'global', 'world', 'new', 'just',
  'his', 'her', 'their', 'its', 'are', 'was', 'has', 'not', 'but', 'all', 'one', 'first',
]);

function tokens(...parts: (string | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    for (const w of p.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)) {
      if (w.length > 3 && !STOP.has(w)) out.add(w);
    }
  }
  return out;
}

export interface ArticleLike {
  slug: string;
  title: string;
  tags?: string[];
}

/** Up to `max` case studies most related to the article (by shared brand/topic
 *  tokens). Brand-token matches are weighted; requires a real overlap. */
export function getRelatedCaseStudies(article: ArticleLike, max = 3): CaseStudy[] {
  const aTokens = tokens(article.title, ...(article.tags ?? []));
  if (aTokens.size === 0) return [];

  const scored: { cs: CaseStudy; score: number }[] = [];
  for (const cs of getPublicCaseStudies()) {
    if (cs.slug === article.slug) continue;
    const brandTokens = tokens(cs.brand);
    const topicTokens = tokens(cs.title, ...(cs.tags ?? []));
    let score = 0;
    for (const t of brandTokens) if (aTokens.has(t)) score += 3; // brand match weighs most
    for (const t of topicTokens) if (aTokens.has(t)) score += 1;
    if (score >= 2) scored.push({ cs, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, max).map((s) => s.cs);
}

/** The per-brand Index page slug for a case study (so the rail can deep-link the
 *  score, not just the decode). */
export function indexBrandHref(cs: CaseStudy): string {
  return `/intelligence/signal-index/${brandSlug(cs.brand)}`;
}
