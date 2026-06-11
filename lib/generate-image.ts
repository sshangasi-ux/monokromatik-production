// MonoKromatik generative hero art.
//
// When no licensed/scraped/stock photo can be found, *create* an original,
// brand-aligned editorial hero instead of dropping to the static SVG. Original
// generated art (no real people, no logos, no third-party rights) is safe to
// self-host and on-brand.
//
// Provider-agnostic + secret-gated. Targets the OpenAI-compatible images
// contract (`POST {IMAGE_GEN_API_URL}` → { data: [{ b64_json | url }] }), which
// OpenAI, Together, Fireworks, and local gateways all implement. No key → null,
// so the existing fallback chain is unchanged until configured.
//
//   IMAGE_GEN_API_KEY   required to enable
//   IMAGE_GEN_API_URL   default https://api.openai.com/v1/images/generations
//   IMAGE_GEN_MODEL     default gpt-image-1

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const MEDIA_DIR = join(process.cwd(), 'public', 'article-media');

function endpoint(): string {
  return process.env.IMAGE_GEN_API_URL || 'https://api.openai.com/v1/images/generations';
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

/**
 * Generate + self-host an original hero. Returns a same-origin /article-media
 * path, or null if generation is unconfigured or fails (caller keeps its
 * existing fallback). slug seeds a stable filename.
 */
export async function generateHeroImage(args: { title: string; category: string; slug?: string }): Promise<string | null> {
  const key = process.env.IMAGE_GEN_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.IMAGE_GEN_MODEL || 'gpt-image-1',
        prompt: buildPrompt(args.title, args.category),
        n: 1,
        size: '1536x1024',
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      console.log(`   ✗ image-gen: HTTP ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const first = json.data?.[0];
    if (!first) return null;
    const input = await toBuffer(first);
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
    console.log(`   🎨 generated hero → /article-media/${filename}`);
    return `/article-media/${filename}`;
  } catch (e) {
    console.log(`   ✗ image-gen: ${e instanceof Error ? e.message : 'failed'}`);
    return null;
  }
}
