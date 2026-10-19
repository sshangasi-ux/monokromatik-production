import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navigation from '../../components/Navigation';
import SponsorSlot from '../../components/SponsorSlot';
import {
  getOwnership100,
  getOwnership100Entries,
  getOwnership100Tally,
  type OwnershipStatus,
} from '../../../lib/ownership100';

const SITE = 'https://www.monokromatik.com';
const URL = `${SITE}/ownership-100/findings`;

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const doc = getOwnership100();
  const t = getOwnership100Tally();
  const title = `The Ownership 100 — ${doc.edition} Findings | MonoKromatik`;
  const desc = `Across Africa's ${doc.target} most valuable brands: ${t.Retained} are African-owned and ${t.Exported} are now controlled offshore. Africa keeps its banks and its backbone, and loses the brands closest to daily life. The ${doc.edition} findings.`;
  return {
    title,
    description: desc,
    keywords: ['who owns africa', 'african brand ownership', 'value capture', 'ownership 100 findings', 'african brands foreign owned'],
    authors: [{ name: 'MonoKromatik Network' }],
    alternates: { canonical: URL },
    openGraph: { title: `The Ownership 100 — ${doc.edition} Findings`, description: desc, url: URL, type: 'article' },
    twitter: { card: 'summary_large_image', title: `The Ownership 100 — ${doc.edition} Findings`, description: desc },
  };
}

// Count a sector cohort by status, by matching the sector label's leading word
// (entries carry compound sectors like "Telecoms · Fintech"; the lead word is
// the primary sector). Returns {total, retained, exported, contested, brands}.
function cohort(
  entries: ReturnType<typeof getOwnership100Entries>,
  test: (sector: string) => boolean,
) {
  const rows = entries.filter((e) => test((e.sector || '').toLowerCase()));
  const by = (s: OwnershipStatus) => rows.filter((r) => r.status === s).length;
  return {
    total: rows.length,
    retained: by('Retained'),
    exported: by('Exported'),
    contested: by('Contested'),
    brands: rows,
  };
}

export default function FindingsPage() {
  const doc = getOwnership100();
  const entries = getOwnership100Entries();
  const t = getOwnership100Tally();
  const n = entries.length;
  const pct = (x: number) => Math.round((x / n) * 100);

  const top10 = entries.slice(0, 10);
  const topExported = top10.filter((e) => e.status === 'Exported');

  const banking = cohort(entries, (s) => s.startsWith('banking'));
  const backbone = cohort(entries, (s) => /^(banking|energy|aviation|insurance|industrials|utilit)/.test(s));
  const consumer = cohort(entries, (s) => /^(drinks|food|beauty|music|spirits|consumer)/.test(s));
  const consumerAfrican = consumer.retained;
  const fintech = cohort(entries, (s) => s.startsWith('fintech'));

  const report = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    headline: `The Ownership 100 — ${doc.edition} Findings`,
    description: `${t.Retained} of Africa's ${doc.target} most valuable brands are African-owned; ${t.Exported} are controlled offshore.`,
    datePublished: doc.updatedAt,
    url: URL,
    mainEntityOfPage: URL,
    isBasedOn: `${SITE}/ownership-100`,
    inLanguage: 'en',
    keywords: ['who owns Africa', 'African brand ownership', 'value capture', 'ownership ranking'],
    author: { '@type': 'Organization', name: 'MonoKromatik' },
    publisher: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
  };

  const stat = (value: string, label: string, tone?: 'exp' | 'ret' | 'con') => (
    <div className="flex-1 min-w-[130px] border border-mono-white/15 bg-mono-black px-5 py-6">
      <p
        className={`font-feature font-bold text-4xl md:text-5xl tabular-nums ${
          tone === 'exp' ? 'text-mono-amber' : tone === 'ret' ? 'text-emerald-400' : 'text-mono-white'
        }`}
      >
        {value}
      </p>
      <p className="mt-2 font-display text-[11px] font-bold tracking-[0.18em] uppercase text-mono-gray-bright">{label}</p>
    </div>
  );

  const Finding = ({
    kicker,
    head,
    children,
  }: {
    kicker: string;
    head: string;
    children: React.ReactNode;
  }) => (
    <section className="border-t border-mono-gray/20 pt-10">
      <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-3">{kicker}</p>
      <h2 className="font-feature text-3xl md:text-4xl font-bold text-mono-black leading-[1.05] text-balance max-w-3xl">{head}</h2>
      <div className="mt-5 space-y-4 text-lg text-mono-charcoal font-body leading-relaxed max-w-[68ch]">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(report) }} />
      <Navigation />

      {/* Hero */}
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/ownership-100"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-10"
          >
            THE OWNERSHIP 100
          </Link>
          <p className="font-display text-[11px] font-bold tracking-[0.3em] text-mono-amber-bright uppercase">
            {doc.edition} · The Findings
          </p>
          <h1 className="mt-6 font-feature text-5xl md:text-7xl font-bold leading-[0.96]">
            Africa keeps its banks.<br />It&rsquo;s losing its culture.
          </h1>
          <p className="mt-7 max-w-2xl text-xl md:text-2xl text-mono-soft-white font-feature italic leading-snug">
            Across the {doc.target} most valuable brands on the continent, {t.Retained} are African-owned and {t.Exported} are
            now controlled offshore. The split is not random — Africa holds its banks, its energy and its backbone,
            and loses the brands closest to daily life.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {stat(String(n), 'brands ranked')}
            {stat(`${t.Retained}`, `retained · ${pct(t.Retained)}%`, 'ret')}
            {stat(`${t.Exported}`, `exported · ${pct(t.Exported)}%`, 'exp')}
            {stat(`${t.Contested}`, `contested · ${pct(t.Contested)}%`, 'con')}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-12">
        <Finding kicker="Finding 01 · The base is held" head="The money and the backbone stay African-owned.">
          <p>
            Where the continent builds its foundations, it keeps the equity. <strong>{banking.retained} of the {banking.total} banks</strong> in
            the ledger are African-owned, and the pattern holds across energy, aviation, insurance and heavy
            industry — <strong>{backbone.retained} of the {backbone.total}</strong> brands in that backbone sit in
            domestic hands. The institutions that hold Africa&rsquo;s savings and move its people are the ones Africa
            still controls.
          </p>
        </Finding>

        <Finding kicker="Finding 02 · The top is exported" head={`${topExported.length} of the ten most valuable brands are controlled offshore.`}>
          <p>
            Rank the continent&rsquo;s brands by reach and value at stake and the summit belongs to someone else:{' '}
            <strong>{topExported.map((e) => e.brand).join(', ')}</strong> all sit under foreign control. The bigger the
            brand, the less likely Africa owns it — visibility and ownership have come apart at the very top.
          </p>
        </Finding>

        <Finding kicker="Finding 03 · Value leaks where you consume" head="The culture Africa authors, it does not own.">
          <p>
            The drift concentrates in the brands closest to daily life. Of the drinks, food, beauty and music brands in
            the ledger, only <strong>{consumerAfrican}</strong> are African-owned — the drink in the glass, the sound on
            the playlist and the product on the shelf are overwhelmingly foreign-held. Authorship stayed on the
            continent; the balance sheet went home with someone else.
          </p>
        </Finding>

        <Finding kicker="Finding 04 · The contested front" head="Fintech is the one sector still in play.">
          <p>
            Almost everywhere else, ownership has settled. Fintech has not: of {fintech.total} entries,{' '}
            <strong>{fintech.retained} are retained, {fintech.exported} exported and {fintech.contested} contested</strong> —
            the highest live-ownership count on the board. It is the sector where the next decade of African
            value-capture is still being decided.
          </p>
        </Finding>

        {/* Sponsor */}
        <div className="pt-2">
          <SponsorSlot placement="ownership-100" offer tone="light" />
        </div>

        {/* Where next */}
        <section className="border-t border-mono-gray/20 pt-10">
          <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-5">Go deeper</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ownership-100"
              className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors"
            >
              THE FULL RANKED LEDGER <ArrowRight size={16} />
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-white transition-colors"
            >
              THE SECTOR LEAGUE TABLES <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/intelligence/value"
              className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-white transition-colors"
            >
              VALUE AN ASSET <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-7 text-[13px] font-body text-mono-gray leading-relaxed max-w-[68ch]">
            Figures are computed live from The Ownership 100 ({doc.edition}); every entry is traceable to a named
            source. See the{' '}
            <Link href="/ownership-100#methodology" className="text-mono-amber-strong hover:text-mono-amber-hover underline underline-offset-2">
              ranking methodology
            </Link>
            . The edition is revised annually as ownership moves.
          </p>
        </section>
      </main>
    </div>
  );
}
