import Link from 'next/link';
import { ArrowRight, BookMarked, Database, FileText, Radar, Search, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';

const researchProducts = [
  {
    title: 'CASE STUDY LIBRARY',
    copy: 'Structured, source-led reads of African and Africa-relevant global campaigns — from objective and creative bet to execution, reception and strategic lesson.',
    icon: BookMarked,
  },
  {
    title: 'CAMPAIGN INDEX',
    copy: 'Filter the work by brand, market, category, cultural territory, objective, partnership type and diaspora relevance.',
    icon: Database,
  },
  {
    title: 'MARKET BRIEFINGS',
    copy: 'Country and diaspora-hub intelligence linking consumer context, creative ecosystems, media reality and brand opportunity.',
    icon: Radar,
  },
  {
    title: 'SOURCE DESK',
    copy: 'Curated signal from authoritative global and African marketing, advertising, business, awards and official campaign sources.',
    icon: ShieldCheck,
  },
  {
    title: 'REPORTS & SPECIAL ISSUES',
    copy: 'Designed intelligence editions spanning African brand building, sport commerce, creator equity and diaspora demand.',
    icon: FileText,
  },
  {
    title: 'ASK MONOKROMATIK',
    copy: 'A future research assistant answering from reviewed Monokromatik records and cited evidence — not unsupported inference.',
    icon: Search,
  },
];

const sourceGroups = [
  {
    title: 'GLOBAL BRAND & CREATIVE INTELLIGENCE',
    names: 'WARC · Cannes Lions · Effie · Campaign · The Drum · Adweek · Ad Age · Contagious · Creative Review',
  },
  {
    title: 'AFRICAN CREATIVE & BUSINESS CONTEXT',
    names: 'Loeries · MarkLives · Bizcommunity · African Marketing Confederation · African Business · selected local trade platforms',
  },
  {
    title: 'PRIMARY CAMPAIGN EVIDENCE',
    names: 'Official brand newsrooms · agency case studies · campaign films · awards submissions · company reporting · creator and rights-holder channels',
  },
];

const sampleQueries = [
  'Which brands have moved beyond representation into African creative authorship?',
  'Show sport and fashion collaborations with credible diaspora relevance.',
  'Compare cultural-commerce mechanics in Johannesburg, Lagos and London.',
  'What creative work should a global CMO understand before investing in Africa?',
];

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white border-b border-mono-white/15 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_380px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">MONOKROMATIK INTELLIGENCE</p>
            <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Research Africa’s<br /><span className="text-mono-amber">brand future.</span></h1>
            <p className="max-w-2xl mt-8 text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">A source-led intelligence desk transforming global reporting, African creative evidence and original strategic interpretation into usable insight.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber mb-5">RESEARCH PRINCIPLE</p>
            <p className="text-2xl font-display font-bold leading-tight">Source widely.<br />Verify intelligently.<br />Interpret distinctly.<br />Design beautifully.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">THE PRODUCT</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Not an article archive. A working intelligence system.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {researchProducts.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="bg-mono-white p-7 md:p-8 min-h-[275px] flex flex-col justify-between">
                <Icon className="text-mono-amber" size={24} />
                <div>
                  <h3 className="font-display text-xl font-bold text-mono-black tracking-tight">{title}</h3>
                  <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">SOURCE DESK</p>
            <h2 className="text-4xl font-display font-bold text-mono-black leading-tight">Built from the best available evidence — global and African.</h2>
            <p className="mt-6 text-mono-charcoal text-lg font-body leading-relaxed">The engine will monitor authoritative reporting, official creative materials and market-specific signals, then develop bespoke Monokromatik records and analysis.</p>
          </div>
          <div className="space-y-4">
            {sourceGroups.map((group) => (
              <div key={group.title} className="bg-mono-white border-l-4 border-mono-amber p-6">
                <p className="text-[10px] tracking-[0.26em] text-mono-amber font-display font-bold">{group.title}</p>
                <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{group.names}</p>
              </div>
            ))}
            <p className="text-sm text-mono-gray font-body">Publishers and platforms listed here indicate intended intelligence inputs; access, licensing and automated retrieval will be implemented according to source-specific permissions and practical editorial use.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">ASK MONOKROMATIK / PREVIEW</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">The question becomes the interface.</h2>
            <p className="mt-6 text-lg font-body text-mono-soft-white">In time, professionals will interrogate verified cases, reports, market briefs and source-led records directly.</p>
          </div>
          <div className="border border-mono-white/20 p-6 md:p-8">
            {sampleQueries.map((query) => (
              <div key={query} className="mb-4 last:mb-0 bg-mono-white/5 border border-mono-white/15 px-5 py-5 text-mono-soft-white font-body">{query}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">FROM INTELLIGENCE TO ISSUE</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">The strongest insight should deserve a place on your desk.</h2>
          <p className="mt-6 text-lg text-mono-charcoal font-body">Reports and case studies will be designed with the ambition of becoming collectible digital and physical editions.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/issues" className="inline-flex gap-2 items-center bg-mono-black px-7 py-4 text-mono-white font-display font-bold">VIEW ISSUES <ArrowRight size={18} /></Link>
            <Link href="/signal" className="inline-flex gap-2 items-center border border-mono-black px-7 py-4 text-mono-black font-display font-bold">READ SIGNAL <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
