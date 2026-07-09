// MonoKromatik — targeted gap discovery (Planner v2, the "commission" layer).
//
// Planner v1 was still reactive: it re-weighted whatever Scout's RSS pool happened
// to surface, so a cell with NO feed (or a quiet one) stayed empty no matter how
// high its priority. This module closes that loop: it reads the coverage plan,
// takes the thinnest cells, and ACTIVELY searches the live web for real, citable
// story leads to fill them — the difference between "boost gap stories if any show
// up" and "go find stories for the gap."
//
// Output is a set of cited LEADS for the Curator/editor to commission — never
// auto-published. Integrity contract mirrors the content engine: real sources
// only, no fabrication, honest emptiness when a cell yields nothing.

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { sourceRegion, type CoveragePlan, type GapBrief } from './coverage-planner';
import { offBeat } from './breaking';
import type { EditorialFranchise } from './editorial-franchises';
import type { Story } from './rss-feeds';

let _anthropic: Anthropic | null = null;
// Patient retries: non-interactive cron, so ride out transient 429/5xx/529.
const client = () => (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 5 }));

const ts = () => new Date().toISOString();
const log = (m: string) => console.log(`[${ts()}] [gap-discovery] ${m}`);

export interface GapLead {
  title: string;
  summary: string;
  url: string;
  source?: string;
  why: string; // why it fits this region × franchise cell
}

export interface GapCellResult {
  region: string;
  category: string;
  sourced: boolean;
  leads: GapLead[];
  searches: number;
  error?: string;
}

/**
 * Pick the cells to commission this run. The plan's gaps are already sorted
 * thinnest-first; we take the top `max` but bias toward a spread of regions so a
 * single empty region can't monopolise the whole run.
 */
export function selectGapCells(plan: CoveragePlan, max = 4): GapBrief[] {
  const picked: GapBrief[] = [];
  const seenRegions = new Set<string>();
  // First pass: thinnest gap per distinct region.
  for (const g of plan.gaps) {
    if (picked.length >= max) break;
    if (seenRegions.has(g.region)) continue;
    picked.push(g);
    seenRegions.add(g.region);
  }
  // Second pass: backfill with the next-thinnest regardless of region.
  for (const g of plan.gaps) {
    if (picked.length >= max) break;
    if (!picked.includes(g)) picked.push(g);
  }
  return picked;
}

/** A web-search query tuned to a (region, category) coverage cell. */
export function gapSearchQuery(cell: GapBrief): string {
  const where = cell.region === 'Diaspora' ? 'the African diaspora' : `${cell.region}`;
  return `recent 2026 ${cell.category} stories from ${where} with brand, culture or business significance — real, current, from reputable outlets`;
}

const SYSTEM = `You are a MonoKromatik commissioning scout for African & Diaspora brand-culture
coverage. You find REAL, CURRENT, citable story leads — never invented ones.
Rules: every lead must come from a reputable source you actually found via search,
with a working URL; no fabricated headlines, outlets or facts; if a cell genuinely
has little, return fewer leads (or none) rather than padding. Today: ${new Date()
  .toISOString()
  .slice(0, 10)}.`;

function parseLeads(text: string): GapLead[] {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : (text.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0] ?? '');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Partial<GapLead>[];
    return arr
      .filter((l) => l && l.title && l.url)
      .map((l) => ({
        title: String(l.title),
        summary: String(l.summary ?? ''),
        url: String(l.url),
        source: l.source ? String(l.source) : undefined,
        why: String(l.why ?? ''),
      }));
  } catch {
    return [];
  }
}

/** Shared search core: web-search for leads matching one `label`/`query`. Fail-safe. */
async function searchLeads(
  label: string,
  fit: string,
  query: string,
  maxUses: number
): Promise<{ leads: GapLead[]; searches: number; error?: string }> {
  log(`${label}: searching (≤${maxUses})…`);
  try {
    const message = await client().beta.messages.create({
      model: MODELS.flagship,
      max_tokens: 1600,
      system: SYSTEM,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: maxUses }],
      messages: [
        {
          role: 'user',
          content: `Find up to 3 recent, real, citable story leads for "${label}". ${query}\n\nSearch first, then output ONLY a JSON array (in a \`\`\`json fence) of objects: {"title","summary","url","source","why"}. "why" = one line on why it fits ${fit}. Return [] if you cannot find real ones.`,
        },
      ],
    });
    const text = message.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const searches = message.content.filter((b) => b.type === 'web_search_tool_result').length;
    const leads = parseLeads(text);
    log(`${label}: ${leads.length} lead(s), ${searches} searches`);
    return { leads, searches };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`${label}: FAILED — ${msg}`);
    return { leads: [], searches: 0, error: msg };
  }
}

/** Search the live web for leads that fill one Region × Category coverage cell. */
export async function discoverForCell(
  cell: GapBrief,
  opts: { maxSearches?: number } = {}
): Promise<GapCellResult> {
  const label = `${cell.region} × ${cell.category}`;
  const r = await searchLeads(label, label, gapSearchQuery(cell), opts.maxSearches ?? 4);
  return { region: cell.region, category: cell.category, sourced: cell.sourced, ...r };
}

// What each editorial franchise is hunting for — the commissioning remit.
const FRANCHISE_QUERY: Record<EditorialFranchise, string> = {
  'The Work':
    'a recent (2026) African or diaspora brand campaign, collaboration or product move worth a case-study decode — real, well-sourced.',
  'Will It Land?':
    'a globally celebrated 2026 campaign or brand move whose relevance to African markets is genuinely debatable — the kind worth stress-testing.',
  'Brand Weather':
    'a 2026 African consumer, market or brand-landscape shift (data, report, structural change) worth a briefing.',
  'The Boardroom':
    'an African or diaspora brand, marketing or creative-industry leader making news in 2026 — a credible interview/profile subject.',
  Roots: 'a current African or diaspora heritage / legacy cultural moment with brand or business resonance.',
  Arena: 'a current African or diaspora sport moment with brand, culture or commercial significance.',
  Waves: 'a current African or diaspora music, screen, style or internet-culture moment with commercial weight.',
  Unclassified: 'a notable recent African or diaspora brand-culture story.',
};

// ── Deterministic pool discovery (credit-free fallback) ──────────────────────
// When no Anthropic key / credits are available, we can't web-search the open
// web — but we CAN surface real, citable leads from the RSS story pool the Scout
// already fetched (free). A "gap" is an UNDER-PUBLISHED cell, so a sourced cell
// (a feed exists but the editor hasn't covered it lately) usually has fresh pool
// items to commission. Unsourced cells (no feed — Diaspora, North/Central) yield
// nothing here, and we say so: honest emptiness, never fabrication.

const MAX_POOL_LEADS = 3;

// A COMMISSIONABLE signal — the pool carries plenty of general-interest news even
// inside a culture/entertainment feed (race incidents, accidents, viral drama),
// which is real but off our brand-culture remit. Without the AI's interpretation,
// we require a positive brand / business / music / screen / fashion / sport signal
// in the headline; anything without one is skipped (honest emptiness > padding).
// Deliberately STRONG nouns only — ambiguous verbs (launch/drops/raised/star)
// match incidentally ("FIFA launches investigation", "raised by…"), so they're out.
const BEAT_SIGNAL_RE = /\b(brand\w*|campaign|rebrand|album|mixtape|\bep\b|music video|concert|tour|festival|\bfilm\b|movie|cinema|nollywood|box office|series|premiere|netflix|showmax|prime video|grammy|oscar|bet awards?|nomination|fashion|designer|runway|couture|sponsor\w*|endorsement|signing|transfer|startup|funding|\bipo\b|acquisition|merger|streaming|record label|afrobeat\w*|amapiano|championship|trophy|\bmedal\b|award\w*)\b/i;

// Off-beat if EITHER the headline or the excerpt trips the exclusion — clickbait
// headlines often hide the real (off-remit) subject in the body.
function poolOffBeat(s: Story): boolean {
  return offBeat(s.title) || offBeat(s.excerpt || '');
}

function storyToLead(s: Story, why: string): GapLead {
  return {
    title: s.title,
    summary: (s.excerpt || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    url: s.link,
    source: s.source,
    why,
  };
}

/** Real RSS leads whose (source→region, category) match a thin cell. Newest-first. */
export function discoverForCellFromPool(cell: GapBrief, stories: Story[]): GapCellResult {
  const cat = cell.category.toLowerCase();
  const leads = stories
    .filter((s) => s.link && !poolOffBeat(s) && BEAT_SIGNAL_RE.test(s.title) && (s.category || '').toLowerCase() === cat && sourceRegion(s.source) === cell.region)
    .slice(0, MAX_POOL_LEADS)
    .map((s) => storyToLead(s, `Fresh ${s.category} from ${s.source} — fills ${cell.region} × ${cell.category}.`));
  return { region: cell.region, category: cell.category, sourced: cell.sourced, leads, searches: 0 };
}

/**
 * Deterministic region×category brief: walk the plan's gaps thinnest-first and,
 * for each SOURCED cell (a feed exists — the pool can actually fill it), pull the
 * freshest matching pool stories. Unsourced cells (Diaspora, North/Central, and
 * the `news` axis the Scout pool doesn't carry) can't be filled from the pool, so
 * they're skipped here rather than reported empty. Returns up to `max` cells that
 * genuinely have leads — real, commissionable stories, never fabricated.
 */
export function discoverGapsFromPool(plan: CoveragePlan, stories: Story[], max = 4): GapCellResult[] {
  const out: GapCellResult[] = [];
  for (const g of plan.gaps) {
    if (out.length >= max) break;
    if (!g.sourced) continue;
    const r = discoverForCellFromPool(g, stories);
    if (r.leads.length) out.push(r);
  }
  return out;
}

// Franchise → how to match pool stories (feed category and/or a title keyword).
const FRANCHISE_POOL_MATCH: Record<EditorialFranchise, { cats?: string[]; kw?: RegExp }> = {
  Roots: { cats: ['culture'] },
  Arena: { cats: ['sports'] },
  Waves: { cats: ['music', 'entertainment'] },
  'The Work': { kw: /\b(campaign|brand|launch\w*|collab\w*|rebrand|advert\w*|marketing|product|partner\w*|sponsor\w*)\b/i },
  'Will It Land?': { kw: /\b(global|worldwide|international|campaign|launch\w*|viral|super bowl|brand)\b/i },
  'Brand Weather': { kw: /\b(market\w*|report|consumer\w*|econom\w*|data|growth|sales|spend\w*|inflation|revenue|industry)\b/i },
  'The Boardroom': { kw: /\b(ceo|founder|co-?founder|appoint\w*|leader\w*|executive|chief|managing director|chairman|chairperson)\b/i },
  Unclassified: {},
};

/** Real RSS leads matching an editorial franchise. Newest-first. */
export function discoverForFranchiseFromPool(franchise: EditorialFranchise, stories: Story[]): GapCellResult {
  const m = FRANCHISE_POOL_MATCH[franchise] || {};
  const leads = stories
    .filter((s) => {
      if (!s.link || poolOffBeat(s)) return false;
      if (m.cats && !m.cats.includes((s.category || '').toLowerCase())) return false;
      if (m.kw && !m.kw.test(s.title)) return false;
      // Franchises matched only by category (Roots/Arena/Waves) still need a
      // commissionable signal; keyword-matched franchises already carry one.
      if (!m.kw && !BEAT_SIGNAL_RE.test(s.title)) return false;
      return true;
    })
    .slice(0, MAX_POOL_LEADS)
    .map((s) => storyToLead(s, `Matches ${franchise} — from ${s.source}.`));
  return { region: franchise, category: 'franchise', sourced: true, leads, searches: 0 };
}

/** Search the live web for a lead to commission within one editorial franchise. */
export async function discoverForFranchise(
  franchise: EditorialFranchise,
  opts: { maxSearches?: number } = {}
): Promise<GapCellResult> {
  const r = await searchLeads(
    `Franchise: ${franchise}`,
    `the ${franchise} franchise`,
    FRANCHISE_QUERY[franchise],
    opts.maxSearches ?? 4
  );
  // Reuse GapCellResult: region carries the franchise, category the axis label.
  return { region: franchise, category: 'franchise', sourced: true, ...r };
}
