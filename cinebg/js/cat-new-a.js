/* CineBG Studio — v2 yeni gruplar (A). */
(function () {
  const CB = window.CB;
  [
    { id: 'egypt', tr: 'Antik Mısır & Nil', arch: 'ancient', ctx: 'mixed', engines: ['dunes', 'hall', 'godrays', 'canyon'], cond: ['pristine', 'weathered', 'ruined', 'dusty'], genres: ['history'], items: `
Karnak Sütun Ormanı|hypostyle hall of colossal papyrus columns with carved hieroglyphs
Nil Kıyısı Tapınak|riverside temple with obelisks reflected in the Nile
Firavun Mezar Odası|pharaoh's burial chamber with painted walls and a granite sarcophagus
Piramit İçi Galeri|grand gallery inside a pyramid, steep corbelled ceiling
Ebu Simbel Cephesi|rock-cut temple facade with four seated colossi
Sfenks Önü Gece|great sphinx under a full moon and stars
Krallar Vadisi Girişi|rock-cut tomb entrance in a sun-bleached valley
Nil Sazlık Kayıkları|papyrus reed boats among tall Nile reeds
İşçi Köyü Deir el-Medina|ancient workers' village of mud-brick houses
Hatşepsut Teras Tapınağı|terraced mortuary temple against sheer cliffs
Firavun Saray Avlusu|pharaoh's palace courtyard with lotus pools
Mısır Pazar Rıhtımı|ancient Nile market quay with grain sacks and boats
Piramit İnşaat Rampası|pyramid construction ramp with stone blocks and sledges
Altın Taht Salonu Mısır|golden throne hall with painted columns
Tapınak Kutsal Gölü|sacred temple lake with stone steps
Nil Şelalesi Granit|granite cataract rapids on the Nile
Mısır Gözlemevi Çatısı|temple rooftop observatory under stars
Kum Altında Tapınak Kapısı|sand-choked temple pylon gate
İskenderiye Feneri|great lighthouse of an ancient harbour city
İskenderiye Kütüphanesi|great library hall with scroll niches
Mumyalama Atölyesi|embalming workshop with stone tables and jars
Firavun Kayığı Gece|royal barque on the Nile at night with torches
Mısır Taş Ocağı|ancient quarry with half-cut obelisk
Tapınak Rahip Koridoru|narrow priest corridor with relief carvings
Mısır Bahçe Havuzu|walled garden with date palms and a pool
Ölüler Kitabı Salonu|hall of judgement with painted scales
Kum Fırtınası Piramitler|pyramids veiled by a sandstorm
Gün Doğumu Piramit Platosu|pyramid plateau at sunrise with long shadows
Kaya Mezarı Merdiveni|descending stair into a rock tomb
Nil Deltası Köyü|delta village with palm groves and canals
Tapınak Avlusu Sfenksler|avenue of sphinxes leading to a temple
Mısır Askeri Kampı|chariot army camp beside the desert
Kraliçe Yatak Odası Mısır|queen's chamber with linen drapes and alabaster lamps
Tapınak Lahitleri Galeri|gallery of stone sarcophagi in lamp light
Sahra Vahası Tapınağı|oasis temple among palms
Mısır Kutsal Hayvan Tapınağı|temple with giant animal-headed statues
Taş Ocağı Obelisk|unfinished obelisk lying in a quarry
Mısır Tahıl Ambarı|ancient granary with domed silos
Piramit Tepesi Manzara|view from a pyramid apex over desert
Tapınak Gece Meşaleler|temple court lit by torches at night
Mısır Sarayı Balkon|palace balcony over the Nile
Mumya Mahzeni|crypt of shelved mummies
Kayıp Vaha Şehri|lost oasis city half buried in dunes
Mısır Kumsal Limanı|Red Sea harbour with ancient ships
Altın Mezar Hazinesi|tomb treasury piled with gilded furniture
` },
    { id: 'greco', tr: 'Roma & Yunan Dünyası', arch: 'ancient', ctx: 'mixed', engines: ['castle', 'hall', 'ocean', 'mountains'], cond: ['pristine', 'weathered', 'ruined', 'lived-in'], genres: ['history'], items: `
Roma Senatosu|Roman senate chamber with marble benches and a statue of victory
Roma Villası Peristil|Roman villa peristyle garden with frescoed walls
Pantheon Kubbesi İçi|domed temple with an oculus casting a beam of light
Roma Su Kemeri Vadisi|Roman aqueduct crossing a green valley
Antik Yunan Agorası|Greek agora with stoas and merchants' stalls
Sparta Eğitim Alanı|Spartan training ground on a dusty plain
Yunan Tiyatrosu Deniz|Greek theatre overlooking the sea
Roma Hamamı Frigidarium|cold bath hall with vaulted ceiling
Roma Ordu Kampı|legion fort with barracks and principia
Roma Lejyon Yolu|paved Roman road with legion milestones
Yunan Tapınağı Ada|white temple on an Aegean island cliff
Roma Sirki Maximus|chariot racing circus with central spina
Pompeii Villası İçi|Pompeian villa atrium with impluvium
Roma Forumu Gece|Roman forum lit by torches at night
Roma Limanı Ostia|Roman harbour with warehouses and ships
Delos Aslanlar Terası|terrace of marble lions on a sacred island
Yunan Kehanet Mağarası|oracle cave with tripod and vapours
Roma Kütüphanesi|Roman library with scroll niches
Yunan Gymnasion|gymnasium courtyard with colonnade
Roma Zafer Takı|triumphal arch on a sacred way
Akropol Merdivenleri|monumental stairs up to the acropolis
Roma İnsula Sokağı|Roman apartment street with shops
Roma Kolezyumu Altı|hypogeum tunnels beneath the arena
Yunan Zeytinliği|ancient olive grove with stone terraces
Roma Sınır Duvarı|Roman frontier wall across moorland
Roma Villa Mozaik Zemin|mosaic floor hall of a Roman villa
Yunan Atölyesi Heykeltıraş|sculptor workshop with marble blocks
Roma Taverna|Roman tavern with counters and amphorae
Yunan Kıyı Kasabası|Greek coastal town with triremes
Roma Kalesi Ren|Roman fort on a riverbank in fog
Yunan Mezar Steli Yolu|road lined with grave stelae
Roma Tapınağı Vesta|round temple of the sacred flame
Antik Yunan Stadyumu Tünel|vaulted tunnel into an ancient stadium
Roma Bahçesi Gece|Roman garden at night with lamps
Roma Saray Palatine|imperial palace ruins on a hill
Kartaca Harabeleri|ruins of a destroyed rival city by the sea
Yunan Adası Gün Batımı|Greek island ruins at sunset
Roma Ordu Köprüsü|military bridge across a wide river
Roma Mahkeme Bazilikası|Roman basilica law court
Yunan Tanrı Heykeli Salonu|hall with a colossal gilded god statue
Roma Liman Feneri|Roman lighthouse tower
Antik Atina Sokağı|street in ancient Athens
Roma Gladyatör Okulu|gladiator training school courtyard
Yunan Tapınak Kalıntısı Sis|temple ruins in mountain fog
Roma Su Sarnıcı|vaulted Roman cistern
` },
    { id: 'norse', tr: 'Viking & İskandinav Sagası', arch: 'fortress', ctx: 'mixed', engines: ['mountains', 'ocean', 'aurora', 'forest', 'storm'], cond: ['windswept', 'snowbound', 'misty', 'burning'], genres: ['history', 'fantasy'], items: `
Fiyort Köyü Sabah|Viking village on a fjord at dawn with longships
Uzun Ev İçi Ateş|longhouse interior with central hearth and carved pillars
Viking Liman İskelesi|wooden harbour with dragon-prowed ships
Kuzey Işıkları Fiyort|fjord under aurora with longhouses
Viking Cenaze Gemisi|burning funeral ship drifting on a lake
Runik Taşlar Tepe|hill of rune stones in wind
Viking Demirci|Viking forge with anvils and swords
Kuzey Denizi Fırtına Gemisi|longship in a storm at sea
Viking Kral Salonu|king's mead hall with shields on walls
Buzul Geçidi Viking|glacier pass with warriors' trail
Viking Pazar Kasabası|trading town with stalls and furs
Kuzey Ormanı Sunak|forest altar with antlers and runes
Viking Gözetleme Tepesi|lookout cliff over the sea
Kar Altında Viking Köyü|Viking village buried in snow
Viking Gemi Yapım Kızağı|longship under construction on a beach
Viking Mezar Höyükleri|burial mounds by the sea
Kuzey Tapınağı Ahşap|stave church with dragon heads
Viking Baskın Plajı|raid landing beach in fog
Kuzey Kayalık Sahil|basalt sea cliffs with seabirds
Viking Kış Gecesi|winter night village with torches
Viking Hazine Mağarası|cave hoard of silver
Volkanik Ada Viking|volcanic island settlement
Viking Atlar Bozkırı|Icelandic plain with horses
Viking Kalkan Duvarı Kumsalı|shield wall on a beach
Kuzey Şelalesi|great northern waterfall
Viking Ziyafet|feast tables with horns and fire
Kuzey Buzul Gölü|iceberg lagoon
Viking Kalesi Ring|ring fortress of earth and timber
Kuzey Mitolojisi Ağacı|giant ash tree on a hill
Viking Kayık Nehri|river with longboats in forest
Kuzey Işıkları Mezarlık|grave stones under aurora
Viking Yanık Manastır|burned monastery after raid
Kuzey Sisli Göl|misty lake with longship
Viking Konsey Taşları|assembly field with stones
Kuzey Bozkır Fırtına|storm over tundra
Viking Tapınak Ateşi|temple fire with idols
Kuzey Buz Mağarası|ice cave shrine
Viking Ahır Kış|winter byre with animals
Kuzey Dağ Kalesi|mountain fortress in snow
Viking Gemisi Gece|ship at anchor under stars
Kuzey Sahili Balina Kemiği|beach with whale bones
Viking Kraliçe Odası|chieftain's sleeping chamber
Fiyort Şelale Gemisi|ship passing waterfalls
Viking Savaş Sonrası Kar|battle aftermath in snow
` },
    { id: 'pirates', tr: 'Korsanlar & Yelkenli Çağı', arch: 'water', ctx: 'mixed', engines: ['ocean', 'storm', 'castle', 'fire'], cond: ['stormy', 'calm', 'burning', 'misty'], genres: ['history'], items: `
Korsan Gemisi Güvertesi|pirate galleon deck with rigging and cannons
Kaptan Kamarası Harita|captain's cabin with charts and lanterns
Korsan Koyu Gece|hidden pirate cove at night with ships
Hazine Adası Kumsalı|treasure island beach with palms and a wreck
Korsan Limanı Kasabası|pirate port town with taverns and docks
Fırtınada Kalyon|galleon in a storm with torn sails
Deniz Savaşı Top Dumanı|naval battle with cannon smoke
Batık Hazine Mağarası|sea cave with treasure chests
Korsan Meyhanesi|pirate tavern with barrels and lanterns
Gemi Ambarı Kargo|ship hold with cargo and hammocks
Ada Kalesi Topları|island fort with cannons facing the sea
Deniz Fenerli Kayalık|rocky lighthouse in fog
Korsan İdam Rıhtımı|gallows dock in harbour
Tropik Ada Lagünü|lagoon with anchored ship
Gemi Direği Gözcü|crow's nest view over ocean
Sisli Hayalet Gemi|ghost ship in fog
Kalyon Enkazı Sahil|galleon wreck on rocks
Korsan Pazar Meydanı|harbour market square
Deniz Mağarası Gemi|ship hidden in a sea cave
Kaptan Köprüsü Gün Batımı|ship's quarterdeck at sunset
Korsan Kampı Kumsal|beach camp with bonfire
Yanan Liman|harbour burning after raid
Gemi Top Güvertesi|gun deck with cannons
Haritalar Odası|map room with globes
Kayalık Resif Gemi|ship near a reef
Tropik Fırtına Limanı|harbour in tropical storm
Korsan Saklanma Ormanı|jungle hideout above cove
Deniz Kızı Kayalığı|mermaid rocks
Gemi Mutfağı|ship galley
Kraliyet Donanması Limanı|navy dockyard with ships of the line
Ay Işığında Kalyon|galleon under moonlight
Kum Sahilinde Sandık|chest on beach
Korsan Gemisi Kıç Pencereleri|stern windows of a galleon
Fırtına Sonrası Sakin Deniz|calm sea after storm with wreckage
Liman Kalesi Gece|harbour castle at night
Gemi Zindanı|brig of a ship
Ada Volkanı Korsan|volcanic island pirate base
Ticaret Gemisi Kargo Limanı|merchant harbour with tall ships
Korsan Bayraklı Kale|fortress with pirate flags
Buzlu Kuzey Gemisi|ship in icy northern sea
Deniz Savaşı Gece|night naval battle with burning ships
Kaptanın Hazine Odası|captain's treasure room
Gemi Yapım Tersanesi|wooden shipyard
Kayalık Koy Sabah|rocky cove morning
` },
    { id: 'steampunk', tr: 'Steampunk & Viktorya Makineleri', arch: 'industrial', ctx: 'mixed', engines: ['smoke', 'hall', 'skyline', 'tunnel', 'godrays'], cond: ['operational', 'lived-in', 'rusted', 'smoldering'], genres: ['scifi', 'history'], items: `
Zeplin Limanı Kulesi|airship mooring tower over a Victorian city
Saat Kulesi Mekanizması|inside a giant clock tower with gears
Buharlı Lokomotif Garı|steam train station with iron arches
Mucit Atölyesi|inventor's workshop with brass machines
Buhar Kenti Çatıları|steampunk rooftops with chimneys and pipes
Zeplin Kabini|airship cabin with brass fittings
Buharlı Fabrika Salonu|steam factory hall with belts and pistons
Pirinç Gözlemevi|brass observatory with telescope
Buharlı Denizaltı|submarine interior with valves
Mekanik Kütüphane|library with mechanical shelves
Buhar Kenti Pazar|market with automaton vendors
Uçan Şehir Platformu|floating city platform
Buharlı Robot Fabrikası|automaton factory
Buhar Borulu Sokak|street with steam pipes
Zeplin Filosu Gökyüzü|airship fleet in sky
Pirinç Kafe|brass and glass cafe
Buhar Tren Köprüsü|steam train on viaduct
Saat Mağazası|clockmaker shop
Buhar Tüneli Metro|steam subway tunnel
Mekanik Bahçe|mechanical garden with brass flowers
Buharlı Gemi Makine|steamship engine room
Teslacı Laboratuvar|electrical lab with coils
Viktorya Konağı Salonu|Victorian parlour with gadgets
Zeplin Güvertesi|airship deck above clouds
Kömür Madeni Asansörü|coal mine lift cage
Buhar Kenti Gece Sis|foggy steam city night
Mekanik Saray|clockwork palace
Buharlı Tank Sahası|steam tank yard
Pirinç Banyo|brass bathroom with pipes
Buhar Kenti Kanal|canal with steam boats
Mucit Garajı|inventor's garage
Buharlı Hava Gemisi Tersanesi|airship dockyard
Dev Dişli Salonu|hall of giant gears
Mekanik Tiyatro|mechanical theatre stage
Buhar Kazan Odası|boiler room
Pirinç Uzay Gemisi|brass spaceship
Viktorya Müzesi|Victorian museum hall
Buharlı Lunapark|steam-powered fairground
Mekanik Fil Kervanı|mechanical elephant caravan
Saat İşleri Mağara|clockwork cave
Buhar Kenti Köprü|iron bridge in steam city
Zeplin Bar|airship bar
Pirinç Kütüphane Kubbesi|brass dome library
` },
    { id: 'dieselpunk', tr: 'Dieselpunk & Art Deco Gelecek', arch: 'urban', ctx: 'mixed', engines: ['skyline', 'city', 'tunnel', 'hall'], cond: ['operational', 'wet', 'smoky', 'pristine'], genres: ['scifi', 'urban'], items: `
Art Deco Gökdelen Kanyonu|canyon of art deco towers with searchlights
Dizel Zeplin Limanı|diesel airship port with steel masts
Retro Gelecek Bulvarı|retro-future boulevard with chrome cars
Art Deco Tren Garı|art deco grand station with murals
Dizel Fabrika Kenti|diesel factory city in smog
Art Deco Sinema Salonu|art deco movie palace
Retrofütürist Havalimanı|retrofuturist airport terminal
Dizel Tank Kalesi|diesel war fortress
Art Deco Otel Balo|art deco hotel ballroom
Retro Roket Fırlatma|retro rocket launch pad
Dizel Denizaltı Üssü|diesel submarine pen
Art Deco Köprü Gece|art deco bridge at night
Retro Robot Fabrikası|retro robot factory
Dizel Şehir Metro|diesel subway
Art Deco Radyo Kulesi|art deco radio tower
Retro Gelecek Diner|retro-future diner
Dizel Hava Kalesi|flying fortress hangar
Art Deco Lobi Asansör|art deco elevator lobby
Retro Uzay Limanı|retro space port
Dizel Kentsel Kanal|diesel city canal
Art Deco Mahkeme|art deco courthouse
Retro Bilim Fuarı|world's fair pavilion
Dizel Gece Kulübü|diesel-era nightclub
Art Deco Çatı Bahçesi|art deco rooftop garden
Retro Futurist Ev|retro-future home
Dizel Savaş Gemisi|diesel battleship deck
Art Deco Kütüphane|art deco library
Retro Uçan Araba Yolu|flying car skyway
Dizel Rafineri|diesel refinery
Art Deco Banka|art deco bank hall
Retro Gelecek Okul|retro-future school
Dizel Trenler Deposu|diesel locomotive shed
Art Deco Tiyatro|art deco theatre
Retro Gelecek Plaj|retro-future beach resort
Dizel Gökdelen Zirvesi|diesel skyscraper spire
Art Deco Restoran|art deco restaurant
Retro Gelecek Hastane|retro-future hospital
Dizel Liman Vinçleri|diesel harbour cranes
Art Deco Metro İstasyonu|art deco metro station
Retro Gelecek Laboratuvar|retro-future lab
Dizel Zırhlı Tren|diesel armoured train
` },
    { id: 'solarpunk', tr: 'Solarpunk & Yeşil Gelecek', arch: 'scifi', ctx: 'mixed', engines: ['forest', 'skyline', 'clouds', 'orbs', 'godrays'], cond: ['pristine', 'lived-in', 'overgrown', 'calm'], genres: ['scifi', 'nature'], items: `
Dikey Orman Kuleleri|vertical forest towers with terraces of trees
Güneş Paneli Bahçe Kent|garden city with solar canopies
Yeşil Çatı Köprüleri|green rooftop bridges between towers
Solarpunk Pazar|open-air market under living roofs
Rüzgar Kuleli Vadi|valley of elegant wind towers
Yüzen Bahçe Şehri|floating garden city on a lake
Biyokubbe Ormanı|biodome forest
Solarpunk Tren Garı|green train station with plants
Kentsel Tarım Kulesi|vertical farm tower
Yeşil Liman|harbour with sail ships and gardens
Solarpunk Okul|school with gardens
Teraslı Şehir Nehri|terraced river city
Ağaç Ev Kenti|treehouse city
Yeşil Laboratuvar|green lab with plants
Güneş Kubbesi Meydan|solar dome plaza
Biyolüminesans Park|bioluminescent park at night
Solarpunk Kütüphane|library with hanging gardens
Yeşil Gökdelen Zirve|green skyscraper summit
Su Kanalı Bahçe|water garden canals
Solarpunk Köy|eco village with solar roofs
Yeşil Havalimanı|green airport
Solarpunk Plaj|eco beach town
Yosun Kaplı Metro|moss-covered metro station
Arı Kovanı Kulesi|bee tower garden
Kentsel Orman Yolu|urban forest path
Solarpunk Hastane|green hospital
Yeşil Fabrika|clean green factory
Gökyüzü Bahçesi|sky garden platform
Solarpunk Gece|solarpunk city at night
Yeşil Stadyum|green stadium
Hidroponik Sera|hydroponic greenhouse
Solarpunk Çatı Kafe|rooftop cafe
Yeşil Köprü Nehir|green river bridge
Solarpunk Kampüs|eco campus
Rüzgar Tarlası Kasaba|windmill town
Yeşil Tünel|green tunnel
Solarpunk Liman Feneri|eco lighthouse
Yeşil Su Arıtma Bahçesi|water garden plant
Solarpunk Dağ Köyü|mountain eco village
Yeşil Gelecek Sokağı|green future street
` },
    { id: 'alien', tr: 'Yabancı Gezegenler & Ekosistemler', arch: 'scifi', ctx: 'ext', engines: ['planet', 'cells', 'dunes', 'lava', 'aurora', 'galaxy', 'forest'], cond: ['pristine', 'violent', 'glowing', 'quiet'], genres: ['space', 'scifi'], items: `
Mor Bitki Ovası|alien plain of purple vegetation under two moons
Dev Mantar Ormanı|forest of towering alien fungi
Kristal Çöl|desert of crystal spires
Biyolüminesans Okyanus|glowing alien ocean shore
Yüzen Kaya Adaları|floating rock islands over an alien sea
Asit Bataklık|acid swamp with yellow mist
Dev Kemik Vadisi|valley of giant alien skeletons
Gazlı Kanyon|canyon with luminous gas vents
Halka Gölgesi Ova|plain under planetary ring shadow
Buz Volkanları|ice volcanoes erupting
Turuncu Gökyüzü Çölü|orange-sky desert
Yabancı Mercan Ormanı|coral forest on land
Mavi Kum Tepeleri|blue sand dunes
Elektrik Fırtınası Ova|plain under electric storm
Yabancı Şelale Yukarı|waterfall falling upward
Dev Kabuk Plajı|beach of giant shells
Kızıl Orman|red alien forest
Metan Gölü|methane lake
Kristal Mağara Gezegen|crystal cave
Yabancı Çiçek Tarlası|field of glowing flowers
Ters Dağlar|hanging mountains
Yabancı Kovan Tepesi|hive mound
Siyah Güneş Ovası|plain under black sun
Ağaç Kökü Köprüsü|root bridge over chasm
Yabancı Göl Ay|alien lake with giant moon
Toz Fırtınası Gezegen|dust storm planet
Çift Güneş Kumsalı|twin-sun beach
Yabancı Buz Ormanı|ice forest
Gezegen Lav Denizi|lava sea shore
Sis Gezegeni Vadisi|fog planet valley
Dev Spor Tarlası|spore field
Yabancı Taş Kemerler|alien stone arches
Gezegen Kutup Işıkları|planet with aurora
Mantar Kanyonu|fungal canyon
Yabancı Kıyı Kayalığı|alien coastline
Kristal Kar Ovası|crystal snow plain
Gezegen Kraterler|cratered alien plain
Yabancı Orman Gece|alien forest night
Gaz Devi Manzarası Ay|gas giant view from moon
Biyomekanik Tepe|biomechanical hill
Yabancı Nehir Deltası|alien river delta
Yabancı Gökyüzü Balinaları|sky with floating creatures
Turkuaz Ova|turquoise plain
Yabancı Mağara Göl|alien cave lake
` },
    { id: 'zombie', tr: 'Zombi & Salgın Kıyameti', arch: 'ruins', ctx: 'mixed', engines: ['battlefield', 'skyline', 'storm', 'hall', 'fire'], cond: ['abandoned', 'decaying', 'burning', 'eerie'], genres: ['horror'], items: `
Karantina Kontrol Noktası|abandoned quarantine checkpoint with barriers and hazmat tents
Terk Edilmiş Hastane Acil|abandoned emergency room with overturned gurneys
Barikatlı Market|barricaded supermarket with boarded windows
Sığınak Çatısı|rooftop refuge with supplies and signal fire
Boş Otoyol Tahliye|evacuation highway jammed with cars
Askeri Tahliye Stadyumu|stadium turned evacuation center
Zombi Kasabası Sis|small town in fog after outbreak
Kilise Sığınağı|church barricaded with pews
Metro İstasyonu Salgın|abandoned metro platform
Hapishane Kalesi|prison turned fortress
Çiftlik Evi Barikat|barricaded farmhouse
Terk Edilmiş Okul Koridoru|school hallway with lockers open
Yanan Şehir Gece|city burning at night
Alışveriş Merkezi Kalesi|mall fortress
Karantina Laboratuvarı|quarantine lab
Terk Edilmiş Benzinlik|abandoned gas station
Ormanda Kamp Kalıntısı|ruined forest camp
Helikopter Pisti Çatı|rooftop helipad
Köprü Barikatı|bridge barricade
Hastane Morgu|hospital morgue
Terk Edilmiş Polis Karakolu|abandoned police station
Kasaba Meydanı Sabah|town square morning silence
Yeraltı Otopark Sığınak|underground parking refuge
Askeri Konvoy Enkazı|wrecked military convoy
Terk Edilmiş Banliyö|abandoned suburb
Kurtarma Gemisi|rescue ship
Ada Sığınağı|island refuge
Terk Edilmiş Havaalanı|abandoned airport
Duvarlı Güvenli Bölge|walled safe zone
Çatı Bahçesi Hayatta Kalanlar|rooftop survivor garden
Kanalizasyon Tüneli|sewer tunnel escape route
Terk Edilmiş Lunapark Gece|abandoned fairground at night
Hastane Çatısı Gün Doğumu|hospital roof sunrise
Ormanda Kulübe Sığınak|cabin refuge in woods
Karantina Çadır Kenti|tent city
Terk Edilmiş Otel Lobisi|abandoned hotel lobby
Yanmış Okul Otobüsü|burnt school bus
Şehir Dışı Yol Ayrımı|crossroads outside town
Laboratuvar Sızıntısı Koridor|leaking lab corridor
Kasaba Kütüphanesi Sığınak|library refuge
` },
    { id: 'prison', tr: 'Hapishaneler, Zindanlar & Gözaltı', arch: 'horror', ctx: 'int', engines: ['hall', 'tunnel', 'godrays'], cond: ['abandoned', 'oppressive', 'decaying', 'lit'], genres: ['horror', 'interior'], items: `
Panoptikon Hapishane|panopticon prison with central watchtower and tiers of cells
Hücre Bloğu Gece|cell block at night with dim lights
Ortaçağ Zindanı|medieval dungeon with chains and straw
Hapishane Avlusu Yağmur|prison yard in rain
Tecrit Hücresi|solitary confinement cell
Hapishane Ziyaretçi Odası|visitor room with glass partitions
Kale Zindanı Kuyu|oubliette pit dungeon
Hapishane Kütüphanesi|prison library
Hapishane Çamaşırhanesi|prison laundry
Gözetim Kulesi İçi|guard tower interior
Hapishane Koridoru Uzun|long prison corridor
Ada Hapishanesi|island prison
Sorgu Hücresi|interrogation cell
Hapishane Kilisesi|prison chapel
Yeraltı Hücre|underground cell
Hapishane Hastanesi|prison infirmary
Ortaçağ İşkence Odası Boş|empty torture chamber
Hapishane Mutfağı|prison kitchen
Hücre Penceresi Işık|cell window light shaft
Terk Edilmiş Hapishane Bloğu|abandoned cell block
Hapishane Spor Alanı|prison exercise yard
Gelecek Hapishane Kapsül|future prison pods
Kale Hapishane Kulesi|castle prison tower
Hapishane Duşları|prison showers
Gözaltı Merkezi|detention center
Hapishane Arşiv|prison records room
Zindan Merdiveni|dungeon stairs
Hapishane Kapısı Gece|prison gate at night
Hücre Duvarı Çizikler|cell wall with tally marks
Hapishane Atölye|prison workshop
Hapishane Yemekhane|prison mess hall
Yeraltı Zindan Kanal|dungeon canal
Hapishane Çatısı|prison roof
Ölüm Hücresi Koridoru|death row corridor
Gemi Hapishane Ambar|prison ship hold
Kamp Barakası|camp barracks
` },
    { id: 'southasia', tr: 'Hindistan & Güneydoğu Asya', arch: 'eastasia', ctx: 'mixed', engines: ['forest', 'mountains', 'godrays', 'ocean', 'city'], cond: ['pristine', 'lived-in', 'misty', 'ruined'], genres: ['history', 'nature'], items: `
Taç Mahal Tarzı Türbe|white marble mausoleum with long reflecting pool
Varanasi Ghatları|river ghats with stone steps and boats at dawn
Rajasthan Çöl Sarayı|desert palace with jharokha windows
Kerala Su Kanalları|backwater canals with houseboats
Himalaya Tibet Köyü|Himalayan village with prayer flags
Angkor Wat Gün Doğumu|temple towers at sunrise reflected in moat
Bagan Tapınak Ovası|plain of thousands of pagodas in mist
Vietnam Halong Koyu|limestone karst bay with junk boats
Bali Pirinç Terasları|Bali rice terraces with palms
Tayland Yüzen Pazar|floating market with boats
Hint Basamaklı Kuyu|stepwell with geometric stairs
Hindistan Pazar Sokağı|crowded market street
Jaipur Pembe Şehir|pink city facade
Hint Saray Avlusu|maharaja palace courtyard
Vietnam Pirinç Tarlası|rice fields with water buffalo
Tayland Tapınak|golden temple with spires
Bali Tapınak Kapısı|split gate temple
Myanmar Altın Pagoda|golden pagoda
Hint Dağ Çay Bahçesi|tea gardens in hills
Sri Lanka Kaya Kalesi|rock fortress
Endonezya Volkan Şafak|volcano at sunrise
Hint Tren Garı|colonial railway station
Kamboçya Orman Tapınak|jungle temple
Vietnam Feneri Kasaba|lantern town
Hint Çöl Kalesi|desert fort
Kerala Plajı|palm beach
Nepal Dağ Tapınağı|mountain temple
Hindistan Saray Göl|lake palace
Malezya Yağmur Ormanı|rainforest
Hint Taş Tapınak Oyma|carved stone temple
Tayland Ada Plajı|island beach with longtail boats
Laos Şelale|turquoise waterfalls
Hint Sarayı Ayna Salonu|palace mirror hall
Vietnam Mağara|giant cave
Hint Nehri Gün Batımı|river sunset
Bali Orman Tapınak|forest temple
Hint Kervan Kampı|desert camel fair
Filipin Pirinç Teras|rice terraces in mountains
Tayland Gece Pazarı|night market
Hindistan Kale Duvarları|fortress walls
` },
  ].forEach(CB.addGroup);
})();
