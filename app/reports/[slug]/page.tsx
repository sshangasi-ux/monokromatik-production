import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllReports, getReportBySlug } from '../../../lib/reports';
import { reportCheckoutUrl, reportPrice } from '../../../lib/commerce';
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
      // images intentionally omitted — Next.js auto-wires the per-report card at
      // app/reports/[slug]/opengraph-image.tsx (a branded, title-specific OG
      // image) instead of the generic site-wide one, so shared report links
      // (esp. on LinkedIn) show the report's own title.
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: desc,
    },
    alternates: { canonical: url },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) notFound();

  const url = `https://www.monokromatik.com/reports/${report.slug}`;
  // For a report sold one-off, expose the price as a schema.org offer so the
  // paid report can surface a price in rich results (ZAR; "R3,500" → 3500).
  const checkout = reportCheckoutUrl(report.slug);
  const priceNum = checkout ? reportPrice(report.slug).replace(/[^0-9.]/g, '') : '';
  const offers = checkout && priceNum
    ? { offers: { '@type': 'Offer', price: priceNum, priceCurrency: 'ZAR', availability: 'https://schema.org/InStock', url: checkout } }
    : {};
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
    ...offers,
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
