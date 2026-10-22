/* CineBG Studio v7 — doğa, mevsim, gökyüzü ve atmosfer başlıkları (25 grup × 30 mekân). */
(function () {
  const CB = window.CB;
  const G = [
    {
      id: 'd7-waterfalls', tr: 'Şelaleler & Nehir Vadileri', arch: 'nature', ctx: 'ext',
      engines: ['waterfall', 'forest', 'mountains', 'godrays'], cond: ['pristine', 'misty', 'humid', 'calm', 'rainy'], genres: ['nature', 'landscape', 'season'],
      items: `
Perde Şelalesi|wide curtain waterfall pouring over a basalt ledge into a churning green plunge pool
Basamaklı Şelale|tiered cascade stepping down mossy limestone shelves through a narrow forest gorge
İnce Tül Şelale|thin ribbon waterfall falling hundreds of metres down a sheer granite cliff into mist
Orman İçi Şelale|hidden waterfall deep in a fern forest, spray glowing in a single shaft of sunlight
Turkuaz Havuzlu Şelale|small waterfall feeding a turquoise pool rimmed with white travertine and hanging roots
Gökkuşaklı Şelale|thundering waterfall throwing a permanent rainbow across its rising spray cloud
Donmuş Şelale|frozen waterfall hanging as blue ice columns over a snow-covered canyon floor
Mağara Ağzından Şelale|waterfall dropping through the open roof of a cavern onto a sunlit rock pool
Kanyon Şelalesi|waterfall plunging into a red sandstone slot canyon, water glowing orange in reflected light
Yosunlu Kaya Kaskadı|cascade sliding over emerald moss-covered boulders under dripping rainforest canopy
İkiz Şelaleler|twin waterfalls side by side pouring off a basalt plateau into one deep green river
Uçurumdan Denize Şelale|waterfall leaping off a coastal cliff straight into the surf of a rocky cove
Taş Köprülü Dere|clear mountain stream running under an old mossy stone arch bridge in a beech valley
Nehir Kıvrımı Vadisi|green valley floor where a silver river loops in wide meanders between steep hills
Dar Boğaz Nehri|deep river gorge with vertical walls, emerald water and a sliver of sky above
Bazalt Sütunlu Şelale|waterfall framed by hexagonal basalt columns in a dark volcanic amphitheatre
Kayalık Çağlayan|white-water rapids tumbling between giant grey boulders in a pine-lined valley
Sisli Vadi Nehri|river winding through a valley filled with morning mist, peaks rising above the fog
Sonbahar Şelalesi|waterfall framed by flaming red maples, fallen leaves swirling in the pool below
Gizli Şelale Havuzu|secluded swimming hole beneath a small waterfall, smooth rocks and clear shallows
Yüksek Dağ Şelalesi|alpine waterfall fed by snowmelt, dropping from a hanging valley below glaciers
Tropik Şelale|tropical waterfall surrounded by giant leaves, vines and red flowers in humid air
Nehir Ağzı Deltası|river delta fanning into the sea in braided channels of sand and shallow water
Söğütlü Nehir Kenarı|slow river edged with weeping willows, their branches trailing in the current
Taş Basamaklı Dere|stream stepping down a staircase of flat stones under a canopy of birch trees
Gece Şelalesi|waterfall under a full moon, spray silvered and the pool black and glassy
Değirmenli Dere|old wooden watermill beside a rushing stream in a quiet wooded valley
Kireç Taşı Terasları Nehri|river spilling over natural limestone terraces in a chain of milky blue pools
Buzul Nehri Vadisi|braided glacial river spreading grey-blue channels across a wide gravel valley
Şelale Arkası Görünüm|view from behind a waterfall, the falling curtain of water framing the green valley
`,
    },
    {
      id: 'd7-lakes', tr: 'Dağ Gölleri & Göl Kıyıları', arch: 'landscape', ctx: 'ext',
      engines: ['terrain3d', 'mountains', 'countryside', 'clouds'], cond: ['calm', 'pristine', 'misty', 'quiet', 'windswept'], genres: ['landscape', 'nature', 'season'],
      items: `
Ayna Dağ Gölü|perfectly still alpine lake mirroring jagged snow peaks at dawn
Turkuaz Buzul Gölü|milky turquoise glacial lake below a hanging glacier and scree slopes
İskeleli Göl|small wooden jetty reaching into a calm lake with forested hills behind
Kamış Kıyısı|reed-lined lake shore with a hidden channel and low mist over the water
Krater Gölü|round crater lake filling an extinct volcano, steep green rim all around
Adacıklı Göl|lake dotted with tiny pine-covered islands under a pale northern sky
Kayalık Göl Kıyısı|granite slab shoreline sloping into clear cold water at a high mountain lake
Göl Kenarı Kulübe|lone wooden cabin on a grassy point jutting into a glassy lake
Sazlık Gün Batımı|sunset over a reed marsh lake, silhouetted bulrushes and orange water
Sisli Göl Sabahı|lake shrouded in rising morning mist, a rowing boat moored at the edge
Donmuş Göl|frozen lake surface with cracked clear ice and snow drifts, mountains behind
Kızıl Algli Göl|shallow lake tinted pink by algae, white salt crust along its shores
Orman Gölü|dark forest pond ringed by tall spruces, lily pads and fallen logs
Bulutların Altında Göl|vast lake under a towering bank of storm clouds and slanting light
Çakıllı Göl Plajı|pebble beach on a clear lake, rounded stones visible beneath the water
Göl Ortasında Ağaç|single tree standing in shallow lake water, perfectly reflected
Taş Kayıkhane|old stone boathouse with an arched door opening onto a still lake
Yüksek Plato Gölü|wind-ruffled lake on a bare high plateau beneath an enormous sky
Nilüferli Gölet|lotus and water lilies covering a quiet pond, a small bridge across it
Göl Üstü Yıldızlar|lake at night reflecting the Milky Way, dark mountain outline around
Bataklık Göl Kenarı|cypress trees rising from a still swamp lake, moss hanging from branches
Sonbahar Göl Kıyısı|lake shore lined with golden larches reflected in deep blue water
Kumsallı Dağ Gölü|small sandy beach on an alpine lake with clear shallows and peaks behind
Göl Kenarı Fener|small lighthouse on a rocky point of a great inland lake
Rüzgarlı Göl|wind-whipped lake with whitecaps and bending grasses on the shore
Taş Seddeli Baraj Gölü|reservoir behind an old stone dam with a spillway and forested slopes
Uçurum Kenarı Göl|lake viewed from a cliff edge high above, tiny shoreline far below
Volkanik Siyah Kıyı|lake with black volcanic sand shore and steaming vents nearby
Mavi Saat Gölü|lake in deep blue hour, a few cabin windows glowing on the far shore
Kar Kenarlı Göl|half-frozen mountain lake edged with snow and blue meltwater
`,
    },
    {
      id: 'd7-blossom', tr: 'Çiçek Tarlaları & İlkbahar', arch: 'landscape', ctx: 'ext',
      engines: ['countryside', 'forest', 'clouds', 'silk'], cond: ['pristine', 'calm', 'humid', 'quiet'], genres: ['landscape', 'season', 'nature'],
      items: `
Lale Tarlası Şeritleri|endless stripes of red, yellow and pink tulip fields running to the horizon
Lavanta Sıraları|rows of purple lavender converging toward a lone stone farmhouse
Kiraz Çiçeği Yolu|path tunnelled by blooming cherry trees, petals carpeting the ground
Haşhaş Çiçekli Tepe|rolling hill covered in red poppies under a soft spring sky
Ayçiçeği Denizi|sea of sunflowers facing the low morning sun in a flat plain
Kolza Tarlası|bright yellow rapeseed field with a single dirt track through it
Badem Bahçesi|almond orchard in white blossom on a dry terraced slope
Yabani Çiçek Çayırı|wildflower meadow with daisies, cornflowers and tall grass in breeze
Mor Salkım Tüneli|walkway roofed by hanging wisteria in lilac clusters
Elma Çiçekli Bahçe|old apple orchard in pink blossom with long grass between the trees
Lupin Kıyısı|purple and pink lupins lining a lake shore below mountains
Çay Bahçesi Teraslar|bright green tea terraces fresh with new spring shoots
Bluebell Ormanı|beech woodland floor carpeted in blue bell flowers in soft light
Pamuk Çiçekli Ova|plain of white flowering cotton under a pale haze
Şakayık Bahçesi|garden of huge pink peonies with a wooden pergola
Ormanda Ilk Yeşil|forest with the first lime-green leaves and shafts of spring light
Erik Çiçekli Köy Yolu|country lane lined with plum trees in white blossom
Ilgın Çiçekli Sahil|coastal dunes covered in pink flowering tamarisk shrubs
Gelincikli Buğday|young green wheat field speckled with scarlet poppies
Nergis Yamacı|hillside covered in wild yellow daffodils under grey clouds
Lavanta Gün Batımı|lavender field at sunset with a lone tree silhouetted
Gül Bahçesi|rose garden with arches, gravel paths and a stone fountain
Çiçekli Dağ Çayırı|alpine meadow of gentians and buttercups below snowy peaks
Bahar Selinde Çayır|meadow with spring floodwater pooling among new grass
Kır Çiçekli Demiryolu|disused railway line overgrown with spring wildflowers
Yasemin Sarkan Duvar|old stone wall draped in white jasmine beside a narrow lane
Manolya Ağacı Avlusu|courtyard dominated by a magnolia tree in full pink bloom
Çiçek Tarlası Seraları|rows of open greenhouses and flower beds in bloom
Bahar Yağmuru Çayırı|meadow after spring rain, droplets on petals and soft overcast light
Gökkuşaklı Çiçek Vadisi|valley of mixed wildflowers with a rainbow after a shower
`,
    },
    {
      id: 'd7-autumn', tr: 'Sonbahar Ormanları', arch: 'nature', ctx: 'ext',
      engines: ['forest', 'godrays', 'terrain3d', 'countryside'], cond: ['autumnal', 'misty', 'calm', 'quiet', 'rainy'], genres: ['nature', 'season', 'landscape'],
      items: `
Kızıl Akçaağaç Ormanı|forest of blazing red maples, leaves falling through slanting light
Altın Huş Koruluğu|birch grove with golden leaves and white trunks on a carpet of yellow
Yapraklı Orman Yolu|forest road covered in fallen orange leaves curving out of sight
Sisli Sonbahar Vadisi|valley of copper-coloured woods with low mist in the hollows
Kayın Ormanı Katedrali|tall beech trunks rising like columns under a bronze canopy
Sonbahar Göl Yansıması|lake reflecting hillsides of orange, red and evergreen trees
Ahşap Köprülü Dere|small wooden footbridge over a stream lined with yellow trees
Kestane Ormanı|chestnut forest floor scattered with spiky husks and brown leaves
Altın Karaçam Yamacı|mountainside of golden larches beneath the first snow on the peaks
Yağmurlu Sonbahar Patikası|wet forest trail with puddles reflecting orange leaves
Meşe Korusu Akşamı|ancient oak grove in amber evening light
Sonbahar Çiftlik Yolu|country lane bordered by hedgerows and trees turning gold
Yaprak Kaplı Merdiven|old stone stairs in a park buried in fallen leaves
Kızıl Asmalar Yamacı|vineyard slope with red and gold vines after harvest
Sonbahar Uçurum Ormanı|cliffside forest of red trees above a winding river gorge
Yosunlu Kütük ve Mantar|fallen log covered in moss and mushrooms on an autumn forest floor
Göl Kenarı Kızıl Ağaç|single crimson maple on a rocky lake shore
Sonbahar Park Bankı|empty park bench under a golden canopy, leaves drifting down
Dağ Geçidi Sonbaharı|mountain pass road through valleys of multicoloured forest
Sisli Kavak Sırası|row of yellow poplars disappearing into autumn fog
Sonbahar Şelalesi Ormanı|forest stream cascading between orange-leaved trees
Bakır Renkli Eğrelti|hillside of rust-coloured bracken and scattered birches
Orman Kulübesi Sonbahar|log cabin in a clearing surrounded by flaming trees, smoke from the chimney
Kızıl Yaprak Tüneli|tunnel of red leaves over a narrow village road
Sonbahar Tepe Panoraması|rolling hills of patchwork autumn forest under a big sky
Yağmur Sonrası Orman|dripping autumn forest with dark wet trunks and glowing leaves
Ginkgo Avlusu|courtyard carpeted in bright yellow ginkgo leaves
Orman Kenarı Çayır|meadow of tawny grass meeting a wall of colourful forest
Sonbahar Nehir Kıvrımı|river bend lined with trees in every shade of orange
İlk Kırağı Sabahı|autumn forest edge coated in the first frost at sunrise
`,
    },
    {
      id: 'd7-winter', tr: 'Kış Masalı & Karlı Köyler', arch: 'landscape', ctx: 'ext',
      engines: ['mountains', 'countryside', 'aurora', 'glacier'], cond: ['snowbound', 'frozen', 'quiet', 'calm', 'windswept'], genres: ['landscape', 'season'],
      items: `
Karlı Dağ Köyü|mountain village of wooden houses buried in snow, warm windows glowing
Kar Altında Çam Ormanı|pine forest heavy with snow, branches bent under the weight
Donmuş Nehir Vadisi|valley with a frozen river winding between snowy banks
Karlı Kilise Tepesi|small chapel on a snowy hill with a lone path of footprints
Kış Masalı Köprüsü|arched stone bridge over an icy stream in a snow-covered forest
Kar Fırtınası Yolu|rural road vanishing into a blizzard between snow poles
Buzlu Göl Kulübesi|ice-fishing hut on a frozen lake under a pink winter sky
Karlı Çiftlik Ahırı|red barn and fence in a field of deep untouched snow
Kar Kaplı Dağ Geçidi|high pass road cut through towering walls of snow
Donmuş Şelale Vadisi|frozen waterfall in a snowy gorge glowing blue
Kar Altında Kasaba Meydanı|small town square under fresh snow, lamps lit at dusk
Karlı Huş Ormanı|white birches in a white forest, soft grey light
Kış Gün Batımı Tepeleri|rolling snowy hills catching pink and orange sunset light
Kar Kaplı Tren Yolu|railway line curving through a snowy forest, tracks half covered
Kış Bahçesi Çiti|snow-covered picket fence and frozen garden at dawn
Kardan Ağır Kulübe|log cabin with snow piled on its roof and a stack of firewood
Karlı Orman Açıklığı|clearing in a snowy forest under falling flakes
Buz Tutmuş Liman|small harbour with frozen water and snow-covered boats
Kış Yaylası|high plateau of endless snow under a deep blue sky
Kar Kaplı Kale Tepesi|ruined castle on a hilltop blanketed in snow
Karla Örtülü Bağlar|vineyard rows outlined in snow on gentle slopes
Kış Gecesi Köy Sokağı|narrow village lane at night, snow falling through lamplight
Rüzgar Savrulmuş Kar Tepeleri|wind-sculpted snow drifts with sharp ridges on open moorland
Donmuş Bataklık|frozen marsh with ice-locked reeds under a pale sun
Kar Altında Mezarlık|old churchyard with snow-capped headstones and bare trees
Karlı Dağ Kulübesi Patikası|snowshoe trail leading uphill to a lit mountain hut
Kırağılı Ağaç Sırası|row of trees coated in hoarfrost along a misty road
Kış Gölü Buz Desenleri|frozen lake with trapped bubbles and cracks in clear black ice
Karlı Orman Yolu Geceleyin|forest road at night in heavy snowfall, a single streetlight
Noel Pazarı Karlı Meydan|empty Christmas market stalls in a snowy old-town square, lights strung overhead
`,
    },
    {
      id: 'd7-storms', tr: 'Fırtına Kovalama & Süper Hücreler', arch: 'sky', ctx: 'sky',
      engines: ['storm', 'clouds', 'countryside'], cond: ['stormy', 'dramatic', 'windswept', 'dark', 'rainy'], genres: ['season', 'landscape', 'nature'],
      items: `
Süper Hücre Mothership|rotating supercell cloud shaped like a stacked saucer over flat farmland
Duvar Bulutu|lowering wall cloud beneath a storm base, rain curtains to the side
Mammatus Gökyüzü|sky filled with pouch-like mammatus clouds lit orange at sunset
Şimşek Çatalı Ova|forked lightning striking the open prairie under a black sky
Raf Bulutu Önü|shelf cloud advancing over a wheat field like a rolling wave
Hortum Uzaktan|distant tornado funnel touching down on an empty plain
Toz Fırtınası Duvarı|towering haboob dust wall rolling toward a desert highway
Yağmur Perdesi Vadisi|grey rain shafts sweeping across a green valley
Fırtına Öncesi Sarı Işık|eerie yellow pre-storm light over a farm and barn
Örs Bulutu Gün Batımı|giant anvil cumulonimbus glowing pink in the evening
Denizde Su Hortumu|waterspout spinning over a dark sea near the coast
Gece Şimşek Tarlası|night lightning illuminating clouds from within over fields
Dolu Fırtınası Yolu|country road under a green-tinged hail storm sky
Fırtına Arası Güneş|sun breaking through a gap in storm clouds onto a single field
Fırtına Kovalayan Yol|straight empty highway running toward a massive storm
Dağ Üstü Fırtına|thunderstorm building over a mountain ridge
Sahil Fırtınası|storm surf pounding a rocky shore under heavy clouds
Ufukta Çoklu Şimşek|many lightning bolts striking at once along the horizon
Kasırga Gözü|calm centre of a hurricane with walls of cloud around a blue hole
Fırtına Sonrası Gökkuşağı|double rainbow over soaked fields as the storm departs
Rüzgar Turbinleri ve Fırtına|wind turbines on a ridge under an approaching storm
Kum Fırtınası Çölde|sandstorm swallowing desert dunes and a lone road sign without text
Göl Üstünde Fırtına|storm clouds reflected on a choppy lake
Elektrik Hatları Fırtınası|power lines receding across a plain under a lightning sky
Silo ve Süper Hücre|grain silos dwarfed by a huge rotating storm
Fırtına Altında Kasaba|small town under a dark green storm sky, streets empty
Gece Kızıl Şimşek|rare upward red sprite lightning above a distant storm
Sisli Fırtına Tepeleri|storm clouds dragging fog across hilltops
Muson Yağmuru Ovası|monsoon downpour over flooded green paddies
Fırtına Sonu Altın Işık|golden light flooding a valley at the trailing edge of a storm
`,
    },
    {
      id: 'd7-stargaze', tr: 'Yıldız Gözlemi & Gece Gökyüzü', arch: 'nature', ctx: 'ext',
      engines: ['galaxy', 'eclipse', 'mountains', 'dunes'], cond: ['calm', 'quiet', 'cosmic', 'pristine'], genres: ['season', 'nature', 'space'],
      items: `
Samanyolu Çölü|Milky Way arching over silent desert dunes
Gözlemevi Kubbesi|observatory dome open to a star-filled sky on a mountain summit
Yıldız İzleri Kayası|star trails circling above a lone rock pinnacle
Gece Göl Yansıması|calm lake reflecting a sky dense with stars
Kamp Ateşi Yıldızlar|empty campsite with a smouldering fire under the Milky Way
Ağaç Silueti Yıldızlar|lone twisted tree silhouetted against the galactic core
Dağ Zirvesi Gece|snowy summit beneath a sky of stars and faint airglow
Meteor Yağmuru Ovası|meteors streaking across a dark sky above open grassland
Antik Taş Çember Gece|standing stones in a circle under a starry night
Kanyon Kenarı Gece|canyon rim at night, stars filling the gap above
Teleskop Kampı|telescope set up on a grassy hill under the stars, empty chairs beside it
Işık Kirliliksiz Kıyı|remote coastline under a pitch-dark sky full of stars
Yıldızlı Tuz Gölü|salt flat at night with stars mirrored in a thin film of water
Gece Çadır Işığı|single tent glowing softly under the Milky Way in the mountains
Kutup Gecesi Yıldızlar|polar night sky with stars above snow fields
Ay Doğuşu Dağlar|full moon rising over a mountain ridge at dusk
Hilal ve Venüs|thin crescent moon and bright Venus above a twilight horizon
Gece Plajı Yıldızlar|empty beach at night, waves glowing faintly under stars
Galaktik Merkez Kanyon|galactic core hanging above red rock canyon walls
Çöl Kervan Yolu Gece|caravan track through dunes under a vast star dome
Radyo Teleskopları|radio telescope dishes pointing at the night sky on a plateau
Zodyak Işığı|faint pyramid of zodiacal light rising after sunset over hills
Gece Bulutları|noctilucent clouds glowing electric blue in the summer night sky
Yıldız Altında Kulübe|dark mountain hut beneath a sky of countless stars
Volkan Üstü Yıldızlar|volcano crater rim under the Milky Way
Gece Orman Açıklığı|forest clearing open to the stars, trees black around the edges
Ay Işıklı Kum Tepeleri|dunes lit silver by moonlight with sharp shadows
Yıldızlı Kayalık Koy|rocky cove at night, Milky Way over the sea
Gece Yarısı Tarlası|wheat field at midnight under stars and a faint aurora
Andromeda Gökyüzü|clear sky with the Andromeda galaxy visible above a ridge
`,
    },
    {
      id: 'd7-aurora', tr: 'Kuzey Işıkları Diyarları', arch: 'nature', ctx: 'ext',
      engines: ['aurora', 'glacier', 'mountains', 'countryside'], cond: ['frozen', 'snowbound', 'calm', 'quiet', 'enchanted'], genres: ['season', 'nature', 'landscape'],
      items: `
Fiyort Üstü Aurora|green aurora rippling over a deep fjord and mountains
Kırmızı Kulübe Aurora|red fishing cabin on stilts under dancing northern lights
Donmuş Göl Aurora|frozen lake reflecting a swirling green and violet aurora
Buzul Lagünü Aurora|icebergs in a lagoon lit by the northern lights
Kar Ormanı Aurora|snow-laden spruce forest under curtains of aurora
Aurora Taç|aurora corona converging directly overhead like a crown
Tundra Aurora|flat tundra under faint green bands and stars
Mor Aurora Kıyısı|rare purple aurora above a black sand beach
Aurora ve Şelale|frozen waterfall framed by northern lights
Cam İglu Gecesi|glass igloo on snow under a vivid aurora
Aurora Dağ Zirvesi|sharp snowy peak with aurora rising behind it
Kuzey Işıkları Köyü|small arctic village with lit windows under aurora
Aurora Altında Yol|empty icy road leading toward aurora on the horizon
Aurora Liman|harbour with fishing boats beneath the northern lights
Kutup Ayısız Buz Sahili|pack ice shoreline under green aurora
Aurora Kaya Arkı|natural rock arch framing the northern lights
Aurora Ren Geyiği Çiti|empty reindeer corral fence under aurora
Aurora Kilise|small wooden church in snow under the aurora
Kırmızı Yeşil Aurora|layered red and green aurora above dark hills
Aurora ve Ay|aurora shimmering beside a bright full moon
Aurora Nehir Kıvrımı|winding frozen river reflecting northern lights
Aurora Bulut Arası|aurora glimpsed through breaking clouds over mountains
Aurora Fener|lighthouse on a cape beneath aurora
Aurora Kar Tepeleri|wind-sculpted snow ridges under green light
Aurora Sauna Kulübesi|lakeside sauna hut with steam rising under aurora
Aurora Çam Silüeti|silhouetted pines against a bright aurora band
Aurora Volkan|volcanic landscape with lava field under northern lights
Aurora Kar Fırtınası Sonrası|clearing sky after a snowstorm with emerging aurora
Aurora Taş Köprü|old stone bridge in snow with aurora above
Aurora Buz Mağarası Girişi|ice cave entrance glowing blue under the aurora
`,
    },
    {
      id: 'd7-reefs', tr: 'Mercan Resifleri & Lagünler', arch: 'water', ctx: 'water',
      engines: ['coral', 'underwater', 'ocean'], cond: ['pristine', 'calm', 'deep', 'glowing'], genres: ['nature', 'season'],
      items: `
Renkli Mercan Bahçesi|shallow reef garden of branching corals in pink, orange and purple
Lagün Kum Dibi|bright sandy lagoon floor with rippled sand and scattered coral heads
Mercan Duvarı Uçurumu|reef wall dropping into deep blue, sea fans along its face
Masa Mercanları|layers of table corals stacked like terraces in clear water
Deniz Çayırı|seagrass meadow swaying in a sunlit shallow bay
Mercan Kanyonu|narrow channel between tall coral pinnacles
Batık Teknesi Resif|small sunken boat overgrown with coral and anemones
Mangrov Kökleri Sualtı|tangled mangrove roots underwater with light filtering down
Dev Deniz Yelpazeleri|giant purple sea fans on a reef slope
Gece Resifi|reef at night with corals extending glowing tentacles
Atol Lagünü Havadan|ring-shaped atoll with turquoise lagoon from above
Anemon Tarlası|field of swaying anemones on a rocky reef
Mavi Delik|deep blue hole in a shallow reef, dark circle in turquoise
Mercan Mağarası|underwater cave in a reef with light beams through openings
Deniz Kaplumbağası Kumsalı|empty sandy reef flat where sea turtles nest
Lagün Sığlığı Yıldızlar|lagoon shallows scattered with starfish
Mercan Ağartması|bleached white corals under harsh light, eerie stillness
Yumuşak Mercan Bahçesi|soft corals in orange and red waving in the current
Su Üstü Bungalovlar|overwater bungalows on stilts above a clear lagoon
Resif Kenarı Dalgaları|waves breaking on the outer reef edge seen from underwater
Dev Beyin Mercanı|huge brain coral boulder on a sandy bottom
Ada Lagünü Kıyısı|palm-fringed island lagoon with glassy water
Kelp Kenarı Resif|reef transitioning into a dark kelp forest
Mercan Arkı|natural coral arch underwater with sunbeams
Lagün Gün Batımı|lagoon at sunset, water glowing gold and pink
Derin Resif Mavi|deep reef slope fading into indigo darkness
Kum Kanalları|sand channels between coral ridges seen from above
Mercan Ve Işık Huzmesi|sunbeams fanning through clear water onto coral
Fırtına Sonrası Lagün|cloudy lagoon water after a storm, silt drifting
Biyolüminesan Lagün|lagoon at night glowing blue with bioluminescent plankton
`,
    },
    {
      id: 'd7-volcanic', tr: 'Volkan Adaları & Siyah Kumsallar', arch: 'nature', ctx: 'ext',
      engines: ['lava', 'ocean', 'terrain3d'], cond: ['steaming', 'dormant', 'windswept', 'dramatic', 'glowing'], genres: ['nature', 'landscape', 'season'],
      items: `
Siyah Kum Kumsalı|black sand beach with white surf and sea stacks offshore
Bazalt Sütun Mağarası|sea cave lined with hexagonal basalt columns
Okyanusa Akan Lav|lava flowing into the ocean, huge plumes of steam
Volkan Konisi Adası|perfect volcanic cone island rising from a calm sea
Krater Kenarı Yürüyüş|crater rim trail with steaming vents and sulphur crust
Lav Tüneli İçi|lava tube with smooth glassy walls and a skylight
Yeşil Kumsal|olivine green sand beach in a volcanic bay
Siyah Kayalık Koy|cove of jagged black lava rock and turquoise water
Yosunlu Lav Tarlası|ancient lava field covered in soft green moss
Kükürt Göl Krateri|acidic turquoise crater lake with yellow sulphur shores
Gece Lav Gölü|glowing lava lake in a crater at night
Volkan Kül Çölü|grey ash desert at the foot of a volcano
Buharlı Jeotermal Vadi|valley of steaming fumaroles and mud pools
Kıyıda Deniz Yığınları|tall basalt sea stacks off a black beach
Volkan Ve Ay|volcano silhouetted against a rising moon
Siyah Kum Tepeleri|black sand dunes curving toward the sea
Lav Kemer Kıyı|natural lava arch over crashing waves
Fumarol Sahili|steam vents on a rocky shore beside the sea
Volkanik Ada Limanı|small harbour in a caldera bay
Kül Kaplı Orman|forest of grey trunks buried in volcanic ash
Lav Akıntısı Yolu|road cut through by a cooled lava flow
Volkan Patlama Gökyüzü|distant eruption lighting clouds red above an island
Gayzer Ovası|geyser erupting on a steaming plain
Siyah Kumda Buz Parçaları|chunks of glacier ice scattered on a black beach
Krater İçi Orman|forest filling an old volcanic crater
Volkanik Kayalık Patika|path through sharp black rock to a sea lookout
Lav Gölü Kıyısı|edge of a cooling lava lake with a crusted surface
Kızıl Cüruf Konisi|red cinder cone in a barren landscape
Sıcak Su Kaynağı Havuzu|natural hot spring pool steaming among lava rocks
Volkan Gölü Adası|island inside a lake inside a volcano
`,
    },
    {
      id: 'd7-saltflats', tr: 'Tuz Düzlükleri & Ayna Göller', arch: 'landscape', ctx: 'ext',
      engines: ['saltflat', 'dunes', 'clouds'], cond: ['calm', 'scorching', 'pristine', 'quiet'], genres: ['landscape', 'nature', 'season'],
      items: `
Sonsuz Tuz Aynası|thin water film on a salt flat mirroring the whole sky
Altıgen Tuz Desenleri|hexagonal salt crust patterns stretching to the horizon
Pembe Tuz Gölü|pink salt lake with white crust shores
Tuz Gölü Gün Batımı|salt lake reflecting a fiery sunset
Tuz Tepecikleri|harvested salt piles in rows on a white plain
Kuru Göl Yatağı|cracked dry lakebed with deep polygon fissures
Aynalı Göl Bulutları|cumulus clouds perfectly doubled in a flooded salt flat
Tuz Adası Kaktüsler|rocky island of giant cacti in a salt desert
Tuz Kristalleri Kıyı|salt crystal formations on a shallow lake edge
Gece Tuz Düzlüğü|salt flat under moonlight glowing white
Tuz Ovası Yolu|straight road disappearing across a salt plain
Flamingo Gölü Kıyısı|shallow saline lagoon with distant flamingo flocks
Turkuaz Tuz Havuzları|evaporation ponds in turquoise and pink squares
Tuz Gölü Fırtınası|storm clouds over a salt flat, rain on the horizon
Kum ve Tuz Sınırı|edge where dunes meet a white salt pan
Tuz Mağarası Girişi|entrance to a salt mine carved in white rock
Buzlu Gibi Tuz Kabuğu|salt crust lifted into plates like ice floes
Aynalı Göl Ağacı|single dead tree standing in a mirror lake
Tuz Gölü Şafak|dawn over a salt lake in soft blue and peach
Uzak Dağlar Tuz Ovası|salt plain stretching to far violet mountains
Tuz Göl Çizgileri|tire tracks fading into a pristine white flat
Kırmızı Kaya ve Tuz|red rock outcrops rising from a salt flat
Tuz Bataklığı|crusted marsh with salt-whitened reeds
Su Seviyesi Kıyı|shoreline of a shrinking salt lake with rings
Ayna Göl Yıldızlar|night sky mirrored in still saline water
Ölü Deniz Kıyısı|salt-encrusted shoreline with mineral columns
Tuz Düzlüğü Serap|heat mirage shimmering over the white plain
Tuz Gölü Rüzgar|wind pushing a thin sheet of water across a salt flat
Tuz Ocakları Tarihi|abandoned salt works with wooden sluices
Beyaz Sessizlik|nothing but white salt and blue sky, total minimalism
`,
    },
    {
      id: 'd7-arches', tr: 'Kumtaşı Kemerler & Doğal Köprüler', arch: 'landscape', ctx: 'ext',
      engines: ['canyonarch', 'canyon', 'dunes'], cond: ['scorching', 'windswept', 'ancient', 'calm'], genres: ['landscape', 'nature', 'season'],
      items: `
Narin Kemer Gün Batımı|slender freestanding sandstone arch glowing red at sunset
Pencere Kemerleri|pair of large stone windows framing distant desert mesas
Doğal Taş Köprü|massive natural bridge spanning a dry wash
Dalga Kaya|swirling striped sandstone formation like a frozen wave
Yarık Kanyon Işık Huzmesi|narrow slot canyon with a beam of light falling to the floor
Kemer İçinden Ay|full moon seen through a sandstone arch
Mantar Kayalar|balanced mushroom-shaped hoodoos in a pale valley
Kırmızı Kaya Amfitiyatrosu|bowl of red hoodoo spires in morning light
Deniz Kemeri|sea arch in a cliff with waves rolling through
Kemer Altı Gece Gökyüzü|Milky Way framed beneath a desert arch
Kumtaşı Katmanlı Yamaç|cliff of colourful layered sandstone bands
Kubbe Kayalar|smooth sandstone domes in a vast slickrock plain
Yarık Kanyon Akıntısı|slot canyon with a shallow stream on its floor
At Nalı Kıvrımı|river making a horseshoe bend far below sandstone cliffs
Taş Sütun Ormanı|forest of tall sandstone pillars in fog
Kemer Arkası Mesa|arch framing a flat-topped mesa on the horizon
Kum Tepesi ve Kemer|dune sweeping up to the base of a giant arch
Mağara Kemeri|alcove arch hollowed into a canyon wall
Pembe Kumtaşı Vadisi|valley of pink sandstone with green shrubs
Çift Kemer|double arch with two spans sharing one leg
Kemerli Kanyon Nehri|river flowing beneath a natural stone bridge
Rüzgar Oyulmuş Kaya|wind-carved honeycomb rock wall
Kemer ve Kar|sandstone arch dusted with fresh snow
Sütunlu Kanyon Koridoru|corridor between towering sandstone walls
Kemer Altında Kamp Yeri|empty campsite beneath an overhanging arch
Fırtına ve Kemerler|storm clouds over a field of arches
Turuncu Yarık Duvarları|curving orange walls of a narrow slot canyon
Kaya Pencere Gün Doğumu|sunrise light bursting through a rock window
Oyulmuş Kaya Köprüsü|small natural bridge over a creek with cottonwoods
Kemerler Vadisi Panorama|wide valley scattered with dozens of arches
`,
    },
    {
      id: 'd7-bamboo', tr: 'Bambu & Sisli Dağ Ormanları', arch: 'eastasia', ctx: 'ext',
      engines: ['bamboo', 'wuxia', 'forest', 'godrays'], cond: ['misty', 'humid', 'calm', 'quiet', 'enchanted'], genres: ['nature', 'season', 'world'],
      items: `
Bambu Koridoru|path through towering green bamboo with filtered light
Sisli Karst Tepeleri|limestone karst peaks rising out of a sea of mist
Bambu Ormanı Yağmur|bamboo grove in rain, stalks glistening
Dağ Pavyonu Sis|pavilion on a cliff edge above clouds
Bambu Köprü|wooden and bamboo footbridge over a misty stream
Çay Terasları Sis|tea terraces vanishing into low fog
Bambu Ormanı Rüzgar|wind bending tall bamboo in waves
Sisli Dağ Tapınağı|temple roofs emerging from a misty mountainside
Taş Basamaklar Bambu|stone steps climbing through a bamboo forest
Nehir Kıyısı Bambu|bamboo lining a slow river with a moored raft
Bulut Ormanı|mountain cloud forest dripping with moss and ferns
Bambu Ormanı Gece Fenerleri|bamboo path lit by paper lanterns at night
Ay Işığı Bambu|moonlight through bamboo casting stripes of shadow
Sisli Pirinç Terasları|rice terraces at dawn in rolling mist
Yeşim Nehir Vadisi|jade river curving between misty peaks
Bambu Kulübe|bamboo hut on stilts in a forest clearing
Dağ Şelalesi Sis|waterfall disappearing into mist among pines
Bambu Orman Açıklığı|clearing in bamboo with a stone lantern
Bulut Denizi Zirve|summit above a sea of clouds with twisted pines
Bambu ve Kar|bamboo forest under fresh snow
Sisli Göl Pagoda|pagoda on a lake island in fog
Bambu Tüneli Işık|sunbeam piercing a bamboo tunnel
Asma Köprü Bulutlar|suspension bridge between misty peaks
Bambu Ormanı Gün Batımı|bamboo glowing gold at sunset
Yosunlu Taş Patika|moss-covered stone path in a misty forest
Bambu Su Oluğu|bamboo water spout dripping into a stone basin
Karst Nehri Teknesi|bamboo raft on a river among karst peaks
Sisli Orman Tapınak Kapısı|wooden gate standing alone in a foggy forest
Çam ve Kaya Uçurumu|twisted pine growing from a granite cliff in fog
Bambu Ormanı Şafak|bamboo forest at dawn with drifting mist
`,
    },
    {
      id: 'd7-savanna', tr: 'Savan Gün Batımları', arch: 'landscape', ctx: 'ext',
      engines: ['countryside', 'dunes', 'clouds'], cond: ['scorching', 'calm', 'windswept', 'quiet'], genres: ['landscape', 'nature', 'season', 'world'],
      items: `
Akasya Silueti Gün Batımı|flat-topped acacia silhouetted against a huge orange sun
Altın Savan Otları|sea of golden grass waving under a dramatic sky
Baobab Ağaçları Yolu|dirt road between giant baobab trees at dusk
Savan Su Birikintisi|waterhole reflecting a pink sunset
Termit Tepeleri|tall termite mounds scattered across dry grassland
Savan Kayalık Tepe|granite kopje rising above the plains
Kızıl Toz Gün Batımı|red dust haze over the savanna at sunset
Savan Fırtınası|storm rolling over the savanna with lightning
Kuru Nehir Yatağı|sandy dry riverbed winding through acacias
Safari Kampı Çadırları|empty canvas safari tents at dusk
Uzak Kilimanjaro|snow-capped mountain floating above savanna haze
Savan Yanık Ot|charred grassland after a controlled burn
Yeşil Mevsim Savanı|lush green savanna after rains
Savan Ay Doğuşu|full moon rising over flat grassland
Kuru Ağaç Siluet|bare dead tree against a purple dusk
Savan Gözetleme Kulesi|wooden lookout tower over the plains
Krater Tabanı Ova|grassland on the floor of a vast crater
Savan Gün Doğumu Sisi|morning mist over the savanna at sunrise
Akasya Altında Gölge|shade under a spreading acacia at noon
Savan Toprak Yolu|red dirt road stretching to the horizon
Savan Nehri Kenarı|muddy river edge with reeds and sandbanks
Kuru Mevsim Çatlaklar|cracked mud flats in the dry season
Savan Yıldızları|Milky Way above acacias
Savan Kayalık Kanyon|small gorge cutting through the plains
Uzun Ot Ve Rüzgar|tall grass bending in strong wind
Savan Bulut Gölgeleri|cloud shadows racing across grassland
Savan Köyü Çitleri|thorn-fenced village enclosure at dusk
Flamingo Gölü Savan|soda lake edged with pink at sunset
Savan Ağaç Korusu|grove of fever trees with yellow bark
Savan Kızıl Ufuk|horizon burning red after the sun sets
`,
    },
    {
      id: 'd7-mushroom', tr: 'Mantar Ormanları & Mikro Doğa', arch: 'nature', ctx: 'ext',
      engines: ['mushroom', 'forest', 'cells', 'godrays'], cond: ['humid', 'enchanted', 'glowing', 'misty', 'overgrown'], genres: ['nature', 'fantasy', 'season'],
      items: `
Dev Mantar Ormanı|forest floor of giant mushrooms towering like trees
Işıldayan Mantarlar|bioluminescent mushrooms glowing blue in a dark wood
Yosun Halısı Makro|close macro view of moss like a miniature forest
Çiğ Damlalı Örümcek Ağı|dew-covered spider web strung between grass stems
Kırmızı Benekli Mantarlar|cluster of red spotted mushrooms in autumn leaves
Kütük Üstü Mantarlar|bracket fungi stacked on a fallen log
Eğrelti Kıvrımları|unfurling fern fronds in soft morning light
Liken Kaplı Kaya|rock covered in colourful lichen in macro
Mantar Halkası|fairy ring of mushrooms in a misty meadow
Orman Zemini Makro|leaf litter, acorns and tiny sprouts seen at insect scale
Su Damlası Dünyası|world reflected inside a water droplet on a leaf
Yosunlu Taş Kaynak|spring trickling over moss-covered stones
Mantar Tüneli|tunnel of arching giant fungi caps
Tohum Kapsülleri|dandelion seed heads backlit at dawn
Karınca Patikası|leaf-cut trail through grass seen from ground level
Kozalak Ormanı Zemini|pine needles and cones on a forest floor in macro
Islak Yaprak Damarları|veins of a wet leaf in extreme close-up
Çiçek Tozu Bulutu|pollen drifting in a sunbeam in a meadow
Ağaç Kabuğu Kanyonları|deep bark grooves seen like canyons
Mantar Ve Sis|mushrooms emerging from fog on a forest floor
Salyangoz Kabuğu Yolu|empty snail shell on moss with dew
Gölet Yüzeyi Makro|duckweed and water striders on a pond surface
Sarmaşık Kökleri|aerial roots hanging in humid jungle air
Çürüyen Kütük Dünyası|rotting log covered in sprouts, moss and fungi
Işıklı Mantar Mağarası|cave glowing with luminous fungi
Kristal Buz Makro|frost crystals on a leaf at dawn
Böcek Gözünden Çayır|meadow seen from beneath tall grass stems
Kuru Yaprak Labirenti|maze of curled dry leaves at tiny scale
Mantar Köyü|cluster of mushroom caps like rooftops in moss
Yağmur Sonrası Orman Zemini|soaked forest floor glistening with fungi and moss
`,
    },
    {
      id: 'd7-glacier', tr: 'Buzul Mağaraları & Buzdağları', arch: 'nature', ctx: 'mixed',
      engines: ['glacier', 'crystal', 'ocean', 'mountains'], cond: ['frozen', 'glowing', 'quiet', 'pristine', 'windswept'], genres: ['nature', 'season', 'landscape'],
      items: `
Mavi Buz Mağarası İçi|blue ice cave interior with rippled translucent walls
Buzdağı Kemeri|iceberg with a natural arch floating in calm sea
Buzul Kırılma Duvarı|tall glacier face calving into a fjord
Buz Tüneli İçi|ice tunnel interior glowing sapphire with light from the end
Buzdağları Lagünü|lagoon crowded with drifting icebergs at dusk
Buzul Yarıkları|deep crevasses cutting across a glacier surface
Siyah Kumda Buz|ice chunks glittering on a black beach
Buz Mağarası Şelalesi İçi|frozen waterfall inside an ice cave interior
Kutup Buz Sahanlığı|vast flat ice shelf ending in a sheer cliff
Buzdağı Gece|iceberg under stars and a thin moon
Buzul Nehri|meltwater river carving a blue channel across ice
Buz Sarkıtları Mağara İçi|cave interior with long icicles from the ceiling
Mavi Buz Tarlası|field of blue ice ridges and pinnacles
Buzdağı Altı Sualtı|underwater view of an iceberg's massive blue base
Buzul Gölü Kıyısı|glacial lake shore with floating ice and peaks
Buz Kubbesi İçi|domed ice chamber interior with frozen bubbles
Kutup Gün Batımı Buz|pink sunset light on sea ice
Buz Mağarası Girişi|entrance to an ice cave beneath a glacier
Buz Saçaklı Uçurum|cliff draped in frozen icicles above the sea
Buzul Morenleri|glacier moraines of rock and ice
Buz Yüzen Fiyort|fjord filled with slush and small icebergs
Buz Oyukları İçi|scalloped ice walls of a glacier cave interior
Buzdağı Mağarası|cave carved into a floating iceberg
Buz Kristalleri Tavan İçi|ice crystal ceiling of a cave interior
Buz Sahili Fırtına|storm waves pounding ice floes
Buzul Ağzı Nehir|river emerging from a glacier mouth
Buzdağı Gün Doğumu|iceberg glowing gold at sunrise
Buz Labirenti|maze of ice towers on a glacier
Donmuş Okyanus Sathı|endless pack ice under grey sky
Buz Mağarası Işık Huzmesi İçi|cave interior with a beam of light through a hole in the ice
`,
    },
    {
      id: 'd7-oasis', tr: 'Çöl Vahaları & Kervansaraylar', arch: 'ancient', ctx: 'mixed',
      engines: ['dunes', 'ruins', 'room3d', 'canyon'], cond: ['scorching', 'ancient', 'quiet', 'weathered', 'calm'], genres: ['world', 'history', 'landscape', 'season'],
      items: `
Palmiyeli Vaha Gölü|oasis pool ringed by date palms in a sea of dunes
Kervansaray Avlusu|caravanserai courtyard with arcades and a central fountain
Kervansaray İçi Kemerler|caravanserai interior with vaulted stone arches and straw
Kum Tepesi Vaha Manzarası|oasis seen from a high dune crest
Toprak Kale Kasabası|mud-brick fortified town at the edge of an oasis
Vaha Sulama Kanalları|palm groves with irrigation channels
Çöl Kuyusu|stone well in a desert clearing
Kervan Yolu Gün Batımı|caravan route across dunes at sunset
Kervansaray Kapısı|massive carved gateway of a caravanserai
Ahırlı Kervansaray İçi|stable hall interior with stone troughs and pillars
Çöl Çadır Kampı|empty Bedouin tents with rugs and lanterns
Vaha Köyü Sokağı|narrow shaded lane in a desert oasis village
Kum Basmış Kervansaray|caravanserai half buried in sand
Hurma Bahçesi|date palm orchard with ripe clusters
Çöl Kalesi Kulesi|watchtower overlooking dunes
Vaha Gece Fenerleri|oasis at night lit by lanterns among palms
Rüzgar Kuleleri|desert town of wind-catcher towers
Kervansaray Damı|flat roof of a caravanserai with desert views
Kuru Vadi Vaha|green ribbon of oasis in a dry canyon
Kervansaray Odaları İçi|row of small sleeping chambers interior with rugs
Kum Fırtınası Vaha|sandstorm approaching an oasis
Çöl Hamamı İçi|domed bathhouse interior with star-shaped skylights
Tuz Kervanı Yolu|salt caravan track on a white plain
Vaha Su Değirmeni|wooden waterwheel lifting water into channels
Çöl Pazarı Kalıntısı|ruined market arcade on a caravan route
Kervansaray Gece|moonlit caravanserai courtyard
Vaha Kum Tepeleri Şafak|dawn over palms and dunes
Taş Sarnıç İçi|underground cistern interior with columns and water
Çöl Kaya Resimleri|rock shelter with ancient paintings
Vaha Kenarı Ahırlar|stone animal pens at the edge of an oasis
`,
    },
    {
      id: 'd7-celestial', tr: 'Gök Olayları: Tutulma & Kuyruklu Yıldız', arch: 'sky', ctx: 'sky',
      engines: ['eclipse', 'clouds', 'galaxy', 'aurora'], cond: ['cosmic', 'dramatic', 'eerie', 'calm'], genres: ['season', 'space', 'nature'],
      items: `
Tam Güneş Tutulması|total solar eclipse with a glowing corona over a hill
Elmas Yüzük Anı|diamond ring flash at the edge of an eclipse
Kanlı Ay Tutulması|red blood moon above a quiet valley
Kuyruklu Yıldız Gün Batımı|bright comet with long tail above twilight horizon
Meteor Fırtınası|dozens of meteors streaking across the sky
Gezegen Hizalanması|planets in a line above the horizon at dawn
Halka Tutulma|annular ring of fire eclipse over the sea
Güneş Halesi|large halo around the sun in a cirrus sky
Ay Halesi|halo ring around the moon on a cold night
Kuyruklu Yıldız Dağ Üstü|comet above a snowy mountain peak
Süper Ay Doğuşu|giant moon rising behind a city skyline silhouette
Güneş Sütunu|vertical sun pillar rising at sunset
Yeşil Şimşek Anı|green flash at the moment of sunset over the ocean
Gece Parlayan Bulutlar|noctilucent clouds glowing at midnight
Çift Gökkuşağı|double rainbow under a dark sky
Kırmızı Gün Batımı Toz|blood-red sun through wildfire haze
Ateş Topu Meteoru|fireball meteor splitting over a desert
Ay Ve Venüs Yakınlaşma|moon and Venus close together in twilight
Kuyruklu Yıldız Göl Yansıması|comet reflected in a still lake
Tutulma Gölge Konisi|eclipse shadow sweeping across clouds from above
Güneş Köpeği|bright sun dogs on both sides of the sun
Ay Kemeri|faint moonbow arc over a waterfall at night
Yıldız Kayması Çölü|shooting star over a desert arch
Kutup Gecesi Ay|moon low over polar ice in endless night
Tutulma Sırasında Ufuk|360-degree sunset glow during totality
Kuyruklu Yıldız Ve Aurora|comet amid green aurora
Mavi Ay|large blue-tinted full moon behind thin clouds
Ay Altında Bulut Denizi|moon over a sea of clouds from a peak
Zodyak Işığı Ve Galaksi|zodiacal light meeting the Milky Way
Gün Batımı Işın Hüzmeleri|crepuscular rays fanning across the evening sky
`,
    },
    {
      id: 'd7-mist', tr: 'Sisli Sabahlar & Pus Manzaraları', arch: 'landscape', ctx: 'ext',
      engines: ['countryside', 'forest', 'mountains', 'smoke'], cond: ['misty', 'calm', 'quiet', 'eerie'], genres: ['landscape', 'season', 'nature'],
      items: `
Sisli Tepe Katmanları|layers of hills fading into morning mist
Sis Denizi Vadisi|valley filled with fog, hilltops like islands
Sisli Orman Yolu|forest road disappearing into thick fog
Sisli Nehir Sabahı|river with mist rising from the water at dawn
Sis İçinde Köprü|bridge towers vanishing into fog
Sisli Çayır Ağacı|single tree in a foggy meadow
Pus İçinde Şehir Silueti|city skyline dissolved in hazy morning light
Sisli Göl Kayığı|empty rowing boat on a misty lake
Sisli Bağlar|vineyard rows fading into fog
Sisli Kale Tepesi|castle on a hill emerging from mist
Sisli Demiryolu|railway tracks vanishing into fog
Sisli Çam Sırtı|pine ridges silhouetted in blue haze
Sis Altında Köy|village rooftops poking through morning fog
Sisli Bataklık|marsh with dead trees in thick mist
Sisli Plaj Sabahı|empty beach with sea fog rolling in
Sisli Kırsal Yol|country road between hedges in fog
Pus İçinde Pirinç Tarlası|rice fields in soft haze at dawn
Sisli Mezarlık|old graveyard under drifting fog
Sisli Liman|harbour with boats fading into mist
Sisli Park Lambaları|park path with lamps glowing in fog
Sisli Dağ Kulübesi|mountain hut in swirling cloud
Sisli Kayın Ormanı|beech forest in grey fog, trunks fading
Sis Perdesi Uçurum|cliff edge vanishing into sea fog
Sisli Çiftlik Evi|farmhouse in a foggy field at sunrise
Sisli Tarla Çitleri|fence lines disappearing into mist
Sisli Kanal|canal with arched bridges in morning fog
Pus İçinde Rüzgar Turbinleri|wind turbines fading into haze
Sisli Vadi Güneş Huzmesi|sunbeams breaking through valley mist
Sisli Otoyol Viyadüğü|viaduct crossing a fog-filled valley
Sisli Saz Gölü|reed lake in mist with a heron-free stillness
`,
    },
    {
      id: 'd7-sunrise', tr: 'Gün Doğumu & Altın Saat Panoramaları', arch: 'landscape', ctx: 'ext',
      engines: ['terrain3d', 'ocean', 'clouds', 'countryside'], cond: ['calm', 'pristine', 'dramatic', 'quiet'], genres: ['landscape', 'season', 'nature'],
      items: `
Dağ Zirvesi Gün Doğumu|first sunlight hitting a jagged summit above clouds
Okyanus Ufku Şafak|sun rising out of a calm ocean horizon
Altın Saat Tepeleri|rolling hills glowing in late golden light
Gün Doğumu Bulut Denizi|sun rising over an endless sea of clouds
Altın Buğday Panoraması|wheat fields stretching under golden evening sun
Şehir Çatıları Gün Doğumu|city rooftops catching first light
Göl Gün Doğumu Yansıması|sunrise mirrored in a calm lake
Altın Saat Kanyon|canyon walls blazing orange at sunset
Kumsal Altın Saat|beach with long shadows and golden water
Çöl Gün Doğumu|dunes with crisp shadows at sunrise
Dağ Sırası Altın Saat|mountain range layered in golden haze
Orman Gün Doğumu Huzmeleri|sunrise beams through forest trees
Uçurum Gün Batımı|sea cliff edge with the sun sinking
Nehir Vadisi Gün Batımı|river valley flooded with orange light
Ada Gün Batımı|silhouette of an island against a red sky
Altın Saat Köy|village houses glowing in evening light
Volkan Gün Doğumu|volcano peak lit pink at dawn
Bozkır Gün Batımı|steppe horizon with a huge low sun
Altın Saat Liman|harbour boats glowing at sunset
Kar Tepeleri Alpenglow|snow peaks lit pink by alpenglow
Tarla Yolu Gün Batımı|dirt road between fields toward the setting sun
Gün Doğumu Fener|lighthouse with sunrise behind it
Altın Saat Köprü|old bridge glowing at golden hour
Gün Batımı Çam Silueti|pine silhouettes against an orange sky
Pembe Şafak Gökyüzü|soft pink and lavender sky over hills
Altın Saat Bataklık|marsh reeds backlit in golden light
Gün Batımı Kayalık Koy|rocky cove at sunset with warm water
Gün Doğumu Pirinç Terasları|terraces glowing at dawn
Altın Saat Kale Duvarları|ancient walls lit warm at sunset
Son Işık Dağ Gölü|last light on a mountain lake
`,
    },
    {
      id: 'd7-windows', tr: 'Pencereden Manzaralar', arch: 'home', ctx: 'int',
      engines: ['homeint', 'rainglass', 'room3d'], cond: ['quiet', 'calm', 'lived-in', 'empty'], genres: ['season', 'interior', 'daily'],
      items: `
Yağmurlu Pencere Şehir|room interior with a rain-streaked window over city lights
Karlı Pencere Orman|cabin interior with a frosted window onto snowy pines
Deniz Manzaralı Pencere|bedroom interior with a big window over the sea
Tren Penceresi Manzarası|train compartment interior with a window onto passing hills
Uçak Penceresi Bulutlar|airplane cabin interior with a window above the clouds
Dağ Kulübesi Penceresi|mountain hut interior window framing a peak
Gökdelen Penceresi|high-rise office interior with a floor-to-ceiling skyline view
Sisli Sabah Penceresi|kitchen interior window looking onto a misty garden
Gün Batımı Salon Penceresi|living room interior lit orange by a sunset window
Yağmurlu Kafe Penceresi|café interior with a steamy window onto a wet street
Gece Şehir Pencere|dark bedroom interior with neon light through blinds
Bahar Bahçesi Penceresi|room interior with an open window onto blossom trees
Fırtına Penceresi|room interior with lightning flashing outside the window
Sonbahar Pencere Kenarı|reading nook interior with autumn trees outside
Kütüphane Penceresi|library interior with tall windows onto a quad
Göl Evi Penceresi|lake house interior window over still water
Çatı Katı Pencere|attic interior with a round window over rooftops
Otel Odası Manzarası|hotel room interior window overlooking a harbour
Kar Fırtınası Penceresi|room interior with a blizzard outside the glass
Çöl Pencere|adobe room interior with a small window onto dunes
Tarla Manzaralı Pencere|farmhouse interior window onto golden fields
Gece Yarısı Pencere Yıldızlar|bedroom interior with stars beyond the window
Hastane Penceresi|hospital room interior window onto a grey sky
Vapur Penceresi|ferry cabin interior porthole with sea spray
Kule Penceresi Vadisi|tower room interior window over a vast valley
Okul Sınıfı Penceresi|classroom interior with tall windows and trees outside
Banyo Penceresi Buğu|bathroom interior with a fogged window and soft light
Ofis Penceresi Yağmur|office interior with rain on glass and city towers
Mutfak Penceresi Kar|kitchen interior with snow falling outside
Tren İstasyonu Pencere|waiting room interior window onto empty platforms
`,
    },
    {
      id: 'd7-aerial', tr: 'Havadan Desenler: Tarlalar & Nehirler', arch: 'landscape', ctx: 'ext',
      engines: ['aerial', 'countryside', 'terrain3d'], cond: ['harvest', 'calm', 'pristine', 'autumnal'], genres: ['landscape', 'nature', 'season'],
      items: `
Yama Yama Tarlalar|patchwork of fields in green, gold and brown from above
Örgülü Nehir Kanalları|braided river channels across grey gravel from above
Daire Sulama Tarlaları|circular irrigated fields in a desert from above
Lale Şeritleri Havadan|stripes of colourful tulip fields from the air
Nehir Menderesleri|looping river meanders through green floodplain from above
Tuz Havuzları Havadan|colourful salt evaporation ponds in a grid
Teraslı Tepeler Havadan|contour terraces wrapping hills like fingerprints
Orman Yolu Havadan|road cutting a straight line through dense forest
Sonbahar Orman Dokusu|autumn forest canopy in mosaic colours from above
Kumsal Dalgaları Havadan|waves breaking on a beach seen straight down
Delta Ağaçları Havadan|river delta branching like a tree into the sea
Kar Tarlaları Çizgileri|snowy fields with dark hedges from above
Bağ Sıraları Havadan|vineyard rows following hill contours
Balık Çiftliği Havadan|grid of floating fish pens on calm water
Çöl Kum Tepeleri Havadan|dune ridges in repeating curves from above
Pirinç Tarlaları Havadan|flooded paddies reflecting sky in irregular shapes
Hasat Desenleri|freshly harvested fields with mower patterns
Göl Adaları Havadan|lake scattered with small green islands
Mangrov Kanalları Havadan|mangrove forest with winding channels
Otoyol Kavşağı Havadan|highway interchange loops from directly above
Buzul Yarıkları Havadan|crevasse patterns across a glacier
Lavanta Tarlası Havadan|purple rows with a farmhouse in the middle
Mercan Resif Havadan|turquoise reef patterns in shallow sea
Kanyon Ağı Havadan|network of canyons cutting a plateau
Liman Konteynerleri Havadan|colourful container stacks in rows
Volkan Kraterleri Havadan|cluster of craters in a barren field
Kırsal Yollar Ağı|thin roads connecting farms across plains
Sel Basmış Tarlalar Havadan|flooded fields with tree lines above water
Saman Balyaları Havadan|round bales scattered on stubble
Kıyı Kayalıkları Havadan|rocky coastline with foam patterns
`,
    },
    {
      id: 'd7-minimal', tr: 'Minimalist Doğa', arch: 'landscape', ctx: 'ext',
      engines: ['saltflat', 'dunes', 'countryside', 'clouds'], cond: ['calm', 'quiet', 'pristine', 'misty'], genres: ['landscape', 'season', 'abstract'],
      items: `
Tek Ağaç Ufuk|single tree on a bare hill against a pale sky
Sonsuz Kum Çizgisi|one dune crest dividing sand and sky
Karda Tek Çit Direği|lone fence post in an empty snowfield
Sisli Tek Ağaç|single tree emerging from white fog
Sakin Deniz Ufku|flat calm sea meeting a flat calm sky
Tek Kaya Kumsal|single boulder on a smooth wet beach
Karlı Ova Çizgisi|white plain with a thin dark tree line
Tek İskele Göl|thin pier into a white misty lake
Çıplak Tepe Silueti|smooth bare hill outlined against dusk
Tek Ağaç Buğday|lone tree in a golden wheat field
Bulutsuz Çöl|empty desert under a cloudless sky
Tek Bulut Gökyüzü|one cloud in a vast blue sky over grass
Sığ Su Yansıması|shallow water reflecting a pale sky perfectly
Uzak Tek Ev|tiny house alone on a vast hillside
Kar Tepeleri Soyut|soft snow curves with no horizon
Gün Batımı Çizgisi|thin orange line of sunset over dark sea
Tek Yelken Ufuk|single sailboat on an empty horizon
Rüzgarlı Ot Tepesi|grassy hill rippling in wind
Buz Göl Çizgisi|frozen lake with a crack line
Tuz Düzlüğü Ufuk|white salt meeting blue sky
Tek Fener Ufuk|lighthouse alone on a flat cape
Kumul Gölgesi|single dune shadow in soft light
Puslu Dağ Katmanı|one faint mountain layer in haze
Tek Yol Ufuk|road vanishing to a point in empty land
Sakin Göl Kamış|single reed in still water
Beyaz Kumsal Mavi Deniz|clean white sand meeting turquoise water
Tek Çam Kar|single pine in deep snow
Tarla Çizgileri Sisli|fog over ploughed lines
Gece Tek Ay|moon above an empty horizon
Ağaç Gölgesi Duvar|tree shadow on a sunlit white wall
`,
    },
    {
      id: 'd7-botanic', tr: 'Botanik Bahçeler & Seralar', arch: 'nature', ctx: 'mixed',
      engines: ['forest', 'room3d', 'godrays', 'countryside'], cond: ['humid', 'pristine', 'calm', 'overgrown', 'quiet'], genres: ['nature', 'season', 'daily'],
      items: `
Viktorya Serası İçi|Victorian glasshouse interior with palms and iron arches
Kaktüs Serası İçi|desert house interior with giant cacti under glass
Tropik Kubbe İçi|tropical dome interior with a waterfall and walkways
Nilüfer Havuzu Serası İçi|greenhouse interior with giant water lily pads
Japon Bahçesi|Japanese garden with raked gravel, stones and maples
Gül Bahçesi Kemerleri|rose arches over gravel paths
Botanik Bahçe Göleti|pond with a stone bridge in a botanic garden
Orkide Serası İçi|orchid house interior with hanging blooms and mist
Labirent Çit Bahçesi|hedge maze seen from its entrance
Bitki Duvarı Avlu|courtyard with vertical green walls
Eski Sera Kalıntısı|abandoned greenhouse overgrown with vines
Sukulent Bahçesi|terraced garden of succulents and gravel
Palmiye Evi İçi|palm house interior with towering fronds
Bahçe Sera Sıraları|rows of seedlings under a glass roof
Fıskiyeli Bahçe|formal garden with a fountain and clipped hedges
Bambu Bahçesi Yolu|bamboo-lined path in a botanic garden
Eğrelti Serası İçi|fern house interior with misty air
Kış Bahçesi Konservatuvar İçi|conservatory interior with wicker chairs and plants
Çiçekli Pergola|pergola covered in wisteria and roses
Kaya Bahçesi|alpine rock garden with small flowers
Sera Gece Işıkları İçi|greenhouse interior glowing at night with grow lamps
Bitki Kütüphanesi İçi|herbarium room interior with specimen cabinets
Su Bahçesi|water garden with reeds and stepping stones
Çay Bahçesi Köşkü|garden pavilion surrounded by camellias
Sera Yağmur Sabahı|rain on glass over a humid greenhouse
Çiçek Tarhları Simetri|symmetrical flower beds around a central path
Karnivor Bitki Serası İçi|carnivorous plant house interior in humid glow
Çöl Bahçesi Gün Batımı|desert garden with agaves at sunset
Kubbe Sera Dışarıdan|geodesic dome greenhouses in a garden
Bonsai Avlusu|courtyard of bonsai trees on stone stands
`,
    },
    {
      id: 'd7-ancientforest', tr: 'Kadim Ormanlar & Dev Ağaçlar', arch: 'nature', ctx: 'ext',
      engines: ['forest', 'godrays', 'terrain3d', 'mushroom'], cond: ['ancient', 'misty', 'overgrown', 'enchanted', 'quiet'], genres: ['nature', 'season', 'fantasy'],
      items: `
Sekoya Devleri|towering redwood trunks rising into fog
Kadim Meşe|gnarled thousand-year-old oak in a meadow
Ağaç Kökü Mağarası|hollow beneath giant tree roots
Yosun Kaplı Yağmur Ormanı|temperate rainforest draped in moss
Dev Kütük Köprüsü|fallen giant tree spanning a stream
Banyan Kökleri|banyan tree with curtains of aerial roots
Kadim Zeytin Ağacı|twisted ancient olive tree on a terrace
Dev Ağaç Gövdesi Tüneli|road tunnel carved through a giant trunk
Orman Katedrali Işık|cathedral-like forest with beams of light
Baobab Ormanı|grove of giant baobabs at dawn
Kızıl Kabuklu Çamlar|old pines with red bark in a sunny forest
Sisli Dev Ağaçlar|silhouettes of huge trees in thick fog
Kökler Üzerinde Ağaç|tree growing over a boulder with exposed roots
Yaşlı Porsuk Korusu|dark yew grove with twisted trunks
Ağaç Halkası Kesiti|massive old stump showing ancient rings
Dev Eğrelti Ormanı|forest floor of giant ferns under tall trees
Kadim Orman Deresi|clear stream through primeval forest
Dev Okaliptüs Gövdeleri|tall smooth eucalyptus trunks in light
Ağaç Tepesi Köprüleri|rope bridges between high tree trunks
Yıldırım Çarpmış Ağaç|split and blackened giant tree in a clearing
Ağaç İçi Oyuk|hollow trunk large enough to stand in
Kadim Orman Gece|giant trees under moonlight
Huş ve Çam Kadim|ancient mixed forest with fallen trees
Sarmaşıklı Dev Ağaç|giant tree wrapped in strangler figs
Dev Kozalaklı Vadi|valley of giant conifers in mist
Orman Tabanı Işık Lekesi|single sunlit patch on a dark forest floor
Kadim Ağaç Altı Taş|mossy standing stone under an old tree
Dev Ağaç Gün Batımı|silhouette of a giant tree at sunset
Orman Kenarı Kadim|edge of an old forest facing open hills
Kar Altında Sekoyalar|giant sequoias dusted with snow
`,
    },
  ];
  // kısa tarifler grubun ortamıyla tamamlanır (en az 8 kelime)
  const TAIL = {
    'd7-waterfalls': 'deep in a wild green river valley', 'd7-lakes': 'surrounded by quiet mountain shores', 'd7-blossom': 'in fresh soft spring light',
    'd7-autumn': 'deep in rich autumn colour', 'd7-winter': 'in a silent snowbound winter landscape', 'd7-storms': 'under a violent towering storm sky',
    'd7-stargaze': 'far from any city lights', 'd7-aurora': 'in the deep arctic winter night', 'd7-reefs': 'in clear warm tropical water',
    'd7-volcanic': 'on a raw young volcanic island', 'd7-saltflats': 'on a vast white salt plain', 'd7-arches': 'in red desert canyon country',
    'd7-bamboo': 'in misty East Asian mountains', 'd7-savanna': 'on the open African savanna', 'd7-mushroom': 'on a damp shaded forest floor',
    'd7-glacier': 'in a frozen polar ice world', 'd7-oasis': 'on an ancient desert trade route', 'd7-celestial': 'in a clear and silent sky',
    'd7-mist': 'on a still and misty morning', 'd7-sunrise': 'in warm low golden light', 'd7-windows': 'seen from inside a quiet room',
    'd7-aerial': 'seen straight down from high above', 'd7-minimal': 'in a calm and minimal composition', 'd7-botanic': 'in a quiet botanical garden',
    'd7-ancientforest': 'in a primeval old-growth forest',
  };
  const fill = (g) => g.items.trim().split('\n').map((l) => {
    const [tr, en] = l.split('|');
    return en.trim().split(/\s+/).length < 8 ? `${tr}|${en.trim()} ${TAIL[g.id]}` : l;
  }).join('\n');
  G.forEach((g) => CB.addGroup(Object.assign({}, g, { items: fill(g) })));
})();
