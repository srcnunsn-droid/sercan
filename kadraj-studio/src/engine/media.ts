// Çalışma zamanı medya önbelleği: blob -> objectURL -> <img>/<video> + AudioBuffer
import { getBlob, putBlob } from '../db';
import type { Asset } from '../types';
import { uid } from '../util';

interface Runtime { url: string; canvas?: HTMLCanvasElement; img?: HTMLImageElement; video?: HTMLVideoElement; audio?: AudioBuffer | null; thumb?: string; peaks?: Float32Array }
const rt = new Map<string, Runtime>();
const pending = new Map<string, Promise<Runtime | null>>();
let actx: AudioContext | null = null;
export const audioCtx = () => (actx ??= new AudioContext());

export const getRuntime = (id?: string) => (id ? rt.get(id) : undefined);

export function ensureRuntime(a: Asset): Promise<Runtime | null> {
  const ex = rt.get(a.id); if (ex) return Promise.resolve(ex);
  const p = pending.get(a.id); if (p) return p;
  const pr = (async () => {
    const blob = await getBlob(a.id); if (!blob) return null;
    const r = await buildRuntime(a, blob); rt.set(a.id, r); return r;
  })();
  pending.set(a.id, pr); return pr;
}

async function buildRuntime(a: Asset, blob: Blob): Promise<Runtime> {
  const url = URL.createObjectURL(blob);
  const r: Runtime = { url };
  if (a.kind === 'image') {
    const img = new Image(); img.src = url; await img.decode().catch(() => {}); r.img = img; r.thumb = url;
  } else if (a.kind === 'video') {
    const v = document.createElement('video'); v.src = url; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
    await new Promise<void>(res => { v.onloadeddata = () => res(); v.onerror = () => res(); });
    r.video = v; r.thumb = await videoThumb(v);
    r.audio = await decode(blob);
  } else {
    r.audio = await decode(blob);
  }
  if (r.audio) r.peaks = computePeaks(r.audio, 2000);
  return r;
}

async function decode(blob: Blob): Promise<AudioBuffer | null> {
  try { return await audioCtx().decodeAudioData(await blob.arrayBuffer()); } catch { return null; }
}

function computePeaks(b: AudioBuffer, n: number) {
  const d = b.getChannelData(0), out = new Float32Array(n), step = Math.max(1, Math.floor(d.length / n));
  for (let i = 0; i < n; i++) { let m = 0; for (let j = i * step; j < Math.min(d.length, (i + 1) * step); j += 8) m = Math.max(m, Math.abs(d[j])); out[i] = m; }
  return out;
}

async function videoThumb(v: HTMLVideoElement) {
  try {
    await seekVideo(v, Math.min(0.5, (v.duration || 1) / 3));
    const c = document.createElement('canvas'); c.width = 240; c.height = Math.round(240 * (v.videoHeight / v.videoWidth || 0.5625));
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.7);
  } catch { return ''; }
}

export function seekVideo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise(res => {
    if (Math.abs(v.currentTime - t) < 0.001 && v.readyState >= 2) return res();
    const done = () => { v.removeEventListener('seeked', done); clearTimeout(to); res(); };
    const to = setTimeout(done, 1500);
    v.addEventListener('seeked', done); v.currentTime = t;
  });
}

// Dosyadan asset oluştur
export async function importFile(f: File): Promise<Asset | null> {
  const kind: Asset['kind'] | null = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : null;
  if (!kind) return null;
  return assetFromBlob(f, f.name, kind, 'import');
}

export async function assetFromBlob(blob: Blob, name: string, kind: Asset['kind'], origin: Asset['origin'], meta?: Record<string, unknown>): Promise<Asset> {
  const a: Asset = { id: uid('a_'), kind, name, mime: blob.type, duration: 0, w: 0, h: 0, created: Date.now(), origin, meta };
  await putBlob(a.id, blob);
  const r = await buildRuntime(a, blob); rt.set(a.id, r);
  if (r.img) { a.w = r.img.naturalWidth; a.h = r.img.naturalHeight; a.duration = 5; }
  if (r.video) { a.w = r.video.videoWidth; a.h = r.video.videoHeight; a.duration = r.video.duration || 5; }
  if (kind === 'audio') a.duration = r.audio?.duration ?? 1;
  return a;
}

export function mediaSource(id?: string): CanvasImageSource | null {
  const r = id ? rt.get(id) : undefined; if (!r) return null;
  return r.canvas ?? r.video ?? r.img ?? null;
}
export function sourceSize(id?: string): [number, number] | null {
  const r = id ? rt.get(id) : undefined; if (!r) return null;
  if (r.canvas) return [r.canvas.width, r.canvas.height];
  if (r.video) return [r.video.videoWidth, r.video.videoHeight];
  if (r.img) return [r.img.naturalWidth, r.img.naturalHeight];
  return null;
}

// ---- Boyanabilir katman (fırça/silgi) ----
export function paintCanvas(id: string): HTMLCanvasElement | null {
  const r = rt.get(id); if (!r) return null; if (r.canvas) return r.canvas;
  if (!r.img) return null;
  const c = document.createElement('canvas'); c.width = r.img.naturalWidth; c.height = r.img.naturalHeight; c.getContext('2d')!.drawImage(r.img, 0, 0);
  r.canvas = c; return c;
}
/** Boyamayı kalıcı yap: blob'u IndexedDB'ye yazar, küçük resmi günceller */
export async function commitPaint(id: string) {
  const r = rt.get(id); if (!r?.canvas) return;
  const blob = await new Promise<Blob>(res => r.canvas!.toBlob(b => res(b!), 'image/png'));
  await putBlob(id, blob);
  const t = document.createElement('canvas'); t.width = 240; t.height = Math.max(1, Math.round(240 * r.canvas.height / r.canvas.width)); t.getContext('2d')!.drawImage(r.canvas, 0, 0, t.width, t.height);
  r.thumb = t.toDataURL('image/png');
}
/** Piksel verisinden yeni görsel asset'i */
export async function assetFromCanvas(c: HTMLCanvasElement, name: string, origin: Asset['origin'], meta?: Record<string, unknown>) {
  const blob = await new Promise<Blob>(res => c.toBlob(b => res(b!), 'image/png'));
  return assetFromBlob(blob, name, 'image', origin, meta);
}
