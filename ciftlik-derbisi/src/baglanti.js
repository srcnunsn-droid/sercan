// TİKFİNİTY BAĞLANTISI
// TikFinity bilgisayarda çalışırken ws://localhost:21213/ adresinden canlı yayın olaylarını yollar.
// Mesaj biçimi: {"event":"chat"|"gift"|"like"|"follow"|"share"|"social", "data":{...}}
// Bağlantı koparsa birkaç saniyede bir kendiliğinden yeniden dener; oyun hiç durmaz.
(function () {
  class Baglanti {
    constructor(A, olayFn) {
      this.A = A;
      this.olayFn = olayFn;         // (oyunOlayi) => void
      this.durum = "kapali";        // "bagli" | "baglaniyor" | "kapali"
      this.ws = null;
      this.sonMesaj = 0;
      this.gorulen = new Set();     // tekrar eden mesajları ele (msgId)
      this.gorulenSira = [];
      this.seriler = new Map();     // devam eden hediye serileri
      this.sayac = { mesaj: 0, kopma: 0 };
      this.sonIzleyiciOlayi = 0;    // son yorum/beğeni/hediye zamanı (TikFinity yayını görüyor mu?)
      this.bilinmeyen = {};          // tanınmayan olay türleri (sadece sayılır)
      this._kapatildi = false;
      setInterval(() => this._seriZamanAsimi(), 1000);
    }

    baslat() {
      this._kapatildi = false;
      this._baglan();
    }

    _baglan() {
      if (this._kapatildi) return;
      this.durum = "baglaniyor";
      let ws;
      try {
        ws = new WebSocket(this.A.tikfinity.adres);
      } catch (e) {
        this._yenidenDene();
        return;
      }
      this.ws = ws;
      ws.onopen = () => { this.durum = "bagli"; console.log("TikFinity bağlandı"); };
      ws.onmessage = (m) => {
        this.sonMesaj = Date.now();
        this.sayac.mesaj++;
        let veri;
        try { veri = JSON.parse(m.data); } catch (e) { return; }
        try { this._isle(veri); } catch (e) { console.error("TikFinity mesajı işlenemedi", e, veri); }
      };
      ws.onerror = () => { /* onclose zaten gelecek */ };
      ws.onclose = () => {
        if (this.ws !== ws) return;
        this.durum = "kapali";
        this.sayac.kopma++;
        this._yenidenDene();
      };
    }

    _yenidenDene() {
      clearTimeout(this._yz);
      this._yz = setTimeout(() => this._baglan(), (this.A.tikfinity.yenidenBaglanmaSn || 3) * 1000);
    }

    // Test için: bağlantıyı bilerek kopar
    kopar() {
      if (this.ws) try { this.ws.close(); } catch (e) { /* yoksay */ }
    }

    _tekrarMi(d) {
      const id = d && (d.msgId || d.msg_id || d.messageId);
      if (!id) return false;
      const k = String(id);
      if (this.gorulen.has(k)) return true;
      this.gorulen.add(k);
      this.gorulenSira.push(k);
      if (this.gorulenSira.length > 2000) this.gorulen.delete(this.gorulenSira.shift());
      return false;
    }

    _kullanici(d) {
      const u = d.user || d;
      return {
        id: String(u.userId || u.uniqueId || d.userId || d.uniqueId || u.nickname || "anonim"),
        ad: u.nickname || u.uniqueId || d.nickname || d.uniqueId || "?"
      };
    }

    _isle(m) {
      const olay = String(m.event || m.type || "").toLowerCase();
      const d = m.data || m;
      if (!olay || !d) return;
      if (olay !== "gift" && this._tekrarMi(d)) return;
      const k = () => this._kullanici(d);
      if (["chat", "comment", "like", "gift", "follow", "share", "social", "member"].includes(olay)) this.sonIzleyiciOlayi = Date.now();
      switch (olay) {
        case "chat":
        case "comment":
          this.olayFn({ tip: "yorum", kullanici: k(), metin: d.comment || d.text || "" });
          break;
        case "like":
          this.olayFn({ tip: "begeni", kullanici: k(), sayi: Number(d.likeCount || d.count || 1) });
          break;
        case "follow":
          this.olayFn({ tip: "takip", kullanici: k() });
          break;
        case "share":
          this.olayFn({ tip: "paylasim", kullanici: k() });
          break;
        case "social": {
          const t = String(d.displayType || d.label || "").toLowerCase();
          if (t.includes("follow")) this.olayFn({ tip: "takip", kullanici: k() });
          else if (t.includes("share")) this.olayFn({ tip: "paylasim", kullanici: k() });
          break;
        }
        case "gift":
          this._hediye(d);
          break;
        case "livestatuschange": {
          // TikFinity yayının açılıp kapandığını bildirir
          const canli = d.isLive != null ? d.isLive : d.live != null ? d.live : d.status;
          this.olayFn({ tip: "yayinDurumu", canli: canli === true || canli === 1 || canli === "true" || canli === "live" });
          break;
        }
        default:
          this.bilinmeyen[olay] = (this.bilinmeyen[olay] || 0) + 1;
          break;
      }
    }

    // SERİ HEDİYE MANTIĞI
    // TikTok'ta "seri" gönderilebilen hediyeler (giftType 1) gönderim sürerken defalarca olay yollar;
    // repeatCount her seferinde artar, son olayda repeatEnd = true olur. Sadece serinin SONUNDA
    // bir kez sayarız. Son olay hiç gelmezse 8 sn sonra en son sayıyla sayarız; sonradan gelirse
    // sadece aradaki farkı ekleriz (çift sayma yok).
    _hediye(d) {
      const kul = this._kullanici(d);
      const elmas = Number(d.diamondCount || (d.gift && d.gift.diamond_count) || 1);
      const adet = Math.max(1, Number(d.repeatCount || 1));
      const seriHediyesi = Number(d.giftType) === 1;
      const ad = d.giftName || (d.gift && d.gift.name) || "";
      const resim = d.giftPictureUrl || d.giftPictureURL || (d.gift && d.gift.image && d.gift.image.url_list && d.gift.image.url_list[0]) || "";
      const anahtar = kul.id + "|" + (d.giftId || ad) + "|" + (d.groupId || "");

      if (!seriHediyesi) {
        if (this._tekrarMi(d)) return;
        this.olayFn({ tip: "hediye", kullanici: kul, jeton: elmas * adet, hediyeAdi: ad, resim, birimJeton: elmas });
        return;
      }
      let s = this.seriler.get(anahtar);
      if (!s) { s = { sayilan: 0, son: 0, zaman: Date.now(), kul, elmas, ad, resim }; this.seriler.set(anahtar, s); }
      s.son = Math.max(s.son, adet);
      s.zaman = Date.now();
      if (d.repeatEnd === true || d.repeatEnd === 1 || d.repeatEnd === "true") {
        const fark = s.son - s.sayilan;
        if (fark > 0) this.olayFn({ tip: "hediye", kullanici: kul, jeton: elmas * fark, hediyeAdi: ad, resim, birimJeton: elmas });
        this.seriler.delete(anahtar);
      }
    }

    _seriZamanAsimi() {
      const simdi = Date.now();
      for (const [anahtar, s] of this.seriler) {
        if (simdi - s.zaman > 8000) {
          const fark = s.son - s.sayilan;
          if (fark > 0) {
            this.olayFn({ tip: "hediye", kullanici: s.kul, jeton: s.elmas * fark, hediyeAdi: s.ad, resim: s.resim, birimJeton: s.elmas });
            s.sayilan = s.son;
          }
          // 60 sn daha hatırla ki geç gelen "son" mesajı çift saymasın
          if (simdi - s.zaman > 60000) this.seriler.delete(anahtar);
        }
      }
    }
  }

  window.Baglanti = Baglanti;
})();
