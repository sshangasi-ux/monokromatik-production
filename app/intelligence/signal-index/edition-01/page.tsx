import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import CountdownTimer from '../../../components/CountdownTimer';
import EditionExhibit from '../../../components/dataviz/EditionExhibit';
import { CHAPTERS } from '../../../../lib/edition-01-chapters';
import {
  EDITION,
  scoredWorks,
  axisSummary,
  craftCaptureGap,
  editionStats,
  limitations,
} from '../../../../lib/edition-01';

export const revalidate = 3600;

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: `${EDITION.title} — Edition ${EDITION.number} | MonoKromatik`,
  description:
    'A transparent, rubric-based expert rating of African and diaspora brand-culture work. Not a survey, not a valuation, not an admiration poll.',
  alternates: { canonical: `${SITE}/intelligence/signal-index/edition-01` },
};

/**
 * Edition 01 — the flagship, built live and backfilled to the 30 September 2026
 * baseline. Every figure on this page is derived from the corpus at build time
 * (lib/edition-01.ts), so adding case studies between now and launch updates the
 * report automatically. There are no hand-typed totals in this file by design —
 * a flagship that contradicts its own dataset is worse than no flagship.
 *
 * See docs/EDITION-01-PLAN.md for the decisions behind the structure.
 */
export default function EditionOnePage() {
  const works = scoredWorks();
  const stats = editionStats(works);
  const axes = axisSummary(works);
  const gap = craftCaptureGap(works);
  const lim = limitations(works);

  // The press number: how few works can show an outcome a third party could check.
  // CONSEQUENCE 4+ is "a real, documented outcome"; 3 and below cannot demonstrate one.
  const documented = works.filter((w) => w.levels.CONSEQUENCE >= 4).length;
  const undocumentedPct = Math.round(((works.length - documented) / works.length) * 100);

  const kicker = 'text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong';

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* ---------- COVER ---------- */}
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/signal-index"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright hover:text-mono-amber-bright transition-colors mb-10"
          >
            <ArrowLeft size={14} /> THE INDEX
          </Link>

          <p className="text-[11px] tracking-[0.32em] font-display font-bold text-mono-amber-bright">
            EDITION {EDITION.number} · BASELINE 30 SEPTEMBER 2026 · RUBRIC {EDITION.rubric.toUpperCase()}
          </p>

          <h1 className="mt-6 font-feature text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.02] max-w-4xl">
            The craft is there.
            <br />
            The capture isn&rsquo;t.
          </h1>

          <p className="mt-7 font-body text-lg md:text-xl text-mono-soft-white/90 max-w-2xl leading-relaxed">
            A transparent, rubric-based expert rating of African and diaspora brand-culture work — the
            idea, who owned it, how it was made, and what it actually returned.
          </p>

          {/* In-progress notice. This page is live and backfilled; say so plainly
              rather than letting a reader mistake a build for a finished edition. */}
          <div className="mt-9 inline-flex items-start gap-3 border border-mono-amber/40 bg-mono-amber/10 px-4 py-3 max-w-2xl">
            <span className="mt-0.5 text-[10px] tracking-[0.2em] font-display font-bold text-mono-amber-bright shrink-0">
              IN BUILD
            </span>
            <p className="font-body text-sm text-mono-soft-white/90 leading-relaxed">
              Edition 01 publishes on <strong>30 September 2026</strong>. This page is live while it is
              written — figures update as works are added and re-scored. Scores shown are current as
              at build, not final.
            </p>
          </div>

          {/* Turn the date into a moment: a live countdown + a route to the launch
              page (notify capture + press pack). The launch is the awareness event. */}
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <CountdownTimer target={`${EDITION.baseline}T06:00:00Z`} liveLabel={`EDITION ${EDITION.number} IS LIVE`} tone="dark" />
            <Link
              href="/intelligence/signal-index/edition-01/launch"
              className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-5 py-3 text-xs tracking-[0.18em] font-display font-bold hover:bg-mono-amber-bright transition-colors"
            >
              GET NOTIFIED <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- THE ONE NUMBER ---------- */}
      <section className="py-16 md:py-20 border-b border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>THE FINDING</p>
          <div className="mt-8 border-y border-mono-gray/25 py-10 text-center">
            <p className="font-display font-bold text-mono-amber leading-none text-[clamp(3.5rem,12vw,8rem)]">
              {undocumentedPct}%
            </p>
            <p className="mt-5 mx-auto max-w-xl font-body text-lg text-mono-charcoal leading-relaxed">
              of the African brand-culture work we rated could not show an outcome a third party
              could check.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-8 max-w-3xl">
            <p className="font-body text-mono-charcoal leading-relaxed">
              Across {stats.works} scored works, the two axes measuring how the work was{' '}
              <strong>made</strong> outrun the two measuring what it <strong>returned</strong>.
              Execution averages <strong>{gap.execution.toFixed(2)}</strong> of 5; consequence averages{' '}
              <strong>{gap.consequence.toFixed(2)}</strong>. The distance between them —{' '}
              <strong>{gap.gap.toFixed(2)}</strong> — is this edition&rsquo;s subject.
            </p>
            <p className="font-body text-mono-charcoal leading-relaxed">
              This is not a claim that African work is weak. It is the opposite: the ideas and the
              craft score well. What is thin is <em>ownership</em> and <em>evidence of consequence</em> —
              who kept the value, and whether anything verifiable followed.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- EXHIBIT 01 — the decision object ---------- */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>THE UNIVERSE</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-tight max-w-2xl">
            Every work we rated, on one scale.
          </h2>

          <EditionExhibit exhibit="universe" />

          {/* Buffer's mechanic: make the chart the citable unit and pre-clear it. */}
          <p className="mt-2 font-body text-sm text-mono-gray max-w-2xl leading-relaxed">
            You are welcome to share and republish any exhibit on this page, with attribution to
            MonoKromatik and a link to this edition.{' '}
            <Link href="/intelligence/signal-index/methodology" className="text-mono-amber-strong hover:underline">
              How scoring works →
            </Link>
          </p>
        </div>
      </section>

      {/* ---------- EXHIBITS 02–08 ---------- */}
      <section className="py-14 border-t border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>THE DISTRIBUTION</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-tight max-w-2xl">
            Where the work sits.
          </h2>

          <EditionExhibit exhibit="bandLedger" />

          <EditionExhibit exhibit="contribution" />

          <p className="mt-4 font-body text-mono-charcoal leading-relaxed max-w-2xl">
            Authorship carries the heaviest weight because it is the question this publication exists to ask:
            not who appeared in the work, but who originated it and who kept it. On the exhibit above, it is
            the widest slot — and the corpus fills it less completely than it fills execution.
          </p>
        </div>
      </section>

      <section className="py-14 border-t border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>ONE WORK, IN FULL</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-tight max-w-2xl">
            What a rating actually contains.
          </h2>
          <p className="mt-5 font-body text-mono-charcoal leading-relaxed max-w-2xl">
            The highest-rated work in this edition, shown the way every rating in the Index is built — score,
            band, the weighted contribution of each axis, and the evidence behind it.
          </p>

          <EditionExhibit exhibit="evidence" />

          <EditionExhibit exhibit="scorecard" />

          <EditionExhibit exhibit="axisLadder" />
        </div>
      </section>

      <section className="py-14 border-t border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>WHAT CHANGED, AND WHAT DIDN&rsquo;T</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-tight max-w-2xl">
            The ruler moved. The work didn&rsquo;t.
          </h2>
          <p className="mt-5 font-body text-mono-charcoal leading-relaxed max-w-2xl">
            Every work in this edition was re-scored against rubric {EDITION.rubric}. Scores fell. That is the
            correction working — but it means readings from before the change are not comparable to readings
            after it, and we do not present them as though they were.
          </p>

          <EditionExhibit exhibit="rebase" />

          <EditionExhibit exhibit="panelLedger" />
        </div>
      </section>

      {/* ---------- CONTENTS ---------- */}
      <section className="py-14 border-t border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>THE EDITION</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-tight max-w-2xl">
            Seven chapters.
          </h2>
          <ol className="mt-8 border border-mono-gray/25 bg-mono-white">
            {CHAPTERS.map((c) => (
              <li key={c.slug} className="border-b border-mono-gray/15 last:border-b-0">
                <Link
                  href={`/intelligence/signal-index/edition-01/${c.slug}`}
                  className="flex items-baseline gap-4 px-5 py-4 hover:bg-mono-soft-white transition-colors group"
                >
                  <span className="w-7 shrink-0 text-sm font-display font-bold text-mono-gray tabular-nums">
                    {String(c.n).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display font-bold text-mono-black group-hover:text-mono-amber-strong transition-colors">
                      {c.title}
                    </span>
                    <span className="mt-1 block font-body text-sm text-mono-gray leading-relaxed">{c.standfirst}</span>
                  </span>
                  <ArrowRight size={15} className="ml-auto shrink-0 self-center text-mono-gray group-hover:text-mono-amber-strong transition-colors" />
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href="/intelligence/signal-index/edition-01/exhibits"
            className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.18em] font-display font-bold text-mono-amber-strong hover:underline"
          >
            ALL EXHIBITS, WITHOUT THE ARGUMENT <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ---------- LIMITATIONS — stated early, not buried ---------- */}
      <section className="py-14 border-t border-mono-gray/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={kicker}>WHAT THIS EDITION CANNOT TELL YOU</p>
          <h3 className="mt-4 font-feature text-2xl md:text-3xl text-mono-black">The limits, up front.</h3>
          <ul className="mt-6 space-y-4 font-body text-mono-charcoal leading-relaxed">
            <li>
              <strong>This rates work, not brands.</strong> {lim.singleWorkShare}% of the {lim.brands}{' '}
              brands here have exactly one scored work. A brand-level reading would imply a body of
              evidence that does not yet exist.
            </li>
            <li>
              <strong>Ties are common and ranks are not meaningful between them.</strong>{' '}
              {lim.ties.tiedWorks} of {lim.ties.total} works share a score, across{' '}
              {lim.ties.distinctScores} distinct values.
            </li>
            <li>
              <strong>The sample is selected, not representative.</strong> We write about notable
              work, so nothing here scores below {lim.lowestIdeaLevel} on idea. This is an expert
              rating against a published rubric — not a survey, and it carries no margin of error
              because none can honestly be computed.
            </li>
            <li>
              <strong>Scores are versioned.</strong> Every score is set under rubric{' '}
              {EDITION.rubric}. Re-scoring under a new rubric is disclosed as a methodology change,
              never applied silently.
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/intelligence/signal-index/methodology"
              className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-5 py-3 text-xs tracking-[0.18em] font-display font-bold hover:bg-mono-amber hover:text-mono-black transition-colors"
            >
              READ THE METHODOLOGY <ArrowRight size={14} />
            </Link>
            <Link
              href="/intelligence/signal-index"
              className="inline-flex items-center gap-2 border border-mono-black/25 px-5 py-3 text-xs tracking-[0.18em] font-display font-bold text-mono-black hover:border-mono-amber transition-colors"
            >
              THE LIVE INDEX <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
