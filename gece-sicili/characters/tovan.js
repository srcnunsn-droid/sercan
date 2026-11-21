// TOVAN — 61 (looks 40), vampire, guard commander. LOCKED DESIGN (CLAUDE.md §4).
// Tall, broad, upright; black military greatcoat; silver collar tabs; slicked grey-streaked hair;
// cold narrow eyes; thin lips. Rarely moves fast. Episode 1: silhouette + eyes only.
(function () {
  const GS = window.GS;
  const { path, el, fo, ff } = GS;
  const C = GS.C;
  GS.CHAR = GS.CHAR || {};
  GS.CHAR.tovan = function () {
    return GS.makeHuman({
      name: "tovan",
      vampire: true,
      h: 1.12, k: 1.22,
      skin: C.skinVamp, skinShade: C.skinVampShade,
      coat: C.tovanCoat, coatShade: "#0a0a0e", coatRim: C.tovanCoatRim,
      inner: "#0e0e13", pants: "#101015", shoe: "#0b0b0f", boots: "#0b0b0f",
      hemY: -80, flare: 26,
      browColor: C.tovanHair, browW: 5,
      eye: { rx: 6, ry: 8 },
      mouthW: 0.8, mouthCurve: -0.5,
      pocket: false,
      drawNeckExtra(gp) {
        const y = -892;
        path(`M -48 ${y + 66} L -52 ${y + 10} Q 2 ${y + 26} 54 ${y + 8} L 50 ${y + 66} Z`, fo(C.tovanCoat), gp);
        // silver collar tabs (both sides)
        path(`M -44 ${y + 22} L -22 ${y + 28} L -22 ${y + 50} L -44 ${y + 46} Z`, fo(C.silver, { "stroke-width": 2 }), gp);
        path(`M 46 ${y + 20} L 24 ${y + 28} L 24 ${y + 50} L 46 ${y + 44} Z`, fo(C.silver, { "stroke-width": 2 }), gp);
      },
      drawTorsoExtra(gp, view) {
        // double-breasted dark buttons
        const xs = view === "front" ? [-34, 34] : [8, 54];
        for (let i = 0; i < 4; i++) xs.forEach((x) => el("circle", { cx: x, cy: -820 + i * 70, r: 6, fill: "#2a2b34", stroke: C.outline, "stroke-width": 1.5 }, gp));
        path(view === "front" ? `M -110 -620 L 110 -620` : `M -100 -620 L 90 -620`, GS.line(6, "#08080b"), gp);
      },
      drawHairBack(gp) {
        path(`M -94 -12 C -100 -88 -58 -124 0 -124 C 60 -124 100 -88 95 -12 C 94 30 84 56 70 66 L -70 66 C -86 48 -94 20 -94 -12 Z`, fo(C.tovanHair), gp);
      },
      drawHairFront(gp) {
        path(`M -95 -16 C -100 -90 -58 -126 0 -126 C 60 -126 100 -90 96 -16 C 82 -62 50 -84 2 -84 C -48 -84 -80 -62 -95 -16 Z`, fo(C.tovanHair), gp);
        [-40, 0, 40].forEach((x, i) => path(`M ${x} -88 Q ${x - 10} -108 ${x - 26} -116`, GS.line(4, C.tovanHairStreak, { opacity: 0.85 }), gp));
      },
      defaults: { eyes: "narrow", brows: "flat", head: { turn: 0.45 } },
    });
  };
})();
