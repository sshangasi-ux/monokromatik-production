// MonoKromatik Video Verifier
//
// The media sourcer attaches a video to every article through a priority chain:
// the publisher's own embed (trusted), else a YouTube Data API search match,
// else — historically — a generic Pexels stock clip. The two lower tiers
// attached WITHOUT checking that the video is actually about THIS article. That
// produced real mismatches in production: a Pakistani-TV clip under a South
// African rapper, a drone shot of Abuja under a Ugandan dance-crew story, the
// same stadium B-roll under five different football pieces.
//
// This module is the verification gate. Given an article and a candidate video,
// it (1) fetches the candidate's REAL metadata (title, channel, description) and
// (2) asks a strict Anthropic judge whether that video genuinely matches THIS
// article — reasoning from what the video actually IS, not our headline guess.
//
// Metadata source: by default we read public video metadata straight from the
// YouTube Data API (YOUTUBE_API_KEY) — the same key/endpoint family the sourcer
// already uses for search. Reading a PUBLIC video's title/channel/description
// needs no OAuth and no per-user connection, so this works without any toolkit
// wiring. Composio remains an OPT-IN path: set MONO_COMPOSIO_YT_SLUG to a real
// action slug AND have a connected YouTube account, and we route through Composio's
// governed layer instead. Until then the direct API is used.
//
// FAIL-CLOSED by construction. The product sells accuracy; a wrong video is
// worse than no video. So every uncertain path returns { match: false }:
//   - metadata fetch fails (no key, HTTP error, no such video) -> drop
//   - no ANTHROPIC_API_KEY                                     -> drop
//   - judge errors after retries                               -> drop
//   - judge returns anything but a clear yes                   -> drop
// Only an explicit, grounded "yes" keeps a video.
//
// No secrets here; YOUTUBE_API_KEY / ANTHROPIC_API_KEY / COMPOSIO_API_KEY live
// in the runtime (.env.local locally, GitHub Actions / Vercel env in CI).

import Anthropic from '@anthropic-ai/sdk';
import { Composio } from '@composio/core';
import { MODELS } from './ai-models';
import { withRetry } from './ai-retry';

/** The slice of an article the judge needs to assess relevance. */
export interface VerifiableArticle {
  title: string;
  excerpt: string;
  tags: string[];
  category: string;
}

/** A video the sourcer proposes attaching. */
export interface VideoCandidate {
  /** Canonical watch URL or 11-char YouTube id. */
  url: string;
  /** Where the sourcer got it (for logging only). */
  provider?: string;
}

export interface VerifyResult {
  match: boolean;
  reason: string;
  /** The candidate's real metadata, when we managed to fetch it (for logging). */
  metadata?: { videoTitle?: string; channel?: string; description?: string };
}

/**
 * Composio action slug for YouTube video metadata. OPT-IN: only used when set to
 * a real action slug AND a YouTube account is connected in Composio. Empty (the
 * default) => use the direct YouTube Data API below, which needs no connection.
 * This avoids the 'tool not connected' failure on a fresh Composio account.
 */
const YT_METADATA_SLUG = process.env.MONO_COMPOSIO_YT_SLUG || '';
/** Composio groups actions by a per-user identity; we use a single service user. */
const COMPOSIO_USER_ID = process.env.MONO_COMPOSIO_USER_ID || 'monokromatik-service';

/** Pull the 11-char YouTube video id out of a watch/embed/youtu.be URL or bare id. */
export function youTubeId(idOrUrl: string): string | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(idOrUrl)) return idOrUrl;
  return (
    idOrUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    )?.[1] ?? null
  );
}

let _composio: Composio | null = null;
function composioClient(): Composio | null {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) return null;
  if (!_composio) _composio = new Composio({ apiKey });
  return _composio;
}

/** Best-effort string read from an unknown record under several likely keys. */
function pick(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * Fetch a public YouTube video's metadata directly from the YouTube Data API.
 * Public data — no OAuth, no per-user connection. Uses YOUTUBE_API_KEY, the same
 * key the sourcer's search already relies on. Returns undefined on any failure
 * (missing key, HTTP error, no items, unexpected shape); never throws.
 */
async function fetchYouTubeMetadataDirect(
  videoId: string,
): Promise<{ videoTitle?: string; channel?: string; description?: string } | undefined> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return undefined;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet` +
      `&id=${encodeURIComponent(videoId)}&key=${key}`;
    const res = await withRetry(() => fetch(url, { signal: ctrl.signal }));
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      items?: { snippet?: { title?: string; channelTitle?: string; description?: string } }[];
    };
    const snippet = data.items?.[0]?.snippet;
    if (!snippet) return undefined;
    const videoTitle = snippet.title?.trim() || undefined;
    const channel = snippet.channelTitle?.trim() || undefined;
    const description = snippet.description?.trim()?.slice(0, 800) || undefined;
    if (!videoTitle && !channel && !description) return undefined;
    return { videoTitle, channel, description };
  } catch {
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fetch a YouTube video's real metadata through Composio. Returns undefined on
 * any failure (missing key, unsuccessful call, unexpected shape) — the caller
 * fail-closes to no-match. Never throws.
 */
async function fetchYouTubeMetadataComposio(
  videoId: string,
): Promise<{ videoTitle?: string; channel?: string; description?: string } | undefined> {
  const composio = composioClient();
  if (!composio) return undefined;
  try {
    const res = await withRetry(() =>
      composio.tools.execute(YT_METADATA_SLUG, {
        userId: COMPOSIO_USER_ID,
        arguments: { id: videoId, part: 'snippet' },
      }),
    );
    if (!res?.successful || !res.data) return undefined;

    // The toolkit may return the snippet at the top level or nested under
    // items[0].snippet (raw YouTube Data API shape). Handle both, defensively.
    let data = res.data as Record<string, unknown>;
    const items = data.items;
    if (Array.isArray(items) && items[0] && typeof items[0] === 'object') {
      const snippet = (items[0] as Record<string, unknown>).snippet;
      if (snippet && typeof snippet === 'object') data = snippet as Record<string, unknown>;
    } else if (data.snippet && typeof data.snippet === 'object') {
      data = data.snippet as Record<string, unknown>;
    }

    const videoTitle = pick(data, ['title', 'videoTitle', 'name']);
    const channel = pick(data, ['channelTitle', 'channel', 'channelName', 'author']);
    const description = pick(data, ['description', 'summary']);
    if (!videoTitle && !channel && !description) return undefined;
    return { videoTitle, channel, description: description?.slice(0, 800) };
  } catch {
    return undefined;
  }
}


/**
 * Metadata router: prefer Composio's governed layer ONLY when an action slug is
 * explicitly configured (MONO_COMPOSIO_YT_SLUG) — otherwise use the direct
 * YouTube Data API. Lets us flip to Composio later via env, no code change.
 */
async function fetchMetadata(
  videoId: string,
): Promise<{ videoTitle?: string; channel?: string; description?: string } | undefined> {
  if (YT_METADATA_SLUG) {
    const viaComposio = await fetchYouTubeMetadataComposio(videoId);
    if (viaComposio) return viaComposio;
    // Composio configured but failed — fall back to direct so a misconfig
    // doesn't silently kill all verification.
  }
  return fetchYouTubeMetadataDirect(videoId);
}

interface JudgeVerdict {
  match: boolean;
  reason: string;
}

/** Strip ```json fences and parse the judge's JSON verdict; null on any failure. */
function parseVerdict(text: string): JudgeVerdict | null {
  const clean = text.replace(/```json\s*|\s*```/g, '').trim();
  try {
    const obj = JSON.parse(clean) as Record<string, unknown>;
    if (typeof obj.match === 'boolean' && typeof obj.reason === 'string') {
      return { match: obj.match, reason: obj.reason };
    }
    return null;
  } catch {
    return null;
  }
}

const JUDGE_SYSTEM = `You are a pedantic media fact-checker for an African culture and business publication. Your only job: decide whether a specific YouTube video genuinely belongs alongside a specific article.

The bar is STRICT. A video matches ONLY if it is about the same specific subject as the article — the same artist, song, match, event, person, brand campaign, or work. Same genre is NOT a match. Same country is NOT a match. "Vaguely on theme" is NOT a match.

Drop the video (match:false) if ANY of these hold:
- It is about a different artist/team/person/event than the article, even if same field.
- It is generic stock or B-roll (cityscapes, anonymous crowds, ambient footage).
- The channel or language is unrelated to the subject (e.g. a Pakistani TV channel under a South African rapper; a reaction/compilation channel standing in for the real subject).
- You cannot tell from the metadata what the video actually shows.
- The video is only tangentially related (e.g. "African music mix" under a story about one specific single).

Match (match:true) only when the metadata makes you confident the video depicts the article's actual subject — the artist's own channel for their song, the official anthem video, footage of the exact match or event, the brand's own campaign film.

When uncertain, choose match:false. A wrong video is worse than no video.

Respond with ONLY a JSON object, no prose, no markdown fences:
{"match": <true|false>, "reason": "<one concise sentence>"}`;

/**
 * Verify that a candidate video genuinely matches an article. Fail-closed:
 * returns { match:false } on any missing key, fetch failure, or judge error.
 */
export async function verifyVideoMatch(args: {
  article: VerifiableArticle;
  candidate: VideoCandidate;
}): Promise<VerifyResult> {
  const { article, candidate } = args;

  const videoId = youTubeId(candidate.url);
  if (!videoId) {
    // Non-YouTube candidates (e.g. a publisher Vimeo embed) aren't verifiable
    // through the YouTube toolkit here; the caller decides how to treat those.
    return { match: false, reason: 'not a YouTube video id — cannot verify here' };
  }

  const metadata = await fetchMetadata(videoId);
  if (!metadata) {
    return { match: false, reason: 'could not fetch video metadata (fail-closed)' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { match: false, reason: 'ANTHROPIC_API_KEY not set (fail-closed)', metadata };
  }

  const client = new Anthropic({ apiKey });
  const userPayload = JSON.stringify(
    {
      article: {
        title: article.title,
        excerpt: article.excerpt,
        tags: article.tags,
        category: article.category,
      },
      video: {
        title: metadata.videoTitle ?? '(unknown)',
        channel: metadata.channel ?? '(unknown)',
        description: metadata.description ?? '(none)',
      },
    },
    null,
    2,
  );

  try {
    const res = await withRetry(() =>
      client.messages.create({
        model: MODELS.utility,
        max_tokens: 256,
        system: JUDGE_SYSTEM,
        messages: [{ role: 'user', content: userPayload }],
      }),
    );
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const verdict = parseVerdict(text);
    if (!verdict) {
      return { match: false, reason: 'judge returned unparseable verdict (fail-closed)', metadata };
    }
    return { match: verdict.match, reason: verdict.reason, metadata };
  } catch (err) {
    return {
      match: false,
      reason: `judge error after retries: ${(err as Error).message} (fail-closed)`,
      metadata,
    };
  }
}
