const { chromium } = require('playwright');
const D = __dirname;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  await pg.click('text=📁 Projeler ▾'); await pg.click('text=+ Yeni'); await pg.click('.rail >> text=Kurgu'); await pg.waitForTimeout(300);
  // import files
  await pg.setInputFiles('.ed-left input[type=file]', [D + '/test.mp4', D + '/speech.wav']); await pg.waitForTimeout(3000);
  // 1) chroma key + grade + lut + mask on green image
  const r1 = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { assetFromBlob } = await import('/src/engine/media.ts'); const { placeAsset, ensureBuiltinLuts } = await import('/src/actions.ts');
    const { makeEffect } = await import('/src/engine/presets.ts'); const { renderFrame } = await import('/src/engine/render.ts');
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const x = c.getContext('2d'); x.fillStyle = '#00ff00'; x.fillRect(0, 0, 1920, 1080); x.fillStyle = '#ff0000'; x.beginPath(); x.arc(960, 540, 300, 0, 7); x.fill();
    const blob = await new Promise(r => c.toBlob(r, 'image/png')); const a = await assetFromBlob(blob, 'green', 'image', 'import'); S().set(d => { d.assets.push(a); });
    S().ui({ time: 0 }); const clip = placeAsset(a, undefined, 0);
    S().set(d => { d.settings.bg = '#0000ff'; const k = d.clips.find(q => q.id === clip.id); k.effects = [makeEffect('chromakey')]; });
    const out = document.createElement('canvas'); out.width = 1920; out.height = 1080; const ox = out.getContext('2d');
    renderFrame(ox, S().project, 0.5, 1); const corner = [...ox.getImageData(10, 10, 1, 1).data], center = [...ox.getImageData(960, 540, 1, 1).data];
    ensureBuiltinLuts();
    S().set(d => { const k = d.clips.find(q => q.id === clip.id); k.effects.push(makeEffect('grade', { exposure: 0.3, liftA: 0.5, gainA: 0.4 }), makeEffect('lut', { lut: 'lut_builtin_teal' }), makeEffect('mask', {}), makeEffect('glow'), makeEffect('sharpen')); });
    const t0 = performance.now(); for (let i = 0; i < 5; i++) renderFrame(ox, S().project, 0.5, 1); const ms = (performance.now() - t0) / 5;
    const maskedCorner = [...ox.getImageData(10, 10, 1, 1).data];
    S().set(d => { d.clips = []; d.settings.bg = '#000000'; });
    return { corner, center, msPerFrame1080p: Math.round(ms), maskedCorner };
  });
  console.log('chroma/grade', JSON.stringify(r1));
  // 2) silence cut on speech.wav
  const r2 = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { placeAsset, cutSilences, freezeFrame } = await import('/src/actions.ts'); const { ensureRuntime } = await import('/src/engine/media.ts');
    const a = S().project.assets.find(x => x.name === 'speech.wav'); await ensureRuntime(a);
    const c = placeAsset(a, undefined, 0); S().ui({ selected: [c.id] }); cutSilences(-38, 0.35);
    const pieces = S().project.clips.filter(k => k.assetId === a.id).map(k => [k.start.toFixed(2), k.duration.toFixed(2), k.in.toFixed(2)]);
    // 3) freeze frame on video
    const v = S().project.assets.find(x => x.name === 'test.mp4'); await ensureRuntime(v);
    const vc = placeAsset(v, undefined, 0); S().ui({ selected: [vc.id], time: 2 }); await freezeFrame(2);
    const vt = S().project.clips.filter(k => k.trackId === vc.trackId).sort((p, q) => p.start - q.start).map(k => [k.name, k.start.toFixed(2), k.duration.toFixed(2)]);
    return { pieces, vt };
  });
  console.log('silence/freeze', JSON.stringify(r2));
  await pg.screenshot({ path: 'pro1.png' });
  // 4) Director
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 0, selected: [] }); });
  await pg.keyboard.press('Control+k'); await pg.waitForTimeout(200);
  await pg.keyboard.type('"YAZ GELDİ" başlık ekle, noir grade uygula, glitch efekti ekle, solma geçiş ekle'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
  console.log('toast1', await pg.locator('.toast').innerText().catch(() => ''));
  await pg.keyboard.press('Control+k'); await pg.keyboard.type('yazı rengi kırmızı yap, ken burns, whoosh sesi ekle, müzik ekle lofi 85 bpm'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(6000);
  console.log('toast2', await pg.locator('.toast').innerText().catch(() => ''));
  const st = await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const p = S().project; const t = p.clips.find(c => c.kind === 'text'); return { text: t?.text.text, color: t?.text.color, fx: t?.effects.map(e => e.type), tIn: t?.tIn.type, kf: Object.keys(t?.kf || {}), clips: p.clips.length, names: p.clips.map(c => c.name).slice(-3) }; });
  console.log('state', JSON.stringify(st));
  await pg.keyboard.press('Control+k'); await pg.keyboard.type('yeşil perde'); await pg.waitForTimeout(200); await pg.screenshot({ path: 'palette.png' }); await pg.keyboard.press('Escape');
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 1.2 }); }); await pg.waitForTimeout(500); await pg.screenshot({ path: 'pro2.png' });
  console.log(errs.slice(0, 10).join('\n')); await b.close();
})();
