import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import Navigation from '../components/Navigation';
import CommissionForm from './CommissionForm';
import { SERVICES } from '../../lib/commerce';

export const metadata: Metadata = {
  title: 'Work With Us — Commissioned Intelligence | MonoKromatik',
  description:
    'Commission a case study, get your brand’s Cultural-Signal Scorecard, a bespoke market read, or partner/licensing access. The Index, put to work for your brand.',
};

interface PageProps {
  searchParams: Promise<{ interest?: string }>;
}

export default async function WorkWithUsPage({ searchParams }: PageProps) {
  const { interest } = await searchParams;
  const defaultInterest = SERVICES.some((s) => s.id === interest) ? (interest as string) : 'scorecard';

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / WORK WITH US</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Put the Index <span className="text-mono-amber">to work.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The same authorship-weighted lens we apply across the Cultural-Signal Index — commissioned for your brand,
            your campaign, or your market. Evidence-led, credited at the source, distinctly African.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 border-b border-mono-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-8">WHAT WE COMMISSION</p>
          <div className="grid md:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {SERVICES.map((s) => (
              <article key={s.id} className="bg-mono-white p-7 md:p-8">
                <h2 className="text-2xl font-display font-bold text-mono-black leading-tight">{s.title}</h2>
                <p className="mt-4 font-body text-mono-charcoal leading-relaxed">{s.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">START A BRIEF</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">Tell us what to decode.</h2>
              <ul className="mt-7 space-y-3">
                {['Source-led, evidence-first', 'A distinctly African read', 'Delivered to the Index standard'].map((b) => (
                  <li key={b} className="flex items-start gap-3 font-body text-mono-charcoal">
                    <Check size={18} className="text-mono-amber-strong shrink-0 mt-1" aria-hidden="true" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-mono-white border border-mono-gray/25 p-6 md:p-8">
              <CommissionForm defaultInterest={defaultInterest} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
