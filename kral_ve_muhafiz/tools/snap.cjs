// Bir test sayfasını headless Chromium'da açıp canvas'ı PNG olarak kaydeder.
// Kullanım: node tools/snap.cjs <sayfa.html> <çıktı.png> [js-ifadesi]
const { chromium } = require('playwright');
const { writeFileSync } = require('fs');
const path = require('path');
(async () => {
  const [,, page, out, expr] = process.argv;
  const browser = await chromium.launch();
  const p = await browser.newPage();
  p.on('console', (m) => console.log('[page]', m.text()));
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(page));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const data = await p.evaluate(async (e) => { if (e) await eval(e); return document.querySelector('canvas').toDataURL('image/png'); }, expr || '');
  writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  await browser.close();
})();
