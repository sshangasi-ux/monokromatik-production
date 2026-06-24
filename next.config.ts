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
};

export default nextConfig;
