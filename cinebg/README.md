# CineBG Studio

Sinematik film sahneleri için sınırsız arka plan üreticisi. 68 grupta **3071 kategori**: savaş alanları (antik, dünya savaşları, gelecek, deniz ve hava), kaleler, post-apokaliptik ve zombi dünyaları, Antik Mısır, Roma ve Yunan, Viking, korsanlar, steampunk, dieselpunk, solarpunk, yabancı gezegenler, mağaralar, uzay, iç mekanlar, Anadolu ve Osmanlı, Latin Amerika, Güney Asya, film stüdyoları, mikro dünyalar, soyut motion grafik ve daha fazlası. Her üretim seed'e bağlı olarak saat, hava, mevsim, durum, kamera, ışık tarifi, palet ve renk grade'i seçer. Sabit kombinasyonlar 378 milyarı aşar, seed sayısı ise sınırsızdır.

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
- **Görsel ayarları:** 28 sahne motoru, her motor için 8 parametre, 8 atmosfer katmanı, 4 renkli palet ve 16 grade preset'i var. Pozlama, kontrast, bloom, anamorfik flare, halation, kromatik sapma, vinyet ve film greni ayarlanabilir. Letterbox (1.85 / 2.39 / 2.76) ve kılavuz çizgileri de bulunur.
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
| C | Soul Cinema promptunu kopyala |

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `js/glsl.js` | Ortak shader kütüphanesi, 28 sahne motoru, atmosfer katmanı, kamera dönüşümü, film son işlem geçişi (bloom, flare, ACES, grade, gren) |
| `js/renderer.js` | WebGL2 render hattı: HDR doku, mipmap bloom, kusursuz döngü için çapraz geçiş |
| `js/categories.js` | İlk 45 grup, tür etiketleri, arketip yer işareti ve malzeme havuzları, grup kayıt sistemi |
| `js/cat-extra-a.js`, `js/cat-extra-b.js` | Mevcut gruplara eklenen mekanlar |
| `js/cat-new-a.js`, `js/cat-new-b.js` | 23 yeni grup |
| `js/looks.js` | Paletler, grade'ler, en-boy oranları, saat, hava, kamera ve ışık sözlükleri |
| `js/spec.js` | Seed'li sahne spesifikasyonu ve prompt motoru |
| `js/app.js` | Arayüz, dışa aktarma, video, toplu üretim |
