#!/usr/bin/env node
// Rewrite the long-video descriptions with the full funnel CTA stack
// (article -> The Weekly Signal -> Membership), all UTM-tagged. Preserves
// title/tags/category by fetching each video's current snippet first.
import { google } from 'googleapis';
const o = new google.auth.OAuth2(process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET);
o.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const yt = google.youtube({ version: 'v3', auth: o });
const SITE = 'https://www.monokromatik.com';
const utm = (path, camp) => `${SITE}${path}?utm_source=youtube&utm_medium=video-desc&utm_campaign=${camp}`;

const BLURB = 'MonoKromatik is African & diaspora brand intelligence — who owns, monetizes, and captures the value across African & diaspora culture, business, sport and music. New explainers weekly.';

function desc(hook, slug, hashtags) {
  return `${hook}\n\n` +
    `▸ Full sourced breakdown → ${utm('/article/' + slug, slug)}\n` +
    `▸ Join The Weekly Signal (free) → ${utm('/weekly', slug)}\n` +
    `▸ Go deeper — Membership → ${utm('/membership', slug)}\n\n` +
    `${BLURB}\n\n${hashtags}`;
}

const V = {
  ylX844sno1w: { slug: 'flutterwave-buying-a-bank-fintech-conglomerate-era',
    hook: "Flutterwave was built on the promise of leapfrogging Africa's incumbent banks. Now it's reportedly buying one — inverting its own founding story. So who really captures the upside?",
    hashtags: '#AfricanBusiness #Fintech #Flutterwave #BrandIntelligence #Africa' },
  FwoIsXrISWI: { slug: 'afro-nation-exports-afrobeats-to-the-world-but-who-owns-the-party',
    hook: "Afro Nation turned a Portuguese beach into a global Afrobeats empire — then a US city quietly swapped it out. How thin is festival IP, and who actually owns the party?",
    hashtags: '#Afrobeats #AfroNation #MusicBusiness #WhoOwns #Africa' },
  X547Vj2oEZQ: { slug: 'ethiopia-just-cracked-3-billion-in-coffee-almost-none-of-it-was-roasted',
    hook: "Ethiopia's coffee just earned a record $3 billion — but less than 5% of it leaves roasted. Origin is the moat; brand is the toll booth. Africa keeps digging the moat and letting someone else collect the toll.",
    hashtags: '#Coffee #Ethiopia #ValueCapture #AfricanBusiness #Commodities' },
  j7B4nHH94HM: { slug: 'the-coil-economy-who-authors-black-hair-and-who-cashes-the-cheque',
    hook: "From SheaMoisture to Mielle, Black women authored a multibillion-dollar hair-care category. The multinationals own the margin. Authorship is not equity.",
    hashtags: '#BlackHair #BeautyBusiness #WhoOwns #BrandIntelligence #Diaspora' },
  '-oNXRbP0E-s': { slug: 'africa-nation-branding-arms-race-2026-africa-brand-index',
    hook: "Kenya, Uganda, Nigeria and South Africa are all selling the same young-creative-open story — just as the continent gets its first brand index. When every nation's pitch converges, who actually owns a story that's distinct?",
    hashtags: '#NationBranding #Africa #BrandStrategy #Tourism #BrandIntelligence' },
  ZnSJX2lA0U0: { slug: 'premier-league-2026-27-brand-reset-who-owns-african-footballs-upside',
    hook: "The 2026/27 Premier League is the most African ever — elite talent and roughly 300 million African viewers. Yet the value flows out. Who owns the upside of African football?",
    hashtags: '#PremierLeague #AfricanFootball #SportsBusiness #ValueCapture #Africa' },
};

// Trailer: no single article -> route to /watch, /weekly, /membership
const TRAILER = { id: 'jzhnsnGP0WM',
  text: `Africa creates the culture. Someone else keeps the money.\n\n` +
    `▸ Watch all explainers → ${utm('/watch', 'trailer')}\n` +
    `▸ Join The Weekly Signal (free) → ${utm('/weekly', 'trailer')}\n` +
    `▸ Go deeper — Membership → ${utm('/membership', 'trailer')}\n\n${BLURB}\n\n#AfricanBusiness #BrandIntelligence #Africa #Afrobeats #ValueCapture` };

async function setDesc(id, description) {
  const cur = await yt.videos.list({ part: ['snippet'], id: [id] });
  const s = cur.data.items[0].snippet;
  await yt.videos.update({ part: ['snippet'], requestBody: { id, snippet: {
    title: s.title, description, tags: s.tags || [], categoryId: s.categoryId, defaultLanguage: s.defaultLanguage || 'en' } } });
  console.log('✓', s.title.slice(0, 50));
}

(async () => {
  for (const [id, m] of Object.entries(V)) await setDesc(id, desc(m.hook, m.slug, m.hashtags));
  await setDesc(TRAILER.id, TRAILER.text);
  console.log('DONE');
})().catch(e => { console.error('ERR', e?.response?.data ? JSON.stringify(e.response.data) : e.message); process.exit(1); });
