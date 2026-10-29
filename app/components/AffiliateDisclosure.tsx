// Lightweight affiliate / partner-link disclosure for T0 free reads.
//
// The "easy on-site read" tier (see docs/editorial/content-slate-6wk.md) links
// out to the brands, rights-holders and products a piece discusses. Where
// MonoKromatik has a commercial or affiliate arrangement, those outbound links
// may earn a commission — this band says so plainly, once, above the body, and
// reaffirms that it never shapes the analysis (the independence line that keeps
// the value-capture read credible). Purely presentational; rendered only when an
// article sets `affiliate: true`.

export default function AffiliateDisclosure() {
  return (
    <aside
      className="mb-10 border-l-2 border-mono-amber bg-mono-amber/[0.06] px-4 py-3"
      aria-label="Affiliate disclosure"
    >
      <p className="font-body text-sm leading-relaxed text-mono-gray">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-xs text-mono-black">
          Disclosure
        </span>{' '}
        — This piece links out to brands and rights-holders it covers. Where we
        hold a partner or affiliate arrangement, those links may earn
        MonoKromatik a commission. It never changes what the analysis says.
      </p>
    </aside>
  );
}
