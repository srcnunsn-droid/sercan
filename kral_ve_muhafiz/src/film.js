// FİLM — ortak zaman çizelgesinden her kareyi hesaplar ve çizer. renderFrame(ctx, t) saf fonksiyondur.
'use strict';
const FILM = (() => {
  const W = 1080, H = 1920;
  const TL = TIMELINE;
  const G = SETS.GEO;
  const walk = (id) => TL.walks.find((w) => w.id === id);
  const shotAt = (t) => TL.shots.find((s) => t >= s.start && t < s.end) || TL.shots[TL.shots.length - 1];
  const tr = U.track;
  const PI = Math.PI;

  // ---------------- DÜNYA DURUMU (plandan bağımsız, süreklilik için) ----------------
  const doorOpen = (t) => tr([[0, 0], [7.35, 0], [8.7, 1, 'out'], [34.45, 1], [35.55, 0, 'in']], t);
  const torchK = (t) => tr([[0, 1], [37, 0.95], [46, 0.62], [50, 0.45], [56, 0.4]], t);
  const snowAcc = (t) => tr([[0, 0.18], [17, 0.25], [37, 0.3], [46, 0.6], [52, 0.85], [56, 1]], t);
  const windK = (t) => 0.85 + 0.35 * U.fbm1(t * 0.35 + 2) + (t > 44 && t < 56 ? 0.25 : 0);
  const writeProg = (t) => (t < 52.85 ? 0 : t < 56 ? U.lerp(0, 0.26, U.EASE.lin((t - 52.85) / 3.05)) : 1);
  const isMorning = (t) => t >= 56;

  // ---------------- MUHAFIZ ----------------
  function guardPose(t) {
    const base = CHARS.guardStand({});
    const P = base;
    P.dir = 1; P.x = G.guardPost; P.z = 0.3;
    P.breathPeriod = TL.breath.guardPeriod; P.breathPhase = TL.breath.guardPhase;
    P.snow = snowAcc(t);
    // yüz ve duruş izleri
    const lean = tr([[0, 0.07], [8.9, 0.07], [9.7, -0.015, 'outBack'], [22.8, -0.015], [24.6, 0.035], [27, 0.02], [36, 0.04], [41, 0.06], [46, 0.08]], t);
    const neck = tr([[0, 0.16], [7.6, 0.16], [8.4, 0.05], [9.7, -0.02], [15.1, -0.02], [15.4, 0.09], [15.9, 0.0], [22.8, 0.0], [24.8, 0.07], [27, 0.04], [36, 0.06], [41, 0.1], [46, 0.14]], t);
    const shrug = tr([[0, 0.012], [9.0, 0.012], [9.7, 0.0], [23.4, 0.0], [24.9, -0.016], [27, -0.01], [35, 0.0], [42, 0.016]], t);
    P.lean = lean; P.neck = neck; P.shrug = shrug;
    P.shiver = tr([[0, 1.0], [8.8, 1.0], [9.6, 0.25], [17, 0.3], [23.2, 0.25], [26, 0.15], [27.5, 0.45], [36, 0.7], [41.5, 1.0], [46, 1.5], [50, 1.9], [56, 0]], t);
    const yaw = tr([[0, 0.5], [7.5, 0.5], [8.3, 0.18], [9.6, 0.22], [17.2, 0.22], [18.5, 0.28], [23, 0.32], [27, 0.3], [28.5, 0.18], [35, 0.2], [37.2, 0.22], [38.8, 0.32], [39.05, 0.12, 'out'], [40.2, 0.15], [41.3, 0.3], [41.8, 0.45]], t);
    const face = {
      yaw,
      lid: tr([[0, 0.62], [7.6, 0.62], [8.4, 0.85], [17, 0.82], [23.5, 0.78], [25, 0.72], [27.5, 0.82], [37, 0.85], [39.1, 0.95], [40.5, 0.8], [41.5, 0.66], [46, 0.55], [50, 0.42], [53, 0.35]], t),
      browIn: tr([[0, 0.25], [8.4, 0.1], [17, 0.0], [23.4, 0.15], [24.6, 0.45], [26, 0.35], [29, 0.2], [39, 0.45], [41.5, 0.6], [46, 0.7]], t),
      brow: tr([[0, 0], [8.2, 0.35], [9.4, 0.05], [38.9, 0.05], [39.1, 0.4], [40.5, 0.1]], t),
      knit: tr([[0, 0.25], [8.5, 0.0], [41.5, 0.0], [44, 0.35], [50, 0.5]], t),
      smile: tr([[0, 0], [23.5, 0], [24.7, 0.42, 'out'], [26.2, 0.32], [28.0, 0.18], [33, 0.12], [36, 0.05], [41.5, 0]], t),
      gazeX: tr([[0, 0.2], [7.6, 0.2], [8.2, 0.9], [9.6, 0.6], [17.2, 0.6], [23, 0.75], [27, 0.6], [28.5, 0.85], [38.9, 0.6], [39.05, 1.0], [40.4, 0.9], [41.5, 0.3]], t),
      gazeY: tr([[0, -0.4], [7.6, -0.4], [8.3, 0.1], [17, 0.15], [22.8, 0.1], [41.5, -0.2], [46, -0.6]], t),
      glint: tr([[0, 0.6], [23.5, 0.8], [24.8, 1.0], [30, 0.8], [46, 0.5]], t),
      tired: 0.75,
    };
    // göz kırpma (düzensiz)
    const bl = blink(t, 3.1, 17); face.lid *= bl;
    P.face = face;

    // ---- planlara göre özel hareketler ----
    if (t >= 15.1 && t < 16.2) { // "Alışığım kralım" — kısa baş eğişi
      P.face.mouthOpen = 0.12 * Math.max(0, Math.sin((t - 15.1) * 9)) * (t < 16 ? 1 : 0);
    }
    if (t >= 41.6 && t < 46) {
      // mızrak duvara dayandı (prop), eller serbest
      P.spear = null; P.spearProp = true;
      const st = t;
      // ayak oynatma: üç vuruş (ses efektleriyle aynı zaman)
      const stamp = (t0, side) => { const u = (st - (t0 - 0.18)) / 0.36; if (u > 0 && u < 1) { const h = Math.sin(u * PI); P.legs[side].ik.y = 0.075 + 0.11 * h; P.legs[side].ik.x += 0.06 * h; P.hipY = RIG.ROOT_Y - 0.03 * h; } };
      stamp(42.0, 'near'); stamp(42.55, 'far'); stamp(43.1, 'near');
      // eller: önce ağza (üfleme), sonra ovuşturma
      const up = tr([[41.6, 0], [41.9, 0.15], [43.3, 0.2], [43.75, 1], [45.6, 1], [46, 0.6]], st);
      const mouth = { x: 0.16, y: 1.5 }, chest = { x: 0.2, y: 1.12 };
      const rub = st > 44.0 && st < 45.4 ? Math.sin((st - 44.0) * U.TAU * 3.2) : 0;
      const tgt = U.V.lerp(chest, mouth, U.clamp((up - 0.2) / 0.8));
      const blowPhase = st > 43.75 && st < 44.1;
      P.arms.near = { ik: { x: tgt.x + 0.02 + rub * 0.035, y: tgt.y - 0.02 + rub * 0.01 }, hand: 'relaxed', handAng: 2.2, bend: -1 };
      P.arms.far = { ik: { x: tgt.x + 0.06 - rub * 0.035, y: tgt.y + 0.0 - rub * 0.01 }, hand: 'relaxed', handAng: 2.6, bend: -1 };
      P.neck = 0.18 + (blowPhase ? 0.06 : 0); P.face.yaw = 0.4; P.face.gazeX = 0.4; P.face.gazeY = -0.5;
      P.face.mouthOpen = blowPhase ? 0.35 : 0; P.breathBoost = blowPhase ? 2.2 : 1.3;
    }
    if (t >= 46 && t < 50) {
      // girintiye geri çekilip yaslanır, kollar gövdeye sarılı
      P.spear = null; P.spearProp = true;
      const u = U.EASE.io((t - 46) / 1.6);
      P.z = U.lerp(0.3, -0.12, u); P.x = U.lerp(G.guardPost, G.guardPost - 0.05, u);
      P.lean = U.lerp(0.08, -0.04, u); P.neck = U.lerp(0.14, 0.32, u); P.hipY = RIG.ROOT_Y - 0.06 * u;
      P.legs.near.ik = { x: -0.02, y: 0.075 }; P.legs.far.ik = { x: 0.12, y: 0.075 };
      P.arms.near = { ik: { x: 0.07, y: 1.2 }, hand: 'relaxed', handAng: 1.9, bend: -1 };
      P.arms.far = { ik: { x: 0.04, y: 1.25 }, hand: 'relaxed', handAng: 1.3, bend: -1 };
      P.face.yaw = 0.45; P.face.gazeX = 0.1; P.face.gazeY = -0.7;
    }
    if (t >= 50 && t < 56) {
      // dizlerinin üstüne çöker, kömürü alır, duvara uzanır
      P.spear = null; P.spearProp = true;
      const u = U.EASE.io((t - 50.1) / 1.3);
      P.x = U.lerp(G.guardPost - 0.05, -2.36, U.EASE.io((t - 50) / 1.0));
      P.z = U.lerp(-0.12, 0.0, U.clamp(t - 50));
      P.hipY = U.lerp(RIG.ROOT_Y - 0.06, 0.56, u);
      P.lean = U.lerp(-0.04, 0.22, u); P.neck = U.lerp(0.32, 0.12, u);
      // diz çökme: dizler yerde, ayaklar geride
      P.legs.near = { ik: { x: U.lerp(-0.02, -0.38, u), y: U.lerp(0.075, 0.06, u) }, bend: 1, footAng: U.lerp(0, -1.35, u) };
      P.legs.far = { ik: { x: U.lerp(0.12, -0.3, u), y: U.lerp(0.075, 0.06, u) }, bend: 1, footAng: U.lerp(0, -1.35, u) };
      // kömürü alma (51.6–52.2) sonra duvara uzanma
      const pick = tr([[50, 0], [51.4, 0], [51.9, 1], [52.25, 1], [52.6, 0]], t);
      const reach = tr([[52.2, 0], [52.6, 1]], t);
      const ground = { x: 0.42, y: 0.04 }, rest = { x: 0.2, y: 0.9 }, wall = { x: 0.55, y: 0.78 };
      let tg = U.V.lerp(rest, ground, pick); tg = U.V.lerp(tg, wall, reach);
      P.arms.near = { ik: tg, hand: t > 51.9 ? 'pinch' : 'relaxed', item: t > 51.9 ? 'charcoal' : null, handAng: U.lerp(2.4, 1.6, reach), bend: -1 };
      P.arms.far = { ik: { x: 0.18, y: U.lerp(1.0, 0.55, u) }, hand: 'relaxed', handAng: 0.5, bend: -1 };
      P.face.yaw = 0.3; P.face.gazeX = 0.6; P.face.gazeY = U.lerp(-0.3, -0.8, pick);
      P.face.lid = 0.45 * bl;
    }
    if (t >= 56) {
      // sabah: duvarın dibinde oturur hâlde, donmuş
      P.spear = null; P.spearProp = true;
      P.x = -2.4; P.z = -0.02; P.hipY = 0.2; P.lean = 0.12; P.neck = 0.55; P.shrug = 0.02;
      P.legs.near = { ik: { x: 0.33, y: 0.12 }, bend: 1, footAng: 0.2 };
      P.legs.far = { ik: { x: 0.5, y: 0.075 }, bend: 1, footAng: 0.05 };
      P.arms.near = { ik: { x: 0.36, y: 0.24 }, hand: 'relaxed', handAng: 1.2, bend: -1 };
      P.arms.far = { ik: { x: 0.25, y: 0.3 }, hand: 'relaxed', handAng: 1.5, bend: -1 };
      P.face = { yaw: 0.4, lid: 0.0, browIn: 0.35, gazeY: -1, smile: 0, tired: 0.9, glint: 0 };
      P.frost = 1; P.snow = 1; P.shiver = 0; P.cloakHemDY = 0;
      P.dead = true;
    }
    // durarak nefes (sabah hariç)
    return P;
  }
  function blink(t, every, seed) {
    // düzensiz göz kırpma
    const k = Math.floor(t / every);
    const tb = k * every + U.hash(k * 7 + seed) * (every - 0.4);
    const d = t - tb;
    if (d >= 0 && d < 0.16) return 1 - Math.sin((d / 0.16) * PI) * 0.95;
    return 1;
  }

  // ---------------- KRAL (dış) ----------------
  function kingExtPose(t) {
    const P = { dir: -1, hipY: RIG.ROOT_Y, lean: 0.0, neck: 0.04, breathPeriod: 3.3, breathPhase: 1.1 };
    let w = null;
    if (t < 17.5) w = walk('kingOut'); else if (t < 27.3) w = walk('kingStep'); else w = walk('kingBack');
    const st = RIG.walkState(w, t);
    if (t >= 27.3) P.dir = 1; else P.dir = -1;
    P.x = st.x; P.z = st.z; P.hipY = RIG.ROOT_Y + st.bob;
    const toLocal = (wx) => (wx - st.x) * P.dir;
    const gy = RIG.groundY;
    P.legs = {
      near: { ik: { x: toLocal(st.feet.near.x), y: 0.075 + st.feet.near.lift + st.feet.near.heel + (gy(st.feet.near.z) - gy(st.z)) }, toe: st.feet.near.heel, bend: 1 },
      far: { ik: { x: toLocal(st.feet.far.x) + 0.05, y: 0.075 + st.feet.far.lift + st.feet.far.heel + (gy(st.feet.far.z) - gy(st.z)) }, toe: st.feet.far.heel, bend: 1 },
    };
    const sw = st.armSwing;
    P.arms = { near: { upper: -0.12 * sw + 0.04, fore: -0.05 * sw + 0.22, hand: 'relaxed', handRel: 0.1 }, far: { upper: 0.12 * sw + 0.02, fore: 0.12 * sw + 0.2, hand: 'relaxed', handRel: 0.1 } };
    P.lean = 0.02 + 0.03 * U.clamp(st.speed || 0);
    // konuşma sırasında
    if (t >= 10.9 && t < 27.3) {
      P.arms.near = { upper: 0.12, fore: 0.62, hand: 'relaxed', handRel: 0.2 };     // eller önde birleşik
      P.arms.far = { upper: 0.1, fore: 0.7, hand: 'relaxed', handRel: 0.1 };
      if (t >= 13.1 && t < 14.6) P.neck = 0.08 + 0.03 * Math.sin((t - 13.1) * 2);  // soru: başını hafif eğer
      // omza el (uzak kol) 19.2–21.7
      const touch = tr([[18.9, 0], [19.5, 1, 'out'], [21.4, 1], [22.0, 0]], t);
      if (touch > 0) {
        const gp = guardPose(t), gJ = RIG.solve(gp), gsc = RIG.depthScale(gp.z) * (CHARS.guard.size || 1);
        const gs = { x: gp.x + gsc * (gJ.shoulder.far.x + 0.05), y: RIG.groundY(gp.z) + gsc * (gJ.shoulder.far.y - 0.03) };
        const ks = RIG.depthScale(st.z) * (CHARS.king.size || 1);
        const loc = { x: (gs.x - st.x) * P.dir / ks, y: (gs.y - RIG.groundY(st.z)) / ks };
        const rest = { x: 0.18, y: 1.0 };
        P.arms.far = { ik: U.V.lerp(rest, { x: loc.x - 0.06, y: loc.y + 0.05 }, touch), hand: touch > 0.5 ? 'open' : 'relaxed', handAng: U.lerp(2.0, 1.25, touch), bend: -1 };
        P.lean = 0.05 * touch;
      }
    }
    P.face = {
      yaw: t < 10.9 ? 0.35 : t < 27.3 ? 0.3 : 0.25,
      lid: 0.85 * blink(t, 3.6, 5), smile: tr([[0, 0.05], [12.5, 0.1], [13.2, 0.0], [17.6, 0.12], [19.5, 0.28], [22, 0.22], [26.5, 0.15], [27.5, 0.0]], t),
      browIn: tr([[0, 0.1], [12.6, 0.35], [14.5, 0.25], [17, 0.1], [27, 0.0]], t),
      gazeX: 0.6, gazeY: tr([[0, 0], [10, -0.1], [27, -0.1], [27.5, 0]], t),
    };
    // dönüşte başı kapıya
    if (t >= 27.0 && t < 27.45) { P.face.yaw = 0.8; }
    return P;
  }

  // ---------------- İÇ MEKÂN: kral + kâtip ----------------
  function kingIntPose(t) {
    const w = walk('kingIn');
    const st = RIG.walkState(w, t);
    const P = { dir: 1, x: st.x, z: st.z, hipY: RIG.ROOT_Y + st.bob, lean: 0.03, neck: 0.05 };
    P.legs = {
      near: { ik: { x: st.feet.near.x - st.x, y: 0.075 + st.feet.near.lift + st.feet.near.heel }, toe: st.feet.near.heel, bend: 1 },
      far: { ik: { x: st.feet.far.x - st.x + 0.05, y: 0.075 + st.feet.far.lift + st.feet.far.heel }, toe: st.feet.far.heel, bend: 1 },
    };
    const sw = st.armSwing;
    P.arms = { near: { upper: -0.14 * sw + 0.04, fore: -0.06 * sw + 0.25, hand: 'relaxed' }, far: { upper: 0.14 * sw, fore: 0.12 * sw + 0.2, hand: 'relaxed' } };
    const take = tr([[30.9, 0], [31.25, 1, 'out']], t);
    const read = tr([[31.3, 0], [31.9, 1]], t);
    if (take > 0) {
      const reachT = { x: 0.5, y: 1.12 }, readT = { x: 0.3, y: 1.22 };
      P.arms.near = { ik: U.V.lerp(reachT, readT, read), hand: 'paper', handAng: U.lerp(1.9, 2.3, read), bend: -1 };
      if (t >= 31.22) P.doc = { hand: 'near', rot: U.lerp(-0.4, 0.15, read) };
      P.arms.far = read > 0.5 ? { ik: { x: 0.36, y: 1.17 }, hand: 'paper', handAng: 2.1, bend: -1 } : P.arms.far;
      P.neck = U.lerp(0.05, 0.28, read); P.lean = U.lerp(0.03, 0.06, read);
    }
    P.face = { yaw: 0.35, lid: U.lerp(0.85, 0.55, read) * blink(t, 3.0, 8), gazeX: 0.5, gazeY: U.lerp(0, -0.8, read), smile: 0.05, browIn: 0.0, knit: 0.2 * read };
    return P;
  }
  function clerkPose(t) {
    const w = walk('clerkIn');
    const st = RIG.walkState(w, t);
    const back = tr([[31.35, 0], [32.2, 1]], t);
    const P = { dir: -1, x: st.x + back * 0.25, z: U.lerp(st.z, 0.15, back), hipY: RIG.ROOT_Y + st.bob, lean: 0.04 + 0.12 * tr([[31.4, 0], [31.8, 1], [32.6, 0.4]], t), neck: 0.1 };
    const toL = (wx) => (wx - st.x) * -1;
    P.legs = {
      near: { ik: { x: toL(st.feet.near.x), y: 0.075 + st.feet.near.lift + st.feet.near.heel }, bend: 1 },
      far: { ik: { x: toL(st.feet.far.x) + 0.05, y: 0.075 + st.feet.far.lift + st.feet.far.heel }, bend: 1 },
    };
    const offer = tr([[30.4, 0], [30.9, 1], [31.25, 1], [31.45, 0]], t);
    P.arms = { near: { upper: 0.1, fore: 0.3, hand: 'relaxed' }, far: { upper: 0.05, fore: 0.6, hand: 'relaxed' } };
    if (offer > 0 || t < 31.25) {
      P.arms.near = { ik: U.V.lerp({ x: 0.22, y: 1.0 }, { x: 0.5, y: 1.12 }, offer), hand: 'paper', handAng: 1.9, bend: -1 };
      if (t < 31.22) P.doc = { hand: 'near', rot: -0.4 };
    }
    P.face = { yaw: 0.4, lid: 0.8 * blink(t, 2.7, 9), gazeX: 0.5, gazeY: -0.1 };
    return P;
  }

  // ---------------- SABAH NÖBETÇİLERİ ----------------
  function sentryPose(t, id, kneelAt) {
    const w = walk(id);
    const st = RIG.walkState(w, t);
    const P = { dir: -1, x: st.x, z: st.z, hipY: RIG.ROOT_Y + st.bob, lean: 0.04, neck: 0.06, breathPeriod: 3.0, breathPhase: id === 'sentAIn' ? 0.3 : 1.6 };
    const toL = (wx) => (wx - st.x) * -1;
    const gy = RIG.groundY;
    P.legs = {
      near: { ik: { x: toL(st.feet.near.x), y: 0.075 + st.feet.near.lift + st.feet.near.heel + (gy(st.feet.near.z) - gy(st.z)) }, bend: 1 },
      far: { ik: { x: toL(st.feet.far.x) + 0.05, y: 0.075 + st.feet.far.lift + st.feet.far.heel + (gy(st.feet.far.z) - gy(st.z)) }, bend: 1 },
    };
    const sw = st.armSwing;
    P.arms = { near: { upper: -0.14 * sw + 0.04, fore: -0.06 * sw + 0.22, hand: 'relaxed' }, far: { upper: 0.14 * sw, fore: 0.12 * sw + 0.2, hand: 'relaxed' } };
    P.face = { yaw: 0.35, lid: 0.85 * blink(t, 3.3, id.length), gazeX: 0.6, gazeY: -0.3, browIn: 0.2 };
    if (kneelAt) {
      const k = tr([[kneelAt, 0], [kneelAt + 0.9, 1]], t);
      if (k > 0) {
        P.hipY = U.lerp(P.hipY, 0.55, k); P.lean = U.lerp(0.04, 0.32, k); P.neck = U.lerp(0.06, 0.25, k);
        P.legs.near = { ik: { x: U.lerp(P.legs.near.ik.x, 0.32, k), y: 0.075 }, bend: 1 };
        P.legs.far = { ik: { x: U.lerp(P.legs.far.ik.x, -0.4, k), y: U.lerp(0.075, 0.06, k) }, bend: 1, footAng: -1.3 * k };
        const reach = tr([[kneelAt + 0.9, 0], [kneelAt + 1.7, 1], [kneelAt + 2.6, 0.85]], t);
        P.arms.near = { ik: U.V.lerp({ x: 0.3, y: 0.62 }, { x: 0.5, y: 0.7 }, reach), hand: reach > 0.4 ? 'open' : 'relaxed', handAng: 1.8, bend: -1 };
        P.face = { ...P.face, browIn: 0.7, lid: 0.7, gazeY: -0.6, gazeX: 0.8, yaw: 0.25 };
      }
    } else {
      // B: yazıyı fark eder — başını duvara çevirip eğilir
      const n = tr([[59.4, 0], [60.4, 1]], t);
      if (n > 0) {
        P.neck = U.lerp(0.06, 0.28, n); P.lean = U.lerp(0.04, 0.12, n);
        P.face = { ...P.face, yaw: U.lerp(0.35, 0.65, n), gazeX: U.lerp(0.6, 0.2, n), gazeY: U.lerp(-0.3, -0.9, n), browIn: 0.55 * n, brow: 0.2 * n };
        P.arms.far = { ik: { x: 0.12, y: 1.35 }, hand: 'relaxed', handAng: 2.5, bend: -1 };
      }
    }
    return P;
  }

  // ---------------- KAMERA ----------------
  // her plan için [t, {cx, cy, zoom}] izi; küçük el kamerası titreşimi eklenir
  const CAM = {
    s1a: [[0, { cx: -2.45, cy: 1.0, zoom: 4300 }], [3.2, { cx: -2.445, cy: 1.02, zoom: 3900 }]],
    s1b: [[3.2, { cx: -2.3, cy: 1.15, zoom: 500 }], [7.0, { cx: -2.15, cy: 1.2, zoom: 430 }]],
    s2: [[7.0, { cx: -1.0, cy: 1.25, zoom: 262 }], [17.2, { cx: -1.15, cy: 1.22, zoom: 268 }]],
    s3a: [[17.2, { cx: -2.18, cy: 1.32, zoom: 600 }], [23.0, { cx: -2.25, cy: 1.34, zoom: 620 }]],
    s3b: [[23.0, { cx: -2.53, cy: 1.43, zoom: 2400 }], [27.0, { cx: -2.53, cy: 1.44, zoom: 2400 }]],
    s4a: [[27.0, { cx: -1.15, cy: 1.3, zoom: 262 }], [29.6, { cx: -0.85, cy: 1.3, zoom: 262 }]],
    s4b: [[29.6, { cx: -1.9, cy: 1.02, zoom: 345 }], [31.0, { cx: -0.4, cy: 1.02, zoom: 345 }], [34.4, { cx: 1.2, cy: 1.02, zoom: 345 }]],
    s4c: [[34.4, { cx: -1.45, cy: 1.3, zoom: 285 }], [37.0, { cx: -1.6, cy: 1.3, zoom: 300 }]],
    s5a: [[37.0, { cx: -2.25, cy: 1.45, zoom: 520 }], [41.6, { cx: -2.2, cy: 1.45, zoom: 520 }]],
    s5b: [[41.6, { cx: -2.3, cy: 1.25, zoom: 410 }], [46.0, { cx: -2.35, cy: 1.25, zoom: 410 }]],
    s5c: [[46.0, { cx: -2.05, cy: 1.25, zoom: 300 }], [50.0, { cx: -2.15, cy: 1.2, zoom: 310 }]],
    s6a: [[50.0, { cx: -2.25, cy: 1.0, zoom: 470 }], [52.6, { cx: -2.15, cy: 0.95, zoom: 490 }]],
    s6b: [[52.6, { cx: -1.86, cy: 0.66, zoom: 1550 }], [56.0, { cx: -1.82, cy: 0.67, zoom: 1550 }]],
    s7: [[56.0, { cx: -1.45, cy: 0.8, zoom: 330 }], [62.4, { cx: -1.75, cy: 0.78, zoom: 345 }]],
    s8: [[62.4, { cx: -1.74, cy: 0.62, zoom: 1180 }], [72.2, { cx: -1.74, cy: 0.66, zoom: 1210 }]],
  };
  function camAt(shot, t) {
    const c = { ...tr(CAM[shot.id], t) };
    const hand = shot.id === 's8' ? 0.3 : 1;
    c.cx += U.fbm1(t * 0.45 + 11) * 0.012 * (600 / c.zoom) * hand;
    c.cy += U.fbm1(t * 0.4 + 23) * 0.01 * (600 / c.zoom) * hand;
    return c;
  }
  function worldTransform(ctx, cam) { ctx.setTransform(cam.zoom, 0, 0, -cam.zoom, W / 2 - cam.cx * cam.zoom, H / 2 + cam.cy * cam.zoom); }
  const toScreen = (cam, p) => ({ x: W / 2 + (p.x - cam.cx) * cam.zoom, y: H / 2 - (p.y - cam.cy) * cam.zoom });

  // ---------------- IŞIK ORTAMLARI ----------------
  const ENV = {
    ext: { amb: [0.5, 0.58, 0.8], lift: [4, 7, 16], keyX: -1 },
    niche: { amb: [0.36, 0.42, 0.6], lift: [3, 5, 12], keyX: -1 },
    morning: { amb: [0.72, 0.76, 0.86], lift: [10, 12, 18], keyX: -1 },
    int: { amb: [1.05, 0.8, 0.58], lift: [10, 5, 0], keyX: 1 },
  };

  // ---------------- KATMANLAR ----------------
  let LAYER = null, LCTX = null, BUILT = null;
  function init() {
    BUILT = SETS.build();
    // ışık derecelendirmesi önceden pişirilir (multiply)
    grade(BUILT.ext, [[1, [92, 104, 142]], [0.45, [112, 126, 168]], [0, [128, 146, 192]]]);
    grade(BUILT.patch, [[1, [92, 104, 142]], [0.45, [112, 126, 168]], [0, [128, 146, 192]]]);
    grade(BUILT.morn, [[1, [168, 176, 196]], [0.5, [184, 192, 208]], [0, [196, 204, 222]]]);
    grade(BUILT.patchM, [[1, [168, 176, 196]], [0.5, [184, 192, 208]], [0, [196, 204, 222]]]);
    grade(BUILT.int, [[1, [150, 100, 70]], [0.5, [210, 150, 100]], [0, [190, 130, 85]]]);
    LAYER = U.makeCanvas(W, H); LCTX = LAYER.getContext('2d');
    const mk = (col) => { const src = SETS.leaf(); const c = U.makeCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(src, 0, 0); return c; };
    LEAF_N = mk('rgb(100,112,150)'); LEAF_M = mk('rgb(172,180,198)');
  }
  let LEAF_N = null, LEAF_M = null;
  function grade(layer, stops) {
    const x = layer.c.getContext('2d');
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'multiply';
    const g = x.createLinearGradient(0, 0, 0, layer.c.height);
    for (const [p, c] of stops) g.addColorStop(1 - p, U.rgba(c));
    x.fillStyle = g; x.fillRect(0, 0, layer.c.width, layer.c.height);
    x.restore();
  }

  // Figürü ayrı katmana çiz, sıcak ışıkla kenar boyaması yap, ana tuvale bindir
  function drawFigureLit(ctx, cam, spec, pose, env, lights, opt = {}) {
    LCTX.setTransform(1, 0, 0, 1, 0, 0); LCTX.clearRect(0, 0, W, H);
    worldTransform(LCTX, cam);
    const J = FIG.draw(LCTX, spec, pose, { ...env, px: 1 / cam.zoom });
    LCTX.setTransform(1, 0, 0, 1, 0, 0);
    LCTX.globalCompositeOperation = 'source-atop';
    for (const L of lights) {
      const p = toScreen(cam, L.pos);
      const r = L.r * cam.zoom;
      const g = LCTX.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, U.rgba(L.col, L.a)); g.addColorStop(1, U.rgba(L.col, 0));
      LCTX.fillStyle = g; LCTX.fillRect(0, 0, W, H);
    }
    if (opt.darken) { LCTX.fillStyle = `rgba(4,6,14,${opt.darken})`; LCTX.fillRect(0, 0, W, H); }
    LCTX.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (opt.clip) { ctx.beginPath(); opt.clip(ctx); ctx.clip(); }
    if (opt.blur) ctx.filter = `blur(${opt.blur}px)`;
    ctx.drawImage(LAYER, 0, 0);
    ctx.restore();
    return J;
  }

  // ---------------- DIŞ MEKÂN SAHNESİ ----------------
  function drawExterior(ctx, t, cam, o = {}) {
    const morning = isMorning(t);
    const set = o.patch ? (morning ? BUILT.patchM : BUILT.patch) : morning ? BUILT.morn : BUILT.ext;
    const open = morning ? 0 : doorOpen(t);
    const tk = morning ? 0 : torchK(t);
    const flick = 0.85 + 0.15 * U.fbm1(t * 7.3) + 0.05 * U.fbm1(t * 23);
    const wind = windK(t);
    worldTransform(ctx, cam);
    // arka plan dolgusu
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = morning ? '#8e98a8' : '#1a2030'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save();
    if (o.bgBlur) ctx.filter = `blur(${o.bgBlur}px)`;
    if (o.patch) SETS.blit(ctx, morning ? BUILT.morn : BUILT.ext); // yama dışını doldur
    SETS.blit(ctx, set);
    ctx.restore();
    // duvar yazısı (taşın üstüne, multiply)
    const wp = writeProg(t);
    if (wp > 0) { ctx.save(); if (o.bgBlur) ctx.filter = `blur(${o.bgBlur}px)`; SETS.drawWallText(ctx, wp); ctx.restore(); }
    // yerdeki kömür parçası (alınana kadar)
    if (t < 51.9) { ctx.fillStyle = '#0c0b0b'; ctx.beginPath(); ctx.ellipse(-1.94, -0.045, 0.025, 0.012, 0.2, 0, U.TAU); ctx.fill(); }
    // kapı: önce kanatlar (gece/sabah tonlu), sonra kanatlar arasındaki aralıkta sıcak iç
    ctx.save(); if (o.bgBlur) ctx.filter = `blur(${o.bgBlur}px)`;
    SETS.drawDoor(ctx, open, morning ? LEAF_M : LEAF_N);
    ctx.restore();
    if (open > 0.005) {
      const gap = G.door.hw * (1 - Math.cos(open * 1.25));
      ctx.save(); ctx.beginPath(); ctx.rect(-gap, -0.2, gap * 2, 3.4); ctx.clip();
      FX.doorInterior(ctx, open, t);
      ctx.restore();
    }
    // meşale ışığı (duvara)
    const T = G.torch;
    if (tk > 0) {
      FX.glow(ctx, T.x + 0.13, T.y + 0.25, 2.6, [255, 140, 60], 0.36 * tk * flick, 'screen');
      FX.glow(ctx, T.x + 0.13, T.y + 0.25, 0.9, [255, 170, 90], 0.3 * tk * flick, 'lighter');
    } else if (morning) {
      FX.smoke(ctx, T.x + 0.13, T.y + 0.25, t, 0.6);
    }
    FX.doorSpill(ctx, open, 1);
    // uzak kar
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    FX.snow(ctx, cam, { t, wind, density: morning ? 0.25 : 0.75, layer: 'far', tint: morning ? [240, 244, 250] : [200, 212, 235], alpha: morning ? 0.6 : 0.9 });
    ctx.restore();
    // mızrak duvara dayalı (prop)
    const lights = [];
    if (tk > 0) lights.push({ pos: { x: T.x + 0.13, y: T.y + 0.25 }, r: 2.2, col: [255, 150, 70], a: 0.42 * tk * flick });
    if (open > 0.02) lights.push({ pos: { x: 0, y: 1.2 }, r: 3.2, col: [255, 175, 95], a: 0.42 * Math.sin(open * 1.25) });
    const envL = morning ? ENV.morning : ENV.ext;
    // --- figürler (uzaktan yakına)
    const figs = [];
    if (o.guard !== false) figs.push({ spec: CHARS.guard, pose: guardPose(t), id: 'guard' });
    if (!morning && o.king !== false && t >= 8.3 && t < 29.75) figs.push({ spec: CHARS.king, pose: kingExtPose(t), id: 'king' });
    if (morning && !o.noFigs) {
      figs.push({ spec: CHARS.sentryA, pose: sentryPose(t, 'sentAIn', 58.9), id: 'sA' });
      figs.push({ spec: CHARS.sentryB, pose: sentryPose(t, 'sentBIn', null), id: 'sB' });
    }
    figs.sort((a, b) => a.pose.z - b.pose.z);
    // dayalı mızrak (figürlerden önce, duvarın dibinde)
    const gp = guardPose(t);
    if (gp.spearProp && !o.noFigs) {
      worldTransform(ctx, cam);
      const Lp = FIG.makeLight(envL, 1);
      FIG.spear(ctx, { x: -3.24, y: -0.03 }, { x: -3.07, y: 2.02 }, Lp);
    }
    const out = {};
    for (const f of figs) {
      const inNiche = f.pose.z < 0.05 && f.id === 'guard';
      const env = { ...(inNiche ? (morning ? { ...ENV.morning, amb: [0.58, 0.62, 0.72] } : ENV.niche) : envL), t, wind: wind * (morning ? 0.4 : 1) };
      const opt = {};
      if (f.id === 'king' && f.pose.z < -0.02) {
        const D = G.door;
        opt.clip = (c) => { const a = toScreen(cam, { x: -D.hw, y: -0.3 }), b = toScreen(cam, { x: D.hw, y: D.spring + D.r }); c.rect(a.x, b.y, b.x - a.x, a.y - b.y); };
      }
      if (inNiche && !morning) opt.darken = 0.06;
      if (o.blurFigs && o.blurFigs[f.id]) opt.blur = o.blurFigs[f.id];
      out[f.id] = drawFigureLit(ctx, cam, f.spec, f.pose, env, morning ? [] : lights, opt);
      out[f.id + 'Pose'] = f.pose;
      // niş söveleri, nişin içindeki muhafızın önünde kalır (öndeki figürlerden önce)
      if (inNiche) {
        worldTransform(ctx, cam);
        const N = G.niche;
        ctx.save(); ctx.beginPath(); ctx.rect(N.x1 - 0.005, -0.04, 0.26, N.top + 0.06); ctx.rect(N.x0 - 0.25, -0.04, 0.26, N.top + 0.06); ctx.clip();
        if (o.bgBlur) ctx.filter = `blur(${o.bgBlur}px)`;
        SETS.blit(ctx, set);
        if (tk > 0) FX.glow(ctx, T.x + 0.13, T.y + 0.25, 2.6, [255, 140, 60], 0.36 * tk * flick, 'screen');
        ctx.restore();
      }
      // nefes buharı
      if (!f.pose.dead && f.pose.breathPeriod) {
        worldTransform(ctx, cam);
        const J = out[f.id];
        const s = RIG.depthScale(f.pose.z) * (f.spec.size || 1);
        const hx = f.pose.x + f.pose.dir * s * (J.head.x + 0.075), hy = RIG.groundY(f.pose.z) + s * (J.head.y - 0.075);
        FX.breath(ctx, { t, period: f.pose.breathPeriod, phase: f.pose.breathPhase, mouth: { x: hx, y: hy }, dir: f.pose.dir, wind: wind * 0.4, strength: (f.pose.breathBoost || 1) * (morning ? 0.8 : 1) * (f.id === 'guard' ? 1 : 0.8) });
      }
    }
    // biriken kar: duvar dibinde yumuşak profilli yığın (zamanla büyür)
    worldTransform(ctx, cam);
    const acc = morning ? 1 : U.clamp((t - 30) / 26);
    if (acc > 0.01) {
      const prof = (x) => { const base = 0.5 + 0.5 * U.fbm1(x * 1.7 + 5); const fall = U.smooth(U.clamp((x + 1.35) / -0.5)) * U.smooth(U.clamp((x + 3.7) / 0.5)); return (0.04 + 0.12 * base) * fall * acc; };
      ctx.beginPath(); ctx.moveTo(-3.8, -0.12);
      for (let x = -3.8; x <= -1.2; x += 0.04) ctx.lineTo(x, -0.04 + prof(x));
      ctx.lineTo(-1.2, -0.12); ctx.lineTo(-3.8, -0.16); ctx.closePath();
      const sg = ctx.createLinearGradient(0, 0.2, 0, -0.14);
      if (morning) { sg.addColorStop(0, 'rgba(232,238,246,1)'); sg.addColorStop(1, 'rgba(205,214,230,0)'); }
      else { sg.addColorStop(0, 'rgba(176,190,224,1)'); sg.addColorStop(0.7, 'rgba(150,166,205,0.85)'); sg.addColorStop(1, 'rgba(140,156,196,0)'); }
      ctx.save(); ctx.filter = `blur(${Math.max(1, cam.zoom / 150).toFixed(1)}px)`; ctx.globalAlpha = 0.9; ctx.fillStyle = sg; ctx.fill(); ctx.restore();
      if (tk > 0) { ctx.save(); ctx.clip(); FX.glow(ctx, T.x + 0.13, T.y + 0.25, 2.6, [255, 140, 60], 0.25 * tk * flick, 'screen'); ctx.restore(); }
    }
    return { out, lights, open, tk, wind, flick };
  }

  // ---------------- İÇ MEKÂN SAHNESİ ----------------
  function drawInterior(ctx, t, cam) {
    worldTransform(ctx, cam);
    SETS.blit(ctx, BUILT.int);
    const fl = 0.85 + 0.15 * U.fbm1(t * 6.1);
    // şömine ateşi ve mumlar
    FX.flame(ctx, 1.7, 0.3, 0.75, t, 1, 3);
    FX.flame(ctx, 1.55, 0.3, 0.55, t + 0.7, 0.9, 7);
    FX.glow(ctx, 1.7, 0.6, 3.2, [255, 150, 70], 0.38 * fl, 'screen');
    for (const [x, y] of [[-3.15, 2.47], [3.45, 2.47], [0.19, 1.02]]) { FX.flame(ctx, x, y, 0.12, t + x, 1, x * 3); FX.glow(ctx, x, y + 0.04, 1.0, [255, 190, 110], 0.28 * fl, 'screen'); }
    // girişteki karanlık kapı aralığından içeri kar
    const env = { ...ENV.int, t };
    const lights = [{ pos: { x: 1.7, y: 0.6 }, r: 3.5, col: [255, 160, 80], a: 0.35 * fl }];
    const figs = [{ spec: CHARS.clerk, pose: clerkPose(t), id: 'clerk' }, { spec: CHARS.king, pose: kingIntPose(t), id: 'king' }];
    figs.sort((a, b) => a.pose.z - b.pose.z);
    for (const f of figs) drawFigureLit(ctx, cam, f.spec, f.pose, env, lights);
    // sıcak pus
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createRadialGradient(W * 0.75, H * 0.62, 50, W * 0.6, H * 0.55, H * 0.7);
    g.addColorStop(0, `rgba(255,170,90,${0.12 * fl})`); g.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ---------------- YAKIN PLANLAR ----------------
  function drawHandCU(ctx, t, cam) {
    // arka plan: aynı mekân, alan derinliği bulanıklığı ile
    drawExterior(ctx, t, cam, { bgBlur: 14, guard: false, king: false });
    worldTransform(ctx, cam);
    const gp = guardPose(t);
    const J = RIG.solve(gp);
    const hx = gp.x + J.arm.near.W.x, hy = RIG.groundY(gp.z) + J.arm.near.W.y;
    const L = FIG.makeLight({ amb: [0.72, 0.72, 0.9], lift: [10, 8, 14], keyX: 1 }, 1);
    const sh = 1.0;
    const nx = U.fbm1(t * 13) * 0.0016 * sh + U.fbm1(t * 3.1) * 0.001, ny = U.fbm1(t * 11 + 5) * 0.0012 * sh;
    // mızrak sapı (dikey), elin içinden geçer
    const sx = gp.x + 0.2;
    ctx.save();
    const g = ctx.createLinearGradient(sx - 0.017, 0, sx + 0.017, 0);
    g.addColorStop(0, L.c([150, 112, 72], 0.5)); g.addColorStop(0.5, L.c([118, 86, 55], 0)); g.addColorStop(1, L.c([60, 42, 28], -0.5));
    ctx.fillStyle = g; ctx.fillRect(sx - 0.017 + nx * 0.3, hy - 1, 0.034, 2.5);
    // ahşap lifleri
    ctx.strokeStyle = 'rgba(40,25,15,0.35)'; ctx.lineWidth = 0.0008;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(sx - 0.012 + i * 0.005, hy - 1); ctx.lineTo(sx - 0.012 + i * 0.005 + 0.002, hy + 1.5); ctx.stroke(); }
    // sapta kar/kırağı
    ctx.fillStyle = 'rgba(220,230,245,0.5)'; for (let i = 0; i < 40; i++) ctx.fillRect(sx - 0.017 + U.hash(i) * 0.01, hy - 0.4 + U.hash(i * 3) * 0.8, 0.002, 0.002);
    ctx.restore();
    FIG.closeHand(ctx, { x: sx + nx, y: hy + 0.0 + ny, ang: 0, mode: 'spear', L, t });
    // meşale sıcaklığı elin sağ kenarında
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const rg = ctx.createRadialGradient(W * 1.05, H * 0.15, 0, W * 1.05, H * 0.15, H * 0.7);
    rg.addColorStop(0, 'rgba(255,140,60,0.18)'); rg.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // nefes buharı kadrajın üstünden geçer
    worldTransform(ctx, cam);
    FX.breath(ctx, { t, period: TL.breath.guardPeriod, phase: TL.breath.guardPhase, mouth: { x: hx + 0.05, y: hy + 0.15 }, dir: 1, wind: 0.3, strength: 0.7 });
  }

  function drawWriteCU(ctx, t, cam) {
    drawExterior(ctx, t, cam, { patch: true, guard: false, king: false });
    worldTransform(ctx, cam);
    const wp = writeProg(t);
    const cur = SETS.textCursor(Math.max(0.002, wp));
    const L = FIG.makeLight({ ...ENV.ext, amb: [0.6, 0.6, 0.72] }, 1);
    const nx = U.fbm1(t * 12) * 0.002, ny = U.fbm1(t * 9 + 3) * 0.0015;
    const settle = U.EASE.out(U.clamp((t - 52.6) / 0.3));
    FIG.closeHand(ctx, { x: cur.x - 0.135 + nx - (1 - settle) * 0.05, y: cur.y - 0.03 + ny - (1 - settle) * 0.04, ang: 0.1, mode: 'chalk', L, t });
    // meşale ışığı ele de düşer
    FX.glow(ctx, G.torch.x + 0.13, G.torch.y + 0.25, 2.2, [255, 140, 60], 0.18 * torchK(t), 'screen');
  }

  function drawTextCU(ctx, t, cam) {
    drawExterior(ctx, t, cam, { patch: true, guard: false, noFigs: true });
  }

  // ---------------- ALTYAZI ----------------
  function subtitles(ctx, t) {
    const line = TL.lines.find((l) => t >= l.start - 0.05 && t < l.end + 0.35);
    if (!line) return;
    const a = U.clamp((t - (line.start - 0.05)) / 0.18) * U.clamp((line.end + 0.35 - t) / 0.2);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '600 50px "Inter", "DejaVu Sans", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const lines = line.sub;
    const lh = 64;
    const baseY = 1468 - (lines.length - 1) * lh;
    const cx = 512; // sağdaki Reels düğmelerinden uzak
    for (let i = 0; i < lines.length; i++) {
      const y = baseY + i * lh;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(0,0,0,${0.55 * a})`; ctx.lineWidth = 7; ctx.strokeText(lines[i], cx, y);
      ctx.shadowColor = `rgba(0,0,0,${0.6 * a})`; ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(250,246,238,${a})`; ctx.fillText(lines[i], cx, y);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // ---------------- ANA KARE ----------------
  function renderFrame(ctx, t, opts = {}) {
    if (!BUILT) init();
    const shot = shotAt(t);
    const cam = camAt(shot, t);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    let near = { density: 0.35, alpha: 0.9 };
    if (shot.id === 's1a') { drawHandCU(ctx, t, cam); near = { density: 0.55, alpha: 1, sizeK: 1.8 }; }
    else if (shot.id === 's6b') { drawWriteCU(ctx, t, cam); near = { density: 0.35, alpha: 0.7, sizeK: 1.6 }; }
    else if (shot.id === 's8') { drawTextCU(ctx, t, cam); near = { density: 0.12, alpha: 0.5, sizeK: 1.5 }; }
    else if (shot.set === 'int') { drawInterior(ctx, t, cam); near = null; }
    else if (shot.id === 's3b') { drawExterior(ctx, t, cam, { bgBlur: 10, blurFigs: { king: 6 } }); near = { density: 0.3, alpha: 0.8, sizeK: 1.4 }; }
    else { drawExterior(ctx, t, cam, {}); if (shot.id === 's5c' || shot.id === 's6a') near = { density: 0.6, alpha: 1 }; if (shot.set === 'morning') near = { density: 0.15, alpha: 0.6 }; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (near) FX.snow(ctx, cam, { t, wind: windK(t), layer: 'near', tint: shot.set === 'morning' ? [245, 248, 252] : [220, 230, 245], ...near });
    // geçişler
    let fade = 0;
    if (t < 0.7) fade = 1 - t / 0.7;
    if (t > 55.4 && t < 56) fade = (t - 55.4) / 0.6;
    if (t >= 56 && t < 56.9) fade = 1 - (t - 56) / 0.9;
    if (t > TL.duration - 0.6) fade = Math.max(fade, (t - (TL.duration - 0.6)) / 0.6);
    FX.post(ctx, t, { vignette: shot.set === 'int' ? 0.45 : shot.set === 'morning' ? 0.35 : 0.6, grain: 0.085 });
    if (!opts.noSubs) subtitles(ctx, t);
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${U.clamp(fade)})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    return shot.id;
  }

  return { renderFrame, init, guardPose, kingExtPose, shotAt, writeProg, W, H };
})();
if (typeof module !== 'undefined') module.exports = FILM;
