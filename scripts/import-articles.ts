#!/usr/bin/env node

/**
 * MonoKromatik Article Import Script
 * Imports generated articles into the Next.js app
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  sourceLink: string;
  sourceName: string;
  publishedAt: string;
}

async function importArticles() {
  console.log('📥 MonoKromatik Article Import\n');
  console.log('=' .repeat(60));

  try {
    // Read generated articles
    const generatedPath = join(__dirname, '../output/generated-articles.json');
    
    if (!existsSync(generatedPath)) {
      console.error('\n❌ No generated articles found at:', generatedPath);
      console.error('Run "npm run generate:articles" first!\n');
      process.exit(1);
    }

    const articles: Article[] = JSON.parse(readFileSync(generatedPath, 'utf-8'));

    if (articles.length === 0) {
      console.error('\n❌ No articles to import');
      process.exit(1);
    }

    console.log(`\n📚 Found ${articles.length} articles to import\n`);

    // Save to data/articles directory
    const dataPath = join(__dirname, '../data/articles.json');
    writeFileSync(dataPath, JSON.stringify(articles, null, 2));

    console.log(`✅ Imported ${articles.length} articles to data/articles.json\n`);

    // Show imported articles
    articles.forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Published: ${new Date(article.publishedAt).toLocaleDateString()}\n`);
    });

    console.log('✅ IMPORT COMPLETE!\n');
    console.log('Next steps:');
    console.log('1. Articles are now in data/articles.json');
    console.log('2. Homepage will show latest articles');
    console.log('3. Visit: monokromatik.com/article/[slug] to view\n');
    console.log('🚀 Ready to deploy to Vercel!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

importArticles();
