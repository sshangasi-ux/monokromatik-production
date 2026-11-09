import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import PrintButton from './PrintButton';
import { getOwnership100, getOwnership100Entries, getOwnership100Tally, type OwnershipStatus } from '../../lib/ownership100';

const URL = 'https://www.monokromatik.com/ownership-map';
const doc = getOwnership100();

export const metadata: Metadata = {
  title: 'The African Ownership Map — Who Owns Africa’s Most Valuable Brands | MonoKromatik',
  description:
    'A one-page map of who owns — and who keeps the money behind — Africa’s most valuable brands. Drawn directly from The Ownership 100 ledger: every brand tagged Retained, Exported or Contested, every entry sourced. Free. Print or save as PDF.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'The African Ownership Map',
    description: 'One page. Africa’s most valuable brands, by who really owns them. Every entry sourced.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

// The map is the lead magnet. It is NOT a new dataset — it is a printable,
// single-surface rendering of the live Ownership-100 ledger (lib/ownership100),
// so it can never drift from or embellish the sourced data. Readers reach it
// after joining The Weekly Signal; the page is public so a direct visit or a
// shared link still works (the underlying data already ships at /api/index).

const STATUS_META: Record<OwnershipStatus, { dot: string; label: string; blurb: string }> = {
  Retained: { dot: 'bg-emerald-500', label: 'Retained', blurb: 'African-owned — the value stays on the continent.' },
  Exported: { dot: 'bg-mono-amber', label: 'Exported', blurb: 'Controlling equity now sits offshore.' },
  Contested: { dot: 'bg-mono-black', label: 'Contested', blurb: 'Ownership is live, mixed, or being brought home.' },
};

const ORDER: OwnershipStatus[] = ['Exported', 'Contested', 'Retained'];

export default function OwnershipMapPage() {
  const entries = getOwnership100Entries();
  const tally = getOwnership100Tally();
  const total = entries.length;
  const foreign = entries.filter((e) => e.ownership === 'foreign').length;

  return (
    <div className="min-h-screen bg-mono-paper">
      <div className="print:hidden">
        <Navigation />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Masthead */}
        <div className="print:hidden mb-6">
          <Link href="/ownership-100" className="inline-flex items-center gap-2 text-sm font-display font-bold text-mono-charcoal hover:text-mono-black transition-colors">
            <ArrowLeft size={15} /> The full Ownership 100 ledger
          </Link>
        </div>

        <header className="border-b-4 border-mono-black pb-6 mb-8">
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber-strong mb-3">
            MONOKROMATIK · {doc.edition.toUpperCase()}
          </p>
          <h1 className="text-4xl md:text-6xl font-feature font-bold leading-[0.95] text-mono-black">
            The African Ownership Map
          </h1>
          <p className="max-w-3xl mt-4 text-base md:text-lg text-mono-charcoal font-feature leading-snug">
            Africa’s {total} most valuable brands, on one page — sorted by who really owns them.
            Drawn directly from The Ownership 100. Every entry is traceable to a source.
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3 text-sm font-display font-bold">
            <span><span className="text-3xl text-emerald-600 tabular-nums">{tally.Retained}</span> <span className="text-mono-charcoal ml-1">retained</span></span>
            <span><span className="text-3xl text-mono-amber-strong tabular-nums">{tally.Exported}</span> <span className="text-mono-charcoal ml-1">exported</span></span>
            <span><span className="text-3xl text-mono-black tabular-nums">{tally.Contested}</span> <span className="text-mono-charcoal ml-1">contested</span></span>
            <span className="text-mono-gray font-body font-normal">
              {foreign} of {total} are foreign-controlled
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <PrintButton />
            <a
              href="/api/index?format=csv"
              className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-white transition-colors"
            >
              DOWNLOAD THE DATA (CSV)
            </a>
          </div>
        </header>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {ORDER.map((s) => (
            <div key={s} className="flex items-start gap-3 border border-mono-gray/40 bg-mono-white px-4 py-3">
              <span className={`mt-1.5 inline-block w-3 h-3 ${STATUS_META[s].dot}`} />
              <span>
                <span className="block font-display font-bold text-mono-black text-sm">{STATUS_META[s].label}</span>
                <span className="block text-mono-charcoal font-body text-xs leading-snug">{STATUS_META[s].blurb}</span>
              </span>
            </div>
          ))}
        </div>

        {/* The map — grouped by status, ranked within */}
        {ORDER.map((status) => {
          const group = entries.filter((e) => e.status === status);
          if (group.length === 0) return null;
          return (
            <section key={status} className="mb-10 break-inside-avoid">
              <h2 className="flex items-center gap-2 text-lg font-display font-bold text-mono-black mb-3 border-b border-mono-black/20 pb-2">
                <span className={`inline-block w-3 h-3 ${STATUS_META[status].dot}`} />
                {STATUS_META[status].label}
                <span className="text-mono-gray font-body font-normal text-sm">· {group.length} brands</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs tracking-wider font-display font-bold text-mono-gray">
                      <th className="py-1.5 pr-3 w-10">#</th>
                      <th className="py-1.5 pr-3">Brand</th>
                      <th className="py-1.5 pr-3 hidden sm:table-cell">Sector</th>
                      <th className="py-1.5 pr-3">Owner</th>
                      <th className="py-1.5 pr-3">Owner country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((e) => (
                      <tr key={e.rank} className="border-t border-mono-gray/25 align-top">
                        <td className="py-1.5 pr-3 tabular-nums text-mono-gray font-display font-bold">{e.rank}</td>
                        <td className="py-1.5 pr-3 font-display font-bold text-mono-black">
                          {e.articleSlug ? (
                            <Link href={`/article/${e.articleSlug}`} className="hover:text-mono-amber-strong transition-colors print:text-mono-black">
                              {e.brand}
                            </Link>
                          ) : (
                            e.brand
                          )}
                        </td>
                        <td className="py-1.5 pr-3 text-mono-charcoal hidden sm:table-cell">{e.sector}</td>
                        <td className="py-1.5 pr-3 text-mono-charcoal">{e.owner}</td>
                        <td className="py-1.5 pr-3 text-mono-charcoal">{e.ownerCountry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {/* Methodology + provenance — the map is sourced, never asserted */}
        <footer className="mt-12 pt-6 border-t-2 border-mono-black">
          <h3 className="font-display font-bold text-mono-black text-sm mb-2">How this map is built</h3>
          <p className="text-mono-charcoal font-body text-sm leading-relaxed max-w-3xl">{doc.methodology}</p>
          <p className="mt-4 text-mono-gray font-body text-xs">
            Source: The Ownership 100, {doc.edition}, MonoKromatik — updated {doc.updatedAt}. Linked brands open the
            underlying Who’s Buying Africa file. © MonoKromatik ·{' '}
            <Link href="/ownership-100" className="underline hover:text-mono-black">monokromatik.com/ownership-100</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
