# Çılgın Çiftlik Derbisi — Kurulum Rehberi

Bu rehber adım adım gider. Bir adımı bitirmeden diğerine geçme.

---

## 1. Oyunu bilgisayarına indir

1. GitHub'da projeni aç, sol üstten dalı (branch) seç: `ccr-56bcc959-1o922c`.
2. Yeşil **Code** düğmesine tıkla → **Download ZIP**.
3. İnen ZIP dosyasına sağ tıkla → **Tümünü ayıkla**.
4. İçindeki **`ciftlik-derbisi`** klasörünü `Belgeler` klasörüne taşı.
   Sonuç: `Belgeler\ciftlik-derbisi\BASLAT.bat` gibi dosyalar görmelisin.

> Klasörün içinde ne var?
> - `BASLAT.bat` → oyunu başlatır
> - `FON-TEMIZLE.bat` → yeni video kliplerin mavi fonunu siler
> - `config.js` → bütün ayarlar (süreler, hediye eşikleri, küfür listesi…)
> - `assets\` → görseller ve videolar
> - `veri\` → "Efsaneler" kaydı (burayı silme)

---

## 2. Oyunu başlat

1. `ciftlik-derbisi` klasöründe **`BASLAT.bat`** dosyasına çift tıkla.
2. Mavi bir "Windows bilgisayarınızı korudu" uyarısı çıkarsa: **Ek bilgi** → **Yine de çalıştır**.
3. Siyah bir pencere açılır ve şunu yazar: `ÇILGIN ÇİFTLİK DERBİSİ ÇALIŞIYOR`.
4. Tarayıcı kendiliğinden açılır ve oyun **test paneliyle** gelir.

> ⚠️ **Siyah pencereyi yayın boyunca KAPATMA.** O pencere oyunu çalıştıran küçük sunucudur.
> Küçültebilirsin (alt çizgi `_` düğmesi), ama kapatırsan oyun durur.

> ⚠️ `index.html` dosyasına doğrudan çift tıklama. Oyun her zaman `http://localhost:8787/` adresinden açılmalı.

---

## 3. Test panelini kullan (yayın açmadan deneme)

Adres: **`http://localhost:8787/?test=1`** (BASLAT.bat bunu zaten açar)

Sağ üstte bir panel çıkar:

| Düğme | Ne yapar |
|---|---|
| 💬 Sahte yorum | Rastgele isimli biri rastgele hayvana katılır |
| ❤️ Beğeni | Yarışan birinin hayvanını biraz iter, topluluk barını doldurur |
| ➕ Takip / 🔁 Paylaşım | Bir kerelik hız |
| 1 / 5 / 10 / 30 / 100 / 500 | O değerde sahte hediye (hız, muz, roket, havuç, leylek, Ağa) |
| 🌹 TikFinity seri hediye | TikFinity'nin gönderdiği gibi "Gül x7" serisi (7 jeton bir kez sayılmalı) |
| 👥 200 sahte izleyici | Yoğun yayın testi (aç/kapat) |
| 🔌 Bağlantıyı kopar | TikFinity bağlantısı koparsa oyunun durmadığını görürsün |
| ⏭ Sonraki faz | Lobiyi/yarışı hızlıca geçer |
| Hız x1 / x5 / x20 | Oyunu hızlandırır (deneme için) |
| 🧹 Sıfırla | "Bu gece" ya da tüm skorları sıfırlar |

Panelin en üstündeki **ışık** TikFinity bağlantısını gösterir:
🟢 bağlı · 🟡 bağlanıyor · 🔴 bağlı değil

> Panel ve ışık **sadece adreste `?test=1` varken** görünür. Yayına koyduğun adreste (`http://localhost:8787/`) görünmezler.

---

## 4. TikFinity'yi kur ve bağla

TikFinity, TikTok yayınındaki yorum/beğeni/hediye bilgilerini bilgisayarındaki oyuna iletir.

1. **[tikfinity.zerody.one](https://tikfinity.zerody.one)** adresinden TikFinity'yi indir ve kur (ücretsiz).
2. TikFinity'yi aç, TikTok **kullanıcı adınla** bağlan (yayın açıkken canlı olaylar gelmeye başlar).
3. TikFinity'nin ayarlarında **WebSocket / Event API** bölümünü bul ve açık olduğundan emin ol.
   Orada yazan adres genelde **`ws://localhost:21213/`** olur.
4. Adres farklıysa: `config.js` dosyasını **Not Defteri** ile aç, şu satırı bul ve adresi düzelt:
   ```
   adres: "ws://localhost:21213/",
   ```
   Kaydet, oyun sayfasını yenile (F5).
5. Oyunu `http://localhost:8787/?test=1` ile aç: ışık 🟢 **BAĞLI** olmalı.

**Yayın açmadan nasıl denerim?**
- Önce test panelindeki düğmelerle oyunu dene (yukarıdaki tablo).
- TikFinity'de olayları deneme/simülasyon özelliği varsa (ör. bir "Test" düğmesi), ona bas: oyun ışığındaki **mesaj sayısı** artmalı ve ekranda bildirim çıkmalı.
- Asıl kesin deneme: ayrı **deneme hesabınla** kısa bir yayın aç, telefondan başka bir hesapla `tavuk` yaz.

---

## 5. Oyunu TikTok LIVE Studio'ya ekle (1080x1920)

1. TikTok LIVE Studio'yu aç. Yayın düzenini **dikey (portre)** yap.
2. Kaynak ekle (**+ / Add source**) → **Link / Tarayıcı / Browser** kaynağını seç.
3. Adres (URL): **`http://localhost:8787/`** ← sonunda `?test=1` OLMASIN.
4. Genişlik **1080**, yükseklik **1920**.
5. Kaynağı tüm ekranı kaplayacak şekilde yerleştir.

**OBS kullanıyorsan:**
Kaynaklar → **+** → **Tarayıcı** → URL `http://localhost:8787/`, Genişlik `1080`, Yükseklik `1920`.
"Görünür olmadığında kaynağı kapat" kutusunu **işaretleme** (yoksa oyun her seferinde baştan başlar).

> Sıra önemli: **önce BASLAT.bat**, sonra TikFinity, sonra LIVE Studio.

---

## 6. Ayarları değiştir (`config.js`)

`config.js` dosyasına sağ tıkla → **Birlikte aç** → **Not Defteri**.
Her ayarın yanında Türkçe açıklama var. Sadece `:` işaretinin **sağındaki** değeri değiştir.

Sık değiştirilenler:
- `lobi: 45` → lobi süresi (saniye)
- `yarisHedef: 75` → yarışın yaklaşık süresi
- `begeniBariHedef: 1000` → Çamur Yağmuru için gereken beğeni
- `hediyeEfektleri` → hangi jetonda hangi efekt
- `kufurListesi` → engellenecek kelimeler (küçük harf, Türkçe karakter olmadan)
- `dil: "tr"` → `"en"` yaparsan ekran yazıları İngilizce olur

Kaydet (Ctrl+S) ve oyun sayfasını yenile (F5). Bir şey bozulursa: virgül veya tırnak eksik kalmış olabilir; GitHub'dan `config.js`'i yeniden indir.

---

## 7. Görseller ve videolar

Oyun `assets` klasöründeki dosyaları **kendiliğinden** kullanır. Dosya yoksa emoji gösterir.
Yeni dosya koyarsan oyun bir sonraki **lobide** fark eder (yeniden başlatmana gerek yok).

```
assets\pist\uzak.png        gökyüzü ve tepeler
assets\pist\zemin.png       pist zemini
assets\pist\onplan.png      çit ve çimen (şeffaf)
assets\ekran\lobi.png       lobi arka planı
assets\ekran\kursu.png      kürsü arka planı
assets\ekran\logo.png       oyun logosu
assets\klip\start.mp4       (isteğe bağlı) start klibi
assets\hayvan\tavuk\karakter.png   karakter görseli
assets\hayvan\tavuk\kos.webm       koşu döngüsü (şeffaf)
assets\hayvan\tavuk\kay.mp4        (isteğe bağlı) kayma klibi, mavi fon
assets\hayvan\tavuk\kazandi.mp4    (isteğe bağlı) tam ekran kutlama
assets\efekt\muz.png, roket.png, havuc.png, leylek.png, camur.png
assets\ses\  (isteğe bağlı) duduk.mp3, kazanan.mp3, tavuk.mp3 ...
```
Hayvan klasör adları: `tavuk`, `kaplumbaga`, `keci`, `ordek`, `domuz`, `inek`, `esek`, `kirpi`.

**Mavi fonlu yeni bir klip eklediysen** (`kos.mp4` ya da `kay.mp4`):
1. Klibi doğru klasöre koy.
2. **`FON-TEMIZLE.bat`**'a çift tıkla. Mavi fonu silip `kos.webm` / `kay.webm` yapar.
   Koşu klibinde başı ve sonu en iyi birleşen parçayı da keser.
3. ffmpeg yoksa araç sana nasıl kuracağını Türkçe anlatır (kısaca: PowerShell'de `winget install --id Gyan.FFmpeg -e`).

> `.webm` yapmasan bile oyun mavi fonu kendisi siler; `FON-TEMIZLE` sadece daha temiz ve hafif sonuç verir.

**Sesler:** `assets\ses\` klasörüne `duduk.mp3` (start), `kazanan.mp3`, `geri-sayim.mp3`, `muz.mp3`, `roket.mp3`, `havuc.mp3`, `leylek.mp3`, `camur.mp3`, `aga.mp3`, `katil.mp3` ya da hayvan adıyla (`inek.mp3`) dosya koyarsan çalar. Yoksa oyun sessiz çalışır.

---

## 8. Sık sorunlar ve çözümleri

| Sorun | Çözüm |
|---|---|
| BASLAT.bat açılıp hemen kapanıyor | Klasörü `Belgeler`'e taşıdığından emin ol. Siyah pencerede "port kullanılamadı" yazıyorsa oyun zaten açıktır: diğer siyah pencereyi kapat, tekrar dene. |
| Tarayıcıda "Bu siteye ulaşılamıyor" | Siyah pencere kapalı. BASLAT.bat'ı yeniden çalıştır. |
| Ekran siyah / boş | Sayfayı yenile (F5). LIVE Studio'da kaynağa sağ tıkla → yenile. Adresin `http://localhost:8787/` olduğundan emin ol. |
| Işık 🔴 BAĞLI DEĞİL | TikFinity açık mı? TikFinity'de WebSocket/Event API açık mı? Adres `config.js` ile aynı mı? Oyun 3 saniyede bir kendiliğinden yeniden dener. |
| Yorum yazınca kimse katılmıyor | Yorum hayvan adı ya da 1–8 arası tek numara olmalı (`tavuk`, `3`). Küfürlü yorumlar yok sayılır. |
| Görseller çıkmıyor, emoji görünüyor | Dosya adları ve klasörler yukarıdaki listeyle **birebir** aynı olmalı (küçük harf, Türkçe karakter yok). Bir sonraki lobiyi bekle. |
| Koşu klibinde mavi kenar kalıyor | `FON-TEMIZLE.bat`'ı çalıştır. Eski `.webm` varsa önce onu sil. |
| Oyun yavaş / takılıyor | Diğer programları kapat. LIVE Studio'da kaynağın 1080x1920'den büyük olmadığına bak. |
| Efsaneleri yedeklemek istiyorum | `veri\kayit.json` dosyasını kopyala. (Otomatik yedek: `veri\kayit.yedek.json`) |
| "Bu gece" tablosunu sıfırlamak | Test panelinde 🧹 düğmesi. Ayrıca 6 saat oyun açılmazsa yeni yayın sayılır ve kendiliğinden sıfırlanır. |

---

## 9. Yayın kuralları (oyuna gömülü)

- Ekranda **hiçbir zaman** "hediye at", "jeton gönder", "destek ol" gibi yazı yok; hediye menüsü yok.
- Ekrandaki yönlendirmeler sadece ücretsiz eylemler: yorum yaz, beğen.
- Bahis, kumar, iddaa, gerçek para ödülü yok.
- Çiftlik Ağası yarışı otomatik kazanmaz; sadece görünür statü (taç + start bayrağında isim).
