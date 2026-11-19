// 1 saatlik oyun süresini hızlandırılmış çalıştırır; 200 sahte izleyici açık.
// Bellek, sahnedeki nesne sayısı ve kare süresi zamanla büyüyor mu diye bakar.
const { chromium } = require("playwright");
const hedefOyunSn = Number(process.argv[2] || 3600);
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-precise-memory-info", "--js-flags=--expose-gc"] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  const hatalar = [];
  p.on("pageerror", (e) => hatalar.push(e.message));
  p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/404|ERR_CONNECTION_REFUSED|WebSocket/.test(t)) hatalar.push(t); });
  await p.goto("http://localhost:8787/?test=1");
  await p.waitForFunction(() => window.DERBI, null, { timeout: 30000 });
  await p.evaluate(() => {
    document.querySelector('[data-k="stres"]').click();
    DERBI.zamanCarpani = 20;
    window.__sayac = { kare: 0, sure: 0, enKotu: 0 };
    const tik = DERBI.app.ticker;
    let bas = 0;
    tik.add(() => { bas = performance.now(); }, null, 100); // en önce
    tik.add(() => { const s = performance.now() - bas; __sayac.kare++; __sayac.sure += s; __sayac.enKotu = Math.max(__sayac.enKotu, s); }, null, -100);
  });
  const say = () => p.evaluate(() => {
    let n = 0; const yur = (c) => { n++; (c.children || []).forEach(yur); }; yur(DERBI.app.stage);
    const s = __sayac; const ort = s.kare ? s.sure / s.kare : 0; const sonuc = { tur: DERBI.oyun.turNo, nesne: n, parcacik: DERBI.cizim.parcaciklar.length,
      bellekMB: Math.round(performance.memory.usedJSHeapSize / 1048576), kareMs: +ort.toFixed(1), enKotuMs: +s.enKotu.toFixed(1),
      emojiDoku: DERBI.cizim.emojiOnbellek.size, sira: DERBI.oyun.sira.length, kullanici: DERBI.oyun.kullanicilar.size, oyunSn: Math.round(DERBI.oyun.zaman) };
    window.__sayac = { kare: 0, sure: 0, enKotu: 0 }; return sonuc; });
  const bas = Date.now();
  while (true) {
    await p.waitForTimeout(30000);
    const s = await say();
    console.log(new Date().toISOString().slice(11, 19), JSON.stringify(s));
    if (s.oyunSn >= hedefOyunSn || Date.now() - bas > 40 * 60000) break;
  }
  console.log("Hatalar:", hatalar.length ? hatalar.slice(0, 10) : "yok");
  await b.close();
})();
