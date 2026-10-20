'use client';

import { track } from '../../lib/analytics';

// Client wrapper for the membership SUBSCRIBE link so a Paystack subscription
// checkout click fires a semantic GA4 event (membership_subscribe_click) with
// the tier + price — the only recurring-revenue CTA, previously a plain <a> that
// was invisible in the conversion funnel. The membership page is a server
// component, so the onClick has to live here. Mirrors BuyButton for reports.
export default function SubscribeButton({
  href,
  tier,
  price,
  className,
  children,
}: {
  href: string;
  tier: string;
  price?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('membership_subscribe_click', { tier, price: price ?? undefined })}
      className={className}
    >
      {children}
    </a>
  );
}
