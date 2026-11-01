# ONLINE STARTER KIT (Manifest + JSON Havuzları)

Bu paket, uygulamanın **online** çalışması için gereken JSON'ları ve bir `manifest_TEMPLATE.json` dosyasını içerir.

## 1) GitHub'da depo aç
- https://github.com → sağ üst **+** → **New repository**
- Ad ver: `mj-prompt-havuz` (örnek)
- **Public** kalsın → **Create repository**

## 2) Dosyaları yükle
- Bu klasördeki 6 dosyayı GitHub deposuna yükle:
  - `styles.json`
  - `data.json`
  - `data_extended.json`
  - `negative_bank.json`
  - `platforms.json`
  - `manifest.json` (birazdan hazırlayacaksın)

## 3) Manifest’i hazırla
- Bu paketteki `manifest_TEMPLATE.json` dosyasını bilgisayarında **Not Defteri** ile aç.
- `YOUR_USERNAME` ve `YOUR_REPO` yerlerini kendi GitHub kullanıcı adın ve repo adınla değiştir.
- Dosyayı **`manifest.json`** adıyla **kaydet**.

## 4) Manifest’i da yükle
- Düzenlediğin `manifest.json` dosyasını da aynı GitHub deposuna yükle.

## 5) Raw linki kopyala
- GitHub’da `manifest.json` dosyasına gir → **Raw** butonuna tıkla.
- Adres çubuğundaki linki kopyala. (Örn: `https://raw.githubusercontent.com/kullanici/mj-prompt-havuz/main/manifest.json`)

## 6) Uygulamada online’a geç
- Uygulamada sol panel → **Online Havuz**
- **Manifest URL** alanına bu `Raw` linki yapıştır.
- **Ayarları Kaydet** → **Şimdi Güncelle**.
- Altta “Online güncelleme: Updated” yazısını ve “Son güncelleme / Manifest sürüm” bilgisini görün.

> Notlar
- İstersen `version` alanını `2025.11.03-stable` gibi tag’li tut. Yeni veri koyduğunda versiyonu güncelle ki uygulama neyin yeni olduğunu görsün.
- Bir dosya eksikse uygulama otomatik **yereldeki** aynı dosyaya düşer.

Kolay gelsin! ✨
