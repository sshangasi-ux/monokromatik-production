// MonoKromatik Image Sourcer Agent
// Strategy: prefer source RSS image, then Unsplash, then Pexels. All royalty-free.
// Uses Claude to generate strong search keywords from article content.

import Anthropic from '@anthropic-ai/sdk';

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY; // free at unsplash.com/developers
const PEXELS_KEY = process.env.PEXELS_API_KEY;        // free at pexels.com/api

const FALLBACK =
  'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=1600&h=900&fit=crop';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Use Claude to generate a high-quality image search query from title + excerpt.
 * Better than dumb keyword extraction — pulls out the visual concept.
 */
async function buildImageQuery(title: string, excerpt: string, category: string): Promise<string> {
  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Article title: "${title}"
Excerpt: "${excerpt}"
Category: ${category}

Generate a 2-5 word image search query that would find a strong, editorial-style photo for this article on Unsplash. Focus on the visual subject (people, place, object, mood). Avoid named individuals (rights issues). Reply with the query only, no quotes.`,
        },
      ],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    return text || category;
  } catch {
    return category;
  }
}

async function tryUnsplash(query: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null;
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

async function tryPexels(query: string): Promise<string | null> {
  if (!PEXELS_KEY) return null;
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j.photos?.[0]?.src?.large ?? null;
  } catch {
    return null;
  }
}

/**
 * Source an image. Returns the existing URL if present, else searches.
 */
export async function sourceImage(args: {
  existingUrl?: string;
  title: string;
  excerpt: string;
  category: string;
}): Promise<string> {
  if (args.existingUrl && args.existingUrl.startsWith('http')) {
    return args.existingUrl;
  }

  const query = await buildImageQuery(args.title, args.excerpt, args.category);
  console.log(`   🖼️  Searching for image: "${query}"`);

  return (
    (await tryUnsplash(query)) ||
    (await tryPexels(query)) ||
    (await tryUnsplash(args.category)) ||
    FALLBACK
  );
}
