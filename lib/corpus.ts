// The grounding corpus for "Ask MonoKromatik" — a flat, searchable index built
// from the publication's OWN reviewed work: case studies, live reports, and the
// Brand Reads attached to articles. This is the closed set the assistant is
// allowed to answer from; nothing here is external, so a grounded answer can
// only ever cite MonoKromatik's published intelligence.
//
// v1 retrieval is dependency-free lexical scoring (term frequency + title
// boost) over this in-memory corpus — small enough (tens of documents) that it
// is fast and good enough, and avoids standing up an embeddings/vector service.
// A future v2 can swap retrieve() for embeddings without touching callers.

import { getAllCaseStudies } from './case-studies';
import { getAllReports } from './reports';
import { getAllArticles } from './articles';

export interface CorpusDoc {
  id: string;
  type: 'case-study' | 'report' | 'brand-read';
  title: string;
  url: string;
  /** Brand / outlet the piece is about or from. */
  source: string;
  /** The searchable + quotable body. */
  text: string;
}

/** Build the full grounding corpus from case studies, live reports and Brand Reads. */
export function buildCorpus(): CorpusDoc[] {
  const docs: CorpusDoc[] = [];

  for (const c of getAllCaseStudies()) {
    const text = [
      c.standfirst,
      ...c.context,
      ...c.strategicBet,
      ...c.creativeMove,
      ...c.africanRead,
      ...c.evidence.confirmed,
      ...c.evidence.reported,
      ...c.evidence.notClaimed,
      ...c.lessons.map((l) => `${l.title} ${l.body}`),
      ...c.decode.map((d) => `${d.label}: ${d.note}`),
      ...(c.pullQuotes ?? []),
    ].join(' ');
    docs.push({
      id: `cs:${c.slug}`,
      type: 'case-study',
      title: c.title,
      url: `/intelligence/case-studies/${c.slug}`,
      source: c.brand,
      text,
    });
  }

  for (const r of getAllReports()) {
    if (r.status !== 'live' || !r.sections?.length) continue;
    const text = [r.summary, ...r.sections.flatMap((s) => [s.heading, ...s.paragraphs])].join(' ');
    docs.push({
      id: `rp:${r.slug}`,
      type: 'report',
      title: r.title,
      url: `/reports/${r.slug}`,
      source: r.series,
      text,
    });
  }

  for (const a of getAllArticles()) {
    const br = a.brandRead;
    if (!br?.take?.trim()) continue;
    const text = [
      a.title,
      a.excerpt,
      br.take,
      br.pullQuote ?? '',
      ...(br.takeaways?.map((t) => (typeof t === 'string' ? t : `${t.insight} ${t.move}`)) ?? []),
    ].join(' ');
    docs.push({
      id: `br:${a.slug}`,
      type: 'brand-read',
      title: a.title,
      url: `/article/${a.slug}`,
      source: a.sourceName,
      text,
    });
  }

  return docs;
}

const STOPWORDS = new Set(
  'the a an and or of to in for on at is are was were be been being with that this these those it its as by from about into over under than then so we our you your they their what which who how why does do can will would should could may might more most who whom'.split(
    ' '
  )
);

/**
 * Lexical relevance retrieval: tokenise the query into significant terms, then
 * score each doc by term frequency (with a strong title boost). Returns the top
 * `k` docs that match at least one term — empty if nothing matches, which the
 * caller uses to refuse rather than hallucinate.
 */
export function retrieve(query: string, docs: CorpusDoc[], k = 8): CorpusDoc[] {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    )
  );
  if (terms.length === 0) return [];

  const scored = docs
    .map((d) => {
      const hay = `${d.title} ${d.source} ${d.text}`.toLowerCase();
      const titleHay = `${d.title} ${d.source}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        const occ = hay.split(t).length - 1;
        if (occ > 0) score += occ;
        if (titleHay.includes(t)) score += 4; // strong title/brand boost
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map((x) => x.d);
}
