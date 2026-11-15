const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  await pg.click('.rail >> text=Şablonlar'); await pg.waitForTimeout(1500); await pg.screenshot({ path: 'gal1.png' });
  console.log('cards (neon):', await pg.locator('.tpl').count());
  await pg.click('button:has-text("Hepsi (")'); await pg.waitForTimeout(500); console.log('cards (hepsi):', await pg.locator('.tpl').count());
  await pg.click('button:has-text("İnfografik")'); await pg.waitForTimeout(800); console.log('cards (infografik, hepsi):', await pg.locator('.tpl').count());
  await pg.fill('input[placeholder^="Ara"]', 'sayaç'); await pg.waitForTimeout(500); console.log('search sayaç:', await pg.locator('.tpl').count());
  await pg.fill('input[placeholder^="Ara"]', ''); await pg.click('button:has-text("Tümü")'); await pg.click('button:has-text("Gün Batımı")'); await pg.waitForTimeout(1200);
  await pg.screenshot({ path: 'gal2.png' });
  // dialog
  await pg.locator('.tpl', { hasText: 'Expo Kayan Başlık' }).click(); await pg.waitForTimeout(600);
  await pg.locator('.card input').first().fill('KADRAJ STUDIO'); await pg.waitForTimeout(1200); await pg.screenshot({ path: 'gal3.png' });
  await pg.click('button:has-text("＋ Playhead’e ekle")'); await pg.waitForTimeout(800);
  const st = await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const p = S().project; return { panel: S().panel, clips: p.clips.length, texts: p.clips.filter(c => c.kind === 'text').map(c => c.text.text) }; });
  console.log('after insert', JSON.stringify(st));
  await pg.waitForTimeout(500); await pg.screenshot({ path: 'gal4.png' });
  // yeni projede aç + MP4
  await pg.click('.rail >> text=Şablonlar'); await pg.waitForTimeout(800); await pg.locator('.tpl', { hasText: 'İstatistik Sayacı' }).first().click(); await pg.waitForTimeout(400);
  await pg.click('button:has-text("Yeni projede aç")'); await pg.waitForTimeout(600);
  const b64 = await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const { exportMp4 } = await import('/src/engine/export.ts'); const blob = await exportMp4(S().project, { width: 1280, height: 720, fps: 30, bitrate: 6e6, from: 0, to: 4.5, codec: 'avc', audio: false }, () => {}, { cancel: false }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768)); return btoa(s); });
  fs.writeFileSync('tpl_stat.mp4', Buffer.from(b64, 'base64'));
  console.log('ERRORS', errs.length, errs.slice(0, 5).join('\n')); await b.close();
})();
