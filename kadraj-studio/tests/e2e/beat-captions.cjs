const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 }, acceptDownloads: true });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('http://localhost:4173'); await pg.waitForTimeout(800);
  await pg.click('text=📁 Projeler ▾'); await pg.click('text=✨ Demo projesi'); await pg.waitForTimeout(5000);
  await pg.click('.tabs >> text=Akıllı');
  await pg.click('text=Ritmi analiz et'); await pg.waitForTimeout(1500);
  console.log('chips', await pg.locator('.sec .chip').allInnerTexts());
  await pg.click('text=⚑ Vuruşları işaretle'); await pg.waitForTimeout(300);
  console.log('markers', await pg.evaluate(() => document.querySelectorAll('.marker').length));
  // before/after starts of main track
  const starts = async () => pg.evaluate(() => [...document.querySelectorAll('.tl-row')][2].querySelectorAll('.clip').length);
  await pg.click('text=✂ Klipleri vuruşa oturt'); await pg.waitForTimeout(300);
  console.log('toast', await pg.locator('.toast').innerText().catch(()=>''));
  // text captions
  await pg.fill('textarea[placeholder^="Boş bırakırsan"]', 'Bu bir deneme altyazısıdır. Kadraj Studio ile tüm üretim yerel olarak yapılır! Harika değil mi?');
  await pg.keyboard.press('Escape');
  await pg.click('text=Metni zamanla → altyazı'); await pg.waitForTimeout(300);
  console.log('toast2', await pg.locator('.toast').innerText().catch(()=>''));
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('text=⬇ SRT indir')]); await dl.saveAs('a.srt');
  // whisper (expected network fail here)
  await pg.click('text=🎙 Sesten altyazı çıkar'); await pg.waitForTimeout(8000);
  console.log('whisper status:', await pg.locator('.sec .small').allInnerTexts().then(a => a.filter(x=>x.includes('⚠')||x.includes('Model')||x.includes('Ses')).slice(0,2)));
  // preview drag: seek to 1.5s, click title center and drag
  await pg.evaluate(() => {}); 
  await pg.click('.ruler', { position: { x: 90, y: 10 } }); await pg.waitForTimeout(300);
  const box = await pg.locator('.viewport canvas').boundingBox();
  await pg.mouse.move(box.x + box.width/2, box.y + box.height/2); await pg.mouse.down();
  await pg.mouse.move(box.x + box.width/2 + 120, box.y + box.height/2 - 80, { steps: 8 }); await pg.waitForTimeout(100);
  await pg.screenshot({ path: 'drag.png' }); await pg.mouse.up(); await pg.waitForTimeout(200);
  console.log('sel inspector X:', await pg.locator('.prop input[type=number]').first().inputValue().catch(()=>'none'));
  await pg.screenshot({ path: 'smart.png' });
  console.log(errs.slice(0,10).join('\n')); await b.close();
})();
