#!/usr/bin/env tsx
/**
 * Quick utility: stylize one article and dump the FULL output (not just summary)
 * so we can compare the body prose, not just title/excerpt.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { stylizeArticle } from '../lib/stylist';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: tsx scripts/stylize-one.ts <slug>');
  process.exit(1);
}

const all = JSON.parse(readFileSync(join(__dirname, '../data/articles.json'), 'utf-8'));
const article = all.find((a: any) => a.slug === slug);
if (!article) {
  console.error(`No article with slug ${slug}`);
  process.exit(1);
}

(async () => {
  console.log('═══════════════════════════════════════');
  console.log('BEFORE');
  console.log('═══════════════════════════════════════');
  console.log('TITLE:   ', article.title);
  console.log('EXCERPT: ', article.excerpt);
  console.log('');
  console.log('BODY (first 600 chars):');
  console.log(article.content.slice(0, 600));
  console.log('...');
  console.log('');

  const stylized = await stylizeArticle({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    tags: article.tags,
    sourceLink: article.sourceLink,
    sourceName: article.sourceName,
  });

  console.log('═══════════════════════════════════════');
  console.log('AFTER (Stylist)');
  console.log('═══════════════════════════════════════');
  console.log('TITLE:   ', stylized.title);
  console.log('EXCERPT: ', stylized.excerpt);
  console.log('');
  console.log('BODY:');
  console.log(stylized.content);
  console.log('');
  console.log('───────────────────────────────────────');
  console.log('STYLIST NOTE:', stylized.stylistNote);
})();
