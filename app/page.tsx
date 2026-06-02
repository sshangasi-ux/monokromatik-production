import Link from 'next/link';
import { ArrowRight, Database, Globe, ShieldCheck } from 'lucide-react';
import Navigation from './components/Navigation';
import NewsletterSignup from './components/NewsletterSignup';
import { getAllArticles, getReadingTime } from '../lib/articles';

interface Article {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  content: string;
}

export const revalidate = 60;

function StoryCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <Link href={`/article/${article.slug}`} className={`group block ${large ? '' : 'h-full'}`}>
      <div className={`relative overflow-hidden bg-mono-charcoal ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        <img
          src={article.imageUrl || '/fallback-hero.svg'}
          alt={article.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/35 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <div className="mb-3 inline-block bg-mono-amber px-2 py-1 text-xs font-display font-bold tracking-wider text-mono-white uppercase">
            {article.category}
          </div>
          <h3 className={`${large ? 'text-2xl md:text-4xl' : 'text-lg md:text-xl'} text-mono-white font-display font-bold leading-tight`}>
            {article.title}
          </h3>
          <p className="mt-3 text-xs text-mono-gray font-body">{getReadingTime(article.content)} min read</p>
        </div>
      </div>
    </Link>
  );
}

const signalFormats = [
  ['CAMPAIGN DECODED', 'Evidence-led analysis of the work moving African and diaspora audiences.'],
  ['WOULD IT TRAVEL?', 'Testing global campaigns against African market realities.'],
  ['DIASPORA DEMAND', 'How identity, influence and commerce move across borders.'],
  ['CULTURE TO COMMERCE', 'Where creative influence becomes economic value.'],
];

export default function Home() {
  const articles = getAllArticles() as Article[];
  const featured = articles[0];
  const latest = articles.slice(1, 5);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="relative min-h-[78vh] bg-mono-black overflow-hidden">
        <img
          src={featured?.imageUrl || '/fallback-hero.svg'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mono-black via-mono-black/85 to-mono-black/35" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <p className="text-mono-amber font-display font-bold tracking-[0.25em] text-xs mb-8">MONOKROMATIK NETWORK</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-display font-bold text-mono-white leading-[0.95]">
            African Culture.<br />
            Global Influence.<br />
            <span className="text-mono-amber">Brand Intelligence.</span>
          </h1>
          <p className="max-w-2xl mt-8 text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            Decoding the campaigns, creators, athletes, brands and cultural movements shaping Africa and its diaspora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/signal" className="px-8 py-4 bg-mono-amber text-mono-white font-display font-bold inline-flex items-center gap-2">
              ENTER SIGNAL <ArrowRight size={18} />
            </Link>
            <Link href="/pulse" className="px-8 py-4 border border-mono-white text-mono-white font-display font-bold">
              EXPLORE THE LATEST
            </Link>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid md:grid-cols-3 border border-mono-gray/30 bg-mono-black/55 backdrop-blur">
            <div className="p-5 flex gap-3 items-start"><ShieldCheck className="text-mono-amber shrink-0" size={19} /><p className="text-sm text-mono-soft-white">AI-assisted discovery.<br />Human-directed intelligence.</p></div>
            <div className="p-5 flex gap-3 items-start border-y md:border-y-0 md:border-x border-mono-gray/30"><Globe className="text-mono-amber shrink-0" size={19} /><p className="text-sm text-mono-soft-white">Africa and its diaspora,<br />read with global context.</p></div>
            <div className="p-5 flex gap-3 items-start"><Database className="text-mono-amber shrink-0" size={19} /><p className="text-sm text-mono-soft-white">Verified campaign library<br />and intelligence in development.</p></div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="py-16 md:py-20 bg-mono-soft-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber mb-3">LEAD STORY</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">The latest signal</h2>
              </div>
              <Link href="/pulse" className="hidden md:inline-flex text-mono-amber font-display text-sm font-bold">ALL STORIES →</Link>
            </div>
            <div className="grid lg:grid-cols-2 gap-7">
              <StoryCard article={featured} large />
              <div className="grid sm:grid-cols-2 gap-6">
                {latest.map((article) => <StoryCard article={article} key={article.slug} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber mb-4">SIGNAL</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Brand & Campaign Intelligence</h2>
            <p className="mt-5 text-mono-soft-white text-lg font-body">
              The commercial read on African cultural relevance: the brands, campaigns and partnerships worth understanding.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {signalFormats.map(([title, body]) => (
              <div key={title} className="bg-mono-black p-7 min-h-[210px]">
                <p className="font-display text-mono-amber text-xs font-bold tracking-wider">{title}</p>
                <p className="mt-7 font-body text-mono-soft-white leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <Link href="/signal" className="mt-10 inline-flex items-center gap-2 font-display font-bold text-mono-amber">
            EXPLORE SIGNAL <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber mb-4">INTELLIGENCE</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Search African brand intelligence.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal">
              A structured library of campaigns, markets, creators and diaspora signals is being built for professional users.
            </p>
            <Link href="/intelligence" className="mt-8 inline-flex px-7 py-4 bg-mono-black text-mono-white font-display font-bold gap-2">
              VIEW THE PRODUCT ROADMAP <ArrowRight size={18} />
            </Link>
          </div>
          <div className="bg-mono-soft-white border border-mono-gray/25 p-7">
            <p className="font-display text-xs tracking-wider font-bold text-mono-gray">EXAMPLE RESEARCH QUERIES</p>
            {[
              'Sportswear campaigns rooted in African identity',
              'Music partnerships in Nigeria and South Africa',
              'Diaspora-focused premium brand collaborations',
              'Sports sponsorship case studies across Africa',
            ].map((item) => (
              <div key={item} className="mt-4 px-5 py-4 bg-mono-white border-l-4 border-mono-amber font-body text-mono-charcoal">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber mb-4">THE WEEKLY SIGNAL</p>
            <h2 className="text-3xl md:text-5xl text-mono-white font-display font-bold">Brand, culture and commercial intelligence.</h2>
          </div>
          <NewsletterSignup variant="default" source="weekly-signal-homepage" />
        </div>
      </section>

      <footer className="py-14 bg-mono-black border-t border-mono-gray/20 text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display font-bold text-xl">MONO<span className="text-mono-amber">KROMATIK</span></h3>
            <p className="mt-4 text-mono-gray font-body text-sm">African Culture. Global Influence. Brand Intelligence.</p>
          </div>
          <div className="font-body text-sm text-mono-gray space-y-3">
            <Link className="block hover:text-mono-amber" href="/signal">Signal</Link>
            <Link className="block hover:text-mono-amber" href="/intelligence">Intelligence</Link>
            <Link className="block hover:text-mono-amber" href="/editorial-standards">Editorial Standards</Link>
            <Link className="block hover:text-mono-amber" href="/ai-methodology">AI Methodology</Link>
          </div>
          <div>
            <p className="text-sm text-mono-gray font-body">AI-assisted discovery. Human-directed intelligence. Verified sourcing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
