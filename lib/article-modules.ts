// Helpers for Layer-2 evidence modules. Currently: resolving "Precedents" —
// comparable scored works from our own corpus — so an article can point at the
// Index instead of asserting comparisons unsourced.

import type {
  Article,
  ArticleModulePrecedents,
  NumberStat,
  TimelineEntry,
  EvidenceItem,
} from './articles';
import { getPublicCaseStudies } from './case-studies';
import { rankWorks, brandSlug } from './signal-index';

export interface Precedent {
  slug: string;
  title: string;
  brand: string;
  score: number;
  href: string;
}

/** A module with all corpus lookups resolved server-side, ready to render. */
export type ModuleVM =
  | { type: 'numbers'; title?: string; items: NumberStat[] }
  | { type: 'timeline'; title?: string; items: TimelineEntry[] }
  | { type: 'evidence'; title?: string; confirmed: EvidenceItem[]; reported: EvidenceItem[]; notClaimed: EvidenceItem[] }
  | { type: 'precedents'; title?: string; items: Precedent[] };

/** Resolve every module on an article into a render-ready view model. Precedents
 *  are looked up against the Index; an empty precedents module is dropped so we
 *  never render an empty box. */
export function resolveModules(article: Article): ModuleVM[] {
  const out: ModuleVM[] = [];
  for (const m of article.modules ?? []) {
    if (m.type === 'precedents') {
      const items = resolvePrecedents(article, m);
      if (items.length > 0) out.push({ type: 'precedents', title: m.title, items });
    } else {
      out.push(m);
    }
  }
  return out;
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'this', 'that', 'what', 'who', 'how', 'why',
  'african', 'africa', 'diaspora', 'brand', 'brands', 'culture', 'global', 'world', 'new',
  'his', 'her', 'their', 'its', 'are', 'was', 'has', 'not', 'but', 'all', 'one', 'first',
]);

function topicTokens(article: Article): Set<string> {
  const out = new Set<string>();
  const parts = [article.title, ...(article.tags ?? []), ...((article.entities ?? []).map((e) => e.name))];
  for (const p of parts) {
    for (const w of (p || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)) {
      if (w.length > 3 && !STOP.has(w)) out.add(w);
    }
  }
  return out;
}

/**
 * Resolve the precedents for a Precedents module. If `works` is set, use those
 * case-study slugs verbatim (scored only). Otherwise auto-resolve the highest-
 * scored works that share an entity/topic token with the article.
 */
export function resolvePrecedents(
  article: Article,
  module: ArticleModulePrecedents,
  max = 3,
): Precedent[] {
  const studies = getPublicCaseStudies();
  const ranked = rankWorks(studies);
  const bySlug = new Map(ranked.map((w) => [w.slug, w]));

  if (module.works && module.works.length > 0) {
    return module.works
      .map((s) => bySlug.get(s))
      .filter((w): w is NonNullable<typeof w> => !!w)
      .map((w) => ({ slug: w.slug, title: w.title, brand: w.brand, score: w.score, href: `/intelligence/case-studies/${w.slug}` }));
  }

  const tokens = topicTokens(article);
  const entitySlugs = new Set((article.entities ?? []).map((e) => (e.brand ? brandSlug(e.brand) : brandSlug(e.name))));

  const scored = ranked
    .map((w) => {
      let overlap = 0;
      const hay = `${w.brand} ${w.title}`.toLowerCase();
      for (const t of tokens) if (hay.includes(t)) overlap += 1;
      if (entitySlugs.has(w.brandSlug)) overlap += 3;
      return { w, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.w.score - a.w.score)
    .slice(0, max);

  return scored.map(({ w }) => ({ slug: w.slug, title: w.title, brand: w.brand, score: w.score, href: `/intelligence/case-studies/${w.slug}` }));
}
