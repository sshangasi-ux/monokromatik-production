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

/** Recent, deduped candidates: published within `windowHours` and not yet alerted. */
export function selectCandidates(stories: Story[], alerted: Set<string>, opts?: { windowHours?: number; now?: number }): BreakingCandidate[] {
  const windowMs = (opts?.windowHours ?? 3) * 3_600_000;
  const now = opts?.now ?? Date.now();
  const seen = new Set<string>();
  const out: BreakingCandidate[] = [];
  for (const s of stories) {
    if (!s.link || alerted.has(s.link) || seen.has(s.link)) continue;
    const t = new Date(s.pubDate).getTime();
    if (!isFinite(t) || now - t > windowMs || t > now + 3_600_000) continue; // within window, not future-dated
    seen.add(s.link);
    out.push({ title: s.title, source: s.source, category: s.category, link: s.link, pubDate: s.pubDate });
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

export interface BreakingHit extends BreakingCandidate {
  importance: number;
  why: string;
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
    <p style="font-size:12px;color:#999;margin-top:16px">AI-flagged from trusted feeds. Move fast.</p>
  </div>`;
  const text = `MONOKROMATIK — BREAKING (${hits.length}) · ${stamp}\n\n` +
    top.map((h) => `• [${h.source} · ${h.importance}/5] ${h.title}\n  ${h.why}\n  ${h.link}`).join('\n\n');
  return { subject, html, text };
}
