#!/usr/bin/env node

/**
 * Generate articles from already curated stories
 */

import { generateArticles } from '../lib/generate-article';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables manually
const envPath = join(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

async function main() {
  console.log('✍️  Generating Articles from Curated Stories\n');
  console.log('=' .repeat(60));

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
    console.error('\n❌ ERROR: ANTHROPIC_API_KEY not set in .env.local');
    process.exit(1);
  }

  try {
    // Read curated stories
    const curatedPath = join(__dirname, '../output/curated-stories.json');
    const curatedStories = JSON.parse(readFileSync(curatedPath, 'utf-8'));

    console.log(`\n📚 Found ${curatedStories.length} curated stories\n`);

    if (curatedStories.length === 0) {
      console.error('❌ No curated stories found. Run test-pipeline.ts first.');
      process.exit(1);
    }

    // Generate articles (all 5 curated stories)
    const articles = await generateArticles(curatedStories.slice(0, 5));

    // Save generated articles
    const articlesPath = join(__dirname, '../output/generated-articles.json');
    writeFileSync(articlesPath, JSON.stringify(articles, null, 2));

    console.log(`\n✅ SUCCESS! Generated ${articles.length} articles`);
    console.log(`💾 Saved to: ${articlesPath}\n`);

    // Show article summaries with previews
    console.log('📝 GENERATED ARTICLES:\n');
    articles.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Tags: ${article.tags.join(', ')}`);
      console.log(`   Words: ${article.content.split(/\s+/).length}`);
      console.log(`   Image: ${article.imageUrl ? '✅' : '❌'}`);
      console.log(`   Video: ${article.videoUrl ? '✅' : '❌'}`);
      console.log(`   Excerpt: ${article.excerpt}`);
      console.log(`   Preview: ${article.content.substring(0, 150)}...\n`);
    });

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
