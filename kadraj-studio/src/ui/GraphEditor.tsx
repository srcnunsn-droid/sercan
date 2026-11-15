// GRAFİK EDİTÖRÜ (After Effects Graph Editor): değer eğrisi, sürüklenebilir keyframe'ler, bezier tutamaçları, Easy Ease
import { useEffect, useRef, useState } from 'react';
import { useS, S } from '../store';
import type { AnimProp, Clip, Keyframe } from '../types';
import { BEZIER_PRESETS, transformAt } from '../engine/interp';
import { seek } from '../engine/playback';

const PROPS: [AnimProp, string, string][] = [['x', 'Konum X', '#ff5f6d'], ['y', 'Konum Y', '#3ddc97'], ['scale', 'Ölçek', '#5ab0ff'], ['rotation', 'Dönüş', '#ffcc4d'], ['opacity', 'Opaklık', '#c78bff'], ['blur', 'Bulanıklık', '#7fe3ff']];
const PAD = { l: 52, r: 16, t: 14, b: 26 };

export function GraphEditor() {
  const c = useS(s => s.project.clips.find(k => k.id === s.selected[0])); const time = useS(s => s.time);
  const [prop, setProp] = useState<AnimProp>('x'); const [sel, setSel] = useState(-1);
  const cv = useRef<HTMLCanvasElement>(null); const box = useRef<HTMLDivElement>(null); const [size, setSize] = useState({ w: 800, h: 220 });
  useEffect(() => { const ro = new ResizeObserver(e => { const r = e[0].contentRect; setSize({ w: Math.max(200, r.width), h: Math.max(120, r.height) }); }); if (box.current) ro.observe(box.current); return () => ro.disconnect(); }, []);
  useEffect(() => { if (c && !c.kf[prop]?.length && !c.expr?.[prop]) { const first = PROPS.find(([k]) => c.kf[k]?.length || c.expr?.[k]); if (first) setProp(first[0]); } setSel(-1); }, [c?.id]);

  const kfs: Keyframe[] = c?.kf[prop] ?? [];
  // görünüm aralığı
  const dur = c?.duration ?? 1;
  const samples: number[] = []; if (c) for (let i = 0; i <= 240; i++) samples.push(transformAt(c, (i / 240) * dur)[prop]);
  const vals = [...samples, ...kfs.map(k => k.v)]; let vmin = Math.min(...vals), vmax = Math.max(...vals);
  if (vmax - vmin < 1e-6) { vmin -= 1; vmax += 1; } const vp = (vmax - vmin) * 0.12; vmin -= vp; vmax += vp;
  const W = size.w, H = size.h, iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const X = (t: number) => PAD.l + (t / dur) * iw, Y = (v: number) => PAD.t + (1 - (v - vmin) / (vmax - vmin)) * ih;
  const T = (px: number) => ((px - PAD.l) / iw) * dur, V = (py: number) => vmin + (1 - (py - PAD.t) / ih) * (vmax - vmin);

  const handles = (i: number) => {
    const out: { kind: 'in' | 'out'; seg: number; x: number; y: number }[] = []; if (i < 0) return out;
    const seg = (j: number) => { const a = kfs[j], b = kfs[j + 1]; const bz = b.b ?? [0.33, 0, 0.67, 1]; return { a, b, bz, dt: b.t - a.t, dv: b.v - a.v }; };
    if (i > 0) { const g = seg(i - 1); out.push({ kind: 'in', seg: i - 1, x: X(g.a.t + g.bz[2] * g.dt), y: Y(g.a.v + g.bz[3] * g.dv) }); }
    if (i < kfs.length - 1) { const g = seg(i); out.push({ kind: 'out', seg: i, x: X(g.a.t + g.bz[0] * g.dt), y: Y(g.a.v + g.bz[1] * g.dv) }); }
    return out;
  };

  useEffect(() => {
    const el = cv.current; if (!el) return; const dpr = window.devicePixelRatio || 1; el.width = W * dpr; el.height = H * dpr;
    const x = el.getContext('2d')!; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#0d0d12'; x.fillRect(0, 0, W, H);
    x.font = '10px JetBrains Mono'; x.fillStyle = '#6c6c7e'; x.strokeStyle = '#ffffff10';
    for (let g = 0; g <= 4; g++) { const v = vmin + ((vmax - vmin) * g) / 4, y = Y(v); x.beginPath(); x.moveTo(PAD.l, y); x.lineTo(W - PAD.r, y); x.stroke(); x.fillText(v.toFixed(Math.abs(vmax - vmin) < 5 ? 2 : 0), 4, y + 3); }
    const step = dur > 10 ? 2 : dur > 4 ? 1 : 0.25; for (let t = 0; t <= dur + 1e-6; t += step) { const px = X(t); x.beginPath(); x.moveTo(px, PAD.t); x.lineTo(px, H - PAD.b); x.stroke(); x.fillText(t.toFixed(step < 1 ? 2 : 0) + 's', px - 8, H - 8); }
    if (!c) { x.fillStyle = '#9a9aab'; x.font = '13px Inter'; x.fillText('Grafik editörü için timeline’dan bir klip seç', PAD.l + 10, H / 2); return; }
    const col = PROPS.find(p => p[0] === prop)![2];
    // eğri (expression dahil gerçek değer)
    x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); samples.forEach((v, i) => { const px = X((i / 240) * dur), py = Y(v); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
    if (c.expr?.[prop]) { x.fillStyle = col; x.font = 'italic 11px JetBrains Mono'; x.fillText('ƒ ' + c.expr[prop], PAD.l + 6, PAD.t + 12); }
    // bezier tutamaçları
    for (const h of handles(sel)) { const k = h.kind === 'in' ? kfs[sel] : kfs[sel]; x.strokeStyle = '#ffffff70'; x.lineWidth = 1; x.beginPath(); x.moveTo(X(k.t), Y(k.v)); x.lineTo(h.x, h.y); x.stroke(); x.fillStyle = '#ffcc4d'; x.beginPath(); x.arc(h.x, h.y, 4.5, 0, 7); x.fill(); }
    // keyframe'ler
    kfs.forEach((k, i) => { const px = X(k.t), py = Y(k.v); x.save(); x.translate(px, py); x.rotate(Math.PI / 4); x.fillStyle = i === sel ? '#ffcc4d' : '#fff'; x.fillRect(-4.5, -4.5, 9, 9); x.strokeStyle = '#000'; x.strokeRect(-4.5, -4.5, 9, 9); x.restore(); });
    // playhead
    const lt = time - c.start; if (lt >= 0 && lt <= dur) { x.strokeStyle = '#ff4d6d'; x.lineWidth = 1; x.beginPath(); x.moveTo(X(lt), PAD.t); x.lineTo(X(lt), H - PAD.b); x.stroke(); }
  });

  const edit = (fn: (k: Keyframe[]) => void, merge = true) => S().set(d => { const k = d.clips.find(q => q.id === c!.id); if (!k || !k.kf[prop]) return; fn(k.kf[prop] as Keyframe[]); }, merge);
  const down = (e: React.PointerEvent) => {
    if (!c) return; const r = cv.current!.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
    const hh = handles(sel).find(h => Math.hypot(h.x - mx, h.y - my) < 8);
    const hit = kfs.findIndex(k => Math.hypot(X(k.t) - mx, Y(k.v) - my) < 8);
    if (hh) {
      const seg = hh.seg; const a = kfs[seg], b = kfs[seg + 1];
      const mv = (ev: PointerEvent) => { const px = ev.clientX - r.left, py = ev.clientY - r.top; const fx = Math.min(1, Math.max(0, (T(px) - a.t) / (b.t - a.t || 1))); const fy = (V(py) - a.v) / (b.v - a.v || 1e-9);
        edit(L => { const B = L[seg + 1]; const bz = [...(B.b ?? [0.33, 0, 0.67, 1])] as [number, number, number, number]; if (hh.kind === 'out') { bz[0] = fx; bz[1] = b.v === a.v ? bz[1] : fy; } else { bz[2] = fx; bz[3] = b.v === a.v ? bz[3] : fy; } B.e = 'bezier'; B.b = bz.map(v => +v.toFixed(3)) as any; }); };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); return;
    }
    if (hit >= 0) {
      setSel(hit); seek(c.start + kfs[hit].t);
      const lo = hit > 0 ? kfs[hit - 1].t + 1 / 60 : 0, hi = hit < kfs.length - 1 ? kfs[hit + 1].t - 1 / 60 : dur;
      const mv = (ev: PointerEvent) => { const px = ev.clientX - r.left, py = ev.clientY - r.top; const nt = Math.min(hi, Math.max(lo, T(px))); const nv = V(py);
        edit(L => { L[hit].t = +(ev.shiftKey ? L[hit].t : nt).toFixed(4); L[hit].v = +nv.toFixed(prop === 'scale' || prop === 'opacity' ? 3 : 1); }); };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); return;
    }
    setSel(-1); seek(c.start + Math.min(dur, Math.max(0, T(mx))));
  };
  const dbl = (e: React.MouseEvent) => {
    if (!c) return; const r = cv.current!.getBoundingClientRect(); const t = Math.min(dur, Math.max(0, T(e.clientX - r.left)));
    const v = transformAt(c, t)[prop];
    S().set(d => { const k = d.clips.find(q => q.id === c.id)!; const L = [...(k.kf[prop] ?? [])].filter(f => Math.abs(f.t - t) > 1 / 60); L.push({ t: +t.toFixed(4), v, e: 'bezier', b: [0.33, 0, 0.67, 1] }); L.sort((a, b) => a.t - b.t); k.kf[prop] = L; }, false);
  };
  const applyPreset = (bz: [number, number, number, number]) => {
    if (!c) return;
    edit(L => { const targets = sel >= 0 ? [sel, sel + 1] : L.map((_, i) => i); for (const i of targets) if (i > 0 && i < L.length) { L[i].e = 'bezier'; L[i].b = [...bz]; } }, false);
  };
  const key = (e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel >= 0) { e.stopPropagation(); edit(L => { L.splice(sel, 1); }, false); setSel(-1); }
    if (e.key === 'F9') { e.preventDefault(); applyPreset(BEZIER_PRESETS['Easy Ease (F9)']); }
  };

  return (
    <div className="ed-tl" tabIndex={0} onKeyDown={key} style={{ outline: 'none' }}>
      <div className="tl-tools wrap">
        <button className="sm" onClick={() => S().ui({ graph: false })}>← Zaman çizelgesi</button>
        <b className="small">📈 Grafik editörü</b>{c && <span className="chip">{c.kind === 'text' ? c.text?.text.slice(0, 18) : c.name}</span>}
        {PROPS.map(([k, l, col]) => <button key={k} className={'sm ' + (prop === k ? 'on' : '')} style={{ borderColor: prop === k ? col : undefined, color: prop === k ? col : undefined }} onClick={() => { setProp(k); setSel(-1); }}>{l}{c?.kf[k]?.length ? ` ◆${c.kf[k]!.length}` : ''}{c?.expr?.[k] !== undefined ? ' ƒ' : ''}</button>)}
        <span className="sp" />
        {Object.entries(BEZIER_PRESETS).map(([l, bz]) => <button key={l} className="sm" title={`cubic-bezier(${bz.join(', ')}) — ${sel >= 0 ? 'seçili keyframe' : 'tüm segmentler'}`} onClick={() => applyPreset(bz)}>{l}</button>)}
      </div>
      <div ref={box} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <canvas ref={cv} style={{ width: size.w, height: size.h, display: 'block', cursor: 'crosshair' }} onPointerDown={down} onDoubleClick={dbl} />
        <span className="small dim" style={{ position: 'absolute', right: 12, top: 2, background: '#0d0d12cc', padding: '0 4px' }}>Çift tık: keyframe ekle · sürükle: zaman/değer (Shift: sadece değer) · sarı tutamaç: hız eğrisi · F9: Easy Ease · Del: sil</span>
      </div>
    </div>
  );
}
