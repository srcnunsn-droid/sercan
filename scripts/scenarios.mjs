// Three end-to-end user scenarios (Faz 7 acceptance), each in a fresh browser profile.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = 'file://' + resolve('dist/index.html');
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const errors = [];

async function fresh(viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url); await page.waitForSelector('.stage');
  return { ctx, page };
}
const click = (page, name, opts = {}) => page.getByRole('button', { name, ...opts }).first().click();
async function step(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push(`✓ ${name} (${((Date.now() - t0) / 1000).toFixed(1)} sn)`); }
  catch (e) { results.push(`✗ ${name}: ${e.message.split('\n')[0]}`); }
}

// 1) Learner on a phone: finishes lesson M1.L1 end to end and earns XP.
await step('Öğrenci (telefon): M1.L1 dersini baştan sona bitirir, XP kazanır', async () => {
  const { ctx, page } = await fresh({ width: 390, height: 844 });
  await page.evaluate(() => { location.hash = 'akademi'; });
  await click(page, 'Başla');
  await click(page, /^Devam/); // demo -> game
  const pairs = [['Alt açı', 'Güç'], ['Üst açı', 'Kırılganlık'], ['Dutch açı', 'Panik'], ['Çok geniş plan', 'Yalnızlık'], ['Göz hizası', 'Eşitlik']];
  for (const [l, r] of pairs) { await click(page, l, { exact: true }); await click(page, r, { exact: true }); }
  await page.waitForSelector('#write-text', { timeout: 5000 });
  await page.fill('#write-text', 'Scene: Elif and Kerem stand facing each other on a train platform.\nCamera: medium shot, eye level, 40mm.\nCharacters: @image-1 woman in a camel coat, @image-2 man in a navy peacoat.\nLight: soft overcast light from the front left, cool 6500K, soft shadows to the right.\nEnvironment: old stone platform at dusk.\nNo sharpen, no color bleeding, natural photographic texture.');
  await click(page, 'Değerlendir');
  const score = Number(await page.locator('.statline b').first().innerText());
  if (score < 80) throw new Error(`rubric score ${score} < 80`);
  await click(page, /^Devam/); // write -> quiz
  await click(page, 'Light', { exact: true });
  await click(page, 'No sharpen, no color bleeding, natural photographic texture.', { exact: true });
  await click(page, /^Devam/); // quiz -> export
  await click(page, /Stüdyoya aktar/);
  await page.waitForSelector('text=Laboratuvar');
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('seco.progress') ?? '{}'));
  await page.waitForTimeout(900);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('seco.progress') ?? '{}'));
  const p = saved.xp ? saved : progress;
  if (!(p.completedLessons ?? []).includes('m1.l1')) throw new Error('lesson not recorded as completed');
  if ((p.xp ?? 0) < 100) throw new Error(`xp ${p.xp} < 100`);
  results.push(`   XP: ${p.xp}, rubrik puanı: ${score}`);
  await ctx.close();
});

// 2) Producer: new short-drama project from scratch to video prompts with references.
await step('Yapımcı: sıfırdan short drama projesi kurar, video promptlarını alır', async () => {
  const { ctx, page } = await fresh();
  await page.evaluate(() => { location.hash = 'kutuphane'; });
  await click(page, /Yeni proje/);
  await page.fill('#f-title', 'Kadeh');
  await page.selectOption('#f-tpl', 'short-drama');
  await click(page, 'Şablon akışını uygula');
  await click(page, /^Devam/); // -> story
  for (let i = 0; i < 3; i++) await page.fill(`#s-en-${i}`, ['A single drop falls into the king’s goblet, close-up.', 'The king lifts the goblet, the queen watches without blinking.', 'He stops, the goblet an inch from his lips.'][i]);
  await click(page, /^Devam/); // -> characters
  await click(page, /Karakter ekle/);
  await page.fill('#c-n-0', 'Kral');
  await page.fill('#c-de-0', '60-year-old man, grey beard, deep-set eyes');
  await page.fill('#c-w-0', 'dark red velvet robe, gold crown');
  await click(page, /^Devam/); // -> location
  await click(page, 'Mekân ekle');
  await page.fill('#l-desc', 'stone throne hall with tall columns and torches');
  await click(page, /^Devam/); await click(page, /^Devam/); // -> frames -> gate
  await page.locator('#gate').check();
  await click(page, /^Devam/); // -> video
  await page.waitForSelector('text=Sahne paketi');
  const txt = await page.locator('.prompt pre').first().innerText();
  if (!txt.includes('throne hall')) throw new Error('location missing from video prompt');
  if (!txt.trim().endsWith('No sharpen, no color bleeding, natural photographic texture.')) throw new Error('texture line missing');
  await ctx.close();
});

// 3) Backup: export a project to JSON, delete it, import it back.
await step('Yedek: projeyi JSON olarak indirir, siler, geri yükler', async () => {
  const { ctx, page } = await fresh();
  await page.evaluate(() => { location.hash = 'kutuphane'; });
  const [dl] = await Promise.all([page.waitForEvent('download'), click(page, /JSON olarak dışa aktar/)]);
  const path = await dl.path();
  const json = JSON.parse(readFileSync(path, 'utf8'));
  if (!json.title?.includes('İstasyonda veda')) throw new Error('export missing title');
  await page.getByRole('button', { name: /sil$/ }).first().click();
  await click(page, 'Evet, sil');
  await page.fill('#paste-json', readFileSync(path, 'utf8'));
  await click(page, 'JSON içe aktar');
  await page.waitForSelector('text=Proje içe aktarıldı.');
  const titles = await page.locator('article.tile b').allInnerTexts();
  if (!titles.some((t) => t.includes('İstasyonda veda'))) throw new Error('project not restored');
  await ctx.close();
});

await browser.close();
console.log(results.join('\n'));
if (errors.length) console.error('page errors:\n' + errors.join('\n'));
if (results.some((r) => r.startsWith('✗')) || errors.length) process.exit(1);
