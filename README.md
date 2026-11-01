# SECO Film Atölyesi

Sinema ve prompt akademisi + görsel/video üretim fabrikası. Öğren, sahneyi canlı kur, hazır promptu al.
Arayüz Türkçe; her İngilizce prompt Türkçesiyle gelir. claude.ai Artifact olarak tek HTML dosyasında (~1,1 MB) çalışır.

- **Akademi:** M1–M10, 25 ders, 24 oyun (eşleştirme, kaydırıcı, çelişki avı, düello), rubrikli prompt değerlendirme, XP / rütbe / seri / rozet, konu kilidi, zayıf nokta haritası, aralıklı tekrar kartları, Claude ile günlük alıştırma ve hoca.
- **Stüdyo:** Three.js 3D sahne: manken ve pozlar, gerçek lens mantığı, Kelvin ışık, sis, yağmur/kar, 7 mekân seti ve 6 prop, 3 görünüm, zaman çizelgesi ve şeritler. Çıktılar: referans kare, derinlik haritası, poz çizimi, `.glb`, Blender `bpy` betiği. 104 kayıtlık canlı kamera kataloğu (10 kategori, duygudan öneri, karşılaştırma).
- **Fabrika:** fikirden yayına 9 adım; 8 şablon kendi akışıyla; görsel onay kapısı; 12 model kartı (düzenlenebilir, “doğrulanmadı” etiketli); model karşılaştırma; kredi tahmini; düzeltme laboratuvarı; tek dosya sahne paketi; yayın paketi (.srt, thumbnail, hashtag, 9:16 güvenli alan).
- **Çelişki bekçisi:** 17 deterministik kural, Akademi ve Fabrika’da ortak, tek tıkla düzeltme.
- **Claude katmanı:** 10 şemalı görev; Claude yoksa şablon motoru her şeyi yine üretir.

```bash
npm install
npm run check   # test (268) + build + smoke + a11y + 3 kullanıcı senaryosu
```
`dist/index.html` tarayıcıda doğrudan açılır; `dist/seco-film-atolyesi.html` claude.ai Artifact olarak yayınlanır.

Ayrıntılar: `CLAUDE.md`, `docs/PLATFORM.md`, `BACKLOG.md`, `MASTER_PROMPT.md`.
