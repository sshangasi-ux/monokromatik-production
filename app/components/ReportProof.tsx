import Link from 'next/link';
import { ShieldCheck, PenLine, RotateCcw, Sparkles, Quote } from 'lucide-react';
import { getAllReports } from '../../lib/reports';
import { getAllArticles } from '../../lib/articles';
import { getTestimonialsFor } from '../../lib/testimonials';

// The proof band for report pages — the "why believe this" layer at the point
// of the purchase decision. Everything here is VERIFIABLE: the corpus counts are
// computed from our own data, the named-sourcing/Bear-Case/guarantee claims are
// true of every report, and the AI-citation line reflects real referral traffic
// (ChatGPT, Copilot). The testimonial rail renders ONLY when real, attributable
// quotes exist in data/testimonials.json — we never fabricate social proof.
export default function ReportProof({
  slug,
  locked,
}: {
  slug: string;
  locked: boolean;
}) {
  const reportCount = getAllReports().length;
  const articleCount = getAllArticles().length;
  const quotes = getTestimonialsFor(slug);

  // Round down to a confident floor so the number never overstates and never
  // looks stale between additions (e.g. 57 → "50+", 195 → "190+").
  const floor = (n: number, step: number) => Math.floor(n / step) * step;

  const proofs: { icon: typeof ShieldCheck; title: string; body: string; href?: string }[] = [
    {
      icon: ShieldCheck,
      title: 'Named sourcing + a Bear Case',
      body: 'Every figure traces to public, named reporting — and we argue the strongest case against our own read, in writing.',
    },
    {
      icon: PenLine,
      title: 'Signed by Sibu Shangase',
      body: 'Written by the founder — Brands Director at Mast-Jägermeister, and the value-capture method the desk runs on.',
      href: '/about',
    },
  ];
  if (locked) {
    proofs.push({
      icon: RotateCcw,
      title: '7-day money-back',
      body: 'Not what you expected? Email within 7 days for a full refund — no questions.',
    });
  }

  return (
    <section className="not-prose mb-14 border border-mono-gray/30 bg-mono-soft-white p-7 md:p-9">
      <p className="text-[10px] tracking-[0.26em] font-display font-bold text-mono-amber-strong mb-6">
        WHY THIS IS CREDIBLE
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
        {proofs.map(({ icon: Icon, title, body, href }) => {
          const card = (
            <div className="bg-mono-white h-full p-5 flex flex-col gap-2.5">
              <Icon className="text-mono-amber-strong" size={20} />
              <h3 className="text-base font-display font-bold text-mono-black leading-tight">{title}</h3>
              <p className="text-[13.5px] font-body text-mono-charcoal leading-relaxed">{body}</p>
              {href && (
                <span className="mt-auto pt-1 text-[11px] tracking-[0.12em] font-display font-bold text-mono-amber-strong">
                  ABOUT THE DESK →
                </span>
              )}
            </div>
          );
          return href ? (
            <Link key={title} href={href} className="block hover:bg-mono-soft-white transition-colors">
              {card}
            </Link>
          ) : (
            <div key={title}>{card}</div>
          );
        })}
      </div>

      <p className="mt-6 flex items-start gap-2.5 text-[13px] font-body text-mono-charcoal leading-relaxed">
        <Sparkles size={15} className="text-mono-amber-strong mt-0.5 shrink-0" />
        <span>
          Part of a{' '}
          <span className="font-semibold text-mono-black tabular-nums">{floor(reportCount, 10)}+ report</span>,{' '}
          <span className="font-semibold text-mono-black tabular-nums">{floor(articleCount, 10)}+ analysis</span>{' '}
          intelligence corpus and a 100-brand ownership ledger — and surfaced by AI assistants, including ChatGPT and Copilot, when people ask who owns African brands.
        </span>
      </p>

      {quotes.length > 0 && (
        <div className="mt-7 pt-6 border-t border-mono-gray/25 space-y-5">
          {quotes.slice(0, 2).map((t, i) => (
            <figure key={i} className="flex gap-3">
              <Quote size={18} className="text-mono-amber-strong shrink-0 mt-1" />
              <div>
                <blockquote className="font-feature italic text-mono-black leading-snug text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-[12px] tracking-[0.04em] font-display font-bold text-mono-charcoal">
                  {t.sourceUrl ? (
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mono-amber-strong">
                      {t.name}
                    </a>
                  ) : (
                    t.name
                  )}
                  {t.role && <span className="text-mono-gray font-body font-normal"> — {t.role}</span>}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
