// EKRAN ÇİZİMİ (PixiJS). Oyun mantığını okur, hiçbir kuralı değiştirmez.
(function () {
  const G = 1080, Yuk = 1920;
  const YAZI = ["Arial Rounded MT Bold", "Segoe UI", "Arial", "Noto Color Emoji", "Segoe UI Emoji", "sans-serif"];
  // Yerleşim (piksel)
  const L = {
    ustBas: 0, tabloY: 165, tabloH: 190,
    sahneY: 370,
    gokY: 0, gokH: 570,
    kulvarY: 570, kulvarH: 98,
    onplanY: 1354, onplanH: 96,
    barY: 1470, ipucuY: 1560, siraY: 1620,
    bildirimY: 392,
    baslangicX: 150, pikselBirim: 70
  };
  const EMOJI_EFEKT = { muz: "🍌", roket: "🚀", havuc: "🥕", leylek: "🦢", camur: "🟤", hiz: "💨", kalp: "❤️", yildiz: "⭐", tac: "👑", konfeti: "🎉", sersem: "💫" };

  function stil(boyut, renk, ek) {
    return new PIXI.TextStyle(Object.assign({
      fontFamily: YAZI, fontSize: boyut, fill: renk || 0xffffff, fontWeight: "900",
      stroke: 0x2b1a0e, strokeThickness: Math.max(3, Math.round(boyut / 7)), lineJoin: "round"
    }, ek || {}));
  }
  function sinirla(x, a, b) { return Math.max(a, Math.min(b, x)); }
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
      g.beginFill(0x7cc96b).drawRect(0, 1350, G, 570).endFill();
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
        const o = Math.min(560 / lg.texture.width, 150 / lg.texture.height);
        lg.scale.set(o);
        lg.anchor.set(0.5, 0);
        lg.position.set(G / 2, 8);
        u.addChild(lg);
      } else {
        const t = new PIXI.Text(this.A.oyunAdi, stil(64, 0xffe14d, { dropShadow: true, dropShadowDistance: 5, dropShadowAlpha: 0.5 }));
        t.anchor.set(0.5, 0);
        t.position.set(G / 2, 50);
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
      const kartY = L.sahneY + 10;
      const ust = new PIXI.Container();
      ust.position.set(40, kartY);
      ust.addChild(this.panel(G - 80, 170, 0x1d1208, 0.66, 28));
      this.lobiBaslik = new PIXI.Text(this.M.lobi, stil(64, 0xffe14d));
      this.lobiBaslik.position.set(30, 12);
      ust.addChild(this.lobiBaslik);
      this.lobiSure = new PIXI.Text("0:45", stil(72, 0xffffff));
      this.lobiSure.anchor.set(1, 0);
      this.lobiSure.position.set(G - 80 - 30, 6);
      ust.addChild(this.lobiSure);
      const alt = new PIXI.Text(this.M.lobiAlt, stil(30, 0xffffff, { wordWrap: true, wordWrapWidth: G - 140, strokeThickness: 5 }));
      alt.position.set(30, 92);
      ust.addChild(alt);
      l.addChild(ust);

      this.lobiSatirlar = [];
      const satirY = kartY + 190, satirH = 104;
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
      siraKap.position.set(40, satirY + this.A.hayvanlar.length * satirH + 4);
      siraKap.addChild(this.panel(G - 80, 110, 0x1d1208, 0.66, 22));
      this.lobiSira = new PIXI.Text("", stil(28, 0xffffff, { wordWrap: true, wordWrapWidth: G - 140, strokeThickness: 5, lineHeight: 34 }));
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
      kart.position.set(60, L.sahneY + 10);
      kart.addChild(this.panel(G - 120, 210, 0x1d1208, 0.66, 30));
      this.kursuBaslik = new PIXI.Text(this.M.kazanan, stil(60, 0xffe14d));
      this.kursuBaslik.anchor.set(0.5, 0);
      this.kursuBaslik.position.set((G - 120) / 2, 10);
      kart.addChild(this.kursuBaslik);
      this.kursuIsim = new PIXI.Text("", stil(84, 0xffffff));
      this.kursuIsim.anchor.set(0.5, 0);
      this.kursuIsim.position.set((G - 120) / 2, 84);
      kart.addChild(this.kursuIsim);
      k.addChild(kart);

      this.kursuAlt = new PIXI.Text("", stil(34, 0xffffff, { align: "center", lineHeight: 46, strokeThickness: 6 }));
      this.kursuAlt.anchor.set(0.5, 0);
      this.kursuAlt.position.set(G / 2, 1250);
      k.addChild(this.kursuAlt);
      this.kursuSure = new PIXI.Text("", stil(32, 0xffe14d));
      this.kursuSure.anchor.set(0.5, 0);
      this.kursuSure.position.set(G / 2, 1420);
      k.addChild(this.kursuSure);
      this.konfetiKat = new PIXI.Container();
      k.addChild(this.konfetiKat);
    }

    _hudKur() {
      const h = this.hud;
      h.removeChildren().forEach((c) => c.destroy({ children: true }));
      const bar = new PIXI.Container();
      bar.position.set(40, L.barY);
      this.barCerceve = this.panel(G - 80, 76, 0x1d1208, 0.7, 38);
      bar.addChild(this.barCerceve);
      this.barDolgu = new PIXI.Graphics();
      bar.addChild(this.barDolgu);
      this.barYazi = new PIXI.Text("", stil(28, 0xffffff, { strokeThickness: 5 }));
      this.barYazi.anchor.set(0.5);
      this.barYazi.position.set((G - 80) / 2, 38);
      bar.addChild(this.barYazi);
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
      this.agaYazi.position.set(G / 2, L.siraY + 140);
      h.addChild(this.agaYazi);
    }

    _ortaKur() {
      const o = this.ortaKat;
      o.removeChildren().forEach((c) => c.destroy({ children: true }));
      this.buyukYazi = new PIXI.Text("", stil(200, 0xffe14d, { strokeThickness: 18, dropShadow: true, dropShadowDistance: 8, dropShadowAlpha: 0.5 }));
      this.buyukYazi.anchor.set(0.5);
      this.buyukYazi.position.set(G / 2, 900);
      this.buyukYazi.visible = false;
      o.addChild(this.buyukYazi);
      this.bayrak = new PIXI.Container();
      this.bayrak.position.set(G / 2, 1540);
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
      this.camurYazi.position.set(G / 2, 760);
      this.camurYazi.visible = false;
      o.addChild(this.camurYazi);
      this.fotoYazi = new PIXI.Text(this.M.fotoFinis, stil(110, 0xffffff, { stroke: 0x111111, strokeThickness: 14 }));
      this.fotoYazi.anchor.set(0.5);
      this.fotoYazi.position.set(G / 2, 480);
      this.fotoYazi.visible = false;
      o.addChild(this.fotoYazi);
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
      this._klipKapat();
      if (f === "lobi") {
        this.kamX = 0;
        this._imzalar.lobi = "";
      }
      if (f === "start") {
        this.v.cal("geri-sayim");
        const vk = this.v.video.start;
        if (vk) this._klipAc(vk);
        this.bayrak.visible = true;
        this.bayrakYazi.text = o.aga ? this.Y.doldur(this.M.startBayragi, { ad: "👑 " + o.aga.ad }) : this.A.oyunAdi + " — " + this.Y.doldur(this.M.tur, { n: o.turNo });
      }
      if (f === "yaris") {
        this.v.cal("duduk");
        this._kulvarlariKur();
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
        const yer = [[G / 2, 1090, 300, 0xffd34d, "1"], [G / 2 - 330, 1140, 250, 0xd7d7d7, "2"], [G / 2 + 330, 1170, 220, 0xd99a5b, "3"]];
        yer.forEach(([x, yy, w, renk]) => b.beginFill(renk).drawRoundedRect(x - w / 2, yy, w, 1240 - yy, 16).endFill());
        s.ilkUc.forEach((u, i) => {
          const [x, yy] = yer[i];
          const hg = this.hayvanGorseli(u.kulvar, i === 0 ? 420 : 200, "resim");
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
      this.kursuIsim.text = kazanan.ad ? kazanan.ad : this.hAdi(s.kazanan);
      this.kursuBaslik.text = this.M.kazanan + " — " + this.hAdi(s.kazanan);
      this.kursuAlt.text = s.ilkUc.map((u, i) => (i + 1) + ". " + this.hAdi(u.kulvar) + (u.ad ? " — " + u.ad : "")).join("\n") + (kazanan.ad ? "" : "\n" + this.M.kimseYok);
      this.v.cal("kazanan");
      this.v.cal(h.klasor);
      for (let i = 0; i < 70; i++) this._konfeti();
    }

    // ---------------------------------------------------------------- olaylar
    olaylariIsle() {
      const liste = this.oyun.olaylar;
      if (!liste.length) return;
      this.oyun.olaylar = [];
      for (const o of liste) {
        switch (o.tip) {
          case "faz": this.fazDegisti(o.faz); break;
          case "bildirim": this._bildirimEkle(o.metin, o.tur); break;
          case "efekt": this._efektBasla(o); break;
          case "kayma": this._kaymaBasla(o); break;
          case "camur": this._camurBasla(o.sure); break;
          case "begeni": this._kalp(o.kulvar, o.sayi); break;
          case "bitis": this._flasla(); break;
          case "aga": this.v.cal("aga"); this._flasla(0.5); break;
          case "katildi": if (this.lobiSatirlar[o.kulvar]) this.lobiSatirlar[o.kulvar].nabiz = 1; this.v.cal("katil"); break;
          case "barDoldu": break;
          default: break;
        }
      }
    }

    _bildirimEkle(metin, tur) {
      const onemli = tur === "hediye" || tur === "aga" || tur === "buyuk" || tur === "ucretsiz";
      // Kalabalıkta katılım bildirimlerini sınırla
      if (!onemli && this.bildirimSirasi.length > 6) return;
      if (this.bildirimSirasi.length > 30) this.bildirimSirasi.splice(0, this.bildirimSirasi.length - 30);
      this.bildirimSirasi.push({ metin, tur });
    }

    _bildirimGoster(b) {
      const renk = { hediye: 0xff7a1a, aga: 0xc99700, buyuk: 0x6b3f1d, ucretsiz: 0x2e9d4b, katilim: 0x2a6fdb }[b.tur] || 0x333333;
      const kap = new PIXI.Container();
      const t = new PIXI.Text(b.metin, stil(34, 0xffffff, { strokeThickness: 0 }));
      const w = Math.min(G - 60, t.width + 48);
      if (t.width > G - 108) t.scale.set((G - 108) / t.width);
      const bg = this.panel(w, 62, renk, 0.92, 31);
      kap.addChild(bg);
      t.anchor.set(0.5);
      t.position.set(w / 2, 31);
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
      if (f === "kursu") this._kursuGuncelle(dt);
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
          ? liste.map((e, i) => (i + 1) + ". " + e.ad + "  " + (t.tur === "efsaneler" ? this.Y.doldur(this.M.galibiyet, { n: e.galibiyet }) : this.Y.doldur(this.M.puan, { n: e.puan }))).join("\n")
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
      o.kulvarlar.forEach((kul, i) => {
        const g = this.kulvarGorsel[i];
        if (!g) return;
        // İsim/taç
        const ad = kul.oyuncu ? kul.oyuncu.ad : this.hAdi(i);
        if (g.isim.text !== ad) {
          g.isim.text = ad;
          g.isim.style.fill = kul.oyuncu ? 0xffffff : 0xe8d9c0;
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
          else g.ikon.position.set(-70, yOff - 40);
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
      const U = this.A.ucretsiz;
      const doluluk = sinirla(o.begeniBar / U.begeniBariHedef, 0, 1);
      const yuvarla = Math.round(doluluk * 200);
      if (this._barSon !== yuvarla) {
        this._barSon = yuvarla;
        this.barDolgu.clear();
        if (doluluk > 0) this.barDolgu.beginFill(0xff4d7a).drawRoundedRect(6, 6, Math.max(64, (G - 92) * doluluk), 64, 32).endFill();
        this.barYazi.text = this.Y.doldur(this.M.begeniBari, { n: o.begeniBar, h: U.begeniBariHedef });
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
      const tabanY = lobide ? 1700 : L.bildirimY;
      for (let i = this.bildirimler.length - 1; i >= 0; i--) {
        const b = this.bildirimler[i];
        b.yas += dt;
        const hedefY = tabanY + i * 70 * (lobide ? -1 : 1);
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
