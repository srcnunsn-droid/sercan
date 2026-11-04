// İNSAN FİGÜRÜ — iskelet (RIG) üzerine kıyafet katmanları, eller, eşyalar.
// Çizim, dünya koordinatlı (y yukarı) bir ctx üzerine yapılır. Yerel çerçeve: +x = yüzün baktığı yön.
'use strict';
const FIG = (() => {
  const B = RIG.B;

  // Işık: amb (çarpan), lift (eklenen), kx (yerel anahtar ışık yönü)
  function makeLight(env, dir) {
    const amb = env.amb || [1, 1, 1], lift = env.lift || [0, 0, 0];
    const kx = (env.keyX || -1) * dir;
    return {
      kx,
      c(b, k = 0) {
        const m = 1 + 0.36 * k;
        return U.rgba([b[0] * amb[0] * m + lift[0], b[1] * amb[1] * m + lift[1], b[2] * amb[2] * m + lift[2]]);
      },
      raw(b, k = 0) { const m = 1 + 0.36 * k; return [b[0] * amb[0] * m + lift[0], b[1] * amb[1] * m + lift[1], b[2] * amb[2] * m + lift[2]]; },
    };
  }

  // Konik kapsül (uzuv) — eksene dik gradyanla hacim
  function capsule(ctx, a, b, r1, r2, col, L, opt = {}) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1e-6;
    const nx = -dy / len, ny = dx / len;
    const ang = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(a.x + nx * r1, a.y + ny * r1);
    ctx.lineTo(b.x + nx * r2, b.y + ny * r2);
    ctx.arc(b.x, b.y, r2, ang + Math.PI / 2, ang - Math.PI / 2, true);
    ctx.lineTo(a.x - nx * r1, a.y - ny * r1);
    ctx.arc(a.x, a.y, r1, ang - Math.PI / 2, ang + Math.PI / 2, true);
    ctx.closePath();
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, r = Math.max(r1, r2);
    // ışık tarafı: normalin ışık yönüyle uyumu
    const s = Math.sign(nx * L.kx + ny * 0.6) || 1;
    const g = ctx.createLinearGradient(m.x - nx * r * s, m.y - ny * r * s, m.x + nx * r * s, m.y + ny * r * s);
    g.addColorStop(0, L.c(col, -0.75)); g.addColorStop(0.45, L.c(col, 0)); g.addColorStop(0.85, L.c(col, 0.45)); g.addColorStop(1, L.c(col, 0.15));
    ctx.fillStyle = g; ctx.fill();
    if (opt.folds) {
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = r * 0.12;
      for (let i = 0; i < opt.folds; i++) {
        const f = (i + 0.5) / opt.folds; const p = { x: a.x + dx * f, y: a.y + dy * f };
        ctx.beginPath(); ctx.moveTo(p.x + nx * r, p.y + ny * r); ctx.quadraticCurveTo(p.x + dx * 0.08, p.y + dy * 0.08, p.x - nx * r * 0.6, p.y - ny * r * 0.6 + dy * 0.05); ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Bot / ayak
  function foot(ctx, A, ang, heel, col, L, kneel) {
    ctx.save(); ctx.translate(A.x, A.y);
    // topuk kalkınca ayak ucu etrafında döner
    const rot = ang + heel * 3.2;
    ctx.rotate(-rot);
    const h = B.ankleH;
    ctx.beginPath();
    ctx.moveTo(-0.045, 0.06);
    ctx.lineTo(-0.06, -h + 0.025);
    ctx.quadraticCurveTo(-0.062, -h, -0.03, -h);
    ctx.lineTo(B.footFwd - 0.02, -h);
    ctx.quadraticCurveTo(B.footFwd + 0.035, -h + 0.005, B.footFwd + 0.02, -h + 0.04);
    ctx.quadraticCurveTo(B.footFwd - 0.04, -h + 0.075, 0.05, -0.0);
    ctx.lineTo(0.045, 0.07); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0.06, 0, -h);
    g.addColorStop(0, L.c(col, 0.0)); g.addColorStop(0.7, L.c(col, 0.25)); g.addColorStop(1, L.c(col, -0.6));
    ctx.fillStyle = g; ctx.fill();
    // taban
    ctx.fillStyle = L.c(U.scale(col, 0.45), -0.3);
    ctx.fillRect(-0.06, -h, B.footFwd + 0.07, 0.014);
    // çatlak deri izi
    ctx.strokeStyle = 'rgba(20,10,5,0.35)'; ctx.lineWidth = 0.004;
    ctx.beginPath(); ctx.moveTo(0.02, -0.03); ctx.quadraticCurveTo(0.08, -0.025, 0.12, -0.045); ctx.stroke();
    ctx.restore();
  }

  // ELLER — yerel el çerçevesi: +x parmak yönü, +y başparmak/üst taraf
  function hand(ctx, W, ang, mode, sp, L, opt = {}) {
    ctx.save(); ctx.translate(W.x, W.y);
    // açı (0=aşağı) → el ekseni
    ctx.rotate(Math.atan2(-Math.cos(ang), Math.sin(ang)));
    if (opt.flip) ctx.scale(1, -1);
    const gc = sp.glove || sp.skin;
    const g = ctx.createLinearGradient(0, 0.05, 0, -0.05);
    g.addColorStop(0, L.c(gc, 0.45)); g.addColorStop(0.5, L.c(gc, 0)); g.addColorStop(1, L.c(gc, -0.7));
    ctx.fillStyle = g;
    ctx.strokeStyle = L.c(U.scale(gc, 0.45), -0.5); ctx.lineWidth = 0.004;
    if (mode === 'fist' || mode === 'pinch' || mode === 'grip') {
      // yumruk: avuç + kıvrık parmak dizisi
      ctx.beginPath();
      ctx.moveTo(0.0, 0.042); ctx.quadraticCurveTo(0.05, 0.058, 0.1, 0.045);
      ctx.quadraticCurveTo(0.125, 0.04, 0.122, 0.0);
      ctx.quadraticCurveTo(0.12, -0.045, 0.085, -0.05);
      ctx.lineTo(0.02, -0.045); ctx.quadraticCurveTo(-0.01, -0.04, 0.0, 0.0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // parmak boğumları
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      for (let i = 1; i <= 3; i++) { const y = 0.045 - i * 0.024; ctx.beginPath(); ctx.moveTo(0.085, y); ctx.quadraticCurveTo(0.112, y - 0.004, 0.118, y - 0.008); ctx.stroke(); }
      // başparmak
      ctx.fillStyle = L.c(gc, 0.2);
      ctx.beginPath(); ctx.moveTo(0.015, 0.04); ctx.quadraticCurveTo(0.055, 0.075, 0.095, 0.052); ctx.quadraticCurveTo(0.1, 0.04, 0.085, 0.035); ctx.quadraticCurveTo(0.05, 0.045, 0.02, 0.025); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (sp.tornGlove) { // yırtık işaret parmağı ucu
        ctx.fillStyle = L.c(sp.skin, 0.1);
        ctx.beginPath(); ctx.ellipse(0.116, 0.022, 0.009, 0.007, 0, 0, U.TAU); ctx.fill();
      }
      if (mode === 'pinch' && opt.item === 'charcoal') {
        ctx.fillStyle = '#141212';
        ctx.beginPath(); ctx.moveTo(0.11, 0.035); ctx.lineTo(0.15, 0.045); ctx.lineTo(0.155, 0.028); ctx.lineTo(0.115, 0.018); ctx.closePath(); ctx.fill();
      }
    } else if (mode === 'open' || mode === 'flat') {
      ctx.beginPath();
      ctx.moveTo(0, 0.04); ctx.lineTo(0.09, 0.045); ctx.quadraticCurveTo(0.17, 0.04, 0.185, 0.015);
      ctx.quadraticCurveTo(0.19, -0.02, 0.16, -0.03); ctx.lineTo(0.08, -0.04); ctx.quadraticCurveTo(0.0, -0.04, 0, 0.0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      for (let i = 0; i < 3; i++) { const y = 0.028 - i * 0.02; ctx.beginPath(); ctx.moveTo(0.1, y); ctx.lineTo(0.175, y - 0.006); ctx.stroke(); }
      ctx.fillStyle = L.c(gc, 0.25);
      ctx.beginPath(); ctx.moveTo(0.02, 0.035); ctx.quadraticCurveTo(0.06, 0.08, 0.1, 0.07); ctx.quadraticCurveTo(0.09, 0.05, 0.06, 0.035); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (mode === 'paper') {
      // belgeyi tutan el: başparmak üstte
      ctx.beginPath();
      ctx.moveTo(0, 0.04); ctx.quadraticCurveTo(0.08, 0.05, 0.13, 0.03); ctx.quadraticCurveTo(0.15, 0.0, 0.12, -0.03);
      ctx.lineTo(0.05, -0.045); ctx.quadraticCurveTo(0, -0.04, 0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = L.c(gc, 0.25);
      ctx.beginPath(); ctx.moveTo(0.03, 0.04); ctx.quadraticCurveTo(0.09, 0.07, 0.14, 0.055); ctx.quadraticCurveTo(0.12, 0.04, 0.08, 0.035); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      // gevşek / kıvrık el (eldiven)
      ctx.beginPath();
      ctx.moveTo(0, 0.04); ctx.quadraticCurveTo(0.07, 0.05, 0.12, 0.04);
      ctx.quadraticCurveTo(0.16, 0.03, 0.165, 0.0); ctx.quadraticCurveTo(0.16, -0.035, 0.13, -0.035);
      ctx.quadraticCurveTo(0.1, -0.03, 0.09, -0.045); ctx.lineTo(0.03, -0.045); ctx.quadraticCurveTo(0, -0.04, 0, 0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      for (let i = 0; i < 3; i++) { const y = 0.025 - i * 0.02; ctx.beginPath(); ctx.moveTo(0.09, y); ctx.quadraticCurveTo(0.14, y, 0.155, y - 0.012); ctx.stroke(); }
      ctx.fillStyle = L.c(gc, 0.2);
      ctx.beginPath(); ctx.moveTo(0.02, 0.035); ctx.quadraticCurveTo(0.05, 0.075, 0.095, 0.065); ctx.quadraticCurveTo(0.09, 0.045, 0.06, 0.035); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (sp.tornGlove) { ctx.fillStyle = L.c(sp.skin, 0.1); ctx.beginPath(); ctx.ellipse(0.155, 0.02, 0.008, 0.006, 0, 0, U.TAU); ctx.fill(); }
    }
    // manşet
    ctx.fillStyle = L.c(U.scale(gc, 0.8), -0.2);
    ctx.beginPath(); ctx.moveTo(-0.035, 0.048); ctx.lineTo(0.012, 0.05); ctx.lineTo(0.012, -0.05); ctx.lineTo(-0.035, -0.048); ctx.closePath(); ctx.fill();
    if (sp.furCuff) { ctx.fillStyle = L.c(sp.fur, 0.1); ctx.beginPath(); ctx.ellipse(-0.02, 0, 0.03, 0.058, 0, 0, U.TAU); ctx.fill(); }
    ctx.restore();
  }

  function spear(ctx, a, b, L) {
    // a: alt uç, b: üst uç (yerel)
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const r = 0.016;
    ctx.beginPath();
    ctx.moveTo(a.x + nx * r, a.y + ny * r); ctx.lineTo(b.x + nx * r * 0.9, b.y + ny * r * 0.9);
    ctx.lineTo(b.x - nx * r * 0.9, b.y - ny * r * 0.9); ctx.lineTo(a.x - nx * r, a.y - ny * r); ctx.closePath();
    const g = ctx.createLinearGradient(a.x + nx * r, a.y + ny * r, a.x - nx * r, a.y - ny * r);
    g.addColorStop(0, L.c([150, 112, 72], 0.5)); g.addColorStop(0.5, L.c([118, 86, 55], 0)); g.addColorStop(1, L.c([70, 50, 32], -0.4));
    ctx.fillStyle = g; ctx.fill();
    // demir uç (yaprak biçimli)
    const t0 = b, tl = 0.24;
    const tip = { x: t0.x + ux * tl, y: t0.y + uy * tl };
    ctx.beginPath();
    ctx.moveTo(t0.x + nx * 0.02, t0.y + ny * 0.02);
    ctx.quadraticCurveTo(t0.x + ux * 0.1 + nx * 0.045, t0.y + uy * 0.1 + ny * 0.045, tip.x, tip.y);
    ctx.quadraticCurveTo(t0.x + ux * 0.1 - nx * 0.045, t0.y + uy * 0.1 - ny * 0.045, t0.x - nx * 0.02, t0.y - ny * 0.02);
    ctx.closePath();
    const ig = ctx.createLinearGradient(t0.x + nx * 0.04, t0.y + ny * 0.04, t0.x - nx * 0.04, t0.y - ny * 0.04);
    ig.addColorStop(0, L.c([170, 175, 185], 0.6)); ig.addColorStop(0.5, L.c([110, 112, 120], 0)); ig.addColorStop(1, L.c([50, 52, 58], -0.4));
    ctx.fillStyle = ig; ctx.fill();
    // soket
    ctx.fillStyle = L.c([60, 60, 66], 0);
    ctx.beginPath(); ctx.moveTo(t0.x + nx * 0.022, t0.y + ny * 0.022); ctx.lineTo(t0.x - ux * 0.07 + nx * 0.019, t0.y - uy * 0.07 + ny * 0.019);
    ctx.lineTo(t0.x - ux * 0.07 - nx * 0.019, t0.y - uy * 0.07 - ny * 0.019); ctx.lineTo(t0.x - nx * 0.022, t0.y - ny * 0.022); ctx.closePath(); ctx.fill();
  }

  // ---------------- ANA FİGÜR ----------------
  function draw(ctx, sp, pose, env) {
    const dir = pose.dir || 1;
    const z = pose.z || 0;
    const s = RIG.depthScale(z) * (sp.size || 1);
    const gy = RIG.groundY(z);
    const L = makeLight(env, dir);
    const t = env.t || 0;
    ctx.save();
    ctx.translate(pose.x, gy + (pose.dy || 0));
    ctx.scale(dir * s, s);
    // dünya hedeflerini yerele çevir
    const toL = (p) => ({ x: (p.x - pose.x) / (dir * s), y: (p.y - gy - (pose.dy || 0)) / s });
    const P = JSON.parse(JSON.stringify(pose));
    for (const side of ['near', 'far']) {
      if (P.arms && P.arms[side] && P.arms[side].ikW) P.arms[side].ik = toL(P.arms[side].ikW);
      if (P.legs && P.legs[side] && P.legs[side].ikW) P.legs[side].ik = toL(P.legs[side].ikW);
    }
    // titreme: omuz/kollara küçük, düzensiz sarsıntı (tekrarlayan döngü değil)
    const sh = pose.shiver || 0;
    if (sh > 0) {
      const n1 = U.fbm1(t * 11.3 + (sp.seed || 0)), n2 = U.fbm1(t * 9.1 + 40), n3 = U.fbm1(t * 2.1 + 7);
      const burst = 0.55 + 0.45 * Math.max(0, n3);
      P.shrug = (P.shrug || 0) + sh * 0.01 * (0.6 + n3);
      P.lean = (P.lean || 0) + sh * 0.006 * n1 * burst;
      for (const side of ['near', 'far']) {
        const a = P.arms && P.arms[side];
        if (a && a.ik) { a.ik.x += sh * 0.004 * n2 * burst; a.ik.y += sh * 0.004 * n1 * burst; }
        if (a && a.upper != null) a.upper += sh * 0.03 * n2 * burst;
      }
      P.neck = (P.neck || 0) + sh * 0.01 * n2;
    }
    const J = RIG.solve(P);
    const wind = (env.wind || 0) * dir;
    const gust = 0.6 + 0.4 * U.fbm1(t * 0.7 + 3);

    // zemin gölgesi
    if (!env.noShadow) {
      const fx = (J.leg.near.A.x + J.leg.far.A.x) / 2 + 0.05;
      const sg = ctx.createRadialGradient(fx, 0, 0, fx, 0, 0.5);
      sg.addColorStop(0, `rgba(0,0,10,${0.35 * (env.shadow == null ? 1 : env.shadow)})`); sg.addColorStop(1, 'rgba(0,0,10,0)');
      ctx.fillStyle = sg; ctx.save(); ctx.scale(1, 0.18); ctx.beginPath(); ctx.arc(fx, 0, 0.5, 0, U.TAU); ctx.fill(); ctx.restore();
    }

    const tp = (tx, ty) => RIG.torsoPt(J.hip, J.lean, tx, ty);
    const bth = 1 + 0.012 * Math.sin((t / (pose.breathPeriod || 3.7)) * U.TAU + (pose.breathPhase || 0));
    const cloak = sp.cloak;
    const hemY = cloak ? Math.max(0.03, cloak.hem + (pose.cloakHemDY || 0)) : 0;

    // 1) pelerin arka paneli
    if (cloak) {
      const hipX = J.hip.x;
      const flutter = (k) => U.fbm1(t * 1.7 + k * 1.3 + (sp.seed || 0)) * 0.05 * (cloak.light || 1);
      const back = -0.26 - cloak.thick * 0.05 + wind * 0.13 * gust + flutter(1);
      const front = 0.02 + wind * 0.1 * gust + flutter(2);
      const nh = Math.max(4, 7);
      const pts = [tp(-0.05, B.torso + 0.03 * bth), tp(-0.13, B.torso - 0.0), tp(-0.19 - cloak.thick * 0.02, B.torso - 0.09), tp(-0.2 - cloak.thick * 0.025, 0.3), tp(-0.22 - cloak.thick * 0.03, 0.08)];
      const sitting = J.hip.y < 0.6;
      if (sitting) {
        pts.push({ x: hipX - 0.32, y: Math.max(0.04, J.hip.y - 0.1) });
        pts.push({ x: hipX - 0.1, y: 0.03 });
        pts.push({ x: Math.max(J.leg.near.K.x, J.leg.far.K.x), y: 0.05 });
      } else {
        for (let i = 0; i <= nh; i++) {
          const f = i / nh;
          const x = hipX + U.lerp(back, front, f);
          const wave = Math.sin(f * 9 + t * 2.3) * 0.012 * (1 + Math.abs(wind)) + flutter(i + 4) * 0.4;
          pts.push({ x, y: Math.max(0.02, hemY + wave + (1 - f) * wind * 0.04 * gust) });
        }
      }
      pts.push(tp(0.04, 0.12)); pts.push(tp(0.1, B.torso - 0.03));
      ctx.beginPath(); U.smoothPath(ctx, pts, true, 0.45);
      const g = ctx.createLinearGradient(hipX - 0.3 * L.kx, 0, hipX + 0.3 * L.kx, 0);
      g.addColorStop(0, L.c(U.scale(cloak.col, 0.7), -0.7)); g.addColorStop(1, L.c(U.scale(cloak.col, 0.85), -0.1));
      ctx.fillStyle = g; ctx.fill();
      // iç kıvrımlar
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.012;
      for (let i = 0; i < 4; i++) {
        const top = tp(-0.15 + i * 0.05, 0.35);
        ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.quadraticCurveTo(hipX - 0.2 + i * 0.07 + wind * 0.05, 0.6, hipX - 0.24 + i * 0.08 + wind * 0.1, hemY); ctx.stroke();
      }
      ctx.restore();
    }

    // 2) uzak kol
    drawArm(ctx, J.arm.far, sp, L, -0.18);
    // 3) bacaklar
    drawLeg(ctx, J.leg.far, sp, L, -0.2);
    drawLeg(ctx, J.leg.near, sp, L, 0);

    // 4) gövde (tunik)
    const tun = sp.tunic;
    const torsoPts = [
      tp(-0.05, B.torso + 0.035), tp(-0.115, B.torso - 0.004), tp(-0.165, B.torso - 0.075), tp(-0.152, 0.36 * bth), tp(-0.132, 0.2), tp(-0.122, 0.04),
      tp(0.112, 0.04), tp(0.12, 0.19), tp(0.128 + (sp.belly || 0), 0.3), tp(0.135 * bth, 0.4), tp(0.135, B.torso - 0.07), tp(0.09, B.torso - 0.0), tp(0.04, B.torso + 0.03),
    ];
    // etek
    const kn = J.leg.near.K, kf = J.leg.far.K, an = J.leg.near.A, af = J.leg.far.A;
    const long = sp.robe;
    let hY = long ? Math.max(0.1, Math.min(an.y, af.y) + 0.06) : Math.min(kn.y, kf.y) + 0.06;
    const kneeling = J.hip.y < 0.62;
    if (kneeling) hY = Math.max(0.03, Math.min(kn.y, kf.y) + 0.02);
    const fx = long ? Math.max(an.x, af.x, kn.x) + 0.08 : Math.max(kn.x, kf.x) + 0.07;
    const bx = long ? Math.min(an.x, af.x, J.hip.x - 0.12) - 0.09 : Math.min(kn.x, kf.x, J.hip.x - 0.08) - 0.08;
    const sway = U.fbm1(t * 1.3 + 9) * 0.015 + wind * 0.02;
    const skirt = [tp(-0.125, 0.06), tp(0.113, 0.06), { x: fx + sway, y: hY + 0.02 }, { x: (fx + bx) / 2 + sway, y: hY - 0.005 }, { x: bx + sway, y: hY + 0.015 }];
    ctx.beginPath(); U.smoothPath(ctx, skirt, true, 0.25);
    let g = ctx.createLinearGradient(bx, 0, fx, 0);
    if (L.kx < 0) { g = ctx.createLinearGradient(fx, 0, bx, 0); }
    g.addColorStop(0, L.c(tun, -0.65)); g.addColorStop(0.6, L.c(tun, 0)); g.addColorStop(1, L.c(tun, 0.3));
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 0.01;
    for (let i = 0; i < 5; i++) { const x0 = U.lerp(bx, fx, (i + 0.5) / 5); const top = tp(U.lerp(-0.1, 0.1, (i + 0.5) / 5), 0.05); ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.quadraticCurveTo((top.x + x0) / 2 + 0.01, (top.y + hY) / 2, x0 + sway, hY); ctx.stroke(); }
    if (sp.hemFray) { ctx.strokeStyle = 'rgba(30,25,20,0.5)'; ctx.lineWidth = 0.006; for (let i = 0; i < 14; i++) { const x = U.lerp(bx, fx, i / 13); ctx.beginPath(); ctx.moveTo(x, hY + 0.01); ctx.lineTo(x + 0.004, hY - 0.012 - U.hash(i) * 0.01); ctx.stroke(); } }
    ctx.restore();
    // gövde üst
    ctx.beginPath(); U.smoothPath(ctx, torsoPts, true, 0.4);
    const tg = ctx.createLinearGradient(tp(-0.14, 0.3).x, tp(-0.14, 0.3).y, tp(0.13, 0.3).x, tp(0.13, 0.3).y);
    const lk = L.kx > 0;
    tg.addColorStop(0, L.c(tun, lk ? -0.7 : 0.35)); tg.addColorStop(0.55, L.c(tun, 0)); tg.addColorStop(1, L.c(tun, lk ? 0.4 : -0.6));
    ctx.fillStyle = tg; ctx.fill();
    if (sp.embroidery) { // yaka işlemesi
      ctx.strokeStyle = L.c([180, 140, 70], 0.2); ctx.lineWidth = 0.008;
      const a = tp(0.03, B.torso), b = tp(0.08, B.torso - 0.14), c = tp(0.115, B.torso - 0.02);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      const d = tp(0.1, 0.2), e = tp(0.1, 0.08); ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    }
    // kemer
    if (sp.belt) {
      const b1 = tp(-0.128, 0.035), b2 = tp(0.118, 0.035), b3 = tp(0.118, 0.085), b4 = tp(-0.13, 0.085);
      ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y); ctx.closePath();
      ctx.fillStyle = L.c(sp.belt, 0); ctx.fill();
      const bk = tp(0.09, 0.06);
      ctx.strokeStyle = L.c(sp.buckle || [130, 130, 135], 0.5); ctx.lineWidth = 0.008;
      ctx.strokeRect(bk.x - 0.022, bk.y - 0.025, 0.04, 0.05);
      // sarkan kemer ucu
      ctx.strokeStyle = L.c(sp.belt, -0.2); ctx.lineWidth = 0.022;
      ctx.beginPath(); ctx.moveTo(bk.x - 0.01, bk.y - 0.02); ctx.quadraticCurveTo(bk.x - 0.005 + sway, bk.y - 0.12, bk.x - 0.012 + sway * 2, bk.y - 0.2); ctx.stroke();
    }

    // 5) pelerin ön (yakın omuz örtüsü)
    if (cloak) {
      const sitting = J.hip.y < 0.6;
      const hn = sitting ? Math.max(0.05, J.hip.y - 0.05) : hemY + 0.02;
      const w2 = wind * 0.06 * gust;
      const drape = [tp(0.035, B.torso + 0.02), tp(-0.05, B.torso + 0.04), tp(-0.13, B.torso + 0.008), tp(-0.185, B.torso - 0.08), tp(-0.19, 0.25),
        { x: J.hip.x - 0.2 + w2, y: hn + 0.03 }, { x: J.hip.x - 0.08 + w2 * 1.3, y: hn - 0.005 }, { x: J.hip.x - 0.0 + w2 * 1.5, y: hn + 0.015 },
        tp(0.0, 0.14), tp(0.018, 0.36)];
      ctx.beginPath(); U.smoothPath(ctx, drape, true, 0.4);
      const dg = ctx.createLinearGradient(tp(-0.17, 0.3).x, 0, tp(0.03, 0.3).x, 0);
      dg.addColorStop(0, L.c(cloak.col, lk ? -0.55 : 0.35)); dg.addColorStop(0.6, L.c(cloak.col, 0)); dg.addColorStop(1, L.c(cloak.col, lk ? 0.35 : -0.45));
      ctx.fillStyle = dg; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.01;
      for (let i = 0; i < 4; i++) { const a = tp(-0.13 + i * 0.035, B.torso - 0.05); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(a.x - 0.02 + w2, (a.y + hn) / 2, J.hip.x - 0.17 + i * 0.05 + w2 * 1.2, hn); ctx.stroke(); }
      // yıpranmış kenar ve yamalar (muhafız)
      if (cloak.worn) {
        ctx.fillStyle = 'rgba(40,35,30,0.22)';
        const pa = tp(-0.11, 0.22); ctx.beginPath(); ctx.ellipse(pa.x, pa.y, 0.035, 0.05, 0.3, 0, U.TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(30,25,20,0.45)'; ctx.lineWidth = 0.005;
        for (let i = 0; i < 10; i++) { const x = U.lerp(J.hip.x - 0.2, J.hip.x, i / 9) + w2; ctx.beginPath(); ctx.moveTo(x, hn + 0.01); ctx.lineTo(x + 0.003, hn - 0.015 - U.hash(i + 3) * 0.012); ctx.stroke(); }
      }
      ctx.restore();
      // omuz iğnesi
      if (cloak.pin) { const pp = tp(0.0, B.torso - 0.02); ctx.fillStyle = L.c([120, 120, 128], 0.5); ctx.beginPath(); ctx.arc(pp.x, pp.y, 0.017, 0, U.TAU); ctx.fill(); ctx.strokeStyle = L.c([60, 60, 65], -0.3); ctx.lineWidth = 0.004; ctx.stroke(); }
    }
    // kürk yaka
    if (sp.fur) {
      const fpts = [];
      const base = [tp(0.075, B.torso - 0.06), tp(0.075, B.torso + 0.03), tp(0.0, B.torso + 0.075), tp(-0.08, B.torso + 0.07), tp(-0.16, B.torso + 0.0), tp(-0.17, B.torso - 0.08), tp(-0.08, B.torso - 0.06), tp(0.0, B.torso - 0.09)];
      base.forEach((p, i) => fpts.push({ x: p.x + U.hash(i * 7.7) * 0.012, y: p.y + U.hash(i * 3.3) * 0.012 }));
      ctx.beginPath(); U.smoothPath(ctx, fpts, true, 0.5);
      const fg = ctx.createLinearGradient(0, tp(0, B.torso + 0.08).y, 0, tp(0, B.torso - 0.1).y);
      fg.addColorStop(0, L.c(sp.fur, 0.35)); fg.addColorStop(1, L.c(sp.fur, -0.6));
      ctx.fillStyle = fg; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.lineWidth = 0.006; ctx.lineCap = 'round';
      const r = U.rng(77);
      for (let i = 0; i < 90; i++) {
        const p = tp(U.lerp(-0.18, 0.09, r()), B.torso + U.lerp(-0.1, 0.09, r()));
        ctx.strokeStyle = L.c(U.mix(sp.fur, [220, 200, 170], r() * 0.4), r() - 0.4);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (r() - 0.5) * 0.02, p.y - 0.02 - r() * 0.015); ctx.stroke();
      }
      ctx.restore();
      if (sp.clasp) { const c = tp(0.07, B.torso - 0.05); ctx.fillStyle = L.c([210, 170, 80], 0.5); ctx.beginPath(); ctx.arc(c.x, c.y, 0.016, 0, U.TAU); ctx.fill(); }
    }
    // omuzlarda kar
    if (pose.snow > 0.01) {
      const sn = pose.snow;
      const a = tp(-0.17, B.torso - 0.06), b = tp(-0.1, B.torso + 0.035), c = tp(0.0, B.torso + 0.05), d = tp(0.07, B.torso + 0.0);
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(b.x, b.y + 0.035 * sn, c.x, c.y + 0.04 * sn, d.x, d.y + 0.012 * sn);
      ctx.bezierCurveTo(c.x, c.y - 0.01, b.x, b.y - 0.01, a.x, a.y);
      ctx.fillStyle = L.c([238, 242, 250], 0.5); ctx.globalAlpha = U.clamp(sn * 1.5); ctx.fill(); ctx.globalAlpha = 1;
    }

    // 6) boyun + baş
    capsule(ctx, tp(-0.005, B.torso - 0.03), J.neckTop, 0.058, 0.052, sp.skin, L);
    ctx.save();
    ctx.translate(J.head.x, J.head.y);
    ctx.rotate(-J.headAng);
    const R = 0.08;
    ctx.scale(R, R);
    HEAD.draw(ctx, sp.head, { ...(pose.face || {}), snow: pose.snow || 0, frost: pose.frost || 0 }, L, (env.px || 0.002) / (R * s));
    ctx.restore();

    // 7) yakın kol + eşyalar
    if (pose.spear) {
      const sa = pose.spear.a, sb = pose.spear.b;
      spear(ctx, pose.spear.local ? sa : toL(sa), pose.spear.local ? sb : toL(sb), L);
    }
    if (pose.doc && J.arm[pose.doc.hand || 'near']) drawDoc(ctx, J.arm[pose.doc.hand || 'near'], pose.doc, L);
    drawArm(ctx, J.arm.near, sp, L, 0.1, pose.arms && pose.arms.near);

    // kırağı (sabah): hafif soğuk ton + üst yüzeylerde ince kristaller
    if (pose.frost > 0.02) {
      ctx.globalCompositeOperation = 'source-atop';
      const fg = ctx.createLinearGradient(0, 1.6, 0, 0);
      fg.addColorStop(0, `rgba(205,220,240,${0.3 * pose.frost})`); fg.addColorStop(1, `rgba(205,220,240,${0.12 * pose.frost})`);
      ctx.fillStyle = fg; ctx.fillRect(-1, -0.2, 2, 2.2);
      const r = U.rng(4242);
      ctx.fillStyle = `rgba(245,250,255,${0.45 * pose.frost})`;
      const tops = [J.shoulder.near, J.shoulder.far, J.leg.near.K, J.leg.far.K, J.head, tp(0, B.torso)];
      for (let i = 0; i < 220; i++) {
        const c = tops[i % tops.length];
        const x = c.x + (r() - 0.5) * 0.22, y = c.y + (r() - 0.3) * 0.12;
        ctx.fillRect(x, y, 0.003 + r() * 0.004, 0.003);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    return J;
  }

  function drawArm(ctx, A, sp, L, shade, cfg) {
    const sc = sp.sleeve || sp.tunic;
    capsule(ctx, A.S, A.E, 0.055, 0.046, sc, L, { folds: 2 });
    capsule(ctx, A.E, A.W, 0.046, 0.037, sc, L, { folds: 2 });
    hand(ctx, A.W, A.handAng, A.hand, sp, L, { item: cfg && cfg.item, flip: cfg && cfg.flip });
  }
  function drawLeg(ctx, Lg, sp, L, shade) {
    capsule(ctx, Lg.H, Lg.K, 0.072, 0.054, sp.trousers, L, { folds: 1 });
    capsule(ctx, Lg.K, Lg.A, 0.054, 0.042, sp.trousers, L);
    // bot konçu
    const top = U.V.lerp(Lg.A, Lg.K, sp.bootH || 0.42);
    capsule(ctx, top, Lg.A, 0.05, 0.045, sp.boots, L);
    foot(ctx, Lg.A, Lg.footAng || 0, Lg.toe || 0, sp.boots, L);
  }
  function drawDoc(ctx, arm, doc, L) {
    ctx.save(); ctx.translate(arm.W.x, arm.W.y);
    ctx.rotate(doc.rot || 0.2);
    const w = 0.2, h = 0.27;
    ctx.fillStyle = L.c([225, 210, 175], 0.3);
    ctx.beginPath(); ctx.moveTo(0.02, -0.05); ctx.lineTo(0.02 + w, -0.04); ctx.lineTo(0.03 + w, -0.04 + h); ctx.lineTo(0.03, -0.05 + h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,0.5)'; ctx.lineWidth = 0.004;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(0.05, 0.0 + i * 0.03); ctx.lineTo(0.19, 0.003 + i * 0.03); ctx.stroke(); }
    ctx.fillStyle = L.c([140, 30, 30], 0.2); ctx.beginPath(); ctx.arc(0.12, -0.02, 0.018, 0, U.TAU); ctx.fill();
    ctx.restore();
  }

  // ---------------- YAKIN PLAN EL (1a: mızrak, 6b: kömür) ----------------
  // Dünya ölçeğinde (metre) ama çok daha ayrıntılı çizilir. o: {x,y, ang, shake, mode, L, t}
  function closeHand(ctx, o) {
    const L = o.L;
    const glove = [96, 70, 48], seam = [50, 34, 22];
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang || 0);
    if (o.mode === 'spear') {
      // kol yeni (yün kumaş) — sol alttan gelir
      sleeveCU(ctx, L, o);
      // parmaklar mızrağı sarar: mızrak yerel x=0'da dikey
      const fingers = [0.035, 0.012, -0.012, -0.035];
      // avuç arkası (elin sırtı)
      ctx.beginPath();
      ctx.moveTo(-0.075, 0.05); ctx.bezierCurveTo(-0.09, 0.02, -0.09, -0.04, -0.07, -0.06);
      ctx.lineTo(-0.02, -0.055); ctx.lineTo(-0.02, 0.055); ctx.closePath();
      let g = ctx.createLinearGradient(-0.09, 0, -0.02, 0);
      g.addColorStop(0, L.c(glove, -0.6)); g.addColorStop(1, L.c(glove, 0.2));
      ctx.fillStyle = g; ctx.fill();
      // parmak boğumları sap üzerinde
      fingers.forEach((fy, i) => {
        const y = fy;
        ctx.beginPath();
        ctx.moveTo(-0.025, y + 0.0115);
        ctx.bezierCurveTo(0.0, y + 0.014, 0.028, y + 0.012, 0.03, y);
        ctx.bezierCurveTo(0.028, y - 0.012, 0.0, y - 0.014, -0.025, y - 0.0115);
        ctx.closePath();
        const fg = ctx.createLinearGradient(0, y + 0.012, 0, y - 0.012);
        fg.addColorStop(0, L.c(glove, 0.5)); fg.addColorStop(0.5, L.c(glove, 0.05)); fg.addColorStop(1, L.c(glove, -0.7));
        ctx.fillStyle = fg; ctx.fill();
        ctx.strokeStyle = L.c(seam, -0.4); ctx.lineWidth = 0.0012; ctx.stroke();
        // eskime
        ctx.fillStyle = `rgba(160,130,100,${0.15 + 0.1 * U.hash(i)})`;
        ctx.beginPath(); ctx.ellipse(0.012, y + 0.004, 0.008, 0.003, 0, 0, U.TAU); ctx.fill();
        // dikiş noktaları
        ctx.fillStyle = 'rgba(30,18,10,0.6)';
        for (let k = 0; k < 6; k++) ctx.fillRect(-0.02 + k * 0.007, y + 0.0105, 0.0022, 0.0009);
      });
      // yırtık işaret parmağı ucu (en üstteki parmak): deri görünür
      ctx.fillStyle = L.c([190, 140, 118], 0.2);
      ctx.beginPath(); ctx.ellipse(0.026, 0.035, 0.007, 0.008, 0, 0, U.TAU); ctx.fill();
      ctx.strokeStyle = L.c([60, 40, 25], -0.3); ctx.lineWidth = 0.0013;
      ctx.beginPath(); ctx.moveTo(0.019, 0.044); ctx.lineTo(0.022, 0.04); ctx.lineTo(0.019, 0.036); ctx.lineTo(0.023, 0.031); ctx.lineTo(0.02, 0.026); ctx.stroke();
      // iplik saçakları
      ctx.strokeStyle = 'rgba(120,95,70,0.8)'; ctx.lineWidth = 0.0007;
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(0.02, 0.028 + k * 0.004); ctx.lineTo(0.024 + U.hash(k) * 0.006, 0.027 + k * 0.004 - 0.003); ctx.stroke(); }
      // başparmak sapın arkasından dolanır
      ctx.beginPath(); ctx.moveTo(-0.06, 0.055); ctx.bezierCurveTo(-0.03, 0.075, 0.01, 0.07, 0.018, 0.058); ctx.bezierCurveTo(0.012, 0.048, -0.02, 0.05, -0.05, 0.04); ctx.closePath();
      g = ctx.createLinearGradient(0, 0.075, 0, 0.04); g.addColorStop(0, L.c(glove, 0.45)); g.addColorStop(1, L.c(glove, -0.5));
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = L.c(seam, -0.4); ctx.lineWidth = 0.0012; ctx.stroke();
    } else if (o.mode === 'chalk') {
      sleeveCU(ctx, L, o);
      // kömürü tutan el (kıvrık parmaklar, işaret ve başparmak öne)
      ctx.beginPath();
      ctx.moveTo(-0.07, 0.04); ctx.bezierCurveTo(-0.03, 0.055, 0.02, 0.05, 0.05, 0.03);
      ctx.bezierCurveTo(0.075, 0.02, 0.085, 0.005, 0.08, -0.01);
      ctx.bezierCurveTo(0.06, -0.035, 0.0, -0.05, -0.07, -0.045); ctx.closePath();
      let g = ctx.createLinearGradient(0, 0.05, 0, -0.05);
      g.addColorStop(0, L.c(glove, 0.4)); g.addColorStop(0.5, L.c(glove, 0)); g.addColorStop(1, L.c(glove, -0.7));
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = L.c(seam, -0.4); ctx.lineWidth = 0.0013; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(0.0 + k * 0.012, -0.045 + k * 0.004); ctx.quadraticCurveTo(0.03 + k * 0.01, -0.02, 0.05 + k * 0.008, -0.012 + k * 0.006); ctx.stroke(); }
      // işaret parmağı (yırtık uç)
      ctx.beginPath(); ctx.moveTo(0.04, 0.03); ctx.bezierCurveTo(0.07, 0.035, 0.1, 0.03, 0.112, 0.022); ctx.bezierCurveTo(0.112, 0.012, 0.09, 0.01, 0.06, 0.012); ctx.closePath();
      ctx.fillStyle = L.c(glove, 0.15); ctx.fill(); ctx.stroke();
      ctx.fillStyle = L.c([188, 138, 118], 0.15); ctx.beginPath(); ctx.ellipse(0.108, 0.018, 0.006, 0.006, 0, 0, U.TAU); ctx.fill();
      // başparmak
      ctx.beginPath(); ctx.moveTo(0.02, 0.045); ctx.bezierCurveTo(0.05, 0.06, 0.085, 0.05, 0.1, 0.035); ctx.bezierCurveTo(0.09, 0.03, 0.06, 0.035, 0.04, 0.03); ctx.closePath();
      ctx.fillStyle = L.c(glove, 0.35); ctx.fill(); ctx.stroke();
      // kömür parçası
      ctx.fillStyle = '#121010';
      ctx.beginPath(); ctx.moveTo(0.1, 0.036); ctx.lineTo(0.135, 0.038); ctx.lineTo(0.142, 0.026); ctx.lineTo(0.105, 0.018); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,120,130,0.4)'; ctx.fillRect(0.11, 0.032, 0.02, 0.002);
    }
    ctx.restore();
  }
  function sleeveCU(ctx, L, o) {
    const wool = [78, 92, 70];
    ctx.beginPath();
    ctx.moveTo(-0.07, 0.07); ctx.bezierCurveTo(-0.14, 0.09, -0.3, 0.06, -0.42, 0.0);
    ctx.lineTo(-0.42, -0.16); ctx.bezierCurveTo(-0.3, -0.12, -0.14, -0.09, -0.07, -0.065); ctx.closePath();
    const g = ctx.createLinearGradient(0, 0.08, 0, -0.12);
    g.addColorStop(0, L.c(wool, 0.35)); g.addColorStop(0.5, L.c(wool, -0.05)); g.addColorStop(1, L.c(wool, -0.75));
    ctx.fillStyle = g; ctx.fill();
    // yün dokusu
    ctx.save(); ctx.clip();
    const r = U.rng(31);
    ctx.lineWidth = 0.0008;
    for (let i = 0; i < 700; i++) { const x = -0.42 + r() * 0.36, y = -0.15 + r() * 0.23; ctx.strokeStyle = `rgba(${r() < 0.5 ? '20,25,15' : '150,160,130'},${0.12 + r() * 0.15})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.006, y + (r() - 0.5) * 0.004); ctx.stroke(); }
    ctx.restore();
    // eldiven manşeti
    ctx.beginPath(); ctx.moveTo(-0.085, 0.065); ctx.quadraticCurveTo(-0.06, 0.0, -0.085, -0.065); ctx.lineTo(-0.055, -0.06); ctx.quadraticCurveTo(-0.035, 0, -0.055, 0.062); ctx.closePath();
    ctx.fillStyle = L.c([80, 58, 40], -0.1); ctx.fill();
    // yıpranmış iplikler
    ctx.strokeStyle = L.c([120, 130, 105], 0); ctx.lineWidth = 0.001;
    for (let i = 0; i < 9; i++) { const y = -0.06 + i * 0.015; ctx.beginPath(); ctx.moveTo(-0.08, y); ctx.quadraticCurveTo(-0.072, y + 0.004, -0.064 + U.hash(i) * 0.008, y - 0.006 + Math.sin((o.t || 0) * 3 + i) * 0.002); ctx.stroke(); }
  }

  return { draw, makeLight, capsule, hand, spear, closeHand };
})();
if (typeof module !== 'undefined') module.exports = FIG;
