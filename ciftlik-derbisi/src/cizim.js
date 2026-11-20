// EKRAN ÇİZİMİ (PixiJS). Oyun mantığını okur, hiçbir kuralı değiştirmez.
(function () {
  const G = 1080, Yuk = 1920;
  const YAZI = ["Arial Rounded MT Bold", "Segoe UI", "Arial", "Noto Color Emoji", "Segoe UI Emoji", "sans-serif"];
  // Yerleşim (piksel)
  // Telefonda ekranın alt ~%30'u TikTok yorumlarıyla kaplanır: önemli her şey üst %65'te (y < 1248).
  const L = {
    guvenliAlt: 1248,
    logoH: 84, rehberY: 92, rehberH: 84,
    sahneY: 186,                       // lobi/kürsü kartlarının başladığı yer
    barY: 184, barH: 84,               // beğeni barı (yarışta)
    spikerY: 318,
    gokY: 0, gokH: 380,
    kulvarY: 380, kulvarH: 104,        // 8 kulvar: 380 - 1212
    onplanY: 1212, onplanH: 80,
    bildirimY: 410,
    tabloY: 1580, tabloH: 190,         // alt bölge (ikincil bilgi)
    ipucuY: 1306, siraY: 1380,
    baslangicX: 150, pikselBirim: 70
  };
  const PIST_H = 104 * 8;
  const EMOJI_EFEKT = { muz: "🍌", roket: "🚀", havuc: "🥕", leylek: "🦢", camur: "🟤", hiz: "💨", kalp: "❤️", yildiz: "⭐", tac: "👑", konfeti: "🎉", sersem: "💫" };

  function stil(boyut, renk, ek) {
    return new PIXI.TextStyle(Object.assign({
      fontFamily: YAZI, fontSize: boyut, fill: renk || 0xffffff, fontWeight: "900",
      stroke: 0x2b1a0e, strokeThickness: Math.max(3, Math.round(boyut / 7)), lineJoin: "round"
    }, ek || {}));
  }
  function sinirla(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function renkHsv(h, s, v) {
    const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
  }
  function sure(sn) { sn = Math.ceil(sn); return Math.floor(sn / 60) + ":" + String(sn % 60).padStart(2, "0"); }

  class Cizim {
    constructor(app, oyun, varlik) {
      this.app = app;
      this.oyun = oyun;
      this.v = varlik;
      this.A = oyun.A;
      this.M = oyun.M;
      this.Y = window.Yardimci;
      this.emojiOnbellek = new Map();
      this.kamX = 0;
      this.saat = 0;
      this.parcaciklar = [];
      this.bildirimSirasi = [];
      this.bildirimler = [];
      this._imzalar = {};
      this._kurulanSurum = -1;
      this.dinleyici = null;   // yönetmen (ses/spiker) olayları buradan alır
      this.spiker = null;      // alt yazı için
      const daire = new PIXI.Graphics();
      daire.beginFill(0xffffff).drawCircle(16, 16, 16).endFill();
      this.daireDoku = app.renderer.generateTexture(daire);
      daire.destroy();
      this.kur();
    }

    // ---------------------------------------------------------------- yardımcılar
    emoji(e, boyut) {
      const k = e + "|" + boyut;
      let t = this.emojiOnbellek.get(k);
      if (!t) {
        const yazi = new PIXI.Text(e, new PIXI.TextStyle({ fontFamily: YAZI, fontSize: boyut, padding: Math.round(boyut * 0.2) }));
        t = this.app.renderer.generateTexture(yazi);
        yazi.destroy(true);
        this.emojiOnbellek.set(k, t);
      }
      return t;
    }
    efektDoku(ad, boyut) {
      return this.v.doku["efekt_" + ad] || this.emoji(EMOJI_EFEKT[ad] || "✨", boyut || 96);
    }
    panel(w, h, renk, alfa, yaricap) {
      const g = new PIXI.Graphics();
      g.beginFill(renk == null ? 0x1d1208 : renk, alfa == null ? 0.62 : alfa);
      g.drawRoundedRect(0, 0, w, h, yaricap == null ? 24 : yaricap);
      g.endFill();
      return g;
    }
    hAdi(i) { return this.oyun.hayvanAdi(i); }

    // Hayvan görseli: koşu videosu > karakter görseli > emoji
    hayvanGorseli(i, boy, tur) {
      const h = this.A.hayvanlar[i];
      const kap = new PIXI.Container();
      let sprite, cesit;
      const vid = this.v.video[h.klasor + "_" + (tur || "kos")];
      const res = this.v.doku[h.klasor + "_karakter"];
      if (vid && tur !== "resim") {
        sprite = new PIXI.Sprite(vid.doku);
        if (vid.maviFon) sprite.filters = [this.v.maviSilFiltresi()];
        cesit = "video";
      } else if (res) {
        sprite = new PIXI.Sprite(res);
        cesit = "resim";
      } else {
        sprite = new PIXI.Sprite(this.emoji(h.emoji, 128));
        sprite.scale.x = -1; // emojiler genelde sola bakar; sağa çevir
        cesit = "emoji";
      }
      sprite.anchor.set(0.5, 1);
      const olcek = boy / Math.max(1, sprite.texture.height);
      sprite.scale.set(Math.sign(sprite.scale.x) * olcek, olcek);
      kap.addChild(sprite);
      kap.sprite = sprite;
      kap.cesit = cesit;
      return kap;
    }

    // ---------------------------------------------------------------- kurulum
    kur() {
      const s = this.app.stage;
      s.removeChildren().forEach((c) => c.destroy({ children: true }));
      this.kok = s;

      // Tam ekran arka plan (lobi/kürsü görseli ya da düz renk)
      this.arka = new PIXI.Container();
      s.addChild(this.arka);

      this.sahneYaris = new PIXI.Container();
      this.sahneLobi = new PIXI.Container();
      this.sahneKursu = new PIXI.Container();
      s.addChild(this.sahneYaris, this.sahneLobi, this.sahneKursu);

      this.ust = new PIXI.Container();
      this.hud = new PIXI.Container();
      this.efektKat = new PIXI.Container();
      this.bildirimKat = new PIXI.Container();
      this.ortaKat = new PIXI.Container();
      this.flas = new PIXI.Graphics();
      this.flas.beginFill(0xffffff).drawRect(0, 0, G, Yuk).endFill();
      this.flas.alpha = 0;
      s.addChild(this.ust, this.hud, this.efektKat, this.bildirimKat, this.ortaKat, this.flas);

      this._arkaKur();
      this._ustKur();
      this._yarisKur();
      this._lobiKur();
      this._kursuKur();
      this._hudKur();
      this._ortaKur();
      this._kurulanSurum = this.v.surum;
      this._imzalar = {};
      this.fazDegisti(this.oyun.faz);
    }

    _arkaKur() {
      this.arka.removeChildren().forEach((c) => c.destroy({ children: true }));
      const g = new PIXI.Graphics();
      // gökyüzü degrade (bantlarla)
      const ust = [0x6ec6ff, 0x8fd6ff, 0xb5e6ff, 0xd8f3ff];
      for (let i = 0; i < 40; i++) {
        const t = i / 39;
        const r = Math.round(0x5e + (0xc8 - 0x5e) * t), gg = Math.round(0xbf + (0xee - 0xbf) * t), b = 0xff;
        g.beginFill((r << 16) | (gg << 8) | b).drawRect(0, (Yuk / 40) * i, G, Yuk / 40 + 1).endFill();
      }
      void ust;
      g.beginFill(0x7cc96b).drawRect(0, L.onplanY, G, Yuk - L.onplanY).endFill();
      this.arka.addChild(g);
      this.arkaLobi = this._tamEkran(this.v.doku.lobi);
      this.arkaKursu = this._tamEkran(this.v.doku.kursu);
      if (this.arkaLobi) this.arka.addChild(this.arkaLobi);
      if (this.arkaKursu) this.arka.addChild(this.arkaKursu);
    }
    _tamEkran(doku) {
      if (!doku) return null;
      const sp = new PIXI.Sprite(doku);
      const o = Math.max(G / doku.width, Yuk / doku.height);
      sp.scale.set(o);
      sp.x = (G - doku.width * o) / 2;
      sp.y = (Yuk - doku.height * o) / 2;
      return sp;
    }

    _ustKur() {
      const u = this.ust;
      u.removeChildren().forEach((c) => c.destroy({ children: true }));
      if (this.v.doku.logo) {
        const lg = new PIXI.Sprite(this.v.doku.logo);
        const o = Math.min(420 / lg.texture.width, (L.logoH - 6) / lg.texture.height);
        lg.scale.set(o);
        lg.anchor.set(0.5, 0);
        lg.position.set(G / 2, 4);
        u.addChild(lg);
      } else {
        const t = new PIXI.Text(this.A.oyunAdi, stil(54, 0xffe14d, { dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.5 }));
        t.anchor.set(0.5, 0);
        t.position.set(G / 2, 10);
        u.addChild(t);
      }
      const tabloW = 500;
      this.tablolar = [];
      [["efsaneler", 28], ["buGece", G - 28 - tabloW]].forEach(([tur, x]) => {
        const kap = new PIXI.Container();
        kap.position.set(x, L.tabloY);
        kap.addChild(this.panel(tabloW, L.tabloH, 0x1d1208, 0.6, 22));
        const b = new PIXI.Text(this.M[tur], stil(30, 0xffe14d));
        b.position.set(18, 8);
        kap.addChild(b);
        const satir = new PIXI.Text("", stil(25, 0xffffff, { lineHeight: 29, strokeThickness: 4 }));
        satir.position.set(18, 46);
        kap.addChild(satir);
        kap.tur = tur;
        kap.satir = satir;
        u.addChild(kap);
        this.tablolar.push(kap);
      });
      // NASIL OYNANIR / GÜÇ TABLOSU şeridi (her zaman görünür, ekranın en üstünde)
      this.rehber = new PIXI.Container();
      this.rehber.position.set(30, L.rehberY);
      const rp = this.panel(G - 60, L.rehberH, 0x0f2140, 0.92, 22);
      this.rehber.addChild(rp);
      const cerceve = new PIXI.Graphics();
      cerceve.lineStyle(4, 0xffd34d, 1).drawRoundedRect(0, 0, G - 60, L.rehberH, 22);
      this.rehber.addChild(cerceve);
      this.rehberIc = new PIXI.Container();
      this.rehber.addChild(this.rehberIc);
      u.addChild(this.rehber);
      this._rehberNo = -1;
      this._rehberZaman = -99;
    }

    // Şerit sayfaları: nasıl oynanır adımları + güç tablosu (hediye resmi, adı, jeton, etki)
    _rehberSayfalari() {
      const M = this.M, s = [];
      s.push({ yazi: M.rehber1, renk: 0xffffff });
      s.push({ yazi: M.rehberKatil, renk: 0x9ff0ff });
      s.push({ yazi: M.rehber2, renk: 0xffb3c7 });
      if (this.A.tahminAcik !== false) s.push({ yazi: M.rehber3, renk: 0xd9b8ff });
      if (this.A.hediyeTablosuGoster) {
        const t = this.oyun.gucTablosu();
        for (let i = 0; i < t.length; i += 3) s.push({ guc: t.slice(i, i + 3) });
      }
      return s;
    }

    _rehberGoster(sayfa) {
      const ic = this.rehberIc;
      ic.removeChildren().forEach((c) => c.destroy({ children: true }));
      const W = G - 60, H = L.rehberH;
      if (sayfa.yazi) {
        const t = new PIXI.Text(sayfa.yazi, stil(46, sayfa.renk || 0xffffff, { strokeThickness: 7 }));
        t.anchor.set(0.5);
        if (t.width > W - 40) t.scale.set((W - 40) / t.width);
        t.position.set(W / 2, H / 2 + 2);
        ic.addChild(t);
      } else if (sayfa.guc) {
        const baslik = new PIXI.Text(this.A.hediyeYazisiGoster ? this.M.hediyeAt.replace(", ", ",\n") : this.M.gucTablosu, stil(24, 0xffd34d, { align: "center", lineHeight: 26, strokeThickness: 5 }));
        baslik.anchor.set(0.5);
        if (baslik.width > 190) baslik.scale.set(190 / baslik.width);
        baslik.position.set(105, H / 2);
        ic.addChild(baslik);
        const genis = (W - 215) / 3;
        sayfa.guc.forEach((g, i) => {
          const x = 215 + i * genis;
          const res = new PIXI.Sprite(this.hediyeDokusu(g.hediye, g.efekt));
          res.anchor.set(0.5);
          const o = 60 / Math.max(res.texture.width, res.texture.height, 1);
          res.scale.set(o);
          res.position.set(x + 34, H / 2);
          res._hediye = g.hediye; res._efekt = g.efekt; res._boy = 60;
          ic.addChild(res);
          const ust = new PIXI.Text((g.hediye ? g.hediye.ad + " · " : "") + g.enAz + "+ 🪙", stil(22, 0xfff2c0, { strokeThickness: 4 }));
          ust.position.set(x + 70, 8);
          if (ust.width > genis - 76) ust.scale.set((genis - 76) / ust.width);
          ic.addChild(ust);
          const alt = new PIXI.Text("→ " + g.adi.replace("!", ""), stil(32, 0xffffff, { strokeThickness: 5 }));
          alt.position.set(x + 70, 38);
          if (alt.width > genis - 76) alt.scale.set((genis - 76) / alt.width);
          ic.addChild(alt);
        });
      }
      ic.alpha = 0;
    }

    _rehberGuncelle(dt) {
      const sure = this.A.rehberDegismeSn || 6;
      if (this.saat - this._rehberZaman >= sure) {
        const sayfalar = this._rehberSayfalari();
        this._rehberNo = (this._rehberNo + 1) % sayfalar.length;
        this._rehberZaman = this.saat;
        this._rehberGoster(sayfalar[this._rehberNo]);
      }
      const yas = this.saat - this._rehberZaman;
      this.rehberIc.alpha = Math.min(1, yas * 4, Math.max(0, (sure - yas) * 4));
      // resmi sonradan inen hediyeleri güncelle
      for (const c of this.rehberIc.children) {
        if (c._hediye && c._hediye.resim && c.texture !== this.hediyeDokusu(c._hediye, c._efekt)) {
          c.texture = this.hediyeDokusu(c._hediye, c._efekt);
          c.scale.set(c._boy / Math.max(c.texture.width, c.texture.height, 1));
        }
      }
    }

    // Hediye resmi: TikTok resmi (yerel sunucu üzerinden önbelleğe alınır) > config'teki resim > emoji
    hediyeDokusu(h, efekt) {
      this._hediyeDoku = this._hediyeDoku || {};
      if (h) {
        const kaynak = h.resimDosya || (h.resim ? "api/resim?url=" + encodeURIComponent(h.resim) : "");
        if (kaynak) {
          const k = this._hediyeDoku[kaynak];
          if (k && k !== "yukleniyor" && k !== "yok") return k;
          if (!k) {
            this._hediyeDoku[kaynak] = "yukleniyor";
            PIXI.Texture.fromURL(kaynak).then((t) => { this._hediyeDoku[kaynak] = t; }).catch(() => { this._hediyeDoku[kaynak] = "yok"; });
          }
        }
        if (h.emoji) return this.emoji(h.emoji, 96);
      }
      return this.efektDoku(efekt === "aga" ? "tac" : efekt || "yildiz", 96);
    }

    _yarisKur() {
      const y = this.sahneYaris;
      y.removeChildren().forEach((c) => c.destroy({ children: true }));
      const r = this.app.renderer;

      // UZAK: gökyüzü + tepeler
      let uzakDoku = this.v.doku.uzak;
      if (!uzakDoku) {
        const g = new PIXI.Graphics();
        g.beginFill(0x8fd6ff).drawRect(0, 0, 1024, L.gokH).endFill();
        g.beginFill(0xffffff, 0.9).drawEllipse(180, 50, 70, 22).drawEllipse(230, 40, 55, 26).drawEllipse(700, 70, 80, 20).drawEllipse(760, 60, 50, 22).endFill();
        g.beginFill(0x9ad27a).drawEllipse(150, L.gokH, 260, 110).drawEllipse(620, L.gokH + 10, 330, 120).drawEllipse(1024 + 150, L.gokH, 260, 110).endFill();
        g.beginFill(0x7fbf62).drawEllipse(400, L.gokH + 20, 240, 80).drawEllipse(900, L.gokH + 20, 200, 70).endFill();
        uzakDoku = r.generateTexture(g, { region: new PIXI.Rectangle(0, 0, 1024, L.gokH) });
        g.destroy();
      }
      this.uzak = new PIXI.TilingSprite(uzakDoku, G, L.gokH);
      this.uzak.tileScale.set(L.gokH / uzakDoku.height);
      this.uzak.y = L.gokY;
      y.addChild(this.uzak);

      // ZEMİN
      const pistH = L.kulvarH * this.A.hayvanlar.length;
      let zeminDoku = this.v.doku.zemin;
      if (!zeminDoku) {
        const g = new PIXI.Graphics();
        g.beginFill(0xc8925a).drawRect(0, 0, 256, 256).endFill();
        for (let i = 0; i < 140; i++) {
          g.beginFill(Math.random() < 0.5 ? 0xb07c48 : 0xd9a66d, 0.7).drawCircle(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3).endFill();
        }
        zeminDoku = r.generateTexture(g, { region: new PIXI.Rectangle(0, 0, 256, 256) });
        g.destroy();
      }
      this.zemin = new PIXI.TilingSprite(zeminDoku, G, pistH);
      const zOlcek = this.v.doku.zemin ? pistH / zeminDoku.height : 1;
      this.zemin.tileScale.set(zOlcek);
      this.zemin.y = L.kulvarY;
      y.addChild(this.zemin);

      // Kulvar şeritleri (sabit)
      const serit = new PIXI.Graphics();
      for (let i = 0; i < this.A.hayvanlar.length; i++) {
        if (i % 2 === 0) serit.beginFill(0x000000, 0.07).drawRect(0, L.kulvarY + i * L.kulvarH, G, L.kulvarH).endFill();
        serit.beginFill(0xffffff, 0.55).drawRect(0, L.kulvarY + i * L.kulvarH - 2, G, 4).endFill();
      }
      serit.beginFill(0xffffff, 0.55).drawRect(0, L.kulvarY + pistH - 2, G, 4).endFill();
      y.addChild(serit);

      // Dünya (kamera ile kayan): start, bitiş, mesafe işaretleri
      this.dunya = new PIXI.Container();
      const d = new PIXI.Graphics();
      const P = L.pikselBirim, PIST = this.oyun.PIST;
      // start çizgisi
      d.beginFill(0xffffff, 0.95).drawRect(L.baslangicX - 4, L.kulvarY, 8, pistH).endFill();
      // mesafe işaretleri
      for (let m = 10; m < PIST; m += 10) {
        const x = L.baslangicX + m * P;
        d.beginFill(0xffffff, 0.35).drawRect(x - 2, L.kulvarY, 4, pistH).endFill();
      }
      // bitiş çizgisi (dama)
      const bx = L.baslangicX + PIST * P;
      for (let yy = 0; yy < pistH; yy += 20) {
        for (let xx = 0; xx < 2; xx++) {
          d.beginFill(((yy / 20) + xx) % 2 ? 0x111111 : 0xffffff).drawRect(bx + xx * 20, L.kulvarY + yy, 20, 20).endFill();
        }
      }
      this.dunya.addChild(d);
      for (let m = 10; m < PIST; m += 10) {
        const t = new PIXI.Text(String(m), stil(30, 0xffffff, { strokeThickness: 5 }));
        t.anchor.set(0.5, 1);
        t.position.set(L.baslangicX + m * P, L.kulvarY - 4);
        this.dunya.addChild(t);
      }
      const bitisYazi = new PIXI.Sprite(this.emoji("🏁", 90));
      bitisYazi.anchor.set(0.5, 1);
      bitisYazi.position.set(bx + 20, L.kulvarY + 6);
      this.dunya.addChild(bitisYazi);
      y.addChild(this.dunya);

      // Kulvar numaraları (sabit, solda)
      this.numaralar = new PIXI.Container();
      for (let i = 0; i < this.A.hayvanlar.length; i++) {
        const c = new PIXI.Graphics();
        c.beginFill(0x2b1a0e, 0.75).drawCircle(0, 0, 22).endFill();
        c.position.set(30, L.kulvarY + i * L.kulvarH + L.kulvarH / 2);
        const t = new PIXI.Text(String(i + 1), stil(28, 0xffffff, { strokeThickness: 0 }));
        t.anchor.set(0.5);
        c.addChild(t);
        this.numaralar.addChild(c);
      }
      y.addChild(this.numaralar);

      // Hayvanlar
      this.hayvanKat = new PIXI.Container();
      y.addChild(this.hayvanKat);
      this._kulvarlariKur();

      // ÖN PLAN
      let onDoku = this.v.doku.onplan;
      if (!onDoku) {
        const g = new PIXI.Graphics();
        g.beginFill(0x6fb555).drawRect(0, 50, 512, 50).endFill();
        for (let x = 10; x < 512; x += 64) g.beginFill(0x8a5a2b).drawRect(x, 8, 16, 80).endFill();
        g.beginFill(0xa86f37).drawRect(0, 22, 512, 12).drawRect(0, 52, 512, 12).endFill();
        for (let x = 0; x < 512; x += 18) g.beginFill(0x58a043).drawPolygon([x, 100, x + 9, 70 + Math.random() * 12, x + 18, 100]).endFill();
        onDoku = r.generateTexture(g, { region: new PIXI.Rectangle(0, 0, 512, 100) });
        g.destroy();
      }
      this.onplan = new PIXI.TilingSprite(onDoku, G, L.onplanH);
      this.onplan.tileScale.set(L.onplanH / onDoku.height);
      this.onplan.y = L.onplanY;
      y.addChild(this.onplan);

      // Çamur yağmuru katmanı
      this.camurKat = new PIXI.Container();
      y.addChild(this.camurKat);
      // Hava durumu katmanı (kar, yağmur, ateş böceği, yaprak, kabarcık)
      this.havaKat = new PIXI.Container();
      y.addChild(this.havaKat);
      this.havaParca = [];
      this.bolumFiltre = new PIXI.ColorMatrixFilter();
      this.karanlik = new PIXI.Graphics();
      this.karanlik.beginFill(0x061033, 1).drawRect(0, 0, G, Yuk).endFill();
      this.karanlik.alpha = 0;
      y.addChild(this.karanlik);
    }

    _kulvarlariKur() {
      this.hayvanKat.removeChildren().forEach((c) => c.destroy({ children: true }));
      this.kulvarGorsel = this.oyun.kulvarlar.map((k, i) => {
        const kap = new PIXI.Container();
        const golge = new PIXI.Graphics();
        golge.beginFill(0x000000, 0.22).drawEllipse(0, 0, 46, 10).endFill();
        kap.addChild(golge);
        const hayvan = this.hayvanGorseli(i, 104);
        kap.addChild(hayvan);
        const isimKap = new PIXI.Container();
        const isim = new PIXI.Text("", stil(26, 0xffffff, { strokeThickness: 6 }));
        isim.anchor.set(1, 0.5);
        isimKap.addChild(isim);
        kap.addChild(isimKap);
        const tac = new PIXI.Sprite(this.emoji("👑", 56));
        tac.anchor.set(0.5, 1);
        tac.scale.set(0.8);
        tac.visible = false;
        kap.addChild(tac);
        const ikon = new PIXI.Sprite(this.emoji("✨", 64));
        ikon.anchor.set(0.5);
        ikon.visible = false;
        kap.addChild(ikon);
        const sersem = new PIXI.Sprite(this.emoji("💫", 52));
        sersem.anchor.set(0.5);
        sersem.visible = false;
        kap.addChild(sersem);
        const leylek = new PIXI.Sprite(this.efektDoku("leylek", 150));
        leylek.anchor.set(0.5, 1);
        leylek.visible = false;
        const lo = 150 / Math.max(leylek.texture.height, 1);
        leylek.scale.set(lo);
        kap.addChild(leylek);
        kap.y = L.kulvarY + (i + 1) * L.kulvarH - 8;
        this.hayvanKat.addChild(kap);
        return { kap, golge, hayvan, isim, isimKap, tac, ikon, sersem, leylek, x: L.baslangicX, imza: "" };
      });
      this.kulvarImzasi = "";
    }

    _lobiKur() {
      const l = this.sahneLobi;
      l.removeChildren().forEach((c) => c.destroy({ children: true }));
      const kartY = L.sahneY;
      const ust = new PIXI.Container();
      ust.position.set(40, kartY);
      ust.addChild(this.panel(G - 80, 188, 0x1d1208, 0.72, 28));
      this.lobiBaslik = new PIXI.Text(this.M.lobi, stil(58, 0xffe14d));
      this.lobiBaslik.position.set(30, 8);
      ust.addChild(this.lobiBaslik);
      this.lobiSure = new PIXI.Text("0:45", stil(68, 0xffffff));
      this.lobiSure.anchor.set(1, 0);
      this.lobiSure.position.set(G - 80 - 30, 6);
      ust.addChild(this.lobiSure);
      const alt = new PIXI.Text(this.M.lobiAlt, stil(30, 0xffffff, { wordWrap: true, wordWrapWidth: G - 140, strokeThickness: 5 }));
      alt.position.set(30, 82);
      ust.addChild(alt);
      this.lobiBolum = new PIXI.Text("", stil(34, 0x9ff0ff, { strokeThickness: 6 }));
      this.lobiBolum.position.set(30, 130);
      ust.addChild(this.lobiBolum);
      l.addChild(ust);

      this.lobiSatirlar = [];
      const satirY = kartY + 196, satirH = 98;
      for (let i = 0; i < this.A.hayvanlar.length; i++) {
        const s = new PIXI.Container();
        s.position.set(40, satirY + i * satirH);
        const bg = this.panel(G - 80, satirH - 10, 0xfff6e0, 0.88, 22);
        s.addChild(bg);
        const no = new PIXI.Graphics();
        no.beginFill(0x2b1a0e).drawCircle(0, 0, 30).endFill();
        no.position.set(46, (satirH - 10) / 2);
        const nt = new PIXI.Text(String(i + 1), stil(36, 0xffffff, { strokeThickness: 0 }));
        nt.anchor.set(0.5);
        no.addChild(nt);
        s.addChild(no);
        const hg = this.hayvanGorseli(i, 86, "resim");
        hg.position.set(150, satirH - 14);
        s.addChild(hg);
        const ad = new PIXI.Text(this.hAdi(i), stil(36, 0x2b1a0e, { strokeThickness: 0 }));
        ad.position.set(212, 10);
        s.addChild(ad);
        const oyuncu = new PIXI.Text("", stil(32, 0x7a5a3a, { strokeThickness: 0, fontWeight: "700" }));
        oyuncu.position.set(212, 52);
        s.addChild(oyuncu);
        const tac = new PIXI.Sprite(this.emoji("👑", 54));
        tac.anchor.set(0.5);
        tac.position.set(G - 140, (satirH - 10) / 2);
        tac.visible = false;
        s.addChild(tac);
        l.addChild(s);
        this.lobiSatirlar.push({ s, bg, oyuncu, tac, nabiz: 0 });
      }
      const siraKap = new PIXI.Container();
      siraKap.position.set(40, satirY + this.A.hayvanlar.length * satirH + 2);
      siraKap.addChild(this.panel(G - 80, 116, 0x1d1208, 0.72, 22));
      this.lobiTahmin = new PIXI.Text(this.A.tahminAcik === false ? "" : this.M.tahminIpucu, stil(26, 0xd9b8ff, { strokeThickness: 5 }));
      this.lobiTahmin.position.set(26, 72);
      siraKap.addChild(this.lobiTahmin);
      this.lobiSira = new PIXI.Text("", stil(28, 0xffffff, { wordWrap: true, wordWrapWidth: G - 140, strokeThickness: 5, lineHeight: 34, breakWords: true }));
      this.lobiSira.position.set(26, 16);
      siraKap.addChild(this.lobiSira);
      l.addChild(siraKap);
    }

    _kursuKur() {
      const k = this.sahneKursu;
      k.removeChildren().forEach((c) => c.destroy({ children: true }));
      this.kursuBasamak = new PIXI.Graphics();
      k.addChild(this.kursuBasamak);
      this.kursuKazananKap = new PIXI.Container();
      k.addChild(this.kursuKazananKap);
      const kart = new PIXI.Container();
      kart.position.set(60, L.sahneY);
      kart.addChild(this.panel(G - 120, 200, 0x1d1208, 0.72, 30));
      this.kursuBaslik = new PIXI.Text(this.M.kazanan, stil(60, 0xffe14d));
      this.kursuBaslik.anchor.set(0.5, 0);
      this.kursuBaslik.position.set((G - 120) / 2, 10);
      kart.addChild(this.kursuBaslik);
      this.kursuIsim = new PIXI.Text("", stil(84, 0xffffff));
      this.kursuIsim.anchor.set(0.5, 0);
      this.kursuIsim.position.set((G - 120) / 2, 80);
      kart.addChild(this.kursuIsim);
      k.addChild(kart);

      this.kursuAlt = new PIXI.Text("", stil(30, 0xffffff, { align: "center", lineHeight: 38, strokeThickness: 6 }));
      this.kursuAlt.anchor.set(0.5, 0);
      this.kursuAlt.position.set(G / 2, 1050);
      k.addChild(this.kursuAlt);
      this.kursuSure = new PIXI.Text("", stil(32, 0xffe14d));
      this.kursuSure.anchor.set(0.5, 0);
      this.kursuSure.position.set(G / 2, 1300);
      k.addChild(this.kursuSure);
      this.konfetiKat = new PIXI.Container();
      k.addChild(this.konfetiKat);
    }

    _hudKur() {
      const h = this.hud;
      h.removeChildren().forEach((c) => c.destroy({ children: true }));
      const bar = new PIXI.Container();
      bar.position.set(40, L.barY);
      this.barCerceve = this.panel(G - 80, L.barH, 0x1d1208, 0.85, 26);
      bar.addChild(this.barCerceve);
      this.barDolgu = new PIXI.Graphics();
      bar.addChild(this.barDolgu);
      this.barYazi = new PIXI.Text(this.M.begeniBaslik, stil(30, 0xffffff, { strokeThickness: 6 }));
      this.barYazi.anchor.set(0, 0.5);
      this.barYazi.position.set(20, 27);
      if (this.barYazi.width > 700) this.barYazi.scale.set(700 / this.barYazi.width);
      bar.addChild(this.barYazi);
      this.barSayi = new PIXI.Text("", stil(32, 0xffe14d, { strokeThickness: 6 }));
      this.barSayi.anchor.set(1, 0.5);
      this.barSayi.position.set(G - 100, 27);
      bar.addChild(this.barSayi);
      this.barLider = new PIXI.Text("", stil(22, 0xffd6e0, { strokeThickness: 4 }));
      this.barLider.anchor.set(0, 0.5);
      this.barLider.position.set(20, 64);
      bar.addChild(this.barLider);
      this.barKap = bar;
      h.addChild(bar);
      this.ipucu = new PIXI.Text(this.M.yarisAlt, stil(28, 0xffffff, { wordWrap: true, wordWrapWidth: G - 80, align: "center", strokeThickness: 6 }));
      this.ipucu.anchor.set(0.5, 0);
      this.ipucu.position.set(G / 2, L.ipucuY);
      h.addChild(this.ipucu);
      this.siraYazi = new PIXI.Text("", stil(26, 0xfff2c0, { wordWrap: true, wordWrapWidth: G - 80, align: "center", strokeThickness: 5 }));
      this.siraYazi.anchor.set(0.5, 0);
      this.siraYazi.position.set(G / 2, L.siraY + 40);
      h.addChild(this.siraYazi);
      this.agaYazi = new PIXI.Text("", stil(30, 0xffd700, { strokeThickness: 6 }));
      this.agaYazi.anchor.set(0.5, 0);
      this.agaYazi.position.set(G / 2, L.siraY + 110);
      h.addChild(this.agaYazi);
    }

    _ortaKur() {
      const o = this.ortaKat;
      o.removeChildren().forEach((c) => c.destroy({ children: true }));
      this.buyukYazi = new PIXI.Text("", stil(200, 0xffe14d, { strokeThickness: 18, dropShadow: true, dropShadowDistance: 8, dropShadowAlpha: 0.5 }));
      this.buyukYazi.anchor.set(0.5);
      this.buyukYazi.position.set(G / 2, 760);
      this.buyukYazi.visible = false;
      o.addChild(this.buyukYazi);
      this.bayrak = new PIXI.Container();
      this.bayrak.position.set(G / 2, 1060);
      const bp = this.panel(820, 120, 0xb3122e, 0.92, 18);
      bp.position.set(-410, 0);
      this.bayrak.addChild(bp);
      this.bayrakYazi = new PIXI.Text("", stil(40, 0xffffff, { wordWrap: true, wordWrapWidth: 780, align: "center" }));
      this.bayrakYazi.anchor.set(0.5);
      this.bayrakYazi.position.set(0, 60);
      this.bayrak.addChild(this.bayrakYazi);
      this.bayrak.visible = false;
      o.addChild(this.bayrak);
      this.camurYazi = new PIXI.Text(this.M.camurYagmuru, stil(96, 0x8b5a2b, { fill: [0xb07b45, 0x6b3f1d], stroke: 0xffffff, strokeThickness: 12 }));
      this.camurYazi.anchor.set(0.5);
      this.camurYazi.position.set(G / 2, 620);
      this.camurYazi.visible = false;
      o.addChild(this.camurYazi);
      this.fotoYazi = new PIXI.Text(this.M.fotoFinis, stil(110, 0xffffff, { stroke: 0x111111, strokeThickness: 14 }));
      this.fotoYazi.anchor.set(0.5);
      this.fotoYazi.position.set(G / 2, 520);
      this.fotoYazi.visible = false;
      o.addChild(this.fotoYazi);
      // Bölüm kartı (start'ta)
      this.bolumKart = new PIXI.Text("", stil(96, 0x9ff0ff, { stroke: 0x0b1e33, strokeThickness: 14, align: "center", dropShadow: true, dropShadowDistance: 6, dropShadowAlpha: 0.5 }));
      this.bolumKart.anchor.set(0.5);
      this.bolumKart.position.set(G / 2, 600);
      this.bolumKart.visible = false;
      o.addChild(this.bolumKart);
      // Kutlama damgaları
      this.damgaKat = new PIXI.Container();
      o.addChild(this.damgaKat);
      // Ortada büyük "@ad KATILDI!" yazıları
      this.katilimKat = new PIXI.Container();
      o.addChild(this.katilimKat);
      this.katilimSirasi = [];
      // Sessizlik çağrısı
      this.cagriYazi = new PIXI.Text(this.M.sessizCagri, stil(58, 0xffffff, { stroke: 0xb3122e, strokeThickness: 12, align: "center", wordWrap: true, wordWrapWidth: G - 120 }));
      this.cagriYazi.anchor.set(0.5);
      this.cagriYazi.position.set(G / 2, 900);
      this.cagriYazi.visible = false;
      o.addChild(this.cagriYazi);
      // Uçan hediyeler
      this.hediyeKat = new PIXI.Container();
      o.addChild(this.hediyeKat);
      this.ucanlar = [];
      // Spiker alt yazısı
      this.spikerKap = new PIXI.Container();
      this.spikerBg = new PIXI.Graphics();
      this.spikerKap.addChild(this.spikerBg);
      this.spikerYazi = new PIXI.Text("", stil(36, 0xfff3b0, { strokeThickness: 0, wordWrap: true, wordWrapWidth: G - 140, align: "center" }));
      this.spikerYazi.anchor.set(0.5);
      this.spikerKap.addChild(this.spikerYazi);
      this.spikerKap.visible = false;
      o.addChild(this.spikerKap);
      this.klipSprite = null;
    }

    // ---------------------------------------------------------------- faz geçişleri
    fazDegisti(f) {
      const o = this.oyun;
      if (this.v.surum !== this._kurulanSurum && (f === "lobi")) { this.kur(); return; }
      this.sahneLobi.visible = f === "lobi" || f === "start";
      this.sahneYaris.visible = f === "yaris" || f === "fotofinis";
      this.sahneKursu.visible = f === "kursu";
      this.hud.visible = f === "yaris" || f === "fotofinis";
      if (this.arkaLobi) this.arkaLobi.visible = f === "lobi" || f === "start";
      if (this.arkaKursu) this.arkaKursu.visible = f === "kursu";
      this.buyukYazi.visible = false;
      this.bayrak.visible = false;
      this.fotoYazi.visible = false;
      this.bolumKart.visible = false;
      this.damgaKat.removeChildren().forEach((c) => c.destroy());
      this._kutlama = null;
      // Önceki fazdan kalan katılım/tahmin/olay bildirimlerini temizle
      if (f === "yaris" || f === "kursu" || f === "lobi") {
        this.bildirimSirasi = this.bildirimSirasi.filter((b) => b.tur === "hediye" || b.tur === "aga" || b.tur === "ucretsiz");
        for (const b of this.bildirimler) b.yas = Math.max(b.yas, b.omur - 0.4);
      }
      if (f === "yaris" || f === "kursu") {
        this.katilimSirasi = [];
        for (const k of this.katilimKat.children) k.yas = Math.max(k.yas, 1.8);
      }
      this._klipKapat();
      if (f === "lobi") {
        this.kamX = 0;
        this._imzalar.lobi = "";
      }
      if (f === "start") {
        const b = o.bolum || {};
        this.bolumKart.text = (b.emoji || "") + " " + (this.A.dil === "en" ? b.adEn || b.ad : b.ad || "").toLocaleUpperCase(this.A.dil === "en" ? "en" : "tr") + (o.buyukDerbi ? "\n" + this.M.buyukDerbi : "");
        this.bolumKart.visible = true;
        this.bolumKart.scale.set(0.2);
        const vk = this.v.video.start;
        if (vk) this._klipAc(vk);
        this.bayrak.visible = true;
        this.bayrakYazi.text = o.aga ? this.Y.doldur(this.M.startBayragi, { ad: "👑 " + o.aga.ad }) : this.A.oyunAdi + " — " + this.Y.doldur(this.M.tur, { n: o.turNo });
      }
      if (f === "yaris") {
        this._kulvarlariKur();
        this._bolumUygula();
        this.kamX = 0;
        this.buyukYazi.text = this.M.basla;
        this.buyukYazi.visible = true;
        this.buyukYazi.scale.set(1);
        this._baslaGoster = 1.1;
      }
      if (f === "fotofinis") {
        this.fotoYazi.visible = true;
        this.fotoYazi.alpha = 0;
      }
      if (f === "kursu") this._kursuGoster();
    }

    _klipAc(vk, kap) {
      this._klipKapat();
      const sp = new PIXI.Sprite(vk.doku);
      const t = vk.doku;
      const o = Math.max(G / Math.max(1, t.width), Yuk / Math.max(1, t.height));
      sp.scale.set(o);
      sp.anchor.set(0.5);
      sp.position.set(G / 2, Yuk / 2);
      (kap || this.ortaKat).addChildAt(sp, 0);
      try { vk.el.currentTime = 0; const p = vk.el.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* yoksay */ }
      this.klipSprite = sp;
    }
    _klipKapat() {
      if (this.klipSprite) { if (!this.klipSprite.destroyed) this.klipSprite.destroy(); this.klipSprite = null; }
    }

    _kursuGoster() {
      const o = this.oyun, s = o.sonuc;
      if (!s) return;
      const kap = this.kursuKazananKap;
      kap.removeChildren().forEach((c) => c.destroy({ children: true }));
      const h = this.A.hayvanlar[s.kazanan];
      const vk = this.v.video[h.klasor + "_kazandi"];
      this.kursuBasamak.clear();
      this._kursuHayvan = null;
      if (vk) {
        this._klipAc(vk, kap); // tam ekran kutlama klibi (yazıların arkasında)
      } else {
        // Kürsü: 2 - 1 - 3
        const b = this.kursuBasamak;
        const yer = [[G / 2, 880, 300, 0xffd34d, "1"], [G / 2 - 330, 930, 250, 0xd7d7d7, "2"], [G / 2 + 330, 960, 220, 0xd99a5b, "3"]];
        yer.forEach(([x, yy, w, renk]) => b.beginFill(renk).drawRoundedRect(x - w / 2, yy, w, 1040 - yy, 16).endFill());
        s.ilkUc.forEach((u, i) => {
          const [x, yy] = yer[i];
          const hg = this.hayvanGorseli(u.kulvar, i === 0 ? 380 : 190, "resim");
          hg.position.set(x, yy + 4);
          kap.addChild(hg);
          if (i === 0) this._kursuHayvan = hg;
          const n = new PIXI.Text(String(i + 1), stil(56, 0xffffff));
          n.anchor.set(0.5, 0);
          n.position.set(x, yy + 30);
          kap.addChild(n);
        });
      }
      const kazanan = s.ilkUc[0];
      this.kursuIsim.text = kazanan.ad ? (s.rozet ? s.rozet + " " : "") + kazanan.ad : this.hAdi(s.kazanan);
      this.kursuIsim.tint = 0xffffff;
      this.kursuBaslik.text = (s.buyukDerbi ? "🏆 " : "") + this.M.kazanan + " — " + this.hAdi(s.kazanan);
      const satirlar = s.ilkUc.map((u, i) => (i + 1) + ". " + this.hAdi(u.kulvar) + (u.ad ? " — " + (u.rozet ? u.rozet + " " : "") + u.ad : ""));
      if (kazanan.ad && s.galibiyet) satirlar.push(this.Y.doldur(this.M.galibiyetSayisi, { n: s.galibiyet }));
      else if (!kazanan.ad) satirlar.push(this.M.kimseYok);
      if (s.tahmin && s.tahmin.toplam) {
        satirlar.push(s.tahmin.dogru ? this.Y.doldur(this.M.tahminSonuc, { n: s.tahmin.dogru }) + (s.tahmin.isimler.length ? ": " + s.tahmin.isimler.join(", ") : "") : this.M.tahminYok);
      }
      this.kursuAlt.text = satirlar.join("\n");
      this._kutlamaBasla(s);
    }

    // Kademeli kutlama: normal (konfeti) • büyük (+havai fişek, ışıklar, damga) • efsane (+altın yağmuru, gökkuşağı isim, sarsıntı)
    _kutlamaBasla(s) {
      const sev = s.seviye || "normal";
      this._kutlama = { seviye: sev, sure: 0, fisekSayac: 0.3, damgalar: (s.etiketler || []).slice(0, 3), damgaSayac: 0.6 };
      for (let i = 0; i < (sev === "normal" ? 70 : 110); i++) this._konfeti();
      if (sev !== "normal") {
        this._isiklar = new PIXI.Graphics();
        this.kursuKazananKap.addChildAt(this._isiklar, 0);
      } else this._isiklar = null;
      if (sev === "efsane") this._flasla(0.7);
    }

    _damga(etiket, i) {
      const metin = etiket === "seri" ? this.Y.doldur(this.M.seri, { n: this.oyun.sonuc ? this.oyun.sonuc.seri : 2 }) : this.M[etiket] || etiket;
      const renk = { derbiSampiyonu: 0xffd34d, agaZaferi: 0xffd700, seri: 0xff6b3d, efsane: 0xff4df0, geridenGeldi: 0x4dd0ff, kilPayi: 0x7bff7b, ilkZafer: 0xffffff }[etiket] || 0xffffff;
      const t = new PIXI.Text(metin, stil(84, renk, { stroke: 0x2b1a0e, strokeThickness: 14, dropShadow: true, dropShadowDistance: 6, dropShadowAlpha: 0.6 }));
      t.anchor.set(0.5);
      t.position.set(G / 2 + (i % 2 ? 60 : -60), 470 + i * 100);
      t.rotation = (i % 2 ? 0.08 : -0.08);
      t.scale.set(3);
      t.alpha = 0;
      t.yas = 0;
      this.damgaKat.addChild(t);
    }

    _fisekAt() {
      const renkler = [0xff4d6d, 0xffd34d, 0x4dd0ff, 0x7bff7b, 0xc77dff, 0xffffff, 0xff9f1c];
      const x = 120 + Math.random() * (G - 240);
      const sp = new PIXI.Sprite(this.daireDoku);
      sp.anchor.set(0.5);
      sp.scale.set(0.35);
      sp.tint = 0xfff2c0;
      sp.position.set(x, Yuk - 300);
      this.konfetiKat.addChild(sp);
      this.parcaciklar.push({ sp, vx: (Math.random() - 0.5) * 80, vy: -900 - Math.random() * 300, omur: 3, yas: 0, tur: "fisek", patla: 380 + Math.random() * 380, renk: renkler[(Math.random() * renkler.length) | 0] });
    }

    _fisekPatla(x, y, renk) {
      const n = 36;
      for (let i = 0; i < n; i++) {
        if (this.parcaciklar.length > 420) break;
        const a = (i / n) * Math.PI * 2, h = 220 + Math.random() * 260;
        const sp = new PIXI.Sprite(this.daireDoku);
        sp.anchor.set(0.5);
        sp.scale.set(0.28);
        sp.tint = renk;
        sp.position.set(x, y);
        this.konfetiKat.addChild(sp);
        this.parcaciklar.push({ sp, vx: Math.cos(a) * h, vy: Math.sin(a) * h, omur: 1.3, yas: 0, tur: "kivilcim" });
      }
    }

    _kutlamaGuncelle(dt) {
      const k = this._kutlama;
      if (!k) return;
      k.sure += dt;
      // havai fişek
      if (k.seviye !== "normal") {
        k.fisekSayac -= dt;
        if (k.fisekSayac <= 0) { this._fisekAt(); k.fisekSayac = k.seviye === "efsane" ? 0.35 : 1.0; }
      }
      // damgalar sırayla
      k.damgaSayac -= dt;
      if (k.damgaSayac <= 0 && k.damgalar.length) {
        this._damga(k.damgalar.shift(), this.damgaKat.children.length);
        k.damgaSayac = 0.9;
        this._flasla(0.25);
      }
      for (const t of this.damgaKat.children) {
        t.yas += dt;
        const u = Math.min(1, t.yas / 0.25);
        t.scale.set(3 - 2 * u + Math.sin(this.saat * 6) * 0.03 * u);
        t.alpha = u;
      }
      // ışık hüzmeleri
      if (this._isiklar) {
        const g = this._isiklar;
        g.clear();
        const renk = k.seviye === "efsane" ? 0xffe680 : 0xffffff;
        for (const [x0, faz] of [[120, 0], [G - 120, 2]]) {
          const a = Math.sin(this.saat * 0.9 + faz) * 0.45;
          const x1 = x0 + Math.sin(a) * 1000, y1 = 1100;
          g.beginFill(renk, 0.10).drawPolygon([x0, 390, x1 - 170, y1, x1 + 170, y1]).endFill();
        }
      }
      if (k.seviye === "efsane") {
        // gökkuşağı isim + altın yağmuru + hafif sarsıntı
        const h = (this.saat * 0.35) % 1;
        this.kursuIsim.tint = renkHsv(h, 0.45, 1);
        if (Math.random() < dt * 10 && this.parcaciklar.length < 380) {
          const sp = new PIXI.Sprite(this.emoji("🪙", 44));
          sp.anchor.set(0.5);
          sp.position.set(Math.random() * G, L.sahneY - 40);
          this.konfetiKat.addChild(sp);
          this.parcaciklar.push({ sp, vx: (Math.random() - 0.5) * 60, vy: 380 + Math.random() * 220, omur: 4, yas: 0, tur: "konfeti", don: (Math.random() - 0.5) * 6 });
        }
        const sars = k.sure < 0.8 ? (0.8 - k.sure) * 14 : 0;
        this.sahneKursu.position.set((Math.random() - 0.5) * sars, (Math.random() - 0.5) * sars);
      } else {
        this.sahneKursu.position.set(0, 0);
      }
    }

    // ---------------------------------------------------------------- bölüm görünümü ve hava
    _bolumUygula() {
      const kod = (this.oyun.bolum && this.oyun.bolum.kod) || "ciftlik";
      const f = this.bolumFiltre;
      f.reset();
      let filtre = true;
      this.karanlik.alpha = 0;
      if (kod === "bataklik") { f.matrix = [0.85, 0.1, 0, 0, 0.02, 0.05, 0.85, 0, 0, 0.02, 0, 0.05, 0.55, 0, 0, 0, 0, 0, 1, 0]; }
      else if (kod === "kar") { f.matrix = [0.8, 0.1, 0.1, 0, 0.12, 0.1, 0.85, 0.1, 0, 0.12, 0.1, 0.1, 0.95, 0, 0.18, 0, 0, 0, 1, 0]; }
      else if (kod === "gece") { f.matrix = [0.45, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0.8, 0, 0.03, 0, 0, 0, 1, 0]; }
      else if (kod === "firtina") { f.desaturate(); f.brightness(0.75, true); }
      else if (kod === "hasat") { f.matrix = [1.1, 0.05, 0, 0, 0.03, 0, 1.0, 0, 0, 0.01, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0]; }
      else filtre = false;
      this.sahneYaris.filters = filtre ? [this.bolumFiltre] : null;
      this.havaKod = kod;
      this.havaKat.removeChildren().forEach((c) => c.destroy());
      this.havaParca = [];
      const sayi = { kar: 90, firtina: 120, gece: 40, hasat: 30, bataklik: 25 }[kod] || 0;
      for (let i = 0; i < sayi; i++) this._havaParcaEkle(true);
    }

    _havaParcaEkle(ilk) {
      const kod = this.havaKod;
      let sp;
      if (kod === "hasat") { sp = new PIXI.Sprite(this.emoji(Math.random() < 0.5 ? "🍂" : "🍁", 40)); sp.scale.set(0.5 + Math.random() * 0.4); }
      else { sp = new PIXI.Sprite(this.daireDoku); }
      sp.anchor.set(0.5);
      const p = { sp, x: Math.random() * G, y: ilk ? Math.random() * Yuk : -20, vx: 0, vy: 0, faz: Math.random() * 6 };
      if (kod === "kar") { sp.scale.set(0.12 + Math.random() * 0.22); sp.alpha = 0.9; p.vy = 60 + Math.random() * 80; p.vx = -20; }
      else if (kod === "firtina") { sp.scale.set(0.06, 0.9); sp.tint = 0xbfdcff; sp.alpha = 0.55; sp.rotation = 0.25; p.vy = 1300 + Math.random() * 500; p.vx = -330; }
      else if (kod === "gece") { sp.scale.set(0.16 + Math.random() * 0.1); sp.tint = 0xfff27a; sp.alpha = 0.8; p.vy = -10; p.vx = 10; p.y = ilk ? L.kulvarY + Math.random() * PIST_H : L.kulvarY + PIST_H; }
      else if (kod === "hasat") { p.vy = 90 + Math.random() * 60; p.vx = -40; }
      else if (kod === "bataklik") { sp.scale.set(0.15 + Math.random() * 0.2); sp.tint = 0x6b4a2b; sp.alpha = 0.7; p.y = L.kulvarY + Math.random() * PIST_H; p.vy = -25; p.omur = 1 + Math.random() * 2; }
      sp.position.set(p.x, p.y);
      this.havaKat.addChild(sp);
      this.havaParca.push(p);
    }

    _havaGuncelle(dt) {
      const kod = this.havaKod;
      if (!this.havaParca || !this.havaParca.length) return;
      for (let i = this.havaParca.length - 1; i >= 0; i--) {
        const p = this.havaParca[i];
        p.faz += dt;
        if (kod === "gece") { p.x += Math.sin(p.faz * 1.3) * 20 * dt; p.y += Math.cos(p.faz) * 14 * dt; p.sp.alpha = 0.4 + Math.abs(Math.sin(p.faz * 2)) * 0.6; }
        else if (kod === "bataklik") { p.y += p.vy * dt; p.omur -= dt; p.sp.scale.set(p.sp.scale.x + dt * 0.08); p.sp.alpha = Math.max(0, p.omur); }
        else { p.x += (p.vx + (kod === "kar" ? Math.sin(p.faz * 2) * 30 : 0)) * dt; p.y += p.vy * dt; }
        if (kod === "hasat") p.sp.rotation += dt * 2;
        p.sp.position.set(p.x, p.y);
        const disarida = p.y > Yuk + 30 || p.x < -60 || (kod === "bataklik" && p.omur <= 0);
        if (disarida) {
          p.sp.destroy();
          this.havaParca.splice(i, 1);
          this._havaParcaEkle(false);
        }
      }
    }

    // Yarış içi sürprizlerin görüntüsü
    _yarisOlayiGorsel(o) {
      const kulvarlar = o.kulvarlar || [];
      if (o.tur === "altinHavuc") {
        for (const no of kulvarlar) {
          const g = this.kulvarGorsel && this.kulvarGorsel[no];
          if (!g) continue;
          const sp = new PIXI.Sprite(this.efektDoku("havuc", 80));
          sp.anchor.set(0.5);
          sp.scale.set(80 / Math.max(1, sp.texture.height));
          sp.tint = 0xffd700;
          this.efektKat.addChild(sp);
          this.parcaciklar.push({ sp, tur: "yol", t: 0, omur: 0.8, x0: G / 2, y0: L.spikerY, x1: g.x, y1: g.kap.y - 60, tepe: -160 });
          for (let i = 0; i < 10; i++) this._parcacik(this.emoji("✨", 44), g.x + (Math.random() - 0.5) * 120, g.kap.y - 60, (Math.random() - 0.5) * 200, -100 - Math.random() * 150, 1);
        }
      } else if (o.tur === "ruzgar") {
        for (let i = 0; i < 26; i++) {
          const sp = new PIXI.Sprite(this.daireDoku);
          sp.anchor.set(0.5);
          sp.scale.set(2 + Math.random() * 2, 0.06);
          sp.alpha = 0.6;
          sp.position.set(-200 - Math.random() * 600, L.kulvarY + Math.random() * PIST_H);
          this.efektKat.addChild(sp);
          this.parcaciklar.push({ sp, vx: 1600 + Math.random() * 600, vy: 0, omur: 1.4, yas: 0, tur: "uc" });
        }
      } else if (o.tur === "saman") {
        for (const no of kulvarlar) {
          const g = this.kulvarGorsel && this.kulvarGorsel[no];
          if (!g) continue;
          const sp = new PIXI.Sprite(this.emoji("🌾", 90));
          sp.anchor.set(0.5);
          this.efektKat.addChild(sp);
          this.parcaciklar.push({ sp, tur: "yol", t: 0, omur: 0.6, x0: g.x + 160, y0: L.kulvarY - 120, x1: g.x + 40, y1: g.kap.y - 40, tepe: -80 });
        }
      }
    }

    // ---------------------------------------------------------------- olaylar
    olaylariIsle() {
      const liste = this.oyun.olaylar;
      if (!liste.length) return;
      this.oyun.olaylar = [];
      for (const o of liste) {
        if (this.dinleyici) { try { this.dinleyici(o); } catch (e) { console.error("Ses olayı hatası", e); } }
        switch (o.tip) {
          case "faz": this.fazDegisti(o.faz); break;
          case "bildirim": this._bildirimEkle(o.metin, o.tur); break;
          case "efekt": this._efektBasla(o); break;
          case "kayma": this._kaymaBasla(o); break;
          case "camur": this._camurBasla(o.sure); break;
          case "begeni": this._kalp(o.kulvar, o.sayi); break;
          case "bitis": this._flasla(); break;
          case "aga": this._flasla(0.5); break;
          case "katildi":
            if (this.lobiSatirlar[o.kulvar]) this.lobiSatirlar[o.kulvar].nabiz = 1;
            if (o.buyuk && o.ad) { this.katilimSirasi.push(o); if (this.katilimSirasi.length > 12) this.katilimSirasi.shift(); }
            break;
          case "barDoldu": break;
          case "yarisOlayi": this._yarisOlayiGorsel(o); break;
          case "hediyeUcur": this._hediyeUcur(o); break;
          default: break;
        }
      }
    }

    _bildirimEkle(metin, tur) {
      if (tur === "kulvar") return; // kulvara katılım ortada büyük "@ad KATILDI!" olarak gösteriliyor
      const onemli = tur === "hediye" || tur === "aga" || tur === "buyuk" || tur === "ucretsiz";
      // Kalabalıkta katılım bildirimlerini sınırla
      if (!onemli && this.bildirimSirasi.length > 6) return;
      if (this.bildirimSirasi.length > 30) this.bildirimSirasi.splice(0, this.bildirimSirasi.length - 30);
      this.bildirimSirasi.push({ metin, tur });
    }

    _bildirimGoster(b) {
      const renk = { hediye: 0xff7a1a, aga: 0xc99700, buyuk: 0x6b3f1d, ucretsiz: 0x2e9d4b, katilim: 0x2a6fdb }[b.tur] || 0x333333;
      const kap = new PIXI.Container();
      const t = new PIXI.Text(b.metin, stil(30, 0xffffff, { strokeThickness: 0 }));
      const w = Math.min(G - 60, t.width + 48);
      if (t.width > G - 108) t.scale.set((G - 108) / t.width);
      const bg = this.panel(w, 56, renk, 0.92, 28);
      kap.addChild(bg);
      t.anchor.set(0.5);
      t.position.set(w / 2, 28);
      kap.addChild(t);
      kap.position.set((G - w) / 2, L.bildirimY);
      kap.omur = b.tur === "aga" ? 4.5 : 3.2;
      kap.yas = 0;
      kap.alpha = 0;
      this.bildirimKat.addChild(kap);
      this.bildirimler.unshift(kap);
      while (this.bildirimler.length > 3) {
        const eski = this.bildirimler.pop();
        eski.destroy({ children: true });
      }
      if (b.tur === "hediye" || b.tur === "aga") this.v.cal("hiz");
    }

    _efektBasla(o) {
      const g = this.kulvarGorsel && this.kulvarGorsel[o.kulvar];
      if (!g) return;
      this.v.cal(o.efekt);
      if (o.efekt === "muz" && this.kulvarGorsel[o.hedef]) {
        const h = this.kulvarGorsel[o.hedef];
        const sp = new PIXI.Sprite(this.efektDoku("muz", 80));
        sp.anchor.set(0.5);
        sp.scale.set(70 / sp.texture.height);
        this.efektKat.addChild(sp);
        const x0 = g.x, y0 = g.kap.y - 60, x1 = h.x, y1 = h.kap.y - 10;
        this.parcaciklar.push({ sp, tur: "yol", t: 0, omur: 0.6, x0, y0, x1, y1, tepe: -220 });
      } else if (o.efekt === "hiz") {
        for (let i = 0; i < 6; i++) this._parcacik(this.emoji("💨", 56), g.x - 60, g.kap.y - 40 - Math.random() * 50, -300 - Math.random() * 200, (Math.random() - 0.5) * 40, 0.6);
      } else if (o.efekt === "roket") {
        for (let i = 0; i < 8; i++) this._parcacik(this.emoji("🔥", 48), g.x - 50, g.kap.y - 60, -200 - Math.random() * 200, (Math.random() - 0.5) * 120, 0.7);
      } else if (o.efekt === "havuc") {
        for (let i = 0; i < 8; i++) this._parcacik(this.emoji("✨", 48), g.x + (Math.random() - 0.5) * 80, g.kap.y - 80, (Math.random() - 0.5) * 200, -150 - Math.random() * 150, 0.8);
      }
    }

    _kaymaBasla(o) {
      const g = this.kulvarGorsel && this.kulvarGorsel[o.kulvar];
      if (!g) return;
      if (o.sebep === "muz") this.v.cal("muz");
    }

    _camurBasla(sn) {
      this._camurKalan = sn;
      this.camurYazi.visible = true;
      this.camurYazi.scale.set(0.3);
      this.v.cal("camur");
    }

    _kalp(kulvar, sayi) {
      const g = this.kulvarGorsel && this.kulvarGorsel[kulvar];
      if (!g || this.parcaciklar.length > 160) return;
      for (let i = 0; i < Math.min(3, sayi); i++) {
        this._parcacik(this.emoji("❤️", 40), g.x + (Math.random() - 0.5) * 40, g.kap.y - 120, (Math.random() - 0.5) * 80, -160 - Math.random() * 80, 0.9);
      }
    }

    _flasla(guc) {
      this.flas.alpha = guc || 0.85;
    }

    _parcacik(doku, x, y, vx, vy, omur, kat) {
      if (this.parcaciklar.length > 220) return;
      const sp = new PIXI.Sprite(doku);
      sp.anchor.set(0.5);
      sp.position.set(x, y);
      (kat || this.efektKat).addChild(sp);
      this.parcaciklar.push({ sp, vx, vy, omur, yas: 0, tur: "uc" });
    }

    _konfeti() {
      const renkler = [0xff4d6d, 0xffd34d, 0x4dd0ff, 0x7bff7b, 0xc77dff, 0xffffff];
      const g = new PIXI.Graphics();
      g.beginFill(renkler[(Math.random() * renkler.length) | 0]).drawRect(-7, -4, 14, 8).endFill();
      g.position.set(Math.random() * G, L.sahneY - Math.random() * 300);
      this.konfetiKat.addChild(g);
      this.parcaciklar.push({ sp: g, vx: (Math.random() - 0.5) * 120, vy: 150 + Math.random() * 250, omur: 6, yas: 0, tur: "konfeti", don: (Math.random() - 0.5) * 10 });
    }

    // ---------------------------------------------------------------- kare güncelleme
    guncelle(dt) {
      this.saat += dt;
      // Lobideyken yeni görsel bulunduysa ekranı yeniden kur
      if (this.oyun.faz === "lobi" && this.v.surum !== this._kurulanSurum && this.oyun.fazZaman > 0.5) this.kur();
      this.olaylariIsle();
      const o = this.oyun, f = o.faz;
      this._tablolar();
      if (f === "lobi" || f === "start") this._lobiGuncelle(dt);
      if (f === "yaris" || f === "fotofinis") this._yarisGuncelle(dt);
      if (f === "kursu") { this._kursuGuncelle(dt); this._kutlamaGuncelle(dt); }
      if (f === "yaris" || f === "fotofinis") this._havaGuncelle(dt);
      this._spikerGuncelle();
      this._rehberGuncelle(dt);
      this._katilimGuncelle(dt);
      this._ucanGuncelle(dt);
      this._bildirimGuncelle(dt);
      this._parcacikGuncelle(dt);
      this._ortaGuncelle(dt);
      if (this.flas.alpha > 0) this.flas.alpha = Math.max(0, this.flas.alpha - dt * 2.2);
    }

    _tablolar() {
      if (this.saat - (this._tabloZaman || -9) < 1) return;
      this._tabloZaman = this.saat;
      for (const t of this.tablolar) {
        const liste = t.tur === "efsaneler" ? this.oyun.efsaneTablosu(5) : this.oyun.buGeceTablosu(5);
        const metin = liste.length
          ? liste.map((e, i) => (i + 1) + ". " + (this.oyun.rozet(e.id) ? this.oyun.rozet(e.id) + " " : "") + e.ad + "  " + (t.tur === "efsaneler" ? this.Y.doldur(this.M.galibiyet, { n: e.galibiyet }) : this.Y.doldur(this.M.puan, { n: e.puan }))).join("\n")
          : this.M.tabloBos;
        if (t.satir.text !== metin) t.satir.text = metin;
      }
    }

    _lobiGuncelle(dt) {
      const o = this.oyun;
      const kalan = o.faz === "lobi" ? o.kalanSure() : 0;
      const st = o.faz === "lobi" ? sure(kalan) : "";
      if (this.lobiSure.text !== st) this.lobiSure.text = st;
      this.lobiBaslik.text = o.faz === "lobi" ? this.M.lobi + "  •  " + this.Y.doldur(this.M.tur, { n: o.turNo }) : this.M.basliyor;
      const b = o.bolum || {};
      const bm = this.Y.doldur(this.M.siradakiBolum, { emoji: b.emoji || "", ad: this.A.dil === "en" ? b.adEn || b.ad : b.ad }) + (o.buyukDerbi ? "   " + this.M.buyukDerbi : "");
      if (this.lobiBolum.text !== bm) { this.lobiBolum.text = bm; this.lobiBolum.style.fill = o.buyukDerbi ? 0xffd34d : 0x9ff0ff; }
      if (this.bolumKart.visible) {
        this.bolumKart.scale.set(Math.min(1, this.bolumKart.scale.x + dt * 4));
        if (o.fazZaman > 2.2) this.bolumKart.visible = false;
      }
      o.kulvarlar.forEach((k, i) => {
        const s = this.lobiSatirlar[i];
        const metin = k.oyuncu ? k.oyuncu.ad : this.Y.doldur(this.M.bos, { ad: this.Y.sadelestir(this.hAdi(i)), no: i + 1 });
        if (s.oyuncu.text !== metin) {
          s.oyuncu.text = metin;
          s.oyuncu.style.fill = k.oyuncu ? 0x1f7a33 : 0x9a8670;
        }
        s.tac.visible = !!(k.oyuncu && o.aga && o.aga.id === k.oyuncu.id);
        if (s.nabiz > 0) s.nabiz = Math.max(0, s.nabiz - dt * 2);
        const olc = 1 + s.nabiz * 0.04;
        s.s.scale.set(olc);
        s.s.x = 40 - ((G - 80) * (olc - 1)) / 2;
      });
      const siraMetni = this._siraMetni(10);
      if (this.lobiSira.text !== siraMetni) this.lobiSira.text = siraMetni;
      // start: 3-2-1
      if (o.faz === "start") {
        const kalanS = Math.ceil(this.A.sure.start - o.fazZaman);
        const yazi = kalanS > 3 ? "" : String(Math.max(1, kalanS));
        this.buyukYazi.visible = !!yazi;
        if (yazi && this.buyukYazi.text !== yazi) {
          this.buyukYazi.text = yazi;
          this.buyukYazi.scale.set(1.6);
          this.v.cal("geri-sayim");
        }
        this.buyukYazi.scale.set(Math.max(1, this.buyukYazi.scale.x - dt * 2));
      }
    }

    _siraMetni(n) {
      const o = this.oyun;
      if (!o.sira.length) return this.M.sira + ": " + this.M.siraBos;
      const ilk = o.sira.slice(0, n).map((s) => s.ad + (s.tercih >= 0 ? " " + this.A.hayvanlar[s.tercih].emoji : "")).join(", ");
      return this.M.sira + " (" + o.sira.length + "): " + ilk + (o.sira.length > n ? " +" + (o.sira.length - n) : "");
    }

    _yarisGuncelle(dt) {
      const o = this.oyun, P = L.pikselBirim;
      const lider = o.kulvarlar.reduce((a, b) => (b.pos > a.pos ? b : a));
      let hedef = lider.pos * P - 560;
      if (o.faz === "fotofinis") hedef = o.PIST * P - 700;
      hedef = sinirla(hedef, 0, o.PIST * P - 520);
      this.kamX += (hedef - this.kamX) * Math.min(1, dt * 3);
      const k = this.kamX;
      this.uzak.tilePosition.x = -k * 0.25;
      this.zemin.tilePosition.x = -k;
      this.onplan.tilePosition.x = -k * 1.3;
      this.dunya.x = -k;

      const hizOrt = o.PIST / this.A.sure.yarisHedef;
      if (this.saat - (this._siraZaman2 || -9) > 0.3) {
        this._siraZaman2 = this.saat;
        this._siraNo = {};
        o.siralama().forEach((k, n) => { this._siraNo[k.no] = n + 1; });
      }
      o.kulvarlar.forEach((kul, i) => {
        const g = this.kulvarGorsel[i];
        if (!g) return;
        // İsim/taç
        const sira = this._siraNo ? this._siraNo[i] : 0;
        const rz = kul.oyuncu ? this.oyun.rozet(kul.oyuncu.id) : "";
        const ad = (sira ? sira + ". " : "") + (rz ? rz + " " : "") + (kul.oyuncu ? kul.oyuncu.ad : this.hAdi(i));
        if (g.isim.text !== ad) {
          g.isim.text = ad;
          g.isim.style.fill = sira === 1 ? 0xffe14d : kul.oyuncu ? 0xffffff : 0xe8d9c0;
        }
        const agaMi = !!(kul.oyuncu && o.aga && o.aga.id === kul.oyuncu.id);
        g.tac.visible = agaMi;

        let x = L.baslangicX + kul.pos * P - k;
        const geride = x < 70;
        if (geride) x = 70;
        g.x = x;
        g.kap.x = x;
        g.kap.alpha = geride ? 0.7 : 1;

        // Durum
        const ucus = kul.mesafeler.find((m) => m.ucus);
        const havuc = kul.carpanlar.find((c) => c.tur === "havuc");
        const hiz = kul.carpanlar.find((c) => c.tur === "hiz");
        const kayiyor = kul.kayma > 0;
        const camur = o.camurKalan > 0;
        const hayvan = g.hayvan;
        const sp = hayvan.sprite;
        const oran = sinirla(kul.hiz / hizOrt, 0, 3);

        // Koşu animasyonu
        g.adim = (g.adim || i * 1.7) + dt * (6 + oran * 9);
        let yOff = 0, don = 0;
        if (hayvan.cesit === "video") {
          const vid = this.v.video[this.A.hayvanlar[i].klasor + "_kos"];
          if (vid && vid.el) {
            const hedefHiz = sinirla(0.4 + oran * 0.8, 0.3, 2.5);
            if (Math.abs(vid.el.playbackRate - hedefHiz) > 0.1) vid.el.playbackRate = hedefHiz;
            if (vid.el.paused) { const p = vid.el.play(); if (p && p.catch) p.catch(() => {}); }
          }
          yOff = -Math.abs(Math.sin(g.adim)) * 3;
        } else {
          yOff = -Math.abs(Math.sin(g.adim)) * 14;
          don = Math.sin(g.adim * 2) * 0.06;
        }
        if (kayiyor || camur) {
          don = Math.sin(this.saat * 22 + i) * (kayiyor ? 0.45 : 0.25);
          yOff = 0;
        }
        let ucusY = 0;
        g.leylek.visible = false;
        if (ucus) {
          const ilerleme = 1 - ucus.kalanMesafe / Math.max(ucus.toplam, 1e-6);
          ucusY = -Math.sin(Math.PI * sinirla(ilerleme, 0, 1)) * (ucus.tur === "leylek" ? 110 : 90);
          if (ucus.tur === "roket") don = -0.25;
          if (ucus.tur === "leylek") {
            g.leylek.visible = true;
            g.leylek.position.set(10, ucusY - 90 + Math.sin(this.saat * 14) * 6);
          }
        }
        hayvan.y = yOff + ucusY;
        hayvan.rotation = don;
        g.golge.scale.set(1 - Math.min(0.6, -ucusY / 200));
        // İsim hayvanın solunda, kendi kulvarının ortasında; solda yer yoksa sağında
        const isimSag = x - 58 - g.isim.width < 50;
        g.isim.anchor.x = isimSag ? 0 : 1;
        g.isimKap.position.set(isimSag ? 58 : -58, -L.kulvarH / 2 + 8);
        g.tac.position.set(0, -100 + ucusY + (g.leylek.visible ? -60 : 0));

        // Efekt ikonu
        let ikon = null;
        if (ucus && ucus.tur === "roket") ikon = "roket";
        else if (havuc) ikon = "havuc";
        else if (hiz) ikon = "hiz";
        if (ikon) {
          if (g.ikonTur !== ikon) {
            g.ikon.texture = this.efektDoku(ikon, 72);
            g.ikon.scale.set(64 / Math.max(1, g.ikon.texture.height));
            g.ikonTur = ikon;
          }
          g.ikon.visible = true;
          if (ikon === "roket") g.ikon.position.set(-62, ucusY - 40);
          else if (ikon === "havuc") g.ikon.position.set(0, ucusY - 175 + Math.sin(this.saat * 8) * 6);
          else g.ikon.position.set(-24, yOff - 96); // hız bulutu hayvanın sırtında (isimle çakışmasın)
          if (ikon === "roket" && Math.random() < dt * 30) this._parcacik(this.emoji("🔥", 36), x - 70, g.kap.y + ucusY - 40, -150, (Math.random() - 0.5) * 60, 0.35);
        } else {
          g.ikon.visible = false;
          g.ikonTur = null;
        }
        g.sersem.visible = kayiyor;
        if (kayiyor) g.sersem.position.set(Math.sin(this.saat * 10) * 20, -120);
      });

      // Çamur yağmuru damlaları
      if (this._camurKalan > 0) {
        this._camurKalan -= dt;
        for (let n = 0; n < 4; n++) {
          const gr = new PIXI.Graphics();
          gr.beginFill(Math.random() < 0.5 ? 0x6b3f1d : 0x8b5a2b).drawEllipse(0, 0, 6 + Math.random() * 6, 10 + Math.random() * 8).endFill();
          gr.position.set(Math.random() * G, L.gokY - 20);
          this.camurKat.addChild(gr);
          this.parcaciklar.push({ sp: gr, vx: -60, vy: 900 + Math.random() * 400, omur: 1.2, yas: 0, tur: "camur" });
        }
      }

      if (o.faz === "fotofinis") {
        this.fotoYazi.alpha = Math.min(1, this.fotoYazi.alpha + dt * 3);
        this.fotoYazi.scale.set(1 + Math.sin(this.saat * 6) * 0.03);
      }
      // HUD
      const hedefB = o.begeniHedef || 1000;
      const doluluk = sinirla(o.begeniBar / hedefB, 0, 1);
      const yuvarla = Math.round(doluluk * 200);
      if (this._barSon !== yuvarla) {
        this._barSon = yuvarla;
        this.barDolgu.clear();
        const renk = doluluk < 0.5 ? 0xff4d7a : doluluk < 0.8 ? 0xff8c1a : 0xff2d2d;
        if (doluluk > 0) this.barDolgu.beginFill(renk, 0.85).drawRoundedRect(5, 5, Math.max(40, (G - 90) * doluluk), L.barH - 10, 22).endFill();
        this.barSayi.text = this.Y.doldur(this.M.begeniSayi, { n: o.begeniBar.toLocaleString("tr-TR"), h: hedefB.toLocaleString("tr-TR") });
      }
      // Bar dolmak üzereyken nabız gibi atsın
      this.barKap.scale.set(doluluk >= 0.8 ? 1 + Math.abs(Math.sin(this.saat * 6)) * 0.015 : 1);
      if (this.saat - (this._liderZaman3 || -9) > 1) {
        this._liderZaman3 = this.saat;
        const l = o.enCokBegenenler(3);
        const m = l.length ? this.Y.doldur(this.M.enCokBegenen, { liste: l.map((b) => b.ad + " " + b.sayi).join("  •  ") }) : "";
        if (this.barLider.text !== m) { this.barLider.text = m; if (this.barLider.width > G - 120) this.barLider.scale.set((G - 120) / this.barLider.width); else this.barLider.scale.set(1); }
      }
      if (this.saat - (this._siraZaman || -9) > 0.5) {
        this._siraZaman = this.saat;
        const sm = this._siraMetni(6);
        if (this.siraYazi.text !== sm) this.siraYazi.text = sm;
        const am = o.aga ? this.Y.doldur(this.M.aga, { ad: o.aga.ad }) : "";
        if (this.agaYazi.text !== am) this.agaYazi.text = am;
      }
    }

    _kursuGuncelle(dt) {
      const o = this.oyun;
      const st = this.Y.doldur(this.M.sonrakiTur, { sn: Math.ceil(o.kalanSure()) });
      if (this.kursuSure.text !== st) this.kursuSure.text = st;
      if (this._kursuHayvan) {
        const z = Math.abs(Math.sin(this.saat * 5));
        this._kursuHayvan.sprite.y = -z * 60;
        this._kursuHayvan.rotation = Math.sin(this.saat * 5) * 0.05;
      }
      if (Math.random() < dt * 14 && this.parcaciklar.length < 200) this._konfeti();
    }

    _bildirimGuncelle(dt) {
      this._bildirimBekle = (this._bildirimBekle || 0) - dt;
      if (this.bildirimSirasi.length && this._bildirimBekle <= 0) {
        // önemli olanlar öne
        let idx = this.bildirimSirasi.findIndex((b) => b.tur === "aga" || b.tur === "hediye" || b.tur === "buyuk");
        if (idx < 0) idx = 0;
        const b = this.bildirimSirasi.splice(idx, 1)[0];
        this._bildirimGoster(b);
        this._bildirimBekle = this.bildirimSirasi.length > 4 ? 0.35 : 0.6;
      }
      const lobide = this.oyun.faz === "lobi" || this.oyun.faz === "start" || this.oyun.faz === "kursu";
      const tabanY = lobide ? 1400 : L.bildirimY;
      for (let i = this.bildirimler.length - 1; i >= 0; i--) {
        const b = this.bildirimler[i];
        b.yas += dt;
        const hedefY = tabanY + i * 66;
        b.y += (hedefY - b.y) * Math.min(1, dt * 10);
        b.alpha = b.yas < 0.2 ? b.yas / 0.2 : b.yas > b.omur - 0.4 ? Math.max(0, (b.omur - b.yas) / 0.4) : 1;
        if (b.yas >= b.omur) {
          b.destroy({ children: true });
          this.bildirimler.splice(i, 1);
        }
      }
    }

    _parcacikGuncelle(dt) {
      const p = this.parcaciklar;
      for (let i = p.length - 1; i >= 0; i--) {
        const q = p[i];
        if (q.tur === "yol") {
          q.t += dt;
          const u = Math.min(1, q.t / q.omur);
          q.sp.x = q.x0 + (q.x1 - q.x0) * u;
          q.sp.y = q.y0 + (q.y1 - q.y0) * u + q.tepe * 4 * u * (1 - u);
          q.sp.rotation += dt * 12;
          if (u >= 1) { q.sp.destroy(); p.splice(i, 1); }
          continue;
        }
        q.yas += dt;
        if (q.tur === "fisek") {
          q.vy += 520 * dt;
          if (q.vy > -160 || q.sp.y < q.patla) { this._fisekPatla(q.sp.x, q.sp.y, q.renk); q.sp.destroy(); p.splice(i, 1); continue; }
        } else if (q.tur === "kivilcim") {
          q.vy += 260 * dt;
          q.vx *= 1 - dt * 0.8;
          q.sp.alpha = Math.max(0, 1 - q.yas / q.omur);
        }
        q.sp.x += q.vx * dt;
        q.sp.y += q.vy * dt;
        if (q.tur === "konfeti") { q.sp.rotation += q.don * dt; q.sp.x += Math.sin(this.saat * 3 + i) * 0.8; }
        else if (q.tur === "uc") q.sp.alpha = Math.max(0, 1 - q.yas / q.omur);
        if (q.yas >= q.omur || q.sp.y > Yuk + 40) {
          q.sp.destroy();
          p.splice(i, 1);
        }
      }
    }

    _katilimGuncelle(dt) {
      // aynı anda en fazla 3 büyük katılım yazısı
      if (this.katilimSirasi.length && this.katilimKat.children.length < 3) {
        const o = this.katilimSirasi.shift();
        const h = this.A.hayvanlar[o.kulvar] || {};
        const kap = new PIXI.Container();
        const t = new PIXI.Text(this.Y.doldur(this.M.katildiBuyuk, { ad: o.ad, emoji: h.emoji || "" }), stil(54, 0xffffff, { strokeThickness: 0 }));
        t.anchor.set(0.5);
        if (t.width > G - 140) t.scale.set((G - 140) / t.width);
        const w = t.width + 60, hh = 84;
        const bg = new PIXI.Graphics();
        bg.beginFill(0x1f7a33, 0.94).drawRoundedRect(-w / 2, -hh / 2, w, hh, 42).endFill();
        kap.addChild(bg, t);
        kap.yas = 0;
        kap.scale.set(0.3);
        kap.position.set(G / 2, 0);
        this.katilimKat.addChild(kap);
      }
      const lobide = this.oyun.faz === "lobi" || this.oyun.faz === "start";
      const taban = lobide ? 660 : 640;
      this.katilimKat.children.slice().forEach((k, i) => {
        k.yas += dt;
        k.y += (taban + i * 96 - k.y) * Math.min(1, dt * 12);
        k.scale.set(Math.min(1, k.scale.x + dt * 6));
        k.alpha = k.yas > 1.8 ? Math.max(0, 1 - (k.yas - 1.8) / 0.4) : 1;
        if (k.yas > 2.2) k.destroy({ children: true });
      });
      // 30 sn kimse yazmazsa yanıp sönen çağrı
      const o = this.oyun, f = o.faz;
      const sessiz = o.zaman - (o.sonYorumZaman || 0) > (this.A.sessizlikCagriSn || 30);
      const bosVar = o.kulvarlar.some((k) => !k.oyuncu);
      const goster = sessiz && ((f === "lobi" && bosVar) || f === "yaris");
      this.cagriYazi.visible = goster;
      if (goster) { this.cagriYazi.alpha = 0.55 + Math.abs(Math.sin(this.saat * 3)) * 0.45; this.cagriYazi.scale.set(1 + Math.sin(this.saat * 3) * 0.03); }
    }

    // Hediye gelince: resmi + gönderenin adı yukarıdan hayvana (ya da ortaya) uçar, jeton sayısı patlar
    _hediyeUcur(o) {
      if (this.ucanlar.length > 6) return;
      const kap = new PIXI.Container();
      const hediye = o.resim || o.emoji ? { resim: o.resim, emoji: o.emoji } : null;
      const sp = new PIXI.Sprite(this.hediyeDokusu(hediye, o.efekt));
      sp.anchor.set(0.5);
      sp.scale.set(130 / Math.max(sp.texture.width, sp.texture.height, 1));
      kap.addChild(sp);
      const ad = new PIXI.Text(o.ad + (o.hediyeAdi ? " · " + o.hediyeAdi : ""), stil(30, 0xffe14d, { strokeThickness: 6 }));
      ad.anchor.set(0.5, 0);
      ad.position.set(0, 70);
      kap.addChild(ad);
      kap.position.set(G / 2, 170);
      this.hediyeKat.addChild(kap);
      let x1 = G / 2, y1 = 700;
      const g = this.kulvarGorsel && this.kulvarGorsel[o.kulvar];
      if (g && (this.oyun.faz === "yaris" || this.oyun.faz === "fotofinis")) { x1 = g.x; y1 = g.kap.y - 80; }
      this.ucanlar.push({ kap, sp, hediye, efekt: o.efekt, t: 0, x0: G / 2, y0: 170, x1, y1, jeton: o.jeton });
    }

    _ucanGuncelle(dt) {
      for (let i = this.ucanlar.length - 1; i >= 0; i--) {
        const u = this.ucanlar[i];
        u.t += dt;
        // resim sonradan indiyse değiştir
        if (u.hediye && u.hediye.resim) {
          const d = this.hediyeDokusu(u.hediye, u.efekt);
          if (d !== u.sp.texture) { u.sp.texture = d; u.sp.scale.set(130 / Math.max(d.width, d.height, 1)); }
        }
        const sure = 1.1;
        if (u.t < 0.5) { u.kap.scale.set(0.5 + u.t); }
        else {
          const k = Math.min(1, (u.t - 0.5) / sure), e = k * k * (3 - 2 * k);
          u.kap.position.set(u.x0 + (u.x1 - u.x0) * e, u.y0 + (u.y1 - u.y0) * e - Math.sin(Math.PI * k) * 120);
          u.kap.scale.set(1 - 0.4 * e);
          if (k >= 1 && !u.patladi) {
            u.patladi = true;
            const t = new PIXI.Text("+" + u.jeton + " 🪙", stil(64, 0xffd34d, { strokeThickness: 10 }));
            t.anchor.set(0.5);
            t.position.set(u.x1, u.y1 - 30);
            this.efektKat.addChild(t);
            this.parcaciklar.push({ sp: t, vx: 0, vy: -90, omur: 1.3, yas: 0, tur: "uc" });
            for (let n = 0; n < 8; n++) this._parcacik(this.emoji("✨", 44), u.x1, u.y1, (Math.random() - 0.5) * 300, -100 - Math.random() * 200, 0.8);
          }
        }
        if (u.t > 0.5 + sure + 0.25) { u.kap.destroy({ children: true }); this.ucanlar.splice(i, 1); }
      }
    }

    _spikerGuncelle() {
      const a = this.spiker && this.spiker.altyazi;
      if (!a) { this.spikerKap.visible = false; return; }
      if (this.spikerYazi.text !== "🎙️ " + a.metin) {
        this.spikerYazi.text = "🎙️ " + a.metin;
        const w = Math.min(G - 60, this.spikerYazi.width + 60), h = this.spikerYazi.height + 26;
        this.spikerBg.clear().beginFill(0x10223a, 0.88).drawRoundedRect(-w / 2, -h / 2, w, h, h / 2).endFill();
      }
      const f = this.oyun.faz;
      this.spikerKap.position.set(G / 2, f === "yaris" || f === "fotofinis" ? L.spikerY : f === "kursu" ? 1360 : 1340);
      this.spikerKap.visible = true;
    }

    _ortaGuncelle(dt) {
      if (this._baslaGoster > 0) {
        this._baslaGoster -= dt;
        this.buyukYazi.scale.set(1 + (1.1 - this._baslaGoster) * 0.4);
        this.buyukYazi.alpha = Math.min(1, this._baslaGoster * 2);
        if (this._baslaGoster <= 0) { this.buyukYazi.visible = false; this.buyukYazi.alpha = 1; }
      }
      if (this.camurYazi.visible) {
        this.camurYazi.scale.set(Math.min(1, this.camurYazi.scale.x + dt * 3));
        if (!(this._camurKalan > 0)) this.camurYazi.visible = false;
      }
    }
  }

  window.Cizim = Cizim;
})();
