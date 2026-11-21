// MORGUE insert scenes (extreme close-ups drawn big; "insert shots are your best tool in 2D").
// Each builder returns { g, update(P, t, shot) } in its own local coordinates (about -600..600).
// P = the shot's evaluated param keys (data only; no timings in here).
(function () {
  const GS = window.GS;
  const { el, g, path, fo, ff } = GS;
  const C = GS.C;
  GS.INSERTS = GS.INSERTS || {};

  function bigHand(parent, shape, skin, shade, s) {
    const h = g({ transform: `scale(${s || 5})` }, parent);
    GS.drawHand(h, shape, skin, shade);
    return h;
  }
  function steel(parent, x, y, w, h) {
    path(`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`, fo("#9fb0b7"), parent);
    path(`M ${x + 20} ${y + 24} L ${x + w - 20} ${y + 24}`, GS.line(10, "#d3e0e3", { opacity: 0.55 }), parent);
    path(`M ${x} ${y + h - 30} L ${x + w} ${y + h - 30}`, GS.line(14, "#7a8d95", { opacity: 0.6 }), parent);
  }
  function floorTiles(parent) {
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#151b27" }, parent);
    for (let i = -6; i <= 6; i++) {
      path(`M ${i * 260} -1400 L ${i * 300} 1400`, GS.line(4, "#26303f"), parent);
      path(`M -1400 ${i * 260} L 1400 ${i * 260}`, GS.line(4, "#26303f"), parent);
    }
  }
  function sleeve(parent, color, cuff) {
    // forearm coming from the left edge to the wrist at (0,0)
    path(`M -1400 -110 L -40 -90 Q 0 0 -40 90 L -1400 110 Z`, fo(color), parent);
    path(`M -120 -96 L -40 -90 Q 0 0 -40 90 L -120 96 Z`, fo(cuff), parent);
  }

  const B = (GS.INSERTS.morgue = {});

  // S01: pale hand clamps İdil's wrist from under the sheet edge; the tray slips and falls.
  B.grab = function () {
    const G = g({ class: "ins-grab" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#1c2a33" }, G);
    // gurney edge + sheet across the top
    steel(G, -1400, -380, 2800, 120);
    path(`M -1400 -1400 L 1400 -1400 L 1400 -300 Q 900 -250 400 -290 Q 0 -230 -400 -300 Q -900 -260 -1400 -300 Z`, fo("#d6dcdc"), G);
    path(`M -1100 -420 Q -300 -380 900 -430`, GS.line(8, "#a3afb1"), G);
    // İdil's arm + hand (wrist at 0,0), sleeve from the left
    const idil = g({}, G);
    const tray = g({}, idil);
    tray.appendChild(GS.PROP.tray());
    const arm = g({}, idil);
    sleeve(arm, C.sage, C.idilSweater);
    const ih = g({ transform: "rotate(-90)" }, arm);
    bigHand(ih, "grip", C.skinHuman, C.skinHumanShade, 5);
    // Saren's hand: comes from under the sheet (top-right), fingers clamp the wrist
    const sar = g({}, G);
    const sarArm = path(`M 140 -1400 L 330 -1400 L 160 -60 L 20 -90 Z`, fo(C.sarenCoat), sar);
    const sarHand = g({}, sar);
    bigHand(sarHand, "grip", C.skinVamp, C.skinVampShade, 5.6);
    const fingers = g({}, sar);
    path(`M -70 -30 Q -90 60 -40 120 L 70 120 Q 110 60 80 -30 Z`, fo(C.skinVamp), fingers);
    path(`M -50 40 L 70 40 M -46 80 L 66 80`, GS.line(4, C.outline, { opacity: 0.55 }), fingers);
    return {
      g: G,
      update(P) {
        const gp = GS.clamp(P.grab === undefined ? 1 : P.grab, 0, 1);
        // hand travels from under the sheet to the wrist
        const hx = GS.lerp(380, 0, gp), hy = GS.lerp(-420, -40, gp);
        sarHand.setAttribute("transform", `translate(${hx} ${hy}) rotate(${GS.lerp(-60, -10, gp)})`);
        sarArm.setAttribute("d", `M 900 -1400 L 1400 -1400 L 1400 -1100 L ${hx + 130} ${hy + 60} L ${hx - 10} ${hy - 60} Z`);
        fingers.setAttribute("transform", `translate(${hx - 10} ${hy + 30})`);
        fingers.setAttribute("opacity", gp > 0.85 ? 1 : 0);
        const tug = P.tug || 0;
        idil.setAttribute("transform", `translate(${-60 * tug} ${30 * tug}) rotate(${-4 * tug})`);
        const f = GS.clamp(P.fall || 0, 0, 1);
        tray.setAttribute("transform", `translate(${200 + 80 * f} ${180 + 1400 * f * f}) rotate(${-8 + 70 * f})  scale(2.2)`);
      },
    };
  };

  // S04: a dark drop falls from under the wounded arm and splats on the tile.
  B.drop = function () {
    const G = g({ class: "ins-drop" });
    floorTiles(G);
    // gurney leg + wheel at the side
    path(`M 420 -1400 L 470 -1400 L 470 -120 L 420 -120 Z`, fo("#8ea2aa"), G);
    el("circle", { cx: 445, cy: -70, r: 70, fill: "#2b2f38", ...GS.OUT }, G);
    const drop = g({ transform: "scale(5)" }, G);
    drop.appendChild(GS.PROP.dropFalling());
    const splat = g({}, G);
    splat.appendChild(GS.PROP.dropSplat());
    return {
      g: G,
      update(P) {
        const f = GS.clamp(P.fall || 0, 0, 1);
        drop.setAttribute("transform", `translate(-40 ${GS.lerp(-1200, -10, f * f)}) scale(5 ${5 * (1 + 0.4 * f)})`);
        drop.setAttribute("opacity", f >= 1 ? 0 : 1);
        const s = GS.clamp(P.splat || 0, 0, 1);
        splat.setAttribute("transform", `translate(-40 10) scale(${6 * s} ${4 * s})`);
      },
    };
  };

  // S13: package lands on the steel table; knot loosens; the ampule rolls out; a paper strip slides out.
  B.package = function () {
    const G = g({ class: "ins-package" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#1c2a33" }, G);
    steel(G, -1400, -300, 2800, 1700);
    const paper = g({}, G);
    paper.appendChild(GS.PROP.paperStrip());
    const amp = g({}, G);
    amp.appendChild(GS.PROP.ampule());
    const tied = g({}, G);
    tied.appendChild(GS.PROP.package("tied"));
    const open = g({}, G);
    open.appendChild(GS.PROP.package("open"));
    const shadow = el("ellipse", { cx: 0, cy: 110, rx: 300, ry: 40, fill: "#000", opacity: 0.25 }, G);
    G.insertBefore(shadow, paper);
    return {
      g: G,
      update(P) {
        const land = GS.clamp(P.land === undefined ? 1 : P.land, 0, 1);
        const y = GS.lerp(-900, 0, land * land);
        const o = P.open || 0;
        tied.setAttribute("transform", `translate(0 ${y}) scale(3.2)`);
        open.setAttribute("transform", `translate(0 ${y + 30}) scale(3.2)`);
        tied.setAttribute("display", o < 0.5 ? "inline" : "none");
        open.setAttribute("display", o >= 0.5 ? "inline" : "none");
        shadow.setAttribute("opacity", 0.25 * land);
        const a = GS.clamp(P.amp || 0, 0, 1);
        amp.setAttribute("transform", `translate(${GS.lerp(60, 420, a)} ${40 + 30 * a}) rotate(${GS.lerp(90, 90 + 360 * 1.1, a)}) scale(3.4)`);
        amp.setAttribute("display", a > 0 ? "inline" : "none");
        const pp = GS.clamp(P.paper || 0, 0, 1);
        paper.setAttribute("transform", `translate(${GS.lerp(-60, -380, pp)} ${GS.lerp(40, 230, pp)}) rotate(${GS.lerp(-4, 6, pp)}) scale(2.4)`);
        paper.setAttribute("display", pp > 0 ? "inline" : "none");
      },
    };
  };

  // S14: the paper strip, number readable (never mirrored).
  B.paper = function () {
    const G = g({ class: "ins-paper" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#1c2a33" }, G);
    steel(G, -1400, -800, 2800, 2200);
    const amp = g({ transform: "translate(470 -240) rotate(70) scale(3.2)" }, G);
    amp.appendChild(GS.PROP.ampule());
    const paper = g({}, G);
    paper.appendChild(GS.PROP.paperStrip());
    const hand = g({}, G);
    const hi = g({ transform: "rotate(-75)" }, hand);
    bigHand(hi, "pinch", C.skinHuman, C.skinHumanShade, 4.4);
    path(`M -1400 -120 L -260 -60 L -250 70 L -1400 120 Z`, fo(C.sage), hand);
    return {
      g: G,
      update(P) {
        const pull = GS.clamp(P.pull || 0, 0, 1);
        paper.setAttribute("transform", `translate(${-40 - 500 * pull} ${60 + 120 * pull}) rotate(${4 - 3 * pull}) scale(3.6)`);
        const hv = GS.clamp(P.hand || 0, 0, 1);
        hand.setAttribute("transform", `translate(${GS.lerp(-900, -330, hv) - 500 * pull} ${60 + 120 * pull})`);
      },
    };
  };

  // S15b: İdil's right thumb runs along the copper seal's edge (seal on a short chain at her coat pocket).
  B.seal = function () {
    const G = g({ class: "ins-seal" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: C.sage }, G);
    path(`M -1400 -500 L 1400 -560`, GS.line(10, C.sageShade), G);
    path(`M -500 -300 L 300 -320 L 290 600 L -480 620 Z`, fo(C.sageShade), G); // pocket
    path(`M -80 -800 Q -60 -500 -40 -260`, GS.line(10, C.copperLo), G); // chain
    const seal = g({ transform: "translate(-30 0) scale(4.2)" }, G);
    seal.appendChild(GS.PROP.sealFace());
    const thumb = g({}, G);
    path(`M 900 700 L 300 260 Q 220 190 150 230 Q 90 290 160 360 L 700 900 Z`, fo(C.skinHuman), thumb);
    path(`M 170 250 Q 140 280 175 320`, GS.line(6, C.skinHumanShade), thumb);
    path(`M 900 700 L 1400 300 L 1400 1400 L 700 1400 Z`, fo(C.sage), thumb);
    return {
      g: G,
      update(P) {
        const a = GS.lerp(-70, 40, GS.clamp(P.thumb || 0, 0, 1));
        thumb.setAttribute("transform", `translate(-30 0) rotate(${a}) translate(30 0)`);
      },
    };
  };

  // S23: the old register open at Baran's record; same number; second witness box empty.
  B.register = function () {
    const G = g({ class: "ins-register" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#241d1a" }, G);
    const book = g({ transform: "scale(1.9)" }, G);
    book.appendChild(GS.PROP.registerOpen());
    const flip = path("", fo("#ddd4bd"), G);
    const dust = g({}, G);
    const r = GS.rng(23);
    for (let i = 0; i < 28; i++) el("circle", { cx: (r() - 0.5) * 1100, cy: (r() - 0.5) * 700, r: 3 + r() * 5, fill: "#cfc4a8" }, dust);
    return {
      g: G,
      update(P) {
        const f = GS.clamp(P.flip || 0, 0, 1);
        // one page turning over the spread (flat card squashing across the spine)
        const x = GS.lerp(560, -560, f);
        flip.setAttribute("d", `M 0 -390 L ${x} -400 L ${x} 380 L 0 390 Z`);
        flip.setAttribute("display", f > 0 && f < 1 ? "inline" : "none");
        const d = GS.clamp(P.dust || 0, 0, 1);
        dust.setAttribute("opacity", (0.6 * (1 - d)).toFixed(2));
        dust.setAttribute("transform", `translate(0 ${-120 * d}) scale(${1 + 0.4 * d})`);
      },
    };
  };

  // S25b: İdil turns the old page in front of the sealed ampule (page against the red glass).
  B.pageAmpule = function () {
    const G = g({ class: "ins-pageamp" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#1c2a33" }, G);
    steel(G, -1400, 150, 2800, 1300);
    const amp = g({ transform: "translate(260 40) scale(4.2)" }, G);
    amp.appendChild(GS.PROP.ampule());
    const page = g({}, G);
    const bk = g({ transform: "translate(-260 0) scale(1.15)" }, page);
    bk.appendChild(GS.PROP.registerOpen());
    const hand = g({}, page);
    const hi = g({ transform: "translate(-640 180) rotate(-100)" }, hand);
    bigHand(hi, "grip", C.skinHuman, C.skinHumanShade, 4);
    return {
      g: G,
      update(P) {
        const tr = GS.clamp(P.turn || 0, 0, 1);
        // the open book turns from flat-away to standing up facing the ampule
        page.setAttribute("transform", `translate(${GS.lerp(-300, 0, tr)} ${GS.lerp(200, 0, tr)}) rotate(${GS.lerp(-18, 0, tr)}) scale(${GS.lerp(0.8, 1, tr)})`);
      },
    };
  };

  // S35b: İdil's foot pushes the wet sheet fully over the blood drop.
  B.foot = function () {
    const G = g({ class: "ins-foot" });
    floorTiles(G);
    const splat = g({ transform: "translate(140 60) scale(7 4.5)" }, G);
    splat.appendChild(GS.PROP.dropSplat());
    const sheet = g({}, G);
    sheet.appendChild(GS.PROP.sheet("floor"));
    const shoe = g({}, G);
    path(`M -1500 -560 L -820 -520 L -760 -160 L -1500 -200 Z`, fo(C.idilPants), shoe);
    path(`M -900 -260 L -420 -270 Q -60 -240 -30 -60 L -30 10 L -920 10 Z`, fo(C.shoe), shoe);
    path(`M -880 -10 L -40 -10`, GS.line(8, "#000", { opacity: 0.4 }), shoe);
    return {
      g: G,
      update(P) {
        const p = GS.clamp(P.push || 0, 0, 1);
        sheet.setAttribute("transform", `translate(${GS.lerp(-420, 120, p)} ${GS.lerp(20, 60, p)}) scale(4.4 3.6)`);
        shoe.setAttribute("transform", `translate(${GS.lerp(-150, 390, p)} 40)`);
      },
    };
  };

  // S39 (cheat): side view of the drawer. The tray slides out, Saren sits, lies down, the tray slides in;
  // the cabinet front masks him as he goes inside.
  B.drawerSide = function (ctx) {
    // local coords: floor at y=300, tray top at y=0, cabinet opening y -420..60 from x=300 to the right
    const G = g({ class: "ins-drawer" });
    el("rect", { x: -2000, y: -1800, width: 4000, height: 3600, fill: "#22393e" }, G);
    el("rect", { x: -2000, y: 300, width: 4000, height: 1500, fill: "#151b27" }, G);
    path(`M -2000 300 L 2000 300`, GS.line(6, C.outline), G);
    path(`M 300 -420 L 1700 -420 L 1700 60 L 300 60 Z`, fo("#07090e"), G);
    const tray = g({}, G);
    path(`M 0 0 L 1300 0 L 1300 40 L 0 40 Z`, fo("#a6b6bc"), tray);
    path(`M 10 8 L 1290 8`, GS.line(6, "#e2eef0", { opacity: 0.7 }), tray);
    const sarSlot = g({}, G);
    const rig = GS.buildRig(GS.CHAR.saren(), { id: "saren-ins" });
    sarSlot.appendChild(rig.el);
    // cabinet front face (the mask): drawn ABOVE Saren so he disappears inside
    const front = g({}, G);
    path(`M 300 -1800 L 2000 -1800 L 2000 -420 L 300 -420 Z M 300 60 L 2000 60 L 2000 300 L 300 300 Z`, fo("#6f8590"), front);
    path(`M 260 -1800 L 340 -1800 L 340 300 L 260 300 Z`, fo("#8b9ea6"), front);
    path(`M 300 -420 L 2000 -420 M 300 60 L 2000 60`, GS.line(6, C.outline), front);
    return {
      g: G,
      update(P, t) {
        const out = GS.clamp(P.tray === undefined ? 0 : P.tray, 0, 1);
        const tx = GS.lerp(300, -1000, out);
        tray.setAttribute("transform", `translate(${tx} 0)`);
        const S = GS.deepMerge(JSON.parse(JSON.stringify(GS.defaultState())), P.sar || {});
        if (S.onTray) S.x = (S.x || 0) + tx; // rides on the tray once lying on it
        S.breath = Math.sin((2 * Math.PI * t) / 3);
        rig.set(S);
      },
    };
  };

  // S40a: before the lid shuts, the healthy hand comes out with the forgotten cloth wrap; İdil takes it.
  B.lidHand = function () {
    const G = g({ class: "ins-lid" });
    el("rect", { x: -1400, y: -1400, width: 2800, height: 2800, fill: "#4b5c64" }, G);
    path(`M -700 -500 L 700 -500 L 700 500 L -700 500 Z`, fo("#07090e"), G);
    const lid = g({}, G);
    path(`M -700 -500 L 700 -500 L 700 500 L -700 500 Z`, fo("#8b9ea6"), lid);
    path(`M -300 0 L 300 0`, { stroke: C.outline, "stroke-width": 50, "stroke-linecap": "round", fill: "none" }, lid);
    path(`M -300 0 L 300 0`, { stroke: "#cfdade", "stroke-width": 32, "stroke-linecap": "round", fill: "none" }, lid);
    const sar = g({}, G);
    path(`M 1400 -60 L 260 -40 L 260 90 L 1400 120 Z`, fo(C.sarenCoat), sar);
    const sh = g({ transform: "translate(250 20) rotate(90)" }, sar);
    bigHand(sh, "grip", C.skinVamp, C.skinVampShade, 4.6);
    const wrap = g({ transform: "translate(120 30) scale(2.6)" }, sar);
    wrap.appendChild(GS.PROP.package("wrap"));
    const idil = g({}, G);
    path(`M -1400 160 L -320 120 L -300 260 L -1400 300 Z`, fo(C.sage), idil);
    const ih = g({ transform: "translate(-280 190) rotate(-90)" }, idil);
    bigHand(ih, "open", C.skinHuman, C.skinHumanShade, 4.4);
    return {
      g: G,
      update(P) {
        const l = GS.clamp(P.lid || 0, 0, 1); // 0 open .. 1 closed (lid slides from the left)
        lid.setAttribute("transform", `translate(${GS.lerp(-1400, 0, l)} 0)`);
        const h = GS.clamp(P.hand || 0, 0, 1);
        const take = GS.clamp(P.take || 0, 0, 1);
        sar.setAttribute("transform", `translate(${GS.lerp(700, -160, h) + 500 * take} 0)`);
        idil.setAttribute("transform", `translate(${GS.lerp(-500, 0, GS.clamp(P.reach || 0, 0, 1)) - 600 * take} ${-40 * take})`);
        wrap.setAttribute("transform", take > 0.4 ? `translate(${-450 - 600 * take + 500 * take} ${130}) scale(2.6)` : "translate(120 30) scale(2.6)");
      },
    };
  };
})();
