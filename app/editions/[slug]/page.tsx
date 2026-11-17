import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navigation from '../../components/Navigation';
import NewsletterSignup from '../../components/NewsletterSignup';
import EditionCover from '../../components/EditionCover';
import OwnershipLadder from '../../components/OwnershipLadder';
import { getAllEditions, getEdition } from '../../../lib/editions';

const SITE = 'https://www.monokromatik.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEditions().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) return { title: 'Edition not found | MonoKromatik' };
  const url = `${SITE}/editions/${edition.slug}`;
  const title = `${edition.title} — Edition ${edition.number} | MonoKromatik`;
  return {
    title,
    description: edition.standfirst,
    alternates: { canonical: url },
    openGraph: { title: `${edition.title} — Edition ${edition.number}`, description: edition.standfirst, url, type: 'article' },
  };
}

const TICKER = ['Rented, not owned', 'Who owns the upside?', 'Free to the list', 'Print the receipts'];

export default async function EditionPage({ params }: PageProps) {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) notFound();

  return (
    <div className="min-h-screen bg-mono-black text-mono-white">
      <Navigation />

      {/* ── Ticker ───────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-mono-black bg-mono-amber text-mono-black" aria-hidden="true">
        <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex">
              <span className="py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.12em]">
                Edition {edition.number} · {edition.title}
              </span>
              {TICKER.map((t) => (
                <span key={t} className="flex">
                  <span className="px-5 py-2.5 opacity-50">✳</span>
                  <span className="py-2.5 font-display text-[13px] font-bold uppercase tracking-[0.12em]">{t}</span>
                </span>
              ))}
              <span className="px-5 py-2.5 opacity-50">✳</span>
            </div>
          ))}
        </div>
      </div>

      <main>
        {/* ── Cover ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-14">
            <div>
              <p className="font-display text-[13px] font-bold uppercase tracking-[0.25em] text-mono-amber">
                Edition {edition.number} · {edition.title}
              </p>
              <h1 className="mt-4 font-feature text-5xl font-black leading-[0.92] tracking-tight text-balance md:text-7xl">
                {edition.coverTitle}
              </h1>
              <p className="mt-5 max-w-[30ch] font-feature text-xl italic leading-snug text-mono-soft-white md:text-2xl">
                {edition.coverLine}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 font-display text-[12.5px] uppercase tracking-[0.15em] text-mono-gray">
                <span className="rounded-sm bg-mono-amber px-2.5 py-1 font-bold text-mono-black">Free to the list</span>
                <span>Issue {edition.number}</span>
                <span>{edition.theme}</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#join"
                  className="rounded-sm bg-mono-amber px-5 py-3 font-display text-[12.5px] font-bold uppercase tracking-[0.12em] text-mono-black transition-colors hover:bg-mono-soft-white"
                >
                  Get Edition {edition.number} free
                </a>
                <a
                  href="#contents"
                  className="rounded-sm border border-mono-gray/40 px-5 py-3 font-display text-[12.5px] font-bold uppercase tracking-[0.12em] text-mono-white transition-colors hover:border-mono-amber hover:text-mono-amber"
                >
                  What&rsquo;s inside
                </a>
              </div>
            </div>

            <EditionCover number={edition.number} coverTitle={edition.coverTitle} dateLabel={edition.dateLabel} />
          </div>
        </section>

        {/* ── Contents ───────────────────────────────────────── */}
        <section id="contents" className="border-t border-mono-gray/20">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.3em] text-mono-amber">
              Inside Edition {edition.number}
            </p>
            <h2 className="mt-3 font-feature text-3xl font-black leading-none tracking-tight md:text-5xl">
              The receipts, in one issue.
            </h2>
            <p className="mt-4 max-w-[60ch] font-body text-lg text-mono-soft-white">{edition.standfirst}</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {edition.contents.map((item) => (
                <Link key={item.no} href={item.href} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-mono-gray/25">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(232,99,28,0.8), rgba(12,11,10,0.95)), repeating-linear-gradient(45deg, #1b1916 0 9px, #211d18 9px 18px)',
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 py-2 font-display text-[9.5px] uppercase tracking-[0.1em] text-white/75">
                      Image: sourced + credited
                    </div>
                  </div>
                  <p className="mt-3.5 font-display text-[12px] font-bold uppercase tracking-[0.15em] text-mono-amber">
                    {item.no} · {item.kind}
                  </p>
                  <h3 className="mt-1.5 font-feature text-xl font-bold leading-tight text-mono-white transition-colors group-hover:text-mono-amber">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 font-body text-[0.95rem] text-mono-gray-bright">{item.blurb}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature spread ─────────────────────────────────── */}
        <section id="feature" className="border-t border-mono-gray/20">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.3em] text-mono-amber">
              {edition.feature.kicker}
            </p>
            <h2 className="mt-3 font-feature text-3xl font-black leading-none tracking-tight md:text-5xl">
              {edition.feature.title}
            </h2>

            <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                {edition.feature.body.map((para, i) => (
                  <p
                    key={i}
                    className={`mb-5 font-body text-[1.08rem] leading-relaxed text-mono-soft-white ${
                      i === 0
                        ? '[&::first-letter]:float-left [&::first-letter]:mr-2 [&::first-letter]:font-feature [&::first-letter]:text-[4.2em] [&::first-letter]:font-black [&::first-letter]:leading-[0.72] [&::first-letter]:text-mono-amber'
                        : ''
                    }`}
                  >
                    {para}
                  </p>
                ))}
                <blockquote className="my-7 border-l-[3px] border-mono-amber pl-5 font-feature text-2xl font-semibold italic leading-snug text-mono-white md:text-3xl">
                  {edition.feature.pullQuote}
                </blockquote>
                <Link
                  href={edition.feature.href}
                  className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-mono-amber hover:text-mono-amber-bright"
                >
                  Read the full feature <ArrowRight size={15} />
                </Link>
              </div>

              {edition.exhibit === 'ownership-ladder' && <OwnershipLadder />}
            </div>
          </div>
        </section>

        {/* ── Join the list ──────────────────────────────────── */}
        <section id="join" className="border-t border-mono-gray/20 bg-gradient-to-b from-mono-charcoal to-mono-black">
          <div className="mx-auto max-w-2xl px-5 py-16 text-center md:py-20">
            <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.3em] text-mono-amber">
              Edition {edition.number} — free to the list
            </p>
            <h2 className="mt-3 font-feature text-3xl font-black leading-none tracking-tight md:text-5xl">
              Get the issue before it&rsquo;s a product.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] font-body text-lg text-mono-soft-white">
              The first edition is free for subscribers. Later editions become a collectible object — numbered, with
              variant covers. Join the list and Edition {edition.number} lands in your inbox.
            </p>
            <div className="mx-auto mt-7 max-w-md">
              <NewsletterSignup variant="inline" source={`editions-${edition.slug}`} />
            </div>
            <p className="mt-4 font-display text-[11px] uppercase tracking-[0.15em] text-mono-gray">
              No spam · one edition at a time · unsubscribe anytime
            </p>
          </div>
        </section>

        {/* ── The object / sell path ─────────────────────────── */}
        <section className="border-t border-mono-gray/20">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <p className="font-display text-[12.5px] font-bold uppercase tracking-[0.3em] text-mono-amber">The object</p>
            <h2 className="mt-3 font-feature text-3xl font-black leading-none tracking-tight md:text-5xl">
              From free read to collectible.
            </h2>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {edition.sell.map((s) => (
                <div key={s.phase} className="rounded border border-mono-gray/25 bg-mono-charcoal p-6">
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mono-amber">
                    {s.phase}
                  </p>
                  <h4 className="mt-2.5 font-feature text-xl font-semibold text-mono-white">{s.title}</h4>
                  <p className="mt-2 font-body text-[0.95rem] text-mono-gray-bright">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Colophon ───────────────────────────────────────── */}
        <footer className="border-t border-mono-gray/20">
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-5 py-10">
            <div>
              <p className="font-feature text-lg font-black text-mono-white">MonoKromatik</p>
              <p className="mt-1.5 font-display text-[11px] uppercase tracking-[0.1em] text-mono-gray">
                Edition {edition.number} · {edition.title} · {edition.dateLabel}
              </p>
              <p className="mt-2.5 max-w-[46ch] font-display text-[11px] uppercase tracking-[0.1em] text-mono-gray">
                Every image sourced and credited; no stock. Cover visuals are generative placeholders for the
                commissioned edition artwork.
              </p>
            </div>
            <Link href="/editions" className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-mono-amber hover:text-mono-amber-bright">
              All editions <ArrowUpRight size={16} />
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
