import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Lock, FileText, Database, BarChart3, Mail } from 'lucide-react';
import Navigation from '../../../../components/Navigation';
import { EDITION, scoredWorks, editionStats, craftCaptureGap, axisSummary, bandCounts } from '../../../../../lib/edition-01';
import { rankWorks, brandSlug } from '../../../../../lib/signal-index';
import { getAllCaseStudies } from '../../../../../lib/case-studies';

export const revalidate = 3600;

const SITE = 'https://www.monokromatik.com';
const EDITION_URL = `${SITE}/intelligence/signal-index/edition-01`;
const LAUNCH_HUMAN = '30 September 2026, 08:00 SAST';
const PRESS_EMAIL = 'editor@monokromatik.com';

// Embargoed: this pack carries the pre-release read, so keep it out of the index.
// The public surface is the edition itself, which indexes on launch.
export const metadata: Metadata = {
  title: `Press pack — The Cultural-Signal Index, Edition ${EDITION.number} | MonoKromatik`,
  description: `Embargoed press materials for Edition ${EDITION.number} of the Cultural-Signal Index. For release ${LAUNCH_HUMAN}.`,
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE}/intelligence/signal-index/edition-01/press` },
};

export default function EditionPressPage() {
  const works = scoredWorks();
  const stats = editionStats(works);
  const gap = craftCaptureGap(works);
  const axes = axisSummary(works);
  const bands = bandCounts(works);
  const top = rankWorks(getAllCaseStudies()).slice(0, 10);

  const kicker = 'text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong';

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* Embargo banner — the single most important line on the page. */}
      <div className="bg-mono-amber text-mono-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Lock size={16} className="shrink-0" />
          <p className="text-[11px] sm:text-xs tracking-[0.12em] font-display font-bold">
            EMBARGOED · FOR RELEASE {LAUNCH_HUMAN} (07:00 WAT) · NOT FOR PUBLICATION BEFORE THIS TIME
          </p>
        </div>
      </div>

      <header className="bg-mono-black text-mono-white py-14 md:py-20 border-b border-mono-white/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/signal-index/edition-01/launch"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright hover:text-mono-amber-bright transition-colors mb-8"
          >
            <ArrowLeft size={14} /> EDITION {EDITION.number} LAUNCH
          </Link>
          <p className="text-[11px] tracking-[0.32em] font-display font-bold text-mono-amber-bright">PRESS PACK · EDITION {EDITION.number}</p>
          <h1 className="mt-5 font-feature text-4xl md:text-6xl font-normal leading-[1.04] max-w-3xl">
            The Cultural-Signal Index, Edition {EDITION.number}.
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-mono-soft-white/90 max-w-2xl leading-relaxed">
            The first transparent, rubric-based rating of African &amp; diaspora brand-culture work — {stats.works} works
            across {stats.brands} brands, scored on idea, authorship, execution and consequence. Everything a newsroom
            needs to cover it, under embargo until {LAUNCH_HUMAN}.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 space-y-16">
        {/* The story in one line + the number */}
        <section>
          <p className={kicker}>THE STORY</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-[1.05] max-w-3xl">
            African brand-culture work is made better than it is owned.
          </h2>
          <p className="mt-5 font-body text-lg text-mono-charcoal leading-relaxed max-w-2xl">
            Across {stats.works} scored works, the craft is real — a mean execution of{' '}
            <strong className="text-mono-black">{gap.execution.toFixed(2)}/5</strong>. What that craft returns is not: a
            mean consequence of <strong className="text-mono-black">{gap.consequence.toFixed(2)}/5</strong>. The{' '}
            <strong className="text-mono-black">{gap.gap.toFixed(2)}-point craft-capture gap</strong> between how the work
            is made and what it captures is Edition {EDITION.number}&rsquo;s headline finding.
          </p>
        </section>

        {/* Key numbers */}
        <section>
          <p className={kicker}>THE NUMBERS</p>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-px bg-mono-gray/20 border border-mono-gray/25">
            {[
              ['Works scored', String(stats.works)],
              ['Brands', String(stats.brands)],
              ['Markets', String(stats.markets)],
              ['Mean score', `${stats.mean}/100`],
              ['Highest', `${stats.highest}/100`],
              ['Craft-capture gap', `${gap.gap.toFixed(2)} pts`],
            ].map(([label, value]) => (
              <div key={label} className="bg-mono-white px-5 py-6">
                <p className="text-3xl md:text-4xl font-display font-bold text-mono-black tabular-nums">{value}</p>
                <p className="mt-1 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray uppercase">{label}</p>
              </div>
            ))}
          </div>
          {/* Axis means */}
          <div className="mt-8 grid sm:grid-cols-4 gap-px bg-mono-gray/20 border border-mono-gray/25">
            {axes.map((a) => (
              <div key={a.axis} className="bg-mono-white p-5">
                <p className="text-[10px] tracking-[0.16em] font-display font-bold text-mono-amber-strong">{a.axis}</p>
                <p className="mt-2 text-2xl font-display font-bold text-mono-black tabular-nums">{a.mean.toFixed(2)}<span className="text-sm text-mono-gray">/5</span></p>
                <p className="mt-1 text-[10px] font-display font-bold text-mono-gray">{Math.round(a.weight * 100)}% weight</p>
              </div>
            ))}
          </div>
        </section>

        {/* Band distribution */}
        <section>
          <p className={kicker}>THE DISTRIBUTION</p>
          <h3 className="mt-4 font-feature text-2xl md:text-3xl text-mono-black">Where the work lands.</h3>
          <div className="mt-5 border border-mono-gray/25">
            {bands.map((b) => (
              <div key={b.band} className="flex items-center gap-4 px-5 py-3 border-b border-mono-gray/15 last:border-b-0">
                <span className="w-12 shrink-0 font-display font-bold text-mono-black text-sm">{b.band}</span>
                <span className="w-16 shrink-0 text-[11px] font-body text-mono-gray tabular-nums">{b.min}–{b.max}</span>
                <div className="flex-1 h-2.5 bg-mono-gray/15">
                  <div className="h-full bg-mono-amber" style={{ width: `${stats.works ? (b.count / stats.works) * 100 : 0}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right font-display font-bold text-mono-black tabular-nums text-sm">{b.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top of the ranking — taster */}
        <section>
          <p className={kicker}>THE TOP OF THE INDEX</p>
          <h3 className="mt-4 font-feature text-2xl md:text-3xl text-mono-black">The ten highest-rated works.</h3>
          <ol className="mt-5 border border-mono-gray/25">
            {top.map((w) => (
              <li key={w.slug} className="flex items-center gap-4 px-5 py-3.5 border-b border-mono-gray/15 last:border-b-0">
                <span className="w-6 shrink-0 font-display font-bold text-mono-gray tabular-nums">{w.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-amber-strong truncate">{w.brand.toUpperCase()}</p>
                  <p className="font-display font-bold text-mono-black truncate">{w.title}</p>
                </div>
                <span className="shrink-0 text-2xl font-display font-bold text-mono-black tabular-nums">{w.score}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm font-body text-mono-gray">
            The full ranking of all {stats.works} works is at{' '}
            <Link href="/intelligence/signal-index" className="text-mono-amber-strong font-bold hover:underline">the Index</Link>.
          </p>
        </section>

        {/* Assets */}
        <section>
          <p className={kicker}>ASSETS &amp; DATA</p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <a href="/api/index?format=csv" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
              <Database size={18} className="text-mono-amber-strong" /> The full ranking (CSV) <ArrowRight size={15} className="ml-auto" />
            </a>
            <a href="/api/index" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
              <Database size={18} className="text-mono-amber-strong" /> The data (JSON) <ArrowRight size={15} className="ml-auto" />
            </a>
            <Link href="/intelligence/signal-index/methodology" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
              <FileText size={18} className="text-mono-amber-strong" /> The methodology <ArrowRight size={15} className="ml-auto" />
            </Link>
            <Link href="/intelligence/signal-index/edition-01/exhibits" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
              <BarChart3 size={18} className="text-mono-amber-strong" /> Every exhibit (self-crediting charts) <ArrowRight size={15} className="ml-auto" />
            </Link>
          </div>
        </section>

        {/* How to cite + boilerplate + contact */}
        <section className="border-t border-mono-gray/20 pt-12 grid md:grid-cols-2 gap-10">
          <div>
            <p className={kicker}>HOW TO CITE</p>
            <p className="mt-4 font-body text-mono-charcoal leading-relaxed">
              <span className="font-display text-mono-black">MonoKromatik, Cultural-Signal Index, Edition {EDITION.number} ({EDITION.baseline.slice(0, 4)}).</span>{' '}
              Quote the rubric version ({EDITION.rubric}) and baseline date ({EDITION.baseline}) with any figure — a number
              without its rubric cannot be checked. Coverage credits &ldquo;MonoKromatik Cultural-Signal Index, Edition {EDITION.number}&rdquo;
              and links {EDITION_URL}.
            </p>
          </div>
          <div>
            <p className={kicker}>ABOUT</p>
            <p className="mt-4 font-body text-mono-charcoal leading-relaxed">
              MonoKromatik is an African &amp; diaspora brand-intelligence publication. The Cultural-Signal Index is its
              transparent, rubric-based expert rating of brand-culture work — editorial judgement, evidence-led, and
              re-graded in public. Scores are set and signed by a named analyst; the full method is published.
            </p>
            <a href={`mailto:${PRESS_EMAIL}?subject=Cultural-Signal%20Index%20Edition%20${EDITION.number}%20%E2%80%94%20press`} className="mt-5 inline-flex items-center gap-2 font-display font-bold text-mono-amber-strong hover:underline">
              <Mail size={16} /> {PRESS_EMAIL}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
