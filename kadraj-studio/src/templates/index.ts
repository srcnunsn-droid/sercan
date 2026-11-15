// Şablon kataloğu: tasarımlar × paletler. Ekleme, önizleme ve yeni proje oluşturma.
import { S } from '../store';
import type { Project } from '../types';
import { newProject, newTrack } from '../util';
import { DESIGNS } from './designs';
import { PALETTES, resolve, type Ctx, type Design, type Palette } from './lib';

export interface Tpl { key: string; design: Design; palette: Palette }
export const CATALOG: Tpl[] = DESIGNS.flatMap(d => PALETTES.map(p => ({ key: `${d.id}:${p.id}`, design: d, palette: p })));
export const CATEGORIES = [...new Set(DESIGNS.map(d => d.cat))];
export { PALETTES, DESIGNS };

export function defaults(d: Design) { return Object.fromEntries(d.fields.map(f => [f.k, f.def])); }

function ctxFor(d: Design, P: Palette, W: number, H: number, V: Record<string, string>): Ctx {
  const u = Math.min(W, H) / 1080; return { W, H, u, hx: Math.min(1, W / (1920 * u)), P, V: { ...defaults(d), ...V }, D: d.dur, portrait: H > W };
}

/** Yalnızca şablonu içeren geçici proje (küçük resim / canlı önizleme için) */
export function previewProject(t: Tpl, W: number, H: number, V: Record<string, string> = {}): Project {
  const p = newProject('önizleme'); p.settings = { ...p.settings, width: W, height: H, bg: t.palette.bg };
  const clips = resolve(t.design.build(ctxFor(t.design, t.palette, W, H, V)));
  p.tracks = []; p.clips = [];
  for (const c of clips) { const tr = newTrack('video', c.name); p.tracks.unshift(tr); c.trackId = tr.id; p.clips.push(c); }
  return p;
}

/** Mevcut projeye playhead konumundan ekle (her katman kendi izine, en üste) */
export function insertTemplate(t: Tpl, V: Record<string, string>) {
  const s = S(); const p = s.project; const W = p.settings.width, H = p.settings.height; const t0 = p.mode === 'image' ? 0 : s.time;
  const clips = resolve(t.design.build(ctxFor(t.design, t.palette, W, H, V)));
  const tracks = clips.map(c => newTrack('video', `${t.design.name} · ${c.name}`.slice(0, 40)));
  clips.forEach((c, i) => { c.trackId = tracks[i].id; c.start += t0; if (p.mode === 'image') { c.start = 0; c.duration = 1; } });
  s.set(d => { for (const tr of tracks) d.tracks.unshift(tr); d.clips.push(...clips); });
  s.ui({ selected: clips.filter(c => c.kind === 'text').map(c => c.id).slice(0, 1) });
  s.notify(`Şablon eklendi: ${t.design.name} · ${t.palette.name} (${clips.length} katman)`);
}

/** Şablonu kendi projesi olarak aç */
export function openAsProject(t: Tpl, V: Record<string, string>, W: number, H: number) {
  const p = previewProject(t, W, H, V); p.name = `${t.design.name} · ${t.palette.name}`;
  const audio = [newTrack('audio', 'A1 · Ses'), newTrack('audio', 'A2 · Müzik')]; p.tracks.push(...audio);
  S().replace(p); S().ui({ panel: 'editor', time: 0, selected: [] }); S().notify('Şablon yeni proje olarak açıldı');
}
