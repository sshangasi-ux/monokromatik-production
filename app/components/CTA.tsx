'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { track } from '../../lib/analytics';

// One consistent, accessible call-to-action. Variants cover the three patterns
// scattered across the site (solid button / outline button / text link). Every
// variant ships a visible focus-visible ring — fixing the keyboard-a11y gap.
// Client component so every CTA emits a `cta_click` GA event (conversion funnel).

type Variant = 'primary' | 'outline' | 'text' | 'amber';

const BASE =
  'inline-flex items-center gap-2 font-display font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-mono-black text-mono-white px-7 py-4 hover:bg-mono-charcoal',
  outline: 'border border-mono-black text-mono-black px-7 py-4 hover:bg-mono-black hover:text-mono-white',
  text: 'text-mono-amber-strong hover:text-mono-amber-hover',
  // Solid amber — the primary action on dark sections (a black button vanishes there).
  amber: 'bg-mono-amber text-mono-black px-7 py-4 hover:bg-mono-amber-bright',
};

export default function CTA({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const inner = (
    <>
      {children} <Icon size={variant === 'text' ? 15 : 18} aria-hidden="true" />
    </>
  );
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  const onClick = () => track('cta_click', { href, variant, external });

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{inner}</a>
  ) : (
    <Link href={href} className={cls} onClick={onClick}>{inner}</Link>
  );
}
