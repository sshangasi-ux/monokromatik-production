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

/** Truncate on a WORD boundary — mid-word cuts ("every unit of val…") read as sloppy. */
function trim(s: string, n: number): string {
  const clean = (s || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n - 1);
  const lastSpace = cut.lastIndexOf(' ');
  // Only fall back to a hard cut if there's no sensible break near the end.
  const body = lastSpace > n * 0.6 ? cut.slice(0, lastSpace) : cut;
  return body.replace(/[\s,;:—-]+$/, '') + '…';
}

export interface ArticleLike {
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  /** A LinkedIn-specific opening line. When set, it replaces the excerpt as the
   *  hook under the title — a punchier, scroll-stopping line for the feed, without
   *  touching the site-facing excerpt or pull-quote. */
  linkedinHook?: string;
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

// ── LinkedIn ────────────────────────────────────────────────────────────────
// LinkedIn is NOT Instagram: links are clickable (so never say "link in bio"),
// the register is professional, and 3–5 hashtags is the norm — IG-style stacks
// read as spam. These post under a personal profile, so no bot tells, no
// internal signal metadata, and no "BREAKING" on things that aren't.

const LINKEDIN_TAGS = ['MonoKromatik', 'AfricanBrands', 'BrandIntelligence'];

/** Machine-written `why` strings (e.g. "Signal: first · X (culture) · auto-curated") must never ship. */
function isMachineNote(s: string): boolean {
  return /auto-curated|·|\bsignal:/i.test(s);
}

function linkedinTags(cat: string): string {
  return buildHashtags([...LINKEDIN_TAGS, ...(CATEGORY_TAGS[cat] || []).slice(0, 1)], 4);
}

/** Our own analysis — the strongest thing to put under a personal profile. */
export function linkedinArticleCaption(a: ArticleLike): string {
  const cat = (a.category || '').toLowerCase();
  const hook = a.title.trim();
  // LinkedIn allows ~3,000 chars; a 260 cap truncated lead-piece hooks mid-word.
  // Give the whole linkedinHook room to breathe (it is authored to length).
  const context = trim(a.linkedinHook || a.brandRead?.pullQuote || a.excerpt || '', 1300);
  // Prefer the piece's OWN tag for the topical hashtag. A category tag misfires:
  // "entertainment" maps to #Nollywood, which is plain wrong on a hip-hop
  // catalog-ownership story. Fall back to the category only if tags are absent.
  const own = (a.tags || []).map((t) => toHashtag(t)).filter((t) => t.length >= 3).slice(0, 1);
  const topical = own.length ? own : (CATEGORY_TAGS[cat] || []).slice(0, 1);
  // The publisher appends the canonical link, so no CTA-to-nowhere here.
  return [hook, context, buildHashtags([...LINKEDIN_TAGS, ...topical], 4)].filter(Boolean).join('\n\n');
}

/** A relayed Wire item — credited, not overclaimed. */
export function linkedinBreakCaption(b: BreakLike): string {
  const cat = (b.category || '').toLowerCase();
  const hook = `On the Wire: ${b.title.trim()}`;
  const raw = (b.why || '').trim();
  const context = isMachineNote(raw) ? '' : trim(raw, 240);
  const credit = b.source ? `Via ${b.source}.` : '';
  return [hook, context, credit, linkedinTags(cat)].filter(Boolean).join('\n\n');
}
