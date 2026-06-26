'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'COPY CAPTION' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — no-op; the caption is still visible to select manually
    }
  };

  return (
    <button
      onClick={copy}
      className={`text-[11px] tracking-[0.16em] font-display font-bold px-4 py-2.5 transition-colors ${
        copied ? 'bg-mono-amber text-mono-black' : 'bg-mono-black text-mono-white hover:bg-mono-charcoal'
      }`}
    >
      {copied ? 'COPIED ✓' : label}
    </button>
  );
}
