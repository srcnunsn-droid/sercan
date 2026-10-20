/* CineBG Studio — arayüz ve uygulama durumu. */
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
  const CTX_TR = { ext: 'Dış mekan', int: 'İç mekan', space: 'Uzay', water: 'Su altı', sky: 'Gökyüzü' };
  const LOOK_KEYS = ['exposure', 'contrast', 'saturation', 'temperature', 'tint', 'fade', 'shadows', 'highlights', 'bloom', 'threshold', 'flare', 'flareColor', 'halation', 'ca', 'vignette', 'grain', 'grainSize'];
  const lookFrom = (g) => { const o = {}; LOOK_KEYS.forEach((k) => { o[k] = Array.isArray(g[k]) ? g[k].slice() : g[k]; }); return o; };

  /* ---------------- durum ---------------- */
  const S = {
    cat: null, seed: 0, spec: null, prompts: null, visual: null, t: 0,
    ov: store.get('ov', { time: '', weather: '', camera: '', palette: '', grade: '', impossible: 'auto' }),
    mode: store.get('mode', 'all'),
    aspectId: store.get('aspect', '16:9'), res: store.get('res', 2160), fmt: store.get('fmt', 'png'), q: 0.95,
    bars: 0, guides: false,
    history: [], hIndex: -1, favs: store.get('favs', []), stripMode: 'hist',
    animating: false, flow: null, batch: [],
  };
  const aspect = () => CB.ASPECTS.find((a) => a.id === S.aspectId) || CB.ASPECTS[0];

  /* ---------------- render ---------------- */
  let R = null, RX = null;
  try { R = new CB.Renderer($('view'), { preserve: true }); } catch (e) { R = null; }
  const exportRenderer = () => { if (!RX) RX = new CB.Renderer(document.createElement('canvas'), { preserve: true }); return RX; };

  function rstate(v, seed) {
    return { engine: v.engine, seedF: (seed % 20000) / 100, params: v.params, linColors: v.colors.flatMap(hexLin), look: Object.assign({}, v.look, { bars: S.bars }) };
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
    return { w, h };
  }

  let raf = 0, lastT = 0;
  function draw() {
    if (!R || !S.visual) return;
    const { w, h } = layoutFrame();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const budget = S.animating ? 0.75e6 : 1.8e6;
    let k = dpr; if (w * h * k * k > budget) k = Math.sqrt(budget / (w * h));
    try { R.render(rstate(S.visual, S.seed), w * k, h * k, S.t); } catch (e) { showFatal(e.message); }
  }
  function requestDraw() { if (!raf) raf = requestAnimationFrame((ts) => { raf = 0; draw(); if (S.animating) tick(ts); }); }
  function tick(ts) {
    if (!S.animating) return;
    const dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
    S.t += dt;
    requestDraw();
  }
  function showFatal(msg) {
    $('frame').replaceChildren(el('div', { class: 'fatal', text: 'Görsel önizleme bu cihazda çalışmıyor (' + msg + '). Prompt üretimi, toplu üretim ve dışa aktarma promptları çalışmaya devam eder.' }));
  }

  /* ---------------- sahne yükleme ---------------- */
  function visualFromSpec(s) {
    return { engine: s.engine, params: s.params.slice(), colors: s.palette.c.slice(), gradeId: s.gradeId, look: lookFrom(CB.GRADES[s.gradeId]) };
  }
  function load(cat, seed, push, visual) {
    S.cat = cat; S.seed = seed >>> 0;
    S.spec = CB.makeSpec(cat, S.seed, S.ov);
    S.prompts = CB.prompts(S.spec, aspect());
    S.visual = visual ? clone(visual) : visualFromSpec(S.spec);
    S.t = S.spec.time0;
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
  function chooseCat() {
    if (S.mode === 'cat' && S.cat) return S.cat;
    if (S.mode === 'group' && S.cat) { const cs = S.cat.group.cats; return cs[Math.floor(Math.random() * cs.length)]; }
    return CB.CATS[Math.floor(Math.random() * CB.CATS.length)];
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
  function openEntry(e, push) {
    const cat = CB.CATS.find((c) => c.id === e.cat); if (!cat) return;
    S.ov = clone(e.ov); syncOverrides();
    load(cat, e.seed, push, e.visual);
  }

  /* ---------------- katalog ---------------- */
  const openGroups = new Set();
  function renderCatalog() {
    const q = $('search').value.trim().toLocaleLowerCase('tr');
    const box = $('groups'); box.replaceChildren();
    let shown = 0;
    CB.GROUPS.forEach((g) => {
      const cats = q ? g.cats.filter((c) => (c.tr + ' ' + c.en + ' ' + g.tr).toLocaleLowerCase('tr').includes(q)) : g.cats;
      if (!cats.length) return;
      shown += cats.length;
      const open = q || openGroups.has(g.id);
      const head = el('button', { type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: () => { openGroups.has(g.id) ? openGroups.delete(g.id) : openGroups.add(g.id); renderCatalog(); } },
        el('span', { class: 'chev', text: '▸' }), el('span', { text: g.tr }), el('span', { class: 'n', text: String(cats.length) }));
      const wrap = el('div', { class: 'group' + (open ? ' open' : '') }, head);
      if (open) {
        const ul = el('ul');
        cats.forEach((c) => ul.append(el('li', null, el('button', { type: 'button', class: S.cat === c ? 'cur' : '', title: c.en, text: c.tr, onclick: () => { load(c, newSeed(), true); } }))));
        wrap.append(ul);
      }
      box.append(wrap);
    });
    if (!shown) box.append(el('p', { class: 'hint', style: 'padding:14px', text: 'Eşleşen mekan yok. Başka bir kelime dene: "kale", "neon", "siper".' }));
    $('catCount').textContent = q ? `${shown} sonuç` : `${CB.CATS.length} kategori · ${CB.GROUPS.length} grup`;
  }
  function markCurrent() {
    document.querySelectorAll('.group li button.cur').forEach((b) => b.classList.remove('cur'));
    if (S.cat && !openGroups.has(S.cat.group.id) && !$('search').value) { openGroups.add(S.cat.group.id); renderCatalog(); return; }
    renderCatalog();
  }

  /* ---------------- denetçi: prompt ---------------- */
  function fillSelect(sel, items, cur, rnd) {
    sel.replaceChildren();
    if (rnd) sel.append(el('option', { value: '', text: rnd }));
    items.forEach(([v, t]) => sel.append(el('option', { value: v, text: t })));
    sel.value = cur || '';
  }
  function syncOverrides() {
    const ctx = S.spec ? (S.spec.ctx === 'sky' ? 'ext' : S.spec.ctx) : 'ext';
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
    try {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, label));
    } catch (e) { fallbackCopy(text, label); }
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
      ['Ölçek', s.size ? `~${s.size} m` : 'Kozmik'], ['İmkansız', s.impossible || '—'],
    ];
    $('facts').replaceChildren(...facts.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })]));
    const cards = [
      ['Higgsfield Soul Cinema', 'Lira mekan şablonu', P.soul, `Ayarlar arayüzde: oran ${soulAspect(a)}, kalite 2k. Oranı prompta yazma. Karakter eklemek için Soul ID kullan.`],
      ['GPT Image 2 · Seedream · NBP', 'ONE SHOT W1 lokasyon plakası', P.oneshot, 'Ters açı için aynı promptu kullan, SOL ve SAĞ yer işaretlerini yer değiştir ve bunu yaz.'],
      ['Midjourney v7', 'Kısa form + parametreler', P.mj, `--ar ${a.mj} seçili en-boy oranından geliyor.`],
      ['Seedance 2.0 · Kling · Higgsfield Video', '10 sn hareketli arka plan', P.video, 'Önce Soul Cinema karesini üret, ilk kare (I2V) olarak bu promptla canlandır.'],
      ['Negatif liste', 'Stable Diffusion / Flux', P.negative, 'Soul Cinema ve Seedance negatif alanı kullanmaz. Bu liste yalnızca negatif alanı olan modeller için.'],
    ];
    $('prompts').replaceChildren(el('h3', { text: 'Promptlar' }), ...cards.map(([t, sub, text, foot]) => el('article', { class: 'pcard' },
      el('header', null, el('strong', { text: t }), el('span', { text: sub }), el('button', { class: 'btn small', type: 'button', text: 'Kopyala', onclick: () => copy(text, t) })),
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
      slider('vtime', 'Zaman (kare)', 0, 200, 0.1, S.t % 200, (x) => { S.t = x; requestDraw(); }));
    $('vSwatches').replaceChildren(...v.colors.map((c, i) => {
      const inp = el('input', { type: 'color', value: c, 'aria-label': ['Derin ton', 'Orta ton', 'Işık', 'Vurgu'][i], title: ['Derin ton', 'Orta ton', 'Işık', 'Vurgu'][i] });
      inp.addEventListener('input', () => { v.colors[i] = inp.value; requestDraw(); });
      return inp;
    }));
    fillSelect($('vGrade'), Object.entries(CB.GRADES).map(([k, g]) => [k, g.tr]), v.gradeId);
    $('vLook').replaceChildren(...LOOK_SLIDERS.map(([k, lab, mn, mx, st]) => slider('vl_' + k, lab, mn, mx, st, v.look[k], (x) => { v.look[k] = x; requestDraw(); })));
  }

  /* ---------------- sahne üstü slate + şerit ---------------- */
  function renderSlate() {
    const s = S.spec;
    $('slate').replaceChildren(
      el('span', { class: 'tag title', text: s.cat.tr }),
      el('span', { class: 'tag code', text: CB.specCode(s) }),
      el('span', { class: 'tag', text: `${s.time.tr} · ${s.weather.tr}` }),
      el('span', { class: 'tag', text: `${s.camera.lens} · ${CB.GRADES[s.gradeId].tr}` }),
    );
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
      const cat = CB.CATS.find((c) => c.id === e.cat);
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
    else { const e = entry(); e.thumb = thumbOf(); S.favs.push(e); if (S.favs.length > 120) S.favs.shift(); }
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
    const c = S.spec.ctx === 'sky' ? 'ext' : S.spec.ctx;
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
  function exportSize() {
    const a = aspect(); const short = +S.res;
    let w, h;
    if (a.r >= 1) { h = short; w = Math.round(short * a.r / 2) * 2; } else { w = short; h = Math.round(short / a.r / 2) * 2; }
    const max = R ? R.maxSize : 8192;
    const k = Math.min(1, max / Math.max(w, h));
    return { w: Math.round(w * k / 2) * 2, h: Math.round(h * k / 2) * 2, clamped: k < 1 };
  }
  function updateSizeHint() {
    const { w, h, clamped } = exportSize();
    $('eSize').textContent = `${w} × ${h} piksel` + (clamped ? ' · Bu ekran kartının sınırına göre küçültüldü.' : '');
  }
  function busy(msg) { $('busy').hidden = !msg; if (msg) $('busy').replaceChildren(msg); }
  function renderToBlob(v, seed, t, w, h) {
    const X = exportRenderer();
    X.render(rstate(v, seed), w, h, t);
    const mime = 'image/' + S.fmt;
    return new Promise((res) => X.canvas.toBlob((b) => res(b), mime, +S.q));
  }
  async function exportImage() {
    if (!R) return toast('Bu cihazda görsel dışa aktarılamıyor');
    const { w, h } = exportSize();
    busy(`Çiziliyor ${w}×${h}…`);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const blob = await renderToBlob(S.visual, S.seed, S.t, w, h);
      exportRenderer().releaseTargets();
      if (!blob) throw new Error('boş çıktı');
      await saveFile(blob, `cinebg_${slug(S.cat.tr)}_${CB.specCode(S.spec)}_${w}x${h}.${S.fmt === 'jpeg' ? 'jpg' : S.fmt}`);
    } catch (e) { toast('Dışa aktarma başarısız: ' + e.message); }
    busy('');
  }

  let recording = false;
  async function recordVideo() {
    if (!R) return toast('Bu cihazda video üretilemiyor');
    if (recording) return;
    if (typeof MediaRecorder === 'undefined') return toast('Bu tarayıcı video kaydını desteklemiyor');
    const dur = +$('vDur').value, loop = $('vLoop').value === '1';
    const a = aspect(); const short = +$('vRes').value;
    let w, h; if (a.r >= 1) { h = short; w = Math.round(short * a.r / 2) * 2; } else { w = short; h = Math.round(short / a.r / 2) * 2; }
    const X = exportRenderer();
    const st = rstate(S.visual, S.seed);
    X.render(st, w, h, 0, loop ? { length: dur } : null);
    const types = ['video/mp4;codecs=avc1.640028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
    const mime = types.find((t) => MediaRecorder.isTypeSupported(t));
    if (!mime) return toast('Video biçimi desteklenmiyor');
    let stream; try { stream = X.canvas.captureStream(30); } catch (e) { return toast('Video yakalanamadı'); }
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: short >= 1080 ? 16e6 : 8e6 });
    const chunks = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recording = true; $('btnVideo').classList.add('on');
    const t0base = loop ? 0 : S.t;
    const stopped = new Promise((r) => (rec.onstop = r));
    rec.start(250);
    const start = performance.now();
    await new Promise((resolve) => {
      const step = () => {
        const el2 = (performance.now() - start) / 1000;
        if (el2 >= dur) return resolve();
        X.render(st, w, h, t0base + el2, loop ? { length: dur } : null);
        busy(el('span', null, el('span', { class: 'recdot' }), `Kayıt ${el2.toFixed(1)} / ${dur} sn`));
        requestAnimationFrame(step);
      };
      step();
    });
    rec.stop(); await stopped;
    recording = false; $('btnVideo').classList.remove('on'); busy('');
    X.releaseTargets();
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    await saveFile(new Blob(chunks, { type: mime.split(';')[0] }), `cinebg_${slug(S.cat.tr)}_${CB.specCode(S.spec)}_${dur}s.${ext}`);
  }

  /* ---------------- toplu üretim ---------------- */
  let batchRun = 0;
  async function runBatch() {
    const n = +$('bCount').value, scope = $('bScope').value;
    const pool = scope === 'cat' ? [S.cat] : scope === 'group' ? S.cat.group.cats : CB.CATS;
    const run = ++batchRun;
    S.batch = [];
    $('sheet').hidden = false; $('sheetGrid').replaceChildren();
    $('sheetTitle').textContent = `Toplu üretim · ${n} sahne`;
    const a = aspect(); const tw = 320, th = Math.round(320 / Math.max(a.r, 0.6));
    for (let i = 0; i < n; i++) {
      if (run !== batchRun || $('sheet').hidden) return;
      const cat = pool[Math.floor(Math.random() * pool.length)];
      const seed = newSeed();
      const spec = CB.makeSpec(cat, seed, S.ov);
      const item = { cat, seed, spec, prompts: CB.prompts(spec, a), visual: visualFromSpec(spec), thumb: '' };
      if (R) {
        try {
          const X = exportRenderer(); X.render(rstate(item.visual, seed), tw, th, spec.time0);
          item.thumb = X.canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) { item.thumb = ''; }
      }
      S.batch.push(item);
      $('sheetGrid').append(el('button', { type: 'button', class: 'tile', onclick: () => { $('sheet').hidden = true; load(item.cat, item.seed, true, item.visual); } },
        item.thumb ? el('img', { src: item.thumb, alt: cat.tr }) : el('img', { alt: '' }),
        el('div', null, el('b', { text: cat.tr }), el('span', { text: `${CB.specCode(spec)} · ${spec.time.tr} · ${spec.weather.tr}` }))));
      $('sheetProg').style.width = ((i + 1) / n) * 100 + '%';
      $('sheetInfo').textContent = `${i + 1} / ${n}`;
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    if (RX) RX.releaseTargets();
  }
  function batchRows() {
    return S.batch.map((b) => ({
      kod: CB.specCode(b.spec), grup: b.spec.group.tr, kategori: b.cat.tr, baglam: CTX_TR[b.spec.ctx], saat: b.spec.time.tr, hava: b.spec.weather.tr,
      kamera: b.spec.camera.tr, palet: b.spec.palette.tr, grade: CB.GRADES[b.spec.gradeId].tr,
      soul_cinema: b.prompts.soul, oneshot: b.prompts.oneshot, midjourney: b.prompts.mj, video: b.prompts.video,
    }));
  }
  function toCSV(rows) {
    if (!rows.length) return '';
    const keys = Object.keys(rows[0]);
    const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    return '﻿' + [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\r\n');
  }
  function toTXT(rows) {
    return rows.map((r, i) => `#${i + 1} ${r.kod} — ${r.kategori} (${r.grup})\n${r.saat} · ${r.hava} · ${r.kamera} · ${r.grade}\n\n[Soul Cinema]\n${r.soul_cinema}\n\n[ONE SHOT]\n${r.oneshot}\n\n[Midjourney]\n${r.midjourney}\n\n[Video]\n${r.video}\n`).join('\n' + '='.repeat(72) + '\n\n');
  }
  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  async function batchZip() {
    if (!S.batch.length) return;
    if (!window.JSZip) return toast('ZIP kütüphanesi yüklenemedi. İnternet bağlantısını kontrol et.');
    if (!R) return toast('Bu cihazda görsel üretilemiyor. Promptları CSV/JSON olarak indirebilirsin.');
    const zip = new window.JSZip();
    const { w, h } = exportSize();
    const ext = S.fmt === 'jpeg' ? 'jpg' : S.fmt;
    for (let i = 0; i < S.batch.length; i++) {
      const b = S.batch[i];
      $('sheetInfo').textContent = `ZIP: ${i + 1} / ${S.batch.length} · ${w}×${h}`;
      $('sheetProg').style.width = ((i + 1) / S.batch.length) * 100 + '%';
      await new Promise((r) => setTimeout(r, 0));
      const blob = await renderToBlob(b.visual, b.seed, b.spec.time0, w, h);
      if (blob) zip.file(`${String(i + 1).padStart(3, '0')}_${slug(b.cat.tr)}_${CB.specCode(b.spec)}.${ext}`, blob);
    }
    exportRenderer().releaseTargets();
    const rows = batchRows();
    zip.file('promptlar.csv', toCSV(rows));
    zip.file('promptlar.json', JSON.stringify(rows, null, 2));
    $('sheetInfo').textContent = 'ZIP paketleniyor…';
    const out = await zip.generateAsync({ type: 'blob' });
    $('sheetInfo').textContent = `${S.batch.length} sahne hazır`;
    await saveFile(out, `cinebg_toplu_${S.batch.length}_${stamp()}.zip`);
  }

  /* ---------------- kod ile aç ---------------- */
  function openCode(code) {
    const m = /^CB-(\d{2})(\d{2})-([0-9A-Z]+)$/i.exec(code.trim());
    if (!m) return toast('Kod biçimi: CB-0103-1A2B3C');
    const g = CB.GROUPS[+m[1] - 1]; const c = g && g.cats[+m[2] - 1];
    if (!c) return toast('Bu koda ait kategori bulunamadı');
    load(c, parseInt(m[3], 36), true);
    toast('Açıldı: ' + c.tr);
  }

  /* ---------------- yardımcılar ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function setAnim(on) {
    S.animating = on; lastT = 0;
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
    ['prompt', 'visual', 'export'].forEach((n) => { $('pane-' + n).hidden = n !== name; });
    store.set('tab', name);
  }

  /* ---------------- bağlantılar ---------------- */
  function wire() {
    $('btnGen').onclick = generate;
    $('btnPrev').onclick = () => goHistory(-1);
    $('btnNext').onclick = () => goHistory(1);
    $('btnFav').onclick = toggleFav;
    $('btnAnim').onclick = () => setAnim(!S.animating);
    $('btnFlow').onclick = () => setFlow(!S.flow);
    $('btnDl').onclick = exportImage;
    $('btnExport').onclick = exportImage;
    $('btnVideo').onclick = recordVideo;
    $('btnBatch').onclick = runBatch;
    $('bClose').onclick = () => { $('sheet').hidden = true; batchRun++; };
    $('bCsv').onclick = () => S.batch.length && saveFile(new Blob([toCSV(batchRows())], { type: 'text/csv' }), `cinebg_promptlar_${stamp()}.csv`);
    $('bJson').onclick = () => S.batch.length && saveFile(new Blob([JSON.stringify(batchRows(), null, 2)], { type: 'application/json' }), `cinebg_promptlar_${stamp()}.json`);
    $('bTxt').onclick = () => S.batch.length && saveFile(new Blob([toTXT(batchRows())], { type: 'text/plain' }), `cinebg_promptlar_${stamp()}.txt`);
    $('bZip').onclick = batchZip;
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
      else if (k === 'a') setAnim(!S.animating);
      else if (k === 'd') exportImage();
      else if (k === 'c') copy(S.prompts.soul, 'Soul Cinema promptu');
    });
    let rz = 0;
    window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(draw); });
    if (R) R.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showFatal('WebGL bağlamı kaybedildi, sayfayı yenile'); });
  }

  function init() {
    const combos = CB.combinationCount();
    $('counter').replaceChildren(el('b', { text: CB.CATS.length.toLocaleString('tr-TR') }), ' kategori · ', el('b', { text: Math.floor(combos / 1e9).toLocaleString('tr-TR') + ' milyar+' }), ' sahne kurgusu · sınırsız seed');
    wire();
    if (!R) showFatal('WebGL2 yok');
    setTab(store.get('tab', 'prompt'));
    const last = store.get('last', null);
    const cat = (last && CB.CATS.find((c) => c.id === last.cat)) || CB.CATS[Math.floor(Math.random() * CB.CATS.length)];
    syncOverrides();
    load(cat, last ? last.seed : newSeed(), true);
  }
  init();
})();
