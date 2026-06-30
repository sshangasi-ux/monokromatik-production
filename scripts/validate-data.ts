#!/usr/bin/env node
/**
 * Data-schema validation — a CI guardrail. Validates the shapes the app actually
 * depends on, especially the ones that have caused 500s before (case-study array
 * fields rendered with .map(), decode levels, missing required keys, dup slugs).
 * Exits 1 on any violation so malformed content can't merge.
 *
 *   npm run validate:data
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const errors: string[] = [];
const err = (m: string) => errors.push(m);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isArr = Array.isArray;
const nonEmpty = (v: unknown): boolean => isStr(v) && v.trim().length > 0;
const load = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'data', f), 'utf8'));

// ---- Articles ----
const articles = load('articles.json') as Record<string, unknown>[];
const aSlugs = new Set<string>();
articles.forEach((a, i) => {
  const at = (m: string) => err(`articles[${i}] (${(a.slug as string) || '?'}) — ${m}`);
  if (!nonEmpty(a.slug)) at('missing slug');
  else if (aSlugs.has(a.slug as string)) at('duplicate slug');
  else aSlugs.add(a.slug as string);
  if (!nonEmpty(a.title)) at('missing title');
  if (!nonEmpty(a.content)) at('empty content');
  if (!isStr(a.excerpt)) at('excerpt not a string');
  if (!nonEmpty(a.sourceLink)) at('missing sourceLink');
  if (!isArr(a.tags)) at('tags must be an array');
  if (!nonEmpty(a.publishedAt)) at('missing publishedAt');
  const b = a.brandRead as Record<string, unknown> | undefined;
  if (b) {
    if (!isStr(b.take)) at('brandRead.take not a string');
    if (b.takeaways !== undefined && !isArr(b.takeaways)) at('brandRead.takeaways must be an array');
  }
});

// ---- Case studies (the array fields here have crashed pages before) ----
const caseStudies = load('case-studies.json') as Record<string, unknown>[];
const cSlugs = new Set<string>();
caseStudies.forEach((c, i) => {
  const at = (m: string) => err(`case-studies[${i}] (${(c.slug as string) || '?'}) — ${m}`);
  if (!nonEmpty(c.slug)) at('missing slug');
  else if (cSlugs.has(c.slug as string)) at('duplicate slug');
  else cSlugs.add(c.slug as string);
  if (!nonEmpty(c.title)) at('missing title');
  if (!nonEmpty(c.standfirst)) at('missing standfirst');
  if (!nonEmpty(c.brand)) at('missing brand');

  if (!isArr(c.decode)) at('decode must be an array');
  else (c.decode as Record<string, unknown>[]).forEach((d, j) => {
    if (!nonEmpty(d.label)) at(`decode[${j}].label missing`);
    if (typeof d.level !== 'number' || d.level < 1 || d.level > 5) at(`decode[${j}].level invalid (${d.level})`);
  });

  for (const k of ['context', 'strategicBet', 'creativeMove', 'africanRead']) {
    if (!isArr(c[k])) at(`${k} must be an array (renders with .map)`);
  }
  const ev = (c.evidence as Record<string, unknown>) || {};
  for (const k of ['confirmed', 'reported', 'notClaimed']) {
    if (!isArr(ev[k])) at(`evidence.${k} must be an array`);
  }
  if (!isArr(c.lessons)) at('lessons must be an array');
  if (!isArr(c.sources)) at('sources must be an array');
  else (c.sources as Record<string, unknown>[]).forEach((s, j) => { if (!nonEmpty(s.href)) at(`sources[${j}].href missing`); });
  if (!isArr(c.media)) at('media must be an array');
  else (c.media as Record<string, unknown>[]).forEach((m, j) => {
    if (!nonEmpty(m.src)) at(`media[${j}].src missing`);
    if (!isStr(m.alt)) at(`media[${j}].alt missing`);
  });
});

// ---- Reports ----
const reports = load('reports.json') as Record<string, unknown>[];
reports.forEach((r, i) => {
  const at = (m: string) => err(`reports[${i}] (${(r.slug as string) || '?'}) — ${m}`);
  if (!nonEmpty(r.slug)) at('missing slug');
  if (!nonEmpty(r.title)) at('missing title');
  // Planned reports are placeholders without sections; live ones must have them.
  if (r.sections !== undefined && !isArr(r.sections)) at('sections must be an array if present');
  if (r.status === 'live' && (!isArr(r.sections) || (r.sections as unknown[]).length === 0)) at('live report has no sections');
});

// ---- Issues ----
const issues = load('issues.json') as Record<string, unknown>[];
issues.forEach((x, i) => {
  const at = (m: string) => err(`issues[${i}] (#${(x.number as number) ?? '?'}) — ${m}`);
  if (x.number == null) at('missing number');
  if (!nonEmpty(x.title)) at('missing title');
});

// ---- Conversations ----
const conversations = load('conversations.json') as Record<string, unknown>[];
conversations.forEach((c, i) => {
  const at = (m: string) => err(`conversations[${i}] (${(c.slug as string) || '?'}) — ${m}`);
  if (!nonEmpty(c.slug)) at('missing slug');
  if (!isArr(c.questions)) at('questions must be an array');
  if (!isArr(c.sources)) at('sources must be an array');
});

// ---- Breaking / the Wire ----
const breaking = load('breaking.json') as { breaks?: Record<string, unknown>[] };
if (!isArr(breaking.breaks)) err('breaking.breaks must be an array');
else breaking.breaks.forEach((b, i) => {
  if (!nonEmpty(b.title)) err(`breaking.breaks[${i}] missing title`);
  if (!nonEmpty(b.link)) err(`breaking.breaks[${i}] missing link`);
});

if (errors.length) {
  console.error(`🔴 ${errors.length} data validation error(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(
  `✅ Data valid — ${articles.length} articles, ${caseStudies.length} case studies, ` +
    `${reports.length} reports, ${issues.length} issues, ${conversations.length} conversations, ` +
    `${breaking.breaks!.length} breaks.`,
);
