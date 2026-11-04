# Kral ve Muhafız — kod tabanlı animasyon film (Instagram Reels, 9:16)

Adı verilmeyen kurmaca bir krallıkta geçen kısa bir film. Bütün karakterler, mekânlar, ışıklar, efektler,
hareketler ve ses tasarımı bu klasördeki kodla **yerelde** üretilir. Haricî bir görsel, video ya da ses üretim
servisi kullanılmaz.

- Çıktı: `out/kral_ve_muhafiz.mp4` — 1080×1920, 30 fps, H.264 + AAC, 72.2 sn
- Altyazı: `out/kral_ve_muhafiz.srt` (videoya da gömülü)
- Ses tasarımı: `out/kral_ve_muhafiz_ses.wav` (rüzgâr, adımlar, kapı, şömine, kömür, müzik)
- Dış ses metni ve zamanlama: `out/dis_ses_metni_ve_zamanlama.md`
- Plan: `PLAN.md`

> **Seslendirme yok:** Bu ortamda yerel ve ücretsiz bir Türkçe TTS aracı bulunamadı (espeak/espeak-ng,
> piper, festival, pyttsx3 yok). Bu yüzden anlatıcı kaydı üretilmedi. Anlatım metni altyazı olarak gösterilir.
> Satır zamanları doğal okuma hızına göre geçici olarak ayarlandı. Bir kayıt `audio/vo.wav` adıyla eklenip
> `./render.sh` çalıştırılırsa ses betiği anlatımı miksaja ekler ve müziği anlatımın altında kısar.

## Çalıştırma

```bash
./render.sh          # tam film → out/kral_ve_muhafiz.mp4  (~10 dk, 4 çekirdek)
./render.sh 37 50    # yalnızca 37–50 sn arası taslak → out/taslak.mp4
```

Gerekenler: Node 18+ ve `playwright` (Chromium), Python 3 ve NumPy, ffmpeg (libx264, aac).

**Önizleme:** `index.html` dosyasını Chromium tabanlı bir tarayıcıda açın. Oynat/durdur ve zaman çubuğu vardır.
Render ile aynı kodu gerçek zamanlı çalıştırır. `out/kral_ve_muhafiz_ses.wav` varsa sesle birlikte oynatır.
`index.html?t=24.8` ile belirli bir ana gidilir.

Tek kare denetimi: `node tools/frames.cjs <klasör> 5.0 24.8 66` belirtilen anları JPEG olarak kaydeder.

## Yapı

| Dosya | Görev |
|---|---|
| `src/timeline.js` | **Ortak zaman çizelgesi:** planlar, anlatım/altyazı satırları, yürüyüşler, ses efektleri, ortam ve müzik otomasyonu. JS ve Python aynı dosyayı okur. |
| `src/util.js` | gürültü, easing, renk, anahtar kare izleri, iki kemikli IK |
| `src/rig.js` | iskelet ve ileri kinematik, yürüyüş çözücüsü (destek fazında ayak dünyada sabit, kayma yok), adım zamanları |
| `src/head.js` | sözde 3B baş: dönüşe göre izdüşen yüz hatları, göz kapağı, bakış, kaş, gülümseme, sakal, saç, taç, kukuleta, kırağı |
| `src/figure.js` | beden ve kıyafet katmanları (rüzgârla savrulan pelerin, tunik, kemer, kürk yaka, bot, eldiven), eller, mızrak, belge, yakın plan eller |
| `src/chars.js` | muhafız, kral, kâtip ve iki nöbetçinin sabit görünüm tanımları |
| `src/sets.js` | dünya koordinatından tohumlanan taş örgüsü, kemerli kapı, girinti, meşale, iç mekân koridoru ve şömine, kömür yazısı katmanı |
| `src/fx.js` | kar (paralaks), nefes buharı, alev, duman, kapıdan sızan ışık, gren ve vinyet |
| `src/film.js` | plan kurgusu, kamera, karakter pozları ve ışık; `renderFrame(ctx, t)` |
| `tools/render.cjs` | paralel kare render → ffmpeg |
| `tools/cues.cjs` | iskeletten adım zamanları, SRT, dış ses zamanlama dosyası |
| `tools/audio.py` | NumPy ses sentezi ve miksaj |

### Sabit mekân geometrisi (metre)
Kapı ekseni x=0 (kemerli çift kanat, ±1.0). Meşale x=−1.7, y=2.05. Girinti x −3.12…−2.12.
Duvar yazısı x −2.06…−1.42, y 0.32…1.08. Rüzgâr soldan sağa eser.
