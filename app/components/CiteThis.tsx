'use client';

import { useState } from 'react';
import { Quote, Check, Copy } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * "Cite this" — a citation affordance for a research-grade intelligence brand.
 *
 * Two payoffs: credibility (we are sourcing-obsessed, so we make ourselves
 * citable), and authority — every citation that propagates is a reference back
 * to us. A frictionless, on-site version of the backlink play the badge program
 * reached for. Pure craft, no backend: formats the reference and copies it.
 */

function citationDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CiteThis({
  title,
  author,
  publishedAt,
  url,
  publication = 'MonoKromatik',
  kind = 'analysis',
}: {
  title: string;
  author: string;
  publishedAt: string;
  url: string;
  publication?: string;
  /** Label for the copied-state announce + analytics (e.g. 'report', 'analysis'). */
  kind?: string;
}) {
  const [copied, setCopied] = useState(false);
  const dateStr = citationDate(publishedAt);
  const citation =
    `${author}. “${title}.” ${publication}` +
    `${dateStr ? `, ${dateStr}` : ''}. ${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      // Clipboard blocked (older webviews) — fall back to a transient selection.
      const ta = document.createElement('textarea');
      ta.value = citation;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* best-effort */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    track('cite_copy', { url, kind });
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section className="my-10 border border-mono-charcoal/30 bg-mono-soft-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Quote size={16} className="text-mono-amber-strong" />
        <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-mono-black">
          Cite this {kind}
        </h3>
      </div>
      <p className="mb-4 select-all font-body text-[13.5px] leading-relaxed text-mono-charcoal">
        {citation}
      </p>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 border border-mono-charcoal px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-mono-black transition-colors hover:border-mono-amber hover:text-mono-amber-strong"
      >
        {copied ? (
          <>
            <Check size={15} className="text-mono-amber-strong" /> Copied
          </>
        ) : (
          <>
            <Copy size={15} /> Copy citation
          </>
        )}
      </button>
    </section>
  );
}
