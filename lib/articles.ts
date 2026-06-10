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
}

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
