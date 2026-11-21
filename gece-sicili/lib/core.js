// Gece Sicili engine core: namespace, palette (single source of truth), SVG helpers, seeded PRNG.
// Classic script (no modules) so it loads the same way in HyperFrames compositions and sheet pages.
(function () {
  const GS = (window.GS = window.GS || {});

  // ---- Palette: change colors ONLY here. Also exported as CSS variables (--c-<name>). ----
  GS.C = {
    navy: "#0d1224",
    indigo: "#1b2140",
    teal: "#2c4a4f",
    steel: "#8fa3ad",
    fluo: "#dff3f0",
    copper: "#b8733a",
    copperHi: "#e0a66a",
    copperLo: "#7a4520",
    blood: "#8c1d2c",
    bloodDry: "#4e1520",
    ampule: "#5e0f1c",
    ampuleHi: "#c23a4a",
    skinHuman: "#e6c3a5",
    skinHumanShade: "#c99f84",
    skinVamp: "#d3d6e0",
    skinVampShade: "#a9aebf",
    sage: "#7c8f84",
    sageShade: "#5e6f66",
    sageRim: "#a9bcb0",
    outline: "#151019",
    // character-specific (derived, kept here so one file holds every color)
    idilHair: "#3a2820",
    idilHairHi: "#5a4034",
    idilSweater: "#272435",
    idilPants: "#22212b",
    shoe: "#17151c",
    sarenHair: "#1b1a22",
    sarenCoat: "#34343e",
    sarenCoatShade: "#24242c",
    sarenCoatRim: "#5a5b6a",
    sarenShirt: "#1e1e26",
    bandage: "#c9bfa6",
    bandageShade: "#a39880",
    tovanCoat: "#121218",
    tovanCoatRim: "#2e2f3a",
    tovanHair: "#3a3a40",
    tovanHairStreak: "#8d8f98",
    silver: "#c8ccd4",
    amber: "#e0a030",
    white: "#f4f6f4",
    eyeDot: "#151019",
    mouthIn: "#3a1820",
    teeth: "#eeeae0",
    lip: "#b07c6c",
    lipVamp: "#8f8fa2",
    underEye: "#b98f78",
  };

  GS.injectPaletteCSS = function () {
    const lines = Object.entries(GS.C).map(([k, v]) => `--c-${k}: ${v};`);
    const st = document.createElement("style");
    st.textContent = `:root{${lines.join("")}}`;
    document.head.appendChild(st);
  };

  // ---- SVG helpers ----
  const SVGNS = "http://www.w3.org/2000/svg";
  GS.SVGNS = SVGNS;
  GS.el = function (tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  GS.g = (attrs, parent) => GS.el("g", attrs, parent);
  GS.path = (d, attrs, parent) => GS.el("path", Object.assign({ d }, attrs || {}), parent);

  // Standard outline (3 px on screen at 1080 wide, independent of camera zoom).
  GS.OUT = { stroke: GS.C.outline, "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" };
  // Flat fill with outline.
  GS.fo = (fill, extra) => Object.assign({ fill }, GS.OUT, extra || {});
  // Flat fill, no outline (shading / rim shapes).
  GS.ff = (fill, extra) => Object.assign({ fill, stroke: "none" }, extra || {});
  // Detail line that scales with the art (faces).
  GS.line = (w, color, extra) => Object.assign({ fill: "none", stroke: color || GS.C.outline, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, extra || {});

  // ---- Seeded PRNG (mulberry32). seed = episode number. ----
  GS.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  // Deterministic hash noise in [0,1) for integer inputs (for per-frame jitter without state).
  GS.hash = function (n, seed) {
    let x = Math.imul((n | 0) ^ ((seed | 0) * 0x9e3779b1), 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  };
  GS.lerp = (a, b, t) => a + (b - a) * t;
  GS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  GS.smooth = (t) => t * t * (3 - 2 * t);

  // Unique instance prefix for namespacing ids (gradients, clip paths) per rig/prop instance.
  let _uid = 0;
  GS.uid = (base) => `${base}-${++_uid}`;
})();
