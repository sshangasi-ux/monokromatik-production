// Data layer for Conversations — the editorial slate of leaders, founders and
// operators MonoKromatik is pursuing. These are sourced OUTREACH briefs (who,
// why-now, the questions) — a public roadmap of who we're sitting down with, not
// fabricated interviews. Mirrors lib/case-studies.ts: JSON is the source of truth.

import conversationsData from '../data/conversations.json';

export interface ConversationSource {
  publisher: string;
  href: string;
}

export interface Conversation {
  slug: string;
  name: string;
  /** One-line role/credential. */
  role: string;
  /** The franchise it runs under (e.g. THE BOARDROOM / THE BACKROOM). */
  franchise: string;
  /** Editorial status — 'pursuing' = brief approved, outreach/interview to come. */
  status: 'pursuing' | 'scheduled' | 'published';
  confidence: 'verified' | 'partial';
  /** Why this conversation, why now (1–2 sentences). */
  angle: string;
  /** The questions we'd put to them. */
  questions: string[];
  sources: ConversationSource[];
}

const conversations = conversationsData as Conversation[];

export function getAllConversations(): Conversation[] {
  return conversations;
}

export function getConversationBySlug(slug: string): Conversation | undefined {
  return conversations.find((c) => c.slug === slug);
}
