# CineBG Studio

Sinematik film sahneleri için sınırsız arka plan üreticisi. 309 grupta **117.060 kategori** (11.706 temel mekân ve her birinin 9 varyantı), 63 sahne motoru, 690 kamera açısı ve 30 video stili: savaş alanları (antik, dünya savaşları, gelecek, deniz ve hava), kaleler, post-apokaliptik ve zombi dünyaları, Antik Mısır, Roma ve Yunan, Viking, korsanlar, steampunk, dieselpunk, solarpunk, yabancı gezegenler, mağaralar, uzay, iç mekanlar, Anadolu ve Osmanlı, Latin Amerika, Güney Asya, film stüdyoları, günümüz şehir, iş ve ev mekanları, yaratıcı reklam ve ürün arka planları, mikro dünyalar, soyut motion grafik, 50 şehir ve kasabadan sokaklar, 40 bölgeden manzaralar, ev içleri ve gündelik hayat mekânları ve daha fazlası. Her üretim seed'e bağlı olarak saat, hava, mevsim, durum, kamera, ışık tarifi, palet ve renk grade'i seçer. Sabit kombinasyonlar 450 katrilyonu aşar, seed sayısı ise sınırsızdır.

Her sahne iki çıktı verir:

1. **Prosedürel arka plan plakası.** WebGL2 ile tarayıcıda anında çizilir, 8K'ya kadar PNG, JPEG veya WebP olarak indirilir. Kusursuz döngülü video (MP4/WebM) de kaydedilebilir. Ücretsizdir, sınırı yoktur, internet gerektirmez.
2. **Foto-gerçekçi AI promptları.** Yüklü skill kurallarına göre yazılır:
   - **Higgsfield Soul Cinema:** Lira mekan şablonu. Kamera çapası, 60/30/10 palet ve teknik blok içerir, dili tamamen olumludur. Oran prompta yazılmaz, arayüzden seçilir.
   - **GPT Image 2 / Seedream / Nano Banana Pro:** ONE SHOT W1 lokasyon plakası. Dört sabit yer işareti (merkez, sol, sağ, uzak) ve karanlık okunur zemin içerir. Mekan boştur, gerekirse tek bir imkansız unsur eklenir, en sonda AVOID satırı yer alır.
   - **Ters açı (ONE SHOT W2)** ve **lokasyon referans sayfası (W3)**: aynı mekanı farklı açılardan tutarlı üretmek için.
   - **Midjourney v7:** `--ar`, `--style raw` ve `--no` parametreleriyle gelir.
   - **Seedance 2.0 / Kling / Higgsfield Video:** 10 saniyelik hareketli arka plan plakası.
   - **Negatif liste:** Stable Diffusion ve Flux için.

## Çalıştırma

Kurulum gerekmez. `cinebg/index.html` dosyasını Chrome, Edge veya Safari ile aç.
GitHub Pages ile yayınlamak için: depo ayarları → Pages → `main` dalı. Ardından `https://<kullanıcı>.github.io/sercan/cinebg/` adresini aç.

## v7: Motorlar, kamera sistemi, video stilleri ve 100 yeni kategori başlığı

| | v6 | v7 |
| --- | --- | --- |
| Kategori başlığı (grup) | 209 | 309 |
| Kategori | 87.060 | 117.060 |
| Sahne motoru | 39 | 63 |
| Motor görünümü (ön ayar) | — | 630 (her motora 10) |
| Kamera açısı | 60 | 690 |
| Video stili | — | 30 |

**100 yeni başlık, her birinde 30 mekân:**
- *Dünya kültürleri:* Kasbahlar, Pers mimarisi, İpek Yolu, Kafkasya, Balkanlar, Polinezya, Himalaya, And dağları, Körfez şehirleri, Svahili kıyısı, Ege…
- *Meslek ve mekân:* hastaneler, okul ve kampüs, ofisler, restoran mutfakları, oteller, havalimanları, limanlar, atölyeler, müzeler, kütüphaneler, metro, lunapark, düğün salonları, itfaiye…
- *Sinema türleri:* casusluk üsleri, soygun mekânları, synthwave, Y2K, vaporwave, liminal mekânlar, samuray, wuxia, neo-noir, mecha hangarları, hava gemileri, Atlantis, rüyalar…
- *Doğa ve atmosfer:* şelaleler, dağ gölleri, çiçek tarlaları, kış masalı, fırtına kovalama, yıldız gözlemi, mercan resifleri, tuz düzlükleri, mantar ormanları, tutulma ve kuyruklu yıldız, pencereden manzaralar…

**24 yeni motor:** şelale, buzul, mercan resifi, mantar ormanı, bambu, kumtaşı kemer, tuz düzlüğü, havadan desen; kütüphane, liminal koridor, boş havuz, gece pazarı, çatılar, liman, istasyon, stadyum; vaporwave, Y2K, uçan adalar, Atlantis, mecha hangarı, rüya, wuxia mürekkep resmi, tutulma/kuyruklu yıldız.

**Motor görünümleri:** her motorun 10 adlandırılmış görünümü var (kompozisyon, yoğunluk, ölçek, ışık). Üretim seed'e göre birini seçip hafifçe oynatır; aynı motor her seferinde farklı bir sahne kurar. Kilitlerden "Motor görünümü" sabitlenebilir, Set üret → "Motor görünümleri" hepsini yan yana gösterir.

**Kamera sistemi:** elle yazılmış 60 açıya ek olarak 7 yükseklik (yer, diz, göz, yüksek, vinç, drone, uydu) × 5 yön (önden, sol 3/4, sağ 3/4, yan profil, ters açı) × 6 lens (14–200 mm) × 3 eğim = 630 açı. 3B motorlarda yön yörüngeyi, yükseklik kamerayı sürer. Set üret → "Kamera sistemi" yükseklik × yön ızgarasını üretir.

**Video stilleri (30):** sinematik anamorfik, film fragmanı, vlog, belgesel, doğa belgeseli, müzik videosu, reklam filmi, drone, aksiyon kamerası, telefon (dikey), güvenlik kamerası, VHS, Super 8, 16 mm, found footage, gece görüşü, termal kamera, anime, suluboya animasyon, retro piksel oyun, çizgi roman, kara film, tilt-shift minyatür, Polaroid, Y2K dijital kamera, lo-fi, haber B-roll, zaman atlamalı, ağır çekim. Her stil:
- görüntüye efekt uygular (balıkgözü, pikselleştirme, posterize, tarama çizgisi, gece görüşü, termal renk haritası, tilt-shift bulanıklık, VHS renk kayması ve satır dalgalanması, yarım ton, tek renk, keskinlik),
- grade'in üzerine kendi renk değerlerini yazar,
- gerekirse ekran arayüzü çizer (REC ve zaman kodu, güvenlik kamerası saati, VHS tarih damgası, termal ölçek, Polaroid çerçevesi) — önizlemede, PNG'de ve videoda,
- kendi kamera açılarını tercih eder, oranı önerir (fragman 2.39, telefon 9:16, VHS 4:3, Polaroid 1:1), videoda elde titreme ve hız (zaman atlamalı, ağır çekim) ekler,
- bütün promptların başına stil satırını yazar.

Üst çubuktaki 🎬 menüsünden seçilir; "Stil seti" aynı sahneyi 30 stilde yan yana çıkarır.

## v6: Sadece arka plan, 5 kat daha fazla kategori

Karakter, Yarışma ve Yönetmen bölümleri kaldırıldı; program yalnızca arka plan stüdyosudur.

**Kategoriler: 17.150 → 87.060.**
- **Sokak (2.482 temel):** 60 sokak tipi × 50 yer (İstanbul'un semtleri, Mardin, Safranbolu, Ege ve Anadolu köyleri, Tokyo, Paris, New York, Havana, Lagos…). Köy yoluna tramvay, büyükşehre köy meydanı düşmez.
- **Manzara (927 temel):** 61 manzara tipi × 40 bölge, biyom uyumuna göre (Kapadokya'da peri bacaları, Norveç'te fiyort, Sahra'da kum tepeleri).
- **Ev içi (720 temel):** 30 oda × 24 ev tarzı (İstanbul apartmanı, Anadolu köy evi, Japon dairesi, Sovyet dairesi, 1970'ler evi…).
- **Gündelik mekânlar (1.147 temel):** 82 mekân × 16 ülke ve yerleşim türü (bakkal, fırın, kahvehane, berber, okul, hastane koridoru, otobüs içi, çocuk parkı…).
- **Varyantlar 4 → 9:** önceki dört eksene dönem (1890'lar → 2050), mevsim, hava ruhu, günün anı ve kadraj eklendi. İç mekânlar kendi dönem, mevsim ve hava eklerini alır; tropik yerlere kar eki gelmez. Sahne kodu harfi a–i olur.

**Kategori içi çeşitlilik:** her mekân ailesinin yer işareti, zemin ve malzeme havuzları 5 katına çıktı (slot başına 5 → 25). Sokak, kırsal manzara ve ev içi için üç yeni motor eklendi.

## v5: 5 kat büyüme

**Kategoriler: 3430 → 17.150.** Her temel mekâna dört eksenden birer varyant eklenir: durum / dönem (terk edilmiş, sel basmış, festival günü…), tür aktarımı (siberpunk, Osmanlı 1600'ler, kara film…), bakış / ölçek (kapı eşiğinden, uzak sırttan…) ve ışık imzası (ateş ışığı, tutulma, neon…). Reklam setlerinde bu eksenler malzeme, stil, kompozisyon ve ışık olur. Varyant kendi palet, grade, saat ve atmosfer ayarını getirir; motor seçimi temel mekâna göre yapılır. Mekâna uymayan ekler (bozkırda sodyum lambası gibi) elenir. Katalogda varyantlar temelin altında listelenir, sahne kodu `CB-0106c-…` gibi a–d harfi alır, eski kodlar aynen açılır.

**Görsel kütüphane**

| | v4 | v5 |
| --- | --- | --- |
| Kategori | 3430 | 17.150 (v6: 87.060) |
| Sahne motoru | 29 | 36 (3B arazi, 3B şehir, 3B salon, kristal mağara, kâğıt kolaj, antik harabe, arşiv editoryal) |
| Palet | 32 | 160 (128'i türetilmiş) + renk teorisiyle sınırsız rastgele palet |
| Grade / film stoğu | 16 | 40 (Portra, CineStill 800T, Technicolor, day-for-night, Tri-X, Super 8, VHS…) |
| Kamera / kadraj açısı | 26 | 60 |
| Işık tarifi | 10 | 50 |
| Görüntü yönetmeni stili | 8 | 40 |
| İmkânsız öğe | 15 | 75 |
| Saat / hava (dış) | 11 / 14 | 18 / 26 |

Set üret menüsüne **mekân varyantları** (5 kare) ve **film stokları** (40 kare) eklendi.



## v3'te neler yeni

- **26 kamera açısı:** solucan gözü, kuş bakışı, Hollanda açısı, birinci şahıs POV, yan takip, aşırı uzak plan, detay, havadan yörünge, içeriden dışarı, ters açı, yansıma seviyesi ve ürün çekimi açıları (önden, 3/4, kahraman, flat lay, makro). Her açının önizlemede bir kadraj karşılığı var.
- **Açı seti (S tuşu):** aynı sahneyi tüm açılarda üretir. Mekan, yer işaretleri ve palet sabit kalır. Saat seti ve hava seti de var. Her kare için ONE SHOT W8 "referanstan yeni açı" promptu hazırlanır (NBP / GPT Image 2). Set, kontakt sayfası olarak tek PNG'ye dökülebilir.
- **Günümüz mekanları (5 grup):** şehir hayatı, modern iş ve teknoloji mekanları, günümüz evleri, AVM ve mağazalar, spor ve modern eğlence.
- **Yaratıcı reklam arka planları (6 grup):** ürün podyumları ve stüdyo setleri, sürreal konseptler, doğal ürün sahneleri, lüks fonlar, yemek ve içecek, teknoloji ve otomotiv. Stüdyo ışık kurulumları (softbox, gobo, high-key, low-key, renkli jel) ve ticari fotoğraf teknik bloğu içerir.
- **Ürün podyumu motoru:** ışın izlemeli gerçek 3B stüdyo seti. Sonsuz fon, podyum düzenleri, kemer paneli, yumuşak gölge, pencere gobosu. Kamera açıları burada gerçek bir yörünge kamerasını sürer.
- **Referans görselden palet:** bir fotoğraf ya da film karesi yükle, 4 renk çıkarılır, görsele ve prompta (renk adlarıyla) uygulanır.
- **Hızlı MP4:** WebCodecs + [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) (MIT) ile video kare kare, gerçek zamanı beklemeden kodlanır. 4K ve 24/30/60 fps desteklenir. H.264 yoksa MP4 içinde VP9 veya AV1 kullanılır, WebCodecs yoksa gerçek zamanlı kayda geçilir.
- **Kilit düzeltmesi:** bir alanı kilitlemek artık sahnenin geri kalanını değiştirmiyor.

## v2'de neler yeni

- **3 kat kategori:** 1021'den 3071'e çıktı. Mevcut 45 grubun her birine yeni mekanlar, ayrıca 23 yeni grup eklendi.
- **9 yeni görsel motor (toplam 28):** yağmurlu cam, alev duvarı, sonsuz koridor, kanyon, mikro dünya, bulut denizi, lav ovası, sarmal galaksi, ışık küreleri. Motor, kategori metnindeki anahtar kelimeye göre seçilir (orman → orman, siper → savaş alanı, kara delik → galaksi).
- **Atmosfer katmanı:** yağmur, kar, sis, kor, kül, toz, şimşek ve ışık sızıntısı her motorun üstüne biner. Sahnenin havasından otomatik ayarlanır.
- **Kadraj ve kamera hareketi:** yakınlaştırma ve kaydırma ayarları; yaklaşma, uzaklaşma, pan, vinç ve süzülme hareketleri. Hareketler canlı önizlemede ve döngülü videoda çalışır.
- **Başlık kartı:** film adı ve alt başlık; üç yazı stili, dört konum. Görsel ve video çıktısına işlenir.
- **Proje / storyboard:** sahneleri projeye ekle, sırala, adlandır, not yaz. Proje promptları CSV, çekim listesi TXT, JSON ya da görseller ZIP olarak indirilebilir.
- **Tür filtresi:** savaş, bilimkurgu, fantastik, korku, tarihi, doğa, şehir, iç mekan, uzay, soyut.
- **Varyasyonlar:** tek tıkla aynı kategoriden 12 farklı sahne.
- **Yeni oranlar:** 16:10, telefon duvar kağıdı 19.5:9, film afişi 2:3, kapak 3:1.
- **Hazır palet seçici, favori ve proje yedekleme (JSON).**

## Özellikler

- **Katalog:** Arama yapabilirsin. Üret düğmesi üç modda çalışır: aynı kategoride yeni varyasyon, grup içinde rastgele kategori ya da tüm katalogdan rastgele.
- **Kilitler:** Saat, hava, kamera, palet, grade ve imkansız unsuru sabitleyebilirsin. Kilitlemediklerin her üretimde değişir.
- **Görsel ayarları:** 29 sahne motoru, her motor için 8 parametre, 8 atmosfer katmanı, 4 renkli palet ve 16 grade preset'i var. Pozlama, kontrast, bloom, anamorfik flare, halation, kromatik sapma, vinyet ve film greni ayarlanabilir. Letterbox (1.85 / 2.39 / 2.76) ve kılavuz çizgileri de bulunur.
- **En-boy oranları:** 16:9, 2.39:1, 21:9, 1.85:1, 9:16, 4:5, 1:1, 3:2, 4:3, 32:9, 16:10, 19.5:9, 2:3 ve 3:1. Çözünürlük 720p ile 8K arasında seçilebilir.
- **Toplu üretim:** 12 ile 500 arasında sahneyi tek tıkla üretir. Görselleri ZIP olarak, promptları CSV, JSON veya TXT olarak indirebilirsin.
- **Sonsuz akış:** Her 4 saniyede otomatik olarak yeni sahne üretir.
- **Geçmiş, favoriler ve sahne kodu:** Örneğin `CB-0201-ABC123` kodu her zaman aynı sahneyi açar.

## Kısayollar

| Tuş | İşlev |
| --- | --- |
| Space / G | Yeni sahne |
| ← → | Geçmişte gezin |
| F | Favori |
| A | Canlı önizleme |
| D | Görseli indir |
| P | Sahneyi projeye ekle |
| V | Bu kategoriden 12 varyasyon |
| S | Açı seti |
| C | Soul Cinema promptunu kopyala |

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `js/glsl.js` | Ortak shader kütüphanesi, ilk 29 sahne motoru, atmosfer katmanı, kamera dönüşümü, film son işlem geçişi (bloom, flare, ACES, grade, gren) |
| `js/renderer.js` | WebGL2 render hattı: HDR doku, mipmap bloom, kusursuz döngü için çapraz geçiş |
| `js/categories.js` | İlk 45 grup, tür etiketleri, arketip yer işareti ve malzeme havuzları, grup kayıt sistemi |
| `js/cat-extra-a.js`, `js/cat-extra-b.js` | Mevcut gruplara eklenen mekanlar |
| `js/cat-new-a.js`, `js/cat-new-b.js` | v2'de eklenen 23 grup |
| `js/cat-v3.js` | Günümüz mekanları ve reklam arka planları (11 grup) |
| `vendor/mp4-muxer.js` | MP4 kapsayıcı (MIT lisansı `vendor/mp4-muxer.LICENSE`) |
| `js/looks.js` | Paletler, grade'ler, en-boy oranları, saat, hava, kamera ve ışık sözlükleri |
| `js/spec.js` | Seed'li sahne spesifikasyonu ve prompt motoru |
| `js/app.js` | Arayüz, dışa aktarma, video, toplu üretim |
| `js/glsl-v5.js`, `js/engines-v5.js` | v5'in 7 motoru ve anahtar kelime / grup bağlantıları |
| `js/cat-variants.js` | Her mekâna 9 varyant (87.060 kategori) |
| `js/cat-v6.js` | Sokak, manzara, ev içi ve gündelik mekân aileleri |
| `js/arch-v6.js` | 5 kat büyütülmüş yer işareti, zemin ve malzeme havuzları |
| `js/glsl-v6.js`, `js/engines-v6.js` | Sokak, kırsal ve ev içi motorları ve bağlantıları |
| `js/looks-v5.js` | Türetilmiş paletler, film stokları, ek kamera, ışık, saat ve hava listeleri |
| `js/v7-core.js` | v7 türleri ve motor görünümü kaydı |
| `js/cat-v7-a.js` … `js/cat-v7-d.js` | 100 yeni kategori başlığı (dünya, meslek, sinema türleri, doğa) |
| `js/glsl-v7-a.js` … `js/glsl-v7-c.js`, `js/engines-v7-a.js` … `c.js` | 24 yeni motor, bağlantıları ve 10'ar görünümleri |
| `js/presets-v7.js` | Önceki 39 motorun 10'ar görünümü |
| `js/cameras-v7.js` | 630 açılık kamera sistemi |
| `js/video-styles.js` | 30 video stili, ekran arayüzü katmanları ve prompt satırları |
