// ŞABLON GALERİSİ — 400 hareketli grafik şablonu, canlı küçük resimler, üzerine gelince oynayan önizleme
import { useEffect, useMemo, useRef, useState } from 'react';
import { useS, S } from '../store';
import { CATALOG, CATEGORIES, PALETTES, defaults, insertTemplate, openAsProject, previewProject, type Tpl } from '../templates/index';
import { renderFrame } from '../engine/render';
import type { Project } from '../types';

const TW = 320;
/** Türkçe eklere dayanıklı arama: "sayaç" → "sayacı", "geçiş" → "geçişler" */
function matchQ(t: Tpl, q: string) {
  if (!q.trim()) return true; const hay = (t.design.name + ' ' + t.design.tags + ' ' + t.design.cat + ' ' + t.palette.name).toLocaleLowerCase('tr');
  return q.toLocaleLowerCase('tr').split(/\s+/).filter(Boolean).every(w => { const stem = w.length > 4 ? w.slice(0, w.length - 1) : w; return hay.includes(stem); });
}
const projCache = new Map<string, Project>();
function cachedProject(t: Tpl, W: number, H: number) {
  const k = `${t.key}:${W}x${H}`; let p = projCache.get(k); if (!p) { p = previewProject(t, W, H); projCache.set(k, p); if (projCache.size > 120) projCache.delete(projCache.keys().next().value!); } return p;
}

function Thumb({ t, W, H, onOpen }: { t: Tpl; W: number; H: number; onOpen: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null); const [vis, setVis] = useState(false); const [hover, setHover] = useState(false);
  const th = Math.round((TW * H) / W);
  useEffect(() => { const io = new IntersectionObserver(e => setVis(e[0].isIntersecting), { rootMargin: '200px' }); if (cv.current) io.observe(cv.current); return () => io.disconnect(); }, []);
  useEffect(() => {
    if (!vis || !cv.current) return; const x = cv.current.getContext('2d')!; const p = cachedProject(t, W, H);
    const tT = t.design.thumbT ?? Math.min(t.design.dur * 0.62, 2.6);
    if (!hover) { renderFrame(x, p, tT, TW / W); return; }
    let raf = 0; const t0 = performance.now(); let last = 0;
    const loop = (now: number) => { raf = requestAnimationFrame(loop); if (now - last < 40) return; last = now; renderFrame(x, p, ((now - t0) / 1000) % t.design.dur, TW / W); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [vis, hover, t.key, W, H]);
  return (
    <div className="tpl" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onOpen}>
      <canvas ref={cv} width={TW} height={th} />
      <div className="nm"><b>{t.design.name}</b><span className="dim">{t.palette.name} · {t.design.dur}s</span></div>
    </div>
  );
}

export function TemplateGallery() {
  const st = useS(s => s.project.settings);
  const [cat, setCat] = useState(''); const [pal, setPal] = useState('neon'); const [q, setQ] = useState(''); const [aspect, setAspect] = useState<'proje' | '16:9' | '9:16' | '1:1'>('proje');
  const [open, setOpen] = useState<Tpl | null>(null);
  const [W, H] = aspect === '16:9' ? [1920, 1080] : aspect === '9:16' ? [1080, 1920] : aspect === '1:1' ? [1080, 1080] : [st.width, st.height];
  const list = useMemo(() => CATALOG.filter(t => (!cat || t.design.cat === cat) && (!pal || t.palette.id === pal) && matchQ(t, q)), [cat, pal, q]);
  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <div className="row wrap" style={{ marginBottom: 10 }}>
        <h2>🎞 Hareketli Grafik Şablonları</h2><span className="chip ok">{CATALOG.length} şablon</span><span className="chip">{new Set(CATALOG.map(t => t.design.id)).size} tasarım × {PALETTES.length} palet</span>
        <span className="sp" /><input placeholder="Ara: intro, alt bant, glitch, sayaç…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 280 }} />
        <select value={aspect} onChange={e => setAspect(e.target.value as any)}><option value="proje">Proje oranı ({st.width}×{st.height})</option><option>16:9</option><option>9:16</option><option>1:1</option></select>
      </div>
      <div className="row wrap" style={{ marginBottom: 8 }}>
        <button className={'sm ' + (!cat ? 'on' : '')} onClick={() => setCat('')}>Tümü</button>
        {CATEGORIES.map(c => <button key={c} className={'sm ' + (cat === c ? 'on' : '')} onClick={() => setCat(c)}>{c} <span className="dim">{new Set(CATALOG.filter(t => t.design.cat === c).map(t => t.design.id)).size}</span></button>)}
      </div>
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <span className="small muted">Palet:</span>
        <button className={'sm ' + (!pal ? 'on' : '')} onClick={() => setPal('')}>Hepsi ({PALETTES.length}×)</button>
        {PALETTES.map(p => <button key={p.id} className={'sm ' + (pal === p.id ? 'on' : '')} onClick={() => setPal(p.id)} title={p.name}><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${p.bg2}, ${p.a} 60%, ${p.a2})`, verticalAlign: -2, marginRight: 4 }} />{p.name}</button>)}
      </div>
      <div className="tplgrid">{list.map(t => <Thumb key={t.key + W + H} t={t} W={W} H={H} onOpen={() => setOpen(t)} />)}</div>
      {!list.length && <div className="card muted">Eşleşen şablon yok.</div>}
      {open && <TemplateDialog t={open} W={W} H={H} onClose={() => setOpen(null)} onPalette={p => setOpen(CATALOG.find(x => x.key === `${open.design.id}:${p}`)!)} />}
    </div>
  );
}

function TemplateDialog({ t, W, H, onClose, onPalette }: { t: Tpl; W: number; H: number; onClose: () => void; onPalette: (p: string) => void }) {
  const [V, setV] = useState<Record<string, string>>(defaults(t.design)); const cv = useRef<HTMLCanvasElement>(null);
  const pw = 640, ph = Math.round((pw * H) / W) > 640 ? 640 : Math.round((pw * H) / W); const pwReal = Math.round((ph * W) / H);
  useEffect(() => {
    const p = previewProject(t, W, H, V); const x = cv.current!.getContext('2d')!; let raf = 0; const t0 = performance.now();
    const loop = () => { raf = requestAnimationFrame(loop); renderFrame(x, p, ((performance.now() - t0) / 1000) % t.design.dur, pwReal / W); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [t.key, JSON.stringify(V), W, H]);
  const isVideoProj = useS(s => s.project.mode !== 'image');
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onPointerDown={onClose}>
      <div className="card" style={{ display: 'flex', gap: 16, maxWidth: '94vw', maxHeight: '90vh', overflow: 'auto' }} onPointerDown={e => e.stopPropagation()}>
        <canvas ref={cv} width={pwReal} height={ph} style={{ borderRadius: 8, background: '#000', maxWidth: '60vw' }} />
        <div className="col" style={{ width: 320 }}>
          <h3>{t.design.name}</h3><span className="small muted">{t.design.cat} · {t.design.dur} sn · {W}×{H}</span>
          {t.design.fields.map(f => <div className="col" key={f.k}><label>{f.label}</label>{f.multiline ? <textarea rows={3} value={V[f.k]} onChange={e => setV({ ...V, [f.k]: e.target.value })} /> : <input value={V[f.k]} onChange={e => setV({ ...V, [f.k]: e.target.value })} />}</div>)}
          {!t.design.fields.length && <span className="small dim">Bu şablonda metin alanı yok (geçiş / arka plan).</span>}
          <label>Palet</label>
          <div className="row wrap">{PALETTES.map(p => <button key={p.id} className={'sm ' + (t.palette.id === p.id ? 'on' : '')} title={p.name} onClick={() => onPalette(p.id)} style={{ width: 30, height: 26, padding: 0, background: `linear-gradient(135deg, ${p.bg2}, ${p.a} 55%, ${p.a2})` }} />)}</div>
          <span className="sp" />
          <button className="pri" onClick={() => { insertTemplate(t, V); onClose(); if (isVideoProj) S().ui({ panel: 'editor' }); }}>＋ Playhead’e ekle</button>
          <button onClick={() => { openAsProject(t, V, W, H); onClose(); }}>Yeni projede aç</button>
          <span className="small dim">Eklenen her katman tamamen düzenlenebilir: metin, renk, keyframe, ifade, efekt.</span>
        </div>
      </div>
    </div>
  );
}
