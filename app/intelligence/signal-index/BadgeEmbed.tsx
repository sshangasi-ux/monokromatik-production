'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { RUBRIC_VERSION, signalBand } from '../../../lib/signal-index';

const SITE = 'https://www.monokromatik.com';

/**
 * "Display your score" + "Cite this score" — a live badge preview with a
 * copyable embed snippet, and a copyable, canonical citation. Both exist to turn
 * a rating into a distribution surface: a badge is a backlink, a citation is a
 * quotable, linkable unit. Every third party who embeds or cites becomes an
 * inbound link — the cheapest authority a rating agency can earn.
 */
export default function BadgeEmbed({ slug, brand, score }: { slug: string; brand: string; score: number }) {
  const [copied, setCopied] = useState<string | null>(null);
  const pageUrl = `${SITE}/intelligence/signal-index/${slug}`;
  const badgeUrl = `${SITE}/api/badge/${slug}.svg`;
  const band = signalBand(score)?.band ?? '';

  const embed = `<a href="${pageUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="${brand} — Cultural-Signal Index score ${score}/100" width="340" height="120" />\n</a>`;
  const citation = `${brand} — Cultural-Signal Index score ${score}/100${band ? ` (${band})` : ''}. MonoKromatik, rubric ${RUBRIC_VERSION}. ${pageUrl}`;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const CopyButton = ({ text, k, label }: { text: string; k: string; label: string }) => (
    <button
      onClick={() => copy(text, k)}
      aria-label={label}
      className="absolute top-3 right-3 p-2 bg-mono-white/10 hover:bg-mono-amber hover:text-mono-black text-mono-soft-white transition-colors"
    >
      {copied === k ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );

  return (
    <div className="space-y-10">
      {/* Display the badge — the backlink. */}
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
              <pre className="text-[11px] leading-relaxed bg-mono-black text-mono-soft-white p-4 pr-12 overflow-x-auto font-mono whitespace-pre-wrap break-all">{embed}</pre>
              <CopyButton text={embed} k="embed" label="Copy embed code" />
            </div>
            {copied === 'embed' && <p className="mt-2 text-[11px] font-display font-bold tracking-[0.16em] text-mono-amber-strong">COPIED</p>}
          </div>
        </div>
      </div>

      {/* Cite the score — the quotable, linkable unit. */}
      <div>
        <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">CITE THIS SCORE</p>
        <p className="font-body text-mono-charcoal text-sm mb-3">
          Writing about this rating? Copy the citation — it carries the score, the rubric version and a link back, so the number always travels with its source.
        </p>
        <div className="relative">
          <pre className="text-[12px] leading-relaxed bg-mono-white border border-mono-gray/25 text-mono-charcoal p-4 pr-12 overflow-x-auto font-body whitespace-pre-wrap break-words">{citation}</pre>
          <button
            onClick={() => copy(citation, 'cite')}
            aria-label="Copy citation"
            className="absolute top-3 right-3 p-2 bg-mono-black/5 hover:bg-mono-amber hover:text-mono-black text-mono-charcoal transition-colors"
          >
            {copied === 'cite' ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        {copied === 'cite' && <p className="mt-2 text-[11px] font-display font-bold tracking-[0.16em] text-mono-amber-strong">COPIED</p>}
      </div>
    </div>
  );
}
