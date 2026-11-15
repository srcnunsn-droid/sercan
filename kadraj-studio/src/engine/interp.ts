import type { AnimProp, Clip, Easing, Keyframe, Transform } from '../types';
import { hashStr } from '../util';

export const EASINGS: Record<Exclude<Easing, 'bezier'>, (t: number) => number> = {
  linear: t => t,
  easeIn: t => t * t * t,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeInOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  backOut: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  bounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
  hold: t => (t < 1 ? 0 : 1),
};
export const EASING_LABELS: Record<Easing, string> = { linear: 'Doğrusal', easeIn: 'Yavaş başla', easeOut: 'Yavaş bitir', easeInOut: 'Yumuşak', backOut: 'Geri sekme', elastic: 'Elastik', bounce: 'Zıplama', hold: 'Sabit (step)', bezier: 'Bezier (grafik editörü)' };

/** CSS cubic-bezier(x1,y1,x2,y2) — Newton + ikiye bölme ile x→t çözümü */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number, x: number) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bx = (t: number) => ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  const by = (t: number) => ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  const dx = (t: number) => 3 * (1 - 3 * x2 + 3 * x1) * t * t + 2 * (3 * x2 - 6 * x1) * t + 3 * x1;
  let t = x; for (let i = 0; i < 8; i++) { const e = bx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-6) break; if (Math.abs(d) < 1e-6) break; t -= e / d; }
  if (t < 0 || t > 1 || Math.abs(bx(t) - x) > 1e-4) { let lo = 0, hi = 1; t = x; for (let i = 0; i < 30; i++) { const v = bx(t); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
  return by(t);
}
export const easeOf = (k: Keyframe) => (k.e === 'bezier' && k.b ? (u: number) => cubicBezier(k.b![0], k.b![1], k.b![2], k.b![3], u) : EASINGS[k.e === 'bezier' ? 'easeInOut' : k.e]);

export function sampleKf(kfs: Keyframe[] | undefined, t: number, fallback: number): number {
  if (!kfs || kfs.length === 0) return fallback;
  if (t <= kfs[0].t) return kfs[0].v;
  const last = kfs[kfs.length - 1]; if (t >= last.t) return last.v;
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i], b = kfs[i + 1];
    if (t >= a.t && t <= b.t) { const u = (t - a.t) / (b.t - a.t || 1); return a.v + (b.v - a.v) * easeOf(b)(u); }
  }
  return fallback;
}

// ================= EXPRESSIONS (After Effects tarzı) =================
// Kullanılabilir: time, t (klip içi), value, W, H, index, wiggle(frek, genlik[, oktav]), loopOut('cycle'|'pingpong'),
// linear(x,a,b,v1,v2), ease(x,a,b,v1,v2), easeIn, easeOut, clamp, random(min,max), noise(x), sin, cos, abs, floor, round, PI, valueAtTime(s)
const exprCache = new Map<string, Function | Error>();
export const exprErrors = new Map<string, string>();
function noise1(x: number, seed: number) { // değer gürültüsü (yumuşak)
  const h = (n: number) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (h(i) * (1 - u) + h(i + 1) * u) * 2 - 1;
}
function compile(src: string) {
  let f = exprCache.get(src);
  if (!f) { try { f = new Function('$', `with($){ return (${src.replace(/;\s*$/, '')}); }`); } catch (e) { f = e as Error; } exprCache.set(src, f); }
  return f;
}
export function evalExpr(c: Clip, prop: AnimProp, local: number, value: number): number {
  const src = c.expr?.[prop]; if (!src || !src.trim()) return value;
  const f = compile(src); const key = c.id + ':' + prop;
  if (f instanceof Error) { exprErrors.set(key, f.message); return value; }
  const seed = hashStr(key) % 1000; const time = c.start + local;
  const lin = (x: number, a: number, b: number, v1: number, v2: number) => v1 + (v2 - v1) * Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  const $ = {
    time, t: local, value, W: 0, H: 0, index: 0, PI: Math.PI,
    sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs, floor: Math.floor, round: Math.round, min: Math.min, max: Math.max, pow: Math.pow, sqrt: Math.sqrt, Math,
    clamp: (v: number, a: number, b: number) => Math.min(b, Math.max(a, v)),
    noise: (x: number) => noise1(x, seed),
    random: (a = 0, b = 1) => { const s = Math.sin(seed * 9.13 + Math.floor(time * 24) * 1.7) * 9999; return a + (s - Math.floor(s)) * (b - a); },
    wiggle: (freq: number, amp: number, oct = 1) => { let v = 0, a = 1, f = freq, n = 0; for (let o = 0; o < oct; o++) { v += noise1(time * f, seed + o * 17) * a; n += a; a *= 0.5; f *= 2; } return value + (v / n) * amp; },
    linear: lin, ease: (x: number, a: number, b: number, v1: number, v2: number) => v1 + (v2 - v1) * EASINGS.easeInOut(Math.min(1, Math.max(0, (x - a) / (b - a || 1)))),
    easeIn: (x: number, a: number, b: number, v1: number, v2: number) => v1 + (v2 - v1) * EASINGS.easeIn(Math.min(1, Math.max(0, (x - a) / (b - a || 1)))),
    easeOut: (x: number, a: number, b: number, v1: number, v2: number) => v1 + (v2 - v1) * EASINGS.easeOut(Math.min(1, Math.max(0, (x - a) / (b - a || 1)))),
    valueAtTime: (s: number) => sampleKf(c.kf[prop], s - c.start, c.base[prop]),
    loopOut: (type = 'cycle') => {
      const k = c.kf[prop]; if (!k || k.length < 2) return value; const t0 = k[0].t, t1 = k[k.length - 1].t, d = t1 - t0 || 1;
      if (local <= t1) return value; const n = (local - t0) / d; const ph = (local - t0) % d;
      return sampleKf(k, type === 'pingpong' && Math.floor(n) % 2 ? t1 - ph : t0 + ph, value);
    },
  };
  try { const r = Number(f(new Proxy($, { has: () => true, get: (o, k) => (k in o ? (o as any)[k] : k === Symbol.unscopables ? undefined : (globalThis as any)[k as any]) }))); exprErrors.delete(key); return isFinite(r) ? r : value; }
  catch (e) { exprErrors.set(key, (e as Error).message); return value; }
}

export function transformAt(c: Clip, local: number): Transform {
  const o = { ...c.base };
  (Object.keys(c.kf) as AnimProp[]).forEach(k => { o[k] = sampleKf(c.kf[k], local, c.base[k]); });
  if (c.expr) (Object.keys(c.expr) as AnimProp[]).forEach(k => { o[k] = evalExpr(c, k, local, o[k]); });
  return o;
}

export function upsertKf(list: Keyframe[] | undefined, t: number, v: number, e: Easing = 'easeInOut'): Keyframe[] {
  const arr = [...(list ?? [])].filter(k => Math.abs(k.t - t) > 1 / 120);
  arr.push({ t, v, e }); arr.sort((a, b) => a.t - b.t); return arr;
}

export const BEZIER_PRESETS: Record<string, [number, number, number, number]> = {
  'Easy Ease (F9)': [0.33, 0, 0.67, 1], 'Easy Ease In': [0.33, 0, 1, 1], 'Easy Ease Out': [0, 0, 0.67, 1],
  'Hızlı giriş': [0.05, 0.7, 0.1, 1], 'Taşma (overshoot)': [0.34, 1.56, 0.64, 1], 'Ani başla, yumuşak dur': [0.16, 1, 0.3, 1], 'Doğrusal': [0, 0, 1, 1],
};
