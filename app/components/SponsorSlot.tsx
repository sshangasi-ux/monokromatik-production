import Link from 'next/link';
import { getSponsor } from '../../lib/sponsors';

// Renders the sponsor for a placement (clearly disclosed), or — when `offer` is
// set and the placement is unsold — a subtle "open for sponsorship" prompt that
// routes to the partner enquiry. Renders nothing otherwise.
export default function SponsorSlot({
  placement,
  offer = false,
  tone = 'light',
  className = '',
}: {
  placement: string;
  offer?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const sponsor = getSponsor(placement);
  const label = tone === 'dark' ? 'text-mono-gray-bright' : 'text-mono-gray';
  const accent = tone === 'dark' ? 'text-mono-amber-bright' : 'text-mono-amber-strong';

  if (sponsor) {
    return (
      <div className={`text-[11px] tracking-[0.18em] font-display font-bold ${label} ${className}`}>
        <span className={accent}>SPONSORED</span> · PRESENTED BY{' '}
        <a href={sponsor.url} target="_blank" rel="noopener sponsored" className={`${accent} hover:underline`}>
          {sponsor.name.toUpperCase()}
        </a>
        {sponsor.blurb && <span className="block mt-1 tracking-normal font-body font-normal opacity-80">{sponsor.blurb}</span>}
      </div>
    );
  }

  if (offer) {
    return (
      <Link
        href="/work-with-us?interest=sponsor"
        className={`inline-block text-[11px] tracking-[0.18em] font-display font-bold ${accent} hover:underline ${className}`}
      >
        OPEN FOR SPONSORSHIP →
      </Link>
    );
  }

  return null;
}
