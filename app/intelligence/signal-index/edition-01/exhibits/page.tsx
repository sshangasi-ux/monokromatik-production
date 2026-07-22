import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../../../../components/Navigation';
import EditionExhibit, { EXHIBIT_ORDER, EXHIBIT_TITLES, exhibitNumber } from '../../../../components/dataviz/EditionExhibit';
import { CHAPTERS } from '../../../../../lib/edition-01-chapters';
import { EDITION, editionStats, scoredWorks } from '../../../../../lib/edition-01';

export const revalidate = 3600;
const SITE = 'https://www.monokromatik.com';
const EDITION_URL = `${SITE}/intelligence/signal-index/edition-01`;

export const metadata: Metadata = {
  title: `Exhibits — Edition ${EDITION.number} | MonoKromatik`,
  description:
    'Every exhibit from Edition 01 of the Cultural-Signal Index, without the prose. Free to share and republish with attribution.',
  alternates: { canonical: `${SITE}/intelligence/signal-index/edition-01/exhibits` },
};

/**
 * The deck-builder's page.
 *
 * Every exhibit, chrome intact, no argument around it. This exists because the
 * dominant reuse of a report like this is not reading it end to end — it is
 * lifting one graphic into someone else's slide. Making that easy, and making
 * every lifted graphic self-attributing, is the cheapest distribution mechanic
 * available to a publisher this size.
 *
 * It costs almost nothing to build once the exhibit registry exists, which is
 * the whole reason the registry exists.
 */
export default function ExhibitsPage() {
  // Where each exhibit is discussed, so a reader who wants the argument can find it.
  const chapterFor = (key: string) =>
    CHAPTERS.find((c) => c.sections.some((s) => s.exhibit === key));

  const stats = editionStats(scoredWorks());

  // schema.org Dataset — the markup that makes the edition discoverable in Google
  // Dataset Search and citable by AI engines. Each exhibit's CSV is a
  // DataDownload; isAccessibleForFree is true because the numbers never gate.
  // These are also the five fields a DataCite DOI needs, so the day a DOI is
  // minted the metadata is already assembled.
  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `The Cultural-Signal Index — Edition ${EDITION.number}`,
    description:
      'A transparent, rubric-based expert rating of African and diaspora brand-culture work, scored across idea, authorship, execution and consequence. Not a survey, not a valuation.',
    url: EDITION_URL,
    creator: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    author: { '@type': 'Person', name: 'Sibu Shangase', jobTitle: 'Founder & Lead Analyst' },
    datePublished: EDITION.baseline,
    version: EDITION.rubric,
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: `../${EDITION.baseline}`,
    spatialCoverage: 'Africa and the African diaspora',
    variableMeasured: ['Cultural-Signal Score', 'Idea', 'Authorship', 'Execution', 'Consequence', 'Band', 'Evidence Strength'],
    measurementTechnique: 'Expert rating against a published rubric (docs/SCORING-RUBRIC.md)',
    distribution: EXHIBIT_ORDER.map((key) => ({
      '@type': 'DataDownload',
      name: EXHIBIT_TITLES[key],
      encodingFormat: 'text/csv',
      contentUrl: `${SITE}/api/exhibit/${key}`,
    })),
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
      <Navigation />

      <header className="bg-mono-black text-mono-white py-14 md:py-20 border-b border-mono-white/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/signal-index/edition-01"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright hover:text-mono-amber-bright transition-colors mb-8"
          >
            <ArrowLeft size={14} /> EDITION {EDITION.number}
          </Link>
          <p className="text-[11px] tracking-[0.32em] font-display font-bold text-mono-amber-bright">
            EDITION {EDITION.number} · ALL EXHIBITS
          </p>
          <h1 className="mt-5 font-feature text-4xl md:text-6xl font-normal leading-[1.04] max-w-3xl">
            Every exhibit, without the argument.
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-mono-soft-white/90 max-w-2xl leading-relaxed">
            The {EXHIBIT_ORDER.length} graphics from this edition, each with its own link. You are welcome to share
            and republish any of them, with attribution to MonoKromatik and a link to this edition.
          </p>
          <p className="mt-5 font-body text-sm text-mono-gray-bright max-w-2xl leading-relaxed">
            Every exhibit carries its own credit line, so a screenshot still says where it came from. Figures are
            read from live data and update as works are added and re-scored before the {EDITION.baseline} baseline.
          </p>
        </div>
      </header>

      <section className="py-10 border-b border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">CONTENTS</p>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {EXHIBIT_ORDER.map((key) => (
              <li key={key} className="flex items-baseline justify-between gap-3">
                <a
                  href={`#e${String(exhibitNumber(key)).padStart(2, '0')}`}
                  className="font-body text-mono-charcoal hover:text-mono-amber-strong transition-colors min-w-0"
                >
                  <span className="tabular-nums text-mono-gray text-sm">
                    {String(exhibitNumber(key)).padStart(2, '0')}
                  </span>{' '}
                  {EXHIBIT_TITLES[key]}
                </a>
                <a
                  href={`/api/exhibit/${key}`}
                  download
                  className="shrink-0 text-[10px] font-display font-bold tracking-[0.1em] text-mono-gray hover:text-mono-amber-strong"
                >
                  CSV ↓
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {EXHIBIT_ORDER.map((key) => {
            const ch = chapterFor(key);
            return (
              <div key={key}>
                <EditionExhibit exhibit={key} />
                {ch && (
                  <p className="-mt-8 mb-14 font-body text-sm text-mono-gray">
                    Discussed in{' '}
                    <Link
                      href={`/intelligence/signal-index/edition-01/${ch.slug}`}
                      className="text-mono-amber-strong hover:underline"
                    >
                      Chapter {String(ch.n).padStart(2, '0')} — {ch.title}
                    </Link>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-12 border-t border-mono-gray/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong">HOW TO CITE</p>
          <h2 className="mt-4 font-feature text-2xl md:text-3xl text-mono-black">Take it, and say where it came from.</h2>
          <p className="mt-5 font-body text-mono-charcoal leading-relaxed">
            Short form:{' '}
            <span className="font-display text-mono-black">
              MonoKromatik, Cultural-Signal Index, Edition {EDITION.number} ({EDITION.baseline.slice(0, 4)}).
            </span>
          </p>
          <p className="mt-3 font-body text-mono-charcoal leading-relaxed">
            Long form:{' '}
            <span className="font-display text-mono-black">
              Shangase, S. ({EDITION.baseline.slice(0, 4)}). <em>The Cultural-Signal Index, Edition {EDITION.number}</em>.
              MonoKromatik. Rubric {EDITION.rubric}, baseline {EDITION.baseline}. {SITE}/intelligence/signal-index/edition-01
            </span>
          </p>
          <p className="mt-6 font-body text-sm text-mono-gray leading-relaxed">
            Scores are versioned. Quote the rubric version and the baseline date alongside any figure, because a
            later edition will re-score against new evidence — and a number without its rubric cannot be checked.
          </p>
          <p className="mt-3 font-body text-sm text-mono-gray leading-relaxed">
            Data is published under{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="text-mono-amber-strong hover:underline">
              CC BY 4.0
            </a>
            . A persistent identifier (DOI) is assigned at the {EDITION.baseline} baseline; until then, cite the
            edition URL, the rubric version and the date.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/intelligence/signal-index/methodology"
              className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-5 py-3 text-xs tracking-[0.18em] font-display font-bold hover:bg-mono-amber hover:text-mono-black transition-colors"
            >
              THE METHODOLOGY
            </Link>
            <Link
              href="/api/index?format=csv"
              className="inline-flex items-center gap-2 border border-mono-black/25 px-5 py-3 text-xs tracking-[0.18em] font-display font-bold text-mono-black hover:border-mono-amber transition-colors"
            >
              DOWNLOAD THE DATA (CSV)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
