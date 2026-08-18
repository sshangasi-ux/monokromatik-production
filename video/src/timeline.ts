import manifest from './audio-manifest.json';
import { SCENES } from './scenes';
import type { Scene } from './scenes';
import { FPS } from './theme';

const dur: Record<string, number> = Object.fromEntries(manifest.map((m) => [m.id, m.durationSec]));

export type Seg = { scene: Scene; from: number; frames: number; audio: string };

// Lay scenes end-to-end; each scene runs for its VO length + a short tail so the
// last word lands before the cut.
export function timeline(ids: string[]): { segs: Seg[]; total: number } {
  let from = 0;
  const segs: Seg[] = [];
  for (const id of ids) {
    const scene = SCENES.find((s) => s.id === id);
    if (!scene) continue;
    const frames = Math.round((dur[id] ?? 3) * FPS) + 8;
    segs.push({ scene, from, frames, audio: `audio/${id}.m4a` });
    from += frames;
  }
  return { segs, total: from };
}
