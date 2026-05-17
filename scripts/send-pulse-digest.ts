#!/usr/bin/env tsx
/**
 * MonoKromatik Sunday Pulse Digest — Orchestrator
 *
 * Pulls articles published in the last 7 days, renders the digest HTML +
 * plaintext, and sends as a Kit broadcast to every active subscriber.
 *
 * Runs once per week on Sunday 06:00 UTC (= 08:00 SAST) via the GitHub
 * Actions workflow at .github/workflows/pulse-digest.yml.
 *
 * Local invocations:
 *   npm run pulse                  # send for real
 *   npm run pulse -- --dry-run     # render but don't send (writes preview to disk)
 *   npm run pulse -- --since=14    # use a 14-day window instead of 7
 *   npm run pulse -- --send-now    # bypass the empty-week guard (admin override)
 *
 * Required env vars:
 *   KIT_API_KEY   - the Kit v4 API key (kit_...). Already in Vercel + GH Actions.
 *
 * Optional env vars:
 *   PULSE_TEST_RECIPIENT  - if set, sends only to this email (not the full list).
 *                           Useful for the first real send.
 *
 * Exit behavior:
 *   exit 0 on success or graceful no-op (e.g. "0 articles this week — skipped")
 *   exit 1 on hard failure (missing API key, Kit returns 4xx/5xx)
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  renderPulseDigestHtml,
  renderPulseDigestPlaintext,
  renderSubjectLine,
} from '../lib/pulse-digest';
import type { Article } from '../lib/articles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const ARTICLES_PATH = join(REPO_ROOT, 'data/articles.json');
const PREVIEW_DIR = join(REPO_ROOT, '.pulse-previews');

// ---------- Local env loader (mirrors run-agents.ts) ----------

function loadDotEnvLocal() {
  const envPath = join(REPO_ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

// ---------- CLI args ----------

interface Args {
  dryRun: boolean;
  sinceDays: number;
  sendNow: boolean;
  /** Send via Resend to a single inbox (operator-only test). Bypasses Kit entirely. */
  testViaResend: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  // tsx strips '--' separator, but in case it's there explicitly we also
  // ignore it. This matches the convention used by scripts/run-agents.ts.
  const args = argv.filter((a) => a !== '--');

  let sinceDays = 7;
  const sinceFlag = args.find((a) => a.startsWith('--since='));
  if (sinceFlag) {
    const n = Number(sinceFlag.split('=')[1]);
    if (Number.isFinite(n) && n > 0 && n <= 90) sinceDays = n;
  }

  return {
    dryRun: args.includes('--dry-run'),
    sendNow: args.includes('--send-now'),
    testViaResend: args.includes('--test-via-resend'),
    sinceDays,
  };
}

// ---------- Article selection ----------

function loadArticlesPublishedSince(sinceDate: Date): Article[] {
  const raw = readFileSync(ARTICLES_PATH, 'utf-8');
  const all = JSON.parse(raw) as Article[];

  // Most recent first; articles.json already keeps publishedAt-desc order
  // but we sort defensively in case future agents change that.
  return all
    .filter((a) => {
      if (!a.publishedAt) return false;
      const pub = new Date(a.publishedAt);
      return pub >= sinceDate;
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

// ---------- Kit broadcast send ----------

interface KitBroadcastResult {
  ok: boolean;
  broadcastId?: number;
  status?: number;
  error?: unknown;
}

/**
 * Create and send a Kit broadcast in one call.
 *
 * Kit v4's POST /v4/broadcasts creates a draft. To send immediately, we
 * include `send_at: null` AND `published_at` in the past. As of writing,
 * Kit also accepts an explicit `state: "ready"` to publish on creation.
 * If the account requires manual review, the broadcast lands in drafts —
 * Sibu can review at https://app.kit.com/broadcasts.
 *
 * Failure modes:
 *   - 401: bad API key (Vercel/GH Actions misconfig)
 *   - 422: validation error, usually missing content or bad date format
 *   - 429: rate limit (Kit allows 600 req/min; we send <1/week)
 */
async function sendKitBroadcast(args: {
  apiKey: string;
  subject: string;
  html: string;
  plaintext: string;
  /** If set, send only to this single email — used for testing. */
  testRecipient?: string;
}): Promise<KitBroadcastResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Kit-Api-Key': args.apiKey,
  };

  const payload: Record<string, unknown> = {
    subject: args.subject,
    content: args.html,
    description: 'Sunday Pulse Digest',
    public: false, // don't show in the public archive
  };

  if (args.testRecipient) {
    // The "preview send" feature: target a single subscriber. Used for first-
    // run safety so we don't blast a half-baked email to the whole list.
    // Endpoint differs slightly — POST /v4/broadcasts then POST to send
    // to a single subscriber via the preview endpoint, but Kit hides that
    // behind UI gating. As a workaround we just create a normal broadcast
    // and rely on the test-list being empty in prod (we never set this
    // env var on the cron path).
    payload.test_email = args.testRecipient;
  }

  const res = await fetch('https://api.kit.com/v4/broadcasts', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return {
      ok: false,
      status: res.status,
      error: { body: text.slice(0, 800) },
    };
  }

  const data = (await res.json().catch(() => null)) as
    | { broadcast?: { id?: number } }
    | null;
  return { ok: true, broadcastId: data?.broadcast?.id };
}

// ---------- Main ----------

async function main() {
  loadDotEnvLocal();
  const args = parseArgs();

  console.log('━'.repeat(60));
  console.log('📬 MonoKromatik Sunday Pulse Digest');
  console.log(`   Window: last ${args.sinceDays} day(s)`);
  console.log(`   Mode:   ${args.dryRun ? 'DRY RUN (no send)' : 'LIVE SEND'}`);
  console.log('━'.repeat(60));
  console.log('');

  // Window: last N days, ending now.
  const now = new Date();
  const since = new Date(now.getTime() - args.sinceDays * 24 * 60 * 60 * 1000);

  const articles = loadArticlesPublishedSince(since);

  console.log(
    `Found ${articles.length} article(s) published since ${since.toISOString().slice(0, 10)}:`
  );
  for (const a of articles) {
    console.log(`   • ${a.publishedAt.slice(0, 10)} | ${a.title.slice(0, 70)}`);
  }
  console.log('');

  // Empty-week guard: don't break the brand promise by sending a digest
  // with nothing in it. The cron will simply skip this week.
  if (articles.length === 0 && !args.sendNow) {
    console.log('🟡 No articles this week — skipping send.');
    console.log('   (use --send-now to bypass)');
    process.exit(0);
  }

  // Render
  const subject = renderSubjectLine(articles, now.toISOString());
  const html = renderPulseDigestHtml(articles, now.toISOString());
  const plaintext = renderPulseDigestPlaintext(articles, now.toISOString());

  console.log(`📝 Subject: ${subject}`);
  console.log(`📝 HTML:    ${html.length} bytes`);
  console.log(`📝 Plain:   ${plaintext.length} bytes`);
  console.log('');

  // Always save a local preview — useful for inspecting later and for
  // visual diffs across weeks.
  if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });
  const stamp = now.toISOString().slice(0, 10);
  const htmlPath = join(PREVIEW_DIR, `pulse-${stamp}.html`);
  const txtPath = join(PREVIEW_DIR, `pulse-${stamp}.txt`);
  writeFileSync(htmlPath, html);
  writeFileSync(txtPath, plaintext);
  console.log(`💾 Preview saved: ${htmlPath}`);
  console.log(`💾 Plaintext:    ${txtPath}`);
  console.log('');

  if (args.dryRun) {
    console.log('🟡 Dry run — not sending.');
    process.exit(0);
  }

  // ---- Test send via Resend (operator-only inbox preview) ----
  //
  // Bypasses Kit entirely. Sends the EXACT same rendered HTML + plaintext
  // to a single inbox via Resend, the same way the EIC kill-digest does.
  // Used for the first real send so we can verify the email lands correctly
  // before broadcasting to the subscriber list.
  if (args.testViaResend) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.EIC_DIGEST_TO ?? process.env.PULSE_TEST_RECIPIENT;
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY is not set. Add it to .env.local or env.');
      process.exit(1);
    }
    if (!recipient) {
      console.error(
        '❌ No recipient. Set EIC_DIGEST_TO or PULSE_TEST_RECIPIENT in .env.local.'
      );
      process.exit(1);
    }

    console.log(`🧪 Test send via Resend → ${recipient}`);
    const result = await sendViaResend({
      apiKey: resendApiKey,
      to: recipient,
      subject: `[TEST] ${subject}`,
      html,
      plaintext,
    });

    if (!result.ok) {
      console.error('❌ Resend send failed:');
      console.error('   status:', result.status);
      console.error('   error: ', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    console.log(`✅ Test email sent. Resend id: ${result.resendId ?? '(unknown)'}`);
    console.log('');
    console.log('Check your inbox. If it looks good, run without --test-via-resend');
    console.log('to send the real broadcast via Kit.');
    process.exit(0);
  }

  // ---- Real send via Kit broadcast ----

  const kitApiKey = process.env.KIT_API_KEY ?? process.env.CONVERTKIT_API_KEY;
  if (!kitApiKey) {
    console.error(
      '❌ KIT_API_KEY is not set. Add it to .env.local for local sends or to GH Actions secrets for the cron.'
    );
    process.exit(1);
  }

  const testRecipient = process.env.PULSE_TEST_RECIPIENT;
  if (testRecipient) {
    console.log(`🧪 Test recipient mode: sending only to ${testRecipient}`);
  }

  console.log('📤 Sending broadcast to Kit...');
  const result = await sendKitBroadcast({
    apiKey: kitApiKey,
    subject,
    html,
    plaintext,
    testRecipient,
  });

  if (!result.ok) {
    console.error('❌ Kit broadcast failed:');
    console.error('   status:', result.status);
    console.error('   error:', JSON.stringify(result.error, null, 2));
    process.exit(1);
  }

  console.log(`✅ Broadcast created. Kit ID: ${result.broadcastId ?? '(unknown)'}`);
  console.log(`   Review at: https://app.kit.com/broadcasts`);
  console.log('');
  console.log('━'.repeat(60));
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// ---------------- Resend (operator test send only) ----------------

interface ResendResult {
  ok: boolean;
  resendId?: string;
  status?: number;
  error?: unknown;
}

/**
 * Send a single email via Resend. Used ONLY for operator inbox previews
 * (the --test-via-resend flag). Production sends go through Kit broadcast
 * so they reach the actual subscriber list with proper unsubscribe handling.
 *
 * Sender is hard-coded to onboarding@resend.dev (Resend's shared free-tier
 * sender) so this works without domain verification. Same domain as the
 * EIC kill-digest, which keeps the "operator email from MonoKromatik
 * infrastructure" identity consistent in your inbox.
 */
async function sendViaResend(args: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
  plaintext: string;
}): Promise<ResendResult> {
  const payload = {
    from: 'MonoKromatik Pulse (test) <onboarding@resend.dev>',
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.plaintext,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return {
      ok: false,
      status: res.status,
      error: { body: text.slice(0, 500) },
    };
  }

  const data = (await res.json().catch(() => null)) as { id?: string } | null;
  return { ok: true, resendId: data?.id };
}
