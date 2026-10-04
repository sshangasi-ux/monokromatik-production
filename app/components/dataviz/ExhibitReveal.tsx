'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Scroll-reveal for report exhibits: the card fades/rises in and its bars grow
// from zero as it enters the viewport (the Pudding-style "the chart builds as
// you read it"). Deliberately a progressive enhancement:
//   • the exhibit is rendered at its TRUE values server-side (SSR / no-JS / SEO
//     and the AI-layer all see the real figures),
//   • the hiding + grow classes are added by JS ONLY, so a no-JS or
//     reduced-motion visitor just sees the finished exhibit,
//   • a fallback timer guarantees the exhibit is never left hidden if the
//     observer somehow never fires.
// The actual motion lives in globals.css under `.ex-anim` (reduced-motion-safe).
export default function ExhibitReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') return; // static

    el.classList.add('ex-anim'); // collapse to the pre-reveal state
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      el.classList.add('ex-anim--in');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);

    // Safety net: if the observer never fires (edge cases), reveal anyway so
    // the exhibit can never be stuck hidden.
    const fallback = window.setTimeout(reveal, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className="ex-reveal">
      {children}
    </div>
  );
}
