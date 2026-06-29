#!/usr/bin/env node
/**
 * Self-healing media watchdog.
 *
 * Walks every article + case study, ASSESSES each hero against the same health
 * bar the live pipeline enforces (file exists on disk AND is photo-shaped, not a
 * logo / icon / ad-banner — see isUnusableHero), and AUTO-CORRECTS the unhealthy
 * ones by re-sourcing a credited, self-hosted hero through the shared sourceMedia
 * pipeline (reputable-first scrape → stock → branded fallback). It also REPORTS
 * (without mutating) the content/data issues a human should look at: missing
 * required fields, placeholder text, broken live-issue covers, and orphaned media.
 *
 * Healthy media is never touched, so a clean run produces no diff (no PR churn).
 *
 *   npx tsx scripts/heal-media.ts            # check + auto-heal images, write
 *   npx tsx scripts/heal-media.ts --dry-run  # report only — no network, no writes
 *   npx tsx scripts/heal-media.ts --limit 5  # heal at most N items (per type)
 *
 * Needs network (+ PEXELS_API_KEY for the stock fallback) to re-source. Designed
 * to run unattended on a schedule; it opens a review PR via the workflow, never
 * a direct push (merging the PR is the publish gate).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { sourceMedia, isUnusableHero } from '../lib/source-media';

const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const MEDIA_DIR = join(PUBLIC, 'article-media');
const ART = join(ROOT, 'data/articles.json');
const CS = join(ROOT, 'data/case-studies.json');
const ISS = join(ROOT, 'data/issues.json');
const FALLBACK = '/fallback-hero.svg';

const DRY = process.argv.includes('--dry-run');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg >= 0 ? Number(process.argv[limitArg + 1]) || Infinity : Infinity;

const PLACEHOLDER = /\b(lorem ipsum|lipsum|\btodo\b|tbd|placeholder|coming soon|fixme|\[insert)\b/i;

const report: string[] = [];
const log = (s: string) => {
  console.log(s);
  report.push(s);
};

type Assessment = { heal: boolean; note: string };

/** Judge a hero URL. Only local self-hosted assets are dimension-checked; a
 *  reachable remote URL renders (proxied) so it's left alone but noted. */
async function assess(url?: string): Promise<Assessment> {
  if (!url) return { heal: true, note: 'no hero' };
  if (url === FALLBACK) return { heal: true, note: 'branded fallback' };
  if (/^https?:\/\//i.test(url)) return { heal: false, note: 'remote (renders, not self-hosted)' };
  if (!url.startsWith('/')) return { heal: true, note: 'invalid path' };
  const p = join(PUBLIC, url.split('?')[0]);
  if (!existsSync(p)) return { heal: true, note: 'file missing' };
  try {
    const m = await sharp(p).metadata();
    if (isUnusableHero(m.width, m.height)) return { heal: true, note: `bad dims ${m.width}x${m.height} (logo/banner)` };
  } catch {
    return { heal: true, note: 'undecodable image' };
  }
  return { heal: false, note: 'ok' };
}

function categoryForCS(c: { tags?: string[]; collection?: string }): string {
  const t = [...(c.tags || []), c.collection || ''].join(' ').toLowerCase();
  if (/sport|football|olympic|athlet|nba|world cup/.test(t)) return 'sports';
  if (/music|afrobeat|amapiano|album|song|artist/.test(t)) return 'music';
  return 'culture';
}

async function main() {
  const articles = JSON.parse(readFileSync(ART, 'utf-8'));
  const studies = JSON.parse(readFileSync(CS, 'utf-8'));
  const issues = JSON.parse(readFileSync(ISS, 'utf-8'));

  log(`# Media watchdog — ${DRY ? 'DRY RUN (report only)' : 'check + heal'}`);
  log('');

  // ---- ARTICLES: assess + auto-heal heroes ----
  let aHealed = 0;
  let aHeal = 0;
  log(`## Articles (${articles.length})`);
  for (const a of articles) {
    if (aHeal >= LIMIT) break;
    const v = await assess(a.imageUrl);
    if (!v.heal) continue;
    aHeal++;
    if (DRY) {
      log(`- would heal **${a.slug}** — ${v.note}`);
      continue;
    }
    try {
      const before = a.imageUrl || '';
      const media = await sourceMedia({
        sourceLink: a.sourceLink,
        sourceName: a.sourceName,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        tags: a.tags,
      });
      if (media.image.url === FALLBACK) {
        // No usable real image at source — keep it honest (clean fallback, no dead ref).
        delete a.imageUrl;
        delete a.imageCredit;
        delete a.imageSourceUrl;
      } else {
        a.imageUrl = media.image.url;
        a.imageCredit = media.image.credit;
        a.imageSourceUrl = media.image.sourceUrl;
      }
      if ((a.imageUrl || '') !== before) {
        aHealed++;
        log(`- ✅ healed **${a.slug}** — ${v.note} → ${a.imageUrl ? media.image.credit : 'branded fallback'}`);
      } else {
        log(`- ${a.slug} — ${v.note}; no usable source image (left as fallback)`);
      }
    } catch (err) {
      log(`- ⚠️ ${a.slug} — re-source failed: ${(err as Error).message}`);
    }
  }
  log(`\n**Articles:** ${aHeal} needed attention, ${aHealed} re-sourced.\n`);

  // ---- CASE STUDIES: assess + auto-heal heroes ----
  let cHealed = 0;
  let cHeal = 0;
  log(`## Case studies (${studies.length})`);
  for (const c of studies) {
    if (cHeal >= LIMIT) break;
    const cur = c.media && c.media[0] ? c.media[0].src : undefined;
    const v = await assess(cur);
    if (!v.heal) continue;
    cHeal++;
    if (DRY) {
      log(`- would heal **${c.slug}** — ${v.note}`);
      continue;
    }
    try {
      const before = (c.media && c.media[0] && c.media[0].src) || '';
      const primary = (c.sources && c.sources[0]) || undefined;
      const media = await sourceMedia({
        sourceLink: primary?.href,
        sourceName: primary?.publisher,
        slug: `cs-${c.slug}`,
        title: c.title,
        excerpt: c.standfirst || '',
        category: categoryForCS(c),
      });
      if (media.image.url === FALLBACK) {
        c.media = []; // honest no-hero rather than a fallback masquerading as media
      } else {
        c.media = [
          {
            src: media.image.url,
            alt: `${c.brand} — ${c.title}`.slice(0, 140),
            credit: media.image.credit,
            sourceLabel: primary?.publisher || media.image.provider,
            sourceHref: media.image.sourceUrl,
          },
        ];
      }
      const after = (c.media[0] && c.media[0].src) || '';
      if (after !== before) {
        cHealed++;
        log(`- ✅ healed **${c.slug}** — ${v.note} → ${after ? media.image.credit : 'branded fallback'}`);
      } else {
        log(`- ${c.slug} — ${v.note}; no usable source image (left as fallback)`);
      }
    } catch (err) {
      log(`- ⚠️ ${c.slug} — re-source failed: ${(err as Error).message}`);
    }
  }
  log(`\n**Case studies:** ${cHeal} needed attention, ${cHealed} re-sourced.\n`);

  // ---- CONTENT / DATA: report only (a human decides) ----
  log(`## Content & data flags (report only)`);
  const flags: string[] = [];
  for (const a of articles) {
    if (!a.content?.trim()) flags.push(`article \`${a.slug}\`: empty content`);
    if (!a.excerpt?.trim()) flags.push(`article \`${a.slug}\`: no excerpt`);
    if (!a.sourceLink?.trim()) flags.push(`article \`${a.slug}\`: no sourceLink`);
    if (PLACEHOLDER.test(a.content || '') || PLACEHOLDER.test(a.excerpt || ''))
      flags.push(`article \`${a.slug}\`: placeholder text`);
  }
  for (const c of studies) {
    if (!c.standfirst?.trim()) flags.push(`case-study \`${c.slug}\`: no standfirst`);
    if (!c.sources?.length) flags.push(`case-study \`${c.slug}\`: no sources`);
    const blob = JSON.stringify(c.context || []) + JSON.stringify(c.lessons || []);
    if (PLACEHOLDER.test(blob)) flags.push(`case-study \`${c.slug}\`: placeholder text`);
  }
  for (const iss of issues) {
    if (iss.status !== 'live') continue;
    const img = iss.cover?.image;
    if (img && img.startsWith('/') && !existsSync(join(PUBLIC, img)))
      flags.push(`issue #${iss.number}: cover image missing (${img})`);
  }
  // Orphaned media (referenced nowhere) — informational cleanup signal.
  const referenced = new Set<string>();
  for (const a of articles)
    if ((a.imageUrl || '').startsWith('/article-media/')) referenced.add(a.imageUrl.split('/article-media/')[1]);
  for (const c of studies)
    for (const m of c.media || [])
      if ((m.src || '').startsWith('/article-media/')) referenced.add(m.src.split('/article-media/')[1]);
  const orphans = existsSync(MEDIA_DIR)
    ? readdirSync(MEDIA_DIR).filter((f) => f.endsWith('.webp') && !referenced.has(f))
    : [];

  if (flags.length) flags.forEach((f) => log(`- ⚠️ ${f}`));
  else log(`- ✅ no content/data issues`);
  log(`- ℹ️ ${orphans.length} orphaned media file(s) in public/article-media (unreferenced; harmless)`);
  log('');

  // ---- WRITE ----
  const changed = aHealed + cHealed;
  if (!DRY && changed) {
    writeFileSync(ART, JSON.stringify(articles, null, 2) + '\n');
    writeFileSync(CS, JSON.stringify(studies, null, 2) + '\n');
  }
  log(`## Summary`);
  log(`- heroes re-sourced: **${changed}** (${aHealed} articles, ${cHealed} case studies)`);
  log(`- content/data flags: **${flags.length}**`);
  log(DRY ? `- dry run — nothing written` : changed ? `- wrote data/articles.json + data/case-studies.json` : `- everything healthy — no changes`);

  // Machine-readable + CI step summary.
  mkdirSync(join(ROOT, 'output'), { recursive: true });
  writeFileSync(
    join(ROOT, 'output/media-heal.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), dryRun: DRY, healed: changed, articlesHealed: aHealed, caseStudiesHealed: cHealed, contentFlags: flags, orphans: orphans.length },
      null,
      2,
    ),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
}

main().catch((e) => {
  console.error('heal-media failed:', e);
  process.exit(1);
});
