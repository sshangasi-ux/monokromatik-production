import Link from 'next/link';
import { ArrowRight, Database } from 'lucide-react';
import { getRelatedCaseStudies, indexBrandHref, type ArticleLike } from '../../lib/related-intelligence';
import { workSignal } from '../../lib/signal-index';
import { getPublicCaseStudies } from '../../lib/case-studies';

// "Read the Intelligence" rail under every article — links to the scored case
// studies that share its brand/topic, plus an always-present door into the Index.
// Closes the cross-linking gap (articles never linked to the scored corpus).

export default function RelatedIntelligence({ article }: { article: ArticleLike }) {
  const related = getRelatedCaseStudies(article, 3);
  const csBySlug = new Map(getPublicCaseStudies().map((c) => [c.slug, c]));

  return (
    <section className="bg-mono-soft-white border-t border-mono-gray/20 py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Database className="text-mono-amber" size={20} aria-hidden="true" />
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">READ THE INTELLIGENCE</p>
        </div>

        {related.length > 0 ? (
          <>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black mb-6">
              The scored work behind this story.
            </h2>
            <div className="space-y-px border border-mono-gray/25 bg-mono-gray/25">
              {related.map((cs) => {
                const sig = workSignal(csBySlug.get(cs.slug) ?? cs);
                return (
                  <Link
                    key={cs.slug}
                    href={`/intelligence/case-studies/${cs.slug}`}
                    className="group flex items-center justify-between gap-5 bg-mono-white p-5 hover:bg-mono-soft-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-amber-strong mb-1">{cs.brand}</p>
                      <p className="font-display font-bold text-mono-black group-hover:text-mono-amber transition-colors truncate">{cs.title}</p>
                    </div>
                    {sig && (
                      <span className="shrink-0 text-right">
                        <span className="block text-2xl font-display font-bold text-mono-black leading-none tabular-nums">{sig.score}</span>
                        <span className="block text-[9px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">/100</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              {related[0] && (
                <Link href={indexBrandHref(related[0])} className="inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2">
                  See {related[0].brand} on the Index <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          </>
        ) : (
          <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black mb-6">
            Go deeper than the headline.
          </h2>
        )}

        <Link
          href="/intelligence/signal-index"
          className="mt-7 block border border-mono-black p-6 hover:border-mono-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2"
        >
          <p className="font-display font-bold text-mono-black">The Cultural-Signal Index</p>
          <p className="text-sm font-body text-mono-charcoal mt-2">Our authorship-weighted ranking of how brand and cultural work scores. Free leaderboard, methodology and data feed.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-mono-amber-strong font-display font-bold text-sm">EXPLORE THE INDEX <ArrowRight size={15} aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  );
}
