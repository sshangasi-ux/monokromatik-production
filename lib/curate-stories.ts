// MonoKromatik AI Story Curation
// Uses Claude API to rank stories by diaspora relevance and filter negative narratives

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { Story } from './rss-feeds';
import { getLearningSignals, describeSignals, type LearningSignals } from './learning-signals';

// IMPORTANT: lazy-initialize the Anthropic client.
//
// Why: when run-agents.ts imports this module, ES module hoisting means
// this file's top-level code (including any `new Anthropic({...})`) runs
// BEFORE run-agents.ts gets to parse .env.local. If we eagerly create the
// client at module load, apiKey resolves to undefined and every call
// fails with: "Could not resolve authentication method."
//
// All other agents (writer, stylist, EIC) lazy-init for this same reason.
// Curator was the lone holdout — caused every CI run to fall back to
// 'recent stories' silently. Fixed 2026-05-11.
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

/**
 * Curate stories using Claude API
 * Ranks stories by diaspora relevance and filters out poverty/negative narratives
 */
export async function curateStories(
  stories: Story[],
  limit: number = 10,
  signals: LearningSignals = getLearningSignals(),
): Promise<Story[]> {
  if (stories.length === 0) {
    console.log('❌ No stories to curate');
    return [];
  }

  console.log(`\n🤖 Curating ${stories.length} stories with Claude AI...\n`);

  // Cap any single outlet at ~30% of a run (min 2) and ask the model to rank a
  // pool LARGER than `limit`, so the diversity pass has lower-ranked stories from
  // other outlets to promote when one source is over-represented.
  const maxPerSource = Math.max(2, Math.ceil(limit * 0.3));
  const poolSize = Math.min(stories.length, Math.max(limit * 2, limit + 6));

  // Prepare story data for Claude (title, source, category, excerpt)
  const storyData = stories.map((story, index) => ({
    index,
    title: story.title,
    source: story.source,
    category: story.category,
    excerpt: story.excerpt?.substring(0, 200) || '',
    hasImage: !!story.imageUrl,
    hasVideo: !!story.videoUrl,
  }));

  // Learned priority hint (soft) — the deterministic re-weight below is the hard guarantee.
  const priorPerf = signals.runs > 0
    ? `\nPRIOR PERFORMANCE (learned from ${signals.runs} past runs — use ONLY as a tiebreaker between similarly relevant stories; never override the filtering rules above): ${describeSignals(signals)}\n`
    : '';

  const prompt = `You are an AI curator for MonoKromatik Network, an African culture/sports/entertainment platform serving the African diaspora.

Your task: Rank these ${stories.length} stories by DIASPORA RELEVANCE and filter out negative narratives.

RANKING CRITERIA (Score 1-10):
1. **Diaspora Appeal** (40%): Does this resonate with Africans abroad missing home?
   - Culture: music, food, fashion, language, traditions
   - Sports: PSL, CAF, African players in Europe
   - Entertainment: Nollywood, Afrobeats, celebrity news
   - Success stories: innovation, achievement, excellence

2. **Positive Framing** (30%): Does this celebrate African excellence?
   - BOOST: Innovation, creativity, achievement, joy
   - AVOID: Poverty porn, conflict, corruption, disease

3. **Engagement Potential** (20%): Will people share this?
   - Trending topics, viral moments, controversies (positive)
   - Visual appeal (stories with images/videos score higher)

4. **Timeliness** (10%): Is this fresh and relevant today?
   - Recent events get priority

FILTERING RULES:
- ❌ REJECT: War, famine, disease outbreaks, extreme poverty, corruption scandals
- ❌ REJECT: Generic African news that Western media already covers
- ✅ ACCEPT: Culture, sports, entertainment, innovation, diaspora connections
${priorPerf}
STORIES TO RANK:
${JSON.stringify(storyData, null, 2)}

OUTPUT FORMAT (JSON only, no explanation):
{
  "curated": [
    {
      "index": 0,
      "score": 9,
      "reasoning": "Burna Boy collaboration - huge diaspora appeal, music, positive"
    },
    {
      "index": 5,
      "score": 8,
      "reasoning": "PSL playoff drama - sports content diaspora loves, engaging"
    }
  ]
}

Return the top ${poolSize} stories ranked by score (highest first).`;

  try {
    const message = await getClient().messages.create({
      model: MODELS.utility,
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from Claude response');
      return enforceSourceDiversity(stories, limit, maxPerSource);
    }

    const result = JSON.parse(jsonMatch[0]);
    const curatedIndexes = result.curated.map((item: { index: number }) => item.index);

    // Ranked pool — the model's relevance order, best first.
    const rankedPool: Story[] = curatedIndexes
      .map((index: number) => stories[index])
      .filter(Boolean);

    // Learning re-weight: tilt the relevance ranking by what actually performed
    // (clamped ×0.6–1.5, so it only breaks near-ties — relevance still leads),
    // then cap per-source concentration down to `limit`.
    const tilted = applyLearningWeight(rankedPool, signals);
    const curatedStories = enforceSourceDiversity(tilted, limit, maxPerSource);

    if (signals.runs > 0) {
      console.log(`🧠 Learning applied (${signals.runs} runs): ${describeSignals(signals) || 'neutral'}`);
    }
    console.log(`✅ Curated ${curatedStories.length} stories (≤${maxPerSource}/source)\n`);

    // Log final selection (post-diversity)
    curatedStories.forEach((story, i) => {
      console.log(`   ${i + 1}. [${story.source}] ${story.title}`);
    });

    return curatedStories;
  } catch (error) {
    console.error('❌ Error during curation:', error instanceof Error ? error.message : 'Unknown error');
    console.log('⚠️  Falling back to recent stories (still source-capped)...');
    return enforceSourceDiversity(stories, limit, maxPerSource);
  }
}

/**
 * Re-order a relevance-ranked pool by learned priority. Each story keeps a base
 * score from its rank (best first), multiplied by its source-trust × category
 * multiplier from the learning ledger. Clamped multipliers mean this only breaks
 * near-ties; strong relevance differences still win. Neutral signals (no learning
 * history) return the input order unchanged — the loop is fail-open.
 */
export function applyLearningWeight(ranked: Story[], signals: LearningSignals): Story[] {
  if (!signals || signals.runs === 0) return ranked;
  const n = ranked.length;
  return ranked
    .map((story, i) => {
      const base = n - i; // rank score, best first
      const st = signals.sourceTrust[(story.source || '').trim().toLowerCase()] ?? 1;
      const cw = signals.categoryWeights[(story.category || '').trim().toLowerCase()] ?? 1;
      return { story, eff: base * st * cw, i };
    })
    .sort((a, b) => b.eff - a.eff || a.i - b.i) // stable: equal scores keep original order
    .map((x) => x.story);
}

/**
 * Per-source concentration cap. Takes stories best-first and returns up to
 * `limit`, allowing at most `maxPerSource` from any single outlet so one
 * prolific feed (historically BellaNaija) can't dominate a run. Ranking order is
 * preserved. If the cap would leave fewer than `limit`, the highest-ranked
 * overflow backfills the remainder — so we never ship short on a slow day, we
 * just prefer diversity when the choice exists.
 */
export function enforceSourceDiversity(ranked: Story[], limit: number, maxPerSource: number): Story[] {
  const perSource = new Map<string, number>();
  const picked: Story[] = [];
  const overflow: Story[] = [];

  for (const story of ranked) {
    const key = (story.source || 'unknown').toLowerCase();
    const count = perSource.get(key) ?? 0;
    if (count < maxPerSource) {
      perSource.set(key, count + 1);
      picked.push(story);
    } else {
      overflow.push(story);
    }
    if (picked.length >= limit) break;
  }

  for (const story of overflow) {
    if (picked.length >= limit) break;
    picked.push(story);
  }

  return picked.slice(0, limit);
}

/**
 * Quick filter for obviously negative stories (pre-filter before Claude)
 */
export function preFilterStories(stories: Story[]): Story[] {
  const negativeKeywords = [
    'war', 'conflict', 'crisis', 'famine', 'poverty', 'corruption',
    'disease outbreak', 'epidemic', 'massacre', 'violence', 'terror'
  ];

  return stories.filter(story => {
    const text = `${story.title} ${story.excerpt}`.toLowerCase();
    const isNegative = negativeKeywords.some(keyword => text.includes(keyword));
    return !isNegative;
  });
}
