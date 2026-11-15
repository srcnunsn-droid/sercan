// Kare kare (frame-accurate) MP4 dışa aktarım: WebCodecs + mp4-muxer
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { Project } from '../types';
import { activeClips, renderFrame, sourceTime } from './render';
import { getRuntime, seekVideo } from './media';
import { mixOffline, bufferToWav } from './audio';
import { projectDuration } from '../util';

export interface ExportOpts { width: number; height: number; fps: number; bitrate: number; from: number; to: number; codec: 'avc' | 'vp9' | 'hevc'; audio: boolean }
export type Progress = (p: number, msg: string) => void;

async function prepareFrame(p: Project, t: number) {
  const seeks: Promise<void>[] = [];
  for (const c of activeClips(p, t)) {
    const v = getRuntime(c.assetId)?.video; if (!v) continue;
    v.pause(); seeks.push(seekVideo(v, Math.min(sourceTime(c, t), (v.duration || 1) - 0.001)));
  }
  await Promise.all(seeks);
}

export function webCodecsSupported() { return typeof VideoEncoder !== 'undefined' && typeof AudioEncoder !== 'undefined'; }

export async function exportMp4(p: Project, o: ExportOpts, onProg: Progress, signal: { cancel: boolean }): Promise<Blob> {
  const dur = Math.max(0.1, o.to - o.from);
  const W = o.width - (o.width % 2), H = o.height - (o.height % 2);
  const codecStr = o.codec === 'vp9' ? 'vp09.00.40.08' : o.codec === 'hevc' ? 'hvc1.1.6.L120.90' : (W * H > 1920 * 1080 ? 'avc1.640033' : 'avc1.640028');
  const vcfg: VideoEncoderConfig = { codec: codecStr, width: W, height: H, bitrate: o.bitrate, framerate: o.fps, latencyMode: 'quality' };
  const vs = await VideoEncoder.isConfigSupported(vcfg);
  if (!vs.supported) throw new Error(`Bu tarayıcı ${o.codec.toUpperCase()} ${W}x${H} kodlamayı desteklemiyor. Chrome/Edge güncel sürüm önerilir ya da daha düşük çözünürlük seçin.`);

  if (document.fonts) await document.fonts.ready;
  let audioBuf: AudioBuffer | null = null; let acodec: 'aac' | 'opus' | null = null;
  if (o.audio) {
    onProg(0, 'Ses miksleniyor…');
    const full = await mixOffline(p, o.to, 48000);
    audioBuf = full;
    for (const [c, mc] of [['mp4a.40.2', 'aac'], ['opus', 'opus']] as const) {
      const s = await AudioEncoder.isConfigSupported({ codec: c, sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 });
      if (s.supported) { acodec = mc; break; }
    }
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: o.codec === 'vp9' ? 'vp9' : o.codec === 'hevc' ? 'hevc' : 'avc', width: W, height: H, frameRate: o.fps },
    audio: acodec && audioBuf ? { codec: acodec, numberOfChannels: 2, sampleRate: 48000 } : undefined,
    fastStart: 'in-memory', firstTimestampBehavior: 'offset',
  });
  let err: Error | null = null;
  const venc = new VideoEncoder({ output: (ch, meta) => muxer.addVideoChunk(ch, meta), error: e => (err = e as Error) });
  venc.configure(vcfg);

  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { alpha: false })!;
  const scale = W / p.settings.width;
  const frames = Math.ceil(dur * o.fps);
  for (let i = 0; i < frames; i++) {
    if (signal.cancel) { venc.close(); throw new Error('İptal edildi'); }
    if (err) throw err;
    const t = o.from + i / o.fps;
    await prepareFrame(p, t);
    renderFrame(ctx, p, t, scale);
    const vf = new VideoFrame(cv, { timestamp: Math.round((i / o.fps) * 1e6), duration: Math.round(1e6 / o.fps) });
    venc.encode(vf, { keyFrame: i % (o.fps * 2) === 0 }); vf.close();
    while (venc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 1));
    if (i % 3 === 0) { onProg(i / frames * 0.92, `Kare ${i}/${frames}`); await new Promise(r => setTimeout(r, 0)); }
  }
  await venc.flush(); venc.close();

  if (audioBuf && acodec) {
    onProg(0.94, 'Ses kodlanıyor…');
    const aenc = new AudioEncoder({ output: (ch, meta) => muxer.addAudioChunk(ch, meta), error: e => (err = e as Error) });
    aenc.configure({ codec: acodec === 'aac' ? 'mp4a.40.2' : 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 });
    const s0 = Math.floor(o.from * 48000), s1 = Math.min(audioBuf.length, Math.floor(o.to * 48000));
    const L = audioBuf.getChannelData(0), R = audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : L;
    const CH = 4800;
    for (let s = s0; s < s1; s += CH) {
      const n = Math.min(CH, s1 - s); const data = new Float32Array(n * 2); data.set(L.subarray(s, s + n), 0); data.set(R.subarray(s, s + n), n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(((s - s0) / 48000) * 1e6), data });
      aenc.encode(ad); ad.close();
    }
    await aenc.flush(); aenc.close();
  }
  if (err) throw err;
  muxer.finalize();
  onProg(1, 'Tamamlandı');
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}

/** Yedek: gerçek zamanlı MediaRecorder (WebCodecs yoksa) */
export async function exportRealtimeWebm(p: Project, o: ExportOpts, onProg: Progress, signal: { cancel: boolean }): Promise<Blob> {
  const cv = document.createElement('canvas'); cv.width = o.width; cv.height = o.height; const ctx = cv.getContext('2d')!;
  const stream = cv.captureStream(o.fps);
  if (o.audio) {
    const buf = await mixOffline(p, o.to, 48000); const ac = new AudioContext(); const src = ac.createBufferSource(); src.buffer = buf;
    const d = ac.createMediaStreamDestination(); src.connect(d); d.stream.getAudioTracks().forEach(t => stream.addTrack(t)); src.start(0, o.from);
  }
  const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm', videoBitsPerSecond: o.bitrate });
  const chunks: Blob[] = []; rec.ondataavailable = e => chunks.push(e.data);
  const done = new Promise<void>(r => (rec.onstop = () => r()));
  rec.start(250);
  const t0 = performance.now(); const scale = o.width / p.settings.width;
  for (const c of p.clips) { const v = getRuntime(c.assetId)?.video; if (v) v.pause(); }
  await new Promise<void>(res => {
    const loop = () => {
      const t = o.from + (performance.now() - t0) / 1000;
      if (t >= o.to || signal.cancel) return res();
      for (const c of activeClips(p, t)) { const v = getRuntime(c.assetId)?.video; if (v) { const st = sourceTime(c, t); if (Math.abs(v.currentTime - st) > 0.2) v.currentTime = st; if (v.paused) v.play().catch(() => {}); } }
      renderFrame(ctx, p, t, scale); onProg((t - o.from) / (o.to - o.from), 'Gerçek zamanlı kayıt…'); requestAnimationFrame(loop);
    };
    loop();
  });
  rec.stop(); await done;
  return new Blob(chunks, { type: 'video/webm' });
}

export async function exportAudioWav(p: Project) { return bufferToWav(await mixOffline(p, projectDuration(p), 48000)); }

export async function exportFrame(p: Project, t: number): Promise<Blob> {
  const cv = document.createElement('canvas'); cv.width = p.settings.width; cv.height = p.settings.height;
  await prepareFrame(p, t); renderFrame(cv.getContext('2d')!, p, t, 1);
  return new Promise(r => cv.toBlob(b => r(b!), 'image/png'));
}
