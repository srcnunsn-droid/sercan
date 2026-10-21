/* CineBG Studio v5 — yeni motorların bağlanması: anahtar kelimeler, bağlam izinleri, parametre kancaları, gruplar.
   spec.js, CB.ENGINE_KEYS / CB.INT_OK / CB.INT_ONLY / CB.ENGINE_HOOKS dizilerini aynı nesne üzerinden kullanır. */
(function () {
  const CB = window.CB;
  const KEYS = (CB.ENGINE_KEYS = CB.ENGINE_KEYS || []);
  const INT_OK = (CB.INT_OK = CB.INT_OK || []);
  const INT_ONLY = (CB.INT_ONLY = CB.INT_ONLY || []);
  const HOOKS = (CB.ENGINE_HOOKS = CB.ENGINE_HOOKS || {});
  const rr = (s, a, b) => a + (b - a) * s.r();
  const sun = (s) => (s.time && typeof s.time.sun === 'number' ? s.time.sun : 0.5);

  /* Aynı konumda eşleşen kurallar birleşir: "mountain" hem mountains hem terrain3d verir */
  KEYS.push(
    [/mountain|peak|summit|ridge|alpine|himalaya|highland|plateau|valley|fjord|massif/i, ['terrain3d']],
    [/skyscraper|downtown|metropolis|avenue|megacity|financial district|high-rise|city block|boulevard/i, ['metro3d']],
    [/colonnade|acropolis|\bforum\b|\bagora\b|parthenon|temple ruins|ancient ruins|ruined temple|roman ruins|greek ruins|peristyle|portico/i, ['ruins']],
    [/crystal|geode|ice cave|glacier cave|amethyst|quartz|gem mine|salt cave/i, ['crystal']],
    [/\bhall\b|cathedral|\bnave\b|ballroom|gallery|museum|library|cloister|throne room|basilica|atrium|monastery|church/i, ['room3d']],
    [/collage|\bpaper\b|scrapbook|cut-out|cutout|\bzine\b|storybook|pop-up book|origami|papercraft/i, ['collage']],
    [/archive|archival|newspaper|editorial|vintage print|documentary|newsreel|propaganda poster|old photograph/i, ['archival']],
  );
  INT_OK.push('room3d', 'crystal', 'collage', 'archival');
  INT_ONLY.push('room3d');

  Object.assign(HOOKS, {
    terrain3d: (p, s) => {
      const t = s.cat.en + ' ' + (s.weather ? s.weather.id : '');
      p[7] = Math.max(0.03, sun(s) * 0.85);
      p[5] = /lake|river|fjord|coast|\bsea\b|lagoon|\bbay\b|flood|delta/i.test(s.cat.en) ? rr(s, 0.35, 0.6) : s.r() < 0.6 ? 0 : p[5] * 0.6;
      p[3] = /snow|winter|glacier|polar|alpine|himalaya|frozen|blizzard/i.test(t) ? rr(s, 0.65, 0.95) : p[3] * 0.6;
      p[4] = /fog|mist|haze/i.test(t) ? rr(s, 0.6, 1) : p[4] * 0.6;
    },
    metro3d: (p, s) => {
      p[3] = s.time && s.time.night ? rr(s, 0.75, 1) : Math.min(1, Math.max(0.05, 1 - sun(s) * 1.1));
      p[5] = /rain|drizzle|storm/i.test(s.weather ? s.weather.id : '') ? rr(s, 0.65, 1) : p[5] * 0.4;
      p[6] *= 0.6;
    },
    room3d: (p, s) => { p[3] = s.time && s.time.night ? rr(s, 0.05, 0.25) : rr(s, 0.5, 1); },
    ruins: (p, s) => { p[2] = 0.02 + sun(s) * 0.5; },
    crystal: (p, s) => {
      if (/ice|glacier|frozen|polar|snow/i.test(s.cat.en)) p[6] = rr(s, 0, 0.2);
      if (s.ctx === 'int') p[5] *= 0.4;
    },
  });

  const ADD = {
    terrain3d: ['mountains', 'plains', 'polar', 'rivers', 'parks', 'fantasy', 'norse', 'roads', 'villages', 'western', 'africa', 'myth', 'eastasia', 'sky'],
    metro3d: ['urban', 'cyber', 'modern-city', 'dystopia', 'noir', 'crime', 'dieselpunk', 'nightlife'],
    ruins: ['greco', 'egypt', 'myth'],
    crystal: ['caves', 'fantasy', 'alien', 'ad-luxury', 'ad-surreal'],
    room3d: ['palace', 'sacred', 'academy', 'residential', 'public', 'horror', 'darkfantasy', 'medievallife', 'modern-work', 'filmset', 'anatolia', 'greco', 'egypt'],
    collage: ['abstract', 'filmset', 'fairytale', 'ad-surreal', 'ad-nature', 'ad-food'],
    archival: ['abstract', 'filmset'],
  };
  Object.entries(ADD).forEach(([eng, ids]) => {
    if (!CB.ENGINES || !CB.ENGINES[eng]) return;
    ids.forEach((id) => {
      const g = (CB.GROUPS || []).find((x) => x.id === id);
      if (g && !g.engines.includes(eng)) g.engines.push(eng);
    });
  });
})();
