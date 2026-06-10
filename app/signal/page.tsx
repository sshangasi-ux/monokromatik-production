import Link from 'next/link';
import { ArrowRight, Quote, Users } from 'lucide-react';
import Navigation from '../components/Navigation';

const franchises = [
  {
    title: 'THE WORK',
    label: 'CREATIVE INTELLIGENCE',
    statement: 'Not applause. Analysis.',
    copy: 'A close read of campaigns, collaborations and brand systems involving Africa or its diaspora: the idea, the authorship, the execution and the consequence.',
    examples: ['Campaign anatomy', 'Creative credits', 'Strategic lesson'],
  },
  {
    title: 'WILL IT LAND?',
    label: 'MARKET PROVOCATION',
    statement: 'Strong globally. Meaningful locally?',
    copy: 'A global campaign is tested against African markets and diaspora realities: context, creators, access, price, media, language and reputational risk.',
    examples: ['Lagos', 'Johannesburg', 'London / Paris diaspora'],
  },
  {
    title: 'THE AFRICAN ADVANTAGE',
    label: 'THOUGHT LEADERSHIP',
    statement: 'Africa as advantage, not afterthought.',
    copy: 'Original essays and invited points of view on the creative, commercial and strategic power of African markets, people and cultural systems.',
    examples: ['CMOs', 'Founders', 'Creative leaders'],
  },
  {
    title: 'CULTURE IS BUSINESS',
    label: 'COMMERCE',
    statement: 'Influence is an asset class.',
    copy: 'Where music, sport, fashion, hospitality, travel, events and creators become brand equity, ownership, revenue and scale.',
    examples: ['Sport commerce', 'Creator equity', 'Premium experiences'],
  },
  {
    title: 'THE BOARDROOM / THE BACKROOM',
    label: 'CONVERSATIONS',
    statement: 'The decisions behind the work.',
    copy: 'Candid conversations with the people making calls brands rarely discuss publicly: what worked, what failed and what global HQ missed.',
    examples: ['Marketers', 'Creators', 'Cultural operators'],
  },
  {
    title: 'BRAND WEATHER',
    label: 'WEEKLY SIGNALS',
    statement: 'The moves worth watching.',
    copy: 'A sharp, recurring read of partnerships, launches, investment shifts, cultural signals and work shaping tomorrow’s brand conversation.',
    examples: ['Fast read', 'Newsletter ready', 'Source-led'],
  },
];

const principles = [
  'Cultural intimacy without cliché.',
  'Strategic sharpness without corporate fog.',
  'Commercial consequence in every argument.',
  'African leadership, authorship and confidence at the centre.',
];

export default function SignalPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">MONOKROMATIK SIGNAL</p>
            <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">The ideas.<br />The work.<br /><span className="text-mono-amber">The consequence.</span></h1>
            <p className="max-w-2xl mt-8 text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">Our authored platform for brand builders, creators and strategic voices examining how Africa shapes influence, relevance and growth.</p>
          </div>
          <div className="border-l border-mono-white/20 pl-7 pb-2">
            <Quote className="text-mono-amber mb-6" size={30} />
            <p className="text-2xl font-display font-bold leading-tight">Every story must leave the reader with a better way to see brand growth through Africa.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
            <div>
              <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-4">SIGNATURE FRANCHISES</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold">Formats built to be quoted, shared and contributed to.</h2>
            </div>
            <Link href="/conversations" className="inline-flex gap-2 items-center text-mono-amber font-display font-bold shrink-0">BECOME A VOICE <ArrowRight size={18} /></Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {franchises.map((format, index) => (
              <article key={format.title} className="bg-mono-white p-8 md:p-10 min-h-[365px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber">{format.label}</p>
                    <p className="text-xs font-display font-bold text-mono-gray">0{index + 1}</p>
                  </div>
                  <h3 className="mt-10 text-3xl md:text-4xl font-display font-bold text-mono-black">{format.title}</h3>
                  <p className="mt-4 text-lg font-display font-bold text-mono-amber">{format.statement}</p>
                  <p className="mt-5 font-body text-mono-charcoal leading-relaxed">{format.copy}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-8">
                  {format.examples.map((example) => (
                    <span key={example} className="border border-mono-gray/30 px-3 py-2 text-[10px] tracking-[0.17em] font-display font-bold text-mono-charcoal">{example.toUpperCase()}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber">THE SIGNAL VOICE</p>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-bold">Africa positive.<br />Globally fluent.<br />Commercially serious.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-mono-white/15 border border-mono-white/15">
            {principles.map((principle) => (
              <p key={principle} className="bg-mono-black p-7 text-lg font-display font-bold leading-snug">{principle}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_330px] gap-10 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber">CONTRIBUTING VOICES</p>
            <h2 className="mt-5 text-4xl font-display font-bold text-mono-black">Built with Africa’s leading marketers, creators and strategic thinkers.</h2>
            <p className="mt-6 text-lg text-mono-charcoal font-body leading-relaxed">Signal is designed as a home for authored arguments, informed disagreement and behind-the-work insight — not generic interviews or sponsored celebration.</p>
          </div>
          <Link href="/conversations" className="bg-mono-white border border-mono-gray/25 p-8 hover:border-mono-amber transition-colors">
            <Users className="text-mono-amber" size={25} />
            <p className="mt-7 font-display font-bold text-2xl text-mono-black">The Boardroom / The Backroom</p>
            <p className="mt-4 text-mono-charcoal font-body">See the contributor and conversation proposition.</p>
            <p className="mt-7 inline-flex gap-2 text-mono-amber font-display font-bold">EXPLORE <ArrowRight size={17} /></p>
          </Link>
        </div>
      </section>
    </div>
  );
}
