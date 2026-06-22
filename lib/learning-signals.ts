// MonoKromatik — learning signals (closes the discovery → performance loop).
//
// `analyze-performance.ts` MEASURES what worked (GA4 pageviews/engagement + the
// editor's star/solid/meh/kill verdicts). This module turns those outcomes into
// priority multipliers that the Curator applies when ranking the next batch, and
// persists them in a ledger so trust ACCUMULATES across runs rather than swinging
// on a single window.
//
// Governance (per docs/AI_ORCHESTRATION_ARCHITECTURE.md): this optimises ONLY
// source rankings + story-priority scoring. It never touches editorial values,
// the negative-narrative filter, rights, or approval gates. Fail-open by design:
// with no data every multiplier is neutral (1.0) and curation behaves exactly as
// it did before this file existed.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'output');
const LEDGER_PATH = join(OUTPUT_DIR, 'learning-ledger.json');

const ALPHA = 0.4; // EWMA weight on the newest run (≈2–3 runs of memory)
const MIN = 0.6;
const MAX = 1.5; // multiplier clamp — learning tilts ordering, never dominates relevance
const PRUNE_EPSILON = 0.03; // drop multipliers that have decayed back to ~neutral

export interface LearningSignals {
  /** category (lowercased) → priority multiplier (treat missing as 1.0) */
  categoryWeights: Record<string, number>;
  /** source (lowercased) → trust multiplier (treat missing as 1.0) */
  sourceTrust: Record<string, number>;
  updatedAt: string | null;
  runs: number;
}

/** Minimal shape of analyze-performance's report — only the fields we read. */
interface PerfReportLike {
  articles?: { slug: string; verdict?: string }[];
  topCategories?: { category: string; pageviews: number }[];
  topSources?: { source: string; pageviews: number }[];
}

const NEUTRAL: LearningSignals = { categoryWeights: {}, sourceTrust: {}, updatedAt: null, runs: 0 };

const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));
const norm = (s: string) => (s || '').trim().toLowerCase();

/** Read the persistent ledger. Neutral if absent or malformed — never throws. */
export function getLearningSignals(): LearningSignals {
  try {
    if (!existsSync(LEDGER_PATH)) return { ...NEUTRAL };
    const raw = JSON.parse(readFileSync(LEDGER_PATH, 'utf-8'));
    return {
      categoryWeights: raw.categoryWeights ?? {},
      sourceTrust: raw.sourceTrust ?? {},
      updatedAt: raw.updatedAt ?? null,
      runs: typeof raw.runs === 'number' ? raw.runs : 0,
    };
  } catch {
    return { ...NEUTRAL };
  }
}

/** Convenience: priority multiplier for a single (source, category) pair. */
export function priorityMultiplier(signals: LearningSignals, source?: string, category?: string): number {
  const st = signals.sourceTrust[norm(source || '')] ?? 1;
  const cw = signals.categoryWeights[norm(category || '')] ?? 1;
  return st * cw;
}

// pageviews → a gentle multiplier centred on 1.0 (relative to the run's average).
// 2× the average → ~1.25; half the average → ~0.875; then clamped.
function shareToMultipliers(items: { k: string; v: number }[]): Record<string, number> {
  const valid = items.filter((i) => i.k && i.v > 0);
  if (valid.length === 0) return {};
  const total = valid.reduce((s, i) => s + i.v, 0);
  const mean = total / valid.length;
  const out: Record<string, number> = {};
  for (const { k, v } of valid) {
    const ratio = v / mean; // 1.0 == average performer
    out[k] = clamp(1 + (ratio - 1) * 0.25);
  }
  return out;
}

// EWMA-fold this run's multipliers into the prior ledger. Keys seen this run move
// toward the new value; keys NOT seen decay gently back toward neutral 1.0.
function fold(prior: Record<string, number>, run: Record<string, number>, lean: number): Record<string, number> {
  const next: Record<string, number> = {};
  const keys = new Set([...Object.keys(prior), ...Object.keys(run)]);
  for (const k of keys) {
    const p = prior[k] ?? 1;
    if (k in run) {
      // Emphasise proven winners a touch harder when good signal is scarce.
      const m = run[k] > 1 ? 1 + (run[k] - 1) * lean : run[k];
      next[k] = clamp(ALPHA * m + (1 - ALPHA) * p);
    } else {
      next[k] = p + (1 - p) * (ALPHA * 0.5); // decay toward 1.0
    }
    if (Math.abs(next[k] - 1) < PRUNE_EPSILON) delete next[k]; // keep the ledger lean
  }
  return next;
}

/**
 * Fold the latest performance report into the ledger and persist it. Returns the
 * updated signals (or the prior signals untouched if anything goes wrong).
 */
export function updateLearningLedger(report: PerfReportLike, prior: LearningSignals = getLearningSignals()): LearningSignals {
  try {
    const runWeights = shareToMultipliers((report.topCategories ?? []).map((c) => ({ k: norm(c.category), v: c.pageviews })));
    const runTrust = shareToMultipliers((report.topSources ?? []).map((s) => ({ k: norm(s.source), v: s.pageviews })));

    const verdicts = report.articles ?? [];
    const killRate = verdicts.length
      ? verdicts.filter((a) => a.verdict === 'kill' || a.verdict === 'killed').length / verdicts.length
      : 0;
    const lean = 1 + Math.min(0.15, killRate * 0.2); // up to +15% emphasis on winners

    const next: LearningSignals = {
      categoryWeights: fold(prior.categoryWeights, runWeights, lean),
      sourceTrust: fold(prior.sourceTrust, runTrust, lean),
      updatedAt: new Date().toISOString(),
      runs: prior.runs + 1,
    };

    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(LEDGER_PATH, JSON.stringify(next, null, 2));
    return next;
  } catch {
    return prior;
  }
}

/** A compact, human-readable summary for the Curator prompt / audit logs. */
export function describeSignals(signals: LearningSignals, top = 4): string {
  if (signals.runs === 0) return '';
  const fmt = (rec: Record<string, number>) =>
    Object.entries(rec)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([k, v]) => `${k} ${v >= 1 ? '+' : ''}${Math.round((v - 1) * 100)}%`)
      .join(', ');
  const cats = fmt(signals.categoryWeights);
  const srcs = fmt(signals.sourceTrust);
  return [cats && `categories: ${cats}`, srcs && `sources: ${srcs}`].filter(Boolean).join(' · ');
}
