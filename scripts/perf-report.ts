#!/usr/bin/env node
/**
 * GA4 performance loop — pulls real article performance from the GA4 Data API,
 * scores each article (star/solid/meh/kill), and folds it into the learning
 * ledger (data/learning-ledger.json) that biases the content curator toward
 * winning categories/sources. No-op-safe until GA4 is configured.
 *
 *   npm run perf:report
 */

import { appendFileSync } from 'fs';
import { generatePerformanceReport } from '../lib/analyze-performance';
import { updateLearningLedger, describeSignals } from '../lib/learning-signals';

const out: string[] = [];
const log = (s: string) => { console.log(s); out.push(s); };

async function main() {
  log('# GA4 performance loop');
  const report = await generatePerformanceReport(28);

  if (!report.articles.length) {
    log('\n⏭️ No GA4 article data — not configured, or no article pageviews in the window yet. Ledger unchanged.');
  } else {
    const stars = report.articles.filter((a) => a.verdict === 'star').length;
    const kills = report.articles.filter((a) => a.verdict === 'kill').length;
    log(`\n**${report.articles.length} articles scored** · ${stars} star · ${kills} to retire · window ${report.windowDays}d\n`);
    log('## Top articles');
    log('| article | views | avg engage | score | verdict |');
    log('|---|---|---|---|---|');
    for (const a of report.articles.slice(0, 15)) {
      log(`| ${a.slug.slice(0, 50)} | ${a.pageviews} | ${a.avgEngagementSec}s | ${a.score} | ${a.verdict} |`);
    }
    const signals = updateLearningLedger(report);
    log(`\n## Learning ledger → run #${signals.runs} (folded into data/learning-ledger.json)`);
    log(describeSignals(signals));
  }

  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join('\n') + '\n');
}

main().catch((e) => { console.error('perf-report failed:', e); process.exit(1); });
