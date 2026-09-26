/* Seedance prompt composer — JavaScript port of tools/seedance_compose.py.
   Output must stay byte-identical to the Python version (tools/test_app_parity.py checks it). */
(function (root) {
  "use strict";

  var PRONOUNS = {
    she: { sub: "she", obj: "her", pos: "her", ref: "herself" },
    he: { sub: "he", obj: "him", pos: "his", ref: "himself" },
    it: { sub: "it", obj: "it", pos: "its", ref: "itself" }
  };
  var TOKEN_RE = /\{([A-D])(?:\.(sub|obj|pos|ref|Sub|Obj|Pos|Ref))?\}/g;

  function fmtT(x) { return x.toFixed(1); }
  function fmtTotal(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }
  function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function round3(x) { return Math.round(x * 1000) / 1000; }
  function sum(arr, f) { return arr.reduce(function (a, b) { return a + f(b); }, 0); }

  function fixSentenceCaps(text) {
    return text.replace(/(^|[.!?]\s+|\n)(the|she|he|it|her|his|its)\b/g, function (m, pre, w) {
      return pre + capFirst(w);
    });
  }

  function substitute(text, cast) {
    var out = text.replace(TOKEN_RE, function (m, role, form) {
      if (!cast[role]) throw new Error("role " + role + " used but not cast");
      var ch = cast[role];
      if (!form) return ch.descriptor;
      var val = PRONOUNS[ch.pronoun][form.toLowerCase()];
      return form.charAt(0) === form.charAt(0).toUpperCase() ? capFirst(val) : val;
    });
    return fixSentenceCaps(out);
  }

  function castListPhrase(descs) {
    if (descs.length === 1) return descs[0];
    return descs.slice(0, -1).join(", ") + " and " + descs[descs.length - 1];
  }

  function roleFits(scene, role, ch) {
    var spec = scene.roles[role];
    var need = spec.needs || "human";
    if (need === "human" && !ch.human) return false;
    if (need === "creature" && ch.human) return false;
    if (spec.only) return spec.only.indexOf(ch.id) !== -1;
    var fit = spec.fit || ["any"];
    return fit.indexOf("any") !== -1 || fit.indexOf(ch.category) !== -1 || fit.indexOf(ch.id) !== -1;
  }

  function fittingCharacters(scene, role, chars) {
    return Object.keys(chars).map(function (k) { return chars[k]; }).filter(function (c) { return roleFits(scene, role, c); });
  }

  function resolveCast(scene, chars, overrides) {
    var ids = Object.assign({}, scene.default_cast, overrides || {});
    var cast = {};
    Object.keys(scene.roles).sort().forEach(function (role) {
      var cid = ids[role];
      if (!chars[cid]) throw new Error("scene " + scene.id + ": role " + role + " -> unknown character '" + cid + "'");
      cast[role] = chars[cid];
    });
    var list = Object.keys(cast).map(function (r) { return cast[r].id; });
    if (new Set(list).size !== list.length) throw new Error("Aynı karakter iki role atanamaz. Farklı karakterler seç.");
    return cast;
  }

  function compose(scene, cast, lib, version, style, negative) {
    version = version || "2.0";
    var prof = lib.version_profiles[version];
    var S = function (t) { return substitute(t, cast); };
    var roles = Object.keys(cast).sort();
    var humans = roles.filter(function (r) { return cast[r].human; });
    var shots = scene.shots;
    var n = shots.length;
    var total = round3(sum(shots, function (sh) { return sh.dur; }));
    if (total > prof.max_runtime_s) throw new Error(scene.id + ": " + total + "s exceeds the " + version + " ceiling of " + prof.max_runtime_s + "s — split into two prompts");
    var longForm = total > 15;

    // references
    var refs = [], tags = {}, idx = 1;
    roles.forEach(function (role) {
      var ch = cast[role];
      var k = ch.human ? prof.refs_per_human : prof.refs_per_creature;
      var kinds;
      if (k === 1) kinds = ["identity reference"];
      else if (ch.human) kinds = ["front identity plate", "profile plate", "wardrobe and detail plate"].slice(0, k);
      else kinds = ["front plate", "side plate"].slice(0, k);
      tags[role] = [];
      kinds.forEach(function (kind) {
        refs.push("@Image " + idx + " — " + ch.label_en + " (" + kind + ")");
        tags[role].push("@Image " + idx);
        idx += 1;
      });
    });
    var extraLines = [];
    (scene.extra_assets || []).forEach(function (ex) {
      refs.push("@Image " + idx + " — " + ex.label_en);
      extraLines.push("@Image " + idx + " = " + S(ex.asset));
      idx += 1;
    });
    var locTag = "@Image " + idx;
    refs.push(locTag + " — location: " + scene.location_label);
    var imageCount = idx;
    var audioTag = null;
    if (scene.audio_ref) {
      audioTag = "@Audio 1";
      refs.push(audioTag + " — " + scene.audio_ref);
    }
    if (imageCount > prof.max_image_refs) throw new Error(scene.id + ": " + imageCount + " image refs exceed the " + version + " ceiling of " + prof.max_image_refs);

    // 1 header
    var slow = scene.slowmo, header;
    if (n === 1) {
      header = "1 continuous shot. Total " + fmtTotal(total) + " seconds, no cuts, no transitions.";
    } else {
      var t = 0, parts = [];
      shots.forEach(function (sh, i) {
        parts.push("shot " + (i + 1) + " runs " + fmtT(t) + "–" + fmtT(t + sh.dur) + "s");
        t += sh.dur;
      });
      var budget = longForm ? n + " shots across " + fmtTotal(total) + " seconds" : n + " shots";
      header = budget + ". Total " + fmtTotal(total) + " seconds — " + parts.join(", ") + ". Hard cuts between them, no transitions, no dissolves.";
      if (scene.lipsync) header += " The cuts fall between words and never inside a word.";
    }
    if (slow) header += " Brief slow motion on " + slow.what + " only, " + fmtT(slow.start) + "–" + fmtT(slow.end) + "s. All other footage real-time, no overcranking, no ramping, no other speed change.";
    else if (n === 1) header += " Real-time throughout, no slow motion, no speed change.";
    else header += " All shots real-time, no slow motion, no overcranking, no ramping, no speed change anywhere in this sequence.";
    if (scene.header_nobgm) header += " " + lib.audio.nobgm_header;

    // 2 style prefix
    var sp = lib.style_prefixes[style || scene.style || "large_format"];
    var technical = lib.style_shared.technical;
    if (scene.strobe) technical += " " + lib.style_shared.strobe_quarantine;
    var skin = humans.length ? lib.style_shared.skin : lib.style_shared.skin_creature;
    var styleBlock = [lib.style_shared.style, sp.operating_style, sp.texture, skin, technical].join("\n\n");

    // 4 critical
    var crit = (scene.critical || []).map(function (c) {
      if (c.lib) {
        var text = lib.critical_library[c.lib].text;
        var descs = roles.map(function (r) { return cast[r].descriptor; }).concat(c.also || []);
        text = text.split("{CAST_LIST}").join(castListPhrase(descs));
        Object.keys(c.vars || {}).forEach(function (key) { text = text.split("{" + key + "}").join(c.vars[key]); });
        return S(text);
      }
      return S(c.title + " — CRITICAL: " + c.text);
    });
    if (crit.length > 4) throw new Error(scene.id + ": " + crit.length + " CRITICAL blocks, cap is 4");

    // 5 assets
    var assets = roles.map(function (role) {
      var ch = cast[role];
      var tag = tags[role].join(" + ");
      var thisScene = S(scene.roles[role].this_scene);
      var match = tags[role].length === 1 ? "100% match to the reference." : "100% match to the references — front, profile and detail agree.";
      var anchor = longForm ? " " + tags[role][0] + " is the anchor reference for this figure in every beat." : "";
      return tag + " = " + ch.asset + " THIS SCENE: " + capFirst(thisScene) + " " + match + anchor;
    });
    assets = assets.concat(extraLines);
    assets.push(locTag + " = the location — " + S(scene.location));

    var geometry = "GEOMETRY MAP: " + S(scene.geometry);
    var first = "FIRST FRAME: " + S(scene.first_frame) + " No empty establishing frame, no static hold before the action starts.";

    // 8 optics
    var optics = ["OPTICS: " + (scene.optics || lib.optics_default)];
    shots.forEach(function (sh, i) {
      var label = n === 1 ? "LENS LOCK" : "LENS LOCK SHOT " + (i + 1);
      optics.push(label + " = " + sh.lens + ", " + S(sh.lens_note) + ".");
    });
    optics.push("No focal drift mid-shot.");
    if (scene.lens_defense) optics.push(lib.lens_defense[scene.lens_defense]);
    optics = optics.join("\n");

    // 9 camera
    var reg = scene.camera.register;
    var camera = lib.camera_registers[reg].text;
    if (scene.camera.extra) camera += " " + S(scene.camera.extra);
    if (reg !== "locked") camera += " " + lib.camera_never_settles;

    var light = "LIGHT: " + S(scene.light);
    var colour = "COLOUR: " + S(scene.colour);

    // 11 atmosphere
    var atm = scene.atmosphere;
    var atmosphere = lib.atmosphere[atm.mode].split("{PLANES}").join(S(atm.planes));
    if (atm.mode !== "clean") {
      if (atm.source) atmosphere += " " + lib.atmosphere.source_close.split("{SOURCE}").join(S(atm.source));
      else atmosphere += " " + lib.atmosphere.no_source_close;
    }

    // 12 action timing
    var lines = ["ACTION TIMING:"], tt = 0;
    shots.forEach(function (sh, i) {
      var beats = sh.beats || [{ dur: sh.dur, text: sh.beat }];
      if (Math.abs(sum(beats, function (b) { return b.dur; }) - sh.dur) > 1e-6) throw new Error(scene.id + ": shot " + (i + 1) + " beat durations do not sum to the shot duration");
      beats.forEach(function (b, j) {
        var lensTag = longForm ? "LENS " + sh.lens.split(" (")[0] + ", " : "";
        var label = n > 1 ? "SHOT " + (i + 1) + ", " + sh.name : sh.name;
        if (j > 0) label += ", continuing";
        lines.push(fmtT(tt) + "–" + fmtT(tt + b.dur) + "s (" + lensTag + label + "): " + S(b.text));
        tt += b.dur;
      });
      if (i < n - 1) lines.push(fmtT(tt) + "s HARD CUT");
    });
    var action = lines.join("\n");

    var physics = "PHYSICS: " + S(scene.physics);
    var acting = (humans.length ? lib.acting_base : lib.acting_base_creature) + " " + S(scene.acting);

    var audio;
    if (audioTag) audio = lib.audio.attached_track.split("{AUDIO_TAG}").join(audioTag);
    else {
      audio = "AUDIO: " + S(scene.audio);
      if (scene.nobgm !== false) audio += " " + lib.audio.nobgm;
    }

    // 16 locks
    var ls = lib.locks_standard;
    var locks = ["LOCKS: " + S(scene.locks_chain), ls.identity, ls.wardrobe];
    var markers = roles.map(function (r) { return cast[r].descriptor + " — " + cast[r].permanent.join("; "); });
    locks.push("Permanent markers hold in every frame: " + markers.join(" | ") + ".");
    if (n > 1) locks.push(ls.angles);
    if (!scene.light_changes) locks.push(ls.light);
    locks.push(atm.mode !== "clean" ? ls.air : "The air stays clean throughout.");
    if (longForm) locks.push("The lens lock of each beat holds for that beat; the staging of the geometry map holds for the whole sequence.");
    if (humans.length) locks.push(lib.skin_protection);
    locks.push(reg === "locked" ? lib.negation_tail_locked : lib.negation_tail);
    locks = locks.join(" ");

    var blocks = [header, styleBlock, lib.no_text_block].concat(crit).concat([
      assets.join("\n\n"), geometry, first, optics, camera, light + "\n" + colour,
      atmosphere, action, physics, acting, audio, locks
    ]);
    var prompt = blocks.join("\n\n");

    var neg = null;
    if (negative) {
      var groups = Object.assign({}, lib.negative_prompt);
      if (scene.negative_extra && scene.negative_extra.length) groups.scene = scene.negative_extra;
      if (scene.lipsync || scene.strobe || scene.slowmo) groups.motion = groups.motion.filter(function (m) { return m !== "slow motion unless stated"; });
      neg = Object.keys(groups).map(function (k) { return k + ": " + groups[k].join(", "); }).join("\n");
    }

    return {
      title: "**" + scene.label_en + " — " + fmtTotal(total) + "s**",
      refs: refs,
      prompt: prompt,
      negative: neg,
      words: prompt.split(/\s+/).filter(Boolean).length,
      image_refs: imageCount,
      runtime: total,
      conflict: scene.conflict_note || null
    };
  }

  function renderMarkdown(res) {
    var out = [];
    if (res.conflict) out.push(res.conflict, "");
    out.push(res.title, "");
    res.refs.forEach(function (r, i) { out.push((i + 1) + ". " + r); });
    out.push("", "```", res.prompt, "```");
    if (res.negative) out.push("", "```", "NEGATIVE PROMPT", res.negative, "```");
    return out.join("\n") + "\n";
  }

  var api = {
    compose: compose, renderMarkdown: renderMarkdown, resolveCast: resolveCast,
    roleFits: roleFits, fittingCharacters: fittingCharacters, fmtTotal: fmtTotal
  };
  root.SeedanceComposer = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
