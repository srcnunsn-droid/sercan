// İSKELET + KİNEMATİK
// Yerel koordinat: başlangıç = karakterin altındaki zemin noktası, +x = yüzünün baktığı yön, +y = yukarı (metre).
// Açılar: 0 = dik aşağı, + = ileri doğru dönüş.
'use strict';
if (typeof U === 'undefined' && typeof require !== 'undefined') globalThis.U = require('./util.js');
const RIG = (() => {
  const B = {            // kemik uzunlukları (1.75 m yetişkin erkek)
    torso: 0.53, neck: 0.04, headUp: 0.092,
    upperArm: 0.30, foreArm: 0.265, hand: 0.17,
    thigh: 0.445, shin: 0.43, ankleH: 0.075, footFwd: 0.19, heel: 0.055,
  };
  const ROOT_Y = 0.925;      // ayakta kalça yüksekliği
  const groundY = (z) => -0.30 * z;       // derinlik → ekrandaki zemin kayması (sahte perspektif)
  const depthScale = (z) => 1 + 0.07 * z;

  // Gövde çerçevesinden yerel koordinata
  function torsoPt(hip, lean, tx, ty) {
    const c = Math.cos(lean), s = Math.sin(lean);
    return { x: hip.x + tx * c + ty * s, y: hip.y - tx * s + ty * c };
  }
  const dirv = (a, l) => ({ x: Math.sin(a) * l, y: -Math.cos(a) * l });
  const angOf = (p, q) => Math.atan2(q.x - p.x, -(q.y - p.y)); // p→q açısı (0 = aşağı)

  // ---- Yürüyüş çözücü: ayak basma noktaları dünyada sabit (kayma yok) ----
  // walk: {t0,t1,x0,x1,z0,z1,dir,step,ease}
  const EASES = {
    def: (u) => U.EASE.io(u),
    // içeride: önce normal yürür, belgeyi alınca yavaşlar
    kingIn: (u) => { const a = 0.36; return u < a ? (u / a) * 0.42 : 0.42 + (1 - 0.42) * (1 - Math.pow(1 - (u - a) / (1 - a), 1.25)); },
  };
  function walkDist(w, t) {
    const u = U.clamp((t - w.t0) / (w.t1 - w.t0));
    const L = Math.abs(w.x1 - w.x0);
    const e = w.ease ? EASES[w.ease](u) : smoothWalk(u);
    return e * L;
  }
  // başta hızlanan, sonda yavaşlayan, ortada sabit hızlı profil
  function smoothWalk(u) {
    const a = 0.18; // hızlanma payı
    const vmax = 1 / (1 - a);
    if (u < a) return vmax * u * u / (2 * a);
    if (u > 1 - a) { const r = 1 - u; return 1 - vmax * r * r / (2 * a); }
    return vmax * (u - a / 2);
  }
  // Ayak planı: her ayak için basma anları sp_k = off + k*2S (kalça mesafesi), basma noktası P_k = sp_k + lead.
  // Salınım 0.8S boyunca P_{k-1} → P_k, kalan süre ayak dünyada sabit (destek fazı).
  function footPlan(w, s, off) {
    const S = w.step, cyc = 2 * S, lead = 0.55 * S, sw = 0.8 * S;
    const L = Math.abs(w.x1 - w.x0);
    const P = (k) => U.clamp(off + k * cyc + lead, 0, L);
    const k = Math.floor((s - off) / cyc) + 1;     // sıradaki basma indeksi
    const spNext = off + k * cyc;
    const swingStart = spNext - sw;
    if (s >= swingStart && P(k) > P(k - 1) + 1e-6) {
      const u = U.clamp((s - swingStart) / sw);
      return { d: U.lerp(P(k - 1), P(k), U.EASE.io(u)), lift: Math.sin(Math.PI * u) * 0.09, heel: (1 - u) * 0.04 * (u < 0.5 ? 1 : 0) };
    }
    // destek fazı: topuk kalkışı (son %30)
    const sp = off + (k - 1) * cyc;
    const heel = sp >= 0 && s < L - 1e-6 ? U.clamp((s - (sp + 1.2 * S - 0.35 * S)) / (0.35 * S)) * 0.05 : 0;
    return { d: P(k - 1), lift: 0, heel };
  }
  // Bir yürüyüşün t anındaki durumu (dünya koordinatı)
  function walkState(w, t) {
    const L = Math.abs(w.x1 - w.x0);
    const sgn = Math.sign(w.x1 - w.x0) || 1;
    const tc = Math.min(Math.max(t, w.t0), w.t1);
    const s = walkDist(w, tc);
    const S = w.step;
    const offs = { near: 0.8 * S, far: 1.8 * S };
    const done = t > w.t1, before = t < w.t0;
    const settle = U.EASE.io(U.clamp((t - w.t1) / 0.45));
    const out = { x: w.x0 + sgn * s, z: U.lerp(w.z0, w.z1, L > 0 ? s / L : 1), s, moving: before || done ? 0 : 1, feet: {} };
    for (const k of ['near', 'far']) {
      let f = footPlan(w, s, offs[k]);
      if (done && f.d < L - 0.005) { // geride kalan ayak yanına gelir
        f = { d: U.lerp(f.d, L, settle), lift: Math.sin(Math.PI * settle) * 0.07, heel: 0 };
      }
      out.feet[k] = { x: w.x0 + sgn * f.d, z: U.lerp(w.z0, w.z1, L > 0 ? f.d / L : 1), lift: f.lift, heel: f.heel };
    }
    const ph = (s / (2 * S)) * U.TAU;
    out.phase = ph;
    // hız (kol salınımı ve kalça alçalması için)
    const v = (walkDist(w, Math.min(w.t1, tc + 0.05)) - walkDist(w, Math.max(w.t0, tc - 0.05))) / 0.1;
    out.speed = v;
    const g = U.clamp(v / 0.9);
    out.bob = -0.05 * g - 0.015 * g * Math.cos(ph * 2);
    out.armSwing = Math.sin(ph) * g;
    // erişim sınırı: bacak hedefe yetişmiyorsa kalçayı indir (ayak kaymasın diye)
    const Lleg = (B.thigh + B.shin) * 0.985;
    for (const k of ['near', 'far']) {
      const f = out.feet[k];
      const dx = Math.abs(f.x - out.x) + 0.01;
      const ay = B.ankleH + f.lift + f.heel;
      const maxHip = ay + Math.sqrt(Math.max(0, Lleg * Lleg - dx * dx));
      out.bob = Math.min(out.bob, maxHip - ROOT_Y);
    }
    return out;
  }
  // Ses için: adım (topuk basma) zamanları
  function footstepTimes(w, dt = 1 / 240) {
    const times = [];
    const S = w.step, cyc = 2 * S, L = Math.abs(w.x1 - w.x0);
    let prev = walkDist(w, w.t0);
    for (let t = w.t0 + dt; t <= w.t1 + 1e-9; t += dt) {
      const s = walkDist(w, t);
      for (const off of [0.8 * S, 1.8 * S]) {
        const kPrev = Math.floor((prev - off) / cyc), kNow = Math.floor((s - off) / cyc);
        if (kNow > kPrev && off + kNow * cyc <= L) times.push(+t.toFixed(3));
      }
      prev = s;
    }
    times.push(+(w.t1 + 0.42).toFixed(3)); // toparlanma adımı
    return times;
  }

  // ---- Poz çözümü: poz nesnesinden eklem konumları (yerel) ----
  // pose: { hipY, hipDX, lean, neck, arms:{near:{...},far:{...}}, legs:{near:{...},far:{...}} }
  // kol: {ik:{x,y}} veya {upper, fore}; hand açı: handAng (mutlak), mod: hand
  // bacak: {ik:{x,y}} (ayak bileği hedefi) veya {thigh, shin}
  function solve(pose) {
    const hip = { x: pose.hipDX || 0, y: pose.hipY == null ? ROOT_Y : pose.hipY };
    const lean = pose.lean || 0;
    const J = { hip, lean };
    J.neckBase = torsoPt(hip, lean, -0.005, B.torso);
    const hl = lean + (pose.neck || 0);
    J.headAng = hl;
    J.neckTop = { x: J.neckBase.x + Math.sin(hl) * B.neck, y: J.neckBase.y + Math.cos(hl) * B.neck };
    J.head = { x: J.neckTop.x + Math.sin(hl) * B.headUp + Math.cos(hl) * 0.015, y: J.neckTop.y + Math.cos(hl) * B.headUp - Math.sin(hl) * 0.015 };
    const sh = pose.shrug || 0;
    J.shoulder = {
      near: torsoPt(hip, lean, -0.1, B.torso - 0.06 + sh),
      far: torsoPt(hip, lean, 0.075, B.torso - 0.05 + sh),
    };
    J.hipJ = { near: torsoPt(hip, lean, -0.035, -0.01), far: torsoPt(hip, lean, 0.035, 0.0) };
    J.arm = {}; J.leg = {};
    for (const side of ['near', 'far']) {
      const a = (pose.arms && pose.arms[side]) || {};
      const S0 = J.shoulder[side];
      let E, W;
      if (a.ik) {
        const r = U.ik2(S0, a.ik, B.upperArm, B.foreArm, a.bend || -1);
        E = r.J; W = r.E;
      } else {
        const up = a.upper == null ? 0.05 : a.upper, fo = a.fore == null ? 0.15 : a.fore;
        E = U.V.add(S0, dirv(up, B.upperArm));
        W = U.V.add(E, dirv(fo, B.foreArm));
      }
      const foreA = angOf(E, W);
      const handAng = a.handAng == null ? foreA + (a.handRel || 0) : a.handAng;
      J.arm[side] = { S: S0, E, W, handAng, hand: a.hand || 'relaxed', item: a.item, foreA, upperA: angOf(S0, E) };

      const l = (pose.legs && pose.legs[side]) || {};
      const H0 = J.hipJ[side];
      let K, A;
      if (l.ik) {
        const r = U.ik2(H0, l.ik, B.thigh, B.shin, l.bend || 1);
        K = r.J; A = r.E;
      } else {
        const th = l.thigh == null ? 0 : l.thigh, sn = l.shin == null ? 0 : l.shin;
        K = U.V.add(H0, dirv(th, B.thigh));
        A = U.V.add(K, dirv(sn, B.shin));
      }
      J.leg[side] = { H: H0, K, A, toe: l.toe || 0, footAng: l.footAng || 0, kneel: l.kneel || 0 };
    }
    return J;
  }

  return { B, ROOT_Y, groundY, depthScale, torsoPt, dirv, angOf, walkState, walkDist, footstepTimes, solve, EASES };
})();
if (typeof module !== 'undefined') module.exports = RIG;
