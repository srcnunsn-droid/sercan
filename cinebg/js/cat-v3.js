/* CineBG Studio — v3: günümüz modern mekanları ve yaratıcı reklam arka planları. */
(function () {
  const CB = window.CB;
  CB.extendArch('modern', {
    center: ['a polished concrete floor with a soft reflection', 'a long communal table', 'a glowing floor light strip', 'a sculptural bench', 'a circular rug'],
    left: ['a floor-to-ceiling glass wall', 'a living green wall of plants', 'a slim steel column', 'a backlit display wall', 'an open-tread staircase'],
    right: ['a row of large LED screens', 'a minimalist reception desk', 'glass meeting pods', 'a wall of open shelving', 'a café counter with pendant lights'],
    far: ['a city skyline beyond the glazing', 'a double-height atrium', 'a softly lit corridor', 'a glowing exit sign over glass doors', 'a mezzanine walkway'],
    floor: ['dark polished concrete', 'dark oak boards', 'dark terrazzo', 'dark rubber flooring'],
    materials: ['glass', 'brushed aluminium', 'pale oak', 'polished concrete', 'matte black steel'],
  });
  CB.extendArch('product', {
    center: ['an empty cylindrical podium', 'a stepped plinth', 'a low round pedestal', 'a flat stone slab', 'a mirrored disc platform'],
    left: ['an arch-shaped backdrop panel', 'a tall slim column', 'a draped silk fabric', 'a sculptural vase', 'a floating sphere'],
    right: ['a stack of geometric blocks', 'a small secondary podium', 'a dried flower arrangement', 'a glass cube', 'a sculptural ring'],
    far: ['a seamless curved cyclorama wall', 'a soft gradient backdrop', 'a window with soft daylight', 'a softly lit wall niche', 'a hazy colour field'],
    floor: ['matte seamless paper floor', 'smooth plaster floor', 'polished stone surface', 'soft sand surface'],
    materials: ['matte plaster', 'travertine', 'brushed metal', 'frosted glass', 'satin fabric'],
  });

  [
    { id: 'modern-city', tr: 'Günümüz Şehir Hayatı', arch: 'modern', ctx: 'mixed', engines: ['skyline', 'city', 'rainglass', 'godrays'], cond: ['lived-in', 'empty', 'wet', 'pristine'], genres: ['urban', 'modern'], items: `
Elektrikli Araç Şarj İstasyonu|EV charging hub at night with glowing charger posts and wet asphalt
Scooter ve Bisiklet Yolu|protected city bike lane with rental scooters and bike racks
Yaya Meydanı LED Ekranlar|pedestrian plaza surrounded by giant LED billboards at dusk
Food Truck Parkı|food truck park with string lights and picnic tables
Cam Ofis Bölgesi|business district of glass towers and landscaped plazas
Çatı Barı Gün Batımı|rooftop bar terrace with lounge seats over the skyline at sunset
Modern Metro Peronu|modern metro platform with glass screen doors and digital signage
Akıllı Yaya Geçidi|smart crosswalk with LED ground lights at a busy junction
Kaykay Parkı Beton|concrete skatepark with bowls and graffiti under an overpass
Kentsel Lineer Park|elevated linear park on an old rail line with planting and benches
Teslimat Merkezi Gece|parcel delivery hub at night with vans and conveyor lights
Otoyol Kavşağı Gece Işıkları|highway interchange at night with long light trails
Sahil Promenadı Modern|modern waterfront promenade with timber decking and lamp posts
Kafe Teras Sokak|pavement café terrace on a tree-lined street
Kentsel Bostan Çatı|urban rooftop vegetable garden with raised beds
Akıllı Otobüs Durağı|digital bus shelter with screens in light rain
Stadyum Dışı Maç Günü|stadium forecourt on match day before gates open
Modern Kütüphane Meydanı|plaza in front of a contemporary public library
Konteyner Pazar Yeri|market built from stacked shipping containers
Gece Kargo Limanı Modern|automated container terminal at night
Kentsel Su Oyun Alanı|plaza fountain with ground jets and lights
Çok Katlı Otopark Çatısı|rooftop of a multi-storey car park at golden hour
Neon Gece Sokağı Modern|modern night street with shopfront signs and reflections
Havalimanı Kalkış Kapısı Dışı|airport curbside with glass canopy at dawn
Yeni Nesil Gökdelen Lobisi Dışı|base of a supertall tower with plaza and fountains
Modern Köprü Gece|cable-stayed bridge lit at night
Kampüs Avlusu|university campus quad with modern buildings
Hastane Girişi Modern|modern hospital entrance with glass atrium
Gece Benzin ve Şarj|combined fuel and charging station at night
Duvar Resmi Sokağı|street with large contemporary murals
Trafik Sıkışıklığı Gece|traffic jam at night seen from an overpass
Yağmurlu Taksi Durağı|taxi rank in the rain with umbrellas
Kentsel Dans Meydanı|street performance square with stage lights
Modern Plaj Kulübü|beach club with daybeds and white umbrellas
Akıllı Şehir Kontrol Odası Penceresi|view over a smart city from a control room window
Kampüs Kütüphanesi Gece|glass library glowing at night
Gece Yarışı Otoparkı|empty parking lot with sodium lights
Mahalle Parkı Akşam|neighbourhood park at dusk with joggers' track
Kentsel Spor Sahası Kafes|rooftop caged football pitch
Gece Pazar Modern|modern night market with LED stalls
` },
    { id: 'modern-work', tr: 'Modern İş & Teknoloji Mekanları', arch: 'modern', ctx: 'int', engines: ['hall', 'godrays', 'tunnel', 'orbs'], cond: ['empty', 'busy-but-empty', 'pristine', 'lit'], genres: ['interior', 'urban', 'modern'], items: `
Ortak Çalışma Alanı|coworking space with long tables, plants and pendant lights
Girişim Ofisi Açık Plan|startup open-plan office with standing desks and glass meeting rooms
Podcast Stüdyosu|podcast studio with acoustic panels, microphones and warm lamps
Yayın ve Oyun Odası|streaming and gaming room with LED strips and multiple monitors
Haber Merkezi Modern|modern newsroom with video walls and desks
Borsa İşlem Salonu|trading floor with rows of screens and tickers
Konferans Sahnesi|tech conference stage with giant screen and empty seats
Veri Merkezi Koridoru|data center aisle with blinking server racks
Tasarım Stüdyosu|design studio with moodboards and large windows
Toplantı Kabini|soundproof meeting pods in an office
Çağrı Merkezi Gece|call center at night with empty desks
Yönetici Ofisi Manzara|executive office with skyline view
Laboratuvar Startup|biotech startup lab with clean benches
Robotik Atölye Modern|modern robotics workshop with arms and test rigs
Ofis Mutfağı|office kitchen with island and coffee machines
Ofis Teras|office roof terrace with lounge seating
Video Prodüksiyon Odası|video edit suite with colour grading monitors
Sunucu Soğutma Odası|server cooling room with blue lights
Uzaktan Çalışma Kafesi|café workspace with laptops and plants
Modern Resepsiyon|minimalist office reception with logo wall
Yazılım Takımı Alanı|software team bay with whiteboards
Siber Güvenlik Operasyon Merkezi|security operations center with threat maps
E-ticaret Depo|e-commerce fulfilment center with robots
Drone Test Alanı|indoor drone test cage
3D Yazıcı Atölyesi|3D printing farm with rows of printers
Müzik Prodüksiyon Odası|home music production studio with synths
Fotoğraf Stüdyosu Modern|modern photo studio with softboxes
Kayıt Stüdyosu Kontrol|recording studio control room
Sanal Prodüksiyon LED Duvar|virtual production stage with LED volume
Ofis Asansör Lobisi|office elevator lobby with marble
Yapay Zeka Araştırma Lab|AI research lab with large displays
Eğitim Sınıfı Modern|modern training room with screens
Ofis Kütüphanesi Sessiz Oda|quiet library room in an office
Ofis Spor Salonu|office gym with equipment
Gece Ofis Koridoru|office corridor at night with motion lights
Modern Banka Şubesi|digital bank branch
Kripto Madencilik Odası|crypto mining room with rigs
` },
    { id: 'modern-home', tr: 'Günümüz Evleri & Yaşam Alanları', arch: 'modern', ctx: 'int', engines: ['hall', 'godrays', 'rainglass', 'orbs'], cond: ['lived-in', 'pristine', 'messy', 'calm'], genres: ['interior', 'modern'], items: `
Minimalist Daire Salon|minimalist apartment living room with low sofa and big windows
İskandinav Oturma Odası|Scandinavian living room with pale wood and soft textiles
Ev Ofisi Gece|home office at night lit by a desk lamp and monitor
Oyun Kurulumu Odası|gaming setup with RGB lights and ultrawide monitor
Akıllı Mutfak|modern kitchen with island and integrated appliances
Endüstriyel Loft|industrial loft with exposed brick and steel windows
Tiny House İçi|tiny house interior with loft bed and clever storage
Bungalov Kabin|holiday cabin with fireplace and forest view
Balkon Bahçe|apartment balcony garden with string lights
Japandi Yatak Odası|japandi bedroom with linen bedding and paper lamp
Çocuk Odası Modern|modern kids room with play tent
Banyo Spa Modern|modern spa bathroom with stone tub
Gece Mutfak Sohbet|kitchen at night with pendant lights
Stüdyo Daire|compact studio apartment
Çatı Katı Penthouse|penthouse with terrace and pool
Ev Sineması Modern|modern home cinema with projector
Ev Spor Köşesi|home gym corner with yoga mat
Kitap Okuma Köşesi|reading nook by a rainy window
Öğrenci Evi|student flat with posters and plants
Bitki Dolu Oda|plant-filled urban jungle room
Ev Stüdyosu İçerik|home content creator studio with ring light
Kış Bahçesi Modern|glass extension garden room
Garaj Atölye Modern|modern garage workshop
Bahçe Ofisi|garden office pod
Ev Girişi Modern|modern entryway with console and mirror
Yemek Odası Modern|dining room with sculptural chandelier
Yaşlı Çift Evi Sıcak|warm lived-in family living room
Paylaşımlı Ev Mutfağı|shared house kitchen with mismatched chairs
Otel Odası Modern|modern hotel room with city view
Airbnb Dağ Evi|A-frame mountain house interior
` },
    { id: 'modern-retail', tr: 'AVM, Mağaza & Ticaret', arch: 'modern', ctx: 'mixed', engines: ['hall', 'city', 'godrays', 'orbs'], cond: ['empty', 'lit', 'pristine', 'busy-but-empty'], genres: ['urban', 'interior', 'modern'], items: `
AVM Atriyumu|shopping mall atrium with escalators and skylight
Spor Ayakkabı Mağazası|sneaker store with illuminated shoe wall
Teknoloji Mağazası|minimal tech store with long wooden display tables
Süpermarket Gece|supermarket aisles at night with bright fridges
Eczane Modern|modern pharmacy with white shelves
Butik Giyim Mağazası|fashion boutique with rails and mirrors
Kozmetik Mağazası|beauty store with lit counters
Yemek Katı|mall food court with neon signage
Otomobil Showroom|car showroom with polished floor and spotlights
Pop-up Mağaza|pop-up store with sculptural displays
Bubble Tea Dükkanı|bubble tea shop with pastel decor
Kitapçı Modern|modern bookstore with tall shelves
Çiçekçi Dükkanı|florist shop full of flowers
Kahve Dükkanı Üçüncü Dalga|specialty coffee bar with espresso machine
Duty Free Havalimanı|airport duty free with perfume displays
Sinema Multiplex Lobi|multiplex cinema lobby
Elektronik Mağaza Gece|electronics store at night with screens
Mobilya Mağazası|furniture showroom
Fırın Pastane|bakery with glass counters
Pazar Market Modern|modern indoor food market
Mücevher Mağazası Modern|jewellery store with spotlit cases
Oyun Mağazası|game store with posters and consoles
Galeri Mağaza|concept store gallery
Otopark Giriş AVM|mall car park entrance
Lüks Alışveriş Caddesi|luxury shopping street at night
Kasiyer Hattı Boş|empty checkout lanes
Vitrin Gece|shop window at night
Outlet Koridoru|outlet mall corridor
Sağlıklı Yaşam Market|organic grocery store
Moda Haftası Podyumu|fashion runway with lights
` },
    { id: 'modern-leisure', tr: 'Spor, Sağlık & Modern Eğlence', arch: 'modern', ctx: 'mixed', engines: ['hall', 'city', 'godrays', 'anamorphic', 'ocean'], cond: ['empty', 'lit', 'pristine', 'lived-in'], genres: ['urban', 'modern'], items: `
Fitness Salonu Gece|gym at night with racks and mirrors
Yoga Stüdyosu|yoga studio with wooden floor and soft light
Padel Kortu|glass padel court under lights
Tırmanma Salonu|indoor climbing gym with coloured holds
E-spor Arenası|esports arena with stage and LED walls
Su Parkı|water park with slides at sunset
Festival Alanı Gece|music festival grounds at night with stages
Kayak Merkezi|ski resort with lifts at dusk
Bowling Modern|modern bowling alley with neon lanes
Sörf Plajı|surf beach with boards at sunrise
Kapalı Havuz Modern|modern indoor pool with skylights
Spa Termal|thermal spa with steam and stone
Trambolin Parkı|trampoline park
Kart Pisti|indoor go-kart track
Sanal Gerçeklik Salonu|VR arcade with headsets
Kaçış Odası|escape room interior
Kampüs Spor Salonu|campus sports hall
Golf Sahası Gün Doğumu|golf course at sunrise
Bisiklet Velodromu|velodrome track
Koşu Parkuru Orman|forest running trail
Basketbol Salonu|basketball arena empty
Tenis Kortu Gece|tennis court at night
Paten Pisti Açık|outdoor ice rink with lights
Glamping Alanı|glamping tents at dusk
Karavan Kampı|camper van site by a lake
Kano Gölü|canoe dock on a lake
Konser Salonu Modern|modern concert hall
Sanat Müzesi Modern|modern art museum gallery
İmmersif Sanat Sergisi|immersive digital art exhibition
Planetaryum|planetarium dome interior
` },
    { id: 'ad-podium', tr: 'Reklam · Ürün Podyumları & Stüdyo Setleri', arch: 'product', ctx: 'studio', engines: ['podium'], cond: ['pristine', 'lit', 'calm', 'opulent'], genres: ['ads', 'abstract', 'interior'], items: `
Pastel Silindir Podyum|pastel cylinder podium on a seamless curved backdrop
Basamaklı Beyaz Podyum|stepped white plinth with soft shadows
Kemerli Fon Podyum|arch-shaped backdrop panel behind a round podium
Pencere Gölgeli Podyum|podium with crisp window shadow patterns
Terrakota Podyum Seti|terracotta podium set with dried flowers
Mermer Silindir Podyum|marble cylinder podium on beige backdrop
Siyah Lüks Podyum|black glossy podium under a narrow spotlight
Cam Küp Podyum|frosted glass cube pedestal with caustic light
Yüzen Disk Podyum|floating disc platform suspended in air
Geometrik Blok Seti|stack of geometric blocks in pastel colours
Ay Işığı Podyum|podium lit by cool moonlight blue
Neon Halkalı Podyum|podium framed by a glowing neon ring
Kum Tepesi Podyum|podium on soft sand dunes in studio
Su Yüzeyi Podyum|podium on a still water surface with ripples
Ayna Zemin Podyum|podium on a mirror floor with reflection
Kumaş Drapeli Podyum|podium with flowing silk drape
Tropik Yaprak Podyum|podium with tropical leaf shadows
Çift Renk Podyum|two-tone podium with colour-blocked wall
Kağıt Kıvrım Seti|set of folded paper shapes
Altın Kenarlı Podyum|podium with brushed gold rim
Pembe Rüya Seti|dreamy pink set with spheres
Mavi Saat Stüdyo|blue twilight studio set
Taş Plaka Ürün Seti|natural stone slabs as product stands
Merdivenli Sahne Seti|staircase sculptural set
Daire Pencere Fon|round window backdrop with light beam
Ürün Döner Tabla|turntable display with spotlight
Minimal Raf Seti|floating wall shelves set
Sonsuz Beyaz Fon|infinite white cyclorama with soft floor shadow
Gradyan Fon Stüdyo|smooth colour gradient backdrop studio
Kubbe Niş Podyum|podium inside a curved wall niche
Bulut Podyum|podium surrounded by soft clouds
Neon Izgara Podyum|podium on a neon grid floor
Seramik Vazolu Set|set with ceramic vases and podiums
Sütunlu Ürün Sahnesi|classical columns product stage
Kum Saati Seti|surreal hourglass set
Işık Hüzmesi Podyum|podium hit by a single light beam through haze
Kristal Podyum|crystal prism pedestal
Ahşap Podyum Doğal|natural wood podium with linen backdrop
` },
    { id: 'ad-surreal', tr: 'Reklam · Yaratıcı & Sürreal Konseptler', arch: 'product', ctx: 'studio', engines: ['podium', 'orbs', 'silk', 'smoke', 'godrays'], cond: ['enchanted', 'pristine', 'dramatic', 'calm'], genres: ['ads', 'abstract', 'fantasy'], items: `
Bulutlu Oda|room filled with soft clouds around a podium
Dev Meyve Dünyası|giant fruit landscape with a product stage
Yüzen Adacık Podyum|floating island podium with a waterfall
Eriyen Saatler Sahnesi|surreal melting forms around a pedestal
Kapı Açılan Gökyüzü|doorway opening onto a sky in a studio
Ters Yerçekimi Odası|anti-gravity room with floating objects
Çöl İçinde Oda|room with sand dunes pouring in
Dev Çiçek Sahnesi|oversized flowers around a plinth
Şeker Kristal Dünyası|sugar crystal landscape
Köpük Bulutu Seti|foam clouds and bubbles set
Okyanus Odası|room flooded with calm sea water
Ay Yüzeyi Ürün Seti|lunar surface product set
Dev Balon Seti|giant balloons in a pastel room
Sonsuz Merdiven|endless staircase sculpture
Kaktüs Pembe Çöl|pink desert with cacti and podium
Işıklı Portal Halkası|glowing portal ring
Su Altı Ürün Sahnesi|underwater product stage with bubbles
Kar Küresi İçinde|inside a snow globe set
Kağıt Origami Şehir|paper origami city
Yağmur Damlası Odası|room of suspended raindrops
Gökkuşağı Merdiveni|rainbow steps set
Dev Oyuncak Blok|giant toy blocks landscape
Sıvı Altın Akış|liquid gold flowing around a plinth
Kristal Mağara Seti|crystal cave product set
Yıldızlı Gece Odası|room with starry night ceiling
Uçan Kumaşlar|flying silk fabrics in a white void
Neon Orman Seti|neon forest set
Buz Blokları Seti|ice blocks set with cold light
Güneş Tutulması Podyum|eclipse backdrop podium
Ayna Labirent|mirror maze set
Mermer Heykel Bahçesi|marble sculpture garden surreal
Dev Kum Saati|giant hourglass in desert
Lav Lambası Dünyası|lava lamp world
Bulut Merdiveni|stairs into clouds
` },
    { id: 'ad-nature', tr: 'Reklam · Doğal Ürün Sahneleri', arch: 'product', ctx: 'studio', engines: ['podium', 'godrays', 'silk', 'orbs'], cond: ['pristine', 'calm', 'lit', 'enchanted'], genres: ['ads', 'nature', 'abstract'], items: `
Yosunlu Taş Podyum|mossy stone pedestal in a misty forest light
Nehir Taşları Ürün Seti|smooth river stones with flowing water
Su Damlalı Yaprak Seti|green leaves with water droplets
Kum ve Deniz Kabuğu|sand with seashells and soft sun
Volkanik Taş Seti|black volcanic rocks with steam
Çiçek Yatağı Seti|bed of fresh flowers around a podium
Buzlu Kayalar|icy rocks with frost
Ahşap Kütük Podyum|wooden log slice podium
Kuru Ot Seti|dried grass and pampas set
Bal Peteği Seti|honeycomb and honey drips
Narenciye Dilimleri|citrus slices with splash
Lavanta Demeti Seti|lavender bunches on linen
Çam Ormanı Podyum|pine forest floor set
Okyanus Kayalığı|ocean rock with waves
Çöl Kum Tepesi Ürün|desert dune product stage
Bambu Seti|bamboo stalks set
Şelale Önü Podyum|podium before a small waterfall
Kar Tanesi Seti|snowflake winter set
Tropik Plaj Ürün|tropical beach product set
Mantar Orman Seti|forest mushrooms set
Gül Yaprakları Seti|rose petals scattered
Kahve Çekirdekleri Seti|coffee beans surface
Zeytin Dalı Seti|olive branch set with stone
Buğday Başakları Seti|wheat ears golden set
Aloe Vera Seti|aloe leaves and gel drops
Kristal Taşlar Seti|crystal geodes set
Bulutlu Gökyüzü Podyum|sky podium in clouds
Sabah Çiyi Seti|morning dew grass set
Su Yüzeyi Halkalar|water ripples surface
Orman Işık Hüzmesi|forest light beam podium
` },
    { id: 'ad-luxury', tr: 'Reklam · Lüks & Premium Fonlar', arch: 'product', ctx: 'studio', engines: ['podium', 'silk', 'anamorphic', 'smoke'], cond: ['opulent', 'pristine', 'dramatic', 'lit'], genres: ['ads', 'abstract'], items: `
Siyah Mermer Altın Damar|black marble with gold veins and spotlight
Kadife Perde Sahnesi|velvet curtain stage with brass details
Parfüm Işık Prizması|perfume set with prism light reflections
Altın Toz Yağmuru|falling gold dust on black
İpek Saten Dalga|satin silk waves in champagne tones
Kristal Avize Fon|crystal chandelier bokeh backdrop
Saat Vitrin Seti|watch display set with dark leather
Mücevher Kutusu Seti|jewellery box set with velvet
Şampanya Kule Seti|champagne set with sparkle
Lüks Otel Lobisi Fon|luxury hotel lobby backdrop
Yat Güverte Seti|yacht deck sunset set
Krom ve Cam Seti|chrome and glass sculptural set
Kırmızı Halı Fon|red carpet backdrop with flashes
Siyah İpek Fon|black silk backdrop
Altın Saat Penceresi|golden hour window luxury interior
Mermer Banyo Seti|marble bathroom product set
Deri ve Metal Seti|leather and metal set
İnci Seti|pearls on satin
Sedef Gradyan|mother of pearl gradient
Bronz Heykel Fonu|bronze sculpture backdrop
Duman ve Spot|smoke and spotlight
Altın Çerçeve Galeri|gilded frame gallery wall
Lüks Araba Stüdyo|luxury car studio with light ceiling
Gece Şehir Penthouse Fon|penthouse night city backdrop
Kristal Bardak Seti|crystal glassware set
Elmas Işıltısı|diamond sparkle macro
Saray Salonu Fon|palace hall backdrop
Siyah Su Yüzeyi|black water surface with ripples
Gümüş Folyo Fon|silver foil backdrop
Akşam Yemeği Lüks Masa|luxury dinner table setting
` },
    { id: 'ad-food', tr: 'Reklam · Yemek & İçecek Fonları', arch: 'product', ctx: 'studio', engines: ['podium', 'smoke', 'orbs', 'godrays'], cond: ['pristine', 'lit', 'lived-in', 'calm'], genres: ['ads', 'abstract', 'interior'], items: `
Meyve Sıçraması|fruit splash in water against colour backdrop
Buzlu İçecek Seti|ice cubes and condensation set
Kahve Buharı Seti|coffee cup steam on dark wood
Rustik Mutfak Tezgahı|rustic kitchen counter with flour and herbs
Pizza Fırını Fon|wood-fired pizza oven backdrop
Mermer Tezgah Pasta|marble counter with pastries
Burger Dumanlı Seti|smoky grill set
Süt Sıçraması|milk splash crown
Çikolata Akışı|melting chocolate flow
Sushi Taş Tabak|slate plate sushi set
Kokteyl Bar Fon|cocktail bar backdrop with bokeh
Bira Köpüğü Seti|beer foam set
Baharat Masası|spice table with bowls
Kahvaltı Masası Güneş|breakfast table in morning sun
Smoothie Pastel Seti|smoothie pastel set
Şarap Mahzeni Fon|wine cellar backdrop
Taze Sebze Pazar|fresh vegetables market set
Dondurma Pastel|ice cream pastel set
Çay Seremonisi|tea ceremony set
Ekmek Fırını|bakery oven bread set
Mangal Ateşi|barbecue fire set
Limonata Yaz|summer lemonade set
Makarna Mutfak|pasta kitchen set
Ramen Buharı|ramen bowl steam
Kurabiye Fırın Tepsisi|cookie tray set
Su Damlası Şişe|bottle with water droplets
Bal Akışı|honey drizzle set
Kahve Çekirdeği Yağmuru|falling coffee beans
Taze Ot Saksıları|fresh herb pots window
Meyve Tabağı Tepeden|fruit platter top-down
` },
    { id: 'ad-tech', tr: 'Reklam · Teknoloji & Otomotiv Fonları', arch: 'product', ctx: 'studio', engines: ['podium', 'tunnel', 'anamorphic', 'orbs', 'rainglass'], cond: ['lit', 'pristine', 'dramatic', 'wet'], genres: ['ads', 'abstract', 'scifi'], items: `
Otomobil Stüdyosu Işık Tavanı|car studio with light-box ceiling and glossy floor
Neon Tünel Araç Reveal|neon tunnel for vehicle reveal
Telefon Lansman Sahnesi|smartphone launch stage with spotlights
Kulaklık Ses Dalgası Fon|headphones set with sound wave light
Saat Teknolojik Fon|smartwatch set with holographic UI glow
Oyun Konsolu Seti|gaming console set with RGB light
Laptop Masa Seti|laptop desk setup with soft window light
Drone Ürün Seti|drone hovering set with haze
Elektrikli Araç Şarj Seti|EV with charging light trails
Robot Ürün Stüdyosu|robot product studio
Sanal Gerçeklik Seti|VR headset set with light rings
Islak Asfalt Araba Gece|wet asphalt car night set
Çöl Yolu Araba Reklamı|desert road car commercial backdrop
Dağ Yolu Araba Reklamı|mountain road car commercial
Lazer Izgara Fon|laser grid backdrop
Hologram Ürün Seti|hologram product reveal
Akıllı Ev Ürün Seti|smart home device set
Kamera Ürün Seti|camera product set on stone
Bilgisayar Parçaları Makro|computer parts macro set
Hız Işık İzleri|speed light trails backdrop
Garaj Stüdyo Gece|garage studio night car
Uzay Teması Ürün|space-themed product set
Su Geçirmez Test Seti|water splash test set for gadgets
Duman Reveal Seti|smoke reveal for product launch
Fiber Optik Işık|fiber optic light backdrop
Karbon Fiber Doku|carbon fibre texture set
Endüstriyel Beton Stüdyo|industrial concrete studio
Gelecek Şehir Araba|future city car backdrop
Pist Reklamı|race track commercial set
Kar Yolu Araba|snowy road car commercial
` },
  ].forEach(CB.addGroup);
})();
