import { useRef, useState } from 'react';
import { useS, S } from '../store';
import { MOODS, SFX_TYPES, genMusic, genSfx, type Mood, type SfxType } from '../engine/audioGen';
import { audioCtx, assetFromBlob } from '../engine/media';
import { addAsset, makeMusicAsset, makeSfxAsset, placeAsset } from '../actions';
import { AssetGrid } from './Library';
import { loadCfg, ttsSpeak } from '../ai/providers';

let prevSrc: AudioBufferSourceNode | null = null;
function audition(b: AudioBuffer) { prevSrc?.stop(); const c = audioCtx(); c.resume(); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(); prevSrc = s; }

export function AudioStudio() {
  const idea = useS(s => s.project.idea);
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 14 }}><h2>🎧 Ses Stüdyosu</h2><span className="chip ok">%100 yerel sentez — API yok</span></div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="col" style={{ gap: 12 }}><MusicGen defMood={(idea?.style.music as Mood) ?? 'epik'} defBpm={idea?.style.bpm ?? 90} /><SfxGen /></div>
        <div className="col" style={{ gap: 12 }}><VoiceRec /><TTS /><div className="card"><h3>Ses kütüphanesi</h3><AssetGrid filter="audio" /></div></div>
      </div>
    </div>
  );
}

function MusicGen({ defMood, defBpm }: { defMood: Mood; defBpm: number }) {
  const [m, setM] = useState({ mood: defMood, bpm: defBpm, bars: 16, root: 57, seed: 7, pad: true, bass: true, arp: true, drums: true }); const [busy, setBusy] = useState(false);
  const layers = { pad: m.pad, bass: m.bass, arp: m.arp, drums: m.drums };
  const dur = (m.bars * 240) / m.bpm;
  return (
    <div className="card col">
      <h3>🎼 Müzik üretici</h3><span className="small dim">Akor ilerlemesi + pad + bas + arp + davul, reverb ve limiter ile. Telifsiz, sana ait.</span>
      <div className="grid2">
        <div className="col"><label>Mod</label><select value={m.mood} onChange={e => { const mood = e.target.value as Mood; setM({ ...m, mood, bpm: MOODS[mood].bpm }); }}>{Object.entries(MOODS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="col"><label>Ton (kök)</label><select value={m.root} onChange={e => setM({ ...m, root: Number(e.target.value) })}>{['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].map((n, i) => <option key={n} value={57 + (i > 2 ? i - 12 : i)}>{n}</option>)}</select></div>
        <div className="col"><label>BPM {m.bpm}</label><input type="range" min={60} max={160} value={m.bpm} onChange={e => setM({ ...m, bpm: Number(e.target.value) })} /></div>
        <div className="col"><label>Ölçü {m.bars} (~{dur.toFixed(0)} sn)</label><input type="range" min={2} max={64} value={m.bars} onChange={e => setM({ ...m, bars: Number(e.target.value) })} /></div>
      </div>
      <div className="row wrap">{(['pad', 'bass', 'arp', 'drums'] as const).map(k => <label key={k} className="row"><input type="checkbox" checked={m[k]} onChange={e => setM({ ...m, [k]: e.target.checked })} />{k}</label>)}
        <label>Varyasyon</label><input type="number" style={{ width: 70 }} value={m.seed} onChange={e => setM({ ...m, seed: Number(e.target.value) })} /><button className="sm" onClick={() => setM({ ...m, seed: Math.floor(Math.random() * 9999) })}>🎲</button></div>
      <div className="row">
        <button disabled={busy} onClick={async () => { setBusy(true); audition(await genMusic(m.mood, m.bpm, Math.min(m.bars, 8), m.root, m.seed, layers)); setBusy(false); }}>▶ Dinle (8 ölçü)</button>
        <button onClick={() => prevSrc?.stop()}>■</button>
        <button className="pri" disabled={busy} onClick={async () => { setBusy(true); const a = await makeMusicAsset(m.mood, m.bpm, m.bars, m.root, m.seed, layers, MOODS[m.mood].label); setBusy(false); S().notify('Müzik kütüphaneye eklendi: ' + a.name); }}>+ Kütüphaneye ekle</button>
      </div>
    </div>
  );
}

function SfxGen() {
  const [t, setT] = useState<SfxType>('whoosh'); const [dur, setDur] = useState(1.5); const [pitch, setPitch] = useState(1); const [seed, setSeed] = useState(1);
  return (
    <div className="card col">
      <h3>💥 SFX üretici</h3>
      <div className="grid3">{(Object.keys(SFX_TYPES) as SfxType[]).map(k => <button key={k} className={t === k ? 'on' : ''} onClick={async () => { setT(k); audition(await genSfx(k, dur, seed, pitch)); }}>{SFX_TYPES[k]}</button>)}</div>
      <div className="grid3">
        <div className="col"><label>Süre {dur}s</label><input type="range" min={0.1} max={8} step={0.1} value={dur} onChange={e => setDur(Number(e.target.value))} /></div>
        <div className="col"><label>Perde ×{pitch}</label><input type="range" min={0.4} max={2.5} step={0.05} value={pitch} onChange={e => setPitch(Number(e.target.value))} /></div>
        <div className="col"><label>Varyasyon</label><input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} /></div>
      </div>
      <div className="row"><button onClick={async () => audition(await genSfx(t, dur, seed, pitch))}>▶ Dinle</button>
        <button className="pri" onClick={async () => { const a = await makeSfxAsset(t, dur, seed, pitch, SFX_TYPES[t]); S().notify('Eklendi: ' + a.name); }}>+ Kütüphaneye</button>
        <button onClick={async () => { const a = await makeSfxAsset(t, dur, seed, pitch, SFX_TYPES[t]); placeAsset(a); S().notify('Playhead konumuna eklendi'); }}>+ Timeline (playhead)</button></div>
    </div>
  );
}

function VoiceRec() {
  const [rec, setRec] = useState<MediaRecorder | null>(null); const [sec, setSec] = useState(0); const timer = useRef<number>();
  const start = async () => {
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const r = new MediaRecorder(st); const ch: Blob[] = []; r.ondataavailable = e => ch.push(e.data);
      r.onstop = async () => { st.getTracks().forEach(t => t.stop()); clearInterval(timer.current); const b = new Blob(ch, { type: r.mimeType }); const a = await assetFromBlob(b, `VO kayıt ${new Date().toLocaleTimeString('tr')}`, 'audio', 'import'); addAsset(a); S().notify('Kayıt eklendi'); setRec(null); };
      r.start(); setRec(r); setSec(0); timer.current = window.setInterval(() => setSec(s => s + 1), 1000);
    } catch (e) { S().notify('Mikrofon erişimi yok: ' + (e as Error).message); }
  };
  return (
    <div className="card col"><h3>🎙 Seslendirme kaydı (mikrofon)</h3><span className="small dim">Gürültü bastırma + otomatik kazanç açık. Kayıt doğrudan kütüphaneye düşer.</span>
      <div className="row">{!rec ? <button className="pri" onClick={start}>● Kaydı başlat</button> : <button className="pri" onClick={() => rec.stop()}>■ Durdur ({sec}s)</button>}</div></div>
  );
}

function TTS() {
  const [text, setText] = useState('Merhaba! Bu video yerel olarak üretildi.'); const [busy, setBusy] = useState(false);
  const voices = typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : [];
  const [vi, setVi] = useState(''); const [voice, setVoice] = useState('');
  return (
    <div className="card col"><h3>🗣 Metinden sese (TTS)</h3>
      <textarea rows={3} value={text} onChange={e => setText(e.target.value)} />
      <div className="row wrap">
        <select value={vi} onChange={e => setVi(e.target.value)}><option value="">Tarayıcı sesi (önizleme)</option>{voices.map(v => <option key={v.name} value={v.name}>{v.name} · {v.lang}</option>)}</select>
        <button onClick={() => { const u = new SpeechSynthesisUtterance(text); u.lang = 'tr-TR'; const v = voices.find(x => x.name === vi); if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); }}>▶ Dinle</button>
      </div>
      <div className="row"><input placeholder="Yerel TTS sesi (ör. af_heart)" value={voice} onChange={e => setVoice(e.target.value)} />
        <button className="pri" disabled={busy} onClick={async () => { setBusy(true); try { const c = await loadCfg(); if (!c.tts.enabled) throw new Error('AI Motorları’ndan yerel TTS sunucusunu etkinleştir'); const b = await ttsSpeak(c.tts, text, voice); const a = await assetFromBlob(b, 'TTS · ' + text.slice(0, 20), 'audio', 'ai'); addAsset(a); S().notify('TTS eklendi'); } catch (e) { S().notify((e as Error).message); } setBusy(false); }}>Yerel TTS ile üret → kütüphane</button></div>
      <div className="hint">Tarayıcı sesi yalnızca önizlemedir (dosyaya yazılamaz). Dosya için: mikrofon kaydı ya da yerel TTS sunucusu (Kokoro-FastAPI, Chatterbox, Piper — OpenAI-uyumlu <span className="mono">/v1/audio/speech</span>).</div>
    </div>
  );
}
