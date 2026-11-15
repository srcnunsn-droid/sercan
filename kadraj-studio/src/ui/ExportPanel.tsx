import { useState } from 'react';
import { useS, S } from '../store';
import { exportAudioWav, exportFrame, exportMp4, exportRealtimeWebm, webCodecsSupported } from '../engine/export';
import { download, fmtTime, projectDuration } from '../util';
import { exportProjectFile } from '../actions';

const PRESETS = [
  { l: 'YouTube 1080p', w: 1920, h: 1080, br: 12 }, { l: 'YouTube 4K', w: 3840, h: 2160, br: 40 }, { l: 'Reels/Shorts/TikTok', w: 1080, h: 1920, br: 10 },
  { l: 'Instagram 4:5', w: 1080, h: 1350, br: 8 }, { l: 'Kare 1:1', w: 1080, h: 1080, br: 8 }, { l: 'Taslak 540p', w: 960, h: 540, br: 3 },
];

export function ExportPanel() {
  const p = useS(s => s.project); const dur = projectDuration(p); const time = useS(s => s.time);
  const [o, setO] = useState({ scale: 1, fps: p.settings.fps, br: 12, codec: 'avc' as 'avc' | 'vp9' | 'hevc', audio: true, range: 'all' as 'all' | 'custom', from: 0, to: dur });
  const [prog, setProg] = useState<{ p: number; m: string } | null>(null); const [sig] = useState({ cancel: false });
  const W = Math.round(p.settings.width * o.scale / 2) * 2, H = Math.round(p.settings.height * o.scale / 2) * 2;
  const from = o.range === 'all' ? 0 : o.from, to = o.range === 'all' ? dur : Math.min(o.to, dur);
  const name = (p.name || 'kadraj').replace(/[^\w\-ğüşıöçĞÜŞİÖÇ ]/g, '').trim() || 'kadraj';

  const run = async (realtime = false) => {
    if (dur <= 0) return S().notify('Timeline boş');
    sig.cancel = false; setProg({ p: 0, m: 'Hazırlanıyor…' }); const t0 = performance.now();
    try {
      const opts = { width: W, height: H, fps: o.fps, bitrate: o.br * 1e6, from, to, codec: o.codec, audio: o.audio };
      const blob = realtime || !webCodecsSupported() ? await exportRealtimeWebm(p, opts, (x, m) => setProg({ p: x, m }), sig) : await exportMp4(p, opts, (x, m) => setProg({ p: x, m }), sig);
      download(blob, `${name}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
      S().notify(`Dışa aktarıldı · ${(blob.size / 1e6).toFixed(1)} MB · ${((performance.now() - t0) / 1000).toFixed(1)} sn`);
    } catch (e) { S().notify('Hata: ' + (e as Error).message); }
    setProg(null);
  };

  if (p.mode === 'image') return <div className="page"><div className="card col" style={{ maxWidth: 560 }}><h3>🖼 Görsel belge</h3><span className="muted">Görsel belgeler Kurgu ekranındaki Katmanlar panelinden PNG / JPG / WebP olarak (0.5×–2× ölçekle) dışa aktarılır.</span><button className="pri" style={{ alignSelf: 'start' }} onClick={() => S().ui({ panel: 'editor' })}>Katmanlara git →</button></div></div>;
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 14 }}><h2>📤 Dışa Aktar</h2><span className={'chip ' + (webCodecsSupported() ? 'ok' : 'acc')}>{webCodecsSupported() ? 'WebCodecs: kare-doğru MP4 hazır' : 'WebCodecs yok — gerçek zamanlı WebM'}</span></div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="card col">
          <h3>Video</h3>
          <div className="row wrap">{PRESETS.map(pr => <button key={pr.l} className="sm" onClick={() => { S().set(d => { d.settings.width = pr.w; d.settings.height = pr.h; }); setO({ ...o, scale: 1, br: pr.br }); }}>{pr.l}</button>)}</div>
          <div className="grid2">
            <div className="col"><label>Çözünürlük ölçeği</label><select value={o.scale} onChange={e => setO({ ...o, scale: Number(e.target.value) })}><option value={2}>200%</option><option value={1}>100%</option><option value={0.75}>75%</option><option value={0.5}>50%</option><option value={0.25}>25%</option></select></div>
            <div className="col"><label>Çıktı</label><div className="tc">{W} × {H}</div></div>
            <div className="col"><label>FPS</label><select value={o.fps} onChange={e => setO({ ...o, fps: Number(e.target.value) })}>{[24, 25, 30, 50, 60].map(f => <option key={f}>{f}</option>)}</select></div>
            <div className="col"><label>Kodek</label><select value={o.codec} onChange={e => setO({ ...o, codec: e.target.value as any })}><option value="avc">H.264 (en uyumlu)</option><option value="hevc">H.265/HEVC</option><option value="vp9">VP9</option></select></div>
            <div className="col"><label>Bitrate {o.br} Mbps</label><input type="range" min={1} max={80} value={o.br} onChange={e => setO({ ...o, br: Number(e.target.value) })} /></div>
            <div className="col"><label>Ses</label><label className="row"><input type="checkbox" checked={o.audio} onChange={e => setO({ ...o, audio: e.target.checked })} />AAC/Opus 48kHz stereo</label></div>
          </div>
          <div className="row"><label>Aralık</label><select value={o.range} onChange={e => setO({ ...o, range: e.target.value as any, to: dur })}><option value="all">Tümü ({fmtTime(dur)})</option><option value="custom">Özel</option></select>
            {o.range === 'custom' && <><input type="number" step={0.1} style={{ width: 80 }} value={o.from} onChange={e => setO({ ...o, from: Number(e.target.value) })} />→<input type="number" step={0.1} style={{ width: 80 }} value={o.to} onChange={e => setO({ ...o, to: Number(e.target.value) })} /></>}</div>
          <span className="small dim">Tahmini boyut: ~{(((o.br + (o.audio ? 0.19 : 0)) * (to - from)) / 8).toFixed(1)} MB</span>
          {!prog ? <div className="row"><button className="pri grow" onClick={() => run(false)}>⬇ MP4 olarak render al</button><button onClick={() => run(true)} title="Yedek yöntem">WebM (gerçek zamanlı)</button></div>
            : <div className="col"><div className="bar"><i style={{ width: `${prog.p * 100}%` }} /></div><div className="row"><span className="small">{prog.m} · {Math.round(prog.p * 100)}%</span><span className="sp" /><button className="sm" onClick={() => (sig.cancel = true)}>İptal</button></div></div>}
        </div>
        <div className="col" style={{ gap: 12 }}>
          <div className="card col"><h3>Diğer çıktılar</h3>
            <div className="row wrap">
              <button onClick={async () => download(await exportFrame(p, time), `${name}-kare-${time.toFixed(2)}.png`)}>🖼 Mevcut kare (PNG, tam çözünürlük)</button>
              <button onClick={async () => download(await exportAudioWav(p), `${name}-miks.wav`)}>🔊 Ses miksi (WAV)</button>
              <button onClick={async () => download(await exportProjectFile(), `${name}.kadraj.json`)}>💾 Proje paketi (medya dahil)</button>
            </div>
            <span className="small dim">Thumbnail için: playhead'i istediğin kareye getir → PNG al. Proje paketi başka bilgisayarda aynen açılır.</span>
          </div>
          <div className="hint">Render kare kare yapılır (gerçek zamandan bağımsız): ağır efektlerde bile kare atlamaz. Chrome/Edge en iyi sonucu verir. 4K + RGB split/glitch gibi piksel efektleri render süresini uzatır. Daha sonra ffmpeg/sunucu tarafı render (Remotion benzeri) eklenebilir.</div>
        </div>
      </div>
    </div>
  );
}
