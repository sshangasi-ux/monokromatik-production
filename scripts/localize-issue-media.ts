// Self-host the hardcoded issue/dossier images listed in data/issue-media.json.
//
//   npx tsx scripts/localize-issue-media.ts [--force]
//
// Run where there's outbound network (CI / local) — official campaign CDNs like
// media.about.nike.com block browser hotlinking but allow a server-side fetch
// (no cross-site Referer). Each remote image is downloaded, normalised to a
// resized webp under public/article-media (served same-origin), and its path is
// written back to data/issue-media.json as `local`. Commit both; Vercel deploys.
//
// Idempotent: entries that already have `local` are skipped unless --force.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MEDIA_DIR = join(process.cwd(), 'public', 'article-media');
const MANIFEST = join(process.cwd(), 'data', 'issue-media.json');

interface Entry {
  remote: string;
  local: string | null;
  credit: string;
  sourceLabel: string;
  sourceHref: string;
}

async function localize(id: string, remoteUrl: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(remoteUrl, { headers: { 'User-Agent': UA, Accept: 'image/*' }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      console.log(`   ✗ ${id}: HTTP ${res.status} from origin`);
      return null;
    }
    const input = Buffer.from(await res.arrayBuffer());
    if (input.length < 1024) {
      console.log(`   ✗ ${id}: response too small (${input.length}b)`);
      return null;
    }
    const output = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const hash = createHash('sha1').update(remoteUrl).digest('hex').slice(0, 8);
    const filename = `${id.replace(/[^a-z0-9-]+/gi, '-').slice(0, 60).toLowerCase()}-${hash}.webp`;
    if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true });
    writeFileSync(join(MEDIA_DIR, filename), output);
    console.log(`   ✓ ${id}: ${input.length}b → ${output.length}b webp`);
    return `/article-media/${filename}`;
  } catch (err) {
    console.log(`   ✗ ${id}: ${err instanceof Error ? err.message : 'fetch failed'}`);
    return null;
  }
}

async function main() {
  const force = process.argv.includes('--force');
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8')) as Record<string, Entry>;
  const ids = Object.keys(manifest);
  console.log(`\n🖼️  Localizing ${ids.length} issue image(s)${force ? ' (force)' : ''}…\n`);

  let changed = 0;
  for (const id of ids) {
    const entry = manifest[id];
    if (entry.local && !force) {
      console.log(`   • ${id}: already local (${entry.local}) — skipping`);
      continue;
    }
    const local = await localize(id, entry.remote);
    if (local) {
      entry.local = local;
      changed++;
    }
  }

  if (changed > 0) {
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`\n✅ Localized ${changed} image(s). Commit data/issue-media.json + public/article-media.\n`);
  } else {
    console.log('\nℹ️  No images localized.\n');
  }
}

main().catch((err) => {
  console.error('❌ localize-issue-media failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
