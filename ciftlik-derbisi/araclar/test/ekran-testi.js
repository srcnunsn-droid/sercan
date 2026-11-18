// Tarayıcıda oyunu açıp her fazın ekran görüntüsünü alır (geliştirici testi).
const { chromium } = require("playwright");
const cikti = process.argv[2] || ".";
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const hatalar = [];
  p.on("pageerror", (e) => hatalar.push("pageerror: " + e.message));
  p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/404|ERR_CONNECTION_REFUSED/.test(t)) hatalar.push("console: " + t); });
  await p.goto("http://localhost:8787/", { waitUntil: "load" });
  await p.waitForFunction(() => window.DERBI, null, { timeout: 30000 });
  const D = (fn, arg) => p.evaluate(fn, arg);
  // sahte izleyiciler katılsın
  await D(() => {
    const o = DERBI.oyun;
    ["Ayşe", "Mehmet", "Zeynep", "Ali", "Elif", "Can"].forEach((ad, i) => o.girdi({ tip: "yorum", kullanici: { id: "k" + i, ad }, metin: String(i + 1) }));
    o.girdi({ tip: "yorum", kullanici: { id: "k9", ad: "Burak" }, metin: "tavuk" });
    o.girdi({ tip: "hediye", kullanici: { id: "k2", ad: "Zeynep" }, jeton: 500 });
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: cikti + "/1-lobi.png" });
  await D(() => { DERBI.oyun.fazZaman = 999; });
  await p.waitForTimeout(2700);
  await p.screenshot({ path: cikti + "/2-start.png" });
  await D(() => { DERBI.oyun.fazZaman = 999; });
  await p.waitForTimeout(400);
  await D(() => { DERBI.zamanCarpani = 20; });
  await p.waitForTimeout(1200);
  await D(() => {
    DERBI.zamanCarpani = 1;
    const o = DERBI.oyun;
    o.girdi({ tip: "hediye", kullanici: { id: "k0", ad: "Ayşe" }, jeton: 10 });
    o.girdi({ tip: "hediye", kullanici: { id: "k1", ad: "Mehmet" }, jeton: 100 });
    o.girdi({ tip: "hediye", kullanici: { id: "k3", ad: "Ali" }, jeton: 30 });
    o.girdi({ tip: "hediye", kullanici: { id: "k4", ad: "Elif" }, jeton: 5 });
    o.girdi({ tip: "begeni", kullanici: { id: "k5", ad: "Can" }, sayi: 10 });
    o.girdi({ tip: "takip", kullanici: { id: "k5", ad: "Can" } });
  });
  await p.waitForTimeout(700);
  await p.screenshot({ path: cikti + "/3-yaris.png" });
  await D(() => { const o = DERBI.oyun; o.begeniBar = o.A.ucretsiz.begeniBariHedef - 1; o.girdi({ tip: "begeni", kullanici: { id: "x" }, sayi: 5 }); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: cikti + "/4-camur.png" });
  await D(() => { DERBI.zamanCarpani = 20; });
  await p.waitForFunction(() => DERBI.oyun.faz === "fotofinis", null, { timeout: 60000 });
  await D(() => { DERBI.zamanCarpani = 1; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: cikti + "/5-fotofinis.png" });
  await p.waitForFunction(() => DERBI.oyun.faz === "kursu", null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: cikti + "/6-kursu.png" });
  const fps = await D(() => DERBI.app.ticker.FPS);
  console.log("FPS:", Math.round(fps));
  console.log(hatalar.length ? hatalar.join("\n") : "Hata yok");
  await b.close();
})();
