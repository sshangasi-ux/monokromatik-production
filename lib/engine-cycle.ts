// MonoKromatik Content Engine Cycle — the always-on, AI-led, integrity-gated
// newsroom pass that sources and DRAFTS topical content across all five sections
// (Signal · Intelligence · Issues · Conversations · Culture) into a human-approval
// review queue. AI does discovery + drafting; humans gate publish.
//
// This is the CI-native twin of the Claude Code workflow at
// `.claude/workflows/content-engine-cycle.js`. The workflow is great for an
// interactive, in-session run; this module is what GitHub Actions schedules so the
// engine is genuinely always-on (no local session required). It grounds every
// section in live web research via the Anthropic web_search tool and enforces the
// integrity contract in the system prompt.
//
// Nothing here publishes. Output lands in `output/engine-cycle/` as a review queue;
// an editor approves items and only then are they wired into `data/*.json`.

import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from './ai-models';

// Lazy-initialize the client so importing this module never touches the network
// or requires ANTHROPIC_API_KEY at module-load time (mirrors lib/curate-stories.ts).
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

const ts = () => new Date().toISOString();
const log = (msg: string) => console.log(`[${ts()}] [engine-cycle] ${msg}`);

// The integrity contract — baked into every section prompt. This is the credibility
// discipline that lets the engine scale coverage without spending the brand's trust.
const INTEGRITY_CONTRACT = `You are a senior editor at MonoKromatik, an African & Diaspora brand-intelligence
publication. You decode how ideas, work and brands move culture and capture value —
with the rigor of a research desk, never the credulity of a fan account.

NON-NEGOTIABLE INTEGRITY CONTRACT:
- WEB-SOURCED + CITED. Use the web_search tool to ground every factual claim in a
  real, current source. Inline-cite as markdown links [publisher](https://url) right
  where the claim is made. No claim without a source you actually found.
- NO FABRICATION. Never invent quotes, statistics, names, dates, deals or sources.
  If you cannot verify something, say so or drop it — do not paper over a gap.
- CONFIDENCE FLAGGED. Tag each item "verified" / "partial" / "interpretive". The
  MonoKromatik analytical "take" is labelled interpretive — argued, not asserted as fact.
- CORRECT THE RECORD. If search contradicts a premise you started with, follow the
  evidence and note the correction. Prefer dropping a thin lead over stretching it.
- REVIEW QUEUE, NOT PUBLISH. This is a draft for human editorial approval. End every
  item with "Status: DRAFT — needs human approval".
- VOICE: precise, declarative, African/Diaspora-centred, business-literate. No hype,
  no tabloid net-worth figures, no PR-speak.

Today's date context: ${new Date().toISOString().slice(0, 10)}.`;

export interface SectionSpec {
  /** Slug used for the output filename and INDEX label. */
  key: string;
  /** Display name. */
  title: string;
  /** The section's editorial remit for this cycle. */
  remit: string;
}

// Per-section remit — mirrors the workflow's brief and docs/CONTENT_ENGINE_CYCLE.md.
export const SECTIONS: SectionSpec[] = [
  {
    key: 'signal',
    title: 'Signal',
    remit: `Draft 2 SIGNAL dispatches on the most consequential recent moves in African &
Diaspora brand/culture/business (campaigns, deals, launches, appointments, cultural
moments with commercial weight). For EACH dispatch give: a headline; "What moved";
"Who shaped it"; "Who captured the value"; and a short MonoKromatik Brand Read (the
interpretive take). Favour stories from the last ~2 weeks with real, citable sourcing.`,
  },
  {
    key: 'intelligence',
    title: 'Intelligence',
    remit: `Draft ONE Intelligence case-study decode of a recent, well-sourced brand x culture
collaboration or campaign. Use a six-dimension structure (Context, The Move, Craft/
Execution, Distribution, Commercial Logic, Cultural Consequence). Then give the
four-axis Cultural-Signal scores — IDEA, AUTHORSHIP, EXECUTION, CONSEQUENCE — each
1–5 with one-line justification, and note the composite is computed downstream. Be
rigorous: every factual beat cited; the scoring rationale is interpretive.`,
  },
  {
    key: 'issues',
    title: 'Issues',
    remit: `Propose the NEXT magazine issue: a theme/cover line and a 5–6 feature slate mapped
to MonoKromatik franchises (e.g. Roots, Arena, Waves, the Index). This is a
commissioning PLAN — real, buildable angles with candidate subjects and why each
earns a place — NOT fabricated finished features. Ground the thesis and each angle
in current, citable developments.`,
  },
  {
    key: 'conversations',
    title: 'Conversations',
    remit: `Identify 3 REAL, NAMED contributor/interview targets — operators, founders, creators
or executives currently shaping African & Diaspora brand-culture. For each: who they
are (with a citation establishing their current role/relevance), why now, and 4–5
sharp interview questions. NEVER fabricate an interview or quotes — these are briefs
for outreach, not transcripts.`,
  },
  {
    key: 'culture',
    title: 'Culture',
    remit: `Draft 2 short CULTURE pieces across Roots (heritage/legacy), Arena (sport/competition)
or Waves (music/screen/style/internet). Each is a tight, well-sourced read on a
current cultural moment with a MonoKromatik angle. Verify any award, record or
"first" claim against a primary or reputable source before stating it.`,
  },
];

export interface SectionResult {
  key: string;
  title: string;
  markdown: string;
  searches: number;
  error?: string;
}

/**
 * Run one section: a single web-research + draft pass grounded by the web_search tool.
 * Returns the drafted markdown (review-queue item) plus how many searches it ran.
 */
export async function runSection(
  spec: SectionSpec,
  opts: { maxSearches?: number } = {}
): Promise<SectionResult> {
  const maxUses = opts.maxSearches ?? 6;
  log(`${spec.title}: researching + drafting (≤${maxUses} searches)…`);

  try {
    const message = await getClient().beta.messages.create({
      model: MODELS.flagship,
      max_tokens: 4000,
      system: INTEGRITY_CONTRACT,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: maxUses }],
      messages: [
        {
          role: 'user',
          content: `Produce this cycle's ${spec.title} review-queue item.\n\n${spec.remit}\n\nWrite the item as clean Markdown ready for an editor to read. Lead with an H2 title. Use the web_search tool first to ground your claims, then write.`,
        },
      ],
    });

    // The final answer is the concatenation of text blocks; web_search produces
    // server_tool_use / web_search_tool_result blocks we don't render.
    const textBlocks = message.content.filter(
      (b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text'
    );
    let text = textBlocks.map((b) => b.text).join('\n').trim();

    // Strip the model's pre-write "I'll research…" preamble: keep from the first
    // Markdown heading onward so the queue item leads with its title.
    const firstHeading = text.search(/^#{1,3} /m);
    if (firstHeading > 0) text = text.slice(firstHeading).trim();

    const searches = message.content.filter(
      (b) => b.type === 'web_search_tool_result'
    ).length;

    // Web-search grounding returns citations as structured objects on the text
    // blocks, not inline markdown. Harvest them into a deduped Sources list so the
    // integrity contract ("every claim cited") holds in the written artefact.
    const sources = new Map<string, string>(); // url -> title
    for (const b of textBlocks) {
      for (const c of b.citations ?? []) {
        if (c.type === 'web_search_result_location' && c.url) {
          sources.set(c.url, c.title || c.url);
        }
      }
    }
    if (sources.size) {
      const list = [...sources.entries()]
        .map(([url, title], i) => `${i + 1}. [${title}](${url})`)
        .join('\n');
      text += `\n\n## Sources\n\n${list}\n`;
    }

    if (!text) {
      return { key: spec.key, title: spec.title, markdown: '', searches, error: 'empty response' };
    }

    log(`${spec.title}: drafted (${searches} searches, ${sources.size} cited sources, ${text.length} chars).`);
    return { key: spec.key, title: spec.title, markdown: text, searches };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`${spec.title}: FAILED — ${msg}`);
    return { key: spec.key, title: spec.title, markdown: '', searches: 0, error: msg };
  }
}

/**
 * Run the full cycle across all five sections. Sequential by default to stay polite
 * to the web_search rate limits and keep CI logs readable.
 */
export async function runCycle(
  sections: SectionSpec[] = SECTIONS,
  opts: { maxSearches?: number } = {}
): Promise<SectionResult[]> {
  const results: SectionResult[] = [];
  for (const spec of sections) {
    results.push(await runSection(spec, opts));
  }
  return results;
}

/** Build the review-queue INDEX.md body from a set of section results. */
export function buildIndex(results: SectionResult[], runStamp: string): string {
  const ok = results.filter((r) => r.markdown && !r.error);
  const failed = results.filter((r) => r.error);
  const totalSearches = results.reduce((n, r) => n + r.searches, 0);

  const lines: string[] = [];
  lines.push('# Content Engine Cycle — review queue');
  lines.push('');
  lines.push(`_Generated ${runStamp} · ${ok.length}/${results.length} sections · ${totalSearches} web searches._`);
  lines.push('');
  lines.push('**Everything here is a DRAFT for human approval.** Nothing is published.');
  lines.push('Review each section, then wire approved items into `data/*.json`. Every');
  lines.push('claim should carry a real citation; the MonoKromatik take is interpretive.');
  lines.push('');
  lines.push('| Section | Status | Searches | File |');
  lines.push('|---|---|---|---|');
  for (const r of results) {
    const status = r.error ? `⚠️ ${r.error}` : 'DRAFT — needs approval';
    lines.push(`| ${r.title} | ${status} | ${r.searches} | [\`${r.key}.md\`](./${r.key}.md) |`);
  }
  lines.push('');
  if (failed.length) {
    lines.push(`> ${failed.length} section(s) failed this run and were skipped — see table.`);
    lines.push('');
  }
  lines.push('Re-run interactively any time via the Claude Code workflow');
  lines.push('(`.claude/workflows/content-engine-cycle.js`) or on schedule via');
  lines.push('`.github/workflows/engine-cycle.yml`. See `docs/CONTENT_ENGINE_CYCLE.md`.');
  lines.push('');
  return lines.join('\n');
}
