/* CineBG Studio v7 — B: meslekler, kurumlar ve gündelik mekânlar (25 başlık × 30 mekân). */
(function () {
  const CB = window.CB;
  const G = [];

  G.push({ id: 'b7-hospital', tr: 'Hastaneler & Tıp', arch: 'daily', ctx: 'int', engines: ['homeint', 'corridor', 'room3d', 'godrays'], cond: ['empty', 'quiet', 'busy-but-empty', 'pristine', 'eerie'], genres: ['work', 'daily', 'interior', 'modern'], items: `
Acil Servis Koridoru|hospital emergency department corridor interior with empty gurneys, curtain bays and harsh fluorescent light
Ameliyathane|operating theatre interior with a surgical table under round lamps, steel trays and tiled green walls
Yoğun Bakım Ünitesi|intensive care unit interior with glass-fronted rooms, monitors glowing and coiled tubing
Hasta Odası Gece|hospital ward room interior at night with an empty adjustable bed, drip stand and city lights through blinds
Bekleme Salonu|hospital waiting area interior with rows of joined plastic chairs, a water cooler and a vending machine
Radyoloji Odası|MRI room interior with a large white scanner ring, a sliding table and a control window
Laboratuvar Tezgahı|clinical laboratory interior with centrifuges, racks of sample tubes and microscopes under white light
Eczane Deposu|hospital pharmacy store interior with tall sliding shelves of boxed medicine and a dispensing counter
Doğumhane Koridoru|maternity ward corridor interior with nursery windows, soft pastel walls and a parked bassinet
Hemşire Masası|nurses station interior with charts, computer screens and a wall of patient call lights
Ambulans Rampası|ambulance bay at night with a parked ambulance, red light washing over wet concrete and sliding doors
Kan Bankası|blood bank refrigeration room interior with glass-door fridges of red bags and cold blue light
Fizik Tedavi Salonu|physiotherapy gym interior with parallel bars, exercise balls and large windows
Diş Kliniği|dental clinic room interior with a reclined chair, overhead lamp and instrument tray
Morg Soğuk Odası|hospital morgue interior with stainless steel drawers, a drain in the floor and flickering light
Eski Sanatoryum|abandoned early-1900s sanatorium ward interior with rows of iron beds and peeling paint
Sahra Hastanesi Çadırı|field hospital tent interior with canvas walls, folding cots and hanging lanterns
Çocuk Servisi|children's ward interior with painted animal murals, small beds and soft toys on shelves
Hastane Kafeteryası|hospital cafeteria interior after hours with stacked trays and a dim serving counter
Hastane Çatısı Helipad|hospital rooftop helipad at dusk with the painted landing circle and wind sock
Steril Koridor|sterile clean-room corridor interior with airlock doors, white panels and blue floor lighting
Veteriner Kliniği|veterinary clinic exam room interior with a steel table, cages and animal charts without text
Kliniğin Arşiv Odası|medical records room interior with rolling shelves of colour-tabbed folders
Diyaliz Ünitesi|dialysis unit interior with reclining chairs beside humming machines in a row
Hastane Bahçesi|hospital courtyard garden with benches, a fountain and wheelchairs parked under trees
Psikiyatri Koridoru|long psychiatric wing corridor interior with heavy doors and small wire-glass windows
Tıp Fakültesi Amfisi|anatomy lecture theatre interior with steep wooden tiers around a central table
Asansör Holü|hospital lift lobby interior with steel doors, a hand sanitiser station and a wall clock
Karantina İstasyonu|quarantine isolation room interior behind plastic sheeting with negative-pressure vents
Gece Nöbet Odası|on-call doctors room interior with a narrow bunk, a desk lamp and a kettle
` });

  G.push({ id: 'b7-campus', tr: 'Okul & Kampüs Yaşamı', arch: 'daily', ctx: 'mixed', engines: ['homeint', 'library3d', 'corridor', 'countryside', 'godrays'], cond: ['lived-in', 'busy-but-empty', 'quiet', 'empty', 'messy'], genres: ['work', 'daily', 'modern', 'interior'], items: `
İlkokul Sınıfı|primary school classroom interior with small desks, a chalkboard and paper artwork pinned to the walls
Lise Koridoru|high school corridor interior with rows of metal lockers and a polished floor reflecting the windows
Kimya Laboratuvarı|school chemistry lab interior with black benches, gas taps and glass beakers in racks
Okul Kantini|school canteen interior with long tables, plastic trays and a closed serving hatch
Spor Salonu Basketbol|school gymnasium interior with a wooden court, folded bleachers and hanging ropes
Okul Bahçesi|schoolyard with painted hopscotch, a flagpole and basketball hoops under morning sun
Kampüs Çimenliği|university campus lawn with old brick buildings, paths and large oak trees
Üniversite Kütüphanesi|university library reading hall interior with green lamps and long wooden tables
Amfi Tiyatro Sınıf|lecture hall interior with curved tiers of seats and a large projection screen glowing
Yurt Odası|student dorm room interior with two narrow beds, a cluttered desk and string lights
Müzik Sınıfı|music classroom interior with a piano, music stands and instrument cases along the wall
Resim Atölyesi|art classroom interior with easels, paint-splattered tables and drying canvases
Okul Servisi|yellow school bus parked at the kerb outside the school gates at dawn
Mezuniyet Salonu|school assembly hall interior with rows of chairs facing a stage with heavy curtains
Okul Çatı Katı|rooftop of a school building with water tanks, a fence and the town beyond
Bilgisayar Laboratuvarı|computer lab interior with rows of monitors glowing blue in a dim room
Öğretmenler Odası|staff room interior with a kettle, piles of exam papers and a pinboard
Kampüs Meydanı Gece|campus square at night with lamp posts, a fountain and lit lecture buildings
Okul Tuvaleti|old school washroom interior with tiled walls, a row of sinks and a cracked mirror
Müdür Odası|headteacher's office interior with a heavy desk, trophies and framed certificates without text
Spor Sahası|school running track and football pitch with floodlights and empty stands
Kreş Oyun Odası|kindergarten playroom interior with soft mats, building blocks and tiny chairs
Yatılı Okul Yatakhanesi|boarding school dormitory interior with rows of iron beds and tall windows
Kampüs Kafesi|student café interior with mismatched chairs, laptops chargers and chalkboard menu without text
Okul Arşiv Bodrumu|school basement storage interior with old desks stacked and dusty globes
Botanik Seradaki Ders|university greenhouse interior with labelled seedling trays and misting pipes
Okul Bando Odası|band room interior with drum kits, brass instruments and tiered risers
Kampüs Bisiklet Parkı|rows of bicycles parked outside a modern campus building at golden hour
Okul Sahnesi Kulis|backstage of a school stage interior with painted flats and costume racks
Sınav Salonu|exam hall interior with rows of single desks spaced apart and a big clock
` });

  G.push({ id: 'b7-office', tr: 'Ofis & Kurumsal Dünya', arch: 'modern', ctx: 'int', engines: ['homeint', 'room3d', 'metro3d', 'godrays'], cond: ['busy-but-empty', 'lit', 'quiet', 'pristine', 'messy'], genres: ['work', 'modern', 'interior'], items: `
Açık Ofis Gece|open-plan office interior at night with rows of desks, a few monitors still glowing
Yönetim Kurulu Odası|boardroom interior with a long polished table, leather chairs and a skyline window
CEO Ofisi|executive corner office interior with floor-to-ceiling glass over the city and a minimalist desk
Resepsiyon Lobisi|corporate reception lobby interior with a marble desk, a living wall and brushed steel
Ortak Çalışma Alanı|coworking space interior with communal tables, plants and industrial lamps
Sunucu Odası|server room interior with racks of blinking lights and cold aisle containment
Çağrı Merkezi|call centre interior with tight rows of cubicles and headsets on hooks
Toplantı Kapsülü|glass meeting pod interior with a round table and a whiteboard covered in diagrams
Ofis Mutfağı|office kitchenette interior with a coffee machine, mugs and a fridge covered in notes
Fotokopi Odası|copy room interior with a large printer, paper reams and a flickering tube light
Startup Ofisi|startup loft office interior with beanbags, a ping-pong table and exposed brick
Muhasebe Bölümü|1980s accounting department interior with beige computers and filing cabinets
Hukuk Bürosu|law firm library office interior with bound volumes, green lamps and oak panelling
Banka Kasası Önü|bank back office interior with a vault door, steel counters and secure cages
Gökdelen Asansörü|glass elevator inside a skyscraper atrium looking down onto the lobby
Ofis Çatı Terası|rooftop office terrace with lounge chairs and the business district below
Ticaret Salonu|trading floor interior with curved desks and walls of financial screens glowing
Haber Odası|newsroom interior with clustered desks, wall clocks for time zones and TV screens
Arşiv Dosya Odası|corporate archive interior with tall rolling shelves of boxes
Ofis Otoparkı|underground office car park with numbered bays and concrete pillars
Tasarım Stüdyosu|design studio interior with large tables, mood boards and Pantone swatches
Mimar Ofisi|architecture office interior with white models on tables and drawings pinned up
Kriz Masası|situation room interior with a large wall display, dim light and an oval table
Gece Bekçi Masası|security desk in an empty office lobby at night with CCTV monitors glowing
Ofis Merdiven Boşluğu|office fire stairwell interior with concrete steps and green safety lights
Sessiz Kabin|phone booth pod interior with acoustic felt walls and a small stool
Ofis Lounge|office lounge interior with sofas, a vinyl player and warm lamps
Video Konferans Odası|video conference room interior with a big screen, cameras and acoustic panels
Kapanış Sonrası Ofis|office interior after closing time with chairs pushed in and blinds half drawn
Taşınma Günü Ofis|empty office floor interior with taped cables, boxes and bare desks
` });

  G.push({ id: 'b7-kitchen', tr: 'Restoran Mutfakları & Yeme-İçme', arch: 'daily', ctx: 'int', engines: ['homeint', 'fire', 'smoke', 'godrays'], cond: ['busy-but-empty', 'lived-in', 'lit', 'messy', 'pristine'], genres: ['work', 'daily', 'interior'], items: `
Profesyonel Mutfak|restaurant kitchen interior with steel counters, hanging pans and gas burners flickering blue
Pas Tezgahı|kitchen pass interior under heat lamps with empty plates lined up and order rails
Pizza Fırını|pizzeria kitchen interior with a domed wood-fired oven glowing orange
Ocakbaşı|Turkish grill house interior with a charcoal grill hood, skewers and copper trays
Suşi Barı|sushi bar interior with a pale wood counter, a glass fish case and bamboo mats
Ramen Dükkânı|tiny ramen shop interior with steaming pots, a counter and stools under noren curtains
Fransız Bistro|Parisian bistro interior with bentwood chairs, mirrors and a zinc bar
Lüks Restoran Salonu|fine dining room interior with white tablecloths, candles and chandeliers
Lokanta Vitrini|traditional eatery interior with steam trays of stews behind glass
Fırın Hamur Odası|bakery production room interior with flour-dusted tables and dough proofing racks
Soğuk Hava Deposu|walk-in cold room interior with crates of vegetables and hanging meat
Bulaşıkhane|dishwashing station interior with steam, stacked racks and a big sink
Pastane Atölyesi|patisserie workshop interior with marble tables, piping bags and cakes on stands
Burger Dükkânı|retro burger joint interior with red booths, a chrome counter and a milkshake machine
Taco Arabası İçi|taco truck interior with a griddle, salsa tubs and a serving window
Kahvaltı Salonu|breakfast hall interior with long tables laid with cheeses, olives and tea glasses
Şarap Mahzeni Restoran|wine cellar dining room interior with vaulted brick and racked bottles
Dim Sum Mutfağı|dim sum kitchen interior with towers of bamboo steamers releasing steam
Gece Yarısı Döner|kebab shop interior after midnight with the vertical grill glowing
Kampüs Yemekhanesi|large canteen interior with long tables and serving trays stacked
Çatı Restoranı|rooftop restaurant with string lights, set tables and a sunset over the city
Tren Yemekli Vagonu|dining car interior with white tablecloths and landscape through windows
Mutfak Kiler Rafları|restaurant dry store interior with sacks of rice, tins and spice jars
Izgara Duman|smoky barbecue pit interior with blackened smokers and stacked wood
Sokak Lokantası Tezgâh|counter-only diner interior with stools and a griddle by the window
Çay Ocağı|tiny tea station interior with brass samovars and racks of tulip glasses
Dondurma Dükkânı|ice cream parlour interior with pastel tubs in a glass freezer
Kapanmış Restoran|closed restaurant interior with chairs upside down on tables and dim lights
Açık Mutfak Şef Masası|open kitchen chef's table interior with copper pots and a long marble counter
Fast Food Arka Mutfak|fast-food back kitchen interior with fryers, timers and stainless hoods
` });

  G.push({ id: 'b7-cafe', tr: 'Kafeler & Kahve Dükkânları', arch: 'daily', ctx: 'mixed', engines: ['homeint', 'rainglass', 'street3d', 'godrays'], cond: ['lived-in', 'quiet', 'busy-but-empty', 'wet', 'lit'], genres: ['daily', 'work', 'modern', 'interior'], items: `
Üçüncü Dalga Kahveci|specialty coffee bar interior with a gleaming espresso machine, pour-over stands and pale wood
Yağmurlu Pencere Köşesi|café window seat interior on a rainy day with streaked glass and a steaming cup
Kitap Kafe|book café interior with shelves to the ceiling, armchairs and reading lamps
Viyana Kahvehanesi|grand Viennese café interior with marble tables, mirrors and chandeliers
Türk Kahvesi Ocağı|traditional coffee house interior with copper pots on hot sand and low stools
Kaldırım Kafesi|pavement café with small round tables and folded parasols on a cobbled street
Kedi Kafe|cat café interior with climbing shelves, cushions and soft toys on the floor
Endüstriyel Kahve Kavurucu|coffee roastery interior with a big drum roaster, sacks of beans and pipes
Sabah Açılışı|café interior at opening time with chairs still on tables and early light
Gece Kafesi|late-night café interior glowing warm on a dark empty street
Sahil Kafesi|beach café terrace with wooden decking, rattan chairs and the sea
Bahçe Kafe|garden café with tables under fruit trees and fairy lights
Japon Kissaten|retro Japanese kissaten interior with dark wood, siphon brewers and velvet seats
Çatı Katı Kafesi|attic café interior under sloped beams with skylights and cushions
Tren İstasyonu Kafesi|station café interior with a counter facing platforms and departure clocks
Pastane Vitrini|pâtisserie café interior with glass cases of cakes and pastel walls
Çay Bahçesi|Turkish tea garden on a hillside with low tables and a sea view
Bisiklet Kafe|cycling café interior with bikes hung on walls and a long counter
Ofis Lobisi Kahvecisi|lobby coffee kiosk interior in a glass tower atrium
Kar Altında Kafe|snow-covered café exterior with glowing windows and a bench buried in snow
Karavan Kahve|vintage caravan converted into a coffee stand parked in a park
Plak Kafe|vinyl café interior with record crates, a turntable and warm bulbs
Tarihi Han Kafesi|café in a historic caravanserai courtyard with stone arches and trees
Minimalist Beyaz Kafe|all-white minimalist café interior with concrete counter and one plant
Brunch Masası|sunlit brunch table interior with plates, flowers and a big window
Sokak Köşesi Kahve Penceresi|walk-up coffee window in a narrow alley with a single stool
Kütüphane Kafe Gece|university café interior at night with laptops chargers and dim pendants
Dağ Kafesi|alpine mountain café terrace with wooden tables above clouds
Eski Usul Pastane|old-fashioned patisserie interior with brass fittings and tiled floor
Kapanış Sonrası Kafe|café interior after closing with mopped floor and chairs stacked
` });

  G.push({ id: 'b7-hotel', tr: 'Oteller & Konaklama', arch: 'palace', ctx: 'int', engines: ['homeint', 'room3d', 'pool', 'corridor', 'godrays'], cond: ['pristine', 'opulent', 'quiet', 'lived-in', 'decaying'], genres: ['daily', 'work', 'interior', 'modern'], items: `
Grand Otel Lobisi|grand hotel lobby interior with a marble floor, chandelier and sweeping staircase
Otel Koridoru Sonsuz|endless hotel corridor interior with patterned carpet and identical doors
Lüks Süit|luxury suite interior with a king bed, velvet chairs and a panoramic window
Ucuz Motel Odası|roadside motel room interior with a buzzing neon sign outside the curtains
Kapsül Otel|capsule hotel interior with stacked sleeping pods glowing in rows
Butik Otel Terası|boutique hotel terrace with lounge chairs, olive trees and a sea view
Otel Barı|hotel bar interior with a brass counter, leather stools and low lamps
Çatı Havuzu|rooftop infinity pool with loungers and city lights reflecting
Otel Kapalı Havuzu|indoor hotel pool interior with tiled columns and still turquoise water
Dağ Oteli|alpine lodge interior with a stone fireplace, antlers and wooden beams
Çöl Kampı Çadırı|luxury desert camp tent interior with rugs, lanterns and a low bed
Otel Çamaşırhanesi|hotel laundry interior with industrial washers and carts of white linen
Kat Hizmetleri Arabası|hotel corridor interior with a housekeeping cart parked by an open door
Resepsiyon Gece|hotel reception desk interior at night with a bell and key rack
Otel Balo Salonu|hotel ballroom interior with round tables set and a dance floor
Pansiyon Odası|seaside guesthouse room interior with whitewashed walls and a blue shutter
Hostel Yatakhanesi|hostel dorm interior with bunk beds, lockers and backpacks
Ağaç Ev Otel|treehouse hotel room interior among branches with big windows
Kaplıca Oteli|thermal spa interior with steaming stone pools and arches
Otel Asansörü|vintage hotel elevator interior with brass gates and a velvet bench
Otel Kahvaltı Salonu|hotel breakfast room interior with buffet counters and morning light
Su Üstü Bungalov|overwater bungalow interior with a glass floor panel and lagoon outside
Terk Edilmiş Otel|abandoned resort hotel lobby interior with collapsed ceiling and dead palms
Otel Spa Odası|spa treatment room interior with candles, towels and a massage table
Kervansaray Oteli|courtyard hotel in an old caravanserai with arched rooms and a fountain
Buz Otel|ice hotel room interior carved from blocks of ice with a bed of furs
Otel Çatısı Tabela Arkası|hotel rooftop behind a giant sign frame with blinking aircraft lights
Otel Garajı Vale|hotel valet garage interior with a key box and polished cars
Kayak Oteli Bot Odası|ski lodge boot room interior with racks of skis and drying boots
Otel Mutfak Servis Koridoru|hotel back-of-house service corridor interior with trolleys and swing doors
` });

  G.push({ id: 'b7-airport', tr: 'Havalimanları & Uçuş', arch: 'modern', ctx: 'mixed', engines: ['station', 'metro3d', 'clouds', 'room3d', 'anamorphic'], cond: ['busy-but-empty', 'pristine', 'quiet', 'lit', 'empty'], genres: ['work', 'modern', 'daily'], items: `
Terminal Salonu|vast airport terminal interior with a wave roof, glass walls and parked jets outside
Kapı Bekleme Alanı|departure gate interior at dawn with rows of seats and a plane at the jet bridge
Bagaj Bandı|baggage claim hall interior with silent carousels and a single suitcase
Pist Gece|runway at night with rows of blue and white lights stretching to the horizon
Kontrol Kulesi|air traffic control tower cab interior with radar screens and panoramic windows
Hangar İçi|aircraft hangar interior with a jet under maintenance and work platforms
Kokpit|airliner cockpit interior with glowing instruments and clouds outside
Uçak Kabini Gece|airliner cabin interior at night with dimmed lights and window shades half down
Business Lounge|airport lounge interior with leather chairs, a bar and runway views
Güvenlik Kontrolü|security checkpoint interior with scanners, trays and roped lanes
Jet Köprüsü|jet bridge corridor interior with a ribbed tunnel and the aircraft door ahead
Apron Gün Batımı|airport apron at sunset with a parked jet, tugs and baggage carts
Küçük Taşra Havalimanı|small regional airfield with a single hangar and a windsock
Pist Ucu Çit|runway end fence with approach lights and a plane landing overhead
Uçak Mezarlığı|aircraft boneyard in the desert with rows of stored airliners
Pasaport Kontrolü|passport control hall interior with booths and floor queue markings
Duty Free Koridoru|duty-free shopping corridor interior with glowing displays, with deep perspective toward the far wall
Kargo Terminali|air cargo terminal interior with pallets and a wide-body freighter
Helikopter Pisti|heliport on a rooftop with a helicopter tied down at dusk
Deniz Uçağı İskelesi|seaplane dock on a lake with a floatplane tied to the pier
Hava Gösterisi Pisti|airshow field with vintage planes lined up and empty bleachers
Uçak Mutfağı|aircraft galley interior with steel carts and compartments
Bekleme Salonu Gece Uyku|terminal interior at 3am with dim lights and empty seats
Retro 70'ler Terminal|1970s airport terminal interior with orange seats and a flip departure board
Otopark Köprüsü|airport parking bridge walkway interior with glass walls and planes beyond
Pist Kar Temizleme|snow-covered apron with ploughs and a de-icing truck under floodlights
Uçuş Simülatörü|flight simulator bay interior with a motion pod on hydraulic legs
Paraşüt Hangarı|skydiving hangar interior with packing tables and parachutes hanging
Yakıt Tankeri Alanı|refuelling area with tanker trucks and hoses near parked jets
Uzay Limanı Terminali|futuristic spaceport terminal interior with a rocket on the pad outside
` });

  G.push({ id: 'b7-rail', tr: 'Trenler & Demiryolu Yolculuğu', arch: 'industrial', ctx: 'mixed', engines: ['station', 'tunnel', 'countryside', 'smoke', 'rainglass'], cond: ['busy-but-empty', 'weathered', 'quiet', 'misty', 'wet'], genres: ['work', 'daily', 'history', 'modern'], items: `
Tarihi Gar Holü|grand railway station hall interior with an iron and glass roof and clock tower
Peron Sisli Sabah|railway platform on a misty morning with lamps and benches
Buharlı Lokomotif|steam locomotive standing at a platform venting steam
Yataklı Vagon|sleeper train compartment interior with fold-down bunks and a small window
Lüks Ekspres Vagonu|luxury express salon car interior with wood panelling and brass lamps
Yüksek Hızlı Tren Kabini|high-speed train cabin interior with sleek seats and a blurred landscape
Makinist Kabini|train driver's cab interior with controls and rails ahead
Kırsal İstasyon|tiny country station with a wooden waiting room and one track
Karlı Demiryolu Köprüsü|railway viaduct across a snowy valley, with layered depth and fine weathered textures
Makas Sahası|rail yard with switches, signals and parked freight wagons
Lokomotif Deposu|engine shed interior with a turntable and old locomotives
Banliyö Treni Gece|commuter train carriage interior at night with harsh light and empty seats
Tünel Girişi|railway tunnel mouth in a mountainside with a signal light
Terk Edilmiş Hat|abandoned railway line overgrown with grass and rusting rails
Çöl Demiryolu|single track crossing a desert to the horizon
Yük Treni Vagon İçi|empty freight boxcar interior with open doors and a passing landscape
Gar Bilet Gişesi|ticket office interior with wooden windows and a timetable board
Dağ Treni Virajı|mountain railway on a curved stone viaduct among peaks
Bekleme Salonu Eski|old station waiting room interior with wooden benches and a stove
Tren Penceresinden Tarla|view through a train window of passing fields at golden hour
Hemzemin Geçit|level crossing with barriers down and red lights flashing at dusk
Depo Vagon Mezarlığı|train graveyard with rows of rusting carriages, framed with strong foreground depth and detail
Bagaj Vagonu|luggage van interior with trunks and mail sacks
Yemekli Vagon Gece|dining car interior at night with lamps on tables
Peron Altı Geçit|tiled station underpass interior with stairs to platforms
Sinyal Kulübesi|signal box interior with long levers and track diagrams
Kar Küreyici Lokomotif|snowplough locomotive on a snowy track, with every surface rich in texture
Tren Feribotu|train ferry deck interior with rail tracks inside the ship
Kıyı Demiryolu|coastal railway running along cliffs above the sea
Monoray İstasyonu|futuristic monorail station with elevated sleek rails, seen in a wide composition with clear depth
` });

  G.push({ id: 'b7-port', tr: 'Limanlar & Tersaneler', arch: 'water', ctx: 'mixed', engines: ['harbor', 'ocean', 'smoke', 'storm'], cond: ['busy-but-empty', 'weathered', 'rusted', 'misty', 'wet'], genres: ['work', 'urban', 'modern'], items: `
Konteyner Limanı|container port with stacks of coloured containers and gantry cranes at dusk
Kuru Havuz|dry dock with a huge ship hull resting on blocks
Tersane Kaynak Atölyesi|shipyard welding hall interior with sparks and steel plates
Balıkçı Hali|fish market hall interior with ice tables and drains on a wet floor
Feribot İskelesi|ferry terminal pier with ramps, bollards and gulls
Liman Feneri|harbour breakwater with a small red lighthouse at night
Gemi Makine Dairesi|ship engine room interior with giant pistons and catwalks
Römorkör|tugboat moored beside a cargo ship in fog
Liman Deposu|harbour warehouse interior with sacks and crates stacked high
Gemi Köprüsü|ship bridge interior with radar screens and a wide window over the bow
Marina|marina with sailing yachts and wooden pontoons at golden hour
Gemi Söküm Sahili|ship-breaking beach with stranded hulls and cutting debris
Petrol Terminali|oil terminal jetty with pipes and tanker at night
Liman Vinci Kabini|crane operator cabin interior high above containers, with every object carefully in place
Eski Kereste İskelesi|old timber wharf with rotting posts and moored barges
Gemi Kamarası|crew cabin interior with a bunk and a porthole
Buzkıran|icebreaker ship in a frozen harbour, with deep perspective toward the far end
Balık Ağları Rıhtım|quay with piles of nets, buoys and crates
Kanal Kilidi|canal lock with heavy gates and rising water
Liman Gümrük Ofisi|customs office interior with stamped papers and a harbour view
Gemi Ambarı|empty cargo hold interior with steel ribs and light from the hatch
Fırtınada Dalgakıran|breakwater during a storm with waves crashing over
Yat Tersanesi|yacht building shed interior with a hull under construction
Liman Meyhanesi|harbour tavern interior with nets on the ceiling and lamps
Denizaltı Rıhtımı|submarine pen interior with concrete arches and dark water
Kıyı Güvenlik İstasyonu|coast guard station with a lifeboat ramp, with layered depth and fine weathered textures
Liman Gece Konteyner Arası|lane between container stacks at night with sodium lights
Kuru Yük Silosu|grain silos at the port with a bulk carrier docked
Hurda Gemi|rusting wreck half sunk in a quiet harbour
Liman Kafeteryası|dockworkers canteen interior with long tables and a window on cranes
` });

  G.push({ id: 'b7-craft', tr: 'Atölyeler & Zanaat', arch: 'industrial', ctx: 'int', engines: ['homeint', 'fire', 'godrays', 'smoke'], cond: ['lived-in', 'messy', 'weathered', 'dusty', 'lit'], genres: ['work', 'daily', 'interior', 'history'], items: `
Demirci Ocağı|blacksmith forge interior with a glowing hearth, anvil and hanging tongs
Marangoz Atölyesi|carpentry workshop interior with workbenches, clamps and wood shavings in sunbeams
Çömlekçi|pottery studio interior with a wheel, clay pots drying on shelves
Cam Üfleme|glassblowing studio interior with a roaring furnace and glowing glass
Halı Dokuma Tezgâhı|carpet weaving workshop interior with a tall loom and spools of wool
Kuyumcu Tezgâhı|jeweller's bench interior with tiny tools, a loupe and a lamp
Saatçi|watchmaker's workshop interior with clocks ticking on every wall
Deri Atölyesi|leather workshop interior with hides, punches and stitching tools
Matbaa|letterpress print shop interior with cases of type and an iron press
Ciltçi|bookbinding workshop interior with presses and stacks of paper
Bakırcı|coppersmith workshop interior with hammered pots hanging everywhere
Çini Atölyesi|tile painting workshop interior with blue patterns drying on racks
Kemancı|violin maker's workshop interior with instrument bodies hanging
Terzi Atölyesi|tailoring workshop interior with mannequins, fabric bolts and a cutting table
Heykel Stüdyosu|sculpture studio interior with plaster casts and marble blocks
Bisiklet Tamirci|bicycle repair workshop interior with frames hung and tools on a pegboard
Elektronik Tamir|electronics repair bench interior with soldering iron and circuit boards
Mum Atölyesi|candle-making workshop interior with dripping wax and wicks hanging
Sabun Atölyesi|soap workshop interior with drying bars stacked on racks
Sepet Örücü|basket weaving workshop interior with willow bundles and baskets
Kaligrafi Odası|calligraphy studio interior with ink pots, reed pens and paper
Çilingir Dükkanı|locksmith shop interior with walls of keys and a cutting machine
Tabela Boyacısı|sign painter's studio interior with brushes and blank boards
Neon Bükücü|neon bending workshop interior with glass tubes and torches
Oyuncakçı|toymaker's workshop interior with wooden toys and paint pots
Fotoğraf Karanlık Oda|darkroom interior under red safelight with trays and prints drying
Şapkacı|milliner's workshop interior with hat blocks and felt
Taş Ustası Atölyesi|stonemason yard with carved blocks and chisels, framed with strong foreground depth and detail
Kayıkçı Tezgâhı|boatbuilding shed interior with a wooden hull on stocks
Müzik Aleti Tamirhanesi|instrument repair shop interior with guitars and brass horns
` });

  G.push({ id: 'b7-farm', tr: 'Çiftlikler & Tarım', arch: 'landscape', ctx: 'mixed', engines: ['countryside', 'aerial', 'godrays', 'clouds'], cond: ['harvest', 'lived-in', 'calm', 'misty', 'weathered'], genres: ['work', 'landscape', 'daily'], items: `
Ahır İçi Sabah|barn interior at dawn with hay bales, light through gaps and stalls
Hasat Tarlası|freshly harvested wheat field with a combine harvester parked at sunset
Traktör Garajı|tractor shed interior with old tractors and tools
Süt Çiftliği|dairy milking parlour interior with steel stalls and hoses
Sera Domates|long greenhouse interior with rows of tomato plants and misting pipes
Üzüm Bağı Hasat|vineyard rows at harvest with crates of grapes under the vines
Zeytin Hasadı|olive grove with nets spread under silver trees
Pirinç Tarlası Sel|flooded rice paddy with seedlings reflecting the sky
Kümes|chicken coop yard with a wooden hen house and feeders
Arı Kovanları|row of beehives in a lavender field, with every surface rich in texture
Çiftlik Mutfağı|farmhouse kitchen interior with a big table, jars and herbs drying
Silo ve Ambar|grain silos and a red barn on a prairie
Ağıl Dağda|stone sheep pen high on a mountain pasture
Çay Toplama Yamacı|tea plantation slope with baskets left on rows
Kahve Kurutma Avlusu|coffee beans drying on a patio in the sun
Mantar Çiftliği|mushroom farm interior with dark shelves of fungi
Dikey Çiftlik|vertical farm interior with stacked hydroponic shelves under pink light
Su Değirmeni|water mill with a turning wheel and a stream
Yel Değirmeni Tarla|windmill on a ridge above patchwork fields, seen in a wide composition with clear depth
Saman Balyaları|round hay bales across a cut field at golden hour
Pazar Kamyoneti|farm truck loaded with crates of produce on a dirt road
Mısır Tarlası|tall cornfield with a path cutting through, with the space opening out behind
Ahır Kapısı Kar|barn doors in snow with a warm light inside
Sulama Kanalı|irrigation channel running between green fields, with deep perspective toward the far end
Çiftlik Evi Verandası|farmhouse porch with rocking chairs and a view of fields
Kazan Evi Pekmez|outdoor cauldron for boiling grape molasses under a tree
Ambar Çatı Arası|hayloft interior with beams, ropes and dusty light
At Ahırı|horse stable interior with wooden stalls and saddles
Lavanta Damıtma|lavender distillery interior with copper stills, in hushed stillness with dust drifting in the light
Pamuk Hasadı|cotton field with bales piled at the edge
` });


  G.push({ id: 'b7-sports', tr: 'Spor Tesisleri & Soyunma Odaları', arch: 'arena', ctx: 'mixed', engines: ['stadium', 'homeint', 'pool', 'godrays'], cond: ['busy-but-empty', 'empty', 'lit', 'quiet', 'weathered'], genres: ['work', 'daily', 'modern'], items: `
Soyunma Odası|locker room interior with wooden benches, jerseys hanging and a tactics board
Boks Salonu|boxing gym interior with a ring under hanging lamps and heavy bags
Olimpik Havuz|olympic swimming pool interior with lane ropes and still blue water
Buz Pateni Pisti|ice rink interior with fresh smooth ice and empty stands
Tenis Kortu Gece|clay tennis court at night under floodlights, framed with strong foreground depth and detail
Futbol Sahası Tünel|players tunnel interior leading out to a bright pitch
Basketbol Salonu|basketball arena interior with a polished court and banners without text
Tırmanış Duvarı|indoor climbing gym interior with colourful holds on angled walls
Bowling Salonu|bowling alley interior with lanes glowing and pins at the end
Güreş Minderi|wrestling hall interior with a large mat and ropes on the wall
Atletizm Pisti|athletics track with lane lines curving around an empty stadium
Kayak Atlama Rampası|ski jump ramp above a snowy valley, with every surface rich in texture
Hipodrom|horse racing track with white rails and a grandstand at dawn
Golf Sahası Sis|golf course fairway in morning fog with a flag on the green
Kaykay Parkı|concrete skatepark with bowls and ramps at sunset
Fitness Salonu Gece|gym interior at night with weight racks and mirrors
Sauna|wooden sauna interior with hot stones and a bucket
Yüzme Havuzu Atlama Kulesi|diving tower over a deep pool interior, with every surface worn smooth by daily use
Velodrom|velodrome interior with a steep banked wooden track
Hamam Spor Kulübü|old athletic club interior with tiled walls and wooden lockers
Mahalle Halı Sahası|neighbourhood pitch caged in nets under floodlights, with the space opening out behind
Kürek Kulübü|rowing club boathouse interior with racks of long boats
Sahil Voleybolu|beach volleyball court with a net at sunset
Masa Tenisi Salonu|table tennis hall interior with rows of tables
Eskrim Salonu|fencing salle interior with long pistes and masks on hooks
Dövüş Kafesi|mixed martial arts cage interior under a single spotlight
Stadyum Tribün Arka|stadium concourse interior with concrete ramps and stalls closed
Spor Malzeme Deposu|equipment storage interior with balls in nets and cones
Antrenman Sahası Yağmur|training pitch in rain with cones and goals
Masaj ve Fizik Odası|sports therapy room interior with massage tables and ice baths
` });

  G.push({ id: 'b7-museum', tr: 'Müzeler & Sanat Galerileri', arch: 'palace', ctx: 'int', engines: ['room3d', 'hall', 'godrays', 'homeint'], cond: ['pristine', 'quiet', 'empty', 'lit', 'ancient'], genres: ['work', 'interior', 'history', 'modern'], items: `
Beyaz Küp Galeri|white cube gallery interior with polished concrete and a single large canvas
Doğa Tarihi Salonu|natural history museum hall interior with a dinosaur skeleton under a vaulted roof
Antik Heykeller Salonu|sculpture gallery interior with marble statues on plinths and skylights
Rönesans Resim Galerisi|old masters gallery interior with red walls and gilded frames
Gece Müzesi|museum gallery interior at night lit only by exit signs and display cases
Mısır Eserleri Salonu|egyptology gallery interior with sarcophagi in glass cases
Müze Deposu|museum storage interior with crated artefacts and rolling racks
Restorasyon Atölyesi|conservation studio interior with a painting on an easel under lamps
Bilim Müzesi|science museum hall interior with a hanging rocket and models
Uzay Müzesi Kapsül|space museum interior with a capsule and suits in cases
Modern Sanat Enstalasyonu|contemporary art installation interior with mirrored rooms of light
Fotoğraf Sergisi|photography exhibition interior with framed prints and track lights
Silah Zırh Galerisi|armour gallery interior with knights armour on stands
Mineral Koleksiyonu|mineral gallery interior with glowing crystals in cases
Kelebek Koleksiyonu|entomology room interior with drawers of pinned butterflies
Müze Merdiveni|grand museum staircase interior with a dome above
Açık Hava Müzesi|open-air museum with old houses and paths, with deep perspective toward the far end
Denizcilik Müzesi|maritime museum hall interior with a full ship hull
Oyuncak Müzesi|toy museum interior with glass cabinets of antique toys
Balmumu Heykel Salonu|wax gallery interior with velvet ropes and dim spotlights
Sanat Galerisi Açılış Öncesi|gallery interior before an opening with wine glasses lined up
Heykel Bahçesi|sculpture garden with abstract bronze works on a lawn
Müze Çatı Kubbesi|museum glass dome atrium interior with a spiral ramp
Arkeoloji Kazı Sergisi|excavation exhibit interior with a glass floor over ruins
Etnografya Odası|ethnography room interior with textiles and masks in cases
Planetaryum|planetarium dome interior with reclined seats and a star projector
Müze Kafesi|museum café interior overlooking a sculpture court, in hushed stillness with dust drifting in the light
Müze Hediyelik Kapanış|closed museum shop interior with shutters half down
Galeri Koridoru Simetrik|long gallery corridor interior with symmetrical paintings, with layered depth and textured surfaces
Sanat Okulu Kritik Odası|art school critique room interior with works pinned up
` });

  G.push({ id: 'b7-library', tr: 'Kütüphaneler & Arşivler', arch: 'palace', ctx: 'int', engines: ['library3d', 'room3d', 'godrays', 'hall'], cond: ['quiet', 'ancient', 'dusty', 'candlelit', 'pristine'], genres: ['work', 'interior', 'history', 'fantasy'], items: `
Barok Kütüphane|baroque library hall interior with gilded galleries and painted ceilings
Kubbeli Okuma Salonu|domed reading room interior with radial desks and green lamps
Manastır Kütüphanesi|monastery library interior with chained books and stone arches
Gizli Raf Kapısı|secret bookcase door interior swinging open onto a dark passage
Arşiv Mahzeni|underground archive vault interior with endless rolling shelves
Harita Odası|map room interior with large plan chests and globes
Mahkeme Arşivi|court records room interior with ledgers stacked to the ceiling
Modern Halk Kütüphanesi|modern public library interior with white curves and big windows
Çocuk Kütüphanesi|children's library interior with low shelves and reading cushions
Gece Kütüphane|library interior at night with a single reading lamp on
El Yazmaları Odası|manuscript room interior with illuminated pages under glass
Gazete Arşivi|newspaper morgue interior with bound volumes and microfilm readers
Film Arşivi|film archive vault interior with cans of reels on cold shelves
Kartoteks Odası|card catalogue room interior with endless tiny wooden drawers
Sahaf|second-hand bookshop interior with towers of books and a ladder
Büyücü Kütüphanesi|wizard's library interior with floating candles and spiral stairs
Kütüphane Merdiveni|spiral staircase interior inside a library tower, seen in a wide composition with clear depth
Üniversite Arşivi|university archive interior with grey boxes and a reading desk
Gezici Kütüphane Otobüsü|bookmobile interior lined with shelves, with every surface worn smooth by daily use
Kum Altında Kütüphane|ancient library half buried in sand with broken columns
Kütüphane Avlusu|library cloister courtyard with a fountain and arches
Okuma Kabini|private study carrel interior with a lamp and stacked notes
Dijital Arşiv Sunucu|digital archive interior with glowing storage racks, with every object carefully in place
Dosya Odası Polis|police evidence and records room interior with numbered boxes
Kütüphane Çatı Arası|library attic interior with crates of old books and skylight
Su Basmış Kütüphane|flooded library interior with books floating and light from windows
Tapınak Parşömen Odası|temple scroll room interior with pigeonhole shelves, with deep perspective toward the far wall
Kitap Restorasyon|book conservation lab interior with presses and paper
Yağmurlu Pencere Okuma Köşesi|library window nook interior with rain on glass
Sonsuz Kütüphane|infinite library interior of hexagonal galleries repeating, in hushed stillness with dust drifting in the light
` });

  G.push({ id: 'b7-theatre', tr: 'Tiyatro, Opera & Konser Salonları', arch: 'palace', ctx: 'int', engines: ['hall', 'room3d', 'anamorphic', 'godrays', 'smoke'], cond: ['opulent', 'quiet', 'lit', 'dramatic', 'decaying'], genres: ['work', 'interior', 'history', 'cine'], items: `
Opera Salonu|opera house auditorium interior with red velvet tiers and a giant chandelier
Boş Sahne Tek Spot|bare theatre stage interior lit by a single spotlight and a ghost light
Kulis Aynaları|dressing room interior with bulb-framed mirrors and costumes
Sahne Arkası Halatlar|backstage fly tower interior with ropes, sandbags and catwalks
Senfoni Salonu|concert hall interior with wooden shells and an organ above the stage
Orkestra Çukuru|orchestra pit interior with music stands and chairs
Rock Konseri Sahnesi|arena concert stage with truss lights and haze before a show
Caz Kulübü|jazz club interior with a small stage, piano and candlelit tables
Terk Edilmiş Tiyatro|abandoned theatre interior with collapsed seats and torn curtains
Kukla Tiyatrosu|puppet theatre interior with a tiny proscenium and marionettes hanging
Açık Hava Amfi|ancient open-air amphitheatre at dusk, framed with strong foreground depth and detail
Kostüm Deposu|costume store interior with racks of period dresses and hats
Sahne Dekor Atölyesi|scenery workshop interior with painted flats and scaffolding
Konser Kulisi Koridoru|concert backstage corridor interior with flight cases and cables
Sirk Çadırı İçi|circus big top interior with a ring and trapeze rigging
Bale Stüdyosu|ballet studio interior with barres, mirrors and tall windows
Kabare Sahnesi|cabaret stage interior with a fringe curtain and small round tables
Kayıt Stüdyosu|recording studio control room interior with a mixing desk and glass booth
Prova Odası|rehearsal room interior with drums, amps and egg-crate foam
Sinema Salonu|old cinema auditorium interior with plush seats and a glowing screen
Projeksiyon Kabini|projection booth interior with a film projector and reels
Gişe Lobi|theatre lobby interior with a box office and carpeted stairs
Festival Sahnesi Gece|open-air festival stage at night with laser beams in haze
Gölge Oyunu Perdesi|shadow puppet screen interior lit from behind by lamps
Sahne Tuzak Kapısı|under-stage trap room interior with lifts and mechanisms
Loca|private opera box interior with gilded rails and a view of the stage
Oda Müziği Salonu|chamber music salon interior with a grand piano and chairs
Sahne Işık Kulesi|lighting gallery interior with rows of stage lamps
Karaoke Bar|karaoke bar interior with a small stage and neon
Tiyatro Çatısı|theatre rooftop with the dome and city lights
` });

  G.push({ id: 'b7-nightmarket', tr: 'Gece Pazarları & Sokak Yemekleri', arch: 'street', ctx: 'ext', engines: ['market', 'street3d', 'smoke', 'city'], cond: ['busy-but-empty', 'lit', 'wet', 'lived-in', 'smoky'], genres: ['street', 'daily', 'world', 'urban'], items: `
Tayvan Gece Pazarı|Taiwanese night market street with rows of glowing food stalls and steam
Bangkok Seyyar Arabalar|Bangkok street with food carts, woks and plastic stools under bulbs
Marakeş Meydanı Gece|Marrakech square at night with smoking grill stalls and lanterns
Kızarmış Kestane Arabası|roasted chestnut cart on a winter street corner glowing
Midyeci Tezgahı|stuffed mussel stand on an Istanbul pavement at night
Hong Kong Dai Pai Dong|Hong Kong open-air food stall with folding tables under a flyover
Ramen Yatai|Japanese yatai food cart with a red lantern on a dark street
Meksika Taco Standı|Mexican taco stand with a grill, salsa bowls and fairy lights
Hint Chai Tezgâhı|Indian chai stall with kettles on a fire and clay cups
Balık Ekmek Teknesi|fish sandwich boats rocking at a waterfront with grills smoking
Kore Pojangmacha|Korean street tent bar with orange plastic walls lit from inside
Noel Pazarı|Christmas market with wooden huts, lights and mulled wine stalls
Ramazan Sokağı|street decorated with lanterns for a Ramadan night market
Vietnam Pho Köşesi|Vietnamese pho corner with low stools and big pots
Seyyar Kokoreç|kokoreç grill cart with a rotating spit and bread
Fast Food Kamyonu Parkı|food truck park at night with string lights and picnic tables
Pazar Sabahı Kurulum|market stalls being set up at dawn with crates and tarps
Bit Pazarı|flea market lane with tables of old objects under umbrellas
Balık Pazarı Gece|night fish market with ice trays under hanging bulbs
Baharat Çarşısı|spice market lane with mounds of coloured spices
Meyve Tezgahları Yağmur|fruit stalls under tarps in the rain, with every surface rich in texture
Simitçi Sabah|bread-ring vendor's cart on a foggy morning bridge
Sokak Izgarası Duman|smoky skewer grill stall at night, seen in a wide composition with clear depth
Yüzen Pazar|floating market of boats loaded with fruit on a canal
Kumpir Tezgahları|row of baked potato stalls on a seafront
Kapanmış Pazar|night market street after closing with shutters down and litter
Çiçek Pazarı|flower market at dawn with buckets of blooms
Dondurmacı Arabası|ice cream cart on a sunny promenade, with the space opening out behind
Döner Vitrini Gece|street-facing kebab window glowing on a dark street
Çin Mahallesi Fenerleri|Chinatown street with red lanterns strung overhead, with deep perspective toward the far end
` });

  G.push({ id: 'b7-garage', tr: 'Garajlar, Tamirhaneler & Otoparklar', arch: 'industrial', ctx: 'mixed', engines: ['homeint', 'corridor', 'street3d', 'smoke', 'rainglass'], cond: ['messy', 'lived-in', 'rusted', 'busy-but-empty', 'dark'], genres: ['work', 'urban', 'modern'], items: `
Oto Tamirhanesi|car repair garage interior with a lift, tools on the wall and oil stains
Çok Katlı Otopark Gece|multistorey car park interior at night with flickering tube lights
Yeraltı Otoparkı|underground car park interior with concrete pillars and painted bays
Klasik Araba Restorasyon|classic car restoration shop interior with a stripped body on stands
Motosiklet Atölyesi|motorcycle workshop interior with bikes and chrome parts
Lastikçi|tyre shop interior with stacks of tyres and a balancing machine
Oto Yıkama|car wash tunnel interior with giant brushes and foam
Boya Kabini|spray paint booth interior with filters and a car masked off
Hurdalık|scrapyard with piles of crushed cars and a crane
Benzinlik Gece|petrol station at night under a glowing canopy
Çatı Otoparkı|rooftop car park at sunset with the city around
Ev Garajı|suburban garage interior with a workbench, bikes and boxes
Kamyon Garajı|truck depot interior with big rigs and wash bays
Otobüs Deposu|bus depot interior with rows of buses parked at night
Yarış Pit Garajı|race team pit garage interior with a car on stands and tyre warmers
Şoför Dinlenme Tesisi|truck stop at night with lights and parked lorries
Elektrikli Araç Şarj|EV charging hub at night with glowing chargers
Kaporta Atölyesi|panel beating shop interior with dented doors and hammers
Vale Otoparkı|valet parking ramp with polished cars and a booth
Taksi Garajı|taxi garage interior with yellow cabs in rows
Terk Edilmiş Benzinlik|abandoned roadside gas station in the desert, with layered depth and fine weathered textures
Otopark Rampası|spiral car park ramp interior with painted arrows
Yedek Parça Deposu|auto parts store interior with shelves of boxed parts
Garaj Kapısı Yağmur|roller garage door half open in the rain with light inside
Karavan Tamir|camper van workshop interior with a van being fitted out
Polis Çekme Sahası|police impound lot with fenced cars at night
Oto Galeri|car showroom interior with polished floor and a spotlighted car
Hava Kompresörü Köşesi|grimy garage corner interior with compressor and hoses
Lowrider Atölyesi|custom car shop interior with candy paint and chrome
Karlı Otopark|open car park covered in snow with buried cars
` });

  G.push({ id: 'b7-rooftop', tr: 'Çatılar & Şehir Tepeleri', arch: 'street', ctx: 'ext', engines: ['rooftop', 'skyline', 'metro3d', 'clouds'], cond: ['quiet', 'windswept', 'lit', 'wet', 'lived-in'], genres: ['urban', 'street', 'daily', 'modern'], items: `
New York Su Tankları|New York rooftops with wooden water towers at sunset
İstanbul Çatıları Martılar|Istanbul rooftops with chimneys, satellite dishes and minarets beyond
Paris Çinko Çatılar|Parisian zinc rooftops with chimney pots at dusk
Gökdelen Tepesi|skyscraper roof edge high above the city with antenna masts
Çatı Bahçesi|rooftop vegetable garden with raised beds and a greenhouse
Çatı Barı|rooftop bar with lounge seating and city lights
Helikopter Pisti Gece|rooftop helipad at night with landing lights, framed with strong foreground depth and detail
Çatıda Çamaşır İpleri|rooftop with laundry lines and potted plants, with every surface rich in texture
Tokyo Çatı Golf Ağı|Tokyo rooftop with a golf practice net and neon below
Çatı Klima Üniteleri|rooftop with rows of humming AC units and ducts
Kubbe ve Minare Arası|roofs between domes and minarets at sunrise, seen in a wide composition with clear depth
Çatı Havuzu Gece|rooftop pool lit turquoise among towers, with the space opening out behind
Hong Kong Çatı Köyü|Hong Kong rooftop shanty village between towers, with deep perspective toward the far end
Çatı Kafesi Gün Batımı|rooftop café with cushions and the sea at sunset
Yangın Merdiveni Tepesi|top of a fire escape onto a tarred roof
Saat Kulesi Tepesi|inside the top of a clock tower behind the glowing dial
Güneş Paneli Çatısı|roof covered in solar panels above suburbs, with layered depth and fine weathered textures
Kilise Çan Kulesi|bell tower with bells and a view over rooftops
Çatı Anteni Ormanı|forest of TV antennas on old rooftops, framed with strong foreground depth and detail
Kar Kaplı Çatılar|snowy rooftops with smoking chimneys at dusk, with every surface rich in texture
Çatı Sineması|rooftop cinema with deckchairs and a screen, seen in a wide composition with clear depth
Neon Tabela Arkası|behind a giant rooftop neon sign frame, with the space opening out behind
Çatı Kümesi Güvercin|rooftop pigeon loft with wooden coops, with deep perspective toward the far end
Çatıda Yağmur Gece|wet rooftop at night with puddles reflecting signs
Kiremit Çatılar Toskana|terracotta roofs of a hill town at golden hour
Çatı Kenarı Sis|roof edge disappearing into fog, with layered depth and fine weathered textures
Gözlem Terası|observation deck with coin telescopes above the city
Fabrika Bacası Tepe|top of an old factory chimney stack, framed with strong foreground depth and detail
Çatı Arası Pencere|dormer window opening onto rooftops, with every surface rich in texture
Gökdelen İnşaat Tepesi|top of a skyscraper under construction with cranes
` });

  G.push({ id: 'b7-metro', tr: 'Metro & Yeraltı Ulaşımı', arch: 'industrial', ctx: 'int', engines: ['station', 'tunnel', 'corridor', 'metro3d'], cond: ['busy-but-empty', 'empty', 'lit', 'weathered', 'eerie'], genres: ['urban', 'work', 'modern', 'daily'], items: `
Moskova Metro Avizeli|ornate Moscow metro station interior with chandeliers and marble arches
Londra Tüp Peronu|London tube platform interior with curved tiles and a train arriving
New York Metro Gece|New York subway platform interior at night with steel columns
Tokyo Metro Koridoru|clean Tokyo metro corridor interior with tactile paving and signs without text
Terk Edilmiş Metro İstasyonu|abandoned metro station interior with dusty tiles and dim lights
Metro Vagonu Boş|empty metro carriage interior swaying with fluorescent light
Metro Tüneli Raylar|metro tunnel with rails curving into darkness and signal lights
Yürüyen Merdiven Derin|very long escalators descending into a deep station
Metro Kontrol Merkezi|metro control room interior with track diagrams glowing
Metro Bakım Deposu|metro maintenance depot interior with trains over pits
Turnikeler|metro ticket barriers interior with glowing gates, with every surface worn smooth by daily use
Stockholm Mağara İstasyon|painted rock-cave metro station interior, with every object carefully in place
Fütüristik Metro|futuristic metro station interior with white curves and glass doors
Metro Çıkışı Yağmur|metro exit stairs to a rainy street, with deep perspective toward the far end
Servis Tüneli|service tunnel interior with pipes and caged lights
Metro Platform Simetri|symmetrical platform interior with trains on both sides
Yeraltı Çarşısı|underground shopping passage interior with closed shops, in hushed stillness with dust drifting in the light
Tramvay Deposu|tram depot interior with vintage trams, with layered depth and textured surfaces
Yeraltı Su Sarnıcı|ancient cistern interior with columns in water, seen in a wide composition with clear depth
Kanalizasyon|sewer tunnel interior with brick arches and a stream
Metro Gece Temizlik|station interior at night with a cleaning machine and wet floor
Füniküler|funicular car interior climbing a steep tunnel, with every surface worn smooth by daily use
Metro Asansör Kuyusu|lift shaft interior in a deep station, with every object carefully in place
Bomba Sığınağı İstasyon|old station used as an air raid shelter with bunks
Metro Duvar Mozaiği|station hall interior with large abstract mosaics, with deep perspective toward the far wall
Kavşak İstasyonu|interchange station interior with crossing walkways, in hushed stillness with dust drifting in the light
Yeraltı Otoyol Tüneli|road tunnel interior with orange lights streaming, with layered depth and textured surfaces
Havaalanı Treni|airport shuttle train interior with luggage racks, seen in a wide composition with clear depth
Metro Penceresinden Tünel|view from the driver window into a lit tunnel
Kapanış Saati İstasyon|station interior at closing time with shutters coming down
` });

  G.push({ id: 'b7-fishingtown', tr: 'Sahil Kasabaları & Balıkçı Limanları', arch: 'water', ctx: 'ext', engines: ['harbor', 'ocean', 'street3d', 'clouds'], cond: ['calm', 'weathered', 'misty', 'lived-in', 'windswept'], genres: ['daily', 'landscape', 'world', 'street'], items: `
Ege Balıkçı Barınağı|Aegean fishing harbour with blue and white boats and nets drying
Norveç Rorbu|Norwegian red fishing cabins on stilts by a fjord
Cornwall Limanı|Cornish harbour at low tide with boats resting on sand
Portekiz Balıkçı Köyü|Portuguese fishing village with colourful boats on the beach
Japon Liman Kasabası|Japanese harbour town with fishing boats and hillside houses
Maine Istakoz Rıhtımı|Maine lobster wharf with traps stacked and a lighthouse
Karadeniz Limanı|Black Sea harbour with wooden boats and green hills
İtalyan Sahil Köyü|Italian cliffside village above a tiny harbour, seen in a wide composition with clear depth
İzlanda Balıkçı Kasabası|Icelandic fishing town with corrugated houses and mountains
Vietnam Sepet Tekneler|Vietnamese beach with round basket boats, with the space opening out behind
Sisli Balıkçı İskelesi|wooden fishing pier in fog, with deep perspective toward the far end
Dalgakıran Feneri|stone breakwater with a lighthouse at sunset, with layered depth and fine weathered textures
Balık Kurutma Rafları|wooden racks of drying fish by the sea
Sahil Meyhanesi|seaside tavern with tables by the water, framed with strong foreground depth and detail
Tekne Tamir Kızağı|boat slipway with a hull on a cradle
Kayık Rampası|small boat ramp at a rocky cove, with every surface rich in texture
Midye Çiftliği|mussel farm floats in a calm bay, seen in a wide composition with clear depth
Fırtınalı Liman|harbour in a storm with boats tossing, with the space opening out behind
Kış Liman Kasabası|harbour town in winter with snow on boats
Gelgit Çamuru|tidal mudflats with stranded boats, with deep perspective toward the far end
Sahil Kulübeleri|colourful beach huts in a row, with layered depth and fine weathered textures
Liman Merdivenleri|stone stairs leading down into harbour water, framed with strong foreground depth and detail
Ağ Ören Ambar|net loft interior with nets hanging from beams
Pazar Sabahı Balıkçı|morning fish market on the quay with crates
Kumsal Tekne Gece|boats pulled onto a beach under the moon
Liman Gün Doğumu|harbour at sunrise with mist on still water
Sahil Yolu Kasaba|coastal road through a small town with sea views
Plaj İskelesi Uzun|long wooden pier stretching into the sea, with every surface rich in texture
Balıkçı Kulübesi İç|fisherman's hut interior with oilskins and lanterns, with every surface worn smooth by daily use
Kayalık Koy Tekne|small boat anchored in a turquoise rocky cove
` });

  G.push({ id: 'b7-camping', tr: 'Kamp, Karavan & Doğa Tatili', arch: 'landscape', ctx: 'mixed', engines: ['countryside', 'forest', 'terrain3d', 'fire', 'mountains'], cond: ['calm', 'quiet', 'misty', 'lived-in', 'pristine'], genres: ['landscape', 'daily', 'nature', 'season'], items: `
Göl Kenarı Çadır|tent pitched by a mountain lake at dawn with mist
Kamp Ateşi Gece|campfire in a forest clearing at night with logs around
Karavan Parkı Gün Batımı|camper van parked on a cliff at sunset
Karavan İçi Yağmur|camper van interior on a rainy night with fairy lights
Orman Kulübesi|log cabin in a pine forest with smoke from the chimney
Çadır İçi Sabah|tent interior at sunrise with sleeping bags and the door open
Glamping Çadırı|glamping bell tent interior with a real bed and rugs
Çöl Kampı Yıldızlar|desert camp under a sky full of stars
Kano İskelesi|canoe dock on a still lake with canoes tied up
Dağ Barınağı|stone mountain refuge interior with bunks and a stove
Hamak Orman|hammocks strung between trees in a forest, with the space opening out behind
Kış Kampı|snow camp with a tent and skis at dusk
Sahil Kampı|tent on a beach with a fire and the sea
Ağaç Ev|treehouse on a big oak with a rope ladder
Kamp Mutfağı|camp kitchen with a gas stove and enamel mugs on a table
Nehir Kenarı Kamp|camp by a river with fishing rods leaning
Yayla Evi|highland summer house in a green pasture, with deep perspective toward the far end
Karavan Kampı Gece|row of caravans at night with lights and awnings
Çatı Çadırı|rooftop tent on a 4x4 overlooking a valley
Bungalov Göl|bungalow on stilts over a lake, with layered depth and fine weathered textures
Yürüyüş Patikası|hiking trail through ferns and moss, framed with strong foreground depth and detail
Gözlem Kulesi Orman|fire lookout tower above a forest, with every surface rich in texture
Kamp Sandalyesi Manzara|folding chairs facing a mountain view, seen in a wide composition with clear depth
Bisiklet Turu Molası|loaded touring bikes resting by a country road
Tekne Evi|houseboat moored on a canal with plants, with the space opening out behind
Mağara Kampı|camp inside the mouth of a large cave
Kuzey Işıkları Kamp|tent under the aurora in snow, with deep perspective toward the far end
Sisli Vadi Çadırı|tent above a valley filled with fog, with layered depth and fine weathered textures
Sonbahar Kamp|camp in an autumn forest with red leaves
Kamp Alanı Sabah Kahvesi|camp morning with a kettle on a stove and steam
` });

  G.push({ id: 'b7-funfair', tr: 'Lunapark & Panayır', arch: 'arena', ctx: 'ext', engines: ['market', 'orbs', 'anamorphic', 'city', 'synthwave'], cond: ['lit', 'busy-but-empty', 'abandoned', 'eerie', 'decaying'], genres: ['daily', 'cine', 'horror'], items: `
Dönme Dolap Gece|Ferris wheel at night glowing with bulbs against a dark sky
Atlı Karınca|carousel with painted horses under warm lights, framed with strong foreground depth and detail
Hız Treni Rayları|rollercoaster track loops silhouetted at sunset, with every surface rich in texture
Terk Edilmiş Lunapark|abandoned amusement park with rusting rides and weeds
Çarpışan Arabalar|bumper car arena interior under a sparking ceiling grid
Panayır Çadırları|travelling fair tents and stalls with string lights
Atış Poligonu Oyunu|carnival game booth with prizes hanging and targets
Pamuk Şeker Arabası|candy floss cart glowing pink, seen in a wide composition with clear depth
Korku Tüneli Girişi|ghost train entrance with painted skull facades, with the space opening out behind
Aynalı Labirent|hall of mirrors interior with endless reflections, with deep perspective toward the far wall
Sahil İskelesi Lunapark|seaside pier amusement park with rides over the water
Su Kaydırağı Parkı|water park slides twisting over empty pools, with layered depth and fine weathered textures
Kış Panayırı|winter fair with ice rink and huts under snow
Sirk Arabaları|circus wagons parked in a field at dusk
Uçan Sandalye|swing ride spinning against the sky, framed with strong foreground depth and detail
Lunapark Kapanış|amusement park after closing with lights going off
Fal Kabini|fortune teller booth with a mechanical figure in glass
Lunapark Girişi Kemer|grand illuminated entrance arch of a fair, with every surface rich in texture
Retro Atari Salonu|arcade hall interior with glowing cabinets, with every surface worn smooth by daily use
Kurbağa Oyunu Tezgahı|ring toss stall with bottles and lights, with the space opening out behind
Lunapark Sisli Sabah|rides in morning fog with no lights, with deep perspective toward the far end
Pandemonium Işıklar|blurred lights of spinning rides at night, with layered depth and fine weathered textures
Gondol Kanalı Park|theme park canal with gondolas and fake facades
Mini Tren|kiddie train with small carriages around a track
Panayır Hayvan Çadırı|county fair livestock barn interior with pens and ribbons
Lunapark Tamir Atölyesi|ride maintenance shed interior with parts, with layered depth and textured surfaces
Dev Salıncak Gemi|pirate ship swing ride against sunset, with every surface rich in texture
Tema Parkı Kale|theme park castle facade lit at night, seen in a wide composition with clear depth
Yağmurlu Panayır|fairground in rain with reflections of lights, with the space opening out behind
Lunapark Arka Bahçesi|backlot of a fair with trailers and cables
` });

  G.push({ id: 'b7-wedding', tr: 'Düğün & Kutlama Mekânları', arch: 'palace', ctx: 'mixed', engines: ['homeint', 'orbs', 'godrays', 'room3d'], cond: ['opulent', 'lit', 'pristine', 'busy-but-empty', 'calm'], genres: ['daily', 'interior', 'modern'], items: `
Düğün Salonu Masalar|wedding hall interior with round tables, white linen and floral centrepieces
Bahçe Düğünü Kemer|garden wedding arch of flowers with rows of chairs on a lawn
Sahil Düğün|beach wedding aisle with petals and an arbour facing the sea
Kır Düğünü Ahır|rustic barn wedding interior with fairy lights and hay bales
Kına Gecesi Salonu|henna night venue interior with red velvet and lanterns
Pasta Masası|wedding cake table interior with a tall white cake under lights
Dans Pisti Gece|dance floor interior with a disco ball and confetti
Gelin Odası|bridal suite interior with a dress hanging by the window
Kilise Düğünü|church interior decorated with white flowers along the pews
Hint Düğün Mandap|Indian wedding mandap with marigolds and drapes, with deep perspective toward the far end
Doğum Günü Partisi|birthday party room interior with balloons and a cake
Mezuniyet Balosu|prom venue interior with streamers and a photo backdrop
Yılbaşı Partisi|new year party interior with gold balloons and champagne glasses
Teras Nişanı|engagement dinner on a terrace with candles and sea view
Bekarlığa Veda Masası|party table interior with neon sign without text and drinks
Çocuk Partisi|kids party interior with a bouncy castle and garlands
Düğün Sonrası Salon|wedding hall interior after the party with scattered petals
Gala Davet Salonu|gala dinner hall interior with long tables and candelabras
Kutlama Havai Fişek|fireworks over a lake celebration venue, with layered depth and fine weathered textures
Masa Düzeni Altın|gold-themed table setting interior close detail, with layered depth and textured surfaces
Bahçe Parti Işıkları|garden party with festoon lights and lanterns at dusk
Yat Partisi|yacht deck set for a party at sunset
Sünnet Salonu|circumcision feast hall interior with a decorated throne bed
Davet Girişi|celebration venue entrance with a floral wall and candles
Fotoğraf Köşesi|photo booth backdrop interior with props, seen in a wide composition with clear depth
Kır Pikniği Kutlama|picnic celebration with blankets and cakes in a meadow
Düğün Arabası|vintage car decorated with ribbons outside a venue
Kutlama Masası Ev|family celebration table interior at home with dishes
Balo Salonu Avize|ballroom interior with mirrors and chandeliers, with every surface worn smooth by daily use
Düğün Çadırı Gece|wedding marquee glowing in a field at night
` });

  G.push({ id: 'b7-festive', tr: 'Bayram & Festival Süslemeleri', arch: 'street', ctx: 'mixed', engines: ['orbs', 'market', 'street3d', 'homeint', 'fire'], cond: ['lit', 'lived-in', 'busy-but-empty', 'quiet', 'snowbound'], genres: ['daily', 'world', 'season', 'street'], items: `
Ramazan Mahyası|mosque minarets with a lit mahya hanging between them at night
Bayram Sofrası|holiday table interior with sweets, tea and an embroidered cloth
Noel Sokağı|street decorated with Christmas lights and garlands in snow
Noel Ağacı Oturma Odası|living room interior with a lit Christmas tree and presents
Diwali Kandilleri|street lined with oil lamps and rangoli for Diwali
Çin Yeni Yılı Fenerleri|street hung with red lanterns for Lunar New Year
Ölüler Günü Sunağı|Day of the Dead altar interior with marigolds and candles
Hıdrellez Ağacı|tree hung with wishes and ribbons at dusk
Cadılar Bayramı Verandası|porch decorated with carved pumpkins at night, with the space opening out behind
Nevruz Ateşi|spring festival bonfire in a village square, with deep perspective toward the far end
Hanami Kiraz Parkı|park under cherry blossoms with picnic mats, with layered depth and fine weathered textures
Fener Festivali Nehir|river covered with floating paper lanterns at night
Karnaval Sokağı|street after a carnival with confetti and streamers
Paskalya Masası|Easter table interior with painted eggs and flowers
Yılbaşı Meydanı|city square with a giant tree and lights
Hanuka Penceresi|window sill interior with a menorah glowing, with layered depth and textured surfaces
Hasat Festivali|harvest festival barn with pumpkins and hay, with every surface rich in texture
Bayram Lunaparkı|holiday fair in a town square, seen in a wide composition with clear depth
Kurban Bayramı Sabahı|quiet village street on a holiday morning with flags
Kandil Gecesi Cami Avlusu|mosque courtyard at night with lights, with the space opening out behind
Holi Renkleri Sokak|street dusted with coloured powder after a festival
Noel Pazarı Kulübeleri|wooden market huts glowing in snow, with deep perspective toward the far end
Yeni Yıl Havai Fişek|fireworks over a harbour at midnight, with layered depth and fine weathered textures
Gece Fener Alayı Yolu|path lined with lanterns through a park, framed with strong foreground depth and detail
Bayram Şekeri Tepsisi|tray of candies and cologne interior close detail
Festival Bayrakları|street hung with bunting flags under blue sky
Sükkot Çardağı|harvest hut with greenery roof and fruit, with every surface rich in texture
Kış Gündönümü Mumları|room interior lit by dozens of candles, with every surface worn smooth by daily use
Ay Festivali Bahçe|garden with mooncake table under a full moon
Cumhuriyet Bayramı Caddesi|avenue hung with red flags for a national holiday
` });

  G.push({ id: 'b7-emergency', tr: 'Polis, İtfaiye & Acil Durum Mekânları', arch: 'daily', ctx: 'mixed', engines: ['homeint', 'corridor', 'street3d', 'fire', 'smoke'], cond: ['busy-but-empty', 'alert', 'lit', 'quiet', 'smoky'], genres: ['work', 'urban', 'cine', 'modern'], items: `
İtfaiye Garajı|fire station garage interior with red engines and hanging gear
İtfaiye Direği|fire station pole room interior with a brass pole through the floor
Polis Merkezi Ofis|police precinct office interior with desks and a holding cell
Sorgu Odası|interrogation room interior with a metal table and one-way mirror
Delil Odası|evidence room interior with bagged items on shelves
Nezarethane|holding cell interior with a bench and bars
Polis Arabası Gece|patrol car parked on a wet street with lights flashing
Acil Çağrı Merkezi|emergency dispatch centre interior with screens and maps
Kurtarma Helikopteri|rescue helicopter on a pad with rotors still
Sahil Cankurtaran Kulesi|lifeguard tower on an empty beach, with the space opening out behind
Yanan Bina Sonrası|burnt apartment interior after a fire with charred walls
İtfaiye Eğitim Kulesi|fire training tower with ladders and smoke, with deep perspective toward the far end
Olay Yeri Şeridi|street cordoned with tape and evidence markers at night
Adli Tıp Laboratuvarı|forensic lab interior with microscopes and evidence, in hushed stillness with dust drifting in the light
Kurtarma Ekipman Deposu|rescue gear store interior with ropes and helmets
Ambulans İçi|ambulance interior with a stretcher and monitors, with layered depth and textured surfaces
Polis Atış Poligonu|police shooting range interior with lanes and targets
Afet Koordinasyon Çadırı|disaster response tent interior with maps and radios
Deprem Enkaz Alanı|collapsed building site with rubble and floodlights, with every surface rich in texture
Sel Kurtarma Sokağı|flooded street with rescue boats tied up, seen in a wide composition with clear depth
Orman Yangını Hattı|firebreak line with a burnt forest on one side
Gözetleme Kulesi Orman|forest fire lookout tower interior with maps, with every object carefully in place
Polis Arşiv Dosyaları|cold case files room interior with boxes, with deep perspective toward the far wall
Dedektif Bürosu|detective office interior with a corkboard of photos and string
Gümrük Kontrol Noktası|border checkpoint with barriers and booths at night
Acil Durum Sığınağı|emergency shelter interior with rows of cots, in hushed stillness with dust drifting in the light
Arama Kurtarma Köpek Kulübesi|rescue dog kennel area interior, with layered depth and textured surfaces
İtfaiye Yatakhanesi|firefighters bunk room interior, seen in a wide composition with clear depth
Tünel Kaza Alanı|road tunnel with emergency lights after an accident
Cankurtaran İstasyonu|lifeboat station with a boat on a slipway
` });

  G.forEach((g) => CB.addGroup(g));
})();
