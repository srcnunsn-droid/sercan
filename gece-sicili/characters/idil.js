// İDİL — 28, human, death-register clerk. LOCKED DESIGN (CLAUDE.md §4). Do not redraw; edit only to fix bugs.
// Dark-brown shoulder-length hair tied low with loose strands; warm skin; sage morgue coat over dark sweater;
// tired shadows under the eyes. Right thumb runs along the copper seal's edge (hand "pinch" + seal prop).
(function () {
  const GS = window.GS;
  const { path, el, fo, ff } = GS;
  const C = GS.C;
  GS.CHAR = GS.CHAR || {};
  GS.CHAR.idil = function () {
    return GS.makeHuman({
      name: "idil",
      h: 1, k: 0.92,
      skin: C.skinHuman, skinShade: C.skinHumanShade,
      coat: C.sage, coatShade: C.sageShade, coatRim: C.sageRim,
      inner: C.idilSweater, cuff: C.idilSweater, pants: C.idilPants, shoe: C.shoe,
      hemY: -300, flare: 14,
      underEye: true,
      browColor: C.idilHair, browW: 4.6,
      mouthW: 0.9,
      drawCollar(gp, view) {
        // sweater crew neck + coat lapels
        const y = -800;
        if (view === "front") {
          path(`M -30 ${y} Q 0 ${y + 22} 30 ${y} L 26 ${y + 12} Q 0 ${y + 32} -26 ${y + 12} Z`, fo(C.idilSweater), gp);
          path(`M -34 ${y - 6} L -14 ${y + 70} L -30 ${y + 64} L -46 ${y + 4} Z`, fo(C.sage), gp);
          path(`M 34 ${y - 6} L 14 ${y + 70} L 30 ${y + 64} L 46 ${y + 4} Z`, fo(C.sage), gp);
        } else {
          path(`M -24 ${y} Q 8 ${y + 22} 38 ${y} L 34 ${y + 12} Q 8 ${y + 32} -20 ${y + 12} Z`, fo(C.idilSweater), gp);
          path(`M 36 ${y - 6} L 24 ${y + 64} L 40 ${y + 60} L 52 ${y + 2} Z`, fo(C.sage), gp);
          path(`M -2 ${y - 8} L 10 ${y + 60} L -6 ${y + 54} L -18 ${y - 2} Z`, fo(C.sage), gp);
        }
      },
      drawTorsoExtra(gp, view) {
        // name-plate free; a small breast pocket on the near panel (where the seal lives)
        if (view === "three") path(`M -64 -700 L -30 -700 L -32 -668 L -62 -668 Z`, fo(C.sageShade), gp);
      },
      drawHairBack(gp) {
        const H = C.idilHair;
        // mass behind the head to the shoulders, gathered low at the nape
        path(`M -100 -14 C -106 -92 -60 -124 2 -124 C 64 -124 106 -90 100 -12 C 98 40 82 92 52 118 L -48 122 C -84 92 -100 40 -100 -14 Z`, fo(H), gp);
        // low tie + tail hanging behind the neck/shoulder
        path(`M -30 104 Q -46 160 -36 214 Q -22 238 -6 222 Q 6 176 4 106 Z`, fo(H), gp);
        path(`M -36 112 L 6 110 L 6 126 L -36 128 Z`, fo(C.idilSweater), gp);
      },
      drawHairFront(gp) {
        const H = C.idilHair;
        // hairline with a side part toward -x; bangs swept toward the facing side
        path(`M -97 -4 C -104 -84 -58 -120 4 -119 C 66 -117 102 -80 97 -6 C 90 -34 74 -58 50 -68 C 30 -50 0 -42 -34 -50 C -58 -54 -74 -48 -86 -30 C -90 -22 -94 -14 -97 -4 Z`, fo(H), gp);
        path(`M -40 -110 Q 10 -112 60 -92`, GS.line(6, C.idilHairHi, { opacity: 0.7 }), gp);
        // loose strands framing the face
        path(`M -88 -36 Q -102 26 -86 86 Q -84 40 -76 -22 Z`, fo(H), gp);
        path(`M 86 -40 Q 100 20 90 74 Q 82 30 76 -26 Z`, fo(H), gp);
      },
      defaults: { head: { turn: 0.45 } },
    });
  };
})();
