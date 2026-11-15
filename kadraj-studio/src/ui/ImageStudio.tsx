// GÖRSEL STÜDYO — katmanlı görsel düzenleyici (Photoshop tarafı). Video motorunun tüm efektleri katmanlarda da çalışır.
import { useEffect, useState } from 'react';
import { useS, S } from '../store';
import type { Project } from '../types';
import { newImageProject, download } from '../util';
import { listProjects } from '../db';
import { ensureRuntime, getRuntime } from '../engine/media';
import { BG_MODELS, addAdjustmentLayer, addPaintLayer, deleteLayer, duplicateLayer, flattenImage, moveLayer, removeBackground } from '../actions';
import { renderFrame } from '../engine/render';
import { pause } from '../engine/playback';
import { copySelectionToLayer, fillSelection, setSelection } from '../engine/pixels';

export const CANVAS_PRESETS: [string, number, number][] = [
  ['Instagram gönderi 1:1', 1080, 1080], ['Instagram 4:5', 1080, 1350], ['Story / Reels kapağı 9:16', 1080, 1920], ['YouTube küçük resim', 1280, 720],
  ['Full HD 16:9', 1920, 1080], ['4K 16:9', 3840, 2160], ['Afiş A4 (300 dpi)', 2480, 3508], ['Twitter/X başlık', 1500, 500], ['Logo 1024²', 1024, 1024],
];

export function ImageStart() {
  const [w, setW] = useState(1080); const [h, setH] = useState(1080); const [bg, setBg] = useState('#ffffff'); const [name, setName] = useState('Yeni görsel');
  const [recent, setRecent] = useState<Project[]>([]);
  useEffect(() => { listProjects().then(l => setRecent(l.filter(p => p.mode === 'image').sort((a, b) => b.updated - a.updated).slice(0, 12))); }, []);
  const create = (W = w, H = h, n = name) => { pause(); S().replace(newImageProject(n, W, H, bg)); S().ui({ panel: 'editor', selected: [], time: 0, tool: 'select' }); };
  const open = async (p: Project) => { await Promise.all(p.assets.map(ensureRuntime)); S().replace(p); S().ui({ panel: 'editor', time: 0 }); };
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 6 }}><h2>🖼 Görsel Stüdyo</h2><span className="chip">Katmanlar · fırça · maske · AI dekupe · LUT · tüm efektler</span></div>
      <p className="muted" style={{ maxWidth: 820 }}>Kapak görseli, küçük resim, afiş, sosyal medya postu… Videodaki her efekt, renk düzenleme, yeşil perde, maske ve tipografi burada katman olarak çalışır.</p>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="card col">
          <h3>Yeni tuval</h3>
          <div className="grid3">{CANVAS_PRESETS.map(([l, W, H]) => <button key={l} style={{ whiteSpace: 'normal', textAlign: 'left' }} onClick={() => create(W, H, l)}><b>{l}</b><br /><span className="small dim">{W}×{H}</span></button>)}</div>
          <h4 style={{ marginTop: 8 }}>Özel boyut</h4>
          <div className="row wrap"><input value={name} onChange={e => setName(e.target.value)} style={{ width: 180 }} />
            <input type="number" value={w} onChange={e => setW(Math.max(16, Number(e.target.value)))} style={{ width: 90 }} />×<input type="number" value={h} onChange={e => setH(Math.max(16, Number(e.target.value)))} style={{ width: 90 }} />
            <label>Zemin</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} /><button className="pri" onClick={() => create()}>Oluştur</button></div>
        </div>
        <div className="card col"><h3>Son görseller</h3>
          {!recent.length && <span className="dim small">Henüz görsel belge yok.</span>}
          <div className="grid3">{recent.map(p => <button key={p.id} style={{ whiteSpace: 'normal', textAlign: 'left' }} onClick={() => open(p)}><b>{p.name}</b><br /><span className="small dim">{p.settings.width}×{p.settings.height} · {p.tracks.length} katman</span></button>)}</div>
        </div>
      </div>
    </div>
  );
}

export function LayersPanel() {
  const p = useS(s => s.project); const sel = useS(s => s.selected); const tool = useS(s => s.tool); const brush = useS(s => s.brush);
  const [bgModel, setBgModel] = useState(BG_MODELS[0].id); const [status, setStatus] = useState(''); const [fmt, setFmt] = useState<'png' | 'jpeg' | 'webp'>('png'); const [qual, setQual] = useState(0.92); const [scale, setScale] = useState(1);
  const layers = p.tracks.filter(t => t.kind === 'video');
  const exportImg = async () => {
    const W = Math.round(p.settings.width * scale), H = Math.round(p.settings.height * scale); const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    renderFrame(cv.getContext('2d')!, p, 0, scale);
    const b = await new Promise<Blob>(r => cv.toBlob(x => r(x!), `image/${fmt}`, qual)); download(b, `${p.name || 'gorsel'}.${fmt === 'jpeg' ? 'jpg' : fmt}`);
    S().notify(`Dışa aktarıldı · ${W}×${H} · ${(b.size / 1024).toFixed(0)} KB`);
  };
  return (
    <div className="ed-tl">
      <div className="tl-tools wrap">
        {([['select', '➤ Taşı (V)'], ['marquee', '⬚ Dikdörtgen (M)'], ['ellipse', '◯ Elips'], ['lasso', '➰ Kement (L)'], ['pen', '🖊 Kalem maske (G)'], ['brush', '🖌 Fırça (B)'], ['eraser', '🧽 Silgi (E)']] as const).map(([k, l]) => <button key={k} className={'sm ' + (tool === k ? 'on' : '')} onClick={() => S().ui({ tool: k })}>{l}</button>)}
        {tool !== 'select' && tool !== 'pen' && <>
          {tool === 'brush' && <input type="color" value={brush.color} onChange={e => S().ui({ brush: { ...brush, color: e.target.value } })} />}
          <label>Boyut</label><input type="range" min={1} max={400} value={brush.size} onChange={e => S().ui({ brush: { ...brush, size: Number(e.target.value) } })} style={{ width: 90 }} /><span className="mono small">{brush.size}</span>
          <label>Sertlik</label><input type="range" min={0} max={1} step={0.01} value={brush.hardness} onChange={e => S().ui({ brush: { ...brush, hardness: Number(e.target.value) } })} style={{ width: 70 }} />
          <label>Opaklık</label><input type="range" min={0.02} max={1} step={0.01} value={brush.opacity} onChange={e => S().ui({ brush: { ...brush, opacity: Number(e.target.value) } })} style={{ width: 70 }} />
        </>}
        <span className="dim">|</span>
        {['marquee', 'ellipse', 'lasso'].includes(tool) && <>
          <button className="sm" onClick={() => copySelectionToLayer(false)} title="Ctrl+J">⧉ Kopyala → katman</button>
          <button className="sm" onClick={() => copySelectionToLayer(true)} title="Ctrl+Shift+J">✂ Kes → katman</button>
          <button className="sm" onClick={() => fillSelection(false)}>▣ Doldur</button>
          <button className="sm" onClick={() => fillSelection(true)} title="Delete">⌫ Sil</button>
          <button className="sm" onClick={() => { setSelection(null); }}>Seçimi kaldır</button></>}
        <span className="dim">|</span>
        <button className="sm" onClick={() => addPaintLayer()}>+ Boş katman</button>
        <button className="sm" onClick={() => addAdjustmentLayer()}>◐ Ayar katmanı</button>
        <select className="sm" value={bgModel} onChange={e => setBgModel(e.target.value)} style={{ maxWidth: 170 }}>{BG_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
        <button className="sm" onClick={async () => { try { await removeBackground(bgModel, setStatus); } catch (e) { setStatus('⚠ ' + (e as Error).message + ' — model ilk seferde internetten indirilir'); } }}>✂ AI arka plan sil</button>
        <button className="sm" onClick={flattenImage}>⧉ Birleştir</button>
        <span className="sp" />
        <select className="sm" value={fmt} onChange={e => setFmt(e.target.value as any)}><option value="png">PNG</option><option value="jpeg">JPG</option><option value="webp">WebP</option></select>
        {fmt !== 'png' && <input type="number" min={0.3} max={1} step={0.01} value={qual} onChange={e => setQual(Number(e.target.value))} style={{ width: 60 }} title="Kalite" />}
        <select className="sm" value={scale} onChange={e => setScale(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
        <button className="sm pri" onClick={exportImg}>⬇ Dışa aktar</button>
      </div>
      {status && <div className="small" style={{ padding: '4px 10px', color: status.startsWith('⚠') ? 'var(--acc)' : 'var(--mute)' }}>{status}</div>}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {layers.map((t, i) => {
          const c = p.clips.find(k => k.trackId === t.id); const on = c && sel.includes(c.id);
          const thumb = c?.assetId ? getRuntime(c.assetId)?.thumb : undefined;
          return (
            <div key={t.id} className="row" style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', background: on ? 'var(--panel2)' : undefined, cursor: 'pointer', opacity: t.hidden ? 0.5 : 1 }} onClick={() => c && S().ui({ selected: [c.id] })}>
              <button className="ghost sm" title="Göster/gizle" onClick={e => { e.stopPropagation(); S().set(d => { const x = d.tracks.find(k => k.id === t.id)!; x.hidden = !x.hidden; }); }}>{t.hidden ? '◌' : '👁'}</button>
              <div style={{ width: 56, height: 36, borderRadius: 4, border: '1px solid var(--line2)', background: thumb ? `url(${thumb}) center/contain no-repeat, repeating-conic-gradient(#333 0 25%, #222 0 50%) 0 0/12px 12px` : c?.kind === 'solid' ? c.color : c?.kind === 'gradient' ? `linear-gradient(135deg,${c.color},${c.color2})` : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{c?.kind === 'text' ? '𝐓' : c?.kind === 'shape' ? '▭' : ''}</div>
              <input value={t.name} onClick={e => e.stopPropagation()} onChange={e => S().set(d => { d.tracks.find(k => k.id === t.id)!.name = e.target.value; }, true)} style={{ width: 160, background: 'transparent', borderColor: 'transparent' }} />
              {c && <><label className="small">Opaklık</label><input type="range" min={0} max={1} step={0.01} value={c.base.opacity} onClick={e => e.stopPropagation()} onChange={e => S().set(d => { d.clips.find(k => k.id === c.id)!.base.opacity = Number(e.target.value); }, true)} style={{ width: 90 }} />
                <select className="sm" value={c.blend} onClick={e => e.stopPropagation()} onChange={e => S().set(d => { d.clips.find(k => k.id === c.id)!.blend = e.target.value as GlobalCompositeOperation; })}>{['source-over', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'].map(b => <option key={b}>{b}</option>)}</select>
                {c.effects.length > 0 && <span className="chip">fx {c.effects.length}</span>}</>}
              <span className="sp" />
              <button className="ghost sm" title="Yukarı" disabled={i === 0} onClick={e => { e.stopPropagation(); moveLayer(t.id, -1); }}>↑</button>
              <button className="ghost sm" title="Aşağı" disabled={i === layers.length - 1} onClick={e => { e.stopPropagation(); moveLayer(t.id, 1); }}>↓</button>
              <button className="ghost sm" title="Çoğalt" onClick={e => { e.stopPropagation(); duplicateLayer(t.id); }}>⧉</button>
              <button className={'ghost sm ' + (t.locked ? 'on' : '')} title="Kilitle" onClick={e => { e.stopPropagation(); S().set(d => { const x = d.tracks.find(k => k.id === t.id)!; x.locked = !x.locked; }); }}>{t.locked ? '🔒' : '🔓'}</button>
              <button className="ghost sm" title="Sil" onClick={e => { e.stopPropagation(); deleteLayer(t.id); }}>✕</button>
            </div>);
        })}
      </div>
    </div>
  );
}
