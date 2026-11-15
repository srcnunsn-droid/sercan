const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 }, acceptDownloads: true });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  await pg.click('text=📁 Projeler ▾'); await pg.click('text=+ Yeni'); await pg.click('.rail >> text=Kurgu'); await pg.waitForTimeout(300);
  await pg.click('.tabs >> text=Şablon');
  const ids = ['YouTube intro','Ürün lansmanı','Alt bant','Abone ol','Geri sayım','Belgesel'];
  let t = 0;
  for (const name of ids) {
    await pg.evaluate(async (t) => { const { S } = await import('/src/store.ts'); S().ui({ time: t }); }, t);
    await pg.click(`button:has-text("${name}")`); await pg.waitForFunction(() => document.querySelector('.toast')?.textContent?.includes('eklendi'), null, { timeout: 30000 });
    t += 8;
  }
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 6.0, selected: [] }); }); await pg.waitForTimeout(400); await pg.screenshot({ path: 'tpl1.png' });
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 17.5 }); }); await pg.waitForTimeout(400); await pg.screenshot({ path: 'tpl2.png' });
  await pg.evaluate(async () => { const { S } = await import('/src/store.ts'); S().ui({ time: 43 }); }); await pg.waitForTimeout(400); await pg.screenshot({ path: 'tpl3.png' });
  // Ducking test
  const r = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { mixOffline } = await import('/src/engine/audio.ts'); const { newClip } = await import('/src/util.ts');
    const { assetFromBlob } = await import('/src/engine/media.ts'); const { genMusic, genSfx } = await import('/src/engine/audioGen.ts'); const { bufferToWav } = await import('/src/engine/audio.ts');
    const { newProject } = await import('/src/util.ts');
    const p = newProject('duck'); const A1 = p.tracks[3].id, A2 = p.tracks[4].id;
    const m = await assetFromBlob(bufferToWav(await genMusic('minimal', 120, 4, 57, 1, { pad: true, bass: false, arp: false, drums: false })), 'm', 'audio', 'procedural');
    const v = await assetFromBlob(bufferToWav(await genSfx('drone', 2, 1)), 'v', 'audio', 'procedural');
    p.assets.push(m, v); p.clips.push(newClip(A2, 'media', 0, 6, { assetId: m.id }), newClip(A1, 'media', 2, 2, { assetId: v.id, volume: 0 }));
    const rms = (b, a, z) => { const d = b.getChannelData(0); let s = 0, n = 0; for (let i = Math.floor(a * b.sampleRate); i < z * b.sampleRate; i++) { s += d[i] * d[i]; n++; } return Math.sqrt(s / n); };
    const off = await mixOffline(p, 6); p.settings.duck = { on: true, db: 12 }; const on = await mixOffline(p, 6);
    return { offIn: rms(off, 2.5, 3.5), onIn: rms(on, 2.5, 3.5), offOut: rms(off, 0.8, 1.6), onOut: rms(on, 0.8, 1.6) };
  });
  console.log('duck', JSON.stringify(r), 'reduction dB', (20*Math.log10(r.onIn/r.offIn)).toFixed(1));
  console.log(errs.slice(0, 10).join('\n')); await b.close();
})();
