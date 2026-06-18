'use client';

// Root error boundary. Catches render/runtime errors in any route segment and
// shows a branded recovery screen instead of a blank crash. `reset()` re-renders
// the failed segment without a full reload.

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console; a monitoring hook (e.g. Sentry) can attach here later.
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-mono-black text-mono-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber mb-5">SIGNAL LOST</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
          Something broke on our end.
        </h1>
        <p className="mt-6 text-lg text-mono-soft-white font-body">
          This page hit an unexpected error. Try again — and if it persists, head back to the homepage.
        </p>
        <div className="mt-9 flex flex-wrap gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-mono-amber text-mono-white font-display font-bold hover:bg-mono-amber/90 transition-colors"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-mono-white/30 text-mono-white font-display font-bold hover:bg-mono-white/10 transition-colors"
          >
            BACK TO HOME
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-mono-gray font-body">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
