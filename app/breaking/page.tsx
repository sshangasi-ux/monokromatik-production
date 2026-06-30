import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Radar, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getBreaks, type PublishedBreak } from '../../lib/breaking-feed';

export const metadata: Metadata = {
  title: 'The Wire — Breaking African & Diaspora Brand Intelligence | MonoKromatik',
  description:
    'The always-on breaking radar, made public. AI-confirmed major breaks across African and diaspora brands, music, sport, fashion, film and the drinks economy — the moment they break, with the MonoKromatik read.',
  alternates: { canonical: 'https://www.monokromatik.com/breaking' },
  openGraph: {
    title: 'The Wire — Breaking African & Diaspora Brand Intelligence',
    description: 'The always-on radar, made public. Major breaks in our focus segments, the moment they break.',
    url: 'https://www.monokromatik.com/breaking',
  },
};

function fmtUTC(iso: string): string {
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return '';
  return (
    d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
    }) + ' UTC'
  );
}

function BreakRow({ b }: { b: PublishedBreak }) {
  return (
    <article className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-8 bg-mono-white p-6 md:p-8">
      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-4">
        <span className="inline-flex items-center justify-center text-[10px] tracking-[0.16em] font-display font-bold border border-mono-amber bg-mono-amber text-mono-black px-2.5 py-1.5">
          {b.importance}/5
        </span>
        <time className="text-[11px] font-body text-mono-gray" dateTime={b.detectedAt}>{fmtUTC(b.detectedAt)}</time>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber mb-3">
          {b.source.toUpperCase()} · {b.category.toUpperCase()}
        </p>
        <a
          href={b.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-start gap-2 text-2xl md:text-3xl font-display font-bold text-mono-black hover:text-mono-amber transition-colors leading-tight"
        >
          <span>{b.title}</span>
          <ArrowUpRight size={20} className="mt-1.5 shrink-0 text-mono-gray group-hover:text-mono-amber" />
        </a>
        <p className="mt-4 font-body text-mono-charcoal leading-relaxed max-w-3xl">{b.why}</p>
      </div>
    </article>
  );
}

export default function BreakingPage() {
  const breaks = getBreaks();

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-7">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mono-amber opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-mono-amber" />
            </span>
            <span className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber-bright">THE WIRE · ALWAYS ON</span>
          </div>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-feature font-bold leading-[0.97]">
            The moment it breaks.
          </h1>
          <p className="max-w-3xl mt-8 text-2xl md:text-3xl text-mono-soft-white font-feature italic leading-snug">
            Our always-on radar watches the African and diaspora beats and surfaces only the genuine breaks — each with
            the one-line read on why it matters.
          </p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">AI-CONFIRMED · IMPORTANCE ≥ 4/5</span>
            <span>BRANDS · MUSIC · SPORT · FASHION · FILM · DRINKS</span>
            <span>AFRICA &amp; DIASPORA</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-14">
        <div className="min-w-0">
          {breaks.length === 0 ? (
            <div className="border border-mono-gray/25 bg-mono-white p-10 text-center">
              <Radar className="mx-auto text-mono-amber mb-5" size={28} />
              <p className="text-xl font-display font-bold text-mono-black">The wire is quiet.</p>
              <p className="mt-3 font-body text-mono-charcoal max-w-md mx-auto">
                No major break in our focus segments right now. The radar is still watching — confirmed breaks land here
                the moment they clear the bar.
              </p>
            </div>
          ) : (
            <div className="space-y-px border border-mono-gray/25 bg-mono-gray/25">
              {breaks.map((b) => (
                <BreakRow key={b.link} b={b} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 h-fit space-y-8">
          <div className="bg-mono-soft-white border-l-4 border-mono-amber p-6">
            <Radar className="text-mono-amber mb-5" size={22} />
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">HOW THE WIRE WORKS</p>
            <p className="font-body text-sm text-mono-charcoal leading-relaxed">
              An AI desk reads trusted feeds on a tight cycle and flags only genuine major breaks with a clear African or
              diaspora link inside our beats. Each is human-reviewed before it publishes here — provenance, not a firehose.
            </p>
          </div>
          <Link href="/pulse" className="block border border-mono-gray/20 p-6 hover:border-mono-amber transition-colors">
            <p className="font-display font-bold text-mono-black">Pulse — the daily read</p>
            <p className="text-sm font-body text-mono-charcoal mt-2">The wider stream of trending African stories, refreshed daily.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-mono-amber-strong font-display font-bold text-sm">OPEN PULSE <ArrowRight size={15} /></span>
          </Link>
          <Link href="/signal" className="block border border-mono-black p-6 hover:border-mono-amber transition-colors">
            <p className="font-display font-bold text-mono-black">Signal — the authored view</p>
            <p className="text-sm font-body text-mono-charcoal mt-2">When a break becomes a brand read, it graduates to Signal.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-mono-amber-strong font-display font-bold text-sm">READ SIGNAL <ArrowRight size={15} /></span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
