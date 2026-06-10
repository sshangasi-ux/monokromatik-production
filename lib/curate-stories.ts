// MonoKromatik AI Story Curation
// Uses Claude API to rank stories by diaspora relevance and filter negative narratives

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { Story } from './rss-feeds';

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
export async function curateStories(stories: Story[], limit: number = 10): Promise<Story[]> {
  if (stories.length === 0) {
    console.log('❌ No stories to curate');
    return [];
  }

  console.log(`\n🤖 Curating ${stories.length} stories with Claude AI...\n`);

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

Return the top ${limit} stories ranked by score (highest first).`;

  try {
    const message = await getClient().messages.create({
      model: MODELS.utility,
      max_tokens: 2000,
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
      return stories.slice(0, limit);
    }

    const result = JSON.parse(jsonMatch[0]);
    const curatedIndexes = result.curated.map((item: any) => item.index);

    // Return curated stories in ranked order
    const curatedStories = curatedIndexes
      .map((index: number) => stories[index])
      .filter(Boolean);

    console.log(`✅ Curated ${curatedStories.length} stories\n`);
    
    // Log curation reasoning
    result.curated.forEach((item: any, i: number) => {
      console.log(`   ${i + 1}. [Score: ${item.score}] ${stories[item.index].title}`);
      console.log(`      → ${item.reasoning}\n`);
    });

    return curatedStories;
  } catch (error) {
    console.error('❌ Error during curation:', error instanceof Error ? error.message : 'Unknown error');
    console.log('⚠️  Falling back to recent stories...');
    return stories.slice(0, limit);
  }
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
