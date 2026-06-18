import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCaseStudies, getCaseStudyBySlug } from '../../../../lib/case-studies';
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
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: desc,
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

  return <CaseStudyFeature caseStudy={study} next={next} />;
}
