import { getAllArticles } from '../../lib/articles';

const SITE = 'https://www.monokromatik.com';

export const revalidate = 300; // Re-generate every 5 minutes

export async function GET() {
  const articles = getAllArticles()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 50);

  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const items = articles
    .map(
      (a) => `
    <item>
      <title>${escape(a.title)}</title>
      <link>${SITE}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE}/article/${a.slug}</guid>
      <description>${escape(a.excerpt)}</description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category>${escape(a.category)}</category>
      <source url="${escape(a.sourceLink)}">${escape(a.sourceName)}</source>
      ${a.imageUrl ? `<enclosure url="${escape(a.imageUrl)}" type="image/jpeg" />` : ''}
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MonoKromatik Network</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>African Stories BBC Won't Tell You. AI-curated culture, sports, and entertainment for the diaspora.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>MonoKromatik Agent Pipeline</generator>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
