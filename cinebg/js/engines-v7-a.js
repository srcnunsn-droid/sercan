/* CineBG Studio v7 — doğa motorları (A) bağlantıları ve ön ayarları.
   Anahtar kelimeler, grup bağları, parametre kancaları ve her motor için 10 görünüm (CB.ENGINE_PRESETS). */
(function () {
  const CB = window.CB;
  const K = CB.ENGINE_KEYS, H = CB.ENGINE_HOOKS;
  const rr = (r, a, b) => a + (b - a) * r();
  const text = (s) => ((s.cat.base || s.cat).en + ' ' + (s.cat.q ? s.cat.q.en : '')).toLowerCase();

  // bambu, tuz düzlüğü, kumtaşı ve buzul için daha iyi motor var: genel kuralların bu kelimeleri yutmasını engelle.
  // spec.js kurallarını bu dosyadan sonra eklediği için temizlik push anında yapılır.
  const clean = (rule) => {
    const src = rule[0].source;
    let c = src.replace(/\|bamboo(?=\||$)/, '').replace(/\|salt flat(?=\||$)/, '').replace(/\|sand(?=\|)/, '|sand(?!stone)').replace(/\|glacier(?=\||$)/, '');
    // QA: "moonlit sea" gibi metinler uzay motoruna düşmesin
    c = c.replace(/(^|\|)moon(?=\||$)/, '$1moon(?!lit|light|rise|beam)');
    // QA: kar/buz kuralı yerleşim, savaş ya da iç mekân metnini dağ/aurora'ya çekmesin (sonrasında bu kelimeler varsa eşleşmez)
    if (/snow\|/.test(c) && /frozen/.test(c)) c = '(?:' + c + ')(?![^]*\\b(?:city|street|avenue|town|village|battle|battlefield|front|trench|campaign|watchtower|border|siege|market|station|harbou?r|port|base|bunker|fortress|castle|house|cabin|lodge|hotel|interior|room|cafe|shop|forest|woods?|grove|spruce|pine|birch|taiga|road|research|lake)\\b)';
    return c === src ? rule : [new RegExp(c, rule[0].flags), rule[1]];
  };
  for (let i = 0; i < K.length; i++) K[i] = clean(K[i]);
  const basePush = K.push;
  K.push = function (...rules) { return basePush.apply(this, rules.map(clean)); };

  K.push(
    [/waterfall|cascade|\bfalls\b|plunge pool/i, ['waterfall']],
    [/glacier|iceberg|ice shelf|ice front|calving|ice field/i, ['glacier']],
    [/coral|\breef\b|lagoon|atoll/i, ['coral']],
    [/mushroom|fung|toadstool|mycel/i, ['mushroom']],
    [/bamboo/i, ['bamboo']],
    [/natural arch|rock arch|sandstone arch|natural bridge|arches\b|hoodoo|sandstone/i, ['canyonarch']],
    [/salt flat|salt lake|salar|salt pan|mirror lake|playa|salt crust/i, ['saltflat']],
    [/aerial|satellite view|patchwork|top-down|drone view|from above/i, ['aerial']],
  );

  const addTo = (ids, eng) => ids.forEach((id) => { const g = CB.GROUPS.find((x) => x.id === id); if (g && !g.engines.includes(eng)) g.engines.push(eng); });
  addTo(['rivers', 'forest', 'jungle', 'mountains', 'parks', 'fantasy', 'myth'], 'waterfall');
  addTo(['polar', 'mountains'], 'glacier');
  addTo(['underwater', 'coast', 'pirates'], 'coral');
  addTo(['fantasy', 'darkfantasy', 'fairytale', 'alien', 'micro'], 'mushroom');
  addTo(['eastasia', 'jungle', 'southasia'], 'bamboo');
  addTo(['desert', 'western', 'parks'], 'canyonarch');
  addTo(['desert', 'plains'], 'saltflat');
  addTo(['plains', 'roads', 'villages'], 'aerial');

  const wet = (s) => /rain|drizzle|storm|monsoon|afterrain/.test(s.weather.id);
  const foggy = (s) => /fog|mist|lowcloud/.test(s.weather.id);
  Object.assign(H, {
    waterfall: (p, s) => { p[6] = s.time.night ? 0.15 : 0.35 + s.time.sun * 0.6; if (foggy(s) || wet(s)) p[3] = rr(s.r, 0.65, 1); },
    glacier: (p, s) => { p[5] = s.time.night ? 0.05 : Math.min(1, s.time.sun * 1.1 + 0.1); if (foggy(s)) p[7] = rr(s.r, 0.6, 0.95); },
    coral: (p, s) => { const t = text(s); p[0] = /lagoon|shore|beach|atoll|cove|surface/.test(t) ? rr(s.r, 0.35, 0.7) : s.r() < 0.3 ? rr(s.r, 0.3, 0.7) : 0; if (s.time.night) { p[2] *= 0.3; p[3] *= 0.3; } },
    mushroom: (p, s) => { p[2] = s.time.night ? rr(s.r, 0.6, 1) : p[2] * 0.6; p[6] = s.time.night ? 0.1 : p[6]; },
    bamboo: (p, s) => { p[4] = s.time.night ? 0.05 : 0.3 + s.time.sun * 0.6; if (foggy(s) || wet(s)) p[3] = rr(s.r, 0.6, 1); p[6] = /path|trail|walk/.test(text(s)) ? rr(s.r, 0.5, 1) : p[6]; },
    canyonarch: (p, s) => { if (/dust|sandstorm|heat/.test(s.weather.id)) p[6] = rr(s.r, 0.6, 1); },
    saltflat: (p, s) => { p[4] = s.time.night ? 0.02 : Math.min(1, s.time.sun); if (/overcast|storm/.test(s.weather.id + s.time.id)) p[3] = rr(s.r, 0.6, 1); if (wet(s) || /mirror/.test(text(s))) p[0] = rr(s.r, 0.7, 1); },
    aerial: (p, s) => { const t = text(s); if (/coast|sea|shore|beach|bay/.test(t)) p[3] = rr(s.r, 0.4, 0.8); if (/river|delta|stream/.test(t)) p[1] = rr(s.r, 0.5, 1); if (/village|town|farm/.test(t)) p[6] = rr(s.r, 0.4, 0.8); },
  });

  const P = (tr, p) => ({ tr, p });
  Object.assign(CB.ENGINE_PRESETS, {
    waterfall: [
      P('Dar ve yüksek perde', [0.15, 0.95, 0.5, 0.45, 0.8, 0.5, 0.6, 0.5]),
      P('Geniş Niagara cephesi', [0.95, 0.45, 0.7, 0.8, 0.4, 0.3, 0.6, 0.4]),
      P('Yemyeşil orman şelalesi', [0.45, 0.65, 0.45, 0.4, 0.55, 1, 0.45, 0.6]),
      P('Sisli sabah şelalesi', [0.5, 0.7, 0.35, 1, 0.5, 0.6, 0.25, 0.5]),
      P('Kayalık kanyon şelalesi', [0.35, 0.8, 0.6, 0.35, 1, 0.15, 0.75, 0.35]),
      P('Ayna gölet', [0.3, 0.5, 0.2, 0.2, 0.6, 0.6, 0.55, 1]),
      P('Gürleyen sel', [0.75, 0.6, 1, 0.9, 0.7, 0.35, 0.45, 0.2]),
      P('Altın ışıkta damla', [0.2, 0.55, 0.3, 0.3, 0.45, 0.45, 1, 0.75]),
      P('Gölgede saklı', [0.4, 0.75, 0.4, 0.55, 0.85, 0.85, 0.12, 0.45]),
      P('Alçak çağlayan', [0.6, 0.15, 0.55, 0.5, 0.5, 0.6, 0.6, 0.6]),
    ],
    glacier: [
      P('Dev buzul duvarı', [1, 0.7, 0.3, 0.6, 0.6, 0.4, 0.6, 0.2]),
      P('Buzdağı tarlası', [0.3, 0.5, 1, 0.4, 0.7, 0.35, 0.3, 0.2]),
      P('Kobalt mavisi', [0.7, 1, 0.5, 0.5, 0.5, 0.3, 0.8, 0.15]),
      P('Gece yarısı güneşi', [0.6, 0.45, 0.6, 0.7, 0.85, 0.05, 0.4, 0.3]),
      P('Sisli fiyort', [0.55, 0.6, 0.45, 0.8, 0.5, 0.3, 0.4, 0.85]),
      P('Ayna su', [0.5, 0.55, 0.35, 0.75, 1, 0.45, 0.3, 0.1]),
      P('Çatlak cephe', [0.85, 0.75, 0.2, 0.3, 0.4, 0.5, 1, 0.25]),
      P('Uzak buzul', [0.2, 0.4, 0.6, 1, 0.65, 0.6, 0.3, 0.35]),
      P('Beyaz parlak gün', [0.65, 0.25, 0.45, 0.6, 0.55, 0.95, 0.4, 0.1]),
      P('Fırtına öncesi', [0.75, 0.85, 0.7, 0.85, 0.3, 0.2, 0.6, 0.6]),
    ],
    coral: [
      P('Derin resif', [0, 1, 0.6, 0.6, 0.3, 0.5, 0.8, 0.3]),
      P('Bölünmüş lagün', [0.55, 0.7, 0.5, 0.8, 0.4, 0.15, 0.9, 0.3]),
      P('Balık sürüsü', [0, 0.55, 0.45, 0.5, 1, 0.4, 0.6, 0.5]),
      P('Işık katedrali', [0, 0.45, 1, 0.4, 0.2, 0.55, 0.5, 0.2]),
      P('Sığ kostikli kum', [0.7, 0.3, 0.6, 1, 0.3, 0.05, 0.7, 0.4]),
      P('Bulanık derinlik', [0, 0.6, 0.3, 0.2, 0.5, 1, 0.4, 0.8]),
      P('Neon mercan', [0, 0.9, 0.35, 0.5, 0.2, 0.3, 1, 0.3]),
      P('Ağarmış resif', [0, 0.8, 0.5, 0.5, 0.15, 0.45, 0.05, 0.3]),
      P('Su yüzeyi çizgisi', [0.85, 0.5, 0.7, 0.7, 0.5, 0.2, 0.7, 0.6]),
      P('Gece resifi', [0, 0.65, 0.1, 0.15, 0.35, 0.7, 0.85, 0.2]),
    ],
    mushroom: [
      P('Dev kubbe orman', [1, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.5]),
      P('Biyolüminesan gece', [0.6, 0.7, 1, 0.8, 0.4, 0.5, 0.05, 0.1]),
      P('Spor fırtınası', [0.5, 0.6, 0.5, 1, 0.6, 0.4, 0.4, 0.6]),
      P('Sık mantar kalabalığı', [0.4, 1, 0.5, 0.4, 0.3, 0.7, 0.4, 0.5]),
      P('Sisli masal', [0.7, 0.45, 0.35, 0.5, 1, 0.5, 0.6, 0.7]),
      P('Altın kanopi', [0.75, 0.5, 0.15, 0.35, 0.5, 0.6, 1, 0.9]),
      P('Tek dev mantar', [1, 0.05, 0.6, 0.5, 0.45, 0.3, 0.5, 0.5]),
      P('Eğreltili zemin', [0.35, 0.55, 0.3, 0.3, 0.35, 1, 0.55, 0.4]),
      P('Soğuk mavi ışıma', [0.6, 0.6, 0.85, 0.6, 0.6, 0.4, 0.15, 0]),
      P('Minyatür ölçek', [0.15, 0.85, 0.45, 0.6, 0.4, 0.8, 0.6, 0.6]),
    ],
    bamboo: [
      P('Sık bambu duvarı', [1, 0.4, 0.6, 0.5, 0.4, 0.3, 0, 0.3]),
      P('Işık huzmeli koru', [0.5, 0.5, 0.5, 0.6, 1, 0.3, 0, 0.4]),
      P('Taş patika', [0.6, 0.45, 0.55, 0.45, 0.6, 0.2, 1, 0.3]),
      P('Yoğun sis', [0.6, 0.4, 0.4, 1, 0.3, 0.2, 0.3, 0.2]),
      P('Dağ manzaralı seyrek koru', [0.15, 0.35, 0.3, 0.6, 0.5, 0.3, 0.2, 1]),
      P('Kalın saplar', [0.3, 1, 0.5, 0.35, 0.5, 0.2, 0.4, 0.3]),
      P('Rüzgarlı yapraklar', [0.55, 0.4, 1, 0.4, 0.45, 1, 0, 0.3]),
      P('Gece bambu', [0.65, 0.5, 0.5, 0.7, 0.05, 0.2, 0.3, 0.5]),
      P('Mürekkep resmi', [0.4, 0.3, 0.7, 0.9, 0.2, 0.3, 0, 0.8]),
      P('Altın saat sapları', [0.45, 0.6, 0.45, 0.35, 0.85, 0.25, 0.5, 0.5]),
    ],
    canyonarch: [
      P('Dev kemer', [1, 0.6, 0.6, 0.5, 0.4, 0.5, 0.3, 0.5]),
      P('İnce doğal köprü', [0.7, 0.05, 0.4, 0.35, 0.3, 0.3, 0.2, 0.4]),
      P('Kalın masif kemer', [0.35, 1, 0.7, 0.65, 0.5, 0.6, 0.3, 0.7]),
      P('Kızıl katmanlar', [0.6, 0.55, 1, 0.55, 0.3, 0.5, 0.2, 0.5]),
      P('Kum fırtınası pusu', [0.65, 0.5, 0.5, 0.45, 0.8, 0.3, 1, 0.6]),
      P('Mesalar arasında', [0.5, 0.4, 0.5, 0.25, 0.2, 1, 0.4, 0.4]),
      P('Aşınmış kaya', [0.55, 0.65, 0.4, 0.75, 0.4, 0.4, 0.3, 1]),
      P('Kumul denizi', [0.45, 0.45, 0.35, 0.6, 1, 0.2, 0.35, 0.3]),
      P('Sabah kontr ışığı', [0.75, 0.5, 0.6, 0.05, 0.4, 0.5, 0.5, 0.5]),
      P('Akşam yan ışığı', [0.6, 0.55, 0.6, 0.95, 0.35, 0.6, 0.25, 0.6]),
    ],
    saltflat: [
      P('Kusursuz ayna', [1, 0.3, 0.4, 0.4, 0.4, 0, 0, 0.2]),
      P('Kuru poligon kabuk', [0, 1, 0.5, 0.2, 0.5, 0, 0, 0.3]),
      P('Bulut aynası', [0.9, 0.2, 0.3, 1, 0.55, 0.1, 0, 0.2]),
      P('Gün batımı yansıması', [0.85, 0.4, 0.6, 0.6, 0.05, 0.15, 0, 0.3]),
      P('Uzak dağlar', [0.5, 0.6, 1, 0.3, 0.45, 0.2, 0, 0.35]),
      P('Araç izleri', [0.25, 0.8, 0.5, 0.3, 0.6, 0.1, 1, 0.3]),
      P('Pus ufku', [0.6, 0.5, 0.4, 0.4, 0.35, 0.2, 0, 1]),
      P('Rüzgarlı dalgacık', [0.75, 0.4, 0.6, 0.5, 0.5, 1, 0, 0.3]),
      P('Öğle beyazı', [0.3, 0.7, 0.3, 0.1, 1, 0.1, 0.3, 0.5]),
      P('Fırtına bulutu', [0.8, 0.5, 0.7, 0.9, 0.25, 0.4, 0, 0.6]),
    ],
    aerial: [
      P('Yamalı tarlalar', [0.5, 0, 0.3, 0, 0.2, 0.2, 0.1, 0.2]),
      P('Kıvrılan nehir', [0.4, 1, 0.1, 0, 0.4, 0.2, 0, 0.3]),
      P('Kıyı şeridi', [0.45, 0.2, 0.3, 0.6, 0.3, 0.1, 0.2, 0.3]),
      P('Orman ve açıklık', [0.6, 0.3, 0.2, 0, 1, 0.3, 0, 0.2]),
      P('Köy ve yollar', [0.55, 0.2, 1, 0, 0.2, 0.2, 0.9, 0.3]),
      P('Bulut gölgeli ova', [0.35, 0.2, 0.3, 0, 0.3, 1, 0.1, 0.4]),
      P('Hasat sonu', [0.5, 0.3, 0.4, 0, 0.2, 0.1, 0.2, 1]),
      P('Büyük ölçek uydu', [1, 0.6, 0.5, 0.3, 0.5, 0.3, 0.4, 0.4]),
      P('Yakın drone', [0.05, 0.3, 0.5, 0, 0.3, 0.15, 0.3, 0.2]),
      P('Delta ve deniz', [0.6, 0.9, 0.2, 0.75, 0.3, 0.2, 0.1, 0.3]),
    ],
  });
})();
