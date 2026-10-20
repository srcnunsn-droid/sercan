/* CineBG Studio — paletler, renk grade'leri, en-boy oranları ve sahne varyasyon sözlükleri. */
(function () {
  const CB = (window.CB = window.CB || {});

  /* c: [derin, orta, ışık, vurgu] — w: prompt için renk adları (60/30/10) */
  CB.PALETTES = [
    { id: 'golden', tr: 'Altın Saat', c: ['#0b1026', '#c0563a', '#ffd27a', '#6b2d5c'], w: ['deep indigo shadow', 'burnt sienna', 'warm honey gold', 'dusky plum'], tags: ['golden', 'dusk'] },
    { id: 'amber', tr: 'Kehribar Pus', c: ['#0a0705', '#8a3b12', '#ffb347', '#1f6f78'], w: ['smoky umber black', 'rust amber', 'sodium orange glow', 'muted teal'], tags: ['golden', 'fire', 'neon'] },
    { id: 'arctic', tr: 'Arktik', c: ['#020814', '#1b3a5c', '#bfe6ff', '#5ad1c8'], w: ['polar navy', 'steel blue', 'ice white', 'glacial cyan'], tags: ['cold', 'day', 'blue'] },
    { id: 'neonnoir', tr: 'Neon Noir', c: ['#07020f', '#3a0f5c', '#ff3ea5', '#22d3ee'], w: ['ink violet black', 'deep purple', 'hot magenta neon', 'electric cyan'], tags: ['neon', 'night'] },
    { id: 'spice', tr: 'Baharat Çölü', c: ['#140b05', '#8c5a2b', '#f2c48d', '#b5452a'], w: ['dark umber', 'ochre sand', 'pale sun-bleached cream', 'rust red'], tags: ['day', 'golden', 'dust'] },
    { id: 'matrix', tr: 'Dijital Yeşil', c: ['#010702', '#0c3b1a', '#7dff9a', '#1b8a5a'], w: ['black green', 'bottle green', 'phosphor green', 'jade'], tags: ['neon', 'toxic', 'night'] },
    { id: 'moonlight', tr: 'Ay Işığı', c: ['#03040c', '#1d2a6b', '#9fb7ff', '#8a4fff'], w: ['midnight black', 'cobalt night blue', 'silver moonlight', 'violet'], tags: ['night', 'blue', 'cold'] },
    { id: 'inferno', tr: 'Cehennem', c: ['#060100', '#6e1405', '#ff9a3c', '#ffdf8a'], w: ['charcoal black', 'ember crimson', 'fire orange', 'molten yellow'], tags: ['fire', 'night'] },
    { id: 'tealorange', tr: 'Teal & Orange', c: ['#031016', '#0f4c5c', '#ff8c42', '#ffd6a5'], w: ['deep teal shadow', 'petrol teal', 'warm tungsten orange', 'peach highlight'], tags: ['golden', 'day', 'dusk'] },
    { id: 'rosedusk', tr: 'Gül Alacakaranlık', c: ['#0d0614', '#6a2c70', '#f6a5c0', '#f08a5d'], w: ['aubergine black', 'mauve', 'soft rose', 'coral'], tags: ['dusk', 'dawn'] },
    { id: 'emerald', tr: 'Zümrüt Orman', c: ['#020a06', '#1e4d2b', '#d8f3a6', '#f4d35e'], w: ['forest black', 'moss green', 'pale lime light', 'sunlit gold'], tags: ['day', 'dawn', 'nature'] },
    { id: 'steel', tr: 'Çelik Fırtına', c: ['#05070a', '#2e3b4e', '#dfe7f2', '#7aa2c9'], w: ['gunmetal black', 'slate blue grey', 'cold overcast white', 'steel blue'], tags: ['overcast', 'storm', 'cold'] },
    { id: 'synth', tr: 'Synthwave', c: ['#0a0221', '#461c6b', '#ffd319', '#ff3ea5'], w: ['ultraviolet black', 'grape purple', 'sun yellow', 'neon pink'], tags: ['neon', 'dusk'] },
    { id: 'mars', tr: 'Mars', c: ['#0c0402', '#7a2e12', '#f4a259', '#c84b31'], w: ['oxide black', 'red oxide', 'apricot dust', 'brick red'], tags: ['dust', 'day', 'space'] },
    { id: 'oceanic', tr: 'Okyanus', c: ['#010a14', '#035b7a', '#8fe3ff', '#ffcb77'], w: ['abyss navy', 'deep sea teal', 'aqua light', 'sand gold'], tags: ['water', 'day'] },
    { id: 'royal', tr: 'Kraliyet', c: ['#05030f', '#2b1b5a', '#e0c3fc', '#ffd166'], w: ['royal black', 'imperial purple', 'lilac light', 'gilded gold'], tags: ['night', 'space', 'palace'] },
    { id: 'toxic', tr: 'Zehirli', c: ['#020602', '#2f4a0a', '#d4ff3a', '#00ffa3'], w: ['tar black', 'swamp olive', 'acid lime', 'radioactive mint'], tags: ['toxic', 'night'] },
    { id: 'sakura', tr: 'Sakura Gecesi', c: ['#0a0710', '#3d2a4f', '#ffc2d6', '#9ad0ec'], w: ['plum black', 'dusky violet', 'blossom pink', 'powder blue'], tags: ['dusk', 'night', 'blue'] },
    { id: 'bleach', tr: 'Ağartılmış', c: ['#080808', '#3a3f44', '#e8e4dc', '#a98467'], w: ['soot black', 'cement grey', 'bone white', 'faded leather brown'], tags: ['overcast', 'day', 'storm'] },
    { id: 'crimson', tr: 'Kızıl', c: ['#070102', '#5c0a14', '#ff4d4d', '#ffb199'], w: ['oxblood black', 'deep crimson', 'signal red', 'salmon'], tags: ['fire', 'night', 'alarm'] },
    { id: 'dawnmist', tr: 'Şafak Sisi', c: ['#0b0f1a', '#5b6b8c', '#ffe1c4', '#c7a0b8'], w: ['blue-black', 'misty periwinkle', 'peach dawn light', 'heather pink'], tags: ['dawn', 'blue', 'overcast'] },
    { id: 'ash', tr: 'Kül & Kor', c: ['#0a0908', '#4a4440', '#ff7a2f', '#c9c2b8'], w: ['ash black', 'smoke grey', 'ember orange', 'ash white'], tags: ['fire', 'storm', 'dust'] },
    { id: 'jungle', tr: 'Cangıl', c: ['#020804', '#1b5e3a', '#e9f5b0', '#ffb84d'], w: ['jungle black', 'humid green', 'hazy lime light', 'mango gold'], tags: ['day', 'nature', 'water'] },
    { id: 'bluehour', tr: 'Mavi Saat', c: ['#020617', '#1e3a8a', '#fcd38d', '#60a5fa'], w: ['ink blue', 'deep ultramarine', 'warm window amber', 'sky blue'], tags: ['blue', 'dusk', 'night'] },
    { id: 'abyss', tr: 'Uçurum', c: ['#00040a', '#00324d', '#4de3ff', '#7b5cff'], w: ['abyssal black', 'deep marine blue', 'bioluminescent cyan', 'electric violet'], tags: ['water', 'night', 'space'] },
    { id: 'nebula', tr: 'Nebula', c: ['#04020b', '#3b1c6e', '#ffe0a3', '#ff5e8a'], w: ['cosmic black', 'nebula violet', 'starlight cream', 'hydrogen pink'], tags: ['space'] },
    { id: 'aurora', tr: 'Aurora', c: ['#01060f', '#123047', '#5affb0', '#b14fff'], w: ['polar night black', 'arctic slate', 'aurora green', 'aurora magenta'], tags: ['night', 'cold'] },
    { id: 'sepia', tr: 'Sepya Arşiv', c: ['#0c0805', '#5e4632', '#efdcbc', '#9c6b3f'], w: ['sepia black', 'tobacco brown', 'parchment cream', 'old brass'], tags: ['overcast', 'day', 'dust'] },
    { id: 'gothic', tr: 'Gotik', c: ['#050407', '#2c2433', '#d9cbb8', '#8b1e2e'], w: ['crypt black', 'bruised violet grey', 'candle cream', 'blood red'], tags: ['night', 'storm'] },
    { id: 'pastel', tr: 'Pastel Simetri', c: ['#1a1220', '#d98f8f', '#fff1d6', '#7fc8c2'], w: ['plum shadow', 'dusty rose', 'cream', 'mint'], tags: ['day', 'dawn'] },
    { id: 'heat', tr: 'Sıcak Pus', c: ['#140804', '#a8551e', '#fff0c2', '#e0a458'], w: ['scorched brown', 'baked terracotta', 'white-hot sky', 'mustard'], tags: ['day', 'dust', 'golden'] },
    { id: 'glacier', tr: 'Buzul', c: ['#03101a', '#2b6f8f', '#f0fbff', '#9be7ff'], w: ['deep ice black', 'glacier blue', 'snow white', 'pale cyan'], tags: ['cold', 'day', 'overcast'] },
  ];

  /* Grade preset'leri: post-process değerleri + prompt sözcükleri */
  const G = (o) => Object.assign({
    exposure: 0, contrast: 1.05, saturation: 1, temperature: 0, tint: 0, fade: 0,
    shadows: [0, 0, 0], highlights: [0, 0, 0], bloom: 0.35, threshold: 0.85, flare: 0.08,
    flareColor: [0.35, 0.55, 1], halation: 0.15, ca: 0.15, vignette: 0.4, grain: 0.25, grainSize: 1.2, bars: 0,
  }, o);
  CB.GRADES = {
    natural: G({ tr: 'Doğal', en: 'naturalistic grade, true-to-life colour, gentle contrast' }),
    blockbuster: G({ tr: 'Blockbuster (Teal & Orange)', en: 'teal and orange blockbuster grade, warm highlights against cool shadows', contrast: 1.18, saturation: 1.1, shadows: [-0.25, 0.05, 0.3], highlights: [0.3, 0.1, -0.2], bloom: 0.4, flare: 0.25 }),
    neonoir: G({ tr: 'Neo-Noir Kehribar', en: 'neo-noir amber haze grade, sodium-vapour warmth with teal shadows', contrast: 1.12, saturation: 0.95, temperature: 0.2, shadows: [-0.1, 0.1, 0.2], highlights: [0.35, 0.15, -0.15], fade: 0.05, bloom: 0.55, flare: 0.4, halation: 0.3 }),
    digital: G({ tr: 'Dijital Yeşil', en: 'cold digital green grade, sickly fluorescent cast', contrast: 1.2, saturation: 0.8, temperature: -0.1, shadows: [-0.1, 0.2, -0.05], highlights: [-0.05, 0.25, -0.1] }),
    moonlight: G({ tr: 'Ay Işığı Mavisi', en: 'cool moonlit blue grade, silver highlights', temperature: -0.35, saturation: 0.85, contrast: 1.1, shadows: [0.1, -0.05, 0.35], highlights: [0.05, 0.05, 0.2] }),
    noir: G({ tr: 'Kara Film (Siyah-Beyaz)', en: 'high-contrast black and white film noir grade', saturation: 0, contrast: 1.35, grain: 0.5, vignette: 0.6, bloom: 0.25 }),
    bleach: G({ tr: 'Bleach Bypass', en: 'bleach bypass grade, desaturated with silvery crushed contrast', saturation: 0.45, contrast: 1.35, highlights: [0.05, 0.05, 0.05], grain: 0.35 }),
    kodak: G({ tr: 'Kodak 2383 Sıcak', en: 'warm print-film grade with rich skin-friendly highlights and dense blacks', temperature: 0.15, contrast: 1.12, saturation: 1.05, shadows: [0, 0.05, 0.15], highlights: [0.25, 0.12, -0.05], halation: 0.35, grain: 0.35 }),
    eterna: G({ tr: 'Eterna Yumuşak', en: 'soft low-contrast film grade with muted greens and lifted blacks', contrast: 0.92, saturation: 0.85, fade: 0.12, shadows: [-0.05, 0.1, 0.08], highlights: [0.05, 0.05, -0.02], temperature: -0.05, bloom: 0.25 }),
    spice: G({ tr: 'Çöl Baharatı', en: 'desaturated sun-bleached desert grade, warm sepia haze', temperature: 0.35, saturation: 0.7, contrast: 1.1, shadows: [0.15, 0.05, -0.05], highlights: [0.3, 0.15, -0.1], fade: 0.06 }),
    pastel: G({ tr: 'Pastel Simetri', en: 'soft pastel storybook grade, airy lifted shadows', contrast: 0.9, saturation: 1.15, fade: 0.18, highlights: [0.15, 0.05, 0.1], temperature: 0.05, vignette: 0.2, grain: 0.15 }),
    neon: G({ tr: 'Neon Noir', en: 'saturated neon-noir grade, magenta and cyan light in deep blacks', contrast: 1.2, saturation: 1.3, shadows: [0.2, -0.1, 0.35], highlights: [-0.05, 0.15, 0.2], bloom: 0.7, flare: 0.5, ca: 0.4 }),
    war: G({ tr: 'Savaş Belgeseli', en: 'gritty desaturated war-film grade, cold shadows and dirty highlights', saturation: 0.55, contrast: 1.25, temperature: -0.05, shadows: [-0.05, 0.03, 0.12], highlights: [0.12, 0.08, 0.0], grain: 0.5, grainSize: 1.6, vignette: 0.5 }),
    epic: G({ tr: 'Epik Fantastik', en: 'rich epic fantasy grade, deep shadows and luminous gold highlights', contrast: 1.15, saturation: 1.05, shadows: [-0.05, 0.0, 0.2], highlights: [0.3, 0.2, 0.0], bloom: 0.55, halation: 0.25 }),
    horror: G({ tr: 'Korku Soğuğu', en: 'cold sickly horror grade, green-grey shadows and dim highlights', saturation: 0.6, contrast: 1.2, temperature: -0.15, shadows: [-0.05, 0.12, 0.08], highlights: [0.0, 0.05, 0.0], exposure: -0.2, vignette: 0.7, grain: 0.45 }),
    scifi: G({ tr: 'Bilimkurgu Soğuk', en: 'clean cold sci-fi grade, steel blues with clinical whites', contrast: 1.1, saturation: 0.9, temperature: -0.2, shadows: [-0.05, 0.05, 0.2], highlights: [0.05, 0.1, 0.15], bloom: 0.5, flare: 0.35, ca: 0.25 }),
  };

  CB.ASPECTS = [
    { id: '16:9', tr: '16:9 · YouTube / TV', r: 16 / 9, mj: '16:9' },
    { id: '2.39', tr: '2.39:1 · Sinemaskop', r: 2.39, mj: '12:5' },
    { id: '21:9', tr: '21:9 · Ultra geniş', r: 21 / 9, mj: '21:9' },
    { id: '1.85', tr: '1.85:1 · Flat sinema', r: 1.85, mj: '37:20' },
    { id: '9:16', tr: '9:16 · Reels / TikTok / Shorts', r: 9 / 16, mj: '9:16' },
    { id: '4:5', tr: '4:5 · Instagram portre', r: 4 / 5, mj: '4:5' },
    { id: '1:1', tr: '1:1 · Kare', r: 1, mj: '1:1' },
    { id: '3:2', tr: '3:2 · Fotoğraf', r: 3 / 2, mj: '3:2' },
    { id: '4:3', tr: '4:3 · Klasik', r: 4 / 3, mj: '4:3' },
    { id: '32:9', tr: '32:9 · Çift monitör', r: 32 / 9, mj: '32:9' },
    { id: '16:10', tr: '16:10 · Dizüstü duvar kağıdı', r: 16 / 10, mj: '16:10' },
    { id: '19.5:9', tr: '19.5:9 · Telefon duvar kağıdı', r: 9 / 19.5, mj: '9:19' },
    { id: '2:3', tr: '2:3 · Film afişi', r: 2 / 3, mj: '2:3' },
    { id: '3:1', tr: '3:1 · YouTube / Twitter kapak', r: 3, mj: '3:1' },
  ];
  CB.RESOLUTIONS = [
    { id: 720, tr: 'HD 720p' }, { id: 1080, tr: 'Full HD 1080p' }, { id: 1440, tr: 'QHD 1440p' },
    { id: 2160, tr: '4K UHD 2160p' }, { id: 2880, tr: '5K 2880p' }, { id: 4320, tr: '8K 4320p' },
  ];

  /* ------- Varyasyon sözlükleri ------- */
  // sun: 0..1 güneş yüksekliği (motor parametresine eşlenir), pal: tercih edilen palet etiketleri
  CB.TIMES = {
    ext: [
      { id: 'predawn', tr: 'Tan öncesi', en: 'pre-dawn twilight, the sky only beginning to pale', sun: 0.0, pal: ['blue', 'dawn'], night: true },
      { id: 'dawn', tr: 'Şafak', en: 'dawn, low sun just clearing the horizon', sun: 0.08, pal: ['dawn'] },
      { id: 'morning', tr: 'Sabah altın saati', en: 'early morning golden hour, long raking shadows', sun: 0.2, pal: ['golden', 'dawn'] },
      { id: 'midday', tr: 'Öğle', en: 'harsh high midday sun, short hard shadows', sun: 0.9, pal: ['day'] },
      { id: 'afternoon', tr: 'İkindi', en: 'late afternoon, warm angled light', sun: 0.45, pal: ['day', 'golden'] },
      { id: 'golden', tr: 'Altın saat', en: 'golden hour, sun low and warm behind the scene', sun: 0.15, pal: ['golden'] },
      { id: 'sunset', tr: 'Gün batımı', en: 'sunset, the sun touching the horizon', sun: 0.04, pal: ['dusk', 'golden'] },
      { id: 'bluehour', tr: 'Mavi saat', en: 'blue hour after sunset, deep blue sky with the last warm glow', sun: 0.0, pal: ['blue', 'dusk'] },
      { id: 'moonnight', tr: 'Ay ışıklı gece', en: 'night under a bright moon, silvered edges and deep shadow', sun: 0.6, pal: ['night', 'cold'], night: true },
      { id: 'darknight', tr: 'Zifiri gece', en: 'moonless night lit only by scattered practical sources', sun: 0.0, pal: ['night', 'neon', 'fire'], night: true },
      { id: 'overcast', tr: 'Kapalı gün', en: 'flat overcast daylight under a low grey ceiling of cloud', sun: 0.5, pal: ['overcast', 'storm'] },
    ],
    int: [
      { id: 'morningwin', tr: 'Sabah pencere ışığı', en: 'cool morning daylight falling through tall windows', sun: 0.3, pal: ['dawn', 'day'] },
      { id: 'noonshaft', tr: 'Öğle ışık huzmeleri', en: 'hard midday sun shafts cutting through high openings', sun: 0.8, pal: ['day', 'golden'] },
      { id: 'goldenwin', tr: 'Altın saat yan ışığı', en: 'low golden-hour sun raking sideways across the space', sun: 0.15, pal: ['golden'] },
      { id: 'lamp', tr: 'Gece lamba ışığı', en: 'night, a few warm practical lamps in a dark room', sun: 0.0, pal: ['night', 'golden'], night: true },
      { id: 'candle', tr: 'Mum ışığı', en: 'candlelight only, small warm flames and deep falloff', sun: 0.0, pal: ['fire', 'night'], night: true },
      { id: 'fluor', tr: 'Floresan', en: 'buzzing overhead fluorescent tubes, cold flat light', sun: 0.5, pal: ['toxic', 'overcast', 'cold'] },
      { id: 'neonspill', tr: 'Neon sızıntısı', en: 'coloured neon light spilling in from outside', sun: 0.0, pal: ['neon'], night: true },
      { id: 'redalert', tr: 'Kırmızı alarm', en: 'red emergency lighting pulsing in darkness', sun: 0.0, pal: ['alarm', 'fire'], night: true },
      { id: 'moonwin', tr: 'Pencereden ay ışığı', en: 'moonlight through windows, cold blue patterns on the floor', sun: 0.4, pal: ['night', 'blue'], night: true },
    ],
    space: [
      { id: 'starlight', tr: 'Yıldız ışığı', en: 'lit only by distant starlight and the glow of the nebula', sun: 0.0, pal: ['space'] },
      { id: 'planetrise', tr: 'Gezegen doğuşu', en: 'a star cresting the curve of a planet, thin bright atmosphere rim', sun: 0.2, pal: ['space', 'golden'] },
      { id: 'eclipse', tr: 'Tutulma', en: 'eclipse, a dark disc ringed by a blazing corona', sun: 0.5, pal: ['space', 'night'] },
      { id: 'flare', tr: 'Yakın yıldız parlaması', en: 'harsh direct light from a nearby sun, black hard shadows', sun: 0.8, pal: ['space', 'fire'] },
    ],
    water: [
      { id: 'shallow', tr: 'Sığ gün ışığı', en: 'shallow sunlit water, dancing caustics and god rays from the surface', sun: 0.8, pal: ['water', 'day'] },
      { id: 'twilightzone', tr: 'Derin alacakaranlık', en: 'deep twilight zone, faint blue light fading into black', sun: 0.3, pal: ['water', 'night'] },
      { id: 'biolum', tr: 'Biyolüminesans gece', en: 'night dive, bioluminescent points of light in black water', sun: 0.0, pal: ['water', 'night', 'neon'] },
    ],
  };
  CB.TIMES.sky = CB.TIMES.ext;
  CB.TIMES.abstract = [
    { id: 'studio', tr: 'Yumuşak stüdyo ışığı', en: 'soft diffused studio glow from above', sun: 0.5, pal: ['day', 'dawn', 'palace'] },
    { id: 'backlit', tr: 'Arkadan aydınlatma', en: 'strong backlight creating luminous rims and halos', sun: 0.2, pal: ['golden', 'space'] },
    { id: 'darkfield', tr: 'Karanlık alan', en: 'dark-field illumination, glowing edges on a black ground', sun: 0.0, pal: ['night', 'space', 'water'] },
    { id: 'neonrim', tr: 'Neon kenar ışığı', en: 'saturated neon rim light against deep black', sun: 0.0, pal: ['neon'] },
    { id: 'goldenrim', tr: 'Altın parıltı', en: 'warm golden glow pooling from one side', sun: 0.15, pal: ['golden', 'fire'] },
  ];

  CB.WEATHER = {
    ext: [
      { id: 'clear', tr: 'Açık', en: 'clear still air' },
      { id: 'mist', tr: 'Hafif sis', en: 'light mist hanging in the low ground' },
      { id: 'fog', tr: 'Yoğun sis', en: 'thick rolling fog swallowing the distance' },
      { id: 'drizzle', tr: 'Çisenti', en: 'fine drizzle and wet reflective surfaces' },
      { id: 'rain', tr: 'Sağanak', en: 'heavy rain falling in sheets, water bouncing off every surface' },
      { id: 'afterrain', tr: 'Yağmur sonrası', en: 'just after rain, puddles and wet sheen everywhere' },
      { id: 'snow', tr: 'Kar yağışı', en: 'soft snowfall drifting down' },
      { id: 'blizzard', tr: 'Tipi', en: 'horizontal driving snow in a blizzard' },
      { id: 'dust', tr: 'Toz fırtınası', en: 'wind-blown dust and sand veiling the light' },
      { id: 'smoke', tr: 'Duman pusu', en: 'drifting smoke haze layering the depth' },
      { id: 'ash', tr: 'Kül yağışı', en: 'ash falling like grey snow' },
      { id: 'storm', tr: 'Gök gürültülü fırtına', en: 'thunderstorm with lightning in the clouds' },
      { id: 'heat', tr: 'Sıcak hava dalgası', en: 'heat shimmer warping the horizon' },
      { id: 'wind', tr: 'Sert rüzgar', en: 'strong wind whipping grass, cloth and debris' },
    ],
    int: [
      { id: 'still', tr: 'Durgun hava', en: 'still air, quiet and motionless' },
      { id: 'motes', tr: 'Toz zerreleri', en: 'dust motes floating in the light beams' },
      { id: 'smokeint', tr: 'Duman', en: 'thin smoke haze hanging under the ceiling' },
      { id: 'steam', tr: 'Buhar', en: 'steam drifting from vents and pipes' },
      { id: 'rainwin', tr: 'Camda yağmur', en: 'rain streaming down the windows' },
      { id: 'drip', tr: 'Damlayan su', en: 'water dripping from the ceiling into pools' },
    ],
    space: [
      { id: 'dustcos', tr: 'Kozmik toz', en: 'veils of cosmic dust' },
      { id: 'debris', tr: 'Enkaz akışı', en: 'drifting debris and ice particles' },
      { id: 'solarwind', tr: 'Güneş rüzgarı', en: 'glowing solar wind streams' },
      { id: 'void', tr: 'Boşluk', en: 'absolute stillness of the void' },
    ],
    water: [
      { id: 'clearw', tr: 'Berrak su', en: 'crystal clear water with long visibility' },
      { id: 'snoww', tr: 'Deniz karı', en: 'marine snow particles drifting down' },
      { id: 'silt', tr: 'Bulanık silt', en: 'silt clouds softening the distance' },
      { id: 'current', tr: 'Akıntı', en: 'strong current bending plants and particles' },
    ],
  };
  CB.WEATHER.sky = CB.WEATHER.ext;
  CB.WEATHER.abstract = [
    { id: 'particles', tr: 'Süzülen parçacıklar', en: 'fine particles drifting slowly through the frame' },
    { id: 'liquid', tr: 'Sıvı pus', en: 'soft liquid haze between layers' },
    { id: 'stillabs', tr: 'Durgun', en: 'perfectly still, calm composition' },
    { id: 'flow', tr: 'Akış', en: 'gentle flowing motion across the frame' },
  ];

  CB.SEASONS = [
    { id: 'spring', tr: 'İlkbahar', en: 'spring, fresh green growth' },
    { id: 'summer', tr: 'Yaz', en: 'high summer, dry and full' },
    { id: 'autumn', tr: 'Sonbahar', en: 'autumn, rust and gold foliage' },
    { id: 'winter', tr: 'Kış', en: 'winter, bare and frost-bitten' },
  ];

  CB.CONDITIONS = {
    aftermath: { tr: 'Çatışma sonrası', en: 'aftermath of battle, dust still settling, fresh damage everywhere' },
    burning: { tr: 'Yanıyor', en: 'still burning, fires licking at wreckage' },
    smoldering: { tr: 'İçin için yanıyor', en: 'smouldering ruins, embers and thin smoke' },
    eve: { tr: 'Savaş arifesi', en: 'the eve of battle, quiet and tense, everything waiting' },
    ceasefire: { tr: 'Ateşkes', en: 'an uneasy ceasefire, silent and abandoned positions' },
    'active-glow': { tr: 'Enerji parıltısı', en: 'scarred by energy weapons, glowing molten edges cooling' },
    besieged: { tr: 'Kuşatma altında', en: 'under siege, battered walls and siege works all around' },
    ruined: { tr: 'Yıkık', en: 'ruined and broken, past its peak' },
    weathered: { tr: 'Yıpranmış', en: 'weathered by centuries, worn edges and stains' },
    pristine: { tr: 'Kusursuz', en: 'pristine and intact, untouched' },
    abandoned: { tr: 'Terk edilmiş', en: 'long abandoned, dust and silence' },
    overgrown: { tr: 'Bitki istilası', en: 'overgrown, reclaimed by vines, moss and trees' },
    dusty: { tr: 'Tozlu', en: 'coated in fine dust and sand' },
    'lived-in': { tr: 'Yaşanmış', en: 'lived-in and used, traces of daily life everywhere' },
    empty: { tr: 'Boş', en: 'completely empty and still' },
    wet: { tr: 'Islak', en: 'rain-soaked, every surface glistening' },
    decaying: { tr: 'Çürüyen', en: 'slowly decaying, peeling and corroded' },
    operational: { tr: 'Çalışır durumda', en: 'fully operational, machines humming' },
    rusted: { tr: 'Paslı', en: 'rusted and corroded throughout' },
    alert: { tr: 'Alarm durumu', en: 'on high alert, warning lights active' },
    decommissioned: { tr: 'Hizmet dışı', en: 'decommissioned and sealed' },
    snowbound: { tr: 'Kara gömülü', en: 'snowbound, buried in deep drifts' },
    windswept: { tr: 'Rüzgar savruk', en: 'windswept and exposed' },
    misty: { tr: 'Sisli', en: 'veiled in drifting mist' },
    scorching: { tr: 'Kavurucu', en: 'scorching and sun-baked' },
    autumnal: { tr: 'Sonbahar', en: 'deep in autumn colour' },
    dark: { tr: 'Karanlık', en: 'dark and brooding' },
    humid: { tr: 'Nemli', en: 'heavy and humid, dripping wet' },
    rainy: { tr: 'Yağmurlu', en: 'in steady rain' },
    frozen: { tr: 'Donmuş', en: 'frozen solid, frost on every edge' },
    blizzard: { tr: 'Tipi', en: 'lashed by a blizzard' },
    calm: { tr: 'Durgun', en: 'perfectly calm' },
    stormy: { tr: 'Fırtınalı', en: 'storm-tossed and violent' },
    flooded: { tr: 'Sular altında', en: 'flooded, standing water everywhere' },
    harvest: { tr: 'Hasat', en: 'harvest time, fields cut and gathered' },
    erupting: { tr: 'Patlıyor', en: 'mid-eruption, lava and ash in the air' },
    dormant: { tr: 'Uykuda', en: 'dormant and quiet' },
    steaming: { tr: 'Buharlı', en: 'steaming from every crack' },
    glowing: { tr: 'Parıldayan', en: 'glowing with its own light' },
    sunken: { tr: 'Batık', en: 'sunken and encrusted with growth' },
    deep: { tr: 'Derin', en: 'deep and pressurised' },
    cosmic: { tr: 'Kozmik', en: 'vast and cosmic in scale' },
    violent: { tr: 'Şiddetli', en: 'violent and unstable' },
    quiet: { tr: 'Sessiz', en: 'utterly silent and still' },
    damaged: { tr: 'Hasarlı', en: 'battle-damaged, sparking panels and breached bulkheads' },
    ancient: { tr: 'Kadim', en: 'impossibly ancient' },
    enchanted: { tr: 'Büyülü', en: 'charged with quiet enchantment' },
    cursed: { tr: 'Lanetli', en: 'cursed and wrong, the air heavy' },
    eerie: { tr: 'Tekinsiz', en: 'eerie and unsettling' },
    candlelit: { tr: 'Mum ışıklı', en: 'lit by rows of candles' },
    opulent: { tr: 'Görkemli', en: 'opulent, gilded and immaculate' },
    messy: { tr: 'Dağınık', en: 'cluttered and untidy' },
    'busy-but-empty': { tr: 'Mesai sonrası', en: 'after hours, signs of the day left behind' },
    scorched: { tr: 'Kavrulmuş', en: 'scorched' },
    lit: { tr: 'Işıklar yanık', en: 'all lights blazing' },
    'after-party': { tr: 'Parti sonrası', en: 'after the party, confetti and spilled drinks' },
    oppressive: { tr: 'Baskıcı', en: 'oppressive and monumental' },
    divine: { tr: 'İlahi', en: 'touched by divine light' },
    catastrophic: { tr: 'Felaket anı', en: 'at the peak of catastrophe' },
    dramatic: { tr: 'Dramatik', en: 'dramatic and theatrical' },
    smoky: { tr: 'Dumanlı', en: 'thick with cigarette smoke' },
    decaying2: { tr: 'Çürüyen', en: 'decaying' },
  };

  CB.CAMERAS = [
    { id: 'est', tr: 'Ultra geniş kuruluş planı', en: 'extreme wide establishing shot from a high vantage point, the whole location visible in one frame', lens: '18mm' },
    { id: 'low', tr: 'Alçak açı geniş', en: 'low wide shot at knee height looking along the ground toward the far landmark', lens: '24mm' },
    { id: 'high34', tr: 'Yüksek açı 3/4', en: 'high angle three-quarter wide shot, camera high above looking diagonally down at 45 degrees', lens: '24mm' },
    { id: 'drone', tr: 'Drone tepeden', en: 'overhead drone view looking straight down onto the location', lens: '24mm' },
    { id: 'sym', tr: 'Simetrik tek nokta', en: 'eye-level symmetrical one-point perspective with a centred vanishing point', lens: '35mm' },
    { id: 'tele', tr: 'Teleobjektif sıkıştırma', en: 'long telephoto view from far away, compressing the layers of depth', lens: '135mm' },
    { id: 'frame', tr: 'Ön plan çerçeveli', en: 'framed through a dark foreground opening toward the brighter space beyond', lens: '35mm' },
    { id: 'silhouette', tr: 'Siluet ufuk', en: 'wide silhouette shot against the sky, horizon placed in the lower third', lens: '50mm' },
    { id: 'eye', tr: 'Göz hizası orta-geniş', en: 'eye-level medium-wide shot, natural human viewpoint at 1.7 metres', lens: '35mm' },
    { id: 'crane', tr: 'Vinç yükselişi', en: 'elevated crane-height view rising above the foreground', lens: '24mm' },
  ];

  CB.LIGHTS = {
    day: [
      { tr: 'Tek motive anahtar ışık', en: 'one motivated key source, everything else falling away into deep shadow, no flat fill' },
      { tr: 'Arkadan dumanlı ışık', en: 'hard backlight through haze, visible light shafts toward camera' },
      { tr: 'Kapalı düz ışık', en: 'large soft overcast toplight, no visible source, contrast carried by wet materials' },
      { tr: 'Sert yan güneş', en: 'hard low side sun raking across textures, long shadows' },
      { tr: 'Bulut boşluğundan huzme', en: 'sunlight breaking through a gap in heavy cloud, a single pool of light on the ground' },
    ],
    night: [
      { tr: 'Ay ışığı + sis', en: 'cold hard moonlight from high behind, ambient blue bounce, mist reading the beam, one warm lantern for contrast' },
      { tr: 'Tek pratik kaynak', en: 'one visible warm practical source, hard falloff so everything beyond a few metres goes dark' },
      { tr: 'Aşağıdan ateş ışığı', en: 'warm firelight from below flickering upward, cool ambient from above at a quarter of the level, embers in the air' },
      { tr: 'Fırtına flaşı', en: 'darkness broken by a hard white lightning flash from one side, the frozen instant' },
      { tr: 'Sodyum sokak ışığı', en: 'sodium-vapour streetlight pools and deep shadow between them' },
    ],
  };

  CB.CINEMATOGRAPHERS = [
    'Roger Deakins-style naturalistic light', 'Emmanuel Lubezki-style natural light and wide lenses', 'Hoyte van Hoytema-style large-format realism',
    'Andrei Tarkovsky-style contemplative stillness', 'Akira Kurosawa-style quiet landscape stillness', 'Christopher Blauvelt-style soft naturalism',
    'Paweł Pawlikowski-style austere melancholy', 'Naomi Kawase-style atmospheric rural light',
  ];

  CB.IMPOSSIBLE = [
    'weapons hanging frozen in mid-air', 'a waterfall pouring upward into the sky', 'a bridge of floating rock fragments', 'an army turned to salt statues',
    'rain falling upward around one spot', 'a second moon low and enormous on the horizon', 'a ship resting on a mountaintop', 'a tree of black glass',
    'a doorway standing alone with daylight behind it', 'a frozen wave of water caught mid-crash', 'stars visible in daylight', 'a colossal sword driven into the earth',
    'stone stairs ascending into the clouds', 'a river of light running through the ground', 'a giant hourglass half-buried in sand',
  ];

  CB.TECH = {
    film: 'Photorealistic ARRI Alexa LF with anamorphic lenses, organic 35mm Kodak Vision3 250D film grain, soft cinematic falloff, cinematic film still',
    digital: 'Shot on ARRI Alexa Mini LF with Signature Primes, clean modern digital capture, crisp natural detail, minimal fine grain, modern cinematic film still',
  };

  CB.NEGATIVE = ['people', 'figures', 'crowd', 'text', 'logo', 'watermark', 'cartoon', 'anime', 'CGI render look', 'game screenshot', 'fisheye', 'tilted horizon', 'oversaturated', 'flat lighting', 'blurry', 'low-res', 'compression artifacts', 'oversharpen'];
})();
