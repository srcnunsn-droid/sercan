const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  const px = async (x, y) => pg.evaluate(async ([x, y]) => { const { S } = await import('/src/store.ts'); const { renderFrame } = await import('/src/engine/render.ts'); const p = S().project; const c = document.createElement('canvas'); c.width = p.settings.width; c.height = p.settings.height; const k = c.getContext('2d', { willReadFrequently: true }); renderFrame(k, p, S().time, 1); return [...k.getImageData(x, y, 1, 1).data].slice(0, 3); }, [x, y]);
  // ---- Görsel belge + boya geçmişi
  await pg.click('.rail >> text=Görsel'); await pg.click('button:has-text("Instagram gönderi 1:1")'); await pg.waitForTimeout(400);
  const box = await pg.locator('.viewport canvas').boundingBox(); const P = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
  await pg.keyboard.press('b'); await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ brush: { color: '#0000ff', size: 300, hardness: 1, opacity: 1 } }); });
  let [x, y] = P(0.2, 0.5); await pg.mouse.move(x, y); await pg.mouse.down(); [x, y] = P(0.8, 0.5); await pg.mouse.move(x, y, { steps: 15 }); await pg.mouse.up(); await pg.waitForTimeout(600);
  const afterPaint = await px(540, 540);
  await pg.keyboard.press('Control+z'); await pg.waitForTimeout(600); const afterUndo = await px(540, 540);
  await pg.keyboard.press('Control+y'); await pg.waitForTimeout(600); const afterRedo = await px(540, 540);
  console.log('paint', JSON.stringify({ afterPaint, afterUndo, afterRedo }));
  // ---- Dikdörtgen seçim + Delete
  await pg.keyboard.press('m'); [x, y] = P(0.45, 0.4); await pg.mouse.move(x, y); await pg.mouse.down(); [x, y] = P(0.55, 0.6); await pg.mouse.move(x, y, { steps: 5 }); await pg.mouse.up(); await pg.waitForTimeout(200);
  await pg.keyboard.press('Delete'); await pg.waitForTimeout(600);
  console.log('sel-delete center', JSON.stringify(await px(540, 540)), 'outside', JSON.stringify(await px(300, 540)));
  // ---- kement → yeni katmana kopyala
  await pg.keyboard.press('l'); const L = [[0.25, 0.45], [0.35, 0.42], [0.38, 0.55], [0.28, 0.58]]; [x, y] = P(...L[0]); await pg.mouse.move(x, y); await pg.mouse.down(); for (const q of L.slice(1)) { [x, y] = P(...q); await pg.mouse.move(x, y, { steps: 4 }); } await pg.mouse.up();
  await pg.screenshot({ path: 'sel.png' });
  await pg.keyboard.press('Control+j'); await pg.waitForTimeout(800);
  console.log('layers', JSON.stringify(await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); return S().project.tracks.map(t => t.name); })));
  // ---- ayar katmanı (siyah-beyaz + elips maske)
  await pg.keyboard.press('v');
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const { addAdjustmentLayer } = await import('/src/actions.ts'); const { makeEffect } = await import('/src/engine/presets.ts');
    const c = addAdjustmentLayer(); S().set(d => { d.clips.find(k => k.id === c.id).effects = [makeEffect('grayscale', { v: 1 }), makeEffect('mask', { shape: 'ellipse', mw: 0.3, mh: 0.3, feather: 0 })]; }); });
  await pg.waitForTimeout(400);
  console.log('adjust center(gray?)', JSON.stringify(await px(400, 540)), 'edge(blue kept?)', JSON.stringify(await px(250, 540)));
  // skoplar
  await pg.click('button:has-text("📊 Skoplar")'); await pg.waitForTimeout(700); await pg.screenshot({ path: 'scopes1.png' });
  await pg.click('.scopes button:has-text("Vektör")'); await pg.waitForTimeout(500); await pg.screenshot({ path: 'scopes2.png' });
  // ---- video modu: crop
  const crop = await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const { newProject } = await import('/src/util.ts'); const { addGenClip } = await import('/src/actions.ts'); const { renderFrame } = await import('/src/engine/render.ts'); const { assetFromBlob } = await import('/src/engine/media.ts'); const { placeAsset } = await import('/src/actions.ts');
    S().replace(newProject('crop')); S().set(d => { d.settings.bg = '#000000'; });
    const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; const x = cv.getContext('2d'); x.fillStyle = '#ff0000'; x.fillRect(0, 0, 1920, 1080);
    const a = await assetFromBlob(await new Promise(r => cv.toBlob(r)), 'red', 'image', 'import'); S().set(d => { d.assets.push(a); });
    const c = placeAsset(a, undefined, 0); S().set(d => { d.clips.find(k => k.id === c.id).crop = { l: 0.5, t: 0, r: 0, b: 0 }; });
    const o = document.createElement('canvas'); o.width = 1920; o.height = 1080; const ox = o.getContext('2d', { willReadFrequently: true }); renderFrame(ox, S().project, 0.5, 1);
    return { left: [...ox.getImageData(400, 540, 1, 1).data].slice(0, 3), right: [...ox.getImageData(1500, 540, 1, 1).data].slice(0, 3) }; });
  console.log('crop', JSON.stringify(crop));
  await b.close();
})();
