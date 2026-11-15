// Yüksek seviye düzenleme işlemleri
import { S } from './store';
import type { Asset, Clip, Project, Scene } from './types';
import { defaultText, newClip, newTrack, projectDuration, uid } from './util';
import { assetFromBlob, ensureRuntime, getRuntime } from './engine/media';
import { genStoryFrame } from './engine/visualGen';
import { genMusic, genSfx, type Mood, type SfxType } from './engine/audioGen';
import { bufferToWav } from './engine/audio';
import { MOTION_PRESETS, TEXT_STYLES, makeEffect as makeEffectLocal } from './engine/presets';
import { upsertKf } from './engine/interp';
import { getBlob, putBlob } from './db';

const vTracks = (p: Project) => p.tracks.filter(t => t.kind === 'video');
const aTracks = (p: Project) => p.tracks.filter(t => t.kind === 'audio');

function freeAt(p: Project, trackId: string, start: number, dur: number) {
  return !p.clips.some(c => c.trackId === trackId && c.start < start + dur - 1e-3 && c.start + c.duration > start + 1e-3);
}
export function trackEnd(p: Project, trackId: string) { return p.clips.filter(c => c.trackId === trackId).reduce((m, c) => Math.max(m, c.start + c.duration), 0); }

export function addAsset(a: Asset) { S().set(d => { d.assets.push(a); }); }

export function placeAsset(a: Asset, trackId?: string, at?: number) {
  if (S().project.mode === 'image') { if (a.kind === 'audio') { S().notify('Görsel modda ses eklenmez'); return newClip('', 'media', 0, 1); } const c = newClip(newLayerTrack(a.name), 'media', 0, 1, { assetId: a.id, name: a.name, fit: 'contain' }); S().set(d => { d.clips.push(c); }); S().ui({ selected: [c.id] }); return c; }
  const p = S().project; const kind = a.kind === 'audio' ? 'audio' : 'video';
  const tracks = kind === 'audio' ? aTracks(p) : vTracks(p);
  const dur = a.kind === 'image' ? 4 : Math.max(0.1, a.duration);
  const start = at ?? S().time;
  let tid = trackId && p.tracks.find(t => t.id === trackId && t.kind === kind && !t.locked) && freeAt(p, trackId, start, dur) ? trackId : undefined;
  if (!tid) tid = (kind === 'audio' ? tracks : [...tracks].reverse()).find(t => !t.locked && freeAt(p, t.id, start, dur))?.id;
  if (!tid) { const t = newTrack(kind, `${kind === 'video' ? 'V' : 'A'}${tracks.length + 1}`); S().set(d => { if (kind === 'video') d.tracks.unshift(t); else d.tracks.push(t); }); tid = t.id; }
  const c = newClip(tid, 'media', start, dur, { assetId: a.id, name: a.name });
  S().set(d => { d.clips.push(c); }); S().ui({ selected: [c.id] });
  return c;
}

export function addTextClip(styleKey = 'hero', text = 'BAŞLIK', at?: number, dur = 3, trackId?: string) {
  const p = S().project;
  if (p.mode === 'image') { at = 0; dur = 1; trackId = newLayerTrack('Metin: ' + text.slice(0, 16)); } const st = TEXT_STYLES[styleKey]?.t ?? {};
  const start = at ?? S().time;
  const tid = trackId ?? vTracks(p).find(t => freeAt(p, t.id, start, dur))?.id ?? vTracks(p)[0].id;
  const c = newClip(tid, 'text', start, dur, { name: text.slice(0, 24), text: { ...defaultText(text), ...st } });
  if (styleKey === 'lower') c.base.y = p.settings.height * 0.32;
  if (styleKey === 'caption') c.base.y = p.settings.height * 0.28;
  c.tOut = { type: 'fade', d: 0.3 };
  S().set(d => { d.clips.push(c); }); S().ui({ selected: [c.id] }); return c;
}

export function addGenClip(kind: 'solid' | 'gradient' | 'shape' | 'adjust', extra: Partial<Clip> = {}) {
  const p = S().project; const img = p.mode === 'image'; const start = img ? 0 : S().time; const dur = img ? 1 : 4;
  const tid = img ? newLayerTrack(kind === 'shape' ? 'Şekil' : kind === 'adjust' ? 'Ayar katmanı' : 'Dolgu') : kind === 'adjust' ? newTrackTop('Ayar') : [...vTracks(p)].reverse().find(t => freeAt(p, t.id, start, dur))?.id ?? vTracks(p)[0].id;
  const c = newClip(tid, kind, start, dur, { name: kind === 'solid' ? 'Düz renk' : kind === 'gradient' ? 'Gradyan' : kind === 'adjust' ? 'Ayar katmanı' : 'Şekil', color: '#1b1446', color2: '#e8475f', angle: 135, ...extra });
  if (kind === 'shape') c.shape = { shape: 'rect', w: 600, h: 120, fill: '#ff4d6d', stroke: '#ffffff', strokeW: 0, radius: 16, ...(extra.shape ?? {}) };
  S().set(d => { d.clips.push(c); }); S().ui({ selected: [c.id] }); return c;
}

export function splitSelected() {
  const { selected, time } = S();
  S().set(d => {
    for (const id of selected) {
      const c = d.clips.find(x => x.id === id); if (!c || time <= c.start + 0.03 || time >= c.start + c.duration - 0.03) continue;
      const cut = time - c.start;
      const b: Clip = JSON.parse(JSON.stringify(c)); b.id = uid('c_'); b.start = time; b.duration = c.duration - cut; b.in = c.in + cut * c.speed; b.tIn = { type: 'none', d: 0.5 }; b.fadeIn = 0;
      // keyframe'leri kaydır
      for (const k of Object.keys(b.kf) as (keyof Clip['kf'])[]) b.kf[k] = b.kf[k]!.map(f => ({ ...f, t: f.t - cut })).filter(f => f.t >= -0.001 || true);
      b.masks?.forEach(m => m.kf?.forEach(k => { k.t -= cut; })); // maske yolu keyframe'leri de kayar
      c.duration = cut; c.tOut = { type: 'none', d: 0.5 }; c.fadeOut = 0;
      d.clips.push(b);
    }
  });
}
export function deleteSelected(ripple = false) {
  const { selected } = S(); if (!selected.length) return;
  S().set(d => {
    const rm = d.clips.filter(c => selected.includes(c.id));
    d.clips = d.clips.filter(c => !selected.includes(c.id));
    if (d.mode === 'image') { const tids = new Set(rm.map(c => c.trackId)); d.tracks = d.tracks.filter(t => !tids.has(t.id) || d.clips.some(c => c.trackId === t.id)); }
    if (ripple) for (const r of rm) d.clips.forEach(c => { if (c.trackId === r.trackId && c.start >= r.start + r.duration - 1e-3) c.start -= r.duration; });
  });
  S().ui({ selected: [] });
}
export function duplicateSelected() {
  const { selected } = S(); const ids: string[] = [];
  S().set(d => { for (const id of selected) { const c = d.clips.find(x => x.id === id); if (!c) continue; const n: Clip = JSON.parse(JSON.stringify(c)); n.id = uid('c_'); n.start = trackEnd(d as Project, c.trackId); ids.push(n.id); d.clips.push(n); } });
  S().ui({ selected: ids });
}
export function applyMotion(key: string) {
  const { selected } = S(); const pr = MOTION_PRESETS[key]; if (!pr) return;
  S().set(d => { for (const id of selected) { const c = d.clips.find(x => x.id === id); if (c) c.kf = { ...c.kf, ...pr.make(c.duration) }; } });
}
export function addTrack(kind: 'video' | 'audio') {
  S().set(d => { const n = d.tracks.filter(t => t.kind === kind).length + 1; const t = newTrack(kind, `${kind === 'video' ? 'V' : 'A'}${n}`); if (kind === 'video') d.tracks.unshift(t); else d.tracks.push(t); });
}

export async function makeSfxAsset(type: SfxType, dur: number, seed: number, pitch: number, label: string) {
  const buf = await genSfx(type, dur, seed, pitch); const a = await assetFromBlob(bufferToWav(buf), `SFX · ${label}`, 'audio', 'procedural', { type, dur, seed, pitch }); addAsset(a); return a;
}
export async function makeMusicAsset(mood: Mood, bpm: number, bars: number, root: number, seed: number, layers: any, label: string) {
  const buf = await genMusic(mood, bpm, bars, root, seed, layers); const a = await assetFromBlob(bufferToWav(buf), `Müzik · ${label} ${bpm}bpm`, 'audio', 'procedural', { mood, bpm, bars }); addAsset(a); return a;
}

/** Storyboard'dan kaba kurgu (rough cut): kareler + metin + VO yer tutucu + SFX + müzik */
export async function storyboardToTimeline(opts: { music: boolean; sfx: boolean; texts: boolean; clear: boolean }) {
  const s = S(); const p = s.project; const scenes = p.scenes; if (!scenes.length) return;
  const W = p.settings.width, H = p.settings.height; const pal = p.idea?.style.palette ?? [];
  const tw = 960, th = Math.round(960 * H / W);
  const V = vTracks(p); const main = V[V.length - 1].id, txt = V[0].id; const A = aTracks(p);
  const newAssets: Asset[] = []; const clips: Clip[] = []; const shotAssign: Record<string, string> = {};
  let t = 0; let n = 0;
  const sfxCache: Record<string, Asset> = {};
  for (const [si, sc] of scenes.entries()) {
    for (const [ki, sh] of sc.shots.entries()) {
      n++;
      let assetId = sh.assetId;
      if (!assetId || !p.assets.find(a => a.id === assetId)) {
        const blob = await genStoryFrame(sh, `${si + 1}.${ki + 1}`, tw, th, pal);
        const a = await assetFromBlob(blob, `SB ${si + 1}.${ki + 1}`, 'image', 'procedural', { shot: sh.id }); newAssets.push(a); assetId = a.id; shotAssign[sh.id] = a.id;
      }
      const c = newClip(main, 'media', t, Math.max(0.5, sh.duration), { assetId, name: `${sc.title} · ${ki + 1}` });
      const keys = Object.keys(MOTION_PRESETS); const mv = sh.move.toLowerCase();
      const mk = mv.includes('dolly in') || mv.includes('push') ? 'kenIn' : mv.includes('out') ? 'kenOut' : mv.includes('pan') || mv.includes('truck') || mv.includes('takip') ? (n % 2 ? 'panL' : 'panR') : mv.includes('crane') || mv.includes('vinç') || mv.includes('tilt') ? 'tiltUp' : keys[n % 2];
      c.kf = MOTION_PRESETS[mk].make(c.duration);
      if (ki === 0 && si > 0) c.tIn = { type: 'fade', d: 0.35 };
      clips.push(c);
      if (opts.texts && sh.onscreen) { const tc = newClip(txt, 'text', t + 0.15, Math.max(0.6, sh.duration - 0.2), { name: sh.onscreen.slice(0, 20), text: { ...defaultText(sh.onscreen), ...(TEXT_STYLES.hero.t), font: p.idea?.style.font ?? 'Bebas Neue' } }); tc.tOut = { type: 'fade', d: 0.25 }; clips.push(tc); }
      if (opts.texts && sh.vo) { const vc = newClip(V[Math.min(1, V.length - 1)].id, 'text', t, Math.max(0.6, sh.duration), { name: 'VO: ' + sh.vo.slice(0, 18), text: { ...defaultText(sh.vo), ...TEXT_STYLES.caption.t, size: 54 } }); vc.base.y = H * 0.33; vc.tOut = { type: 'fade', d: 0.2 }; clips.push(vc); }
      if (opts.sfx && sh.sfx && A[2]) {
        if (!sfxCache[sh.sfx]) { const buf = await genSfx(sh.sfx as SfxType, sh.sfx === 'drone' ? 4 : 1.6, n, 1); const a = await assetFromBlob(bufferToWav(buf), `SFX · ${sh.sfx}`, 'audio', 'procedural'); newAssets.push(a); sfxCache[sh.sfx] = a; }
        const a = sfxCache[sh.sfx]; clips.push(newClip(A[2].id, 'media', Math.max(0, t - (sh.sfx === 'whoosh' || sh.sfx === 'riser' ? Math.min(0.6, a.duration / 2) : 0)), a.duration, { assetId: a.id, name: a.name, volume: 0.7 }));
      }
      t += Math.max(0.5, sh.duration);
    }
  }
  if (opts.music && A[1] && p.idea) {
    const bpm = p.idea.style.bpm; const bars = Math.max(2, Math.ceil(t / (240 / bpm)));
    const buf = await genMusic(p.idea.style.music as Mood, bpm, bars, 57, 7); const a = await assetFromBlob(bufferToWav(buf), `Müzik · ${p.idea.style.music}`, 'audio', 'procedural'); newAssets.push(a);
    clips.push(newClip(A[1].id, 'media', 0, t, { assetId: a.id, name: a.name, volume: 0.55, fadeIn: 0.5, fadeOut: 1.5 }));
  }
  s.set(d => {
    if (opts.clear) d.clips = [];
    d.assets.push(...newAssets); d.clips.push(...clips);
    d.scenes.forEach(sc => sc.shots.forEach(sh => { if (shotAssign[sh.id]) sh.assetId = shotAssign[sh.id]; }));
  });
  s.ui({ panel: 'editor', time: 0 });
  s.notify(`Kaba kurgu hazır: ${n} plan, ${t.toFixed(1)} sn`);
}

export function setAspect(w: number, h: number) { S().set(d => { d.settings.width = w; d.settings.height = h; }); }

// ---- Proje paketi (JSON + gömülü medya) ----
export async function exportProjectFile(): Promise<Blob> {
  const p = S().project; const media: Record<string, string> = {};
  for (const a of p.assets) { const b = await getBlob(a.id); if (b) media[a.id] = await blobToDataUrl(b); }
  return new Blob([JSON.stringify({ kadraj: 1, project: p, media })], { type: 'application/json' });
}
export async function importProjectFile(f: File) {
  const d = JSON.parse(await f.text()); if (!d.kadraj) throw new Error('Geçersiz dosya');
  for (const [id, url] of Object.entries(d.media as Record<string, string>)) await putBlob(id, await (await fetch(url)).blob());
  const p: Project = d.project; await Promise.all(p.assets.map(ensureRuntime)); S().replace(p);
}
const blobToDataUrl = (b: Blob) => new Promise<string>(r => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(b); });

export const totalDuration = () => projectDuration(S().project);
export function setScenes(sc: Scene[]) { S().set(d => { d.scenes = sc; }); }

// ---- Ritim senkronu ----
export function markBeats(beats: number[], offset: number, every = 1) {
  S().set(d => {
    d.markers = d.markers.filter(m => !m.label.startsWith('♪'));
    beats.forEach((b, i) => { if (i % every === 0) d.markers.push({ t: +(b + offset).toFixed(4), label: `♪${i + 1}` }); });
  });
}
export function clearBeatMarkers() { S().set(d => { d.markers = d.markers.filter(m => !m.label.startsWith('♪')); }); }

/** Seçili görsel klipleri (veya seçim yoksa ana izi) sırayla beat ızgarasına oturtur: her klip N vuruş sürer */
export function cutToBeats(beatTimes: number[], every: number) {
  const s = S(); const p = s.project;
  const audioIds = new Set(p.tracks.filter(t => t.kind === 'audio').map(t => t.id));
  let targets = p.clips.filter(c => s.selected.includes(c.id) && !audioIds.has(c.trackId));
  if (!targets.length) { const main = [...p.tracks].reverse().find(t => t.kind === 'video' && p.clips.some(c => c.trackId === t.id)); targets = p.clips.filter(c => c.trackId === main?.id); }
  targets = [...targets].sort((a, b) => a.start - b.start);
  if (!targets.length || beatTimes.length < 2) return 0;
  let bi = beatTimes.findIndex(b => b >= targets[0].start - 0.05); if (bi < 0) bi = 0;
  const ids = new Set(targets.map(t => t.id)); let n = 0;
  s.set(d => {
    for (const c of d.clips.filter(x => ids.has(x.id)).sort((a, b) => a.start - b.start)) {
      const a = beatTimes[bi], b = beatTimes[bi + every] ?? a + (beatTimes[1] - beatTimes[0]) * every;
      const rt = getRuntimeDur(c); const maxDur = rt ? (rt - c.in) / c.speed : Infinity;
      const oldDur = c.duration; c.start = a; c.duration = Math.min(b - a, maxDur);
      // keyframe'leri yeni süreye oranla
      const k = c.duration / oldDur; (Object.keys(c.kf) as (keyof Clip['kf'])[]).forEach(p2 => { c.kf[p2] = c.kf[p2]!.map(f => ({ ...f, t: f.t * k })); });
      bi += every; n++;
    }
  });
  return n;
}
function getRuntimeDur(c: Clip) { const r = getRuntime(c.assetId); return r?.video?.duration ?? (r?.img ? undefined : r?.audio?.duration); }

// ---- Pano ----
let clipboard: Clip[] = [];
export function copySelected() { const s = S(); clipboard = s.project.clips.filter(c => s.selected.includes(c.id)).map(c => JSON.parse(JSON.stringify(c))); s.notify(`${clipboard.length} klip kopyalandı`); }
export function paste() {
  if (!clipboard.length) return; const s = S(); const t0 = Math.min(...clipboard.map(c => c.start)); const ids: string[] = [];
  s.set(d => { for (const c of clipboard) { if (!d.tracks.some(t => t.id === c.trackId)) continue; const n: Clip = JSON.parse(JSON.stringify(c)); n.id = uid('c_'); n.start = s.time + (c.start - t0); ids.push(n.id); d.clips.push(n); } });
  s.ui({ selected: ids });
}

/** Dönüşüm değerini ayarla: keyframe varsa playhead'de keyframe günceller, yoksa temel değeri */
export function setClipProp(id: string, prop: 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'blur', v: number) {
  const t = S().time;
  S().set(d => { const c = d.clips.find(x => x.id === id); if (!c) return; const lt = Math.min(Math.max(t - c.start, 0), c.duration); if (c.kf[prop]?.length) c.kf[prop] = upsertKf(c.kf[prop], lt, v); else c.base[prop] = v; }, true);
}

// ---- LUT ----
import { builtinLut, parseCube } from './engine/color';
export async function importLutFile(f: File) {
  const l = parseCube(await f.text(), f.name.replace(/\.cube$/i, ''), uid('lut_'));
  S().set(d => { (d.luts ??= []).push(l); }); S().notify(`LUT yüklendi: ${l.name}`); return l.id;
}
export function ensureBuiltinLuts() {
  const p = S().project; if ((p.luts ?? []).some(l => l.id.startsWith('lut_builtin_'))) return;
  const kinds = [['filmic', 'Filmik S-eğri'], ['bleach', 'Bleach bypass'], ['teal', 'Teal & orange'], ['matrix', 'Matrix yeşili']] as const;
  S().set(d => { (d.luts ??= []).push(...kinds.map(([k, n]) => ({ id: 'lut_builtin_' + k, name: n, size: 17, data: builtinLut(k) }))); });
}

// ---- Sessizlikleri kes (jump-cut) ----
export function detectSpeech(buf: AudioBuffer, from: number, to: number, thrDb = -38, minSilence = 0.35, pad = 0.08): [number, number][] {
  const sr = buf.sampleRate, win = Math.floor(sr * 0.02), ch = buf.getChannelData(0);
  const thr = Math.pow(10, thrDb / 20); const loud: boolean[] = [];
  for (let s = Math.floor(from * sr); s < Math.min(ch.length, to * sr); s += win) { let e = 0; for (let i = s; i < Math.min(s + win, ch.length); i++) e += ch[i] * ch[i]; loud.push(Math.sqrt(e / win) > thr); }
  const ivs: [number, number][] = []; let st = -1;
  loud.forEach((l, i) => { const t = from + i * 0.02; if (l && st < 0) st = t; if (!l && st >= 0) { ivs.push([st, t]); st = -1; } });
  if (st >= 0) ivs.push([st, to]);
  // kısa sessizlikleri birleştir, pay ekle
  const merged: [number, number][] = [];
  for (const [a, b] of ivs) { const l = merged[merged.length - 1]; if (l && a - l[1] < minSilence) l[1] = b; else merged.push([a, b]); }
  return merged.map(([a, b]) => [Math.max(from, a - pad), Math.min(to, b + pad)] as [number, number]).filter(([a, b]) => b - a > 0.12);
}

export function cutSilences(thrDb = -38, minSilence = 0.35) {
  const s = S(); const c = s.project.clips.find(k => s.selected.includes(k.id) && k.kind === 'media');
  const buf = c && getRuntime(c.assetId)?.audio; if (!c || !buf) { s.notify('Sesli bir klip seç'); return; }
  const keep = detectSpeech(buf, c.in, Math.min(buf.duration, c.in + c.duration * c.speed), thrDb, minSilence);
  if (!keep.length) { s.notify('Konuşma bulunamadı — eşiği düşür'); return; }
  const newDur = keep.reduce((n, [a, b]) => n + (b - a) / c.speed, 0); const removed = c.duration - newDur;
  const ids: string[] = [];
  s.set(d => {
    const i = d.clips.findIndex(k => k.id === c.id); const orig = d.clips[i]; d.clips.splice(i, 1);
    const end = orig.start + orig.duration;
    d.clips.forEach(k => { if (k.trackId === orig.trackId && k.start >= end - 1e-3) k.start -= removed; });
    let t = orig.start;
    for (const [a, b] of keep) { const n: Clip = JSON.parse(JSON.stringify(orig)); n.id = uid('c_'); n.start = t; n.in = a; n.duration = (b - a) / orig.speed; n.kf = {}; n.tIn = { type: 'none', d: 0.3 }; n.tOut = { type: 'none', d: 0.3 }; n.fadeIn = 0.01; n.fadeOut = 0.01; t += n.duration; ids.push(n.id); d.clips.push(n); }
  });
  s.ui({ selected: ids }); s.notify(`${keep.length} parça kaldı · ${removed.toFixed(1)} sn sessizlik kesildi`);
}

// ---- Kare dondur ----
export async function freezeFrame(holdSec = 2) {
  const s = S(); const t = s.time;
  const c = s.project.clips.find(k => s.selected.includes(k.id) && k.kind === 'media' && t > k.start && t < k.start + k.duration);
  const v = c && getRuntime(c.assetId)?.video; if (!c || !v) { s.notify('Playhead üzerindeki bir video klibi seç'); return; }
  const { seekVideo } = await import('./engine/media');
  await seekVideo(v, c.in + (t - c.start) * c.speed);
  const cv = document.createElement('canvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; cv.getContext('2d')!.drawImage(v, 0, 0);
  const blob = await new Promise<Blob>(r => cv.toBlob(b => r(b!), 'image/png'));
  const a = await assetFromBlob(blob, `Dondur ${t.toFixed(2)}s`, 'image', 'procedural');
  splitSelected();
  s.set(d => {
    d.assets.push(a);
    d.clips.forEach(k => { if (k.trackId === c.trackId && k.start >= t - 1e-3) k.start += holdSec; });
    const fr = newClip(c.trackId, 'media', t, holdSec, { assetId: a.id, name: 'Dondurulmuş kare', fit: c.fit, base: { ...c.base }, effects: JSON.parse(JSON.stringify(c.effects)) });
    fr.kf = { scale: [{ t: 0, v: c.base.scale, e: 'linear' }, { t: holdSec, v: c.base.scale * 1.06, e: 'linear' }] };
    d.clips.push(fr);
  });
  s.notify(`Kare donduruldu (${holdSec} sn)`);
}


// ======== GÖRSEL STÜDYO (katmanlar) ========
/** Seçili katmanın hemen üstüne (yoksa en üste) yeni katman izi */
export function newLayerTrack(name: string): string {
  const t = newTrack('video', name.slice(0, 28)); const s = S();
  const selTrack = s.project.clips.find(c => c.id === s.selected[0])?.trackId;
  s.set(d => { const i = selTrack ? d.tracks.findIndex(x => x.id === selTrack) : 0; d.tracks.splice(Math.max(0, i), 0, t); });
  return t.id;
}
export async function addPaintLayer() {
  const p = S().project; const c = document.createElement('canvas'); c.width = p.settings.width; c.height = p.settings.height;
  const { assetFromCanvas, paintCanvas } = await import('./engine/media');
  const a = await assetFromCanvas(c, 'Boya katmanı', 'procedural', { paint: true }); paintCanvas(a.id);
  const tid = newLayerTrack('Boya'); const k = newClip(tid, 'media', 0, p.mode === 'image' ? 1 : Math.max(1, projectDuration(p) || 5), { assetId: a.id, name: 'Boya katmanı', fit: 'stretch', start: p.mode === 'image' ? 0 : S().time });
  S().set(d => { d.assets.push(a); d.clips.push(k); }); S().ui({ selected: [k.id] }); return k;
}
export function moveLayer(trackId: string, dir: -1 | 1) {
  S().set(d => { const i = d.tracks.findIndex(t => t.id === trackId); const j = i + dir; if (j < 0 || j >= d.tracks.length || d.tracks[j].kind !== d.tracks[i].kind) return; [d.tracks[i], d.tracks[j]] = [d.tracks[j], d.tracks[i]]; });
}
export function deleteLayer(trackId: string) {
  S().set(d => { d.tracks = d.tracks.filter(t => t.id !== trackId); d.clips = d.clips.filter(c => c.trackId !== trackId); }); S().ui({ selected: [] });
}
export function duplicateLayer(trackId: string) {
  const s = S(); const c = s.project.clips.find(k => k.trackId === trackId); if (!c) return;
  const t = newTrack('video', (s.project.tracks.find(x => x.id === trackId)?.name ?? 'Katman') + ' kopya'); const n: Clip = JSON.parse(JSON.stringify(c)); n.id = uid('c_'); n.trackId = t.id;
  s.set(d => { const i = d.tracks.findIndex(x => x.id === trackId); d.tracks.splice(i, 0, t); d.clips.push(n); }); s.ui({ selected: [n.id] });
}
/** Seçili görünür katmanları tek görsele birleştirir (flatten) */
export async function flattenImage() {
  const s = S(); const p = s.project; const { exportFrame } = await import('./engine/export');
  const blob = await exportFrame(p, 0); const a = await assetFromBlob(blob, 'Birleştirilmiş', 'image', 'procedural');
  const t = newTrack('video', 'Birleştirilmiş'); const c = newClip(t.id, 'media', 0, 1, { assetId: a.id, name: 'Birleştirilmiş', fit: 'stretch' });
  s.set(d => { d.assets.push(a); d.tracks = d.tracks.filter(x => x.kind !== 'video'); d.tracks.unshift(t); d.clips = d.clips.filter(k => d.tracks.some(x => x.id === k.trackId)); d.clips.push(c); });
  s.ui({ selected: [c.id] }); s.notify('Katmanlar birleştirildi');
}

// ---- AI arka plan silme (tarayıcıda, transformers.js) ----
let bgWorker: Worker | null = null;
export const BG_MODELS = [{ id: 'Xenova/modnet', label: 'MODNet — portre/insan (hızlı, Apache-2.0)' }, { id: 'briaai/RMBG-1.4', label: 'RMBG-1.4 — genel nesne (yalnızca ticari olmayan)' }];
export async function removeBackground(model = BG_MODELS[0].id, onMsg: (m: string) => void = () => {}) {
  const s = S(); const c = s.project.clips.find(k => s.selected.includes(k.id) && k.kind === 'media');
  const a = c && s.project.assets.find(x => x.id === c.assetId);
  if (!c || !a || a.kind !== 'image') { s.notify('Bir görsel katmanı seç'); return; }
  const { getBlob } = await import('./db'); const blob = await getBlob(a.id); if (!blob) return;
  bgWorker ??= new Worker(new URL('./ai/bg.worker.ts', import.meta.url), { type: 'module' });
  const out = await new Promise<{ data: Uint8ClampedArray; width: number; height: number }>((res, rej) => {
    bgWorker!.onmessage = e => { const d = e.data; if (d.type === 'progress') onMsg(`Model indiriliyor: ${d.file ?? ''} ${Math.round(d.progress ?? 0)}%`); else if (d.type === 'status') onMsg(d.msg); else if (d.type === 'error') rej(new Error(d.msg)); else res(d); };
    bgWorker!.postMessage({ blob, model });
  });
  const cv = document.createElement('canvas'); cv.width = out.width; cv.height = out.height; cv.getContext('2d')!.putImageData(new ImageData(out.data, out.width, out.height), 0, 0);
  const { assetFromCanvas } = await import('./engine/media');
  const na = await assetFromCanvas(cv, a.name + ' (dekupe)', 'ai', { from: a.id });
  s.set(d => { d.assets.push(na); const k = d.clips.find(x => x.id === c.id)!; k.assetId = na.id; k.name = na.name; });
  onMsg(''); s.notify('Arka plan silindi ✂');
}

function newTrackTop(name: string) { const t = newTrack('video', name); S().set(d => { d.tracks.unshift(t); }); return t.id; }
/** Ayar katmanı: altındaki her şeye efekt (varsayılan: sinematik grade + maske ile bölgesel kullanılabilir) */
export function addAdjustmentLayer() {
  const p = S().project; const dur = p.mode === 'image' ? 1 : Math.max(2, projectDuration(p) - S().time || 5);
  const c = addGenClip('adjust', { duration: dur } as Partial<Clip>);
  S().set(d => { const k = d.clips.find(x => x.id === c.id)!; k.duration = dur; k.effects = [makeEffectLocal('grade', { contrast: 1.12, saturation: 1.1, liftC: '#2a6cf0', liftA: 0.25, gainC: '#ffa040', gainA: 0.2 })]; });
  S().notify('Ayar katmanı eklendi — efektleri altındaki tüm katmanlara uygulanır'); return c;
}

// ======== AFTER EFFECTS: null nesne & parenting ========
export function addNullObject() {
  const p = S().project; const img = p.mode === 'image';
  const t = newTrack('video', 'Null'); const dur = img ? 1 : Math.max(2, projectDuration(p) || 5);
  const c = newClip(t.id, 'null', img ? 0 : 0, dur, { name: 'Null ' + (p.clips.filter(k => k.kind === 'null').length + 1) });
  S().set(d => { d.tracks.unshift(t); d.clips.push(c); }); S().ui({ selected: [c.id] });
  S().notify('Null nesne eklendi — diğer katmanları Inspector → Ebeveyn ile ona bağla'); return c;
}
/** child'ı parent'a bağlarken görsel konumu koru (AE'deki gibi): dünya dönüşümünü ebeveyn uzayına çevir */
export function setParent(childId: string, parentId: string | undefined) {
  const s = S(); const p = s.project; const c = p.clips.find(k => k.id === childId); if (!c) return;
  if (parentId) { let cur: string | undefined = parentId; const seen = new Set<string>(); while (cur) { if (cur === childId) { s.notify('Döngüsel ebeveyn bağlantısı yapılamaz'); return; } if (seen.has(cur)) break; seen.add(cur); cur = p.clips.find(k => k.id === cur)?.parent; } }
  import('./engine/render').then(({ worldMatrix }) => {
    const t = Math.min(Math.max(s.time, c.start), c.start + c.duration);
    const w = worldMatrix(p, c, t);
    const tmp = { ...c, parent: parentId };
    const pm = parentId ? worldMatrix(p, p.clips.find(k => k.id === parentId)!, t) : new DOMMatrix();
    const local = pm.inverse().multiply(w);
    const sc = Math.hypot(local.a, local.b), rot = (Math.atan2(local.b, local.a) * 180) / Math.PI;
    S().set(d => { const k = d.clips.find(x => x.id === childId)!; k.parent = parentId; if (!Object.keys(k.kf).length && !Object.keys(k.expr ?? {}).length) { k.base.x = Math.round(local.e); k.base.y = Math.round(local.f); k.base.scale = +sc.toFixed(4); k.base.rotation = +rot.toFixed(2); } });
    void tmp; S().notify(parentId ? 'Ebeveyne bağlandı' : 'Ebeveyn bağlantısı kaldırıldı');
  });
}

// ======== Parçacıklar ========
export async function addParticles(key: string) {
  const { PARTICLE_PRESETS } = await import('./engine/particles');
  const pr = PARTICLE_PRESETS[key] ?? PARTICLE_PRESETS.sparks; const p = S().project; const img = p.mode === 'image';
  const tid = img ? newLayerTrack('Parçacık') : newTrackTopP('Parçacık ' + pr.label.replace(/^\S+\s/, ''));
  const dur = img ? 1 : Math.max(3, projectDuration(p) - S().time || 6);
  const c = newClip(tid, 'particles', img ? 0 : S().time, dur, { name: pr.label, particles: { ...pr.p, seed: Math.floor(Math.random() * 999) } });
  if (key === 'snow') c.base.y = -p.settings.height / 2 - 20; if (key === 'fire' || key === 'sparks' || key === 'confetti') c.base.y = p.settings.height * 0.3;
  S().set(d => { d.clips.push(c); }); S().ui({ selected: [c.id] }); S().notify(`Parçacık: ${pr.label}`); return c;
}
function newTrackTopP(name: string) { const t = newTrack('video', name); S().set(d => { d.tracks.unshift(t); }); return t.id; }
