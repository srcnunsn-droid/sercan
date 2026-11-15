// Ritim (beat) algılama: spectral flux onset → otokorelasyonla tempo → faz hizalı beat ızgarası
// Tamamen yerel, herhangi bir müzik dosyasında çalışır.

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

export interface BeatResult { bpm: number; beats: number[]; onsets: number[]; confidence: number }

export function detectBeats(buf: AudioBuffer, from = 0, to = buf.duration): BeatResult {
  const sr = buf.sampleRate, N = 1024, H = 512;
  const ch0 = buf.getChannelData(0), ch1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : ch0;
  const s0 = Math.floor(from * sr), s1 = Math.min(ch0.length, Math.floor(to * sr));
  const frames = Math.max(0, Math.floor((s1 - s0 - N) / H));
  const win = new Float32Array(N).map((_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  let prev = new Float32Array(N / 2); const flux = new Float32Array(frames);
  const re = new Float32Array(N), im = new Float32Array(N);
  for (let f = 0; f < frames; f++) {
    const o = s0 + f * H;
    for (let i = 0; i < N; i++) { re[i] = ((ch0[o + i] + ch1[o + i]) * 0.5) * win[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(N / 2); let sum = 0;
    for (let k = 1; k < N / 2; k++) { const m = Math.log1p(10 * Math.hypot(re[k], im[k])); mag[k] = m; const d = m - prev[k]; if (d > 0) sum += d * (k < 40 ? 1.6 : 1); } // düşük frekans (kick) ağırlıklı
    flux[f] = sum; prev = mag;
  }
  // normalize + yerel ortalama çıkar
  const env = new Float32Array(frames); const w = 8;
  for (let i = 0; i < frames; i++) { let m = 0, c = 0; for (let j = Math.max(0, i - w); j < Math.min(frames, i + w); j++) { m += flux[j]; c++; } env[i] = Math.max(0, flux[i] - (m / c) * 1.05); }
  const mx = env.reduce((a, b) => Math.max(a, b), 1e-9); for (let i = 0; i < frames; i++) env[i] /= mx;
  const fps = sr / H;
  // onsetler (tepe noktaları)
  const onsets: number[] = [];
  for (let i = 2; i < frames - 2; i++) if (env[i] > 0.18 && env[i] >= env[i - 1] && env[i] >= env[i + 1] && env[i] >= env[i - 2] && env[i] >= env[i + 2]) { const t = from + i / fps; if (!onsets.length || t - onsets[onsets.length - 1] > 0.08) onsets.push(t); }
  // tempo: otokorelasyon 70–180 BPM, insan algısına yakın tempoya hafif öncelik
  let bestLag = 0, best = -1; const scores: number[] = [];
  const minLag = Math.floor((60 / 180) * fps), maxLag = Math.ceil((60 / 70) * fps);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0; for (let i = lag; i < frames; i++) s += env[i] * env[i - lag];
    const bpm = (60 * fps) / lag; s *= Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.9, 2));
    scores.push(s); if (s > best) { best = s; bestLag = lag; }
  }
  const mean = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
  if (!bestLag) return { bpm: 0, beats: [], onsets, confidence: 0 };
  // alt-kare hassasiyeti için parabolik iyileştirme
  const i0 = bestLag - minLag; const a = scores[i0 - 1] ?? best, c = scores[i0 + 1] ?? best;
  const refined = bestLag + (a - c) / (2 * (a - 2 * best + c) || 1) * 1;
  const period = refined / fps;
  // faz: beat ızgarasının onset enerjisiyle en çok çakıştığı ofset
  let bestPhase = 0, bp = -1; const steps = 40;
  for (let k = 0; k < steps; k++) {
    const ph = (k / steps) * period; let s = 0;
    for (let t = ph; t < (frames / fps); t += period) { const i = Math.round(t * fps); s += (env[i] ?? 0) + 0.5 * ((env[i - 1] ?? 0) + (env[i + 1] ?? 0)); }
    if (s > bp) { bp = s; bestPhase = ph; }
  }
  // ızgarayı onsetlere en küçük kareler ile oturt (tempo + faz ince ayarı) — uzun parçalarda kaymayı önler
  let per = period, ph0 = from + bestPhase;
  for (let it = 0; it < 3; it++) {
    const pairs: [number, number][] = [];
    for (const o of onsets) { const k = Math.round((o - ph0) / per); if (k >= 0 && Math.abs(o - (ph0 + k * per)) < per * 0.2) pairs.push([k, o]); }
    if (pairs.length < 4) break;
    const n = pairs.length, sk = pairs.reduce((a, p) => a + p[0], 0), so = pairs.reduce((a, p) => a + p[1], 0);
    const skk = pairs.reduce((a, p) => a + p[0] * p[0], 0), sko = pairs.reduce((a, p) => a + p[0] * p[1], 0);
    const den = n * skk - sk * sk; if (!den) break;
    const np = (n * sko - sk * so) / den; if (Math.abs(np / per - 1) > 0.03) break;
    per = np; ph0 = (so - per * sk) / n;
  }
  while (ph0 - per >= from - 1e-6) ph0 -= per;
  const beats: number[] = []; for (let t = ph0; t < to; t += per) if (t >= from - 1e-6) beats.push(+t.toFixed(4));
  return { bpm: Math.round((60 / per) * 10) / 10, beats, onsets, confidence: Math.min(1, best / (mean * 3 || 1)) };
}
