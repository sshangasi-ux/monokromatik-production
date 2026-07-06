// MonoKromatik RSS Feed Sources
// A curated set of reputable African + diaspora outlets, spread across region
// and topic so no single publisher dominates the catalogue. Every feed below
// was validated live (HTTP 200 + parseable RSS) on 2026-06-18; dead feeds
// (OkayAfrica, Pulse NG, Goal, KickOff, AllAfrica, GhanaWeb) were removed in the
// same pass. Concentration is additionally capped at curation time
// (enforceSourceDiversity in curate-stories.ts), so a prolific feed like
// BellaNaija contributes as one reputable voice, not the default.

export interface RSSFeed {
  url: string;
  name: string;
  category: 'news' | 'culture' | 'sports' | 'entertainment' | 'music' | 'drinks';
  language: string;
  region: string;
}

export interface Story {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  content?: string;
  excerpt?: string;
  author?: string;

  // Media elements
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'text';

  // Additional metadata
  tags?: string[];
  guid?: string;
}

export const RSS_FEEDS: RSSFeed[] = [
  // ========================================
  // PAN-AFRICAN NEWS & ANALYSIS
  // ========================================
  { url: 'https://www.africanews.com/feed/', name: 'Africanews', category: 'news', language: 'en', region: 'Pan-African' },
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', name: 'BBC Africa', category: 'news', language: 'en', region: 'Pan-African' },
  { url: 'https://www.theafricareport.com/feed/', name: 'The Africa Report', category: 'news', language: 'en', region: 'Pan-African' },

  // ========================================
  // CULTURE & LIFESTYLE
  // ========================================
  { url: 'https://www.bellanaija.com/feed/', name: 'BellaNaija', category: 'culture', language: 'en', region: 'West Africa' },
  { url: 'https://face2faceafrica.com/feed', name: 'Face2Face Africa', category: 'culture', language: 'en', region: 'Pan-African' },

  // ========================================
  // MUSIC & ENTERTAINMENT
  // ========================================
  { url: 'https://www.notjustok.com/feed/', name: 'NotJustOk', category: 'music', language: 'en', region: 'West Africa' },
  { url: 'https://tooxclusive.com/feed/', name: 'TooXclusive', category: 'entertainment', language: 'en', region: 'West Africa' },
  { url: 'https://www.myjoyonline.com/feed/', name: 'MyJoyOnline', category: 'entertainment', language: 'en', region: 'West Africa' },
  { url: 'https://www.sahiphopmag.co.za/feed/', name: 'SA Hip Hop Mag', category: 'music', language: 'en', region: 'Southern Africa' },

  // ========================================
  // SPORTS
  // ========================================
  { url: 'https://feeds.bbci.co.uk/sport/africa/rss.xml', name: 'BBC Sport Africa', category: 'sports', language: 'en', region: 'Pan-African' },
  { url: 'https://www.completesports.com/feed/', name: 'Complete Sports', category: 'sports', language: 'en', region: 'West Africa' },

  // ========================================
  // REGIONAL — NIGERIA / WEST AFRICA
  // ========================================
  { url: 'https://www.premiumtimesng.com/feed', name: 'Premium Times', category: 'news', language: 'en', region: 'West Africa' },
  { url: 'https://punchng.com/feed/', name: 'Punch Nigeria', category: 'news', language: 'en', region: 'West Africa' },
  { url: 'https://www.vanguardngr.com/feed/', name: 'Vanguard Nigeria', category: 'news', language: 'en', region: 'West Africa' },

  // ========================================
  // REGIONAL — SOUTH AFRICA / SOUTHERN AFRICA
  // ========================================
  { url: 'https://www.iol.co.za/rss', name: 'IOL South Africa', category: 'news', language: 'en', region: 'Southern Africa' },
  { url: 'https://mg.co.za/rss/', name: 'Mail & Guardian', category: 'news', language: 'en', region: 'Southern Africa' },
  { url: 'https://www.news24.com/news24/southafrica/rss', name: 'News24 SA', category: 'news', language: 'en', region: 'Southern Africa' },

  // ========================================
  // REGIONAL — KENYA / EAST AFRICA
  // ========================================
  { url: 'https://www.standardmedia.co.ke/rss/headlines.php', name: 'The Standard Kenya', category: 'news', language: 'en', region: 'East Africa' },
  { url: 'https://www.nation.africa/kenya/rss', name: 'Daily Nation Kenya', category: 'news', language: 'en', region: 'East Africa' },

  // ========================================
  // REGIONAL — NORTH AFRICA
  // (Planner v2: closing a previously-unsourced coverage cell.)
  // ========================================
  { url: 'https://www.egyptindependent.com/feed/', name: 'Egypt Independent', category: 'news', language: 'en', region: 'North Africa' },

  // ========================================
  // REGIONAL — CENTRAL AFRICA
  // (Planner v2: the only live Central-Africa feed found is francophone (DRC);
  // the Writer renders in English. Better than zero sourcing for the cell.)
  // ========================================
  { url: 'https://actualite.cd/feed', name: 'Actualite.cd', category: 'news', language: 'fr', region: 'Central Africa' },

  // ========================================
  // DIASPORA
  // (Planner v2: African-diaspora culture, business and commentary.)
  // ========================================
  { url: 'https://afropunk.com/feed/', name: 'AFROPUNK', category: 'culture', language: 'en', region: 'Diaspora' },
  { url: 'https://www.essence.com/feed/', name: 'Essence', category: 'culture', language: 'en', region: 'Diaspora' },
  { url: 'https://atlantablackstar.com/feed/', name: 'Atlanta Black Star', category: 'entertainment', language: 'en', region: 'Diaspora' },
  { url: 'https://www.blackenterprise.com/feed/', name: 'Black Enterprise', category: 'news', language: 'en', region: 'Diaspora' },

  // ========================================
  // DRINKS & SPIRITS — GLOBAL TRADE
  // The world of liquor as a brand-intelligence vertical (African & diaspora
  // spirits going global, global houses entering Africa, the drinks-brand economy).
  // The Curator/EIC keep what carries our lens; the rest is filtered per-story.
  // ========================================
  { url: 'https://www.thespiritsbusiness.com/feed/', name: 'The Spirits Business', category: 'drinks', language: 'en', region: 'Global' },
  { url: 'https://www.thedrinksbusiness.com/feed/', name: 'The Drinks Business', category: 'drinks', language: 'en', region: 'Global' },
  { url: 'https://drinksint.com/feed', name: 'Drinks International', category: 'drinks', language: 'en', region: 'Global' },
  { url: 'https://www.just-drinks.com/feed/', name: 'just-drinks', category: 'drinks', language: 'en', region: 'Global' },
  { url: 'https://drinkabl.media/feed/', name: 'Drinkabl', category: 'drinks', language: 'en', region: 'Global' },

  // ========================================
  // TECH · BUSINESS · TRADE · REGIONAL — the lanes our Index case studies keep
  // coming from (fintech & e-mobility, media M&A, Nollywood/streaming, pan-African
  // music, East Africa) but which the news/culture feeds under-cover. Each added
  // + validated live (HTTP 200 + parseable RSS) on 2026-07-06.
  // ========================================
  { url: 'https://techcabal.com/feed/', name: 'TechCabal', category: 'news', language: 'en', region: 'Pan-African' },
  { url: 'https://restofworld.org/feed/', name: 'Rest of World', category: 'news', language: 'en', region: 'Global' },
  { url: 'https://african.business/feed', name: 'African Business', category: 'news', language: 'en', region: 'Pan-African' },
  { url: 'https://www.theeastafrican.co.ke/rss.xml', name: 'The EastAfrican', category: 'news', language: 'en', region: 'East Africa' },
  { url: 'https://www.musicinafrica.net/feed/', name: 'Music In Africa', category: 'music', language: 'en', region: 'Pan-African' },
  { url: 'https://whatkeptmeup.com/feed/', name: 'What Kept Me Up', category: 'entertainment', language: 'en', region: 'West Africa' },
  { url: 'https://variety.com/feed/', name: 'Variety', category: 'entertainment', language: 'en', region: 'Global' },
];

// Category-based feed filtering
export function getFeedsByCategory(category: string): RSSFeed[] {
  return RSS_FEEDS.filter((feed) => feed.category === category);
}

// Region-based feed filtering
export function getFeedsByRegion(region: string): RSSFeed[] {
  return RSS_FEEDS.filter((feed) => feed.region === region);
}

// The feed set the MonoKromatik pipeline pulls from.
//
// This now returns the WHOLE curated registry — including the reputable
// regional 'news' outlets (Premium Times, Punch, Vanguard, IOL, Mail & Guardian,
// The Standard, etc.), which were previously defined but excluded by a
// category filter, leaving BellaNaija as the only prolific working culture feed.
// Relevance is handled downstream: preFilterStories drops hard-negative news and
// the Claude curator scores each story for culture/sport/entertainment fit, so
// political noise from general-news feeds is filtered per-story rather than by
// excluding the outlet wholesale. Concentration is capped in curateStories.
export function getMonoKromatikFeeds(): RSSFeed[] {
  return RSS_FEEDS;
}
