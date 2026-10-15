import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this project so it doesn't accidentally resolve the
  // parent directory's lockfile (which lacks our deps).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow images from RSS sources we ingest
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Note: /roots, /arena, /waves, /watch, /listen, /shop are real top-level pages
  // (app/<slug>/page.tsx). The old rewrites to a duplicate /category/[slug] route
  // were dead (the real pages always won) — removed along with that route.
  async redirects() {
    return [
      // Kill-list consolidation (2026-09): thin, stale beer features folded into
      // their ownership-desk successors and archived to data/articles.archive.json.
      // 301s so the URLs don't 404 and any inbound equity is preserved.
      { source: '/article/tusker-kenya-national-beer', destination: '/article/who-owns-tusker', permanent: true },
      { source: '/article/windhoek-lager-namibia-beer', destination: '/article/who-owns-amarula', permanent: true },
      // The old /services index is folded into the MonoKromatik Intelligence hub.
      // Exact match only — /services/culture-due-diligence (and its estimate page)
      // stay live as the service's detail pages.
      { source: '/services', destination: '/intelligence', permanent: true },
      // The flagship African-sport report's slug gained a -2026 suffix; the bare
      // slug 404'd and was still live in old LinkedIn posts / shares. 301 so that
      // inbound equity lands on the current report.
      { source: '/reports/whos-buying-african-sport', destination: '/reports/whos-buying-african-sport-2026', permanent: true },
    ];
  },
};

export default nextConfig;
