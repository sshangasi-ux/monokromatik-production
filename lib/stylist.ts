/**
 * MonoKromatik Stylist Agent
 *
 * Takes a draft article (from the Writer agent OR an existing published
 * article) and rewrites it in the MonoKromatik voice — the four signatures
 * (Reframe, Capital-language, Variation-as-percussion, POV-modulation) plus
 * the eight locked forbidden rules.
 *
 * The voice profile is loaded from lib/voice-profile.md and used as the
 * cached system prompt — so the cost per article is dominated by the draft
 * tokens, not the (very long) profile.
 *
 * Returns a structured rewrite that keeps the article's facts and structure
 * but rewrites the prose, headlines, excerpts, and pull quotes through the
 * voice.
 *
 * Cost note: Anthropic's prompt caching cuts repeated system-prompt costs
 * by ~90%. With voice-profile.md at ~5k tokens, this means the first call
 * pays full freight, every subsequent call (within the 5-minute cache TTL)
 * pays ~10% on the cached portion. Across a batch of 12 articles, total
 * cost should be ~$0.50.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..');
const VOICE_PROFILE_PATH = join(REPO_ROOT, 'lib/voice-profile.md');

// Lazy-load the voice profile once, cache in module scope.
let _voiceProfile: string | null = null;
function getVoiceProfile(): string {
  if (_voiceProfile === null) {
    _voiceProfile = readFileSync(VOICE_PROFILE_PATH, 'utf-8');
  }
  return _voiceProfile;
}

export interface DraftArticle {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  /** Optional: source URL the draft was derived from, for context */
  sourceLink?: string;
  sourceName?: string;
}

export interface StylizedArticle extends DraftArticle {
  /** Original draft preserved for diffing / archive */
  _original?: DraftArticle;
  /** What the Stylist changed and why — short editorial note */
  stylistNote?: string;
}

interface StylistResponse {
  title: string;
  excerpt: string;
  content: string;
  stylistNote: string;
}

/**
 * Rewrite a single draft article through the voice profile.
 */
export async function stylizeArticle(
  draft: DraftArticle,
  client?: Anthropic
): Promise<StylizedArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Cannot run Stylist.');
  }

  const ai = client ?? new Anthropic({ apiKey });
  const voiceProfile = getVoiceProfile();

  // Build the system prompt with prompt caching enabled.
  const systemBlocks = [
    {
      type: 'text' as const,
      text: voiceProfile,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: STYLIST_INSTRUCTIONS,
    },
  ];

  const userMessage = formatDraftForStylist(draft);

  const response = await ai.messages.create({
    model: MODELS.editorial,
    max_tokens: 4096,
    system: systemBlocks,
    messages: [
      { role: 'user', content: userMessage },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Stylist returned no text content');
  }

  const parsed = parseStylistResponse(textBlock.text);

  return {
    ...draft,
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    stylistNote: parsed.stylistNote,
    _original: draft,
  };
}

/**
 * Run the Stylist over a batch of drafts in parallel.
 * Concurrency is capped at 3 to stay polite to the Anthropic API.
 */
export async function stylizeBatch(
  drafts: DraftArticle[],
  options: { concurrency?: number; onProgress?: (done: number, total: number, latest: StylizedArticle) => void } = {}
): Promise<StylizedArticle[]> {
  const concurrency = options.concurrency ?? 3;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const results: StylizedArticle[] = new Array(drafts.length);
  let completed = 0;

  const queue = drafts.map((d, i) => ({ draft: d, index: i }));
  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      try {
        const stylized = await stylizeArticle(item.draft, client);
        results[item.index] = stylized;
        completed++;
        options.onProgress?.(completed, drafts.length, stylized);
      } catch (err) {
        results[item.index] = {
          ...item.draft,
          _original: item.draft,
          stylistNote: `STYLIST FAILED: ${err instanceof Error ? err.message : String(err)}`,
        };
        completed++;
        options.onProgress?.(completed, drafts.length, results[item.index]);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, drafts.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ---------- Internal helpers ----------

const STYLIST_INSTRUCTIONS = `
You are the MonoKromatik Stylist agent.

Your job: take the draft article below and rewrite it in the MonoKromatik
voice (the full profile is in your system prompt above). Keep the article's
facts, sources, and structural arc. Rewrite the prose, the headline, the
excerpt, and the closing line.

Specifically:

1. Open with a reframe in the first or second sentence — a line that
   corrects an assumption the reader walked in with.
2. Vary sentence length deliberately. Long sentences when explaining; short
   sentences when landing the point. The cadence is the percussion.
3. Pick the right POV for the piece (I / we / you / 3rd person). Don't
   default; choose on purpose. Most pieces will sit between 1st-plural "we"
   and 3rd-person observational. Reserve "I" for signed founder essays only.
4. Use specific nouns. Not "the township" — Soweto. Not "an artist" — the
   21-year-old from Tembisa. Specificity is taste.
5. End on a line that could be a tattoo. Not a summary. A landing.
6. Strip every forbidden phrase: "Africa is rising," "despite the challenges,"
   "it is important to note that," "arguably," "perhaps," "in many ways,"
   "more than ever," exclamation marks, emoji in body, "BBC won't tell you"
   inside the article body, and "African" as a stand-in for nation/region.

Output strict JSON, no preamble, no commentary, no markdown fences. Schema:

{
  "title": "string — the rewritten headline (specific noun + verb + stake)",
  "excerpt": "string — 1-2 sentence rewritten excerpt with reframe energy",
  "content": "string — the full rewritten article body in markdown",
  "stylistNote": "string — 1-2 sentences describing what you changed and why"
}

Do not wrap the JSON in markdown fences. Do not include any text outside the JSON.
Escape all double-quotes inside string values with backslash-quote.
`.trim();

function formatDraftForStylist(draft: DraftArticle): string {
  return [
    `Here is the draft article to rewrite. Apply the MonoKromatik voice.`,
    ``,
    `--- DRAFT ---`,
    `Category: ${draft.category}`,
    draft.tags?.length ? `Tags: ${draft.tags.join(', ')}` : null,
    draft.sourceName ? `Source: ${draft.sourceName} (${draft.sourceLink ?? 'no link'})` : null,
    ``,
    `Title: ${draft.title}`,
    ``,
    `Excerpt: ${draft.excerpt}`,
    ``,
    `Body:`,
    draft.content,
    `--- END DRAFT ---`,
  ].filter(Boolean).join('\n');
}

function parseStylistResponse(text: string): StylistResponse {
  let jsonText = text.trim();

  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }

  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Stylist response did not contain a JSON object: ${text.slice(0, 200)}`);
  }
  jsonText = jsonText.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    const lenient = lenientParseStylistJson(jsonText);
    if (lenient) {
      parsed = lenient;
    } else {
      throw new Error(
        `Stylist response was not valid JSON and lenient parse also failed. ` +
        `First 300 chars: ${jsonText.slice(0, 300)}`
      );
    }
  }

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== 'string' || typeof obj.excerpt !== 'string' || typeof obj.content !== 'string') {
    throw new Error(`Stylist response missing required fields. Got: ${JSON.stringify(Object.keys(obj))}`);
  }

  return {
    title: obj.title,
    excerpt: obj.excerpt,
    content: obj.content,
    stylistNote: typeof obj.stylistNote === 'string' ? obj.stylistNote : '',
  };
}

/**
 * Lenient parser for the case where Claude returns near-valid JSON with
 * unescaped quotes inside string fields. Extracts each known field by
 * walking from "key": " to the next ", "next_key": " or final "}.
 */
function lenientParseStylistJson(text: string): {
  title?: string;
  excerpt?: string;
  content?: string;
  stylistNote?: string;
} | null {
  const fields = ['title', 'excerpt', 'content', 'stylistNote'] as const;
  const out: Record<string, string> = {};
  for (const key of fields) {
    const startMatch = new RegExp(`"${key}"\\s*:\\s*"`).exec(text);
    if (!startMatch) continue;
    const valueStart = startMatch.index + startMatch[0].length;

    const remaining = text.slice(valueStart);
    const nextKeys = fields.filter((k) => k !== key);
    const nextKeysAlt = nextKeys.join('|');
    const re = new RegExp(`"\\s*(?:,\\s*"(?:${nextKeysAlt})"\\s*:|}\\s*$)`, 'm');
    const endMatch = re.exec(remaining);
    if (!endMatch) continue;
    const valueEnd = valueStart + endMatch.index;

    let value = text.slice(valueStart, valueEnd);
    value = value
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    out[key] = value;
  }
  if (out.title && out.excerpt && out.content) {
    return out;
  }
  return null;
}
