// MonoKromatik Analytics Agent
// Reads GA4 data via the Data API and scores articles.
// Marks underperformers (Bartlett's Law 23: kill what doesn't work).
// Falls back gracefully when GA4 isn't configured — never blocks the pipeline.

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const REPORT_PATH = join(process.cwd(), 'output', 'performance-report.json');

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
const GA4_API_KEY = process.env.GA4_SERVICE_ACCOUNT_JSON; // base64-encoded service account

/**
 * Decode + validate the base64 service account JSON. GA4_SERVICE_ACCOUNT_JSON is
 * stored base64 (single-line secret), so it must be decoded *before* JSON.parse —
 * the credential path is wired correctly here so enabling GA4 is drop-in.
 * Returns the parsed credentials, or null if absent/malformed.
 */
function decodeGA4Credentials(): { client_email?: string; private_key?: string } | null {
  if (!GA4_API_KEY) return null;
  try {
    const raw = GA4_API_KEY.trim().startsWith('{')
      ? GA4_API_KEY // already raw JSON
      : Buffer.from(GA4_API_KEY, 'base64').toString('utf-8');
    const creds = JSON.parse(raw);
    if (!creds.client_email || !creds.private_key) {
      console.log('   ⚠️  GA4 credentials missing client_email/private_key — ignoring');
      return null;
    }
    return creds;
  } catch {
    console.log('   ⚠️  GA4_SERVICE_ACCOUNT_JSON is not valid base64 JSON — ignoring');
    return null;
  }
}

/**
 * Fetch GA4 data via the Reporting API.
 * Returns null if not configured — caller handles fallback.
 */
async function fetchGA4(days: number): Promise<any | null> {
  const credentials = decodeGA4Credentials();
  if (!GA4_PROPERTY_ID || !credentials) return null;

  // Credentials are decoded + validated above. The remaining step is the Data
  // API client, which needs an extra dependency:
  //   const { BetaAnalyticsDataClient } = require('@google-analytics/data');
  //   const client = new BetaAnalyticsDataClient({ credentials });
  //   const [response] = await client.runReport({ property: `properties/${GA4_PROPERTY_ID}`, ... });
  void days;
  console.log('   ℹ️  GA4 credentials valid — install @google-analytics/data to enable reporting');
  return null;
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

  // When GA4 wired: parse rows, score each article, build report
  const report: PerformanceReport = {
    generatedAt: new Date().toISOString(),
    windowDays,
    articles: [], // populated from ga4
    topCategories: [],
    topSources: [],
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`   📊 Performance report saved: ${REPORT_PATH}`);
  return report;
}

/**
 * Read the latest report (used by the curator to bias toward proven winners)
 */
export function getLatestReport(): PerformanceReport | null {
  if (!existsSync(REPORT_PATH)) return null;
  return JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));
}
