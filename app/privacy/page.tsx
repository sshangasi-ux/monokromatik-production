import type { Metadata } from 'next';
import LegalPage, { LegalSection } from '../components/LegalPage';
import { CONTACT_EMAIL } from '../../lib/commerce';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | MonoKromatik',
  description: 'How MonoKromatik collects, uses and protects your personal information, including payments handled by Paystack.',
  alternates: { canonical: `${SITE}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      intro="What we collect, how we use it, who we share it with, and your rights — including how payments are handled."
      updated="6 July 2026"
    >
      <p>
        This policy explains how MonoKromatik collects, uses and protects your personal information when you use
        monokromatik.com or buy our products. We handle personal information in line with South Africa&rsquo;s Protection
        of Personal Information Act (POPIA).
      </p>

      <LegalSection n="1" title="What we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account &amp; contact details</strong> &mdash; such as your name and email address when you register, subscribe, buy a product or contact us.</li>
          <li><strong>Newsletter email</strong> &mdash; if you subscribe to our newsletter or Weekly Signal.</li>
          <li><strong>Transaction details</strong> &mdash; a record of what you purchased. Your card details are entered directly with our payment processor; we do not receive or store your full card number.</li>
          <li><strong>Usage data</strong> &mdash; standard analytics such as pages viewed and device/browser information, collected via cookies and similar technologies.</li>
        </ul>
      </LegalSection>

      <LegalSection n="2" title="How we use it">
        <p>We use your information to provide and secure the service, process payments and manage subscriptions, deliver the products and research you have bought, respond to enquiries, send you updates or newsletters you have asked for, and improve our content and product.</p>
      </LegalSection>

      <LegalSection n="3" title="Payments">
        <p>Payments are processed by <strong>Paystack</strong>, a PCI-DSS-compliant payment provider. When you pay, your card and payment information is collected and processed by Paystack under its own privacy terms. MonoKromatik does not store your card details.</p>
      </LegalSection>

      <LegalSection n="4" title="Analytics and cookies">
        <p>We use cookies and analytics (including Google Analytics) to understand how the site is used and to improve it. You can control cookies through your browser settings; disabling some cookies may affect how parts of the site work.</p>
      </LegalSection>

      <LegalSection n="5" title="Who we share it with">
        <p>We do <strong>not</strong> sell your personal information. We share it only with the service providers who help us run MonoKromatik &mdash; our payment processor (Paystack), email/newsletter and analytics providers, and hosting infrastructure &mdash; and only as needed to deliver the service, or where required by law.</p>
      </LegalSection>

      <LegalSection n="6" title="Retention">
        <p>We keep personal information for as long as your account is active or as needed to provide the service, meet legal and accounting obligations, and resolve disputes, after which we delete or anonymise it.</p>
      </LegalSection>

      <LegalSection n="7" title="Your rights">
        <p>Under POPIA you have the right to access the personal information we hold about you, ask us to correct or delete it, object to certain processing, and withdraw consent (for example, unsubscribe from our newsletter). To exercise any of these, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a>.</p>
      </LegalSection>

      <LegalSection n="8" title="Contact">
        <p>For any privacy question or request, contact <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a>. We aim to respond within a reasonable time and, in any case, as required by law.</p>
      </LegalSection>
    </LegalPage>
  );
}
