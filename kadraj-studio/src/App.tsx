import { useEffect, useRef, useState } from 'react';
import { penKey } from './ui/penTool';
import { useS, S } from './store';
import type { Panel, Project } from './types';
import { IdeaLab } from './ui/IdeaLab';
import { Storyboard } from './ui/Storyboard';
import { AudioStudio } from './ui/AudioStudio';
import { AIEngines } from './ui/AIEngines';
import { ExportPanel } from './ui/ExportPanel';
import { Ecosystem } from './ui/Ecosystem';
import { Preview } from './ui/Preview';
import { Timeline } from './ui/Timeline';
import { Inspector } from './ui/Inspector';
import { AssetGrid, EditorLibrary, GenQuick, useImport } from './ui/Library';
import { deleteProject, kvGet, listProjects, loadProject } from './db';
import { ensureRuntime } from './engine/media';
import { pause, seek, toggle } from './engine/playback';
import { copySelected, deleteSelected, duplicateSelected, importProjectFile, paste, splitSelected } from './actions';
import { upsertKf, transformAt } from './engine/interp';
import { newProject } from './util';
import { buildDemo } from './demo';
import { CommandPalette } from './ui/CommandPalette';
import { ImageStart, LayersPanel } from './ui/ImageStudio';
import { GraphEditor } from './ui/GraphEditor';
import { TemplateGallery } from './ui/TemplateGallery';
import { copySelectionToLayer, fillSelection, getSelection, setSelection } from './engine/pixels';
import { gpuAvailable, gpuEnabled, setGpuEnabled } from './engine/gpu';

let openPalette: () => void = () => {};

const NAV: [Panel, string, string][] = [
  ['idea', '💡', 'Fikir'], ['story', '🎬', 'Storyboard'], ['media', '🗂', 'Medya'], ['editor', '✂️', 'Kurgu'], ['templates', '🎞', 'Şablonlar'], ['image', '🖼', 'Görsel'], ['audio', '🎧', 'Ses'], ['ai', '🧠', 'AI'], ['export', '📤', 'Çıktı'], ['eco', '🧭', 'Ekosistem'],
];

export function App() {
  const panel = useS(s => s.panel); const toast = useS(s => s.toast); const [pal, setPal] = useState(false); const isImage = useS(s => s.project.mode === 'image'); const graph = useS(s => s.graph);
  openPalette = () => setPal(true);
  useEffect(() => { (async () => { const id = await kvGet<string>('lastProject'); const p = id ? await loadProject(id) : undefined; if (p) { await Promise.all(p.assets.map(ensureRuntime)); S().replace(p); S().ui({ panel: p.clips.length ? 'editor' : 'idea' }); } })(); }, []);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
      const tag = (e.target as HTMLElement).tagName; if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      const s = S(); const fps = s.project.settings.fps; const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? s.redo() : s.undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); s.redo(); return; }
      if (s.panel !== 'editor') return;
      if (penKey(e)) { e.preventDefault(); return; }
      if (!mod && e.key.toLowerCase() === 'g') { s.ui({ tool: s.tool === 'pen' ? 'select' : 'pen' }); return; }
      if (!mod && s.project.mode !== 'image' && e.key.toLowerCase() === 'v') { s.ui({ tool: 'select' }); return; }
      if (!mod && s.project.mode === 'image' && ['b', 'e', 'v', 'm', 'l'].includes(e.key.toLowerCase())) { const k = e.key.toLowerCase(); s.ui({ tool: k === 'b' ? 'brush' : k === 'e' ? 'eraser' : k === 'm' ? 'marquee' : k === 'l' ? 'lasso' : 'select' }); return; }
      if (s.project.mode === 'image' && mod && e.key.toLowerCase() === 'j') { e.preventDefault(); copySelectionToLayer(e.shiftKey); return; }
      if (s.project.mode === 'image' && getSelection() && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); fillSelection(true); return; }
      if (s.project.mode === 'image' && getSelection() && e.key === 'Escape') { setSelection(null); return; }
      if (!mod && s.project.mode === 'image' && (e.key === '[' || e.key === ']')) { s.ui({ brush: { ...s.brush, size: Math.max(1, Math.min(400, Math.round(s.brush.size * (e.key === ']' ? 1.2 : 0.83)))) } }); return; }
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(s.time - (e.shiftKey ? 1 : 1 / fps)); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seek(s.time + (e.shiftKey ? 1 : 1 / fps)); }
      else if (e.key === 'Home') seek(0);
      else if (e.key.toLowerCase() === 's' && !mod) splitSelected();
      else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected(e.shiftKey);
      else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); }
      else if (mod && e.key.toLowerCase() === 'c') { copySelected(); }
      else if (mod && e.key.toLowerCase() === 'v') { paste(); }
      else if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); s.ui({ selected: s.project.clips.map(c => c.id) }); }
      else if (e.key === 'Escape') s.ui({ selected: [] });
      else if (e.key.toLowerCase() === 'm' && !mod) s.set(d => { d.markers.push({ t: s.time, label: 'M' + (d.markers.length + 1) }); });
      else if (e.key.toLowerCase() === 'k' && !mod) {
        // seçili klibe tüm dönüşüm değerleri için keyframe
        s.set(d => { for (const id of s.selected) { const c = d.clips.find(x => x.id === id); if (!c) continue; const lt = Math.min(Math.max(s.time - c.start, 0), c.duration); const T = transformAt(c as any, lt); (['x', 'y', 'scale', 'rotation', 'opacity'] as const).forEach(k => { c.kf[k] = upsertKf(c.kf[k], lt, T[k]); }); } });
        s.notify('Keyframe eklendi');
      }
    };
    window.addEventListener('keydown', kd); return () => window.removeEventListener('keydown', kd);
  }, []);
  return (
    <div className="app">
      <TopBar />
      <nav className="rail">{NAV.map(([k, ic, l]) => <button key={k} className={panel === k ? 'act' : ''} onClick={() => { if (k !== 'editor') pause(); S().ui({ panel: k }); }}><span className="ic">{ic}</span>{l}</button>)}</nav>
      <main className="main">
        {panel === 'idea' && <IdeaLab />}
        {panel === 'story' && <Storyboard />}
        {panel === 'media' && <MediaPage />}
        {panel === 'editor' && <div className="editor"><EditorLibrary /><div className="ed-view"><Preview /></div><div className="ed-right"><Inspector /></div>{isImage ? <LayersPanel /> : graph ? <GraphEditor /> : <Timeline />}</div>}
        {panel === 'image' && <ImageStart />}
        {panel === 'templates' && <TemplateGallery />}
        {panel === 'audio' && <AudioStudio />}
        {panel === 'ai' && <AIEngines />}
        {panel === 'export' && <ExportPanel />}
        {panel === 'eco' && <Ecosystem />}
      </main>
      {pal && <CommandPalette onClose={() => setPal(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function TopBar() {
  const name = useS(s => s.project.name); const past = useS(s => s.past.length); const fut = useS(s => s.future.length); const st = useS(s => s.project.settings);
  const [open, setOpen] = useState(false); const [list, setList] = useState<Project[]>([]); const fref = useRef<HTMLInputElement>(null);
  const openList = async () => { setList((await listProjects()).sort((a, b) => b.updated - a.updated)); setOpen(o => !o); };
  const load = async (p: Project) => { pause(); await Promise.all(p.assets.map(ensureRuntime)); S().replace(p); setOpen(false); S().ui({ panel: p.clips.length ? 'editor' : 'idea' }); };
  return (
    <header className="top">
      <div className="brand"><i />KADRAJ<span className="muted" style={{ fontWeight: 500 }}>Studio</span></div>
      <span className="dim">|</span>
      <input value={name} onChange={e => S().set(d => { d.name = e.target.value; }, true)} style={{ width: 220, background: 'transparent', borderColor: 'transparent', fontWeight: 600 }} />
      <span className="chip">{st.width}×{st.height} · {st.fps}fps</span>
      <div style={{ position: 'relative' }}>
        <button className="sm" onClick={openList}>📁 Projeler ▾</button>
        {open && <div className="card" style={{ position: 'absolute', top: 34, left: 0, width: 340, zIndex: 50, maxHeight: 420, overflow: 'auto', boxShadow: '0 20px 50px #000a' }}>
          <div className="row wrap" style={{ marginBottom: 8 }}>
            <button className="sm pri" onClick={() => { pause(); S().replace(newProject()); S().ui({ panel: 'idea' }); setOpen(false); }}>+ Yeni</button>
            <button className="sm" onClick={() => { pause(); setOpen(false); S().ui({ panel: 'image' }); }}>🖼 Yeni görsel</button>
            <button className="sm" onClick={async () => { pause(); setOpen(false); await buildDemo(); }}>✨ Demo projesi</button>
            <button className="sm" onClick={() => fref.current?.click()}>⬆ Paket aç</button>
          </div>
          {list.map(p => <div key={p.id} className="row" style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>
            <button className="ghost grow" style={{ textAlign: 'left' }} onClick={() => load(p)}>{p.name}<br /><span className="small dim">{p.mode === 'image' ? '🖼 ' : '🎬 '}{new Date(p.updated).toLocaleString('tr')} · {p.clips.length} {p.mode === 'image' ? 'katman' : 'klip'}</span></button>
            <button className="ghost sm" onClick={async () => { if (confirm('Silinsin mi?')) { await deleteProject(p.id); setList(l => l.filter(x => x.id !== p.id)); } }}>✕</button></div>)}
        </div>}
        <input ref={fref} type="file" accept=".json" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) { try { await importProjectFile(f); setOpen(false); S().notify('Proje açıldı'); } catch (er) { S().notify((er as Error).message); } } }} />
      </div>
      <span className="sp" />
      <button className="sm" style={{ minWidth: 260, textAlign: 'left', color: 'var(--mute)' }} onClick={() => openPalette()}>🎬 Yönetmene söyle… <span className="chip" style={{ float: 'right' }}>Ctrl+K</span></button>
      <button className="ghost sm" disabled={!past} onClick={() => S().undo()} title="Geri al (Ctrl+Z)">↶ Geri</button>
      <button className="ghost sm" disabled={!fut} onClick={() => S().redo()} title="İleri al (Ctrl+Y)">↷ İleri</button>
      <GpuChip />
      <span className="chip ok" title="Tüm veriler tarayıcıda (IndexedDB)">● Otomatik kayıt · yerel</span>
      <button className="pri sm" onClick={() => S().ui({ panel: 'export' })}>Dışa aktar</button>
    </header>
  );
}

function MediaPage() {
  const imp = useImport(); const [over, setOver] = useState(false);
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 14 }}><h2>🗂 Medya Kütüphanesi</h2></div>
      <div className="grid2" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        <div className="col">
          <div className={'drop ' + (over ? 'over' : '')} style={{ padding: 30 }} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); imp(e.dataTransfer.files); }}>
            Video, görsel ve ses dosyalarını buraya bırak<br /><label style={{ cursor: 'pointer', color: 'var(--acc)' }}>ya da seç<input type="file" multiple hidden accept="video/*,image/*,audio/*" onChange={e => e.target.files && imp(e.target.files)} /></label>
          </div>
          <div className="card" style={{ padding: 0 }}><AssetGrid /></div>
        </div>
        <div className="card"><GenQuick /></div>
      </div>
    </div>
  );
}

function GpuChip() {
  const [on, setOn] = useState(gpuEnabled()); const avail = on && gpuAvailable();
  return <button className={'sm ' + (avail ? 'on' : '')} title="GPU efekt motoru (WebGL2): renk tekerlekleri, LUT, yeşil perde, keskinleştirme, RGB split shader'da çalışır. Tıkla: aç/kapat" onClick={() => { setGpuEnabled(!on); setOn(!on); S().notify(!on ? 'GPU motoru açık' : 'GPU kapalı — CPU modu'); }}>{avail ? '⚡ GPU' : on ? '⚠ GPU yok' : '○ CPU'}</button>;
}
