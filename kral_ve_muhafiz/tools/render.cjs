// Bütün filmi kare kare render eder: headless Chromium (Canvas 2D) → JPEG kareler → ffmpeg (libx264).
// Kullanım: node tools/render.cjs [--workers 3] [--from 0] [--to 72.2] [--out out/video_sessiz.mp4]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1]]]) : a), []));
const ROOT = path.resolve(__dirname, '..');
global.U = require('../src/util.js');
const TL = require('../src/timeline.js');
const FPS = TL.fps;
const from = +(args.from || 0), to = +(args.to || TL.duration);
const workers = +(args.workers || 3);
const outFile = path.resolve(ROOT, args.out || 'out/video_sessiz.mp4');
const tmp = path.join(ROOT, 'out', '.parts');
fs.mkdirSync(tmp, { recursive: true });

const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);
const total = f1 - f0;

async function renderRange(wi, a, b, browser) {
  const part = path.join(tmp, `part_${wi}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => console.log(`[w${wi}] pageerror`, e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
  for (let f = a; f < b; f++) {
    const t = f / FPS;
    const data = await page.evaluate((tt) => { window.renderAt(tt); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    done++;
    if (done % 60 === 0) console.log(`kare ${done}/${total}  (${((Date.now() - T0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await page.close();
  return part;
}

let done = 0; const T0 = Date.now();
(async () => {
  const browser = await chromium.launch();
  const per = Math.ceil(total / workers);
  const jobs = [];
  for (let w = 0; w < workers; w++) {
    const a = f0 + w * per, b = Math.min(f1, a + per);
    if (a < b) jobs.push(renderRange(w, a, b, browser));
  }
  const parts = await Promise.all(jobs);
  await browser.close();
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  await new Promise((res, rej) => {
    const c = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outFile], { stdio: 'inherit' });
    c.on('close', (code) => (code === 0 ? res() : rej(new Error('concat ' + code))));
  });
  console.log(`bitti: ${outFile}  ${total} kare, ${((Date.now() - T0) / 1000).toFixed(0)} s`);
})();
