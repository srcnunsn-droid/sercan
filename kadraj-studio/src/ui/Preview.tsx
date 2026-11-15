import { useEffect, useRef, useState } from 'react';
import { useS, S } from '../store';
import { activeClips, clipBounds, hitTest, parentChain, renderFrame, type Bounds } from '../engine/render';
import { addPaintLayer, setClipProp } from '../actions';
import { paintCanvas } from '../engine/media';
import { beginPixelEdit, endPixelEdit, getSelection, selectionPathOn, selectionPolygon, setSelection, toSource, type Selection } from '../engine/pixels';
import { transformAt } from '../engine/interp';
import { audio, toggle, seek } from '../engine/playback';
import { fmtTime, projectDuration } from '../util';
import { Scopes } from './Scopes';
import { drawMaskOverlay, penDown, penHover } from './penTool';

const MAXW = 1280;

export function Preview() {
  const cv = useRef<HTMLCanvasElement>(null);
  const settings = useS(s => s.project.settings);
  const [q, setQ] = useState(0.5); const tool = useS(s => s.tool); const isImage = useS(s => s.project.mode === 'image');
  const scale = Math.min(1, (MAXW / settings.width) * (q * 2));
  const W = Math.round(settings.width * scale), H = Math.round(settings.height * scale);
  const [lvl, setLvl] = useState(0); const [scopes, setScopes] = useState(false);

  useEffect(() => {
    let raf = 0, last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const s = S(); if (!s.playing && now - last < 33) return; last = now;
      const c = cv.current; if (!c) return; const ctx = c.getContext('2d', { alpha: false })!;
      renderFrame(ctx, s.project, s.time, c.width / s.project.settings.width);
      if (s.project.settings.safeArea) drawSafe(ctx, c.width, c.height);
      if (!s.playing) { const k = c.width / s.project.settings.width; if (s.tool === 'select') { drawSelection(ctx, k); drawMaskOverlay(ctx, k, false); } else if (s.tool === 'pen') drawMaskOverlay(ctx, k, true); else if (s.tool === 'brush' || s.tool === 'eraser') drawBrushCursor(ctx, k); drawMarching(ctx, k); }
      if (s.playing) setLvl(audio.level());
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <div className="viewport"><canvas ref={cv} width={W} height={H} style={{ aspectRatio: `${settings.width}/${settings.height}`, cursor: tool === 'select' ? 'default' : tool === 'brush' || tool === 'eraser' ? 'none' : 'crosshair' }} onPointerDown={e => canvasDown(e, cv.current!)} onPointerMove={e => canvasMove(e, cv.current!)} onPointerLeave={() => { cursor = null; penHover(null); }} />{scopes && <Scopes source={cv} />}</div>
      {isImage ? <ImageBar q={q} setQ={setQ} scopes={scopes} setScopes={setScopes} /> : <Transport q={q} setQ={setQ} lvl={lvl} scopes={scopes} setScopes={setScopes} />}
    </>
  );
}

// ---- doğrudan manipülasyon ----
const guide = { x: false, y: false };
function toProject(e: { clientX: number; clientY: number }, c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect(); const p = S().project.settings;
  return { x: ((e.clientX - r.left) / r.width - 0.5) * p.width, y: ((e.clientY - r.top) / r.height - 0.5) * p.height, k: p.width / r.width };
}
function corners(b: Bounds) {
  const a = (b.rot * Math.PI) / 180, cs = Math.cos(a), sn = Math.sin(a);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const lx = (sx * b.w) / 2, ly = (sy * b.h) / 2; return { x: b.cx + lx * cs - ly * sn, y: b.cy + lx * sn + ly * cs }; });
}
// ---- fırça / silgi ----
let cursor: { x: number; y: number } | null = null;
function canvasMove(e: React.PointerEvent, c: HTMLCanvasElement) { const pt = toProject(e, c); cursor = { x: pt.x, y: pt.y }; penHover(cursor); }
async function paintDown(e: React.PointerEvent, c: HTMLCanvasElement) {
  const s = S(); const p = s.project;
  let clip = p.clips.find(k => k.id === s.selected[0] && k.kind === 'media' && p.assets.find(a => a.id === k.assetId)?.kind === 'image');
  if (!clip) { clip = await addPaintLayer(); }
  const id = clip.id; const assetId = clip.assetId!; const pc = paintCanvas(assetId); if (!pc) return;
  const pctx = pc.getContext('2d')!; const b = S().brush; const erase = S().tool === 'eraser';
  const before = beginPixelEdit(assetId);
  const toSrc = (q: { x: number; y: number }) => { const st = S(); return toSource(st.project, st.project.clips.find(x => x.id === id)!, q, st.time); };
  const stamp = (x: number, y: number, r: number) => {
    const g = pctx.createRadialGradient(x, y, r * b.hardness * 0.98, x, y, r);
    const [cr, cg, cb] = hexRgb(b.color); g.addColorStop(0, `rgba(${cr},${cg},${cb},${b.opacity})`); g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    pctx.fillStyle = g; pctx.beginPath(); pctx.arc(x, y, r, 0, Math.PI * 2); pctx.fill();
  };
  pctx.save(); if (selectionPathOn(pctx, S().project, S().project.clips.find(x => x.id === id)!, S().time)) pctx.clip(); pctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  let last = toSrc(toProject(e, c)); const r = (b.size / 2) * last.k; stamp(last.x, last.y, r);
  const mv = (ev: PointerEvent) => {
    const q = toProject(ev, c); cursor = { x: q.x, y: q.y }; const n = toSrc(q);
    const dist = Math.hypot(n.x - last.x, n.y - last.y), step = Math.max(1, r * 0.18);
    for (let d = step; d <= dist; d += step) stamp(last.x + ((n.x - last.x) * d) / dist, last.y + ((n.y - last.y) * d) / dist, r);
    if (dist >= step) last = n;
  };
  const up = async () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); pctx.restore(); await endPixelEdit(assetId, before); };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
}
const hexRgb = (h: string) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

function selDown(e: React.PointerEvent, c: HTMLCanvasElement) {
  const kind = S().tool === 'lasso' ? 'lasso' : S().tool === 'ellipse' ? 'ellipse' : 'rect';
  const p0 = toProject(e, c); const pts = [{ x: p0.x, y: p0.y }]; let moved = false;
  if (kind !== 'lasso') pts.push({ x: p0.x, y: p0.y });
  setSelection(null); selDraft = { kind, pts };
  const mv = (ev: PointerEvent) => {
    const q = toProject(ev, c); moved = true;
    if (kind === 'lasso') { const l = pts[pts.length - 1]; if (Math.hypot(q.x - l.x, q.y - l.y) > 3 * q.k) pts.push({ x: q.x, y: q.y }); }
    else { let x = q.x, y = q.y; if (ev.shiftKey) { const d = Math.max(Math.abs(x - p0.x), Math.abs(y - p0.y)); x = p0.x + Math.sign(x - p0.x || 1) * d; y = p0.y + Math.sign(y - p0.y || 1) * d; } pts[1] = { x, y }; }
  };
  const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); selDraft = null; setSelection(moved && (kind !== 'lasso' || pts.length > 2) ? { kind, pts } : null); };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
}
let selDraft: Selection | null = null;
function drawMarching(x: CanvasRenderingContext2D, k: number) {
  const sel = selDraft ?? getSelection(); if (!sel) return; const p = S().project;
  const poly = selectionPolygon(sel).map(q => ({ x: (q.x + p.settings.width / 2) * k, y: (q.y + p.settings.height / 2) * k }));
  x.save(); x.beginPath(); poly.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath();
  x.lineWidth = 1; x.setLineDash([6, 6]); x.strokeStyle = '#000'; x.lineDashOffset = -(performance.now() / 60) % 12; x.stroke();
  x.strokeStyle = '#fff'; x.lineDashOffset = -(performance.now() / 60) % 12 + 6; x.stroke(); x.restore();
}

function canvasDown(e: React.PointerEvent, c: HTMLCanvasElement) {
  if (['marquee', 'ellipse', 'lasso'].includes(S().tool)) { selDown(e, c); return; }
  if (S().tool === 'pen') { penDown(e, ev => toProject(ev, c)); return; }
  if (S().tool !== 'select') { paintDown(e, c); return; }
  const s = S(); if (s.playing) return; const p = s.project; const pt = toProject(e, c);
  const visible = activeClips(p, s.time).filter(k => !p.tracks.find(t => t.id === k.trackId)?.locked);
  let target = p.clips.find(k => k.id === s.selected[0] && visible.includes(k));
  let mode: 'move' | 'scale' = 'move';
  if (target) { const b = clipBounds(p, target, s.time); const hit = corners(b).some(q => Math.hypot(q.x - pt.x, q.y - pt.y) < 14 * pt.k); if (hit) mode = 'scale'; else if (!hitTest(b, pt.x, pt.y)) target = undefined; }
  if (!target) { target = [...visible].reverse().find(k => hitTest(clipBounds(p, k, s.time), pt.x, pt.y)); if (!target) { s.ui({ selected: [] }); return; } s.ui({ selected: [target.id] }); }
  const id = target.id; const b0 = clipBounds(p, target, s.time); const d0 = Math.hypot(pt.x - b0.cx, pt.y - b0.cy) || 1;
  const local = Math.min(Math.max(s.time - target.start, 0), target.duration);
  const T = transformAt(target, local);
  const chain = parentChain(p, target); let pinv: DOMMatrix | null = null;
  if (chain.length) { const m = new DOMMatrix(); for (const a of chain) { const A = transformAt(a, Math.min(Math.max(s.time - a.start, 0), a.duration)); m.translateSelf(A.x, A.y).rotateSelf(A.rotation).scaleSelf(A.scale, A.scale); } pinv = m.inverse(); }
  const W = p.settings.width, H = p.settings.height;
  const mv = (ev: PointerEvent) => {
    const q = toProject(ev, c);
    if (mode === 'scale') { const ns = Math.max(0.02, b0.scale * (Math.hypot(q.x - b0.cx, q.y - b0.cy) / d0)); setClipProp(id, 'scale', ev.shiftKey ? Math.round(ns * 10) / 10 : +ns.toFixed(3)); return; }
    let cx = b0.cx + (q.x - pt.x), cy = b0.cy + (q.y - pt.y);
    const th = 12 * q.k, hw = b0.w / 2, hh = b0.h / 2; guide.x = guide.y = false;
    if (!ev.altKey) {
      if (Math.abs(cx) < th) { cx = 0; guide.x = true; } else if (Math.abs(cx - hw + W / 2) < th) cx = hw - W / 2; else if (Math.abs(cx + hw - W / 2) < th) cx = W / 2 - hw;
      if (Math.abs(cy) < th) { cy = 0; guide.y = true; } else if (Math.abs(cy - hh + H / 2) < th) cy = hh - H / 2; else if (Math.abs(cy + hh - H / 2) < th) cy = H / 2 - hh;
    }
    // dünya deltası → ebeveyn uzayına (parenting varsa ters dönüşüm)
    const wdx = cx - b0.cx, wdy = cy - b0.cy; let ldx = wdx, ldy = wdy;
    if (pinv) { const a0 = pinv.transformPoint(new DOMPoint(0, 0)), a1 = pinv.transformPoint(new DOMPoint(wdx, wdy)); ldx = a1.x - a0.x; ldy = a1.y - a0.y; }
    setClipProp(id, 'x', Math.round(T.x + ldx)); setClipProp(id, 'y', Math.round(T.y + ldy));
  };
  const up = () => { guide.x = guide.y = false; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
}
function drawSelection(x: CanvasRenderingContext2D, k: number) {
  const s = S(); const p = s.project;
  // null nesneleri (AE): görünmez kontrol katmanları — ince çerçeve + artı işareti
  for (const n of activeClips(p, s.time).filter(q => q.kind === 'null')) {
    const b = clipBounds(p, n, s.time); const cx = (b.cx + p.settings.width / 2) * k, cy = (b.cy + p.settings.height / 2) * k, r = (b.w / 2) * k;
    x.save(); x.translate(cx, cy); x.rotate((b.rot * Math.PI) / 180); x.strokeStyle = '#ffcc4d'; x.lineWidth = 1; x.setLineDash([4, 3]); x.strokeRect(-r, -r, r * 2, r * 2); x.setLineDash([]);
    x.beginPath(); x.moveTo(-8, 0); x.lineTo(8, 0); x.moveTo(0, -8); x.lineTo(0, 8); x.stroke(); x.fillStyle = '#ffcc4d'; x.font = '10px Inter'; x.fillText(n.name, -r, -r - 4); x.restore();
  } const c = p.clips.find(q => q.id === s.selected[0]);
  if (!c || s.time < c.start || s.time > c.start + c.duration || p.tracks.find(t => t.id === c.trackId)?.kind !== 'video') return;
  const b = clipBounds(p, c, s.time); const W = x.canvas.width, H = x.canvas.height;
  const pts = corners(b).map(q => ({ x: (q.x + p.settings.width / 2) * k, y: (q.y + p.settings.height / 2) * k }));
  x.save(); x.strokeStyle = '#ff4d6d'; x.lineWidth = 1.5; x.setLineDash([]);
  x.beginPath(); pts.forEach((q, i) => (i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y))); x.closePath(); x.stroke();
  x.fillStyle = '#fff'; pts.forEach(q => { x.fillRect(q.x - 5, q.y - 5, 10, 10); x.strokeRect(q.x - 5, q.y - 5, 10, 10); });
  x.strokeStyle = '#3ddc97'; x.setLineDash([5, 5]);
  if (guide.x) { x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke(); }
  if (guide.y) { x.beginPath(); x.moveTo(0, H / 2); x.lineTo(W, H / 2); x.stroke(); }
  x.restore();
}

function drawBrushCursor(x: CanvasRenderingContext2D, k: number) {
  if (!cursor) return; const s = S(); const p = s.project; const r = (s.brush.size / 2) * k;
  const cx = (cursor.x + p.settings.width / 2) * k, cy = (cursor.y + p.settings.height / 2) * k;
  x.save(); x.lineWidth = 1.5; x.strokeStyle = '#000'; x.beginPath(); x.arc(cx, cy, r + 1, 0, 7); x.stroke(); x.strokeStyle = '#fff'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); x.restore();
}
function ImageBar({ q, setQ, scopes, setScopes }: { q: number; setQ: (n: number) => void; scopes: boolean; setScopes: (b: boolean) => void }) {
  const st = useS(s => s.project.settings); const safe = st.safeArea;
  return (
    <div className="transport">
      <span className="chip">🖼 Görsel belge · {st.width}×{st.height}</span>
      <span className="sp" />
      <button className={'ghost sm ' + (safe ? 'on' : '')} onClick={() => S().set(d => { d.settings.safeArea = !d.settings.safeArea; })}>Kılavuz</button>
      <button className={'ghost sm ' + (scopes ? 'on' : '')} onClick={() => setScopes(!scopes)} title="Histogram / dalga formu / vektörskop">📊 Skoplar</button>
      <label>Önizleme</label>
      <select value={q} onChange={e => setQ(Number(e.target.value))}><option value={0.25}>Düşük</option><option value={0.5}>Orta</option><option value={1}>Tam</option></select>
    </div>
  );
}

function drawSafe(x: CanvasRenderingContext2D, w: number, h: number) {
  x.save(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.setLineDash([6, 6]); x.lineWidth = 1;
  x.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9); x.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
  x.beginPath(); x.moveTo(w / 2 - 10, h / 2); x.lineTo(w / 2 + 10, h / 2); x.moveTo(w / 2, h / 2 - 10); x.lineTo(w / 2, h / 2 + 10); x.stroke(); x.restore();
}

function Transport({ q, setQ, lvl, scopes, setScopes }: { q: number; setQ: (n: number) => void; lvl: number; scopes: boolean; setScopes: (b: boolean) => void }) {
  const time = useS(s => s.time), playing = useS(s => s.playing), fps = useS(s => s.project.settings.fps), loop = useS(s => s.loop);
  const dur = useS(s => projectDuration(s.project)); const safe = useS(s => s.project.settings.safeArea); const tool = useS(s => s.tool);
  return (
    <div className="transport">
      <button className="ghost" title="Başa (Home)" onClick={() => seek(0)}>⏮</button>
      <button className="ghost" title="1 kare geri (←)" onClick={() => seek(time - 1 / fps)}>◀︎</button>
      <button className="pri" style={{ minWidth: 44 }} title="Oynat/Durdur (Space)" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
      <button className="ghost" title="1 kare ileri (→)" onClick={() => seek(time + 1 / fps)}>▶︎</button>
      <button className="ghost" title="Sona (End)" onClick={() => seek(dur)}>⏭</button>
      <button className={'ghost ' + (loop ? 'on' : '')} title="Döngü" onClick={() => S().ui({ loop: !loop })}>⟳</button>
      <span className="tc">{fmtTime(time, fps)}</span><span className="dim mono">/ {fmtTime(dur, fps)}</span>
      <div className="meter" title="Ses seviyesi"><i style={{ width: `${Math.min(100, lvl * 100)}%` }} /></div>
      <span className="sp" />
      <button className={'ghost sm ' + (tool === 'pen' ? 'on' : '')} title="Kalem aracı (G): seçili katmana bezier maske çiz" onClick={() => S().ui({ tool: tool === 'pen' ? 'select' : 'pen' })}>🖊 Kalem</button>
      <button className={'ghost sm ' + (safe ? 'on' : '')} onClick={() => S().set(d => { d.settings.safeArea = !d.settings.safeArea; })}>Güvenli alan</button>
      <button className={'ghost sm ' + (scopes ? 'on' : '')} onClick={() => setScopes(!scopes)} title="Histogram / dalga formu / vektörskop">📊 Skoplar</button>
      <label>Önizleme</label>
      <select value={q} onChange={e => setQ(Number(e.target.value))}>
        <option value={0.25}>Düşük</option><option value={0.5}>Orta</option><option value={1}>Tam</option>
      </select>
    </div>
  );
}
