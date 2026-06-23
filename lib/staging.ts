// Staging gates for the content engine — the deterministic layer that turns the
// engine-cycle review QUEUE into a merge-or-close PR. The engine (and an extraction
// pass) PROPOSES structured candidates; this module is the part that VERIFIES them
// with pure, testable rules before anything is auto-patched into data/*.json.
//
// Design stance (see docs/CONTENT_ENGINE_CYCLE.md + AI_ORCHESTRATION_ARCHITECTURE.md):
// - Discovery + drafting are automated.
// - Only LOW-STAKES Culture articles are auto-patched into the data; claim-bearing
//   Signal Brand Reads, Intelligence case studies and Issue plans are routed to
//   human authoring (gates pre-run, sources pre-checked) — never fabricated whole.
// - Publish remains a human MERGE of the staged PR. These gates decide what reaches
//   that PR as a data patch vs. what stays a proposal.

import type { ArchiveEntry, ArchiveKind } from './archive';

export interface StagedSource {
  publisher?: string;
  url: string;
}

/** A structured candidate extracted from a section's markdown draft. */
export interface StagedCandidate {
  section: string; // signal | intelligence | issues | conversations | culture
  kind: ArchiveKind | 'Conversation';
  title: string;
  summary: string;
  body: string[]; // paragraphs (markdown), for article kinds
  tags: string[];
  sources: StagedSource[];
  brand?: string; // intelligence
  confidence?: 'verified' | 'partial' | 'interpretive';
}

export type Decision =
  | 'AUTO_PATCH' // gates pass, low-stakes Culture article → append to data/articles.json
  | 'NEEDS_AUTHORING' // claim-bearing kind → human authors it (gates pre-run)
  | 'ENRICH' // duplicates an existing entry → enrich it, don't create a second
  | 'OUTREACH' // Conversations brief → action is to reach out, not publish
  | 'HOLD' // fails the source gate → needs a second independent source
  | 'REJECT'; // fails the schema gate → not usable as-is

export interface GateResult {
  pass: boolean;
  reason?: string;
}

export interface StagingVerdict {
  candidate: StagedCandidate;
  decision: Decision;
  reasons: string[];
  matchSlug?: string; // when ENRICH: the existing entry it duplicates
}

const STOP = new Set([
  'the', 'a', 'an', 'of', 'and', 'or', 'to', 'in', 'on', 'for', 'with', 'is',
  'as', 'at', 'by', 'how', 'who', 'why', 'what', 'when', 'it', 'its', 'that',
]);

function tokens(s: string): Set<string> {
  return new Set(
    (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/** Distinct registrable-ish hostnames across a candidate's sources. */
export function distinctSourceDomains(sources: StagedSource[]): string[] {
  const domains = new Set<string>();
  for (const s of sources || []) {
    try {
      const h = new URL(s.url).hostname.replace(/^www\./, '');
      // Collapse to last two labels (example.co.uk → co.uk is imperfect but fine
      // for a "distinct outlet" heuristic; the common case is foo.com).
      const parts = h.split('.');
      domains.add(parts.slice(-2).join('.'));
    } catch {
      /* ignore unparseable URLs */
    }
  }
  return [...domains];
}

/** Source gate: a claim-bearing item needs ≥2 independent source domains. */
export function sourceGate(c: StagedCandidate): GateResult {
  const domains = distinctSourceDomains(c.sources);
  if (domains.length >= 2) return { pass: true };
  return {
    pass: false,
    reason: `only ${domains.length} independent source domain(s) — needs ≥2`,
  };
}

/** Schema gate: the minimum structure to be usable. */
export function schemaGate(c: StagedCandidate): GateResult {
  if (!c.title || c.title.length < 8) return { pass: false, reason: 'missing/short title' };
  if (!c.summary || c.summary.length < 20) return { pass: false, reason: 'missing/short summary' };
  if (!Array.isArray(c.sources) || c.sources.length === 0)
    return { pass: false, reason: 'no sources' };
  const articleKinds: (ArchiveKind | 'Conversation')[] = ['Culture', 'Signal'];
  if (articleKinds.includes(c.kind) && (!c.body || c.body.join('').length < 120))
    return { pass: false, reason: 'article body too thin' };
  return { pass: true };
}

/**
 * Confidence thresholds for the dedup gate. STRICT → treat as a duplicate
 * (route to ENRICH); SOFT → flag a *possible* duplicate for human verification
 * but keep the primary decision. Two thresholds because a heuristic genuinely
 * cannot always separate "same brand, same work" (a real dup) from "same brand,
 * different work" (the library has two distinct Nike case studies that must NOT
 * be merged). When unsure we warn, not silently miss and not wrongly merge.
 */
export const DEDUP_STRICT = 0.5;
export const DEDUP_SOFT = 0.3;

export interface DedupMatch {
  slug: string;
  score: number;
  brandShared: boolean;
}

/** Best archive match for a candidate (regardless of threshold), or null. */
export function bestMatch(c: StagedCandidate, archive: ArchiveEntry[]): DedupMatch | null {
  const ctitle = tokens(c.title);
  const cbody = tokens([c.summary, ...(c.body || [])].join(' '));
  const cbrand = c.brand ? tokens(c.brand) : new Set<string>();
  let best: DedupMatch | null = null;

  for (const e of archive) {
    const etitle = tokens(e.title);
    const etext = tokens([e.title, e.summary, ...(e.tags || [])].join(' '));
    let score = Math.max(jaccard(ctitle, etitle), jaccard(cbody, etext) * 0.9);

    // Asymmetric brand containment in the same lane: a shared brand token is a
    // SOFT signal (≈0.45) — enough to warn, not enough to auto-merge on its own.
    let brandShared = false;
    if (c.kind === 'Intelligence' && e.kind === 'Intelligence' && cbrand.size && e.meta) {
      const ebrand = tokens(e.meta);
      if ([...cbrand].some((t) => ebrand.has(t))) {
        brandShared = true;
        score = Math.max(score, 0.45);
      }
    }

    if (score > (best?.score ?? 0)) best = { slug: e.id, score, brandShared };
  }

  return best && best.score > 0 ? best : null;
}

/**
 * Classify a candidate into a single decision. Pure: archive is passed in.
 * Order matters — schema, then source, then dedup, then kind-based routing.
 */
export function classify(c: StagedCandidate, archive: ArchiveEntry[]): StagingVerdict {
  const reasons: string[] = [];

  const schema = schemaGate(c);
  if (!schema.pass) return { candidate: c, decision: 'REJECT', reasons: [schema.reason!] };

  if (c.kind === 'Conversation') {
    return {
      candidate: c,
      decision: 'OUTREACH',
      reasons: ['contributor brief — action is outreach, not publish'],
    };
  }

  const src = sourceGate(c);
  if (!src.pass) return { candidate: c, decision: 'HOLD', reasons: [src.reason!] };

  const match = bestMatch(c, archive);

  // STRICT duplicate → enrich the existing entry, never add a second.
  if (match && match.score >= DEDUP_STRICT) {
    return {
      candidate: c,
      decision: 'ENRICH',
      reasons: [`duplicates existing "${match.slug}" (similarity ${match.score.toFixed(2)}) — enrich it, don't add a second`],
      matchSlug: match.slug,
    };
  }

  // SOFT possible-duplicate → keep the primary decision but warn for verification.
  const softDup =
    match && (match.score >= DEDUP_SOFT || (c.kind !== 'Culture' && match.brandShared))
      ? match
      : null;
  const warn = (v: StagingVerdict): StagingVerdict => {
    if (softDup) {
      v.reasons.push(`⚠️ possible duplicate of "${softDup.slug}" (similarity ${softDup.score.toFixed(2)}) — verify before authoring/publishing`);
      v.matchSlug = softDup.slug;
    }
    return v;
  };

  // Low-stakes lane: plain Culture articles auto-patch — but NOT if a possible
  // duplicate was flagged; then route to human authoring to be safe.
  if (c.kind === 'Culture') {
    if (softDup) {
      return warn({ candidate: c, decision: 'NEEDS_AUTHORING', reasons: ['Culture article, but a possible duplicate was flagged — human reviews before publish'] });
    }
    reasons.push('Culture article, ≥2 sources, no duplicate — eligible for auto-patch');
    return { candidate: c, decision: 'AUTO_PATCH', reasons };
  }

  reasons.push(`${c.kind} carries analysis/scores — staged for human authoring (gates pre-checked)`);
  return warn({ candidate: c, decision: 'NEEDS_AUTHORING', reasons });
}

/** A readable outlet name from a URL, e.g. https://www.aljazeera.com/… → aljazeera.com. */
export function sourceNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}

/** Build a data/articles.json record from an AUTO_PATCH Culture candidate. */
export function candidateToArticle(c: StagedCandidate, publishedAt: string) {
  const primary = c.sources[0];
  return {
    title: c.title,
    slug: slugify(c.title),
    excerpt: c.summary,
    content: c.body.join('\n\n'),
    category: 'culture',
    tags: c.tags && c.tags.length ? c.tags : ['culture'],
    sourceLink: primary?.url ?? '',
    // Credit the real outlet — never imply MonoKromatik is the source.
    sourceName: primary?.publisher || (primary ? sourceNameFromUrl(primary.url) : 'Source'),
    publishedAt,
  };
}
