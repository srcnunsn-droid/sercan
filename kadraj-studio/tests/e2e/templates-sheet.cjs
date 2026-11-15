const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && m.text().includes('render'))) errs.push(m.text().slice(0, 160)); });
  await pg.goto('http://localhost:5173'); await pg.waitForTimeout(2000);
  const r = await pg.evaluate(async () => {
    const { CATALOG, DESIGNS, previewProject } = await import('/src/templates/index.ts'); const { renderFrame } = await import('/src/engine/render.ts');
    const out = { total: CATALOG.length, designs: DESIGNS.length, rows: [] };
    const sheet = document.createElement('canvas'); const cols = 8, tw = 240, th = 135; sheet.width = cols * tw; sheet.height = Math.ceil(DESIGNS.length / cols) * (th + 18); const sx = sheet.getContext('2d'); sx.fillStyle = '#111'; sx.fillRect(0, 0, sheet.width, sheet.height);
    const sheet2 = document.createElement('canvas'); const tw2 = 108, th2 = 192; sheet2.width = 10 * tw2; sheet2.height = Math.ceil(DESIGNS.length / 10) * (th2 + 4); const sx2 = sheet2.getContext('2d');
    for (const [i, d] of DESIGNS.entries()) {
      const t = CATALOG.find(c => c.design.id === d.id && c.palette.id === ['neon', 'sunset', 'ocean', 'gold', 'pop', 'cyber', 'corp', 'paper'][i % 8]);
      const p = previewProject(t, 1920, 1080); const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const x = cv.getContext('2d', { willReadFrequently: true });
      const t0 = performance.now(); let lit = []; const tT = d.thumbT ?? Math.min(d.dur * 0.62, 2.6);
      for (const tt of [0.1, d.dur * 0.25, tT, d.dur * 0.75, d.dur - 0.05]) { renderFrame(x, p, tt, 0.25); const dd = x.getImageData(0, 0, 480, 270).data; let n = 0; const bg = [dd[0], dd[1], dd[2]]; for (let k = 0; k < dd.length; k += 16) if (Math.abs(dd[k] - bg[0]) + Math.abs(dd[k + 1] - bg[1]) + Math.abs(dd[k + 2] - bg[2]) > 40) n++; lit.push(n); }
      const ms = (performance.now() - t0) / 5;
      renderFrame(x, p, tT, 0.25); sx.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * (th + 18), tw, th); sx.fillStyle = '#ddd'; sx.font = '11px sans-serif'; sx.fillText(d.name, (i % cols) * tw + 4, Math.floor(i / cols) * (th + 18) + th + 13);
      const p2 = previewProject(t, 1080, 1920); const c2 = document.createElement('canvas'); c2.width = 216; c2.height = 384; renderFrame(c2.getContext('2d'), p2, tT, 0.2); sx2.drawImage(c2, (i % 10) * tw2, Math.floor(i / 10) * (th2 + 4), tw2, th2);
      out.rows.push([d.id, d.cat, p.clips.length, Math.round(ms), lit.join('/')]);
    }
    out.sheet = sheet.toDataURL('image/png'); out.sheet2 = sheet2.toDataURL('image/png'); return out;
  });
  fs.writeFileSync('sheet169b.png', Buffer.from(r.sheet.split(',')[1], 'base64')); fs.writeFileSync('sheet916b.png', Buffer.from(r.sheet2.split(',')[1], 'base64'));
  console.log('total', r.total, 'designs', r.designs); for (const row of r.rows) console.log(row.join(' | '));
  console.log('ERRORS:', errs.length, errs.slice(0, 8).join('\n')); await b.close();
})();
