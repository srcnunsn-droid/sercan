import { useEffect, useState } from 'react';
import { useS, S } from '../store';
import type { Shot } from '../types';
import { ALL_LENSES, ALL_SIZES, buildPrompt } from '../ai/ideaEngine';
import { SFX_TYPES } from '../engine/audioGen';
import { assetFromBlob, ensureRuntime, getRuntime, importFile } from '../engine/media';
import { genStoryFrame } from '../engine/visualGen';
import { addAsset, storyboardToTimeline } from '../actions';
import { comfyRun, loadCfg } from '../ai/providers';
import { download, uid } from '../util';

export function Storyboard() {
  const scenes = useS(s => s.project.scenes); const idea = useS(s => s.project.idea);
  const [opts, setOpts] = useState({ music: true, sfx: true, texts: true, clear: true }); const [busy, setBusy] = useState(false);
  const total = scenes.reduce((n, s) => n + s.shots.reduce((m, x) => m + x.duration, 0), 0);
  const upShot = (sid: string, fn: (s: Shot) => void) => S().set(d => { for (const sc of d.scenes) { const sh = sc.shots.find(x => x.id === sid); if (sh) fn(sh); } }, true);

  const exportCsv = () => {
    const rows = [['#', 'Sahne', 'Plan', 'Ölçek', 'Hareket', 'Lens', 'Işık', 'Süre', 'VO', 'Ekran yazısı', 'SFX', 'Prompt', 'Negatif']];
    scenes.forEach((sc, i) => sc.shots.forEach((s, k) => rows.push([`${i + 1}.${k + 1}`, sc.title, s.desc, s.size, s.move, s.lens, s.light, String(s.duration), s.vo, s.onscreen, s.sfx, s.prompt, s.negative])));
    download(new Blob(['﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }), 'shot-listesi.csv');
  };
  const exportPrompts = () => {
    const txt = scenes.flatMap((sc, i) => sc.shots.map((s, k) => `### ${i + 1}.${k + 1} ${sc.title} (${s.duration}s)\nPROMPT: ${s.prompt}\nNEGATIVE: ${s.negative}\n`)).join('\n');
    download(new Blob([txt], { type: 'text/plain' }), 'prompt-paketi.txt');
  };
  const rough = async () => { setBusy(true); try { await storyboardToTimeline(opts); } catch (e) { S().notify('Hata: ' + (e as Error).message); } setBusy(false); };

  return (
    <div className="page">
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <h2>🎬 Senaryo & Storyboard</h2><span className="chip">{scenes.length} sahne · {total.toFixed(1)} sn</span><span className="sp" />
        <button onClick={() => S().set(d => { d.scenes.push({ id: uid('sc_'), title: 'Yeni sahne', beat: '', location: '', time: '', mood: '', shots: [] }); })}>+ Sahne</button>
        <button onClick={exportCsv} disabled={!scenes.length}>⬇ Shot listesi CSV</button>
        <button onClick={exportPrompts} disabled={!scenes.length}>⬇ Prompt paketi</button>
      </div>
      {!scenes.length && <div className="card muted">Henüz sahne yok. Fikir Laboratuvarı'ndan konsept üret ya da elle sahne ekle.</div>}
      {scenes.length > 0 && <div className="card row wrap" style={{ marginBottom: 16, position: 'sticky', top: -18, zIndex: 3 }}>
        <b>Kaba kurgu (rough cut) oluştur:</b>
        {([['texts', 'Ekran yazıları + VO altyazı'], ['sfx', 'SFX'], ['music', 'Müzik (prosedürel)'], ['clear', 'Timeline’ı temizle']] as const).map(([k, l]) => <label key={k} className="row"><input type="checkbox" checked={opts[k]} onChange={e => setOpts(o => ({ ...o, [k]: e.target.checked }))} />{l}</label>)}
        <span className="sp" /><button className="pri" disabled={busy} onClick={rough}>{busy ? 'Oluşturuluyor…' : '▶ Timeline’a aktar'}</button>
      </div>}
      {scenes.map((sc, si) => (
        <div key={sc.id} className="scene">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="chip acc">Sahne {si + 1}</span>
            <input style={{ fontWeight: 700, width: 220 }} value={sc.title} onChange={e => S().set(d => { d.scenes[si].title = e.target.value; }, true)} />
            <input placeholder="Mekân" value={sc.location} onChange={e => S().set(d => { d.scenes[si].location = e.target.value; }, true)} />
            <input placeholder="Zaman" style={{ width: 110 }} value={sc.time} onChange={e => S().set(d => { d.scenes[si].time = e.target.value; }, true)} />
            <span className="sp" />
            <button className="sm" onClick={() => S().set(d => { const s: Shot = { id: uid('s_'), desc: 'Yeni plan', size: 'Geniş (WS)', move: 'Statik', lens: '35mm', light: '', duration: 3, vo: '', onscreen: '', sfx: '', prompt: '', negative: '' }; Object.assign(s, buildPrompt(s, d.idea as any)); d.scenes[si].shots.push(s); })}>+ Plan</button>
            <button className="sm" disabled={si === 0} onClick={() => S().set(d => { const [x] = d.scenes.splice(si, 1); d.scenes.splice(si - 1, 0, x); })}>↑</button>
            <button className="sm" onClick={() => confirm('Sahne silinsin mi?') && S().set(d => { d.scenes.splice(si, 1); })}>✕</button>
          </div>
          <div className="shots">{sc.shots.map((sh, ki) => <ShotCard key={sh.id} sh={sh} no={`${si + 1}.${ki + 1}`} up={fn => upShot(sh.id, fn)} onDel={() => S().set(d => { d.scenes[si].shots.splice(ki, 1); })} palette={idea?.style.palette ?? []} />)}</div>
        </div>
      ))}
    </div>
  );
}

function ShotCard({ sh, no, up, onDel, palette }: { sh: Shot; no: string; up: (fn: (s: Shot) => void) => void; onDel: () => void; palette: string[] }) {
  const asset = useS(s => s.project.assets.find(a => a.id === sh.assetId)); const settings = useS(s => s.project.settings); const idea = useS(s => s.project.idea);
  const [thumb, setThumb] = useState(''); const [status, setStatus] = useState('');
  useEffect(() => { if (asset) ensureRuntime(asset).then(() => setThumb(getRuntime(asset.id)?.thumb ?? '')); else setThumb(''); }, [asset?.id]);
  const sketch = async () => {
    const b = await genStoryFrame(sh, no, 960, Math.round(960 * settings.height / settings.width), palette);
    const a = await assetFromBlob(b, `SB ${no}`, 'image', 'procedural'); addAsset(a); up(s => { s.assetId = a.id; });
  };
  const upload = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,video/*'; i.onchange = async () => { const f = i.files?.[0]; if (!f) return; const a = await importFile(f); if (a) { addAsset(a); up(s => { s.assetId = a.id; }); } }; i.click(); };
  const comfy = async (kind: 'image' | 'video') => {
    try {
      const cfg = await loadCfg(); if (!cfg.comfy.enabled) throw new Error('AI Motorları’ndan ComfyUI’yi etkinleştir');
      const wf = kind === 'image' ? cfg.comfy.imageWorkflow : cfg.comfy.videoWorkflow; if (!wf) throw new Error('Workflow JSON tanımlı değil');
      const blobs = await comfyRun(cfg.comfy, wf, { PROMPT: sh.prompt, NEGATIVE: sh.negative, SEED: Math.floor(Math.random() * 1e9), WIDTH: Math.min(1280, settings.width), HEIGHT: Math.round(Math.min(1280, settings.width) * settings.height / settings.width / 16) * 16, FRAMES: Math.round(sh.duration * 16) + 1 }, setStatus);
      for (const b of blobs) { const k = b.type.startsWith('video') ? 'video' : 'image'; const a = await assetFromBlob(b, `AI ${no}`, k, 'ai', { prompt: sh.prompt }); addAsset(a); up(s => { s.assetId = a.id; }); }
      setStatus('');
    } catch (e) { setStatus('⚠ ' + (e as Error).message); }
  };
  return (
    <div className="shot">
      <div className="fr" style={{ backgroundImage: thumb ? `url(${thumb})` : undefined }}>
        <span className="no">#{no} · {sh.duration}s</span>
        {!thumb && <div className="row" style={{ position: 'absolute', inset: 0, justifyContent: 'center' }}><button className="sm" onClick={sketch}>✎ Eskiz</button><button className="sm" onClick={upload}>⬆ Yükle</button></div>}
      </div>
      <div className="bd">
        <textarea rows={2} value={sh.desc} onChange={e => up(s => { s.desc = e.target.value; })} />
        <div className="grid2">
          <select value={sh.size} onChange={e => up(s => { s.size = e.target.value; })}>{[...new Set([sh.size, ...ALL_SIZES])].map(x => <option key={x}>{x}</option>)}</select>
          <select value={sh.lens} onChange={e => up(s => { s.lens = e.target.value; })}>{[...new Set([sh.lens, ...ALL_LENSES])].map(x => <option key={x}>{x}</option>)}</select>
          <input placeholder="Kamera hareketi" value={sh.move} onChange={e => up(s => { s.move = e.target.value; })} />
          <input placeholder="Işık" value={sh.light} onChange={e => up(s => { s.light = e.target.value; })} />
          <input placeholder="VO / diyalog" value={sh.vo} onChange={e => up(s => { s.vo = e.target.value; })} />
          <input placeholder="Ekran yazısı" value={sh.onscreen} onChange={e => up(s => { s.onscreen = e.target.value; })} />
          <select value={sh.sfx} onChange={e => up(s => { s.sfx = e.target.value; })}><option value="">SFX yok</option>{Object.entries(SFX_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <div className="row"><label>Süre</label><input type="number" step={0.1} min={0.3} value={sh.duration} onChange={e => up(s => { s.duration = Math.max(0.3, Number(e.target.value)); })} /></div>
        </div>
        <details><summary className="small muted" style={{ cursor: 'pointer' }}>AI prompt (video modeli için)</summary>
          <textarea rows={4} className="mono" style={{ width: '100%', fontSize: 11 }} value={sh.prompt} onChange={e => up(s => { s.prompt = e.target.value; })} />
          <textarea rows={2} className="mono" style={{ width: '100%', fontSize: 11 }} value={sh.negative} onChange={e => up(s => { s.negative = e.target.value; })} />
          <div className="row wrap"><button className="sm" onClick={() => up(s => Object.assign(s, buildPrompt(s, idea)))}>↻ Yeniden kur</button><button className="sm" onClick={() => { navigator.clipboard.writeText(sh.prompt); S().notify('Prompt kopyalandı'); }}>⧉ Kopyala</button>
            <button className="sm" onClick={() => comfy('image')}>ComfyUI görsel</button><button className="sm" onClick={() => comfy('video')}>ComfyUI video</button></div>
        </details>
        {status && <div className="chip">{status}</div>}
        <div className="row"><button className="sm" onClick={sketch}>✎ Eskiz</button><button className="sm" onClick={upload}>⬆ Medya</button>{sh.assetId && <button className="sm" onClick={() => up(s => { s.assetId = undefined; })}>Kareyi kaldır</button>}<span className="sp" /><button className="ghost sm" onClick={onDel}>✕</button></div>
      </div>
    </div>
  );
}
