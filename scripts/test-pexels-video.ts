// Diagnose Pexels stock-media sourcing. Run where the key exists:
//   PEXELS_API_KEY=xxxxx npx tsx scripts/test-pexels-video.ts "football stadium crowd"
//
// Tells you definitively: is the key valid (200 vs 401), do photos AND videos
// exist for the query, and what mp4 sizes/links the video API returns — which
// is exactly what the pipeline's stock-video step consumes.

const key = process.env.PEXELS_API_KEY;
const query = process.argv[2] || 'african culture city';

async function hit(label: string, url: string) {
  try {
    const res = await fetch(url, { headers: { Authorization: key as string } });
    const body = await res.text();
    console.log(`\n${label}: HTTP ${res.status}${res.status === 401 ? '  ← key rejected' : ''}`);
    let json: any;
    try {
      json = JSON.parse(body);
    } catch {
      console.log('  (non-JSON body):', body.slice(0, 200));
      return;
    }
    const items = json.photos || json.videos || [];
    console.log(`  total_results: ${json.total_results ?? '?'} | items returned: ${items.length}`);
    const v = (json.videos || [])[0];
    if (v) {
      const mp4s = (v.video_files || []).filter((f: any) => (f.file_type || '').includes('mp4'));
      console.log('  first video mp4 files:', mp4s.map((f: any) => `${f.width}x${f.height}`).join(', ') || '(none)');
      console.log('  sample link:', mp4s[0]?.link || '(none)');
    }
  } catch (err) {
    console.log(`${label}: request failed — ${(err as Error).message}`);
  }
}

async function main() {
  if (!key) {
    console.error('❌ PEXELS_API_KEY is not set. export it and re-run.');
    process.exit(1);
  }
  console.log(`Querying Pexels for: "${query}"`);
  await hit('PHOTOS  ', `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`);
  await hit('VIDEOS  ', `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`);
  console.log('\nIf VIDEOS shows HTTP 200 with items and an mp4 link, sourcing works — re-run the backfill.');
  console.log('If HTTP 401, the PEXELS_API_KEY secret is wrong/empty. If 0 items, try a broader query.');
}

main();
