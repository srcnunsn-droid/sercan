const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip } = await import('/src/util.ts'); const A = await import('/src/actions.ts');
    const { transformAt, exprErrors, cubicBezier } = await import('/src/engine/interp.ts'); const R = await import('/src/engine/render.ts');
    S().replace(newProject('ae')); S().set(d => { d.settings.bg = '#000000'; });
    const V = S().project.tracks.filter(t => t.kind === 'video').map(t => t.id);
    const out = {};
    // 1) expressions
    const sh = newClip(V[1], 'shape', 0, 4, { name: 'kutu', shape: { shape: 'rect', w: 200, h: 200, fill: '#ffffff', stroke: '#fff', strokeW: 0, radius: 0 } });
    sh.expr = { rotation: 'time*90', x: 'wiggle(2, 30)' }; sh.kf = { y: [{ t: 0, v: 0, e: 'linear' }, { t: 1, v: 100, e: 'linear' }] }; sh.expr.y = 'loopOut()';
    S().set(d => { d.clips.push(sh); });
    const c = () => S().project.clips.find(k => k.id === sh.id);
    out.rotAt1 = transformAt(c(), 1).rotation; out.yLoopAt1_5 = transformAt(c(), 1.5).y;
    out.wiggleDet = transformAt(c(), 0.7).x === transformAt(c(), 0.7).x; out.wiggleVaries = Math.abs(transformAt(c(), 0.2).x - transformAt(c(), 1.4).x) > 0.5; out.wiggleRange = Math.max(...[0.1,0.5,1,1.5,2,2.5,3].map(t => Math.abs(transformAt(c(), t).x))) <= 30.01;
    S().set(d => { d.clips.find(k => k.id === sh.id).expr.rotation = 'time*'; }); out.badExprFallback = transformAt(c(), 1).rotation; out.badExprErr = [...exprErrors.values()][0]?.slice(0, 40);
    S().set(d => { const k = d.clips.find(k => k.id === sh.id); k.expr = {}; k.kf = {}; k.base.x = 100; k.base.y = 0; });
    // 2) parenting
    const nul = A.addNullObject(); S().set(d => { const n = d.clips.find(k => k.id === nul.id); n.base.x = 200; });
    S().ui({ time: 1 }); A.setParent(sh.id, nul.id); await new Promise(r => setTimeout(r, 300));
    out.childLocalAfterParent = c().base.x; out.childWorldKept = Math.round(R.clipBounds(S().project, c(), 1).cx);
    S().set(d => { d.clips.find(k => k.id === nul.id).base.rotation = 90; });
    const bb = R.clipBounds(S().project, c(), 1); out.childWorldAfterRot = [Math.round(bb.cx), Math.round(bb.cy), Math.round(bb.rot)];
    // 3) motion blur: hızlı yatay hareket
    A.setParent(sh.id, undefined); await new Promise(r => setTimeout(r, 300));
    S().set(d => { const k = d.clips.find(k => k.id === sh.id); k.base.rotation = 0; k.base.scale = 1; k.base.y = 0; k.kf = { x: [{ t: 0, v: -800, e: 'linear' }, { t: 1, v: 800, e: 'linear' }] }; d.clips = d.clips.filter(q => q.kind !== 'null'); });
    const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const x = cv.getContext('2d', { willReadFrequently: true });
    const row = () => { R.renderFrame(x, S().project, 0.5, 1); const dd = x.getImageData(0, 540, 1920, 1).data; let full = 0, partial = 0; for (let i = 0; i < 1920; i++) { const v = dd[i * 4]; if (v > 250) full++; else if (v > 5) partial++; } return { full, partial }; };
    out.noMB = row(); S().set(d => { d.clips.find(k => k.id === sh.id).motionBlur = true; }); out.MB = row();
    // 4) bezier
    out.easyEase = [0.25, 0.5, 0.75].map(u => +cubicBezier(0.33, 0, 0.67, 1, u).toFixed(3));
    return out;
  });
  console.log(JSON.stringify(r, null, 0));
  // 5) Grafik editörü UI
  await pg.click('.rail >> text=Kurgu'); await pg.waitForTimeout(300);
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const c = S().project.clips.find(k => k.kind === 'shape'); S().ui({ selected: [c.id], time: 0.5 }); });
  await pg.click('button:has-text("📈 Grafik editörü")'); await pg.waitForTimeout(400);
  const gbox = await pg.locator('.ed-tl canvas').boundingBox();
  await pg.mouse.dblclick(gbox.x + gbox.width * 0.6, gbox.y + gbox.height * 0.4); await pg.waitForTimeout(300);
  await pg.click('button:has-text("Taşma (overshoot)")'); await pg.waitForTimeout(300);
  console.log('kf after graph', JSON.stringify(await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); return S().project.clips.find(k => k.kind === 'shape').kf.x.map(k => [k.t, Math.round(k.v), k.e, k.b]); })));
  await pg.screenshot({ path: 'graph.png' });
  // 6) Yönetmen AE komutları
  await pg.click('button:has-text("← Zaman çizelgesi")');
  await pg.evaluate(async () => { const { direct } = await import('/src/ai/director.ts'); await direct('wiggle ekle 3 hz 40 px, hareket bulanıklığı aç, null ekle'); });
  console.log('director', JSON.stringify(await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const p = S().project; const c = p.clips.find(k => k.kind === 'shape'); return { expr: c.expr, mb: c.motionBlur, nulls: p.clips.filter(k => k.kind === 'null').length }; })));
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const c = S().project.clips.find(k => k.kind === 'shape'); S().ui({ selected: [c.id], time: 0.5 }); });
  await pg.waitForTimeout(500); await pg.screenshot({ path: 'ae_insp.png' });
  await b.close();
})();
