# Saatin İçindeki Liman — 1896 Britanya-Zanzibar Savaşı

Türkçe anlatımlı, 16:9 (1920×1080, 30 fps) animasyon belgeseli. Görüntünün büyük kısmı Remotion ile kodla çizilmiş animasyon; kısa destek çekimleri Higgsfield WAN 3.0 ile üretildi.

## Teslim dosyaları

| Dosya | İçerik |
|---|---|
| `zanzibar_1896_sesli_1080p.mp4` | H.264 + AAC 320k; anlatım, müzik ve efektler (miks −16 LUFS) |
| `zanzibar_1896_sessiz_1080p.mp4` | Aynı görüntü akışı, ses akışı yok |
| `narration_tr.wav` | Anlatım (48 kHz, 24-bit, mono) |
| `music.wav` | Müzik katmanı (yerel sentez, 48 kHz stereo) |
| `sfx_ambience.wav` | Atmosfer ve efekt katmanı (yerel sentez) |
| `subtitles_tr.srt` | Tam Türkçe altyazı (gerçek ses zamanlarından) |
| `script_source_tr.txt` | Kaynak metin (değiştirilmedi) |
| `script_final_tr.txt` | Seslendirilen nihai metin |
| `edit_notes.md` | Anlamı etkileyen düzenlemeler ve tarihsel düzeltmeler |
| `sources.md` | Kaynaklar ve görsel kararların sınırları |

## Proje yapısı

```
src/                  Remotion kaynak kodu (Main kompozisyonu: 11832 kare)
  components/         Saat, saray (3 hasar durumu), gemiler, liman, harita, efektler
  scenes/             Açılış, harita, saray/taht, ültimatom, güç farkı, bombardıman, yönetim, final
  data/               geo.json (Natural Earth'ten üretildi), timeline.json (gerçek ses zamanları)
public/               yazı tipleri (Playfair Display, Inter + OFL lisansları), dokular, Higgsfield klipleri
assets/               yerel stil kareleri, Higgsfield görselleri/klipleri ve üretim kaydı (jobs.md)
tools/                metin segmentleri, anlatım birleştirme, ses/miks, altyazı, harita, render betikleri
work/                 ara dosyalar (TTS segmentleri, zaman çizelgesi, premaster)
```

## Yeniden üretim

Gereksinimler: Node 22, FFmpeg (rubberband filtresi ile), Python 3 + numpy. Remotion, `remotion.config.ts` içindeki Chromium yolunu kullanır; başka makinede bu satırı kendi Chrome/Chromium yolunuzla değiştirin ya da silin.

```bash
npm install
npx remotion studio src/index.ts             # önizleme

# 1) metin → segmentler (work/segments.json, script_final_tr.txt)
python3 tools/segments.py
# 2) anlatım: TTS segmentleri work/tts_final/*.mp3 → narration + timeline.json
python3 tools/assemble_narration.py && cp work/timeline.json src/data/timeline.json
# 3) müzik, efekt ve miks (music.wav, sfx_ambience.wav, work/mix_premaster.wav)
python3 tools/audio.py
# 4) altyazı
python3 tools/make_srt.py
# 5) görüntü (sessiz, 6 parça; tek parça için: tools/render_chunks.sh <0-5>)
tools/render_chunks.sh
# 6) birleştirme: sessiz MP4, mastering, sesli MP4
tools/finalize.sh
```

Tek komutla sessiz tam render: `npx remotion render src/index.ts Main out/video.mp4 --muted`

Notlar:
- Anlatım, Higgsfield üzerinden **ElevenLabs v4** (hazır ses "Orion") ile cümle cümle üretildi. Telaffuz Whisper (small) ile denetlendi; hatalı okunan segmentler yeniden üretildi (ayrıntı: `edit_notes.md`). TTS dosyaları `work/tts_final/` içinde saklı, adım 2 ağ bağlantısı gerektirmez.
- Bütün animasyon zamanları `src/data/timeline.json` dosyasındaki gerçek ses zamanlarına bağlıdır (`S('s31')` gibi). Animasyon kare numarasından hesaplanır; rastgelelik sabit tohumludur.
- Higgsfield üretimleri, kullanılan aralıklar ve düzeltme denemeleri: `assets/higgsfield/jobs.md`.
