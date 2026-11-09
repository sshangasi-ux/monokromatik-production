'use client';

import { useEffect } from 'react';
import { Printer } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * Print / save-as-PDF control for the Ownership Map deliverable. The map is a real
 * one-page rendering of the live Ownership-100 ledger; "download" is the browser's
 * own print-to-PDF, so the file the reader keeps is the exact data on the page —
 * nothing fabricated, nothing generated server-side. Fires `lead_magnet_view` once
 * on mount so we can see how many captured readers actually open the asset.
 */
export default function PrintButton() {
  useEffect(() => {
    track('lead_magnet_view', { asset: 'ownership-map' });
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        track('lead_magnet_download', { asset: 'ownership-map', mode: 'print' });
        if (typeof window !== 'undefined') window.print();
      }}
      className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber/90 transition-colors print:hidden"
    >
      <Printer size={16} /> SAVE AS PDF
    </button>
  );
}
