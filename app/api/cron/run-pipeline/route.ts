import { NextResponse } from 'next/server';
import { fetchMonoKromatikStories } from '@/lib/fetch-stories';
import { preFilterStories, curateStories } from '@/lib/curate-stories';
import { generateArticles } from '@/lib/generate-article';
import { sourceImage } from '@/lib/source-image';
import { optimizeSEO } from '@/lib/optimize-seo';
import { reviewBatch } from '@/lib/editor-in-chief';
import { sendDigest } from '@/lib/eic-digest';

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

    // 5b. Editor-in-Chief — last gate before SEO/publish.
    // Reviews each article on six dimensions and kills the weak ones.
    // Killed pitches are bundled into a digest email to the operator.
    console.log('📝 EIC: reviewing articles...');
    const reviewed = await reviewBatch(articles, { concurrency: 3 });
    const approved = reviewed.filter((r) => r.review.verdict === 'approved');
    const killed = reviewed.filter((r) => r.review.verdict === 'killed');
    console.log(`📝 EIC: ${approved.length} approved, ${killed.length} killed`);

    // Fire-and-forget the digest email (non-blocking).
    if (reviewed.length > 0) {
      sendDigest({
        killed,
        approved,
        runAt: new Date().toISOString(),
      }).catch((err) => console.error('EIC digest send failed:', err));
    }

    if (approved.length === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('⚠️  EIC killed every article. Nothing to publish.');
      return NextResponse.json({
        ok: true,
        elapsed,
        stats: {
          scouted: stories.length,
          filtered: filtered.length,
          curated: curated.length,
          written: articles.length,
          eicKilled: killed.length,
          eicApproved: 0,
        },
        articles: [],
      });
    }

    // From here on, only EIC-approved articles continue. Replace the
    // articles array so SEO + dispatch only see what we're shipping.
    // Re-attach the imageUrl from the original (the ReviewedArticle type
    // doesn't carry the original GeneratedArticle's full shape).
    const approvedTitles = new Set(approved.map((r) => r.title));
    const articlesApproved = articles.filter((a) => approvedTitles.has(a.title));
    // Splice in EIC-rewritten title/excerpt/content where the EIC adjusted them
    // (EIC currently doesn't rewrite; it only judges — but if it ever does,
    // this loop carries the changes through).
    for (let i = 0; i < articlesApproved.length; i++) {
      const r = approved.find((x) => x.title === articlesApproved[i].title);
      if (r) {
        articlesApproved[i].title = r.title;
        articlesApproved[i].excerpt = r.excerpt;
        articlesApproved[i].content = r.content;
      }
    }

    // 6. SEO pass
    for (const a of articlesApproved) {
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
    if (process.env.GITHUB_DISPATCH_TOKEN && articlesApproved.length > 0) {
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
              client_payload: {
                articles: articlesApproved,
                generatedAt: new Date().toISOString(),
              },
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
        eicKilled: killed.length,
        eicApproved: approved.length,
      },
      articles: articlesApproved.map((a) => ({
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
