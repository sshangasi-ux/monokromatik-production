/**
 * MonoKromatik Editor-in-Chief Agent
 *
 * Reviews each finished article (post-Stylist, post-image-source) and either
 * approves it for publication or kills it with a recorded reason. Killed
 * articles never reach the Publisher; instead they're aggregated into the
 * daily killed-pitches digest emailed to the operator.
 *
 * The EIC reviews on six dimensions:
 *
 *   1. editorial_value     — Does this tell the diaspora *why* it matters?
 *   2. voice_integrity     — Does it sound like MonoKromatik (the four
 *                            signatures from voice-profile.md)?
 *   3. factual_coherence   — Does the body deliver what the title promises?
 *   4. tone_fit            — Celebrates excellence vs. cynical / poverty
 *                            porn / wallpaper.
 *   5. lede_strength       — Does the first paragraph earn the click?
 *   6. length_appropriate  — Is this 5-min read or 1-min filler?
 *
 * Each dimension scored 1–10. Overall score = mean. Articles below 6.0 OR
 * failing on factual_coherence (< 7) OR failing on tone_fit (< 6) get
 * killed automatically. Anything else passes.
 *
 * Cost: ~$0.04 per article using sonnet-4.5 with prompt caching.
 *
 * The agent is fail-open: if the API errors out, the article is approved
 * by default rather than killed. Editorial judgement should never be the
 * thing that takes the pipeline down.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..');
const VOICE_PROFILE_PATH = join(REPO_ROOT, 'lib/voice-profile.md');

let _voiceProfile: string | null = null;
function getVoiceProfile(): string {
  if (_voiceProfile === null) {
    _voiceProfile = readFileSync(VOICE_PROFILE_PATH, 'utf-8');
  }
  return _voiceProfile;
}

export interface ArticleForReview {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  sourceLink?: string;
  sourceName?: string;
}

export interface ReviewDimensions {
  editorial_value: number;
  voice_integrity: number;
  factual_coherence: number;
  tone_fit: number;
  lede_strength: number;
  length_appropriate: number;
}

export interface ReviewVerdict {
  /** 'approved' = ship; 'killed' = drop; never published */
  verdict: 'approved' | 'killed';
  /** Mean of dimension scores, 1.00 - 10.00 */
  score: number;
  dimensions: ReviewDimensions;
  /** EIC's editorial reasoning, 1-3 sentences */
  notes: string;
  /** If killed, the headline-style reason ("Lede is filler", "Voice not landing", etc.) */
  killReason?: string;
  /** If approved, the strongest line in the piece (for the digest's "wins" section) */
  bestLine?: string;
  /** ISO timestamp of when this review ran */
  reviewedAt: string;
}

/**
 * A reviewed article: the original article + the EIC's verdict.
 * This is the shape that flows downstream to the Publisher and to the
 * digest emailer. Articles keep all their original fields so the
 * Publisher and the email template can read title / excerpt / sourceName / etc.
 */
export interface ReviewedArticle extends ArticleForReview {
  review: ReviewVerdict;
}

/**
 * Review a single article. Returns the article paired with the EIC's verdict.
 *
 * If the API errors, the article is approved with a noted EIC failure.
 * Editorial review should never block the pipeline.
 */
export async function reviewArticle(
  article: ArticleForReview,
  client?: Anthropic
): Promise<ReviewedArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ...article, review: failOpenVerdict('ANTHROPIC_API_KEY not set') };
  }

  const ai = client ?? new Anthropic({ apiKey });
  const voiceProfile = getVoiceProfile();

  const systemBlocks = [
    {
      type: 'text' as const,
      text: voiceProfile,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: EIC_INSTRUCTIONS,
      cache_control: { type: 'ephemeral' as const },
    },
  ];

  const userMessage = formatArticleForReview(article);

  try {
    const response = await ai.messages.create({
      model: MODELS.flagship,
      max_tokens: 1500,
      system: systemBlocks,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return { ...article, review: failOpenVerdict('EIC returned no text content') };
    }

    const parsed = parseReviewResponse(textBlock.text);
    const verdict: ReviewVerdict = applyKillRules({
      verdict: 'approved', // tentative; applyKillRules decides
      score: parsed.score,
      dimensions: parsed.dimensions,
      notes: parsed.notes,
      killReason: parsed.killReason,
      bestLine: parsed.bestLine,
      reviewedAt: new Date().toISOString(),
    });
    return { ...article, review: verdict };
  } catch (err) {
    return {
      ...article,
      review: failOpenVerdict(
        `EIC API call failed: ${err instanceof Error ? err.message : String(err)}`
      ),
    };
  }
}

/**
 * Review a batch of articles in parallel.
 * Concurrency capped at 3 to be polite to the Anthropic API.
 */
export async function reviewBatch(
  articles: ArticleForReview[],
  options: {
    concurrency?: number;
    onProgress?: (done: number, total: number, latest: ReviewedArticle) => void;
  } = {}
): Promise<ReviewedArticle[]> {
  if (articles.length === 0) return [];

  const concurrency = options.concurrency ?? 3;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fail-open the entire batch
    return articles.map((a) => ({
      ...a,
      review: failOpenVerdict('ANTHROPIC_API_KEY not set'),
    }));
  }

  const client = new Anthropic({ apiKey });
  const results: ReviewedArticle[] = new Array(articles.length);
  let completed = 0;

  const queue = articles.map((a, i) => ({ article: a, index: i }));
  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const reviewed = await reviewArticle(item.article, client);
      results[item.index] = reviewed;
      completed++;
      options.onProgress?.(completed, articles.length, reviewed);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, articles.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------- Internal: kill rules ----------

/**
 * Apply the kill thresholds. The model recommends approve/kill but the
 * actual decision is made here so the rules are version-controlled and
 * unambiguous.
 */
function applyKillRules(v: ReviewVerdict): ReviewVerdict {
  const d = v.dimensions;

  // Hard kill: factual coherence broken
  if (d.factual_coherence < 7) {
    return {
      ...v,
      verdict: 'killed',
      killReason:
        v.killReason ??
        `Factual coherence ${d.factual_coherence}/10 — body doesn't deliver what title promises.`,
    };
  }

  // Hard kill: off-brand (poverty porn / cynical / "Africa rising" energy)
  if (d.tone_fit < 6) {
    return {
      ...v,
      verdict: 'killed',
      killReason: v.killReason ?? `Tone fit ${d.tone_fit}/10 — off-brand for MonoKromatik.`,
    };
  }

  // Soft kill: thin overall
  if (v.score < 6) {
    return {
      ...v,
      verdict: 'killed',
      killReason: v.killReason ?? `Overall score ${v.score.toFixed(1)}/10 — below publishable bar.`,
    };
  }

  // Soft kill: editorial value too low (filler)
  if (d.editorial_value < 5) {
    return {
      ...v,
      verdict: 'killed',
      killReason:
        v.killReason ??
        `Editorial value ${d.editorial_value}/10 — doesn't tell us why this matters.`,
    };
  }

  return { ...v, verdict: 'approved' };
}

/**
 * Fail-open verdict: when the EIC can't reach the model, approve the
 * article and note why. Editorial judgement should never take the
 * pipeline down.
 */
function failOpenVerdict(reason: string): ReviewVerdict {
  return {
    verdict: 'approved',
    score: 7.0,
    dimensions: {
      editorial_value: 7,
      voice_integrity: 7,
      factual_coherence: 7,
      tone_fit: 7,
      lede_strength: 7,
      length_appropriate: 7,
    },
    notes: `[EIC fail-open] ${reason}`,
    reviewedAt: new Date().toISOString(),
  };
}

// ---------- Internal: prompt + parser ----------

const EIC_INSTRUCTIONS = `
You are the MonoKromatik Editor-in-Chief.

Your job: read each article and decide whether it is publication-ready
or whether it should be killed. The voice profile above is the standard
to measure against. Your job is to enforce it, not soften it.

Score the article on six dimensions, each 1-10:

1. editorial_value
   - 10: Tells the reader exactly why this story matters to the diaspora,
     in a frame they couldn't get from BBC/CNN.
   - 5:  Reports the news but doesn't add the diaspora angle.
   - 1:  Pure filler — could have been a tweet.

2. voice_integrity
   - 10: Carries all four MonoKromatik signatures (Reframe, Capital-language,
     Variation-as-percussion, Intentional POV).
   - 5:  Has some voice but reads partially generic.
   - 1:  Generic AI / BBC tone. None of the signatures.

3. factual_coherence
   - 10: Body fully delivers on the title's promise. No claims unsupported
     by sources/context.
   - 7:  Mostly delivers but one claim is thin or one section drifts.
   - 3:  Title overpromises and body underdelivers.
   - 1:  Body contradicts the title or contains obviously wrong claims.

4. tone_fit
   - 10: Celebrates excellence on its own terms. No poverty frame, no
     "Africa rising," no condescension toward the subject.
   - 5:  Tone is neutral; doesn't feel celebratory but isn't off either.
   - 1:  Carries any forbidden frame ("Africa rising," "despite challenges,"
     "in a continent often," etc.) or feels cynical/snarky/defeatist.

5. lede_strength
   - 10: First paragraph contains a reframe and earns the click. Reader
     wants the next paragraph immediately.
   - 5:  Functional opening but doesn't pull the reader in.
   - 1:  Buried lede or generic news-wire intro.

6. length_appropriate
   - 10: Reading time matches the depth of the subject. Not bloated,
     not skeletal.
   - 5:  A bit too long or too short for what's being said.
   - 1:  Wildly mismatched — 200 words on a major story, or 1500 words
     on a minor one.

Then make a recommendation:
- If overall score >= 7 AND every dimension >= 6 AND factual_coherence >= 7,
  the piece is strong. Approve it. Note the strongest line in the article
  (literal quote) for "bestLine".
- If overall score >= 6 but with weak dimensions, mark as borderline.
  The kill thresholds are enforced downstream — your job is to flag
  honestly, not to cheerlead.
- If overall score < 6, write a one-sentence killReason (headline style,
  not a paragraph).

Output strict JSON. No preamble, no markdown fences. Schema:

{
  "score": 7.5,
  "dimensions": {
    "editorial_value": 8,
    "voice_integrity": 7,
    "factual_coherence": 8,
    "tone_fit": 8,
    "lede_strength": 7,
    "length_appropriate": 7
  },
  "notes": "1-3 sentences of editorial reasoning. What works, what doesn't.",
  "killReason": "Optional: 1 sentence, headline style. Only if overall score < 6 or you'd kill it.",
  "bestLine": "Optional: literal quote of the strongest line from the article. Only if approved."
}

Be honest. Don't approve articles that don't deserve it. Killing a thin
piece is a service to the publication; approving it dilutes the brand.
`.trim();

function formatArticleForReview(a: ArticleForReview): string {
  return [
    `Review this article for MonoKromatik publication. Score on the six dimensions and decide.`,
    ``,
    `Slug: ${a.slug}`,
    `Category: ${a.category}`,
    a.tags?.length ? `Tags: ${a.tags.join(', ')}` : null,
    a.sourceName ? `Source: ${a.sourceName}` : null,
    ``,
    `Title: ${a.title}`,
    ``,
    `Excerpt: ${a.excerpt}`,
    ``,
    `Body:`,
    a.content,
  ]
    .filter(Boolean)
    .join('\n');
}

interface ParsedReview {
  score: number;
  dimensions: ReviewDimensions;
  notes: string;
  killReason?: string;
  bestLine?: string;
}

function parseReviewResponse(text: string): ParsedReview {
  let jsonText = text.trim();

  // Strip markdown fences if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }

  // Extract the outermost JSON object
  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`EIC response did not contain a JSON object: ${text.slice(0, 200)}`);
  }
  jsonText = jsonText.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    const lenient = lenientParseEicJson(jsonText);
    if (!lenient) {
      throw new Error(
        `EIC response was not valid JSON. First 300 chars: ${jsonText.slice(0, 300)}`
      );
    }
    parsed = lenient;
  }

  const obj = parsed as Record<string, unknown>;
  const dims = obj.dimensions as Record<string, unknown> | undefined;
  if (!dims || typeof dims !== 'object') {
    throw new Error(`EIC response missing dimensions object`);
  }

  const dimensions: ReviewDimensions = {
    editorial_value: clamp(Number(dims.editorial_value) || 5, 1, 10),
    voice_integrity: clamp(Number(dims.voice_integrity) || 5, 1, 10),
    factual_coherence: clamp(Number(dims.factual_coherence) || 5, 1, 10),
    tone_fit: clamp(Number(dims.tone_fit) || 5, 1, 10),
    lede_strength: clamp(Number(dims.lede_strength) || 5, 1, 10),
    length_appropriate: clamp(Number(dims.length_appropriate) || 5, 1, 10),
  };

  // Compute mean if score not given (or sanity-check it)
  const meanScore =
    (dimensions.editorial_value +
      dimensions.voice_integrity +
      dimensions.factual_coherence +
      dimensions.tone_fit +
      dimensions.lede_strength +
      dimensions.length_appropriate) /
    6;
  const score = typeof obj.score === 'number' ? clamp(obj.score, 1, 10) : Math.round(meanScore * 10) / 10;

  return {
    score,
    dimensions,
    notes: typeof obj.notes === 'string' ? obj.notes : '',
    killReason: typeof obj.killReason === 'string' ? obj.killReason : undefined,
    bestLine: typeof obj.bestLine === 'string' ? obj.bestLine : undefined,
  };
}

/**
 * Lenient JSON parser for cases where Claude returns near-valid JSON
 * with unescaped quotes inside string fields. Same shape as Stylist's
 * lenient parser but for the EIC schema.
 */
function lenientParseEicJson(text: string): {
  score?: number;
  dimensions?: ReviewDimensions;
  notes?: string;
  killReason?: string;
  bestLine?: string;
} | null {
  // The dimensions block has only numeric values, so it parses cleanly
  // even when other fields don't. Try to extract just dimensions + score
  // first, then walk the string fields manually.
  const dimsMatch = /"dimensions"\s*:\s*\{([^}]+)\}/.exec(text);
  if (!dimsMatch) return null;

  const dimsBody = dimsMatch[1];
  const num = (key: string): number => {
    const m = new RegExp(`"${key}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`).exec(dimsBody);
    return m ? Number(m[1]) : 5;
  };

  const dimensions: ReviewDimensions = {
    editorial_value: clamp(num('editorial_value'), 1, 10),
    voice_integrity: clamp(num('voice_integrity'), 1, 10),
    factual_coherence: clamp(num('factual_coherence'), 1, 10),
    tone_fit: clamp(num('tone_fit'), 1, 10),
    lede_strength: clamp(num('lede_strength'), 1, 10),
    length_appropriate: clamp(num('length_appropriate'), 1, 10),
  };

  const scoreMatch = /"score"\s*:\s*(\d+(?:\.\d+)?)/.exec(text);
  const score = scoreMatch ? Number(scoreMatch[1]) : undefined;

  // Best-effort string field extraction
  const stringField = (key: string): string | undefined => {
    const startMatch = new RegExp(`"${key}"\\s*:\\s*"`).exec(text);
    if (!startMatch) return undefined;
    const valueStart = startMatch.index + startMatch[0].length;
    const remaining = text.slice(valueStart);
    // End at next "," before another quoted key, or final "}
    const endMatch = /"\s*(?:,\s*"\w+"\s*:|}\s*$)/m.exec(remaining);
    if (!endMatch) return undefined;
    return remaining.slice(0, endMatch.index).replace(/\\"/g, '"').replace(/\\n/g, '\n');
  };

  return {
    score,
    dimensions,
    notes: stringField('notes'),
    killReason: stringField('killReason'),
    bestLine: stringField('bestLine'),
  };
}

function clamp(n: number, min: number, max: number): number {
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
