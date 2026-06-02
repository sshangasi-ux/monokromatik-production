import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About — The Intelligence Behind African Influence | Monokromatik',
  description: 'Monokromatik is an AI-assisted editorial and intelligence network decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
  keywords: ['Monokromatik', 'African brand intelligence', 'African creative industry', 'African influence', 'diaspora brand strategy', 'AI-assisted editorial intelligence', 'Sibu Shangase'],
  openGraph: {
    title: 'About Monokromatik — The Intelligence Behind African Influence',
    description: 'AI-assisted discovery. Human-directed intelligence. Distinct African judgment.',
    type: 'website',
    url: 'https://www.monokromatik.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Monokromatik — The Intelligence Behind African Influence',
    description: 'AI-assisted discovery. Human-directed intelligence. Distinct African judgment.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
