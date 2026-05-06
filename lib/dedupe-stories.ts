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

    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      decisions: Array<{
        candidate_index: number;
        verdict: 'novel' | 'duplicate';
        duplicate_of_slug: string | null;
        reason: string;
      }>;
    };

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
