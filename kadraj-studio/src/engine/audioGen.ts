// Prosedürel ses üretimi — API'siz, tamamen tarayıcıda sentez (SFX + müzik)
import { rng } from '../util';

const SR = 44100;
function noiseBuf(ctx: BaseAudioContext, secs: number, seed = 1) {
  const b = ctx.createBuffer(1, Math.ceil(secs * ctx.sampleRate), ctx.sampleRate); const d = b.getChannelData(0); const r = rng(seed);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; return b;
}
function impulse(ctx: BaseAudioContext, secs: number, decay: number) {
  const b = ctx.createBuffer(2, Math.ceil(secs * ctx.sampleRate), ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, decay); }
  return b;
}
function reverb(ctx: BaseAudioContext, dest: AudioNode, wet: number, secs = 2.5) {
  const inp = ctx.createGain(), dry = ctx.createGain(), w = ctx.createGain(), conv = ctx.createConvolver();
  conv.buffer = impulse(ctx, secs, 3); dry.gain.value = 1; w.gain.value = wet;
  inp.connect(dry).connect(dest); inp.connect(conv).connect(w).connect(dest); return inp;
}

export const SFX_TYPES = {
  whoosh: 'Whoosh (geçiş)', impact: 'Darbe / Boom', riser: 'Yükselen (riser)', downlifter: 'Alçalan (downlifter)', braam: 'Sinematik BRAAM',
  pop: 'UI Pop', click: 'Tık', notify: 'Bildirim', glitch: 'Glitch gürültü', heartbeat: 'Kalp atışı', typing: 'Klavye', drone: 'Gerilim dronu', sparkle: 'Parıltı', swipe: 'Swipe (kısa)',
} as const;
export type SfxType = keyof typeof SFX_TYPES;

export async function genSfx(type: SfxType, dur: number, seed = 1, pitch = 1): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(dur * SR), SR);
  const out = ctx.createGain(); out.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor(); out.connect(comp).connect(ctx.destination);
  const rv = reverb(ctx, out, type === 'click' || type === 'typing' ? 0.08 : 0.35);
  const r = rng(seed);
  const env = (g: GainNode, a: number, peak: number, d: number, t0 = 0) => { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d); };
  const noise = (secs: number) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx, secs, seed); return s; };
  const osc = (type: OscillatorType, f: number) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * pitch; return o; };

  switch (type) {
    case 'whoosh': case 'swipe': {
      const n = noise(dur), bp = ctx.createBiquadFilter(), g = ctx.createGain(), pan = ctx.createStereoPanner();
      bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(300 * pitch, 0); bp.frequency.exponentialRampToValueAtTime(5000 * pitch, dur * 0.55); bp.frequency.exponentialRampToValueAtTime(600 * pitch, dur);
      g.gain.setValueAtTime(0.0001, 0); g.gain.exponentialRampToValueAtTime(1, dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, dur);
      pan.pan.setValueAtTime(-0.8, 0); pan.pan.linearRampToValueAtTime(0.8, dur);
      n.connect(bp).connect(g).connect(pan).connect(rv); n.start(); break;
    }
    case 'impact': {
      const o = osc('sine', 120), g = ctx.createGain(); o.frequency.exponentialRampToValueAtTime(32 * pitch, 0.6); env(g, 0.005, 1, dur * 0.8); o.connect(g).connect(rv); o.start();
      const n = noise(0.4), lp = ctx.createBiquadFilter(), g2 = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 2200; env(g2, 0.002, 0.7, 0.35); n.connect(lp).connect(g2).connect(rv); n.start();
      const sub = osc('triangle', 55), g3 = ctx.createGain(); env(g3, 0.01, 0.6, dur * 0.9); sub.connect(g3).connect(out); sub.start(); break;
    }
    case 'riser': case 'downlifter': {
      const up = type === 'riser';
      const n = noise(dur), hp = ctx.createBiquadFilter(), g = ctx.createGain(); hp.type = 'bandpass'; hp.Q.value = 3;
      hp.frequency.setValueAtTime(up ? 200 : 6000, 0); hp.frequency.exponentialRampToValueAtTime(up ? 8000 : 150, dur);
      g.gain.setValueAtTime(up ? 0.01 : 0.8, 0); g.gain.exponentialRampToValueAtTime(up ? 0.8 : 0.001, dur); n.connect(hp).connect(g).connect(rv); n.start();
      const o = osc('sawtooth', up ? 110 : 880), g2 = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
      o.frequency.exponentialRampToValueAtTime(up ? 880 * pitch : 55 * pitch, dur); g2.gain.setValueAtTime(up ? 0.001 : 0.25, 0); g2.gain.exponentialRampToValueAtTime(up ? 0.25 : 0.001, dur);
      o.connect(lp).connect(g2).connect(rv); o.start(); break;
    }
    case 'braam': {
      [55, 55.6, 82.4, 110.3].forEach((f, i) => { const o = osc('sawtooth', f), lp = ctx.createBiquadFilter(), g = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, 0); lp.frequency.linearRampToValueAtTime(1400, 0.3); lp.frequency.exponentialRampToValueAtTime(150, dur); g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.28, 0.08); g.gain.exponentialRampToValueAtTime(0.001, dur); o.connect(lp).connect(g).connect(rv); o.start(i * 0.005); });
      break;
    }
    case 'pop': { const o = osc('sine', 600), g = ctx.createGain(); o.frequency.exponentialRampToValueAtTime(1400 * pitch, 0.06); env(g, 0.003, 0.8, 0.12); o.connect(g).connect(rv); o.start(); break; }
    case 'click': { const n = noise(0.05), hp = ctx.createBiquadFilter(), g = ctx.createGain(); hp.type = 'highpass'; hp.frequency.value = 2500; env(g, 0.001, 1, 0.03); n.connect(hp).connect(g).connect(rv); n.start(); break; }
    case 'notify': { [880, 1318.5].forEach((f, i) => { const o = osc('sine', f), g = ctx.createGain(); env(g, 0.005, 0.5, 0.35, i * 0.12); o.connect(g).connect(rv); o.start(i * 0.12); }); break; }
    case 'glitch': {
      for (let t = 0; t < dur; t += 0.03 + r() * 0.06) { const o = osc(r() > 0.5 ? 'square' : 'sawtooth', 80 + r() * 2000), g = ctx.createGain(); env(g, 0.001, 0.25, 0.03 + r() * 0.05, t); o.connect(g).connect(out); o.start(t); o.stop(t + 0.12); }
      break;
    }
    case 'heartbeat': {
      for (let t = 0; t < dur; t += 0.9) [0, 0.22].forEach((d, i) => { const o = osc('sine', 60), g = ctx.createGain(); o.frequency.setValueAtTime(70 * pitch, t + d); o.frequency.exponentialRampToValueAtTime(40, t + d + 0.15); env(g, 0.005, i ? 0.6 : 1, 0.18, t + d); o.connect(g).connect(rv); o.start(t + d); o.stop(t + d + 0.3); });
      break;
    }
    case 'typing': {
      for (let t = 0.02; t < dur - 0.05; t += 0.06 + r() * 0.12) { const n = noise(0.04), bp = ctx.createBiquadFilter(), g = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = 2000 + r() * 3000; bp.Q.value = 2; env(g, 0.001, 0.6 + r() * 0.4, 0.025, t); n.connect(bp).connect(g).connect(rv); n.start(t); }
      break;
    }
    case 'drone': {
      [41.2, 61.7, 82.4, 87.3].forEach(f => { const o = osc('sawtooth', f), lp = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = osc('sine', 0.1 + r() * 0.3), lg = ctx.createGain();
        lp.type = 'lowpass'; lp.frequency.value = 400; lg.gain.value = 250; lfo.connect(lg).connect(lp.frequency);
        g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.15, dur * 0.3); g.gain.linearRampToValueAtTime(0, dur); o.connect(lp).connect(g).connect(rv); o.start(); lfo.start(); });
      break;
    }
    case 'sparkle': {
      for (let i = 0; i < 14; i++) { const t = r() * dur * 0.7, o = osc('sine', 1800 + r() * 3500), g = ctx.createGain(); env(g, 0.002, 0.25, 0.2 + r() * 0.3, t); o.connect(g).connect(rv); o.start(t); o.stop(t + 0.6); }
      break;
    }
  }
  return ctx.startRendering();
}

// ---------------- Müzik üretici ----------------
export const MOODS = {
  epik: { label: 'Epik / Sinematik', prog: [[0, 3, 7], [8, 12, 15], [3, 7, 10], [10, 14, 17]], minor: true, drums: 'epic', bpm: 90 },
  duygusal: { label: 'Duygusal', prog: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], minor: false, drums: 'soft', bpm: 72 },
  enerjik: { label: 'Enerjik / Reklam', prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], minor: false, drums: 'four', bpm: 124 },
  gerilim: { label: 'Gerilim / Thriller', prog: [[0, 3, 7], [1, 5, 8], [0, 3, 6], [11, 14, 17]], minor: true, drums: 'pulse', bpm: 100 },
  lofi: { label: 'Lo-fi / Chill', prog: [[2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11], [9, 12, 16, 19]], minor: false, drums: 'lofi', bpm: 82 },
  karanlik: { label: 'Karanlık / Belgesel', prog: [[0, 3, 7], [5, 8, 12], [8, 12, 15], [7, 10, 14]], minor: true, drums: 'none', bpm: 70 },
  minimal: { label: 'Minimal / Kurumsal', prog: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16], [7, 11, 14]], minor: false, drums: 'soft', bpm: 105 },
} as const;
export type Mood = keyof typeof MOODS;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export async function genMusic(mood: Mood, bpm: number, bars: number, root = 57, seed = 3, layers = { pad: true, bass: true, arp: true, drums: true }): Promise<AudioBuffer> {
  const M = MOODS[mood]; const beat = 60 / bpm; const barLen = beat * 4; const dur = bars * barLen + 2.5;
  const ctx = new OfflineAudioContext(2, Math.ceil(dur * SR), SR);
  const master = ctx.createGain(); master.gain.value = 0.55;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4; master.connect(comp).connect(ctx.destination);
  const rv = reverb(ctx, master, mood === 'lofi' ? 0.2 : 0.45, 3);
  const r = rng(seed);
  const note = (type: OscillatorType, f: number, t: number, d: number, vol: number, dest: AudioNode, cutoff = 2000, a = 0.01, rel = 0.3) => {
    const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; o.detune.value = (r() - 0.5) * 12; lp.type = 'lowpass'; lp.frequency.value = cutoff;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.setValueAtTime(vol, t + Math.max(a, d - rel)); g.gain.linearRampToValueAtTime(0, t + d + rel);
    o.connect(lp).connect(g).connect(dest); o.start(t); o.stop(t + d + rel + 0.05);
  };
  const nb = noiseBuf(ctx, 1, seed);
  const hit = (t: number, kind: 'kick' | 'snare' | 'hat' | 'tom', vol = 1) => {
    if (kind === 'kick' || kind === 'tom') { const o = ctx.createOscillator(), g = ctx.createGain(); const f0 = kind === 'kick' ? 150 : 220; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(kind === 'kick' ? 42 : 80, t + 0.18); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'kick' ? 0.45 : 0.6)); o.connect(g).connect(kind === 'tom' ? rv : master); o.start(t); o.stop(t + 0.7); }
    else { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7000 : 1800; g.gain.setValueAtTime(vol * (kind === 'hat' ? 0.25 : 0.6), t); g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'hat' ? 0.05 : 0.2)); s.connect(f).connect(g).connect(kind === 'snare' ? rv : master); s.start(t, r() * 0.5, 0.3); }
  };
  const base = M.minor ? root : root;
  for (let b = 0; b < bars; b++) {
    const ch = M.prog[b % M.prog.length]; const t0 = b * barLen;
    const intensity = Math.min(1, 0.4 + b / Math.max(1, bars - 1) * 0.8);
    if (layers.pad) ch.forEach(iv => { note('sawtooth', mtof(base + iv), t0, barLen, 0.05, rv, 900 + intensity * 900, barLen * 0.25, barLen * 0.3); note('triangle', mtof(base + iv + 12), t0, barLen, 0.03, rv, 3000, 0.3, 0.6); });
    if (layers.bass) { const bf = mtof(base + ch[0] - 24); if (M.drums === 'four' || M.drums === 'pulse') for (let i = 0; i < 8; i++) note('sawtooth', bf, t0 + i * beat / 2, beat / 2.4, 0.16, master, 500, 0.005, 0.05); else note('sine', bf, t0, barLen * 0.95, 0.3, master, 400, 0.05, 0.2); }
    if (layers.arp && b >= 1) { const steps = mood === 'karanlik' ? 4 : 8; for (let i = 0; i < steps; i++) { const iv = ch[i % ch.length] + (i >= ch.length ? 12 : 0) + 12; note(mood === 'lofi' ? 'sine' : 'triangle', mtof(base + iv), t0 + i * barLen / steps, barLen / steps * 0.8, 0.06 * intensity, rv, 4000, 0.005, 0.15); } }
    if (layers.drums && M.drums !== 'none') {
      for (let i = 0; i < 4; i++) {
        const t = t0 + i * beat;
        if (M.drums === 'four') { hit(t, 'kick'); if (i % 2) hit(t, 'snare'); hit(t + beat / 2, 'hat'); hit(t, 'hat', 0.5); }
        else if (M.drums === 'epic') { if (i === 0 || i === 2) hit(t, 'tom', 0.9); if (i === 3) hit(t + beat / 2, 'tom', 0.6); if (b % 4 === 3 && i === 3) hit(t, 'snare'); }
        else if (M.drums === 'pulse') { hit(t, 'kick', 0.8); hit(t + beat / 2, 'hat', 0.6); if (i === 2) hit(t, 'snare', 0.6); }
        else if (M.drums === 'lofi') { if (i === 0 || (i === 2 && r() > 0.3)) hit(t + (i ? beat / 4 : 0), 'kick', 0.8); if (i % 2) hit(t, 'snare', 0.6); hit(t, 'hat', 0.6); hit(t + beat * 0.55, 'hat', 0.35); }
        else if (M.drums === 'soft' && b >= 2) { if (i === 0) hit(t, 'kick', 0.5); if (i === 2) hit(t, 'snare', 0.3); hit(t + beat / 2, 'hat', 0.35); }
      }
    }
  }
  // son akor
  M.prog[0].forEach(iv => note('triangle', mtof(base + iv), bars * barLen, 2, 0.06, rv, 2000, 0.01, 1.2));
  return ctx.startRendering();
}
