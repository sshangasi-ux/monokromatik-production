'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Issue001KineticArtwork from './Issue001KineticArtwork';
import { proxify } from './MediaImage';

export interface CoverSlide {
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  imageUrl?: string;
  videoUrl?: string;
  mode: 'signal' | 'story' | 'intelligence';
}

function Background({ slide }: { slide: CoverSlide }) {
  if (slide.videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        src={slide.videoUrl}
        poster={slide.imageUrl}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (slide.imageUrl) {
    return (
      <img
        src={slide.imageUrl ? proxify(slide.imageUrl) : slide.imageUrl}
        alt=""
        className="img-duotone absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-[1400ms] scale-105"
      />
    );
  }

  if (slide.mode === 'signal') {
    return <Issue001KineticArtwork />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -right-28 top-16 h-[560px] w-[560px] rounded-full border border-mono-amber/30" />
      <div className="absolute -right-4 top-40 h-[430px] w-[430px] rounded-full border border-mono-amber/10" />
      <div className="absolute bottom-12 right-12 text-[18vw] font-display font-bold leading-none text-mono-white/[0.035]">01</div>
    </div>
  );
}

export default function LivingCover({ slides }: { slides: CoverSlide[] }) {
  const usableSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = usableSlides[activeIndex] || slides[0];

  useEffect(() => {
    if (usableSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % usableSlides.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, [usableSlides.length]);

  if (!active) return null;

  const isFoundingCover = active.mode === 'signal' && !active.imageUrl && !active.videoUrl;
  const coverHref = isFoundingCover ? '/issues/001' : active.href;
  const coverCta = isFoundingCover ? 'OPEN ISSUE 001' : active.cta;

  return (
    <section className="relative min-h-[calc(100vh-5rem)] bg-mono-black overflow-hidden text-mono-white">
      <Background slide={active} />
      <div className="absolute inset-0 bg-gradient-to-r from-mono-black via-mono-black/82 to-mono-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-transparent to-mono-black/25" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] flex flex-col justify-between py-10 md:py-14">
        <div className="flex items-center justify-between border-b border-mono-white/20 pb-5">
          <p className="text-[11px] tracking-[0.36em] font-display font-bold text-mono-amber">THE LIVING MAGAZINE / ISSUE 001</p>
          <p className="hidden md:block text-[11px] tracking-[0.25em] text-mono-gray font-display">SIGNAL · INTELLIGENCE · VOICES · CULTURE</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_330px] gap-12 items-end py-14">
          <div className="max-w-4xl">
            <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-7">{active.kicker}</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-feature font-bold leading-[0.95] tracking-tight">
              {active.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg md:text-xl font-body text-mono-soft-white leading-relaxed">
              {active.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={coverHref} className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-white">
                {coverCta} <ArrowRight size={18} />
              </Link>
              <Link href="/intelligence" className="inline-flex items-center gap-2 border border-mono-white/65 px-7 py-4 font-display font-bold text-mono-white hover:border-mono-amber transition-colors">
                ENTER INTELLIGENCE
              </Link>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-mono-white/20 pt-6 lg:pt-0 lg:pl-8">
            <p className="text-[11px] tracking-[0.28em] font-display font-bold text-mono-soft-white mb-5">IN THIS ISSUE</p>
            {usableSlides.map((slide, index) => (
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                key={`${slide.mode}-${slide.title}`}
                className={`block w-full text-left py-4 border-t border-mono-white/15 transition-colors ${index === activeIndex ? 'text-mono-white' : 'text-mono-gray hover:text-mono-white'}`}
              >
                <span className={`block text-[10px] tracking-[0.26em] font-display font-bold mb-2 ${index === activeIndex ? 'text-mono-amber' : ''}`}>{slide.kicker}</span>
                <span className="block font-display text-base font-bold leading-tight text-mono-soft-white">{slide.title}</span>
              </button>
            ))}
            {active.videoUrl && (
              <div className="mt-5 flex items-center gap-2 text-xs tracking-widest font-display text-mono-amber">
                <PlayCircle size={17} /> MOTION COVER
              </div>
            )}
            {isFoundingCover && (
              <div className="mt-5 flex items-center gap-2 text-xs tracking-widest font-display text-mono-amber">
                <PlayCircle size={17} /> KINETIC COVER
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-mono-white/20 pt-5 text-[11px] tracking-[0.2em] font-display font-bold">
          <span className="text-mono-amber">SIGNAL NOW</span>
          <span>African authorship in global work</span>
          <span className="text-mono-gray">/</span>
          <span>Diaspora demand</span>
          <span className="text-mono-gray">/</span>
          <span>Creative commerce</span>
          <span className="text-mono-gray">/</span>
          <span>Brand futures</span>
        </div>
      </div>
    </section>
  );
}
