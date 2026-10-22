// Kullanım:
//   node render.mjs --stills=1,5.5,12.6   -> out/stills/*.jpg
//   node render.mjs --fps=60              -> out/frames/*.jpg + out/kedi-f1.mp4 (audio.wav varsa sesli)
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const fps = Number(args.fps || 60), dur = 30, workers = Number(args.workers || 4);
const out = path.join(dir, 'out');

const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function page() {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.evaluate(() => document.fonts.ready);
  return p;
}
async function grab(p, t) {
  const b64 = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
}

if (args.stills) {
  const d = path.join(out, 'stills'); fs.mkdirSync(d, { recursive: true });
  const p = await page();
  for (const t of args.stills.split(',').map(Number)) fs.writeFileSync(path.join(d, `t${t.toFixed(2)}.jpg`), await grab(p, t));
} else {
  const d = path.join(out, 'frames'); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
  const n = Math.round(fps * dur);
  let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const p = await page();
    for (let i = w; i < n; i += workers) {
      fs.writeFileSync(path.join(d, String(i).padStart(5, '0') + '.jpg'), await grab(p, i / fps));
      if (++done % 300 === 0) console.log(`${done}/${n}`);
    }
  }));
  const audio = path.join(dir, 'audio.wav');
  const mp4 = path.join(dir, 'kedi-f1.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(d, '%05d.jpg'),
    ...(fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k'] : []),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-shortest', mp4], { stdio: 'inherit' });
  console.log('Hazır: ' + mp4);
}
await browser.close();
