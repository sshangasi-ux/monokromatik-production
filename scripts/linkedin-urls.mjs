#!/usr/bin/env node
// Print UTM-tagged LinkedIn URLs for manual posting, so hand-posted links attribute
// in GA (editing a live post only tags the in-body text, not the card — bake the
// UTMs in BEFORE posting). Mirrors lib/utm.ts (withUtm).
//
//   node scripts/linkedin-urls.mjs <slug>            # article
//   node scripts/linkedin-urls.mjs <slug> report     # report
//
// Example:
//   node scripts/linkedin-urls.mjs who-bankrolls-south-african-sport

const slug = process.argv[2];
const kind = process.argv[3] === 'report' ? 'reports' : 'article';
if (!slug) {
  console.error('usage: node scripts/linkedin-urls.mjs <slug> [report]');
  process.exit(1);
}
const base = `https://www.monokromatik.com/${kind}/${slug}`;
const tag = (content) => {
  const u = new URL(base);
  u.searchParams.set('utm_source', 'linkedin');
  u.searchParams.set('utm_medium', 'social');
  u.searchParams.set('utm_campaign', slug);
  u.searchParams.set('utm_content', content);
  return u.toString();
};
console.log('personal profile :', tag('personal'));
console.log('MonoKromatik page:', tag('page'));
