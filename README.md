# SECO Film Atölyesi

Sinema ve prompt akademisi + görsel/video üretim fabrikası. Öğren, sahneyi canlı kur, hazır promptu al.
Arayüz Türkçe; her İngilizce prompt Türkçesiyle gelir.

- **Akademi:** M1 Prompt iskeleti, M2 Kamera; 8 oyun, XP, rütbe, zayıf nokta haritası, günlük meydan okuma.
- **Stüdyo:** Three.js 3D sahne (manken, gerçek lens mantığı, Kelvin ışık, sis, 3 görünüm, zaman çizelgesi, PNG referans kare) ve 56 kayıtlık canlı kamera kataloğu.
- **Fabrika:** fikirden video promptuna 9 adım; görsel onay kapısı; Seedance, Flow, Nano Banana, Soul, Midjourney model kartları (doğrulanmadı etiketli).
- **Çelişki bekçisi:** 17 deterministik kural, Akademi ve Fabrika’da ortak.

```bash
npm install && npm test && npm run build && npm run smoke
```
`dist/index.html` tarayıcıda doğrudan açılır; `dist/seco-film-atolyesi.html` claude.ai Artifact olarak yayınlanır.

Ayrıntılar: `CLAUDE.md`, `docs/PLATFORM.md`, `BACKLOG.md`, `MASTER_PROMPT.md`.
