/* CineBG Studio v7 — mevcut 39 motor için 10'ar görünüm (parametre ön ayarı).
   makeSpec seed'e göre bir görünüm seçer ve hafifçe oynatır; saat/hava kancaları bazı değerleri sonradan ayarlar.
   Satır biçimi: 'Görünüm adı|p0 p1 p2 p3 p4 p5 p6 p7' (0..1). */
(function () {
  const CB = window.CB;
  const P = CB.ENGINE_PRESETS = CB.ENGINE_PRESETS || {};
  const def = (id, rows) => {
    P[id] = rows.trim().split('\n').map((l) => {
      const [tr, v] = l.split('|');
      return { tr: tr.trim(), p: v.trim().split(/\s+/).map(Number) };
    });
  };

  def('nebula', `
Yoğun girdap çekirdek|.75 .8 .5 .7 .5 .4 .2 .3
İnce gaz perdeleri|.35 .3 .7 .3 .3 .2 .6 .2
Toz bantlı karanlık bulut|.6 .5 .4 .3 .6 .85 .4 .2
Uzak yıldız tarlası|.3 .4 .9 .4 .15 .3 .1 .2
Parlak doğum bulutu|.8 .6 .5 .9 .4 .3 .8 .4
Yakın plan türbülans|.65 .9 .3 .5 .9 .5 .3 .5
Sakin mavi sis|.45 .2 .6 .35 .45 .15 .5 .15
Kızıl kalıntı kabuğu|.7 .7 .45 .6 .3 .6 .9 .3
Çapraz akıntı|.55 .6 .55 .45 .6 .4 .25 .8
Çekirdeksiz derin uzay|.4 .45 .8 .1 .35 .55 .7 .25
`);
  def('godrays', `
Tepeden katedral huzmesi|.5 .95 .6 .7 .8 .4 .4 .7
Yandan alçak güneş|.1 .6 .4 .5 .9 .5 .5 .6
Yoğun sis tek kaynak|.5 .8 .2 .3 .7 .3 .9 .55
Çok huzmeli yelpaze|.7 .9 .9 .8 .6 .4 .35 .65
Tozlu atölye ışığı|.3 .85 .5 .6 .5 .9 .4 .5
Loş mavi huzmeler|.6 .75 .55 .45 .55 .3 .6 .35
Merkezden patlayan ışık|.5 .5 .85 .9 .8 .2 .3 .8
Sağdan yumuşak pus|.9 .7 .35 .2 .65 .5 .75 .5
İnce keskin çizgiler|.4 .95 .75 .95 .45 .25 .25 .6
Hafif sabah pusu|.25 .9 .4 .3 .4 .6 .55 .45
`);
  def('mountains', `
Alçak ufuk, dev zirveler|.25 .5 .4 .5 .5 .8 .4 .3
Sisli katmanlar|.45 .4 .3 .4 .9 .4 .85 .2
Gün batımı silüeti|.35 .7 .1 .8 .6 .6 .3 .4
Yüksek ufuk vadi|.65 .3 .5 .3 .7 .5 .7 .3
Keskin sıra dağlar|.4 .2 .6 .4 .4 .95 .2 .25
Bulutlu yüksek irtifa|.5 .55 .55 .5 .5 .7 .5 .85
Tek katman çıplak sırt|.35 .8 .35 .6 .15 .75 .15 .15
Yumuşak tepeler|.45 .45 .45 .35 .8 .2 .5 .4
Kontr ışıklı zirve|.3 .5 .2 .95 .55 .65 .35 .2
Uzak pastel ufuk|.55 .15 .3 .45 .65 .35 .6 .6
`);
  def('city', `
Büyük yumuşak bokeh|.9 .5 .4 .1 .2 .4 .5 .3
Yoğun küçük ışıklar|.25 .9 .3 .2 .5 .5 .6 .5
Yağmurlu cam gecesi|.6 .6 .5 .85 .3 .45 .5 .4
Altıgen diyafram|.6 .5 .3 .2 .95 .5 .4 .4
Alçak ışık bandı|.5 .6 .4 .2 .4 .15 .5 .7
Yüksek ışık bandı|.5 .6 .35 .2 .4 .85 .6 .5
Puslu sodyum gece|.55 .4 .9 .3 .3 .5 .2 .5
Siluetli şehir|.45 .55 .3 .1 .5 .45 .7 .95
Renk karışık neon|.5 .75 .3 .3 .4 .5 .95 .3
Seyrek uzak ışıklar|.35 .2 .5 .15 .6 .35 .4 .6
`);
  def('ocean', `
Alçak ufuk gün batımı|.3 .5 .1 .4 .3 .8 .8 .3
Sakin cam deniz|.5 .4 .4 .1 .2 .6 .5 .1
Fırtınalı dev dalgalar|.45 .6 .4 .95 .85 .3 .3 .8
Bulutlu açık deniz|.55 .3 .5 .5 .9 .4 .3 .4
Parlayan yol|.4 .5 .2 .3 .3 .95 .7 .3
Yüksek ufuk geniş deniz|.75 .7 .45 .45 .4 .5 .4 .5
Kenarda batan güneş|.35 .15 .08 .35 .5 .7 .9 .3
Gri sabah denizi|.5 .6 .55 .4 .7 .2 .2 .3
Sert öğle pırıltısı|.45 .5 .9 .5 .2 .9 .6 .5
Uzun dalga ritmi|.4 .8 .3 .7 .4 .5 .5 .2
`);
  def('aurora', `
Yüksek tek perde|.75 .4 .7 .5 .2 .6 .5 .3
Çoklu dalgalı perdeler|.6 .8 .6 .6 .85 .5 .5 .5
Güçlü ışıma|.55 .5 .95 .4 .5 .4 .6 .4
İnce çizgili ışık|.6 .6 .5 .95 .5 .5 .4 .4
Yıldızlı sakin gece|.5 .3 .35 .3 .3 .95 .5 .2
Ağaç hattı üstü|.5 .5 .6 .5 .5 .6 .9 .3
Alçak ufukta yay|.35 .3 .6 .4 .4 .7 .3 .3
Hızlı dans|.6 .9 .7 .6 .6 .5 .4 .9
Soluk tül|.65 .4 .3 .7 .7 .8 .6 .4
Zeminsiz gök kubbe|.7 .65 .55 .55 .6 .8 .1 .5
`);
  def('silk', `
İri yavaş kıvrımlar|.3 .3 .6 .4 .3 .8 .2 .2
Sık ince dalgalar|.85 .6 .5 .7 .4 .4 .5 .4
Parlak saten|.5 .5 .9 .5 .5 .6 .3 .3
Vurgu renkli perde|.5 .5 .6 .5 .9 .5 .6 .4
Keskin katlar|.6 .4 .6 .9 .3 .2 .4 .3
Puslu yumuşak|.4 .3 .4 .3 .4 .95 .7 .2
Çapraz akış|.55 .8 .55 .55 .5 .5 .85 .6
Koyu kadife|.45 .4 .25 .6 .2 .7 .15 .2
Hızlı dalgalanma|.65 .9 .6 .6 .6 .5 .5 .9
Dikey drapeler|.4 .5 .5 .7 .4 .55 .5 .3
`);
  def('dunes', `
Alçak ufuk dev kumullar|.25 .5 .3 .4 .7 .3 .5 .2
Keskin sırtlar yan ışık|.4 .15 .2 .6 .95 .2 .6 .2
Sıcak pus öğle|.5 .5 .9 .5 .4 .9 .3 .5
Dalgacıklı yakın plan|.6 .7 .35 .7 .6 .3 .95 .2
Tozlu fırtına önü|.45 .4 .4 .5 .5 .6 .4 .9
Sonsuz kum denizi|.55 .5 .45 .9 .5 .4 .5 .3
Gün batımı uzun gölge|.35 .85 .08 .55 .8 .4 .7 .2
Yumuşak pastel tepeler|.45 .3 .5 .3 .2 .5 .3 .3
Yüksek ufuk vadi|.75 .6 .5 .6 .6 .5 .6 .4
Tek dev kumul|.3 .35 .3 .15 .75 .3 .4 .2
`);
  def('anamorphic', `
Tek dev flare|.1 .9 .4 .3 .8 .3 .3 .3
Sıra sokak lambaları|.6 .6 .3 .4 .6 .2 .5 .4
Dağınık yıldız ışıkları|.8 .4 .5 .3 .5 .9 .6 .4
Puslu uzun çizgiler|.4 .95 .3 .8 .6 .5 .4 .3
Hayalet yansımalar|.3 .5 .95 .3 .6 .4 .3 .4
Bokeh yoğun gece|.6 .4 .3 .4 .5 .7 .95 .4
Parlak sahne ışığı|.35 .8 .5 .4 .95 .4 .4 .5
Kısa keskin çizgiler|.7 .2 .4 .2 .6 .6 .5 .5
Hareketli ışık geçişi|.5 .7 .5 .4 .6 .5 .5 .9
Loş sinema salonu|.25 .7 .6 .6 .35 .3 .6 .2
`);
  def('smoke', `
Yoğun kıvrımlı duman|.85 .7 .5 .5 .5 .5 .3 .4
İnce tütsü tutamları|.35 .4 .6 .3 .4 .9 .2 .3
Soldan sert ışık|.6 .5 .95 .1 .5 .5 .3 .4
Sağdan sert ışık|.6 .5 .1 .95 .5 .5 .3 .4
İki yönlü kontr|.55 .6 .8 .8 .5 .6 .2 .4
Korlu yangın dumanı|.7 .6 .5 .6 .6 .4 .9 .5
İri yavaş bulutlar|.6 .3 .5 .5 .9 .3 .2 .2
Hızlı girdap|.65 .95 .5 .5 .45 .5 .3 .9
Seyrek pus|.3 .3 .4 .4 .6 .6 .1 .3
Mürekkep su içinde|.55 .85 .3 .6 .35 .8 .1 .5
`);
  def('storm', `
Kapalı kara gök|.95 .5 .1 .5 .3 .4 .4 .4
Işık yarığı ortada|.75 .6 .8 .5 .2 .2 .4 .3
Şimşekli süper hücre|.85 .8 .3 .6 .95 .4 .35 .5
Yağmur perdeleri|.8 .5 .3 .4 .4 .95 .4 .5
Alçak ufuk dev bulut|.7 .9 .4 .3 .5 .3 .2 .4
Yüksek zemin düzlük|.75 .5 .5 .7 .3 .4 .7 .3
Sağdan güneş kırığı|.7 .5 .7 .85 .2 .3 .4 .4
Küçük hücreli gök|.8 .25 .3 .5 .4 .5 .4 .5
Hızlı akan bulutlar|.8 .6 .4 .4 .5 .5 .4 .95
Dağılan fırtına|.55 .7 .6 .3 .15 .2 .45 .4
`);
  def('forest', `
Sık sisli orman|.85 .7 .8 .3 .5 .6 .7 .3
Tek güçlü huzme|.6 .5 .5 .95 .5 .5 .4 .6
Seyrek kalın gövdeler|.3 .4 .4 .5 .4 .9 .4 .3
Derin katmanlı koru|.6 .95 .5 .5 .5 .4 .5 .3
Zemin sisi alçak|.6 .6 .3 .4 .5 .5 .95 .3
Zerreli ışık banyosu|.55 .6 .5 .8 .3 .4 .4 .95
Soldan sabah ışığı|.6 .6 .55 .7 .1 .5 .5 .5
Sağdan akşam ışığı|.6 .6 .45 .7 .9 .5 .4 .5
İnce genç ağaçlar|.8 .5 .4 .4 .5 .15 .3 .3
Karanlık ormanlık|.75 .8 .65 .1 .5 .6 .7 .2
`);
  def('planet', `
Dev gezegen ufku|.95 .2 .5 .4 .7 .6 .2 .4
Uzak küçük küre|.3 .5 .5 .5 .5 .5 .2 .8
Gece şehir ışıkları|.85 .3 .5 .1 .6 .6 .95 .5
İnce hilal|.7 .4 .3 .05 .8 .5 .3 .7
Kalın atmosfer halesi|.75 .35 .5 .3 .95 .3 .2 .5
Dokulu kayalık yüzey|.8 .3 .6 .5 .4 .95 .1 .4
Kenardan çıkan dünya|.85 .15 .85 .45 .7 .6 .3 .6
Yıldız denizi içinde|.5 .5 .4 .6 .5 .5 .1 .95
Yarı aydınlık sınır|.7 .3 .5 .25 .6 .7 .7 .5
Yüksek ufuk yörünge|.9 .55 .5 .6 .5 .5 .4 .3
`);
  def('synthwave', `
Klasik gün batımı ızgara|.5 .6 .7 .7 .5 .4 .4 .3
Dev güneş alçak ufuk|.35 .95 .8 .6 .4 .3 .3 .3
Dağlı vadi|.5 .5 .6 .6 .95 .5 .3 .4
Yıldızlı gece ızgarası|.55 .3 .4 .8 .4 .95 .4 .2
Hızlı neon sürüş|.5 .6 .6 .95 .5 .4 .95 .3
Puslu pastel|.5 .6 .5 .4 .5 .4 .3 .9
Şeritsiz güneş|.45 .7 .05 .6 .6 .5 .4 .4
Yüksek ufuk geniş zemin|.7 .5 .6 .7 .4 .5 .5 .3
Sönük ızgara loş|.5 .5 .5 .2 .5 .6 .2 .5
Dağsız sonsuz düzlük|.45 .55 .7 .8 .05 .6 .6 .2
`);
  def('underwater', `
Sığ kostik ışık|.2 .95 .7 .5 .4 .3 .6 .3
Derin mavi boşluk|.9 .2 .3 .5 .5 .6 .1 .2
Tepeden huzme demeti|.5 .5 .95 .5 .4 .3 .4 .3
Partikül kar yağışı|.6 .4 .5 .5 .95 .4 .4 .4
Bulanık yeşil su|.5 .3 .4 .5 .6 .95 .4 .3
Kumlu zemin yakını|.35 .7 .5 .4 .3 .3 .95 .3
Soldan yüzey ışığı|.4 .6 .7 .1 .4 .4 .5 .4
Akıntılı orta su|.5 .6 .5 .6 .7 .4 .3 .9
Loş derin vadi|.8 .3 .6 .5 .3 .5 .7 .2
Berrak tropik|.25 .8 .6 .7 .2 .1 .7 .4
`);
  def('battlefield', `
Yoğun duman perdesi|.95 .4 .5 .4 .3 .4 .3 .5
Yangın kızıllığı|.6 .95 .6 .7 .4 .4 .3 .4
Yıkıntı siluetleri|.5 .5 .95 .4 .3 .4 .5 .3
Kıvılcım yağmuru|.5 .6 .5 .95 .3 .4 .4 .6
Uzak patlamalar|.6 .5 .5 .4 .95 .4 .4 .4
Alçak ufuk gökyüzü|.5 .5 .6 .4 .4 .2 .7 .5
Ay altında sessiz|.4 .2 .6 .2 .1 .45 .9 .2
Rüzgarlı toz|.6 .4 .5 .5 .3 .45 .5 .95
Yüksek ufuk çamur|.55 .5 .6 .3 .4 .8 .4 .4
Sabah sonrası duman|.75 .2 .7 .2 .1 .45 .6 .3
`);
  def('skyline', `
Alçak ufuk kuleler|.25 .6 .9 .6 .3 .5 .5 .2
Yoğun şehir duvarı|.45 .95 .6 .7 .4 .4 .7 .3
Ay ışıklı silüet|.4 .5 .6 .2 .4 .9 .5 .3
Puslu katmanlar|.4 .6 .6 .5 .9 .4 .95 .3
Su yansımalı kıyı|.45 .6 .7 .7 .4 .5 .5 .95
Seyrek alçak binalar|.35 .3 .2 .5 .5 .5 .4 .3
Işıklı gece|.4 .7 .7 .95 .3 .3 .6 .5
Gün ortası net|.4 .6 .6 .1 .2 .6 .5 .3
Yüksek ufuk yoğun|.65 .8 .5 .6 .5 .5 .7 .4
Tek gökdelen öne|.35 .3 .95 .5 .4 .4 .3 .5
`);
  def('hall', `
Sıra uzun pencereler|.8 .7 .5 .5 .3 .7 .5 .4
Tek dev pencere|.15 .9 .5 .6 .2 .9 .4 .5
Tozlu pus salon|.5 .6 .4 .95 .3 .6 .4 .8
Sütunlu ön plan|.5 .6 .5 .5 .95 .6 .4 .4
Parlak yansıyan zemin|.6 .7 .5 .4 .3 .6 .95 .3
Alçak pencereler|.6 .6 .3 .5 .4 .25 .5 .4
Yan açı ışık|.6 .7 .85 .6 .4 .6 .5 .5
Loş karanlık salon|.5 .25 .5 .5 .5 .5 .4 .3
Zerreli huzmeler|.7 .7 .55 .7 .3 .7 .4 .95
Seyrek yüksek pencere|.3 .75 .2 .4 .5 .95 .6 .3
`);
  def('castle', `
Tepede dev kale|.4 .9 .6 .5 .3 .5 .5 .3
Uzak sisli kale|.5 .4 .5 .5 .9 .4 .3 .4
Çok kuleli siluet|.45 .6 .95 .5 .4 .5 .4 .3
Soldaki kale|.45 .6 .6 .2 .4 .5 .4 .4
Sağdaki kale|.45 .6 .6 .8 .4 .5 .4 .4
Ay altında|.4 .6 .5 .5 .5 .95 .3 .3
Işıklı pencereler gece|.45 .6 .6 .5 .3 .5 .95 .3
Küllü kuşlu gök|.45 .5 .5 .5 .5 .4 .4 .95
Alçak ufuk anıt|.25 .8 .7 .5 .3 .6 .5 .3
Tek kule harabe|.5 .35 .1 .4 .6 .5 .2 .5
`);
  def('orbs', `
Az iri küre|.15 .3 .9 .7 .3 .2 .5 .2
Çok küçük ışık|.95 .5 .2 .6 .4 .4 .6 .4
Hareketli dans|.6 .95 .5 .6 .4 .3 .5 .8
Dokulu sıvı|.5 .4 .6 .5 .95 .3 .4 .3
Işık çizgili|.5 .5 .5 .6 .3 .95 .5 .5
Aydınlık zemin|.5 .4 .6 .7 .4 .3 .1 .3
Koyu derin|.5 .4 .5 .5 .3 .3 .95 .3
Parlak patlama|.6 .5 .7 .95 .3 .5 .6 .5
Sakin pastel|.4 .2 .7 .4 .5 .2 .3 .1
Yavaş tek akış|.3 .6 .8 .5 .5 .6 .7 .2
`);
  def('rainglass', `
Sağanak akan damlalar|.8 .95 .5 .6 .3 .6 .6 .6
İnce çisenti|.4 .3 .5 .4 .3 .5 .5 .3
Buğulu cam|.5 .4 .6 .5 .95 .4 .7 .3
İri bokeh ışıklar|.6 .6 .95 .5 .4 .7 .8 .4
Güçlü kırılma|.7 .6 .5 .95 .3 .6 .6 .4
Loş ışıksız|.6 .6 .5 .5 .5 .2 .7 .4
Net arka plan|.5 .5 .4 .6 .2 .6 .2 .4
Yavaş damla süzülmesi|.6 .7 .6 .5 .4 .5 .6 .1
Yoğun damla dokusu|.95 .5 .4 .7 .3 .5 .6 .5
Neon gece camı|.7 .7 .7 .6 .3 .95 .75 .5
`);
  def('fire', `
Geniş alev duvarı|.95 .6 .6 .7 .4 .3 .5 .5
Uzun dar alev|.3 .95 .5 .7 .3 .2 .4 .5
Türbülanslı yangın|.6 .7 .95 .7 .5 .3 .6 .7
Dumanlı söndürülmüş|.5 .4 .5 .4 .95 .3 .5 .4
Siluetli ön plan|.6 .6 .6 .7 .4 .95 .5 .5
Kor yağmuru|.5 .5 .6 .6 .4 .3 .95 .6
Kamp ateşi alçak|.4 .35 .4 .6 .3 .2 .7 .4
Parlak cehennem|.8 .8 .7 .95 .3 .3 .6 .6
Yavaş titrek|.5 .5 .3 .5 .3 .3 .4 .1
Hızlı rüzgarlı|.6 .6 .8 .6 .5 .4 .5 .95
`);
  def('tunnel', `
Sık halkalı tünel|.95 .5 .6 .5 .5 .4 .5 .4
Seyrek halka|.2 .4 .7 .6 .5 .4 .5 .4
Panel çizgili koridor|.5 .95 .5 .5 .3 .4 .5 .4
Parlak uç ışığı|.5 .4 .5 .95 .5 .5 .5 .4
Geniş kesit|.5 .5 .5 .5 .95 .4 .5 .4
Sisli derinlik|.5 .5 .5 .5 .5 .95 .5 .3
Kaymış perspektif|.5 .5 .5 .5 .5 .4 .9 .4
Hızlı geçiş|.6 .6 .7 .5 .5 .3 .5 .95
Loş bakım tüneli|.4 .6 .2 .3 .2 .6 .5 .2
Kare koridor|.6 .7 .6 .6 .05 .4 .5 .4
`);
  def('canyon', `
Dar yarık|.15 .7 .6 .6 .7 .4 .5 .4
Geniş vadi|.85 .5 .5 .5 .3 .5 .4 .5
Çok katmanlı duvar|.5 .95 .7 .5 .5 .5 .5 .4
Tabaka çizgili|.5 .6 .95 .5 .4 .4 .5 .4
Tepe ışığı parlak|.5 .6 .6 .95 .5 .3 .5 .4
Tek huzme düşüşü|.3 .6 .5 .5 .95 .5 .5 .4
Puslu derin|.5 .7 .5 .5 .4 .9 .5 .4
Kıvrımlı geçit|.4 .6 .5 .5 .5 .4 .95 .4
Kumlu zemin|.5 .5 .5 .5 .4 .4 .5 .95
Loş gölgeli|.35 .7 .4 .25 .2 .6 .6 .3
`);
  def('cells', `
İri hücreler|.15 .6 .7 .5 .4 .3 .4 .3
Mikro doku|.95 .5 .4 .6 .5 .4 .4 .5
Parlak zarlar|.5 .95 .5 .5 .4 .4 .4 .4
Belirgin çekirdek|.4 .5 .95 .4 .4 .3 .4 .3
Derin katmanlı|.5 .5 .5 .95 .4 .4 .6 .4
Biyolüminesan|.5 .6 .5 .5 .4 .95 .4 .5
Sıvı pus|.5 .4 .5 .5 .4 .4 .95 .3
Partikül bulutu|.5 .5 .5 .5 .4 .4 .4 .95
Hareketli akış|.5 .5 .5 .5 .95 .5 .4 .5
Sakin koyu doku|.6 .3 .3 .7 .2 .2 .5 .2
`);
  def('clouds', `
Alçak ufuk kabarık|.25 .5 .4 .9 .5 .5 .5 .3
Dev bulut kuleleri|.4 .5 .5 .6 .6 .95 .5 .3
İnce yaygın bulut|.45 .5 .5 .3 .3 .2 .5 .4
Gün batımı parıltı|.35 .7 .1 .6 .5 .5 .95 .3
Yüksek ufuk deniz|.75 .4 .5 .7 .6 .4 .5 .4
Büyük ölçekli|.5 .5 .5 .6 .95 .6 .5 .3
Hızlı akan|.45 .5 .5 .6 .5 .5 .5 .95
Sağdan güneş|.45 .9 .4 .6 .5 .5 .7 .3
Soldan güneş|.45 .1 .4 .6 .5 .5 .7 .3
Bulut denizi üstü|.55 .5 .2 .8 .7 .3 .6 .2
`);
  def('lava', `
İri çatlaklar|.15 .5 .6 .6 .4 .5 .5 .4
Sık ince çatlak|.95 .5 .3 .6 .4 .5 .5 .4
Bükülen akış|.5 .95 .5 .6 .4 .5 .5 .6
Geniş akkor nehir|.5 .5 .95 .7 .4 .5 .5 .4
Parlak akkor|.5 .5 .5 .95 .4 .5 .5 .4
Dumanlı kızıllık|.5 .5 .5 .6 .95 .5 .5 .4
Yüksek ufuk ova|.5 .5 .5 .6 .4 .85 .5 .4
Kor yağan|.5 .5 .5 .6 .4 .5 .95 .5
Hızlı akan|.5 .6 .5 .6 .4 .5 .5 .95
Soğuyan kabuk|.4 .4 .2 .3 .5 .5 .3 .2
`);
  def('galaxy', `
İki kollu sarmal|.15 .5 .6 .5 .4 .5 .4 .5
Çok kollu|.9 .5 .5 .5 .4 .5 .4 .5
Sıkı sarmal|.5 .95 .5 .5 .4 .5 .4 .5
Keskin kollar|.5 .5 .95 .4 .4 .5 .4 .4
Dev çekirdek|.5 .5 .5 .95 .4 .5 .4 .5
Yandan eğik disk|.5 .5 .5 .5 .95 .5 .4 .6
Yıldız tarlası|.5 .5 .5 .4 .4 .95 .4 .4
Dönüş hareketi|.5 .5 .5 .5 .4 .5 .95 .4
Toz şeritli|.5 .5 .5 .5 .5 .5 .4 .95
Gevşek soluk|.4 .2 .3 .3 .3 .7 .3 .3
`);
  def('podium', `
Tek podyum yalın|.1 .5 .3 .2 .3 .5 .6 .5
Basamaklı set|.5 .6 .4 .4 .3 .5 .5 .5
Kemerli sahne|.9 .5 .9 .4 .3 .5 .5 .5
Dekor küreli|.5 .5 .5 .95 .3 .5 .5 .5
Pencere gölgeli|.2 .5 .4 .3 .9 .4 .5 .5
Soldan ışık|.5 .5 .5 .4 .3 .1 .5 .5
Sağdan ışık|.5 .5 .5 .4 .3 .9 .5 .5
Sert gölge|.5 .5 .5 .4 .3 .5 .1 .5
Yüksek podyum alçak kamera|.2 .95 .5 .4 .3 .5 .5 .1
Tepeden bakış|.5 .4 .5 .5 .3 .5 .6 .95
`);
  def('terrain3d', `
Dev sivri zirveler|.95 .8 .4 .5 .4 .1 .4 .4
Yumuşak tepeler|.4 .3 .6 .9 .3 .1 .5 .5
Geniş vadi nehir|.6 .5 .95 .6 .4 .5 .5 .5
Karlı yüksek dağ|.8 .6 .5 .2 .4 .1 .5 .4
Sisli vadi|.6 .5 .6 .5 .95 .1 .5 .4
Göl kenarı|.6 .5 .7 .6 .4 .85 .5 .4
Engebeli kanyon|.7 .95 .3 .7 .3 .1 .5 .5
Arkadan güneş|.7 .6 .5 .5 .5 .2 .1 .2
Yandan sabah ışığı|.7 .6 .5 .5 .5 .2 .9 .35
Fiyort suyu|.85 .7 .4 .35 .5 .7 .4 .3
`);
  def('metro3d', `
Gökdelen kanyonu|.95 .8 .4 .5 .4 .3 .4 .4
Alçak bloklar|.3 .6 .6 .5 .4 .3 .4 .5
Geniş bulvar|.6 .5 .95 .5 .4 .3 .4 .5
Işıklı gece|.7 .7 .5 .95 .4 .5 .4 .5
Puslu sabah|.7 .7 .5 .3 .95 .2 .4 .3
Islak yansımalı|.7 .7 .5 .7 .4 .95 .4 .5
Yerden alçak|.7 .7 .5 .5 .4 .4 .05 .5
Yüksek bakış|.7 .7 .5 .5 .4 .3 .9 .5
Yandan güneş|.7 .7 .5 .4 .3 .2 .4 .1
Seyrek dar sokak|.6 .3 .2 .5 .5 .4 .3 .8
`);
  def('room3d', `
Geniş pencere salonu|.95 .5 .5 .6 .4 .5 .6 .5
Bölmeli pencereler|.5 .95 .5 .6 .4 .5 .6 .5
Sütunlu nef|.5 .5 .95 .6 .4 .5 .7 .5
Yoğun huzme|.5 .5 .5 .95 .5 .5 .6 .5
Tozlu zerreler|.5 .5 .5 .6 .95 .5 .6 .5
Alçak güneş açısı|.5 .5 .5 .6 .4 .1 .6 .5
Yüksek tavan|.5 .5 .6 .6 .4 .5 .95 .5
Uzak kapı ışığı|.5 .5 .5 .5 .4 .5 .6 .95
Basık loş oda|.3 .4 .2 .3 .3 .6 .1 .3
Tepeden güneş|.6 .6 .5 .7 .5 .9 .7 .4
`);
  def('crystal', `
Yoğun kristal ormanı|.95 .5 .6 .5 .5 .4 .5 .4
Dev kristaller|.5 .95 .6 .5 .5 .4 .5 .4
Parlak ışıma|.5 .5 .95 .6 .5 .4 .5 .4
Kırılma parıltısı|.5 .5 .6 .95 .5 .4 .5 .4
Geniş mağara|.5 .5 .6 .5 .95 .4 .5 .4
Ağız ışığı|.5 .5 .5 .5 .5 .95 .5 .4
Buz mavisi|.5 .5 .6 .5 .5 .4 .05 .4
Ametist|.5 .5 .6 .5 .5 .4 .95 .4
Sisli|.5 .5 .6 .5 .5 .4 .5 .95
Seyrek loş|.25 .4 .3 .4 .4 .2 .4 .3
`);
  def('collage', `
Çok katmanlı|.95 .5 .5 .4 .5 .5 .5 .4
Pürüzlü yırtık|.5 .95 .5 .4 .5 .5 .5 .4
Beyaz lifli kenar|.5 .5 .95 .4 .5 .5 .5 .4
Yarım ton baskı|.5 .5 .5 .95 .5 .5 .5 .4
Suluboya gök|.5 .5 .5 .3 .95 .5 .5 .4
Kesik güneş|.5 .5 .5 .4 .5 .95 .5 .4
Kaba kâğıt|.5 .5 .5 .4 .5 .5 .95 .4
Hızlı kaynama|.5 .5 .5 .4 .5 .5 .5 .95
Sade iki katman|.15 .3 .4 .1 .6 .3 .3 .2
Gazete kolajı|.7 .7 .7 .85 .2 .3 .8 .5
`);
  def('ruins', `
Alçak ufuk sütunlar|.25 .5 .3 .6 .5 .5 .5 .5
Yandan güneş|.4 .1 .2 .6 .5 .5 .5 .6
Tepeden güneş|.4 .5 .9 .6 .5 .5 .5 .3
Derin sütun sırası|.4 .5 .4 .95 .5 .5 .5 .5
Ağır yıkım|.4 .5 .4 .6 .95 .5 .5 .5
Arka tapınak|.4 .5 .4 .5 .5 .95 .5 .5
Bitkiyle kaplı|.4 .5 .4 .6 .6 .5 .95 .4
Altın pus|.4 .5 .3 .6 .5 .5 .5 .95
Az kalıntı|.45 .7 .3 .2 .3 .2 .3 .4
Yüksek ufuk avlu|.7 .4 .4 .7 .5 .5 .6 .4
`);
  def('archival', `
Fotoğraf paneli|.95 .5 .5 .4 .5 .4 .5 .4
İri yarım ton|.5 .95 .5 .4 .5 .4 .5 .4
Duoton|.5 .5 .95 .4 .5 .4 .5 .4
Kinetik bloklar|.5 .5 .5 .95 .5 .4 .5 .6
Çizikli film|.5 .5 .5 .4 .95 .4 .5 .4
Metin satırları|.5 .5 .5 .4 .5 .95 .5 .4
Kâğıt dokulu|.5 .5 .5 .4 .5 .4 .95 .4
Hareketli kurgu|.5 .5 .5 .7 .5 .4 .5 .95
Sade sepya|.6 .3 .05 .1 .3 .1 .4 .2
Yoğun gazete sayfası|.7 .7 .5 .6 .6 .8 .7 .5
`);
  def('street3d', `
Dar eski sokak|.15 .6 .5 .3 .3 .3 .4 .4
Geniş cadde|.9 .6 .5 .3 .3 .5 .4 .4
Gökdelen tabanı|.5 .95 .5 .3 .3 .4 .4 .4
Işıklı dükkânlar|.5 .5 .95 .5 .3 .4 .4 .4
Gece sokağı|.5 .6 .7 .95 .4 .5 .4 .4
Islak yansımalı|.5 .6 .6 .6 .95 .4 .4 .4
Arabalı park|.5 .5 .5 .3 .3 .95 .4 .4
Puslu sabah|.5 .6 .4 .3 .4 .3 .95 .4
Yerden alçak|.5 .6 .5 .4 .4 .5 .4 .05
Yüksek bakış|.5 .6 .5 .4 .3 .5 .4 .9
`);
  def('countryside', `
Dalgalı tepeler|.7 .9 .5 .5 .4 .4 .5 .4
Düz ova|.15 .2 .5 .5 .5 .3 .5 .4
Yeşil tarlalar|.5 .5 .05 .6 .4 .4 .5 .4
Altın buğday|.5 .5 .95 .5 .4 .4 .5 .4
Ağaç sıralı|.5 .5 .5 .95 .4 .3 .5 .4
Yollu patikalı|.5 .5 .5 .5 .95 .4 .5 .4
Çiftlik evleri|.5 .5 .5 .5 .4 .95 .5 .4
Alçak güneş|.5 .5 .6 .5 .4 .4 .1 .4
Bulutlu gök|.5 .5 .5 .5 .4 .4 .5 .95
Açık mavi gök|.6 .6 .4 .5 .4 .4 .8 .05
`);
  def('homeint', `
Büyük pencere gün|.95 .1 .5 .3 .6 .5 .4 .5
Küçük pencere|.2 .2 .5 .4 .4 .5 .5 .5
Gece lambası|.5 .95 .5 .95 .2 .5 .5 .5
Dolu oda|.5 .3 .95 .4 .5 .5 .5 .5
Boş oda|.5 .3 .05 .3 .5 .5 .5 .5
Güneş huzmesi|.6 .1 .5 .2 .95 .5 .4 .5
Geniş salon|.5 .3 .5 .4 .5 .95 .5 .5
Dar oda|.5 .3 .5 .4 .5 .1 .5 .5
Perdeli loş|.5 .4 .5 .5 .3 .5 .95 .5
Alçak kamera|.5 .3 .5 .4 .5 .5 .5 .05
`);
})();
