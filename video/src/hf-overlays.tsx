import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { C } from './theme';
import { ANTON, INTER } from './fonts';

const u = (h: number, base = 1080) => h; // vertical short side = 1080

const useEnter = (delay = 0, dur = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, durationInFrames: dur, config: { damping: 200 } });
};
const rise = (p: number, px = 50) => ({ opacity: p, transform: `translateY(${(1 - p) * px}px)` });

// Persistent legibility scrim + wordmark + progress bar (spans whole video).
export const Chrome: React.FC<{ total: number; horizontal?: boolean }> = ({ total }) => {
  const frame = useCurrentFrame();
  const pct = Math.min(1, frame / total);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)' }} />
      <div style={{ position: 'absolute', top: 54, left: 54, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 18, height: 18, background: C.amber, borderRadius: 3 }} />
        <div style={{ fontFamily: INTER, fontWeight: 900, letterSpacing: 4, fontSize: 26, color: C.white, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>MONOKROMATIK</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 10, width: `${pct * 100}%`, background: C.amber }} />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ children: React.ReactNode; align?: 'center' | 'flex-end'; horizontal?: boolean }> = ({ children, align = 'flex-end', horizontal }) => (
  <AbsoluteFill style={{ justifyContent: align, alignItems: 'center', padding: horizontal ? '0 120px 90px' : '0 64px 150px' }}>{children}</AbsoluteFill>
);

type Overlay = Record<string, any>;

export const SceneOverlay: React.FC<{ kind: string; overlay: Overlay; accent?: boolean; horizontal?: boolean }> = ({ kind, overlay, accent, horizontal }) => {
  const a = useEnter(6), b = useEnter(16), c = useEnter(26);
  const wide = horizontal ? 1200 : 900;
  const statW = horizontal ? 1180 : 900;

  if (kind === 'title') {
    return (
      <Card horizontal={horizontal}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...rise(a, 24), fontFamily: INTER, fontWeight: 700, letterSpacing: 4, fontSize: 24, color: C.amber, marginBottom: 22 }}>{overlay.kicker}</div>
          <div style={{ ...rise(b), fontFamily: ANTON, fontSize: 82, lineHeight: 1.03, color: C.white, textTransform: 'uppercase', textShadow: '0 4px 24px rgba(0,0,0,0.7)' }}>{overlay.title}</div>
        </div>
      </Card>
    );
  }
  if (kind === 'stat') {
    return (
      <Card horizontal={horizontal}>
        <div style={{ width: '100%', maxWidth: statW, background: 'rgba(10,9,8,0.62)', border: `2px solid ${accent ? C.amber : 'rgba(255,255,255,0.14)'}`, borderRadius: 18, padding: '36px 40px', backdropFilter: 'blur(3px)' }}>
          <div style={{ ...rise(a, 20), fontFamily: ANTON, fontSize: 150, lineHeight: 0.9, color: C.amber }}>{overlay.value}</div>
          <div style={{ ...rise(b, 24), fontFamily: INTER, fontWeight: 600, fontSize: 32, lineHeight: 1.25, color: C.white, marginTop: 16 }}>{overlay.label}</div>
          {overlay.source && <div style={{ ...rise(c, 18), fontFamily: INTER, fontWeight: 800, letterSpacing: 2, fontSize: 20, color: C.amber, marginTop: 18, textTransform: 'uppercase' }}>Source · {overlay.source}</div>}
        </div>
      </Card>
    );
  }
  if (kind === 'statement') {
    return (
      <Card horizontal={horizontal}>
        <div style={{ textAlign: 'center', maxWidth: wide }}>
          <div style={{ ...rise(a, 30), fontFamily: ANTON, fontSize: 66, lineHeight: 1.08, color: C.white, textTransform: 'uppercase', textShadow: '0 4px 24px rgba(0,0,0,0.75)' }}>{overlay.line}</div>
          {overlay.source && <div style={{ ...rise(c, 18), fontFamily: INTER, fontWeight: 700, letterSpacing: 1.5, fontSize: 20, color: C.amber, marginTop: 20, textTransform: 'uppercase' }}>{overlay.source}</div>}
        </div>
      </Card>
    );
  }
  if (kind === 'pull') {
    return (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 64 }}>
        <div style={{ textAlign: 'center', maxWidth: 960 }}>
          <div style={{ ...rise(a, 20), fontFamily: ANTON, fontSize: 150, lineHeight: 0.5, color: C.amber }}>“</div>
          <div style={{ ...rise(b, 40), fontFamily: ANTON, fontSize: 84, lineHeight: 1.04, color: C.white, textTransform: 'uppercase', marginTop: 6, textShadow: '0 4px 30px rgba(0,0,0,0.85)' }}>{overlay.line}</div>
        </div>
      </AbsoluteFill>
    );
  }
  if (kind === 'sources') {
    return (
      <Card align="center" horizontal={horizontal}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ ...rise(a, 24), fontFamily: ANTON, fontSize: 58, color: C.white, textTransform: 'uppercase', marginBottom: 34, textShadow: '0 4px 24px rgba(0,0,0,0.75)' }}>{overlay.line}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: wide, margin: '0 auto' }}>
            {(overlay.items ?? []).map((it: string, i: number) => {
              const frame = useCurrentFrame();
              const { fps } = useVideoConfig();
              const p = spring({ frame: frame - (12 + i * 4), fps, durationInFrames: 12, config: { damping: 200 } });
              return <div key={it} style={{ ...rise(p, 20), fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.white, background: 'rgba(10,9,8,0.6)', border: `2px solid ${C.amber}`, borderRadius: 10, padding: '12px 24px' }}>{it}</div>;
            })}
          </div>
          {overlay.url && <div style={{ ...rise(c, 24), fontFamily: INTER, fontWeight: 900, fontSize: 40, color: C.amber, marginTop: 40 }}>{overlay.url}</div>}
        </div>
      </Card>
    );
  }
  return null;
};
