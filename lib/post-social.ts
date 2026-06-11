// MonoKromatik social posting layer.
//
// Provider-agnostic and secret-gated — like the media stock providers, every
// path no-ops cleanly when its secret is absent, so the pipeline never breaks
// for an unconfigured channel. Two delivery paths:
//
//   1. SOCIAL_WEBHOOK_URL — universal. POSTs the structured post to a user
//      automation (Zapier / Make / Buffer / n8n) that fans out to X, LinkedIn,
//      Instagram, etc. This is the recommended path: no per-platform OAuth here.
//   2. X (Twitter) API v2 direct — if X_ACCESS_TOKEN (OAuth2 user context with
//      tweet.write) is set, posts the thread natively, chaining replies.
//
// dryRun returns what *would* be sent without calling any network.

export interface SocialPostPayload {
  articleSlug: string;
  articleUrl: string;
  twitterThread: string[];
  instagramCaption: string;
  hashtags: string[];
}

export interface DeliveryResult {
  channel: 'webhook' | 'x' | 'none';
  ok: boolean;
  detail: string;
}

const X_API = 'https://api.twitter.com/2/tweets';

/** Which channels are configured right now. */
export function configuredChannels(): string[] {
  const channels: string[] = [];
  if (process.env.SOCIAL_WEBHOOK_URL) channels.push('webhook');
  if (process.env.X_ACCESS_TOKEN) channels.push('x');
  return channels;
}

async function deliverWebhook(post: SocialPostPayload): Promise<DeliveryResult> {
  const url = process.env.SOCIAL_WEBHOOK_URL;
  if (!url) return { channel: 'none', ok: false, detail: 'SOCIAL_WEBHOOK_URL unset' };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'monokromatik', ...post }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return { channel: 'webhook', ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { channel: 'webhook', ok: false, detail: e instanceof Error ? e.message : 'failed' };
  }
}

async function postTweet(text: string, replyTo?: string): Promise<string | null> {
  const token = process.env.X_ACCESS_TOKEN;
  if (!token) return null;
  const body: Record<string, unknown> = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(X_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { id?: string } };
    return json.data?.id ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function deliverX(post: SocialPostPayload): Promise<DeliveryResult> {
  if (!process.env.X_ACCESS_TOKEN) return { channel: 'none', ok: false, detail: 'X_ACCESS_TOKEN unset' };
  let replyTo: string | undefined;
  let posted = 0;
  for (const tweet of post.twitterThread) {
    const id = await postTweet(tweet, replyTo);
    if (!id) return { channel: 'x', ok: false, detail: `failed after ${posted} tweet(s)` };
    replyTo = id;
    posted++;
    await new Promise((r) => setTimeout(r, 1200));
  }
  return { channel: 'x', ok: true, detail: `posted ${posted}-tweet thread` };
}

/**
 * Deliver one post across every configured channel. Returns a result per
 * channel; in dryRun mode nothing is sent and the configured channels are
 * reported as planned.
 */
export async function deliverPost(post: SocialPostPayload, dryRun: boolean): Promise<DeliveryResult[]> {
  const channels = configuredChannels();
  if (channels.length === 0) return [{ channel: 'none', ok: false, detail: 'no channels configured' }];
  if (dryRun) return channels.map((c) => ({ channel: c as DeliveryResult['channel'], ok: true, detail: 'dry-run (not sent)' }));

  const results: DeliveryResult[] = [];
  if (process.env.SOCIAL_WEBHOOK_URL) results.push(await deliverWebhook(post));
  if (process.env.X_ACCESS_TOKEN) results.push(await deliverX(post));
  return results;
}
