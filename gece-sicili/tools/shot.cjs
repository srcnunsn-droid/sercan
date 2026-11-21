// Screenshot a local HTML page (sheets/plates). Usage: node tools/shot.cjs page.html out.png [w] [h] [query]
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const [page, out, w = "2400", h = "1600", q = ""] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto("file://" + path.resolve(page) + (q ? "?" + q : ""));
  await p.waitForTimeout(400);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out });
  if (errs.length) { console.error("PAGE ERRORS:\n" + errs.join("\n")); process.exitCode = 1; }
  await b.close();
})();
