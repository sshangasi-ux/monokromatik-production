// MonoKromatik Analytics Agent
// Reads GA4 data via the Data API and scores articles.
// Marks underperformers (Bartlett's Law 23: kill what doesn't work).
// Falls back gracefully when GA4 isn't configured — never blocks the pipeline.

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getGoogleAccessToken } from './google-auth';

const REPORT_PATH = join(process.cwd(), 'output', 'performance-report.json');
const ARTICLES_PATH = join(process.cwd(), 'data', 'articles.json');

interface PerformanceReport {
  generatedAt: string;
  windowDays: number;
  articles: {
    slug: string;
    pageviews: number;
    avgEngagementSec: number;
    score: number;            // 0-100
    verdict: 'star' | 'solid' | 'meh' | 'kill';
  }[];
  topCategories: { category: string; pageviews: number }[];
  topSources: { source: string; pageviews: number }[];
}

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

interface GA4Row {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

/** One GA4 Data API runReport call (REST). Returns rows, or [] on failure. */
async function runReport(token: string, body: unknown): Promise<GA4Row[]> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    console.log(`   ⚠️  GA4 runReport failed (${res.status})`);
    return [];
  }
  const json = (await res.json()) as { rows?: GA4Row[] };
  return json.rows || [];
}

/**
 * Pull per-article page metrics + traffic sources from the GA4 Data API via the
 * shared service-account auth (REST, no extra deps). Returns null when GA4 isn't
 * configured (no property id / credential) so the caller falls back gracefully.
 */
async function fetchGA4(days: number): Promise<{ pages: GA4Row[]; sources: GA4Row[] } | null> {
  if (!GA4_PROPERTY_ID) return null;
  const token = await getGoogleAccessToken(GA4_SCOPE);
  if (!token) return null;

  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
  const pages = await runReport(token, {
    dateRanges,
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }],
    dimensionFilter: { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/article/' } } },
    limit: 1000,
  });
  const sources = await runReport(token, {
    dateRanges,
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'screenPageViews' }],
    limit: 25,
  });
  return { pages, sources };
}

/**
 * Score an article 0-100 based on pageviews + engagement.
 * Tunable. The thresholds below assume a young site with modest traffic.
 */
function scoreArticle(pv: number, engageSec: number): { score: number; verdict: PerformanceReport['articles'][0]['verdict'] } {
  // Logarithmic scaling: 1 view = 0pts, 10 = 30pts, 100 = 60pts, 1000 = 90pts
  const pvScore = pv > 0 ? Math.min(90, Math.log10(pv + 1) * 30) : 0;
  // Engagement: 30s = 5pts, 60s = 10pts, 180s = 30pts, capped
  const eScore = Math.min(30, (engageSec / 6));
  const score = Math.round(pvScore + eScore);

  let verdict: PerformanceReport['articles'][0]['verdict'];
  if (score >= 70) verdict = 'star';
  else if (score >= 40) verdict = 'solid';
  else if (score >= 15) verdict = 'meh';
  else verdict = 'kill';

  return { score, verdict };
}

/**
 * Generate a performance report. Without GA4 creds, returns a placeholder
 * so the orchestrator still completes.
 */
export async function generatePerformanceReport(windowDays = 7): Promise<PerformanceReport> {
  const ga4 = await fetchGA4(windowDays);

  if (!ga4) {
    const report: PerformanceReport = {
      generatedAt: new Date().toISOString(),
      windowDays,
      articles: [],
      topCategories: [],
      topSources: [],
    };
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log('   📊 Performance report: GA4 not configured. Skipping article scoring.');
    return report;
  }

  // slug → category from the article catalogue (GA4 only knows the URL).
  const categoryBySlug = new Map<string, string>();
  try {
    const arts = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8')) as { slug: string; category?: string }[];
    for (const a of arts) categoryBySlug.set(a.slug, (a.category || '').trim());
  } catch {
    /* no catalogue — categories simply stay empty */
  }

  const articles = ga4.pages
    .map((row) => {
      const path = (row.dimensionValues?.[0]?.value || '').split('?')[0];
      const slug = path.replace(/^\/article\//, '').replace(/\/$/, '');
      const pageviews = Number(row.metricValues?.[0]?.value || 0);
      const engagementTotal = Number(row.metricValues?.[1]?.value || 0);
      const avgEngagementSec = pageviews ? Math.round(engagementTotal / pageviews) : 0;
      const { score, verdict } = scoreArticle(pageviews, avgEngagementSec);
      return { slug, pageviews, avgEngagementSec, score, verdict };
    })
    .filter((a) => a.slug)
    .sort((a, b) => b.pageviews - a.pageviews);

  const catTotals = new Map<string, number>();
  for (const a of articles) {
    const cat = categoryBySlug.get(a.slug);
    if (cat) catTotals.set(cat, (catTotals.get(cat) || 0) + a.pageviews);
  }
  const topCategories = [...catTotals.entries()]
    .map(([category, pageviews]) => ({ category, pageviews }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 10);

  const topSources = ga4.sources
    .map((row) => ({ source: row.dimensionValues?.[0]?.value || '(unknown)', pageviews: Number(row.metricValues?.[0]?.value || 0) }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 10);

  const report: PerformanceReport = { generatedAt: new Date().toISOString(), windowDays, articles, topCategories, topSources };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  const stars = articles.filter((a) => a.verdict === 'star').length;
  const kills = articles.filter((a) => a.verdict === 'kill').length;
  console.log(`   📊 Performance report: ${articles.length} articles scored (${stars} star, ${kills} kill) → ${REPORT_PATH}`);
  return report;
}

/**
 * Read the latest report (used by the curator to bias toward proven winners)
 */
export function getLatestReport(): PerformanceReport | null {
  if (!existsSync(REPORT_PATH)) return null;
  return JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));
}
