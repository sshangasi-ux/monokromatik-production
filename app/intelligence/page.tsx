import Link from 'next/link';
import { ArrowRight, BookMarked, Database, FileText, Radar, Search, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import { StatStrip } from '../components/dataviz/Charts';

const researchProducts = [
  {
    title: 'CASE STUDY LIBRARY',
    copy: 'Structured, source-led reads of African and Africa-relevant global campaigns — from objective and creative bet to execution, reception and strategic lesson.',
    icon: BookMarked,
    href: '/intelligence/case-studies',
    action: 'Explore the method',
  },
  {
    title: 'CAMPAIGN INDEX',
    copy: 'Filter the work by brand, market, category, cultural territory, objective, partnership type and diaspora relevance.',
    icon: Database,
    status: 'Structured data build next',
  },
  {
    title: 'MARKET BRIEFINGS',
    copy: 'Country and diaspora-hub intelligence linking consumer context, creative ecosystems, media reality and brand opportunity.',
    icon: Radar,
    status: 'Commissioning slate next',
  },
  {
    title: 'SOURCE DESK',
    copy: 'Curated signal from authoritative global and African marketing, advertising, business, awards and official campaign sources.',
    icon: ShieldCheck,
    href: '/intelligence/source-desk',
    action: 'View source system',
  },
  {
    title: 'REPORTS & SPECIAL ISSUES',
    copy: 'Designed intelligence editions spanning African brand building, sport commerce, creator equity and diaspora demand.',
    icon: FileText,
    href: '/reports',
    action: 'View report slate',
  },
  {
    title: 'ASK MONOKROMATIK',
    copy: 'A future research assistant answering from reviewed Monokromatik records and cited evidence — not unsupported inference.',
    icon: Search,
    status: 'Grounded AI product phase',
  },
];

const sourceGroups = [
  {
    title: 'GLOBAL BRAND & CREATIVE INTELLIGENCE',
    names: 'WARC · LIONS / The Work · Effie · Campaign · The Drum · Adweek · Ad Age · Contagious · Creative Review',
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
            {researchProducts.map(({ title, copy, icon: Icon, href, action, status }) => {
              const body = (
                <>
                  <Icon className="text-mono-amber" size={24} />
                  <div>
                    <h3 className="font-display text-xl font-bold text-mono-black tracking-tight group-hover:text-mono-amber transition-colors">{title}</h3>
                    <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p>
                    {href ? (
                      <p className="mt-7 inline-flex gap-2 items-center text-mono-amber font-display font-bold text-sm">{action?.toUpperCase()} <ArrowRight size={16} /></p>
                    ) : (
                      <p className="mt-7 text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray">{status?.toUpperCase()}</p>
                    )}
                  </div>
                </>
              );

              return href ? (
                <Link key={title} href={href} className="group bg-mono-white p-7 md:p-8 min-h-[305px] flex flex-col justify-between hover:bg-mono-soft-white transition-colors">
                  {body}
                </Link>
              ) : (
                <article key={title} className="group bg-mono-white p-7 md:p-8 min-h-[305px] flex flex-col justify-between">
                  {body}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">SOURCE DESK</p>
            <h2 className="text-4xl font-display font-bold text-mono-black leading-tight">Built from the best available evidence — global and African.</h2>
            <p className="mt-6 text-mono-charcoal text-lg font-body leading-relaxed">The engine will monitor authoritative reporting, official creative materials and market-specific signals, then develop bespoke Monokromatik records and analysis.</p>
            <Link href="/intelligence/source-desk" className="mt-8 inline-flex gap-2 items-center text-mono-amber font-display font-bold">EXPLORE THE SOURCE DESK <ArrowRight size={18} /></Link>
            <div className="mt-10">
              <StatStrip
                tone="light"
                items={[
                  { value: String(sourceGroups.length), label: 'Source categories' },
                  { value: String(researchProducts.length), label: 'Research products' },
                ]}
              />
            </div>
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
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">ASK MONOKROMATIK / EARLY ACCESS</p>
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
            <Link href="/reports" className="inline-flex gap-2 items-center bg-mono-black px-7 py-4 text-mono-white font-display font-bold">VIEW REPORTS <ArrowRight size={18} /></Link>
            <Link href="/intelligence/case-studies" className="inline-flex gap-2 items-center border border-mono-black px-7 py-4 text-mono-black font-display font-bold">CASE STUDIES <ArrowRight size={18} /></Link>
            <Link href="/issues" className="inline-flex gap-2 items-center border border-mono-black px-7 py-4 text-mono-black font-display font-bold">ISSUES <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
