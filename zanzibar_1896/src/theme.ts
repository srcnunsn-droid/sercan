// Tasarım sistemi: renkler, yazı aileleri, zamanlama ve deterministik yardımcılar.
import {Easing, interpolate} from 'remotion';

export const C = {
  night: '#102A3A', // gece laciverti
  deep: '#174D55', // koyu deniz yeşili
  sand: '#D6C2A0', // kum
  ivory: '#F2EBDD', // kırık beyaz
  brass: '#A9824A', // mat pirinç
  danger: '#BA4938', // tehlike vurgusu
  // türetilmiş tonlar (aynı paletin açık/koyu varyasyonları)
  nightDeep: '#0A1C27',
  nightSoft: '#1B3A4C',
  deepSoft: '#2A6670',
  sandDark: '#B39C78',
  brassLight: '#C9A56B',
  brassDark: '#6E5530',
  ink: '#0B1820',
  hull: '#1C2A31',
};

export const FONT_TITLE = "'Playfair Display', Georgia, serif";
export const FONT_LABEL = "'Inter', 'Helvetica Neue', Arial, sans-serif";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
export const easeSoft = Easing.bezier(0.45, 0.05, 0.25, 1);

/** saniye cinsinden zaman t için [a,b] aralığında 0..1 ilerleme (ease uygulanmış) */
export const prog = (t: number, a: number, b: number, ease: (x: number) => number = easeIO) =>
  ease(clamp((t - a) / Math.max(1e-6, b - a)));

/** fade in [a, a+d] ve fade out [b-d, b] */
export const window = (t: number, a: number, b: number, dIn = 0.5, dOut = 0.5) =>
  Math.min(prog(t, a, a + dIn, easeOut), 1 - prog(t, b - dOut, b, easeIn));

export const interp = (t: number, inp: number[], out: number[], ease = easeIO) =>
  interpolate(t, inp, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** deterministik sözde rastgele (kare numarası veya tohumdan bağımsız) */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** yumuşak 1B gürültü */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 101.7), rand(i + 1 + seed * 101.7), u) * 2 - 1;
};
