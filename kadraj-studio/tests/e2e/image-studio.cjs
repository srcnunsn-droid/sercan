const { chromium } = require('playwright');
const D = __dirname;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 }, acceptDownloads: true });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  await pg.click('.rail >> text=Görsel'); await pg.waitForTimeout(300); await pg.screenshot({ path: 'img0.png' });
  await pg.click('button:has-text("Instagram gönderi 1:1")'); await pg.waitForTimeout(500);
  // gradient fill
  await pg.click('.tabs >> text=Üret'); await pg.click('button:has-text("◐ Gradyan")'); await pg.waitForTimeout(300);
  // image layer: green image w/ red circle, chroma key
  await pg.click('.tabs >> text=Medya'); await pg.setInputFiles('.ed-left input[type=file]', [D + '/test.mp4']); await pg.waitForTimeout(1500);
  // text
  await pg.click('.tabs >> text=Metin'); await pg.click('.ed-left button >> text=Büyük başlık'); await pg.waitForTimeout(300);
  // brush strokes
  await pg.keyboard.press('b'); await pg.waitForTimeout(200);
  const box = await pg.locator('.viewport canvas').boundingBox();
  await pg.mouse.move(box.x + 80, box.y + box.height - 80); await pg.mouse.down();
  for (let i = 0; i <= 20; i++) await pg.mouse.move(box.x + 80 + i * 20, box.y + box.height - 80 - Math.sin(i / 3) * 40);
  await pg.mouse.up(); await pg.waitForTimeout(800);
  // eraser part
  await pg.keyboard.press('e'); await pg.mouse.move(box.x + 160, box.y + box.height - 120); await pg.mouse.down(); await pg.mouse.move(box.x + 200, box.y + box.height - 60, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(800);
  await pg.keyboard.press('v');
  const info = await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const p = S().project; return { mode: p.mode, size: [p.settings.width, p.settings.height], layers: p.tracks.map(t => t.name), clips: p.clips.map(c => [c.kind, c.start, c.duration]) }; });
  console.log(JSON.stringify(info));
  await pg.screenshot({ path: 'img1.png' });
  // reorder: move text layer down
  // export png
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('button:has-text("⬇ Dışa aktar")')]); await dl.saveAs('img_out.png');
  console.log('toast', await pg.locator('.toast').innerText().catch(() => ''));
  // bg removal (expected network failure here)
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); const c = S().project.clips.find(k => k.kind === 'media' && S().project.assets.find(a => a.id === k.assetId)?.kind === 'image'); if (c) S().ui({ selected: [c.id] }); });
  await pg.click('button:has-text("AI arka plan sil")'); await pg.waitForTimeout(6000);
  console.log('bg status:', await pg.locator('.ed-tl .small').first().innerText().catch(() => 'none'));
  await b.close();
})();
