'use client';

import { Printer } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * Save-as-PDF button for the print editions. Browsers expose "Save as PDF" from
 * the native print dialog, so window.print() is the most reliable, dependency-
 * free way to hand the reader a designed PDF of a page styled for @media print.
 */
export default function PrintButton({ label = 'SAVE AS PDF', source = 'print-edition' }: { label?: string; source?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        track('print_edition', { source });
        window.print();
      }}
      className="no-print inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors"
    >
      <Printer size={16} /> {label}
    </button>
  );
}
