// MonoKromatik Article Utilities
// Functions to load and manage articles

import articlesData from '../data/articles.json';

export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  /** Content tier: 'brief' = the fast, punchy daily culture piece (default);
   *  'feature' = a deeply-reported, longer flagship analysis. Lets the two tiers
   *  be generated, counted and presented differently. */
  format?: 'brief' | 'feature';
  imageUrl?: string;
  /** Credit for the hero image, e.g. "Via BellaNaija" / "Photo: Pexels". */
  imageCredit?: string;
  /** Link the image credit points to. */
  imageSourceUrl?: string;
  videoUrl?: string;
  /** 'embed' = YouTube/Vimeo iframe; 'file' = mp4 played inline. */
  videoType?: 'embed' | 'file';
  /** Credit for the embedded video, e.g. "Video via Nike". */
  videoCredit?: string;
  /** Link the video credit points to. */
  videoSourceUrl?: string;
  sourceLink: string;
  sourceName: string;
  publishedAt: string;
  /**
   * The Brand Read: the dual-read strategic layer (see
   * docs/MONOKROMATIK_EDITORIAL_VOICE.md — "The dual read").
   *
   * Optional and purely additive: articles without it render exactly as
   * before. Interpretive Signal-tier material — requires human approval
   * under EDITORIAL_GOVERNANCE.md before publication today; designed so the
   * pipeline can populate it autonomously within the same gate later.
   */
  /** LinkedIn-specific opening line for the social caption; see social-caption.ts. */
  linkedinHook?: string;
  brandRead?: BrandRead;
  /**
   * The reference list backing the piece. Inline `[n]` markers in `content`
   * (1-indexed) link to the matching entry, rendered as a numbered References
   * block. Purely additive: articles without it fall back to the single
   * legacy `sourceLink`/`sourceName` as reference [1] (see getReferences).
   */
  sources?: ArticleSource[];
  /**
   * Structured evidence modules rendered between the prose and the Brand Read —
   * the "bake-in" layer that adds sourced depth without padding. Each module is
   * self-citing (its `source` fields index into `sources`).
   */
  modules?: ArticleModule[];
  /**
   * The brands / people / campaigns this piece is about. Powers the entity
   * flywheel: inline Index scores + "more coverage" rails, and reverse-lookup
   * from brand profile pages. Additive; absent means no entity rail.
   */
  entities?: ArticleEntity[];
}

/** A cited source backing claims in the article. Mirrors CaseStudySource. */
export interface ArticleSource {
  /** Publisher / outlet, e.g. "Billboard". */
  publisher: string;
  /** Short label for the specific piece, e.g. "A*Pop world tour dates". */
  label: string;
  /** Canonical URL. */
  url: string;
  /** What this source establishes — the citeable "why it's here" note. */
  use?: string;
}

/** One headline figure in a "By the Numbers" module. */
export interface NumberStat {
  value: string;
  label: string;
  /** 1-indexed reference into `sources`. */
  source?: number;
}
/** One dated step in a Timeline module. */
export interface TimelineEntry {
  date: string;
  event: string;
  /** 1-indexed reference into `sources`. */
  source?: number;
}
export interface ArticleModuleNumbers {
  type: 'numbers';
  title?: string;
  items: NumberStat[];
}
export interface ArticleModuleTimeline {
  type: 'timeline';
  title?: string;
  items: TimelineEntry[];
}
/** A single evidence line — either plain text, or text with a 1-indexed
 *  citation into `sources` (renders a [n] superscript on the line). */
export type EvidenceItem = string | { text: string; source?: number };

/** The confirmed / reported / not-claimed ledger, ported from case studies. */
export interface ArticleModuleEvidence {
  type: 'evidence';
  title?: string;
  confirmed: EvidenceItem[];
  reported: EvidenceItem[];
  notClaimed: EvidenceItem[];
}
/** Comparable scored works from our own corpus. If `works` is omitted, the
 *  renderer auto-resolves precedents from the Index by shared entity/topic. */
export interface ArticleModulePrecedents {
  type: 'precedents';
  title?: string;
  /** Explicit case-study slugs; omit to auto-resolve from the corpus. */
  works?: string[];
}
export type ArticleModule =
  | ArticleModuleNumbers
  | ArticleModuleTimeline
  | ArticleModuleEvidence
  | ArticleModulePrecedents;

/** A brand / person / campaign the article is about. */
export interface ArticleEntity {
  kind: 'brand' | 'person' | 'campaign';
  name: string;
  /** Optional explicit brand slug to bind to an Index score/profile page. */
  brand?: string;
}

/**
 * The reference list for an article, always non-empty: uses `sources` when
 * present, else synthesises a single reference from the legacy
 * `sourceName`/`sourceLink` so every piece has a citeable [1].
 */
export function getReferences(article: Article): ArticleSource[] {
  if (article.sources && article.sources.length > 0) return article.sources;
  if (article.sourceLink) {
    return [{
      publisher: article.sourceName || 'Source',
      label: article.sourceName || article.sourceLink,
      url: article.sourceLink,
    }];
  }
  return [];
}

export interface BrandRead {
  /** Led by a named point of view, e.g. "Sibu Shangase" or an invited thinker. */
  attribution: string;
  /** Optional role/context for the attributed voice, e.g. "Founder, MonoKromatik". */
  attributionRole?: string;
  /** The strategic consequence, in 1–3 short paragraphs. Markdown allowed. */
  take: string;
  /** Optional sharp, quotable line — the lasting strategic point. */
  pullQuote?: string;
  /**
   * Optional strategic takeaways. Each pairs an insight ("where this lands")
   * with a concrete move ("what to do with this") — the bridge for CMOs, ad
   * agency execs, and culture strategists to derive an actionable "aha."
   * Plain strings are still accepted for lightweight, insight-only reads.
   */
  takeaways?: BrandReadTakeaway[];
  /**
   * Governance confidence status for the interpretation layer.
   * Mirrors EDITORIAL_GOVERNANCE.md verified/partial/interpretive ledger.
   */
  confidence?: 'verified' | 'partial' | 'interpretive';
}

/**
 * A single Brand Read takeaway. Either a plain string (insight-only) or a
 * structured pair: the strategic read plus the concrete move it implies.
 */
export type BrandReadTakeaway =
  | string
  | {
      /** "Where this lands" — the strategic consequence / insight. */
      insight: string;
      /** "What to do with this" — the concrete move for a decision maker. */
      move: string;
    };

/**
 * Get all articles
 */
export function getAllArticles(): Article[] {
  // The JSON import widens string-literal unions (e.g. videoType) to `string`,
  // so cast to the canonical Article shape.
  return articlesData as Article[];
}

/**
 * Get article by slug
 */
export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getAllArticles();
  return articles.find(article => article.slug === slug);
}

/**
 * Get latest articles
 */
export function getLatestArticles(limit: number = 5): Article[] {
  const articles = getAllArticles();
  return articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string, limit?: number): Article[] {
  const articles = getAllArticles();
  const filtered = articles.filter(article => article.category === category);
  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Calculate reading time (words per minute = 200)
 */
export function getReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
