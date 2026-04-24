// MonoKromatik RSS Feed Sources
// Comprehensive African media sources with media support

export interface RSSFeed {
  url: string;
  name: string;
  category: 'news' | 'culture' | 'sports' | 'entertainment' | 'music';
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
  // AFRICAN NEWS (General)
  // ========================================
  {
    url: 'https://www.africanews.com/feed/',
    name: 'Africanews',
    category: 'news',
    language: 'en',
    region: 'Pan-African'
  },
  {
    url: 'https://allafrica.com/tools/headlines/rdf/latest/',
    name: 'AllAfrica',
    category: 'news',
    language: 'en',
    region: 'Pan-African'
  },
  {
    url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
    name: 'BBC Africa',
    category: 'news',
    language: 'en',
    region: 'Pan-African'
  },
  
  // ========================================
  // CULTURE & LIFESTYLE
  // ========================================
  {
    url: 'https://www.okayafrica.com/feed/',
    name: 'OkayAfrica',
    category: 'culture',
    language: 'en',
    region: 'Pan-African'
  },
  {
    url: 'https://face2faceafrica.com/feed',
    name: 'Face2Face Africa',
    category: 'culture',
    language: 'en',
    region: 'Pan-African'
  },
  {
    url: 'https://www.bellanaija.com/feed/',
    name: 'BellaNaija',
    category: 'culture',
    language: 'en',
    region: 'West Africa'
  },
  
  // ========================================
  // MUSIC & ENTERTAINMENT
  // ========================================
  {
    url: 'https://www.notjustok.com/feed/',
    name: 'NotJustOk',
    category: 'music',
    language: 'en',
    region: 'West Africa'
  },
  {
    url: 'https://tooxclusive.com/feed/',
    name: 'TooXclusive',
    category: 'entertainment',
    language: 'en',
    region: 'West Africa'
  },
  {
    url: 'https://www.pulse.ng/rss',
    name: 'Pulse Nigeria',
    category: 'entertainment',
    language: 'en',
    region: 'West Africa'
  },
  {
    url: 'https://www.sahiphopmag.co.za/feed/',
    name: 'SA Hip Hop Mag',
    category: 'music',
    language: 'en',
    region: 'Southern Africa'
  },
  
  // ========================================
  // SPORTS
  // ========================================
  {
    url: 'https://www.goal.com/en-za/feeds/news',
    name: 'Goal Africa',
    category: 'sports',
    language: 'en',
    region: 'Southern Africa'
  },
  {
    url: 'https://www.kickoff.com/feed',
    name: 'KickOff',
    category: 'sports',
    language: 'en',
    region: 'Southern Africa'
  },
  {
    url: 'https://www.completesports.com/feed/',
    name: 'Complete Sports',
    category: 'sports',
    language: 'en',
    region: 'West Africa'
  },
  
  // ========================================
  // REGIONAL SOURCES
  // ========================================
  
  // South Africa
  {
    url: 'https://www.iol.co.za/rss',
    name: 'IOL South Africa',
    category: 'news',
    language: 'en',
    region: 'Southern Africa'
  },
  {
    url: 'https://www.news24.com/news24/southafrica/rss',
    name: 'News24 SA',
    category: 'news',
    language: 'en',
    region: 'Southern Africa'
  },
  
  // Nigeria
  {
    url: 'https://punchng.com/feed/',
    name: 'Punch Nigeria',
    category: 'news',
    language: 'en',
    region: 'West Africa'
  },
  {
    url: 'https://www.vanguardngr.com/feed/',
    name: 'Vanguard Nigeria',
    category: 'news',
    language: 'en',
    region: 'West Africa'
  },
  
  // Kenya
  {
    url: 'https://www.nation.africa/kenya/rss',
    name: 'Daily Nation Kenya',
    category: 'news',
    language: 'en',
    region: 'East Africa'
  },
  {
    url: 'https://www.standardmedia.co.ke/rss/headlines.php',
    name: 'The Standard Kenya',
    category: 'news',
    language: 'en',
    region: 'East Africa'
  },
  
  // Ghana
  {
    url: 'https://www.ghanaweb.com/GhanaHomePage/rss/news.xml',
    name: 'GhanaWeb',
    category: 'news',
    language: 'en',
    region: 'West Africa'
  },
];

// Category-based feed filtering
export function getFeedsByCategory(category: string): RSSFeed[] {
  return RSS_FEEDS.filter(feed => feed.category === category);
}

// Region-based feed filtering
export function getFeedsByRegion(region: string): RSSFeed[] {
  return RSS_FEEDS.filter(feed => feed.region === region);
}

// Get all culture, sports, and entertainment feeds (MonoKromatik focus)
export function getMonoKromatikFeeds(): RSSFeed[] {
  return RSS_FEEDS.filter(feed => 
    feed.category === 'culture' || 
    feed.category === 'sports' || 
    feed.category === 'entertainment' ||
    feed.category === 'music'
  );
}
