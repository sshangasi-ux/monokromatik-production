import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection } from '../components/LegalPage';
import { CONTACT_EMAIL } from '../../lib/commerce';

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Terms of Service | MonoKromatik',
  description: 'The terms governing use of MonoKromatik — our editorial content, the Cultural-Signal Index, memberships, reports and data licences.',
  alternates: { canonical: `${SITE}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Terms of Service"
      intro="These terms govern your use of MonoKromatik and everything we sell — memberships, reports, data licences and commissioned research."
      updated="6 July 2026"
    >
      <p>
        Welcome to MonoKromatik (&ldquo;MonoKromatik&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). MonoKromatik is a digital brand-intelligence and
        editorial network covering African and diaspora brands, campaigns, creators and culture. By using our website
        at monokromatik.com or purchasing any of our products or services, you agree to these Terms of Service.
      </p>

      <LegalSection n="1" title="What we provide">
        <p>MonoKromatik is a digital publisher and research service. Everything we offer is delivered digitally &mdash; there are no physical goods. Our paid products and services are:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Intelligence Membership</strong> &mdash; a recurring (monthly or annual) subscription giving access to premium content, including case studies, the full Cultural-Signal Index and reports.</li>
          <li><strong>Reports</strong> &mdash; one-time digital purchases such as the Cultural-Signal Index Full Report, delivered as online access and/or a downloadable file.</li>
          <li><strong>Data licences</strong> &mdash; licensed access to the Cultural-Signal Index league tables and per-brand data (single table, category or full-Index licences, including enterprise and API access).</li>
          <li><strong>Commissioned research</strong> &mdash; bespoke intelligence such as a Brand Signal Scorecard, a commissioned case study, or a market read, delivered to order.</li>
          <li><strong>Sponsorship</strong> &mdash; native, clearly-disclosed sponsorship of an editorial franchise or newsletter.</li>
        </ul>
        <p>Free content on the website is provided for general information. Prices are shown on the relevant page and at checkout, in the currency indicated (South African Rand or US Dollars), and may be exclusive of applicable taxes.</p>
      </LegalSection>

      <LegalSection n="2" title="Accounts">
        <p>Some products require an account. You are responsible for the accuracy of the information you provide and for keeping your login secure. You must be at least 18 years old, or have the consent of a parent or guardian, to purchase.</p>
      </LegalSection>

      <LegalSection n="3" title="Subscriptions and billing">
        <p>Intelligence Membership is billed in advance on a recurring basis (monthly or annually) through our payment processor, Paystack. Unless you cancel, your subscription renews automatically at the end of each billing period at the then-current price, and you authorise us (via Paystack) to charge your payment method for each renewal.</p>
        <p>You can cancel at any time; cancellation takes effect at the end of your current billing period. See our <Link href="/refunds" className="text-mono-amber-strong hover:underline">Refunds &amp; Cancellations Policy</Link> for details.</p>
      </LegalSection>

      <LegalSection n="4" title="One-time purchases, licences and commissioned work">
        <p>Reports are one-time purchases delivered digitally on payment. Data licences and commissioned research are supplied under the specific scope, deliverables and licence terms set out in your order or statement of work, which form part of these Terms for that purchase.</p>
      </LegalSection>

      <LegalSection n="5" title="Intellectual property and licence to use">
        <p>All content on MonoKromatik &mdash; articles, case studies, the Cultural-Signal Index, its scores, methodology, reports, data, designs and trademarks &mdash; is owned by MonoKromatik or its licensors and is protected by law.</p>
        <p>A membership or purchase grants you a limited, non-exclusive, non-transferable licence to access and use the content for your own internal or personal reference. You may cite the Index with clear attribution to MonoKromatik and a link to the source. You may <strong>not</strong> resell, redistribute, sub-license, publicly republish or scrape our content or data except as expressly permitted by a data licence you have purchased.</p>
      </LegalSection>

      <LegalSection n="6" title="Acceptable use">
        <p>You agree not to misuse the service: no automated scraping or bulk extraction, no attempts to breach security or access controls, no reproduction of paywalled content, and no use that is unlawful or infringes the rights of others.</p>
      </LegalSection>

      <LegalSection n="7" title="The nature of our analysis">
        <p>The Cultural-Signal Index and our editorial analysis are <strong>interpretive editorial judgement</strong> &mdash; a defensible, evidence-led reading, not a measured market metric, audited data, or financial, investment or professional advice. Our methodology is published and our scores are set by a named analyst; even so, you should not rely on our content as the sole basis for any decision. Content is provided &ldquo;as is&rdquo;.</p>
      </LegalSection>

      <LegalSection n="8" title="Limitation of liability">
        <p>To the fullest extent permitted by law, MonoKromatik is not liable for any indirect, incidental or consequential loss arising from your use of the service. Nothing in these Terms limits any rights you have that cannot be excluded under applicable consumer-protection law.</p>
      </LegalSection>

      <LegalSection n="9" title="Changes">
        <p>We may update the service and these Terms from time to time. Material changes will be reflected by the &ldquo;last updated&rdquo; date above and, where appropriate, notified to members. Continued use after a change means you accept the updated Terms.</p>
      </LegalSection>

      <LegalSection n="10" title="Governing law and contact">
        <p>These Terms are governed by the laws of South Africa. Questions about these Terms, or any of our products, can be sent to <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong hover:underline">{CONTACT_EMAIL}</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
