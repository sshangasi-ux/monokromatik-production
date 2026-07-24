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
