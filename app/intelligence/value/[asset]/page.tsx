import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Lock } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import CTA from '../../../components/CTA';
import { buildAssetIndex } from '../../../../lib/asset-index';
import { ARCHETYPE_NOTE, type Archetype } from '../../../../lib/asset-read';

const SITE = 'https://www.monokromatik.com';

interface PageProps {
  params: Promise<{ asset: string }>;
}

// Build the index once per module load; both generateStaticParams and the page
// read from it. Deterministic at build time (no per-request cost).
const INDEX = buildAssetIndex();
const BY_KEY = new Map(INDEX.map((r) => [r.key, r]));

export function generateStaticParams() {
  return INDEX.map((r) => ({ asset: r.key }));
}

const OWNERSHIP_LABEL: Record<'african' | 'foreign' | 'mixed', string> = {
  african: 'African-owned',
  foreign: 'Foreign-controlled',
  mixed: 'Mixed ownership',
};

const VERDICT_TEXT: Record<Archetype, string> = {
  RETAINED: 'text-emerald-400',
  EXPORTED: 'text-mono-amber',
  CONTESTED: 'text-mono-gray-bright',
  HOLLOWED: 'text-red-400',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { asset } = await params;
  const r = BY_KEY.get(asset);
  if (!r) return { title: 'Asset Not Found | MonoKromatik' };
  const url = `${SITE}/intelligence/value/${r.key}`;
  const bits = [
    r.verdict ? `value-capture verdict ${r.verdict}` : null,
    r.owner ? `owned by ${r.owner}${r.ownerCountry ? ` (${r.ownerCountry})` : ''}` : null,
    r.score != null ? `Cultural-Signal score ${r.score}/100${r.band ? ` (${r.band})` : ''}` : null,
  ].filter(Boolean).join(' · ');
  return {
    title: `${r.display} — Who owns it, who keeps the value | MonoKromatik`,
    description: `${r.display}: ${bits || 'the value-capture read MonoKromatik holds'}. A sourced read from the Cultural-Signal Index and the Ownership 100.`,
    alternates: { canonical: url },
    openGraph: { title: `${r.display} — the value-capture read`, url, type: 'website' },
  };
}

export default async function AssetProfile({ params }: PageProps) {
  const { asset } = await params;
  const r = BY_KEY.get(asset);
  if (!r) notFound();

  const url = `${SITE}/intelligence/value/${r.key}`;

  // The graph edges: other assets sharing the primary sector (so compound
  // labels like "Telecoms · Fintech" still connect to "Telecoms"), then the
  // same owner.
  const primary = (s?: string) => (s || '').split(/[·,/]|\s-\s/)[0].trim().toLowerCase();
  const rp = primary(r.sector);
  const related = (() => {
    const sameSector = rp ? INDEX.filter((x) => x.key !== r.key && primary(x.sector) === rp) : [];
    const sameOwner = r.owner ? INDEX.filter((x) => x.key !== r.key && x.owner === r.owner) : [];
    const seen = new Set<string>();
    return [...sameSector, ...sameOwner]
      .filter((x) => (seen.has(x.key) ? false : (seen.add(x.key), true)))
      .slice(0, 6);
  })();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: r.display,
    ...(r.sector ? { industry: r.sector } : {}),
    ...(r.owner ? { parentOrganization: { '@type': 'Organization', name: r.owner } } : {}),
    url,
    subjectOf: { '@type': 'Dataset', name: 'The Ownership 100', url: `${SITE}/ownership-100` },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      {/* Hero */}
      <header className="bg-mono-black text-mono-white py-14 md:py-20 border-b border-mono-white/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/value"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-9"
          >
            MONOKROMATIK INTELLIGENCE · VALUE AN ASSET
          </Link>
          <h1 className="font-feature text-5xl md:text-7xl font-bold leading-[0.97]">{r.display}</h1>
          {(r.sector || typeof r.rank === 'number') && (
            <p className="mt-3 font-body text-mono-gray-bright">
              {r.sector}
              {typeof r.rank === 'number' ? (
                <>
                  {r.sector ? ' · ' : ''}
                  <Link href="/ownership-100/findings" className="text-mono-amber hover:text-mono-amber-bright">Ownership 100 · #{r.rank}</Link>
                </>
              ) : null}
            </p>
          )}

          {r.verdict ? (
            <div className="mt-8">
              <p className="text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright uppercase mb-2">Value-capture verdict</p>
              <p className={`font-display font-bold text-4xl md:text-5xl ${VERDICT_TEXT[r.verdict]}`}>{r.verdict}</p>
              <p className="mt-2 font-body text-mono-soft-white max-w-2xl">{ARCHETYPE_NOTE[r.verdict]}</p>
            </div>
          ) : (
            <p className="mt-8 font-body text-mono-soft-white max-w-2xl">The value-capture read MonoKromatik holds on {r.display}.</p>
          )}

          {/* facts */}
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-px bg-mono-white/15 border border-mono-white/15">
            {(r.owner || r.ownerCountry) && (
              <div className="bg-mono-black p-5">
                <p className="text-[11px] tracking-[0.16em] uppercase font-display font-bold text-mono-gray-bright">Owned by</p>
                <p className="mt-1.5 font-display font-bold text-mono-white">{r.owner}{r.ownerCountry ? ` · ${r.ownerCountry}` : ''}</p>
                {r.ownership && <span className="mt-2 inline-block text-[11px] font-display font-bold px-2 py-0.5 rounded-full bg-mono-white/10 text-mono-soft-white">{OWNERSHIP_LABEL[r.ownership]}</span>}
              </div>
            )}
            {typeof r.score === 'number' && (
              <div className="bg-mono-black p-5">
                <p className="text-[11px] tracking-[0.16em] uppercase font-display font-bold text-mono-gray-bright">Signal score</p>
                <p className="mt-1.5 font-display font-bold text-mono-white text-2xl tabular-nums">{r.score}<span className="text-mono-gray-bright text-base">/100</span>{r.band ? <span className="ml-2 text-mono-amber text-lg">{r.band}</span> : null}</p>
                <Link href="/intelligence/signal-index/methodology" className="mt-2 inline-flex items-center gap-1 text-[11px] font-display font-bold tracking-[0.08em] text-mono-gray-bright hover:text-mono-amber">How it&rsquo;s scored <ArrowUpRight size={12} /></Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">
        {r.take && (
          <section>
            <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-4">The read</p>
            <p className="font-body text-lg md:text-xl text-mono-charcoal leading-relaxed max-w-[70ch]">{r.take}</p>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {r.href && (
            <Link href={r.href} className="inline-flex items-center gap-1.5 font-display text-[13px] font-bold tracking-[0.1em] text-mono-amber-strong hover:text-mono-amber-hover">
              READ THE FULL BREAKDOWN <ArrowRight size={14} />
            </Link>
          )}
          <div className="flex flex-wrap gap-2">
            {r.sources.map((s) => (
              <span key={s} className="text-[11px] font-body text-mono-gray border border-mono-gray/30 px-2 py-1">{s}</span>
            ))}
          </div>
        </div>

        {/* Depth-gate */}
        <section className="border border-mono-amber/40 bg-mono-black text-mono-white p-7 md:p-9">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-mono-amber" aria-hidden="true" />
            <p className="font-display text-[11px] font-bold tracking-[0.24em] uppercase text-mono-amber">The full Scorecard unlocks</p>
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-7 gap-y-2.5">
            {['The four-axis decode — idea, authorship, execution, consequence', 'Named-rival benchmarks in the category', 'A roadmap to move the number', 'The full value-capture breakdown, sourced'].map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] font-body text-mono-soft-white/90 leading-snug">
                <span className="text-mono-gray-bright shrink-0" aria-hidden="true">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <CTA href="/work-with-us?interest=scorecard" variant="amber">Unlock the Scorecard — from $900</CTA>
            <CTA href="/intelligence/value" variant="outline" className="border-mono-white/25 text-mono-white hover:border-mono-amber hover:text-mono-amber">
              Value another asset
            </CTA>
          </div>
        </section>

        {/* The graph — related assets */}
        {related.length > 0 && (
          <section className="border-t border-mono-gray/20 pt-10">
            <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-5">
              {r.sector ? `More in ${r.sector}` : 'Related reads'}
            </p>
            <div className="grid sm:grid-cols-2 gap-px bg-mono-gray/20 border border-mono-gray/20">
              {related.map((x) => (
                <Link key={x.key} href={`/intelligence/value/${x.key}`} className="group bg-mono-white p-5 flex items-center justify-between gap-4 hover:bg-mono-soft-white transition-colors">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-mono-black group-hover:text-mono-amber-strong transition-colors truncate">{x.display}</p>
                    {x.verdict && <p className={`mt-0.5 text-[11px] font-display font-bold tracking-[0.12em] ${x.verdict === 'RETAINED' ? 'text-emerald-600' : x.verdict === 'EXPORTED' ? 'text-mono-amber-strong' : 'text-mono-gray'}`}>{x.verdict}</p>}
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 text-mono-gray group-hover:text-mono-amber-strong" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
