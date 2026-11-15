import { useEffect, useRef, useState } from 'react';
import { useS, S } from '../store';
import { assetFromBlob, ensureRuntime, getRuntime, importFile } from '../engine/media';
import { addAdjustmentLayer, addAsset, addGenClip, addNullObject, addParticles, addTextClip, placeAsset } from '../actions';
import { PARTICLE_PRESETS } from '../engine/particles';
import { TEXT_STYLES } from '../engine/presets';
import { VISUAL_TYPES, genVisual, type VisualType } from '../engine/visualGen';
import type { Asset } from '../types';
import { delBlob } from '../db';
import { SmartTools } from './SmartTools';
import { TEMPLATES, applyTemplate } from '../templates';

export function useImport() {
  return async (files: FileList | File[]) => {
    let n = 0;
    for (const f of Array.from(files)) { const a = await importFile(f); if (a) { addAsset(a); n++; } }
    S().notify(`${n} medya içe aktarıldı`);
  };
}

export function AssetGrid({ filter }: { filter?: Asset['kind'] }) {
  const assets = useS(s => s.project.assets).filter(a => !filter || a.kind === filter);
  const [, force] = useState(0);
  useEffect(() => { let alive = true; Promise.all(assets.map(ensureRuntime)).then(() => alive && force(x => x + 1)); return () => { alive = false; }; }, [assets.length]);
  if (!assets.length) return <div className="dim small" style={{ padding: 10 }}>Henüz medya yok.</div>;
  return (
    <div className="lib">
      {assets.map(a => {
        const rt = getRuntime(a.id);
        return (
          <div key={a.id} className="asset" draggable onDragStart={e => e.dataTransfer.setData('asset', a.id)} onDoubleClick={() => placeAsset(a)} title={`${a.name}\nÇift tık: playhead'e ekle · sürükle: timeline'a bırak`}>
            <div className="th" style={{ backgroundImage: rt?.thumb ? `url(${rt.thumb})` : undefined }}>{!rt?.thumb && (a.kind === 'audio' ? '♪' : '…')}</div>
            <div className="nm row"><span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.kind === 'video' ? '🎞' : a.kind === 'audio' ? '🔊' : '🖼'} {a.name}</span>
              <span className="dim">{a.duration ? a.duration.toFixed(1) + 's' : ''}</span>
              <button className="ghost sm" style={{ padding: '0 3px' }} title="Sil" onClick={e => { e.stopPropagation(); if (confirm('Medya ve onu kullanan klipler silinsin mi?')) { S().set(d => { d.assets = d.assets.filter(x => x.id !== a.id); d.clips = d.clips.filter(c => c.assetId !== a.id); }); delBlob(a.id); } }}>✕</button></div>
          </div>);
      })}
    </div>
  );
}

export function EditorLibrary() {
  const [tab, setTab] = useState<'media' | 'text' | 'gen' | 'tpl' | 'smart'>('media');
  const imp = useImport(); const fileRef = useRef<HTMLInputElement>(null); const [over, setOver] = useState(false);
  return (
    <div className="ed-left">
      <div className="tabs">{([['media', 'Medya'], ['text', 'Metin'], ['gen', 'Üret'], ['tpl', 'Şablon'], ['smart', 'Akıllı']] as const).map(([k, l]) => <button key={k} className={tab === k ? 'act' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'media' && <>
        <div style={{ padding: 8 }}>
          <div className={'drop ' + (over ? 'over' : '')} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); imp(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
            ⬆ Dosya bırak / seç<br /><span className="small dim">video · görsel · ses</span></div>
          <input ref={fileRef} type="file" multiple accept="video/*,image/*,audio/*" hidden onChange={e => e.target.files && imp(e.target.files)} />
        </div>
        <AssetGrid />
      </>}
      {tab === 'text' && <div className="col" style={{ padding: 8 }}>
        {Object.entries(TEXT_STYLES).map(([k, v]) => <button key={k} style={{ textAlign: 'left', fontFamily: v.t.font, fontWeight: v.t.weight }} onClick={() => addTextClip(k, k === 'lower' ? 'İsim Soyisim · Unvan' : k === 'caption' ? 'Bu altyazı kelime kelime gelir' : k === 'terminal' ? '> sistem başlatılıyor...' : 'BAŞLIK')}>{v.label}</button>)}
      </div>}
      {tab === 'gen' && <GenQuick />}
      {tab === 'smart' && <SmartTools />}
      {tab === 'tpl' && <div className="col" style={{ padding: 8 }}>
        <button className="pri" onClick={() => S().ui({ panel: 'templates' })}>🎞 400 şablonluk galeriyi aç →</button>
        <span className="small dim">Playhead konumuna eklenir; her şey düzenlenebilir.</span>
        {TEMPLATES.map(t => <button key={t.id} style={{ textAlign: 'left', whiteSpace: 'normal' }} onClick={() => applyTemplate(t.id)}><b>{t.label}</b><br /><span className="small muted">{t.desc}</span></button>)}
      </div>}
    </div>
  );
}

export function GenQuick() {
  const p = useS(s => s.project); const [busy, setBusy] = useState(false);
  const pal = p.idea?.style.palette ?? ['#0b0a1a', '#3b1d6e', '#e8475f', '#ffb347'];
  const make = async (t: VisualType) => {
    setBusy(true);
    const blob = await genVisual(t, p.settings.width, p.settings.height, pal, Math.floor(Math.random() * 1e9));
    const a = await assetFromBlob(blob, VISUAL_TYPES[t], 'image', 'procedural', { type: t }); addAsset(a); placeAsset(a); setBusy(false);
  };
  return (
    <div className="col" style={{ padding: 8 }}>
      <h4>Katman</h4>
      <div className="grid2">
        <button onClick={() => addGenClip('solid')}>■ Düz renk</button>
        <button onClick={() => addGenClip('gradient')}>◐ Gradyan</button>
        <button onClick={() => addGenClip('shape')}>▭ Dikdörtgen</button>
        <button onClick={() => addAdjustmentLayer()} title="Altındaki her şeye efekt uygular">◐ Ayar katmanı</button>
        <button onClick={() => addGenClip('shape', { shape: { shape: 'star', w: 360, h: 360, fill: '#ffcc4d', stroke: '#ffffff', strokeW: 6, radius: 0, points: 5, drawOn: 1.2 } })}>★ Yıldız (çizerek)</button>
        <button onClick={() => addGenClip('shape', { shape: { shape: 'circle', w: 420, h: 420, fill: 'transparent', stroke: '#ff4d6d', strokeW: 10, radius: 0, drawOn: 1 } })}>◯ Halka çizimi</button>
        <button onClick={() => addNullObject()} title="Parenting için görünmez kontrol katmanı">⊕ Null nesne</button>
        <button onClick={() => addGenClip('shape', { shape: { shape: 'circle', w: 300, h: 300, fill: '#ffb347', stroke: '#fff', strokeW: 0, radius: 0 } })}>● Daire</button>
      </div>
      <h4 style={{ marginTop: 8 }}>Parçacıklar</h4>
      <div className="grid2">{Object.entries(PARTICLE_PRESETS).map(([k, v]) => <button key={k} onClick={() => addParticles(k)}>{v.label}</button>)}</div>
      <h4 style={{ marginTop: 8 }}>Prosedürel arka plan</h4>
      <div className="small dim">Proje paletiyle, proje çözünürlüğünde üretilir.</div>
      <div className="grid2">{(Object.keys(VISUAL_TYPES) as VisualType[]).map(t => <button key={t} disabled={busy} onClick={() => make(t)}>{VISUAL_TYPES[t]}</button>)}</div>
    </div>
  );
}
