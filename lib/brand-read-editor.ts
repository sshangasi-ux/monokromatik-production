/**
 * MonoKromatik Brand Read Editor
 *
 * Scores a generated Brand Read and decides whether it's good enough to
 * attach. This is the BAR; the Strategist's own validateBrandRead() is the
 * FLOOR.
 *
 *   - FLOOR (lib/strategist.ts → validateBrandRead): structural sanity. Is
 *     there a take of real length, a stance marker, valid confidence, and are
 *     the takeaways well-formed insight+move pairs? A read that fails the
 *     floor was never produced.
 *
 *   - BAR (this file): editorial quality. Given a structurally-valid read, is
 *     it actually *worth publishing* as intelligence? Does it say something a
 *     CMO couldn't get for free? Is it grounded or is it confident air? Does
 *     it sound like MonoKromatik, and does the dual-layer takeaway give a
 *     decision maker something to DO?
 *
 * The Editor mirrors the Editor-in-Chief's architecture deliberately: a model
 * scores on named dimensions, but the actual keep/drop decision is made HERE,
 * in version-controlled thresholds (applyBrandReadGate), so the bar is
 * unambiguous and auditable — not buried in a prompt.
 *
 * FAIL-CLOSED, like the Strategist it guards. If the Editor errors, can't
 * parse, or is unsure, it DROPS the Brand Read. The article still ships
 * without its strategic layer. Rationale is unchanged from the Strategist: a
 * missing Brand Read is a non-event; a weak or ungrounded one that slips
 * through is a reputational and monetisation failure, because the dual-layer
 * takeaway is the thing we'd eventually charge for. The guard must be at
 * least as conservative as the thing it guards.
 *
 * Cost: ~$0.02 per Brand Read using the editorial tier with prompt caching.
 * Runs only on reads that cleared the Strategist, so spend scales with what's
 * actually produced.
 *
 * The Editor does NOT rewrite. It scores and gates. Rewriting a strategic
 * take is an editorial act that stays with the operator (and, later, a
 * dedicated revision pass) — the Editor's only job is to decide whether THIS
 * read earns its place.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { BrandRead, BrandReadTakeaway } from './articles';

const REPO_ROOT = join(__dirname, '..');
const VOICE_PROFILE_PATH = join(REPO_ROOT, 'lib/voice-profile.md');
const PERSPECTIVES_PATH = join(REPO_ROOT, 'lib/perspectives-our-take.md');

let _voiceProfile: string | null = null;
function getVoiceProfile(): string {
  if (_voiceProfile === null) {
    _voiceProfile = readFileSync(VOICE_PROFILE_PATH, 'utf-8');
  }
  return _voiceProfile;
}

let _perspectives: string | null = null;
function getPerspectives(): string {
  if (_perspectives === null) {
    try {
      _perspectives = readFileSync(PERSPECTIVES_PATH, 'utf-8');
    } catch {
      _perspectives = '';
    }
  }
  return _perspectives;
}

/**
 * The article context the Editor needs to judge grounding. It must see the
 * source story to tell whether the read's claims are anchored in it or
 * invented around it.
 */
export interface ArticleContextForEdit {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
}

export interface BrandReadDimensions {
  /** Is it grounded in the article / uncontroversial fact, or confident air?
   *  This is the dimension that catches hallucination. Weighted hardest. */
  grounding: number;
  /** Does it say something non-obvious — a real reframe a CMO couldn't get free? */
  strategic_value: number;
  /** Does it sound like MonoKromatik (the voice-profile signatures, the house positions)? */
  voice_fit: number;
  /** Is the dual-layer takeaway actionable — a move you could brief on Monday? */
  takeaway_actionability: number;
  /** Is it a stance, or a dressed-up summary of the article? */
  conviction: number;
}

export interface BrandReadVerdict {
  /** 'keep' = attach the Brand Read; 'drop' = ship the article without it. */
  verdict: 'keep' | 'drop';
  /** Mean of dimension scores, 1.00–10.00. */
  score: number;
  dimensions: BrandReadDimensions;
  /** The Editor's reasoning, 1–3 sentences. For logs + the operator digest. */
  notes: string;
  /** If dropped, the headline-style reason. */
  dropReason?: string;
  /** ISO timestamp. */
  editedAt: string;
}

/**
 * The result the orchestrator consumes. Carries the gated Brand Read (or
 * null) plus the verdict for logging. When brandRead is null, attach nothing.
 */
export interface BrandReadEditResult {
  /** The Brand Read to attach if it cleared the bar, else null. */
  brandRead: BrandRead | null;
  verdict: BrandReadVerdict;
}

/**
 * Score a single Brand Read against the article it accompanies, and gate it.
 *
 * FAIL-CLOSED: any error, missing key, unparseable response, or sub-bar score
 * returns { brandRead: null }. The Strategist already produced a structurally
 * valid read; the Editor decides whether it's good enough to keep.
 */
export async function editBrandRead(
  brandRead: BrandRead,
  article: ArticleContextForEdit,
  client?: Anthropic
): Promise<BrandReadEditResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return dropResult('ANTHROPIC_API_KEY not set');
  }

  const ai = client ?? new Anthropic({ apiKey });
  const voiceProfile = getVoiceProfile();
  const perspectives = getPerspectives();

  const systemBlocks = [
    {
      type: 'text' as const,
      text: voiceProfile,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: perspectives
        ? `# MonoKromatik standing strategic positions\n\n${perspectives}`
        : '# MonoKromatik standing strategic positions\n\n(none on file)',
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: EDITOR_INSTRUCTIONS,
      cache_control: { type: 'ephemeral' as const },
    },
  ];

  const userMessage = formatForEdit(brandRead, article);

  let raw: string;
  try {
    const response = await ai.messages.create({
      model: MODELS.editorial,
      max_tokens: 1200,
      system: systemBlocks,
      messages: [{ role: 'user', content: userMessage }],
    });
    const textBlock = response.content.find((b: { type: string; text?: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text' || typeof textBlock.text !== 'string') {
      return dropResult('Editor returned no text content');
    }
    raw = textBlock.text;
  } catch (err) {
    return dropResult(
      `Editor API call failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  let parsed: ParsedEdit | null;
  try {
    parsed = parseEditResponse(raw);
  } catch (err) {
    return dropResult(
      `Editor response unparseable: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (!parsed) {
    return dropResult('Editor response unparseable');
  }

  const verdict = applyBrandReadGate({
    verdict: 'keep', // tentative; the gate decides
    score: parsed.score,
    dimensions: parsed.dimensions,
    notes: parsed.notes,
    dropReason: parsed.dropReason,
    editedAt: new Date().toISOString(),
  });

  return {
    brandRead: verdict.verdict === 'keep' ? brandRead : null,
    verdict,
  };
}

/**
 * Score + gate a batch of Brand Reads. Concurrency capped at 3. Each item
 * pairs a Brand Read with its article context. Mirrors strategizeBatch.
 */
export async function editBatch(
  items: Array<{ brandRead: BrandRead; article: ArticleContextForEdit }>,
  options: {
    concurrency?: number;
    onProgress?: (done: number, total: number, latest: BrandReadEditResult) => void;
  } = {}
): Promise<BrandReadEditResult[]> {
  if (items.length === 0) return [];

  const concurrency = options.concurrency ?? 3;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return items.map(() => dropResult('ANTHROPIC_API_KEY not set'));
  }

  const client = new Anthropic({ apiKey });
  const results: BrandReadEditResult[] = new Array(items.length);
  let completed = 0;

  const queue = items.map((item, i) => ({ item, index: i }));
  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) return;
      const result = await editBrandRead(next.item.brandRead, next.item.article, client);
      results[next.index] = result;
      completed++;
      options.onProgress?.(completed, items.length, result);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------- Internal: drop helper ----------

function dropResult(reason: string): BrandReadEditResult {
  return {
    brandRead: null,
    verdict: {
      verdict: 'drop',
      score: 0,
      dimensions: {
        grounding: 0,
        strategic_value: 0,
        voice_fit: 0,
        takeaway_actionability: 0,
        conviction: 0,
      },
      notes: `[Editor drop] ${reason}`,
      dropReason: reason,
      editedAt: new Date().toISOString(),
    },
  };
}

// ---------- Internal: the gate (version-controlled thresholds) ----------

/**
 * The keep/drop thresholds. The model scores; this function decides. Keeping
 * the rules here (not in the prompt) makes the bar auditable and tunable
 * without touching model behaviour — the same discipline as the EIC's
 * applyKillRules.
 *
 * The bar is deliberately higher than the EIC's publish bar. A mediocre
 * article is still a real article; a mediocre Brand Read actively misleads a
 * decision maker and cheapens the layer we intend to monetise. When the read
 * is only so-so, dropping it is the correct, conservative call.
 */
function applyBrandReadGate(v: BrandReadVerdict): BrandReadVerdict {
  const d = v.dimensions;

  // HARD DROP — grounding. This is the hallucination guard. A confident,
  // ungrounded read is the single most dangerous output the pipeline can
  // produce, so it fails closed at a high threshold.
  if (d.grounding < 7) {
    return {
      ...v,
      verdict: 'drop',
      dropReason:
        v.dropReason ??
        `Grounding ${d.grounding}/10 — claims not anchored in the article. Possible invention.`,
    };
  }

  // HARD DROP — no real strategic value. If a CMO could've gotten this for
  // free, it isn't intelligence and shouldn't carry the masthead.
  if (d.strategic_value < 6) {
    return {
      ...v,
      verdict: 'drop',
      dropReason:
        v.dropReason ??
        `Strategic value ${d.strategic_value}/10 — says nothing a decision maker couldn't get free.`,
    };
  }

  // HARD DROP — off-voice. An off-brand strategic take damages the franchise
  // more than a missing one.
  if (d.voice_fit < 6) {
    return {
      ...v,
      verdict: 'drop',
      dropReason: v.dropReason ?? `Voice fit ${d.voice_fit}/10 — doesn't sound like MonoKromatik.`,
    };
  }

  // SOFT DROP — the takeaway isn't actionable. The dual-layer move is the
  // monetisable bridge; if it's a platitude, the read hasn't earned its keep.
  if (d.takeaway_actionability < 6) {
    return {
      ...v,
      verdict: 'drop',
      dropReason:
        v.dropReason ??
        `Takeaway actionability ${d.takeaway_actionability}/10 — no move a decision maker could brief on.`,
    };
  }

  // SOFT DROP — reads as summary, not stance.
  if (d.conviction < 6) {
    return {
      ...v,
      verdict: 'drop',
      dropReason: v.dropReason ?? `Conviction ${d.conviction}/10 — a dressed-up summary, not a take.`,
    };
  }

  // OVERALL BAR — even with no single failing dimension, a thin overall score
  // doesn't clear the bar for a layer we intend to monetise.
  if (v.score < 7) {
    return {
      ...v,
      verdict: 'drop',
      dropReason: v.dropReason ?? `Overall ${v.score.toFixed(1)}/10 — below the Brand Read bar.`,
    };
  }

  return { ...v, verdict: 'keep' };
}

// ---------- Internal: prompt ----------

const EDITOR_INSTRUCTIONS = `
You are the MonoKromatik Brand Read Editor.

A Strategist has written "The Brand Read" — the strategic layer attached to a
culture article, aimed at decision makers (CMOs, agency execs, culture
strategists). Your job is NOT to rewrite it. Your job is to judge whether it
is good enough to publish under the MonoKromatik masthead, and score it
honestly so a downstream gate can keep or drop it.

The voice profile and the standing strategic positions above are the
standard. The article that the read accompanies is provided. Score the Brand
Read on five dimensions, each 1-10.

1. grounding  — THE MOST IMPORTANT DIMENSION.
   Are the read's concrete claims anchored in the article you were given, or
   in widely-established, uncontroversial fact? Or has the Strategist invented
   a statistic, a campaign, a deal, a quote, or a confident claim with no
   basis?
   - 10: Every concrete claim traces to the article or to obvious public fact.
   - 7:  Solidly grounded; interpretation clearly labelled as such.
   - 4:  Contains a claim that sounds specific but isn't supported anywhere.
   - 1:  Invents facts — fabricated numbers, made-up campaigns, fake quotes.
   If you suspect ANY invented specific, score this <= 4. We would rather drop
   a real read than ship one fabricated number.

2. strategic_value
   Does it say something non-obvious — a genuine reframe a decision maker
   couldn't have reached on their own from the article?
   - 10: A sharp reframe that reorganises how you'd act on this.
   - 6:  A reasonable point, but close to what the article already implies.
   - 1:  Restates the obvious. A CMO gets nothing they didn't have.

3. voice_fit
   Does it sound like MonoKromatik — the four voice signatures, the house
   positions, culture-as-capital — without "Africa rising," poverty framing,
   hype, or exclamation marks?
   - 10: Unmistakably the house voice.
   - 6:  On-brand but a little generic.
   - 1:  Off-voice or carries a forbidden frame.

4. takeaway_actionability
   The dual-layer takeaways pair an insight ("where this lands") with a move
   ("what to do with it"). Is the move something a decision maker could
   actually brief their team on this quarter?
   - 10: Specific, ownable moves. You could act on Monday.
   - 6:  Directionally useful but a little abstract.
   - 1:  Platitudes. "Engage authentically." No real move.
   If there are no takeaways at all, score this <= 5 — the monetisable bridge
   is missing.

5. conviction
   Is it a stance, or a dressed-up summary of the article?
   - 10: Leads with a clear point of view and commits to it.
   - 6:  Has a view but hedges.
   - 1:  Just recaps the story in strategic-sounding language.

Output strict JSON. No preamble, no markdown fences. Schema:

{
  "score": 7.6,
  "dimensions": {
    "grounding": 8,
    "strategic_value": 8,
    "voice_fit": 7,
    "takeaway_actionability": 8,
    "conviction": 8
  },
  "notes": "1-3 sentences. What works, what's weak, and especially any grounding concern.",
  "dropReason": "Optional: 1 sentence, headline style. Only if you'd drop it."
}

Be hard on grounding. A missing Brand Read costs the publication nothing; a
fabricated one costs it credibility. When unsure, score down.
`.trim();

function formatForEdit(br: BrandRead, a: ArticleContextForEdit): string {
  const takeawayLines = formatTakeawaysForReview(br.takeaways);
  return [
    `Judge this Brand Read against the article it accompanies. Score the five`,
    `dimensions and decide.`,
    ``,
    `=== THE ARTICLE (for grounding) ===`,
    `Slug: ${a.slug}`,
    `Category: ${a.category}`,
    `Title: ${a.title}`,
    ``,
    `Excerpt: ${a.excerpt}`,
    ``,
    `Body:`,
    a.content,
    ``,
    `=== THE BRAND READ (under review) ===`,
    `Attribution: ${br.attribution}${br.attributionRole ? ` — ${br.attributionRole}` : ''}`,
    `Stated confidence: ${br.confidence ?? '(none)'}`,
    ``,
    `Take:`,
    br.take,
    ``,
    br.pullQuote ? `Pull quote: ${br.pullQuote}` : null,
    ``,
    `Takeaways:`,
    takeawayLines,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function formatTakeawaysForReview(takeaways?: BrandReadTakeaway[]): string {
  if (!takeaways || takeaways.length === 0) {
    return '(none provided)';
  }
  return takeaways
    .map((t, i) => {
      if (typeof t === 'string') {
        return `${i + 1}. ${t}`;
      }
      return `${i + 1}. WHERE THIS LANDS: ${t.insight}\n   WHAT TO DO WITH IT: ${t.move}`;
    })
    .join('\n');
}

// ---------- Internal: parser ----------

interface ParsedEdit {
  score: number;
  dimensions: BrandReadDimensions;
  notes: string;
  dropReason?: string;
}

function parseEditResponse(text: string): ParsedEdit {
  let jsonText = text.trim();

  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }

  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Editor response did not contain a JSON object: ${text.slice(0, 200)}`);
  }
  jsonText = jsonText.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    const lenient = lenientParseEditJson(jsonText);
    if (!lenient) {
      throw new Error(
        `Editor response was not valid JSON. First 300 chars: ${jsonText.slice(0, 300)}`
      );
    }
    parsed = lenient;
  }

  const obj = parsed as Record<string, unknown>;
  const dims = obj.dimensions as Record<string, unknown> | undefined;
  if (!dims || typeof dims !== 'object') {
    throw new Error('Editor response missing dimensions object');
  }

  const dimensions: BrandReadDimensions = {
    grounding: clamp(Number(dims.grounding) || 5, 1, 10),
    strategic_value: clamp(Number(dims.strategic_value) || 5, 1, 10),
    voice_fit: clamp(Number(dims.voice_fit) || 5, 1, 10),
    takeaway_actionability: clamp(Number(dims.takeaway_actionability) || 5, 1, 10),
    conviction: clamp(Number(dims.conviction) || 5, 1, 10),
  };

  const meanScore =
    (dimensions.grounding +
      dimensions.strategic_value +
      dimensions.voice_fit +
      dimensions.takeaway_actionability +
      dimensions.conviction) /
    5;
  const score =
    typeof obj.score === 'number' ? clamp(obj.score, 1, 10) : Math.round(meanScore * 10) / 10;

  return {
    score,
    dimensions,
    notes: typeof obj.notes === 'string' ? obj.notes : '',
    dropReason: typeof obj.dropReason === 'string' ? obj.dropReason : undefined,
  };
}

/**
 * Lenient parser for near-valid JSON with unescaped quotes in the string
 * fields. The dimensions block is numeric-only, so it extracts cleanly; the
 * string fields are walked by hand. Same approach as the EIC's parser.
 */
function lenientParseEditJson(text: string): {
  score?: number;
  dimensions?: BrandReadDimensions;
  notes?: string;
  dropReason?: string;
} | null {
  const dimsMatch = /"dimensions"\s*:\s*\{([^}]+)\}/.exec(text);
  if (!dimsMatch) return null;

  const dimsBody = dimsMatch[1];
  const num = (key: string): number => {
    const m = new RegExp(`"${key}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`).exec(dimsBody);
    return m ? Number(m[1]) : 5;
  };

  const dimensions: BrandReadDimensions = {
    grounding: clamp(num('grounding'), 1, 10),
    strategic_value: clamp(num('strategic_value'), 1, 10),
    voice_fit: clamp(num('voice_fit'), 1, 10),
    takeaway_actionability: clamp(num('takeaway_actionability'), 1, 10),
    conviction: clamp(num('conviction'), 1, 10),
  };

  const scoreMatch = /"score"\s*:\s*(\d+(?:\.\d+)?)/.exec(text);
  const score = scoreMatch ? Number(scoreMatch[1]) : undefined;

  const stringField = (key: string): string | undefined => {
    const startMatch = new RegExp(`"${key}"\\s*:\\s*"`).exec(text);
    if (!startMatch) return undefined;
    const valueStart = startMatch.index + startMatch[0].length;
    const remaining = text.slice(valueStart);
    const endMatch = /"\s*(?:,\s*"\w+"\s*:|}\s*$)/m.exec(remaining);
    if (!endMatch) return undefined;
    return remaining.slice(0, endMatch.index).replace(/\\"/g, '"').replace(/\\n/g, '\n');
  };

  return {
    score,
    dimensions,
    notes: stringField('notes'),
    dropReason: stringField('dropReason'),
  };
}

function clamp(n: number, min: number, max: number): number {
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
