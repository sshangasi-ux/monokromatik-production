#!/usr/bin/env tsx
/**
 * Merge tool: combine our voice-refreshed local articles.json with the
 * 3 new agent-generated articles that landed on origin/main while we
 * were working.
 *
 * The merged file:
 *   1. Keeps all 12 voice-refreshed articles (with stylistNote, voiceRefreshedAt)
 *   2. Prepends the 3 new agent-generated articles (newest first)
 *   3. Marks the 3 new ones as needing voice refresh (we'll fix them next)
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..');
const ARTICLES_PATH = join(REPO_ROOT, 'data/articles.json');

function getArticlesAtRef(ref: string): any[] {
  const text = execSync(`git show ${ref}:data/articles.json`, {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(text);
}

const local = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8')) as any[];
const remote = getArticlesAtRef('origin/main') as any[];

console.log(`Local (HEAD):   ${local.length} articles`);
console.log(`Remote (origin/main): ${remote.length} articles`);

const localSlugs = new Set(local.map((a) => a.slug));
const remoteSlugs = new Set(remote.map((a) => a.slug));

// New on remote, not on local: these are the 3 morning agent runs.
const newOnRemote = remote.filter((a) => !localSlugs.has(a.slug));
// Articles only on local (none expected — local is the older state plus voice work).
const onlyOnLocal = local.filter((a) => !remoteSlugs.has(a.slug));

console.log(`New on remote (not in local): ${newOnRemote.length}`);
newOnRemote.forEach((a) => console.log(`  + ${a.slug}`));
console.log(`Only on local (not on remote): ${onlyOnLocal.length}`);
onlyOnLocal.forEach((a) => console.log(`  - ${a.slug}`));

// Build the merged set: all new agent articles first (newest), then all
// voice-refreshed articles in their original order.
const merged = [
  ...newOnRemote.map((a) => ({ ...a, _needsVoiceRefresh: true })),
  ...local,
];

console.log(`\nMerged total: ${merged.length} articles`);
console.log(`(${newOnRemote.length} marked _needsVoiceRefresh)`);

writeFileSync(ARTICLES_PATH, JSON.stringify(merged, null, 2));
console.log(`\n✅ Wrote merged articles to data/articles.json`);
