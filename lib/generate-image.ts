// MonoKromatik generative hero art.
//
// When no licensed/scraped/stock photo can be found, *create* an original,
// brand-aligned editorial hero instead of dropping to the static SVG. Original
// generated art (no real people, no logos, no third-party rights) is safe to
// self-host and on-brand.
//
// Provider-agnostic + secret-gated. No key → null, so the existing fallback
// chain is unchanged until configured.
//
//   IMAGE_GEN_API_KEY   required to enable
//   IMAGE_GEN_PROVIDER  'openai' (default) | 'gemini'
//
// openai  — OpenAI-compatible images contract (OpenAI, Together, Fireworks,
//           local gateways). `POST {IMAGE_GEN_API_URL}` → { data:[{ b64_json|url }] }
//     IMAGE_GEN_API_URL  default https://api.openai.com/v1/images/generations
//     IMAGE_GEN_MODEL    default gpt-image-1
//           (Free drop-in: Together — IMAGE_GEN_API_URL=https://api.together.xyz/v1/images/generations,
//            IMAGE_GEN_MODEL=black-forest-labs/FLUX.1-schnell-Free)
//
// gemini  — Google AI Studio native generateContent (Nano Banana). Most
//           generous free tier (~500 img/day, no billing) and you likely
//           already have a key. IMPORTANT: defaults to the free model
//           gemini-2.5-flash-image — do NOT use Pro (no free tier) or 3.1 Flash
//           Image (needs billing).
//     IMAGE_GEN_MODEL    default gemini-2.5-flash-image

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const MEDIA_DIR = join(process.cwd(), 'public', 'article-media');

function provider(): string {
  return (process.env.IMAGE_GEN_PROVIDER || 'openai').toLowerCase();
}

/** A monochrome-with-amber editorial brief — abstract, rights-clean, text-free. */
function buildPrompt(title: string, category: string): string {
  return [
    `Editorial magazine hero artwork for a Black-culture intelligence publication.`,
    `Theme: "${title}" (${category}).`,
    `Style: high-contrast monochrome photography aesthetic with a single warm amber accent,`,
    `cinematic, textured, abstract and conceptual — light, motion, architecture, fabric or landscape.`,
    `Absolutely no text, no words, no logos, no recognisable real people or faces, no watermarks.`,
    `Sophisticated, restrained, gallery-grade composition. 3:2 landscape.`,
  ].join(' ');
}

async function toBuffer(item: { b64_json?: string; url?: string }): Promise<Buffer | null> {
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) {
    const res = await fetch(item.url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }
  return null;
}

/** OpenAI-compatible images endpoint → raw image bytes. */
async function fetchOpenAI(key: string, prompt: string): Promise<Buffer | null> {
  const url = process.env.IMAGE_GEN_API_URL || 'https://api.openai.com/v1/images/generations';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.IMAGE_GEN_MODEL || 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    console.log(`   ✗ image-gen (openai): HTTP ${res.status}`);
    return null;
  }
  const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const first = json.data?.[0];
  return first ? toBuffer(first) : null;
}

/** Google AI Studio (Gemini / Nano Banana) generateContent → raw image bytes. */
async function fetchGemini(key: string, prompt: string): Promise<Buffer | null> {
  const model = process.env.IMAGE_GEN_MODEL || 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    console.log(`   ✗ image-gen (gemini): HTTP ${res.status}`);
    return null;
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string }; inline_data?: { data?: string } }[] } }[];
  };
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const data = p.inlineData?.data ?? p.inline_data?.data;
    if (data) return Buffer.from(data, 'base64');
  }
  console.log('   ✗ image-gen (gemini): no inline image in response');
  return null;
}

/**
 * Generate + self-host an original hero. Returns a same-origin /article-media
 * path, or null if generation is unconfigured or fails (caller keeps its
 * existing fallback). slug seeds a stable filename.
 */
export async function generateHeroImage(args: { title: string; category: string; slug?: string }): Promise<string | null> {
  const key = process.env.IMAGE_GEN_API_KEY;
  if (!key) return null;
  try {
    const prompt = buildPrompt(args.title, args.category);
    const input = provider() === 'gemini' ? await fetchGemini(key, prompt) : await fetchOpenAI(key, prompt);
    if (!input || input.length < 1024) return null;

    const output = await sharp(input)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const base = (args.slug || 'gen').replace(/[^a-z0-9-]+/gi, '-').slice(0, 50).toLowerCase() || 'gen';
    const hash = createHash('sha1').update(args.title).digest('hex').slice(0, 8);
    const filename = `${base}-gen-${hash}.webp`;
    if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true });
    writeFileSync(join(MEDIA_DIR, filename), output);
    console.log(`   🎨 generated hero (${provider()}) → /article-media/${filename}`);
    return `/article-media/${filename}`;
  } catch (e) {
    console.log(`   ✗ image-gen: ${e instanceof Error ? e.message : 'failed'}`);
    return null;
  }
}
