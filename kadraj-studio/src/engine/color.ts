// Profesyonel renk: lift/gamma/gain renk tekerlekleri, pozlama, sıcaklık, 3D LUT (.cube), chroma key
import type { Project } from '../types';

export const hex = (h: string) => { const n = parseInt(h.replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255); };
/** renk tekerleği seçimi → nötr griden sapma vektörü */
function wheel(color: string, amt: number) { const [r, g, b] = hex(color); const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; return [(r - l) * amt, (g - l) * amt, (b - l) * amt]; }

export interface GradeParams { exposure: number; contrast: number; saturation: number; temp: number; tint: number; shadows: number; highlights: number; liftC: string; liftA: number; gammaC: string; gammaA: number; gainC: string; gainA: number; mix: number }

const curveCache = new Map<string, Uint8ClampedArray[]>();
export function curves(p: GradeParams) {
  const key = JSON.stringify(p); const c = curveCache.get(key); if (c) return c;
  const lift = wheel(p.liftC, p.liftA), gam = wheel(p.gammaC, p.gammaA), gain = wheel(p.gainC, p.gainA);
  const ex = Math.pow(2, p.exposure);
  const out = [0, 1, 2].map(ch => {
    const lut = new Uint8ClampedArray(256);
    const tempK = ch === 0 ? p.temp * 0.08 : ch === 2 ? -p.temp * 0.08 : -p.tint * 0.06;
    for (let i = 0; i < 256; i++) {
      let v = (i / 255) * ex * (1 + tempK);
      v = v + (p.shadows * 0.25 + lift[ch] * 0.6) * (1 - v) * (1 - v);     // gölgeler (lift)
      v = v * (1 + p.highlights * 0.25 * v + gain[ch] * 0.8 * v);            // yüksek ışıklar (gain)
      v = Math.pow(Math.max(0, v), 1 / Math.max(0.05, 1 + gam[ch] * 1.2));   // orta tonlar (gamma)
      v = (v - 0.5) * p.contrast + 0.5;                                        // kontrast (pivot 0.5)
      lut[i] = Math.round(Math.min(1, Math.max(0, v)) * 255);
    }
    return lut;
  });
  if (curveCache.size > 64) curveCache.clear(); curveCache.set(key, out); return out;
}

export function applyGrade(img: ImageData, p: GradeParams) {
  const [R, G, B] = curves(p); const d = img.data, sat = p.saturation, mix = p.mix;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    let r = R[d[i]], g = G[d[i + 1]], b = B[d[i + 2]];
    if (sat !== 1) { const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; }
    if (mix < 1) { r = d[i] + (r - d[i]) * mix; g = d[i + 1] + (g - d[i + 1]) * mix; b = d[i + 2] + (b - d[i + 2]) * mix; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
}

// ---- 3D LUT (.cube) ----
export interface Lut { id: string; name: string; size: number; data: number[] }
export function parseCube(text: string, name: string, id: string): Lut {
  let size = 0; const data: number[] = []; let dmin = [0, 0, 0], dmax = [1, 1, 1];
  for (const raw of text.split('\n')) {
    const l = raw.trim(); if (!l || l.startsWith('#') || l.startsWith('TITLE')) continue;
    if (l.startsWith('LUT_3D_SIZE')) { size = parseInt(l.split(/\s+/)[1]); continue; }
    if (l.startsWith('LUT_1D_SIZE')) throw new Error('1D LUT desteklenmiyor, 3D .cube kullanın');
    if (l.startsWith('DOMAIN_MIN')) { dmin = l.split(/\s+/).slice(1).map(Number); continue; }
    if (l.startsWith('DOMAIN_MAX')) { dmax = l.split(/\s+/).slice(1).map(Number); continue; }
    const v = l.split(/\s+/).map(Number); if (v.length >= 3 && v.every(n => !isNaN(n))) data.push((v[0] - dmin[0]) / (dmax[0] - dmin[0]), (v[1] - dmin[1]) / (dmax[1] - dmin[1]), (v[2] - dmin[2]) / (dmax[2] - dmin[2]));
  }
  if (!size || data.length !== size * size * size * 3) throw new Error(`Geçersiz .cube (boyut ${size}, ${data.length / 3} giriş)`);
  return { id, name, size, data };
}
const lutCache = new Map<string, Float32Array>();
export function applyLut(img: ImageData, lut: Lut, amount: number) {
  let L = lutCache.get(lut.id); if (!L) { L = Float32Array.from(lut.data); lutCache.set(lut.id, L); }
  const N = lut.size, n1 = N - 1, d = img.data;
  const at = (r: number, g: number, b: number, c: number) => L![((b * N + g) * N + r) * 3 + c]; // .cube: kırmızı en hızlı değişir
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const fr = (d[i] / 255) * n1, fg = (d[i + 1] / 255) * n1, fb = (d[i + 2] / 255) * n1;
    const r0 = Math.floor(fr), g0 = Math.floor(fg), b0 = Math.floor(fb);
    const r1 = Math.min(n1, r0 + 1), g1 = Math.min(n1, g0 + 1), b1 = Math.min(n1, b0 + 1);
    const dr = fr - r0, dg = fg - g0, db = fb - b0;
    for (let c = 0; c < 3; c++) {
      const c00 = at(r0, g0, b0, c) * (1 - dr) + at(r1, g0, b0, c) * dr, c10 = at(r0, g1, b0, c) * (1 - dr) + at(r1, g1, b0, c) * dr;
      const c01 = at(r0, g0, b1, c) * (1 - dr) + at(r1, g0, b1, c) * dr, c11 = at(r0, g1, b1, c) * (1 - dr) + at(r1, g1, b1, c) * dr;
      const v = ((c00 * (1 - dg) + c10 * dg) * (1 - db) + (c01 * (1 - dg) + c11 * dg) * db) * 255;
      d[i + c] = d[i + c] + (v - d[i + c]) * amount;
    }
  }
}
export const findLut = (p: Project, id: string) => (p.luts ?? []).find(l => l.id === id);

/** Yerleşik LUT'lar (prosedürel üretilir, .cube olarak da indirilebilir) */
export function builtinLut(kind: 'filmic' | 'bleach' | 'teal' | 'matrix', size = 17): number[] {
  const out: number[] = [];
  for (let b = 0; b < size; b++) for (let g = 0; g < size; g++) for (let r = 0; r < size; r++) {
    let R = r / (size - 1), G = g / (size - 1), B = b / (size - 1); const l = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    const s = (x: number) => x * x * (3 - 2 * x);
    if (kind === 'filmic') { R = s(R) * 0.95 + 0.03; G = s(G) * 0.93 + 0.03; B = s(B) * 0.88 + 0.06; }
    if (kind === 'bleach') { R = l + (R - l) * 0.45; G = l + (G - l) * 0.45; B = l + (B - l) * 0.45; R = s(R); G = s(G); B = s(B); }
    if (kind === 'teal') { const k = l; R = R + (k - 0.5) * 0.22; B = B - (k - 0.5) * 0.25 + 0.04; G = G + 0.02; }
    if (kind === 'matrix') { R = R * 0.75; G = Math.min(1, G * 1.12 + 0.03); B = B * 0.8; }
    out.push(...[R, G, B].map(v => Math.min(1, Math.max(0, v))));
  }
  return out;
}
export function lutToCube(l: Lut) {
  const lines = [`TITLE "${l.name}"`, `LUT_3D_SIZE ${l.size}`];
  for (let i = 0; i < l.data.length; i += 3) lines.push(`${l.data[i].toFixed(6)} ${l.data[i + 1].toFixed(6)} ${l.data[i + 2].toFixed(6)}`);
  return lines.join('\n');
}

// ---- Chroma key (yeşil/mavi perde) ----
export function applyChromaKey(img: ImageData, keyHex: string, similarity: number, smooth: number, spill: number) {
  const [kr, kg, kb] = hex(keyHex).map(v => v * 255);
  const kcb = -0.168736 * kr - 0.331264 * kg + 0.5 * kb, kcr = 0.5 * kr - 0.418688 * kg - 0.081312 * kb;
  const d = img.data, s0 = similarity * 120, s1 = s0 + Math.max(1, smooth * 120);
  const gKey = kg >= kr && kg >= kb, bKey = kb > kg && kb >= kr;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const cb = -0.168736 * r - 0.331264 * g + 0.5 * b, cr = 0.5 * r - 0.418688 * g - 0.081312 * b;
    const dist = Math.hypot(cb - kcb, cr - kcr);
    const a = dist <= s0 ? 0 : dist >= s1 ? 1 : (dist - s0) / (s1 - s0);
    d[i + 3] = Math.min(d[i + 3], a * 255);
    if (spill > 0 && a > 0) {
      if (gKey) { const m = Math.max(r, b); if (g > m) d[i + 1] = g - (g - m) * spill; }
      else if (bKey) { const m = Math.max(r, g); if (b > m) d[i + 2] = b - (b - m) * spill; }
    }
  }
}
