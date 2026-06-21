import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MediaImage from './MediaImage';
import type { Issue } from '../../lib/issues';

// The art-directed magazine cover — composed, still, image-led. The "Vogue ×
// studio shot × arthouse" frame: full-contrast cover art, film grain, a print
// masthead lockup, a serif title, a dek and magazine coverlines, on a per-issue
// accent. `issue.cover.image` is the drop-in slot for commissioned / AI-base
// art; with no image it renders a designed type-only fallback. Deliberately not
// a carousel — a cover is composed once and meant to be shareable as one image.
export default function IssueCover({
  issue,
  primaryCta,
}: {
  issue: Issue;
  /** Optional primary CTA (e.g. the cover essay). Defaults to opening the issue. */
  primaryCta?: { label: string; href: string };
}) {
  const c = issue.cover;
  const accent = c?.accent ?? 'var(--mono-amber)';
  const cta = primaryCta ?? { label: 'OPEN THE ISSUE', href: `/issues/${issue.number}` };

  // Composed cover: the image already contains the full lockup (masthead, title,
  // coverlines). Show it whole — no duplicate type overlay — keeping the action
  // buttons and a screen-reader heading. Object-contain on bone so nothing crops.
  if (c?.composed && c.image) {
    return (
      <section className="relative overflow-hidden bg-mono-paper min-h-[90vh] flex flex-col items-center justify-center py-10 md:py-14">
        <h1 className="sr-only">{issue.title}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.image}
          alt={`${issue.title} — Issue ${issue.number} cover`}
          className="w-auto max-w-[92%] max-h-[78vh] object-contain shadow-2xl"
        />
        <div className="mt-8 flex flex-wrap gap-4 justify-center px-4">
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 px-7 py-4 font-display font-bold text-mono-black"
            style={{ background: accent }}
          >
            {cta.label} <ArrowRight size={18} />
          </Link>
          <Link
            href={`/issues/${issue.number}/cover`}
            className="inline-flex items-center gap-2 px-7 py-4 font-display font-bold border border-mono-ink/35 text-mono-ink hover:bg-mono-ink/5 transition-colors"
          >
            VIEW COVER STUDY
          </Link>
        </div>
        {c.imageCredit && (
          <p className="mt-6 text-[10px] tracking-[0.14em] text-mono-gray font-body px-4 text-center">{c.imageCredit}</p>
        )}
      </section>
    );
  }

  // Tone-aware lockup. 'light' renders ink-on-bone (for warm/bright cover art
  // like Issue 001's bone-ground hero); default 'dark' is white-on-ink.
  const light = c?.tone === 'light';
  const t = {
    section: light ? 'bg-mono-paper text-mono-ink' : 'bg-mono-ink text-mono-white',
    imageScrim: light
      ? 'bg-gradient-to-t from-mono-paper via-mono-paper/55 to-mono-paper/15'
      : 'bg-gradient-to-t from-mono-black via-mono-black/55 to-mono-black/25',
    fallback: light
      ? 'bg-gradient-to-br from-mono-paper via-mono-soft-white to-mono-paper'
      : 'bg-gradient-to-br from-mono-black via-mono-charcoal to-mono-black',
    rule: light ? 'rgba(20,18,16,0.18)' : 'rgba(255,255,255,0.25)',
    wordmark: light ? 'text-mono-ink' : 'text-mono-white',
    meta: light ? 'text-mono-charcoal' : 'text-mono-soft-white',
    body: light ? 'text-mono-charcoal' : 'text-mono-soft-white',
    ghostBtn: light
      ? 'border-mono-ink/35 text-mono-ink hover:bg-mono-ink/5'
      : 'border-mono-white/60 text-mono-white hover:bg-mono-white/10',
    credit: light ? 'text-mono-gray' : 'text-mono-gray-bright',
  };

  return (
    <section className={`film-grain relative overflow-hidden min-h-[90vh] flex flex-col ${t.section}`}>
      {/* Cover art (full contrast) or designed fallback */}
      {c?.image ? (
        <div className="absolute inset-0">
          <MediaImage fill src={c.image} alt={`${issue.title} — cover`} duotone={false} zoomOnHover={false} priority />
          <div className={`absolute inset-0 ${t.imageScrim}`} />
          {/* Bottom-left bone wash: keeps the ink title legible over dark cover art
              while leaving the upper-right (the figure/face) clear. */}
          {light && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(115% 85% at 2% 100%, rgba(250,248,244,0.95) 0%, rgba(250,248,244,0.7) 38%, rgba(250,248,244,0) 70%)',
              }}
            />
          )}
        </div>
      ) : (
        <div className={`absolute inset-0 ${t.fallback}`} />
      )}

      {/* Masthead lockup */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className="flex items-center justify-between border-b pb-4 text-[10px] md:text-xs tracking-[0.34em] font-display font-bold"
          style={{ borderColor: t.rule }}
        >
          <span>
            <span className={t.wordmark}>MONO</span>
            <span style={{ color: accent }}>KROMATIK</span>
          </span>
          <span className={t.meta}>ISSUE {issue.number}</span>
        </div>
      </div>

      {/* Title block */}
      <div className="relative z-[2] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-auto pb-12 md:pb-16">
        <p className="text-xs tracking-[0.36em] font-display font-bold mb-6" style={{ color: accent }}>
          {issue.focus.toUpperCase()}
        </p>
        <h1 className="max-w-4xl text-5xl md:text-8xl font-feature font-bold leading-[0.9]">{issue.title}</h1>
        {c?.dek && (
          <p className={`max-w-2xl mt-7 text-xl md:text-2xl font-feature italic leading-snug ${t.body}`}>
            {c.dek}
          </p>
        )}

        {c?.coverlines && c.coverlines.length > 0 && (
          <div className={`mt-9 flex flex-wrap gap-x-7 gap-y-2.5 text-[11px] tracking-[0.18em] font-display font-bold ${t.body}`}>
            {c.coverlines.map((cl, i) => (
              <span key={i} className="inline-flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                {cl}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 px-7 py-4 font-display font-bold text-mono-black"
            style={{ background: accent }}
          >
            {cta.label} <ArrowRight size={18} />
          </Link>
          <Link
            href={`/issues/${issue.number}/cover`}
            className={`inline-flex items-center gap-2 px-7 py-4 font-display font-bold border transition-colors ${t.ghostBtn}`}
          >
            VIEW COVER STUDY
          </Link>
        </div>

        {c?.imageCredit && (
          <p className={`mt-8 text-[10px] tracking-[0.14em] font-body ${t.credit}`}>{c.imageCredit}</p>
        )}
      </div>
    </section>
  );
}
