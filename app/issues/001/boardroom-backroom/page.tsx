import Link from 'next/link';
import { ArrowRight, Mic, Quote, Users } from 'lucide-react';
import Navigation from '../../../components/Navigation';

const voiceProfiles = [
  {
    role: 'BRAND LEADER',
    brief: 'A senior African or diaspora-facing marketer able to speak to where global strategy misreads local relevance, investment and brand consequence.',
  },
  {
    role: 'CREATIVE STRATEGIST',
    brief: 'A strategist or agency leader who can unpack authorship, cultural truth and the compromises that shape meaningful work.',
  },
  {
    role: 'CREATOR / CULTURAL OPERATOR',
    brief: 'A voice close to the community or cultural system, able to speak to ownership, access and what credible brand participation looks like.',
  },
];

const discussionChapters = [
  ['01 / THE MISREAD', 'What is the most persistent mistake global brands make when attempting relevance across African audiences?'],
  ['02 / THE DECISION', 'What brand or creative decision changed an outcome because it took local context seriously?'],
  ['03 / THE VALUE', 'Where is African influence creating economic value that brand measurement still fails to recognise?'],
  ['04 / THE COMPROMISE', 'What does the industry routinely approve that it should be brave enough to reject?'],
  ['05 / THE FUTURE', 'What should an ambitious Africa-facing brand be investing in now, before everyone sees the opportunity?'],
];

const productionOutputs = [
  'One edited long-form conversation feature',
  'One 3–5 minute filmed or audio-led editorial cut',
  'Five approved pull quotes for Signal and social distribution',
  'One Intelligence note capturing strategic themes and evidence prompts',
  'One Issue 001 portrait or designed contributor spread',
];

export default function BoardroomBackroomCommissionPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/issues/001" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber transition-colors mb-12">
            ← ISSUE 001
          </Link>
          <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber mb-7">THE BOARDROOM / THE BACKROOM / COMMISSION 001</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.94]">What Global Brands Still Get Wrong About <span className="text-mono-amber">African Relevance.</span></h1>
          <p className="max-w-3xl mt-8 text-xl md:text-2xl text-mono-soft-white font-body leading-relaxed">A founding conversation brief for voices close enough to the decisions, the culture and the value chain to say what generic brand panels avoid.</p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">COMMISSION OPEN</span>
            <span>CONTRIBUTOR APPROVAL REQUIRED</span>
            <span>ISSUE 001</span>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.82fr_1.18fr] gap-12 items-start">
          <div className="lg:sticky lg:top-28">
            <Quote className="text-mono-amber mb-7" size={29} />
            <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber mb-5">WHY THIS CONVERSATION</p>
            <h2 className="text-4xl font-display font-bold text-mono-black leading-tight">The case study cannot always tell you what nearly failed.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal leading-relaxed">This franchise is built for candour: the internal tension, the investment decision, the cultural compromise, the opportunity still being mispriced and the lesson another leader can actually use.</p>
          </div>
          <div className="space-y-3">
            {discussionChapters.map(([chapter, question]) => (
              <article key={chapter} className="bg-mono-soft-white border-l-4 border-mono-amber p-6 md:p-7">
                <p className="text-[10px] tracking-[0.27em] font-display font-bold text-mono-amber">{chapter}</p>
                <p className="mt-5 text-xl md:text-2xl font-display font-bold text-mono-black leading-snug">{question}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <Users className="text-mono-amber mb-7" size={27} />
            <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber mb-5">FOUNDING VOICES REQUIRED</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Three perspectives. One useful argument.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-px border border-mono-white/15 bg-mono-white/15">
            {voiceProfiles.map((profile) => (
              <article key={profile.role} className="bg-mono-black p-8 min-h-[280px] flex flex-col justify-between">
                <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber">{profile.role}</p>
                <p className="font-body text-mono-soft-white leading-relaxed">{profile.brief}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.82fr_1.18fr] gap-12">
          <div>
            <Mic className="text-mono-amber mb-7" size={27} />
            <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber mb-5">PRODUCTION PACKAGE</p>
            <h2 className="text-4xl font-display font-bold text-mono-black">What the first conversation becomes.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal">No quotation or contributor representation will be published until the participant has been confirmed and their quoted contributions approved.</p>
          </div>
          <div className="space-y-3">
            {productionOutputs.map((output, index) => (
              <p key={output} className="bg-mono-white p-5 flex gap-5 items-start font-body text-mono-charcoal"><span className="font-display font-bold text-mono-amber">0{index + 1}</span>{output}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-black text-mono-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber mb-5">NEXT ACTION</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold">Secure the founding voices.</h2>
          <p className="mt-7 text-lg text-mono-soft-white font-body">This page is publication-ready as a commission brief. The actual feature will be built once selected contributors accept, are recorded and approve their quoted material.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contribute" className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold">CONTRIBUTE A VOICE <ArrowRight size={18} /></Link>
            <Link href="/issues/001" className="inline-flex items-center gap-2 border border-mono-white px-7 py-4 font-display font-bold">RETURN TO ISSUE 001 <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
