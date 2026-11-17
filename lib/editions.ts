// MonoKromatik Editions — the collectible digital magazine.
// JSON-as-source-of-truth (same pattern as articles/case-studies). An edition is
// a curated, self-contained issue: cover + a contents lineup that links out to
// existing articles/decodes, a lead feature excerpt, an optional named exhibit,
// and the free → collectible sell path.

import editionsData from '../data/editions.json';

export interface EditionItem {
  no: string;
  kind: string;
  title: string;
  blurb: string;
  href: string;
}

export interface EditionFeature {
  kicker: string;
  title: string;
  href: string;
  body: string[];
  pullQuote: string;
}

export interface EditionSell {
  phase: string;
  title: string;
  body: string;
}

export interface Edition {
  slug: string;
  number: string;
  title: string;
  coverTitle: string;
  coverLine: string;
  standfirst: string;
  theme: string;
  dateLabel: string;
  publishedAt: string;
  status: 'live' | 'draft';
  contents: EditionItem[];
  feature: EditionFeature;
  /** Optional key selecting an in-repo exhibit component (e.g. "ownership-ladder"). */
  exhibit?: string;
  sell: EditionSell[];
}

const editions = editionsData as unknown as Edition[];

/** Every edition, newest first. */
export function getAllEditions(): Edition[] {
  return [...editions].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

/** Only live editions (drafts stay out of listings + the sitemap). */
export function getLiveEditions(): Edition[] {
  return getAllEditions().filter((e) => e.status === 'live');
}

export function getEdition(slug: string): Edition | undefined {
  return editions.find((e) => e.slug === slug);
}
