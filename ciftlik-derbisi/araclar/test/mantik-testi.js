// Oyun mantığını tarayıcı olmadan, hızlandırılmış zamanla dener (geliştirici testi).
// Çalıştırma: node araclar/test/mantik-testi.js
global.window = {};
require("../../config.js");
require("../../src/metinler.js");
require("../../src/yardimci.js");
const Oyun = require("../../src/oyun.js");
const A = window.AYARLAR;
const kayit = { veri: {}, kaydet() { this.sayac = (this.sayac || 0) + 1; } };
const oyun = new Oyun(A, kayit);
const isimler = ["Ayşe", "Mehmet", "Zeynep", "Ali", "Elif", "Can", "Deniz", "Ece", "Burak", "Selin"];
const dt = 1 / 60;
let t = 0, turSureleri = [], yarisBas = 0, kazananlar = {}, sonFaz = oyun.faz, bitisSureleri = [];
const hedefTur = 30;
while (oyun.turNo <= hedefTur && t < 3600 * 2) {
  // sahte izleyiciler
  if (Math.random() < 0.08) {
    const i = (Math.random() * 200) | 0;
    oyun.girdi({ tip: "yorum", kullanici: { id: "u" + i, ad: isimler[i % 10] + i }, metin: Math.random() < 0.5 ? String(1 + (Math.random() * 8 | 0)) : A.hayvanlar[(Math.random() * 8) | 0].ad });
  }
  if (Math.random() < 0.3) oyun.girdi({ tip: "begeni", kullanici: { id: "u" + ((Math.random() * 200) | 0) }, sayi: 1 + (Math.random() * 15 | 0) });
  if (Math.random() < 0.004) {
    const j = [1, 5, 10, 30, 100, 500][(Math.random() * 6) | 0];
    oyun.girdi({ tip: "hediye", kullanici: { id: "u" + ((Math.random() * 200) | 0), ad: "Hediyeci" }, jeton: j });
  }
  oyun.guncelle(dt);
  t += dt;
  if (oyun.faz !== sonFaz) {
    if (oyun.faz === "yaris") yarisBas = t;
    if (oyun.faz === "kursu") {
      bitisSureleri.push(t - yarisBas);
      kazananlar[oyun.sonuc.kazanan] = (kazananlar[oyun.sonuc.kazanan] || 0) + 1;
    }
    sonFaz = oyun.faz;
  }
}
const ort = bitisSureleri.reduce((a, b) => a + b, 0) / bitisSureleri.length;
console.log("Tur sayısı:", bitisSureleri.length);
console.log("Yarış+foto süresi ort/min/max (sn):", ort.toFixed(1), Math.min(...bitisSureleri).toFixed(1), Math.max(...bitisSureleri).toFixed(1));
console.log("Kazanan kulvar dağılımı:", JSON.stringify(kazananlar));
console.log("Efsaneler:", JSON.stringify(oyun.efsaneTablosu(3)));
console.log("Bu gece:", JSON.stringify(oyun.buGeceTablosu(3)));
console.log("Ağa:", JSON.stringify(oyun.aga), "Sıra uzunluğu:", oyun.sira.length, "Olay kuyruğu:", oyun.olaylar.length, "Kayıt sayısı:", kayit.sayac);
// Kurallar
const Y = window.Yardimci;
const ok = (k, m) => { if (!k) { console.log("HATA:", m); process.exitCode = 1; } };
ok(Y.yorumdanHayvan("kaplumbağa!!", A.hayvanlar) === 1, "kaplumbağa");
ok(Y.yorumdanHayvan("3", A.hayvanlar) === 2, "3");
ok(Y.yorumdanHayvan("ben İNEK istiyorum", A.hayvanlar) === 5, "inek");
ok(Y.yorumdanHayvan("🦔", A.hayvanlar) === 7, "emoji");
ok(Y.yorumdanHayvan("merhaba", A.hayvanlar) === -1, "merhaba");
ok(Y.yorumdanHayvan("9", A.hayvanlar) === -1, "9");
ok(!Y.kufurVarMi("Kemal", A.kufurListesi), "Kemal");
ok(!Y.kufurVarMi("Işık", A.kufurListesi), "Işık");
ok(Y.kufurVarMi("amk", A.kufurListesi), "amk");
ok(Y.isimTemizle("Çokuzunbirisimburada123", "x", A).length <= 14, "isim uzunluk");
console.log(Y.isimTemizle("Çokuzunbirisimburada123", "x", A), Y.isimTemizle("orospu", "x", A));
console.log(process.exitCode ? "BAZI TESTLER BAŞARISIZ" : "Tüm kural testleri geçti");
