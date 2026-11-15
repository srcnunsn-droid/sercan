import { useState } from 'react';
import { useS, S } from '../store';
import { FORMATS, TONES, buildPrompt, generateIdea, llmPrompt } from '../ai/ideaEngine';
import { loadCfg, ollamaJson } from '../ai/providers';
import type { Idea, Scene } from '../types';
import { ASPECTS } from './Inspector';
import { setAspect } from '../actions';
import { uid } from '../util';

export function IdeaLab() {
  const idea = useS(s => s.project.idea); const scenes = useS(s => s.project.scenes);
  const [f, setF] = useState({ topic: idea?.topic ?? '', format: idea?.format ?? 'reklam', tone: idea?.tone ?? 'Epik', audience: idea?.audience ?? '18-34 yaş, sosyal medya kullanıcıları', duration: idea?.duration ?? 30, aspect: idea?.aspect ?? '16:9 · 1080p', notes: idea?.notes ?? '' });
  const [busy, setBusy] = useState('');
  const set = (k: keyof typeof f, v: string | number) => setF(o => ({ ...o, [k]: v }));

  const apply = (i: Idea, sc: Scene[]) => {
    const a = ASPECTS.find(x => x[0] === f.aspect); if (a) setAspect(a[1], a[2]);
    S().set(d => { d.idea = i; d.scenes = sc; if (d.name === 'Yeni Proje' && f.topic) d.name = f.topic.slice(0, 40); });
  };
  const gen = () => { const { idea: i, scenes: sc } = generateIdea(f, Math.floor(Math.random() * 1e9)); apply(i, sc); S().notify('Konsept üretildi (çevrimdışı motor)'); };
  const genLLM = async () => {
    setBusy('Yerel LLM düşünüyor…');
    try {
      const cfg = await loadCfg(); if (!cfg.ollama.enabled) throw new Error('AI Motorları sayfasından Ollama’yı etkinleştir.');
      const r = await ollamaJson(cfg.ollama, llmPrompt(f));
      const base = generateIdea(f, 1);
      const i: Idea = { ...base.idea, logline: r.logline ?? base.idea.logline, hooks: r.hooks ?? base.idea.hooks, cta: r.cta ?? base.idea.cta };
      const sc: Scene[] = (r.scenes ?? []).map((s: any) => ({ id: uid('sc_'), title: s.title ?? 'Sahne', beat: s.title ?? '', location: s.location ?? '', time: s.time ?? '', mood: f.tone,
        shots: (s.shots ?? []).map((h: any) => { const sh = { id: uid('s_'), desc: h.desc ?? '', size: h.size ?? 'Geniş (WS)', move: h.move ?? 'Statik', lens: h.lens ?? '35mm', light: h.light ?? '', duration: Number(h.duration) || 3, vo: h.vo ?? '', onscreen: h.onscreen ?? '', sfx: '', prompt: '', negative: '' }; const bp = buildPrompt(sh, i); return { ...sh, prompt: h.prompt_en || bp.prompt, negative: bp.negative }; }) }));
      apply(i, sc.length ? sc : base.scenes); S().notify('LLM konsepti hazır');
    } catch (e) { S().notify('LLM hatası: ' + (e as Error).message); }
    setBusy('');
  };
  const totalShots = scenes.reduce((n, s) => n + s.shots.length, 0);

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 14 }}><h2>💡 Fikir Laboratuvarı</h2><span className="chip">Brief → Konsept → Senaryo → Shot listesi</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,420px) 1fr', gap: 16 }}>
        <div className="card col">
          <label>Konu / Ürün / Fikir</label>
          <textarea rows={3} placeholder="örn. Kapadokya'da balon festivali, yeni kahve markası, 'Antik Roma'da bir gün'..." value={f.topic} onChange={e => set('topic', e.target.value)} />
          <div className="grid2">
            <div className="col"><label>Format</label><select value={f.format} onChange={e => set('format', e.target.value)}>{Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div className="col"><label>Ton</label><select value={f.tone} onChange={e => set('tone', e.target.value)}>{Object.keys(TONES).map(k => <option key={k}>{k}</option>)}</select></div>
            <div className="col"><label>Süre (sn)</label><input type="number" min={5} max={600} value={f.duration} onChange={e => set('duration', Number(e.target.value))} /></div>
            <div className="col"><label>En-boy</label><select value={f.aspect} onChange={e => set('aspect', e.target.value)}>{ASPECTS.map(a => <option key={a[0]}>{a[0]}</option>)}</select></div>
          </div>
          <label>Hedef kitle</label><input value={f.audience} onChange={e => set('audience', e.target.value)} />
          <label>Notlar (marka dili, yasaklar, referanslar)</label><textarea rows={3} value={f.notes} onChange={e => set('notes', e.target.value)} />
          <div className="row"><button className="pri grow" onClick={gen}>⚡ Konsept üret</button><button className="grow" onClick={genLLM} disabled={!!busy} title="Yerel Ollama modeli ile">🧠 Yerel LLM ile</button></div>
          {busy && <div className="chip acc">{busy}</div>}
          <div className="hint">Çevrimdışı motor format yapısı (beat), ton kütüphanesi (palet, ışık, kamera dili, müzik) ve sinematografi kurallarıyla senaryo + shot listesi kurar. Her plan için İngilizce video-model promptu da hazırlanır (Wan / LTX / HunyuanVideo / Seedance uyumlu).</div>
        </div>
        <div className="col" style={{ gap: 12 }}>
          {!idea ? <div className="card muted">Soldaki brief'i doldur ve “Konsept üret”e bas. Her basışta farklı varyasyon gelir.</div> : <>
            <div className="card col">
              <h4>Logline</h4><div style={{ fontSize: 16, lineHeight: 1.5 }}>{idea.logline}</div>
              <h4 style={{ marginTop: 8 }}>Kanca (hook) alternatifleri</h4>
              {idea.hooks.map((h, i) => <div key={i} className="row"><span className="chip acc">{i + 1}</span>{h}</div>)}
              <div className="row" style={{ marginTop: 6 }}><h4>CTA</h4><span>{idea.cta}</span></div>
            </div>
            <div className="card col">
              <h4>Görsel dil</h4>
              <div className="row">{idea.style.palette.map(c => <div key={c} className="swatch" style={{ background: c }} title={c} />)}<span className="muted">{idea.style.look}</span></div>
              <div className="row wrap"><span className="chip">Font: {idea.style.font}</span><span className="chip">Müzik: {idea.style.music} · {idea.style.bpm} BPM</span><span className="chip">{scenes.length} sahne · {totalShots} plan</span></div>
            </div>
            <div className="card col">
              <h4>Senaryo akışı</h4>
              {scenes.map((s, i) => <div key={s.id} className="row" style={{ alignItems: 'flex-start' }}><span className="chip">{i + 1}</span><div><b>{s.title}</b> <span className="dim">· {s.location} · {s.time} · {s.shots.reduce((n, x) => n + x.duration, 0).toFixed(1)} sn</span><div className="muted small">{s.shots.map(x => x.desc).join(' → ')}</div></div></div>)}
              <div className="row"><button className="pri" onClick={() => S().ui({ panel: 'story' })}>Storyboard'a git →</button></div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
