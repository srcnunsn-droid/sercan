/* CineBG Studio — v2 kategori genişlemesi (A): mevcut grupların sonuna eklenen mekanlar. */
(function () {
  const CB = window.CB;
  const X = {
'battle-ancient': `
Hun Atlıları Bozkırı|Hunnic horse archer steppe, trampled grass, abandoned saddles and smoke on the horizon
Antik Deniz Savaşı Kıyısı|shore after an ancient trireme sea battle, rammed hulls, floating oars and burning sails
Kral Mezarlığı Savaşı|battle among royal burial mounds, toppled grave markers and torn standards
Kumsal Mancınık Hattı|beachhead ringed by siege catapults, piled stones and wet sand
Zırhlı Şövalye Mezarlığı|field of fallen armoured knights, dented plate and riderless warhorses at dusk
Tapınak Basamakları Savaşı|monumental temple steps fought over, spears on stone and fallen banners
Yaylı Okçular Vadisi|valley lined with crossbow pavises, bolt-studded ground and a burning mill
Ortaçağ Liman Baskını|raided medieval harbour, burning cogs, smashed crates and a toppled crane
Taş Köprü Pususu|ambush on a narrow stone bridge over a gorge, rope barricades and boulders
Çöl Kervanı Baskını|raided desert caravan, overturned litters, spilled spices and camel tracks
Dağ Kalesi Önü Ova|plain beneath a mountain fortress, siege trenches and smoke from the walls
Kar Altında Lejyon|legion camp half buried in snow, frozen standards and dying campfires
Orman Yolu Pususu|forest road ambush, felled trees across the path and broken wagons
Antik Arena Savaşı|ancient arena turned battlefield, chariots wrecked across the sand
Sazlık Nehir Savaşı|reed-choked river battle, half-sunken boats and arrows in the water
Akropolis Kuşatması|hilltop acropolis under siege, scorched columns and ladders on the walls
Kuşatma Kulesi Enkazı|collapsed wooden siege tower lying across a breached wall
Tuz Gölü Muharebesi|battle on a white salt flat, dark blood-red standards and long shadows
Antik Bozkır Kurganları|steppe burial mounds after a cavalry clash, broken lances in the grass
Ortaçağ Yangın Kenti|medieval town burning at night, timber houses collapsing into the square
Dağ Sırtı Son Direniş|last stand on a rocky ridge, shields planted, mist rolling up the slopes
Viking Gemi Mezarlığı|beach of burned longships, charred dragon prows and grey surf
Sur Gediği|breach in a city wall, rubble ramp and dust still in the air
Fil Mezarlığı Ovası|plain of fallen war elephants with toppled howdahs at sunset
Kalkan Duvarı Tepe Sonrası|hill crest littered with round shields after a shield-wall clash
Kehanet Tapınağı Savaşı|oracle temple sacked during war, overturned braziers and torn curtains
`,
'battle-modern': `
Kurşun Delikli Kilise|village church pocked with bullet holes, collapsed bell tower and pews outside
Siper Hattı Kış Sabahı|frozen trench line at dawn, frost on sandbags and steam from a dugout
Çamur Topçu Mevzii|muddy artillery position, giant howitzer and stacked shell crates
Yıkık Köprü Nehir Geçişi|blown bridge with pontoon crossing beside it under smoke screen
Çöl Hava Üssü Harabesi|bombed desert airbase, cratered runway and burnt fighter jets
Orman Sığınağı|camouflaged forest bunker with log roof and firing slits
Plaj Çıkarma Sonrası Gece|invasion beach at night, flares overhead and wrecked landing craft
Kasaba Meydanı Çatışma|small town square after street fighting, toppled monument and burnt tram
Ormanda Tank Yolu|tank tracks through a shattered forest, broken trunks and mud
Deniz Feneri Gözetleme|coastal lighthouse turned observation post, sandbags on the gallery
Kar Kaplı Tank Hattı|line of snow-covered tanks on a frozen road
Fabrika Bacası Keskin Nişancı|shattered factory chimney sniper nest above ruined workshops
Demiryolu Zırhlı Tren|armoured train halted on an embankment, smoking engine and gun turrets
Bataklık Cephe Hattı|swamp front line with duckboards over black water and wire
Çöl Siper Hattı|desert trench line, sand-filled bags and heat haze over no man's land
Bombalanmış Katedral|bombed cathedral nave open to the sky, rubble and broken stained glass
Dağ Geçidi Konvoy|military convoy on a mountain pass, burnt trucks and steep drop
Sahil Bunker Hattı|concrete coastal bunker line with gun embrasures facing the sea
Mayın Tarlası Ova|marked minefield on a grey plain, warning signs and craters
Hastane Treni|hospital train carriages in a snowy station
Paraşüt Düşüş Tarlası|field strewn with parachutes and gliders at dawn
Kırık Tren İstasyonu Kubbesi|bombed railway station dome, iron ribs against the sky
Gece Şehir Bombardımanı|city skyline under night bombardment, searchlights and fires
Muhabere Merkezi Sığınağı|signals bunker with radio sets and maps by lamplight
Orman Kampı Çadırları|forest army camp of canvas tents in rain
Nehir Kıyısı Kum Torbaları|river bank fortified with sandbags facing ruins across the water
`,
'battle-future': `
Çökmüş Yörünge İstasyonu|crashed orbital station strewn across a desert, solar wings snapped
Mech Hangar Saldırısı|mech hangar after an attack, half-assembled walkers and fire
Uzaylı Kalesi Kuşatması|siege of a towering alien citadel of black spires
Neon Sokak Barikatı|neon city barricade of burnt hover cars and holo-shields
Ay Kraterinde Çatışma|lunar crater battlefield, regolith dust frozen in low gravity
Kalkan Kubbesi Çöküşü|collapsing energy shield dome over a futuristic city
Asteroit Madeni Savaşı|asteroid mining station battle, drilling rigs and debris
Robot Fabrikası Harabesi|ruined robot factory, assembly arms frozen mid-motion
Buz Ay Savaş Hattı|ice moon trenches beneath a ringed gas giant
Plazma Topçu Mevzii|plasma artillery emplacements on a ridge glowing hot
Siber Orman Pususu|ambush in a forest of cables and server pylons
Uzay Limanı Tahliyesi|spaceport evacuation, ships lifting off through smoke
Uzaylı Bataklık Cephesi|alien swamp front, bioluminescent water and crashed walkers
Gelecek Siperleri Yağmur|rain-soaked future trenches lit by holographic targeting
Yıkılmış Kalkan Jeneratörü|destroyed shield generator tower sparking in the night
Mars Kanyon Pususu|ambush inside a Martian canyon, rovers burning
Karadelik Üssü Savunması|defended research base near a black hole horizon
Dev Robot Düşüşü|giant robot fallen across a city avenue
Kristal Gezegen Savaşı|battlefield among giant crystals, shattered shards everywhere
Uydu Çarpma Krateri|crater from a crashed satellite in a forest
Distopik Duvar Gediği|breach in a megawall with searchlights and drones
Nanobot Bulutu Şehir|city consumed by a grey nanobot swarm cloud
Termal Görüş Savaş Alanı|night battlefield with heat glows and drone lights
Gezegen Halkası Çatışması|battle on debris of a planetary ring
Biyomekanik Kovan İçi|inside a biomechanical alien hive, ribbed walls and pods
`,
'siege': `
Kuşatma Altında Liman Kalesi|harbour fortress under naval siege, cannon smoke over the water
Kale Kuyusu Avlusu|fortress well courtyard during siege, rationed water barrels
Kar Altında Kuşatma|winter siege, snow on siege works and frozen moat
Kale Mutfağı Kuşatma|castle kitchen during siege, empty larders and soldiers' bowls
Gece Nöbeti Surları|night watch on battlements, torches and sleeping guards
Yıkık Kale Kapısı Sabah|morning after the gate fell, splintered doors and smoke
Kale Tüneli Lağım|siege mine tunnel dug beneath walls, timber props and lamps
Ada Kalesi Gelgit|island fortress cut off by high tide, causeway submerged
Kayalık Hisar|rocky hilltop citadel over a winding river
Kuşatma Topu Mevzii|great bombard cannon position facing city walls
Kale Silah Deposu|castle armoury with racks of pikes and crossbows
Kraliyet Kalesi Bahçesi|royal castle garden inside high walls
Kale Şapeli Mum Işığı|castle chapel by candlelight during siege
Kale Çatısı Gözcü Kulesi|top of a castle keep watchtower above clouds
Taş Köprü Kalesi|fortified bridge with gate towers over a river
Ormanla Sarılı Hisar|forest-surrounded fortified manor with moat
Kale Hendeği Sisli|misty castle moat with reeds and a drowned cart
Sur Dibinde Kamp|soldiers' camp at the foot of a giant wall
Kale Zindanı Hücresi|dungeon cell with chains and a barred window
Antik Sur Kapısı Aslanlı|ancient city gate with carved lions under siege
Dağ Geçidi Kalesi|fortress blocking a mountain pass between cliffs
Kalenin Kuyu Odası|cistern hall beneath a castle with columns in water
Bataklık Kalesi|swamp fortress on stilts with wooden palisade
Kale Avlusu Demirhane|castle forge working day and night during siege
`,
'postapoc': `
Terk Edilmiş Stadyum|abandoned stadium with collapsed roof and grass on the pitch
Kum Fırtınasında Kasaba|sandstorm sweeping through an abandoned town
Paslı Uçak Mezarlığı|aircraft boneyard of rusting airliners in the desert
Yıkık Gökdelen İçi|inside a ruined skyscraper floor open to the sky
Su Basmış Metro|flooded metro station with trains half underwater
Hayatta Kalanlar Pazarı|survivor market of scrap stalls under tarps
Kızıl Toz Otoyolu|highway buried under red dust and wrecks
Yıkık Kütüphane|ruined library with books scattered and trees inside
Radyasyon Bölgesi Kasaba|irradiated town with warning signs and dead trees
Dev Ağaçlarla Kaplı Şehir|city overgrown by giant trees through the streets
Terk Edilmiş Hastane Çatısı|hospital rooftop with helipad and overgrowth
Kum Gemi Limanı|sand ship port of wheeled vessels in a desert
Buz Kaplı Kıyamet Limanı|frozen apocalyptic harbour with icebound ships
Çöplük Kalesi|fortress built from junk and car bodies
Toksik Göl Kıyısı|toxic lake shore with dead fish and rusted pipes
Terk Edilmiş Tema Parkı Kalesi|abandoned theme park castle overgrown with weeds
Kıyamet Sonrası Çiftlik|fortified post-apocalyptic farm with scrap walls
Yıkık Otoban Köprüsü Kampı|camp under a broken highway bridge
Küllü Orman Yolu|ash-covered forest road with burnt car
Yeraltı Sığınak Kapısı|vault door of an underground shelter in a hillside
Terk Edilmiş Nükleer Santral|derelict nuclear plant with cracked cooling towers
Kum Altında Uçak|airliner half buried in desert dunes
Terk Edilmiş Okul Otobüsleri|row of rusted school buses in tall grass
Çöken Kule Kenti|city of leaning collapsed towers in fog
Kıyamet Sonrası Kilise Sığınağı|church turned shelter with cots and candles
`,
'urban': `
Gece Kavşağı Taksiler|night intersection with taxis and steam
Şehir Kütüphanesi Merdivenleri|stone stairs of a city library with lions
Sabah Fırını Sokağı|morning bakery street with warm windows
Yağmurda Telefon Kulübesi|phone booth in the rain under a streetlamp
Şehir Çatıları Gün Batımı|sea of rooftops at sunset with chimneys
Liman Balık Pazarı|harbour fish market at dawn with crates and gulls
Gece Otobüsü İçi|empty night bus interior with city lights outside
Çamaşır Asılı Ara Sokak|alley with laundry lines between old buildings
Kanal Köprüsü Sisli|canal bridge in morning fog
Şehir Meydanı Kar|city square under snow with a statue
Kapalı Pasaj|covered shopping arcade with glass roof
Asansörlü Eski Bina|old apartment stairwell with cage elevator
Gece Köprüsü Yürüyüş|pedestrian bridge at night with city reflections
Grafiti Duvarları Sokak|street of graffiti walls and shutters
Şehir Parkı Sonbahar|city park in autumn with leaf-covered paths
Tramvay Rayları Yokuş|steep street with tram rails and old houses
Çatı Katı Penceresi Manzara|attic window view over city at dusk
Otoyol Kenarı Motel|roadside city motel with parking lot
Gece Benzinliği Yağmur|gas station in rain at night
Kentsel Su Kulesi|rooftop water tower against skyline
Liman İskelesi Gece|harbour quay at night with cargo ship lights
Eski Sinema Önü|old cinema marquee on a quiet street
Yangın Merdiveni Gece|fire escape at night with neon glow
Metro Çıkışı Kar|subway exit in snowfall
Şehir Kenarı Viyadük|viaduct over city outskirts at dawn
`,
'cyber': `
Neon Yağmurlu Çatı Bahçesi|rooftop garden in neon rain with holo koi pond
Siber Klinik Ara Sokak|back-alley cyber clinic with surgical lights
Holografik Tapınak Sokağı|street with holographic shrine gates
Veri Akışı Megakulesi|megatower with data light streams up its face
Neon Kumarhane Sokağı|neon casino street with flying ads
Siber Liman Rıhtımı|cyber port quay with automated cranes in rain
Kapsül Otel Koridoru|capsule hotel corridor with stacked pods
Neon Metro Vagonu|neon-lit subway carriage with screens
Siber Göl Kenti|lakeside cyber city reflections at night
Gökyüzü Köprüsü Neon|skybridge between towers with neon walls
Yeraltı Siber Arena|underground arena with holo-banners
Siber Bit Pazarı|flea market of old electronics and screens
Neon Çay Evi|tea house with neon signs and paper lanterns
Dev Ekranlı Kavşak|intersection under giant animated screens
Siber Kanalizasyon|sewer with glowing cables and steam
Yapay Kar Neon Şehir|neon city with artificial snow
Gece Pazarı Drone|night market with delivery drones overhead
Siber Polis Karakolu|cyber police precinct with holo screens
Neon Otoyol Kavşağı|neon highway interchange in fog
Arcology Bahçesi|interior garden of an arcology under artificial sun
Siber Liman Konteyner Şehri|container city stacked high with neon
Robot Tamir Atölyesi|robot repair shop cluttered with parts
Neon Çöl Kasabası|desert town with neon motels and hover bikes
Siberpunk Tren Garı|cyberpunk train station with maglev trains
Neon Rıhtım Sisli|foggy neon pier with boats
`,
'historic': `
Babil İştar Kapısı|blue glazed gate with lions and dragons
Roma Hamamı|Roman baths with steaming pools and columns
Antik Olimpiya Stadyumu|ancient stadium with stone starting line
Ortaçağ Lonca Sokağı|guild street with hanging signs and timber houses
Moğol İmparatorluk Kampı|imperial Mongol camp of great felt tents
Rönesans Atölyesi|Renaissance workshop with sculptures and drawings
Bizans Sarayı Avlusu|Byzantine palace courtyard with mosaics
Vikingler Toplantı Salonu|Viking great hall with long fire
Antik Mısır Pazarı|ancient Egyptian market by the Nile
Roma Limanı|Roman harbour with galleys and lighthouse
Fenike Liman Kenti|Phoenician port city with cedar ships
Maya Top Sahası|Maya ballcourt with stone rings
Viktorya Fabrika Kasabası|Victorian mill town with chimneys
Ortaçağ Üniversitesi Avlusu|medieval university cloister
Aztek Pazar Meydanı|Aztec market square near great temple
Ortaçağ Hastanesi|medieval hospital hall with beds and arches
Roma Yolu Kilometre Taşı|Roman road with milestone through hills
Antik Persepolis Merdiveni|Persepolis staircase with reliefs
Kral Mezarlar Vadisi|valley of royal tombs with rock-cut entrances
1920ler Paris Sokağı|1920s Paris street with cafes
Sanayi Devrimi Kanal|industrial revolution canal with barges
Antik Delphi Tiyatrosu|mountainside theatre above temple ruins
Ortaçağ Değirmen Köyü|village with water mill and bridge
Rönesans Floransa Meydanı|Renaissance piazza with cathedral dome
Antik Çin Bambu Kütüphanesi|ancient Chinese library of bamboo scrolls
`,
'industrial': `
Dökümhane Kalıp Salonu|foundry casting hall with sand molds and cranes
Tekstil Boya Havuzları|textile dye pits with colourful vats
Gemi Söküm Plajı|ship-breaking beach with giant hulls
Petrol Kuyusu Çölü|desert oil derricks at sunset
Kağıt Fabrikası|paper mill with huge rollers and steam
Konserve Fabrikası|cannery with conveyor lines
Taş Ocağı|stone quarry with cut blocks and cranes
Tuğla Fırını|brick kilns with stacked bricks and smoke
Kereste Fabrikası|sawmill with log piles and saws
Elektrik Trafo Merkezi|substation with transformers at night
Sanayi Bacaları Gün Batımı|industrial chimneys against sunset
Kimyasal Depolama Tankları|chemical storage tanks with catwalks
Eski Gazhane|old gasworks with gas holders
Demiryolu Atölyesi|railway workshop with locomotives on jacks
Çelik Haddehane|steel rolling mill with glowing sheets
Liman Vinçleri Gece|harbour cranes at night
Cam Üfleme Atölyesi|glassblowing workshop with furnaces
Maden Yıkama Tesisi|ore washing plant with conveyors
Endüstriyel Soğuk Hava Deposu|cold storage warehouse with frost
Tuz Madeni Galerisi|salt mine gallery with carved pillars
Uçak Fabrikası Montaj|aircraft assembly line in a vast hall
Elektrik Barajı Türbin|dam turbine hall
Atık Yakma Tesisi|incinerator with glowing furnace mouth
Terk Edilmiş Rafineri|abandoned refinery overgrown
Güneş Kulesi Santrali|solar tower plant with mirror field
`,
'military': `
Hava Savunma Bataryası|air defence battery with radar dishes
Denizaltı Üssü Tüneli|submarine base tunnel carved in a fjord cliff
Askeri Kamp Gece|military camp at night with floodlights
Zırhlı Araç Deposu|armoured vehicle depot in rows
Askeri Hastane Çadırı|military field hospital tent interior
Komando Eğitim Parkuru|commando obstacle course in mud
Kar Altında Üs|snowbound arctic military base
Helikopter Pisti Gece|helipad at night with landing lights
Askeri Liman|naval base with destroyers at dock
Brifing Odası|briefing room with projector and maps
Kara Kutu Arşiv Bunkeri|archive bunker with steel cabinets
Uzay Kuvvetleri Fırlatma|military rocket launch pad
Askeri Mutfak Çadırı|field kitchen tent with steam
Silah Fabrikası|munitions factory line
Dağ Gözetleme Sığınağı|mountain observation shelter in rock
Çöl Kontrol Kulesi|desert airfield control tower at dusk
Gizli Hangar Dağ İçi|secret hangar inside a mountain
Mayın Tarama Gemisi|minesweeper deck in grey sea
Sınır Karakolu Kar|snowy border post with barrier
Askeri Radyo Kulesi|military radio mast on a hill
Kışla Avlusu Sabah|barracks parade ground at dawn
Nükleer Sığınak Koridoru|nuclear shelter corridor with bunk rooms
Tank Fabrikası Montaj|tank assembly hall
Askeri Demiryolu|military railway with flatcars of tanks
`,
'mountains': `
Sarp Kaya Duvarı Tırmanış|sheer granite wall with climbing ropes
Dağ Zirvesi Haç|summit cross on a rocky peak above clouds
Volkanik Dağ Gölü|volcanic crater lake below a peak
Yüksek Plato Göçebe|high plateau with nomad tents
Kar Çığı Yamacı|avalanche slope with snow debris
Dağ Kayak Kulübesi|ski lodge with chairlift in snow
Taş Köprü Dağ Deresi|stone bridge over a mountain stream
Dağ Kalesi Sis|mountain castle shrouded in fog
Sonbahar Dağ Ormanı|mountain forest in autumn colours
Dağ Köyü Kış Gecesi|mountain village on a winter night
Buzul Sırtı Kamp|ridge camp on a glacier
Dağ Tüneli Demiryolu|railway entering a mountain tunnel
Kayalık Zirve Gece|rocky summit under the Milky Way
Bulut Altında Vadi|valley under a ceiling of cloud
Dağ Şelalesi Yüksek|tall waterfall from a hanging valley
Çoban Patikası|shepherd path across alpine slopes
Dağ Mabedi Kar|snowy mountain shrine with bells
Granit Kubbe|giant granite dome above a valley
Dağ Yolu Kar Tüneli|road through snow walls
Kırmızı Kaya Dağları|red rock mountains at sunset
Dağ Gölü Kulübe|lakeside mountain hut at dawn
Yüksek Dağ Teleferiği|high cable car over a glacier
Kayalık Sırt Fırtına|rocky ridge in a storm
Sisli Dağ Ormanı Yolu|mountain forest road in mist
`,
'desert': `
Çöl Kalesi Harabesi|ruined desert fortress on a rock
Kum Tepesi Kervansarayı|caravanserai at the edge of dunes
Çöl Gece Kampı|desert night camp with fire and tents
Çöl Mağara Resimleri|desert rock shelter with ancient paintings
Çöl Otoyolu Motel|desert motel with neon sign at dusk
Kurumuş Nehir Vadisi|dry river valley with smooth stones
Çöl Vaha Gölü|deep blue oasis lake among dunes
Çöl Rüzgar Taşları|wind-eroded rock formations
Kum Altında Tapınak|temple half buried in sand
Çöl Uçak Enkazı|plane wreck in the desert
Taş Çölü (Hamada)|stony desert plain to the horizon
Çöl Kanyonu Akşam|desert canyon at dusk
Çöl Pazarı|desert market with tents and camels
Kristal Tuz Mağarası|salt crystal cave in desert
Çöl Telgraf Hattı|telegraph poles across desert
Çöl Güneş Tutulması|desert under solar eclipse
Kum Fırtınası Kervan|caravan in a sandstorm
Çöl Kuyusu Köy|desert village around a well
Çöl Kayalık Geçit|rocky desert pass
Yıldız Gözlem Çölü|desert observatory under stars
Çöl Ölü Ağaçları|dead trees on a white clay pan
Çöl Askeri Karakol|desert outpost with flag
Kum Kayağı Tepesi|giant dune slope
Çöl Tren Enkazı|derailed train in the desert
`,
'forest': `
Sisli Kızılçam Vadisi|misty pine valley at dawn
Orman Gölü Ay Işığı|forest lake under moonlight
Devrilmiş Ağaç Köprüsü|fallen tree bridge over a gorge
Orman Yolu Kar|forest road under snowfall
Kuzgun Ormanı|dark forest with ravens
Ormanda Terk Edilmiş Kilise|abandoned chapel in the woods
Eğrelti Otu Vadisi|fern-filled valley
Orman Avcı Kulübesi|hunting lodge in the forest
Kayın Ormanı Bahar|spring beech forest
Orman Nehri Kayalık|forest river with mossy rocks
Ateşböceği Çayırı|clearing with fireflies at dusk
Orman Kamp Ateşi|campfire in a forest clearing at night
Sedir Ormanı|ancient cedar forest
Orman Kesim Alanı|logging clearing with stumps
Sisli Orman Merdiveni|stone stairs in a misty forest
Orman Tren Yolu|railway through a forest
Kızıl Orman Sonbahar|red autumn forest
Orman Gözetleme Kulesi|fire lookout tower above forest
Orman Labirenti Çalılık|hedge maze in woods
Orman Değirmeni|forest water mill
Yağmurlu Orman Yolu|rainy forest path
Orman Kayalık Mağara|forest cave entrance
Orman Bataklık Köprüsü|plank bridge over forest bog
Huş Ağacı Gölü|birch-lined lake
Yaşlı Ağaç Gövde Kapısı|giant tree with hollow trunk doorway
`,
'jungle': `
Cangıl Nehri Kanosu|dugout canoe on a jungle river
Cangıl Tapınak Merdiveni|jungle temple staircase
Cangıl Sis Tepeleri|misty jungle hills
Cangıl Gece Ateşböcekleri|jungle night with fireflies
Mağara Şelalesi Cangıl|cave waterfall in jungle
Yağmur Ormanı Gölü|rainforest lake with lilies
Cangıl Kampı|expedition camp in jungle
Kayıp Uçak Cangıl|plane wreck overgrown in jungle
Cangıl Kanyonu|jungle canyon with vines
Dev Ağaç Kökleri Cangıl|giant buttress roots
Cangıl Plajı Kayalık|jungle beach with rocks
Cangıl Asma Köprüsü Yağmur|rope bridge in rain
Cangıl Köyü Gece|jungle village at night
Tropik Bahçe Seraları|tropical greenhouse
Cangıl Lagünü Gün Batımı|jungle lagoon sunset
Mangrov Gece|mangroves at night
Cangıl Heykelleri|stone heads in jungle
Cangıl Bataklık Sisi|jungle swamp fog
Cangıl Patika Işık|jungle trail with light shafts
Cangıl Tepesi Volkan|volcano above jungle
Cangıl Nehri Şelale|river falls in jungle
Tropik Ada İç Göl|island interior lake
`,
'polar': `
Buzul Kanalı|glacier canal of blue ice
Kutup Gemisi Güvertesi|icebreaker deck in pack ice
Kar Fırtınasında Kulübe|cabin in a blizzard
Buz Çatlağı|giant ice crevasse
Kutup Kuzey Işıkları Kampı|polar camp under aurora
Donmuş Orman|frozen forest with rime ice
Kar Mağarası|snow cave shelter
Buz Sarayı Koridoru|ice palace corridor
Buz Gölü Balıkçı|ice fishing huts on a lake
Kar Kaplı Kilise|snow-covered wooden church
Kutup Uçağı|ski plane on ice
Buzdağı Kemeri|iceberg arch
Donmuş Kıyı Kayalık|frozen rocky coast
Kutup Gecesi Kasaba|polar night town
Kar Tepesi Gün Doğumu|snow ridge sunrise
Buzul Göl Mavi|blue meltwater pool on glacier
Kutup Deniz Ayısı Buzu|sea ice floes
Kar Altında Tren|train in snow
Buz Mağarası Kristal|crystal ice cave
Antarktika Kampı|Antarctic camp
Kutup Kızağı Yolu|sled trail
Donmuş Kanal Şehir|frozen canal city
`,
'coast': `
Fırtınalı İskele|storm-battered pier
Kıyı Mağarası Gün Batımı|sea cave at sunset
Kayalık Sahil Kalesi|coastal castle on rocks
Kuzey Kıyı Kayıkhane|boathouses on a northern shore
Deniz Feneri Fırtına|lighthouse in storm
Tropik Plaj Sabah|tropical beach morning
Uçurum Kenarı Ev|cliffside house
Gelgit Adası|tidal island
Sahil Köyü Gece|coastal village at night
Dalgalı Kayalar|wave-crashed rocks
Kumsal Sisli|foggy beach
Liman Ağzı|harbour mouth with breakwater
Sahil Yolu|coastal road
Kumsal Kamp Ateşi|beach bonfire
Kıyı Deniz Kemeri|sea arch
Balıkçı Barınağı|fishing shelter
Deniz Kayalık Merdiven|cliff stairs to sea
Kıyıda Kayık Mezarlığı|boat graveyard on shore
Kıyı Tuz Tavaları|coastal salt pans
Deniz Fenerinin İçi|lighthouse interior stairs
Kıyı Sisli Orman|coastal foggy forest
Kumsal Fırtına Bulutu|beach with storm cloud
Sahil Kasabası Yağmur|seaside town in rain
`,
'rivers': `
Nehir Kanyonu Kayık|canyon river boat
Göl Kıyısı Sis|lake shore mist
Nehir Kasabası Gece|river town night
Kuğu Gölü|swan lake
Nehir Taşkın Ormanı|flooded river forest
Dağ Gölü Kayık|mountain lake rowboat
Nehir Köprüsü Taş|stone river bridge
Sazlık Kayık Yolu|reed boat channel
Nehir Şelalesi Geniş|wide river falls
Nehir Kenarı Değirmen|riverside mill
Göl Buz Tutmuş|frozen lake
Nehir Mavnası|river barge
Nehir Deltası Kuşlar|delta with birds
Bataklık Ormanı Kayık|swamp forest boat
Göl Gün Batımı İskele|lake sunset pier
Nehir Kıyısı Kamp|riverside camp
Nehir Kanyonu Gün Batımı|river canyon sunset
Göl Ortası Ada|island in a lake
Nehir Feneri|river lighthouse
Gölet Nilüfer Sabah|lily pond morning
Nehir Kumsalı|river beach
Kanal Ağaçlı Yol|tree-lined canal
`,
'plains': `
Ovada Yalnız Ev|lonely house on plains
Sonbahar Tarlaları|autumn fields
Bozkır Gün Batımı|steppe sunset
Rüzgar Değirmenleri Ova|windmills on plains
Kırsal Fırtına Yaklaşıyor|approaching storm over fields
Kırsal Ahır İçi|barn interior
Çayır At Sürüsü|meadow with horses
Kırsal Su Kulesi|rural water tower
Ova Tren Yolu|railway across plains
Kır Düğün Çadırı|country wedding tent
Gelincik Tarlası|poppy field
Kır Kasabası Gece|country town at night
Ova Gökkuşağı|plains with rainbow
Hasat Tarlası Gün Batımı|harvest sunset
Kırsal Yol Ağaçlı|tree-lined country road
Kırsal Okul|rural schoolhouse
Ova Yıldızlı Gece|plains starry night
Kırsal Benzinlik|rural gas station
Çiftlik Ahırı Sis|farm in fog
Ova Kasırga Bulutu|plains funnel cloud
Kırsal Mezarlık|country graveyard
Çayır Patikası|meadow path
`,
'volcanic': `
Lav Kanalı Gece|lava channel at night
Volkan Eteği Orman|forest at volcano base
Volkanik Kumsal Siyah|black volcanic beach
Volkanik Mağara Buhar|steaming volcanic cave
Kül Bulutu Vadi|valley under ash cloud
Volkanik Krater İçi|inside a crater
Lav Şelalesi|lava waterfall
Volkanik Ada Kıyısı|volcanic island coast
Kükürt Madeni|sulphur mine
Volkanik Çöl Gece|volcanic desert night
Lav Akıntısı Yol|lava crossing a road
Buhar Bacaları Ova|steam vents plain
Volkan Zirvesi|volcano summit
Volkanik Göl Mavi|blue volcanic lake
Lav Mağarası Ayna|lava cave mirror pool
Volkanik Kayalık Sahil|volcanic cliffs
Kraterde Gözlem|crater observation post
Volkanik Kum Tepeleri|black sand dunes
Kül Kaplı Orman|ash-covered forest
Volkanik Kaplıca|volcanic hot spring
`,
'caves': `
Yeraltı Kanyonu|underground canyon
Mağara Köprüsü|cave bridge
Kristal Göl Mağarası|crystal lake cave
Mağara Tapınağı Mum|cave temple candles
Mağara Kampı|cave camp
Yarasa Mağarası|bat cave
Mağara Nehri Kayık|cave river boat
Mağara Merdiveni|cave stairway
Mağara Şehri Işıklar|cave city lights
Mağara Kuyusu|cave shaft
Buz Mağarası Tünel|ice cave tunnel
Yeraltı Mantar Ormanı|underground mushroom forest
Mağara Sarkıt Gölü|stalactite lake
Maden Ocağı Asansörü|mine elevator
Mağara Duvar Resimleri|cave wall paintings
Mağara Labirenti|cave labyrinth
Yeraltı Şelalesi|underground waterfall
Mağara Kristal Kubbe|crystal dome cave
Yeraltı Tren İstasyonu|underground station
Lav Tüpü Işık|lava tube light
Mağara Hazine Odası|treasure cave
Mağara Sığınağı|cave shelter
`,
'underwater': `
Batık Savaş Gemisi|sunken warship
Su Altı Mağara Hava Cebi|underwater cave air pocket
Mercan Kanyonu|coral canyon
Deniz Kaplumbağası Resifi|reef ledge with sea grass
Su Altı Kalıntı Kemer|underwater ruin arch
Batık Liman|sunken harbour
Derin Deniz Hendeği|deep trench
Su Altı Kum Dalgaları|underwater sand ripples
Batık Şehir Meydanı|sunken city plaza
Su Altı Volkanı|underwater volcano
Buzdağı Altı|beneath an iceberg
Su Altı Göl Ormanı|underwater lake forest
Batık Araba|sunken car
Su Altı Işık Huzmesi|underwater light beams
Batık Gemi İçi|inside a shipwreck
Su Altı Heykelleri|underwater statues
Derin Deniz Balina Kemiği|whale fall bones
Su Altı Tünel Akvaryum|aquarium tunnel
Kelp Ormanı Gün Batımı|kelp forest sunset
Su Altı Kubbesi|underwater dome
`,
'space': `
Yıldız Kümesi|star cluster
Gezegen Halkası Yakın|close planetary rings
Ay Kraterleri Gölge|lunar craters shadows
Satürn Benzeri Gaz Devi|gas giant rings
Mavi Nebula|blue nebula
Kırmızı Dev Yıldız|red giant star
Yıldız Doğumu Bulutu|star birth cloud
Uzayda Gezegen Çarpışması|planetary collision
Gezegen Kutup Işıkları|planet aurora
Buz Kuyruklu Yıldız|ice comet
Uzay Teleskop Görüntüsü|deep field
Ay Üssü Gece|moon base night
Mars Gün Batımı|Martian sunset
Titan Metan Gölü|methane lake moon
Asteroit Yüzeyi|asteroid surface
Gezegen Siluet Tutulma|planet eclipse silhouette
Çift Yıldız|binary stars
Uzayda Kristal Bulut|crystal nebula
Kara Delik Yakın|black hole close
Galaksi Kenarı|galaxy edge
Volkanik Ay|volcanic moon
Gezegen Fırtına Gözü|giant storm eye
Uzay Enkaz Halkası|debris ring
Yörüngeden Okyanus Gezegeni|ocean planet from orbit
Uzay Bulutsu Sütun|nebula pillar
`,
'starship': `
Gemi Kantini|starship canteen
Kaptan Kamarası|captain's quarters
Gemi Kütüphanesi|ship library
Gemi Spor Salonu|ship gym
Gemi Hücre Bloğu|brig cells
Gemi Kontrol Konsolu|control console room
Gemi Sera|ship greenhouse
Gemi Yakıt Odası|fuel chamber
Gemi Kargo Rampası|cargo ramp
Gemi Hasar Koridoru|damaged corridor
Gemi Mürettebat Salonu|crew lounge
Gemi Asansörü|ship elevator
Gemi Navigasyon Odası|navigation room
Gemi Tıp Kapsülü|medical pod room
Gemi Pilot Kokpiti|fighter cockpit
Gemi Teleport Odası|teleporter room
Gemi Ambar Kapısı|hangar door open to space
Gemi Hologram Salonu|holodeck
Gemi Su Deposu|water tank room
Gemi Mühendislik Atölyesi|engineering workshop
Gemi İletişim Odası|comms room
Gemi Gözlem Kubbesi|observation dome
`,
  };
  Object.entries(X).forEach(([id, text]) => CB.extendGroup(id, text));
  /* v2 motorlarını uygun gruplara bağla */
  const ENG = {
    volcanic: ['lava', 'fire'], sky: ['clouds'], caves: ['canyon'], desert: ['canyon'], space: ['galaxy'], cyber: ['rainglass'], urban: ['rainglass'],
    noir: ['rainglass'], nightlife: ['rainglass', 'orbs'], transport: ['tunnel'], starship: ['tunnel'], lab: ['tunnel', 'cells'], military: ['tunnel'],
    disaster: ['fire'], 'battle-ancient': ['fire'], 'battle-modern': ['fire'], 'battle-future': ['fire'], myth: ['clouds'], fantasy: ['orbs', 'clouds'],
    mountains: ['clouds'], underwater: ['cells'], horror: ['tunnel'], dystopia: ['tunnel'], polar: ['clouds'],
  };
  CB.GROUPS.forEach((g) => { (ENG[g.id] || []).forEach((e) => { if (!g.engines.includes(e)) g.engines.push(e); }); });
})();
