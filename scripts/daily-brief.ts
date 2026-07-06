#!/usr/bin/env node
/**
 * Operator's Daily Brief — runs the deterministic ops/growth/monetisation review
 * and delivers it three ways so it always lands: (1) email to the operator via
 * Resend, (2) the GitHub Actions run summary, (3) a committed copy at
 * docs/briefs/YYYY-MM-DD.md. No AI/credits needed.
 *
 *   npm run brief:daily            # generate + deliver
 *   npm run brief:daily -- --print # just print to stdout
 */

import { writeFileSync, mkdirSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { gatherOps, renderBrief, briefToHtml } from '../lib/daily-brief';

const PRINT_ONLY = process.argv.includes('--print');

async function sendEmail(subject: string, html: string): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DAILY_BRIEF_TO || process.env.EIC_DIGEST_TO || 'editor@monokromatik.com';
  const from = process.env.EIC_DIGEST_FROM || 'MonoKromatik <onboarding@resend.dev>';
  if (!apiKey) return 'skipped (RESEND_API_KEY not set)';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok ? `emailed → ${to}` : `email failed (${res.status})`;
  } catch (e) {
    return `email error: ${(e as Error).message}`;
  }
}

async function main() {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const label = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  const ops = await gatherOps();
  const markdown = renderBrief(ops, label);

  if (PRINT_ONLY) { console.log(markdown); return; }

  // 1) repo copy
  const dir = join(process.cwd(), 'docs', 'briefs');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${iso}.md`), markdown + '\n');

  // 2) run summary
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n');

  // 3) email
  const status = await sendEmail(`MonoKromatik — Daily Brief · ${label}`, briefToHtml(markdown));
  console.log(`Daily brief written to docs/briefs/${iso}.md · ${status}`);
}

main().catch((e) => { console.error('daily-brief failed:', e); process.exit(1); });
