# Kral ve Muhafız — Uygulama Planı (tamamen yerel, kod tabanlı)

Instagram Reels için 1080×1920, 9:16, 30 fps kısa animasyon film.
Adı verilmeyen, kurmaca bir kuzey krallığında geçer. Gerçek bir olay ya da hükümdar kaydı olarak sunulmaz.

> Üretimde hiçbir haricî görsel, video ya da ses üretim servisi kullanılmaz. Bütün çizim, animasyon,
> efekt, ses tasarımı ve render bu klasördeki kodla yerelde yapılır.

## 1. Teknik yöntem

| Katman | Araç | Dosya |
|---|---|---|
| Çizim + animasyon | HTML5 Canvas 2D (vektör yollar, gradyanlar, prosedürel dokular) | `src/*.js` |
| Ortak zaman çizelgesi | `src/timeline.js` (planlar, anlatım/altyazı satırları, ses efektleri, müzik) | JS + Python ortak okur |
| Önizleme | `index.html` (tarayıcıda oynat, durdur, sar) | yerel |
| Kare render | Playwright + Chromium (headless) → JPEG kareler → ffmpeg (libx264) | `tools/render.mjs` |
| Ses tasarımı | NumPy ile sentez: rüzgâr, kar üstünde adım, kapı gıcırtısı, şömine, kömür sürtünmesi, düşük müzik | `tools/audio.py` |
| Altyazı | zaman çizelgesinden SRT + videoya gömülü | `tools/srt.mjs` |

Her kare yalnızca `t = kare / 30` zamanından hesaplanır (deterministik). Kar, nefes, meşale ve titreme
gürültü fonksiyonları zamana bağlıdır. Önizleme ile render birebir aynı çıkar.

## 2. Karakter sistemi

- `src/rig.js`: iskelet (kalça kökü, gövde eğimi, boyun ve baş, iki kol: üst kol/ön kol/el,
  iki bacak: uyluk/baldır/ayak). İleri kinematik ve iki kemikli IK kullanılır. Eller hedefe kilitlenir
  (mızrak, belge, kömür, duvar). Ayaklar zemine kilitlenir; yürüyüşte basma fazında ayağın dünya konumu sabit kalır,
  bu da kaymayı önler.
- `src/head.js`: sözde 3B baş (dönüş açısına göre yüz hatlarının izdüşümü). Göz kapağı, bakış, kaş (iç uç kalkışı,
  çatılma), gülümseme, ağız, sakal, saç, kulak ve kırışıklıklar ayrı ayrı kontrol edilir.
- `src/figure.js`: kıyafet katmanları (pelerin arka ve ön parçaları, tunik eteği, kemer, eldiven, bot, kürk yaka, taç),
  rüzgârla dalgalanan pelerin kenarı ve üzerinde biriken kar/kırağı.

## 3. Mekân sistemi (sabit geometri, dünya birimi = metre)

Kapı ekseni x=0, zemin y=0.
- Kemerli çift kanatlı meşe kapı: x −1.0…+1.0, kemer tepesi y=3.1, siyah demir menteşeler ve halka.
- Meşale: x −1.85, y 2.05 (kapı ile girinti arasında, yazının üstünde).
- Sığ duvar girintisi: x −3.3…−2.4, yükseklik 2.25 (muhafızın nöbet yeri).
- Duvar yazısı alanı: x −2.3…−1.4, y 0.35…1.1.
- Rüzgâr ve kar soldan sağa eser; pelerin aynı yöne savrulur.

Taş örgüsü dünya koordinatından tohumlanır. Geniş planda ve yakın planda aynı taşlar görünür.

## 4. Sahne akışı (geçici zamanlama: doğal okuma + duraklamalar)

| Plan | Zaman | İçerik |
|---|---|---|
| 1a | 0.0–3.2 | YAKIN: mızrağı kavrayan titrek eldiven, yırtık kenar, kar, nefes buharı |
| 1b | 3.2–7.0 | ORTA: girintinin önünde yalnız nöbet. Meşale ve kapı görünür |
| 2 | 7.0–17.2 | ORTA-GENİŞ: kapı açılır, amber ışık karın üstüne düşer, kral çıkar; muhafız sırtını dikleştirir. “Üşüyor musun?” / “Alışığım kralım.” |
| 3a | 17.2–23.0 | ORTA-YAKIN ikili: kral elini kısaca omzuna koyar, sözü verir |
| 3b | 23.0–27.0 | YAKIN yüz: bakış değişir, omuzlar gevşer, belli belirsiz tebessüm |
| 4a | 27.0–29.6 | ORTA: kral döner ve kapıdan içeri girer |
| 4b | 29.6–34.4 | İÇ: sıcak koridor ve şömine. Kâtip belge uzatır, kral okuyarak yürür |
| 4c | 34.4–37.0 | DIŞ: kapı kapanır, ışık şeridi muhafızın üstünden çekilir |
| 5a | 37.0–41.6 | Umutla kapıya bakış, bir seste başını çevirir |
| 5b | 41.6–46.0 | Ayaklarını oynatır, ellerine üfler ve ovuşturur |
| 5c | 46.0–50.0 | Girintiye yaslanır, meşale kısılmış, kar birikmiş |
| 6a | 50.0–52.6 | Güçlükle diz çöker, yerden kömür parçası alır |
| 6b | 52.6–56.0 | YAKIN: el duvara yazar (cümle okunmaz) |
| 7 | 56.0–62.4 | SABAH: iki nöbetçi gelir; biri diz çöker, diğeri yazıyı fark eder |
| 8 | 62.4–son | YAKIN: kömür yazısı okunur. Son cümleden sonra ~2 sn tutulur |

Kral hiçbir planda elbise emri verirken gösterilmez. Ölüm kan, yara ya da korku estetiği olmadan;
kırağı tutmuş, hareketsiz bir beden ve diz çöken nöbetçinin tepkisiyle anlatılır.

## 5. Ses

Yerelde Türkçe TTS aracı bulunmadığı için anlatıcı kaydı üretilmedi. Anlatım metni ve satır zamanlamaları
`out/dis_ses_metni_ve_zamanlama.md` dosyasında ayrıca teslim edilir. Bir kayıt `audio/vo.wav` adıyla eklenirse
`tools/audio.py` onu miksajına alır ve müziği anlatım altında kısar.
