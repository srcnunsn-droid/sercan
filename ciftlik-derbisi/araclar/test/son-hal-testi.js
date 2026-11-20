// Son sürüm özelliklerini ekran görüntüsüyle dener: katılım komutları, rehber/güç tablosu, beğeni barı, uçan hediye.
const { chromium } = require("playwright");
const cikti = process.argv[2] || ".";
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const hatalar = [];
  p.on("pageerror", (e) => hatalar.push("pageerror: " + e.message));
  p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/404|ERR_CONNECTION_REFUSED|WebSocket/.test(t)) hatalar.push("console: " + t); });
  await p.goto("http://localhost:8787/", { waitUntil: "load" });
  await p.waitForFunction(() => window.DERBI, null, { timeout: 40000 });
  const D = (fn, arg) => p.evaluate(fn, arg);
  const sonuc = await D(() => {
    const o = DERBI.oyun, Y = window.Yardimci;
    const yaz = (id, ad, metin) => o.girdi({ tip: "yorum", kullanici: { id, ad }, metin });
    yaz("a", "Ayşe", "katıl"); yaz("b", "Mehmet", "tavk"); yaz("c", "Zeynep", "eşşek"); yaz("d", "Ali", "KİRPİİ");
    yaz("e", "Elif", "join"); yaz("f", "Can", "merhaba");
    return o.kulvarlar.map((k) => (k.oyuncu ? k.oyuncu.ad : "-")).join(",");
  });
  console.log("Kulvarlar:", sonuc);
  await p.waitForTimeout(700);
  await p.screenshot({ path: cikti + "/s1-lobi-katilim.png" });
  // güç tablosu sayfasına git
  await D(() => { const c = DERBI.cizim; const s = c._rehberSayfalari(); c._rehberNo = s.findIndex((x) => x.guc) - 1; c._rehberZaman = -99; });
  await p.waitForTimeout(800);
  await p.screenshot({ path: cikti + "/s2-guc-tablosu.png" });
  await D(() => { DERBI.oyun.fazZaman = 999; });
  await p.waitForTimeout(300);
  await D(() => { DERBI.oyun.fazZaman = 999; DERBI.zamanCarpani = 15; });
  await p.waitForTimeout(1500);
  await D(() => {
    DERBI.zamanCarpani = 1;
    const o = DERBI.oyun;
    for (let i = 0; i < 30; i++) o.girdi({ tip: "begeni", kullanici: { id: ["a", "b", "c"][i % 3], ad: ["Ayşe", "Mehmet", "Zeynep"][i % 3] }, sayi: 3 + (i % 3) * 2 });
    o.girdi({ tip: "hediye", kullanici: { id: "b", ad: "Mehmet" }, jeton: 1, hediyeAdi: "Gül", birimJeton: 1 });
    o.girdi({ tip: "hediye", kullanici: { id: "c", ad: "Zeynep" }, jeton: 100, hediyeAdi: "Elle Kalp", birimJeton: 100 });
    const c = DERBI.cizim; c._rehberNo = -1; c._rehberZaman = -99;
  });
  await p.waitForTimeout(1300);
  await p.screenshot({ path: cikti + "/s3-yaris-hediye.png" });
  const durum = await D(() => ({ hedef: DERBI.oyun.begeniHedef, bar: DERBI.oyun.begeniBar, katalog: Object.keys(DERBI.oyun.hediyeKatalogu), tablo: DERBI.oyun.gucTablosu().map((t) => t.enAz + ":" + (t.hediye ? t.hediye.ad : "-")).join(" ") }));
  console.log(JSON.stringify(durum));
  // sessizlik çağrısı
  await D(() => { const o = DERBI.oyun; o.sonYorumZaman = o.zaman - 40; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: cikti + "/s4-sessizlik.png" });
  console.log(hatalar.length ? hatalar.join("\n") : "Hata yok");
  await b.close();
})();
