// Kalem aracı (G): önizlemede bezier maske çizme/düzenleme + maske kaplaması (overlay)
import { S } from '../store';
import type { Clip, MaskPt } from '../types';
import { maskMatrix } from '../engine/render';
import { addMask, deleteMaskPoint, editMaskAll, editMaskPts, finishMask, maskPtsAt, mpt, newMask, segPoint, splitSeg, toggleSmooth, tracePath } from '../engine/masks';

type PPt = { x: number; y: number; k: number };
type ToProject = (e: { clientX: number; clientY: number }) => PPt;
let hover: { x: number; y: number } | null = null;
export function penHover(q: { x: number; y: number } | null) { hover = q; }

/** Kalemin çalışacağı klip: seçili, görsel ve playhead altında */
export function penTarget(): Clip | undefined {
  const s = S(); const p = s.project; const c = p.clips.find(k => k.id === s.selected[0]);
  if (!c || c.kind === 'null' || p.tracks.find(t => t.id === c.trackId)?.kind !== 'video') return undefined;
  if (s.time < c.start || s.time > c.start + c.duration) return undefined;
  return c;
}
const cur = (clipId: string, maskId: string) => S().project.clips.find(k => k.id === clipId)?.masks?.find(k => k.id === maskId);
const localOf = (c: Clip) => Math.min(Math.max(S().time - c.start, 0), c.duration);

export function penDown(e: React.PointerEvent, toProject: ToProject) {
  const s = S(); if (s.playing) return; const clip = penTarget();
  if (!clip) { s.notify('Kalem: önce maske çizilecek katmanı seç (playhead klibin üzerinde olmalı)'); return; }
  const p = s.project; const pt = toProject(e); const M = maskMatrix(p, clip, s.time); const inv = M.inverse(); const local = localOf(clip);
  const toL = (q: { x: number; y: number }) => { const r = inv.transformPoint(new DOMPoint(q.x, q.y)); return { x: r.x, y: r.y }; };
  const dist = (x: number, y: number) => { const w = M.transformPoint(new DOMPoint(x, y)); return Math.hypot(w.x - pt.x, w.y - pt.y); };
  const th = 9 * pt.k; const id = clip.id; const masks = clip.masks ?? []; const act = masks.find(m => m.id === s.maskId);
  const ordered = act ? [act, ...masks.filter(m => m !== act)] : masks;
  const drag = (mv: (l: { x: number; y: number }, ev: PointerEvent) => void) => {
    const move = (ev: PointerEvent) => { const q = toProject(ev); hover = q; mv(toL(q), ev); };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };
  const dragHandles = (maskId: string, i: number) => drag((l, ev) => { const q = toProject(ev); if (Math.hypot(q.x - pt.x, q.y - pt.y) < 3 * pt.k) return; editMaskPts(id, maskId, pts => { const a = pts[i]; if (!a) return; a.ox = l.x - a.x; a.oy = l.y - a.y; a.ix = -a.ox; a.iy = -a.oy; }); });

  // 1) seçili çapanın tutamaçları
  if (act && s.maskPt >= 0) {
    const pts = maskPtsAt(act, local); const a = pts[s.maskPt];
    if (a) for (const side of ['o', 'i'] as const) {
      const hx = a.x + (side === 'o' ? a.ox : a.ix), hy = a.y + (side === 'o' ? a.oy : a.iy);
      if ((a.ox || a.oy || a.ix || a.iy) && dist(hx, hy) < th && dist(a.x, a.y) >= th * 0.6) {
        const i = s.maskPt; const mid = act.id;
        drag((l, ev) => editMaskPts(id, mid, q => { const b = q[i]; if (!b) return; const dx = l.x - b.x, dy = l.y - b.y;
          if (side === 'o') { b.ox = dx; b.oy = dy; if (!ev.altKey) { b.ix = -dx; b.iy = -dy; } } else { b.ix = dx; b.iy = dy; if (!ev.altKey) { b.ox = -dx; b.oy = -dy; } } }));
        return;
      }
    }
  }
  // 2) çapalar (aktif maske öncelikli)
  for (const m of ordered) {
    const pts = maskPtsAt(m, local); const i = pts.findIndex(q => dist(q.x, q.y) < th); if (i < 0) continue;
    if (m === act && !m.closed && i === 0 && m.pts.length >= 3) { S().set(d => { const k = d.clips.find(q => q.id === id)?.masks?.find(q => q.id === m.id); if (k) k.closed = true; }); S().ui({ maskPt: -1 }); return; }
    S().ui({ maskId: m.id, maskPt: i });
    if (e.altKey) { editMaskPts(id, m.id, q => toggleSmooth(q, i, m.closed), false); return; }
    const a0 = pts[i]; const l0 = toL(pt); const mid = m.id;
    drag(l => editMaskPts(id, mid, q => { const b = q[i]; if (!b) return; b.x = a0.x + (l.x - l0.x); b.y = a0.y + (l.y - l0.y); }));
    return;
  }
  // 3) açık yol: sona nokta ekle (sürüklersen eğri tutamacı çıkar)
  if (act && !act.closed) {
    const l = toL(pt); const i = act.pts.length; editMaskAll(id, act.id, q => { q.push(mpt(l.x, l.y)); }); S().ui({ maskPt: i }); dragHandles(act.id, i); return;
  }
  // 4) kapalı yolun kenarına tıkla: araya nokta ekle
  for (const m of ordered) {
    if (!m.closed) continue; const pts = maskPtsAt(m, local); let best = { d: th, i: -1, u: 0 };
    for (let i = 0; i < pts.length; i++) for (let j = 1; j < 24; j++) { const u = j / 24; const q = segPoint(pts, i, u); const d = dist(q.x, q.y); if (d < best.d) best = { d, i, u }; }
    if (best.i >= 0) {
      editMaskAll(id, m.id, q => splitSeg(q, best.i, best.u)); const i = best.i + 1; S().ui({ maskId: m.id, maskPt: i });
      const a0 = segPoint(pts, best.i, best.u); const l0 = toL(pt); const mid = m.id;
      drag(l => editMaskPts(id, mid, q => { const b = q[i]; if (!b) return; b.x = a0.x + (l.x - l0.x); b.y = a0.y + (l.y - l0.y); }));
      return;
    }
  }
  // 5) boşluk: yeni maske başlat
  const l = toL(pt); const mid = addMask(id, n => newMask([mpt(l.x, l.y)], false, n)); S().ui({ maskPt: 0 }); dragHandles(mid, 0);
}

/** Kalem modunda klavye; true dönerse olay tüketildi */
export function penKey(e: KeyboardEvent): boolean {
  const s = S(); if (s.tool !== 'pen') return false; const c = penTarget(); const m = c?.masks?.find(k => k.id === s.maskId);
  if (e.key === 'Enter') { if (c && m) finishMask(c.id, m.id); return true; }
  if (e.key === 'Escape') { if (c && m && !m.closed) finishMask(c.id, m.id); else if (s.maskPt >= 0) s.ui({ maskPt: -1 }); else s.ui({ tool: 'select' }); return true; }
  if (e.key === 'Delete' || e.key === 'Backspace') { if (c && m && s.maskPt >= 0) deleteMaskPoint(c.id, m.id, s.maskPt); return true; }
  return false;
}

/** Seçili klibin maske yollarını, çapalarını ve tutamaçlarını çizer (k: tuval pikseli / proje pikseli) */
export function drawMaskOverlay(x: CanvasRenderingContext2D, k: number, editing: boolean) {
  const s = S(); const p = s.project; const c = penTarget(); if (!c?.masks?.length) return;
  const M = maskMatrix(p, c, s.time); const local = localOf(c); const W2 = p.settings.width / 2, H2 = p.settings.height / 2;
  const scr = (px: number, py: number) => { const w = M.transformPoint(new DOMPoint(px, py)); return { x: (w.x + W2) * k, y: (w.y + H2) * k }; };
  x.save();
  for (const m of c.masks) {
    const pts = maskPtsAt(m, local); const active = m.id === s.maskId; if (!m.on && !active) continue;
    x.setTransform(k * M.a, k * M.b, k * M.c, k * M.d, (M.e + W2) * k, (M.f + H2) * k); tracePath(x, pts, m.closed); x.setTransform(1, 0, 0, 1, 0, 0);
    x.setLineDash([]); x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.55)'; x.stroke();
    x.lineWidth = 1.5; x.strokeStyle = active ? '#ffd23f' : 'rgba(255,210,63,.55)'; if (!m.on) x.setLineDash([4, 4]); x.stroke(); x.setLineDash([]);
    if (!editing) continue;
    if (active && !m.closed && hover && pts.length) { const a = pts[pts.length - 1]; const q = scr(a.x, a.y); x.setLineDash([4, 4]); x.beginPath(); x.moveTo(q.x, q.y); x.lineTo((hover.x + W2) * k, (hover.y + H2) * k); x.stroke(); x.setLineDash([]); }
    pts.forEach((a: MaskPt, i) => {
      const q = scr(a.x, a.y); const sel = active && i === s.maskPt;
      if (sel && (a.ix || a.iy || a.ox || a.oy)) {
        const hi = scr(a.x + a.ix, a.y + a.iy), ho = scr(a.x + a.ox, a.y + a.oy);
        x.strokeStyle = '#7fd4ff'; x.lineWidth = 1; x.beginPath(); x.moveTo(hi.x, hi.y); x.lineTo(q.x, q.y); x.lineTo(ho.x, ho.y); x.stroke();
        for (const h of [hi, ho]) { x.beginPath(); x.arc(h.x, h.y, 4, 0, 7); x.fillStyle = '#7fd4ff'; x.fill(); x.strokeStyle = '#000'; x.stroke(); }
      }
      const r = sel ? 5 : 4; x.fillStyle = sel ? '#ffd23f' : active ? '#fff' : 'rgba(255,255,255,.6)'; x.strokeStyle = '#000'; x.lineWidth = 1;
      if (active && !m.closed && i === 0 && pts.length >= 3) { x.beginPath(); x.arc(q.x, q.y, 7, 0, 7); x.strokeStyle = '#3ddc97'; x.lineWidth = 2; x.stroke(); x.strokeStyle = '#000'; x.lineWidth = 1; }
      x.fillRect(q.x - r, q.y - r, r * 2, r * 2); x.strokeRect(q.x - r, q.y - r, r * 2, r * 2);
    });
  }
  x.restore();
}
