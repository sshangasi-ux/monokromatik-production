import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getAllArticles, getReadingTime, type Article } from '../../lib/articles';

const contextPillars = [
  {
    name: 'ROOTS',
    href: '/roots',
    description: 'Identity, design, heritage, fashion and the visual languages brands need to understand.',
  },
  {
    name: 'ARENA',
    href: '/arena',
    description: 'Sport, fandom, athletes, sponsorship and the economies formed around belonging.',
  },
  {
    name: 'WAVES',
    href: '/waves',
    description: 'Music, film, entertainment and creators carrying African influence across borders.',
  },
];

function StoryCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-mono-black">
        <img src={article.imageUrl || '/fallback-hero.svg'} alt={article.title} className="h-full w-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-transparent to-transparent" />
        <div className="absolute bottom-0 p-5">
          <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber uppercase">{article.category}</p>
          <h3 className="mt-3 text-xl text-mono-white font-display font-bold leading-tight">{article.title}</h3>
          <p className="mt-3 text-xs text-mono-gray font-body">{getReadingTime(article.content)} min read</p>
        </div>
      </div>
    </Link>
  );
}

export default function CulturePage() {
  const articles = getAllArticles().slice(0, 6);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">CULTURE / THE EVIDENCE BASE</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Influence begins<br /><span className="text-mono-amber">before the campaign.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">Culture is where the behaviour, aesthetics, communities and forms of belonging behind brand relevance first become visible.</p>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
          {contextPillars.map((pillar) => (
            <Link key={pillar.name} href={pillar.href} className="bg-mono-white p-8 md:p-10 hover:bg-mono-soft-white transition-colors">
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber">{pillar.name}</p>
              <p className="mt-8 text-lg text-mono-charcoal font-body leading-relaxed min-h-[92px]">{pillar.description}</p>
              <p className="mt-8 inline-flex items-center gap-2 text-mono-amber font-display font-bold">EXPLORE <ArrowRight size={17} /></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">RECENT DISPATCHES</p>
              <h2 className="text-4xl font-display font-bold text-mono-black">Signals from the living culture.</h2>
            </div>
            <Link href="/signal" className="inline-flex gap-2 items-center text-mono-amber font-display font-bold">SEE THE BRAND READ <ArrowRight size={18} /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => <StoryCard article={article} key={article.slug} />)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-black text-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">THE LINK</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold">Culture creates the signal. Intelligence makes it useful.</h2>
          <Link href="/intelligence" className="mt-10 inline-flex gap-2 items-center bg-mono-amber text-mono-white px-7 py-4 font-display font-bold">ENTER INTELLIGENCE <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
