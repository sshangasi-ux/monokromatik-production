#!/usr/bin/env node

/**
 * MonoKromatik Content Pipeline Test
 * Tests the complete RSS → Curate → Generate workflow
 */

import { fetchMonoKromatikStories, getMediaStats } from '../lib/fetch-stories';
import { preFilterStories, curateStories } from '../lib/curate-stories';
import { generateArticles } from '../lib/generate-article';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables manually (avoid dotenv dependency)
const envPath = join(__dirname, '../.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function main() {
  console.log('🚀 MonoKromatik Content Pipeline Test\n');
  console.log('=' .repeat(60));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
    console.error('\n❌ ERROR: ANTHROPIC_API_KEY not set in .env.local');
    console.error('Please add your API key to .env.local file\n');
    process.exit(1);
  }

  try {
    // STEP 1: Fetch stories from RSS feeds
    console.log('\n📡 STEP 1: FETCHING RSS FEEDS');
    console.log('=' .repeat(60));
    const allStories = await fetchMonoKromatikStories();

    if (allStories.length === 0) {
      console.error('❌ No stories fetched. Check RSS feed URLs.');
      process.exit(1);
    }

    // Show media stats
    const mediaStats = getMediaStats(allStories);
    console.log('\n📊 MEDIA STATISTICS:');
    console.log(`   Total stories: ${mediaStats.total}`);
    console.log(`   With images: ${mediaStats.withImages} (${mediaStats.imagePercentage}%)`);
    console.log(`   With videos: ${mediaStats.withVideos} (${mediaStats.videoPercentage}%)`);
    console.log(`   Text only: ${mediaStats.textOnly}`);

    // STEP 2: Pre-filter negative stories
    console.log('\n🔍 STEP 2: PRE-FILTERING NEGATIVE CONTENT');
    console.log('=' .repeat(60));
    const filtered = preFilterStories(allStories);
    console.log(`   Filtered out: ${allStories.length - filtered.length} negative stories`);
    console.log(`   Remaining: ${filtered.length} stories`);

    // STEP 3: AI Curation with Claude
    console.log('\n🤖 STEP 3: AI CURATION (Claude API)');
    console.log('=' .repeat(60));
    const curated = await curateStories(filtered, 5);

    if (curated.length === 0) {
      console.error('❌ No stories curated. Check Claude API response.');
      process.exit(1);
    }

    // Save curated stories
    const curatedPath = join(__dirname, '../output/curated-stories.json');
    writeFileSync(curatedPath, JSON.stringify(curated, null, 2));
    console.log(`   💾 Saved curated stories to: ${curatedPath}`);

    // STEP 4: Generate articles
    console.log('\n✍️  STEP 4: ARTICLE GENERATION (Claude API)');
    console.log('=' .repeat(60));
    const articles = await generateArticles(curated.slice(0, 3)); // Generate 3 articles for testing

    // Save generated articles
    const articlesPath = join(__dirname, '../output/generated-articles.json');
    writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
    console.log(`   💾 Saved articles to: ${articlesPath}`);

    // SUMMARY
    console.log('\n✅ PIPELINE TEST COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`   Fetched: ${allStories.length} stories`);
    console.log(`   Filtered: ${filtered.length} stories`);
    console.log(`   Curated: ${curated.length} stories`);
    console.log(`   Generated: ${articles.length} articles`);
    console.log('\n📂 Output files:');
    console.log(`   ${curatedPath}`);
    console.log(`   ${articlesPath}`);
    console.log('\n🎉 Ready for production deployment!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
