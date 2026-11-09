# Kanal anlatıcı sesi — ses kimliği

## Birincil ses (kanalın tüm videolarında kullanılacak)

| Ayar | Değer |
|---|---|
| Platform / model | Higgsfield → `elevenlabs_v4` (ElevenLabs v4) |
| Ses | **Orion** (hazır ses) |
| voice_type | `preset` |
| voice_id | `ed69c516-92d2-4b30-a967-617737a342e5` |
| stability / similarity_boost | ayarlanmadı (model varsayılanı) |

## Yedek: kalıcı klon ses (hesaba kayıtlı)

| Ayar | Değer |
|---|---|
| Ad | Kanal Anlatıcısı TR (Orion) |
| voice_type | `element` |
| voice_id | `3eaa6f8d-3fac-477d-8d17-eb55bf561917` |
| Kaynak kayıt | `orion_reference_tr.wav` (Zanzibar 1896 anlatımından ~101 sn, tempo uygulanmamış özgün Orion çıktıları) |
| Model | `elevenlabs_v4` ile kullanılır |

### Klon testi (9 Kasım 2026)

Aynı metin hem klonla hem özgün Orion ile seslendirildi (`test_*.mp3`, `test2_*.mp3`):

| Ölçüm | Orion (hazır) | Klon |
|---|---|---|
| Ortalama perde (test 1 / test 2) | 125.5 / 132.2 Hz | 146.8 / 150.9 Hz |
| Süre (test 2) | 12.2 sn | 12.7 sn |
| Ortalama spektrum benzerliği (Orion'a) | — | 0.979–0.986 |
| Whisper dökümü | doğru | doğru |

Sonuç: Klon tını olarak çok yakın ama yaklaşık **2.5 yarım ton daha tiz** ve ~%4 daha yavaş. Yerel perde düzeltmesi (`rubberband pitch=0.866, tempo=1.04, formant=preserved`) perde ve süreyi eşitliyor, fakat işlem izi bırakıyor (benzerlik 0.949'a düştü, bir kelime yanlış duyuldu). Bu nedenle:

- **Bütün videolarda birincil ses olarak hazır "Orion" kullanılmalı** — aynı sesin birebir devamı budur.
- Klon, hazır ses ileride kaldırılır veya değişirse kullanılacak **yedek**tir. O durumda yeni seride baştan klonla başlanmalı (aynı video içinde Orion ve klon karıştırılmamalı).

## Aynı karakteri korumak için üretim kuralları

- Metin cümle cümle üretilir; cümleler arası duraklamalar kodla eklenir (`tools/segments.py`, `tools/assemble_narration.py`).
- Özel isimler TTS'e Türkçe okunuşla, sayılar yazıyla verilir; ekranda/altyazıda özgün yazım kullanılır.
- Hafif tempo (perde korunarak): genel 1.02; gerilimli bölümler 1.04–1.065; final 1.0.
- Telaffuz Whisper ile denetlenir; hatalı okunan segment, küçük ifade/noktalama değişikliğiyle yeniden üretilir.
- Ölçülen konuşma hızı: ~136 kelime/dk (tempo öncesi).
