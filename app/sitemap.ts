import type { MetadataRoute } from 'next';
import { getAllArticles } from '../lib/articles';

const SITE = 'https://www.monokromatik.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/pulse`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    // Primary sections (header nav)
    { url: `${SITE}/signal`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/intelligence`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/intelligence/source-desk`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/intelligence/case-studies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/issues`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/conversations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/culture`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/reports`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // Culture categories
    { url: `${SITE}/roots`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/arena`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/waves`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    // Media surfaces
    { url: `${SITE}/watch`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/listen`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    // Editorial / trust
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contribute`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/editorial-standards`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/ai-methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE}/article/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
