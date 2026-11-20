// OYUN MANTIĞI (çizimden bağımsız). Tur döngüsü, yarış fiziği, efektler, sıralamalar.
// Çizim tarafı oyun.olaylar listesini okuyarak animasyon yapar.
(function () {
  const Y = (typeof window !== "undefined" && window.Yardimci) || require("./yardimci.js");
  const PIST = 100; // pist uzunluğu (birim). Efekt yüzdeleri buna göre.
  const FAZLAR = ["lobi", "start", "yaris", "fotofinis", "kursu"];

  function rastgele(a, b) { return a + Math.random() * (b - a); }

  class Oyun {
    constructor(A, kayit) {
      this.A = A;
      this.kayit = kayit; // { veri, kaydet() }
      this.M = (window.METINLER && window.METINLER[A.dil]) || window.METINLER.tr;
      this.PIST = PIST;
      this.zaman = 0;          // oyun saati (sn)
      this.faz = "lobi";
      this.fazZaman = 0;       // fazın başından beri geçen gerçek süre
      this.zamanOlcegi = 1;    // foto finişte ağır çekim
      this.turNo = 0;
      this.olaylar = [];       // çizime giden olaylar
      this.sira = [];          // sonraki tur sırası [{id, ad, tercih, oncelik}]
      this.kullanicilar = new Map(); // id -> kullanıcı bilgisi
      this.bekleyenEfektler = new Map(); // id -> [{efekt, kombo}]
      this.begeniBar = 0;
      this.camurBekliyor = false;
      this.camurKalan = 0;
      this.camurBekleme = 0;
      this.sonuc = null;       // kürsü bilgisi
      this.kazananKulvar = -1;
      this.fotoBasladi = false;
      this.kulvarlar = A.hayvanlar.map((h, i) => this._yeniKulvar(i));
      const v = this.kayit.veri;
      this.efsaneler = v.efsaneler || (v.efsaneler = {});
      this.buGece = v.buGece || (v.buGece = {});
      this.aga = v.aga || null; // {id, ad, toplam}
      this.bolum = (A.bolumler && A.bolumler[0]) || { kod: "ciftlik", ad: "Çiftlik", emoji: "🌻", takilma: 1, olay: 1 };
      this.buyukDerbi = false;
      this.tahminler = new Map();   // id -> { ad, idx }
      this.sonKazananId = null;
      this.seri = 0;
      this.testKutlama = null;      // test paneli: "efsane" | "buyuk"
      this.sonrakiDerbi = false;    // test paneli: sonraki tur derbi olsun
      // Hediye kataloğu: TikFinity'den gelen gerçek hediye adları/resimleri öğrenilir ve saklanır
      this.hediyeKatalogu = v.hediyeKatalogu || (v.hediyeKatalogu = {});
      this.begenenler = new Map();   // id -> { ad, sayi } (bu yayın)
      this._begeniGecmis = [];       // [ {t, n} ] son beğeniler (otomatik hedef için)
      this.begeniHedef = this._begeniHedefHesapla();
      this.sonYorumZaman = 0;        // sessizlik çağrısı için
      this.canli = null;             // TikFinity yayın durumu (true/false/null)
      this._hediyeAdiZaman = {};
      this._fazaGec("lobi");
    }

    // ------------------------------------------------------------------ yardımcılar
    _yeniKulvar(i) {
      return {
        no: i, hayvan: this.A.hayvanlar[i], oyuncu: null,
        pos: 0, hiz: 0, gurultu: 0, gurultuHedef: 0, gurultuSayac: 0,
        carpanlar: [], mesafeler: [], kayma: 0, kaymaSebep: "",
        efektMesafe: 0, begeniPencere: new Map(), bitti: false, bitisSirasi: 0, bitisZaman: 0
      };
    }
    olay(tip, veri) {
      this.olaylar.push(Object.assign({ tip, zaman: this.zaman }, veri || {}));
      if (this.olaylar.length > 400) this.olaylar.splice(0, this.olaylar.length - 400);
    }
    bildir(metin, tur) { this.olay("bildirim", { metin, tur: tur || "bilgi" }); }
    hayvanAdi(i) { const h = this.A.hayvanlar[i]; return this.A.dil === "en" ? h.adEn : h.ad; }
    fazSuresi(f) {
      const s = this.A.sure;
      return { lobi: s.lobi, start: s.start, yaris: Infinity, fotofinis: s.fotoFinis, kursu: s.kursu }[f || this.faz];
    }
    kalanSure() { return Math.max(0, this.fazSuresi() - this.fazZaman); }
    yaristaMi() { return this.faz === "yaris" || this.faz === "fotofinis"; }
    kullanici(k) {
      const id = String(k.id || k.ad || "anonim");
      let u = this.kullanicilar.get(id);
      if (!u) {
        u = { id, ad: "", sonHediye: -999, toplamJeton: 0, takipKullandi: false, paylasimKullandi: false };
        this.kullanicilar.set(id, u);
      }
      u.ad = Y.isimTemizle(k.ad || k.id, id, this.A);
      return u;
    }
    kulvarBul(id) { return this.kulvarlar.find((k) => k.oyuncu && k.oyuncu.id === id) || null; }
    // Kürsüdeyken eski turun kulvarları geçersiz sayılır
    aktifKulvar(id) { return this.faz === "kursu" ? null : this.kulvarBul(id); }
    siradaMi(id) { return this.sira.findIndex((s) => s.id === id); }

    // ------------------------------------------------------------------ fazlar
    _fazaGec(f) {
      this.faz = f;
      this.fazZaman = 0;
      this.zamanOlcegi = 1;
      if (f === "lobi") this._lobiBaslat();
      if (f === "yaris") this._yarisBaslat();
      if (f === "kursu") this._kursuBaslat();
      this.olay("faz", { faz: f });
    }

    _lobiBaslat() {
      this.turNo++;
      this.sonuc = null;
      this.kazananKulvar = -1;
      this.fotoBasladi = false;
      this.yarisSuresi = 0;
      this._zl = [];
      this._kazananSonrasi = null;
      this.kulvarlar = this.A.hayvanlar.map((h, i) => this._yeniKulvar(i));
      // Bölüm seç (bir önceki ile aynı olmasın) ve Büyük Derbi mi bak
      const bl = this.A.bolumler || [];
      if (bl.length) {
        const adaylar = bl.length > 1 ? bl.filter((b) => b.kod !== (this.bolum && this.bolum.kod)) : bl;
        this.bolum = this.turNo === 1 ? bl[0] : adaylar[Math.floor(Math.random() * adaylar.length)];
      }
      const aralik = this.A.buyukDerbiAraligi || 0;
      this.buyukDerbi = this.sonrakiDerbi || (aralik > 0 && this.turNo % aralik === 0);
      this.sonrakiDerbi = false;
      this.tahminler.clear();
      this.liderNo = -1;
      this._liderZaman = -99;
      this._sonDuzluk = false;
      this.yariSiralama = null;
      this.kilPayi = false;
      this._doluBildirildi = false;
      this._barYakin = false;
      if (this.begeniBar < this.begeniHedef * 0.3) this.begeniHedef = Math.max(this._begeniHedefHesapla(), Math.ceil(this.begeniBar / 50) * 50 + 50);
      this.olay("bolum", { kod: this.bolum.kod, buyukDerbi: this.buyukDerbi });
      // Önce hediye/takip ile yer ayrılanlar, sonra sıradakiler
      const sira = this.sira.slice().sort((a, b) => (b.oncelik ? 1 : 0) - (a.oncelik ? 1 : 0));
      this.sira = [];
      for (const s of sira) {
        let k = s.tercih >= 0 ? this.kulvarlar[s.tercih] : null;
        if (!k || k.oyuncu) k = this.kulvarlar.find((x) => !x.oyuncu) || null;
        if (k) {
          k.oyuncu = { id: s.id, ad: s.ad };
          this.olay("katildi", { kulvar: k.no, ad: s.ad, buyuk: true });
        } else {
          this.sira.push(s);
        }
      }
    }

    _yarisBaslat() {
      const YO = this.A.yarisOlaylari || {};
      this._olaySayac = rastgele(YO.enAzAralik || 12, YO.enFazlaAralik || 20) / ((this.bolum && this.bolum.olay) || 1);
      for (const k of this.kulvarlar) {
        k.gurultu = rastgele(-1, 1) * this.A.yaris.rastgelelik * 0.5;
        k.gurultuHedef = k.gurultu;
      }
      // Lobi/önceki turdan bekleyen efektleri uygula
      for (const k of this.kulvarlar) {
        if (!k.oyuncu) continue;
        const liste = this.bekleyenEfektler.get(k.oyuncu.id);
        if (liste) {
          this.bekleyenEfektler.delete(k.oyuncu.id);
          liste.forEach((e, n) => setTimeoutOyun(this, 0.6 + n * 0.8, () => this._efektUygula(k, e.efekt, e.kombo, k.oyuncu ? k.oyuncu.ad : "")));
        }
      }
    }

    _kursuBaslat() {
      const sirali = this.kulvarlar.slice().sort((a, b) => {
        if (a.bitti && b.bitti) return a.bitisSirasi - b.bitisSirasi;
        if (a.bitti) return -1;
        if (b.bitti) return 1;
        return b.pos - a.pos;
      });
      const P = this.A.puan;
      const kat = this.buyukDerbi ? 2 : 1;
      const puanlar = [P.birinci, P.ikinci, P.ucuncu];
      const puanEkle = (id, ad, n) => {
        const kayit = this.buGece[id] || (this.buGece[id] = { ad, puan: 0 });
        kayit.ad = ad;
        kayit.puan += n;
      };
      sirali.forEach((k, i) => {
        if (!k.oyuncu) return;
        puanEkle(k.oyuncu.id, k.oyuncu.ad, ((puanlar[i] || 0) + P.katilim) * kat);
      });
      const kazanan = sirali[0];
      const kid = kazanan.oyuncu ? kazanan.oyuncu.id : null;
      let galibiyet = 0;
      if (kid) {
        const e = this.efsaneler[kid] || (this.efsaneler[kid] = { ad: kazanan.oyuncu.ad, galibiyet: 0 });
        e.ad = kazanan.oyuncu.ad;
        e.galibiyet++;
        galibiyet = e.galibiyet;
      }
      this.seri = kid && kid === this.sonKazananId ? this.seri + 1 : (kid ? 1 : 0);
      this.sonKazananId = kid;

      // Tahminler
      const dogru = [];
      for (const [id, t] of this.tahminler) {
        if (t.idx !== kazanan.no) continue;
        dogru.push(t.ad);
        puanEkle(id, t.ad, this.A.tahminPuani || 0);
      }

      // Kutlama etiketleri ve seviyesi
      const etiketler = [];
      const agaKazandi = !!(kid && this.aga && this.aga.id === kid);
      const donum = [5, 10, 25, 50, 100].includes(galibiyet);
      const geridenGeldi = !!(this.yariSiralama && this.yariSiralama.indexOf(kazanan.no) >= 5);
      if (this.buyukDerbi) etiketler.push("derbiSampiyonu");
      if (agaKazandi) etiketler.push("agaZaferi");
      if (this.seri >= 2) etiketler.push("seri");
      if (donum) etiketler.push("efsane");
      if (geridenGeldi) etiketler.push("geridenGeldi");
      if (this.kilPayi) etiketler.push("kilPayi");
      if (galibiyet === 1) etiketler.push("ilkZafer");
      let seviye = this.buyukDerbi || agaKazandi || this.seri >= 2 || donum ? "efsane" : etiketler.length ? "buyuk" : "normal";
      if (this.testKutlama) {
        seviye = this.testKutlama;
        if (!etiketler.length) etiketler.push(seviye === "efsane" ? "efsane" : "geridenGeldi");
        this.testKutlama = null;
      }

      this.sonuc = {
        kazanan: kazanan.no,
        ad: kazanan.oyuncu ? kazanan.oyuncu.ad : null,
        rozet: this.rozet(kid),
        galibiyet, seri: this.seri, etiketler, seviye,
        buyukDerbi: this.buyukDerbi, bolum: this.bolum,
        tahmin: { dogru: dogru.length, toplam: this.tahminler.size, isimler: dogru.slice(0, 5) },
        ilkUc: sirali.slice(0, 3).map((k) => ({ kulvar: k.no, ad: k.oyuncu ? k.oyuncu.ad : null, rozet: k.oyuncu ? this.rozet(k.oyuncu.id) : "" }))
      };
      this.kayitGuncelle();
      this.olay("kazanan", Object.assign({ kulvar: kazanan.no }, this.sonuc));
    }

    kayitGuncelle() {
      this.kayit.veri.buGeceZaman = Date.now();
      this.kayit.veri.aga = this.aga;
      this.kayit.kaydet();
    }

    // ------------------------------------------------------------------ ana döngü
    guncelle(gercekDt) {
      const dt = Math.min(gercekDt, 0.1);
      this.fazZaman += dt;
      const oyunDt = dt * this.zamanOlcegi;
      this.zaman += oyunDt;
      this._zamanlayicilar(oyunDt);

      if (this.faz === "lobi" && this.fazZaman >= this.A.sure.lobi) this._fazaGec("start");
      else if (this.faz === "start" && this.fazZaman >= this.A.sure.start) this._fazaGec("yaris");
      else if (this.faz === "kursu" && this.fazZaman >= this.A.sure.kursu) this._fazaGec("lobi");

      if (this.yaristaMi()) this._fizik(oyunDt, dt);
    }

    _zamanlayicilar(dt) {
      if (!this._zl) return;
      for (const z of this._zl) z.kalan -= dt;
      const hazir = this._zl.filter((z) => z.kalan <= 0);
      this._zl = this._zl.filter((z) => z.kalan > 0);
      for (const z of hazir) z.fn();
    }

    _fizik(dt, gercekDt) {
      const Y_ = this.A.yaris;
      this.yarisSuresi += dt;
      const v0 = PIST / this.A.sure.yarisHedef;
      const lider = Math.max(...this.kulvarlar.map((k) => k.pos));
      const sinir = (Y_.efektSiniriYuzde / 100) * PIST;
      const uzama = this.yarisSuresi > this.A.sure.yarisEnFazla ? 1.6 : 1;

      if (this.camurKalan > 0) this.camurKalan -= dt;
      if (this.camurBekleme > 0) this.camurBekleme -= dt;
      if (this.camurBekliyor && this.camurBekleme <= 0 && this.faz === "yaris" && this.yarisSuresi > 4) {
        this.camurBekliyor = false;
        this._camurBaslat();
      }

      for (const k of this.kulvarlar) {
        if (k.bitti) { k.hiz = v0 * 0.5; k.pos += k.hiz * dt; continue; }
        // gürültü: ara sıra yeni hedef, yumuşak geçiş
        k.gurultuSayac -= dt;
        if (k.gurultuSayac <= 0) {
          k.gurultuSayac = rastgele(1, 2.5);
          k.gurultuHedef = rastgele(-1, 1) * Y_.rastgelelik;
        }
        k.gurultu += (k.gurultuHedef - k.gurultu) * Math.min(1, dt * 1.2);
        // yetişme desteği
        const fark = lider - k.pos;
        const destek = Math.min(Y_.yetismeDestegi, (fark / 12) * Y_.yetismeDestegi);
        let hiz = v0 * k.hayvan.hiz * (1 + k.gurultu) * (1 + destek) * uzama;

        // kendiliğinden takılma (son 5 birimde ve fotofinişte olmaz)
        if (k.kayma <= 0 && this.faz === "yaris" && k.pos > 5 && k.pos < PIST - 8 && Math.random() < Y_.takilmaSikligi * ((this.bolum && this.bolum.takilma) || 1) * dt) {
          this._kaydir(k, Y_.takilmaSuresi, "takilma");
        }
        // kayma
        let kaymaCarpan = 1;
        if (k.kayma > 0) { k.kayma -= dt; kaymaCarpan = 0.18; }
        if (this.camurKalan > 0) kaymaCarpan = Math.min(kaymaCarpan, 0.6);

        // hız çarpanı efektleri
        let carpan = 1;
        for (const c of k.carpanlar) { c.kalan -= dt; carpan *= c.carpan; }
        k.carpanlar = k.carpanlar.filter((c) => c.kalan > 0);
        carpan = Math.min(carpan, Y_.enFazlaHizCarpani);
        const kalanSinir = Math.max(0, sinir - k.efektMesafe);
        let ekstra = hiz * (carpan - 1) * dt;
        if (ekstra > kalanSinir) ekstra = kalanSinir;
        k.efektMesafe += Math.max(0, ekstra);

        // mesafe efektleri (roket, leylek, beğeni itmesi)
        let ekMesafe = 0;
        for (const m of k.mesafeler) {
          const adim = Math.min(m.kalanMesafe, (m.toplam / m.sure) * dt);
          m.kalanMesafe -= adim;
          ekMesafe += adim;
        }
        k.mesafeler = k.mesafeler.filter((m) => m.kalanMesafe > 1e-4);
        const kalan2 = Math.max(0, sinir - k.efektMesafe);
        if (ekMesafe > kalan2) ekMesafe = kalan2;
        k.efektMesafe += ekMesafe;
        // uçarken (roket/leylek) kayma etkisiz
        if (k.mesafeler.some((m) => m.ucus)) kaymaCarpan = Math.max(kaymaCarpan, 0.6);

        const once = k.pos;
        k.pos += hiz * kaymaCarpan * dt + ekstra * kaymaCarpan + ekMesafe;
        k.hiz = (k.pos - once) / Math.max(dt, 1e-6);

        if (k.pos >= PIST && !k.bitti) {
          k.bitti = true;
          k.bitisSirasi = this.kulvarlar.filter((x) => x.bitti).length;
          k.bitisZaman = this.zaman;
          if (k.bitisSirasi === 1) {
            this.kazananKulvar = k.no;
            const ikinci = Math.max(...this.kulvarlar.filter((x) => x !== k).map((x) => x.pos));
            this.kilPayi = PIST - ikinci < 0.15;
            this.olay("bitis", { kulvar: k.no, kilPayi: this.kilPayi });
          }
        }
      }

      // Foto finiş: lider bitişe yaklaşınca ağır çekim
      const yeniLider = this.kulvarlar.reduce((a, b) => (b.pos > a.pos ? b : a));
      this._liderTakip(yeniLider);
      if (this.faz === "yaris") this._yarisOlayiSayac(dt, yeniLider);
      if (this.faz === "yaris") {
        const esik = Math.max(2.5, yeniLider.hiz * 1.4);
        if (yeniLider.pos >= PIST - esik || this.kazananKulvar >= 0) {
          this._fazaGec("fotofinis");
          const kalan = Math.max(0.3, PIST - yeniLider.pos);
          this.zamanOlcegi = Math.min(1, Math.max(0.15, (kalan / Math.max(0.5, yeniLider.hiz)) / 3.2));
          this.fotoBasladi = true;
        }
      } else if (this.faz === "fotofinis") {
        // Kazanan çizgiyi geçtikten sonra biraz bekle, sonra kürsü
        if (this.kazananKulvar >= 0) {
          if (this._kazananSonrasi == null) this._kazananSonrasi = 0;
          this._kazananSonrasi += gercekDt;
          if ((this.fazZaman >= this.A.sure.fotoFinis && this._kazananSonrasi > 0.8) || this._kazananSonrasi > 2.5) {
            this._kazananSonrasi = null;
            this._fazaGec("kursu");
          }
        } else if (this.fazZaman > this.A.sure.fotoFinis + 4) {
          this.zamanOlcegi = 1; // ağır çekim çok uzarsa normale dön
        }
      }
    }

    // Lider değişimini (titremeden) takip eder, yarı yol sıralamasını ve son düzlüğü kaydeder
    _liderTakip(enOnde) {
      const mevcut = this.liderNo >= 0 ? this.kulvarlar[this.liderNo] : null;
      if (!mevcut || (enOnde !== mevcut && enOnde.pos > mevcut.pos + 0.4)) {
        const oncekiVar = this.liderNo >= 0;
        this.liderNo = enOnde.no;
        if (oncekiVar && this.faz === "yaris" && this.yarisSuresi > 4 && this.zaman - this._liderZaman > 5 && enOnde.pos < PIST - 6) {
          this._liderZaman = this.zaman;
          this.olay("liderDegisti", { kulvar: enOnde.no });
        }
      }
      if (!this.yariSiralama && enOnde.pos >= PIST / 2) this.yariSiralama = this.siralama().map((k) => k.no);
      if (!this._sonDuzluk && enOnde.pos >= PIST * 0.8) { this._sonDuzluk = true; this.olay("sonDuzluk", {}); }
    }

    _yarisOlayiSayac(dt, lider) {
      const YO = this.A.yarisOlaylari || {};
      if (!YO.acik) return;
      this._olaySayac -= dt;
      if (this._olaySayac > 0) return;
      this._olaySayac = rastgele(YO.enAzAralik || 12, YO.enFazlaAralik || 20) / ((this.bolum && this.bolum.olay) || 1);
      if (this.yarisSuresi < 6 || lider.pos > PIST * 0.85) return;
      this.yarisOlayi();
    }

    // Yarış içi sürpriz: altın havuç, arkadan rüzgar, saman balyası (bölüme göre ağırlıklı)
    yarisOlayi(tur) {
      if (!this.yaristaMi()) return;
      const kod = this.bolum && this.bolum.kod;
      if (!tur) {
        const torba = ["altinHavuc", "ruzgar", "saman"];
        if (kod === "hasat") torba.push("altinHavuc", "altinHavuc");
        if (kod === "firtina") torba.push("ruzgar", "ruzgar");
        tur = torba[Math.floor(Math.random() * torba.length)];
      }
      const yarisanlar = this.kulvarlar.filter((k) => !k.bitti);
      if (!yarisanlar.length) return;
      const sirali = yarisanlar.slice().sort((a, b) => b.pos - a.pos);
      if (tur === "altinHavuc") {
        const k = yarisanlar[Math.floor(Math.random() * yarisanlar.length)];
        k.carpanlar.push({ tur: "havuc", carpan: 1.5, kalan: 3 });
        this.olay("yarisOlayi", { tur, kulvarlar: [k.no] });
        this.bildir(Y.doldur(this.M.altinHavuc, { hayvan: this.hayvanAdi(k.no) }), "olay");
      } else if (tur === "ruzgar") {
        const arka = sirali.slice(-3);
        arka.forEach((k) => k.carpanlar.push({ tur: "hiz", carpan: 1.3, kalan: 3 }));
        this.olay("yarisOlayi", { tur, kulvarlar: arka.map((k) => k.no) });
        this.bildir(this.M.ruzgar, "olay");
      } else if (tur === "saman") {
        const lider = sirali[0];
        this._kaydir(lider, 1.0, "saman");
        this.olay("yarisOlayi", { tur, kulvarlar: [lider.no] });
        this.bildir(this.M.saman, "olay");
      }
    }

    rozet(id) {
      const e = id && this.efsaneler[id];
      if (!e) return "";
      for (const r of this.A.rozetler || []) if (e.galibiyet >= r.enAz) return r.rozet;
      return "";
    }

    _kaydir(k, sure, sebep) {
      k.kayma = Math.max(k.kayma, sure);
      k.kaymaSebep = sebep;
      this.olay("kayma", { kulvar: k.no, sebep, sure });
    }

    _camurBaslat() {
      if (this.faz !== "yaris" || this.camurBekleme > 0) { this.camurBekliyor = true; return; }
      this.camurKalan = this.A.ucretsiz.camurSuresi;
      this.camurBekleme = this.A.ucretsiz.camurAraligi;
      this.olay("camur", { sure: this.camurKalan });
      this.bildir(this.M.camurYagmuru, "buyuk");
    }

    // ------------------------------------------------------------------ İZLEYİCİ OLAYLARI
    // Tüm girişler buradan geçer (TikFinity ya da test paneli).
    girdi(o) {
      try {
        if (o.tip === "yorum") this.yorum(o.kullanici, o.metin);
        else if (o.tip === "begeni") this.begeni(o.kullanici, o.sayi || 1);
        else if (o.tip === "hediye") this.hediye(o.kullanici, o.jeton || 1, o.hediyeAdi, o.resim, o.birimJeton);
        else if (o.tip === "yayinDurumu") { this.canli = !!o.canli; this.olay("yayinDurumu", { canli: this.canli }); }
        else if (o.tip === "takip") this.takipPaylasim(o.kullanici, "takip");
        else if (o.tip === "paylasim") this.takipPaylasim(o.kullanici, "paylasim");
      } catch (e) {
        if (typeof console !== "undefined") console.error("Olay işlenemedi", o, e);
      }
    }

    yorum(k, metin) {
      if (Y.kufurVarMi(metin, this.A.kufurListesi)) return;
      this.sonYorumZaman = this.zaman;
      const sade = Y.sadelestir(metin).trim();
      if (/^(tahmin|guess)\b/.test(sade)) { this.tahmin(k, metin); return; }
      let idx = Y.yorumdanHayvan(metin, this.A.hayvanlar);
      if (idx < 0) idx = Y.bulanikHayvan(metin, this.A.hayvanlar);
      if (idx < 0 && Y.katilmaKomutuMu(metin)) {
        const u = this.kullanici(k);
        const bos = this.kulvarlar.filter((x) => !x.oyuncu);
        const secim = this.faz === "lobi" && bos.length ? bos[Math.floor(Math.random() * bos.length)].no : -1;
        this.katil(u, secim, false);
        return;
      }
      if (idx < 0) { this._hediyeAdiYazildiMi(sade); return; }
      const u = this.kullanici(k);
      this.katil(u, idx, false);
    }

    // Yorumda bir hediye adı geçtiyse (ör. "gül") güç tablosundaki karşılığını kısa bildirim olarak göster
    _hediyeAdiYazildiMi(sade) {
      if (!this.A.hediyeTablosuGoster) return;
      for (const h of this.gucTablosu()) {
        if (!h.hediye) continue;
        const ad = Y.sadelestir(h.hediye.ad);
        if (ad.length < 2 || !(" " + sade + " ").includes(" " + ad + " ")) continue;
        if (this.zaman - (this._hediyeAdiZaman[ad] || -99) < 20) return;
        this._hediyeAdiZaman[ad] = this.zaman;
        this.bildir(Y.doldur(this.M.hediyeAdiYazildi, { emoji: h.hediye.emoji || "🎁", ad: h.hediye.ad, efekt: h.adi }), "bilgi");
        return;
      }
    }

    // Güç tablosu: her efekt kademesi için örnek bir hediye (önce config'teki liste, sonra yayında öğrenilenler)
    gucTablosu() {
      const kademeler = this.A.hediyeEfektleri;
      const liste = Object.values(this.hediyeKatalogu);
      const tanimli = (this.A.hediyeListesi || []).map((h) => Object.assign({ tanimli: true }, h));
      return kademeler.map((k, i) => {
        const ust = kademeler[i + 1] ? kademeler[i + 1].enAz : Infinity;
        const uygun = (h) => h.jeton >= k.enAz && h.jeton < ust;
        let hediye = tanimli.find(uygun) || null;
        const ogrenilen = liste.filter(uygun).sort((a, b) => (b.sayi || 0) - (a.sayi || 0))[0];
        if (ogrenilen) hediye = Object.assign({}, hediye && Y.sadelestir(hediye.ad) === Y.sadelestir(ogrenilen.ad) ? hediye : {}, ogrenilen);
        return { enAz: k.enAz, efekt: k.efekt, adi: this.A.dil === "en" ? k.adEn : k.ad, hediye };
      });
    }

    _hediyeOgren(ad, birimJeton, resim) {
      if (!ad) return;
      const anahtar = Y.sadelestir(ad);
      const h = this.hediyeKatalogu[anahtar] || (this.hediyeKatalogu[anahtar] = { ad, jeton: birimJeton, sayi: 0 });
      h.ad = ad;
      if (birimJeton) h.jeton = birimJeton;
      if (resim) h.resim = resim;
      h.sayi = (h.sayi || 0) + 1;
      const tanim = (this.A.hediyeListesi || []).find((x) => Y.sadelestir(x.ad) === anahtar);
      if (tanim && tanim.emoji) h.emoji = tanim.emoji;
      const anahtarlar = Object.keys(this.hediyeKatalogu);
      if (anahtarlar.length > 80) { // en az kullanılanları at
        anahtarlar.sort((a, b) => (this.hediyeKatalogu[a].sayi || 0) - (this.hediyeKatalogu[b].sayi || 0));
        for (const a of anahtarlar.slice(0, anahtarlar.length - 80)) delete this.hediyeKatalogu[a];
      }
    }

    // Beğeni barı hedefi: "otomatik" ise son 2 dakikadaki beğeni hızına göre (az izleyicide küçük hedef)
    _begeniHedefHesapla() {
      const U = this.A.ucretsiz;
      if (typeof U.begeniBariHedef === "number") return U.begeniBariHedef;
      const enAz = U.begeniHedefEnAz || 150, enFazla = U.begeniHedefEnFazla || 2000;
      const simdi = this.zaman;
      this._begeniGecmis = this._begeniGecmis.filter((b) => simdi - b.t < 120);
      const son2dk = this._begeniGecmis.reduce((a, b) => a + b.n, 0);
      const hedef = Math.round((son2dk * 0.75) / 50) * 50; // yaklaşık 1,5 dakikada dolacak şekilde
      return Math.max(enAz, Math.min(enFazla, hedef));
    }

    enCokBegenenler(n) {
      return [...this.begenenler.values()].sort((a, b) => b.sayi - a.sayi).slice(0, n || 3);
    }

    // TAHMİN: yarışmayan izleyici kazananı tahmin eder (ücretsiz, sadece puan)
    tahmin(k, metin) {
      if (!this.A.tahminAcik) return;
      const acik = this.faz === "lobi" || this.faz === "start" || (this.faz === "yaris" && this.yarisSuresi < (this.A.tahminSonSaniye || 15));
      if (!acik) return;
      const idx = Y.yorumdanHayvan(String(metin).replace(/tahmin|guess/gi, " "), this.A.hayvanlar);
      if (idx < 0) return;
      const u = this.kullanici(k);
      if (this.aktifKulvar(u.id)) return; // yarışan kendi tahminini yapamaz
      const vardi = this.tahminler.has(u.id);
      this.tahminler.set(u.id, { ad: u.ad, idx });
      if (!vardi) {
        this.bildir(Y.doldur(this.M.tahminYapti, { ad: u.ad, emoji: this.A.hayvanlar[idx].emoji }), "tahmin");
        this.olay("tahmin", { idx });
      }
    }

    // Kulvara al ya da sıraya koy. Döner: "kulvar" | "sira" | "ayni"
    katil(u, idx, oncelik) {
      const hAd = idx >= 0 ? this.hayvanAdi(idx) : "?";
      if (this.faz === "lobi") {
        const mevcut = this.kulvarBul(u.id);
        if (mevcut) {
          if (idx < 0 || mevcut.no === idx) return "ayni";
          const hedef = this.kulvarlar[idx];
          if (!hedef.oyuncu) {
            hedef.oyuncu = mevcut.oyuncu; mevcut.oyuncu = null;
            this.bildir(Y.doldur(this.M.degisti, { ad: u.ad, hayvan: hAd }));
            this.olay("katildi", { kulvar: idx });
          }
          return "ayni";
        }
        let hedef = idx >= 0 ? this.kulvarlar[idx] : null;
        if (!hedef && oncelik) hedef = this.kulvarlar.find((x) => !x.oyuncu) || null;
        if (hedef && !hedef.oyuncu) {
          hedef.oyuncu = { id: u.id, ad: u.ad };
          const si = this.siradaMi(u.id);
          if (si >= 0) this.sira.splice(si, 1);
          this.bildir(Y.doldur(this.M.katildi, { ad: u.ad, hayvan: this.hayvanAdi(hedef.no) }), "kulvar");
          this.olay("katildi", { kulvar: hedef.no, ad: u.ad, buyuk: true });
          if (!this._doluBildirildi && this.kulvarlar.every((x) => x.oyuncu)) { this._doluBildirildi = true; this.olay("dolu", {}); }
          return "kulvar";
        }
      }
      // Sıraya koy (ya da sıradaki tercihini güncelle)
      const si = this.siradaMi(u.id);
      if (si >= 0) {
        if (idx >= 0) this.sira[si].tercih = idx;
        if (oncelik) this.sira[si].oncelik = true;
        this.sira[si].ad = u.ad;
        return "sira";
      }
      if (this.sira.length >= 500) return "sira";
      this.sira.push({ id: u.id, ad: u.ad, tercih: idx, oncelik: !!oncelik });
      this.bildir(Y.doldur(oncelik ? this.M.sonrakiTura : this.M.siraya, { ad: u.ad, hayvan: hAd }), "katilim");
      return "sira";
    }

    begeni(k, sayi) {
      sayi = Math.max(1, Math.min(500, sayi | 0));
      const U = this.A.ucretsiz;
      this.begeniBar += sayi;
      this._begeniGecmis.push({ t: this.zaman, n: sayi });
      if (this._begeniGecmis.length > 3000) this._begeniGecmis.splice(0, 1000);
      if (k) {
        const bid = String(k.id || k.ad);
        const b = this.begenenler.get(bid) || { ad: Y.isimTemizle(k.ad || k.id, bid, this.A), sayi: 0 };
        b.sayi += sayi;
        this.begenenler.set(bid, b);
        if (this.begenenler.size > 2000) this.begenenler.clear();
      }
      if (!this._barYakin && this.begeniBar >= this.begeniHedef * 0.8) { this._barYakin = true; this.olay("barYakin", {}); }
      if (this.begeniBar >= this.begeniHedef) {
        this.begeniBar = 0;
        this._barYakin = false;
        this.begeniHedef = this._begeniHedefHesapla();
        this._camurBaslat();
        this.olay("barDoldu", {});
      }
      if (!this.yaristaMi() || !k) return;
      const id = String(k.id || k.ad);
      const kul = this.kulvarBul(id);
      if (!kul || kul.bitti) return;
      // kişi başı saniyelik sınır
      const sn = Math.floor(this.zaman);
      const once = kul.begeniPencere.get(sn) || 0;
      if (kul.begeniPencere.size > 8) kul.begeniPencere.clear();
      const istenen = sayi * U.begeniItmesi;
      const izin = Math.max(0, U.begeniKisiSiniri - once);
      const itme = Math.min(istenen, izin);
      if (itme <= 0) return;
      kul.begeniPencere.set(sn, once + itme);
      kul.mesafeler.push({ tur: "begeni", toplam: itme, kalanMesafe: itme, sure: 0.4 });
      this.olay("begeni", { kulvar: kul.no, sayi: Math.min(sayi, 10) });
    }

    takipPaylasim(k, tur) {
      const u = this.kullanici(k);
      const alan = tur === "takip" ? "takipKullandi" : "paylasimKullandi";
      if (u[alan]) return;
      u[alan] = true;
      this.bildir(Y.doldur(tur === "takip" ? this.M.takipEtti : this.M.paylasti, { ad: u.ad }), "ucretsiz");
      if (tur === "takip") this.olay("takip", {});
      const kul = this.aktifKulvar(u.id);
      if (kul && this.yaristaMi()) this._efektUygula(kul, "takip", 1, u.ad, true);
      else this._bekleyenEkle(u.id, "takip", 1);
    }

    hediye(k, jeton, hediyeAdi, resim, birimJeton) {
      jeton = Math.max(1, Math.round(jeton));
      const u = this.kullanici(k);
      this._hediyeOgren(hediyeAdi, birimJeton || jeton, resim);
      const kombo = this.zaman - u.sonHediye <= this.A.komboSuresi ? this.A.komboCarpani : 1;
      u.sonHediye = this.zaman;
      u.toplamJeton += jeton;

      // Efekt kademesi
      let kademe = null;
      for (const e of this.A.hediyeEfektleri) if (jeton >= e.enAz) kademe = e;
      if (!kademe) kademe = this.A.hediyeEfektleri[0];
      let efekt = kademe.efekt;
      const efektAdi = this.A.dil === "en" ? kademe.adEn : kademe.ad;

      // Çiftlik Ağası: 500+ hediye ve yayının en büyük toplamı
      if (u.toplamJeton >= 500 && (efekt === "aga" || this.aga) && (!this.aga || this.aga.id === u.id || u.toplamJeton > this.aga.toplam)) {
        const yeni = !this.aga || this.aga.id !== u.id;
        this.aga = { id: u.id, ad: u.ad, toplam: u.toplamJeton };
        if (yeni) { this.bildir(Y.doldur(this.M.agaOldu, { ad: u.ad }), "aga"); this.olay("aga", { ad: u.ad }); }
        this.kayitGuncelle();
      }
      if (efekt === "aga") efekt = "leylek"; // Ağa ayrıca leylek efektini de alır

      this.bildir(Y.doldur(this.M.efekt, { ad: u.ad, efekt: efektAdi }) + (kombo > 1 ? "  " + this.M.kombo : ""), "hediye");
      const kat = hediyeAdi ? this.hediyeKatalogu[Y.sadelestir(hediyeAdi)] : null;
      const kulvarNo = this.aktifKulvar(u.id) ? this.aktifKulvar(u.id).no : -1;
      this.olay("hediyeUcur", { ad: u.ad, hediyeAdi: hediyeAdi || "", resim: (kat && kat.resim) || resim || "", emoji: (kat && kat.emoji) || "🎁", jeton, kulvar: kulvarNo, efekt });

      const kul = this.aktifKulvar(u.id);
      if (kul && this.yaristaMi() && !kul.bitti) {
        this._efektUygula(kul, efekt, kombo, u.ad, true);
      } else if (kul) {
        this._bekleyenEkle(u.id, efekt, kombo); // lobide/startta: yarış başlayınca
      } else {
        // Yarışmıyor: kulvar ayır (lobideyse hemen, değilse sonraki tur) ve efekti sakla
        const tercih = this.siradaMi(u.id) >= 0 ? this.sira[this.siradaMi(u.id)].tercih : -1;
        this.katil(u, tercih, true);
        this._bekleyenEkle(u.id, efekt, kombo);
      }
    }

    _bekleyenEkle(id, efekt, kombo) {
      const l = this.bekleyenEfektler.get(id) || [];
      if (l.length < 6) l.push({ efekt, kombo });
      this.bekleyenEfektler.set(id, l);
    }

    _efektUygula(kul, efekt, kombo, ad, bildirildi) {
      if (!kul || kul.bitti || !this.yaristaMi()) return;
      const G = this.A.efektGucu;
      const U = this.A.ucretsiz;
      const kat = kombo || 1;
      switch (efekt) {
        case "hiz":
          kul.carpanlar.push({ tur: "hiz", carpan: G.hiz.carpan, kalan: G.hiz.sure * kat });
          break;
        case "takip":
          kul.carpanlar.push({ tur: "hiz", carpan: U.takipHizCarpani, kalan: U.takipHizSuresi });
          efekt = "hiz";
          break;
        case "havuc":
          kul.carpanlar.push({ tur: "havuc", carpan: G.havuc.carpan, kalan: G.havuc.sure * kat });
          break;
        case "roket": {
          const m = (G.roket.mesafeYuzde / 100) * PIST * kat;
          kul.mesafeler.push({ tur: "roket", toplam: m, kalanMesafe: m, sure: G.roket.sure * kat, ucus: true });
          break;
        }
        case "leylek": {
          let m = (G.leylek.mesafeYuzde / 100) * PIST * kat;
          m = Math.min(m, Math.max(0, PIST - 2 - kul.pos)); // bitiş çizgisinin üstüne bırakmasın
          kul.mesafeler.push({ tur: "leylek", toplam: Math.max(m, 0.01), kalanMesafe: Math.max(m, 0.01), sure: G.leylek.sure, ucus: true });
          break;
        }
        case "muz": {
          // öndeki hayvan; lider kendisiyse en yakın arkadaki
          for (let n = 0; n < kat; n++) {
            const hedef = this._muzHedefi(kul, n);
            if (hedef) {
              this._kaydir(hedef, G.muz.sure, "muz");
              this.olay("efekt", { efekt: "muz", kulvar: kul.no, hedef: hedef.no });
            }
          }
          return;
        }
        default:
          return;
      }
      this.olay("efekt", { efekt, kulvar: kul.no, kombo: kat });
    }

    _muzHedefi(kul, n) {
      const digerleri = this.kulvarlar.filter((k) => k !== kul && !k.bitti);
      if (!digerleri.length) return null;
      const onde = digerleri.filter((k) => k.pos >= kul.pos).sort((a, b) => a.pos - b.pos);
      if (onde.length > n) return onde[n];
      const arkada = digerleri.filter((k) => k.pos < kul.pos).sort((a, b) => b.pos - a.pos);
      return arkada[n - onde.length] || arkada[0] || null;
    }

    // ------------------------------------------------------------------ tablolar
    efsaneTablosu(n) {
      return Object.keys(this.efsaneler).map((id) => Object.assign({ id }, this.efsaneler[id]))
        .sort((a, b) => b.galibiyet - a.galibiyet).slice(0, n || 5);
    }
    buGeceTablosu(n) {
      return Object.keys(this.buGece).map((id) => Object.assign({ id }, this.buGece[id]))
        .sort((a, b) => b.puan - a.puan).slice(0, n || 5);
    }
    skorlariSifirla(hepsi) {
      for (const k of Object.keys(this.buGece)) delete this.buGece[k];
      if (hepsi) for (const k of Object.keys(this.efsaneler)) delete this.efsaneler[k];
      this.aga = null;
      this.kayitGuncelle();
      this.olay("skorSifir", {});
    }
    siralama() {
      return this.kulvarlar.slice().sort((a, b) => {
        if (a.bitti && b.bitti) return a.bitisSirasi - b.bitisSirasi;
        if (a.bitti !== b.bitti) return a.bitti ? -1 : 1;
        return b.pos - a.pos;
      });
    }
  }

  // Oyun saatine bağlı zamanlayıcı (ağır çekimde de doğru çalışır)
  function setTimeoutOyun(oyun, sn, fn) {
    (oyun._zl || (oyun._zl = [])).push({ kalan: sn, fn });
  }

  Oyun.FAZLAR = FAZLAR;
  if (typeof window !== "undefined") window.Oyun = Oyun;
  if (typeof module !== "undefined") module.exports = Oyun;
})();
