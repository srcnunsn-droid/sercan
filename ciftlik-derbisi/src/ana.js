// BAŞLATICI: her şeyi birbirine bağlar ve oyun döngüsünü çalıştırır.
(async function () {
  const A = window.AYARLAR;
  const params = new URLSearchParams(location.search);
  const testModu = params.get("test") === "1";

  const app = new PIXI.Application({
    width: 1080, height: 1920, backgroundColor: 0x8fd6ff,
    antialias: true, resolution: 1, autoDensity: false, powerPreference: "high-performance"
  });
  document.getElementById("sahne").appendChild(app.view);

  // Pencereye sığdır (yayında 1080x1920 tam oturur)
  function boyutla() {
    const o = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
    app.view.style.width = Math.floor(1080 * o) + "px";
    app.view.style.height = Math.floor(1920 * o) + "px";
  }
  window.addEventListener("resize", boyutla);
  boyutla();

  const kayit = new Kayit();
  await kayit.yukle();
  const varlik = new Varliklar(A);
  try {
    await Promise.race([varlik.tara(), new Promise((r) => setTimeout(r, 10000))]);
  } catch (e) { console.warn("Görsel taraması hatası", e); }

  const oyun = new Oyun(A, kayit);
  const cizim = new Cizim(app, oyun, varlik);
  const baglanti = new Baglanti(A, (o) => oyun.girdi(o));
  baglanti.baslat();

  const derbi = { app, oyun, cizim, baglanti, varlik, kayit, zamanCarpani: 1 };
  window.DERBI = derbi;
  if (testModu) new TestPaneli(derbi);

  let sonFaz = oyun.faz;
  app.ticker.add(() => {
    try {
      const dt = Math.min(app.ticker.deltaMS / 1000, 0.1);
      // test hızlandırma: mantığı birkaç adımda çalıştır
      const adim = Math.max(1, Math.round(derbi.zamanCarpani));
      for (let i = 0; i < adim; i++) oyun.guncelle(dt);
      cizim.guncelle(dt);
      if (oyun.faz !== sonFaz) {
        sonFaz = oyun.faz;
        if (sonFaz === "lobi") varlik.tara().catch(() => {}); // yeni konan dosyaları ara
      }
    } catch (e) {
      // Bir karede hata olsa bile yayın durmasın
      console.error("Kare hatası:", e);
    }
  });
})();
