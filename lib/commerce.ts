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
    id: 'partner',
    title: 'Partner & licensing',
    blurb: 'Multi-seat access, white-label intelligence, or licensing the Cultural-Signal dataset for your team.',
  },
];
