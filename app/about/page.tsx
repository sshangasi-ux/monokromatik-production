import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About — Built For The Diaspora | MonoKromatik Network',
  description: 'How MonoKromatik works: AI agents discover, curate, craft, and publish African culture, sports, and entertainment stories for the diaspora. Built by 1 human + AI. 100% transparent.',
  keywords: ['MonoKromatik', 'about MonoKromatik', 'African media AI', 'diaspora media', 'AI journalism', 'Sibu Shangase'],
  openGraph: {
    title: 'About MonoKromatik — Built For The Diaspora',
    description: 'AI-powered African media for the diaspora. 1 human + agents. Zero budget. 100% transparent.',
    type: 'website',
    url: 'https://www.monokromatik.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About MonoKromatik — Built For The Diaspora',
    description: 'AI-powered African media for the diaspora. 1 human + agents. Zero budget. 100% transparent.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}
