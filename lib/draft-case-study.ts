// Case-study drafter — the missing link that lets the content engine feed the
// Cultural-Signal Index. The engine's "intelligence" section already drafts the
// substance (a six-dimension decode + four-axis 1–5 scores + citations); this
// module produces that as a SCHEMA-COMPLETE CaseStudy object, web-grounded and
// fail-closed-validated, so it can be staged into data/case-studies.json as a
// review PR. Merging the PR is the analyst's sign-off — the model drafts, a
// human (the named analyst) reviews and signs the scores.
//
// Integrity guardrails, so auto-drafting never erodes the Index's credibility:
//   - web-sourced + cited; ≥2 real sources; no fabrication (fail-closed).
//   - verification is HARD-SET to 'partial' here, never model-chosen — so an
//     auto-draft cannot claim 'verified' and inflate Evidence Strength. The
//     analyst upgrades to 'verified' on review after checking the sources.
//   - the four-axis scores are interpretive; the composite is computed downstream.

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { withRetry } from './ai-retry';
import type { CaseStudy, CaseStudyDecode, CaseStudySource } from './case-studies';
import { compositeScore, brandSlug } from './signal-index';
import { brandEvidence } from './evidence-strength';

export const AXES = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;
export const COLLECTIONS = [
  'African-Authored Brand Moves',
  'African Authorship in Global Work',
  'Sport, Culture & Brand Belonging',
  'Diaspora Demand',
] as const;

const INTEGRITY = `You are a senior analyst at MonoKromatik, an African & Diaspora brand-intelligence
publication. You decode how ideas, work and brands move culture and capture value — with
the rigor of a research desk, never the credulity of a fan account.

NON-NEGOTIABLE INTEGRITY CONTRACT:
- WEB-SOURCED. Use the web_search tool to ground every factual beat in a real, current
  source you actually found. At least TWO independent, reputable sources with real URLs.
- NO FABRICATION. Never invent quotes, statistics, names, dates, deals or sources. If you
  cannot verify something, drop it. A thin, honest decode beats a padded one.
- EVIDENCE LEDGER. Separate what is independently CONFIRMED from what is only REPORTED by a
  single/secondary source, and state plainly what is NOT claimed (unknowns, unaudited figures).
- SCORES ARE INTERPRETIVE. The four-axis 1–5 scores are argued judgement, not fact — each
  gets a one-line justification tied to the evidence.
- VOICE: precise, declarative, African/Diaspora-centred, business-literate. No hype, no
  tabloid net-worth figures, no PR-speak.`;

export interface DraftResult {
  ok: boolean;
  caseStudy?: CaseStudy;
  score?: number; // composite preview (0–100)
  evidenceScore?: number; // measured Evidence Strength preview
  reasons: string[]; // validation notes / rejection reasons
  searches: number;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const asArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim()) : [];

function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

/** Pull the first JSON object out of a model response (tolerates prose / code fences). */
export function extractJson(text: string): unknown {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeDecode(v: unknown): CaseStudyDecode[] {
  if (!Array.isArray(v)) return [];
  const byLabel = new Map<string, CaseStudyDecode>();
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const label = str(r.label).toUpperCase();
    if (!(AXES as readonly string[]).includes(label)) continue;
    const level = Math.max(1, Math.min(5, Math.round(Number(r.level)))) as 1 | 2 | 3 | 4 | 5;
    if (!Number.isFinite(Number(r.level))) continue;
    byLabel.set(label, { label, level, note: str(r.note) });
  }
  // Return in canonical axis order, only axes that were provided.
  return AXES.map((a) => byLabel.get(a)).filter((d): d is CaseStudyDecode => Boolean(d));
}

function normalizeSources(v: unknown): CaseStudySource[] {
  if (!Array.isArray(v)) return [];
  const out: CaseStudySource[] = [];
  const seen = new Set<string>();
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const href = str(r.href) || str(r.url);
    if (!/^https?:\/\//i.test(href) || seen.has(href)) continue;
    seen.add(href);
    out.push({ publisher: str(r.publisher) || str(r.label) || 'Source', label: str(r.label) || str(r.title) || href, href, use: str(r.use) });
  }
  return out;
}

function normalizeLessons(v: unknown): { title: string; body: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map((r) => ({ title: str(r.title), body: str(r.body) }))
    .filter((l) => l.title || l.body);
}

function readingTime(cs: Pick<CaseStudy, 'context' | 'strategicBet' | 'creativeMove' | 'africanRead' | 'lessons'>): string {
  const words = [...cs.context, ...cs.strategicBet, ...cs.creativeMove, ...cs.africanRead, ...cs.lessons.map((l) => l.body)]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(3, Math.round(words / 200))} MIN READ`;
}

/**
 * Pure: turn a raw model draft into a schema-complete CaseStudy (or null if
 * fundamentally unparseable). verification is HARD-SET to 'partial'.
 */
export function assembleCaseStudy(raw: unknown, stamp: string): CaseStudy | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = str(r.title);
  const brand = str(r.brand);
  if (!title && !brand) return null;

  const ev = (r.evidence && typeof r.evidence === 'object' ? r.evidence : {}) as Record<string, unknown>;
  const base = {
    context: asArr(r.context),
    strategicBet: asArr(r.strategicBet),
    creativeMove: asArr(r.creativeMove),
    africanRead: asArr(r.africanRead),
    lessons: normalizeLessons(r.lessons),
  };
  return {
    slug: slugify(title || brand),
    title,
    standfirst: str(r.standfirst),
    brand,
    collection: (COLLECTIONS as readonly string[]).includes(str(r.collection)) ? str(r.collection) : COLLECTIONS[0],
    market: str(r.market) || '—',
    readingTime: readingTime(base),
    access: 'public',
    verification: 'partial', // hard-set — the analyst upgrades to 'verified' on review
    verificationNote: str(r.verificationNote),
    publishedAt: stamp,
    tags: asArr(r.tags).slice(0, 8),
    decode: normalizeDecode(r.decode),
    ...base,
    evidence: { confirmed: asArr(ev.confirmed), reported: asArr(ev.reported), notClaimed: asArr(ev.notClaimed) },
    pullQuotes: asArr(r.pullQuotes),
    sources: normalizeSources(r.sources),
    media: [],
  };
}

/** Fail-closed validation: only schema-complete, sourced, on-axis drafts pass. */
export function validateDraft(cs: CaseStudy | null, avoid: Set<string>): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!cs) return { ok: false, reasons: ['unparseable draft'] };
  if (!cs.brand) reasons.push('missing brand');
  else if (avoid.has(brandSlug(cs.brand))) reasons.push(`brand already scored on the Index: ${cs.brand}`);
  if (!cs.title) reasons.push('missing title');
  if (!cs.standfirst) reasons.push('missing standfirst');
  const labels = cs.decode.map((d) => d.label);
  if (cs.decode.length !== 4 || !AXES.every((a) => labels.includes(a))) reasons.push('decode must carry all four axes (IDEA, AUTHORSHIP, EXECUTION, CONSEQUENCE)');
  if (cs.decode.some((d) => !(d.level >= 1 && d.level <= 5))) reasons.push('every axis level must be 1–5');
  if (cs.decode.some((d) => !d.note)) reasons.push('every axis needs a one-line justification');
  if (cs.sources.length < 2) reasons.push('need ≥2 sources with real URLs');
  if (cs.evidence.confirmed.length + cs.evidence.reported.length < 2) reasons.push('need ≥2 evidence points (confirmed or reported)');
  for (const k of ['context', 'strategicBet', 'creativeMove', 'africanRead'] as const) {
    if (cs[k].length === 0) reasons.push(`empty ${k}`);
  }
  if (compositeScore(cs.decode) === null) reasons.push('composite score could not be computed');
  return { ok: reasons.length === 0, reasons };
}

function buildPrompt(avoidBrands: string[]): string {
  const avoid = avoidBrands.length ? `\n\nALREADY SCORED — pick something NOT in this list (a different brand/work):\n${avoidBrands.map((b) => `- ${b}`).join('\n')}` : '';
  return `Find ONE recent (ideally last 18 months), well-sourced African or Diaspora brand × culture move — a campaign, collaboration, launch, or creative/commercial play — worth decoding for the Cultural-Signal Index. Use the web_search tool FIRST to find and verify it, then decode it.${avoid}

Return ONLY a single JSON object (no prose, no markdown fences) with EXACTLY these fields:
{
  "title": "string — the piece title, e.g. 'Brand × Partner: the sharp thesis'",
  "brand": "string — the brand/work name that anchors this on the Index (the entity being scored)",
  "standfirst": "string — one-sentence dek",
  "collection": "one of: ${COLLECTIONS.join(' | ')}",
  "market": "string — e.g. 'Nigeria · Diaspora'",
  "tags": ["3–8 short tags"],
  "decode": [
    {"label":"IDEA","level":1-5,"note":"one-line justification"},
    {"label":"AUTHORSHIP","level":1-5,"note":"..."},
    {"label":"EXECUTION","level":1-5,"note":"..."},
    {"label":"CONSEQUENCE","level":1-5,"note":"..."}
  ],
  "context": ["1–3 paragraphs — what happened and why it matters"],
  "strategicBet": ["1–2 paragraphs — the bet being made"],
  "creativeMove": ["1–2 paragraphs — the craft/execution move"],
  "africanRead": ["1–2 paragraphs — the MonoKromatik authorship read (who shaped it, who captured value)"],
  "evidence": {
    "confirmed": ["facts corroborated across ≥2 independent sources"],
    "reported": ["claims from a single/secondary source — flagged as such"],
    "notClaimed": ["what is explicitly NOT claimed — unknowns, unaudited figures"]
  },
  "lessons": [{"title":"bold lede","body":"the brand-builder lesson"}],
  "pullQuotes": ["1–2 sharp lines"],
  "sources": [{"publisher":"...","label":"headline/title","href":"https://real-url","use":"what this source establishes"}],
  "verificationNote": "string — exactly what is confirmed vs reported, stated plainly"
}

Requirements: ≥2 real sources with working URLs; every factual beat traceable to a source; AUTHORSHIP scored on who actually held the pen and captured the upside (the question this Index exists to ask). Do not include a verification field — that is set on human review.`;
}

/**
 * Draft one schema-complete case study, web-grounded. Returns a fail-closed
 * result — only a validated draft has ok:true. Needs ANTHROPIC_API_KEY.
 */
export async function draftCaseStudy(opts: {
  avoidBrands: string[];
  stamp: string;
  maxSearches?: number;
  client?: Anthropic;
}): Promise<DraftResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !opts.client) return { ok: false, reasons: ['ANTHROPIC_API_KEY not set'], searches: 0 };
  const client = opts.client ?? new Anthropic({ apiKey });
  const avoid = new Set(opts.avoidBrands.map((b) => brandSlug(b)));

  try {
    const msg = await withRetry(() =>
      client.beta.messages.create({
        model: MODELS.flagship,
        max_tokens: 6000,
        system: INTEGRITY,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: opts.maxSearches ?? 6 }],
        messages: [{ role: 'user', content: buildPrompt(opts.avoidBrands) }],
      })
    );

    const textBlocks = msg.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text');
    const text = textBlocks.map((b) => b.text).join('\n');
    const searches = msg.content.filter((b) => b.type === 'web_search_tool_result').length;

    const cs = assembleCaseStudy(extractJson(text), opts.stamp);

    // Supplement thin source lists with web_search citations the model actually hit.
    if (cs && cs.sources.length < 2) {
      const cited = new Map<string, string>();
      for (const b of textBlocks) {
        for (const c of b.citations ?? []) {
          if (c.type === 'web_search_result_location' && c.url) cited.set(c.url, c.title || c.url);
        }
      }
      const have = new Set(cs.sources.map((s) => s.href));
      for (const [url, title] of cited) {
        if (cs.sources.length >= 3 || have.has(url)) break;
        cs.sources.push({ publisher: new URL(url).hostname.replace(/^www\./, ''), label: title, href: url, use: '' });
      }
    }

    const v = validateDraft(cs, avoid);
    if (!v.ok) return { ok: false, reasons: v.reasons, searches, caseStudy: cs ?? undefined };

    return {
      ok: true,
      caseStudy: cs!,
      score: compositeScore(cs!.decode)!,
      evidenceScore: brandEvidence([cs!]).score,
      reasons: [],
      searches,
    };
  } catch (err) {
    return { ok: false, reasons: [err instanceof Error ? err.message : String(err)], searches: 0 };
  }
}
