// YÖNETMEN: oyun olaylarına göre müzik, efekt sesi ve spiker anonslarını yönetir.
(function () {
  class Yonetmen {
    constructor(oyun, ses, spiker) {
      this.oyun = oyun;
      this.ses = ses;
      this.spiker = spiker;
      this.A = oyun.A;
      this._lobiAnons = {};
      this._geriSayim = null;
      this._kutlamaZaman = [];
    }

    hayvanKodu(i) { return this.A.hayvanlar[i] ? this.A.hayvanlar[i].klasor : ""; }

    // Çizim katmanı her oyun olayını buraya da iletir
    olay(o) {
      const s = this.ses, sp = this.spiker, oyun = this.oyun;
      switch (o.tip) {
        case "faz":
          if (o.faz === "lobi") {
            this._lobiAnons = {};
            s.muzik("lobi");
          } else if (o.faz === "start") {
            this._geriSayim = null;
            sp.soyle("start");
          } else if (o.faz === "yaris") {
            s.efekt("duduk");
            sp.soyle("kos", { tekrar: 1 });
            s.muzik(oyun.buyukDerbi ? "derbi" : "yaris");
            setTimeout(() => sp.soyle("yaris_basladi", { bekle: true }), 900);
          } else if (o.faz === "fotofinis") {
            sp.soyle("foto_finis", { tekrar: 1 });
          }
          break;
        case "bolum":
          // lobi açılınca bölümü (ve derbiyi) anons et
          setTimeout(() => {
            sp.soyle("bolum_" + o.kod, { tekrar: 1, bekle: true });
            if (o.buyukDerbi) sp.soyle("buyuk_derbi", { tekrar: 1, bekle: true });
          }, 1200);
          break;
        case "liderDegisti":
          sp.soyle("lider_" + this.hayvanKodu(o.kulvar), { tekrar: 12 });
          break;
        case "sonDuzluk":
          sp.soyle("son_duzluk", { tekrar: 1 });
          break;
        case "bitis":
          s.efekt("kalabalik");
          break;
        case "kazanan":
          this._kazanan(o);
          break;
        case "efekt":
          s.efekt(o.efekt === "hiz" ? "hiz" : o.efekt);
          if (o.kombo > 1) s.sentez("kombo", this.A.sesSeviyesi || 0.7);
          if (["roket", "leylek", "muz", "havuc"].includes(o.efekt)) sp.soyle(o.efekt, { tekrar: 10 });
          break;
        case "kayma":
          if (o.sebep === "takilma") s.efekt("muz", 0.5);
          if (o.sebep === "saman") s.efekt("saman");
          break;
        case "camur":
          s.efekt("camur");
          sp.soyle("camur", { tekrar: 5 });
          break;
        case "aga":
          s.efekt("aga");
          sp.soyle("aga", { tekrar: 20 });
          break;
        case "yarisOlayi":
          if (o.tur === "altinHavuc") { s.efekt("altin"); sp.soyle("altin_havuc", { tekrar: 10 }); }
          else if (o.tur === "ruzgar") { s.efekt("ruzgar"); sp.soyle("ruzgar", { tekrar: 10 }); }
          else if (o.tur === "saman") { sp.soyle("saman", { tekrar: 10 }); }
          break;
        case "katildi":
          s.sentez("katil", this.A.sesSeviyesi || 0.7);
          break;
        case "dolu":
          sp.soyle("dolu", { tekrar: 30 });
          break;
        case "begeni":
          s.tik();
          break;
        case "barYakin":
          sp.soyle("begeni_bar", { tekrar: 40 });
          break;
        case "takip":
          sp.soyle("takip", { tekrar: 30 });
          break;
        case "tahmin":
          s.sentez("tahmin", (this.A.sesSeviyesi || 0.7) * 0.5);
          break;
        default:
          break;
      }
    }

    _kazanan(o) {
      const s = this.ses, sp = this.spiker;
      s.muzik(o.seviye === "efsane" ? "efsane" : "zafer");
      sp.soyle("kazandi_" + this.hayvanKodu(o.kulvar), { tekrar: 1 });
      // En önemli etiketi seslendir
      const sira = ["seri", "efsane", "geridenGeldi", "kilPayi", "ilkZafer"];
      const anahtar = { seri: "seri", efsane: "efsane", geridenGeldi: "geriden_geldi", kilPayi: "kil_payi", ilkZafer: "ilk_zafer" };
      const ilk = sira.find((e) => (o.etiketler || []).includes(e));
      if (ilk) sp.soyle(anahtar[ilk], { tekrar: 1, bekle: true });
      else if (o.seviye === "efsane") sp.soyle("efsane", { tekrar: 1, bekle: true });
      if (o.tahmin && o.tahmin.dogru > 0) sp.soyle("tahmin_dogru", { tekrar: 1, bekle: true });
      setTimeout(() => s.efekt(this.hayvanKodu(o.kulvar)), 600);
      s.efekt("kalabalik", 0.8);
      // Havai fişek sesleri (efsane kutlamada daha çok)
      const n = o.seviye === "efsane" ? 6 : o.seviye === "buyuk" ? 3 : 0;
      for (let i = 0; i < n; i++) setTimeout(() => s.efekt("havai-fisek", 0.7), 900 + i * 1700);
    }

    // Her kare: lobi anonsları ve start geri sayımı
    guncelle(dt) {
      const o = this.oyun, sp = this.spiker;
      this.ses.guncelle(dt);
      sp.guncelle(dt);
      if (o.faz === "lobi") {
        const t = o.fazZaman;
        const bosVar = o.kulvarlar.some((k) => !k.oyuncu);
        const anons = (an, sn, kosul) => { if (!this._lobiAnons[an] && t >= sn && kosul) { this._lobiAnons[an] = true; sp.soyle(an, { tekrar: 20, bekle: true }); } };
        anons("lobi_1", 9, bosVar);
        anons("lobi_3", 22, this.A.tahminAcik !== false);
        anons("lobi_2", 33, bosVar);
      } else if (o.faz === "start") {
        const kalan = Math.ceil(this.A.sure.start - o.fazZaman);
        if (kalan <= 3 && kalan >= 1 && kalan !== this._geriSayim) {
          this._geriSayim = kalan;
          sp.soyle(kalan === 3 ? "uc" : kalan === 2 ? "iki" : "bir", { tekrar: 1 });
          this.ses.sentez("geri-sayim", this.A.sesSeviyesi || 0.7);
        }
      }
    }
  }

  window.Yonetmen = Yonetmen;
})();
