#!/usr/bin/env node
/**
 * Syndicate — fan the next unposted item (latest article first, else a Wire
 * break) out to the FREE-API social channels: Bluesky, Mastodon, Telegram and
 * Discord. These four need only a token or app password (no dev-app review, no
 * paid tier), so the whole lane is zero-cost and self-hosted inside CI.
 *
 *   npm run syndicate              # post the next item to every CONFIGURED channel
 *   npm run syndicate -- --dry     # preview only: print what WOULD post, ledger untouched
 *   npm run syndicate -- --verify  # just report which channels have their secrets set
 *   npm run syndicate -- --slug=<article-slug>   # target a specific article
 *
 * Each channel is SKIPPED when its secret(s) are absent — so you can turn one on
 * by adding its secret and leave the rest dark. Each keeps its own slot in a
 * single ledger (output/syndicate-ledger.json), so adding a channel later
 * back-fills from the current item forward and never double-posts.
 *
 * Secrets (all optional; a channel with none set is skipped):
 *   BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD        (+ BLUESKY_SERVICE, default https://bsky.social)
 *   MASTODON_BASE_URL, MASTODON_ACCESS_TOKEN
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *   DISCORD_WEBHOOK_URL
 *
 * Review-gated vs fully-auto is decided by the workflow (syndicate.yml); this
 * script just posts when asked and skips what it can't.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nextCandidate, type SocialCandidate } from '../lib/social-queue';

// Load .env.local for local runs (CI injects real env vars instead).
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const LEDGER = join(__dirname, '../output/syndicate-ledger.json');
const log = (m: string) => console.log(`[${new Date().toISOString()}] [syndicate] ${m}`);
const summary = (m: string) => {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f) { try { writeFileSync(f, m + '\n', { flag: 'a' }); } catch { /* ignore */ } }
};

type Ledger = { channels: Record<string, string[]>; updatedAt?: string };

function loadLedger(): Ledger {
  if (existsSync(LEDGER)) {
    try {
      const raw = JSON.parse(readFileSync(LEDGER, 'utf-8'));
      if (raw && typeof raw === 'object' && raw.channels) return raw as Ledger;
    } catch { /* reset */ }
  }
  return { channels: {} };
}

function saveLedger(l: Ledger) {
  mkdirSync(join(__dirname, '../output'), { recursive: true });
  l.updatedAt = new Date().toISOString();
  writeFileSync(LEDGER, JSON.stringify(l, null, 2) + '\n');
}

/** Re-point utm_source at the posting channel (the queue bakes in one source;
 *  withUtm is an overwrite, so this stays idempotent). Returns url unchanged if
 *  it can't be parsed. */
function retagSource(url: string, source: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', source);
    return u.toString();
  } catch {
    return url;
  }
}

function trim(s: string, n: number): string {
  const clean = (s || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:—-]+$/, '') + '…';
}

/** A one-line description for link cards — the context block of the queue caption
 *  (skip the title line and any hashtag line). */
function shortDescription(c: SocialCandidate): string {
  const blocks = (c.caption || '').split('\n\n').map((b) => b.trim());
  for (const b of blocks) {
    if (!b || b === c.title) continue;
    if (b.startsWith('#')) continue;
    return trim(b, 200);
  }
  return trim(c.title, 200);
}

type PostResult = { ok: boolean; id?: string; error?: string };

interface Channel {
  name: string;
  configured(): boolean;
  post(c: SocialCandidate): Promise<PostResult>;
}

// ── Bluesky (AT Protocol) ─────────────────────────────────────────────────────
// createSession with an app password, then createRecord. We attach an external
// link card (uri/title/description) and, best-effort, the branded card as its
// thumb via uploadBlob. No link needed in the body — the card carries it.
const bluesky: Channel = {
  name: 'bluesky',
  configured: () => !!(process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_APP_PASSWORD),
  async post(c) {
    const service = (process.env.BLUESKY_SERVICE || 'https://bsky.social').replace(/\/$/, '');
    try {
      const sessRes = await fetch(`${service}/xrpc/com.atproto.server.createSession`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          identifier: process.env.BLUESKY_IDENTIFIER,
          password: process.env.BLUESKY_APP_PASSWORD,
        }),
      });
      if (!sessRes.ok) return { ok: false, error: `createSession ${sessRes.status}: ${await sessRes.text()}` };
      const sess = await sessRes.json() as { accessJwt: string; did: string };
      const auth = { authorization: `Bearer ${sess.accessJwt}` };
      const link = retagSource(c.link, 'bluesky');

      // Best-effort: upload the branded card as the link-card thumb.
      let thumb: unknown;
      try {
        const img = await fetch(c.cardUrl);
        if (img.ok) {
          const ct = img.headers.get('content-type') || 'image/jpeg';
          const bytes = Buffer.from(await img.arrayBuffer());
          if (bytes.length > 0 && bytes.length < 1_000_000) {
            const up = await fetch(`${service}/xrpc/com.atproto.repo.uploadBlob`, {
              method: 'POST', headers: { ...auth, 'content-type': ct }, body: bytes,
            });
            if (up.ok) thumb = (await up.json() as { blob: unknown }).blob;
          }
        }
      } catch { /* no thumb — the card still renders without it */ }

      const external: Record<string, unknown> = {
        uri: link, title: trim(c.title, 280), description: shortDescription(c),
      };
      if (thumb) external.thumb = thumb;

      const text = trim(c.title, 280);
      const record = {
        $type: 'app.bsky.feed.post',
        text,
        createdAt: new Date().toISOString(),
        embed: { $type: 'app.bsky.embed.external', external },
      };
      const res = await fetch(`${service}/xrpc/com.atproto.repo.createRecord`, {
        method: 'POST',
        headers: { ...auth, 'content-type': 'application/json' },
        body: JSON.stringify({ repo: sess.did, collection: 'app.bsky.feed.post', record }),
      });
      if (!res.ok) return { ok: false, error: `createRecord ${res.status}: ${await res.text()}` };
      const out = await res.json() as { uri?: string };
      return { ok: true, id: out.uri };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

// ── Mastodon ──────────────────────────────────────────────────────────────────
// A plain status with the link in the body — Mastodon fetches the OG card from
// our dynamic opengraph-image, so the branded card renders with no media upload.
const mastodon: Channel = {
  name: 'mastodon',
  configured: () => !!(process.env.MASTODON_BASE_URL && process.env.MASTODON_ACCESS_TOKEN),
  async post(c) {
    const base = (process.env.MASTODON_BASE_URL || '').replace(/\/$/, '');
    const link = retagSource(c.link, 'mastodon');
    const status = `${trim(c.title, 380)}\n\n${link}`;
    try {
      const res = await fetch(`${base}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
          'content-type': 'application/json',
          'idempotency-key': c.id,
        },
        body: JSON.stringify({ status, visibility: 'public' }),
      });
      if (!res.ok) return { ok: false, error: `${res.status}: ${await res.text()}` };
      const out = await res.json() as { url?: string; id?: string };
      return { ok: true, id: out.url || out.id };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

// ── Telegram ───────────────────────────────────────────────────────────────────
// sendPhoto with the branded card URL (Telegram fetches it) + caption with the link.
const telegram: Channel = {
  name: 'telegram',
  configured: () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  async post(c) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const link = retagSource(c.link, 'telegram');
    const caption = `${trim(c.title, 820)}\n\n${link}`;
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, photo: c.cardUrl, caption }),
      });
      const out = await res.json() as { ok?: boolean; description?: string; result?: { message_id?: number } };
      if (!res.ok || !out.ok) return { ok: false, error: out.description || `HTTP ${res.status}` };
      return { ok: true, id: out.result?.message_id ? String(out.result.message_id) : 'ok' };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

// ── Discord (incoming webhook) ──────────────────────────────────────────────────
// content with the link (Discord unfurls our OG card) + an explicit image embed
// of the branded card so it shows even if unfurl is throttled.
const discord: Channel = {
  name: 'discord',
  configured: () => !!process.env.DISCORD_WEBHOOK_URL,
  async post(c) {
    const link = retagSource(c.link, 'discord');
    const content = `**${trim(c.title, 230)}**\n${link}`;
    try {
      const res = await fetch(`${process.env.DISCORD_WEBHOOK_URL}?wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content,
          embeds: [{ title: trim(c.title, 230), url: link, description: shortDescription(c), image: { url: c.cardUrl } }],
        }),
      });
      if (!res.ok) return { ok: false, error: `${res.status}: ${await res.text()}` };
      const out = await res.json().catch(() => ({})) as { id?: string };
      return { ok: true, id: out.id || 'ok' };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

const CHANNELS: Channel[] = [bluesky, mastodon, telegram, discord];

async function main() {
  const dry = process.argv.includes('--dry');
  const verify = process.argv.includes('--verify');
  const slug = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];

  const configured = CHANNELS.filter((ch) => ch.configured());
  const dark = CHANNELS.filter((ch) => !ch.configured());

  summary('### 🛰️ Syndicate');
  summary(`Configured: ${configured.map((c) => c.name).join(', ') || '_none_'}`);
  if (dark.length) summary(`Not configured (skipped): ${dark.map((c) => c.name).join(', ')}`);

  if (verify) {
    log(`Configured: ${configured.map((c) => c.name).join(', ') || 'none'}`);
    log(`Not configured: ${dark.map((c) => c.name).join(', ') || 'none'}`);
    return;
  }

  if (!configured.length) {
    log('No channels configured — add a channel secret to start syndicating.');
    summary('\n> **No channels configured.** Add Bluesky / Mastodon / Telegram / Discord secrets to begin.');
    return;
  }

  const ledger = loadLedger();
  let changed = false;

  for (const ch of configured) {
    const posted = new Set(ledger.channels[ch.name] || []);
    const c = nextCandidate(posted, slug, { network: 'linkedin' }); // article-first ordering
    if (!c) { log(`[${ch.name}] nothing new to post.`); summary(`- **${ch.name}** — nothing new.`); continue; }

    if (dry) {
      log(`[${ch.name}] would post ${c.kind}: ${c.title.slice(0, 70)}`);
      summary(`- **${ch.name}** → would post _${c.title}_  \n  ${retagSource(c.link, ch.name)}`);
      continue;
    }

    const res = await ch.post(c);
    if (res.ok) {
      log(`[${ch.name}] posted ${c.kind}: ${c.title.slice(0, 70)} (${res.id ?? 'ok'})`);
      summary(`- ✅ **${ch.name}** — posted _${c.title}_ ${res.id ? `\`${res.id}\`` : ''}`);
      posted.add(c.id);
      ledger.channels[ch.name] = [...posted].slice(-500);
      changed = true;
    } else {
      log(`[${ch.name}] FAILED: ${res.error}`);
      summary(`- ❌ **${ch.name}** — ${res.error}`);
      process.exitCode = 1;
    }
  }

  if (changed && !dry) saveLedger(ledger);
}

main().catch((err) => { console.error('❌ syndicate crashed:', err); process.exit(1); });
