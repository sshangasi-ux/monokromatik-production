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
  /** The live Paystack one-off checkout URL. */
  url: string;
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
  const hay = [article.title, article.category, ...(article.tags || [])].join(' · ').toLowerCase();

  for (const { report, triggers } of TOPIC_MAP) {
    // Don't pitch the study on its own subject if the article IS effectively the
    // report (same slug stem) — still fine to show, but skip exact-slug echoes.
    if (!triggers.some((t) => hay.includes(t))) continue;
    const url = reportCheckoutUrl(report);
    const r = getReportBySlug(report);
    if (url && r && r.status === 'live') {
      return { slug: report, title: r.title, price: reportPrice(report), url };
    }
  }
  return null;
}
