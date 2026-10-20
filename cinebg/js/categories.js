/* CineBG Studio — Kategori veritabanı.
   Her grup: Türkçe ad, arketip (yer işaretleri / malzeme havuzu), bağlam (dış/iç/uzay/su/gök),
   prosedürel motor eşlemesi ve "TR|EN" satırlarından oluşan mekanlar. */
(function () {
  const CB = (window.CB = window.CB || {});

  const GROUPS = [
    { id: 'battle-ancient', tr: 'Savaş Alanları · Antik & Ortaçağ', arch: 'battle', ctx: 'ext', engines: ['battlefield', 'castle', 'storm'], cond: ['aftermath', 'burning', 'smoldering', 'eve'], items: `
Ortaçağ Savaş Ovası|vast medieval battlefield plain churned to mud, broken pikes, abandoned shields and torn banners
Roma Lejyon Kampı Sonrası|aftermath of a Roman legion camp, toppled palisade stakes, scorched tents and fallen eagle standards
Antik Yunan Falanks Sahası|ancient Greek hoplite battlefield on a dry plain, bronze shields scattered among olive stumps
Haçlı Kuşatma Hattı|crusader siege lines below desert walls, wooden trebuchets, earthwork trenches and burnt siege towers
Viking Kumsal Baskını|Viking raid landing on a pebble beach, beached longships, burning fishing huts and drifting smoke
Moğol Bozkır Savaşı|endless Mongol steppe battlefield, trampled grass, broken composite bows and felt tents in the distance
Samuray Savaş Alanı|feudal Japanese battlefield in a misty valley, fallen clan banners on bamboo poles, rice terraces beyond
Kelt Tepe Kalesi Saldırısı|Celtic hillfort under assault, earthen ramparts, timber palisade breached and smoking roundhouses
Ortaçağ Okçu Sırtı|longbow archers' ridge overlooking a muddy field, stakes driven into the earth, arrows planted in rows
Şövalye Turnuvası Sonrası Çayır|meadow after a knightly clash, splintered lances, dented helms and a lone riderless horse trail
Antik Mısır Savaş Arabası Çölü|ancient Egyptian chariot battlefield on cracked desert, overturned chariots and bronze khopesh blades
Pers İmparatorluğu Ordu Ovası|Persian imperial army plain, colossal war camp tents, dust columns and gilded standards
Ortaçağ Köprü Savunması|defended medieval stone bridge over a swollen river, barricades of carts and spent crossbow bolts
Kartaca Fil Savaşı Sahası|Carthaginian war elephant battlefield, giant tusks, broken towers on fallen beasts, dusty plain
Bizans Sur Önü|before massive Byzantine land walls, moat filled with debris, scaling ladders and siege cannon smoke
Sisli Bataklık Pusu Alanı|medieval ambush in a fog-bound marsh, reeds, half-sunken shields and twisted alder trees
Kış Seferi Kar Ovası|winter campaign battlefield on a frozen plain, snow-covered carts, black crows and frozen standards
Orman Kenarı Çatışma|clash at the edge of an ancient oak forest, felled trees as barricades, mist between trunks
Sarp Geçit Savunması|narrow mountain pass held by a shield wall, rockfall, cliffs rising on both sides
Yanık Köy Sonrası|aftermath of a burned medieval village, charred timber frames, smoking thatch and a stone well
Gece Saldırısı Kampı|night raid on a medieval war camp, torches, collapsing tents and sparks rising into the dark
Antik Kalkan Duvarı Tepesi|hilltop after a Saxon shield wall battle, splintered round shields, standing stones on the crest
Nehir Geçidi Savaşı|river ford battlefield, shallow water running over stones, abandoned helmets and broken spears
Ortaçağ Kale Kapısı Önü|before a breached castle gatehouse, battering ram abandoned, portcullis half-raised, scorched stone
Taş Çember Son Direniş|last stand inside a ring of ancient standing stones on a windswept moor
Antik Arena Kuşatması|ancient amphitheatre turned into a fortress, barricaded arches and burnt awnings
` },
    { id: 'battle-modern', tr: 'Savaş Alanları · Dünya Savaşları & Modern', arch: 'battle', ctx: 'ext', engines: ['battlefield', 'storm', 'skyline'], cond: ['aftermath', 'burning', 'smoldering', 'ceasefire'], items: `
Birinci Dünya Savaşı Siperi|WWI trench line with duckboards, sandbag parapets, coiled barbed wire and shell-shattered tree stumps
Ara Bölge (No Man's Land)|cratered no man's land between trenches, flooded shell holes, tangled wire and splintered posts
Çanakkale Sırtları|steep scrubby ridges above a narrow beach, dug-in trenches, wooden ladders and a grey sea below
Normandiya Çıkarma Plajı|wide invasion beach at low tide, steel anti-tank hedgehogs, wrecked landing craft and concrete bunkers
Stalingrad Harabeleri|ruined industrial city of gutted apartment blocks, rubble streets and a broken grain elevator
Kış Ormanı Cephesi|snowbound pine forest front line, foxholes, shattered treetops and frozen supply sleds
Çöl Tank Savaşı|North African desert tank battlefield, burnt-out tanks, tracks in the sand and oil smoke columns
Pasifik Ada Plajı|tropical island beach after a landing, shredded palm trees, black volcanic sand and pillboxes
Orman Pusu Yolu|jungle ambush trail, dense ferns, rain-soaked mud track and abandoned ammunition crates
Bombalı Avrupa Sokağı|bombed European old-town street, collapsed facades, cobblestones under brick dust and a church spire stump
Havalimanı Pisti Çatışması|contested airfield runway, cratered tarmac, wrecked propeller planes and a burning hangar
Siper Komuta Sığınağı Önü|entrance to a sandbagged command dugout, field telephone wires and periscope mounts
Kanal Köprüsü Savaşı|steel canal bridge fought over in a flat landscape, blown span sagging into the water
Kar Fırtınası Cephe Hattı|blizzard on a frozen front line, half-buried artillery, wind-driven snow and telegraph poles
Modern Kentsel Çatışma|modern urban combat zone, concrete apartment blocks with blown-out windows, burnt cars and rubble
Çöl Köyü Çatışma|desert village of mud-brick houses after a firefight, dust, bullet-scarred walls and a minaret
Dağ Karakolu|remote mountain outpost of stacked sandbags, radio mast and razor wire on a rocky ridge
Petrol Sahası Yangını|burning oil field at dusk, pumpjacks silhouetted, towering black smoke and orange fire walls
Liman Bombardımanı Sonrası|bombed harbour, sunken freighters, twisted cranes and oil-slicked water
Demiryolu İstasyonu Harabesi|ruined railway junction, derailed armoured train, torn rails and a burnt signal box
Pirinç Tarlası Cephesi|flooded rice paddies front line, dikes, helicopter rotor wash ripples and tree line
Kale Yamacı Topçu Mevzii|hillside artillery emplacement, camouflage netting, spent shell casings and fog-filled valley
Tank Mezarlığı|tank graveyard in a dry valley, rusting hulls in rows, turrets askew and tumbleweeds
Kırsal Çiftlik Sonrası|farmstead caught in the war, collapsed barn, scorched wheat field and an overturned tractor
Fabrika Avlusu Çatışması|factory yard battleground, smashed brick chimneys, freight wagons and shell-holed sheds
Sahra Hastanesi Çadırları|field hospital tents behind the lines, red-cross canvas, stretchers and muddy duckboards
` },
    { id: 'battle-future', tr: 'Savaş Alanları · Gelecek & Bilimkurgu', arch: 'scifi', ctx: 'ext', engines: ['battlefield', 'planet', 'skyline', 'storm'], cond: ['aftermath', 'burning', 'active-glow', 'smoldering'], items: `
Mech Savaş Alanı|future battlefield of fallen colossal mech walkers, scorched plates and coolant steam
Yörünge Bombardımanı Krateri|giant orbital strike crater, glassed sand, molten edges and a ruined city rim
Uzaylı İstilası Şehir|city during alien invasion, monolithic alien ship hovering above shattered skyscrapers
Robot Ordusu Hurdalığı|field of destroyed combat robots, chrome limbs half-buried in red dust
Lazer Siper Hattı|future trench line with energy shield pylons, armoured sandbags and holographic markers
Mars Kolonisi Kuşatması|siege of a Mars colony dome, cracked pressure domes, red regolith and toppled antennas
Uzay Limanı Savaşı|spaceport battleground, burning dropships on landing pads, control tower with shattered glass
Buzul Gezegen Cephesi|ice planet front line, snow trenches, walker tracks and twin suns low on the horizon
Distopik Meydan Ayaklanması|uprising in a vast dystopian plaza, toppled colossal statue, burning barricades
Drone Sürüsü Vadisi|valley after a drone swarm strike, thousands of downed drones littering a dry riverbed
Siberpunk Sokak Çatışması|neon cyberpunk street after a firefight, shattered holo-signs, steam and wet asphalt
Uzaylı Kovanı Kenarı|edge of an alien hive structure rising from the desert, resin towers and fallen soldiers' gear
Plazma Fırtınası Çölü|desert battlefield under a plasma storm, glowing sand glass, wrecked hover tanks
Ay Üssü Savunması|defended lunar base, regolith berms, crashed lander and Earth hanging in the black sky
Kıyamet Sonrası Mech Mezarlığı|graveyard of giant war machines overgrown with moss in a rainy valley
Yörünge Asansörü Saldırısı|base of a space elevator under attack, cable rising into clouds, ruined anchor station
Gelecek Kale Duvarı|futuristic megawall fortification, colossal concrete segments and turret emplacements
Kaiju Savunma Hattı|coastal defense line against giant monsters, massive barriers and tidal wreckage
Sentetik Orman Muharebesi|battle in a bioluminescent alien jungle, burnt glowing fungi and crashed gunship
Zırhlı Konvoy Pususu|ambushed armoured convoy on a desert highway of the future, burning hover trucks
Uzay Gemisi Enkaz Alanı|crashed capital starship wreck stretching across a canyon, hull plates and smoke
Hologram Kale Kalıntısı|ruins of a fortress with flickering defensive holograms, dust and broken emitters
Kuantum Patlama Bölgesi|quantum blast zone where debris hangs frozen in mid-air above a scorched city block
Nükleer Kış Cephesi|nuclear winter front, grey ash snow, dead forest and a dim orange sun
Yeraltı Tünel Savaşı|underground tunnel warfare corridor, bored rock, cable trays and emergency strobes
` },
    { id: 'siege', tr: 'Kuşatma, Kale & Surlar', arch: 'fortress', ctx: 'ext', engines: ['castle', 'battlefield', 'mountains'], cond: ['besieged', 'ruined', 'weathered', 'pristine'], items: `
Dağ Kalesi|mountain fortress carved into a cliff, switchback road, high curtain walls and banners
Deniz Kalesi|sea fortress on a rocky islet, waves crashing on bastions, single causeway at low tide
Kuşatılmış Sur Kapısı|besieged city gate, colossal timber doors, burning siege engines and arrow-studded walls
Yıkık Gotik Kale|ruined gothic castle on a crag, broken towers, ivy and empty window tracery
Çöl Kalesi|desert citadel of rammed earth, crenellated walls, palm grove and a dry moat
Sur Yürüyüş Yolu|castle wall walkway, crenellations, braziers, view over a burning siege camp
Kale Avlusu|inner bailey of a castle, stables, well, timber hoardings and a central keep
Hendek ve Asma Köprü|moat with a raised drawbridge, chains, murky water and arrow slits above
Kuzey Buz Kalesi|frozen northern fortress, icicles on battlements, snow-buried courtyard
Orman Kalesi Harabesi|forest-swallowed castle ruins, roots through stone, moss carpets and fallen towers
Kayalık Gözetleme Kulesi|lonely watchtower on a sea cliff, signal fire basket and wind-bent grass
Sınır Kalesi|frontier fort of timber and earth on a river bend, palisade and lookout towers
Bastiyon Yıldız Kalesi|star-shaped bastion fortress seen from above, angled ramparts and cannon embrasures
Kale Zindanı Girişi|entrance to castle dungeons, iron gate, worn steps descending and torch sconces
Taht Kalesi Kapısı|grand royal fortress gate with giant guardian statues and a long stone approach
Kuşatma Kampı|besiegers' camp outside walls, trenches, mantlets, trebuchets and cook fires
Kale Merdiveni|monumental castle staircase climbing a rock face to a gatehouse
Kartal Yuvası Kalesi|eagle's-nest fortress on a needle peak above clouds, rope bridge approach
Kumtaşı Surlar|sandstone city walls at sunset, towers with wooden balconies and a dusty road
Göl Kalesi|lake castle reflected in still water, misty reeds and a wooden pier
Su Kemerli Kale|fortress with a Roman aqueduct crossing its moat, arches catching the light
Kale Kilisesi Harabesi|ruined chapel inside castle walls, roofless nave, grass floor and broken altar
Dev Sur Kalıntısı|remnant of a gigantic ancient wall stretching across hills into haze
Mancınık Mevzii|siege catapult platform on a hill overlooking walls, counterweight boxes and stones
` },
    { id: 'postapoc', tr: 'Post-Apokaliptik Dünyalar', arch: 'ruins', ctx: 'ext', engines: ['battlefield', 'skyline', 'dunes', 'storm'], cond: ['abandoned', 'overgrown', 'ruined', 'dusty'], items: `
Terk Edilmiş Otoyol|abandoned multi-lane highway with rusted cars, cracked asphalt and weeds
Bitkilerle Kaplı Şehir|overgrown city reclaimed by nature, vines on skyscrapers, deer grazing among cars
Çöl Hurdalık Kasabası|desert scrap town built from shipping containers and plane wings
Nükleer Çorak Arazi|irradiated wasteland under a sickly sky, dead trees and a cooling tower silhouette
Su Altında Kalmış Metropol|flooded metropolis, water up to the third floor, rowboats among towers
Kül Kaplı Banliyö|suburb buried under volcanic ash, grey rooftops and leafless trees
Terk Edilmiş Alışveriş Merkezi|abandoned shopping mall with collapsed skylights, plants in fountains
Paslı Gemi Mezarlığı|ship graveyard on a dried seabed, rusting hulls tilted in sand
Çökmüş Asma Köprü|collapsed suspension bridge, cables dangling, deck fallen into the river
Hayatta Kalanlar Kampı|survivor camp in a stadium, tarps, fires in barrels and makeshift walls
Kum Altında Şehir|city half-buried by sand dunes, skyscraper tops protruding from the desert
Donmuş Kıyamet Şehri|frozen post-apocalyptic city, snow drifts through streets, ice on facades
Terk Edilmiş Lunapark|abandoned amusement park, rusted Ferris wheel, faded carousel horses
Ölü Orman Yolu|dead forest road, grey trunks, toxic fog and a broken road sign
Yıkık Havalimanı|ruined international airport, collapsed terminal roof, planes overgrown with grass
Kanalizasyon Sığınağı|sewer refuge with hanging lights, drainage water and makeshift beds
Benzin İstasyonu Harabesi|ruined roadside gas station, fallen canopy, desert wind and tumbleweeds
Metro Tüneli Yerleşimi|settlement inside a metro tunnel, train carriages turned into homes
Kırık Baraj|cracked hydroelectric dam, water spilling through breaches, dry reservoir
Zehirli Bataklık Fabrika|toxic swamp around a derelict chemical plant, green water and rusted tanks
Terk Edilmiş Okul|abandoned school, classroom with fallen ceiling, desks under dust
Mezarlık Otoparkı|parking lot of abandoned buses turned into a shantytown
Radyo Kulesi Tepesi|hill with a toppled radio tower, cables across the grass, storm clouds
Kıyı Şehri Harabesi|ruined seaside town, toppled lighthouse, boats on rooftops after a flood
Dev Krater Şehir Kenarı|rim of an impact crater that cut through a city, sheared buildings at the edge
` },
    { id: 'urban', tr: 'Modern Şehir & Sokaklar', arch: 'urban', ctx: 'ext', engines: ['skyline', 'city', 'storm'], cond: ['lived-in', 'empty', 'wet', 'pristine'], items: `
Yağmurlu Gece Caddesi|rain-soaked city avenue at night, reflections of traffic lights on asphalt
Çatı Katı Manzarası|rooftop overlooking a dense skyline, water tanks, antennas and city glow
Arka Sokak|narrow back alley with fire escapes, dumpsters, steam from a grate
Metro Peronu|empty subway platform, tiled walls, fluorescent lights and a train tunnel
Otopark Katı|concrete parking garage level, sodium lights, pillars and oil stains
Şehir Köprüsü Gece|city bridge at night with suspension cables, lit skyline beyond the river
Kavşak Meydanı|busy city intersection with crosswalks, billboards and traffic signals
Gökdelen Lobisi Dışı|plaza at the base of glass skyscrapers, reflective facades, empty benches
Liman Konteyner Sahası|container port at dusk, stacked containers, gantry cranes and puddles
Sanayi Bölgesi Sokağı|industrial district street, warehouses, chain-link fences and graffiti
Banliyö Sokağı|quiet suburban street, picket fences, maple trees and parked cars
Çin Mahallesi Gece|chinatown street at night, red lanterns, signage and steam from food stalls
Tarihi Taş Sokak|old-town cobbled lane, stone houses, iron lamps and flower boxes
Şehir Parkı Sisli Sabah|city park in morning fog, lamp posts, bare trees and wet paths
Otoyol Kavşağı|elevated highway interchange, concrete ramps layered over each other
Tren Rayları Şehir İçi|elevated train tracks through a city, steel girders and shadows on the street
Kıyı Şeridi Yürüyüş Yolu|waterfront promenade with railings, city lights and boats
Gece Benzinliği|lonely gas station at night, bright canopy light in the darkness
Yeraltı Geçidi|pedestrian underpass, tiled walls, flickering tube lights and puddles
Kentsel Çatı Bahçesi|urban rooftop garden at golden hour, planters and string lights
Kar Altında Şehir Caddesi|snowy city avenue, yellow cabs, steam and holiday lights
Sabah Pazarı Sokağı|morning market street, closed stalls, awnings and wet stones
Şehir Kanalı|urban canal lined with old warehouses, small bridges and moored boats
Çamaşırhane Köşesi|corner laundromat glowing at night on an empty street
Polis Kordonu Sokağı|night street sealed off by police tape, rotating lights on wet walls
Gökdelen Çatı Heliportu|skyscraper rooftop helipad at night above the clouds of city lights
` },
    { id: 'cyber', tr: 'Neon, Siberpunk & Gelecek Şehirler', arch: 'scifi', ctx: 'ext', engines: ['city', 'skyline', 'synthwave'], cond: ['wet', 'lived-in', 'decaying', 'pristine'], items: `
Neon Yağmur Sokağı|cyberpunk street in rain, layered neon signs, holographic ads and wet reflections
Megablok Dikey Şehir|vertical megacity blocks stacked to the sky, walkways and flying traffic lanes
Siber Pazar|underground cyber bazaar, cramped stalls with wires, screens and steam
Holografik Reklam Meydanı|plaza dominated by giant holographic advertisements towering over crowds
Uçan Araç Otoyolu|aerial highway lanes between skyscrapers, light trails of flying cars
Siberpunk Çatı|rooftop with tangled antennas and AC units, neon city spread below
Endüstriyel Gelecek Limanı|futuristic harbour with automated cranes and glowing container ships
Tek Raylı Tren İstasyonu|elevated monorail station of glass and steel above neon streets
Neon Erişte Tezgahı Sokağı|narrow street of ramen stalls, neon kanji-like glyph signs and steam
Arka Sokak Veri Merkezi|alley lined with server racks and cooling vents, blue LED glow
Ütopik Bahçe Şehir|clean utopian city of white towers covered in hanging gardens
Siber Gökdelen Zirvesi|top of a corporate arcology above the smog layer, sunrise over clouds
Neon Kanal Şehri|canal city with neon reflected in black water, boats under bridges
Kurumsal Kule Lobisi Dışı|monolithic corporate tower plaza, brutalist scale, drones overhead
Yeraltı Rave Tüneli|underground tunnel lit by lasers and haze, concrete walls
Retrofütürist Bulvar|retro-futurist boulevard with chrome diners and fin-tailed hover cars
Asit Yağmuru Gecekondu|shanty slum under acid rain, corrugated roofs and makeshift neon
Neon Çöl Otoyolu|neon-lined highway across a dark desert to a glowing city
Gelecek Tren Garı|vast future train terminal with magnetic rails and floating signage
Kubbe Şehir|domed city under a glass sky, artificial daylight panels
Hacker İni Penceresi|view from a cramped hacker den window to a sea of neon
Mega Köprü Şehir|megastructure bridge with a city built on its decks
Holo Bahçe Tapınağı|temple garden with holographic koi and neon torii-like gates
Siber Mezarlık|digital cemetery of glowing memorial pillars in fog
Neon Lunapark Gelecek|futuristic amusement district, giant neon wheel and maglev coaster
` },
    { id: 'historic', tr: 'Tarihi Şehirler & Antik Uygarlıklar', arch: 'ancient', ctx: 'ext', engines: ['dunes', 'castle', 'mountains', 'hall'], cond: ['pristine', 'weathered', 'ruined', 'lived-in'], items: `
Antik Roma Forumu|ancient Roman forum, marble temples, colonnades and a triumphal arch
Mısır Piramit Platosu|Giza-like pyramid plateau at dawn, limestone casing and a guardian sphinx
Maya Tapınak Kenti|Maya temple city in jungle, stepped pyramids, carved stelae and mist
Atina Akropolü|acropolis hill with a Doric temple, olive trees and city below
Babil Asma Bahçeleri|terraced hanging gardens of an ancient Mesopotamian city, ziggurat beyond
Petra Kaya Kenti|rose-red rock-cut city facade in a narrow sandstone canyon
İnka Dağ Şehri|Inca mountain citadel on a ridge, dry-stone terraces and peaks in clouds
Antik Çin İmparatorluk Şehri|imperial Chinese palace city, vermilion gates, golden roofs and courtyards
Viking Köyü|Viking village with longhouses, turf roofs and a fjord harbor
Ortaçağ Pazar Meydanı|medieval market square, half-timbered houses, well and stalls
Rönesans Venedik Kanalı|Renaissance Venetian canal, palazzo facades, gondolas and arched bridges
Kartaca Limanı|ancient circular military harbor, ship sheds and a central island
Antik Kütüphane Avlusu|courtyard of a great ancient library, colonnade and papyrus storage
Göbeklitepe Tapınak Alanı|prehistoric stone circle with T-shaped pillars carved with animals
Efes Antik Kenti|marble street of an ancient Ionian city leading to a great library facade
Angkor Tapınak Harabesi|jungle temple ruins with face towers and strangler fig roots
Pompeii Sokağı|ancient Roman street with stepping stones, frescoed walls and a volcano behind
Ortaçağ İslam Medresesi|medieval madrasa courtyard with iwans, tiled portals and a fountain
Hitit Başkenti Kapısı|Bronze Age capital gate guarded by carved stone lions on a hillside
Antik Truva Surları|Bronze Age citadel walls on a windy plain near the sea
Japon Edo Sokağı|Edo-period street, wooden machiya houses, noren curtains and lanterns
Viktorya Londra Sisli Sokak|Victorian London street in fog, gas lamps, brick terraces and cabs
Kuzey Afrika Kasba|kasbah of rammed earth towers in a desert oasis
Sümer Zigguratı|Sumerian ziggurat of mud brick rising over a flat river plain
Stonehenge Şafak|prehistoric megalith circle on open grassland at dawn
Ortaçağ Manastır Kenti|monastery town on a tidal island, abbey spire and causeway
` },
    { id: 'industrial', tr: 'Endüstriyel & Fabrika', arch: 'industrial', ctx: 'mixed', engines: ['hall', 'smoke', 'skyline', 'godrays'], cond: ['operational', 'abandoned', 'rusted', 'smoldering'], items: `
Çelik Dökümhanesi|steel foundry with molten metal pouring, sparks and giant ladles
Terk Edilmiş Fabrika Salonu|abandoned factory hall, broken skylights, rusted machines and pigeons
Elektrik Santrali Türbin Salonu|power plant turbine hall, huge generators and catwalks
Rafineri Gece|oil refinery at night, flare stacks, pipes and thousands of lights
Kömür Madeni Kuyusu|coal mine headframe and shaft, conveyor and black spoil heaps
Tersane Kızağı|shipyard slipway with a half-built hull and towering cranes
Buhar Çağı Lokomotif Deposu|steam-era locomotive roundhouse with turntable and smoke vents
Kimya Tesisi Boru Labirenti|chemical plant pipe maze with valves, gauges and steam
Depo Rafları|vast warehouse with towering shelving, forklifts and high bay lights
Soğutma Kuleleri|cooling towers venting steam over a flat industrial landscape
Hurda Metal Sahası|scrap metal yard with mountains of crushed cars and a magnet crane
Tekstil Atölyesi Tarihi|historic textile mill with looms, belts and tall arched windows
Çimento Fabrikası|cement works covered in grey dust, silos and conveyor bridges
Rüzgar Türbini Tarlası|wind turbine farm on rolling hills at sunset
Güneş Paneli Çölü|solar panel field to the horizon in a heat-hazed desert
Maden Ocağı Teraslı|open-pit mine with terraced walls and giant haul trucks
Petrol Platformu|offshore oil platform in stormy seas, flare burning
Su Arıtma Tesisi|water treatment plant with circular basins and walkways
Barut Fabrikası Harabesi|ruins of a gunpowder factory, blast walls and brick chimneys
Demirci Atölyesi|blacksmith forge workshop, glowing hearth, anvils and tools on walls
Matbaa Tarihi|historic printing house with presses and paper stacks
Bira Fabrikası Kazanları|brewery with copper kettles and steam
Uzay Roketi Montaj Hangarı|rocket assembly hangar with scaffolding and a massive booster
Liman Silosu|grain silos at a harbour, conveyor galleries and ships
Kanalizasyon Ana Hattı|brick sewer main with arched vault and flowing water
` },
    { id: 'military', tr: 'Askeri Üsler, Sığınaklar & Bunkerler', arch: 'industrial', ctx: 'mixed', engines: ['hall', 'battlefield', 'godrays'], cond: ['operational', 'abandoned', 'alert', 'decommissioned'], items: `
Soğuk Savaş Bunkeri|Cold War bunker corridor with blast doors and green-painted walls
Füze Silosu|missile silo shaft seen from the gantry, concrete rings and a dormant missile
Uçak Gemisi Güvertesi|aircraft carrier flight deck at sea, catapult tracks and island tower
Askeri Hangar|military aircraft hangar with arched roof and parked jets
Komuta Merkezi|command center with wall maps, consoles and red alert lighting
Denizaltı Kalemi|submarine pen under a concrete bunker roof, dark water
Çöl Askeri Üssü|desert forward base with blast walls, tents and watchtowers
Atış Poligonu|firing range with targets and berms under grey sky
Askeri Kontrol Noktası|border checkpoint with barriers, floodlights and razor wire
Radar İstasyonu|radar station on a hilltop with rotating dish
Terk Edilmiş Kışla|abandoned barracks with rows of bunks and peeling paint
Sahil Topçu Bataryası|coastal artillery battery, concrete gun emplacements facing the sea
Yeraltı Komuta Tüneli|underground command tunnel with cables, lights and rail tracks
Paraşüt Atlama Bölgesi|drop zone field at dawn with smoke markers and tree line
Askeri Havaalanı Kuleleri|military airfield control tower and runway lights at night
Tank Eğitim Alanı|tank training ground of churned mud and berms
Nükleer Test Sahası|nuclear test site desert with observation bunkers and towers
Sınır Duvarı|militarized border wall with watchtowers and a dead zone
Savaş Gemisi Köprüsü|warship bridge interior with radar screens and windows to the sea
Cephanelik|armory with weapon racks and ammunition crates
Ordu Sahra Karargahı|army field headquarters tent with map tables and lanterns
Kar Altında Gözetleme Kulesi|snowbound watchtower on a frozen border
Denizaltı Kontrol Odası|submarine control room with periscope and red night lighting
Gizli Laboratuvar Bunkeri|secret bunker lab with sealed doors and hazard stripes
` },
    { id: 'mountains', tr: 'Dağlar & Yüksek İrtifa', arch: 'nature', ctx: 'ext', engines: ['mountains', 'storm', 'castle'], cond: ['pristine', 'snowbound', 'windswept', 'misty'], items: `
Alp Zirve Sırtı|alpine summit ridge with corniced snow and sea of clouds below
Himalaya Ana Kamp|Himalayan base camp with prayer flags, tents and a giant ice wall
Dolomit Kuleleri|Dolomite rock towers glowing at sunrise above green meadows
Dağ Geçidi Yolu|winding mountain pass road with hairpin bends and stone walls
Buzul Vadisi|glacier valley with crevasses, moraines and a turquoise meltwater lake
Volkanik Dağ Silueti|lone stratovolcano above a plain, perfect cone with snow cap
Dağ Gölü Yansıması|alpine lake reflecting jagged peaks, pine forest shoreline
İskoç Dağlık Bölge|Scottish highland glen with heather, mist and a lone stone cottage
Kayalık Uçurum Kenarı|precipice edge overlooking a vast valley, wind-carved rocks
Bulutların Üstündeki Zirve|summit above a sea of clouds at golden hour
Dağ Manastırı|monastery clinging to a cliff face with long staircases
Patagonya Granit Kuleleri|Patagonian granite spires with storm clouds and windswept lakes
Teraslı Dağ Köyü|mountain village on terraced slopes, stone houses and smoke
Karlı Çam Yamacı|snowy pine slope with deep powder and a frozen creek
Dağ Kulübesi|mountain hut at dusk with lit windows and snowfields
Kanyon Kenarı Dağ Yolu|cliffside mountain path cut into rock, chains and a sheer drop
Tepe Çayırı Yaz|high summer meadow with wildflowers under jagged peaks
Kristal Buz Mağarası Girişi|entrance to a blue ice cave in a glacier
Fırtınalı Zirve|storm-lashed summit with lightning over peaks
Dağ Köprüsü Asma|rope suspension bridge across a deep gorge
Taş Kule Kayalığı|isolated stone pinnacles rising from scree slopes
Sisli Çay Tepeleri|mist-wrapped tea hills with neat rows and distant peaks
Dağ Rasathanesi|mountain observatory dome on a summit under stars
Kuzey Yüzü Duvarı|sheer north face wall of ice and rock
` },
    { id: 'desert', tr: 'Çöller, Kanyonlar & Kurak Topraklar', arch: 'nature', ctx: 'ext', engines: ['dunes', 'mountains', 'storm'], cond: ['scorching', 'windswept', 'pristine', 'dusty'], items: `
Kum Denizi|endless sand sea with towering dunes and sharp crests
Kızıl Kanyon|red rock canyon with layered walls and a dry riverbed
Çöl Vahası|desert oasis with palms, pool and mud-brick houses
Tuz Gölü Düzlüğü|salt flat with hexagonal crust to the horizon, mirror-like water film
Monument Valley Tarzı Kayalar|isolated sandstone buttes rising from a red desert plain
Kumtaşı Kemerler|natural sandstone arches framing a desert sky
Kurumuş Göl Yatağı|cracked dry lakebed with a lone dead tree
Çöl Kervan Yolu|caravan route across dunes with camel tracks
Kaktüs Vadisi|cactus-studded desert valley at dusk with saguaros
Kum Fırtınası Duvarı|towering sandstorm wall approaching across the desert
Kayalık Çöl Platosu|rocky desert plateau with wind-carved boulders
Dar Kanyon (Slot)|narrow slot canyon with curving smooth walls and light shafts
Çöl Yolu Sonsuz|straight desert road to the horizon, heat shimmer
Volkanik Çöl|black volcanic desert with cinder cones
Beyaz Çöl Kireçtaşı|white desert of chalk formations shaped like mushrooms
Badlands Erozyonu|eroded badlands with striped clay hills
Çöl Kenti Harabesi|ruins of a desert city half buried in sand
Gece Çölü Yıldızlar|desert at night under a blazing Milky Way
Atacama Ay Vadisi|lunar-like valley of salt ridges and sand
Çöl Kuyusu|stone desert well with a pulley and goat tracks
Kızıl Kum Tepeleri|blood-red dune field at sunset
Tabela Mezarlığı Çöl|desert graveyard of forgotten neon signs
Çöl Demiryolu|lonely railway crossing a desert with a water tower
Kanyon Nehri Dönemeci|horseshoe bend of a river deep in a canyon
` },
    { id: 'forest', tr: 'Ormanlar & Ağaçlıklar', arch: 'nature', ctx: 'ext', engines: ['forest', 'godrays', 'mountains'], cond: ['misty', 'pristine', 'autumnal', 'dark'], items: `
Sisli Çam Ormanı|misty pine forest with tall straight trunks and soft light
Kadim Meşe Korusu|ancient oak grove with gnarled trunks and moss
Sekoya Devleri|giant redwood forest with towering trunks and ferns
Sonbahar Kayın Ormanı|autumn beech forest with golden leaves and a carpet path
Huş Ağacı Ormanı Kış|winter birch forest with white trunks and snow
Bambu Ormanı|dense bamboo forest with green filtered light
Bataklık Ormanı|swamp forest with cypress knees and still dark water
Yosunlu Yağmur Ormanı|temperate rainforest with moss-draped trees
Yanmış Orman|burned forest with charred trunks and new green shoots
Orman Patikası Işık|forest path with sunbeams through the canopy
Orman Açıklığı Ay Işığı|moonlit forest clearing with mist
Mantar Ormanı|forest floor with giant fungi and glowing spores
Orman Şelalesi|forest waterfall over mossy rocks
Kızılağaç Nehir Kıyısı|riverside alder forest with roots in water
Karlı Ladin Ormanı|snow-laden spruce forest in silence
Orman Kulübesi|woodcutter's cabin in deep forest with smoke from chimney
Lavanta Tarlası Orman Kenarı|lavender field at a forest edge
Sakura Ormanı|cherry blossom grove with petals falling
Kurumuş Ölü Ağaçlar|grey dead trees in a fog-filled forest
Orman Yangını Gece|forest fire at night with orange walls of flame
Orman Kalesi Yolu|forest road leading to a distant castle
Ağaç Evleri Köyü|village of treehouses connected by rope bridges
Kızıl Akçaağaç Vadisi|valley of red maples in autumn
Orman İçi Taş Çember|stone circle hidden in a forest
Kök Labirenti|tangled root labyrinth of mangrove-like trees
` },
    { id: 'jungle', tr: 'Tropikal & Cangıl', arch: 'nature', ctx: 'ext', engines: ['forest', 'godrays', 'ocean'], cond: ['humid', 'rainy', 'pristine', 'overgrown'], items: `
Amazon Nehri Kolu|Amazon river tributary with dense jungle walls and mist
Cangıl Şelalesi|jungle waterfall plunging into a green pool
Tapınak Harabesi Cangıl|ruined temple swallowed by jungle roots
Tropik Lagün|turquoise lagoon framed by palms and white sand
Mangrov Labirenti|mangrove maze with arching roots over brown water
Cangıl Asma Köprü|rope bridge across a jungle canopy gorge
Bulut Ormanı|cloud forest with epiphytes and drifting fog
Volkanik Ada Cangılı|volcanic island jungle with black rocks and ferns
Cangıl Köyü Sazlık|stilt village in jungle beside a river
Muson Yağmuru Orman|jungle under monsoon downpour
Dev Yaprak Örtüsü|understory of giant leaves and filtered green light
Tropik Mağara Girişi|jungle-covered cave mouth with hanging vines
Kayıp Şehir Merdivenleri|lost city stone stairs ascending through jungle
Pirinç Teras Tepeleri|emerald rice terraces carved into hills
Palmiye Plajı Gün Batımı|palm beach at sunset with leaning trunks
Cangıl Tepesi Gözetleme|jungle hilltop lookout over endless canopy
Bataklık Kaplıca|steaming jungle hot spring
Orkide Vadisi|valley of orchids and moss
Tropik Fırtına Kıyı|tropical storm hitting a palm coast
Gizli Cangıl Gölü|hidden jungle lake with mist
Cangıl Demiryolu Harabesi|abandoned railway in jungle with overgrown locomotive
Kaplan Patikası|tiger trail through tall grass and jungle
` },
    { id: 'polar', tr: 'Kutup, Buzul & Kış Dünyaları', arch: 'nature', ctx: 'ext', engines: ['aurora', 'mountains', 'storm'], cond: ['frozen', 'blizzard', 'pristine', 'windswept'], items: `
Kutup Buz Tabakası|endless polar ice sheet with pressure ridges
Buzdağı Kıyısı|coast with towering icebergs and dark sea
Kuzey Işıkları Fiyordu|fjord under aurora with snowy mountains
Donmuş Göl|frozen lake with cracks and trapped bubbles
Buzul Mağara Mavi|blue glacial ice cave with rippled walls
Kutup Araştırma İstasyonu|polar research station in a blizzard
Tundra Ovası|tundra plain with lichen and distant reindeer tracks
Buzla Kaplı Gemi|ship trapped in pack ice
Kar Fırtınası Vadi|valley engulfed in a blizzard
Buz Kalesi Fantastik|fantasy palace of ice and frost
Kardan Orman Yolu|snowy forest road at blue hour
İglo Köyü|igloo village under a pale sun
Donmuş Şelale|frozen waterfall with icicle curtains
Buzul Ağzı Çöküşü|glacier calving face with falling ice
Kutup Gecesi Yıldızlar|polar night with stars and blue snow
Sibirya Köyü|Siberian village with log houses and smoke in frost
Kar Altında Demiryolu|snow-buried railway with a plow train
Donmuş Liman|frozen harbor with icebound fishing boats
Kar Tepeleri Rüzgar|wind-sculpted snow dunes
Buz Kanyonu|canyon carved in ice with meltwater river
Kar Kaplı Tapınak|snow-covered mountain temple
Donmuş Savaş Alanı|frozen battlefield with snow-covered relics
` },
    { id: 'coast', tr: 'Kıyı, Okyanus & Denizler', arch: 'water', ctx: 'ext', engines: ['ocean', 'storm', 'skyline'], cond: ['calm', 'stormy', 'misty', 'pristine'], items: `
Fırtınalı Uçurum Kıyısı|storm-battered cliff coast with huge waves
Deniz Feneri Kayalık|lighthouse on a rocky point at dusk
Sakin Okyanus Ufku|calm ocean horizon at sunset
Siyah Kum Plajı|black sand beach with basalt sea stacks
Balıkçı Köyü Limanı|fishing village harbor with colorful boats
Açık Deniz Dalgaları|open ocean with massive swells
Kayalık Koy|hidden rocky cove with turquoise water
Gemi Enkazı Sahil|shipwreck on a beach in fog
İskele Gece|wooden pier at night with lamps
Deniz Mağarası|sea cave with light from the opening
Tropik Atol|tropical atoll seen from above
Kuzey Denizi Gri|grey North Sea coast with pebbles and fog
Sahil Kasabası Akdeniz|Mediterranean coastal town with white houses
Deniz Kayalıkları Kuşlar|sea cliffs with seabird colonies
Gelgit Havuzları|tide pools with seaweed at low tide
Okyanus Ortası Gece|middle of the ocean at night under stars
Liman Giriş Kalesi|harbor entrance with stone fort
Mercan Kıyısı|coral coastline with clear shallows
Dalga Kırıcı|breakwater with crashing waves
Fırtına Öncesi Deniz|sea before a storm with dark clouds
Sisli Deniz Fiyordu|misty sea fjord with steep walls
Korsan Koyu|pirate cove with hidden ship
Sahil Kulübeleri|beach huts in a row at dawn
Ay Işığında Deniz|moonlit sea with silver path
` },
    { id: 'rivers', tr: 'Nehirler, Göller & Bataklıklar', arch: 'water', ctx: 'ext', engines: ['ocean', 'forest', 'mountains'], cond: ['misty', 'calm', 'flooded', 'pristine'], items: `
Sisli Göl Şafak|mist-covered mountain lake at dawn, a single wooden rowboat tied to a weathered post
Nehir Deltası|wide river delta of braided silver channels, sandbars and reed islands to the horizon
Bataklık Gece|night swamp of black water, hanging moss, cypress silhouettes and drifting fireflies
Şelale Kanyonu|tall waterfall plunging into a narrow mossy canyon, spray hanging in the air
Nehir Kıyısı Söğütler|slow river bank lined with weeping willows, branches trailing in the current
Dağ Deresi|clear mountain stream tumbling over rounded boulders between spruce trees
Sazlık Göl|reed-lined lake with grey herons, wooden duckboard path and low fog
Nehir Kenti|old river town with arched stone bridges, tall houses and moored barges
Taşkın Ovası|flooded plain with half-submerged trees, fence posts and a drowned road
Göl Evi İskele|timber lake house at dusk, long pier, lantern glowing at the end
Buharlı Termal Göl|steaming thermal lake with mineral-crusted banks and bare trees
Su Değirmeni|old stone water mill with a mossy wooden wheel on a fast stream
Nehir Feribotu|cable river ferry crossing a wide grey river in morning fog
Krater Gölü|deep blue crater lake ringed by steep forested volcanic walls
Turkuaz Buzul Gölü|milky turquoise glacial lake beneath scree slopes and hanging glaciers
Bataklık Kulübesi|stilt shack in a bayou, tin roof, rope ladders and a flat-bottom boat
Nehir Kanyonu Rapids|white-water rapids roaring through a deep granite river canyon
Nilüfer Göleti|still lotus pond with broad leaves, pink flowers and a stone bridge
Kanal Kilitleri|old canal locks with heavy timber gates, brick walls and towpath
Mağara Nehri|underground river flowing through a limestone cave, lit from a distant opening
Nehir Ağzı Liman|estuary harbour at low tide, mudflats, stranded fishing boats and gulls
Göl Adası Tapınak|small temple on a wooded island in the middle of a calm lake
Donmuş Nehir Kıyısı|frozen river with ice floes, snowy banks and a black tree line
Bataklık Geçit Yolu|raised plank causeway crossing a misty peat bog
` },
    { id: 'plains', tr: 'Ovalar, Bozkır & Kırsal', arch: 'nature', ctx: 'ext', engines: ['mountains', 'storm', 'dunes'], cond: ['pristine', 'windswept', 'harvest', 'stormy'], items: `
Buğday Tarlası Gün Batımı|endless golden wheat field at sunset, a dirt track and a lone farmhouse
Bozkır Rüzgarı|windswept steppe of silver feather grass rolling in waves to the horizon
Kır Çiftliği|rural farmstead with red timber barn, grain silo and creaking windmill
Ayçiçeği Tarlası|sunflower field facing the sun, rows stretching to low hills
Prairie Fırtınası|flat prairie under a rotating supercell, wall cloud and green-tinted light
Lavanta Sıraları|purple lavender rows converging on a stone farmhouse
Toskana Tepeleri|rolling Tuscan hills with cypress avenues and a hilltop villa
Kırsal Yol|narrow country lane between dry-stone walls and hedgerows
Savana Akasya|African-style savanna with flat-topped acacia trees and long grass
Fundalık Bozkır|bleak moorland of heather, peat channels and a ruined stone wall
Yalnız Ağaç Tepe|single wind-shaped tree on a grassy hill under a big sky
Saman Balyaları|harvested field scattered with round hay bales in low sun
Kırsal Tren Geçidi|rural railway crossing with wooden signal posts and empty fields
Çayır Sisli Sabah|dew-soaked meadow in thick morning mist, fence fading into white
Bağ Evi|vineyard terraces around an old stone wine house
Lale Tarlaları|stripes of tulip fields leading to a canal and windmill
Bozkır Yurt Kampı|felt yurt camp on an open steppe with horses and distant mountains
Çoban Yaylası|high summer pasture with a stone shepherd's hut and grazing sheep
Kırsal Şapel|small whitewashed chapel alone among cornfields
Tornado Ovası|open plain with a rope tornado touching down behind farm buildings
Kasaba Ana Caddesi|small-town main street with a water tower, diner and grain elevator
Kırık Çit Kır|broken wooden fence running across empty winter fields
` },
    { id: 'volcanic', tr: 'Volkanik & Jeotermal', arch: 'nature', ctx: 'ext', engines: ['battlefield', 'smoke', 'mountains'], cond: ['erupting', 'smoldering', 'dormant', 'steaming'], items: `
Lav Nehri|river of molten lava snaking through a black crusted lava field
Patlayan Volkan|erupting volcano with a towering ash column split by volcanic lightning
Kaldera Kenarı|caldera rim overlooking a vast steaming crater floor
Gayzer Alanı|geyser field erupting at dawn, silica terraces and steam columns
Siyah Lav Tarlası|cooling black lava field with glowing orange cracks
Kükürt Kraterleri|sulphur crater with yellow crusted vents and acidic blue pools
Volkanik Plaj|lava pouring into the ocean, explosive steam plumes over black sand
Kül Yağmuru Kasaba|small town under a fall of grey volcanic ash, dim orange daylight
Lav Tüpü Mağara|long lava tube tunnel with ribbed basalt walls and a skylight
Jeotermal Havuzlar|rainbow-coloured geothermal hot pools with steaming edges
Volkan Gözlemevi|lonely volcano monitoring station on a cinder slope
Obsidyen Vadi|valley of glassy black obsidian boulders and steam
Fumarol Tepeleri|barren hills with hissing fumaroles and mineral-stained rock
Volkanik Ada Doğuşu|newborn volcanic island rising from the sea in steam and ash
Lav Gölü|bubbling lava lake inside a deep crater
Bazalt Sütunları|hexagonal basalt column coast with waves crashing
Ölü Volkanik Orman|forest of grey skeleton trees killed by volcanic gas
Lahar Vadisi|valley buried by a volcanic mudflow, half-buried houses
Asidik Krater Gölü|turquoise acid crater lake with sulphur fumes
Volkan Eteği Köy|stone village at the foot of a smoking volcano
` },
    { id: 'caves', tr: 'Mağaralar & Yeraltı Dünyaları', arch: 'underground', ctx: 'int', engines: ['godrays', 'hall', 'underwater'], cond: ['pristine', 'flooded', 'abandoned', 'glowing'], items: `
Dev Mağara Salonu|cathedral-sized cave chamber with towering stalagmites
Işık Huzmeli Mağara|cave floor lit by a single shaft of sunlight through a ceiling opening
Yeraltı Gölü|underground lake with mirror-still water and dripping stalactites
Kristal Mağara|cave of giant selenite crystal beams crisscrossing the chamber
Ateş Böceği Mağarası|glowworm grotto, ceiling dotted with blue-green points of light
Maden Tüneli|old mine tunnel with timber supports, rails and a lantern
Katakomplar|ancient catacombs lined with stacked bones and skull niches
Yeraltı Şehri|multi-level underground city carved in soft volcanic rock
Buz Mağarası|ice cave with frozen waterfalls and blue translucent walls
Sarkıt Galerisi|long gallery of dripping stalactites and flowstone curtains
Yeraltı Nehri|subterranean river flowing between sculpted rock walls
Mağara Tapınağı|temple facade carved into a cave wall with stone guardians
Lav Mağarası|volcanic cave with a red glow of distant magma
Yeraltı Pazarı|underground market cavern with stalls cut into rock
Mağara Ormanı|giant sinkhole cave with a jungle growing under a collapsed roof
Mağara Ağzı Fırtına|view from inside a cave mouth to a storm over the sea
Cüce Salonu|colossal dwarven hall carved into a mountain, rows of square pillars
Mağara Şelalesi|waterfall dropping inside a cavern into a dark pool
Cenote|cenote sinkhole with turquoise water and hanging roots
Terk Edilmiş Metro Tüneli|abandoned subway tunnel with rusted tracks and dripping water
Yeraltı Sığınak Şehri|underground shelter city with stacked dwellings and cables
Mantar Mağarası|cavern of giant bioluminescent mushrooms
` },
    { id: 'underwater', tr: 'Su Altı Dünyaları', arch: 'water', ctx: 'water', engines: ['underwater'], cond: ['pristine', 'sunken', 'deep', 'glowing'], items: `
Mercan Resifi|vibrant coral reef in clear shallow water with sunbeams
Batık Kalyon|sunken galleon on the seabed, masts broken, cannons in sand
Kelp Ormanı|towering kelp forest swaying with light shafts from the surface
Derin Deniz Karanlığı|deep sea darkness with drifting bioluminescent particles
Batık Antik Şehir|sunken ancient city with toppled columns and statues
Su Altı Mağarası|underwater cave with a blue window of light at its mouth
Buz Altı Su|underside of sea ice, blue light filtering through cracks
Okyanus Tabanı Kanyonu|ocean floor canyon dropping into darkness
Batık Uçak|sunken propeller airplane resting on white sand
Su Altı Tapınağı|submerged temple steps with algae-covered statues
Hidrotermal Bacalar|deep sea hydrothermal vents billowing black smoke
Mavi Delik|vertical blue hole abyss with coral rim
Batık Denizaltı|wreck of a submarine on the seabed covered in growth
Su Altı Üssü|underwater research base with glowing portholes
Deniz Çayırı|seagrass meadow in shallow turquoise water
Gece Mercan Bahçesi|coral garden at night lit by a dive torch beam
Batık Tren|sunken train carriages at the bottom of a lake
Kubbeli Su Altı Şehri|domed underwater city glowing in the deep
Su Altı Heykel Parkı|underwater sculpture park of figures covered in coral
Göl Tabanı Ormanı|submerged forest of drowned trees in a clear lake
` },
    { id: 'space', tr: 'Uzay, Gezegenler & Kozmik', arch: 'space', ctx: 'space', engines: ['nebula', 'planet', 'anamorphic'], cond: ['pristine', 'cosmic', 'violent', 'quiet'], items: `
Halkalı Gaz Devi|ringed gas giant with shepherd moons and shadow on the rings
Nebula Bulutu|colourful emission nebula with dark dust lanes and star clusters
Ay Ufkunda Gezegen Doğuşu|planet rising over a cratered moon horizon
Kara Delik|black hole with a glowing accretion disk bending starlight
Asteroit Kuşağı|dense asteroid field with tumbling rocks and dust
Galaksi Merkezi|glowing galactic core seen across dust lanes
Mars Yüzeyi|Martian surface of red dunes, rocks and a dusty pink sky
Ay Yüzeyi|lunar surface with craters, boulders and black sky
Buz Ay Yüzeyi|icy moon surface with blue fractures and geysers
Gaz Devi Atmosferi|inside a gas giant atmosphere, towering cloud bands and storms
Süpernova|supernova blast shell expanding through space
Çift Güneşli Yabancı Ufuk|alien planet horizon with two setting suns
Kuyruklu Yıldız|bright comet with ion tail passing a planet
Yıldız Doğum Sütunları|towering pillars of gas in a stellar nursery
İstasyon Dışı Dünya|orbital station exterior with Earth below
Dünya Doğuşu|Earth rising over the lunar horizon
Kızıl Cüce Sistemi|tidally locked planet under a dim red dwarf star
Pulsar Işınları|spinning pulsar with sweeping beams of light
Galaksi Çarpışması|two galaxies colliding, tidal streams of stars
Uzay Enkaz Alanı|field of space debris and broken satellites over a planet
Lav Gezegeni|lava world surface with glowing seas and black crust
Okyanus Gezegeni|endless ocean world with giant waves and storms
Kristal Gezegen|alien surface of towering crystal formations
Yörünge Şafağı|orbital sunrise over Earth's curved atmosphere
Derin Uzay Boşluğu|deep space void scattered with distant galaxies
` },
    { id: 'starship', tr: 'Uzay Gemileri & İstasyon İçleri', arch: 'scifi', ctx: 'int', engines: ['hall', 'anamorphic', 'godrays'], cond: ['operational', 'damaged', 'abandoned', 'alert'], items: `
Gemi Köprüsü|starship bridge with curved consoles and a wide viewport to space
Hangar Güvertesi|cavernous hangar deck with parked fighters and launch tube
Kriyo Uyku Odası|cryo sleep chamber with frosted pods in rows
Makine Dairesi|engine room with glowing reactor column and catwalks
Kırmızı Alarm Koridoru|ribbed corridor under red alert strobes
Gözlem Güvertesi|observation deck with panoramic window to a planet
Hava Kilidi|airlock chamber with hazard stripes and outer door
Revir|med bay with scanner beds and soft white light
Kargo Ambarı|cargo hold with stacked containers and loader mechs
Terk Edilmiş Gemi|derelict ship interior with floating debris and emergency lights
Bahçe Modülü|hydroponic garden module with plants under grow lights
Komuta Odası|command room with a holographic star map table
Uzay Asansörü Kabini|space elevator cabin with view down to clouds
Halka Habitat|rotating ring habitat interior with curving horizon
Reaktör Çekirdeği|reactor core chamber with containment rings
Bilim Laboratuvarı|shipboard science lab with specimen tanks
Mürettebat Kamarası|crew quarters with bunks and personal lockers
Silah Güvertesi|weapons deck with heavy turret mechanisms
Bakım Tüneli|cramped maintenance crawlway with pipes and cables
Kaçış Kapsülü Bölmesi|escape pod bay with launch hatches
Organik Uzaylı Gemi İçi|organic alien ship interior with ribbed biomechanical walls
Kolonist Gemi Yemekhanesi|colony ship mess hall with long tables
` },
    { id: 'fantasy', tr: 'Fantastik Krallıklar & Diyarlar', arch: 'fantasy', ctx: 'ext', engines: ['castle', 'mountains', 'forest', 'aurora'], cond: ['pristine', 'ancient', 'enchanted', 'ruined'], items: `
Uçan Adalar|floating islands with waterfalls pouring into clouds
Elf Orman Şehri|elven city of carved halls built into colossal trees
Cüce Dağ Kapısı|colossal dwarven gate carved into a mountainside
Ejderha Yuvası|dragon lair cavern heaped with gold and bones
Büyücü Kulesi|lone wizard tower on a sea cliff with a glowing window
Peri Ormanı|enchanted forest with glowing flowers and floating motes
Kristal Vadi|valley of giant crystals catching sunlight
Kraliyet Başkenti|royal capital with white walls, spires and harbour
Tepe Köyü|hill village of round doors set into grassy mounds
Büyülü Kütüphane|towering magical library with floating books
Dünya Ağacı|colossal world tree rising above the clouds
Portal Taş Halkası|ring of ancient stones with a shimmering portal
Gökkuşağı Şelalesi|waterfall casting rainbows in a fantasy valley
Büyülü Göl|enchanted lake with glowing water and mist
Ejderha Kemik Vadisi|valley littered with giant dragon skeletons
Ork Savaş Kampı|orc war camp with crude palisades and fires
Deniz Krallığı Limanı|fantasy sea kingdom harbour with tall ships
Mantar Krallığı|kingdom of giant mushrooms and winding paths
Kadim Tapınak|ancient fantasy temple overgrown with vines
Bulut Kalesi|castle resting on clouds above the world
Kristal Saray|palace of crystal glowing in twilight
Büyülü Pazar|magic market street with lanterns and potion stalls
Işıklı Çayır|meadow of glowing flora under twin moons
Ruhlar Ormanı|spirit forest of pale trees and drifting lights
Cadı Kulübesi Bataklık|crooked witch hut in a foggy swamp
` },
    { id: 'darkfantasy', tr: 'Karanlık Fantastik & Gotik', arch: 'gothic', ctx: 'ext', engines: ['castle', 'storm', 'forest', 'hall'], cond: ['decaying', 'cursed', 'stormy', 'ruined'], items: `
Vampir Şatosu|vampire castle on a crag under a full moon
Gotik Katedral Harabesi|ruined gothic cathedral with broken spires
Lanetli Orman|cursed forest of twisted black trees and fog
Kemik Taht Salonu|throne room built of bones and skulls
Kara Kale|black fortress under a red sky
Ölüler Diyarı|grey land of the dead with wandering mist
Gotik Mezarlık|gothic cemetery of angels and crypts
Cadı Avı Köyü|village with a pyre in the square at dusk
Karanlık Kule|dark tower piercing storm clouds
Lanetli Göl|black lake with dead trees and fog
Cehennem Kapısı|colossal hellish gate glowing with fire
Kan Ayı Ovası|barren plain under a blood moon
Hayalet Gemi|ghost ship emerging from fog
Gotik Köprü|gothic stone bridge over a chasm
Karanlık Labirent|overgrown hedge labyrinth at night
Nekromant Kulesi|necromancer tower with green light
Yanmış Manastır|burned monastery with black beams
Kara Bataklık|black swamp with rotting boardwalks
Ölü Kral Mezarı|tomb of a dead king with stone effigy
Perili Kale Avlusu|haunted castle courtyard in fog
Gotik Şehir Gece|gothic city at night with steep roofs
Kurt Adam Ormanı|werewolf forest under moonlight
` },
    { id: 'horror', tr: 'Korku & Terk Edilmiş Mekanlar', arch: 'horror', ctx: 'mixed', engines: ['hall', 'forest', 'storm', 'godrays'], cond: ['abandoned', 'decaying', 'eerie', 'flooded'], items: `
Terk Edilmiş Akıl Hastanesi|abandoned asylum corridor with peeling paint and gurneys
Perili Ev|haunted Victorian house on a hill at dusk
Terk Edilmiş Hastane Koğuşu|abandoned hospital ward with rusted beds
Ormandaki Kulübe|lonely cabin in dark woods with one lit window
Karanlık Bodrum|dark basement with a single hanging bulb
Terk Edilmiş Kilise|abandoned church with broken pews
Sisli Mezarlık|foggy cemetery with leaning headstones
Terk Edilmiş Çocuk Odası|abandoned nursery with a cradle and old toys
Otel Koridoru|long empty hotel corridor with patterned carpet
Hayalet Kasaba|empty ghost town with swinging signs
Terk Edilmiş Sirk Çadırı|torn abandoned circus tent
Mısır Tarlası Gece|cornfield at night with a scarecrow
Okul Koridoru Gece|school hallway at night with lockers
Morg|morgue with steel drawers and cold light
Terk Edilmiş Tren Vagonu|abandoned train carriage with torn seats
Kuyu Köyü|village with an old stone well in fog
Göl Kenarı Kamp|lakeside summer camp at night
Bodrum Tüneli|tunnel beneath a house with dirt walls
Terk Edilmiş Oyun Parkı|abandoned playground in fog
Malikane Merdiveni|grand mansion staircase in darkness
Terk Edilmiş Ameliyathane|derelict operating theatre
Ormanda Terk Araba|car abandoned on a forest road at night
` },
    { id: 'sacred', tr: 'Kutsal & Dini Mekanlar', arch: 'sacred', ctx: 'mixed', engines: ['hall', 'godrays', 'mountains'], cond: ['pristine', 'ancient', 'candlelit', 'ruined'], items: `
Gotik Katedral Nefi|gothic cathedral nave with ribbed vaults and stained glass
Cami Avlusu|mosque courtyard with arcades and ablution fountain
Budist Tapınağı|Buddhist temple hall with golden statue
Şinto Tapınağı|Shinto shrine with vermilion gates in forest
Hindu Tapınağı|carved Hindu temple tower at dawn
Manastır Revakları|monastery cloister around a garden
Kahin Tapınağı|ancient oracle temple on a mountainside
Bizans Mozaik Kilisesi|Byzantine church with gold mosaics and dome
Tibet Manastırı|Tibetan monastery on a cliff with prayer flags
Kapadokya Kaya Kilisesi|rock-cut church with faded frescoes
Dağ Sunağı|mountain altar of stacked stones above clouds
Mum Işıklı Şapel|candlelit stone chapel
Sinagog İçi|historic synagogue interior with arches
Zen Bahçesi|zen rock garden of raked gravel
Mısır Tapınağı Sütunları|forest of carved Egyptian columns
Kutsal Mağara|sacred cave with candles and icons
Tapınak Merdiveni|long stone temple stairway through forest
Hac Yolu|pilgrimage path with stone markers
Rahibe Manastırı|quiet convent courtyard
Orman Sunağı|ancient altar in a forest clearing
Katedral Kriptası|cathedral crypt with tombs
Kutsal Göl Tapınağı|shrine on the shore of a sacred lake
` },
    { id: 'palace', tr: 'Saraylar, Taht Salonları & Lüks', arch: 'palace', ctx: 'int', engines: ['hall', 'godrays', 'silk'], cond: ['pristine', 'opulent', 'decaying', 'abandoned'], items: `
Taht Salonu|vast throne room with a raised throne and banners
Balo Salonu|baroque ballroom with chandeliers
Ayna Galerisi|hall of mirrors with gilded frames
Saray Bahçesi|formal palace garden with fountains
Kraliyet Kütüphanesi|royal library with spiral stairs
Ziyafet Salonu|banquet hall with a long table and candelabras
Saray Merdiveni|grand marble staircase
Kraliyet Yatak Odası|royal bedchamber with canopy bed
Osmanlı Harem Dairesi|Ottoman harem chambers with tiles and cushions
Doğu Sarayı|Eastern palace with domes and carved screens
Mermer Avlu|marble courtyard with columns
Saray Hamamı|palace bath with domes and star skylights
Kraliyet Şapeli|royal chapel with gilded altar
Saray Koridoru|palace corridor of portraits
Konsey Odası|council chamber with a round table
Hazine Odası|treasury vault of gold and chests
Saray Mutfağı|palace kitchen with copper pots and hearth
Kış Bahçesi|glass winter garden conservatory
Kraliyet Ahırları|royal stables with arched stalls
Opera Salonu|opera house auditorium with tiers
` },
    { id: 'residential', tr: 'İç Mekan · Konut', arch: 'interior', ctx: 'int', engines: ['hall', 'godrays', 'silk'], cond: ['lived-in', 'pristine', 'abandoned', 'messy'], items: `
Loft Daire|industrial loft apartment with brick walls and huge windows
Kır Evi Mutfağı|rustic farmhouse kitchen with cast iron stove
Viktorya Oturma Odası|Victorian parlour with wallpaper and fireplace
Çatı Katı Odası|attic room with sloped ceiling and dusty trunks
Modern Villa Salonu|modern villa living room with glass walls to the sea
Gece Yatak Odası|bedroom at night lit by street light
Çocuk Odası|child's bedroom with toys and night light
Mermer Banyo|marble bathroom with freestanding tub
Ev Kütüphanesi|home library with leather chairs
Garaj Atölyesi|garage workshop with tools on pegboard
Kulübe İçi|log cabin interior with fire and furs
Sabah Mutfağı|kitchen in morning light with steam
Yemek Odası|formal dining room with chandelier
Ev Limonluğu|home conservatory full of plants
Bodrum Odası|basement den with low ceiling
Geleneksel Japon Evi|traditional Japanese house with tatami
Fas Riad Avlusu|Moroccan riad courtyard with fountain
Öğrenci Yurdu Odası|cluttered student dorm room
Gece Çatı Katı Dairesi|penthouse at night with city view
Eski Ev Salonu|old house sitting room with lace curtains
Sanat Atölyesi|painter's studio with north light
Müzik Odası|music room with grand piano
` },
    { id: 'public', tr: 'İç Mekan · Kamusal Alanlar', arch: 'interior', ctx: 'int', engines: ['hall', 'godrays', 'city'], cond: ['empty', 'busy-but-empty', 'pristine', 'abandoned'], items: `
Hastane Koridoru|long hospital corridor with fluorescent lights
Okul Sınıfı|empty classroom with desks and chalkboard
Büyük Kütüphane|grand reading room with domed ceiling
Müze Salonu|museum gallery with skeleton and skylights
Tiyatro Sahnesi|empty theatre stage with red curtain
Mahkeme Salonu|wood-panelled courtroom
Polis Karakolu|police precinct with desks and cells
Hapishane Koğuşu|prison cell block with tiers
Spor Salonu|school gymnasium with wooden floor
Kafeterya|empty cafeteria with long tables
Açık Ofis|open plan office at night
Toplantı Odası|corporate boardroom with skyline view
Banka Kasası|bank vault with round steel door
Sinema Salonu|cinema auditorium with red seats
Kumarhane Salonu|casino floor with tables and lights
Gece Restoranı|restaurant at night with candles
Karanlık Bar|dim bar with backlit bottles
Kafe Penceresi|cafe interior by a rainy window
Berber|old barbershop with leather chairs
Çamaşırhane|laundromat with rows of machines
Postane|historic post office hall
Belediye Binası|town hall with marble stair
` },
    { id: 'transport', tr: 'Ulaşım, İstasyon & Altyapı', arch: 'industrial', ctx: 'mixed', engines: ['hall', 'skyline', 'city', 'godrays'], cond: ['empty', 'operational', 'abandoned', 'wet'], items: `
Tarihi Tren Garı|historic train station with iron and glass roof
Havalimanı Terminali|airport terminal at night with planes outside
Gece Otobüs Durağı|lone bus stop at night under a lamp
Feribot Terminali|ferry terminal on a grey morning
Otoyol Tüneli|highway tunnel with orange lights
Demiryolu Viyadüğü|stone railway viaduct across a valley
Tramvay Deposu|tram depot with parked trams
Yük Treni Sahası|freight yard with rows of wagons
Kır Benzin İstasyonu|rural gas station at dusk
Çatı Otoparkı|rooftop car park at sunset
Kargo Havalimanı|cargo airport apron with jets
Teleferik İstasyonu|mountain cable car station
Metro Peronu Modern|modern metro platform
Feribot Güvertesi|ferry deck in fog
Kanal Kilidi Endüstriyel|industrial canal lock
Gemi Köprüsü Ticari|cargo ship bridge at sea
Sonsuz Raylar|railway tracks vanishing to the horizon
Köprü Altı|under a highway bridge
Gece Otoyolu|empty highway at night
Uçak Hangarı|aircraft hangar with a plane
Tren Vagonu İçi|vintage train carriage interior
Liman Feneri|harbour beacon at night
` },
    { id: 'western', tr: 'Western & Vahşi Batı', arch: 'western', ctx: 'ext', engines: ['dunes', 'mountains', 'storm'], cond: ['dusty', 'abandoned', 'lived-in', 'scorching'], items: `
Western Ana Cadde|dusty western main street with false-front buildings
Salon Önü|saloon facade with swinging doors and hitching rail
Çöl Tren İstasyonu|lonely desert train station with water tower
Western Hayalet Kasaba|abandoned western ghost town with tumbleweeds
Kanyon Pususu|narrow canyon trail with rock ledges
Ranch Çiftliği|ranch house with corrals under big sky
Maden Kasabası|gold rush mining town on a hillside
Şerif Ofisi|sheriff office interior with jail cell
Kabile Çadır Kampı|tipi encampment by a river under bluffs
Western Mezarlığı|boot hill cemetery with wooden crosses
Altın Madeni Girişi|gold mine entrance with ore carts
Kovboy Kamp Ateşi|campfire on the open range under stars
Western Ahşap Köprü|wooden trestle railway bridge over a gorge
Posta Arabası Yolu|stagecoach road through desert
Western Hapishanesi|frontier jail with barred window
Western Şapeli|white frontier chapel
Düello Sokağı|noon duel street with long shadows
Su Kulesi|wooden water tower by tracks
Sınır Kalesi Western|frontier cavalry fort with palisade
Western Bankası|frontier bank with safe
` },
    { id: 'noir', tr: 'Noir & Dönem Filmleri (1920–1980)', arch: 'urban', ctx: 'mixed', engines: ['city', 'skyline', 'hall'], cond: ['wet', 'smoky', 'lived-in', 'empty'], items: `
Dedektif Ofisi|1940s detective office with blinds casting stripes
Caz Kulübü|smoky jazz club with small stage
Yasak Dönemi Barı|hidden speakeasy behind a bookshelf
Yağmurlu Noir Sokak|rainy noir street with neon and fedora shadows
Art Deco Otel Lobisi|art deco hotel lobby with brass and marble
1950ler Diner|1950s chrome diner with booths
1970ler Disko|1970s disco with lit floor
Gazete Matbaası|newspaper press room with rolling presses
Noir Rıhtım|foggy noir docks with crates
Telefon Kulübesi|phone booth on a rainy corner
Eski Sinema|old picture palace with marquee
Art Deco Gökdelen|art deco skyscraper crown at night
Gece Moteli|roadside motel at night with vacancy sign
1960lar Ofisi|1960s advertising office
Radyo Stüdyosu|vintage radio studio with microphones
Tren Kompartımanı|vintage train compartment
Eski Kumarhane|1960s casino interior
1940lar Gece Kulübü|1940s nightclub with big band stage
1950ler Benzin İstasyonu|1950s gas station with round pumps
Sorgu Odası|interrogation room with single lamp
` },
    { id: 'eastasia', tr: 'Doğu Asya · Dönem & Modern', arch: 'eastasia', ctx: 'mixed', engines: ['mountains', 'forest', 'city', 'castle'], cond: ['pristine', 'misty', 'lived-in', 'ruined'], items: `
Japon Kalesi|Japanese castle keep above stone walls
Kyoto Tapınak Yolu|stone temple path with lanterns
Çin Dağ Tapınağı|Chinese temple perched on misty peaks
Bambu Yolu|path through towering bamboo grove
Tokyo Neon Ara Sokak|narrow Tokyo alley with izakaya lanterns
Kore Sarayı|Korean palace hall with painted eaves
Çin Su Kasabası|canal water town with stone bridges
Samuray Dojo|wooden samurai dojo with weapon racks
Çay Evi|traditional tea house with garden
Pagoda Gün Batımı|five-storey pagoda at sunset
Çin Seddi|great wall winding over mountain ridges
Hong Kong Çatısı|Hong Kong rooftop with dense towers
Japon Bahçesi|Japanese garden with pond and maple
Onsen|outdoor hot spring in snow
Gizli Ninja Köyü|hidden village in a mountain gorge
1930lar Şanghay|1930s Shanghai bund waterfront
Pirinç Terasları|rice terraces in morning mist
Torii Koridoru|corridor of vermilion torii gates
Hanok Köyü|traditional Korean hanok village
Çin Saray Avlusu|imperial palace courtyard
Japon Balıkçı Köyü|Japanese fishing village harbour
Kabuki Tiyatrosu|kabuki theatre stage
` },
    { id: 'anatolia', tr: 'Orta Doğu, Anadolu & Osmanlı', arch: 'anatolia', ctx: 'mixed', engines: ['dunes', 'hall', 'castle', 'mountains'], cond: ['pristine', 'lived-in', 'weathered', 'ruined'], items: `
Kapalıçarşı|vaulted grand bazaar with lamps and carpets
Kervansaray|Seljuk caravanserai courtyard with stone arches
Kapadokya Peribacaları|fairy chimney valley at sunrise
Osmanlı Sarayı|Ottoman palace courtyard with kiosks and tiles
Selçuklu Medresesi|Seljuk madrasa with carved portal
Boğaz Yalısı|wooden waterside mansion on the Bosphorus
Tarihi Hamam|historic hammam with domed skylights and steam
Mardin Taş Evleri|stone houses stepping down to Mesopotamian plain
Nemrut Dağı|mountain summit with colossal stone heads
Sümela Manastırı|cliff monastery in forested gorge
Pamukkale Travertenleri|white travertine terraces with pools
Ani Harabeleri|medieval ruined city on a gorge
Osmanlı Kahvehanesi|Ottoman coffeehouse with low sofas
İstanbul Taş Sokağı|steep cobbled street with wooden houses
Anadolu Kale Surları|Anatolian fortress walls on a hill
Bedevi Çadırı|Bedouin tent camp in desert
Fas Çarşısı|Moroccan souk with lanterns
Çöl Kalesi Arabistan|Arabian mud-brick desert fort
Binbir Gece Şehri|thousand and one nights city of domes
İran Bahçesi|Persian garden with long pool
Güllüdere Kızıl Vadi|rose-pink valley of eroded tuff cliffs and cave churches
Safranbolu Konakları|Ottoman timber mansions on a hillside
Divriği Taş Portali|intricately carved stone portal
İshak Paşa Sarayı|mountain palace on a plateau
` },
    { id: 'sky', tr: 'Gökyüzü, Bulutlar & Hava Olayları', arch: 'sky', ctx: 'sky', engines: ['storm', 'mountains', 'aurora', 'godrays'], cond: ['stormy', 'calm', 'dramatic', 'pristine'], items: `
Bulutların Üstü|above the clouds at golden hour
Süper Hücre Fırtına|supercell thunderstorm over plains
Kasırga Gözü|eye of a hurricane with walls of cloud
Şimşek Gecesi|night sky full of lightning bolts
Gün Batımı Bulutları|dramatic sunset cloudscape
Mammatus Bulutları|mammatus clouds lit orange
Gökkuşağı Ovası|double rainbow over plains after rain
Kum Fırtınası Göğü|sky darkened by a sandstorm
Kuzey Işıkları Göğü|aurora filling the sky
Samanyolu|Milky Way arching over the horizon
Ay Tutulması|blood moon lunar eclipse
Güneş Tutulması|total solar eclipse corona
Sis Denizi|sea of fog seen from above
Deniz Üstü Fırtına|storm cell over the sea
Hortum|tornado over open land
Meteor Yağmuru|meteor shower streaks
Gece Bulutları|noctilucent clouds glowing blue
Volkanik Şimşek|volcanic lightning in ash cloud
Altın Saat Göğü|golden hour sky
Mavi Saat Göğü|blue hour sky
Dolu Fırtınası|hail storm curtain
Uçak Penceresi Bulut|view of clouds from airplane window
` },
    { id: 'arena', tr: 'Arenalar, Stadyumlar & Gösteri', arch: 'arena', ctx: 'mixed', engines: ['hall', 'anamorphic', 'city', 'battlefield'], cond: ['empty', 'pristine', 'ruined', 'lit'], items: `
Roma Kolezyumu|Roman colosseum with sand floor and tiered arches
Gladyatör Arenası|gladiator arena with gates and spikes
Gece Stadyumu|stadium at night under floodlights
Boks Ringi|boxing ring under hard top light
Dövüş Kafesi|octagon fight cage in dark arena
Sokak Basketbol Sahası|street basketball court with chain nets
Yağmurlu Futbol Sahası|football pitch in heavy rain
Yarış Pisti|motor race track with pit lane
Hipodrom|horse racing hippodrome
Buz Pateni Arenası|empty ice rink arena
Konser Sahnesi|concert stage with lighting rigs
Sirk Ringi|circus ring under big top
Boğa Güreşi Arenası|bullring with sand floor
Olimpiyat Stadyumu|Olympic stadium with flame
Turnuva Tapınağı|martial arts tournament temple courtyard
Yeraltı Dövüş Kulübü|underground fight club in a basement
Bilimkurgu Arena|futuristic arena with energy barriers
E-spor Sahnesi|esports stage with giant screens
Rodeo Arenası|rodeo arena with chutes
Antik Tiyatro|ancient theatre with stone tiers
` },
    { id: 'nightlife', tr: 'Gece Hayatı, Eğlence & Festival', arch: 'urban', ctx: 'mixed', engines: ['city', 'anamorphic', 'synthwave'], cond: ['lit', 'empty', 'after-party', 'pristine'], items: `
Gece Kulübü|nightclub with lasers and haze
Lunapark Gecesi|amusement park at night with lit rides
Festival Sahnesi|outdoor festival main stage
Karnaval Sokağı|carnival street with masks and lights
Bowling Salonu|retro bowling alley
Atari Salonu|neon arcade with cabinets
Karaoke Odası|karaoke room with screens
Çatı Barı|rooftop bar at night
Açık Hava Sineması|drive-in cinema with screen
Fener Festivali|lantern festival with floating lanterns
Havai Fişek Gecesi|fireworks over harbour
Neon Motel|neon motel sign at night
Paten Diskosu|roller disco rink
Neon Kumarhane|neon-lit casino strip
Gece Pazarı|night market with food stalls
Plaj Partisi|beach party with bonfire
Caz Barı|intimate jazz bar
Sirk Çadırı|circus big top interior
Retro Diner Neon|retro diner with neon
Depo Rave|warehouse rave with strobes
` },
    { id: 'lab', tr: 'Laboratuvar, Teknoloji & Bilim', arch: 'scifi', ctx: 'int', engines: ['hall', 'anamorphic', 'nebula'], cond: ['operational', 'abandoned', 'alert', 'pristine'], items: `
Genetik Laboratuvarı|genetics lab with sequencers and glowing samples
Sunucu Odası|server room with rows of blinking racks
Parçacık Hızlandırıcı|particle accelerator tunnel with magnets
Robotik Atölyesi|robotics workshop with half-built robots
Kuantum Bilgisayar Odası|quantum computer chandelier in a cold room
Temiz Oda|cleanroom with yellow light
Gizli Bilim Üssü|secret research base
Eski Kimya Laboratuvarı|old chemistry lab with glassware
Görev Kontrol Merkezi|mission control with screens
Teleskop Kubbesi|observatory dome with telescope
Yapay Zeka Çekirdeği|AI core chamber with light columns
Biyokubbe|biodome with plants
Kriyojenik Depo|cryogenic storage tanks
Hologram Odası|hologram projection room
Mars Simülasyon Habitatı|Mars simulation habitat
Tesla Bobini Laboratuvarı|lab with Tesla coils sparking
Arşiv Odası|archive room with endless shelves
Drone Hangarı|drone hangar with racks of drones
Siber Güvenlik Merkezi|cyber security operations center
Nöro Laboratuvar|neuroscience lab with brain scans
` },
    { id: 'dystopia', tr: 'Distopik & Totaliter Dünyalar', arch: 'dystopia', ctx: 'mixed', engines: ['skyline', 'hall', 'storm', 'battlefield'], cond: ['oppressive', 'decaying', 'pristine', 'rainy'], items: `
Totaliter Meydan|vast totalitarian plaza with monumental statue
Gözetim Şehri|city of cameras and screens watching streets
Brütalist Konut Blokları|endless brutalist housing blocks
Propaganda Bulvarı|boulevard of giant propaganda banners
Çalışma Kampı|labour camp with fences and towers
Bakanlık Lobisi|cavernous ministry lobby
Duvarlı Kent|city enclosed by a colossal wall
Fabrika Kenti|smog-choked factory city
Distopik Kontrol Noktası|checkpoint with scanners and barriers
Kayıt Ofisi|bureaucratic registry hall
Bitmeyen Koridor|endless identical corridor
Distopik Metro|grim metro with screens
Gri Banliyö|identical grey suburb
Kurumsal Kampüs|sterile corporate campus
Karantina Bölgesi|sealed quarantine zone
Tayın Dağıtım Noktası|ration distribution station
Asma Yürüyüş Yolları|elevated walkways over slums
Gelecek Hücre Bloğu|futuristic prison block
Yasak Bölge Sınırı|border of a forbidden zone
Direniş Sığınağı|underground resistance hideout
` },
    { id: 'myth', tr: 'Mitolojik Diyarlar & Efsaneler', arch: 'fantasy', ctx: 'ext', engines: ['nebula', 'castle', 'mountains', 'godrays'], cond: ['divine', 'ancient', 'ruined', 'stormy'], items: `
Olimpos Dağı|Mount Olympus summit with marble halls above clouds
Valhalla|Valhalla hall of shields and spears
Hades Yeraltı Nehri|underworld river with ferryman boat
Asgard Gökkuşağı Köprüsü|rainbow bridge to a golden city
Atlantis|sinking Atlantis with gleaming temples
Babil Kulesi|tower of Babel spiralling to the sky
Avalon Adası|misty isle of Avalon
Doğu Ejderha Dağı|eastern dragon mountain with temples
Kaf Dağı|mythic emerald mountain at the edge of the world
Anka Kuşu Yuvası|phoenix nest on a burning peak
Duat Yeraltı|Egyptian underworld hall of judgment
Yggdrasil Kökleri|roots of the world tree in a cavern
Shambhala Vadisi|hidden Himalayan valley
El Dorado|golden city in jungle
Minotor Labirenti|stone labyrinth with a bull altar
Titanlar Savaş Alanı|battlefield of titans with giant fallen bodies
Medusa Mağarası|cave of stone statues
Göklerin Kapısı|heaven's gate of light
Ragnarok Ovası|plain at the end of the world
Tengri Bozkırı|sky god steppe with giant sky
Kılıçlı Göl|lake with a sword rising
Su Perisi Gölü|nymph lake in forest
` },
    { id: 'disaster', tr: 'Felaket, Kaiju & Kıyamet Anları', arch: 'ruins', ctx: 'ext', engines: ['battlefield', 'storm', 'skyline', 'ocean'], cond: ['catastrophic', 'aftermath', 'burning', 'flooded'], items: `
Tsunami Şehri|tsunami wave towering over a coastal city
Kaiju Sonrası Şehir|city after a giant monster attack
Deprem Sonrası|earthquake aftermath with collapsed buildings
Meteor Çarpması|meteor streaking toward a city
Orman Yangını Kasabası|town engulfed by wildfire
Sel Basmış Kasaba|flooded town with rooftops
Kasırga Sonrası Kıyı|coast after a hurricane
Volkan Şehir Üstü|volcano erupting over a city
Nükleer Patlama Ufku|nuclear flash on the horizon
Çöken Köprü|bridge collapsing into river
Buz Çağı Şehir|city frozen in ice age
Kum Fırtınası Şehir|sandstorm swallowing a city
Kaiju Ayak İzi|giant footprint crushing streets
Karaya Oturmuş Gemi|ship washed into town
Yanan Gökdelen|burning skyscraper at night
Toz Bulutu Sokak|dust cloud filling a street
Tornado Sonrası Kasaba|town after tornado
Düşen Ay|moon falling close to earth
Salgın Şehri|empty pandemic city
Gökyüzü Anomalisi|sky anomaly over city
` },
    { id: 'africa', tr: 'Afrika, Savan & Kadim Kıtalar', arch: 'nature', ctx: 'ext', engines: ['dunes', 'mountains', 'storm'], cond: ['pristine', 'dusty', 'stormy', 'harvest'], items: `
Serengeti Ovası|endless golden savanna with scattered acacias and a distant kopje
Kilimanjaro Eteği|snow-capped mountain rising above a savanna plain at dawn
Baobab Caddesi|avenue of giant baobab trees on red earth at sunset
Sahra Kum Denizi|Saharan erg of orange dunes under a white sun
Okavango Deltası|lush delta channels with papyrus and lily pads
Victoria Şelalesi|thundering wide waterfall with rising spray and rainbow
Rift Vadisi Kenarı|escarpment overlooking the Great Rift Valley
Timbuktu Çamur Camisi|mud-brick mosque with wooden spikes in a desert town
Namib Ölü Vadisi|white clay pan with dead camel thorn trees against red dunes
Zanzibar Taş Kasaba|coastal stone town with carved doors and dhows
Etiyopya Kaya Kilisesi|church carved down into solid rock
Kongo Yağmur Ormanı|dense equatorial rainforest river
Masai Köyü|circular village of mud houses inside a thorn fence
Kalahari Tuzlası|salt pan under a vast night sky
Atlas Dağları Köyü|Berber village of earthen houses on a mountain slope
Madagaskar Taş Ormanı|forest of razor-sharp limestone pinnacles
Büyük Zimbabve Harabeleri|ancient dry-stone walls and conical tower
Nil Kıyısı Feluka|Nile riverbank with felucca sails at dusk
Kırmızı Toprak Yolu|red dirt road through green hills
Savan Su Birikintisi|savanna waterhole at golden hour
Kaktüs Benzeri Euphorbia Ovası|plain of candelabra euphorbia trees
Sahil Kuleleri Swahili|Swahili coast ruins with coral stone arches
` },
    { id: 'villages', tr: 'Köyler, Kasabalar & Yerleşimler', arch: 'ancient', ctx: 'ext', engines: ['mountains', 'castle', 'forest', 'skyline'], cond: ['lived-in', 'pristine', 'weathered', 'abandoned'], items: `
Alp Köyü|alpine village with wooden chalets and a church spire
Akdeniz Balıkçı Köyü|white Mediterranean fishing village stepping down to a harbour
İskandinav Fiyort Köyü|red wooden houses along a fjord shore
Kar Altında Dağ Kasabası|mountain town buried in snow with chimney smoke
İngiliz Kır Kasabası|stone village with thatched cottages and a green
Toskana Tepe Kasabası|hilltop town of terracotta roofs and towers
Japon Dağ Köyü|thatched gassho houses in a snowy valley
Peru And Köyü|Andean village with adobe houses and terraces
Karadeniz Yayla Evleri|wooden highland houses in mist above tea slopes
Ortaçağ Sur İçi Kasaba|walled medieval town with gabled houses
Kuzey Amerika Liman Kasabası|New England harbour town with lighthouse
Rus Ahşap Köyü|wooden village with carved window frames
Hollanda Kanal Kasabası|canal town with narrow gabled houses
Çöl Vaha Köyü|oasis village of mud houses and palms
Göl Kıyısı Köy|lakeside village with boathouses
Dağ Manastırı Köyü|village around a mountain monastery
Kömür Madeni Kasabası|coal mining town with terraced houses
Balkan Taş Köyü|stone village with slate roofs on a gorge
Kanadalı Orman Kasabası|logging town surrounded by forest
Yunan Ada Köyü|whitewashed island village with blue domes
Terk Edilmiş Dağ Köyü|abandoned mountain village with roofless houses
İrlanda Kıyı Köyü|Irish coastal village with colourful houses
` },
    { id: 'roads', tr: 'Yollar, Yolculuk & Geçitler', arch: 'nature', ctx: 'ext', engines: ['mountains', 'dunes', 'forest', 'storm'], cond: ['empty', 'wet', 'dusty', 'pristine'], items: `
Sonsuz Çöl Yolu|straight two-lane road disappearing into desert haze
Dağ Serpantin Yolu|serpentine road climbing a mountain pass
Kıyı Otoyolu|cliffside coastal highway above the sea
Orman Tüneli Yolu|road through a tunnel of arching trees
Karlı Dağ Geçidi|snowy mountain pass with snow walls
Toprak Kır Yolu|dirt farm road between fields
Köprülü Vadi Yolu|road crossing a high valley bridge
Yağmurlu Gece Yolu|wet night road with reflections
Bozkır Yolu|empty steppe road under storm clouds
Taş Ortaçağ Yolu|ancient stone road lined with cypresses
Sisli Orman Yolu|forest road vanishing into fog
Yıkık Otoyol Köprüsü|broken highway bridge ending in air
Tren Rayı Yanı Yol|road running beside railway tracks
Kanyon Yolu|road winding through red canyon walls
Kuzey Buz Yolu|ice road across a frozen lake
Göl Kenarı Yol|lakeside road at dawn
Sonbahar Kır Yolu|country lane covered with autumn leaves
Gece Çöl Otoyolu|desert highway at night under stars
Volkanik Yol|road through black lava fields
Bambu Patikası|path through bamboo forest
Dağ Tüneli Ağzı|mountain tunnel portal
Uçurum Patikası|cliff path cut into a rock face
` },
  ];

  /* Arketip bazlı yer işareti havuzları (ONE SHOT dört-nokta kuralı) */
  const ARCH = {
    battle: {
      center: ['a shell crater filled with rainwater', 'a fallen war standard driven into the earth', 'a toppled siege engine', 'a ring of scorched earth around a burnt cart', 'a collapsed stone cross'],
      left: ['a splintered dead tree', 'a broken watchtower', 'a half-collapsed stone wall', 'a leaning telegraph pole', 'a burnt windmill'],
      right: ['a burnt-out farmhouse', 'a line of abandoned tents', 'a wrecked war machine', 'a row of shattered barricades', 'a ruined chapel'],
      far: ['a smoking ridge line', 'a distant burning town', 'a fortress silhouette on a hill', 'a tree line swallowed by smoke', 'a broken bridge over a river'],
      floor: ['churned dark mud with puddles', 'trampled wet earth', 'blackened scorched soil', 'dark frozen ground'],
      materials: ['splintered timber', 'rusted iron', 'torn canvas', 'blackened stone', 'trampled mud'],
    },
    scifi: {
      center: ['a scorched landing pad marking', 'a fallen colossal machine', 'a circular blast crater of glassed ground', 'a holographic beacon on a pylon', 'a cracked energy conduit'],
      left: ['a toppled antenna mast', 'a monolithic reactor tower', 'a leaning turret emplacement', 'a vertical stack of cargo modules', 'a cable-wrapped pylon'],
      right: ['a hangar with its blast door torn open', 'a cluster of pressure domes', 'a ribbed alien structure', 'a crashed dropship', 'a brutalist command bunker'],
      far: ['a megastructure on the horizon', 'a city of spires in haze', 'a space elevator rising into clouds', 'a planet hanging in the sky', 'a glowing gate'],
      floor: ['dark matte composite plating', 'grey regolith dust', 'wet black asphalt', 'scorched dark metal grating'],
      materials: ['brushed titanium', 'matte composite panels', 'scorched ceramic plating', 'carbon fibre', 'glowing cabling'],
    },
    fortress: {
      center: ['a well with a stone rim', 'a cobbled courtyard seal', 'a fallen portcullis', 'a stone statue plinth', 'a timber gallows'],
      left: ['a round corner tower', 'a crenellated bastion', 'a tall keep', 'a stone watchtower', 'a bell tower'],
      right: ['a gatehouse with arrow slits', 'a great hall with timber roof', 'stables and smithy', 'a chapel with a rose window', 'a barbican'],
      far: ['the main gate', 'the donjon on a crag', 'a mountain range behind the walls', 'the sea beyond the battlements', 'a road winding to the valley'],
      floor: ['worn dark flagstones', 'wet cobblestones', 'packed dark earth', 'moss-covered stone slabs'],
      materials: ['ashlar limestone', 'weathered granite', 'oak timber', 'wrought iron', 'slate roofs'],
    },
    ruins: {
      center: ['a rusted car on cracked asphalt', 'a collapsed fountain', 'a fallen street sign', 'a crater in the road', 'a toppled statue'],
      left: ['a gutted apartment block', 'a leaning lamp post', 'a toppled radio mast', 'a vine-covered billboard', 'a broken water tower'],
      right: ['a burnt-out bus', 'a collapsed overpass', 'a shopfront with shattered glass', 'a stack of rusted containers', 'a half-buried building'],
      far: ['a ruined skyline in haze', 'a broken bridge', 'a cooling tower silhouette', 'dunes swallowing towers', 'a smoke column'],
      floor: ['cracked dark asphalt with weeds', 'dust-covered concrete', 'ash-grey rubble', 'muddy water over pavement'],
      materials: ['cracked concrete', 'rusted steel', 'shattered glass', 'peeling paint', 'overgrown ivy'],
    },
    urban: {
      center: ['a manhole cover breathing steam', 'a painted crosswalk', 'a puddle reflecting signs', 'a fire hydrant', 'a newspaper stand'],
      left: ['a row of fire escapes', 'a lamp post', 'a brick tenement', 'a glass office tower', 'a neon sign stack'],
      right: ['a shuttered storefront', 'a parked vintage car', 'a diner window', 'a bus shelter', 'a subway entrance'],
      far: ['the street vanishing into fog', 'a lit skyline', 'a bridge', 'a train passing on an overpass', 'a church spire'],
      floor: ['wet dark asphalt', 'worn cobblestones', 'dark grey pavement', 'rain-slick concrete'],
      materials: ['red brick', 'wet asphalt', 'chrome', 'cast iron', 'glass'],
    },
    ancient: {
      center: ['a carved stone altar', 'a sundial', 'a mosaic floor', 'a toppled column drum', 'a sacred fire bowl'],
      left: ['a colossal statue', 'a row of columns', 'an obelisk', 'a stepped pyramid', 'a carved stele'],
      right: ['a temple facade', 'a colonnaded portico', 'a ziggurat', 'a palace wall with reliefs', 'an amphitheatre'],
      far: ['a mountain shrine', 'the sea and harbour', 'a desert horizon', 'a jungle canopy', 'a monumental gate'],
      floor: ['worn dark flagstones', 'packed earth', 'sun-baked stone', 'cracked marble'],
      materials: ['weathered marble', 'sandstone', 'mud brick', 'bronze', 'limestone'],
    },
    industrial: {
      center: ['a rusted floor hatch', 'a pool of oily water', 'a rail turntable', 'a fallen chain hook', 'a painted hazard marking'],
      left: ['a brick chimney stack', 'a steel gantry crane', 'a riveted boiler', 'a tall silo', 'a cooling tower'],
      right: ['a conveyor bridge', 'a row of furnaces', 'stacked crates and drums', 'a control booth', 'a loading dock'],
      far: ['a giant hangar door', 'a cooling tower in steam', 'a tunnel mouth', 'a refinery skyline', 'a sea of pipes'],
      floor: ['oil-stained dark concrete', 'black steel grating', 'soot-blackened brick', 'wet dark asphalt'],
      materials: ['riveted steel', 'rusted iron', 'soot-stained brick', 'oily concrete', 'corrugated metal'],
    },
    nature: {
      center: ['a lone boulder', 'a fallen tree trunk', 'a still pool', 'a cairn of stacked stones', 'a game trail'],
      left: ['a twisted lone tree', 'a rock spire', 'a cliff face', 'a waterfall', 'a stand of pines'],
      right: ['a ridge of boulders', 'a shepherd hut', 'a grove of trees', 'a rock arch', 'a glacier tongue'],
      far: ['a mountain range', 'a distant peak', 'the horizon line', 'a valley mouth', 'a far-off storm'],
      floor: ['dark wet earth', 'grey scree and moss', 'packed dark sand', 'dark frozen ground'],
      materials: ['granite', 'lichen', 'moss', 'sand', 'ice'],
    },
    water: {
      center: ['a moored wooden boat', 'a jetty', 'a sandbar', 'a rock outcrop', 'a buoy'],
      left: ['a lighthouse', 'a sea stack', 'a cliff', 'a pier with posts', 'a reed bed'],
      right: ['a fishing hut', 'a shipwreck', 'a harbour wall', 'a breakwater', 'a grove of palms'],
      far: ['the open sea horizon', 'an island', 'a storm front', 'a far coastline', 'a setting sun'],
      floor: ['dark wet sand', 'wet black pebbles', 'dark tidal rock', 'slick wooden planks'],
      materials: ['weathered timber', 'wet stone', 'rope', 'kelp', 'barnacled rock'],
    },
    underground: {
      center: ['a still underground pool', 'a fallen stalactite', 'a mine cart on rails', 'a stone altar', 'a crystal cluster'],
      left: ['a massive stalagmite', 'a carved pillar', 'a timber support frame', 'a crystal column', 'a rock wall'],
      right: ['a dwelling carved into rock', 'a collapsed tunnel', 'a stairway', 'a waterfall', 'a cave shrine'],
      far: ['a tunnel mouth', 'a shaft of daylight from above', 'a cavern exit', 'a deep chasm', 'a glowing passage'],
      floor: ['wet dark rock', 'dark mud', 'smooth dark stone', 'gravel'],
      materials: ['limestone', 'calcite', 'basalt', 'timber', 'crystal'],
    },
    space: {
      center: ['a cratered surface', 'a moon', 'a ringed planet', 'a debris cloud', 'a comet'],
      left: ['a gas giant', 'a nebula pillar', 'an asteroid', 'a space station', 'a dwarf star'],
      right: ['a second moon', 'a galaxy', 'a planet limb', 'a star cluster', 'an ice moon'],
      far: ['the galactic core', 'a distant sun', 'deep black space', 'a nebula wall', 'a pulsar'],
      floor: ['grey regolith', 'black basalt plains', 'ice crust', 'red dust'],
      materials: ['regolith', 'ice', 'basalt', 'dust', 'gas'],
    },
    fantasy: {
      center: ['a rune-carved stone circle', 'a glowing pool', 'a fallen statue of a king', 'an ancient well', 'a sword in a stone'],
      left: ['a colossal guardian statue', 'a wizard tower', 'a giant tree', 'a crystal spire', 'a waterfall'],
      right: ['a ruined temple', 'a castle', 'a bridge of floating rock', 'a dragon skull', 'a village'],
      far: ['a castle on a peak', 'floating islands', 'a mountain gate', 'a world tree', 'a portal'],
      floor: ['dark mossy stone', 'packed dark earth', 'dark wet grass', 'ancient flagstones'],
      materials: ['moss-covered stone', 'ancient oak', 'crystal', 'bronze', 'marble'],
    },
    gothic: {
      center: ['a cracked tomb slab', 'an iron gate', 'a dry fountain', 'a gallows', 'a candle shrine'],
      left: ['a gothic spire', 'a dead tree', 'a gargoyle statue', 'a bell tower', 'a crypt'],
      right: ['a ruined chapel', 'a manor', 'a mausoleum', 'a cathedral facade', 'a castle wall'],
      far: ['a castle on a crag', 'a blood moon', 'a storm', 'fog over hills', 'a dark tower'],
      floor: ['wet dark flagstones', 'dark earth with dead leaves', 'black mud', 'cracked stone'],
      materials: ['black stone', 'wrought iron', 'rotting timber', 'stained glass', 'moss'],
    },
    horror: {
      center: ['an overturned wheelchair', 'a stained mattress', 'a fallen chandelier', 'a single chair', 'a trapdoor'],
      left: ['a peeling wall', 'a door ajar', 'a broken mirror', 'a staircase', 'a dead tree'],
      right: ['a row of rusted beds', 'a boarded window', 'a cabinet', 'a fireplace', 'a car wreck'],
      far: ['a dark corridor', 'a doorway with light', 'fog', 'a staircase into darkness', 'a window'],
      floor: ['stained dark linoleum', 'rotting floorboards', 'wet concrete', 'dark mud'],
      materials: ['peeling paint', 'rusted iron', 'rotting wood', 'mold', 'cracked tiles'],
    },
    sacred: {
      center: ['a carved altar', 'a reflecting pool', 'a prayer rug', 'an incense burner', 'a sacred fire'],
      left: ['a colonnade', 'a carved pillar', 'a minaret', 'a bell tower', 'a statue'],
      right: ['a cloister arcade', 'a shrine', 'a pulpit', 'a lantern row', 'a temple hall'],
      far: ['an apse with a window', 'a mountain', 'a gate', 'a stair', 'a dome'],
      floor: ['polished dark stone', 'worn marble', 'dark wood boards', 'dark tiles'],
      materials: ['marble', 'gold leaf', 'cedar', 'stone', 'tile'],
    },
    palace: {
      center: ['a polished floor medallion', 'a long banquet table', 'a fountain', 'a throne dais', 'a carpet runner'],
      left: ['a marble colonnade', 'a tall mirror', 'a statue', 'a fireplace', 'a staircase'],
      right: ['a row of tall windows', 'tapestries', 'a gallery', 'a balcony', 'a library wall'],
      far: ['the throne', 'a grand door', 'a garden view', 'a staircase', 'a stage'],
      floor: ['dark polished marble', 'dark parquet', 'dark carpet', 'black and white tiles'],
      materials: ['marble', 'gilded wood', 'velvet', 'crystal', 'brass'],
    },
    interior: {
      center: ['a worn rug', 'a table', 'a chair', 'a lamp pool of light', 'a desk'],
      left: ['a tall window', 'a bookshelf', 'a door', 'a cabinet', 'a column'],
      right: ['a fireplace', 'a counter', 'a sofa', 'a bed', 'a row of lockers'],
      far: ['a window with view', 'a corridor', 'a staircase', 'a door', 'a wall'],
      floor: ['dark wood floor', 'dark tiles', 'dark concrete', 'dark carpet'],
      materials: ['wood', 'plaster', 'tile', 'fabric', 'glass'],
    },
    western: {
      center: ['a water trough', 'a hitching post', 'a wagon wheel', 'tumbleweed', 'a well'],
      left: ['a saloon', 'a water tower', 'a windmill', 'a church', 'a gallows'],
      right: ['a sheriff office', 'a general store', 'a livery stable', 'a bank', 'a hotel'],
      far: ['desert mesas', 'a railroad', 'mountains', 'the trail', 'a canyon'],
      floor: ['packed dark dirt', 'dusty earth', 'cracked mud', 'boardwalk'],
      materials: ['weathered timber', 'adobe', 'rusted iron', 'canvas', 'dust'],
    },
    eastasia: {
      center: ['a stone lantern', 'a koi pond', 'a raked gravel garden', 'a bronze bell', 'a stone path'],
      left: ['a pagoda', 'a torii gate', 'bamboo grove', 'a pine', 'a watchtower'],
      right: ['a teahouse', 'a temple hall', 'a wooden house', 'a bridge', 'a gate'],
      far: ['a mountain', 'a castle', 'a city', 'mist', 'a sea'],
      floor: ['dark stone slabs', 'raked dark gravel', 'dark wood boards', 'moss'],
      materials: ['cypress wood', 'paper screens', 'tiles', 'bronze', 'lacquer'],
    },
    anatolia: {
      center: ['a marble fountain', 'a carpet stall', 'a copper brazier', 'a courtyard pool', 'a tea table'],
      left: ['a minaret', 'a stone arch', 'a fairy chimney', 'a tiled portal', 'a dome'],
      right: ['a caravanserai arcade', 'a bazaar stall row', 'a hammam dome', 'a stone mansion', 'a fortress wall'],
      far: ['a mountain', 'the Bosphorus', 'a desert horizon', 'a citadel', 'a valley'],
      floor: ['dark worn stone', 'dark cobblestones', 'packed earth', 'dark tiles'],
      materials: ['cut stone', 'Iznik tile', 'copper', 'cedar', 'kilim textiles'],
    },
    sky: {
      center: ['a cloud tower', 'a storm cell', 'a sun disc', 'a moon', 'a lightning bolt'],
      left: ['an anvil cloud', 'a rainbow', 'a cloud wall', 'a funnel', 'a jet trail'],
      right: ['a cloud bank', 'a distant storm', 'a sunbeam', 'a cloud break', 'a halo'],
      far: ['the horizon', 'a sea of clouds', 'mountains', 'the sea', 'a plain'],
      floor: ['dark plains', 'dark sea', 'cloud tops', 'dark hills'],
      materials: ['vapor', 'ice crystals', 'rain', 'mist', 'light'],
    },
    arena: {
      center: ['a sand-covered arena floor seal', 'a fighting ring', 'a center mark', 'a pit', 'a stage'],
      left: ['a tiered stand', 'a statue', 'a column', 'a scoreboard', 'a gate'],
      right: ['an emperor box', 'a tunnel entrance', 'a cage wall', 'a stand', 'a lighting rig'],
      far: ['a gate', 'a stage', 'a tunnel', 'a throne', 'a scoreboard'],
      floor: ['dark packed sand', 'dark canvas', 'dark wet turf', 'dark stone'],
      materials: ['stone', 'steel', 'sand', 'canvas', 'concrete'],
    },
    dystopia: {
      center: ['a monumental statue base', 'a checkpoint barrier', 'a surveillance pole', 'a drain grate', 'a podium'],
      left: ['a brutalist tower', 'a giant screen', 'a watchtower', 'a banner pole', 'a wall'],
      right: ['a ministry facade', 'a housing block', 'a factory', 'a fence', 'a walkway'],
      far: ['a giant monument', 'a wall', 'a tower', 'smog', 'a gate'],
      floor: ['wet dark concrete', 'grey pavement', 'black asphalt', 'dark tiles'],
      materials: ['raw concrete', 'steel', 'glass', 'banners', 'barbed wire'],
    },
  };

  /* Tür etiketleri (katalog filtresi) */
  CB.GENRES = [
    { id: 'war', tr: 'Savaş' }, { id: 'scifi', tr: 'Bilimkurgu' }, { id: 'fantasy', tr: 'Fantastik' }, { id: 'horror', tr: 'Korku & Gerilim' },
    { id: 'history', tr: 'Tarihi & Dönem' }, { id: 'nature', tr: 'Doğa' }, { id: 'urban', tr: 'Şehir' }, { id: 'interior', tr: 'İç mekan' },
    { id: 'space', tr: 'Uzay' }, { id: 'abstract', tr: 'Soyut & Grafik' },
  ];
  const GENRE_OF = {
    'battle-ancient': ['war', 'history'], 'battle-modern': ['war', 'history'], 'battle-future': ['war', 'scifi'], siege: ['war', 'history', 'fantasy'],
    postapoc: ['scifi', 'horror'], urban: ['urban'], cyber: ['scifi', 'urban'], historic: ['history'], industrial: ['urban', 'interior'],
    military: ['war', 'interior'], mountains: ['nature'], desert: ['nature'], forest: ['nature'], jungle: ['nature'], polar: ['nature'],
    coast: ['nature'], rivers: ['nature'], plains: ['nature'], volcanic: ['nature'], caves: ['nature', 'fantasy'], underwater: ['nature'],
    space: ['space', 'scifi'], starship: ['scifi', 'interior', 'space'], fantasy: ['fantasy'], darkfantasy: ['fantasy', 'horror'],
    horror: ['horror', 'interior'], sacred: ['history', 'interior'], palace: ['history', 'interior'], residential: ['interior'],
    public: ['interior', 'urban'], transport: ['urban', 'interior'], western: ['history'], noir: ['history', 'urban'], eastasia: ['history', 'urban'],
    anatolia: ['history'], sky: ['nature', 'abstract'], arena: ['war', 'urban'], nightlife: ['urban', 'interior'], lab: ['scifi', 'interior'],
    dystopia: ['scifi', 'urban'], myth: ['fantasy', 'history'], disaster: ['war', 'scifi'], africa: ['nature', 'history'], villages: ['history', 'nature'],
    roads: ['nature', 'urban'],
  };

  /* Ayrıştırıcı: kategori kimliği = grup kimliği + sıra numarası (sahne kodları sabit kalır) */
  CB.GROUPS = [];
  CB.CATS = [];
  CB.ARCH = ARCH;
  function parseInto(g, text) {
    text.trim().split('\n').forEach((line) => {
      const [tr, en] = line.split('|');
      if (!tr || !en) return;
      const c = { id: g.id + ':' + g.cats.length, tr: tr.trim(), en: en.trim(), group: g };
      g.cats.push(c);
      CB.CATS.push(c);
    });
  }
  CB.addGroup = function (g) {
    g.index = CB.GROUPS.length;
    g.cats = [];
    g.genres = g.genres || GENRE_OF[g.id] || [];
    CB.GROUPS.push(g);
    parseInto(g, g.items || '');
    delete g.items;
  };
  CB.extendGroup = function (id, text) {
    const g = CB.GROUPS.find((x) => x.id === id);
    if (!g) throw new Error('Grup yok: ' + id);
    parseInto(g, text);
  };
  CB.extendArch = function (id, pools) { ARCH[id] = pools; };
  GROUPS.forEach(CB.addGroup);
})();
