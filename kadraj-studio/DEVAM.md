# KADRAJ Studio — Devir Teslim (yeni sohbete aktarım)

> Bu belge, projeyi yeni bir sohbette sıfırdan devralan asistan/geliştirici içindir. Önce bunu, sonra `README.md`'yi oku.

## 1. Proje nedir?
Tarayıcıda çalışan, **API anahtarı gerektirmeyen** "yapay zekâ video üretim stüdyosu". Hedef: Adobe (Premiere + After Effects + Photoshop) seviyesine yaklaşan, fikirden finale tek uygulama.
- Vite + React 18 + TypeScript + zustand/immer. Render: Canvas2D + WebGL2 (GPU efektleri). Çıktı: WebCodecs + `mp4-muxer`.
- Yerel AI isteğe bağlı: Ollama (metin), ComfyUI (görsel/video), OpenAI-uyumlu TTS (Kokoro), tarayıcıda transformers.js (Whisper altyazı, arka plan silme).
- ~5.700 satır TS/TSX. Tüm veri tarayıcıda (IndexedDB).

## 2. Kullanıcı hakkında (çalışma tarzı)
- Türkçe konuşur, samimi ve argo bir dil kullanır. Cevaplar Türkçe olmalı.
- Büyük hedef: "Adobe'yi / After Effects'i yerle bir edecek, milyon dolarlık uygulama". Kısa vadede **After Effects ağırlıklı** geliştirme istiyor.
- **"Bana sorma, kendin karar ver, yap"** diyor. Teknik kararları kendin ver, uygula, test et, özetle. Soru sorma; sadece gerçekten kullanıcıya ait kararlarda sor (örn. GitHub'a yazma izni).
- Dürüstlük önemli: yapılamayanı, test edilemeyeni açıkça söyle. Sayıları abartma (400 şablon = 40 tasarım × 10 palet).
- Her turdan sonra beklenen: test edilmiş özellik tablosu, ekran görüntüsü/video, güncel kaynak zip'i.

## 3. Çalıştırma
```bash
npm install
npm run dev            # http://localhost:5173 (Chrome/Edge)
npm run build && npx vite preview --port 4173
npx tsc -p .           # tip kontrolü (her değişiklikten sonra temiz olmalı)
```
İlk açılış: **Projeler ▾ → ✨ Demo projesi**. Galeri: sol menü **🎞 Şablonlar**.

## 4. Mimari ve dosya haritası
```
src/types.ts        Veri modeli: Project{settings,mode?('video'|'image'),tracks,clips,assets,scenes,idea,markers,luts?,paintRev?}
                    Clip{kind: media|text|solid|gradient|shape|adjust|null|particles, start,duration,in,speed,
                         base(Transform), kf(prop→Keyframe[]), expr?, parent?, motionBlur?, effects[], tIn/tOut,
                         text?, shape?, particles?, crop?, masks?(Mask[]), blend, volume/fades}
                    Mask{pts: MaskPt[] (çapa + giriş/çıkış tutamaç ofseti, katman uzayı), closed, mode add|subtract|intersect,
                         invert, feather, expand, opacity, kf?: MaskKey[] (yol keyframe'leri)}
                    Keyframe{t,v,e,b?} — e='bezier' ise b=[x1,y1,x2,y2]
src/store.ts        zustand: project + undo/redo (past/future snapshot), UI durumu (panel, tool, brush, graph, selected, time…)
                    historyHooks.after → piksel geçmişi (fırça) için kanca
src/actions.ts      Yüksek seviye işlemler: placeAsset (dolu ize binmez, gerekirse iz açar), metin/şekil/ayar katmanı/null/
                    parçacık ekleme, split/delete/duplicate, storyboard→kaba kurgu, beat'e kesme, sessizlik kesme,
                    kare dondurma, setParent (dünya konumunu korur), LUT, görsel mod katmanları, AI arka plan silme
src/engine/
  render.ts         KARE RENDER MOTORU (önizleme = çıktı). renderFrame(ctx,p,t,scale,transparent?)
                    drawClip: placeTransform → parenting (applyParents) → içerik → efektler (runEffects: GPU batch + CPU)
                    drawAdjust (ayar katmanı), motion blur (alt-kare, 'lighter' birikim), clipBounds/worldMatrix/parentChain
  interp.ts         Easing'ler, cubicBezier, sampleKf, EXPRESSIONS (evalExpr: wiggle, loopOut, linear/ease, valueAtTime…)
  effects.ts        EFFECT_DEFS (parametre tanımları; Inspector bunlardan otomatik UI üretir), geçiş/metin anim etiketleri
  gpu.ts            WebGL2 shader zinciri: grade, lut(3D doku), chromakey, sharpen, chroma. WebGL2 yoksa CPU fallback
  color.ts          Renk tekerlekleri (curves), .cube parse/uygula, yerleşik LUT'lar, chroma key (CPU)
  masks.ts          KALEM MASKESİ: maskPtsAt (yol keyframe ara değerleme), applyMasks (mat üretimi), splitSeg/toggleSmooth,
                    düzenleme işlemleri (editMaskPts = playhead'e otomatik keyframe, editMaskAll = yapısal değişiklik)
  particles.ts      Analitik/durumsuz parçacık sistemi + 6 preset; shapePath (trim paths için yol uzunluğu)
  pixels.ts         Seçim (rect/ellipse/lasso), toSource (proje→katman pikseli), piksel undo geçmişi, seçimi doldur/sil/kopyala
  media.ts          Asset runtime (img/video/AudioBuffer/canvas), boyanabilir katman (paintCanvas/commitPaint)
  audio.ts          Önizleme ses zamanlaması, offline miks, ducking, WAV
  audioGen.ts       Prosedürel müzik (7 mod) ve 14 SFX
  beats.ts          Spectral flux + otokorelasyon + en küçük kareler beat ızgarası
  export.ts         Kare-doğru MP4 (WebCodecs H.264/HEVC/VP9 + AAC/Opus), WebM yedek, PNG kare, WAV
  presets.ts        Hareket / grade / metin stil presetleri, makeEffect
  visualGen.ts      Prosedürel arka planlar, storyboard eskiz kartı
  playback.ts       Oynatma döngüsü, video senkronu
src/ai/
  director.ts       YÖNETMEN (Ctrl+K): Türkçe doğal dil → eylem kural motoru; anlamazsa Ollama'ya aynı şema ile sorar
  ideaEngine.ts     Fikir → logline/hook/senaryo/shot listesi (7 format × 7 ton), video model promptları
  providers.ts      Ollama, ComfyUI (workflow JSON + {{PROMPT}} vb.), OpenAI-uyumlu TTS adaptörleri
  captions.ts, whisper.worker.ts, bg.worker.ts   Tarayıcıda Whisper ve arka plan silme (transformers.js 3.7.5)
  ecosystem.ts      45+ açık kaynak araç haritası + yol haritası (Ekosistem sayfası)
src/templates/      400 ŞABLON: lib.ts (DSL: K() keyframe, shape/text/parts/nul/adjust, 10 PALET),
                    designs.ts (40 tasarım), index.ts (CATALOG, previewProject, insertTemplate, openAsProject)
src/templates.ts    (eski) 7 basit şablon — Kurgu → Şablon sekmesi
src/ui/             App kabuğu ve paneller: Preview (seçim/fırça/seçim araçları/skoplar), penTool.ts (kalem aracı + maske kaplaması), Timeline, GraphEditor, Inspector
                    (AE bölümü, expression kutuları, efektler, parçacık, kırpma), TemplateGallery, ImageStudio (katmanlar),
                    CommandPalette, SmartTools (beat/ducking/altyazı), IdeaLab, Storyboard, AudioStudio, AIEngines, ExportPanel, Scopes
```
**Önemli konvansiyonlar**
- Koordinatlar proje pikseli, **merkez orijinli** (x sağa, y aşağı). Ölçek tekdüze.
- `p.tracks` dizisi üstten alta; render alttaki izden başlar.
- **Görsel modu** (`mode:'image'`) = tek karelik proje. Her katman ayrı iz, klipler start 0 / süre 1. Animasyon ve geçişler son hâlinde çizilir.
- Zustand selector'larında yeni dizi/nesne döndürme (sonsuz render döngüsü yapar). Filtrelemeyi selector dışında yap.
- Şablonlar varlıksız (asset'siz): sadece şekil, metin, gradyan, parçacık, null ve ayar katmanı. Boyutlar `c.u` (min(W,H)/1080), dikey uyum `c.hx` ve `c.portrait`.
- Maskeler **katman uzayındadır** (merkez orijinli, ölçeksiz proje pikseli); `maskMatrix()` çizimle aynı matrisi verir. Render sırası: içerik → maskeler → efektler (AE gibi). Ayar katmanında maske ekran uzayındadır.
- Dev sunucusu açıkken dosya değiştirince e2e'den önce vite'ı yeniden başlat (HMR, teste ayrı modül kopyası yükletir).
- Her yeni özellik: `npx tsc -p .` temiz + `tests/e2e` ilgili test + gerekirse yeni test.

## 5. Özellik envanteri (hepsi test edildi)
Fikir Lab · Storyboard (+ kaba kurgu) · çok izli Timeline · keyframe + 8 easing + bezier · 25+ efekt · 12 geçiş · 8 metin animasyonu · animasyonlu sayaç · grade presetleri · chroma key · maske efekti · **kalem (bezier) maskesi + yol keyframe'leri** · renk tekerlekleri · .cube LUT · glow/keskinleştir · ayar katmanı · kırpma · video skopları · GPU efekt motoru · motion blur · expressions · parenting/null · grafik editörü · trim paths · yıldız/çokgen · parçacıklar · Görsel Stüdyo (katman, fırça/silgi, seçim araçları, piksel undo, AI dekupe, PNG/JPG/WebP) · ses stüdyosu (müzik/SFX/mikrofon/TTS) · beat sync · ducking · sessizlik kesme · kare dondurma · altyazı (Whisper/metin/SRT) · Yönetmen (Türkçe komut) · 400 şablon galerisi · MP4 4K render · proje paketi.

## 6. Bilinen sınırlar / test EDİLEMEYENLER (dürüstçe)
- **Whisper altyazı** ve **AI arka plan silme** hiç uçtan uca çalıştırılamadı: geliştirme ortamında Hugging Face'e ağ erişimi yoktu. Kod, transformers.js 3.7.5 API'sine göre yazıldı ve ağ hatası güvenle yakalanıyor. Gerçek internette ilk iş bunu test et.
- **GPU hızı** gerçek ekran kartında ölçülmedi (ortamda SwiftShader vardı: ağır zincirde ~2× hızlanma ölçüldü). Doğruluk CPU ile birebir aynı (≤1/255).
- Ağır efektli 1080p kare ~0,3 sn (CPU yolu). Tam kompoziti GPU'ya taşımak yol haritasında.
- Fırça geçmişi son 40 adımla sınırlı (bellek). ComfyUI / Ollama / Kokoro adaptörleri gerçek sunucuyla denenmedi.
- Expressions `new Function` + `with` ile çalışır (kullanıcının kendi tarayıcısında, AE'deki gibi). Paylaşılan projelerde güvenlik notu olarak akılda tut.

## 7. GitHub durumu
- Kod `srcnunsn-droid/sercan` reposunun **`kadraj-studio/` alt klasöründe**, `ccr-a54b075d-r3czxs` dalında commit'li (ana dala dokunulmadı). Push durumu için son sohbet özetine bak.
- Repo **public**; içinde başka içerik var. Kullanıcı isterse ayrı private repo açılabilir.

## 8. Yol haritası (sıradaki işler, öncelik sırasıyla)
1. ~~Kalem (bezier) maskesi~~ ✅ (çizim/düzenleme, feather, genişletme, modlar, yol keyframe'leri). Eksik kalanlar: maskeyi bütün olarak taşıma/ölçekleme, nokta sayısı farklı keyframe'ler arası geçiş, zaman çizelgesinde yol keyframe'i gösterimi, kenar başına değişken feather.
2. **Hareket takibi (tracking)** — nokta takibi (blok eşleme) → null'a keyframe; maske/metin bağlama.
3. **İç içe kompozisyon (precomp)** — klip türü 'comp', alt proje referansı; şablonlara foto/video yer tutucuları.
4. **3B katmanlar + kamera** (perspektif, z, kamera keyframe'leri).
5. **Harf harf metin animatörleri** (range selector: opaklık/konum/ölçek/dönüş, stagger).
6. Tüm kompoziti GPU'ya taşıma (gerçek zamanlı 4K) · Whisper/dekupe gerçek ağda testi · masaüstü (Tauri + ffmpeg, ProRes).

## 9. Test
`tests/e2e/README.md` → hangi script hangi sunucuyla çalışır. Her büyük değişiklikten sonra en az şunları koştur: `pro-director`, `ae-core`, `pixels-adjust`, `image-studio`, `templates-sheet`, `export`, `pen-mask`.
