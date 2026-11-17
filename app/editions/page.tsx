import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getLiveEditions } from '../../lib/editions';

const SITE = 'https://www.monokromatik.com';
const URL = `${SITE}/editions`;

export const metadata: Metadata = {
  title: 'Editions — the collectible issue | MonoKromatik',
  description:
    'MonoKromatik Editions: a cover-led, image-rich issue on who owns African culture and who keeps the money. Free to the list — later, a collectible object.',
  alternates: { canonical: URL },
  openGraph: { title: 'MonoKromatik Editions', url: URL, type: 'website' },
};

export default function EditionsIndex() {
  const editions = getLiveEditions();
  const lead = editions[0];

  return (
    <div className="min-h-screen bg-mono-black text-mono-white">
      <Navigation />

      <header className="mx-auto max-w-5xl px-5 py-16 text-center md:py-24">
        <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-mono-gray-bright">
          MONO<span className="text-mono-amber">KROMATIK</span>
        </p>
        <h1 className="mt-6 font-feature text-6xl font-black leading-[0.92] tracking-tight md:text-8xl">Editions</h1>
        <p className="mx-auto mt-6 max-w-xl font-body text-lg text-mono-soft-white">
          A cover-led, image-rich issue on who owns African culture and who keeps the money. Free to the list — later,
          a collectible object.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24">
        {!lead ? (
          <p className="text-center font-body text-mono-gray">The first edition is on its way.</p>
        ) : (
          <div className="space-y-8">
            {editions.map((e, i) => (
              <Link
                key={e.slug}
                href={`/editions/${e.slug}`}
                className="group grid gap-6 rounded border border-mono-gray/25 bg-mono-charcoal p-6 transition-colors hover:border-mono-amber md:grid-cols-[1fr_1.4fr] md:p-8"
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden rounded-sm md:aspect-[4/3]"
                  style={{ background: 'linear-gradient(135deg, #E8631C, #8F3D12)' }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                  />
                  <div className="absolute inset-0 flex items-end p-5">
                    <span className="font-feature text-2xl font-black leading-[0.95] text-[#F7F3EC]">{e.coverTitle}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-mono-amber">
                    Edition {e.number} {i === 0 ? '· Current' : ''}
                  </p>
                  <h2 className="mt-2 font-feature text-3xl font-black leading-none tracking-tight text-mono-white transition-colors group-hover:text-mono-amber md:text-4xl">
                    {e.title}
                  </h2>
                  <p className="mt-4 max-w-[52ch] font-body text-mono-soft-white">{e.standfirst}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-mono-amber">
                    Read the edition <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
