import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";

export const metadata: Metadata = {
  title: "MonoKromatik Network — African Stories BBC Won't Tell You",
  description: "Experience the pulse of African content. Culture, sports, and entertainment from an insider's lens. Zero budget, AI-powered, built for the diaspora.",
  keywords: ["African media", "African culture", "African sports", "Afrobeats", "PSL", "diaspora", "MonoKromatik"],
  authors: [{ name: "Sibu Shangase" }],
  verification: {
    google: 'V25p3DOYTN6kChFRtlU0cL0V4vGdcUcfkKHfJuGJ1qY',
  },
  openGraph: {
    title: "MonoKromatik Network",
    description: "African Stories BBC Won't Tell You",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics gaId="G-9F5R5FM8NS" />
      </body>
    </html>
  );
}
