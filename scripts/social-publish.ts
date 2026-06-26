#!/usr/bin/env node
/**
 * Social auto-poster — publishes the next unposted item (Wire break first, else
 * latest article) to Instagram via the Meta Graph API, using the public branded
 * card (/api/social-card?...&format=jpg) + the generated caption.
 *
 *   npm run social:publish            # publish the next item (needs IG creds)
 *   npm run social:publish -- --dry   # preview only: print what WOULD post
 *   npm run social:publish -- --slug=<article-slug>   # target a specific article
 *
 * Review-gated vs fully-auto is decided by the workflow (social-publish.yml):
 * scheduled runs preview unless the repo var SOCIAL_AUTOPOST=on; a manual dispatch
 * with publish=true posts on the operator's approval. Deduped via a cache ledger.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getAllArticles } from '../lib/articles';
import { getBreaks } from '../lib/breaking-feed';
import { articleCaption, breakCaption } from '../lib/social-caption';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const SITE = 'https://www.monokromatik.com';
const GRAPH = 'https://graph.facebook.com/v21.0';
const LEDGER = join(__dirname, '../output/social-ledger.json');
const log = (m: string) => console.log(`[${new Date().toISOString()}] [social] ${m}`);
const summary = (m: string) => {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f) { try { writeFileSync(f, m + '\n', { flag: 'a' }); } catch { /* ignore */ } }
};

interface Candidate { id: string; kind: 'break' | 'article'; title: string; cardUrl: string; caption: string; link: string; }

function nextCandidate(posted: Set<string>): Candidate | null {
  const slugFlag = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];
  if (slugFlag) {
    const a = getAllArticles().find((x) => x.slug === slugFlag);
    if (a) return mkArticle(a);
  }
  // Wire breaks first (most timely), newest → oldest.
  for (const [i, b] of getBreaks().entries()) {
    const id = `break:${b.link}`;
    if (!posted.has(id)) return {
      id, kind: 'break', title: b.title,
      cardUrl: `${SITE}/api/social-card?break=${i}&format=jpg`,
      caption: breakCaption(b), link: `${SITE}/breaking`,
    };
  }
  for (const a of getAllArticles()) {
    const id = `art:${a.slug}`;
    if (!posted.has(id)) return mkArticle(a);
  }
  return null;
}

function mkArticle(a: ReturnType<typeof getAllArticles>[number]): Candidate {
  return {
    id: `art:${a.slug}`, kind: 'article', title: a.title,
    cardUrl: `${SITE}/api/social-card?slug=${encodeURIComponent(a.slug)}&format=jpg`,
    caption: articleCaption(a), link: `${SITE}/article/${a.slug}`,
  };
}

async function publishToInstagram(c: Candidate): Promise<boolean> {
  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!userId || !token) {
    log('IG_USER_ID / IG_ACCESS_TOKEN not set — would have posted; skipping publish.');
    summary(`> **Not configured** — add \`IG_USER_ID\` + \`IG_ACCESS_TOKEN\` secrets to publish.`);
    return false;
  }
  // 1) create media container
  const createRes = await fetch(`${GRAPH}/${userId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: c.cardUrl, caption: c.caption, access_token: token }),
  });
  const created = await createRes.json();
  if (!createRes.ok || !created.id) {
    log(`Container create failed (${createRes.status}): ${JSON.stringify(created)}`);
    summary(`> ❌ Instagram container create failed: ${JSON.stringify(created.error ?? created)}`);
    return false;
  }
  // 2) publish it
  const pubRes = await fetch(`${GRAPH}/${userId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: created.id, access_token: token }),
  });
  const published = await pubRes.json();
  if (!pubRes.ok || !published.id) {
    log(`Publish failed (${pubRes.status}): ${JSON.stringify(published)}`);
    summary(`> ❌ Instagram publish failed: ${JSON.stringify(published.error ?? published)}`);
    return false;
  }
  log(`Published to Instagram (media ${published.id}).`);
  summary(`> ✅ **Posted to Instagram** — media \`${published.id}\``);
  return true;
}

async function main() {
  const dry = process.argv.includes('--dry');

  let ledger: { posted: string[]; updatedAt?: string } = { posted: [] };
  if (existsSync(LEDGER)) { try { ledger = JSON.parse(readFileSync(LEDGER, 'utf-8')); } catch { /* reset */ } }
  const posted = new Set(ledger.posted || []);

  const c = nextCandidate(posted);
  if (!c) { log('Nothing new to post.'); summary('Nothing new to post.'); return; }

  log(`Next ${c.kind}: ${c.title.slice(0, 70)}`);
  summary(`### ${dry ? '🔍 Review — next post (not published)' : '📸 Posting to Instagram'}`);
  summary(`**${c.title}**\n`);
  summary(`Card: ${c.cardUrl}\n`);
  summary(`Caption:\n\n\`\`\`\n${c.caption}\n\`\`\`\n`);
  summary(`Link for bio/Stories: ${c.link}`);

  if (dry) {
    log('Dry run — preview only, no publish, ledger unchanged.');
    summary(`\n_Review mode: dispatch this workflow with publish=true (or set SOCIAL_AUTOPOST=on) to post._`);
    return;
  }

  const ok = await publishToInstagram(c);
  if (ok) {
    posted.add(c.id);
    mkdirSync(join(__dirname, '../output'), { recursive: true });
    writeFileSync(LEDGER, JSON.stringify({ posted: [...posted].slice(-500), updatedAt: new Date().toISOString() }, null, 2) + '\n');
    log(`Ledger updated (${posted.size} posted).`);
  } else {
    process.exitCode = 1;
  }
}

main().catch((err) => { console.error('❌ social-publish crashed:', err); process.exit(1); });
