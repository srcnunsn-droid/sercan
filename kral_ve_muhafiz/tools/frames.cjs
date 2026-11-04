// Belirli zamanlardaki kareleri PNG olarak kaydeder (görsel denetim için).
// Kullanım: node tools/frames.cjs <çıktı_klasörü> t1 t2 ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [,, outDir, ...ts] = process.argv;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('[pageerror]', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
  const t0 = Date.now();
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
  console.log('hazır', ((Date.now() - t0) / 1000).toFixed(1), 's');
  for (const t of ts) {
    const s = Date.now();
    const data = await p.evaluate((tt) => { window.renderAt(+tt); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, t);
    fs.writeFileSync(path.join(outDir, `f_${(+t).toFixed(2).padStart(6, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
    console.log('t=' + t, (Date.now() - s) + 'ms');
  }
  await browser.close();
})();
