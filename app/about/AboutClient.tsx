'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Database, Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';

const pillars = [
  {
    title: 'SIGNAL',
    copy: 'Authored thinking on campaigns, commerce, creative authorship and the brand consequence of African influence.',
    href: '/signal',
  },
  {
    title: 'INTELLIGENCE',
    copy: 'Case studies, reports, source-led records and future research tools for professional decision makers.',
    href: '/intelligence',
  },
  {
    title: 'ISSUES',
    copy: 'Designed editorial editions with the ambition to become collectable digital and physical objects.',
    href: '/issues',
  },
  {
    title: 'CONVERSATIONS',
    copy: 'Candid thinking from the African and diaspora marketers, creators and operators shaping decisions.',
    href: '/conversations',
  },
];

const method = [
  {
    icon: Globe,
    title: 'DISCOVER',
    copy: 'Monitor relevant official brand, agency, creative, business, culture, sport and diaspora sources globally and across African markets.',
  },
  {
    icon: ShieldCheck,
    title: 'VERIFY',
    copy: 'Separate credible evidence, stated results, reception signals and Monokromatik interpretation before intelligence is trusted.',
  },
  {
    icon: Sparkles,
    title: 'INTERPRET',
    copy: 'Apply African context, cultural intelligence, strategic judgment and commercial consequence to what the world is watching.',
  },
  {
    icon: BookOpen,
    title: 'DESIGN',
    copy: 'Publish insight as visually arresting stories, research products and editions that people want to keep and share.',
  },
];

const aiRules = [
  'Claude and OpenAI will operate through a shared orchestration layer, with operational failover and audit trails.',
  'Routine discovery, classification, extraction and recommendation can become highly autonomous.',
  'High-consequence brand claims, premium analysis and uncertain media-rights decisions remain human governed.',
  'The system learns from approved outcomes, reader behaviour, source reliability and model performance — not from unchecked self-publication.',
];

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_365px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber mb-7">ABOUT MONOKROMATIK</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.94]">The Intelligence<br />Behind African<br /><span className="text-mono-amber">Influence.</span></h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">An editorial and intelligence network decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE PROMISE</p>
            <p className="text-2xl font-display font-bold leading-tight">African confidence.<br />Global fluency.<br />Strategic value.<br />Visual impact.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.82fr_1.18fr] gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">WHY WE EXIST</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black leading-tight">African influence is everywhere. The intelligence around it is not.</h2>
          </div>
          <div className="space-y-6 text-lg text-mono-charcoal font-body leading-relaxed">
            <p>African creativity moves through music, sport, design, fashion, film, hospitality, technology and diaspora communities long before many brands know how to value it. Too often the response is surface-level borrowing: a casting choice, a soundtrack, a seasonal nod.</p>
            <p>Monokromatik is built to read the deeper move. What made the work matter? Who authored it? What could brands learn? Where does cultural influence become commercial power, ownership and sustained relevance?</p>
            <p>Our role is not simply to celebrate. It is to see clearly, argue intelligently and produce work strong enough for cultural audiences and executive rooms alike.</p>
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">THE NETWORK</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">A living magazine with an intelligence engine.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {pillars.map((pillar) => (
              <Link key={pillar.title} href={pillar.href} className="bg-mono-white p-7 md:p-8 min-h-[270px] flex flex-col justify-between hover:bg-mono-black hover:text-mono-white group transition-colors">
                <h3 className="font-display font-bold text-2xl text-mono-black group-hover:text-mono-amber">{pillar.title}</h3>
                <div>
                  <p className="font-body text-mono-charcoal group-hover:text-mono-soft-white leading-relaxed">{pillar.copy}</p>
                  <p className="mt-7 inline-flex items-center gap-2 text-mono-amber font-display font-bold">EXPLORE <ArrowRight size={17} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">AI-assisted discovery. Human-directed intelligence.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-white/15 border border-mono-white/15">
            {method.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="bg-mono-black p-7 md:p-8 min-h-[315px] flex flex-col justify-between">
                <Icon className="text-mono-amber" size={25} />
                <div>
                  <h3 className="font-display font-bold text-2xl">{title}</h3>
                  <p className="mt-5 text-mono-soft-white font-body leading-relaxed">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-start">
          <div>
            <Layers className="text-mono-amber mb-7" size={29} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">AUTONOMY WITH ACCOUNTABILITY</p>
            <h2 className="text-4xl font-display font-bold text-mono-black">A self-learning platform that knows where humans still matter.</h2>
          </div>
          <div className="space-y-3">
            {aiRules.map((rule) => (
              <p key={rule} className="border-l-4 border-mono-amber bg-mono-soft-white p-5 text-mono-charcoal font-body text-lg leading-relaxed">{rule}</p>
            ))}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/ai-methodology" className="inline-flex gap-2 items-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold">AI METHODOLOGY <ArrowRight size={18} /></Link>
              <Link href="/editorial-standards" className="inline-flex gap-2 items-center border border-mono-black text-mono-black px-7 py-4 font-display font-bold">EDITORIAL STANDARDS <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Database className="mx-auto text-mono-amber mb-7" size={30} />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">The ambition is an African creative-intelligence institution.</h2>
          <p className="mt-7 text-lg font-body text-mono-charcoal">A publication people read. A research desk brands trust. A set of issues people collect. A platform that turns African influence into usable intelligence without diminishing its cultural truth.</p>
          <Link href="/intelligence" className="mt-10 inline-flex gap-2 items-center bg-mono-amber text-mono-white px-7 py-4 font-display font-bold">ENTER INTELLIGENCE <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
