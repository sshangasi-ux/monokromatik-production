import { NextResponse } from 'next/server';
import { fetchMonoKromatikStories } from '@/lib/fetch-stories';
import { preFilterStories, curateStories } from '@/lib/curate-stories';
import { generateArticles } from '@/lib/generate-article';
import { sourceImage } from '@/lib/source-image';
import { optimizeSEO } from '@/lib/optimize-seo';

// CRON ENDPOINT — Hit by Vercel Cron every few hours.
// This LIGHT pipeline runs Scout → Curator → Writer → Image → SEO,
// then writes to /tmp (Vercel function FS). The HEAVY publish step
// (which needs git push) is handled by GitHub Actions instead.
//
// Result: Vercel Cron keeps the discovery loop hot 24/7, GitHub Actions
// performs the publish. Two-stage agentic system.

export const maxDuration = 300; // 5 minutes (Vercel Hobby limit)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Vercel injects this header on cron requests
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log('🤖 [CRON] Pipeline starting...');

    // 1. Scout
    const stories = await fetchMonoKromatikStories();
    console.log(`📡 Scout: ${stories.length} stories`);

    // 2. Filter
    const filtered = preFilterStories(stories);
    console.log(`🔍 Filtered: ${filtered.length} kept`);

    // 3. Curate (top 3 only — keeps within Vercel 5min budget)
    const curated = await curateStories(filtered, 3);
    console.log(`🎯 Curated: ${curated.length}`);

    // 4. Write
    const articles = await generateArticles(curated.slice(0, 3));
    console.log(`✍️  Wrote: ${articles.length} articles`);

    // 5. Images
    for (const a of articles) {
      // sourceImage now returns { url, source } — we just want the URL.
      // Pass sourceLink so the smart scraper can pull og:image / body images
      // from the original article instead of falling back to stock photos.
      const result = await sourceImage({
        existingUrl: a.imageUrl,
        sourceLink: a.sourceLink,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
      });
      a.imageUrl = result.url;
    }

    // 6. SEO pass
    for (const a of articles) {
      const seo = await optimizeSEO({
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        tags: a.tags,
      });
      if (seo.optimizedSlug) a.slug = seo.optimizedSlug;
      if (seo.metaDescription) a.excerpt = seo.metaDescription;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Trigger GitHub Actions to do the publish step (commits articles.json + pushes)
    if (process.env.GITHUB_DISPATCH_TOKEN && articles.length > 0) {
      try {
        await fetch(
          'https://api.github.com/repos/sshangasi-ux/monokromatik-production/dispatches',
          {
            method: 'POST',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `token ${process.env.GITHUB_DISPATCH_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event_type: 'agent-publish',
              client_payload: { articles, generatedAt: new Date().toISOString() },
            }),
          }
        );
        console.log('🚀 Triggered GitHub Actions publish workflow');
      } catch (e) {
        console.error('GitHub dispatch failed:', e);
      }
    }

    return NextResponse.json({
      ok: true,
      elapsed,
      stats: {
        scouted: stories.length,
        filtered: filtered.length,
        curated: curated.length,
        written: articles.length,
      },
      articles: articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
      })),
    });
  } catch (e) {
    console.error('❌ Cron pipeline failed:', e);
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
