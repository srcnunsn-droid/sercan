/* CineBG Studio v6 — gündelik hayat, manzara ve sokak kategorileri.
   Dört aile, eşleşme kurallarıyla üretilir (her tür her yerde olmaz):
   sokak tipi × şehir/kasaba/köy, manzara tipi × bölge (biyom uyumu), ev odası × ev tarzı, gündelik mekân × bölge.
   Her grup en fazla 99 kategori tutar ki sahne kodları sabit kalsın. */
(function () {
  const CB = window.CB;
  CB.GENRES.push({ id: 'street', tr: 'Sokak' }, { id: 'landscape', tr: 'Manzara' }, { id: 'daily', tr: 'Gündelik hayat' });

  /* satır biçimi: tr | en | etiketler (virgülle) */
  const L = (s) => s.trim().split('\n').map((l) => { const [tr, en, tags, extra] = l.split('|').map((x) => (x || '').trim()); return { tr, en, tags: tags ? tags.split(',') : [], extra }; });
  const has = (a, b) => a.tags.some((t) => b.tags.includes(t));

  /* ---------------- SOKAK ---------------- */
  // etiket: m = büyük şehir, t = kasaba, v = köy
  const STREETS = L(`
Arka sokak|narrow back alley with drainpipes, stacked crates and a strip of sky between the walls|m,t
Çarşı sokağı|market street lined with closed stalls, folded awnings and hanging canopies|m,t,v
Mahalle sokağı|quiet residential street with parked cars, doorways and potted plants on the steps|m,t
Ana cadde|main shopping street with shopfronts, glowing windows and wide pavements|m,t
Merdivenli yokuş|steep stepped street climbing between houses|m,t,v
Tramvay caddesi|street with tram tracks and overhead wires curving into the distance|m
Ağaçlı bulvar|tree-lined boulevard with a central promenade and benches|m
Arnavut kaldırımı|narrow cobbled lane worn smooth by centuries|m,t,v
Sokak yemekleri sırası|street-food row with shuttered carts, grills and plastic stools stacked|m,t
Alt geçit|pedestrian underpass with tiled walls and fluorescent strip lights|m
Yaya köprüsü|footbridge over a busy road, railings and the road receding below|m
Kavşak|wide crossroads with zebra crossings and traffic lights in every direction|m,t
Otobüs durağı|street corner with a bus shelter, timetable board and kerbside bench|m,t
Çıkmaz sokak|dead-end street ending in a blank wall with a single lamp|m,t
Çamaşır ipli sokak|narrow street with laundry lines strung between balconies|m,t,v
Köşe bakkal önü|street corner outside a small grocery, crates of fruit under an awning|m,t,v
Gece kulübü sokağı|nightlife street with doorways, neon tubes and wet tarmac|m
Kapalı çarşı girişi|entrance to a covered arcade, a long glazed roof receding inside|m,t
Rıhtım caddesi|waterfront street with bollards, moored boats and a sea wall|m,t
Demiryolu geçidi|street crossing railway tracks with barriers and warning lights|m,t,v
Viyadük altı|street running beneath a concrete viaduct, pillars marching away|m
Otopark sokağı|side street of parking garages and loading bays|m
Sanayi sokağı|industrial street of workshops, roller shutters and oil-stained concrete|m,t
Okul önü sokağı|street outside a school gate with railings and a crossing patrol sign without text|m,t,v
Meydan kenarı|edge of a town square with a fountain, plane trees and café chairs stacked|m,t,v
Yokuş virajı|hairpin bend on a steep hillside street with a view down over rooftops|m,t,v
Dar pasaj|narrow passage cutting through a building, light at the far end|m,t
Kemerli geçit|arched passage beneath old houses, a lantern hanging from the vault|m,t,v
Sahil yolu|seafront road with palm trees, railings and the sea beyond|m,t
Banliyö sokağı|suburban street with lawns, driveways and identical houses|m,t
Toplu konut arası|path between tall housing blocks, playground equipment and parked cars|m
Çatı katı sokağı|rooftop level view across a street of roofs, chimneys and water tanks|m,t
Yağmur oluklu sokak|street with deep gutters and rain spouts pouring from roofs|m,t,v
Gece pazarı kurulumu|empty night-market street with bare bulb strings and folding tables|m,t
Benzinlik köşesi|corner petrol station under a flat canopy beside the street|m,t,v
Kanal kenarı sokak|street running along a canal with small bridges and moored barges|m,t
Kilise/cami avlusu önü|street outside a place of worship, a courtyard gate and old trees|m,t,v
Kar yağmış sokak|street under fresh snow, cars buried and footpaths untouched|m,t,v
Yaz öğlesi sokak|sun-bleached street at noon with deep shade under balconies|m,t,v
Sisli sabah sokağı|street dissolving into early-morning fog, lamps still on|m,t,v
Duvar resimli sokak|street with large painted murals on blank side walls|m,t
İskele yolu|road leading down to a small ferry pier|t,v
Köy meydanı yolu|single village road past a well, a teahouse and a large tree|v
Toprak köy yolu|dirt village lane between stone walls and gardens|v
Bağ evi yolu|lane between vineyard walls leading to farmhouses|v
Ana yol kenarı kasaba|small town main road with a pharmacy, bakery and hardware shop|t
Kasaba istasyon önü|street outside a small railway station with a clock|t,v
Gökdelen tabanı|street at the base of skyscrapers, glass towers rising out of frame|m
Kavşak üst geçidi|multi-level interchange of ramps above a city street|m
Tarihi kapı önü|street running through an old city gate|m,t
Hastane önü|street outside a hospital entrance with an ambulance bay|m,t
Stadyum yolu|wide road leading to a stadium, barriers and floodlight towers|m
Liman konteyner yolu|road between stacked shipping containers at a port|m
Teras kafeler sokağı|street of terrace cafés with chairs and parasols folded|m,t
Kitapçılar sokağı|street of secondhand bookshops with crates of books outside|m,t
Bisiklet yolu|street with a green-painted bike lane and rows of parked bicycles|m,t
Pazar sabahı kapalı dükkanlar|street of shuttered shops on a Sunday morning, pigeons and empty pavements|m,t
Elektrik direkli sokak|street with leaning wooden power poles and sagging cables|m,t,v
Ara sokak çay bahçesi|side-street tea garden with low stools under a vine trellis|m,t,v
Gece yarısı boş cadde|wide avenue empty at midnight, traffic lights cycling for no one|m,t
`);
  const PLACES = L(`
İstanbul Kadıköy|in Kadıköy, Istanbul, with early-1900s apartment blocks, bay windows and tram-lined slopes|m
İstanbul Balat|in Balat, Istanbul, with colourful narrow houses, steep cobbled slopes and old churches|m
İstanbul Beyoğlu|in Beyoğlu, Istanbul, with 19th-century facades, iron balconies and passages|m
Ankara Ulus|in Ulus, Ankara, with early-Republic stone buildings and steep old-town streets|m
İzmir Alsancak|in Alsancak, Izmir, with Levantine houses, palm trees and the sea breeze|m
Mardin|in Mardin, with honey-coloured limestone houses stacked on a hillside above the plain|t
Safranbolu|in Safranbolu, with timber-framed Ottoman mansions and red-tiled roofs|t
Karadeniz kasabası|in a Black Sea coastal town of Turkey, wooden houses on green slopes above a harbour|t
Ege köyü|in an Aegean village of Turkey, whitewashed stone houses, bougainvillea and olive trees|v
Anadolu köyü|in a central Anatolian village of mudbrick and stone houses under a vast sky|v
Tokyo|in Tokyo, with dense low buildings, vending machines, overhead wires and paper lanterns|m
Kyoto|in Kyoto, with wooden machiya townhouses, sliding screens and stone paths|m
Seul|in Seoul, with stacked signs-free storefronts, hillside alleys and apartment towers|m
Hong Kong|in Hong Kong, with towering tenements, neon brackets and cramped streets|m
Bangkok|in Bangkok, with shophouses, tangled cables and tuk-tuk-width lanes|m
Hanoi|in Hanoi, with narrow tube houses, scooters and yellow colonial facades|m
Mumbai|in Mumbai, with weathered colonial buildings, hand-painted shutters and dense wiring|m
Varanasi|in Varanasi, with ochre houses, ghats nearby and narrow winding lanes|t
Marakeş|in Marrakech, with red earthen walls, carved doors and woven canopies|m
Kahire|in Cairo, with dusty Mamluk-era stone, mashrabiya windows and minarets|m
Lagos|in Lagos, with colourful concrete buildings, market umbrellas and yellow minibuses parked|m
Nairobi|in Nairobi, with modern towers beside low shops and jacaranda trees|m
Cape Town|in Cape Town, with pastel Bo-Kaap houses and Table Mountain behind|m
Paris|in Paris, with Haussmann facades, zinc roofs and wrought-iron balconies|m
Montmartre|in Montmartre, Paris, with steep steps, cafés and ivy-covered walls|m
Roma|in Rome, with ochre palazzi, cobbles and ancient stone fragments|m
Napoli|in Naples, with tall narrow streets, laundry and shrines in wall niches|m
Lizbon|in Lisbon, with azulejo-tiled facades, steep trams and terracotta roofs|m
Barselona|in Barcelona, with Gothic Quarter stone, balconies and narrow lanes|m
Londra|in London, with brick terraces, black railings and red post boxes|m
Amsterdam|in Amsterdam, with gabled canal houses and bicycles everywhere|m
Berlin|in Berlin, with Altbau facades, graffiti and wide cobbled pavements|m
Prag|in Prague, with baroque facades, cobbles and Gothic towers|m
Moskova|in Moscow, with Stalinist blocks, wide avenues and onion domes in the distance|m
New York|in New York, with brownstones, fire escapes, steam vents and yellow cabs parked|m
Chicago|in Chicago, with elevated train tracks, brick warehouses and steel bridges|m
Los Angeles|in Los Angeles, with palm trees, stucco buildings, power lines and wide boulevards|m
New Orleans|in New Orleans, with French Quarter balconies, iron lace and gas lamps|m
Havana|in Havana, with crumbling pastel colonial buildings and vintage cars parked|m
Mexico City|in Mexico City, with colourful colonial facades, papel picado strings and jacarandas|m
Rio de Janeiro|in Rio de Janeiro, with mosaic pavements, hillside favelas and tropical trees|m
Buenos Aires|in Buenos Aires, with Parisian facades, tango-district colours and plane trees|m
Sidney|in Sydney, with Victorian terraces, iron lace verandas and harbour glimpses|m
Yunan adası köyü|in a Greek island village with white cubic houses, blue doors and sea views|v
Alp köyü|in an Alpine village with chalets, flower boxes and peaks behind|v
Toskana kasabası|in a Tuscan hill town with stone houses, cypresses and terracotta roofs|t
İskandinav kasabası|in a Scandinavian harbour town with painted wooden houses|t
Amerikan kasabası|in a small American Midwest town with a water tower and diner|t
Sovyet blokları|in a post-Soviet housing estate of prefab concrete blocks|m
Meksika köyü|in a Mexican village of adobe houses, a white church and dusty roads|v
`);

  /* ---------------- MANZARA ---------------- */
  // biyom etiketleri: temperate, mediterranean, arid, tropical, alpine, boreal, polar, steppe, coast, volcanic, savanna, wetland
  const LANDS = L(`
Dalgalı tepeler|rolling green hills patched with fields and hedgerows|temperate,mediterranean,steppe
Altın buğday tarlası|golden wheat field stretching to the horizon with a lone tree|temperate,steppe,mediterranean
Ayçiçeği tarlası|vast sunflower field under a big sky|temperate,steppe,mediterranean
Lavanta tarlası|rows of lavender leading to a stone farmhouse|mediterranean
Pirinç terasları|stepped rice terraces filled with water reflecting the sky|tropical
Çay bahçeleri|steep tea plantation slopes in neat green rows|tropical,temperate
Üzüm bağları|vineyard rows over gentle slopes with a dirt track|mediterranean,temperate
Zeytinlik|ancient olive grove with gnarled silver trees and dry stone walls|mediterranean
Elma bahçesi|apple orchard in rows with ladders resting on trunks|temperate
Kır çiçekli çayır|wildflower meadow with tall grasses and a wooden fence|temperate,alpine,boreal
Yayla|high summer pasture with grazing-land, wooden huts and cloud shadows|alpine,temperate,steppe
Göl kenarı|still lake shore with reeds, a small jetty and mountains reflected|temperate,alpine,boreal
Nehir kıvrımı|wide river bend through flat farmland at dawn|temperate,steppe,tropical,wetland
Şelale|tall waterfall pouring into a green pool among rocks|temperate,tropical,alpine
Kanyon kenarı|edge of a deep canyon with layered rock walls|arid,steppe
Kızıl kaya vadisi|valley of red rock formations and hoodoos|arid,steppe,volcanic
Peri bacaları|fairy-chimney rock cones over a soft volcanic valley|volcanic,steppe
Kum tepeleri|endless sand dunes with sharp crests and ripples|arid
Tuz gölü|blinding white salt lake flat to the horizon|arid,steppe
Çorak bozkır|empty dry steppe with a single road cutting through|steppe,arid
Savan|open savanna with acacia trees and tall golden grass|savanna
Yağmur ormanı kenarı|edge of a rainforest, giant trees and hanging vines|tropical
Mangrov|mangrove roots in still brackish water|tropical,wetland,coast
Bataklık|reed marsh with channels of dark water and mist|wetland,temperate,boreal
Çam ormanı yolu|forest road through tall pines with light shafts|temperate,boreal,alpine,mediterranean
Sonbahar ormanı|deciduous forest in full autumn colour|temperate
Huş ağaçları|birch forest with white trunks and golden leaves|boreal,temperate
Tayga|endless taiga of dark spruce under low cloud|boreal
Buzul vadisi|glacier tongue filling a valley between peaks|alpine,polar
Karlı dağ zirvesi|snow-covered summit ridge above a sea of clouds|alpine,polar
Dağ geçidi yolu|mountain pass road with switchbacks and snow poles|alpine
Fiyort|deep fjord with sheer cliffs and still water|boreal,polar,coast
Tundra|flat tundra with lichen, ponds and distant low hills|polar,boreal
Buz sahanlığı|vast flat ice shelf and a pale horizon|polar
Kayalık sahil|rocky coast with crashing surf and tide pools|coast,temperate,mediterranean,boreal
Kumsal|long empty sandy beach with gentle waves|coast,tropical,mediterranean
Tropik koy|turquoise cove with palms and white sand|tropical,coast
Uçurum sahil|high sea cliffs with a lighthouse on the edge|coast,temperate,boreal
Deniz feneri burnu|windswept headland with a lighthouse and grass|coast,temperate,boreal,mediterranean
Kumul sahil|coastal dunes with marram grass and a boardwalk|coast,temperate
Volkan konisi|dark volcanic cone with a crater rim and ash slopes|volcanic
Lav tarlası|black lava field with steam vents and moss|volcanic,polar
Sıcak su travertenleri|white travertine terraces with turquoise pools|volcanic,mediterranean
Mağara ağzı|wide cave mouth opening onto a valley|temperate,arid,tropical,mediterranean
Kırsal yol|empty country road winding between fields and trees|temperate,mediterranean,steppe,boreal
Çiftlik evi|isolated farmhouse with a barn and a windmill in open land|temperate,steppe
Ahır ve saman balyaları|barn with round hay bales scattered in a cut field|temperate,steppe
Yel değirmenleri|row of old windmills on a ridge|mediterranean,temperate
Rüzgar türbinleri|wind turbines on a ridge above farmland|temperate,steppe,coast
Taş köprü|old stone arch bridge over a mountain stream|temperate,alpine,mediterranean
Dağ kulübesi|lonely mountain hut below a peak|alpine
Kamp alanı|empty forest clearing with a fire pit and logs|temperate,boreal,alpine
Gökyüzü yansıyan sığ göl|shallow lake mirroring a dramatic sky|steppe,arid,polar,wetland
Yıldızlı gece çölü|desert under a sky full of stars and the Milky Way|arid,steppe
Kuzey ışıkları ovası|snowy plain beneath the aurora|polar,boreal
Pamuk tarlası|cotton field in white bloom|steppe,temperate,arid
Kayalık ova|boulder-strewn plain with distant mesas|arid,steppe,savanna
Sulak çayır|flooded meadow with grazing-land and willows|wetland,temperate
Muz plantasyonu|banana plantation rows under a humid sky|tropical
Bambu ormanı|tall bamboo grove with green filtered light|tropical,temperate
`);
  const REGIONS = L(`
Kapadokya|in Cappadocia, Turkey|volcanic,steppe
Karadeniz yaylası|in the Black Sea highlands of Turkey|temperate,alpine
Ege kıyısı|on the Aegean coast of Turkey|mediterranean,coast
Doğu Anadolu|in eastern Anatolia|steppe,alpine
Pamukkale çevresi|around Pamukkale, Turkey|volcanic,mediterranean
Toskana|in Tuscany, Italy|mediterranean,temperate
Provence|in Provence, France|mediterranean
İskoç dağlık bölgesi|in the Scottish Highlands|temperate,coast,wetland
İrlanda|in the west of Ireland|temperate,coast
İzlanda|in Iceland|volcanic,polar,coast
Norveç|in Norway|boreal,coast,alpine
Finlandiya Laponya|in Finnish Lapland|boreal,polar
İsviçre Alpleri|in the Swiss Alps|alpine,temperate
Dolomitler|in the Dolomites, Italy|alpine
Endülüs|in Andalusia, Spain|mediterranean,arid
Sahra|in the Sahara|arid
Fas Atlas dağları|in the Atlas Mountains, Morocco|arid,alpine,steppe
Kenya ovaları|on the plains of Kenya|savanna
Namibya|in Namibia|arid,coast,savanna
Madagaskar|in Madagascar|tropical,coast,savanna
Moğolistan|in Mongolia|steppe,arid
Tibet platosu|on the Tibetan plateau|alpine,steppe
Japon kırsalı|in rural Japan|temperate,coast,volcanic
Bali|in Bali|tropical,volcanic,coast
Vietnam kuzeyi|in northern Vietnam|tropical,alpine
Hindistan Kerala|in Kerala, India|tropical,coast,wetland
Yeni Zelanda|in New Zealand|temperate,alpine,coast,volcanic
Avustralya taşrası|in the Australian outback|arid,savanna
Patagonya|in Patagonia|alpine,steppe,polar
And dağları|in the Andes|alpine,arid
Amazon|in the Amazon basin|tropical,wetland
Kosta Rika|in Costa Rica|tropical,volcanic,coast
Amerikan güneybatısı|in the American Southwest|arid,steppe
Montana|in Montana|temperate,alpine,steppe
Kanada Rockies|in the Canadian Rockies|alpine,boreal
Alaska|in Alaska|polar,boreal,coast
Louisiana bataklıkları|in the Louisiana bayou|wetland
Hawaii|in Hawaii|volcanic,tropical,coast
Antarktika|in Antarctica|polar
Sibirya|in Siberia|boreal,polar,steppe
`);

  /* ---------------- EV İÇİ ---------------- */
  const ROOMS = L(`
Mutfak|kitchen interior with counters, a sink under the window and pans on hooks
Oturma odası|living room interior with a sofa, a coffee table and a rug
Yatak odası|bedroom interior with an unmade bed, bedside lamp and wardrobe
Çocuk odası|child's bedroom interior with toys, a small desk and painted walls
Banyo|bathroom interior with tiles, a mirror and a towel rail
Yemek odası|dining room interior with a table set for dinner and a pendant lamp
Giriş holü|entrance hallway interior with coats on hooks, shoes and a mirror
Çalışma odası|home office interior with a desk, books and a desk lamp
Balkon|balcony with chairs, potted plants and a view over the street
Çatı katı|attic interior with sloping beams, boxes and a skylight
Bodrum|basement interior with a boiler, shelves and a single bulb
Çamaşır odası|utility room interior with a washing machine and drying rack
Merdiven boşluğu|apartment stairwell interior with worn steps and a window on the landing
Kiler|pantry interior with shelves of jars and sacks
Garaj|home garage interior with tools on a pegboard and a workbench
Kış bahçesi|conservatory interior with glass walls and plants
Kitaplık köşesi|reading nook interior by a window with a armchair and shelves
Teras|roof terrace with string lights, a table and the city beyond
Bahçe|small back garden with a lawn, a shed and a washing line
Ön bahçe ve kapı|front path to the door with a gate and flowerbeds
Koridor|apartment corridor interior with doors and framed pictures
Müzik köşesi|corner of a living room interior with a piano and a record player
Ev sineması|den interior with a large screen, a sectional sofa and dim lights
Ev spor köşesi|spare room interior turned into a home gym with weights and a mat
Hobi atölyesi|craft room interior with a sewing machine, fabric and paints
Gece yarısı mutfak|kitchen interior at midnight, only the fridge light and a hood lamp on
Sabah kahvaltı masası|breakfast table interior by a sunny window with plates and teapot
Taşınma günü|half-empty room interior on moving day, boxes and bare walls
Bayram sofrası|living room interior with a holiday table, festive tablecloth and sweets
Yağmurlu pencere önü|window seat interior on a rainy day, cushions and a blanket
`);
  const HOMES = L(`
İstanbul apartman dairesi|in an old Istanbul apartment with high ceilings, parquet and lace curtains
Anadolu köy evi|in an Anatolian village house with a wood stove, kilims and low cushions
Yalı|in a Bosphorus waterside mansion with wooden panels and water views
Japon dairesi|in a compact Japanese apartment with tatami, sliding doors and neat storage
Amerikan banliyö evi|in an American suburban house with carpet, a big fridge and family photos
Paris dairesi|in a Parisian flat with mouldings, herringbone floors and tall windows
Londra teras evi|in a London terraced house with a fireplace and narrow rooms
İskandinav evi|in a Scandinavian home with pale wood, white walls and candles
Sovyet dairesi|in a Soviet-era flat with patterned wallpaper, a carpet on the wall and a glass cabinet
Hint evi|in an Indian family home with bright textiles, brass vessels and a ceiling fan
Meksika evi|in a Mexican home with colourful tiles, clay pots and painted walls
Fas riyadı|in a Moroccan riad with zellige tiles, arches and a courtyard fountain
Öğrenci yurdu|in a cramped student dorm with bunk beds, posters without text and a kettle
Lüks çatı katı|in a luxury penthouse with floor-to-ceiling glass and a skyline view
Endüstriyel loft|in an industrial loft with exposed brick, steel beams and big windows
Ahşap dağ evi|in a wooden mountain cabin with a stone fireplace and fur throws
Yazlık sahil evi|in a seaside summer house with white wood, wicker and sand on the floor
1970'ler evi|in a 1970s home with orange and brown tones, wood panels and shag carpet
1990'lar evi|in a 1990s home with a CRT television, beige plastic and floral prints
Yaşlı çiftin evi|in an elderly couple's home with doilies, old photographs and a ticking clock
Minimalist modern ev|in a minimalist modern home with concrete, oak and almost nothing on display
Bohem ev|in a bohemian home with plants everywhere, rugs and mismatched furniture
Karavan|in a camper van interior with a fold-down table and curtains
Tekne kabini|in a sailboat cabin interior with varnished wood and portholes
`);

  /* ---------------- GÜNDELİK MEKÂNLAR ---------------- */
  // i = iç mekân; boyut etiketi: m, t, v (büyük şehir, kasaba, köy)
  const DAILY = L(`
Süpermarket reyonu|supermarket aisle interior with shelves of products without readable labels|m,t
Mahalle bakkalı|corner grocery interior with crowded shelves and a counter|m,t,v
Fırın|bakery interior with bread racks and a glass counter|m,t,v
Kasap|butcher shop interior with a tiled counter and hooks|m,t,v
Manav tezgahı|greengrocer stall piled with fruit and vegetables under an awning|m,t,v
Pazar yeri|open-air weekly market with empty stalls under tarps|m,t,v
Eczane|pharmacy interior with white shelves and a green cross light|m,t
Berber|barbershop interior with chairs, mirrors and a striped pole|m,t,v
Kuaför|hair salon interior with washing basins and dryers|m,t
Çamaşırhane|laundromat interior with rows of machines and plastic chairs|m,t
Kafe|café interior with a coffee machine, pastries and window seats|m,t
Kahvehane|traditional teahouse interior with small tables, tea glasses and backgammon boards|m,t,v
Lokanta|home-cooking restaurant interior with steam trays and a counter|m,t
Dönerci|kebab shop interior with a vertical grill and a counter|m,t
Fast food|fast-food restaurant interior with plastic booths and a menu board without text|m,t
Pizzacı|pizzeria interior with a wood-fired oven and checked tablecloths|m,t
Bar|neighbourhood bar interior with stools, bottles and warm lamps|m,t
Ofis açık alan|open-plan office interior with desks, monitors and plants|m
Toplantı odası|meeting room interior with a long table and a screen|m
Okul sınıfı|school classroom interior with desks, a board and maps without text|m,t,v
Okul koridoru|school corridor interior with lockers and noticeboards|m,t
Spor salonu|school gymnasium interior with a polished floor and hoops|m,t
Üniversite amfisi|university lecture hall interior with tiered seats|m
Kütüphane|public library interior with tall shelves and reading tables|m,t
Hastane koridoru|hospital corridor interior with trolleys and pale green walls|m,t
Bekleme salonu|clinic waiting room interior with rows of chairs and a reception desk|m,t
Diş hekimi|dentist room interior with a chair and a lamp|m,t
Belediye binası|town hall interior with counters and numbered queue lights|m,t
Postane|post office interior with counters and parcel shelves|m,t,v
Banka şubesi|bank branch interior with glass counters|m,t
Otobüs içi|city bus interior with handrails, seats and windows streaked with light|m,t
Metro vagonu|metro carriage interior with poles, seats and doors|m
Metro peronu|metro platform interior with tiled walls and a tunnel mouth|m
Tren garı|railway station concourse interior with a departure board without text|m,t
Havalimanı kapısı|airport gate interior with rows of seats and a window onto the apron|m
Otogar|intercity bus terminal with bays, benches and ticket windows|m,t
Taksi durağı|taxi rank by the kerb with a small kiosk|m,t
Feribot salonu|ferry passenger deck interior with rows of seats and sea through windows|m,t
Benzin istasyonu marketi|petrol station shop interior with snacks and a coffee machine|m,t,v
Otopark katı|multistorey car park interior with concrete columns and painted bays|m
Asansör içi|lift interior with mirrored walls and buttons|m
Çocuk parkı|neighbourhood playground with swings, slides and a sandpit|m,t,v
Halı saha|small artificial-turf football pitch caged with nets under floodlights|m,t
Basketbol sahası|outdoor basketball court with chain nets and painted lines|m,t
Spor salonu (fitness)|fitness gym interior with machines, mirrors and rubber floors|m,t
Yüzme havuzu|public indoor swimming pool interior with lanes and tiled walls|m,t
Sinema salonu|cinema auditorium interior with red seats and an empty screen glow|m,t
Bowling salonu|bowling alley interior with lanes and ball returns|m
Oyun salonu|arcade interior with game cabinets glowing in the dark|m
Düğün salonu|wedding hall interior with round tables, chairs and a stage|m,t
Kuaför önü sokak tezgahı|street kiosk selling newspapers and snacks, shutters half open|m,t
Simit arabası köşesi|street corner with a bread-ring cart and a bench|m,t
Çay ocağı|tiny tea kitchen interior in a market, glasses on a tray|m,t
Terzi|tailor shop interior with fabric bolts and a sewing machine|m,t,v
Ayakkabı tamircisi|cobbler's workshop interior with lasts and tools|m,t,v
Tamirhane|car repair garage interior with a lift and tool walls|m,t,v
Nalbur|hardware store interior with bins of screws and tools|m,t,v
Çiçekçi|florist interior full of buckets of flowers|m,t
Kitapçı|bookshop interior with tables of books and ladders|m,t
Elektronik dükkanı|electronics shop interior with screens and cables|m
Telefoncu|phone repair stall interior with tiny parts and lamps|m,t
Mahalle camisi avlusu|courtyard of a neighbourhood mosque with ablution taps and trees|m,t,v
Köy kahvesi önü|outside a village coffeehouse with chairs under a big tree|v
Köy okulu|small village school building with a flag pole and yard|v
Çeşme başı|village fountain with stone troughs in a small square|v
Tarla kenarı ambar|farm shed with tools and sacks at the edge of a field|v
Ahır içi|barn interior with straw, stalls and light through gaps|v
Kümes|chicken coop yard with a fence and feeders|v
Sera|greenhouse interior with rows of tomato plants|t,v
Balıkçı barınağı|fishing shelter with nets, crates and small boats|t,v
Hal (toptancı)|wholesale produce market hall interior with crates stacked high|m,t
Kargo deposu|parcel warehouse interior with racks and a conveyor|m
Fabrika yemekhanesi|factory canteen interior with long tables and trays|m,t
Gece vardiyası ofisi|office interior at night with only a few desk lamps on|m
Ev partisi sonrası salon|living room interior after a party, cups and streamers left behind|m,t,v
Doğum günü süslemeli kafe|café interior decorated with balloons for a birthday|m,t
Mezuniyet salonu|school hall interior decorated for graduation with chairs in rows|m,t
Bayram yeri|small funfair lot with a carousel and food stands at dusk|m,t,v
Plaj büfesi|beach kiosk with parasols and plastic chairs stacked|t,v
Kayak kulübesi|ski lodge interior with boots by the fire|t,v
`);
  const DREG = L(`
Türkiye büyükşehir|in a big Turkish city|m
Türkiye kasabası|in a small Turkish town|t
Türkiye köyü|in a Turkish village|v
Japonya|in Japan|m,t
Kore|in South Korea|m
Hindistan|in India|m,t,v
Mısır|in Egypt|m,t
Nijerya|in Nigeria|m,t
Fransa|in France|m,t,v
İtalya|in Italy|m,t,v
Birleşik Krallık|in the United Kingdom|m,t
Almanya|in Germany|m,t
Rusya|in Russia|m,t,v
ABD|in the United States|m,t
Meksika|in Mexico|m,t,v
Brezilya|in Brazil|m,t
`);

  /* ---------------- gruplar ---------------- */
  const groups = [];
  const add = (g, items) => {
    if (!items.length) return;
    for (let i = 0; i < items.length; i += 99) groups.push(Object.assign({}, g, { id: g.id + (i ? '-' + (i / 99 + 1) : ''), items: items.slice(i, i + 99).join('\n') }));
  };
  const slug = (s) => s.toLocaleLowerCase('tr').replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const short = (p) => p.tr.replace(/^İstanbul /, '');

  PLACES.forEach((p) => {
    const items = STREETS.filter((s) => has(s, p)).map((s) => `${s.tr} · ${short(p)}|${s.en} ${p.en}`);
    add({ id: 'st-' + slug(p.tr), tr: 'Sokak · ' + p.tr, arch: 'street', ctx: 'ext', engines: ['street3d', 'city', 'skyline'],
      cond: ['lived-in', 'quiet', 'wet', 'empty', 'busy-but-empty', 'weathered'], genres: ['street', 'urban', 'modern', 'daily'],
      nosnow: /Bangkok|Hanoi|Mumbai|Varanasi|Lagos|Rio|Havana|Marakeş|Kahire|Los Angeles|New Orleans|Nairobi|Sidney/.test(p.tr) }, items);
  });
  REGIONS.forEach((r) => {
    const items = LANDS.filter((l) => has(l, r)).map((l) => `${l.tr} · ${r.tr}|${l.en} ${r.en}`);
    const trop = r.tags.every((t) => ['tropical', 'arid', 'savanna', 'wetland', 'coast'].includes(t)) && !r.tags.includes('polar');
    add({ id: 'ls-' + slug(r.tr), tr: 'Manzara · ' + r.tr, arch: 'landscape', biomes: r.tags, ctx: 'ext', engines: ['countryside', 'terrain3d', 'mountains', 'clouds'],
      cond: ['pristine', 'calm', 'misty', 'windswept', 'harvest', 'autumnal', 'quiet'], genres: ['landscape', 'nature'], nosnow: trop }, items);
  });
  HOMES.forEach((h) => {
    const items = ROOMS.map((r) => `${r.tr} · ${h.tr}|${r.en} ${h.en}`);
    add({ id: 'hm-' + slug(h.tr), tr: 'Ev · ' + h.tr, arch: 'home', ctx: 'mixed', engines: ['homeint', 'room3d', 'godrays'],
      cond: ['lived-in', 'messy', 'quiet', 'empty', 'busy-but-empty', 'pristine'], genres: ['daily', 'interior', 'modern'] }, items);
  });
  DREG.forEach((d) => {
    const items = DAILY.filter((x) => has(x, d)).map((x) => `${x.tr} · ${d.tr}|${x.en} ${d.en}`);
    add({ id: 'dl-' + slug(d.tr), tr: 'Gündelik · ' + d.tr, arch: 'daily', ctx: 'mixed', engines: ['homeint', 'street3d', 'city'],
      cond: ['lived-in', 'busy-but-empty', 'quiet', 'empty', 'lit', 'weathered'], genres: ['daily', 'modern', 'interior', 'urban'] }, items);
  });
  groups.forEach((g) => CB.addGroup(g));
  CB.V6_GROUPS = groups.length;
})();
