/* CineBG Studio — seed'li sahne spesifikasyonu ve prompt motoru.
   Prompt kuralları yüklü skill'lerden: Lira (Soul Cinema mekan şablonu, pozitif dil, 60/30/10 palet,
   platform parametreleri prompt dışında) ve ONE SHOT (boş plaka, dört yer işareti, karanlık okunur zemin,
   tek imkansız unsur, AVOID satırı). */
(function () {
  const CB = (window.CB = window.CB || {});

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
  const rr = (r, a, b) => a + (b - a) * r();
  CB.rng = mulberry32;
  CB.strHash = strHash;

  const INT_RE = /\b(interior|room|hall|corridor|office|lab\b|chamber|lobby|studio|bar\b|club|cell block|ward|vault|kitchen|library|gallery|bunker|tunnel|platform|terminal|hangar|deck|inside|theatre|theater|cinema|casino|arcade|auditorium|dojo|hammam|bath|nave|crypt|parlou?r|bedroom|bedchamber|classroom|cafeteria|courtroom|precinct|gymnasium|laundromat|barbershop|den\b|cabin interior|carriage|compartment|booth|bay\b|quarters|crawlway|module|habitat|tent\b|bowling|karaoke|rink|stage|ballroom|cloister|madrasa|synagogue|speakeasy|diner|post office|town hall|museum|reading room|dome\b|rave|nightclub|ring\b)\b/i;
  const NO_SNOW = /desert|jungle|volcanic|africa|underwater|space|tropic/;
  const NO_DUST = /polar|jungle|rivers|coast|underwater|space|starship/;

  const GRADE_BY_ARCH = {
    battle: ['war', 'war', 'bleach', 'blockbuster', 'neonoir'], scifi: ['scifi', 'neon', 'blockbuster', 'bleach'], fortress: ['epic', 'kodak', 'war', 'eterna'],
    ruins: ['bleach', 'war', 'spice', 'eterna'], urban: ['neonoir', 'kodak', 'blockbuster', 'noir'], ancient: ['kodak', 'spice', 'epic', 'eterna'],
    industrial: ['neonoir', 'bleach', 'digital', 'war'], nature: ['natural', 'kodak', 'eterna', 'blockbuster'], water: ['natural', 'blockbuster', 'eterna', 'moonlight'],
    underground: ['epic', 'neonoir', 'moonlight', 'horror'], space: ['scifi', 'blockbuster', 'natural', 'epic'], fantasy: ['epic', 'kodak', 'pastel', 'eterna'],
    gothic: ['horror', 'noir', 'moonlight', 'epic'], horror: ['horror', 'horror', 'noir', 'digital'], sacred: ['kodak', 'epic', 'eterna', 'natural'],
    palace: ['kodak', 'epic', 'pastel', 'neonoir'], interior: ['kodak', 'eterna', 'natural', 'pastel'], western: ['spice', 'kodak', 'bleach', 'war'],
    eastasia: ['eterna', 'kodak', 'natural', 'neon'], anatolia: ['kodak', 'spice', 'epic', 'eterna'], sky: ['natural', 'blockbuster', 'epic', 'moonlight'],
    arena: ['blockbuster', 'neonoir', 'war', 'epic'], dystopia: ['bleach', 'digital', 'scifi', 'noir'],
  };

  /* Motor parametrelerini sahneye göre yönlendir (indeksler glsl.js'deki parametre sırasına göre) */
  const HOOKS = {
    mountains: (p, s) => { p[2] = s.time.sun * 0.9; p[6] = /fog|mist/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[6]; p[7] = /storm|overcast|rain/.test(s.weather.id + s.time.id) ? rr(s.r, 0.6, 1) : p[7]; },
    ocean: (p, s) => { p[2] = s.time.sun * 0.85; p[4] = /storm|rain|overcast/.test(s.weather.id + s.time.id) ? rr(s.r, 0.6, 1) : p[4]; },
    dunes: (p, s) => { p[2] = s.time.sun * 0.9; p[7] = s.weather.id === 'dust' ? rr(s.r, 0.7, 1) : p[7]; p[5] = s.weather.id === 'heat' ? 0.9 : p[5]; },
    storm: (p, s) => { p[4] = s.weather.id === 'storm' ? rr(s.r, 0.6, 1) : p[4] * 0.4; p[5] = /rain|drizzle/.test(s.weather.id) ? rr(s.r, 0.5, 1) : p[5] * 0.3; },
    city: (p, s) => { p[3] = /rain|drizzle/.test(s.weather.id) ? rr(s.r, 0.5, 1) : 0; p[2] = /fog|mist|smoke/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[2]; },
    forest: (p, s) => { p[2] = /fog|mist/.test(s.weather.id) ? rr(s.r, 0.7, 1) : p[2]; p[6] = /fog|mist/.test(s.weather.id) ? rr(s.r, 0.5, 1) : p[6]; },
    battlefield: (p, s) => { p[1] = /burning|smoldering|active/.test(s.cond.id) ? rr(s.r, 0.6, 1) : p[1] * 0.5; p[0] = /smoke|ash|aftermath|fog|mist/.test(s.weather.id + s.cond.id) ? rr(s.r, 0.6, 1) : p[0]; p[6] = s.time.night ? 0.15 : rr(s.r, 0.4, 1); },
    skyline: (p, s) => { p[3] = s.time.night ? rr(s.r, 0.5, 1) : rr(s.r, 0, 0.3); p[4] = /fog|mist|smoke|dust/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[4]; },
    castle: (p, s) => { p[4] = /fog|mist/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[4]; p[6] = s.time.night ? rr(s.r, 0.4, 1) : 0; p[5] = 1 - Math.abs(s.time.sun - 0.15); },
    hall: (p, s) => { p[1] = s.time.night ? rr(s.r, 0.15, 0.4) : rr(s.r, 0.5, 1); p[3] = /motes|smoke|steam/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[3]; },
    godrays: (p, s) => { p[7] = s.time.night ? rr(s.r, 0.1, 0.4) : rr(s.r, 0.4, 1); },
    aurora: (p, s) => { p[6] = rr(s.r, 0.3, 1); },
    underwater: (p, s) => { p[2] = s.time.sun; p[0] = 1 - s.time.sun * 0.8; },
    planet: (p, s) => { p[3] = rr(s.r, 0.2, 0.8); },
  };

  function contextOf(cat) {
    const g = cat.group;
    if (g.ctx !== 'mixed') return g.ctx;
    return INT_RE.test(cat.en) ? 'int' : 'ext';
  }

  function enginesFor(cat, ctx) {
    const list = cat.group.engines.slice();
    if (ctx === 'int') {
      const ok = list.filter((e) => ['hall', 'godrays', 'smoke', 'anamorphic', 'city', 'underwater', 'silk'].includes(e));
      return ok.length ? ok : ['hall', 'godrays'];
    }
    const ok = list.filter((e) => e !== 'hall');
    return ok.length ? ok : ['mountains'];
  }

  /* opts: { engine?, time?, weather?, camera?, palette?, grade?, impossible?: 'auto'|'on'|'off' } — 'auto'/undefined = seed'den */
  CB.makeSpec = function (cat, seed, opts = {}) {
    const r = mulberry32((seed ^ strHash(cat.id)) >>> 0);
    const g = cat.group;
    const ctx = contextOf(cat);
    const tctx = ctx === 'sky' ? 'ext' : ctx;
    const s = { cat, group: g, seed, ctx, r };

    const times = CB.TIMES[tctx];
    s.time = (opts.time && times.find((t) => t.id === opts.time)) || pick(r, times);
    let weathers = CB.WEATHER[tctx];
    if (tctx === 'ext') {
      weathers = weathers.filter((w) => !((w.id === 'snow' || w.id === 'blizzard') && NO_SNOW.test(g.id)) && !((w.id === 'dust' || w.id === 'heat') && NO_DUST.test(g.id)));
    }
    s.weather = (opts.weather && weathers.find((w) => w.id === opts.weather)) || pick(r, weathers);
    s.season = tctx === 'ext' && ['nature', 'fortress', 'battle', 'ancient', 'western', 'eastasia'].includes(g.arch) && r() < 0.55 ? pick(r, CB.SEASONS) : null;
    if (s.season && /snow|blizzard/.test(s.weather.id)) s.season = CB.SEASONS[3];
    const condId = pick(r, g.cond);
    s.cond = Object.assign({ id: condId }, CB.CONDITIONS[condId] || { tr: condId, en: condId });

    let cams = CB.CAMERAS;
    if (ctx === 'space') cams = cams.filter((c) => ['est', 'tele', 'silhouette', 'sym'].includes(c.id));
    if (ctx === 'int') cams = cams.filter((c) => c.id !== 'drone' && c.id !== 'silhouette');
    s.camera = (opts.camera && CB.CAMERAS.find((c) => c.id === opts.camera)) || pick(r, cams);
    s.light = pick(r, s.time.night ? CB.LIGHTS.night : CB.LIGHTS.day);

    const A = CB.ARCH[g.arch];
    s.landmarks = { center: pick(r, A.center), left: pick(r, A.left), right: pick(r, A.right), far: pick(r, A.far) };
    s.floor = pick(r, A.floor);
    const m1 = pick(r, A.materials); let m2 = pick(r, A.materials); if (m2 === m1) m2 = A.materials[(A.materials.indexOf(m1) + 1) % A.materials.length];
    s.materials = [m1, m2];
    s.size = ctx === 'int' ? Math.round(rr(r, 14, 90)) : ctx === 'space' ? null : Math.round(rr(r, 3, 40)) * 50;
    s.farDist = s.size ? Math.round(s.size * rr(r, 0.5, 0.9)) : null;

    const imp = opts.impossible || 'auto';
    const fantasyish = ['fantasy', 'gothic'].includes(g.arch) || g.id === 'myth';
    s.impossible = imp === 'on' || (imp === 'auto' && fantasyish && r() < 0.7) ? pick(r, CB.IMPOSSIBLE) : null;
    s.cine = pick(r, CB.CINEMATOGRAPHERS);
    s.tech = r() < 0.65 ? 'film' : 'digital';

    // palet: zaman + hava + bağlam etiketleri
    const want = new Set(s.time.pal);
    if (/storm|rain|overcast/.test(s.weather.id)) { want.add('storm'); want.add('overcast'); }
    if (/burning|smoldering|erupting|active/.test(condId)) want.add('fire');
    if (ctx === 'water') want.add('water');
    if (ctx === 'space') want.add('space');
    if (g.id === 'cyber' || g.id === 'nightlife') want.add('neon');
    if (g.arch === 'palace') want.add('palace');
    const cands = CB.PALETTES.filter((p) => p.tags.some((t) => want.has(t)));
    s.palette = (opts.palette && CB.PALETTES.find((p) => p.id === opts.palette)) || pick(r, cands.length ? cands : CB.PALETTES);
    let grades = GRADE_BY_ARCH[g.arch] || ['natural'];
    if (s.time.night && r() < 0.3) grades = ['moonlight', 'neonoir'];
    s.gradeId = opts.grade && CB.GRADES[opts.grade] ? opts.grade : pick(r, grades);

    // görsel motor + parametreler
    const engs = enginesFor(cat, ctx);
    s.engine = opts.engine && CB.ENGINES[opts.engine] ? opts.engine : pick(r, engs);
    s.params = Array.from({ length: 8 }, () => rr(r, 0.2, 0.85));
    if (HOOKS[s.engine]) HOOKS[s.engine](s.params, s);
    s.params = s.params.map((v) => Math.min(1, Math.max(0, v)));
    s.time0 = rr(r, 0, 120);
    return s;
  };

  CB.combinationCount = function () {
    const per = CB.TIMES.ext.length * CB.WEATHER.ext.length * CB.CAMERAS.length * CB.PALETTES.length * 4 * 5 * 5 * 5 * 5;
    return CB.CATS.length * per;
  };

  /* ---------------- Prompt motoru ---------------- */
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const strip = (t) => t.replace(/\s+/g, ' ').replace(/\s+([.,])/g, '$1').trim();
  function paletteLine(s) {
    const w = s.palette.w;
    return `palette of 60% ${w[0]}, 30% ${w[1]}, 10% ${w[2]} with touches of ${w[3]}`;
  }
  function ctxNoun(s) { return s.ctx === 'int' ? 'interior' : s.ctx === 'space' ? 'vista' : s.ctx === 'water' ? 'underwater scene' : 'location'; }

  CB.prompts = function (s, aspect) {
    const L = s.landmarks;
    const grade = CB.GRADES[s.gradeId];
    const season = s.season ? `, ${s.season.en}` : '';
    const empty = s.ctx === 'space' ? 'An empty, silent vista.' : `Empty deserted ${ctxNoun(s)}, every space unoccupied, still air.`;
    const sizeTxt = s.size ? `roughly ${s.size} metres across` : 'vast beyond scale';
    const imp = s.impossible ? ` One impossible detail: ${s.impossible}.` : '';

    // Lira · Higgsfield Soul Cinema mekan şablonu
    const soul = strip(`${cap(s.camera.en)}, ${s.camera.lens} lens, rule of thirds composition. ${cap(s.cat.en)}, ${s.cond.en}${season}, ${sizeTxt}, built from ${s.materials[0]} and ${s.materials[1]}. ` +
      `${cap(L.left)} rises on the left, ${L.right} stands on the right, ${L.center} marks the centre, and ${L.far} closes the far end. The ground is ${s.floor}. ` +
      `${cap(s.time.en)}; ${s.light.en}. ${cap(s.weather.en)}, volumetric haze separating foreground, mid-ground and background.${imp} ` +
      `Refined ${paletteLine(s)}; ${grade.en}. ${CB.TECH[s.tech]}. ${s.cine}. ${empty}`);

    // ONE SHOT · W1 lokasyon plakası blokları (GPT Image 2 / Seedream / NBP)
    const oneshot = [
      `CAMERA: ${cap(s.camera.en)}, ${s.camera.lens} lens, grounded composition, rule of thirds.`,
      `SCENE: ${cap(s.cat.en)}, ${s.cond.en}${season}, ${sizeTxt}, built from ${s.materials[0]} and ${s.materials[1]}.`,
      `LANDMARKS, fixed positions:`,
      `- CENTRE: ${L.center}`,
      `- LEFT: ${L.left}`,
      `- RIGHT: ${L.right}`,
      `- FAR END: ${L.far}${s.farDist ? `, about ${s.farDist} m away` : ''}`,
      `FLOOR: The surface is ${s.floor}, dark and readable.`,
      `ATMOSPHERE: ${cap(s.weather.en)}${season}.`,
      `LIGHT: ${cap(s.time.en)}; ${s.light.en}; volumetric haze giving depth between foreground, mid-ground and background.`,
      `FINISH: photoreal live-action film location plate, practical set build with real ${s.materials[0]} and ${s.materials[1]}, atmospheric depth, subtle film grain, ${grade.en}, ${paletteLine(s)}, deep shadows that still hold texture. EMPTY of people.`,
    ];
    if (s.impossible) oneshot.push(`IMPOSSIBLE: exactly one impossible element: ${s.impossible}.`);
    oneshot.push(`AVOID: ${CB.NEGATIVE.join(', ')}`);

    // Midjourney
    const ar = aspect ? aspect.mj : '16:9';
    const mj = strip(`cinematic film still, ${s.camera.en.split(',')[0]}, ${s.cat.en}, ${s.cond.en}${season}, ${s.weather.en}, ${s.time.en}, ${s.light.en.split(',')[0]}, ${s.palette.w.slice(0, 3).join(', ')}, ${grade.en.split(',')[0]}, ${s.tech === 'film' ? '35mm film grain, anamorphic' : 'clean digital cinema'}, empty location`) +
      ` --ar ${ar} --style raw --v 7 --no people, text, logo, watermark, cartoon`;

    // Seedance / video arka plan plakası (Lira: "states not transitions", rule of thirds)
    const moves = s.ctx === 'int'
      ? ['slow dolly-in down the length of the space', 'locked-off static camera', 'slow lateral truck past the foreground', 'gentle push-in toward the light source']
      : ['slow aerial drift forward', 'locked-off static camera on a tripod', 'slow lateral truck along the foreground', 'slow crane rise revealing the far end', 'very slow push-in toward the far landmark'];
    const motion = {
      clear: 'light breeze moving grass and cloth', mist: 'mist slowly rolling across the low ground', fog: 'fog banks drifting past', drizzle: 'drizzle falling, ripples in puddles',
      rain: 'heavy rain falling continuously, splashes on every surface', afterrain: 'drips falling from edges, ripples in puddles', snow: 'snowflakes drifting down', blizzard: 'snow driven sideways by wind',
      dust: 'dust and sand streaming in the wind', smoke: 'smoke columns rising and drifting', ash: 'ash flakes falling slowly', storm: 'lightning flickering inside the clouds',
      heat: 'heat shimmer rippling over the ground', wind: 'wind whipping banners and debris', still: 'dust motes hanging in the light', motes: 'dust motes drifting through the beams',
      smokeint: 'smoke layers curling under the ceiling', steam: 'steam venting and drifting', rainwin: 'rain running down the windows', drip: 'water dripping into shallow pools',
      dustcos: 'cosmic dust drifting slowly', debris: 'debris tumbling slowly', solarwind: 'glowing solar wind rippling', void: 'stars slowly turning',
      clearw: 'light rays swaying from the surface', snoww: 'marine snow drifting down', silt: 'silt clouds billowing slowly', current: 'plants and particles bending in the current',
    }[s.weather.id] || 'subtle ambient motion';
    const video = strip(`10-second cinematic background plate, single continuous shot, ${pick(s.r, moves)}, ${s.camera.lens} lens, rule of thirds. ${cap(s.cat.en)}, ${s.cond.en}${season}. ` +
      `Ambient motion only: ${motion}. ${cap(s.time.en)}; ${s.light.en}. ${cap(paletteLine(s))}; ${grade.en}. ${CB.TECH[s.tech]}. ${empty}`);

    const negative = CB.NEGATIVE.join(', ');
    return { soul, oneshot: oneshot.join('\n'), mj, video, negative };
  };

  CB.specCode = function (s) {
    return 'CB-' + String(s.cat.group.index + 1).padStart(2, '0') + String(s.group.cats.indexOf(s.cat) + 1).padStart(2, '0') + '-' + (s.seed >>> 0).toString(36).toUpperCase();
  };
})();
