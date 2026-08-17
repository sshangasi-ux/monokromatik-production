import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import { SignalStrength } from '../../../components/dataviz/Charts';
import { getAllCaseStudies } from '../../../../lib/case-studies';
import { rankIndex, rankWorks, brandSlug, workSignal, AXIS_LABELS } from '../../../../lib/signal-index';
import { getMovement, getBrandHistory } from '../../../../lib/index-history';
import { getArticlesForBrand } from '../../../../lib/entities';
import { brandEvidence, describeEvidence } from '../../../../lib/evidence-strength';
import Sparkline from '../Sparkline';
import BadgeEmbed from '../BadgeEmbed';
import ShareIndexCard from './ShareIndexCard';
import FollowButton from '../../../components/FollowButton';

interface PageProps {
  params: Promise<{ brand: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const seen = new Set<string>();
  for (const c of getAllCaseStudies()) seen.add(brandSlug(c.brand));
  return [...seen].map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const entry = rankIndex(getAllCaseStudies()).find((e) => brandSlug(e.brand) === brand);
  if (!entry) return { title: 'Brand not found | MonoKromatik' };
  const title = `${entry.brand} — Cultural-Signal Index | MonoKromatik`;
  const description = `${entry.brand} averages ${entry.score}/100 across ${entry.works} scored ${entry.works === 1 ? 'work' : 'works'} on the MonoKromatik Cultural-Signal Index.`;
  // og:image is supplied by the co-located opengraph-image route (the share-card).
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile', url: `https://www.monokromatik.com/intelligence/signal-index/${brand}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BrandIndexPage({ params }: PageProps) {
  const { brand } = await params;
  const studies = getAllCaseStudies();
  const ranked = rankIndex(studies);
  const entry = ranked.find((e) => brandSlug(e.brand) === brand);
  if (!entry) notFound();

  const works = studies.filter((c) => brandSlug(c.brand) === brand);
  const evidence = brandEvidence(works);
  const clampLevel = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as 1 | 2 | 3 | 4 | 5;
  const movement = getMovement(brand);
  const history = getBrandHistory(brand);
  const peers = ranked.filter((e) => brandSlug(e.brand) !== brand && Math.abs(e.score - entry.score) <= 4).slice(0, 5);
  // The Index ranks works, so this brand's standing IS its best-ranked work.
  const allWorks = rankWorks(studies);
  const bestWork = allWorks.find((w) => w.brandSlug === brand) ?? null;
  // Entity flywheel (reverse lookup): editorial coverage that references this
  // brand — so the scored work and the running commentary sit on one page.
  const coverage = getArticlesForBrand(brand, entry.brand);

  // JSON-LD: this brand's score as a structured, citable PropertyValue inside the
  // Cultural-Signal Index Dataset (per-brand discoverability for search + AI engines).
  const SITE = 'https://www.monokromatik.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/intelligence/signal-index/${brand}`,
    isPartOf: { '@type': 'Dataset', name: 'The Cultural-Signal Index', url: `${SITE}/intelligence/signal-index` },
    about: { '@type': 'Brand', name: entry.brand },
    author: { '@type': 'Person', name: 'Sibu Shangase', jobTitle: 'Founder & Lead Analyst', affiliation: { '@type': 'Organization', name: 'MonoKromatik' } },
    mainEntity: {
      '@type': 'PropertyValue',
      name: 'Cultural-Signal Score',
      value: entry.score,
      maxValue: 100,
      additionalProperty: [
        ...AXIS_LABELS.map((label) => ({
          '@type': 'PropertyValue', name: label, value: entry.axisAverages[label] ?? 0, maxValue: 5,
        })),
        // The measured anchor: a countable corroboration score beside the editorial rating.
        {
          '@type': 'PropertyValue',
          name: 'Evidence Strength',
          description: 'Measured corroboration behind the rating: confirmed facts, cited sources and verification.',
          value: evidence.score,
          maxValue: 100,
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Confirmed facts', value: evidence.confirmed },
            { '@type': 'PropertyValue', name: 'Sources cited', value: evidence.sources },
            { '@type': 'PropertyValue', name: 'Verified works', value: evidence.verifiedWorks },
          ],
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      <header className="bg-mono-black text-mono-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> THE INDEX
          </Link>
          {/* The Index ranks WORK, so this page reports the brand's best-ranked
              work rather than inventing a brand rank the Index no longer keeps. */}
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber-bright mb-6">
            {bestWork ? <>BEST-RANKED WORK #{bestWork.rank} OF {allWorks.length}</> : <>UNRANKED</>}
            {' '}· {entry.works} SCORED {entry.works === 1 ? 'WORK' : 'WORKS'}
            {movement?.rebased ? (
              <span className="text-mono-gray"> · REBASED — RUBRIC {movement.rubricTo?.toUpperCase()}</span>
            ) : movement && movement.scoreDelta !== 0 ? (
              <span className={movement.scoreDelta > 0 ? 'text-emerald-400' : 'text-red-400'}>
                {' '}· {movement.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(movement.scoreDelta)} SINCE {movement.since}
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="max-w-3xl text-4xl md:text-6xl font-display font-bold leading-[0.98]">{entry.brand}</h1>
            <div className="flex items-end gap-8">
              <span className="text-right">
                <span className="block text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mb-1">EVIDENCE</span>
                <span className="block text-3xl md:text-4xl font-display font-bold leading-none tabular-nums text-mono-soft-white">{evidence.score}</span>
                <span className="block text-[11px] tracking-[0.14em] font-display font-bold text-mono-amber mt-1.5">{evidence.tier.toUpperCase()} · MEASURED</span>
              </span>
              <span className="text-right">
                <span className="block text-6xl md:text-7xl font-display font-bold leading-none tabular-nums">{entry.score}<span className="text-2xl text-mono-gray"> /100</span></span>
                <span className="block text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mt-2">CULTURAL-SIGNAL SCORE</span>
              </span>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <FollowButton slug={brand} variant="chip" />
            <span className="text-[11px] font-body text-mono-gray max-w-xs">Follow to track this brand&rsquo;s movement on the Index — alerts surface here when the score changes.</span>
          </div>
          <div className="mt-7">
            <ShareIndexCard
              slug={brand}
              brand={entry.brand}
              score={entry.score}
              rank={bestWork?.rank ?? 0}
              total={allWorks.length}
              scoreDelta={movement?.scoreDelta ?? null}
            />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">
          DIMENSION AVERAGES{works.length > 1 ? ` (${works.length} WORKS)` : ''}
        </h2>
        <div className="grid sm:grid-cols-2 gap-px border border-mono-gray/25 bg-mono-gray/25">
          {AXIS_LABELS.map((label) => (
            <div key={label} className="bg-mono-white p-5 flex items-center justify-between gap-4">
              <span className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">{label}</span>
              <div className="flex items-center gap-3">
                <SignalStrength level={clampLevel(entry.axisAverages[label] ?? 0)} tone="light" />
                <span className="font-display font-bold text-mono-black tabular-nums w-8 text-right">{entry.axisAverages[label] ?? '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* The measured anchor — a countable corroboration signal beside the editorial score. */}
        <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">EVIDENCE BASE · MEASURED</h2>
        <div className="border border-mono-gray/25 bg-mono-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-display font-bold text-mono-black tabular-nums leading-none">{evidence.score}<span className="text-lg text-mono-gray">/100</span></span>
              <span className={`text-[11px] tracking-[0.16em] font-display font-bold px-2.5 py-1 ${evidence.tier === 'Strong' ? 'bg-emerald-600/15 text-emerald-700' : evidence.tier === 'Moderate' ? 'bg-mono-amber/20 text-mono-amber-strong' : 'bg-mono-gray/15 text-mono-charcoal'}`}>{evidence.tier.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-6 text-right">
              <span><span className="block text-2xl font-display font-bold text-mono-black tabular-nums leading-none">{evidence.confirmed}</span><span className="block text-[10px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">CONFIRMED</span></span>
              <span><span className="block text-2xl font-display font-bold text-mono-black tabular-nums leading-none">{evidence.sources}</span><span className="block text-[10px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">SOURCES</span></span>
              <span><span className="block text-2xl font-display font-bold text-mono-black tabular-nums leading-none">{evidence.verifiedWorks}</span><span className="block text-[10px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">VERIFIED</span></span>
            </div>
          </div>
          <p className="mt-5 text-sm font-body text-mono-charcoal leading-relaxed border-t border-mono-gray/20 pt-5">
            A <span className="font-display font-bold">measured</span> reading — counted, not scored by an editor: {describeEvidence(evidence)} across {evidence.works} {evidence.works === 1 ? 'work' : 'works'}. It sits beside the editorial Cultural-Signal Score so the rating carries its own data-quality indicator. The number rises as corroboration deepens — more independently-confirmed facts, more sources, and verified reporting.
          </p>
        </div>

        {history.length > 0 && (() => {
          // Only plot the trailing run of snapshots that share the current rubric.
          // A line drawn across a rubric change reads as a collapse — it isn't one,
          // the scale moved under it. The earlier era is disclosed, not deleted.
          const rubricNow = history[history.length - 1].rubricVersion;
          let start = history.length - 1;
          while (start > 0 && history[start - 1].rubricVersion === rubricNow) start--;
          const era = history.slice(start);
          const priorEra = history.slice(0, start);
          return (
            <>
              <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">TRAJECTORY</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 border border-mono-gray/25 bg-mono-white p-6">
                <Sparkline points={era.map((p) => p.score)} />
                <div className="text-sm font-body text-mono-charcoal">
                  <p>
                    {era.length > 1
                      ? `Score ${era[0].score} → ${era[era.length - 1].score} since ${era[0].date}.`
                      : `First recorded under rubric ${rubricNow} on ${era[0].date}. The trajectory builds as the Index re-snapshots.`}
                  </p>
                  {priorEra.length > 0 && (
                    <p className="mt-2 text-mono-gray">
                      {priorEra.length} earlier reading{priorEra.length === 1 ? '' : 's'} (from {priorEra[0].date}) were scored under
                      rubric {priorEra[priorEra.length - 1].rubricVersion} and are not plotted — they are not comparable to{' '}
                      {rubricNow} scores.{' '}
                      <Link href="/intelligence/signal-index/methodology" className="text-mono-amber-strong hover:underline">
                        How scoring works
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {peers.length > 0 && (
          <>
            <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">IN THE SAME BAND</h2>
            <div className="flex flex-wrap gap-3">
              {peers.map((p) => (
                <Link key={p.brand} href={`/intelligence/signal-index/${brandSlug(p.brand)}`} className="inline-flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-4 py-3 hover:border-mono-amber transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong">
                  <span className="font-display font-bold text-mono-black text-sm">{p.brand}</span>
                  <span className="text-mono-amber-strong font-display font-bold tabular-nums">{p.score}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">THE WORK</h2>
        <div className="space-y-4">
          {works.map((c) => {
            const sig = workSignal(c);
            return (
              <Link key={c.slug} href={`/intelligence/case-studies/${c.slug}`} className="group flex items-center justify-between gap-5 bg-mono-white border border-mono-gray/25 p-6 hover:border-mono-amber transition-colors">
                <div className="min-w-0">
                  <p className="font-display font-bold text-mono-black text-xl truncate group-hover:text-mono-amber transition-colors">{c.title}</p>
                  <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">{c.market} · {c.verification.toUpperCase()}</p>
                </div>
                {sig && (
                  <span className="shrink-0 text-right">
                    <span className="block text-2xl font-display font-bold text-mono-black leading-none tabular-nums">{sig.score}</span>
                    <span className="block text-[9px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">SIGNAL</span>
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {coverage.length > 0 && (
          <>
            <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">LATEST COVERAGE</h2>
            <div className="space-y-3">
              {coverage.map((a) => (
                <Link key={a.slug} href={`/article/${a.slug}`} className="group flex items-center justify-between gap-5 bg-mono-white border border-mono-gray/25 p-5 hover:border-mono-amber transition-colors">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-mono-black text-lg truncate group-hover:text-mono-amber transition-colors">{a.title}</p>
                    <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1 uppercase">{a.category}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-mono-gray group-hover:text-mono-amber-strong transition-colors" />
                </Link>
              ))}
            </div>
          </>
        )}

        <section className="mt-14 border-t border-mono-gray/20 pt-12">
          <BadgeEmbed slug={brand} brand={entry.brand} score={entry.score} />
        </section>

        <div className="mt-14 bg-mono-black text-mono-white p-7 md:p-9">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-3">IS THIS YOUR BRAND?</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight max-w-2xl">Get the full Signal Scorecard — the authorship read, and a roadmap to move the number.</h2>
          <Link href="/work-with-us?interest=scorecard" className="mt-6 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber-hover transition-colors">
            GET YOUR SCORECARD <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12">
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
            BACK TO THE INDEX <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
