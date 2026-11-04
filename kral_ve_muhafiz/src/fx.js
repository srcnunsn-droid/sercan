// EFEKTLER — hepsi t zamanının saf fonksiyonu (deterministik).
'use strict';
const FX = (() => {
  const W = 1080, H = 1920;

  // Kar: ekran uzayında, derinlik katmanlı, kamera hareketine paralaks ile bağlı.
  // cam: {cx, cy, zoom}; o: {density, wind, t, near (yakın büyük taneler), tint}
  function snow(ctx, cam, o) {
    const t = o.t, wind = o.wind == null ? 1 : o.wind;
    const N = Math.floor((o.density == null ? 1 : o.density) * 420);
    const tint = o.tint || [235, 240, 250];
    for (let i = 0; i < N; i++) {
      const d = 0.25 + Math.pow(U.hash(i * 1.37), 1.6) * 2.4;     // derinlik (küçük = yakın)
      if (o.layer === 'near' && d > 0.6) continue;
      if (o.layer === 'far' && d <= 0.6) continue;
      const size = (3.2 / d) * (o.sizeK || 1);
      const fall = (55 + 70 * U.hash(i * 2.11)) / d;            // px/s
      const drift = (90 + 120 * U.hash(i * 3.7)) * wind / d;
      const par = 1 / d;
      let x = U.hash(i * 7.77) * (W + 300) + drift * t + Math.sin(t * (0.6 + U.hash(i) * 1.2) + i) * 18 / d - cam.cx * cam.zoom * par * 0.35;
      let y = U.hash(i * 5.31) * (H + 300) + fall * t + cam.cy * cam.zoom * par * 0.35;
      x = ((x % (W + 300)) + (W + 300)) % (W + 300) - 150;
      y = ((y % (H + 300)) + (H + 300)) % (H + 300) - 150;
      const a = U.clamp(0.25 + 0.6 * (1 - d / 2.8)) * (o.alpha == null ? 1 : o.alpha);
      if (size > 7) { // yakın, odak dışı taneler
        const g = ctx.createRadialGradient(x, y, 0, x, y, size);
        g.addColorStop(0, U.rgba(tint, a * 0.55)); g.addColorStop(1, U.rgba(tint, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, size, 0, U.TAU); ctx.fill();
      } else {
        ctx.fillStyle = U.rgba(tint, a);
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, size * 0.55), 0, U.TAU); ctx.fill();
      }
    }
  }

  // Nefes buharı (dünya koordinatı). mouth: {x,y}; dir: bakış yönü; period; strength
  function breath(ctx, o) {
    const { t, period, phase = 0, mouth, dir } = o;
    const k = o.strength == null ? 1 : o.strength;
    if (k <= 0) return;
    const cyc = (t + phase) / period;
    const n0 = Math.floor(cyc);
    for (let c = n0 - 2; c <= n0; c++) {
      const tStart = c * period - phase + period * 0.55; // nefes verme anı
      const age = t - tStart;
      if (age < 0 || age > 2.6) continue;
      for (let p = 0; p < 7; p++) {
        const sd = U.hash(c * 31 + p * 7);
        const a2 = age - p * 0.05; if (a2 < 0) continue;
        const v = 0.28 + sd * 0.12;
        const x = mouth.x + dir * (v * (1 - Math.exp(-a2 * 2.2)) / 2.2 * 2.6) + (o.wind || 0.25) * a2 * 0.22 + (sd - 0.5) * 0.04;
        const y = mouth.y - 0.02 + a2 * 0.05 + (U.hash(p + c) - 0.5) * 0.03 * a2;
        const r = 0.03 + a2 * 0.09 + sd * 0.02;
        const al = 0.22 * k * Math.exp(-a2 * 1.4) * (1 - Math.exp(-a2 * 12));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, U.rgba(o.col || [215, 225, 240], al)); g.addColorStop(1, U.rgba(o.col || [215, 225, 240], 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, U.TAU); ctx.fill();
      }
    }
  }

  // Alev (dünya koordinatı)
  function flame(ctx, x, y, s, t, k = 1, seed = 0) {
    if (k <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.globalCompositeOperation = 'lighter';
    const layers = [[0.2, [255, 120, 30], 0.55], [0.15, [255, 170, 60], 0.75], [0.09, [255, 230, 160], 0.9]];
    for (let li = 0; li < layers.length; li++) {
      const [w, col, a] = layers[li];
      const hgt = (0.42 + 0.12 * U.fbm1(t * 6 + li * 3 + seed)) * (0.5 + 0.5 * k) * (1 - li * 0.2);
      const sway = 0.06 * U.fbm1(t * 3.3 + seed + li) + 0.04 * k;
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.bezierCurveTo(-w * 1.1, hgt * 0.35, -w * 0.3 + sway * 0.5, hgt * 0.7, sway, hgt);
      ctx.bezierCurveTo(w * 0.3 + sway * 0.5, hgt * 0.7, w * 1.1, hgt * 0.35, w, 0);
      ctx.quadraticCurveTo(0, -w * 0.5, -w, 0);
      const g = ctx.createLinearGradient(0, 0, 0, hgt);
      g.addColorStop(0, U.rgba(col, a * k)); g.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = g; ctx.fill();
    }
    // kıvılcımlar
    for (let i = 0; i < 5; i++) {
      const life = ((t * 0.9 + U.hash(i + seed) * 3) % 1.4);
      const px = (U.hash(i * 3 + seed) - 0.5) * 0.15 + life * 0.08, py = 0.15 + life * 0.6;
      ctx.fillStyle = `rgba(255,190,90,${(1 - life / 1.4) * 0.8 * k})`;
      ctx.beginPath(); ctx.arc(px, py, 0.012, 0, U.TAU); ctx.fill();
    }
    ctx.restore();
  }
  // Duman (sönmüş meşale)
  function smoke(ctx, x, y, t, k) {
    for (let i = 0; i < 9; i++) {
      const life = ((t * 0.35 + i / 9) % 1);
      const px = x + Math.sin(life * 5 + i) * 0.05 + life * 0.25, py = y + life * 1.1;
      const r = 0.04 + life * 0.18;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(120,125,135,${0.18 * (1 - life) * k})`); g.addColorStop(1, 'rgba(120,125,135,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, U.TAU); ctx.fill();
    }
  }
  // Aydınlatma halesi (dünya koordinatı, 'lighter' / 'screen')
  function glow(ctx, x, y, r, col, a, mode = 'lighter') {
    ctx.save(); ctx.globalCompositeOperation = mode;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgba(col, a)); g.addColorStop(0.35, U.rgba(col, a * 0.45)); g.addColorStop(1, U.rgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, U.TAU); ctx.fill();
    ctx.restore();
  }

  // Kapı açıkken karın üstüne düşen sıcak ışık şeridi
  function doorSpill(ctx, open, k) {
    if (open <= 0.01 || k <= 0) return;
    const D = SETS.GEO.door;
    const w = Math.sin(open * 1.25);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    // zemin trapezi (kameraya doğru açılır)
    ctx.filter = 'blur(18px)';
    const g = ctx.createLinearGradient(0, 0, 0, -2.4);
    g.addColorStop(0, `rgba(255,170,90,${0.42 * k * w})`); g.addColorStop(0.6, `rgba(255,170,90,${0.12 * k * w})`); g.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-D.hw * w * 0.95, -0.02); ctx.lineTo(D.hw * w * 0.95, -0.02); ctx.lineTo(D.hw * w * 1.6 + 0.2, -2.6); ctx.lineTo(-D.hw * w * 1.8 - 0.35, -2.6); ctx.closePath(); ctx.fill();
    ctx.filter = 'none';
    // kapı boşluğundaki hava (pus)
    const hz = ctx.createRadialGradient(0, 1.0, 0, 0, 1.0, 2.6);
    hz.addColorStop(0, `rgba(255,170,90,${0.22 * k * w})`); hz.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = hz; ctx.fillRect(-3, -1, 6, 4.5);
    ctx.restore();
  }

  // Kapı boşluğundan görünen iç (sıcak)
  function doorInterior(ctx, open, t, k = 1) {
    if (open <= 0.005) return;
    const D = SETS.GEO.door;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-D.hw, -0.05); ctx.lineTo(-D.hw, D.spring); ctx.arc(0, D.spring, D.r, Math.PI, 0, true); ctx.lineTo(D.hw, -0.05); ctx.closePath(); ctx.clip();
    const fl = 0.9 + 0.1 * U.fbm1(t * 5);
    const g = ctx.createRadialGradient(0.2, 1.2, 0.1, 0.2, 1.2, 2.6);
    g.addColorStop(0, U.rgba([255, 196, 120].map((v) => v * fl))); g.addColorStop(0.5, U.rgba([190, 110, 55].map((v) => v * fl))); g.addColorStop(1, '#3a1d0c');
    ctx.fillStyle = g; ctx.fillRect(-1.2, -0.1, 2.4, 3.3);
    // koridor: uzak duvar ve zemin
    ctx.fillStyle = 'rgba(120,70,35,0.55)'; ctx.fillRect(-0.55, 0.15, 1.1, 2.2);
    ctx.fillStyle = 'rgba(80,40,20,0.6)'; ctx.beginPath(); ctx.moveTo(-1, -0.05); ctx.lineTo(-0.55, 0.15); ctx.lineTo(0.55, 0.15); ctx.lineTo(1, -0.05); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(110,30,25,0.7)'; ctx.beginPath(); ctx.moveTo(-0.45, -0.05); ctx.lineTo(-0.25, 0.15); ctx.lineTo(0.25, 0.15); ctx.lineTo(0.45, -0.05); ctx.closePath(); ctx.fill();
    // uzakta duvar halısı ve mum
    ctx.fillStyle = 'rgba(100,25,20,0.8)'; ctx.fillRect(-0.48, 0.9, 0.3, 0.8);
    ctx.fillStyle = 'rgba(255,220,150,0.9)'; ctx.beginPath(); ctx.arc(0.35, 1.45, 0.025, 0, U.TAU); ctx.fill();
    glow(ctx, 0.35, 1.45, 0.3, [255, 190, 110], 0.4);
    ctx.restore();
  }

  // Son işlem: vinyet + film greni + hafif renk tonu (ekran uzayı)
  let GRAIN = null;
  function post(ctx, t, o = {}) {
    if (!GRAIN) {
      GRAIN = [];
      for (let k = 0; k < 4; k++) {
        const c = U.makeCanvas(256, 256), x = c.getContext('2d'); const id = x.createImageData(256, 256);
        const r = U.rng(100 + k);
        for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
        x.putImageData(id, 0, 0); GRAIN.push(c);
      }
    }
    // vinyet
    const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,8,${o.vignette == null ? 0.55 : o.vignette})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // gren
    const g = GRAIN[Math.floor(t * 24) % 4];
    const pat = ctx.createPattern(g, 'repeat');
    const off = U.hash(Math.floor(t * 24)) * 256;
    pat.setTransform(new DOMMatrix().translateSelf(off, off * 0.7).scaleSelf(1.6, 1.6));
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain == null ? 0.09 : o.grain;
    ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (o.fade) { ctx.fillStyle = `rgba(0,0,0,${o.fade})`; ctx.fillRect(0, 0, W, H); }
  }

  return { snow, breath, flame, smoke, glow, doorSpill, doorInterior, post };
})();
if (typeof module !== 'undefined') module.exports = FX;
