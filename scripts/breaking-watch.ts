#!/usr/bin/env node
/**
 * Breaking-news radar — the always-on pull. Fetches the latest from our trusted
 * feeds, asks the model which items are genuinely BREAKING and of major interest
 * to our followers, and emails an immediate alert. Deduped via a ledger so each
 * story alerts once. Run on a tight cron (see breaking-news.yml).
 *
 *   npm run breaking:watch                 # fetch → judge → alert + update ledger
 *   npm run breaking:watch -- --dry        # judge + report only (no email/ledger)
 *   npm run breaking:watch -- --window=4   # look back N hours (default 3)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from '../lib/ai-models';
import { fetchMonoKromatikStories } from '../lib/fetch-stories';
import { selectCandidates, judgePrompt, parseVerdicts, renderAlert, mergeBreaks, type BreakingHit, type BreakingFeed } from '../lib/breaking';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const ts = () => new Date().toISOString();
const log = (m: string) => console.log(`[${ts()}] [breaking] ${m}`);
const LEDGER = join(__dirname, '../output/breaking-ledger.json');
const FEED = join(__dirname, '../data/breaking.json');
const IMPORTANCE_BAR = 4;

/** Publish confirmed hits to The Wire (data/breaking.json). Deduped + capped. */
function publishBreaks(hits: BreakingHit[]): void {
  let feed: BreakingFeed = { updatedAt: ts(), breaks: [] };
  if (existsSync(FEED)) {
    try { feed = JSON.parse(readFileSync(FEED, 'utf-8')); } catch { /* start fresh */ }
  }
  const merged = mergeBreaks(feed, hits, ts());
  writeFileSync(FEED, JSON.stringify(merged, null, 2) + '\n');
  log(`Published to The Wire → data/breaking.json (${merged.breaks.length} total).`);
}

async function sendAlert(hits: BreakingHit[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.EIC_DIGEST_TO || 'editor@monokromatik.com';
  const from = process.env.EIC_DIGEST_FROM ?? 'MonoKromatik Radar <onboarding@resend.dev>';
  if (!apiKey) {
    log('RESEND_API_KEY not set — would have alerted; skipping send.');
    return false;
  }
  const { subject, html, text } = renderAlert(hits, ts());
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  if (!res.ok) {
    log(`Resend failed (${res.status}): ${await res.text()}`);
    return false;
  }
  log(`Alert sent → ${to} (${hits.length} story/ies).`);
  return true;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const windowHours = parseInt(args.find((a) => a.startsWith('--window='))?.split('=')[1] || '3', 10);

  // Ledger of already-alerted/seen links.
  let ledger: { alerted: string[]; updatedAt?: string } = { alerted: [] };
  if (existsSync(LEDGER)) {
    try { ledger = JSON.parse(readFileSync(LEDGER, 'utf-8')); } catch { /* reset */ }
  }
  const alerted = new Set(ledger.alerted || []);

  const stories = await fetchMonoKromatikStories();
  const cands = selectCandidates(stories, alerted, { windowHours });
  log(`${stories.length} fetched · ${cands.length} fresh+new in last ${windowHours}h`);
  if (cands.length === 0) {
    log('Nothing new to judge.');
    return;
  }

  // AI judge (cheap utility model; the bar is strict).
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });
  const msg = await client.messages.create({
    model: MODELS.utility,
    max_tokens: 4000,
    messages: [{ role: 'user', content: judgePrompt(cands) }],
  });
  const text = msg.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n');
  const verdicts = parseVerdicts(text, cands);

  const hits: BreakingHit[] = verdicts
    .filter((v) => v.breaking && v.importance >= IMPORTANCE_BAR)
    .map((v) => {
      const c = cands.find((x) => x.link === v.link)!;
      return { ...c, importance: v.importance, why: v.why };
    });

  log(`Judged ${verdicts.length} · ${hits.length} breaking (importance ≥ ${IMPORTANCE_BAR}).`);
  hits.forEach((h) => log(`  🔴 [${h.importance}/5] ${h.source}: ${h.title.slice(0, 70)}`));

  if (dry) {
    log('Dry run — no email, no ledger write.');
    return;
  }

  if (hits.length > 0) {
    await sendAlert(hits);   // instant operator alert (email)
    publishBreaks(hits);     // audience-facing surface (The Wire); workflow opens a review PR
  }

  // Mark every judged candidate as seen (even non-hits) so we don't re-judge/re-cost.
  for (const c of cands) alerted.add(c.link);
  mkdirSync(join(__dirname, '../output'), { recursive: true });
  writeFileSync(LEDGER, JSON.stringify({ alerted: [...alerted].slice(-2000), updatedAt: ts() }, null, 2) + '\n');
  log(`Ledger updated (${alerted.size} links tracked).`);
}

main().catch((err) => {
  console.error('❌ breaking-watch crashed:', err);
  process.exit(1);
});
