// Gece Sicili episode player: everything on screen is a pure function of time t (seconds).
// Reads the episode data (data/ep-XX.js -> window.GS_EP) and the measured voice data
// (data/ep-XX-voice.js -> window.GS_VOICE). Supports vertical (1080x1920) and horizontal (1920x1080).
//
// Data model (all times absolute seconds):
//   ep.shots[]   {id, t0, t1, scene:'world'|<insert name>, cam:{on|at, w, push, drift, hz, ...}, p:{param keys for inserts}}
//   ep.chars{}   name -> {make, slot, keys:[[t, state, dur?, ease?], ...]}
//   ep.props[]   {id, make, arg, keys:[[t, {attach|at|rot|scale|vis|angle...}, dur?, ease?], ...]}
//   ep.set       [[t, {cord:[x,y]|null, cordSway, drawer, door, handle, cart, flicker...}, dur?, ease?]]
//   ep.lines[]   {n, start, cards?:[text...], tag?:bool}  (duration comes from GS_VOICE)
(function () {
  const GS = window.GS;
  const { el, g } = GS;

  // ---------- generic keyframe evaluation (stateless) ----------
  // keys: [[t, partialState, dur=0.35, ease='power2.inOut'], ...] sorted by t.
  // Numbers blend from the value accumulated so far to the key's value over [t, t+dur].
  // Strings / booleans / null switch at t.
  const easeCache = {};
  function ease(name) {
    if (!name) name = "power2.inOut";
    if (!easeCache[name]) easeCache[name] = window.gsap ? gsap.parseEase(name) : (x) => x;
    return easeCache[name];
  }
  function blendInto(acc, target, p) {
    for (const k in target) {
      const v = target[k];
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        if (!acc[k] || typeof acc[k] !== "object") acc[k] = {};
        blendInto(acc[k], v, p);
      } else if (Array.isArray(v)) {
        const a = Array.isArray(acc[k]) ? acc[k] : v.map(() => 0);
        acc[k] = v.map((x, i) => (typeof x === "number" && typeof a[i] === "number" ? a[i] + (x - a[i]) * p : x));
      } else if (typeof v === "number" && typeof acc[k] === "number") {
        acc[k] = acc[k] + (v - acc[k]) * p;
      } else {
        acc[k] = v;
      }
    }
  }
  GS.evalKeys = function (keys, t, base) {
    const acc = JSON.parse(JSON.stringify(base || {}));
    for (const key of keys) {
      const [kt, st, dur, ez] = key;
      if (kt > t) break;
      const d = dur === undefined ? 0.35 : dur;
      const p = d <= 0 ? 1 : ease(ez)(GS.clamp((t - kt) / d, 0, 1));
      blendInto(acc, st, p);
    }
    return acc;
  };

  // ---------- grain tiles (seeded) ----------
  function grainTiles(n, size, seed) {
    const r = GS.rng(seed);
    const out = [];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const cx = c.getContext("2d");
      const im = cx.createImageData(size, size);
      for (let j = 0; j < size * size; j++) {
        const v = Math.floor(r() * 255);
        im.data[j * 4] = im.data[j * 4 + 1] = im.data[j * 4 + 2] = v;
        im.data[j * 4 + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      out.push(c.toDataURL("image/png"));
    }
    return out;
  }

  GS.Player = function (cfg) {
    const ep = cfg.ep;
    const V = cfg.voice || {};
    const W = cfg.W, H = cfg.H;
    const aspect = W > H ? "h" : "v";
    const seed = ep.seed || 1;
    const svg = cfg.svg;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const defs = el("defs", {}, svg);
    el("rect", { x: 0, y: 0, width: W, height: H, fill: GS.C.navy }, svg);

    // ---------- scenes ----------
    const scenes = {};
    const world = g({ class: "scene-world" }, svg);
    const set = GS.SET[ep.set || "morgue"]();
    const layers = { far: g({}, world), mid: g({}, world), near: g({}, world) };
    layers.far.appendChild(set.far);
    layers.mid.appendChild(set.mid);
    layers.near.appendChild(set.near);
    scenes.world = { root: world, layers, isWorld: true };

    // characters
    const chars = {};
    for (const name in ep.chars) {
      const c = ep.chars[name];
      const rig = GS.buildRig(GS.CHAR[c.make || name](), { id: name });
      const slot = set.parts[c.slot || "slotFront"];
      slot.appendChild(rig.el);
      chars[name] = { rig, cfg: c, base: JSON.parse(JSON.stringify(rig.state)) };
    }

    // world props
    const props = {};
    (ep.props || []).forEach((p) => {
      const holder = g({ class: "prop-holder prop-" + p.id });
      const inner = GS.PROP[p.make](p.arg);
      holder.appendChild(inner);
      props[p.id] = { cfg: p, holder, inner, cur: null };
    });

    // inserts
    const INS = (GS.INSERTS && GS.INSERTS[ep.set || "morgue"]) || {};
    const insertNames = {};
    ep.shots.forEach((s) => s.scene && s.scene !== "world" && (insertNames[s.scene] = 1));
    for (const n in insertNames) {
      if (!INS[n]) throw new Error("Unknown insert scene " + n);
      const ins = INS[n]({ chars: GS.CHAR });
      const root = g({ class: "scene-" + n, display: "none" }, svg);
      root.appendChild(ins.g);
      scenes[n] = { root, ins };
    }

    // ---------- overlays: vignette, grain, black ----------
    const vgId = GS.uid("vig");
    const vg = el("radialGradient", { id: vgId, cx: "50%", cy: "46%", r: "75%" }, defs);
    el("stop", { offset: "55%", "stop-color": "#000", "stop-opacity": 0 }, vg);
    el("stop", { offset: "100%", "stop-color": "#000", "stop-opacity": 0.62 }, vg);
    el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${vgId})`, "pointer-events": "none" }, svg);
    const tiles = grainTiles(4, 256, seed);
    const grainIds = tiles.map((src, i) => {
      const id = GS.uid("grain");
      const pt = el("pattern", { id, width: 256, height: 256, patternUnits: "userSpaceOnUse" }, defs);
      el("image", { href: src, width: 256, height: 256 }, pt);
      return id;
    });
    const grain = el("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${grainIds[0]})`, opacity: 0.055, style: "mix-blend-mode:overlay" }, svg);
    const black = el("rect", { x: 0, y: 0, width: W, height: H, fill: "#000", opacity: 0 }, svg);

    // ---------- subtitles ----------
    const subs = cfg.subs;
    const cards = buildCards();
    function wrap(text, max) {
      if (text.length <= max) return [text];
      const words = text.split(" ");
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(" "), b = words.slice(i).join(" ");
        const score = Math.max(a.length, b.length);
        if (!best || score < best.score) best = { a, b, score };
      }
      return [best.a, best.b];
    }
    function buildCards() {
      const out = [];
      const lines = ep.lines.slice().sort((a, b) => a.start - b.start);
      lines.forEach((ln, i) => {
        const v = V[ln.n];
        if (!v) throw new Error("Missing voice for line " + ln.n);
        const start = ln.start;
        const end = start + v.speechOff;
        const next = lines[i + 1] ? lines[i + 1].start - 0.08 : 1e9;
        const texts = ln.cards || [ln.text];
        if (texts.length === 1) {
          out.push({ n: ln.n, t0: start + v.speechOn * 0.5, t1: Math.min(Math.max(end + 0.25, start + 2.0), next), text: texts[0], speaker: ln.speaker, tag: ln.tag });
        } else {
          const sp = start + (ln.split !== undefined ? ln.split : v.split);
          out.push({ n: ln.n, t0: start + v.speechOn * 0.5, t1: sp, text: texts[0], speaker: ln.speaker, tag: ln.tag });
          out.push({ n: ln.n, t0: sp, t1: Math.min(end + 0.25, next), text: texts[1], speaker: ln.speaker, tag: ln.tag });
        }
      });
      for (let i = 1; i < out.length; i++) if (out[i].t0 < out[i - 1].t1) throw new Error(`Subtitle overlap: line ${out[i - 1].n} / ${out[i].n}`);
      return out;
    }
    let curCard = null;
    function renderSubs(t) {
      if (!subs) return;
      const c = cards.find((k) => t >= k.t0 && t < k.t1);
      if (!c) {
        subs.style.opacity = 0;
        curCard = null;
        return;
      }
      if (curCard !== c) {
        const linesTxt = wrap(c.text, 28);
        const tag = c.tag ? `<div class="tag">${c.speaker.toLocaleUpperCase("tr-TR")}</div>` : "";
        subs.innerHTML = tag + linesTxt.map((l) => `<div class="ln">${l}</div>`).join("");
        curCard = c;
      }
      const fi = Math.min(1, (t - c.t0) / (4 / 30)), fo = Math.min(1, (c.t1 - t) / (4 / 30));
      subs.style.opacity = Math.max(0, Math.min(fi, fo)).toFixed(3);
    }

    // ---------- life layer ----------
    const blinkSched = {};
    Object.keys(chars).forEach((name, i) => {
      const r = GS.rng(seed * 100 + i * 17 + 3);
      const arr = [];
      let tt = 0.6 + r() * 1.5;
      while (tt < 130) {
        arr.push(tt);
        tt += 3 + r() * 2;
      }
      blinkSched[name] = arr;
    });
    function lifeLayer(name, S, t) {
      const i = Object.keys(chars).indexOf(name);
      const ph = i * 1.7;
      S.breath = Math.sin((2 * Math.PI * t) / 3 + ph) * (S.breathAmp === undefined ? 1 : S.breathAmp);
      if (!S.still) {
        S.head.tilt = (S.head.tilt || 0) + 1.1 * Math.sin((2 * Math.PI * t) / 5.3 + ph);
        S.head.dx = (S.head.dx || 0) + 1.6 * Math.sin((2 * Math.PI * t) / 6.1 + ph * 2);
        // micro eye darts: small seeded steps every ~1.4 s
        const k = Math.floor((t + ph) / 1.4);
        const dx = (GS.hash(k, seed + i * 7) - 0.5) * 0.22, dy = (GS.hash(k + 999, seed + i * 7) - 0.5) * 0.14;
        S.look = [(S.look ? S.look[0] : 0) + dx, (S.look ? S.look[1] : 0) + dy];
      }
      // tremble on a weak limb (Saren's left arm)
      if (S.tremble) {
        S.armL.sh = (S.armL.sh || 0) + S.tremble * Math.sin(2 * Math.PI * 9 * t);
        S.armL.el = (S.armL.el || 0) + S.tremble * 0.7 * Math.sin(2 * Math.PI * 7.3 * t + 1);
      }
      // blinks (only over open-type eyes, never when the data forces closed/half)
      if (!S.noBlink && (S.eyes === "open" || S.eyes === "wide" || S.eyes === "narrow")) {
        for (const b of blinkSched[name]) {
          if (t >= b && t < b + 4 / 30) {
            const f = Math.floor((t - b) * 30);
            S.eyes = f === 0 || f === 3 ? "half" : "closed";
            break;
          }
          if (b > t) break;
        }
      }
      // lip-flap from the real audio envelope
      const spk = speaking(name, t);
      if (spk) {
        const { v, lt } = spk;
        const f = Math.floor(lt * 30);
        const w0 = Math.floor(f / 4) * 4;
        let a = 0;
        for (let j = w0; j < w0 + 4; j++) a = Math.max(a, v.env[j] || 0);
        const now = v.env[f] || 0;
        const r = GS.hash(w0 + v.line * 131, seed);
        let m;
        if (now < 0.1 || a < 0.12) m = "closed";
        else if (a < 0.35) m = r < 0.5 ? "small" : "closed";
        else if (a < 0.75) m = r < 0.6 ? "open" : r < 0.85 ? "small" : "O";
        else m = r < 0.55 ? "open" : r < 0.8 ? "O" : S.maxMouth || "open";
        if (m === "wide" && S.maxMouth && S.maxMouth !== "wide") m = "open";
        S.mouth = m;
        S.mouthAmp = 0.75 + 0.45 * Math.min(1, a);
      }
    }
    const voiceSpans = ep.lines.map((ln) => ({ ln, v: V[ln.n] }));
    function speaking(name, t) {
      for (const { ln, v } of voiceSpans) {
        if (ln.speaker !== name) continue;
        const s = ln.start + v.speechOn, e = ln.start + v.speechOff;
        if (t >= s && t < e) return { v, lt: t - ln.start };
      }
      return null;
    }

    // ---------- helpers ----------
    function pointIn(scene, elmt, x, y) {
      // world coordinates = the mid layer's user space (the camera transform cancels out)
      const ref = scene.isWorld ? layers.mid : scene.root;
      const m = ref.getCTM().inverse().multiply(elmt.getCTM());
      return new DOMPoint(x || 0, y || 0).matrixTransform(m);
    }
    function charPoint(name, part) {
      const c = chars[name];
      const r = c.rig;
      let elx = r.parts.headPivot, px = 0, py = 0;
      if (part === "chest") { elx = r.parts.slots.torso; py = r.spec.dims.neckY + 150; }
      if (part === "hips") { elx = r.parts.slots.torso; py = r.spec.dims.hipY; }
      if (part === "feet") { elx = r.el; }
      if (part === "handR") elx = r.arms.R.hand;
      if (part === "handL") elx = r.arms.L.hand;
      if (part === "head") py = 10;
      return pointIn(scenes.world, elx, px, py);
    }

    // ---------- per-frame state ----------
    function applyChars(t) {
      for (const name in chars) {
        const c = chars[name];
        const S = GS.evalKeys(c.cfg.keys, t, c.base);
        lifeLayer(name, S, t);
        c.rig.set(S);
        c.rig.el.setAttribute("display", S.hidden ? "none" : "inline");
        // silhouette (backlit doorway): one cheap filter on this rig only, only while needed
        const sil = S.silhouette || 0;
        c.rig.el.style.filter = sil > 0 ? `brightness(${(1 - 0.88 * sil).toFixed(3)})` : "";
        c.last = S;
      }
    }
    function applySet(t) {
      const st = GS.evalKeys(ep.set_keys || [], t, { cord: null, cordSway: 0, drawer: 0, door: 0, handle: 0, cart: -1, glow: 1 });
      const P = set.parts;
      P.flicker(t, seed);
      P.emptyDrawer.open(st.drawer);
      P.doorOpen(st.door);
      P.handleDown(st.handle);
      if (P.cartShadow) {
        P.cartShadow.setAttribute("opacity", st.cart >= 0 && st.cart <= 1 ? 0.75 : 0);
        const M = GS.MORGUE;
        const x = GS.lerp(M.door.x0 - 300, M.door.x1 + 300, GS.clamp(st.cart, 0, 1));
        P.cartShadow.setAttribute("transform", `translate(${x} ${M.door.y0 + 200})`);
      }
      // alarm cord end: follows a character's hand, or a world point, or hangs free
      if (st.cordHand) {
        const [cn, side] = st.cordHand.split(".");
        const hp = pointIn(scenes.world, chars[cn].rig.arms[side].hand, 0, 30);
        P.setCord(hp.x, hp.y - 20, st.cordSway);
      } else if (st.cord) P.setCord(st.cord[0], st.cord[1], st.cordSway);
      else P.setCord(GS.MORGUE.cord.x + st.cordSway * 0.3, GS.MORGUE.cord.ringY, st.cordSway);
      if (P.tovanShadow) P.tovanShadow.setAttribute("opacity", (st.shadow || 0).toFixed(3));
      if (P.shelfRegister) P.shelfRegister.setAttribute("display", st.shelfRegister === 0 ? "none" : "inline");
      setState = st;
    }
    let setState = {};
    function applyProps(t) {
      for (const id in props) {
        const pr = props[id];
        const S = GS.evalKeys(pr.cfg.keys, t, { vis: 0, at: [0, 0], rot: 0, scale: 1, attach: null, slot: "slotFront", angle: 0 });
        const want = S.vis ? (S.attach ? "hand:" + S.attach : "world:" + S.slot) : "none";
        if (want !== pr.cur) {
          if (pr.holder.parentNode) pr.holder.parentNode.removeChild(pr.holder);
          if (S.vis && S.attach) {
            const [cn, side] = S.attach.split(".");
            chars[cn].rig.holdProp(side, pr.holder, null, S.upright !== false);
          } else if (S.vis) set.parts[S.slot].appendChild(pr.holder);
          pr.cur = want;
        }
        if (S.vis && S.attach) {
          pr.holder.setAttribute("transform", `translate(${S.at[0]} ${S.at[1]}) rotate(${S.rot}) scale(${S.scale})`);
          const [cn, side] = S.attach.split(".");
          const A = chars[cn].rig.arms[side];
          if (A.propAngle !== (S.angle || 0)) {
            A.propAngle = S.angle || 0;
            chars[cn].rig.set();
          }
        } else if (S.vis) pr.holder.setAttribute("transform", `translate(${S.at[0]} ${S.at[1]}) rotate(${S.rot}) scale(${S.scale})`);
        if (pr.inner.stain) pr.inner.stain.setAttribute("transform", `scale(${GS.clamp(S.stain === undefined ? 1 : S.stain, 0.01, 2)})`);
        pr.holder.setAttribute("opacity", S.opacity === undefined ? 1 : S.opacity);
      }
    }

    // ---------- camera ----------
    // Subject area per aspect: where the camera target lands on screen.
    function subjectXY(cam, facing) {
      if (aspect === "v") return [W * 0.5 + (cam.sx || 0) * W, H * (cam.sy === undefined ? 0.4 : cam.sy)];
      const side = cam.hx !== undefined ? cam.hx : facing === "left" ? 0.6 : facing === "right" ? 0.4 : 0.5;
      return [W * side, H * (cam.hy === undefined ? 0.45 : cam.hy)];
    }
    const camCache = {};
    function resolveTarget(shot) {
      const cam = shot.cam || {};
      if (cam.at) return { x: cam.at[0], y: cam.at[1], facing: cam.facing };
      if (cam.on) {
        const [cn, part] = cam.on.split(".");
        if (!camCache[shot.id]) {
          // lock the target at the shot start (no tracking jitter); optional follow blends to live
          applyChars(shot.t0 + 0.001);
          const p = charPoint(cn, part || "head");
          camCache[shot.id] = { x: p.x + (cam.ox || 0), y: p.y + (cam.oy || 0), facing: chars[cn].last.facing };
        }
        return camCache[shot.id];
      }
      return { x: 0, y: -900 };
    }
    function cameraFor(shot, t, scn) {
      const cam = shot.cam || {};
      const tgt = resolveTarget(shot);
      const u = GS.clamp((t - shot.t0) / Math.max(0.001, shot.t1 - shot.t0), 0, 1);
      const eu = GS.smooth(u);
      const push = 1 + (cam.push === undefined ? 0.06 : cam.push) * eu;
      let zoom = (W / (aspect === "v" ? cam.w : cam.w * (cam.hz || 1.6))) * push;
      if (aspect === "h" && cam.hw) zoom = (W / cam.hw) * push;
      const dr = cam.drift || [0, 0];
      let tx = tgt.x + dr[0] * eu, ty = tgt.y + dr[1] * eu;
      if (cam.pan) {
        tx = GS.lerp(tgt.x, cam.pan[0], eu);
        ty = GS.lerp(tgt.y, cam.pan[1], eu);
      }
      // impact shake (<= 8 px, 6 frames)
      let sx = 0, sy = 0;
      (shot.shake || []).forEach((st) => {
        const f = (t - st) * 30;
        if (f >= 0 && f < 6) {
          const a = 8 * (1 - f / 6);
          sx += a * (GS.hash(Math.floor(f) * 3 + 1, seed) - 0.5) * 2;
          sy += a * (GS.hash(Math.floor(f) * 3 + 2, seed) - 0.5) * 2;
        }
      });
      const [ax, ay] = subjectXY(cam, tgt.facing);
      const rot = (cam.rot || 0) * eu;
      return { zoom, tx, ty, ax: ax + sx, ay: ay + sy, rot, tgt };
    }
    function applyCamera(shot, t) {
      const scn = scenes[shot.scene || "world"];
      const c = cameraFor(shot, t, scn);
      const base = `translate(${c.ax.toFixed(2)} ${c.ay.toFixed(2)}) rotate(${c.rot.toFixed(3)}) scale(${c.zoom.toFixed(5)})`;
      if (scn.isWorld) {
        // parallax relative to the shot's start framing
        const c0 = cameraFor(shot, shot.t0, scn);
        const dx = c.tx - c0.tx, dy = c.ty - c0.ty;
        scn.root.setAttribute("transform", base);
        layers.mid.setAttribute("transform", `translate(${(-c.tx).toFixed(2)} ${(-c.ty).toFixed(2)})`);
        layers.far.setAttribute("transform", `translate(${(-c.tx + dx * 0.1).toFixed(2)} ${(-c.ty + dy * 0.1).toFixed(2)})`);
        layers.near.setAttribute("transform", `translate(${(-c.tx - dx * 0.1).toFixed(2)} ${(-c.ty - dy * 0.1).toFixed(2)})`);
        layers.near.setAttribute("display", shot.near ? "inline" : "none");
      } else {
        scn.root.setAttribute("transform", `${base} translate(${(-c.tx).toFixed(2)} ${(-c.ty).toFixed(2)})`);
      }
    }

    // ---------- shots ----------
    const shots = ep.shots.slice().sort((a, b) => a.t0 - b.t0);
    // dev-time assertions (fail loudly): contiguous shots, block boundaries are cuts, exact duration
    for (let i = 0; i < shots.length; i++) {
      if (i && Math.abs(shots[i].t0 - shots[i - 1].t1) > 1e-6) throw new Error(`Shot gap/overlap at ${shots[i].id}`);
    }
    if (shots[0].t0 !== 0 || Math.abs(shots[shots.length - 1].t1 - ep.duration) > 1e-6) throw new Error("Shots must cover 0..duration");
    (ep.blocks || []).forEach((b) => {
      if (!shots.some((s) => Math.abs(s.t0 - b) < 1e-6)) throw new Error("Block boundary " + b + " is not a cut");
    });

    let curScene = null;
    function shotAt(t) {
      for (const s of shots) if (t >= s.t0 && t < s.t1) return s;
      return shots[shots.length - 1];
    }
    function render(t) {
      t = GS.clamp(t, 0, ep.duration - 1e-6);
      const shot = shotAt(t);
      resolveTarget(shot); // warm the camera-target cache BEFORE posing the rigs for t
      applyChars(t);
      applySet(t);
      applyProps(t);
      const sn = shot.scene || "world";
      if (sn !== curScene) {
        for (const k in scenes) scenes[k].root.setAttribute("display", k === sn ? "inline" : "none");
        curScene = sn;
      }
      if (sn !== "world") {
        const P = GS.evalKeys(shot.p || [], t, {});
        scenes[sn].ins.update(P, t, shot);
      }
      applyCamera(shot, t);
      grain.setAttribute("fill", `url(#${grainIds[Math.floor(t * 12) % grainIds.length]})`);
      const bk = GS.evalKeys(ep.black || [], t, { a: 0 });
      black.setAttribute("opacity", bk.a);
      renderSubs(t);
    }
    return { render, cards, shots, chars, scenes, set, aspect, camCache, charPoint };
  };
})();
