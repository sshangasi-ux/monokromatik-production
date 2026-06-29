#!/usr/bin/env node
/**
 * LinkedIn credential verifier — a no-post setup check. Confirms
 * LINKEDIN_ACCESS_TOKEN is valid and LINKEDIN_AUTHOR_URN is set, before relying
 * on the auto-poster. Posts nothing.
 *
 *   npm run linkedin:verify
 */

import { readFileSync, existsSync, appendFileSync } from 'fs';
import { join } from 'path';
import { verifyLinkedIn } from '../lib/linkedin';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const out: string[] = [];
const say = (m: string) => { console.log(m); out.push(m); };
function flush() {
  const f = process.env.GITHUB_STEP_SUMMARY;
  if (f) { try { appendFileSync(f, out.join('\n') + '\n'); } catch { /* ignore */ } }
}

async function main() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  say('# LinkedIn connection check');
  if (!token) {
    say('\n🔴 **Not configured.** Set both and re-run:');
    say('- `LINKEDIN_ACCESS_TOKEN` — OAuth token with `w_organization_social` (Page) or `w_member_social`');
    say('- `LINKEDIN_AUTHOR_URN` — e.g. `urn:li:organization:12345678` (your Page) or `urn:li:person:...`');
    flush();
    process.exit(1);
  }

  const r = await verifyLinkedIn(token, authorUrn);
  say(r.ok ? `\n✅ ${r.detail}` : `\n🔴 ${r.detail}`);
  if (r.ok) say('\n**Ready to publish.** Dispatch the LinkedIn workflow with `publish=true`, or set `LINKEDIN_AUTOPOST=on` for daily auto-posting.');
  flush();
  if (!r.ok) process.exit(1);
}

main().catch((err) => { console.error('verify-linkedin crashed:', err); process.exit(1); });
