// SET GROUP 1 — MORGUE (+ register room door). Layered for parallax: far / mid / near.
// World units = character units (İdil ~1000 tall). Standing line y = 0. Back-wall base y = -180.
// Layout (bolum-01.md): İdil screen-left; gurney centre; drawer wall screen-right;
// outer door right-back; back exit + register shelf + alarm cord behind İdil.
(function () {
  const GS = window.GS;
  const { el, g, path, fo, ff } = GS;
  const C = GS.C;
  GS.SET = GS.SET || {};

  // Layout constants (also used by episode data/camera).
  const M = (GS.MORGUE = {
    wallBase: -180, ceiling: -2200,
    exit: { x0: -1900, x1: -1540, y0: -1300 },
    shelf: { x0: -1470, x1: -1070, y0: -1560, y1: -560 },
    cord: { x: -900, top: -2150, ringY: -980 },
    table: { x0: -560, x1: -300, top: -470 },
    gurney: { x0: -150, x1: 950, top: -540 },
    drawers: { x0: 1060, cols: 3, rows: 4, w: 300, h: 330, empty: [1, 0] }, // [col,row] row 0 = bottom
    door: { x0: 2080, x1: 2480, y0: -1340, handle: [2130, -720] },
    light: { x: 300, y: -2110 },
    idilMark: -700, sarenFeetX: 1000,
  });

  GS.SET.morgue = function (opts) {
    opts = opts || {};
    const id = GS.uid("morgue");
    const far = g({ class: "layer-far", id: id + "-far" });
    const mid = g({ class: "layer-mid", id: id + "-mid" });
    const near = g({ class: "layer-near", id: id + "-near" });
    const parts = {};

    // ---------- FAR: walls, ceiling, light glow, pipes ----------
    const defs = el("defs", {}, far);
    const glowId = id + "-glow";
    const rg = el("radialGradient", { id: glowId, cx: "50%", cy: "0%", r: "75%" }, defs);
    el("stop", { offset: "0%", "stop-color": C.fluo, "stop-opacity": 0.34 }, rg);
    el("stop", { offset: "45%", "stop-color": C.fluo, "stop-opacity": 0.1 }, rg);
    el("stop", { offset: "100%", "stop-color": C.fluo, "stop-opacity": 0 }, rg);
    const floorGlowId = id + "-fglow";
    const rg2 = el("radialGradient", { id: floorGlowId, cx: "50%", cy: "50%", r: "50%" }, defs);
    el("stop", { offset: "0%", "stop-color": C.fluo, "stop-opacity": 0.16 }, rg2);
    el("stop", { offset: "100%", "stop-color": C.fluo, "stop-opacity": 0 }, rg2);

    el("rect", { x: -3000, y: -3200, width: 6400, height: 3100, fill: "#22393e" }, far); // upper wall
    el("rect", { x: -2600, y: -960, width: 5600, height: 800, fill: C.teal }, far); // tiled wainscot
    for (let x = -2600; x < 3000; x += 120) path(`M ${x} -960 L ${x} ${M.wallBase}`, GS.line(2, "#3b5d62", { opacity: 0.7 }), far);
    for (let y = -960; y < M.wallBase; y += 120) path(`M -2600 ${y} L 3000 ${y}`, GS.line(2, "#3b5d62", { opacity: 0.7 }), far);
    el("rect", { x: -2600, y: -972, width: 5600, height: 24, fill: "#1f3236", stroke: C.outline, "stroke-width": 3, "vector-effect": "non-scaling-stroke" }, far);
    el("rect", { x: -3000, y: -3200, width: 6400, height: 1020, fill: C.navy }, far); // ceiling band
    // pipes
    path(`M -2600 -1980 L 3000 -1980`, { stroke: C.outline, "stroke-width": 34, fill: "none" }, far);
    path(`M -2600 -1980 L 3000 -1980`, { stroke: "#4c6468", "stroke-width": 26, fill: "none" }, far);
    path(`M -2600 -1986 L 3000 -1986`, { stroke: "#7d989c", "stroke-width": 5, fill: "none", opacity: 0.6 }, far);
    // light glow on the wall (baked gradient, flicker = opacity)
    parts.glow = el("ellipse", { cx: M.light.x, cy: M.light.y, rx: 2300, ry: 2000, fill: `url(#${glowId})` }, far);

    // ---------- MID: floor, fixtures, furniture ----------
    // floor (flat tiles with cheap perspective)
    el("rect", { x: -3000, y: M.wallBase, width: 6400, height: 2800, fill: "#151b27" }, mid);
    [-140, -80, 0, 110, 260, 460, 760].forEach((y) => path(`M -2600 ${y} L 3000 ${y}`, GS.line(2, "#26303f"), mid));
    for (let x = -3600; x <= 4000; x += 300) {
      const vx = 200, vy = -1500;
      const x2 = vx + (x - vx) * ((1200 - vy) / (M.wallBase - vy));
      path(`M ${x} ${M.wallBase} L ${x2} 1200`, GS.line(2, "#26303f"), mid);
    }
    el("ellipse", { cx: M.light.x, cy: 80, rx: 1500, ry: 300, fill: `url(#${floorGlowId})` }, mid);
    path(`M -2600 ${M.wallBase} L 3000 ${M.wallBase}`, GS.line(5, C.outline), mid);

    // light fixture (tube) — hangs from the ceiling
    const fx = g({ class: "tube-light" }, mid);
    path(`M ${M.light.x - 200} -2200 L ${M.light.x - 200} -2140 M ${M.light.x + 200} -2200 L ${M.light.x + 200} -2140`, GS.line(4, C.outline), fx);
    path(`M ${M.light.x - 280} -2140 L ${M.light.x + 280} -2140 L ${M.light.x + 260} -2096 L ${M.light.x - 260} -2096 Z`, fo("#3b4650"), fx);
    parts.tube = el("rect", { x: M.light.x - 240, y: -2100, width: 480, height: 18, rx: 9, fill: C.fluo, stroke: C.outline, "stroke-width": 3, "vector-effect": "non-scaling-stroke" }, fx);

    // back exit (steel door behind İdil)
    const ex = g({ class: "back-exit" }, mid);
    const E = M.exit;
    path(`M ${E.x0 - 24} ${E.y0 - 24} L ${E.x1 + 24} ${E.y0 - 24} L ${E.x1 + 24} ${M.wallBase} L ${E.x0 - 24} ${M.wallBase} Z`, fo("#1d2a30"), ex);
    path(`M ${E.x0} ${E.y0} L ${E.x1} ${E.y0} L ${E.x1} ${M.wallBase} L ${E.x0} ${M.wallBase} Z`, fo("#6f8590"), ex);
    path(`M ${E.x0 + 30} ${E.y0 + 30} L ${E.x1 - 30} ${E.y0 + 30} L ${E.x1 - 30} ${E.y0 + 420} L ${E.x0 + 30} ${E.y0 + 420} Z`, fo("#5d717b"), ex);
    path(`M ${E.x0 + 30} -700 L ${E.x1 - 30} -700`, { stroke: C.outline, "stroke-width": 26, "stroke-linecap": "round", fill: "none" }, ex);
    path(`M ${E.x0 + 30} -700 L ${E.x1 - 30} -700`, { stroke: "#b5c4ca", "stroke-width": 18, "stroke-linecap": "round", fill: "none" }, ex);
    path(`M ${E.x1 - 10} ${E.y0 + 10} L ${E.x1 - 10} ${M.wallBase - 10}`, GS.line(6, "#9fb3bb", { opacity: 0.6 }), ex);

    // shelf with old registers
    const sh = g({ class: "shelf" }, mid);
    const S = M.shelf;
    path(`M ${S.x0} ${S.y0} L ${S.x1} ${S.y0} L ${S.x1} ${M.wallBase} L ${S.x0} ${M.wallBase} Z`, fo("#2b2622"), sh);
    const levels = [S.y0 + 20, -1290, -1030, -770];
    const colorsB = ["#4a3a32", "#3d3134", "#5a4636", "#3a3a40", "#4d3b2f", "#3f2f2a"];
    levels.forEach((ly, li) => {
      const bot = li < 3 ? levels[li + 1] - 26 : S.y1;
      let x = S.x0 + 20;
      let n = 0;
      while (x < S.x1 - 60) {
        const w = 34 + ((li * 7 + n * 13) % 4) * 8;
        const hgt = 170 + ((li * 5 + n * 11) % 3) * 30;
        const isPull = li === 3 && x > S.x1 - 140; // the register İdil pulls
        const book = path(`M ${x} ${bot - hgt} L ${x + w} ${bot - hgt} L ${x + w} ${bot} L ${x} ${bot} Z`, fo(colorsB[(li + n) % colorsB.length]), isPull ? null : sh);
        if (isPull) {
          parts.shelfRegister = g({ class: "shelf-register" }, sh);
          parts.shelfRegister.appendChild(book);
          path(`M ${x + 6} ${bot - hgt + 30} L ${x + w - 6} ${bot - hgt + 30}`, GS.line(3, "#8a6a4a"), parts.shelfRegister);
          parts.shelfRegisterPos = [x + w / 2, bot - hgt / 2];
        } else path(`M ${x + 6} ${bot - hgt + 24} L ${x + w - 6} ${bot - hgt + 24}`, GS.line(2, "#8a6a4a", { opacity: 0.6 }), sh);
        x += w + 4;
        n++;
      }
      path(`M ${S.x0} ${bot} L ${S.x1} ${bot} L ${S.x1} ${bot + 26} L ${S.x0} ${bot + 26} Z`, fo("#3a322c"), sh);
    });

    // alarm cord: dynamic line (top fixed, end follows the ring / İdil's hand)
    const cordG = g({ class: "alarm-cord" }, mid);
    el("rect", { x: M.cord.x - 30, y: M.cord.top - 30, width: 60, height: 40, fill: "#3b4650", stroke: C.outline, "stroke-width": 3, "vector-effect": "non-scaling-stroke" }, cordG);
    parts.cordLineOut = path("", { stroke: C.outline, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, cordG);
    parts.cordLine = path("", { stroke: "#9c8f7a", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, cordG);
    parts.ring = g({ class: "ring-pos" }, cordG);
    parts.ring.appendChild(GS.PROP.alarmRing());
    // setCord(endX, endY, sway): world coords of the ring top
    parts.setCord = function (x, y, sway) {
      sway = sway || 0;
      const mx = (M.cord.x + x) / 2 + sway, my = (M.cord.top + y) / 2;
      const d = `M ${M.cord.x} ${M.cord.top} Q ${mx} ${my} ${x} ${y}`;
      parts.cordLineOut.setAttribute("d", d);
      parts.cordLine.setAttribute("d", d);
      parts.ring.setAttribute("transform", `translate(${x} ${y})`);
    };
    parts.setCord(M.cord.x, M.cord.ringY, 0);

    // drawer wall (3 x 4)
    const dw = g({ class: "drawer-wall" }, mid);
    const DW = M.drawers;
    const wallTop = M.wallBase - DW.rows * DW.h - 40;
    path(`M ${DW.x0 - 30} ${wallTop} L ${DW.x0 + DW.cols * DW.w + 30} ${wallTop} L ${DW.x0 + DW.cols * DW.w + 30} ${M.wallBase} L ${DW.x0 - 30} ${M.wallBase} Z`, fo("#4b5c64"), dw);
    parts.drawers = [];
    for (let r = 0; r < DW.rows; r++) {
      for (let c = 0; c < DW.cols; c++) {
        const x = DW.x0 + c * DW.w + 10, y = M.wallBase - (r + 1) * DW.h + 10;
        const w = DW.w - 20, h = DW.h - 20;
        const isEmpty = c === DW.empty[0] && r === DW.empty[1];
        const cell = g({ class: "drawer" }, dw);
        // dark interior (seen when the door opens)
        path(`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`, fo("#07090e"), cell);
        const doorG = g({ class: "drawer-door" }, cell);
        path(`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`, fo("#8b9ea6"), doorG);
        path(`M ${x + 8} ${y + 8} L ${x + w - 8} ${y + 8}`, GS.line(4, "#c4d3d8", { opacity: 0.7 }), doorG);
        path(`M ${x + w * 0.3} ${y + h * 0.55} L ${x + w * 0.7} ${y + h * 0.55}`, { stroke: C.outline, "stroke-width": 18, "stroke-linecap": "round", fill: "none" }, doorG);
        path(`M ${x + w * 0.3} ${y + h * 0.55} L ${x + w * 0.7} ${y + h * 0.55}`, { stroke: "#cfdade", "stroke-width": 11, "stroke-linecap": "round", fill: "none" }, doorG);
        path(`M ${x + w * 0.38} ${y + h * 0.2} L ${x + w * 0.62} ${y + h * 0.2} L ${x + w * 0.62} ${y + h * 0.33} L ${x + w * 0.38} ${y + h * 0.33} Z`, fo(isEmpty ? "#c9cfcf" : "#e2dccb", { "stroke-width": 2 }), doorG);
        parts.drawers.push({ c, r, x, y, w, h, cell, doorG, isEmpty });
        if (isEmpty) {
          parts.emptyDrawer = { x, y, w, h, cell, doorG };
          // open(t): 0 closed .. 1 door swung fully (hinge at left edge)
          parts.emptyDrawer.open = function (t) {
            const sx = 1 - 0.9 * GS.clamp(t, 0, 1);
            doorG.setAttribute("transform", `translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`);
          };
        }
      }
    }

    // outer door (frosted window, lever handle), corridor light under it
    const dg = g({ class: "outer-door" }, mid);
    const Dd = M.door;
    parts.corridor = path(`M ${Dd.x0} ${Dd.y0} L ${Dd.x1} ${Dd.y0} L ${Dd.x1} ${M.wallBase} L ${Dd.x0} ${M.wallBase} Z`, ff("#f1ead0"), dg);
    path(`M ${Dd.x0 - 26} ${Dd.y0 - 26} L ${Dd.x1 + 26} ${Dd.y0 - 26} L ${Dd.x1 + 26} ${M.wallBase} L ${Dd.x0 - 26} ${M.wallBase} Z`, { fill: "none", stroke: "#1d2a30", "stroke-width": 26 }, dg);
    const doorPanel = g({ class: "door-panel" }, dg);
    path(`M ${Dd.x0} ${Dd.y0} L ${Dd.x1} ${Dd.y0} L ${Dd.x1} ${M.wallBase} L ${Dd.x0} ${M.wallBase} Z`, fo("#56656c"), doorPanel);
    parts.window = path(`M ${Dd.x0 + 70} ${Dd.y0 + 80} L ${Dd.x1 - 70} ${Dd.y0 + 80} L ${Dd.x1 - 70} ${Dd.y0 + 500} L ${Dd.x0 + 70} ${Dd.y0 + 500} Z`, fo("#a9bcbc"), doorPanel);
    parts.windowShadow = g({ class: "window-shadow", "clip-path": `url(#${id}-winclip)` }, doorPanel);
    const cp = el("clipPath", { id: id + "-winclip" }, defs);
    path(`M ${Dd.x0 + 70} ${Dd.y0 + 80} L ${Dd.x1 - 70} ${Dd.y0 + 80} L ${Dd.x1 - 70} ${Dd.y0 + 500} L ${Dd.x0 + 70} ${Dd.y0 + 500} Z`, {}, cp);
    // the cart shadow that rolls past the frosted glass (S10): position set by player
    parts.cartShadow = path(`M -160 0 L 160 0 L 150 160 L -150 160 Z M -120 160 L -100 240 M 120 160 L 100 240`, { fill: "#4b5a5e", stroke: "#4b5a5e", "stroke-width": 18, opacity: 0 }, parts.windowShadow);
    // lever handle (pivot at the rose); handleDown(t) rotates it down
    const hx = Dd.handle[0], hy = Dd.handle[1];
    el("circle", { cx: hx, cy: hy, r: 22, fill: "#9aa6ab", stroke: C.outline, "stroke-width": 3, "vector-effect": "non-scaling-stroke" }, doorPanel);
    parts.handle = g({ class: "handle" }, doorPanel);
    path(`M ${hx} ${hy - 9} L ${hx + 120} ${hy - 7} Q ${hx + 132} ${hy} ${hx + 120} ${hy + 8} L ${hx} ${hy + 9} Z`, fo("#b9c4c8"), parts.handle);
    parts.handleDown = (t) => parts.handle.setAttribute("transform", `rotate(${32 * GS.clamp(t, 0, 1)} ${hx} ${hy})`);
    // light leak under the door
    parts.underDoor = path(`M ${Dd.x0 - 40} ${M.wallBase} L ${Dd.x1 + 40} ${M.wallBase} L ${Dd.x1 + 160} ${M.wallBase + 70} L ${Dd.x0 - 160} ${M.wallBase + 70} Z`, ff("#f1ead0", { opacity: 0.16 }), dg);
    // open(t): door swings inward (hinge at the right edge); floor light grows
    parts.floorLight = path(`M ${Dd.x0} ${M.wallBase} L ${Dd.x1} ${M.wallBase} L ${Dd.x1 - 500} 900 L ${Dd.x0 - 1100} 900 Z`, ff("#f1ead0", { opacity: 0 }), mid);
    parts.doorOpen = function (t) {
      t = GS.clamp(t, 0, 1);
      const sx = 1 - 0.88 * t;
      doorPanel.setAttribute("transform", `translate(${Dd.x1} 0) scale(${sx} 1) translate(${-Dd.x1} 0)`);
      parts.floorLight.setAttribute("opacity", (0.22 * t).toFixed(3));
    };

    // instrument table (package lands here)
    const tb = g({ class: "table" }, mid);
    const T = M.table;
    path(`M ${T.x0 + 20} ${T.top + 10} L ${T.x0 + 30} 0 M ${T.x1 - 20} ${T.top + 10} L ${T.x1 - 30} 0`, { stroke: C.outline, "stroke-width": 16, fill: "none" }, tb);
    path(`M ${T.x0 + 20} ${T.top + 10} L ${T.x0 + 30} 0 M ${T.x1 - 20} ${T.top + 10} L ${T.x1 - 30} 0`, { stroke: "#7f939c", "stroke-width": 10, fill: "none" }, tb);
    path(`M ${T.x0 + 28} -150 L ${T.x1 - 28} -150`, { stroke: "#7f939c", "stroke-width": 8, fill: "none" }, tb);
    path(`M ${T.x0} ${T.top - 10} L ${T.x1} ${T.top - 10} L ${T.x1 - 6} ${T.top + 16} L ${T.x0 + 6} ${T.top + 16} Z`, fo("#a9bac1"), tb);
    path(`M ${T.x0 + 10} ${T.top - 6} L ${T.x1 - 10} ${T.top - 6}`, GS.line(4, "#e2eef0", { opacity: 0.7 }), tb);
    parts.tableTop = [(T.x0 + T.x1) / 2, T.top - 10];

    // gurney (sedye)
    const gu = g({ class: "gurney" }, mid);
    const G = M.gurney;
    el("ellipse", { cx: (G.x0 + G.x1) / 2, cy: 8, rx: (G.x1 - G.x0) / 2 + 40, ry: 26, fill: "#0b0e16", opacity: 0.6 }, gu);
    [G.x0 + 60, G.x1 - 60].forEach((lx) => {
      path(`M ${lx} ${G.top + 20} L ${lx} -30`, { stroke: C.outline, "stroke-width": 20, fill: "none" }, gu);
      path(`M ${lx} ${G.top + 20} L ${lx} -30`, { stroke: "#8ea2aa", "stroke-width": 13, fill: "none" }, gu);
      el("circle", { cx: lx, cy: -16, r: 18, fill: "#2b2f38", stroke: C.outline, "stroke-width": 3, "vector-effect": "non-scaling-stroke" }, gu);
    });
    path(`M ${G.x0 + 60} -200 L ${G.x1 - 60} -200`, { stroke: "#8ea2aa", "stroke-width": 10, fill: "none" }, gu);
    path(`M ${G.x0} ${G.top} L ${G.x1} ${G.top} L ${G.x1 - 10} ${G.top + 34} L ${G.x0 + 10} ${G.top + 34} Z`, fo("#a6b6bc"), gu);
    path(`M ${G.x0 + 10} ${G.top + 6} L ${G.x1 - 10} ${G.top + 6}`, GS.line(4, "#e2eef0", { opacity: 0.7 }), gu);
    parts.gurneyTop = G.top;

    // slots for dynamic props/characters in mid (z-order): behind gurney / on gurney / front
    parts.slotBack = g({ class: "slot-back" }, mid);
    parts.slotGurney = g({ class: "slot-gurney" }, mid);
    parts.slotFront = g({ class: "slot-front" }, mid);
    parts.slotFloor = g({ class: "slot-floor" }, mid);
    // keep floor-level props (blood drop, fallen sheet, tray) above the floor but below characters
    mid.insertBefore(parts.slotFloor, ex);

    // ---------- NEAR: foreground edge (dark, out-of-focus feel via flat dark shapes) ----------
    const nf = g({ class: "near-cart" }, near);
    path(`M -1500 260 L -1000 260 L -980 1400 L -1520 1400 Z`, fo("#0e131c"), nf);
    path(`M -1500 260 L -1000 260 L -1000 300 L -1500 300 Z`, ff("#2c3846"), nf);

    // Tovan's long shadow from the open doorway across the floor (S43); opacity driven by data
    parts.tovanShadow = path(`M ${M.door.x0 + 150} ${M.wallBase} L ${M.door.x0 + 280} ${M.wallBase} L 160 150 Q 40 200 -110 120 Z`, ff("#05060a", { opacity: 0 }), mid);
    mid.insertBefore(parts.tovanShadow, parts.slotBack);

    // flicker(t): very subtle tube flicker, deterministic
    parts.flicker = function (t, seed) {
      const f = Math.floor(t * 30);
      const n = GS.hash(f, seed || 1);
      let o = 1;
      if (n > 0.985) o = 0.82; // rare quick dip
      else if (n > 0.95) o = 0.94;
      parts.glow.setAttribute("opacity", o.toFixed(3));
      parts.tube.setAttribute("opacity", (0.85 + 0.15 * o).toFixed(3));
    };

    return { far, mid, near, parts, M };
  };
})();
