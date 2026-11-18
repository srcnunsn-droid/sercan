// GÖRSEL / VİDEO / SES YÜKLEYİCİ
// Dosya yoksa oyun emoji ve basit şekillerle çalışır. Her yeni lobide eksik dosyalar
// yeniden aranır; klasöre dosya koyunca oyun kendiliğinden gerçek görsele geçer.
(function () {
  const HAYVAN_DOSYALARI = {
    kos: ["kos.webm", "kos.mp4"],
    kay: ["kay.webm", "kay.mp4"],
    kazandi: ["kazandi.webm", "kazandi.mp4"],
    karakter: ["karakter.png"]
  };
  const SESLER = ["duduk", "kazanan", "hiz", "muz", "roket", "havuc", "leylek", "camur", "aga", "geri-sayim", "katil"];

  // Saf mavi fonu silen gölgelendirici (mp4 ham klipler için; webm zaten şeffaf)
  const MAVI_SIL = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void){
      vec4 c = texture2D(uSampler, vTextureCoord);
      float rg = max(c.r, c.g);
      float mavilik = c.b - rg;
      float a = 1.0 - smoothstep(0.16, 0.36, mavilik);
      vec3 renk = vec3(c.r, c.g, min(c.b, rg + 0.06));
      gl_FragColor = vec4(renk * a, c.a * a);
    }`;

  class Varliklar {
    constructor(A) {
      this.A = A;
      this.doku = {};     // anahtar -> PIXI.Texture
      this.video = {};    // anahtar -> { el, doku, maviFon }
      this.ses = {};      // ad -> HTMLAudioElement
      this.yok = new Set();
      this.surum = 0;     // yeni dosya bulununca artar (çizim yeniden kurulur)
      this._filtre = null;
    }

    maviSilFiltresi() {
      if (!this._filtre) this._filtre = new PIXI.Filter(undefined, MAVI_SIL);
      return this._filtre;
    }

    async _varMi(url) {
      try {
        const r = await fetch(url, { method: "HEAD", cache: "no-store" });
        return r.ok;
      } catch (e) {
        return false;
      }
    }

    async _resim(anahtar, url) {
      if (this.doku[anahtar]) return true;
      if (!(await this._varMi(url))) return false;
      try {
        const t = await PIXI.Texture.fromURL(url + "?v=" + Date.now());
        this.doku[anahtar] = t;
        this.surum++;
        return true;
      } catch (e) {
        console.warn("Görsel yüklenemedi:", url, e);
        return false;
      }
    }

    _videoYukle(url) {
      return new Promise((coz) => {
        const v = document.createElement("video");
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = "auto";
        v.crossOrigin = "anonymous";
        let bitti = false;
        const son = (ok) => { if (bitti) return; bitti = true; coz(ok ? v : null); };
        v.addEventListener("loadeddata", () => son(true), { once: true });
        v.addEventListener("error", () => son(false), { once: true });
        setTimeout(() => son(v.readyState >= 2), 8000);
        v.src = url + "?v=" + Date.now();
        v.load();
      });
    }

    async _videoDene(anahtar, adaylar, klasor, dongu) {
      if (this.video[anahtar]) return true;
      for (const ad of adaylar) {
        const url = klasor + ad;
        if (!(await this._varMi(url))) continue;
        const el = await this._videoYukle(url);
        if (!el) continue;
        el.loop = dongu !== false;
        const doku = PIXI.Texture.from(el, { resourceOptions: { autoPlay: dongu !== false, updateFPS: 30 } });
        this.video[anahtar] = { el, doku, maviFon: ad.endsWith(".mp4") && /\/(kos|kay)\.mp4$/.test(url) };
        this.surum++;
        return true;
      }
      return false;
    }

    _sesDene(ad) {
      if (this.ses[ad]) return Promise.resolve(true);
      const adaylar = ["assets/ses/" + ad + ".mp3", "assets/ses/" + ad + ".ogg", "assets/ses/" + ad + ".wav"];
      return (async () => {
        for (const url of adaylar) {
          if (!(await this._varMi(url))) continue;
          const a = new Audio(url);
          a.preload = "auto";
          this.ses[ad] = a;
          return true;
        }
        return false;
      })();
    }

    // Tüm dosyaları tara (başta ve her lobide). Eksikler yeniden denenir.
    async tara() {
      const isler = [];
      isler.push(this._resim("uzak", "assets/pist/uzak.png"));
      isler.push(this._resim("zemin", "assets/pist/zemin.png"));
      isler.push(this._resim("onplan", "assets/pist/onplan.png"));
      isler.push(this._resim("lobi", "assets/ekran/lobi.png"));
      isler.push(this._resim("kursu", "assets/ekran/kursu.png"));
      isler.push(this._resim("logo", "assets/ekran/logo.png"));
      for (const e of ["muz", "roket", "havuc", "leylek", "camur"]) isler.push(this._resim("efekt_" + e, "assets/efekt/" + e + ".png"));
      isler.push(this._videoDene("start", ["start.webm", "start.mp4"], "assets/klip/", false));
      for (const h of this.A.hayvanlar) {
        const k = "assets/hayvan/" + h.klasor + "/";
        isler.push(this._resim(h.klasor + "_karakter", k + "karakter.png"));
        isler.push(this._videoDene(h.klasor + "_kos", HAYVAN_DOSYALARI.kos, k, true));
        isler.push(this._videoDene(h.klasor + "_kay", HAYVAN_DOSYALARI.kay, k, true));
        isler.push(this._videoDene(h.klasor + "_kazandi", HAYVAN_DOSYALARI.kazandi, k, false));
      }
      if (this.A.sesAcik) {
        for (const s of SESLER) isler.push(this._sesDene(s));
        for (const h of this.A.hayvanlar) isler.push(this._sesDene(h.klasor));
      }
      await Promise.all(isler);
    }

    cal(ad) {
      if (!this.A.sesAcik) return;
      const a = this.ses[ad];
      if (!a) return;
      try {
        const c = a.cloneNode();
        c.volume = this.A.sesSeviyesi;
        const p = c.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) { /* ses yoksa sessiz devam */ }
    }
  }

  window.Varliklar = Varliklar;
})();
