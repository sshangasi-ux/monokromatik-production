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
import type { CoveragePlan, GapBrief } from './coverage-planner';
import type { EditorialFranchise } from './editorial-franchises';

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
