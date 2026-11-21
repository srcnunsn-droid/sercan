// Shared puppet body ("same face language for everyone"). Characters differ by cfg:
// colors, size, coat length/collar, hair drawers and extras (bandage, collar tabs...).
// GS.makeHuman(cfg) -> spec for GS.buildRig.
(function () {
  const GS = window.GS;
  const { el, g, path, fo, ff } = GS;

  GS.makeHuman = function (cfg) {
    const C = GS.C;
    const k = cfg.k || 1; // horizontal build factor (broadness)
    const hipY = -480 * (cfg.h || 1);
    const waistY = -560 * (cfg.h || 1);
    const neckY = -792 * (cfg.h || 1);
    const shY = -762 * (cfg.h || 1);
    const hemY = cfg.hemY !== undefined ? cfg.hemY : -280; // coat hem (absolute y, standing)
    const skin = cfg.skin;
    const skinShade = cfg.skinShade;
    const coat = cfg.coat;
    const coatShade = cfg.coatShade;
    const coatRim = cfg.coatRim;
    const inner = cfg.inner;

    const dims = {
      hipY, waistY, neckY,
      headX: 6 * k, headY: neckY - 118, headScale: cfg.headScale || 1, headPivotDy: 92,
      upperLen: 205 * (cfg.h || 1), foreLen: 188 * (cfg.h || 1),
      thighLen: 238 * (cfg.h || 1), shinLen: 232 * (cfg.h || 1),
      eyeSpacing: 33, featureShift: 34, eyeY: 10, browDy: -27, noseY: 24, noseShift: 46,
      mouthY: 64, earX: 89, earY: 12, hairFrontShift: 10, hairBackShift: 8,
      three: {
        shoulderNear: [-66 * k, shY], shoulderFar: [58 * k, shY - 4],
        hipNear: [-26 * k, hipY + 6], hipFar: [24 * k, hipY + 2],
      },
      front: {
        shoulderNear: [-82 * k, shY], shoulderFar: [82 * k, shY],
        hipNear: [-34 * k, hipY + 6], hipFar: [34 * k, hipY + 6],
      },
    };
    const X = (v) => v * k;

    const spec = {
      name: cfg.name,
      vampire: !!cfg.vampire,
      dims,
      eye: cfg.eye || { rx: 6.8, ry: 9 },
      lidW: cfg.lidW || 3.2,
      browW: cfg.browW || 5,
      browColor: cfg.browColor || C.outline,
      mouthW: cfg.mouthW || 1,
      mouthCurve: cfg.mouthCurve,
      defaults: cfg.defaults,

      drawUpperArm(gp, side, ctx) {
        const w = 25 * k;
        const L = dims.upperLen;
        path(`M ${-w} -6 Q ${-w - 2} ${L * 0.5} ${-w + 3} ${L + 8} Q 0 ${L + 22} ${w - 3} ${L + 8} Q ${w + 2} ${L * 0.5} ${w} -6 Q 0 -30 ${-w} -6 Z`, fo(cfg.sleeve || coat), gp);
        path(`M ${w - 9} 4 Q ${w - 4} ${L * 0.5} ${w - 7} ${L}`, GS.line(7, cfg.sleeveRim || coatRim, { opacity: 0.55 }), gp);
        if (cfg.drawArmExtra) cfg.drawArmExtra(gp, side, "upper", ctx);
      },
      drawForearm(gp, side, ctx) {
        const w0 = 23 * k, w1 = 19 * k;
        const L = dims.foreLen;
        path(`M ${-w0} -4 Q ${-w0 - 1} ${L * 0.5} ${-w1} ${L - 4} L ${w1} ${L - 4} Q ${w0 + 1} ${L * 0.5} ${w0} -4 Q 0 -22 ${-w0} -4 Z`, fo(cfg.sleeve || coat), gp);
        // cuff
        path(`M ${-w1 - 2} ${L - 22} L ${w1 + 2} ${L - 22} L ${w1 + 1} ${L - 2} L ${-w1 - 1} ${L - 2} Z`, fo(cfg.cuff || coatShade), gp);
        if (cfg.drawArmExtra) cfg.drawArmExtra(gp, side, "fore", ctx);
      },
      drawHand(gp, side, shape, ctx) {
        gp.setAttribute("transform", `scale(${cfg.handScale || 1.25})`);
        drawHand(gp, shape, skin, skinShade);
      },
      drawHandOver(gp, side, ctx) {
        gp.setAttribute("transform", `scale(${cfg.handScale || 1.25})`);
        // fingers curled in front of a held prop (grip)
        path(`M -15 16 Q -18 30 -10 38 L 12 38 Q 18 30 15 16 Q 0 22 -15 16 Z`, fo(skin), gp);
        path(`M -9 24 L 9 24 M -9 31 L 9 31`, GS.line(1.8, C.outline, { opacity: 0.6 }), gp);
      },
      drawThigh(gp, side, ctx) {
        const w = 27 * k;
        const L = dims.thighLen;
        path(`M ${-w} -10 L ${-w + 3} ${L + 6} Q 0 ${L + 20} ${w - 3} ${L + 6} L ${w} -10 Q 0 -24 ${-w} -10 Z`, fo(cfg.pants), gp);
      },
      drawShin(gp, side, ctx) {
        const w0 = 24 * k, w1 = 19 * k;
        const L = dims.shinLen;
        path(`M ${-w0} -6 L ${-w1} ${L} L ${w1} ${L} L ${w0} -6 Q 0 -20 ${-w0} -6 Z`, fo(cfg.pants), gp);
        if (cfg.boots) path(`M ${-w1 - 3} ${L - 70} L ${w1 + 3} ${L - 70} L ${w1 + 2} ${L + 2} L ${-w1 - 2} ${L + 2} Z`, fo(cfg.boots), gp);
      },
      drawFoot(gp, side, ctx) {
        path(`M -22 -8 L 16 -10 Q 52 -6 56 10 L 56 18 L -24 18 Z`, fo(cfg.shoe || C.shoe), gp);
        path(`M -20 12 L 54 12`, GS.line(2, "#000", { opacity: 0.35 }), gp);
      },

      drawTorso(gp, view, ctx) {
        if (view === "front") {
          // inner layer visible at the centre
          path(`M -40 ${neckY - 8} L 40 ${neckY - 8} L 46 ${hipY + 10} L -46 ${hipY + 10} Z`, fo(inner), gp);
          // coat panels
          path(`M ${X(-36)} ${neckY - 10} Q ${X(-92)} ${neckY} ${X(-100)} ${shY + 34} Q ${X(-104)} ${waistY - 60} ${X(-96)} ${waistY} L ${X(-98)} ${hipY + 14} L ${X(-24)} ${hipY + 14} Q ${X(-16)} ${waistY} ${X(-22)} ${neckY + 40} Z`, fo(coat), gp);
          path(`M ${X(36)} ${neckY - 10} Q ${X(92)} ${neckY} ${X(100)} ${shY + 34} Q ${X(104)} ${waistY - 60} ${X(96)} ${waistY} L ${X(98)} ${hipY + 14} L ${X(24)} ${hipY + 14} Q ${X(16)} ${waistY} ${X(22)} ${neckY + 40} Z`, fo(coat), gp);
          path(`M ${X(60)} ${shY + 20} Q ${X(88)} ${waistY - 40} ${X(84)} ${hipY + 10} L ${X(96)} ${hipY + 10} Q ${X(102)} ${waistY - 40} ${X(96)} ${shY + 30} Z`, ff(coatShade), gp);
          if (cfg.drawCollar) cfg.drawCollar(gp, "front", ctx);
          if (cfg.drawTorsoExtra) cfg.drawTorsoExtra(gp, "front", ctx);
          return;
        }
        // 3/4 view facing +x: opening right of centre
        path(`M ${X(-30)} ${neckY - 8} L ${X(42)} ${neckY - 8} L ${X(46)} ${hipY + 10} L ${X(-30)} ${hipY + 10} Z`, fo(inner), gp);
        // back panel (big silhouette, from far shoulder edge round to the opening)
        path(`M ${X(-30)} ${neckY - 10} Q ${X(-86)} ${neckY - 2} ${X(-94)} ${shY + 30} Q ${X(-100)} ${waistY - 70} ${X(-92)} ${waistY} L ${X(-96)} ${hipY + 14} L ${X(14)} ${hipY + 14} Q ${X(20)} ${waistY} ${X(14)} ${neckY + 36} Q ${X(8)} ${neckY + 6} ${X(-4)} ${neckY - 8} Z`, fo(coat), gp);
        // front panel (narrow, toward the facing side)
        path(`M ${X(40)} ${neckY - 8} Q ${X(70)} ${neckY} ${X(76)} ${shY + 30} Q ${X(84)} ${waistY - 60} ${X(76)} ${waistY} L ${X(80)} ${hipY + 14} L ${X(46)} ${hipY + 14} Q ${X(40)} ${waistY} ${X(44)} ${neckY + 40} Z`, fo(coat), gp);
        // one shading shape (back side) + one rim (front edge, cold top light)
        path(`M ${X(-90)} ${shY + 40} Q ${X(-96)} ${waistY - 50} ${X(-90)} ${hipY + 12} L ${X(-60)} ${hipY + 12} Q ${X(-70)} ${waistY - 40} ${X(-66)} ${shY + 44} Z`, ff(coatShade), gp);
        path(`M ${X(66)} ${shY + 16} Q ${X(76)} ${waistY - 40} ${X(72)} ${hipY + 8}`, GS.line(6, coatRim, { opacity: 0.6 }), gp);
        if (cfg.pocket !== false) path(`M ${X(-70)} ${waistY + 30} L ${X(-20)} ${waistY + 34}`, GS.line(2.5, C.outline, { opacity: 0.55 }), gp);
        if (cfg.drawCollar) cfg.drawCollar(gp, "three", ctx);
        if (cfg.drawTorsoExtra) cfg.drawTorsoExtra(gp, "three", ctx);
      },
      // coat skirt below the hips (pivots at the hips so kneeling poses can fold it)
      drawSkirt(gp, view, ctx) {
        if (hemY <= hipY + 10) return;
        const flare = cfg.flare || 16;
        const top = hipY - 6; // overlaps the torso so no seam line shows
        // panel: fill without outline, then outline only the sides + hem (open path)
        const panel = (x0, x1, x2, x3, shade) => {
          path(`M ${X(x0)} ${top} L ${X(x1)} ${hemY} L ${X(x2)} ${hemY + 4} L ${X(x3)} ${top} Z`, ff(coat), gp);
          if (shade) path(`M ${X(x0 + 4)} ${hipY + 30} L ${X(x1 + 6)} ${hemY - 4} L ${X(x1 + 34)} ${hemY} L ${X(x0 + 32)} ${hipY + 30} Z`, ff(coatShade), gp);
          path(`M ${X(x0)} ${hipY + 8} L ${X(x1)} ${hemY} L ${X(x2)} ${hemY + 4} L ${X(x3)} ${hipY + 8}`, Object.assign({ fill: "none" }, GS.OUT), gp);
        };
        if (view === "front") {
          panel(-98, -98 - flare, -22, -24, false);
          panel(98, 98 + flare, 22, 24, false);
          return;
        }
        panel(-96, -96 - flare, 16, 14, true);
        panel(80, 82 + flare, 42, 46, false);
      },
      drawSkirtBack(gp, view, ctx) {
        // inner lining seen between the open coat flaps
        if (hemY <= hipY + 10) return;
        if (view === "front") path(`M ${X(-30)} ${hipY + 4} L ${X(30)} ${hipY + 4} L ${X(36)} ${hemY - 2} L ${X(-36)} ${hemY - 2} Z`, fo(cfg.lining || coatShade), gp);
        else path(`M ${X(10)} ${hipY + 4} L ${X(50)} ${hipY + 4} L ${X(56)} ${hemY - 2} L ${X(6)} ${hemY - 2} Z`, fo(cfg.lining || coatShade), gp);
      },
      drawNeck(gp, ctx) {
        path(`M -21 ${neckY - 46} L -20 ${neckY + 6} L 22 ${neckY + 6} L 23 ${neckY - 46} Z`, fo(skin), gp);
        path(`M -20 ${neckY - 40} Q 2 ${neckY - 18} 22 ${neckY - 40} L 22 ${neckY - 30} Q 2 ${neckY - 8} -20 ${neckY - 30} Z`, ff(skinShade), gp);
        if (cfg.drawNeckExtra) cfg.drawNeckExtra(gp, ctx);
      },
      drawHairBack(gp, ctx) {
        if (cfg.drawHairBack) cfg.drawHairBack(gp, ctx);
      },
      drawEar(gp, s, ctx) {
        el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 19, fill: skin, ...GS.OUT }, gp);
        path(`M ${-4 * s} -8 Q ${4 * s} 0 ${-3 * s} 9`, GS.line(2.2, skinShade), gp);
      },
      drawHead(gp, ctx) {
        path(HEAD_D, fo(skin), gp);
      },
      drawHeadShade(gp, ctx) {
        // one shading shape: cheek/jaw on the side away from the turn (cool top light)
        path(`M -92 0 C -90 46 -62 94 -6 103 C -50 86 -74 50 -78 4 Z`, ff(skinShade, { opacity: 0.75 }), gp);
      },
      drawUnderEye(gp, ctx) {
        if (cfg.underEye) {
          [-1, 1].forEach((s) => path(`M ${s * 33 - 10} 15 Q ${s * 33} 20 ${s * 33 + 10} 15`, GS.line(2.4, C.underEye, { opacity: 0.9 }), gp));
        }
      },
      drawNose(gp, ctx) {
        path(`M 0 0 Q 10 15 1 22`, GS.line(3, cfg.noseColor || C.outline, { opacity: 0.85 }), gp);
      },
      drawHairFront(gp, ctx) {
        if (cfg.drawHairFront) cfg.drawHairFront(gp, ctx);
      },
    };
    return spec;
  };

  const HEAD_D = "M 0 -104 C 58 -104 94 -64 93 -8 C 92 44 64 96 0 104 C -64 96 -92 44 -93 -8 C -94 -64 -58 -104 0 -104 Z";
  GS.HEAD_D = HEAD_D;

  // Hands (wrist at 0,0, pointing down +y, thumb toward +x = facing side).
  function drawHand(gp, shape, skin, shade) {
    const S = fo(skin);
    switch (shape) {
      case "relaxed":
        path(`M -16 -2 C -19 16 -15 40 -2 45 C 12 44 18 24 16 -2 Z`, S, gp);
        path(`M 13 6 C 24 14 25 26 17 32`, fo(skin), gp);
        path(`M -8 30 L -7 42 M 0 32 L 1 44`, GS.line(1.8, GS.C.outline, { opacity: 0.5 }), gp);
        break;
      case "open":
        // palm toward camera, fingers spread
        path(`M -17 -2 C -20 14 -18 30 -14 34 L 14 34 C 18 28 19 14 16 -2 Z`, S, gp);
        [[-14, 34, -20, 60], [-5, 35, -6, 66], [4, 35, 6, 66], [12, 33, 18, 58]].forEach(([x0, y0, x1, y1]) => {
          path(`M ${x0} ${y0} L ${x1} ${y1}`, { stroke: GS.C.outline, "stroke-width": 13, "stroke-linecap": "round", fill: "none" }, gp);
          path(`M ${x0} ${y0} L ${x1} ${y1}`, { stroke: skin, "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, gp);
        });
        path(`M 14 6 C 30 10 36 20 34 28`, { stroke: GS.C.outline, "stroke-width": 13, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M 14 6 C 30 10 36 20 34 28`, { stroke: skin, "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M -14 4 C -6 2 6 2 14 4 L 12 30 L -12 30 Z`, S, gp);
        break;
      case "fist":
        path(`M -18 -2 L 17 -2 Q 22 18 18 30 Q 0 38 -18 30 Q -22 16 -18 -2 Z`, S, gp);
        path(`M -14 20 Q -8 24 -2 20 Q 4 24 10 20`, GS.line(1.8, GS.C.outline, { opacity: 0.6 }), gp);
        path(`M 14 4 C 24 10 22 22 12 22`, fo(skin), gp);
        break;
      case "grip":
        // palm behind the prop; fingers come from hand-over
        path(`M -17 -2 L 16 -2 Q 20 14 17 24 L -17 24 Q -20 12 -17 -2 Z`, S, gp);
        path(`M 13 4 C 26 10 26 24 16 28`, fo(skin), gp);
        break;
      case "point":
        path(`M -18 -2 L 17 -2 Q 22 18 18 30 Q 0 38 -18 30 Q -22 16 -18 -2 Z`, S, gp);
        path(`M 8 26 L 12 66`, { stroke: GS.C.outline, "stroke-width": 13, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M 8 26 L 12 66`, { stroke: skin, "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, gp);
        break;
      case "pinch":
        path(`M -17 -2 C -20 14 -16 34 -4 38 C 8 38 16 24 15 -2 Z`, S, gp);
        path(`M 6 30 L 10 52`, { stroke: GS.C.outline, "stroke-width": 12, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M 6 30 L 10 52`, { stroke: skin, "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M 13 6 C 24 16 22 40 14 52`, { stroke: GS.C.outline, "stroke-width": 12, "stroke-linecap": "round", fill: "none" }, gp);
        path(`M 13 6 C 24 16 22 40 14 52`, { stroke: skin, "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, gp);
        break;
    }
  }
  GS.drawHand = drawHand;
})();
