import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Mail, Play, Newspaper, LineChart, Layers } from 'lucide-react';
import Navigation from '../components/Navigation';
import { CONTACT_EMAIL } from '../../lib/commerce';

const URL = 'https://www.monokromatik.com/sponsor';

export const metadata: Metadata = {
  title: 'Sponsor MonoKromatik — Reach African Brand Decision-Makers',
  description:
    'Native, clearly-disclosed sponsorship across MonoKromatik: the Watch explainers, the Who’s Buying Africa ownership tracker, the Ownership Ledger and The Weekly Signal. An engaged African & diaspora brand-and-culture audience.',
  keywords: ['sponsor African media', 'African brand advertising', 'Afrobeats audience sponsorship', 'African newsletter sponsorship', 'brand intelligence sponsorship'],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Sponsor MonoKromatik',
    description: 'Put your brand in front of African brand-and-culture decision-makers — native, disclosed, and on-thesis.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

interface Slot {
  id: string;
  name: string;
  icon: 'video' | 'tracker' | 'ledger' | 'weekly';
  priceFrom: string;
  blurb: string;
  includes: string[];
}

const SLOTS: Slot[] = [
  {
    id: 'watch',
    name: 'The Watch Explainers',
    icon: 'video',
    priceFrom: 'from $750 / explainer',
    blurb: 'A "presented by" on our sourced, Braam-voiced video explainers — on YouTube and embedded on the research article.',
    includes: [
      'Named presenting credit in-video + description',
      'Placement on the article the video is tied to',
      'A cut that carries across YouTube + the site',
    ],
  },
  {
    id: 'tracker',
    name: "Who's Buying Africa Tracker",
    icon: 'tracker',
    priceFrom: 'from $1,500 / quarter',
    blurb: 'Power the continent’s ownership tracker — an evergreen, high-intent surface for anyone asking "who owns African brands?"',
    includes: [
      '"Ownership intelligence, powered by…" placement',
      'Presence on an evergreen, search-driven page',
      'Association with the value-capture franchise',
    ],
  },
  {
    id: 'ledger',
    name: 'The Ownership Ledger',
    icon: 'ledger',
    priceFrom: 'from $600 / month',
    blurb: 'The recurring franchise inside The Weekly Signal — every deal that moved ownership of an African brand, with its verdict.',
    includes: [
      'Native sponsor of the monthly Ledger segment',
      'Reaches the newsletter’s engaged subscriber base',
      'A standing, ownable association',
    ],
  },
  {
    id: 'weekly',
    name: 'The Weekly Signal',
    icon: 'weekly',
    priceFrom: 'from $500 / issue',
    blurb: 'A clearly-disclosed slot in the weekly dispatch — the signals, the work, and the brands moving on the Index.',
    includes: [
      'A native, disclosed placement in the issue',
      'First-person, forward-to-a-colleague format',
      'Brand-and-culture decision-maker readership',
    ],
  },
];

const ICON = { video: Play, tracker: LineChart, ledger: Layers, weekly: Newspaper };

const AUDIENCE = [
  'Brand, marketing and culture strategists across Africa & the diaspora',
  'Agency and comms leaders briefing on African brands',
  'Investors, operators and corporate teams tracking the field',
  'A South Africa / US / UK / Nigeria readership, reached by research — not clickbait',
];

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">PARTNER · SPONSORSHIP</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98] max-w-3xl">
            Put your brand next to the intelligence.
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            Native, clearly-disclosed sponsorship across MonoKromatik — the Watch explainers, the ownership
            tracker, the Ownership Ledger and The Weekly Signal. An engaged African &amp; diaspora
            brand-and-culture audience, reached through authored research.
          </p>
          <div className="mt-8">
            <Link href="/work-with-us?interest=sponsor" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              REQUEST THE RATE CARD <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-14 md:py-18 bg-mono-soft-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE ROOM YOU'RE REACHING</p>
          <ul className="grid md:grid-cols-2 gap-4 max-w-3xl">
            {AUDIENCE.map((a) => (
              <li key={a} className="flex items-start gap-3 font-body text-mono-charcoal">
                <Check size={20} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {a}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] font-body text-mono-gray">A focused, high-intent audience — not a mass feed. You reach the people who decide, not the people who scroll.</p>
        </div>
      </section>

      {/* Inventory / rate card */}
      <section className="py-14 md:py-20 bg-mono-white border-t border-mono-gray/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black mb-8">The inventory</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {SLOTS.map((slot) => {
              const Icon = ICON[slot.icon];
              return (
                <div key={slot.id} className="border border-mono-gray/25 p-7 flex flex-col h-full bg-mono-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={22} className="text-mono-amber-strong" aria-hidden="true" />
                    <h3 className="text-xl font-display font-bold text-mono-black">{slot.name}</h3>
                  </div>
                  <p className="text-mono-amber-strong font-display font-bold text-sm">{slot.priceFrom}</p>
                  <p className="mt-3 font-body text-mono-charcoal text-sm leading-relaxed">{slot.blurb}</p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {slot.includes.map((i) => (
                      <li key={i} className="flex items-start gap-3 font-body text-mono-charcoal text-sm">
                        <Check size={16} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-[12px] font-body text-mono-gray">
            Indicative rates; bundles and season-long packages quoted. All sponsorship is clearly disclosed and editorially independent — sponsors never shape the intelligence.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold">Let&rsquo;s build a package.</h2>
          <p className="mt-4 font-body text-mono-soft-white">Tell us the audience you want and the moment you want to own — we&rsquo;ll come back with a rate card and a plan.</p>
          <div className="mt-7 flex flex-wrap gap-4 justify-center">
            <Link href="/work-with-us?interest=sponsor" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              REQUEST THE RATE CARD <ArrowRight size={18} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Sponsorship%20enquiry`} className="inline-flex items-center gap-2 border border-mono-white/30 text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-white hover:text-mono-black transition-colors">
              <Mail size={16} /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
