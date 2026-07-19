#!/usr/bin/env node
/**
 * LinkedIn auto-poster — publishes the next unposted item (Wire break first, else
 * latest article) to a LinkedIn Page via the versioned Posts API, using the
 * public branded card + generated caption. Its own ledger, so it dedups
 * independently of Instagram.
 *
 *   npm run linkedin:publish            # publish the next item (needs creds)
 *   npm run linkedin:publish -- --dry   # preview only: print what WOULD post
 *   npm run linkedin:publish -- --slug=<article-slug>
 *
 * Env: LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN (e.g. urn:li:organization:123).
 * Review-gated vs fully-auto is decided by the workflow (linkedin-publish.yml).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nextCandidate } from '../lib/social-queue';
import { publishToLinkedIn } from '../lib/linkedin';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const LEDGER = join(__dirname, '../output/linkedin-ledger.json');
const log = (m: string) => console.log(`[${new Date().toISOString()}] [linkedin] ${m}`);
const summary = (m: string) => {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f) { try { writeFileSync(f, m + '\n', { flag: 'a' }); } catch { /* ignore */ } }
};

async function main() {
  const dry = process.argv.includes('--dry');
  const slug = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];

  let ledger: { posted: string[]; updatedAt?: string } = { posted: [] };
  if (existsSync(LEDGER)) { try { ledger = JSON.parse(readFileSync(LEDGER, 'utf-8')); } catch { /* reset */ } }
  const posted = new Set(ledger.posted || []);

  const c = nextCandidate(posted, slug, { network: 'linkedin' });
  if (!c) { log('Nothing new to post.'); summary('Nothing new to post.'); return; }

  log(`Next ${c.kind}: ${c.title.slice(0, 70)}`);
  summary(`### ${dry ? '🔍 Review — next LinkedIn post (not published)' : '💼 Posting to LinkedIn'}`);
  summary(`**${c.title}**\n`);
  summary(`Card: ${c.cardUrl}\n`);
  summary(`Caption:\n\n\`\`\`\n${c.caption}\n\`\`\`\n`);
  summary(`Link: ${c.link}`);

  if (dry) {
    log('Dry run — preview only, no publish, ledger unchanged.');
    summary(`\n_Review mode: dispatch with publish=true (or set LINKEDIN_AUTOPOST=on) to post._`);
    return;
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;
  if (!token || !authorUrn) {
    log('LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN not set — would have posted; skipping.');
    summary('> **Not configured** — add `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_AUTHOR_URN` secrets to publish.');
    return;
  }

  // The caption embeds the link in text (LinkedIn makes URLs clickable).
  const caption = `${c.caption}\n\n${c.link}`;
  const res = await publishToLinkedIn({ token, authorUrn, imageUrl: c.cardUrl, caption, altText: c.title });
  if (res.ok) {
    log(`Published to LinkedIn (${res.id ?? 'ok'}).`);
    summary(`> ✅ **Posted to LinkedIn** — \`${res.id ?? 'ok'}\``);
    posted.add(c.id);
    mkdirSync(join(__dirname, '../output'), { recursive: true });
    writeFileSync(LEDGER, JSON.stringify({ posted: [...posted].slice(-500), updatedAt: new Date().toISOString() }, null, 2) + '\n');
  } else {
    log(`Publish failed: ${res.error}`);
    summary(`> ❌ LinkedIn publish failed: ${res.error}`);
    process.exitCode = 1;
  }
}

main().catch((err) => { console.error('❌ linkedin-publish crashed:', err); process.exit(1); });
