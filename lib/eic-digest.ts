/**
 * MonoKromatik EIC Digest Emailer
 *
 * Sends the daily killed-pitches digest to the operator. Triggered by
 * the agent pipeline whenever EIC kills at least one article. If nothing
 * was killed, no email goes out (no daily noise).
 *
 * Uses Resend (https://resend.com) — free tier: 3,000 emails/month,
 * no payment info required, simple REST API.
 *
 * Env vars required:
 *   RESEND_API_KEY      - secret key from resend.com/api-keys
 *   EIC_DIGEST_TO       - operator's email (where digests land)
 *   EIC_DIGEST_FROM     - verified sender, e.g. "eic@monokromatik.com"
 *                         Default: "MonoKromatik EIC <onboarding@resend.dev>"
 *                         (the resend.dev sender works without domain
 *                          verification, but is recognizable as test mail)
 */

import type { ReviewedArticle } from './editor-in-chief';

interface DigestPayload {
  /** Articles the EIC killed (won't ship) */
  killed: ReviewedArticle[];
  /** Articles the EIC approved (will ship) — listed for context */
  approved: ReviewedArticle[];
  /** ISO timestamp of the run that produced these reviews */
  runAt: string;
}

function fmt(date: string): string {
  // Pretty date for the email subject
  return new Date(date).toLocaleDateString('en-ZA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(payload: DigestPayload): string {
  const { killed, approved, runAt } = payload;
  const total = killed.length + approved.length;

  const killedRows = killed
    .map(
      (a) => `
    <div style="border-left: 4px solid #cc6f3a; padding: 12px 16px; margin: 12px 0; background: #fafafa;">
      <div style="font-family: 'DM Serif Display', Georgia, serif; font-size: 16px; color: #0a0a0a; margin-bottom: 4px;">
        ${escapeHtml(a.title)}
      </div>
      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
        ${escapeHtml(a.category)} · score ${a.review.score}/10 · ${escapeHtml(a.sourceName ?? 'unknown source')}
      </div>
      <div style="font-size: 13px; color: #1a1a1a; margin-bottom: 6px; font-style: italic;">
        Why killed: ${escapeHtml(a.review.killReason ?? a.review.notes)}
      </div>
      <div style="font-size: 11px; color: #999;">
        editorial=${a.review.dimensions.editorial_value} ·
        voice=${a.review.dimensions.voice_integrity} ·
        factual=${a.review.dimensions.factual_coherence} ·
        tone=${a.review.dimensions.tone_fit} ·
        lede=${a.review.dimensions.lede_strength} ·
        length=${a.review.dimensions.length_appropriate}
      </div>
    </div>`
    )
    .join('');

  const approvedRows = approved
    .map(
      (a) => `
    <div style="padding: 8px 16px; margin: 6px 0;">
      <span style="color: #cc6f3a; font-weight: bold;">✓</span>
      <span style="font-size: 14px; color: #0a0a0a;"> ${escapeHtml(a.title)}</span>
      <span style="font-size: 11px; color: #999;"> — ${a.review.score}/10</span>
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>MonoKromatik EIC — Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, 'Helvetica Neue', sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff;">

    <!-- Header -->
    <div style="background: #0a0a0a; padding: 24px 32px; border-left: 14px solid #cc6f3a;">
      <div style="font-family: 'Space Grotesk', sans-serif; letter-spacing: 2px; font-weight: 700;">
        <span style="color: #ffffff; font-size: 22px;">MONO</span><span style="color: #cc6f3a; font-size: 22px;">KROMATIK</span>
      </div>
      <div style="color: #888; font-size: 11px; letter-spacing: 4px; margin-top: 4px;">EDITOR IN CHIEF · ${fmt(runAt)}</div>
    </div>

    <!-- Summary -->
    <div style="padding: 32px 32px 16px 32px;">
      <div style="font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; line-height: 1.2; color: #0a0a0a;">
        ${killed.length} killed · ${approved.length} approved
      </div>
      <div style="color: #666; font-size: 14px; margin-top: 8px;">
        Out of ${total} articles reviewed in today's pipeline run.
      </div>
    </div>

    ${
      killed.length > 0
        ? `
    <!-- Killed pitches -->
    <div style="padding: 16px 32px;">
      <div style="font-family: 'Space Grotesk', sans-serif; letter-spacing: 2px; font-size: 11px; color: #cc6f3a; text-transform: uppercase; margin-bottom: 12px; font-weight: 700;">
        Killed pitches
      </div>
      ${killedRows}
    </div>`
        : ''
    }

    ${
      approved.length > 0
        ? `
    <!-- Approved -->
    <div style="padding: 16px 32px;">
      <div style="font-family: 'Space Grotesk', sans-serif; letter-spacing: 2px; font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">
        Shipped today
      </div>
      ${approvedRows}
    </div>`
        : ''
    }

    <!-- Footer -->
    <div style="padding: 24px 32px; background: #fafafa; border-top: 1px solid #eee; color: #999; font-size: 11px; text-align: center;">
      <div>Generated by MonoKromatik EIC agent · claude-sonnet-4-5</div>
      <div style="margin-top: 4px;">
        <a href="https://www.monokromatik.com" style="color: #cc6f3a; text-decoration: none;">monokromatik.com</a>
      </div>
    </div>

  </div>
</body>
</html>`;
}

function renderPlainText(payload: DigestPayload): string {
  const { killed, approved, runAt } = payload;
  const total = killed.length + approved.length;
  const date = fmt(runAt);

  let text = `MONOKROMATIK EIC — DAILY DIGEST · ${date}\n`;
  text += `${'═'.repeat(60)}\n\n`;
  text += `${killed.length} killed · ${approved.length} approved · ${total} reviewed\n\n`;

  if (killed.length > 0) {
    text += `KILLED PITCHES\n${'─'.repeat(60)}\n\n`;
    for (const a of killed) {
      text += `▸ ${a.title}\n`;
      text += `  ${a.category} · score ${a.review.score}/10 · ${a.sourceName ?? 'unknown'}\n`;
      text += `  Why: ${a.review.killReason ?? a.review.notes}\n`;
      text += `  Dims: ed=${a.review.dimensions.editorial_value} v=${a.review.dimensions.voice_integrity} f=${a.review.dimensions.factual_coherence} t=${a.review.dimensions.tone_fit} l=${a.review.dimensions.lede_strength} ln=${a.review.dimensions.length_appropriate}\n\n`;
    }
  }

  if (approved.length > 0) {
    text += `SHIPPED TODAY\n${'─'.repeat(60)}\n\n`;
    for (const a of approved) {
      text += `✓ ${a.title} (${a.review.score}/10)\n`;
    }
    text += '\n';
  }

  text += `${'═'.repeat(60)}\n`;
  text += `Generated by MonoKromatik EIC agent\n`;
  text += `https://www.monokromatik.com\n`;
  return text;
}

/**
 * Send the EIC digest via Resend.
 * Returns true on success, false on failure (email send is non-blocking).
 */
export async function sendDigest(payload: DigestPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  // All editorial comms land in the editor inbox by default; override per env.
  const to = process.env.EIC_DIGEST_TO || 'editor@monokromatik.com';
  const from =
    process.env.EIC_DIGEST_FROM ??
    'MonoKromatik EIC <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[EIC] RESEND_API_KEY not set — skipping digest email.');
    return false;
  }
  if (!to) {
    console.warn('[EIC] EIC_DIGEST_TO not set — skipping digest email.');
    return false;
  }

  // No-op if there's literally nothing to report
  if (payload.killed.length === 0 && payload.approved.length === 0) {
    console.log('[EIC] No reviews this run — skipping digest email.');
    return true;
  }

  // Skip empty-killed days unless we want a celebratory all-approved email
  // (we do — operator wants to see what passed too)
  const html = renderHtml(payload);
  const text = renderPlainText(payload);
  const subjectDate = fmt(payload.runAt);
  const subject =
    payload.killed.length > 0
      ? `EIC: ${payload.killed.length} killed, ${payload.approved.length} approved · ${subjectDate}`
      : `EIC: All ${payload.approved.length} approved · ${subjectDate}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[EIC] Resend failed (${res.status}): ${body}`);
      return false;
    }
    const data = await res.json();
    console.log(`[EIC] Digest sent → ${to} (resend id: ${data.id})`);
    return true;
  } catch (err) {
    console.error('[EIC] Digest send threw:', err);
    return false;
  }
}
