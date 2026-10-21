/* CineBG Studio v5 — görsel kütüphane genişletmesi.
   Paletler: 32 el yapımı + her birinden 4 türetilmiş (gece, soluk film, tamamlayıcı vurgu, ısı kayması) = 160.
   Grade'ler: +24 film stoğu ve stil. Kameralar: +34 plaka açısı. Işık, görüntü yönetmeni, imkânsız öğe, saat, hava listeleri büyütüldü. */
(function () {
  const CB = window.CB;

  /* ---------------- renk yardımcıları ---------------- */
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255);
  const rgb2hex = (c) => '#' + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
  function rgb2hsl([r, g, b]) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb([h, s, l]) {
    h = ((h % 360) + 360) % 360 / 360;
    if (!s) return [l, l, l];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  }
  const HUES = [[15, 'red'], [35, 'burnt orange'], [50, 'amber'], [65, 'gold'], [85, 'olive'], [140, 'green'], [170, 'jade'], [190, 'teal'], [205, 'cyan'], [225, 'azure'], [250, 'blue'], [270, 'indigo'], [295, 'violet'], [325, 'magenta'], [345, 'rose'], [360, 'red']];
  function colorName(hex) {
    const [h, s, l] = rgb2hsl(hex2rgb(hex));
    if (s < 0.12) return l < 0.12 ? 'near black' : l > 0.85 ? 'off-white' : l < 0.4 ? 'charcoal grey' : 'silver grey';
    const hn = HUES.find(([lim]) => h <= lim)[1];
    const adj = l < 0.12 ? 'inky' : l < 0.3 ? 'deep' : l > 0.82 ? 'pale' : s < 0.35 ? 'muted' : l > 0.6 ? 'soft' : 'rich';
    return adj + ' ' + hn;
  }
  const xf = (hex, fn) => rgb2hex(hsl2rgb(fn(rgb2hsl(hex2rgb(hex)))));
  CB.colorName = colorName;

  /* ---------------- türetilmiş paletler ---------------- */
  const BASE = CB.PALETTES.filter((p) => p.id !== 'ref');
  const warmth = (p) => { const [r, , b] = hex2rgb(p.c[1]); return r - b; };
  // RGB uzayında karıştırma: ton kayması yeşile kaçmasın
  const mix = (c, t, k) => rgb2hex(hex2rgb(c).map((v, i) => v + (t[i] - v) * k));
  const mul = (c, m) => rgb2hex(hex2rgb(c).map((v, i) => v * m[i]));
  const sat = (c, k) => xf(c, ([h, s, l]) => [h, Math.min(1, s * k), l]);
  const NAVY = [0.02, 0.04, 0.1], GREY = [0.54, 0.52, 0.5], WARM = [1.12, 1.0, 0.8], COOL = [0.84, 0.96, 1.16];
  const derived = [];
  BASE.forEach((p) => {
    const warm = warmth(p) > 0;
    [
      ['n', 'Gece', [(c) => mix(c, NAVY, 0.55), (c) => mul(mix(c, [0.11, 0.16, 0.29], 0.45), [0.6, 0.6, 0.6]), (c) => mul(c, [0.9, 0.9, 0.95]), (c) => sat(c, 1.15)], ['night']],
      ['f', 'Soluk film', [(c) => mix(c, [0.16, 0.155, 0.15], 0.5), (c) => mix(c, GREY, 0.3), (c) => mix(c, [0.93, 0.9, 0.84], 0.3), (c) => mix(c, GREY, 0.3)], ['overcast', 'pastel']],
      ['c', 'Ters vurgu', [(c) => c, (c) => c, (c) => c, (c) => xf(c, ([h, s, l]) => [h + 180, Math.max(s, 0.5), Math.min(Math.max(l, 0.4), 0.62)])], []],
      ['t', 'Isı kayması', [(c) => (warm ? mix(c, NAVY, 0.25) : mix(c, [0.08, 0.04, 0.02], 0.25)), (c) => mul(c, warm ? COOL : WARM), (c) => mul(c, warm ? COOL : WARM), (c) => c], warm ? ['cold', 'blue'] : ['golden', 'dusk']],
    ].forEach(([k, tr, fns, tags]) => {
      const c = p.c.map((x, i) => fns[i](x));
      derived.push({ id: p.id + '-' + k, tr: p.tr + ' · ' + tr, c, w: c.map(colorName), tags: [...new Set(p.tags.concat(tags))], derived: p.id });
    });
  });
  CB.PALETTES.push(...derived);

  /* rastgele uyumlu palet: analog / tamamlayıcı / üçlü şemalar */
  CB.randomPalette = function (seed) {
    let x = (seed >>> 0) || 1; const r = () => ((x = Math.imul(x ^ (x >>> 15), 2246822519) ^ (x + 0x9e3779b9)) >>> 0) / 4294967296;
    const h = r() * 360, scheme = Math.floor(r() * 3);
    const off = [[0, 25, 40, 200], [0, 15, 30, 180], [0, 120, 60, 240]][scheme];
    const c = [hsl2rgb([h + off[0], 0.5, 0.06]), hsl2rgb([h + off[1], 0.45 + r() * 0.3, 0.32]), hsl2rgb([h + off[2], 0.6, 0.82]), hsl2rgb([h + off[3], 0.6 + r() * 0.3, 0.5])].map(rgb2hex);
    return { id: 'rnd', tr: 'Üretilmiş ' + ['analog', 'tamamlayıcı', 'üçlü'][scheme], c, w: c.map(colorName), tags: [] };
  };

  /* ---------------- grade / film stokları ---------------- */
  const G = (o) => Object.assign({}, CB.GRADES.natural, { tr: '', en: '' }, o);
  Object.assign(CB.GRADES, {
    portra: G({ tr: 'Portra 400', en: 'Kodak Portra 400 look, creamy warm skin-friendly colour, soft pastel highlights and gentle grain', contrast: 0.97, saturation: 0.92, temperature: 0.12, fade: 0.06, highlights: [0.15, 0.08, 0.02], shadows: [0.03, 0.04, 0.06], grain: 0.35, halation: 0.2 }),
    cinestill: G({ tr: 'CineStill 800T', en: 'CineStill 800T tungsten film look, cool night tones with red halation around every light', temperature: -0.25, saturation: 1.05, contrast: 1.08, halation: 0.8, bloom: 0.55, threshold: 0.75, grain: 0.45, shadows: [0, 0.05, 0.2] }),
    technicolor: G({ tr: 'Technicolor 3 şerit', en: 'three-strip Technicolor look, saturated primaries, dense blacks and painterly colour', saturation: 1.45, contrast: 1.18, temperature: 0.05, highlights: [0.12, 0.06, 0], grain: 0.25 }),
    dayfornight: G({ tr: 'Gündüz-gece (day for night)', en: 'classic day-for-night look, underexposed blue moonlit grade with crisp hard shadows', exposure: -0.6, temperature: -0.55, saturation: 0.6, contrast: 1.15, shadows: [0, 0.05, 0.3], vignette: 0.55 }),
    crossproc: G({ tr: 'Çapraz işlem', en: 'cross-processed film look, cyan-green shadows, yellow highlights and punchy contrast', contrast: 1.25, saturation: 1.25, shadows: [-0.1, 0.15, 0.2], highlights: [0.25, 0.25, -0.15], grain: 0.35 }),
    ektachrome: G({ tr: 'Ektachrome slayt', en: 'Ektachrome slide-film look, clean cool blues, vivid but precise colour, deep blacks', contrast: 1.15, saturation: 1.15, temperature: -0.08, shadows: [-0.03, 0.02, 0.1], grain: 0.2 }),
    velvia: G({ tr: 'Velvia manzara', en: 'Fuji Velvia landscape look, hyper-saturated greens and blues, rich dense shadows', saturation: 1.5, contrast: 1.22, highlights: [0.05, 0.08, 0.05], grain: 0.15 }),
    kodachrome: G({ tr: 'Kodachrome', en: 'Kodachrome look, warm reds and deep blue skies, vintage documentary colour', saturation: 1.2, contrast: 1.15, temperature: 0.1, highlights: [0.15, 0.06, -0.05], shadows: [0, 0, 0.08], grain: 0.3, fade: 0.03 }),
    trix: G({ tr: 'Tri-X siyah-beyaz', en: 'Kodak Tri-X black-and-white look, gritty silver grain and punchy contrast', saturation: 0, contrast: 1.3, grain: 0.7, grainSize: 1.5, vignette: 0.45 }),
    hp5: G({ tr: 'HP5 yumuşak SB', en: 'Ilford HP5 soft black-and-white look, gentle mid-grey tonality and fine grain', saturation: 0, contrast: 1.05, fade: 0.08, grain: 0.5 }),
    archival: G({ tr: 'Arşiv editoryal sepya', en: 'archival editorial look, warm sepia duotone, faded print, scratches and heavy grain', saturation: 0.25, temperature: 0.35, fade: 0.14, contrast: 1.1, highlights: [0.2, 0.1, -0.05], grain: 0.7, grainSize: 1.8, vignette: 0.6 }),
    super8: G({ tr: 'Super 8 ev filmi', en: 'Super 8 home-movie look, warm faded colour, soft focus, heavy gate weave grain', saturation: 0.9, temperature: 0.2, fade: 0.12, contrast: 0.95, grain: 0.85, grainSize: 2.2, vignette: 0.7, halation: 0.35 }),
    doc16: G({ tr: '16 mm belgesel', en: '16mm documentary look, natural muted colour with visible grain and handheld honesty', saturation: 0.8, contrast: 1.08, grain: 0.6, grainSize: 1.7, vignette: 0.4 }),
    vhs: G({ tr: 'VHS kaset', en: 'VHS tape look, smeared chroma, lifted blacks, soft detail and colour bleed', saturation: 1.1, fade: 0.15, contrast: 0.9, ca: 0.8, grain: 0.4, bloom: 0.5 }),
    aerochrome: G({ tr: 'Kızılötesi Aerochrome', en: 'Aerochrome infrared-style look, foliage shifted to magenta and pink, cyan skies', saturation: 1.3, contrast: 1.1, shadows: [0.15, -0.1, 0.15], highlights: [0.3, -0.05, 0.15] }),
    lomo: G({ tr: 'Lomo', en: 'Lomo toy-camera look, saturated colour, heavy vignette and soft corners', saturation: 1.35, contrast: 1.2, vignette: 0.95, grain: 0.35, ca: 0.5 }),
    nordic: G({ tr: 'İskandinav soğuk', en: 'muted Nordic grade, cold desaturated greys and pale skin, quiet melancholy', saturation: 0.6, temperature: -0.2, contrast: 1.0, fade: 0.08, shadows: [0, 0.03, 0.08] }),
    western: G({ tr: 'Western sepya-turuncu', en: 'spaghetti-western grade, burnt orange highlights, dusty brown shadows', temperature: 0.4, saturation: 0.85, contrast: 1.2, highlights: [0.3, 0.12, -0.12], shadows: [0.1, 0.03, -0.05], grain: 0.45 }),
    coldwar: G({ tr: 'Soğuk savaş yeşili', en: 'cold-war thriller grade, olive-green cast, sodium highlights and grimy shadows', saturation: 0.7, contrast: 1.15, shadows: [-0.05, 0.1, -0.02], highlights: [0.15, 0.12, -0.08], grain: 0.4 }),
    candy: G({ tr: 'Şeker pastel', en: 'candy pastel grade, high-key soft saturated sweets colours and lifted shadows', saturation: 1.2, fade: 0.2, contrast: 0.88, exposure: 0.15, highlights: [0.1, 0.02, 0.12] }),
    dunegold: G({ tr: 'Kum altını', en: 'epic desert gold grade, monochrome amber haze with deep brown shadows', saturation: 0.75, temperature: 0.45, contrast: 1.15, highlights: [0.3, 0.18, -0.1], fade: 0.05 }),
    cyanotype: G({ tr: 'Siyanotip', en: 'cyanotype print look, Prussian-blue monochrome on paper white', saturation: 0, shadows: [-0.15, 0.05, 0.4], highlights: [0.0, 0.05, 0.15], contrast: 1.1, grain: 0.35 }),
    highkey: G({ tr: 'Beyaz yüksek ton', en: 'high-key white grade, airy bright exposure, clean whites and minimal shadow', exposure: 0.35, contrast: 0.9, saturation: 0.9, fade: 0.05, vignette: 0.1 }),
    chiaroscuro: G({ tr: 'Chiaroscuro karanlık', en: 'low-key chiaroscuro grade, deep pools of black with sculpted warm highlights', exposure: -0.35, contrast: 1.35, temperature: 0.1, vignette: 0.8, bloom: 0.2 }),
  });

  /* ---------------- kamera / kadraj açıları ---------------- */
  CB.CAMERAS.push(
    { id: 'corner', tr: 'Köşeden çapraz geniş', en: 'wide diagonal view from one corner across the whole space', lens: '21mm', cam: [1.02, -0.05, 0, 0] },
    { id: 'threshold', tr: 'Eşikten içeri', en: 'from the threshold looking in, door frame edges soft in the foreground', lens: '28mm', cam: [1.1, 0, 0.02, 0] },
    { id: 'stairsdown', tr: 'Merdivenden aşağı', en: 'from the top of a stairway looking down into the space', lens: '24mm', cam: [1.12, 0, -0.1, 0] },
    { id: 'underbridge', tr: 'Köprü altından', en: 'framed from beneath a bridge or overhang, a dark band across the top of frame', lens: '28mm', cam: [1.08, 0, 0.08, 0] },
    { id: 'foliage', tr: 'Yaprakların arasından', en: 'peering through out-of-focus foliage in the foreground', lens: '85mm', cam: [1.3, 0.04, 0.02, 0] },
    { id: 'fence', tr: 'Tel örgü ardından', en: 'through a chain-link fence or bars in soft foreground focus', lens: '85mm', cam: [1.25, 0, 0, 0] },
    { id: 'carwin', tr: 'Araç camından', en: 'seen through a vehicle window, the frame edges of the window dark and soft', lens: '35mm', cam: [1.15, 0.03, 0.02, 0.02] },
    { id: 'satellite', tr: 'Uydu görünümü', en: 'near-orthographic satellite view straight down from very high altitude', lens: '600mm', cam: [1.6, 0, -0.3, 0] },
    { id: 'rooftop', tr: 'Çatı kenarından', en: 'from a rooftop edge, the parapet in the lower foreground, the place spread below', lens: '24mm', cam: [1.1, 0, -0.14, 0] },
    { id: 'ruinframe', tr: 'Yıkıntı ardından', en: 'framed behind a broken wall or ruin edge, the space opening beyond', lens: '35mm', cam: [1.12, -0.04, 0.03, 0] },
    { id: 'lowdolly', tr: 'Alçak dolly hattı', en: 'low dolly-height view about 60 centimetres above the ground, gliding perspective', lens: '32mm', cam: [1.05, 0, 0.12, 0] },
    { id: 'diopter', tr: 'Split diopter', en: 'split-diopter composition, a sharp foreground object on one side and the sharp distance on the other', lens: '40mm', cam: [1.1, 0.06, 0, 0] },
    { id: 'fisheye', tr: 'Balıkgözü abartı', en: 'ultra-wide 10mm view with strong barrel distortion, the space curving around the frame', lens: '10mm', cam: [0.86, 0, 0, 0] },
    { id: 'tiltshift', tr: 'Tilt-shift minyatür', en: 'tilt-shift miniature look from high above, a thin band of focus making it look like a model', lens: '45mm TS', cam: [1.25, 0, -0.18, 0] },
    { id: 'scope', tr: 'Anamorfik 2.39 panorama', en: 'anamorphic 2.39 panoramic composition with horizontal flares and oval bokeh', lens: '40mm anamorphic', cam: [1.02, 0, 0.02, 0] },
    { id: 'normal50', tr: 'Doğal 50 mm', en: 'honest 50mm normal-lens perspective at standing eye height', lens: '50mm', cam: [1.12, 0, 0, 0] },
    { id: 'heathaze', tr: 'Uzun lens ısı dalgası', en: 'extreme telephoto through heat shimmer, the far layers wobbling and compressed', lens: '400mm', cam: [1.75, 0, 0.03, 0] },
    { id: 'reflection', tr: 'Cam yansımasında', en: 'the place seen as a reflection in a window or glass surface, layered with faint interior reflections', lens: '50mm', cam: [-1.1, 0, 0, 0], rev: true },
    { id: 'overcorr', tr: 'Tepeden simetrik koridor', en: 'top-down symmetrical view along a long corridor or street, strong graphic lines', lens: '24mm', cam: [1.3, 0, -0.22, 0] },
    { id: 'hipheight', tr: 'Bel hizası western', en: 'hip-height view as in a classic western, the horizon low and the sky dominant', lens: '40mm', cam: [1.05, 0, 0.1, 0] },
    { id: 'helicopter', tr: 'Helikopter yaklaşma', en: 'helicopter approach view at 300 metres, banking slightly toward the location', lens: '35mm', cam: [1.15, 0.05, -0.12, 0.08] },
    { id: 'periscope', tr: 'Yere yakın periskop', en: 'periscope lens skimming centimetres above the ground, tiny ground details huge in the foreground', lens: '24mm probe', cam: [1, 0, 0.24, 0] },
    { id: 'gimbalroll', tr: 'Yatık gimbal', en: 'gimbal-rolled view tilted 30 degrees, disorienting and kinetic', lens: '24mm', cam: [1.12, 0, 0, 0.52] },
    { id: 'mirrorsym', tr: 'Ayna simetrisi', en: 'mirror-symmetric reverse framing, the same composition flipped left to right', lens: '35mm', cam: [-1, 0, 0, 0], rev: true },
    { id: 'skylinehigh', tr: 'Yüksek ufuk çizgisi', en: 'ground-dominant composition with the horizon placed in the top fifth of the frame', lens: '35mm', cam: [1.08, 0, -0.16, 0] },
    { id: 'skydom', tr: 'Gökyüzü baskın', en: 'sky-dominant composition with the horizon placed in the bottom fifth of the frame', lens: '24mm', cam: [1.02, 0, 0.18, 0] },
    { id: 'offcentre', tr: 'Kenara itilmiş özne', en: 'off-centre composition with the main landmark pushed to the extreme left third and negative space right', lens: '35mm', cam: [1.1, -0.12, 0, 0] },
    { id: 'offcentrer', tr: 'Sağa itilmiş özne', en: 'off-centre composition with the main landmark pushed to the extreme right third and negative space left', lens: '35mm', cam: [1.1, 0.12, 0, 0] },
    { id: 'prodtop45', tr: 'Ürün 45° tepe', en: 'product set at 45 degrees from above, clean geometric layout', lens: '70mm', cam: [1.15, 0, -0.14, 0], only: 'studio' },
    { id: 'prodside', tr: 'Ürün profil', en: 'pure side profile of the set at podium height, graphic silhouette', lens: '100mm', cam: [1.05, 0.12, 0, 0], only: 'studio' },
    { id: 'prodtele', tr: 'Ürün tele sıkıştırma', en: 'long-lens product view compressing the set layers, creamy background', lens: '135mm', cam: [1.45, 0, 0.02, 0], only: 'studio' },
    { id: 'prodwide', tr: 'Ürün geniş set', en: 'wide view showing the whole advertising set and its architecture', lens: '28mm', cam: [0.92, 0, 0, 0], only: 'studio' },
    { id: 'proddutch', tr: 'Ürün eğik dinamik', en: 'dynamic dutch-angle product view, energetic diagonal lines', lens: '35mm', cam: [1.1, 0.05, 0, 0.2], only: 'studio' },
    { id: 'prodworm', tr: 'Ürün dipten', en: 'extreme low angle from floor level looking up at the product set', lens: '24mm', cam: [0.98, 0, 0.2, 0], only: 'studio' },
  );

  /* ---------------- ışık, görüntü yönetmeni, imkânsız öğe ---------------- */
  CB.LIGHTS.day.push(
    { tr: 'Dağınık sis içinde gün', en: 'diffuse daylight inside soft fog, layers separating by brightness' },
    { tr: 'Tepe güneşi + sıçrama', en: 'high sun with strong bounce off pale ground filling the shadows' },
    { tr: 'Benekli ağaç ışığı', en: 'dappled light through leaves or lattice, patterned shadows on the ground' },
    { tr: 'Pencere duvarı ışığı', en: 'a wall of windows as one huge soft key from the side' },
    { tr: 'Kontr ışık silüeti', en: 'strong contre-jour backlight, the main forms reading as silhouettes with rim light' },
    { tr: 'Yansıyan su ışığı', en: 'rippling light reflected off water dancing across surfaces' },
    { tr: 'Toz içinde ışın', en: 'hard sun beams cutting through suspended dust' },
    { tr: 'Gölgeli avlu', en: 'deep open shade with a bright sunlit patch beyond, high contrast between zones' },
    { tr: 'Gökyüzü kubbe ışığı', en: 'even skydome light, soft shadows, true colours' },
    { tr: 'Fırtına öncesi sarı ışık', en: 'eerie yellow pre-storm light under a black cloud ceiling' },
    { tr: 'Kar yansıması', en: 'bright cool light bouncing off snow from below' },
    { tr: 'Alçak altın yan ışık', en: 'very low golden side light grazing every texture' },
    { tr: 'Çatı açıklığından huzme', en: 'a single shaft from an opening above, a pool of light on the floor' },
    { tr: 'Bulut gölgeleri', en: 'moving cloud shadows sweeping across the land, alternating light and shade' },
    { tr: 'Isı pusu ışığı', en: 'bleached hazy light with heat shimmer flattening the distance' },
    { tr: 'Renkli vitray ışığı', en: 'coloured light falling through stained glass onto stone' },
    { tr: 'Gün ışığı + pratik', en: 'daylight mixed with a few warm practical lamps for colour contrast' },
    { tr: 'Kuzey ışığı yumuşak', en: 'soft cool north light, painterly gentle falloff' },
    { tr: 'Arkadan sisli güneş', en: 'sun hidden behind fog, a bright disc and glowing atmosphere' },
    { tr: 'Doğal kararma', en: 'natural vignetting from surrounding terrain, the centre brightest' },
  );
  CB.LIGHTS.night.push(
    { tr: 'Neon karışık', en: 'mixed neon practicals in two complementary colours, wet reflections doubling them' },
    { tr: 'Mum ve fener', en: 'clusters of candles and lanterns, small warm islands in darkness' },
    { tr: 'Araç farları', en: 'car headlights raking low across the ground through haze' },
    { tr: 'Projektör huzmesi', en: 'a single searchlight beam sweeping through smoke' },
    { tr: 'Ekran ışığı', en: 'cool flickering light from screens or monitors' },
    { tr: 'Floresan tüpler', en: 'cold green-white fluorescent tubes, some flickering' },
    { tr: 'Biyolüminesan', en: 'soft bioluminescent glow from plants, water or creatures' },
    { tr: 'Uzak şehir parıltısı', en: 'orange sky-glow from a distant city on low clouds' },
    { tr: 'Yıldız ışığı', en: 'faint starlight only, deep blue darkness with silver edges' },
    { tr: 'Kırmızı alarm', en: 'rotating red alarm beacons washing over everything' },
    { tr: 'Havai fişek', en: 'bursts of firework light in the sky, coloured flashes on surfaces' },
    { tr: 'Lav kızıllığı', en: 'red-orange glow from lava or embers lighting everything from below' },
    { tr: 'Aurora yeşili', en: 'green aurora light from above, soft and moving' },
    { tr: 'Sokak lambası tek', en: 'one lonely streetlamp, a cone of light in fog' },
    { tr: 'Ay arkadan kontr', en: 'full moon directly behind, silhouettes with silver rims' },
    { tr: 'Işaret fişeği', en: 'a burning flare casting harsh red light and moving shadows' },
    { tr: 'Pencere ışıkları', en: 'dozens of warm windows glowing in dark facades' },
    { tr: 'Ateş böceği', en: 'tiny drifting points of firefly light in deep blue dusk' },
    { tr: 'UV kara ışık', en: 'ultraviolet blacklight making surfaces fluoresce' },
    { tr: 'Şimşek arka planda', en: 'distant lightning flickering behind the horizon, the scene lit in pulses' },
  );
  CB.CINEMATOGRAPHERS.push(
    'Greig Fraser-style low-light silhouettes', 'Bradford Young-style underexposed soft darkness', 'Linus Sandgren-style warm saturated romance',
    'Janusz Kamiński-style blown-out backlight haze', 'Robert Richardson-style hot toplight', 'Darius Khondji-style rich dark warmth',
    'Christopher Doyle-style neon handheld colour', 'Vittorio Storaro-style symbolic colour light', 'Gordon Willis-style toplit shadow',
    'Conrad Hall-style rain and window light', 'Sven Nykvist-style soft natural faces of light', 'Rodrigo Prieto-style period colour',
    'Claudio Miranda-style clean digital sheen', 'Dariusz Wolski-style epic smoke and backlight', 'Mihai Mălaimare-style painterly large format',
    'Ari Wegner-style austere landscape light', 'Hoyte van Hoytema-style IMAX scale', 'Lol Crawley-style raw naturalism',
    'Jarin Blaschke-style monochrome texture', 'Wally Pfister-style grounded blockbuster realism', 'Bruno Delbonnel-style golden fable tones',
    'Robbie Ryan-style handheld natural colour', 'Łukasz Żal-style precise square symmetry', 'Erik Messerschmidt-style controlled low-key',
    'Rachel Morrison-style grounded warmth', 'Adam Arkapaw-style grim atmosphere', 'Matthew Libatique-style restless colour',
    'Seamus McGarvey-style elegant period light', 'Maryse Alberti-style documentary honesty', 'Javier Aguirresarobe-style quiet fog',
    'Benoît Debie-style acid neon', 'Mandy Walker-style sweeping landscape',
  );
  CB.IMPOSSIBLE.push(
    'a whale drifting slowly through the sky', 'an upside-down city hanging from the clouds', 'a staircase spiralling into the sea', 'a forest growing on the ceiling',
    'giant chess pieces scattered across the land', 'a lighthouse beam made of solid gold', 'a train running across the surface of a lake', 'a door opening onto outer space',
    'snow falling from a clear sunny sky', 'a mountain hovering above its own crater', 'a ring-shaped rainbow standing on the ground', 'a sea of clouds flowing through the streets',
    'a colossal statue half-submerged in sand', 'glowing jellyfish floating in the air', 'a tree with lanterns for leaves', 'a cathedral carved into a glacier',
    'a river flowing in a loop through the air', 'a giant clock face set into a cliff', 'a field of floating stones', 'an ocean wave frozen into glass',
    'a moon so close its craters are visible', 'paper birds migrating in a huge flock', 'a sunken ship sailing through dunes', 'roots of a giant tree wrapping a tower',
    'the horizon bending upward like a bowl', 'a pillar of light piercing the clouds', 'a crashed starship overgrown with flowers', 'an endless bookshelf rising into the sky',
    'a lake reflecting a different sky', 'giant footprints filled with water', 'a bridge made of light', 'a meteor frozen just above the ground',
    'a candle flame as tall as a building', 'a mirror lake splitting the world in two', 'butterflies forming a giant shape in the sky', 'a ladder leaning against the moon',
    'a city built on the back of a giant turtle', 'an hourglass draining a desert into the sky', 'floating lanterns forming constellations', 'a sea of mercury under a red sky',
    'a shadow that does not match its object', 'a giant hand of stone rising from the earth', 'a garden blooming on a battlefield', 'a tower made of stacked ships',
    'a fog bank shaped like a sleeping giant', 'aurora pouring down like a waterfall', 'a dome of glass over a frozen city', 'a gate of fire standing in the snow',
    'a sun and moon both overhead', 'giant feathers drifting down like snow', 'a field of mirrors facing the sky', 'the ocean pulled up into a column',
    'a black obelisk humming with light', 'a tree growing out of a cathedral roof', 'a glowing crack splitting the sky', 'a whirlpool in the middle of a desert',
    'a giant compass laid into the ground', 'a city floating on a raft of clouds', 'an iceberg drifting through a jungle river', 'a cloud raining only on one house',
  );

  /* ---------------- saat ve hava ---------------- */
  CB.TIMES.ext.push(
    { id: 'eclipse', tr: 'Güneş tutulması', en: 'total solar eclipse, corona in a dark sky and a 360-degree sunset glow on the horizon', sun: 0.05, pal: ['blue', 'storm'], night: true },
    { id: 'lateafternoon', tr: 'Geç ikindi pusu', en: 'late afternoon haze, sun low and diffused, the distance dissolving in warm air', sun: 0.3, pal: ['golden', 'dust'] },
    { id: 'firstlight', tr: 'İlk ışık', en: 'the very first light, a thin bright line on the horizon and cold blue land', sun: 0.02, pal: ['dawn', 'blue'] },
    { id: 'twilight', tr: 'Alacakaranlık', en: 'civil twilight, a pink-violet afterglow over darkening land', sun: 0.01, pal: ['dusk', 'pastel'] },
    { id: 'stormlight', tr: 'Fırtına ışığı', en: 'dramatic storm light, sun breaking under black clouds and lighting the land bright against a dark sky', sun: 0.25, pal: ['storm', 'golden'] },
    { id: 'whitenight', tr: 'Beyaz gece', en: 'polar white night, the sun hovering at the horizon at midnight, soft endless dusk', sun: 0.06, pal: ['cold', 'dusk'] },
    { id: 'starrynight', tr: 'Yıldızlı gece', en: 'clear moonless night under a dense starry sky and the Milky Way', sun: 0.0, pal: ['night', 'blue'], night: true },
  );
  CB.WEATHER.ext.push(
    { id: 'sandstorm', tr: 'Kum fırtınası', en: 'a wall of sandstorm rolling in, everything tinted and blurred by blowing sand', atmos: { dust: 0.95, fog: 0.3 } },
    { id: 'hail', tr: 'Dolu', en: 'hail bouncing on every surface under a dark sky', atmos: { rain: 0.5, fog: 0.15 } },
    { id: 'lowcloud', tr: 'Alçak bulut', en: 'low cloud cutting the tops off the tallest forms', atmos: { fog: 0.5 } },
    { id: 'rainbow', tr: 'Gökkuşağı', en: 'a rainbow after a passing shower, wet surfaces catching the sun', atmos: { fog: 0.1 } },
    { id: 'pollen', tr: 'Polen ve tohum', en: 'pollen and drifting seeds glowing in the backlight', atmos: { dust: 0.3 } },
    { id: 'frost', tr: 'Kırağı', en: 'hoarfrost coating every edge, breath-cold still air', atmos: { fog: 0.15 } },
    { id: 'monsoon', tr: 'Muson', en: 'warm monsoon downpour, steam rising from hot ground', atmos: { rain: 0.85, fog: 0.35 } },
    { id: 'wildfire', tr: 'Uzak orman yangını', en: 'distant wildfire smoke turning the sun into a red disc, ash drifting', atmos: { ash: 0.45, fog: 0.3, embers: 0.15 } },
  );
  CB.WEATHER.sky.push(...CB.WEATHER.ext.slice(-8).filter((w) => ['sandstorm', 'lowcloud', 'rainbow', 'wildfire'].includes(w.id)));
  CB.WEATHER.int.push(
    { id: 'drips', tr: 'Damlayan su', en: 'water dripping from the ceiling into shallow puddles', atmos: { rain: 0.12 } },
    { id: 'incense', tr: 'Tütsü dumanı', en: 'curling incense smoke catching the light', atmos: { fog: 0.3 } },
    { id: 'sparks', tr: 'Kıvılcımlar', en: 'sparks from welding or a broken cable drifting down', atmos: { embers: 0.4 } },
    { id: 'confetti', tr: 'Konfeti sonrası', en: 'settled confetti and a few pieces still falling', atmos: { dust: 0.2 } },
  );
})();
