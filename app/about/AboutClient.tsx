'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Download, Handshake } from 'lucide-react';
import Navigation from '../components/Navigation';
import { StatStrip } from '../components/dataviz/Charts';

// The three things a visitor can actually do — the whole surface, in plain
// language. Focus over taxonomy.
const whatYouGet = [
  {
    icon: BookOpen,
    title: 'Read',
    copy: 'A free library — 193 articles and 56 designed reports on who owns African culture, and who keeps the money.',
    href: '/reports',
    cta: 'Browse the library',
  },
  {
    icon: Download,
    title: 'Buy',
    copy: 'Decision-grade value-capture reports, from R220 — the full ownership read on one brand or market, delivered as a PDF, built to keep.',
    href: '/reports',
    cta: 'See the reports',
  },
  {
    icon: Handshake,
    title: 'Work with me',
    copy: 'Culture Due Diligence for investors buying into African brands, and Value-Capture Advisory for the rights holders on the other side of the deal.',
    href: '/work-with-us',
    cta: 'Start a conversation',
  },
];

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* ── Hero: the human ────────────────────────────────────── */}
      <section className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.25fr_0.75fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber mb-6">
              THE DESK · SIBU SHANGASE
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98]">
              Who owns African culture —{' '}
              <span className="text-mono-amber">and who keeps the money.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
              I&rsquo;m Sibu Shangase. MonoKromatik is the intelligence desk I run to answer one
              question: when African music, sport, fashion and brands create value for the world,
              who actually captures it? I read the deals, score the ownership, and say plainly where
              the value leaks — for the founders, investors and brand leaders who have to decide.
            </p>
            <p className="mt-6 max-w-xl font-body text-mono-gray-bright leading-relaxed">
              By day I&rsquo;m a Brands Director at Mast-J&auml;germeister. MonoKromatik is where I
              turn that operator&rsquo;s lens on African brand ownership — the read I always wanted
              and could never find.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xs lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden bg-mono-charcoal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/people/sibu-shangase.jpg"
                alt="Sibu Shangase, founder of MonoKromatik"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <p className="mt-3 font-display text-[11px] tracking-[0.18em] text-mono-gray uppercase">
              Sibu Shangase · Founder &amp; Editor
            </p>
          </div>
        </div>
      </section>

      {/* ── What you get (the whole surface, 3 things) ─────────── */}
      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">
              WHAT IT IS
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">
              African brand intelligence — for the people who decide. Three ways in.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
            {whatYouGet.map(({ icon: Icon, title, copy, href, cta }) => (
              <Link
                key={title}
                href={href}
                className="group bg-mono-white p-8 min-h-[290px] flex flex-col justify-between hover:bg-mono-black transition-colors"
              >
                <Icon className="text-mono-amber" size={26} />
                <div>
                  <h3 className="font-display text-2xl font-bold text-mono-black group-hover:text-mono-white transition-colors">
                    {title}
                  </h3>
                  <p className="mt-4 font-body text-mono-charcoal group-hover:text-mono-soft-white leading-relaxed transition-colors">
                    {copy}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-mono-amber-strong group-hover:text-mono-amber">
                    {cta} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The method (framework + judgment first) ────────────── */}
      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE METHOD</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              One framework, applied to everything.
            </h2>
          </div>
          <div className="space-y-6 text-lg font-body leading-relaxed text-mono-soft-white">
            <p>
              <span className="text-mono-amber font-display font-bold">Authorship → Ownership → Capture.</span>{' '}
              Who made the value, who owns the rail that monetises it, and where the money actually
              lands. It reads the same across music, sport, fashion, fintech and hospitality — which
              is how a pattern most people feel becomes something you can count.
            </p>
            <p>
              Named sources on every claim. A <span className="font-semibold text-mono-white">Bear Case</span> —
              the strongest argument against my own read — on every serious report. No anonymous
              takes: the verdict is mine, and it&rsquo;s signed.
            </p>
            <Link
              href="/editorial-standards"
              className="inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.12em] text-mono-amber hover:text-mono-amber-bright"
            >
              THE EDITORIAL STANDARDS <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── The proof (body of work, not ambition) ─────────────── */}
      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">
              THE RECORD
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">
              Not a promise — a published body of work.
            </h2>
          </div>
          <StatStrip
            tone="light"
            items={[
              { value: '56', label: 'Designed, source-verified reports' },
              { value: '193', label: 'Articles on African brand ownership' },
              { value: '100', label: 'Brands ranked in The Ownership 100' },
              { value: 'AI-cited', label: 'Already surfaced in ChatGPT & Copilot answers' },
            ]}
          />
          <ul className="mt-9 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
            {[
              'The Ownership 100 — the ranked ledger of who owns African culture',
              'A standing record of every deal that moves an African brand’s ownership',
              'Culture Due Diligence and value-capture studies used to brief real decisions',
              'Every figure traceable to a named, public source',
            ].map((p) => (
              <li key={p} className="flex items-start gap-2.5 font-body text-mono-charcoal">
                <Check size={17} className="mt-0.5 shrink-0 text-mono-amber-strong" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <Link
            href="/ownership-100"
            className="mt-9 inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold"
          >
            SEE THE OWNERSHIP 100 <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── How it's made (AI, demoted to an honest footnote) ──── */}
      <section className="py-16 bg-mono-white border-t border-mono-gray/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-gray mb-4">HOW IT&rsquo;S MADE</p>
          <p className="font-body text-lg text-mono-charcoal leading-relaxed">
            I use AI to monitor hundreds of sources and surface the signal one desk could never track
            alone. It does not write the analysis. The framework, the judgement and the verdict are
            human — and named. Where a claim carries real consequence, a person stands behind it.
          </p>
        </div>
      </section>

      {/* ── Close (two clear actions) ──────────────────────────── */}
      <section className="py-20 bg-mono-black text-mono-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Read it, or put it to work.
          </h2>
          <div className="mt-9 flex flex-wrap gap-4 justify-center">
            <Link href="/reports" className="inline-flex gap-2 items-center bg-mono-amber text-mono-black px-7 py-4 font-display font-bold">
              BROWSE THE LIBRARY <ArrowRight size={18} />
            </Link>
            <Link href="/work-with-us" className="inline-flex gap-2 items-center border border-mono-white px-7 py-4 font-display font-bold">
              WORK WITH ME <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
