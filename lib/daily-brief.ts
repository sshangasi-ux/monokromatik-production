// The Operator's Daily Brief — a deterministic, no-API review of backend
// operations built to help GROW, REFINE, MINE INSIGHT and land MONETISATION.
// It reuses the monthly-review telemetry (content/Index/GA4/GSC/learning) and
// adds a monetisation lens (which revenue lines are live vs dormant), a
// product-refinement lens (Index credibility levers) and rule-based, prioritised
// actions. No Anthropic dependency — it delivers full value every day, and is
// emailed to the operator via Resend (with a repo-committed copy as backup).

import { gatherState, type SiteState } from './monthly-review';
import { reportCheckoutUrl, membershipCheckoutUrl, DATA_PRODUCTS, MEMBERSHIP } from './commerce';
import { getPublicCaseStudies } from './case-studies';

export interface Monetisation {
  reportCheckoutLive: boolean;
  membershipIndividualLive: boolean;
  membershipTeamLive: boolean;
  membershipPrices: string[];
  dataProductBands: string[];
  badgeAssetBuilt: boolean; // /api/badge exists; a licensable line not yet sold
}

export interface OpsSnapshot extends SiteState {
  monetisation: Monetisation;
  media: { caseStudiesTotal: number; withStill: number; withVideo: number };
}

/** Gather the full operational picture. GA4/GSC are no-op-safe when unconfigured. */
export async function gatherOps(): Promise<OpsSnapshot> {
  const state = await gatherState(7); // 7-day window suits a daily cadence
  const cs = getPublicCaseStudies();

  return {
    ...state,
    monetisation: {
      reportCheckoutLive: Boolean(reportCheckoutUrl()),
      membershipIndividualLive: Boolean(membershipCheckoutUrl('individual')),
      membershipTeamLive: Boolean(membershipCheckoutUrl('team')),
      membershipPrices: MEMBERSHIP.map((t) => `${t.name} ${t.priceMonthly}${t.priceAnnual ? `/${t.priceAnnual}` : ''}`),
      dataProductBands: DATA_PRODUCTS.map((d) => `${d.title} ${d.priceFrom}`),
      badgeAssetBuilt: true,
    },
    media: {
      caseStudiesTotal: cs.length,
      withStill: cs.filter((c) => c.media && c.media.length > 0).length,
      withVideo: cs.filter((c) => Boolean(c.videoUrl)).length,
    },
  };
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

/**
 * Turn the snapshot into rule-based, prioritised actions across the four goals.
 * Deterministic: each action fires off a real threshold in the data.
 */
export function deriveActions(o: OpsSnapshot): { grow: string[]; refine: string[]; mine: string[]; monetise: string[] } {
  const grow: string[] = [];
  const refine: string[] = [];
  const mine: string[] = [];
  const monetise: string[] = [];

  // MONETISE — the highest-leverage, most-neglected goal.
  if (!o.monetisation.membershipIndividualLive) monetise.push('**Membership checkout is dormant** — set `NEXT_PUBLIC_PAYSTACK_MEMBERSHIP_INDIVIDUAL_URL` so the R149/R1,490 tier can actually be bought. No live checkout = zero revenue from the biggest funnel.');
  if (!o.monetisation.reportCheckoutLive) monetise.push('**Index Full Report checkout is dormant** — wire `NEXT_PUBLIC_PAYSTACK_REPORT_URL` to sell the one-time report to the traffic already landing on the Index.');
  monetise.push('**Switch on badge licensing** — the `/api/badge/[brand]` embed is built but unsold; offer ranked brands a paid "Ranked by MonoKromatik" badge ($10–25K/logo, ~95% margin — the rating-agency double-monetisation).');
  if (o.index.brands >= 25) monetise.push(`**Pitch data licences** — ${o.index.brands} ranked brands is enough to sell a category league table (from $1,250) or a Scorecard (from $900). Land 2–3 paying pilots to publish as proof.`);

  // GROW — traffic, SEO, audience, depth.
  if (o.search.configured && o.search.opportunities.length) {
    grow.push(`**Convert ${o.search.opportunities.length} page-2 SEO near-misses** — improve title/intro/internal links on: ${o.search.opportunities.slice(0, 3).map((x) => `"${x.query}" (#${x.position})`).join(', ')}.`);
  } else if (!o.search.configured) {
    grow.push('GSC loop not returning data yet — confirm the service account + `GSC_SITE_URL` so near-miss ranking opportunities surface daily.');
  }
  if (o.articles.medianWords < 1200) grow.push(`**Raise flagship depth** — article median is ${o.articles.medianWords} words vs a 1,500–3,000 premium floor. Publish fewer, deeper flagship pieces to lift dwell + authority.`);
  if (o.performance.configured && o.performance.kills > 0) grow.push(`**Retire ${o.performance.kills} under-performers** (GA4) and redirect the effort to proven categories.`);

  // MINE INSIGHT — what's resonating; what to make next.
  if (o.learning && o.learning !== 'no signal yet') mine.push(`**Audience is telling you what wins:** ${o.learning}. Bias the next content + case-study load toward the positive categories.`);
  if (o.performance.configured && o.performance.topCategories.length) mine.push(`Top categories by views: ${o.performance.topCategories.slice(0, 3).map((c) => c.category).join(', ')} — commission more here.`);
  mine.push('**Feed the Index from the radar** — the newly-added trade feeds (TechCabal, African Business, Music In Africa, Variety, The EastAfrican) should surface fresh case-study candidates; sweep them for the next `casestudy:author` batch.');

  // REFINE — Index credibility + product health.
  if (o.evidence.strong === 0) refine.push(`**No "Strong" evidence tiers yet** — verify the sources on the top-scoring works and upgrade them to \`verified\`; that's what lifts Evidence Strength from Moderate to Strong and makes the score buyer-grade.`);
  if (o.index.works <= o.index.brands) refine.push('**Every brand still has one work** — add a 2nd/3rd scored work to your top brands so the Index means are real (the scale + credibility lever).');
  if (o.media.withStill < o.media.caseStudiesTotal) refine.push(`**${o.media.caseStudiesTotal - o.media.withStill} case studies lack a hero still** — run \`npx tsx scripts/heal-media.ts\` (or let the media watchdog) to backfill.`);
  if (o.index.newcomers > 0 || o.index.climbers > 0) refine.push(`**The Index moved** (${o.index.climbers} climbed, ${o.index.newcomers} new since ${o.index.since}) — publish the Movers reveal to social; the share loop is your cheapest growth.`);

  return { grow, refine, mine, monetise };
}

/** Render the brief as Markdown (used for email, the run summary and the repo copy). */
export function renderBrief(o: OpsSnapshot, dateLabel: string): string {
  const a = deriveActions(o);
  const L: string[] = [];
  L.push(`# MonoKromatik — Operator's Daily Brief · ${dateLabel}`);
  L.push(`\n*Backend operations, growth, monetisation and insight — grounded in what the repo + analytics measured today. Deterministic (no AI dependency); the deep strategic take is the monthly review.*`);

  L.push('\n## State of the machine\n');
  L.push('| Area | Now |');
  L.push('|---|---|');
  L.push(`| Content | ${o.articles.count} articles (median ${o.articles.medianWords}w · ${pct(o.articles.withBrandRead, o.articles.count)}% with a Brand Read · ${o.articles.withVideo} with video) |`);
  L.push(`| The Index | ${o.index.brands} brands / ${o.index.works} works · ${o.index.snapshots} snapshots · evidence: ${o.evidence.strong} Strong / ${o.evidence.moderate} Moderate / ${o.evidence.developing} Developing |`);
  L.push(`| Case-study media | ${o.media.withStill}/${o.media.caseStudiesTotal} with a still · ${o.media.withVideo} with video |`);
  L.push(`| Reports · Issues | ${o.reports.count} reports (${o.reports.live} live) · ${o.index.snapshots} Index snapshots |`);
  L.push(`| GA4 | ${o.performance.configured ? `${o.performance.scored} scored · ${o.performance.stars}★ / ${o.performance.kills} kill (7d)` : 'not returning data'} |`);
  L.push(`| Search (GSC) | ${o.search.configured ? `${o.search.queries} queries · ${o.search.opportunities.length} page-2 opportunities` : 'not returning data'} |`);
  L.push(`| Learning ledger | ${o.learning} |`);

  L.push('\n## Monetisation status\n');
  L.push(`- Membership checkout — individual: **${o.monetisation.membershipIndividualLive ? 'LIVE' : 'DORMANT'}** · team: **${o.monetisation.membershipTeamLive ? 'LIVE' : 'DORMANT'}** (${o.monetisation.membershipPrices.join(' · ')})`);
  L.push(`- Index Full Report checkout: **${o.monetisation.reportCheckoutLive ? 'LIVE' : 'DORMANT'}**`);
  L.push(`- Data licences (enquiry-led): ${o.monetisation.dataProductBands.join(' · ')}`);
  L.push(`- Badge licensing (\`/api/badge\`): **built, not yet sold** — a rating-agency revenue line left on the floor.`);

  const section = (title: string, items: string[]) => {
    L.push(`\n## ${title}\n`);
    if (items.length) items.forEach((i, n) => L.push(`${n + 1}. ${i}`));
    else L.push('_Nothing flagged today._');
  };
  section('💰 Monetise', a.monetise);
  section('📈 Grow', a.grow);
  section('🧠 Mine insight', a.mine);
  section('🛠️ Refine', a.refine);

  L.push('\n---\n*Reply to steer tomorrow\'s brief. The monthly strategy review (deeper, competitive) runs on the 1st.*');
  return L.join('\n');
}

/** Minimal Markdown → HTML for the email body. */
export function briefToHtml(markdown: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/_(.+?)_/g, '<em>$1</em>');
  const rows: string[] = [];
  let inTable = false;
  for (const raw of markdown.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('|')) {
      if (line.includes('---')) continue;
      const cells = line.split('|').slice(1, -1).map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${inline(c.trim())}</td>`).join('');
      if (!inTable) { rows.push('<table style="border-collapse:collapse;width:100%;margin:8px 0">'); inTable = true; }
      rows.push(`<tr>${cells}</tr>`);
      continue;
    }
    if (inTable) { rows.push('</table>'); inTable = false; }
    if (line.startsWith('# ')) rows.push(`<h1 style="font-size:20px;margin:16px 0 4px">${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('## ')) rows.push(`<h2 style="font-size:15px;margin:18px 0 6px;color:#cc6f3a">${inline(line.slice(3))}</h2>`);
    else if (/^\d+\.\s/.test(line)) rows.push(`<p style="margin:6px 0;font-size:13px">${inline(line)}</p>`);
    else if (line.startsWith('- ')) rows.push(`<p style="margin:4px 0;font-size:13px">• ${inline(line.slice(2))}</p>`);
    else if (line.startsWith('---')) rows.push('<hr style="border:none;border-top:1px solid #eee;margin:16px 0">');
    else if (line.startsWith('*') && line.endsWith('*')) rows.push(`<p style="color:#888;font-size:12px;font-style:italic;margin:6px 0">${inline(line.replace(/^\*|\*$/g, ''))}</p>`);
    else if (line) rows.push(`<p style="margin:6px 0;font-size:13px">${inline(line)}</p>`);
  }
  if (inTable) rows.push('</table>');
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;color:#141414">${rows.join('')}</div>`;
}
