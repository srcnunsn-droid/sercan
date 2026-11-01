# Master Prompt: SECO Film Atölyesi (Claude Code için)

Nov 1, 2026 · @sercan

## Nasıl kullanılır

Bu belge Claude Code'a verilecek ana talimattır: kodu o yazar, sen her fazı onaylarsın.

1. Belgeyi Markdown olarak dışa aktar ve boş bir proje klasörüne `MASTER_PROMPT.md` adıyla koy.
2. O klasörde Claude Code'u aç.
3. En alttaki **İlk mesaj** bölümünü yapıştır.
4. Claude Code her fazı bitirince sana gösterir ve sen onay vermeden sonraki faza geçmez.

Vizyondan arayüze kadar olan bölümler programın ne olacağını anlatır. **Eklemeler** bölümü senin düşünmediğin eksikleri, son iki bölüm çalışma düzenini içerir.

## Vizyon ve ürün tanımı

**SECO Film Atölyesi**, hem sinema ve prompt akademisi hem görsel-video üretim fabrikası olan tek bir uygulamadır: öğren, sahneyi canlı kur, hazır promptu al.

**Kullanıcı:** Türkçe konuşan, İngilizce bilmeyen, AI ile sinematik video üreten tek bir içerik üreticisi. Higgsfield (Soul, Seedance, Nano Banana), Google Flow gibi araçlarla çalışıyor ve uygulamayı telefon ile bilgisayarda kullanacak.

**Üç ana alan, tek ortak beyin:**

- **Akademi:** modüller, oyunlar, alıştırmalar, rütbeler.
- **Stüdyo:** 3D sahne, kamera, ışık ve animasyon laboratuvarı.
- **Fabrika:** karakter, mekân, başlangıç karesi ve video promptu üretim hattı.
- **Ortak beyin:** sahne grafı, kural motoru ve Claude katmanı.

**Değişmez ilkeler** (kullanıcının çalışma tarzı, her ekranda uygulanır):

1. Küçük adımlar, oyunlaştırma (puan, rütbe, mini oyun), bol alıştırma. Kullanıcı onaylamadan yeni konuya geçilmez.
2. Önce görseller (karakter sheet, mekân, başlangıç karesi), sonra video. Video promptu ancak kullanıcı isterse üretilir.
3. Arayüz Türkçe. Her İngilizce prompt yanında Türkçe karşılığıyla gelir, her terimin Türkçe açıklaması vardır.
4. Gözle görülen şey yazılır. "Epik", "gizemli" gibi görünmeyen kelimeler görünür karşılıklarına çevrilir.
5. Promptlar 5 kutuyla kurulur: Scene, Camera, Characters, Light, Environment.
6. Her prompta sabit satır eklenir: `No sharpen, no color bleeding, natural photographic texture.`
7. Referans görseller `@image-1`, `@image-2` formatında yazılır.
8. Her karakter için tek bir sheet promptu üretilir, çok adımlı zincir kurulmaz.

**Başarı ölçütü:** Kullanıcı bir fikri 15 dakikada karakter, mekân, kareler ve video promptlarıyla tamamlanmış bir sahne paketine çevirebilmeli, aynı programda ders çalışabilmeli.

## Hedef platform ve teknik kısıtlar

**Birincil hedef:** claude.ai'de yayınlanan tek sayfa Artifact. Böylece uygulama Claude ile aynı yerde, telefonda ve bilgisayarda açılır.

**Artifact ortamının kısıtları** (Claude Code bunları kodlamadan önce doğrulamalı):

- Sayfa en fazla 16 MB olmalı. Bu yüzden bütün kod ve kütüphaneler derlenip **tek HTML dosyasına gömülür**.
- Harici script yalnızca `cdnjs.cloudflare.com`, `cdn.jsdelivr.net/npm`, `unpkg.com` kaynaklarından, harici stil yalnızca Google Fonts'tan gelebilir. Tercih: hiçbir şeyi dışarıdan yükleme.
- `localStorage` güvenilmezdir (boş dönebilir, hata fırlatabilir). Her okuma ve yazma `try/catch` içinde olmalı. Kalıcı durum için Artifact'ın runtime yeteneklerini (veritabanı, Claude'a soru sorma, dosya depolama) kullan.
- API anahtarı kodun içinde asla bulunmaz.

**Önerilen teknoloji:** Vite, TypeScript, React, Zustand (durum), Three.js (3D), CSS değişkenleri veya Tailwind, `vite-plugin-singlefile` (tek dosya çıktı), Vitest (birim test), Playwright (duman testi).

**Yapay zekâ katmanı soyut olmalı:** tek bir `AIProvider` arayüzü ve üç uygulama.

1. `ClaudeArtifactProvider`: claude.ai Artifact runtime'ı üzerinden.
2. `ApiKeyProvider`: kullanıcının kendi anahtarıyla (yalnızca oturum belleğinde).
3. `MockProvider`: çevrimdışı çalışan şablon motoru.

**Talimat:** Claude Code, Artifact runtime'ının güncel belgelerini ve örneklerini önce araştırmalı. Varsayma, bulduklarını özetle.

**Mobil öncelikli:** 390 px genişlikten itibaren kusursuz çalışır, dokunma hedefleri en az 44 px olur, telefon alt gezinme çubuğu kullanır.

## Mimari ve veri modeli

Tüm ekranlar tek bir **sahne grafını** düzenler. 3D görünüm onu çizer, promptlar ondan derlenir, böylece bir değişiklik her yerde anında görünür.

&#91;embedded content: mimari · 3 ekran, tek sahne grafı, 3 hizmet\]

Üç ekran sahne grafını okur ve yazar. Kural motoru, prompt derleyici ve model adaptörleri ondan beslenir. 3D motoru, Claude katmanı ve depolama ortak altyapıdır.

**Ana varlıklar:** `Project`, `Part` (10 saniyelik parça), `Shot`, `Character`, `Location`, `LightRig`, `CameraRig`, `Dialogue`, `Motion`, `Asset`, `PromptBundle`, `Lesson`, `Exercise`, `Rule`, `Progress`.

```ts
interface Part {
  id: string; index: 0 | 1 | 2;          // 3 x 10 sn
  beat: 'durum' | 'catisma' | 'zirve';
  camera: { angle: Angle; lensMm: number; fStop: number; motion: Motion };
  light: { source: string; kelvin: number; hardness: 'sert' | 'yumusak'; direction: Dir };
  characters: CharacterRef[];            // sheet id + poz
  dialogue: { speaker: string; textTr: string; textEn?: string; atSec: number }[];
  startFrame?: AssetRef;                 // @image-1
}
```

**Kurallar:**

- Şema sürümlüdür (`schemaVersion`), eski projeler migrasyonla açılır.
- Her değişiklik bir komuttur: geri al ve yinele çalışır.
- Otomatik kayıt vardır. Proje JSON olarak içe ve dışa aktarılır (yedek).
- **Prompt derleyici deterministiktir:** şablon ve kurallarla çalışır. Claude yalnızca zenginleştirir veya eleştirir, yani Claude yokken de her prompt üretilir.
- Dersler, oyunlar, kurallar ve model kartları koddan ayrı JSON veya Markdown dosyalarında durur, arayüz onları okur.

## Akademi

Akademi, kullanıcının master müfredatının 7 modülünü ve ihtiyacına göre 3 ek modülü oyunlarla öğretir.

| Modül | Konu | Ana oyunlar |
| --- | --- | --- |
| M1 | Prompt iskeleti: 5 kutu, görünmeyen kelime, ışığın 5 parçası | Işık oyuncağı, Işık dedektifi, Işık ressamı, Renk ikizleri, Çelişki avcısı |
| M2 | Kamera: yükseklik, omuz üstü, POV, Dutch, hareketler, kadraj boyutu, lens, derinlik | Kamera kulübesi, Duygu yönetmeni, Kimin gözünden, Hareket stüdyosu, Lens değiştirici |
| M3 | 4 katmanlı ışık, ikinci zıt ışık, atmosfer | İki ışık tek sahne (afiş atölyesi), Sis ve hacim |
| M4 | Yapay görünümü kırma: gren, motion blur, lens lekesi, yasaklar | Gerçek mi yapay mı, Kusur ekleme |
| M5 | Karakter sürekliliği, kimlik kilidi, sheet | Sheet atölyesi, Aynı yüzü bul |
| M6 | Taslaktan master'a atölyesi | Taslak iyileştirme düellosu |
| M7 | Düzeltme istemleri, upscale, model adaptasyonu | Hata teşhisi, Model çevirmeni |
| M8 | Video: hareket, diyalog, süre, süreklilik, ses | Sahne planlayıcı, Süreklilik denetçisi |
| M9 | Hikâye ve duygu yapısı: kanca, 3 perde, short drama | Kanca atölyesi, Replik doktoru |
| M10 | Yayın paketi: ilk 3 saniye, 9:16, altyazı, thumbnail | Hook testi, Thumbnail düellosu |

**Ders yapısı.** Her ders 10 dakikayı geçmez ve 5 adımdır: animasyonlu canlı demo, oyun, kendi promptunu yaz ve değerlendirme, 2 soruluk mini sınav, "Stüdyoya aktar" butonu.

**Oyun motoru.** Oyunlar JSON şablonlarla tanımlanır. Soru tipleri: eşleştirme, slider ile ayar, çelişki bulma, iki seçenek düellosu, kendi cümleni yaz. Böylece Claude yeni içerik üretir ve kod değişmez.

**İlerleme.** XP, rütbe (çırak, usta, yönetmen), günlük seri, rozet. **Zayıf nokta haritası** hangi kuralın en sık ihlal edildiğini gösterir, **aralıklı tekrar kartları** onları pekiştirir.

**Konu kilidi.** Sonraki konu, kullanıcı "başla" demeden açılmaz. Ders bitince program bir öneri sunar, karar kullanıcıdadır.

**Güncel alıştırma.** "Yeni alıştırma üret" butonu Claude'dan konu, zorluk ve zayıf noktalara göre şemaya uygun bir alıştırma JSON'u ister. Şema doğrulanır, oyun motorunda oynanır. Günlük meydan okuma buradan gelir.

**Değerlendirme.** Kullanıcının yazdığı prompt rubrikle puanlanır: 5 kutunun doluluğu, ışığın 5 parçası, çelişki, görünmeyen kelime, süre. Önce öneri sunulur, kullanıcının metni ezilmez.

## Stüdyo: 3D sahne ve laboratuvar

Stüdyo, Blender'ın sinema odaklı, tarayıcıda çalışan sadeleştirilmiş bir karşılığıdır. Three.js ile yapılır. Gerçek Blender değildir ve `.blend` dosyası açmaz, ama Blender'a geçiş yolu vardır.

**Görünüm (viewport).** Orbit, kaydır, yakınlaştır. Nesne seçme, taşı, döndür, ölçekle (gizmo), ızgara ve yapışma. Üç görünüm: perspektif, kamera görünümü, yukarıdan. Kamera görünümünde 16:9, 9:16 ve 2.39:1 kadraj çerçevesi ile güvenli alan çizgileri.

**Sahne nesneleri.**

- Parametrik insan mankenleri ve poz ön ayarları: ayakta, oturan, el uzatan, sarılan, koşan, geri çekilen.
- Bakış yönü okları (omuz üstü ve POV için).
- Hazır mekân setleri: peron, sokak, oda, orman, taht salonu, köprü, mağara.
- Proplar: bank, tren, kapı, masa, lamba, bagaj arabası.
- Hava: sis, yağmur, kar parçacıkları.

**Kamera (gerçek lens mantığı).** Odak uzaklığı 14 ile 200 mm, sensör boyutu, f-stop ve alan derinliği. Yükseklik ve açı: low, eye level, high, bird's eye, Dutch. Kadraj boyutu (çok yakın plandan geniş plana) mankene göre otomatik hesaplanır. Kamera yolu anahtar karelerle ve easing ile çizilir: push-in, pull-out, pan, tilt, dolly, orbit, crane, el kamerası sallantısı.

**Işık.** Ana ışık (key), dolgu (fill), kenar (rim) ve sahne içi kaynaklar (mum, lamba, ekran, ateş). Tipler: spot, alan, nokta, güneş. Renk Kelvin ve ton ile, sertlik yarıçap ile ayarlanır. Işık yönü gizmosu, gölge, sahte hacimsel sis. Yüz önizlemesinde ışığın yüze nasıl vurduğu canlı görünür.

**Zaman çizelgesi.** 3 x 10 saniyelik parça, kaydırma çubuğu, oynat ve durdur. Replik şeritleri (kelime sayacı ve süre uyarısı), hareket şeritleri, ses notları.

**Çıktılar.**

1. **Referans kare:** renkli PNG, derinlik haritası ve poz çizimi, görsel modeline referans olarak (`@image-N`).
2. Kamera ve ışık ayarlarını otomatik **İngilizce prompt cümlesine** çevirme.
3. `.glb` dışa aktarma.
4. **Blender Python (`bpy`) betiği** dışa aktarma: aynı sahneyi gerçek Blender'da aç.
5. Paylaşılabilir proje JSON'u.

**Performans.** Mobilde düşük kalite modu, uyarlanabilir piksel oranı, hedef 30 fps, nesne sınırı, bellek temizliği (`dispose`).

**Animasyon.** Arayüz mikro animasyonları ve ders içi animasyonlu açıklamalar (lens yakınlaşması, ışık yörüngesi, kamera yolu) aynı animasyon motorunu kullanır. `prefers-reduced-motion` ayarına uyulur.

## Kamera ve görüntü dili kataloğu

Program, bilinen her kamera açısını, kadrajı, lensi, hareketi ve kompozisyon kuralını **bir katalogda** tutar, hepsini canlı gösterir ve prompta çevirir. Katalog kodda değil, `catalog/camera/*.json` dosyalarındadır.

| Kategori | Kayıtlar (hepsi katalogda bulunmalı) |
| --- | --- |
| Dikey açı | Extreme low (worm's eye), Low angle, Slightly low, Eye level, Slightly high, High angle, Bird's eye, Top-down (overhead) |
| Yatay konum | Önden, 3/4 önden, Profil, 3/4 arkadan, Arkadan takip |
| Eğim | Dutch angle, tam yatık (roll), whip tilt |
| Perspektif ve çekim tipi | Over-the-shoulder (tek ve çift), POV, nesne POV'u, Reverse shot, Two-shot, Three-shot, Group shot, Master shot, Insert, Cutaway, Reaction shot, Establishing shot, güvenlik kamerası, selfie ve found footage, ayna ve cam içinden (frame within frame) |
| Kadraj boyutu | Extreme close-up, Close-up, Medium close-up, Medium shot, Cowboy shot, Full shot, Wide shot, Extreme wide shot |
| Lens | Fisheye (8-14 mm), Ultra-wide (14-20), Wide (24-35), Normal (40-50), Portrait (85), Kısa tele (100-135), Tele (200 ve üzeri), Macro, Anamorphic, Tilt-shift, Probe lens, Vintage ve yumuşak lens |
| Kamera hareketi | Static (locked), Pan, Tilt, Push-in, Pull-out, Truck (yana), Pedestal (dikey), Crane ve jib, Orbit (arc), Handheld, Gimbal ve Steadicam takip, Whip pan, Crash zoom, Slow zoom, Dolly zoom (vertigo), Rack focus, Drone yükseliş ve ifşa, FPV dalış, 360 spin, Bullet time, Speed ramp, Time-lapse, Hyperlapse |
| Kompozisyon | Üçler kuralı, merkez simetri, yönlendirici çizgiler, çerçeve içinde çerçeve, negatif boşluk, headroom, lookroom, 180 derece kuralı, 30 derece kuralı, eyeline match, derinlik katmanları (ön, orta, arka), altın oran, diyagonal, dengeli ve dengesiz kadraj |
| Odak ve derinlik | Sığ alan derinliği, derin odak, split diopter, bokeh biçimleri, odak kayması, tilt-shift netlik düşüşü |
| Çerçeve oranı | 16:9, 9:16, 1:1, 4:5, 4:3, 1.85:1, 2.39:1, 2.76:1 |

**Her kayıt aynı şemayı doldurur:** kimlik, Türkçe ad, İngilizce ad, kısa Türkçe açıklama, izleyicide yarattığı duygular, ne zaman kullanılmaz, İngilizce prompt cümlesi, modele göre varyantlar, 3D parametreleri (kamera konumu, FOV, hareket anahtar kareleri), canlı animasyonlu demo, sık yapılan hatalar, ilgili ders ve oyun.

**Katalogla yapılan şeyler:**

- **Canlı demo:** her kayıtta kısa bir animasyon, aynı sahne farklı açıdan.
- **"Stüdyoya uygula":** 3D sahneyi o açıya, lense veya harekete getirir.
- **"Prompta ekle":** İngilizce cümleyi prompta yazar, Türkçe karşılığı yanında durur.
- **Duygudan kamera öner:** kullanıcı duyguyu seçer (güç, yalnızlık, panik, huzur), katalog açı, lens ve hareket kombinasyonları önerir.
- **Yan yana karşılaştırma:** aynı sahne 2 ila 4 farklı kamerayla bölünmüş ekranda görünür.
- **Arama ve filtre:** ada, kategoriye, duyguya göre, favoriler.
- **Genişletme:** yeni kayıt eklemek kod değil, JSON eklemektir.

**Kabul ölçütleri:** katalogda en az 100 kayıt vardır. Her kaydın tüm alanları dolu ve demosu çalışır (bunu bir test denetler). Faz 1'de en az 40 kayıtlık tohum katalog, Faz 2'de 2D demolar, Faz 3'te 3D demolar ve hareketler, Faz 6'da kalan kayıtlar tamamlanır.

## Fabrika: üretim hattı

Fabrika, kullanıcının elle yürüttüğü akışı bir sihirbaza çevirir. Adımlar sırayla kilitlidir ve **video adımı, görseller onaylanmadan açılmaz.**

1. **Fikir.** Claude ile fikir üretimi: viral potansiyel, ilk 3 saniyelik kanca, haftada 3-4 videoya sığacak yapılabilirlik.
2. **Hikâye ve duygu yayı.** 3 parça (durum, çatışma, zirve), replikler (kelime ve süre kontrolü, Türkçeden İngilizceye), her parçaya tek kamera hareketi.
3. **Karakter atölyesi.** Karakter başına **tek bir sheet promptu**. Seçenekli tasarım, canlı portre, düz gri zemin ve gölgesiz ışık (ışık sahnede kurulur, sheet'te kurulmaz). Üç panel: boydan önden, boydan profil, yüz portresi.
4. **Mekân atölyesi.** İnsansız mekân görseli. Zaman ve hava burada seçilir ve üç parçada da sabit kalır.
5. **Başlangıç kareleri.** Parça başına kamera, poz ve ışık yönü. Referans sırası sabittir: önce karakter sheet'leri (`@image-1`, `@image-2`), sonra mekân.
6. **Görsel onay kapısı.** Kullanıcı "görselleri onaylıyorum" demeden 7. adım kilitli kalır.
7. **Video promptları.** Seçilen model adaptörüne göre: 10 saniyelik parçalar, parça başına tek kamera hareketi, replik zaman damgaları, ortam sesi, süreklilik (bir parçanın son karesi sonrakinin başlangıç karesi olur).
8. **Düzeltme laboratuvarı.** Üretilen görsel veya videodan kare yükle. Claude sorunu teşhis eder (yüz kayması, ışık sıçraması, anatomi) ve düzeltme promptu yazar.
9. **Yayın paketi.** Kanca, altyazı, hashtag, thumbnail promptu, 9:16 güvenli alan, paylaşım zamanı.

**Proje şablonları.** Her şablon kendi akışını kullanır, hepsi tek kalıba zorlanmaz: duygusal diyaloglu 30 sn, epik savaş, reklam filmi, komedi ve parodi, short drama (kanca, bağlam, tırmanış, cliffhanger), stadyum ve kutlama reveal, motion transfer (Genjutsu), 3D animasyon dizi bölümü.

**Her adımda:** Türkçe ve İngilizce çıktı yan yana, tek tık kopyalama ve üretime gitmeden önce kısa kontrol listesi. Higgsfield veya başka bir araca doğrudan bağlantı varsayılmaz.

**Kredi ve maliyet.** Her üretim için tahmini kredi (kullanıcının düzenleyebildiği fiyat tablosu), proje toplamı ve deneme sayacı.

**Varlık kütüphanesi.** Karakterler, mekânlar, kareler, promptlar ve projeler: etiket, arama, sürüm geçmişi, yeni projede yeniden kullanma.

## Claude yapay zekâ katmanı

Claude, programın canlı öğretmeni ve yardımcı yönetmenidir. Dokuz görevi vardır, her biri şemalı girdi ve çıktıyla çalışır.

| Görev | Ne yapar | Çıktı |
| --- | --- | --- |
| `generateExercise` | Konu, zorluk ve zayıf noktalara göre yeni alıştırma üretir | Şemaya uygun JSON |
| `evaluatePrompt` | Kullanıcının promptunu rubrikle puanlar | Puan, gerekçe, önerilen sürüm |
| `suggestIdeas` | Viral, yapılabilir, anlamlı fikirler | 5 fikir, her biri ilk 3 saniye kancasıyla |
| `writeStoryPlan` | Fikri 3 parçalı duygu yayına çevirir | Parça planı, replik taslağı |
| `dialogueDoctor` | Replik süresini, doğallığını ve mantık hatalarını kontrol eder | Düzeltilmiş replik |
| `continuityAudit` | Kareler arası ışık, hava ve kıyafet çelişkilerini bulur | Uyarı listesi |
| `diagnoseResult` | Yüklenen görsel veya kareyi inceler | Sorun listesi, düzeltme promptu |
| `translateToEnglish` | Türkçeyi sinema sözlüğüne sadık İngilizceye çevirir | İngilizce prompt |
| `tutor` | Küçük adımlarla soru-cevap | Kısa, oyunlu açıklama |

**Tasarım ilkeleri:**

- **Claude zorunlu değildir.** Deterministik motor her zaman çalışır, Claude yoksa şablonlara düşülür.
- **Sistem promptu ders kurallarını taşır:** küçük adım, oyunlaştırma, kullanıcı söylemeden konu değiştirmeme, gözle görülen şey yazma, kullanıcı İngilizce bilmez.
- **Yapılandırılmış çıktı:** JSON şema doğrulaması, hatada bir kez yeniden deneme, olmazsa şablona düşme.
- **Kullanıcının kararını ezme:** Claude öneri sunar, uygulamayı kullanıcı seçer.
- **Maliyet ve hız:** çağrı sayacı, önbellek, minimum bağlam.
- **Gizlilik:** yüklenen görseller yalnızca o oturumda kullanılır, kullanıcı açıkça kaydetmedikçe kalıcı depolanmaz.
- **Prompt şablonları** ayrı dosyalarda (`prompts/*.md`) sürümlü ve düzenlenebilir durur.

## Kural motoru ve çelişki bekçisi

Kural motoru, sahne grafı ve prompt metni üzerinde çalışan deterministik bir denetleyicidir. **Akademi ve Fabrika aynı kuralları kullanır:** kullanıcı bir kuralı oyunda öğrenir, üretimde ihlal ederse aynı kural uyarır.

| Grup | Kural | Düzeltme önerisi |
| --- | --- | --- |
| Işık | Kaynak ile yön çelişmesin (tavan lambası aşağıdan vuramaz) | Yönü değiştir veya kaynağı elde tutulan ışık yap |
| Işık | Gölge, ışığın karşı tarafına düşer | Gölge yerini düzelt |
| Işık | Sert ışıkta gölge kenarı keskin, yumuşak ışıkta silik | Sertlik ile kenarı eşleştir |
| Işık | Kaynak rengi ile ışık rengi aynı olsun | Rengi kaynağa uydur |
| Süreklilik | Işık yönü, zaman ve hava parçalar arasında sabit | Sabit değeri kopyala |
| Kamera | Parça başına tek kamera hareketi | Fazla hareketi sil |
| Kamera | POV'da karakterin yüzü görünmez, omuz üstü iki karakter ister | Açıyı değiştir |
| Kamera | Hareketin sebebi olsun (duran karakterlerde pan uyarısı) | Yaklaşma veya sabit öner |
| Karakter | Görünmeyen kelime dedektörü (epik, güzel, gizemli, hüzünlü) | Görünür karşılığını öner |
| Karakter | Maske yüzü kapatıyorsa kaş ve ifade yazılmaz | Maskeyi burna çek veya ifadeyi sil |
| Replik | 14 kelimeye kadar rahat, 15-16 sıkışık, 16 üstü 10 saniyeye sığmaz | Kısalt |
| Replik | Mantık hatası (evlat edinme ile üvey aynı cümlede) | Tek kavramı seç |
| Referans | `@image-N` sırası ve sayısı model sınırına uysun | Sırayı düzelt |
| Metin | Her prompt Texture rule satırıyla bitsin | Satırı ekle |
| Uyarı | Gerçek kişi, ünlü yüzü, marka logosu, telifli karakter | Sarı bilgi uyarısı, karar kullanıcıda |

**Her kuralın alanları:** kimlik, ciddiyet (hata, uyarı, ipucu), Türkçe tek cümlelik neden, otomatik düzeltme önerisi, ilgili derse bağlantı ("bunu öğren").

**Test:** her kural için en az 3 olumlu ve 3 olumsuz birim test yazılır.

## Model adaptörleri

Aynı sahne grafı, hedef modele göre farklı prompta çevrilir. Her hedef, kodda sabit olmayan bir **JSON model kartıdır**: ad, tür, süre aralığı, referans sözdizimi, replik ve ses sözdizimi, kelime veya karakter sınırı, bilinen zayıflıklar, ek kurallar.

| Hedef | Tür | Başlangıç notu (hepsi doğrulanacak) |
| --- | --- | --- |
| Higgsfield Soul 2.0, Soul Cinema | Görsel | 5 kutulu İngilizce prompt, `@image-N` referans |
| Higgsfield Seedance 2.0, 2.5 | Video | 10 saniyelik parçalar, `@image-N` referans, replik zaman damgalı |
| Nano Banana 2 | Görsel | Referanslı düzenleme ve karakter sheet |
| Google Flow, Omni Flash 1.1 | Video | 10 saniyelik parça (kullanıcının notu) |
| Google Flow, Veo 3.1 | Video | 8 saniyelik parça (kullanıcının notu) |
| Midjourney | Görsel | Düz metin, `--ar`, `--style raw` |
| GPT Image | Görsel | JSON yapılı prompt |
| Kling, Wan3 | Video | Wan3 için 30 saniyelik parçalar (kullanıcının notu) |
| Higgsfield Genjutsu | Video | Motion transfer ve nesne değişimi |

**Kural:** Claude Code model özelliklerini ezberden doldurmaz. Başlangıç değerlerini koyar, hepsini **"doğrulanmadı"** diye etiketler. Kullanıcı Ayarlar'dan düzenler. "Model kartını güncelle" butonu Claude'dan taslak ister, kullanıcı onaylar.

**Karşılaştırma:** aynı sahne grafının farklı model çıktıları yan yana gösterilir, her modelin sınırını aşan yerler işaretlenir.

## Sistem kapsama matrisi

Program belirli bir modele bağlı değildir. Görsel, video, ses, 3D, kurgu ve büyütme araçlarının hepsi için **aynı sahne grafından** çıktı üretir. Aşağıdaki liste başlangıçtır ve hepsi doğrulanacaktır.

| Alan | Örnek sistemler | Program ne yapar |
| --- | --- | --- |
| Görsel üretim | Higgsfield Soul, Nano Banana, Midjourney, GPT Image, Flux, Stable Diffusion ve ComfyUI | Model kartına göre prompt, referans sırası, çerçeve oranı |
| Video üretim | Seedance, Veo, Google Flow, Kling, Wan, Runway, Luma, Pika | Parça süresi, kamera hareketi cümlesi, replik ve ses sözdizimi |
| Referanslı düzenleme ve motion transfer | Higgsfield Genjutsu, Nano Banana düzenleme | Kaynak klip ve referans eşleştirme rehberi |
| Ses ve dublaj | ElevenLabs, model içi ses, dublaj araçları | Replik, ton, dil ve zaman damgası listesi |
| Müzik ve ses efekti | Suno, Udio, model içi ses | Sahneye uygun müzik promptu, ses kataloğu |
| Büyütme ve düzeltme | Topaz, upscaler'lar, yüz restorasyonu | Hangi sorun için hangi araç, ayar önerisi |
| 3D ve animasyon | Blender, `.glb`, `bpy` | Dışa aktarma, referans kareler |
| Kurgu ve yayın | CapCut, Premiere, DaVinci Resolve | Parça birleştirme listesi, altyazı dosyası, kapak |

**Kamera kataloğu ile bağ:** her kamera kaydı, her model kartına en az bir varyantla derlenir. Varyantı olmayan modelde genel cümle kullanılır ve **sarı uyarı** çıkar.

**Bilinmeyen veya yeni bir sistem için:**

1. **Evrensel adaptör:** 5 kutu, referans, süre ve temel kuralları taşıyan, her sistemde çalışan genel bir prompt.
2. **"Yeni sistem ekle" sihirbazı:** kullanıcı sistemin belgesini veya çalışan 3-5 örnek promptu yapıştırır (ya da yalnızca adını söyler ve Claude araştırır). Claude model kartı taslağı çıkarır, kullanıcı onaylar, kart "doğrulanmadı" etiketiyle kaydedilir.
3. **Çalışan promptlardan öğrenme:** kullanıcı iyi sonuç veren promptu ve sonuç notunu kaydeder. Program kalıbı çıkarır ve o modele özel öneriler biriktirir (kişisel deneyim defteri).
4. **Test seti:** her adaptör için 3 standart sahneden oluşan mini deneme seti. Sonuçlar modelin hangi kuralları kaldırdığını kaydeder.
5. **Güncellik uyarısı:** her kartın son doğrulama tarihi vardır, 60 günden eskiyse "tekrar doğrula" uyarısı çıkar.

**Fazlar:** ilk 6 model kartı Faz 4'te, kalan kartlar Faz 6'da, "Yeni sistem ekle" sihirbazı Faz 5'te (Claude gerektirdiği için) kurulur.

## Arayüz, animasyon ve tasarım

**Tasarım dili:** karanlık, sinematik bir film stüdyosu. Altın sarısı vurgu rengi, yüksek kontrast, sınırlı cam efekti. Başlıklarda sinematik, gövdede çok okunaklı bir yazı tipi. Tüm renk, boşluk ve yazı boyutları CSS değişkenleridir. Açık tema seçeneği de bulunur.

**Yerleşim:** masaüstünde sol gezinme, telefonda alt sekme çubuğu. Altı bölüm: Ana Sayfa, Akademi, Stüdyo, Fabrika, Kütüphane, Ayarlar. Ana Sayfa'da bugünün görevi, kaldığın yerden devam, haftalık seri ve zayıf nokta özeti bulunur.

**Kullanışlılık:**

- Komut paleti (Ctrl veya Cmd + K) ve klavye kısayolları.
- Sürükle ve bırak, geri al ve yinele, otomatik kayıt göstergesi.
- Boş durum ekranları, yükleme iskeletleri, hata sınırları (bir bölüm çökerse uygulama çökmez).

**Animasyon:** sayfa geçişleri, rütbe ve rozet kutlaması, 3D kamera yolu oynatma, ders demoları. Hedef 60 fps, `prefers-reduced-motion` ayarına saygı.

**Erişilebilirlik:** klavye ile tam kullanım, görünür odak halkası, AA kontrast, `aria-label`'lar, 3D sahne için metin alternatifi (sahne özeti).

**Türkçe:** tüm metinler bir dil dosyasındadır (varsayılan Türkçe, İngilizce için hazır). Her İngilizce terimin üzerine gelince Türkçe açıklaması çıkar, ayrıca aranabilir bir **sinema sözlüğü** vardır.

## Senin düşünmediğin ama gerekli eklemeler

Aşağıdakiler isteğinde geçmeyen, ama programın gerçekten işe yaraması için gereken 18 parçadır. Hepsi bu belgenin kapsamındadır.

| Ekleme | Neden gerekli | Faz |
| --- | --- | --- |
| Kural motoru (çelişki bekçisi) | Ders ve üretim aynı kuralı kullanır, hata erken yakalanır | 1 |
| Türkçe-İngilizce çift dil ve sinema sözlüğü | İngilizce bilmiyorsun, her terim anlaşılmalı | 0 |
| Zayıf nokta haritası ve tekrar kartları | Öğrendiğin kalıcı olur, aynı hata tekrar etmez | 1 |
| Dışa ve içe aktarma, yedek | Depolama sıfırlanırsa emek kaybolmaz | 0 |
| Mobil öncelikli tasarım | Telefonda kullanıyorsun | 0 |
| Çevrimdışı mod | Claude yokken şablon motoru çalışır | 0 |
| Blender köprüsü (.glb ve bpy betiği) | Gerçek Blender'a geçiş yolu | 3 |
| Erişilebilirlik ve performans bütçesi | 3D ve animasyon mobilde donmasın | 3 |
| Model adaptörleri | Her model farklı sözdizimi ister | 4 |
| Süreklilik denetçisi | Parçalar arası ışık, hava, kıyafet sapması videoyu bozar | 4 |
| Görsel onay kapısı | Önce görsel, sonra video düzeni korunur, kredi boşa gitmez | 4 |
| Kredi ve maliyet takibi | Çok platform, çok deneme: bütçe görünür olsun | 4 |
| Varlık kütüphanesi ve sürüm geçmişi | Karakter ve mekânı yeniden kullan, eski sürüme dön | 4 |
| Proje şablonları | Her fikir kendi akışıyla başlasın | 4 |
| Düzeltme laboratuvarı | Sonucu yükle, teşhis ve düzeltme promptu al | 5 |
| Hikâye ve kanca atölyesi | İlk 3 saniye ve duygu yayı izlenmeyi belirler | 5 |
| Güvenlik ve telif uyarı linteri | Gerçek kişi, marka, telifli karakter riskini haber verir | 5 |
| Yayın paketi | İçerik gelir getirmeli: altyazı, hashtag, thumbnail, 9:16 güvenli alan | 6 |

## Fazlar ve kabul ölçütleri

Program 8 fazda kurulur. **Her fazın sonunda Claude Code çalışan sürümü, ekran görüntülerini ve 5 maddelik özeti gösterir, kullanıcı onay vermeden sonraki faza geçmez.**

| Faz | Teslim edilen | Kabul ölçütü (kullanıcı görür) |
| --- | --- | --- |
| 0. İskelet | Proje kurulumu, tek dosya build, tasarım sistemi, veri modeli, Türkçe dil dosyası, yedekleme | `npm run build` tek bir HTML üretir ve claude.ai'de açılır, 390 px genişlikte düzgün görünür |
| 1. Akademi çekirdeği | M1 ve M2 dersleri, ilk 6 oyun, XP ve rütbe, kural motoru v1 | Modül 1 baştan sona oynanır, rütbe verilir, en az 20 kural testi geçer |
| 2. Kamera ve ışık laboratuvarı (2D) | Canlı yüz ve kadraj önizlemesi, prompt derleyici, Türkçe ve İngilizce çıktı | Seçim yapınca prompt anında çıkar, çelişki bekçisi hatayı yakalar |
| 3. 3D stüdyo | Three.js sahne, manken, kamera ve lens, ışık, zaman çizelgesi, dışa aktarma | Mobilde 30 fps, kamera yolu oynar, PNG referans kare ve `.glb` çıkar |
| 4. Fabrika | Sihirbaz (adım 1-7), şablonlar, süreklilik denetçisi, model adaptörleri, kütüphane, kredi takibi | "İstasyonda veda" sahnesi sıfırdan 15 dakikada paket olarak çıkar |
| 5. Claude katmanı | Alıştırma üretimi, değerlendirme, düzeltme laboratuvarı, fikir ve hikâye | Her görev şemaya uyan JSON döner, Claude kapalıyken motor çalışır |
| 6. İleri modüller | M3-M10, yayın paketi, tekrar kartları | Tüm modüller açılır, yayın paketi üretilir |
| 7. Cilalama | Performans, erişilebilirlik, test seti, hata ayıklama, yayın | Test seti yeşil, 3 kullanıcı senaryosu sorunsuz tamamlanır |

## Claude Code çalışma kuralları

1. **Önce `CLAUDE.md`:** bu belgenin özetini, komutları ve değişmez ilkeleri oraya yaz. Her oturumda ilk o okunur.
2. **Önce plan:** bir fazın görev listesini çıkar ve kullanıcıya kısaca göster, sonra kodla.
3. **Küçük commit'ler:** her faz sonunda uygulama çalışır durumda olmalı.
4. **Kanıtla:** "bitti" demeden önce derle, testleri çalıştır, uygulamayı (headless) tarayıcıda aç ve konsolda hata olmadığını doğrula.
5. **Tahmin etme:** claude.ai Artifact runtime'ı, Three.js sürümü, model özellikleri gibi bilmediğin şeyleri araştır. Belirsiz kalanı `TODO` olarak işaretle ve kullanıcıya sor.
6. **Soruları çoktan seçmeli sor,** önerini belirt. Yalnızca gerçekten karar gereken yerde sor.
7. **İçeriği koddan ayır:** dersler, oyunlar, kurallar ve model kartları JSON veya Markdown dosyalarındadır. Arayüz sadece okur.
8. **Dil:** kullanıcıya görünen her metin Türkçe, kısa cümleli ve oyunludur. Kod ve yorumlar İngilizce olabilir.
9. **Gizli bilgi yok:** API anahtarı koda girmez.
10. **Mevcut araçlar:** kullanıcının SECO Director OS (Seedance Master Studio) ve LensLab uygulamaları var. Bunları yeniden yazma. Ama iyi fikirlerini (seri bible, kamera ve lens seçici) bu programın modülü olarak yeniden kurabilirsin. Kodlarına ihtiyaç olursa kullanıcıdan iste.
11. **Kapsam disiplini:** kapsam dışı fikirleri `BACKLOG.md` dosyasına yaz, kendi başına büyütme.
12. **Onay kapısı:** her faz sonunda dur ve onay bekle.

## İlk mesaj (Claude Code'a yapıştır)

Belgeyi `MASTER_PROMPT.md` olarak kaydettikten sonra Claude Code'a şunu yapıştır:

```text
MASTER_PROMPT.md dosyasını baştan sona oku ve bütün kurallarına uy. Sonra sırayla şunları yap, ben onaylamadan Faz 1'e geçme.

1. CLAUDE.md oluştur: belgenin özeti, değişmez ilkeler, komutlar.
2. Hedef platformu doğrula: claude.ai Artifact çalışma ortamının güncel kısıtlarını ve runtime yeteneklerini araştır, bulduklarını 10 maddede özetle. Tahmin etme.
3. Faz 0 görev listesini çıkar ve bana göster. Ben onaylayınca uygula.
4. Faz 0'ı uygula: Vite, TypeScript, React ve Three.js iskeleti, tek dosya build, tasarım sistemi, veri modeli, Türkçe dil dosyası, yedekleme.
5. Faz 0 bitince tek HTML dosyasını, ekran görüntülerini ve 5 maddelik özeti göster, onayımı bekle.

Benimle Türkçe konuş. Karar gereken yerde çoktan seçmeli sor ve önerini belirt.
```

Faz 0 onaylanınca aynı şekilde Faz 1'e, sonra sırayla diğer fazlara geç.
