#!/usr/bin/env node
/**
 * MonoKromatik Content Engine Cycle runner — the always-on, AI-led pass that
 * sources + drafts topical content across all five sections into a review queue.
 *
 * Usage:
 *   npm run engine:cycle              # full cycle → output/engine-cycle/
 *   npm run engine:cycle:dry          # run one section only (cheap smoke test)
 *   npm run engine:cycle -- --only=intelligence,culture
 *   npm run engine:cycle -- --searches=8
 *
 * Discovery + drafting are automated; PUBLISH is human-gated. This writes a review
 * queue only — the GitHub Action (.github/workflows/engine-cycle.yml) stages it as
 * a Pull Request for an editor to approve.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SECTIONS, runCycle, buildIndex } from '../lib/engine-cycle';

// Load .env.local so this works locally; in CI the env comes from Actions secrets.
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

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set. Add it to .env.local or CI secrets.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const onlyArg = args.find((a) => a.startsWith('--only='))?.split('=')[1];
  const searches = parseInt(args.find((a) => a.startsWith('--searches='))?.split('=')[1] || '6', 10);

  let sections = SECTIONS;
  if (onlyArg) {
    const want = onlyArg.split(',').map((s) => s.trim().toLowerCase());
    sections = SECTIONS.filter((s) => want.includes(s.key));
  } else if (dry) {
    // Dry = cheapest meaningful run: one section, fewer searches.
    sections = SECTIONS.filter((s) => s.key === 'culture');
  }

  log(`Engine cycle starting — ${sections.length} section(s): ${sections.map((s) => s.key).join(', ')}`);

  const results = await runCycle(sections, { maxSearches: dry ? 3 : searches });

  const outDir = join(__dirname, '../output/engine-cycle');
  mkdirSync(outDir, { recursive: true });

  const runStamp = ts();
  for (const r of results) {
    if (!r.markdown) {
      log(`Skipping ${r.key} — ${r.error || 'no content'}`);
      continue;
    }
    const header = `<!-- Engine cycle draft · ${runStamp} · section: ${r.key} · ${r.searches} web searches -->\n\n`;
    writeFileSync(join(outDir, `${r.key}.md`), header + r.markdown + '\n');
    log(`Wrote output/engine-cycle/${r.key}.md`);
  }

  // INDEX reflects the sections that ran this cycle.
  writeFileSync(join(outDir, 'INDEX.md'), buildIndex(results, runStamp));
  log('Wrote output/engine-cycle/INDEX.md');

  const ok = results.filter((r) => r.markdown && !r.error).length;
  const failed = results.filter((r) => r.error);
  log(`Cycle complete — ${ok}/${results.length} section(s) drafted.`);
  if (failed.length) {
    log(`⚠️ ${failed.length} failed: ${failed.map((f) => `${f.key} (${f.error})`).join('; ')}`);
  }
  // Non-zero exit only if EVERY section failed — partial success still stages a queue.
  if (ok === 0) process.exit(1);
}

main().catch((err) => {
  console.error('❌ Engine cycle crashed:', err);
  process.exit(1);
});
