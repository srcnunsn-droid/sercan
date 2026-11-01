// Accessibility audit: runs axe-core (WCAG 2.1 A/AA rules) on every screen in dark and light themes.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const url = 'file://' + resolve('dist/index.html');
const routes = ['ana-sayfa', 'akademi', 'studyo', 'fabrika', 'kutuphane', 'ayarlar'];
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
let failures = 0;
for (const scheme of ['dark', 'light']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  await page.goto(url); await page.waitForSelector('.stage');
  await page.addScriptTag({ content: axeSource });
  for (const r of routes) {
    await page.evaluate((r) => { location.hash = r; }, r);
    await page.waitForTimeout(r === 'studyo' ? 1200 : 400);
    const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]) })));
    if (res.length) { failures += res.length; console.log(`[${scheme}] ${r}:`, JSON.stringify(res, null, 1)); }
  }
  await page.close();
}
await browser.close();
if (failures) { console.error(`${failures} serious/critical accessibility violation groups`); process.exit(1); }
console.log('a11y OK: no serious or critical WCAG 2.1 AA violations on 6 screens x 2 themes');
