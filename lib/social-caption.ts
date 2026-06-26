// Instagram caption generator — turns an article or a Wire break into a
// ready-to-post caption: a hook (first line, shows before "more"), a line of
// context, a "link in bio" CTA (IG captions can't carry clickable links), and a
// curated hashtag set. Pure + deterministic so the Social Studio can render it.

const BASE_TAGS = ['MonoKromatik', 'AfricanBrands', 'BrandIntelligence', 'AfricaRising'];

const CATEGORY_TAGS: Record<string, string[]> = {
  drinks: ['AfricanSpirits', 'DrinksBusiness', 'SpiritsBrands'],
  music: ['Afrobeats', 'AfricanMusic', 'Amapiano'],
  culture: ['AfricanCulture', 'AfricanFashion', 'Diaspora'],
  sports: ['AfricanFootball', 'AFCON', 'SportsBusiness'],
  entertainment: ['Nollywood', 'AfricanFilm', 'AfricanCreatives'],
  news: ['AfricanBusiness', 'AfricaEconomy'],
};

function toHashtag(s: string): string {
  return (
    s
      .replace(/[’'`]/g, '')
      .replace(/&/g, 'and')
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  );
}

/** Dedup, drop empties/over-long, cap. */
function buildHashtags(parts: string[], max = 12): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const tag = toHashtag(p);
    const key = tag.toLowerCase();
    if (tag && tag.length <= 30 && !seen.has(key)) {
      seen.add(key);
      out.push(`#${tag}`);
    }
    if (out.length >= max) break;
  }
  return out.join(' ');
}

function trim(s: string, n: number): string {
  const clean = (s || '').replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n - 1).trimEnd() + '…' : clean;
}

export interface ArticleLike {
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  brandRead?: { pullQuote?: string } | null;
}

export function articleCaption(a: ArticleLike): string {
  const cat = (a.category || '').toLowerCase();
  const hook = a.title.trim();
  const context = trim(a.brandRead?.pullQuote || a.excerpt || '', 220);
  const hashtags = buildHashtags([
    ...BASE_TAGS,
    ...(CATEGORY_TAGS[cat] || []),
    ...((a.tags || []).slice(0, 4)),
  ]);
  return [hook, context, '🔗 The full read — link in bio.', hashtags].filter(Boolean).join('\n\n');
}

export interface BreakLike {
  title: string;
  why?: string;
  source?: string;
  category?: string;
}

export function breakCaption(b: BreakLike): string {
  const cat = (b.category || '').toLowerCase();
  const hook = `🔴 BREAKING: ${b.title.trim()}`;
  const context = trim(b.why || '', 220);
  const credit = b.source ? `Via ${b.source}.` : '';
  const hashtags = buildHashtags([...BASE_TAGS, 'TheWire', 'Breaking', ...(CATEGORY_TAGS[cat] || [])]);
  return [hook, context, credit, '🔗 The read + sources — link in bio.', hashtags].filter(Boolean).join('\n\n');
}
