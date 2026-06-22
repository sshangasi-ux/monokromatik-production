// Sponsored-franchise / newsletter inventory. A sponsor is attached to one or
// more "placements" (a franchise key or "weekly"). Until a placement is sold,
// SponsorSlot can show a subtle "open for sponsorship" prompt that routes to the
// partner enquiry — turning empty inventory into a sales surface.
//
// Sponsorship is always CLEARLY DISCLOSED in the UI (label "SPONSORED" /
// "PRESENTED BY") per editorial standards.

export interface Sponsor {
  name: string;
  url: string;
  blurb?: string;
  /** Placement keys this sponsor occupies, e.g. ['weekly', 'brand-weather']. */
  placements: string[];
}

// No live sponsors yet — every placement is open inventory.
export const SPONSORS: Sponsor[] = [];

/** The sponsor occupying a placement, or undefined if it's open. */
export function getSponsor(placement: string): Sponsor | undefined {
  return SPONSORS.find((s) => s.placements.includes(placement));
}
