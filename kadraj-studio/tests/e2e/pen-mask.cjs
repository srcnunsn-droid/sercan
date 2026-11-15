// Kalem (bezier) maskesi: motor (mod/feather/genişletme/dönüşüm/parenting/yol keyframe), kalem aracı UI, undo, ayar katmanı, Yönetmen, görsel mod, MP4
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 } });
  const errs = []; pg.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message); }); pg.on('console', m => { if (m.type() === 'error') { errs.push(m.text()); console.log('ERR', m.text().slice(0, 200)); } });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  // ---------- 1) MOTOR ----------
  const eng = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip } = await import('/src/util.ts'); const R = await import('/src/engine/render.ts'); const MK = await import('/src/engine/masks.ts'); const A = await import('/src/actions.ts');
    S().replace(newProject('mask')); const V = S().project.tracks.filter(t => t.kind === 'video').map(t => t.id);
    const sol = newClip(V[2], 'solid', 0, 4, { name: 'beyaz', color: '#ffffff' }); S().set(d => { d.clips.push(sol); });
    const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const x = cv.getContext('2d', { willReadFrequently: true });
    const px = (X, Y, t = 0) => { R.renderFrame(x, S().project, t, 1); return x.getImageData(X + 960, Y + 540, 1, 1).data[0]; }; // merkez orijinli proje koordinatı → kırmızı kanal
    const M = fn => S().set(d => { fn(d.clips.find(k => k.id === sol.id)); });
    const out = {};
    M(c => { c.masks = [MK.rectMask(400, 400)]; });
    out.rect = { in: px(0, 0), edgeIn: px(190, 0), out: px(210, 0), far: px(700, 300) };
    M(c => { c.masks[0].invert = true; }); out.invert = { in: px(0, 0), out: px(700, 300) }; M(c => { c.masks[0].invert = false; });
    M(c => { c.masks[0].feather = 40; }); out.feather = { center: px(0, 0), edge: px(200, 0), inside: px(150, 0), outside: px(250, 0), far: px(360, 0) }; M(c => { c.masks[0].feather = 0; });
    M(c => { c.masks[0].expand = 50; }); out.expandPlus = { a: px(240, 0), b: px(260, 0) };
    M(c => { c.masks[0].expand = -50; }); out.expandMinus = { a: px(140, 0), b: px(160, 0) }; M(c => { c.masks[0].expand = 0; });
    M(c => { c.masks[0].opacity = 0.5; }); out.opacity = px(0, 0); M(c => { c.masks[0].opacity = 1; });
    // modlar: ikinci maske (elips r=150, merkez 200,0)
    M(c => { const e = MK.ellipseMask(300, 300, 2); e.pts.forEach(p => { p.x += 200; }); c.masks.push(e); });
    const modes = {}; for (const mode of ['add', 'subtract', 'intersect']) { M(c => { c.masks[1].mode = mode; }); modes[mode] = { onlyRect: px(-150, 0), both: px(150, 0), onlyEll: px(300, 0) }; } out.modes = modes;
    M(c => { c.masks.pop(); c.masks[0].mode = 'subtract'; }); out.firstSubtract = { in: px(0, 0), out: px(700, 300) }; M(c => { c.masks[0].mode = 'add'; });
    M(c => { c.masks[0].on = false; }); out.off = px(700, 300); M(c => { c.masks[0].on = true; c.masks[0].closed = false; }); out.openIgnored = px(700, 300); M(c => { c.masks[0].closed = true; });
    // dönüşüm: maske katmanla taşınır/döner/ölçeklenir
    M(c => { c.base.x = 500; }); out.moved = { old: px(0, 0), neu: px(500, 0) };
    M(c => { c.base.x = 0; c.base.scale = 2; }); out.scaled = { a: px(380, 0), b: px(420, 0) };
    M(c => { c.base.scale = 1; c.base.rotation = 45; }); out.rotated = { corner: px(190, 190), tip: px(270, 0) }; M(c => { c.base.rotation = 0; });
    // parenting
    const nul = A.addNullObject(); S().set(d => { d.clips.find(k => k.id === nul.id).base.x = 300; }); M(c => { c.parent = nul.id; }); out.parented = { old: px(-150, 0), neu: px(450, 0) }; M(c => { delete c.parent; }); S().set(d => { d.clips = d.clips.filter(k => k.kind !== 'null'); });
    // yol keyframe'leri: 0 sn'de 400'lük kare → 2 sn'de 800'lük kare (doğrusal)
    M(c => { const m = c.masks[0]; m.kf = [{ t: 0, pts: MK.rectMask(400, 400).pts, e: 'linear' }, { t: 2, pts: MK.rectMask(800, 800).pts, e: 'linear' }]; });
    const c0 = () => S().project.clips.find(k => k.id === sol.id);
    out.kfHalfW = [0, 1, 2, 3].map(t => Math.round(MK.maskPtsAt(c0().masks[0], t)[1].x));
    out.kfRender = { t0: px(250, 0, 0), t1in: px(290, 0, 1), t1out: px(310, 0, 1), t2: px(390, 0, 2) };
    // bölme: ikinci parçada yol keyframe'leri kayar, görüntü süreklidir
    S().ui({ selected: [sol.id], time: 1 }); A.splitSelected(); const second = S().project.clips.find(k => k.id !== sol.id && k.kind === 'solid');
    out.split = { keysT: second.masks[0].kf.map(k => k.t), at1_5in: px(340, 0, 1.5), at1_5out: px(360, 0, 1.5) };
    S().set(d => { d.clips = d.clips.filter(k => k.id === sol.id); const c = d.clips[0]; c.duration = 4; delete c.masks[0].kf; });
    // tuvalden taşan maske + feather: tuval kenarı solmamalı
    M(c => { c.masks = [{ ...MK.rectMask(3000, 3000), feather: 120 }]; }); out.bigFeatherEdge = [px(-959, 0), px(958, -539)];
    // ayar katmanı + maske: yalnız maskenin içi etkilenir
    M(c => { delete c.masks; c.color = '#ff0000'; });
    const { makeEffect } = await import('/src/engine/presets.ts'); const adj = A.addAdjustmentLayer();
    S().set(d => { const a = d.clips.find(k => k.kind === 'adjust'); a.start = 0; a.duration = 4; a.effects = [makeEffect('grayscale', { v: 1 })]; a.masks = [MK.ellipseMask(400, 400)]; });
    R.renderFrame(x, S().project, 0.5, 1); const g = (X, Y) => [...x.getImageData(X + 960, Y + 540, 1, 1).data.slice(0, 3)];
    out.adjust = { inside: g(0, 0), outside: g(600, 0) }; void adj;
    // süre
    S().set(d => { d.clips = d.clips.filter(k => k.kind !== 'adjust'); const c = d.clips[0]; c.masks = [{ ...MK.ellipseMask(600, 600), feather: 60 }]; });
    const t0 = performance.now(); for (let i = 0; i < 10; i++) R.renderFrame(x, S().project, 0.5, 1); out.msPerFrame1080pFeather60 = Math.round((performance.now() - t0) / 10);
    return out;
  });
  console.log('ENGINE', JSON.stringify(eng));
  // ---------- 2) KALEM ARACI (gerçek fare) ----------
  await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip } = await import('/src/util.ts');
    S().replace(newProject('pen')); const V = S().project.tracks.filter(t => t.kind === 'video').map(t => t.id);
    const sol = newClip(V[2], 'solid', 0, 4, { name: 'beyaz', color: '#ffffff' }); S().set(d => { d.clips.push(sol); }); S().ui({ panel: 'editor', selected: [sol.id], time: 0 });
  });
  await pg.waitForTimeout(500);
  const box = await pg.locator('.viewport canvas').boundingBox();
  const P = (x, y) => [box.x + ((x + 960) / 1920) * box.width, box.y + ((y + 540) / 1080) * box.height]; // proje → ekran
  const st = () => pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const s = S(); const c = s.project.clips.find(k => k.kind === 'solid'); return { tool: s.tool, maskPt: s.maskPt, masks: (c.masks ?? []).map(m => ({ closed: m.closed, n: m.pts.length, kf: (m.kf ?? []).map(k => +k.t.toFixed(2)), pts: m.pts.map(p => [Math.round(p.x), Math.round(p.y), Math.round(p.ox), Math.round(p.oy), Math.round(p.ix), Math.round(p.iy)]) })) }; });
  const pxAt = (x, y, t) => pg.evaluate(async ([x, y, t]) => { const { S } = await import('/src/store.ts'); const R = await import('/src/engine/render.ts'); const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const c = cv.getContext('2d', { willReadFrequently: true }); R.renderFrame(c, S().project, t ?? S().time, 1); return c.getImageData(x + 960, y + 540, 1, 1).data[0]; }, [x, y, t]);
  const click = async (x, y, o) => { const [a, c] = P(x, y); await pg.mouse.click(a, c, o); await pg.waitForTimeout(60); };
  const dragTo = async (x0, y0, x1, y1, o = {}) => { const [a, c] = P(x0, y0), [d, e] = P(x1, y1); if (o.alt) await pg.keyboard.down('Alt'); await pg.mouse.move(a, c); await pg.mouse.down(); await pg.mouse.move((a + d) / 2, (c + e) / 2, { steps: 4 }); await pg.mouse.move(d, e, { steps: 4 }); await pg.mouse.up(); if (o.alt) await pg.keyboard.up('Alt'); await pg.waitForTimeout(60); };
  const ui = {};
  await pg.keyboard.press('g'); ui.toolAfterG = (await st()).tool;
  await click(-300, -200); await click(300, -200); await click(300, 200); await click(-300, 200);
  ui.openDraft = (await st()).masks.map(m => [m.closed, m.n]); ui.openNotApplied = await pxAt(700, 400);
  await click(-300, -200); // ilk noktaya tıkla → kapat
  let s = await st(); ui.closed = s.masks.map(m => [m.closed, m.n]); ui.render = { in: await pxAt(0, 0), out: await pxAt(400, 0) };
  await pg.screenshot({ path: 'pen_1_rect.png' });
  // çapa sürükle
  await dragTo(300, -200, 500, -300); s = await st(); ui.anchorMoved = s.masks[0].pts[1].slice(0, 2); ui.renderAfterMove = await pxAt(380, -220);
  // kenara tıkla → nokta ekle (alt kenar ortası), sonra aşağı çek
  await dragTo(0, 200, 0, 400); s = await st(); ui.inserted = { n: s.masks[0].n, pt: s.masks[0].pts[3].slice(0, 2) }; ui.renderBulge = await pxAt(0, 300);
  // Alt+tık → yumuşak nokta (tutamaç üretir), tutamacı sürükle (simetrik), Alt+sürükle (kırık)
  ui.insertedIsCorner = s.masks[0].pts[3].slice(2).every(v => v === 0);
  await pg.keyboard.down('Alt'); await click(0, 400); await pg.keyboard.up('Alt'); s = await st(); ui.smooth = s.masks[0].pts[3];
  const h = s.masks[0].pts[3]; await dragTo(h[0] + h[2], h[1] + h[3], h[0] + h[2] - 40, h[1] + h[3] + 80); s = await st(); ui.handleSym = s.masks[0].pts[3];
  const h2 = s.masks[0].pts[3]; await dragTo(h2[0] + h2[2], h2[1] + h2[3], h2[0] + h2[2], h2[1] + h2[3] - 120, { alt: true }); s = await st(); ui.handleBroken = s.masks[0].pts[3];
  await pg.screenshot({ path: 'pen_2_curve.png' });
  // Delete → seçili noktayı sil (klibi DEĞİL)
  await click(0, 400); await pg.keyboard.press('Delete'); s = await st(); ui.afterDelete = { n: s.masks[0].n, clipStillThere: true };
  // undo / redo
  await pg.keyboard.press('Control+z'); ui.undoN = (await st()).masks[0].n; await pg.keyboard.press('Control+y'); ui.redoN = (await st()).masks[0].n;
  // ikinci maske: sürükleyerek eğri noktalar (boşluğa tıkla → yeni maske)
  await dragTo(-800, -400, -700, -400); await dragTo(-600, -300, -600, -200); await dragTo(-800, -200, -850, -250); await pg.keyboard.press('Enter');
  s = await st(); ui.second = { count: s.masks.length, closed: s.masks[1].closed, n: s.masks[1].n, curved: s.masks[1].pts.every(p => p[2] || p[3]) }; ui.secondRender = await pxAt(-720, -310);
  // ---------- 3) YOL ANİMASYONU (UI) ----------
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const c = S().project.clips.find(k => k.kind === 'solid'); S().set(d => { const k = d.clips.find(q => q.id === c.id); k.masks = [k.masks[0]]; k.masks[0].pts = [[-300, -200], [300, -200], [300, 200], [-300, 200]].map(([x, y]) => ({ x, y, ix: 0, iy: 0, ox: 0, oy: 0 })); }); S().ui({ maskId: c.masks[0].id, maskPt: -1 }); });
  await pg.click('text=⏱ Yol animasyonu'); await pg.waitForTimeout(100);
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 2 }); }); await pg.waitForTimeout(150);
  await dragTo(300, -200, 800, -200); await dragTo(300, 200, 800, 200);
  s = await st(); ui.anim = { keys: s.masks[0].kf, base: s.masks[0].pts[1].slice(0, 2) };
  ui.animRender = { t0: await pxAt(400, 0, 0), t1in: await pxAt(520, 0, 1), t1out: await pxAt(580, 0, 1), t2: await pxAt(780, 0, 2) };
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 1 }); }); await pg.waitForTimeout(200);
  await pg.screenshot({ path: 'pen_3_anim.png' });
  ui.inspectorText = await pg.locator('.insp').innerText().then(t => /2 yol keyframe/.test(t));
  await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape'); ui.toolAfterEsc = (await st()).tool;
  console.log('UI', JSON.stringify(ui));
  // ---------- 4) YÖNETMEN + GÖRSEL MOD ----------
  const misc = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const D = await import('/src/ai/director.ts'); const run = D.runDirector ?? D.direct ?? D.runCommand; const out = {};
    S().set(d => { delete d.clips.find(k => k.kind === 'solid').masks; }); const c = () => S().project.clips.find(k => k.kind === 'solid');
    await run('elips maske ekle yumuşat 80'); out.ellipse = c().masks?.map(m => [m.pts.length, m.feather, m.closed]);
    await run('maskeyi ters çevir'); out.inv = c().masks?.[0].invert; await run('kalem maskesi'); out.tool = S().tool; await run('maskeleri sil'); out.removed = !c().masks;
    const { newImageProject } = await import('/src/util.ts'); const MK = await import('/src/engine/masks.ts'); const R = await import('/src/engine/render.ts');
    S().replace(newImageProject('img', 1080, 1080, '#ffffff')); S().set(d => { d.clips[0].masks = [MK.ellipseMask(500, 500)]; });
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1080; const x = cv.getContext('2d'); R.renderFrame(x, S().project, 0, 1); out.image = { in: x.getImageData(540, 540, 1, 1).data[0], out: x.getImageData(40, 40, 1, 1).data[0] };
    return out;
  });
  console.log('MISC', JSON.stringify(misc));
  // ---------- 5) VİTRİN MP4: hareketli maske ile metin/gradyan açılışı ----------
  const b64 = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip, defaultText } = await import('/src/util.ts'); const MK = await import('/src/engine/masks.ts'); const { TEXT_STYLES, makeEffect } = await import('/src/engine/presets.ts'); const { exportMp4 } = await import('/src/engine/export.ts');
    const p0 = newProject('Maske Vitrin'); p0.settings.bg = '#05060d'; S().replace(p0); const V = S().project.tracks.filter(t => t.kind === 'video').map(t => t.id); const Dur = 6;
    const bg = newClip(V[2], 'gradient', 0, Dur, { name: 'bg', color: '#ff4d6d', color2: '#3a2bd9', angle: 30 });
    // organik leke: 6 noktalı yumuşak yol, 3 keyframe arasında biçim değiştirir
    const blob = (r, w, ph) => Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2, rr = r * (1 + w * Math.sin(i * 2.1 + ph)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.75, tx = -Math.sin(a) * rr * 0.36, ty = Math.cos(a) * rr * 0.27; return MK.mpt(x, y, -tx, -ty, tx, ty); });
    bg.masks = [{ ...MK.newMask(blob(60, 0, 0), true), feather: 30, kf: [{ t: 0, pts: blob(40, 0, 0), e: 'linear' }, { t: 1.6, pts: blob(420, 0.35, 0), e: 'backOut' }, { t: 3.4, pts: blob(480, 0.35, 2.4), e: 'easeInOut' }, { t: 5.5, pts: blob(1500, 0, 0), e: 'easeIn' }] }];
    const title = newClip(V[0], 'text', 0.8, Dur - 0.8, { name: 'başlık', text: { ...defaultText('KALEM MASKESİ'), ...TEXT_STYLES.hero.t, size: 150, anim: 'none' } });
    // soldan sağa süpüren eğik maske (metni açar) + katmanla birlikte hareket
    const sweep = x => [MK.mpt(-900, -160), MK.mpt(x, -160), MK.mpt(x - 120, 160), MK.mpt(-900, 160)];
    title.masks = [{ ...MK.newMask(sweep(-880), true), feather: 12, kf: [{ t: 0.2, pts: sweep(-880), e: 'linear' }, { t: 1.8, pts: sweep(1000), e: 'easeInOut' }] }];
    const spot = newClip(V[1], 'adjust', 0, Dur, { name: 'spot' }); spot.effects = [makeEffect('grade', { exposure: -1.6, saturation: 0.4 })];
    spot.masks = [{ ...MK.ellipseMask(900, 520), invert: true, feather: 140, kf: [{ t: 0, pts: MK.ellipseMask(900, 520).pts.map(p => ({ ...p, x: p.x - 500 })), e: 'linear' }, { t: 6, pts: MK.ellipseMask(900, 520).pts.map(p => ({ ...p, x: p.x + 500 })), e: 'easeInOut' }] }];
    S().set(d => { d.clips.push(bg, title, spot); });
    const blobf = await exportMp4(S().project, { width: 1280, height: 720, fps: 30, bitrate: 8e6, from: 0, to: Dur, codec: 'avc', audio: false }, () => {}, { cancel: false });
    const buf = new Uint8Array(await blobf.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768)); return btoa(s);
  });
  fs.writeFileSync('maske_vitrin.mp4', Buffer.from(b64, 'base64')); console.log('vitrin bytes', fs.statSync('maske_vitrin.mp4').size);
  console.log('ERRORS', errs.length);
  await b.close();
})();
