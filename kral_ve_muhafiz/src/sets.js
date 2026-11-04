// MEKÂNLAR — prosedürel taş, ahşap, kar. Geometri dünya koordinatında sabittir (metre, kapı ekseni x=0, zemin y=0).
'use strict';
const SETS = (() => {
  const GEO = {
    door: { hw: 1.0, spring: 2.1, r: 1.0, quoin: 1.32, archOuter: 1.4 },
    niche: { x0: -3.12, x1: -2.12, top: 2.25, depth: 0.35 },
    torch: { x: -1.7, y: 2.05 },
    text: { x0: -2.06, x1: -1.42, y0: 0.32, y1: 1.08 },
    guardPost: -2.6,
  };

  // ---------- doku üretimi ----------
  let NOISE = null, NOISE_FINE = null;
  function noiseCanvas(size, scale, oct, seed) {
    const c = U.makeCanvas(size, size), x = c.getContext('2d');
    const id = x.createImageData(size, size), d = id.data;
    for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
      // döşenebilir (tileable) gürültü: 4 köşe karışımı
      const u = i / size, v = j / size;
      const f = (a, b) => U.fbm2(a * scale + seed, b * scale - seed, oct);
      const n = f(u, v) * (1 - u) * (1 - v) + f(u - 1, v) * u * (1 - v) + f(u, v - 1) * (1 - u) * v + f(u - 1, v - 1) * u * v;
      const val = U.clamp(128 + n * 190, 0, 255);
      const k = (j * size + i) * 4; d[k] = d[k + 1] = d[k + 2] = val; d[k + 3] = 255;
    }
    x.putImageData(id, 0, 0); return c;
  }
  function ensureNoise() {
    if (!NOISE) { NOISE = noiseCanvas(256, 6, 5, 3.1); NOISE_FINE = noiseCanvas(256, 24, 3, 9.7); }
  }
  // gürültüyü dünya ölçeğinde bir bölgeye bindir (overlay benzeri)
  function grain(ctx, ppm, worldScale, alpha, mode, which) {
    ensureNoise();
    const pat = ctx.createPattern(which === 'fine' ? NOISE_FINE : NOISE, 'repeat');
    const m = new DOMMatrix(); m.scaleSelf(worldScale / 256, worldScale / 256);
    pat.setTransform(m);
    ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = mode; ctx.fillStyle = pat;
    return pat;
  }

  // ---------- taş örgüsü ----------
  const COURSES = (() => { const a = []; let y = -0.05, i = 0; while (y < 9) { const h = 0.29 + 0.13 * U.hash(i * 7.13 + 1); a.push([y, y + h, i]); y += h; i++; } return a; })();
  function stoneShape(ctx, x0, y0, x1, y1, seed, inset) {
    const r = U.rng(seed);
    const j = () => (r() - 0.5) * 0.025;
    const ins = inset;
    const pts = [
      { x: x0 + ins + j(), y: y0 + ins + 0.02 + j() }, { x: (x0 + x1) / 2 + j() * 2, y: y0 + ins + j() * 0.6 }, { x: x1 - ins + j(), y: y0 + ins + 0.02 + j() },
      { x: x1 - ins + j() * 0.6, y: (y0 + y1) / 2 + j() }, { x: x1 - ins - 0.02 + j(), y: y1 - ins + j() }, { x: (x0 + x1) / 2 + j() * 2, y: y1 - ins + j() * 0.6 },
      { x: x0 + ins + 0.02 + j(), y: y1 - ins + j() }, { x: x0 + ins + j() * 0.6, y: (y0 + y1) / 2 + j() },
    ];
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.55);
  }
  function stoneColor(seed, warm) {
    const a = U.hash(seed * 1.31), b = U.hash(seed * 2.77);
    const base = warm ? [176, 158, 132] : [150, 152, 156];
    return U.mix(U.scale(base, 0.78 + a * 0.32), warm ? [190, 150, 110] : [150, 140, 125], b * 0.25);
  }
  function drawStone(ctx, x0, y0, x1, y1, seed, opt) {
    stoneShape(ctx, x0, y0, x1, y1, seed, 0.012);
    const c = stoneColor(seed, opt.warm);
    const g = ctx.createLinearGradient(0, y1, 0, y0);
    g.addColorStop(0, U.rgba(U.scale(c, 1.12))); g.addColorStop(0.55, U.rgba(c)); g.addColorStop(1, U.rgba(U.scale(c, 0.72)));
    ctx.fillStyle = g; ctx.fill();
    // yüzey dokusu
    ctx.save(); ctx.clip();
    const pat = grain(ctx, opt.ppm, 1.6, 0.35, 'overlay'); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
    grain(ctx, opt.ppm, 0.35, 0.22, 'overlay', 'fine'); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
    // kenar: üst-sol aydınlık, alt koyu (çıkıntı hissi)
    ctx.lineWidth = 0.012; ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.moveTo(x0 + 0.02, y0 + 0.018); ctx.lineTo(x1 - 0.02, y0 + 0.016); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 0.008;
    ctx.beginPath(); ctx.moveTo(x0 + 0.03, y1 - 0.02); ctx.lineTo(x1 - 0.03, y1 - 0.022); ctx.stroke();
    // çatlak / yonga
    const r = U.rng(seed * 5 + 1);
    if (r() < 0.35) {
      ctx.strokeStyle = 'rgba(30,30,35,0.35)'; ctx.lineWidth = 0.005;
      let px = U.lerp(x0, x1, r()), py = y1 - 0.02; ctx.beginPath(); ctx.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 0.06; py -= 0.03 + r() * 0.04; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    // likenler / lekeler
    if (!opt.warm && r() < 0.5) {
      ctx.fillStyle = `rgba(60,70,60,${0.12 + r() * 0.1})`;
      ctx.beginPath(); ctx.ellipse(U.lerp(x0, x1, r()), U.lerp(y0, y1, r()), 0.03 + r() * 0.05, 0.02 + r() * 0.03, r() * 3, 0, U.TAU); ctx.fill();
    }
    ctx.restore();
    // üst kenarda kar (rüzgârın taşa yapıştırdığı)
    if (opt.snow && U.hash(seed * 9.1) < opt.snow) {
      const sx0 = U.lerp(x0, x1, U.hash(seed * 3.3) * 0.4), sx1 = U.lerp(x0, x1, 0.6 + U.hash(seed * 4.4) * 0.4);
      ctx.fillStyle = 'rgba(238,242,250,0.9)';
      ctx.beginPath(); ctx.moveTo(sx0, y1 - 0.01);
      ctx.quadraticCurveTo((sx0 + sx1) / 2, y1 + 0.012 + U.hash(seed) * 0.01, sx1, y1 - 0.01);
      ctx.quadraticCurveTo((sx0 + sx1) / 2, y1 - 0.025, sx0, y1 - 0.01); ctx.fill();
    }
  }
  // world rect içinde normal duvar taşları
  function wallStones(ctx, rect, opt, skip) {
    for (const [cy0, cy1, ci] of COURSES) {
      if (cy1 < rect.y0 || cy0 > rect.y1) continue;
      let x = -7 - U.hash(ci * 3.3) * 0.7, j = 0;
      while (x < rect.x1) {
        const w = 0.4 + 0.52 * U.hash(ci * 13.1 + j * 1.7);
        if (x + w > rect.x0 && !(skip && skip(x, cy0, x + w, cy1))) drawStone(ctx, x, cy0, x + w, cy1, ci * 100 + j + 1, opt);
        x += w; j++;
      }
    }
  }

  // ---------- DIŞ CEPHE (albedo, ışıksız) ----------
  const EXT = { rect: { x0: -5.2, x1: 3.2, y0: -3.2, y1: 7.0 }, ppm: 340 };
  const PATCH = { rect: { x0: -2.5, x1: -1.18, y0: 0.0, y1: 1.5 }, ppm: 1500 };

  function worldCanvas(rect, ppm) {
    const c = U.makeCanvas((rect.x1 - rect.x0) * ppm, (rect.y1 - rect.y0) * ppm);
    const x = c.getContext('2d');
    x.setTransform(ppm, 0, 0, -ppm, -rect.x0 * ppm, rect.y1 * ppm);
    return { c, x };
  }

  function buildExterior(rect, ppm, morning) {
    const { c, x } = worldCanvas(rect, ppm);
    const opt = { ppm, warm: false, snow: morning ? 0.55 : 0.4 };
    // harç
    x.fillStyle = '#5d5d60'; x.fillRect(rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0);
    const D = GEO.door, N = GEO.niche;
    const inDoor = (a, y0, b, y1) => (b > -D.quoin && a < D.quoin && y0 < D.spring + D.archOuter);
    const inNiche = (a, y0, b, y1) => (b > N.x0 - 0.18 && a < N.x1 + 0.18 && y0 < N.top + 0.3);
    wallStones(x, rect, opt, (a, y0, b, y1) => inDoor(a, y0, b, y1) || inNiche(a, y0, b, y1));
    // kapı köşe taşları (pervaz) ve kemer taşları
    let ci = 0;
    for (const side of [-1, 1]) {
      let y = -0.05, k = 0;
      while (y < D.spring) {
        const h = 0.36 + 0.06 * U.hash(k * 3 + side);
        const long = k % 2 === 0;
        const xa = side < 0 ? -D.quoin - (long ? 0.24 : 0.06) : D.hw;
        const xb = side < 0 ? -D.hw : D.quoin + (long ? 0.24 : 0.06);
        drawStone(x, xa, y, xb, Math.min(y + h, D.spring), 5000 + k * 7 + side * 3, opt);
        y += h; k++;
      }
      // pervaz ile normal duvar arasındaki dolgu
      const fx0 = side < 0 ? -D.quoin - 0.28 : D.quoin, fx1 = side < 0 ? -D.quoin : D.quoin + 0.28;
      for (const [cy0, cy1, cj] of COURSES) { if (cy0 > D.spring + 0.2) break; drawStone(x, fx0 - 0.1 * (side < 0 ? 1 : 0), cy0, fx1 + 0.1 * (side > 0 ? 1 : 0), cy1, 7000 + cj * 3 + side, { ...opt, snow: 0 }); }
    }
    // kemerin üstündeki dolgu taşları
    for (const [cy0, cy1, cj] of COURSES) {
      if (cy1 < D.spring || cy0 > D.spring + D.archOuter + 0.4) continue;
      let xx = -D.quoin - 0.3, j = 0;
      while (xx < D.quoin + 0.3) { const w = 0.35 + 0.3 * U.hash(cj * 5 + j); drawStone(x, xx, cy0, xx + w, cy1, 8000 + cj * 20 + j, opt); xx += w; j++; }
    }
    // kemer (voussoir) taşları
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI;
      const r0 = D.r, r1 = D.archOuter + (i % 2 ? 0.0 : 0.06);
      x.beginPath();
      x.moveTo(Math.cos(a0) * r0, D.spring + Math.sin(a0) * r0);
      x.arc(0, D.spring, r0, a0, a1, true);
      x.lineTo(Math.cos(a1) * r1, D.spring + Math.sin(a1) * r1);
      x.arc(0, D.spring, r1, a1, a0, false);
      x.closePath();
      const cc = stoneColor(9000 + i, false);
      x.fillStyle = U.rgba(U.scale(cc, 1.05)); x.fill();
      x.save(); x.clip(); grain(x, ppm, 1.6, 0.35, 'overlay'); x.fillRect(-2, 2, 4, 2); x.restore(); x.restore();
      x.strokeStyle = '#4a4a4e'; x.lineWidth = 0.022; x.stroke();
      // kemer üstünde kar
      const am = (a0 + a1) / 2;
      if (Math.sin(am) > 0.7) {
        x.fillStyle = 'rgba(236,240,248,0.92)';
        const px = Math.cos(am) * (r1 + 0.005), py = D.spring + Math.sin(am) * (r1 + 0.005);
        x.beginPath(); x.ellipse(px, py, 0.08, 0.018, -Math.cos(am) * 0.9, 0, U.TAU); x.fill();
      }
    }
    // kapı boşluğu (karanlık iç) — dinamik kanatlar üstüne çizilir
    x.beginPath(); x.moveTo(-D.hw, -0.2); x.lineTo(-D.hw, D.spring); x.arc(0, D.spring, D.r, Math.PI, 0, true); x.lineTo(D.hw, -0.2); x.closePath();
    x.fillStyle = '#0d0b0a'; x.fill();
    // eşik taşı
    x.fillStyle = '#6b6a6a'; x.fillRect(-D.quoin, -0.12, D.quoin * 2, 0.14);

    // ---- girinti (niş) ----
    buildNiche(x, ppm, opt, morning);
    // ---- meşale bileziği ve is lekesi ----
    const T = GEO.torch;
    const sg = x.createRadialGradient(T.x, T.y + 0.7, 0, T.x, T.y + 0.7, 0.7);
    sg.addColorStop(0, `rgba(10,8,8,${morning ? 0.6 : 0.45})`); sg.addColorStop(1, 'rgba(10,8,8,0)');
    x.fillStyle = sg; x.save(); x.scale(1, 1); x.fillRect(T.x - 0.8, T.y, 1.6, 1.6); x.restore();
    // duvar plakası
    x.fillStyle = '#2a2a2e'; x.fillRect(T.x - 0.05, T.y - 0.17, 0.1, 0.22);
    for (const yy of [T.y - 0.13, T.y + 0.01]) { x.fillStyle = '#5a5a60'; x.beginPath(); x.arc(T.x, yy, 0.012, 0, U.TAU); x.fill(); }
    // kol
    x.strokeStyle = '#26262a'; x.lineWidth = 0.028; x.lineCap = 'round';
    x.beginPath(); x.moveTo(T.x, T.y - 0.08); x.quadraticCurveTo(T.x + 0.09, T.y - 0.07, T.x + 0.12, T.y + 0.02); x.stroke();
    // halka
    x.lineWidth = 0.02; x.beginPath(); x.ellipse(T.x + 0.12, T.y + 0.04, 0.06, 0.02, 0, 0, U.TAU); x.stroke();
    // meşale sapı (ahşap) ve sarılı kafa
    x.strokeStyle = '#4a3220'; x.lineWidth = 0.045;
    x.beginPath(); x.moveTo(T.x + 0.08, T.y - 0.22); x.lineTo(T.x + 0.13, T.y + 0.16); x.stroke();
    x.fillStyle = '#2b2018'; x.beginPath(); x.ellipse(T.x + 0.135, T.y + 0.2, 0.055, 0.08, -0.12, 0, U.TAU); x.fill();
    x.strokeStyle = '#1b140f'; x.lineWidth = 0.008; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(T.x + 0.085, T.y + 0.15 + i * 0.03); x.lineTo(T.x + 0.185, T.y + 0.16 + i * 0.03); x.stroke(); }

    // ---- yüksek dar pencere (mazgal) ----
    x.fillStyle = '#121418'; x.fillRect(-2.7, 4.4, 0.16, 0.7); x.beginPath(); x.arc(-2.62, 5.1, 0.08, 0, Math.PI); x.fill();
    x.fillStyle = 'rgba(236,240,248,0.9)'; x.fillRect(-2.74, 4.38, 0.24, 0.035);
    // kordon taşı (yatay silme)
    x.fillStyle = '#77777b'; x.fillRect(rect.x0, 3.92, rect.x1 - rect.x0, 0.12);
    x.fillStyle = 'rgba(236,240,248,0.9)'; x.fillRect(rect.x0, 4.03, rect.x1 - rect.x0, 0.04);
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(rect.x0, 3.88, rect.x1 - rect.x0, 0.04);

    // ---- zemin (kar) ----
    buildGround(x, rect, ppm, morning);
    // duvar dibinde kar yığını
    x.fillStyle = '#e8edf5';
    x.beginPath(); x.moveTo(rect.x0, -0.05);
    for (let xx = rect.x0; xx <= rect.x1 + 0.01; xx += 0.1) {
      let h = 0.08 + 0.1 * (0.5 + 0.5 * U.fbm1(xx * 1.3 + 2)) + (morning ? 0.08 : 0);
      if (xx > -D.quoin && xx < D.quoin) h *= 0.25; // kapı önü süpürülmüş
      if (xx > N.x0 && xx < N.x1) h *= 0.6;
      x.lineTo(xx, h);
    }
    x.lineTo(rect.x1, -0.1); x.closePath();
    const dg = x.createLinearGradient(0, 0.25, 0, -0.1);
    dg.addColorStop(0, '#f1f4fa'); dg.addColorStop(1, '#c9d2e0');
    x.fillStyle = dg; x.fill();
    return c;
  }

  function buildNiche(x, ppm, opt, morning) {
    const N = GEO.niche;
    // arka duvar (daha küçük taşlar, gölgede)
    x.save();
    x.beginPath(); x.rect(N.x0, -0.05, N.x1 - N.x0, N.top + 0.05); x.clip();
    x.fillStyle = '#4a4a4d'; x.fillRect(N.x0, -0.1, 1.1, 2.5);
    let y = -0.04, k = 0;
    while (y < N.top) { const h = 0.24 + 0.06 * U.hash(k * 2.1); let xx = N.x0 - U.hash(k) * 0.3, j = 0; while (xx < N.x1) { const w = 0.3 + 0.25 * U.hash(k * 9 + j); drawStone(x, xx, y, xx + w, y + h, 12000 + k * 30 + j, { ...opt, snow: 0 }); xx += w; j++; } y += h; k++; }
    // içe doğru gölge
    const sg = x.createLinearGradient(N.x0, 0, N.x1, 0);
    sg.addColorStop(0, 'rgba(5,5,10,0.55)'); sg.addColorStop(0.5, 'rgba(5,5,10,0.3)'); sg.addColorStop(1, 'rgba(5,5,10,0.45)');
    x.fillStyle = sg; x.fillRect(N.x0, -0.1, 1.1, 2.5);
    const tg = x.createLinearGradient(0, N.top, 0, N.top - 0.6);
    tg.addColorStop(0, 'rgba(5,5,10,0.6)'); tg.addColorStop(1, 'rgba(5,5,10,0)');
    x.fillStyle = tg; x.fillRect(N.x0, N.top - 0.6, 1.1, 0.6);
    x.restore();
    // sol iç yan yüz (sağa bakar, görünür şerit)
    x.beginPath(); x.moveTo(N.x0, -0.05); x.lineTo(N.x0 + 0.1, 0.0); x.lineTo(N.x0 + 0.1, N.top - 0.06); x.lineTo(N.x0, N.top); x.closePath();
    x.fillStyle = '#606064'; x.fill();
    x.save(); x.clip(); grain(x, ppm, 1.2, 0.3, 'overlay'); x.fillRect(N.x0, 0, 0.2, 2.4); x.restore(); x.restore();
    // tavan alt yüzü
    x.beginPath(); x.moveTo(N.x0, N.top); x.lineTo(N.x1, N.top); x.lineTo(N.x1 - 0.06, N.top - 0.07); x.lineTo(N.x0 + 0.1, N.top - 0.07); x.closePath();
    x.fillStyle = '#29292c'; x.fill();
    // söve taşları
    for (const side of [0, 1]) {
      let yy = -0.05, kk = 0;
      while (yy < N.top) {
        const h = 0.42 + 0.08 * U.hash(kk * 5 + side);
        const long = (kk + side) % 2 === 0;
        const a = side ? N.x1 : N.x0 - (long ? 0.22 : 0.14), b = side ? N.x1 + (long ? 0.22 : 0.14) : N.x0;
        drawStone(x, a, yy, b, Math.min(N.top, yy + h), 13000 + kk * 3 + side, opt);
        yy += h; kk++;
      }
    }
    // lento
    drawStone(x, N.x0 - 0.24, N.top, N.x1 + 0.24, N.top + 0.3, 14001, { ...opt, snow: 0 });
    x.fillStyle = 'rgba(238,242,250,0.95)';
    x.beginPath(); x.moveTo(N.x0 - 0.24, N.top + 0.29);
    for (let i = 0; i <= 12; i++) { const xx = U.lerp(N.x0 - 0.24, N.x1 + 0.24, i / 12); x.lineTo(xx, N.top + 0.3 + 0.03 + 0.02 * Math.sin(i * 1.7) + (morning ? 0.03 : 0)); }
    x.lineTo(N.x1 + 0.24, N.top + 0.28); x.closePath(); x.fill();
    // nişin içine savrulmuş kar (sol köşe)
    x.fillStyle = '#dfe6f0';
    x.beginPath(); x.moveTo(N.x0, 0); x.quadraticCurveTo(N.x0 + 0.1, 0.35 + (morning ? 0.15 : 0), N.x0 + 0.45, 0.02); x.closePath(); x.fill();
  }

  function buildGround(x, rect, ppm, morning) {
    const g = x.createLinearGradient(0, 0, 0, rect.y0);
    g.addColorStop(0, '#d2dae6'); g.addColorStop(0.35, '#e3e9f2'); g.addColorStop(1, '#eef2f8');
    x.fillStyle = g; x.fillRect(rect.x0, rect.y0, rect.x1 - rect.x0, -rect.y0 + 0.05);
    // dalgalanmalar (rüzgâr sırtları)
    for (let i = 0; i < 26; i++) {
      const yy = U.lerp(-0.05, rect.y0, Math.pow(i / 26, 1.3));
      x.strokeStyle = `rgba(120,135,165,${0.07 + 0.05 * U.hash(i)})`; x.lineWidth = 0.02 + i * 0.002;
      x.beginPath();
      for (let xx = rect.x0; xx <= rect.x1; xx += 0.15) { const y2 = yy + 0.03 * U.fbm1(xx * 0.8 + i * 3); xx === rect.x0 ? x.moveTo(xx, y2) : x.lineTo(xx, y2); }
      x.stroke();
    }
    // çiğnenmiş kar: nöbet yeri ve kapıya giden iz
    const N = GEO.niche;
    const tr = x.createRadialGradient(GEO.guardPost, -0.12, 0, GEO.guardPost, -0.12, 0.6);
    tr.addColorStop(0, 'rgba(110,120,140,0.28)'); tr.addColorStop(1, 'rgba(110,120,140,0)');
    x.save(); x.scale(1, 0.4); x.fillStyle = tr; x.beginPath(); x.arc(GEO.guardPost, -0.3, 0.6, 0, U.TAU); x.fill(); x.restore();
    x.fillStyle = 'rgba(110,120,140,0.16)';
    x.beginPath(); x.moveTo(-0.9, -0.02); x.lineTo(0.9, -0.02); x.lineTo(1.6, rect.y0); x.lineTo(-1.8, rect.y0); x.closePath(); x.fill();
    // ayak izleri (eski, yarı dolmuş)
    const r = U.rng(55);
    for (let i = 0; i < 40; i++) {
      const yy = -0.1 - r() * 2.6; const xx = U.lerp(-0.6, 0.7, r()) + yy * -0.15;
      x.fillStyle = `rgba(90,105,130,${0.12 + r() * 0.1})`;
      x.beginPath(); x.ellipse(xx, yy, 0.05, 0.022 + (-yy) * 0.006, 0, 0, U.TAU); x.fill();
    }
    // kar parıltısı
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; x.fillRect(U.lerp(rect.x0, rect.x1, r()), U.lerp(rect.y0, 0, r()), 0.006, 0.006); }
  }

  // ---------- KAPI KANATLARI (dinamik) ----------
  let LEAF = null;
  function buildLeaf() {
    const D = GEO.door, ppm = 300;
    const rect = { x0: 0, x1: D.hw, y0: 0, y1: D.spring + D.r };
    const { c, x } = worldCanvas(rect, ppm);
    // sağ kanat şekli (menteşe sağ kenarda x=1)
    x.beginPath(); x.moveTo(0, 0); x.lineTo(0, D.spring + D.r); x.arc(0, D.spring, D.r, Math.PI / 2, 0, true); x.lineTo(D.hw, 0); x.closePath();
    x.save(); x.clip();
    // tahtalar
    const nb = 5;
    for (let i = 0; i < nb; i++) {
      const a = i / nb * D.hw, b = (i + 1) / nb * D.hw;
      const col = U.mix([92, 66, 44], [120, 88, 58], U.hash(i * 3.7));
      x.fillStyle = U.rgba(col); x.fillRect(a, 0, b - a, 3.2);
      grain(x, ppm, 0.6, 0.4, 'overlay', 'fine'); x.save(); x.scale(0.12, 1); x.fillRect(a / 0.12, 0, (b - a) / 0.12, 3.2); x.restore(); x.restore();
      // ahşap damarları
      x.strokeStyle = 'rgba(40,25,15,0.35)'; x.lineWidth = 0.004;
      for (let k = 0; k < 7; k++) { const xx = U.lerp(a + 0.01, b - 0.01, U.hash(i * 11 + k)); x.beginPath(); x.moveTo(xx, 0); for (let yy = 0; yy < 3.2; yy += 0.2) x.lineTo(xx + 0.008 * Math.sin(yy * 3 + k), yy); x.stroke(); }
      x.fillStyle = 'rgba(15,10,6,0.8)'; x.fillRect(b - 0.006, 0, 0.012, 3.2);
    }
    // alt kısım eskime ve kar ıslaklığı
    const wg = x.createLinearGradient(0, 0, 0, 0.6); wg.addColorStop(0, 'rgba(20,15,12,0.55)'); wg.addColorStop(1, 'rgba(20,15,12,0)');
    x.fillStyle = wg; x.fillRect(0, 0, 1, 0.6);
    x.restore();
    // demir lamalar (menteşe) — kıvrık uçlu
    for (const yy of [0.45, 1.6, 2.55]) {
      x.fillStyle = '#1d1d20';
      x.beginPath(); x.moveTo(D.hw, yy - 0.045); x.lineTo(0.18, yy - 0.04); x.quadraticCurveTo(0.08, yy - 0.04, 0.08, yy + 0.03); x.quadraticCurveTo(0.1, yy + 0.09, 0.16, yy + 0.06);
      x.quadraticCurveTo(0.12, yy + 0.04, 0.14, yy + 0.02); x.lineTo(0.2, yy + 0.045); x.lineTo(D.hw, yy + 0.045); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(160,160,170,0.25)'; x.lineWidth = 0.006; x.beginPath(); x.moveTo(0.2, yy + 0.04); x.lineTo(D.hw, yy + 0.04); x.stroke();
      for (let k = 0; k < 6; k++) { x.fillStyle = '#3c3c42'; x.beginPath(); x.arc(0.3 + k * 0.13, yy, 0.014, 0, U.TAU); x.fill(); }
    }
    // halka kulp (orta kenara yakın)
    x.strokeStyle = '#1a1a1d'; x.lineWidth = 0.022;
    x.beginPath(); x.arc(0.13, 1.1, 0.075, 0, U.TAU); x.stroke();
    x.fillStyle = '#26262a'; x.beginPath(); x.arc(0.13, 1.18, 0.03, 0, U.TAU); x.fill();
    x.strokeStyle = 'rgba(180,180,190,0.25)'; x.lineWidth = 0.006; x.beginPath(); x.arc(0.13, 1.1, 0.075, -2.2, -1.0); x.stroke();
    LEAF = { c, rect, ppm };
  }
  // open: 0 kapalı .. 1 tam açık (içe doğru)
  function drawDoor(ctx, open, img) {
    if (!LEAF) buildLeaf();
    const IMG = img || LEAF.c;
    const D = GEO.door;
    const a = open * 1.25;
    const w = Math.cos(a);
    const strips = 24;
    for (const side of [-1, 1]) {
      for (let i = 0; i < strips; i++) {
        const f0 = i / strips, f1 = (i + 1) / strips;
        // sağ kanat: menteşe x=1 → serbest uç x=0 ; sol kanat ayna
        const sx = f0 * LEAF.c.width, sw = (f1 - f0) * LEAF.c.width + 1;
        const wx0 = D.hw - (1 - f0) * D.hw * w, wx1 = D.hw - (1 - f1) * D.hw * w;
        const shrink = 1 - 0.1 * Math.sin(a) * (1 - f0);
        const h = (D.spring + D.r) * shrink;
        ctx.save();
        if (side < 0) ctx.scale(-1, 1);
        ctx.drawImage(IMG, sx, 0, sw, IMG.height, wx0, h + (D.spring + D.r) * (1 - shrink) * 0.5, wx1 - wx0 + 0.002, -h);
        ctx.restore();
      }
    }
    // açıkken kanat kalınlık kenarı
    if (open > 0.02) {
      for (const side of [-1, 1]) {
        const xe = side * (D.hw - D.hw * w);
        ctx.fillStyle = 'rgba(30,20,12,0.95)';
        ctx.fillRect(xe - side * 0.05 * Math.sin(a), 0.0, side * 0.05 * Math.sin(a), (D.spring + D.r) * (1 - 0.1 * Math.sin(a)));
      }
    }
  }

  // ---------- İÇ MEKÂN ----------
  const INT = { rect: { x0: -4.8, x1: 4.8, y0: -2.6, y1: 4.4 }, ppm: 300 };
  function buildInterior() {
    const rect = INT.rect, ppm = INT.ppm;
    const { c, x } = worldCanvas(rect, ppm);
    const opt = { ppm, warm: true, snow: 0 };
    x.fillStyle = '#6e5c48'; x.fillRect(rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0);
    // düzgün kesme taş duvar
    let y = -0.02, k = 0;
    while (y < 3.7) { const h = 0.26; let xx = rect.x0 - (k % 2) * 0.3, j = 0; while (xx < rect.x1) { const w = 0.62; drawStone(x, xx, y, xx + w, y + h, 20000 + k * 40 + j, opt); xx += w; j++; } y += h; k++; }
    // tavan kirişleri
    x.fillStyle = '#2e2116'; x.fillRect(rect.x0, 3.55, rect.x1 - rect.x0, 0.22);
    for (let bx = -4.4; bx < 4.6; bx += 1.3) { x.fillStyle = '#3a2a1c'; x.fillRect(bx, 3.42, 0.24, 0.4); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(bx + 0.18, 3.42, 0.06, 0.4); }
    x.fillStyle = '#1f160f'; x.fillRect(rect.x0, 3.77, rect.x1 - rect.x0, 1);
    // sol: giriş kapısının iç yüzü (aralık, dışarıda gece)
    x.fillStyle = '#3a2c20'; x.fillRect(-4.75, -0.05, 1.25, 2.95);
    x.fillStyle = '#0e1626'; x.fillRect(-4.6, 0, 0.95, 2.75);
    const ng = x.createLinearGradient(-4.6, 0, -3.65, 0); ng.addColorStop(0, 'rgba(70,90,130,0.5)'); ng.addColorStop(1, 'rgba(20,30,50,0)');
    x.fillStyle = ng; x.fillRect(-4.6, 0, 0.95, 2.75);
    x.fillStyle = '#e4eaf3'; x.fillRect(-4.6, -0.02, 0.95, 0.07);
    // halı (yolluk) zemin
    const fg = x.createLinearGradient(0, 0, 0, rect.y0); fg.addColorStop(0, '#4a3a2c'); fg.addColorStop(1, '#5e4a38');
    x.fillStyle = fg; x.fillRect(rect.x0, rect.y0, rect.x1 - rect.x0, -rect.y0);
    for (let i = 0; i < 9; i++) { x.strokeStyle = 'rgba(25,18,12,0.5)'; x.lineWidth = 0.012; x.beginPath(); x.moveTo(rect.x0, -i * 0.3); x.lineTo(rect.x1, -i * 0.3); x.stroke(); }
    for (let i = -16; i < 16; i++) { x.beginPath(); x.moveTo(i * 0.55, 0); x.lineTo(i * 0.55 * 1.6, rect.y0); x.stroke(); }
    x.fillStyle = '#7a2a22'; x.beginPath(); x.moveTo(rect.x0, -0.45); x.lineTo(rect.x1, -0.45); x.lineTo(rect.x1, -1.5); x.lineTo(rect.x0, -1.5); x.closePath(); x.fill();
    x.strokeStyle = '#c08a40'; x.lineWidth = 0.03; x.strokeRect(rect.x0 - 1, -1.45, rect.x1 - rect.x0 + 2, 0.95);
    grain(x, ppm, 0.5, 0.3, 'overlay', 'fine'); x.fillRect(rect.x0, -1.5, rect.x1 - rect.x0, 1.05); x.restore();
    // duvar halısı
    x.fillStyle = '#5a1a18'; x.fillRect(-2.7, 1.0, 1.55, 2.2);
    x.strokeStyle = '#b8823a'; x.lineWidth = 0.05; x.strokeRect(-2.62, 1.08, 1.39, 2.04);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
      const cx = -2.42 + i * 0.33, cy = 1.35 + j * 0.38;
      x.fillStyle = (i + j) % 2 ? '#a06a2c' : '#2d3a4a';
      x.beginPath(); x.moveTo(cx, cy - 0.13); x.lineTo(cx + 0.1, cy); x.lineTo(cx, cy + 0.13); x.lineTo(cx - 0.1, cy); x.closePath(); x.fill();
    }
    grain(x, ppm, 0.4, 0.35, 'overlay', 'fine'); x.fillRect(-2.7, 1.0, 1.55, 2.2); x.restore();
    x.fillStyle = '#2a1d12'; x.fillRect(-2.85, 3.18, 1.85, 0.05);
    // sağ: şömineli odaya açılan kemer
    const ax0 = 0.7, ax1 = 2.7, as = 2.0, ar = 1.0;
    x.beginPath(); x.moveTo(ax0, 0); x.lineTo(ax0, as); x.arc((ax0 + ax1) / 2, as, ar, Math.PI, 0, true); x.lineTo(ax1, 0); x.closePath();
    x.fillStyle = '#3c2a1c'; x.fill();
    x.save(); x.clip();
    // içerideki oda: daha uzak, daha küçük ölçek
    x.fillStyle = '#5a4532'; x.fillRect(ax0, 0, 2, 3);
    for (let yy = 0.2; yy < 3; yy += 0.18) { x.strokeStyle = 'rgba(30,20,12,0.35)'; x.lineWidth = 0.01; x.beginPath(); x.moveTo(ax0, yy); x.lineTo(ax1, yy); x.stroke(); }
    // şömine
    const fx = 1.7;
    x.fillStyle = '#7d6a55'; x.fillRect(fx - 0.62, 0.25, 1.24, 1.15);
    x.fillStyle = '#8e7a62'; x.fillRect(fx - 0.75, 1.32, 1.5, 0.16);
    x.fillStyle = '#140c08'; x.beginPath(); x.moveTo(fx - 0.45, 0.25); x.lineTo(fx - 0.45, 0.95); x.quadraticCurveTo(fx, 1.12, fx + 0.45, 0.95); x.lineTo(fx + 0.45, 0.25); x.closePath(); x.fill();
    x.fillStyle = '#2a2018'; for (let i = 0; i < 3; i++) { x.save(); x.translate(fx - 0.2 + i * 0.18, 0.32); x.rotate(0.2 - i * 0.2); x.fillRect(-0.2, -0.04, 0.4, 0.08); x.restore(); }
    // koltuk silueti
    x.fillStyle = '#2a1a10'; x.fillRect(ax0 + 0.15, 0.25, 0.45, 0.45); x.fillRect(ax0 + 0.15, 0.25, 0.08, 1.0);
    x.fillStyle = '#6a2a20'; x.fillRect(ax0 + 0.2, 0.62, 0.38, 0.1);
    // oda zemini
    x.fillStyle = '#3a2a1e'; x.fillRect(ax0, -0.1, 2, 0.35);
    x.restore();
    // kemer taşları
    for (let i = 0; i < 11; i++) {
      const a0 = Math.PI - (i / 11) * Math.PI, a1 = Math.PI - ((i + 1) / 11) * Math.PI;
      x.beginPath(); x.arc((ax0 + ax1) / 2, as, ar, a0, a1, true); x.arc((ax0 + ax1) / 2, as, ar + 0.28, a1, a0, false); x.closePath();
      x.fillStyle = U.rgba(stoneColor(30000 + i, true)); x.fill(); x.strokeStyle = '#4a3a2a'; x.lineWidth = 0.02; x.stroke();
    }
    // masa (duvar dibinde, yürüme çizgisinin arkasında)
    const tx0 = -0.95, tx1 = 0.35;
    x.fillStyle = '#3a2618'; x.fillRect(tx0, 0.72, tx1 - tx0, 0.07);
    x.fillStyle = '#2c1c12'; x.fillRect(tx0 + 0.05, 0, 0.07, 0.72); x.fillRect(tx1 - 0.12, 0, 0.07, 0.72);
    x.fillStyle = '#4a321f'; x.fillRect(tx0, 0.79, tx1 - tx0, 0.03);
    // kâğıtlar, mürekkep, mum
    x.fillStyle = '#d8c8a2'; x.save(); x.translate(-0.55, 0.82); x.rotate(0.05); x.fillRect(0, 0, 0.3, 0.012); x.restore();
    x.fillStyle = '#cdbb94'; x.save(); x.translate(-0.3, 0.825); x.rotate(-0.08); x.fillRect(0, 0, 0.26, 0.012); x.restore();
    x.fillStyle = '#1a1a22'; x.fillRect(0.0, 0.82, 0.07, 0.07);
    x.fillStyle = '#e8dcc0'; x.fillRect(0.17, 0.82, 0.045, 0.2);
    // bank
    x.fillStyle = '#3a2618'; x.fillRect(3.1, 0.42, 1.4, 0.07); x.fillRect(3.15, 0, 0.07, 0.42); x.fillRect(4.35, 0, 0.07, 0.42);
    // duvar şamdanları
    for (const sx of [-3.15, 3.45]) { x.fillStyle = '#1e1a16'; x.fillRect(sx - 0.03, 2.0, 0.06, 0.3); x.fillRect(sx - 0.1, 2.28, 0.2, 0.03); x.fillStyle = '#e8dcc0'; x.fillRect(sx - 0.02, 2.31, 0.04, 0.16); }
    return c;
  }

  // ---------- DUVAR YAZISI (ayrı metin katmanı, kömür dokusu) ----------
  let TEXTL = null;
  function buildText() {
    const T = GEO.text, ppm = 1500;
    const w = (T.x1 - T.x0) * ppm, h = (T.y1 - T.y0) * ppm;
    const c = U.makeCanvas(w, h), x = c.getContext('2d');
    const lines = TIMELINE.wallText;
    const r = U.rng(2024);
    const glyphs = []; // her harfin yayılım için konumu
    const lh = h / (lines.length + 0.35);
    x.textBaseline = 'alphabetic';
    let order = 0;
    lines.forEach((line, li) => {
      const size = lh * (0.62 - li * 0.012);
      x.font = `italic ${size}px "Caladea", "FreeSerif", serif`;
      const tw = x.measureText(line).width;
      const scaleX = Math.min(1, (w * 0.94) / tw);
      let px = w * 0.03 + li * w * 0.012 + (r() - 0.5) * w * 0.01;
      const base = lh * (li + 0.85) + (r() - 0.5) * lh * 0.06;
      for (const ch of line) {
        const cw = x.measureText(ch).width * scaleX;
        glyphs.push({ ch, x: px, y: base + Math.sin(order * 0.7) * lh * 0.02 - (px / w) * lh * 0.05, rot: (r() - 0.5) * 0.07, s: size * (0.95 + r() * 0.1), sx: scaleX, order: order++, line: li });
        px += cw * (0.98 + r() * 0.06);
      }
    });
    TEXTL = { c, x, w, h, glyphs, ppm, total: order };
  }
  // progress: 0..1 (yazma ilerlemesi), dünya koordinatlı ctx'e çizer
  function drawWallText(ctx, progress, light) {
    if (!TEXTL) buildText();
    const T = GEO.text, { c, x, w, h, glyphs } = TEXTL;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, w, h);
    const n = Math.floor(progress * TEXTL.total + 1e-6);
    const r = U.rng(77);
    for (const g of glyphs) {
      if (g.order >= n) break;
      if (g.ch === ' ') continue;
      // kömür: düzensiz, birkaç kez üst üste sürülmüş
      for (let pass = 0; pass < 4; pass++) {
        x.save();
        x.translate(g.x + (r() - 0.5) * 2.2, g.y + (r() - 0.5) * 2.2);
        x.rotate(g.rot + (r() - 0.5) * 0.02);
        x.scale(g.sx, 1);
        x.font = `italic ${g.s}px "Caladea", "FreeSerif", serif`;
        x.fillStyle = `rgba(12,10,10,${0.42 + r() * 0.14})`;
        x.strokeStyle = `rgba(14,12,12,${0.18})`; x.lineWidth = g.s * 0.035;
        x.fillText(g.ch, 0, 0); x.strokeText(g.ch, 0, 0);
        x.restore();
      }
    }
    // taş dokusundan kaynaklanan kopukluklar: ince gürültüyle sil
    ensureNoise();
    x.save(); x.globalCompositeOperation = 'destination-out';
    const pat = x.createPattern(NOISE_FINE, 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1.4, 1.4));
    x.globalAlpha = 0.32; x.fillStyle = pat; x.fillRect(0, 0, w, h);
    x.restore();
    // dünyaya yerleştir: hafif perspektif ve taşa uyum
    ctx.save();
    ctx.translate(T.x0, T.y1);
    ctx.transform(1, -0.015, 0.03, 1, 0, 0);
    ctx.scale(1 / TEXTL.ppm, -1 / TEXTL.ppm);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.95;
    ctx.drawImage(c, 0, 0);
    ctx.restore();
  }
  // yazma ucunun konumu (eli taşımak için), dünya koordinatı
  function textCursor(progress) {
    if (!TEXTL) buildText();
    const T = GEO.text;
    const n = Math.min(TEXTL.glyphs.length - 1, Math.floor(progress * TEXTL.total));
    const g = TEXTL.glyphs[Math.max(0, n)];
    const frac = progress * TEXTL.total - n;
    return { x: T.x0 + (g.x + g.s * 0.3 * frac) / TEXTL.ppm, y: T.y1 - (g.y - g.s * 0.25 + Math.sin(frac * 9) * g.s * 0.15) / TEXTL.ppm };
  }

  let built = null;
  function build() {
    if (built) return built;
    ensureNoise();
    built = {
      ext: { c: buildExterior(EXT.rect, EXT.ppm, false), rect: EXT.rect, ppm: EXT.ppm },
      morn: { c: buildExterior(EXT.rect, EXT.ppm, true), rect: EXT.rect, ppm: EXT.ppm },
      patch: { c: buildExterior(PATCH.rect, PATCH.ppm, false), rect: PATCH.rect, ppm: PATCH.ppm },
      patchM: { c: buildExterior(PATCH.rect, PATCH.ppm, true), rect: PATCH.rect, ppm: PATCH.ppm },
      int: { c: buildInterior(), rect: INT.rect, ppm: INT.ppm },
    };
    buildLeaf(); buildText();
    return built;
  }
  // önceden çizilmiş dünyayı kameraya göre çiz (ctx dünya dönüşümündeyken)
  function blit(ctx, layer) {
    const r = layer.rect;
    ctx.save();
    ctx.translate(r.x0, r.y1); ctx.scale(1 / layer.ppm, -1 / layer.ppm);
    ctx.drawImage(layer.c, 0, 0);
    ctx.restore();
  }

  function leaf() { if (!LEAF) buildLeaf(); return LEAF.c; }
  return { GEO, build, blit, drawDoor, drawWallText, textCursor, grain, leaf };
})();
if (typeof module !== 'undefined') module.exports = SETS;
