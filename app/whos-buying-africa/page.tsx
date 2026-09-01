import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAcquisitions, getAcquisitionSummary, VERDICT_LABEL, type Verdict } from '../../lib/acquisitions';

const URL = 'https://www.monokromatik.com/whos-buying-africa';

export const metadata: Metadata = {
  title: "Who's Buying Africa? African M&A & Brand-Ownership Tracker",
  description:
    'A sourced tracker of who is acquiring African and diaspora brands — fintech, music, beauty, banking — and whether the ownership and value stay on the continent or get exported.',
  keywords: ['who owns African brands', 'African M&A', 'African acquisitions', 'African fintech acquisitions', 'who bought', 'African brand ownership', 'value capture Africa'],
  alternates: { canonical: URL },
  openGraph: {
    title: "Who's Buying Africa? — Brand-Ownership Tracker",
    description: 'Who is acquiring African brands, and does the value stay on the continent? A sourced ownership tracker from MonoKromatik.',
    type: 'website',
    url: URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: "Who's Buying Africa? — Brand-Ownership Tracker",
    description: 'Who is acquiring African brands, and does the value stay on the continent? A sourced ownership tracker.',
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

export default function WhosBuyingAfricaPage() {
  const deals = getAcquisitions();
  const s = getAcquisitionSummary();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: "Who's Buying Africa — African Brand-Ownership Tracker",
    description: 'A sourced record of deals that move ownership of African and diaspora brands, with a value-capture verdict on whether ownership stays on the continent.',
    url: URL,
    creator: { '@type': 'Organization', name: 'MonoKromatik' },
    keywords: ['African M&A', 'brand ownership', 'value capture', 'Africa'],
  };

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">MONOKROMATIK · THE TRACKER</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Who&rsquo;s Buying Africa?</h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            A sourced record of who is acquiring African &amp; diaspora brands — fintech, music, beauty, banking —
            and the one question that decides it: does the ownership and the upside <span className="text-mono-amber">stay on the continent</span>, or get exported?
          </p>
          <p className="mt-6 max-w-2xl text-sm font-body text-mono-gray">
            African tech M&amp;A alone crossed <span className="text-mono-soft-white font-bold">84 deals worth ~$11.4bn disclosed</span> in 2026 so far (TechCabal) — the fastest year on record. This tracker follows where the ownership lands.
          </p>
        </div>
      </section>

      {/* Summary strip */}
      <section className="bg-mono-amber/10 border-y border-mono-amber/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: s.total, l: 'Deals tracked' },
            { n: s.exported, l: 'Value exported' },
            { n: s.retained, l: 'Value retained' },
            { n: s.sectors.length, l: 'Sectors' },
          ].map(({ n, l }) => (
            <div key={l}>
              <span className="block text-4xl font-display font-bold text-mono-black tabular-nums">{n}</span>
              <span className="block text-[11px] tracking-[0.14em] font-display font-bold text-mono-charcoal mt-1 uppercase">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="py-14 md:py-20 bg-mono-soft-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-5">
            {deals.map((d) => (
              <article key={d.id} className="bg-mono-white border border-mono-gray/20 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] tracking-[0.14em] font-display font-bold uppercase">
                  <span className="text-mono-gray">{fmtDate(d.date)}</span>
                  <span className="px-2.5 py-1 border border-mono-gray/30 text-mono-charcoal">{d.sector}</span>
                  <span className={`px-2.5 py-1 border ${VERDICT_STYLE[d.verdict]}`}>{VERDICT_LABEL[d.verdict]}</span>
                  {d.status !== 'completed' && <span className="text-mono-gray normal-case tracking-normal font-body">({d.status})</span>}
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black leading-tight">
                  {d.target} <ArrowRight className="inline text-mono-amber-strong align-middle mx-1" size={22} /> {d.acquirer}
                  {d.acquirerParent && <span className="text-mono-gray font-body text-base"> ({d.acquirerParent})</span>}
                </h2>
                <p className="mt-2 text-sm font-body text-mono-charcoal">
                  {d.targetCountry} · <span className="font-bold text-mono-black">{d.value}</span>
                </p>
                <p className="mt-4 font-body text-mono-charcoal leading-relaxed">{d.read}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-body">
                  {d.sources.map((src, i) => (
                    src.url ? (
                      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
                        {src.publisher} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span key={i} className="text-mono-gray font-display font-bold">{src.publisher}{src.label ? ` — ${src.label}` : ''}</span>
                    )
                  ))}
                  {d.relatedArticle && (
                    <Link href={`/article/${d.relatedArticle}`} className="inline-flex items-center gap-1 text-mono-black hover:text-mono-amber-strong font-display font-bold">
                      Full breakdown <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-sm font-body text-mono-gray">
            A living tracker — new deals are added as they land. See a deal we&rsquo;ve missed?{' '}
            <a href="mailto:editor@monokromatik.com?subject=Who%27s%20Buying%20Africa%20%E2%80%94%20deal%20tip" className="text-mono-amber-strong font-bold hover:text-mono-amber-hover">Tell us →</a>
          </p>
        </div>
      </section>

      {/* Cross-link to the Index */}
      <section className="bg-mono-white py-14 md:py-16 border-t border-mono-gray/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">GO DEEPER</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black">Who authored the influence? See the ranked Index.</h2>
          </div>
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold shrink-0 hover:bg-mono-charcoal transition-colors">
            EXPLORE THE INDEX <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-mono-black py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="default" source="whos-buying-africa" />
        </div>
      </section>
    </div>
  );
}
