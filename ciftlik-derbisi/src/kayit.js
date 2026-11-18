// KALICI KAYIT: "Efsaneler" bilgisayarda (veri/kayit.json) saklanır.
// BASLAT.bat ile açılan yerel sunucu dosyaya yazar; sunucu yoksa tarayıcı hafızası kullanılır.
// "Bu gece" tablosu ve Çiftlik Ağası 6 saat hareketsiz kalınca (yeni yayın) sıfırlanır.
(function () {
  const ANAHTAR = "ciftlikDerbisiKayit";
  const YENI_YAYIN_SAAT = 6;

  class Kayit {
    constructor() {
      this.veri = { efsaneler: {}, buGece: {}, aga: null, buGeceZaman: 0 };
      this._zamanlayici = null;
      this.sunucuVar = false;
    }

    async yukle() {
      let v = null;
      try {
        const r = await fetch("veri/kayit.json?v=" + Date.now(), { cache: "no-store" });
        if (r.ok) { v = await r.json(); this.sunucuVar = true; }
      } catch (e) { /* sunucu yok */ }
      try {
        const yerel = JSON.parse(localStorage.getItem(ANAHTAR) || "null");
        // Hangisi daha yeniyse onu kullan
        if (yerel && (!v || (yerel.kayitZamani || 0) > (v.kayitZamani || 0))) v = yerel;
      } catch (e) { /* tarayıcı hafızası kapalı olabilir */ }
      if (v && typeof v === "object") Object.assign(this.veri, v);
      this.veri.efsaneler = this.veri.efsaneler || {};
      this.veri.buGece = this.veri.buGece || {};
      const eski = Date.now() - (this.veri.buGeceZaman || 0) > YENI_YAYIN_SAAT * 3600 * 1000;
      if (eski) { this.veri.buGece = {}; this.veri.aga = null; }
      // Sunucu kontrolü (POST yapılabiliyor mu)
      try {
        const r = await fetch("api/durum", { cache: "no-store" });
        this.sunucuVar = r.ok;
      } catch (e) { this.sunucuVar = false; }
      return this.veri;
    }

    // Sık çağrılabilir; 1.5 sn içinde toplu kaydeder
    kaydet() {
      clearTimeout(this._zamanlayici);
      this._zamanlayici = setTimeout(() => this._yaz(), 1500);
    }

    async _yaz() {
      this.veri.kayitZamani = Date.now();
      // Çok büyümesin: en iyi 300 efsane ve 300 "bu gece" kaydı
      this.veri.efsaneler = kirp(this.veri.efsaneler, "galibiyet", 300);
      this.veri.buGece = kirp(this.veri.buGece, "puan", 300);
      const metin = JSON.stringify(this.veri);
      try { localStorage.setItem(ANAHTAR, metin); } catch (e) { /* yoksay */ }
      if (!this.sunucuVar) return;
      try {
        await fetch("api/kaydet", { method: "POST", headers: { "Content-Type": "application/json" }, body: metin });
      } catch (e) { /* sunucu kapandıysa bir dahakine */ }
    }
  }

  function kirp(nesne, alan, n) {
    const ids = Object.keys(nesne);
    if (ids.length <= n) return nesne;
    ids.sort((a, b) => (nesne[b][alan] || 0) - (nesne[a][alan] || 0));
    for (const id of ids.slice(n)) delete nesne[id]; // oyunun tuttuğu nesne aynı kalsın
    return nesne;
  }

  window.Kayit = Kayit;
})();
