# Uçtan uca (Playwright) regresyon testleri

Önce test medyası: `bash tests/e2e/make-media.sh`

| Script | Sunucu | Doğruladığı |
|---|---|---|
| `export.cjs` | `npx vite preview --port 4173` (önce `npm run build`) | Fikir → storyboard → kaba kurgu, demo, MP4 render (H.264 + ses) |
| `beat-captions.cjs` | preview 4173 | Beat algılama (demo müziği = 124 BPM), vuruşa kesme, metinden altyazı, SRT, önizlemede sürükleme |
| `templates-duck.cjs` | `npx vite --port 5173` | Eski 7 şablon + ducking (-12,0 dB) |
| `pro-director.cjs` | dev 5173 | Chroma key, grade/LUT/maske, sessizlik kesme, kare dondurma, Yönetmen komutları |
| `image-studio.cjs` | dev 5173 | Görsel Stüdyo: katmanlar, fırça/silgi, PNG export, AI dekupe (internetsiz → anlamlı hata) |
| `pixels-adjust.cjs` | dev 5173 | Fırça undo/redo, seçim+Delete, kement→katman, ayar katmanı+maske, kırpma |
| `ae-core.cjs` | dev 5173 | Expressions, parenting (dünya konumu korunur), motion blur, bezier, grafik editörü, AE komutları |
| `ae-showcase.cjs` | dev 5173 | Parçacık tutarlılığı, trim paths, AE vitrin videosu render (ae_vitrin.mp4) |
| `gpu-parity.cjs` | dev 5173 | GPU (WebGL2) ↔ CPU efekt çıktısı eşitliği ve süre karşılaştırması |
| `templates-sheet.cjs` | dev 5173 | 400 şablonun hatasız render'ı + 16:9 / 9:16 kontak sayfaları |
| `gallery-ui.cjs` | dev 5173 | Şablon galerisi: filtre, arama, pencere, ekleme, yeni proje, MP4 |
| `pen-mask.cjs` | dev 5173 | Kalem maskesi: mod/feather/genişletme/opaklık, dönüşüm+parenting, yol keyframe'leri, bölme, ayar katmanı; gerçek fareyle çizim/düzenleme/undo; Yönetmen; görsel mod; vitrin MP4 (maske_vitrin.mp4) |

Çalıştırma: `mkdir -p /tmp/e2e && cd /tmp/e2e && node <proje>/tests/e2e/<script>.cjs` — çıktılar (png/mp4) bulunulan dizine yazılır; proje kökünü kirletmemek için ayrı dizinden çalıştır.
Not: Başsız Chromium'da AAC kodlayıcı yok; render Opus sese düşer. Normal Chrome'da AAC kullanılır.
Not: Dev sunucusu açıkken kaynak dosya değiştirdiysen testten önce `vite`'ı yeniden başlat (HMR sonrası test, uygulamadan ayrı bir modül kopyası yükleyebilir).
