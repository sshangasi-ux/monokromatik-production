import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const articles = getAllArticles();
  const publishedCount = articles.length;
  const estimatedDailyReaders = Math.max(50, publishedCount * 35);

  return NextResponse.json({
    publishedArticles: publishedCount,
    estimatedDailyReaders,
    timestamp: new Date().toISOString(),
  });
}
