import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCaseStudies, getCaseStudyBySlug } from '../../../../lib/case-studies';
import { compositeScore } from '../../../../lib/signal-index';
import CaseStudyFeature from '../../../components/CaseStudyFeature';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllCaseStudies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return { title: 'Case Study Not Found | MonoKromatik Network' };

  const url = `https://www.monokromatik.com/intelligence/case-studies/${study.slug}`;
  const title = `${study.title} | MonoKromatik Intelligence`;
  const desc = study.standfirst;
  // Prefer the study's own hero; fall back to the branded site OG card.
  const heroSrc = study.media?.[0]?.src;
  const ogImage = heroSrc
    ? heroSrc.startsWith('http')
      ? heroSrc
      : `https://www.monokromatik.com${heroSrc}`
    : 'https://www.monokromatik.com/opengraph-image';

  return {
    title,
    description: desc,
    keywords: study.tags,
    authors: [{ name: 'MonoKromatik Network' }],
    openGraph: {
      title: study.title,
      description: desc,
      type: 'article',
      url,
      publishedTime: study.publishedAt,
      tags: study.tags,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  // The next case study in the catalogue, for the end-of-read CTA (wraps around).
  const all = getAllCaseStudies();
  const idx = all.findIndex((c) => c.slug === study.slug);
  const nextStudy = all.length > 1 ? all[(idx + 1) % all.length] : undefined;
  const next = nextStudy
    ? { label: nextStudy.title, href: `/intelligence/case-studies/${nextStudy.slug}` }
    : undefined;

  const url = `https://www.monokromatik.com/intelligence/case-studies/${study.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    headline: study.title,
    description: study.standfirst,
    datePublished: study.publishedAt,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    keywords: study.tags,
    articleSection: study.collection,
    about: { '@type': 'Brand', name: study.brand },
    author: { '@type': 'Organization', name: 'MonoKromatik' },
    publisher: { '@type': 'Organization', name: 'MonoKromatik', url: 'https://www.monokromatik.com' },
    ...(study.media?.[0]?.src ? { image: study.media[0].src } : {}),
    citation: (study.sources ?? []).map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.href })),
  };

  // The Cultural-Signal Score is a rating — mark it up as a Review so search can
  // surface the authorship-weighted score (and potentially ★ rich results). The
  // rated entity is the brand/organisation; the analyst is the named author.
  const score = compositeScore(study.decode);
  const reviewLd =
    score != null
      ? {
          '@context': 'https://schema.org',
          '@type': 'Review',
          name: `Cultural-Signal Index — ${study.brand}`,
          reviewBody: study.standfirst,
          datePublished: study.publishedAt,
          url,
          itemReviewed: { '@type': 'Organization', name: study.brand },
          author: { '@type': 'Person', name: 'Sibu Shangase', jobTitle: 'Founder & Lead Analyst' },
          publisher: { '@type': 'Organization', name: 'MonoKromatik', url: 'https://www.monokromatik.com' },
          reviewRating: { '@type': 'Rating', ratingValue: score, bestRating: 100, worstRating: 0 },
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {reviewLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }} />
      )}
      <CaseStudyFeature caseStudy={study} next={next} />
    </>
  );
}
