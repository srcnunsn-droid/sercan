// Oynatma kontrolcüsü: zaman, video senkronu ve ses
import { S } from '../store';
import { AudioPlayer } from './audio';
import { activeClips, sourceTime } from './render';
import { getRuntime } from './media';
import { projectDuration } from '../util';

export const audio = new AudioPlayer();
let raf = 0, from = 0, t0 = 0;

export function syncVideos(t: number, playing: boolean) {
  const p = S().project; const act = new Set<HTMLVideoElement>();
  for (const c of activeClips(p, t)) {
    const v = getRuntime(c.assetId)?.video; if (!v) continue; act.add(v);
    const st = Math.min(sourceTime(c, t), (v.duration || 1) - 0.01);
    if (playing) {
      v.playbackRate = c.speed;
      if (Math.abs(v.currentTime - st) > 0.25) v.currentTime = st;
      if (v.paused) v.play().catch(() => {});
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - st) > 0.02 && !v.seeking) v.currentTime = st;
    }
  }
  for (const c of p.clips) { const v = getRuntime(c.assetId)?.video; if (v && !act.has(v) && !v.paused) v.pause(); }
}

export function play() {
  const s = S(); if (s.playing) return;
  const end = projectDuration(s.project); if (end <= 0) return;
  from = s.time >= end - 0.05 ? 0 : s.time; t0 = performance.now();
  audio.start(s.project, from);
  s.ui({ playing: true, time: from });
  const tick = () => {
    const st = S(); if (!st.playing) return;
    let t = from + (performance.now() - t0) / 1000;
    const dur = projectDuration(st.project);
    if (t >= dur) {
      if (st.loop) { from = 0; t0 = performance.now(); audio.start(st.project, 0); t = 0; }
      else { pause(); st.ui({ time: dur }); return; }
    }
    syncVideos(t, true); st.ui({ time: t });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

export function pause() {
  cancelAnimationFrame(raf); audio.stop(); S().ui({ playing: false }); syncVideos(S().time, false);
}
export const toggle = () => (S().playing ? pause() : play());
export function seek(t: number) {
  const s = S(); const was = s.playing; if (was) pause();
  s.ui({ time: Math.max(0, t) }); syncVideos(Math.max(0, t), false);
  if (was) play();
}
