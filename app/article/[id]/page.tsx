'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import Navigation from '../../components/Navigation';
import SocialShare from '../../components/SocialShare';
import RelatedArticles from '../../components/RelatedArticles';
import NewsletterSignup from '../../components/NewsletterSignup';
import { getArticleBySlug, getAllArticles, getReadingTime, formatDate } from '../../../lib/articles';
import ReactMarkdown from 'react-markdown';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.id as string;
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  
  const article = useMemo(() => getArticleBySlug(slug), [slug]);
  const allArticles = useMemo(() => getAllArticles(), []);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen bg-mono-white flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-mono-black mb-4">Article Not Found</h1>
          <Link href="/" className="text-mono-amber hover:underline font-body">← Back to home</Link>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTime(article.content);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Reading Progress Bar */}
      <div className="fixed top-20 left-0 right-0 h-1 bg-mono-soft-white z-40">
        <div className="h-full bg-mono-amber transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-24 right-4 bg-mono-black/80 backdrop-blur-sm px-4 py-2 rounded-full z-40">
        <span className="text-mono-white font-body text-sm">
          📖 {Math.round(scrollProgress)}% {scrollProgress > 80 && '- Almost done!'}
        </span>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-mono-gray hover:text-mono-amber transition-colors font-body mb-6">
          <ArrowLeft size={20} /> Back to home
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-6 font-body text-sm">
          <span className="px-3 py-1 bg-mono-amber text-mono-white font-display font-bold uppercase">{article.category}</span>
          <span className="flex items-center gap-1 text-mono-gray"><Clock size={16} /> {readingTime} min read</span>
          <span className="text-mono-gray">{formatDate(article.publishedAt)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-mono-black mb-6 leading-tight">
          {article.title}
        </h1>

        <p className="text-xl text-mono-gray font-body mb-8 leading-relaxed">
          {article.excerpt}
        </p>

        {article.imageUrl && (
          <div className="aspect-video overflow-hidden bg-mono-charcoal mb-12 rounded-lg">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {article.videoUrl && (
          <div className="aspect-video mb-12 rounded-lg overflow-hidden">
            <iframe
              src={article.videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none font-body text-mono-charcoal mb-12 article-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Source Attribution */}
        <div className="my-8 p-4 border-2 border-mono-charcoal bg-mono-soft-white rounded-lg">
          <p className="font-body text-sm text-mono-gray">
            Story source: <a href={article.sourceLink} target="_blank" rel="noopener noreferrer" className="text-mono-amber hover:underline inline-flex items-center gap-1">
              {article.sourceName} <ExternalLink size={14} />
            </a>
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {article.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-mono-soft-white text-mono-charcoal font-body text-sm rounded-full">
              #{tag.replace(/\s+/g, '')}
            </span>
          ))}
        </div>

        {/* Social Share - Top */}
        <div className="mt-12 mb-8">
          <SocialShare 
            title={article.title}
            url={typeof window !== 'undefined' ? window.location.href : `https://monokromatik.com/article/${article.slug}`}
            variant="horizontal"
          />
        </div>

        {/* Floating Social Share (Desktop) */}
        <SocialShare 
          title={article.title}
          url={typeof window !== 'undefined' ? window.location.href : `https://monokromatik.com/article/${article.slug}`}
          variant="floating"
        />

        <div className="mt-16 pt-12 border-t-2 border-mono-charcoal">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-mono-black mb-4">WHAT DID YOU THINK?</h3>
            <div className="flex gap-4">
              {[
                { emoji: '🔥', label: 'FIRE' },
                { emoji: '💯', label: 'FACTS' },
                { emoji: '👏', label: 'LOVE IT' },
                { emoji: '🤔', label: 'MEH' },
              ].map((item) => (
                <button key={item.emoji} onClick={() => setReaction(item.emoji)}
                  className={`flex-1 px-6 py-4 border-2 transition-all ${
                    reaction === item.emoji ? 'border-mono-amber bg-mono-amber text-mono-white' : 'border-mono-charcoal hover:border-mono-amber'
                  }`}>
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="font-display font-bold text-sm">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Social Share - Bottom */}
          <div className="mb-12">
            <SocialShare 
              title={article.title}
              url={typeof window !== 'undefined' ? window.location.href : `https://monokromatik.com/article/${article.slug}`}
              variant="horizontal"
            />
          </div>
        </div>

        {/* Related Articles */}
        <RelatedArticles
          currentSlug={article.slug}
          category={article.category}
          articles={allArticles}
        />

        {/* Newsletter Signup */}
        <div className="mt-16">
          <NewsletterSignup variant="footer" />
        </div>
      </article>

      <style jsx global>{`
        .article-content h2 {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--mono-black);
        }
        .article-content h3 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--mono-black);
        }
        .article-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }
        .article-content strong {
          font-weight: 700;
          color: var(--mono-black);
        }
        .article-content a {
          color: var(--mono-amber);
          text-decoration: underline;
        }
        .article-content a:hover {
          color: var(--mono-black);
        }
      `}</style>
    </div>
  );
}
