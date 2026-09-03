import Link from 'next/link';
import { CONTACT_EMAIL } from '../../lib/commerce';
import NewsletterSignup from './NewsletterSignup';

const YEAR = new Date().getFullYear();

function YoutubeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}
function LinkedinIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 22 10.5 22 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9V9Z" />
    </svg>
  );
}

const EXPLORE = [
  { label: 'The Cultural-Signal Index', href: '/intelligence/signal-index' },
  { label: "Who's Buying Africa", href: '/whos-buying-africa' },
  { label: 'The Coil Economy', href: '/coil-economy' },
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'Watch', href: '/watch' },
  { label: 'The Wire', href: '/breaking' },
  { label: 'Pulse', href: '/pulse' },
];
const SOCIALS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@MonoKromatikNetwork', Icon: YoutubeIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/135245970', Icon: LinkedinIcon },
];
const COMPANY = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Membership', href: '/membership' },
  { label: 'Ownership Intelligence', href: '/intelligence/ownership' },
  { label: 'License the Index', href: '/intelligence/license' },
  { label: 'Sponsor', href: '/sponsor' },
  { label: 'Work with us', href: '/work-with-us' },
];
const LEGAL = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refunds & Cancellations', href: '/refunds' },
  { label: 'Privacy Policy', href: '/privacy' },
];

/** Site-wide footer: navigation, legal links and contact — so policies are
 *  reachable from every page (required for payment-provider verification). */
export default function SiteFooter() {
  const col = 'flex flex-col gap-2.5';
  const link = 'text-sm font-body text-mono-gray-bright hover:text-mono-amber-bright transition-colors';
  const head = 'text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mb-4';

  return (
    <footer className="bg-mono-black text-mono-white border-t border-mono-white/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        {/* The Weekly Signal — sitewide newsletter capture. In the footer it is the
            front door on EVERY page (incl. case studies, reports and the Index),
            so the newsletter is the retention surface the strategy calls for, not a
            per-page afterthought. Captures gracefully with no key set. */}
        <div className="mb-12 pb-12 border-b border-mono-white/10 max-w-2xl">
          <NewsletterSignup variant="footer" source="site-footer" />
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex font-display font-bold text-2xl tracking-[0.02em]">
              <span>MONO</span><span className="text-mono-amber">KROMATIK</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm font-body text-mono-gray-bright leading-relaxed">
              The intelligence behind African influence — authored analysis, a breaking-news Wire, and the
              Cultural-Signal Index.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-5 inline-block text-sm font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
              {CONTACT_EMAIL}
            </a>
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center border border-mono-white/25 text-mono-gray-bright hover:border-mono-amber hover:text-mono-amber transition-colors"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Each column is its own navigation landmark, named by the heading
              already on screen (aria-labelledby, not a duplicated aria-label, so
              the accessible name and the visible label can never drift apart).
              Without names, these three plus the primary nav all announce as
              "navigation" and the landmark list is useless. */}
          <div>
            <p className={head} id="footer-explore">EXPLORE</p>
            <nav className={col} aria-labelledby="footer-explore">{EXPLORE.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
          </div>
          <div>
            <p className={head} id="footer-company">COMPANY</p>
            <nav className={col} aria-labelledby="footer-company">{COMPANY.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
          </div>
          <div>
            <p className={head} id="footer-legal">LEGAL</p>
            <nav className={col} aria-labelledby="footer-legal">{LEGAL.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-mono-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.12em] font-display font-bold text-mono-gray">
          <span>© {YEAR} MONOKROMATIK · ALL RIGHTS RESERVED</span>
          <span>MADE FOR AFRICA &amp; ITS DIASPORA</span>
        </div>
      </div>
    </footer>
  );
}
