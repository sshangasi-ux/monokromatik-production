// Reader for the narration manifest (data/audio-manifest.json), populated by
// scripts/narrate-articles.ts. Server-side import so the Listen page renders
// whatever audio currently exists at build time — empty array until the
// narrator first runs.

import manifest from '../data/audio-manifest.json';

export interface Narration {
  slug: string;
  title: string;
  category: string;
  /** Same-origin /article-audio/<slug>.mp3 */
  audioUrl: string;
  excerpt: string;
  createdAt: string;
}

export function getNarrations(): Narration[] {
  const list = (manifest as { narrations: Narration[] }).narrations || [];
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
