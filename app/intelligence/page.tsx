import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookMarked,
  Database,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import CTA from '../components/CTA';
import { ADVISORY_SERVICES, DATA_PRODUCTS, CONTACT_EMAIL } from '../../lib/commerce';

export const metadata: Metadata = {
  title: 'MonoKromatik Intelligence — Value the Culture, Keep the Upside',
  description:
    'The value-capture practice for African & diaspora culture: a valuation engine for brands, sport, talent and catalogues, a strategy desk for the decisions that follow, and the proprietary data behind both. Talk to the desk — editor@monokromatik.com.',
  alternates: { canonical: 'https://www.monokromatik.com/intelligence' },
};

// The asset classes the valuation engine reads — the product framing on top of
// the Cultural-Signal Index + Ownership 100 data.
const ASSETS = [
  { k: 'Brands', icon: Gauge, d: 'Composite /100 on the Cultural-Signal Index, the authorship read, benchmarked against named rivals.' },
  { k: 'Sport & rights', icon: LineChart, d: 'Value and value-capture on teams, federations and commercial rights — the AFCON-tender lens, applied.' },
  { k: 'Players & talent', icon: Sparkles, d: 'What the talent creates vs what the current structure captures — the case for keeping the upside home.' },
  { k: 'Catalogues & IP', icon: Database, d: 'Music, film and brand IP valued through ownership and leakage, not headline revenue.' },
];

// Research & data destinations that live under the practice (existing routes).
const RESEARCH = [
  { title: 'The Cultural-Signal Index', copy: 'The ranked, authorship-weighted read of who authors African influence.', href: '/intelligence/signal-index', icon: Gauge },
  { title: 'The Ownership 100', copy: 'The ranked ownership ledger across sport, music, brands and fintech.', href: '/ownership-100', icon: Database },
  { title: 'Case Study Library', copy: 'Structured, source-led decodes — objective, bet, execution, lesson.', href: '/intelligence/case-studies', icon: BookMarked },
  { title: 'Source Desk', copy: 'Curated signal from authoritative global and African sources.', href: '/intelligence/source-desk', icon: ShieldCheck },
  { title: 'Reports & Special Issues', copy: 'Designed value-capture reports — free and paid.', href: '/reports', icon: LineChart },
];

const PROOF = [
  { v: 'Index', l: 'The Cultural-Signal Index — ranked, authorship-weighted' },
  { v: 'Ownership 100', l: 'The ranked ownership ledger across sport, music, brands & fintech' },
  { v: 'Sourced', l: 'Named sources on every claim; a Bear Case on every serious read' },
  { v: 'Cited', l: 'A reference the AI answer-engines already quote' },
];

const DISCIPLINES = [
  { n: '01 / RIGOUR', h: 'Framework-led', p: 'A repeatable method — Authorship → Ownership → Capture — and a ranked Index behind every claim. The structure of a strategy house, not a hot take.' },
  { n: '02 / FLUENCY', h: 'Culture, translated', p: 'We read culture the way the people inside it do, and translate it into a decision a brand, board or investor can act on — authentically, not opportunistically.' },
  { n: '03 / VALUATION', h: 'Priced on data', p: 'A proprietary valuation engine for brands, sport, talent and catalogues — so the cultural read always lands as a number and a move.' },
];

const BUYERS = [
  { h: 'Brands & sponsors', p: 'Which property, talent or moment fits — and what it’s worth before you sign.' },
  { h: 'Rights-holders & federations', p: 'Price the rights, structure the deal, keep more of the value you create.' },
  { h: 'Investors & funds', p: 'Culture due diligence on the target and the category — value and risk, read straight.' },
  { h: 'Artists & catalogue owners', p: 'What your authorship is worth, who’s capturing it, and how to own the chain.' },
];

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* HERO */}
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">MONOKROMATIK INTELLIGENCE</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            Value the culture. <span className="text-mono-amber">Keep the upside.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The value-capture practice for African &amp; diaspora culture — a valuation engine for brands, sport, talent
            and catalogues, a strategy desk for the decisions that follow, and the proprietary data behind both.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <CTA href="/intelligence/value" variant="amber">Value an asset</CTA>
            <CTA href="/work-with-us?interest=value-capture-advisory" variant="text" className="text-mono-amber hover:text-mono-amber-bright">Commission the desk</CTA>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 pt-7 border-t border-mono-white/15 text-sm font-body text-mono-soft-white/80">
            {['The Cultural-Signal Index', 'The Ownership 100 ledger', 'Named sources on every claim', 'Cited by AI assistants'].map((c) => (
              <span key={c} className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-mono-amber" aria-hidden="true" /> {c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SPINE */}
      <section className="bg-mono-charcoal text-mono-white py-14 md:py-16 border-b border-mono-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          <p className="font-display font-medium text-2xl md:text-3xl leading-tight max-w-[30ch]">
            One engine under everything: the <span className="text-mono-amber">Cultural-Signal Index</span> and the{' '}
            <span className="text-mono-amber">Ownership 100</span>, read through <span className="text-mono-amber">Authorship → Ownership → Capture</span>.
          </p>
          <p className="font-body text-mono-soft-white/80 max-w-[52ch]">
            Every valuation, every advisory call and every data licence runs on the same source-verified corpus. One
            method, one ledger — so the number you get here is the number you can defend in a boardroom.
          </p>
        </div>
      </section>

      {/* THE TOOL (lead) */}
      <section className="bg-mono-black text-mono-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">THE RESOURCE · DAY-TO-DAY</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-[1.03]">A valuation engine for culture.</h2>
            <p className="mt-5 text-lg font-body text-mono-soft-white/85">
              What a brand, a sports right, a player or team, or a catalogue is actually worth — and who is capturing that
              value. Not reach or followers: authorship, ownership and the capturable upside, scored on our data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-white/15 border border-mono-white/15">
            {ASSETS.map((a) => (
              <div key={a.k} className="bg-mono-black p-6">
                <a.icon size={20} className="text-mono-amber" aria-hidden="true" />
                <h3 className="mt-4 font-display font-bold text-lg">{a.k}</h3>
                <p className="mt-2 font-body text-sm text-mono-soft-white/75 leading-relaxed">{a.d}</p>
              </div>
            ))}
          </div>

          {/* tiers — free checker + the real DATA_PRODUCTS bands (single source) */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-mono-white/15 bg-mono-charcoal p-6 flex flex-col gap-2">
              <span className="text-[11px] tracking-[0.14em] uppercase font-display font-bold text-mono-amber">Start free</span>
              <span className="font-display font-bold text-lg">Value-Capture Checker</span>
              <span className="font-display font-bold text-mono-amber text-sm">Free</span>
              <span className="font-body text-sm text-mono-soft-white/75 flex-1">A 60-second read: Retained, Exported, Hollowed or Contested — and what to do about it.</span>
              <Link href="/value-capture-checker" className="mt-2 inline-flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.1em] text-mono-amber hover:text-mono-amber-bright">TAKE THE CHECKER <ArrowRight size={13} /></Link>
            </div>
            {DATA_PRODUCTS.map((p, i) => (
              <div key={p.id} className={`border p-6 flex flex-col gap-2 ${i === 0 ? 'border-mono-amber bg-mono-charcoal' : 'border-mono-white/15 bg-mono-charcoal'}`}>
                <span className="text-[11px] tracking-[0.14em] uppercase font-display font-bold text-mono-amber">
                  {i === 0 ? 'On demand' : p.interest === 'enterprise' ? 'Build on it' : 'License the data'}
                </span>
                <span className="font-display font-bold text-lg leading-tight">{p.title}</span>
                <span className="font-display font-bold text-mono-amber text-sm">{p.priceFrom}</span>
                <span className="font-body text-sm text-mono-soft-white/75 flex-1">{p.blurb}</span>
                <Link href={`/work-with-us?interest=${p.interest}`} className="mt-2 inline-flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.1em] text-mono-amber hover:text-mono-amber-bright">ENQUIRE <ArrowRight size={13} /></Link>
              </div>
            ))}
          </div>
          <div className="mt-9"><CTA href="/intelligence/value" variant="amber">Value an asset</CTA></div>
        </div>
      </section>

      {/* THE ADVISORY */}
      <section className="bg-mono-white py-16 md:py-24 border-y border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE DESK · SPECIALISED</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black leading-[1.03]">The strategy behind the number.</h2>
            <p className="mt-5 text-lg font-body text-mono-charcoal leading-relaxed">
              When a valuation becomes a decision — a sponsorship, an acquisition, a rights deal, a renegotiation — the
              desk builds the case. Consulting-grade rigour, cultural fluency, one named buyer per engagement.
            </p>
          </div>
          <div className="grid gap-px bg-mono-gray/20 border border-mono-gray/20">
            {ADVISORY_SERVICES.map((s) => (
              <div key={s.id} className="bg-mono-white p-6 md:p-7 grid md:grid-cols-[1.3fr_1fr] gap-x-8 gap-y-2 items-start">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 md:block">
                    <h3 className="font-display font-bold text-2xl text-mono-black">
                      {s.detailHref ? (
                        <Link href={s.detailHref} className="hover:text-mono-amber-strong transition-colors">{s.name}</Link>
                      ) : s.name}
                    </h3>
                    <span className="font-display font-bold text-mono-amber-strong md:hidden">{s.priceFrom}</span>
                  </div>
                  <p className="mt-1 text-[12px] tracking-[0.1em] uppercase font-display font-semibold text-mono-gray">{s.buyer}</p>
                </div>
                <div>
                  <p className="font-body text-mono-charcoal">{s.decision}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="hidden md:inline font-display font-bold text-mono-amber-strong">{s.priceFrom}</span>
                    <Link href={`/work-with-us?interest=${s.id}`} className="inline-flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.12em] text-mono-amber-strong hover:text-mono-amber-hover">START A BRIEF <ArrowRight size={13} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-9"><CTA href="/work-with-us?interest=value-capture-advisory" variant="primary">Commission the desk</CTA></div>
        </div>
      </section>

      {/* THREE DISCIPLINES */}
      <section className="bg-mono-paper py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">ONE PRACTICE, THREE DISCIPLINES</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Why the number holds up.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DISCIPLINES.map((d) => (
              <div key={d.n} className="border border-mono-gray/25 bg-mono-white p-7">
                <p className="font-display font-bold text-[13px] tracking-[0.1em] text-mono-amber-strong">{d.n}</p>
                <h3 className="mt-3 font-display font-bold text-xl text-mono-black">{d.h}</h3>
                <p className="mt-3 font-body text-mono-charcoal text-[15px] leading-relaxed">{d.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE WEDGE + PROOF */}
      <section className="bg-mono-black text-mono-white py-16 md:py-24 border-y border-mono-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE WEDGE</p>
          <p className="font-display font-bold text-2xl md:text-4xl leading-[1.12] max-w-[22ch]">
            Africa makes the culture. <span className="text-mono-amber">The upside leaks offshore.</span> We built the practice that keeps it home.
          </p>
          <p className="mt-6 font-body text-mono-soft-white/80 max-w-[62ch]">
            Global consultancies don’t cover African value-capture; culture agencies don’t price it; data vendors sell
            the feed, not the decision. We do all three — for the continent and its diaspora, where the question of who
            keeps the money is the whole story.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-white/15 border border-mono-white/15">
            {PROOF.map((p) => (
              <div key={p.v} className="bg-mono-black p-6">
                <p className="font-display font-bold text-xl text-mono-white">{p.v}</p>
                <p className="mt-1.5 font-body text-sm text-mono-soft-white/70">{p.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE WORK WITH */}
      <section className="bg-mono-paper py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">WHO WE WORK WITH</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Built for the people on both sides of the deal.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-gray/20 border border-mono-gray/20">
            {BUYERS.map((b) => (
              <div key={b.h} className="bg-mono-white p-6">
                <h3 className="font-display font-bold text-lg text-mono-black">{b.h}</h3>
                <p className="mt-2 font-body text-sm text-mono-charcoal leading-relaxed">{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH & DATA (the research hub, folded in) */}
      <section className="bg-mono-white py-16 md:py-24 border-t border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">RESEARCH &amp; DATA</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">The corpus the practice runs on.</h2>
            <p className="mt-4 font-body text-mono-charcoal">Open to read; the paid tiers and advisory build on it.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESEARCH.map((r) => (
              <Link key={r.title} href={r.href} className="group border border-mono-gray/25 bg-mono-white p-6 hover:border-mono-amber transition-colors">
                <r.icon size={20} className="text-mono-amber-strong" aria-hidden="true" />
                <h3 className="mt-4 font-display font-bold text-lg text-mono-black group-hover:text-mono-amber-strong transition-colors">{r.title}</h3>
                <p className="mt-2 font-body text-sm text-mono-charcoal leading-relaxed">{r.copy}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.1em] text-mono-amber-strong">EXPLORE <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — editor@ always-on */}
      <section id="contact" className="bg-mono-amber text-mono-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-black/70 mb-4">TALK TO THE BUSINESS</p>
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-[1.0] max-w-[16ch]">The desk is always open.</h2>
          <p className="mt-5 max-w-[46ch] font-body text-mono-black/80 font-medium">
            One line to the whole business — valuations, advisory, data licences, partnerships and press. Tell us the
            decision in front of you; we reply from a real inbox, usually within one working day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 bg-mono-black text-mono-amber px-6 py-4 font-display font-bold text-lg md:text-2xl hover:bg-mono-charcoal transition-colors">
              {CONTACT_EMAIL}
            </a>
            <Link href="/work-with-us" className="inline-flex items-center gap-2 border border-mono-black px-6 py-4 font-display font-bold text-mono-black hover:bg-mono-black hover:text-mono-amber transition-colors">
              Start a structured brief <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
