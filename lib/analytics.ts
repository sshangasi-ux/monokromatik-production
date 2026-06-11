'use client';

import { sendGAEvent } from '@next/third-parties/google';

/**
 * Thin wrapper over GA4 (gtag) for MonoKromatik custom events. GA4 enhanced
 * measurement already auto-tracks page_view, scroll, outbound clicks, site
 * search and embedded-YouTube video engagement — so this is only for the
 * conversions/interactions GA can't infer (newsletter signups, article reads,
 * credited-source clicks). Safe no-op if gtag isn't loaded yet.
 *
 * See docs/ANALYTICS.md for the event catalogue + reporting guide.
 */
export function track(name: string, params: Record<string, unknown> = {}): void {
  try {
    sendGAEvent('event', name, params);
  } catch {
    // analytics must never break the UI
  }
}
