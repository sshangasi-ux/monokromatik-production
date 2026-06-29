import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Users, Mic, FileBarChart, Utensils } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import CTA from '../components/CTA';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'The Upside — MonoKromatik’s flagship convening',
  description:
    'An intimate gathering of the brands, agencies and investors shaping African and diaspora brand culture — the people the Cultural-Signal Index ranks. Title sponsorship and invitations.',
  alternates: { canonical: `${SITE}/events` },
  openGraph: {
    title: 'The Upside — MonoKromatik’s flagship convening',
    description: 'The room that owns the upside of African culture, in one place.',
    url: `${SITE}/events`,
  },
};

const sponsorTiers = [
  { name: 'Title / Presenting', band: 'from $15,000', icon: Mic, copy: 'Name the room. Stage presence, the attendee list, and co-branding across the convening and its follow-up report.' },
  { name: 'Curated dinner', band: 'from $10,000', icon: Utensils, copy: 'Host an invite-only dinner of vetted decision-makers around a theme you care about.' },
  { name: 'Co-branded report', band: 'from $10,000', icon: FileBarChart, copy: 'A MonoKromatik intelligence report on the summit’s theme, co-branded and distributed to the full audience.' },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">THE UPSIDE · A MONOKROMATIK CONVENING</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Who owns the upside of African culture? <span className="text-mono-amber">Put them in one room.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The brands, agencies, founders and investors the Cultural-Signal Index ranks — convened for an evening of
            sharp, on-the-record and off-the-record conversation about who is building, and capturing, African brand value.
            Inaugural edition in planning. Intimate by design; vetted by invitation.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <CTA href="#invite" variant="amber">REQUEST AN INVITATION</CTA>
            <CTA href="/work-with-us?interest=sponsor" variant="text" className="text-mono-amber hover:text-mono-amber-bright">ANCHOR THE SUMMIT</CTA>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {[
              { icon: Users, v: 'Intimate', l: 'A vetted room, not a conference' },
              { icon: Mic, v: 'On the record', l: 'Operators, not panels of logos' },
              { icon: FileBarChart, v: 'Index-led', l: 'Anchored on real, scored work' },
            ].map((s) => (
              <div key={s.l} className="bg-mono-white p-8 text-center">
                <s.icon className="mx-auto text-mono-amber mb-4" size={26} aria-hidden="true" />
                <p className="text-2xl font-display font-bold text-mono-black">{s.v}</p>
                <p className="mt-2 text-sm font-body text-mono-charcoal">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white border-y border-mono-gray/20 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">SPONSOR THE ROOM</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black max-w-3xl">The highest-value way to reach this audience is to convene it.</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {sponsorTiers.map((t) => (
              <div key={t.name} className="bg-mono-white p-7 flex flex-col">
                <t.icon className="text-mono-amber mb-5" size={24} aria-hidden="true" />
                <h3 className="text-xl font-display font-bold text-mono-black">{t.name}</h3>
                <p className="mt-1 text-sm font-display font-bold text-mono-amber-strong">{t.band}</p>
                <p className="mt-4 font-body text-mono-charcoal leading-relaxed flex-1">{t.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-9">
            <CTA href="/work-with-us?interest=sponsor">ANCHOR THE SUMMIT</CTA>
          </div>
        </div>
      </section>

      <section id="invite" className="py-16 md:py-24 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">REQUEST AN INVITATION</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Be in the room.</h2>
          <p className="mt-5 font-body text-lg text-mono-charcoal">Subscribe to the Weekly Signal to be first to hear when invitations open — and tell us a line about who you are.</p>
          <div className="mt-8 max-w-md mx-auto text-left">
            <NewsletterSignup source="events-page" />
          </div>
          <p className="mt-6 text-sm font-body text-mono-gray">Brands and agencies interested in sponsoring: <Link href="/work-with-us?interest=sponsor" className="text-mono-amber-strong hover:underline">start here</Link>.</p>
        </div>
      </section>
    </div>
  );
}
