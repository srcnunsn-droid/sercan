const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 1600, height: 960 }, acceptDownloads: true });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+' '+m.text()); });
  await pg.goto('http://localhost:4173'); await pg.waitForTimeout(800);
  // Fikir
  await pg.fill('textarea', 'Kapadokya balon festivali');
  await pg.click('text=⚡ Konsept üret'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'idea.png' });
  await pg.click('text=Storyboard\'a git →'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: 'story.png' });
  await pg.click('text=▶ Timeline’a aktar'); await pg.waitForTimeout(4000);
  await pg.screenshot({ path: 'editor_rough.png' });
  // Demo
  await pg.click('text=📁 Projeler ▾'); await pg.click('text=✨ Demo projesi'); await pg.waitForTimeout(5000);
  await pg.keyboard.press('Space'); await pg.waitForTimeout(1500); await pg.screenshot({ path: 'demo_play1.png' });
  await pg.waitForTimeout(4000); await pg.screenshot({ path: 'demo_play2.png' }); await pg.keyboard.press('Space');
  // select clip
  await pg.locator('.clip').nth(3).click(); await pg.waitForTimeout(300); await pg.screenshot({ path: 'demo_sel.png' });
  // export
  const supp = await pg.evaluate(async () => { const r = {}; for (const c of ['avc1.640028','vp09.00.40.08','hvc1.1.6.L120.90']) r[c] = (await VideoEncoder.isConfigSupported({codec:c,width:960,height:540,bitrate:3e6,framerate:30})).supported; for (const c of ['mp4a.40.2','opus']) r[c] = (await AudioEncoder.isConfigSupported({codec:c,sampleRate:48000,numberOfChannels:2,bitrate:192000})).supported; return r; });
  console.log('support', JSON.stringify(supp));
  await pg.click('.rail >> text=Çıktı'); await pg.waitForTimeout(300);
  await pg.click('text=Taslak 540p');
  if (!supp['avc1.640028']) await pg.selectOption('select:near(:text("Kodek"))', 'vp9');
  const [dl] = await Promise.all([pg.waitForEvent('download', { timeout: 180000 }), pg.click('text=⬇ MP4 olarak render al')]);
  await dl.saveAs('out.mp4'); console.log('downloaded');
  await pg.screenshot({ path: 'export.png' });
  await pg.click('.rail >> text=Ekosistem'); await pg.waitForTimeout(300); await pg.screenshot({ path: 'eco.png' });
  await pg.click('.rail >> text=Ses'); await pg.waitForTimeout(300); await pg.screenshot({ path: 'audio.png' });
  console.log(errs.slice(0,20).join('\n'));
  await b.close();
})();
