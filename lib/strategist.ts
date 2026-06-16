/**
 * MonoKromatik Strategist Agent
 *
 * Runs AFTER the Editor-in-Chief has approved an article. Reads the finished
 * cultural story and generates "The Brand Read" — the dual-read strategic
 * layer that turns a culture piece into intelligence for decision makers
 * (CMOs, agency execs, culture strategists). See:
 *   - docs/MONOKROMATIK_EDITORIAL_VOICE.md  ("The dual read")
 *   - lib/voice-profile.md                  (the voice it writes in)
 *   - lib/perspectives-our-take.md          (the standing strategic positions)
 *
 * What it produces is a `BrandRead` object (lib/articles.ts): a named-POV
 * take in the MonoKromatik house voice, a pull quote, and dual-layer
 * takeaways (insight + move) that bridge from "where this lands" to "what to
 * do with it." Attribution is the masthead ("The MonoKromatik Team").
 *
 * CRITICAL — this agent is FAIL-CLOSED, the opposite of the EIC.
 *   - The EIC fail-OPENS: if it errors, the article still ships. A missing
 *     review must never take the pipeline down.
 *   - The Strategist fail-CLOSES: if it errors, can't ground its claims, or
 *     comes back weak, it writes NO brandRead at all. The article still
 *     publishes — just without the strategic layer.
 *
 *     A missing Brand Read is a non-event. A hallucinated one — a fabricated
 *     stat, an invented campaign, a confident claim with no basis — is a
 *     reputational and governance failure. When in doubt, write nothing.
 *
 * The take is *interpretation*, and it says so: confidence defaults to
 * 'interpretive' and is surfaced to the reader (operational transparency,
 * per EDITORIAL_GOVERNANCE.md). The Strategist may only mark a read
 * 'verified' / 'partial' when its factual anchors are checkable against the
 * article body itself — it does not invent external facts to raise its own
 * confidence.
 *
 * Cost: ~$0.04 per approved article using the flagship tier with prompt
 * caching. Runs only on approved pieces, so spend scales with what ships,
 * not with what's scouted.
 *
 * Today the output lands in the PR diff for operator sign-off — it does not
 * auto-publish. The path to fuller autonomy is to raise trust incrementally,
 * always INSIDE the review gate, never outside it.
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
      // If the corpus is missing, the Strategist still runs but without the
      // operator's standing positions. It leans entirely on the voice profile
      // and the article. This is intentionally non-fatal.
      _perspectives = '';
    }
  }
  return _perspectives;
}

/** The default, honest masthead attribution. */
export const STRATEGIST_ATTRIBUTION = 'The MonoKromatik Team';
export const STRATEGIST_ATTRIBUTION_ROLE = 'Brand Intelligence';

export interface ArticleForStrategy {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  sourceName?: string;
}

/**
 * The Strategist's result. Either a Brand Read to attach, or a recorded
 * reason it produced nothing. `brandRead` is null whenever the agent
 * fail-closes — caller attaches it only when present.
 */
export interface StrategyResult {
  /** The Brand Read to attach, or null if the agent declined / failed. */
  brandRead: BrandRead | null;
  /** Why nothing was produced, when brandRead is null. For logs + digest. */
  declineReason?: string;
  /** ISO timestamp of when this ran. */
  ranAt: string;
}

/**
 * Generate a Brand Read for a single approved article.
 *
 * FAIL-CLOSED: any error, missing key, empty/weak output, or ungroundable
 * take returns { brandRead: null, declineReason }. The article still ships;
 * it just won't carry a strategic layer this time.
 */
export async function generateBrandRead(
  article: ArticleForStrategy,
  client?: Anthropic
): Promise<StrategyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return decline('ANTHROPIC_API_KEY not set');
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
        : '# MonoKromatik standing strategic positions\n\n(none on file — lean on the voice profile and the article)',
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: STRATEGIST_INSTRUCTIONS,
      cache_control: { type: 'ephemeral' as const },
    },
  ];

  const userMessage = formatArticleForStrategy(article);

  let raw: string;
  try {
    const response = await ai.messages.create({
      model: MODELS.flagship,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [{ role: 'user', content: userMessage }],
    });
    const textBlock = response.content.find((b: { type: string; text?: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text' || typeof textBlock.text !== 'string') {
      return decline('Strategist returned no text content');
    }
    raw = textBlock.text;
  } catch (err) {
    return decline(
      `Strategist API call failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Parse. A parse failure is a decline, not a throw — fail-closed.
  let parsed: ParsedStrategy | null;
  try {
    parsed = parseStrategyResponse(raw);
  } catch (err) {
    return decline(
      `Strategist response unparseable: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (!parsed) {
    return decline('Strategist response unparseable');
  }

  // The model can explicitly decline (e.g. "no strategic angle here").
  if (parsed.decline) {
    return decline(parsed.declineReason ?? 'Strategist found no strategic angle worth publishing');
  }

  // Validate the substance. Anything thin → fail-closed.
  const validation = validateBrandRead(parsed);
  if (!validation.ok) {
    return decline(validation.reason);
  }

  const brandRead: BrandRead = {
    attribution: STRATEGIST_ATTRIBUTION,
    attributionRole: STRATEGIST_ATTRIBUTION_ROLE,
    confidence: parsed.confidence,
    take: parsed.take.trim(),
    pullQuote: parsed.pullQuote?.trim() || undefined,
    takeaways: parsed.takeaways.length > 0 ? parsed.takeaways : undefined,
  };

  return { brandRead, ranAt: new Date().toISOString() };
}

/**
 * Generate Brand Reads for a batch of approved articles in parallel.
 * Concurrency capped at 3 to be polite to the Anthropic API. Mirrors the
 * EIC's reviewBatch shape so the orchestrator can use it the same way.
 */
export async function strategizeBatch(
  articles: ArticleForStrategy[],
  options: {
    concurrency?: number;
    onProgress?: (done: number, total: number, latest: StrategyResult) => void;
  } = {}
): Promise<StrategyResult[]> {
  if (articles.length === 0) return [];

  const concurrency = options.concurrency ?? 3;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return articles.map(() => decline('ANTHROPIC_API_KEY not set'));
  }

  const client = new Anthropic({ apiKey });
  const results: StrategyResult[] = new Array(articles.length);
  let completed = 0;

  const queue = articles.map((a, i) => ({ article: a, index: i }));
  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const result = await generateBrandRead(item.article, client);
      results[item.index] = result;
      completed++;
      options.onProgress?.(completed, articles.length, result);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, articles.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------- Internal: decline helper ----------

function decline(reason: string): StrategyResult {
  return { brandRead: null, declineReason: reason, ranAt: new Date().toISOString() };
}

// ---------- Internal: validation (the fail-closed gate) ----------

/**
 * Substance check. The Strategist must clear a real bar or it produces
 * nothing. These are deliberately strict: a missing Brand Read costs us
 * nothing, a weak one costs us credibility.
 */
function validateBrandRead(p: ParsedStrategy): { ok: true } | { ok: false; reason: string } {
  const take = (p.take ?? '').trim();
  if (!take) return { ok: false, reason: 'No take produced' };

  // Too short to be a strategic read rather than a sentence of filler.
  if (take.length < 240) {
    return { ok: false, reason: `Take too thin (${take.length} chars) — not a real strategic read` };
  }

  // Must carry a stance, not a summary. The house voice leads with "Our take".
  // We don't hard-require the literal phrase, but we do require first-person
  // conviction markers — a recap of the article isn't a Brand Read.
  const stanceMarkers = /\b(our take|our read|we read|we see|we'd|here's the|the sharper read|the real)\b/i;
  if (!stanceMarkers.test(take)) {
    return { ok: false, reason: 'Take reads as summary, not stance — no conviction markers' };
  }

  // Confidence must be one of the known states.
  if (!p.confidence || !['verified', 'partial', 'interpretive'].includes(p.confidence)) {
    return { ok: false, reason: `Invalid confidence: ${String(p.confidence)}` };
  }

  // Takeaways are optional, but if present each must be a real insight+move
  // pair or a non-trivial string. Empty/half pairs → drop the whole read,
  // because the dual-layer takeaway IS the monetisable bridge; a broken one
  // is worse than none.
  for (const t of p.takeaways) {
    if (typeof t === 'string') {
      if (t.trim().length < 20) {
        return { ok: false, reason: 'A string takeaway is too thin' };
      }
    } else {
      if (!t.insight?.trim() || !t.move?.trim()) {
        return { ok: false, reason: 'A takeaway is missing its insight or its move' };
      }
      if (t.insight.trim().length < 20 || t.move.trim().length < 20) {
        return { ok: false, reason: 'A takeaway insight/move is too thin' };
      }
    }
  }

  return { ok: true };
}

// ---------- Internal: prompt ----------

const STRATEGIST_INSTRUCTIONS = `
You are the MonoKromatik Strategist.

The voice profile above is the house voice. The standing strategic positions
above are MonoKromatik's own settled views on culture, brands, and the
African + diaspora market — written from the founder's perspective and the
publication's. Write in that voice, from those positions.

Your job: read an already-published-quality cultural article and write
"The Brand Read" — a short strategic layer that turns the story into
intelligence a decision maker (a CMO, an agency exec, a culture strategist)
would pay for. The cultural reader gets the story. The Brand Read is the
second read, for the person who has to make a commercial decision about
culture like this.

THE STANCE (most important)
- Lead with a take, not a summary. The opening is "Our take is that…" —
  conviction, a point of view, the publication saying something.
- Do NOT recap the article. The reader just read it. Tell them what it MEANS
  that they wouldn't have got on their own.
- One controlling idea. Reframe the obvious read into the sharper one
  ("the easy read is X; the sharper read is Y").
- Voice: the brand strategist who treats culture as capital. Short sentences
  that land. No hype, no "Africa rising," no poverty frame, no exclamation
  marks. Absorb the authority of the field's best cultural and brand thinkers
  — never name them, never quote them, never attribute positions to real
  living people.

GROUNDING (this is a hard rule)
- Every concrete claim must be grounded in the article you were given, or in
  widely-established, uncontroversial fact. Prefer the article.
- Do NOT invent statistics, campaigns, deal values, dates, or quotes. If you
  find yourself reaching for a specific number or named campaign you are not
  certain of, leave it out and make the point qualitatively.
- "confidence" reflects how grounded the read is:
    - "interpretive"  (default): a positioning argument / point of view.
    - "partial":      mostly grounded in article facts, some interpretation.
    - "verified":     anchored entirely in facts present in the article body.
  When in doubt, use "interpretive". Never raise confidence by inventing facts.

THE DUAL-LAYER TAKEAWAYS (this is the monetisable bridge)
Produce 2–3 takeaways. Each has TWO parts:
  - "insight" = WHERE THIS LANDS: the strategic consequence, stated as a
    conviction ("Authorship beats casting every time.").
  - "move"    = WHAT TO DO WITH IT: a concrete action a decision maker can
    take this quarter ("Shift one flagship partnership from a usage deal to
    a co-authorship role…"). Specific enough to act on, not a platitude.
The insight earns the nod; the move earns the retainer. Both must be real.

WHEN TO DECLINE (fail-closed)
Some stories have no strategic angle worth a decision maker's attention —
they're pure culture, and forcing a brand read would be thin or cynical.
If that's the case, decline. A missing Brand Read is fine. A forced one is
not. Decline by returning {"decline": true, "declineReason": "..."}.

OUTPUT
Strict JSON. No preamble, no markdown fences. One of two shapes:

To decline:
{ "decline": true, "declineReason": "1 sentence, why there's no strategic angle" }

To produce a Brand Read:
{
  "confidence": "interpretive",
  "pullQuote": "One sharp, quotable line. The lasting strategic point. <= 30 words.",
  "take": "2–4 short paragraphs. Lead with 'Our take is that…'. Separate paragraphs with \\n\\n. Stance, not summary.",
  "takeaways": [
    {
      "insight": "WHERE THIS LANDS — a conviction, one sentence.",
      "move": "WHAT TO DO WITH IT — a concrete action a decision maker can take."
    }
  ]
}

Write fewer, sharper words. If the read isn't genuinely useful to someone
making a commercial decision, decline rather than pad.
`.trim();

function formatArticleForStrategy(a: ArticleForStrategy): string {
  return [
    `Write the Brand Read for this MonoKromatik article, or decline if there's`,
    `no strategic angle worth a decision maker's attention.`,
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

// ---------- Internal: parser ----------

interface ParsedStrategy {
  decline?: boolean;
  declineReason?: string;
  confidence?: BrandRead['confidence'];
  take: string;
  pullQuote?: string;
  takeaways: BrandReadTakeaway[];
}

function parseStrategyResponse(text: string): ParsedStrategy | null {
  let jsonText = text.trim();

  // Strip markdown fences if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }

  // Extract the outermost JSON object
  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Strategist response did not contain a JSON object: ${text.slice(0, 200)}`);
  }
  jsonText = jsonText.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    const lenient = lenientParseStrategyJson(jsonText);
    if (!lenient) {
      throw new Error(
        `Strategist response was not valid JSON. First 300 chars: ${jsonText.slice(0, 300)}`
      );
    }
    parsed = lenient;
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.decline === true) {
    return {
      decline: true,
      declineReason: typeof obj.declineReason === 'string' ? obj.declineReason : undefined,
      take: '',
      takeaways: [],
    };
  }

  const confidence =
    obj.confidence === 'verified' || obj.confidence === 'partial' || obj.confidence === 'interpretive'
      ? obj.confidence
      : 'interpretive';

  return {
    confidence,
    take: typeof obj.take === 'string' ? obj.take : '',
    pullQuote: typeof obj.pullQuote === 'string' ? obj.pullQuote : undefined,
    takeaways: normalizeTakeaways(obj.takeaways),
  };
}

/**
 * Coerce whatever came back in "takeaways" into a clean BrandReadTakeaway[].
 * Tolerates strings, {insight, move} objects, and drops anything malformed.
 */
function normalizeTakeaways(raw: unknown): BrandReadTakeaway[] {
  if (!Array.isArray(raw)) return [];
  const out: BrandReadTakeaway[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      if (item.trim()) out.push(item.trim());
      continue;
    }
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const insight = typeof o.insight === 'string' ? o.insight.trim() : '';
      const move = typeof o.move === 'string' ? o.move.trim() : '';
      if (insight && move) {
        out.push({ insight, move });
      } else if (insight && !move) {
        // Half a pair is better dropped than shipped as a fake dual-read.
        // Keep the insight as a plain string so it still renders cleanly.
        out.push(insight);
      }
    }
  }
  return out;
}

/**
 * Lenient parser for near-valid JSON where the "take" or "pullQuote" strings
 * contain unescaped quotes or newlines. The "takeaways" array is structurally
 * regular, so we extract the scalar fields by hand and best-effort the rest.
 * Returns null if we can't even find a take.
 */
function lenientParseStrategyJson(text: string): ParsedStrategy | null {
  // Explicit decline shape
  if (/"decline"\s*:\s*true/.test(text)) {
    const reason = stringField(text, 'declineReason');
    return { decline: true, declineReason: reason, take: '', takeaways: [] };
  }

  const take = stringField(text, 'take');
  if (!take) return null;

  const pullQuote = stringField(text, 'pullQuote');

  const confMatch = /"confidence"\s*:\s*"(verified|partial|interpretive)"/.exec(text);
  const confidence = (confMatch?.[1] as BrandRead['confidence']) ?? 'interpretive';

  // Best-effort takeaways: pull each {insight, move} pair in order.
  const takeaways: BrandReadTakeaway[] = [];
  const pairRe = /\{[^{}]*?"insight"\s*:\s*"((?:[^"\\]|\\.)*)"[^{}]*?"move"\s*:\s*"((?:[^"\\]|\\.)*)"[^{}]*?\}/g;
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(text)) !== null) {
    const insight = unescape(m[1]);
    const move = unescape(m[2]);
    if (insight.trim() && move.trim()) {
      takeaways.push({ insight: insight.trim(), move: move.trim() });
    }
  }

  return { confidence, take, pullQuote, takeaways };
}

/**
 * Extract a JSON string field by key, tolerating unescaped content inside.
 * Same approach as the EIC's lenient string extraction.
 */
function stringField(text: string, key: string): string | undefined {
  const startMatch = new RegExp(`"${key}"\\s*:\\s*"`).exec(text);
  if (!startMatch) return undefined;
  const valueStart = startMatch.index + startMatch[0].length;
  const remaining = text.slice(valueStart);
  // End at the closing quote that precedes the next key or the object's close.
  const endMatch = /"\s*(?:,\s*"\w+"\s*:|,?\s*\}\s*$|,\s*\})/m.exec(remaining);
  if (!endMatch) return undefined;
  return unescape(remaining.slice(0, endMatch.index));
}

function unescape(s: string): string {
  return s.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
}
