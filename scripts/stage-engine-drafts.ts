#!/usr/bin/env node
/**
 * Stage engine-cycle drafts — the gate + auto-patch + report step that turns the
 * review QUEUE (output/engine-cycle/*.md) into a merge-or-close inbox.
 *
 * Pipeline:
 *   1. EXTRACT  — parse each section's markdown into structured candidates
 *                 (an LLM proposes the structure; mechanical, low-cost).
 *   2. GATE     — deterministic source-count, schema and dedup-vs-archive checks
 *                 (lib/staging.ts; pure + testable).
 *   3. PATCH    — auto-append gated, non-duplicate CULTURE articles to
 *                 data/articles.json. Claim-bearing kinds are NOT fabricated —
 *                 they're staged for human authoring.
 *   4. REPORT   — write output/engine-cycle/STAGED.md (the per-item decision log).
 *
 * Publish stays a human MERGE: the GitHub Action commits the patches + report and
 * opens a PR. Run with --dry to classify + report without writing any data.
 *
 * Usage:
 *   npm run engine:stage            # gate, auto-patch culture, write report
 *   npm run engine:stage -- --dry   # classify + report only, no data writes
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from '../lib/ai-models';
import { buildArchive } from '../lib/archive';
import { sourceMedia } from '../lib/source-media';
import {
  classify,
  candidateToArticle,
  slugify,
  type StagedCandidate,
  type StagingVerdict,
  type Decision,
} from '../lib/staging';
import type { ArchiveKind } from '../lib/archive';

// Load .env.local locally; CI provides env via Actions secrets.
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=][^=]*)=(.+)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

const ts = () => new Date().toISOString();
const log = (msg: string) => console.log(`[${ts()}] ${msg}`);

const QUEUE_DIR = join(__dirname, '../output/engine-cycle');
const ARTICLES_PATH = join(__dirname, '../data/articles.json');

const SECTION_KIND: Record<string, ArchiveKind | 'Conversation'> = {
  signal: 'Signal',
  intelligence: 'Intelligence',
  issues: 'Issue',
  conversations: 'Conversation',
  culture: 'Culture',
};

let _client: Anthropic | null = null;
// Patient retries: non-interactive cron, so ride out transient 429/5xx/529.
const client = () => (_client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 5 }));

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string', description: 'one-sentence angle/standfirst' },
          body: { type: 'array', items: { type: 'string' }, description: 'body paragraphs, excluding metadata bullets and the Sources list' },
          tags: { type: 'array', items: { type: 'string' } },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: { publisher: { type: 'string' }, url: { type: 'string' } },
              required: ['url'],
            },
          },
          brand: { type: 'string', description: 'the subject brand, if this is an Intelligence case study' },
          confidence: { type: 'string', enum: ['verified', 'partial', 'interpretive'] },
        },
        required: ['title', 'summary', 'body', 'sources'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
} as const;

/** Extract structured candidates from one section's markdown. Fail-safe → []. */
async function extract(section: string, markdown: string): Promise<StagedCandidate[]> {
  const kind = SECTION_KIND[section];
  try {
    const message = await client().messages.create({
      model: MODELS.utility,
      max_tokens: 4000,
      tools: [
        {
          name: 'emit_candidates',
          description: 'Return the distinct publishable pieces found in the draft.',
          input_schema: EXTRACT_SCHEMA as unknown as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: 'tool', name: 'emit_candidates' },
      messages: [
        {
          role: 'user',
          content: `Extract each distinct publishable piece from this ${section} draft into structured items. Pull every source URL you find (the Sources list AND any inline links). Do NOT invent anything — only extract what is present; if a field is absent, omit it. Brand applies only to Intelligence case studies.\n\n--- DRAFT (${section}.md) ---\n${markdown}`,
        },
      ],
    });

    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );
    const items = (toolUse?.input as { items?: unknown[] })?.items ?? [];
    return items.map((raw): StagedCandidate => {
      const it = raw as Partial<StagedCandidate>;
      return {
        section,
        kind,
        title: it.title ?? '',
        summary: it.summary ?? '',
        body: Array.isArray(it.body) ? it.body : [],
        tags: Array.isArray(it.tags) ? it.tags : [],
        sources: Array.isArray(it.sources) ? it.sources : [],
        brand: it.brand,
        confidence: it.confidence,
      };
    });
  } catch (err) {
    log(`⚠️ extraction failed for ${section}: ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

const ICON: Record<Decision, string> = {
  AUTO_PATCH: '🟢',
  NEEDS_AUTHORING: '🟠',
  ENRICH: '🔵',
  OUTREACH: '📇',
  HOLD: '🟡',
  REJECT: '🔴',
};

function report(verdicts: StagingVerdict[], patched: string[], dry: boolean): string {
  const by = (d: Decision) => verdicts.filter((v) => v.decision === d);
  const lines: string[] = [];
  lines.push('# Engine drafts — staging report');
  lines.push('');
  lines.push(`_Generated ${ts()}${dry ? ' · DRY RUN (no data written)' : ''}._`);
  lines.push('');
  lines.push('Deterministic gates over the review queue. **Publish = merging this PR.**');
  lines.push('Auto-patched items are appended to `data/articles.json` (review the diff);');
  lines.push('everything else is a proposal with its gate verdict.');
  lines.push('');
  lines.push('| Decision | Count | Meaning |');
  lines.push('|---|---|---|');
  lines.push(`| 🟢 AUTO_PATCH | ${by('AUTO_PATCH').length} | Culture article, ≥2 sources, no dup — written to data |`);
  lines.push(`| 🟠 NEEDS_AUTHORING | ${by('NEEDS_AUTHORING').length} | Claim-bearing — human authors it (gates pre-passed) |`);
  lines.push(`| 🔵 ENRICH | ${by('ENRICH').length} | Duplicates an existing entry — enrich, don't duplicate |`);
  lines.push(`| 📇 OUTREACH | ${by('OUTREACH').length} | Contributor brief — reach out, not publish |`);
  lines.push(`| 🟡 HOLD | ${by('HOLD').length} | <2 independent sources — needs corroboration |`);
  lines.push(`| 🔴 REJECT | ${by('REJECT').length} | Failed schema — not usable as-is |`);
  lines.push('');
  if (patched.length) {
    lines.push(`**Auto-patched into \`data/articles.json\`:** ${patched.map((s) => `\`${s}\``).join(', ')}`);
    lines.push('');
  }
  lines.push('## Per-item verdicts');
  lines.push('');
  for (const v of verdicts) {
    lines.push(`### ${ICON[v.decision]} ${v.decision} — ${v.candidate.title || '(untitled)'}`);
    lines.push(`- **Section:** ${v.candidate.section} · **Kind:** ${v.candidate.kind}`);
    lines.push(`- **Sources:** ${v.candidate.sources.length} (${v.candidate.sources.map((s) => s.publisher || s.url).slice(0, 4).join('; ')})`);
    if (v.matchSlug) lines.push(`- **Duplicate of:** \`${v.matchSlug}\``);
    lines.push(`- **Why:** ${v.reasons.join('; ')}`);
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }
  const dry = process.argv.slice(2).includes('--dry');

  if (!existsSync(QUEUE_DIR)) {
    log(`No queue at ${QUEUE_DIR} — nothing to stage.`);
    return;
  }
  const files = readdirSync(QUEUE_DIR).filter(
    (f) => f.endsWith('.md') && !['INDEX.md', 'STAGED.md'].includes(f)
  );
  log(`Staging ${files.length} section file(s): ${files.join(', ')}${dry ? ' [DRY]' : ''}`);

  // 1. EXTRACT
  const candidates: StagedCandidate[] = [];
  for (const f of files) {
    const section = f.replace(/\.md$/, '');
    if (!SECTION_KIND[section]) {
      log(`Skipping unknown section file: ${f}`);
      continue;
    }
    const md = readFileSync(join(QUEUE_DIR, f), 'utf-8');
    const items = await extract(section, md);
    log(`  ${section}: ${items.length} candidate(s)`);
    candidates.push(...items);
  }

  // 2. GATE
  const archive = buildArchive();
  const verdicts = candidates.map((c) => classify(c, archive));

  // 3. PATCH (auto, Culture only) — dedup defensively against this run's own slugs.
  const patched: string[] = [];
  if (!dry) {
    const articles = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8')) as { slug: string }[];
    const existing = new Set(articles.map((a) => a.slug));
    const stamp = ts();
    let changed = false;
    for (const v of verdicts) {
      if (v.decision !== 'AUTO_PATCH') continue;
      const slug = slugify(v.candidate.title);
      if (existing.has(slug)) {
        v.reasons.push(`slug "${slug}" already in articles.json — skipped to avoid overwrite`);
        v.decision = 'ENRICH';
        continue;
      }
      const article = candidateToArticle(v.candidate, stamp) as Record<string, unknown>;
      // Always ship with a hero: source a credited, self-hosted image (publisher
      // OG first, then stock). Degrade gracefully — never block publish on media.
      try {
        const media = await sourceMedia({
          sourceLink: v.candidate.sources[0]?.url,
          sourceName: article.sourceName as string,
          slug: `eng-${slug}`,
          title: v.candidate.title,
          excerpt: v.candidate.summary,
          category: 'culture',
        });
        article.imageUrl = media.image.url;
        article.imageCredit = media.image.credit;
        article.imageSourceUrl = media.image.sourceUrl;
        log(`  ${slug}: hero ${media.image.credit}`);
      } catch (err) {
        log(`  ${slug}: media sourcing failed (${err instanceof Error ? err.message : err}) — publishing imageless`);
      }
      articles.push(article as never);
      existing.add(slug);
      patched.push(slug);
      changed = true;
    }
    if (changed) {
      writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2));
      log(`Auto-patched ${patched.length} Culture article(s) into data/articles.json`);
    }
  }

  // 4. REPORT
  writeFileSync(join(QUEUE_DIR, 'STAGED.md'), report(verdicts, patched, dry));
  log(`Wrote output/engine-cycle/STAGED.md`);

  const tally = verdicts.reduce<Record<string, number>>((m, v) => {
    m[v.decision] = (m[v.decision] || 0) + 1;
    return m;
  }, {});
  log(`Done — ${candidates.length} candidate(s): ${Object.entries(tally).map(([k, n]) => `${k}=${n}`).join(' ')}`);
}

main().catch((err) => {
  console.error('❌ stage-engine-drafts crashed:', err);
  process.exit(1);
});
