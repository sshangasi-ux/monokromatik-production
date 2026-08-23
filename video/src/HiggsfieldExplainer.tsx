import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { C, FPS } from './theme';
import { Chrome, SceneOverlay } from './hf-overlays';
import scenes from './hf-scenes.json';

const CLIP_SECONDS = 8; // seedance clips are 8s; each is stretched to fill its scene

export type Man = { i: number; clip: string; audio: string; voDur: number };
type Scn = { id: number; kind: string; accent?: boolean; overlay: Record<string, unknown> };

export function buildTimeline(manifest: Man[]) {
  let from = 0;
  const segs = manifest.map((m) => {
    const scn = (scenes as Scn[]).find((s) => s.id === m.i)!;
    const sceneSec = m.voDur + 0.35;
    const frames = Math.round(sceneSec * FPS);
    const seg = { m, scn, from, frames, playbackRate: CLIP_SECONDS / sceneSec };
    from += frames;
    return seg;
  });
  return { segs, total: from };
}

const MusicBed: React.FC<{ src: string; total: number }> = ({ src, total }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [0, 24, total - 40, total], [0, 0.13, 0.13, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <Audio src={staticFile(src)} volume={v} />;
};

export const HiggsfieldExplainer: React.FC<{ manifest: Man[]; music?: string; horizontal?: boolean }> = ({ manifest, music, horizontal }) => {
  const { segs, total } = buildTimeline(manifest);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      {segs.map(({ m, scn, from, frames, playbackRate }) => (
        <Sequence key={m.i} from={from} durationInFrames={frames} name={`scene-${m.i}`}>
          <AbsoluteFill>
            <OffthreadVideo src={staticFile(m.clip)} playbackRate={playbackRate} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
          <Audio src={staticFile(m.audio)} />
          <SceneOverlay kind={scn.kind} overlay={scn.overlay} accent={scn.accent} horizontal={horizontal} />
        </Sequence>
      ))}
      {music && <MusicBed src={music} total={total} />}
      <Chrome total={total} horizontal={horizontal} />
    </AbsoluteFill>
  );
};
