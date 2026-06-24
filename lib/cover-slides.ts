// Daily hero carousel — builds the homepage LivingCover slides from the day's
// LEADING new content across the three pillars (articles, case studies, reports),
// each in the article-hero format (strong headline + that item's hero imagery).
// Data-driven, so the carousel refreshes itself as the daily pipeline publishes.

import { getAllArticles } from './articles';
import { getPublicCaseStudies } from './case-studies';
import { getLiveReports } from './reports';
import type { CoverSlide } from '../app/components/LivingCover';

/**
 * The leading-content carousel: the newest hero-image-backed article(s), the
 * newest case-study decode, the newest live report, then the founding cover as a
 * brand anchor. Order = freshest first; the carousel auto-advances through them.
 */
export function buildCoverSlides(opts?: { articleLeads?: number }): CoverSlide[] {
  const slides: CoverSlide[] = [];

  // 1–2 leading articles that actually carry hero imagery (newest first).
  const leadArticles = getAllArticles()
    .filter((a) => Boolean(a.imageUrl))
    .slice(0, opts?.articleLeads ?? 2);
  for (const a of leadArticles) {
    slides.push({
      kicker: `${(a.category || 'CULTURE').toUpperCase()} / TODAY’S LEAD`,
      title: a.title,
      description: a.excerpt,
      href: `/article/${a.slug}`,
      cta: 'READ THE STORY',
      imageUrl: a.imageUrl,
      videoUrl: a.videoUrl,
      mode: 'story',
    });
  }

  // Newest case-study decode (getPublicCaseStudies is newest-first).
  const cs = getPublicCaseStudies()[0];
  if (cs) {
    slides.push({
      kicker: 'INTELLIGENCE / CASE STUDY',
      title: cs.title,
      description: cs.standfirst,
      href: `/intelligence/case-studies/${cs.slug}`,
      cta: 'READ THE DECODE',
      imageUrl: cs.media?.[0]?.src,
      mode: 'intelligence',
    });
  }

  // Newest live report.
  const report = getLiveReports()[0];
  if (report) {
    slides.push({
      kicker: 'INTELLIGENCE / REPORT',
      title: report.title,
      description: report.summary,
      href: `/reports/${report.slug}`,
      cta: 'READ THE REPORT',
      mode: 'intelligence',
    });
  }

  // Brand anchor — the founding kinetic cover.
  slides.push({
    kicker: 'FOUNDING EDITORIAL POSITION',
    title: 'The Intelligence Behind African Influence.',
    description:
      'Monokromatik decodes the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
    href: '/signal',
    cta: 'ENTER SIGNAL',
    mode: 'signal',
  });

  return slides;
}
