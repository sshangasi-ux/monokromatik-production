import Link from 'next/link';
import { ArrowRight, Check, Download, FileText, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import { StatStrip } from '../components/dataviz/Charts';
import ReportsShelf from '../components/reports/ReportsShelf';
import AdvisoryBridge from '../components/AdvisoryBridge';
import BuyButton from '../components/BuyButton';
import { getAllReports, getReportBySlug } from '../../lib/reports';
import {
  membershipsLive,
  reportPrice,
  reportLaunchNote,
  reportCheckoutUrl,
  getBundle,
} from '../../lib/commerce';
import { toReportCard, sectorFacets, tierCounts } from '../../lib/report-merch';

export const metadata = {
  title: 'Reports — The Intelligence Library | MonoKromatik',
  description:
    'Designed, source-verified intelligence on who owns and who captures the value in African culture — music, sport, fashion, money, media. Free briefings and paid value-capture reports from R220.',
};

// The three curated entry points — the shop leads with these.
const STARTERS = [
  {
    slug: 'who-captures-amapiano-value-capture-report',
    kicker: 'START HERE · THE ENTRY STUDY',
    why: 'The best first read — the value-capture lens on one culture, for the price of lunch.',
  },
  {
    slug: 'whos-buying-african-sport-2026',
    kicker: 'THE INSTITUTIONAL FLAGSHIP',
    why: 'The full framework-led read: a bottom-up leakage model, a named deal ledger and the 2035 scenarios.',
  },
] as const;

function OgCover({ slug, title }: { slug: string; title: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/reports/${slug}/opengraph-image`}
      alt={`${title} — report cover`}
      loading="lazy"
      className="aspect-[1200/630] w-full object-cover"
    />
  );
}

export default function ReportsPage() {
  const reports = getAllReports();
  const cards = reports.map(toReportCard);
  const liveCount = reports.filter((r) => r.status === 'live').length;
  const facets = sectorFacets(cards);
  const counts = tierCounts(cards);
  // The storefront's type filter is a 3-way All / To buy / Free to read, where
  // "free to read" means everything that isn't a paid PDF (premium + open) — so
  // the badge count must match that filter, not the open-only tier count.
  const typeCounts = { all: counts.all, paid: counts.paid, free: counts.all - counts.paid };
  const gated = membershipsLive();
  const fullShelf = getBundle('full-shelf');

  return (
    <div className="min-h-screen bg-mono-soft-white">
      <Navigation />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_340px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">
              INTELLIGENCE / THE REPORT LIBRARY
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">
              Who owns it.<br />
              <span className="text-mono-amber">Who keeps the money.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">
              {liveCount} designed, source-verified reports on who authors African culture — and who
              captures its value. Across music, sport, fashion, money and media. Read the free
              briefings; buy the value-capture studies from R220.
            </p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <Download className="text-mono-amber mb-6" size={27} />
            <p className="font-display text-2xl font-bold leading-tight">
              Read digitally. Buy the deep ones. Keep them for good.
            </p>
          </div>
        </div>
      </section>

      {/* ── Start here (curated trio) ──────────────────────────── */}
      <section className="bg-mono-white py-16 md:py-20 border-b border-mono-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">START HERE</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
                Three ways in.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-mono-gray font-body">
              Not sure where to begin? Start with the study, step up to the flagship, or take the
              whole shelf at the price of the flagship alone.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {STARTERS.map(({ slug, kicker, why }) => {
              const r = getReportBySlug(slug);
              if (!r) return null;
              const price = reportPrice(slug);
              const launch = reportLaunchNote(slug);
              const checkout = reportCheckoutUrl(slug);
              return (
                <div
                  key={slug}
                  className="flex flex-col border border-mono-gray/25 bg-mono-white overflow-hidden group"
                >
                  <Link href={`/reports/${slug}`} className="block overflow-hidden">
                    <OgCover slug={slug} title={r.title} />
                  </Link>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-mono-amber-strong">
                      {kicker}
                    </p>
                    <Link href={`/reports/${slug}`}>
                      <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-mono-black group-hover:text-mono-amber transition-colors">
                        {r.title}
                      </h3>
                    </Link>
                    <p className="mt-3 font-body text-mono-charcoal leading-relaxed flex-1">{why}</p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl font-bold text-mono-black tabular-nums">{price}</p>
                        {launch && <p className="text-[11px] text-mono-gray font-body">{launch}</p>}
                      </div>
                      <Link
                        href={`/reports/${slug}`}
                        className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-5 py-3 font-display text-xs font-bold tracking-[0.14em] whitespace-nowrap hover:bg-mono-amber hover:text-mono-black transition-colors"
                      >
                        OPEN REPORT <ArrowRight size={14} />
                      </Link>
                    </div>
                    {checkout && (
                      <BuyButton
                        href={checkout}
                        slug={slug}
                        price={price}
                        className="mt-3 text-center text-[11px] font-display font-bold tracking-[0.16em] text-mono-amber-strong hover:text-mono-amber-hover"
                      >
                        OR BUY THE PDF NOW →
                      </BuyButton>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Best value — the Full Shelf bundle */}
            {fullShelf && (
              <div className="flex flex-col border border-mono-amber bg-mono-black text-mono-white overflow-hidden">
                <div className="aspect-[1200/630] w-full bg-gradient-to-br from-mono-amber/25 to-mono-black flex items-center justify-center p-8">
                  <p className="font-display text-3xl font-bold text-center leading-tight">
                    The complete<br />value-capture library.
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-mono-amber">
                    BEST VALUE · THE FULL SHELF
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{fullShelf.title}</h3>
                  <p className="mt-3 font-body text-mono-soft-white leading-relaxed flex-1">
                    {fullShelf.saveNote} — every value-capture study plus the flagship, one price.
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <p className="font-display text-2xl font-bold tabular-nums">{fullShelf.price}</p>
                    <Link
                      href="/bundles"
                      className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-5 py-3 font-display text-xs font-bold tracking-[0.14em] whitespace-nowrap hover:bg-mono-white transition-colors"
                    >
                      VIEW BUNDLES <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Bundles banner ─────────────────────────────────────── */}
      <section className="bg-mono-amber text-mono-black py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-display font-bold text-sm sm:text-base">
            Buy the value-capture reports together and save — the Ownership Studies and the Full Shelf.
          </p>
          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-5 py-2.5 font-display font-bold text-sm whitespace-nowrap"
          >
            VIEW BUNDLES <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── The full shelf (filterable) ────────────────────────── */}
      <section className="py-16 md:py-20 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE LIBRARY</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">
                The whole shelf.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-mono-gray font-body">
              Every live report, filterable by topic and by whether it is free to read or a paid
              study. All source-verified, all built to be kept.
            </p>
          </div>
          <div className="mb-12">
            <StatStrip
              tone="light"
              items={[
                { value: String(liveCount), label: 'Reports live' },
                { value: String(facets.length), label: 'Topics covered' },
                { value: 'From R220', label: 'Paid value-capture studies' },
                { value: '100%', label: 'Source-verified standard' },
              ]}
            />
          </div>

          <ReportsShelf items={cards} sectors={facets} typeCounts={typeCounts} gated={gated} />
        </div>
      </section>

      {/* ── The ladder (concrete pricing) ──────────────────────── */}
      <section className="bg-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE LADDER</p>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-display font-bold text-mono-black mb-12">
            From a free read to the institutional flagship.
          </h2>
          <div className="grid lg:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
            {[
              {
                icon: FileText,
                price: 'Free',
                name: 'OPEN BRIEFINGS',
                copy: 'Public, designed reads that set our point of view — the Will-It-Land dossiers, league tables and market briefings.',
              },
              {
                icon: Download,
                price: 'From R220',
                name: 'VALUE-CAPTURE STUDIES',
                copy: 'The paid PDFs — one topic, the full ownership lens, delivered watermarked and built to keep. Amapiano, the Springbok, the Scorecard.',
              },
              {
                icon: Mail,
                price: 'R3,500 · enterprise from $1,500',
                name: 'THE FLAGSHIP + ADVISORY',
                copy: 'The institutional report with its data, model and 2035 scenarios — and the option to add a team briefing, the dataset or a licence.',
              },
            ].map(({ icon: Icon, price, name, copy }) => (
              <article key={name} className="bg-mono-white p-8 min-h-[290px] flex flex-col justify-between">
                <Icon className="text-mono-amber" size={25} />
                <div>
                  <p className="font-display text-sm font-bold text-mono-amber-strong tabular-nums">{price}</p>
                  <h3 className="mt-1 text-xl font-display font-bold text-mono-black">{name}</h3>
                  <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product → advisory bridge ──────────────────────────── */}
      <AdvisoryBridge source="reports-advisory-bridge" />

      {/* ── Close ──────────────────────────────────────────────── */}
      <section className="bg-mono-black text-mono-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Intelligence worth returning for.
          </h2>
          <p className="mt-7 text-lg font-body text-mono-soft-white">
            Start with a free briefing, keep a value-capture study, or take the whole shelf. Every
            report is built on named sources and designed to be used.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/bundles" className="inline-flex gap-2 items-center bg-mono-amber text-mono-black px-7 py-4 font-display font-bold">
              SEE THE BUNDLES <ArrowRight size={18} />
            </Link>
            <Link href="/ownership-100" className="inline-flex gap-2 items-center border border-mono-white px-7 py-4 font-display font-bold">
              THE OWNERSHIP 100 <ArrowRight size={18} />
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 justify-center text-sm font-body text-mono-soft-white/80">
            <li className="inline-flex items-center gap-2"><Check size={15} className="text-mono-amber" /> Source-verified</li>
            <li className="inline-flex items-center gap-2"><Check size={15} className="text-mono-amber" /> Secure Paystack checkout</li>
            <li className="inline-flex items-center gap-2"><Check size={15} className="text-mono-amber" /> Delivered as a watermarked PDF</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
