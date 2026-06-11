// Resolver for hardcoded issue/dossier imagery (campaign stills referenced
// directly in Issue page components, not via the article pipeline).
//
// Some of these are official campaign assets on hotlink-protected CDNs (e.g.
// media.about.nike.com) that no proxy can fetch from the browser. The localizer
// (scripts/localize-issue-media.ts, run in CI where there's network) downloads
// them server-side, writes a same-origin webp under public/article-media, and
// records the path here in `local`. Until then `local` is null and the page
// uses the remote URL — which, if it fails, degrades to CoverArt via MediaImage.

import manifest from '../data/issue-media.json';

export interface IssueMediaEntry {
  remote: string;
  /** Self-hosted path once localized in CI, else null. */
  local: string | null;
  credit: string;
  sourceLabel: string;
  sourceHref: string;
}

const MANIFEST = manifest as Record<string, IssueMediaEntry>;

export function issueMedia(id: string): IssueMediaEntry | undefined {
  return MANIFEST[id];
}

/** Best available source: self-hosted first, remote as a last resort. */
export function issueMediaSrc(id: string): string {
  const e = MANIFEST[id];
  return e?.local || e?.remote || '';
}
