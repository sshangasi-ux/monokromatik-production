// MonoKromatik Distribution Agent
// Generates ready-to-post Twitter threads + Instagram captions.
// Saves to output/social-queue.json so a human (or future Buffer integration) can post.

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { GeneratedArticle } from './generate-article';

interface SocialPost {
  articleSlug: string;
  articleUrl: string;
  twitterThread: string[];   // 4-7 tweets, each ≤280 chars
  instagramCaption: string;  // up to 2200 chars
  hashtags: string[];        // 5-10 strategic hashtags
  postAt: string;            // suggested datetime
  status: 'queued' | 'posted' | 'skipped';
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const QUEUE_PATH = join(process.cwd(), 'output', 'social-queue.json');

export async function generateSocial(article: GeneratedArticle): Promise<SocialPost> {
  const url = `https://www.monokromatik.com/article/${article.slug}`;

  const prompt = `You are MonoKromatik's social media editor. Voice: insider, energetic, diaspora-first.

Article: ${article.title}
Excerpt: ${article.excerpt}
Tags: ${article.tags.join(', ')}
URL: ${url}

Generate:
1. Twitter THREAD: 4-7 tweets. First tweet hooks (no link). Last tweet has link. Each ≤280 chars including spaces. Use line breaks for readability. NO emojis except sparingly.
2. Instagram caption: 800-1500 chars. Hook in first line. Story arc. End with CTA ("Read the full piece — link in bio").
3. 5-10 hashtags mixing branded (#MonoKromatik) + niche (#Afrobeats #PSL) + broad (#AfricanCulture).

Return JSON ONLY:
{
  "twitterThread": ["tweet 1", "tweet 2", "..."],
  "instagramCaption": "...",
  "hashtags": ["#tag1", "#tag2"]
}`;

  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const json = text.match(/\{[\s\S]*\}/);
    if (!json) throw new Error('No JSON in social response');

    const parsed = JSON.parse(json[0]);

    // Schedule for next 9am or 3pm SAST window
    const now = new Date();
    const post = new Date(now);
    post.setHours(post.getHours() < 9 ? 9 : post.getHours() < 15 ? 15 : 9, 0, 0, 0);
    if (post < now) post.setDate(post.getDate() + 1);

    return {
      articleSlug: article.slug,
      articleUrl: url,
      twitterThread: parsed.twitterThread || [],
      instagramCaption: parsed.instagramCaption || '',
      hashtags: parsed.hashtags || [],
      postAt: post.toISOString(),
      status: 'queued',
    };
  } catch (e) {
    console.error('   ⚠️  Social gen failed for:', article.title, e);
    return {
      articleSlug: article.slug,
      articleUrl: url,
      twitterThread: [`${article.title}\n\n${url}`],
      instagramCaption: `${article.excerpt}\n\nRead more — link in bio.`,
      hashtags: ['#MonoKromatik', `#${article.category}`, '#AfricanCulture'],
      postAt: new Date().toISOString(),
      status: 'queued',
    };
  }
}

/**
 * Add a post to the queue (persisted JSON file)
 */
export function queuePost(post: SocialPost): void {
  let queue: SocialPost[] = [];
  if (existsSync(QUEUE_PATH)) {
    queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
  }
  if (queue.find((p) => p.articleSlug === post.articleSlug)) return;
  queue.push(post);
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

export async function distributeArticles(articles: GeneratedArticle[]): Promise<SocialPost[]> {
  const posts: SocialPost[] = [];
  for (const a of articles) {
    const p = await generateSocial(a);
    queuePost(p);
    posts.push(p);
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(`   📤 Queued ${posts.length} social posts → ${QUEUE_PATH}`);
  return posts;
}
