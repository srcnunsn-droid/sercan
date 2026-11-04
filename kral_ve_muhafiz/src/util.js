// Ortak yardımcılar: rastgelelik, gürültü, easing, renk, anahtar kare izleri.
'use strict';
const U = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const inv = (a, b, v) => clamp((v - a) / (b - a));
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeIn = (t) => Math.pow(clamp(t), 3);
  const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const EASE = { lin: (t) => clamp(t), smooth, smoother, out: easeOut, in: easeIn, io: easeInOut,
    outBack: (t) => { t = clamp(t); const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };

  // Deterministik hash tabanlı rastgele
  function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return n - Math.floor(n); }
  function hash2(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123; return n - Math.floor(n); }
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }

  // 1B ve 2B değer gürültüsü
  function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
  function fbm1(x, oct = 3) { let a = 0, amp = 0.5, fr = 1; for (let i = 0; i < oct; i++) { a += noise1(x * fr + i * 17.3) * amp; fr *= 2; amp *= 0.5; } return a; }
  function noise2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
  }
  function fbm2(x, y, oct = 4) { let a = 0, amp = 0.5, fr = 1; for (let i = 0; i < oct; i++) { a += noise2(x * fr + i * 5.1, y * fr - i * 3.7) * amp; fr *= 2.03; amp *= 0.5; } return a; }

  // Renkler: [r,g,b] 0..255
  const hex = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const mul = (a, b) => [a[0] * b[0] / 255, a[1] * b[1] / 255, a[2] * b[2] / 255];
  const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const rgba = (c, a = 1) => `rgba(${clamp(c[0], 0, 255) | 0},${clamp(c[1], 0, 255) | 0},${clamp(c[2], 0, 255) | 0},${a})`;

  // Anahtar kare izi: keys = [[t, value, ease?], ...]  value sayı ya da {..} nesnesi
  function track(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
      if (t <= t1) {
        const k = (EASE[e || 'io'])((t - t0) / (t1 - t0));
        return blend(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  }
  function blend(a, b, k) {
    if (typeof a === 'number') return lerp(a, b, k);
    const o = {};
    for (const key in a) o[key] = key in b ? blend(a[key], b[key], k) : a[key];
    for (const key in b) if (!(key in o)) o[key] = b[key];
    return o;
  }

  // Basit 2B vektör
  const V = {
    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    mul: (a, k) => ({ x: a.x * k, y: a.y * k }),
    len: (a) => Math.hypot(a.x, a.y),
    lerp: (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }),
    dir: (ang, l) => ({ x: Math.sin(ang) * l, y: -Math.cos(ang) * l }), // açı 0 = aşağı, + = ileri
  };

  // İki kemikli IK: kök A, hedef T, uzunluklar; bend: +1/-1 dirseğin hangi tarafa kırılacağı
  function ik2(A, T, l1, l2, bend) {
    let dx = T.x - A.x, dy = T.y - A.y; let d = Math.hypot(dx, dy);
    const maxD = (l1 + l2) * 0.999; if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
    const minD = Math.abs(l1 - l2) + 1e-4; if (d < minD) d = minD;
    const a = Math.atan2(dy, dx);
    const cosB = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const b = Math.acos(cosB) * bend;
    const J = { x: A.x + Math.cos(a + b) * l1, y: A.y + Math.sin(a + b) * l1 };
    const E = { x: A.x + dx, y: A.y + dy };
    return { J, E };
  }

  // Canvas yardımcıları
  function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
    const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c;
  }
  // Noktalardan yumuşak kapalı/açık eğri (Catmull-Rom → Bezier)
  function smoothPath(ctx, pts, closed = true, tension = 0.5, move = true) {
    const n = pts.length; if (n < 2) return;
    const P = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    if (move) ctx.moveTo(pts[0].x, pts[0].y); else ctx.lineTo(pts[0].x, pts[0].y);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const t = tension / 3;
      ctx.bezierCurveTo(p1.x + (p2.x - p0.x) * t, p1.y + (p2.y - p0.y) * t, p2.x - (p3.x - p1.x) * t, p2.y - (p3.y - p1.y) * t, p2.x, p2.y);
    }
    if (closed) ctx.closePath();
  }

  return { TAU, clamp, lerp, inv, smooth, smoother, EASE, hash, hash2, rng, noise1, fbm1, noise2, fbm2,
    hex, mix, mul, scale, add, rgba, track, blend, V, ik2, makeCanvas, smoothPath };
})();
if (typeof module !== 'undefined') module.exports = U;
