'use client';

import { useState, useEffect, useMemo } from 'react';
import { track } from '../../../lib/analytics';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import Navigation from '../../components/Navigation';
import MediaImage from '../../components/MediaImage';
import SocialShare from '../../components/SocialShare';
import RelatedArticles from '../../components/RelatedArticles';
import NewsletterSignup from '../../components/NewsletterSignup';
import BrandRead from '../../components/BrandRead';
import {
  getAllArticles,
  getReadingTime,
  formatDate,
  type Article,
  type ArticleSource,
} from '../../../lib/articles';
import type { ModuleVM } from '../../../lib/article-modules';
import type { ResolvedEntity } from '../../../lib/entities';
import ArticleModules from '../../components/article/ArticleModules';
import References from '../../components/article/References';
import EntityRail from '../../components/article/EntityRail';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkCitations } from '../../../lib/remark-citations';

interface ArticleClientProps {
  article: Article;
  references?: ArticleSource[];
  modules?: ModuleVM[];
  entities?: ResolvedEntity[];
}

// react-markdown component overrides: render inline `[n]` citation marks (links
// to #ref-n produced by remarkCitations) as superscript references; keep normal
// links opening safely in a new tab.
const mdComponents = {
  a({ href, children, ...props }: React.ComponentProps<'a'>) {
    if (typeof href === 'string' && href.startsWith('#ref-')) {
      return (
        <a href={href} className="citation-ref" aria-label={`Reference ${children}`}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

export default function ArticleClient({
  article,
  references = [],
  modules = [],
  entities = [],
}: ArticleClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);

  const allArticles = useMemo(() => getAllArticles(), []);
  const readingTime = getReadingTime(article.content);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    track('article_view', { slug: article.slug, category: article.category });
  }, [article.slug, article.category]);

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://www.monokromatik.com/article/${article.slug}`;

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Reading progress bar — the clean, premium signal (the floating %
          widget was removed as off-register for an editorial brand). */}
      <div className="fixed top-20 left-0 right-0 h-1 bg-mono-soft-white z-40" aria-hidden="true">
        <div
          className="h-full bg-mono-amber transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-mono-gray hover:text-mono-amber-strong transition-colors font-body mb-6"
        >
          <ArrowLeft size={20} /> Back to home
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-6 font-body text-sm">
          {article.format === 'feature' && (
            <span className="px-3 py-1 bg-mono-black text-mono-amber font-display font-bold uppercase tracking-[0.14em] text-xs">
              Feature
            </span>
          )}
          <span className="px-3 py-1 bg-mono-amber text-mono-black font-display font-bold uppercase">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-mono-gray">
            <Clock size={16} /> {readingTime} min read
          </span>
          <span className="text-mono-gray">{formatDate(article.publishedAt)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-feature font-bold text-mono-black mb-6 leading-[1.05]">
          {article.title}
        </h1>

        <p className="text-xl md:text-2xl text-mono-charcoal font-feature italic mb-8 leading-snug">
          {article.excerpt}
        </p>

        {article.imageUrl && (
          <figure className="mb-12">
            <div className="relative aspect-video overflow-hidden bg-mono-charcoal rounded-lg">
              <MediaImage
                fill
                priority
                duotone={false}
                zoomOnHover={false}
                src={article.imageUrl}
                alt={article.title}
              />
            </div>
            {article.imageCredit && (
              <figcaption className="mt-2 text-xs tracking-[0.08em] font-body text-mono-gray">
                {article.imageSourceUrl ? (
                  <a href={article.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mono-amber-strong hover:underline">
                    {article.imageCredit}
                  </a>
                ) : (
                  article.imageCredit
                )}
              </figcaption>
            )}
          </figure>
        )}

        {article.videoUrl && (
          <figure className="mb-12">
            <div className="aspect-video rounded-lg overflow-hidden bg-mono-charcoal">
              {article.videoType === 'file' ? (
                <video
                  src={article.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <iframe
                  src={
                    article.videoUrl.includes('vimeo.com')
                      ? article.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
                      : article.videoUrl.replace('watch?v=', 'embed/')
                  }
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            {article.videoCredit && (
              <figcaption className="mt-2 text-xs tracking-[0.08em] font-body text-mono-gray">
                {article.videoSourceUrl ? (
                  <a href={article.videoSourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mono-amber-strong hover:underline">
                    {article.videoCredit}
                  </a>
                ) : (
                  article.videoCredit
                )}
              </figcaption>
            )}
          </figure>
        )}

        <div className="prose prose-lg max-w-none font-body text-mono-charcoal mb-12 article-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkCitations]}
            components={mdComponents}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Layer 2 — structured evidence modules (By the Numbers, Timeline,
            Evidence ledger, Precedents), each self-citing into References. */}
        <ArticleModules modules={modules} />

        <BrandRead data={article.brandRead} />

        {/* Earlier email capture — the reader has just finished the argument and the
            founder's take, the warmest point to convert, and well before the footer
            form most readers never scroll to. */}
        <div className="my-12">
          <NewsletterSignup variant="sidebar" source="article-mid" />
        </div>

        {/* Layer 1 — the numbered References block (inline [n] marks link here).
            Always non-empty: the legacy source is synthesised as [1]. */}
        <References sources={references} />

        {/* Layer 3 — the entity flywheel: Index scores + related coverage. */}
        <EntityRail entities={entities} />

        <div className="flex flex-wrap gap-2 mb-12">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-mono-soft-white text-mono-charcoal font-body text-sm rounded-full"
            >
              #{tag.replace(/\s+/g, '')}
            </span>
          ))}
        </div>

        <div className="mt-12 mb-8">
          <SocialShare
            title={article.title}
            url={shareUrl}
            variant="horizontal"
          />
        </div>

        <SocialShare
          title={article.title}
          url={shareUrl}
          variant="floating"
        />

        <div className="mt-16 pt-12 border-t-2 border-mono-charcoal">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-mono-black mb-4">
              WHAT DID YOU THINK?
            </h3>
            <div className="flex gap-4">
              {[
                { emoji: '🔥', label: 'FIRE' },
                { emoji: '💯', label: 'FACTS' },
                { emoji: '👏', label: 'LOVE IT' },
                { emoji: '🤔', label: 'MEH' },
              ].map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => setReaction(item.emoji)}
                  className={`flex-1 px-6 py-4 border-2 transition-all ${
                    reaction === item.emoji
                      ? 'border-mono-amber bg-mono-amber text-mono-black'
                      : 'border-mono-charcoal hover:border-mono-amber'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="font-display font-bold text-sm">
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <SocialShare
              title={article.title}
              url={shareUrl}
              variant="horizontal"
            />
          </div>
        </div>

        <RelatedArticles
          currentSlug={article.slug}
          category={article.category}
          articles={allArticles}
        />

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
        /* Inline [n] citation marks → superscript reference links. */
        .article-content a.citation-ref {
          font-size: 0.7em;
          vertical-align: super;
          line-height: 0;
          font-weight: 700;
          text-decoration: none;
          color: var(--mono-amber-strong, var(--mono-amber));
          padding: 0 0.1em;
        }
        .article-content a.citation-ref::before { content: '['; }
        .article-content a.citation-ref::after { content: ']'; }
        .article-content a.citation-ref:hover { text-decoration: underline; }
        /* GitHub-flavoured markdown tables (enabled via remark-gfm) — a real
           depth surface for structured comparison inside prose. */
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.95rem;
        }
        .article-content th,
        .article-content td {
          border: 1px solid var(--mono-charcoal);
          padding: 0.6rem 0.8rem;
          text-align: left;
          vertical-align: top;
        }
        .article-content thead th {
          background: var(--mono-black);
          color: var(--mono-amber);
          font-family: var(--font-display);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
        }
        .article-content tbody tr:nth-child(even) {
          background: var(--mono-soft-white);
        }
      `}</style>
    </div>
  );
}
