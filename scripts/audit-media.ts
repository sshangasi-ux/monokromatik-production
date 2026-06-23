#!/usr/bin/env node
/**
 * Audit every write-up's media element — presence AND whether it actually works.
 *
 * Walks articles, case studies and issues, collects each media URL, and checks it:
 *  - remote URLs: HTTP reachable + image/video content-type
 *  - local /public paths: file exists on disk
 * Reports MISSING (no media), BROKEN (media that doesn't resolve), and OK.
 *
 * Read-only. Run:  npm run media:audit   (writes output/media-audit.json + prints)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');

type Status = 'missing' | 'broken' | 'ok';
interface Check {
  type: 'article' | 'case-study' | 'issue';
  slug: string;
  field: string;
  url?: string;
  status: Status;
  detail?: string;
}

async function checkUrl(url: string): Promise<{ ok: boolean; detail: string }> {
  // Local public asset.
  if (url.startsWith('/')) {
    const p = join(PUBLIC, url.split('?')[0]);
    return existsSync(p) ? { ok: true, detail: 'local file' } : { ok: false, detail: 'local file missing' };
  }
  if (!/^https?:\/\//i.test(url)) return { ok: false, detail: 'not a URL' };
  // Remote: try GET with a small range (HEAD is often blocked).
  for (const attempt of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, {
        method: attempt,
        headers: { 'User-Agent': 'Mozilla/5.0 MonoKromatikMediaAudit', Range: 'bytes=0-2048' },
        signal: AbortSignal.timeout(12_000),
        redirect: 'follow',
      });
      if (res.ok || res.status === 206) {
        const ct = res.headers.get('content-type') || '';
        const okType = /image|video|octet-stream|^$/.test(ct);
        return { ok: okType, detail: `${res.status} ${ct || 'no-content-type'}` };
      }
      if (attempt === 'GET') return { ok: false, detail: `HTTP ${res.status}` };
    } catch (e) {
      if (attempt === 'GET') return { ok: false, detail: e instanceof Error ? e.message : 'fetch failed' };
    }
  }
  return { ok: false, detail: 'unreachable' };
}

async function main() {
  const A = JSON.parse(readFileSync(join(ROOT, 'data/articles.json'), 'utf-8'));
  const C = JSON.parse(readFileSync(join(ROOT, 'data/case-studies.json'), 'utf-8'));
  const I = JSON.parse(readFileSync(join(ROOT, 'data/issues.json'), 'utf-8'));
  const checks: Check[] = [];

  for (const a of A) {
    if (!a.imageUrl) {
      checks.push({ type: 'article', slug: a.slug, field: 'imageUrl', status: 'missing' });
    } else {
      const r = await checkUrl(a.imageUrl);
      checks.push({ type: 'article', slug: a.slug, field: 'imageUrl', url: a.imageUrl, status: r.ok ? 'ok' : 'broken', detail: r.detail });
    }
  }

  for (const c of C) {
    if (!c.media || c.media.length === 0) {
      checks.push({ type: 'case-study', slug: c.slug, field: 'media[]', status: 'missing' });
      continue;
    }
    for (let i = 0; i < c.media.length; i++) {
      const r = await checkUrl(c.media[i].src);
      checks.push({ type: 'case-study', slug: c.slug, field: `media[${i}]`, url: c.media[i].src, status: r.ok ? 'ok' : 'broken', detail: r.detail });
    }
  }

  for (const iss of I) {
    if (iss.status !== 'live') continue; // only live issues render
    const img = iss.cover?.image;
    if (!img) {
      checks.push({ type: 'issue', slug: iss.number, field: 'cover.image', status: 'missing' });
    } else {
      const r = await checkUrl(img);
      checks.push({ type: 'issue', slug: iss.number, field: 'cover.image', url: img, status: r.ok ? 'ok' : 'broken', detail: r.detail });
    }
  }

  const by = (s: Status) => checks.filter((c) => c.status === s);
  const missing = by('missing');
  const broken = by('broken');
  const ok = by('ok');

  console.log(`\n=== MEDIA AUDIT ===`);
  console.log(`OK: ${ok.length} · MISSING: ${missing.length} · BROKEN: ${broken.length}\n`);
  if (broken.length) {
    console.log('BROKEN (resolve failed):');
    for (const c of broken) console.log(`  🔴 [${c.type}] ${c.slug} ${c.field} — ${c.detail} — ${c.url}`);
    console.log('');
  }
  if (missing.length) {
    console.log('MISSING (no media element):');
    for (const c of missing) console.log(`  ⚪ [${c.type}] ${c.slug} ${c.field}`);
    console.log('');
  }

  const outDir = join(ROOT, 'output');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'media-audit.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary: { ok: ok.length, missing: missing.length, broken: broken.length }, checks }, null, 2));
  console.log(`Wrote output/media-audit.json (${checks.length} checks).`);
}

main().catch((e) => {
  console.error('audit failed:', e);
  process.exit(1);
});
