/* CineBG Studio v7 — kamera sistemi.
   Elle yazılmış 60 açının yanına yükseklik × yön × lens × eğim kombinasyonlarından 630 açı eklenir.
   cam: [yakınlaştırma (eksi = ayna/ters), kaydırma x, kaydırma y, yatırma]; 3B motorlarda x yörüngeyi, y yüksekliği sürer. */
(function () {
  const CB = window.CB;
  const HEIGHTS = [
    { id: 'gr', tr: 'Yer seviyesi', en: 'camera at ground level, centimetres above the surface', y: 0.2 },
    { id: 'kn', tr: 'Diz hizası', en: 'camera at knee height', y: 0.12 },
    { id: 'ey', tr: 'Göz hizası', en: 'camera at standing eye level', y: 0 },
    { id: 'hi', tr: 'Yüksek açı', en: 'camera raised high, looking down at about 30 degrees', y: -0.1, noint: false },
    { id: 'cr', tr: 'Vinç', en: 'crane-height camera about 15 metres up', y: -0.16 },
    { id: 'dr', tr: 'Drone', en: 'drone camera about 80 metres up, looking down steeply', y: -0.24, noint: true },
    { id: 'sk', tr: 'Uydu yüksekliği', en: 'near-vertical view from very high altitude', y: -0.3, noint: true },
  ];
  const DIRS = [
    { id: 'fr', tr: 'Önden', en: 'facing the main landmark straight on', x: 0, rev: false },
    { id: 'l3', tr: 'Sol 3/4', en: 'from the front-left three-quarter side', x: -0.09 },
    { id: 'r3', tr: 'Sağ 3/4', en: 'from the front-right three-quarter side', x: 0.09 },
    { id: 'sd', tr: 'Yan profil', en: 'from the side, a profile view across the space', x: 0.16 },
    { id: 'rv', tr: 'Ters açı', en: 'from the far end looking back, the reverse angle', x: 0, rev: true },
  ];
  const LENSES = [
    { mm: '14mm', z: 0.86, en: 'ultra-wide 14mm lens with dramatic perspective' },
    { mm: '24mm', z: 0.96, en: 'wide 24mm lens' },
    { mm: '35mm', z: 1.05, en: '35mm lens' },
    { mm: '50mm', z: 1.15, en: 'natural 50mm lens' },
    { mm: '85mm', z: 1.35, en: '85mm lens with compressed depth' },
    { mm: '200mm', z: 1.7, en: 'long 200mm telephoto with heavy compression' },
  ];
  const ROLLS = [
    { id: 'lv', tr: '', en: '', r: 0 },
    { id: 'dl', tr: 'eğik sol', en: ', dutch-tilted fifteen degrees left', r: 0.24 },
    { id: 'dr', tr: 'eğik sağ', en: ', dutch-tilted fifteen degrees right', r: -0.24 },
  ];
  const rig = [];
  HEIGHTS.forEach((H) => DIRS.forEach((D) => LENSES.forEach((Ln) => ROLLS.forEach((Ro) => {
    rig.push({
      id: ['rig', H.id, D.id, Ln.mm, Ro.id].join('-'),
      tr: [H.tr, D.tr, Ln.mm, Ro.tr].filter(Boolean).join(' · '),
      en: `${H.en}, ${D.en}, ${Ln.en}${Ro.en}`,
      lens: Ln.mm,
      cam: [(D.rev ? -1 : 1) * Ln.z, D.x, H.y, Ro.r],
      rev: !!D.rev, rig: true, noint: !!H.noint,
    });
  }))));
  CB.CAMERAS.push(...rig);
  CB.CAMERA_RIG = { heights: HEIGHTS, dirs: DIRS, lenses: LENSES, rolls: ROLLS, count: rig.length };
})();
