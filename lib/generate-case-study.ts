// MonoKromatik — Case Study generator.
//
// Extends the review-gated pipeline to produce research-grade case studies in
// the brand's competencies (The Work / Will It Land? / Intelligence). It takes a
// brief plus *provided* source material (the factual ground truth), and asks the
// flagship model to return a fully-structured CaseStudy that:
//   - separates confirmed fact from MonoKromatik interpretation,
//   - anchors every claim to a credited source (no uncited assertions),
//   - scores the four-dimension decode as judgement, not a measured metric,
//   - records a verification ledger (confirmed / reported / not-claimed).
//
// It never invents sources or media. Output is staged for human review (status:
// 'review') and only goes live when a person merges it — same gate as articles.

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';
import { fetchArticleBody } from './fetch-article-body';
import {
  CaseStudy,
  Competency,
  DEFAULT_EVIDENCE,
  DecodeDimension,
  slugify,
} from './case-study';

export interface CaseStudyBriefSource {
  publisher: string;
  href: string;
  /** Pre-supplied source text. If omitted, the body is fetched from href. */
  text?: string;
}

export interface CaseStudyBrief {
  competency: Competency;
  /** The work/campaign/subject under analysis, e.g. "Nike × Air Afrique RK61". */
  subject: string;
  /** Geographic/cultural frame, e.g. "CÔTE D'IVOIRE / WEST AFRICA / DIASPORA". */
  market: string;
  /** Optional steer on the editorial angle. */
  angle?: string;
  /** Case index for the franchise line, e.g. "002". */
  caseNumber?: string;
  /** Self-hosted hero (/article-media/…). Cover art is used if absent. */
  heroImage?: string;
  sources: CaseStudyBriefSource[];
}

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const VALID_DECODE: DecodeDimension['label'][] = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'];

/** Resolve each brief source to { publisher, href, text } — fetching bodies as needed. */
async function resolveSources(sources: CaseStudyBriefSource[]) {
  const resolved: { publisher: string; href: string; text: string }[] = [];
  for (const s of sources) {
    let text = s.text ?? '';
    if (!text && s.href) {
      try {
        text = (await fetchArticleBody(s.href)) || '';
      } catch {
        text = '';
      }
    }
    resolved.push({ publisher: s.publisher, href: s.href, text });
  }
  return resolved;
}

function buildPrompt(
  brief: CaseStudyBrief,
  resolved: { publisher: string; href: string; text: string }[]
): string {
  const competency = brief.competency;
  const sourceBlocks = resolved
    .map(
      (s, i) => `SOURCE ${i + 1} — ${s.publisher}
URL: ${s.href}
${s.text ? `BODY:\n"""\n${s.text.slice(0, 6000)}\n"""` : 'BODY: (not retrieved — treat URL as a pointer only; do not invent its contents)'}`
    )
    .join('\n\n');

  return `You are the lead intelligence analyst for MonoKromatik — "The Intelligence Behind African Influence." You write research-grade case studies that brand, agency and creative leaders trust because facts are kept separate from judgement and every claim is sourced.

COMPETENCY: ${competency}
${competency === 'THE WORK' ? 'THE WORK decodes a specific piece of creative work — what it did, who authored it, how well it executed, and what it consequenced.' : ''}${competency === 'WILL IT LAND' ? "WILL IT LAND? tests global/creative work against African and diaspora market reality — relevance, access, media and cultural truth. Be explicit about what would have to be true for it to land." : ''}${competency === 'INTELLIGENCE' ? 'INTELLIGENCE is a structured briefing on a force, pattern or shift shaping African influence.' : ''}

SUBJECT: ${brief.subject}
MARKET FRAME: ${brief.market}
${brief.angle ? `ANGLE STEER: ${brief.angle}` : ''}

SOURCE MATERIAL (your factual ground truth — do not contradict or exceed it):
${sourceBlocks}

EVIDENCE DISCIPLINE (non-negotiable — this is what the brand sells):
- Every factual claim must be supported by the source material above. If sources don't support a claim, do not make it.
- Clearly separate what is CONFIRMED by an official/primary source, what is REPORTED by independent media, and what is NOT CLAIMED (left open pending evidence).
- The decode levels are editorial JUDGEMENT (1=weak … 5=strong), not measured scores — justify each in its note.
- Never invent sources, quotes, figures, dates, names or media that are not in the material. When unsure, write around it.
- Voice: incisive, calm, authoritative. Distinct African judgement. No hype, no PR speak, no clichés ("Africa rising", "vibrant", "rich heritage").

Write 900–1400 words across the sections.

OUTPUT — JSON ONLY, no prose around it, this exact shape:
{
  "title": "Headline (8–16 words)",
  "standfirst": "1–2 sentence intelligent summary (under 240 chars)",
  "readingTime": "e.g. 7 MIN READ",
  "decode": [
    {"label": "IDEA", "level": 1-5, "note": "one sentence of justification"},
    {"label": "AUTHORSHIP", "level": 1-5, "note": "..."},
    {"label": "EXECUTION", "level": 1-5, "note": "..."},
    {"label": "CONSEQUENCE", "level": 1-5, "note": "..."}
  ],
  "sections": [
    {"title": "The move", "paragraphs": ["...", "..."]},
    {"title": "The strategic bet", "paragraphs": ["..."]},
    {"title": "The African read", "paragraphs": ["..."]},
    {"title": "Lessons for brand builders", "paragraphs": ["..."]}
  ],
  "pullQuotes": ["one or two sharp, quotable sentences drawn from your analysis"],
  "verification": {
    "confirmed": ["claim confirmed by a primary/official source"],
    "reported": ["claim reported by independent media"],
    "notClaimed": ["conclusion deliberately NOT drawn yet, and why"]
  },
  "sources": [
    {"publisher": "...", "label": "headline/title of the source", "href": "exact URL from the material", "use": "what it substantiates and what it does not"}
  ]
}`;
}

interface RawCaseStudy {
  title: string;
  standfirst: string;
  readingTime: string;
  decode: DecodeDimension[];
  sections: { title: string; paragraphs: string[] }[];
  pullQuotes: string[];
  verification: { confirmed: string[]; reported: string[]; notClaimed: string[] };
  sources: { publisher: string; label: string; href: string; use: string }[];
}

/** Tolerant JSON extraction — the analyst body carries quotes/apostrophes that can break strict parse. */
function parseSafely(responseText: string): RawCaseStudy | null {
  const start = responseText.indexOf('{');
  const end = responseText.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  const block = responseText.slice(start, end + 1);
  try {
    const parsed = JSON.parse(block);
    if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.sections)) {
      return parsed as RawCaseStudy;
    }
  } catch {
    // fall through
  }
  return null;
}

function clampLevel(n: unknown): 1 | 2 | 3 | 4 | 5 {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 3;
  return Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5;
}

/** Normalise the model's decode into exactly the four canonical axes. */
function normaliseDecode(raw: DecodeDimension[] | undefined): DecodeDimension[] {
  const byLabel = new Map((raw || []).map((d) => [String(d.label).toUpperCase(), d]));
  return VALID_DECODE.map((label) => {
    const d = byLabel.get(label);
    return {
      label,
      level: clampLevel(d?.level),
      note: (d?.note || '').trim() || 'Judgement pending further evidence.',
    };
  });
}

export async function generateCaseStudy(brief: CaseStudyBrief): Promise<CaseStudy> {
  console.log(`\n🧪  Generating ${brief.competency} case study: "${brief.subject}"\n`);
  const resolved = await resolveSources(brief.sources);
  const retrieved = resolved.filter((s) => s.text).length;
  console.log(`   📚 Sources: ${resolved.length} (${retrieved} with retrieved body)`);

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: MODELS.flagship,
    max_tokens: 4500,
    messages: [{ role: 'user', content: buildPrompt(brief, resolved) }],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  const responseText = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const raw = parseSafely(responseText);
  if (!raw) throw new Error('Case-study response had no parseable structure');

  const caseNumber = brief.caseNumber ? ` / CASE STUDY ${brief.caseNumber}` : '';
  const study: CaseStudy = {
    slug: slugify(raw.title),
    competency: brief.competency,
    franchise: `${brief.competency}${caseNumber}`,
    title: raw.title,
    standfirst: raw.standfirst || '',
    market: brief.market,
    readingTime: raw.readingTime || '8 MIN READ',
    evidence: DEFAULT_EVIDENCE[brief.competency],
    decode: normaliseDecode(raw.decode),
    sections: (raw.sections || []).filter((s) => s.title && Array.isArray(s.paragraphs)),
    pullQuotes: Array.isArray(raw.pullQuotes) ? raw.pullQuotes.filter(Boolean) : [],
    // Only keep sources whose URL actually came from the supplied material —
    // the model must not introduce citations we didn't give it.
    sources: (raw.sources || []).filter((s) =>
      resolved.some((r) => r.href && s.href && r.href === s.href)
    ),
    verification: {
      confirmed: raw.verification?.confirmed ?? [],
      reported: raw.verification?.reported ?? [],
      notClaimed: raw.verification?.notClaimed ?? [],
    },
    heroImage: brief.heroImage,
    generatedAt: new Date().toISOString(),
    status: 'review',
  };

  console.log(`   ✅ "${study.title}" — ${study.sections.length} sections, ${study.sources.length} cited sources`);
  return study;
}
