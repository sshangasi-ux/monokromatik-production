import type { Metadata } from 'next';
import { Database, Radar, PenLine, Calendar, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import CTA from '../components/CTA';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Partner with MonoKromatik — Licensing, Sponsorship & Intelligence',
  description:
    'Reach the room that decides African brand culture. License the Cultural-Signal Index, sponsor a surface, commission intelligence, or anchor the flagship summit — credibility-first, brand-safe.',
  alternates: { canonical: `${SITE}/partner` },
  openGraph: {
    title: 'Partner with MonoKromatik',
    description: 'License the Index, sponsor a surface, commission intelligence, or anchor the summit.',
    url: `${SITE}/partner`,
  },
};

const ways = [
  {
    icon: Database,
    kicker: 'LICENSE THE DATA',
    title: 'The Cultural-Signal Index, as a product',
    body: 'The free public feed is the on-ramp. License the deeper cuts — a single league table, the full dataset with movement history, or the enterprise API and dashboard.',
    band: '$900 – $15,000+',
    href: '/intelligence/license',
    cta: 'See the licensing tiers',
  },
  {
    icon: Radar,
    kicker: 'SPONSOR A SURFACE',
    title: 'Own a room of decision-makers',
    body: 'Single-sponsor presence on The Wire, the Weekly Signal, a signature desk (Spirits, Culture) or an Issue — clearly disclosed, never near an Index score. A small, high-value, brand-safe audience.',
    band: 'Scoped per placement',
    href: '/work-with-us?interest=sponsor',
    cta: 'Request the media kit',
  },
  {
    icon: PenLine,
    kicker: 'COMMISSION INTELLIGENCE',
    title: 'Put the Index to work for you',
    body: 'A Brand Signal Scorecard on your work (or a rival’s), a six-dimension case-study decode, or a bespoke market read across Africa and the diaspora.',
    band: 'from $900',
    href: '/work-with-us?interest=scorecard',
    cta: 'Commission a decode',
  },
  {
    icon: Calendar,
    kicker: 'ANCHOR THE SUMMIT',
    title: 'The Upside — the flagship convening',
    body: 'An intimate gathering of the brands, agencies and investors the Index ranks. Title sponsorship, a curated dinner, or a co-branded intelligence report.',
    band: 'from $15,000',
    href: '/events',
    cta: 'See the event',
  },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">PARTNER WITH MONOKROMATIK</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Reach the room that decides <span className="text-mono-amber">African brand culture.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            MonoKromatik is read by the people who shape African and diaspora brand decisions — marketers, agencies,
            brand teams, investors and press. We don’t sell scale; we sell a defined, high-value, brand-safe room and the
            one proprietary asset no one else has: the Cultural-Signal Index.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <CTA href="/work-with-us?interest=partner" variant="amber">REQUEST THE MEDIA KIT</CTA>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-10">WAYS TO PARTNER</p>
          <div className="grid md:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {ways.map((w) => (
              <div key={w.title} className="bg-mono-white p-7 md:p-9 flex flex-col">
                <w.icon className="text-mono-amber mb-5" size={26} aria-hidden="true" />
                <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber-strong mb-3">{w.kicker}</p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black leading-tight">{w.title}</h2>
                <p className="mt-4 font-body text-mono-charcoal leading-relaxed flex-1">{w.body}</p>
                <div className="mt-6 flex items-center justify-between gap-4 pt-5 border-t border-mono-gray/20">
                  <span className="text-sm font-display font-bold text-mono-black">{w.band}</span>
                  <CTA href={w.href} variant="text">{w.cta}</CTA>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The firewall — sold as a feature, because it's the moat. */}
      <section className="bg-mono-soft-white border-y border-mono-gray/20 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ShieldCheck className="text-mono-amber mb-5" size={28} aria-hidden="true" />
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE PRINCIPLE</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black max-w-3xl">Credibility is the product. The firewall protects your money, not just ours.</h2>
          <p className="mt-6 max-w-2xl font-body text-lg text-mono-charcoal leading-relaxed">
            Every commercial placement is clearly disclosed. Branded work is produced separately and never carries an
            editorial byline. No sponsor influences coverage, and no sponsor ever sits near an Index score. The reason the
            room is worth reaching is that it trusts what it reads here — and we protect that on your behalf.
          </p>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">START THE CONVERSATION</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold max-w-2xl">Tell us the audience you want. We’ll scope the right way in.</h2>
          </div>
          <CTA href="/work-with-us?interest=partner" variant="amber" className="shrink-0">REQUEST THE MEDIA KIT</CTA>
        </div>
      </section>
    </div>
  );
}
