import Link from 'next/link';
import { Sparkles, Clock, ArrowRight, Lock } from 'lucide-react';
import type { Metadata } from 'next';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAllArticles, getReadingTime, formatDate } from '../../lib/articles';
import { getReportBySlug } from '../../lib/reports';

const URL = 'https://www.monokromatik.com/coil-economy';

export const metadata: Metadata = {
  title: 'The Coil Economy — Who Owns Black Beauty | MonoKromatik',
  description:
    'The Black beauty ownership desk. Black women author the categories — hair, skin, colour — and multinationals keep buying the margin. Who cashes the cheque, decoded through the Cultural-Signal lens.',
  keywords: [
    'who owns black beauty brands', 'black hair care ownership', 'SheaMoisture owner', 'Mielle Organics acquisition',
    'Fenty Beauty ownership', 'black-owned beauty', 'coil economy', 'natural hair market',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'The Coil Economy — Who Owns Black Beauty',
    description: 'Black women author the categories; multinationals own the margin. The Black beauty ownership desk.',
    type: 'website',
    url: URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Coil Economy — Who Owns Black Beauty',
    description: 'Black women author the categories; multinationals own the margin.',
  },
};

export const revalidate = 300;

// The Coil Economy = the Black beauty OWNERSHIP desk. A story qualifies on a
// beauty signal drawn from its title, tags or category — not a stray word in
// the body — so the grid auto-populates as new beauty coverage ships.
const BEAUTY_SIGNAL =
  /\b(beauty|haircare|hair\s?care|natural[-\s]?hair|afro[-\s]?hair|coil|cosmetic|cosmetics|skincare|skin\s?care|shea|sheamoisture|mielle|fenty|wig|braids?|makeup|make[-\s]?up|foundation\s?shade|k[-\s]?beauty)\b/i;

function isBeauty(a: { category: string; title: string; tags?: string[] }): boolean {
  const signal = [a.title, a.category, ...(a.tags ?? [])].filter(Boolean).join(' ');
  return BEAUTY_SIGNAL.test(signal);
}

// Curated intelligence-desk companions to the running coverage.
const FEATURED_REPORT_SLUGS = ['african-luxury-market-brief', 'will-it-land-uncover-skincare'];

export default function CoilEconomyPage() {
  const articles = getAllArticles()
    .filter(isBeauty)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const reports = FEATURED_REPORT_SLUGS.map((s) => getReportBySlug(s)).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero / thesis */}
      <section className="py-16 md:py-20 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="text-mono-amber" size={44} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              THE <span className="text-mono-amber">COIL ECONOMY</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-6">— The Black Beauty Ownership Desk</p>
          <p className="text-lg text-mono-gray font-body max-w-2xl leading-relaxed">
            Black women author the categories — the hair rituals, the shade ranges, the language of texture — and
            the market keeps handing the margin to someone else. From SheaMoisture to Mielle to Fenty, this is where
            we track a single question: who authors the beauty, and who cashes the cheque.
          </p>
          <p className="mt-6 text-base font-display font-bold text-mono-amber max-w-2xl">
            Authorship is not equity. This desk follows the gap between them.
          </p>
        </div>
      </section>

      {/* Running coverage */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-8 uppercase">
            The Coverage
          </h2>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-mono-charcoal font-display text-2xl mb-4">The desk is opening.</p>
              <p className="text-mono-gray font-body text-lg">First reads arriving with the daily run.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                return (
                  <Link key={article.slug} href={`/article/${article.slug}`} className="group">
                    <div className="aspect-[4/3] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <MediaImage fill src={article.imageUrl || '/fallback-hero.svg'} alt={article.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-mono-amber text-mono-black text-xs font-display font-bold uppercase">
                            Coil Economy
                          </span>
                          <span className="text-xs text-mono-gray font-body">{formatDate(article.publishedAt)}</span>
                          <span className="text-xs text-mono-gray flex items-center gap-1 font-body">
                            <Clock size={12} /> {readingTime} min
                          </span>
                        </div>
                        <h3 className="text-mono-white font-display font-bold text-lg leading-tight group-hover:text-mono-amber transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* From the intelligence desk — curated reports */}
      {reports.length > 0 && (
        <section className="py-16 bg-mono-white border-t border-mono-gray/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-8 uppercase">
              From the Intelligence Desk
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((r) => (
                <Link
                  key={r.slug}
                  href={`/reports/${r.slug}`}
                  className="group block border border-mono-gray/25 p-7 hover:border-mono-amber transition-colors bg-mono-soft-white"
                >
                  <div className="flex items-center gap-3 mb-3 text-[11px] tracking-[0.14em] font-display font-bold uppercase">
                    <span className="text-mono-amber-strong">{r.series}</span>
                    {r.access !== 'open' && (
                      <span className="inline-flex items-center gap-1 text-mono-gray">
                        <Lock size={11} /> {r.access}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-mono-black leading-tight group-hover:text-mono-amber-strong transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-3 font-body text-mono-charcoal leading-relaxed line-clamp-3">{r.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-mono-black font-display font-bold text-sm group-hover:gap-2 transition-all">
                    Read the brief <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cross-link to the Index */}
      <section className="bg-mono-black py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-2">GO DEEPER</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-white">
              Who authors the influence? See the ranked Index.
            </h2>
          </div>
          <Link
            href="/intelligence/signal-index"
            className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold shrink-0 hover:bg-mono-amber/90 transition-colors"
          >
            EXPLORE THE INDEX <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="default" source="coil-economy" />
        </div>
      </section>
    </div>
  );
}
