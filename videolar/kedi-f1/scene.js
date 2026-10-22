'use strict';
// Kedi F1 — 30 sn, 1920x1080. Her kare render(t)'nin saf fonksiyonu.

const W = 1920, H = 1080, DURATION = 30;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H;
const octx = off.getContext('2d');

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const mod = (a, b) => ((a % b) + b) % b;
function kf(t, p) {
  if (t <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) if (t <= p[i][0]) return lerp(p[i - 1][1], p[i][1], ss(p[i - 1][0], p[i][0], t));
  return p[p.length - 1][1];
}
const bump = (t, a, b, amp, e = 0.6) => amp * ss(a, a + e, t) * (1 - ss(b - e, b, t));
const FONT = '"Inter Display", "DejaVu Sans", sans-serif';

const RGBC = {};
function rgb(h) { if (RGBC[h]) return RGBC[h]; const n = parseInt(h.slice(1), 16); return (RGBC[h] = [n >> 16, (n >> 8) & 255, n & 255]); }
function mix(a, b, k) { const A = rgb(a), B = rgb(b); return `rgb(${(A[0] + (B[0] - A[0]) * k) | 0},${(A[1] + (B[1] - A[1]) * k) | 0},${(A[2] + (B[2] - A[2]) * k) | 0})`; }

function P(pts, fill, stroke, lw) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function E(x, y, rx, ry, fill, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
function RR(x, y, w, h, r, fill) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); ctx.fillStyle = fill; ctx.fill(); }
function txt(s, x, y, size, fill, o = {}) {
  ctx.save();
  ctx.font = `${o.italic === false ? '' : 'italic '}900 ${size}px ${FONT}`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || size * 0.12; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
  ctx.restore();
}

// ---------------------------------------------------------------- renkler
const CAT = { fur: '#f28a26', dark: '#b4560f', light: '#ffc98a', white: '#fff3e2', pink: '#ff9db0', eye: '#8be04e', line: '#3a1a06' };
const CATCAR = { body: '#ff7a00', acc: '#141414', num: '7' };
const RIV = [
  { body: '#d81e2c', acc: '#ffffff', num: '16' },
  { body: '#00a19c', acc: '#0b2b3a', num: '63' },
  { body: '#1e41ff', acc: '#ffd200', num: '1' },
  { body: '#ffd200', acc: '#1b1b1b', num: '22' },
  { body: '#1f8a3c', acc: '#e6e6e6', num: '14' },
  { body: '#7a2bd6', acc: '#ffffff', num: '10' },
  { body: '#c0c4c8', acc: '#00a6a0', num: '44' },
];

// Kalabalık dokusu (tribünler için bir kez üretilir)
const crowdTex = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#3b4250'; g.fillRect(0, 0, 512, 256);
  const cols = ['#ff7a00', '#ffffff', '#d81e2c', '#ffd200', '#1e41ff', '#f4c7a1', '#00a19c', '#222', '#ff9db0'];
  let n = 0;
  for (let y = 4; y < 256; y += 10) for (let x = (y / 10 % 2) * 5; x < 512; x += 9) {
    g.fillStyle = cols[Math.floor(hash(n++) * cols.length)];
    g.fillRect(x, y + hash(n) * 2, 6, 7);
    g.fillStyle = '#f2c9a0'; g.fillRect(x + 1, y - 3 + hash(n) * 2, 4, 4);
  }
  return c;
})();

// ================================================================ KEDİ
function catEars(R, earBack, wind, t) {
  for (const s of [-1, 1]) {
    const a = -Math.PI / 2 + s * (0.62 + earBack * 0.55);
    const bx = Math.cos(a) * R * 0.78, by = Math.sin(a) * R * 0.78;
    const fl = Math.sin(t * 38 + s) * wind * R * 0.04;
    const tx = Math.cos(a) * R * 1.45 + fl, ty = Math.sin(a) * R * 1.45 + earBack * R * 0.25;
    const pa = a + Math.PI / 2, w = R * 0.37;
    const x1 = bx + Math.cos(pa) * w, y1 = by + Math.sin(pa) * w, x2 = bx - Math.cos(pa) * w, y2 = by - Math.sin(pa) * w;
    P([x1, y1, tx, ty, x2, y2], CAT.fur, CAT.line, R * 0.035);
    P([lerp(bx, x1, 0.55), lerp(by, y1, 0.55), lerp(bx, tx, 0.78), lerp(by, ty, 0.78), lerp(bx, x2, 0.55), lerp(by, y2, 0.55)], CAT.pink);
  }
}
function helmetCap(R, col, front) {
  // açık yüzlü kask: başın üstünü kaplar
  const g = ctx.createLinearGradient(0, -R, 0, -R * 0.2);
  g.addColorStop(0, mix(col, '#ffffff', 0.35)); g.addColorStop(1, col);
  ctx.beginPath();
  ctx.ellipse(0, 0, R * 1.06, R * 1.0, 0, Math.PI + 0.32, TAU - 0.32);
  ctx.quadraticCurveTo(0, -R * (front ? 0.22 : 0.5), -Math.cos(0.32) * R * 1.06, -Math.sin(0.32) * R);
  ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = R * 0.035; ctx.strokeStyle = CAT.line; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.fillStyle = '#141414'; ctx.fillRect(-R * 0.12, -R * 1.2, R * 0.24, R);
  ctx.restore();
}
function goggles(R, y, up) {
  ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = R * 0.07;
  ctx.beginPath(); ctx.moveTo(-R * 1.0, y + R * 0.05); ctx.lineTo(R * 1.0, y + R * 0.05); ctx.stroke();
  for (const s of [-1, 1]) {
    E(s * R * 0.3, y, R * 0.24, R * 0.2, '#3a3a3a');
    const g = ctx.createLinearGradient(0, y - R * 0.2, 0, y + R * 0.2);
    g.addColorStop(0, '#bff3ff'); g.addColorStop(0.5, '#3aa7d8'); g.addColorStop(1, '#0f4d7a');
    E(s * R * 0.3, y, R * 0.18, R * 0.145, g);
    E(s * R * 0.3 - R * 0.06, y - R * 0.05, R * 0.05, R * 0.03, 'rgba(255,255,255,.85)', -0.4);
  }
}
// Önden kedi kafası
function catHead(cx, cy, R, o = {}) {
  const sq = o.squint || 0, hiss = o.hiss || 0, happy = o.happy || 0, pupil = o.pupil ?? 0.25;
  const wind = o.wind || 0, lx = o.lookX || 0, ly = o.lookY || 0, glow = o.glow || 0, t = o.t || 0;
  ctx.save(); ctx.translate(cx, cy);
  // yanak tüyleri
  for (const s of [-1, 1]) {
    P([s * R * 0.8, R * 0.05, s * R * 1.18, R * 0.25 + Math.sin(t * 30 + s) * wind * 4, s * R * 0.92, R * 0.42, s * R * 1.12, R * 0.55, s * R * 0.7, R * 0.7], CAT.fur, CAT.line, R * 0.03);
  }
  E(0, 0, R, R * 0.92, CAT.fur);
  ctx.lineWidth = R * 0.035; ctx.strokeStyle = CAT.line; ctx.stroke();
  // yanak çizgileri
  ctx.strokeStyle = CAT.dark; ctx.lineWidth = R * 0.07; ctx.lineCap = 'round';
  for (const s of [-1, 1]) for (let j = 0; j < 2; j++) {
    ctx.beginPath(); ctx.moveTo(s * R * 0.95, R * (0.05 + j * 0.2)); ctx.quadraticCurveTo(s * R * 0.78, R * (0.1 + j * 0.2), s * R * 0.66, R * (0.02 + j * 0.2)); ctx.stroke();
  }
  helmetCap(R, o.helmet || CATCAR.body, true);
  catEars(R, o.earBack || 0, wind, t);
  goggles(R, -R * 0.5);
  // alın çizgileri
  ctx.strokeStyle = CAT.dark; ctx.lineWidth = R * 0.06;
  for (const s of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(s * R * 0.16, -R * 0.3); ctx.lineTo(s * R * 0.12, -R * 0.16); ctx.stroke(); }
  // gözler
  const ey = R * 0.05;
  for (const s of [-1, 1]) {
    const ex = s * R * 0.37, ew = R * 0.2, eh = R * 0.22 * (1 - sq * 0.72);
    if (happy > 0.5) {
      ctx.strokeStyle = CAT.line; ctx.lineWidth = R * 0.07;
      ctx.beginPath(); ctx.arc(ex, ey + R * 0.08, ew * 0.8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      continue;
    }
    E(ex, ey, ew + R * 0.03, eh + R * 0.03, CAT.line);
    const g = ctx.createRadialGradient(ex, ey, 1, ex, ey, ew);
    g.addColorStop(0, '#e6ff9a'); g.addColorStop(1, CAT.eye);
    E(ex, ey, ew, eh, g);
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, ew, eh, 0, 0, TAU); ctx.clip();
    E(ex + lx * ew * 0.35, ey + ly * eh * 0.3, ew * lerp(0.2, 0.78, pupil), eh * 0.95, '#120a04');
    if (glow > 0) { E(ex - ew * 0.15, ey - eh * 0.25, ew * 0.32, eh * 0.22, `rgba(255,40,30,${glow})`); }
    E(ex - ew * 0.35, ey - eh * 0.4, ew * 0.2, eh * 0.18, 'rgba(255,255,255,.95)');
    ctx.restore();
    // çatık kaş
    if (sq > 0.05) {
      ctx.strokeStyle = CAT.line; ctx.lineWidth = R * 0.07;
      ctx.beginPath(); ctx.moveTo(ex - s * ew * 1.1, ey - eh - R * 0.12 + sq * R * 0.02); ctx.lineTo(ex + s * ew * 1.0, ey - eh - R * 0.04 + sq * R * 0.06); ctx.stroke();
    }
  }
  // ağız bölgesi
  E(-R * 0.17, R * 0.42, R * 0.22, R * 0.17, CAT.white);
  E(R * 0.17, R * 0.42, R * 0.22, R * 0.17, CAT.white);
  E(0, R * 0.6, R * 0.2, R * 0.12, CAT.white);
  if (hiss > 0.02 || o.open) {
    const op = Math.max(hiss, o.open || 0);
    E(0, R * 0.56, R * 0.2, R * 0.2 * op, '#5a0f1a');
    E(0, R * 0.62 + R * 0.08 * op, R * 0.11, R * 0.07 * op, CAT.pink);
    if (hiss > 0.02) for (const s of [-1, 1]) P([s * R * 0.13, R * 0.42, s * R * 0.07, R * 0.42, s * R * 0.1, R * (0.42 + 0.13 * hiss)], '#fff');
  } else {
    ctx.strokeStyle = CAT.line; ctx.lineWidth = R * 0.04;
    ctx.beginPath(); ctx.moveTo(-R * 0.17, R * 0.5); ctx.quadraticCurveTo(-R * 0.08, R * 0.58, 0, R * 0.46); ctx.quadraticCurveTo(R * 0.08, R * 0.58, R * 0.17, R * 0.5); ctx.stroke();
  }
  P([-R * 0.09, R * 0.27, R * 0.09, R * 0.27, 0, R * 0.38], CAT.pink, CAT.line, R * 0.025);
  // bıyıklar
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = R * 0.022;
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) {
    const f = Math.sin(t * 40 + j * 2 + s) * wind * R * 0.06;
    ctx.beginPath(); ctx.moveTo(s * R * 0.3, R * (0.4 + j * 0.06));
    ctx.quadraticCurveTo(s * R * 0.8, R * (0.3 + j * 0.08) - wind * R * 0.1 + f, s * R * (1.3 + wind * 0.15), R * (0.18 + j * 0.16) - wind * R * 0.25 + f);
    ctx.stroke();
  }
  ctx.restore();
}
// Arkadan kedi (kokpitteyken)
function catBack(cx, cy, R, o = {}) {
  const t = o.t || 0, wind = o.wind ?? 1;
  ctx.save(); ctx.translate(cx, cy);
  // atkı uçları
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * R * 0.3, R * 0.75);
    for (let k = 1; k <= 8; k++) {
      const p = k / 8;
      ctx.lineTo(s * R * (0.3 + p * 1.6), R * (0.75 + p * 0.5) + Math.sin(t * 22 - k * 1.1 + s) * R * 0.18 * p * wind);
    }
    ctx.strokeStyle = '#e01b2f'; ctx.lineWidth = R * 0.26; ctx.lineCap = 'round'; ctx.stroke();
  }
  E(0, R * 0.7, R * 0.75, R * 0.25, '#e01b2f');
  E(0, R * 0.1, R, R * 0.9, CAT.fur);
  ctx.strokeStyle = CAT.dark; ctx.lineWidth = R * 0.09; ctx.lineCap = 'round';
  for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-R * 0.5, R * (0.35 + j * 0.15)); ctx.quadraticCurveTo(0, R * (0.45 + j * 0.15), R * 0.5, R * (0.35 + j * 0.15)); ctx.stroke(); }
  helmetCap(R, CATCAR.body, false);
  catEars(R, 0.35 + Math.sin(t * 9) * 0.05, wind, t);
  ctx.restore();
}
// Yandan kedi (sağa bakar)
function catSide(cx, cy, R, o = {}) {
  const t = o.t || 0, back = o.earBack || 0, look = o.look || 0, sq = o.squint || 0, hiss = o.hiss || 0;
  ctx.save(); ctx.translate(cx, cy);
  // atkı
  ctx.beginPath(); ctx.moveTo(-R * 0.2, R * 0.8);
  for (let k = 1; k <= 10; k++) { const p = k / 10; ctx.lineTo(-R * (0.2 + p * 3.2), R * (0.75 - p * 0.3) + Math.sin(t * 26 - k * 0.9) * R * 0.25 * p); }
  ctx.strokeStyle = '#e01b2f'; ctx.lineWidth = R * 0.3; ctx.lineCap = 'round'; ctx.stroke();
  // uzak kulak
  P([-R * 0.1, -R * 0.75, -R * (0.5 + back * 0.6), -R * (1.45 - back * 0.6), -R * 0.55, -R * 0.55], CAT.dark);
  E(0, 0, R, R * 0.92, CAT.fur);
  ctx.lineWidth = R * 0.04; ctx.strokeStyle = CAT.line; ctx.stroke();
  // burun
  E(R * 0.78, R * 0.25, R * 0.42, R * 0.3, CAT.light);
  P([R * 1.08, R * 0.04, R * 1.2, R * 0.12, R * 1.08, R * 0.2], CAT.pink);
  if (hiss > 0.02) { P([R * 0.6, R * 0.38, R * 1.15, R * 0.3, R * 1.05, R * (0.4 + hiss * 0.3)], '#5a0f1a'); P([R * 0.98, R * 0.32, R * 1.04, R * 0.31, R * 1.0, R * 0.44], '#fff'); }
  // kask
  ctx.save();
  ctx.beginPath(); ctx.ellipse(-R * 0.05, -R * 0.05, R * 1.06, R * 1.0, 0, Math.PI * 0.95, TAU * 0.96);
  ctx.quadraticCurveTo(R * 0.2, -R * 0.2, -R * 0.9, R * 0.3); ctx.closePath();
  const g = ctx.createLinearGradient(0, -R, 0, 0); g.addColorStop(0, '#ffb35c'); g.addColorStop(1, CATCAR.body);
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = R * 0.04; ctx.strokeStyle = CAT.line; ctx.stroke();
  ctx.restore();
  // yakın kulak
  P([R * 0.05, -R * 0.78, -R * (0.15 + back * 0.85), -R * (1.55 - back * 0.65), -R * 0.42, -R * 0.68], CAT.fur, CAT.line, R * 0.04);
  P([-R * 0.02, -R * 0.82, -R * (0.15 + back * 0.8), -R * (1.38 - back * 0.6), -R * 0.32, -R * 0.75], CAT.pink);
  // gözlük
  E(R * 0.45, -R * 0.48, R * 0.24, R * 0.18, '#333');
  E(R * 0.48, -R * 0.48, R * 0.16, R * 0.12, '#3aa7d8');
  // göz
  const eh = R * 0.2 * (1 - sq * 0.7);
  E(R * 0.48, -R * 0.02, R * 0.16, eh + R * 0.025, CAT.line);
  E(R * 0.48, -R * 0.02, R * 0.13, eh, CAT.eye);
  E(R * 0.48 + R * 0.06 * (1 - look) - R * 0.07 * look, -R * 0.02, R * 0.035, eh * 0.9, '#120a04');
  if (sq > 0.05) { ctx.strokeStyle = CAT.line; ctx.lineWidth = R * 0.07; ctx.beginPath(); ctx.moveTo(R * 0.28, -R * 0.28); ctx.lineTo(R * 0.66, -R * 0.2); ctx.stroke(); }
  // bıyıklar rüzgârda geriye
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = R * 0.03;
  for (let j = 0; j < 3; j++) {
    const f = Math.sin(t * 45 + j * 2) * R * 0.07;
    ctx.beginPath(); ctx.moveTo(R * 0.85, R * (0.25 + j * 0.06)); ctx.quadraticCurveTo(R * 0.2, R * (0.2 + j * 0.1) + f, -R * 0.7, R * (0.05 + j * 0.13) + f * 1.5); ctx.stroke();
  }
  ctx.restore();
}
function catTail(x0, y0, x1, y1, w, t, amp) {
  ctx.save();
  ctx.lineCap = 'round';
  const dx = x1 - x0, dy = y1 - y0;
  const w1 = Math.sin(t * 13) * amp, w2 = Math.sin(t * 13 - 1.4) * amp * 1.6;
  ctx.beginPath(); ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(x0 + dx * 0.2 - dy * 0.3 + w1, y0 + dy * 0.6 + dx * 0.3, x1 + dy * 0.5 + w2, y1 - dx * 0.2, x1 - dx * 0.15 + w2, y1 - Math.abs(dx) * 0.35 - w * 0.5);
  ctx.strokeStyle = CAT.line; ctx.lineWidth = w * 1.18; ctx.stroke();
  ctx.strokeStyle = CAT.fur; ctx.lineWidth = w; ctx.stroke();
  ctx.setLineDash([w * 0.45, w * 0.8]); ctx.strokeStyle = CAT.dark; ctx.lineWidth = w * 0.95; ctx.stroke();
  ctx.restore();
}
// ================================================================ ARABALAR
function tire(x, y, w, h, spin, u) {
  RR(x, y, w, h, w * 0.22, '#141414');
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, w * 0.22); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (let k = 0; k < 6; k++) { const yy = y + mod(k * h / 5 + spin * h, h * 1.2) - h * 0.1; ctx.fillRect(x, yy, w, h * 0.05); }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + w * 0.12, y, w * 0.12, h);
  ctx.restore();
}
// Arkadan araba. (x, y) = zemin ortası, w = piksel genişlik
function carRear(x, y, w, col, o = {}) {
  const u = w / 100, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0);
  E(0, -u * 1, u * 58, u * 6, 'rgba(0,0,0,.35)');
  // ön lastikler (uzakta)
  tire(-u * 44, -u * 30, u * 13, u * 17, t * 9, u); tire(u * 31, -u * 30, u * 13, u * 17, t * 9, u);
  // gövde
  const g = ctx.createLinearGradient(-u * 30, 0, u * 30, 0);
  g.addColorStop(0, mix(col.body, '#000000', 0.35)); g.addColorStop(0.5, col.body); g.addColorStop(1, mix(col.body, '#000000', 0.35));
  P([-u * 34, -u * 12, -u * 26, -u * 30, -u * 9, -u * 40, u * 9, -u * 40, u * 26, -u * 30, u * 34, -u * 12], g);
  // pilot
  if (o.cat) {
    catTail(u * 6, -u * 42, u * 34, -u * 58, u * 5, t, u * 5);
  } else {
    E(0, -u * 47, u * 8.5, u * 8, col.acc); ctx.fillStyle = '#111'; ctx.fillRect(-u * 8, -u * 49, u * 16, u * 3);
  }
  // airbox / motor kapağı
  P([-u * 5, -u * 44, u * 5, -u * 44, u * 12, -u * 14, -u * 12, -u * 14], mix(col.body, '#000000', 0.15));
  // difüzör
  P([-u * 28, -u * 14, u * 28, -u * 14, u * 32, -u * 2, -u * 32, -u * 2], '#1a1a1a');
  ctx.strokeStyle = '#333'; ctx.lineWidth = u * 0.8;
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * u * 7, -u * 13); ctx.lineTo(k * u * 8.5, -u * 2); ctx.stroke(); }
  // arka lastikler
  tire(-u * 52, -u * 34, u * 20, u * 34, t * 9, u); tire(u * 32, -u * 34, u * 20, u * 34, t * 9, u);
  // arka kanat
  RR(-u * 3, -u * 58, u * 6, u * 26, 0, '#1a1a1a');
  if (o.cat) { E(0, -u * 66, u * 9, u * 5, '#e01b2f'); }
  RR(-u * 44, -u * 70, u * 4, u * 36, u, '#1a1a1a'); RR(u * 40, -u * 70, u * 4, u * 36, u, '#1a1a1a');
  RR(-u * 42, -u * 70, u * 84, u * 9, u * 1.5, col.body);
  RR(-u * 42, -u * 61, u * 84, u * 4, u, col.acc);
  if (w > 120) txt(o.cat ? 'MİYAV' : col.num, 0, -u * 65.5, u * 7, col.acc, { italic: true });
  if (o.cat) catBack(0, -u * 78, u * 11.5, { t, wind: o.wind ?? 1 });
  // fren / yağmur lambası
  const blink = (Math.floor(t * 8) % 2 === 0) ? 1 : 0.25;
  RR(-u * 3, -u * 20, u * 6, u * 4, u, `rgba(255,30,30,${blink})`);
  if (blink === 1) E(0, -u * 18, u * 7, u * 5, 'rgba(255,40,40,.35)');
  // egzoz alevi
  if (o.boost > 0) {
    const fl = o.boost * (0.7 + 0.3 * hash(Math.floor(t * 60)));
    E(0, -u * 27, u * 5 * fl, u * 9 * fl, 'rgba(80,160,255,.75)');
    E(0, -u * 27, u * 2.5 * fl, u * 5 * fl, 'rgba(255,240,200,.95)');
  }
  ctx.restore();
}
// Önden araba. (x, y) zemin ortası
function carFront(x, y, w, col, o = {}) {
  const u = w / 100, t = o.t || 0;
  ctx.save(); ctx.translate(x, y);
  E(0, -u * 1, u * 58, u * 6, 'rgba(0,0,0,.4)');
  // arka kanat ve arka lastikler (arkada)
  RR(-u * 40, -u * 36, u * 80, u * 6, u, '#1a1a1a');
  tire(-u * 50, -u * 40, u * 14, u * 32, 0, u); tire(u * 36, -u * 40, u * 14, u * 32, 0, u);
  // yan kasalar
  const g = ctx.createLinearGradient(0, -u * 40, 0, -u * 12);
  g.addColorStop(0, mix(col.body, '#ffffff', 0.25)); g.addColorStop(1, mix(col.body, '#000000', 0.3));
  P([-u * 34, -u * 16, -u * 30, -u * 34, -u * 10, -u * 42, u * 10, -u * 42, u * 30, -u * 34, u * 34, -u * 16], g, CAT.line, u * 0.5);
  // pilot (kedi)
  if (o.cat) {
    const R = u * 13;
    // patiler
    if (o.paws > 0) {
      for (const s of [-1, 1]) {
        const k = o.paws, wv = Math.sin(t * 10 + s) * u * 3;
        const ex = s * u * (16 + 12 * k), ey = -u * (40 + 40 * k) + wv;
        ctx.lineCap = 'round';
        ctx.strokeStyle = CAT.line; ctx.lineWidth = u * 7.4; ctx.beginPath(); ctx.moveTo(s * u * 9, -u * 42); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = CAT.fur; ctx.lineWidth = u * 6.4; ctx.beginPath(); ctx.moveTo(s * u * 9, -u * 42); ctx.lineTo(ex, ey); ctx.stroke();
        E(ex, ey, u * 4.6, u * 4.2, CAT.white);
        E(ex, ey + u * 0.8, u * 2, u * 1.6, CAT.pink);
        for (let j = -1; j <= 1; j++) E(ex + j * u * 2, ey - u * 2.2, u * 0.9, u * 0.9, CAT.pink);
      }
    }
    E(0, -u * 44, u * 10, u * 4, '#e01b2f');
    catHead(0, -u * 56 - (o.rise || 0) * u, R, o.face || {});
  }
  // halo
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = u * 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -u * 28); ctx.lineTo(0, -u * 44); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -u * 44, u * 14, u * 3, 0, Math.PI, TAU); ctx.stroke();
  // burun
  P([-u * 10, -u * 30, u * 10, -u * 30, u * 6, -u * 10, -u * 6, -u * 10], col.body, CAT.line, u * 0.5);
  if (w > 200) txt(col.num, 0, -u * 21, u * 8, col.acc, { italic: false });
  // süspansiyon
  ctx.strokeStyle = '#222'; ctx.lineWidth = u * 1.2;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * u * 6, -u * 22); ctx.lineTo(s * u * 32, -u * 18); ctx.moveTo(s * u * 6, -u * 14); ctx.lineTo(s * u * 32, -u * 10); ctx.stroke(); }
  // ön lastikler
  tire(-u * 46, -u * 28, u * 15, u * 28, 0, u); tire(u * 31, -u * 28, u * 15, u * 28, 0, u);
  // ön kanat
  P([-u * 50, -u * 10, u * 50, -u * 10, u * 50, -u * 2, -u * 50, -u * 2], col.acc);
  P([-u * 48, -u * 13, u * 48, -u * 13, u * 46, -u * 9, -u * 46, -u * 9], col.body);
  RR(-u * 52, -u * 14, u * 3, u * 13, u * 0.5, '#1a1a1a'); RR(u * 49, -u * 14, u * 3, u * 13, u * 0.5, '#1a1a1a');
  ctx.restore();
}
// Yandan araba (sağa gider). (x, y) zemin, L = uzunluk
function carSide(x, y, L, col, o = {}) {
  const u = L / 100, t = o.t || 0;
  ctx.save(); ctx.translate(x, y);
  E(0, -u * 0.5, u * 52, u * 3, 'rgba(0,0,0,.4)');
  // taban
  RR(-u * 48, -u * 8, u * 92, u * 3, u, '#1a1a1a');
  // gövde
  const g = ctx.createLinearGradient(0, -u * 30, 0, -u * 6);
  g.addColorStop(0, mix(col.body, '#ffffff', 0.3)); g.addColorStop(0.6, col.body); g.addColorStop(1, mix(col.body, '#000000', 0.35));
  P([u * 52, -u * 8, u * 30, -u * 13, u * 12, -u * 16, u * 2, -u * 18, -u * 6, -u * 28, -u * 12, -u * 29, -u * 18, -u * 22, -u * 38, -u * 17, -u * 46, -u * 12, -u * 46, -u * 7, u * 40, -u * 6], g, CAT.line, u * 0.35);
  // yan şerit ve numara
  P([u * 30, -u * 11, u * 6, -u * 14, -u * 30, -u * 12, -u * 30, -u * 9, u * 6, -u * 10.5], col.acc);
  txt(o.cat ? '7' : col.num, -u * 22, -u * 18.5, u * 6, col.acc, {});
  // pilot
  if (o.cat) {
    catTail(-u * 6, -u * 20, -u * 22, -u * 34, u * 3, t, u * 3);
    catSide(u * 3, -u * 24, u * 6.2, o.face || { t });
  } else {
    E(u * 3, -u * 22, u * 5.5, u * 5, col.acc); RR(u * 3, -u * 24, u * 5, u * 2.4, u, '#111');
  }
  // halo
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = u * 1.1; ctx.beginPath(); ctx.moveTo(u * 12, -u * 16); ctx.quadraticCurveTo(u * 6, -u * 26, -u * 4, -u * 26); ctx.stroke();
  // kanatlar
  RR(-u * 52, -u * 33, u * 12, u * 5, u, col.body); RR(-u * 50, -u * 28, u * 3, u * 20, 0, '#1a1a1a');
  RR(u * 40, -u * 5, u * 15, u * 3, u, col.acc); RR(u * 50, -u * 8, u * 4, u * 7, u, '#1a1a1a');
  // tekerlekler
  for (const [wx, r] of [[u * 30, u * 10], [-u * 34, u * 11.5]]) {
    E(wx, -r, r, r, '#121212');
    E(wx, -r, r * 0.6, r * 0.6, '#3a3a3a');
    ctx.strokeStyle = 'rgba(200,200,200,.35)'; ctx.lineWidth = r * 0.12;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(wx, -r, r * 0.45, o.wheel + k * 2.1, o.wheel + k * 2.1 + 0.9); ctx.stroke(); }
    E(wx, -r, r * 0.16, r * 0.16, col.acc);
  }
  if (o.boost > 0) {
    const fl = o.boost * (0.7 + 0.3 * hash(Math.floor(t * 60)));
    E(-u * 52, -u * 16, u * 9 * fl, u * 2.6 * fl, 'rgba(80,160,255,.8)');
    E(-u * 50, -u * 16, u * 5 * fl, u * 1.4 * fl, 'rgba(255,245,210,.95)');
  }
  ctx.restore();
}
// Yukarıdan araba. ang = yön, L = uzunluk
function carTop(x, y, ang, L, col, o = {}) {
  const u = L / 100, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  RR(-u * 48 + u * 5, -u * 23 + u * 6, u * 98, u * 46, u * 8, 'rgba(0,0,0,.3)');
  for (const s of [-1, 1]) { RR(-u * 42, s * u * 20 - u * 6, u * 19, u * 12, u * 2, '#151515'); RR(u * 20, s * u * 19 - u * 5, u * 15, u * 10, u * 2, '#151515'); }
  ctx.strokeStyle = '#222'; ctx.lineWidth = u * 1.5;
  ctx.beginPath(); ctx.moveTo(u * 10, -u * 6); ctx.lineTo(u * 27, -u * 17); ctx.moveTo(u * 10, u * 6); ctx.lineTo(u * 27, u * 17); ctx.stroke();
  RR(-u * 42, -u * 15, u * 74, u * 30, u * 6, '#1d1d1d');
  P([u * 52, 0, u * 32, -u * 4, u * 12, -u * 7, u * 2, -u * 15, -u * 26, -u * 15, -u * 38, -u * 6, -u * 46, -u * 4, -u * 46, u * 4, -u * 38, u * 6, -u * 26, u * 15, u * 2, u * 15, u * 12, u * 7, u * 32, u * 4], col.body, CAT.line, u * 0.6);
  RR(u * 41, -u * 25, u * 8, u * 50, u * 2, col.acc);
  RR(-u * 52, -u * 21, u * 9, u * 42, u * 2, mix(col.body, '#000000', 0.25));
  RR(-u * 30, -u * 2, u * 40, u * 4, u, col.acc);
  E(u * 6, 0, u * 10, u * 6.5, '#151515');
  if (o.cat) {
    catTail(-u * 4, u * 5, -u * 32, u * 18, u * 3, t, u * 4);
    E(u * 6, 0, u * 6, u * 6, CATCAR.body);
    P([u * 3, -u * 4, u * 1, -u * 10, u * 8, -u * 5], CAT.fur); P([u * 3, u * 4, u * 1, u * 10, u * 8, u * 5], CAT.fur);
  } else E(u * 6, 0, u * 5, u * 5, col.acc);
  ctx.restore();
}

// ================================================================ HAREKET VERİSİ
// Takip kamerası dünyası: oyuncu hızı (birim/sn)
function speedT(t) {
  return kf(t, [[3.4, 0], [4.6, 6000], [6.2, 10000], [10, 12500], [15.6, 12800], [16.6, 8800], [19.2, 9800], [21, 13000], [26, 13600], [27.4, 14600], [28.4, 9000], [30, 4000]]);
}
function curveT(t) {
  return bump(t, 4.8, 7.2, -2.0) + bump(t, 7.6, 10.4, 2.6) + bump(t, 15.0, 16.4, -1.6) + bump(t, 16.4, 19.6, 4.6, 0.5) + bump(t, 19.9, 21.6, -2.2);
}
const DT = 1 / 600, TN = Math.ceil(32 / DT) + 2;
const ZT = new Float64Array(TN), BT = new Float64Array(TN);
for (let i = 1; i < TN; i++) {
  const t = i * DT, v = speedT(t);
  ZT[i] = ZT[i - 1] + v * DT;
  BT[i] = BT[i - 1] + curveT(t) * v * DT * 0.004;
}
function tab(A, t) { const f = clamp(t / DT, 0, TN - 2), i = Math.floor(f); return lerp(A[i], A[i + 1], f - i); }
const zAt = t => tab(ZT, t), bgAt = t => tab(BT, t);
function tOfZ(z) {
  if (z <= 0) return 0;
  let lo = 0, hi = TN - 1;
  if (z >= ZT[hi]) return hi * DT;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ZT[m] < z) lo = m; else hi = m; }
  return hi * DT;
}
const SEG = 200, ROADW = 2000, CAMH = 1400, DEPTH = 0.84, ZP = 1300, NSEG = 260;
const curveZ = z => curveT(tOfZ(z));
const hill = z => 900 * Math.sin(z / 42000) + 350 * Math.sin(z / 12000 + 1);
const Z_FINISH = zAt(27.25);

// Rakipler (takip kamerası): p = sollanma anı, v = yakınlaşma hızı
const CH_R = [
  { p: 6.6, v: 3200, lane: 0.42, c: 0 },
  { p: 8.6, v: 2900, lane: -0.4, c: 1 },
  { p: 10.5, v: 3400, lane: 0.15, c: 2 },
  { p: 13.6, v: 2500, lane: -0.12, c: 3 },
  { p: 17.3, v: 2600, lane: -0.38, c: 4 },
  { p: 19.6, v: 3000, lane: 0.42, c: 5 },
  { p: 23.3, v: 1250, lane: 0.05, c: 6 },
];
const PASSES = [6.6, 8.6, 10.5, 13.6, 17.3, 19.6, 23.3];
const PX = [[0, 0], [5.4, 0], [6.1, -0.42], [7.0, -0.42], [7.7, 0.36], [9.0, 0.36], [9.8, -0.45], [11, -0.4], [15, -0.1], [16.4, 0.1], [17.0, 0.44], [18.6, 0.3], [19.2, -0.42], [20.3, -0.4], [21, 0], [26, 0]];
const posAt = t => 8 - PASSES.filter(p => t >= p).length;

// ================================================================ HUD
function hud(t, v) {
  const pos = posAt(t);
  const last = PASSES.filter(p => t >= p).pop() ?? -9;
  const pop = 1 + 0.35 * Math.max(0, 1 - (t - last) / 0.35);
  ctx.save();
  RR(40, 40, 250, 120, 18, 'rgba(10,10,14,.62)');
  ctx.translate(120, 102); ctx.scale(pop, pop);
  txt('P' + pos, 0, 0, 78, pos === 1 ? '#ffd23f' : '#ffffff', {});
  ctx.restore();
  txt('/8', 225, 120, 34, 'rgba(255,255,255,.75)', {});
  txt('SON TUR', 165, 190, 26, '#ffffff', { stroke: 'rgba(0,0,0,.6)', lw: 6 });
  if (v !== undefined) {
    // hız göstergesi
    const cx = W - 170, cy = H - 160, r = 110, k = clamp(v / 15000);
    ctx.beginPath(); ctx.arc(cx, cy, r + 18, 0, TAU); ctx.fillStyle = 'rgba(10,10,14,.62)'; ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
    const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0); g.addColorStop(0, '#ffd23f'); g.addColorStop(1, '#ff3b1f');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * k)); ctx.stroke();
    txt(String(Math.round(v / 40)), cx, cy - 8, 70, '#fff', { italic: false });
    txt('km/sa', cx, cy + 50, 24, 'rgba(255,255,255,.8)', { italic: false });
    const gear = clamp(Math.floor(v / 1900) + 1, 1, 8), rpm = v < 50 ? 0.2 : (v - (gear - 1) * 1900) / 1900;
    txt(String(gear), cx, cy + 92, 30, '#ffd23f', { italic: false });
    // devir ışıkları
    for (let i = 0; i < 15; i++) {
      const on = i / 15 < rpm;
      const c = i < 5 ? '#29d65a' : i < 10 ? '#ff3b1f' : '#7b5cff';
      E(W / 2 - 280 + i * 40, 60, 13, 13, on ? c : 'rgba(255,255,255,.14)');
    }
  }
}

// ================================================================ SAHNE: TAKİP KAMERASI
function proj(wx, wy, wz, camX, camY, camZ) {
  const cz = wz - camZ, s = DEPTH / cz;
  return { x: W / 2 + s * (wx - camX) * W / 2, y: H / 2 - s * (wy - camY) * H / 2, w: s * ROADW * W / 2, s: s * W / 2, cz };
}
function chaseBackground(t, bo) {
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#2a78d4'); g.addColorStop(1, '#cfe7f7');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 620);
  const sx = mod(1450 - bo * 0.08, W + 400) - 200;
  const sg = ctx.createRadialGradient(sx, 150, 10, sx, 150, 260);
  sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.15, 'rgba(255,245,200,.9)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = sg; ctx.fillRect(sx - 260, 0, 520, 420);
  for (let k = 0; k < 8; k++) {
    const x = mod(k * 430 - bo * 0.18, W + 700) - 350, y = 70 + hash(k) * 220, s = 0.6 + hash(k + 9) * 0.8;
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(x + j * 60 * s, y + Math.sin(j * 2) * 12 * s, 70 * s, 34 * s, 0, 0, TAU); ctx.fill(); }
  }
  const layer = (par, base, a1, a2, col) => {
    ctx.beginPath(); ctx.moveTo(0, 620);
    for (let x = 0; x <= W; x += 16) { const X = x + bo * par; ctx.lineTo(x, base - a1 * (0.6 + 0.4 * Math.sin(X / 260)) - a2 * Math.sin(X / 93 + 1)); }
    ctx.lineTo(W, 620); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  layer(0.35, 560, 120, 30, '#8fb1cc');
  layer(0.7, 566, 45, 14, '#5f9c58');
  ctx.fillStyle = '#4f9a45'; ctx.fillRect(0, 560, W, H - 560);
}
function standSprite(x, y, s, side) {
  const w = 3600 * s, h = 1500 * s;
  if (w < 4) return;
  const x0 = x - w / 2;
  ctx.fillStyle = '#9097a3'; ctx.fillRect(x0, y - h * 0.25, w, h * 0.25);
  ctx.drawImage(crowdTex, 0, 0, 512, 256, x0, y - h * 0.92, w, h * 0.68);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  for (let k = 1; k < 6; k++) ctx.fillRect(x0, y - h * 0.25 - k * h * 0.113, w, Math.max(1, h * 0.012));
  P([x0 - w * 0.03, y - h * 0.92, x0 + w * 1.03, y - h * 0.92, x0 + w * 1.06, y - h, x0 - w * 0.06, y - h], '#e8e8ea');
  ctx.fillStyle = '#ff7a00'; ctx.fillRect(x0, y - h * 0.3, w, h * 0.05);
}
function boardSprite(x, y, s, k) {
  const w = 1900 * s, h = 420 * s;
  if (w < 3) return;
  ctx.fillStyle = '#333'; ctx.fillRect(x - w * 0.4, y - h * 1.6, w * 0.03, h * 1.6); ctx.fillRect(x + w * 0.37, y - h * 1.6, w * 0.03, h * 1.6);
  const cols = [['#ff7a00', '#111'], ['#111', '#ffd23f'], ['#1e41ff', '#fff'], ['#fff', '#d81e2c']][k % 4];
  RR(x - w / 2, y - h * 2.2, w, h, h * 0.08, cols[0]);
  if (h > 10) txt(['MİYAV', 'TON BALIĞI', 'PATİ GP', 'MAMA'][k % 4], x, y - h * 1.7, h * 0.55, cols[1], {});
}
function poleSprite(x, y, s) {
  const w = 110 * s, h = 3400 * s;
  if (h < 4) return;
  ctx.fillStyle = '#6d737c'; ctx.fillRect(x - w / 2, y - h, w, h);
  RR(x - w * 4, y - h - w * 2, w * 8, w * 3, w * 0.4, '#3a3f46');
  ctx.fillStyle = '#fff8d8'; for (let k = 0; k < 4; k++) ctx.fillRect(x - w * 3.5 + k * w * 1.8, y - h - w * 1.5, w * 1.2, w * 1.6);
}
function tireWall(x, y, s) {
  const w = 1700 * s, h = 300 * s;
  if (w < 3) return;
  const n = 8;
  for (let r = 0; r < 3; r++) for (let k = 0; k < n; k++) {
    ctx.fillStyle = (k + r) % 2 ? '#e8e8e8' : '#d81e2c';
    ctx.fillRect(x - w / 2 + k * w / n, y - h + r * h / 3, w / n - 1, h / 3 - 1);
  }
}
function treeSprite(x, y, s, k) {
  const h = (2000 + hash(k) * 1200) * s, w = h * 0.45;
  if (h < 4) return;
  ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x - w * 0.06, y - h * 0.25, w * 0.12, h * 0.25);
  P([x, y - h, x + w / 2, y - h * 0.22, x - w / 2, y - h * 0.22], '#2f6b34');
  P([x, y - h * 1.05, x + w * 0.3, y - h * 0.55, x - w * 0.3, y - h * 0.55], '#3c8341');
}
function gantrySprite(x, y, s, roadw) {
  const h = 2600 * s, pw = 160 * s;
  ctx.fillStyle = '#2b2f36'; ctx.fillRect(x - roadw * 1.25 - pw, y - h, pw, h); ctx.fillRect(x + roadw * 1.25, y - h, pw, h);
  const bw = roadw * 2.5 + pw * 2, bh = 420 * s, bx = x - roadw * 1.25 - pw, by = y - h - bh;
  const n = 24;
  for (let k = 0; k < n; k++) for (let r = 0; r < 2; r++) { ctx.fillStyle = (k + r) % 2 ? '#fff' : '#111'; ctx.fillRect(bx + k * bw / n, by + r * bh / 2, bw / n + 1, bh / 2 + 1); }
  if (bh > 14) { RR(x - bw * 0.16, by + bh * 0.08, bw * 0.32, bh * 0.84, bh * 0.1, '#ff7a00'); txt('FİNİŞ', x, by + bh / 2, bh * 0.62, '#111', {}); }
}

function chaseScene(t) {
  const z = zAt(t), v = speedT(t);
  const px = kf(t, PX);
  const camX = px * ROADW * 0.7;
  const camZ = z - ZP, camY = CAMH + hill(z);
  const shake = Math.min(1, v / 13000);
  const fr = Math.round(t * 60);
  ctx.save();
  ctx.translate((hash(fr) - 0.5) * 6 * shake, (hash(fr + 7) - 0.5) * 6 * shake);
  ctx.translate(W / 2, H / 2); ctx.scale(1.02, 1.02); ctx.translate(-W / 2, -H / 2);
  chaseBackground(t, bgAt(t) * 140);

  const base = Math.floor(camZ / SEG), frac = (camZ - base * SEG) / SEG;
  let x = 0, dx = -curveZ(base * SEG) * frac;
  let maxy = H;
  const segs = [];
  const fog = '#cbe1f1';
  const iF = Math.floor(Z_FINISH / SEG);
  for (let n = 0; n < NSEG; n++) {
    const i = base + n, z1 = i * SEG, z2 = z1 + SEG;
    const c = curveZ(z1);
    const p1 = proj(x, hill(z1), z1, camX, camY, camZ), p2 = proj(x + dx, hill(z2), z2, camX, camY, camZ);
    x += dx; dx += c;
    const sg = { i, p1, p2, clip: maxy, n };
    segs.push(sg);
    if (p1.cz <= DEPTH || p2.y >= p1.y || p2.y >= maxy) continue;
    const f = Math.pow(n / NSEG, 1.6), alt = Math.floor(i / 3) % 2;
    const grass = mix(alt ? '#46a33e' : '#3c9335', fog, f);
    ctx.fillStyle = grass; ctx.fillRect(0, p2.y, W, p1.y - p2.y + 1);
    const ru = (a, b, k1, k2, col) => P([p1.x + a * p1.w, p1.y + 1.5, p1.x + b * p1.w, p1.y + 1.5, p2.x + b * p2.w, p2.y - 0.5, p2.x + a * p2.w, p2.y - 0.5], col);
    const runoff = mix('#7d8087', fog, f);
    ru(-1.75, -1.12, 0, 0, runoff); ru(1.12, 1.75, 0, 0, runoff);
    const kerb = mix(alt ? '#e10600' : '#f4f4f4', fog, f);
    ru(-1.12, -1, 0, 0, kerb); ru(1, 1.12, 0, 0, kerb);
    ru(-1, 1, 0, 0, mix(alt ? '#55585e' : '#51545a', fog, f));
    ru(-0.97, -0.94, 0, 0, mix('#f0f0f0', fog, f)); ru(0.94, 0.97, 0, 0, mix('#f0f0f0', fog, f));
    if (i >= iF && i < iF + 3) {
      const cols = 14;
      for (let k = 0; k < cols; k++) if ((k + i) % 2) ru(-1 + 2 * k / cols, -1 + 2 * (k + 1) / cols, 0, 0, '#111');
      else ru(-1 + 2 * k / cols, -1 + 2 * (k + 1) / cols, 0, 0, '#fafafa');
    }
    if (i > 2 && i < 40 && i % 5 === 0) for (const l of [-0.5, 0.5]) ru(l - 0.18, l + 0.18, 0, 0, 'rgba(255,255,255,.55)');
    // asfalttaki lastik izleri
    ru(-0.52, -0.44, 0, 0, 'rgba(20,20,20,.18)'); ru(0.44, 0.52, 0, 0, 'rgba(20,20,20,.18)');
    maxy = p2.y;
  }

  // sprite'lar arkadan öne
  const cars = {};
  for (const r of CH_R) {
    const d = r.v * (r.p - t);
    if (d < -1150 || d > NSEG * SEG * 0.85) continue;
    const rz = z + d, n = Math.floor((rz - camZ) / SEG);
    if (n < 1 || n >= segs.length) continue;
    (cars[n] = cars[n] || []).push({ r, f: (rz - camZ) / SEG - n, d });
  }
  for (let n = segs.length - 1; n >= 1; n--) {
    const sg = segs[n], p = sg.p1;
    if (p.cz <= DEPTH) continue;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, sg.clip); ctx.clip();
    const f = Math.pow(n / NSEG, 1.6);
    ctx.globalAlpha = 1 - f * 0.75;
    const i = sg.i;
    if (i >= Math.floor(Z_FINISH / SEG) && i === Math.floor(Z_FINISH / SEG)) gantrySprite(p.x, p.y, p.s, p.w);
    if (i % 9 === 0) {
      for (const side of [-1, 1]) {
        const hsh = hash(i * 3 + side), sx = p.x + side * p.w * 2.9;
        const block = Math.floor(i / 72) % 3;
        if ((side === -1 && block !== 1) || (side === 1 && block === 1)) standSprite(p.x + side * p.w * 3.6, p.y, p.s, side);
        else if (hsh < 0.35) boardSprite(sx, p.y, p.s, i);
        else if (hsh < 0.55) poleSprite(p.x + side * p.w * 2.3, p.y, p.s);
        else if (hsh < 0.75) tireWall(p.x + side * p.w * 2.05, p.y, p.s);
        else treeSprite(p.x + side * p.w * 3.4, p.y, p.s, i);
      }
    }
    if (cars[n]) for (const c of cars[n]) {
      const q = sg.p2, k = c.f;
      const sx = lerp(p.x, q.x, k), sy = lerp(p.y, q.y, k), sw = lerp(p.w, q.w, k), s = lerp(p.s, q.s, k);
      const lane = c.r.lane + Math.sin(t * 1.3 + c.r.c) * 0.05;
      carRear(sx + lane * sw, sy, s * 700, RIV[c.r.c], { t: t + c.r.c, tilt: -curveZ(z + c.d) * 0.012 });
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // oyuncu
  const sP = DEPTH / ZP;
  const n0 = Math.floor((z - camZ) / SEG), s0 = segs[n0], k0 = (z - camZ) / SEG - n0;
  const rx = lerp(s0.p1.x, s0.p2.x, k0), rw = lerp(s0.p1.w, s0.p2.w, k0), ry = lerp(s0.p1.y, s0.p2.y, k0);
  const pxs = rx + px * rw, c = curveT(t);
  const drift = ss(16.7, 17.2, t) * (1 - ss(18.8, 19.3, t));
  const pw = sP * 700 * W / 2;
  // drift kıvılcımları ve duman
  if (drift > 0) {
    for (let k = 0; k < 90; k++) {
      const te = 16.7 + k * 0.03;
      const age = t - te;
      if (age < 0 || age > 0.45) continue;
      const vx = (hash(k) - 0.5) * 1400, vy = 200 + hash(k + 3) * 700;
      const x0 = pxs + (hash(k + 5) - 0.5) * pw * 0.6, y0 = ry - 6;
      const x1 = x0 + vx * age, y1 = y0 + vy * age + 900 * age * age;
      ctx.strokeStyle = `rgba(255,${200 + hash(k + 8) * 55 | 0},80,${1 - age / 0.45})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - vx * 0.03, y1 - vy * 0.03); ctx.stroke();
    }
    for (let k = 0; k < 40; k++) {
      const te = 16.7 + k * 0.06, age = t - te;
      if (age < 0 || age > 1.1) continue;
      for (const s of [-1, 1]) E(pxs + s * pw * 0.42 + (hash(k) - 0.5) * 80 - c * age * 120, ry - 30 - age * 90, 40 + age * 260, 30 + age * 160, `rgba(225,225,230,${0.42 * (1 - age / 1.1) * drift})`);
    }
  }
  carRear(pxs, ry + Math.sin(t * 50) * 1.5, pw, CATCAR, { cat: true, t, tilt: -c * 0.018 + drift * 0.05 * Math.sin(t * 20), boost: v > 12000 ? (v - 12000) / 2500 : 0 });

  // hız çizgileri
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3;
  const nl = Math.floor(shake * 26);
  for (let k = 0; k < nl; k++) {
    const a = hash(fr * 31 + k) * TAU, r0 = 520 + hash(fr * 17 + k) * 300, len = 120 + shake * 260;
    const cx = W / 2, cy = H * 0.52;
    ctx.globalAlpha = 0.25 + 0.5 * hash(k + fr);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0 * 1.7, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + len) * 1.7, cy + Math.sin(a) * (r0 + len)); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  hud(t, v);
}

// ================================================================ SAHNE: START
function standsBand(y0, y1, scroll) {
  const g = ctx.createLinearGradient(0, 0, 0, y0);
  g.addColorStop(0, '#2a78d4'); g.addColorStop(1, '#bfe0f4');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, y0 + 2);
  const h = y1 - y0, tw = h * 2;
  for (let x = -mod(scroll, tw); x < W; x += tw) ctx.drawImage(crowdTex, x, y0 + h * 0.12, tw, h * 0.8);
  ctx.fillStyle = '#e8e8ea'; ctx.fillRect(0, y0 - h * 0.05, W, h * 0.14);
  ctx.fillStyle = '#ff7a00'; ctx.fillRect(0, y1 - h * 0.1, W, h * 0.1);
}
function startScene(t) {
  const push = 1 + t * 0.025;
  const launch = ss(3.45, 4.0, t);
  const fr = Math.round(t * 60);
  const rev = 0.5 + 0.5 * Math.sin(t * 9) + ss(2.6, 3.3, t) * 1.5;
  ctx.save();
  ctx.translate((hash(fr) - 0.5) * 3 * rev, (hash(fr + 3) - 0.5) * 3 * rev);
  ctx.translate(W / 2, H * 0.6); ctx.scale(push, push); ctx.translate(-W / 2, -H * 0.6);
  standsBand(260, 600, t * 6);
  // pist
  ctx.fillStyle = '#55585e'; ctx.fillRect(-200, 600, W + 400, H);
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 8;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const yy = 680 + k * 140;
    ctx.beginPath(); ctx.moveTo(W / 2 + s * (300 + k * 80), yy); ctx.lineTo(W / 2 + s * (560 + k * 140), yy); ctx.stroke();
  }
  ctx.fillStyle = '#e10600'; ctx.fillRect(-200, 600, W + 400, 14);
  // arka plandaki rakipler (önde başlayanlar, sırtları dönük)
  carRear(W / 2 - 520, 690, 300, RIV[2], { t });
  carRear(W / 2 + 480, 650, 250, RIV[6], { t: t + 1 });
  carRear(W / 2 + 40, 625, 190, RIV[0], { t: t + 2 });
  // kedi
  const lightsOn = [0.7, 1.2, 1.7, 2.2, 2.7].filter(a => t >= a).length * (t < 3.4 ? 1 : 0);
  const face = {
    t, glow: lightsOn ? 0.55 : 0,
    squint: t < 0.7 ? 0 : t < 3.4 ? lightsOn * 0.15 : ss(3.4, 3.42, t) * 0 + ss(3.55, 3.75, t) * 0.8,
    pupil: t >= 3.4 && t < 3.6 ? 1 : 0.15,
    lookX: t < 0.7 ? Math.sin(t * 6) : 0, lookY: t < 3.4 ? -0.5 : 0,
    wind: launch,
  };
  const cy = 1030 + launch * 220, cw = 1060 * (1 + launch * 1.4);
  carFront(W / 2, cy, cw, CATCAR, { cat: true, t, face });
  ctx.restore();

  // ışık gantrisi (ön planda)
  ctx.save();
  const gy = 30 - launch * 300;
  RR(W / 2 - 620, gy, 1240, 150, 16, '#16181c');
  for (let i = 0; i < 5; i++) {
    const x = W / 2 - 480 + i * 240;
    RR(x - 70, gy + 10, 140, 130, 12, '#0b0c0e');
    for (let r = 0; r < 2; r++) {
      const on = i < lightsOn;
      E(x - 32 + r * 64, gy + 75, 28, 28, on ? '#ff2a1a' : '#2a0d0b');
      if (on) { E(x - 32 + r * 64, gy + 75, 52, 52, 'rgba(255,40,20,.25)'); E(x - 40 + r * 64, gy + 66, 9, 7, 'rgba(255,220,200,.9)'); }
    }
  }
  ctx.restore();
  // başlık
  const ta = ss(0.15, 0.5, t) * (1 - ss(2.2, 2.6, t));
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha = ta;
    const bx = lerp(-600, 0, easeOut(ss(0.15, 0.6, t)));
    ctx.translate(bx, 0);
    P([60, 880, 900, 880, 860, 1000, 20, 1000], 'rgba(12,12,16,.85)');
    for (let k = 0; k < 40; k++) for (let r = 0; r < 2; r++) { ctx.fillStyle = (k + r) % 2 ? '#fff' : '#111'; ctx.fillRect(60 + k * 21, 862 + r * 9, 21, 9); }
    txt('MİYAV GRAND PRIX', 460, 940, 66, '#ff7a00', { stroke: '#000', lw: 4 });
    ctx.restore();
  }
  if (t >= 3.4) {
    const k = ss(3.4, 3.5, t), sc = 1 + 0.3 * (1 - k);
    ctx.save(); ctx.translate(W / 2, 560); ctx.scale(sc, sc); ctx.rotate(-0.05);
    txt('IŞIKLAR SÖNDÜ!', 0, 0, 150, '#ffd23f', { stroke: '#120800', lw: 16 });
    ctx.restore();
  }
}
const easeOut = k => 1 - Math.pow(1 - k, 3);

// ================================================================ SAHNE: YANDAN
function sideBackground(t, speed) {
  standsBand(150, 520, t * speed * 0.12);
  // çit ve direkler
  ctx.fillStyle = '#7b8a7a'; ctx.fillRect(0, 520, W, 150);
  ctx.fillStyle = 'rgba(40,50,40,.35)';
  for (let x = -mod(t * speed * 0.6, 120); x < W; x += 120) ctx.fillRect(x, 520, 60, 150);
  ctx.fillStyle = '#c9ced4'; ctx.fillRect(0, 640, W, 30);
  // pist
  ctx.fillStyle = '#55585e'; ctx.fillRect(0, 670, W, H - 670);
  // kerb (bulanık)
  const kw = 140, off2 = mod(t * speed * 1.6, kw * 2);
  for (let x = -off2; x < W; x += kw * 2) { ctx.fillStyle = '#e10600'; ctx.fillRect(x, 1030, kw, 50); ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x + kw, 1030, kw, 50); }
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  for (let k = 0; k < 18; k++) {
    const y = 690 + hash(k) * 330, len = 300 + hash(k + 2) * 500;
    const x = W - mod(t * speed * 1.5 + hash(k + 4) * 4000, W + len * 2);
    ctx.fillRect(x, y, len, 3);
  }
  // hız bulanıklığı
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  for (let k = 0; k < 10; k++) ctx.fillRect(0, 160 + hash(k + 50) * 500, W, 2 + hash(k) * 4);
}
function sideScene(t) {
  const u = t - 11;
  const fr = Math.round(t * 60);
  ctx.save();
  ctx.translate((hash(fr) - 0.5) * 5, (hash(fr + 1) - 0.5) * 5);
  sideBackground(t, 5200);
  const rx = kf(u, [[0, 1180], [1.3, 980], [2.1, 920], [2.9, 760], [3.4, 300], [4, -700]]);
  const cx = kf(u, [[0, 640], [1.3, 760], [2.1, 820], [3.0, 980], [4, 1080]]);
  const boost = ss(2.1, 2.4, u);
  carSide(rx, 860, 760, RIV[3], { t, wheel: -t * 60 });
  const face = { t, earBack: u > 0.8 ? 0.9 : 0.3, look: u > 0.6 && u < 1.3 ? 1 : 0, squint: u > 0.8 ? 0.7 : 0.2, hiss: 0 };
  carSide(cx, 1040, 960, CATCAR, { cat: true, t, wheel: -t * 60, boost, face });
  // rüzgâr çizgileri
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
  for (let k = 0; k < 14; k++) {
    const y = 100 + hash(fr * 7 + k) * 900, x = hash(fr * 13 + k) * W;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 260, y); ctx.stroke();
  }
  if (u > 2.15 && u < 3.2) {
    const k = ss(2.15, 2.3, u);
    ctx.save(); ctx.translate(cx + 380, 520); ctx.rotate(-0.08); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    txt('TURBO!', 0, 0, 120, '#4fc3ff', { stroke: '#04121f', lw: 14 });
    ctx.restore();
  }
  ctx.restore();
  hud(t, 12500 + boost * 1500);
}
function closeupScene(t) {
  const u = t - 12.3, fr = Math.round(t * 60);
  ctx.save();
  // bulanık arka plan
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#6aa9e0'); g.addColorStop(0.45, '#7f8796'); g.addColorStop(0.55, '#5a6270'); g.addColorStop(1, '#44474d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 40; k++) {
    const y = hash(k) * H, h = 4 + hash(k + 1) * 30, x = W - mod(t * 9000 + hash(k + 2) * 5000, W + 1600);
    ctx.fillStyle = ['rgba(255,122,0,.35)', 'rgba(255,255,255,.3)', 'rgba(255,210,63,.35)', 'rgba(30,30,30,.3)'][k % 4];
    ctx.fillRect(x, y, 1400, h);
  }
  ctx.translate((hash(fr) - 0.5) * 12, (hash(fr + 1) - 0.5) * 12);
  const hiss = ss(0.15, 0.3, u);
  const zoom = 1 + u * 0.12;
  ctx.translate(W * 0.47, H * 0.56); ctx.scale(zoom, zoom);
  // atkı
  ctx.beginPath(); ctx.moveTo(-60, 300);
  for (let k = 1; k <= 12; k++) { const p = k / 12; ctx.lineTo(-60 - p * 900, 300 - p * 120 + Math.sin(t * 26 - k * 0.9) * 70 * p); }
  ctx.strokeStyle = '#e01b2f'; ctx.lineWidth = 90; ctx.lineCap = 'round'; ctx.stroke();
  E(0, 330, 260, 80, '#e01b2f');
  catHead(0, 0, 320, { t, squint: 0.85, hiss, pupil: 0.05, wind: 1, earBack: 0.95, lookX: -0.8 });
  ctx.restore();
  if (hiss > 0) {
    ctx.save(); ctx.translate(W * 0.78, H * 0.3); ctx.rotate(0.1); const s = 0.7 + 0.3 * hiss + Math.sin(t * 50) * 0.02; ctx.scale(s, s);
    P([-260, -110, 280, -140, 250, 120, 60, 110, 0, 210, -20, 110, -240, 100], '#fff', '#111', 10);
    txt('HSSSS!', 10, -10, 120, '#e01b2f', { stroke: '#111', lw: 6 });
    ctx.restore();
  }
}

// ================================================================ SAHNE: KUŞBAKIŞI FİRKETE
const TD = (() => {
  const pts = [];
  const add = (x, y) => { const l = pts[pts.length - 1]; if (!l || Math.hypot(l[0] - x, l[1] - y) > 0.5) pts.push([x, y]); };
  for (let y = 3200; y >= 0; y -= 25) add(0, y);
  for (let a = Math.PI; a >= -1e-6; a -= Math.PI / 140) add(300 + 300 * Math.cos(a), -300 * Math.sin(a));
  for (let y = 0; y <= 3400; y += 25) add(600, y);
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, L };
})();
function tdAt(s, offN = 0) {
  const { pts, L } = TD;
  let lo = 0, hi = L.length - 1;
  s = clamp(s, 0, L[hi]);
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < s) lo = m; else hi = m; }
  const k = (s - L[lo]) / ((L[hi] - L[lo]) || 1);
  const x = lerp(pts[lo][0], pts[hi][0], k), y = lerp(pts[lo][1], pts[hi][1], k);
  const dx = pts[hi][0] - pts[lo][0], dy = pts[hi][1] - pts[lo][1], d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  return { x: x + nx * offN, y: y + ny * offN, a: Math.atan2(dy, dx) };
}
const TDV = u => kf(u, [[0, 1750], [1.15, 1750], [1.65, 780], [2.75, 840], [3.6, 1700], [5.2, 1950]]);
const TS = (() => { const n = 5.5 / DT | 0, a = new Float64Array(n + 2); a[0] = 556; for (let i = 1; i <= n + 1; i++) a[i] = a[i - 1] + TDV(i * DT) * DT; return a; })();
const tdS = u => { const f = clamp(u / DT, 0, TS.length - 2), i = Math.floor(f); return lerp(TS[i], TS[i + 1], f - i); };
const TD_CARS = [
  { c: 6, gap: [[0, 230], [1.5, 130], [2.25, 0], [3.2, -160], [5, -280]], off: [[0, -20], [1.4, -55], [3, -70], [4, -10]] },
  { c: 0, gap: [[0, -230], [5, -420]], off: [[0, 30], [2, -30], [4, 20]] },
];
const CAT_OFF = [[0, 30], [0.9, -40], [1.6, 72], [2.9, 72], [3.7, 0]];

function topScene(t) {
  const u = t - 21, fr = Math.round(t * 60);
  const sC = tdS(u), cp = tdAt(sC, kf(u, CAT_OFF));
  const ahead = tdAt(sC + 160);
  const zoom = kf(u, [[0, 1.75], [1.2, 1.25], [5, 1.05]]);
  ctx.save();
  ctx.fillStyle = '#3f9b3a'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2 + (hash(fr) - 0.5) * 3, H / 2 + (hash(fr + 1) - 0.5) * 3);
  ctx.scale(zoom, zoom);
  ctx.translate(-lerp(cp.x, ahead.x, 0.35), -lerp(cp.y, ahead.y, 0.35));
  // çim şeritleri
  for (let y = -2000; y < 3600; y += 160) { ctx.fillStyle = Math.floor(y / 160) % 2 ? '#47a740' : '#3c9636'; ctx.fillRect(-2000, y, 4600, 160); }
  // çakıl havuzu, lastik bariyeri, tribün
  ctx.beginPath(); ctx.arc(300, 0, 640, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = '#d9c28e'; ctx.fill();
  for (let k = 0; k < 400; k++) { const a = Math.PI + hash(k) * Math.PI, r = 200 + hash(k + 1) * 430; E(300 + Math.cos(a) * r, Math.sin(a) * r, 3, 3, 'rgba(120,100,60,.35)'); }
  for (let a = Math.PI; a <= TAU + 0.001; a += Math.PI / 60) {
    const k = Math.round((a - Math.PI) / (Math.PI / 60));
    E(300 + Math.cos(a) * 690, Math.sin(a) * 690, 17, 17, k % 2 ? '#e8e8e8' : '#d81e2c');
    E(300 + Math.cos(a) * 690, Math.sin(a) * 690, 7, 7, '#222');
  }
  ctx.drawImage(crowdTex, -560, -1150, 1720, 300);
  ctx.fillStyle = '#e8e8ea'; ctx.fillRect(-580, -1190, 1760, 50);
  ctx.fillStyle = '#ff7a00'; ctx.fillRect(-580, -850, 1760, 24);
  // bariyerler
  ctx.strokeStyle = '#b8bec6'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-250, 3400); ctx.lineTo(-250, 60); ctx.moveTo(850, 60); ctx.lineTo(850, 3400); ctx.moveTo(240, 3400); ctx.lineTo(240, 200); ctx.lineTo(360, 200); ctx.lineTo(360, 3400); ctx.stroke();
  for (let y = 400; y < 3400; y += 500) for (const bx of [-270, 870]) { RR(bx - 14, y, 28, 300, 6, ['#ff7a00', '#111', '#1e41ff'][(y / 500 | 0) % 3]); }
  // pist
  const path = () => { ctx.beginPath(); TD.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
  ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = '#7d8087'; ctx.lineWidth = 330; ctx.stroke();
  path(); ctx.strokeStyle = '#55585e'; ctx.lineWidth = 260; ctx.stroke();
  // kerbler
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let s = 2900; s <= 4500; s += 10) { const p = tdAt(s, side * 136); s === 2900 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
    ctx.lineWidth = 16; ctx.strokeStyle = '#f4f4f4'; ctx.setLineDash([]); ctx.stroke();
    ctx.strokeStyle = '#e10600'; ctx.setLineDash([28, 28]); ctx.stroke(); ctx.setLineDash([]);
  }
  // fren izleri
  ctx.strokeStyle = 'rgba(20,20,20,.25)'; ctx.lineWidth = 7;
  for (const o of [-60, -40, 50, 70]) { ctx.beginPath(); for (let s = 2700; s <= 3700; s += 20) { const p = tdAt(s, o); s === 2700 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); } ctx.stroke(); }
  // arabalar ve duman
  const cars = [{ s: sC, off: kf(u, CAT_OFF), col: CATCAR, cat: true }];
  for (const c of TD_CARS) cars.push({ s: sC + kf(u, c.gap), off: kf(u, c.off), col: RIV[c.c], gapK: c.gap, offK: c.off });
  for (let k = 0; k < 40; k++) {
    const ue = 1.05 + k * 0.016, age = u - ue;
    if (age < 0 || age > 1.3) continue;
    for (const c of cars) {
      const se = tdS(ue) + (c.gapK ? kf(ue, c.gapK) : 0), oe = c.offK ? kf(ue, c.offK) : kf(ue, CAT_OFF);
      const p = tdAt(se - 50, oe + (hash(k) - 0.5) * 40);
      E(p.x, p.y, 12 + age * 70, 12 + age * 70, `rgba(230,230,235,${0.38 * (1 - age / 1.3)})`);
    }
  }
  for (const c of cars) {
    const p = tdAt(c.s, c.off), v = TDV(u);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    const tr = ctx.createLinearGradient(-60, 0, -60 - v * 0.12, 0);
    tr.addColorStop(0, 'rgba(255,255,255,.25)'); tr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = tr; ctx.fillRect(-60 - v * 0.12, -22, v * 0.12, 44);
    ctx.restore();
    carTop(p.x, p.y, p.a, 120, c.col, { cat: c.cat, t });
  }
  // kedinin üstünde ok işareti
  const ar = 1 - ss(1.6, 2.0, u);
  if (ar > 0) { ctx.globalAlpha = ar; P([cp.x - 26, cp.y - 120, cp.x + 26, cp.y - 120, cp.x, cp.y - 84], '#ffd23f', '#111', 4); ctx.globalAlpha = 1; }
  ctx.restore();
  if (u > 2.25 && u < 3.6) {
    const k = ss(2.25, 2.4, u);
    ctx.save(); ctx.translate(W / 2, 220); ctx.scale(0.5 + 0.5 * k, 0.5 + 0.5 * k); ctx.rotate(-0.04);
    txt('LİDER KEDİ!', 0, 0, 120, '#ffd23f', { stroke: '#120800', lw: 14 });
    ctx.restore();
  }
  hud(t);
}

// ================================================================ SAHNE: FİNAL
function finaleScene(t) {
  const u = t - 27.6;
  ctx.save();
  const push = 1 + u * 0.04;
  ctx.translate(W / 2, H * 0.6); ctx.scale(push, push); ctx.translate(-W / 2, -H * 0.6);
  standsBand(240, 600, t * 30);
  ctx.fillStyle = '#55585e'; ctx.fillRect(-200, 600, W + 400, H);
  ctx.fillStyle = '#e10600'; ctx.fillRect(-200, 600, W + 400, 14);
  // havai fişekler
  for (let b = 0; b < 5; b++) {
    const tb = 0.15 + b * 0.42, age = u - tb;
    if (age < 0 || age > 1.3) continue;
    const bx = 260 + hash(b) * 1400, by = 120 + hash(b + 4) * 160;
    const col = ['#ffd23f', '#ff7a00', '#4fc3ff', '#ff4fa3', '#7dff6a'][b];
    for (let k = 0; k < 28; k++) {
      const a = k / 28 * TAU, r = easeOut(clamp(age / 0.9)) * 190;
      ctx.globalAlpha = 1 - age / 1.3;
      E(bx + Math.cos(a) * r, by + Math.sin(a) * r + age * age * 60, 6, 6, col);
    }
    ctx.globalAlpha = 1;
  }
  const paws = ss(0.15, 0.5, u);
  const face = { t, happy: u > 0.2 ? 1 : 0, open: ss(0.35, 0.5, u) * (1 - ss(1.3, 1.5, u)), wind: 0.2 };
  carFront(W / 2, 1040, 1000, CATCAR, { cat: true, t, face, paws, rise: paws * 4 });
  // konfeti
  for (let k = 0; k < 160; k++) {
    const t0 = hash(k) * 0.6, age = u - t0;
    if (age < 0) continue;
    const x = hash(k + 1) * W + Math.sin(age * 3 + k) * 40, y = -40 + age * (260 + hash(k + 2) * 200);
    ctx.save(); ctx.translate(x, y); ctx.rotate(age * 6 + k);
    ctx.fillStyle = ['#ff7a00', '#ffd23f', '#ffffff', '#e10600', '#4fc3ff'][k % 5];
    ctx.fillRect(-8, -4, 16 * Math.cos(age * 8 + k), 8);
    ctx.restore();
  }
  ctx.restore();
  // dalgalanan damalı bayrak
  ctx.save(); ctx.translate(90, 90);
  ctx.fillStyle = '#333'; ctx.fillRect(-8, -40, 12, 520);
  const cols = 10, rows = 7, cw = 34, chh = 34;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wv = (x) => Math.sin(t * 7 - x * 0.35) * 16 * (x / cols);
    const x0 = i * cw, y0 = j * chh + wv(i), y1 = j * chh + wv(i + 1);
    P([x0, y0, x0 + cw, y1, x0 + cw, y1 + chh, x0, y0 + chh], (i + j) % 2 ? '#fff' : '#111');
  }
  ctx.restore();
  // yazılar
  const k1 = ss(0.25, 0.45, u), k2 = ss(0.65, 0.85, u);
  if (k1 > 0) {
    ctx.save(); ctx.translate(W - 330, 300); const s = k1 * (1 + 0.08 * Math.sin(u * 8)); ctx.scale(s, s); ctx.rotate(-0.06);
    txt('P1', 0, 0, 260, '#ffd23f', { stroke: '#120800', lw: 20 });
    ctx.restore();
  }
  if (k2 > 0) {
    ctx.save(); ctx.globalAlpha = k2; ctx.translate(W / 2, 140 + (1 - k2) * 40);
    txt('KAZANAN: KEDİ!', 0, 0, 104, '#ffffff', { stroke: '#120800', lw: 14 });
    ctx.restore();
  }
}

// ================================================================ ANA
const WHIPS = [4.0, 11.0, 15.0, 21.0, 26.0];
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t < 4) startScene(t);
  else if (t < 11) chaseScene(t);
  else if (t < 12.3) sideScene(t);
  else if (t < 13.1) closeupScene(t);
  else if (t < 15) sideScene(t);
  else if (t < 21) chaseScene(t);
  else if (t < 26) topScene(t);
  else if (t < 27.6) chaseScene(t);
  else finaleScene(t);
  post(t);
}
function post(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // yatay "whip" geçişleri
  for (const c of WHIPS) {
    const d = Math.abs(t - c);
    if (d > 0.14) continue;
    const k = 1 - d / 0.14;
    octx.drawImage(cv, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const n = 9;
    for (let i = 0; i < n; i++) { ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(off, (i / (n - 1) - 0.5) * 420 * k * Math.sign(t - c || 1), 0); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(255,255,255,${0.35 * k})`; ctx.fillRect(0, 0, W, H);
  }
  // finiş flaşı
  const fl = Math.max(0, 1 - Math.abs(t - 27.6) / 0.12);
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl * 0.9})`; ctx.fillRect(0, 0, W, H); }
  // vinyet
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // açılış ve kapanış
  const fade = Math.max(1 - ss(0, 0.25, t), ss(29.6, 30, t));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.DURATION = DURATION;
