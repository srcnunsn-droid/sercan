/* CineBG Studio v8 — prompt çeşitliliği.
   CB.prompts'u sarar: Soul Cinema, ONE SHOT, Midjourney ve Seedance metinleri seed + kategori kimliğine göre
   farklı cümle kalıplarıyla yeniden kurulur, böylece komşu kategoriler aynı okunmaz. Skill yapıları korunur:
   Soul (Lira) — kamera çapası önce, olumlu dil, 60/30/10 palet, teknik blok sonda, oran yazılmaz;
   ONE SHOT W1 — dört yer işareti, koyu okunur zemin, boş mekân, en fazla bir imkânsız öğe, AVOID en sonda;
   Seedance — tek eylem, tek kamera hareketi, silah sözcüğü yok. Ters açı, referans sayfası ve W8 olduğu gibi kalır. */
(function () {
  const CB = window.CB;
  if (!CB || !CB.prompts) return;
  const base = CB.prompts;

  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const low = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const strip = (t) => t.replace(/\s+/g, ' ').replace(/\s+([.,;])/g, '$1').replace(/\.\./g, '.').trim();
  const endDot = (t) => t.trim().replace(/[.;,]+$/, '');
  function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
  const paletteLine = (s) => { const w = s.palette.w; return `palette of 60% ${w[0]}, 30% ${w[1]}, 10% ${w[2]} with touches of ${w[3]}`; };
  const ctxNoun = (s) => (s.ctx === 'int' ? 'interior' : s.ctx === 'space' ? 'vista' : s.ctx === 'water' ? 'underwater scene' : 'location');

  /* ön plan katmanı (js/foreground.js): s.fg = { type, en? } */
  function fgText(s) {
    const f = s.fg;
    if (!f) return '';
    if (typeof f === 'string') return f;
    if (f.en) return f.en;
    const list = CB.FOREGROUNDS || [];
    const hit = typeof f.type === 'number' ? list[f.type] : list.find((x) => x.id === f.type || x.id === f.id);
    return hit && hit.en && hit.id !== 'none' ? hit.en : '';
  }

  /* lens & atmosfer mikro ayrıntısı — bağlama uygun, istem başına en fazla bir tane */
  const MICRO = {
    dust: ['fine dust motes catch the key light'],
    land: ['the far distance softens into cool aerial perspective', 'specular glints pick out the hardest edges', 'long shadows describe every change in the terrain'],
    any: ['subtle halation glows around the brightest highlights', 'micro-contrast holds texture deep into the shadows', 'edges fall off gently toward the corners of the frame'],
    water: ['suspended particles drift through the light shafts', 'soft caustic patterns ripple across every surface', 'visibility falls off gently into blue depth'],
    space: ['faint starlight dust glitters at the edges of the frame', 'the deep black holds subtle tonal gradation'],
    clean: ['clean gradients roll off smoothly', 'soft bounce light lifts the shadow side'],
  };
  function microDetail(s, r) {
    if (r() < 0.25) return '';
    const wet = /rain|drizzle|storm|snow|blizzard|fog|mist|monsoon|hail/.test(s.weather.id);
    let pool;
    if (s.ctx === 'water') pool = MICRO.water;
    else if (s.ctx === 'space') pool = MICRO.space;
    else if (s.ctx === 'abstract' || s.ctx === 'studio') pool = MICRO.clean.concat(MICRO.any);
    else if (s.ctx === 'int') pool = MICRO.any.concat(wet ? [] : MICRO.dust);
    else pool = MICRO.any.concat(MICRO.land, wet ? [] : MICRO.dust);
    return pick(r, pool);
  }

  /* Seedance: silah sözcüğü yok (moderasyon ön kontrolü) */
  const WEAPON = [
    [/\b(swords|rifles|guns|muskets|pistols|revolvers|weapons|bayonets|grenades|missiles|bombs|cannons)\b/gi, 'relics'],
    [/\b(sword|rifle|gun|musket|pistol|revolver|weapon|bayonet|grenade|missile|bomb|cannon)\b/gi, 'relic'],
    [/\b(spears|arrows)\b/gi, 'wooden poles'], [/\b(spear|arrow)\b/gi, 'wooden pole'],
    [/\b(artillery|ammunition|ammo)\b/gi, 'heavy debris'], [/\bbattle-?axes?\b/gi, 'iron relics'],
  ];
  const unarm = (t) => WEAPON.reduce((acc, [re, to]) => acc.replace(re, to), t);

  CB.prompts = function (s, aspect) {
    const P = base(s, aspect);
    try {
      const r = rng(fnv(String(s.seed >>> 0) + '|' + s.cat.id));
      const L = s.landmarks;
      const grade = CB.GRADES[s.gradeId];
      const season = s.season ? `, ${s.season.en}` : '';
      const empty = s.ctx === 'space' ? 'An empty, silent vista.' : s.ctx === 'abstract' ? 'Clean uncluttered background with generous negative space for titles.' : s.ctx === 'studio' ? 'Empty set with a clear, unoccupied product placement area in the centre and generous negative space for copy.' : `Empty deserted ${ctxNoun(s)}, every space unoccupied, still air.`;
      const sizeTxt = s.ctx === 'studio' ? `a studio set about ${s.size} metres wide` : s.size ? `roughly ${s.size} metres across` : s.ctx === 'abstract' ? 'filling the whole frame' : 'vast beyond scale';
      const loc = CB.locText(s.cat);
      const natural = ['nature', 'water', 'sky', 'micro', 'abstract', 'space', 'landscape'].includes(s.group.arch);
      const build = natural ? `with textures of ${s.materials[0]} and ${s.materials[1]}` : `built from ${s.materials[0]} and ${s.materials[1]}`;
      const tech = s.ctx === 'studio' ? CB.TECH.studio : CB.TECH[s.tech];
      const look = s.ctx === 'studio' ? 'Polished advertising campaign look' : cap(s.cine);
      const cam = cap(endDot(s.camera.en));
      // kamera sistemi açıları lensi zaten metinde taşır — tekrar yazma
      const lensIn = s.camera.en.includes(s.camera.lens);
      const camC = low(cam).replace(/^camera /, '');
      const lens = s.camera.lens;
      const rev = s.camera.rev;
      const Lt = rev ? L.right : L.left, Rt = rev ? L.left : L.right, Far = rev ? 'the original camera position' : L.far;
      // kamera tarifi zaten bir ön plan çerçevesi içeriyorsa ikinci bir ön plan ekleme
      const fg = /foreground/i.test(s.camera.en) ? '' : endDot(fgText(s));
      const micro = microDetail(s, r);
      const presetEn = s.preset && s.preset.en ? endDot(s.preset.en) : '';
      const time = endDot(s.time.en), light = endDot(s.light.en), weather = endDot(s.weather.en);

      /* ---------- Soul Cinema (Lira) ---------- */
      const camS = pick(r, [
        `${cam}${lensIn ? '' : `, ${lens} lens`}, rule of thirds composition.`,
        `${cam}${lensIn ? '' : ` on a ${lens} lens`}, the frame built on the rule of thirds.`,
        `Camera: ${camC}${lensIn ? '' : `, ${lens} lens`}, balanced thirds composition.`,
        lensIn ? `Camera: ${camC}, composed on the rule of thirds.` : `${lens} lens, ${low(cam)}, composed on the rule of thirds.`,
      ]);
      const locS = pick(r, [
        `${cap(loc)}, ${s.cond.en}${season}, ${sizeTxt}, ${build}.`,
        `The location: ${loc}, ${s.cond.en}${season}; ${sizeTxt}, ${build}.`,
        `${cap(loc)}, ${build}, ${s.cond.en}${season}, ${sizeTxt}.`,
      ]);
      const landS = pick(r, [
        `${cap(Lt)} rises on the left, ${Rt} stands on the right, ${L.center} marks the centre, and ${Far} closes the far end.`,
        `At the centre stands ${L.center}; ${Lt} frames the left side, ${Rt} frames the right, and ${Far} anchors the far distance.`,
        `The eye travels from ${Lt} on the left past ${L.center} in the middle ground to ${Far} at the far end, with ${Rt} holding the right edge.`,
        `${cap(L.center)} holds the centre of the frame, flanked by ${Lt} on the left and ${Rt} on the right, while ${Far} closes the view.`,
      ]);
      const floorS = pick(r, [`The ground is ${s.floor}.`, `Underfoot lies ${s.floor}, dark and readable.`, `The floor reads as ${s.floor}.`]);
      const fgS = !fg ? '' : /foreground/i.test(fg) ? `${cap(fg)}.` : pick(r, [`Foreground: ${fg}.`, `Framing the near foreground: ${low(fg)}.`, `In front of the lens, ${low(fg)}.`]);
      const presetS = presetEn ? `Composition: ${low(presetEn)}.` : '';
      const lightS = pick(r, [
        `${cap(time)}; ${light}. ${cap(weather)}, volumetric haze separating foreground, mid-ground and background.`,
        `Light: ${time}, ${light}. ${cap(weather)}, with layered atmospheric depth between foreground, mid-ground and background.`,
        `${cap(weather)}. ${cap(time)}, ${light}, soft volumetric haze stacking the depth planes.`,
      ]);
      const impS = s.impossible ? pick(r, [`One impossible detail: ${s.impossible}.`, `A single impossible element: ${s.impossible}.`]) : '';
      const microS = micro ? `${cap(micro)}.` : '';
      const palS = pick(r, [`Refined ${paletteLine(s)}; ${grade.en}.`, `Colour: ${paletteLine(s)}, ${grade.en}.`, `${cap(grade.en)}, ${paletteLine(s)}.`]);
      const techS = pick(r, [`${look}. ${tech}.`, `${tech}. ${look}.`]);
      const lightFirst = r() < 0.4;
      // isteğe bağlı parçalar bütçeyi aşarsa sırayla düşer (Soul ≤ ~210 kelime + stil satırı)
      const opt = { microS, presetS, fgS };
      const build2 = () => (lightFirst
        ? [camS, locS, lightS, impS, landS, floorS, opt.fgS, opt.presetS, opt.microS, empty, palS, techS]
        : [camS, locS, landS, floorS, opt.fgS, opt.presetS, lightS, impS, opt.microS, empty, palS, techS]);
      let soul = strip(build2().filter(Boolean).join(' '));
      for (const k of ['microS', 'presetS', 'fgS']) { if (soul.split(/\s+/).length <= 210) break; opt[k] = ''; soul = strip(build2().filter(Boolean).join(' ')); }

      /* ---------- ONE SHOT · W1 ---------- */
      const oneshot = [
        `CAMERA: ${cam}${lensIn ? '' : `, ${lens} lens`}, ${pick(r, ['grounded composition, rule of thirds.', 'deliberate framing on the thirds.', 'stable composition with clear depth layers.'])}`,
        `SCENE: ${cap(loc)}, ${s.cond.en}${season}, ${sizeTxt}, ${build}.`,
        'LANDMARKS, fixed positions:',
        `- CENTRE: ${L.center}`,
        `- LEFT: ${L.left}`,
        `- RIGHT: ${L.right}`,
        `- FAR END: ${L.far}${s.farDist ? `, about ${s.farDist} m away` : ''}`,
        `FLOOR: ${pick(r, [`The surface is ${s.floor}, dark and readable.`, `${cap(s.floor)} underfoot, dark and readable.`, `Dark, readable ground of ${s.floor}.`])}`,
      ];
      if (fg) oneshot.push(`FOREGROUND: ${cap(fg)}.`); // ONE SHOT bloğu etiketli kalır
      oneshot.push(
        `ATMOSPHERE: ${cap(weather)}${season}.${micro ? ' ' + cap(micro) + '.' : ''}`,
        `LIGHT: ${pick(r, [`${cap(time)}; ${light}; volumetric haze giving depth between foreground, mid-ground and background.`, `${cap(time)}, ${light}, layered haze separating the depth planes.`])}`,
        `FINISH: ${pick(r, ['photoreal live-action film location plate', 'photoreal practical film location plate', 'photographic live-action location plate'])}, practical set build with real ${s.materials[0]} and ${s.materials[1]}, atmospheric depth, subtle film grain, ${grade.en}, ${paletteLine(s)}, deep shadows that still hold texture. EMPTY of people.`,
      );
      if (s.impossible) oneshot.push(`IMPOSSIBLE: exactly one impossible element: ${s.impossible}.`);
      oneshot.push(`AVOID: ${CB.NEGATIVE.join(', ')}`);

      /* ---------- Midjourney ---------- */
      const ar = aspect ? aspect.mj : '16:9';
      const mid = [s.camera.en.split(',')[0], `${s.cond.en}${season}`, weather, time, light.split(',')[0], s.palette.w.slice(0, 3).join(', '), grade.en.split(',')[0]];
      if (fg) mid.push(fg.split(',')[0]);
      if (micro) mid.push(micro);
      for (let i = mid.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mid[i], mid[j]] = [mid[j], mid[i]]; }
      const mj = strip(`cinematic film still, ${loc}, ${mid.join(', ')}, ${s.tech === 'film' ? '35mm film grain, anamorphic' : 'clean digital cinema'}, empty location`) +
        ` --ar ${ar} --style raw --v 7 --no people, text, logo, watermark, cartoon`;

      /* ---------- Seedance / video plakası: tek hareket, tek eylem ---------- */
      const moves = s.ctx === 'int'
        ? ['slow dolly-in down the length of the space', 'locked-off static camera', 'slow lateral truck past the foreground', 'gentle push-in toward the light source']
        : ['slow aerial drift forward', 'locked-off static camera on a tripod', 'slow lateral truck along the foreground', 'slow crane rise revealing the far end', 'very slow push-in toward the far landmark'];
      const vMatch = /Ambient motion only: ([^.]*)\./.exec(P.video);
      const motion = vMatch ? vMatch[1] : 'subtle ambient motion';
      const move = pick(r, moves);
      const vidLoc = `${cap(unarm(loc))}, ${unarm(s.cond.en)}${season}.`;
      const video = strip(pick(r, [
        `10-second cinematic background plate, single continuous shot, ${move}, ${lens} lens, rule of thirds. ${vidLoc} Ambient motion only: ${motion}. ${cap(time)}; ${light}. ${cap(paletteLine(s))}; ${grade.en}. ${tech}. ${empty}`,
        `${vidLoc} 10-second cinematic background plate in a single continuous shot: ${move}, ${lens} lens, rule of thirds. Ambient motion only: ${motion}. Light: ${time}, ${light}. ${cap(paletteLine(s))}; ${grade.en}. ${tech}. ${empty}`,
        `Single continuous 10-second background plate. Camera: ${move}, ${lens} lens, rule of thirds. ${vidLoc} Ambient motion only: ${motion}. ${cap(time)}; ${light}. ${cap(grade.en)}, ${paletteLine(s)}. ${tech}. ${empty}`,
      ]));

      const out = Object.assign({}, P, { soul, oneshot: oneshot.join('\n'), mj, video });
      if (CB.applyVideoStyle) CB.applyVideoStyle(out, s);
      // Lira: oran Soul promptuna yazılmaz (arayüzden seçilir) — stil satırındaki "2.39:1" gibi ifadeleri ayıkla
      out.soul = strip(out.soul.replace(/\b\d+(?:\.\d+)?:\d+\s*/g, '').replace(/\b(?:1\.85|2\.35|2\.39)\s+/g, ''));
      return out;
    } catch (e) {
      return P; // her koşulda temel istemler döner
    }
  };
})();
