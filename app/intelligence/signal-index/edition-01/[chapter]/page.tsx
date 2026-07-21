import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '../../../../components/Navigation';
import EditionExhibit from '../../../../components/dataviz/EditionExhibit';
import { CHAPTERS, chapterBySlug, chapterNeighbours } from '../../../../../lib/edition-01-chapters';
import { EDITION } from '../../../../../lib/edition-01';

export const revalidate = 3600;
const SITE = 'https://www.monokromatik.com';
const BASE = `${SITE}/intelligence/signal-index/edition-01`;

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export async function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapter } = await params;
  const c = chapterBySlug(chapter);
  if (!c) return { title: 'Chapter not found | MonoKromatik' };
  const title = `${c.title} — Edition ${EDITION.number} | MonoKromatik`;
  return {
    title,
    description: c.standfirst,
    alternates: { canonical: `${BASE}/${c.slug}` },
    openGraph: { title, description: c.standfirst, type: 'article', url: `${BASE}/${c.slug}` },
  };
}

/** Stable, readable anchor for a heading — so any section can be linked to. */
const anchorFor = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export default async function ChapterPage({ params }: PageProps) {
  const { chapter } = await params;
  const c = chapterBySlug(chapter);
  if (!c) notFound();
  const { prev, next } = chapterNeighbours(c.slug);

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-14 md:py-20 border-b border-mono-white/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/signal-index/edition-01"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright hover:text-mono-amber-bright transition-colors mb-8"
          >
            <ArrowLeft size={14} /> EDITION {EDITION.number}
          </Link>
          <p className="text-[11px] tracking-[0.32em] font-display font-bold text-mono-amber-bright">
            CHAPTER {String(c.n).padStart(2, '0')} OF {String(CHAPTERS.length).padStart(2, '0')} · {c.kicker}
          </p>
          <h1 className="mt-5 font-feature text-4xl md:text-6xl font-normal leading-[1.04] max-w-3xl">{c.title}</h1>
          <p className="mt-6 font-body text-lg md:text-xl text-mono-soft-white/90 max-w-2xl leading-relaxed">
            {c.standfirst}
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:grid lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
        {/* Persistent chapter rail — desktop only. Below lg the contents live at
            the foot of the chapter instead, rather than pinning a nav to a small
            screen where it would cost more than it gives. */}
        <nav aria-label="Edition contents" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-gray mb-4">CONTENTS</p>
            <ol className="space-y-2.5">
              {CHAPTERS.map((x) => {
                const current = x.slug === c.slug;
                return (
                  <li key={x.slug}>
                    <Link
                      href={`/intelligence/signal-index/edition-01/${x.slug}`}
                      aria-current={current ? 'page' : undefined}
                      className={`block text-[11px] leading-snug font-display font-bold tracking-[0.06em] transition-colors ${
                        current ? 'text-mono-amber-strong' : 'text-mono-gray hover:text-mono-black'
                      }`}
                    >
                      <span className="tabular-nums">{String(x.n).padStart(2, '0')}</span>
                      {'  '}
                      {x.kicker}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        <article className="min-w-0 max-w-[68ch]">
          {c.sections.map((s, i) => (
            <section key={i} className="mb-10">
              {s.heading && (
                <h2 id={anchorFor(s.heading)} className="group scroll-mt-28 font-feature text-2xl md:text-3xl text-mono-black leading-tight mb-4">
                  {s.heading}
                  <a
                    href={`#${anchorFor(s.heading)}`}
                    aria-label={`Link to “${s.heading}”`}
                    className="ml-2 text-mono-gray/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-lg"
                  >
                    ¶
                  </a>
                </h2>
              )}
              {s.paras?.map((p, j) => (
                <p key={j} className="font-body text-[17px] md:text-lg text-mono-charcoal leading-relaxed mb-4">
                  {p}
                </p>
              ))}
              {s.exhibit && (
                /* Exhibits break out of the reading column — they are the part
                   most likely to be screenshotted, so they get the width. */
                <div className="lg:-mx-16 xl:-mx-24">
                  <EditionExhibit exhibit={s.exhibit} />
                </div>
              )}
            </section>
          ))}

          {/* Every chapter closes the same way: three bullets, then the next
              chapter. Seven completions across the edition, not one marathon. */}
          <section id="what-this-means" className="scroll-mt-28 border-t border-mono-gray/25 pt-8 mt-12">
            <p className="text-[10px] tracking-[0.3em] font-display font-bold text-mono-amber-strong">WHAT THIS MEANS</p>
            <ul className="mt-5 space-y-3">
              {c.whatThisMeans.map((b, i) => (
                <li key={i} className="font-feature italic text-mono-charcoal text-lg leading-relaxed pl-4 border-l-2 border-mono-amber/40">
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <nav aria-label="Chapter navigation" className="mt-12 grid sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/intelligence/signal-index/edition-01/${prev.slug}`}
                className="border border-mono-gray/25 bg-mono-white p-5 hover:border-mono-amber transition-colors group"
              >
                <span className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray">
                  ← CHAPTER {String(prev.n).padStart(2, '0')}
                </span>
                <span className="mt-2 block font-display font-bold text-mono-black group-hover:text-mono-amber-strong">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/intelligence/signal-index/edition-01/${next.slug}`}
                className="border border-mono-gray/25 bg-mono-white p-5 hover:border-mono-amber transition-colors group sm:text-right"
              >
                <span className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray">
                  CHAPTER {String(next.n).padStart(2, '0')} →
                </span>
                <span className="mt-2 block font-display font-bold text-mono-black group-hover:text-mono-amber-strong">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>

          {/* Mobile contents — at the foot, where it doesn't compete for space. */}
          <nav aria-label="Edition contents" className="lg:hidden mt-12 border-t border-mono-gray/25 pt-8">
            <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-gray mb-4">ALL CHAPTERS</p>
            <ol className="space-y-3">
              {CHAPTERS.map((x) => (
                <li key={x.slug}>
                  <Link
                    href={`/intelligence/signal-index/edition-01/${x.slug}`}
                    aria-current={x.slug === c.slug ? 'page' : undefined}
                    className={`block font-display font-bold text-sm ${
                      x.slug === c.slug ? 'text-mono-amber-strong' : 'text-mono-charcoal'
                    }`}
                  >
                    <span className="tabular-nums text-mono-gray">{String(x.n).padStart(2, '0')}</span> {x.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </article>
      </div>
    </div>
  );
}
