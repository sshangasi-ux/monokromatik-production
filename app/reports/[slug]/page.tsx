import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllReports, getReportBySlug } from '../../../lib/reports';
import ReportFeature from '../../components/ReportFeature';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllReports().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) return { title: 'Report Not Found | MonoKromatik Network' };

  const url = `https://www.monokromatik.com/reports/${report.slug}`;
  const title = `${report.title} | MonoKromatik Intelligence`;
  const desc = report.summary;

  return {
    title,
    description: desc,
    keywords: report.tags,
    authors: [{ name: 'MonoKromatik Network' }],
    openGraph: {
      title: report.title,
      description: desc,
      type: 'article',
      url,
      publishedTime: report.publishedAt,
      tags: report.tags,
      images: ['https://www.monokromatik.com/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: desc,
      images: ['https://www.monokromatik.com/opengraph-image'],
    },
    alternates: { canonical: url },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) notFound();

  const url = `https://www.monokromatik.com/reports/${report.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: report.title,
    description: report.summary,
    ...(report.publishedAt ? { datePublished: report.publishedAt } : {}),
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    keywords: report.tags,
    articleSection: report.series,
    author: { '@type': 'Organization', name: 'MonoKromatik' },
    publisher: { '@type': 'Organization', name: 'MonoKromatik', url: 'https://www.monokromatik.com' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReportFeature report={report} />
    </>
  );
}
