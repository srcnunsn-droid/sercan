const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 960 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text().slice(0, 200)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip, defaultText } = await import('/src/util.ts'); const A = await import('/src/actions.ts'); const R = await import('/src/engine/render.ts');
    const { TEXT_STYLES } = await import('/src/engine/presets.ts');
    S().replace(newProject('AE Vitrin')); S().set(d => { d.settings.bg = '#07060f'; });
    const out = {};
    const cv = document.createElement('canvas'); cv.width = 960; cv.height = 540; const x = cv.getContext('2d', { willReadFrequently: true });
    const lit = (t) => { R.renderFrame(x, S().project, t, 0.5); const d = x.getImageData(0, 0, 960, 540).data; let n = 0, h = 0; for (let i = 0; i < d.length; i += 4) { if (d[i] + d[i + 1] + d[i + 2] > 60) n++; h = (h * 31 + d[i]) | 0; } return [n, h]; };
    S().ui({ time: 0 }); const sp = await A.addParticles('sparks');
    const a = lit(1.3), b2 = lit(2.0), a2 = lit(1.3); out.particlesLit = a[0]; out.scrubConsistent = a[1] === a2[1]; out.changes = a[1] !== b2[1];
    const t0 = performance.now(); for (let i = 0; i < 10; i++) R.renderFrame(x, S().project, 1 + i * 0.05, 0.5); out.particleMs = Math.round((performance.now() - t0) / 10);
    S().set(d => { d.clips = []; });
    // draw-on
    const V = S().project.tracks.filter(t => t.kind === 'video').map(t => t.id);
    const ring = newClip(V[1], 'shape', 0, 4, { name: 'halka', shape: { shape: 'circle', w: 600, h: 600, fill: 'transparent', stroke: '#ffffff', strokeW: 20, radius: 0, drawOn: 2 } });
    S().set(d => { d.clips.push(ring); });
    out.drawOn = [0, 0.5, 1, 1.5, 2.5].map(t => lit(t)[0]);
    return out;
  });
  console.log(JSON.stringify(r));
  // ======= VİTRİN: tüm AE özellikleri birlikte =======
  const b64 = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { newProject, newClip, defaultText } = await import('/src/util.ts'); const A = await import('/src/actions.ts');
    const { TEXT_STYLES, makeEffect } = await import('/src/engine/presets.ts'); const { PARTICLE_PRESETS } = await import('/src/engine/particles.ts'); const { exportMp4 } = await import('/src/engine/export.ts');
    const p0 = newProject('AE Vitrin'); p0.settings.bg = '#07060f'; S().replace(p0);
    const tr = (n) => { const { newTrack } = { newTrack: (k, nm) => ({ id: 't_' + Math.random().toString(36).slice(2), kind: k, name: nm, muted: false, hidden: false, locked: false }) }; const t = newTrack('video', n); S().set(d => { d.tracks.unshift(t); }); return t.id; };
    const D = 8;
    const bgT = tr('BG'); const bg = newClip(bgT, 'gradient', 0, D, { name: 'bg', color: '#0b0820', color2: '#2a0f3a', angle: 120 });
    const nullT = tr('Null'); const nul = newClip(nullT, 'null', 0, D, { name: 'Kontrol' }); nul.expr = { rotation: 'time*45', scale: '1 + sin(time*2)*0.08' };
    const kids = [];
    for (let i = 0; i < 6; i++) { const t = tr('S' + i); const a = (i / 6) * Math.PI * 2; const k = newClip(t, 'shape', 0.2 + i * 0.12, D, { name: 'nokta' + i, parent: nul.id, motionBlur: true, shape: { shape: i % 2 ? 'star' : 'polygon', w: 90, h: 90, fill: i % 2 ? '#ffcc4d' : '#ff4d6d', stroke: '#ffffff', strokeW: 4, radius: 0, points: i % 2 ? 5 : 6, drawOn: 0.8 } }); k.base.x = Math.cos(a) * 320; k.base.y = Math.sin(a) * 320; k.expr = { rotation: 'time*-120' }; kids.push(k); }
    const ringT = tr('Halka'); const ring = newClip(ringT, 'shape', 0, D, { name: 'halka', parent: nul.id, shape: { shape: 'circle', w: 640, h: 640, fill: 'transparent', stroke: '#5ab0ff', strokeW: 6, radius: 0, drawOn: 1.6 } }); ring.effects = [makeEffect('glow', { amount: 0.9, radius: 18 })];
    const txtT = tr('Başlık'); const title = newClip(txtT, 'text', 1.2, D - 1.2, { name: 'başlık', text: { ...defaultText('AFTER EFFECTS?'), ...TEXT_STYLES.hero.t, size: 150 } }); title.expr = { x: 'wiggle(1.5, 6)', y: 'wiggle(1.5, 6)' }; title.effects = [makeEffect('glow', { amount: 0.5 })];
    const subT = tr('Alt'); const sub = newClip(subT, 'text', 2.4, D - 2.4, { name: 'alt', text: { ...defaultText('expressions · parenting · motion blur · particles'), ...TEXT_STYLES.elegant.t, size: 40, color: '#ffd8a8' } }); sub.base.y = 120;
    const pT = tr('Parçacık'); const parts = newClip(pT, 'particles', 0, D, { name: 'kıvılcım', particles: { ...PARTICLE_PRESETS.magic.p, rate: 140, emitW: 60, emitH: 60 } }); parts.parent = nul.id; parts.base.x = 320;
    const adjT = tr('Ayar'); const adj = newClip(adjT, 'adjust', 0, D, { name: 'grade' }); adj.effects = [makeEffect('vignette', { amount: 0.6 }), makeEffect('grain', { amount: 0.06 })];
    S().set(d => { d.clips.push(bg, nul, ...kids, ring, title, sub, parts, adj); });
    const blob = await exportMp4(S().project, { width: 1280, height: 720, fps: 30, bitrate: 8e6, from: 0, to: D, codec: 'avc', audio: false }, () => {}, { cancel: false });
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768)); return btoa(s);
  });
  fs.writeFileSync('ae_vitrin.mp4', Buffer.from(b64, 'base64')); console.log('vitrin bytes', fs.statSync('ae_vitrin.mp4').size);
  await b.close();
})();
