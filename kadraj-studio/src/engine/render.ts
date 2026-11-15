// Kare render motoru — önizleme ve dışa aktarım aynı kodu kullanır (WYSIWYG)
import type { Clip, Effect, Project, TextProps, Transition, Transform } from '../types';
import { EASINGS, transformAt } from './interp';
import { mediaSource, getRuntime, sourceSize } from './media';
import { clamp, hashStr, rng } from '../util';
import { gpu, GPU_EFFECTS } from './gpu';
import { drawParticles, shapePath } from './particles';
import { applyMasks } from './masks';
import { applyChromaKey, applyGrade, applyLut, findLut, type GradeParams } from './color';

type Ctx = CanvasRenderingContext2D;
const pool: HTMLCanvasElement[] = [];
function layer(w: number, h: number) {
  const c = pool.pop() ?? document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext('2d', { willReadFrequently: !gpu() })!; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h);
  return { c, x, free: () => pool.push(c) };
}

let noise: HTMLCanvasElement | null = null;
function noiseTex() {
  if (noise) return noise;
  noise = document.createElement('canvas'); noise.width = noise.height = 256;
  const x = noise.getContext('2d')!; const d = x.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); return noise;
}

export function activeClips(p: Project, t: number) {
  const order = p.tracks.filter(tr => tr.kind === 'video' && !tr.hidden).map(tr => tr.id).reverse(); // alttaki iz önce
  return order.flatMap(tid => p.clips.filter(c => c.trackId === tid && t >= c.start && t < c.start + c.duration).sort((a, b) => a.start - b.start));
}

export function sourceTime(c: Clip, t: number) { return c.in + (t - c.start) * c.speed; }

/** Tüm sahneyi çizer. s = çıktı ölçeği (önizleme için < 1). */
export function renderFrame(ctx: Ctx, p: Project, t: number, s = 1, transparent = false) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (transparent) ctx.clearRect(0, 0, W, H); else { ctx.fillStyle = p.settings.bg; ctx.fillRect(0, 0, W, H); }
  for (const c of activeClips(p, t)) {
    try { if (c.kind === 'null') continue; if (c.kind === 'adjust') drawAdjust(ctx, p, c, t, s, W, H); else drawClip(ctx, p, c, t, s, W, H); } catch (e) { console.warn('render', e); }
  }
}

/** Renk efektlerini canvas filtre zincirine çevirir (GPU hızlandırmalı tarayıcı filtreleri) */
function cssFilters(on: Effect[]) {
  const f: string[] = [];
  for (const e of on) {
    if (e.type === 'brightness') f.push(`brightness(${e.p.v})`); if (e.type === 'contrast') f.push(`contrast(${e.p.v})`); if (e.type === 'saturation') f.push(`saturate(${e.p.v})`);
    if (e.type === 'hue') f.push(`hue-rotate(${e.p.deg}deg)`); if (e.type === 'grayscale') f.push(`grayscale(${e.p.v})`); if (e.type === 'sepia') f.push(`sepia(${e.p.v})`); if (e.type === 'invert') f.push(`invert(${e.p.v})`);
  }
  return f.join(' ');
}

/** Efekt listesini katmana uygula: ardışık GPU efektleri tek shader zincirinde, diğerleri CPU/2D */
function runEffects(L: { c: HTMLCanvasElement; x: Ctx }, on: Effect[], t: number, s: number, W: number, H: number, id: string, p: Project) {
  const G = gpu(); let batch: Effect[] = [];
  const flush = () => { if (!batch.length) return; let ok = false; try { ok = !!G && G.run(L.c, L.x, batch, p, s); } catch (err) { console.warn('GPU', err); } if (!ok) for (const e of batch) postEffect(L.c, L.x, e, t, s, W, H, id, p); batch = []; };
  for (const e of on) { if (G && GPU_EFFECTS.has(e.type)) batch.push(e); else { flush(); postEffect(L.c, L.x, e, t, s, W, H, id, p); } }
  flush();
}

/** Ayar katmanı: altındaki tüm görüntüye efekt uygular (maske efektiyle bölgesel) */
function drawAdjust(ctx: Ctx, p: Project, c: Clip, t: number, s: number, W: number, H: number) {
  const on = c.effects.filter(e => e.on && e.type !== 'shake'); if (!on.length) return;
  const local = t - c.start; const T = transformAt(c, local); const st = { wipe: 1, flash: 0 };
  if (p.mode !== 'image') { const { pin, pout } = transProgress(c, local); applyTransition(c.tIn, pin, T, W, H, st, 1); applyTransition(c.tOut, pout, T, W, H, st, -1); }
  if (T.opacity <= 0.001) return;
  const L = layer(W, H); const f = cssFilters(on); if (f) L.x.filter = f; L.x.drawImage(ctx.canvas, 0, 0); L.x.filter = 'none';
  runEffects(L, on, t, s, W, H, c.id, p);
  applyMasks(L.x, c, local, s, W, H, null, layer);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(T.opacity, 0, 1); ctx.globalCompositeOperation = c.blend || 'source-over';
  if (st.wipe < 1) { ctx.beginPath(); ctx.rect(0, 0, W * st.wipe, H); ctx.clip(); }
  ctx.drawImage(L.c, 0, 0); ctx.restore(); L.free();
}

function transProgress(c: Clip, local: number): { pin: number; pout: number } {
  const pin = c.tIn.type !== 'none' && c.tIn.d > 0 ? clamp(local / c.tIn.d, 0, 1) : 1;
  const rem = c.duration - local;
  const pout = c.tOut.type !== 'none' && c.tOut.d > 0 ? clamp(rem / c.tOut.d, 0, 1) : 1;
  return { pin: EASINGS.easeInOut(pin), pout: EASINGS.easeInOut(pout) };
}

function applyTransition(tr: Transition, p: number, T: Transform, W: number, H: number, st: { wipe: number; flash: number }, dir: 1 | -1) {
  if (p >= 1 || tr.type === 'none') return;
  const q = 1 - p;
  switch (tr.type) {
    case 'fade': T.opacity *= p; break;
    case 'slideLeft': T.x += q * W * dir; break;
    case 'slideRight': T.x -= q * W * dir; break;
    case 'slideUp': T.y += q * H * dir; break;
    case 'slideDown': T.y -= q * H * dir; break;
    case 'zoomIn': T.scale *= 0.6 + 0.4 * p; T.opacity *= p; break;
    case 'zoomOut': T.scale *= 1 + 0.5 * q; T.opacity *= p; break;
    case 'blur': T.blur += q * 40; T.opacity *= p; break;
    case 'wipe': st.wipe = Math.min(st.wipe, p); break;
    case 'spin': T.rotation += q * 180 * dir; T.scale *= Math.max(0.01, p); break;
    case 'flash': st.flash = Math.max(st.flash, q); break;
  }
}

/** Klibin t anındaki dönüşümü (keyframe + expression + geçiş + sarsıntı) */
function placeTransform(p: Project, c: Clip, t: number, st: { wipe: number; flash: number }) {
  const local = t - c.start; const T = transformAt(c, local);
  if (p.mode !== 'image') { const { pin, pout } = transProgress(c, local); applyTransition(c.tIn, pin, T, p.settings.width, p.settings.height, st, 1); applyTransition(c.tOut, pout, T, p.settings.width, p.settings.height, st, -1); }
  const shake = c.effects.find(e => e.on && e.type === 'shake');
  if (shake) {
    const a = Number(shake.p.amount), f = Number(shake.p.freq);
    T.x += Math.sin(t * f * 1.3) * a * 0.6 + Math.sin(t * f * 2.7) * a * 0.4;
    T.y += Math.cos(t * f * 1.1) * a * 0.6 + Math.sin(t * f * 3.1) * a * 0.3;
    T.rotation += Math.sin(t * f * 0.9) * a * 0.03;
  }
  return T;
}

/** Ebeveyn zinciri (kökten başlayarak); döngülere karşı korumalı */
export function parentChain(p: Project, c: Clip): Clip[] {
  const out: Clip[] = []; const seen = new Set([c.id]); let cur = c.parent;
  while (cur) { const pc = p.clips.find(k => k.id === cur); if (!pc || seen.has(pc.id)) break; seen.add(pc.id); out.unshift(pc); cur = pc.parent; }
  return out;
}
/** Ebeveyn dönüşümlerini bağlama uygula (AE parenting: konum + dönüş + ölçek miras alınır) */
function applyParents(x: Ctx, p: Project, c: Clip, t: number, s: number) {
  for (const a of parentChain(p, c)) { const T = transformAt(a, Math.min(Math.max(t - a.start, 0), a.duration)); x.translate(T.x * s, T.y * s); x.rotate((T.rotation * Math.PI) / 180); x.scale(T.scale, T.scale); }
}
/** Dünya matrisi (proje koordinatı, merkez orijinli) — seçim, çocuk taşıma ve hareket bulanıklığı için */
export function worldMatrix(p: Project, c: Clip, t: number, T?: Transform) {
  const m = new DOMMatrix();
  for (const a of parentChain(p, c)) { const A = transformAt(a, Math.min(Math.max(t - a.start, 0), a.duration)); m.translateSelf(A.x, A.y).rotateSelf(A.rotation).scaleSelf(A.scale, A.scale); }
  const O = T ?? transformAt(c, Math.min(Math.max(t - c.start, 0), c.duration));
  return m.translateSelf(O.x, O.y).rotateSelf(O.rotation).scaleSelf(O.scale, O.scale);
}

/** Maske uzayı → proje (merkez orijinli) matrisi: çizimle birebir aynı (geçiş/sarsıntı dahil); ayar katmanında birim */
export function maskMatrix(p: Project, c: Clip, t: number) {
  return c.kind === 'adjust' ? new DOMMatrix() : worldMatrix(p, c, t, placeTransform(p, c, t, { wipe: 1, flash: 0 }));
}

function drawClip(ctx: Ctx, p: Project, c: Clip, t: number, s: number, W: number, H: number) {
  const local = t - c.start;
  const st = { wipe: 1, flash: 0 };
  const T = placeTransform(p, c, t, st);
  const on = c.effects.filter(e => e.on);
  if (T.opacity <= 0.001) return;
  const cssF = cssFilters(on);
  const L = layer(W, H); const x = L.x;

  const drawAt = (dst: Ctx, tt: number, TT: Transform) => {
    const f = [cssF, TT.blur > 0.05 ? `blur(${TT.blur * s}px)` : ''].filter(Boolean).join(' ');
    dst.filter = f || 'none';
    dst.translate(W / 2, H / 2); applyParents(dst, p, c, tt, s);
    dst.translate(TT.x * s, TT.y * s); dst.rotate((TT.rotation * Math.PI) / 180); dst.scale(TT.scale, TT.scale);
    drawContent(dst, p, c, tt - c.start, s, W, H);
    dst.setTransform(1, 0, 0, 1, 0, 0); dst.filter = 'none';
  };

  // ---- hareket bulanıklığı (AE: 180° shutter, alt-kare örnekleme) ----
  let blurred = false;
  if (c.motionBlur && p.mode !== 'image') {
    const shutter = 0.5 / p.settings.fps; const N = s < 0.99 ? 6 : 12;
    const t0 = t - shutter / 2, t1 = t + shutter / 2;
    const m0 = worldMatrix(p, c, t0, placeTransform(p, c, t0, { wipe: 1, flash: 0 })), m1 = worldMatrix(p, c, t1, placeTransform(p, c, t1, { wipe: 1, flash: 0 }));
    const moving = Math.abs(m0.e - m1.e) + Math.abs(m0.f - m1.f) + Math.abs(m0.a - m1.a) * 200 + Math.abs(m0.b - m1.b) * 200 > 0.5;
    if (moving) {
      const M = layer(W, H);
      for (let i = 0; i < N; i++) {
        const tt = t0 + (shutter * i) / (N - 1); M.x.clearRect(0, 0, W, H);
        drawAt(M.x, tt, placeTransform(p, c, tt, { wipe: 1, flash: 0 }));
        x.globalCompositeOperation = 'lighter'; x.globalAlpha = 1 / N; x.drawImage(M.c, 0, 0);
      }
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; M.free(); blurred = true;
    }
  }
  if (!blurred) drawAt(x, t, T);
  // kalem maskeleri (AE sırası: maske → efektler); katmanla birlikte hareket eder
  if (c.masks?.length) applyMasks(x, c, local, s, W, H, worldMatrix(p, c, t, T), layer);

  // piksel tabanlı efektler
  runEffects(L, on, t, s, W, H, c.id, p);
  if (st.flash > 0) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(255,255,255,${st.flash})`; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }

  ctx.save();
  ctx.globalAlpha = clamp(T.opacity, 0, 1);
  ctx.globalCompositeOperation = c.blend || 'source-over';
  if (st.wipe < 1) { ctx.beginPath(); ctx.rect(0, 0, W * st.wipe, H); ctx.clip(); }
  ctx.drawImage(L.c, 0, 0);
  ctx.restore();
  L.free();
}

function drawContent(x: Ctx, p: Project, c: Clip, local: number, s: number, W: number, H: number) {
  const PW = p.settings.width * s, PH = p.settings.height * s;
  if (c.kind === 'media') {
    const src = mediaSource(c.assetId);
    const r = getRuntime(c.assetId);
    if (!src) { x.fillStyle = '#222'; x.fillRect(-PW / 2, -PH / 2, PW, PH); x.fillStyle = '#666'; x.font = `${28 * s}px Inter`; x.textAlign = 'center'; x.fillText('Medya yükleniyor…', 0, 0); return; }
    const sz = sourceSize(c.assetId); void r;
    const sw = sz?.[0] || PW, sh = sz?.[1] || PH;
    let dw = PW, dh = PH;
    if (c.fit !== 'stretch') {
      const k = c.fit === 'cover' ? Math.max(PW / sw, PH / sh) : Math.min(PW / sw, PH / sh);
      dw = sw * k; dh = sh * k;
    }
    const cr = c.crop;
    if (cr && (cr.l || cr.t || cr.r || cr.b)) { const fw = Math.max(0.001, 1 - cr.l - cr.r), fh = Math.max(0.001, 1 - cr.t - cr.b); x.drawImage(src, sw * cr.l, sh * cr.t, sw * fw, sh * fh, -dw / 2 + dw * cr.l, -dh / 2 + dh * cr.t, dw * fw, dh * fh); }
    else x.drawImage(src, -dw / 2, -dh / 2, dw, dh);
  } else if (c.kind === 'solid') {
    x.fillStyle = c.color || '#111'; x.fillRect(-PW / 2, -PH / 2, PW, PH);
  } else if (c.kind === 'gradient') {
    const a = ((c.angle ?? 135) * Math.PI) / 180, r = Math.hypot(PW, PH) / 2;
    const g = x.createLinearGradient(-Math.cos(a) * r, -Math.sin(a) * r, Math.cos(a) * r, Math.sin(a) * r);
    g.addColorStop(0, c.color || '#1b1446'); g.addColorStop(1, c.color2 || '#e8475f');
    x.fillStyle = g; x.fillRect(-PW / 2, -PH / 2, PW, PH);
  } else if (c.kind === 'shape' && c.shape) {
    const sp = c.shape; x.fillStyle = sp.fill; x.strokeStyle = sp.stroke; x.lineWidth = sp.strokeW * s; x.lineJoin = 'round'; x.lineCap = 'round';
    const len = shapePath(x, sp, s);
    // Trim paths / draw-on (AE): kontur önce çizilerek belirir, dolgu ardından gelir
    const dOn = sp.drawOn ?? 0; const prog = dOn > 0 && p.mode !== 'image' ? clamp((local - (sp.drawDelay ?? 0)) / dOn, 0, 1) : 1;
    const e = EASINGS.easeInOut(prog);
    if (sp.shape !== 'line' && sp.fill !== 'transparent') { x.save(); x.globalAlpha *= dOn > 0 ? clamp((e - 0.6) / 0.4, 0, 1) : 1; x.fill(); x.restore(); }
    if (sp.strokeW > 0 || sp.shape === 'line') { if (prog < 1) { x.setLineDash([len * e, len + 1]); } if (prog > 0) x.stroke(); x.setLineDash([]); }
  } else if (c.kind === 'particles' && c.particles) {
    drawParticles(x, c.particles, p.mode === 'image' ? c.particles.life * 0.8 : local, s);
  } else if (c.kind === 'text' && c.text) {
    drawText(x, c.text, p.mode === 'image' ? 1e6 : local, s, PW, c.id);
  }
}

function wrap(x: Ctx, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' '); let line = '';
    for (const w of words) { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test; }
    out.push(line);
  }
  return out;
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFXYZ0123456789';
function drawText(x: Ctx, tp0: TextProps, local: number, s: number, PW: number, seedId: string) {
  let tp = tp0;
  if (tp.counter) { const k = tp.counter; const u = EASINGS.easeOut(clamp((local - (k.delay ?? 0)) / Math.max(0.01, k.dur), 0, 1)); const v = k.from + (k.to - k.from) * u; tp = { ...tp, text: k.prefix + v.toLocaleString('tr-TR', { minimumFractionDigits: k.dec, maximumFractionDigits: k.dec }) + k.suffix }; }
  const size = tp.size * s;
  const prog = tp.anim === 'none' ? 1 : clamp(local / Math.max(0.01, tp.animD), 0, 1);
  x.font = `${tp.weight} ${size}px "${tp.font}", Inter, "Helvetica Neue", Arial, sans-serif`;
  x.textAlign = tp.align; x.textBaseline = 'middle';
  let tracking = 0;
  if (tp.anim === 'tracking') tracking = (1 - EASINGS.easeOut(prog)) * size * 0.5;
  try { (x as any).letterSpacing = `${tracking}px`; } catch { /* eski tarayıcı */ }
  const lines = wrap(x, tp.text, PW * tp.maxW);
  const lh = size * tp.lineH, total = lines.length * lh;
  const ax = tp.align === 'left' ? -PW * tp.maxW / 2 : tp.align === 'right' ? PW * tp.maxW / 2 : 0;
  const totalChars = tp.text.length; let charIdx = 0;
  const words = tp.text.split(/\s+/).length; let wordIdx = 0;
  const r = rng(hashStr(seedId) + Math.floor(local * 20));

  if (tp.anim === 'pop') { const k = EASINGS.backOut(prog); x.scale(Math.max(0.01, k), Math.max(0.01, k)); }
  if (tp.anim === 'blurIn') { x.filter = `blur(${(1 - prog) * 24 * s}px)`; x.globalAlpha *= prog; }

  if (tp.bg) {
    const mw = Math.max(...lines.map(l => x.measureText(l).width)); const pad = tp.bgPad * s;
    const bx = tp.align === 'center' ? -mw / 2 : tp.align === 'left' ? ax : ax - mw;
    x.fillStyle = tp.bg; x.beginPath(); x.roundRect(bx - pad, -total / 2 - pad * 0.6, mw + pad * 2, total + pad * 1.2, pad * 0.5); x.fill();
  }

  lines.forEach((line, i) => {
    let y = -total / 2 + lh * (i + 0.5);
    let txt = line; let alpha = 1;
    if (tp.anim === 'typewriter') { const show = Math.floor(prog * totalChars) - charIdx; txt = line.slice(0, clamp(show, 0, line.length)); }
    if (tp.anim === 'fadeUp') { const lp = clamp(prog * (lines.length + 1) - i, 0, 1); const e = EASINGS.easeOut(lp); y += (1 - e) * size * 0.6; alpha = e; }
    if (tp.anim === 'wordByWord') { const ws = line.split(' '); const shown = clamp(Math.ceil(prog * words) - wordIdx, 0, ws.length); txt = ws.slice(0, shown).join(' '); wordIdx += ws.length; }
    if (tp.anim === 'glitchIn' && prog < 1) { txt = [...line].map(ch => (ch !== ' ' && r() > prog ? GLYPHS[Math.floor(r() * GLYPHS.length)] : ch)).join(''); }
    charIdx += line.length + 1;
    x.save(); x.globalAlpha *= alpha;
    if (tp.shadow > 0) { x.shadowColor = 'rgba(0,0,0,0.55)'; x.shadowBlur = tp.shadow * s; x.shadowOffsetY = tp.shadow * s * 0.25; }
    if (tp.strokeW > 0) { x.lineJoin = 'round'; x.strokeStyle = tp.stroke; x.lineWidth = tp.strokeW * s; x.strokeText(txt, ax, y); }
    x.fillStyle = tp.color; x.fillText(txt, ax, y);
    x.restore();
  });
  if (tp.anim === 'typewriter' && prog < 1 && Math.floor(local * 3) % 2 === 0) { /* imleç */ }
  try { (x as any).letterSpacing = '0px'; } catch { /* */ }
}

function postEffect(cv: HTMLCanvasElement, x: Ctx, e: Effect, t: number, s: number, W: number, H: number, id: string, proj: Project) {
  const P = e.p;
  switch (e.type) {
    case 'grade': { const img = x.getImageData(0, 0, W, H); applyGrade(img, P as unknown as GradeParams); x.putImageData(img, 0, 0); break; }
    case 'lut': { const l = findLut(proj, String(P.lut)); if (!l) break; const img = x.getImageData(0, 0, W, H); applyLut(img, l, Number(P.amount)); x.putImageData(img, 0, 0); break; }
    case 'chromakey': { const img = x.getImageData(0, 0, W, H); applyChromaKey(img, String(P.key), Number(P.similarity), Number(P.smooth), Number(P.spill)); x.putImageData(img, 0, 0); break; }
    case 'mask': {
      const M = layer(W, H); const mx = M.x; const f = Number(P.feather) * s;
      const cx = W / 2 + Number(P.mx) * W, cy = H / 2 + Number(P.my) * H, w = Number(P.mw) * W, h = Number(P.mh) * H;
      mx.fillStyle = '#fff'; if (f > 0) mx.filter = `blur(${f}px)`; mx.beginPath();
      if (P.shape === 'rect') mx.rect(cx - w / 2, cy - h / 2, w, h); else mx.ellipse(cx, cy, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
      mx.fill(); mx.filter = 'none';
      x.globalCompositeOperation = Number(P.invert) ? 'destination-out' : 'destination-in'; x.drawImage(M.c, 0, 0); M.free(); break;
    }
    case 'glow': {
      const G = layer(W, H); const thr = Number(P.threshold);
      G.x.filter = `brightness(${1 + thr}) contrast(${1 + thr * 3}) blur(${Number(P.radius) * s}px)`; G.x.drawImage(cv, 0, 0);
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = Math.min(1, Number(P.amount)); x.drawImage(G.c, 0, 0);
      if (Number(P.amount) > 1) { x.globalAlpha = Number(P.amount) - 1; x.drawImage(G.c, 0, 0); }
      x.globalAlpha = 1; G.free(); break;
    }
    case 'sharpen': {
      const B = layer(W, H); B.x.filter = `blur(${Math.max(1, 1.5 * s)}px)`; B.x.drawImage(cv, 0, 0);
      const img = x.getImageData(0, 0, W, H), bl = B.x.getImageData(0, 0, W, H).data, d = img.data, a = Number(P.amount);
      for (let i = 0; i < d.length; i += 4) { d[i] += (d[i] - bl[i]) * a; d[i + 1] += (d[i + 1] - bl[i + 1]) * a; d[i + 2] += (d[i + 2] - bl[i + 2]) * a; }
      x.putImageData(img, 0, 0); B.free(); break;
    }
    case 'vignette': {
      const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * Number(P.size) * 0.5, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${P.amount})`);
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, W, H); break;
    }
    case 'grain': {
      const n = noiseTex(); const r = rng(Math.floor(t * 24) + 7);
      x.globalCompositeOperation = 'overlay'; x.globalAlpha = Number(P.amount) * 1.5;
      const pat = x.createPattern(n, 'repeat')!; x.translate(-r() * 256, -r() * 256); x.fillStyle = pat; x.fillRect(0, 0, W + 256, H + 256);
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
      x.globalCompositeOperation = 'destination-in'; x.drawImage(cv, 0, 0); // alfa koru (yaklaşık)
      break;
    }
    case 'tint': {
      const L = layer(W, H); L.x.drawImage(cv, 0, 0);
      x.globalCompositeOperation = String(P.mode) as GlobalCompositeOperation; x.globalAlpha = Number(P.amount);
      x.fillStyle = String(P.color); x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      x.globalCompositeOperation = 'destination-in'; x.drawImage(L.c, 0, 0); L.free(); break;
    }
    case 'lightleak': {
      const sp = Number(P.speed), cx = W * (0.5 + 0.45 * Math.sin(t * sp)), cy = H * (0.3 + 0.3 * Math.cos(t * sp * 0.7));
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      g.addColorStop(0, String(P.color)); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalCompositeOperation = 'screen'; x.globalAlpha = Number(P.amount); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalAlpha = 1; break;
    }
    case 'letterbox': {
      const bh = Math.max(0, (H - W / Number(P.ratio)) / 2);
      x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, W, bh); x.fillRect(0, H - bh, W, bh); break;
    }
    case 'scanlines': {
      const gap = Math.max(2, Number(P.gap) * s);
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(0,0,0,${P.amount})`;
      for (let y = (t * 30) % gap; y < H; y += gap) x.fillRect(0, y, W, gap / 2); break;
    }
    case 'pixelate': {
      const b = Math.max(1, Number(P.size) * s); const L = layer(Math.ceil(W / b), Math.ceil(H / b));
      L.x.drawImage(cv, 0, 0, L.c.width, L.c.height);
      x.clearRect(0, 0, W, H); x.imageSmoothingEnabled = false; x.drawImage(L.c, 0, 0, W, H); x.imageSmoothingEnabled = true; L.free(); break;
    }
    case 'chroma': {
      const px = Math.round(Number(P.px) * s); if (!px) break;
      const img = x.getImageData(0, 0, W, H), src = new Uint8ClampedArray(img.data), d = img.data;
      for (let y = 0; y < H; y++) {
        const row = y * W;
        for (let i = 0; i < W; i++) {
          const o = (row + i) * 4, rI = (row + Math.min(W - 1, i + px)) * 4, bI = (row + Math.max(0, i - px)) * 4;
          d[o] = src[rI]; d[o + 2] = src[bI + 2]; d[o + 3] = Math.max(src[o + 3], src[rI + 3], src[bI + 3]);
        }
      }
      x.putImageData(img, 0, 0); break;
    }
    case 'glitch': {
      const r = rng(hashStr(id) + Math.floor(t * 12));
      if (r() > Number(P.rate)) break;
      const L = layer(W, H); L.x.drawImage(cv, 0, 0);
      const n = 3 + Math.floor(r() * 8);
      for (let i = 0; i < n; i++) {
        const y = r() * H, h = (4 + r() * 60) * s, dx = (r() - 0.5) * W * 0.15 * Number(P.amount);
        x.clearRect(0, y, W, h); x.drawImage(L.c, 0, y, W, h, dx, y, W, h);
      }
      x.globalCompositeOperation = 'screen'; x.globalAlpha = 0.5 * Number(P.amount);
      x.drawImage(L.c, -8 * s * Number(P.amount), 0); x.globalAlpha = 1; L.free(); break;
    }
  }
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.setTransform(1, 0, 0, 1, 0, 0);
}

// ---- Önizleme etkileşimi için klip sınırları (proje koordinatı, merkez orijinli) ----
let measureCtx: CanvasRenderingContext2D | null = null;
export interface Bounds { cx: number; cy: number; w: number; h: number; rot: number; scale: number }
export function clipBounds(p: Project, c: Clip, t: number): Bounds {
  const b = clipBoundsLocal(p, c, t); const chain = parentChain(p, c); if (!chain.length) return b;
  const m = new DOMMatrix(); let rot = 0, sc = 1;
  for (const a of chain) { const A = transformAt(a, Math.min(Math.max(t - a.start, 0), a.duration)); m.translateSelf(A.x, A.y).rotateSelf(A.rotation).scaleSelf(A.scale, A.scale); rot += A.rotation; sc *= A.scale; }
  const q = m.transformPoint(new DOMPoint(b.cx, b.cy));
  return { cx: q.x, cy: q.y, w: b.w * sc, h: b.h * sc, rot: b.rot + rot, scale: b.scale * sc };
}
function clipBoundsLocal(p: Project, c: Clip, t: number): Bounds {
  const local = Math.min(Math.max(t - c.start, 0), c.duration);
  const T = transformAt(c, local); const PW = p.settings.width, PH = p.settings.height;
  let w = PW, h = PH;
  if (c.kind === 'null') { w = 120; h = 120; }
  else if (c.kind === 'media') {
    const sz = sourceSize(c.assetId); const sw = sz?.[0] || PW, sh = sz?.[1] || PH;
    if (c.fit !== 'stretch') { const k = c.fit === 'cover' ? Math.max(PW / sw, PH / sh) : Math.min(PW / sw, PH / sh); w = sw * k; h = sh * k; }
  } else if (c.kind === 'shape' && c.shape) { w = c.shape.w; h = Math.max(c.shape.h, 10); }
  else if (c.kind === 'text' && c.text) {
    measureCtx ??= document.createElement('canvas').getContext('2d')!;
    const tp = c.text; measureCtx.font = `${tp.weight} ${tp.size}px "${tp.font}", Inter, sans-serif`;
    const lines = wrap(measureCtx, tp.text, PW * tp.maxW);
    w = Math.max(20, ...lines.map(l => measureCtx!.measureText(l).width)) + (tp.bg ? tp.bgPad * 2 : 0); h = lines.length * tp.size * tp.lineH;
    if (tp.align === 'left') return { cx: T.x - PW * tp.maxW / 2 + w / 2 * T.scale, cy: T.y, w: w * T.scale, h: h * T.scale, rot: T.rotation, scale: T.scale };
    if (tp.align === 'right') return { cx: T.x + PW * tp.maxW / 2 - w / 2 * T.scale, cy: T.y, w: w * T.scale, h: h * T.scale, rot: T.rotation, scale: T.scale };
  }
  return { cx: T.x, cy: T.y, w: w * T.scale, h: h * T.scale, rot: T.rotation, scale: T.scale };
}
export function hitTest(b: Bounds, x: number, y: number) {
  const a = (-b.rot * Math.PI) / 180, dx = x - b.cx, dy = y - b.cy;
  const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
  return Math.abs(lx) <= b.w / 2 && Math.abs(ly) <= b.h / 2;
}
