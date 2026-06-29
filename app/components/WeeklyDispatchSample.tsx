import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Radar, Sparkles, TrendingUp } from 'lucide-react';
import { buildDispatch } from '../../lib/dispatch';

// A live, auto-rendered sample of this week's dispatch on the /weekly product page,
// built from real current content. Shows the visitor exactly what they'll get —
// the strongest newsletter-conversion lever — and gives the dispatch a web home.

function fmt(iso: string): string {
  const d = new Date(iso);
  return isFinite(d.getTime())
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : '';
}

export default function WeeklyDispatchSample() {
  const d = buildDispatch();
  if (d.breaks.length === 0 && d.reads.length === 0) return null;

  return (
    <div className="bg-mono-white border border-mono-gray/30 shadow-sm">
      {/* Masthead */}
      <div className="bg-mono-black text-mono-white px-6 md:px-8 py-5 flex items-center justify-between gap-4">
        <span className="font-display font-bold tracking-tight text-lg"><span>MONO</span><span className="text-mono-amber">KROMATIK</span></span>
        <span className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray-bright">THE WEEKLY SIGNAL · {fmt(d.generatedAt)}</span>
      </div>

      <div className="px-6 md:px-8 py-7 space-y-8">
        {/* On the Wire */}
        {d.breaks.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-[11px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-4"><Radar size={14} /> ON THE WIRE</p>
            <ul className="space-y-4">
              {d.breaks.map((b) => (
                <li key={b.link}>
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1.5 font-display font-bold text-mono-black hover:text-mono-amber transition-colors">
                    <span>{b.title}</span><ArrowUpRight size={15} className="mt-0.5 shrink-0 text-mono-gray group-hover:text-mono-amber" />
                  </a>
                  <p className="mt-1 text-sm font-body text-mono-charcoal">{b.why}</p>
                  <p className="mt-0.5 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray">{b.source.toUpperCase()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The Reads */}
        {d.reads.length > 0 && (
          <div className="border-t border-mono-gray/20 pt-7">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-4"><Sparkles size={14} /> THE READS</p>
            <ul className="space-y-5">
              {d.reads.map((r) => (
                <li key={r.slug}>
                  <Link href={`/article/${r.slug}`} className="font-display font-bold text-mono-black hover:text-mono-amber transition-colors">{r.title}</Link>
                  <p className="mt-1.5 font-feature italic text-mono-charcoal text-[15px] leading-snug">&ldquo;{r.pullQuote}&rdquo;</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Index mover */}
        {d.mover && (
          <div className="border-t border-mono-gray/20 pt-7">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-4"><TrendingUp size={14} /> INDEX MOVE</p>
            <Link href={`/intelligence/signal-index/${d.mover.slug}`} className="flex items-center justify-between gap-4 group">
              <span className="font-display font-bold text-mono-black group-hover:text-mono-amber transition-colors">{d.mover.brand}</span>
              <span className="shrink-0 font-display font-bold tabular-nums">
                {d.mover.scoreDelta > 0 && <span className="text-emerald-600 mr-2">▲ {d.mover.scoreDelta}</span>}
                <span className="text-mono-black">{d.mover.score}</span><span className="text-mono-gray text-sm">/100</span>
              </span>
            </Link>
          </div>
        )}

        {/* Footer CTA */}
        <div className="border-t border-mono-gray/20 pt-6 flex items-center justify-between gap-4">
          <p className="text-sm font-body text-mono-gray">This is one issue. Get it every week.</p>
          <Link href="#subscribe" className="inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">SUBSCRIBE FREE <ArrowRight size={15} /></Link>
        </div>
      </div>
    </div>
  );
}
