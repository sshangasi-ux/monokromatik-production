/**
 * MonoKromatik Sunday Pulse Digest — Email renderer
 *
 * Renders the weekly Sunday digest as HTML + plaintext for delivery
 * through Kit (formerly ConvertKit).
 *
 * Design decisions captured here (so this file is the source of truth
 * for the editorial brief, not just the code):
 *
 *   Cadence:        Sunday 06:00 UTC = 08:00 SAST. Every week.
 *                   Matches the homepage promise: "Every Sunday, 8AM SAST."
 *
 *   What's in it:   Excerpts + links. Each article gets a hero photo,
 *                   the EIC-approved title, the EIC-approved excerpt,
 *                   and a CTA link to read on monokromatik.com.
 *
 *   What's NOT:     No "personal note from Sibu." No filler. The week's
 *                   editorial output IS the value. We're a publication,
 *                   not a friend's update.
 *
 *   Visual ID:      Black header with amber accent. Same DM Serif Display
 *                   + Space Grotesk pairing as the EIC kill-digest. The
 *                   two emails feel like they come from the same masthead.
 *
 *   Audience:       Diaspora professionals. Read on phone over coffee.
 *                   So: large headlines, scannable, mobile-first widths.
 *
 *   Empty case:     If 0 articles published last week, the email is NOT
 *                   sent. We don't break the promise of "African stories
 *                   BBC won't tell you" by sending an empty email.
 *
 * Exports:
 *   - renderPulseDigestHtml(articles, periodEndingISO) => string (full HTML email)
 *   - renderPulseDigestPlaintext(articles, periodEndingISO) => string (fallback)
 *   - renderSubjectLine(articles, periodEndingISO) => string
 */

import type { Article } from './articles';
import { getMovers, type Movers } from './index-history';

const SITE_URL = 'https://www.monokromatik.com';
const BRAND_NAME = 'MonoKromatik';

// ---------------- Subject line ----------------

/**
 * Subject line follows the formula:
 *   "The Pulse · {count} stories · {date}"
 *
 * Examples:
 *   "The Pulse · 3 stories · Sun 17 May"
 *   "The Pulse · 1 story · Sun 24 May"
 *
 * Why this format:
 *   - "The Pulse" is the brand handle. Recognition from the homepage CTA.
 *   - Count creates a clear value signal at the inbox preview level.
 *   - Date scopes expectations — readers know this is the weekly digest.
 */
export function renderSubjectLine(articles: Article[], periodEndingISO: string): string {
  const date = new Date(periodEndingISO);
  const day = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Africa/Johannesburg',
  });
  const n = articles.length;
  const noun = n === 1 ? 'story' : 'stories';
  return `The Pulse · ${n} ${noun} · ${day}`;
}

// ---------------- HTML email ----------------

/**
 * Renders the full HTML email. This is intended to be passed directly
 * to Kit's broadcast API as the `content` field.
 *
 * Important: this is email HTML, not web HTML. Constraints:
 *   - Tables for layout (still). Some clients (Outlook 2007+) don't
 *     support flexbox or grid.
 *   - Inline styles only. <style> tags get stripped by Gmail.
 *   - Max width 600px. Caps at the mobile viewport with breathing room.
 *   - No <script>, no <link>. Some clients block both.
 *   - Web fonts via Google Fonts <link> in <head> — works in Apple Mail,
 *     iOS Mail, and most web mail clients. Outlook desktop falls back to
 *     Georgia / Helvetica which is fine.
 */
export function renderPulseDigestHtml(
  articles: Article[],
  periodEndingISO: string
): string {
  const date = new Date(periodEndingISO);
  const longDate = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  });

  const articleBlocks = articles.map(renderArticleBlock).join('\n');
  const indexSection = renderIndexSection(getMovers(3));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>The Pulse — ${escapeHtml(longDate)}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    /* Mobile tweaks — the only place we use a stylesheet, and only for
       progressive enhancement. Inline styles are the source of truth. */
    @media only screen and (max-width: 600px) {
      .pulse-container { width: 100% !important; padding: 16px !important; }
      .pulse-headline { font-size: 32px !important; line-height: 1.1 !important; }
      .pulse-article-title { font-size: 22px !important; }
      .pulse-hero img { width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f4f0; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a;">

  <!-- Preheader text (hidden, but shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(buildPreheader(articles))}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f4f0;">
    <tr>
      <td align="center" style="padding: 24px 12px;">

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="pulse-container" width="600" style="width: 600px; max-width: 600px; background-color: #ffffff; border-left: 4px solid #d97706;">

          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #d97706; text-transform: uppercase;">
                      The Pulse · ${escapeHtml(longDate)}
                    </p>
                    <h1 class="pulse-headline" style="margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 42px; line-height: 1.05; color: #ffffff; letter-spacing: -1px;">
                      MONO<span style="color: #d97706;">KROMATIK</span>
                    </h1>
                    <p style="margin: 10px 0 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                      The African stories BBC won't tell you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead intro -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 15px; line-height: 1.6; color: #4b5563;">
                This week on MonoKromatik: ${articles.length} ${articles.length === 1 ? 'story' : 'stories'} that earned the byline. Curated by AI. Reviewed by AI. Sent to you on Sunday morning because that's when the diaspora gets a moment to breathe.
              </p>
            </td>
          </tr>

          <!-- Articles -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              ${articleBlocks}
            </td>
          </tr>
${indexSection}
          <!-- Footer CTA -->
          <tr>
            <td style="padding: 0 32px 36px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 24px 0 0 0; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      Want more? The full network is just a tap away.
                    </p>
                    <a href="${SITE_URL}" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-decoration: none; padding: 14px 28px; text-transform: uppercase;">
                      Explore the Network →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 6px 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #6b7280; line-height: 1.6;">
                You're getting this because you joined The Pulse. Every Sunday, 8 AM SAST. We don't spam.
              </p>
              <p style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #6b7280; line-height: 1.6;">
                <a href="${SITE_URL}" style="color: #6b7280; text-decoration: underline;">${escapeHtml(BRAND_NAME)}</a>
                · Johannesburg ·
                <a href="{{unsubscribe_url}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Renders a single article block: hero image, category eyebrow, title,
 * excerpt, and "Read the full story →" CTA.
 *
 * Uses table-based layout for email-client compat. The image is full-width
 * on mobile (via the @media rule in <head>) and 540px on desktop.
 */
function renderArticleBlock(article: Article, index: number): string {
  const url = `${SITE_URL}/article/${article.slug}`;
  const category = (article.category || 'Culture').toUpperCase();
  const isFirst = index === 0;

  // First article gets extra emphasis — bigger title, more padding,
  // signal that this is the lede of the week.
  const titleSize = isFirst ? 32 : 24;
  const blockMargin = isFirst ? '0' : '32px 0 0 0';

  // Fallback to a transparent 1x1 if no image. Email clients vary on how
  // they handle 0-byte src, so we always set something.
  const imageUrl = article.imageUrl || `${SITE_URL}/fallback-hero.svg`;

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: ${blockMargin};">
  <tr>
    <td>
      <a href="${escapeAttr(url)}" style="display: block; text-decoration: none;" class="pulse-hero">
        <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(article.title)}" width="540" style="display: block; width: 100%; max-width: 540px; height: auto; border: 0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 0 0 0;">
      <p style="margin: 0 0 8px 0; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #d97706; text-transform: uppercase;">
        ${escapeHtml(category)}
      </p>
      <h2 class="pulse-article-title" style="margin: 0 0 12px 0; font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: ${titleSize}px; line-height: 1.15; color: #0a0a0a; letter-spacing: -0.5px;">
        <a href="${escapeAttr(url)}" style="color: #0a0a0a; text-decoration: none;">${escapeHtml(article.title)}</a>
      </h2>
      <p style="margin: 0 0 16px 0; font-family: 'Space Grotesk', sans-serif; font-size: 15px; line-height: 1.6; color: #4b5563;">
        ${escapeHtml(article.excerpt || '')}
      </p>
      <p style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #d97706; text-transform: uppercase;">
        <a href="${escapeAttr(url)}" style="color: #d97706; text-decoration: none;">
          Read the full story →
        </a>
      </p>
    </td>
  </tr>
</table>`;
}

/**
 * Inbox preview text (hidden in the email body but shown by Gmail / Apple
 * Mail under the subject line). We use it to surface the strongest article
 * of the week — the first one in the list, which is always the most recent.
 */
function buildPreheader(articles: Article[]): string {
  if (articles.length === 0) {
    return "This week on MonoKromatik.";
  }
  if (articles.length === 1) {
    return articles[0].excerpt?.slice(0, 140) ?? articles[0].title;
  }
  return `${articles[0].title} — and ${articles.length - 1} more story${articles.length === 2 ? '' : 's'}.`;
}

// ---------------- Plaintext fallback ----------------

/**
 * Plaintext rendering of the digest. Most modern email clients prefer the
 * HTML version, but a small percentage (Lynx, terminal mail readers, some
 * corporate filters) only see this. Kit requires both for max deliverability.
 *
 * Keep it minimal but voice-true. The pipe characters (·) and section
 * dividers (—) carry the brand's editorial rhythm.
 */
export function renderPulseDigestPlaintext(
  articles: Article[],
  periodEndingISO: string
): string {
  const date = new Date(periodEndingISO);
  const longDate = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  });

  const lines: string[] = [];

  lines.push(`MONOKROMATIK · The Pulse · ${longDate}`);
  lines.push('The African stories BBC won\'t tell you.');
  lines.push('');
  lines.push('—'.repeat(56));
  lines.push('');
  lines.push(
    `This week: ${articles.length} ${articles.length === 1 ? 'story' : 'stories'} that earned the byline.`
  );
  lines.push('');

  articles.forEach((article, i) => {
    lines.push('');
    lines.push(`#${i + 1}  ${(article.category || 'CULTURE').toUpperCase()}`);
    lines.push('');
    lines.push(article.title);
    lines.push('');
    if (article.excerpt) {
      lines.push(article.excerpt);
      lines.push('');
    }
    lines.push(`Read: ${SITE_URL}/article/${article.slug}`);
    lines.push('');
    lines.push('—'.repeat(56));
  });

  for (const l of renderIndexPlaintext(getMovers(3))) lines.push(l);

  lines.push('');
  lines.push(`Want more? ${SITE_URL}`);
  lines.push('');
  lines.push('—');
  lines.push('You\'re getting this because you joined The Pulse.');
  lines.push('Every Sunday, 8 AM SAST. We don\'t spam.');
  lines.push('Unsubscribe: {{unsubscribe_url}}');

  return lines.join('\n');
}

// ---------------- On the Index (the wedge, distributed weekly) ----------------

/** The week's headline Index move for the digest — top climber + any newcomer.
 *  Returns '' when there's nothing to report (fewer than 2 snapshots, or no
 *  movement), so the section simply doesn't render. */
function renderIndexSection(movers: Movers): string {
  const top = movers.climbers[0];
  const newcomer = movers.newcomers[0];
  if (!top && !newcomer) return '';
  const rows: string[] = [];
  if (top) {
    const rank = top.rankDelta > 0 ? ` (▲${top.rankDelta} rank${top.rankDelta > 1 ? 's' : ''})` : '';
    rows.push(
      `<p style="margin:0 0 6px 0; font-family:'Space Grotesk',sans-serif; font-size:15px; line-height:1.5; color:#e5e7eb;"><strong style="color:#ffffff;">${escapeHtml(top.brand)}</strong> climbed <span style="color:#d97706; font-weight:700;">+${top.scoreDelta}</span> to ${top.score}/100${rank}.</p>`,
    );
  }
  if (newcomer) {
    rows.push(
      `<p style="margin:0 0 6px 0; font-family:'Space Grotesk',sans-serif; font-size:15px; line-height:1.5; color:#e5e7eb;">New entry: <strong style="color:#ffffff;">${escapeHtml(newcomer.brand)}</strong> joins the Index at ${newcomer.score}/100.</p>`,
    );
  }
  return `
          <!-- On the Index -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#0a0a0a; padding:24px;">
                    <p style="margin:0 0 10px 0; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; color:#d97706; text-transform:uppercase;">On the Index</p>
                    ${rows.join('\n                    ')}
                    <a href="${SITE_URL}/intelligence/signal-index" style="display:inline-block; margin-top:12px; font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; letter-spacing:1px; color:#d97706; text-decoration:none; text-transform:uppercase;">See the full Index &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderIndexPlaintext(movers: Movers): string[] {
  const top = movers.climbers[0];
  const newcomer = movers.newcomers[0];
  if (!top && !newcomer) return [];
  const lines = ['', 'ON THE INDEX', ''];
  if (top) lines.push(`${top.brand} climbed +${top.scoreDelta} to ${top.score}/100.`);
  if (newcomer) lines.push(`New entry: ${newcomer.brand} joins at ${newcomer.score}/100.`);
  lines.push('');
  lines.push(`The Index: ${SITE_URL}/intelligence/signal-index`);
  lines.push('');
  lines.push('—'.repeat(56));
  return lines;
}

// ---------------- Helpers ----------------

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
