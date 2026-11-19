// SPİKER: oyundaki olaylara göre Türkçe anons yapar ve ekranda alt yazı gösterir.
// Ses dosyaları: assets/ses/spiker/<anahtar>.mp3  (yoksa sadece alt yazı çıkar)
// Hiçbir anons hediye istemez; sadece ücretsiz eylemlere (yorum, beğeni, tahmin) çağırır.
(function () {
  const SATIRLAR = {
    lobi_1: "Yoruma hayvanının adını ya da numarasını yaz, hemen yarışa katıl!",
    lobi_2: "Kulvarlar doluyor! Tavuk mu, kaplumbağa mı? Seçimini yorumla yaz!",
    lobi_3: "Kulvar bulamadın mı? Tahmin yaz, kazananı bil, puanı kap!",
    dolu: "Bütün kulvarlar doldu! Yeni gelenler sıraya!",
    start: "Hayvanlar start çizgisinde, nefesler tutuldu!",
    uc: "Üç!",
    iki: "İki!",
    bir: "Bir!",
    kos: "Koş!",
    yaris_basladi: "Ve yarış başlıyor! Hayvanlar pistte, heyecan dorukta!",
    lider_tavuk: "Ve tavuk öne geçti!",
    lider_kaplumbaga: "Kaplumbağa liderliği aldı! Kim demiş yavaş diye?",
    lider_keci: "Keçi öne fırladı!",
    lider_ordek: "Ördek liderliğe yükseldi!",
    lider_domuz: "Domuz öne geçti, pist titriyor!",
    lider_inek: "İnek liderlikte!",
    lider_esek: "Eşek öne geçti, inatla koşuyor!",
    lider_kirpi: "Kirpi liderliğe yerleşti!",
    kazandi_tavuk: "Ve kazanan: Tavuk!",
    kazandi_kaplumbaga: "Ve kazanan: Kaplumbağa!",
    kazandi_keci: "Ve kazanan: Keçi!",
    kazandi_ordek: "Ve kazanan: Ördek!",
    kazandi_domuz: "Ve kazanan: Domuz!",
    kazandi_inek: "Ve kazanan: İnek!",
    kazandi_esek: "Ve kazanan: Eşek!",
    kazandi_kirpi: "Ve kazanan: Kirpi!",
    son_duzluk: "Son düzlüğe girdik! Nefesler tutuldu!",
    foto_finis: "Foto finiş! Çok yakın!",
    kil_payi: "Kıl payı! İnanılmaz bir bitiş!",
    geriden_geldi: "Sonlardan gelip kazandı! Müthiş bir dönüş!",
    camur: "Dikkat, çamur yağmuru! Herkes kayıyor!",
    roket: "Roket ateşlendi!",
    leylek: "Dev leylek geldi, birini kaptı!",
    muz: "Muz kabuğu! Eyvah, kaydı!",
    havuc: "Sihirli havuç! Süper hız!",
    aga: "Dikkat! Çiftlik Ağası sahneye çıktı! Herkes selam versin!",
    altin_havuc: "Pistte bir altın havuç belirdi!",
    ruzgar: "Arkadan rüzgar esti, gerideki hayvanlar uçuyor!",
    saman: "Lider saman balyasına takıldı!",
    efsane: "Bu bir efsane! Tarih yazıldı!",
    ilk_zafer: "İlk zaferin kutlu olsun!",
    seri: "Üst üste kazanıyor! Durdurun şunu!",
    buyuk_derbi: "Büyük Derbi başlıyor! Bu turda puanlar iki katı!",
    tahmin_dogru: "Doğru tahmin edenlere tebrikler!",
    bolum_ciftlik: "Bu tur: Çiftlik pisti!",
    bolum_bataklik: "Bu tur: Çamurlu bataklık! Kaymaya hazır olun!",
    bolum_kar: "Bu tur: Karlı dağ! Pist buz gibi!",
    bolum_gece: "Bu tur: Gece yarışı! Işıklar söndü!",
    bolum_firtina: "Bu turda fırtına var! Rüzgar her şeyi değiştirebilir!",
    bolum_hasat: "Bu tur: Hasat şenliği! Pistte altın havuçlar var!",
    begeni_bar: "Beğeniler yağıyor! Bar dolmak üzere!",
    takip: "Yeni takipçimiz var, hoş geldin!"
  };

  // Öncelik: yüksek öncelikli anons sıradakileri ezer; düşükler kalabalıkta atlanır.
  const ONCELIK = {
    uc: 9, iki: 9, bir: 9, kos: 9, start: 6,
    kazandi: 9, kil_payi: 8, geriden_geldi: 8, efsane: 8, ilk_zafer: 7, seri: 8, foto_finis: 8,
    buyuk_derbi: 7, bolum: 6, yaris_basladi: 7, son_duzluk: 7, aga: 7, camur: 6,
    lider: 5, altin_havuc: 5, ruzgar: 5, saman: 5, leylek: 4, roket: 4, muz: 4, havuc: 4,
    tahmin_dogru: 6, lobi: 3, dolu: 4, begeni_bar: 3, takip: 2
  };
  function oncelik(anahtar) {
    if (ONCELIK[anahtar] != null) return ONCELIK[anahtar];
    const kok = anahtar.split("_")[0];
    return ONCELIK[kok] != null ? ONCELIK[kok] : 3;
  }

  class Spiker {
    constructor(ses) {
      this.ses = ses;          // Ses modülü (çalma)
      this.kuyruk = [];
      this.konusuyor = false;
      this.sonAnahtar = {};    // aynı anonsu çok sık tekrarlamasın
      this.altyazi = null;     // { metin, kalan }
      this.bitis = 0;
    }

    soyle(anahtar, secenek) {
      const metin = SATIRLAR[anahtar];
      if (!metin) return;
      const simdi = performance.now() / 1000;
      const tekrarSn = (secenek && secenek.tekrar) || 8;
      if (this.sonAnahtar[anahtar] && simdi - this.sonAnahtar[anahtar] < tekrarSn) return;
      const p = oncelik(anahtar);
      // Konuşma sürerken düşük öncelikliler beklemesin, atlansın
      if ((this.konusuyor || this.kuyruk.length) && p < 5 && !(secenek && secenek.bekle)) return;
      if (p >= 9) this.kuyruk = this.kuyruk.filter((k) => oncelik(k) >= 9); // acil olanlar öne
      if (this.kuyruk.length > 3) this.kuyruk.shift();
      this.kuyruk.push(anahtar);
      this.sonAnahtar[anahtar] = simdi;
      this._sonraki();
    }

    _sonraki() {
      if (this.konusuyor || !this.kuyruk.length) return;
      const anahtar = this.kuyruk.shift();
      const metin = SATIRLAR[anahtar];
      this.konusuyor = true;
      this.altyazi = { metin, kalan: Math.max(2.2, metin.length * 0.07) };
      const bitti = () => {
        this.konusuyor = false;
        setTimeout(() => this._sonraki(), 250);
      };
      const sure = this.ses ? this.ses.spikerCal(anahtar, bitti) : 0;
      if (!sure) setTimeout(bitti, this.altyazi.kalan * 1000); // ses dosyası yoksa alt yazı süresi kadar bekle
    }

    guncelle(dt) {
      if (this.altyazi) {
        this.altyazi.kalan -= dt;
        if (this.altyazi.kalan <= 0 && !this.konusuyor) this.altyazi = null;
      }
    }
  }

  Spiker.SATIRLAR = SATIRLAR;
  window.Spiker = Spiker;
  if (typeof module !== "undefined") module.exports = { SATIRLAR };
})();
