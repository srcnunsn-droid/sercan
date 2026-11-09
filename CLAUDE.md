# Kanal kuralları (tüm video projeleri için)

Bu depo, Türkçe tarih animasyon belgeseli kanalının üretim deposudur. Yeni bir video yapılırken aşağıdaki kurallar varsayılan olarak uygulanır; kullanıcı açıkça başka bir şey istemedikçe değiştirilmez.

## Anlatıcı sesi (sabit)

- Platform/model: Higgsfield → `elevenlabs_v4`
- **Birincil ses: "Orion"** — `voice_type: preset`, `voice_id: ed69c516-92d2-4b30-a967-617737a342e5`
- Yedek (yalnızca Orion kullanılamazsa, ve o videonun tamamında): klon "Kanal Anlatıcısı TR (Orion)" — `voice_type: element`, `voice_id: 3eaa6f8d-3fac-477d-8d17-eb55bf561917`. Klon Orion'dan ~2.5 yarım ton daha tizdir; aynı videoda iki ses karıştırılmaz.
- Üretim kuralları ve test sonuçları: `zanzibar_1896/assets/voice/SES_KIMLIGI.md`
  - Cümle cümle üretim, duraklamalar kodla.
  - Özel isimler TTS'e Türkçe okunuşla, sayılar yazıyla; ekranda/altyazıda özgün yazım.
  - Hafif tempo (perde korunarak): genel 1.02, gerilim bölümleri 1.04–1.065, final 1.0.
  - Telaffuz Whisper ile denetlenir; hatalı segment küçük ifade/noktalama değişikliğiyle yeniden üretilir.

## Örnek proje

`zanzibar_1896/` ilk videodur (Remotion + yerel ses sentezi + Higgsfield destek klipleri). Yeni videolar ayrı bir klasörde, bu projenin yapısı ve betikleri (`tools/`) örnek alınarak hazırlanabilir. Ayrıntılar: `zanzibar_1896/README.md`.

## Ortam notları

- Higgsfield çıktılarını indirmek için "sercan" bulut ortamı gerekli hostlara izin verir (upload.higgsfield.ai, cdn.higgsfield.ai ve Higgsfield CloudFront alan adları, openaipublic.azureedge.net).
- GitHub LFS yüklemesi ağda engelli: depoya konan her dosya 100 MB'ın altında olmalı.
