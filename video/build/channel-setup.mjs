#!/usr/bin/env node
// One-shot MonoKromatik YouTube channel setup: brand identity, enriched video
// metadata, and a series-playlist architecture. Needs the `youtube` scope.
import { google } from 'googleapis';
const o = new google.auth.OAuth2(process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET);
o.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const yt = google.youtube({ version: 'v3', auth: o });
const SITE = 'https://www.monokromatik.com';

const ABOUT = `MonoKromatik is African & diaspora brand intelligence — we break down who owns, monetizes, and captures the value in African and diaspora culture, business, sport, music and consumer markets.

Every video is a short, deeply-sourced editorial explainer, tied to a full research article at monokromatik.com. Motion-graphics storytelling, on-screen citations, one clear thesis. New explainers weekly.

If you want to understand the money and the power behind African & diaspora culture — subscribe.

▸ Read the research → ${SITE}`;

const KEYWORDS = ['African business','brand intelligence','Africa economy explained','diaspora business',
  'Afrobeats business','African fintech','value capture','who owns','African brands','creative economy',
  'sports business Africa','editorial explainer','Africa'].map(k => k.includes(' ') ? `"${k}"` : k).join(' ');

function desc(hook, slug, hashtags) {
  return `${hook}

▸ Full sourced breakdown → ${SITE}/article/${slug}
Every figure is cited on-screen and linked in the piece.

MonoKromatik is African & diaspora brand intelligence — who owns, monetizes, and captures the value in African & diaspora culture, business, sport and music. New explainers weekly.

▸ Read more & subscribe → ${SITE}

${hashtags}`;
}

// videoId -> full metadata
const V = {
  ylX844sno1w: { title: 'Flutterwave Is Buying a Bank. That Was Never the Story It Sold.',
    slug: 'flutterwave-buying-a-bank-fintech-conglomerate-era',
    hook: "Flutterwave was built on the promise of leapfrogging Africa's incumbent banks. Now it's reportedly buying one — inverting its own founding story. So who really captures the upside?",
    tags: ['african business','african fintech','flutterwave','fintech','banking','payments','brand strategy','value capture','who owns','mergers and acquisitions','africa economy','moniepoint'],
    hashtags: '#AfricanBusiness #Fintech #Flutterwave #BrandIntelligence #Africa' },
  FwoIsXrISWI: { title: 'Afro Nation Exports Afrobeats to the World. But Who Owns the Party?',
    slug: 'afro-nation-exports-afrobeats-to-the-world-but-who-owns-the-party',
    hook: "Afro Nation turned a Portuguese beach into a global Afrobeats empire — then a US city quietly swapped it out. How thin is festival IP, and who actually owns the party?",
    tags: ['afrobeats','afro nation','music business','amapiano','festivals','diaspora','who owns','value capture','african music','spotify royalties','detroit','portugal'],
    hashtags: '#Afrobeats #AfroNation #MusicBusiness #WhoOwns #Africa' },
  X547Vj2oEZQ: { title: 'Ethiopia Just Cracked $3 Billion in Coffee. Almost None of It Was Roasted.',
    slug: 'ethiopia-just-cracked-3-billion-in-coffee-almost-none-of-it-was-roasted',
    hook: "Ethiopia's coffee just earned a record $3 billion — but less than 5% of it leaves roasted. Origin is the moat; brand is the toll booth. Africa keeps digging the moat and letting someone else collect the toll.",
    tags: ['ethiopia coffee','coffee','commodities','value addition','value capture','african trade','who owns','africa economy','kenya','rwanda','specialty coffee','brand intelligence'],
    hashtags: '#Coffee #Ethiopia #ValueCapture #AfricanBusiness #Commodities' },
  j7B4nHH94HM: { title: 'The Coil Economy: Who Authors Black Hair, and Who Cashes the Cheque',
    slug: 'the-coil-economy-who-authors-black-hair-and-who-cashes-the-cheque',
    hook: "From SheaMoisture to Mielle, Black women authored a multibillion-dollar hair-care category. The multinationals own the margin. Authorship is not equity.",
    tags: ['black hair economy','haircare','natural hair','sheamoisture','mielle','cantu','consumer brands','who owns','value capture','black-owned','south africa','beauty business'],
    hashtags: '#BlackHair #BeautyBusiness #WhoOwns #BrandIntelligence #Diaspora' },
  '-oNXRbP0E-s': { title: 'Everyone Is Selling the Same Africa: The 2026 Nation-Branding Arms Race Meets Its First Index',
    slug: 'africa-nation-branding-arms-race-2026-africa-brand-index',
    hook: "Kenya, Uganda, Nigeria and South Africa are all selling the same young-creative-open story — just as the continent gets its first brand index. When every nation's pitch converges, who actually owns a story that's distinct?",
    tags: ['nation branding','africa brand index','kenya','uganda','nigeria','south africa','tourism','creative economy','diaspora','brand strategy','africa economy','soft power'],
    hashtags: '#NationBranding #Africa #BrandStrategy #Tourism #BrandIntelligence' },
  ZnSJX2lA0U0: { title: 'The Premier League Is More African Than Ever. Africa Still Owns None of the Upside.',
    slug: 'premier-league-2026-27-brand-reset-who-owns-african-footballs-upside',
    hook: "The 2026/27 Premier League is the most African ever — elite talent and roughly 300 million African viewers. Yet the value flows out. Who owns the upside of African football?",
    tags: ['premier league','african football','sports business','sponsorship','value capture','who owns','diaspora','supersport','football economics','africa','brand strategy','betting ban'],
    hashtags: '#PremierLeague #AfricanFootball #SportsBusiness #ValueCapture #Africa' },
};

// Playlists: title -> {description, videos[] in order}
const PLAYLISTS = [
  { title: 'How the Money Works: Africa',
    description: 'The flagship series. Short, deeply-sourced explainers on who owns, monetizes and captures the value across African & diaspora business and culture. New episodes weekly at monokromatik.com.',
    videos: ['ylX844sno1w','FwoIsXrISWI','X547Vj2oEZQ','j7B4nHH94HM','-oNXRbP0E-s','ZnSJX2lA0U0'] },
  { title: 'Who Owns the Culture',
    description: 'Music, beauty and festivals — who authors the culture, and who cashes the cheque. African & diaspora brand intelligence from MonoKromatik.',
    videos: ['j7B4nHH94HM','FwoIsXrISWI'] },
  { title: "Africa's Brand Playbook",
    description: 'Nation-branding, fintech and corporate strategy — how African brands and states build (and capture) value. From MonoKromatik.',
    videos: ['ylX844sno1w','-oNXRbP0E-s'] },
  { title: 'The Value Chain: From Origin to Upside',
    description: 'Commodities, trade and sport — where African value is created, and where it leaves the continent. From MonoKromatik.',
    videos: ['X547Vj2oEZQ','ZnSJX2lA0U0'] },
];

(async () => {
  // 1) Channel branding
  const cur = await yt.channels.list({ part: ['brandingSettings','snippet'], mine: true });
  const c = cur.data.items[0];
  await yt.channels.update({ part: ['brandingSettings'], requestBody: { id: c.id,
    brandingSettings: { channel: {
      title: 'MonoKromatik Network',
      description: ABOUT,
      keywords: KEYWORDS,
      country: 'ZA',
      unsubscribedTrailer: 'ylX844sno1w',
    } } } });
  console.log('✓ channel branding updated (About, keywords, country=ZA, trailer=Flutterwave)');

  // 2) Video metadata
  for (const [id, m] of Object.entries(V)) {
    await yt.videos.update({ part: ['snippet'], requestBody: { id,
      snippet: { title: m.title, description: desc(m.hook, m.slug, m.hashtags),
        tags: m.tags, categoryId: '27', defaultLanguage: 'en' } } });
    console.log('✓ video updated:', m.title.slice(0, 48));
  }

  // 3) Playlists (create + populate)
  const existing = await yt.playlists.list({ part: ['snippet'], mine: true, maxResults: 25 });
  const have = new Map(existing.data.items.map(p => [p.snippet.title, p.id]));
  for (const pl of PLAYLISTS) {
    let pid = have.get(pl.title);
    if (!pid) {
      const r = await yt.playlists.insert({ part: ['snippet','status'], requestBody: {
        snippet: { title: pl.title, description: pl.description, defaultLanguage: 'en' },
        status: { privacyStatus: 'public' } } });
      pid = r.data.id;
      console.log('✓ playlist created:', pl.title, pid);
    } else { console.log('• playlist exists:', pl.title, pid); }
    for (const vid of pl.videos) {
      try {
        await yt.playlistItems.insert({ part: ['snippet'], requestBody: {
          snippet: { playlistId: pid, resourceId: { kind: 'youtube#video', videoId: vid } } } });
      } catch (e) { console.log('  ! add', vid, 'to', pl.title, '—', e?.message); }
    }
    console.log('  added', pl.videos.length, 'videos');
  }
  console.log('\nDONE.');
})().catch(e => { console.error('ERR', e?.response?.data ? JSON.stringify(e.response.data) : e.message); process.exit(1); });
