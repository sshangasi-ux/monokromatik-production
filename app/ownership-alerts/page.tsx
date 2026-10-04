import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Bell, Check, Filter, Mail, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAcquisitions, getAcquisitionSummary, VERDICT_LABEL, type Verdict } from '../../lib/acquisitions';

const URL = 'https://www.monokromatik.com/ownership-alerts';

export const metadata: Metadata = {
  title: 'Ownership Alerts — African deal intelligence with a value-capture read | MonoKromatik',
  description:
    'The deal-intelligence feed for African brand ownership: every acquisition, catalogue sale and rights deal that moves value — with the value-capture read no bank provides. Join the waitlist.',
  keywords: ['African deal intelligence', 'African M&A alerts', 'value capture', 'who owns African brands', 'ownership tracker', 'African private equity intelligence'],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Ownership Alerts — African deal intelligence',
    description: 'Every deal that moves African brand ownership, with the value-capture read no bank provides.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

function fmtDate(d: string): string {
  const [y, m] = d.split('-');
  if (!m) return y;
  const month = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m)] || '';
  return `${month} ${y}`;
}

const VERDICT_STYLE: Record<Verdict, string> = {
  exported: 'border-mono-amber/60 text-mono-amber-strong bg-mono-amber/10',
  retained: 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10',
  mixed: 'border-mono-gray/40 text-mono-charcoal bg-mono-gray/10',
};

export default function OwnershipAlertsPage() {
  const sample = getAcquisitions().slice(0, 4);
  const s = getAcquisitionSummary();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Ownership Alerts — African Deal Intelligence',
    description:
      'A monitored feed of deals that move ownership of African and diaspora brands — acquisitions, catalogue sales, rights deals — each with a value-capture verdict on whether the upside stays on the continent.',
    url: URL,
    creator: { '@type': 'Organization', name: 'MonoKromatik', url: 'https://www.monokromatik.com' },
    keywords: ['African M&A', 'brand ownership', 'value capture', 'deal intelligence', 'Africa'],
    isAccessibleForFree: false,
  };

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-6">
            <Bell size={13} /> MONOKROMATIK · OWNERSHIP ALERTS
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            Who&rsquo;s buying Africa — <span className="text-mono-amber">before the market prices it.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The deal-intelligence feed for African brand ownership. Every acquisition, catalogue sale and rights deal that
            moves value — each with the one read a data room doesn&rsquo;t contain:{' '}
            <span className="text-mono-amber">does the upside stay on the continent, or get exported?</span>
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#waitlist" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              JOIN THE WAITLIST <ArrowRight size={16} />
            </a>
            <Link href="/whos-buying-africa" className="inline-flex items-center gap-2 border border-mono-white/40 text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-white/10 transition-colors">
              SEE THE FREE TRACKER
            </Link>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-20 bg-mono-soft-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-8">WHAT LANDS IN YOUR INBOX</p>
          <div className="grid md:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
            {[
              { icon: TrendingUp, t: 'Every ownership move', c: 'Acquisitions, stake sales, catalogue and rights deals across fintech, music, sport, media, FMCG — the moment they break, named and sourced.' },
              { icon: Check, t: 'The value-capture read', c: 'Not just the number — the verdict a bank won’t give you: exported, retained or contested, and where the margin actually lands.' },
              { icon: Filter, t: 'Filtered to your lens', c: 'By sector, geography and verdict — so an investor, corp-dev team or rights-holder sees only the moves that matter to them.' },
            ].map(({ icon: Icon, t, c }) => (
              <article key={t} className="bg-mono-white p-8 min-h-[240px] flex flex-col justify-between">
                <Icon className="text-mono-amber" size={24} />
                <div>
                  <h3 className="text-xl font-display font-bold text-mono-black">{t}</h3>
                  <p className="mt-3 text-mono-charcoal font-body leading-relaxed">{c}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Live sample */}
      <section className="py-16 md:py-20 bg-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">A SAMPLE OF THE FEED</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Recent moves, read the way you&rsquo;d want them.</h2>
            </div>
            <p className="text-sm font-body text-mono-gray max-w-xs">{s.total} deals tracked · {s.exported} exported · {s.retained} retained, across {s.sectors.length} sectors.</p>
          </div>
          <div className="space-y-5">
            {sample.map((d) => (
              <article key={d.id} className="bg-mono-soft-white border border-mono-gray/20 p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] tracking-[0.14em] font-display font-bold uppercase">
                  <span className="text-mono-gray">{fmtDate(d.date)}</span>
                  <span className="px-2.5 py-1 border border-mono-gray/30 text-mono-charcoal">{d.sector}</span>
                  <span className={`px-2.5 py-1 border ${VERDICT_STYLE[d.verdict]}`}>{VERDICT_LABEL[d.verdict]}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-mono-black leading-tight">
                  {d.target} <ArrowRight className="inline text-mono-amber-strong align-middle mx-1" size={18} /> {d.acquirer}
                </h3>
                <p className="mt-2 text-sm font-body text-mono-charcoal">{d.targetCountry} · <span className="font-bold text-mono-black">{d.value}</span></p>
                <p className="mt-3 font-body text-mono-charcoal leading-relaxed">{d.read}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm font-body text-mono-gray">
            The free <Link href="/whos-buying-africa" className="text-mono-amber-strong font-bold">tracker</Link> shows the record; <span className="text-mono-black font-bold">Alerts</span> brings the next move to you first — and the narrative read lives in <Link href="/reports/the-megabrand-exit-ledger" className="text-mono-amber-strong font-bold">The Megabrand Exit Ledger</Link>.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-14 bg-mono-black text-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-6">BUILT FOR</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              ['Investors & corp-dev', 'Screening African consumer, culture and fintech — see the ownership moves and the capture risk before the deal memo.'],
              ['Rights-holders & founders', 'Watch your category’s value chain — who’s consolidating, who’s selling, and where the leaks are opening.'],
              ['Agencies & strategists', 'Brief clients on who really owns the brands they want to work with, and which way the category is tilting.'],
            ].map(([t, c]) => (
              <div key={t}>
                <h3 className="text-lg font-display font-bold text-mono-amber-bright">{t}</h3>
                <p className="mt-3 text-sm font-body text-mono-soft-white leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-16 md:py-20 bg-mono-soft-white border-t border-mono-black/10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="text-mono-amber-strong mx-auto mb-5" size={28} />
          <h2 className="text-3xl md:text-4xl font-feature font-bold text-mono-black">Join the Ownership Alerts waitlist.</h2>
          <p className="mt-4 text-mono-charcoal font-body max-w-xl mx-auto">
            We&rsquo;re opening Alerts to a founding cohort first — founding-member pricing, and a direct line to shape what the
            feed covers. Add your email and we&rsquo;ll be in touch before launch.
          </p>
          <div className="mt-8 text-left max-w-md mx-auto">
            <NewsletterSignup variant="default" source="ownership-alerts-waitlist" />
          </div>
          <p className="mt-5 text-xs font-body text-mono-gray">
            Need it for a team now? <Link href="/work-with-us?interest=license" className="text-mono-amber-strong font-bold">Talk to us about licensing →</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
