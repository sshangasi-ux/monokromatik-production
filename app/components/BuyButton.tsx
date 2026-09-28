'use client';

import { track } from '../../lib/analytics';

// Client wrapper for the report BUY links so a Paystack checkout click fires a
// semantic GA4 event (report_buy_click) with the report + price, rather than
// only GA's generic auto-tracked outbound click. ReportFeature is a server
// component, so the onClick has to live here.
export default function BuyButton({
  href,
  slug,
  price,
  className,
  children,
}: {
  href: string;
  slug: string;
  price?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('report_buy_click', { slug, price: price ?? undefined })}
      className={className}
    >
      {children}
    </a>
  );
}
