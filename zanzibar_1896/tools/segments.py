# -*- coding: utf-8 -*-
"""Nihai seslendirme metni: bölümlere ayrılmış segmentler.

Her segment: (id, bölüm, ekranda/altyazıda görünen metin, TTS metni veya None, sonrasında duraklama sn)
TTS metni None ise ekran metni okunur. TTS metninde özel isimler Türkçe okunuşa göre yazılır;
böylece aynı isim her bölümde aynı biçimde seslendirilir.
"""
import json, os, re

SEG = [
 # ---------------- 1. AÇILIŞ ----------------
 ("s01", "acilis", "27 Ağustos 1896 sabahı.",
  "Yirmi yedi Ağustos, bin sekiz yüz doksan altı sabahı.", 0.35),
 ("s02", "acilis", "Zanzibar limanında beş Britanya savaş gemisi, kıyıdaki bir sarayın karşısında bekliyor.", None, 0.45),
 ("s03", "acilis", "Bir saat dolmadan her şey bitecek.", None, 0.45),
 ("s04", "acilis", "Saray ağır hasar görecek ve bu çatışma, kayıtlara tarihin en kısa savaşı olarak geçecek.", None, 0.55),
 ("s05", "acilis", "Bu hızın nedenini anlamak için iki gün geriye, bir sultanın ölümüne gitmemiz gerekiyor.", None, 2.4),
 # ---------------- 2. KONUM ----------------
 ("s06", "konum", "Zanzibar, Doğu Afrika kıyısının açıklarında bir adalar topluluğu; bugün Tanzanya'nın parçası.", None, 0.5),
 ("s07", "konum", "1890'dan beri Britanya himayesi altındaydı.",
  "Bin sekiz yüz doksandan beri Britanya himayesi altındaydı.", 0.4),
 ("s08", "konum", "Bu, Avrupa devletlerinin Afrika'da nüfuz için yarıştığı bir dönemdi.", None, 0.45),
 ("s09", "nufuz", "O yıl Britanya ile Almanya, nüfuz alanlarını paylaştıran bir anlaşma imzaladı.", None, 0.3),
 ("s10", "nufuz", "Almanya'nın, Zanzibar üzerindeki Britanya himayesini tanıması da bu anlaşmanın bir parçasıydı.", None, 0.45),
 ("s11", "nufuz", "Yani, adanın geleceği yalnızca Zanzibar'da değil, Avrupa başkentlerinde de pazarlık konusuydu.", None, 0.7),
 # ---------------- 3. BRİTANYA ETKİSİ ----------------
 ("s12", "etki", "Sultan unvanını koruyordu; ama yönetim üzerinde Britanya'nın etkisi büyüktü.", None, 0.45),
 ("s13", "etki", "Sultan Hamad bin Thuwaini de 1893'te Britanya'nın desteğiyle tahta çıkmıştı.",
  "Sultan Hamad bin Tuveyni de bin sekiz yüz doksan üçte Britanya'nın desteğiyle tahta çıkmıştı.", 0.3),
 ("s14", "etki", "Kaynaklara göre bunun bir nedeni, Britanya'nın bölgedeki üstünlüğünü kabul etmesiydi.", None, 0.45),
 ("s16", "etki", "Bu yüzden tahtın bir sonraki sahibi, Britanya için sıradan bir saray meselesi değil, kendi düzeninin devamı demekti.", None, 0.8),
 # ---------------- 4. TAHT ANLAŞMAZLIĞI ----------------
 ("s17", "taht", "25 Ağustos 1896'da Sultan Hamad öldü.",
  "Yirmi beş Ağustos, bin sekiz yüz doksan altıda, Sultan Hamad öldü.", 0.5),
 ("s18", "taht", "Ölümünün ardından zehirlenme iddiaları dolaştı; ama bunlar kanıtlanmış değil.", None, 0.3),
 ("s20", "taht", "Hamad'ın akrabası Khalid bin Barghash, Britanya'nın onayını almadan tahta geçti.",
  "Hamad'ın akrabası Halid bin Bargaş, Britanya'nın onayını almadan tahta geçti.", 0.45),
 ("s21", "taht", "Britanya ise başka bir adayı, Hamoud bin Muhammed'i destekliyordu.",
  "Britanya ise başka bir adayı, Hamud bin Muhammed'i destekliyordu.", 0.4),
 ("s22", "taht", "Britanya, Khalid'i fazla bağımsız davranan biri olarak görüyordu.",
  "Britanya, Halid'i fazla bağımsız davranan biri olarak görüyordu.", 0.35),
 ("s23", "taht", "Destekçileri ise farklı bakıyordu. Bazı anlatılara göre Khalid, Avrupa'nın müdahalesine karşı direnişin simgesi hâline gelmişti ve sarayda onu destekleyen kalabalık bir topluluk vardı.",
  "Destekçileri ise farklı bakıyordu. Bazı anlatılara göre Halid, Avrupa'nın müdahalesine karşı direnişin simgesi hâline gelmişti, ve sarayda onu destekleyen kalabalık bir topluluk vardı.", 0.5),
 ("s24", "taht", "Böylece mesele, kişilerden çok yetkiye dönüştü.", None, 0.35),
 ("s25", "taht", "Onaysız bir tahta geçiş kabul edilirse, himaye düzeninin dayandığı onay mekanizması anlamını yitirirdi.", None, 0.4),
 ("s26", "taht", "Artık sınanan şuydu: Zanzibar'da tahta kimin geçeceğine kim karar verecekti?", None, 0.9),
 # ---------------- 5. ÜLTİMATOM ----------------
 ("s27", "ultimatom", "Britanya önce diplomasiyi denedi. Konsolos, Khalid'i saraydan kendi isteğiyle ayrılmaya ikna etmeye çalıştı.",
  "Britanya önce diplomasiyi denedi. Konsolos, Halid'i saraydan kendi isteğiyle ayrılmaya ikna etmeye çalıştı.", 0.4),
 ("s28", "ultimatom", "Bu işe yaramayınca yanıt, siyasi baskıdan askerî tehdide dönüştü.", None, 0.4),
 ("s29", "ultimatom", "Gemiler limanda toplandı, kıyıya denizciler ve deniz piyadeleri çıkarıldı.", None, 0.3),
 ("s30", "ultimatom", "Askerî olmayan teknelerden limanı boşaltmaları istendi. Liman artık ticarete değil, çatışmaya hazırlanıyordu.", None, 0.5),
 ("s31", "ultimatom", "Khalid'e saraydan ayrılması için son an bildirildi: 27 Ağustos sabahı, saat dokuz.",
  "Halid'e saraydan ayrılması için son an bildirildi: yirmi yedi Ağustos sabahı, saat dokuz.", 0.5),
 ("s32", "ultimatom", "Süre dolarsa, gemiler ateş açacaktı. Anlaşmazlık, somut bir geri sayıma dönüşmüştü.", None, 0.5),
 ("s33", "ultimatom", "Sabah Khalid görüşme istedi. Britanya, yalnızca ültimatom kabul edilirse konuşacağını bildirdi.",
  "Sabah Halid görüşme istedi. Britanya, yalnızca ültimatom kabul edilirse konuşacağını bildirdi.", 0.4),
 ("s34", "ultimatom", "Sarayın son yanıtı, bayrağın indirilmeyeceği yönündeydi.", None, 0.3),
 ("s35", "ultimatom", "Aktarılan yanıtta, Britanya'nın gerçekten ateş açacağına inanılmadığı da yazıyordu.", None, 0.45),
 ("s36", "ultimatom", "Reddedilen talep, bir taht tartışmasını silahla çözülecek bir çatışmaya çevirdi.", None, 2.4),
 # ---------------- 6. GÜÇ FARKI ----------------
 ("s37", "guc", "Taraflara yukarıdan bakınca, sürenin neden bu kadar kısa olduğu görünmeye başlıyor.", None, 0.45),
 ("s38", "guc", "Beş Britanya savaş gemisi, toplarını denizden doğrudan saraya çevirebilecek konumdaydı.", None, 0.45),
 ("s39", "guc", "Zanzibar'ın denizdeki başlıca unsuru ise silahlı bir kraliyet yatıydı: HHS Glasgow. Yanında yalnızca birkaç küçük tekne vardı.",
  "Zanzibar'ın denizdeki başlıca unsuru ise silahlı bir kraliyet yatıydı: Glazgov. Yanında yalnızca birkaç küçük tekne vardı.", 0.45),
 ("s40", "guc", "Saray çevresinde, bazı kaynaklara göre yaklaşık üç bin kişi toplanmıştı; bunların yedi yüz kadarı askerdi.", None, 0.4),
 ("s41", "guc", "Ama bu çatışmada belirleyici olan insan sayısı değil, ateş gücüydü.", None, 0.4),
 ("s42", "guc", "Saray yerinden oynayamazdı; savunması kıyıdaki toplara dayanıyordu.", None, 0.4),
 ("s43", "guc", "Karşı karşıya gelen şey, iki ordudan çok, bir filo ile bir bina ve onun toplarıydı.", None, 3.0),
 # ---------------- 7. BOMBARDIMAN ----------------
 ("s45", "bomba", "Süre doldu. Kısa süre sonra Britanya gemileri sarayı bombalamaya başladı.", None, 0.4),
 ("s46", "bomba", "Ateş, sarayın ve harem bölümünün yapılarına, bir de onları savunan toplara yöneldi.", None, 0.35),
 ("s47", "bomba", "Kısa sürede kıyıdaki toplar susturuldu; saray ağır hasar gördü.", None, 0.4),
 ("s48", "bomba", "Kraliyet yatı Glasgow, Britanya'nın amiral gemisi St George'a ateş açtı ve kısa sürede batırıldı.",
  "Kraliyet yatı Glazgov, Britanya'nın amiral gemisi Sent Corc'a ateş açtı, ve kısa sürede batırıldı.", 0.4),
 ("s49", "bomba", "Karşılık verecek araçlarını yitiren savunma için çatışma fiilen bitmişti.", None, 0.45),
 ("s50", "bomba", "Sonunda saraydaki bayrak vurulup düştü ve ateş kesildi.", None, 0.4),
 ("s51", "bomba", "O sabah indirilmeyeceği bildirilen bayraktı bu.", None, 2.4),
 # ---------------- 8. KAYIPLAR ----------------
 ("s52", "kayip", "Bedeli ağır oldu. Zanzibar tarafında yaklaşık beş yüz kişi öldü ya da yaralandı.", None, 1.5),
 ("s53", "kayip", "Britanya tarafında tek bir yaralı bildirildi.", None, 0.6),
 ("s54", "kayip", "Bombardımandan sonra karaya çıkan denizciler, saraydan yayılan yangını söndürmeye çalıştı.", None, 0.5),
 ("s55", "kayip", "Savaşın kısalığı bu kaybı küçültmez. Kısa süre, yalnızca ateşin ne kadar sürdüğünü ölçer.", None, 0.4),
 ("s56", "kayip", "Siyasi sonuç ise çok daha uzun sürdü.", None, 1.0),
 # ---------------- 9. YÖNETİM DEĞİŞİKLİĞİ ----------------
 ("s57", "yonetim", "Khalid, Alman konsolosluğuna sığındı ve daha sonra bir Alman gemisiyle adadan ayrıldı.",
  "Halid, Alman konsolosluğuna sığındı, ve daha sonra bir Alman gemisiyle adadan ayrıldı.", 0.45),
 ("s58", "yonetim", "Britanya'nın desteklediği Hamoud bin Muhammed sultan oldu.",
  "Britanya'nın desteklediği Hamud bin Muhammed sultan oldu.", 0.3),
 ("s59", "yonetim", "Anlaşmazlığın başladığı yerde, yani tahtta, Britanya'nın istediği isim kaldı.", None, 0.5),
 ("s60", "yonetim", "Hamoud, izleyen altı yıl boyunca Britanya'nın güçlü etkisi altında yönetti.",
  "Hamud, izleyen altı yıl boyunca Britanya'nın güçlü etkisi altında yönetti.", 0.3),
 ("s61", "yonetim", "Himaye düzeni ise 1963'te Zanzibar'ın bağımsızlığına kadar sürdü.",
  "Himaye düzeni ise bin dokuz yüz altmış üçte, Zanzibar'ın bağımsızlığına kadar sürdü.", 0.45),
 ("s62", "yonetim", "Bazı kaynaklara göre Britanya, bombardımanda kullanılan mermilerin ve yağmanın bedelini bile Khalid'in destekçilerinden talep etti.",
  "Bazı kaynaklara göre Britanya, bombardımanda kullanılan mermilerin ve yağmanın bedelini bile, Halid'in destekçilerinden talep etti.", 0.4),
 ("s63", "yonetim", "Başka anlatılar bu savaşı, Zanzibar'ın egemen bir devlet olarak sonunun işareti sayar.", None, 0.45),
 ("s64", "yonetim", "Daha geniş bakınca olay, yerel yöneticilerin Avrupa devletlerinin askerî gücü karşısında ne kadar az seçeneği olduğunu da gösteriyordu.", None, 0.45),
 ("s65", "yonetim", "Sultan unvanı yerinde durdu; ama tahta kimin geçeceğine dair son sözün nerede olduğu açıkça görülmüştü.", None, 0.5),
 # ---------------- 10. FİNAL ----------------
 ("s68", "final", "“En kısa savaş” unvanının bir yan etkisi var: süre öne çıktıkça, bunun bir tahtın ve yüzlerce insanın kaybının hikâyesi olduğu geri planda kalıyor.",
  "En kısa savaş unvanının bir yan etkisi var: süre öne çıktıkça, bunun bir tahtın ve yüzlerce insanın kaybının hikâyesi olduğu, geri planda kalıyor.", 0.6),
 ("s69", "final", "Kimi kayıtlar 38, kimileri 45 dakika der; çünkü gemilerin ateşi bıraktığı saatler farklı kaydedilmiştir.",
  "Kimi kayıtlar otuz sekiz, kimileri kırk beş dakika der; çünkü gemilerin ateşi bıraktığı saatler farklı kaydedilmiştir.", 0.45),
 ("s70", "final", "En güvenli ifade şu: savaş yaklaşık kırk dakika sürdü. Her hâlde, bir saatten kısa.", None, 0.8),
 ("s71", "final", "Rakam değişse de hikâye aynı kalıyor: tahtı belirsizleştiren bir ölüm, kabul edilmeyen bir süre sınırı ve o sınır dolduktan sonra gelen bombardıman.", None, 1.4),
 ("s72", "cta", "Bu kanalda tarihin böyle anlarını haritalar ve animasyonlarla anlatıyoruz.", None, 0.3),
 ("s73", "cta", "Yeni videoları kaçırmak istemezseniz, kanala abone olabilirsiniz.", None, 0.0),
]

if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data = [dict(id=i, section=s, text=t, tts=(tt or t), pause=p) for i, s, t, tt, p in SEG]
    os.makedirs(os.path.join(root, "work"), exist_ok=True)
    json.dump(data, open(os.path.join(root, "work", "segments.json"), "w"), ensure_ascii=False, indent=1)
    titles = {"acilis": "AÇILIŞ", "konum": "ZANZİBAR'IN KONUMU", "nufuz": "AVRUPA VE NÜFUZ", "etki": "BRİTANYA ETKİSİ",
              "taht": "TAHT ANLAŞMAZLIĞI", "ultimatom": "ÜLTİMATOM", "guc": "GÜÇ FARKI", "bomba": "BOMBARDIMAN",
              "kayip": "KAYIPLAR", "yonetim": "YÖNETİM DEĞİŞİKLİĞİ", "final": "FİNAL", "cta": "KAPANIŞ"}
    out, cur = [], None
    for d in data:
        if d["section"] != cur:
            cur = d["section"]; out.append(f"\n[{titles[cur]}]\n")
        out.append(d["text"] + " ")
    txt = "".join(out).strip() + "\n"
    open(os.path.join(root, "script_final_tr.txt"), "w").write(txt)
    words = len(re.findall(r"\w+", " ".join(d["tts"] for d in data)))
    print("segments", len(data), "tts words", words, "est min @135wpm", round(words / 135, 2))
