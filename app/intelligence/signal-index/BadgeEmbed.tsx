'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const SITE = 'https://www.monokromatik.com';

/** "Display your score" — a live badge preview + a copyable embed snippet. */
export default function BadgeEmbed({ slug, brand, score }: { slug: string; brand: string; score: number }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = `${SITE}/intelligence/signal-index/${slug}`;
  const badgeUrl = `${SITE}/api/badge/${slug}.svg`;
  const snippet = `<a href="${pageUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="${brand} — Cultural-Signal Index score ${score}/100" width="340" height="120" />\n</a>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">DISPLAY YOUR SCORE</p>
      <div className="grid md:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Live preview — the same endpoint brands embed; next/image would proxy
            the URL and defeat the purpose of showing the real embed output. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/badge/${slug}.svg`} alt={`${brand} — Cultural-Signal Index badge`} width={340} height={120} className="border border-mono-gray/25" />
        <div>
          <p className="font-body text-mono-charcoal text-sm mb-3">
            Earned the score? Embed the live badge on your site — it always reflects your current rank and links back to your Index page.
          </p>
          <div className="relative">
            <pre className="text-[11px] leading-relaxed bg-mono-black text-mono-soft-white p-4 pr-12 overflow-x-auto font-mono whitespace-pre-wrap break-all">{snippet}</pre>
            <button
              onClick={copy}
              aria-label="Copy embed code"
              className="absolute top-3 right-3 p-2 bg-mono-white/10 hover:bg-mono-amber hover:text-mono-black text-mono-soft-white transition-colors"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          {copied && <p className="mt-2 text-[11px] font-display font-bold tracking-[0.16em] text-mono-amber-strong">COPIED</p>}
        </div>
      </div>
    </div>
  );
}
