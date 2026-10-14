'use client';

import { sendGAEvent } from '@next/third-parties/google';

/**
 * Thin wrapper over GA4 (gtag) for MonoKromatik custom events. GA4 enhanced
 * measurement already auto-tracks page_view, scroll, outbound clicks, site
 * search and embedded-YouTube video engagement — so this is only for the
 * conversions/interactions GA can't infer (newsletter signups, article reads,
 * credited-source clicks). Safe no-op if gtag never loads.
 *
 * Why the wait loop: events fired on mount (report_view, article_view, …) can
 * run *before* <GoogleAnalytics> has created the GA dataLayer. When that happens
 * @next/third-parties silently drops the event (console: "GA dataLayer dataLayer
 * does not exist"), which is why report_view read 0 and the view pingers
 * undercounted. We retry until the dataLayer exists, then send — gtag replays
 * the queue in order once it loads, so events pushed after init are attributed
 * correctly. User-interaction events (GA already up) send on the first attempt
 * with no delay.
 *
 * See docs/ANALYTICS.md for the event catalogue + reporting guide.
 */
const MAX_TRIES = 40; // ~6s at 150ms — covers a slow GA script load
const RETRY_MS = 150;

export function track(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return; // SSR / no-DOM: nothing to do
  let tries = 0;
  const send = (): void => {
    try {
      // Only send once the GA dataLayer queue exists; otherwise the event is
      // dropped. gtag drains the queue (js → config → our event) in order.
      if ((window as unknown as { dataLayer?: unknown[] }).dataLayer) {
        sendGAEvent('event', name, params);
        return;
      }
    } catch {
      return; // analytics must never break the UI
    }
    if (tries++ < MAX_TRIES) window.setTimeout(send, RETRY_MS);
  };
  send();
}
