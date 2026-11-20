// TEST PANELİ — sadece adresin sonuna ?test=1 eklenince görünür.
(function () {
  const ADLAR = ["Ayşe", "Mehmet", "Zeynep", "Ali", "Elif", "Can", "Deniz", "Ece", "Burak", "Selin", "Emre", "Merve", "Kerem", "Yusuf", "Defne",
    "Arda", "Nehir", "Mert", "İrem", "Oğuz", "Şule", "Göktuğ", "Çağla", "Barış", "Ilgaz", "Kemal", "Işık", "Tuna", "Ada", "Efe"];

  class TestPaneli {
    constructor(derbi) {
      this.d = derbi;
      this.stresAcik = false;
      this.kur();
      setInterval(() => this.durumGuncelle(), 500);
      setInterval(() => this.stresAdim(), 100);
    }

    rastgeleKisi(n) {
      const i = (Math.random() * (n || 400)) | 0;
      return { id: "test" + i, ad: ADLAR[i % ADLAR.length] + (i >= ADLAR.length ? i : "") };
    }
    // Tercihen yarışan birini seç (beğeni/hediye etkisini görmek için)
    yarisanVeyaRastgele() {
      const o = this.d.oyun;
      const dolu = o.kulvarlar.filter((k) => k.oyuncu);
      if (dolu.length && Math.random() < 0.8) {
        const k = dolu[(Math.random() * dolu.length) | 0];
        return { id: k.oyuncu.id, ad: k.oyuncu.ad };
      }
      return this.rastgeleKisi();
    }
    gonder(o) { this.d.oyun.girdi(o); }

    yorum() {
      const A = this.d.oyun.A;
      const i = (Math.random() * A.hayvanlar.length) | 0;
      const metin = Math.random() < 0.5 ? String(i + 1) : A.hayvanlar[i].ad;
      this.gonder({ tip: "yorum", kullanici: this.rastgeleKisi(), metin });
    }

    kur() {
      const p = document.createElement("div");
      p.id = "testPaneli";
      p.innerHTML = `
        <h3>🧪 TEST PANELİ</h3>
        <div id="tpDurum" class="durum"><span class="isik"></span><span class="yazi">TikFinity: ?</span></div>
        <div id="tpYayin" class="kucuk"></div>
        <div id="tpUyari" style="display:none;background:#c0182b;color:#fff;font-weight:800;padding:8px;border-radius:8px;margin-top:6px"></div>
        <div class="kucuk" id="tpFps"></div>
        <b>Ücretsiz eylemler</b>
        <div class="satir">
          <button data-k="yorum">💬 Sahte yorum</button>
          <button data-k="yorum8">💬 x8</button>
          <button data-k="begeni">❤️ Beğeni</button>
          <button data-k="begeni50">❤️ x50</button>
          <button data-k="takip">➕ Takip</button>
          <button data-k="paylasim">🔁 Paylaşım</button>
        </div>
        <b>Hediyeler (jeton)</b>
        <div class="satir">
          <button data-h="1">1</button><button data-h="5">5</button><button data-h="10">10</button>
          <button data-h="30">30</button><button data-h="100">100</button><button data-h="500">500</button>
        </div>
        <div class="satir"><button data-k="seri">🌹 TikFinity seri hediye (Gül x7)</button></div>
        <b>Yeni özellikler</b>
        <div class="satir">
          <button data-k="tahmin">🔮 10 sahte tahmin</button>
          <button data-k="altinHavuc">✨ Altın havuç</button>
          <button data-k="ruzgar">🌬️ Rüzgar</button>
          <button data-k="saman">🌾 Saman</button>
        </div>
        <div class="satir">
          <button data-k="derbi">🏆 Sonraki tur Büyük Derbi</button>
          <button data-k="efsaneKutlama">🎆 Efsane kutlama dene</button>
          <button data-k="spikerDene">🎙️ Spiker dene</button>
        </div>
        <b>Stres / kontrol</b>
        <div class="satir">
          <button data-k="stres" id="tpStres">👥 200 sahte izleyici: KAPALI</button>
        </div>
        <div class="satir">
          <button data-k="kopar">🔌 Bağlantıyı kopar</button>
          <button data-k="atla">⏭ Sonraki faz</button>
        </div>
        <div class="satir">
          Hız: <button data-z="1">x1</button><button data-z="5">x5</button><button data-z="20">x20</button>
        </div>
        <div class="satir">
          <button data-k="sifirla">🧹 "Bu gece"yi sıfırla</button>
          <button data-k="sifirlaHepsi">🧹 Tüm skorları sıfırla</button>
        </div>
        <div class="kucuk">Bu panel ve bağlantı ışığı yayında görünmez (adreste ?test=1 yoksa).</div>`;
      document.body.appendChild(p);
      p.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.h) {
          // Gerçek TikFinity hediye olayı gibi (ad + birim jeton). Bilinen tek gerçek ad: Gül (1 jeton)
          const j = Number(b.dataset.h);
          const ad = { 1: "Gül", 100: "Elle Kalp" }[j] || "Test hediyesi " + j;
          this.gonder({ tip: "hediye", kullanici: this.yarisanVeyaRastgele(), jeton: j, hediyeAdi: ad, birimJeton: j });
        } else if (b.dataset.z) {
          this.d.zamanCarpani = Number(b.dataset.z);
        } else {
          this.komut(b.dataset.k);
        }
      });
    }

    komut(k) {
      const o = this.d.oyun;
      switch (k) {
        case "yorum": this.yorum(); break;
        case "yorum8": for (let i = 0; i < 8; i++) this.yorum(); break;
        case "begeni": this.gonder({ tip: "begeni", kullanici: this.yarisanVeyaRastgele(), sayi: 5 }); break;
        case "begeni50": for (let i = 0; i < 10; i++) this.gonder({ tip: "begeni", kullanici: this.yarisanVeyaRastgele(), sayi: 15 }); break;
        case "takip": this.gonder({ tip: "takip", kullanici: this.yarisanVeyaRastgele() }); break;
        case "paylasim": this.gonder({ tip: "paylasim", kullanici: this.yarisanVeyaRastgele() }); break;
        case "seri": this.seriHediye(); break;
        case "stres":
          this.stresAcik = !this.stresAcik;
          document.getElementById("tpStres").textContent = "👥 200 sahte izleyici: " + (this.stresAcik ? "AÇIK" : "KAPALI");
          break;
        case "kopar": this.d.baglanti.kopar(); break;
        case "tahmin":
          for (let i = 0; i < 10; i++) {
            const n = 1 + ((Math.random() * this.d.oyun.A.hayvanlar.length) | 0);
            this.gonder({ tip: "yorum", kullanici: this.rastgeleKisi(), metin: "tahmin " + n });
          }
          break;
        case "altinHavuc": case "ruzgar": case "saman": o.yarisOlayi(k); break;
        case "derbi": o.sonrakiDerbi = true; break;
        case "efsaneKutlama": o.testKutlama = "efsane"; break;
        case "spikerDene": this.d.spiker.soyle(["lider_tavuk", "son_duzluk", "kil_payi", "efsane"][(Math.random() * 4) | 0], { tekrar: 0 }); break;
        case "atla": o.fazZaman = 9999; if (o.yaristaMi()) o.kulvarlar.forEach((x) => (x.pos = Math.max(x.pos, o.PIST - 3 - Math.random() * 3))); break;
        case "sifirla": o.skorlariSifirla(false); break;
        case "sifirlaHepsi": o.skorlariSifirla(true); break;
        default: break;
      }
    }

    // TikFinity'nin göndereceği biçimde ham mesajlar: seri hediye ayrıştırıcısını dener.
    seriHediye() {
      const kisi = this.yarisanVeyaRastgele();
      const temel = { userId: kisi.id, uniqueId: kisi.id, nickname: kisi.ad, giftId: 5655, giftName: "Rose", diamondCount: 1, giftType: 1 };
      for (let n = 1; n <= 7; n++) {
        setTimeout(() => {
          this.d.baglanti._isle({ event: "gift", data: Object.assign({}, temel, { repeatCount: n, repeatEnd: false, msgId: "s" + Date.now() + n }) });
          if (n === 7) setTimeout(() => this.d.baglanti._isle({ event: "gift", data: Object.assign({}, temel, { repeatCount: 7, repeatEnd: true }) }), 300);
        }, n * 150);
      }
    }

    // 200 sahte izleyici: her 0.1 sn'de bir rastgele eylemler
    stresAdim() {
      if (!this.stresAcik) return;
      const o = this.d.oyun;
      for (let i = 0; i < 4; i++) {
        const kisi = this.rastgeleKisi(200);
        const r = Math.random();
        if (r < 0.05) {
          this.gonder({ tip: "yorum", kullanici: kisi, metin: "tahmin " + (1 + ((Math.random() * 8) | 0)) });
        } else if (r < 0.35) {
          const A = o.A;
          const j = (Math.random() * A.hayvanlar.length) | 0;
          this.gonder({ tip: "yorum", kullanici: kisi, metin: Math.random() < 0.3 ? "selam herkese" : (Math.random() < 0.5 ? String(j + 1) : A.hayvanlar[j].ad) });
        } else if (r < 0.9) {
          this.gonder({ tip: "begeni", kullanici: Math.random() < 0.5 ? this.yarisanVeyaRastgele() : kisi, sayi: 1 + ((Math.random() * 10) | 0) });
        } else if (r < 0.905) {
          this.gonder({ tip: "hediye", kullanici: this.yarisanVeyaRastgele(), jeton: [1, 1, 1, 5, 10, 30, 100][(Math.random() * 7) | 0] });
        } else if (r < 0.91) {
          this.gonder({ tip: Math.random() < 0.5 ? "takip" : "paylasim", kullanici: kisi });
        }
      }
    }

    durumGuncelle() {
      const b = this.d.baglanti;
      const el = document.getElementById("tpDurum");
      el.className = "durum " + b.durum;
      const ad = { bagli: "BAĞLI", baglaniyor: "bağlanıyor…", kapali: "BAĞLI DEĞİL" }[b.durum];
      el.querySelector(".yazi").textContent = "TikFinity: " + ad + " (mesaj: " + b.sayac.mesaj + ", kopma: " + b.sayac.kopma + ")";
      // Yayın durumu ve "TikFinity yayını görmüyor" uyarısı (sadece bu panelde, izleyici görmez)
      const o = this.d.oyun;
      document.getElementById("tpYayin").textContent = o.canli === true ? o.M.yayinBaglandi : o.canli === false ? o.M.yayinKapali : "Yayın durumu: bilinmiyor (TikFinity bildirince güncellenir)";
      const sn = this.d.oyun.A.olaySessizlikUyariSn || 60;
      const gecen = b.sonIzleyiciOlayi ? (Date.now() - b.sonIzleyiciOlayi) / 1000 : (b.durum === "bagli" ? (Date.now() - (this._bagliBas || (this._bagliBas = Date.now()))) / 1000 : 0);
      const uyari = document.getElementById("tpUyari");
      if (b.durum === "bagli" && o.canli !== false && gecen > sn) {
        uyari.style.display = "block";
        uyari.textContent = o.M.tikfinitySessiz.replace("{sn}", Math.round(gecen));
      } else uyari.style.display = "none";
      if (b.durum !== "bagli") this._bagliBas = 0;
      const app = this.d.app;
      const mem = performance.memory ? " • bellek " + Math.round(performance.memory.usedJSHeapSize / 1048576) + " MB" : "";
      document.getElementById("tpFps").textContent = "FPS " + Math.round(app.ticker.FPS) + " • faz " + this.d.oyun.faz + " • tur " + this.d.oyun.turNo + " • hız x" + this.d.zamanCarpani + mem;
    }
  }

  window.TestPaneli = TestPaneli;
})();
