const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] }); const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
  pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text().slice(0, 300)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(async () => {
    const { S } = await import('/src/store.ts'); const { assetFromBlob } = await import('/src/engine/media.ts'); const { placeAsset, ensureBuiltinLuts } = await import('/src/actions.ts');
    const { makeEffect } = await import('/src/engine/presets.ts'); const { renderFrame } = await import('/src/engine/render.ts'); const G = await import('/src/engine/gpu.ts'); const { newProject } = await import('/src/util.ts');
    S().replace(newProject('gpu test'));
    // asimetrik test görseli: üst yarı yeşil, sol-alt kırmızı, sağ-alt mavi gradyan
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const x = c.getContext('2d');
    x.fillStyle = '#00ff00'; x.fillRect(0, 0, 1920, 540); const g = x.createLinearGradient(0, 540, 1920, 1080); g.addColorStop(0, '#ff2020'); g.addColorStop(1, '#2040ff'); x.fillStyle = g; x.fillRect(0, 540, 1920, 540);
    x.fillStyle = '#ffffff'; x.font = 'bold 200px sans-serif'; x.fillText('GPU', 200, 900);
    const a = await assetFromBlob(await new Promise(r => c.toBlob(r)), 't', 'image', 'import'); S().set(d => { d.assets.push(a); d.settings.bg = '#202020'; });
    const clip = placeAsset(a, undefined, 0); ensureBuiltinLuts();
    const out = document.createElement('canvas'); out.width = 1920; out.height = 1080; const ox = out.getContext('2d', { willReadFrequently: true });
    const cases = { grade: [makeEffect('grade', { exposure: 0.3, temp: 0.4, saturation: 1.3, liftA: 0.4, gainA: 0.3, contrast: 1.2 })], lut: [makeEffect('lut', { lut: 'lut_builtin_teal', amount: 0.8 })], chromakey: [makeEffect('chromakey')], sharpen: [makeEffect('sharpen', { amount: 1 })], chroma: [makeEffect('chroma', { px: 10 })],
      stack: [makeEffect('chromakey'), makeEffect('grade', { exposure: 0.2, gammaA: 0.5 }), makeEffect('lut', { lut: 'lut_builtin_filmic' }), makeEffect('sharpen'), makeEffect('chroma', { px: 4 }), makeEffect('vignette')] };
    const res = { gpu: G.gpuAvailable() };
    for (const [k, fx] of Object.entries(cases)) {
      S().set(d => { d.clips.find(q => q.id === clip.id).effects = fx; });
      const shot = (on) => { G.setGpuEnabled(on); renderFrame(ox, S().project, 0.5, 1); return ox.getImageData(0, 0, 1920, 1080).data.slice(); };
      const A = shot(false); const B = shot(true);
      let diff = 0, mx = 0; for (let i = 0; i < A.length; i += 4) { for (let j = 0; j < 3; j++) { const d = Math.abs(A[i + j] - B[i + j]); diff += d; if (d > mx) mx = d; } }
      const time = (on, n = 6) => { G.setGpuEnabled(on); renderFrame(ox, S().project, 0.5, 1); const t0 = performance.now(); for (let i = 0; i < n; i++) { renderFrame(ox, S().project, 0.5, 1); ox.getImageData(0, 0, 1, 1); } return Math.round((performance.now() - t0) / n); };
      const px = (D, X, Y) => [...D.slice((Y * 1920 + X) * 4, (Y * 1920 + X) * 4 + 3)];
      res[k] = { meanDiff: +(diff / (A.length / 4 * 3)).toFixed(2), maxDiff: mx, cpuMs: time(false), gpuMs: time(true), topCpu: px(A, 960, 100), topGpu: px(B, 960, 100), botLCpu: px(A, 50, 1000), botLGpu: px(B, 50, 1000) };
    }
    G.setGpuEnabled(true);
    return res;
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
