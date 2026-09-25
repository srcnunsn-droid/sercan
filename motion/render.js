const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, 'frames'); fs.mkdirSync(dir, { recursive: true });
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'anim.html'));
  await page.evaluate(() => window.ready);
  const times = only || Array.from({ length: 450 }, (_, i) => i / 30);
  for (let i = 0; i < times.length; i++) {
    const b64 = await page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, times[i]);
    const name = only ? `still_${times[i].toFixed(2)}.png` : `f${String(i).padStart(4, '0')}.png`;
    fs.writeFileSync(path.join(only ? __dirname : dir, name), Buffer.from(b64, 'base64'));
  }
  await browser.close();
})();
