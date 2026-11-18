// =====================================================================
//  ÇILGIN ÇİFTLİK DERBİSİ — AYARLAR
//  Bu dosyayı Not Defteri ile açıp değiştirebilirsin.
//  Değiştirdikten sonra kaydet ve oyun sayfasını yenile (F5).
//  Kural: Sadece  =  ya da  :  işaretinin SAĞINDAKİ değerleri değiştir.
//  Yazıları "tırnak içinde" bırak, sayılara tırnak koyma.
// =====================================================================

window.AYARLAR = {

  // ---------------- GENEL ----------------
  oyunAdi: "Çılgın Çiftlik Derbisi",

  // Ekran yazılarının dili: "tr" (Türkçe) ya da "en" (İngilizce)
  dil: "tr",

  // ---------------- SÜRELER (saniye) ----------------
  sure: {
    lobi: 45,          // izleyicilerin yorumla katıldığı bekleme süresi
    start: 5,          // 3-2-1 başlangıç
    yarisHedef: 75,    // yarışın yaklaşık süresi (60-90 arası iyi olur)
    yarisEnFazla: 95,  // yarış bu süreyi geçerse oyun hayvanları bitişe doğru hızlandırır
    fotoFinis: 5,      // ağır çekim bitiş
    kursu: 15          // kazanan kutlaması
  },

  // ---------------- HAYVANLAR ----------------
  // klasor: assets/hayvan/ içindeki klasör adı (değiştirme)
  // ad / adEn: ekranda görünen ad
  // emoji: görsel yoksa kullanılan geçici şekil
  // hiz: temel hız çarpanı (1 = normal). Farkları küçük tut ki herkes kazanabilsin.
  // takmaAdlar: yorumda bu kelimeler geçerse bu hayvan seçilir
  hayvanlar: [
    { klasor: "tavuk",      ad: "Tavuk",      adEn: "Chicken",  emoji: "🐔", renk: 0xffe08a, hiz: 1.02, takmaAdlar: ["tavuk", "tavugu", "chicken", "🐔", "🐓"] },
    { klasor: "kaplumbaga", ad: "Kaplumbağa", adEn: "Turtle",   emoji: "🐢", renk: 0x9be27a, hiz: 0.97, takmaAdlar: ["kaplumbaga", "kaplumba", "turtle", "🐢"] },
    { klasor: "keci",       ad: "Keçi",       adEn: "Goat",     emoji: "🐐", renk: 0xd9c3a5, hiz: 1.01, takmaAdlar: ["keci", "goat", "🐐"] },
    { klasor: "ordek",      ad: "Ördek",      adEn: "Duck",     emoji: "🦆", renk: 0x8fd3ff, hiz: 1.00, takmaAdlar: ["ordek", "duck", "🦆"] },
    { klasor: "domuz",      ad: "Domuz",      adEn: "Pig",      emoji: "🐷", renk: 0xffb3c7, hiz: 0.99, takmaAdlar: ["domuz", "pig", "🐷", "🐖"] },
    { klasor: "inek",       ad: "İnek",       adEn: "Cow",      emoji: "🐮", renk: 0xf2f2f2, hiz: 0.98, takmaAdlar: ["inek", "cow", "🐮", "🐄"] },
    { klasor: "esek",       ad: "Eşek",       adEn: "Donkey",   emoji: "🫏", renk: 0xc0b3a8, hiz: 1.00, takmaAdlar: ["esek", "donkey", "🫏"] },
    { klasor: "kirpi",      ad: "Kirpi",      adEn: "Hedgehog", emoji: "🦔", renk: 0xd8a36b, hiz: 1.01, takmaAdlar: ["kirpi", "hedgehog", "🦔"] }
  ],

  // ---------------- İSİMLER ----------------
  isimUzunlugu: 14,          // ekranda en fazla kaç harf görünsün
  // Küfür filtresi: bu kelimeleri içeren isimler "Çiftçi1234" gibi bir isme çevrilir,
  // yorumlarda geçerse yorum yok sayılır. Küçük harfle, Türkçe karakter olmadan yaz.
  kufurListesi: [
    "amk", "aq", "orospu", "pic", "sik", "yarak", "yarrak", "got", "gavat", "kahpe",
    "ibne", "pezevenk", "salak", "aptal", "gerizekali", "siktir", "mal", "oc", "amina",
    "fuck", "shit", "bitch", "dick", "nigger", "nigga", "whore", "slut", "cunt"
  ],

  // ---------------- YARIŞ FİZİĞİ ----------------
  yaris: {
    rastgelelik: 0.10,       // hızdaki dalgalanma (0.10 = ±%10)
    yetismeDestegi: 0.10,    // en gerideki hayvana verilen en fazla destek (0.10 = +%10)
    takilmaSikligi: 0.025,   // her hayvan için saniyede kendiliğinden kayma ihtimali
    takilmaSuresi: 1.2,      // kendiliğinden kaymanın süresi (sn)
    enFazlaHizCarpani: 2.2,  // efektler üst üste binse bile hız en fazla bu kadar katlanır
    // Bir hayvanın tek yarışta efektlerden kazanabileceği en fazla mesafe (pistin yüzdesi).
    // Böylece hediyeler yarışı tek başına belirleyemez.
    efektSiniriYuzde: 22
  },

  // ---------------- ÜCRETSİZ EYLEMLER ----------------
  ucretsiz: {
    begeniItmesi: 0.05,      // her beğeni için ileri itme (pistin yüzdesi)
    begeniKisiSiniri: 0.6,   // bir kişinin saniyede beğeniyle alabileceği en fazla itme (pistin yüzdesi)
    takipHizSuresi: 2.5,     // takip/paylaşım hızının süresi (sn)
    takipHizCarpani: 1.45,   // takip/paylaşım hız çarpanı
    begeniBariHedef: 1000,   // topluluk barını doldurmak için gereken toplam beğeni
    camurSuresi: 3,          // Çamur Yağmuru süresi (sn)
    camurAraligi: 30         // iki Çamur Yağmuru arasında en az kaç saniye olsun
  },

  // ---------------- HEDİYE EFEKTLERİ ----------------
  // enAz: bu efekt için gereken en az jeton (hediyenin toplam jeton değeri)
  // Liste büyükten küçüğe değil, küçükten büyüğe yazılmalı.
  hediyeEfektleri: [
    { enAz: 1,   efekt: "hiz",    ad: "Hız!",           adEn: "Speed!" },
    { enAz: 5,   efekt: "muz",    ad: "Muz Kabuğu!",    adEn: "Banana Peel!" },
    { enAz: 10,  efekt: "roket",  ad: "Roket!",         adEn: "Rocket!" },
    { enAz: 30,  efekt: "havuc",  ad: "Sihirli Havuç!", adEn: "Magic Carrot!" },
    { enAz: 100, efekt: "leylek", ad: "Dev Leylek!",    adEn: "Giant Stork!" },
    { enAz: 500, efekt: "aga",    ad: "Çiftlik Ağası!", adEn: "Farm Boss!" }
  ],
  // Efektlerin gücü (değiştirmek istersen)
  efektGucu: {
    hiz:    { carpan: 1.35, sure: 2.0 },   // küçük hız
    muz:    { sure: 1.6 },                 // öndekinin kayma süresi
    roket:  { mesafeYuzde: 4, sure: 1.3 }, // kısa uçuş
    havuc:  { carpan: 1.8, sure: 4.0 },    // süper hız
    leylek: { mesafeYuzde: 7, sure: 2.4 }  // leylek taşıma
  },
  komboSuresi: 10,     // aynı kişiden bu kadar saniye içinde gelen ikinci hediye KOMBO x2 olur
  komboCarpani: 2,

  // Hediye menüsü / hediye tablosu ekranda gösterilsin mi? (KESİNLİKLE false kalsın)
  hediyeMenusuGoster: false,

  // ---------------- PUANLAR ("Bu gece" tablosu) ----------------
  puan: { birinci: 100, ikinci: 60, ucuncu: 40, katilim: 10 },

  // ---------------- TİKFİNİTY BAĞLANTISI ----------------
  tikfinity: {
    adres: "ws://localhost:21213/",  // TikFinity > Ayarlar > API bölümündeki adresle aynı olmalı
    yenidenBaglanmaSn: 3             // bağlantı koparsa kaç saniyede bir yeniden denensin
  },

  // ---------------- SES ----------------
  // assets/ses/ klasörüne dosya koyarsan çalar, yoksa oyun sessiz çalışır.
  sesAcik: true,
  sesSeviyesi: 0.6
};
