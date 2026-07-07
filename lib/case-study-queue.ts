// The commission queue — the topical-subject pipeline that makes premium
// case studies a directed, strategy-led output rather than a self-sourced
// scramble. Subjects are ranked by priority and carry an access tier; the
// case-study cycle drafts the top `queued` items and the Operator's Daily
// Brief surfaces the queue every day (monetisation · engagement · reach).
//
// This module is the READ surface (app + brief). The cycle script mutates the
// JSON file directly (marking items `drafted`) so a staged draft and its queue
// update land in the same review PR.

import queueData from '../data/case-study-queue.json';

export type QueueStatus = 'queued' | 'drafted' | 'published' | 'parked';

export interface QueueSubject {
  subject: string;
  brand: string;
  lane: string;
  angle: string;
  priority: number;
  access: 'premium' | 'public';
  status: QueueStatus;
  rationale: string;
}

export interface CaseStudyQueue {
  updated: string;
  note: string;
  subjects: QueueSubject[];
}

const queue = queueData as CaseStudyQueue;

/** The whole queue, verbatim. */
export function getQueue(): CaseStudyQueue {
  return queue;
}

/** Open subjects, highest priority (lowest number) first. */
export function queuedSubjects(): QueueSubject[] {
  return queue.subjects
    .filter((s) => s.status === 'queued')
    .sort((a, b) => a.priority - b.priority);
}

/** Counts by status — for the daily brief's at-a-glance line. */
export function queueCounts(): Record<QueueStatus | 'total', number> {
  const by = (st: QueueStatus) => queue.subjects.filter((s) => s.status === st).length;
  return {
    queued: by('queued'),
    drafted: by('drafted'),
    published: by('published'),
    parked: by('parked'),
    total: queue.subjects.length,
  };
}
