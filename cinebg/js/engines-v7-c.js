/* CineBG Studio v7 — stilize motorların bağlantıları: anahtar kelimeler, iç mekân izinleri, kancalar, gruplar ve 10'ar görünüm. */
(function () {
  const CB = window.CB;
  CB.ENGINE_KEYS.push(
    [/vaporwave|retrowave|outrun/i, ['vaporwave']],
    [/\by2k\b|liquid[- ]metal|iridescent|holographic/i, ['y2k']],
    [/floating island|sky island|airship|zeppelin|sky city|cloud city|flying city|sky kingdom/i, ['skyship']],
    [/atlantis|sunken city|sunken temple|underwater city|underwater ruins|drowned city/i, ['atlantis']],
    [/mecha|giant robot|\bmech\b|robot hangar|mech bay|robot factory/i, ['mecha']],
    [/dream|surreal|liminal|limbo|subconscious|floating stairs/i, ['dreamscape']],
    [/wuxia|ink[- ]wash|ink painting|shan shui|guilin|huangshan|zhangjiajie|misty peaks|chinese painting|jianghu/i, ['wuxia']],
    [/eclipse|comet|meteor shower|conjunction|celestial|milky way|starry sky|stargazing/i, ['eclipse']],
  );
  CB.INT_OK.push('mecha', 'y2k', 'vaporwave', 'dreamscape');

  const rnd = (s, a, b) => a + (b - a) * s.r();
  const txt = (s) => ((s.cat.base || s.cat).en + ' ' + (s.cat.q ? s.cat.q.en : '')).toLowerCase();
  Object.assign(CB.ENGINE_HOOKS, {
    eclipse: (p, s) => {
      const t = txt(s);
      if (/eclipse/.test(t)) p[0] = rnd(s, 0.02, 0.3); else if (/comet|meteor/.test(t)) p[0] = rnd(s, 0.4, 0.62); else if (/conjunction|planet|moon/.test(t)) p[0] = rnd(s, 0.72, 0.98);
      if (s.time.night) p[3] = Math.max(p[3], 0.6);
    },
    skyship: (p, s) => { p[6] = Math.min(1, s.time.sun * 0.9 + 0.05); if (/fog|mist/.test(s.weather.id)) p[7] = rnd(s, 0.7, 1); },
    atlantis: (p, s) => { p[3] = s.time.night ? rnd(s, 0.05, 0.3) : rnd(s, 0.5, 1); if (s.time.night) p[6] = Math.max(p[6], 0.6); },
    wuxia: (p, s) => { if (/fog|mist|rain|drizzle/.test(s.weather.id)) p[2] = rnd(s, 0.7, 1); },
    mecha: (p, s) => { if (s.time.night) { p[3] = rnd(s, 0.6, 1); p[5] = rnd(s, 0.6, 1); } },
    vaporwave: (p, s) => { if (/sunset|golden|dusk|bluehour/.test(s.time.id)) p[1] = Math.max(p[1], 0.55); },
  });

  const ADD = {
    vaporwave: ['abstract', 'cyber', 'nightlife', 'ad-surreal'],
    y2k: ['abstract', 'ad-tech', 'ad-surreal', 'ad-luxury'],
    skyship: ['fantasy', 'steampunk', 'sky', 'fairytale', 'solarpunk'],
    atlantis: ['underwater', 'myth', 'fantasy'],
    mecha: ['military', 'starship', 'lab', 'battle-future', 'cyber'],
    dreamscape: ['abstract', 'ad-surreal', 'fairytale', 'fantasy'],
    wuxia: ['eastasia', 'myth', 'mountains'],
    eclipse: ['space', 'sky', 'desert', 'polar'],
  };
  for (const id in ADD) ADD[id].forEach((gid) => {
    const g = CB.GROUPS.find((x) => x.id === gid);
    if (g && g.engines && !g.engines.includes(id)) g.engines.push(id);
  });

  const P = (rows) => rows.map(([tr, p]) => ({ tr, p }));
  Object.assign(CB.ENGINE_PRESETS, {
    vaporwave: P([
      ['Klasik outrun', [0.5, 0.6, 0.6, 0.5, 0.7, 0.6, 0.4, 0.4]], ['Dev güneş', [0.35, 1, 0.8, 0.4, 0.3, 0.2, 0.5, 0.3]],
      ['Yüksek ufuk ızgara', [0.95, 0.4, 0.5, 0.9, 0.2, 0, 0.3, 0.6]], ['Alçak ufuk gökyüzü', [0.05, 0.7, 0.3, 0.3, 0.6, 0.8, 0.6, 0.2]],
      ['Antik heykel bahçesi', [0.45, 0.5, 0.2, 0.4, 1, 0, 0.5, 0.2]], ['Palmiye sahili', [0.4, 0.65, 0.7, 0.3, 0, 1, 0.6, 0.3]],
      ['Bantsız güneş', [0.5, 0.55, 0, 0.6, 0.5, 0.5, 0.3, 0.4]], ['Puslu rüya', [0.55, 0.45, 0.5, 0.5, 0.4, 0.4, 1, 0.2]],
      ['Hızlı akış', [0.6, 0.5, 0.9, 0.8, 0.3, 0.3, 0.2, 1]], ['Minimal ızgara', [0.6, 0.3, 0.4, 0.6, 0, 0, 0.1, 0.5]],
    ]),
    y2k: P([
      ['Tek krom damla', [0, 1, 0, 0.2, 0, 0.6, 0.3, 0.3]], ['Yanardöner küme', [0.8, 0.5, 1, 0.5, 0, 0.5, 0.5, 0.4]],
      ['Baloncuk yağmuru', [0.3, 0.4, 0.6, 1, 0.2, 0.3, 0.6, 0.6]], ['Siber ızgara', [0.5, 0.5, 0.4, 0.3, 1, 0.4, 0.2, 0.5]],
      ['Sıvı metal akışı', [1, 0.7, 0.1, 0, 0.3, 0.8, 0.4, 1]], ['Pastel krom', [0.4, 0.6, 0.7, 0.4, 0, 0.3, 1, 0.2]],
      ['Mini bloblar', [1, 0.1, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6]], ['Parlak stüdyo', [0.3, 0.8, 0.3, 0.1, 0, 1, 0.7, 0.2]],
      ['Gece kulübü kromu', [0.6, 0.6, 0.9, 0.3, 0.8, 0.9, 0, 0.7]], ['Sakin sabun köpüğü', [0.1, 0.3, 1, 0.8, 0, 0.2, 0.8, 0.1]],
    ]),
    skyship: P([
      ['Takımada', [1, 0.4, 0.5, 0.3, 0.6, 0.5, 0.5, 0.5]], ['Dev tek ada', [0, 1, 0.8, 0.2, 0.5, 0.3, 0.6, 0.4]],
      ['Hava filosu', [0.4, 0.4, 0.2, 1, 0.5, 0.7, 0.4, 0.5]], ['Şelaleler diyarı', [0.6, 0.6, 1, 0.1, 0.7, 0.4, 0.6, 0.6]],
      ['Gün batımı geçidi', [0.5, 0.5, 0.4, 0.6, 0.8, 0.85, 0.05, 0.5]], ['Sisli şafak', [0.6, 0.5, 0.4, 0.3, 0.9, 0.2, 0.15, 1]],
      ['Yüksek bulut denizi', [0.5, 0.5, 0.3, 0.4, 1, 0.5, 0.7, 0.3]], ['Öğle berraklığı', [0.7, 0.5, 0.6, 0.5, 0.2, 0.5, 1, 0]],
      ['Uzak ufuk', [1, 0.1, 0.3, 0.2, 0.4, 0.6, 0.5, 0.8]], ['Korsan gemileri', [0.4, 0.6, 0.2, 0.9, 0.6, 0.15, 0.35, 0.4]],
    ]),
    atlantis: P([
      ['Kubbeler şehri', [0.6, 1, 0.3, 0.6, 0.3, 0.5, 0.4, 0.3]], ['Sütunlu tapınak', [0.3, 0.2, 1, 0.7, 0.2, 0.4, 0.2, 0.3]],
      ['Işıklı metropol', [1, 0.5, 0.5, 0.4, 0.4, 0.6, 1, 0.4]], ['Derin karanlık', [0.5, 0.5, 0.5, 0.1, 0.2, 1, 0.6, 0.2]],
      ['Huzmeler altında', [0.4, 0.6, 0.6, 1, 0.3, 0.3, 0.2, 0.5]], ['Kabarcık akıntısı', [0.6, 0.4, 0.4, 0.6, 1, 0.5, 0.3, 1]],
      ['Harabe sığlıkları', [0.2, 0.3, 0.8, 0.8, 0.2, 0.1, 0, 0.3]], ['Sisli siluet', [0.8, 0.6, 0.4, 0.3, 0.3, 0.9, 0.2, 0.2]],
      ['Kristal berraklık', [0.7, 0.7, 0.7, 0.7, 0.1, 0, 0.3, 0.3]], ['Gece pencereleri', [0.9, 0.4, 0.3, 0.2, 0.4, 0.7, 0.9, 0.3]],
    ]),
    mecha: P([
      ['Tek dev', [1, 0, 0.4, 0.6, 0.3, 0.9, 0.5, 0.5]], ['Robot sırası', [0.4, 1, 0.6, 0.7, 0.3, 0.6, 0.5, 0.6]],
      ['İkili bakım', [0.6, 0.5, 1, 0.8, 0.5, 0.5, 0.4, 0.4]], ['Buhar ve karanlık', [0.7, 0, 0.3, 0.2, 1, 1, 0.3, 0.3]],
      ['Tam aydınlık', [0.6, 0.6, 0.5, 1, 0.1, 0.3, 0.8, 0.8]], ['Islak zemin', [0.5, 0.5, 0.4, 0.6, 0.4, 0.6, 0.5, 1]],
      ['İskelesiz hangar', [0.8, 0.5, 0, 0.5, 0.2, 0.7, 0.9, 0.5]], ['Uyuyan devler', [0.6, 1, 0.5, 0.3, 0.6, 0, 0.6, 0.4]],
      ['Kırmızı alarm', [0.7, 0.5, 0.6, 0.4, 0.7, 1, 0.2, 0.7]], ['Panel duvar, yakın', [0.9, 0, 0.8, 0.5, 0.3, 0.5, 1, 0.2]],
    ]),
    dreamscape: P([
      ['Ayna çölü', [0.5, 0, 0.3, 0.2, 0.3, 1, 0.6, 0.2]], ['Kapılar koridoru', [0.4, 0, 1, 0, 0.2, 0.8, 0.8, 0.3]],
      ['Süzülen merdivenler', [0.6, 1, 0.2, 0.3, 0.5, 0.6, 0.5, 0.8]], ['Küreler senfonisi', [0.5, 0, 0, 1, 0.3, 0.7, 0.7, 0.6]],
      ['Bulut ülkesi', [0.2, 0.3, 0.2, 0.3, 1, 0.5, 0.6, 0.5]], ['Yüksek ufuk', [1, 0.6, 0.6, 0.6, 0.4, 0.4, 0.4, 0.4]],
      ['Alçak ufuk, geniş gök', [0, 0.5, 0.3, 0.5, 0.8, 0.6, 0.5, 0.4]], ['Gece rüyası', [0.5, 0.4, 0.6, 0.4, 0.3, 0.9, 1, 0.3]],
      ['Sade minimal', [0.5, 0.1, 0.3, 0.1, 0, 0.9, 0.2, 0.1]], ['Her şey bir arada', [0.5, 1, 1, 1, 1, 0.7, 0.8, 0.7]],
    ]),
    wuxia: P([
      ['Huangshan iğneleri', [0.8, 1, 0.6, 0.2, 0.7, 0.6, 0.5, 0.2]], ['Yumuşak tepeler', [0.6, 0, 0.5, 0.4, 0.3, 0.4, 0.6, 0.3]],
      ['Yoğun sis', [0.9, 0.6, 1, 0.6, 0.2, 0.3, 0.5, 0.1]], ['Köşk zirvesi', [0.5, 0.7, 0.5, 1, 0.4, 0.6, 0.4, 0.4]],
      ['Çam ön planı', [0.5, 0.5, 0.4, 0.3, 1, 0.7, 0.5, 0.2]], ['Koyu mürekkep', [0.7, 0.6, 0.3, 0.5, 0.6, 1, 0.3, 0.3]],
      ['Soluk eskiz', [0.4, 0.4, 0.7, 0.2, 0.2, 0.1, 1, 0.1]], ['Kuş sürüsü', [0.6, 0.5, 0.5, 0.4, 0.3, 0.5, 0.5, 1]],
      ['Tek katman', [0, 0.8, 0.3, 0.5, 0.6, 0.8, 0.6, 0.3]], ['Uzak ufuk', [1, 0.3, 0.8, 0, 0, 0.4, 0.7, 0.5]],
    ]),
    eclipse: P([
      ['Tam tutulma', [0.1, 0.6, 0.7, 0.5, 0.9, 0.3, 0.5, 0.2]], ['Elmas yüzük', [0.2, 0.9, 0.3, 0.4, 0.6, 0.4, 0.3, 0.1]],
      ['Büyük kuyrukluyıldız', [0.5, 0.5, 1, 0.7, 0.3, 0.3, 0.3, 0.4]], ['Ufukta kuyrukluyıldız', [0.55, 0.3, 0.6, 0.5, 0.7, 0.6, 0.8, 0.2]],
      ['Hilal ve gezegenler', [0.85, 0.5, 0.3, 0.6, 0.5, 0.4, 0.6, 0.3]], ['Samanyolu kavuşumu', [0.9, 0.3, 0.3, 1, 0.2, 0.2, 0.4, 1]],
      ['Dağ ardında tutulma', [0.15, 0.4, 0.6, 0.3, 1, 1, 0.5, 0]], ['Yıldız tarlasında kuyrukluyıldız', [0.6, 0.4, 0.7, 1, 0.1, 0.1, 0.2, 0.8]],
      ['Dev hilal', [0.8, 1, 0.2, 0.4, 0.4, 0.5, 0.5, 0.2]], ['Alacakaranlık tutulması', [0.05, 0.5, 0.9, 0.2, 0.8, 0.6, 0.7, 0.1]],
    ]),
  });
})();
