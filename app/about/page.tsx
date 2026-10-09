import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About — Sibu Shangase & MonoKromatik',
  description:
    'MonoKromatik is the African brand-intelligence desk run by Sibu Shangase (Brands Director, Mast-Jägermeister): who owns African culture, and who keeps the money. 56 reports, 193 articles, named sources on every claim.',
  keywords: ['Sibu Shangase', 'Monokromatik', 'African brand intelligence', 'African ownership', 'value capture', 'Culture Due Diligence', 'African creative economy'],
  openGraph: {
    title: 'About — Sibu Shangase & MonoKromatik',
    description: 'The African brand-intelligence desk: who owns the culture, and who keeps the money. Named analysis, named sources — not anonymous takes.',
    type: 'website',
    url: 'https://www.monokromatik.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About — Sibu Shangase & MonoKromatik',
    description: 'The African brand-intelligence desk: who owns the culture, and who keeps the money. Named analysis, named sources.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
