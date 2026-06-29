// Tiny inline-SVG sparkline for a brand's score trajectory across Index snapshots.
// Pure/presentational. Degrades gracefully: a single snapshot renders a dot + label
// rather than a misleading flat line.

export default function Sparkline({
  points,
  width = 200,
  height = 44,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length === 0) return null;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const x = (i: number) => pad + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number) => pad + h - ((v - min) / span) * h;

  if (points.length === 1) {
    return (
      <svg width={width} height={height} role="img" aria-label={`Score ${points[0]}, first snapshot`}>
        <circle cx={x(0)} cy={pad + h / 2} r={3.5} fill="var(--mono-amber, #cc6f3a)" />
      </svg>
    );
  }

  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = points.length - 1;

  return (
    <svg width={width} height={height} role="img" aria-label={`Score trajectory: ${points.join(', ')}`}>
      <path d={d} fill="none" stroke="var(--mono-amber, #cc6f3a)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(points[last])} r={3} fill="var(--mono-amber, #cc6f3a)" />
    </svg>
  );
}
