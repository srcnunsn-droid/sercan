// Tek tıkla şablonlar: playhead konumuna yerleşen hazır sahne/overlay paketleri
import { S } from './store';
import type { Asset, Clip, Project } from './types';
import { defaultText, newClip } from './util';
import { assetFromBlob } from './engine/media';
import { genVisual, type VisualType } from './engine/visualGen';
import { genMusic, genSfx, type Mood, type SfxType } from './engine/audioGen';
import { bufferToWav } from './engine/audio';
import { GRADE_PRESETS, TEXT_STYLES, makeEffect } from './engine/presets';

interface Ctx { p: Project; t0: number; V: string[]; A: string[]; assets: Asset[]; clips: Clip[]; pal: string[] }
const kf = (pairs: [number, number][], e: 'easeOut' | 'linear' | 'backOut' | 'easeInOut' = 'easeOut') => pairs.map(([t, v]) => ({ t, v, e }));

async function bg(c: Ctx, type: VisualType, seed = Math.floor(Math.random() * 1e6)) {
  const a = await assetFromBlob(await genVisual(type, c.p.settings.width, c.p.settings.height, c.pal, seed), type, 'image', 'procedural'); c.assets.push(a); return a;
}
async function sfx(c: Ctx, type: SfxType, dur: number) { const a = await assetFromBlob(bufferToWav(await genSfx(type, dur, Math.floor(Math.random() * 999))), `SFX · ${type}`, 'audio', 'procedural'); c.assets.push(a); return a; }
async function music(c: Ctx, mood: Mood, bpm: number, bars: number) { const a = await assetFromBlob(bufferToWav(await genMusic(mood, bpm, bars, 57, Math.floor(Math.random() * 999))), `Müzik · ${mood}`, 'audio', 'procedural'); c.assets.push(a); return a; }
const media = (c: Ctx, track: string, a: Asset, s: number, d: number, extra: Partial<Clip> = {}) => { const k = newClip(track, 'media', c.t0 + s, d, { assetId: a.id, name: a.name, ...extra }); c.clips.push(k); return k; };
const text = (c: Ctx, track: string, s: number, d: number, str: string, style: string, extra: Partial<Clip> = {}, tp: Partial<NonNullable<Clip['text']>> = {}) => { const k = newClip(track, 'text', c.t0 + s, d, { name: str.slice(0, 20), text: { ...defaultText(str), ...TEXT_STYLES[style].t, ...tp }, ...extra }); c.clips.push(k); return k; };

export const TEMPLATES: { id: string; label: string; desc: string; aspect?: [number, number]; build: (c: Ctx) => Promise<void> }[] = [
  { id: 'ytintro', label: '🎬 YouTube intro (5 sn)', desc: 'Bokeh arka plan, harf aralığı daralan başlık, whoosh + darbe', build: async c => {
    const b = await bg(c, 'bokeh'); const k = media(c, c.V.at(-1)!, b, 0, 5, { kf: { scale: kf([[0, 1.2], [5, 1]], 'linear') }, tOut: { type: 'fade', d: 0.6 } }); k.effects = [makeEffect('vignette'), makeEffect('grain', { amount: 0.08 })];
    text(c, c.V[0], 0.5, 4, 'KANAL ADI', 'hero', { tOut: { type: 'blur', d: 0.5 } });
    text(c, c.V[1], 1.4, 3.1, 'her hafta yeni bir hikâye', 'elegant', { base: { x: 0, y: 140, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'fade', d: 0.4 } }, { size: 52 });
    media(c, c.A[2] ?? c.A[0], await sfx(c, 'whoosh', 1.2), 0, 1.2); media(c, c.A[2] ?? c.A[0], await sfx(c, 'impact', 2), 0.45, 2, { volume: 0.8 });
  } },
  { id: 'reels', label: '📱 Reels/Shorts kancası (9:16)', desc: 'Dikey format, pop kanca yazısı, altyazı alanı, riser → darbe, enerjik müzik', aspect: [1080, 1920], build: async c => {
    const g = newClip(c.V.at(-1)!, 'gradient', c.t0, 6, { name: 'Gradyan', color: c.pal[0], color2: c.pal[2], angle: 160, kf: { scale: kf([[0, 1.1], [6, 1]], 'linear') } }); c.clips.push(g);
    text(c, c.V[0], 0.1, 2.4, 'BUNU KİMSE SÖYLEMİYOR', 'meme', { tOut: { type: 'zoomIn', d: 0.25 } }, { size: 120, maxW: 0.85 });
    text(c, c.V[1], 2.6, 3.4, 'Ama aslında her şey çok basit…', 'caption', { base: { x: 0, y: 560, scale: 1, rotation: 0, opacity: 1, blur: 0 } }, { size: 64 });
    media(c, c.A[2] ?? c.A[0], await sfx(c, 'riser', 2.4), 0, 2.4, { volume: 0.6 }); media(c, c.A[2] ?? c.A[0], await sfx(c, 'impact', 1.6), 2.5, 1.6);
    media(c, c.A[1] ?? c.A[0], await music(c, 'enerjik', 124, 4), 0, 6, { volume: 0.45, fadeOut: 0.8 });
  } },
  { id: 'lower', label: '🏷 Alt bant (lower third)', desc: 'Kayarak giren renkli bant + isim/unvan, mevcut videonun üstüne', build: async c => {
    const H = c.p.settings.height, W = c.p.settings.width, y = H * 0.32, x = -W * 0.22;
    const bar = newClip(c.V[1], 'shape', c.t0, 5, { name: 'bant', shape: { shape: 'rect', w: 640, h: 120, fill: c.pal[2] ?? '#ff4d6d', stroke: '#fff', strokeW: 0, radius: 10 }, base: { x, y, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tIn: { type: 'slideRight', d: 0.45 }, tOut: { type: 'slideRight', d: 0.4 } }); c.clips.push(bar);
    text(c, c.V[0], 0.25, 4.5, 'İsim Soyisim', 'lower', { base: { x, y: y - 18, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'fade', d: 0.3 } }, { bg: '', size: 46, maxW: 0.3 });
    text(c, c.V[0], 0.45, 4.3, 'Unvan · Şirket', 'lower', { base: { x, y: y + 30, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'fade', d: 0.3 } }, { bg: '', size: 28, weight: 500, color: '#ffffffcc', maxW: 0.3 });
  } },
  { id: 'count', label: '⏱ Geri sayım 3-2-1', desc: 'Pop animasyonlu sayılar, her saniyede bip, sonda flaş', build: async c => {
    const beep = await sfx(c, 'notify', 0.6);
    ['3', '2', '1'].forEach((n, i) => { text(c, c.V[0], i, 1, n, 'hero', { tOut: { type: 'zoomIn', d: 0.2 } }, { size: 380, anim: 'pop', animD: 0.35 }); media(c, c.A[2] ?? c.A[0], beep, i, 0.6, { volume: 0.7 }); });
    const s = newClip(c.V[1], 'solid', c.t0 + 3, 0.5, { name: 'Flaş', color: '#ffffff', tOut: { type: 'fade', d: 0.45 } }); c.clips.push(s);
  } },
  { id: 'doc', label: '📜 Belgesel açılışı', desc: 'Kağıt doku + sepya grade, daktilo başlık, gerilim dronu', build: async c => {
    const b = await bg(c, 'paper'); const k = media(c, c.V.at(-1)!, b, 0, 7, { kf: { scale: kf([[0, 1], [7, 1.12]], 'linear') }, tIn: { type: 'fade', d: 1 }, tOut: { type: 'fade', d: 1 } }); k.effects = GRADE_PRESETS.vintage.fx();
    text(c, c.V[0], 1, 5.5, 'İSTANBUL, 1453', 'terminal', { tOut: { type: 'fade', d: 0.8 } }, { color: '#2a1d10', shadow: 0, size: 72, font: 'Playfair Display', weight: 800, animD: 1.6 });
    text(c, c.V[1], 3, 3.5, 'Bir şehrin yeniden doğuşu', 'elegant', { base: { x: 0, y: 110, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'fade', d: 0.8 } }, { color: '#4a3520', shadow: 0, size: 44 });
    media(c, c.A[1] ?? c.A[0], await sfx(c, 'drone', 7), 0, 7, { volume: 0.7, fadeOut: 1.5 });
    media(c, c.A[2] ?? c.A[0], await sfx(c, 'typing', 1.8), 1, 1.8, { volume: 0.5 });
  } },
  { id: 'sub', label: '🔔 Abone ol / CTA', desc: 'Köşede pop giren buton + parıltı sesi', build: async c => {
    const W = c.p.settings.width, H = c.p.settings.height; const x = W * 0.32, y = H * 0.36;
    const btn = newClip(c.V[1], 'shape', c.t0, 4, { name: 'buton', shape: { shape: 'rect', w: 360, h: 96, fill: '#ff1f3d', stroke: '#fff', strokeW: 0, radius: 48 }, base: { x, y, scale: 1, rotation: 0, opacity: 1, blur: 0 }, kf: { scale: kf([[0, 0], [0.45, 1]], 'backOut') }, tOut: { type: 'zoomIn', d: 0.3 } }); c.clips.push(btn);
    text(c, c.V[0], 0.1, 3.9, 'ABONE OL', 'hero', { base: { x, y, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'zoomIn', d: 0.3 } }, { size: 64, anim: 'pop', animD: 0.4, shadow: 0 });
    media(c, c.A[2] ?? c.A[0], await sfx(c, 'pop', 0.3), 0, 0.3); media(c, c.A[2] ?? c.A[0], await sfx(c, 'sparkle', 1.2), 0.3, 1.2, { volume: 0.5 });
  } },
  { id: 'launch', label: '🚀 Ürün lansmanı (8 sn)', desc: 'Işık huzmesi → yıldız alanı, BRAAM, sinematik grade ve başlık', build: async c => {
    const r = await bg(c, 'rays'); const k1 = media(c, c.V.at(-1)!, r, 0, 4, { kf: { scale: kf([[0, 1], [4, 1.25]], 'linear') } }); k1.effects = GRADE_PRESETS.tealOrange.fx();
    const s = await bg(c, 'stars'); const k2 = media(c, c.V.at(-1)!, s, 4, 4, { tIn: { type: 'flash', d: 0.4 }, kf: { scale: kf([[0, 1.15], [4, 1]], 'linear') }, tOut: { type: 'fade', d: 0.8 } }); k2.effects = [makeEffect('letterbox'), makeEffect('grain', { amount: 0.08 })];
    text(c, c.V[0], 0.6, 3.2, 'YAKINDA', 'elegant', { tOut: { type: 'blur', d: 0.4 } }, { size: 90 });
    text(c, c.V[0], 4.2, 3.6, 'ÜRÜN ADI', 'hero', { tOut: { type: 'fade', d: 0.6 } }, { size: 220 });
    text(c, c.V[1], 5.2, 2.6, '14.11 · Şimdi ön siparişte', 'lower', { base: { x: 0, y: 190, scale: 1, rotation: 0, opacity: 1, blur: 0 }, tOut: { type: 'fade', d: 0.5 } }, { size: 36 });
    media(c, c.A[2] ?? c.A[0], await sfx(c, 'riser', 4), 0, 4, { volume: 0.55 }); media(c, c.A[2] ?? c.A[0], await sfx(c, 'braam', 3.5), 4, 3.5);
    media(c, c.A[1] ?? c.A[0], await music(c, 'epik', 90, 3), 0, 8, { volume: 0.4, fadeOut: 1 });
  } },
];

export async function applyTemplate(id: string) {
  const T = TEMPLATES.find(t => t.id === id); if (!T) return;
  const s = S();
  if (T.aspect && (s.project.settings.width !== T.aspect[0] || s.project.settings.height !== T.aspect[1])) {
    if (s.project.clips.length && !confirm(`Bu şablon ${T.aspect[0]}×${T.aspect[1]} formatına geçirir. Devam edilsin mi?`)) return;
    s.set(d => { d.settings.width = T.aspect![0]; d.settings.height = T.aspect![1]; });
  }
  const p = S().project;
  const c: Ctx = { p, t0: s.time, V: p.tracks.filter(t => t.kind === 'video').map(t => t.id), A: p.tracks.filter(t => t.kind === 'audio').map(t => t.id), assets: [], clips: [], pal: p.idea?.style.palette ?? ['#0b0a1a', '#3b1d6e', '#ff4d6d', '#ffb347'] };
  if (c.V.length < 2) { s.notify('Şablon için en az 2 video izi gerekli'); return; }
  s.notify('Şablon hazırlanıyor…');
  await T.build(c);
  s.set(d => { d.assets.push(...c.assets); d.clips.push(...c.clips); });
  s.ui({ selected: c.clips.map(k => k.id) }); s.notify(`${T.label} eklendi`);
}
