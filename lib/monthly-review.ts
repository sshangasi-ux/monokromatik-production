// Monthly Strategy Review — an automated, internal-data-grounded version of the
// deep manual review in docs/STRATEGY-REVIEW.md. It MEASURES the site against the
// strategic bars (depth-per-piece, Index scale, proof, performance, search) and
// asks the flagship model to write an honest monthly assessment + a short,
// prioritised action list in the house voice.
//
// Scope + honesty: this is the *internal-telemetry* review — it grounds only on
// what the repo and the analytics know (article depth, case-study rigour, Index
// size + movement, GA4 performance, GSC opportunities, the learning ledger). It
// is deliberately NOT the deep competitive web-research pass (that stays a
// periodic manual exercise). Fail-soft: with no ANTHROPIC_API_KEY it still emits
// the full data section — only the narrative is skipped.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { MODELS } from './ai-models';
import { withRetry } from './ai-retry';
import { getAllCaseStudies } from './case-studies';
import { rankIndex } from './signal-index';
import { getHistory, getMovers } from './index-history';
import { getLearningSignals, describeSignals } from './learning-signals';
import { generatePerformanceReport } from './analyze-performance';
import { getSearchInsights } from './search-console';
import { evidenceByBrand } from './evidence-strength';

const REPO_ROOT = join(__dirname, '..');

interface ArticleLite { content?: string; brandRead?: unknown; videoUrl?: string; }
interface ReportLite { status?: string; }
interface CaseLite { sources?: unknown[]; evidence?: { confirmed?: unknown[]; reported?: unknown[] }; verification?: string; }

const median = (xs: number[]): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const wordCount = (html: string): number =>
  (html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

export interface SiteState {
  generatedAt: string;
  articles: { count: number; medianWords: number; withBrandRead: number; withVideo: number };
  caseStudies: { count: number; avgSources: number; avgEvidence: number; verified: number; partial: number };
  evidence: { strong: number; moderate: number; developing: number; medianScore: number };
  index: { brands: number; works: number; snapshots: number; top: { brand: string; score: number }[]; climbers: number; newcomers: number; since: string | null };
  reports: { count: number; live: number };
  learning: string;
  performance: { configured: boolean; scored: number; stars: number; kills: number; topCategories: { category: string; pageviews: number }[]; topSources: { source: string; pageviews: number }[] };
  search: { configured: boolean; queries: number; opportunities: { query: string; position: number; impressions: number }[] };
}

/** Read a JSON data file, tolerantly. */
function readData<T>(rel: string, fallback: T): T {
  try {
    const p = join(REPO_ROOT, rel);
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf-8')) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Gather the full internal-telemetry snapshot. No-op-safe for unconfigured GA4/GSC. */
export async function gatherState(perfWindowDays = 30): Promise<SiteState> {
  const articles = readData<ArticleLite[]>('data/articles.json', []);
  const reports = readData<ReportLite[]>('data/reports.json', []);
  // Report against ALL scored works, matching the public Index (ratings are
  // public; only the full analysis is gated) — not the public-only subset.
  const studies = getAllCaseStudies() as unknown as CaseLite[];

  const words = articles.map((a) => wordCount(a.content || '')).filter((n) => n > 0);
  const withVideo = articles.filter((a) => Boolean(a.videoUrl)).length;

  const ranked = rankIndex(getAllCaseStudies());
  const works = ranked.reduce((n, e) => n + (e.works || 0), 0);
  const movers = getMovers(5);

  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
  const sourceCounts = studies.map((c) => (c.sources?.length ?? 0));
  const evidenceCounts = studies.map((c) => (c.evidence?.confirmed?.length ?? 0) + (c.evidence?.reported?.length ?? 0));

  // Measured Evidence Strength distribution across ranked brands.
  const evMap = evidenceByBrand(getAllCaseStudies());
  const evScores = [...evMap.values()].map((e) => e.score).sort((a, b) => a - b);
  const evTier = (t: string) => [...evMap.values()].filter((e) => e.tier === t).length;

  // GA4 + GSC: both return gracefully (empty/null) when not configured.
  const perf = await generatePerformanceReport(perfWindowDays).catch(() => null);
  const search = await getSearchInsights(28).catch(() => null);

  return {
    generatedAt: new Date().toISOString(),
    articles: {
      count: articles.length,
      medianWords: median(words),
      withBrandRead: articles.filter((a) => a.brandRead).length,
      withVideo,
    },
    caseStudies: {
      count: studies.length,
      avgSources: avg(sourceCounts),
      avgEvidence: avg(evidenceCounts),
      verified: studies.filter((c) => (c.verification || '').toLowerCase() === 'verified').length,
      partial: studies.filter((c) => (c.verification || '').toLowerCase() === 'partial').length,
    },
    evidence: {
      strong: evTier('Strong'),
      moderate: evTier('Moderate'),
      developing: evTier('Developing'),
      medianScore: evScores.length ? evScores[Math.floor(evScores.length / 2)] : 0,
    },
    index: {
      brands: ranked.length,
      works,
      snapshots: getHistory().length,
      top: ranked.slice(0, 5).map((e) => ({ brand: e.brand, score: e.score })),
      climbers: movers.climbers.length,
      newcomers: movers.newcomers.length,
      since: movers.since,
    },
    reports: { count: reports.length, live: reports.filter((r) => (r.status || '').toLowerCase() === 'live').length },
    learning: describeSignals(getLearningSignals()) || 'no signal yet',
    performance: {
      configured: Boolean(perf && perf.articles.length),
      scored: perf?.articles.length ?? 0,
      stars: perf?.articles.filter((a) => a.verdict === 'star').length ?? 0,
      kills: perf?.articles.filter((a) => a.verdict === 'kill').length ?? 0,
      topCategories: perf?.topCategories.slice(0, 5) ?? [],
      // Referral sources — surfaced in the daily brief so social distribution
      // (LinkedIn in particular) is measured, not assumed.
      topSources: perf?.topSources.slice(0, 8) ?? [],
    },
    search: {
      configured: Boolean(search),
      queries: search?.topQueries.length ?? 0,
      opportunities: (search?.opportunities ?? []).slice(0, 6).map((o) => ({ query: o.key, position: Math.round(o.position * 10) / 10, impressions: o.impressions })),
    },
  };
}

/** The data section — always emitted, even when the model is unavailable. */
export function renderDataSection(s: SiteState): string {
  const L: string[] = [];
  L.push('## The numbers\n');
  L.push('| Metric | Value | Strategic bar |');
  L.push('|---|---|---|');
  L.push(`| Articles | ${s.articles.count} (median ${s.articles.medianWords} words) | flagship pieces 1,800–3,000+ words |`);
  L.push(`| — with Brand Read | ${s.articles.withBrandRead} | the intelligence layer |`);
  L.push(`| — with video | ${s.articles.withVideo} | richer media |`);
  L.push(`| Case studies | ${s.caseStudies.count} · avg ${s.caseStudies.avgSources} sources / ${s.caseStudies.avgEvidence} evidence | 8–15 sources, evidence ledger |`);
  L.push(`| — verification | ${s.caseStudies.verified} verified · ${s.caseStudies.partial} partial | push top entries to verified |`);
  L.push(`| Evidence Strength (measured) | median ${s.evidence.medianScore}/100 · ${s.evidence.strong} Strong / ${s.evidence.moderate} Moderate / ${s.evidence.developing} Developing | deepen corroboration → climb tiers |`);
  L.push(`| Index | ${s.index.brands} brands / ${s.index.works} works | scale to 150–300+ works, >1 work/brand |`);
  L.push(`| Index snapshots | ${s.index.snapshots} (${s.index.climbers} climbers, ${s.index.newcomers} new since ${s.index.since ?? '—'}) | a recurring "reveal" ritual |`);
  L.push(`| Reports | ${s.reports.count} (${s.reports.live} live) | one original data point each |`);
  L.push(`| Learning ledger | ${s.learning} | curator bias toward winners |`);
  L.push(`| GA4 performance | ${s.performance.configured ? `${s.performance.scored} scored · ${s.performance.stars}★ / ${s.performance.kills} kill` : 'not yet reporting data'} | kill what doesn't work |`);
  L.push(`| GSC | ${s.search.configured ? `${s.search.queries} queries · ${s.search.opportunities.length} page-2 opportunities` : 'not yet reporting data'} | win the near-miss rankings |`);
  if (s.index.top.length) {
    L.push(`\n**Top of the Index:** ${s.index.top.map((t) => `${t.brand} (${t.score})`).join(' · ')}`);
  }
  if (s.search.opportunities.length) {
    L.push(`\n**Closest SEO wins (page-2 rank, real impressions):** ${s.search.opportunities.map((o) => `"${o.query}" #${o.position}`).join(' · ')}`);
  }
  return L.join('\n');
}

const RUBRIC = `MonoKromatik is an African & diaspora brand-intelligence editorial network. Its moat is the Cultural-Signal Index (a 4-axis, authorship-weighted /100 score over case studies) and depth. The unoccupied lane is "Brand Finance / CB Insights for who owns the upside of African culture." The strategic bars (from docs/STRATEGY-REVIEW.md): (1) depth — flagship pieces 1,800–3,000+ words of original argument; (2) Index — scale to 150–300+ scored works with multiple works per brand, anchor the score with a measured input, name a human authority, productise it (share-card + badge shipped); (3) proof — named methodology, public sample scorecard, named analysts, client logos; (4) revenue — rating-agency mix (data + badge licensing, single-sponsor, a small sponsor-underwritten event), not a subscription grind; (5) media — the Index share-loop, collectible covers, AI Audio Editions, one short-form format.`;

/**
 * Produce the full monthly review markdown. Grounds the model strictly on the
 * measured state; fail-soft to the data section alone if the model is
 * unavailable or errors.
 */
export async function generateMonthlyReview(monthLabel: string): Promise<string> {
  const state = await gatherState();
  const dataSection = renderDataSection(state);
  const header = `# MonoKromatik — Monthly Strategy Review · ${monthLabel}\n\n*Automated internal-telemetry review (the deep competitive web-research pass stays a periodic manual exercise). Grounded only on what the repo + analytics measured as of ${state.generatedAt.slice(0, 10)}.*`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return `${header}\n\n${dataSection}\n\n## Assessment\n\n_Narrative skipped — ANTHROPIC_API_KEY not set. The numbers above are the review this month._\n`;
  }

  const ai = new Anthropic({ apiKey });
  const prompt = `${RUBRIC}\n\nHere is this month's measured state as JSON:\n\n${JSON.stringify(state, null, 2)}\n\nWrite the monthly assessment as GitHub Markdown with exactly these sections:\n\n### What the numbers say\nA short, honest read of the telemetry — what changed, what stands out, what's worrying. Cite the actual numbers. 2–4 tight paragraphs.\n\n### Movement on the strategic bars\nFor each bar (depth · Index · proof · revenue/productisation · media), one line: are we closer or not, grounded in the data. Mark clear wins and clear gaps.\n\n### Do next (prioritised)\n3–5 specific, shippable actions for the coming month, ordered by leverage ÷ effort. Each: a bold imperative title + one sentence of why, tied to a number above. No vague advice.\n\nRules: house voice (sharp, plain, honest — no hype, no filler). Never invent numbers not in the JSON. If a metric reads "not yet reporting data," say the loop isn't live yet rather than guessing. Be concise — the whole thing under ~600 words.`;

  try {
    const res = await withRetry(() =>
      ai.messages.create({
        model: MODELS.flagship,
        max_tokens: 2200,
        messages: [{ role: 'user', content: prompt }],
      })
    );
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!text) throw new Error('empty model response');
    return `${header}\n\n${dataSection}\n\n${text}\n`;
  } catch (e) {
    return `${header}\n\n${dataSection}\n\n## Assessment\n\n_Narrative unavailable this run (${(e as Error).message}). The numbers above stand on their own._\n`;
  }
}
