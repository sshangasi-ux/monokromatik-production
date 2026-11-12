import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { createAdminClient } from './supabase/admin';
import { tryRenderReportPdf } from './render-report-pdf';

// One-off paid-report fulfilment. On a Paystack product purchase the buyer is
// emailed the report as a PDF ATTACHMENT (the file, never a shareable link): the
// bytes are read from a PRIVATE Supabase Storage bucket (service-role only) and
// sent via Resend. Best-effort — records the outcome and never throws, so the
// webhook never 500s and manual fulfilment (Paystack Orders) stays a fallback.
type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export interface DeliveryResult {
  status: 'sent' | 'skipped' | 'failed';
  detail: string;
}

interface ReportAsset {
  slug: string;
  /** Lowercase tokens; any hit in the stringified charge payload selects this
   *  report. Includes the product name/slug words and the Paystack product id —
   *  never a price (multiple reports share R220). */
  match: string[];
  /** Object path in the private `reports` bucket (bespoke/designed PDFs). */
  object?: string;
  /** When true, the PDF is RENDERED on-demand from the report's own content
   *  (data/reports.json) via lib/render-report-pdf — no bucket file needed. Used
   *  for data-driven reports; `object` is ignored. */
  generate?: boolean;
  /** Attachment filename the buyer receives. */
  filename: string;
  title: string;
  subject: string;
  /** One-line description used in the email body. */
  blurb: string;
}

const REPORTS: ReportAsset[] = [
  {
    slug: 'who-captures-amapiano-value-capture-report',
    match: ['amapiano', 'who-captures-amapiano', '2723931'],
    object: process.env.AMAPIANO_REPORT_OBJECT || 'who-captures-amapiano-value-capture-report.pdf',
    filename: 'MonoKromatik-Who-Captures-Amapiano-Value-Capture-Report.pdf',
    title: 'Who Captures Amapiano? — The Value-Capture Report',
    subject: 'Your report — Who Captures Amapiano? (The Value-Capture Report)',
    blurb: "It maps, layer by layer, where amapiano's economy is actually captured — with eight sourced exhibits and the playbook for keeping more of a nine-figure economy at home.",
  },
  {
    slug: 'brand-study-the-springbok-world-champion-under-owned',
    match: ['springbok', 'brand-study', '2724901'],
    object: 'springbok-brand-study.pdf',
    filename: 'MonoKromatik-Springbok-Brand-Study.pdf',
    title: 'The Springbok — World Champion, Under-Owned (Brand Study)',
    subject: 'Your report — The Springbok: World Champion, Under-Owned',
    blurb: "It reads the best team in world rugby as one of its most under-monetised brands — eight sourced exhibits, the value gap, the private-equity fork, and the strategy to capture more of the brand's value while keeping it South African.",
  },
  {
    slug: 'whos-buying-african-sport-2026',
    // Paystack product 2725863; the checkout slug and product name both carry
    // the 'whos-buying-african-sport' token. Never a price match (R3,500 is
    // unique now, but tokens stay the safe signal).
    match: ['whos-buying-african-sport', 'african-sport', '2725863'],
    object: process.env.AFRICAN_SPORT_REPORT_OBJECT || 'whos-buying-african-sport-report.pdf',
    filename: 'MonoKromatik-Whos-Buying-African-Sport-Intelligence-Report.pdf',
    title: "Who's Buying African Sport? — The Intelligence Report",
    subject: "Your report — Who's Buying African Sport? (The Intelligence Report)",
    blurb: 'The institutional read on who owns African sport: the Authorship → Ownership → Capture framework, a bottom-up value-leakage model, a named deal ledger, scenarios to 2035 and a segmented playbook — sixteen sourced exhibits, chart-led.',
  },
  {
    slug: 'the-african-beer-value-map',
    // Oct 2026 flagship value-map. Rendered on-demand from data/reports.json.
    // TODO: append the Paystack page slug + product id to `match` once the product
    // is created (as with the other reports) — the slug-word tokens below already
    // match the product name; none overlap the other reports'.
    match: ['the-african-beer-value-map', 'african-beer-value-map', 'beer-value-map', 'jvkvsqb3er', '2243603'],
    generate: true,
    filename: 'MonoKromatik-The-African-Beer-Value-Map.pdf',
    title: 'The African Beer Value Map — Who Wins the Drinker, and Who Keeps the Margin',
    subject: 'Your report — The African Beer Value Map',
    blurb: "The value-capture read on African beer: who owns the demand (four majors ≈93%), the premium bet, where a rand spent on beer actually lands, whether premiumisation changes the ownership question, and the realistic ways the continent captures more than the consumption — seven sourced exhibits, with a Bear Case.",
  },
  {
    slug: 'who-bankrolls-african-sport-the-dependency-map',
    // Oct 2026 flagship value-map. Rendered on-demand from data/reports.json.
    // TODO: append the Paystack page slug + product id to `match` once created.
    // Tokens avoid 'african-sport' (used by the flagship above) to prevent a clash.
    match: ['who-bankrolls-african-sport', 'bankrolls-african-sport', 'dependency-map', 'bankrolls-sport', '-zrntm1oes'],
    generate: true,
    filename: 'MonoKromatik-Who-Bankrolls-African-Sport.pdf',
    title: 'Who Bankrolls African Sport — The Dependency Map',
    subject: 'Your report — Who Bankrolls African Sport (The Dependency Map)',
    blurb: "The value-capture read on who funds African sport: how big the betting bankroll is, which properties depend on it, where the leverage and the risk sit, and what a property that diversified its funders (SA rugby) teaches the ones that didn't — six sourced exhibits, with a Bear Case.",
  },
  {
    slug: 'the-african-grand-prix-value-map',
    // Nov 2026 sport × nation-brand flagship. Rendered on-demand from
    // data/reports.json. Sold via a dedicated PayPal link (NCP code L6RGFZYAHFTHS),
    // so the webhook's deterministic first pass (paypalSlugFromBlob over
    // PAYPAL_REPORT_URLS) pins this report 1:1; the code is also in `match` as a
    // fallback, alongside distinctive slug words that don't overlap other reports'.
    match: ['the-african-grand-prix-value-map', 'african-grand-prix', 'grand-prix-value-map', 'grand-prix', 'l6rgfzyahfths'],
    generate: true,
    filename: 'MonoKromatik-The-African-Grand-Prix-Value-Map.pdf',
    title: "The African Grand Prix Value Map: Who Captures Rwanda's F1 Bet",
    subject: 'Your report — The African Grand Prix Value Map',
    blurb: "The value-capture read on Rwanda's Formula 1 deal: what a host actually rents, what leaves the country versus what stays, how the comparators (Melbourne, Singapore, the ghost of Kyalami) really pay off, the soft-power ledger that amplifies the best story and the contested one alike, and an ownership scorecard — six sourced exhibits, with a Bear Case.",
  },
  {
    slug: 'the-repatriation-playbook-nollywood-2026',
    // Sold via a Paystack PAYMENT PAGE (id 2231668, slug 074g1pqwfw — rotated
    // 2026-10-23), not a Storefront product — so the match tokens include the page slug/id and the
    // report name words. R3,500 is shared with the sport flagship, so we never
    // match on amount; tokens stay the only signal, and none here overlap the
    // other reports'. If a real purchase doesn't hit (payment-page payloads can
    // be sparse), the webhook logs the payload shape and manual fulfilment from
    // Paystack Orders is the fallback — refine these tokens from that log.
    match: ['the-repatriation-playbook', 'repatriation', '074g1pqwfw', '2231668'],
    // Rendered on-demand from data/reports.json at purchase time — no bucket
    // upload needed; the PDF stays in sync with the report content.
    generate: true,
    filename: 'MonoKromatik-The-Repatriation-Playbook.pdf',
    title: 'The Repatriation Playbook — How Nollywood Took Its Industry Back',
    subject: 'Your report — The Repatriation Playbook (How Nollywood Took Its Industry Back)',
    blurb: 'The culture value-capture flagship: how Nollywood rebuilt ownership of its industry after the streamers pulled back — the rented-vs-repatriated framework, the four rails, an original repatriation scorecard, the cultural read, a segmented playbook and a full Bear Case.',
  },
  {
    slug: 'value-capture-scorecard-2026',
    // The default CTA checkout (REPORT_CHECKOUT_SLUG), sold via the generic R220
    // Payment Page (slug vljdne22gg, rotated 2026-10-23). Was buyable with NO delivery wired — this
    // closes that gap. Tokens: the report slug words + the page code.
    match: ['value-capture-scorecard', 'scorecard-2026', 'vljdne22gg', '2231669'],
    generate: true,
    filename: 'MonoKromatik-The-Value-Capture-Scorecard.pdf',
    title: 'The Value-Capture Scorecard 2026',
    subject: 'Your report — The Value-Capture Scorecard 2026',
    blurb: 'The method on one page: how MonoKromatik scores who authors a cultural asset versus who captures its value — the axes, the scoring, and the worked reads behind the Signal Index.',
  },
  {
    slug: 'loeries-2026-the-creative-value-ledger',
    // THE CREATIVE LEDGER study, dedicated Payment Page slug ua2m5y0f4b (rotated
    // 2026-10-23). Rendered from data/reports.json. Tokens: report slug words +
    // page code. None overlap the other reports'.
    match: ['loeries', 'loeries-2026-the-creative-value-ledger', 'ua2m5y0f4b', '2231667'],
    generate: true,
    filename: 'MonoKromatik-The-Loeries-2026-Value-Ledger.pdf',
    title: 'The Loeries 2026 Value Ledger',
    subject: 'Your report — The Loeries 2026 Value Ledger',
    blurb: 'Who makes the work, who keeps the value — a value-capture read on the 2026 Loeries: the four Grand Prix, the agencies and brands behind them, the value-capture stack, and the Bear Case.',
  },
  {
    slug: 'cannes-lions-2026-the-africa-value-ledger',
    // THE CREATIVE LEDGER study, dedicated Payment Page slug t252w6-8lu (rotated
    // 2026-10-23). Rendered from data/reports.json. Tokens: report slug words +
    // page code.
    match: ['cannes', 'cannes-lions-2026-the-africa-value-ledger', 't252w6-8lu', '2231666'],
    generate: true,
    filename: 'MonoKromatik-Cannes-Lions-2026-The-Africa-Ledger.pdf',
    title: 'Cannes Lions 2026: The Africa Ledger',
    subject: 'Your report — Cannes Lions 2026: The Africa Ledger',
    blurb: "Whose win, whose value — a value-capture read on Africa and the diaspora at Cannes Lions 2026: Kenya's Grand Prix, Nigeria's shared-credit Gold, South Africa's social-impact haul, and the Bear Case.",
  },
  {
    // Three previously members-only reports now sold one-off; dedicated Paystack
    // Payment Pages created 2026-10-20. Rendered from data/reports.json. Tokens:
    // distinctive slug words + the page code; none overlap other reports'.
    slug: 'the-founders-ledger-sell-up-or-open-out',
    match: ['founders-ledger', 'the-founders-ledger-sell-up-or-open-out', 'fliw6r4uvv', '2231665'],
    generate: true,
    filename: 'MonoKromatik-The-Founders-Ledger.pdf',
    title: "The Founders' Ledger: Sell Up, or Open Out?",
    subject: "Your report — The Founders' Ledger (Sell Up, or Open Out?)",
    blurb: 'The MonoKromatik Practitioner Read — two founders, two very different answers to the value-capture question, in their own words, with the framework and the Bear Case.',
  },
  {
    slug: 'the-megabrand-exit-ledger',
    match: ['megabrand-exit', 'the-megabrand-exit-ledger', 'l52cxlhw8t', '2231662'],
    generate: true,
    filename: 'MonoKromatik-The-Megabrand-Exit-Ledger.pdf',
    title: 'The Megabrand Exit Ledger',
    subject: 'Your report — The Megabrand Exit Ledger',
    blurb: 'A standing ledger of African brands and assets sold to foreign owners in 2024–26 — what changed hands, at what price, and the capability, margin and IP that left with them.',
  },
  {
    slug: 'will-it-land-african-stablecoins',
    match: ['stablecoins', 'will-it-land-african-stablecoins', 'o418hjog3t', '2231659'],
    generate: true,
    filename: 'MonoKromatik-The-Dollar-in-a-Green-Jacket-Stablecoins.pdf',
    title: "The Dollar in a Green Jacket — Stablecoins & Africa's Payment Rails",
    subject: "Your report — The Dollar in a Green Jacket (African Stablecoins)",
    blurb: "Will It Land? — stablecoins are Africa's fastest-moving cross-border rail, and the read on who authors and owns it: sovereignty win or new dependency, with the Bear Case.",
  },
  // ── The 17 Signal Studies, now sold one-off via dedicated PayPal $12 NCP links
  //    (2026-11-10). Rendered on-demand from data/reports.json (generate:true). The
  //    PayPal link CODE pins each report 1:1 in the webhook (paypalSlugFromBlob);
  //    the same code is the primary match token here, alongside distinctive slug
  //    words that don't overlap the other reports'.
  {
    slug: 'will-it-land-brand-south-africa-nascar',
    match: ['will-it-land-brand-south-africa-nascar', 'brand-south-africa-nascar', 'nascar', '3s24hg7krh4ag'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Brand-SA-NASCAR.pdf',
    title: "Will It Land? Brand South Africa's NASCAR Bet",
    subject: "Your study — Will It Land? Brand South Africa's NASCAR Bet",
    blurb: "A value-capture read on the Brand South Africa × NASCAR play: who authors the nation-brand story, and who captures the value.",
  },
  {
    slug: 'will-it-land-shein-temu-africa',
    match: ['will-it-land-shein-temu-africa', 'shein-temu', 'shein', 'temu', '2m3kgl27qrm7s'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Shein-Temu-Africa.pdf',
    title: 'Will It Land? Shein and Temu in South Africa',
    subject: 'Your study — Will It Land? Shein and Temu in South Africa',
    blurb: "The value-capture read on Shein and Temu's ultra-cheap push into South Africa: who authors the demand, and who keeps the margin.",
  },
  {
    slug: 'will-it-land-starlink-africa',
    match: ['will-it-land-starlink-africa', 'starlink', 'v4l28mhjfmdys'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Starlink-Africa.pdf',
    title: "Will It Land? Starlink's African Internet Play",
    subject: "Your study — Will It Land? Starlink's African Internet Play",
    blurb: "A value-capture read on Starlink across Africa: who authors connectivity, who owns the rail, and where the value lands.",
  },
  {
    slug: 'will-it-land-african-off-grid-solar',
    match: ['will-it-land-african-off-grid-solar', 'off-grid-solar', 'm-kopa', 'mkopa', 'ty3ayhwyftj9a'],
    generate: true,
    filename: 'MonoKromatik-M-KOPA-Off-Grid-Gambit.pdf',
    title: 'M-KOPA and the Off-Grid Gambit',
    subject: 'Your study — M-KOPA and the Off-Grid Gambit',
    blurb: "Solving African energy, owning it from London — the value-capture read on M-KOPA and the off-grid solar model.",
  },
  {
    slug: 'will-it-land-african-healthtech',
    match: ['will-it-land-african-healthtech', 'african-healthtech', 'reliance-health', 'healthtech', 'dsknjtqak2myc'],
    generate: true,
    filename: 'MonoKromatik-Reliance-Health-Breakeven-Bet.pdf',
    title: "Reliance Health's Breakeven Bet",
    subject: "Your study — Reliance Health's Breakeven Bet",
    blurb: "Can African healthtech fund itself? The value-capture read on Reliance Health's path to breakeven.",
  },
  {
    slug: 'african-luxury-market-brief',
    match: ['african-luxury-market-brief', 'african-luxury', 'luxury-market-brief', 'uttesb6qctbhw'],
    generate: true,
    filename: 'MonoKromatik-African-Luxury-Market-Brief.pdf',
    title: 'The African Luxury Market Brief',
    subject: 'Your brief — The African Luxury Market Brief',
    blurb: "Who authors the culture, who captures the value — the brief on the African luxury market.",
  },
  {
    slug: 'will-it-land-african-electric-mobility',
    match: ['will-it-land-african-electric-mobility', 'electric-mobility', 'basigo', 'g6y2a3lqa9n8n'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-BasiGo-Electric-Buses.pdf',
    title: "Will It Land? BasiGo's Road to 1,000 Electric Buses",
    subject: "Your study — Will It Land? BasiGo's Electric Buses",
    blurb: "A value-capture read on BasiGo and African electric mobility: who builds the fleet, and who owns the economics.",
  },
  {
    slug: 'nigerian-creative-economy-brief',
    match: ['nigerian-creative-economy-brief', 'nigerian-creative-economy', '3xreq56t3lz6g'],
    generate: true,
    filename: 'MonoKromatik-Nigerian-Creative-Economy-Brief.pdf',
    title: 'The Nigerian Creative Economy Brief',
    subject: 'Your brief — The Nigerian Creative Economy Brief',
    blurb: "Who authors, who captures — the brief on the Nigerian creative economy.",
  },
  {
    slug: 'will-it-land-african-aviation',
    match: ['will-it-land-african-aviation', 'african-aviation', 'air-peace', '5apdfdudx5wan'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Air-Peace-Aviation.pdf',
    title: "Heathrow or Nothing: Air Peace's Lagos–London Corridor",
    subject: "Your study — Heathrow or Nothing: Air Peace's Lagos–London Corridor",
    blurb: "Can Air Peace hold the Lagos–London corridor it just cracked open? The value-capture read on the route and who owns it.",
  },
  {
    slug: 'will-it-land-spearhead-spirits',
    match: ['will-it-land-spearhead-spirits', 'spearhead-spirits', 'spearhead', 'mk7ne64lbbupc'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Spearhead-Spirits.pdf',
    title: "Will It Land? Spearhead Spirits' America Bet",
    subject: "Your study — Will It Land? Spearhead Spirits' America Bet",
    blurb: "Africa's own house of spirits bets on America — the value-capture read on who authors the brand and who captures the value.",
  },
  {
    slug: 'will-it-land-magugu-house',
    match: ['will-it-land-magugu-house', 'magugu-house', 'magugu', 'kqfcartz5wbt8'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Thebe-Magugu-House.pdf',
    title: 'Will It Land? Thebe Magugu Is Building a House He Owns',
    subject: 'Your study — Will It Land? Thebe Magugu Is Building a House He Owns',
    blurb: "A house he owns, not a label he rents — the value-capture read on Thebe Magugu's model.",
  },
  {
    slug: 'will-it-land-ebonylife-on-plus',
    match: ['will-it-land-ebonylife-on-plus', 'ebonylife-on-plus', 'ebonylife', 'mo-abudu', 'vtvbn5g8n9lu4'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-EbonyLife-On-Plus.pdf',
    title: "Will It Land? Mo Abudu's EbonyLife on Plus",
    subject: "Your study — Will It Land? Mo Abudu's EbonyLife on Plus",
    blurb: "Mo Abudu bets that Africans can own the screen, not just fill it — the value-capture read on EbonyLife.",
  },
  {
    slug: 'will-it-land-moniepoint-uk-nigeria',
    match: ['will-it-land-moniepoint-uk-nigeria', 'moniepoint-uk-nigeria', 'moniepoint', '45mq2tyzcynpa'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Moniepoint-UK.pdf',
    title: 'Will It Land? Moniepoint Takes Its Balance Sheet to Britain',
    subject: 'Your study — Will It Land? Moniepoint Takes Its Balance Sheet to Britain',
    blurb: "The value-capture read on Moniepoint's move into Britain: who authors the rails, and who captures the value.",
  },
  {
    slug: 'will-it-land-uncover-skincare',
    match: ['will-it-land-uncover-skincare', 'uncover-skincare', 'uncover', '2nq84dbg4lrtl'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Uncover-Skincare.pdf',
    title: "Will It Land? Uncover's Kenyan K-Beauty Diaspora Bet",
    subject: "Your study — Will It Land? Uncover's Kenyan K-Beauty Diaspora Bet",
    blurb: "Carrying Kenyan K-beauty to the diaspora shelf — the value-capture read on Uncover's bet.",
  },
  {
    slug: 'will-it-land-warner-africori-amapiano',
    match: ['will-it-land-warner-africori-amapiano', 'warner-africori-amapiano', 'warner-africori', 'africori', 'c83afrgvpgpvq'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-Amapiano-Pipe.pdf',
    title: 'Will It Land? Who Owns the Pipe Amapiano Flows Through',
    subject: 'Your study — Will It Land? Who Owns the Pipe Amapiano Flows Through',
    blurb: "The value-capture read on the distribution pipe Amapiano flows through: who authors the sound, and who owns the rail.",
  },
  {
    slug: 'will-it-land-totalenergies-afcon',
    match: ['will-it-land-totalenergies-afcon', 'totalenergies-afcon', 'totalenergies', 'afcon', '2phyrhax2s4cc'],
    generate: true,
    filename: 'MonoKromatik-Will-It-Land-TotalEnergies-AFCON.pdf',
    title: 'Will It Land? TotalEnergies and African Football',
    subject: 'Your study — Will It Land? TotalEnergies and African Football',
    blurb: "TotalEnergies bought the name of African football — can it own the culture? The value-capture read.",
  },
  {
    slug: 'south-african-brand-culture-brief',
    match: ['south-african-brand-culture-brief', 'south-african-brand-culture', 'fpj7jg88cx6rn'],
    generate: true,
    filename: 'MonoKromatik-South-African-Brand-Culture-Brief.pdf',
    title: 'The South African Brand Culture Brief',
    subject: 'Your brief — The South African Brand Culture Brief',
    blurb: "Who authors the culture, who captures the value — the brief on South African brand culture.",
  },
];

/**
 * Personalise each delivered copy to the buyer: a faint diagonal watermark on
 * every page ("LICENSED TO <email>") plus a footer line. Makes the report's
 * "licensed to the named purchaser" real and traceable, so a leaked copy points
 * back to who leaked it. Best-effort — on any failure the original bytes are
 * returned so delivery is never blocked.
 */
async function stampForBuyer(pdf: Buffer, email: string): Promise<Buffer> {
  try {
    const doc = await PDFDocument.load(pdf);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const date = new Date().toISOString().slice(0, 10);
    const mark = `LICENSED TO ${email.toUpperCase()}`;
    const footer = `Licensed to ${email}  ·  ${date}  ·  This copy is watermarked. Not for redistribution.`;
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      // faint diagonal watermark
      page.drawText(mark, {
        x: width * 0.1, y: height * 0.32, size: 24, font,
        color: rgb(0.5, 0.5, 0.5), opacity: 0.06, rotate: degrees(50),
      });
      // subtle traceable footer line, bottom-left
      page.drawText(footer, { x: 34, y: 9, size: 5.5, font, color: rgb(0.55, 0.55, 0.55), opacity: 0.85 });
    }
    return Buffer.from(await doc.save());
  } catch (e) {
    console.error('[delivery] watermark failed, sending unstamped:', (e as Error)?.message);
    return pdf;
  }
}

/** Metadata keys that hold buyer-typed text (exact keys only, so merchant keys
 *  like `product_name` are kept). */
const BUYER_KEY = /^(customer|customer_?name|first_?name|last_?name|full_?name|name|email|e_?mail|email_?address|phone|phone_?number|mobile|company|company_?name|message|note|notes|comment|address)$/i;

/**
 * Build the string the matchers search, from a Paystack `charge.success` `data`
 * object, with every BUYER-CONTROLLED field removed first.
 *
 * Security (Strix vuln-0004): matching used to run over JSON.stringify(data), which
 * includes the buyer's email and name. A buyer could pay for the cheapest report
 * with an email like "amapiano@…" and be sent a different, pricier report. Only
 * merchant-controlled signals (payment page / product ids, referrer URL, product
 * metadata) may decide what gets delivered. If none is present the charge falls
 * through to manual fulfilment — it never guesses.
 */
export function productSignal(data: Record<string, unknown>): string {
  const clean: Record<string, unknown> = { ...data };
  delete clean.customer; // email, first/last name, phone, customer metadata
  delete clean.email;
  delete clean.authorization; // card-holder / account name
  delete clean.ip_address;
  delete clean.log;
  const meta = clean.metadata;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const m: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
      // custom_fields on a Paystack payment page are always the buyer's own
      // answers (name, company, etc.) — never a product signal. Drop them all.
      if (k === 'custom_fields') continue;
      if (!BUYER_KEY.test(k)) {
        m[k] = v;
      }
    }
    clean.metadata = m;
  } else if (typeof meta === 'string') {
    // Paystack sometimes sends metadata as a JSON string — parse and clean it too.
    try {
      clean.metadata = JSON.parse(productSignal({ metadata: JSON.parse(meta) })).metadata;
    } catch {
      delete clean.metadata;
    }
  }
  return JSON.stringify(clean);
}

/** Find the paid report a charge payload is buying, or null. Pass productSignal(data). */
export function matchReport(payloadBlob: string): { slug: string } | null {
  const b = payloadBlob.toLowerCase();
  return REPORTS.find((r) => r.match.some((t) => b.includes(t))) ?? null;
}

/** A paid charge succeeded but matched NO report and NO bundle — the buyer paid
 *  and would otherwise get nothing, silently (only a server log). Email the team
 *  so they fulfil it manually from Paystack → Transactions and add a match token
 *  so it auto-delivers next time. Best-effort; never throws, never blocks the 200
 *  Paystack needs. This is the safety net that makes the whole match layer safe:
 *  a mis-matched purchase becomes an alert, not a lost customer. */
export async function alertUnmatchedPurchase(info: {
  email: string | null;
  amount?: unknown;
  currency?: unknown;
  reference?: unknown;
  metaKeys?: string[];
}): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[delivery] UNMATCHED paid purchase and no RESEND_API_KEY to alert — manual check needed', info);
      return;
    }
    const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <editor@send.monokromatik.com>';
    const to = process.env.LEAD_NOTIFY_TO || process.env.REPORT_DELIVERY_REPLY_TO || 'editor@monokromatik.com';
    const amt = info.amount != null ? `${Number(info.amount) / 100} ${String(info.currency || 'ZAR')}` : '?';
    const text = [
      'A payment SUCCEEDED but did not match any report or bundle.',
      'The buyer has paid and will NOT receive anything automatically — fulfil this manually.',
      '',
      `Buyer:         ${info.email ?? '—'}`,
      `Amount:        ${amt}`,
      `Reference:     ${info.reference ?? '—'}`,
      `Metadata keys: ${(info.metaKeys || []).join(', ') || '—'}`,
      '',
      'Action: open Paystack → Transactions, find this reference, identify the product,',
      'and send the report to the buyer. Then add a match token in lib/report-delivery.ts',
      'so this product auto-delivers next time.',
    ].join('\n');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: info.email ?? undefined,
        subject: `⚠ Unmatched Paystack purchase — manual fulfilment needed (${info.reference ?? 'no ref'})`,
        text,
      }),
    });
    if (!res.ok) console.error('[delivery] unmatched-purchase alert failed:', res.status, (await res.text()).slice(0, 200));
    else console.log('[delivery] unmatched-purchase alert sent to', to);
  } catch (e) {
    console.error('[delivery] unmatched-purchase alert threw:', (e as Error)?.message);
  }
}

export async function deliverReport(email: string, admin: Admin, slug: string): Promise<DeliveryResult> {
  const report = REPORTS.find((r) => r.slug === slug);
  const record = async (r: DeliveryResult): Promise<DeliveryResult> => {
    try {
      await admin.from('report_deliveries').insert({ email, report: slug, status: r.status, detail: r.detail });
    } catch {
      /* observability only — never block delivery */
    }
    return r;
  };
  if (!report) return record({ status: 'failed', detail: `unknown report ${slug}` });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <editor@send.monokromatik.com>';
  const replyTo = process.env.REPORT_DELIVERY_REPLY_TO || 'editor@monokromatik.com';
  const bucket = process.env.REPORT_ASSET_BUCKET || 'reports';
  if (!apiKey) {
    console.warn('[delivery] not configured (RESEND_API_KEY)');
    return record({ status: 'skipped', detail: 'RESEND_API_KEY not set' });
  }
  // Get the base PDF bytes: render on-demand from the report's own content, or
  // download the bespoke/designed file from the private bucket.
  let rawPdf: Buffer;
  if (report.generate) {
    const rendered = await tryRenderReportPdf(report.slug);
    if (!rendered) return record({ status: 'failed', detail: `render failed ${report.slug}` });
    rawPdf = rendered;
  } else if (report.object) {
    const { data: file, error: dlErr } = await admin.storage.from(bucket).download(report.object);
    if (dlErr || !file) {
      // The bespoke/designed PDF is missing or the bucket is unreachable. The
      // buyer has paid, so DON'T fail — fall back to rendering the report from
      // its own content in data/reports.json. A plain rendered copy beats no
      // delivery; if the designed file is present it's always preferred.
      console.error(`[delivery] bucket PDF unavailable (${bucket}/${report.object}): ${dlErr?.message ?? 'missing'} — falling back to render`);
      const rendered = await tryRenderReportPdf(report.slug);
      if (!rendered) return record({ status: 'failed', detail: `pdf missing ${report.object} and render fallback failed` });
      rawPdf = rendered;
    } else {
      rawPdf = Buffer.from(await file.arrayBuffer());
    }
  } else {
    return record({ status: 'failed', detail: `no asset configured for ${slug}` });
  }
  const stamped = await stampForBuyer(rawPdf, email);
  const base64 = stamped.toString('base64');
  const html =
    '<p>Thank you for your purchase.</p>' +
    `<p>Your copy of <strong>${report.title}</strong> is attached as a PDF.</p>` +
    `<p>${report.blurb}</p>` +
    '<p>Any issues, just reply to this email.</p>' +
    '<p>— MonoKromatik · African &amp; diaspora brand intelligence</p>';
  const text = `Thank you for your purchase. Your copy of "${report.title}" is attached as a PDF. Any issues, reply to this email. — MonoKromatik`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: replyTo,
      subject: report.subject,
      html,
      text,
      attachments: [{ filename: report.filename, content: base64 }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[delivery] Resend failed (${res.status}): ${body}`);
    return record({ status: 'failed', detail: `resend ${res.status}: ${body.slice(0, 300)}` });
  }
  console.log(`[delivery] ${slug} delivered to ${email}`);
  return record({ status: 'sent', detail: `to ${email}` });
}

// ── Bundle fulfilment — one purchase delivers every member report's PDF ──────
// A bundle's Paystack product id/name tokens select the bundle; each member slug
// maps to a ReportAsset above, so delivery reuses deliverReport per member.
// Inert until the bundle products exist in Paystack (add their product id to
// `match` when created — see lib/commerce.ts BUNDLES for the storefront side).
interface BundleAsset {
  slug: string;
  /** Lowercase tokens; any hit in the stringified charge payload selects this
   *  bundle. Add the Paystack product id once the product is created. */
  match: string[];
  /** Member report slugs — each must exist in REPORTS above. */
  members: string[];
}

const BUNDLES_DELIVERY: BundleAsset[] = [
  {
    slug: 'ownership-studies-pack',
    match: ['ownership-studies', 'studies-pack', '2763266', 'wk5tb7jbvrxnl'],
    members: [
      'who-captures-amapiano-value-capture-report',
      'brand-study-the-springbok-world-champion-under-owned',
    ],
  },
  {
    slug: 'full-shelf',
    match: ['full-shelf', '2763268', '87432783e3tw2'],
    members: [
      'who-captures-amapiano-value-capture-report',
      'brand-study-the-springbok-world-champion-under-owned',
      'whos-buying-african-sport-2026',
    ],
  },
];

/** Find the bundle a charge payload is buying, or null. Check BEFORE matchReport. */
export function matchBundle(payloadBlob: string): { slug: string } | null {
  const b = payloadBlob.toLowerCase();
  return BUNDLES_DELIVERY.find((x) => x.match.some((t) => b.includes(t))) ?? null;
}

/** Deliver every member report of a bundle (each as its own stamped PDF email). */
export async function deliverBundle(email: string, admin: Admin, bundleSlug: string): Promise<DeliveryResult> {
  const bundle = BUNDLES_DELIVERY.find((x) => x.slug === bundleSlug);
  const record = async (r: DeliveryResult): Promise<DeliveryResult> => {
    try {
      await admin.from('report_deliveries').insert({ email, report: bundleSlug, status: r.status, detail: r.detail });
    } catch {
      /* observability only */
    }
    return r;
  };
  if (!bundle) return record({ status: 'failed', detail: `unknown bundle ${bundleSlug}` });
  const results: DeliveryResult[] = [];
  for (const slug of bundle.members) results.push(await deliverReport(email, admin, slug));
  const sent = results.filter((r) => r.status === 'sent').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const status: DeliveryResult['status'] = sent > 0 ? 'sent' : skipped === results.length ? 'skipped' : 'failed';
  return record({ status, detail: `${sent}/${bundle.members.length} member reports delivered` });
}
