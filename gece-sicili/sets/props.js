// Props shared across sets. Each builder returns an SVG group in its own local coordinates.
// Anchor (0,0) = grip/centre point noted per prop. Props are NEVER flipped (rig counter-flips them).
(function () {
  const GS = window.GS;
  const { el, g, path, fo, ff } = GS;
  const C = GS.C;
  const FONT = "GSSerif, 'Noto Serif', serif";
  GS.FONT = FONT;
  GS.PROP = GS.PROP || {};

  function text(parent, x, y, str, size, attrs) {
    const t = el("text", Object.assign({ x, y, "font-family": FONT, "font-size": size, fill: C.outline, "text-anchor": "middle" }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  GS.svgText = text;

  // Metal tray, seen near edge-on. Anchor: centre. Width 300.
  GS.PROP.tray = function () {
    const gp = g({ class: "prop-tray" });
    path(`M -150 -10 Q -150 -22 -136 -22 L 136 -22 Q 150 -22 150 -10 L 146 12 Q 144 20 134 20 L -134 20 Q -144 20 -146 12 Z`, fo("#9aabb3"), gp);
    path(`M -138 -14 L 138 -14 L 134 6 L -134 6 Z`, ff("#c7d4d8"), gp);
    path(`M -130 -16 L 60 -16`, GS.line(4, "#eef6f6", { opacity: 0.8 }), gp);
    path(`M -144 10 L 144 10`, GS.line(3, "#6c7d86", { opacity: 0.8 }), gp);
    return gp;
  };

  // Copper seal (bakır mühür): short handle + disc. Anchor: centre of the disc. Height ~70.
  GS.PROP.seal = function () {
    const gp = g({ class: "prop-seal" });
    path(`M -9 -46 Q -12 -60 0 -62 Q 12 -60 9 -46 L 7 -14 L -7 -14 Z`, fo(C.copperLo), gp);
    el("ellipse", { cx: 0, cy: -62, rx: 11, ry: 7, fill: C.copper, ...GS.OUT }, gp);
    path(`M -24 -14 L 24 -14 L 26 6 Q 0 12 -26 6 Z`, fo(C.copper), gp);
    path(`M -22 -10 L 22 -10`, GS.line(3, C.copperHi, { opacity: 0.9 }), gp);
    path(`M 14 -12 L 16 4`, GS.line(4, C.copperLo, { opacity: 0.7 }), gp);
    return gp;
  };
  // Seal seen from the face (for inserts): engraved disc. Anchor: centre. Radius 60.
  GS.PROP.sealFace = function () {
    const gp = g({ class: "prop-seal-face" });
    el("circle", { cx: 0, cy: 0, r: 60, fill: C.copper, ...GS.OUT }, gp);
    el("circle", { cx: 0, cy: 0, r: 46, fill: "none", stroke: C.copperLo, "stroke-width": 4 }, gp);
    path(`M -30 -40 A 50 50 0 0 1 40 -30`, GS.line(6, C.copperHi, { opacity: 0.8 }), gp);
    path(`M -14 -12 L 14 -12 M -18 0 L 18 0 M -12 12 L 12 12`, GS.line(4, C.copperLo), gp);
    return gp;
  };

  // Sealed memory ampule: small glass vial, dark red when sealed. Anchor: centre. ~26 x 74.
  GS.PROP.ampule = function () {
    const gp = g({ class: "prop-ampule" });
    path(`M -13 -26 Q -13 -32 -7 -34 L -5 -42 L 5 -42 L 7 -34 Q 13 -32 13 -26 L 13 26 Q 13 37 0 37 Q -13 37 -13 26 Z`, fo(C.ampule), gp);
    path(`M -6 -24 L -6 24`, GS.line(4, C.ampuleHi, { opacity: 0.95 }), gp);
    el("circle", { cx: 6, cy: 24, r: 2.5, fill: C.ampuleHi, opacity: 0.8 }, gp);
    // copper seal cap
    path(`M -8 -52 L 8 -52 L 7 -41 L -7 -41 Z`, fo(C.copper), gp);
    return gp;
  };

  // Narrow paper strip with the death-record number. Anchor: centre. 260 x 70.
  GS.PROP.paperStrip = function () {
    const gp = g({ class: "prop-paper" });
    path(`M -130 -35 L 128 -33 L 131 34 L -128 35 Z`, fo("#e8e1cf"), gp);
    path(`M -120 -24 L 120 -22`, GS.line(1.4, "#9a917c", { opacity: 0.8 }), gp);
    text(gp, -64, -8, "ÖLÜM KAYIT NO.", 13, { fill: "#6d6553", "letter-spacing": "1" });
    text(gp, 8, 22, GS.BARAN_RECORD_NO, 38, { "font-weight": 700, fill: "#1e1a22", "letter-spacing": "2" });
    path(`M 96 -34 L 100 -20 L 94 -8 L 102 6`, GS.line(1.2, "#b8ad94"), gp);
    return gp;
  };

  // Cloth package (bez paket). state "tied" or "open". Anchor: centre. ~180 x 90.
  GS.PROP.package = function (state) {
    const gp = g({ class: "prop-package" });
    const cloth = "#6b6152", clothSh = "#4f473c";
    if (state === "open") {
      path(`M -150 10 Q -100 -24 -10 -18 Q 90 -26 150 4 Q 120 30 20 34 Q -90 38 -150 10 Z`, fo(cloth), gp);
      path(`M -120 14 Q -40 26 60 20`, GS.line(3, clothSh), gp);
      path(`M 120 8 q 20 -6 34 4 q -10 12 -30 6 z`, fo(cloth), gp);
    } else if (state === "wrap") {
      // just the loose wrap cloth (Saren hands it back at the drawer)
      path(`M -60 -20 Q -10 -40 50 -18 Q 70 10 40 34 Q -10 46 -50 26 Q -76 4 -60 -20 Z`, fo(cloth), gp);
      path(`M -40 -6 Q 0 10 40 -4 M -36 16 Q 4 28 36 12`, GS.line(3, clothSh), gp);
    } else {
      path(`M -90 -10 Q -84 -44 -20 -46 Q 70 -48 88 -14 Q 96 30 40 42 Q -40 50 -84 30 Q -96 14 -90 -10 Z`, fo(cloth), gp);
      path(`M -84 22 Q -20 36 80 16`, GS.line(4, clothSh), gp);
      // knot
      path(`M -4 -46 Q -20 -70 -6 -74 Q 6 -64 4 -46 Z`, fo(cloth), gp);
      path(`M 4 -46 Q 22 -66 30 -56 Q 22 -44 6 -42 Z`, fo(cloth), gp);
      path(`M -10 -44 L 10 -44 L 10 -34 L -10 -34 Z`, fo(clothSh), gp);
    }
    return gp;
  };

  // Old register (eski sicil) closed: thick spine-out book. Anchor: centre. 120 x 170.
  GS.PROP.registerClosed = function () {
    const gp = g({ class: "prop-register-closed" });
    path(`M -60 -85 L 60 -85 L 60 85 L -60 85 Z`, fo("#3d2f2a"), gp);
    path(`M -60 -85 L -44 -85 L -44 85 L -60 85 Z`, ff("#2a201c"), gp);
    path(`M -30 -40 L 40 -40 M -30 -28 L 30 -28`, GS.line(3, "#8a6a4a"), gp);
    path(`M 52 -85 L 52 85`, GS.line(3, "#d8cdb4", { opacity: 0.6 }), gp);
    // thin cloth marker hanging out of the pages
    path(`M 20 85 Q 24 110 14 130`, GS.line(5, "#5d6a8a"), gp);
    return gp;
  };

  // Old register OPEN at Baran's record. Anchor: centre of the spread. 620 x 420.
  // Page shows: name, record number (= paper strip), first witness signed, SECOND WITNESS BOX EMPTY.
  GS.PROP.registerOpen = function () {
    const gp = g({ class: "prop-register-open" });
    path(`M -316 -214 L 316 -214 L 320 214 L -320 214 Z`, fo("#3d2f2a"), gp);
    path(`M -300 -200 Q -150 -214 -4 -196 L -4 200 Q -150 186 -300 200 Z`, fo("#e4dcc6"), gp);
    path(`M 4 -196 Q 150 -214 300 -200 L 300 200 Q 150 186 4 200 Z`, fo("#e8e0ca"), gp);
    path(`M 0 -196 L 0 200`, GS.line(4, "#a89c80"), gp);
    // left page: faded neighbouring entries
    for (let i = 0; i < 9; i++) {
      const y = -160 + i * 38;
      path(`M -270 ${y} L -40 ${y + 1}`, GS.line(1.4, "#a59a82", { opacity: 0.7 }), gp);
      path(`M -262 ${y - 10} L ${-150 - (i % 3) * 30} ${y - 10}`, GS.line(3, "#8c826c", { opacity: 0.55 }), gp);
    }
    // right page: Baran's record
    const R = g({ transform: "translate(150 0)" }, gp);
    text(R, 0, -150, "ÖLÜM KAYDI", 20, { fill: "#4a4238", "letter-spacing": "3" });
    path(`M -120 -138 L 120 -138`, GS.line(1.6, "#8c826c"), R);
    text(R, -120, -96, "Ad:", 18, { "text-anchor": "start", fill: "#4a4238" });
    text(R, -78, -96, "BARAN", 24, { "text-anchor": "start", "font-weight": 700, fill: "#231e22" });
    text(R, -120, -52, "Kayıt No:", 18, { "text-anchor": "start", fill: "#4a4238" });
    text(R, 40, -50, GS.BARAN_RECORD_NO, 30, { "font-weight": 700, fill: "#231e22", "letter-spacing": "2" });
    text(R, -120, 6, "Birinci tanık:", 16, { "text-anchor": "start", fill: "#4a4238" });
    path(`M 10 0 L 120 0 L 120 34 L 10 34 Z`, { fill: "none", stroke: "#6b6250", "stroke-width": 1.6 }, R);
    path(`M 20 24 q 10 -20 18 -4 q 6 10 14 -8 q 8 -14 14 6 q 6 12 16 -6 l 22 -4`, GS.line(2, "#2a2230"), R); // illegible signature
    text(R, -120, 70, "İkinci tanık:", 16, { "text-anchor": "start", fill: "#4a4238" });
    path(`M 10 64 L 120 64 L 120 98 L 10 98 Z`, { fill: "none", stroke: "#6b6250", "stroke-width": 1.6, class: "second-witness-box" }, R);
    // thin cloth marker lying across the spine
    path(`M -8 -214 Q 6 -40 -6 120 Q -10 190 6 240`, GS.line(7, "#5d6a8a"), gp);
    return gp;
  };

  // Alarm cord pull ring (red). Anchor: top of the ring (where the cord attaches).
  GS.PROP.alarmRing = function () {
    const gp = g({ class: "prop-alarm-ring" });
    el("circle", { cx: 0, cy: 20, r: 18, fill: "none", stroke: C.outline, "stroke-width": 11 }, gp);
    el("circle", { cx: 0, cy: 20, r: 18, fill: "none", stroke: "#a3242f", "stroke-width": 6 }, gp);
    path(`M -8 6 A 18 18 0 0 1 10 4`, GS.line(2.4, "#e05a62", { opacity: 0.9 }), gp);
    return gp;
  };

  // Blood drop (falling) and splat. Anchor: centre.
  GS.PROP.dropFalling = function () {
    const gp = g({ class: "prop-drop" });
    path(`M 0 -14 Q 9 2 7 8 Q 4 14 0 14 Q -4 14 -7 8 Q -9 2 0 -14 Z`, fo(C.blood, { "stroke-width": 2 }), gp);
    return gp;
  };
  GS.PROP.dropSplat = function () {
    const gp = g({ class: "prop-splat" });
    path(`M -26 0 Q -24 -10 -8 -10 Q 6 -14 20 -8 Q 30 -2 24 6 Q 10 12 -6 10 Q -24 10 -26 0 Z`, fo(C.blood, { "stroke-width": 2 }), gp);
    el("circle", { cx: 34, cy: -4, r: 3.5, fill: C.blood }, gp);
    el("circle", { cx: -36, cy: 4, r: 2.5, fill: C.blood }, gp);
    return gp;
  };

  // White sheet. "draped" (on gurney, sized by w) or "floor" (crumpled on the floor, with wet stain slot).
  GS.PROP.sheet = function (state, w) {
    const gp = g({ class: "prop-sheet" });
    w = w || 900;
    if (state === "floor") {
      path(`M -150 -10 Q -120 -40 -40 -34 Q 40 -50 130 -30 Q 170 -14 150 8 Q 90 24 0 20 Q -110 26 -150 -10 Z`, fo("#cfd6d6"), gp);
      path(`M -100 -8 Q -30 6 60 -6 M -40 -30 Q 0 -16 30 -26`, GS.line(3, "#9fabad"), gp);
      const stain = g({ class: "wet-stain" }, gp);
      path(`M -40 -6 Q -30 -22 0 -20 Q 34 -20 36 -4 Q 30 12 0 12 Q -34 12 -40 -6 Z`, ff(C.bloodDry, { opacity: 0.85 }), stain);
      gp.stain = stain;
      return gp;
    }
    if (state === "cover") {
      // sheet covering a lying body: mound from the shoulders to the feet (head end at -x)
      path(`M ${-w / 2} 30 Q ${-w / 2 + 10} -70 ${-w / 2 + 120} -120 Q ${-w / 4} -150 0 -118 Q ${w / 4} -96 ${w / 2 - 90} -112 Q ${w / 2 - 10} -110 ${w / 2} -40 L ${w / 2 + 16} 70 Q ${w / 4} 84 0 74 Q ${-w / 4} 84 ${-w / 2 - 16} 70 Z`, fo("#d6dcdc"), gp);
      path(`M ${-w / 2 + 140} -100 Q ${-w / 8} -60 ${w / 2 - 120} -80`, GS.line(3, "#a3afb1"), gp);
      path(`M ${-w / 2 + 60} 40 Q 0 56 ${w / 2 - 40} 40`, GS.line(3, "#a3afb1"), gp);
      return gp;
    }
    path(`M ${-w / 2} -14 Q 0 -30 ${w / 2} -14 L ${w / 2 + 16} 70 Q ${w / 4} 84 0 74 Q ${-w / 4} 84 ${-w / 2 - 16} 70 Z`, fo("#d6dcdc"), gp);
    path(`M ${-w / 2 + 40} 30 Q 0 46 ${w / 2 - 40} 30`, GS.line(3, "#a3afb1"), gp);
    return gp;
  };

  GS.PROP.byName = function (name, arg) {
    const f = GS.PROP[name];
    if (!f) throw new Error("Unknown prop " + name);
    return f(arg);
  };
})();
