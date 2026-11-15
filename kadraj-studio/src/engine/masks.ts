// Kalem (bezier) maskeleri — yol örnekleme, keyframe ara değerleme, mat (matte) üretimi ve düzenleme işlemleri
import type { Clip, Mask, MaskKey, MaskMode, MaskPt } from '../types';
import { easeOf } from './interp';
import { S } from '../store';
import { uid } from '../util';

type Ctx = CanvasRenderingContext2D;
type LayerFn = (w: number, h: number) => { c: HTMLCanvasElement; x: Ctx; free: () => void };

export const mpt = (x: number, y: number, ix = 0, iy = 0, ox = 0, oy = 0): MaskPt => ({ x, y, ix, iy, ox, oy });
export const MASK_MODE_LABELS: Record<MaskMode, string> = { add: 'Ekle', subtract: 'Çıkar', intersect: 'Kesişim' };
export function newMask(pts: MaskPt[], closed: boolean, n = 1): Mask {
  return { id: uid('m_'), name: 'Maske ' + n, on: true, closed, pts, mode: 'add', invert: false, feather: 0, expand: 0, opacity: 1 };
}
const lerpPt = (a: MaskPt, b: MaskPt, u: number): MaskPt => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ix: a.ix + (b.ix - a.ix) * u, iy: a.iy + (b.iy - a.iy) * u, ox: a.ox + (b.ox - a.ox) * u, oy: a.oy + (b.oy - a.oy) * u });

/** Maske yolunun klip içi `local` anındaki noktaları (yol keyframe'leri varsa ara değerlenir) */
export function maskPtsAt(m: Mask, local: number): MaskPt[] {
  const k = m.kf; if (!k || !k.length) return m.pts;
  if (local <= k[0].t) return k[0].pts; const last = k[k.length - 1]; if (local >= last.t) return last.pts;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1]; if (local < a.t || local > b.t) continue;
    if (a.pts.length !== b.pts.length) return a.pts;
    const u = easeOf({ t: 0, v: 0, e: b.e, b: b.b })((local - a.t) / (b.t - a.t || 1));
    return a.pts.map((p, j) => lerpPt(p, b.pts[j], u));
  }
  return m.pts;
}

export function tracePath(x: Ctx, pts: MaskPt[], closed: boolean) {
  x.beginPath(); const n = pts.length; if (!n) return;
  x.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < n; i++) { const a = pts[i - 1], p = pts[i]; x.bezierCurveTo(a.x + a.ox, a.y + a.oy, p.x + p.ix, p.y + p.iy, p.x, p.y); }
  if (closed && n > 1) { const a = pts[n - 1], p = pts[0]; x.bezierCurveTo(a.x + a.ox, a.y + a.oy, p.x + p.ix, p.y + p.iy, p.x, p.y); x.closePath(); }
}
/** Segment i (pts[i] → pts[i+1], kapalıysa sarar) üzerinde u noktasındaki konum */
export function segPoint(pts: MaskPt[], i: number, u: number) {
  const a = pts[i], b = pts[(i + 1) % pts.length]; const v = 1 - u;
  const x1 = a.x + a.ox, y1 = a.y + a.oy, x2 = b.x + b.ix, y2 = b.y + b.iy;
  return { x: v * v * v * a.x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * b.x, y: v * v * v * a.y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * b.y };
}
/** De Casteljau: segment i'yi u'da böl, eğrinin biçimini bozmadan yeni çapa ekle */
export function splitSeg(pts: MaskPt[], i: number, u: number) {
  const a = pts[i], b = pts[(i + 1) % pts.length]; const L = (p: number, q: number) => p + (q - p) * u;
  if (!a.ox && !a.oy && !b.ix && !b.iy) { pts.splice(i + 1, 0, mpt(L(a.x, b.x), L(a.y, b.y))); return; } // düz kenar → köşe noktası
  const p0 = [a.x, a.y], p1 = [a.x + a.ox, a.y + a.oy], p2 = [b.x + b.ix, b.y + b.iy], p3 = [b.x, b.y];
  const q0 = [L(p0[0], p1[0]), L(p0[1], p1[1])], q1 = [L(p1[0], p2[0]), L(p1[1], p2[1])], q2 = [L(p2[0], p3[0]), L(p2[1], p3[1])];
  const r0 = [L(q0[0], q1[0]), L(q0[1], q1[1])], r1 = [L(q1[0], q2[0]), L(q1[1], q2[1])]; const X = [L(r0[0], r1[0]), L(r0[1], r1[1])];
  a.ox = q0[0] - a.x; a.oy = q0[1] - a.y; b.ix = q2[0] - b.x; b.iy = q2[1] - b.y;
  pts.splice(i + 1, 0, mpt(X[0], X[1], r0[0] - X[0], r0[1] - X[1], r1[0] - X[0], r1[1] - X[1]));
}
/** Köşe ↔ yumuşak: tutamaç yoksa komşulara göre otomatik (Catmull-Rom benzeri) tutamaç üretir, varsa sıfırlar */
export function toggleSmooth(pts: MaskPt[], i: number, closed: boolean) {
  const p = pts[i]; if (p.ix || p.iy || p.ox || p.oy) { p.ix = p.iy = p.ox = p.oy = 0; return; }
  const n = pts.length; const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
  const dx = (b.x - a.x) / 6, dy = (b.y - a.y) / 6; p.ix = -dx; p.iy = -dy; p.ox = dx; p.oy = dy;
}

export function rectMask(w: number, h: number, n = 1): Mask { return newMask([mpt(-w / 2, -h / 2), mpt(w / 2, -h / 2), mpt(w / 2, h / 2), mpt(-w / 2, h / 2)], true, n); }
export function ellipseMask(w: number, h: number, n = 1): Mask {
  const k = 0.5522847498, rx = w / 2, ry = h / 2;
  return newMask([mpt(0, -ry, -rx * k, 0, rx * k, 0), mpt(rx, 0, 0, -ry * k, 0, ry * k), mpt(0, ry, rx * k, 0, -rx * k, 0), mpt(-rx, 0, 0, ry * k, 0, -ry * k)], true, n);
}

// ---- mat üretimi ----
let hard: HTMLCanvasElement | null = null;
/**
 * Katmanın (x) alfasını maskelerle sınırlar. m: katman → proje (merkez orijinli) dünya matrisi; null = birim (ayar katmanı).
 * Her maske: sert şekil (+genişletme) → tek geçişte yumuşatma → mod ile birleştirme. Kesişim = tersinin çıkarılması.
 */
export function applyMasks(x: Ctx, c: Clip, local: number, s: number, W: number, H: number, m: DOMMatrix | null, layer: LayerFn) {
  const ms = (c.masks ?? []).filter(k => k.on && k.closed && k.pts.length >= 2); if (!ms.length) return;
  const M = layer(W, H), Sh = layer(W, H); const sc = m ? Math.hypot(m.a, m.b) : 1;
  if (ms[0].mode === 'subtract') { M.x.fillStyle = '#fff'; M.x.fillRect(0, 0, W, H); }
  hard ??= document.createElement('canvas');
  ms.forEach((k, idx) => {
    const pts = maskPtsAt(k, local); const f = Math.max(0, k.feather) * s * sc; const pad = f > 0.05 ? Math.ceil(f * 3) : 0;
    const hw = W + pad * 2, hh = H + pad * 2; if (hard!.width !== hw || hard!.height !== hh) { hard!.width = hw; hard!.height = hh; }
    const h = hard!.getContext('2d')!; h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'source-over'; h.clearRect(0, 0, hw, hh);
    if (m) h.setTransform(s * m.a, s * m.b, s * m.c, s * m.d, W / 2 + s * m.e + pad, H / 2 + s * m.f + pad); else h.setTransform(s, 0, 0, s, W / 2 + pad, H / 2 + pad);
    tracePath(h, pts, true); h.fillStyle = '#fff'; h.fill();
    if (k.expand) { h.lineJoin = 'round'; h.lineWidth = Math.abs(k.expand) * 2; h.strokeStyle = '#fff'; if (k.expand < 0) h.globalCompositeOperation = 'destination-out'; h.stroke(); }
    const mode = idx === 0 && k.mode === 'intersect' ? 'add' : k.mode; const inv = mode === 'intersect' ? !k.invert : k.invert;
    Sh.x.setTransform(1, 0, 0, 1, 0, 0); Sh.x.filter = 'none'; Sh.x.globalAlpha = 1; Sh.x.globalCompositeOperation = 'source-over'; Sh.x.clearRect(0, 0, W, H);
    if (inv) { Sh.x.fillStyle = '#fff'; Sh.x.fillRect(0, 0, W, H); Sh.x.globalCompositeOperation = 'destination-out'; }
    if (pad) Sh.x.filter = `blur(${f}px)`;
    Sh.x.drawImage(hard!, -pad, -pad); Sh.x.filter = 'none'; Sh.x.globalCompositeOperation = 'source-over';
    M.x.globalAlpha = Math.min(1, Math.max(0, k.opacity)); M.x.globalCompositeOperation = mode === 'add' ? 'source-over' : 'destination-out';
    M.x.drawImage(Sh.c, 0, 0); M.x.globalAlpha = 1; M.x.globalCompositeOperation = 'source-over';
  });
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; x.globalAlpha = 1; x.globalCompositeOperation = 'destination-in'; x.drawImage(M.c, 0, 0); x.restore();
  M.free(); Sh.free();
}

// ---- düzenleme (store üzerinden; undo/redo'ya girer) ----
const KEY_EPS = 1 / 120;
const clonePts = (p: MaskPt[]) => p.map(q => ({ ...q }));
const localT = (c: Clip) => Math.min(Math.max(S().time - c.start, 0), c.duration);
/** Biçim düzenleme: yol keyframe'i varsa playhead'de keyframe'e yazar (yoksa oluşturur), yoksa temel yola */
export function editMaskPts(clipId: string, maskId: string, fn: (pts: MaskPt[]) => void, merge = true) {
  S().set(d => {
    const c = d.clips.find(k => k.id === clipId); const m = c?.masks?.find(k => k.id === maskId); if (!c || !m) return;
    if (m.kf?.length) {
      const lt = localT(c as Clip); let key = m.kf.find(k => Math.abs(k.t - lt) < KEY_EPS);
      if (!key) { key = { t: lt, pts: clonePts(maskPtsAt(m as Mask, lt)), e: 'easeInOut' }; m.kf.push(key); m.kf.sort((a, b) => a.t - b.t); }
      fn(key.pts);
    } else fn(m.pts);
  }, merge);
}
/** Yapısal düzenleme (nokta ekle/sil): temel yola ve tüm keyframe'lere uygulanır — nokta sayıları eşit kalır */
export function editMaskAll(clipId: string, maskId: string, fn: (pts: MaskPt[]) => void) {
  S().set(d => { const m = d.clips.find(k => k.id === clipId)?.masks?.find(k => k.id === maskId); if (!m) return; fn(m.pts); m.kf?.forEach(k => fn(k.pts)); });
}
export function addMask(clipId: string, make: (n: number) => Mask): string {
  let id = '';
  S().set(d => { const c = d.clips.find(k => k.id === clipId); if (!c) return; c.masks ??= []; const m = make(c.masks.length + 1); id = m.id; c.masks.push(m); });
  S().ui({ maskId: id, maskPt: -1 }); return id;
}
export function removeMask(clipId: string, maskId: string) {
  S().set(d => { const c = d.clips.find(k => k.id === clipId); if (!c?.masks) return; c.masks = c.masks.filter(k => k.id !== maskId); if (!c.masks.length) delete c.masks; });
  if (S().maskId === maskId) S().ui({ maskId: null, maskPt: -1 });
}
/** Seçili çapayı sil; 2'den az nokta kalırsa maskeyi kaldır */
export function deleteMaskPoint(clipId: string, maskId: string, i: number) {
  const m = S().project.clips.find(k => k.id === clipId)?.masks?.find(k => k.id === maskId); if (!m || i < 0 || i >= m.pts.length) return;
  if (m.pts.length <= (m.closed ? 3 : 1)) removeMask(clipId, maskId); else editMaskAll(clipId, maskId, pts => { pts.splice(i, 1); });
  S().ui({ maskPt: -1 });
}
/** Açık yolu bitir: ≥3 nokta varsa kapat, yoksa at */
export function finishMask(clipId: string, maskId: string) {
  const m = S().project.clips.find(k => k.id === clipId)?.masks?.find(k => k.id === maskId); if (!m || m.closed) return;
  if (m.pts.length >= 3) S().set(d => { const k = d.clips.find(q => q.id === clipId)?.masks?.find(q => q.id === maskId); if (k) k.closed = true; }); else removeMask(clipId, maskId);
}
/** Yol animasyonu: aç → playhead'e ilk keyframe; kapat → o anki biçim kalıcı olur */
export function toggleMaskAnim(clipId: string, maskId: string) {
  S().set(d => {
    const c = d.clips.find(k => k.id === clipId); const m = c?.masks?.find(k => k.id === maskId); if (!c || !m) return; const lt = localT(c as Clip);
    if (m.kf?.length) { m.pts = clonePts(maskPtsAt(m as Mask, lt)); delete m.kf; } else m.kf = [{ t: lt, pts: clonePts(m.pts), e: 'easeInOut' }];
  });
}
/** Playhead'de yol keyframe'i ekle/çıkar */
export function toggleMaskKey(clipId: string, maskId: string) {
  S().set(d => {
    const c = d.clips.find(k => k.id === clipId); const m = c?.masks?.find(k => k.id === maskId); if (!c || !m?.kf) return; const lt = localT(c as Clip);
    const at = m.kf.find(k => Math.abs(k.t - lt) < KEY_EPS);
    if (at) { if (m.kf.length === 1) { m.pts = clonePts(at.pts); delete m.kf; } else m.kf = m.kf.filter(k => k !== at); }
    else { m.kf.push({ t: lt, pts: clonePts(maskPtsAt(m as Mask, lt)), e: 'easeInOut' }); m.kf.sort((a, b) => a.t - b.t); }
  });
}
export const maskKeyAt = (m: Mask, lt: number): MaskKey | undefined => m.kf?.find(k => Math.abs(k.t - lt) < KEY_EPS);
