import Link from 'next/link';
import { ArrowRight, Bookmark, Download, FileText, LockKeyhole } from 'lucide-react';
import Navigation from '../components/Navigation';
import { StatStrip } from '../components/dataviz/Charts';
import { getAllReports } from '../../lib/reports';

const STATUS_LABEL: Record<string, string> = {
  live: 'LIVE',
  'in-development': 'IN DEVELOPMENT',
  planned: 'PLANNED',
};

const productTiers = [
  {
    name: 'OPEN SIGNAL BRIEFINGS',
    copy: 'Public, beautifully designed reads that establish Monokromatik’s point of view and create shareable value.',
    icon: Bookmark,
  },
  {
    name: 'PREMIUM REPORTS',
    copy: 'Structured intelligence for brand, agency and creative leaders requiring deeper market and campaign insight.',
    icon: FileText,
  },
  {
    name: 'PARTNER EDITIONS',
    copy: 'Bespoke research and collectible issues developed with relevant brands, institutions or cultural properties under clear disclosure.',
    icon: LockKeyhole,
  },
];

export default function ReportsPage() {
  const reports = getAllReports();
  const liveCount = reports.filter((r) => r.status === 'live').length;
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_350px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / REPORTS</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Insight worth<br /><span className="text-mono-amber">keeping.</span></h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">A future library of designed briefings, dossiers and collectible editions turning African creative intelligence into decision-grade reading.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <Download className="text-mono-amber mb-6" size={27} />
            <p className="font-display text-2xl font-bold leading-tight">Read digitally. Save deliberately. Print eventually.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">FIRST EDITIONS</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">The commissioning slate.</h2>
            </div>
            <p className="max-w-sm text-sm text-mono-gray font-body">These editions are in development; the library becomes populated as verified research and original editorial work are completed.</p>
          </div>
          <div className="mb-10">
            <StatStrip
              tone="light"
              items={[
                { value: String(reports.length), label: reports.length === 1 ? 'Edition commissioned' : 'Editions commissioned' },
                { value: String(liveCount), label: liveCount === 1 ? 'Edition live' : 'Editions live' },
                { value: '100%', label: 'Source-verified standard' },
              ]}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Link key={report.slug} href={`/reports/${report.slug}`} className="group bg-mono-white border border-mono-gray/25 p-8 md:p-9 min-h-[330px] flex flex-col justify-between hover:border-mono-amber transition-colors">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber-strong">{report.series}</p>
                    <span className="text-[9px] tracking-[0.2em] px-2.5 py-1 bg-mono-black text-mono-white font-display font-bold">{STATUS_LABEL[report.status] ?? report.status.toUpperCase()}</span>
                  </div>
                  <h3 className="mt-8 text-3xl font-display font-bold text-mono-black leading-tight group-hover:text-mono-amber transition-colors">{report.title}</h3>
                  <p className="mt-5 text-mono-charcoal font-body leading-relaxed">{report.summary}</p>
                </div>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {report.tags.map((tag) => <span key={tag} className="border border-mono-gray/30 px-3 py-2 text-[10px] font-display font-bold tracking-[0.16em]">{tag.toUpperCase()}</span>)}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-mono-gray font-body">{report.access === 'open' ? 'Open Signal Briefing' : report.access === 'premium' ? 'Premium Report' : 'Partner Edition'}{report.statusNote ? ` · ${report.statusNote}` : ''}</p>
                    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.16em] font-display font-bold text-mono-amber-strong group-hover:text-mono-amber-hover whitespace-nowrap">{report.status === 'live' ? 'READ' : 'PREVIEW'} <ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">PRODUCT LADDER</p>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-display font-bold text-mono-black mb-12">From public authority to premium intelligence.</h2>
          <div className="grid lg:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
            {productTiers.map(({ name, copy, icon: Icon }) => (
              <article key={name} className="bg-mono-white p-8 min-h-[275px] flex flex-col justify-between">
                <Icon className="text-mono-amber" size={25} />
                <div><h3 className="text-xl font-display font-bold text-mono-black">{name}</h3><p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">The reports should become the reason professionals return.</h2>
          <p className="mt-7 text-lg font-body text-mono-soft-white">The next content phase is to commission the first four pieces, build their evidence packs and art-direct the first downloadable edition.</p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/intelligence/source-desk" className="inline-flex gap-2 items-center bg-mono-amber px-7 py-4 font-display font-bold">VIEW SOURCE DESK <ArrowRight size={18} /></Link>
            <Link href="/issues" className="inline-flex gap-2 items-center border border-mono-white px-7 py-4 font-display font-bold">VIEW ISSUES <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
