// MonoKromatik Article Utilities
// Functions to load and manage articles

import { readFileSync } from 'fs';
import { join } from 'path';

export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  sourceLink: string;
  sourceName: string;
  publishedAt: string;
}

/**
 * Load articles from JSON file
 */
function loadArticles(): Article[] {
  try {
    if (typeof window === 'undefined') {
      // Server-side: read from file system
      const articlesPath = join(process.cwd(), 'data/articles.json');
      const articlesData = readFileSync(articlesPath, 'utf-8');
      return JSON.parse(articlesData) as Article[];
    } else {
      // Client-side: return empty (will be loaded via props)
      return [];
    }
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

/**
 * Get all articles
 */
export function getAllArticles(): Article[] {
  return loadArticles();
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
