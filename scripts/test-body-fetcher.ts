// Quick smoke test: fetch bodies from a sample of real source URLs
// and report length + first 200 chars so we can see if the scraper works.

import { fetchArticleBody } from '../lib/fetch-article-body';

const TEST_URLS = [
  // BellaNaija — known-good (RSS already gives most of this)
  'https://www.bellanaija.com/2026/05/rema-tyla-2026-fifa-world-cup-opening-ceremony-performers/',
  // Complete Sports — was killed for factual errors, this is the real bottleneck
  'https://www.completesports.com/cafcl-mamelodi-sundowns-claim-narrow-first-leg-victory-over-far-rabat/',
  // NotJustOk — use a real URL from the live RSS
  'https://notjustok.com/songs/albums/stonebwoy-torcher-ii/',
  // SA Hip Hop Mag
  'https://sahiphopmag.co.za/maraza-builds-momentum-for-uno-album-with-explosive-spilli-music-video/',
  // TooXclusive — try the homepage since we know individual articles 404
  'https://tooxclusive.com/',
];

(async () => {
  for (const url of TEST_URLS) {
    console.log(`\n📰 ${url}`);
    const start = Date.now();
    try {
      const body = await fetchArticleBody(url);
      const dur = Date.now() - start;
      if (!body) {
        console.log(`   ❌ No body extracted (${dur}ms)`);
        continue;
      }
      console.log(`   ✅ ${body.length} chars / ${body.split(/\s+/).length} words (${dur}ms)`);
      console.log(`   Preview: ${body.slice(0, 200).replace(/\n/g, ' ')}...`);
    } catch (e: unknown) {
      console.log(`   ❌ Threw: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }
})();
