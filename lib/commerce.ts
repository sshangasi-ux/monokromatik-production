// Revenue rail — the Cultural-Signal Index report offer.
//
// Payment is Paystack-hosted (a Payment Page link), so card data never touches
// this site and no secret key lives in the codebase. Set the PUBLIC env vars
// below to go live; until then the CTA falls back to lead capture.
//
//   NEXT_PUBLIC_PAYSTACK_REPORT_URL   the Paystack Payment Page link (public)
//   NEXT_PUBLIC_INDEX_REPORT_PRICE    display price, e.g. "$49" or "R899" (public)
//
// The Paystack SECRET key is NEVER referenced here — verification/webhooks (when
// added) read it from a server-only env var, never committed.

export interface ReportOffer {
  name: string;
  tagline: string;
  /** One-time vs subscription — v1 is a one-off. */
  cadence: string;
  /** Optional display price; empty = shown on the Paystack checkout. */
  priceLabel: string;
  includes: string[];
}

export const INDEX_REPORT: ReportOffer = {
  name: 'The Cultural-Signal Index — Full Report',
  tagline: 'The complete ranked read of who authors African influence — with the evidence.',
  cadence: 'One-time purchase · quarterly refresh',
  // Hard-set to match the live Paystack charge (R220). NOT read from
  // NEXT_PUBLIC_INDEX_REPORT_PRICE — a stale value there (R899) must never
  // override and show a price that differs from what checkout actually charges.
  // If the report price changes, change it here AND on the Paystack page.
  priceLabel: 'R220',
  includes: [
    'The complete ranked Index — every brand, every score',
    'Per-axis breakdowns: idea · authorship · execution · consequence',
    'The authorship read — who shaped the work vs who localised it',
    'Full methodology and the evidence behind every score',
    'Quarterly refresh as the catalogue grows',
  ],
};

/**
 * The single report the one-off Paystack page sells. The hosted page delivers
 * that specific report's PDF on payment, so the BUY CTA must only appear on this
 * report — never on other premium reports (which would charge for the wrong PDF).
 * Overridable via env if the paid SKU changes.
 */
export const REPORT_CHECKOUT_SLUG = process.env.NEXT_PUBLIC_PAYSTACK_REPORT_SLUG || 'value-capture-scorecard-2026';

/**
 * Per-report one-off checkout, keyed by report slug. Each hosted Paystack page
 * delivers that specific report's PDF on payment, so the BUY CTA is scoped to the
 * report whose page it is — never shown on a report without its own page (which
 * would charge for the wrong PDF). The Paystack links are public payment pages, so
 * live ones ship as defaults; add a report here (with its page URL) to sell it,
 * env overrides per SKU. A report with `url: null` is gated (membership CTA) until
 * its page exists.
 */
// ── Tiered pricing ladder for paid reports ──────────────────────────────────
// Three rungs, low → high commitment. A report's SKU names the rung it sits on;
// the report page renders that rung's framing and, for `report`-tier SKUs,
// surfaces the enterprise upsell (routed to the work-with-us enquiry). The ladder
// resolves the internal inconsistency of a deep institutional report costing less
// than a single-brand Scorecard (from $900) — the deep report is its own tier,
// and the enterprise edition sits alongside the $900–$15,000 data products.
export type ReportTierId = 'study' | 'report' | 'enterprise';

export interface PricingTier {
  id: ReportTierId;
  name: string;
  /** Display band for the tier. */
  price: string;
  audience: string;
  purpose: string;
  includes: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'study',
    name: 'Signal Study',
    price: 'R220',
    audience: 'Individuals & curious professionals',
    purpose: 'A single decoded study — the fast, low-commitment read that also feeds the funnel.',
    includes: [
      'One report, delivered as a designed PDF',
      'Sourced exhibits + the value-capture read',
      'Instant, one-time purchase',
    ],
  },
  {
    id: 'report',
    name: 'Intelligence Report',
    price: 'R3,500',
    audience: 'Strategists, brand & rights teams, funds',
    purpose: 'The deep, framework-led single report — the institutional read that stands on its own.',
    includes: [
      'The full flagship report (framework, model, deal ledger, scenarios)',
      'Every quantified exhibit + the segmented playbook',
      'Named-source methodology and the evidence behind each number',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise & License',
    price: 'from $1,500',
    audience: 'PE funds, federations, broadcasters, agencies',
    purpose: 'The report plus the data behind it, a briefing, and citation & license rights.',
    includes: [
      'Everything in the Intelligence Report',
      'The underlying dataset / model for your stack',
      'A 60-minute briefing with the desk',
      'Team citation, presentation & license rights',
    ],
  },
];

export interface PaidReportSku {
  price: string;
  url: string | null;
  /** Which rung of the pricing ladder this SKU sits on. Defaults to 'study'. */
  tier?: ReportTierId;
  /** Optional introductory-price note shown under the price (e.g. a launch price
   *  that will rise). Signals the R3,500 is a floor, not the ceiling. */
  launchNote?: string;
  /** For `report`-tier SKUs: the enterprise upsell shown beneath the buy CTA
   *  (report + data + briefing + license), routed to the work-with-us enquiry —
   *  this is where the real value on a flagship asset is captured. */
  enterprise?: { priceFrom: string; blurb: string };
  /** The low-commitment step-DOWN: a study-tier report to offer as the cheaper
   *  first rung on this (usually flagship) gate. Cold traffic rarely buys a
   *  R3,500 report on first contact — the entry study is the smaller first yes,
   *  same value-capture lens, one topic. Rendered as a step-down on the gate. */
  entry?: { slug: string };
  /** The step-UP: the flagship a study-tier report should point to as "go
   *  deeper — the full institutional read." Turns the R220 study into the
   *  bottom rung of the ladder rather than a dead end. */
  deeper?: { slug: string };
}
export const PAID_REPORTS: Record<string, PaidReportSku> = {
  'value-capture-scorecard-2026': {
    price: 'R220',
    tier: 'study',
    url: process.env.NEXT_PUBLIC_PAYSTACK_REPORT_URL || 'https://paystack.shop/pay/3lscb9xsn8',
  },
  'who-captures-amapiano-value-capture-report': {
    price: 'R220',
    tier: 'study',
    // Live Paystack product checkout (Scorecard pattern — the URL is the code
    // default, not a Vercel env var, so the price/link can't drift). Delivery of
    // the PDF is handled off-site: manual from Paystack Orders for now, moving to
    // an automated webhook → Resend email attachment (never a shareable link).
    url: process.env.NEXT_PUBLIC_PAYSTACK_AMAPIANO_URL || 'https://paystack.com/buy/who-captures-amapiano--the-value-capture-report-vzdldc',
    // The R220 amapiano study is the funnel's entry rung — our hero content and
    // top seller. From here, step readers UP to the flagship institutional read
    // (same value-capture method, at depth).
    deeper: { slug: 'whos-buying-african-sport-2026' },
  },
  'brand-study-the-springbok-world-champion-under-owned': {
    price: 'R220',
    tier: 'study',
    // Live Paystack product checkout (same pattern as amapiano); PDF is
    // auto-delivered by the webhook from private storage on purchase.
    url: process.env.NEXT_PUBLIC_PAYSTACK_SPRINGBOK_URL || 'https://paystack.com/buy/the-springbok--world-champion-under-owned-brand-study-vusmva',
    // Topically the closest study to the sport flagship — step Springbok buyers
    // up to the full institutional African-sport read.
    deeper: { slug: 'whos-buying-african-sport-2026' },
  },
  // The flagship institutional report (the `report` tier). LIVE — the R3,500
  // Paystack product (id 2725863) is created, its PDF is in the private `reports`
  // bucket, and its match tokens are in the REPORTS registry (lib/report-delivery.ts).
  // Same Scorecard pattern: the URL is the code default (not a Vercel env var) so
  // the price/link can't drift; delivery is the webhook → Resend attachment,
  // per-buyer watermarked, never a shareable link.
  'whos-buying-african-sport-2026': {
    price: 'R3,500',
    tier: 'report',
    url: process.env.NEXT_PUBLIC_PAYSTACK_AFRICAN_SPORT_URL || 'https://paystack.com/buy/whos-buying-african-sport--the-intelligence-report-wlsljm',
    launchNote: 'Launch price — rising to R7,500',
    enterprise: {
      priceFrom: 'from $1,500',
      blurb: 'Need the underlying data, a team briefing, or citation & license rights? The enterprise edition pairs the full report with the dataset and model behind it.',
    },
    // Step-DOWN entry rung — a R3,500 report is a big first ask for traffic
    // arriving cold from social. The R220 amapiano study is the smaller first
    // yes on the same value-capture lens; buyers ladder up from there.
    entry: { slug: 'who-captures-amapiano-value-capture-report' },
  },
};

/** The one-off Paystack URL for a report, or null when it isn't sold one-off. */
export function reportCheckoutUrl(slug?: string): string | null {
  const key = slug || REPORT_CHECKOUT_SLUG;
  const url = PAID_REPORTS[key]?.url;
  return url && /^https?:\/\//.test(url) ? url : null;
}

/** Display price for a report's BUY CTA (falls back to the default SKU price). */
export function reportPrice(slug?: string): string {
  const key = slug || REPORT_CHECKOUT_SLUG;
  return PAID_REPORTS[key]?.price || INDEX_REPORT.priceLabel;
}

/** The pricing-ladder rung a report sits on (defaults to the study tier). */
export function reportTier(slug?: string): ReportTierId {
  const key = slug || REPORT_CHECKOUT_SLUG;
  return PAID_REPORTS[key]?.tier || 'study';
}

/**
 * Whether the recurring Intelligence membership unlocks this report on-site.
 * The institutional `report`-tier flagships (R3,500) are NOT included in the
 * membership — they're bought or licensed on their own, so a member cannot get
 * one for the R149 monthly price. Membership covers the study-tier reports,
 * case studies and the archive; everything else defaults to unlockable.
 */
export function membershipUnlocks(slug?: string): boolean {
  return reportTier(slug) !== 'report';
}

/** Optional introductory-price note for a report's BUY CTA, or null. */
export function reportLaunchNote(slug?: string): string | null {
  const key = slug || REPORT_CHECKOUT_SLUG;
  return PAID_REPORTS[key]?.launchNote || null;
}

/** The enterprise upsell for a `report`-tier SKU (report + data + briefing +
 *  license), or null when the report has no enterprise edition. */
export function reportEnterprise(slug?: string): PaidReportSku['enterprise'] | null {
  const key = slug || REPORT_CHECKOUT_SLUG;
  return PAID_REPORTS[key]?.enterprise || null;
}

/** The step-DOWN entry study for a (flagship) report, or null. The cheaper first
 *  rung shown on the gate — same lens, one topic — so cold traffic has a smaller
 *  first yes than a R3,500 report. Returns the entry slug + its display price. */
export function reportEntry(slug?: string): { slug: string; price: string } | null {
  const key = slug || REPORT_CHECKOUT_SLUG;
  const e = PAID_REPORTS[key]?.entry;
  return e ? { slug: e.slug, price: reportPrice(e.slug) } : null;
}

/** The step-UP flagship a study-tier report points to ("go deeper"), or null. */
export function reportDeeper(slug?: string): { slug: string; price: string } | null {
  const key = slug || REPORT_CHECKOUT_SLUG;
  const d = PAID_REPORTS[key]?.deeper;
  return d ? { slug: d.slug, price: reportPrice(d.slug) } : null;
}

/** Inbox for commission / partnership enquiries (public; overridable via env). */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'editor@monokromatik.com';

export interface Service {
  title: string;
  blurb: string;
  /** Pre-selects this option in the enquiry form. */
  id: string;
}

/** The commissioned-intelligence service menu (revenue beyond the one-off report). */
export const SERVICES: Service[] = [
  {
    id: 'scorecard',
    title: "Your brand's Signal Scorecard",
    blurb: 'Your work scored on the Cultural-Signal Index — the authorship read, the four-axis breakdown, and a roadmap to move the number.',
  },
  {
    id: 'case-study',
    title: 'Commission a case study',
    blurb: "A full six-dimension decode of your campaign — or a rival's — evidence-led and credited at the source.",
  },
  {
    id: 'market-read',
    title: 'Bespoke market read',
    blurb: 'A commissioned intelligence brief on a market, category or cultural moment across Africa and the diaspora.',
  },
  {
    id: 'sponsor',
    title: 'Sponsor a franchise or the weekly',
    blurb: 'Native, clearly-disclosed sponsorship of a signature franchise or the Weekly Signal — an engaged African brand-and-culture audience.',
  },
  {
    id: 'license',
    title: 'License the Index',
    blurb: 'License the Cultural-Signal league tables and per-brand data for your report, deck, platform or research — by category or the full Index.',
  },
  {
    id: 'partner',
    title: 'Partner & licensing',
    blurb: 'Multi-seat access, white-label intelligence, or licensing the Cultural-Signal dataset for your team.',
  },
];

// ── B2B data products built on the Index (high-margin, off the dataset) ──────
// Indicative bands only — actual scope is quoted. (Benchmark: Brand Finance sells
// brand league tables ~$1,250–6,000; per-brand scorecards as a consulting upsell.)
export interface DataProduct {
  id: string;
  title: string;
  priceFrom: string; // indicative "from" band
  blurb: string;
  includes: string[];
  /** The work-with-us enquiry option this routes to. */
  interest: string;
}

export const DATA_PRODUCTS: DataProduct[] = [
  {
    id: 'scorecard',
    title: 'Brand Signal Scorecard',
    priceFrom: 'from $900',
    blurb: 'A single brand, fully decoded on the Index — the authorship read and a roadmap to move the number.',
    includes: [
      'Your composite /100 + four-axis breakdown',
      'Benchmarked against up to five named rivals',
      'The authorship read: who shaped it, who captured value',
      'A prioritised roadmap to move each axis',
    ],
    interest: 'scorecard',
  },
  {
    id: 'league-table',
    title: 'Single league table',
    priceFrom: 'from $1,250',
    blurb: 'One category or franchise cut of the Index, licensed for your report, deck or platform.',
    includes: [
      'One ranked table (category, region or franchise)',
      'Per-brand composite + axis scores',
      'Methodology + citation rights',
      'One refresh within 12 months',
    ],
    interest: 'license',
  },
  {
    id: 'full-index',
    title: 'Full Index license',
    priceFrom: 'from $6,000',
    blurb: 'The complete Cultural-Signal dataset, refreshed quarterly — for teams that track the whole field.',
    includes: [
      'Every ranked brand, table and axis',
      'Quarterly refresh + movement history',
      'Data feed / export for your stack',
      'Team citation + presentation rights',
    ],
    interest: 'license',
  },
  {
    id: 'enterprise',
    title: 'Index API & Dashboard',
    priceFrom: 'from $15,000 / yr',
    blurb: 'Live programmatic access to the whole Index for platforms and intelligence teams that build on the data.',
    includes: [
      'Authenticated API — full ranking, axes, movement, history',
      'A live dashboard with filters, alerts and exports',
      'Monthly refresh + movement webhooks',
      'Seats, SLA and an OpenAPI contract',
    ],
    interest: 'enterprise',
  },
];

// ── The Intelligence membership (recurring) — see docs/SUBSCRIPTIONS.md ──────
export interface MembershipTier {
  id: string;
  name: string;
  priceMonthly: string;
  priceAnnual?: string;
  tagline: string;
  includes: string[];
  featured?: boolean;
}

export const MEMBERSHIP: MembershipTier[] = [
  {
    id: 'individual',
    name: 'Individual',
    priceMonthly: 'R149',
    priceAnnual: 'R1,490',
    tagline: 'For strategists, marketers and creators.',
    featured: true,
    includes: [
      'The full Cultural-Signal Index — every brand, every score',
      'The premium “Will It Land?” dossier library',
      'Every Signal Study, case study and dossier — refreshed as the field moves',
      'The full searchable archive',
    ],
  },
  {
    id: 'team',
    name: 'Team / Agency',
    priceMonthly: 'R690',
    tagline: 'For agencies and brand teams.',
    includes: [
      'Everything in Individual',
      'Up to 5 seats',
      'Licensing for client work',
      'Priority on commissioned briefs',
    ],
  },
];

/**
 * The Paystack subscription-plan checkout URL for a tier, or null until billing
 * is live. Set NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_<TIER>_URL when the plan exists.
 * (Phase 3 will replace this with auth-bound Paystack subscriptions + a webhook.)
 */
export function membershipCheckoutUrl(tierId: string): string | null {
  const map: Record<string, string | undefined> = {
    individual: process.env.NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_INDIVIDUAL_URL,
    team: process.env.NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_TEAM_URL,
  };
  const url = map[tierId];
  return url && /^https?:\/\//.test(url) ? url : null;
}

/**
 * True once memberships are actually purchasable (a Paystack plan URL is set).
 * Content gates only enforce when this is true — so marking content
 * `access:'premium'` is safe before billing goes live (it stays fully visible).
 */
export function membershipsLive(): boolean {
  return MEMBERSHIP.some((t) => membershipCheckoutUrl(t.id) !== null);
}
