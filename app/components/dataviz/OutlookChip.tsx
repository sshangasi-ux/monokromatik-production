// The outlook chip — direction, and the probability it stands for.
//
// Direction is carried by a glyph and a word, never by colour alone: the same
// accessibility rule the exhibits follow, and it keeps the chip legible in
// monochrome print and in a screenshot. Amber is reserved for Watch, which is
// the only state that asserts a 90-day clock.

import type { Outlook, OutlookDirection } from '../../../lib/outlook';
import { outlookDefinition, OUTLOOK_THRESHOLD, WATCH_THRESHOLD } from '../../../lib/outlook';

const GLYPH: Record<OutlookDirection, string> = {
  positive: '▲',
  negative: '▼',
  developing: '◆',
  stable: '—',
};

export default function OutlookChip({
  outlook,
  size = 'sm',
}: {
  outlook?: Outlook | null;
  size?: 'sm' | 'lg';
}) {
  const direction: OutlookDirection = outlook?.direction ?? 'stable';
  const def = outlookDefinition(direction);
  const watch = Boolean(outlook?.watch);
  const big = size === 'lg';

  const title = watch
    ? `${def.label} · on watch — ${WATCH_THRESHOLD}`
    : `${def.label} outlook — ${direction === 'stable' ? 'no such likelihood identified' : OUTLOOK_THRESHOLD}`;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 border font-display font-bold tracking-[0.1em] ${
        watch ? 'border-mono-amber text-mono-amber-strong' : 'border-mono-black/25 text-mono-black'
      } ${big ? 'text-xs px-2.5 py-1.5' : 'text-[10px] px-1.5 py-0.5'}`}
    >
      <span aria-hidden="true">{GLYPH[direction]}</span>
      {def.label.toUpperCase()}
      {watch && <span className="text-mono-amber-strong">· WATCH</span>}
    </span>
  );
}
