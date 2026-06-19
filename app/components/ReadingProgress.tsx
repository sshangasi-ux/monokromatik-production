'use client';

import { useEffect, useState } from 'react';

// A 2px amber progress bar pinned to the top of the viewport, driven by scroll
// depth. Decorative (aria-hidden); honors reduced-motion by simply not animating
// the transform (the value still updates, just without easing).
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-transparent">
      <div
        className="h-full bg-mono-amber origin-left"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
