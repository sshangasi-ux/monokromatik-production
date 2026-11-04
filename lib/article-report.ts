// Article → entry-study bridge (the funnel's missing middle rung).
//
// Free articles are the top of the funnel and the site's biggest traffic, but
// they dead-ended commercially: the only in-article asks were the free newsletter
// and the high-ticket advisory lead. There was no affordable, self-serve step for
// a reader who just finished a free piece and wants to go deeper. This maps an
// article to the single most on-topic R220 value-capture STUDY (sold one-off via
// Paystack), so the reader's next click can be a cheap "first yes" on exactly the
// subject they came for — the entry rung the GA funnel showed was starved of
// traffic (report_buy_click sat at 0 while cold traffic met only free content or
// the R3,500 flagship).
//
// Deliberately conservative: it only returns a study on a SPECIFIC topical match
// (music, sport, advertising, fintech, exits, founders). No match → null, and the
// article keeps its default advisory ask rather than carrying a bolted-on,
// off-topic report pitch. First match wins, so the most specific topics lead.

import type { Article } from './articles';
import { getReportBySlug } from './reports';
import { reportCheckoutUrl, reportPrice } from './commerce';

export interface ArticleEntryReport {
  /** The matched report's slug (also the report_buy_click `slug`). */
  slug: string;
  title: string;
  /** Display price, e.g. "R220". */
  price: string;
  /** The live Paystack one-off checkout URL (direct ZAR charge). */
  url: string;
  /**
   * The on-site report page (`/reports/<slug>`), which renders the full checkout
   * rail — PayPal (primary, takes cards worldwide) → FNB EFT → Paystack — plus the
   * proof and Bear Case. The in-article CTA points HERE rather than straight to
   * Paystack: our biggest-traffic pages (the "who owns…" explainers) are
   * diaspora-heavy, and a direct Paystack ZAR charge declines most international
   * cards. Routing through the report page gives those readers the PayPal rail.
   */
  landingUrl: string;
}

// Exact article → report overrides, consulted BEFORE the keyword map. Use this for
// pages where the right study isn't inferable from keywords but the topical match
// is obvious — notably the "who owns…" explainers, which are the site's biggest
// search demand yet carried no buyable ask. Keyed by article slug; value is a
// buyable report slug (must be a one-off SKU in commerce PAID_REPORTS and live).
//   who owns Fenty / LVMH exits Fenty → the megabrand ownership-&-exit read
//   who owns MTN                      → the value-capture framework (MTN's own tag)
const ARTICLE_REPORT_OVERRIDES: Record<string, string> = {
  'who-owns-fenty-beauty': 'the-megabrand-exit-ledger',
  'lvmh-wants-out-of-fenty-rihanna-owns-the-half-that-matters': 'the-megabrand-exit-ledger',
  'who-owns-mtn': 'value-capture-scorecard-2026',
};

// Resolve a buyable report slug into the in-article entry card, or null when it is
// not a live, one-off-purchasable SKU. Shared by the override and keyword paths.
function buildEntry(reportSlug: string): ArticleEntryReport | null {
  const url = reportCheckoutUrl(reportSlug);
  const r = getReportBySlug(reportSlug);
  if (!url || !r || r.status !== 'live') return null;
  return {
    slug: reportSlug,
    title: r.title,
    price: reportPrice(reportSlug),
    url,
    landingUrl: `/reports/${reportSlug}`,
  };
}

// Each study lists the keyword triggers matched (as substrings) against the
// article's title + category + tags. Only R220 study-tier reports that are sold
// one-off (and live) are targets.
const TOPIC_MAP: { report: string; triggers: string[] }[] = [
  {
    // Amapiano-specific only — its title names the genre, so a looser "any music"
    // match would read as a mismatch on non-amapiano pieces.
    report: 'who-captures-amapiano-value-capture-report',
    triggers: ['amapiano', 'log drum', 'afro-house', 'yanos'],
  },
  {
    report: 'brand-study-the-springbok-world-champion-under-owned',
    triggers: ['springbok', 'rugby', 'sa rugby', 'saru', 'rassie', 'the boks'],
  },
  {
    report: 'loeries-2026-the-creative-value-ledger',
    triggers: ['loeries', 'advertising award', 'creative award', 'ad agency', 'advertising agency', 'adland', 'ogilvy', 'joe public', 'grand prix'],
  },
  {
    report: 'cannes-lions-2026-the-africa-value-ledger',
    triggers: ['cannes', 'lions festival'],
  },
  {
    report: 'will-it-land-african-stablecoins',
    triggers: ['stablecoin', 'yellow card', 'usdc', 'usdt', 'payment rail', 'cross-border payment', 'crypto', 'fintech rail', 'remittance'],
  },
  {
    report: 'the-megabrand-exit-ledger',
    triggers: ['acquisition', 'acquired', 'sold to', 'buyout', 'takeover', 'bought by', 'exit to', 'foreign owner', 'm&a'],
  },
  {
    report: 'the-founders-ledger-sell-up-or-open-out',
    triggers: ['sell up', 'open out', 'bootstrapped', 'cap table', 'equity dilution', "founder's dilemma", 'founders dilemma'],
  },
];

/**
 * The most on-topic R220 entry study for an article, or null when nothing
 * specific matches. Pure; safe to call client-side (reads bundled report data
 * and NEXT_PUBLIC checkout URLs).
 */
export function entryReportForArticle(article: Pick<Article, 'title' | 'category' | 'tags' | 'slug'>): ArticleEntryReport | null {
  // 1) Exact per-article override wins — the precise, hand-picked match.
  const override = ARTICLE_REPORT_OVERRIDES[article.slug];
  if (override) {
    const entry = buildEntry(override);
    if (entry) return entry;
  }

  // 2) Keyword map — the most specific topical match, first match wins.
  const hay = [article.title, article.category, ...(article.tags || [])].join(' · ').toLowerCase();
  for (const { report, triggers } of TOPIC_MAP) {
    if (!triggers.some((t) => hay.includes(t))) continue;
    const entry = buildEntry(report);
    if (entry) return entry;
  }
  return null;
}
