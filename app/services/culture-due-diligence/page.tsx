import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Navigation from '../../components/Navigation';

export const metadata: Metadata = {
  title: 'Culture Due Diligence — MonoKromatik',
  description:
    'The value-capture, authorship and reputational read on a culture-driven asset — the diligence no bank or Big-Four provides. MonoKromatik’s flagship advisory service for PE, VC, corporate development and sovereign capital buying into African brands, culture, sport, music and fintech.',
};

const QUESTIONS = [
  'Is the value real — and who actually authored it? Culture, talent and audience, or a licence on top of someone else’s work?',
  'Who owns the certification apparatus that prices the value — the IP, the rights, the platform, the direct-to-fan channel — and does the target?',
  'Is the asset Retained, Exported, Hollowed or Contested — and where does the money actually land today?',
  'What is the reputational, cultural and integrity risk a financial model never surfaces?',
  'What is the value-capture upside after the deal — and how should ownership be structured to keep it?',
];

const DELIVERABLES = [
  { k: 'Value-capture diligence', v: 'The target and its category read layer by layer through our Authorship → Ownership → Capture framework.' },
  { k: 'The authorship & ownership map', v: 'What is genuinely owned, what is only licensed, and what is Hollowed — a local shell over a value chain owned elsewhere.' },
  { k: 'Reputational & integrity read', v: 'The cultural, reputational and integrity risks that sit outside a data room and decide whether the asset holds its meaning.' },
  { k: 'Post-deal retention plan', v: 'A value-creation plan to move the asset up the ladder — capturing more of what it authors, on structures that keep the upside home.' },
];

const ARCHETYPES = [
  { a: 'RETAINED', d: 'Authored, owned and captured at home. Protect and compound.', hot: false },
  { a: 'EXPORTED', d: 'Authored here; owned and banked elsewhere. Reversible with structure.', hot: true },
  { a: 'HOLLOWED', d: 'Owned in name, hollowed in economics. The dangerous state.', hot: true },
  { a: 'CONTESTED', d: 'Ownership genuinely in play. The moment to decide.', hot: false },
];

const PROOF = [
  { t: 'Who’s Buying African Sport? — The Intelligence Report', s: 'AOC framework, a bottom-up value-leakage model, a named deal ledger and scenarios to 2035.', href: '/reports/whos-buying-african-sport-2026' },
  { t: 'The Springbok — World Champion, Under-Owned', s: 'A brand study of world-beating strength and mid-table value — a certification-gap read.', href: '/reports/brand-study-the-springbok-world-champion-under-owned' },
];

export default function CultureDueDiligencePage() {
  const enquire = '/work-with-us?interest=culture-dd';
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-6">
            INTELLIGENCE SERVICES · FLAGSHIP ADVISORY
          </p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            You can buy the brand. <span className="text-mono-amber">Did you buy the value?</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            Culture Due Diligence — the value-capture, authorship and reputational read on a culture-driven
            asset. The diligence no bank or Big-Four provides.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href={enquire} className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-8 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              START A CONVERSATION <ArrowRight size={18} />
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 border border-mono-white/30 text-mono-white px-6 py-4 font-display font-bold hover:bg-mono-white hover:text-mono-black transition-colors">
              ALL SERVICES
            </Link>
          </div>
        </div>
      </section>

      {/* Problem panel */}
      <section className="bg-mono-soft-white py-14 md:py-20 border-b border-mono-gray/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-feature text-2xl md:text-3xl text-mono-black leading-snug">
            <span className="text-mono-amber-strong italic">A brand can be world-famous in culture and hollow on the balance sheet.</span>{' '}
            When capital buys into an African brand, league, catalogue or fintech, standard diligence —
            financial, legal, commercial — prices the numbers and misses the engine underneath them: who
            authored the value, who owns the apparatus that prices it, and whether the asset actually keeps
            what it creates.
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-3">01</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.03] text-balance">
            The questions we answer for the deal.
          </h2>
          <ul className="mt-10">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-4 py-5 border-t border-mono-gray/20 first:border-t-0">
                <span className="font-display font-bold text-[13px] tracking-[0.08em] text-mono-amber-strong pt-1">{`Q${i + 1}`}</span>
                <span className="font-body text-lg text-mono-charcoal leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16 md:py-20 bg-mono-soft-white border-y border-mono-gray/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-3">02</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.03] text-balance">
            What you receive.
          </h2>
          <div className="mt-10 grid md:grid-cols-2 gap-px bg-mono-gray/20 border border-mono-gray/20">
            {DELIVERABLES.map((d) => (
              <div key={d.k} className="bg-mono-white p-6 md:p-7">
                <p className="text-[10px] tracking-[0.14em] font-display font-bold text-mono-amber-strong uppercase">{d.k}</p>
                <p className="mt-3 font-body text-[15px] text-mono-charcoal leading-relaxed">{d.v}</p>
              </div>
            ))}
            <div className="bg-mono-white p-6 md:p-7 md:col-span-2">
              <p className="font-body text-[15px] text-mono-gray leading-relaxed">
                Delivered end-to-end or at selected points in your process, and paired with a corporate-finance
                and legal partner for the financial and legal diligence — a 360° read, one engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-3">03</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.03] text-balance">
            The verdict, in four states.
          </h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {ARCHETYPES.map((x) => (
              <div key={x.a} className="border border-mono-gray/25 bg-mono-white p-5">
                <p className={`font-display font-bold text-[15px] tracking-[0.06em] ${x.hot ? 'text-mono-amber-strong' : 'text-mono-black'}`}>{x.a}</p>
                <p className="mt-2 font-body text-[13px] text-mono-charcoal leading-snug">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why + proof */}
      <section className="py-16 md:py-24 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-3">04</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold leading-[1.03] text-balance">Why MonoKromatik.</h2>
          <div className="mt-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14">
            <div className="space-y-5">
              <p className="font-body text-lg text-mono-soft-white leading-relaxed">
                <span className="font-semibold text-mono-white">No pure consultancy reads culture as an ownable asset. No culture shop has the sourced-data rigour. We hold both</span> — and it is the moat.
              </p>
              <p className="font-body text-[15px] text-mono-soft-white leading-relaxed">
                The read runs on a proprietary engine already built and published: the Cultural-Signal Index,
                the Who’s Buying Africa tracker, and the Authorship → Ownership → Capture framework. And it is
                category-agnostic — the same diligence works across sport, music and catalogues, spirits and
                luxury, beauty, retail, fashion and fintech.
              </p>
              <p className="font-body text-[15px] text-mono-soft-white leading-relaxed">
                The result reads as the output of an intelligence process, not an opinion: every claim sourced,
                the framework declared, and a counter-case carried.
              </p>
            </div>
            <div className="border-l-2 border-mono-amber pl-6">
              <p className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-amber uppercase mb-4">The method, published</p>
              <ul className="space-y-4">
                {PROOF.map((p) => (
                  <li key={p.href} className="border-t border-mono-white/12 pt-4 first:border-t-0 first:pt-0">
                    <Link href={p.href} className="font-display font-bold text-mono-white hover:text-mono-amber-bright transition-colors leading-snug inline-flex gap-1.5">
                      {p.t}
                    </Link>
                    <p className="mt-1.5 font-body text-[13px] text-mono-gray-bright leading-snug">{p.s}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who / engagement */}
      <section className="py-14 md:py-16 border-b border-mono-gray/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div>
            <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong uppercase mb-2">Who it’s for</p>
            <p className="font-body text-mono-charcoal leading-relaxed">
              Private equity, venture and growth capital, corporate development, and sovereign & family offices
              moving into African brands, culture, sport, music and fintech.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong uppercase mb-2">Engagement</p>
            <p className="font-body text-mono-charcoal leading-relaxed">
              Bespoke, scoped and quoted — start-to-finish, or at selected points: pre-transaction, completion,
              or post-deal value creation. Fixed-fee, billed in stages.
            </p>
            <Link href="/services/culture-due-diligence/estimate" className="mt-3 inline-flex items-center gap-1.5 text-[12px] tracking-[0.08em] font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
              SCOPE &amp; ESTIMATE <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black leading-[0.98] text-balance">
            Tell us the deal. We’ll bring the read.
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href={enquire} className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
              START A CONVERSATION <ArrowRight size={18} />
            </Link>
            <Link href="/services/culture-due-diligence/estimate" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">
              SCOPE &amp; ESTIMATE
            </Link>
          </div>
          <p className="mt-8 text-[12px] font-body text-mono-gray leading-relaxed max-w-xl mx-auto">
            Frameworks and classifications are MonoKromatik’s; underlying figures are sourced and named. This
            page is an overview, not an offer or investment advice.
          </p>
        </div>
      </section>
    </div>
  );
}
