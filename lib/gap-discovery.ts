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

let _anthropic: Anthropic | null = null;
const client = () => (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

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

/** Search the live web for leads that fill one coverage cell. Fail-safe. */
export async function discoverForCell(
  cell: GapBrief,
  opts: { maxSearches?: number } = {}
): Promise<GapCellResult> {
  const maxUses = opts.maxSearches ?? 4;
  log(`${cell.region} × ${cell.category}: searching (≤${maxUses})…`);
  try {
    const message = await client().beta.messages.create({
      model: MODELS.flagship,
      max_tokens: 1600,
      system: SYSTEM,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: maxUses }],
      messages: [
        {
          role: 'user',
          content: `Find up to 3 recent, real, citable story leads for the coverage cell "${cell.region} × ${cell.category}". ${gapSearchQuery(cell)}\n\nSearch first, then output ONLY a JSON array (in a \`\`\`json fence) of objects: {"title","summary","url","source","why"}. "why" = one line on why it fits ${cell.region} × ${cell.category}. Return [] if you cannot find real ones.`,
        },
      ],
    });
    const text = message.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const searches = message.content.filter((b) => b.type === 'web_search_tool_result').length;
    const leads = parseLeads(text);
    log(`${cell.region} × ${cell.category}: ${leads.length} lead(s), ${searches} searches`);
    return { region: cell.region, category: cell.category, sourced: cell.sourced, leads, searches };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`${cell.region} × ${cell.category}: FAILED — ${msg}`);
    return { region: cell.region, category: cell.category, sourced: cell.sourced, leads: [], searches: 0, error: msg };
  }
}
