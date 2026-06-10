// MonoKromatik AI Article Generation
// Uses Claude API to generate full articles from curated stories

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { Story } from './rss-feeds';
import { fetchArticleBody } from './fetch-article-body';

export interface GeneratedArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  videoUrl?: string;
  videoCredit?: string;
  videoSourceUrl?: string;
  sourceLink: string;
  sourceName: string;
  publishedAt: string;
}

/**
 * Get Anthropic client (lazy initialization to ensure env vars are loaded)
 */
function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Generate a full article from a curated story
 */
export async function generateArticle(story: Story): Promise<GeneratedArticle> {
  console.log(`\n✍️  Generating article: "${story.title}"\n`);

  // Fetch the full source article body for context. Critical for sources
  // (Complete Sports, NotJustOk, etc.) whose RSS only ships a short snippet.
  // BellaNaija's RSS already includes near-full content but the explicit
  // fetch normalizes the input across all sources.
  //
  // If fetch fails (404, timeout, no <article> tag, etc.) we fall through
  // with sourceBody = '' and the prompt uses the RSS excerpt alone, which
  // is the pre-2026-05-17 behavior.
  let sourceBody = '';
  try {
    const body = await fetchArticleBody(story.link);
    if (body) {
      sourceBody = body;
      console.log(`   📖 Fetched source body: ${body.length} chars / ${body.split(/\s+/).length} words`);
    } else {
      console.log(`   ⚠️  Source body not available — falling back to RSS excerpt only`);
    }
  } catch (err) {
    console.log(`   ⚠️  Source fetch threw — falling back to RSS excerpt: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  const prompt = `You are the lead writer for MonoKromatik Network - an AI-powered African culture/sports/entertainment platform serving 1.4 billion Africans + diaspora worldwide.

YOUR MISSION: Transform this story into a publication-quality article that makes diaspora readers feel connected to home.

STORY DATA:
TITLE: ${story.title}
SOURCE: ${story.source}
CATEGORY: ${story.category}
EXCERPT: ${story.excerpt}
LINK: ${story.link}
HAS IMAGE: ${story.imageUrl ? 'YES' : 'NO'}
HAS VIDEO: ${story.videoUrl ? 'YES' : 'NO'}
${
    sourceBody
      ? `
FULL SOURCE ARTICLE (extracted from the original publisher's page):
"""
${sourceBody}
"""

IMPORTANT: Use the FULL SOURCE ARTICLE above as your factual ground truth. The names, dates, scores, quotes, and specific details in the source are real and must be preserved accurately. Do NOT invent details, opponents, venues, scores, or quotes that aren't in the source. Your job is to RE-ANGLE this factual material for the diaspora audience in MonoKromatik's voice — not to fabricate context that isn't there.
`
      : `
NOTE: The full source article could not be fetched. Work from the title + excerpt above. Be VERY conservative about specific factual claims (scores, dates, names) since we can't verify them. If you're unsure of a detail, write around it rather than guessing.
`
}

MONOKROMATIK BRAND VOICE (from Strategic Framework):
- **Energetic, not academic**: Short punchy sentences. No jargon. No "furthermore" or "moreover"
- **Insider perspective**: "We" not "they" - you ARE part of the culture, not observing it
- **Celebratory, never pitying**: African excellence, not African struggle
- **Authentic, not corporate**: Real talk. No PR speak. No "stakeholders" or "synergies"
- **Diaspora-first**: Every story answers "Why should someone in London/NYC/Toronto care?"

TARGET AUDIENCE:
- African diaspora in UK, US, Canada missing home
- Ages 18-45, culturally connected, digitally native
- Want authentic stories BBC/CNN don't tell
- Scroll on phones during commute/lunch break

ARTICLE LENGTH: 1000-1200 words (LONGER than typical blog posts)

STRUCTURE:

**HOOK (50-75 words)**
Open with energy. Make them STOP scrolling. Use:
- Unexpected detail
- Provocative question
- Bold statement
- "You know that feeling when..."

**CONTEXT (200-300 words)**
What happened? But make it VIVID:
- Specific details (not "recently" - use actual dates)
- Names, places, numbers
- What people said (quotes if available)
- Sensory details (what it looked/sounded/felt like)

**WHY IT MATTERS - DIASPORA ANGLE (400-500 words)**
This is THE CORE. Connect to diaspora experience:
- Nostalgia: "Remember when we used to..."
- Identity: "This is why we're proud to be..."
- Culture: "Only we understand that..."
- Home connection: "While you're in [London/NYC], back home..."
- Community: "Group chats are buzzing about..."

Include:
- Personal stakes (how this affects real people)
- Cultural context (explain insider references for diaspora who might not know)
- Bigger picture (what this says about African culture/progress)

**WHAT'S NEXT (150-200 words)**
Forward momentum:
- What happens next in this story?
- How can diaspora engage? (watch, listen, share, comment)
- What to look out for
- End on optimistic/exciting note

**FINAL FLOURISH (50 words)**
Circle back to opening energy. Leave them feeling:
- Proud to be African
- Connected to home
- Excited to share this story

WRITING RULES:
1. Paragraphs: 2-3 sentences MAX (mobile-friendly)
2. Sentences: Mix short punches with longer flows
3. No clichés: "Africa rising", "vibrant cultures", "rich heritage"
4. Use contractions: "we're", "it's", "that's"
5. Active voice ONLY
6. Specific > Generic: "Lagos" not "Nigeria", "Afrobeats" not "African music"
7. Cultural references: Drop them naturally (explain if needed)
8. Emojis: NONE (let the writing create energy)

FORBIDDEN WORDS/PHRASES:
❌ "stakeholders", "synergies", "ecosystem"
❌ "the African continent" (just say "Africa" or specific countries)
❌ "diasporans" (say "diaspora" or "Africans abroad")
❌ "moreover", "furthermore", "in conclusion"
❌ "journey" (unless literal travel)

EXAMPLES OF TONE:

❌ BAD: "The artist's latest release represents a significant milestone in contemporary African music."
✅ GOOD: "Tyla just dropped a bomb. And the diaspora is here for it."

❌ BAD: "This development showcases the growing influence of African talent."
✅ GOOD: "Another win for the culture. Another reason to turn up the volume."

OUTPUT FORMAT (JSON only, no markdown formatting):
{
  "title": "Punchy headline (8-12 words, make them CLICK)",
  "content": "Full 1000-1200 word article in markdown format with proper headings (## for sections)",
  "excerpt": "2-sentence hook that sells the story (under 200 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] (5 specific, searchable tags)
}`;

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: MODELS.flagship,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Robust against non-text leading blocks (e.g. if adaptive thinking is enabled).
    const textBlock = message.content.find((b) => b.type === 'text');
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    const result = parseWriterResponseSafely(responseText);
    if (!result) {
      throw new Error('Writer response had no parseable article structure');
    }

    // Create slug from title
    const slug = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const article: GeneratedArticle = {
      title: result.title,
      slug,
      content: result.content,
      excerpt: result.excerpt,
      category: story.category,
      tags: result.tags || [],
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      sourceLink: story.link,
      sourceName: story.source,
      publishedAt: new Date().toISOString(),
    };

    console.log(`   ✅ Generated: "${article.title}"`);
    console.log(`   📝 Word count: ${article.content.split(/\s+/).length} words`);
    console.log(`   🏷️  Tags: ${article.tags.join(', ')}\n`);

    return article;
  } catch (error) {
    console.error('❌ Error generating article:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Generate multiple articles in batch
 */
export async function generateArticles(stories: Story[]): Promise<GeneratedArticle[]> {
  console.log(`\n📚 Generating ${stories.length} articles...\n`);

  const articles: GeneratedArticle[] = [];

  for (const story of stories) {
    try {
      const article = await generateArticle(story);
      articles.push(article);

      // Rate limiting (Claude API allows 50 requests/min)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`❌ Failed to generate article for: ${story.title}`);
      continue;
    }
  }

  console.log(`\n✅ Generated ${articles.length} articles successfully!\n`);

  return articles;
}

interface WriterResult {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}

/**
 * Parse the Writer's JSON response with fallback to lenient extraction.
 *
 * The Writer's response is uniquely fragile to JSON.parse() because the
 * `content` field is a 1000-1200 word markdown body that very often
 * contains:
 *   - Quoted dialogue ("They told us...")
 *   - Apostrophes in contractions (we're, it's, that's)
 *   - Asterisks and underscores from markdown emphasis
 *   - Curly quotes from copy-pasted quotes
 *
 * Claude tries to escape these but sometimes misses one, and strict
 * JSON.parse blows up. We saw this on the BNXN/Sarz article in today's
 * local run.
 *
 * Strategy:
 *   1. Try strict JSON.parse on the matched {...} block. Works ~75% of
 *      the time. Cheapest path.
 *   2. If that fails, extract each field with anchored regex. We use
 *      field-name anchors ("title":, "content":, etc) and read until
 *      the next field-name OR closing brace. This is tolerant of any
 *      number of unescaped quotes inside the value.
 *
 * Returns null only if no usable article structure exists.
 */
function parseWriterResponseSafely(responseText: string): WriterResult | null {
  // Find the outermost JSON-like block first
  const start = responseText.indexOf('{');
  const end = responseText.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  const jsonBlock = responseText.slice(start, end + 1);

  // Fast path: strict parse
  try {
    const strict = JSON.parse(jsonBlock);
    if (strict && typeof strict.title === 'string' && typeof strict.content === 'string') {
      return {
        title: strict.title,
        content: strict.content,
        excerpt: strict.excerpt ?? '',
        tags: Array.isArray(strict.tags) ? strict.tags : [],
      };
    }
  } catch {
    console.warn('   ⚠️  Writer JSON had quote-escaping issues. Falling back to lenient parser.');
  }

  // Lenient path: field-anchored extraction. Each field is read from its
  // key opening quote up until the start of the next known field key OR
  // the final closing brace. We treat unescaped quotes inside the value
  // as legitimate content.
  const extractStringField = (key: string): string => {
    // Anchor: "key": "<content>" then either ,\s*"next-key" or }\s*$
    const pattern = new RegExp(
      `"${key}"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,\\s*"(?:title|content|excerpt|tags)"|}\\s*$)`,
      'm'
    );
    const m = pattern.exec(jsonBlock);
    if (!m) return '';
    // Decode JSON-style escape sequences within the captured value
    return m[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t')
      .trim();
  };

  const extractTagsArray = (): string[] => {
    // Tags is an array; pull the contents between [ and ] after "tags":
    const m = /"tags"\s*:\s*\[([\s\S]*?)\]/m.exec(jsonBlock);
    if (!m) return [];
    return [...m[1].matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)]
      .map((tagMatch) => tagMatch[1].replace(/\\"/g, '"').trim())
      .filter(Boolean);
  };

  const title = extractStringField('title');
  const content = extractStringField('content');
  const excerpt = extractStringField('excerpt');
  const tags = extractTagsArray();

  // Need title + content at minimum to publish
  if (!title || !content) return null;

  return { title, content, excerpt, tags };
}
