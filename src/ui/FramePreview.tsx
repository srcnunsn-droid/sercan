import { useEffect, useRef } from 'react';
import type { ThreeParams } from '../content';
import { LIGHT_BY_ID } from '../content';
import type { LightRig } from '../model/types';
import { dirVector, makeProjector, shotAt, type V3 } from '../engine/shot';
import { BONES, layoutFigures, worldJoints, type PoseId } from '../engine/figures';
import { kelvinToRgb } from '../lib/color';

export interface FrameProps {
  params: ThreeParams;
  aspect?: number;            // width / height
  light?: LightRig;
  figures?: number;
  poses?: PoseId[];
  t?: number;                 // fixed time 0..1; if undefined and animate, loops
  animate?: boolean;
  overlays?: boolean;
  label?: string;
  onTime?: (t: number) => void;
}

const reduceMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const TINTS: [number, number, number][] = [[226, 180, 96], [140, 170, 220], [180, 140, 200]];

export function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, p: FrameProps, time: number) {
  const shot = shotAt(p.params, time);
  const pr = makeProjector(shot, w, h);
  const lightK = p.light?.kelvin ?? 5200;
  const [lr, lg, lb] = kelvinToRgb(lightK);
  // backdrop: dusk-to-floor gradient tinted by the light colour
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgb(${18 + lr * 0.06},${18 + lg * 0.06},${22 + lb * 0.08})`);
  g.addColorStop(1, '#08080a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  const seg = (a: V3, b: V3, n = 12) => {
    ctx.beginPath(); let pen = false;
    for (let i = 0; i <= n; i++) {
      const q = pr.project([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n, a[2] + (b[2] - a[2]) * i / n]);
      if (!q) { pen = false; continue; }
      if (!pen) { ctx.moveTo(q.x, q.y); pen = true; } else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();
  };
  // floor grid
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(227,180,80,0.13)';
  for (let x = -12; x <= 12; x += 1) seg([x, 0, -30], [x, 0, 10], 24);
  for (let z = -30; z <= 10; z += 1) seg([-12, 0, z], [12, 0, z], 24);
  // set pieces: pillars that reveal lens compression
  ctx.strokeStyle = 'rgba(200,190,170,0.28)';
  for (const z of [-3, -7, -11, -15, -19]) for (const x of [-2.6, 2.6]) {
    const a = pr.project([x, 0, z]); const b = pr.project([x, 3.2, z]);
    if (!a || !b) continue;
    ctx.lineWidth = Math.max(1, (0.25 * h) / a.z);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  // figures sorted far -> near
  const figs = layoutFigures({ count: p.figures ?? (p.params.two || p.params.ots ? 2 : 1), ots: p.params.ots, two: p.params.two, poses: p.poses });
  const L = p.light ? dirVector(p.light.direction) : dirVector('front-left');
  const camDir: V3 = (() => { const d = [shot.pos[0], shot.pos[1] - 1.3, shot.pos[2]]; const l = Math.hypot(...d) || 1; return [d[0] / l, d[1] / l, d[2] / l] as V3; })();
  const facing = Math.max(0, L[0] * camDir[0] + L[1] * camDir[1] + L[2] * camDir[2]);
  const back = Math.max(0, -(L[0] * camDir[0] + L[2] * camDir[2]));
  const order = figs.map((f) => ({ f, d: Math.hypot(f.pos[0] - shot.pos[0], f.pos[2] - shot.pos[2]) })).sort((a, b) => b.d - a.d);
  for (const { f } of order) {
    if (p.params.pov && f.tint === 0 && figs.length > 1) continue;
    const J = worldJoints(f);
    const base = TINTS[f.tint % TINTS.length];
    const k = 0.35 + 0.65 * facing;
    const col = `rgb(${Math.round(base[0] * k * lr / 255 + 20)},${Math.round(base[1] * k * lg / 255 + 18)},${Math.round(base[2] * k * lb / 255 + 18)})`;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const drawBones = (style: string, extra: number) => {
      ctx.strokeStyle = style;
      for (const [a, b] of BONES) {
        const A = pr.project(J[a]); const B = pr.project(J[b]);
        if (!A || !B) continue;
        ctx.lineWidth = Math.max(1.5, ((a === 'neck' ? 0.3 : 0.11) + extra) * (h / (2 * Math.tan((shot.fovDeg * Math.PI) / 360))) / ((A.z + B.z) / 2));
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      const H = pr.project(J.head);
      if (H) { const r = (0.12 + extra / 2) * (h / (2 * Math.tan((shot.fovDeg * Math.PI) / 360))) / H.z; ctx.fillStyle = style; ctx.beginPath(); ctx.arc(H.x, H.y, Math.max(2, r), 0, Math.PI * 2); ctx.fill(); }
    };
    if (back > 0.3) drawBones(`rgba(${lr},${lg},${lb},${0.55 * back})`, 0.035); // rim light halo
    drawBones(col, 0);
  }

  // soft-focus veil for shallow depth of field on long lenses
  if (shot.lensMm >= 85) { ctx.fillStyle = 'rgba(8,8,10,0.12)'; ctx.fillRect(0, 0, w, h); }

  if (p.overlays !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
    for (const f of [1 / 3, 2 / 3]) { ctx.beginPath(); ctx.moveTo(w * f, 0); ctx.lineTo(w * f, h); ctx.moveTo(0, h * f); ctx.lineTo(w, h * f); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(227,180,80,0.45)'; ctx.setLineDash([4, 4]);
    ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9); ctx.setLineDash([]);
  }
  return shot;
}

export function FramePreview(props: FrameProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf = 0; let visible = true; let start = performance.now();
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    const paint = (now: number) => {
      const p = propsRef.current;
      const loop = p.animate && p.t === undefined && !reduceMotion();
      const time = p.t ?? (loop ? ((now - start) / 4000) % 1.15 : 0);
      drawFrame(ctx, canvas.width, canvas.height, p, Math.min(1, time));
      if (loop && visible) raf = requestAnimationFrame(paint);
    };
    size(); paint(performance.now());
    const ro = new ResizeObserver(() => { size(); paint(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) { start = performance.now(); raf = requestAnimationFrame(paint); } });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [props.animate, props.t, JSON.stringify(props.params), JSON.stringify(props.light), props.figures, JSON.stringify(props.poses)]);

  return <canvas ref={ref} role="img" aria-label={props.label ?? 'Kadraj önizlemesi'} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

/** How the light falls on a face: direction, colour, hardness, secondary rim. */
export function FaceLight({ light }: { light: LightRig }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const r = c.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    const w = c.width, h = c.height, cx = w / 2, cy = h * 0.52, rx = w * 0.26, ry = h * 0.36;
    ctx.fillStyle = '#060607'; ctx.fillRect(0, 0, w, h);
    const [lr, lg, lb] = kelvinToRgb(light.kelvin);
    const L = dirVector(light.direction);
    // light position in 2D: x from left/right, y from up/down; front component brightens overall
    const lx = cx + L[0] * rx * 1.2; const ly = cy - L[1] * ry * 1.1;
    const front = Math.max(0, L[2]);
    const hard = light.hardness === 'sert';
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = `rgb(${18 + lr * 0.05},${16 + lg * 0.05},${16 + lb * 0.05})`; ctx.fillRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(lx, ly, rx * 0.1, lx, ly, rx * (1.6 + front));
    grad.addColorStop(0, `rgba(${lr},${lg},${lb},0.95)`);
    grad.addColorStop(hard ? 0.5 : 0.25, `rgba(${lr},${lg},${lb},${hard ? 0.85 : 0.6})`);
    grad.addColorStop(hard ? 0.56 : 0.85, `rgba(${lr * 0.2},${lg * 0.2},${lb * 0.2},${hard ? 0.05 : 0.25})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    // features: eye sockets, nose shadow cast away from the light
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    for (const sx of [-0.38, 0.38]) { ctx.beginPath(); ctx.ellipse(cx + sx * rx, cy - ry * 0.12, rx * 0.17, ry * 0.07, 0, 0, Math.PI * 2); ctx.fill(); }
    const nsx = -L[0] * rx * 0.22; const nsy = L[1] * ry * 0.12 + ry * 0.05;
    ctx.fillStyle = `rgba(0,0,0,${hard ? 0.55 : 0.25})`; ctx.filter = hard ? 'none' : `blur(${Math.round(w * 0.02)}px)`;
    ctx.beginPath(); ctx.ellipse(cx + nsx, cy + ry * 0.18 + nsy, rx * 0.12, ry * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
    if (light.secondary) {
      const [sr, sg, sb] = kelvinToRgb(light.secondary.kelvin);
      const S = dirVector(light.secondary.direction);
      ctx.strokeStyle = `rgba(${sr},${sg},${sb},0.85)`; ctx.lineWidth = w * 0.012;
      const a0 = Math.atan2(-S[1], S[0]);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0 - 0.7, a0 + 0.7); ctx.stroke();
    }
    const src = LIGHT_BY_ID[light.source];
    ctx.fillStyle = 'rgba(243,234,214,0.8)'; ctx.font = `${Math.round(w * 0.045)}px 'JetBrains Mono', monospace`;
    ctx.fillText(`${src?.tr ?? light.source} · ${light.kelvin}K`, w * 0.04, h * 0.95);
  }, [JSON.stringify(light)]);
  return <canvas ref={ref} role="img" aria-label="Yüz ışık önizlemesi" style={{ width: '100%', height: '100%', display: 'block' }} />;
}
