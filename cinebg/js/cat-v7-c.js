/* CineBG Studio v7 — Sinema Türleri & Estetikler: 25 yeni kategori başlığı, her birinde 30 boş, sinematik mekân. */
(function () {
  const CB = window.CB;
  /* kısa tariflere grubun ruhuna uygun somut bir ayrıntı eklenir (her satıra farklı, sırayla) */
  const D = {
    drowned: ['green water lapping at the window sills', 'gulls perched on rusted railings above', 'silt drifting through slanting shafts of light'],
    synth80: ['a magenta haze glowing on the horizon', 'scanline shimmer over chrome surfaces', 'a striped sun sinking behind it all'],
    y2k: ['glossy reflections on every curved surface', 'soft lilac and aqua light everywhere', 'frosted plastic glowing from within'],
    liminal: ['fluorescent light humming over everything', 'an unsettling stillness and no sound at all', 'patterned carpet worn in a single path'],
    psych: ['a single cold light cutting through the dark', 'the air heavy and perfectly silent', 'long shadows stretching across the floor'],
    vapor: ['pastel pink and teal light washing over everything', 'a soft gradient sky fading to lavender', 'checkerboard tiles reflecting the glow'],
    samurai: ['mist hanging low between dark cedar trees', 'paper lanterns glowing softly in the dusk', 'wet stone paths reflecting a grey sky', 'falling petals drifting in still air', 'snow settling on curved tiled roofs'],
    neowest: ['heat shimmer rising off the cracked ground', 'a long shadow stretching across the dust', 'power lines running to an empty horizon', 'tumbleweeds caught against a wire fence'],
    superhero: ['searchlight beams sweeping low storm clouds', 'the city grid glowing far below', 'rain hammering on steel and glass', 'red aircraft lights blinking on every tower'],
    wuxia: ['mist drifting between jagged green peaks', 'wind rippling through silk banners', 'ink-wash clouds layered into the distance', 'pine trees clinging to vertical cliffs'],
    neonoir: ['neon smeared across wet asphalt', 'steam curling into a sodium-lit haze', 'rain streaking past a flickering sign', 'deep blue shadows and a single warm light'],
    bolly: ['marigold garlands and rose petals scattered everywhere', 'saturated jewel colours glowing in warm light', 'silk drapes moving in a gentle breeze', 'brass lamps casting golden pools of light'],
    cyberint: ['magenta and cyan neon reflected on wet surfaces', 'cables snaking across every wall and ceiling', 'holographic haze hanging in humid air', 'rain visible through a grimy window'],
    mecha: ['sparks raining down from welding gantries', 'hazard stripes glowing under harsh floodlights', 'steam venting from giant hydraulic joints', 'scale emphasised by tiny maintenance ladders'],
    airship: ['brass propellers and canvas balloons drifting past', 'golden light breaking through towering clouds', 'mooring ropes swaying high above the void', 'a sea of clouds stretching to the horizon'],
    atlantis: ['shafts of blue light falling through deep water', 'schools of silver fish drifting between the stones', 'bioluminescent glow pulsing in the dark', 'fine silt suspended in the still current'],
    fairy: ['soft glowing spores drifting in the air', 'thick moss and ferns covering every surface', 'shafts of green-gold light through the canopy', 'a faint shimmering mist at ground level'],
    dragon: ['embers glowing in the warm stale air', 'firelight flickering across ancient stone', 'coins and gems catching faint light', 'deep echoing darkness beyond the light'],
    timetravel: ['light bending strangely around the edges', 'dust motes frozen motionless in the air', 'faint glowing rings of energy overhead', 'shadows falling in impossible directions'],
    dreams: ['soft pastel light with no visible source', 'everything perfectly silent and weightless', 'a horizon that curves gently upward', 'gentle haze dissolving the distance'],
    biopunk: ['soft bioluminescent veins pulsing in the walls', 'humid air thick with drifting spores', 'translucent membranes glowing green and amber', 'living tendrils curling over every edge'],
  };
  const enrich = (key, items) => {
    const d = D[key]; if (!d) return items;
    let k = 0;
    return items.trim().split('\n').map((l) => {
      const [tr, en] = l.split('|');
      return en.split(/\s+/).length < 8 ? `${tr}|${en}, ${d[k++ % d.length]}` : l;
    }).join('\n');
  };
  const G = (id, tr, arch, ctx, engines, cond, genres, items) => CB.addGroup({ id: 'c7-' + id, tr, arch, ctx, engines, cond, genres: ['cine'].concat(genres), items: enrich(id, items) });

  G('spy', 'Casusluk & Gizli Üsler', 'scifi', 'mixed', ['room3d', 'corridor', 'metro3d', 'tunnel', 'hall'], ['operational', 'alert', 'quiet', 'dark', 'pristine'], ['modern', 'interior'], `
Volkan İçi Gizli Üs|secret base interior carved inside a dormant volcano, steel catwalks over a glowing magma pit
Dağ Tepesi Dinleme İstasyonu|mountain-top listening station with white radar domes above a sea of clouds
Kitaplık Arkası Geçit|hidden study interior where a swinging bookcase reveals a lit steel corridor
Lazer Korumalı Kasa Koridoru|vault corridor interior crossed by thin red laser beams in light haze
Sualtı Gözetleme Odası|underwater observation room interior with a curved window onto dark ocean
Brutalist Ajans Binası|brutalist intelligence headquarters at night, rows of lit narrow windows in raw concrete
Harita Duvarlı Brifing Odası|briefing room interior with a glowing world map wall and a long black table
Gece Treni Kompartımanı|night train compartment interior with velvet seats and a dark landscape rushing past
Terk Edilmiş Soğuk Savaş Bunkeri|abandoned Cold War bunker interior, rusted consoles and green-painted blast doors
Kar Altında Buz Kampı|arctic research camp of orange modules half buried in drifting snow
Çatı Helikopter Pisti|rooftop helipad at night with landing lights ringing a wet circle above the city
Gizli Hangar|underground hangar interior with a sleek black jet under work lights
Kamuflajlı Dağ Kapısı|hidden blast door set into a granite cliff face disguised with rock panels
Elçilik Bahçesi Gece|embassy garden at night, manicured hedges, fountain and glowing ballroom windows
Güvenli Ev Mutfağı|safe house kitchen interior with blackout blinds and a single bulb over the table
Bilgisayar Sunucu Salonu|server hall interior of blue-lit racks receding into cold mist
Casino Arka Ofisi|casino back office interior with a wall of monitors and green-shaded lamps
Liman Konteyner Labirenti|maze of stacked shipping containers at night under orange floodlights
Telefon Kulübesi Sokağı|lonely red phone box on a fog-bound cobbled street under a gas lamp
Tren Garı Kilitli Dolaplar|station left-luggage hall interior with rows of steel lockers and a clock
Sualtı Denizaltı Kalemi|submarine pen interior where black water meets a concrete dock under arc lights
Ada Malikânesi|private island villa on black cliffs with infinity pools glowing at dusk
Gizli Laboratuvar Asansörü|elevator lobby interior of a hidden lab, brushed steel doors and a retina scanner glow
Dağ Yolu Viraj Kontrol Noktası|alpine border checkpoint on a hairpin road with a striped barrier and a hut
Opera Binası Çatı Arası|opera house roof space interior among giant rigging, ropes and a skylight
Kırmızı Telefonlu Komuta Odası|command room interior with a red phone on a desk under a single green lamp
Uzun Menzil Telsiz Kulesi|lattice radio mast on a windswept moor at twilight with blinking red lights
Lüks Yat Güvertesi|luxury yacht deck at night with teak boards, chrome rails and a dark harbour
Çöldeki Uydu Tarlası|field of white satellite dishes in a desert under a starry sky
Gece Yarısı Köprü Buluşma Noktası|stone bridge over a misty river at midnight, one lamp and wet cobbles
`);

  G('heist', 'Soygun Filmi Mekânları', 'urban', 'mixed', ['room3d', 'corridor', 'metro3d', 'street3d', 'hall'], ['quiet', 'dark', 'pristine', 'alert', 'busy-but-empty'], ['urban', 'interior', 'modern'], `
Banka Kasa Dairesi|bank vault interior with a massive round steel door and walls of deposit boxes
Mermer Banka Salonu|grand marble banking hall interior with brass teller cages and a high coffered ceiling
Müze Gece Galerisi|museum gallery interior at night, a single diamond case glowing under a spotlight
Kumarhane Kasa Odası|casino counting room interior with steel tables, carts and harsh overhead light
Havalandırma Kanalı|air duct interior seen from inside, slatted light from vents below
Çatı Lazer Kubbesi|glass skylight dome on a museum roof at night, city lights beyond
Kaçış Aracı Garajı|underground garage interior with a single muscle car under a fluorescent tube
Planlama Deposu|warehouse hideout interior with a pinned blueprint table and hanging bulbs
Mücevher Vitrin Odası|jewellery showroom interior with glowing glass cases on black velvet
Altın Külçe Deposu|gold reserve vault interior with stacked bullion on cages
Gece Yarısı Banka Önü|bank facade at midnight on an empty avenue, wet steps and columns
Asansör Boşluğu|elevator shaft interior seen from below, cables vanishing into darkness
Güvenlik Odası Monitörler|security room interior with a wall of monitors in a dark office
Sanat Deposu Raflar|art storage interior with tall racks of crated paintings and a hydraulic lift
Kanalizasyon Tüneli|brick sewer tunnel interior with a shallow stream and a ladder of light
Zırhlı Araç Rampası|loading bay of an armoured-car depot under sodium lamps
Penthouse Kasa Duvarı|penthouse study interior with a hidden wall safe behind a painting
Tren Posta Vagonu|mail train carriage interior with sorted sacks and swinging lamps
Çatı Kaçış Rotası|rooftops of a dense city at night with a zipline cable stretched across
Kumarhane Salonu Boş|empty casino floor interior at dawn, slot machines still glowing
Elmas Kesim Atölyesi|diamond cutting workshop interior with lamps and microscopes on a bench
Liman Teslim Noktası|night quay with a crane, wet bollards and a lone van parked
Saat Kulesi İçi|clock tower interior among giant gears with light through the clock face
Müze Lobi Lazerleri|museum lobby interior crossed by faint security beams, marble statues around
Kaçış Tüneli Ucu|freshly dug tunnel interior lit by a string of work lights
Sınır Ötesi Uçak Pisti|abandoned airstrip at dusk with a small plane and windsock
Kumarhane Çatı Tabelası|casino rooftop behind a giant glowing sign frame, cables and vents
Yeraltı Otoparkı Takas|empty underground car park interior, two cars facing each other under flickering light
Lüks Otel Koridoru|luxury hotel corridor interior with patterned carpet and identical doors
Tarihi Darphane|historic mint interior with old coin presses and brass railings
`);

  G('racing', 'Yarış & Otomobil Kültürü', 'urban', 'mixed', ['street3d', 'metro3d', 'stadium', 'dunes', 'synthwave'], ['lit', 'wet', 'dusty', 'busy-but-empty', 'quiet'], ['urban', 'modern'], `
Gece Liman Drift Alanı|night drift lot at the harbour with tyre marks and neon reflections on wet tarmac
Dağ Virajı Touge Yolu|mountain touge road hairpin at dusk with guard rails and pine forest
Formula Pit Şeridi|empty pit lane interior of a race garage with tools and tyre racks
Çöl Ralli Pisti|desert rally track carving through dunes with dust hanging in the air
Tuz Gölü Hız Denemesi|salt flat speed course with marker cones vanishing to the horizon
Yeraltı Garajı Modifiye|tuner garage interior with a lifted car, neon underglow and posters without text
Otoban Gece Işıkları|empty motorway at night with long light trails and overhead gantries
Klasik Benzin İstasyonu|vintage petrol station on a lonely highway with a glowing canopy
Kar Ralli Orman Yolu|snowy rally stage through a frozen forest with snowbanks
Pist Start Grid|race circuit starting grid with painted boxes and empty grandstands
Kovboy Drag Yarış Pisti|drag strip at sunset with a Christmas-tree start light and stands
Neon Otopark Buluşması|multistorey car park rooftop meet at night with city glow
Yarış Kamyonu Paddock|paddock behind the pits with transporter trucks and awnings
Ralli Servis Parkı|rally service park in a forest clearing with tents and floodlights
Dağ Tüneli Çıkışı|mountain tunnel exit opening onto a coastal road at golden hour
Hurdalık Araba Mezarlığı|car scrapyard with stacked rusted bodies under a stormy sky
Kanyon Yolu|desert canyon road with red walls and a single yellow line
Kart Pisti Gece|indoor kart track interior with tyre barriers and coloured lights
Otomobil Müzesi|car museum interior with polished classics on rotating plinths
Fabrika Montaj Hattı|car assembly line interior with orange robot arms frozen mid-weld
Kıyı Yolu Virajları|cliffside coastal road with switchbacks above a turquoise sea
Şehir Sokak Yarış Parkuru|city street circuit with barriers, catch fences and a tunnel
Eski Motel Otoparkı|roadside motel parking lot with a flickering vacancy sign frame
Yarış Simülatör Odası|sim racing room interior with cockpit rigs and glowing screens
Toprak Oval Pist|dirt oval track at night under floodlights and drifting dust
Dağ Geçidi Zirve|mountain pass summit with a parking bay and snowy peaks behind
Liman Rıhtımı Gece|empty dockside road with cranes and puddles reflecting lights
Kapalı Garaj Kapısı|row of closed garage doors in a back alley under a single lamp
Islak Pist Sabah|wet race track at dawn with mist lifting off the asphalt
Yol Kenarı Lokanta|roadside diner at night with chrome trim and a neon window glow
`);

  G('drowned', 'Su Altında Kalmış Şehirler', 'water', 'mixed', ['underwater', 'atlantis', 'ocean', 'metro3d', 'rainglass'], ['flooded', 'sunken', 'overgrown', 'quiet', 'decaying'], ['scifi', 'urban'], `
Sular Altında Meydan|city square under shallow clear water, lamp posts rising from the surface
Batık Metro İstasyonu|flooded metro station interior with water up to the platform and dripping tiles
Gökdelenler Arası Kanal|canal of seawater between half-submerged skyscrapers at dusk
Su Basmış Katedral|flooded cathedral interior, nave mirrored in still water and light through rose windows
Batık Alışveriş Merkezi|submerged mall interior with escalators vanishing into green water
Sualtı Kütüphane|underwater library interior with drifting pages and fish between shelves
Yosunlu Otoyol Köprüsü|motorway overpass rising from the sea, covered in seaweed and gulls' nests
Su Altı Sokak Lambaları|submerged street with lamp posts and cars on the seabed in blue light
Çatı Bahçeleri Adacıkları|rooftop gardens forming islands above a drowned city
Batık Tiyatro|underwater theatre interior with red seats and a curtain swaying in currents
Bir Zamanlar Park|drowned park with tree crowns breaking the surface of a lagoon
Su Basmış Opera Merdiveni|grand staircase interior descending into dark floodwater
Tekne Yolu Haline Gelen Cadde|former avenue now a waterway with moored boats at upper windows
Mercanlı Heykel|city statue covered in coral on a sandy former plaza
Sualtı Tren Rayları|railway tracks leading down into a clear lagoon
Taşkın Bariyeri|giant broken flood barrier with the sea pouring through
Su Altındaki Okul Koridoru|school corridor interior underwater with lockers and floating chairs
Sis İçinde Kuleler|towers rising from a fog-covered sea, windows dark
Batık Saat Kulesi|clock tower standing in the sea, its face just above the water
Su Altı Otoparkı|underwater car park interior with silhouettes of cars and shafts of light
Yüzen Pazar Yeri|floating market of moored rafts between drowned buildings
Batık Havalimanı|flooded airport terminal interior, departure boards above the waterline
Kanal Kemerleri|arched arcades of a drowned old town reflected in green water
Deniz Duvarı Ardı|tall sea wall holding back the ocean above a dry city
Su Altında Lunapark|submerged fairground with a Ferris wheel rising from the sea
Çatı Antenleri Ormanı|forest of antennas and water tanks sticking out of a calm sea
Batık Metro Tüneli|tunnel interior filled with water lit by a distant shaft
Gelgit Çekilmiş Sokak|street revealed at low tide, wet and covered in seaweed
Sualtı Cami Kubbesi|submerged dome and minaret seen from beneath the surface
Gece Ay Işığında Su Şehri|drowned city at night under moonlight, only rooftops visible
`);

  G('moonmars', 'Ay & Mars Üsleri', 'scifi', 'mixed', ['planet', 'terrain3d', 'room3d', 'corridor', 'dunes'], ['operational', 'quiet', 'dusty', 'pristine', 'damaged'], ['scifi', 'space'], `
Ay Krateri Üssü|lunar base of white domes on a crater rim, Earth rising over the horizon
Mars Kızıl Vadisi Habitat|Mars habitat modules in a red valley under a butterscotch sky
Mars Sera Kubbesi|Martian greenhouse interior with rows of green crops under a pressurised dome
Ay Rover Garajı|rover garage interior with dusty six-wheeled vehicles and charging cables
Kraterde Teleskop Dizisi|radio telescope array in a lunar crater lit by low sunlight
Mars Toz Fırtınası Kapısı|airlock door of a Mars base facing an approaching dust storm
Ay Madeni Tüneli|lunar mine tunnel interior with regolith walls and work lights
Mars Kubbe Şehri Gece|Mars dome city at night, glowing domes under two tiny moons
Habitat Yatakhane|habitat sleeping quarters interior with bunk pods and portholes
Ay Yüzeyi Fırlatma Rampası|launch pad on the Moon with a lander under floodlights
Mars Kutup Buzu|Martian polar ice cliffs with a lonely research station
Habitat Komuta Merkezi|base control room interior with curved consoles and a planet view
Mars Lav Tüpü Şehri|city inside a Martian lava tube interior lit by artificial skylights
Ay Gece Tarafı|night side of the Moon with a base glowing under the stars
Mars Olympus Eteği|base at the foot of an immense volcano on Mars
Su Geri Dönüşüm Tesisi|water recycling plant interior with tanks and green pipes
Mars Kanyon Kenarı|canyon edge on Mars with layered rock and a parked rover
Ay Toprağı Laboratuvarı|lunar soil lab interior with sample trays and glove boxes
Habitat Spor Salonu|habitat gym interior with treadmills facing a Mars window
Uzay Asansörü Tabanı|space elevator anchor station with a cable rising into the sky
Mars Rüzgar Türbinleri|wind turbines on a Martian plain spinning in thin air
Ay İniş Alanı Eski|old lunar landing site with a rusted lander and footprints
Mars Kafeteryası|base cafeteria interior with long tables and plants under LEDs
Krater Kenarı Güneş Paneli|solar panel field on a crater edge in permanent sunlight
Mars Buz Madeni|ice mining rig on Mars drilling into a frosted plain
Hava Kilidi Koridoru|airlock corridor interior with suits hanging on racks
Mars Günbatımı Mavi|Martian sunset with a blue glow around a small sun over the base
Ay Gözlem Kubbesi|observation dome interior looking up at Earth and stars
Mars Kargo Terminali|cargo terminal of stacked containers and cranes on red ground
Terk Edilmiş Mars Karakolu|abandoned Mars outpost half buried in red sand
`);

  G('synth80', "Retro 80'ler Synthwave Dünyaları", 'abstract', 'abstract', ['synthwave', 'vaporwave', 'anamorphic', 'city', 'orbs'], ['glowing', 'lit', 'calm', 'dramatic'], ['abstract', 'scifi'], `
Neon Izgara Gün Batımı|infinite neon grid floor stretching to a striped setting sun
Palmiyeli Sahil Yolu|coastal highway with palm silhouettes against a magenta sunset
Krom Dağlar|wireframe mountains glowing cyan under a violet sky
Neon Şehir Ufku|retro city skyline of glowing outlines over a dark bay
Atari Salonu|arcade interior with glowing cabinets and a checkered floor
Gece Yolu Çizgileri|endless night road with glowing lane lines to a horizon sun
Lazer Tüneli|tunnel of laser rings receding into the distance
Retro Havuz Gece|pool at night with pink neon reflections and palm shadows
VHS Gökyüzü|sky of horizontal scan bands over a grid ocean
Neon Benzin İstasyonu|roadside petrol station glowing pink and cyan in the desert
Synth Stüdyo|music studio interior with analogue synths and neon strips
Kasetçalar Odası|bedroom interior from 1985 with posters without text and a cassette deck glow
Kromlu Spor Araba Garajı|garage interior with a wedge-shaped sports car under neon tubes
Disko Zemin|lit disco floor tiles under a mirror ball in a dark club interior
Neon Plaj Yürüyüş Yolu|beach boardwalk with neon tubes and dark waves
Uzay Retro Gezegen|giant striped planet rising over a neon grid
Gece Kulübü Girişi|club entrance with chrome rails and neon arches
Dijital Okyanus|wireframe ocean waves under a pink moon
Neon Ofis Kulesi|glass tower with outlines of neon light at night
Arcade Yarış Yolu|racing road in the style of an arcade game with checkpoints
Synth Çöl|desert of purple dunes with a giant neon sun
Lazer Ormanı|forest of glowing laser trees on a black grid
Retro Fütürist Metro|subway platform interior with chrome and pink light
Video Kiralama Dükkânı|video rental store interior with rows of glowing shelves
Palmiye Siluetleri Ufuk|row of palms against a striped sunset over the sea
Neon Köprü|suspension bridge outlined in neon over a dark river
Holografik Piramit|giant wireframe pyramid floating above a grid
Gece Yarısı Otoban Köprüsü|elevated highway at midnight with tail-light streaks
Neon Dağ Yolu|mountain road with glowing guard rails into a sunset
Retro Uzay İstasyonu|space station interior with chrome walls and neon panels
`);

  G('y2k', "Y2K & 2000'ler Estetiği", 'modern', 'mixed', ['y2k', 'silk', 'orbs', 'homeint', 'podium'], ['glowing', 'pristine', 'lit', 'messy'], ['modern', 'abstract'], `
Krom Baloncuk Odası|room interior filled with floating chrome bubbles on a white floor
Frosted Plastik Ofis|translucent blue plastic office interior with curved desks and CRT screens
Mall Atriumu 2001|shopping mall atrium interior with glass lifts and palm planters
İnternet Kafe|internet café interior with rows of beige computers and swivel chairs
Kromlu Müzik Klibi Seti|music video set with chrome walls and holographic floor
Gümüş Gelecek Şehri|millennium future city of silver spheres and monorails
Pembe Yatak Odası|teenage bedroom interior with inflatable chairs and glitter
Kapaklı Telefon Vitrin|phone shop interior with glowing displays on frosted shelves
Holografik Gökyüzü|iridescent sky over a smooth glossy landscape
Disko Kromlu Kulüp|club interior with mirrored chrome walls and blue lasers
Şeffaf Elektronik Odası|room interior full of translucent electronics in candy colours
Monoray İstasyonu|monorail station with white curves and glass canopy
Kromlu Su Damlaları|giant chrome droplets on a mirrored floor
Oyun Konsolu Odası|living room interior with a big CRT and console glow at night
Çatı Havuzu Y2K|rooftop pool with inflatable furniture and blue light
Frosted Cam Banyo|bathroom interior in frosted glass and aqua tiles
Plastik Lounge|lounge interior with bubble chairs and white shag carpet
Dijital Kamera Parti Salonu|party hall interior with silver balloons and a flash glare
Sunucu Odası 2000|server room interior with blinking beige towers
Gümüş Sahne|concert stage with silver drapes and blue spotlights
Lazer Labirent|maze of translucent walls lit by lasers
Kromlu Araba Showroom|car showroom interior with a silver concept car on a turntable
Masaüstü Rüya|dreamy landscape made of desktop icons and blue skies
Glitter Otel Lobisi|hotel lobby interior with glitter walls and lilac lights
Elektronik Mağaza Duvarı|electronics shop interior with a wall of glowing televisions
Gelecek Mutfağı|futuristic kitchen interior in white plastic with glowing panels
Yüzen Platform|floating glossy platform in a cloudy pastel sky
Neon Mavi Koridor|corridor interior lit in neon blue with chrome trim
Gümüş Çöl|desert of metallic silver dunes under a lilac sky
Kromlu Kalp Heykeli|giant inflated chrome heart sculpture in a white void
`);

  G('vapor', 'Vaporwave & Dijital Rüyalar', 'abstract', 'abstract', ['vaporwave', 'synthwave', 'pool', 'dreamscape', 'silk'], ['glowing', 'calm', 'quiet', 'enchanted'], ['abstract'], `
Pembe Gökyüzü Antik Büst|classical marble bust on a checkerboard floor under a pink sky
Sonsuz Havuz Sütunları|infinite pool with Greek columns and pastel clouds
Dijital Palmiye Bahçesi|garden of low-poly palm trees on a grid floor
Mermer Merdiven Gökyüzüne|marble staircase rising into a gradient sky
Tropikal Mall Çeşmesi|1990s mall fountain interior with fake palms and teal tiles
Japon Retro Tren Penceresi|train window interior looking out on a pastel sunset city
Ofis Tavanı Bulutlar|drop ceiling interior opening onto blue sky
Pikselli Okyanus|pixelated ocean waves under a lavender sun
Krom Yunus Heykelleri|chrome dolphin sculptures over a glossy lagoon
Neon Kanji Sokağı|night street with glowing neon shapes and pink rain
Masaüstü Penceresi Manzara|landscape framed by floating window frames
Kristal Piramit Plaza|plaza with a glass pyramid and pastel tiles
Bulutların Üstünde Havuz|swimming pool floating among pink clouds
Eski Bilgisayar Odası|dim room interior with an old monitor glowing teal
Pastel Gece Yarısı Mall|empty mall interior at midnight with pastel neon
Sanal Tapınak|digital temple of white pillars in a purple void
Dev Ay Su Yansıması|giant moon reflected in a calm pink sea
Hologram Bahçe|garden of translucent hologram flowers
Gün Batımı Otoyol Retro|highway with pastel sunset and low-poly hills
Mermer Koridor Sonsuz|endless marble corridor interior with palm pots
Floating Ada Heykeller|floating island with classical statues and palm trees
Teal Kare Fayans Havuz|indoor pool interior of teal square tiles and soft light
Sanal Gerçeklik Ufku|grid horizon with floating geometric shapes
Retro Otel Atriumu|hotel atrium interior with pink balconies and plants
Pembe Su Kanalları|canals of pink water between white buildings
Kozmik Çiçek|giant glowing flower in a starry pastel void
Dijital Şelale|waterfall of pixels into a teal pool
Tropik Gün Batımı Pencere|bay window interior onto a tropical pastel sunset
Kristal Küreler Sahnesi|crystal spheres floating above a mirror floor
Bulut Merdivenleri|staircases made of clouds in a lavender sky
`);

  G('liminal', 'Liminal Mekânlar', 'interior', 'mixed', ['corridor', 'pool', 'homeint', 'room3d', 'rainglass'], ['empty', 'quiet', 'eerie', 'abandoned', 'busy-but-empty'], ['horror', 'interior'], `
Sarı Duvarlı Sonsuz Ofis|endless office interior of yellow walls, damp carpet and buzzing fluorescent tubes
Boş Kapalı Havuz|empty indoor pool interior with white tiles and still water under skylights
Gece Okul Koridoru|school corridor interior at night with lockers and one light on
Otel Koridoru Sonsuz|hotel corridor interior repeating identical doors to infinity
Boş Otopark Katı|empty parking level interior with concrete pillars and green signs without text
Kapanmış AVM|closed shopping mall interior with shutters down and dim lights
Havalimanı Gece Kapısı|airport gate interior at 3am with empty seats
Çocuk Oyun Alanı İç|indoor playground interior with ball pits and tubes, lights low
Eski Bowling Salonu|bowling alley interior with lanes lit and no one there
Boş Bekleme Salonu|waiting room interior with plastic chairs and a ticking clock
Su Basmış Bodrum Koridoru|basement corridor interior with ankle-deep water reflecting lights
Sonsuz Merdiven Boşluğu|stairwell interior spiralling down without end
Gece Çamaşırhane|laundromat interior at night, one dryer turning
Boş Sinema Fuayesi|cinema lobby interior with patterned carpet and closed kiosk
Pembe Tuvalet Koridoru|corridor interior of pink tiles and frosted glass
Boş Ofis Kabinleri|cubicle farm interior at night with monitors off
Terk Edilmiş Su Parkı|abandoned water park with dry slides and faded colours
Sis Kaplı Futbol Sahası|empty football pitch at night in fog under one floodlight
Kar Yağışında Benzinlik|petrol station under snowfall at night, no cars
Gece Metro Vagonu|empty metro carriage interior moving through darkness
Halı Kaplı Konferans|conference room interior with rows of empty chairs
Asansör Lobisi Boş|elevator lobby interior with brass doors and soft music feeling
Ev İçinde Kapı Koridoru|house corridor interior with too many doors
Gece Hastane Bekleme|hospital waiting area interior with vending machine glow
Boş Spor Salonu|school gym interior with bleachers folded
Uzun Tünel Yaya|pedestrian tunnel interior with tiled walls and humming lights
Gece Yarısı Supermarket|supermarket interior with aisles lit and no one there
Pencere Yok Oda|windowless room interior with a single carpet and lamp
Yüzme Havuzu Kaydırak|indoor water slide tubes interior in pastel colours
Terk Edilmiş Okul Kantini|abandoned school canteen interior with chairs on tables
`);

  G('psych', 'Psikolojik Gerilim Mekânları', 'horror', 'mixed', ['homeint', 'corridor', 'rainglass', 'room3d', 'smoke'], ['eerie', 'dark', 'quiet', 'messy', 'rainy'], ['horror', 'interior'], `
Dağınık Dedektif Odası|investigator room interior with string-covered cork walls and a desk lamp
Yağmurlu Pencere Odası|dark apartment interior with rain streaming down the window
Kapısı Aralık Yatak Odası|bedroom interior at night with the door ajar to a lit hallway
Gece Mutfak Buzdolabı Işığı|kitchen interior lit only by an open fridge
Boş Psikiyatri Koridoru|psychiatric ward corridor interior with green walls
Aynalarla Dolu Oda|room interior full of mirrors reflecting one lamp
Sisli Göl Evi|lake house in fog with one lit window
Bodrum Merdiveni|basement stairs interior leading into darkness
Ara Sokak Telefon Kulübesi|alley at night with a ringing phone box under a lamp
Çatı Katı Eski Eşyalar|attic interior with sheets over furniture
Banyo Buğulu Ayna|steamed bathroom interior with a fogged mirror
Kırmızı Odalı Karanlık Oda|darkroom interior with red light and hanging prints
Boş Motel Odası|motel room interior with a buzzing sign light through the blinds
Gece Otobüs Durağı|isolated bus stop at night on a forest road
Terk Edilmiş Ev Salonu|abandoned living room interior with peeling wallpaper
Sorgu Odası|interrogation room interior with a table, two chairs and one-way mirror
Olay Yeri Şeritli Daire|apartment interior cordoned with tape, evidence markers on the floor and one lamp left on
Sonsuz Koridor Kapı|corridor interior ending at a single red door
Gece Ormanı Yolu Far|forest road at night lit by headlights in mist
Kuyu Başı|old stone well in an overgrown garden at dusk
Eski Kayıt Odası|archive room interior with rows of filing cabinets
Gece Yarısı Çocuk Odası|child's room interior with a nightlight and toys
Tren Kompartımanı Boş|empty train compartment interior at night
Koltuklu Terapi Odası|therapist office interior with an armchair and closed blinds
Kar Kaplı Kulübe|isolated cabin in snow with smoke from the chimney
Gece Hastane Odası|hospital room interior with a monitor glow
Eski Fotoğraf Duvarı|wall of old photographs in a narrow hallway interior
Yağmurlu Çatı Katı|rainy rooftop at night with water tanks and a lone light
Göl Kenarı İskele Sis|wooden jetty vanishing into fog over a still lake
Kilitli Kapı Koridoru|apartment corridor interior with a door chained shut
`);

  G('neowest', 'Neo-Western', 'western', 'ext', ['dunes', 'canyon', 'street3d', 'countryside', 'terrain3d'], ['dusty', 'scorching', 'windswept', 'quiet', 'abandoned'], ['history'], `
Çöl Benzin İstasyonu|lonely desert gas station with a rusted sign frame and heat haze
Yol Kenarı Motel|roadside motel on a desert highway at dusk
Petrol Kuyuları Ovası|plain of oil pumpjacks against a red sunset
Sınır Kasabası Ana Cadde|border town main street with low adobe buildings
Kuru Göl Yatağı|cracked dry lake bed under a vast sky
Hurda Karavan Kampı|trailer park in the desert with faded trailers
Çiftlik Evi Rüzgar Değirmeni|ranch house with a windmill and dust devils
Ray Hattı Çölde|railway line crossing an empty desert
Kanyon Yolu Patika|dirt road winding into a red canyon
Terk Edilmiş Kasaba Barı|abandoned saloon on a modern highway
Mesa Gün Batımı|desert mesas glowing at sunset
Kamyon Durağı Gece|truck stop at night with diesel trucks parked
Sığır Ağılı|cattle corrals at dawn with dust in the air
Su Kulesi Kasaba|small town water tower over flat land
Çöl Köprüsü Nehir|bridge over a dry riverbed with tumbleweeds
Eyaletlerarası Yol|interstate highway shimmering into the horizon
Polis Karakolu Kasaba|small town sheriff station with a dusty lot
Kaktüs Vadisi|valley of tall saguaro cacti at golden hour
Terk Edilmiş Maden Kasabası|abandoned mining town with wooden headframes
Rodeo Arenası Boş|empty rodeo arena with metal stands
Çöl Fırtınası Yol|road disappearing into a dust storm
Yıldızlı Çöl Gecesi|desert under a starry sky with a lone pickup parked
Ahşap Ambar|old wooden barn on a wind-blown plain
Sınır Çiti|border fence stretching across hills
Çöl Hurdalığı|desert junkyard of rusted cars and tyres
Kasaba Kilisesi|white adobe church on a dusty plaza
Kanyon Kenarı Bakış|canyon overlook with a lonely viewpoint
Yaylada Çit Kapısı|ranch gate under a big sky with mountains
Dağ Kasabası Kar|mountain cow town in early snow
Gece Yolu Tabela|empty desert crossroads at night under one streetlamp
`);

  G('samurai', 'Samuray & Feodal Japonya', 'eastasia', 'mixed', ['bamboo', 'wuxia', 'castle', 'forest', 'room3d'], ['misty', 'quiet', 'autumnal', 'snowbound', 'candlelit', 'rainy'], ['history', 'world'], `
Kale Kulesi Tenshu|feudal castle keep with curved roofs above stone walls in mist
Bambu Ormanı Patikası|bamboo forest path with tall green stalks and shafts of light
Dojo İç Mekân|dojo interior with polished wooden floor and paper screens
Kar Altında Tapınak|mountain temple in snowfall with stone lanterns
Torii Kapısı Göl|red torii gate standing in a misty lake
Çay Evi Bahçesi|tea house interior opening onto a moss garden
Pirinç Tarlası Köy|feudal village of thatched houses beside rice paddies
Daimyo Taht Salonu|lord's audience hall interior with gold screens and tatami
Yağmurda Ahşap Köprü|wooden arched bridge over a river in rain
Akçaağaç Vadisi|valley of red maples around a wooden pagoda
Fenerli Gece Sokağı|night street of a castle town lit by paper lanterns
Dağ Geçidi Kontrol Noktası|mountain checkpoint gate on a stone road
Savaş Kampı Bayrakları|army encampment with banners and curtained enclosures
Kayalık Zen Bahçesi|raked gravel zen garden with stones
Şelale Meditasyon|waterfall pouring into a pool with a small shrine
Han Odası|roadside inn room interior with futons and a sliding door view
Kale Duvarı Gün Batımı|massive sloped stone castle walls at sunset
Sakura Yolu|path lined with cherry blossoms drifting down
Liman Kasabası Edo|Edo-period port with wooden ships and warehouses
Ateş Böcekli Nehir|river at night with fireflies and reeds
Kılıç Ustası Atölyesi|swordsmith forge interior with glowing coals
Kar Kaplı Dağ Köyü|mountain village with steep thatched roofs in snow
Tapınak Merdivenleri|long stone steps up a forested mountainside
Bambu Çit Avlusu|courtyard with bamboo fences and a stone basin
Sisli Pirinç Terası|terraced rice fields in morning mist
Ahşap Koridor Engawa|veranda corridor interior around a garden in rain
Yanmış Köy Kalıntısı|burnt village remains with smoke drifting
Kayalık Sahil Tapınak|seaside shrine on rocks with crashing waves
Ay Işığında Kale|castle under a full moon with clouds
Bambu Su Kanalı|bamboo water pipe in a quiet garden
`);

  G('wuxia', 'Wuxia & Kung Fu Dünyaları', 'eastasia', 'mixed', ['wuxia', 'bamboo', 'mountains', 'room3d', 'waterfall'], ['misty', 'quiet', 'ancient', 'enchanted', 'candlelit'], ['fantasy', 'world'], `
Bulutlar Üstü Köşk|pavilion on a needle-like peak above a sea of clouds
Bambu Tepesi Düello Alanı|bamboo canopy treetops swaying in the wind
Kung Fu Tapınak Avlusu|temple courtyard with stone training ground and incense
Su Üstü Köşk|lake pavilion with a zigzag bridge in mist
Dağ Manastırı Merdiveni|monastery steps carved into a cliff
Çay Evi Pazar|bustling teahouse interior with lanterns and wooden balconies
Şelale Arkası Mağara|cave behind a waterfall with a stone seat
Taş Orman|stone forest of limestone pillars in fog
Gece Han Avlusu|inn courtyard at night with red lanterns
İmparatorluk Sarayı Salonu|imperial throne hall interior with red columns
Kırmızı Akçaağaç Koruluk|grove of red maples around a stone pagoda
Halat Köprü Kanyon|rope bridge across a deep misty gorge
Nehir Kenarı Köy|riverside village with arched stone bridges
Altın Tapınak Çatıları|golden temple roofs at sunset over mountains
Antrenman Direkleri|training posts on a cliff edge
Kuyu Avlusu|courtyard with a well and peach trees in blossom
Yazıt Kayalıkları|cliffs with carved calligraphy-free reliefs
Lotus Gölü|lotus pond under morning light
Sisli Dağ Patikası|mountain path among pines in mist
Kütüphane Kulesi|scroll library tower interior with wooden shelves
Gece Pazarı Fener|night market of red lanterns along a canal
Nehir Teknesi|river boat with a curved roof in reeds
Saray Bahçesi Kayalar|palace garden with sculpted rocks and a pond
Kar Tepeli Manastır|snow-covered monastery on a ridge
Kırık Kılıç Mezarlığı|field of old swords stuck in the earth at dusk
Bambu Ev İçi|bamboo house interior with paper windows
Dev Buda Kayası|giant carved figure in a cliff by a river
Tepelerde Çay Terasları|tea terraces on steep hills in mist
Ay Işığında Çatılar|moonlit rooftops of a walled city
Kızıl Kapı Geçidi|red gate in a mountain pass with banners
`);

  G('bolly', 'Bollywood Renkli Setler', 'palace', 'mixed', ['hall', 'room3d', 'godrays', 'silk', 'market'], ['opulent', 'lit', 'pristine', 'dramatic'], ['world', 'modern'], `
Saray Avlusu Çeşme|palace courtyard with marble fountains and rose petals
Renkli Kumaş Pazarı|market street hung with bright silk fabrics
Mermer Ayna Salon|mirrored palace hall interior with thousands of glass inlays
Göl Sarayı|white palace floating on a lake at sunset
Çiçek Kemerli Düğün Seti|wedding mandap with marigold garlands and drapes
Hint Tren İstasyonu|colonial railway station with arches and steam
Sahil Ay Işığı|moonlit beach with lanterns and silk canopies
İsviçre Dağ Çayırı|alpine meadow with yellow flowers and snowy peaks
Lüks Malikane Merdiveni|grand staircase interior with chandeliers
Holi Renk Tozu Avlusu|courtyard covered in coloured powder clouds
Çöl Kalesi|desert fort on a hill at golden hour
Mum Işıklı Tapınak|temple interior lit by hundreds of oil lamps
Sokak Yemekleri Çarşısı|market lane of food stalls with marigolds
Neon Gece Kulübü Set|nightclub set interior with neon and sequins
Hardal Tarlası|yellow mustard fields with a lone tree
Saray Balkonu|carved balcony overlooking a city
Kolonyal Konak|colonial mansion with a veranda and lawns
Muson Yağmurlu Sokak|street in monsoon rain with umbrellas parked
Rajput Sarayı Avlu|courtyard with blue walls and arches
Film Stüdyosu Merdiven Seti|stage staircase with lights and drapes
Kurdeleli Hindistancevizi Koru|coconut grove by backwaters at sunset
Şehir Çatıları Uçurtma|rooftops at dusk with kites in the sky
Lüks Otel Lobisi|grand hotel lobby interior in gold and marble
Gece Festival Işıkları|street with festival lights and paper lamps
Mavi Şehir Sokakları|blue-painted city alleys under hot sun
Nehir Basamakları|river steps with lamps floating on water
Çay Bahçesi Tepe|tea plantation hills with a winding road
Göl Kenarı Pavyon|lakeside pavilion with fountains
Tiyatro Sahnesi Perde|theatre stage with red velvet curtains
Saray Bahçesi Tavus Kuşu|palace garden with hedges and fountains at dawn
`);

  G('neonoir', 'Neo-Noir Şehir Geceleri', 'urban', 'mixed', ['rainglass', 'street3d', 'city', 'metro3d', 'rooftop'], ['wet', 'rainy', 'dark', 'smoky', 'lit'], ['urban', 'street'], `
Yağmurlu Neon Ara Sokak|alley in rain with neon signs reflected in puddles
Çatı Su Kuleleri Gece|rooftop with water towers and a glowing skyline
Gece Lokantası Cam|diner at night with rain on the window
Köprü Altı Gece|underpass at night with sodium lights and steam
Polis Merkezi Ofisi|police office interior with blinds and desk lamps
Caz Kulübü|jazz club interior with smoke and a small stage
Gece Taksi Durağı|taxi rank in rain under a flickering light
Liman Deposu Sis|dockside warehouse in fog at night
Otel Odası Neon Işığı|hotel room interior lit by a neon sign outside
Yüksek Kat Ofis Penceresi|high-rise office interior overlooking a rainy city
Metro Merdiveni Buhar|subway stairs with steam rising
Boş Bar Gece Yarısı|empty bar interior at closing time
Otopark Çatı Gece|rooftop car park in rain
Çin Mahallesi Sokağı|chinatown street at night with lanterns
Yangın Merdiveni Arka Cephe|fire escapes on a brick wall at night
Telefon Kulübesi Yağmur|phone booth in heavy rain
Gece Köprüsü Sis|suspension bridge in fog at night
Kumarhane Arka Kapı|casino back door in an alley
Gece Gazete Matbaası|printing press hall interior at night
Lüks Çatı Katı Gece|penthouse interior with city lights
Islak Kavşak Trafik Işıkları|wet intersection with traffic lights cycling
Tren Rayları Gece|elevated train tracks over a street
Neon Motel Avlusu|motel courtyard with neon and an empty pool
Liman Vinçleri Siluet|harbour cranes against a hazy night sky
Gece Yarısı Kafe Tezgah|late-night café counter interior
Kanal Kenarı Sokak|street by a canal at night with reflections
Çatıdan Sokak Bakışı|looking down from a roof at a neon street
Asansör Koridoru Gece|apartment corridor interior with buzzing lights
Bina Arası Buhar|steam vents between towers at night
Gece Otobüsü İçi|night bus interior with rain on windows
`);

  G('superhero', 'Süper Kahraman Şehirleri & Çatılar', 'urban', 'ext', ['rooftop', 'metro3d', 'skyline', 'storm', 'city'], ['lit', 'dramatic', 'wet', 'stormy', 'damaged'], ['urban', 'scifi'], `
Gökdelen Çatı Kenarı|skyscraper roof edge with a gargoyle overlooking the city
Gotik Kule Tepesi|gothic tower top with a spotlight beam in clouds
Saat Kulesi Çatı|clock tower roof above a glowing avenue
Yıkılmış Cadde Çatışma Sonrası|avenue after a battle with cracked asphalt and debris
Köprü Kulesi Gece|bridge tower top with cables and city lights
Fütüristik Şehir Merkezi|futuristic downtown with glass towers and sky bridges
Çatı Bahçesi Gece|rooftop garden with city lights beyond
Gizli Sığınak Mağara|secret cave base interior with screens and a waterfall
Yüksek Antenli Çatı|rooftop with a giant antenna in a storm
Neon Reklam Panosu Arkası|behind a giant billboard frame on a roof
Kahraman Kulesi Lobi|hero tower lobby interior with a giant emblem-free atrium
Su Kulesi Üstü|water tower top at dawn above old rooftops
Liman Fenerinin Tepesi|harbour lighthouse gallery at night
Çökmüş Gökdelen|collapsed skyscraper leaning on another
Gökyüzü Köprüsü|sky bridge between towers in clouds
Merkez Park Gece|central park at night with skyline beyond
Uçan Araç Pisti|landing pad on a tower for flying vehicles
Tren İstasyonu Çatı|station roof of glass and iron at night
Kilise Çan Kulesi|cathedral bell tower above a dark city
Laboratuvar Kulesi|research tower with glowing top floors
Fırtına Altında Şehir|city under a giant storm cloud with lightning
Şafakta Çatılar|rooftops at dawn with steam and pigeons
Baraj Duvarı|massive dam wall at night
Metropol Gökdelen Taban|base of a megatower looking up
Uzay Asansörü Şehir|city with a space elevator rising
Yeraltı Tren Tüneli|subway tunnel interior with a derailed car
Çatı Uydu Çanakları|rooftops with satellite dishes and laundry
Gece Liman Konteynerleri|harbour container yard under lights
Şehir Siluet Şimşek|city skyline lit by lightning
Yıkılmış Stadyum|damaged stadium with a broken roof
`);

  G('mecha', 'Dev Robotlar & Mecha Hangarları', 'scifi', 'mixed', ['mecha', 'room3d', 'metro3d', 'battlefield', 'station'], ['operational', 'damaged', 'alert', 'rusted', 'dramatic'], ['scifi', 'war'], `
Mecha Hangarı Bakım|giant robot hangar interior with scaffolding and sparks
Fırlatma Rampası Robot|launch catapult with a robot silhouette under lights
Terk Edilmiş Robot Mezarlığı|field of rusted giant robots overgrown with grass
Şehir Savunma Duvarı|city defence wall with giant robot docks
Deniz Üssü Robot Asansörü|naval base robot elevator rising from the sea
Pilot Kokpiti|robot cockpit interior with curved displays
Yıkık Şehir Robot Kalıntısı|ruined city with a fallen giant robot
Montaj Fabrikası|robot assembly factory interior with cranes
Çöl Robot Savaş Alanı|desert battlefield with robot wreckage
Komuta Merkezi Ekranlar|command center interior with tactical screens
Robot Tamir Rıhtımı|repair dock with a robot in a dry dock
Kar Ovası Mecha Tozu|snowy plain with giant footprints
Dağ Hangarı Kapısı|mountain hangar door opening
Robot Parça Deposu|warehouse interior of giant robot limbs
Şehir Merkezi Robot Garajı|city robot garage under a highway
Orman Robot Kalıntısı|forest with a moss-covered giant robot head
Deniz Kıyısı Savunma|coastal defence with robot gantries
Test Alanı Patlama İzleri|test range with craters and targets
Yer Altı Robot Tüneli|tunnel interior large enough for giants
Uzay Hangar Robot|orbital hangar interior with robots in racks
Pilot Soyunma Odası|pilot locker room interior with suits
Kanalizasyon Robot Kanalı|giant drainage channel in a city
Kar Fırtınası Hangar Önü|hangar apron in a blizzard
Robot Gözlem Kulesi|observation tower overlooking a robot arena
Gece Liman Robot Vinçleri|port where cranes resemble robots
Volkan Üssü Robot|volcano base with robots in lava light
Şehir Kavşağı Ayak İzleri|intersection with giant footprints in asphalt
Robot Müzesi|museum interior with a vintage giant robot
Yağmurlu Hangar Kapısı|hangar entrance in rain with floodlights
Gün Batımı Robot Siluet Tepede|hilltop with a giant robot silhouette at sunset
`);

  G('airship', 'Hava Gemileri & Gökyüzü Şehirleri', 'sky', 'sky', ['skyship', 'clouds', 'synthwave', 'godrays', 'storm'], ['calm', 'misty', 'enchanted', 'stormy', 'pristine'], ['fantasy', 'scifi'], `
Bulutlar Üstü Şehir|city built on floating rocks above clouds
Zeplin Limanı|airship dock with mooring masts at sunset
Hava Gemisi Güvertesi|airship deck with brass rails and clouds below
Uçan Adalar Şelale|floating islands with waterfalls pouring into the sky
Bulut Kanyonu|canyon of towering clouds with airships
Gökyüzü Pazarı|floating market of balloons and platforms
Fırtına Bulutu İçi|inside a storm cloud with lightning
Kuş Bakışı Gökyüzü Kasabası|sky town of towers linked by bridges
Zeplin Kokpiti|airship bridge interior with wheels and gauges
Gökyüzü Feneri|sky lighthouse on a floating rock
Gün Doğumu Bulut Denizi|sea of clouds at sunrise with distant airships
Halat Köprüleri Ada|rope bridges between floating islands
Hava Gemisi Hangarı|airship hangar interior with a balloon
Gökyüzü Bahçesi|garden on a floating island with trees
Gökyüzü Kalesi|castle on a floating mountain
Bulut Şelalesi|clouds pouring off a cliff like water
Rüzgar Değirmenli Ada|floating island with windmills
Gece Gökyüzü Şehri Işıklar|sky city at night glowing among stars
Balon Filosu|fleet of hot-air balloons over clouds
Kırık Ada Kalıntısı|ruins of a broken floating island
Pirinç Makine Dairesi|engine room interior of an airship
Bulutlar Arası Tren Yolu|railway across the sky on pillars
Gökyüzü Kütüphanesi|library on a floating island interior with open walls
Kasırga Gözü|eye of a hurricane with a calm sky
Kuzey Işıkları Gemi|airship under aurora
Gökyüzü Limanı Gece|sky port at night with lanterns
Uçan Balina Gökyüzü|clouds with giant whale-shaped forms
Altın Kubbe Ada|golden dome on a floating island
Gökyüzü Uçurumu|edge of a floating world looking down
Pembe Gün Batımı Gökyüzü|pink sunset sky with small islands
`);

  G('atlantis', 'Atlantis & Sualtı Medeniyetleri', 'water', 'water', ['atlantis', 'underwater', 'coral', 'crystal', 'godrays'], ['sunken', 'glowing', 'ancient', 'enchanted', 'deep'], ['fantasy'], `
Batık Saray Kubbesi|sunken palace dome with coral and light shafts
Kristal Şehir Kalıntıları|crystal city ruins on the ocean floor
Sualtı Taht Salonu|underwater throne hall interior with pearl columns
Biyolüminesan Bahçe|garden of glowing sea plants
Antik Sütunlu Cadde|avenue of columns under the sea
Sualtı Tapınak Merdivenleri|temple steps descending into the deep
Mercan Kaplı Heykeller|statues covered in coral
Sualtı Kubbe Şehri|city under glass domes on the seabed
Deniz Kızı Mağarası|grotto with glowing pools
Batık Gemi Mezarlığı|graveyard of ancient ships
Okyanus Çukuru Kenarı|edge of an ocean trench with ruins
Sualtı Pazar Yeri|underwater marketplace of shells
Işıklı Denizanası Salonu|hall interior filled with glowing jellyfish
Batık Arena|submerged arena with tiers
Kristal Kuleler|crystal towers in deep blue water
Sualtı Şelalesi|underwater waterfall of brine
Kelp Ormanı Kalesi|castle in a kelp forest
İnci Sarayı Avlusu|courtyard of pearl and mother-of-pearl
Sualtı Kütüphane|library of stone tablets underwater
Volkanik Baca Şehri|city around volcanic vents
Antik Liman Kapısı|ancient sea gate with giant doors
Mercan Labirenti|maze of coral walls
Sualtı Bahçe Teras|terraced gardens of sea grass
Dev Deniz Kabuğu Saray|palace inside a giant shell
Kumlu Ova Heykel|giant statue half buried on a sandy plain
Sualtı Mağara Köprüsü|stone bridge in an underwater cave
Batık Gözlemevi|sunken observatory dome
Mavi Işık Huzmeleri|shafts of blue light through ruins
Derinlik Kapısı|portal arch in the abyss
Sualtı Gün Işığı Plaza|shallow plaza lit by rippling sunlight
`);

  G('fairy', 'Büyülü Ormanlar & Peri Diyarları', 'fantasy', 'ext', ['mushroom', 'forest', 'godrays', 'bamboo', 'waterfall'], ['enchanted', 'misty', 'overgrown', 'glowing', 'calm'], ['fantasy', 'nature'], `
Dev Mantar Ormanı|forest of giant glowing mushrooms
Peri Halkası Açıklık|clearing with a ring of glowing mushrooms
Işık Böcekli Dere|stream with fireflies and mossy stones
Ağaç Kovuğu Ev|cottage inside a giant tree trunk
Yosunlu Taş Köprü|mossy stone bridge in mist
Kristal Göl|lake with crystal formations on the shore
Ağaç Tepesi Köyü|village of tree houses linked by walkways
Çiçek Vadisi|valley of oversized flowers
Büyülü Şelale|waterfall with rainbow mist and glowing plants
Sarmaşık Kemer Yol|path through an arch of vines
Ay Işığında Orman|forest under a full moon with silver light
Peri Kapısı|tiny door in a tree root with light inside
Söğüt Gölü|willow trees over a still pond
Sihirli Bahçe Duvarı|walled garden with glowing roses
Kökler Mağarası|cave of giant roots
Mavi Çan Ormanı|bluebell forest in spring light
Antik Ağaç Kalbi|ancient tree with a glowing heart
Orman Tapınağı|forest shrine covered in moss
Işıklı Nilüfer Gölü|pond of glowing water lilies
Sisli Huş Ormanı|birch forest in mist
Taş Çember|stone circle in a meadow
Bal Peteği Ağaç|tree with honeycomb lanterns
Gizli Vadi|hidden valley with waterfalls
Mantar Köyü|village of mushroom houses
Kuş Yuvaları Ormanı|forest of giant nests
Yıldız Tozu Çayır|meadow with floating sparkles
Kristal Mağara Girişi|cave entrance with crystals
Kış Peri Ormanı|frosted forest with ice lights
Sonbahar Peri Yolu|path of golden leaves with lights
Ay Çiçeği Bahçesi|garden of moonflowers at night
`);

  G('dragon', 'Ejderha İnleri & Hazine Mağaraları', 'underground', 'int', ['crystal', 'fire', 'lava', 'godrays', 'tunnel'], ['ancient', 'glowing', 'dark', 'smoky', 'quiet'], ['fantasy'], `
Altın Yığını Mağara|cave interior of mountains of gold coins
Lav Gölü İni|lair interior around a lava lake
Kemik Kaplı Geçit|tunnel interior lined with old bones
Kristal Hazine Odası|treasure chamber interior with crystal clusters
Dev Yuva|nest interior of scorched branches in a cavern
Kayalık Kubbe Salon|domed cavern interior with a hole to the sky
Yeraltı Nehri Hazine|underground river interior with chests on the shore
Antik Cüce Salonu|dwarven hall interior with carved pillars
Ejderha Pulları Duvar|cave wall interior embedded with giant scales
Taht Kayası|rock throne interior in a cavern
Buz Ejderhası Mağarası|ice cave interior with frozen treasure
Kükürt Buharlı Geçit|sulphur steam passage interior
Kral Mezar Odası|royal tomb chamber interior with sarcophagi
Kırık Kılıçlar Salonu|hall interior strewn with broken shields
Yarık Işık Huzmesi|cavern interior lit by a beam from a crack
Kristal Köprü|natural bridge over a chasm interior
Gümüş Damar Tüneli|mine tunnel interior with silver veins
Volkan Kraterine Açılan|lair opening onto a crater
Antik Kapı Rünler|giant stone door interior with carvings
Mücevherli Tavan|cave ceiling interior glittering with gems
Altın Heykeller Galerisi|gallery interior of golden statues
Hazine Sandıkları Odası|room interior of open chests
Dev Kafatası Girişi|cave entrance shaped like a skull
Duman Dolu İn|smoke-filled lair interior with embers
Yeraltı Gölü Tekne|underground lake interior with a small boat
Mantarlı Hazine Mağarası|cave interior with glowing fungi and coins
Zincirli Kapı|chained gate interior in a tunnel
Lav Şelalesi|lava fall interior in a cavern
Kayıp Şehir Kalıntısı|ruins of a city in a cavern interior
Sessiz Uyuyan İn|lair interior in silence with coins scattered
`);

  G('cyberint', 'Siberpunk İç Mekânlar', 'scifi', 'int', ['room3d', 'corridor', 'rainglass', 'city', 'orbs'], ['lit', 'messy', 'smoky', 'humid', 'glowing'], ['scifi', 'interior'], `
Neon Bar|cyberpunk bar interior with holographic signs and a long counter
Yeraltı Klinik|back-alley clinic interior with surgical lights and cables
Hacker Odası|hacker den interior with stacked monitors and cables
Kapsül Otel|capsule hotel interior with rows of glowing pods
Noodle Tezgahı|noodle bar interior under neon in rain
Teknoloji Parça Dükkânı|tech parts shop interior with drawers and screens
Mega Kule Lobisi|megatower lobby interior with holograms
Kulüp Dans Pisti|nightclub interior with lasers and fog
Çatı Katı Daire|apartment interior with a window to neon towers
Sunucu Çiftliği|server farm interior with blue light
Pazar Labirenti Kapalı|covered market interior with stalls
Sanal Gerçeklik Salonu|VR parlour interior with reclining chairs
Polis Karakolu Gelecek|future police station interior with glass cells
Metro Vagonu Gelecek|future subway car interior with screens
Robot Atölyesi|robotics workshop interior with half-built androids
Kurumsal Toplantı Odası|corporate boardroom interior high above the city
Kumarhane Hologram|casino interior with holographic tables
Arcade Gelecek|arcade interior with immersive pods
Yeraltı Dövüş Arenası|underground arena interior in a cage
Asansör Neon|elevator interior with neon strips
Laboratuvar Klon|lab interior with tubes
Çamaşırhane Neon|laundromat interior with neon
Sokak Yemekleri Kapalı|food court interior with holographic menus
Penthouse Gelecek|penthouse interior with holographic fireplace
Tamir Garajı Uçan Araç|garage interior for flying cars
Dövme Stüdyosu|tattoo studio interior with neon
Kayıt Stüdyosu|recording studio interior with synths
Hastane Koridoru Gelecek|hospital corridor interior in white light
Otel Odası Yağmur Neon|hotel room interior with rain and neon
Veri Merkezi Kontrol|data center control interior
`);

  G('biopunk', 'Biyopunk & Organik Gelecek', 'scifi', 'mixed', ['cells', 'mushroom', 'coral', 'room3d', 'forest'], ['glowing', 'humid', 'overgrown', 'operational', 'eerie'], ['scifi', 'nature'], `
Organik Kule Şehri|city of grown organic towers like coral
Biyolüminesan Sokak|street lit by glowing plants
Canlı Ev İçi|living house interior with walls of membranes
Gen Laboratuvarı|genetic lab interior with glowing pods
Mantar Mimari|buildings grown from fungus
Kök Köprüsü|bridge of living roots over a river
Sera Kubbe Şehri|greenhouse dome city
Organ Fabrikası|bio factory interior with tanks
Böcek Kovanı Yapı|hive-like architecture with hexagonal cells
Yosun Kaplı Metro|metro station interior covered in moss
Biyo Reaktör Salonu|bioreactor hall interior with green tanks
Mercan Kule|tower grown from coral
Sarmaşık Gökdelen|skyscraper wrapped in vines
Biyolojik Hastane|hospital interior with living walls
Spor Bahçesi|garden of spores drifting in light
Canlı Köprü|bridge of woven vines between towers
Kabuk Evler|houses shaped like shells
Kristal Gen Bankası|seed vault interior with glowing capsules
Su Yosunu Çiftliği|algae farm with glowing tubes
Organik Tünel|tunnel interior with ribbed walls
Ağaç Tapınağı|temple grown from a giant tree
Biyopunk Pazar|market of strange plants
Böcek Çiftliği|insect farm interior with screens
Fosfor Göl|phosphorescent lake at night
Kök Kütüphanesi|library interior inside roots
Petek Konut|honeycomb housing at dusk
Biyo Işık Kulesi|tower of glowing pods
Damarlı Kubbe|dome with vein patterns glowing
Organik Uzay Gemisi İçi|organic ship interior with ribbed walls
Sisli Biyo Orman|forest of strange glowing trees in mist
`);

  G('timetravel', 'Zaman Yolculuğu & Paradoks Mekânları', 'abstract', 'mixed', ['dreamscape', 'tunnel', 'room3d', 'eclipse', 'archival'], ['eerie', 'glowing', 'ancient', 'dramatic', 'quiet'], ['scifi', 'abstract'], `
Zaman Makinesi Laboratuvarı|time machine lab interior with brass rings and sparks
Saatler Odası|room interior full of clocks showing different times
Zaman Tüneli Işık|tunnel of light streaks bending through time
İki Çağ Arası Sokak|street split between a medieval half and a futuristic half
Donmuş An Meydanı|square with raindrops frozen in mid-air
Sonsuz Ayna Koridoru|corridor interior of mirrors repeating eras
Kum Saati Çölü|desert with a giant hourglass
Paradoks Merdiveni|impossible staircase looping on itself
Antik Gözlemevi|ancient observatory with a star map dome
Zaman Kapısı Ormanda|glowing portal arch in a forest
Tarih Arşivi Sonsuz|endless archive interior of shelves
Çatlamış Gökyüzü|sky cracked with glimpses of other eras
Saat Kulesi Dişliler|clock mechanism interior on a giant scale
Eski ve Yeni Şehir Üst Üste|city layered with ruins and skyscrapers
Retro Fütürist Laboratuvar|1950s lab interior with a time capsule
Donmuş Okyanus Dalgası|ocean wave frozen in time
Anı Odası|room interior with floating photographs
Dinozor Çağı Vadi|prehistoric valley with ferns and volcanoes
Gelecek Kalıntısı|ruins of a future city in a jungle
Takvim Duvarı|wall of calendars in a corridor interior
Zaman Durağı İstasyon|train station interior where clocks have stopped
Sarmal Galaksi Saat|clockface galaxy in space
Tekrar Eden Gün Sokağı|street at dawn repeating
Kozmik Dişli Çark|giant gears in a starry void
Eski Fotoğraf Sokağı|street where half is black and white
Gece ve Gündüz Tek Kare|landscape half day half night
Zaman Kristali Mağarası|cave interior with glowing time crystals
Unutulmuş Gelecek Müzesi|museum interior of future artifacts
Paradoks Kapısı|door standing alone in a field opening to another time
Işık Yılı Koridoru|long corridor interior with stars beyond windows
`);

  G('dreams', 'Rüyalar & Sürreal Dünyalar', 'abstract', 'abstract', ['dreamscape', 'clouds', 'silk', 'orbs', 'collage'], ['enchanted', 'calm', 'eerie', 'glowing', 'quiet'], ['abstract', 'fantasy'], `
Gökyüzünde Kapılar|doors floating in a pastel sky
Ters Yağmur Odası|room interior where rain falls upward
Merdivenler Sonsuzluğa|stairs rising into clouds
Okyanusta Yüzen Ev|house floating on a calm ocean
Eriyen Saatler Çölü|desert with melting clocks
Bulut Yatak Odası|bedroom interior filled with clouds
Dev Ay Sahili|beach with a giant moon close to the horizon
Ayna Göl Sonsuz|endless mirror lake with floating trees
Pembe Kum Tepeleri|pink sand dunes under twin suns
Yüzen Adalar Balıklar|islands with floating fish
Kapı İçinde Kapı|door opening onto another door endlessly
Kağıt Şehir|city made of folded paper
Dev Çiçekler Ovası|plain of enormous flowers
Baş Aşağı Şehir|upside-down city hanging from the sky
Su Altında Oturma Odası|living room interior underwater
Yıldızlı Tavan Çayır|meadow under a ceiling of stars
Dev Satranç Tahtası|giant chessboard landscape
Uçan Balina Gökyüzü|whale floating through a sunset sky
Rüya Treni|train crossing a sea on rails
Kristal Ağaçlar|forest of glass trees
Bulut Merdiveni|stairway of clouds
Tek Ağaç Sonsuz Ova|single tree on an endless white plain
Işık Kürelerinin Bahçesi|garden of floating light orbs
Dev Fincan Gölü|lake inside a giant teacup
Gökyüzü Okyanusu|sky that is an ocean
Kum Saati Odası|room interior filled with sand
Labirent Duvarlar Bulutlar|maze walls in clouds
Yüzen Lambalar|lamps floating over a dark lake
Kaleydoskop Gökyüzü|sky of kaleidoscopic patterns
Uyuyan Dev Dağ|mountain shaped like a sleeping giant
`);
})();
