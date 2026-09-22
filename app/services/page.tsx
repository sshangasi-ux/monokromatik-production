import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, Target, Layers, Handshake, Database } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { ADVISORY_SERVICES } from '../../lib/commerce';

export const metadata: Metadata = {
  title: 'Intelligence Services — MonoKromatik',
  description:
    'The engine behind the publication, put to work on your decision. MonoKromatik advisory services for brands, agencies, rights holders and investors — powered by the Cultural-Signal Index, the Authorship → Ownership → Capture framework and the signalling lens, across sport, music, spirits, beauty, retail and fintech.',
};

// The four rungs of how the offering stacks — from the free read to the licensed
// engine. Read → Reports → Advise → License. (See docs/INTELLIGENCE-SERVICES-MODEL.md.)
const LADDER = [
  { k: 'READ', label: 'The publication', blurb: 'The tracker, the Index and the analysis — free to read. The proof the engine works.', href: '/intelligence', cta: 'Read the intelligence' },
  { k: 'REPORTS', label: 'Buy a report', blurb: 'Single studies (R220) to the deep institutional report (R3,500) — the decision, decoded.', href: '/pricing', cta: 'See the reports' },
  { k: 'ADVISE', label: 'Commission a service', blurb: 'The named advisory lines below — your brand, deal or market, decoded to order.', href: '#advisory', cta: 'See the services' },
  { k: 'LICENSE', label: 'License the engine', blurb: 'The Index dataset, league tables and API — the data in your own stack.', href: '/work-with-us?interest=license', cta: 'License the data' },
];

const VERTICALS = ['Sport', 'Music & catalogues', 'Spirits & luxury', 'Beauty', 'Retail & FMCG', 'Fintech', 'Fashion', 'Nation brands'];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / SERVICES</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            The intelligence, <span className="text-mono-amber">working for you.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            We publish the read on who authors African brand and culture value — and who captures it.
            The same engine that powers the publication is a partner offering: your brand, your deal or
            your market, decoded to a decision. One framework, every category.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/work-with-us" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-8 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              START A CONVERSATION <ArrowRight size={18} />
            </Link>
            <Link href="#advisory" className="inline-flex items-center gap-2 border border-mono-white/30 text-mono-white px-6 py-4 font-display font-bold hover:bg-mono-white hover:text-mono-black transition-colors">
              SEE THE SERVICES
            </Link>
          </div>
        </div>
      </section>

      {/* How the offering stacks — the ladder */}
      <section className="py-16 md:py-20 border-b border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">HOW IT STACKS</p>
          <h2 className="max-w-3xl text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.02] text-balance">
            Four ways to work with the engine — from a free read to a licensed feed.
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {LADDER.map((rung, i) => (
              <div key={rung.k} className="flex flex-col border border-mono-gray/25 bg-mono-white p-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-display font-bold text-mono-amber-strong tabular-nums">{`0${i + 1}`}</span>
                  <span className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-charcoal">{rung.k}</span>
                </div>
                <p className="mt-4 font-display font-bold text-lg text-mono-black">{rung.label}</p>
                <p className="mt-2 font-body text-[15px] text-mono-charcoal leading-relaxed">{rung.blurb}</p>
                <Link href={rung.href} className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[12px] tracking-[0.08em] font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
                  {rung.cta.toUpperCase()} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The advisory services — the core */}
      <section id="advisory" className="py-16 md:py-24 bg-mono-soft-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE ADVISORY LADDER</p>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-display font-bold text-mono-black leading-[0.98] text-balance">
            Not a report. A decision, answered.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-lg text-mono-charcoal leading-relaxed">
            Each service names one buyer and one decision — powered by the Cultural-Signal Index, the
            Authorship&nbsp;→&nbsp;Ownership&nbsp;→&nbsp;Capture framework and the signalling lens. Bands are
            indicative; every engagement is scoped and quoted.
          </p>

          <div className="mt-12 grid md:grid-cols-2 gap-6 items-stretch">
            {ADVISORY_SERVICES.map((s) => (
              <div
                key={s.id}
                className={`relative flex flex-col bg-mono-white p-7 md:p-8 ${s.featured ? 'border-2 border-mono-black shadow-[6px_6px_0_0_var(--mono-amber)]' : 'border border-mono-gray/25'}`}
              >
                {s.featured && (
                  <span className="absolute -top-3 left-7 bg-mono-amber text-mono-black text-[10px] tracking-[0.22em] font-display font-bold px-3 py-1">
                    FLAGSHIP SERVICE
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">{s.name.toUpperCase()}</p>
                  <span className="text-right text-[13px] font-display font-bold text-mono-black whitespace-nowrap">{s.priceFrom}</span>
                </div>
                <p className="mt-3 text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray uppercase">{s.buyer}</p>
                <p className="mt-4 font-feature italic text-xl md:text-2xl text-mono-black leading-snug">“{s.decision}”</p>
                <ul className="mt-6 space-y-3 border-t border-mono-gray/20 pt-6">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 font-body text-[15px] text-mono-charcoal leading-snug">
                      <Check size={17} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Link
                    href={`/work-with-us?interest=${s.id}`}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 font-display font-bold transition-colors ${s.featured ? 'bg-mono-black text-mono-white hover:bg-mono-charcoal' : 'border border-mono-black text-mono-black hover:bg-mono-black hover:text-mono-white'}`}
                  >
                    ENQUIRE <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One engine, every category */}
      <section className="py-16 md:py-20 border-t border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">ONE ENGINE, EVERY CATEGORY</p>
          <h2 className="max-w-3xl text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.02] text-balance">
            The same read works wherever culture creates value.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-lg text-mono-charcoal leading-relaxed">
            Who authored the value, who owns the apparatus that prices it, who captures the premium —
            that question is category-agnostic. It is the advantage a single-sector shop can’t copy.
          </p>
          <div className="mt-9 flex flex-wrap gap-2.5">
            {VERTICALS.map((v) => (
              <span key={v} className="text-[13px] tracking-[0.04em] font-display font-bold text-mono-charcoal border border-mono-gray/35 bg-mono-white px-4 py-2.5">
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How we work — the engine + the skill base */}
      <section className="py-16 md:py-24 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">HOW WE WORK</p>
          <h2 className="max-w-3xl text-3xl md:text-4xl font-display font-bold leading-[1.02] text-balance">
            An engine, a desk, and a partner network.
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, t: 'The engine', b: 'The Cultural-Signal Index, the Who’s Buying Africa tracker, the AOC framework and the signalling lens — a proprietary, sourced read of authorship, ownership and capture. Built and paid for; put to work on you.' },
              { icon: Layers, t: 'The desk', b: 'A credentialed contributor network — data, economics and domain specialists across sport, music, drinks, beauty, retail and fintech — activated per engagement, not carried as fixed cost.' },
              { icon: Handshake, t: 'The partners', b: 'For the enterprise tier — due diligence and licensing — we pair the culture-and-capture read with corporate-finance, legal and on-the-ground research partners across African markets.' },
            ].map((c) => (
              <div key={c.t}>
                <c.icon size={22} className="text-mono-amber-bright mb-4" aria-hidden="true" />
                <p className="font-display font-bold text-xl text-mono-white">{c.t}</p>
                <p className="mt-3 font-body text-[15px] text-mono-soft-white leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data & licensing pointer */}
      <section className="py-14 md:py-16 border-t border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-mono-gray/25 bg-mono-white p-7 md:p-9">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-2">
                <Database size={18} className="text-mono-amber-strong" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">DATA &amp; LICENSING</p>
              </div>
              <p className="font-display font-bold text-2xl text-mono-black leading-tight">Build on the Index itself.</p>
              <p className="mt-3 font-body text-mono-charcoal leading-relaxed">
                League tables, per-brand scores and the full dataset — licensed for your report, deck,
                platform or research, or delivered live via API. From $900 for a single scorecard to a
                full annual API contract.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/pricing" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">
                SEE PRICING
              </Link>
              <Link href="/work-with-us?interest=license" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors">
                LICENSE THE DATA <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-mono-soft-white border-t border-mono-gray/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black leading-[0.98] text-balance">
            Tell us the decision. We’ll bring the read.
          </h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            A brand to score, a partnership to test, a market to map, or a deal to diligence — start with the
            question and we’ll scope the work.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/work-with-us" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
              START A CONVERSATION <ArrowRight size={18} />
            </Link>
            <Link href="/reports" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">
              READ A REPORT FIRST
            </Link>
          </div>
          <div className="mt-12 max-w-md mx-auto">
            <NewsletterSignup variant="footer" />
          </div>
        </div>
      </section>
    </div>
  );
}
