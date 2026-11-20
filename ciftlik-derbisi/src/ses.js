// SES SİSTEMİ: arka plan müziği (geçişli), efekt sesleri ve spiker.
//  - Oyun müzikleri:  assets/muzik/oyun/  (lobi-*.mp3, yaris-*.mp3, derbi*.mp3, zafer*.mp3, efsane*.mp3)
//  - Senin listen:    assets/muzik/liste/ (istediğin kadar şarkı; karışık sırayla, tekrarsız çalar)
//  - Efektler:        assets/ses/<ad>.mp3     (yoksa basit sentez sesi çalar)
//  - Spiker:          assets/ses/spiker/<anahtar>.mp3
(function () {
  const UZANTI = /\.(mp3|ogg|wav|m4a|aac|opus|webm)$/i;
  const KATEGORILER = ["lobi", "yaris", "derbi", "zafer", "efsane"];

  function karistir(dizi) {
    const a = dizi.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function yolKodla(yol) { return yol.split("/").map(encodeURIComponent).join("/"); }

  class Ses {
    constructor(A) {
      this.A = A;
      this.oyunParcalari = {};   // kategori -> [url]
      this.liste = [];           // kullanıcının şarkıları [url]
      this.torba = {};           // tekrarsız çalma sırası
      this.muzikA = this._muzikEl();
      this.muzikB = this._muzikEl();
      this.aktif = null;         // çalan müzik elemanı
      this.kategori = null;
      this.efektler = {};        // ad -> Audio (şablon)
      this.yokEfekt = new Set();
      this.spikerSesleri = {};
      this.spikerKonusuyor = false;
      this.kilitli = false;      // tarayıcı otomatik çalmayı engelledi mi
      this.ctx = null;
      this._sonTik = 0;
      this._kilitDinle();
    }

    _muzikEl() {
      const a = new Audio();
      a.preload = "auto";
      a.volume = 0;
      a.addEventListener("ended", () => { if (a === this.aktif) this._sonrakiParca(); });
      a.addEventListener("error", () => { if (a === this.aktif) setTimeout(() => this._sonrakiParca(), 500); });
      return a;
    }

    async _liste(klasor) {
      try {
        const r = await fetch("api/muzik?klasor=" + klasor, { cache: "no-store" });
        if (r.ok) { const j = await r.json(); if (Array.isArray(j)) return j.filter((d) => UZANTI.test(d)); }
      } catch (e) { /* sunucu listeyi veremedi */ }
      try { // yedek: liste.txt (her satıra bir dosya adı)
        const r = await fetch("assets/muzik/" + klasor + "/liste.txt", { cache: "no-store" });
        if (r.ok) return (await r.text()).split(/\r?\n/).map((s) => s.trim()).filter((s) => s && UZANTI.test(s));
      } catch (e) { /* yok */ }
      return [];
    }

    async yukle() {
      const oyun = await this._liste("oyun");
      for (const k of KATEGORILER) {
        this.oyunParcalari[k] = oyun.filter((d) => d.toLowerCase().startsWith(k)).map((d) => yolKodla("assets/muzik/oyun/" + d));
      }
      this.liste = (await this._liste("liste")).map((d) => yolKodla("assets/muzik/liste/" + d));
      console.log("Müzik: oyun parçası", oyun.length, "• liste şarkısı", this.liste.length);
      // Spiker seslerini önceden hazırla
      if (window.Spiker) {
        for (const k of Object.keys(window.Spiker.SATIRLAR)) {
          const a = new Audio("assets/ses/spiker/" + k + ".mp3");
          a.preload = "auto";
          a.addEventListener("error", () => { a._yok = true; });
          this.spikerSesleri[k] = a;
        }
      }
    }

    // ------------------------------------------------------------- müzik
    _kaynakListesi(kategori) {
      const kaynak = this.A.muzikKaynagi || "oyun";
      const oyun = this.oyunParcalari[kategori] || [];
      const jingle = kategori === "zafer" || kategori === "efsane";
      if (kaynak === "liste" && this.liste.length && !jingle) return { anahtar: "liste", dizi: this.liste };
      if (kaynak === "karisik" && this.liste.length && kategori === "lobi") return { anahtar: "liste", dizi: this.liste };
      if (!oyun.length && kategori === "derbi") return { anahtar: "yaris", dizi: this.oyunParcalari.yaris || [] };
      if (!oyun.length && kategori === "efsane") return { anahtar: "zafer", dizi: this.oyunParcalari.zafer || [] };
      if (!oyun.length && this.liste.length && !jingle) return { anahtar: "liste", dizi: this.liste };
      return { anahtar: kategori, dizi: oyun };
    }

    _torbadanAl(anahtar, dizi) {
      if (!dizi.length) return null;
      let t = this.torba[anahtar];
      if (!t || !t.length) {
        t = karistir(dizi);
        // art arda aynı şarkı gelmesin
        if (this._sonUrl && t.length > 1 && t[t.length - 1] === this._sonUrl) [t[0], t[t.length - 1]] = [t[t.length - 1], t[0]];
        this.torba[anahtar] = t;
      }
      return t.pop();
    }

    // Kategoriye geç (lobi, yaris, derbi, zafer, efsane). Aynı kaynaktaysa çalan şarkı devam eder.
    muzik(kategori) {
      if (!this.A.muzikAcik) return;
      const { anahtar, dizi } = this._kaynakListesi(kategori);
      const jingle = kategori === "zafer" || kategori === "efsane";
      if (!jingle && this._kaynakAnahtar === anahtar && this.aktif && !this.aktif.paused) { this.kategori = kategori; return; }
      this.kategori = kategori;
      this._kaynakAnahtar = anahtar;
      this._jingle = jingle;
      this._calYeni(this._torbadanAl(anahtar, dizi));
    }

    _sonrakiParca() {
      if (this._jingle) { this.aktif = null; return; } // kutlama müziği bir kez çalar
      const { anahtar, dizi } = this._kaynakListesi(this.kategori || "lobi");
      this._calYeni(this._torbadanAl(anahtar, dizi));
    }

    _calYeni(url) {
      if (!url) return;
      const yeni = this.aktif === this.muzikA ? this.muzikB : this.muzikA;
      const eski = this.aktif;
      yeni.src = url;
      yeni.currentTime = 0;
      yeni.volume = 0;
      this._sonUrl = url;
      this.aktif = yeni;
      this._eski = eski; // guncelle() sesini kısıp durdurur
      this._oynat(yeni);
    }

    _oynat(el) {
      try {
        const p = el.play();
        if (p && p.catch) p.catch((e) => { if (e && e.name === "NotAllowedError") this.kilitli = true; });
      } catch (e) { /* yoksay */ }
    }

    muzikDurdur() { this.aktif = null; }

    // ------------------------------------------------------------- efektler
    efekt(ad, seviye) {
      if (!this.A.sesAcik || !ad) return;
      const v = Math.max(0, Math.min(1, (this.A.sesSeviyesi == null ? 0.7 : this.A.sesSeviyesi) * (seviye || 1)));
      if (this.yokEfekt.has(ad)) { this.sentez(ad, v); return; }
      let sablon = this.efektler[ad];
      if (!sablon) {
        sablon = new Audio("assets/ses/" + ad + ".mp3");
        sablon.preload = "auto";
        sablon.addEventListener("error", () => { this.yokEfekt.add(ad); });
        this.efektler[ad] = sablon;
      }
      // Ses sınırlayıcı: aynı anda çok efekt üst üste binip patlamasın
      const sinir = this.A.enFazlaEsZamanliEfekt || 5;
      if ((this._calan || 0) >= sinir) return;
      try {
        const c = sablon.cloneNode();
        c.volume = v;
        this._calan = (this._calan || 0) + 1;
        let bitti = false;
        const azalt = () => { if (!bitti) { bitti = true; this._calan = Math.max(0, this._calan - 1); } };
        c.addEventListener("ended", azalt);
        c.addEventListener("error", azalt);
        setTimeout(azalt, 7000);
        const p = c.play();
        if (p && p.catch) p.catch((e) => { if (e && e.name === "NotAllowedError") this.kilitli = true; else this.sentez(ad, v); });
      } catch (e) { this.sentez(ad, v); }
    }

    // Dosyası olmayan küçük sesler için basit sentez (kredi harcamaz)
    sentez(ad, v) {
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const c = this.ctx;
        if (c.state === "suspended") { this.kilitli = true; return; }
        const t = c.currentTime;
        const ton = (f1, f2, sure, tip, ses) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = tip || "sine";
          o.frequency.setValueAtTime(f1, t);
          o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + sure);
          g.gain.setValueAtTime((ses || 0.25) * v, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + sure);
          o.connect(g).connect(c.destination);
          o.start(t);
          o.stop(t + sure + 0.02);
        };
        switch (ad) {
          case "geri-sayim": ton(880, 880, 0.18, "square", 0.15); break;
          case "katil": ton(500, 950, 0.09, "sine", 0.3); break;
          case "begeni": ton(1300, 1600, 0.05, "sine", 0.12); break;
          case "kombo": ton(990, 990, 0.08, "triangle", 0.25); setTimeout(() => ton(1320, 1320, 0.12, "triangle", 0.25), 90); break;
          case "tahmin": ton(700, 1100, 0.12, "triangle", 0.18); break;
          default: ton(600, 300, 0.15, "triangle", 0.2); break;
        }
      } catch (e) { /* ses yok */ }
    }

    // Beğeni tıkırtısı (saniyede en fazla 4)
    tik() {
      const s = performance.now();
      if (s - this._sonTik < 250) return;
      this._sonTik = s;
      this.sentez("begeni", (this.A.sesSeviyesi || 0.7) * 0.6);
    }

    // ------------------------------------------------------------- spiker
    // Çalabilirse süreyi (sn) döner, bitince bitti() çağrılır; çalamazsa 0.
    spikerCal(anahtar, bitti) {
      if (!this.A.spikerAcik) return 0;
      const sablon = this.spikerSesleri[anahtar];
      if (!sablon || sablon._yok) return 0;
      const a = sablon.cloneNode();
      a.volume = Math.max(0, Math.min(1, this.A.spikerSeviyesi == null ? 1 : this.A.spikerSeviyesi));
      let bitti1 = false;
      const son = () => { if (bitti1) return; bitti1 = true; this.spikerKonusuyor = false; bitti(); };
      a.addEventListener("ended", son);
      a.addEventListener("error", son);
      this.spikerKonusuyor = true;
      try {
        const p = a.play();
        if (p && p.catch) p.catch((e) => { if (e && e.name === "NotAllowedError") this.kilitli = true; son(); });
      } catch (e) { son(); }
      setTimeout(son, 8000); // takılırsa
      return sablon.duration || 1.5;
    }

    // ------------------------------------------------------------- kare güncelleme
    guncelle(dt) {
      const hedef = (this.A.muzikSeviyesi == null ? 0.35 : this.A.muzikSeviyesi) * (this.spikerKonusuyor ? 0.4 : 1);
      const hiz = dt / 1.5; // 1.5 sn geçiş
      if (this.aktif) {
        const v = this.aktif.volume;
        this.aktif.volume = Math.max(0, Math.min(1, v + Math.max(-hiz, Math.min(hiz, hedef - v))));
      }
      if (this._eski) {
        this._eski.volume = Math.max(0, this._eski.volume - hiz);
        if (this._eski.volume <= 0.001) { this._eski.pause(); this._eski = null; }
      }
      if (!this.aktif) {
        for (const m of [this.muzikA, this.muzikB]) {
          if (m !== this._eski && !m.paused) { m.volume = Math.max(0, m.volume - hiz); if (m.volume <= 0.001) m.pause(); }
        }
      }
    }

    // Tarayıcı ilk tıklamada sesi açar
    _kilitDinle() {
      const ac = () => {
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        if (this.kilitli) {
          this.kilitli = false;
          if (this.aktif) this._oynat(this.aktif);
        }
      };
      window.addEventListener("pointerdown", ac);
      window.addEventListener("keydown", ac);
    }
  }

  window.Ses = Ses;
})();
