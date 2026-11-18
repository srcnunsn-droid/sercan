// Küçük yardımcı fonksiyonlar (isim temizleme, yorum çözümleme, metin).
(function () {
  const TR_HARF = { "ç": "c", "ğ": "g", "ı": "i", "İ": "i", "i̇": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };

  // Türkçe karakterleri sadeleştirip küçük harfe çevirir: "Kaplumbağa" -> "kaplumbaga"
  function sadelestir(metin) {
    return String(metin || "")
      .toLocaleLowerCase("tr")
      .replace(/[çğıöşüâîûİ]|i̇/g, (h) => TR_HARF[h] || h);
  }

  // Küfür kontrolü: kısa kelimeler (3 harf ve altı) sadece tam kelime olarak,
  // uzunlar kelimenin içinde de aranır. "Kemal" içindeki "mal" yakalanmaz.
  function kufurVarMi(metin, liste) {
    const sade = sadelestir(metin);
    const kelimeler = sade.split(/[^a-z0-9]+/).filter(Boolean);
    const bitisik = kelimeler.join("");
    for (const k of liste || []) {
      if (!k) continue;
      if (k.length <= 3) {
        if (kelimeler.includes(k)) return true;
      } else if (bitisik.includes(k)) {
        return true;
      }
    }
    return false;
  }

  // Görünür isim: küfürlüyse Çiftçi1234, değilse kısaltılmış takma ad.
  function isimTemizle(ham, id, A) {
    let ad = String(ham || "").replace(/[\u0000-\u001f​-‏‪-‮]/g, "").trim();
    if (!ad || kufurVarMi(ad, A.kufurListesi)) {
      let h = 0;
      const s = String(id || ham || Math.random());
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      ad = (A.dil === "en" ? "Farmer" : "Çiftçi") + (1000 + (h % 9000));
    }
    const harfler = Array.from(ad); // emoji'leri bölmemek için
    if (harfler.length > A.isimUzunlugu) ad = harfler.slice(0, A.isimUzunlugu - 1).join("") + "…";
    return ad;
  }

  // Yorumdan hayvan seç: hayvan adı/takma adı ya da tek başına 1-8 numarası.
  // Bulamazsa -1 döner.
  function yorumdanHayvan(yorum, hayvanlar) {
    const ham = String(yorum || "");
    const sade = sadelestir(ham);
    // Tek başına numara: "3", "#3", "3!" , "no 3"
    const sayi = sade.match(/(?:^|[^0-9])([1-9])(?![0-9])/);
    const kelimeler = sade.split(/[^a-z0-9]+/).filter(Boolean);
    for (let i = 0; i < hayvanlar.length; i++) {
      for (const t of hayvanlar[i].takmaAdlar) {
        if (/^[a-z]+$/.test(t)) {
          if (kelimeler.some((k) => k.startsWith(t))) return i;
        } else if (ham.includes(t)) {
          return i; // emoji
        }
      }
    }
    if (sayi && kelimeler.length <= 3) {
      const n = parseInt(sayi[1], 10);
      if (n >= 1 && n <= hayvanlar.length) return n - 1;
    }
    return -1;
  }

  // "{ad} → {efekt}" kalıbını doldurur
  function doldur(kalip, degerler) {
    return String(kalip).replace(/\{(\w+)\}/g, (_, k) => (degerler && degerler[k] != null ? degerler[k] : ""));
  }

  window.Yardimci = { sadelestir, kufurVarMi, isimTemizle, yorumdanHayvan, doldur };
  if (typeof module !== "undefined") module.exports = window.Yardimci;
})();
