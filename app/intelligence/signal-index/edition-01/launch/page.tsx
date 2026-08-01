import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, CalendarClock, Mail, FileText, Database } from 'lucide-react';
import Navigation from '../../../../components/Navigation';
import CountdownTimer from '../../../../components/CountdownTimer';
import NewsletterSignup from '../../../../components/NewsletterSignup';
import { EDITION, scoredWorks, editionStats, craftCaptureGap } from '../../../../../lib/edition-01';

export const revalidate = 3600;

const SITE = 'https://www.monokromatik.com';
const LAUNCH_URL = `${SITE}/intelligence/signal-index/edition-01/launch`;
// The embargo lifts at one fixed clock time — 08:00 SAST / 07:00 WAT on the
// baseline date (see docs/EDITION-01-PLAN.md §8). 08:00 SAST = 06:00 UTC.
const LAUNCH_INSTANT = `${EDITION.baseline}T06:00:00Z`;
const LAUNCH_HUMAN = '30 September 2026, 08:00 SAST';
// The established, live editorial inbox (same as the methodology/corrections
// route). A dedicated press@ alias can forward here later, but don't risk a
// launch enquiry bouncing on an unconfigured address.
const PRESS_EMAIL = 'editor@monokromatik.com';

export const metadata: Metadata = {
  title: `Edition ${EDITION.number} lands ${LAUNCH_HUMAN.split(',')[0]} | The Cultural-Signal Index`,
  description:
    'Edition 01 of the Cultural-Signal Index — a transparent, rubric-based rating of African & diaspora brand-culture work — publishes 30 September 2026. Get notified, or request the embargoed press pack.',
  alternates: { canonical: LAUNCH_URL },
  openGraph: {
    title: `The Cultural-Signal Index — Edition ${EDITION.number} lands 30 September 2026`,
    description:
      'A transparent, rubric-based rating of African & diaspora brand-culture work. Full ranking, methodology and data on 30 September.',
    url: LAUNCH_URL,
    type: 'website',
  },
};

export default function EditionLaunchPage() {
  const works = scoredWorks();
  const stats = editionStats(works);
  const gap = craftCaptureGap(works);

  // schema.org Event — makes the launch a discoverable, citable moment (Google,
  // AI engines), and gives the date a structured home. Free + public.
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `The Cultural-Signal Index — Edition ${EDITION.number}`,
    description:
      'Publication of Edition 01 of the Cultural-Signal Index: a transparent, rubric-based rating of African & diaspora brand-culture work.',
    startDate: LAUNCH_INSTANT,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'VirtualLocation', url: `${SITE}/intelligence/signal-index/edition-01` },
    organizer: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    isAccessibleForFree: true,
    url: LAUNCH_URL,
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <Navigation />

      {/* Hero — the moment + the countdown. */}
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/signal-index/edition-01"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright hover:text-mono-amber-bright transition-colors mb-10"
          >
            <ArrowLeft size={14} /> EDITION {EDITION.number}
          </Link>
          <p className="text-[11px] tracking-[0.32em] font-display font-bold text-mono-amber-bright">
            THE CULTURAL-SIGNAL INDEX · EDITION {EDITION.number}
          </p>
          <h1 className="mt-5 font-feature text-5xl md:text-7xl font-normal leading-[1.02] max-w-3xl">
            The first rating of African brand-culture work lands 30 September.
          </h1>
          <p className="mt-7 font-body text-lg md:text-xl text-mono-soft-white/90 max-w-2xl leading-relaxed">
            {stats.works} works. {stats.brands} brands. One transparent rubric. On {LAUNCH_HUMAN} the full
            ranking, the methodology and the underlying data publish at once — under embargo to press until the clock strikes.
          </p>
          <div className="mt-10">
            <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-gray-bright mb-4">COUNTDOWN TO EDITION {EDITION.number}</p>
            <CountdownTimer target={LAUNCH_INSTANT} liveLabel={`EDITION ${EDITION.number} IS LIVE`} tone="dark" />
          </div>
        </div>
      </header>

      {/* The finding — the live headline number, computed from the corpus now. */}
      <section className="py-16 md:py-20 border-b border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE FINDING</p>
          <h2 className="mt-4 font-feature text-3xl md:text-5xl text-mono-black leading-[1.05] max-w-3xl">
            The work is made better than it is owned.
          </h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed max-w-2xl">
            Across the {stats.works} scored works, the craft is real — a mean execution of{' '}
            <strong className="text-mono-black">{gap.execution.toFixed(2)}/5</strong>. What that craft
            <em> returns</em> is not: a mean consequence of just{' '}
            <strong className="text-mono-black">{gap.consequence.toFixed(2)}/5</strong>. The gap between
            how well African brand-culture work is <em>made</em> and what it actually <em>captures</em> —{' '}
            <strong className="text-mono-black">{gap.gap.toFixed(2)} points</strong> — is Edition {EDITION.number}&rsquo;s
            headline. The full evidence lands on the 30th.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-mono-gray/20 border border-mono-gray/25">
            {[
              ['WORKS SCORED', String(stats.works)],
              ['BRANDS', String(stats.brands)],
              ['MARKETS', String(stats.markets)],
              ['RUBRIC', EDITION.rubric],
            ].map(([label, value]) => (
              <div key={label} className="bg-mono-white px-5 py-6">
                <p className="text-3xl md:text-4xl font-display font-bold text-mono-black tabular-nums">{value}</p>
                <p className="mt-1 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notify capture — build the launch list. Tagged distinctly in Kit. */}
      <section className="py-16 md:py-20 bg-mono-black text-mono-white border-b border-mono-white/15">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-bright">BE THERE WHEN IT DROPS</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl leading-[1.05]">
            Get the edition the moment it publishes.
          </h2>
          <p className="mt-5 font-body text-mono-soft-white/90 leading-relaxed">
            One email at 08:00 SAST on 30 September — the ranking, the methodology and the data, before it makes the rounds.
            No spam; just the edition and the Weekly Signal that carries it.
          </p>
          <div className="mt-8">
            <NewsletterSignup variant="footer" source="edition-01-launch" />
          </div>
        </div>
      </section>

      {/* Press & embargo — the machinery for journalists. */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong">PRESS &amp; EMBARGO</p>
          <h2 className="mt-4 font-feature text-3xl md:text-4xl text-mono-black leading-[1.05] max-w-3xl">
            For journalists: the pack, under embargo.
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-4 font-body text-mono-charcoal leading-relaxed">
              <p className="flex items-start gap-3">
                <CalendarClock className="text-mono-amber shrink-0 mt-1" size={20} />
                <span>
                  <strong className="text-mono-black">Embargo lifts {LAUNCH_HUMAN}</strong> (07:00 WAT), one fixed clock time,
                  no exclusives. The full Index, the methodology note, a CSV and pre-cut charts go to a named shortlist
                  <strong> seven days ahead</strong>. Coverage credits &ldquo;MonoKromatik Cultural-Signal Index, Edition {EDITION.number}&rdquo;
                  and links the edition.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Mail className="text-mono-amber shrink-0 mt-1" size={20} />
                <span>
                  Request the embargoed pack or an interview with the lead analyst:{' '}
                  <a href={`mailto:${PRESS_EMAIL}?subject=Cultural-Signal%20Index%20Edition%20${EDITION.number}%20%E2%80%94%20embargoed%20press%20pack`} className="text-mono-amber-strong font-bold hover:underline">
                    {PRESS_EMAIL}
                  </a>
                  .
                </span>
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray mb-1">ALREADY PUBLIC — CITE IT NOW</p>
              <Link href="/intelligence/signal-index/methodology" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
                <FileText size={18} className="text-mono-amber-strong" /> The methodology <ArrowRight size={15} className="ml-auto" />
              </Link>
              <a href="/api/index?format=csv" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
                <Database size={18} className="text-mono-amber-strong" /> The data (CSV) <ArrowRight size={15} className="ml-auto" />
              </a>
              <Link href="/intelligence/signal-index/edition-01" className="flex items-center gap-3 border border-mono-gray/25 bg-mono-white px-5 py-4 font-display font-bold text-mono-black hover:border-mono-amber transition-colors">
                <ArrowRight size={18} className="text-mono-amber-strong" /> Preview the edition <ArrowRight size={15} className="ml-auto" />
              </Link>
            </div>
          </div>
          <p className="mt-10 text-sm font-body text-mono-gray leading-relaxed max-w-2xl">
            Scores are versioned and re-graded in public. Cite the rubric version ({EDITION.rubric}) and the baseline date
            ({EDITION.baseline}) alongside any figure — a number without its rubric cannot be checked.
          </p>
        </div>
      </section>
    </div>
  );
}
