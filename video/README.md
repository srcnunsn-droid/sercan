# Dracula vs Frankenstein — 20 saniyelik dövüş videosu

- **Görseller:** Higgsfield (`gpt_image_2_5`, 2K, 16:9) ile üretildi. Promptlar ve job ID'leri `higgsfield_images.json` içinde.
  Dövüş sahneleri, karakterlerin aynı kalması için Dracula ve Canavar portreleri referans verilerek üretildi.
- **Video:** Higgsfield ile **üretilmedi**. Tamamen `make_video.py` koduyla kurgulandı:
  - Ken Burns kamera hareketleri, hamlede hareket bulanıklığı, darbelerde sarsıntı + zoom-punch + renk kayması
  - Şimşek çakmaları, beyaz flaş kesmeler, iki katmanlı yağmur, yerde sis
  - Prosedürel yarasa sürüsü (kanat çırpan siluetler, kırmızı gözler), kıvılcım parçacıkları, elektrik titremesi
  - Sinemaskop bantları, vinyet, film greni, Türkçe yazılar ve final başlığı
- **Ses:** `soundtrack.py` ile numpy'da sentezlendi — gök gürültüsü, yağmur, Bach'ın Toccata'sından org motifi,
  elektrik/hırıltı, kalp atışı, vuruşa oturan davullar, whoosh, darbe ve "braam"lar.

## Sahne akışı

| Süre | Plan |
|---|---|
| 0.0–2.6 | Fırtınada şato (Transilvanya, gece yarısı) |
| 2.6–4.4 | Kont Dracula yakın plan + org motifi |
| 4.4–6.2 | Frankenstein'ın Canavarı yakın plan + elektrik |
| 6.2–8.6 | Yıkık salonda yüzleşme, kalp atışı |
| 8.6–10.3 | Dracula'nın hamlesi (hızlanan zoom, hareket bulanıklığı) |
| 10.3–12.4 | Canavarın yumruğu — darbe, kıvılcımlar |
| 12.4–14.5 | Dracula yarasa sürüsüne dönüşür |
| 14.5–17.0 | Canavar Dracula'yı boğazından kaldırır, şimşek |
| 17.0–20.0 | Kule tepesinde son çarpışma + başlık |

## Yeniden üretme

```bash
pip install numpy pillow        # + sistemde ffmpeg
python3 video/fetch_images.py   # Higgsfield görsellerini video/images/ altına indirir
python3 video/make_video.py     # -> video/dracula_vs_frankenstein.mp4 (1920x1080, 30 fps)
python3 video/make_video.py --preview          # 960x540 hızlı önizleme
python3 video/make_video.py --stills 3,10.3    # seçili anların PNG kareleri
```
