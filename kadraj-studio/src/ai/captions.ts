// Altyazı: Whisper transkripsiyonu, metinden zamanlama, SRT içe/dışa aktarım, timeline'a basma
import type { Clip, Project } from '../types';
import { getRuntime } from '../engine/media';
import { defaultText, newClip, newTrack } from '../util';
import { TEXT_STYLES } from '../engine/presets';

export interface Cue { start: number; end: number; text: string }

export async function clipAudio16k(c: Clip): Promise<Float32Array> {
  const buf = getRuntime(c.assetId)?.audio; if (!buf) throw new Error('Klipte ses yok');
  const len = Math.ceil(c.duration * 16000);
  const ctx = new OfflineAudioContext(1, Math.max(1, len), 16000);
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = c.speed; src.connect(ctx.destination);
  src.start(0, c.in, c.duration * c.speed);
  return (await ctx.startRendering()).getChannelData(0);
}

export const WHISPER_MODELS = [
  { id: 'onnx-community/whisper-tiny', label: 'Tiny (~40 MB, en hızlı)' },
  { id: 'onnx-community/whisper-base', label: 'Base (~80 MB, dengeli)' },
  { id: 'onnx-community/whisper-small', label: 'Small (~250 MB, en iyi Türkçe)' },
];

let worker: Worker | null = null;
export function transcribe(audio: Float32Array, model: string, language: string, onMsg: (m: string) => void): Promise<Cue[]> {
  worker ??= new Worker(new URL('./whisper.worker.ts', import.meta.url), { type: 'module' });
  return new Promise((res, rej) => {
    worker!.onmessage = e => {
      const d = e.data;
      if (d.type === 'progress') onMsg(`Model indiriliyor: ${d.file} ${Math.round(d.progress)}%`);
      else if (d.type === 'status') onMsg(d.msg);
      else if (d.type === 'error') rej(new Error(d.msg));
      else if (d.type === 'done') res((d.chunks as { text: string; timestamp: [number, number | null] }[]).map(ch => ({ start: ch.timestamp[0], end: ch.timestamp[1] ?? ch.timestamp[0] + 2, text: ch.text.trim() })).filter(c => c.text));
    };
    worker!.postMessage({ audio, model, language }, [audio.buffer]);
  });
}

/** Cümle düzeyindeki cue'ları ekranda okunabilir parçalara böler (kelime sayısı / karakter sınırı) */
export function splitCues(cues: Cue[], maxWords = 4, maxChars = 28): Cue[] {
  const out: Cue[] = [];
  for (const c of cues) {
    const words = c.text.split(/\s+/).filter(Boolean); if (!words.length) continue;
    const groups: string[][] = []; let cur: string[] = [];
    for (const w of words) { if (cur.length && (cur.length >= maxWords || [...cur, w].join(' ').length > maxChars)) { groups.push(cur); cur = []; } cur.push(w); if (/[.!?…,;:]$/.test(w) && cur.length >= 2) { groups.push(cur); cur = []; } }
    if (cur.length) groups.push(cur);
    const total = groups.reduce((n, g) => n + g.join(' ').length, 0); let t = c.start; const span = Math.max(0.2, c.end - c.start);
    for (const g of groups) { const d = span * (g.join(' ').length / total); out.push({ start: t, end: t + d, text: g.join(' ') }); t += d; }
  }
  return out;
}

/** Metni verilen süreye okuma hızına göre dağıtır (Whisper olmadan, senaryo metninden altyazı) */
export function cuesFromText(text: string, start: number, duration: number): Cue[] {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?…])\s+/).filter(Boolean);
  const total = sentences.reduce((n, s) => n + s.length, 0) || 1; let t = start;
  return sentences.map(s => { const d = duration * (s.length / total); const c = { start: t, end: t + d, text: s }; t += d; return c; });
}

const ts = (t: number) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
export function toSrt(cues: Cue[]) { return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'); }
export function parseSrt(s: string): Cue[] {
  const p = (x: string) => { const m = x.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000 : 0; };
  return s.replace(/\r/g, '').split(/\n\n+/).map(b => { const l = b.trim().split('\n'); const i = l.findIndex(x => x.includes('-->')); if (i < 0) return null; const [a, z] = l[i].split('-->'); return { start: p(a), end: p(z), text: l.slice(i + 1).join('\n').replace(/<[^>]+>/g, '') }; }).filter(Boolean) as Cue[];
}

export const CAPTION_TRACK = 'Altyazı';
export function cuesFromProject(p: Project): Cue[] {
  const tr = p.tracks.find(t => t.name === CAPTION_TRACK); if (!tr) return [];
  return p.clips.filter(c => c.trackId === tr.id && c.kind === 'text').sort((a, b) => a.start - b.start).map(c => ({ start: c.start, end: c.start + c.duration, text: c.text!.text }));
}

/** Cue'ları "Altyazı" izine metin klibi olarak basar. Proje taslağına (immer draft) uygular. */
export function applyCues(d: Project, cues: Cue[], style: string, replace = true) {
  let tr = d.tracks.find(t => t.name === CAPTION_TRACK);
  if (!tr) { tr = newTrack('video', CAPTION_TRACK); d.tracks.unshift(tr); }
  const tid = tr.id;
  if (replace) d.clips = d.clips.filter(c => c.trackId !== tid);
  const st = TEXT_STYLES[style]?.t ?? TEXT_STYLES.caption.t;
  const portrait = d.settings.height > d.settings.width;
  for (const c of cues) {
    const k = newClip(tid, 'text', c.start, Math.max(0.15, c.end - c.start), { name: c.text.slice(0, 20), text: { ...defaultText(c.text), ...st, size: Math.round((st.size ?? 64) * (portrait ? 1 : 0.8)), anim: style === 'caption' ? 'pop' : st.anim ?? 'none', animD: 0.18 } });
    k.base.y = portrait ? d.settings.height * 0.18 : d.settings.height * 0.36;
    d.clips.push(k);
  }
}
