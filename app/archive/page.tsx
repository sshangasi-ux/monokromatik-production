import type { Metadata } from 'next';
import Navigation from '../components/Navigation';
import { buildArchive, archiveYears, ARCHIVE_KINDS } from '../../lib/archive';
import ArchiveExplorer from './ArchiveExplorer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'The Archive | MonoKromatik Network',
  description:
    'One searchable, filterable index of everything on MonoKromatik — Signal Brand Reads, Intelligence case studies, Reports, Issues and Culture — by date, theme and Cultural-Signal score.',
  alternates: { canonical: 'https://www.monokromatik.com/archive' },
  openGraph: {
    title: 'The Archive | MonoKromatik Network',
    description:
      'Every Brand Read, case study, report and issue in one searchable catalogue — African & Diaspora brand intelligence.',
    url: 'https://www.monokromatik.com/archive',
  },
};

export default function ArchivePage() {
  const entries = buildArchive();
  const years = archiveYears(entries);

  const counts = ARCHIVE_KINDS.map((k) => ({
    kind: k,
    n: entries.filter((e) => e.kind === k).length,
  })).filter((c) => c.n > 0);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">THE ARCHIVE</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">
              Everything we&rsquo;ve
              <br />
              <span className="text-mono-amber">published.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
              One catalogue across every lane — Signal, Intelligence, Reports, Issues and Culture.
              Search by brand or theme, filter by section or year, and sort by recency or
              Cultural-Signal score.
            </p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <p className="text-6xl font-display font-bold text-mono-amber leading-none">{entries.length}</p>
            <p className="mt-3 text-sm font-body text-mono-soft-white">
              entries and counting — every claim sourced, every score earned.
            </p>
            <div className="mt-6 space-y-1.5">
              {counts.map((c) => (
                <div key={c.kind} className="flex items-baseline justify-between text-[11px] font-display tracking-[0.14em]">
                  <span className="text-mono-soft-white/80 uppercase">{c.kind}</span>
                  <span className="text-mono-white tabular-nums">{c.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArchiveExplorer entries={entries} years={years} />
        </div>
      </section>
    </div>
  );
}
