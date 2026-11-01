# SECO Film Atölyesi — çalışma notları (her oturumda önce bunu oku)

Tam talimat: `MASTER_PROMPT.md`. Platform araştırması: `docs/PLATFORM.md`. Kapsam dışı fikirler: `BACKLOG.md`.

## Ürün özeti
Tek uygulama, üç alan, tek ortak beyin:
- **Akademi** (`src/features/Academy.tsx`, `Games.tsx`): modüller, 5 adımlı dersler, oyunlar, XP/rütbe, zayıf nokta haritası.
- **Stüdyo** (`src/features/Studio.tsx`): Three.js 3D sahne + 2D önizleme, kamera/lens/ışık laboratuvarı, kamera kataloğu.
- **Fabrika** (`src/features/Factory.tsx`): 9 adımlı üretim hattı; video adımı görsel onay kapısı geçilmeden açılmaz.
- **Ortak beyin**: sahne grafı (`src/model`), kural motoru (`src/engine/rules.ts`), deterministik prompt derleyici (`src/engine/compiler.ts`), Claude katmanı (`src/ai`).

Kullanıcı Türkçe konuşur, İngilizce bilmez; telefon ve bilgisayarda kullanır; Higgsfield (Soul, Seedance, Nano Banana) ve Google Flow ile çalışır.

## Değişmez ilkeler
1. Küçük adımlar, oyunlaştırma, bol alıştırma. Kullanıcı “başla” demeden yeni konu açılmaz (konu kilidi: `unlockLesson`).
2. Önce görseller, sonra video. Video promptu yalnızca onay kapısından sonra.
3. Arayüz Türkçe. Her İngilizce prompt Türkçesiyle (`PromptBlock`). Her terimin Türkçe açıklaması (`Term`, `glossary.json`).
4. Gözle görülen yazılır. Görünmeyen kelimeler (`invisible-words.json`) görünür karşılığa çevrilir.
5. Promptlar 5 kutu: Scene, Camera, Characters, Light, Environment.
6. Her prompt şu satırla biter: `No sharpen, no color bleeding, natural photographic texture.`
7. Referanslar `@image-1`, `@image-2`… Önce karakter sheet’leri, sonra mekân. **Numaralama parça başına 1’den başlar** (yalnızca o parçada yüklenen görseller).
8. Karakter başına tek sheet promptu; gri zemin, gölgesiz ışık.

## Mimari kuralları
- İçerik koddan ayrıdır: `src/content/**.json` (katalog, dersler, oyunlar, kurallar, model kartları, sözlük). Yeni katalog kaydı = JSON eklemek.
- Prompt derleyici deterministiktir; Claude yalnızca zenginleştirir/eleştirir. `runTask` şema doğrular, bir kez yeniden dener, sonra şablona düşer.
- Her düzenleme `useApp.edit()` ile bir komuttur → geri al/yinele çalışır. Şema sürümlü (`SCHEMA_VERSION`), eski projeler `migrateProject` ile açılır.
- Depolama: `localStorage` (her erişim try/catch) + Artifact `db` (kişiye özel `data/users/<id>/workspace/kv/*`). API anahtarı asla koda veya depoya girmez (yalnızca oturum belleği).
- Model kartları `verified: false` ile gelir; ezberden özellik doldurma.
- Claude prompt şablonları: `src/prompts/*.md` (sürümlü).

## Komutlar
```bash
npm install
npm run dev        # geliştirme sunucusu
npm test           # Vitest: kurallar (her kurala ≥3 olumlu + ≥3 olumsuz), derleyici, katalog, migrasyon
npm run build      # tsc + tek HTML: dist/index.html ve Artifact gövdesi dist/seco-film-atolyesi.html
npm run smoke      # headless Chromium: 6 ekran × (390px, masaüstü koyu, masaüstü açık), konsol hatası ve yatay taşma kontrolü
```

## Çalışma düzeni
Önce plan, sonra kod. Küçük commit’ler; her faz sonunda uygulama çalışır. “Bitti” demeden: `npm test`, `npm run build`, `npm run smoke`. Her faz sonunda dur, ekran görüntüleri + 5 maddelik özet göster, onay bekle. Bilinmeyeni tahmin etme; `TODO` yaz ve sor (çoktan seçmeli, önerinle).

## Faz durumu
- Faz 0 iskelet: tamam.
- Faz 1 (Akademi çekirdeği: M1+M2, 8 oyun, XP/rütbe, kural motoru v1, 17 kural): tamam.
- Faz 2 (2D lab, derleyici, TR/EN çıktı): tamam.
- Faz 3 (3D stüdyo): çekirdek tamam (manken, lens, ışık, sis, 3 görünüm, zaman çizelgesi, PNG kare). Eksik: .glb, bpy, gizmo, mekân setleri, replik şeritleri.
- Faz 4 (Fabrika): adım 1–7 çalışır; şablonlar, kart seçimi, kredi sayacı var. Eksik: varlık sürüm geçmişi, model karşılaştırma görünümü.
- Faz 5–7: başlamadı (bkz. BACKLOG.md).
