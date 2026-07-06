import Link from 'next/link';
import { CONTACT_EMAIL } from '../../lib/commerce';

const YEAR = new Date().getFullYear();

const EXPLORE = [
  { label: 'The Cultural-Signal Index', href: '/intelligence/signal-index' },
  { label: 'Intelligence', href: '/intelligence' },
  { label: 'The Wire', href: '/breaking' },
  { label: 'Pulse', href: '/pulse' },
];
const COMPANY = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Membership', href: '/membership' },
  { label: 'License the Index', href: '/intelligence/license' },
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
          </div>

          <div>
            <p className={head}>EXPLORE</p>
            <nav className={col}>{EXPLORE.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
          </div>
          <div>
            <p className={head}>COMPANY</p>
            <nav className={col}>{COMPANY.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
          </div>
          <div>
            <p className={head}>LEGAL</p>
            <nav className={col}>{LEGAL.map((l) => <Link key={l.href} href={l.href} className={link}>{l.label}</Link>)}</nav>
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
