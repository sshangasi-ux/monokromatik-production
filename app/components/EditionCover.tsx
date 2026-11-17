'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  number: string;
  coverTitle: string;
  dateLabel: string;
}

type WayKey = 'amber' | 'ink' | 'signal';
interface Way {
  a: string;
  b: string;
  ink: string;
  chip: string;
}

const WAYS: Record<WayKey, Way> = {
  amber: { a: '#E8631C', b: '#8F3D12', ink: '#F7F3EC', chip: 'linear-gradient(135deg,#E8631C,#8F3D12)' },
  ink: { a: '#CFC9BF', b: '#2A2621', ink: '#F7F3EC', chip: 'linear-gradient(135deg,#d9d4cb,#3a3732)' },
  signal: { a: '#F7A14B', b: '#CC5500', ink: '#160A02', chip: 'linear-gradient(135deg,#F7A14B,#CC5500)' },
};

function hexToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [parseInt(s.substr(0, 2), 16), parseInt(s.substr(2, 2), 16), parseInt(s.substr(4, 2), 16)];
}

export default function EditionCover({ number, coverTitle, dateLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [way, setWay] = useState<WayKey>('amber');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paint = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cfg = WAYS[way];
      const a = hexToRgb(cfg.a);
      const b = hexToRgb(cfg.b);

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, `rgb(${a[0]},${a[1]},${a[2]})`);
      g.addColorStop(1, `rgb(${Math.round(b[0] * 0.5)},${Math.round(b[1] * 0.5)},${Math.round(b[2] * 0.5)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 4; i++) {
        const lg = ctx.createLinearGradient(0, h * (i / 4), w, h * (i / 4) + h * 0.5);
        lg.addColorStop(0, 'rgba(255,255,255,0)');
        lg.addColorStop(0.5, `rgba(255,255,255,${0.05 + 0.03 * i})`);
        lg.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, w, h);
      }

      const rg = ctx.createRadialGradient(w * 0.62, h * 0.4, 10, w * 0.62, h * 0.4, h * 0.7);
      rg.addColorStop(0, `rgba(${a[0]},${a[1]},${a[2]},0.35)`);
      rg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);

      const count = Math.floor((w * h) / 90);
      ctx.globalAlpha = 0.06;
      for (let j = 0; j < count; j++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
      }
      ctx.globalAlpha = 1;
    };

    paint();
    const t = setTimeout(paint, 250);
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [way]);

  const inkColor = WAYS[way].ink;

  return (
    <div>
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
        style={{ background: WAYS[way].chip }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
        {/* film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
          <div className="font-feature text-2xl font-black tracking-tight sm:text-3xl" style={{ color: inkColor }}>
            Mono<span className="font-normal">Kromatik</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="max-w-[7ch] font-feature text-xl font-black leading-[0.95] sm:text-2xl" style={{ color: inkColor }}>
              {coverTitle}
            </div>
            <div className="text-right font-display text-[11px] uppercase tracking-[0.12em] text-white/85">
              Ed.{number}
              <br />
              {dateLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5" role="group" aria-label="Choose a cover">
        <span className="font-display text-[11px] uppercase tracking-[0.15em] text-mono-gray">Cover</span>
        {(Object.keys(WAYS) as WayKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setWay(k)}
            aria-pressed={way === k}
            title={k[0].toUpperCase() + k.slice(1)}
            className={`h-[30px] w-[30px] cursor-pointer rounded-full border transition-transform ${
              way === k ? 'scale-110 border-mono-amber' : 'border-mono-gray/40'
            }`}
            style={{ background: WAYS[k].chip }}
          />
        ))}
      </div>

      <p className="mt-4 font-display text-[10.5px] uppercase tracking-[0.1em] text-mono-gray">
        <span className="text-mono-soft-white">Visual:</span> MonoKromatik · generative duotone — placeholder for
        the sourced &amp; credited cover portrait
      </p>
    </div>
  );
}
