import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import { SignalStrength } from '../../../components/dataviz/Charts';
import { getPublicCaseStudies } from '../../../../lib/case-studies';
import { rankIndex, brandSlug, workSignal, AXIS_LABELS } from '../../../../lib/signal-index';
import { getMovement, getBrandHistory } from '../../../../lib/index-history';
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
  for (const c of getPublicCaseStudies()) seen.add(brandSlug(c.brand));
  return [...seen].map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const entry = rankIndex(getPublicCaseStudies()).find((e) => brandSlug(e.brand) === brand);
  if (!entry) return { title: 'Brand not found | MonoKromatik' };
  const title = `${entry.brand} — Cultural-Signal Index | MonoKromatik`;
  const description = `${entry.brand} scores ${entry.score}/100 on the MonoKromatik Cultural-Signal Index (rank #${entry.rank}).`;
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
  const studies = getPublicCaseStudies();
  const ranked = rankIndex(studies);
  const entry = ranked.find((e) => brandSlug(e.brand) === brand);
  if (!entry) notFound();

  const works = studies.filter((c) => brandSlug(c.brand) === brand);
  const clampLevel = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as 1 | 2 | 3 | 4 | 5;
  const movement = getMovement(brand);
  const history = getBrandHistory(brand);
  const peers = ranked.filter((e) => brandSlug(e.brand) !== brand && Math.abs(e.score - entry.score) <= 4).slice(0, 5);

  // JSON-LD: this brand's score as a structured, citable PropertyValue inside the
  // Cultural-Signal Index Dataset (per-brand discoverability for search + AI engines).
  const SITE = 'https://www.monokromatik.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/intelligence/signal-index/${brand}`,
    isPartOf: { '@type': 'Dataset', name: 'The Cultural-Signal Index', url: `${SITE}/intelligence/signal-index` },
    about: { '@type': 'Brand', name: entry.brand },
    mainEntity: {
      '@type': 'PropertyValue',
      name: 'Cultural-Signal Score',
      value: entry.score,
      maxValue: 100,
      additionalProperty: AXIS_LABELS.map((label) => ({
        '@type': 'PropertyValue', name: label, value: entry.axisAverages[label] ?? 0, maxValue: 5,
      })),
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
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber-bright mb-6">
            RANK #{entry.rank} OF {ranked.length}
            {movement && movement.scoreDelta !== 0 && (
              <span className={movement.scoreDelta > 0 ? 'text-emerald-400' : 'text-red-400'}>
                {' '}· {movement.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(movement.scoreDelta)} SINCE {movement.since}
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="max-w-3xl text-4xl md:text-6xl font-display font-bold leading-[0.98]">{entry.brand}</h1>
            <span className="text-right">
              <span className="block text-6xl md:text-7xl font-display font-bold leading-none tabular-nums">{entry.score}<span className="text-2xl text-mono-gray"> /100</span></span>
              <span className="block text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mt-2">CULTURAL-SIGNAL SCORE</span>
            </span>
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
              rank={entry.rank!}
              total={ranked.length}
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

        {history.length > 0 && (
          <>
            <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">TRAJECTORY</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 border border-mono-gray/25 bg-mono-white p-6">
              <Sparkline points={history.map((p) => p.score)} />
              <p className="text-sm font-body text-mono-charcoal">
                {history.length > 1
                  ? `Score ${history[0].score} → ${history[history.length - 1].score} since ${history[0].date}.`
                  : `First recorded ${history[0].date}. The trajectory builds as the Index re-snapshots.`}
              </p>
            </div>
          </>
        )}

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
