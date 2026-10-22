/* CineBG Studio v7 — Dünya Kültürleri & Yerler: 25 yeni başlık, her biri 30 mekân. */
(function () {
  const CB = window.CB;
  const W = ['world'];
  const TAILS = {"a7-kasbah": ["under a hard ochre sky with heat shimmer", "with long shadows across sun-baked clay", "in dusty golden light with palms beyond"], "a7-persia": ["with turquoise tilework catching soft light", "framed by pointed arches and carved stucco", "in warm desert light with deep shade"], "a7-silkroad": ["under a vast pale steppe sky", "with wind-blown dust and distant mountains", "in low golden light along the old caravan route"], "a7-caucasus": ["with snow peaks and drifting cloud behind", "on a steep green slope in cold mountain air", "under heavy grey skies with mist in the valleys"], "a7-balkans": ["with red tile roofs and green hills behind", "in soft autumn light along old stone walls", "under a misty morning sky"], "a7-nordic": ["under a low cold northern sky", "with dark water and snow-dusted mountains", "in pale blue arctic light"], "a7-medislands": ["above clear turquoise Mediterranean water", "in bright summer sun with whitewashed stone", "with pine trees and limestone cliffs around"], "a7-caribbean": ["with turquoise water and leaning coconut palms", "in humid golden tropical light", "under towering white tropical clouds"], "a7-polynesia": ["with turquoise lagoon water and volcanic peaks", "in soft tropical light over the Pacific", "framed by palms and white coral sand"], "a7-himalaya": ["beneath towering snow peaks and prayer flags", "in thin cold air with drifting cloud", "in crisp high-altitude light"], "a7-andes": ["high in the Andes under a deep blue sky", "with snow volcanoes on the horizon", "in thin mountain air and long shadows"], "a7-amazon": ["in steamy green rainforest light", "with brown river water and dense jungle walls", "under heavy humid clouds after rain"], "a7-northwild": ["framed by dark spruce and snow peaks", "in clear cold northern light", "with mist rising off still water"], "a7-australia": ["under a huge blue outback sky", "with red earth and silver eucalyptus", "in harsh sun with long red shadows"], "a7-siberia": ["in deep snow under a pale winter sun", "with endless dark taiga beyond", "in freezing blue twilight"], "a7-chinagarden": ["with drifting mist and willow branches", "in soft grey light over still water", "framed by curved tiled roofs and lanterns"], "a7-korea": ["with curved tiled roofs and soft city glow", "in crisp autumn light", "under neon-washed night haze"], "a7-gulf": ["in shimmering desert heat", "under a glowing night sky over the city", "with gold light reflecting on glass and water"], "a7-westafrica": ["in bright dusty sunlight", "with vivid painted walls and sandy ground", "under a hazy orange evening sky"], "a7-swahili": ["in warm humid coastal light", "with turquoise Indian Ocean beyond", "under towering tropical clouds"], "a7-dutch": ["with gabled brick houses reflected in still water", "under a soft grey North Sea sky", "in low wet light after rain"], "a7-alps": ["beneath snow-capped alpine peaks", "in crisp clear mountain air", "with pine forest and meadows around"], "a7-celtic": ["under brooding grey Atlantic skies", "with emerald grass and drifting rain", "in soft wet light with mist on the hills"], "a7-mexico": ["in bright sun with vivid painted walls", "under a deep blue sky with bougainvillea", "in warm evening light with string lights"], "a7-aegean": ["above deep blue Aegean water", "in brilliant white summer light", "in the warm glow of an Aegean sunset"]};
  [
    { id: 'a7-kasbah', tr: 'Kuzey Afrika & Sahra Kasbahları', arch: 'ancient', ctx: 'mixed', engines: ['dunes', 'ruins', 'godrays', 'market'], cond: ['weathered', 'dusty', 'scorching', 'quiet', 'lived-in'], genres: W.concat(['history', 'landscape']),
      items: `
Ait Ben Haddou Kasbahı|fortified earthen ksar of stacked mudbrick towers rising above a dry riverbed at golden hour
Kasbah Avlusu|inner courtyard of a mudbrick kasbah with carved wooden balconies and a single palm tree
Sahra Kamp Çadırları|Berber desert camp of woven goat-hair tents among orange dunes under first starlight
Erg Chebbi Kum Denizi|towering apricot dunes of Erg Chebbi with sharp crests and long blue shadows
Drâa Vadisi Palmiyeleri|palm grove oasis of the Draa valley beside crumbling clay walls and irrigation channels
Kasbah Kulesi İç Mekan|interior of a kasbah tower with rough clay walls, timber beams and slit windows of light
Fes Tabakhanesi|Chouara tannery of round stone dye vats in ochre, red and indigo seen from a rooftop
Marakeş Riyad Avlusu|riad courtyard interior with zellige fountain, orange trees and carved cedar arches
Atlas Dağ Köyü|Berber village of flat-roofed earth houses stepped into a red High Atlas slope
Tuz Kervanı Yolu|salt caravan track crossing a flat gravel plain toward distant black mesas
Gadames Eski Şehri|covered alleys of Ghadames old town with whitewashed walls and shafts of overhead light
Tuareg Kuyu Başı|desert well with a wooden frame and stone trough beside a lone acacia
Medine Kapısı|monumental horseshoe gate of a medina with blue and green tile mosaics
Kum Fırtınası Kasbah|kasbah silhouette half-swallowed by an approaching wall of blowing sand
Mozabit Vahası|M'zab valley town of pastel cubic houses climbing a hill to a minaret
Hassan Kulesi Harabeleri|unfinished stone minaret and rows of broken columns on an open esplanade
Kil Tahıl Ambarı|fortified agadir granary of tiny stacked storerooms with wooden doors in a cliff
Çöl Gece Kampı Ateşi|smouldering campfire ring on sand beside rugs and brass teapots under the Milky Way
Ksar Ouled Soltane|multi-storey vaulted ghorfa granary cells around a dusty Tunisian courtyard
Matmata Yeraltı Evi|troglodyte pit house interior carved into soft earth with whitewashed rooms
Sahra Kaya Resimleri|sandstone overhang with ancient rock paintings above a dry wadi
Mavi Şehir Şefşavan|steep stairs of Chefchaouen with walls painted every shade of blue
Kasbah Çatı Terası|flat earthen rooftop terrace overlooking a sea of kasbah towers at dusk
Çöl Tuz Gölü Chott|cracked white salt crust of Chott el Djerid shimmering with mirage
Hamam Kubbesi İç Mekan|traditional hammam interior with star-shaped skylights in a steamy dome
Kervansaray Fondouk|two-storey caravanserai courtyard with arched galleries and stabling bays
Volubilis Roma Kalıntıları|Roman ruins of Volubilis with triumphal arch and mosaic floors on a hill
Sahra Gün Doğumu Dünleri|dune ridges catching pink dawn light with deep violet troughs
Hurmalık Sulama Arkı|clay irrigation canal winding through date palms with dappled light
Yıkık Ksar Gece|moonlit ruins of an abandoned ksar with collapsed towers and silver dunes`,
    },
    { id: 'a7-persia', tr: 'İran & Pers Mimarisi', arch: 'palace', ctx: 'mixed', engines: ['hall', 'godrays', 'ruins', 'room3d'], cond: ['pristine', 'opulent', 'weathered', 'quiet', 'ancient'], genres: W.concat(['history']),
      items: `
Nasir ül-Mülk Camii İç Mekan|prayer hall interior flooded with coloured light through stained-glass windows onto Persian carpets
İsfahan Nakş-ı Cihan Meydanı|vast Naqsh-e Jahan square with long reflecting pools and turquoise domes
Şeyh Lütfullah Kubbesi İç Mekan|interior of a dome covered in spiralling tile patterns converging on a peacock motif
Persepolis Apadana|colonnade stumps and carved stairway reliefs of Persepolis under hard sun
Kaşan Tarihi Konak Avlusu|sunken courtyard of a Kashan merchant house with pool, stucco and stained glass
Yezd Rüzgar Kuleleri|skyline of mudbrick wind-catcher towers over Yazd's old city at dusk
Hacu Köprüsü|two-tier arched Khaju bridge over the river with lamp-lit alcoves
Si-o-se Pol Gece|thirty-three arch bridge glowing amber reflected in still water at night
Çarşı Kubbeli Koridor İç Mekan|vaulted bazaar corridor interior with skylight oculi and closed carpet stalls
Fars Bahçesi Eram|formal Persian garden with cypress rows, long water channel and pavilion
Ayna Salonu İç Mekan|mirror hall interior where thousands of mirror fragments scatter candle light
Zerdüşt Sessizlik Kulesi|circular stone tower of silence on a barren hill outside Yazd
Kandovan Kaya Köyü|cone-shaped volcanic rock dwellings with wooden doors and ladders
Masuleh Basamak Köyü|terraced mountain village where roofs serve as streets in the fog
Golestan Sarayı Terası|tiled palace terrace with throne alcove and reflecting pool
Kaleh Bam Kerpiç Kalesi|vast mudbrick citadel of Bam with towers and walls under a pale sky
Ganjnameh Kaya Yazıtları|waterfall beside ancient cuneiform tablets carved in a granite cliff
Kervansaray Çölde|square desert caravanserai with a single domed portal and empty courtyard
Çay Evi Kilimli İç Mekan|traditional teahouse interior with kilim cushions, samovars and hanging lamps
Fin Bahçesi Havuz Kanalı|turquoise water channels with fountains through Fin garden under plane trees
Badgir Altı Serin Oda İç Mekan|cool room interior beneath a windcatcher with a small pool and lattice light
Sultaniye Kubbesi|massive brick dome of Soltaniyeh rising over a flat plain
Maranjab Çölü|salt-crusted desert of Maranjab with dunes and a lone caravanserai
Ali Kapu Müzik Odası İç Mekan|music room interior with ceramic niches cut in vase shapes
Yeşil Kubbeler Şiraz|garden pavilion with mirrored portico reflected in a long pool
Abyaneh Kızıl Köy|red clay village houses with lattice windows on a mountain slope
Hamam Ganjali Han İç Mekan|bathhouse interior with painted vaults and octagonal pools
Pers Halı Atölyesi İç Mekan|carpet workshop interior with upright looms and skeins of dyed wool
Kubbeli Su Deposu Ab Anbar|domed water cistern with wind towers in the desert
Ateş Tapınağı Yezd İç Mekan|fire temple interior with the sacred flame behind glass and carved stone`,
    },
    { id: 'a7-silkroad', tr: 'Orta Asya & İpek Yolu', arch: 'ancient', ctx: 'mixed', engines: ['dunes', 'mountains', 'ruins', 'market', 'godrays'], cond: ['weathered', 'dusty', 'windswept', 'quiet', 'ancient'], genres: W.concat(['history', 'landscape']),
      items: `
Semerkant Registan|three tiled madrasas facing Registan square with towering portals at dawn
Buhara Kalyan Minaresi|ornate brick Kalyan minaret over the mosque courtyard at sunset
Hive İçkale Surları|clay walls and turquoise minaret of Khiva's Itchan Kala in hard light
Shah-i-Zinda Türbeler Sokağı|narrow avenue of blue-tiled mausoleums climbing a hill
Kervansaray Harabesi|roofless caravanserai ruin with arched niches on a windswept steppe
Taşkömür Ötesi Yurt Kampı|felt yurts on a high pasture beside a glacial stream
Pamir Otoyolu|lonely gravel highway through barren high-altitude Pamir valleys
Son Göl Yaylası|alpine lake ringed by green pastures and grazing yurts in Kyrgyzstan
Aral Gemi Mezarlığı|rusted fishing boats stranded on the dry bed of the Aral Sea
Moğol Bozkırı Ovoo|stone ovoo cairn draped with blue silk scarves on a hilltop
Turfan Vahası Üzüm Kurutma Evleri|perforated brick grape-drying houses in Turpan's oasis
Gobi Çölü Alevli Kayalıklar|red sandstone Flaming Cliffs of the Gobi at sunset
Ipek Yolu Kervan Pazarı|covered bazaar interior with silk bolts, spices and copper lanterns
Dunhuang Mağara Tapınakları|cliff face honeycombed with Buddhist cave temples above a dry river
Mogao Mağarası İç Mekan|painted cave shrine interior with murals and a seated statue
Kaşgar Eski Şehir|mudbrick alleys and carved wooden doors of Kashgar's old town
Taklamakan Kum Denizi|endless pale dunes of the Taklamakan with a lone dead poplar
Charyn Kanyonu|red rock castles of Charyn canyon above a turquoise river
Kazak Bozkırı Kurganı|grass-covered burial mound on an endless flat steppe under big clouds
Hazar Kıyısı Petrol Kuyuları|rusting oil derricks along a grey Caspian shoreline
Darvaza Gaz Krateri|burning gas crater glowing orange in the night desert of Turkmenistan
Merv Antik Kalesi|eroded mudbrick walls of ancient Merv rising from the plain
Afrasiyab Höyüğü|excavated ancient mound with mud walls overlooking Samarkand
Yurt İçi Keçe Desenler|yurt interior with felt rugs, wooden lattice walls and a central stove
Tien Shan Buzul Vadisi|glacier-fed valley of the Tien Shan with spruce and snow peaks
Çorak Tuz Yolu Kervanı|caravan route of camel tracks across a white salt pan
Altın Orda Çadır Kenti|reconstructed tent city of the Golden Horde on a river bank
Taş Balbal Heykelleri|ancient Turkic stone figures standing in a windy grass field
Medrese Hücre Koridoru İç Mekan|madrasa corridor interior of student cells with tiled arches
Kervan Han Gecesi|torch-lit caravanserai gate under a starry desert sky`,
    },
    { id: 'a7-caucasus', tr: 'Kafkasya & Dağ Köyleri', arch: 'fortress', ctx: 'ext', engines: ['terrain3d', 'mountains', 'castle', 'countryside'], cond: ['misty', 'windswept', 'weathered', 'quiet', 'snowbound'], genres: W.concat(['landscape', 'history']),
      items: `
Svaneti Savunma Kuleleri|stone defensive towers of Ushguli clustered beneath a glaciated peak
Kazbek Gergeti Kilisesi|small stone church on a green ridge below snowy Mount Kazbek
Dağıstan Aul Köyü|stacked stone houses of a Dagestani aul clinging to a cliff
Ananuri Kalesi|fortress church complex above a turquoise reservoir
Tuşeti Dağ Yolu|vertiginous dirt road switchbacking into the Tusheti mountains
Gunib Kayalık Köy|abandoned stone village of Gamsutl on a mountain crest
Vardzia Kaya Şehri|cave monastery city carved into a vast cliff face
Tiflis Eski Şehir Balkonları|carved wooden balconies of Tbilisi's old town above sulphur baths
Ermeni Manastırı Tatev|monastery on the edge of a deep gorge with autumn forest
Sevan Gölü Manastırı|stone chapels on a peninsula over a blue alpine lake
Ağrı Dağı Eteği Khor Virap|monastery on a hill with snow-capped Ararat filling the sky
Kafkas Yaylası Ağılı|stone sheepfold on an alpine meadow with drifting cloud
Mestia Kar Köyü|Svan village towers under heavy winter snow
Çeçen Kule Vadisi|ruined watchtowers along a narrow green valley
Kakheti Bağ Evleri|vineyard rows below the Caucasus with a stone wine cellar
Qvevri Şarap Mahzeni İç Mekan|wine cellar interior with buried clay qvevri jars and earthen floor
Dağ Geçidi Haç|Jvari pass with a stone cross and snow walls along the road
Elbrus Buzul Kampı|metal huts on the snowfield of Elbrus above a sea of cloud
Kafkas Kayın Ormanı|dense beech forest on steep slopes in morning fog
Şeki Han Sarayı|palace facade of colourful shebeke stained glass and frescoes
Şeki Kervansarayı|two-storey caravanserai courtyard with stone arches and walnut trees
Guba Dağ Köyü Hınalık|highest village of stone houses on a barren ridge
Geghard Kaya Manastırı İç Mekan|rock-cut church interior lit by a single shaft from the dome
Dağ Köprüsü Kemerli|old stone arch bridge over a roaring mountain river
Taş Ev İç Mekan Ocak|stone house interior with a central hearth and hanging dried herbs
Kafkas Yayla Gölü|small glacial lake reflecting jagged peaks at dawn
Terk Edilmiş Sovyet Sanatoryumu|crumbling Soviet sanatorium in a misty spa town
Kaya Mezar Kuleleri|clusters of stone crypt houses on a hillside in Ingushetia
Kafkas Dağ Pazarı|mountain village market of wooden stalls with churchkhela strings
Kar Fırtınası Kule Köyü|tower village vanishing in a driving snowstorm`,
    },
    { id: 'a7-balkans', tr: 'Balkanlar', arch: 'urban', ctx: 'mixed', engines: ['street3d', 'countryside', 'ruins', 'castle'], cond: ['weathered', 'lived-in', 'quiet', 'misty', 'autumnal'], genres: W.concat(['history', 'street']),
      items: `
Mostar Köprüsü|Ottoman stone bridge arching over the emerald Neretva river
Saraybosna Başçarşı|wooden market lanes with copper workshops and a fountain kiosk
Kotor Koyu Surları|fortress walls zigzagging up a mountain above the bay of Kotor
Dubrovnik Surları|limestone city walls above red roofs and the Adriatic
Ohri Gölü Kilisesi|small church on a cliff over Lake Ohrid at sunset
Plitvice Gölleri|cascading turquoise lakes linked by waterfalls and wooden walkways
Berat Pencereler Şehri|white Ottoman houses with rows of windows on a hillside
Gjirokastër Taş Çatılar|stone-slab roofs of a fortified hill town
Meteora Manastırları|monasteries perched on top of sandstone pillars
Belgrad Kalemegdan|fortress park walls at the confluence of two rivers
Rila Manastırı Avlusu|striped arcades and painted church in a mountain monastery
Bulgar Köyü Taş Evleri|stone houses with wooden balconies in a Rhodope village
Sırp Ortodoks Fresk İç Mekan|church interior covered in faded Byzantine frescoes
Tara Kanyonu Köprüsü|concrete arch bridge high over a deep green canyon
Arnavut Bunker Sahili|concrete communist-era bunkers scattered along a beach
Sofya Sovyet Anıtı|brutalist monument on a hill overgrown with weeds
Buzludja Anıtı İç Mekan|abandoned flying-saucer monument interior with crumbling mosaics
Bosna Kırsal Değirmen|wooden water mills over a small river in a green valley
Hırvat Adası Liman|small stone harbour with fishing boats and pine trees
Ljubljana Kanal Kıyısı|riverside cafés under willows beside dragon bridge
Bled Gölü Adası|church island in a green alpine lake below a castle
Vojvodina Ayçiçeği Ovası|flat sunflower plains with a lonely church spire
Makedon Taş Köprü|Ottoman stone bridge in Skopje's old bazaar
Tito Dönemi Blokları|massive concrete housing blocks of New Belgrade
Kafana İç Mekan|traditional Balkan tavern interior with checked tablecloths and wood panels
Bosna Dağ Köyü Kar|snowy mountain village with steep wooden roofs
Hristiyan Mezarlığı Sis|old Orthodox cemetery with leaning crosses in fog
Prizren Eski Köprü|old stone bridge and minarets in Prizren
Durmitor Dağ Gölü|Black Lake beneath limestone peaks
Balkan Tren İstasyonu|small rural railway station with a water tower and rusting rails`,
    },
    { id: 'a7-nordic', tr: 'İskandinav Doğası & Nordik Kasabalar', arch: 'water', ctx: 'mixed', engines: ['terrain3d', 'aurora', 'ocean', 'glacier', 'countryside'], cond: ['misty', 'snowbound', 'calm', 'windswept', 'quiet'], genres: W.concat(['landscape', 'season']),
      items: `
Lofoten Balıkçı Kulübeleri|red rorbu fishing cabins on stilts beneath jagged peaks
Reine Köyü Kış|snow-covered village of Reine reflected in a still fjord
Geirangerfjord|deep fjord with waterfalls pouring down sheer green cliffs
Trolltunga Kayası|rock tongue jutting over a vast lake far below
Bergen Bryggen Rıhtımı|row of colourful wooden Hanseatic warehouses on the harbour
İzlanda Siyah Kumsal|black sand beach with basalt sea stacks and white surf
Kirkjufell Dağı|cone mountain with a small waterfall under green aurora
Ice Hotel İç Mekan|hotel room interior carved entirely from ice with soft blue light
Laponya Ren Geyiği Çiti|wooden reindeer fence on a snowy plain at blue hour
Fin Göl Saunası|lakeside log sauna with a jetty in summer twilight
Sauna İç Mekan|wooden sauna interior with stone stove and steam
Stokholm Gamla Stan|narrow ochre alleys of Stockholm's old town at dusk
Kopenhag Nyhavn|colourful townhouses along a canal with old wooden boats
Faroe Gras Çatılı Evler|turf-roofed houses on a green cliff above the ocean
Gásadalur Şelalesi|waterfall dropping from a cliff straight into the sea
Norveç Ahşap Kilisesi|dark stave church with dragon-head gables in a pine forest
İzlanda Jökulsárlón|glacier lagoon with drifting blue icebergs
Svalbard Kömür Kasabası|abandoned mining town with wooden buildings in snow
Norveç Kış Kulübe İç Mekan|log cabin interior with fireplace, sheepskins and frosted windows
Dalarna Kırmızı Ahırlar|red wooden farmhouses in a green meadow by a lake
Thingvellir Fay Hattı|rift valley gorge with mossy lava walls and clear water
İzlanda Buzul Mağarası|blue ice cave tunnel beneath a glacier
Kuzey Kutup Dairesi Yol|empty snow road under a pink polar twilight
Fin Taiga Gölleri|maze of lakes among pine forests from above
İsveç Takımadaları|granite islands and red cottages in the Stockholm archipelago
Senja Dağ Yolu|coastal road winding along steep mountains and sea
Kopenhag Bisiklet Köprüsü|curving bicycle bridge over the harbour at dawn
Nordik Kütüphane İç Mekan|minimalist public library interior with pale wood and big windows
Jeotermal Lagün|milky blue geothermal lagoon steaming in lava fields
Gece Yarısı Güneşi Fiyordu|midnight sun glowing low over a calm fjord`,
    },
    { id: 'a7-medislands', tr: 'Akdeniz Adaları', arch: 'water', ctx: 'mixed', engines: ['ocean', 'street3d', 'ruins', 'countryside'], cond: ['scorching', 'calm', 'pristine', 'weathered', 'lived-in'], genres: W.concat(['landscape', 'street']),
      items: `
Malta Valletta Limanı|honey-stone fortifications around a deep harbour with traditional boats
Gozo Mavi Pencere Kayası|rock arch over deep blue water on a limestone coast
Sicilya Ortigia Sokakları|baroque streets of Ortigia ending at the sea
Taormina Antik Tiyatro|Greek theatre ruins overlooking the sea and smoking Etna
Sardinya Nuraghe|cone-shaped stone tower of a Bronze Age nuraghe in a field
Sardinya Turkuaz Koy|white granite rocks around a turquoise cove
Korsika Bonifacio|town perched on white cliffs above the sea
Mayorka Kayalık Koy|calanque with pine trees and clear green water
Ibiza Eski Şehir Surları|whitewashed old town inside Renaissance walls
Menorka Taş Duvarlar|dry stone walls dividing fields toward a lighthouse
Kıbrıs Afrodit Kayası|sea stack in surf on a pebble beach
Capri Faraglioni|limestone sea stacks off Capri at sunset
Amalfi Limon Bahçeleri|terraced lemon groves with pergolas above the sea
Procida Renkli Liman|pastel harbour houses stacked behind fishing boats
Elba Kale Limanı|fortress over a small harbour on Elba
Kreta Balos Lagünü|shallow pink-sand lagoon framed by rocky headlands
Kreta Knossos Sarayı|reconstructed Minoan palace columns in red and black
Rodos Lindos Akropolü|acropolis on a cliff above a white village
Akdeniz Ada Feneri|white lighthouse on a rock in a wind-whipped sea
Zeytin Presi İç Mekan|old olive press interior with millstones and amphorae
Adalar Teknesi Güverte|wooden boat deck at anchor in a calm bay
Ada Tavernası Teras|seaside taverna terrace with blue chairs under a vine
Ada Mağara Grotto|sea grotto with glowing blue water inside
Lampedusa Tavşan Plajı|white beach with shallow emerald water
Stromboli Gece|volcanic island glowing with eruption above the night sea
Ada Kilise Kubbesi|small whitewashed chapel on a hill above the sea
Tuz Tavaları Trapani|salt pans with old windmills at sunset
Malta Mdina Sessiz Şehir|silent walled city streets of honey limestone
Ada Kayalık Merdivenler|stone steps cut into a cliff down to a swimming ladder
Ada Limanı Fırtına|harbour lashed by a winter storm, boats straining at moorings`,
    },
    { id: 'a7-caribbean', tr: 'Karayipler & Tropik Adalar', arch: 'water', ctx: 'mixed', engines: ['ocean', 'coral', 'forest', 'street3d'], cond: ['humid', 'calm', 'pristine', 'lived-in', 'stormy'], genres: W.concat(['landscape']),
      items: `
Beyaz Kum Palmiye Plajı|curving white sand beach fringed by leaning coconut palms
Havana Malecón|sea wall promenade with waves splashing and pastel facades
Trinidad Arnavut Kaldırımı|cobbled streets of colonial Trinidad with colourful houses
Kolonyal Liman San Juan|blue cobbles and pastel houses of Old San Juan
El Morro Kalesi|Spanish stone fortress on a headland over the sea
Jamaika Mavi Lagün|deep blue lagoon surrounded by jungle
Dominika Şelalesi|twin waterfalls in a rainforest pool
Barbados Plaj Barı|wooden beach shack bar on stilts at sunset
Curaçao Renkli Rıhtım|Dutch colonial waterfront row in candy colours
Bahamalar Kum Adası|tiny sandbar with turquoise shallows all around
Tobago Mangrov Kanalı|mangrove channel with arching roots over still water
Saint Lucia Pitons|twin volcanic spires rising over a bay
Rom İmalathanesi İç Mekan|old rum distillery interior with copper stills and barrels
Şeker Kamışı Tarlası|sugar cane field with a ruined windmill
Tropikal Fırtına Sahili|palms bending in a hurricane wind over grey surf
Gece Biyolüminesan Koy|bay glowing blue with bioluminescent water at night
Batık Gemi Sığlık|shipwreck in clear shallow water over sand
Kolonyal Plantasyon Evi|plantation house with wide verandas and shutters
Kreyol Kulübe Sokağı|wooden creole cottages with gingerbread trim
Karayip Balıkçı İskelesi|weathered wooden jetty with small boats
Turkuaz Su Altı Resif|coral reef with sea fans in clear water
Havana Kolonyal İç Mekan|colonial house interior with tall shutters and tiled floor
Mağara Cenote|cave pool with sunlight beams into clear water
Yağmur Ormanı Ağaç Evi|treehouse among giant trees in rainforest mist
Volkanik Siyah Plaj|black sand beach backed by jungle
Fener Kayalık Burun|old lighthouse on a rocky headland
Karayip Pazar Sokağı|market street with fruit stalls under tin awnings
Tropik Gün Batımı Lagünü|lagoon reflecting a fiery sunset
Bungalov İskele|overwater bungalows on a calm lagoon
Tropik Mezarlık|colourful painted tombs in a seaside cemetery`,
    },
    { id: 'a7-polynesia', tr: 'Pasifik Adaları & Polinezya', arch: 'water', ctx: 'mixed', engines: ['ocean', 'coral', 'terrain3d', 'forest'], cond: ['pristine', 'calm', 'humid', 'windswept'], genres: W.concat(['landscape']),
      items: `
Bora Bora Lagünü|turquoise lagoon around a jagged volcanic peak
Tahiti Siyah Kum|black sand surf beach under green mountains
Moorea Koyu|deep bay framed by sharp green peaks
Mercan Atolü Havadan|ring of coral atoll with lagoon seen from above
Paskalya Adası Moai|row of moai statues on a stone platform at dawn
Fiji Palmiye Adacığı|tiny island with a few palms in clear water
Samoa To Sua Çukuru|ocean trench pool with a long wooden ladder
Polinezya Fale Kulübe|open-sided thatched fale on a beach
Fale İç Mekan|thatched hut interior with pandanus mats and woven walls
Hawaii Na Pali Kıyısı|fluted green sea cliffs above deep blue ocean
Lav Akıntısı Okyanus|lava pouring into the sea in clouds of steam
Vanuatu Volkan Krateri|active crater glowing on an ash plain
Tonga Balina Koyu|deep blue water over a submerged reef
Polinezya Marae|ancient stone ceremonial platform in a jungle clearing
Kano İskele|outrigger canoes pulled up on a white beach
Mercan Bahçesi Sığ|shallow coral garden with sunbeams
Pasifik Fırtına Ufku|towering storm cloud over a flat atoll
Yeni Kaledonya Kalp Resifi|heart-shaped reef seen from the air
Palau Kaya Adaları|mushroom-shaped limestone islets in turquoise water
Ada Kilise Ahşap|small wooden church painted white among palms
Hindistan Cevizi Ormanı|dense coconut grove in afternoon light
Gelgit Havuzları|volcanic tide pools reflecting sunset
Gece Yıldızlı Atol|atoll under a sky full of stars
Ada Pazar Çatısı|open-air market hall with a tin roof
Lagün Kum Barı|white sandbar disappearing into shallow lagoon
Volkanik Şelale Havuzu|waterfall into a jungle pool on a volcanic island
Uçurum Üstü Çimen|grassy clifftop above crashing surf
Ada Pist Havaalanı|tiny airstrip along a lagoon
Mercan Kum Yolu|sandy path through a palm forest to the sea
Pasifik Gün Doğumu|sun rising over an endless calm ocean`,
    },
    { id: 'a7-himalaya', tr: 'Himalaya Manastırları & Tibet', arch: 'sacred', ctx: 'mixed', engines: ['terrain3d', 'mountains', 'godrays', 'hall'], cond: ['windswept', 'misty', 'quiet', 'snowbound', 'ancient'], genres: W.concat(['landscape', 'history']),
      items: `
Potala Sarayı|white and red palace rising over Lhasa on a rocky hill
Kaplan Yuvası Manastırı|monastery clinging to a sheer cliff in Bhutan
Everest Ana Kampı|tents and prayer flags below the Khumbu icefall
Dua Bayrakları Geçidi|mountain pass strung with fluttering prayer flags
Manastır Dua Salonu İç Mekan|prayer hall interior with butter lamps, thangkas and red pillars
Dua Çarkı Koridoru|row of brass prayer wheels along a whitewashed wall
Thiksey Manastırı|monastery stacked up a hill in Ladakh
Pangong Gölü|vivid blue high-altitude lake between bare mountains
Stupa Beyaz Kubbe|large white stupa with painted eyes and flags
Annapurna Teras Tarlaları|terraced fields below snowy peaks
Sherpa Köyü|stone houses of a Sherpa village above clouds
Asma Köprü Nehir|suspension bridge draped in flags over a glacial river
Mani Taş Duvar|wall of carved prayer stones on a trail
Tibet Çadır Kampı|black yak-hair tents on a vast plateau
Manastır Mutfağı İç Mekan|monastery kitchen interior with huge copper pots and smoke
Kailash Dağı|sacred pyramid mountain over a barren valley
Buzul Moren Gölü|milky glacial lake beneath icefalls
Bhutan Dzong|fortress-monastery by a river with cantilevered bridge
Manastır Kütüphanesi İç Mekan|library interior with wrapped scriptures in wooden pigeonholes
Yak Otlağı|high meadow with grazing yaks and stone walls
Himalaya Gün Doğumu|peaks glowing pink above a cloud sea
Kathmandu Durbar Meydanı|pagoda temples and carved wooden windows
Bodhnath Stupası|giant stupa with circling prayer flags at dusk
Mağara İnziva Hücresi|tiny meditation cave with a butter lamp
Dağ Çay Evi İç Mekan|trekking teahouse interior with wood stove and benches
Karlı Tırmanış Rotası|knife-edge snow ridge under deep blue sky
Ladakh Çöl Vadisi|dry mountain desert valley with a monastery
Kumbu Buz Kulesi|giant ice seracs on a glacier
Manastır Avlusu Dans Alanı|stone courtyard prepared for a masked dance festival
Yıldızlı Himalaya Gecesi|Milky Way over moonlit snow peaks`,
    },
    { id: 'a7-andes', tr: 'And Dağları & Köyleri', arch: 'ancient', ctx: 'ext', engines: ['terrain3d', 'mountains', 'ruins', 'saltflat'], cond: ['windswept', 'misty', 'ancient', 'quiet'], genres: W.concat(['landscape', 'history']),
      items: `
Machu Picchu|Inca citadel terraces on a ridge between green peaks
Gökkuşağı Dağı|striped mineral mountain in red, yellow and turquoise
Uyuni Tuz Düzlüğü Ayna|salt flat flooded into a perfect sky mirror
Titicaca Sazdan Adalar|floating reed islands and reed boats on a high lake
Cusco Kolonyal Meydan|colonial plaza with arcades and cathedral above Inca walls
Sacsayhuamán Duvarları|giant zigzag Inca stone walls on a hill
Moray Dairesel Teraslar|concentric agricultural terraces in a bowl
Maras Tuz Havuzları|thousands of salt pans cascading down a valley
Atacama Ay Vadisi|eroded salt and clay ridges in a lunar desert
Atacama Gayzerleri|steaming geysers at dawn below volcanoes
Patagonya Fitz Roy|granite spires over a glacial lake
Torres del Paine|three granite towers above a turquoise lake
Perito Moreno Buzulu|wall of blue glacier ice above a lake
Kolka Kanyonu|deep canyon terraces with condor sky
And Köyü Kerpiç Kilise|adobe church in a high mountain village
Lama Ağılı|stone corral with llamas on an altiplano
Quechua Dokuma İç Mekan|weaving house interior with backstrap looms and dyed wool
Ölüm Yolu Yungas|narrow cliff road in cloud forest
Bulut Ormanı Kuelap|ruined circular stone houses in cloud forest
Quito Eski Şehir|colonial streets climbing toward a hill basilica
Chimborazo Volkanı|snow volcano rising over paramo grassland
Kahve Fincası Teraslar|coffee plantation on steep green slopes
Salar Pembe Flamingo Gölü|pink lagoon in a high desert
Huacachina Vahası|oasis lagoon ringed by huge dunes
Nazca Çölü Çizgileri|desert plateau with ancient lines from above
And Tren Hattı|high-altitude railway over a stone viaduct
Altiplano Gece Yıldızları|Milky Way above a salt flat
Inca Patikası Geçit|stone steps over a misty pass
Kolonyal Manastır Avlusu|cloister courtyard with orange trees and arches
Dağ Pazarı Pisac|empty market square with stalls under a mountain`,
    },
    { id: 'a7-amazon', tr: 'Amazon Nehri Yaşamı', arch: 'nature', biomes: ['tropical', 'wetland'], ctx: 'mixed', engines: ['forest', 'waterfall', 'godrays', 'mushroom'], cond: ['humid', 'misty', 'rainy', 'pristine', 'lived-in'], genres: W.concat(['landscape', 'nature']),
      items: `
Amazon Nehir Kıvrımı|vast brown river bend through endless rainforest from above
Su Basmış Orman|flooded forest with tree trunks rising from black mirror water
Kazıklı Nehir Evleri|wooden stilt houses along a muddy riverbank
Nehir Teknesi Güverte|riverboat deck with hammocks strung under a tin roof
Nehir Teknesi İç Mekan|cabin interior of a riverboat with bunks and mosquito nets
Dev Nilüfer Gölü|lagoon covered in giant water lily pads
Orman Kanopi Yürüyüşü|suspended walkway high in the rainforest canopy
Manaus Opera Binası|pink belle-époque opera house with a mosaic dome
Kauçuk Ağacı Patikası|forest path past rubber trees with tapping cuts
Kızıl Toprak Yol|red dirt road cutting through jungle after rain
Nehir Kumsalı Gün Batımı|sandy river beach at sunset with driftwood
Siyah ve Beyaz Su Buluşması|meeting of dark and pale rivers side by side
Orman Köyü Maloca|large thatched communal house in a jungle clearing
Maloca İç Mekan|interior of a thatched longhouse with hammocks and firelight
Kayık İskele|wooden dugout canoes at a muddy landing
Sisli Sabah Nehri|river shrouded in morning mist with palms
Orman Şelalesi|waterfall plunging into a jungle gorge
Tepui Masa Dağı|flat-topped mountain with cliffs above the forest
Yüzen Pazar|floating market of moored boats and rafts
Orman Araştırma Kulübesi|research station hut on stilts in the forest
Dev Kapok Ağacı|giant kapok tree with buttress roots
Mangrov Ağzı|river mouth mangroves at low tide
Orman Yağmur Fırtınası|torrential rain over the canopy
Ateşböceği Orman Gecesi|dark forest glowing with fireflies
Nehir Benzin İstasyonu|floating fuel station on the river
Nehir Kenarı Kilise|small wooden church above a river landing
Orman Mantar Zemini|forest floor with glowing fungi and leaf litter
Ahşap Kasaba Rıhtımı|riverside town quay of wooden warehouses
Pembe Yunus Lagünü|dark lagoon among flooded trees at dawn
Yağmur Ormanı Işık Huzmesi|sunbeams falling through a gap in the canopy`,
    },
    { id: 'a7-northwild', tr: 'Kanada & Alaska Vahşi Doğası', arch: 'nature', biomes: ['boreal', 'alpine'], ctx: 'ext', engines: ['terrain3d', 'forest', 'aurora', 'glacier', 'mountains'], cond: ['pristine', 'snowbound', 'misty', 'calm', 'autumnal'], genres: W.concat(['landscape', 'season']),
      items: `
Moraine Gölü|turquoise lake below a wall of ten peaks
Banff Dağ Kasabası|small mountain town street under a snowy peak
Denali Tundra|autumn tundra in red and gold beneath a giant mountain
Alaska Buzul Fiyordu|tidewater glacier calving into a fjord
Yukon Kuzey Işıkları|aurora over a frozen lake and spruce
Kütük Kulübe Göl|log cabin on a lake shore with a canoe
Kütük Kulübe İç Mekan|log cabin interior with wood stove, furs and snowshoes
Rocky Dağ Yolu|highway winding through mountains and forest
Kızıl Akçaağaç Ormanı|maple forest blazing red and orange
Somon Nehri Şelalesi|rapids on a river through dense forest
Buz Tarlası Parkway|road beside a glacier-covered range
Kanada Kalkan Gölleri|maze of lakes and rocks from above
Kayalık Okyanus Kıyısı|Pacific rainforest coast with sea stacks
Sitka Yağmur Ormanı|mossy giant spruce in temperate rainforest
Terk Edilmiş Altın Madeni|wooden gold-rush buildings collapsing in the forest
Altın Hücum Kasabası|false-front wooden storefronts in a frontier town
Kutup Ayısı Tundrası|snowy shore of Hudson Bay at dusk
Buz Balıkçılığı Kulübeleri|ice-fishing huts on a frozen lake
Dalga Kıran Fener|red lighthouse on a granite point in Nova Scotia
Quebec Eski Şehir Kış|snowy stone streets of old Quebec
Kanada Tren Hattı Dağ|railway trestle bridge over a canyon
Buzul Mağarası Alaska|blue ice cave inside a glacier
Göl Kenarı Kano İskele|wooden dock with canoes on a misty lake
Kuzey Kamp Ateşi|campfire on a lake shore under stars
Yaban Hayatı Çayırı|alpine meadow of wildflowers below peaks
Donmuş Şelale|frozen waterfall in a narrow canyon
Kayalık Dağ Geçidi|high pass with snow and larches turning gold
Arktik Tundra Yol|gravel Dempster highway into empty tundra
Kenai Fiyordu|fjord with rugged islands and calm water
Orman Yangını Sonrası|burned forest with new fireweed blooming`,
    },
    { id: 'a7-australia', tr: 'Avustralya Taşrası & Kıyıları', arch: 'nature', biomes: ['arid', 'savanna'], ctx: 'ext', engines: ['dunes', 'canyon', 'ocean', 'coral', 'countryside'], cond: ['scorching', 'dusty', 'windswept', 'calm', 'pristine'], genres: W.concat(['landscape']),
      items: `
Uluru Kızıl Kaya|monolith glowing red at sunset over spinifex
Kata Tjuta Kubbeleri|cluster of domed red rocks in the desert
Kızıl Toprak Yol Outback|straight red dirt road to the horizon
Outback Çiftlik Evi|tin-roofed homestead with a windmill and water tank
Coober Pedy Yeraltı Evi İç Mekan|dugout home interior carved into sandstone
On İki Havari Kayaları|limestone stacks along a rugged coast
Büyük Bariyer Resifi|coral reef in turquoise shallows from above
Whitehaven Plajı|swirling white silica sand and blue water
Daintree Yağmur Ormanı|rainforest meeting the reef at a beach
Karijini Kanyonu|red gorge with a green pool
Pinnacles Çölü|limestone spires in yellow sand
Pembe Göl|bubblegum pink lake beside the ocean
Mavi Dağlar Üç Kız|sandstone pillars over a blue eucalyptus valley
Sydney Opera Gece|sails of the opera house lit at night over the harbour
Bondi Havuzu|ocean pool cut into rocks with waves crashing
Outback Pub|old corrugated iron pub on an empty road
Opal Madeni Kasabası|mining town of mounds and shacks
Tasmanya Kral Billy Ormanı|ancient pine forest with moss
Cradle Dağı Gölü|jagged mountain over a still lake
Great Ocean Road|coastal road curving along cliffs
Bungle Bungle|beehive striped sandstone domes
Kimberley Şelalesi|waterfall over red cliffs into a gorge
Okaliptüs Ormanı Sis|eucalyptus forest in morning fog
Kanguru Ovası Gün Batımı|grassland with dead trees at sunset
Tuz Gölü Eyre|vast white salt lake
Kıyı Kasabası İskele|long timber jetty into calm water
Kraliçe Sokağı Tenekeli Evler|Queenslander houses on stilts with verandas
Outback Gece Gökyüzü|Milky Way over red desert
Mangrov Kuzey Kıyı|muddy mangrove coast at low tide
Kırmızı Toz Fırtınası|wall of red dust approaching a town`,
    },
    { id: 'a7-siberia', tr: 'Rus Taşrası & Sibirya', arch: 'nature', biomes: ['boreal', 'polar'], ctx: 'mixed', engines: ['forest', 'countryside', 'aurora', 'terrain3d'], cond: ['snowbound', 'frozen', 'misty', 'weathered', 'quiet'], genres: W.concat(['landscape', 'season']),
      items: `
Baykal Gölü Buz|cracked turquoise ice of frozen Lake Baikal
Baykal Buz Mağarası|ice-covered rock grotto with icicles
Ahşap Dacha|wooden dacha with carved window frames in birch trees
Dacha İç Mekan|dacha interior with a tiled stove, samovar and lace
Trans-Sibirya Treni|long train crossing endless snowy taiga
Tren Kompartımanı İç Mekan|train compartment interior with bunks and tea glasses
Taşra İstasyonu|small station with wooden buildings in snow
Tayga Nehri|wide frozen river winding through dark forest
Soğan Kubbeli Kilise|wooden church with onion domes in a village
Kızhi Ahşap Kiliseler|tiered wooden churches on a lake island
Yakutsk Buzlu Sokak|frozen city street in ice fog at minus fifty
Oymyakon Köyü|tiny village in extreme cold with smoking chimneys
Sibirya Huş Ormanı|birch grove with golden leaves
Kamçatka Volkanları|snow volcanoes above a valley of geysers
Gayzerler Vadisi|steaming geysers in a green valley
Terk Edilmiş Gulag|ruined barracks and fences in snow
Sovyet Kasabası Panel Blok|grey apartment blocks in a muddy town
Altay Dağları|green mountain valley with a river
Volga Kıyısı Köy|river bank village with wooden houses
Rus Banya İç Mekan|bathhouse interior with birch brooms and steam
Kış Tayga Yolu|snow road between tall pines
Sibirya Kuzey Işıkları|aurora over a lonely log cabin
Tundra Nenets Çadırları|conical reindeer-skin tents on snow
Norilsk Endüstriyel Kasaba|smoking smelter town in tundra
Çöken Sovyet Kültür Evi İç Mekan|abandoned culture house interior with stage and mosaics
Sibirya Bataklık Sonbahar|wetland of red and gold in autumn
Sibirya Ahşap Kasaba Sokağı|street of ornate wooden houses
Buzlu Nehir Feribotu|small ferry crossing between ice floes
Lena Sütunları|stone pillars along a broad river
Donmuş Göl Balıkçı Delikleri|holes in lake ice with small huts`,
    },
    { id: 'a7-chinagarden', tr: 'Çin Klasik Bahçeleri & Su Kasabaları', arch: 'eastasia', ctx: 'mixed', engines: ['wuxia', 'bamboo', 'godrays', 'street3d', 'hall'], cond: ['misty', 'calm', 'pristine', 'weathered', 'quiet'], genres: W.concat(['history']),
      items: `
Suzhou Bahçe Köşkü|pavilion over a lotus pond with rockery and willows
Ay Kapısı|circular moon gate framing bamboo
Zigzag Köprü|zigzag stone bridge across a lily pond
Su Kasabası Kanalı|canal lined with whitewashed houses and stone bridges
Wuzhen Gece Feneri|water town lit by red lanterns reflected in the canal
Hongcun Köyü|Huizhou village with horse-head walls around a pond
Çay Evi İç Mekan|teahouse interior with lattice windows and lacquer tables
Kaligrafi Odası İç Mekan|scholar's study interior with brushes, ink stones and scrolls
Karst Tepeleri Li Nehri|karst peaks above a river with bamboo rafts
Yangshuo Pirinç Tarlası|rice fields among limestone peaks in mist
Huangshan Sisli Zirveler|granite peaks and pines above a sea of clouds
Zhangjiajie Sütunları|sandstone pillars rising from fog
Yasak Şehir Avlusu|red walls and golden roofs of a palace courtyard
Cennet Tapınağı|triple-roofed blue temple on a marble terrace
Çin Seddi Kış|Great Wall snaking over snowy ridges
Pingyao Surlu Şehir|ancient walled city with grey tiled roofs
Hutong Ara Sokak|Beijing hutong alley with grey brick and red doors
Hakka Tulou|round earthen fortress house with inner galleries
Tulou İç Avlu|inner courtyard of a tulou ring with wooden balconies
Fenghuang Nehir Evleri|stilt houses along a river at night
Longji Pirinç Terasları|terraces curving around mountains
Bambu Ormanı Patika|path through towering bamboo
Lotus Göleti Yaz|pond of pink lotus flowers
Kaya Bahçesi Taihu|bizarre Taihu limestone rocks in a garden
Pagoda Göl Kıyısı|seven-storey pagoda by a misty lake
Budist Mağara Heykelleri|giant carved Buddhas in a cliff
Çay Tarlası Tepeleri|tea terraces on rolling hills
Kanal Teknesi Gece|covered canal boat moored under a bridge
Şangay Bund Gece|colonial waterfront facing a glowing skyline
Kırmızı Fener Sokağı|street hung with hundreds of red lanterns`,
    },
    { id: 'a7-korea', tr: 'Kore Geleneksel & Modern', arch: 'eastasia', ctx: 'mixed', engines: ['street3d', 'metro3d', 'hall', 'countryside'], cond: ['pristine', 'lived-in', 'autumnal', 'quiet', 'lit'], genres: W.concat(['modern', 'street']),
      items: `
Gyeongbokgung Sarayı|palace hall with painted eaves under mountains
Bukchon Hanok Köyü|lanes of tiled hanok houses with Seoul towers beyond
Hanok İç Mekan|hanok room interior with paper doors and ondol floor
Seul Neon Sokağı|narrow alley of glowing signboards without text at night
Gangnam Gökdelenler|glass towers along a wide avenue at dusk
Han Nehri Köprüsü|bridge with rainbow fountain lighting at night
Seul Metro İç Mekan|subway carriage interior with clean seats and screens
PC Bang İç Mekan|internet café interior with rows of glowing gaming chairs
Noraebang Oda İç Mekan|karaoke room interior with neon lights and sofas
Pojangmacha Sokak Çadırı|orange tent street stall with plastic stools at night
Busan Gamcheon Köyü|colourful hillside village of stairs
Jeju Volkan Kıyısı|black basalt coast with a tuff cone
Jeju Mandalina Bahçesi|tangerine orchard behind stone walls
Boseong Çay Tarlası|green tea terraces in morning mist
Seoraksan Sonbahar|granite peaks with red maples
Bulguksa Tapınağı|temple stairs and stone pagodas
Kore Budist Tapınak İç Mekan|temple hall interior with golden Buddha and lotus lanterns
Gimchi Küpleri Avlu|courtyard of earthenware jars
Seul Çatı Katı Ev|rooftop room with a green water tank and city view
Goshiwon Oda İç Mekan|tiny goshiwon room interior with bed and desk
Kafe Sokak Yeonnam|street of small cafés under ginkgo trees
Ginkgo Altın Bulvar|avenue carpeted with yellow ginkgo leaves
DMZ Gözetleme Noktası|observation deck over the empty border zone
Kore Kış Kayak Köyü|ski resort under snow lights
Gyeongju Kral Tepeleri|grass burial mounds in a park
Seul Pazar Gece|covered market alley of food stalls
Busan Balık Pazarı|fish market hall with tanks and ice
Kore Kiraz Çiçekleri Nehri|cherry blossoms along a stream
Seul Kulesi Gece|tower above the city at night
Apartman Kompleksi Gece|endless apartment towers with lit windows`,
    },
    { id: 'a7-gulf', tr: 'Arap Yarımadası & Körfez Şehirleri', arch: 'modern', ctx: 'mixed', engines: ['dunes', 'metro3d', 'skyline', 'hall'], cond: ['scorching', 'pristine', 'opulent', 'lit', 'dusty'], genres: W.concat(['modern', 'urban']),
      items: `
Burj Gökdeleni Gece|supertall tower piercing the night over a glowing city
Dubai Marina Kanalı|canal lined with towers and yachts at dusk
Eski Dubai Rüzgar Kuleleri|Al Fahidi lanes of coral-stone houses with wind towers
Abra Teknesi Dere|wooden water taxis on the creek at sunset
Şeyh Zayed Camii|white marble mosque with reflecting pools at blue hour
Cami İç Mekan Avize|mosque interior with giant crystal chandeliers and carpet
Liwa Çöl Kum Tepeleri|giant red dunes of the Empty Quarter
Çöl Kampı Gece|Bedouin camp with lanterns and carpets in the dunes
Petra Hazine|rose-red facade carved into a canyon
Wadi Rum Kayalıkları|red sand valley between sandstone mountains
Umman Fiyortları|khors of Musandam with turquoise water
Umman Kalesi|mudbrick fort on a rocky outcrop
Souk Waqif|old market alleys with lanterns and spice stalls
Doha Sahil Silueti|curved bay with towers at night
Lüks Otel Lobi İç Mekan|hotel lobby interior with gold, marble and fountains
Altın Souk İç Mekan|gold market interior of glittering shop windows
Yapay Ada Havadan|palm-shaped island seen from above
Çöl Otoyolu|empty highway through sand under heat haze
Yemen Şibam Kuleleri|mudbrick skyscrapers of an ancient walled town
Sokotra Ejder Ağaçları|umbrella-shaped dragon blood trees on a plateau
Arap Kahvesi Majlis İç Mekan|majlis interior with floor cushions and brass dallah pots
Kızıldeniz Mercan Kıyısı|coral reef dropping off a desert shore
Fütüristik Metro İstasyonu|metro station interior with gold lights
Çöl Yeşil Vaha|date palm oasis in a rocky wadi
Hatta Dağ Barajı|turquoise reservoir between rocky mountains
Neon Kaplı Alışveriş Bulvarı|shopping boulevard of glowing storefronts
Kumda Gömülü Köy|abandoned village half-buried by dunes
Gökdelen Çatı Havuzu|infinity pool on a tower roof
Yat Limanı Gece|marina with yachts and reflections
Güneş Enerjisi Çöl Parkı|field of solar mirrors in the desert`,
    },
    { id: 'a7-westafrica', tr: 'Batı Afrika Pazarları & Şehirleri', arch: 'daily', ctx: 'mixed', engines: ['market', 'street3d', 'dunes', 'ruins'], cond: ['lived-in', 'busy-but-empty', 'dusty', 'scorching', 'weathered'], genres: W.concat(['street', 'daily']),
      items: `
Djenne Kerpiç Camii|great mudbrick mosque with protruding wooden beams
Timbuktu Kum Sokakları|sandy streets between mudbrick houses
Dakar Renkli Pirogları|painted fishing pirogues pulled up on a beach
Lagos Pazar Sokağı|market street with umbrellas and stalls of fabric
Kumaş Pazarı İç Mekan|covered fabric market interior with wax print bolts
Akra Sahil Feneri|red and white lighthouse over a fishing town
Gorée Adası Sokağı|pastel colonial houses with bougainvillea
Pembe Göl Retba|pink lake with salt mounds on the shore
Ganvie Kazıklı Köy|stilt village on a lagoon
Dogon Uçurum Köyü|cliffside village with granaries
Kakum Kanopi Köprüsü|rope bridges high in the rainforest
Burkina Boyalı Evler|geometric painted mud houses
Kale Kumsalı Elmina|whitewashed slave castle on a beach
Banjul Nehir Ağzı|river mouth with mangroves and boats
Dyer Çukurları Kano|indigo dye pits in an old town
Sahel Baobab Ovası|flat plain with giant baobabs at sunset
Tro-tro Otogarı|minibus station with yellow vans
Terzi Atölyesi İç Mekan|tailor workshop interior with sewing machines and cloth
Lagos Köprü Siluet|bridge over a lagoon at dusk
Çatı Evi Abidjan|rooftop with water tanks over a city
Harmattan Toz Sabahı|town softened by dusty harmattan haze
Kara Sokak Barı İç Mekan|small street bar interior with plastic chairs and music speakers
Niger Nehri Teknesi|long wooden boat on a wide river
Saray Kapısı Kumasi|ornate palace gate
Fildişi Kıyısı Bazilika|giant domed basilica above palms
Koza Sanat Galerisi İç Mekan|art gallery interior with sculptures and masks
Pazar Gece Lambaları|night market lit by kerosene lamps
Sahil Balıkçı Pazarı|beach fish market with smoking ovens
Kumtaşı Platosu Mali|plateau of sandstone formations
Futbol Kumsal Sahası|beach football goals at sunset`,
    },
    { id: 'a7-swahili', tr: 'Doğu Afrika & Svahili Kıyısı', arch: 'water', ctx: 'mixed', engines: ['ocean', 'countryside', 'ruins', 'street3d'], cond: ['humid', 'calm', 'weathered', 'lived-in', 'pristine'], genres: W.concat(['landscape', 'history']),
      items: `
Zanzibar Taş Şehir|narrow lanes and carved wooden doors of Stone Town
Oyma Zanzibar Kapısı|massive carved door with brass studs
Dhow Teknesi Gün Batımı|lateen-sailed dhow on a calm sea at sunset
Lamu Ada Sokağı|car-free alleys with donkeys' paths and whitewash
Kilwa Kisiwani Harabeleri|coral stone ruins of a great mosque
Kilimanjaro Ovası|snow-capped mountain over acacia savanna
Serengeti Akasya|lone acacia on golden plains at sunset
Ngorongoro Krater|volcanic crater floor with a lake
Masai Mara Nehri|muddy river crossing on the plains
Kenya Çay Tepeleri|tea plantation hills in morning mist
Uganda Yağmur Ormanı|misty mountain forest with giant ferns
Victoria Gölü Balıkçı Köyü|fishing village on the lake shore
Etiyopya Kaya Kilisesi|cross-shaped church carved into rock below ground
Kaya Kilisesi İç Mekan|carved rock church interior with painted pillars
Danakil Sülfür Havuzları|yellow and green acid pools in salt
Simien Dağları|dramatic escarpments and deep valleys
Mombasa Fort Jesus|Portuguese fort walls by the sea
Diani Plajı|white beach with palms and turquoise water
Svahili Konak İç Mekan|house interior with plaster niches and carved beds
Baharat Çiftliği|spice farm with clove trees
Mercan Adası Sığ|coral island in shallow green water
Rift Vadisi Manzara|great escarpment overlooking the rift valley
Flamingo Gölü Nakuru|pink lake shore under soft light
Gondar Kalesi|stone castles in a royal enclosure
Kampala Tepeleri|city hills with red roads
Safari Kulübesi İç Mekan|safari lodge interior with canvas and wood
Kenya Gece Savanı|starry sky over savanna and a fire
Sansibar Gece Pazarı|waterfront food market under lamps
Kahve Kooperatifi|drying beds of coffee cherries
Victoria Şelaleleri Sisi|massive waterfall spray and rainbow`,
    },
    { id: 'a7-dutch', tr: 'Hollanda & Kanal Şehirleri', arch: 'street', ctx: 'mixed', engines: ['street3d', 'countryside', 'rainglass', 'harbor'], cond: ['wet', 'lived-in', 'calm', 'quiet', 'misty'], genres: W.concat(['street']),
      items: `
Amsterdam Kanal Köprüsü|arched bridge over a canal with gabled houses
Kanal Evi İç Mekan|tall narrow canal house interior with steep stairs and big windows
Kanal Ev Teknesi|moored houseboat with plants on deck
Bisiklet Park Yığını|racks of hundreds of bicycles by a station
Kinderdijk Yel Değirmenleri|row of windmills along a dyke at dawn
Lale Tarlası Şeritleri|stripes of tulip fields to the horizon
Utrecht Alçak Kanal Rıhtımı|canal wharf cellars at water level
Giethoorn Köyü|thatched farmhouses on a canal without roads
Rotterdam Küp Evler|tilted cube houses over a street
Rotterdam Liman Vinçleri|giant port cranes at night
Delft Mavi Seramik Atölyesi İç Mekan|pottery workshop interior with blue and white tiles
Kahverengi Kafe İç Mekan|brown café interior with dark wood and candles
Volendam Balıkçı Limanı|green wooden houses and boats
Polder Yolu|straight road on a dyke across flat fields
Kış Kanal Buz|frozen canal with frost and mist
Tarihi Pazar Meydanı|market square with town hall gables
Leiden Kanal Yağmur|rainy canal with reflections
Bruges Kanal Köşesi|medieval canal corner with a belfry
Gent Graslei Rıhtımı|guild houses along the river at night
Hollanda Sera Işıkları|greenhouses glowing at night
Hollanda Kumul Sahili|beach dunes with a lighthouse
Hoge Veluwe Fundalık|purple heather moorland
Keukenhof Bahçe|park of flower beds and a windmill
Kanal Kenarı Pazar|floating flower market stalls
Amsterdam Merkez İstasyon|neo-Gothic station from the water
Rijksmuseum Geçidi|bicycle passage through a museum building
Peynir Deposu İç Mekan|cheese warehouse interior with wheels on shelves
Dyke Kenarı Çiftlik|farmhouse below a grass dyke
Gece Kanal Fenerleri|canal at night with string lights on bridges
Sisli Polder Gün Doğumu|foggy flat fields and empty meadows at sunrise`,
    },
    { id: 'a7-alps', tr: 'Alp Köyleri & Kayak Merkezleri', arch: 'landscape', biomes: ['alpine'], ctx: 'mixed', engines: ['terrain3d', 'mountains', 'countryside', 'street3d'], cond: ['snowbound', 'pristine', 'calm', 'misty', 'autumnal'], genres: W.concat(['landscape', 'season']),
      items: `
Hallstatt Göl Köyü|lakeside village under a steep mountain
Zermatt Matterhorn|village roofs with the Matterhorn at sunrise
Grindelwald Dağ Evi|chalet in a green meadow below the Eiger
Lauterbrunnen Şelale Vadisi|U-shaped valley with waterfalls
Kayak Teleferiği|gondola cable car over snowy slopes
Après-Ski Kulübe İç Mekan|ski lodge interior with fireplace and wooden beams
Kayak Pisti Gece|groomed piste lit by floodlights
Dağ Kulübesi Yürüyüş|stone mountain hut on a trail
Neuschwanstein Kalesi|fairytale castle on a forested hill
Dolomit Geçidi|road through jagged pale peaks
Tre Cime|three rock towers in evening light
Alpin Göl Seealpsee|green lake below cliffs
Bavyera Köyü Boyalı Evler|houses with painted facades
Alp Pazar Meydanı|cobbled square with a fountain and church
Dağ Treni Glacier|red train on a viaduct in snow
Buzul Gölü Turkuaz|meltwater lake with ice
Alp Ahırı Yaz|wooden barn on a flowered slope
Kış Masalı Köy Gece|snowy village with lit windows
Çikolata Dükkanı İç Mekan|chocolate shop interior with wooden shelves
Kayak Kiralama İç Mekan|ski rental shop interior with rows of skis
Chamonix Mont Blanc|town below snow summit
Zirve Kar Sırtı|knife-edge summit ridge with overhanging snow cornices
Alp Kilisesi Kar|small church in deep snow
Göl Kenarı Otel|grand hotel on a lake
Tirol Ahşap Balkon|carved balcony with geraniums
Dağ Yolu Virajları|switchbacks on a pass
Buz Pateni Göl|frozen lake for skating with lights
Kış Ormanı Kar Yükü|pines heavy with snow
Sonbahar Alp Vadisi|golden larches in a valley
Bulut Denizi Zirve|peaks above a sea of clouds`,
    },
    { id: 'a7-celtic', tr: 'İrlanda & İskoç Kırları', arch: 'landscape', biomes: ['temperate', 'coast'], ctx: 'mixed', engines: ['countryside', 'terrain3d', 'castle', 'ocean'], cond: ['misty', 'windswept', 'rainy', 'weathered', 'quiet'], genres: W.concat(['landscape', 'history']),
      items: `
Moher Uçurumları|sheer sea cliffs with crashing Atlantic waves
Eilean Donan Kalesi|castle on an islet linked by a stone bridge
Glencoe Vadisi|brooding glen with mist on dark mountains
Isle of Skye Kayalıkları|Old Man of Storr rock pinnacles
Skye Peri Havuzları|clear pools and waterfalls in a glen
Irlanda Taş Duvar Tarlaları|green fields divided by dry stone walls
Dev Yolu Bazalt|hexagonal basalt columns on the coast
Ring of Kerry Yolu|narrow road over green hills
İrlanda Pub İç Mekan|pub interior with dark wood, snug and fireplace
Viski Damıtımevi İç Mekan|distillery interior with copper stills
Highlands Yolu Tek Şerit|single-track road through heather
Loch Ness Kale Harabesi|ruined castle above a dark loch
Edinburgh Kraliyet Mili|cobbled street with stone tenements
Edinburgh Kale Siluet|castle on rock under storm clouds
Glenfinnan Viyadüğü|curving railway viaduct over a glen
Kayalık Atlantik Kumsal|white beach in the Outer Hebrides
Taş Daire Callanish|standing stones on a moor
Saz Çatılı Kulübe|thatched cottage with a red door
Kulübe İç Mekan Turba Ateşi|cottage interior with a peat fire and kettle
Dublin Gürcü Kapıları|row of colourful doors
Kylemore Manastırı|abbey reflected in a lake
Connemara Bataklığı|bog with lakes and mountains
Rock of Cashel|ruined cathedral on a rock
Kaya Adası Skellig|steep island monastery steps
Liman Köyü Tobermory|colourful harbour houses
Kale Harabesi Fırtına|ruined keep in a storm
Viski Fıçı Deposu İç Mekan|warehouse interior with barrels stacked high
Fundalık Mor Tepe|purple heather hills
Kelt Mezarlığı Haçlar|high crosses in a graveyard
Sisli Göl Kayık|rowing boat on a misty loch`,
    },
    { id: 'a7-mexico', tr: 'Meksika Renkli Kasabaları', arch: 'street', ctx: 'mixed', engines: ['street3d', 'market', 'ruins', 'dunes'], cond: ['lived-in', 'scorching', 'weathered', 'lit', 'quiet'], genres: W.concat(['street', 'history']),
      items: `
Guanajuato Renkli Tepeler|hillside of brightly painted houses
Papel Picado Sokağı|street strung with colourful paper banners
Ölüler Günü Mezarlığı|cemetery covered in marigolds and candles
Altar Ofrenda İç Mekan|home interior with a layered altar of marigolds and candles
San Miguel Katedrali|pink Gothic spires over a plaza
Oaxaca Pazar Hali|market hall interior with chilies and pottery
Cenote Mağara Havuzu|cave pool with roots hanging and light beams
Chichén Itzá Piramidi|stepped pyramid on a grass plain
Tulum Sahil Harabeleri|Maya ruins on a cliff over turquoise sea
Teotihuacán Güneş Piramidi|pyramid along the avenue of the dead
Palenque Orman Tapınağı|temple ruins in jungle mist
Bakır Kanyonu|vast canyon system with a train line
Mezcal Damıtımevi İç Mekan|rustic distillery interior with stone wheel and pits
Agave Tarlaları|blue agave rows to volcanic hills
Kolonyal Hacienda|courtyard with fountain and arches
Hacienda İç Mekan|colonial interior with tiled floors and beams
Mexico City Zócalo|vast plaza with cathedral at dusk
Xochimilco Kanalları|colourful flat boats on canals
Lucha Arena İç Mekan|wrestling arena interior with a ring under spotlights
Taco Tezgahı Gece|street taco stand with glowing grill
Puebla Talavera Cephe|church facade of painted tiles
Sahil Kasabası Malecon|seaside promenade with palms
Çöl Sahara Baja|cactus desert near the sea
Kaktüs Ormanı Saguaro|giant saguaros at sunset
Renkli Merdiven Sokağı|painted stairway in a hillside town
Kolonyal Kilise İç Mekan|baroque church interior covered in gold
Mariachi Meydanı|empty plaza with a bandstand at night
Kırsal Kerpiç Köy|adobe village with a white chapel
Sierra Gorda Misyonu|ornate mission in mountains
Vera Cruz Liman Feneri|colonial harbour with lighthouse`,
    },
    { id: 'a7-aegean', tr: 'Yunan Adaları & Ege', arch: 'water', ctx: 'mixed', engines: ['ocean', 'street3d', 'ruins', 'countryside'], cond: ['scorching', 'calm', 'pristine', 'windswept', 'weathered'], genres: W.concat(['landscape', 'history']),
      items: `
Santorini Oia Mavi Kubbeler|blue-domed churches above the caldera at sunset
Santorini Kaldera Teras|white terrace with a pool over the volcanic caldera
Mikonos Yel Değirmenleri|row of white windmills on a hill
Küçük Venedik Mikonos|houses with balconies right over the sea
Navagio Gemi Enkazı Koyu|shipwreck on a white beach in a cliff cove
Delos Antik Harabeler|marble lions and ruins on a barren island
Milos Sarakiniko|white volcanic rock coast like a moonscape
Ada Taverna Gece|seaside taverna with lanterns
Kiklad Köy Merdivenleri|whitewashed stairs with blue doors
Ege Balıkçı Teknesi|painted caique moored in a small harbour
Patmos Manastırı|fortified monastery above a white town
Hydra Limanı|stone mansions around a harbour without cars
Korfu Eski Kale|Venetian fortress on a promontory
Monemvasia Kayası|medieval town on a rock island
Ege Zeytinliği|ancient olive trees with stone walls
Sunion Poseidon Tapınağı|marble temple on a cape at sunset
Atina Akropolis Gece|Parthenon lit above the city
Plaka Sokakları|neoclassical houses with bougainvillea
Ege Kilise İç Mekan|whitewashed chapel interior with icons and lamps
Ege Ev İç Mekan|island house interior with whitewashed niches and blue shutters
Tuz Gölü Ada|salt pans with windmills
Rüzgarlı Burun Feneri|lighthouse in a meltemi wind
Mağara Kilisesi|church built into a cave on a cliff
Bozcaada Sokakları|cobbled streets with vine-covered houses
Assos Antik Liman|stone harbour below an ancient acropolis
Kaş Teknesi Koy|turquoise bay with a gulet
Kekova Batık Şehir|sunken ruins visible under clear water
Ege Kasabası Meydan|plane tree square with a fountain
Gece Ege Yıldızları|stars over a quiet bay
Tekne Gezisi Güverte|wooden gulet deck with cushions at anchor`,
    },
  ].forEach((g) => {
    // 8 kelimeden kısa açıklamalara grubun atmosfer kuyruğu eklenir
    const t = TAILS[g.id] || [];
    g.items = g.items.trim().split('\n').map((l, i) => {
      const [tr, en] = l.split('|');
      return en.trim().split(/\s+/).length < 8 && t.length ? `${tr}|${en.trim()} ${t[i % t.length]}` : l;
    }).join('\n');
    CB.addGroup(g);
  });
})();
