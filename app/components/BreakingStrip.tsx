// The homepage "JUST BROKE" strip — the living edge of the breaking radar.
// Server component: reads the published Wire and shows the most recent confirmed
// break(s). Stays quiet (renders nothing) when the wire has no recent activity,
// so the homepage never shows a stale alarm.

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getRecentBreaks } from '../../lib/breaking-feed';

export default function BreakingStrip() {
  const recent = getRecentBreaks(72); // last 72h only — keep the homepage honest
  if (recent.length === 0) return null;
  const lead = recent[0];

  return (
    <Link
      href="/breaking"
      className="group block bg-mono-black border-y border-mono-amber/30 hover:border-mono-amber transition-colors"
      aria-label="The Wire — latest breaking intelligence"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
        <span className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mono-amber opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mono-amber" />
          </span>
          <span className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber">JUST BROKE</span>
        </span>
        <p className="min-w-0 flex-1 truncate font-display font-bold text-sm text-mono-white group-hover:text-mono-amber-bright transition-colors">
          {lead.title}
        </p>
        <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-[10px] tracking-[0.18em] font-display font-bold text-mono-gray group-hover:text-mono-amber">
          THE WIRE
          {recent.length > 1 && <span className="text-mono-amber">· {recent.length}</span>}
          <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
