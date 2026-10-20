/* CineBG Studio — v2 yeni gruplar (B). */
(function () {
  const CB = window.CB;
  CB.extendArch('micro', {
    center: ['a glowing cell nucleus', 'a cluster of drifting spores', 'a crystalline lattice node', 'a pulsing membrane', 'a single bright particle'],
    left: ['a branching neuron', 'a spiral strand', 'a column of bubbles', 'a translucent tendril', 'a fibre bundle'],
    right: ['a honeycomb structure', 'a cluster of cells', 'a crystal growth', 'a coral-like branch', 'a pollen grain'],
    far: ['a soft-focus field of particles', 'a deep blue void', 'a glowing horizon of tissue', 'bokeh of distant cells', 'a dark liquid depth'],
    floor: ['dark liquid medium', 'deep translucent fluid', 'dark gel', 'black void'],
    materials: ['translucent membrane', 'liquid', 'crystal', 'bioluminescent tissue', 'silica'],
  });
  CB.extendArch('abstract', {
    center: ['a soft glowing orb', 'a light streak crossing the frame', 'a smooth gradient bloom', 'a ribbon of silk-like light', 'a lens flare core'],
    left: ['a column of haze', 'a soft bokeh cluster', 'a curved light trail', 'a fold of liquid colour', 'a beam of light'],
    right: ['a cluster of particles', 'a diagonal light leak', 'an arc of colour', 'a translucent wave', 'a soft prism glare'],
    far: ['deep negative space', 'a dark gradient horizon', 'a soft vignette falloff', 'a distant glow', 'a field of tiny particles'],
    floor: ['dark matte base', 'deep shadow gradient', 'black velvet base', 'dark reflective floor'],
    materials: ['light', 'haze', 'liquid colour', 'glass', 'smoke'],
  });
  [
    { id: 'latam', tr: 'Latin Amerika & Mezoamerika', arch: 'ancient', ctx: 'mixed', engines: ['forest', 'mountains', 'dunes', 'city', 'godrays'], cond: ['pristine', 'lived-in', 'ruined', 'misty'], genres: ['history', 'nature'], items: `
Teotihuacan Ölüler Caddesi|avenue of the dead with pyramids of the sun and moon
Machu Picchu Bulutlar|mountain citadel above clouds with terraces
Aztek Tenochtitlan Kanalları|lake city canals with chinampa gardens
Maya Gözlemevi|Maya observatory tower in jungle
Inka Taş Yolu|Inca stone road on a mountain ridge
Havana Eski Şehir|colonial street with colourful facades and old cars
Rio Favela Gece|hillside favela at night with lights
Patagonya Buzulu|Patagonian glacier face
Atacama Gece Gökyüzü|Atacama desert under stars
Amazon Nehir Köyü|river village on stilts
Meksika Hacienda|colonial hacienda courtyard
Ölüler Günü Mezarlığı|cemetery decorated with candles and marigolds
Uyuni Tuz Aynası|salt flat mirror at sunset
Galapagos Volkanik Sahil|volcanic coast with marine life
And Dağları Köyü|Andean village with llamas
Buenos Aires Tango Salonu|tango hall with chandeliers
Kolonyal Katedral|colonial cathedral plaza
Iguazu Şelaleleri|vast horseshoe waterfalls
Maya Cenote Tapınağı|cenote with temple steps
Peru Çöl Çizgileri|desert plain with giant geoglyphs
Karayip Liman Kalesi|Caribbean harbour fort
Kolombiya Kahve Tepeleri|coffee hills with wax palms
Meksika Pazar|Mexican market with piñatas
Aztek Tapınağı Zirve|temple summit with fire altar
Brezilya Plajı Gün Batımı|Brazilian beach sunset
Inka Tuz Terasları|salt terraces in the Andes
Gökkuşağı Dağı|striped rainbow mountain
Karayip Kumsal Kasabası|Caribbean beach town
Maya Top Sahası Orman|ballcourt in jungle
Meksika Çöl Kilisesi|desert mission church
Arjantin Pampa Çiftliği|pampas estancia
Kolonyal Kasaba Gece|colonial town at night
Amazon Ağaç Tepesi|canopy walkway
Titicaca Saz Adaları|floating reed islands
Inka Saray Duvarları|Inca palace walls
Meksika Kanyon|copper canyon
Kolonyal Liman|colonial harbour with galleons
Venezuela Masa Dağı|tabletop mountain with waterfall
Yucatan Plajı Tapınak|beach cliff temple
Guatemala Volkan Göl|volcano lake
Şili Fiyortları|Chilean fjords
Karnaval Sokağı Rio|Rio carnival street
Meksika Sokak Mural|street with murals
Aztek Pazar Gece|Aztec market at night
Kolonyal Manastır|colonial convent
And Gölü|high Andean lagoon
Maya Saray|Maya palace
` },
    { id: 'parks', tr: 'Kuzey Amerika & Milli Parklar', arch: 'nature', ctx: 'ext', engines: ['mountains', 'forest', 'canyon', 'dunes', 'ocean'], cond: ['pristine', 'misty', 'snowbound', 'autumnal'], genres: ['nature'], items: `
Büyük Kanyon Kenarı|vast layered canyon at sunset
Yosemite Granit Vadisi|granite valley with waterfall and domes
Sekoya Ormanı Sis|giant sequoia grove in fog
Yellowstone Gayzer|geyser basin with steam
Antilop Kanyonu|slot canyon with light beams
Arches Kum Taşı Kemer|sandstone arch at night
Alaska Buzulu|Alaskan glacier and mountains
Kayalık Dağlar Gölü|Rocky Mountains lake
Ölüm Vadisi Kum Tepeleri|Death Valley dunes
Pasifik Kıyı Yolu|Pacific coast cliffs
Büyük Dumanlı Dağlar|smoky mountain ridges
Everglades Bataklık|swamp with mangroves
Zion Kanyonu Nehir|river through canyon walls
Banff Turkuaz Göl|turquoise lake with peaks
Monument Valley Gece|buttes under stars
Bryce Kanyonu Kayalar|hoodoo rock spires
Olympic Yağmur Ormanı|moss rainforest
Glacier Park Dağ Yolu|mountain road
Kanada Kuzey Gölü|northern lake with canoe
Niagara Şelalesi|great waterfall
Hawaii Volkan Lav|lava flow into sea
Sedona Kızıl Kayalar|red rocks
Mojave Joshua Ağaçları|Joshua tree desert
Kanada Kuzey Işıkları|aurora over lake
Teton Dağları Ahır|barn with mountains
Badlands Gün Doğumu|badlands sunrise
Oregon Kıyı Kayaları|sea stacks
Yellowstone Renkli Havuz|prismatic spring
Alaska Fiyortu|Alaska fjord
Kanada Ormanı Sonbahar|autumn maple forest
Utah Kanyon Gece|canyon under Milky Way
Yosemite Kış|Yosemite valley in winter
Sekoya Gövde Tüneli|tree tunnel road
Büyük Göller Fırtına|lake storm
Appalachian Patika|mountain trail
Kaliforniya Çölü Yol|desert road
Kanada Dağ Treni|mountain train
Alaska Ayı Nehri|salmon river
Kanyon Nehri Kayak|canyon river kayaks
Hawaii Şelale Vadisi|waterfall valley
Kızıl Kayalar Amfitiyatro|red rock amphitheatre
Dağ Çayırı Sabah|alpine meadow morning
Mesa Kulübesi|mesa cabin
Kuzey Kanada Tundra|tundra
Kıyı Sekoya Plajı|redwood beach
` },
    { id: 'academy', tr: 'Okullar, Akademiler & Büyü Okulları', arch: 'palace', ctx: 'int', engines: ['hall', 'godrays', 'orbs', 'tunnel'], cond: ['pristine', 'candlelit', 'abandoned', 'enchanted'], genres: ['fantasy', 'interior'], items: `
Büyü Okulu Yemek Salonu|great dining hall with floating candles and long tables
Gotik Akademi Kütüphanesi|gothic academy library with rolling ladders
Simya Sınıfı|alchemy classroom with cauldrons
Akademi Astronomi Kulesi|astronomy tower with telescopes
Büyülü Merdiven Salonu|hall of moving staircases
Akademi Revakları|academy cloister with arches
Eski Üniversite Amfisi|old lecture theatre with wooden tiers
Akademi Ortak Salonu|common room with fireplace
Yatakhane Odası|dormitory with four-poster beds
Akademi Sera|academy greenhouse with strange plants
Büyü Düello Salonu|duelling hall
Gizli Kütüphane Bölümü|restricted library section
Akademi Bahçesi Kar|academy courtyard in snow
Akademi Rasathane Kubbe|observatory dome classroom
Akademi Müzik Salonu|music hall
Akademi Spor Sahası|quidditch-like sports field
Akademi Kazan Mahzeni|potions cellar
Akademi Saat Kulesi|clock tower interior
Askeri Akademi Avlusu|military academy parade ground
Sanat Akademisi Atölyesi|art academy studio
Tıp Fakültesi Anatomi|anatomy theatre
Akademi Harita Odası|map room
Akademi Koridor Portreler|corridor of portraits
Akademi Göl Kayıkhane|lake boathouse
Akademi Yasak Orman Kenarı|forest edge by school
Akademi Kule Merdiveni|tower spiral stairs
Akademi Toplantı Salonu|assembly hall
Akademi Laboratuvar Eski|old science lab
Akademi Çatısı Gece|school rooftop at night
Akademi Kilisesi|academy chapel
Akademi Mutfak|school kitchens
Akademi Bahçe Labirent|hedge maze
Akademi Arşiv|archive vault
Akademi Bekleme Salonu|entrance hall
Akademi Kütüphanesi Gece|library at night
Akademi Hastane Kanadı|infirmary wing
Akademi Kemerli Köprü|covered bridge
Akademi Okuma Odası|reading room
Akademi Hayvan Ahırı|creature stables
Akademi Mezuniyet Salonu|graduation hall
` },
    { id: 'modernarch', tr: 'Modern Mimari & Lüks Mekanlar', arch: 'interior', ctx: 'mixed', engines: ['hall', 'skyline', 'orbs', 'ocean'], cond: ['pristine', 'empty', 'lit', 'calm'], genres: ['urban', 'interior'], items: `
Beton Brütalist Müze|brutalist concrete museum with skylight slits
Cam Köşk Orman|glass pavilion in a forest
Minimalist Villa Havuz|minimalist villa with infinity pool
Uçurum Evi Okyanus|cliff house over the ocean
Modern Kütüphane Atrium|modern library atrium with white curves
Lüks Otel Havuzu Gece|luxury hotel pool at night
Çöl Modern Evi|desert modern house
Gökdelen Lobisi Mermer|marble skyscraper lobby
Sanat Galerisi Beton|concrete art gallery
Modern Opera Binası|modern opera house
Japon Beton Tapınak|concrete chapel with light cross
Çatı Katı Cam Duvar|penthouse with glass walls
Yeraltı Şarap Mahzeni Modern|modern wine cellar
Spa Taş Banyo|stone spa bath
Modern Havalimanı Kanopi|airport canopy
Kavisli Beyaz Koridor|curved white corridor
Su Üstü Villa|overwater villa
Dağ Evi Cam|glass mountain cabin
Modern Kilise Işık|modern church with light shafts
Lüks Yat Salonu|yacht salon
Modern Müze Merdiven|museum spiral staircase
Beton Konut Avlusu|concrete housing courtyard
Modern Ofis Kulesi Gece|office tower at night
Cam Asansör Atrium|glass elevator atrium
Çöl Spa|desert spa
Orman Otel|treehouse hotel
Kar Oteli|snow hotel lodge
Lüks Mağaza|luxury boutique
Modern Kafe Beton|concrete cafe
Yapay Göl Pavyon|lake pavilion
Modern Stadyum Çatısı|stadium roof structure
Kubbe Ev|dome house
Kum Taşı Modern Müze|sandstone museum
Cam Köprü|glass skybridge
Modern Tren Garı Beyaz|white modern train station
Bahçe Teras Villa|garden terrace villa
Lüks Restoran Gece|luxury restaurant at night
Modern Kule Spiral|twisting tower
Beton Merdiven Işık|concrete stair with light
Modern Hastane Atrium|hospital atrium
` },
    { id: 'vehicles', tr: 'Araç İçleri & Kokpitler', arch: 'interior', ctx: 'int', engines: ['tunnel', 'city', 'rainglass', 'anamorphic', 'clouds'], cond: ['operational', 'damaged', 'empty', 'wet'], genres: ['interior', 'urban'], items: `
Gece Araba İçi Yağmur|car interior at night in rain with city lights on glass
Uçak Kokpiti Gece|airliner cockpit at night with glowing instruments
Savaş Uçağı Kokpiti|fighter jet cockpit above clouds
Helikopter Kabini|helicopter cabin with open door
Tren Kabini Önden|train driver's cab view
Taksi Arka Koltuk|taxi back seat at night
Otobüs Şoför Yeri|bus driver seat view
Denizaltı Periskop Odası|submarine periscope room
Uzay Mekiği Kokpiti|space shuttle cockpit
Yat Kaptan Köşkü|yacht bridge
Kamyon Kabini Gece|truck cab at night
Polis Arabası İçi|police car interior with lights
Ambulans İçi|ambulance interior
Tren Vagonu Yemek|dining car
Lüks Jet Kabini|private jet cabin
Tank İçi|tank interior
Gemi Köprüsü Fırtına|ship bridge in storm
Teleferik İçi|cable car interior
Metro Vagonu Boş|empty metro carriage
Klasik Araba İçi|classic car interior
Kamp Karavanı|camper van interior
Uzay Kapsülü|space capsule interior
Zeplin Köprüsü|airship bridge
Hız Treni Kabini|bullet train cabin
Motosiklet Gece Yol|motorcycle POV night road
Feribot Köprüsü|ferry bridge
Uçak Kargo Ambarı|cargo bay
Askeri Nakliye İçi|military transport interior
Sürücü Koltuğu Çöl|driver seat desert road
Otomobil Kaza Sonrası|car interior after crash with shattered glass
Lüks Limuzin|limousine interior
Kar Paletli Araç|snowcat cabin
Denizaltı Koridoru|submarine corridor
Gelecek Araba Kokpiti|future car cockpit
Gece Treni Yatak|sleeper compartment
Uçak Tuvalet Koridoru|aircraft aisle at night
Uzay Gemisi Pilot|starfighter cockpit
Antik Araba Arabası|horse carriage interior
` },
    { id: 'filmset', tr: 'Film Stüdyosu & Sahne Arkası', arch: 'interior', ctx: 'int', engines: ['hall', 'anamorphic', 'orbs', 'godrays'], cond: ['lit', 'empty', 'busy-but-empty', 'pristine'], genres: ['interior', 'abstract'], items: `
Boş Ses Sahnesi|empty soundstage with lighting grid and cyclorama
Yeşil Perde Stüdyosu|green screen studio with lights
Film Seti Kulis|backstage with costume racks
Western Dış Çekim Seti|western backlot street
Makyaj Odası Aynalar|makeup room with bulb mirrors
Film Projeksiyon Odası|projection booth
Kurgu Odası|editing suite with monitors
Kamera Vinç Seti|camera crane on set
Fotoğraf Stüdyosu Siyah|black photo studio with softbox
Sahne Işık Ekipmanı|lighting rig on stage
Sinema Salonu Perde|cinema screen glow
Stüdyo Atölye Dekor|scenic workshop
Film Arşivi Bobinler|film archive with reels
Ses Kayıt Stüdyosu|recording studio
Tiyatro Sahne Arkası|theatre backstage ropes
Sahne Spot Işığı|single spotlight on stage
Stüdyo Kostüm Deposu|costume warehouse
Dış Çekim Şehir Seti|backlot city street at night
Film Gala Kırmızı Halı|premiere red carpet
Stüdyo Yağmur Makinesi|rain machine on set
Siyah Kutu Stüdyo|black box studio
Model Şehir Minyatür|miniature city set
Stüdyo Duman Makinesi|haze on stage
Talk Show Seti|talk show set
Haber Stüdyosu|news studio
Müzik Klibi Neon Seti|neon music video set
Konser Sahne Lazer|concert stage with lasers
Opera Kulis|opera backstage
Animasyon Stüdyosu|animation studio desks
Film Okulu Stüdyo|film school studio
Stüdyo Çatısı Gece|studio lot rooftop at night
Eski Hollywood Stüdyo|classic studio lot
Kamera Deposu|camera rental room
Stüdyo Koridoru|studio corridor with doors
Dublaj Stüdyosu|dubbing studio
Fotoğraf Karanlık Oda|darkroom with red light
` },
    { id: 'crime', tr: 'Suç Dünyası & Mafya', arch: 'urban', ctx: 'mixed', engines: ['city', 'rainglass', 'hall', 'skyline'], cond: ['wet', 'smoky', 'lived-in', 'empty'], genres: ['urban', 'horror'], items: `
Mafya Restoranı Arka Oda|back room of a mob restaurant with cards and smoke
Liman Deposu Gece Teslimat|harbour warehouse at night with crates
Yeraltı Kumarhane|underground casino
Boş Otopark Buluşma|empty parking garage meeting spot
Suç Mahalli Sokak|crime scene street with tape
Motel Saklanma Odası|motel hideout room with money on bed
Banka Kasası Soygun|bank vault during heist
Polis Delil Odası|evidence room
Sorgu Odası Ayna|interrogation with one-way mirror
Çatı Keskin Nişancı|rooftop sniper position
Mafya Konağı Ofis|mob boss office
Gece Kulübü Arka Ofis|club back office
Uyuşturucu Laboratuvarı Terk|abandoned drug lab
Köprü Altı Buluşma|meeting under a bridge
Gece Kasap Dükkanı|butcher shop at night
Hurdalık Gece|junkyard at night
Terk Edilmiş Fabrika Pazarlık|abandoned factory deal
Çamaşırhane Gizli|hidden laundromat back room
Liman Konteyner Gizli|container hideout
Kumarhane Güvenlik Odası|casino surveillance room
Mafya Cenaze Kilise|church funeral
Gece Arabası Takip|car chase street
Hapishane Ziyaret|prison visit room
Dedektif Panosu|detective evidence board
Banka Lobisi|bank lobby
Çatı Kaçış|rooftop escape
Kanalizasyon Kaçış|sewer escape
Terk Edilmiş Tren Deposu Buluşma|train yard meeting
Neon Bilardo|neon pool hall
Gece Sahil Yolu|night coast road
Kasa Dairesi|safe room
Kırmızı Işık Sokağı|red-lit street
Gizli Bodrum Kumar|basement gambling
Otel Süit Gece|hotel suite at night
Liman Sisli İskele|foggy pier
Yeraltı Dövüş Barı|fight bar
Polis Karakolu Gece|police station night
Mücevher Mağazası Gece|jewellery store at night
` },
    { id: 'fairytale', tr: 'Masal & Çocuk Kitabı Dünyaları', arch: 'fantasy', ctx: 'mixed', engines: ['forest', 'castle', 'orbs', 'clouds'], cond: ['enchanted', 'pristine', 'ancient', 'calm'], genres: ['fantasy'], items: `
Zencefilli Kurabiye Evi|gingerbread cottage in a dark forest clearing
Masal Şatosu Bulutlar|fairy-tale castle above clouds
Fasulye Sırığı Gökyüzü|giant beanstalk into the sky
Uyuyan Güzel Sarmaşık Kale|castle wrapped in thorny roses
Masal Köprüsü Trol|stone troll bridge over a brook
Kırmızı Başlıklı Orman Yolu|forest path to grandmother's cottage
Masal Değirmeni|windmill in a meadow of flowers
Cüceler Kulübesi|dwarf cottage in woods
Masal Kuyusu|wishing well
Şeker Krallığı|candy kingdom
Ayna Salonu Masal|magic mirror hall
Masal Göl Kuğuları|swan lake castle
Oyuncak Dükkanı Gece|toy shop at night
Kitap Sayfası Ormanı|forest of giant books
Peri Kulesi|fairy tower with spiral vines
Masal Pazarı|storybook market
Balkabağı Tarlası|pumpkin patch at night
Masal Köyü Kar|snowy storybook village
Rüya Bulutları|dream clouds with stars
Masal Kayığı Nehir|swan boat on river
Uçan Halı Gökyüzü|sky over desert palace
Masal Mağarası Hazine|treasure cave
Masal Orman Gece|enchanted forest night
Masal Saray Balo|palace ball
Kurbağa Prens Gölü|lily pond with crown
Masal Ağaç Evi|tree house
Masal Kış Sarayı|winter palace
Masal Deniz Feneri|lighthouse with stars
Masal Kuleleri Gün Batımı|towers at sunset
Masal Köprüsü Gökkuşağı|rainbow bridge
Masal Kütüphanesi|story library
Masal Tren Yolu|toy train landscape
Masal Bulut Kalesi|cloud castle
Masal Mantar Köyü|mushroom village
Ay Üstünde Ev|house on the moon
Masal Bahçe Labirent|maze garden
Ateş Böcekli Göl|firefly lake
Masal Yatak Odası|nursery bedroom at night
Masal Pazar Yeri|market square fair
Masal Dağ Yolu|mountain path to castle
` },
    { id: 'medievallife', tr: 'Ortaçağ Yaşamı & İç Mekanlar', arch: 'fortress', ctx: 'int', engines: ['hall', 'godrays', 'fire'], cond: ['lived-in', 'candlelit', 'smoky', 'pristine'], genres: ['history', 'interior'], items: `
Ortaçağ Meyhanesi|medieval tavern with long tables, hearth and tankards
Şövalye Zırh Odası|knight's armoury room
Ortaçağ Kalesi Büyük Salon|great hall with banners and fireplace
Manastır Yazı Odası|monastery scriptorium with desks and manuscripts
Ortaçağ Mutfağı|castle kitchen with spits and cauldrons
Simyacı Atölyesi|alchemist's workshop
Ortaçağ Demirci İçi|blacksmith interior with forge
Köylü Kulübesi|peasant cottage interior
Ortaçağ Değirmen İçi|mill interior with grinding stones
Kale Yatak Odası|lord's bedchamber
Manastır Yemekhanesi|monastery refectory
Ortaçağ Hastanesi Koğuşu|hospital ward with arches
Kale Şarap Mahzeni|wine cellar
Ortaçağ Dokuma Atölyesi|weaving workshop
Kraliyet Konsey Odası|royal council room
Ortaçağ Hamam|bathhouse
Kale Ahırı|castle stables
Ortaçağ Kütüphanesi|chained library
Ortaçağ Lonca Salonu|guild hall
Ortaçağ Taverna Odaları|inn rooms
Kale Hazine Odası|treasury
Ortaçağ Kilise İçi|village church interior
Ortaçağ Çömlekçi|pottery workshop
Ortaçağ Fırın|bakery with ovens
Kale Muhafız Odası|guard room
Ortaçağ Mahkeme Salonu|court hall
Ortaçağ Okçu Atölyesi|bowyer workshop
Ortaçağ Kral Tahtı|throne room
Kale Kule Odası|tower room
Ortaçağ Ambar|grain barn
Ortaçağ Bira Evi|brewhouse
Ortaçağ Ziyafet|feast in great hall
Ortaçağ Tapınak Şövalye|knight vigil chapel
Ortaçağ Hekim Odası|physician's room
` },
    { id: 'navalair', tr: 'Savaş Alanları · Deniz & Hava', arch: 'battle', ctx: 'ext', engines: ['ocean', 'storm', 'clouds', 'fire'], cond: ['aftermath', 'burning', 'stormy', 'eve'], genres: ['war'], items: `
Uçak Gemisi Fırtına|aircraft carrier in a storm with planes lashed down
Hava Savaşı Bulutlar|dogfight sky of contrails above clouds
Batan Savaş Gemisi|sinking battleship with burning oil on water
Denizaltı Saldırısı Gece|submarine surfacing at night
Konvoy Atlantik|convoy of ships in grey Atlantic
Bombardıman Uçağı Formasyonu|bomber formation sky
Yanan Petrol Denizi|burning oil slick at night
Deniz Mayını Limanı|harbour with sea mines
Kamikaze Gökyüzü|sky of falling aircraft
Paraşüt Gökyüzü Şafak|paratroopers at dawn sky
Hava Üssü Bombardıman|airfield under bombing
Uçaksavar Gece|flak-filled night sky
Deniz Savaşı Top Ateşi|battleship broadside at sea
Kıyı Çıkarma Gemileri|landing craft at sea
Hava Savaşı Gün Batımı|dogfight at sunset
Yanan Uçak Düşüşü|burning plane falling
Torpido Hattı|torpedo wakes in water
Denizde Kurtarma Sandalı|lifeboat at sea
Gelecek Hava Savaşı|future air battle
Uzay Gemisi Atmosfere Giriş|ship entering atmosphere
Zeplin Saldırısı|zeppelin raid
Deniz Kuşatması Kale|naval siege of a fort
Buzlu Deniz Konvoy|Arctic convoy
Uçak Gemisi Güvertesi Kalkış|carrier deck launch
Denizaltı İçi Saldırı|submarine attack interior
Hava İndirme Gecesi|night air drop
Bulutların Üstünde Bombardıman|bombing above clouds
Deniz Feneri Savaş|lighthouse in naval battle
Gemi Mezarlığı Körfez|bay of sunken ships
Fırtınada Destroyer|destroyer in storm
Hava Gemisi Savaşı|airship battle
Okyanus Ortasında Patlama|explosion at sea
Gelecek Deniz Filosu|future fleet
Kaiju Deniz Savaşı|sea monster battle
Hava Kalesi Kokpit|bomber cockpit view
Sahil Topçu Ateşi|coastal guns firing
` },
    { id: 'micro', tr: 'Biyolojik & Mikro Dünyalar', arch: 'micro', ctx: 'abstract', engines: ['cells', 'nebula', 'smoke', 'orbs', 'underwater'], cond: ['glowing', 'pristine', 'violent', 'quiet'], genres: ['abstract', 'scifi'], items: `
Kan Damarı İçi|inside a blood vessel with drifting red cells
Nöron Ağı|network of glowing neurons and synapses
DNA Sarmalı|double helix strands in soft light
Hücre Bölünmesi|cell division under microscope
Virüs Kümesi|virus particles in fluid
Kar Tanesi Makro|macro snowflake crystal
Polen Taneleri|pollen grains in light
Mercan Polipleri|coral polyps macro
Böcek Gözü Makro|insect compound eye
Kristal Büyüme|crystal growth macro
Su Damlası Makro|water droplet macro
Bakteri Kolonisi|bacteria colony
Beyin Dokusu|brain tissue glow
Yaprak Damarları|leaf veins backlit
Plankton Okyanusu|plankton in ocean
Mantar Sporları|fungal spores
Göz İrisi Makro|eye iris macro
Kemik İliği|bone lattice structure
Akciğer Alveolleri|lung alveoli
Mikroçip Yüzeyi|microchip surface macro
Nano Robotlar|nanobots in bloodstream
Kas Lifleri|muscle fibres
Hücre Zarı|cell membrane
Silikat Diatome|diatom shells
Kalp İçi|inside a heart chamber
Ateş Böceği Işığı Makro|bioluminescent glow macro
Kristal Mineral|mineral crystals
Deri Hücreleri|skin cells
Bitki Hücreleri|plant cells
Mikro Akış Kanalları|microfluidic channels
Kan Pıhtısı|blood clot
Embriyo Hücreleri|embryo cells
Sinir Sinyali|nerve signal flash
Kırmızı Kan Hücreleri Akış|red blood cell flow
Bağışıklık Hücresi|immune cell attack
Mikrop Savaşı|microbe battle
` },
    { id: 'abstract', tr: 'Soyut & Motion Grafik Arka Planları', arch: 'abstract', ctx: 'abstract', engines: ['orbs', 'silk', 'anamorphic', 'smoke', 'galaxy', 'synthwave', 'cells'], cond: ['glowing', 'calm', 'dramatic', 'pristine'], genres: ['abstract'], items: `
Sinematik Başlık Arka Planı|dark cinematic title background with soft light leak
Altın Toz Parçacıkları|golden dust particles drifting in darkness
Mavi Işık Sızıntısı|blue light leak over black
Akışkan Renk Dalgası|fluid colour wave
Soyut Duman Perdesi|abstract smoke curtain
Kırık Cam Işık|shattered glass light refractions
Neon Çizgi Akışı|neon line flow
Bokeh Gece Işıkları|night bokeh lights
Prizma Işık Kırılması|prism light dispersion
Sıvı Altın|liquid gold surface
Kadife Degrade|velvet gradient
Holografik Folyo|holographic foil texture
Yıldız Tozu Kuyruğu|stardust trail
Işık Hızında Tünel|warp speed tunnel
Mürekkep Suda|ink in water
Sinematik Lens Flare|cinematic lens flare
Geometrik Işık Izgarası|geometric light grid
Soyut Okyanus Yüzeyi|abstract water surface
Parlak Kum Dalgaları|glowing sand waves
Retro Gün Batımı Izgara|retro sunset grid
Aurora Şeritleri|aurora ribbons
Siyah Mermer Altın|black marble with gold veins
Elektrik Akım|electric current arcs
Karanlık Sis Katmanları|dark fog layers
Pastel Bulutlar|pastel clouds
Cam Küreler|glass spheres
Işık Perdesi|curtain of light rays
Partikül Patlaması|particle burst
Yumuşak Odak Şehir|soft-focus city glow
Ses Dalgası Grafiği|sound wave visual
Kozmik Toz Bulutu|cosmic dust
Kırmızı Halı Spotları|red carpet spotlights
Ödül Töreni Işıkları|award show lights
Trailer Başlık Dokusu|trailer title texture
Film Grenli Siyah|film grain black
Altın Saat Işık Huzmesi|golden hour light beam
Duman ve Lazer|smoke and laser
Nefes Alan Degrade|breathing gradient
Yansıyan Su Işığı|caustic light reflections
Gece Yağmuru Bokeh|rain bokeh night
Spiral Galaksi Logo Fon|spiral galaxy logo background
Sinematik Siyah Boşluk|cinematic black void with rim light
` },
  ].forEach(CB.addGroup);

  const MORE = {
prison: `
Hapishane Kapı Kontrol|sally port gate control room with monitors
Hücre Kapısı Gece Feneri|cell door lit by a guard's flashlight
Zindan Kemerli Koridor|arched dungeon corridor with torches
Hapishane Güvenlik Odası|security room with camera monitors
Ortaçağ Kule Hapsi|tower prison cell with high window
Kamp Dikenli Tel Avlu|camp yard with barbed wire
Hapishane Ceza Koğuşu|punishment block
Hapishane Berber|prison barbershop
Hapishane Telefon Hattı|row of prison phones
Hapishane Kantin|prison commissary
Hapishane Su Kulesi|prison water tower at dusk
Kaçış Tüneli|escape tunnel dug through soil
Hapishane Mahkum Bahçesi|inmate garden
Kalebent Taş Hücre|stone cell carved in rock
`,
filmset: `
Stüdyo Kapısı Gece|soundstage door with red light at night
Sahne Perdesi Kapalı|closed red stage curtain with footlights
Film Seti Uzay Gemisi|starship set built on a soundstage
Kostüm Prova Odası|costume fitting room
Stüdyo Kamera Arabası Rayı|dolly track on set
Prodüksiyon Ofisi|production office with call sheets
Çekim Arası Set|empty set between takes
Karavan Oyuncu Odası|actor trailer interior
Gece Çekimi Sokak Işıkları|night shoot street with lights
Stüdyo Sis Ormanı|indoor forest set with haze
Stüdyo Deniz Tankı|studio water tank set
Işık Paneli Duvarı|LED volume wall stage
Film Afiş Deposu|poster archive
Sinema Lobi Eski|old cinema lobby
`,
micro: `
Saç Teli Makro|hair strand macro
Kelebek Kanadı Pulları|butterfly wing scales macro
Kuvars Kristal İçi|inside quartz crystal
Sabun Köpüğü Yüzeyi|soap bubble surface
Buz Kristali Makro|ice crystal macro
Böcek Kanadı Damarları|insect wing veins
Mikro Mantar Ormanı|micro fungal forest
Tuz Kristalleri|salt crystals
Hücre Mitokondri|mitochondria inside a cell
Kan Plazması|blood plasma glow
Elmas Kesik Işık|diamond facets light
Sıvı Kristal|liquid crystal colours
Toz Zerreleri Işık|dust particles in light beam
Örümcek Ağı Çiy|dew on spider web
`,
medievallife: `
Ortaçağ Kütük Ev Gece|log cabin at night by candle
Ortaçağ Değirmenci Evi|miller's house
Ortaçağ Kale Merdiveni|castle spiral stairway
Ortaçağ Şapel Mum|chapel candles
Ortaçağ Tüccar Evi|merchant house
Ortaçağ Atölye Dericisi|leatherworker shop
Ortaçağ Kral Yatağı|royal bedchamber
Ortaçağ Kuşatma Hazırlık Salonu|war council hall
Ortaçağ Okul Manastır|monastic school
Ortaçağ Kuyu Avlusu|well courtyard
Ortaçağ Barut Odası|powder room
Ortaçağ Gözcü Odası|watch room
Ortaçağ Saray Mutfağı|palace kitchen
Ortaçağ Dokuma Tezgahı|loom room
`,
navalair: `
Kıyıya Vurmuş Uçak|plane crashed on a beach
Gemi Güvertesi Yangın|burning ship deck
Okyanus Üstü Gün Batımı Filo|fleet at sunset
Hava Üssü Gece Kalkış|night takeoff
Uçak Gemisi Hangar Güvertesi|carrier hangar deck
Bulutların İçinde Kayıp Uçak|plane lost in clouds
Deniz Feneri Kurtarma|lighthouse rescue
Denizaltı Batık|sunken submarine
Okyanus Fırtına Kurtarma|storm rescue at sea
Hava Savaşı Şehir Üstü|dogfight over city
Kanal Geçidi Savaş|channel crossing
Kıyı Radar İstasyonu|coastal radar
Helikopter Gemisi|helicopter over ship
Liman Bombardıman Sonrası|harbour after bombing
`,
vehicles: `
Kamyonet Arka Kasası|pickup truck bed at sunset
Eski Otobüs İçi|vintage bus interior
Tekne Kabini|boat cabin
Uçak Kokpiti Gündüz|cockpit in daylight
Bisiklet Gece Yol|bicycle night ride
At Arabası Sürücü|carriage driver seat
Kızak Yolculuğu|sleigh ride
Tren Lokomotif İçi|locomotive cab
Taksi Ön Cam Yağmur|taxi windshield in rain
Uzay Aracı Kabini|space rover cabin
Polis Helikopteri|police helicopter cabin
Askeri Jeep|military jeep
`,
crime: `
Polis Garajı|police garage
Gizli Kasa Odası|hidden safe room
Gece Kasaba Benzinliği|small town gas station night
Rıhtım Konteyner Gece|container dock night
Mafya Çiftliği|mob farmhouse
Deniz Kenarı Villa Gece|seaside villa night
Terk Edilmiş Otel Odası|abandoned hotel room
Gece Treni Kompartımanı|night train compartment
Şehir Morgu|city morgue
Kara Para Çamaşırhanesi|money laundry back room
Kumar Masası Yakın|gambling table close
Gece Köprüsü Takip|bridge chase night
`,
academy: `
Akademi Kuş Kulesi|owlery tower
Akademi Gizli Geçit|secret passage
Akademi Kış Bahçesi|winter garden
Akademi Bodrum Laboratuvar|basement lab
Akademi Teleskop Terası|telescope terrace
Akademi Müzesi|school museum
Akademi Göl Köprüsü|lake bridge
Akademi Uçuş Pisti|flying field
Akademi Dua Odası|prayer room
Akademi Kütük Kulübe|gamekeeper hut
Akademi Yeraltı Odası|underground chamber
Akademi Balo Salonu|ballroom
`,
  };
  Object.entries(MORE).forEach(([id, text]) => CB.extendGroup(id, text));
})();
