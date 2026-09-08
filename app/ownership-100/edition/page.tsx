import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import PrintButton from '../../components/PrintButton';
import ShareRow from '../../components/ShareRow';
import { getOwnership100, getOwnership100Entries, getOwnership100Tally } from '../../../lib/ownership100';

const URL = 'https://www.monokromatik.com/ownership-100/edition';
const doc = getOwnership100();

export const metadata: Metadata = {
  title: 'The Ownership 100 — The Print Edition | MonoKromatik',
  description:
    'The print/PDF edition of The Ownership 100 — the ranked ledger of who owns Africa’s most valuable brands. Designed to save as a PDF and share.',
  alternates: { canonical: URL },
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

/** Print-first edition. Styled for @media print so a reader can Save as PDF and
 *  get a clean, designed, shareable document — and the same layout reads well on
 *  screen. Monochrome by design; the ledger is the object. */
export default function Ownership100Edition() {
  const entries = getOwnership100Entries();
  const tally = getOwnership100Tally();

  return (
    <div className="edition min-h-screen bg-mono-white text-mono-black">
      <style>{`
        .edition { --ink:#111; }
        @media print {
          @page { margin: 16mm 14mm; }
          .no-print { display: none !important; }
          .edition { background: #fff !important; }
          .ed-row { break-inside: avoid; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="no-print bg-mono-black text-mono-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/ownership-100" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright">
            <ArrowLeft size={14} /> THE OWNERSHIP 100
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <PrintButton source="ownership-100-edition" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Masthead */}
        <div className="border-b-2 border-mono-black pb-6 mb-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs tracking-[0.34em] font-display font-bold">MONOKROMATIK</p>
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-charcoal">{doc.edition.toUpperCase()}</p>
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-feature font-bold leading-[0.95]">{doc.title}</h1>
          <p className="mt-5 text-lg md:text-xl font-feature leading-snug text-mono-charcoal max-w-3xl">{doc.standfirst}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm font-display font-bold">
            <span>{tally.Retained} RETAINED</span>
            <span>{tally.Exported} EXPORTED</span>
            <span>{tally.Contested} CONTESTED</span>
            <span className="text-mono-charcoal">{doc.cohortSize} OF {doc.target} MAPPED</span>
          </div>
        </div>

        {/* Ledger */}
        <ol className="border-t border-mono-black/20">
          {entries.map((e) => (
            <li key={e.rank} className="ed-row grid grid-cols-[2.25rem_1fr] gap-x-4 py-4 border-b border-mono-black/15 items-baseline">
              <span className="text-xl md:text-2xl font-feature font-bold tabular-nums">{e.rank}</span>
              <div>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-lg md:text-xl font-display font-bold">
                    {e.brand} <span className="text-mono-charcoal font-body text-sm">· {e.sector}</span>
                  </h2>
                  <span className="text-xs font-display font-bold">
                    {e.status.toUpperCase()} — {e.owner} ({e.ownerCountry})
                  </span>
                </div>
                <p className="mt-1 text-sm text-mono-charcoal font-body leading-snug">{e.note}</p>
                {e.sourceLabel && !e.articleSlug && (
                  <p className="mt-0.5 text-[11px] text-mono-charcoal/70 font-body italic">Source: {e.sourceLabel}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Methodology */}
        <div className="mt-8 pt-6 border-t-2 border-mono-black">
          <p className="text-[10px] tracking-[0.3em] font-display font-bold mb-3">METHODOLOGY</p>
          <p className="text-sm text-mono-charcoal font-body leading-relaxed">{doc.methodology}</p>
          <p className="mt-6 text-xs tracking-[0.14em] font-display font-bold text-mono-charcoal">
            © MONOKROMATIK · MONOKROMATIK.COM/OWNERSHIP-100 · UPDATED {doc.updatedAt}
          </p>
        </div>

        {/* Screen-only share */}
        <div className="no-print mt-10">
          <ShareRow url="https://www.monokromatik.com/ownership-100" text="The Ownership 100 — who really owns Africa’s most valuable brands, ranked and sourced." source="ownership-100-edition" />
        </div>
      </div>
    </div>
  );
}
