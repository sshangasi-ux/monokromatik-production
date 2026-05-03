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
 * Fetch GA4 data via the Reporting API.
 * Returns null if not configured — caller handles fallback.
 */
async function fetchGA4(days: number): Promise<any | null> {
  if (!GA4_PROPERTY_ID || !GA4_API_KEY) return null;

  // The full GA4 Data API integration goes here.
  // For now we surface the contract so the agent runs, even pre-credentials.
  // When GA4 service account JSON is added, replace this stub with:
  //   const { BetaAnalyticsDataClient } = require('@google-analytics/data');
  //   const client = new BetaAnalyticsDataClient({ credentials: JSON.parse(...) });
  //   const [response] = await client.runReport({ ... });
  console.log('   ℹ️  GA4 stub — install @google-analytics/data and wire credentials');
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
