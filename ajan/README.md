# Basit Ajan Örneği: Prompt Asistanı

Bu klasör, Claude API ile yazılmış **tek dosyalık** bir ajan içerir: `basit_ajan.py`.
Ajan, depodaki `styles.json` ve `negative_bank.json` dosyalarını okuyarak
görsel promptları hazırlamaya yardım eder.

## Ajan nedir?

Normal bir sohbet botu yalnızca metin üretir. Bir **ajan** ise buna ek olarak:

| Parça | Bu örnekte nerede? | Görevi |
|---|---|---|
| **Model (beyin)** | `MODEL = "claude-opus-5"` | Ne yapılacağına karar verir |
| **Talimat** | `SISTEM_TALIMATI` | Ajanın rolünü ve kurallarını belirler |
| **Araçlar (eller)** | `stilleri_listele`, `stil_detayi`, `negatif_kelimeler` | Dış dünyaya dokunan Python fonksiyonları |
| **Döngü** | `ajan_calistir()` | Model araç istedikçe çalıştırıp sonucu geri verir |
| **Hafıza** | `gecmis` listesi | Önceki mesajları saklar |

Döngünün akışı:

```
Kullanıcı sorusu
     │
     ▼
 Claude'a gönder ──► stop_reason == "tool_use" ? ──evet──► aracı çalıştır ──┐
     ▲                         │                                             │
     │                        hayır                                          │
     │                         ▼                                             │
     │                   son cevabı göster                                   │
     └──────────────────── tool_result'ı geçmişe ekle ◄─────────────────────┘
```

## Çalıştırma

```bash
pip install -r ajan/requirements.txt
export ANTHROPIC_API_KEY="sk-ant-..."     # https://console.anthropic.com adresinden alınır
python ajan/basit_ajan.py
```

Örnek soru:

```
Sen: Kahve markam için sinematik bir Instagram görseli promptu yaz
  [adım 1] araç: stilleri_listele({})
  [adım 2] araç: stil_detayi({'stil_adi': 'Cinematic'})
  [adım 2] araç: negatif_kelimeler({})

Ajan: ...hazır prompt...
```

`[adım ...]` satırları, ajanın kendi kararıyla hangi aracı çağırdığını gösterir.

## Ajanı yönetmek (değiştirmek) için

- **Yeni araç eklemek:** Bir Python fonksiyonu yaz, `ARACLAR` listesine tanımını
  (isim, açıklama, `input_schema`) ekle, `ARAC_FONKSIYONLARI` sözlüğüne kaydet.
  Claude, açıklamaya bakarak aracı ne zaman kullanacağına kendisi karar verir.
- **Davranışını değiştirmek:** `SISTEM_TALIMATI` metnini düzenle.
- **Güvenlik / maliyet sınırı:** `MAX_ADIM` bir soruda en fazla kaç tur araç
  çağrılabileceğini sınırlar.
- **Hafızayı sıfırlamak:** Programı yeniden başlat (`gecmis` boşalır).

## Sonraki adımlar

1. `platforms.json` dosyasındaki CTA'ları okuyan bir araç ekle.
2. Hazırlanan promptu dosyaya kaydeden bir `prompt_kaydet` aracı ekle.
3. Döngüyü elle yazmak yerine SDK'nın hazır "tool runner" yardımcısını dene.
