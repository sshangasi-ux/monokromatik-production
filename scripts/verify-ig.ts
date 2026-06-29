#!/usr/bin/env node
/**
 * Instagram credential verifier — a no-post setup check.
 *
 * Confirms IG_USER_ID + IG_ACCESS_TOKEN actually work BEFORE relying on the daily
 * auto-poster: it resolves the linked Instagram account, reports its handle +
 * stats, and checks the token carries the content-publishing permission. Posts
 * nothing. Run it (locally with .env.local, or via the social-publish workflow's
 * `verify` input) right after setting the secrets.
 *
 *   npm run social:verify
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const GRAPH = 'https://graph.facebook.com/v21.0';
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
const out: string[] = [];
const say = (m: string) => {
  console.log(m);
  out.push(m);
};
function flush() {
  if (summaryFile) {
    try {
      require('fs').appendFileSync(summaryFile, out.join('\n') + '\n');
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  const userId = process.env.IG_USER_ID;
  const token = process.env.IG_ACCESS_TOKEN;

  say('# Instagram connection check');
  if (!userId || !token) {
    say('\n🔴 **Not configured.** Set both secrets and re-run:');
    say('- `IG_USER_ID` — your Instagram Business/Creator account ID');
    say('- `IG_ACCESS_TOKEN` — a long-lived token with `instagram_content_publish`');
    flush();
    process.exit(1);
  }

  // 1) Resolve the account the token + id point at.
  const fields = 'id,username,name,followers_count,media_count';
  const acctRes = await fetch(`${GRAPH}/${userId}?fields=${fields}&access_token=${encodeURIComponent(token)}`);
  const acct = await acctRes.json();
  if (!acctRes.ok || !acct.id) {
    const err = acct.error || acct;
    say(`\n🔴 **Could not resolve the account** (HTTP ${acctRes.status}).`);
    say('```json');
    say(JSON.stringify(err, null, 2));
    say('```');
    if (err?.code === 190) say('→ Token is invalid or expired. Generate a fresh long-lived token.');
    if (err?.code === 100) say('→ Check IG_USER_ID is the *Instagram* business account ID (not the Page ID).');
    flush();
    process.exit(1);
  }
  say(`\n✅ Connected to **@${acct.username}** (${acct.name ?? 'no name'})`);
  say(`- Followers: ${acct.followers_count ?? '—'} · Posts: ${acct.media_count ?? '—'}`);
  say(`- Account ID: \`${acct.id}\``);

  // 2) Best-effort permission/scope check (works for user tokens; page tokens may
  //    not expose /permissions — absence here is not proof of missing scope).
  let canPublish: boolean | null = null;
  try {
    const permRes = await fetch(`${GRAPH}/me/permissions?access_token=${encodeURIComponent(token)}`);
    const perm = await permRes.json();
    if (permRes.ok && Array.isArray(perm.data)) {
      const granted = new Set(perm.data.filter((p: { status: string }) => p.status === 'granted').map((p: { permission: string }) => p.permission));
      canPublish = granted.has('instagram_content_publish');
      const need = ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'];
      say(`\nPermissions granted: ${[...granted].join(', ') || '(none reported)'}`);
      const missing = need.filter((p) => !granted.has(p));
      if (missing.length) say(`⚠️ Not reported as granted: ${missing.join(', ')} (add these scopes when generating the token).`);
    }
  } catch {
    /* permissions endpoint not available for this token type */
  }

  // 3) Token longevity hint.
  try {
    const dbgRes = await fetch(`${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`);
    const dbg = await dbgRes.json();
    const exp = dbg?.data?.expires_at;
    if (exp === 0) say(`\nToken type: **long-lived / non-expiring** ✅`);
    else if (typeof exp === 'number') {
      const days = Math.round((exp * 1000 - Date.now()) / 86_400_000);
      say(`\nToken expires in ~**${days} day(s)**.${days < 14 ? ' ⚠️ Exchange it for a long-lived token.' : ''}`);
    }
  } catch {
    /* debug_token may require an app token; skip */
  }

  if (canPublish === false) {
    say('\n🔴 The token does **not** report `instagram_content_publish` — posting will fail. Regenerate with that scope.');
    flush();
    process.exit(1);
  }
  say('\n**Ready to publish.** Dispatch the social workflow with `publish=true` to send the next post, or set `SOCIAL_AUTOPOST=on` for daily auto-posting.');
  flush();
}

main().catch((err) => {
  console.error('verify-ig crashed:', err);
  process.exit(1);
});
