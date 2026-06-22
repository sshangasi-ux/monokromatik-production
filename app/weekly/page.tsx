import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import SponsorSlot from '../components/SponsorSlot';

export const metadata: Metadata = {
  title: 'The Weekly Signal — MonoKromatik',
  description:
    'The week in African influence, read in five minutes. The signals worth watching, the work worth knowing, and the brands moving on the Cultural-Signal Index — every week.',
};

const inside = [
  'Brand Weather — the four signals shaping African influence this week',
  'The Work — one campaign or cultural move, decoded',
  'Will It Land? — a quick verdict on a global play in African reality',
  'Index movers — who climbed or slipped on the Cultural-Signal Index',
];

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

      <section className="py-16 md:py-24">
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
