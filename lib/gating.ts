// Light email-gate for the free flagship-grade reports. These are the deepest
// free pieces — the ownership league tables and the Culture Due Diligence
// samples — where a reader's intent is high enough to ask for an email in
// exchange for the full read. The gate is a SOFT, client-side wall (the full
// content is still server-rendered in the DOM, so SEO and no-JS readers are
// unaffected); it converts the typical reader into a newsletter subscriber and
// feeds the nurture pipeline. Scorecards, value-capture reads and The Method
// stay fully open as the top-of-funnel SEO net. Paid reports keep their own
// paywall and are never email-gated (see ReportFeature: gate only when !premium).
export const FLAGSHIP_GATED_SLUGS: ReadonlySet<string> = new Set([
  // Ownership league tables
  'who-owns-african-fintech-league-table',
  'who-owns-african-music-league-table',
  'who-owns-african-beauty-league-table',
  'who-owns-african-sport-league-table',
  'who-owns-african-fashion-league-table',
  // Culture Due Diligence samples
  'culture-due-diligence-afrobeats-catalogue',
  'culture-due-diligence-african-football-rights',
  'culture-due-diligence-nollywood-streaming',
  'culture-due-diligence-african-mobile-money',
]);

export function isFlagshipGated(slug: string): boolean {
  return FLAGSHIP_GATED_SLUGS.has(slug);
}
