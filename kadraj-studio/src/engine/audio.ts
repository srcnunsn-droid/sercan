// Ses motoru: önizleme zamanlama + offline miks (dışa aktarım)
import type { Clip, Project } from '../types';
import { audioCtx, getRuntime } from './media';

function audibleClips(p: Project) {
  const muted = new Set(p.tracks.filter(t => t.muted).map(t => t.id));
  const hidden = new Set(p.tracks.filter(t => t.kind === 'video' && t.hidden).map(t => t.id));
  return p.clips.filter(c => c.kind === 'media' && !c.muted && !muted.has(c.trackId) && !hidden.has(c.trackId) && getRuntime(c.assetId)?.audio);
}

// Ducking: ses (VO) izinde konuşma olan aralıklarda diğer izlerin seviyesini otomatik düşürür
function voiceIntervals(p: Project): { track: string; iv: [number, number][] } | null {
  const d = p.settings.duck; if (!d?.on) return null;
  const vt = d.voiceTrack ?? p.tracks.find(t => t.kind === 'audio')?.id; if (!vt) return null;
  const iv = p.clips.filter(c => c.trackId === vt && c.kind === 'media' && !c.muted).map(c => [c.start, c.start + c.duration] as [number, number]).sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const x of iv) { const l = merged[merged.length - 1]; if (l && x[0] - l[1] < 0.8) l[1] = Math.max(l[1], x[1]); else merged.push([...x]); }
  return { track: vt, iv: merged };
}
function applyDuck(ctx: BaseAudioContext, g: GainNode, iv: [number, number][], db: number, from: number, when0: number) {
  const low = Math.pow(10, -Math.abs(db) / 20), att = 0.25, rel = 0.45;
  const at = (t: number) => when0 + (t - from);
  g.gain.setValueAtTime(1, Math.max(0, at(from)));
  for (const [a, b] of iv) {
    if (b + rel < from) continue;
    const s = Math.max(from, a - att);
    if (a - att >= from) { g.gain.setValueAtTime(1, at(a - att)); g.gain.linearRampToValueAtTime(low, at(a)); } else g.gain.setValueAtTime(low, at(from));
    g.gain.setValueAtTime(low, at(Math.max(s, b))); g.gain.linearRampToValueAtTime(1, at(Math.max(s, b) + rel));
  }
}

function schedule(ctx: BaseAudioContext, dest: AudioNode, c: Clip, from: number, when0: number, duck?: { iv: [number, number][]; db: number }) {
  const buf = getRuntime(c.assetId)!.audio!;
  const end = c.start + c.duration; if (end <= from) return null;
  const startAt = Math.max(c.start, from);
  const offset = c.in + (startAt - c.start) * c.speed;
  if (offset >= buf.duration) return null;
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = c.speed;
  const g = ctx.createGain();
  if (duck && duck.iv.length) { const dg = ctx.createGain(); applyDuck(ctx, dg, duck.iv, duck.db, from, when0); src.connect(g).connect(dg).connect(dest); }
  else src.connect(g).connect(dest);
  const when = when0 + (startAt - from);
  const v = c.volume;
  // fade zarfı
  const gp = g.gain; const local0 = startAt - c.start;
  const envAt = (l: number) => {
    let k = 1;
    if (c.fadeIn > 0) k = Math.min(k, l / c.fadeIn);
    if (c.fadeOut > 0) k = Math.min(k, (c.duration - l) / c.fadeOut);
    return Math.max(0, Math.min(1, k)) * v;
  };
  gp.setValueAtTime(envAt(local0), when);
  if (c.fadeIn > 0 && local0 < c.fadeIn) gp.linearRampToValueAtTime(v, when + (c.fadeIn - local0));
  if (c.fadeOut > 0) {
    const fs = c.duration - c.fadeOut;
    if (local0 < fs) gp.setValueAtTime(v, when + (fs - local0));
    gp.linearRampToValueAtTime(0, when + (c.duration - local0));
  }
  src.start(when, offset, (end - startAt) * c.speed);
  return src;
}

export class AudioPlayer {
  nodes: AudioBufferSourceNode[] = [];
  master: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  start(p: Project, from: number) {
    this.stop();
    const ctx = audioCtx(); if (ctx.state === 'suspended') ctx.resume();
    this.master = ctx.createGain(); this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 1024;
    this.master.connect(this.analyser).connect(ctx.destination);
    const t0 = ctx.currentTime + 0.05;
    const vi = voiceIntervals(p);
    for (const c of audibleClips(p)) { const n = schedule(ctx, this.master, c, from, t0, vi && c.trackId !== vi.track ? { iv: vi.iv, db: p.settings.duck!.db } : undefined); if (n) this.nodes.push(n); }
  }
  stop() { this.nodes.forEach(n => { try { n.stop(); } catch { /* */ } }); this.nodes = []; this.master?.disconnect(); this.master = null; }
  level() {
    if (!this.analyser) return 0; const d = new Float32Array(this.analyser.fftSize); this.analyser.getFloatTimeDomainData(d);
    let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); return m;
  }
}

export async function mixOffline(p: Project, duration: number, sr = 48000): Promise<AudioBuffer> {
  const len = Math.max(1, Math.ceil(duration * sr));
  const ctx = new OfflineAudioContext(2, len, sr);
  // hafif master limiter
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -3; comp.ratio.value = 12; comp.attack.value = 0.003; comp.release.value = 0.15;
  comp.connect(ctx.destination);
  const vi = voiceIntervals(p);
  for (const c of audibleClips(p)) schedule(ctx, comp, c, 0, 0, vi && c.trackId !== vi.track ? { iv: vi.iv, db: p.settings.duck!.db } : undefined);
  return ctx.startRendering();
}

export function bufferToWav(b: AudioBuffer): Blob {
  const ch = b.numberOfChannels, sr = b.sampleRate, n = b.length, bytes = 44 + n * ch * 2;
  const v = new DataView(new ArrayBuffer(bytes)); let o = 0;
  const w = (s: string) => { for (const c of s) v.setUint8(o++, c.charCodeAt(0)); };
  w('RIFF'); v.setUint32(o, bytes - 8, true); o += 4; w('WAVEfmt '); v.setUint32(o, 16, true); o += 4; v.setUint16(o, 1, true); o += 2; v.setUint16(o, ch, true); o += 2;
  v.setUint32(o, sr, true); o += 4; v.setUint32(o, sr * ch * 2, true); o += 4; v.setUint16(o, ch * 2, true); o += 2; v.setUint16(o, 16, true); o += 2; w('data'); v.setUint32(o, n * ch * 2, true); o += 4;
  const data = Array.from({ length: ch }, (_, i) => b.getChannelData(i));
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  return new Blob([v.buffer], { type: 'audio/wav' });
}
