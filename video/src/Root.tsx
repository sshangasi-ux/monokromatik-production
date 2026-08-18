import React from 'react';
import { Composition } from 'remotion';
import { ArticleExplainer } from './ArticleExplainer';
import { HiggsfieldExplainer, buildTimeline, type Man } from './HiggsfieldExplainer';
import { SCENES, SHORT_IDS } from './scenes';
import { timeline } from './timeline';
import { FPS } from './theme';
import hfManifest from './hf-manifest.json';
import hfManifestH from './hf-manifest-h.json';

const allIds = SCENES.map((s) => s.id);
const MUSIC = 'hf/music.m4a';

export const RemotionRoot: React.FC = () => {
  const full = timeline(allIds).total;
  const short = timeline(SHORT_IDS).total;
  const vTotal = buildTimeline(hfManifest as Man[]).total;
  const hTotal = buildTimeline(hfManifestH as Man[]).total;
  return (
    <>
      <Composition
        id="HiggsfieldExplainer"
        component={HiggsfieldExplainer}
        durationInFrames={vTotal}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ manifest: hfManifest as Man[], music: MUSIC, horizontal: false }}
      />
      <Composition
        id="HiggsfieldExplainerH"
        component={HiggsfieldExplainer}
        durationInFrames={hTotal}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ manifest: hfManifestH as Man[], music: MUSIC, horizontal: true }}
      />
      <Composition id="ArticleExplainer" component={ArticleExplainer} durationInFrames={full} fps={FPS} width={1920} height={1080} defaultProps={{ ids: allIds }} />
      <Composition id="ArticleExplainerShort" component={ArticleExplainer} durationInFrames={short} fps={FPS} width={1080} height={1920} defaultProps={{ ids: SHORT_IDS }} />
    </>
  );
};
