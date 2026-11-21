// Fast dev preview: render chosen times of index.html / index-h.html to PNGs via the player directly.
// Usage: node tools/frames.cjs index.html outdir 0,1.2,5 [scale]
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const [page, out, times, scale = "0.5"] = process.argv.slice(2);
  const horiz = process.env.HORIZ === "1";
  const W = horiz ? 1920 : 1080, H = horiz ? 1080 : 1920;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: +scale });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto("file://" + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  if (errs.length) { console.error(errs.join("\n")); }
  for (const t of times.split(",").map(Number)) {
    await p.evaluate((t) => window.__gs.render(t), t);
    await p.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(6, "0")}.png`) });
  }
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
