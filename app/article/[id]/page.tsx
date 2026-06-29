import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllArticles, getArticleBySlug } from '../../../lib/articles';
import ArticleClient from './ArticleClient';
import RelatedIntelligence from '../../components/RelatedIntelligence';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getArticleBySlug(id);
  if (!article) return { title: 'Article Not Found | MonoKromatik Network' };

  const url = `https://www.monokromatik.com/article/${article.slug}`;
  const title = `${article.title} | MonoKromatik Network`;
  const desc = article.excerpt || article.content.slice(0, 155);

  return {
    title,
    description: desc,
    keywords: article.tags,
    authors: [{ name: 'MonoKromatik Network' }],
    openGraph: {
      title: article.title,
      description: desc,
      type: 'article',
      url,
      // images intentionally omitted — Next.js auto-injects from
      // app/article/[id]/opengraph-image.tsx (dynamic OG card with
      // MonoKromatik branding). Letting the route convention win.
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    twitter: {
      // Always 'summary_large_image' now: every article has a
      // dynamically-generated 1200x630 OG card via the
      // app/article/[id]/twitter-image.tsx route convention.
      card: 'summary_large_image',
      title: article.title,
      description: desc,
      // images intentionally omitted — see openGraph note above.
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = getArticleBySlug(id);
  if (!article) notFound();

  // JSON-LD structured data so Google understands this is an article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'MonoKromatik Network',
      url: 'https://www.monokromatik.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MonoKromatik Network',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.monokromatik.com/favicon.ico',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.monokromatik.com/article/${article.slug}`,
    },
    articleSection: article.category,
    keywords: article.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient article={article} />
      <RelatedIntelligence article={article} />
    </>
  );
}
