# CineBG Studio

Sinematik film sahneleri için sınırsız arka plan üreticisi. 45 grupta **1021 kategori** (savaş alanları, kaleler, post-apokaliptik şehirler, dağlar, çöller, mağaralar, uzay, iç mekanlar, Anadolu ve Osmanlı mekanları, mitolojik diyarlar…). Her üretim seed'e bağlı olarak saat, hava, mevsim, durum, kamera, ışık tarifi, palet ve renk grade'i seçer. Sabit kategori ve seed kombinasyonları 125 milyarı aşar, seed sayısı ise sınırsızdır.

Her sahne iki çıktı verir:

1. **Prosedürel arka plan plakası.** WebGL2 ile tarayıcıda anında çizilir, 8K'ya kadar PNG, JPEG veya WebP olarak indirilir. Kusursuz döngülü video (MP4/WebM) de kaydedilebilir. Ücretsizdir, sınırı yoktur, internet gerektirmez.
2. **Foto-gerçekçi AI promptları.** Yüklü skill kurallarına göre yazılır:
   - **Higgsfield Soul Cinema:** Lira mekan şablonu. Kamera çapası, 60/30/10 palet ve teknik blok içerir, dili tamamen olumludur. Oran prompta yazılmaz, arayüzden seçilir.
   - **GPT Image 2 / Seedream / Nano Banana Pro:** ONE SHOT W1 lokasyon plakası. Dört sabit yer işareti (merkez, sol, sağ, uzak) ve karanlık okunur zemin içerir. Mekan boştur, gerekirse tek bir imkansız unsur eklenir, en sonda AVOID satırı yer alır.
   - **Midjourney v7:** `--ar`, `--style raw` ve `--no` parametreleriyle gelir.
   - **Seedance 2.0 / Kling / Higgsfield Video:** 10 saniyelik hareketli arka plan plakası.
   - **Negatif liste:** Stable Diffusion ve Flux için.

## Çalıştırma

Kurulum gerekmez. `cinebg/index.html` dosyasını Chrome, Edge veya Safari ile aç.
GitHub Pages ile yayınlamak için: depo ayarları → Pages → `main` dalı. Ardından `https://<kullanıcı>.github.io/sercan/cinebg/` adresini aç.

## Özellikler

- **Katalog:** Arama yapabilirsin. Üret düğmesi üç modda çalışır: aynı kategoride yeni varyasyon, grup içinde rastgele kategori ya da tüm katalogdan rastgele.
- **Kilitler:** Saat, hava, kamera, palet, grade ve imkansız unsuru sabitleyebilirsin. Kilitlemediklerin her üretimde değişir.
- **Görsel ayarları:** 19 sahne motoru, her motor için 8 parametre, 4 renkli palet ve 16 grade preset'i var. Pozlama, kontrast, bloom, anamorfik flare, halation, kromatik sapma, vinyet ve film greni ayarlanabilir. Letterbox (1.85 / 2.39 / 2.76) ve kılavuz çizgileri de bulunur.
- **En-boy oranları:** 16:9, 2.39:1, 21:9, 1.85:1, 9:16, 4:5, 1:1, 3:2, 4:3 ve 32:9. Çözünürlük 720p ile 8K arasında seçilebilir.
- **Toplu üretim:** 12 ile 250 arasında sahneyi tek tıkla üretir. Görselleri ZIP olarak, promptları CSV, JSON veya TXT olarak indirebilirsin.
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
| C | Soul Cinema promptunu kopyala |

## Dosyalar

| Dosya | İçerik |
| --- | --- |
| `js/glsl.js` | Ortak shader kütüphanesi, 19 sahne motoru, film son işlem geçişi (bloom, flare, ACES, grade, gren) |
| `js/renderer.js` | WebGL2 render hattı: HDR doku, mipmap bloom, kusursuz döngü için çapraz geçiş |
| `js/categories.js` | 45 grup, 1021 kategori, arketip yer işareti ve malzeme havuzları |
| `js/looks.js` | Paletler, grade'ler, en-boy oranları, saat, hava, kamera ve ışık sözlükleri |
| `js/spec.js` | Seed'li sahne spesifikasyonu ve prompt motoru |
| `js/app.js` | Arayüz, dışa aktarma, video, toplu üretim |
