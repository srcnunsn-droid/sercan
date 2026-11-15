import type { Clip, Effect, EffectType, Keyframe, TextProps } from '../types';
import { EFFECT_DEFS } from './effects';
import { uid } from '../util';

export function makeEffect(type: EffectType, over: Record<string, number | string> = {}): Effect {
  const p: Record<string, number | string> = {}; EFFECT_DEFS[type].params.forEach(d => (p[d.k] = d.def));
  return { id: uid('e_'), type, on: true, p: { ...p, ...over } };
}

type KfMap = Clip['kf'];
const k = (t: number, v: number, e: Keyframe['e'] = 'easeInOut'): Keyframe => ({ t, v, e });

export const MOTION_PRESETS: Record<string, { label: string; make: (d: number) => KfMap }> = {
  kenIn: { label: 'Ken Burns – yaklaş', make: d => ({ scale: [k(0, 1), k(d, 1.18, 'linear')] }) },
  kenOut: { label: 'Ken Burns – uzaklaş', make: d => ({ scale: [k(0, 1.2), k(d, 1, 'linear')] }) },
  panL: { label: 'Pan sola', make: d => ({ scale: [k(0, 1.15)], x: [k(0, 120), k(d, -120, 'linear')] }) },
  panR: { label: 'Pan sağa', make: d => ({ scale: [k(0, 1.15)], x: [k(0, -120), k(d, 120, 'linear')] }) },
  tiltUp: { label: 'Tilt yukarı', make: d => ({ scale: [k(0, 1.15)], y: [k(0, -80), k(d, 80, 'linear')] }) },
  pushDrama: { label: 'Dramatik push-in', make: d => ({ scale: [k(0, 1), k(d, 1.35, 'easeIn')] }) },
  popIn: { label: 'Pop giriş', make: () => ({ scale: [k(0, 0.2), k(0.45, 1, 'backOut')], opacity: [k(0, 0), k(0.2, 1)] }) },
  dropIn: { label: 'Yukarıdan düş', make: () => ({ y: [k(0, -700), k(0.7, 0, 'bounce')] }) },
  float: { label: 'Süzülme', make: d => ({ y: Array.from({ length: Math.max(2, Math.ceil(d / 1.5) + 1) }, (_, i) => k(i * 1.5, i % 2 ? -18 : 18)) }) },
  spinIn: { label: 'Dönerek gir', make: () => ({ rotation: [k(0, -180), k(0.8, 0, 'backOut')], scale: [k(0, 0), k(0.8, 1, 'backOut')] }) },
  speedRamp: { label: 'Zoom punch (beat)', make: d => ({ scale: [k(0, 1.25), k(0.25, 1, 'easeOut'), k(d, 1.04, 'linear')] }) },
  focusPull: { label: 'Odak çekme (blur → net)', make: () => ({ blur: [k(0, 25), k(0.9, 0, 'easeOut')] }) },
  dollyZoom: { label: 'Vertigo hissi', make: d => ({ scale: [k(0, 1), k(d / 2, 1.3), k(d, 1)], blur: [k(0, 0), k(d / 2, 2), k(d, 0)] }) },
};

export const GRADE_PRESETS: Record<string, { label: string; fx: () => Effect[] }> = {
  tealOrange: { label: 'Sinematik Teal & Orange', fx: () => [makeEffect('contrast', { v: 1.15 }), makeEffect('saturation', { v: 1.15 }), makeEffect('tint', { color: '#0e7c86', amount: 0.25, mode: 'soft-light' }), makeEffect('tint', { color: '#ff8a3d', amount: 0.18, mode: 'overlay' }), makeEffect('vignette', { amount: 0.45 })] },
  noir: { label: 'Noir', fx: () => [makeEffect('grayscale', { v: 1 }), makeEffect('contrast', { v: 1.45 }), makeEffect('vignette', { amount: 0.75 }), makeEffect('grain', { amount: 0.18 })] },
  vintage: { label: 'Vintage film', fx: () => [makeEffect('sepia', { v: 0.35 }), makeEffect('contrast', { v: 0.92 }), makeEffect('saturation', { v: 0.85 }), makeEffect('grain', { amount: 0.2 }), makeEffect('vignette', { amount: 0.55 }), makeEffect('lightleak', { amount: 0.25 })] },
  warm: { label: 'Sıcak altın saat', fx: () => [makeEffect('tint', { color: '#ffb35c', amount: 0.3, mode: 'soft-light' }), makeEffect('saturation', { v: 1.1 }), makeEffect('brightness', { v: 1.05 })] },
  cold: { label: 'Soğuk thriller', fx: () => [makeEffect('tint', { color: '#2f6f73', amount: 0.35, mode: 'color' }), makeEffect('contrast', { v: 1.25 }), makeEffect('brightness', { v: 0.92 }), makeEffect('vignette', { amount: 0.6 })] },
  vhs: { label: 'VHS / Retro', fx: () => [makeEffect('chroma', { px: 5 }), makeEffect('scanlines', { amount: 0.25 }), makeEffect('saturation', { v: 1.3 }), makeEffect('grain', { amount: 0.22 }), makeEffect('glitch', { amount: 0.25, rate: 0.12 })] },
  cinema: { label: 'Sinema bandı 2.39', fx: () => [makeEffect('letterbox', { ratio: 2.39 }), makeEffect('contrast', { v: 1.1 }), makeEffect('grain', { amount: 0.08 })] },
  dreamy: { label: 'Rüya / Pastel', fx: () => [makeEffect('brightness', { v: 1.1 }), makeEffect('contrast', { v: 0.85 }), makeEffect('saturation', { v: 0.8 }), makeEffect('tint', { color: '#f7b2d9', amount: 0.25, mode: 'screen' })] },
};

export const TEXT_STYLES: Record<string, { label: string; t: Partial<TextProps> }> = {
  hero: { label: 'Büyük başlık', t: { font: 'Bebas Neue', size: 180, weight: 400, color: '#ffffff', shadow: 30, anim: 'tracking', animD: 1.2 } },
  lower: { label: 'Alt bant (lower third)', t: { font: 'Inter', size: 44, weight: 700, color: '#ffffff', bg: 'rgba(232,71,95,0.92)', bgPad: 22, anim: 'fadeUp', shadow: 0, maxW: 0.6 } },
  caption: { label: 'Altyazı / Reels', t: { font: 'Inter', size: 72, weight: 900, color: '#ffffff', stroke: '#000000', strokeW: 10, anim: 'wordByWord', animD: 1.2, shadow: 0 } },
  elegant: { label: 'Zarif serif', t: { font: 'Playfair Display', size: 110, weight: 600, color: '#f5e6c8', anim: 'blurIn', animD: 1.4, shadow: 10 } },
  terminal: { label: 'Terminal', t: { font: 'JetBrains Mono', size: 54, weight: 600, color: '#38ff9c', anim: 'typewriter', animD: 2, shadow: 14 } },
  glitch: { label: 'Glitch başlık', t: { font: 'Arial Black', size: 140, weight: 900, color: '#ffffff', anim: 'glitchIn', animD: 0.9 } },
  meme: { label: 'Meme (Impact)', t: { font: 'Impact', size: 120, weight: 400, color: '#ffffff', stroke: '#000000', strokeW: 12, anim: 'pop', animD: 0.4, shadow: 0 } },
};
