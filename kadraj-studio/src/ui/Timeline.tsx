import { useEffect, useRef } from 'react';
import { useS, S } from '../store';
import type { Clip, Project } from '../types';
import { getRuntime } from '../engine/media';
import { seek } from '../engine/playback';
import { addNullObject, addTrack, applyMotion, cutSilences, deleteSelected, duplicateSelected, freezeFrame, placeAsset, splitSelected } from '../actions';
import { clamp, projectDuration } from '../util';
import { MOTION_PRESETS } from '../engine/presets';

const ROW = 46;

export function Timeline() {
  const p = useS(s => s.project); const pps = useS(s => s.pxPerSec); const time = useS(s => s.time);
  const sel = useS(s => s.selected); const snap = useS(s => s.snap);
  const scroll = useRef<HTMLDivElement>(null); const heads = useRef<HTMLDivElement>(null);
  const dur = Math.max(30, projectDuration(p) + 10);
  const width = dur * pps;

  // oynatırken playhead'i takip et
  useEffect(() => {
    const sc = scroll.current; if (!sc || !S().playing) return;
    const x = time * pps; if (x > sc.scrollLeft + sc.clientWidth - 60) sc.scrollLeft = x - 120;
  }, [time, pps]);

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); S().ui({ pxPerSec: clamp(pps * (e.deltaY < 0 ? 1.15 : 0.87), 8, 600) }); }
  };
  const xToTime = (clientX: number) => { const sc = scroll.current!; const r = sc.getBoundingClientRect(); return Math.max(0, (clientX - r.left + sc.scrollLeft) / pps); };

  const rulerDown = (e: React.PointerEvent) => {
    seek(xToTime(e.clientX));
    const mv = (ev: PointerEvent) => seek(xToTime(ev.clientX)); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };

  const snapPoints = (exclude: string[]) => {
    const pts = [0, S().time, ...p.markers.map(m => m.t)];
    p.clips.forEach(c => { if (!exclude.includes(c.id)) pts.push(c.start, c.start + c.duration); });
    return pts;
  };
  const snapT = (t: number, pts: number[]) => { if (!S().snap) return t; const th = 8 / pps; let best = t, bd = th; for (const q of pts) { const d = Math.abs(q - t); if (d < bd) { bd = d; best = q; } } return best; };

  const clipDown = (e: React.PointerEvent, c: Clip, mode: 'move' | 'l' | 'r') => {
    e.stopPropagation(); if (e.button !== 0) return;
    const st = S(); const tr = st.project.tracks.find(t => t.id === c.trackId); if (tr?.locked) return;
    let ids = st.selected.includes(c.id) ? st.selected : [c.id];
    if (e.shiftKey) ids = st.selected.includes(c.id) ? st.selected.filter(i => i !== c.id) : [...st.selected, c.id];
    st.ui({ selected: ids });
    const x0 = e.clientX, y0 = e.clientY;
    const orig = new Map(st.project.clips.filter(k => ids.includes(k.id)).map(k => [k.id, { ...k }]));
    const pts = snapPoints(ids);
    const tracks = st.project.tracks;
    const tIdx0 = tracks.findIndex(t => t.id === c.trackId);
    let moved = false;
    const mv = (ev: PointerEvent) => {
      const dt = (ev.clientX - x0) / pps; if (!moved && Math.abs(ev.clientX - x0) < 3 && Math.abs(ev.clientY - y0) < 3) return; moved = true;
      const dRow = Math.round((ev.clientY - y0) / ROW);
      S().set(d => {
        for (const k of d.clips) {
          const o = orig.get(k.id); if (!o) continue;
          const a = getRuntime(o.assetId); const srcDur = a?.video?.duration ?? a?.audio?.duration ?? Infinity;
          const isImg = !!a?.img || o.kind !== 'media';
          if (mode === 'move') {
            let ns = Math.max(0, o.start + dt);
            const sa = snapT(ns, pts), sb = snapT(ns + o.duration, pts) - o.duration;
            ns = Math.abs(sa - ns) <= Math.abs(sb - ns) ? sa : sb; k.start = Math.max(0, ns);
            if (k.id === c.id && dRow) {
              const ti = clamp(tIdx0 + dRow, 0, tracks.length - 1); const nt = tracks[ti];
              const kind = tracks[tIdx0].kind; if (nt.kind === kind && !nt.locked) k.trackId = nt.id;
            }
          } else if (mode === 'l') {
            let ns = snapT(o.start + dt, pts); ns = clamp(ns, isImg ? 0 : Math.max(0, o.start - o.in / o.speed), o.start + o.duration - 0.1);
            const delta = ns - o.start; k.start = ns; k.duration = o.duration - delta; if (!isImg) k.in = Math.max(0, o.in + delta * o.speed);
          } else {
            let ne = snapT(o.start + o.duration + dt, pts); const maxEnd = isImg ? Infinity : o.start + (srcDur - o.in) / o.speed;
            ne = clamp(ne, o.start + 0.1, maxEnd); k.duration = ne - o.start;
          }
        }
      }, true);
    };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };

  const onDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault(); const id = e.dataTransfer.getData('asset'); const a = S().project.assets.find(x => x.id === id); if (!a) return;
    placeAsset(a, trackId, snapT(xToTime(e.clientX), snapPoints([])));
  };

  const ticks = []; const step = pps > 200 ? 0.5 : pps > 80 ? 1 : pps > 30 ? 2 : pps > 15 ? 5 : 10;
  for (let t = 0; t <= dur; t += step) ticks.push(t);

  return (
    <div className="ed-tl">
      <div className="tl-tools">
        <button className="sm" title="Böl (S)" onClick={splitSelected} disabled={!sel.length}>✂ Böl</button>
        <button className="sm" title="Sil (Del)" onClick={() => deleteSelected()} disabled={!sel.length}>🗑 Sil</button>
        <button className="sm" title="Boşluk kapatarak sil (Shift+Del)" onClick={() => deleteSelected(true)} disabled={!sel.length}>⇤ Ripple sil</button>
        <button className="sm" title="Çoğalt (Ctrl+D)" onClick={duplicateSelected} disabled={!sel.length}>⧉ Çoğalt</button>
        <select className="sm" value="" disabled={!sel.length} onChange={e => { applyMotion(e.target.value); e.target.value = ''; }}>
          <option value="">✦ Hareket preseti…</option>
          {Object.entries(MOTION_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="sm" title="Seçili sesli klipteki sessiz bölümleri kesip birleştirir" onClick={() => cutSilences()} disabled={!sel.length}>🔇 Sessizlik kes</button>
        <button className="sm" title="Playhead'deki kareyi 2 sn dondurur" onClick={() => freezeFrame(2)} disabled={!sel.length}>🧊 Dondur</button>
        <button className="sm" title="İşaretçi ekle (M)" onClick={() => S().set(d => { d.markers.push({ t: S().time, label: 'M' + (d.markers.length + 1) }); })}>⚑ İşaret</button>
        <button className="sm" title="Keyframe eğrileri (After Effects Graph Editor)" onClick={() => S().ui({ graph: true })}>📈 Grafik editörü</button>
        <button className="sm" title="Görünmez kontrol katmanı (parenting için)" onClick={() => addNullObject()}>⊕ Null</button>
        <span className="sp" />
        <button className={'sm ' + (snap ? 'on' : '')} onClick={() => S().ui({ snap: !snap })}>🧲 Yapış</button>
        <button className="sm" onClick={() => addTrack('video')}>+ Video izi</button>
        <button className="sm" onClick={() => addTrack('audio')}>+ Ses izi</button>
        <label>Zoom</label><input type="range" min={8} max={600} value={pps} onChange={e => S().ui({ pxPerSec: Number(e.target.value) })} style={{ width: 120 }} />
      </div>
      <div className="tl-body">
        <div className="tl-heads" ref={heads}>
          <div style={{ height: 24, borderBottom: '1px solid var(--line)' }} />
          {p.tracks.map(t => (
            <div key={t.id} className="tl-head" style={{ background: t.kind === 'audio' ? '#101015' : undefined }}>
              <span className="nm" title={t.name}>{t.kind === 'video' ? '🎞' : '🔊'} {t.name}</span>
              <button className={'ghost ' + (t.muted ? 'on' : '')} title="Sessiz" onClick={() => S().set(d => { const x = d.tracks.find(k => k.id === t.id)!; x.muted = !x.muted; })}>M</button>
              {t.kind === 'video' && <button className={'ghost ' + (t.hidden ? 'on' : '')} title="Gizle" onClick={() => S().set(d => { const x = d.tracks.find(k => k.id === t.id)!; x.hidden = !x.hidden; })}>{t.hidden ? '◌' : '◉'}</button>}
              <button className={'ghost ' + (t.locked ? 'on' : '')} title="Kilitle" onClick={() => S().set(d => { const x = d.tracks.find(k => k.id === t.id)!; x.locked = !x.locked; })}>{t.locked ? '🔒' : '🔓'}</button>
            </div>
          ))}
        </div>
        <div className="tl-scroll" ref={scroll} onWheel={onWheel} onScroll={e => { if (heads.current) heads.current.scrollTop = (e.target as HTMLDivElement).scrollTop; }}
          onPointerDown={e => { if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('tl-row')) S().ui({ selected: [] }); }}>
          <div style={{ width, position: 'relative', minHeight: '100%' }}>
            <div className="ruler" onPointerDown={rulerDown}>
              {ticks.map(t => <div key={t} style={{ position: 'absolute', left: t * pps, top: 0, height: Number.isInteger(t / (step * 2)) ? 24 : 10, borderLeft: '1px solid #3a3a4a', fontSize: 10, paddingLeft: 3, color: 'var(--dim)' }}>{Number.isInteger(t / (step * 2)) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : ''}</div>)}
              {p.markers.map((m, i) => <div key={i} className="marker" style={{ left: m.t * pps }} title={m.label} onDoubleClick={() => S().set(d => { d.markers.splice(i, 1); })} />)}
            </div>
            {p.tracks.map(t => (
              <div key={t.id} className={'tl-row ' + t.kind} style={{ opacity: t.hidden ? 0.4 : 1 }} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, t.id)}>
                {p.clips.filter(c => c.trackId === t.id).map(c => <ClipView key={c.id} c={c} p={p} pps={pps} sel={sel.includes(c.id)} onDown={clipDown} />)}
              </div>
            ))}
            <div className="playhead" style={{ left: time * pps }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipView({ c, p, pps, sel, onDown }: { c: Clip; p: Project; pps: number; sel: boolean; onDown: (e: React.PointerEvent, c: Clip, m: 'move' | 'l' | 'r') => void }) {
  const a = p.assets.find(x => x.id === c.assetId); const rt = getRuntime(c.assetId);
  const color = c.kind === 'text' ? 'var(--tclip)' : c.kind === 'media' ? (a?.kind === 'audio' ? 'var(--aclip)' : 'var(--vclip)') : 'var(--gclip)';
  const wv = useRef<HTMLCanvasElement>(null);
  const w = Math.max(4, c.duration * pps);
  useEffect(() => {
    const cv = wv.current; if (!cv || !rt?.peaks || !rt.audio) return;
    cv.width = Math.min(4000, Math.ceil(w)); cv.height = 38; const x = cv.getContext('2d')!; x.clearRect(0, 0, cv.width, cv.height);
    x.fillStyle = 'rgba(255,255,255,.55)'; const pk = rt.peaks, total = rt.audio.duration;
    for (let i = 0; i < cv.width; i++) { const st = c.in + (i / cv.width) * c.duration * c.speed; const idx = Math.floor((st / total) * pk.length); const v = (pk[idx] ?? 0) * c.volume; const h = Math.max(1, v * 34); x.fillRect(i, 19 - h / 2, 1, h); }
  }, [w, c.in, c.duration, c.speed, c.volume, rt?.peaks]);
  const label = c.kind === 'text' ? '𝐓 ' + (c.text?.text ?? '') : c.kind === 'adjust' ? '◐ ' + c.name + ` (${c.effects.length} fx)` : c.name;
  const showWave = a?.kind === 'audio' || (a?.kind === 'video' && !!rt?.audio);
  return (
    <div className={'clip ' + (sel ? 'sel' : '') + (c.kind === 'adjust' ? ' adj' : '')} style={{ left: c.start * pps, width: w, background: c.kind === 'gradient' ? `linear-gradient(90deg,${c.color},${c.color2})` : c.kind === 'solid' ? c.color : color, opacity: c.muted ? 0.5 : 1 }}
      onPointerDown={e => onDown(e, c, 'move')} onDoubleClick={() => seek(c.start)}>
      {rt?.thumb && a?.kind !== 'audio' && <div className="thumbs" style={{ backgroundImage: `url(${rt.thumb})` }} />}
      {showWave && <canvas ref={wv} className="wave" style={a?.kind === 'video' ? { top: '55%', height: '45%', opacity: 0.7 } : undefined} />}
      {c.tIn.type !== 'none' && <div className="tr" style={{ left: 0, width: c.tIn.d * pps }} />}
      {c.tOut.type !== 'none' && <div className="tr o" style={{ right: 0, width: c.tOut.d * pps }} />}
      <span className="lbl">{label}</span>
      {[...new Set(Object.values(c.kf).flatMap(l => (l ?? []).map(f => +f.t.toFixed(3))))].map(t => <i key={t} className="kfd" style={{ left: t * pps - 4 }} onPointerDown={e => { e.stopPropagation(); seek(c.start + t); }} title={`Keyframe ${t.toFixed(2)}s`} />)}
      <div className="h l" onPointerDown={e => onDown(e, c, 'l')} />
      <div className="h r" onPointerDown={e => onDown(e, c, 'r')} />
    </div>
  );
}
