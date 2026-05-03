import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { getAllArticles, getReadingTime, formatDate } from '../../../lib/articles';
import type { Metadata } from 'next';

// Category metadata definitions — single source of truth for the brand sections
export const CATEGORIES: Record<
  string,
  { label: string; tagline: string; matches: string[]; comingSoon?: boolean }
> = {
  roots: {
    label: 'ROOTS',
    tagline: 'Culture, heritage, and the stories that shape us.',
    matches: ['culture', 'heritage', 'roots', 'fashion', 'food'],
  },
  arena: {
    label: 'ARENA',
    tagline: 'Sports, competition, and the African athletes redefining global play.',
    matches: ['sports', 'football', 'soccer', 'arena'],
  },
  waves: {
    label: 'WAVES',
    tagline: 'Music, Afrobeats, Amapiano, Hip Hop — the sound of the continent.',
    matches: ['music', 'entertainment', 'waves'],
  },
  watch: {
    label: 'WATCH',
    tagline: 'Video features and visual storytelling. Coming soon.',
    matches: ['video', 'watch', 'film', 'tv'],
    comingSoon: true,
  },
  listen: {
    label: 'LISTEN',
    tagline: 'Podcasts and audio stories from the diaspora. Coming soon.',
    matches: ['podcast', 'audio', 'listen'],
    comingSoon: true,
  },
  shop: {
    label: 'SHOP',
    tagline: 'Curated drops from African creators. Coming soon.',
    matches: ['shop', 'merch', 'product'],
    comingSoon: true,
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: 'Not Found | MonoKromatik' };

  const title = `${cat.label} — ${cat.tagline.split('.')[0]} | MonoKromatik`;
  const url = `https://www.monokromatik.com/category/${slug}`;
  return {
    title,
    description: cat.tagline,
    openGraph: { title, description: cat.tagline, type: 'website', url },
    twitter: { card: 'summary', title, description: cat.tagline },
    alternates: { canonical: url },
  };
}

export const revalidate = 300;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const all = getAllArticles();
  const articles = all
    .filter((a) =>
      cat.matches.some((m) => a.category.toLowerCase().includes(m))
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
            <span className="text-mono-amber">{cat.label}</span>
          </h1>
          <p className="text-xl text-mono-soft-white font-body max-w-2xl">
            {cat.tagline}
          </p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cat.comingSoon ? (
            <div className="text-center py-20 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black mb-4">
                Building this in public.
              </h2>
              <p className="text-lg text-mono-gray font-body mb-8">
                {cat.label} is on the roadmap. We're shipping each section the moment
                it adds real value — no lorem ipsum, no filler. Want a heads-up when
                it goes live?
              </p>
              <Link
                href="/#newsletter"
                className="inline-block px-8 py-4 bg-mono-amber text-mono-white font-display font-bold text-lg hover:bg-mono-amber/90 transition-colors"
              >
                JOIN THE PULSE
              </Link>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-mono-white p-6 border-2 border-mono-charcoal">
                  <h3 className="font-display font-bold text-mono-black mb-2">
                    🟢 SHIPPED
                  </h3>
                  <p className="text-sm font-body text-mono-gray">
                    Pulse · Roots · Arena · Waves · Article pages · Newsletter
                  </p>
                </div>
                <div className="bg-mono-white p-6 border-2 border-mono-amber">
                  <h3 className="font-display font-bold text-mono-amber mb-2">
                    🟡 BUILDING
                  </h3>
                  <p className="text-sm font-body text-mono-gray">
                    {cat.label} · Search modal · Social distribution
                  </p>
                </div>
                <div className="bg-mono-white p-6 border-2 border-mono-charcoal/30">
                  <h3 className="font-display font-bold text-mono-charcoal/60 mb-2">
                    ⚪ NEXT
                  </h3>
                  <p className="text-sm font-body text-mono-gray">
                    Comments · Personalisation · Premium drops
                  </p>
                </div>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-mono-gray font-body text-lg mb-4">
                No {cat.label.toLowerCase()} stories live yet.
              </p>
              <p className="text-mono-charcoal font-body">
                Our AI scouts are reading every African feed right now. New stories
                arrive every few hours.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                const fallback =
                  'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop';
                return (
                  <Link
                    key={article.slug}
                    href={`/article/${article.slug}`}
                    className="group"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <img
                        src={article.imageUrl || fallback}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-mono-amber text-mono-white text-xs font-display font-bold uppercase">
                            {article.category}
                          </span>
                          <span className="text-xs text-mono-gray font-body">
                            {formatDate(article.publishedAt)}
                          </span>
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
    </div>
  );
}
