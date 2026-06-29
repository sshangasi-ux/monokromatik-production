import type { MetadataRoute } from 'next';
import { getAllArticles } from '../lib/articles';
import { getPublicCaseStudies } from '../lib/case-studies';
import { rankIndex, brandSlug } from '../lib/signal-index';
import { getLiveReports } from '../lib/reports';
import { getAllIssues, issueHref } from '../lib/issues';
import { getAllConversations } from '../lib/conversations';

const SITE = 'https://www.monokromatik.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const caseStudies = getPublicCaseStudies();
  const now = new Date();

  // Core editorial + intelligence + commercial surfaces that ship today.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/culture`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/spirits`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE}/breaking`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/pulse`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/signal`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/intelligence`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/intelligence/case-studies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // The Cultural-Signal Index — a primary SEO asset (Dataset + per-brand pages).
    { url: `${SITE}/intelligence/signal-index`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/intelligence/signal-index/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/intelligence/signal-index/api`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/intelligence/license`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/intelligence/source-desk`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/archive`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE}/ask`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/reports`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/issues`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/conversations`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE}/weekly`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/membership`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/work-with-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/contribute`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/editorial-standards`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/ai-methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Branded culture pillar pages (the real top-level routes — Roots/Arena/Waves).
  // (Replaces the old /category/* emission, which pointed at a now-removed
  // duplicate route and 404'd.)
  const categoryRoutes: MetadataRoute.Sitemap = ['roots', 'arena', 'waves'].map((slug) => ({
    url: `${SITE}/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/article/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Intelligence case studies (the decodes).
  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${SITE}/intelligence/case-studies/${c.slug}`,
    lastModified: new Date(c.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Per-brand Index pages (one per ranked brand) — the programmatic SEO layer.
  const brandRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(rankIndex(caseStudies).map((e) => brandSlug(e.brand)))
  ).map((slug) => ({
    url: `${SITE}/intelligence/signal-index/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Live reports.
  const reportRoutes: MetadataRoute.Sitemap = getLiveReports().map((r) => ({
    url: `${SITE}/reports/${r.slug}`,
    lastModified: r.publishedAt ? new Date(r.publishedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Issue contents pages — self-heals to live/previewable issues via issueHref.
  const issueRoutes: MetadataRoute.Sitemap = getAllIssues()
    .map((i) => issueHref(i))
    .filter((h): h is string => Boolean(h))
    .map((h) => ({ url: `${SITE}${h}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 }));

  // Conversation briefs.
  const conversationRoutes: MetadataRoute.Sitemap = getAllConversations().map((c) => ({
    url: `${SITE}/conversations/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...caseStudyRoutes,
    ...brandRoutes,
    ...reportRoutes,
    ...issueRoutes,
    ...conversationRoutes,
  ];
}
