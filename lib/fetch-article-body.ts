/**
 * MonoKromatik Article Body Fetcher
 *
 * Fetches the full article body from a source URL and extracts the main
 * text content. Used by the Writer agent to draft from real article context
 * instead of just the 200-word RSS excerpt.
 *
 * Why this exists:
 *
 *   Before this module, the Writer drafted articles from whatever the RSS
 *   feed gave us — often just a title + 50-200 word teaser. Publishers
 *   like BellaNaija include nearly the full article in <content:encoded>,
 *   but Complete Sports, NotJustOk, and SA Hip Hop Mag publish very short
 *   RSS items.
 *
 *   With only a short snippet, the Writer hallucinates context to hit the
 *   1000-1200 word target. The EIC catches the fabrication during review
 *   and kills the article. Result: the catalog skewed 100% to BellaNaija
 *   over the first 10 articles, despite the Curator picking diverse sources.
 *
 *   Evidence from the May 17 archive audit:
 *     - 35 articles killed by EIC over the catalog's first 2 weeks
 *     - 14 of 35 from Complete Sports (sports articles with wrong facts:
 *       Awoniyi venue, Osimhen titles, Carrick role, Slot/Sesko, etc.)
 *     - 6 of 35 from NotJustOk
 *     - The pattern: short-RSS sources consistently fail factual_coherence
 *
 *   This module gives the Writer the same context BellaNaija RSS already
 *   provides, but for every source.
 *
 * Strategy:
 *
 *   1. Fetch the source URL with a 10s timeout (same pattern as Scout).
 *   2. Parse the HTML, find the main <article> or content block.
 *   3. Strip out nav, footer, ads, comments, related-stories blocks.
 *   4. Extract paragraph text (<p> tags primarily).
 *   5. Cap output at ~6000 chars (~1500 words) — enough for context, not
 *      so much that we blow the Writer's prompt budget.
 *
 * Fail-open:
 *
 *   If fetch fails, scraper finds no content, or page returns weird HTML,
 *   we return null. The Writer then falls back to the original RSS excerpt
 *   as before. We never block the pipeline on body fetching.
 */

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_CHARS = 6_000; // ~1500 words; plenty of context for Writer

/**
 * Fetch the body text of an article from its source URL.
 * Returns null if anything fails — the Writer will fall back to RSS excerpt.
 */
export async function fetchArticleBody(url: string): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;

  try {
    const html = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!html) return null;

    const body = extractMainText(html);
    if (!body || body.length < 200) return null; // Too short to be useful

    return body.slice(0, MAX_BODY_CHARS);
  } catch {
    // Fail-open — Writer will use RSS excerpt
    return null;
  }
}

// ----------- HTTP fetch with timeout -----------

async function fetchWithTimeout(url: string, ms: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Many sites block default Node fetch UA. Pretend to be a browser.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('html')) return null;

    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ----------- Main-content extraction -----------

/**
 * Best-effort main-text extraction.
 *
 * Approach (in priority order):
 *   1. If <article> tag exists, use its content.
 *   2. If <main> tag exists, use its content.
 *   3. If a <div class="entry-content"> or "post-content" exists, use it.
 *   4. Otherwise, fall back to all <p> tags on the page minus obvious junk.
 *
 * After picking the container, we strip everything that isn't likely
 * narrative text: scripts, styles, nav, footer, ads, social embeds,
 * "related stories" blocks, comments, etc.
 */
function extractMainText(html: string): string {
  // Step 1: pick the container
  let container = pickContainer(html);

  // Step 2: aggressively strip non-content blocks
  container = stripJunk(container);

  // Step 3: extract paragraphs
  const paragraphs = extractParagraphs(container);

  return paragraphs.join('\n\n').trim();
}

function pickContainer(html: string): string {
  // <article>...</article>
  const articleMatch = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html);
  if (articleMatch && articleMatch[1].length > 500) return articleMatch[1];

  // <main>...</main>
  const mainMatch = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  if (mainMatch && mainMatch[1].length > 500) return mainMatch[1];

  // <div class="...entry-content..."> ... typical WordPress
  const wpMatch =
    /<div[^>]*class="[^"]*(?:entry-content|post-content|article-content|article-body|post-body|story-body|main-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(
      html
    );
  if (wpMatch && wpMatch[1].length > 500) return wpMatch[1];

  // Fallback to the whole HTML — extractParagraphs + stripJunk will filter
  return html;
}

function stripJunk(html: string): string {
  // Remove dangerous / irrelevant blocks entirely, then their tags.
  const REMOVE_BLOCKS = [
    /<script\b[\s\S]*?<\/script>/gi,
    /<style\b[\s\S]*?<\/style>/gi,
    /<noscript\b[\s\S]*?<\/noscript>/gi,
    /<nav\b[\s\S]*?<\/nav>/gi,
    /<header\b[\s\S]*?<\/header>/gi,
    /<footer\b[\s\S]*?<\/footer>/gi,
    /<aside\b[\s\S]*?<\/aside>/gi,
    /<form\b[\s\S]*?<\/form>/gi,
    /<iframe\b[\s\S]*?<\/iframe>/gi,
    /<figure\b[\s\S]*?<\/figure>/gi, // captions are noise here
    // Common ad / share / related-stories containers
    /<div[^>]*class="[^"]*(?:related|share|social|comments?|sidebar|advert|widget|popup|newsletter|signup|subscribe|prev-next|tags?|author-box)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    /<section[^>]*class="[^"]*(?:related|share|comments?|sidebar|advert|widget)[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
    // HTML comments
    /<!--[\s\S]*?-->/g,
  ];
  let cleaned = html;
  for (const re of REMOVE_BLOCKS) {
    cleaned = cleaned.replace(re, '');
  }
  return cleaned;
}

function extractParagraphs(html: string): string[] {
  const paragraphs: string[] = [];

  // Pull every <p>...</p> block
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pRegex.exec(html)) !== null) {
    const text = stripTagsAndDecode(match[1]).trim();

    // Filter junk paragraphs
    if (!text) continue;
    if (text.length < 40) continue; // Too short — likely a label or caption
    if (looksLikeJunk(text)) continue;

    paragraphs.push(text);
  }

  // Also include the first few <h2>/<h3> headings if they look like
  // article subheaders (helps Writer understand structure).
  const hRegex = /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi;
  const headings: string[] = [];
  while ((match = hRegex.exec(html)) !== null) {
    const text = stripTagsAndDecode(match[1]).trim();
    if (text && text.length > 5 && text.length < 200 && !looksLikeJunk(text)) {
      headings.push(`## ${text}`);
    }
  }
  // Interleave headings sparingly — they appear before nearby paragraphs.
  // For simplicity we don't reflow; we just prepend the first heading if
  // any exists, since most articles have a clear lead paragraph already.
  if (headings.length > 0 && paragraphs.length > 0) {
    paragraphs.unshift(headings[0]);
  }

  return paragraphs;
}

function stripTagsAndDecode(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '') // strip all remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeJunk(text: string): boolean {
  // Common junk strings publishers sprinkle through their pages
  const lower = text.toLowerCase();
  const JUNK = [
    'cookie policy',
    'privacy policy',
    'subscribe to our newsletter',
    'sign up for our newsletter',
    'follow us on',
    'share this',
    'click here to',
    'read more:',
    'image source:',
    'photo:',
    'copyright',
    'all rights reserved',
    'advertisement',
  ];
  if (JUNK.some((j) => lower.startsWith(j) || lower.includes(j))) return true;
  // All-caps "RELATED STORIES" type headers
  if (/^[A-Z\s:]{8,}$/.test(text)) return true;
  return false;
}
