import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';

const formats = [
  ['Campaign Decoded', 'Evidence-led analysis of meaningful African and Africa-relevant global campaigns.'],
  ['Would It Travel?', 'Testing global creative work against African and diaspora market realities.'],
  ['Brand Moves', 'Fast intelligence on launches, partnerships, talent, sponsorship and investment.'],
  ['Culture to Commerce', 'Understanding how cultural influence becomes commercial value.'],
  ['Diaspora Demand', 'Reading the influence and economic power of African identity across global hubs.'],
  ['Market Lens', 'Country and regional intelligence for brand builders.'],
  ['The CMO Table', 'Direct conversations with leaders making brand decisions.'],
];

export default function SignalPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-6">MONOKROMATIK SIGNAL</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-tight">Brand, Campaign &amp;<br className="hidden md:block" /> Commercial Intelligence.</h1>
          <p className="max-w-2xl mt-8 text-lg md:text-xl text-mono-soft-white font-body">Analysing how brands earn relevance across Africa and its diaspora through culture, sport, entertainment, creators and commerce.</p>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formats.map(([title, copy]) => (
            <div key={title} className="border border-mono-gray/25 p-8 hover:border-mono-amber transition-colors">
              <div className="h-1 w-12 bg-mono-amber mb-7" />
              <h2 className="text-2xl font-display font-bold text-mono-black">{title}</h2>
              <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p>
              <p className="mt-8 text-xs font-display font-bold tracking-wider text-mono-amber">FORMAT IN DEVELOPMENT</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-mono-soft-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-mono-black">Signal editorial standard</h2>
          <p className="mt-5 text-lg text-mono-charcoal font-body">Every substantive Signal case study will distinguish verified facts from interpretation, show its source ledger, identify market and cultural context, and require human approval before publication.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/editorial-standards" className="px-7 py-4 bg-mono-black text-mono-white font-display font-bold inline-flex gap-2 items-center">READ OUR STANDARDS <ArrowRight size={18} /></Link>
            <Link href="/intelligence" className="px-7 py-4 border border-mono-black text-mono-black font-display font-bold">EXPLORE INTELLIGENCE</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
