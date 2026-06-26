import Link from 'next/link';
import { Wine, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAllArticles, getReadingTime, formatDate } from '../../lib/articles';

export const metadata: Metadata = {
  title: 'Spirits — The Drinks Desk | MonoKromatik Network',
  description:
    'The world of liquor through a brand-intelligence lens: African & diaspora spirits going global, the houses moving on the continent, and the drinks-brand economy. AI-sourced from trusted trade press.',
  keywords: ['African spirits', 'drinks business', 'spirits brands', 'whisky', 'gin', 'amarula', 'African wine', 'liquor brands'],
  openGraph: {
    title: 'Spirits — The Drinks Desk',
    description: 'The drinks-brand economy through an African & diaspora lens.',
    type: 'website',
    url: 'https://www.monokromatik.com/spirits',
  },
  twitter: { card: 'summary_large_image', title: 'Spirits — The Drinks Desk', description: 'The drinks-brand economy, decoded.' },
  alternates: { canonical: 'https://www.monokromatik.com/spirits' },
};

export const revalidate = 300;

// The Drinks Desk is AFRICA & DIASPORA-focused: a story qualifies only if it's
// both about drinks AND connected to Africa or its diaspora.
const DRINKS_TERMS = /\b(spirit|spirits|liquor|whisk|gin|rum|vodka|tequila|cognac|brandy|wine|champagne|cocktail|distill|brewer|beer|amarula|mezcal|bourbon|liqueur|aperitif|drinks?)\b/i;
// African + diaspora signal: continent/diaspora, major markets/demonyms/cities,
// and notable African drinks brands.
const AFRICA_TERMS = /\b(africa|african|diaspora|pan-?african|sub-?saharan|nigeria|nigerian|naija|ghana|ghanaian|kenya|kenyan|south\s?africa|south\s?african|mzansi|ethiopia|tanzania|uganda|senegal|ivory\s?coast|ivorian|c[oô]te\s?d.?ivoire|cameroon|morocc|egypt|egyptian|angola|zimbabwe|zambia|botswana|namibia|mozambiqu|rwanda|congo|drc|lagos|abuja|accra|nairobi|johannesburg|joburg|cape\s?town|kampala|dakar|addis|casablanca|kinshasa|amarula|savanna premium)\b/i;

function isAfricanDrinks(a: { category: string; title: string; excerpt?: string; content?: string; tags?: string[] }): boolean {
  const full = [a.title, a.excerpt, ...(a.tags ?? []), a.content].filter(Boolean).join(' ');
  // The drinks SIGNAL must come from the category, title or tags — not a stray word
  // buried in body copy ("spirit" as soul, "drinks" at a networking mixer). That was
  // landing culture/music pieces on the Drinks Desk. The Africa link can be anywhere.
  const signal = [a.title, ...(a.tags ?? [])].filter(Boolean).join(' ');
  const drinks = a.category?.toLowerCase() === 'drinks' || DRINKS_TERMS.test(signal);
  return drinks && AFRICA_TERMS.test(full);
}

export default function SpiritsPage() {
  const articles = getAllArticles()
    .filter(isAfricanDrinks)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Wine className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">SPIRITS</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">— The Drinks Desk</p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            The world of liquor through a brand-intelligence lens — African and diaspora spirits going global, the
            houses moving on the continent, and the drinks-brand economy. Sourced from trusted trade press, decoded
            for what it means.
          </p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-mono-charcoal font-display text-2xl mb-4">The Drinks Desk is pouring in.</p>
              <p className="text-mono-gray font-body text-lg mb-8">
                Our agents are now sourcing the spirits and drinks-brand stories that matter — first pours arriving
                with the daily run.
              </p>
              <Link href="/pulse" className="inline-block px-6 py-3 bg-mono-amber text-mono-black font-display font-bold hover:bg-mono-amber/90 transition-colors">
                EXPLORE PULSE
              </Link>
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
                          <span className="px-2 py-1 bg-mono-amber text-mono-black text-xs font-display font-bold uppercase">SPIRITS</span>
                          <span className="text-xs text-mono-gray font-body">{formatDate(article.publishedAt)}</span>
                          <span className="text-xs text-mono-gray flex items-center gap-1 font-body"><Clock size={12} /> {readingTime} min</span>
                        </div>
                        <h3 className="text-mono-white font-display font-bold text-lg leading-tight group-hover:text-mono-amber transition-colors">{article.title}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-mono-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="default" />
        </div>
      </section>
    </div>
  );
}
