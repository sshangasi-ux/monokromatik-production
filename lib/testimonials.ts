// Real buyer/reader testimonials for the proof module. Source of truth is
// data/testimonials.json. This stays EMPTY until we have genuine, attributable
// quotes — the media/trust standard forbids fabricated reviews, so the proof
// band renders its verifiable credibility signals (corpus, named sourcing,
// guarantee, AI citations) and simply omits the quote rail when none exist.
//
// To add one, append an object to data/testimonials.json. Only include a quote
// a named person actually gave us permission to use.

import testimonialsData from '../data/testimonials.json';

export interface Testimonial {
  /** The quote itself — verbatim, real. */
  quote: string;
  /** Who said it — a real, attributable name. */
  name: string;
  /** Their role / organisation, e.g. "Corp-dev, pan-African fund". */
  role?: string;
  /** Optional slug of the report/piece the quote is about, to scope it. */
  about?: string;
  /** Optional link to the public source of the quote (post, review). */
  sourceUrl?: string;
}

const testimonials = testimonialsData as Testimonial[];

/** All testimonials. Empty until real quotes are added. */
export function getTestimonials(): Testimonial[] {
  return testimonials;
}

/** Testimonials relevant to a report: those scoped to it, else the general pool. */
export function getTestimonialsFor(slug?: string): Testimonial[] {
  if (!slug) return testimonials.filter((t) => !t.about);
  const scoped = testimonials.filter((t) => t.about === slug);
  return scoped.length > 0 ? scoped : testimonials.filter((t) => !t.about);
}
