import type { MetadataRoute } from 'next';
import { getAllArticles } from '../lib/articles';

const SITE = 'https://www.monokromatik.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const now = new Date();

  // Core editorial + intelligence sections that actually ship today.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/culture`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/pulse`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/signal`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/intelligence`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/intelligence/case-studies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/intelligence/source-desk`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/reports`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/issues`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/conversations`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE}/contribute`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/editorial-standards`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/ai-methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Category landing pages, derived from live article data so this self-heals
  // as categories are added or renamed (no hand-maintained list to drift).
  const categories = Array.from(
    new Set(
      articles
        .map((article) => article.category)
        .filter((category): category is string => Boolean(category))
    )
  );
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE}/category/${encodeURIComponent(category)}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Individual article pages.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE}/article/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
