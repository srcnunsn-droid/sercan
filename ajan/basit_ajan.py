"""
Basit Ajan Örneği — "Prompt Asistanı"
======================================

Bir ajan = LLM (Claude) + Araçlar (tools) + Döngü (loop).

1. Kullanıcı bir istek yazar.
2. Claude isteği okur; gerekirse bir "araç" çağırmak istediğini söyler
   (stop_reason == "tool_use").
3. Biz o aracı KENDİ bilgisayarımızda çalıştırır, sonucu Claude'a geri yollarız.
4. Claude sonucu görür; ya başka bir araç ister ya da son cevabı verir
   (stop_reason == "end_turn").

Bu dosyadaki ajan, depodaki JSON dosyalarını (styles.json, negative_bank.json)
okuyarak Midjourney tarzı görsel promptları hazırlamaya yardım eder.

Çalıştırma:
    pip install -r ajan/requirements.txt
    export ANTHROPIC_API_KEY="sk-ant-..."
    python ajan/basit_ajan.py
"""

import json
from pathlib import Path

import anthropic

# ---------------------------------------------------------------------------
# 1) AYARLAR
# ---------------------------------------------------------------------------
MODEL = "claude-opus-5"
MAX_ADIM = 10  # Bir soruda en fazla kaç araç turu atılabilir (sonsuz döngü koruması)
VERI_KLASORU = Path(__file__).resolve().parent.parent  # Deponun kök klasörü

SISTEM_TALIMATI = """Sen Türkçe konuşan bir görsel prompt asistanısın.
Kullanıcının Midjourney benzeri araçlar için İngilizce prompt yazmasına yardım edersin.
Stil ve negatif kelimeler için uydurma; her zaman araçları kullanarak depodaki verilere bak.
Cevabın sonunda hazır prompt'u ve negatif kelimeleri ayrı ayrı göster."""

client = anthropic.Anthropic()  # Anahtarı ANTHROPIC_API_KEY ortam değişkeninden okur


# ---------------------------------------------------------------------------
# 2) ARAÇLAR (TOOLS)
#    Her araç = normal bir Python fonksiyonu + Claude'a gösterilen bir tanım.
# ---------------------------------------------------------------------------
def json_oku(dosya_adi: str):
    with open(VERI_KLASORU / dosya_adi, encoding="utf-8") as f:
        return json.load(f)


def stilleri_listele() -> str:
    """Mevcut stil adlarını döndürür."""
    return json.dumps(list(json_oku("styles.json").keys()), ensure_ascii=False)


def stil_detayi(stil_adi: str) -> str:
    """Bir stilin anahtar kelimelerini döndürür."""
    stiller = json_oku("styles.json")
    for ad, kelimeler in stiller.items():
        if stil_adi.lower() in ad.lower():
            return json.dumps({"stil": ad, "kelimeler": kelimeler}, ensure_ascii=False)
    return f"HATA: '{stil_adi}' adında bir stil bulunamadı. Önce stilleri_listele aracını kullan."


def negatif_kelimeler() -> str:
    """Görselde istenmeyen şeylerin listesini döndürür."""
    return json.dumps(json_oku("negative_bank.json"), ensure_ascii=False)


# Claude'un göreceği araç tanımları (isim + açıklama + parametre şeması)
ARACLAR = [
    {
        "name": "stilleri_listele",
        "description": "Depodaki tüm görsel stil adlarını listeler.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "stil_detayi",
        "description": "Verilen stilin prompt'a eklenecek anahtar kelimelerini getirir.",
        "input_schema": {
            "type": "object",
            "properties": {
                "stil_adi": {
                    "type": "string",
                    "description": "Stil adı veya bir parçası, örn. 'Cinematic'",
                }
            },
            "required": ["stil_adi"],
        },
    },
    {
        "name": "negatif_kelimeler",
        "description": "Prompt'un negatif kısmına eklenecek istenmeyen öğeleri getirir.",
        "input_schema": {"type": "object", "properties": {}},
    },
]

# Araç adı -> Python fonksiyonu eşlemesi
ARAC_FONKSIYONLARI = {
    "stilleri_listele": stilleri_listele,
    "stil_detayi": stil_detayi,
    "negatif_kelimeler": negatif_kelimeler,
}


def araci_calistir(ad: str, girdi: dict) -> str:
    fonksiyon = ARAC_FONKSIYONLARI.get(ad)
    if fonksiyon is None:
        return f"HATA: bilinmeyen araç '{ad}'"
    return fonksiyon(**girdi)


# ---------------------------------------------------------------------------
# 3) AJAN DÖNGÜSÜ
# ---------------------------------------------------------------------------
def ajan_calistir(mesajlar: list) -> str:
    """Claude araç istemeyi bırakana kadar döner, son cevabı döndürür.

    `mesajlar` konuşma geçmişidir; bu fonksiyon onu yerinde günceller,
    böylece ajan önceki soruları "hatırlar".
    """
    for adim in range(1, MAX_ADIM + 1):
        yanit = client.beta.messages.create(
            model=MODEL,
            max_tokens=16000,
            system=SISTEM_TALIMATI,
            tools=ARACLAR,
            messages=mesajlar,
            # Güvenlik filtresi isteği reddederse, API aynı isteği otomatik
            # olarak önerilen başka bir modelde tekrar dener.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )

        # Claude'un cevabını (araç çağrıları dahil) geçmişe ekle
        mesajlar.append({"role": "assistant", "content": yanit.content})

        if yanit.stop_reason == "refusal":
            return "(Model bu isteği yanıtlamayı reddetti.)"

        if yanit.stop_reason != "tool_use":
            # end_turn / max_tokens: ajan işini bitirdi
            return "".join(b.text for b in yanit.content if b.type == "text")

        # Claude bir veya daha fazla araç istedi -> çalıştır, sonuçları topla
        sonuclar = []
        for blok in yanit.content:
            if blok.type == "tool_use":
                print(f"  [adım {adim}] araç: {blok.name}({blok.input})")
                sonuclar.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": blok.id,
                        "content": araci_calistir(blok.name, blok.input),
                    }
                )

        # Tüm sonuçlar TEK bir kullanıcı mesajında geri gönderilir
        mesajlar.append({"role": "user", "content": sonuclar})

    return "(Adım sınırına ulaşıldı, ajan durduruldu.)"


# ---------------------------------------------------------------------------
# 4) SOHBET ARAYÜZÜ
# ---------------------------------------------------------------------------
def main():
    print("Prompt Asistanı hazır. Çıkmak için 'q' yaz.\n")
    gecmis = []
    while True:
        try:
            soru = input("Sen: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if soru.lower() in {"q", "quit", "çık", "cik"}:
            break
        if not soru:
            continue
        gecmis.append({"role": "user", "content": soru})
        print(f"\nAjan: {ajan_calistir(gecmis)}\n")


if __name__ == "__main__":
    main()
