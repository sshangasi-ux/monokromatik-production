'use client';

import { useEffect, useRef } from 'react';
import { track } from '../../lib/analytics';

// Fires a semantic `report_view` on mount so the funnel has a denominator:
// view → report_buy_click → purchase. Params let us segment by tier/access and,
// crucially, flag when the view hit a locked gate (`locked`) — that's the
// paywall-encounter count we were missing. ReportFeature is a server component,
// so this one-shot client pinger carries the event. No-op safe (track swallows
// errors); the ref guards against double-fire under React strict mode.
export default function ReportView({
  slug,
  tier,
  access,
  locked,
}: {
  slug: string;
  tier: string;
  access: string;
  locked: boolean;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track('report_view', { slug, tier, access, locked });
  }, [slug, tier, access, locked]);
  return null;
}
