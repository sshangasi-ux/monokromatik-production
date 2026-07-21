#!/usr/bin/env node
/**
 * Snapshot the Cultural-Signal Index — append today's ranking to
 * data/index-history.json so the Index can show movement over time (the
 * stickiness moat: "how the score moved" turns a static rank into a reason to
 * return). Idempotent per date. Run on a schedule (see index-snapshot.yml).
 *
 *   npm run index:snapshot                 # snapshot for today
 *   npm run index:snapshot -- --date=2026-06-24
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getAllCaseStudies } from '../lib/case-studies';
import { rankWorks, RUBRIC_VERSION } from '../lib/signal-index';

const PATH = join(process.cwd(), 'data', 'index-history.json');
const dateArg = process.argv.find((a) => a.startsWith('--date='))?.split('=')[1];
const DATE = dateArg || new Date().toISOString().slice(0, 10);

// Snapshot the WORK-level Index — the unit the public Index ranks. Ratings are
// public even where the analysis is gated, so this covers premium works too;
// public-only would leave the top-scored works out of the trajectory entirely.
const ranked = rankWorks(getAllCaseStudies());
// Stamp the rubric in force. Movement is only computed between snapshots sharing
// a rubric — without this, a re-scoring would render as every brand collapsing
// overnight, which is our ruler changing, not the work getting worse.
const snapshot = {
  date: DATE,
  generatedAt: new Date().toISOString(),
  rubricVersion: RUBRIC_VERSION,
  // The Index ranks work. Snapshots stamp the unit so a future change of unit
  // suppresses movement the same way a rubric change does — the rows would stop
  // being the same kind of thing, and a delta across that is meaningless.
  unit: 'work' as const,
  entries: ranked.map((e) => ({ brand: e.brand, slug: e.slug, title: e.title, score: e.score, rank: e.rank, works: 1 })),
};

let history: { date: string }[] = [];
if (existsSync(PATH)) history = JSON.parse(readFileSync(PATH, 'utf-8'));
const i = history.findIndex((s) => s.date === DATE);
if (i >= 0) history[i] = snapshot;
else history.push(snapshot);
history.sort((a, b) => a.date.localeCompare(b.date));

writeFileSync(PATH, JSON.stringify(history, null, 2) + '\n');
console.log(`Snapshot ${DATE}: ${ranked.length} works; history now ${history.length} snapshot(s).`);
