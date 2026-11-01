// Smoke test: open the single-file build in headless Chromium, visit every screen at phone and desktop
// width, fail on console errors or horizontal overflow, and save screenshots.
import { createRequire } from 'node:module';
// Playwright is preinstalled globally in CI/cloud images; fall back to a local install if present.
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = process.env.SHOTS ?? 'screenshots';
mkdirSync(out, { recursive: true });
const url = 'file://' + resolve('dist/index.html');
const routes = ['ana-sayfa', 'akademi', 'studyo', 'fabrika', 'kutuphane', 'ayarlar'];
const errors = [];
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

for (const [name, viewport, scheme] of [['phone', { width: 390, height: 844 }, 'dark'], ['desktop', { width: 1366, height: 900 }, 'dark'], ['desktop-light', { width: 1366, height: 900 }, 'light']]) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, deviceScaleFactor: name === 'phone' ? 2 : 1, hasTouch: name === 'phone' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_|Failed to load resource/.test(m.text())) errors.push(`[${name}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
  await page.goto(url);
  await page.waitForSelector('.stage');
  for (const r of routes) {
    await page.evaluate((r) => { location.hash = r; }, r);
    await page.waitForTimeout(r === 'studyo' ? 1500 : 500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errors.push(`[${name}] ${r}: horizontal overflow ${overflow}px`);
    await page.screenshot({ path: `${out}/${name}-${r}.png`, fullPage: name !== 'phone' });
  }
  if (name === 'desktop') {
    // walk through the first lesson and the catalog
    await page.evaluate(() => { location.hash = 'akademi'; });
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Başla' }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name}-lesson-demo.png`, fullPage: true });
    await page.getByRole('button', { name: /Devam/ }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}-lesson-game.png`, fullPage: true });
    await page.evaluate(() => { location.hash = 'studyo'; });
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Katalog/ }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${name}-catalog.png` });
    await page.keyboard.press('Control+k');
    await page.keyboard.type('alt açı');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${name}-palette.png` });
    await page.keyboard.press('Escape');
  }
  await ctx.close();
}
await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${routes.length} screens x 3 contexts, no console errors, no horizontal overflow. Screenshots in ${out}/`);
