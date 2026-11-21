// SAREN — 33, vampire (turned 7 years ago), ex-guard. LOCKED DESIGN (CLAUDE.md §4).
// Very pale cool skin; short dark messy hair; long charcoal coat with HIGH collar; LEFT arm wrapped in a
// dirty bandage with dark dried blood (rig keeps it on the anatomical left arm in every facing);
// fangs only in "wide"/"bared" mouths; amber ring in the eyes when strained (state.amber).
(function () {
  const GS = window.GS;
  const { path, el, fo, ff } = GS;
  const C = GS.C;
  GS.CHAR = GS.CHAR || {};
  // Wound stage grows across the season (continuity.md). 1 = Episode 1.
  GS.SAREN_WOUND_STAGE = 1;
  GS.CHAR.saren = function () {
    return GS.makeHuman({
      name: "saren",
      vampire: true,
      h: 1.05, k: 1.0,
      skin: C.skinVamp, skinShade: C.skinVampShade,
      coat: C.sarenCoat, coatShade: C.sarenCoatShade, coatRim: C.sarenCoatRim,
      inner: C.sarenShirt, pants: "#1c1c24", shoe: C.shoe, boots: "#19181e",
      hemY: -160, flare: 22,
      browColor: C.sarenHair, browW: 5.4,
      mouthW: 1.0, mouthCurve: 1,
      drawNeckExtra(gp) {
        // high standing collar in front of the neck
        const y = -832;
        path(`M -44 ${y + 56} L -50 ${y - 6} Q 2 ${y + 12} 52 ${y - 8} L 48 ${y + 56} Z`, fo(C.sarenCoat), gp);
        path(`M -50 ${y - 6} Q 2 ${y + 12} 52 ${y - 8} L 50 ${y + 6} Q 2 ${y + 26} -49 ${y + 8} Z`, ff(C.sarenCoatRim, { opacity: 0.5 }), gp);
      },
      drawCollar(gp, view) {
        if (view === "three") path(`M 44 -800 L 30 -650 M 46 -620 L 46 -620`, GS.line(2.4, C.outline, { opacity: 0.6 }), gp);
      },
      drawArmExtra(gp, side, part) {
        if (side !== "L") return;
        const L = part === "fore" ? 188 * 1.05 : 205 * 1.05;
        if (part === "upper") {
          // torn sleeve edge near the elbow
          path(`M -24 ${L - 30} L -14 ${L - 18} L -4 ${L - 30} L 8 ${L - 16} L 24 ${L - 28}`, GS.line(2.6, C.outline), gp);
          return;
        }
        // forearm: dirty bandage wraps over the arm, dark dried blood
        path(`M -24 -6 Q -25 ${L * 0.5} -20 ${L - 18} L 20 ${L - 18} Q 25 ${L * 0.5} 24 -6 Q 0 -22 -24 -6 Z`, fo(C.bandage), gp);
        path(`M -20 ${L * 0.55} Q -22 ${L * 0.8} -18 ${L - 20} L 18 ${L - 20} Q 21 ${L * 0.8} 20 ${L * 0.55} Z`, ff(C.bandageShade), gp);
        for (let i = 0; i < 6; i++) {
          const y = 14 + i * 30;
          path(`M -24 ${y} L 24 ${y - 16}`, GS.line(2, C.bandageShade), gp);
        }
        // dried blood (stage 1: two stains)
        path(`M -10 ${L * 0.38} q 8 -10 18 -2 q 6 10 -2 20 q -12 6 -18 -4 q -4 -8 2 -14 z`, fo(C.bloodDry, { "stroke-width": 2 }), gp);
        path(`M 6 ${L * 0.7} q 7 -4 10 3 q 1 8 -6 9 q -7 -1 -4 -12 z`, ff(C.bloodDry), gp);
        path(`M -14 ${L * 0.4} q 3 -4 7 -3`, GS.line(1.6, C.blood, { opacity: 0.8 }), gp);
      },
      drawHairBack(gp) {
        path(`M -96 -10 C -100 -86 -58 -122 2 -122 C 64 -122 100 -86 96 -10 C 96 30 84 58 70 70 L -70 70 C -88 50 -96 20 -96 -10 Z`, fo(C.sarenHair), gp);
      },
      drawHairFront(gp) {
        const H = C.sarenHair;
        path(`M -96 -8 C -102 -84 -60 -124 2 -124 C 66 -124 102 -86 97 -8 L 88 -34 L 80 -16 L 70 -50 L 52 -30 L 42 -62 L 20 -42 L 8 -70 L -12 -46 L -28 -66 L -44 -44 L -62 -60 L -72 -30 L -84 -48 Z`, fo(H), gp);
        // messy tufts on top
        path(`M -40 -116 L -52 -140 L -20 -122 L -6 -146 L 12 -122 L 40 -138 L 36 -112 Z`, fo(H), gp);
        path(`M -30 -112 Q 20 -118 60 -96`, GS.line(5, "#3a3948", { opacity: 0.8 }), gp);
      },
      defaults: { head: { turn: 0.45 } },
    });
  };
})();
