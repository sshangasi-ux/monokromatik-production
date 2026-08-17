// Entity flywheel: resolve an article's tagged entities (brand / person /
// campaign) into (a) their Cultural-Signal Index score, when the corpus has
// scored a matching work, and (b) related coverage across articles and case
// studies. This is what makes each piece a door into the whole corpus — content
// that compounds rather than sitting as an island.

import { getAllArticles, type Article, type ArticleEntity } from './articles';
import { getPublicCaseStudies } from './case-studies';
import { rankWorks, brandSlug } from './signal-index';

export interface CoverageItem {
  slug: string;
  title: string;
  kind: 'article' | 'case-study';
  href: string;
}

export interface ResolvedEntity {
  entity: ArticleEntity;
  slug: string;
  /** Top scored work for this entity, if the Index has one. */
  score: number | null;
  workSlug: string | null;
  workTitle: string | null;
  /** Link to the brand profile page when a score exists. */
  indexHref: string | null;
  coverage: CoverageItem[];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Does a candidate (title + tags + brand) reference this entity name? */
function mentions(name: string, hay: string): boolean {
  const n = norm(name);
  if (!n) return false;
  return norm(hay).includes(n);
}

/**
 * Resolve every entity on an article. Pure, deterministic, and conservative:
 * an entity with no scored work simply carries `score: null`, and coverage
 * requires a real name match so we never surface an irrelevant link.
 */
export function resolveEntities(
  article: Article,
  opts: { maxCoverage?: number } = {},
): ResolvedEntity[] {
  const entities = article.entities ?? [];
  if (entities.length === 0) return [];

  const maxCoverage = opts.maxCoverage ?? 4;
  const studies = getPublicCaseStudies();
  const works = rankWorks(studies);
  const articles = getAllArticles();

  return entities.map((entity) => {
    const slug = entity.brand ? brandSlug(entity.brand) : brandSlug(entity.name);

    // Index score: the top-scored work whose brand slug matches, or whose title
    // references the entity name (covers person/campaign works).
    const match = works.find(
      (w) => w.brandSlug === slug || mentions(entity.name, `${w.brand} ${w.title}`),
    ) ?? null;

    const coverage: CoverageItem[] = [];
    for (const cs of studies) {
      if (cs.slug === match?.slug) continue;
      if (brandSlug(cs.brand) === slug || mentions(entity.name, `${cs.title} ${cs.brand} ${(cs.tags ?? []).join(' ')}`)) {
        coverage.push({ slug: cs.slug, title: cs.title, kind: 'case-study', href: `/intelligence/case-studies/${cs.slug}` });
      }
    }
    for (const a of articles) {
      if (a.slug === article.slug) continue;
      const hay = `${a.title} ${(a.tags ?? []).join(' ')} ${(a.entities ?? []).map((e) => e.name).join(' ')}`;
      if (mentions(entity.name, hay)) {
        coverage.push({ slug: a.slug, title: a.title, kind: 'article', href: `/article/${a.slug}` });
      }
    }

    return {
      entity,
      slug,
      score: match ? match.score : null,
      workSlug: match ? match.slug : null,
      workTitle: match ? match.title : null,
      indexHref: match ? `/intelligence/signal-index/${slug}` : null,
      coverage: coverage.slice(0, maxCoverage),
    };
  });
}

/** Reverse lookup for brand profile pages: articles that tag this brand slug
 *  (via an entity) or otherwise reference the brand in title/tags. */
export function getArticlesForBrand(
  slug: string,
  brandName: string,
  max = 6,
): { slug: string; title: string; publishedAt: string; category: string }[] {
  const out: { slug: string; title: string; publishedAt: string; category: string }[] = [];
  for (const a of getAllArticles()) {
    const taggedSlug = (a.entities ?? []).some((e) => (e.brand ? brandSlug(e.brand) : brandSlug(e.name)) === slug);
    const named = mentions(brandName, `${a.title} ${(a.tags ?? []).join(' ')}`);
    if (taggedSlug || named) {
      out.push({ slug: a.slug, title: a.title, publishedAt: a.publishedAt, category: a.category });
    }
  }
  return out
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, max);
}
