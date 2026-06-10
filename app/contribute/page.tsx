import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Lightbulb, Mic, PenLine } from 'lucide-react';
import Navigation from '../components/Navigation';

const contributorRoutes = [
  {
    title: 'MAKE AN ARGUMENT',
    format: 'The African Advantage / One Argument',
    copy: 'A clear, authored point of view on African creativity, markets, influence, commerce or the diaspora opportunity.',
    icon: PenLine,
  },
  {
    title: 'UNPACK THE WORK',
    format: 'The Work / After the Pitch',
    copy: 'A marketer, strategist, creative or partner explains the decision, tension and lesson behind a meaningful piece of work.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'ENTER THE CONVERSATION',
    format: 'The Boardroom / The Backroom',
    copy: 'A candid filmed, audio or written discussion with someone shaping brand and cultural outcomes in Africa or the diaspora.',
    icon: Mic,
  },
  {
    title: 'SHARE A SIGNAL',
    format: 'Brand Weather / Source Desk',
    copy: 'Submit relevant work, research, a launch, a partnership or an emerging market shift worth investigating.',
    icon: Lightbulb,
  },
];

const requiredInputs = [
  'The single idea, case or signal being proposed.',
  'Why it matters for African or diaspora brand building now.',
  'Credible evidence, links, creative credits or first-hand knowledge supporting it.',
  'Any commercial involvement, partnership or conflict that should be disclosed.',
  'Media assets available for editorial consideration and their attribution/source context.',
];

const selectionTest = [
  'Is there a sharp argument or useful strategic lesson?',
  'Does African context materially change the read?',
  'Can the evidence be confirmed and credited?',
  'Will a marketer, creator or decision maker leave smarter?',
  'Can the story be expressed with visual and editorial distinction?',
];

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_360px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">CONTRIBUTE / VOICES & SIGNALS</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Bring the insight.<br />Not the <span className="text-mono-amber">press release.</span></h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">A participation gateway for marketers, creators, founders, researchers and cultural operators with something useful to say about African influence and brand value.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber mb-5">EDITORIAL INVITATION</p>
            <p className="text-2xl font-display font-bold leading-tight">An argument. A decision. A lesson. A signal worth investigating.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] text-mono-amber font-display font-bold mb-5">WAYS TO CONTRIBUTE</p>
          <h2 className="max-w-4xl text-4xl md:text-5xl font-display font-bold text-mono-black mb-12">Participation built around substance.</h2>
          <div className="grid md:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {contributorRoutes.map(({ title, format, copy, icon: Icon }) => (
              <article key={title} className="bg-mono-white p-8 md:p-10 min-h-[300px] flex flex-col justify-between">
                <div className="flex justify-between gap-5">
                  <Icon className="text-mono-amber shrink-0" size={25} />
                  <p className="text-[10px] text-mono-amber tracking-[0.23em] text-right font-display font-bold">{format.toUpperCase()}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-mono-black">{title}</h3>
                  <p className="mt-5 font-body text-mono-charcoal leading-relaxed">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">A STRONG PITCH INCLUDES</p>
            <div className="space-y-3">
              {requiredInputs.map((item, index) => (
                <div key={item} className="bg-mono-white p-5 flex gap-5 items-start">
                  <span className="font-display font-bold text-mono-amber">0{index + 1}</span>
                  <p className="font-body text-mono-charcoal">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">OUR SELECTION TEST</p>
            <div className="bg-mono-black text-mono-white p-7 md:p-9 space-y-5">
              {selectionTest.map((test) => (
                <p key={test} className="border-b last:border-b-0 border-mono-white/15 pb-5 last:pb-0 font-display font-bold text-xl leading-snug">{test}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-black text-mono-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">The form and submission workflow come next.</h2>
          <p className="mt-7 text-lg font-body text-mono-soft-white">For now, this gateway defines what Monokromatik is asking the industry to bring to the platform—and what standard the work must meet.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/conversations" className="inline-flex gap-2 items-center bg-mono-amber px-7 py-4 font-display font-bold">SEE CONVERSATIONS <ArrowRight size={18} /></Link>
            <Link href="/signal" className="inline-flex gap-2 items-center border border-mono-white px-7 py-4 font-display font-bold">READ SIGNAL <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
