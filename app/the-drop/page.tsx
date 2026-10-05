import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import ShareRow from '../components/ShareRow';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAllArticles, getReadingTime } from '../../lib/articles';
import { getLiveReports } from '../../lib/reports';
import { getAcquisitions, VERDICT_LABEL, type Verdict } from '../../lib/acquisitions';

const SITE = 'https://www.monokromatik.com';
const URL = `${SITE}/the-drop`;

export const metadata: Metadata = {
  title: 'The Drop — the week in African ownership | MonoKromatik',
  description:
    'The week in African ownership, built to forward. Who moved, who bought whom, and what it means — the best of MonoKromatik in a five-minute read, made for your phone.',
  alternates: { canonical: URL },
  openGraph: { title: 'The Drop — the week in African ownership', url: URL, type: 'website' },
};

// Refresh a few times a day so the drop always reflects the newest content.
export const revalidate = 3600;

const VERDICT_TAG: Record<Verdict, string> = {
  exported: 'border-mono-amber/60 text-mono-amber-strong bg-mono-amber/10',
  retained: 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10',
  mixed: 'border-mono-gray/40 text-mono-charcoal bg-mono-gray/10',
};

function editionLabel(d = new Date()): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TheDropPage() {
  const articles = getAllArticles();
  const lead = articles[0];
  const dispatches = articles.slice(1, 6);
  const reports = [...getLiveReports()]
    .filter((r) => r.publishedAt)
    .sort((a, b) => +new Date(b.publishedAt!) - +new Date(a.publishedAt!))
    .slice(0, 3);
  const deals = [...getAcquisitions()]
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
    .slice(0, 3);

  const shareText = 'The Drop — the week in African ownership, from MonoKromatik:';

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      {/* ── Masthead ───────────────────────────────────────────── */}
      <header className="bg-mono-black text-mono-white">
        <div className="mx-auto max-w-2xl px-5 py-12 md:py-16 text-center">
          <p className="font-display text-sm font-bold tracking-[0.3em] text-mono-gray-bright">
            MONO<span className="text-mono-amber">KROMATIK</span>
          </p>
          <h1 className="mt-6 font-feature text-6xl md:text-7xl font-bold leading-[0.92]">
            The Drop
          </h1>
          <p className="mt-5 font-display text-[11px] font-bold tracking-[0.3em] text-mono-amber uppercase">
            The week in African ownership · {editionLabel()}
          </p>
          <p className="mx-auto mt-5 max-w-md font-body text-lg text-mono-soft-white">
            Who moved, who bought whom, and what it means — the best of the week in a five-minute
            read, built for your phone and made to forward.
          </p>
          <div className="mt-8 flex justify-center">
            <ShareRow url={URL} text={shareText} source="the-drop-top" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12 md:py-14 space-y-14">
        {/* ── The lead ─────────────────────────────────────────── */}
        {lead && (
          <section>
            <p className="font-display text-[11px] font-bold tracking-[0.28em] text-mono-amber-strong uppercase mb-4">
              The Lead
            </p>
            <Link href={`/article/${lead.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-mono-charcoal">
                <MediaImage fill src={lead.imageUrl} alt={lead.title} zoomOnHover />
                <div className="absolute inset-0 bg-gradient-to-t from-mono-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 font-display text-[10px] font-bold tracking-[0.22em] text-mono-amber uppercase">
                  {lead.category}
                </span>
              </div>
              <h2 className="mt-5 font-feature text-3xl md:text-4xl font-bold leading-[1.02] text-mono-black group-hover:text-mono-amber-strong transition-colors">
                {lead.title}
              </h2>
            </Link>
            {lead.excerpt && (
              <p className="mt-4 font-body text-lg leading-relaxed text-mono-charcoal">{lead.excerpt}</p>
            )}
            <Link
              href={`/article/${lead.slug}`}
              className="mt-4 inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.12em] text-mono-black hover:text-mono-amber-strong"
            >
              READ IT · {getReadingTime(lead.content)} MIN <ArrowRight size={15} />
            </Link>
          </section>
        )}

        {/* ── The reports ──────────────────────────────────────── */}
        {reports.length > 0 && (
          <section>
            <p className="font-display text-[11px] font-bold tracking-[0.28em] text-mono-amber-strong uppercase mb-5">
              Worth Keeping · The Reports
            </p>
            <div className="divide-y divide-mono-gray/20 border-y border-mono-gray/20">
              {reports.map((r) => (
                <Link key={r.slug} href={`/reports/${r.slug}`} className="group flex gap-4 py-5">
                  <div className="flex-1">
                    <p className="font-display text-[10px] font-bold tracking-[0.2em] text-mono-amber-strong uppercase">
                      {r.series}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold leading-snug text-mono-black group-hover:text-mono-amber-strong transition-colors">
                      {r.title}
                    </h3>
                    <p className="mt-2 font-body text-mono-charcoal leading-relaxed line-clamp-2">{r.summary}</p>
                  </div>
                  <ArrowUpRight className="shrink-0 mt-1 text-mono-gray group-hover:text-mono-amber-strong transition-colors" size={20} />
                </Link>
              ))}
            </div>
            <Link
              href="/reports"
              className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.12em] text-mono-amber-strong hover:text-mono-amber-hover"
            >
              BROWSE THE LIBRARY <ArrowRight size={15} />
            </Link>
          </section>
        )}

        {/* ── The dispatches ───────────────────────────────────── */}
        {dispatches.length > 0 && (
          <section>
            <p className="font-display text-[11px] font-bold tracking-[0.28em] text-mono-amber-strong uppercase mb-5">
              Also This Week · The Dispatches
            </p>
            <ul className="space-y-4">
              {dispatches.map((a) => (
                <li key={a.slug}>
                  <Link href={`/article/${a.slug}`} className="group flex items-baseline justify-between gap-4">
                    <div>
                      <span className="font-display text-[10px] font-bold tracking-[0.2em] text-mono-gray uppercase">
                        {a.category}
                      </span>
                      <p className="mt-1 font-display text-lg font-bold leading-snug text-mono-black group-hover:text-mono-amber-strong transition-colors">
                        {a.title}
                      </p>
                    </div>
                    <span className="shrink-0 font-body text-xs text-mono-gray tabular-nums">
                      {getReadingTime(a.content)}m
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── The ledger ───────────────────────────────────────── */}
        {deals.length > 0 && (
          <section>
            <p className="font-display text-[11px] font-bold tracking-[0.28em] text-mono-amber-strong uppercase mb-5">
              The Ownership Ledger · Who Bought Whom
            </p>
            <div className="space-y-4">
              {deals.map((d) => (
                <div key={d.id} className="border border-mono-gray/25 bg-mono-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-base font-bold text-mono-black">
                      {d.acquirer} <span className="text-mono-gray">→</span> {d.target}
                    </p>
                    <span className={`shrink-0 border px-2.5 py-1 font-display text-[9px] font-bold tracking-[0.16em] uppercase ${VERDICT_TAG[d.verdict]}`}>
                      {VERDICT_LABEL[d.verdict]}
                    </span>
                  </div>
                  <p className="mt-1 font-display text-[11px] tracking-[0.1em] text-mono-gray uppercase">
                    {d.sector} · {d.targetCountry} · {d.value}
                  </p>
                  <p className="mt-3 font-body text-mono-charcoal leading-relaxed">{d.read}</p>
                </div>
              ))}
            </div>
            <Link
              href="/whos-buying-africa"
              className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.12em] text-mono-amber-strong hover:text-mono-amber-hover"
            >
              THE FULL LEDGER <ArrowRight size={15} />
            </Link>
          </section>
        )}

        {/* ── Get it every week ────────────────────────────────── */}
        <section className="border-2 border-mono-black bg-mono-white p-7 md:p-9 shadow-[6px_6px_0_0_var(--mono-amber)]">
          <p className="font-display text-[11px] font-bold tracking-[0.3em] text-mono-amber-strong uppercase mb-3">
            Don&rsquo;t miss the next one
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-mono-black leading-tight">
            Get The Drop in your inbox, every week.
          </h2>
          <p className="mt-3 mb-5 font-body text-mono-charcoal">
            One short, designed read on who owns African culture and who keeps the money. Free. No noise.
          </p>
          <NewsletterSignup variant="sidebar" source="the-drop" />
        </section>

        {/* ── Forward it ───────────────────────────────────────── */}
        <section className="text-center">
          <p className="font-display text-lg font-bold text-mono-black">Know someone who should read this?</p>
          <p className="mt-1 mb-5 font-body text-mono-charcoal">The Drop grows by one forward at a time.</p>
          <div className="flex justify-center">
            <ShareRow url={URL} text={shareText} source="the-drop-bottom" />
          </div>
        </section>
      </main>
    </div>
  );
}
