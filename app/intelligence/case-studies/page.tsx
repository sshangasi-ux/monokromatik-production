import Link from 'next/link';
import { ArrowRight, BarChart3, Compass, Filter, Layers3, SearchCheck, Trophy } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { StatStrip } from '../../components/dataviz/Charts';
import { getAllCaseStudies } from '../../../lib/case-studies';
import { membershipsLive } from '../../../lib/commerce';
import CaseStudyLibrary from './CaseStudyLibrary';
import type { Metadata } from 'next';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Intelligence Case Studies | MonoKromatik',
  description:
    'Six-dimension decodes of African and diaspora brand work — context, strategic bet, creative move, evidence, the African read and the lesson. The library behind the Cultural-Signal Index.',
  alternates: { canonical: `${SITE}/intelligence/case-studies` },
  openGraph: {
    title: 'Intelligence Case Studies | MonoKromatik',
    description: 'Six-dimension decodes of African and diaspora brand work — the library behind the Cultural-Signal Index.',
    url: `${SITE}/intelligence/case-studies`,
    images: [`${SITE}/opengraph-image`],
  },
};

const caseStructure = [
  ['THE CONTEXT', 'Market, audience, cultural territory and the tension the work needed to address.'],
  ['THE STRATEGIC BET', 'What the brand believed, changed or risked to earn relevance.'],
  ['THE CREATIVE MOVE', 'Idea, execution, creators, channels, partnership mechanics and authorship.'],
  ['THE EVIDENCE', 'Sources, stated outcomes, reception signals and any limits in what can be claimed.'],
  ['THE AFRICAN READ', 'Why the work matters in African or diaspora context, beyond surface representation.'],
  ['THE LESSON', 'What decision makers should learn, repeat, question or avoid.'],
];

const firstCollections = [
  {
    title: 'African Authorship in Global Work',
    status: 'Commissioning',
    scope: 'Cases where African creative leadership shapes the idea, execution or ownership model — not only the imagery.',
    filters: ['Authorship', 'Global Brands', 'Creators'],
  },
  {
    title: 'Sport, Culture & Brand Belonging',
    status: 'Commissioning',
    scope: 'Sponsorship and collaboration work that converts fandom, identity and community into credible brand meaning.',
    filters: ['Sport', 'Partnerships', 'Community'],
  },
  {
    title: 'Diaspora Demand',
    status: 'Research Build',
    scope: 'Work that recognises African identity moving across London, Paris, Toronto, New York and the continent itself.',
    filters: ['Diaspora', 'Premium', 'Identity'],
  },
  {
    title: 'Will It Land? Global Work Under Test',
    status: 'Editorial Development',
    scope: 'Provocative reads of globally celebrated work against African market realities, media systems and consumer truth.',
    filters: ['Relevance', 'Markets', 'Provocation'],
  },
];

const futureFilters = ['Brand', 'Market', 'Category', 'Objective', 'Cultural Territory', 'Creator', 'Channel', 'Evidence Level'];

export default function CaseStudiesPage() {
  // Show the whole library — premium decodes appear with a members lock (the
  // rating is public, the full decode is gated on the case-study page). This
  // makes the paid tier discoverable and turns the library into a funnel.
  const studies = getAllCaseStudies();
  const gated = membershipsLive();
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_350px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / CASE STUDIES</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Read the work.<br />Understand the <span className="text-mono-amber">decision.</span></h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">A structured library of campaign and brand moves interpreted through African relevance, creative authorship and commercial consequence.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <SearchCheck className="text-mono-amber mb-6" size={28} />
            <p className="text-2xl font-display font-bold leading-tight">Every case needs evidence, context and a point of view.</p>
          </div>
        </div>
      </section>

      {studies.length > 0 && (
        <section className="py-20 md:py-24 bg-mono-white border-b border-mono-gray/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">IN THE LIBRARY</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Published case studies.</h2>
              </div>
              <p className="font-body text-mono-charcoal max-w-sm">Each one decoded across the six dimensions, evidence-led and credited at the source.</p>
            </div>
            <CaseStudyLibrary studies={studies} gated={gated} />
          </div>
        </section>
      )}

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE CASE METHOD</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Analysis designed for usefulness, not merely inspiration.</h2>
          </div>
          <div className="mb-10">
            <StatStrip
              tone="light"
              items={[
                { value: String(studies.length), label: studies.length === 1 ? 'Published case' : 'Published cases' },
                { value: String(caseStructure.length), label: 'Read dimensions' },
                { value: String(firstCollections.length), label: 'Collections' },
              ]}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {caseStructure.map(([title, copy], index) => (
              <article key={title} className="bg-mono-white p-7 md:p-8 min-h-[235px]">
                <p className="text-xs text-mono-amber font-display font-bold">0{index + 1}</p>
                <h3 className="mt-7 text-xl font-display font-bold text-mono-black">{title}</h3>
                <p className="mt-4 font-body text-mono-charcoal leading-relaxed">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-12">
            <div>
              <Compass className="text-mono-amber mb-7" size={28} />
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">FIRST COLLECTIONS</p>
              <h2 className="text-4xl font-display font-bold text-mono-black">The initial case-study shelves.</h2>
              <p className="mt-6 text-lg font-body text-mono-charcoal">The first true value unlock is commissioning and populating these collections with real, beautifully presented records.</p>
            </div>
            <div className="space-y-4">
              {firstCollections.map((collection) => (
                <article key={collection.title} className="bg-mono-white p-6 md:p-7 border border-mono-gray/20 hover:border-mono-amber transition-colors">
                  <div className="flex flex-wrap gap-4 justify-between items-start">
                    <h3 className="font-display font-bold text-2xl text-mono-black">{collection.title}</h3>
                    <span className="text-[10px] tracking-[0.22em] px-3 py-2 bg-mono-black text-mono-white font-display font-bold">{collection.status.toUpperCase()}</span>
                  </div>
                  <p className="mt-4 font-body text-mono-charcoal leading-relaxed">{collection.scope}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {collection.filters.map((filter) => <span key={filter} className="text-[10px] border border-mono-gray/30 px-3 py-2 font-display font-bold tracking-[0.16em]">{filter.toUpperCase()}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-center">
          <div>
            <Filter className="text-mono-amber mb-7" size={27} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">THE INDEX</p>
            <h2 className="text-4xl font-display font-bold">A library built to be searched.</h2>
            <p className="mt-6 text-mono-soft-white font-body text-lg">The library above is already interrogable — filter by collection and confidence, or search by brand, market and tag. These are the axes the index will deepen as the catalogue grows.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {futureFilters.map((filter) => <div key={filter} className="border border-mono-white/20 p-5 font-display font-bold tracking-[0.14em] text-sm flex items-center gap-3"><BarChart3 size={16} className="text-mono-amber" />{filter.toUpperCase()}</div>)}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/intelligence/signal-index" className="inline-flex gap-2 items-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold"><Trophy size={17} /> THE CULTURAL-SIGNAL INDEX</Link>
          <Link href="/intelligence/source-desk" className="inline-flex gap-2 items-center border border-mono-black text-mono-black px-7 py-4 font-display font-bold"><Layers3 size={17} /> SOURCE DESK</Link>
          <Link href="/reports" className="inline-flex gap-2 items-center border border-mono-black text-mono-black px-7 py-4 font-display font-bold">REPORTS <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
