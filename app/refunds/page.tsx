import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection } from '../components/LegalPage';
import { CONTACT_EMAIL } from '../../lib/commerce';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Refunds & Cancellations | MonoKromatik',
  description: 'How to cancel a MonoKromatik membership and how refunds work on our digital memberships, reports, data licences and commissioned research.',
  alternates: { canonical: `${SITE}/refunds` },
};

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Refunds & Cancellations"
      intro="How to cancel, and how refunds work across our digital memberships, reports, data licences and commissioned research."
      updated="6 July 2026"
    >
      <p>
        MonoKromatik sells digital content, data and research services. This policy explains how you can cancel and
        when refunds apply. It sits alongside our <Link href="/terms" className="text-mono-amber-strong hover:underline">Terms of Service</Link> and does not
        limit any rights you have under South African consumer law.
      </p>

      <LegalSection n="1" title="Cancelling a membership">
        <p>You can cancel your Intelligence Membership at any time &mdash; from your <Link href="/account" className="text-mono-amber-strong hover:underline">account settings</Link> or by emailing <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a>.</p>
        <p>Cancellation stops any future renewal. Your access continues until the end of the billing period you have already paid for, after which it ends and you are not charged again. Cancelling part-way through a period does not, by itself, trigger a refund for that period (see below).</p>
      </LegalSection>

      <LegalSection n="2" title="Membership refunds">
        <p>Because membership gives immediate access to digital content, fees for the current billing period are generally non-refundable once the period has begun. We will, however, provide a refund where:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>you were charged in error, charged twice, or charged after a valid cancellation;</li>
          <li>a technical fault on our side prevented you from accessing the membership and we could not resolve it; or</li>
          <li>a refund is required by applicable law.</li>
        </ul>
        <p>If you believe any of these apply, contact us within 14 days of the charge and we will review it promptly.</p>
      </LegalSection>

      <LegalSection n="3" title="Reports and one-time digital purchases">
        <p>Reports (such as the Cultural-Signal Index Full Report) are digital products delivered immediately on payment. In line with standard practice for digital goods, they are non-refundable once you have accessed or downloaded them.</p>
        <p>If you have <strong>not</strong> yet accessed the file, or if there was non-delivery, a duplicate charge, or a clear technical fault, email us within 14 days and we will arrange delivery or a refund.</p>
      </LegalSection>

      <LegalSection n="4" title="Data licences and commissioned research">
        <p>Data licences and commissioned work (Brand Signal Scorecards, commissioned case studies, market reads, enterprise/API access) are supplied under the specific order or statement of work agreed for that engagement. Once work has commenced or a deliverable has been supplied, fees are generally non-refundable except as set out in that order. Any milestone, revision or acceptance terms in your order take precedence over this general policy.</p>
      </LegalSection>

      <LegalSection n="5" title="Incorrect or unauthorised charges">
        <p>If you see a charge you do not recognise, or a duplicate or unauthorised charge, contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a> and we will investigate. Confirmed erroneous, duplicate or unauthorised charges are refunded in full.</p>
      </LegalSection>

      <LegalSection n="6" title="How refunds are made">
        <p>Approved refunds are processed back to your original payment method through our payment processor, Paystack. Depending on your bank or card issuer, it can take a few business days for the refund to reflect. We do not store your card details; payments and refunds are handled securely by Paystack.</p>
      </LegalSection>

      <LegalSection n="7" title="Contact">
        <p>For any cancellation or refund request, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a> with your account email and the charge in question. We aim to respond within two business days.</p>
      </LegalSection>
    </LegalPage>
  );
}
