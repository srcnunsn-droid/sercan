/* CineBG Studio v8 — ön plan / kompozisyon katmanı.
   Her sahneye seed'den (spec rng'sini tüketmeden) bağlama uygun bir ön plan seçilir: yapraklar, pencere, kemer, kayalar…
   s.fg = { type, id, amt, blur, seed, tr, en } · opts.fg: '' otomatik, 'off' kapalı ya da tür kimliği. */
(function () {
  const CB = window.CB;
  // type: shader'daki tür numarası; ctx: uygun bağlamlar
  CB.FOREGROUNDS = [
    { type: 1, id: 'foliage', tr: 'Yapraklı dallar', en: 'dark out-of-focus leafy branches frame the top corners of the frame', ctx: ['ext', 'mixed'] },
    { type: 2, id: 'window', tr: 'Pencere çerçevesi', en: 'seen through a dark window frame with mullions in the soft foreground', ctx: ['int', 'mixed', 'ext'] },
    { type: 3, id: 'arch', tr: 'Taş kemer', en: 'framed through a dark stone archway in the near foreground', ctx: ['ext', 'int', 'mixed'] },
    { type: 4, id: 'rocks', tr: 'Ön plan kayaları', en: 'dark out-of-focus rocks rise along the bottom of the frame', ctx: ['ext', 'mixed', 'water', 'space'] },
    { type: 5, id: 'fence', tr: 'Çit / korkuluk', en: 'a soft-focus railing runs across the lower foreground', ctx: ['ext', 'mixed', 'int'] },
    { type: 6, id: 'curtains', tr: 'Yan perdeler', en: 'heavy curtains hang at both sides of the frame in the soft foreground', ctx: ['int', 'mixed', 'studio'] },
    { type: 7, id: 'grass', tr: 'Uzun otlar', en: 'tall grass blades sway out of focus along the bottom edge', ctx: ['ext', 'mixed'] },
    { type: 8, id: 'cables', tr: 'Havai kablolar', en: 'overhead cables cross the upper part of the frame', ctx: ['ext', 'mixed'] },
    { type: 9, id: 'cave', tr: 'Mağara ağzı', en: 'framed from inside a dark cave mouth looking out', ctx: ['ext', 'mixed', 'water'] },
    { type: 10, id: 'bokeh', tr: 'Yakın bokeh', en: 'large soft bokeh discs of near light float in the foreground', ctx: ['ext', 'int', 'mixed', 'space', 'abstract', 'studio', 'sky', 'water'] },
    { type: 11, id: 'dust', tr: 'Lens tozu', en: 'subtle lens smudges and dust catch the light', ctx: ['ext', 'int', 'mixed', 'space', 'abstract', 'sky', 'water'] },
    { type: 12, id: 'awning', tr: 'Tente saçağı', en: 'the scalloped edge of an awning hangs across the top of the frame', ctx: ['ext', 'mixed'] },
  ];
  CB.FG_BY_ID = Object.fromEntries(CB.FOREGROUNDS.map((f) => [f.id, f]));
  // kamera açısı belirli bir ön planı ister
  const CAM_FG = { frame: 'arch', foliage: 'foliage', fence: 'fence', window: 'window', ruinframe: 'arch', threshold: 'arch', underbridge: 'cables', carwin: 'window' };
  // bağlam ve metin uyumu: doğal yerlere kablo/tente yok, şehre mağara yok
  const NATURE = /forest|jungle|mountain|valley|meadow|field|desert|dune|canyon|lake|river|waterfall|glacier|beach|coast|island|savanna|steppe|tundra|cave|reef|grove/i;
  const URBAN = /street|alley|city|town|market|avenue|square|station|harbou?r|rooftop|shop|cafe|café/i;
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return h >>> 0; }

  function choose(s, opts) {
    const want = opts.fg;
    if (want === 'off') return null;
    const text = (s.cat.base || s.cat).en;
    const h = hash(s.cat.id + '|' + s.seed + '|fg');
    let f = want && CB.FG_BY_ID[want] ? CB.FG_BY_ID[want] : null;
    if (!f && s.camera && CAM_FG[s.camera.id]) f = CB.FG_BY_ID[CAM_FG[s.camera.id]];
    if (!f) {
      if ((h % 100) >= 55) return null; // ~%55 sahnede katman
      const ctx = s.ctx;
      let pool = CB.FOREGROUNDS.filter((x) => x.ctx.includes(ctx));
      if (NATURE.test(text)) pool = pool.filter((x) => !['cables', 'awning', 'curtains', 'window'].includes(x.id));
      if (URBAN.test(text)) pool = pool.filter((x) => !['cave', 'grass'].includes(x.id));
      if (ctx === 'int') pool = pool.filter((x) => !['foliage', 'grass', 'cables', 'cave', 'awning', 'rocks'].includes(x.id));
      if (!pool.length) return null;
      f = pool[(h >>> 8) % pool.length];
    }
    const r = (k) => ((hash(h + ':' + k) % 1000) / 1000);
    return { type: f.type, id: f.id, tr: f.tr, en: f.en, amt: 0.75 + r('a') * 0.25, blur: 0.25 + r('b') * 0.6, seed: Math.round(r('s') * 997) / 10 };
  }

  const make = CB.makeSpec;
  CB.makeSpec = function (cat, seed, opts = {}) {
    const s = make(cat, seed, opts);
    s.fg = choose(s, opts);
    return s;
  };
})();
