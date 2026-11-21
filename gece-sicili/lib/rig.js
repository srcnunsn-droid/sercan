// Gece Sicili puppet rig engine.
// A character module (characters/<name>.js) supplies a SPEC: dimensions + draw functions.
// GS.buildRig(spec) builds the SVG ONCE and returns { el, set(state), state }.
// The rig is pure geometry: life (breath, blinks, lip-flap) is computed by the player from time.
//
// Coordinates: character local space, feet at (0,0), y up = negative, facing +x (screen-right).
// facing "left" flips ONLY the character group; held props counter-flip so text never mirrors.
//
// Anatomical arms/legs: pose data uses R / L (the character's own right / left).
// 3/4 view facing right -> the character's RIGHT side is near the camera. Facing left (flipped)
// -> the LEFT side is near. The rig re-parents the anatomical limb into the near/far slot, so a
// bandage drawn on the LEFT arm stays on the anatomical left arm in every facing.
(function () {
  const GS = window.GS;
  const { el, g, path } = GS;

  const MOUTHS = ["closed", "small", "open", "wide", "O", "bared"];
  const EYES = ["open", "half", "closed", "wide", "narrow"];
  const BROWS = ["neutral", "up", "down", "worried", "flat"];
  const HANDS = ["relaxed", "open", "fist", "grip", "point", "pinch"];
  GS.MOUTHS = MOUTHS;
  GS.EYES = EYES;
  GS.BROWS = BROWS;
  GS.HANDS = HANDS;

  // Default state: every parameter the rig understands.
  GS.defaultState = function () {
    return {
      x: 0, y: 0, scale: 1, rot: 0, facing: "right", view: "three", // view: "three" (3/4) | "front"
      rootY: 0, lean: 0, breath: 0, // breath: -1..1 (torso scale ~1.5%)
      head: { tilt: 0, turn: 0.45, nod: 0, dx: 0, dy: 0 },
      eyes: "open", look: [0, 0], amber: 0, // amber 0..1 (vampires)
      brows: "neutral", browL: null, browR: null,
      mouth: "closed", mouthAmp: 1,
      armR: { sh: 4, el: 8, wr: 0, hand: "relaxed" },
      armL: { sh: 2, el: 6, wr: 0, hand: "relaxed" },
      legR: { th: 0, kn: 0, ft: 0 },
      legL: { th: 0, kn: 0, ft: 0 },
      skirt: { rot: 0, sy: 1 },
      props: { R: null, L: null }, // prop element ids/keys currently in each hand (managed by player)
    };
  };

  function deg(a) {
    return Math.round(a * 100) / 100;
  }

  GS.buildRig = function (spec, opts) {
    opts = opts || {};
    const id = GS.uid(opts.id || spec.name);
    const D = spec.dims;
    const ctx = { spec, id, C: GS.C, D };

    const root = g({ id, class: "rig rig-" + spec.name });
    const flip = g({ class: "flip" }, root); // facing flip
    const body = g({ class: "body" }, flip); // rootY + lean around hips

    // Slots back-to-front.
    const slots = {};
    ["armFar", "legFar", "legNear", "skirtBack", "hairBack", "torso", "skirt", "neck", "head", "armNear", "fx"].forEach((n) => {
      slots[n] = g({ class: "slot-" + n }, body);
    });

    // ---- Limbs (anatomical) ----
    function buildArm(side) {
      const sh = g({ class: `arm arm${side}` });
      const upper = g({ class: "upper" }, sh);
      spec.drawUpperArm(upper, side, ctx);
      const elbow = g({ class: "elbow" }, upper);
      elbow.setAttribute("transform", `translate(0 ${D.upperLen})`);
      const fore = g({ class: "fore" }, elbow);
      spec.drawForearm(fore, side, ctx);
      const wrist = g({ class: "wrist" }, fore);
      wrist.setAttribute("transform", `translate(0 ${D.foreLen})`);
      const hand = g({ class: "hand" }, wrist);
      const shapes = {};
      HANDS.forEach((h) => {
        const hg = g({ class: "hand-" + h, display: "none" }, hand);
        spec.drawHand(hg, side, h, ctx);
        shapes[h] = hg;
      });
      // Prop slot at the grip point: counter-flipped by set() so props/text never mirror;
      // in "upright" mode it also cancels the limb rotation so text stays level in the world.
      const gripPt = g({ class: "grip-pt", transform: `translate(0 ${D.gripY || 34})` }, hand);
      const propOuter = g({ class: "prop-slot" }, gripPt);
      const propRot = g({ class: "prop-rot" }, propOuter);
      const prop = g({ class: "prop-inner" }, propRot);
      // In front of the prop: fingers wrap (grip overlay), drawn by spec if provided.
      const over = g({ class: "hand-over" }, hand);
      if (spec.drawHandOver) spec.drawHandOver(over, side, ctx);
      return { sh, upper, elbow, fore, wrist, hand, shapes, propOuter, propRot, prop, over, cur: null, upright: false, propAngle: 0 };
    }
    function buildLeg(side) {
      const hip = g({ class: `leg leg${side}` });
      const thigh = g({ class: "thigh" }, hip);
      spec.drawThigh(thigh, side, ctx);
      const knee = g({ class: "knee" }, thigh);
      knee.setAttribute("transform", `translate(0 ${D.thighLen})`);
      const shin = g({ class: "shin" }, knee);
      spec.drawShin(shin, side, ctx);
      const ankle = g({ class: "ankle" }, shin);
      ankle.setAttribute("transform", `translate(0 ${D.shinLen})`);
      const foot = g({ class: "foot" }, ankle);
      spec.drawFoot(foot, side, ctx);
      return { hip, thigh, knee, shin, ankle, foot };
    }
    const arms = { R: buildArm("R"), L: buildArm("L") };
    const legs = { R: buildLeg("R"), L: buildLeg("L") };

    // ---- Torso (two views), skirt, neck ----
    const torsoViews = {};
    ["three", "front"].forEach((v) => {
      const tg = g({ class: "torso-" + v, display: "none" }, slots.torso);
      spec.drawTorso(tg, v, ctx);
      torsoViews[v] = tg;
    });
    const skirtPivot = g({ class: "skirt-pivot" }, slots.skirt);
    const skirtViews = {};
    const skirtBackViews = {};
    ["three", "front"].forEach((v) => {
      const sg = g({ class: "skirt-" + v, display: "none" }, skirtPivot);
      if (spec.drawSkirt) spec.drawSkirt(sg, v, ctx);
      skirtViews[v] = sg;
      const sb = g({ class: "skirtb-" + v, display: "none" }, slots.skirtBack);
      if (spec.drawSkirtBack) spec.drawSkirtBack(sb, v, ctx);
      skirtBackViews[v] = sb;
    });
    spec.drawNeck(slots.neck, ctx);

    // ---- Head ----
    const headBackPivot = g({ class: "head-back" }, slots.hairBack);
    const hairBack = g({ class: "hair-back" }, headBackPivot);
    spec.drawHairBack(hairBack, ctx);

    const headPivot = g({ class: "head-pivot" }, slots.head);
    const ears = { L: g({ class: "earL" }, headPivot), R: g({ class: "earR" }, headPivot) };
    spec.drawEar(ears.L, -1, ctx);
    spec.drawEar(ears.R, 1, ctx);
    const face = g({ class: "face" }, headPivot);
    spec.drawHead(face, ctx);
    const faceShade = g({ class: "face-shade" }, headPivot);
    if (spec.drawHeadShade) spec.drawHeadShade(faceShade, ctx);

    // Facial features (all states pre-built; set() toggles display).
    const feat = g({ class: "features" }, headPivot);
    const under = g({ class: "under-eye" }, feat);
    function buildEye(sideSign) {
      const eg = g({ class: "eye" }, feat);
      const states = {};
      EYES.forEach((s) => {
        const sg = g({ class: "eye-" + s, display: "none" }, eg);
        states[s] = sg;
      });
      const r = spec.eye || { rx: 7, ry: 9 };
      const dot = (parent, rx, ry) => {
        const pg = g({ class: "pupil" }, parent);
        el("ellipse", { cx: 0, cy: 0, rx, ry, fill: GS.C.eyeDot }, pg);
        el("circle", { cx: -rx * 0.35, cy: -ry * 0.4, r: Math.max(1.6, rx * 0.28), fill: GS.C.white, opacity: 0.85 }, pg);
        return pg;
      };
      const amberRings = [];
      const amberRing = (parent, rx, ry) => {
        const a = el("ellipse", { cx: 0, cy: 0, rx: rx + 3.2, ry: ry + 3.2, fill: "none", stroke: GS.C.amber, "stroke-width": 2.4, opacity: 0 }, parent);
        amberRings.push(a);
        return a;
      };
      const lw = spec.lidW || 3.2;
      // open
      let pg = g({}, states.open);
      amberRing(pg, r.rx, r.ry);
      const pOpen = dot(pg, r.rx, r.ry);
      path(`M -12 -13 Q 0 -19 12 -13`, GS.line(lw), states.open);
      // wide
      pg = g({}, states.wide);
      amberRing(pg, r.rx * 1.05, r.ry * 1.1);
      el("ellipse", { cx: 0, cy: 0, rx: r.rx + 5, ry: r.ry + 5, fill: GS.C.white, stroke: GS.C.outline, "stroke-width": 1.6 }, pg);
      const pWide = dot(pg, r.rx * 0.95, r.ry * 1.05);
      path(`M -13 -18 Q 0 -25 13 -18`, GS.line(lw), states.wide);
      // half: lower half of the dot + lid line across
      pg = g({}, states.half);
      amberRing(pg, r.rx, r.ry * 0.6);
      const pHalf = g({ class: "pupil" }, pg);
      path(`M ${-r.rx} -1 A ${r.rx} ${r.ry} 0 0 0 ${r.rx} -1 Z`, { fill: GS.C.eyeDot }, pHalf);
      path(`M -13 -2 Q 0 -5 13 -2`, GS.line(lw), states.half);
      // narrow: lens slice
      pg = g({}, states.narrow);
      amberRing(pg, r.rx, r.ry * 0.45);
      const pNarrow = g({ class: "pupil" }, pg);
      path(`M ${-r.rx} 0 Q 0 ${-r.ry * 0.75} ${r.rx} 0 Q 0 ${r.ry * 0.75} ${-r.rx} 0 Z`, { fill: GS.C.eyeDot }, pNarrow);
      path(`M -13 -4 Q 0 -7 13 -5`, GS.line(lw), states.narrow);
      path(`M -9 5 Q 0 7 9 5`, GS.line(lw * 0.6), states.narrow);
      // closed
      path(`M -12 1 Q 0 8 12 1`, GS.line(lw), states.closed);
      return { eg, states, pupils: [pOpen, pWide, pHalf, pNarrow], amberRings, sideSign, cur: null };
    }
    const eyeL = buildEye(-1); // screen-left eye of the face (at turn 0)
    const eyeR = buildEye(1);
    if (spec.drawUnderEye) spec.drawUnderEye(under, ctx);

    const browG = { L: g({ class: "browL" }, feat), R: g({ class: "browR" }, feat) };
    const browShapes = { L: {}, R: {} };
    const BW = spec.browW || 5;
    const browD = {
      neutral: "M -13 2 Q 0 -4 13 1",
      up: "M -13 -2 Q 0 -10 13 -3",
      down: "M -13 -2 Q 0 0 13 6", // inner end (x>0 toward nose) lower
      worried: "M -13 4 Q 0 -1 13 -6", // inner end higher
      flat: "M -13 1 L 13 1",
    };
    ["L", "R"].forEach((s) => {
      BROWS.forEach((b) => {
        // Inner end points toward the face centre: for the L eye the inner end is +x, for R it is -x.
        const bg = g({ display: "none", transform: s === "R" ? "scale(-1 1)" : null }, browG[s]);
        path(browD[b], GS.line(BW, spec.browColor || GS.C.outline), bg);
        browShapes[s][b] = bg;
      });
    });

    const nose = g({ class: "nose" }, feat);
    spec.drawNose(nose, ctx);

    const mouthG = g({ class: "mouth" }, feat);
    const mouthScale = g({ class: "mouth-scale" }, mouthG);
    const mouths = {};
    MOUTHS.forEach((m) => {
      const mg = g({ class: "mouth-" + m, display: "none" }, mouthScale);
      drawMouth(mg, m, spec);
      mouths[m] = mg;
    });

    const hairFront = g({ class: "hair-front" }, headPivot);
    spec.drawHairFront(hairFront, ctx);

    // ---- Rig state application ----
    const state = GS.defaultState();
    if (spec.defaults) deepMerge(state, spec.defaults);
    let curView = null;

    function show(map, key, curKey) {
      if (curKey === key) return key;
      if (curKey && map[curKey]) map[curKey].setAttribute("display", "none");
      if (map[key]) map[key].setAttribute("display", "inline");
      return key;
    }

    function set(s) {
      if (s) deepMerge(state, s);
      const S = state;
      const flipX = S.facing === "left" ? -1 : 1;
      root.setAttribute("transform", `translate(${deg(S.x)} ${deg(S.y)}) rotate(${deg(S.rot || 0)}) scale(${S.scale})`);
      flip.setAttribute("transform", `scale(${flipX} 1)`);
      body.setAttribute("transform", `translate(0 ${deg(S.rootY)}) rotate(${deg(-S.lean)} 0 ${D.hipY})`);

      // view switch
      if (curView !== S.view) {
        ["three", "front"].forEach((v) => {
          torsoViews[v].setAttribute("display", v === S.view ? "inline" : "none");
          skirtViews[v].setAttribute("display", v === S.view ? "inline" : "none");
          skirtBackViews[v].setAttribute("display", v === S.view ? "inline" : "none");
        });
        curView = S.view;
      }

      // breathing: upper body scales around the waist
      const br = 1 + 0.015 * S.breath;
      const upperT = `translate(0 ${D.waistY}) scale(${1 + 0.004 * S.breath} ${br}) translate(0 ${-D.waistY})`;
      slots.torso.setAttribute("transform", upperT);
      const lift = (D.waistY - D.neckY) * (br - 1); // head/arms ride on the chest
      const nearSide = S.facing === "left" ? "L" : "R";
      const farSide = nearSide === "R" ? "L" : "R";
      const V = S.view === "front" ? D.front : D.three;

      // arms: re-parent anatomical limbs into near/far slots
      placeArm(arms[nearSide], slots.armNear, V.shoulderNear, S["arm" + nearSide], lift, flipX);
      placeArm(arms[farSide], slots.armFar, V.shoulderFar, S["arm" + farSide], lift, flipX);
      placeLeg(legs[nearSide], slots.legNear, V.hipNear, S["leg" + nearSide]);
      placeLeg(legs[farSide], slots.legFar, V.hipFar, S["leg" + farSide]);

      // skirt follows the thighs a bit
      skirtPivot.setAttribute("transform", `rotate(${deg(-S.skirt.rot)} 0 ${D.hipY}) translate(0 ${D.hipY}) scale(1 ${S.skirt.sy}) translate(0 ${-D.hipY})`);
      slots.skirtBack.setAttribute("transform", skirtPivot.getAttribute("transform"));

      // neck + head
      slots.neck.setAttribute("transform", `translate(0 ${deg(-lift)})`);
      const H = S.head;
      const hx = D.headX + H.dx;
      const hy = D.headY - lift + H.dy + H.nod * 6;
      const headT = `translate(${deg(hx)} ${deg(hy)}) rotate(${deg(H.tilt)} 0 ${D.headPivotDy}) scale(${D.headScale})`;
      headPivot.setAttribute("transform", headT);
      headBackPivot.setAttribute("transform", headT);

      // turn: features slide toward the turn side; far ear hides
      const t = GS.clamp(H.turn, -1, 1);
      const sp = D.eyeSpacing * (1 - 0.22 * Math.abs(t));
      const cx = D.featureShift * t;
      const eyeY = D.eyeY + H.nod * 3;
      const sq = 1 - 0.18 * Math.abs(t); // far-side squash
      eyeL.eg.setAttribute("transform", `translate(${deg(cx - sp)} ${eyeY}) scale(${t > 0 ? 1 : sq} 1)`);
      eyeR.eg.setAttribute("transform", `translate(${deg(cx + sp)} ${eyeY}) scale(${t < 0 ? 1 : sq} 1)`);
      eyeL.eg.setAttribute("display", t > 0.82 ? "none" : "inline");
      eyeR.eg.setAttribute("display", t < -0.82 ? "none" : "inline");
      under.setAttribute("transform", `translate(${deg(cx)} ${eyeY})`);
      browG.L.setAttribute("transform", `translate(${deg(cx - sp)} ${eyeY + D.browDy})`);
      browG.R.setAttribute("transform", `translate(${deg(cx + sp)} ${eyeY + D.browDy})`);
      browG.L.setAttribute("display", t > 0.82 ? "none" : "inline");
      browG.R.setAttribute("display", t < -0.82 ? "none" : "inline");
      nose.setAttribute("transform", `translate(${deg(D.noseShift * t)} ${D.noseY}) scale(${t < 0 ? -1 : 1} 1)`);
      mouthG.setAttribute("transform", `translate(${deg(cx * 0.95)} ${D.mouthY + H.nod * 2})`);
      ears.L.setAttribute("transform", `translate(${deg(-D.earX + Math.max(0, t) * D.earX * 0.42)} ${D.earY})`);
      ears.R.setAttribute("transform", `translate(${deg(D.earX + Math.min(0, t) * D.earX * 0.42)} ${D.earY})`);
      ears.L.setAttribute("display", t < -0.5 ? "none" : "inline");
      ears.R.setAttribute("display", t > 0.5 ? "none" : "inline");
      hairFront.setAttribute("transform", `translate(${deg(D.hairFrontShift * t)} 0)`);
      hairBack.setAttribute("transform", `translate(${deg(-D.hairBackShift * t)} 0)`);
      if (spec.onTurn) spec.onTurn(ctx, t, { hairFront, hairBack, face });

      // eyes / pupils / amber
      eyeL.cur = show(eyeL.states, S.eyes, eyeL.cur);
      eyeR.cur = show(eyeR.states, S.eyes, eyeR.cur);
      const lx = GS.clamp(S.look[0], -1, 1) * 4.5;
      const ly = GS.clamp(S.look[1], -1, 1) * 3.5;
      [eyeL, eyeR].forEach((E) => {
        E.pupils.forEach((p) => p.setAttribute("transform", `translate(${deg(lx)} ${deg(ly)})`));
        E.amberRings.forEach((a) => a.setAttribute("opacity", spec.vampire ? GS.clamp(S.amber, 0, 1) : 0));
      });

      // brows (per-side override allowed)
      browG.L.cur = show(browShapes.L, S.browL || S.brows, browG.L.cur);
      browG.R.cur = show(browShapes.R, S.browR || S.brows, browG.R.cur);

      // mouth
      mouthG.cur = show(mouths, S.mouth, mouthG.cur);
      const amp = GS.clamp(S.mouthAmp, 0.4, 1.4);
      mouthScale.setAttribute("transform", S.mouth === "closed" ? "" : `scale(${deg(0.85 + 0.15 * amp)} ${deg(amp)})`);

      // hand shapes + props (counter-flip prop slot)
      ["R", "L"].forEach((sd) => {
        const A = arms[sd];
        A.cur = show(A.shapes, S["arm" + sd].hand || "relaxed", A.cur);
        A.over.setAttribute("display", A.cur === "grip" ? "inline" : "none");
        A.propOuter.setAttribute("transform", flipX < 0 ? "scale(-1 1)" : "");
        const P = S["arm" + sd];
        const pa = P.prop !== undefined ? P.prop : A.propAngle; // extra prop angle (world deg)
        if (A.upright) {
          const a = -((P.sh || 0) + (P.el || 0) + (P.wr || 0)) - (S.lean || 0);
          const R = (flipX < 0 ? a : -a) - (S.rot || 0) + pa;
          A.propRot.setAttribute("transform", `rotate(${deg(R)})`);
        } else A.propRot.setAttribute("transform", pa ? `rotate(${deg(pa)})` : "");
      });
      return api;
    }

    function placeArm(A, slot, pos, P, lift, flipX) {
      if (A.sh.parentNode !== slot) slot.appendChild(A.sh);
      A.sh.setAttribute("transform", `translate(${pos[0]} ${deg(pos[1] - lift)})`);
      A.upper.setAttribute("transform", `rotate(${deg(-(P.sh || 0))})`);
      A.fore.setAttribute("transform", `rotate(${deg(-(P.el || 0))})`);
      A.hand.setAttribute("transform", `rotate(${deg(-(P.wr || 0))})`);
    }
    function placeLeg(Lg, slot, pos, P) {
      if (Lg.hip.parentNode !== slot) slot.appendChild(Lg.hip);
      Lg.hip.setAttribute("transform", `translate(${pos[0]} ${pos[1]})`);
      Lg.thigh.setAttribute("transform", `rotate(${deg(-(P.th || 0))})`);
      Lg.shin.setAttribute("transform", `rotate(${deg(P.kn || 0)})`);
      Lg.foot.setAttribute("transform", `rotate(${deg(-(P.ft || 0))})`);
    }

    // Attach a prop element to a hand (anatomical side). Returns the prop group.
    // upright: keep the prop level in the world (paper, book, tray) regardless of arm angles.
    function holdProp(side, propEl, offset, upright) {
      const A = arms[side];
      A.upright = !!upright;
      while (A.prop.firstChild) A.prop.removeChild(A.prop.firstChild);
      if (propEl) {
        if (offset) A.prop.setAttribute("transform", offset);
        A.prop.appendChild(propEl);
      } else A.prop.removeAttribute("transform");
      set();
      return A.prop;
    }

    const api = { el: root, id, set, state, holdProp, arms, legs, spec, parts: { headPivot, hairFront, hairBack, slots, mouths, face } };
    set();
    return api;
  };

  // Shared mouth drawing (same face language for every character). Mouth sits at (0,0).
  function drawMouth(mg, m, spec) {
    const C = GS.C;
    const vamp = !!spec.vampire;
    const inside = { fill: C.mouthIn, stroke: C.outline, "stroke-width": 2.2, "stroke-linejoin": "round" };
    const W = spec.mouthW || 1;
    const sx = (v) => v * W;
    switch (m) {
      case "closed":
        mg.appendChild(path(`M ${sx(-13)} 0 Q 0 ${spec.mouthCurve || 2.5} ${sx(13)} 0`, GS.line(3.2)));
        break;
      case "small":
        mg.appendChild(path(`M ${sx(-8)} -1 Q 0 -4 ${sx(8)} -1 Q 0 6 ${sx(-8)} -1 Z`, inside));
        break;
      case "open":
        mg.appendChild(path(`M ${sx(-12)} -3 Q 0 -7 ${sx(12)} -3 Q ${sx(8)} 13 0 14 Q ${sx(-8)} 13 ${sx(-12)} -3 Z`, inside));
        mg.appendChild(path(`M ${sx(-6)} 9 Q 0 6 ${sx(6)} 9 Q 0 13 ${sx(-6)} 9 Z`, { fill: "#7a3a44" }));
        break;
      case "wide": {
        mg.appendChild(path(`M ${sx(-17)} -4 Q 0 -9 ${sx(17)} -4 Q ${sx(12)} 19 0 20 Q ${sx(-12)} 19 ${sx(-17)} -4 Z`, inside));
        mg.appendChild(path(`M ${sx(-13)} -4.5 Q 0 -8 ${sx(13)} -4.5 L ${sx(12)} -1 Q 0 -3.5 ${sx(-12)} -1 Z`, { fill: C.teeth }));
        if (vamp) fangs(mg, sx, -1.5, 7);
        mg.appendChild(path(`M ${sx(-8)} 14 Q 0 10 ${sx(8)} 14 Q 0 18 ${sx(-8)} 14 Z`, { fill: "#7a3a44" }));
        break;
      }
      case "O":
        mg.appendChild(el("ellipse", { cx: 0, cy: 3, rx: sx(8), ry: 10, fill: C.mouthIn, stroke: C.outline, "stroke-width": 2.2 }));
        break;
      case "bared": {
        mg.appendChild(path(`M ${sx(-17)} -3 Q 0 -6 ${sx(17)} -3 Q ${sx(14)} 9 0 9 Q ${sx(-14)} 9 ${sx(-17)} -3 Z`, inside));
        mg.appendChild(path(`M ${sx(-15)} -3 Q 0 -5.5 ${sx(15)} -3 L ${sx(14)} 2 Q 0 0 ${sx(-14)} 2 Z`, { fill: C.teeth }));
        mg.appendChild(path(`M ${sx(-13)} 8 Q 0 4 ${sx(13)} 8 L ${sx(14)} 4.5 Q 0 2 ${sx(-14)} 4.5 Z`, { fill: C.teeth }));
        if (vamp) fangs(mg, sx, 1.5, 8);
        break;
      }
    }
  }
  function fangs(mg, sx, y0, len) {
    [-1, 1].forEach((s) => {
      const x = sx(9) * s;
      mg.appendChild(path(`M ${x - 3 * s} ${y0} L ${x + 2.5 * s} ${y0} L ${x} ${y0 + len} Z`, { fill: GS.C.white, stroke: GS.C.outline, "stroke-width": 1.4, "stroke-linejoin": "round" }));
    });
  }

  function deepMerge(a, b) {
    for (const k in b) {
      const v = b[k];
      if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) deepMerge(a[k], v);
      else a[k] = Array.isArray(v) ? v.slice() : v;
    }
    return a;
  }
  GS.deepMerge = deepMerge;
})();
