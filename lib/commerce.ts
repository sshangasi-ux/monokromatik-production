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
  priceLabel: process.env.NEXT_PUBLIC_INDEX_REPORT_PRICE || '',
  includes: [
    'The complete ranked Index — every brand, every score',
    'Per-axis breakdowns: idea · authorship · execution · consequence',
    'The authorship read — who shaped the work vs who localised it',
    'Full methodology and the evidence behind every score',
    'Quarterly refresh as the catalogue grows',
  ],
};

/** The Paystack hosted-checkout URL, or null until configured (→ lead-capture fallback). */
export function reportCheckoutUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_PAYSTACK_REPORT_URL;
  return url && /^https?:\/\//.test(url) ? url : null;
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
      'The full Cultural-Signal Index report + quarterly refreshes',
      'Every premium case study',
      'All intelligence reports',
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
