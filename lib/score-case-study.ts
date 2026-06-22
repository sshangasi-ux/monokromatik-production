// Cultural-Signal Index — Phase 3: AI-drafted decode (closes the engine loop).
//
// Proposes the four-axis decode (IDEA / AUTHORSHIP / EXECUTION / CONSEQUENCE,
// 1–5 + a note) for a case study from its own evidence. This is a DRAFT for
// human approval — it is never written to data/case-studies.json automatically.
// Per docs/AI_ORCHESTRATION_ARCHITECTURE.md, case-study scoring is human-gated;
// the AI only drafts.

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import type { CaseStudy, CaseStudyDecode } from './case-studies';

// Lazy client (same reason as the other agents — env is parsed after import).
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

const CANON = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;

export interface DecodeDraft {
  decode: CaseStudyDecode[];
  rationale: string;
}

/**
 * Validate + repair a raw model response into a canonical 4-axis decode. Pure
 * and exported so it can be unit-tested without an API call. Returns null if a
 * required axis is missing or a level is unparseable (→ editor scores by hand).
 */
export function validateDecodeDraft(raw: unknown): DecodeDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as { decode?: unknown; rationale?: unknown };
  if (!Array.isArray(obj.decode)) return null;

  const byLabel = new Map<string, { level?: unknown; note?: unknown }>();
  for (const d of obj.decode) {
    if (d && typeof d === 'object' && typeof (d as { label?: unknown }).label === 'string') {
      byLabel.set((d as { label: string }).label.trim().toUpperCase(), d as { level?: unknown; note?: unknown });
    }
  }

  const decode: CaseStudyDecode[] = [];
  for (const label of CANON) {
    const d = byLabel.get(label);
    if (!d) return null; // missing axis → unrecoverable
    const lvl = Math.round(Number(d.level));
    if (!Number.isFinite(lvl)) return null;
    const level = Math.min(5, Math.max(1, lvl)) as 1 | 2 | 3 | 4 | 5;
    const note = typeof d.note === 'string' ? d.note.trim().slice(0, 140) : '';
    decode.push({ label, level, note });
  }

  const rationale = typeof obj.rationale === 'string' ? obj.rationale.trim() : '';
  return { decode, rationale };
}

function buildPrompt(c: CaseStudy): string {
  const join = (xs?: string[]) => (xs && xs.length ? xs.join(' ') : '—');
  return `You are MonoKromatik's analyst. Score this case study on FOUR axes, grounded ONLY in the material below — do not invent facts.

AXES (integer level 1–5 + a note ≤ 14 words):
- IDEA: originality and cultural force of the idea.
- AUTHORSHIP: who shaped it — African creative leadership vs localisation. 1 = a global team localising; 5 = African creative leadership central to the idea, execution or ownership.
- EXECUTION: craft, narrative and product detail.
- CONSEQUENCE: what it actually moved — culture and/or commerce.

CASE: ${c.title}
BRAND: ${c.brand} · MARKET: ${c.market}
CONTEXT: ${join(c.context)}
STRATEGIC BET: ${join(c.strategicBet)}
CREATIVE MOVE: ${join(c.creativeMove)}
AFRICAN READ: ${join(c.africanRead)}
EVIDENCE — confirmed: ${join(c.evidence?.confirmed)} | reported: ${join(c.evidence?.reported)} | not claimed: ${join(c.evidence?.notClaimed)}

Output JSON only, no prose around it:
{"decode":[{"label":"IDEA","level":4,"note":"..."},{"label":"AUTHORSHIP","level":5,"note":"..."},{"label":"EXECUTION","level":4,"note":"..."},{"label":"CONSEQUENCE","level":4,"note":"..."}],"rationale":"1–2 sentences on the AUTHORSHIP call specifically."}

This is a DRAFT for human review.`;
}

/** Draft a decode for one case study. Returns null on API/parse failure (fail-open). */
export async function draftDecode(c: CaseStudy): Promise<DecodeDraft | null> {
  try {
    const message = await getClient().messages.create({
      model: MODELS.editorial,
      max_tokens: 700,
      messages: [{ role: 'user', content: buildPrompt(c) }],
    });
    const text = message.content[0]?.type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return validateDecodeDraft(JSON.parse(match[0]));
  } catch (error) {
    console.error('draftDecode failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
