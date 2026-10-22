/* CineBG Studio v7-b — kütüphane, koridor, havuz, pazar, çatı, liman, istasyon ve stadyum motorlarının bağlanması:
   anahtar kelimeler, iç / dış mekân kuralları, parametre kancaları, gruplar ve her motora 10 görünüm (ön ayar). */
(function () {
  const CB = window.CB;
  const KEYS = (CB.ENGINE_KEYS = CB.ENGINE_KEYS || []);
  const INT_OK = (CB.INT_OK = CB.INT_OK || []);
  const INT_ONLY = (CB.INT_ONLY = CB.INT_ONLY || []);
  const HOOKS = (CB.ENGINE_HOOKS = CB.ENGINE_HOOKS || {});
  const PRESETS = (CB.ENGINE_PRESETS = CB.ENGINE_PRESETS || {});
  const rr = (s, a, b) => a + (b - a) * s.r();
  const wx = (s) => (s.weather ? s.weather.id : '');
  const night = (s) => !!(s.time && s.time.night);
  const tid = (s) => (s.time ? s.time.id + ' ' + s.time.en : '');
  const txt = (s) => s.cat.en + ' ' + (s.cat.base ? s.cat.base.en : '');

  KEYS.push(
    [/\blibrar(?:y|ies)\b|bookshop|book ?store|bookstacks|\bstacks\b|scriptorium|archive hall|reading room/i, ['library3d']],
    [/corridor|hallway|backrooms|liminal|hotel floor|motel walkway|endless hall/i, ['corridor']],
    [/(?<!tide |rock |tidal )\bpools?\b|swimming|\blido\b|natatorium|aquatic cent/i, ['pool']],
    [/night market|\bmarkets?\b|bazaar|\bsouk|street food|hawker|flea market|food court|\bstalls?\b/i, ['market']],
    [/rooftop|roof terrace|water tower|water tanks?|tar roof|over the roofs/i, ['rooftop']],
    [/harbou?r|(?<!air|space |sea|star)\bport\b|\bdocks?\b|\bquay|wharf|marina|shipyard|container (?:yard|terminal|port)/i, ['harbor']],
    [/(?<!space |research |gas |petrol |fire |police |weather |power |pumping |polar |radio |relay |orbital |way)\bstation\b|railway|\btrains?\b|\bplatforms?\b(?! game)/i, ['station']],
    [/stadium|football|soccer|ballpark|bleachers|grandstand|velodrome|athletics|sports ground|floodlit pitch|\bpitch\b(?! black| dark)/i, ['stadium']],
  );
  INT_OK.push('library3d', 'corridor', 'pool', 'station', 'market', 'stadium');
  INT_ONLY.push('library3d', 'corridor');

  Object.assign(HOOKS, {
    library3d: (p, s) => {
      p[5] = night(s) ? rr(s, 0.75, 1) : rr(s, 0, 0.2);
      p[3] = night(s) ? rr(s, 0.7, 1) : p[3] * 0.6;
      p[4] = night(s) ? 0 : /morning|golden|afternoon|window|dawn/i.test(tid(s)) ? rr(s, 0.6, 1) : p[4];
      if (/archive|stacks|narrow|secret/i.test(txt(s))) p[6] = rr(s, 0, 0.3);
      if (/grand|cathedral|great|royal|national/i.test(txt(s))) { p[0] = rr(s, 0.75, 1); p[2] = rr(s, 0.6, 1); }
    },
    corridor: (p, s) => {
      const t = txt(s);
      p[6] = /backrooms|liminal|office|mono-yellow|yellow/i.test(t) ? rr(s, 0.75, 1) : /hotel|motel|apartment|mansion/i.test(t) ? rr(s, 0, 0.3) : p[6];
      p[5] = /hotel|motel|mansion|apartment|casino/i.test(t) ? rr(s, 0.6, 1) : /hospital|school|office|lab|prison/i.test(t) ? rr(s, 0, 0.2) : p[5];
      p[4] = /abandoned|horror|haunted|asylum|eerie|derelict/i.test(t + ' ' + (s.cond ? s.cond.id : '')) ? rr(s, 0.6, 1) : p[4] * 0.5;
      p[7] = /fog|smoke|steam/.test(wx(s)) ? rr(s, 0.6, 1) : p[7];
    },
    pool: (p, s) => {
      const t = txt(s);
      p[0] = /indoor|natatorium|bathhouse|hammam|hotel spa|spa\b|gym/i.test(t) ? rr(s, 0, 0.4) : /outdoor|lido|rooftop|villa|resort|beach|motel|garden/i.test(t) ? rr(s, 0.6, 1) : p[0];
      p[1] = /empty|abandoned|drained|derelict/i.test(t + ' ' + (s.cond ? s.cond.id : '')) ? rr(s, 0, 0.1) : p[1] < 0.15 ? rr(s, 0.5, 0.95) : p[1];
      p[5] = night(s) ? rr(s, 0.75, 1) : rr(s, 0, 0.15);
    },
    market: (p, s) => {
      p[4] = night(s) ? rr(s, 0.8, 1) : /bluehour|sunset|twilight|dusk/.test(tid(s)) ? rr(s, 0.45, 0.65) : rr(s, 0, 0.15);
      p[5] = /rain|drizzle|storm|afterrain|monsoon/.test(wx(s)) ? rr(s, 0.6, 1) : p[5] * 0.3;
      p[3] = /food|grill|kebab|noodle|dumpling|hawker|steam|soup/i.test(txt(s)) ? rr(s, 0.6, 1) : p[3] * 0.6;
      p[1] = night(s) ? rr(s, 0.6, 1) : p[1] * 0.5;
    },
    rooftop: (p, s) => {
      p[5] = night(s) ? rr(s, 0.75, 1) : /bluehour|twilight|dusk/.test(tid(s)) ? rr(s, 0.5, 0.7) : rr(s, 0, 0.15);
      p[6] = /fog|mist|smoke|dust|haze|sandstorm/.test(wx(s)) ? rr(s, 0.6, 1) : p[6] * 0.6;
      if (/new york|brooklyn|manhattan|water tower/i.test(txt(s))) p[1] = rr(s, 0.8, 1);
    },
    harbor: (p, s) => {
      const t = txt(s);
      p[4] = night(s) ? rr(s, 0.75, 1) : rr(s, 0, 0.12);
      p[5] = /fog|mist/.test(wx(s)) ? rr(s, 0.7, 1) : p[5] * 0.6;
      p[3] = /storm|wind|rain|blizzard/.test(wx(s)) ? rr(s, 0.6, 1) : p[3] * 0.6;
      if (/fishing|marina|village|yacht|small/i.test(t)) { p[0] = rr(s, 0, 0.15); p[1] = rr(s, 0, 0.15); p[2] = rr(s, 0.7, 1); }
      if (/container|cargo|shipyard|industrial|freight/i.test(t)) { p[0] = rr(s, 0.75, 1); p[1] = rr(s, 0.7, 1); }
    },
    station: (p, s) => {
      const t = txt(s);
      p[4] = night(s) ? rr(s, 0.75, 1) : rr(s, 0, 0.15);
      p[5] = /rain|drizzle|storm|afterrain|monsoon/.test(wx(s)) ? rr(s, 0.6, 1) : p[5] * 0.3;
      p[6] = /fog|mist|smoke|steam/.test(wx(s)) ? rr(s, 0.6, 1) : p[6] * 0.6;
      p[0] = /grand|terminal|central|victorian|hall|termini|gare/i.test(t) ? rr(s, 0.7, 1) : /rural|country|village|small|halt|desert|frontier/i.test(t) ? rr(s, 0, 0.3) : p[0];
    },
    stadium: (p, s) => {
      p[4] = night(s) ? rr(s, 0.75, 1) : /bluehour|twilight|dusk/.test(tid(s)) ? rr(s, 0.5, 0.7) : rr(s, 0, 0.12);
      p[3] = night(s) ? rr(s, 0.8, 1) : p[3] * 0.5;
      if (/abandoned|derelict|ruined/i.test(txt(s) + ' ' + (s.cond ? s.cond.id : ''))) { p[2] = rr(s, 0, 0.2); p[5] = 0; }
    },
  });

  const add = (eng, ids) => ids.forEach((id) => { const g = CB.GROUPS.find((x) => x.id === id); if (g && g.engines && !g.engines.includes(eng)) g.engines.push(eng); });
  add('library3d', ['academy', 'public', 'palace', 'darkfantasy', 'steampunk']);
  add('corridor', ['horror', 'prison', 'public', 'residential', 'modern-work', 'lab', 'dystopia', 'crime']);
  add('pool', []); // QA: havuz yalnızca anahtar kelimeyle (gruplarda rastgele seçilince alakasız mekânlara düşüyordu)
  add('market', ['southasia', 'eastasia', 'anatolia', 'latam', 'nightlife', 'urban', 'cyber', 'africa', 'modern-city']);
  add('rooftop', ['urban', 'noir', 'crime', 'modern-city', 'cyber', 'dystopia', 'nightlife']);
  add('harbor', ['coast', 'transport']);
  add('station', ['transport']);
  add('stadium', ['arena', 'modern-leisure']);

  const P = (tr, p) => ({ tr, p });
  Object.assign(PRESETS, {
    library3d: [
      P('Katedral kütüphane', [1, 0.6, 1, 0.3, 0.9, 0, 0.9, 0.3]),
      P('Dar arşiv koridoru', [0.3, 0.9, 0, 0.2, 0.3, 0.1, 0.05, 0.1]),
      P('Gece okuma salonu', [0.6, 0.5, 0.7, 1, 0, 1, 0.6, 0.2]),
      P('Sabah huzmeleri', [0.8, 0.6, 0.8, 0.1, 1, 0, 0.5, 0.15]),
      P('Galeriden bakış', [0.9, 0.6, 1, 0.5, 0.6, 0.2, 0.7, 0.9]),
      P('Gizli büyü kitaplığı', [0.7, 1, 0.5, 0.8, 0.4, 0.85, 0.3, 0.3]),
      P('Üniversite çalışma salonu', [0.5, 0.4, 0, 0.9, 0.2, 0.4, 1, 0.4]),
      P('Tozlu, terk edilmiş', [0.75, 0.7, 0.6, 0, 0.7, 0.05, 0.4, 0.2]),
      P('Alacakaranlık', [0.6, 0.5, 0.4, 0.7, 0.5, 0.6, 0.5, 0.35]),
      P('Kule arşivi', [1, 0.9, 1, 0.5, 0.4, 0.3, 0.15, 0.6]),
    ],
    corridor: [
      P('Backrooms sarısı', [0.6, 0.2, 0.15, 0.8, 0.25, 0, 1, 0.4]),
      P('Otel koridoru', [0.4, 0.4, 0.7, 0.6, 0, 1, 0.1, 0.2]),
      P('Sönen lambalar', [0.3, 0.3, 0.6, 0.5, 1, 0.6, 0.3, 0.6]),
      P('Hastane koridoru', [0.9, 0.5, 0.4, 1, 0.1, 0, 0.2, 0.3]),
      P('Geniş ofis koridoru', [1, 0.7, 0.2, 0.9, 0, 0.2, 0.6, 0.25]),
      P('Motel gecesi', [0.35, 0.1, 0.8, 0.35, 0.5, 0.8, 0, 0.8]),
      P('Sonsuz boşluk', [0.5, 0.6, 0, 0.7, 0.3, 0.1, 0.8, 1]),
      P('Yurt koridoru', [0.25, 0.25, 1, 0.55, 0.2, 0.4, 0.4, 0.3]),
      P('Lüks otel', [0.7, 1, 0.5, 0.75, 0, 1, 0.15, 0.15]),
      P('Karanlık bodrum', [0.3, 0, 0.3, 0.2, 0.8, 0, 0.5, 0.9]),
    ],
    pool: [
      P('Boş liminal havuz', [0.2, 0, 0.2, 0.2, 0.5, 0, 0.6, 0.2]),
      P('Olimpik kapalı havuz', [0.1, 0.9, 0.6, 0.8, 1, 0, 0.8, 0.4]),
      P('Gece kapalı havuz', [0.15, 0.8, 0.7, 0.9, 0.6, 1, 0, 0.3]),
      P('Açık hava villa', [0.9, 0.85, 0.9, 0.9, 0, 0, 0.5, 0.3]),
      P('Gece açık havuz', [0.95, 0.8, 0.8, 1, 0, 1, 0, 0.25]),
      P('Terk edilmiş açık havuz', [0.8, 0.15, 0, 0.1, 0.3, 0.1, 0.5, 0.2]),
      P('Kuşbakışı havuz', [0.85, 0.9, 1, 0.7, 0.8, 0, 0.5, 1]),
      P('Retro 80\'ler', [0.3, 0.7, 0.6, 0.4, 0.3, 0.6, 0.4, 0.35]),
      P('Hamam mavisi', [0.05, 0.5, 0.4, 1, 0, 0.3, 0.9, 0.1]),
      P('Sabah sakinliği', [0.7, 0.95, 0.5, 0.6, 0.5, 0, 0.7, 0.15]),
    ],
    market: [
      P('Asya gece pazarı', [0.8, 1, 1, 0.8, 1, 0.4, 0.7, 0.2]),
      P('Yağmurlu gece', [0.6, 0.8, 0.7, 0.6, 0.9, 1, 0.6, 0.25]),
      P('Gündüz pazarı', [0.7, 0.2, 1, 0.2, 0, 0, 0.4, 0.2]),
      P('Akşam kurulumu', [0.5, 0.7, 0.6, 0.3, 0.55, 0.2, 0.5, 0.3]),
      P('Buharlı sokak yemekleri', [0.9, 0.6, 0.5, 1, 0.85, 0.3, 0.8, 0.15]),
      P('Tepeden pazar', [0.8, 0.9, 0.9, 0.4, 0.9, 0.3, 0.6, 1]),
      P('Seyrek tezgâhlar', [0.15, 0.5, 0.4, 0.1, 0.8, 0.6, 0.3, 0.25]),
      P('Festival ışıkları', [0.7, 1, 0.8, 0.2, 0.75, 0, 0.9, 0.4]),
      P('Sabaha karşı', [0.4, 0.3, 0.3, 0.5, 0.7, 0.8, 0.5, 0.2]),
      P('Renkli bazar', [1, 0.4, 1, 0.3, 0.2, 0.1, 1, 0.3]),
    ],
    rooftop: [
      P('New York çatıları', [0.6, 1, 0.6, 0.7, 0.7, 0, 0.3, 0.2]),
      P('Gece şehir ışıkları', [0.7, 0.6, 0.7, 0.5, 1, 1, 0.2, 0.25]),
      P('Gün batımı', [0.5, 0.7, 0.5, 0.4, 0.6, 0.15, 0.5, 0.2]),
      P('Sisli sabah', [0.6, 0.5, 0.4, 0.6, 0.5, 0, 1, 0.15]),
      P('Drone yükselişi', [0.8, 0.8, 0.8, 0.6, 0.8, 0.3, 0.3, 1]),
      P('Alçak mahalle', [0.2, 0.3, 0.9, 0.8, 0.3, 0.1, 0.2, 0.1]),
      P('Mavi saat', [0.6, 0.6, 0.6, 0.6, 0.9, 0.65, 0.3, 0.3]),
      P('Yüksek kuleler', [1, 0.4, 0.4, 0.3, 1, 0.5, 0.4, 0.5]),
      P('Anten ormanı', [0.5, 0.2, 1, 0.9, 0.5, 0.2, 0.3, 0.15]),
      P('Çatı kenarı, gece', [0.4, 0.8, 0.3, 0.2, 0.7, 0.85, 0.6, 0.05]),
    ],
    harbor: [
      P('Konteyner limanı', [1, 1, 0.3, 0.3, 0, 0.2, 0.5, 0.4]),
      P('Gece rıhtımı', [0.8, 0.9, 0.5, 0.2, 1, 0.3, 0.8, 0.3]),
      P('Sisli balıkçı limanı', [0.1, 0, 1, 0.2, 0.1, 1, 0.4, 0.2]),
      P('Fırtınalı liman', [0.6, 0.7, 0.6, 1, 0.3, 0.6, 0.6, 0.3]),
      P('Gün batımı rıhtımı', [0.5, 0.6, 0.7, 0.3, 0.1, 0.2, 1, 0.2]),
      P('Havadan liman', [1, 1, 0.8, 0.4, 0.2, 0.15, 0.6, 1]),
      P('Sakin marina', [0, 0, 1, 0.05, 0.05, 0.1, 0.9, 0.25]),
      P('Endüstriyel gece', [1, 1, 0.2, 0.4, 0.9, 0.6, 0.4, 0.5]),
      P('Sabah pusu', [0.6, 0.5, 0.6, 0.15, 0, 0.8, 0.7, 0.15]),
      P('Mavi saat iskelesi', [0.3, 0.4, 0.9, 0.2, 0.6, 0.4, 1, 0.1]),
    ],
    station: [
      P('Büyük gar holü', [1, 0.7, 1, 0.6, 0.1, 0, 0.3, 0.4]),
      P('Kırsal istasyon', [0, 0.4, 0, 0.8, 0.1, 0, 0.2, 0.15]),
      P('Gece son tren', [0.2, 1, 0.4, 0.6, 1, 0.5, 0.4, 0.2]),
      P('Yağmurlu peron', [0, 0.8, 0.4, 0.4, 0.6, 1, 0.7, 0.2]),
      P('Sisli sabah garı', [1, 0.5, 0.6, 0.3, 0, 0.2, 1, 0.25]),
      P('Viktorya garı, gece', [1, 0.9, 0.7, 0.7, 0.9, 0.3, 0.5, 0.3]),
      P('Sundurma, gün batımı', [0, 0.3, 0.3, 0.5, 0.15, 0, 0.3, 0.3]),
      P('Tepeden peronlar', [0.3, 0.7, 1, 0.5, 0.4, 0.2, 0.3, 1]),
      P('Boş gece istasyonu', [0, 0.6, 0, 0, 1, 0.8, 0.8, 0.1]),
      P('Puslu kemer altı', [1, 0.6, 0.3, 0.2, 0.6, 0.4, 0.9, 0.5]),
    ],
    stadium: [
      P('Maç gecesi', [0.8, 0.8, 1, 1, 1, 1, 0.6, 0.2]),
      P('Gündüz antrenmanı', [0.6, 0.6, 0.8, 0, 0, 0.8, 0.3, 0.3]),
      P('Olimpiyat stadı', [0.2, 0.9, 0.6, 0.6, 0.3, 0.5, 0.9, 0.5]),
      P('Küçük yerel saha', [0.9, 0.15, 0.4, 0.5, 0.2, 0.3, 0, 0.1]),
      P('Altın saat, boş tribün', [0.7, 0.7, 0.9, 0, 0, 0.6, 0.5, 0.15]),
      P('Tepeden stadyum', [0.6, 0.8, 0.8, 0.8, 0.7, 1, 0.5, 1]),
      P('Sisli gece', [0.5, 0.7, 0.5, 1, 0.9, 0.6, 0.4, 0.35]),
      P('Dev tribünler', [1, 1, 1, 0.7, 0.5, 0.9, 1, 0.05]),
      P('Terk edilmiş stat', [0.4, 0.6, 0.1, 0.1, 0.15, 0, 0.2, 0.3]),
      P('Mavi saat ışıkları', [0.8, 0.9, 0.7, 1, 0.6, 0.8, 0.7, 0.6]),
    ],
  });
})();
