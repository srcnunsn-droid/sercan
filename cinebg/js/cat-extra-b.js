/* CineBG Studio — v2 kategori genişlemesi (B): mevcut grupların sonuna eklenen mekanlar. */
(function () {
  const CB = window.CB;
  const X = {
fantasy: `
Ejderha Binicileri Kayalığı|dragon riders' cliff aerie with carved perches over a chasm
Elf Liman Kenti|elven harbour of white stone and silver ships at twilight
Büyücü Akademisi Avlusu|wizard academy courtyard with floating lanterns
Dev Merdivenleri|stairway carved for giants up a mountainside
Peri Halkası Mantarlar|ring of glowing mushrooms in a dark glade
Kristal Ağaç Ormanı|forest of crystal trees refracting moonlight
Gökyüzü Gemisi Limanı|sky-ship dock on a floating rock
Büyülü Sınır Kapısı|enchanted border gate of twisted roots
Cüce Demirci Salonu|dwarven forge hall with lava channels
Kayıp Kraliçe Bahçesi|forgotten queen's garden of stone statues
Unutulmuş Büyü Kütüphanesi|ruined arcane library open to the sky
Yüzen Dağ Manastırı|monastery on a floating mountain
Ejderha İskeleti Köprüsü|bridge built from a dragon spine
Peri Kraliçesi Tahtı|fairy queen throne of woven branches
Taş Dev Uyuyan Tepe|hill shaped like a sleeping stone giant
Büyülü Nehir Kayıkları|enchanted river with lantern boats
Rün Taşları Vadisi|valley of rune-carved standing stones
Bulut Kasabası|town built on cloud banks
Kristal Kale Mağara|crystal fortress inside a cavern
Ayışığı Gölü Tapınağı|moonlit lake shrine with silver trees
Simya Kulesi Laboratuvarı|alchemist tower lab with glowing flasks
Büyülü Kış Ormanı|enchanted winter forest with blue lights
Ejderha Yumurtası Yuvası|volcanic nest with dragon eggs
Elf Kraliyet Salonu|elven throne hall of living trees
Kayıp Krallık Harabeleri|ruins of a lost kingdom in mist
`,
darkfantasy: `
Ruh Hapishanesi|prison of trapped spirits in a black tower
Kan Nehri Vadisi|valley of a red river under dead sky
Kemik Köprüsü|bridge of bones over an abyss
Lanetli Şato Ziyafet Salonu|cursed castle banquet hall frozen in time
Karanlık Lord Tahtı|dark lord's throne on a volcanic dais
Gölge Ormanı Yolu|shadow forest path with watching eyes
Kurban Taşı Tepe|sacrificial stone on a stormy hill
Hayalet Kasaba Sis|ghost town in eternal fog
Vampir Kripta|vampire crypt with stone coffins
Kara Büyü Çemberi|dark ritual circle in a ruined abbey
Ölü Kral Ordusu Ovası|plain of a skeleton army's remains
Lanetli Göl Kalesi|cursed lake castle reflected in black water
Ceset Ağacı|giant dead tree hung with cages
Gotik Kule Laboratuvarı|gothic tower laboratory with lightning rods
Ruhlar Nehri Kayığı|spirit river ferry landing
Karanlık Katedral Çan Kulesi|dark cathedral bell tower interior
Lanetli Maden|cursed mine with glowing veins
Kurt Adam Köyü|werewolf village at full moon
Örümcek Ormanı|forest draped in giant webs
Cadılar Toplanma Yeri|witches' sabbath clearing
Kayıp Ruhlar Labirenti|labyrinth of lost souls
Kızıl Ay Kalesi|castle under a crimson moon
Mezar Taşı Ormanı|forest of tombstones
Karanlık Liman|dark port with black sails
`,
horror: `
Terk Edilmiş Tımarhane Banyosu|abandoned asylum bathroom with cracked tiles
Bodrum Kazan Dairesi|boiler room in a dark basement
Gece Hastane Asansörü|hospital elevator at night
Terk Edilmiş Motel Odası|abandoned motel room
Sisli Göl İskelesi|foggy lake pier at night
Mısır Labirenti|corn maze at dusk
Terk Edilmiş Kampüs Yurdu|abandoned dorm hallway
Çatı Arası Oyuncaklar|attic with old dolls
Ormanda Terk Edilmiş Karavan|abandoned trailer in woods
Kilise Bodrumu|church basement
Yeraltı Tüneli Kapı|tunnel door underground
Terk Edilmiş Bebek Fabrikası|abandoned doll factory
Gece Benzinliği Boş|empty gas station at night
Terk Edilmiş Hapishane|abandoned prison
Eski Malikane Yemek Odası|old mansion dining room
Ormanda Kuyu|well in the woods
Terk Edilmiş Hastane Odası|abandoned hospital room
Sisli Köy Yolu|foggy village road
Terk Edilmiş Kreş|abandoned daycare
Gece Morg Koridoru|morgue corridor at night
Paslı Lunapark Tren|rusty ghost train ride
Ormanda Ritüel Alanı|ritual site in forest
Terk Edilmiş Okul Spor Salonu|abandoned school gym
Göl Evi Gece|lake house at night
`,
sacred: `
Mağara Manastırı|cave monastery with frescoes
Katedral Çan Kulesi İçi|cathedral bell tower interior
Ormanda Tapınak Kapısı|forest temple gate
Dağ Tapınağı Merdiveni|mountain temple stairs in clouds
Gotik Şapel Vitray|gothic chapel with stained glass light
Antik Kutsal Kaynak|ancient sacred spring with steps
Taş Rahip Hücresi|monk's stone cell
Mozaik Kubbe İçi|mosaic dome interior
Manastır Kütüphanesi|monastery library
Çöl Manastırı|desert monastery
Kutsal Ağaç Tapınağı|temple around a sacred tree
Su Tapınağı|water temple with pools
Budist Kaya Heykeli|giant rock-carved Buddha
Kilise Avlusu Mezarlık|churchyard
Tapınak Ateş Salonu|fire temple hall
Ada Manastırı|island monastery
Katedral Org Galerisi|cathedral organ loft
Orman Rahip Kulübesi|hermit hut in forest
Kutsal Göl Kıyısı Basamaklar|ghats by a sacred river
Dağ Haç Yolu|mountain pilgrimage path with crosses
Tapınak Lotus Havuzu|temple lotus pond
Katedral Kubbe Altı|beneath a cathedral dome
`,
palace: `
Saray Taht Merdiveni|palace throne stairway
Kraliyet Balo Terası|royal ballroom terrace
Saray Hazine Galerisi|palace treasure gallery
Kraliyet Harita Odası|royal map room
Saray Labirent Bahçesi|palace maze garden
Saray Çeşme Avlusu|palace fountain court
Saray Kubbe Salonu|palace dome hall
Saray Kış Bahçesi|palace conservatory
Saray Silah Galerisi|palace armoury gallery
Saray Yazlık Köşk|summer pavilion
Saray Tiyatrosu|palace theatre
Saray Kayıkhane|royal boathouse
Saray Avlu Kar|palace courtyard in snow
Saray Kütüphanesi Merdiven|palace library ladder
Saray Hamam Mermer|marble palace hammam
Saray Kapı Muhafız|palace gate guardhouse
Saray Balkon Gece|palace balcony at night
Saray Mutfak Bahçesi|palace kitchen garden
Saray Portre Galerisi|portrait gallery
Saray Altın Oda|gold leaf chamber
`,
residential: `
Sahil Evi Salon|beach house living room
Dağ Evi Şömine|mountain chalet fireplace
Eski Apartman Mutfağı|old apartment kitchen
Lüks Otel Süiti|luxury hotel suite
Japon Minimalist Oda|minimalist Japanese room
Yağmurlu Pencere Oturma|rainy window seat
Bohem Stüdyo Daire|bohemian studio flat
Kır Evi Yatak Odası|farmhouse bedroom
Gece Mutfak Işığı|kitchen at night lit by fridge
Çocukluk Evi Koridoru|childhood home hallway
Yalı Salonu|waterside mansion salon
Modern Banyo|modern bathroom
Ev Ofisi|home office
Çatı Terası Gece|roof terrace at night
Eski Evin Kileri|old pantry
Ev Sineması|home cinema room
Kış Bahçesi Kahvaltı|conservatory breakfast
Bekar Odası Dağınık|messy bachelor room
Lüks Gardırop|walk-in closet
Kulübe Yatağı Pencere|cabin bed by window
Ev Bodrum Atölye|basement workshop
Sahil Kulübesi|beach shack interior
`,
public: `
Tren Garı Bekleme Salonu|train station waiting hall
Hastane Bekleme Odası|hospital waiting room
Okul Kütüphanesi|school library
Üniversite Amfisi|university lecture hall
Belediye Meclis Salonu|council chamber
Banka Gişe Salonu|bank hall
Müze Dinozor Salonu|natural history museum hall
Sanat Galerisi Beyaz|white art gallery
Spor Soyunma Odası|locker room
Yüzme Havuzu Kapalı|indoor swimming pool
Otel Lobisi Gece|hotel lobby at night
Mahkeme Koridoru|courthouse corridor
Hapishane Yemekhanesi|prison mess hall
Polis Sorgu Gözlem|observation room
Kütüphane Arşiv Katı|library stacks
Konser Salonu Boş|empty concert hall
Restoran Mutfağı|restaurant kitchen
Market Gece|supermarket at night
Hastane Ameliyathane|operating room
Okul Kimya Laboratuvarı|school chemistry lab
Dans Stüdyosu|dance studio with mirrors
Bowling Salonu Eski|old bowling alley
`,
transport: `
Gece Treni Koridoru|night train corridor
Havalimanı Pisti Gece|airport runway at night
Liman Konteyner Gemisi|container ship at dock
Otoyol Gişeleri|highway toll booths
Eski Tren Deposu|old train depot
Metro Tüneli Işıklar|metro tunnel lights
Feribot Salonu|ferry passenger lounge
Uçak Kabini Boş|empty airplane cabin
Otobüs Terminali Gece|bus terminal night
Liman Fener Kulesi|harbour light tower
Dağ Treni Köprüsü|mountain railway bridge
Kargo Uçağı İçi|cargo plane interior
Gemi Makine Dairesi|ship engine room
Otopark Kuleleri|parking towers
Tren Garı Peron Kar|snowy station platform
Kanal Teknesi|canal boat
Havalimanı Bagaj Salonu|baggage claim hall
Teleferik Kabini|cable car cabin
Kamyon Durağı Gece|truck stop at night
Otoyol Köprüsü Altı Yağmur|under highway bridge in rain
Raylı Sistem Viyadük|elevated rail viaduct
Gemi Güvertesi Fırtına|ship deck in storm
`,
western: `
Western Ahır|western barn
Kızılderili Kanyonu|canyon with cliff dwellings
Western Maden Ocağı|western mine shaft
Western Kasaba Gece|western town at night
Western Otel Odası|frontier hotel room
Western Demirci|frontier blacksmith
Western Tren Soygunu Noktası|train robbery spot in canyon
Western Çöl Kulübesi|desert cabin
Western Saloon İçi|saloon interior
Western Sığır Ağılı|cattle pens
Western Nehir Geçidi|river crossing
Western Kasaba Kilisesi|town church
Western Çadır Kampı|wagon camp
Western Dağ Geçidi|mountain pass trail
Western Postane|frontier post office
Western Telgraf Ofisi|telegraph office
Western Kasaba Fırtına|town in dust storm
Western Ranch Ev İçi|ranch house interior
Western Sherif Hapishane|jail interior
Western Uçurum Yolu|cliff trail
`,
noir: `
Noir Otel Koridoru|noir hotel corridor
1940lar Polis Merkezi|1940s police bureau
Noir Gece Treni|noir night train
Noir Rıhtım Deposu|dockside warehouse
1950ler Motel Odası|1950s motel room
Noir Merdiven Boşluğu|noir stairwell with shadows
Noir Çatı Yağmur|rooftop in rain
Noir Gece Barı|night bar
Noir Telefon Santrali|telephone exchange
1930lar Otel Lobisi|1930s hotel lobby
Noir Arka Sokak|noir back alley
Noir Kulüp Kulisi|club backstage
1960lar Havalimanı|1960s airport lounge
1970ler Sokak Gece|1970s street at night
Noir Gazete Ofisi|newspaper office
Noir Kumarhane Bodrum|basement gambling den
Noir Sinema Projeksiyon|projection booth
Noir Köprü Sis|foggy bridge
Noir Kıyı Yolu|coastal road at night
Noir Apartman Penceresi|apartment window with blinds
`,
eastasia: `
Japon Sakura Kalesi|castle with cherry blossoms
Kyoto Yağmur Sokağı|Kyoto street in rain
Çin Bambu Köprüsü|bamboo bridge
Japon Zen Tapınağı Kar|zen temple in snow
Kore Neon Sokağı|Seoul neon alley
Çin Dağ Kaya Merdiveni|cliff stairway in China
Japon Tren İstasyonu Kırsal|rural Japanese station
Japon Ryokan Odası|ryokan room
Çin Opera Sahnesi|Chinese opera stage
Japon Kenar Mahalle|Tokyo suburb street
Çin Göl Pavyonu|lake pavilion
Japon Orman Tapınağı|forest shrine
Hong Kong Pazar|Hong Kong market
Japon Balıkçı Limanı Sis|foggy fishing port
Çin Kaligrafi Odası|calligraphy studio
Japon Kalesi Sur|castle walls
Kore Dağ Tapınağı|Korean mountain temple
Japon Neon Tren Geçidi|train crossing in Tokyo
Çin Pirinç Tarlası Köyü|rice field village
Japon Onsen Kasabası|onsen town at night
Çin Saray Kapısı|palace gate
Japon Tapınak Merdiven Sis|temple stairs in mist
`,
anatolia: `
Kapadokya Balon Şafağı|fairy chimney valley at dawn with hot air balloons
Efes Celsus Kütüphanesi|Library of Celsus facade
Göreme Kaya Evleri|cave houses of Göreme
Boğaz Köprüsü Gece|Bosphorus bridge at night
Galata Kulesi Sokağı|street leading to Galata Tower
Süleymaniye Camii Avlusu|grand mosque courtyard
Yerebatan Sarnıcı|underground cistern with columns
Osmanlı Kütüphanesi|Ottoman library
Topkapı Sarayı Avlusu|Topkapı palace courtyard
Kapadokya Yeraltı Şehri|Derinkuyu underground city
Mardin Gün Batımı|Mardin at sunset
Anadolu Köy Evi|Anatolian village house
Karadeniz Yaylası|Black Sea highland
Ağrı Dağı Eteği|foot of Mount Ararat
Van Gölü Kıyısı|Lake Van shore
Hasankeyf Kalıntıları|Hasankeyf ruins
Bergama Tiyatrosu|Pergamon theatre
Kayseri Erciyes Dağı|Mount Erciyes
Bursa Ulu Camii|Bursa grand mosque interior
Safranbolu Çarşı|Safranbolu bazaar
Osmanlı Saat Kulesi|Ottoman clock tower
Çöl Kervan Yolu Arabistan|Arabian caravan trail
Kuyumcular Çarşısı|jewellers bazaar
Taş Han Avlusu|stone inn courtyard
`,
sky: `
Bulut Kanyonu|canyon of clouds
Fırtına Hücresi Gece|storm cell at night
Gün Doğumu Bulutlar|sunrise cloudscape
Kuşlar Gökyüzü|flock of birds in sky
Ay Halesi|moon halo
Sis Vadisi Yukarıdan|fog valley from above
Gökyüzünde Kum Fırtınası|dust storm sky
Gece Gökkuşağı|moonbow
Kuyruklu Yıldız Gecesi|comet over landscape
Yıldız İzleri|star trails
Kırmızı Gökyüzü|red sky
Siyah Bulut Duvarı|shelf cloud
Güneş Huzmeleri Bulut|crepuscular rays
Bulut Dalgaları|wave clouds
Kar Bulutları|snow clouds
Gece Şimşek Ağı|lightning web
Gök Kubbe Altın|golden dome sky
Bulutların Arasında Uçuş|flying through clouds
Mor Akşam|purple evening sky
Gökyüzü Kuzey Işığı Taç|aurora corona
`,
arena: `
Antik Kolezyum Gece|colosseum at night
Kar Arenası|snow arena
Dövüş Tapınağı Avlu|martial arts courtyard
Neon Dövüş Ringi|neon fight ring
Ortaçağ Turnuva Sahası|medieval tournament ground
Çöl Arenası|desert arena
Gemi Güvertesi Arena|ship deck arena
Lav Arenası|lava arena
Orman Arenası|forest arena
Kaya Kubbe Arena|rock dome arena
Çatı Dövüş Alanı|rooftop fight spot
Kafes Arena Yağmur|cage arena in rain
Buz Arenası|ice arena
Su Arenası|flooded arena
Kristal Arena|crystal arena
Antik Hipodrom Kalıntı|ruined hippodrome
Yeraltı Arena Zincirler|underground arena with chains
Tapınak Basamak Arena|temple steps arena
Gökyüzü Arenası|sky arena
Kale Avlusu Arena|castle courtyard arena
`,
nightlife: `
Neon Bar Sokak|neon bar street
Gece Kulübü VIP|nightclub VIP lounge
Karnaval Gece Dönme Dolap|carnival Ferris wheel at night
Sahil Gece Partisi|beach night party
Gizli Bar|hidden bar
Gece Treni Bar|bar car on a night train
Konser Arka Sahne|backstage
Gece Kafe Pencere|night cafe window
Jazz Kulübü Sahne|jazz club stage
Disko Topu Salonu|disco ball hall
Bilardo Salonu|pool hall
Çatı Partisi Işıklar|rooftop party lights
Gece Pazarı Fener|lantern night market
Sokak Festivali|street festival
Neon Karaoke Bar|karaoke bar
Gece Lunapark Atlıkarınca|carousel at night
Kaykay Parkı Gece|skatepark at night
Gece Göl Partisi|lake party
Retro Atari Gece|retro arcade night
Sinema Gala|film premiere red carpet
`,
lab: `
Biyoloji Seraları|biology greenhouses
Robot Kolu Laboratuvar|robot arm lab
Mikroskop Odası|microscope room
Plazma Deney Odası|plasma chamber
Gizli Laboratuvar Tank|lab with specimen tanks
Yapay Zeka Veri Merkezi|AI data center
Uzay Simülatörü|space simulator
Rüzgar Tüneli|wind tunnel
Volkan Araştırma Üssü|volcano research base
Kutup Araştırma Lab|polar lab
Deniz Biyolojisi Lab|marine biology lab
Füze Test Tesisi|rocket test stand
Nükleer Reaktör Kontrol|reactor control room
Biyogüvenlik Laboratuvarı|biosafety lab
Klon Odası|cloning room
Lazer Laboratuvarı|laser lab
Tarih Öncesi Fosil Lab|fossil lab
Elektronik Atölye|electronics workshop
Siber Uzay Odası|virtual reality room
Uydu Kontrol Merkezi|satellite control center
`,
dystopia: `
Distopik Fabrika Hattı|dystopian factory line
Gözetim Kontrol Odası|surveillance control room
Distopik Konut Koridoru|housing block corridor
Propaganda Ekranı Meydanı|plaza with propaganda screens
Distopik Okul Sınıfı|dystopian classroom
Yeniden Eğitim Merkezi|re-education center
Distopik Tren İstasyonu|dystopian station
Kara Yağmur Şehri|black rain city
Distopik Hastane|dystopian hospital
Duvar Ötesi Bölge|zone beyond the wall
Distopik Pazar|black market
Yerin Altı Şehri|subterranean city
Distopik Nehir|polluted river city
Kontrol Kulesi Gece|control tower night
Distopik Arena|dystopian arena
Kimlik Kontrol Salonu|ID check hall
Distopik Park|dead park
Gri Fabrika Kenti|grey factory town
Kayıp Bölge|lost sector
Distopik Kütüphane Yasak|banned library
`,
myth: `
Olimpos Taht Salonu|throne hall of the gods
Hades Kapısı|gate of Hades
Valhalla Ziyafeti|Valhalla feast hall
Poseidon Su Altı Sarayı|Poseidon's underwater palace
Thor Fırtına Dağı|storm mountain of thunder
Mısır Güneş Teknesi|sun barque in the sky
Anka Kuşu Tapınağı|phoenix temple
Hint Mitolojisi Tapınak|mythic Hindu temple
Japon Kami Ormanı|kami spirit forest
Çin Ejderha Kapısı|dragon gate waterfall
Kelt Peri Tepesi|Celtic fairy mound
Slav Baba Yaga Kulübesi|hut on chicken legs
Türk Ergenekon Vadisi|Ergenekon mythic valley
Aztek Tanrı Piramidi|Aztec god pyramid
Mezopotamya Tanrı Bahçesi|garden of the gods
Kuzey Mitolojisi Dünya Yılanı|world serpent coast
Medusa Tapınağı|Medusa temple
Titanlar Yıkıntısı|ruins of titans
Atlantis Kapısı|Atlantis gate
Yunan Labirent Merkez|labyrinth center
`,
disaster: `
Tsunami Sonrası Liman|harbour after tsunami
Yanan Petrol Platformu|burning oil platform
Çöken Baraj|collapsing dam
Kum Fırtınası Otoyol|highway in sandstorm
Kar Fırtınası Şehir|city in blizzard
Sel Metro|flooded metro
Orman Yangını Gece|wildfire night
Kaiju Liman|kaiju in harbour
Kasırga Şehir|hurricane city
Deprem Köprü|earthquake bridge
Volkan Kül Şehir|ash-covered city
Meteor Krateri Şehir|meteor crater city
Buz Fırtınası Orman|ice storm forest
Toz Bulutu Kasaba|dust bowl town
Yanan Orman Yolu|burning forest road
Tsunami Dalga|giant wave
Kaiju Dağı|kaiju mountain
Çöken Gökdelen|collapsing skyscraper
Uzaylı Felaket|alien cataclysm
Sel Köy|flooded village
`,
africa: `
Savan Gün Batımı Baobab|savanna sunset baobab
Kızıl Kum Çölü|red sand desert
Afrika Göl Flamingolar|flamingo lake
Kilimanjaro Ormanı|montane forest
Afrika Çöl Kasabası|desert town
Atlas Dağ Geçidi|Atlas mountain pass
Nil Delta Köyü|Nile delta village
Afrika Kıyı Kalesi|coastal fort
Savan Fırtınası|savanna storm
Kongo Nehri Teknesi|river boat
Afrika Yağmur Ormanı Şelale|rainforest falls
Sahra Kayalıkları|Saharan rock formations
Afrika Pazarı|African market
Savan Gece Kamp|savanna night camp
Afrika Kanyonu|African canyon
Afrika Kaya Resimleri|rock art site
Ngorongoro Krateri|crater highlands
Afrika Tuz Tavası|salt pan
Afrika Dağ Köyü|mountain village
Zambezi Nehri|Zambezi river
`,
villages: `
Alp Köyü Kar|alpine village in snow
Balıkçı Köyü Sisli|foggy fishing village
Toskana Köy Meydanı|Tuscan village square
Dağ Köyü Pazar|mountain village market
İskoç Köy|Scottish village
Norveç Balıkçı Kulübeleri|Norwegian fishing cabins
Fransız Köy Sokağı|French village street
Yunan Köy Merdiven|Greek village stairs
Japon Köy Kış|Japanese village in winter
Meksika Kasaba|Mexican town
Hint Köy|Indian village
Kırsal İngiliz Pub|country pub
Alman Ortaçağ Kasaba|German medieval town
Rus Kış Köyü|Russian winter village
Balkan Köy Köprü|Balkan village bridge
Dağ Köyü Yağmur|village in rain
Köy Meydanı Festival|village festival
Köy Okulu|village school
Köy Değirmeni|village windmill
Köy Kilisesi Kar|village church in snow
`,
roads: `
Yol Ayrımı|crossroads
Sonsuz Tarla Yolu|endless farm road
Gece Yol Kenarı|roadside at night
Dağ Yolu Gün Batımı|mountain road sunset
Çöl Yolu Kum Fırtınası|desert road sandstorm
Orman Yolu Sonbahar|forest road autumn
Kar Yolu Gece|snowy road night
Kıyı Yolu Fırtına|coastal road storm
Yol Kenarı Motel|roadside motel
Terk Edilmiş Yol|abandoned road
Köprü Yolu Sis|bridge road fog
Yol Tüneli Işık|road tunnel light
Taşlı Patika|stony path
Dağ Patikası Bulut|mountain trail clouds
Toprak Yol Yağmur|dirt road rain
Gece Otoyol Işıkları|highway lights night
Yol Tabelası Çöl|desert road sign
Kanyon Yolu Gece|canyon road night
Viraj Yol Uçurum|cliff bend
Yol Kenarı Diner|roadside diner
`,
  };
  Object.entries(X).forEach(([id, text]) => CB.extendGroup(id, text));
})();
