// MonoKromatik SEO Optimizer Agent
// Improves slug, meta description, and headline variants for max click-through.

import Anthropic from '@anthropic-ai/sdk';

interface SEOInput {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
}

interface SEOOutput {
  optimizedTitle: string;
  metaDescription: string;
  optimizedSlug: string;
  headlineVariants: string[];
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function optimizeSEO(input: SEOInput): Promise<SEOOutput> {
  const prompt = `You are MonoKromatik's SEO optimizer. Optimize this article for search + social click-through while keeping the brand voice (energetic, insider, diaspora-first, never clickbait-thirsty).

ARTICLE:
Title: ${input.title}
Excerpt: ${input.excerpt}
Category: ${input.category}
Tags: ${input.tags.join(', ')}
Content (first 800 chars): ${input.content.substring(0, 800)}

OPTIMIZATION RULES:
- Title: 55-65 chars, front-load the key entity (artist/event/topic), make someone in London/NYC stop scrolling
- Meta description: 145-155 chars, must include the primary keyword, ends with a clear hook
- Slug: kebab-case, ≤60 chars, no stopwords, keyword-front
- Generate 3 headline variants for A/B testing — different angles (curiosity, authority, emotion)

Return JSON ONLY:
{
  "optimizedTitle": "...",
  "metaDescription": "...",
  "optimizedSlug": "...",
  "headlineVariants": ["variant1", "variant2", "variant3"]
}`;

  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const json = text.match(/\{[\s\S]*\}/);
    if (!json) throw new Error('No JSON in SEO response');

    return JSON.parse(json[0]) as SEOOutput;
  } catch (error) {
    console.error('   ⚠️  SEO optimizer fell back to defaults:', error);
    // Graceful fallback — never block publish on SEO failures
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 60);
    return {
      optimizedTitle: input.title,
      metaDescription: input.excerpt.substring(0, 155),
      optimizedSlug: slug,
      headlineVariants: [input.title],
    };
  }
}
