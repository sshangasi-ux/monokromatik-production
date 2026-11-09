'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import LeadMagnetCapture from './LeadMagnetCapture';
import { track } from '../../lib/analytics';

// Shown-once-per-visitor exit-intent capture, mounted only on article pages (so the
// aggressive interruption never hits the home, report or checkout surfaces). It
// offers the same real lead magnet as the inline band — The African Ownership Map —
// so a reader about to leave still gets a reason to join the list.
//
// Trigger model:
//  - Desktop: mouse leaves through the TOP of the viewport (classic exit intent).
//  - Touch / no fine pointer: a scroll-depth threshold (engaged, nearing the end)
//    OR a dwell timeout — mobile has no mouseleave, so these stand in.
// Gated once per visitor via localStorage, every read/write wrapped in try/catch so
// a private window or blocked storage degrades to "show at most once this load",
// never throws. A short arm delay avoids firing on an immediate bounce.

const STORAGE_KEY = 'mk_exit_intent_shown_v1';
const ARM_DELAY_MS = 6000; // don't treat an instant bounce as intent
const MOBILE_TIMEOUT_MS = 40000; // fallback dwell trigger where there's no mouseleave
const SCROLL_TRIGGER = 0.55; // 55% depth on touch = engaged, worth the ask

function alreadyShown(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* storage unavailable (private mode / blocked) — fine, in-memory guard still holds */
  }
}

export default function ExitIntentLeadMagnet({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false); // in-memory guard: at most once per page load

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (alreadyShown()) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, ARM_DELAY_MS);

    const trigger = (reason: string) => {
      if (firedRef.current || !armed) return;
      firedRef.current = true;
      markShown();
      setOpen(true);
      track('exit_intent_shown', { source: `exit-intent:${slug}`, reason });
      cleanup();
    };

    const onMouseOut = (e: MouseEvent) => {
      // Mouse left through the top edge and out of the document.
      if (e.clientY <= 0 && !e.relatedTarget) trigger('mouse-leave');
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= SCROLL_TRIGGER) trigger('scroll-depth');
    };

    // Touch devices / coarse pointers never fire mouseleave — use scroll + timeout.
    const coarse =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

    let mobileTimer = 0;
    if (coarse) {
      window.addEventListener('scroll', onScroll, { passive: true });
      mobileTimer = window.setTimeout(() => trigger('dwell-timeout'), MOBILE_TIMEOUT_MS);
    } else {
      document.addEventListener('mouseout', onMouseOut);
    }

    function cleanup() {
      window.clearTimeout(armTimer);
      window.clearTimeout(mobileTimer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    }

    return cleanup;
  }, [slug]);

  // Escape-to-close while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Get The African Ownership Map"
    >
      <div
        className="absolute inset-0 bg-mono-black/70"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-mono-black border-2 border-mono-amber shadow-2xl p-6 md:p-8">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 text-mono-soft-white hover:text-mono-white transition-colors"
        >
          <X size={22} />
        </button>
        <LeadMagnetCapture
          tone="dark"
          source={`exit-intent:${slug}`}
          heading="Before you go — take the map"
          blurb="The African Ownership Map: one page, Africa’s most valuable brands, sorted by who really owns them. Every entry sourced. Yours free when you join The Weekly Signal."
        />
      </div>
    </div>
  );
}
