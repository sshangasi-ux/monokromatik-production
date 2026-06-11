// Loader for staged/published case studies. Reads the JSON the generator emits
// under data/case-studies/. Only 'published' studies surface on the site; those
// still in 'review' are ignored until a human flips status (the review gate).

import fs from 'fs';
import path from 'path';
import type { CaseStudy } from './case-study';

const DIR = path.join(process.cwd(), 'data', 'case-studies');

function readAll(): CaseStudy[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf-8')) as CaseStudy;
      } catch {
        return null;
      }
    })
    .filter((c): c is CaseStudy => Boolean(c));
}

/** Live case studies (review-gated): only those a human marked published. */
export function getPublishedCaseStudies(): CaseStudy[] {
  return readAll()
    .filter((c) => c.status === 'published')
    .sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getPublishedCaseStudies().find((c) => c.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return getPublishedCaseStudies().map((c) => c.slug);
}
