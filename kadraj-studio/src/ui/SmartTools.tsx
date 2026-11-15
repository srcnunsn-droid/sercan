import { useState } from 'react';
import { useS, S } from '../store';
import { getRuntime } from '../engine/media';
import { detectBeats, type BeatResult } from '../engine/beats';
import { clearBeatMarkers, cutToBeats, markBeats } from '../actions';
import { WHISPER_MODELS, applyCues, clipAudio16k, cuesFromProject, cuesFromText, parseSrt, splitCues, toSrt, transcribe } from '../ai/captions';
import { TEXT_STYLES } from '../engine/presets';
import { download, projectDuration } from '../util';
import type { Clip } from '../types';

function useAudioClip(): Clip | undefined {
  return useS(s => {
    const withAudio = (c: Clip) => c.kind === 'media' && !!getRuntime(c.assetId)?.audio;
    const sel = s.project.clips.find(c => s.selected.includes(c.id) && withAudio(c));
    if (sel) return sel;
    return [...s.project.clips].filter(withAudio).sort((a, b) => b.duration - a.duration)[0];
  });
}

export function SmartTools() {
  return <div className="col" style={{ padding: 8, gap: 10 }}><BeatTool /><DuckTool /><CaptionTool /></div>;
}

function BeatTool() {
  const clip = useAudioClip(); const [res, setRes] = useState<BeatResult | null>(null); const [every, setEvery] = useState(2); const [busy, setBusy] = useState(false);
  const beatsOnTimeline = () => (res && clip ? res.beats.map(b => clip.start + (b - clip.in) / clip.speed).filter(t => t >= clip.start && t <= clip.start + clip.duration) : []);
  const analyze = async () => {
    if (!clip) return; setBusy(true); await new Promise(r => setTimeout(r, 20));
    const buf = getRuntime(clip.assetId)!.audio!; const r = detectBeats(buf, clip.in, Math.min(buf.duration, clip.in + clip.duration * clip.speed));
    setRes(r); setBusy(false); S().notify(`${r.bpm} BPM · ${r.beats.length} vuruş`);
  };
  return (
    <div className="sec"><div className="hd">🥁 Ritim senkronu</div><div className="bd">
      <span className="small dim">Kaynak: {clip ? <b>{clip.name}</b> : 'ses içeren klip yok'} {clip && <span className="dim">(seçili ses klibi ya da en uzun ses)</span>}</span>
      <button disabled={!clip || busy} onClick={analyze}>{busy ? 'Analiz…' : 'Ritmi analiz et'}</button>
      {res && <>
        <div className="row"><span className="chip ok">{res.bpm} BPM</span><span className="chip">{res.beats.length} vuruş</span><span className="chip">güven {Math.round(res.confidence * 100)}%</span></div>
        <div className="row"><label>Her</label><select value={every} onChange={e => setEvery(Number(e.target.value))}>{[1, 2, 4, 8].map(n => <option key={n} value={n}>{n} vuruşta</option>)}</select></div>
        <button onClick={() => { const b = beatsOnTimeline(); markBeats(b, 0, every); S().notify('Vuruşlar işaretlendi — klipler bunlara yapışır'); }}>⚑ Vuruşları işaretle</button>
        <button className="pri" onClick={() => { const n = cutToBeats(beatsOnTimeline(), every); S().notify(n ? `${n} klip vuruşa oturtuldu` : 'Oturtulacak klip yok'); }}>✂ Klipleri vuruşa oturt</button>
        <span className="small dim">Seçili görsel klipler (seçim yoksa ana iz) sırayla her {every} vuruşta bir kesilir.</span>
      </>}
      <button className="sm ghost" onClick={clearBeatMarkers}>Vuruş işaretlerini temizle</button>
    </div></div>
  );
}

function CaptionTool() {
  const clip = useAudioClip(); const p = useS(s => s.project);
  const [model, setModel] = useState(WHISPER_MODELS[1].id); const [lang, setLang] = useState('turkish'); const [style, setStyle] = useState('caption');
  const [words, setWords] = useState(4); const [status, setStatus] = useState(''); const [text, setText] = useState('');
  const auto = async () => {
    if (!clip) return; setStatus('Ses hazırlanıyor…');
    try {
      const audio = await clipAudio16k(clip);
      const cues = await transcribe(audio, model, lang, setStatus);
      const placed = splitCues(cues.map(c => ({ ...c, start: clip.start + c.start / 1, end: clip.start + c.end })), words);
      S().set(d => applyCues(d as any, placed, style)); setStatus(''); S().notify(`${placed.length} altyazı eklendi`);
    } catch (e) { setStatus('⚠ ' + (e as Error).message + ' — model indirmek için internet gerekir (ilk seferlik).'); }
  };
  const fromText = () => {
    const sel = p.clips.find(c => S().selected.includes(c.id));
    const start = sel ? sel.start : 0, dur = sel ? sel.duration : projectDuration(p);
    const src = text.trim() || p.scenes.flatMap(s => s.shots.map(x => x.vo)).filter(Boolean).join(' ');
    if (!src) return S().notify('Metin yok');
    const cues = splitCues(cuesFromText(src, start, dur), words); S().set(d => applyCues(d as any, cues, style)); S().notify(`${cues.length} altyazı eklendi`);
  };
  return (
    <div className="sec"><div className="hd">💬 Altyazı</div><div className="bd">
      <h4>Otomatik (Whisper, tarayıcıda)</h4>
      <span className="small dim">Kaynak: {clip?.name ?? '—'}</span>
      <select value={model} onChange={e => setModel(e.target.value)}>{WHISPER_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
      <div className="row"><select value={lang} onChange={e => setLang(e.target.value)}>{[['turkish', 'Türkçe'], ['english', 'İngilizce'], ['german', 'Almanca'], ['arabic', 'Arapça'], ['', 'Otomatik']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={style} onChange={e => setStyle(e.target.value)}>{['caption', 'lower', 'meme', 'elegant', 'terminal'].map(k => <option key={k} value={k}>{TEXT_STYLES[k].label}</option>)}</select></div>
      <div className="row"><label>Satır başı en fazla</label><input type="number" min={1} max={12} style={{ width: 56 }} value={words} onChange={e => setWords(Number(e.target.value))} /><label>kelime</label></div>
      <button className="pri" disabled={!clip || (!!status && !status.startsWith('⚠'))} onClick={auto}>🎙 Sesten altyazı çıkar</button>
      {status && <div className="small" style={{ color: status.startsWith('⚠') ? 'var(--acc)' : 'var(--mute)' }}>{status}</div>}
      <h4 style={{ marginTop: 6 }}>Metinden</h4>
      <textarea rows={3} placeholder="Boş bırakırsan storyboard VO metinleri kullanılır. Seçili klibin süresine (yoksa tüm videoya) okuma hızıyla dağıtılır." value={text} onChange={e => setText(e.target.value)} />
      <button onClick={fromText}>Metni zamanla → altyazı</button>
      <h4 style={{ marginTop: 6 }}>SRT</h4>
      <div className="row">
        <button className="sm" onClick={() => { const c = cuesFromProject(S().project); if (!c.length) return S().notify('Altyazı izi boş'); download(new Blob([toSrt(c)], { type: 'text/plain' }), `${p.name || 'altyazi'}.srt`); }}>⬇ SRT indir</button>
        <label className="sm" style={{ cursor: 'pointer', border: '1px solid var(--line2)', borderRadius: 6, padding: '3px 7px', color: 'var(--text)' }}>⬆ SRT yükle<input type="file" accept=".srt,.vtt" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const c = parseSrt(await f.text()); S().set(d => applyCues(d as any, c, style)); S().notify(`${c.length} altyazı yüklendi`); }} /></label>
      </div>
    </div></div>
  );
}

function DuckTool() {
  const duck = useS(s => s.project.settings.duck); const tracks = useS(s => s.project.tracks).filter(t => t.kind === 'audio');
  const d = duck ?? { on: false, db: 12 };
  const set = (fn: (x: { on: boolean; db: number; voiceTrack?: string }) => void) => S().set(p => { p.settings.duck ??= { on: false, db: 12 }; fn(p.settings.duck); }, true);
  return (
    <div className="sec"><div className="hd">🎚 Otomatik ducking</div><div className="bd">
      <label className="row"><input type="checkbox" checked={d.on} onChange={e => set(x => { x.on = e.target.checked; })} /> Konuşma varken müziği kıs</label>
      <div className="row"><label>Ses izi</label><select className="grow" value={d.voiceTrack ?? tracks[0]?.id} onChange={e => set(x => { x.voiceTrack = e.target.value; })}>{tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div className="row"><label>Kısma</label><input type="range" min={3} max={30} value={d.db} onChange={e => set(x => { x.db = Number(e.target.value); })} /><span className="mono small">-{d.db} dB</span></div>
      <span className="small dim">Seçili izdeki her klip (VO, mikrofon, TTS) çalarken diğer tüm sesler yumuşakça kısılır; önizleme ve render'da geçerli.</span>
    </div></div>
  );
}
