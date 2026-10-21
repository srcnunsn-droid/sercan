/* CineBG Studio — arayüz ve uygulama durumu (v2). */
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
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const newSeed = () => (Math.random() * 4294967296) >>> 0;
  const hexLin = (h) => [1, 3, 5].map((i) => Math.pow(parseInt(h.substr(i, 2), 16) / 255, 2.2));
  const slug = (t) => t.toLowerCase().replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const CTX_TR = { ext: 'Dış mekan', int: 'İç mekan', space: 'Uzay', water: 'Su altı', sky: 'Gökyüzü', abstract: 'Soyut / grafik', studio: 'Stüdyo / reklam seti' };
  const LOOK_KEYS = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'fade', 'shadows', 'highlights', 'bloom', 'threshold', 'flare', 'flareColor', 'halation', 'ca', 'vignette', 'grain', 'grainSize'];
  const lookFrom = (g) => { const o = {}; LOOK_KEYS.forEach((k) => { o[k] = Array.isArray(g[k]) ? g[k].slice() : g[k]; }); return o; };
  const ATMOS_KEYS = [['rain', 'Yağmur'], ['snow', 'Kar'], ['fog', 'Sis'], ['embers', 'Kor & kıvılcım'], ['ash', 'Kül'], ['dust', 'Toz'], ['lightning', 'Şimşek'], ['leak', 'Işık sızıntısı']];
  const TAU = Math.PI * 2;

  /* ---------------- durum ---------------- */
  const S = {
    cat: null, seed: 0, spec: null, prompts: null, visual: null, t: 0, tStart: 0,
    ov: store.get('ov', { time: '', weather: '', camera: '', palette: '', grade: '', impossible: 'auto' }),
    mode: store.get('mode', 'all'), genres: new Set(store.get('genres', [])),
    aspectId: store.get('aspect', '16:9'), res: store.get('res', 2160), fmt: store.get('fmt', 'png'), q: 0.95,
    bars: 0, move: store.get('move', 'pushin'),
    title: store.get('title', { title: '', sub: '', style: 'epic', pos: 'center', on: false }),
    history: [], hIndex: -1, favs: store.get('favs', []), stripMode: 'hist',
    project: store.get('project', { name: '', shots: [] }),
    animating: false, flow: null, batch: [],
  };
  const aspect = () => CB.ASPECTS.find((a) => a.id === S.aspectId) || CB.ASPECTS[0];

  /* ---------------- render ---------------- */
  let R = null, RX = null;
  try { R = new CB.Renderer($('view'), { preserve: true }); } catch (e) { R = null; }
  const exportRenderer = () => { if (!RX) RX = new CB.Renderer(document.createElement('canvas'), { preserve: true }); return RX; };

  function normVisual(v) {
    v.atmos = Object.assign({ rain: 0, snow: 0, fog: 0, embers: 0, ash: 0, dust: 0, lightning: 0, leak: 0 }, v.atmos || {});
    v.frame = Object.assign({ zoom: 1, px: 0, py: 0, roll: 0, mirror: false }, v.frame || {});
    v.move = v.move || S.move;
    return v;
  }
  /* u: 0..1 hareket ilerlemesi */
  function camFor(v, u) {
    let z = v.frame.zoom, x = v.frame.px, y = v.frame.py, roll = v.frame.roll || 0;
    switch (v.move) {
      case 'pushin': z *= 1 + 0.18 * u; break;
      case 'pullout': z *= 1.18 - 0.18 * u; break;
      case 'panleft': z *= 1.12; x += 0.09 - 0.18 * u; break;
      case 'panright': z *= 1.12; x += -0.09 + 0.18 * u; break;
      case 'rise': z *= 1.12; y += -0.07 + 0.14 * u; break;
      case 'drift': z *= 1.06; x += Math.sin(u * TAU) * 0.03; y += Math.sin(u * TAU * 2) * 0.015; roll += Math.sin(u * TAU) * 0.01; break;
      default: break;
    }
    return [v.frame.mirror ? -z : z, x, y, roll];
  }
  /* döngü için git-gel ilerleme (süzülme zaten periyodik) */
  function progress(v, t, period, loop) {
    const f = ((t % period) + period) % period / period;
    if (v.move === 'drift') return f;
    if (loop) return 0.5 - 0.5 * Math.cos(f * TAU);
    return Math.min(1, t / period);
  }
  function rstate(v, seed, u) {
    return {
      engine: v.engine, seedF: (seed % 20000) / 100, params: v.params, linColors: v.colors.flatMap(hexLin),
      look: Object.assign({}, v.look, { bars: S.bars }), atmos: v.atmos, cam: camFor(v, u || 0),
    };
  }

  function layoutFrame() {
    const st = $('stage'), fr = $('frame');
    const a = aspect().r;
    const narrow = window.matchMedia('(max-width: 980px)').matches;
    const cs = getComputedStyle(st);
    const aw = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = narrow ? Math.min(window.innerHeight * 0.62, aw / a) : st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    let w = aw, h = aw / a;
    if (h > ah) { h = ah; w = ah * a; }
    fr.style.width = Math.floor(w) + 'px';
    fr.style.height = Math.floor(h) + 'px';
    layoutTitle(h);
    return { w, h };
  }

  let raf = 0, lastT = 0;
  function draw() {
    if (!R || !S.visual) return;
    const { w, h } = layoutFrame();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const budget = S.animating ? 0.75e6 : 1.8e6;
    let k = dpr; if (w * h * k * k > budget) k = Math.sqrt(budget / (w * h));
    const u = S.animating ? progress(S.visual, S.t - S.tStart, 24, true) : 0;
    try { R.render(rstate(S.visual, S.seed, u), w * k, h * k, S.t); } catch (e) { showFatal(e.message); }
  }
  function requestDraw() { if (!raf) raf = requestAnimationFrame((ts) => { raf = 0; draw(); if (S.animating) tick(ts); }); }
  function tick(ts) {
    if (!S.animating) return;
    const dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
    S.t += dt;
    requestDraw();
  }
  function showFatal(msg) {
    $('frame').replaceChildren(el('div', { class: 'fatal', text: 'Görsel önizleme bu cihazda çalışmıyor (' + msg + '). Prompt üretimi, toplu üretim ve proje dışa aktarımı çalışmaya devam eder.' }));
  }

  /* ---------------- başlık kartı ---------------- */
  const TITLE_FONTS = {
    epic: { t: (h) => `700 ${h * 0.105}px Cinzel, 'Trajan Pro', 'Times New Roman', serif`, ls: 0.08, upper: true },
    cond: { t: (h) => `800 ${h * 0.17}px 'Big Shoulders Display', 'Oswald', 'Arial Narrow', sans-serif`, ls: 0.04, upper: true },
    clean: { t: (h) => `600 ${h * 0.085}px 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif`, ls: 0.0, upper: false },
  };
  const subFont = (h) => `500 ${h * 0.03}px 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif`;
  const titleOn = () => S.title.on && (S.title.title.trim() || S.title.sub.trim());
  function layoutTitle(h) {
    const tc = $('titleCard');
    tc.hidden = !titleOn();
    if (tc.hidden) return;
    const F = TITLE_FONTS[S.title.style] || TITLE_FONTS.epic;
    tc.dataset.pos = S.title.pos;
    const t = $('tcTitle'), s = $('tcSub');
    t.textContent = F.upper ? S.title.title.toLocaleUpperCase('tr') : S.title.title;
    t.style.font = F.t(h); t.style.letterSpacing = F.ls + 'em';
    s.textContent = S.title.sub; s.style.font = subFont(h);
  }
  function drawTitle(ctx, w, h) {
    if (!titleOn()) return;
    const F = TITLE_FONTS[S.title.style] || TITLE_FONTS.epic;
    const pos = S.title.pos;
    const left = pos === 'lowerleft' || pos === 'upperleft';
    const x = left ? w * 0.08 : w / 2;
    ctx.save();
    ctx.textAlign = left ? 'left' : 'center';
    ctx.fillStyle = '#f4efe6';
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = h * 0.025; ctx.shadowOffsetY = h * 0.003;
    const title = F.upper ? S.title.title.toLocaleUpperCase('tr') : S.title.title;
    const sub = S.title.sub.toLocaleUpperCase('tr');
    const th = parseFloat(F.t(h).split(' ')[1]);
    const sh = h * 0.03;
    const block = (title ? th : 0) + (sub ? sh * 1.9 : 0);
    let y0 = pos === 'center' ? (h - block) / 2 : pos === 'upperleft' ? h * 0.1 : h * 0.88 - block;
    ctx.textBaseline = 'top';
    if (title) {
      ctx.font = F.t(h);
      if ('letterSpacing' in ctx) ctx.letterSpacing = F.ls * th + 'px';
      let fs = th; const maxW = w * 0.84;
      while (ctx.measureText(title).width > maxW && fs > 10) { fs *= 0.92; ctx.font = F.t(h).replace(/[\d.]+px/, fs + 'px'); }
      ctx.fillText(title, x, y0); y0 += th;
    }
    if (sub) {
      ctx.font = subFont(h);
      if ('letterSpacing' in ctx) ctx.letterSpacing = 0.3 * sh + 'px';
      ctx.globalAlpha = 0.85;
      ctx.fillText(sub, x, y0 + sh * 0.6);
    }
    ctx.restore();
  }
  function composite(src, w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.drawImage(src, 0, 0, w, h); drawTitle(ctx, w, h);
    return c;
  }

  /* ---------------- sahne yükleme ---------------- */
  function frameFromCamera(cam) {
    const c = cam.cam || [1, 0, 0, 0];
    return { zoom: Math.abs(c[0]), px: c[1], py: c[2], roll: c[3] || 0, mirror: c[0] < 0 };
  }
  function visualFromSpec(s) {
    return normVisual({ engine: s.engine, params: s.params.slice(), colors: s.palette.c.slice(), gradeId: s.gradeId, look: lookFrom(CB.GRADES[s.gradeId]), atmos: Object.assign({}, s.atmos), move: S.move, frame: frameFromCamera(s.camera) });
  }
  function load(cat, seed, push, visual) {
    S.cat = cat; S.seed = seed >>> 0;
    S.spec = CB.makeSpec(cat, S.seed, S.ov);
    S.prompts = CB.prompts(S.spec, aspect());
    S.visual = visual ? normVisual(clone(visual)) : visualFromSpec(S.spec);
    S.t = S.spec.time0; S.tStart = S.t;
    if (push) pushHistory();
    store.set('last', { cat: cat.id, seed: S.seed });
    renderAll();
  }
  function rebuildSpec() {
    S.spec = CB.makeSpec(S.cat, S.seed, S.ov);
    S.prompts = CB.prompts(S.spec, aspect());
    S.visual = visualFromSpec(S.spec);
    renderAll();
  }
  const genreOk = (g) => !S.genres.size || g.genres.some((x) => S.genres.has(x));
  function pool() { const p = CB.CATS.filter((c) => genreOk(c.group)); return p.length ? p : CB.CATS; }
  function chooseCat() {
    if (S.mode === 'cat' && S.cat) return S.cat;
    if (S.mode === 'group' && S.cat) { const cs = S.cat.group.cats.flatMap((c) => [c, ...(c.vars || [])]); return cs[Math.floor(Math.random() * cs.length)]; }
    const p = pool(); return p[Math.floor(Math.random() * p.length)];
  }
  function generate() { load(chooseCat(), newSeed(), true); }

  function thumbOf() {
    try {
      const c = document.createElement('canvas'); const a = aspect().r;
      c.width = 192; c.height = Math.round(192 / Math.max(a, 0.5));
      c.getContext('2d').drawImage($('view'), 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.7);
    } catch (e) { return ''; }
  }
  function entry() { return { cat: S.cat.id, seed: S.seed, ov: clone(S.ov), visual: clone(S.visual), thumb: '' }; }
  function pushHistory() {
    S.history = S.history.slice(0, S.hIndex + 1);
    S.history.push(entry());
    if (S.history.length > 80) S.history.shift();
    S.hIndex = S.history.length - 1;
  }
  function goHistory(d) {
    const i = S.hIndex + d; if (i < 0 || i >= S.history.length) return;
    S.hIndex = i; openEntry(S.history[i], false);
  }
  const CAT_MAP = new Map(CB.CATS.map((c) => [c.id, c]));
  const catById = (id) => CAT_MAP.get(id);
  function openEntry(e, push) {
    const cat = catById(e.cat); if (!cat) return toast('Bu kategori bulunamadı');
    S.ov = clone(e.ov || S.ov); syncOverrides();
    load(cat, e.seed, push, e.visual);
  }

  /* ---------------- katalog ---------------- */
  const openGroups = new Set();
  function renderGenres() {
    $('genres').replaceChildren(...CB.GENRES.map((g) => el('button', {
      type: 'button', class: S.genres.has(g.id) ? 'on' : '', 'aria-pressed': S.genres.has(g.id) ? 'true' : 'false', text: g.tr,
      onclick: () => { S.genres.has(g.id) ? S.genres.delete(g.id) : S.genres.add(g.id); store.set('genres', [...S.genres]); renderGenres(); renderCatalog(); },
    })));
  }
  function renderCatalog() {
    const q = $('search').value.trim().toLocaleLowerCase('tr');
    const box = $('groups'); box.replaceChildren();
    const hit = (c, g) => (c.tr + ' ' + c.en + ' ' + g.tr).toLocaleLowerCase('tr').includes(q);
    const curBase = S.cat ? S.cat.base || S.cat : null;
    const CAP = 700; // çok genel aramalarda DOM'u şişirmemek için
    let shown = 0, drawn = 0;
    const item = (c, cls) => el('li', { class: cls || null }, el('button', { type: 'button', class: S.cat === c ? 'cur' : '', title: c.en, text: cls ? '↳ ' + c.q.tr : c.tr, onclick: () => { load(c, newSeed(), true); } }));
    CB.GROUPS.forEach((g) => {
      if (!genreOk(g)) return;
      const rows = [];
      g.cats.forEach((c) => {
        const vars = c.vars || [];
        const baseHit = !q || hit(c, g);
        const vHits = q ? (baseHit ? vars.filter((v) => hit(v, g) || c === curBase) : vars.filter((v) => hit(v, g))) : c === curBase ? vars : [];
        if (!baseHit && !vHits.length) return;
        rows.push([c, vHits, baseHit]);
        shown += (baseHit ? 1 : 0) + (q ? vHits.length : 0);
      });
      if (!rows.length) return;
      const n = q ? rows.reduce((a, [, v, b]) => a + v.length + (b ? 1 : 0), 0) : g.cats.length * 5;
      const open = q || openGroups.has(g.id);
      const head = el('button', { type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: () => { openGroups.has(g.id) ? openGroups.delete(g.id) : openGroups.add(g.id); renderCatalog(); } },
        el('span', { class: 'chev', text: '▸' }), el('span', { text: g.tr }), el('span', { class: 'n', text: String(n) }));
      const wrap = el('div', { class: 'group' + (open ? ' open' : '') }, head);
      if (open && drawn < CAP) {
        const ul = el('ul');
        rows.forEach(([c, vHits]) => {
          if (drawn >= CAP) return;
          ul.append(item(c)); drawn++;
          vHits.forEach((v) => { ul.append(item(v, 'var')); drawn++; });
        });
        wrap.append(ul);
      }
      box.append(wrap);
    });
    if (!shown) box.append(el('p', { class: 'hint', style: 'padding:14px', text: 'Eşleşen mekan yok. Başka bir kelime dene ya da tür filtresini temizle.' }));
    else if (drawn >= CAP) box.append(el('p', { class: 'hint', style: 'padding:14px', text: `İlk ${CAP} sonuç gösteriliyor. Aramayı daralt.` }));
    const total = q || S.genres.size ? `${shown.toLocaleString('tr-TR')} sonuç` : `${CB.CATS.length.toLocaleString('tr-TR')} kategori · ${CB.GROUPS.length} grup`;
    $('catCount').textContent = total;
  }
  function markCurrent() {
    if (S.cat) openGroups.add(S.cat.group.id);
    renderCatalog();
  }

  /* ---------------- denetçi: prompt ---------------- */
  function fillSelect(sel, items, cur, rnd) {
    sel.replaceChildren();
    if (rnd) sel.append(el('option', { value: '', text: rnd }));
    items.forEach(([v, t]) => sel.append(el('option', { value: v, text: t })));
    sel.value = cur || '';
  }
  const tctxOf = (s) => (s ? (s.ctx === 'sky' ? 'ext' : s.ctx) : 'ext');
  function syncOverrides() {
    const ctx = tctxOf(S.spec);
    fillSelect($('oTime'), CB.TIMES[ctx].map((t) => [t.id, t.tr]), S.ov.time, 'Rastgele');
    fillSelect($('oWeather'), CB.WEATHER[ctx].map((t) => [t.id, t.tr]), S.ov.weather, 'Rastgele');
    fillSelect($('oCamera'), CB.CAMERAS.map((t) => [t.id, t.tr]), S.ov.camera, 'Rastgele');
    fillSelect($('oPalette'), CB.PALETTES.map((t) => [t.id, t.tr]), S.ov.palette, 'Sahneye göre');
    fillSelect($('oGrade'), Object.entries(CB.GRADES).map(([k, g]) => [k, g.tr]), S.ov.grade, 'Sahneye göre');
    $('oImp').value = S.ov.impossible || 'auto';
  }
  function soulAspect(a) {
    const opts = [['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9], ['9:16', 9 / 16], ['3:2', 3 / 2], ['2:3', 2 / 3], ['21:9', 21 / 9]];
    return opts.reduce((b, o) => (Math.abs(Math.log(o[1] / a.r)) < Math.abs(Math.log(b[1] / a.r)) ? o : b))[0];
  }
  function copy(text, label) {
    const done = () => toast(label + ' kopyalandı');
    try { navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, label)); } catch (e) { fallbackCopy(text, label); }
  }
  function fallbackCopy(text, label) {
    const ta = el('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); toast(ok ? label + ' kopyalandı' : 'Kopyalanamadı. Metni seçip elle kopyala.');
  }
  function renderPrompts() {
    const s = S.spec, P = S.prompts, a = aspect();
    $('specCode').textContent = CB.specCode(s);
    const facts = [
      ['Kategori', s.cat.tr], ['Grup', s.group.tr], ['Bağlam', CTX_TR[s.ctx]], ['Saat', s.time.tr], ['Hava', s.weather.tr],
      ['Mevsim', s.season ? s.season.tr : '—'], ['Durum', s.cond.tr], ['Kamera', `${s.camera.tr} · ${s.camera.lens}`], ['Işık', s.light.tr],
      ['Palet', s.palette.tr], ['Grade', CB.GRADES[s.gradeId].tr], ['Yer işaretleri', `Sol: ${s.landmarks.left} · Merkez: ${s.landmarks.center} · Sağ: ${s.landmarks.right} · Uzak: ${s.landmarks.far}`],
      ['Ölçek', s.size ? `~${s.size} m` : s.ctx === 'abstract' ? 'Tam kadraj' : 'Kozmik'], ['İmkansız', s.impossible || '—'],
    ];
    $('facts').replaceChildren(...facts.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })]));
    const cards = [
      ['Higgsfield Soul Cinema', 'Lira mekan şablonu', P.soul, `Ayarlar arayüzde: oran ${soulAspect(a)}, kalite 2k. Oranı prompta yazma. Karakter eklemek için Soul ID kullan.`],
      ['GPT Image 2 · Seedream · NBP', 'ONE SHOT W1 lokasyon plakası', P.oneshot, 'Aynı mekanın başka açıları için aşağıdaki ters açı ve referans sayfası promptlarını kullan.'],
    ];
    if (s.ctx !== 'abstract' && s.ctx !== 'space') {
      cards.push(['Ters açı', 'ONE SHOT W2 · aynı mekan, karşı taraftan', P.reverse, 'Önce W1 karesini üret, sonra bunu referans görselle birlikte kullan. GPT Image 2 açı değişiminde en iyisidir.']);
      cards.push(['Lokasyon referans sayfası', 'ONE SHOT W3 · çok açılı tutarlılık', P.refsheet, 'Aynı mekanı farklı sahnelerde tutarlı tutmak için tek tuval üzerinde 7 panel.']);
    }
    cards.push(['Midjourney v7', 'Kısa form + parametreler', P.mj, `--ar ${a.mj} seçili en-boy oranından geliyor.`]);
    cards.push(['Seedance 2.0 · Kling · Higgsfield Video', '10 sn hareketli arka plan', P.video, 'Önce Soul Cinema karesini üret, ilk kare (I2V) olarak bu promptla canlandır.']);
    cards.push(['Negatif liste', 'Stable Diffusion / Flux', P.negative, 'Soul Cinema ve Seedance negatif alanı kullanmaz. Bu liste yalnızca negatif alanı olan modeller için.']);
    $('prompts').replaceChildren(el('h3', { text: 'Promptlar' }), ...cards.map(([t, sub, text, foot]) => el('article', { class: 'pcard' },
      el('header', null, el('strong', { text: t }), el('span', { text: sub }), el('span', { class: 'count', text: `${text.split(/\s+/).length} kelime · ${text.length} kr` }),
        el('button', { class: 'btn small', type: 'button', text: 'Kopyala', onclick: () => copy(text, t) })),
      el('pre', { text }), el('footer', { text: foot }))));
  }

  /* ---------------- denetçi: görsel ---------------- */
  const LOOK_SLIDERS = [
    ['exposure', 'Pozlama', -2, 2, 0.05], ['contrast', 'Kontrast', 0.6, 1.6, 0.01], ['saturation', 'Doygunluk', 0, 1.6, 0.01],
    ['temperature', 'Sıcaklık', -1, 1, 0.01], ['tint', 'Ton (yeşil↔magenta)', -1, 1, 0.01], ['fade', 'Film solukluğu', 0, 0.6, 0.01],
    ['bloom', 'Bloom', 0, 1.5, 0.01], ['threshold', 'Bloom eşiği', 0.2, 2, 0.01], ['flare', 'Anamorfik flare', 0, 1.5, 0.01],
    ['halation', 'Halation', 0, 1, 0.01], ['ca', 'Kromatik sapma', 0, 1.5, 0.01], ['vignette', 'Vinyet', 0, 1, 0.01],
    ['grain', 'Film greni', 0, 1.2, 0.01], ['grainSize', 'Gren boyutu', 0.5, 3, 0.05],
  ];
  function slider(id, label, min, max, step, val, oninput) {
    const out = el('output', { for: id, text: (+val).toFixed(2) });
    const inp = el('input', { id, type: 'range', min, max, step, value: val });
    inp.addEventListener('input', () => { out.textContent = (+inp.value).toFixed(2); oninput(+inp.value); });
    return el('div', { class: 'slider' }, el('label', { for: id, text: label }), out, inp);
  }
  function renderVisual() {
    const v = S.visual;
    fillSelect($('vEngine'), Object.entries(CB.ENGINES).map(([k, e]) => [k, e.name]), v.engine);
    $('vParams').replaceChildren(...CB.ENGINES[v.engine].params.map((lab, i) => slider('vp' + i, lab, 0, 1, 0.01, v.params[i], (x) => { v.params[i] = x; requestDraw(); })),
      slider('vtime', 'Zaman (kare)', 0, 200, 0.1, S.t % 200, (x) => { S.t = x; S.tStart = x; requestDraw(); }));
    $('vAtmos').replaceChildren(...ATMOS_KEYS.map(([k, lab]) => slider('va_' + k, lab, 0, 1, 0.01, v.atmos[k], (x) => { v.atmos[k] = x; requestDraw(); })));
    $('vFrame').replaceChildren(
      slider('vf_zoom', 'Yakınlaştırma', 0.8, 2.5, 0.01, v.frame.zoom, (x) => { v.frame.zoom = x; requestDraw(); }),
      slider('vf_px', 'Yatay kaydırma', -0.6, 0.6, 0.01, v.frame.px, (x) => { v.frame.px = x; requestDraw(); }),
      slider('vf_py', 'Dikey kaydırma', -0.4, 0.4, 0.01, v.frame.py, (x) => { v.frame.py = x; requestDraw(); }),
      slider('vf_roll', 'Yatırma (dutch)', -0.5, 0.5, 0.01, v.frame.roll, (x) => { v.frame.roll = x; requestDraw(); }));
    $('vMirror').value = v.frame.mirror ? '1' : '0';
    $('vMove').value = v.move;
    fillSelect($('vPalette'), CB.PALETTES.map((p) => [p.id, p.tr]), '', 'Seç…');
    $('vSwatches').replaceChildren(...v.colors.map((c, i) => {
      const lab = ['Derin ton', 'Orta ton', 'Işık', 'Vurgu'][i];
      const inp = el('input', { type: 'color', value: c, 'aria-label': lab, title: lab });
      inp.addEventListener('input', () => { v.colors[i] = inp.value; requestDraw(); });
      return inp;
    }));
    fillSelect($('vGrade'), Object.entries(CB.GRADES).map(([k, g]) => [k, g.tr]), v.gradeId);
    $('vLook').replaceChildren(...LOOK_SLIDERS.map(([k, lab, mn, mx, st]) => slider('vl_' + k, lab, mn, mx, st, v.look[k], (x) => { v.look[k] = x; requestDraw(); })));
  }

  /* ---------------- slate + şerit ---------------- */
  function renderSlate() {
    const s = S.spec;
    $('slate').replaceChildren(
      el('span', { class: 'tag title', text: s.cat.tr }),
      el('span', { class: 'tag code', text: CB.specCode(s) }),
      el('span', { class: 'tag', text: `${s.time.tr} · ${s.weather.tr}` }),
      el('span', { class: 'tag', text: `${s.camera.lens} · ${CB.GRADES[s.gradeId].tr}` }),
    );
    $('slate').hidden = titleOn();
    const fav = isFav();
    $('btnFav').firstChild.textContent = fav ? '★ ' : '☆ ';
    $('btnFav').classList.toggle('on', fav);
  }
  function renderStrip() {
    const box = $('strip'); box.replaceChildren();
    const seg = el('div', { class: 'mode', style: 'flex:none;align-self:center;grid-template-columns:1fr;width:92px' },
      el('button', { type: 'button', class: S.stripMode === 'hist' ? 'on' : '', text: 'Geçmiş', onclick: () => { S.stripMode = 'hist'; renderStrip(); } }),
      el('button', { type: 'button', class: S.stripMode === 'fav' ? 'on' : '', text: `Favoriler ${S.favs.length}`, style: 'border-left:0;border-top:1px solid var(--line-2)', onclick: () => { S.stripMode = 'fav'; renderStrip(); } }));
    box.append(seg);
    const list = S.stripMode === 'hist' ? S.history : S.favs;
    if (!list.length) { box.append(el('span', { class: 'empty', text: S.stripMode === 'hist' ? 'Ürettiğin sahneler burada birikir.' : 'Beğendiğin sahneyi ☆ ile favorilere ekle.' })); return; }
    list.slice().reverse().forEach((e, ri) => {
      const i = list.length - 1 - ri;
      const cat = catById(e.cat);
      const cur = S.stripMode === 'hist' ? i === S.hIndex : (e.cat === S.cat.id && e.seed === S.seed);
      const b = el('button', { type: 'button', class: cur ? 'cur' : '', title: cat ? cat.tr : '', onclick: () => { if (S.stripMode === 'hist') { S.hIndex = i; openEntry(e, false); } else openEntry(e, true); } },
        e.thumb ? el('img', { src: e.thumb, alt: cat ? cat.tr : '' }) : null);
      if (S.favs.some((f) => f.cat === e.cat && f.seed === e.seed)) b.append(el('span', { class: 'fav', text: '★' }));
      box.append(b);
    });
  }
  function isFav() { return S.favs.some((f) => f.cat === S.cat.id && f.seed === S.seed); }
  function toggleFav() {
    if (isFav()) S.favs = S.favs.filter((f) => !(f.cat === S.cat.id && f.seed === S.seed));
    else { const e = entry(); e.thumb = thumbOf(); S.favs.push(e); if (S.favs.length > 150) S.favs.shift(); }
    store.set('favs', S.favs);
    toast(isFav() ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    renderSlate(); renderStrip();
  }

  function renderAll() {
    renderPrompts(); renderVisual(); renderSlate(); markCurrent(); syncOverridesIfCtxChanged();
    draw();
    if (S.hIndex >= 0 && S.history[S.hIndex] && !S.history[S.hIndex].thumb && S.history[S.hIndex].seed === S.seed) S.history[S.hIndex].thumb = thumbOf();
    renderStrip();
    $('btnPrev').disabled = S.hIndex <= 0;
    $('btnNext').disabled = S.hIndex >= S.history.length - 1;
    updateSizeHint();
  }
  let lastCtx = null;
  function syncOverridesIfCtxChanged() {
    const c = tctxOf(S.spec);
    if (c !== lastCtx) { lastCtx = c; syncOverrides(); }
  }

  /* ---------------- dışa aktarma ---------------- */
  let DL = null;
  if (window.claude && typeof window.claude.use === 'function') window.claude.use('downloads').then((d) => { DL = d; }, () => {});
  async function saveFile(blob, name) {
    if (DL) {
      try { await DL.save({ filename: name, data: blob }); toast('Kaydedildi: ' + name); return true; } catch (e) {
        if (e && e.code === 'declined') { toast('İndirme iptal edildi'); return false; }
        if (e && e.code === 'rate_limited') { toast('Önceki indirme onayı bekleniyor'); return false; }
        if (e && e.code === 'too_large') { toast('Dosya çok büyük, daha düşük çözünürlük seç'); return false; }
      }
    }
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
    toast('İndiriliyor: ' + name);
    return true;
  }
  function sizeFor(short, r) {
    let w, h;
    if (r >= 1) { h = short; w = Math.round(short * r / 2) * 2; } else { w = short; h = Math.round(short / r / 2) * 2; }
    const max = R ? R.maxSize : 8192;
    const k = Math.min(1, max / Math.max(w, h));
    return { w: Math.round(w * k / 2) * 2, h: Math.round(h * k / 2) * 2, clamped: k < 1 };
  }
  const exportSize = () => sizeFor(+S.res, aspect().r);
  function updateSizeHint() {
    const { w, h, clamped } = exportSize();
    $('eSize').textContent = `${w} × ${h} piksel` + (clamped ? ' · Bu ekran kartının sınırına göre küçültüldü.' : '') + (titleOn() ? ' · Başlık kartı eklenecek.' : '');
  }
  function busy(msg) { $('busy').hidden = !msg; if (msg) $('busy').replaceChildren(msg); }
  function renderToBlob(v, seed, t, w, h) {
    const X = exportRenderer();
    X.render(rstate(v, seed, 0), w, h, t);
    const src = titleOn() ? composite(X.canvas, w, h) : X.canvas;
    return new Promise((res) => src.toBlob((b) => res(b), 'image/' + S.fmt, +S.q));
  }
  const ext = () => (S.fmt === 'jpeg' ? 'jpg' : S.fmt);
  async function exportImage() {
    if (!R) return toast('Bu cihazda görsel dışa aktarılamıyor');
    const { w, h } = exportSize();
    busy(`Çiziliyor ${w}×${h}…`);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const blob = await renderToBlob(S.visual, S.seed, S.t, w, h);
      exportRenderer().releaseTargets();
      if (!blob) throw new Error('boş çıktı');
      await saveFile(blob, `cinebg_${slug(S.cat.tr)}_${CB.specCode(S.spec)}_${w}x${h}.${ext()}`);
    } catch (e) { toast('Dışa aktarma başarısız: ' + e.message); }
    busy('');
  }

  const fastMp4 = () => typeof window.VideoEncoder !== 'undefined' && typeof window.VideoFrame !== 'undefined' && !!window.Mp4Muxer;
  /* H.264 en uyumlusu; yoksa MP4 içinde VP9 ya da AV1 */
  async function pickCodec(w, h, fps, bitrate) {
    const list = [['avc1.640034', 'avc'], ['avc1.4d0034', 'avc'], ['avc1.640028', 'avc'], ['avc1.42003e', 'avc'], ['vp09.00.51.08', 'vp9'], ['vp09.00.41.08', 'vp9'], ['av01.0.12M.08', 'av1'], ['av01.0.08M.08', 'av1']];
    for (const [codec, mux] of list) {
      try { const r = await VideoEncoder.isConfigSupported({ codec, width: w, height: h, bitrate, framerate: fps }); if (r && r.supported) return { codec, mux }; } catch (e) { /* sıradaki */ }
    }
    return null;
  }
  async function encodeMp4(v, w, h, fps, dur, loop) {
    const bitrate = Math.round(Math.min(60e6, w * h * fps * 0.12));
    const pick = await pickCodec(w, h, fps, bitrate);
    if (!pick) return null;
    const codec = pick.codec;
    const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: pick.mux, width: w, height: h, frameRate: fps }, fastStart: 'in-memory' });
    let err = null;
    const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { err = e; } });
    enc.configure({ codec, width: w, height: h, bitrate, framerate: fps });
    const X = exportRenderer();
    const comp = titleOn() ? composite(X.canvas, w, h) : null;
    const N = Math.round(dur * fps), t0 = loop ? 0 : S.t;
    for (let i = 0; i < N; i++) {
      if (err) throw err;
      const tt = i / fps;
      X.render(rstate(v, S.seed, progress(v, tt, dur, loop)), w, h, t0 + tt, loop ? { length: dur } : null);
      let src = X.canvas;
      if (comp) { const c2 = comp.getContext('2d'); c2.drawImage(X.canvas, 0, 0); drawTitle(c2, w, h); src = comp; }
      const frame = new VideoFrame(src, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();
      while (enc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 2));
      if (i % 5 === 0) { busy(el('span', null, el('span', { class: 'recdot' }), `MP4 ${w}×${h} · kare ${i + 1} / ${N}`)); await new Promise((r) => setTimeout(r, 0)); }
    }
    await enc.flush();
    if (err) throw err;
    muxer.finalize();
    return new Blob([muxer.target.buffer], { type: 'video/mp4' });
  }

  let recording = false;
  async function recordVideo() {
    if (R && !recording && fastMp4()) {
      const dur = +$('vDur').value, loop = $('vLoop').value === '1', fps = +$('vFps').value;
      const { w, h } = sizeFor(+$('vRes').value, aspect().r);
      recording = true; $('btnVideo').classList.add('on');
      try {
        const blob = await encodeMp4(S.visual, w, h, fps, dur, loop);
        if (blob) {
          await saveFile(blob, `cinebg_${slug(S.cat.tr)}_${CB.specCode(S.spec)}_${w}x${h}_${fps}fps_${dur}s.mp4`);
          return;
        }
      } catch (e) { toast('Hızlı MP4 başarısız, gerçek zamanlı kayda geçiliyor'); }
      finally { recording = false; $('btnVideo').classList.remove('on'); busy(''); exportRenderer().releaseTargets(); }
    }
    return recordRealtime();
  }
  async function recordRealtime() {
    if (!R) return toast('Bu cihazda video üretilemiyor');
    if (recording) return;
    if (typeof MediaRecorder === 'undefined') return toast('Bu tarayıcı video kaydını desteklemiyor');
    const dur = +$('vDur').value, loop = $('vLoop').value === '1';
    const { w, h } = sizeFor(Math.min(+$('vRes').value, 1440), aspect().r);
    const X = exportRenderer();
    const v = S.visual;
    X.render(rstate(v, S.seed, 0), w, h, 0, loop ? { length: dur } : null);
    const comp = titleOn() ? composite(X.canvas, w, h) : null;
    const types = ['video/mp4;codecs=avc1.640028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
    const mime = types.find((t) => MediaRecorder.isTypeSupported(t));
    if (!mime) return toast('Video biçimi desteklenmiyor');
    let stream; try { stream = (comp || X.canvas).captureStream(+$('vFps').value); } catch (e) { return toast('Video yakalanamadı'); }
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: h >= 1080 ? 16e6 : 8e6 });
    const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recording = true; $('btnVideo').classList.add('on');
    const t0base = loop ? 0 : S.t;
    const stopped = new Promise((r) => (rec.onstop = r));
    rec.start(250);
    const start = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const tt = (performance.now() - start) / 1000;
        if (tt >= dur) return resolve();
        const u = progress(v, tt, dur, loop);
        X.render(rstate(v, S.seed, u), w, h, t0base + tt, loop ? { length: dur } : null);
        if (comp) { const ctx = comp.getContext('2d'); ctx.drawImage(X.canvas, 0, 0); drawTitle(ctx, w, h); }
        busy(el('span', null, el('span', { class: 'recdot' }), `Kayıt ${tt.toFixed(1)} / ${dur} sn`));
        requestAnimationFrame(step);
      };
      step();
    });
    rec.stop(); await stopped;
    recording = false; $('btnVideo').classList.remove('on'); busy('');
    X.releaseTargets();
    await saveFile(new Blob(chunks, { type: mime.split(';')[0] }), `cinebg_${slug(S.cat.tr)}_${CB.specCode(S.spec)}_${dur}s.${mime.includes('mp4') ? 'mp4' : 'webm'}`);
  }

  /* ---------------- satırlar (CSV/JSON/TXT) ---------------- */
  function rowOf(cat, seed, ov, extra) {
    const spec = CB.makeSpec(cat, seed, ov || S.ov); const p = CB.prompts(spec, aspect());
    return Object.assign(extra || {}, {
      kod: CB.specCode(spec), grup: spec.group.tr, kategori: cat.tr, baglam: CTX_TR[spec.ctx], saat: spec.time.tr, hava: spec.weather.tr,
      kamera: spec.camera.tr, palet: spec.palette.tr, grade: CB.GRADES[spec.gradeId].tr,
      soul_cinema: p.soul, oneshot: p.oneshot, referanstan_aci: p.fromRef, ters_aci: p.reverse, referans_sayfasi: p.refsheet, midjourney: p.mj, video: p.video,
    });
  }
  function toCSV(rows) {
    if (!rows.length) return '';
    const keys = Object.keys(rows[0]);
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    return '﻿' + [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\r\n');
  }
  function toTXT(rows) {
    return rows.map((r, i) => `#${i + 1} ${r.sahne ? r.sahne + ' — ' : ''}${r.varyant ? r.varyant + ' — ' : ''}${r.kod} — ${r.kategori} (${r.grup})\n${r.saat} · ${r.hava} · ${r.kamera} · ${r.grade}${r.not ? '\nNot: ' + r.not : ''}\n\n[Soul Cinema]\n${r.soul_cinema}\n\n[ONE SHOT]\n${r.oneshot}\n\n[Referanstan bu açı · NBP / GPT Image 2]\n${r.referanstan_aci}\n\n[Ters açı]\n${r.ters_aci}\n\n[Midjourney]\n${r.midjourney}\n\n[Video]\n${r.video}\n`).join('\n' + '='.repeat(72) + '\n\n');
  }
  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  async function zipItems(items, label) {
    if (!items.length) return;
    if (!window.JSZip) return toast('ZIP kütüphanesi yüklenemedi. İnternet bağlantısını kontrol et.');
    if (!R) return toast('Bu cihazda görsel üretilemiyor. Promptları CSV/JSON olarak indirebilirsin.');
    const zip = new window.JSZip();
    const { w, h } = exportSize();
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      busy(`ZIP: ${i + 1} / ${items.length} · ${w}×${h}`);
      if (!$('sheet').hidden) { $('sheetInfo').textContent = `ZIP: ${i + 1} / ${items.length} · ${w}×${h}`; $('sheetProg').style.width = ((i + 1) / items.length) * 100 + '%'; }
      await new Promise((r) => setTimeout(r, 0));
      const blob = await renderToBlob(it.visual, it.seed, it.t, w, h);
      if (blob) zip.file(`${String(i + 1).padStart(3, '0')}_${slug(it.name)}_${it.code}.${ext()}`, blob);
    }
    exportRenderer().releaseTargets();
    const rows = items.map((it) => it.row);
    zip.file('promptlar.csv', toCSV(rows));
    zip.file('promptlar.json', JSON.stringify(rows, null, 2));
    zip.file('cekim_listesi.txt', toTXT(rows));
    busy('ZIP paketleniyor…');
    const out = await zip.generateAsync({ type: 'blob' });
    busy('');
    if (!$('sheet').hidden) $('sheetInfo').textContent = `${items.length} sahne hazır`;
    await saveFile(out, `cinebg_${label}_${items.length}_${stamp()}.zip`);
  }

  /* ---------------- toplu üretim ---------------- */
  let batchRun = 0;
  async function runBatch(count, scope) {
    const n = count || +$('bCount').value, sc = scope || $('bScope').value;
    const P = sc === 'cat' ? [S.cat] : sc === 'group' ? S.cat.group.cats : pool();
    const run = ++batchRun;
    S.batch = [];
    $('sheet').hidden = false; $('sheetGrid').replaceChildren();
    $('sheetTitle').textContent = sc === 'cat' ? `Varyasyonlar · ${S.cat.tr}` : `Toplu üretim · ${n} sahne`;
    const a = aspect(); const tw = 320, th = Math.round(320 / Math.max(a.r, 0.6));
    for (let i = 0; i < n; i++) {
      if (run !== batchRun || $('sheet').hidden) return;
      const cat = P[Math.floor(Math.random() * P.length)];
      const seed = newSeed();
      const spec = CB.makeSpec(cat, seed, S.ov);
      const item = { cat, seed, spec, ov: clone(S.ov), visual: visualFromSpec(spec), thumb: '' };
      if (R) {
        try { const X = exportRenderer(); X.render(rstate(item.visual, seed, 0), tw, th, spec.time0); item.thumb = X.canvas.toDataURL('image/jpeg', 0.8); } catch (e) { item.thumb = ''; }
      }
      S.batch.push(item);
      $('sheetGrid').append(el('button', { type: 'button', class: 'tile', onclick: () => { $('sheet').hidden = true; S.ov = clone(item.ov); load(item.cat, item.seed, true, item.visual); syncOverrides(); } },
        el('img', item.thumb ? { src: item.thumb, alt: cat.tr } : { alt: '' }),
        el('div', null, el('b', { text: cat.tr }), el('span', { text: `${CB.specCode(spec)} · ${spec.time.tr} · ${spec.weather.tr}` }))));
      $('sheetProg').style.width = ((i + 1) / n) * 100 + '%';
      $('sheetInfo').textContent = `${i + 1} / ${n}`;
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    if (RX) RX.releaseTargets();
  }
  const batchItems = () => S.batch.map((b) => ({ visual: b.visual, seed: b.seed, t: b.spec.time0, name: b.label ? `${b.cat.tr} ${b.label}` : b.cat.tr, label: b.label || b.cat.tr, code: CB.specCode(b.spec), row: rowOf(b.cat, b.seed, b.ov || S.ov, b.label ? { varyant: b.label } : undefined) }));

  /* ---------------- set üretimi: aynı sahne, farklı açı / saat / hava ---------------- */
  const SET_TR = { angles: 'Açı seti', times: 'Saat seti', weathers: 'Hava seti', variants: 'Varyant seti', grades: 'Film stoğu seti' };
  async function runSet(mode) {
    const run = ++batchRun;
    S.batch = [];
    const ctx = tctxOf(S.spec);
    const bc = S.cat.base || S.cat;
    const variants = mode === 'angles' ? CB.camerasFor(S.spec.ctx).map((c) => ({ key: 'camera', id: c.id, label: c.tr }))
      : mode === 'times' ? CB.TIMES[ctx].map((t) => ({ key: 'time', id: t.id, label: t.tr }))
        : mode === 'variants' ? [bc, ...(bc.vars || [])].map((c) => ({ cat: c, label: c.q ? c.q.tr : 'Temel mekân' }))
          : mode === 'grades' ? Object.entries(CB.GRADES).map(([id, g]) => ({ key: 'grade', id, label: g.tr }))
            : CB.WEATHER[ctx].map((w) => ({ key: 'weather', id: w.id, label: w.tr }));
    $('sheet').hidden = false; $('sheetGrid').replaceChildren();
    $('sheetTitle').textContent = `${SET_TR[mode]} · ${S.cat.tr}`;
    const a = aspect(); const tw = 320, th = Math.round(320 / Math.max(a.r, 0.6));
    const base = clone(S.visual);
    for (let i = 0; i < variants.length; i++) {
      if (run !== batchRun || $('sheet').hidden) return;
      const vr = variants[i];
      const ov = vr.key ? Object.assign({}, S.ov, { [vr.key]: vr.id }) : clone(S.ov);
      const vcat = vr.cat || S.cat;
      const spec = CB.makeSpec(vcat, S.seed, ov);
      let visual;
      if (mode === 'angles') { visual = clone(base); visual.frame = frameFromCamera(spec.camera); }
      else { visual = visualFromSpec(spec); visual.frame = clone(base.frame); visual.move = base.move; }
      if (mode === 'grades') { visual = clone(base); const g = CB.GRADES[vr.id]; visual.look = lookFrom(g); visual.gradeId = vr.id; }
      const item = { cat: vcat, seed: S.seed, spec, ov, visual, label: vr.label, thumb: '' };
      if (R) {
        try { const X = exportRenderer(); X.render(rstate(visual, S.seed, 0), tw, th, spec.time0); item.thumb = X.canvas.toDataURL('image/jpeg', 0.8); } catch (e) { item.thumb = ''; }
      }
      S.batch.push(item);
      $('sheetGrid').append(el('button', { type: 'button', class: 'tile', onclick: () => { $('sheet').hidden = true; S.ov = clone(ov); store.set('ov', S.ov); load(item.cat, item.seed, true, item.visual); syncOverrides(); } },
        el('img', item.thumb ? { src: item.thumb, alt: vr.label } : { alt: '' }),
        el('div', null, el('b', { text: `${i + 1}. ${vr.label}` }), el('span', { text: `${spec.camera.lens} · ${spec.time.tr} · ${spec.weather.tr}` }))));
      $('sheetProg').style.width = ((i + 1) / variants.length) * 100 + '%';
      $('sheetInfo').textContent = `${i + 1} / ${variants.length}`;
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    if (RX) RX.releaseTargets();
  }

  /* kontakt sayfası: setin tamamı tek PNG */
  async function contactSheet() {
    const items = batchItems(); if (!items.length) return;
    if (!R) return toast('Bu cihazda görsel üretilemiyor');
    const a = aspect();
    const cols = items.length <= 4 ? 2 : items.length <= 9 ? 3 : 4;
    const cw = 640, ch = Math.round(cw / Math.max(a.r, 0.6)), pad = 28, lab = 54, head = 110;
    const rowsN = Math.ceil(items.length / cols);
    const W = cols * cw + (cols + 1) * pad, H = head + rowsN * (ch + lab + pad) + pad;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0e0d0c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ece6dc'; ctx.font = "800 46px 'Big Shoulders Display', 'Arial Narrow', sans-serif"; ctx.textBaseline = 'top';
    ctx.fillText($('sheetTitle').textContent.toLocaleUpperCase('tr'), pad, 30);
    ctx.fillStyle = '#f0a04b'; ctx.font = "600 20px 'IBM Plex Mono', monospace";
    ctx.fillText(`${items[0].code} · CineBG Studio · ${new Date().toLocaleDateString('tr-TR')}`, pad, 82);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      busy(`Kontakt sayfası ${i + 1} / ${items.length}`);
      await new Promise((r) => setTimeout(r, 0));
      const X = exportRenderer(); X.render(rstate(it.visual, it.seed, 0), cw, ch, it.t);
      const x = pad + (i % cols) * (cw + pad), y = head + Math.floor(i / cols) * (ch + lab + pad);
      ctx.drawImage(X.canvas, x, y, cw, ch);
      ctx.fillStyle = '#ece6dc'; ctx.font = "600 22px 'IBM Plex Sans', Arial, sans-serif";
      ctx.fillText(`${i + 1}. ${it.label}`, x, y + ch + 10);
      ctx.fillStyle = '#a0968a'; ctx.font = "500 15px 'IBM Plex Mono', monospace";
      ctx.fillText(`${it.row.kamera} · ${it.row.saat} · ${it.row.hava}`, x, y + ch + 36);
    }
    exportRenderer().releaseTargets();
    busy('');
    c.toBlob((b) => b && saveFile(b, `cinebg_kontakt_${slug(S.cat.tr)}_${stamp()}.png`), 'image/png');
  }

  /* ---------------- referans görselden palet ---------------- */
  const NAMED = [['#0b0b0b', 'ink black'], ['#2b2b2b', 'charcoal'], ['#5a5a5a', 'slate grey'], ['#9a9a9a', 'silver grey'], ['#e8e4dc', 'bone white'], ['#ffffff', 'pure white'],
    ['#f2e6d0', 'cream'], ['#d9c3a5', 'sand beige'], ['#a67b5b', 'tan brown'], ['#6b4226', 'chocolate brown'], ['#3d2314', 'dark umber'], ['#c2572f', 'burnt orange'],
    ['#e8873a', 'tangerine'], ['#f4c15d', 'golden yellow'], ['#ffe9a8', 'pale butter'], ['#b5452a', 'rust red'], ['#8b1e2e', 'oxblood'], ['#d7263d', 'crimson'],
    ['#f4a6b8', 'blush pink'], ['#e05b8b', 'rose'], ['#8e3b8f', 'plum'], ['#5a2d82', 'deep violet'], ['#b8a1e6', 'lavender'], ['#1d2a6b', 'navy'],
    ['#2f5bd3', 'cobalt blue'], ['#6fa8dc', 'sky blue'], ['#a8d8f0', 'ice blue'], ['#0f4c5c', 'petrol teal'], ['#22a39f', 'teal'], ['#7fd1c2', 'mint'],
    ['#1e4d2b', 'forest green'], ['#4f7942', 'fern green'], ['#9bbf6b', 'sage'], ['#c9d86a', 'lime'], ['#55603a', 'olive'], ['#d4af37', 'antique gold'], ['#b87333', 'copper']];
  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const rgbHex = (c) => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const nameOf = (rgb) => NAMED.reduce((b, n) => { const q = hexRgb(n[0]); const d = (q[0] - rgb[0]) ** 2 * 0.3 + (q[1] - rgb[1]) ** 2 * 0.59 + (q[2] - rgb[2]) ** 2 * 0.11; return d < b[0] ? [d, n[1]] : b; }, [Infinity, ''])[1];
  function paletteFromImage(img) {
    const c = document.createElement('canvas'); c.width = 96; c.height = 96;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 96, 96);
    const d = ctx.getImageData(0, 0, 96, 96).data; const px = [];
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) px.push([d[i], d[i + 1], d[i + 2]]);
    const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    px.sort((a, b) => lum(a) - lum(b));
    let cent = [0.08, 0.35, 0.65, 0.92].map((q) => px[Math.floor(q * (px.length - 1))].slice());
    for (let it = 0; it < 10; it++) {
      const acc = cent.map(() => [0, 0, 0, 0]);
      px.forEach((p) => { let bi = 0, bd = Infinity; cent.forEach((c2, j) => { const dd = (c2[0] - p[0]) ** 2 + (c2[1] - p[1]) ** 2 + (c2[2] - p[2]) ** 2; if (dd < bd) { bd = dd; bi = j; } }); const a2 = acc[bi]; a2[0] += p[0]; a2[1] += p[1]; a2[2] += p[2]; a2[3]++; });
      cent = cent.map((c2, j) => (acc[j][3] ? acc[j].slice(0, 3).map((x) => x / acc[j][3]) : c2));
    }
    const sat = (p) => Math.max(...p) - Math.min(...p);
    cent.sort((a, b) => lum(a) - lum(b));
    const deep = cent[0], light = cent[3];
    const mid2 = [cent[1], cent[2]].sort((a, b) => sat(b) - sat(a));
    const cols = [deep, mid2[1], light, mid2[0]];
    return { id: 'ref', tr: 'Referans görsel', c: cols.map(rgbHex), w: cols.map(nameOf), tags: [] };
  }
  function applyRefPalette(pal) {
    const i = CB.PALETTES.findIndex((p) => p.id === 'ref');
    if (i >= 0) CB.PALETTES[i] = pal; else CB.PALETTES.push(pal);
    store.set('refPal', pal);
    S.ov.palette = 'ref'; store.set('ov', S.ov);
    rebuildSpec(); syncOverrides();
    $('refInfo').textContent = `Uygulandı: ${pal.w.join(', ')}. "Palet" kilidi "Referans görsel" olarak ayarlandı.`;
    toast('Referans paleti uygulandı');
  }
  function loadRefImage(file) {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { try { applyRefPalette(paletteFromImage(img)); } catch (e) { toast('Görsel okunamadı'); } URL.revokeObjectURL(url); };
    img.onerror = () => { toast('Görsel açılamadı'); URL.revokeObjectURL(url); };
    img.src = url;
  }

  /* ---------------- proje ---------------- */
  function saveProject() { store.set('project', S.project); $('projCount').textContent = String(S.project.shots.length); }
  function shotFrom(cat, seed, ov, visual, thumb) {
    return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: `${cat.tr}`, note: '', cat: cat.id, seed, ov: clone(ov), visual: clone(visual), thumb: thumb || '' };
  }
  function addToProject() {
    S.project.shots.push(shotFrom(S.cat, S.seed, S.ov, S.visual, thumbOf()));
    saveProject(); renderProject();
    toast(`Projeye eklendi · ${S.project.shots.length}. sahne`);
  }
  function renderProject() {
    $('projName').value = S.project.name || '';
    const box = $('projList'); box.replaceChildren();
    if (!S.project.shots.length) {
      box.append(el('p', { class: 'note', text: 'Henüz sahne yok. Beğendiğin sahnede "＋ Projeye ekle" düğmesine bas ya da P tuşunu kullan.' }));
      return;
    }
    const list = el('div', { class: 'proj' });
    S.project.shots.forEach((sh, i) => {
      const cat = catById(sh.cat);
      const move = (d) => { const j = i + d; if (j < 0 || j >= S.project.shots.length) return; const arr = S.project.shots; [arr[i], arr[j]] = [arr[j], arr[i]]; saveProject(); renderProject(); };
      const nameIn = el('input', { type: 'text', value: sh.name, 'aria-label': 'Sahne adı' });
      nameIn.addEventListener('change', () => { sh.name = nameIn.value; saveProject(); });
      const noteIn = el('textarea', { rows: '2', placeholder: 'Not: oyuncu girişi, diyalog, ses…', 'aria-label': 'Sahne notu' });
      noteIn.value = sh.note || '';
      noteIn.addEventListener('change', () => { sh.note = noteIn.value; saveProject(); });
      const open = () => openEntry(sh, true);
      list.append(el('div', { class: 'shot' },
        sh.thumb ? el('img', { src: sh.thumb, alt: sh.name, onclick: open, title: 'Sahneyi aç' }) : el('div', { class: 'noimg', onclick: open }),
        el('div', { class: 'meta' },
          el('div', { class: 'row' }, el('span', { class: 'num', text: String(i + 1).padStart(2, '0') }), nameIn),
          el('small', { text: `${cat ? cat.tr : '?'} · ${cat ? CB.specCode(CB.makeSpec(cat, sh.seed, sh.ov)) : ''}` }),
          noteIn,
          el('div', { class: 'ctl' },
            el('button', { class: 'btn small', type: 'button', text: 'Aç', onclick: open }),
            el('button', { class: 'btn small', type: 'button', text: 'Güncelle', title: 'Bu sahneyi şu anki görüntüyle değiştir', onclick: () => { Object.assign(sh, { cat: S.cat.id, seed: S.seed, ov: clone(S.ov), visual: clone(S.visual), thumb: thumbOf() }); saveProject(); renderProject(); toast('Sahne güncellendi'); } }),
            el('button', { class: 'btn small icon', type: 'button', text: '↑', 'aria-label': 'Yukarı taşı', onclick: () => move(-1) }),
            el('button', { class: 'btn small icon', type: 'button', text: '↓', 'aria-label': 'Aşağı taşı', onclick: () => move(1) }),
            el('button', { class: 'btn small', type: 'button', text: 'Sil', onclick: () => { S.project.shots.splice(i, 1); saveProject(); renderProject(); } })))));
    });
    box.append(list);
  }
  function projectItems() {
    return S.project.shots.map((sh, i) => {
      const cat = catById(sh.cat); if (!cat) return null;
      const spec = CB.makeSpec(cat, sh.seed, sh.ov);
      return { visual: normVisual(clone(sh.visual)), seed: sh.seed, t: spec.time0, name: `${String(i + 1).padStart(2, '0')}_${sh.name}`, code: CB.specCode(spec), row: rowOf(cat, sh.seed, sh.ov, { sahne: `${i + 1}. ${sh.name}`, not: sh.note || '' }) };
    }).filter(Boolean);
  }
  const projSlug = () => slug(S.project.name || 'proje') || 'proje';

  /* ---------------- yedekleme ---------------- */
  function backup() {
    const data = { app: 'cinebg', version: 2, saved: new Date().toISOString(), favs: S.favs, project: S.project };
    saveFile(new Blob([JSON.stringify(data)], { type: 'application/json' }), `cinebg_yedek_${stamp()}.json`);
  }
  function restore(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const d = JSON.parse(fr.result);
        if (d.app !== 'cinebg') throw new Error('CineBG yedeği değil');
        let nf = 0, ns = 0;
        (d.favs || []).forEach((f) => { if (!S.favs.some((x) => x.cat === f.cat && x.seed === f.seed)) { S.favs.push(f); nf++; } });
        (d.project && d.project.shots || []).forEach((sh) => { if (!S.project.shots.some((x) => x.id === sh.id)) { S.project.shots.push(sh); ns++; } });
        if (!S.project.name && d.project && d.project.name) S.project.name = d.project.name;
        store.set('favs', S.favs); saveProject(); renderProject(); renderStrip();
        toast(`Yüklendi: ${nf} favori, ${ns} proje sahnesi`);
      } catch (e) { toast('Yedek okunamadı: ' + e.message); }
    };
    fr.readAsText(file);
  }

  /* ---------------- kod ile aç ---------------- */
  function openCode(code) {
    const m = /^CB-(\d{2})(\d{2})([a-d])?-([0-9A-Z]+)$/i.exec(code.trim());
    if (!m) return toast('Kod biçimi: CB-0103-1A2B3C ya da varyant için CB-0103b-1A2B3C');
    const g = CB.GROUPS[+m[1] - 1]; const b = g && g.cats[+m[2] - 1];
    const c = b && m[3] ? b.vars['abcd'.indexOf(m[3].toLowerCase())] : b;
    if (!c) return toast('Bu koda ait kategori bulunamadı');
    load(c, parseInt(m[4], 36), true);
    toast('Açıldı: ' + c.tr);
  }

  /* ---------------- yardımcılar ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400);
  }
  function setAnim(on) {
    S.animating = on; lastT = 0; S.tStart = S.t;
    $('btnAnim').classList.toggle('on', on);
    $('btnAnim').firstChild.textContent = on ? '❚❚ ' : '▶ ';
    if (on) requestDraw(); else draw();
  }
  function setFlow(on) {
    clearInterval(S.flow); S.flow = null;
    if (on) { S.flow = setInterval(generate, 4000); generate(); }
    $('btnFlow').classList.toggle('on', on);
  }
  function setTab(name) {
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
    ['prompt', 'visual', 'export', 'project'].forEach((n) => { $('pane-' + n).hidden = n !== name; });
    store.set('tab', name);
  }
  function syncTitleInputs() {
    $('tTitle').value = S.title.title; $('tSub').value = S.title.sub; $('tStyle').value = S.title.style; $('tPos').value = S.title.pos; $('tOn').value = S.title.on ? '1' : '0';
  }
  function onTitleChange() {
    S.title = { title: $('tTitle').value, sub: $('tSub').value, style: $('tStyle').value, pos: $('tPos').value, on: $('tOn').value === '1' };
    store.set('title', S.title);
    layoutFrame(); renderSlate(); updateSizeHint();
  }

  /* ---------------- bağlantılar ---------------- */
  function wire() {
    $('btnGen').onclick = generate;
    $('btnPrev').onclick = () => goHistory(-1);
    $('btnNext').onclick = () => goHistory(1);
    $('btnFav').onclick = toggleFav;
    $('btnProj').onclick = addToProject;
    $('btnVar').onclick = () => runBatch(12, 'cat');
    $('btnSet').onclick = () => runSet('angles');
    $('btnSet2').onclick = () => runSet($('setMode').value);
    $('bContact').onclick = contactSheet;
    $('refImg').addEventListener('change', () => { const f = $('refImg').files[0]; if (f) loadRefImage(f); $('refImg').value = ''; });
    $('vMirror').onchange = () => { S.visual.frame.mirror = $('vMirror').value === '1'; requestDraw(); };
    $('btnAnim').onclick = () => setAnim(!S.animating);
    $('btnFlow').onclick = () => setFlow(!S.flow);
    $('btnDl').onclick = exportImage;
    $('btnExport').onclick = exportImage;
    $('btnVideo').onclick = recordVideo;
    $('btnBatch').onclick = () => runBatch();
    $('bClose').onclick = () => { $('sheet').hidden = true; batchRun++; };
    $('bCsv').onclick = () => S.batch.length && saveFile(new Blob([toCSV(batchItems().map((x) => x.row))], { type: 'text/csv' }), `cinebg_promptlar_${stamp()}.csv`);
    $('bJson').onclick = () => S.batch.length && saveFile(new Blob([JSON.stringify(batchItems().map((x) => x.row), null, 2)], { type: 'application/json' }), `cinebg_promptlar_${stamp()}.json`);
    $('bTxt').onclick = () => S.batch.length && saveFile(new Blob([toTXT(batchItems().map((x) => x.row))], { type: 'text/plain' }), `cinebg_promptlar_${stamp()}.txt`);
    $('bZip').onclick = () => zipItems(batchItems(), 'toplu');
    $('bAll2Proj').onclick = () => {
      S.batch.forEach((b) => S.project.shots.push(shotFrom(b.cat, b.seed, S.ov, b.visual, b.thumb)));
      saveProject(); renderProject(); toast(`${S.batch.length} sahne projeye eklendi`);
    };
    $('pCsv').onclick = () => { const it = projectItems(); if (it.length) saveFile(new Blob([toCSV(it.map((x) => x.row))], { type: 'text/csv' }), `cinebg_${projSlug()}_${stamp()}.csv`); };
    $('pTxt').onclick = () => { const it = projectItems(); if (it.length) saveFile(new Blob([`${S.project.name || 'Proje'} — çekim listesi\n\n` + toTXT(it.map((x) => x.row))], { type: 'text/plain' }), `cinebg_${projSlug()}_cekim_listesi.txt`); };
    $('pJson').onclick = () => { const it = projectItems(); if (it.length) saveFile(new Blob([JSON.stringify({ proje: S.project.name, sahneler: it.map((x) => x.row) }, null, 2)], { type: 'application/json' }), `cinebg_${projSlug()}.json`); };
    $('pZip').onclick = () => zipItems(projectItems(), projSlug());
    $('projName').addEventListener('change', () => { S.project.name = $('projName').value; saveProject(); });
    $('btnBackup').onclick = backup;
    $('restoreIn').addEventListener('change', () => { const f = $('restoreIn').files[0]; if (f) restore(f); $('restoreIn').value = ''; });
    ['tTitle', 'tSub'].forEach((id) => $(id).addEventListener('input', onTitleChange));
    ['tStyle', 'tPos', 'tOn'].forEach((id) => $(id).addEventListener('change', onTitleChange));
    $('btnCode').onclick = () => openCode($('codeIn').value);
    $('codeIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') openCode($('codeIn').value); });
    $('btnHelp').onclick = () => { $('help').hidden = false; };
    $('helpClose').onclick = () => { $('help').hidden = true; };
    [$('help'), $('sheet')].forEach((sh) => sh.addEventListener('click', (e) => { if (e.target === sh) { sh.hidden = true; if (sh.id === 'sheet') batchRun++; } }));
    $('search').addEventListener('input', renderCatalog);
    document.querySelectorAll('.mode[role=group] button').forEach((b) => {
      b.classList.toggle('on', b.dataset.mode === S.mode);
      b.onclick = () => { S.mode = b.dataset.mode; store.set('mode', S.mode); document.querySelectorAll('.mode[role=group] button').forEach((x) => x.classList.toggle('on', x === b)); };
    });
    document.querySelectorAll('.tabs button').forEach((b) => { b.onclick = () => setTab(b.dataset.tab); });
    document.querySelectorAll('#mtabs button').forEach((b) => {
      b.onclick = () => { $('app').dataset.m = b.dataset.m; document.querySelectorAll('#mtabs button').forEach((x) => x.classList.toggle('on', x === b)); };
    });
    const ovMap = { oTime: 'time', oWeather: 'weather', oCamera: 'camera', oPalette: 'palette', oGrade: 'grade', oImp: 'impossible' };
    Object.entries(ovMap).forEach(([id, key]) => { $(id).onchange = () => { S.ov[key] = $(id).value; store.set('ov', S.ov); rebuildSpec(); }; });
    $('vEngine').onchange = () => {
      const v = S.visual; v.engine = $('vEngine').value;
      const r = CB.rng(S.seed ^ 0x9e3779b9); v.params = Array.from({ length: 8 }, () => 0.2 + 0.65 * r());
      renderVisual(); draw();
    };
    $('vMove').onchange = () => { S.visual.move = S.move = $('vMove').value; store.set('move', S.move); S.tStart = S.t; requestDraw(); };
    $('vPalette').onchange = () => { const p = CB.PALETTES.find((x) => x.id === $('vPalette').value); if (p) { S.visual.colors = p.c.slice(); renderVisual(); draw(); } };
    // yarı yarıya: kütüphaneden bir palet ya da renk teorisiyle sıfırdan üretilmiş yeni bir palet
    $('btnPalRnd').onclick = () => { const p = Math.random() < 0.5 && CB.randomPalette ? CB.randomPalette((Math.random() * 4294967296) >>> 0) : CB.PALETTES[Math.floor(Math.random() * CB.PALETTES.length)]; S.visual.colors = p.c.slice(); renderVisual(); draw(); toast('Palet: ' + p.tr + (p.id === 'rnd' ? ' · ' + p.w.join(', ') : '')); };
    $('vGrade').onchange = () => { S.visual.gradeId = $('vGrade').value; S.visual.look = lookFrom(CB.GRADES[S.visual.gradeId]); renderVisual(); draw(); };
    $('vBars').onchange = () => { S.bars = +$('vBars').value; draw(); };
    $('vGuides').onchange = () => { $('guides').hidden = $('vGuides').value !== '1'; };
    fillSelect($('eAspect'), CB.ASPECTS.map((a) => [a.id, a.tr]), S.aspectId);
    fillSelect($('eRes'), CB.RESOLUTIONS.map((r) => [String(r.id), r.tr]), String(S.res));
    $('eFmt').value = S.fmt;
    $('eAspect').onchange = () => { S.aspectId = $('eAspect').value; store.set('aspect', S.aspectId); S.prompts = CB.prompts(S.spec, aspect()); renderPrompts(); draw(); updateSizeHint(); };
    $('eRes').onchange = () => { S.res = +$('eRes').value; store.set('res', S.res); updateSizeHint(); };
    $('eFmt').onchange = () => { S.fmt = $('eFmt').value; store.set('fmt', S.fmt); };
    $('eQ').onchange = () => { S.q = +$('eQ').value; };

    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, select, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!$('sheet').hidden || !$('help').hidden) { if (e.key === 'Escape') { $('sheet').hidden = true; $('help').hidden = true; batchRun++; } return; }
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'g') { e.preventDefault(); generate(); }
      else if (k === 'arrowleft') goHistory(-1);
      else if (k === 'arrowright') goHistory(1);
      else if (k === 'f') toggleFav();
      else if (k === 'p') addToProject();
      else if (k === 'v') runBatch(12, 'cat');
      else if (k === 's') runSet('angles');
      else if (k === 'a') setAnim(!S.animating);
      else if (k === 'd') exportImage();
      else if (k === 'c') copy(S.prompts.soul, 'Soul Cinema promptu');
    });
    let rz = 0;
    window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(draw); });
    if (R) R.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showFatal('WebGL bağlamı kaybedildi, sayfayı yenile'); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layoutFrame());
  }

  /* Karakter & Yarışma stüdyosu için dış API */
  CB.app = {
    current: () => ({ cat: S.cat, seed: S.seed, spec: S.spec, prompts: S.prompts, visual: S.visual, ov: clone(S.ov) }),
    aspect, toast, saveFile, thumb: thumbOf, redraw: () => draw(), stamp,
    renderThumb(cat, seed, ov, w, h) {
      if (!R) return '';
      try {
        const spec = CB.makeSpec(cat, seed, Object.assign({}, S.ov, ov || {}));
        const v = visualFromSpec(spec);
        const X = exportRenderer(); X.render(rstate(v, seed, 0), w, h, spec.time0);
        return X.canvas.toDataURL('image/jpeg', 0.82);
      } catch (e) { return ''; }
    },
    openBg(cat, seed, ov) { S.ov = Object.assign({}, S.ov, ov || {}); store.set('ov', S.ov); syncOverrides(); load(cat, seed, true); },
    addShot(cat, seed, ov, name, note, thumb) {
      const spec = CB.makeSpec(cat, seed, Object.assign({}, S.ov, ov || {}));
      const sh = shotFrom(cat, seed, Object.assign({}, S.ov, ov || {}), visualFromSpec(spec), thumb);
      sh.name = name || cat.tr; sh.note = note || '';
      S.project.shots.push(sh); saveProject(); renderProject();
    },
  };

  function init() {
    const combos = CB.combinationCount();
    $('counter').replaceChildren(el('b', { text: CB.CATS.length.toLocaleString('tr-TR') }), ' kategori · ', el('b', { text: Object.keys(CB.ENGINES).length + ' motor' }), ' · ',
      el('b', { text: combos >= 1e12 ? Math.floor(combos / 1e12).toLocaleString('tr-TR') + ' trilyon+' : Math.floor(combos / 1e9).toLocaleString('tr-TR') + ' milyar+' }), ' sahne kurgusu');
    const rp = store.get('refPal', null);
    if (rp && rp.id === 'ref') CB.PALETTES.push(rp);
    wire();
    $('encInfo').textContent = fastMp4() ? 'Hızlı MP4 açık: video gerçek zamanı beklemeden kare kare kodlanır. 4K ve 60 fps desteklenir.' : 'Bu tarayıcıda WebCodecs yok. Video gerçek zamanlı kaydedilir (en fazla 1440p).';
    renderGenres();
    syncTitleInputs();
    saveProject(); renderProject();
    if (!R) showFatal('WebGL2 yok');
    setTab(store.get('tab', 'prompt'));
    const last = store.get('last', null);
    const cat = (last && catById(last.cat)) || CB.CATS[Math.floor(Math.random() * CB.CATS.length)];
    syncOverrides();
    load(cat, last ? last.seed : newSeed(), true);
  }
  init();
})();
