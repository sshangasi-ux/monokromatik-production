// Google Search Console integration — pulls query-level organic search data
// (the most valuable SEO signal for a depth-led publication) via the Search
// Analytics API, using the shared service-account auth. No-ops gracefully when
// the credential isn't configured.
//
// Setup: grant the GA4_SERVICE_ACCOUNT_JSON service account access to the GSC
// property (Search Console → Settings → Users and permissions → Add user →
// the service account's client_email, Restricted/Full). Optionally set
// GSC_SITE_URL (default https://www.monokromatik.com/; use "sc-domain:monokromatik.com"
// for a domain property).

import { getGoogleAccessToken } from './google-auth';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SITE = process.env.GSC_SITE_URL || 'https://www.monokromatik.com/';

export interface SearchRow {
  key: string; // the query or page
  clicks: number;
  impressions: number;
  ctr: number; // 0–1
  position: number;
}

export interface SearchInsights {
  window: { start: string; end: string };
  site: string;
  /** Highest-traffic queries (by clicks). */
  topQueries: SearchRow[];
  /** Highest-traffic landing pages (by clicks). */
  topPages: SearchRow[];
  /** Page-2 opportunities: ranking 8–20 with real impressions — a small lift
   *  here (better title/intro/internal links) converts impressions to clicks. */
  opportunities: SearchRow[];
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

interface ApiRow { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }

async function query(token: string, startDate: string, endDate: string, dimension: 'query' | 'page'): Promise<SearchRow[]> {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions: [dimension], rowLimit: 200 }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    console.warn(`[gsc] ${dimension} query failed (${res.status})`);
    return [];
  }
  const data = (await res.json()) as { rows?: ApiRow[] };
  return (data.rows || []).map((r) => ({
    key: r.keys?.[0] ?? '',
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

/** Pull the last `days` of Search Console data. Returns null if not configured. */
export async function getSearchInsights(days = 28): Promise<SearchInsights | null> {
  const token = await getGoogleAccessToken(SCOPE);
  if (!token) return null;

  const end = new Date();
  const start = new Date(Date.now() - days * 86_400_000);
  const [byQuery, byPage] = await Promise.all([
    query(token, isoDate(start), isoDate(end), 'query'),
    query(token, isoDate(start), isoDate(end), 'page'),
  ]);

  const topQueries = [...byQuery].sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  const topPages = [...byPage].sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  const opportunities = byQuery
    .filter((r) => r.position >= 8 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  return { window: { start: isoDate(start), end: isoDate(end) }, site: SITE, topQueries, topPages, opportunities };
}
