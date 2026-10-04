// Report merchandising — the storefront layer over the raw report library.
//
// Turns a `Report` into a serializable `ReportCard` carrying everything the
// /reports storefront needs to MERCHANDISE it: a buyer-facing sector, a price
// tier (paid PDF / email-gated / free), the price, and the CTA. All of this is
// derived here (server-safe) so the client shelf stays a dumb, fast renderer.
//
// Why a sector map rather than runtime keyword-guessing: the raw `series` field
// is inconsistent and tag-based inference misfires (an EV report reads as
// "sport", a spirits brand as "music"). The 56 live reports are assigned
// explicitly and reviewed; only a future, not-yet-mapped report falls back to
// keyword inference, defaulting to 'markets-method'.

import type { Report } from './reports';
import { isLocked } from './reports';
import { reportCheckoutUrl, reportPrice, reportLaunchNote } from './commerce';

export type SectorId =
  | 'music'
  | 'sport'
  | 'fashion-beauty'
  | 'money-tech'
  | 'screen-media'
  | 'food-drink'
  | 'markets-method';

/** Buyer-facing sectors, in storefront order. */
export const SECTORS: { id: SectorId; label: string }[] = [
  { id: 'music', label: 'Music' },
  { id: 'sport', label: 'Sport' },
  { id: 'fashion-beauty', label: 'Fashion & Beauty' },
  { id: 'money-tech', label: 'Money & Tech' },
  { id: 'screen-media', label: 'Screen & Media' },
  { id: 'food-drink', label: 'Food & Drink' },
  { id: 'markets-method', label: 'Markets & Method' },
];

export const SECTOR_LABEL: Record<SectorId, string> = SECTORS.reduce(
  (acc, s) => ((acc[s.id] = s.label), acc),
  {} as Record<SectorId, string>,
);

// Reviewed, explicit assignment of every live report to its home sector.
const SECTOR_BY_SLUG: Record<string, SectorId> = {
  // Music
  'afrobeats-export-summer-economics': 'music',
  'will-it-land-warner-africori-amapiano': 'music',
  'who-owns-detty-december-homecoming-economy': 'music',
  'who-captures-amapiano-value-capture-report': 'music',
  'culture-due-diligence-afrobeats-catalogue': 'music',
  'signal-fit-brands-buying-into-amapiano': 'music',
  'who-owns-african-music-league-table': 'music',
  'signal-scorecard-tyla': 'music',
  'artist-value-capture-rema': 'music',
  // Sport
  'will-it-land-brand-south-africa-nascar': 'sport',
  'womens-football-africa-wafcon-briefing': 'sport',
  'will-it-land-totalenergies-afcon': 'sport',
  'brand-study-the-springbok-world-champion-under-owned': 'sport',
  'whos-buying-african-sport-2026': 'sport',
  'athlete-value-capture-siya-kolisi': 'sport',
  'athlete-value-capture-victor-osimhen': 'sport',
  'who-owns-african-sport-league-table': 'sport',
  'culture-due-diligence-african-football-rights': 'sport',
  // Fashion & Beauty
  'will-it-land-shein-temu-africa': 'fashion-beauty',
  'african-luxury-market-brief': 'fashion-beauty',
  'will-it-land-magugu-house': 'fashion-beauty',
  'will-it-land-uncover-skincare': 'fashion-beauty',
  'who-owns-african-beauty-league-table': 'fashion-beauty',
  'signal-scorecard-mielle-organics': 'fashion-beauty',
  'who-owns-african-fashion-league-table': 'fashion-beauty',
  // Money & Tech
  'african-startup-funding-concentration-2026': 'money-tech',
  'transsion-african-phone-market-briefing': 'money-tech',
  'will-it-land-starlink-africa': 'money-tech',
  'will-it-land-african-off-grid-solar': 'money-tech',
  'will-it-land-african-healthtech': 'money-tech',
  'will-it-land-african-electric-mobility': 'money-tech',
  'will-it-land-african-stablecoins': 'money-tech',
  'will-it-land-african-aviation': 'money-tech',
  'vodacom-takes-control-of-safaricom': 'money-tech',
  'bridgement-r330m-banks-fund-the-disruptor': 'money-tech',
  'who-owns-african-fintech-league-table': 'money-tech',
  'signal-scorecard-flutterwave': 'money-tech',
  'signal-scorecard-jumia': 'money-tech',
  'will-it-land-moniepoint-uk-nigeria': 'money-tech',
  'culture-due-diligence-african-mobile-money': 'money-tech',
  // Screen & Media
  'will-it-land-ebonylife-on-plus': 'screen-media',
  'culture-due-diligence-nollywood-streaming': 'screen-media',
  'value-capture-trevor-noah': 'screen-media',
  // Food & Drink
  'guinness-african-stronghold-briefing': 'food-drink',
  'african-spirits-report-2026-who-owns-the-pour': 'food-drink',
  'will-it-land-spearhead-spirits': 'food-drink',
  'signal-scorecard-nandos': 'food-drink',
  'signal-scorecard-six-dogs': 'food-drink',
  // Markets & Method (cross-sector ownership / methodology)
  'founding-report-intelligence-behind-african-influence': 'markets-method',
  'culture-is-business': 'markets-method',
  'the-monokromatik-method': 'markets-method',
  'the-megabrand-exit-ledger': 'markets-method',
  'the-founders-ledger-sell-up-or-open-out': 'markets-method',
  'south-african-brand-culture-brief': 'markets-method',
  'nigerian-creative-economy-brief': 'markets-method',
  'value-capture-scorecard-2026': 'markets-method',
};

// Keyword fallback for a report not yet in the explicit map (e.g. a freshly
// commissioned one). Deliberately conservative; defaults to markets-method.
const INFER: [SectorId, RegExp][] = [
  ['music', /amapiano|afrobeat|afro ?nation|music|catalogue|hip-?hop|spotify|stream(?!ing-tv)|artist|rema|tyla|warner|africori|detty/i],
  ['sport', /sport|football|rugby|springbok|afcon|wafcon|nascar|athlete|soccer|olympic|kolisi|osimhen|queens/i],
  ['fashion-beauty', /fashion|shein|temu|beauty|maxhosa|luxury|apparel|skincare|mielle|magugu|uncover|cosmetic/i],
  ['screen-media', /nollywood|ebonylife|trevor noah|film|cinema|tv|screen|streaming-tv/i],
  ['food-drink', /nando|guinness|amarula|spirit|drink|hospitalit|restaurant|pour|six ?dogs|distill|gin/i],
  ['money-tech', /fintech|funding|venture|\bvc\b|\bbank|money|payment|jumia|safaricom|startup|flutterwave|moniepoint|stablecoin|bridgement|wallet|airtel|vodacom|solar|aviation|electric|phone|starlink|healthtech|transsion/i],
];

export function reportSector(r: Report): SectorId {
  if (SECTOR_BY_SLUG[r.slug]) return SECTOR_BY_SLUG[r.slug];
  const hay = `${r.title} ${r.slug} ${(r.tags || []).join(' ')} ${r.series}`.toLowerCase();
  for (const [id, re] of INFER) if (re.test(hay)) return id;
  return 'markets-method';
}

/** paid = sold as a one-off PDF; premium = email/membership-gated but free;
 *  free = fully open to read. */
export type PriceTier = 'paid' | 'premium' | 'free';

export interface ReportCard {
  slug: string;
  title: string;
  summary: string;
  series: string;
  tags: string[];
  status: Report['status'];
  sector: SectorId;
  sectorLabel: string;
  tier: PriceTier;
  /** Display price for paid cards (e.g. "R3,500"); null otherwise. */
  price: string | null;
  /** Launch-price note for paid cards (e.g. "Launch price — rising to R7,500"). */
  launchNote: string | null;
  href: string;
}

export function toReportCard(r: Report): ReportCard {
  const checkout = reportCheckoutUrl(r.slug);
  const tier: PriceTier = checkout ? 'paid' : isLocked(r) ? 'premium' : 'free';
  const sector = reportSector(r);
  return {
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    series: r.series,
    tags: r.tags || [],
    status: r.status,
    sector,
    sectorLabel: SECTOR_LABEL[sector],
    tier,
    price: tier === 'paid' ? reportPrice(r.slug) : null,
    launchNote: tier === 'paid' ? reportLaunchNote(r.slug) : null,
    href: `/reports/${r.slug}`,
  };
}

/** Tier counts for the storefront's type filter. */
export function tierCounts(cards: ReportCard[]): Record<PriceTier | 'all', number> {
  const c = { all: cards.length, paid: 0, premium: 0, free: 0 };
  for (const x of cards) c[x.tier]++;
  return c;
}

/** Sector facets present in a set of cards, in canonical order, with counts. */
export function sectorFacets(cards: ReportCard[]): { id: SectorId; label: string; count: number }[] {
  const counts = new Map<SectorId, number>();
  for (const x of cards) counts.set(x.sector, (counts.get(x.sector) || 0) + 1);
  return SECTORS.filter((s) => counts.has(s.id)).map((s) => ({ ...s, count: counts.get(s.id)! }));
}
