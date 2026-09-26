# Seedance Sinematik Prompt Havuzu — Kullanım Rehberi

Bu havuz Seedance 2.0 ve 2.5 için hazır ve **doğrulanmış** sinematik video promptları üretir. İçeriği:

- **48 karakter**, 12 kategoride. Farklı ten renkleri, beden tipleri, protez kullanan sporcu, tekerlekli sandalyede dansçı, tesettürlü içerik üreticisi, Türk ve Anadolu arketipleri, hayvanlar ve yaratıklar var.
- **43 viral sahne tarifi**. Her birinde hook, platform önerisi, kamera dili, lens, ışık, fizik ve ses tanımlı.
- **Otomatik birleştirici.** Seçtiğin sahneyle karakteri 16 slotluk profesyonel prompt iskeletine yerleştirir.
- **Doğrulayıcı.** Her sahneyi, oynayabilecek her karakterle iki sürümde üretip kurallara göre kontrol eder. Şu an 1176 kombinasyonun hepsi hatasız.

Karakter ve sahnelerin tam listesi için: [`seedance/KATALOG.md`](seedance/KATALOG.md)
Kopyalanmaya hazır 86 prompt için (43 sahne × 2 sürüm): [`prompts/README.md`](prompts/README.md)

---

## 0. Uygulama: Seedance Stüdyo (kurulum gerektirmez)

**`app/seedance-studio.html`** dosyasını indirip çift tıklaman yeterli. Tarayıcıda açılır ve internet olmadan da çalışır. Telefonda da açılır.

1. **Sahne.** Kategori seç veya ara ("terlik", "ejderha"...). Listeden sahneye tıkla.
2. **Oyuncular.** Her rol için o sahneye uyan karakterlerden birini seç. "Oyuncuları karıştır" yeni bir kadro kurar. "Rastgele viral kombinasyon" hem sahneyi hem kadroyu rastgele seçer. "Kimlik metnini kopyala" ile karakterin referans görselini üretmek için gereken tanımı alırsın.
3. **Ayarlar.** Seedance 2.0 veya 2.5, görüntü yönetmeni stili ve negatif prompt seçimi.
4. **Promptu kopyala** ve Seedance'e yapıştır. Görselleri "Referans yükleme sırası" listesindeki sırayla yükle.

Uygulama son seçimlerini tarayıcında hatırlar. Karakter veya sahne JSON'larını değiştirirsen uygulamayı yeniden üret:

```bash
python3 tools/build_app.py
```

## 1. Hazır promptu dosyadan kopyala

1. `prompts/2.0/` klasörünü aç. Seedance 2.5 kullanıyorsan `prompts/2.5/` klasörünü aç.
2. Bir sahne dosyası seç, örneğin `terlik_anne.md`.
3. Dosyanın içinde sırasıyla şunlar var:
   - **Başlık ve süre**
   - **Referans listesi.** Görselleri Seedance'e bu sırayla yükle: `@Image 1`, `@Image 2`...
   - **Prompt bloğu.** Tamamını kopyala ve yapıştır.
   - **NEGATIVE PROMPT bloğu** (isteğe bağlı). Negatif alanı varsa oraya yapıştır.

> Karakter referans görsellerini henüz üretmediysen, önce karakterin `asset` satırını bir görsel modelinde (Nano Banana Pro, Soul vb.) kullanarak kimlik plakası çıkar. Promptun gücü, referans görselin tutarlılığından gelir.

## 2. Karakter değiştir, sonsuz içerik üret

Terminalde (Python 3, ek kurulum gerekmez):

```bash
# Tüm sahneleri listele
python3 tools/seedance_compose.py --list-scenes

# Bir kategorideki karakterleri listele
python3 tools/seedance_compose.py --list-characters --category turkiye

# Bir sahnede hangi karakterler oynayabilir?
python3 tools/seedance_compose.py --fits rooftop_gap_jump

# Çatı atlayışını Viking kalkan kızıyla, Seedance 2.5 için, negatif promptla üret
python3 tools/seedance_compose.py --scene rooftop_gap_jump --cast A=fan_03 --version 2.5 --negative

# Farklı bir sinematografi stili dene (hoytema, deakins, lubezki, doc16, neon_noir, large_format)
python3 tools/seedance_compose.py --scene karakoy_street_walk --style neon_noir

# Rastgele 10 viral kombinasyon üret ve dosyaya yaz
python3 tools/seedance_compose.py --random 10 --seed 42 --negative --out fikirler.md
```

## 3. Sürüm farkı: 2.0 mı 2.5 mi?

| | Seedance 2.0 | Seedance 2.5 |
|---|---|---|
| Görsel referans | en fazla 9 | en fazla 50 |
| Süre | en fazla 15 sn | en fazla 30 sn |
| Karakter başına referans | 1 kimlik görseli | 3 görsel (ön, profil, kıyafet/detay) |

Tüm sahneler 15 saniyenin altında olduğu için iki sürümde de çalışır. 2.5'te her karakter üç açıdan referans alır, bu yüzden yüz ve kıyafet çok daha sağlam tutar.

## 4. Promptlar neden hatasız? (16 slot iskeleti)

Her prompt sabit bir sırayla yazılır:

1. **HEADER.** Çekim sayısı, zaman kodları, kesme ve hız politikası (istenmeyen yavaş çekim olmaz).
2. **STYLE PREFIX.** 8K fotogerçekçilik, "3D render değil" dörtlüsü, 24fps ve 1/48 obtüratör. Titreme ve morph önlenir.
3. **NO ON-SCREEN TEXT.** Altyazı, logo ve filigran çıkmaz.
4. **CRITICAL blokları** (en fazla 4). Sahnenin en kolay bozulan unsuru kilitlenir: "tepsi asla düşmez", "terlik ıskalar" gibi.
5. **ASSETS.** Karakter kimliği, bu sahnedeki eylemi ve "%100 referansa uy" ibaresi.
6. **GEOMETRY MAP.** Kim nerede duruyor, hangi derinlik düzleminde.
7. **FIRST FRAME.** Boş açılış karesi olmaz, aksiyon ilk karede başlar.
8. **OPTICS.** Her çekim için FOV derecesiyle lens kilidi.
9. **CAMERA.** Sabit, hafif, ağır veya şiddetli el kamerası.
10. **LIGHT & COLOUR.** Yön ve sıcaklık, kaynağıyla birlikte %70/20/10 renk dağılımı.
11. **ATMOSPHERE.** Derinlik düzlemleri. Kaynağı olmayan duman ya da sis yok.
12. **ACTION TIMING.** Saniye saniye eylem. Kadrajdaki her beden her an bir şey yapar.
13. **PHYSICS.** Kütle, temas, deformasyon. Hiçbir şey süzülmez veya kaymaz.
14. **ACTING.** Kaş ve alın mikro ifadeleri, bakış yönü.
15. **AUDIO.** Sadece diegetik ses. **NO BGM** ile üretilen müzik engellenir.
16. **LOCKS.** Olay zinciri, kalıcı işaretler ve cilt koruması.

Ek kurallar:
- Prompt gövdesinde **isim yoktur**. Karakter "the runner in the olive utility vest" gibi görünür tarifle anılır.
- En-boy oranı yazılmaz, onu arayüzden seçersin.
- Prompt gövdesi İngilizcedir. Türkçe diyaloglar tırnak içinde kalır ve THE LANGUAGE bloğuyla korunur.

## 5. Kendi karakterini ekle

`seedance/characters.json` dosyasına yeni bir kayıt ekle:

```json
{
  "id": "tr_05",
  "category": "turkiye",
  "label_en": "Black Sea horon dancer",
  "label_tr": "Karadeniz horoncusu",
  "viral_tr": "Horonun titreyen omuzları; yöresel dans trendi.",
  "pronoun": "he",
  "human": true,
  "descriptor": "the dancer in the black zıpka",
  "permanent": ["black zıpka trousers", "silver chain across the vest"],
  "asset": "178cm, lean build, ... (45–110 kelime: boy, beden, ten, yüz, saç, kalıcı işaretler, makyaj, temiz yüz negasyonları, kıyafet, takı, ses)"
}
```

Kurallar:
- `descriptor` benzersiz olmalı ve `the` ile başlamalı.
- `asset` içinde isim geçmemeli ve 45 ile 110 kelime arasında olmalı.
- Göz rengi gibi kolay kayan özellikleri büyük harfle yaz ve negasyonunu ekle: `BROWN eyes, never blue`.

## 6. Kendi sahneni ekle

`seedance/scenes/<kategori>.json` içindeki mevcut bir sahneyi kopyalayıp değiştir.

- Metinlerde karakter yerine `{A}`, `{B}` kullan.
- Zamirler için `{A.sub}` (she/he/it), `{A.obj}`, `{A.pos}`, `{A.ref}` kullan. Cümle başında `{A.Sub}` yaz.
- Kıyafete özgü ifadelerden kaçın ("örgüler savrulur" yerine "saç savrulur"). Böylece sahne başka karakterlerle de çalışır.
- Toplam süre 15 saniyeyi geçmesin (2.0 uyumu).

## 7. Her değişiklikten sonra

```bash
python3 tools/validate.py                      # hepsi OK olmalı
python3 tools/seedance_compose.py --build-examples   # prompts/ ve KATALOG.md yenilenir
python3 tools/build_app.py                           # app/seedance-studio.html yenilenir
```

Doğrulayıcı şunları yakalar:
- Eksik alan
- Bozuk JSON
- Lens merdiveni dışında FOV
- Süre veya referans sınırı aşımı
- 4'ten fazla CRITICAL blok
- Açıkta kalan `{A}`
- En-boy oranı, Çince/Korece karakter
- Prompt gövdesine sızan karakter adı
- "no music" yazımı (doğrusu NO BGM)
- ACTION TIMING'de eylemi olmayan karakter
- manifest.json'da listelenmemiş dosya

## 8. Online uygulama (manifest)

`manifest.json` bu depoya (`srcnunsn-droid/sercan`, `main` dalı) göre hazırlandı. Uygulamada **Manifest URL** alanına şunu yapıştır:

```
https://raw.githubusercontent.com/srcnunsn-droid/sercan/main/manifest.json
```

Mevcut uygulama dosyaları (`styles.json`, `data.json`, `platforms.json`, `negative_bank.json`) da sinematik video kategorisi, lensler, ışıklar, kamera hareketleri ve viral konularla genişletildi. Yeni Seedance dosyaları manifest'e ek anahtarlarla (`seedance_*`) eklendi. Uygulama tanımadığı anahtarları görmezden gelir.
