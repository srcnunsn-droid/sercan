// Piksel düzenleme altyapısı: fırça geçmişi (undo/redo), seçim (dikdörtgen/elips/kement), seçim işlemleri
import { S, historyHooks } from '../store';
import type { Clip, Project } from '../types';
import { transformAt } from './interp';
import { assetFromCanvas, commitPaint, paintCanvas, sourceSize } from './media';
import { renderFrame } from './render';
import { newClip, newTrack } from '../util';

export type Pt = { x: number; y: number };
export interface Selection { kind: 'rect' | 'ellipse' | 'lasso'; pts: Pt[] }

// ---------- seçim (proje koordinatı, merkez orijinli) ----------
let selection: Selection | null = null;
export const getSelection = () => selection;
export function setSelection(s: Selection | null) { selection = s && s.pts.length >= 2 ? s : null; }
export function selectionPolygon(s: Selection): Pt[] {
  if (s.kind === 'lasso') return s.pts;
  const [a, b] = [s.pts[0], s.pts[s.pts.length - 1]];
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  if (s.kind === 'rect') return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
  return Array.from({ length: 72 }, (_, i) => ({ x: cx + Math.cos((i / 72) * Math.PI * 2) * rx, y: cy + Math.sin((i / 72) * Math.PI * 2) * ry }));
}

/** proje noktası → katmanın kaynak piksel koordinatı (dönüşüm + sığdırma tersine) */
export function toSource(p: Project, c: Clip, q: Pt, t: number) {
  const sz = sourceSize(c.assetId) ?? [p.settings.width, p.settings.height]; const [sw, sh] = sz;
  const T = transformAt(c, Math.min(Math.max(t - c.start, 0), c.duration));
  const PW = p.settings.width, PH = p.settings.height;
  let dw = PW, dh = PH; if (c.fit !== 'stretch') { const f = c.fit === 'cover' ? Math.max(PW / sw, PH / sh) : Math.min(PW / sw, PH / sh); dw = sw * f; dh = sh * f; }
  const a = (-T.rotation * Math.PI) / 180, dx = q.x - T.x, dy = q.y - T.y;
  const lx = (dx * Math.cos(a) - dy * Math.sin(a)) / T.scale, ly = (dx * Math.sin(a) + dy * Math.cos(a)) / T.scale;
  return { x: (lx + dw / 2) * (sw / dw), y: (ly + dh / 2) * (sh / dh), k: (sw / dw) / T.scale };
}
export function selectionPathOn(ctx: CanvasRenderingContext2D, p: Project, c: Clip, t: number) {
  if (!selection) return false; const poly = selectionPolygon(selection).map(q => toSource(p, c, q, t));
  ctx.beginPath(); poly.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); return true;
}

// ---------- fırça geçmişi ----------
interface Entry { assetId: string; before: ImageData; after: ImageData }
const history = new Map<number, Entry>();
export function beginPixelEdit(assetId: string) { const c = paintCanvas(assetId); return c ? c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, c.width, c.height) : null; }
export async function endPixelEdit(assetId: string, before: ImageData | null) {
  const c = paintCanvas(assetId); if (!c || !before) return;
  const after = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
  const rev = (S().project.paintRev ?? 0) + 1;
  history.set(rev, { assetId, before, after });
  for (const k of [...history.keys()]) if (k < rev - 40) history.delete(k); // bellek sınırı
  for (const k of [...history.keys()]) if (k > rev) history.delete(k);
  S().set(d => { d.paintRev = rev; });
  await commitPaint(assetId);
}
async function apply(e: Entry, img: ImageData) { const c = paintCanvas(e.assetId); if (!c) return; c.getContext('2d')!.putImageData(img, 0, 0); await commitPaint(e.assetId); }
historyHooks.after = (from: Project, to: Project) => {
  const a = from.paintRev ?? 0, b = to.paintRev ?? 0; if (a === b) return;
  if (b < a) for (let r = a; r > b; r--) { const e = history.get(r); if (e) apply(e, e.before); }
  else for (let r = a + 1; r <= b; r++) { const e = history.get(r); if (e) apply(e, e.after); }
};

// ---------- seçim işlemleri ----------
function activeImageLayer() {
  const s = S(); const p = s.project;
  return p.clips.find(k => k.id === s.selected[0] && k.kind === 'media' && p.assets.find(a => a.id === k.assetId)?.kind === 'image');
}
export async function fillSelection(erase = false) {
  const s = S(); const c = activeImageLayer(); if (!selection) return s.notify('Önce bir seçim yap (M / L araçları)');
  if (!c) return s.notify('Bir görsel/boya katmanı seç');
  const pc = paintCanvas(c.assetId!); if (!pc) return; const before = beginPixelEdit(c.assetId!);
  const x = pc.getContext('2d')!; x.save(); selectionPathOn(x, s.project, c, s.time);
  if (erase) { x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; } else { x.fillStyle = s.brush.color; x.globalAlpha = s.brush.opacity; }
  x.fill(); x.restore(); await endPixelEdit(c.assetId!, before); s.notify(erase ? 'Seçim silindi' : 'Seçim dolduruldu');
}
/** Seçili katmanın seçim içindeki kısmını yeni katmana kopyalar (Photoshop: Layer via Copy) */
export async function copySelectionToLayer(cut = false) {
  const s = S(); const p = s.project; const c = p.clips.find(k => k.id === s.selected[0]);
  if (!selection) return s.notify('Önce bir seçim yap'); if (!c) return s.notify('Bir katman seç');
  const W = p.settings.width, H = p.settings.height; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d')!;
  const tr = p.tracks.find(t => t.id === c.trackId)!;
  renderFrame(x, { ...p, tracks: [{ ...tr, hidden: false }], clips: [c] }, s.time, 1, true);
  x.globalCompositeOperation = 'destination-in'; x.beginPath(); selectionPolygon(selection).forEach((q, i) => (i ? x.lineTo(q.x + W / 2, q.y + H / 2) : x.moveTo(q.x + W / 2, q.y + H / 2))); x.closePath(); x.fill();
  const a = await assetFromCanvas(cv, 'Seçimden katman', 'procedural', { paint: true }); paintCanvas(a.id);
  const t = newTrack('video', 'Seçimden katman'); const k = newClip(t.id, 'media', p.mode === 'image' ? 0 : c.start, p.mode === 'image' ? 1 : c.duration, { assetId: a.id, name: 'Seçimden katman', fit: 'stretch' });
  s.set(d => { d.assets.push(a); const i = d.tracks.findIndex(q => q.id === c.trackId); d.tracks.splice(Math.max(0, i), 0, t); d.clips.push(k); });
  if (cut && activeImageLayer()) { const keep = s.selected; s.ui({ selected: [c.id] }); await fillSelection(true); s.ui({ selected: keep }); }
  s.ui({ selected: [k.id] }); s.notify(cut ? 'Seçim kesilip yeni katmana taşındı' : 'Seçim yeni katmana kopyalandı');
}
