import React from 'react';
import {
  AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate,
} from 'remotion';
import { C } from './theme';
import { ANTON, INTER } from './fonts';
import type { Scene } from './scenes';

// ---- helpers ---------------------------------------------------------------
const useUnit = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080; // short side = 1080 in both formats
};
const useEnter = (delay = 0, dur = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, durationInFrames: dur, config: { damping: 200 } });
};
const rise = (p: number, px = 60) => ({ opacity: p, transform: `translateY(${(1 - p) * px}px)` });

// ---- persistent chrome (spans the whole video) -----------------------------
export const Chrome: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const u = useUnit();
  const pct = Math.min(1, frame / total);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 44 * u, left: 56 * u, display: 'flex', alignItems: 'center', gap: 12 * u }}>
        <div style={{ width: 14 * u, height: 14 * u, background: C.amber, borderRadius: 2 * u }} />
        <div style={{ fontFamily: INTER, fontWeight: 900, letterSpacing: 3 * u, fontSize: 20 * u, color: C.softWhite }}>
          MONOKROMATIK
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 8 * u, width: `${pct * 100}%`, background: C.amber }} />
    </AbsoluteFill>
  );
};

const Frame: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => (
  <AbsoluteFill style={{ background: bg ?? C.ink, justifyContent: 'center', alignItems: 'center', padding: '9%' }}>
    {children}
  </AbsoluteFill>
);

// ---- scene kinds -----------------------------------------------------------
const Title: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const a = useEnter(4), b = useEnter(14), c = useEnter(26);
  return (
    <Frame bg={C.black}>
      <AbsoluteFill>
        <Img src={staticFile('hero.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28, filter: 'grayscale(0.4) contrast(1.05)' }} />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(20,18,16,0.92))` }} />
      </AbsoluteFill>
      <div style={{ textAlign: 'center', maxWidth: '92%' }}>
        <div style={{ ...rise(a, 30), fontFamily: INTER, fontWeight: 700, letterSpacing: 4 * u, fontSize: 24 * u, color: C.amber, marginBottom: 40 * u }}>
          {s.kicker}
        </div>
        <div style={{ ...rise(b), fontFamily: ANTON, fontSize: 84 * u, lineHeight: 1.02, color: C.white, textTransform: 'uppercase' }}>
          {s.title}
        </div>
        <div style={{ ...rise(c), fontFamily: ANTON, fontSize: 84 * u, lineHeight: 1.02, color: C.amber, textTransform: 'uppercase', marginTop: 8 * u }}>
          {s.title2}
        </div>
      </div>
    </Frame>
  );
};

const Statement: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const p = useEnter(4, 22);
  return (
    <Frame>
      <div style={{ ...rise(p, 40), textAlign: 'center', fontFamily: ANTON, fontSize: 76 * u, lineHeight: 1.08, color: C.white, textTransform: 'uppercase', maxWidth: '90%' }}>
        {s.line}
      </div>
    </Frame>
  );
};

const Stat: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 3, fps, durationInFrames: 22, config: { damping: 12, stiffness: 120 } });
  const lab = useEnter(16, 20);
  const accent = s.accent;
  return (
    <Frame bg={accent ? C.amber : C.ink}>
      <div style={{ textAlign: 'center', maxWidth: '92%' }}>
        <div style={{
          fontFamily: ANTON, fontSize: 340 * u, lineHeight: 0.9,
          color: accent ? C.black : C.amber,
          transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])})`, opacity: pop,
        }}>
          {s.value}
        </div>
        <div style={{ ...rise(lab, 30), fontFamily: INTER, fontWeight: 600, fontSize: 34 * u, lineHeight: 1.25, color: accent ? C.charcoal : C.softWhite, marginTop: 30 * u, maxWidth: 1200 * u, marginLeft: 'auto', marginRight: 'auto' }}>
          {s.label}
        </div>
        {s.cite && (
          <div style={{ ...rise(lab), fontFamily: INTER, fontWeight: 700, letterSpacing: 2 * u, fontSize: 20 * u, color: accent ? C.charcoal : C.gray, marginTop: 24 * u, textTransform: 'uppercase' }}>
            Source · {s.cite}
          </div>
        )}
      </div>
    </Frame>
  );
};

const Pull: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const q = useEnter(2, 16), t = useEnter(12, 22);
  return (
    <Frame>
      <div style={{ textAlign: 'center', maxWidth: '90%' }}>
        <div style={{ ...rise(q, 20), fontFamily: ANTON, fontSize: 200 * u, lineHeight: 0.6, color: C.amber }}>“</div>
        <div style={{ ...rise(t, 40), fontFamily: ANTON, fontSize: 90 * u, lineHeight: 1.05, color: C.white, textTransform: 'uppercase', marginTop: 10 * u }}>
          {s.line}
        </div>
      </div>
    </Frame>
  );
};

const Sources: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const h = useEnter(2, 18);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame>
      <div style={{ textAlign: 'center', width: '92%' }}>
        <div style={{ ...rise(h, 30), fontFamily: ANTON, fontSize: 64 * u, color: C.white, textTransform: 'uppercase', marginBottom: 50 * u }}>{s.line}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 * u, justifyContent: 'center' }}>
          {(s.items ?? []).map((it, i) => {
            // spring() is a pure function (not a hook) — safe inside map.
            const p = spring({ frame: frame - (10 + i * 5), fps, durationInFrames: 14, config: { damping: 200 } });
            return (
              <div key={it} style={{ ...rise(p, 24), fontFamily: INTER, fontWeight: 700, fontSize: 30 * u, color: C.softWhite, border: `${2 * u}px solid ${C.amber}`, borderRadius: 8 * u, padding: `${16 * u}px ${28 * u}px` }}>
                {it}
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
};

const CTA: React.FC<{ s: Scene }> = ({ s }) => {
  const u = useUnit();
  const a = useEnter(2, 16), b = useEnter(12, 18), c = useEnter(22, 18);
  return (
    <Frame bg={C.black}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...rise(a, 20), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 * u, marginBottom: 40 * u }}>
          <div style={{ width: 22 * u, height: 22 * u, background: C.amber, borderRadius: 3 * u }} />
          <div style={{ fontFamily: ANTON, fontSize: 72 * u, color: C.white, textTransform: 'uppercase', letterSpacing: 2 * u }}>MONOKROMATIK</div>
        </div>
        <div style={{ ...rise(b, 30), fontFamily: INTER, fontWeight: 600, fontSize: 40 * u, color: C.softWhite, maxWidth: 1100 * u, margin: '0 auto' }}>{s.line}</div>
        <div style={{ ...rise(c, 24), fontFamily: INTER, fontWeight: 900, fontSize: 44 * u, color: C.amber, marginTop: 44 * u, letterSpacing: 1 * u }}>{s.url}</div>
      </div>
    </Frame>
  );
};

export const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case 'title': return <Title s={scene} />;
    case 'statement': return <Statement s={scene} />;
    case 'stat': return <Stat s={scene} />;
    case 'pull': return <Pull s={scene} />;
    case 'sources': return <Sources s={scene} />;
    case 'cta': return <CTA s={scene} />;
    default: return null;
  }
};
