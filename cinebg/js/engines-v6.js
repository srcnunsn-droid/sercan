/* CineBG Studio v6 — gündelik hayat motorlarının bağlanması: sokak, kırsal ve ev / iş yeri iç mekânı.
   Aynı konumda eşleşen kurallar birleşir; "street" mevcut şehir motorlarına ek olarak street3d de verir. */
(function () {
  const CB = window.CB;
  const KEYS = (CB.ENGINE_KEYS = CB.ENGINE_KEYS || []);
  const INT_OK = (CB.INT_OK = CB.INT_OK || []);
  const INT_ONLY = (CB.INT_ONLY = CB.INT_ONLY || []);
  const HOOKS = (CB.ENGINE_HOOKS = CB.ENGINE_HOOKS || {});
  const rr = (s, a, b) => a + (b - a) * s.r();
  const sun = (s) => (s.time && typeof s.time.sun === 'number' ? s.time.sun : 0.5);
  const wx = (s) => (s.weather ? s.weather.id : '');

  KEYS.push(
    [/\bstreets?\b|\balley|\blane\b|crosswalk|sidewalk|bus stop|\broads?\b|avenue|boulevard|high street|main street|shopping street|market street|intersection|tram stop|taxi rank/i, ['street3d']],
    [/\bfields?\b(?! hospital)|\bfarm|countryside|vineyard|pasture|\bhills?\b|orchard|prairie|rice terrace|wheat|barley|hayfield|cornfield|lavender|tea plantation|\brural\b|\branch\b|sunflower|olive grove|rolling/i, ['countryside']],
    [/kitchen|living room|bedroom|bathroom|\bapartment|\bflat\b|\bdorm|classroom|\boffice\b|waiting room|laundromat|\bcaf[eé]\b|shop interior|\bsalon\b|clinic|hotel room|\bdiner\b|bakery|pharmacy|corner shop|break room|nursery|reading room|teahouse|barber|\bstudio flat|dining room|home office/i, ['homeint']],
  );
  INT_OK.push('homeint');
  INT_ONLY.push('homeint');

  Object.assign(HOOKS, {
    street3d: (p, s) => {
      const n = s.time && s.time.night;
      p[3] = n ? rr(s, 0.8, 1) : Math.min(0.6, Math.max(0, 0.25 - sun(s) * 0.4 + (/bluehour|sunset|twilight|dusk/.test(s.time ? s.time.id : '') ? 0.35 : 0)));
      p[4] = /rain|drizzle|storm|afterrain|monsoon/.test(wx(s)) ? rr(s, 0.6, 1) : p[4] * 0.25;
      p[2] = n ? rr(s, 0.6, 1) : p[2] * 0.6;
      p[6] = /fog|mist|smoke|dust|sandstorm/.test(wx(s)) ? rr(s, 0.6, 0.9) : p[6] * 0.5;
      p[7] = p[7] * 0.5;
    },
    countryside: (p, s) => {
      const t = s.cat.en;
      p[6] = Math.max(0.04, sun(s) * 0.9);
      p[2] = /wheat|barley|hay|harvest|autumn|golden|prairie|sunflower|corn/i.test(t + ' ' + (s.season ? s.season.en : '')) ? rr(s, 0.6, 1) : p[2] * 0.5;
      p[7] = /overcast|storm|rain|drizzle|lowcloud/.test(wx(s) + ' ' + (s.time ? s.time.id : '')) ? rr(s, 0.7, 1) : p[7];
      p[4] = /road|path|lane|track|trail/i.test(t) ? rr(s, 0.7, 1) : p[4] * 0.7;
      p[5] = /farm|ranch|village|barn|homestead/i.test(t) ? rr(s, 0.6, 1) : p[5] * 0.6;
    },
    homeint: (p, s) => {
      const n = s.time && s.time.night;
      p[1] = n ? rr(s, 0.8, 1) : rr(s, 0, 0.15);
      p[3] = n ? rr(s, 0.7, 1) : p[3] * 0.5;
      p[4] = n ? 0 : /morning|golden|afternoon|window/i.test(s.time ? s.time.id + s.time.en : '') ? rr(s, 0.5, 0.9) : p[4] * 0.6;
    },
  });

  const add = (eng, ids) => ids.forEach((id) => { const g = CB.GROUPS.find((x) => x.id === id); if (g && !g.engines.includes(eng)) g.engines.push(eng); });
  add('street3d', ['urban', 'modern-city', 'noir', 'crime', 'nightlife', 'latam', 'southasia', 'eastasia', 'anatolia', 'villages']);
  add('countryside', ['villages', 'plains', 'roads', 'parks', 'western', 'medievallife', 'anatolia', 'latam', 'africa']);
  add('homeint', ['residential', 'modern-home', 'modern-work', 'modern-retail', 'modern-leisure', 'public']);
})();
