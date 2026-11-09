import React from 'react';
import {C, clamp, rand} from '../theme';

/** Yönlü duman sütunu: deterministik puflar. t = sahne zamanı (sn). */
export const Smoke: React.FC<{x: number; y: number; t: number; start: number; end?: number; rate?: number; life?: number; wind?: number; rise?: number; size?: number; color?: string; opacity?: number; seed?: number; id: string}> = ({
  x, y, t, start, end = 1e9, rate = 3, life = 7, wind = -26, rise = 32, size = 26, color = '#3A3F40', opacity = 0.55, seed = 1, id,
}) => {
  if (t < start) return null;
  const puffs: React.ReactNode[] = [];
  const first = Math.max(0, Math.floor((t - life - start) * rate));
  const last = Math.floor((Math.min(t, end) - start) * rate);
  for (let i = first; i <= last; i++) {
    const emit = start + i / rate;
    const age = t - emit;
    if (age < 0 || age > life) continue;
    const k = age / life;
    const r = size * (0.6 + rand(i * 3.3 + seed) * 0.6) * (1 + k * 3.2);
    const px = x + wind * age * (0.8 + rand(i + seed * 7) * 0.4) + (rand(i * 1.7 + seed) - 0.5) * 30 * (1 + k * 2);
    const py = y - rise * age * (0.8 + rand(i * 2.9 + seed) * 0.4) - k * k * 30;
    const o = opacity * Math.min(1, age * 3) * (1 - k) * (0.7 + rand(i * 5.1 + seed) * 0.3);
    puffs.push(<circle key={i} cx={px} cy={py} r={r} fill={`url(#smk-${id})`} opacity={o} />);
  }
  return (
    <g>
      <defs>
        <radialGradient id={`smk-${id}`}>
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`smkb-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={size * 0.28} />
        </filter>
      </defs>
      <g filter={`url(#smkb-${id})`}>{puffs}</g>
    </g>
  );
};

/** Namlu ateşi: kısa ışık patlaması + yönlü duman bulutu (atışın yönünü gösterir). */
export const MuzzleFlash: React.FC<{x: number; y: number; t: number; at: number; dir?: number; scale?: number; id: string}> = ({x, y, t, at, dir = 1, scale = 1, id}) => {
  const age = t - at;
  if (age < 0 || age > 4) return null;
  const f = clamp(1 - age / 0.22);
  return (
    <g>
      {f > 0 && (
        <g opacity={f}>
          <ellipse cx={x + dir * 34 * scale} cy={y} rx={60 * scale} ry={22 * scale} fill="#FFD48A" opacity={0.75} />
          <circle cx={x + dir * 18 * scale} cy={y} r={16 * scale} fill="#FFFFFF" />
        </g>
      )}
      <Smoke id={`mz-${id}`} x={x + dir * 30 * scale} y={y} t={t} start={at} end={at + 0.35} rate={18} life={3.6} wind={dir * 36 * scale} rise={10} size={14 * scale} color="#C9C2B4" opacity={0.5} seed={at * 10} />
    </g>
  );
};

/** Mermi izi: kaynaktan hedefe ince, kısa süreli çizgi (yön bilgisi). */
export const Tracer: React.FC<{x0: number; y0: number; x1: number; y1: number; t: number; at: number; dur?: number; color?: string}> = ({x0, y0, x1, y1, t, at, dur = 0.55, color = '#FFE3B0'}) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1.3) return null;
  const head = clamp(k);
  const tail = clamp(k - 0.35);
  const arc = -Math.abs(x1 - x0) * 0.06;
  const P = (s: number) => [x0 + (x1 - x0) * s, y0 + (y1 - y0) * s + arc * 4 * s * (1 - s)];
  const [hx, hy] = P(head);
  const [tx, ty] = P(tail);
  return (
    <g opacity={k > 1 ? 1 - (k - 1) / 0.3 : 1}>
      <line x1={tx} y1={ty} x2={hx} y2={hy} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <circle cx={hx} cy={hy} r={3.5} fill="#FFFFFF" />
    </g>
  );
};

/** İsabet: kısa parlama + toz/duman (yere bağlı). */
export const Impact: React.FC<{x: number; y: number; t: number; at: number; scale?: number; id: string}> = ({x, y, t, at, scale = 1, id}) => {
  const age = t - at;
  if (age < 0 || age > 9) return null;
  const f = clamp(1 - age / 0.35);
  return (
    <g>
      {f > 0 && (
        <g opacity={f}>
          <circle cx={x} cy={y} r={50 * scale * (1.4 - f * 0.4)} fill="#FFC47A" opacity={0.7} />
          <circle cx={x} cy={y} r={22 * scale} fill="#FFF2DA" />
        </g>
      )}
      <Smoke id={`im-${id}`} x={x} y={y} t={t} start={at} end={at + 0.6} rate={14} life={8} wind={-30} rise={26} size={22 * scale} color="#5A5650" opacity={0.6} seed={at * 3} />
    </g>
  );
};

/** Sahnenin tamamını sallamayan, seçili vuruşlar için küçük kamera tepkisi. */
export const shake = (t: number, hits: number[], amp = 6) => {
  let dx = 0, dy = 0;
  for (const h of hits) {
    const a = t - h;
    if (a < 0 || a > 0.6) continue;
    const e = Math.exp(-a * 8) * amp;
    dx += Math.sin(a * 70) * e;
    dy += Math.cos(a * 53) * e * 0.6;
  }
  return [dx, dy];
};

export const Rings: React.FC<{cx: number; cy: number; r: number; o?: number; color?: string}> = ({cx, cy, r, o = 1, color = C.brass}) => (
  <g opacity={o} fill="none" stroke={color}>
    <circle cx={cx} cy={cy} r={r} strokeWidth={2} />
    <circle cx={cx} cy={cy} r={r * 1.18} strokeWidth={1} strokeDasharray="4 8" />
  </g>
);
