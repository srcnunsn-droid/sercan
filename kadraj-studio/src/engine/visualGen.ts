// Prosedürel görsel üretici — arka planlar, dokular, storyboard kareleri
import { rng } from '../util';
import type { Shot } from '../types';

export const VISUAL_TYPES = {
  aurora: 'Aurora / Mesh gradient', bokeh: 'Bokeh ışıklar', stars: 'Yıldız alanı', grid: 'Tech grid (retro)', paper: 'Kağıt dokusu', rays: 'Işık huzmeleri', waves: 'Dalga çizgileri', noiseClouds: 'Duman / sis',
} as const;
export type VisualType = keyof typeof VISUAL_TYPES;

function canvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, x: c.getContext('2d')! }; }
const toBlob = (c: HTMLCanvasElement) => new Promise<Blob>(r => c.toBlob(b => r(b!), 'image/png'));

export async function genVisual(type: VisualType, w: number, h: number, palette: string[], seed: number): Promise<Blob> {
  const { c, x } = canvas(w, h); const r = rng(seed); const P = palette.length ? palette : ['#0b0a1a', '#3b1d6e', '#e8475f', '#ffb347'];
  x.fillStyle = P[0]; x.fillRect(0, 0, w, h);
  switch (type) {
    case 'aurora': {
      x.filter = `blur(${Math.round(w / 12)}px)`;
      for (let i = 0; i < 7; i++) { x.fillStyle = P[1 + (i % (P.length - 1))]; x.globalAlpha = 0.55 + r() * 0.4; x.beginPath(); x.ellipse(r() * w, r() * h, w * (0.2 + r() * 0.35), h * (0.2 + r() * 0.35), r() * 3, 0, 7); x.fill(); }
      x.filter = 'none'; x.globalAlpha = 1; break;
    }
    case 'bokeh': {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, P[0]); g.addColorStop(1, P[1] ?? P[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'screen';
      for (let i = 0; i < 70; i++) { const rad = w * (0.01 + r() * 0.06); x.filter = `blur(${Math.round(r() * rad * 0.4)}px)`; x.globalAlpha = 0.15 + r() * 0.45; x.fillStyle = P[2 + Math.floor(r() * (P.length - 2))] ?? '#fff'; x.beginPath(); x.arc(r() * w, r() * h, rad, 0, 7); x.fill(); }
      x.filter = 'none'; x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; break;
    }
    case 'stars': {
      const g = x.createRadialGradient(w * 0.6, h * 0.4, 0, w / 2, h / 2, w); g.addColorStop(0, P[1] ?? '#1a1a3a'); g.addColorStop(1, P[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1600; i++) { x.globalAlpha = r(); x.fillStyle = '#fff'; const s = r() < 0.97 ? 1 : 2.5; x.fillRect(r() * w, r() * h, s, s); }
      x.globalAlpha = 1; break;
    }
    case 'grid': {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, P[0]); g.addColorStop(0.55, P[1] ?? '#2a0845'); g.addColorStop(1, P[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const hz = h * 0.55; x.fillStyle = P[3] ?? '#ffb347'; x.globalAlpha = 0.9; x.beginPath(); x.arc(w / 2, hz, h * 0.22, Math.PI, 0); x.fill(); x.globalAlpha = 1;
      x.strokeStyle = P[2] ?? '#e8475f'; x.lineWidth = 2;
      for (let i = -20; i <= 20; i++) { x.beginPath(); x.moveTo(w / 2, hz); x.lineTo(w / 2 + i * w * 0.12, h); x.stroke(); }
      for (let k = 1; k < 18; k++) { const y = hz + Math.pow(k / 18, 2.2) * (h - hz); x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
      break;
    }
    case 'paper': {
      x.fillStyle = P[P.length - 1] ?? '#efe6d4'; x.fillRect(0, 0, w, h);
      const d = x.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const n = (r() - 0.5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } x.putImageData(d, 0, 0);
      x.globalAlpha = 0.06; for (let i = 0; i < 400; i++) { x.strokeStyle = '#000'; x.beginPath(); const px = r() * w, py = r() * h; x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 40); x.stroke(); } x.globalAlpha = 1; break;
    }
    case 'rays': {
      const cx = w * (0.3 + r() * 0.4), cy = -h * 0.1; x.globalCompositeOperation = 'screen'; x.filter = `blur(${Math.round(w / 90)}px)`;
      for (let i = 0; i < 16; i++) { const a = Math.PI * (0.25 + r() * 0.5), s = 0.02 + r() * 0.05; x.fillStyle = P[2 + (i % 2)] ?? '#ffd27a'; x.globalAlpha = 0.08 + r() * 0.2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a - s) * w * 2, cy + Math.sin(a - s) * w * 2); x.lineTo(cx + Math.cos(a + s) * w * 2, cy + Math.sin(a + s) * w * 2); x.fill(); }
      x.filter = 'none'; x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; break;
    }
    case 'waves': {
      for (let i = 0; i < 40; i++) { x.strokeStyle = P[1 + (i % (P.length - 1))]; x.globalAlpha = 0.25 + (i / 40) * 0.6; x.lineWidth = 2; x.beginPath(); const amp = h * 0.05 * (1 + r()), ph = r() * 6, y0 = h * 0.2 + i * h * 0.016; for (let px = 0; px <= w; px += 8) x.lineTo(px, y0 + Math.sin(px / w * 6 + ph) * amp); x.stroke(); }
      x.globalAlpha = 1; break;
    }
    case 'noiseClouds': {
      const s = canvas(64, 36); const d = s.x.createImageData(64, 36); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } s.x.putImageData(d, 0, 0);
      x.globalAlpha = 0.45; x.globalCompositeOperation = 'screen'; x.filter = `blur(${Math.round(w / 60)}px)`; x.drawImage(s.c, 0, 0, w, h); x.filter = 'none';
      x.globalCompositeOperation = 'color'; x.fillStyle = P[1] ?? '#334'; x.globalAlpha = 0.7; x.fillRect(0, 0, w, h); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; break;
    }
  }
  return toBlob(c);
}

/** Storyboard çizim kartı: plan ölçeği kılavuzu + açıklama */
export async function genStoryFrame(shot: Shot, idx: string, w: number, h: number, palette: string[]): Promise<Blob> {
  const { c, x } = canvas(w, h); const P = palette.length ? palette : ['#16161d', '#2b2b38', '#e8475f', '#ffb347'];
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, P[0]); g.addColorStop(1, P[1] ?? P[0]); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 1;
  for (let i = 1; i < 3; i++) { x.beginPath(); x.moveTo((w / 3) * i, 0); x.lineTo((w / 3) * i, h); x.stroke(); x.beginPath(); x.moveTo(0, (h / 3) * i); x.lineTo(w, (h / 3) * i); x.stroke(); }
  // plan ölçeğine göre figür siluet
  const sizeK: Record<string, number> = { 'Çok geniş (EWS)': 0.18, 'Geniş (WS)': 0.35, 'Boy (FS)': 0.6, 'Diz (MS)': 0.95, 'Bel (MCU)': 1.4, 'Yakın (CU)': 2.2, 'Detay (ECU)': 3.6, 'Ürün çekimi': 0.8, 'Omuz üstü (OTS)': 1.2, 'POV': 1 };
  const k = sizeK[shot.size] ?? 0.8; const fh = h * 0.9 * k;
  x.fillStyle = 'rgba(255,255,255,0.18)'; x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 2;
  const cx = w * 0.5, base = h * 0.5 + fh * 0.5;
  x.beginPath(); x.arc(cx, base - fh * 0.88, fh * 0.1, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(cx - fh * 0.2, base); x.quadraticCurveTo(cx - fh * 0.22, base - fh * 0.7, cx, base - fh * 0.76); x.quadraticCurveTo(cx + fh * 0.22, base - fh * 0.7, cx + fh * 0.2, base); x.closePath(); x.fill(); x.stroke();
  // ufuk çizgisi
  if (k < 0.7) { x.strokeStyle = 'rgba(255,255,255,0.3)'; x.beginPath(); x.moveTo(0, base); x.lineTo(w, base); x.stroke(); }
  // kamera hareket oku
  x.strokeStyle = P[2] ?? '#e8475f'; x.fillStyle = P[2] ?? '#e8475f'; x.lineWidth = 5;
  const arrow = (x1: number, y1: number, x2: number, y2: number) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - 22 * Math.cos(a - 0.5), y2 - 22 * Math.sin(a - 0.5)); x.lineTo(x2 - 22 * Math.cos(a + 0.5), y2 - 22 * Math.sin(a + 0.5)); x.fill(); };
  const m = shot.move.toLowerCase();
  if (m.includes('dolly in') || m.includes('push')) { arrow(w * 0.15, h * 0.85, w * 0.32, h * 0.68); arrow(w * 0.85, h * 0.85, w * 0.68, h * 0.68); }
  else if (m.includes('dolly out') || m.includes('pull')) { arrow(w * 0.32, h * 0.68, w * 0.15, h * 0.85); arrow(w * 0.68, h * 0.68, w * 0.85, h * 0.85); }
  else if (m.includes('pan') || m.includes('truck') || m.includes('takip')) arrow(w * 0.2, h * 0.9, w * 0.8, h * 0.9);
  else if (m.includes('tilt') || m.includes('crane') || m.includes('vinç')) arrow(w * 0.92, h * 0.8, w * 0.92, h * 0.2);
  else if (m.includes('orbit')) { x.beginPath(); x.ellipse(cx, h * 0.88, w * 0.3, h * 0.05, 0, 0.2, Math.PI - 0.2); x.stroke(); }
  // etiketler
  x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(0, 0, w, h * 0.11); x.fillRect(0, h * 0.8, w, h * 0.2);
  x.fillStyle = '#fff'; x.font = `700 ${h * 0.055}px Inter`; x.textBaseline = 'middle'; x.fillText(`#${idx}  ${shot.size}  ·  ${shot.move}  ·  ${shot.lens}`, w * 0.025, h * 0.055);
  x.font = `500 ${h * 0.042}px Inter`; x.fillStyle = 'rgba(255,255,255,0.85)';
  const words = shot.desc.split(' '); let line = '', y = h * 0.85;
  for (const wd of words) { if (x.measureText(line + ' ' + wd).width > w * 0.95) { x.fillText(line, w * 0.025, y); line = wd; y += h * 0.05; if (y > h * 0.98) break; } else line = line ? line + ' ' + wd : wd; }
  if (y <= h * 0.98) x.fillText(line, w * 0.025, y);
  return toBlob(c);
}
