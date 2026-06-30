#!/usr/bin/env node
/**
 * Search Console insights — pulls organic query data and surfaces the actions
 * worth taking: top queries/pages, and (the high-value one) page-2 opportunities
 * to convert impressions into clicks. Writes output/search-insights.json + a
 * markdown report; no-ops cleanly until the Google service account is configured.
 *
 *   npm run search:insights
 */

import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { getSearchInsights, type SearchRow } from '../lib/search-console';

const out: string[] = [];
const log = (s: string) => { console.log(s); out.push(s); };

function table(rows: SearchRow[], label: string) {
  if (!rows.length) { log(`_no ${label}_`); return; }
  log(`| ${label} | clicks | impr | CTR | pos |`);
  log('|---|---|---|---|---|');
  for (const r of rows.slice(0, 15)) {
    log(`| ${r.key.slice(0, 60)} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)} |`);
  }
}

async function main() {
  const insights = await getSearchInsights(28);

  log('# Search Console insights');
  if (!insights) {
    log('\n⏭️ **Not configured.** Set `GA4_SERVICE_ACCOUNT_JSON` and grant that service account access to the Search Console property (and optionally set `GSC_SITE_URL`). This script then reports automatically.');
    mkdirSync(join(process.cwd(), 'output'), { recursive: true });
    writeFileSync(join(process.cwd(), 'output/search-insights.json'), JSON.stringify({ configured: false }, null, 2));
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join('\n') + '\n');
    return;
  }

  log(`\n${insights.site} · ${insights.window.start} → ${insights.window.end}\n`);
  log(`## 🎯 Page-2 opportunities (rank 8–20, real impressions — a lift here wins clicks)`);
  table(insights.opportunities, 'query');
  log(`\n## Top queries`);
  table(insights.topQueries, 'query');
  log(`\n## Top landing pages`);
  table(insights.topPages, 'page');

  mkdirSync(join(process.cwd(), 'output'), { recursive: true });
  writeFileSync(join(process.cwd(), 'output/search-insights.json'), JSON.stringify({ configured: true, ...insights }, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join('\n') + '\n');
}

main().catch((e) => { console.error('search-insights failed:', e); process.exit(1); });
