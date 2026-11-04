# Kral ve Muhafız — Dış ses metni ve zamanlama

Tek anlatıcı. Kralın ve muhafızın sözleri aynı anlatıcı tarafından, hafif ton farkıyla okunur. Ton sakin, anlaşılır ve ölçülü olmalı.
Reklam sesi, bağırma, ağlamaklı oyunculuk ve yapay fısıltı kullanılmamalı.

> **Durum:** Bu ortamda yerel, ücretsiz bir Türkçe TTS aracı bulunamadı (espeak/espeak-ng, piper, festival, pyttsx3 yok). Seslendirme kaydı **üretilmedi**. Aşağıdaki zamanlar doğal okuma hızına (~12 karakter/sn) ve gerekli duraklamalara göre ayarlanmış geçici zamanlardır. Film, altyazı ve ses efektleri bu zamanlara bağlıdır.

Kayıt eklemek için: kaydı `audio/vo.wav` (mono/stereo, 48 kHz önerilir) olarak koyup `./render.sh` komutunu çalıştırın. Ses betiği anlatımı miksaja ekler ve müziği anlatımın altında kısar.
Kaydın satır zamanları farklıysa `src/timeline.js` içindeki `lines[].start/end` değerlerini güncelleyin. Altyazı ve kurgu aynı kaynaktan yeniden hesaplanır.

| # | Başlangıç | Bitiş | Ses / ton | Metin |
|---|---|---|---|---|
| L1 | 3.60 s | 5.80 s | anlatıcı | Dondurucu bir kış gecesiydi. |
| L2 | 9.40 s | 12.90 s | anlatıcı | Kral, sarayın kapısında nöbet tutan muhafıza sordu: |
| L3 | 13.30 s | 14.50 s | kral (hafif sıcak ton) | “Üşüyor musun?” |
| L4 | 15.00 s | 17.00 s | anlatıcı + muhafız (alçak, sakin) | Muhafız, “Alışığım kralım,” dedi. |
| L5a | 17.60 s | 18.90 s | kral + anlatıcı | “Olsun,” dedi kral. |
| L5b | 19.20 s | 22.70 s | kral (samimi) | “Sana sıcak tutacak elbise getirmelerini emredeceğim.” |
| L6 | 23.60 s | 25.80 s | anlatıcı | Muhafızın yüzü bir an yumuşadı. |
| L7a | 27.20 s | 28.60 s | anlatıcı | Kral saraya döndü. |
| L7b | 30.40 s | 33.40 s | anlatıcı | Fakat içeri girince verdiği sözü unuttu. |
| L8 | 37.40 s | 38.60 s | anlatıcı | Muhafız bekledi. |
| L9 | 39.30 s | 41.40 s | anlatıcı | Gözleri, her seste kapıya döndü. |
| L10 | 42.40 s | 43.80 s | anlatıcı | Ama kapı açılmadı. |
| L11 | 57.00 s | 60.20 s | anlatıcı | Sabah olduğunda onu duvarın yanında buldular. |
| L12 | 60.80 s | 62.00 s | anlatıcı | Soğuktan donmuştu. |
| L13 | 63.00 s | 64.60 s | anlatıcı | Duvarda bir cümle vardı: |
| L14 | 65.90 s | 70.20 s | muhafızın sözü (sakin, kırgın; öncesinde ~1.3 sn duraklama) | “Soğuğa alışkındım; fakat senin sıcak elbise vaadin beni öldürdü...” |

Final cümlesinden önce ~1.3 sn duraklama vardır (64.6 → 65.9 s). Cümlenin ardından görüntü ~2 sn tutulur (film süresi 72.2 s).
