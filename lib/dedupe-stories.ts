// MonoKromatik Subject-Level Deduper
// Uses Claude to compare candidate stories against already-published articles
// and reject those that cover the same subject — even when titles look different.
//
// Why this exists: the Curator's lexical dedupe (normalized title-string match)
// catches obvious dupes but misses the case where the agents write three
// different headlines about the same album release. Subject-level dedupe asks
// Claude "is this candidate the same story as any of these published pieces?"
// and trusts the answer.

import Anthropic from '@anthropic-ai/sdk';
import { Story } from './rss-feeds';

// Lazy client init — avoids reading process.env.ANTHROPIC_API_KEY at module
// load time, so callers can populate the env var (e.g. via .env.local) AFTER
// importing this module. This is the same pattern other agents in this repo
// use for the same reason.
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (_client === null) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface PublishedArticle {
  title: string;
  excerpt: string;
  publishedAt: string;
  slug: string;
}

export interface DedupeResult {
  novel: Story[];
  rejected: Array<{
    candidate: Story;
    duplicateOf: string; // slug of the existing article it duplicates
    reason: string;
  }>;
}

/**
 * Compare candidate stories against already-published articles. Drop
 * candidates that cover the same subject as something already published.
 *
 * The lookback window defaults to 14 days — older articles are considered
 * "fair game" for re-coverage. (A 6-month-old story can legitimately get
 * a follow-up; a 2-day-old one cannot.)
 *
 * Cost: one Claude call per dedupe pass, regardless of candidate count.
 * Across a typical agent run (3-10 candidates vs ~15 published), this is
 * ~$0.005 — basically free.
 */
export async function dedupeAgainstPublished(
  candidates: Story[],
  published: PublishedArticle[],
  options: { lookbackDays?: number } = {}
): Promise<DedupeResult> {
  const lookbackDays = options.lookbackDays ?? 14;

  // Filter to recent published articles only
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const recentlyPublished = published.filter((p) => {
    const ts = new Date(p.publishedAt).getTime();
    return !isNaN(ts) && ts >= cutoff;
  });

  if (candidates.length === 0) {
    return { novel: [], rejected: [] };
  }

  // If nothing's been published recently, all candidates are novel by default.
  if (recentlyPublished.length === 0) {
    return { novel: candidates, rejected: [] };
  }

  console.log(
    `\n🔁 [DEDUPE] Comparing ${candidates.length} candidate(s) vs ${recentlyPublished.length} recently published article(s) (${lookbackDays}-day window)...`
  );

  const prompt = `You are the dedupe gate for MonoKromatik Network. Your job is to reject candidate stories that cover the same SUBJECT as articles we've already published, even if the headline phrasing is different.

What counts as "same subject":
- Same person's same announcement / release / event
  (e.g. "Asake's M\$NEY album dropped" vs "Asake's M\$NEY broke records" — SAME)
- Same match, fixture, or game
  (e.g. "Awoniyi's double at Stamford Bridge" vs "Awoniyi silences Chelsea" — SAME)
- Same ongoing news event in the same news cycle
  (e.g. two articles about the same player's transfer rumour in the same week — SAME)

What does NOT count as "same subject":
- Same artist, different release / album / single
  (e.g. "Asake M\$NEY review" vs "Asake new single" months later — DIFFERENT)
- Same team, different match
  (e.g. "Forest beat Chelsea" vs "Forest beat Liverpool the following weekend" — DIFFERENT)
- Same broad topic, different angle / news event
  (e.g. "Tyla wins Grammy" vs "Tyla announces tour" — DIFFERENT)

If in doubt, lean toward NOVEL (false positives are worse than letting a near-duplicate through).

ALREADY PUBLISHED (last ${lookbackDays} days):
${JSON.stringify(
    recentlyPublished.map((p, i) => ({
      published_index: i,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt.slice(0, 200),
    })),
    null,
    2
  )}

CANDIDATES TO EVALUATE:
${JSON.stringify(
    candidates.map((c, i) => ({
      candidate_index: i,
      title: c.title,
      excerpt: (c.excerpt || '').slice(0, 200),
      source: c.source,
    })),
    null,
    2
  )}

Respond with strict JSON, no preamble, no markdown fences:

{
  "decisions": [
    {
      "candidate_index": 0,
      "verdict": "novel" | "duplicate",
      "duplicate_of_slug": "slug-of-existing-article-if-duplicate-else-null",
      "reason": "one short sentence explaining why"
    },
    ...
  ]
}

Return one decision object per candidate, in the same order. Do not skip candidates.`;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract the outermost JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      console.warn('⚠️  Dedupe: Claude response did not contain JSON. Falling open (all novel).');
      return { novel: candidates, rejected: [] };
    }

    const parsed = parseDedupeResponseSafely(text.slice(start, end + 1));
    if (!parsed) {
      console.warn(
        '⚠️  Dedupe: response was unparseable JSON. Falling open (all novel).'
      );
      return { novel: candidates, rejected: [] };
    }

    const novel: Story[] = [];
    const rejected: DedupeResult['rejected'] = [];

    for (const decision of parsed.decisions) {
      const candidate = candidates[decision.candidate_index];
      if (!candidate) continue;
      if (decision.verdict === 'duplicate') {
        rejected.push({
          candidate,
          duplicateOf: decision.duplicate_of_slug || '(unknown)',
          reason: decision.reason,
        });
      } else {
        novel.push(candidate);
      }
    }

    console.log(
      `   ${novel.length} novel | ${rejected.length} duplicate${rejected.length === 1 ? '' : 's'}`
    );
    rejected.forEach((r) => {
      console.log(`   ❌ "${r.candidate.title.slice(0, 60)}…"`);
      console.log(`        duplicates: ${r.duplicateOf}`);
      console.log(`        reason: ${r.reason}`);
    });

    return { novel, rejected };
  } catch (err) {
    console.warn(
      `⚠️  Dedupe failed (${err instanceof Error ? err.message : 'unknown'}). Falling open — all candidates pass through.`
    );
    return { novel: candidates, rejected: [] };
  }
}

interface DedupeDecision {
  candidate_index: number;
  verdict: 'novel' | 'duplicate';
  duplicate_of_slug: string | null;
  reason: string;
}

/**
 * Try strict JSON.parse first. On failure, fall back to a lenient parser
 * that extracts each decision via regex. Same pattern used by Stylist and
 * EIC for the same reason — long Claude responses occasionally contain an
 * unescaped quote inside a free-text "reason" field, breaking strict JSON.
 *
 * The lenient path tolerates:
 *   - Unescaped quotes in `reason` fields
 *   - Trailing commas
 *   - Newlines inside strings
 *   - JS-style comments (rare but seen)
 *
 * Returns null only if no decisions can be salvaged at all.
 */
function parseDedupeResponseSafely(
  jsonLike: string
): { decisions: DedupeDecision[] } | null {
  // Fast path — strict parse works ~95% of the time.
  try {
    const strict = JSON.parse(jsonLike) as { decisions: DedupeDecision[] };
    if (strict && Array.isArray(strict.decisions)) {
      return strict;
    }
  } catch {
    // fall through to lenient
  }

  // Lenient path — walk each decision object via regex. Match the
  // candidate_index + verdict pair first (both are well-formed and easy to
  // anchor on), then extract the optional string fields with a relaxed
  // matcher that tolerates unescaped quotes.
  const decisions: DedupeDecision[] = [];
  const decisionRegex =
    /"candidate_index"\s*:\s*(\d+)\s*,\s*"verdict"\s*:\s*"(novel|duplicate)"/g;

  let match: RegExpExecArray | null;
  while ((match = decisionRegex.exec(jsonLike)) !== null) {
    const candidate_index = Number(match[1]);
    const verdict = match[2] as 'novel' | 'duplicate';

    // Look ahead from the verdict match for the slug + reason fields
    // within a reasonable window (~500 chars covers any well-behaved
    // decision object).
    const window = jsonLike.slice(match.index, match.index + 500);

    let duplicate_of_slug: string | null = null;
    const slugMatch = /"duplicate_of_slug"\s*:\s*(?:"([^"]*)"|null)/.exec(window);
    if (slugMatch && slugMatch[1] !== undefined) {
      duplicate_of_slug = slugMatch[1] || null;
    }

    let reason = '';
    // Match "reason": "..." where the value runs until either a closing quote
    // followed by , or }, OR the next decision starts. Lenient — tolerates
    // unescaped quotes inside the reason string.
    const reasonMatch = /"reason"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(window);
    if (reasonMatch) {
      reason = reasonMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
    }

    decisions.push({ candidate_index, verdict, duplicate_of_slug, reason });
  }

  if (decisions.length === 0) return null;
  return { decisions };
}
