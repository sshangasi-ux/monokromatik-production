/**
 * MonoKromatik Sunday Pulse Digest — Email renderer (single-story, inbox-first)
 *
 * Renders the weekly Sunday email as HTML + plaintext for delivery through Kit.
 *
 * Design decisions (this file is the editorial + deliverability brief):
 *
 *   Format:         SINGLE-STORY, TEXT-FORWARD. One lead story gets the space;
 *                   the rest of the week is a compact text list underneath. No
 *                   hero photos, no image header, one primary link.
 *
 *   Why:            The old multi-story, image-heavy digest was landing in
 *                   Gmail's Promotions tab (0% opens) — many links + many images
 *                   is exactly the pattern Gmail promotes-filters. A single,
 *                   opinionated, mostly-text email reads like a person wrote it
 *                   and lands in Primary far more often. It also mirrors what
 *                   demonstrably works for us on LinkedIn: one sharp take.
 *
 *   Cadence:        Sunday 06:00 UTC = 08:00 SAST. Every week.
 *
 *   Visual ID:      Restrained. A text wordmark (MONO·KROMATIK, amber accent),
 *                   a serif headline (DM Serif Display, Georgia fallback), body
 *                   in a system sans. Minimal — the words are the value.
 *
 *   Empty case:     If 0 articles published last week, the email is NOT sent
 *                   (the orchestrator guards this).
 *
 * Exports (interface unchanged — the orchestrator calls these):
 *   - renderPulseDigestHtml(articles, periodEndingISO) => string
 *   - renderPulseDigestPlaintext(articles, periodEndingISO) => string
 *   - renderSubjectLine(articles, periodEndingISO) => string
 */

import type { Article } from './articles';

const SITE_URL = 'https://www.monokromatik.com';
const BRAND_NAME = 'MonoKromatik';
const STUDIO_ADDRESS = 'Atholl, Johannesburg &middot; De Waterkant, Cape Town &middot; South Africa';

// ---------------- helpers ----------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}
function articleUrl(a: Article): string {
  return `${SITE_URL}/article/${a.slug}`;
}
/** The lead is the first article of the week; the rest trail as a text list. */
function splitLead(articles: Article[]): { lead: Article; rest: Article[] } {
  return { lead: articles[0], rest: articles.slice(1) };
}

// ---------------- Subject line ----------------

/**
 * Single-topic subject = the lead story's own title. Deliberately NOT
 * "The Pulse · N stories" — the story-count digest subject is a Promotions
 * signal and buries the hook. One clear headline reads like real mail.
 */
export function renderSubjectLine(articles: Article[], _periodEndingISO: string): string {
  const lead = articles[0];
  if (!lead) return `${BRAND_NAME} — this week`;
  return lead.title;
}

// ---------------- HTML email ----------------

/**
 * Text-forward single-story HTML. Email-HTML constraints still apply: tables
 * for layout, inline styles only, max width 600px, no <script>. But we lean
 * hard on text + one link and drop hero images to stay out of Promotions.
 */
export function renderPulseDigestHtml(articles: Article[], periodEndingISO: string): string {
  const date = new Date(periodEndingISO);
  const longDate = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
  });
  const { lead, rest } = splitLead(articles);
  const category = (lead.category || 'Culture').toUpperCase();
  const url = articleUrl(lead);

  const restBlock = rest.length
    ? `
        <tr><td style="padding: 4px 0 10px;">
          <p style="margin: 0 0 10px; font-family: 'Space Grotesk', Arial, sans-serif; font-size: 11px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase;">Also this week</p>
          ${rest
            .slice(0, 5)
            .map(
              (a) =>
                `<p style="margin: 0 0 9px; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.4;"><a href="${escapeAttr(
                  articleUrl(a)
                )}" style="color: #1a1a1a; text-decoration: none;">${escapeHtml(a.title)}</a> <span style="color:#b45309;">&rarr;</span></p>`
            )
            .join('\n')}
        </td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(lead.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr><td align="center" style="padding: 24px 16px 40px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="pulse-container" style="width: 600px; max-width: 600px;">
        <!-- wordmark -->
        <tr><td style="padding: 0 0 6px;">
          <span style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; color: #1a1a1a;">MONO<span style="color: #CC5500;">KROMATIK</span></span>
        </td></tr>
        <tr><td style="border-bottom: 1px solid #e5e7eb; padding-bottom: 14px;">
          <span style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #9ca3af; text-transform: uppercase;">The Sunday read &middot; ${escapeHtml(longDate)}</span>
        </td></tr>

        <!-- lead story -->
        <tr><td style="padding: 24px 0 4px;">
          <p style="margin: 0 0 8px; font-family: 'Space Grotesk', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #CC5500; text-transform: uppercase;">${escapeHtml(category)}</p>
          <h1 style="margin: 0 0 14px; font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif; font-size: 30px; line-height: 1.15; color: #141210; font-weight: 400;">
            <a href="${escapeAttr(url)}" style="color: #141210; text-decoration: none;">${escapeHtml(lead.title)}</a>
          </h1>
          <p style="margin: 0 0 20px; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; line-height: 1.55; color: #33322f;">${escapeHtml(lead.excerpt || '')}</p>
          <p style="margin: 0 0 8px;">
            <a href="${escapeAttr(url)}" style="font-family: 'Space Grotesk', Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.3px; color: #CC5500; text-decoration: none;">Read the full piece &rarr;</a>
          </p>
        </td></tr>

        <tr><td style="padding: 22px 0 0; border-top: 1px solid #e5e7eb;"></td></tr>
${restBlock}

        <!-- footer -->
        <tr><td style="padding: 26px 0 0; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 6px; font-family: 'Space Grotesk', Arial, sans-serif; font-size: 12px; color: #6b7280;">
            <a href="${SITE_URL}" style="color: #6b7280; text-decoration: none;"><strong style="color:#1a1a1a;">MonoKromatik</strong></a> &mdash; African &amp; diaspora brand intelligence.
          </p>
          <p style="margin: 0; font-family: 'Space Grotesk', Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #9ca3af;">${STUDIO_ADDRESS}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------- Plaintext fallback ----------------

export function renderPulseDigestPlaintext(articles: Article[], periodEndingISO: string): string {
  const date = new Date(periodEndingISO);
  const longDate = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Johannesburg',
  });
  const { lead, rest } = splitLead(articles);
  const lines: string[] = [];
  lines.push(`MONOKROMATIK — The Sunday read · ${longDate}`);
  lines.push('');
  lines.push((lead.category || 'CULTURE').toUpperCase());
  lines.push(lead.title);
  lines.push('');
  if (lead.excerpt) { lines.push(lead.excerpt); lines.push(''); }
  lines.push(`Read the full piece: ${articleUrl(lead)}`);
  if (rest.length) {
    lines.push('');
    lines.push('— Also this week —');
    for (const a of rest.slice(0, 5)) lines.push(`• ${a.title}\n  ${articleUrl(a)}`);
  }
  lines.push('');
  lines.push('MonoKromatik — African & diaspora brand intelligence.');
  lines.push('Atholl, Johannesburg · De Waterkant, Cape Town · South Africa');
  return lines.join('\n');
}
