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
import { getPublicCaseStudies } from '../lib/case-studies';
import { rankIndex, brandSlug } from '../lib/signal-index';

const PATH = join(process.cwd(), 'data', 'index-history.json');
const dateArg = process.argv.find((a) => a.startsWith('--date='))?.split('=')[1];
const DATE = dateArg || new Date().toISOString().slice(0, 10);

const ranked = rankIndex(getPublicCaseStudies());
const snapshot = {
  date: DATE,
  generatedAt: new Date().toISOString(),
  entries: ranked.map((e) => ({ brand: e.brand, slug: brandSlug(e.brand), score: e.score, rank: e.rank!, works: e.works })),
};

let history: { date: string }[] = [];
if (existsSync(PATH)) history = JSON.parse(readFileSync(PATH, 'utf-8'));
const i = history.findIndex((s) => s.date === DATE);
if (i >= 0) history[i] = snapshot;
else history.push(snapshot);
history.sort((a, b) => a.date.localeCompare(b.date));

writeFileSync(PATH, JSON.stringify(history, null, 2) + '\n');
console.log(`Snapshot ${DATE}: ${ranked.length} brands; history now ${history.length} snapshot(s).`);
