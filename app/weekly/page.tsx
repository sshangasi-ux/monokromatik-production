import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import SponsorSlot from '../components/SponsorSlot';
import WeeklyDispatchSample from '../components/WeeklyDispatchSample';
import { getAcquisitions, VERDICT_LABEL, type Verdict } from '../../lib/acquisitions';

export const metadata: Metadata = {
  title: 'The Weekly Signal — MonoKromatik',
  description:
    'The week in African influence, read in five minutes. The signals worth watching, the work worth knowing, and the brands moving on the Cultural-Signal Index — every week.',
};

const inside = [
  'Brand Weather — the four signals shaping African influence this week',
  'The Work — one campaign or cultural move, decoded',
  'Will It Land? — a quick verdict on a global play in African reality',
  'The Ownership Ledger — every deal that moved ownership of an African brand, with its value-capture verdict',
  'Index movers — who climbed or slipped on the Cultural-Signal Index',
];

const VERDICT_TAG: Record<Verdict, string> = {
  exported: 'border-mono-amber/60 text-mono-amber-strong bg-mono-amber/10',
  retained: 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10',
  mixed: 'border-mono-gray/40 text-mono-charcoal bg-mono-gray/10',
};

function fmtLedgerDate(d: string): string {
  const [y, m] = d.split('-');
  if (!m) return y;
  const mon = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m)] || '';
  return `${mon} ${y}`;
}

export default function WeeklyPage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">THE WEEKLY SIGNAL</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">The week in African influence — <span className="text-mono-amber">in five minutes.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The signals worth watching, the work worth knowing, and the brands moving on the Cultural-Signal Index.
            Authored, attributable, and built to be forwarded.
          </p>
          <div className="mt-8">
            <SponsorSlot placement="weekly" offer tone="dark" />
          </div>
        </div>
      </section>

      {/* Live sample — this week's actual dispatch, so visitors see exactly what they get. */}
      <section className="py-16 md:py-20 bg-mono-soft-white border-b border-mono-gray/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-3">THIS WEEK&rsquo;S DISPATCH</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">See it before you subscribe.</h2>
            </div>
          </div>
          <WeeklyDispatchSample />
          <p className="mt-5 text-[12px] font-body text-mono-gray">A live sample, assembled from this week&rsquo;s actual coverage — what lands in your inbox, every week.</p>
        </div>
      </section>

      <section id="subscribe" className="py-16 md:py-24 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">INSIDE EACH ISSUE</p>
              <ul className="space-y-4">
                {inside.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-mono-charcoal">
                    <Check size={20} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-mono-white border border-mono-gray/25 p-6 md:p-8">
              <p className="flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-amber-strong mb-5"><Mail size={15} /> SUBSCRIBE FREE</p>
              <NewsletterSignup source="weekly-page" />
              <p className="mt-4 text-[12px] font-body text-mono-gray">Free, weekly, unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Ownership Ledger — a recurring franchise, drawn live from the tracker. */}
      <section className="py-16 md:py-20 bg-mono-soft-white border-y border-mono-gray/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-3">A WEEKLY FRANCHISE</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">The Ownership Ledger</h2>
          <p className="mt-4 font-body text-mono-charcoal leading-relaxed">
            Every deal that moves ownership of an African brand — with the one thing the deal-count reports leave
            out: a verdict on whether the value stays on the continent or gets exported. Subscribers get it every
            month. Here are the latest entries.
          </p>

          <ul className="mt-8 divide-y divide-mono-gray/20 border-y border-mono-gray/20">
            {getAcquisitions().slice(0, 5).map((d) => (
              <li key={d.id} className="py-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[11px] tracking-[0.12em] font-display font-bold text-mono-gray uppercase w-16 shrink-0">
                  {fmtLedgerDate(d.date)}
                </span>
                <span className="font-body text-mono-black flex-1 min-w-[12rem]">
                  <span className="font-bold">{d.target}</span>
                  <span className="text-mono-gray"> → </span>
                  {d.acquirer}
                  <span className="text-mono-gray text-sm"> ({d.acquirerParent})</span>
                </span>
                <span className={`text-[10px] tracking-[0.08em] font-display font-bold uppercase px-2.5 py-1 border ${VERDICT_TAG[d.verdict]}`}>
                  {VERDICT_LABEL[d.verdict]}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/whos-buying-africa" className="inline-flex items-center gap-1 text-mono-black font-display font-bold text-sm hover:text-mono-amber-strong transition-colors">
              See the full tracker <ArrowRight size={14} />
            </Link>
            <Link href="/reports/value-capture-scorecard-2026" className="inline-flex items-center gap-1 text-mono-amber-strong font-display font-bold text-sm hover:text-mono-amber-hover transition-colors">
              The Value-Capture Scorecard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-3">REACH THE ROOM</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold max-w-2xl">Put your brand in front of African brand-and-culture decision-makers.</h2>
          </div>
          <Link href="/work-with-us?interest=sponsor" className="shrink-0 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber-hover transition-colors">
            SPONSOR THE WEEKLY <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
