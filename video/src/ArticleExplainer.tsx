import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { C } from './theme';
import { timeline } from './timeline';
import { Chrome, SceneView } from './scene-components';

export const ArticleExplainer: React.FC<{ ids: string[] }> = ({ ids }) => {
  const { segs, total } = timeline(ids);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      {segs.map(({ scene, from, frames, audio }) => (
        <Sequence key={scene.id} from={from} durationInFrames={frames} name={scene.id}>
          <Audio src={staticFile(audio)} />
          <SceneView scene={scene} />
        </Sequence>
      ))}
      <Chrome total={total} />
    </AbsoluteFill>
  );
};
