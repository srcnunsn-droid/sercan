// Parçacık sistemi (AE CC Particle World / Trapcode Particular esinli) — analitik, durumsuz:
// her parçacık indeksinden deterministik türetilir; timeline'da ileri/geri kaydırma her zaman tutarlıdır.
import type { ParticleProps, ShapeProps } from '../types';

const h = (n: number) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const hex = (c: string) => { const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

export const PARTICLE_PRESETS: Record<string, { label: string; p: ParticleProps }> = {
  sparks: { label: '✨ Kıvılcım', p: { rate: 120, life: 1.2, speed: 520, angle: -90, spread: 70, gravity: 700, drag: 0.6, size: 5, sizeEnd: 0.5, color: '#ffd27a', color2: '#ff5a1f', shape: 'spark', additive: true, turbulence: 20, emitW: 40, emitH: 10, seed: 1, spin: 0 } },
  snow: { label: '❄ Kar', p: { rate: 60, life: 8, speed: 70, angle: 90, spread: 25, gravity: 10, drag: 0, size: 6, sizeEnd: 6, color: '#ffffff', color2: '#cfe6ff', shape: 'glow', additive: false, turbulence: 60, emitW: 2200, emitH: 10, seed: 2, spin: 0 } },
  confetti: { label: '🎉 Konfeti', p: { rate: 160, life: 3, speed: 900, angle: -90, spread: 50, gravity: 900, drag: 1.4, size: 14, sizeEnd: 14, color: '#ff4d6d', color2: '#3ddc97', shape: 'confetti', additive: false, turbulence: 80, emitW: 60, emitH: 10, seed: 3, spin: 720 } },
  fire: { label: '🔥 Ateş', p: { rate: 220, life: 0.9, speed: 260, angle: -90, spread: 22, gravity: -250, drag: 0.8, size: 26, sizeEnd: 2, color: '#ffcf4a', color2: '#ff2a00', shape: 'glow', additive: true, turbulence: 90, emitW: 120, emitH: 10, seed: 4, spin: 0 } },
  dust: { label: '🌫 Bokeh tozu', p: { rate: 18, life: 9, speed: 25, angle: -90, spread: 180, gravity: -4, drag: 0, size: 10, sizeEnd: 22, color: '#ffe3b0', color2: '#9ad0ff', shape: 'glow', additive: true, turbulence: 40, emitW: 2000, emitH: 1100, seed: 5, spin: 0 } },
  magic: { label: '🪄 Büyü tozu', p: { rate: 90, life: 2, speed: 140, angle: 0, spread: 180, gravity: -40, drag: 0.5, size: 7, sizeEnd: 0, color: '#c78bff', color2: '#5ab0ff', shape: 'spark', additive: true, turbulence: 120, emitW: 30, emitH: 30, seed: 6, spin: 0 } },
};

export function drawParticles(x: CanvasRenderingContext2D, P: ParticleProps, local: number, s: number) {
  const maxAlive = Math.min(4000, Math.ceil(P.rate * P.life) + 1);
  const firstIdx = Math.max(0, Math.floor((local - P.life) * P.rate)), lastIdx = Math.floor(local * P.rate);
  if (lastIdx - firstIdx > maxAlive * 1.2) return;
  const c1 = hex(P.color), c2 = hex(P.color2);
  x.save(); if (P.additive) x.globalCompositeOperation = 'lighter';
  const k = P.drag;
  for (let i = firstIdx; i <= lastIdx; i++) {
    const birth = i / P.rate; const age = local - birth; if (age < 0 || age > P.life) continue;
    const r1 = h(i * 3.1 + P.seed * 101), r2 = h(i * 7.7 + P.seed * 13), r3 = h(i * 1.3 + P.seed * 7), r4 = h(i * 5.9 + P.seed);
    const life = P.life * (0.6 + 0.4 * r4); if (age > life) continue; const u = age / life;
    const ang = ((P.angle + (r1 - 0.5) * 2 * P.spread) * Math.PI) / 180; const sp = P.speed * (0.55 + 0.45 * r2);
    // sürtünmeli (drag) hareket — analitik çözüm
    const dist = k > 0 ? (sp * (1 - Math.exp(-k * age))) / k : sp * age;
    let px = (r3 - 0.5) * P.emitW + Math.cos(ang) * dist;
    let py = (r4 - 0.5) * P.emitH + Math.sin(ang) * dist + 0.5 * P.gravity * age * age;
    if (P.turbulence) { px += Math.sin(age * 2.3 + i) * P.turbulence * u; py += Math.cos(age * 1.7 + i * 0.7) * P.turbulence * 0.6 * u; }
    const size = (P.size + (P.sizeEnd - P.size) * u) * s; if (size <= 0.1) continue;
    const mix = P.shape === 'confetti' ? (i % 2 ? 0 : 1) : u;
    const col = `rgb(${c1[0] + (c2[0] - c1[0]) * mix | 0},${c1[1] + (c2[1] - c1[1]) * mix | 0},${c1[2] + (c2[2] - c1[2]) * mix | 0})`;
    const alpha = Math.min(1, u * 8) * (1 - Math.pow(u, 3));
    x.globalAlpha = alpha; const X = px * s, Y = py * s;
    if (P.shape === 'glow') { const g = x.createRadialGradient(X, Y, 0, X, Y, size); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(X - size, Y - size, size * 2, size * 2); }
    else if (P.shape === 'spark') { const vx = Math.cos(ang) * sp * Math.exp(-k * age), vy = Math.sin(ang) * sp * Math.exp(-k * age) + P.gravity * age; const l = Math.max(size, Math.hypot(vx, vy) * 0.03 * s); const a = Math.atan2(vy, vx); x.strokeStyle = col; x.lineWidth = size * 0.6; x.lineCap = 'round'; x.beginPath(); x.moveTo(X, Y); x.lineTo(X - Math.cos(a) * l, Y - Math.sin(a) * l); x.stroke(); }
    else if (P.shape === 'confetti') { x.save(); x.translate(X, Y); x.rotate(((P.spin * age + r1 * 360) * Math.PI) / 180); x.scale(1, Math.cos(age * 6 + i)); x.fillStyle = col; x.fillRect(-size / 2, -size / 4, size, size / 2); x.restore(); }
    else if (P.shape === 'square') { x.fillStyle = col; x.fillRect(X - size / 2, Y - size / 2, size, size); }
    else { x.fillStyle = col; x.beginPath(); x.arc(X, Y, size / 2, 0, Math.PI * 2); x.fill(); }
  }
  x.restore();
}

/** Şekil yolu + uzunluğu (trim paths / draw-on için) */
export function shapePath(x: CanvasRenderingContext2D, sp: ShapeProps, s: number): number {
  const w = sp.w * s, h2 = sp.h * s; x.beginPath();
  if (sp.shape === 'rect') { x.roundRect(-w / 2, -h2 / 2, w, h2, sp.radius * s); return 2 * (w + h2) - (8 - 2 * Math.PI) * Math.min(sp.radius * s, w / 2, h2 / 2); }
  if (sp.shape === 'circle') { x.ellipse(0, 0, w / 2, h2 / 2, -Math.PI / 2, 0, Math.PI * 2); const a = w / 2, b = h2 / 2; return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))); }
  if (sp.shape === 'line') { x.moveTo(-w / 2, 0); x.lineTo(w / 2, 0); return w; }
  if (sp.shape === 'triangle') { x.moveTo(0, -h2 / 2); x.lineTo(w / 2, h2 / 2); x.lineTo(-w / 2, h2 / 2); x.closePath(); const sd = Math.hypot(w / 2, h2); return 2 * sd + w; }
  const n = sp.shape === 'star' ? (sp.points ?? 5) * 2 : sp.points ?? 6; let len = 0, px = 0, py = 0;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2; const r = sp.shape === 'star' && i % 2 ? 0.45 : 1;
    const X = Math.cos(a) * (w / 2) * r, Y = Math.sin(a) * (h2 / 2) * r;
    if (i) { x.lineTo(X, Y); len += Math.hypot(X - px, Y - py); } else x.moveTo(X, Y); px = X; py = Y;
  }
  x.closePath(); return len;
}
