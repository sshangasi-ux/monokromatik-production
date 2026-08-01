'use client';

import { useEffect, useState } from 'react';

/**
 * Countdown to a fixed launch instant. Client-only: the remaining time is
 * computed after mount (never on the server) so there is no hydration mismatch,
 * and it ticks every second. When the target has passed it renders `liveLabel`.
 *
 * `target` is an ISO instant — for Edition 01, 2026-09-30T06:00:00Z (08:00 SAST).
 */
type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntil(targetMs: number): Remaining | null {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function CountdownTimer({
  target,
  liveLabel = 'LIVE NOW',
  tone = 'dark',
}: {
  target: string;
  liveLabel?: string;
  /** 'dark' = light text on a dark surface; 'light' = dark text on a light surface. */
  tone?: 'dark' | 'light';
}) {
  const targetMs = new Date(target).getTime();
  // null until mounted → the server renders the placeholder, the client fills it in.
  const [left, setLeft] = useState<Remaining | null | undefined>(undefined);

  useEffect(() => {
    setLeft(remainingUntil(targetMs));
    const id = setInterval(() => setLeft(remainingUntil(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const boxBase =
    tone === 'dark'
      ? 'bg-mono-white/5 border-mono-white/15 text-mono-white'
      : 'bg-mono-black/5 border-mono-black/15 text-mono-black';
  const labelColor = tone === 'dark' ? 'text-mono-gray-bright' : 'text-mono-gray';

  // Mounted and past the target.
  if (left === null) {
    return (
      <span className={`inline-block text-sm font-display font-bold tracking-[0.2em] ${tone === 'dark' ? 'text-mono-amber-bright' : 'text-mono-amber-strong'}`}>
        {liveLabel}
      </span>
    );
  }

  const units: [string, number | null][] = [
    ['DAYS', left?.days ?? null],
    ['HRS', left?.hours ?? null],
    ['MIN', left?.minutes ?? null],
    ['SEC', left?.seconds ?? null],
  ];

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Countdown to Edition 01">
      {units.map(([label, value]) => (
        <div key={label} className={`flex flex-col items-center border ${boxBase} px-3 py-2.5 sm:px-4 sm:py-3 min-w-[3.75rem] sm:min-w-[4.5rem]`}>
          <span className="text-2xl sm:text-3xl font-display font-bold tabular-nums leading-none">
            {value === null ? '—' : String(value).padStart(2, '0')}
          </span>
          <span className={`mt-1.5 text-[9px] sm:text-[10px] tracking-[0.18em] font-display font-bold ${labelColor}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
