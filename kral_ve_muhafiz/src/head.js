// SÖZDE 3B BAŞ — yüz hatları dönüş açısına (yaw) göre baş elipsoidinin üzerine izdüşürülür.
// Birim: R (baş yarı genişliği). +x = yüzün baktığı yön, +y = yukarı. Göz hizası y=0.
'use strict';
const HEAD = (() => {
  // profil tabloları: y, yarı genişlik w, ön derinlik d, arka derinlik db
  const T = [
    [1.45, 0.00, 0.00, 0.00], [1.32, 0.56, 0.60, 0.78], [1.08, 0.86, 0.90, 1.07], [0.72, 0.97, 1.00, 1.17],
    [0.38, 1.00, 1.03, 1.14], [0.22, 1.00, 1.05, 1.09], [0.04, 0.99, 0.94, 1.00], [-0.12, 0.98, 0.93, 0.92],
    [-0.36, 0.95, 0.98, 0.78], [-0.62, 0.88, 1.00, 0.56], [-0.80, 0.82, 1.00, 0.43], [-0.96, 0.76, 0.99, 0.34],
    [-1.12, 0.66, 0.95, 0.25], [-1.32, 0.50, 0.97, 0.15], [-1.50, 0.30, 0.84, 0.05], [-1.62, 0.06, 0.42, 0.00],
  ];
  function prof(y) {
    if (y >= T[0][0]) return [0, 0, 0];
    for (let i = 0; i < T.length - 1; i++) {
      const a = T[i], b = T[i + 1];
      if (y <= a[0] && y >= b[0]) {
        const k = (a[0] - y) / (a[0] - b[0]);
        const s = k * k * (3 - 2 * k) * 0.5 + k * 0.5;
        return [U.lerp(a[1], b[1], s), U.lerp(a[2], b[2], s), U.lerp(a[3], b[3], s)];
      }
    }
    return [0, 0, 0];
  }
  const Y0 = 1.45, Y1 = -1.62;
  // burun çıkıntısı
  const NOSE = [[0.14, 0.0], [0.0, 0.05], [-0.2, 0.13], [-0.38, 0.24], [-0.48, 0.29], [-0.56, 0.22], [-0.61, 0.08], [-0.64, 0.0]];
  function noseZ(y) {
    if (y > NOSE[0][0] || y < NOSE[NOSE.length - 1][0]) return 0;
    for (let i = 0; i < NOSE.length - 1; i++) {
      const a = NOSE[i], b = NOSE[i + 1];
      if (y <= a[0] && y >= b[0]) return U.lerp(a[1], b[1], (a[0] - y) / (a[0] - b[0]));
    }
    return 0;
  }

  function makeProj(yaw, noseScale) {
    const phi = (1 - U.clamp(yaw, 0, 1)) * 1.45;
    const c = Math.cos(phi), s = Math.sin(phi);
    const sil = (y) => { const [w, d, db] = prof(y); return { r: Math.sqrt((w * c) ** 2 + (d * s) ** 2), l: -Math.sqrt((w * c) ** 2 + (db * s) ** 2) }; };
    const P = (u, y, zx = 0) => {
      const [w, d] = prof(y);
      const X = u * w, Z = d * Math.sqrt(Math.max(0, 1 - u * u));
      const x = X * c + Z * s, vis = -X * s + (Z + zx) * c;
      const sl = sil(y);
      // hafif üstten bakış: arkadaki noktalar biraz yukarı
      return { x: U.clamp(x, sl.l, sl.r) + zx * s, y: y - (-X * s + Z * c) * 0.0, vis, fs: U.clamp(Math.sqrt(Math.max(0, 1 - u * u)) * c - u * s, 0.08, 1) };
    };
    return { phi, c, s, sil, P, noseScale };
  }

  function silhouettePath(ctx, pr, expand = 0) {
    const N = 40; const pts = [];
    for (let i = 0; i <= N; i++) { const y = U.lerp(Y0, Y1, i / N); const sl = pr.sil(y); pts.push({ x: sl.r + expand, y: y + (i === 0 ? expand : 0) }); }
    for (let i = N; i >= 0; i--) { const y = U.lerp(Y0, Y1, i / N); const sl = pr.sil(y); pts.push({ x: sl.l - expand, y }); }
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.5);
  }

  // Ana çizim. sp: görünüm özellikleri, st: anlık ifade, L: ışık, px: 1 ekran pikselinin R cinsinden boyu
  function draw(ctx, sp, st, L, px) {
    const pr = makeProj(st.yaw == null ? 0.35 : st.yaw, 1);
    const P = pr.P;
    const detail = px < 0.02 ? 2 : px < 0.06 ? 1 : 0;
    const skin = sp.skin, frost = st.frost || 0;
    const skinC = (k, warm = 0) => L.c(U.mix(skin, [196, 206, 222], frost * 0.55), k, warm);

    // --- başlık (kukuleta) arka kısmı
    if (sp.hood) drawHoodBack(ctx, pr, sp, L);

    // --- kafa derisi / yüz tabanı
    silhouettePath(ctx, pr);
    const g = ctx.createLinearGradient(-1.2 * L.kx, 0, 1.2 * L.kx, 0);
    g.addColorStop(0, skinC(-0.75)); g.addColorStop(0.55, skinC(0.15)); g.addColorStop(1, skinC(0.65));
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); silhouettePath(ctx, pr); ctx.clip();
    // hacim: alt çene gölgesi ve yanak kızarıklığı (soğuk)
    let rg = ctx.createRadialGradient(P(0.05, 0.25).x, 0.3, 0.2, P(0, 0).x, -0.2, 1.9);
    rg.addColorStop(0, 'rgba(255,240,225,0.10)'); rg.addColorStop(0.6, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(10,10,30,0.35)');
    ctx.fillStyle = rg; ctx.fillRect(-2, -2, 4, 4);
    const red = (sp.coldCheeks || 0) * (1 - frost);
    for (const u of [-0.55, 0.55]) {
      const p = P(u, -0.35); if (p.vis < 0) continue;
      const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 0.42 * Math.max(0.4, p.fs));
      cg.addColorStop(0, `rgba(190,60,55,${0.28 * red})`); cg.addColorStop(1, 'rgba(190,60,55,0)');
      ctx.fillStyle = cg; ctx.fillRect(-2, -2, 4, 4);
    }
    const nr = P(0, -0.45, 0.22);
    let ng = ctx.createRadialGradient(nr.x, nr.y, 0, nr.x, nr.y, 0.22);
    ng.addColorStop(0, `rgba(185,70,65,${0.32 * red})`); ng.addColorStop(1, 'rgba(185,70,65,0)');
    ctx.fillStyle = ng; ctx.fillRect(-2, -2, 4, 4);
    // göz çukurları
    for (const u of [-0.4, 0.4]) {
      const p = P(u, 0.02); if (p.vis < -0.1) continue;
      const eg = ctx.createRadialGradient(p.x, p.y + 0.02, 0, p.x, p.y + 0.02, 0.38);
      eg.addColorStop(0, `rgba(40,25,30,${0.32 + (sp.tired || 0) * 0.18})`); eg.addColorStop(1, 'rgba(40,25,30,0)');
      ctx.fillStyle = eg; ctx.fillRect(-2, -2, 4, 4);
    }
    // gölge tarafı (arka yanak)
    const back = pr.sil(-0.3).l;
    const sg = ctx.createLinearGradient(back, 0, back + 0.9, 0);
    sg.addColorStop(0, 'rgba(15,15,35,0.38)'); sg.addColorStop(1, 'rgba(15,15,35,0)');
    ctx.fillStyle = sg; ctx.fillRect(-2, -2, 4, 4);
    // kırışıklıklar
    if (detail >= 1) wrinkles(ctx, pr, sp, st, px);
    ctx.restore();

    // --- saç
    drawHair(ctx, pr, sp, st, L, px, detail);
    // --- kulak (yakın taraf)
    drawEar(ctx, pr, sp, L, skinC);
    // --- sakal
    if (sp.beard) drawBeard(ctx, pr, sp, st, L, px, detail);
    // --- gözler, kaşlar, burun, ağız
    drawNose(ctx, pr, sp, L, skinC, px);
    drawMouth(ctx, pr, sp, st, L, px);
    for (const side of [-1, 1]) drawEye(ctx, pr, sp, st, side, L, px, detail);
    for (const side of [-1, 1]) drawBrow(ctx, pr, sp, st, side, L, px);
    if (sp.beard) drawMustache(ctx, pr, sp, st, L, px, detail);
    // --- taç / kukuleta ön kenarı
    if (sp.crown) drawCrown(ctx, pr, L, px);
    if (sp.hood) drawHoodFront(ctx, pr, sp, L);
    // --- kar ve kırağı
    if (st.snow > 0.02 && !sp.hood) {
      // saçın üstüne düşmüş kar taneleri (takke gibi değil, dağınık)
      const r = U.rng(313);
      ctx.fillStyle = L.c([240, 244, 252], 0.6);
      const n = Math.floor(70 * st.snow);
      for (let i = 0; i < n; i++) {
        const u = U.lerp(-0.95, 0.9, r()), yy = U.lerp(0.75, 1.42, Math.sqrt(r()));
        const sl = pr.sil(yy);
        const x = U.lerp(sl.l + 0.05, sl.r - 0.05, (u + 1) / 2);
        const rad = (0.018 + r() * 0.03) * (0.6 + st.snow * 0.6);
        ctx.globalAlpha = 0.55 + r() * 0.45;
        ctx.beginPath(); ctx.ellipse(x, yy + 0.02, rad * 1.4, rad, 0, 0, U.TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (frost > 0.02) drawFrost(ctx, pr, sp, frost, px);
  }

  function wrinkles(ctx, pr, sp, st, px) {
    const P = pr.P; const age = sp.age || 0.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(60,35,30,${0.18 + 0.15 * age})`; ctx.lineWidth = Math.max(px * 1.2, 0.012);
    for (const [y, a] of [[0.55, 0.7], [0.68, 0.6], [0.8, 0.45]]) {
      const lift = (st.browIn || 0) * 0.04 + (st.brow || 0) * 0.04;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const u = U.lerp(-a, a, i / 8); const p = P(u, y + lift * (1 - Math.abs(u)) + Math.sin(i * 1.7) * 0.008); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    }
    // kaş arası çizgileri (çatılma)
    const knit = (st.knit || 0) + (sp.tired || 0) * 0.4;
    if (knit > 0.05) {
      ctx.strokeStyle = `rgba(60,35,30,${0.25 * knit})`;
      for (const u of [-0.07, 0.07]) { const a = P(u, 0.2), b = P(u * 1.3, 0.38); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    // kaz ayakları
    const sm = st.smile || 0;
    for (const side of [-1, 1]) {
      const c = P(side * 0.66, -0.02); if (c.vis < 0.05) continue;
      ctx.strokeStyle = `rgba(70,40,35,${0.12 + 0.25 * age + 0.2 * sm})`;
      for (let k = -1; k <= 1; k++) { const e = P(side * 0.86, -0.02 + k * 0.1); ctx.beginPath(); ctx.moveTo(c.x, c.y + k * 0.02); ctx.lineTo(e.x, e.y + k * 0.03); ctx.stroke(); }
    }
    // göz altı torbaları
    ctx.strokeStyle = `rgba(70,40,40,${0.18 + (sp.tired || 0) * 0.3})`;
    for (const side of [-1, 1]) {
      const a = P(side * 0.22, -0.15), m = P(side * 0.42, -0.2), b = P(side * 0.6, -0.12);
      if (m.vis < 0.05) continue;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(m.x, m.y - 0.03, b.x, b.y); ctx.stroke();
    }
    // nazolabial kıvrım
    ctx.strokeStyle = `rgba(70,35,30,${0.2 + 0.3 * sm + 0.12 * age})`; ctx.lineWidth = Math.max(px * 1.5, 0.016);
    for (const side of [-1, 1]) {
      const a = P(side * 0.2, -0.5), m = P(side * 0.4, -0.75), b = P(side * (0.44 + sm * 0.05), -1.0);
      if (m.vis < 0.05) continue;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(m.x, m.y, b.x, b.y); ctx.stroke();
    }
  }

  function drawHair(ctx, pr, sp, st, L, px, detail) {
    const P = pr.P; const col = sp.hair;
    const hl = [[0.97, 0.6], [0.9, 0.7], [0.62, 0.86], [0.25, 0.97], [0, 1.0], [-0.25, 0.97], [-0.62, 0.86], [-0.95, 0.55], [-0.99, 0.05]];
    const pts = [];
    const hp = hl.map(([u, y]) => P(u * (sp.recede ? 0.95 : 1), y - (sp.recede || 0) * (1 - Math.abs(u)) * 0.12));
    for (let i = 3; i >= 0; i--) hp[i].x = Math.max(hp[i].x, hp[i + 1].x);
    pts.push(...hp);
    // favori → kulak arkası → ense
    pts.push(P(-0.99, -0.2)); pts.push({ x: pr.sil(-0.25).l * 0.82, y: -0.12 });
    pts.push({ x: pr.sil(-0.5).l - 0.03, y: -0.5 });
    for (let i = 0; i <= 10; i++) { const y = U.lerp(-0.4, 1.45, i / 10); pts.push({ x: pr.sil(y).l - 0.05, y: y + (i === 10 ? 0.06 : 0) }); }
    for (let i = 10; i >= 0; i--) { const y = U.lerp(0.62, 1.45, i / 10); pts.push({ x: pr.sil(y).r + 0.04, y: y + 0.03 }); }
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.3);
    const g = ctx.createLinearGradient(0, 1.5, 0, -0.5);
    g.addColorStop(0, L.c(col, 0.45)); g.addColorStop(0.5, L.c(col, 0)); g.addColorStop(1, L.c(col, -0.6));
    ctx.fillStyle = g; ctx.fill();
    // saç telleri
    if (detail >= 1) {
      ctx.save(); ctx.clip();
      const r = U.rng(sp.seed || 7);
      ctx.lineCap = 'round';
      const n = detail === 2 ? 260 : 90;
      for (let i = 0; i < n; i++) {
        const x = U.lerp(-1.3, 1.1, r()), y = U.lerp(-0.6, 1.5, r());
        const lc = r() < 0.5 ? U.scale(col, 0.6) : U.mix(col, sp.hairHi || [200, 200, 200], 0.35 + r() * 0.3);
        ctx.strokeStyle = L.c(lc, 0, 0); ctx.globalAlpha = 0.35 + r() * 0.4;
        ctx.lineWidth = Math.max(px * 1.1, 0.014);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 0.12, y - 0.05, x - 0.2 - r() * 0.1, y - 0.18 - r() * 0.1); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.restore();
    }
  }

  function drawEar(ctx, pr, sp, L, skinC) {
    if (pr.s < 0.2) return;
    const [w] = prof(-0.25);
    const cx = -w * pr.c - 0.12 * pr.s, cy = -0.25;
    const sx = 0.2 * pr.s + 0.05;
    ctx.beginPath();
    ctx.moveTo(cx + sx * 0.6, cy + 0.32);
    ctx.bezierCurveTo(cx - sx * 1.0, cy + 0.42, cx - sx * 1.35, cy + 0.05, cx - sx * 0.9, cy - 0.22);
    ctx.bezierCurveTo(cx - sx * 0.6, cy - 0.38, cx + sx * 0.1, cy - 0.38, cx + sx * 0.55, cy - 0.28);
    ctx.closePath();
    ctx.fillStyle = skinC(-0.15); ctx.fill();
    ctx.strokeStyle = 'rgba(70,30,30,0.45)'; ctx.lineWidth = 0.025;
    ctx.beginPath(); ctx.moveTo(cx + sx * 0.2, cy + 0.22); ctx.bezierCurveTo(cx - sx * 0.7, cy + 0.25, cx - sx * 0.8, cy - 0.05, cx - sx * 0.3, cy - 0.15); ctx.stroke();
    const eg = ctx.createRadialGradient(cx - sx * 0.3, cy + 0.05, 0, cx - sx * 0.3, cy + 0.05, 0.3);
    eg.addColorStop(0, 'rgba(200,70,70,0.35)'); eg.addColorStop(1, 'rgba(200,70,70,0)');
    ctx.fillStyle = eg; ctx.fill();
  }

  function beardPolygon(pr, sp) {
    const P = pr.P; const th = sp.beardLen || 0.1;
    const pts = [];
    // üst sınır: yakın favori → yanak → bıyık üstü → uzak yanak
    const top = [[-1.0, -0.12], [-0.93, -0.48], [-0.7, -0.74], [-0.42, -0.84], [0, -1.02], [0.42, -0.84], [0.7, -0.74], [0.93, -0.48], [1.0, -0.12]];
    const tp = top.map(([u, y]) => P(u, y + (sp.beardHigh || 0)));
    for (let i = 5; i < tp.length; i++) tp[i].x = Math.max(tp[i].x, tp[i - 1].x); // uzak taraf geri katlanmasın
    pts.push(...tp);
    // uzak taraf siluet boyunca aşağı
    for (let i = 0; i <= 10; i++) { const y = U.lerp(-0.48, -1.62, i / 10); pts.push({ x: pr.sil(y).r + th * (0.2 + 0.8 * i / 10), y: y - (i === 10 ? th * 1.2 : 0) }); }
    // çene altı → çene hattı geri
    for (let i = 10; i >= 0; i--) { const y = U.lerp(-0.12, -1.62, i / 10); pts.push({ x: pr.sil(y).l - th * 0.35, y: y - (i === 10 ? th : 0) }); }
    return pts;
  }
  function drawBeard(ctx, pr, sp, st, L, px, detail) {
    const pts = beardPolygon(pr, sp);
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.35);
    const col = sp.beardCol || sp.hair;
    const g = ctx.createLinearGradient(0, -0.4, 0, -1.8);
    g.addColorStop(0, L.c(col, 0.0)); g.addColorStop(1, L.c(col, -0.55));
    ctx.globalAlpha = sp.beardAlpha || 1; ctx.fillStyle = g; ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.clip();
    const r = U.rng((sp.seed || 3) * 17);
    const n = detail === 2 ? 520 : detail === 1 ? 180 : 60;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = U.lerp(-1.3, 1.4, r()), y = U.lerp(-1.8, -0.05, r());
      const hi = r() < (sp.grey || 0);
      const lc = hi ? [205, 205, 205] : r() < 0.5 ? U.scale(col, 0.55) : U.mix(col, [150, 120, 100], 0.4);
      ctx.strokeStyle = L.c(lc, 0); ctx.globalAlpha = 0.3 + r() * 0.5;
      ctx.lineWidth = Math.max(px, 0.013);
      const len = 0.06 + r() * 0.08;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.6) * 0.04, y - len); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.restore();
  }
  function drawMustache(ctx, pr, sp, st, L, px, detail) {
    const P = pr.P; const col = sp.beardCol || sp.hair;
    const sm = st.smile || 0;
    const pts = [P(-0.42, -0.86 + sm * 0.04), P(-0.25, -0.68), P(0, -0.66, 0.05), P(0.25, -0.68), P(0.42, -0.86 + sm * 0.04), P(0.22, -0.8), P(0, -0.8, 0.06), P(-0.22, -0.8)];
    const vis = pts.filter((p) => p.vis > -0.2);
    if (vis.length < 3) return;
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.4);
    ctx.fillStyle = L.c(U.scale(col, 0.9), -0.1); ctx.globalAlpha = sp.beardAlpha || 1; ctx.fill(); ctx.globalAlpha = 1;
    if ((sp.grey || 0) > 0.3) { ctx.strokeStyle = 'rgba(210,210,210,0.35)'; ctx.lineWidth = Math.max(px, 0.012); for (let i = 0; i < 10; i++) { const a = U.V.lerp(pts[1], pts[3], i / 9); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + 0.02, a.y - 0.1); ctx.stroke(); } }
  }

  function drawNose(ctx, pr, sp, L, skinC, px) {
    const P = pr.P; const ns = sp.nose || 1;
    const b = (u, y) => P(u, y, noseZ(y) * ns);
    // burun sırtı ve kanatlar
    const right = [b(0.07, 0.1), b(0.08, -0.15), b(0.1, -0.38), b(0.14, -0.5), b(0.18, -0.58), b(0.06, -0.63)];
    const left = [b(-0.06, -0.63), b(-0.2, -0.6), b(-0.22, -0.52), b(-0.12, -0.42), b(-0.07, -0.15), b(-0.06, 0.1)];
    // gölge yüzeyi (yakın taraf)
    ctx.beginPath(); U.smoothPath(ctx, [b(0, 0.12), ...right.slice(1), ...left, b(-0.04, 0.05)], true, 0.35);
    const g = ctx.createLinearGradient(left[2].x, 0, right[3].x + 0.05, 0);
    g.addColorStop(0, skinC(-0.25)); g.addColorStop(0.6, skinC(0.2)); g.addColorStop(1, skinC(0.45));
    ctx.fillStyle = g; ctx.fill();
    // uç parlaması
    const tip = b(0.03, -0.46);
    const tg = ctx.createRadialGradient(tip.x, tip.y + 0.02, 0, tip.x, tip.y, 0.13);
    tg.addColorStop(0, 'rgba(255,225,210,0.25)'); tg.addColorStop(1, 'rgba(255,225,210,0)');
    ctx.fillStyle = tg; ctx.fill();
    // burun altı gölgesi ve delik
    const ns1 = b(-0.08, -0.6);
    ctx.fillStyle = 'rgba(40,15,15,0.55)';
    ctx.beginPath(); ctx.ellipse(ns1.x, ns1.y, 0.045 * Math.max(0.4, ns1.fs), 0.022, 0.2, 0, U.TAU); ctx.fill();
    const sh = b(0, -0.66);
    const sg = ctx.createRadialGradient(sh.x, sh.y - 0.02, 0, sh.x, sh.y - 0.02, 0.18);
    sg.addColorStop(0, 'rgba(40,15,20,0.35)'); sg.addColorStop(1, 'rgba(40,15,20,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sh.x, sh.y - 0.02, 0.18, 0, U.TAU); ctx.fill();
    // kanat çizgisi
    ctx.strokeStyle = 'rgba(70,30,25,0.5)'; ctx.lineWidth = Math.max(px * 1.3, 0.015);
    ctx.beginPath(); ctx.moveTo(left[1].x, left[1].y); ctx.quadraticCurveTo(left[2].x - 0.02, left[2].y + 0.02, left[3].x, left[3].y + 0.02); ctx.stroke();
  }

  function drawMouth(ctx, pr, sp, st, L, px) {
    const P = pr.P; const sm = st.smile || 0, op = st.mouthOpen || 0;
    const y = -0.92;
    const cL = P(-0.34 - sm * 0.03, y + sm * 0.06 - (sp.frown || 0) * 0.04), cR = P(0.34 + sm * 0.03, y + sm * 0.06 - (sp.frown || 0) * 0.04);
    const mid = P(0, y - sm * 0.01, 0.04);
    const ulT = P(0, y + 0.07, 0.04), llB = P(0, y - 0.11 - op * 0.08, 0.03);
    // dudaklar
    ctx.beginPath(); ctx.moveTo(cL.x, cL.y);
    ctx.quadraticCurveTo(P(-0.15, y + 0.08).x, P(-0.15, y + 0.08).y, ulT.x, ulT.y);
    ctx.quadraticCurveTo(P(0.15, y + 0.08).x, P(0.15, y + 0.08).y, cR.x, cR.y);
    ctx.quadraticCurveTo(llB.x + 0.05, llB.y, cL.x, cL.y);
    ctx.fillStyle = L.c(U.mix(sp.skin, [150, 70, 70], 0.4), -0.1); ctx.fill();
    // ağız çizgisi
    ctx.strokeStyle = 'rgba(45,15,15,0.85)'; ctx.lineWidth = Math.max(px * 1.6, 0.02); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cL.x, cL.y);
    ctx.quadraticCurveTo(P(-0.16, y - 0.005).x, P(-0.16, y - 0.005 - sm * 0.02).y, mid.x, mid.y);
    ctx.quadraticCurveTo(P(0.16, y - 0.005).x, P(0.16, y - 0.005 - sm * 0.02).y, cR.x, cR.y);
    ctx.stroke();
    if (op > 0.02) {
      ctx.fillStyle = 'rgba(30,8,8,0.9)';
      ctx.beginPath(); ctx.ellipse(mid.x - 0.02, mid.y - op * 0.04, 0.16 * Math.max(0.5, mid.fs), op * 0.05, 0, 0, U.TAU); ctx.fill();
    }
    // alt dudak parlaması
    ctx.strokeStyle = 'rgba(255,200,190,0.18)'; ctx.lineWidth = 0.03;
    ctx.beginPath(); ctx.moveTo(P(-0.12, y - 0.07).x, y - 0.07); ctx.lineTo(P(0.1, y - 0.07).x, y - 0.07); ctx.stroke();
  }

  function drawEye(ctx, pr, sp, st, side, L, px, detail) {
    const P = pr.P;
    const u0 = side * 0.4, y0 = 0.0;
    const c = P(u0, y0);
    if (c.vis < -0.05) return;
    const lid = U.clamp(st.lid == null ? 0.8 : st.lid, 0, 1);
    const sm = st.smile || 0;
    const inner = P(u0 - side * 0.17, y0 - 0.01), outer = P(u0 + side * 0.18, y0 + 0.01);
    const topY = y0 + 0.11 * lid - sm * 0.02, botY = y0 - 0.06 + sm * 0.03;
    const top = P(u0 - side * 0.02, topY), bot = P(u0, botY);
    const fs = c.fs;
    // göz akı
    ctx.save();
    ctx.beginPath(); ctx.moveTo(inner.x, inner.y);
    ctx.quadraticCurveTo(top.x, top.y + 0.05 * lid, outer.x, outer.y);
    ctx.quadraticCurveTo(bot.x, bot.y - 0.02, inner.x, inner.y); ctx.closePath();
    ctx.fillStyle = L.c([215, 205, 198], 0.1); ctx.fill();
    ctx.clip();
    // iris
    const gx = (st.gazeX || 0) * 0.07, gy = (st.gazeY || 0) * 0.04;
    const ir = P(u0 + gx, y0 + 0.005 + gy, 0.02);
    ctx.fillStyle = L.c(sp.eye || [80, 90, 95], 0.1);
    ctx.beginPath(); ctx.ellipse(ir.x, ir.y, 0.075 * Math.max(0.35, fs), 0.078, 0, 0, U.TAU); ctx.fill();
    ctx.fillStyle = 'rgba(10,8,8,0.95)';
    ctx.beginPath(); ctx.ellipse(ir.x, ir.y, 0.035 * Math.max(0.35, fs), 0.036, 0, 0, U.TAU); ctx.fill();
    // üst kapak gölgesi
    const lg = ctx.createLinearGradient(0, top.y + 0.04, 0, y0 - 0.02);
    lg.addColorStop(0, 'rgba(30,15,15,0.55)'); lg.addColorStop(1, 'rgba(30,15,15,0)');
    ctx.fillStyle = lg; ctx.fillRect(-2, -1, 4, 2);
    ctx.restore();
    // parıltı (ıslak göz)
    if (lid > 0.2) {
      ctx.fillStyle = `rgba(255,250,240,${0.55 * (st.glint == null ? 1 : st.glint)})`;
      ctx.beginPath(); ctx.arc(ir.x + 0.02, ir.y + 0.025, 0.014, 0, U.TAU); ctx.fill();
    }
    // üst kapak çizgisi + kirpik
    ctx.strokeStyle = 'rgba(25,12,10,0.9)'; ctx.lineWidth = Math.max(px * 2.0, 0.028); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(inner.x, inner.y); ctx.quadraticCurveTo(top.x, top.y + 0.05 * lid, outer.x, outer.y + 0.005); ctx.stroke();
    // kapak kıvrımı
    ctx.strokeStyle = 'rgba(60,30,25,0.45)'; ctx.lineWidth = Math.max(px * 1.2, 0.014);
    const cr = P(u0, topY + 0.08 + (sp.tired || 0) * -0.02);
    ctx.beginPath(); ctx.moveTo(P(u0 - side * 0.14, y0 + 0.07).x, y0 + 0.07); ctx.quadraticCurveTo(cr.x, cr.y + 0.03, P(u0 + side * 0.18, y0 + 0.05).x, y0 + 0.05); ctx.stroke();
    // alt kapak
    ctx.strokeStyle = 'rgba(80,40,35,0.4)';
    ctx.beginPath(); ctx.moveTo(inner.x, inner.y); ctx.quadraticCurveTo(bot.x, bot.y - 0.02, outer.x, outer.y); ctx.stroke();
  }

  function drawBrow(ctx, pr, sp, st, side, L, px) {
    const P = pr.P;
    const bIn = st.browIn || 0, b = st.brow || 0, k = st.knit || 0;
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      const u = side * U.lerp(0.12 + k * -0.03, 0.66, f);
      const arch = Math.sin(f * Math.PI) * 0.05;
      const y = 0.24 + arch + b * 0.06 + bIn * 0.09 * (1 - f) * (1 - f) - k * 0.05 * (1 - f) - (sp.browLow || 0);
      const p = P(u, y, 0.03); if (p.vis > -0.15) pts.push({ ...p, w: U.lerp(0.075, 0.03, f) });
    }
    if (pts.length < 2) return;
    ctx.fillStyle = L.c(sp.browCol || sp.hair, -0.1);
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) ctx[i ? 'lineTo' : 'moveTo'](pts[i].x, pts[i].y + pts[i].w * 0.5);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y - pts[i].w * 0.5);
    ctx.closePath(); ctx.fill();
  }

  function drawCrown(ctx, pr, L, px) {
    const P = pr.P;
    const pts = [];
    for (let i = 0; i <= 24; i++) { const u = U.lerp(-1, 1, i / 24); const p = P(u * 0.98, 0.95, 0.07); p.y -= Math.max(0, p.vis) * 0.14 - 0.05; pts.push(p); }
    const vis = pts.filter((p) => p.vis > -0.25);
    if (vis.length < 2) return;
    const gold = [196, 150, 60];
    // bant
    ctx.beginPath();
    vis.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p.x, p.y - 0.02));
    for (let i = vis.length - 1; i >= 0; i--) ctx.lineTo(vis[i].x, vis[i].y + 0.17);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0.9, 0, 1.12);
    g.addColorStop(0, L.c(gold, -0.4)); g.addColorStop(0.5, L.c([235, 195, 100], 0.6)); g.addColorStop(1, L.c(gold, -0.2));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = L.c([110, 75, 25], -0.3); ctx.lineWidth = 0.02; ctx.stroke();
    // sade uçlar
    for (let i = 0; i < vis.length; i += 4) {
      const p = vis[i]; const h = 0.13 * U.clamp(p.vis + 0.3);
      ctx.beginPath(); ctx.moveTo(p.x - 0.05 * p.fs, p.y + 0.16); ctx.lineTo(p.x, p.y + 0.16 + h); ctx.lineTo(p.x + 0.05 * p.fs, p.y + 0.16); ctx.closePath();
      ctx.fillStyle = L.c([220, 175, 85], 0.3); ctx.fill();
    }
  }

  function hoodPts(pr, ex) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const y = U.lerp(-0.6, 1.45, i / 12); pts.push({ x: pr.sil(y).l - ex * (0.9 + 0.2 * (i / 12)), y }); }
    pts.push({ x: pr.sil(1.3).l * 0.4, y: 1.45 + ex * 1.1 });
    pts.push({ x: pr.sil(1.0).r * 0.6, y: 1.35 + ex * 0.8 });
    pts.push({ x: pr.sil(0.6).r + ex * 0.15, y: 0.95 });
    return pts;
  }
  function drawHoodBack(ctx, pr, sp, L) {
    const pts = hoodPts(pr, 0.28);
    pts.push({ x: pr.sil(0.2).r * 0.6, y: 0.1 }); pts.push({ x: pr.sil(-1.0).r * 0.6, y: -1.4 }); pts.push({ x: pr.sil(-1.0).l - 0.3, y: -1.9 });
    ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.4);
    ctx.fillStyle = L.c(U.scale(sp.hoodCol, 0.6), -0.4); ctx.fill();
  }
  function drawHoodFront(ctx, pr, sp, L) {
    // kukuletanın yüzü çevreleyen kenarı (yanak hizasına kadar)
    const P = pr.P; const col = sp.hoodCol;
    const outer = hoodPts(pr, 0.3);
    const inner = [];
    for (let i = 0; i <= 10; i++) { const y = U.lerp(-0.7, 1.3, i / 10); inner.push({ x: pr.sil(y).l * 0.75 - 0.02, y }); }
    inner.push(P(-0.2, 1.22)); inner.push(P(0.4, 1.1)); inner.push({ x: pr.sil(0.95).r + 0.02, y: 0.95 });
    ctx.beginPath();
    U.smoothPath(ctx, outer, false, 0.4);
    ctx.lineTo(inner[inner.length - 1].x, inner[inner.length - 1].y);
    for (let i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i].x, inner[i].y);
    ctx.lineTo(outer[0].x, outer[0].y - 0.4); ctx.closePath();
    const g = ctx.createLinearGradient(pr.sil(0).l - 0.3, 0, pr.sil(0).r, 0);
    g.addColorStop(0, L.c(col, -0.6)); g.addColorStop(0.7, L.c(col, 0.15)); g.addColorStop(1, L.c(col, 0.4));
    ctx.fillStyle = g; ctx.fill();
  }

  function drawFrost(ctx, pr, sp, frost, px) {
    const r = U.rng(991 + (sp.seed || 1));
    ctx.save(); silhouettePath(ctx, pr, 0.15); ctx.clip();
    ctx.fillStyle = `rgba(235,242,255,${0.55 * frost})`;
    const n = 380;
    for (let i = 0; i < n; i++) {
      const x = U.lerp(-1.4, 1.4, r()), y = U.lerp(-1.8, 1.6, r());
      // kırağı daha çok saç, kaş, sakalda toplanır
      const onHair = y > 0.7 || y < -0.6 || (y > 0.15 && y < 0.35);
      if (!onHair && r() > 0.25) continue;
      ctx.beginPath(); ctx.arc(x, y, Math.max(px * 0.9, 0.012) * (0.6 + r()), 0, U.TAU); ctx.fill();
    }
    ctx.restore();
  }

  return { draw, prof, makeProj };
})();
if (typeof module !== 'undefined') module.exports = HEAD;
