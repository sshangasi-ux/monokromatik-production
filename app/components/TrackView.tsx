'use client';

import { useEffect } from 'react';
import { track } from '../../lib/analytics';

/**
 * Fires a single GA4 event when mounted — a tiny client island so server-rendered
 * pages (case studies, the Index) can emit a structured view event without
 * becoming client components themselves. Renders nothing.
 */
export default function TrackView({ event, params = {} }: { event: string; params?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, params);
    // Fire once on mount; params are stable for a given page render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
