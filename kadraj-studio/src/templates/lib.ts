// Hareketli grafik şablon DSL'i — şablonlar varlık (asset) gerektirmez: şekil, metin, gradyan, parçacık,
// null ve ayar katmanlarından kurulur. Böylece anında küçük resim üretilir ve her en-boy oranına uyar.
import type { Clip, Easing, Keyframe, Effect, EffectType, ParticleProps, ShapeProps, TextProps } from '../types';
import { defaultText, newClip, uid } from '../util';
import { makeEffect } from '../engine/presets';
import { PARTICLE_PRESETS } from '../engine/particles';

export interface Palette { id: string; name: string; bg: string; bg2: string; a: string; a2: string; text: string; dim: string }
export const PALETTES: Palette[] = [
  { id: 'neon', name: 'Neon Gece', bg: '#07060f', bg2: '#1d0b3a', a: '#ff2e88', a2: '#2de2e6', text: '#ffffff', dim: '#b9b3d9' },
  { id: 'sunset', name: 'Gün Batımı', bg: '#1a0b1e', bg2: '#4a1530', a: '#ff7a45', a2: '#ffcf5c', text: '#fff6ec', dim: '#f3c7b0' },
  { id: 'ocean', name: 'Okyanus', bg: '#031a2b', bg2: '#06415e', a: '#2fd3ff', a2: '#7cffcb', text: '#ecfbff', dim: '#9cc8d8' },
  { id: 'corp', name: 'Kurumsal', bg: '#0c1424', bg2: '#16284a', a: '#3b82f6', a2: '#93c5fd', text: '#ffffff', dim: '#aab6cc' },
  { id: 'paper', name: 'Minimal Beyaz', bg: '#f5f3ef', bg2: '#e6e1d8', a: '#111111', a2: '#e8475f', text: '#111111', dim: '#6b6b6b' },
  { id: 'gold', name: 'Altın Lüks', bg: '#0b0a08', bg2: '#221b10', a: '#d4af37', a2: '#f5e6b8', text: '#f8f1dc', dim: '#a8977a' },
  { id: 'forest', name: 'Orman', bg: '#0a140e', bg2: '#173323', a: '#5fd38d', a2: '#e6f59a', text: '#f0fff4', dim: '#9fc4ad' },
  { id: 'pop', name: 'Pembe Pop', bg: '#ffe3ef', bg2: '#ffc4dc', a: '#ff2d87', a2: '#6c3cff', text: '#2a0a1f', dim: '#8a4a6c' },
  { id: 'cyber', name: 'Siber', bg: '#020806', bg2: '#06261a', a: '#39ff88', a2: '#00e1ff', text: '#d8ffe9', dim: '#6fbf95' },
  { id: 'mono', name: 'Monokrom', bg: '#0a0a0a', bg2: '#1f1f1f', a: '#ffffff', a2: '#9a9a9a', text: '#ffffff', dim: '#8a8a8a' },
];

export interface Ctx { W: number; H: number; u: number; hx: number; P: Palette; V: Record<string, string>; D: number; portrait: boolean }
export const isLight = (P: Palette) => { const n = parseInt(P.bg.slice(1), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11 > 150; };
export interface Field { k: string; label: string; def: string; multiline?: boolean }
export interface Design { id: string; name: string; cat: string; tags: string; dur: number; fields: Field[]; font?: string; thumbT?: number; build: (c: Ctx) => Clip[] }

// ---- easing kısaltmaları ----
const BZ: Record<string, [number, number, number, number]> = { out: [0.16, 1, 0.3, 1], inout: [0.65, 0, 0.35, 1], in: [0.7, 0, 0.84, 0], back: [0.34, 1.56, 0.64, 1], soft: [0.33, 0, 0.67, 1] };
type KP = [number, number, (keyof typeof BZ | 'linear' | 'hold')?];
export function K(pts: KP[]): Keyframe[] {
  return pts.map(([t, v, e]) => { if (e === 'linear' || e === 'hold') return { t, v, e: e as Easing }; return { t, v, e: 'bezier' as Easing, b: [...BZ[e ?? 'out']] as [number, number, number, number] }; });
}

interface Common { start?: number; dur?: number; name?: string; x?: number; y?: number; scale?: number; rot?: number; op?: number; blur?: number; kf?: Clip['kf']; expr?: Clip['expr']; fx?: Effect[]; blend?: GlobalCompositeOperation; mb?: boolean; parent?: string; tIn?: Clip['tIn']; tOut?: Clip['tOut'] }
function base(c: Ctx, kind: Clip['kind'], o: Common, extra: Partial<Clip>): Clip {
  const start = o.start ?? 0; const k = newClip('', kind, start, o.dur ?? Math.max(0.1, c.D - start), { name: o.name ?? kind, ...extra });
  k.base = { x: o.x ?? 0, y: o.y ?? 0, scale: o.scale ?? 1, rotation: o.rot ?? 0, opacity: o.op ?? 1, blur: o.blur ?? 0 };
  if (o.kf) k.kf = o.kf; if (o.expr) k.expr = o.expr; if (o.fx) k.effects = o.fx; if (o.blend) k.blend = o.blend; if (o.mb) k.motionBlur = true;
  if (o.parent) (k as any)._parent = o.parent; if (o.tIn) k.tIn = o.tIn; if (o.tOut) k.tOut = o.tOut;
  return k;
}
export const solid = (c: Ctx, color: string, o: Common = {}) => base(c, 'solid', o, { color });
export const grad = (c: Ctx, c1: string, c2: string, angle = 135, o: Common = {}) => base(c, 'gradient', o, { color: c1, color2: c2, angle });
export function shape(c: Ctx, sp: Partial<ShapeProps> & { shape: ShapeProps['shape'] }, o: Common = {}) {
  return base(c, 'shape', o, { shape: { w: 200, h: 200, fill: c.P.a, stroke: c.P.text, strokeW: 0, radius: 0, ...sp } as ShapeProps });
}
export function text(c: Ctx, str: string, tp: Partial<TextProps>, o: Common = {}) {
  return base(c, 'text', o, { text: { ...defaultText(str), color: c.P.text, shadow: 0, anim: 'none', ...tp, size: Math.round((tp.size ?? 96) * c.u) } });
}
export function parts(c: Ctx, preset: keyof typeof PARTICLE_PRESETS, over: Partial<ParticleProps>, o: Common = {}) {
  return base(c, 'particles', o, { particles: { ...PARTICLE_PRESETS[preset].p, ...over } });
}
export const nul = (c: Ctx, name: string, o: Common = {}) => base(c, 'null', { name, ...o }, {});
export const adjust = (c: Ctx, fx: Effect[], o: Common = {}) => base(c, 'adjust', o, { effects: fx, name: 'Ayar' });
export const fx = (t: EffectType, p: Record<string, number | string> = {}) => makeEffect(t, p);

/** Şablon katmanlarını gerçek kliplere çevirir: parent adlarını id'ye bağlar */
export function resolve(clips: Clip[]): Clip[] {
  const byName = new Map(clips.map(c => [c.name, c.id]));
  for (const c of clips) { const pn = (c as any)._parent; if (pn) { c.parent = byName.get(pn); delete (c as any)._parent; } c.id = c.id || uid('c_'); }
  return clips;
}
