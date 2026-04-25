import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const articles = await getAllArticles();
    const searchTerm = query.toLowerCase();

    const results = articles
      .filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const excerptMatch = article.excerpt?.toLowerCase().includes(searchTerm) || false;
        const contentMatch = article.content?.toLowerCase().includes(searchTerm) || false;
        const categoryMatch = article.category.toLowerCase().includes(searchTerm);
        
        return titleMatch || excerptMatch || contentMatch || categoryMatch;
      })
      .map(article => ({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        category: article.category,
      }))
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
