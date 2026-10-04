import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Layers } from 'lucide-react';
import Navigation from '../components/Navigation';
import AdvisoryBridge from '../components/AdvisoryBridge';
import BuyButton from '../components/BuyButton';
import { getBundles, reportPrice } from '../../lib/commerce';
import { getAllReports } from '../../lib/reports';

export const metadata: Metadata = {
  title: 'Report Bundles — the value-capture library, one price | MonoKromatik',
  description:
    'Buy the MonoKromatik value-capture reports together and save. The Ownership Studies and the Full Shelf — the same ownership lens, bundled.',
  alternates: { canonical: 'https://www.monokromatik.com/bundles' },
};

export default function BundlesPage() {
  const bundles = getBundles();
  const titleBySlug = new Map(getAllReports().map((r) => [r.slug, r.title]));

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_350px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / BUNDLES</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">
              The whole shelf,<br />
              <span className="text-mono-amber">one price.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">
              The value-capture reports, bundled and discounted. Same ownership lens, more of it — each report delivered as a
              source-verified PDF, licensed to you.
            </p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <Layers className="text-mono-amber mb-6" size={27} />
            <p className="font-display text-2xl font-bold leading-tight">Buy the set. Pay less than the parts.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {bundles.map((bundle) => (
              <article
                key={bundle.slug}
                className={`bg-mono-white border p-8 md:p-10 flex flex-col justify-between min-h-[420px] ${
                  bundle.featured ? 'border-mono-black shadow-[6px_6px_0_0_var(--mono-amber,#C24A0A)]' : 'border-mono-gray/25'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber-strong">BUNDLE</p>
                    {bundle.featured && (
                      <span className="text-[9px] tracking-[0.2em] px-2.5 py-1 bg-mono-amber text-mono-black font-display font-bold">BEST VALUE</span>
                    )}
                  </div>
                  <h2 className="mt-7 text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">{bundle.title}</h2>
                  <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{bundle.blurb}</p>

                  <ul className="mt-7 space-y-3">
                    {bundle.members.map((slug) => (
                      <li key={slug} className="flex items-start gap-3 font-body text-mono-charcoal">
                        <Check size={18} className="text-mono-amber-strong shrink-0 mt-1" aria-hidden="true" />
                        <span>
                          {titleBySlug.get(slug) ?? slug}
                          <span className="text-mono-gray"> · {reportPrice(slug)} separately</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-9">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-display font-bold text-mono-black">{bundle.price}</span>
                    {bundle.saveNote && <span className="text-sm font-display font-bold text-mono-amber-strong">{bundle.saveNote}</span>}
                  </div>
                  <div className="mt-6">
                    {bundle.url ? (
                      <BuyButton
                        href={bundle.url}
                        slug={bundle.slug}
                        price={bundle.price}
                        className="inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors w-full sm:w-auto"
                      >
                        BUY THE BUNDLE — {bundle.price} <ArrowRight size={16} />
                      </BuyButton>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-2 border border-mono-gray/40 text-mono-charcoal px-7 py-4 font-display font-bold cursor-default">
                          LAUNCHING SHORTLY
                        </span>
                        <p className="mt-3 text-sm text-mono-gray font-body">
                          Not live yet — in the meantime you can{' '}
                          <Link href="/reports" className="text-mono-amber-strong underline underline-offset-2">
                            buy the reports individually
                          </Link>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-sm text-mono-gray font-body">
            Each bundle is delivered as individual PDFs, each watermarked and licensed to the purchaser. Prices in ZAR.
          </p>
        </div>
      </section>

      <section className="bg-mono-white py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">WHY BUNDLE</p>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-display font-bold text-mono-black mb-10">
            One lens, applied across the economy.
          </h2>
          <div className="grid md:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
            {[
              { t: 'The method travels', c: 'Authorship → Ownership → Capture reads the same across music, sport, fintech and fashion. The set shows the pattern, not just one case.' },
              { t: 'Decision-grade', c: 'Source-verified, named-attribution, Bear Case on every serious piece. Reports a brand, agency or investor can act on.' },
              { t: 'Licensed to you', c: 'Every PDF is watermarked to the purchaser — yours to keep and cite, not a shareable link.' },
            ].map(({ t, c }) => (
              <article key={t} className="bg-mono-white p-8 min-h-[220px] flex flex-col justify-between">
                <Layers className="text-mono-amber" size={22} />
                <div>
                  <h3 className="text-xl font-display font-bold text-mono-black">{t}</h3>
                  <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{c}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Product → advisory bridge: the data/briefing/license + value-capture
          advisory path, as a short gated form beside a trust strip. */}
      <AdvisoryBridge source="bundles-advisory-bridge" />
    </div>
  );
}
