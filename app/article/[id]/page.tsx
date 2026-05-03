import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllArticles, getArticleBySlug } from '../../../lib/articles';
import ArticleClient from './ArticleClient';

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
      images: article.imageUrl ? [{ url: article.imageUrl, alt: article.title }] : [],
      publishedTime: article.publishedAt,
      tags: article.tags,
    },
    twitter: {
      card: article.imageUrl ? 'summary_large_image' : 'summary',
      title: article.title,
      description: desc,
      images: article.imageUrl ? [article.imageUrl] : [],
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
    </>
  );
}
