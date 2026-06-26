import type { Metadata } from 'next';
import Navigation from '../components/Navigation';
import { getAllArticles } from '../../lib/articles';
import { getBreaks } from '../../lib/breaking-feed';
import { articleCaption, breakCaption } from '../../lib/social-caption';
import CopyButton from './CopyButton';

const SITE = 'https://www.monokromatik.com';

// Internal tool — keep it out of search and the nav.
export const metadata: Metadata = {
  title: 'Social Studio | MonoKromatik',
  description: 'Ready-to-post Instagram cards + captions for the latest content.',
  robots: { index: false, follow: false },
};

interface Post {
  key: string;
  cardSrc: string;
  badge: string;
  destination: string;
  caption: string;
}

function PostRow({ post }: { post: Post }) {
  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6 bg-mono-white border border-mono-gray/25 p-5">
      {/* Card preview (1080×1350 portrait, scaled) */}
      <div className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cardSrc}
          alt="Instagram card preview"
          width={300}
          height={375}
          className="w-full border border-mono-gray/30 bg-mono-black"
        />
        <a
          href={post.cardSrc}
          download
          className="text-center text-[11px] tracking-[0.16em] font-display font-bold border border-mono-black text-mono-black px-4 py-2.5 hover:bg-mono-black hover:text-mono-white transition-colors"
        >
          DOWNLOAD CARD (1080×1350)
        </a>
      </div>

      {/* Caption + meta */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber">{post.badge}</span>
          <CopyButton text={post.caption} />
        </div>
        <pre className="flex-1 whitespace-pre-wrap font-body text-sm text-mono-charcoal bg-mono-soft-white border border-mono-gray/20 p-4 leading-relaxed overflow-hidden">{post.caption}</pre>
        <p className="mt-3 text-[11px] font-body text-mono-gray">
          Link for bio / Stories sticker:{' '}
          <a href={post.destination} className="text-mono-amber-strong break-all hover:underline">{post.destination}</a>
        </p>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const breaks = getBreaks().slice(0, 6);
  const articles = getAllArticles().slice(0, 12);

  const breakPosts: Post[] = breaks.map((b, i) => ({
    key: `break-${b.link}`,
    cardSrc: `/api/social-card?break=${i}`,
    badge: `THE WIRE · ${(b.category || '').toUpperCase()}`,
    destination: `${SITE}/breaking`,
    caption: breakCaption(b),
  }));

  const articlePosts: Post[] = articles.map((a) => ({
    key: `art-${a.slug}`,
    cardSrc: `/api/social-card?slug=${encodeURIComponent(a.slug)}`,
    badge: (a.category || 'ARTICLE').toUpperCase(),
    destination: `${SITE}/article/${a.slug}`,
    caption: articleCaption(a),
  }));

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-14 md:py-20 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-5">SOCIAL STUDIO · INTERNAL</p>
          <h1 className="max-w-4xl text-4xl md:text-6xl font-display font-bold leading-[0.98]">Post the work in two taps.</h1>
          <p className="mt-6 max-w-2xl text-mono-soft-white font-body text-lg">
            Every article and Wire break, pre-rendered as a 1080×1350 Instagram card with a ready-to-post caption.
            Download the card, copy the caption, paste — put the link in your bio (or a Stories link sticker), and post.
          </p>
        </div>
      </header>

      {breakPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">🔴 BREAKING — POST THESE FIRST (most timely)</h2>
          <div className="space-y-5">
            {breakPosts.map((p) => <PostRow key={p.key} post={p} />)}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-mono-gray/20">
        <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">LATEST ARTICLES</h2>
        <div className="space-y-5">
          {articlePosts.map((p) => <PostRow key={p.key} post={p} />)}
        </div>
      </section>
    </div>
  );
}
