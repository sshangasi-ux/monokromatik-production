// Breaking-news radar — the always-on, AI-led pull that watches our focus
// segments and alerts the moment a major story breaks. Pure helpers here
// (recency, dedup, the judge prompt, the alert render); the IO (fetch, Anthropic,
// Resend, ledger) lives in scripts/breaking-watch.ts.
//
// Cadence note: this is driven by a cron, so "real-time" means as fast as the
// schedule fires (~every 15 min on GitHub Actions — the practical floor). Truly
// sub-minute detection would need an always-on host or push/streaming feeds; the
// design is ready for that (swap the trigger), but the cron is the always-on,
// zero-infra version.

import type { Story } from './rss-feeds';

/** Our focus segments — the judge only flags major breaks within these. */
export const FOCUS = `MAJOR breaking news about AFRICA or the AFRICAN DIASPORA — and only within these
beats: brand / business / marketing moves; music (Afrobeats, Amapiano, hip-hop,
etc.); sport and athletes; fashion, film and screen; creators and the culture
economy; and the drinks / spirits-brand world. The story must clearly involve an
African or African-diaspora brand, company, market, artist, athlete, creator,
institution or community.`;

export interface BreakingCandidate {
  title: string;
  source: string;
  category: string;
  link: string;
  pubDate: string;
}

export interface BreakingVerdict {
  link: string;
  breaking: boolean;
  importance: number; // 1–5
  why: string;
}

/** Tidy a raw RSS headline for The Wire: collapse runs of whitespace and trim.
 *  Pure formatting only — never rewrites words (spelling stays an editor call). */
export function cleanTitle(t: string): string {
  return (t || '').replace(/\s+/g, ' ').trim();
}

/**
 * Recent, deduped candidates: published within `windowHours`, not yet alerted,
 * newest first, capped at `max` (default 50) so the judge's verdict JSON always
 * fits in one response.
 */
export function selectCandidates(stories: Story[], alerted: Set<string>, opts?: { windowHours?: number; now?: number; max?: number }): BreakingCandidate[] {
  const windowMs = (opts?.windowHours ?? 3) * 3_600_000;
  const now = opts?.now ?? Date.now();
  const max = opts?.max ?? 50;
  const seen = new Set<string>();
  const out: BreakingCandidate[] = [];
  // fetchMonoKromatikStories returns newest-first, so the first `max` are freshest.
  for (const s of stories) {
    if (out.length >= max) break;
    if (!s.link || alerted.has(s.link) || seen.has(s.link)) continue;
    const t = new Date(s.pubDate).getTime();
    if (!isFinite(t) || now - t > windowMs || t > now + 3_600_000) continue; // within window, not future-dated
    seen.add(s.link);
    out.push({ title: cleanTitle(s.title), source: s.source, category: s.category, link: s.link, pubDate: s.pubDate });
  }
  return out;
}

/** The judge prompt: a HIGH bar — only genuine, major breaks of follower interest. */
export function judgePrompt(cands: BreakingCandidate[]): string {
  const list = cands.map((c, i) => `${i}. [${c.source} · ${c.category}] ${c.title}`).join('\n');
  return `You are MonoKromatik's breaking-news desk. Our remit:\n${FOCUS}\n\nBelow are fresh headlines. Flag ONLY genuine BREAKING news that is BOTH (a) clearly about Africa or the African diaspora AND (b) inside our beats above — a significant deal, launch, award/record, death, appointment, signing, result or controversy involving an African/diaspora brand, company, market, artist, athlete or creator.\n\nHARD EXCLUSIONS — mark these breaking:false, importance ≤ 2 no matter how globally big: general world news, health/disease/pandemics, natural disasters, geopolitics/elections/war, crime, weather, and any story with NO clear African or diaspora connection within our beats. Also not breaking: routine coverage, recaps, opinion, previews and listicles.\n\nReserve importance 4–5 for a story a MonoKromatik editor would drop everything to cover. When unsure whether the African/diaspora link is real, score it low.\n\n${list}\n\nReturn ONLY a JSON array (in a \`\`\`json fence): [{"index": <n>, "breaking": <bool>, "importance": <1-5>, "why": "<one line, name the African/diaspora link>"}] — one object per headline.`;
}

/** Parse the judge's JSON, mapping back to links. Fail-safe → []. */
export function parseVerdicts(text: string, cands: BreakingCandidate[]): BreakingVerdict[] {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : (text.match(/\[\s*\{[\s\S]*\}\s*\]/)?.[0] ?? '');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as { index: number; breaking?: boolean; importance?: number; why?: string }[];
    return arr
      .filter((v) => cands[v.index])
      .map((v) => ({
        link: cands[v.index].link,
        breaking: Boolean(v.breaking),
        importance: Number(v.importance) || 0,
        why: String(v.why ?? ''),
      }));
  } catch {
    return [];
  }
}

// ── Deterministic judge (credit-free fallback) ───────────────────────────────
// A rule-based ranker that stands in for the AI judge when no Anthropic key /
// credits are available. It scores REAL feed items (no fabrication) by news
// signal, source authority and recency, and applies the same hard exclusions.
// Lower ceiling than the AI read — it curates, it doesn't interpret — but every
// item is a real, attributable headline from a trusted feed.

// STRONG news signals only. Ambiguous verbs (back/joins/drops/lands/releases/
// secures/round) were removed — they match incidentally ("push back", "drops by")
// and floated governance/legal stories over the bar. Deal/launch/award verbs stay.
const SIGNAL_RE = /\b(launch(?:e[sd])?|acquir\w+|raise[sd]?|funding|sign[s]?|signs|deal|partner\w*|debut\w*|unveil\w*|invest\w*|expand\w*|appoint\w*|win[s]?|won|record|first|announce\w*|listing|ipo|merger|stake)\b/i;
const MONEY_RE = /(\$|€|£|₦|\bR\d)|\b\d+(?:\.\d+)?\s?(?:m|bn|k|million|billion)\b/i;
const SOFT_EXCLUDE_RE = /\b(opinion|recap|preview|review|how to|top \d+|best of|ranked|explainer|guide|things you|watch:|listen:|throwback|vs\.?|roundup|weekly wrap)\b/i;
// Off-beat topics the desk hard-excludes (disease/health, disaster, geopolitics,
// crime, weather). Note: a person's "death/dies" is NOT excluded — it can break.
const HARD_EXCLUDE_RE = /\b(election|coup|\bwar\b|flood\w*|earthquake|drought|famine|outbreak|pandemic|covid|ebola|cholera|malaria|cyclone|hurricane|storm|weather|disease|cancer|\bfda\b|vaccine|hospital|murder|arrest\w*|robbery|fraud|scam|court|jail\w*|prison|rape|assault|kidnap\w*|terror\w*|protest\w*|sanction\w*|felony|firearm|shooting|indict\w*|sentenced|lawsuit|manslaughter|judge\w*|judiciary|lawyer\w*|ruling|verdict|trump|biden|putin|netanyahu|zelensky|\bnato\b|summit|gaza|ukraine|russia|israel|palestin\w*|senate|congress|parliament|impeach\w*)\b/i;

/** Shared beat gate: true if a headline is off our editorial beats (disease,
 *  disaster, geopolitics, crime, weather) and should never surface. Used by both
 *  the deterministic radar and the deterministic coverage-gap pool. */
export function offBeat(title: string): boolean {
  return HARD_EXCLUDE_RE.test(title || '');
}
const HIGH_AUTHORITY = /(techcabal|african business|business of fashion|variety|music in africa|rest of world|the eastafrican|bloomberg|reuters|deadline|hollywood reporter)/i;

// The FOCUS gate: an item must show a CLEAR Africa/diaspora link to publish. The
// feeds carry global wire copy too (a Ghana outlet running a US-FDA story, an
// entertainment feed on a US actor), so — like the AI judge's "when unsure, score
// low" rule — we require a positive African/diaspora signal in the headline.
// African countries, demonyms, major cities, regional + culture/diaspora markers,
// and a handful of the biggest African/diaspora names.
const AFRICA_RE = new RegExp(
  '\\b(' +
  // continent / regions
  'africa\\w*|sub-?saharan|sahel|maghreb|pan-?african|' +
  // countries + demonyms (stems)
  'niger\\w*|ghana\\w*|kenya\\w*|south\\s?africa\\w*|ethiopia\\w*|egypt\\w*|morocc\\w*|senegal\\w*|ivor\\w*|cote d.?ivoire|tanzania\\w*|uganda\\w*|rwanda\\w*|zimbabwe\\w*|zambia\\w*|botswana\\w*|namibia\\w*|mozambiqu\\w*|angola\\w*|cameroon\\w*|congo\\w*|\\bdrc\\b|mali\\w*|algeria\\w*|tunisia\\w*|sudan\\w*|somali\\w*|malawi\\w*|benin\\w*|togo\\w*|burkina|gabon\\w*|guinea\\w*|sierra leone|liberia\\w*|gambia\\w*|mauriti\\w*|madagascar|eswatini|lesotho|djibouti|eritrea\\w*|' +
  // major cities
  'lagos|abuja|accra|nairobi|johannesburg|joburg|cape town|pretoria|durban|cairo|casablanca|dakar|addis ababa|kampala|kigali|kinshasa|ibadan|kano|kumasi|mombasa|marrakech|tangier|' +
  // culture / diaspora markers
  'afrobeat\\w*|amapiano|nollywood|naija|gqom|highlife|kwaito|azonto|diaspora|afro-?caribbean|afro-?beats|black british|african[- ]american|' +
  // biggest African / diaspora names
  'burna boy|wizkid|davido|\\btems\\b|\\brema\\b|asake|\\btyla\\b|ayra starr|stormzy|black sherif|tebogo|hakimi' +
  ')\\b',
  'i'
);

// The BEAT gate: our remit is brand/business, music, sport, screen, fashion,
// creators and drinks — NOT the government policy, health and energy-infrastructure
// copy that general news feeds (e.g. a Ghana wire) also carry. An African news verb
// alone floated "Mahama announces cardiac care centres" over the bar; requiring a
// positive brand-culture signal keeps the desk on its beats. Broad on purpose — a
// rare off-beat match is caught by the exclusions above.
const BEAT_RE = /\b(brand\w*|campaign|advert\w*|marketing|rebrand|music|album|single|mixtape|\bep\b|song|rapper|singer|afrobeat\w*|amapiano|hip-?hop|concert|tour|festival|gig|film|movie|cinema|nollywood|box office|screen|series|premiere|netflix|showmax|grammy|oscar|award\w*|nomination|fashion|designer|runway|couture|\bmodel\b|\bart\b|gallery|exhibition|sport\w*|football|soccer|basketball|athlet\w*|league|\bcup\b|championship|trophy|\bmedal\b|olympic\w*|signing|transfer|creator|influencer|podcast|streaming|startup|funding|\bipo\b|acquisition|merger|\bdeal\b|sponsor\w*|endorsement|drinks?|spirits?|whisky|whiskey|\bgin\b|beer|brewery|distiller\w*|\bwine\b|cognac)\b/i;

/** Deterministic verdicts — same shape as parseVerdicts, no LLM. */
export function deterministicVerdicts(cands: BreakingCandidate[]): BreakingVerdict[] {
  return cands.map((c) => {
    const title = c.title || '';
    const hard = HARD_EXCLUDE_RE.test(title);
    const african = AFRICA_RE.test(title);
    let score = 2; // base for any fresh, on-beat feed item
    const signals: string[] = [];
    const sig = title.match(SIGNAL_RE);
    if (sig) { score += 2; signals.push(sig[0].toLowerCase()); }
    if (MONEY_RE.test(title)) { score += 1; signals.push('$'); }
    if (HIGH_AUTHORITY.test(c.source)) score += 1;
    if (c.category === 'news') score += 0.5;
    if (SOFT_EXCLUDE_RE.test(title)) score -= 3;
    if (hard) score -= 4;
    const onBeat = BEAT_RE.test(title);
    // No clear Africa/diaspora link, or not on our brand-culture beats → cannot
    // clear the FOCUS bar. Cap low so it never publishes; the deterministic mirror
    // of the AI's "when unsure, score low".
    if (!african || !onBeat) score = Math.min(score, 2);
    const importance = Math.max(1, Math.min(5, Math.round(score)));
    const breaking = african && onBeat && !hard && importance >= 4;
    const why = signals.length
      ? `Signal: ${signals.join(', ')} · ${c.source} (${c.category}) · auto-curated`
      : `Fresh from ${c.source} (${c.category}) · auto-curated`;
    return { link: c.link, breaking, importance, why };
  });
}

export interface BreakingHit extends BreakingCandidate {
  importance: number;
  why: string;
}

/** A confirmed break as published to The Wire (data/breaking.json). */
export interface PublishedBreak extends BreakingHit {
  /** ISO timestamp the radar confirmed and surfaced this break. */
  detectedAt: string;
}

export interface BreakingFeed {
  updatedAt: string;
  breaks: PublishedBreak[];
}

/**
 * Merge fresh hits into the published feed: newest-first, deduped by link,
 * capped. Pure — the IO (read/write data/breaking.json) lives in the script.
 */
export function mergeBreaks(feed: BreakingFeed, hits: BreakingHit[], stamp: string, cap = 60): BreakingFeed {
  const existing = feed.breaks ?? [];
  const seen = new Set(existing.map((b) => b.link));
  const fresh: PublishedBreak[] = hits
    .filter((h) => h.link && !seen.has(h.link))
    // highest-importance first within this batch, then they sit atop the feed
    .sort((a, b) => b.importance - a.importance)
    .map((h) => ({ ...h, detectedAt: stamp }));
  return { updatedAt: stamp, breaks: [...fresh, ...existing].slice(0, cap) };
}

/** Render the alert email (HTML + text). */
export function renderAlert(hits: BreakingHit[], stamp: string): { subject: string; html: string; text: string } {
  const top = [...hits].sort((a, b) => b.importance - a.importance);
  const subject = `🔴 BREAKING (${hits.length}): ${top[0].title.slice(0, 80)}`;
  const rows = top
    .map(
      (h) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #eee">
          <div style="font-size:11px;letter-spacing:1.5px;color:#9a958c;text-transform:uppercase">${h.source} · ${h.category} · importance ${h.importance}/5</div>
          <a href="${h.link}" style="font-size:18px;font-weight:700;color:#141414;text-decoration:none">${h.title}</a>
          <div style="font-size:14px;color:#555;margin-top:4px">${h.why}</div>
        </td></tr>`
    )
    .join('');
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:640px">
    <p style="font-size:12px;letter-spacing:2px;color:#E8A33D;font-weight:700">MONOKROMATIK · BREAKING RADAR</p>
    <p style="font-size:13px;color:#777">${hits.length} story${hits.length === 1 ? '' : 'ies'} just broke in your focus segments — ${stamp}.</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="font-size:12px;color:#999;margin-top:16px">Flagged from trusted feeds. Move fast.</p>
  </div>`;
  const text = `MONOKROMATIK — BREAKING (${hits.length}) · ${stamp}\n\n` +
    top.map((h) => `• [${h.source} · ${h.importance}/5] ${h.title}\n  ${h.why}\n  ${h.link}`).join('\n\n');
  return { subject, html, text };
}
