#!/usr/bin/env tsx
/**
 * Test the subject-level deduper against the current articles.json.
 * Builds three synthetic candidates:
 *   1. A clear duplicate of an existing Asake article (should reject)
 *   2. A clear novel story (should keep)
 *   3. A borderline case (different angle on a recent subject)
 * and prints the deduper's verdicts.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { dedupeAgainstPublished } from '../lib/dedupe-stories';
import type { Story } from '../lib/rss-feeds';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const all = JSON.parse(
  readFileSync(join(__dirname, '../data/articles.json'), 'utf-8')
) as any[];

console.log(`Loaded ${all.length} published articles for comparison.`);
console.log('');

// Three test candidates
const candidates: Story[] = [
  // 1. Clear duplicate — same Asake M$NEY release, different headline angle
  {
    title: "Asake's M$NEY Just Hit Number One — And Lagos Is Vindicated",
    link: 'https://example.com/test-1',
    excerpt:
      "Asake's fourth album M$NEY topped the charts this week, his first solo number one. The fusion of Fuji and Amapiano is paying off.",
    source: 'Test Source',
    sourceUrl: 'https://example.com',
    category: 'culture',
    publishedAt: new Date().toISOString(),
  },
  // 2. Clear novel — totally different subject
  {
    title: 'Wizkid Announces 2026 Tour Dates Across North America',
    link: 'https://example.com/test-2',
    excerpt:
      "Wizkid's Made in Lagos tour returns to the US with 12 stops including Madison Square Garden. Tickets go on sale Friday.",
    source: 'Test Source',
    sourceUrl: 'https://example.com',
    category: 'music',
    publishedAt: new Date().toISOString(),
  },
  // 3. Borderline — same artist (Awoniyi) we just covered, but a *different match*
  {
    title: 'Taiwo Awoniyi Misses Forest Match Against City Through Injury',
    link: 'https://example.com/test-3',
    excerpt:
      "Forest will be without their Nigerian striker for the trip to Manchester City after he picked up a knock in training.",
    source: 'Test Source',
    sourceUrl: 'https://example.com',
    category: 'sports',
    publishedAt: new Date().toISOString(),
  },
];

console.log('Test candidates:');
candidates.forEach((c, i) => console.log(`  ${i + 1}. ${c.title}`));
console.log('');

(async () => {
  const result = await dedupeAgainstPublished(
    candidates,
    all.map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      publishedAt: a.publishedAt,
      slug: a.slug,
    }))
  );

  console.log('');
  console.log('=== RESULTS ===');
  console.log(`✅ Novel: ${result.novel.length}`);
  result.novel.forEach((c) => console.log(`   - ${c.title}`));
  console.log(`❌ Rejected: ${result.rejected.length}`);
  result.rejected.forEach((r) => {
    console.log(`   - ${r.candidate.title}`);
    console.log(`        duplicate of: ${r.duplicateOf}`);
    console.log(`        reason: ${r.reason}`);
  });

  console.log('');
  console.log('=== EXPECTED ===');
  console.log('  ❌ #1 (Asake M$NEY chart-topping)  → REJECT (same release as existing article)');
  console.log('  ✅ #2 (Wizkid tour)                  → KEEP (different artist & subject)');
  console.log('  ✅ #3 (Awoniyi injury, different match) → KEEP (different match than existing)');
})();
