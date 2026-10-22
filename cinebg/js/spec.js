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
    street: ['natural', 'kodak', 'neonoir', 'portra', 'doc16', 'eterna'], landscape: ['natural', 'velvia', 'kodak', 'eterna', 'portra'],
    home: ['portra', 'kodak', 'eterna', 'natural', 'highkey'], daily: ['natural', 'portra', 'doc16', 'eterna', 'digital'],
    micro: ['scifi', 'neon', 'natural', 'pastel'], abstract: ['neon', 'pastel', 'blockbuster', 'natural', 'scifi', 'kodak'],
    modern: ['natural', 'kodak', 'blockbuster', 'eterna', 'neonoir'], product: ['natural', 'pastel', 'kodak', 'eterna', 'blockbuster'],
  };

  /* Motor parametrelerini sahneye göre yönlendir (indeksler glsl.js'deki parametre sırasına göre) */
  const ATMOS = {
    rain: { rain: 0.65, fog: 0.15 }, drizzle: { rain: 0.3, fog: 0.1 }, afterrain: { fog: 0.1 }, snow: { snow: 0.55 }, blizzard: { snow: 1, fog: 0.45 },
    fog: { fog: 0.75 }, mist: { fog: 0.4 }, smoke: { fog: 0.3, ash: 0.15 }, ash: { ash: 0.7, fog: 0.2 }, dust: { dust: 0.7 }, storm: { lightning: 0.7, rain: 0.4 },
    heat: { dust: 0.2 }, wind: { dust: 0.25 }, motes: { dust: 0.15 }, smokeint: { fog: 0.25 }, steam: { fog: 0.3 }, rainwin: { rain: 0.2 },
    snoww: { snow: 0.25 }, silt: { fog: 0.35 }, dustcos: { dust: 0.2 }, particles: { dust: 0.2 }, liquid: { fog: 0.3 },
    hazest: { fog: 0.2, leak: 0.25 }, petals: { dust: 0.2 }, floatgeo: { leak: 0.2 },
  };
  const HINT = {
    'battle-ancient': 'on an ancient or medieval battlefield', 'battle-modern': 'in a twentieth-century war zone', 'battle-future': 'in a future war', siege: 'in a besieged medieval fortress',
    postapoc: 'after the collapse of civilisation', urban: 'in a modern city', cyber: 'in a neon cyberpunk megacity', historic: 'in a historic period setting',
    industrial: 'in a heavy industrial setting', military: 'at a military installation', mountains: 'high in the mountains', desert: 'in an arid desert', forest: 'deep in a forest',
    jungle: 'in a humid tropical jungle', polar: 'in the frozen polar north', coast: 'on a wild sea coast', rivers: 'by fresh water', plains: 'in open countryside',
    volcanic: 'in volcanic terrain', caves: 'deep underground', underwater: 'deep underwater', space: 'in deep space', starship: 'aboard a large starship',
    fantasy: 'in a high-fantasy realm', darkfantasy: 'in a dark gothic fantasy realm', horror: 'in a horror film setting', sacred: 'in a sacred place of worship',
    palace: 'inside a grand palace', residential: 'inside a home', public: 'inside a public building', transport: 'in a transport hub', western: 'on the 1870s American frontier',
    noir: 'in a mid-century film-noir city', eastasia: 'in East Asia', anatolia: 'in Anatolia and the Middle East', sky: 'in the open sky', arena: 'in an arena built for combat or spectacle',
    nightlife: 'in a nightlife district', lab: 'in a high-tech laboratory', dystopia: 'in a totalitarian dystopia', myth: 'in a mythological realm', disaster: 'during a catastrophe',
    africa: 'in Africa', villages: 'in a traditional village', roads: 'on the open road', egypt: 'in ancient Egypt', greco: 'in the ancient Greco-Roman world',
    norse: 'in the Viking-age north', pirates: 'in the golden age of sail', steampunk: 'in a steampunk Victorian world of brass and steam', dieselpunk: 'in a dieselpunk art deco future',
    solarpunk: 'in a lush solarpunk future', alien: 'on an alien planet', zombie: 'during a zombie outbreak', prison: 'inside a prison', southasia: 'in South and Southeast Asia',
    latam: 'in Latin America', parks: 'in a North American national park', academy: 'inside an old academy of magic and learning', modernarch: 'in contemporary architecture',
    vehicles: 'inside a vehicle', filmset: 'on a film studio lot', crime: 'in a crime-film underworld', fairytale: 'in a storybook fairy-tale world', medievallife: 'in everyday medieval life',
    navalair: 'in a naval and air war', micro: 'at microscopic scale', abstract: 'as an abstract cinematic graphic',
    'modern-city': 'in a contemporary city today', 'modern-work': 'in a contemporary workplace', 'modern-home': 'in a contemporary home', 'modern-retail': 'in a contemporary retail space',
    'modern-leisure': 'in a contemporary leisure venue', 'ad-podium': 'as an advertising product set', 'ad-surreal': 'as a surreal advertising set', 'ad-nature': 'as a natural product advertising set',
    'ad-luxury': 'as a luxury advertising set', 'ad-food': 'as a food and drink advertising set', 'ad-tech': 'as a tech and automotive advertising set',
  };
  CB.locText = function (cat) {
    const h = HINT[cat.group.id];
    const b = cat.base || cat;
    const t = h && b.en.split(' ').length <= 5 ? `${b.en} ${h}` : b.en;
    return cat.q ? `${t}, ${cat.q.en}` : t;
  };
  const HOOKS = (CB.ENGINE_HOOKS = CB.ENGINE_HOOKS || {});
  Object.assign(HOOKS, {
    podium: (p, s) => { p[4] = /gobo|golden/.test(s.time.id) ? rr(s.r, 0.45, 0.85) : 0; p[6] = s.time.id === 'lowkey' ? 0.15 : p[6]; },
    clouds: (p, s) => { p[2] = s.time.sun * 0.9; },
    rainglass: (p, s) => { p[1] = /rain|drizzle/.test(s.weather.id) ? rr(s.r, 0.6, 1) : p[1] * 0.6; },
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
  });

  /* Bağlama uygun kamera havuzu */
  CB.camerasFor = function (ctx) {
    const C = CB.CAMERAS;
    if (ctx === 'studio') return C.filter((c) => c.only === 'studio').concat(C.filter((c) => ['sym', 'detail', 'dutch', 'tele'].includes(c.id)));
    const base = C.filter((c) => !c.only);
    if (ctx === 'space') return base.filter((c) => ['est', 'tele', 'silhouette', 'sym', 'xls', 'orbit', 'dutch'].includes(c.id));
    if (ctx === 'abstract') return base.filter((c) => ['sym', 'tele', 'eye', 'frame', 'dutch', 'detail'].includes(c.id));
    if (ctx === 'int') return base.filter((c) => !['drone', 'silhouette', 'bird', 'orbit', 'xls'].includes(c.id));
    return base;
  };
  function contextOf(cat) {
    const g = cat.group;
    if (g.ctx !== 'mixed') return g.ctx;
    return INT_RE.test((cat.base || cat).en) ? 'int' : 'ext';
  }

  /* Kategori metnindeki anahtar kelimeler motor seçimini yönlendirir */
  const KEYS = (CB.ENGINE_KEYS = CB.ENGINE_KEYS || []);
  KEYS.push(
    [/podium|pedestal|plinth|product stage|display stand|turntable|cyclorama|studio set|product/i, ['podium']],
    [/forest|wood|tree|grove|jungle|bamboo|redwood|sequoia|birch|pine|cedar|maple|rainforest/i, ['forest', 'godrays']],
    [/fire|burning|blaze|wildfire|inferno|forge|furnace|flame|pyre/i, ['fire']],
    [/\bsea\b|ocean|coast|beach|harbou?r|wave|\bbay\b|lagoon|pier|shore|island|fjord|\bport\b|ship/i, ['ocean']],
    [/desert|dune|sand|oasis|salt flat|caravan|sahara/i, ['dunes']],
    [/mountain|peak|summit|ridge|alpine|himalaya|\bpass\b|highland|plateau/i, ['mountains']],
    [/canyon|gorge|ravine|slot/i, ['canyon']],
    [/lava|volcan|magma|caldera/i, ['lava']],
    [/cloud|\bsky\b|storm|thunder|lightning|hurricane|tornado/i, ['storm', 'clouds']],
    [/aurora|northern lights/i, ['aurora']],
    [/castle|fortress|citadel|stronghold|watchtower|\bfort\b|keep/i, ['castle']],
    [/city|street|skyline|skyscraper|downtown|metropolis|avenue|megacity|town/i, ['skyline', 'city']],
    [/neon|cyber|night market|nightclub|casino|arcade|bokeh/i, ['city', 'rainglass']],
    [/\brain|window/i, ['rainglass']],
    [/battle|\bwar\b|trench|siege|front line|battlefield|aftermath|bomb|ambush|raid/i, ['battlefield']],
    [/space|planet|moon|orbit|asteroid|nebula|\bstars?\b|comet|galactic/i, ['planet', 'nebula']],
    [/galaxy|spiral|black hole|accretion/i, ['galaxy', 'nebula']],
    [/underwater|reef|sunken|kelp|seabed|abyss|submerged|coral/i, ['underwater']],
    [/cave|cavern|underground|grotto|\bmine\b|catacomb|crypt|cellar|dungeon/i, ['godrays', 'tunnel']],
    [/corridor|hallway|tunnel|subway|metro/i, ['tunnel']],
    [/\bhall\b|cathedral|church|temple|palace|library|throne|nave|chapel|mosque|ballroom|monastery/i, ['hall', 'godrays']],
    [/\bcells?\b|neuron|dna|virus|bacteria|micro|blood|tissue/i, ['cells']],
    [/snow|\bice\b|frozen|winter|glacier|arctic|polar|blizzard/i, ['mountains', 'aurora']],
    [/light leak|gradient|orb|glow|particle|lens flare|spotlight/i, ['orbs', 'anamorphic']],
    [/smoke|ink|fog layer/i, ['smoke']],
  );
  const INT_OK = (CB.INT_OK = CB.INT_OK || []);
  INT_OK.push('hall', 'godrays', 'smoke', 'anamorphic', 'city', 'underwater', 'silk', 'tunnel', 'rainglass', 'orbs', 'fire', 'cells', 'podium');
  const INT_ONLY = (CB.INT_ONLY = CB.INT_ONLY || []);
  INT_ONLY.push('hall', 'tunnel', 'podium');
  function enginesFor(cat, ctx) {
    const allowed = (e) => (ctx === 'int' || ctx === 'studio' ? INT_OK.includes(e) : ctx === 'abstract' ? true : !INT_ONLY.includes(e));
    // INT_ONLY: yalnızca iç mekân / stüdyo motorları
    // metinde ilk geçen kavram kazanır (ör. "WWI trench … sandbag" → savaş alanı, kum tepesi değil)
    const text = (cat.base || cat).en; // varyant eki motor seçimini ele geçirmesin
    const hits = KEYS.map(([re, list]) => ({ i: text.search(re), list: list.filter(allowed) }))
      .filter((h) => h.i >= 0 && h.list.length).sort((a, b) => a.i - b.i);
    if (hits.length) return [...new Set(hits.filter((h) => h.i === hits[0].i).flatMap((h) => h.list))];
    const ok = cat.group.engines.filter(allowed);
    return ok.length ? ok : ctx === 'int' ? ['hall', 'godrays'] : ['mountains'];
  }

  /* opts: { engine?, time?, weather?, camera?, palette?, grade?, impossible?: 'auto'|'on'|'off' } — 'auto'/undefined = seed'den */
  CB.makeSpec = function (cat, seed, opts = {}) {
    const r = mulberry32((seed ^ strHash(cat.id)) >>> 0);
    const g = cat.group;
    const ctx = contextOf(cat);
    const tctx = ctx === 'sky' ? 'ext' : ctx;
    const s = { cat, group: g, seed, ctx, r };

    const times = CB.TIMES[tctx];
    let tpool = times;
    if (cat.q && cat.q.tn) { const f = times.filter((t) => (cat.q.tn === 'n' ? t.night : !t.night)); if (f.length) tpool = f; }
    s.time = pick(r, tpool);
    if (opts.time) s.time = times.find((t) => t.id === opts.time) || s.time;
    let weathers = CB.WEATHER[tctx];
    if (tctx === 'ext') {
      weathers = weathers.filter((w) => !((w.id === 'snow' || w.id === 'blizzard' || w.id === 'frost') && (NO_SNOW.test(g.id) || g.nosnow)) && !((w.id === 'dust' || w.id === 'heat' || w.id === 'sandstorm') && NO_DUST.test(g.id)));
    }
    s.weather = pick(r, weathers);
    if (opts.weather) s.weather = weathers.find((w) => w.id === opts.weather) || s.weather;
    s.season = tctx === 'ext' && ['nature', 'fortress', 'battle', 'ancient', 'western', 'eastasia'].includes(g.arch) && r() < 0.55 ? pick(r, CB.SEASONS) : null;
    if (s.season && /snow|blizzard/.test(s.weather.id)) s.season = CB.SEASONS[3];
    const condId = pick(r, g.cond);
    s.cond = Object.assign({ id: condId }, CB.CONDITIONS[condId] || { tr: condId, en: condId });

    const cams = CB.camerasFor(ctx);
    s.camera = pick(r, cams);
    if (cat.q && cat.q.cam && !opts.camera) s.camera = cams.find((c) => c.id === cat.q.cam) || s.camera;
    if (opts.camera) s.camera = CB.CAMERAS.find((c) => c.id === opts.camera) || s.camera;
    s.light = pick(r, s.time.night ? CB.LIGHTS.night : CB.LIGHTS.day);
    if (ctx === 'abstract') s.light = { tr: s.time.tr, en: 'soft volumetric light shaping the forms' };
    if (ctx === 'studio') s.light = { tr: s.time.tr, en: 'controlled studio lighting with soft contact shadows under every object' };

    const A = CB.ARCH[g.arch] || CB.ARCH.modern; // havuz yüklenemezse güvenli geri dönüş
    s.landmarks = { center: pick(r, A.center), left: pick(r, A.left), right: pick(r, A.right), far: pick(r, A.far) };
    s.floor = pick(r, A.floor);
    const m1 = pick(r, A.materials); let m2 = pick(r, A.materials); if (m2 === m1) m2 = A.materials[(A.materials.indexOf(m1) + 1) % A.materials.length];
    s.materials = [m1, m2];
    s.size = ctx === 'int' ? Math.round(rr(r, 14, 90)) : ctx === 'space' || ctx === 'abstract' ? null : ctx === 'studio' ? Math.round(rr(r, 4, 12)) : Math.round(rr(r, 3, 40)) * 50;
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
    if (cat.q && cat.q.pal) { want.clear(); cat.q.pal.forEach((t) => want.add(t)); }
    const cands = CB.PALETTES.filter((p) => p.tags.some((t) => want.has(t)));
    s.palette = pick(r, cands.length ? cands : CB.PALETTES);
    if (opts.palette) s.palette = CB.PALETTES.find((p) => p.id === opts.palette) || s.palette;
    let grades = GRADE_BY_ARCH[g.arch] || ['natural'];
    if (s.time.night && r() < 0.3) grades = ['moonlight', 'neonoir'];
    s.gradeId = pick(r, grades);
    if (cat.q && cat.q.grade && CB.GRADES[cat.q.grade]) s.gradeId = cat.q.grade;
    if (opts.grade && CB.GRADES[opts.grade]) s.gradeId = opts.grade;

    // görsel motor + parametreler
    let engs = enginesFor(cat, ctx).filter((e) => CB.ENGINES[e]);
    if (!engs.length) engs = ctx === 'int' || ctx === 'studio' ? ['godrays'] : ['mountains'];
    s.engine = pick(r, engs);
    if (opts.engine && CB.ENGINES[opts.engine]) s.engine = opts.engine;
    s.params = Array.from({ length: 8 }, () => rr(r, 0.2, 0.85));
    if (HOOKS[s.engine]) HOOKS[s.engine](s.params, s);
    s.params = s.params.map((v) => Math.min(1, Math.max(0, v)));
    s.time0 = rr(r, 0, 120);
    // atmosfer katmanı: havadan ve durumdan türetilir (seed dizisini değiştirmez)
    s.atmos = Object.assign({}, ATMOS[s.weather.id] || s.weather.atmos || {});
    if (/burning|smoldering|erupting|active/.test(condId)) s.atmos.embers = Math.max(s.atmos.embers || 0, 0.5);
    if (cat.q && cat.q.atmos) for (const k in cat.q.atmos) s.atmos[k] = Math.max(s.atmos[k] || 0, cat.q.atmos[k]);
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
    const empty = s.ctx === 'space' ? 'An empty, silent vista.' : s.ctx === 'abstract' ? 'Clean uncluttered background with generous negative space for titles.' : s.ctx === 'studio' ? 'Empty set with a clear, unoccupied product placement area in the centre and generous negative space for copy.' : `Empty deserted ${ctxNoun(s)}, every space unoccupied, still air.`;
    const sizeTxt = s.ctx === 'studio' ? `a studio set about ${s.size} metres wide` : s.size ? `roughly ${s.size} metres across` : s.ctx === 'abstract' ? 'filling the whole frame' : 'vast beyond scale';
    const loc = CB.locText(s.cat);
    const natural = ['nature', 'water', 'sky', 'micro', 'abstract', 'space'].includes(s.group.arch);
    const build = natural ? `with textures of ${s.materials[0]} and ${s.materials[1]}` : `built from ${s.materials[0]} and ${s.materials[1]}`;
    const imp = s.impossible ? ` One impossible detail: ${s.impossible}.` : '';

    // Lira · Higgsfield Soul Cinema mekan şablonu
    const soul = strip(`${cap(s.camera.en)}, ${s.camera.lens} lens, rule of thirds composition. ${cap(loc)}, ${s.cond.en}${season}, ${sizeTxt}, ${build}. ` +
      `${s.camera.rev ? `${cap(L.right)} now stands on the left, ${L.left} on the right` : `${cap(L.left)} rises on the left, ${L.right} stands on the right`}, ${L.center} marks the centre, and ${s.camera.rev ? 'the original camera position' : L.far} closes the far end. The ground is ${s.floor}. ` +
      `${cap(s.time.en)}; ${s.light.en}. ${cap(s.weather.en)}, volumetric haze separating foreground, mid-ground and background.${imp} ` +
      `Refined ${paletteLine(s)}; ${grade.en}. ${s.ctx === 'studio' ? CB.TECH.studio : CB.TECH[s.tech]}. ${s.ctx === 'studio' ? 'Polished advertising campaign look' : s.cine}. ${empty}`);

    // ONE SHOT · W1 lokasyon plakası blokları (GPT Image 2 / Seedream / NBP)
    const oneshot = [
      `CAMERA: ${cap(s.camera.en)}, ${s.camera.lens} lens, grounded composition, rule of thirds.`,
      `SCENE: ${cap(loc)}, ${s.cond.en}${season}, ${sizeTxt}, ${build}.`,
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
    const mj = strip(`cinematic film still, ${s.camera.en.split(',')[0]}, ${loc}, ${s.cond.en}${season}, ${s.weather.en}, ${s.time.en}, ${s.light.en.split(',')[0]}, ${s.palette.w.slice(0, 3).join(', ')}, ${grade.en.split(',')[0]}, ${s.tech === 'film' ? '35mm film grain, anamorphic' : 'clean digital cinema'}, empty location`) +
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
    const video = strip(`10-second cinematic background plate, single continuous shot, ${pick(s.r, moves)}, ${s.camera.lens} lens, rule of thirds. ${cap(loc)}, ${s.cond.en}${season}. ` +
      `Ambient motion only: ${motion}. ${cap(s.time.en)}; ${s.light.en}. ${cap(paletteLine(s))}; ${grade.en}. ${s.ctx === 'studio' ? CB.TECH.studio : CB.TECH[s.tech]}. ${empty}`);

    const negative = CB.NEGATIVE.join(', ');

    // ONE SHOT · W2 ters açı: sol ve sağ yer değiştirir
    const reverse = [
      `Same ${loc}, same layout, same materials. Low wide 24mm shot at chest height from ${L.far}, looking back across the space.`,
      `${cap(L.center)} in the mid-ground, ${L.left} now on the RIGHT, ${L.right} now on the LEFT, the original camera position now behind them.`,
      `The surface is ${s.floor}, dark and readable. ${cap(s.time.en)}; ${s.light.en}. ${cap(s.weather.en)}.`,
      `Same atmosphere, same grade: ${grade.en}, ${paletteLine(s)}. ${s.ctx === 'abstract' ? empty : 'EMPTY of people.'}`,
    ].join('\n');

    // ONE SHOT · W3 lokasyon referans sayfası
    const refsheet = [
      'Create a location reference sheet of ONE place, arranged in two horizontal rows on a single canvas, no text, no borders.',
      'TOP ROW: straight-on frontal view / left angled perspective / right angled perspective / reverse wide view.',
      `BOTTOM ROW: three detail close-ups of ${s.materials[0]}, ${s.materials[1]} and ${s.floor}.`,
      'Match one consistent realistic visual style, lighting quality, colour treatment and texture across all panels.',
      `SCENE: ${cap(loc)}, ${s.cond.en}${season}, ${sizeTxt}, ${build}.`,
      `LANDMARKS: centre ${L.center}; left ${L.left}; right ${L.right}; far end ${L.far}.`,
      `LIGHT: ${cap(s.time.en)}; ${s.light.en}. ${grade.en}, ${paletteLine(s)}.`,
      'LOCKS: the same identical place in every panel — same architecture, materials, weather, time of day and light direction; EMPTY of people; no text, no watermark.',
    ].join('\n');
    // ONE SHOT · W8 referans görselden yeni açı (NBP / GPT Image 2)
    const arrange = s.camera.rev
      ? `In this view ${L.left} is now on the RIGHT, ${L.right} is now on the LEFT, and ${L.center} stays in the middle ground.`
      : `${cap(L.left)} stays on the left, ${L.right} on the right, ${L.center} in the centre, ${L.far} at the far end.`;
    const fromRef = [
      'Using Image 1 as the location reference: PRESERVE EXACTLY the architecture, materials, layout, proportions and landmark positions.',
      `CHANGE ONLY the camera angle: ${s.camera.en}, ${s.camera.lens} lens.`,
      arrange,
      `Same light: ${s.time.en}; ${s.light.en}. Same weather, same grade (${grade.en}), same palette.`,
      s.ctx === 'studio' || s.ctx === 'abstract' ? empty : 'EMPTY of people.',
    ].join('\n');
    return { soul, oneshot: oneshot.join('\n'), mj, video, negative, reverse, refsheet, fromRef };
  };

  CB.specCode = function (s) {
    const b = s.cat.base || s.cat;
    return 'CB-' + String(b.group.index + 1).padStart(2, '0') + String(s.group.cats.indexOf(b) + 1).padStart(2, '0') + (s.cat.letter || '') + '-' + (s.seed >>> 0).toString(36).toUpperCase();
  };
})();
