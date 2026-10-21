/* CineBG Studio v5 — kategori varyantları.
   Her temel mekâna dört eksenden birer deterministik varyant eklenir: durum/dönem, tür aktarımı, bakış/ölçek, ışık imzası.
   3430 temel × 5 (temel + 4 varyant) = 17.150 kategori. Varyant kimliği: temel kimlik + '~' + 1..4 — sahne kodunda a–d harfi. */
(function () {
  const CB = window.CB;
  const T = (s) => s.trim().split('\n').map((l) => {
    const [tr, en, pal, grade, atm, tn] = l.split('|').map((x) => (x || '').trim());
    const q = { tr, en };
    if (pal) q.pal = pal.split(',');
    if (grade) q.grade = grade;
    if (tn) q.tn = tn;
    if (atm) q.atmos = Object.fromEntries(atm.split(',').map((kv) => { const [k, v] = kv.split(':'); return [k, +v]; }));
    return q;
  });

  /* ---- yer (dış / iç / karma) ---- */
  const STATE = T(`
Altın çağında, kusursuz|in its golden-age prime, pristine and immaculate, every surface cared for|golden|kodak
Terk edilmiş, sarmaşık basmış|abandoned for decades and reclaimed by nature, vines, moss and saplings breaking through|day,overcast|eterna
Felaket sonrası yarı yıkık|in the aftermath of a disaster, half collapsed, rubble and settling dust|dust,overcast|bleach|dust:0.5
İnşaat hâlinde|still under construction, scaffolding, tarps and exposed structure|day|natural|dust:0.3
Festival günü süslenmiş|decorated for a festival day, banners, lanterns and garlands strung across|golden,dusk|blockbuster
Sel basmış|partly flooded, still water covering the ground and mirroring everything|overcast,water|moonlight
Kar altında, ıssız|buried under fresh snow and completely deserted|cold,blue|moonlight|snow:0.6
Tahliye edilmiş, sabah sessizliği|freshly evacuated, eerily empty in the early-morning silence|dawn,blue|eterna||d
Gece karantinası|under a night-time curfew, empty under harsh work lights|night|digital||n
Yüzyıllar sonra harabe|seen centuries later as a weathered ruin, eroded and sun-bleached|dust,golden|spice
Yangın sonrası is içinde|after a fire, soot-blackened surfaces and thin smoke still drifting|fire,storm|war|ash:0.5
Restore edilmiş müze hâli|restored and preserved as a museum, velvet ropes and gallery lighting|day|natural
Yağmur sonrası parlayan|just after heavy rain, every surface wet and glistening|storm,overcast|neonoir|fog:0.3
Kuraklıkta çatlamış|in a long drought, cracked dry ground and heat shimmer|dust,golden|spice|dust:0.4|d
Sonbahar yaprakları içinde|carpeted in fallen autumn leaves|golden|kodak
Çiçeklenen bahar|in full spring bloom, blossoms drifting through the air|day,pastel|pastel||d
`);
  const GENRE = T(`
Siberpunk versiyon|reimagined as a cyberpunk version, holographic signage, cabling and neon retrofits|neon,night|neon
Karanlık fantastik versiyon|reimagined as a dark-fantasy version, ancient runes, thorned stone and witch-light|night,storm|moonlight
Kıyamet sonrası versiyon|reimagined as a post-apocalyptic version, scavenged repairs, rust and wind-blown debris|dust|bleach|dust:0.5
Retro-fütürist 1960'lar|reimagined as a 1960s retro-futurist version, chrome curves, atomic-age optimism|pastel,day|pastel
Steampunk versiyon|reimagined as a steampunk version, brass pipework, riveted iron and venting steam|golden,fire|kodak|fog:0.3
Solarpunk versiyon|reimagined as a solarpunk version, living green terraces, solar glass and clean light|day,nature|natural
Gotik korku versiyonu|reimagined as a gothic-horror version, pointed arches, candle smoke and long shadows|night|noir|fog:0.4
1940'lar kara film|reimagined as a 1940s film-noir version, venetian-blind shadows and wet asphalt|night|noir||n
Biyopunk versiyon|reimagined as a biopunk version, organic grown architecture, translucent membranes and bioluminescence|toxic,night|digital
Dizelpunk versiyon|reimagined as a dieselpunk version, heavy riveted steel, propaganda-era monumentalism and soot|storm,dust|war
Kadim mitolojik versiyon|reimagined as an ancient mythic version, colossal carved deities and sacred fire|golden|spice
Uzaylı işgali sonrası|reimagined after an alien arrival, impossible geometric structures embedded in the place|space,night|digital
Osmanlı 1600'ler versiyonu|reimagined in a 1600s Ottoman version, domes, tilework, carved wood and brass lamps|golden,palace|kodak
Japon Edo versiyonu|reimagined in an Edo-period Japanese version, timber, paper screens and lanterns|dusk|eterna
Art deco 1920'ler|reimagined as a 1920s art-deco version, gilded geometry, marble and fluted columns|golden,palace|kodak
Sualtı batmış versiyon|reimagined as a sunken version lying underwater, silt, drifting particles and caustic light|water,blue|moonlight
`);
  const LIGHT = T(`
Sadece ateş ışığıyla|lit only by firelight, deep warm pools of light and black shadows|fire,night|neonoir|embers:0.3|n
Güneş tutulması ışığı|under the strange silver light of a total solar eclipse|blue,storm|bleach||d
Biyolüminesan parıltı|glowing with bioluminescent light from plants and water|toxic,night|digital||n
Tek bir projektörle|lit by a single searchlight beam sweeping through haze|night|noir|fog:0.4|n
Dev bir ayın altında|under an enormous low moon filling the sky|night,blue|moonlight||n
Sodyum sokak lambalarıyla|lit by sodium-vapour lamps, orange pools on the ground|night,neon|neonoir||n
Mum ışığıyla|lit by hundreds of candles|fire,night|kodak||n
Pus içinde ışık huzmeleri|cut by god-rays through thick haze|golden|blockbuster|fog:0.5|d
Kırmızı acil durum ışığı|bathed in red emergency light, alarm beacons rotating|fire,night|war||n
Mavi saat ışığı|in the cold blue-hour light after sunset|blue,dusk|moonlight||n
Yıldırım çakarken|frozen in the instant of a lightning flash|storm|bleach|lightning:0.7
Gün batımı kontr ışığı|in hard backlight from a setting sun, long shadows toward camera|golden,dusk|blockbuster||d
Kuzey ışıkları altında|under shimmering aurora light in the night sky|cold,night|moonlight||n
Neon tabelalarla|lit by flickering neon signage in magenta and cyan|neon,night|neon||n
Bulutlu yumuşak ışık|under soft overcast light with no hard shadows|overcast|eterna||d
Altın saat ışığı|in warm low golden-hour light|golden|kodak||d
`);
  const VIEW_EXT = T(`
Devasa megayapı ölçeği|at colossal megastructure scale, tiny human-scale details for reference
Gizli bir köşesi|a hidden, intimate corner of the place, away from the main view
Uzak bir sırttan görünüm|seen from a distant ridge across the landscape
Giriş eşiği|from its entrance threshold, the way in framed ahead
Tam kalbi|at its very heart, the central space all around
Dış sınırı|at its outer edge where it meets the surrounding land
Yüksek bir çatıdan|from a high rooftop or tower looking across it
Yerden, tozun içinden|from ground level among the dust and debris
Havadan kuşbakışı harita gibi|from high above, laid out like a map
Yol boyunca uzanan|along the road leading into it, receding in perspective
`);
  const VIEW_INT = T(`
Kapı eşiğinden|seen from the doorway looking in
En uç köşeden geri bakış|from the far end looking back toward the entrance
Gizli bir girinti|a hidden alcove off the main space
Üst galeriden|from an upper gallery or balcony looking down
Yerden alçak|from floor level, the floor texture leading the eye
Pencere önünden|from beside the windows with light spilling in
Merkezden simetrik|from the exact centre, perfectly symmetrical
Arka koridordan|glimpsed from a back corridor through an opening
Tavana yakın|from just under the ceiling looking down
Dağınık çalışma köşesi|a cluttered working corner with traces of use
`);
  const VIEW_MIX = VIEW_EXT.slice(0, 5).concat(VIEW_INT.slice(0, 5));

  /* ---- uzay / su / gökyüzü ---- */
  const COSMIC_STATE = T(`
Yıldız çarpışması sonrası|after a stellar collision, shock fronts and glowing debris|space,fire|blockbuster
Ölmekte olan bir yıldızın ışığında|in the dim red light of a dying star|fire,space|neonoir
Yeni doğan yıldız bulutu|inside a newborn star nursery, dense glowing gas|space|blockbuster
Terk edilmiş yörünge enkazı|scattered with abandoned orbital wreckage|space,cold|bleach
Çift güneş ışığında|lit by twin suns of different colours|space,golden|kodak
Kara deliğin kıyısında|at the edge of a black hole, light bending around it|space|digital
`);
  const COSMIC_GENRE = T(`
70'ler bilimkurgu kapağı|in a 1970s sci-fi paperback-cover version, bold painted colour|space,pastel|pastel
Sert gerçekçi NASA belgeseli|as a hard-realistic documentary version, true-scale and scientifically accurate|space,cold|natural
Uzay operası destanı|as an epic space-opera version, vast fleets on the horizon|space|blockbuster
Kozmik korku|as a cosmic-horror version, something immense half-hidden in the dark|space,night|noir
Nostaljik retro-fütürist|as a retro-futurist version with chrome rocket shapes|space,pastel|pastel
Kristal ve buz dünyası|as a crystal-and-ice version, refractive frozen forms|cold,blue|moonlight
`);
  const WATER_STATE = T(`
Fırtına sonrası bulanık|after a storm, cloudy water full of drifting silt|storm,water|eterna
Kristal berraklığında|in crystal-clear water with long visibility|water,day|natural||d
Gece biyolüminesan|at night lit by bioluminescent plankton|water,night|digital||n
Batık şehir kalıntıları arasında|among the ruins of a sunken city|water|moonlight
Buz örtüsü altında|beneath a sheet of ice, light filtering through|cold,water|moonlight
Volkanik kaynak yakınında|near volcanic vents, shimmering heat and bubbles|fire,water|neonoir
`);
  const SKY_STATE = T(`
Süper hücre fırtına|as a towering supercell storm|storm|bleach|lightning:0.5
Gün doğumu bulut denizi|as a sea of clouds at sunrise|dawn,golden|kodak||d
Volkanik kül bulutu|darkened by a volcanic ash cloud|dust,fire|war|ash:0.5
Duman perdesi ardında|seen through a veil of wildfire smoke, a red sun|fire,dust|neonoir
Kuzey ışıkları perdesi|curtained with aurora|cold,night|moonlight||n
Yıldızlı berrak gece|on a crystal-clear starry night|night,blue|moonlight||n
`);

  /* ---- soyut / mikro ---- */
  const ABS = T(`
Tek renk|in a monochrome version, one hue in many values
Yanardöner|in an iridescent version, shifting oil-slick colours|neon
Altın varak|in a gold-leaf version, warm metallic highlights|golden
Mürekkep ve su|as ink blooming in water|overcast
Kâğıt kolaj|as a torn-paper collage version with halftone print texture|pastel
Neon tel çerçeve|as a neon wireframe version on black|neon,night|neon||n
Arşiv baskı|as an archival print version, sepia duotone with scratches|dust|eterna
Buzlu cam ardında|seen through frosted glass, soft and diffused|cold
Makro ölçekte|at extreme macro scale with shallow depth of field
Sonsuz tekrar|repeated into infinity, mirrored and tiled
`);

  /* ---- stüdyo / reklam ---- */
  const AD_MAT = T(`
Fırçalanmış metal|built in brushed aluminium and steel|cold|natural
Buzlu cam|built in frosted and clear glass with soft refractions|cold,blue|eterna
Terrazzo|built in speckled terrazzo and matte plaster|pastel|pastel
Kadife ve pirinç|dressed in deep velvet with brass accents|palace,golden|kodak
Ham beton|built in raw board-formed concrete|overcast|bleach
Mermer|built in polished veined marble|day|natural
Renkli akrilik|built in candy-coloured translucent acrylic|pastel,neon|pastel
Doğal taş ve kum|built in natural stone, sand and dried grasses|golden,dust|spice
`);
  const AD_STYLE = T(`
Y2K krom estetiği|in a Y2K chrome aesthetic, liquid-metal shapes and glossy blobs|neon|neon
Bauhaus minimal|in a Bauhaus minimal style, primary colours and pure geometry|day|natural
Memphis tasarım|in a Memphis-design style, playful patterns and bold shapes|pastel|pastel
Wabi-sabi|in a Japanese wabi-sabi style, raw imperfect handmade textures|overcast|eterna
Lüks art deco|in a luxury art-deco style, gold geometry and black lacquer|golden,palace|kodak
Gerçeküstü rüya|in a surreal dreamlike style, impossible scale and floating forms|pastel|pastel
Endüstriyel ham|in a raw industrial style, steel beams and work lights|overcast|bleach
Brutalist anıt|in a brutalist monumental style, massive concrete blocks|overcast|bleach
`);
  const AD_COMP = T(`
Havada süzülen set|with every element levitating in mid-air
Dev ölçekli dekor|with oversized props at giant scale around the product space
Minyatür diorama|as a miniature diorama set
Sonsuz ufuk sahnesi|as an infinite seamless horizon set
Ayna yansımalı|with mirrored surfaces multiplying the set
Kayan kumaş perdeli|with flowing fabric drapes in motion
Su yüzeyli|with a still water surface reflecting the set|water
Simetrik merkez kompozisyon|in a perfectly symmetrical centred composition
`);
  const AD_LIGHT = T(`
Sert flaş|lit with a hard direct flash and crisp shadows||blockbuster
Yumuşak pencere ışığı|lit by soft window light with gentle falloff||eterna
Neon kenar ışığı|lit with neon rim light in two colours|neon|neon
Su kostiği ışığı|lit with rippling water caustics|water,blue|moonlight
Gün batımı gobo|lit by low sunset light through a window gobo|golden|kodak
Siyah zemin dramatik spot|lit by a single dramatic spotlight on black|night|noir
`);

  const POOLS = {
    ext: [STATE, GENRE, VIEW_EXT, LIGHT],
    int: [STATE, GENRE, VIEW_INT, LIGHT],
    mixed: [STATE, GENRE, VIEW_MIX, LIGHT],
    space: [COSMIC_STATE, COSMIC_GENRE, VIEW_EXT.slice(0, 1).concat(VIEW_EXT.slice(2, 3), VIEW_EXT.slice(8, 9)), LIGHT.filter((q) => /moon|aurora|eclipse|neon|single/.test(q.en))],
    water: [WATER_STATE, GENRE.filter((q) => !/sunken/.test(q.en)), VIEW_EXT.slice(0, 5), LIGHT.filter((q) => /moon|god-rays|eclipse|biolum|blue-hour|single/.test(q.en))],
    sky: [SKY_STATE, COSMIC_GENRE.slice(1, 4), VIEW_EXT.slice(2, 3).concat(VIEW_EXT.slice(6, 9)), LIGHT.filter((q) => /sunset|golden|moon|aurora|lightning|eclipse|blue-hour/.test(q.en))],
    abstract: [ABS.slice(0, 5), ABS.slice(5), LIGHT.filter((q) => /neon|candle|god-rays|single|golden/.test(q.en)), GENRE.filter((q) => /cyberpunk|biopunk|art-deco|retro/.test(q.en))],
    studio: [AD_MAT, AD_STYLE, AD_COMP, AD_LIGHT],
  };

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const LETTERS = 'abcd';
  let n = 0;
  // şehir altyapısı isteyen ekler yalnızca yapılı dünyalarda; tarihî yapı ekleri doğada değil
  const NEEDS_CITY = /sodium|neon signage|emergency light|curfew|evacuated|under construction|rooftop/;
  const NEEDS_BUILT = /museum|weathered ruin|doorway|upper gallery|back corridor|ceiling|entrance threshold/;
  const CITY_ARCH = ['scifi', 'urban', 'industrial', 'interior', 'modern', 'dystopia', 'ruins', 'arena', 'horror'];
  const WILD_ARCH = ['nature', 'water', 'space', 'sky', 'micro', 'abstract', 'underground', 'battle'];
  const fits = (q, g) => !(NEEDS_CITY.test(q.en) && !CITY_ARCH.includes(g.arch)) && !(NEEDS_BUILT.test(q.en) && WILD_ARCH.includes(g.arch) && g.ctx !== 'int');
  CB.GROUPS.forEach((g) => {
    const pools = (POOLS[g.ctx] || POOLS.mixed).map((P) => { const f = P.filter((q) => fits(q, g)); return f.length ? f : P; });
    g.cats.forEach((c) => {
      c.vars = pools.map((P, a) => {
        const q = P[hash(c.id + '#' + a) % P.length];
        const v = { id: c.id + '~' + (a + 1), tr: c.tr + ' · ' + q.tr, en: c.en + ', ' + q.en, group: g, base: c, q, vk: a, letter: LETTERS[a] };
        n++;
        return v;
      });
    });
  });
  // varyantlar katalogda temelin altında listelenir; rastgele havuz için CB.CATS'e eklenir
  CB.GROUPS.forEach((g) => g.cats.forEach((c) => c.vars.forEach((v) => CB.CATS.push(v))));
  CB.VARIANT_COUNT = n;
  CB.BASE_COUNT = CB.CATS.length - n;
  CB.VARIANT_AXES = [['durum', 'Durum / dönem'], ['tur', 'Tür aktarımı'], ['bakis', 'Bakış / ölçek'], ['isik', 'Işık imzası']];
})();
