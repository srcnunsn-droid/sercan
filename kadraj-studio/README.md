# KADRAJ Studio — Yapay Zekâ Video Üretim Stüdyosu

Fikirden finale tüm üretim hattı tek uygulamada: **fikir → senaryo → storyboard → kurgu → motion/efekt → ses → render**.
Hiçbir API anahtarı gerekmez; her şey tarayıcıda çalışır. Yerel AI sunucuları (Ollama, ComfyUI, Kokoro TTS) isteğe bağlı olarak bağlanır, ileride bulut API'leri aynı katmana takılır.

![Kurgu](docs/kurgu.png)

## Çalıştırma
```bash
npm install
npm run dev        # http://localhost:5173  (Chrome / Edge önerilir)
npm run build      # dist/ — herhangi bir statik sunucuda çalışır
```
İlk açılışta **Projeler ▾ → ✨ Demo projesi** ile tüm özellikleri gösteren 12 sn'lik intro yüklenir.

## Modüller
| Modül | Ne yapar |
|---|---|
| 💡 **Fikir Lab** | Brief (konu, format, ton, süre, kitle) → logline, 3 hook, CTA, görsel dil (palet/ışık/kamera/font/müzik), beat yapısı. 7 format (Reklam, Shorts/Reels, Kısa film, Belgesel, Klip, Ürün, Fragman) × 7 ton. Çevrimdışı motor veya yerel LLM (Ollama). |
| 🎬 **Storyboard** | Sahne/plan düzenleme: plan ölçeği, lens, hareket, ışık, VO, ekran yazısı, SFX, süre. Otomatik eskiz kareleri (kadraj kılavuzu + kamera oku). Her plan için İngilizce video-model promptu + negatif. CSV shot listesi, prompt paketi. **Tek tıkla kaba kurgu** (kareler + Ken Burns + yazılar + SFX + müzik). ComfyUI ile plan bazlı görsel/video üretimi. |
| ✂️ **Kurgu** | Çok izli timeline (sürükle, kırp, böl, ripple sil, çoğalt, iz taşıma, yapışma, işaretçi, zoom), iz kilitle/gizle/sessiz. Inspector: konum/ölçek/dönüş/opaklık/bulanıklık **keyframe** + 8 easing, 13 hareket preseti, 16 efekt (renk, vinyet, gren, RGB split, glitch, VHS, ışık sızıntısı, sinema bandı, sarsıntı, piksel…), 8 grade preseti, 12 geçiş, 10 karışım modu, hız ayarı, 8 metin animasyonu, 7 tipografi stili, şekil/gradyan katmanları. Undo/redo, otomatik kayıt. |
| 🎧 **Ses** | Prosedürel müzik üretici (7 mod, BPM, ton, katmanlar), 14 SFX (whoosh, darbe, riser, braam, glitch…), mikrofonla VO kaydı, TTS (tarayıcı önizleme + yerel Kokoro/Chatterbox sunucusu). Klip başı ses seviyesi, fade, dalga formu, master limiter. |
| 🧠 **AI Motorları** | Ollama (metin), ComfyUI (Wan / LTX / HunyuanVideo / Flux — workflow API JSON + yer tutucular), OpenAI-uyumlu yerel TTS. |
| 📤 **Çıktı** | **Kare-doğru** MP4 render (WebCodecs H.264/HEVC/VP9 + AAC/Opus), 4K'ya kadar, preset'ler (YouTube, Reels, 4:5, 1:1), aralık seçimi; PNG kare, WAV miks, taşınabilir proje paketi. |
| 🧭 **Ekosistem** | 45+ açık kaynak projenin haritası (ne işe yarar, lisans, donanım, entegrasyon durumu) + 4 fazlı yol haritası. |

## 🖼 Görsel Stüdyo (Photoshop tarafı)
Sol menü → **Görsel**. Hazır tuvaller: Instagram 1:1/4:5, Story 9:16, YouTube küçük resim, Full HD, 4K, A4 300 dpi, X başlık, logo; ya da özel boyut.
- **Katmanlar:** Göster/gizle, kilitle, sırala, çoğalt, opaklık, 16 karışım modu, birleştir (flatten).
- **Fırça ve silgi:** Yumuşak kenarlı damga fırçası; boyut, sertlik, opaklık. Kısayollar: B fırça, E silgi, V seç, [ ] boyut.
- **AI arka plan silme:** Tarayıcıda transformers.js ile, MODNet (portre) veya RMBG-1.4 (genel) modeliyle.
- **Videodaki her şey katmanlarda da çalışır:** Efektler, renk tekerlekleri, LUT, yeşil perde, maske, metin stilleri, önizlemede taşıma/ölçekleme.
- **Dışa aktarım:** PNG / JPG / WebP, 0.5× / 1× / 2× ölçek.

## 🎞 Şablon Galerisi — 400 hareketli grafik şablonu
Sol menü → **Şablonlar** (Yönetmen: "şablon galerisini aç").
- **40 tasarım × 10 palet = 400 şablon.** 12 kategori: Başlık & Intro, Sinematik, Kinetik Tipografi, Logo, Alt Bant, Sosyal Medya, Geçişler, İnfografik, Arka Plan döngüleri, Kutlama, Outro.
- **Paletler:** Neon Gece, Gün Batımı, Okyanus, Kurumsal, Minimal Beyaz, Altın Lüks, Orman, Pembe Pop, Siber, Monokrom.
- **Parametrik:** Metin alanları düzenlenebilir, önizleme canlı güncellenir. 16:9, 9:16 ve 1:1 düzene kendiliğinden uyar.
- **Galeri:** Canlı küçük resimler var, kartın üzerine gelince animasyon oynar. Kategori, palet ve Türkçe eklere dayanıklı arama ile filtrelenir.
- **Kullanım:** "Playhead'e ekle" ile her katman kendi izine gelir ve tamamen düzenlenebilir (keyframe, ifade, efekt, parenting). "Yeni projede aç" ile şablon ayrı proje olur.
- **Varlıksız tasarım:** Şablonlar yalnızca şekil, metin, gradyan, parçacık, null ve ayar katmanlarından kurulur. Anında yüklenir, çözünürlükten bağımsızdır.
- **Animasyonlu sayaç:** Metin katmanları 0 → hedef değere sayabilir (önek, sonek, ondalık, gecikme).

## 🎞 After Effects motoru
- **Expressions:** Her dönüşüm satırındaki **=** düğmesiyle açılır. `time`, `t`, `value`, `wiggle(frek, genlik[, oktav])`, `loopOut('cycle'|'pingpong')`, `linear/ease/easeIn/easeOut(x,a,b,v1,v2)`, `valueAtTime(s)`, `noise()`, `random()`, `sin/cos/clamp`… Hatalı ifade güvenle değere geri döner ve hata satır altında gösterilir.
- **Parenting ve null nesneler:** Konum, dönüş ve ölçek ebeveynden miras alınır. Bağlarken dünya konumu korunur (AE gibi). Döngüsel bağlantı engellenir. Önizlemede çocuk katmanlar ebeveyn uzayında doğru taşınır.
- **Grafik editörü:** Expression sonuçları dahil gerçek değer eğrisi. Keyframe'ler sürüklenir (Shift: sadece değer), çift tıkla eklenir, Del ile silinir. Bezier hız tutamaçları var. Presetler: Easy Ease (F9), Easy Ease In/Out, Overshoot, Hızlı giriş…
- **Hareket bulanıklığı:** 180° shutter ile alt-kare örnekleme (önizlemede 6, render'da 12 örnek). Parenting hareketini de hesaba katar. Hareketsiz karede atlanır.
- **Trim paths (çizerek belirme):** Kontur, yol uzunluğuna göre çizilir, dolgu ardından gelir. Gecikme ayarlanır. Yıldız, çokgen, halka şekilleri.
- **Parçacık sistemi:** Analitik ve durumsuz olduğu için kaydırmada birebir tutarlı. 6 preset: kıvılcım, kar, konfeti, ateş, bokeh tozu, büyü. Doğum hızı, ömür, hız, yön/yayılım, yerçekimi, sürtünme, türbülans, boyut, renk geçişi, toplamalı karışım. Kare başı ~2 ms.
- **Yönetmen komutları:** "wiggle ekle 3 hz 40 px", "sürekli döndür 180", "döngü yap", "easy ease", "hareket bulanıklığı aç", "null ekle", "kar yağdır", "konfeti", "çizerek belirt", "grafik editörü".

## 🖊 Kalem (bezier) maskesi
Önizleme çubuğundaki **🖊 Kalem** düğmesi, **G** kısayolu ya da Inspector → **Maskeler**. Seçili katmana AE tarzı yol maskesi çizer.
- **Çizim:** Tıkla → köşe noktası, sürükle → eğri (simetrik tutamaç). İlk noktaya tıkla ya da **Enter** → yolu kapat. Açık yol maskelemez.
- **Düzenleme:** Çapayı sürükle; kenara tıkla → araya nokta ekle (eğri biçimi bozulmaz); **Alt+tık** köşe ↔ yumuşak; **Alt+tutamaç** tutamacı kırar; **Del** noktayı siler; **Esc** çıkar. Hepsi Ctrl+Z ile geri alınır.
- **Özellikler:** Yumuşatma (feather), genişletme (±), maske opaklığı, ters çevirme; mod: **Ekle / Çıkar / Kesişim** (katman başına birden fazla maske). Hazır dikdörtgen ve elips yolları.
- **Yol animasyonu:** ⏱ açıkken kalemle yapılan her biçim değişikliği playhead'e yol keyframe'i yazar; ◀ ◆ ▶ ile gezilir, keyframe başına easing seçilir.
- **Katman uzayı:** Maske katmanla birlikte taşınır, döner, ölçeklenir; parenting ve geçişleri izler. Ayar katmanında bölgesel düzeltme için kullanılır. Görsel Stüdyo'da da çalışır.
- **Yönetmen:** "kalem maskesi", "elips maske ekle yumuşat 80", "dikdörtgen maske ekle", "maskeyi ters çevir", "maske yumuşat 60", "maskeleri sil".

## 🎛 Profesyonel kompozit araçları
- **Ayar katmanı (Adjustment Layer):** Efektleri altındaki tüm katmanlara uygular. Maske efektiyle bölgesel renk düzeltme yapılır, opaklık şiddeti belirler. Video ve görselde çalışır.
- **Video skopları:** Luma dalga formu, RGB parade, histogram ve vektörskop (cilt tonu çizgisi, R/G/B/Cy/Mg/Yl hedefleri). Önizleme çubuğundaki 📊 Skoplar düğmesiyle açılır.
- **Seçim araçları (Görsel Stüdyo):** Dikdörtgen (M), elips, kement (L); Shift ile kare/daire. Seçimi kopyala → katman (Ctrl+J), kes → katman (Ctrl+Shift+J), doldur, sil (Delete), kaldır (Esc). Fırça ve silgi seçime kırpılır.
- **Piksel geçmişi:** Fırça, silgi ve seçim işlemleri Ctrl+Z / Ctrl+Y ile geri alınır (son 40 adım).
- **Kırpma:** Klipleri sol/üst/sağ/alt kenardan kırpma.

## ⚡ GPU efekt motoru
Renk tekerlekleri, 3D LUT, chroma key, keskinleştirme ve RGB split WebGL2 shader'larında çalışır. Ardışık efektler tek zincirde ping-pong framebuffer ile işlenir. Çıktı CPU yoluyla birebir aynıdır (en fazla 1/255 fark). WebGL2 yoksa otomatik olarak CPU'ya düşer; üst çubuktaki ⚡ GPU anahtarıyla elle de seçilebilir.

## 🎬 Yönetmen (Ctrl+K)
Türkçe yaz, stüdyo yapsın. Virgülle birden fazla komut verilebilir:
```
"YAZ GELDİ" başlık ekle, noir grade uygula, glitch efekti ekle, solma geçiş ekle
müzik ekle lofi 85 bpm, whoosh sesi ekle, dikey format yap
sessizlikleri kes, kareyi dondur, ken burns, yavaş çekim, 5 saniyeye git
```
Kural motoru çevrimdışı çalışır; anlamadığı cümleyi (Ollama açıksa) yerel LLM'e aynı komut şemasıyla çevirtir. Aynı palet 120+ komutu aramaya da açar.

## Profesyonel kompozit & renk
- **Chroma key:** Yeşil/mavi perdeyi YCbCr uzaklığıyla siler; benzerlik, yumuşaklık ve taşma (spill) temizliği ayarlanır.
- **Maske:** Elips ya da dikdörtgen, yumuşatma (feather), ters çevirme.
- **Renk tekerlekleri:** Lift/gamma/gain renk + miktar, pozlama (EV), kontrast, doygunluk, sıcaklık, tint, gölge ve yüksek ışık.
- **3D LUT:** `.cube` yükle (trilinear interpolasyon). 4 yerleşik LUT: filmik, bleach bypass, teal & orange, matrix.
- **Glow/bloom ve keskinleştirme.**
- **Sessizlik kesme (jump-cut):** Konuşma kaydındaki boşlukları algılayıp keser ve arkasındaki klipleri kaydırır.
- **Kare dondurma:** Playhead'deki video karesini dondurur, hafif zoom ekler, kalan kısmı kaydırır.

## Akıllı araçlar (Kurgu → Akıllı sekmesi)
- **Ritim senkronu:** Müzik dosyasından BPM ve vuruşları bulur (spectral flux, otokorelasyon, en küçük kareler ile ızgara oturtma). Vuruşları timeline'a işaretler ya da klipleri her 1/2/4/8 vuruşta bir keser.
- **Otomatik ducking:** Seslendirme izinde konuşma varken müzik ve efektler ayarlanan dB kadar yumuşakça kısılır (önizleme ve render'da).
- **Altyazı:** Whisper tarayıcıda çalışır (tiny/base/small, Türkçe). Model ilk kullanımda indirilir, sonrası çevrimdışı. Metinden zamanlı altyazı ve SRT indir/yükle de var.
- **Önizlemede düzenleme:** Katmana tıkla seç, sürükle taşı, köşeden ölçekle. Merkeze ve kenarlara yapışır; Alt tuşu yapışmayı kapatır.
- **Şablonlar:** YouTube intro, Reels kancası (9:16), alt bant, geri sayım, belgesel açılışı, abone ol/CTA, ürün lansmanı.

## Kısayollar
Space oynat · S böl · Del sil · Shift+Del ripple · Ctrl+D çoğalt · Ctrl+C/V kopyala-yapıştır · Ctrl+A tümünü seç · Esc seçimi bırak · Ctrl+Z / Ctrl+Y · ←/→ kare · Shift+←/→ 1 sn · K keyframe · M işaret · Ctrl+tekerlek zoom

## Yerel AI bağlama (opsiyonel)
```bash
OLLAMA_ORIGINS="*" ollama serve && ollama pull qwen3:8b
python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header "*"     # ComfyUI
docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu                  # Kokoro TTS
```

## Mimari
```
src/
  types.ts          veri modeli (Project, Track, Clip, Keyframe, Effect, Scene, Shot)
  store.ts          zustand + immer, undo/redo, IndexedDB otomatik kayıt
  engine/render.ts  kare render motoru (önizleme = çıktı, WYSIWYG)
  engine/interp.ts  keyframe & easing
  engine/effects.ts efekt/geçiş tanımları      engine/presets.ts  hareket/grade/metin presetleri
  engine/audio.ts   ses zamanlama + offline miks   engine/audioGen.ts müzik & SFX sentezi
  engine/export.ts  WebCodecs + mp4-muxer render   engine/visualGen.ts arka plan & storyboard karesi
  ai/ideaEngine.ts  fikir→senaryo→shot motoru      ai/providers.ts Ollama / ComfyUI / TTS adaptörleri
  ai/ecosystem.ts   açık kaynak harita + yol haritası
  ai/captions.ts    altyazı/SRT       ai/whisper.worker.ts tarayıcıda Whisper
  engine/beats.ts   beat/tempo algılama   templates.ts tek tıkla şablonlar
  ui/*              arayüz
```
Notlar: Tarayıcının TTS sesi dosyaya yazılamaz (yalnız önizleme) — dosya için mikrofon ya da yerel TTS. Lisanslar Ekosistem sayfasında özettir; ticari kullanımdan önce her reponun LICENSE dosyasını kontrol edin.
