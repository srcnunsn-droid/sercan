import type { Clip, Project, Track, Transform } from './types';

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function fmtTime(t: number, fps = 30) {
  const s = Math.max(0, t);
  const m = Math.floor(s / 60), sec = Math.floor(s % 60), f = Math.floor((s % 1) * fps);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

// deterministik rastgele (mulberry32)
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export const defaultTransform = (): Transform => ({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 });

export function newClip(trackId: string, kind: Clip['kind'], start: number, duration: number, extra: Partial<Clip> = {}): Clip {
  return {
    id: uid('c_'), trackId, kind, name: kind, start, duration, in: 0, speed: 1,
    base: defaultTransform(), kf: {}, fit: 'cover', blend: 'source-over', effects: [],
    tIn: { type: 'none', d: 0.5 }, tOut: { type: 'none', d: 0.5 },
    volume: 1, fadeIn: 0, fadeOut: 0, ...extra,
  };
}

export const defaultText = (text = 'Başlık'): NonNullable<Clip['text']> => ({
  text, font: 'Inter', size: 96, weight: 800, color: '#ffffff', align: 'center', stroke: '#000000', strokeW: 0,
  shadow: 18, bg: '', bgPad: 24, lineH: 1.15, anim: 'fadeUp', animD: 0.6, maxW: 0.85,
});

export function newTrack(kind: Track['kind'], name: string): Track {
  return { id: uid('t_'), kind, name, muted: false, hidden: false, locked: false };
}

export function newProject(name = 'Yeni Proje'): Project {
  const tracks = [newTrack('video', 'V3 · Metin'), newTrack('video', 'V2 · Overlay'), newTrack('video', 'V1 · Ana'), newTrack('audio', 'A1 · Ses/VO'), newTrack('audio', 'A2 · Müzik'), newTrack('audio', 'A3 · SFX')];
  return {
    id: uid('p_'), name, updated: Date.now(), version: 1,
    settings: { width: 1920, height: 1080, fps: 30, bg: '#000000', safeArea: false },
    idea: null, scenes: [], assets: [], tracks, clips: [], markers: [],
  };
}

export function projectDuration(p: Project) {
  return p.clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
}

export function download(blob: Blob, name: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function newImageProject(name: string, w: number, h: number, bg = '#ffffff'): Project {
  const tr = newTrack('video', 'Arka plan');
  const bgc = newClip(tr.id, 'solid', 0, 1, { name: 'Arka plan', color: bg });
  return { id: uid('p_'), name, updated: Date.now(), version: 1, mode: 'image', settings: { width: w, height: h, fps: 30, bg: '#000000', safeArea: false }, idea: null, scenes: [], assets: [], tracks: [tr], clips: [bgc], markers: [] };
}
