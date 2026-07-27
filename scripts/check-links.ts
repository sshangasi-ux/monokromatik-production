#!/usr/bin/env node
/**
 * Link & embed health watchdog.
 *
 * The Media Watchdog checks images; this checks the OTHER half of credibility on
 * an accuracy-led publication — that every outbound citation still resolves:
 *   - article `sourceLink`s
 *   - case-study `sources[].href`s
 *   - video embeds (article `videoUrl` — YouTube/Vimeo verified via oembed, which
 *     returns 404 when a video is removed/private even though the watch page 200s)
 *
 * Read-only. It classifies each URL as ok / dead / blocked:
 *   - dead    = 404 / 410 / DNS failure / timeout — a real broken citation to fix.
 *   - blocked = 401 / 403 / 429 — bot protection (Cloudflare etc.); the page is
 *               almost certainly live, so we DON'T cry wolf on these.
 * The workflow opens an issue only when there are DEAD links.
 *
 *   npx tsx scripts/check-links.ts            # check, write output/link-health.json
 *   npx tsx scripts/check-links.ts --sample 30   # first N urls (quick local run)
 */

import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const sampleArg = process.argv.indexOf('--sample');
const SAMPLE = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) || 0 : 0;
const CONCURRENCY = 8;

interface Ref {
  url: string;
  where: string; // human-readable location, e.g. "article davido"
}
type Verdict = 'ok' | 'dead' | 'blocked';
interface Result extends Ref {
  verdict: Verdict;
  detail: string;
}

const report: string[] = [];
const log = (s: string) => {
  console.log(s);
  report.push(s);
};

function isYouTube(u: string) {
  return /(?:youtube\.com|youtu\.be)/i.test(u);
}
function isVimeo(u: string) {
  return /vimeo\.com/i.test(u);
}

/** A video embed is "live" iff its oembed endpoint resolves — the watch page
 *  returns 200 even for deleted/private videos, so we must use oembed. */
async function checkVideo(u: string): Promise<{ verdict: Verdict; detail: string }> {
  const endpoint = isYouTube(u)
    ? `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json`
    : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(u)}`;
  try {
    const res = await fetch(endpoint, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
    if (res.ok) return { verdict: 'ok', detail: `oembed ${res.status}` };
    if (res.status === 401 || res.status === 403 || res.status === 429) return { verdict: 'blocked', detail: `oembed ${res.status}` };
    return { verdict: 'dead', detail: `oembed ${res.status} (video removed/private)` };
  } catch (e) {
    return { verdict: 'dead', detail: e instanceof Error ? e.message : 'oembed unreachable' };
  }
}

async function checkUrl(u: string): Promise<{ verdict: Verdict; detail: string }> {
  if (isYouTube(u) || isVimeo(u)) return checkVideo(u);
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(u, {
        method,
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*', Range: 'bytes=0-2048' },
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok || res.status === 206) return { verdict: 'ok', detail: `${res.status}` };
      if (res.status === 401 || res.status === 403 || res.status === 429)
        return { verdict: 'blocked', detail: `${res.status} (bot protection)` };
      if (method === 'GET') return { verdict: 'dead', detail: `HTTP ${res.status}` };
    } catch (e) {
      if (method === 'GET') {
        // fetch() throws a bare "fetch failed"; the useful reason is on .cause.
        const name = e instanceof Error ? e.name : '';
        const cause = e instanceof Error ? (e.cause as Error | undefined)?.message : undefined;
        const reason = [e instanceof Error ? e.message : 'unreachable', cause].filter(Boolean).join(': ');
        // A redirect loop is a consent/geo/bot wall bouncing non-browser clients
        // (Statista et al) — the page is fine in a browser, so it's blocked, not dead.
        if (cause && /redirect count exceeded|too many redirects/i.test(cause))
          return { verdict: 'blocked', detail: 'redirect loop (bot protection)' };
        // A timeout or transient connection reset does NOT prove a link is dead —
        // slow sites (esp. African news outlets) stall under automated load yet
        // load fine in a browser. On 2026-07-27 six of eight "dead" links were
        // exactly this: live 200s the checker had timed out on. Only a definitive
        // HTTP 404/410 (handled above) or a DNS/TLS failure means dead; everything
        // ambiguous is reported as blocked (unverified) so it never manufactures
        // phantom repair work.
        const transient =
          name === 'TimeoutError' ||
          /timed out|timeout|aborted|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|socket hang up|other side closed|terminated/i.test(reason);
        if (transient) return { verdict: 'blocked', detail: `unverified — ${reason}` };
        return { verdict: 'dead', detail: reason };
      }
    }
  }
  return { verdict: 'dead', detail: 'unreachable' };
}

async function main() {
  const articles = JSON.parse(readFileSync(join(ROOT, 'data/articles.json'), 'utf-8'));
  const studies = JSON.parse(readFileSync(join(ROOT, 'data/case-studies.json'), 'utf-8'));

  const refs: Ref[] = [];
  for (const a of articles) {
    if (a.sourceLink?.startsWith('http')) refs.push({ url: a.sourceLink, where: `article “${a.slug}” sourceLink` });
    if (a.videoUrl?.startsWith('http')) refs.push({ url: a.videoUrl, where: `article “${a.slug}” video` });
  }
  for (const c of studies) {
    for (const s of c.sources || [])
      if (s.href?.startsWith('http')) refs.push({ url: s.href, where: `case-study “${c.slug}” source (${s.publisher || s.label || ''})` });
  }

  // De-dupe by URL (keep the first location for reporting), then optionally sample.
  const seen = new Map<string, Ref>();
  for (const r of refs) if (!seen.has(r.url)) seen.set(r.url, r);
  let unique = [...seen.values()];
  if (SAMPLE > 0) unique = unique.slice(0, SAMPLE);

  log(`# Link & embed health — ${unique.length} unique URLs (${refs.length} references)`);

  const results: Result[] = [];
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(batch.map((r) => checkUrl(r.url).then((v) => ({ ...r, ...v }))));
    results.push(...settled);
  }

  const dead = results.filter((r) => r.verdict === 'dead');
  const blocked = results.filter((r) => r.verdict === 'blocked');
  const ok = results.filter((r) => r.verdict === 'ok');

  log('');
  if (dead.length) {
    log(`## 🔴 Dead links (${dead.length}) — fix these`);
    for (const d of dead) log(`- **${d.detail}** — ${d.where}\n  ${d.url}`);
  } else {
    log(`## ✅ No dead links`);
  }
  log('');
  if (blocked.length) {
    log(`## ⚠️ Blocked (${blocked.length}) — bot protection, almost certainly live (not actioned)`);
    for (const b of blocked.slice(0, 20)) log(`- ${b.detail} — ${b.where}`);
  }
  log('');
  log(`**Summary:** ${ok.length} ok · ${blocked.length} blocked · **${dead.length} dead**`);

  mkdirSync(join(ROOT, 'output'), { recursive: true });
  writeFileSync(
    join(ROOT, 'output/link-health.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), total: results.length, ok: ok.length, blocked: blocked.length, dead: dead.map((d) => ({ url: d.url, where: d.where, detail: d.detail })) },
      null,
      2,
    ),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
  console.log(`\nWrote output/link-health.json`);
}

main().catch((e) => {
  console.error('check-links failed:', e);
  process.exit(1);
});
