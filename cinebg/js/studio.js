/* CineBG Studio — Karakter Stüdyosu ve Yarışma Kiti.
   Sheet kuralları skill'lerden: Lira (Soul 2.0 üç panel, Soul ID, isim yok), ONE SHOT (T1 kahraman plakası,
   T3 yakın plan, T4 kimlik kilidi, T5a referans görselden, durum varyantları, el kuralı, QC + dosya adı),
   Seedance 2.0 (tek aksiyon, tek kamera hareketi, kilit satırı, saniyesiz çekim sırası, moderasyon ön kontrolü). */
(function () {
  const CB = window.CB;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    kids.forEach((c) => c != null && n.append(c));
    return n;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cinebg.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cinebg.' + k, JSON.stringify(v)); } catch (e) { /* depolama yok */ } },
  };
  const L = CB.CHAR_LOOK;
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
  const arch = (c) => CB.ARCHETYPES.find((a) => a.id === c.arch) || CB.ARCHETYPES[0];
  const NAMES = ['Arda', 'Selin', 'Kaan', 'Mira', 'Doruk', 'Ece', 'Tarık', 'Lale', 'Rhea', 'Ilya', 'Kenji', 'Amara', 'Teo', 'Nova', 'Yusuf', 'Zeynep', 'Orin', 'Sami', 'Leyla', 'Bora', 'Ayla', 'Cem', 'Defne', 'Ruslan', 'Ines', 'Malik', 'Hana', 'Emre', 'Dalia', 'Kai', 'Toma', 'Nilay', 'Aras', 'Yara', 'Vera', 'Ozan'];
  const WEAPON = /rifle|carbine|revolver|sword|axe|cutlass|musket|crowbar|shield|longbow|arrow|hammer/i;
  const upperName = (c) => (c.name || 'KARAKTER').toLocaleUpperCase('tr').replace(/[^A-ZÇĞİÖŞÜ0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------------- durum ---------------- */
  const ST = {
    view: 'bg',
    chars: store.get('chars', []),
    cur: store.get('charCur', null),
    expr: 0, state: 'battle',
    contest: Object.assign({ format: 'ad', concept: '', seed: 1, lead: '', aspect: '9:16', person: '' }, store.get('contest', {})),
    plan: null,
  };
  const save = () => { store.set('chars', ST.chars); store.set('charCur', ST.cur); };
  const curChar = () => ST.chars.find((c) => c.id === ST.cur) || null;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function randomChar(seed, archId) {
    const r = CB.rng(seed >>> 0);
    const a = archId ? CB.ARCHETYPES.find((x) => x.id === archId) : pick(r, CB.ARCHETYPES);
    const gender = pick(r, ['man', 'woman', 'man', 'woman', 'person']);
    const used = new Set(ST.chars.map((c) => c.accent && c.accent[1]));
    const freeAcc = L.accents.filter((x) => !used.has(x[1]));
    return {
      id: uid(), kind: 'original', name: pick(r, NAMES), arch: a.id, gender,
      age: pick(r, L.age)[0], build: pick(r, L.build), origin: pick(r, L.origin), face: pick(r, L.face),
      hair: gender === 'woman' ? pick(r, L.hairW) : pick(r, L.hairM), hairColor: pick(r, L.hairColor),
      beard: gender === 'man' ? pick(r, L.beard) : 'clean-shaven', mark: pick(r, L.marks),
      wardrobe: Math.floor(r() * a.wardrobe.length), prop: Math.floor(r() * a.props.length), hook: Math.floor(r() * a.hooks.length),
      accent: pick(r, freeAcc.length ? freeAcc : L.accents), notes: '',
    };
  }
  function referenceChar() {
    return {
      id: uid(), kind: 'reference', name: 'Yarışma Yüzü', arch: 'ceo', gender: 'man', age: '30s', build: 'athletic', origin: '', face: '', hair: '', hairColor: '', beard: '', mark: '',
      wardrobe: 0, prop: 0, hook: 0, accent: ['brass', '#B08D57'], notes: 'Kimlik yalnızca resmî referans paketinden ve Soul ID’den gelir.',
    };
  }

  /* ---------------- prompt yapı taşları ---------------- */
  const genderNoun = (c) => (c.gender === 'woman' ? 'woman' : c.gender === 'man' ? 'man' : 'person');
  const ageWord = (c) => `in ${c.gender === 'woman' ? 'her' : c.gender === 'man' ? 'his' : 'their'} ${c.age}`;
  function subject(c) {
    if (c.kind === 'reference') return 'the same real person as in the reference images; keep the exact face, skin tone, hairline, hair and body proportions from the references';
    const beard = c.gender === 'man' && c.beard && c.beard !== 'clean-shaven' ? `, ${c.beard}` : c.gender === 'man' ? ', clean-shaven' : '';
    return `a ${c.origin ? c.origin + ' ' : ''}${genderNoun(c)} ${ageWord(c)} with a ${c.build} build, ${c.face}, ${c.hair} ${c.hairColor} hair${beard}, ${c.mark}`;
  }
  const who = (c) => (c.kind === 'reference' ? 'the person from the reference images' : `the ${arch(c).en}`);
  const wardrobe = (c) => arch(c).wardrobe[c.wardrobe % arch(c).wardrobe.length];
  const prop = (c) => arch(c).props[c.prop % arch(c).props.length];
  const hook = (c) => arch(c).hooks[c.hook % arch(c).hooks.length];
  const accTxt = (c) => `${c.accent[0]} ${c.accent[1]}`;
  const filename = (c, type) => `${upperName(c)}_${type}_v1`;
  const soulNote = (c) => (c.kind === 'reference' ? 'Soul ID: resmî referans paketinden oluşturduğun kimliği seç.' : 'Soul ID: ilk tutarlı sheet’ten oluştur, sonraki her üretimde seç.');

  const HERO_LIGHT = 'LIGHTING: high-key white seamless background lit evenly to near-white, brightest directly behind the head, no shadow falling on the backdrop. Subject lit low-key and several stops darker than the background: one large soft key above and slightly camera-left wrapping the face and shoulders, eye sockets in shadow, no hard shadow edge; two narrow hard rim lights behind the subject on both sides drawing a bright outline along shoulders, head and cloak; almost no fill; visible catchlight in the eyes.';
  const GRADE = (c) => `GRADE: desaturated near-monochrome, ${c.accent[0]} ${c.accent[1]} as the only saturated colour, deep shadows that still hold texture, near-white background not fully blown out, fine 35mm film grain.`;
  const CAMERA = 'CAMERA: 100mm lens, chest height, straight on, no wide-angle distortion, shallow depth of field on the close-up panel only, full-body panels sharp head to toe.';
  const REALISM = 'REALISM: real skin pores and fine hair, real fabric weave and stitching, scuffed metal with micro-scratches, practical built costume photographed on a cyclorama, live-action film still.';
  const ID_LIGHT = 'LIGHTING: neutral soft even wrap-around, near-shadowless, 5600K, no colour cast, readable skin texture, eye catchlights, no glare on hair or metal. Plain mid-grey studio backdrop, evenly lit, thin dark dividers between panels.';
  const HEADLESS = 'PANEL CENTRE: full body, front, framed from the collarbones DOWN — the head is cropped out of this panel entirely, no face, no chin, no neck above the collarbones. Body otherwise complete to the feet, feet in frame, standing at rest, arms relaxed, weight even.';
  const AVOID = 'AVOID: text, logos, watermark, extra characters, extra fingers, fused fingers, deformed hands, floating prop, duplicate prop, 3D render look, video game screenshot, plastic or airbrushed skin';

  function sheets(c) {
    const a = arch(c), name = upperName(c);
    const expr = L.expressions[ST.expr % L.expressions.length];
    const state = L.states.find((s) => s[0] === ST.state) || L.states[0];
    const out = [];
    out.push(['Soul 2.0 · üç panel film sheet', 'Lira şablonu · kimlik sabitleme',
      [`Three studio photographs of the same ${genderNoun(c)} arranged side by side on a flat neutral mid-grey studio backdrop, a film character sheet: full-body front photo on the left, full-body back photo in the middle, close-up portrait photo on the right, the same real person in all three, consistent across panels. Soft directional cinematic studio lighting from one side, gentle natural shadow falloff, clean neutral cinematic look.`,
        `The ${a.en}: ${subject(c)}.`,
        `Wardrobe, consistent in all panels: ${wardrobe(c)}; ${prop(c)}. Signature shape: ${hook(c)}.`,
        `On the left panel the ${a.en} stands straight facing the camera in a neutral pose, arms relaxed at the sides, full figure head to feet. In the middle panel the same standing pose is seen from behind. On the right panel a close-up head-and-shoulders portrait, ${expr}.`,
        `Muted neutral palette with ${c.accent[0]} as the single accent. Shot on ARRI Alexa Mini LF with ARRI Signature Prime lens, clean modern digital cinematic capture, crisp natural detail, minimal fine grain, natural living skin tones.`].join('\n'),
      `Soul 2.0 · 16:9 · 2k. ${soulNote(c)} Hızlı yol: Cinema Studio AI Cast sheet’i otomatik kurar.`]);
    out.push(['Kimlik kilit sayfası (T4)', 'ONE SHOT · video ve Soul ID için besleme dosyası',
      [`Character sheet of one ${a.en}, three panels side by side, plain mid-grey studio backdrop, thin dark dividers.`,
        'LEFT: full-body front, framed from the collarbones down, no head in this panel, shoes in frame, standing straight, arms relaxed.',
        'CENTRE: full-body back, head to toe, same pose, facing away.',
        `RIGHT: close-up of face and shoulders, calm gaze.`,
        `SUBJECT: ${subject(c)}.`,
        `OUTFIT: ${wardrobe(c)}; ${prop(c)}.`,
        ID_LIGHT,
        'LOCKS: one identical person in all three views — same identity, outfit, hair, proportions; frontal panel headless, cropped at the collarbones; feet visible in both full-body panels; identical backdrop and light; sharp realistic photo.',
        AVOID].join('\n'),
      `GPT Image 2 / Seedream · 16:9 · 2048×1152. Run 6. Screen for: aynı kişi, orta panel başsız, ayaklar kadrajda. Dosya: ${filename(c, 'lock-sheet')}`]);
    out.push(['Kahraman plakası (T1)', 'ONE SHOT · afiş, kapak, karakter tanıtımı',
      ['Create a photorealistic character key art plate: ONE character shown in three panels side by side on a single canvas, separated by clean white gaps, no borders, no text.',
        'PANEL LEFT: tight close-up of the head and upper shoulders, filling the panel, three-quarter angle, looking just past camera.',
        HEADLESS,
        'PANEL RIGHT: full body from behind, head to feet, same pose, showing the back of the costume.',
        `SUBJECT: ${subject(c)}.`,
        `COSTUME: ${wardrobe(c)}; ${prop(c)}. ${cap(c.accent[0])} ${c.accent[1]} appears only on one costume detail.`,
        `SILHOUETTE: ${hook(c)}.`,
        HERO_LIGHT, GRADE(c), CAMERA, REALISM,
        'LOCKS: the same identical person, costume, proportions and lighting in all three panels; the frontal full-body panel has no head — cropped at the collarbones; the close-up panel is the only panel showing the face; feet visible in both full-body panels; no text, no logos, no watermark, no extra characters; not a 3D render, not a video game screenshot, not a plastic or airbrushed look.',
        AVOID].join('\n'),
      `GPT Image 2 / Seedream · 16:9 · 2048×1152. Run 6. Screen for: aynı kişi her panelde, orta panel başsız, ayaklar kadrajda. Dosya: ${filename(c, 'hero-plate')}`]);
    out.push(['Yakın plan portre (T3)', 'Afiş ve küçük resim için',
      [`Photorealistic cinematic close-up of ${c.kind === 'reference' ? 'the same real person as in the reference images' : subject(c)}, head to collarbones, three-quarter angle, ${expr}.`,
        `Visible pores, fine lines, individual eyebrow hairs. Wearing ${wardrobe(c).split(',')[0]}.`,
        HERO_LIGHT.replace('LIGHTING: ', 'LIGHTING: '), GRADE(c),
        'CAMERA: 135mm, shallow depth of field, focus on the near eye.',
        'LOCKS: one person, no text, no logo, not airbrushed.'].join('\n'),
      `4:5 veya 2:3 portre · 1024×1536. Run 6. Screen for: gözler okunur, catchlight var, plastik cilt yok. Dosya: ${filename(c, 'close-up')}`]);
    out.push(['İfade sayfası', 'Altı ifade · aynı kişi',
      [`Six close-up studio photographs of the same ${genderNoun(c)} arranged in a three by two grid on a flat neutral mid-grey backdrop, a film expression sheet, the same real person in all six panels.`,
        `The ${a.en}: ${subject(c)}. Wardrobe collar visible: ${wardrobe(c).split(',')[0]}.`,
        `Expressions, left to right, top to bottom: ${L.expressions.join('; ')}.`,
        'Identical soft directional key light from camera-left in every panel, identical framing head to collarbones, natural skin texture, clean modern digital cinematic capture.',
        'LOCKS: same identity, hair and lighting in all six panels; thin dark dividers; no text.'].join('\n'),
      `Soul 2.0 (Soul ID ile) veya NBP · 3:2 · 2k. Dosya: ${filename(c, 'expressions')}`]);
    out.push(['Poz / aksiyon sayfası', 'Dört an · durumlar, geçişler değil',
      [`Four photographs of the same ${a.en} side by side on a plain mid-grey studio backdrop, an action reference sheet, the same real person in all four panels.`,
        `SUBJECT: ${subject(c)}. OUTFIT: ${wardrobe(c)}.`,
        ...a.actions.slice(0, 4).map((x, i) => `PANEL ${i + 1}: ${x}; both hands clearly visible or deliberately out of frame.`),
        ID_LIGHT,
        'LOCKS: same identity, outfit and proportions in all four panels; full body in frame; no text.',
        AVOID].join('\n'),
      `GPT Image 2 / Seedream · 21:9 veya 16:9. Ellerde bozulma çıkarsa ilgili paneli NBP ile tek tek düzelt. Dosya: ${filename(c, 'poses')}`]);
    out.push(['Referans görselden sheet (T5a)', c.kind === 'reference' ? 'Yarışma için ana yol · resmî referans paketi' : 'İlk sheet’i onayladıktan sonra stil değiştirme',
      ['Using Image 1 as the identity reference, create a three-panel plate of the SAME person.',
        'PANEL LEFT: tight close-up of the head and upper shoulders, three-quarter angle. PANEL CENTRE: full body, front, head to feet. PANEL RIGHT: full body from behind.',
        'PRESERVE EXACTLY from Image 1: facial structure, skin tone and texture, eye shape and colour, hairline and hair, body proportions. Do not redesign, do not idealise, do not clean up.',
        `CHANGE ONLY the wardrobe and presentation: ${wardrobe(c)}; ${prop(c)}. ${HERO_LIGHT.replace('LIGHTING: ', '')}`,
        GRADE(c),
        'LOCKS: the same identical person in all three panels; feet visible in both full-body panels; no text, no logos, no watermark, no extra characters.'].join('\n'),
      'GPT Image 2 (düzenleme modu) veya NBP · 16:9. Image 1 = referans fotoğraf. Yüzü değiştiren bir sonuç gelirse PRESERVE listesini koru, kostümü sadeleştir.']);
    out.push([`Durum varyantı · ${state[1]}`, 'NBP düzenleme · onaylanmış sheet üzerinde',
      [`Edit the image: show the same character ${state[2].split(':')[0]}.`,
        `CHANGE: ${state[2]}.`,
        'PRESERVE EXACTLY:',
        '- face, identity, hair, body proportions',
        `- costume construction, ${c.accent[0]} accent, accessories`,
        '- panel layout, backdrop, lighting, camera angle',
        '- colour grade, palette, contrast, grain',
        `ONLY CHANGE: ${state[1].toLocaleLowerCase('tr')} state. 100% identical otherwise.`].join('\n'),
      `Nano Banana Pro · kaynak: onaylanmış sheet. Dosya: ${filename(c, 'state-' + state[0])}`]);
    return out;
  }

  /* sahneye yerleştirme: mevcut arka plan */
  function placement(c, cur) {
    const s = cur.spec; if (!s) return [];
    const loc = CB.locText(s.cat);
    const act = pick(CB.rng((s.seed ^ 77) >>> 0), arch(c).actions);
    const lm = s.landmarks;
    const safeProp = WEAPON.test(prop(c)) ? '' : `, ${prop(c)}`;
    const still = [
      `${cap(s.camera.en)}, ${s.camera.lens} lens, rule of thirds composition, the figure placed on a third line near ${lm.center}.`,
      `${cap(who(c))}, ${c.kind === 'reference' ? '' : subject(c) + ', '}wearing ${wardrobe(c)}${safeProp}, ${act}.`,
      `Location: ${loc}, ${s.cond.en}. ${cap(lm.left)} on the left, ${lm.right} on the right, ${lm.far} in the distance. ${cap(s.time.en)}; ${s.light.en}. ${cap(s.weather.en)}.`,
      `${CB.GRADES[s.gradeId].en}; palette of 60% ${s.palette.w[0]}, 30% ${s.palette.w[1]}, 10% ${s.palette.w[2]}. ${CB.TECH[s.tech] || CB.TECH.film}.`,
    ].join(' ');
    const comp = [
      `Edit the image: place the ${c.kind === 'reference' ? 'person' : arch(c).en} from Image 1 into the location in Image 2.`,
      `CHANGE: add the ${c.kind === 'reference' ? 'person' : arch(c).en} standing near ${lm.center}, ${act}, scaled to a real human height of about 1.75 metres, feet planted on ${s.floor}, lit by ${s.time.en} from the same direction as the location, with a matching contact shadow.`,
      'PRESERVE EXACTLY:',
      `- the entire location from Image 2: architecture, ${lm.left}, ${lm.right}, ${lm.far}, camera angle, light direction, weather and grade`,
      '- the identity, face, hair and wardrobe from Image 1',
      'ONLY CHANGE: the added figure. 100% identical otherwise.',
    ].join('\n');
    const clip = [
      `@Image1 is the first frame: ${who(c)} in ${loc}. @Image2 is the identity reference; preserve the face, hair and wardrobe from @Image2 exactly.`,
      `${cap(act)}, then ${arch(c).actions[1] ? 'settles into the next small movement and holds the final position' : 'holds the final position'}.`,
      `Camera: one slow ${s.camera.id === 'low' ? 'push-in from the low angle' : 'dolly-in toward the figure'}, rule of thirds.`,
      `Light: same ${s.time.en.split(',')[0]}. Sound: ambient ${s.weather.en.split(',')[0]}. Constraint: no on-screen text, location unchanged.`,
    ].join(' ');
    return [
      ['Sahne karesi · Soul Cinema', `${s.cat.tr} · ${CB.specCode(s)}`, still, `Soul Cinema · Soul ID: ${c.name}. Oran arayüzde. Önce arka plan plakasını üretip referans olarak da verebilirsin.`],
      ['Kompozit · NBP', 'Karakteri hazır arka plana yerleştir', comp, 'Image 1 = karakter sheet’i (veya yakın plan), Image 2 = arka plan plakası. Tek değişiklik: eklenen figür.'],
      ['Klip · Seedance 2.0 (I2V)', 'Sahne karesinden 5–10 sn', clip, 'İlk kare olarak Soul Cinema karesini ver. Silah/yaralanma kelimeleri moderasyon için çıkarıldı.'],
    ];
  }

  /* ---------------- karakter kartı (yapım dosyası görseli) ---------------- */
  function drawFigure(ctx, x, y, h, build, fill, accent, back, headless) {
    const wMul = { lean: 0.9, athletic: 1, 'heavy-set': 1.25, wiry: 0.85, stocky: 1.2, 'tall and lanky': 0.85, 'broad-shouldered': 1.2, petite: 0.85, 'soft and round': 1.25, muscular: 1.15 }[build] || 1;
    const hr = h * 0.065, sw = h * 0.26 * wMul;
    ctx.save(); ctx.fillStyle = fill;
    if (!headless) { ctx.beginPath(); ctx.arc(x, y + hr, hr, 0, Math.PI * 2); ctx.fill(); }
    if (!headless) ctx.fillRect(x - hr * 0.35, y + hr * 1.8, hr * 0.7, hr * 0.6);
    ctx.beginPath();
    ctx.moveTo(x - sw / 2, y + h * 0.17); ctx.lineTo(x + sw / 2, y + h * 0.17);
    ctx.lineTo(x + sw * 0.38, y + h * 0.52); ctx.lineTo(x - sw * 0.38, y + h * 0.52); ctx.closePath(); ctx.fill();
    ctx.fillRect(x - sw / 2 - h * 0.05, y + h * 0.18, h * 0.05, h * 0.33);
    ctx.fillRect(x + sw / 2, y + h * 0.18, h * 0.05, h * 0.33);
    ctx.fillRect(x - sw * 0.36, y + h * 0.52, sw * 0.32, h * 0.46);
    ctx.fillRect(x + sw * 0.04, y + h * 0.52, sw * 0.32, h * 0.46);
    ctx.fillStyle = accent; ctx.fillRect(x - sw * 0.4, y + h * (back ? 0.3 : 0.44), sw * 0.8, h * 0.035);
    ctx.restore();
    if (headless) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(x - sw * 0.7, y + h * 0.17); ctx.lineTo(x + sw * 0.7, y + h * 0.17); ctx.stroke(); ctx.restore();
    }
  }
  function cardCanvas(c, W = 1600, H = 900) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#161412'; ctx.fillRect(0, 0, W, H);
    const pw = W * 0.56, px = 40, py = 40, ph = H - 80;
    ctx.fillStyle = '#7a7670'; ctx.fillRect(px, py, pw, ph);
    const third = pw / 3;
    for (let i = 1; i < 3; i++) { ctx.fillStyle = '#2a2622'; ctx.fillRect(px + third * i - 2, py, 4, ph); }
    const fh = ph * 0.86, fy = py + ph * 0.07;
    drawFigure(ctx, px + third * 0.5, fy, fh, c.build, '#34302b', c.accent[1], false, true);
    drawFigure(ctx, px + third * 1.5, fy, fh, c.build, '#2d2925', c.accent[1], true, false);
    ctx.save(); ctx.fillStyle = '#34302b';
    const cx = px + third * 2.5, cy = py + ph * 0.42;
    ctx.beginPath(); ctx.arc(cx, cy, third * 0.26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - third * 0.45, py + ph); ctx.quadraticCurveTo(cx - third * 0.42, cy + third * 0.38, cx, cy + third * 0.32);
    ctx.quadraticCurveTo(cx + third * 0.42, cy + third * 0.38, cx + third * 0.45, py + ph); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.accent[1]; ctx.fillRect(cx - third * 0.3, py + ph - 26, third * 0.6, 8); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = "600 20px 'IBM Plex Mono', monospace";
    ['ÖN · BAŞSIZ (T1/T4)', 'ARKA', 'YAKIN PLAN'].forEach((t, i) => ctx.fillText(t, px + third * i + 14, py + 26));
    const tx = px + pw + 40, tw = W - tx - 40;
    ctx.fillStyle = c.accent[1]; ctx.fillRect(tx, py, 10, 90);
    ctx.fillStyle = '#ece6dc'; ctx.font = "800 76px 'Big Shoulders Display', 'Arial Narrow', sans-serif"; ctx.textBaseline = 'top';
    ctx.fillText(upperName(c), tx + 26, py);
    ctx.fillStyle = '#f0a04b'; ctx.font = "600 22px 'IBM Plex Mono', monospace";
    ctx.fillText(`${arch(c).tr.toLocaleUpperCase('tr')}${c.kind === 'reference' ? ' · REFERANS KİŞİ' : ''}`, tx + 26, py + 66);
    const lines = c.kind === 'reference'
      ? [['Kimlik', 'Resmî referans paketi + Soul ID'], ['Kostüm', wardrobe(c)], ['Aksesuar', prop(c)], ['Siluet', hook(c)], ['Vurgu', accTxt(c)]]
      : [['Yaş', c.age], ['Yapı', c.build], ['Köken tipi', c.origin], ['Yüz', c.face], ['Saç', `${c.hair}, ${c.hairColor}`], ['Sakal', c.gender === 'man' ? c.beard : '—'], ['İz', c.mark], ['Kostüm', wardrobe(c)], ['Aksesuar', prop(c)], ['Siluet', hook(c)], ['Vurgu', accTxt(c)]];
    let y = py + 130;
    const wrap = (text, maxW) => { const words = text.split(' '); const out = []; let line = ''; words.forEach((w) => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); if (line) out.push(line); return out; };
    lines.forEach(([k, v]) => {
      if (y > H - 70) return;
      ctx.fillStyle = '#8a8076'; ctx.font = "600 16px 'IBM Plex Mono', monospace"; ctx.fillText(k.toLocaleUpperCase('tr'), tx, y);
      ctx.fillStyle = '#ece6dc'; ctx.font = "500 23px 'IBM Plex Sans', Arial, sans-serif";
      const ls = wrap(String(v), tw).slice(0, 2);
      ls.forEach((ln, i) => ctx.fillText(ln, tx, y + 22 + i * 28));
      y += 22 + ls.length * 28 + 14;
    });
    ctx.fillStyle = '#6f665d'; ctx.font = "500 13px 'IBM Plex Mono', monospace";
    ctx.fillText('CineBG Studio · karakter kartı · yapım referansı (AI görseli değil)', 40, H - 28);
    return cv;
  }

  /* ---------------- yarışma planı ---------------- */
  function buildPlan() {
    const C = ST.contest;
    const pool = CB.CONCEPTS.filter((k) => k.f === C.format);
    const r = CB.rng((C.seed * 2654435761) >>> 0);
    const concept = pool.find((k) => k.tr === C.concept) || pick(r, pool);
    const lead = ST.chars.find((c) => c.id === C.lead) || curChar() || ST.chars[0] || null;
    const extGroups = CB.GROUPS.filter((g) => ['ext', 'mixed', 'space', 'sky'].includes(g.ctx) && !g.id.startsWith('ad-')).map((g) => g.id);
    const usedCats = new Set();
    // konsept boyunca tek ışık ve hava: çekimler aynı filmin parçası gibi dursun
    const tId = concept.t || pick(r, ['golden', 'sunset', 'bluehour', 'afternoon', 'overcast', 'moonnight']);
    const wId = concept.w || pick(r, ['clear', 'clear', 'mist', 'afterrain']);
    const gId = concept.g || pick(r, ['blockbuster', 'kodak', 'neonoir', 'epic', 'natural', 'eterna']);
    const INT_T = { golden: 'goldenwin', sunset: 'goldenwin', bluehour: 'moonwin', afternoon: 'morningwin', overcast: 'fluor', moonnight: 'moonwin', darknight: 'lamp', morning: 'morningwin' };
    const INT_W = { clear: 'still', mist: 'motes', afterrain: 'rainwin', rain: 'rainwin', storm: 'rainwin', fog: 'smokeint' };
    const shots = concept.shots.map((sh, i) => {
      const groups = sh.bg.length ? sh.bg : extGroups;
      let cats = CB.CATS.filter((c) => groups.includes(c.group.id) && !usedCats.has(c.id));
      if (!cats.length) cats = CB.CATS.filter((c) => groups.includes(c.group.id));
      const cat = pick(r, cats); usedCats.add(cat.id);
      const seed = (r() * 4294967296) >>> 0;
      const probe = CB.makeSpec(cat, seed, { camera: sh.cam });
      const ov = probe.ctx === 'int' ? { camera: sh.cam, time: INT_T[tId] || '', weather: INT_W[wId] || '', grade: gId } : { camera: sh.cam, time: tId, weather: wId, grade: gId };
      const spec = CB.makeSpec(cat, seed, ov);
      return { i, sh, cat, seed, ov, spec, thumb: '' };
    });
    ST.plan = { concept, lead, shots };
    return ST.plan;
  }
  const P = (c) => (c ? (c.kind === 'reference' ? 'the person from the reference images' : `the ${arch(c).en}`) : 'the lead character');
  const fill = (t, c) => t.replace(/\{P\}/g, P(c));
  const fillTr = (t, c) => t.replace(/\{P\}/g, c ? c.name : 'baş karakter');
  function shotStill(sh, c, aspectId) {
    const s = sh.spec, cam = s.camera;
    const vert = aspectId === '9:16' ? ' Vertical composition, subject centred, headroom above and floor space below.' : aspectId === '1:1' || aspectId === '4:5' ? ' Compact centred composition.' : ' Rule of thirds composition.';
    const outfit = c ? ` Wearing ${wardrobe(c)}.` : '';
    return `${cap(cam.en)}, ${cam.lens} lens.${vert} ${cap(fill(sh.sh.act, c))}.${outfit} Location: ${CB.locText(s.cat)}, ${s.cond.en}. ${cap(s.time.en)}; ${s.light.en}. ${cap(s.weather.en)}. ${CB.GRADES[s.gradeId].en}. ${s.ctx === 'studio' ? CB.TECH.studio : CB.TECH[s.tech]}.`;
  }
  function shotClip(sh, c) {
    const s = sh.spec;
    return `@Image1 is the first frame; preserve the person, wardrobe and location exactly, only motion, light and camera change.${c ? ' @Image2 is the identity reference.' : ''} ${cap(fill(sh.sh.act, c))}, ending on a clear held position. Camera: one ${sh.sh.cam === 'orbit' ? 'slow partial orbit' : sh.sh.cam === 'track' ? 'slow lateral track' : sh.sh.cam === 'low' ? 'slow push-in from low' : 'slow dolly-in'}. Light: same ${s.time.en.split(',')[0]}. Sound: ${sh.sh.snd}. Constraint: no on-screen text; identity and wardrobe unchanged.`;
  }
  function storyboard(plan, c, aspectId) {
    const chunks = [];
    for (let i = 0; i < plan.shots.length; i += 3) chunks.push(plan.shots.slice(i, i + 3));
    return chunks.map((ch, k) => {
      const head = `Generation ${k + 1} of ${chunks.length}. ${c ? (c.kind === 'reference' ? '@Image1 is the identity reference for the person; preserve face, hair and proportions exactly.' : `@Image1 is the identity reference for the ${arch(c).en}.`) : ''} ${aspectId === '9:16' ? 'Vertical frame.' : ''}`.trim();
      const blocks = ch.map((sh, j) => {
        const s = sh.spec;
        const lock = `Same light: ${s.time.en.split(',')[0]}. The person: ${c ? wardrobe(c).split(',').slice(0, 2).join(',') : 'same wardrobe'}, positioned near ${s.landmarks.center}. Camera ${s.camera.lens}.`;
        return `Shot ${j + 1}: ${j === 0 ? 'open on' : 'cut to'} ${CB.locText(s.cat)}, ${s.camera.en.split(',')[0]}. ${cap(fill(sh.sh.act, c))}. Sound: ${sh.sh.snd}. ${lock}`;
      });
      return [head, ...blocks, 'Constraint: no on-screen text, no logos; the person’s identity stays identical across shots.'].join('\n');
    });
  }

  /* ---------------- arayüz ---------------- */
  function select(id, items, cur, onchange) {
    const s = el('select', { id });
    items.forEach(([v, t]) => s.append(el('option', { value: v, text: t })));
    s.value = cur; s.addEventListener('change', () => onchange(s.value));
    return s;
  }
  const field = (label, ctl) => el('div', { class: 'field' }, el('label', { for: ctl.id || '', text: label }), ctl);
  function pcard(t, sub, text, foot) {
    return el('article', { class: 'pcard' },
      el('header', null, el('strong', { text: t }), el('span', { text: sub }), el('span', { class: 'count', text: `${text.split(/\s+/).length} kelime` }),
        el('button', { class: 'btn small', type: 'button', text: 'Kopyala', onclick: () => copy(text, t) })),
      el('pre', { text }), foot ? el('footer', { text: foot }) : null);
  }
  function copy(text, label) {
    const ok = () => CB.app.toast(label + ' kopyalandı');
    try { navigator.clipboard.writeText(text).then(ok, () => fb()); } catch (e) { fb(); }
    function fb() { const ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.append(ta); ta.select(); let k = false; try { k = document.execCommand('copy'); } catch (e) { k = false; } ta.remove(); CB.app.toast(k ? label + ' kopyalandı' : 'Kopyalanamadı. Metni seçip elle kopyala.'); }
  }

  function renderChar() {
    const left = $('chList'), mid = $('chMain'), right = $('chOut');
    left.replaceChildren(
      el('div', { class: 'section' },
        el('h3', { text: 'Karakterler' }),
        el('div', { class: 'row' },
          el('button', { class: 'btn small primary', type: 'button', text: '＋ Rastgele karakter', onclick: () => { const c = randomChar((Math.random() * 4294967296) >>> 0); ST.chars.push(c); ST.cur = c.id; save(); renderChar(); } }),
          el('button', { class: 'btn small', type: 'button', text: '＋ Referans kişi', title: 'Yarışmanın resmî referans paketi için', onclick: () => { const c = referenceChar(); ST.chars.push(c); ST.cur = c.id; save(); renderChar(); } })),
        el('p', { class: 'hint', text: 'Referans kişi: kimlik yalnızca resmî referans görsellerinden ve Soul ID’den gelir. Prompt’lar kişiyi isimle anmaz, yüzünü tarif etmez.' })),
      el('div', { class: 'chlist' }, ...(ST.chars.length ? ST.chars.map((c) => el('button', { type: 'button', class: 'chitem' + (c.id === ST.cur ? ' cur' : ''), onclick: () => { ST.cur = c.id; save(); renderChar(); } },
        el('i', { style: `background:${c.accent[1]}` }), el('b', { text: c.name }), el('span', { text: `${arch(c).tr}${c.kind === 'reference' ? ' · referans' : ''}` }))) : [el('p', { class: 'note', text: 'Henüz karakter yok. "Rastgele karakter" ile başla.' })])));
    const c = curChar();
    if (!c) { mid.replaceChildren(el('p', { class: 'note', text: 'Soldan bir karakter oluştur ya da seç.' })); right.replaceChildren(); return; }
    const upd = (k, v) => { c[k] = v; save(); renderChar(); };
    const a = arch(c);
    const card = cardCanvas(c, 1600, 900); card.className = 'chcard';
    const archOpts = CB.ARCHETYPES.map((x) => [x.id, x.tr]);
    const form = el('div', { class: 'chips' },
      field('Ad', (() => { const i = el('input', { id: 'chName', type: 'text', value: c.name }); i.addEventListener('change', () => upd('name', i.value || 'Karakter')); return i; })()),
      field('Tür', select('chKind', [['original', 'Özgün karakter'], ['reference', 'Referans kişi (yarışma)']], c.kind, (v) => upd('kind', v))),
      field('Arketip / rol', select('chArch', archOpts, c.arch, (v) => { c.arch = v; c.wardrobe = 0; c.prop = 0; c.hook = 0; save(); renderChar(); })),
      field('Kostüm', select('chWard', a.wardrobe.map((w, i) => [String(i), w.slice(0, 60) + (w.length > 60 ? '…' : '')]), String(c.wardrobe % a.wardrobe.length), (v) => upd('wardrobe', +v))),
      field('Aksesuar', select('chProp', a.props.map((w, i) => [String(i), w]), String(c.prop % a.props.length), (v) => upd('prop', +v))),
      field('Siluet imzası', select('chHook', a.hooks.map((w, i) => [String(i), w]), String(c.hook % a.hooks.length), (v) => upd('hook', +v))),
      field('Vurgu rengi', select('chAcc', L.accents.map((x) => [x[1], `${x[0]} ${x[1]}`]), c.accent[1], (v) => upd('accent', L.accents.find((x) => x[1] === v)))));
    const look = c.kind === 'reference' ? el('p', { class: 'note', text: 'Görünüm alanları referans kişide kapalı. Yüz, saç ve beden ölçüleri referans görsellerden alınır. Kostüm, rol, aksesuar ve renk serbest.' }) : el('div', { class: 'chips' },
      field('Cinsiyet', select('chG', L.gender, c.gender, (v) => upd('gender', v))),
      field('Yaş', select('chAge', L.age, c.age, (v) => upd('age', v))),
      field('Yapı', select('chBuild', L.build.map((x) => [x, x]), c.build, (v) => upd('build', v))),
      field('Köken tipi', select('chOrig', L.origin.map((x) => [x, x]), c.origin, (v) => upd('origin', v))),
      field('Yüz', select('chFace', L.face.map((x) => [x, x]), c.face, (v) => upd('face', v))),
      field('Saç', select('chHair', (c.gender === 'woman' ? L.hairW : L.hairM.concat(L.hairW)).map((x) => [x, x]), c.hair, (v) => upd('hair', v))),
      field('Saç rengi', select('chHC', L.hairColor.map((x) => [x, x]), c.hairColor, (v) => upd('hairColor', v))),
      field('Sakal', select('chBeard', L.beard.map((x) => [x, x]), c.beard, (v) => upd('beard', v))),
      field('Ayırt edici iz', select('chMark', L.marks.map((x) => [x, x]), c.mark, (v) => upd('mark', v))));
    mid.replaceChildren(
      el('div', { class: 'section' }, el('h3', null, `${c.name} `, el('span', { class: 'eyebrow', text: a.tr })), card,
        el('div', { class: 'row' },
          el('button', { class: 'btn small', type: 'button', text: 'Görünümü karıştır', onclick: () => { const n = randomChar((Math.random() * 4294967296) >>> 0, c.arch); Object.assign(c, { gender: n.gender, age: n.age, build: n.build, origin: n.origin, face: n.face, hair: n.hair, hairColor: n.hairColor, beard: n.beard, mark: n.mark }); save(); renderChar(); } }),
          el('button', { class: 'btn small', type: 'button', text: 'Kostümü karıştır', onclick: () => { c.wardrobe = Math.floor(Math.random() * a.wardrobe.length); c.prop = Math.floor(Math.random() * a.props.length); c.hook = Math.floor(Math.random() * a.hooks.length); save(); renderChar(); } }),
          el('button', { class: 'btn small', type: 'button', text: 'Kartı PNG indir', onclick: () => cardCanvas(c).toBlob((b) => b && CB.app.saveFile(b, `${upperName(c)}_karakter-karti.png`), 'image/png') }),
          el('button', { class: 'btn small', type: 'button', text: 'Kopya oluştur', onclick: () => { const d = JSON.parse(JSON.stringify(c)); d.id = uid(); d.name = c.name + ' 2'; ST.chars.push(d); ST.cur = d.id; save(); renderChar(); } }),
          el('button', { class: 'btn small', type: 'button', text: 'Sil', onclick: () => { ST.chars = ST.chars.filter((x) => x.id !== c.id); ST.cur = ST.chars[0] ? ST.chars[0].id : null; save(); renderChar(); } }))),
      el('div', { class: 'section' }, el('h3', { text: 'Rol & kostüm' }), form),
      el('div', { class: 'section' }, el('h3', { text: 'Görünüm' }), look),
      el('div', { class: 'section' }, el('h3', { text: 'Notlar' }), (() => { const t = el('textarea', { id: 'chNotes', rows: '3', class: 'notes', placeholder: 'Karakterin hikâyedeki yeri, ses, tavır…' }); t.value = c.notes || ''; t.addEventListener('change', () => { c.notes = t.value; save(); }); return t; })()));
    const cur = CB.app.current();
    right.replaceChildren(
      el('div', { class: 'section' }, el('h3', { text: 'Sheet ayarları' }),
        el('div', { class: 'chips' },
          field('Yakın plan ifadesi', select('chExpr', L.expressions.map((x, i) => [String(i), x]), String(ST.expr), (v) => { ST.expr = +v; renderChar(); })),
          field('Durum varyantı', select('chState', L.states.map((x) => [x[0], x[1]]), ST.state, (v) => { ST.state = v; renderChar(); })))),
      el('div', { class: 'section' }, el('h3', { text: 'Karakter sheet’leri' }), ...sheets(c).map((x) => pcard(...x))),
      el('div', { class: 'section' }, el('h3', { text: 'Sahneye yerleştir' }),
        el('p', { class: 'hint', text: cur.spec ? `Şu anki arka plan: ${cur.spec.cat.tr} (${CB.specCode(cur.spec)}). Değiştirmek için Arka Plan sekmesinde başka bir sahne üret.` : 'Önce Arka Plan sekmesinde bir sahne üret.' }),
        ...placement(c, cur).map((x) => pcard(...x))));
  }

  function renderContest() {
    const C = ST.contest;
    const saveC = () => store.set('contest', C);
    const leadOpts = ST.chars.map((c) => [c.id, `${c.name} · ${arch(c).tr}`]);
    if (!C.lead && ST.chars[0]) C.lead = ST.chars[0].id;
    const plan = buildPlan();
    const lead = plan.lead;
    const conceptOpts = [['', 'Rastgele']].concat(CB.CONCEPTS.filter((k) => k.f === C.format).map((k) => [k.tr, k.tr]));
    const name = C.person.trim() || '[isim]';
    $('ctSet').replaceChildren(
      el('div', { class: 'section' }, el('h3', { text: 'Yarışma kiti' }),
        el('p', { class: 'hint', text: 'Konsept seç, baş karakteri belirle, "Yeni varyasyon" ile arka planları değiştir. Her çekim için görsel ve video promptu hazır gelir.' }),
        field('Format', select('ctFormat', CB.FORMATS, C.format, (v) => { C.format = v; C.concept = ''; saveC(); renderContest(); })),
        field('Konsept', select('ctConcept', conceptOpts, C.concept, (v) => { C.concept = v; saveC(); renderContest(); })),
        field('Baş karakter', leadOpts.length ? select('ctLead', leadOpts, C.lead, (v) => { C.lead = v; saveC(); renderContest(); }) : el('p', { class: 'note', id: 'ctLead', text: 'Karakter sekmesinde bir karakter ya da "Referans kişi" oluştur.' })),
        field('En-boy', select('ctAspect', [['9:16', '9:16 · Reels / TikTok'], ['4:5', '4:5 · Instagram akış'], ['1:1', '1:1'], ['16:9', '16:9 · YouTube']], C.aspect, (v) => { C.aspect = v; saveC(); renderContest(); })),
        field('Paylaşım metnindeki ad (yalnızca açıklama için)', (() => { const i = el('input', { id: 'ctPerson', type: 'text', value: C.person, placeholder: 'ör. kendi adın veya etiketlenecek hesap' }); i.addEventListener('change', () => { C.person = i.value; saveC(); renderContest(); }); return i; })()),
        el('div', { class: 'row' },
          el('button', { class: 'btn primary', type: 'button', text: 'Yeni varyasyon', onclick: () => { C.seed = (C.seed + 1) >>> 0; saveC(); renderContest(); } }),
          el('button', { class: 'btn', type: 'button', text: 'Arka planları projeye ekle', onclick: () => { plan.shots.forEach((s) => CB.app.addShot(s.cat, s.seed, s.ov, `${plan.concept.tr} · ${s.i + 1}`, s.sh.act.replace(/\{P\}/g, lead ? lead.name : 'karakter'), s.thumb)); CB.app.toast(`${plan.shots.length} arka plan projeye eklendi`); } }))),
      el('div', { class: 'section' }, el('h3', { text: 'Kontrol listesi' }),
        el('ul', { class: 'checks' }, ...[
          'Son başvuru: 24 Ekim. Kazananlar: 31 Ekim.',
          'Başvuru yalnızca ana Discord sunucusundaki resmî süreçten.',
          'Gerçek kişi için sadece resmî referans paketini kullan. Kişiyi yanıltıcı ya da itibar zedeleyici gösterme.',
          'İlk 1,5 saniye kanca. Reels için 9:16, 15–30 sn.',
          'Ekran yazılarını videoya değil, kurguda (CapCut) ekle.',
          'Her çekimi önce görsel olarak üret, beğendiğini Seedance’e ilk kare olarak ver.',
          'Yarışma kurallarındaki etiket, hashtag ve yapay zekâ beyanı şartlarını resmî duyurudan doğrula.',
        ].map((t) => el('li', { text: t })))));

    const rows = plan.shots.map((s) => {
      const tr = el('div', { class: 'shotrow' });
      const img = el('img', { alt: s.cat.tr });
      requestAnimationFrame(() => { s.thumb = CB.app.renderThumb(s.cat, s.seed, s.ov, 320, C.aspect === '9:16' ? 568 : C.aspect === '4:5' ? 400 : C.aspect === '1:1' ? 320 : 180); if (s.thumb) img.src = s.thumb; });
      tr.append(el('div', { class: 'shotimg' + (C.aspect === '9:16' ? ' v' : '') }, img),
        el('div', { class: 'meta' },
          el('b', { text: `${s.i + 1}. ${s.cat.tr}` }),
          el('small', { text: `${s.spec.camera.tr} · ${s.spec.time.tr} · ${s.spec.weather.tr} · ${CB.specCode(s.spec)}` }),
          el('p', { text: fillTr(s.sh.act.replace(/\{P\}/g, '{P}'), lead).replace(/\{P\}/g, lead ? lead.name : 'karakter') }),
          s.sh.ost ? el('p', { class: 'ost', text: `Ekran yazısı: "${s.sh.ost}"` }) : null,
          el('p', { class: 'snd', text: `Ses: ${s.sh.snd}` }),
          el('div', { class: 'ctl' },
            el('button', { class: 'btn small', type: 'button', text: 'Görsel promptu', onclick: () => copy(shotStill(s, lead, C.aspect), `Çekim ${s.i + 1} görsel promptu`) }),
            el('button', { class: 'btn small', type: 'button', text: 'Klip promptu', onclick: () => copy(shotClip(s, lead), `Çekim ${s.i + 1} klip promptu`) }),
            el('button', { class: 'btn small', type: 'button', text: 'Arka planı aç', onclick: () => { setView('bg'); CB.app.openBg(s.cat, s.seed, s.ov); } }))));
      return tr;
    });
    $('ctPlan').replaceChildren(
      el('div', { class: 'section' },
        el('h3', null, plan.concept.tr, el('span', { class: 'eyebrow', text: CB.FORMATS.find((f) => f[0] === C.format)[1] })),
        el('p', { class: 'logline', text: fillTr(plan.concept.log, lead) }),
        el('p', { class: 'note', text: `Kanca: ${fillTr(plan.concept.hook, lead)}` }),
        el('p', { class: 'hint', text: `${plan.shots.length} çekim · önerilen süre ${Math.max(6, plan.shots.length * 3)}–${plan.shots.length * 4 + 4} sn · ${C.aspect}` })),
      el('div', { class: 'section shots' }, ...rows));

    const caption = [
      `${fillTr(plan.concept.log, lead)}`,
      '',
      'Bütün setler, kostümler ve kamera hareketleri yapay zekâ ile üretildi. Ekip yok, stüdyo yok, sadece fikir.',
      '',
      `${name} için hazırladım. #Higgsfield #AIfilm #yapayzeka #aivideo #sinematik #kisafilm`,
    ].join('\n');
    const captionEn = [
      `${plan.concept.tr} — made entirely with AI. No crew, no studio, just an idea.`,
      '',
      `Made for ${name}. #Higgsfield #AIfilm #AIvideo #cinematic #shortfilm`,
    ].join('\n');
    const sb = storyboard(plan, lead, C.aspect);
    const doc = [
      `${plan.concept.tr.toLocaleUpperCase('tr')} — yarışma yapım dosyası`,
      `Format: ${CB.FORMATS.find((f) => f[0] === C.format)[1]} · ${C.aspect} · baş karakter: ${lead ? lead.name : '—'}`,
      `Logline: ${fillTr(plan.concept.log, lead)}`,
      `Kanca: ${fillTr(plan.concept.hook, lead)}`, '',
      ...plan.shots.flatMap((s) => [`— ÇEKİM ${s.i + 1}: ${s.cat.tr} (${CB.specCode(s.spec)})`, `Aksiyon: ${s.sh.act.replace(/\{P\}/g, lead ? lead.name : 'karakter')}`, `Ekran yazısı: ${s.sh.ost || '—'} · Ses: ${s.sh.snd}`, `[Görsel · Soul Cinema]\n${shotStill(s, lead, C.aspect)}`, `[Klip · Seedance I2V]\n${shotClip(s, lead)}`, '']),
      '[Seedance storyboard]', ...sb, '', '[Açıklama TR]', caption, '', '[Caption EN]', captionEn,
    ].join('\n');
    $('ctOut').replaceChildren(
      el('div', { class: 'section' }, el('h3', { text: 'Seedance storyboard' }),
        el('p', { class: 'hint', text: 'Her üretimde en fazla 3 çekim (güvenli seviye). Çekim sırası yazılır, saniye yazılmaz. Süre platform ayarıdır.' }),
        ...sb.map((t, i) => pcard(`Üretim ${i + 1}/${sb.length}`, 'Seedance 2.0 · R2V/I2V', t, 'Image 1 = baş karakterin kimlik sheet’i (Soul ID / T4). Ekran yazıları kurguda eklenecek.'))),
      el('div', { class: 'section' }, el('h3', { text: 'Paylaşım metni' }), pcard('Instagram · TR', 'Açıklama', caption, 'Hashtag ve etiket şartlarını resmî duyurudan kontrol et.'), pcard('Instagram · EN', 'Caption', captionEn, '')),
      el('div', { class: 'section' }, el('h3', { text: 'Dışa aktar' }),
        el('div', { class: 'row' },
          el('button', { class: 'btn small primary', type: 'button', text: 'Yapım dosyası TXT', onclick: () => CB.app.saveFile(new Blob([doc], { type: 'text/plain' }), `yarisma_${plan.concept.tr.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-')}.txt`) }),
          el('button', { class: 'btn small', type: 'button', text: 'Tümünü kopyala', onclick: () => copy(doc, 'Yapım dosyası') }))));
  }

  function setView(v) {
    ST.view = v;
    document.getElementById('app').dataset.view = v;
    document.querySelectorAll('#views button').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
    $('studio').hidden = v === 'bg';
    $('chView').hidden = v !== 'char';
    $('ctView').hidden = v !== 'contest';
    if (v === 'char') renderChar();
    if (v === 'contest') renderContest();
    if (v === 'bg') requestAnimationFrame(() => CB.app.redraw());
    store.set('view', v);
  }

  function init() {
    document.querySelectorAll('#views button').forEach((b) => { b.onclick = () => setView(b.dataset.view); });
    if (!ST.chars.length) { const c = randomChar(20261020, 'ceo'); c.name = 'Arda'; ST.chars.push(c); ST.cur = c.id; save(); }
    const v = store.get('view', 'bg');
    setView(['bg', 'char', 'contest'].includes(v) ? v : 'bg');
  }
  CB.studio = { setView, sheets, randomChar };
  init();
})();
