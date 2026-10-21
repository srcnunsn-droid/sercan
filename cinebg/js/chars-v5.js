/* CineBG Studio v5 — karakter kütüphanesi genişletmesi: dünya aktarımları, yeni arketipler,
   görünüm havuzları, yeni formatlar ve yarışma konseptleri (12 → 60).
   Kurallar aynı: gerçek kişi adı yok, yüz tarifi yok, silah kelimesi yok (Seedance moderasyon ön kontrolü). */
(function () {
  const CB = window.CB;

  /* ---------------- dünyalar ----------------
     wear: kostüm aynı kalıpta, bu dünyanın malzemeleriyle yeniden yapılır (siluet imzası korunur).
     subs: aksesuar değişimleri [desen, yeni aksesuar]; eşleşmezse propMat ile yeniden yapılır.
     bg: bu dünyaya uygun arka plan grupları · pal: palet etiketleri · grade: CB.GRADES kimliği */
  CB.WORLDS = [
    { id: 'modern', tr: 'Özgün dünya', en: '', short: 'Arketipin kendi dönemi', bg: [], pal: [], grade: '' },
    { id: 'present', adj: 'present-day', tr: 'Günümüze uyarlama', en: 'the present day', short: '2020’ler, gerçek şehir',
      wear: 'a present-day version of the same outfit: contemporary tailoring, technical fabrics, clean minimal hardware, real high-street construction',
      propMat: 'contemporary matte aluminium and leather', bg: ['modern-city', 'modern-work', 'modern-home', 'modern-leisure', 'modernarch', 'urban'], pal: ['day', 'overcast', 'golden'], grade: 'natural',
      subs: [[/sword|axe|cutlass|longbow|arrow|musket|revolver|rifle|carbine|spear|staff/i, 'a phone held loosely in the right hand'], [/scroll|ledger|map/i, 'a slim tablet in a leather sleeve'], [/lantern|torch|candle/i, 'a small LED pocket torch'], [/helmet/i, 'a cycling helmet clipped to the bag strap']] },
    { id: 'cyber', adj: 'cyberpunk', tr: 'Siberpunk 2088', en: 'a rain-soaked cyberpunk megacity in 2088', short: 'Neon, krom, yağmur',
      wear: 'a 2088 cyberpunk version of the same outfit: wet-look black vinyl and ripstop, thin LED piping along the seams, armoured panels at the shoulders, chrome buckles and a high collar',
      propMat: 'scuffed chrome and smoked polycarbonate with a thin LED strip', bg: ['cyber', 'dystopia', 'nightlife', 'lab'], pal: ['neon', 'night'], grade: 'neon',
      subs: [[/phone|tablet/i, 'a transparent glass phone slab with a glowing edge'], [/laptop/i, 'a folding holographic deck with a cracked casing'], [/notebook|ledger|scroll|map/i, 'a flexible e-paper sheet rolled in one hand'], [/watch/i, 'a chrome forearm interface with a small amber display'], [/camera|gimbal/i, 'a palm-sized drone hovering at the shoulder'], [/coffee|glass|cup/i, 'a self-heating can with a printed hazard stripe']] },
    { id: 'steam', adj: 'steampunk', tr: 'Steampunk Viktorya', en: 'a Victorian steampunk city of brass and coal smoke', short: 'Pirinç, deri, buhar',
      wear: 'a Victorian steampunk version of the same outfit: waxed cotton and wool tweed, oxblood leather harness straps, riveted brass fittings, a waistcoat and gaiters, small brass goggles pushed up',
      propMat: 'polished brass, walnut and stitched leather', bg: ['steampunk', 'dieselpunk', 'industrial', 'historic'], pal: ['golden', 'fire', 'dust'], grade: 'kodak',
      subs: [[/phone|tablet|earpiece/i, 'a brass pocket telegraph on a chain'], [/laptop/i, 'a brass-keyed analytical engine box with paper tape'], [/watch/i, 'a heavy brass pocket watch on a chain'], [/camera|gimbal/i, 'a bellows plate camera with a brass lens'], [/coffee|cup/i, 'a dented tin mug of tea']] },
    { id: 'medieval', adj: 'medieval', tr: 'Ortaçağ fantastik', en: 'a medieval fantasy kingdom', short: 'Taş kale, yün, demir',
      wear: 'a medieval fantasy version of the same outfit: hand-woven wool and linen, boiled leather, hammered iron buckles, a heavy hooded cloak pinned at the shoulder',
      propMat: 'hand-forged iron, oak and rough leather', bg: ['fantasy', 'medievallife', 'siege', 'darkfantasy', 'villages'], pal: ['golden', 'nature', 'dusk'], grade: 'epic',
      subs: [[/phone|tablet/i, 'a small wax-sealed letter held in one hand'], [/laptop|notebook/i, 'a leather-bound book with iron clasps'], [/watch/i, 'a braided leather cuff on the left wrist'], [/camera|gimbal|microphone/i, 'a brass horn hung from the belt'], [/coffee|cup|glass/i, 'a wooden cup'], [/earpiece/i, 'a silver ring on the forefinger']] },
    { id: 'noir40', adj: '1940s', tr: '1940’lar Kara Film', en: 'a 1940s noir city at night', short: 'Fötr, trençkot, sis',
      wear: 'a 1940s version of the same outfit: high-waisted wool trousers or a pencil skirt, a belted gabardine trench, a fedora or a small hat, polished leather shoes',
      propMat: 'Bakelite, nickel and worn leather', bg: ['noir', 'crime', 'urban', 'transport'], pal: ['night', 'golden'], grade: 'noir',
      subs: [[/phone|tablet/i, 'a folded newspaper under one arm'], [/laptop/i, 'a black portable typewriter case'], [/camera|gimbal/i, 'a press camera with a flash bulb'], [/earpiece/i, 'a matchbook turning in the fingers'], [/coffee/i, 'a china coffee cup on a saucer']] },
    { id: 'postapoc', adj: 'post-apocalyptic', tr: 'Kıyamet sonrası', en: 'a post-apocalyptic wasteland', short: 'Toz, pas, yamalı',
      wear: 'a post-apocalyptic version of the same outfit: sun-bleached patched canvas, frayed edges, scavenged road-tyre rubber and plastic shoulder plates, rope belts, dust ground into every seam',
      propMat: 'rusted scrap metal, tape and salvaged plastic', bg: ['postapoc', 'zombie', 'disaster', 'desert'], pal: ['dust', 'toxic', 'overcast'], grade: 'bleach',
      subs: [[/phone|tablet/i, 'a taped-together hand radio'], [/laptop/i, 'a battered solar panel folded under the arm'], [/watch/i, 'a compass strapped to the wrist with tape'], [/camera|gimbal/i, 'cracked binoculars on a cord'], [/coffee|cup|glass/i, 'a dented canteen']] },
    { id: 'spaceop', adj: 'space-opera', tr: 'Uzay operası', en: 'a space-opera interstellar empire', short: 'Yıldız gemisi, pelerin',
      wear: 'a space-opera version of the same outfit: matte ceramic-weave tunic panels, a long asymmetric cape, brushed titanium clasps, magnetic boots, small insignia-free rank bars',
      propMat: 'brushed titanium and frosted glass with a soft inner glow', bg: ['space', 'starship', 'alien', 'battle-future'], pal: ['space', 'cold', 'neon'], grade: 'scifi',
      subs: [[/phone|tablet|notebook/i, 'a thin glass data slate'], [/laptop/i, 'a palm-sized star-map projector'], [/watch/i, 'a titanium wrist communicator'], [/coffee|cup|glass/i, 'a frosted glass flask'], [/camera|gimbal/i, 'a small floating sensor orb']] },
    { id: 'ottoman', adj: '17th-century Ottoman', tr: 'Osmanlı 1600’ler', en: 'the Ottoman capital in the 1600s', short: 'Kaftan, çini, kubbe',
      wear: 'a 1600s Ottoman version of the same outfit: a long silk-brocade kaftan over a cotton entari, a wide sash, embroidered leather boots or slippers, a turban or a small embroidered cap',
      propMat: 'engraved silver, cedar wood and tooled leather', bg: ['anatolia', 'palace', 'historic', 'sacred'], pal: ['palace', 'golden', 'dusk'], grade: 'kodak',
      subs: [[/phone|tablet|notebook/i, 'a folded imperial letter with a wax seal'], [/laptop/i, 'an inlaid writing box with reed pens'], [/watch/i, 'an engraved silver pocket timepiece'], [/coffee|cup/i, 'a small porcelain coffee cup in a silver zarf holder'], [/camera|gimbal|microphone/i, 'a string of amber prayer beads']] },
  ];
  const NATIVE = {
    cyber: ['hacker', 'cybermerc', 'android'], spaceop: ['spacemarine', 'captain', 'envoy', 'bountyhunter'],
    medieval: ['knight', 'wizard', 'ranger', 'witch', 'blacksmith', 'viking'], ottoman: ['janissary', 'pasha', 'sultana'],
    steam: ['inventor'], postapoc: ['survivor'], noir40: ['gangster20'],
  };
  const PERIOD = ['soldier44', 'samurai', 'legionary', 'gunslinger', 'pirate', 'pharaohpriest', 'priest', 'monk', 'nomad', 'caravan', 'vampire', 'infiltrator'];
  /* arketipin kendi dünyası: 'present' (günümüz), bir dünya kimliği ya da 'period' (tarihî/özel dönem) */
  CB.nativeWorld = function (a) {
    for (const w in NATIVE) if (NATIVE[w].includes(a.id)) return w;
    return PERIOD.includes(a.id) ? 'period' : 'present';
  };
  CB.worldOf = (c) => CB.WORLDS.find((w) => w.id === (c && c.world)) || CB.WORLDS[0];
  /* dünya aktarımı geçerli mi (özgün dünya ya da arketipin kendi dünyası ise metin değişmez) */
  CB.isTransposed = (c, a) => { const w = CB.worldOf(c); return w.id !== 'modern' && w.id !== CB.nativeWorld(a); };
  CB.worldWardrobe = function (c, a, text) {
    if (!CB.isTransposed(c, a)) return text;
    return `${text.split(',').slice(0, 2).join(',')} — reimagined as ${CB.worldOf(c).wear}`;
  };
  CB.worldProp = function (c, a, text) {
    if (!CB.isTransposed(c, a)) return text;
    const w = CB.worldOf(c);
    const s = (w.subs || []).find(([re]) => re.test(text));
    return s ? s[1] : `${text} (a ${w.adj} version in ${w.propMat})`;
  };
  CB.worldRole = function (c, a) {
    return CB.isTransposed(c, a) ? `${CB.worldOf(c).adj} ${a.en}` : a.en;
  };

  /* ---------------- yeni arketipler (36 → 60) ---------------- */
  CB.ARCHETYPES.push(
    { id: 'pilot', tr: 'Pilot', en: 'airline captain', g: 'modern', bg: ['transport', 'sky', 'navalair', 'modern-city'],
      wardrobe: ['a navy captain’s uniform jacket with four gold sleeve stripes, white shirt, black tie, polished oxfords', 'a sage-green flight jacket over a grey flight suit, aviator sunglasses hooked on the collar'],
      props: ['a pilot’s cap held under one arm', 'a black flight bag with a hard handle'], hooks: ['the sharp peaked cap brim', 'the four gold stripes catching the light at the cuff'],
      actions: ['walking through a terminal, pulling a flight bag', 'checking the sky through a window, one hand on the cap', 'leaning on a railing beside a parked aircraft', 'turning back to nod at someone off screen'] },
    { id: 'firefighter', tr: 'İtfaiyeci', en: 'veteran firefighter', g: 'modern', bg: ['disaster', 'urban', 'industrial'],
      wardrobe: ['a tan turnout coat and trousers with reflective bands, braces over a navy tee, heavy rubber boots', 'a navy station tee, turnout trousers with braces hanging at the hips, boots'],
      props: ['a helmet held by the brim', 'a coiled length of canvas hose over one shoulder'], hooks: ['the reflective bands glowing in the dark', 'the oversized helmet brim'],
      actions: ['walking out of smoke, helmet in hand, soot on the cheeks', 'sitting on a truck step, catching breath', 'wiping the forehead with the back of a glove', 'looking up at a building, jaw set'] },
    { id: 'mountaineer', tr: 'Dağcı', en: 'high-altitude mountaineer', g: 'modern', bg: ['mountains', 'polar'],
      wardrobe: ['a red down summit suit, harness, crampons strapped to mountaineering boots, glacier goggles', 'a faded orange hardshell jacket, fleece hood, softshell trousers, gaiters'],
      props: ['an ice axe strapped to the pack', 'a coil of climbing rope over the shoulder'], hooks: ['the puffed silhouette of the down suit against the snow', 'the rope coil crossing the chest'],
      actions: ['planting a boot on a snow ridge, breathing hard', 'pulling the goggles up onto the forehead', 'looking up the slope, hand shading the eyes', 'sitting on the pack, sipping from a flask'] },
    { id: 'surfer', tr: 'Sörfçü', en: 'big-wave surfer', g: 'modern', bg: ['coast', 'modern-leisure'],
      wardrobe: ['a black full wetsuit unzipped to the waist, a sun-faded rash vest', 'a long-sleeve spring suit, salt-stiff hair, bare feet'],
      props: ['a long gun surfboard carried under one arm', 'a leash coiled around the ankle'], hooks: ['the tall board standing beside the figure like a column', 'the wetsuit peeled to the waist'],
      actions: ['jogging toward the waves, board under the arm', 'sitting on the sand, watching the swell', 'shaking water out of the hair', 'standing on rocks, reading the sea'] },
    { id: 'dj', tr: 'DJ / prodüktör', en: 'club DJ and producer', g: 'modern', bg: ['nightlife', 'modern-leisure', 'filmset'],
      wardrobe: ['an oversized black tee, black cargo trousers, white sneakers, a thin silver chain', 'a mesh long-sleeve top under a sleeveless puffer vest, wide black trousers'],
      props: ['studio headphones around the neck', 'a small controller with glowing pads'], hooks: ['the headphones pressed to one ear', 'the oversized vest silhouette'],
      actions: ['one hand on a mixer, head nodding', 'pressing headphones to one ear, eyes closed', 'raising one hand to the crowd off screen', 'leaning over the deck, face lit from below'] },
    { id: 'dancer', tr: 'Bale dansçısı', en: 'principal ballet dancer', g: 'modern', bg: ['palace', 'filmset', 'public', 'sacred'],
      wardrobe: ['a plain black leotard, wrap skirt, pale tights, satin pointe shoes', 'a loose white rehearsal top, black leggings, knitted leg warmers'],
      props: ['pointe shoe ribbons wrapped at the ankle', 'a towel draped over the barre'], hooks: ['the long line of the extended arm', 'the tight bun and long neck'],
      actions: ['holding an arabesque, perfectly still', 'tying the pointe shoe ribbons', 'stretching at the barre', 'turning mid-pirouette, skirt flaring'] },
    { id: 'breaker', tr: 'Sokak dansçısı', en: 'street dancer', g: 'modern', bg: ['urban', 'modern-city', 'nightlife'],
      wardrobe: ['a vintage track jacket, baggy jeans, high-top sneakers, a bucket hat', 'a cropped hoodie, wide cargo trousers, beaten skate shoes'],
      props: ['a portable speaker on the ground', 'a bandana tied around the wrist'], hooks: ['the oversized track jacket', 'the bucket hat pulled low'],
      actions: ['frozen mid-move on one hand', 'walking into a circle of light, nodding to the beat', 'spinning on the shoulders', 'landing a jump, dust rising'] },
    { id: 'reporter', tr: 'Savaş muhabiri', en: 'war correspondent', g: 'modern', bg: ['battle-modern', 'urban', 'disaster', 'desert'],
      wardrobe: ['a dusty canvas press vest with plain empty patches over a khaki shirt, cargo trousers, desert boots', 'a scarf around the neck, a field jacket with rolled sleeves'],
      props: ['a professional camera with a long lens', 'a small notepad in the breast pocket'], hooks: ['the press vest silhouette', 'the camera strap crossing the chest'],
      actions: ['crouching behind a low wall, camera raised', 'writing quickly in the notepad', 'looking at the camera screen, frowning', 'walking through dust with the scarf over the mouth'] },
    { id: 'explorer', tr: 'Arkeolog / kâşif', en: 'field archaeologist', g: 'history', bg: ['egypt', 'jungle', 'caves', 'desert'],
      wardrobe: ['a sweat-stained linen shirt with rolled sleeves, khaki trousers, a canvas satchel, a wide-brimmed hat', 'a waxed field jacket, neckerchief, high laced boots'],
      props: ['a brass oil lantern', 'a soft brush and a small trowel'], hooks: ['the wide hat brim shadowing the eyes', 'the satchel strap across the chest'],
      actions: ['brushing sand off a carved stone', 'holding the lantern up in a dark passage', 'reading a map on one knee', 'looking up at a huge doorway, mouth slightly open'] },
    { id: 'monk', tr: 'Dövüş sanatları keşişi', en: 'martial arts monk', g: 'history', bg: ['eastasia', 'mountains', 'sacred'],
      wardrobe: ['a saffron cotton robe tied at the waist, leg wraps, simple cloth shoes', 'a grey training tunic, wide trousers, bound forearms'],
      props: ['a wooden prayer bead string', 'a long wooden staff held upright'], hooks: ['the robe draped over one shoulder', 'the upright staff beside the figure'],
      actions: ['holding a low stance, palms forward', 'sweeping a temple courtyard', 'sitting cross-legged, eyes closed', 'mid-kick, robe flaring'] },
    { id: 'sultana', tr: 'Osmanlı sultanı', en: 'Ottoman valide sultan', g: 'history', bg: ['palace', 'anatolia', 'sacred'],
      wardrobe: ['a long gold-brocade kaftan over a silk entari, a jewelled belt, a tall embroidered headdress with a sheer veil at the back', 'a deep-red velvet kaftan with fur trim, pearl strings, embroidered slippers'],
      props: ['a ring of heavy keys on the belt', 'a sealed letter held in one hand'], hooks: ['the tall headdress with the flowing veil', 'the long brocade train'],
      actions: ['walking through a tiled corridor, servants out of frame', 'reading a letter by a lattice window', 'turning the head slowly toward the door', 'seated on a cushioned divan, very still'] },
    { id: 'infiltrator', tr: 'Gölge sızıcı', en: 'shadow infiltrator', g: 'history', bg: ['eastasia', 'palace', 'historic'],
      wardrobe: ['dark indigo wrapped clothing, split-toe soft boots, a hood and a face cloth pulled down', 'a charcoal hooded wrap, bound sleeves, a rope belt'],
      props: ['a coil of rope with a small hook', 'a folded paper message'], hooks: ['the hood shadowing the eyes', 'the wrapped forearms'],
      actions: ['crouched on a roof ridge, perfectly still', 'dropping silently from a beam', 'pressing against a wall, listening', 'reading a paper message by moonlight'] },
    { id: 'nomad', tr: 'Bozkır atlısı', en: 'steppe horse nomad', g: 'history', bg: ['plains', 'mountains', 'desert'],
      wardrobe: ['a quilted deel robe tied with a wide silk sash, felt-lined boots, a fur-trimmed hat', 'a felt coat over layered wool, leather riding boots, a wrapped scarf'],
      props: ['a leather horse whip at the belt', 'a felt saddlebag over one shoulder'], hooks: ['the fur hat against the open sky', 'the wide sash'],
      actions: ['shading the eyes, scanning the horizon', 'leading a horse by the reins', 'sitting by a small fire in the wind', 'walking into the wind, coat pressed to the body'] },
    { id: 'caravan', tr: 'Çöl kervan rehberi', en: 'desert caravan guide', g: 'history', bg: ['desert', 'africa', 'egypt'],
      wardrobe: ['an indigo-dyed robe and a long wrapped indigo turban veil, leather sandals', 'a pale linen robe, a woven belt, a sand-coloured head wrap'],
      props: ['a leather water skin', 'a camel lead rope'], hooks: ['the long indigo veil moving in the wind', 'the tall wrapped turban'],
      actions: ['reading the dunes, one hand raised', 'leading a camel across a ridge', 'pouring tea by a small fire', 'kneeling to read tracks in the sand'] },
    { id: 'envoy', tr: 'Yabancı elçi', en: 'alien diplomatic envoy', g: 'scifi', bg: ['alien', 'starship', 'space'],
      wardrobe: ['flowing layered robes of iridescent fabric, a high stiff collar, slender metal finger caps', 'a structured pale ceramic coat with soft glowing seams, long gloves'],
      props: ['a slim crystalline staff of office', 'a small hovering translator orb'], hooks: ['the towering stiff collar', 'the long iridescent train'],
      actions: ['bowing slowly, hands folded', 'raising one palm in greeting', 'walking down a long ramp, robes trailing', 'standing at a viewport, perfectly still'] },
    { id: 'bountyhunter', tr: 'Uzay ödül avcısı', en: 'space bounty tracker', g: 'scifi', bg: ['alien', 'starship', 'desert', 'cyber'],
      wardrobe: ['a battered sand-coloured flight jacket over mismatched armour plates, a long scarf, worn boots', 'a dark poncho over a padded suit, a respirator hanging at the chest'],
      props: ['a scanner device with a small amber screen', 'a wanted-poster data card'], hooks: ['the poncho silhouette in the wind', 'the respirator mask hanging at the chest'],
      actions: ['checking the scanner, eyes narrowed', 'stepping into an empty cantina doorway', 'crouching to look at tracks', 'leaning against a ship hull, waiting'] },
    { id: 'vampire', tr: 'Vampir aristokrat', en: 'centuries-old vampire aristocrat', g: 'horror', bg: ['darkfantasy', 'horror', 'palace'],
      wardrobe: ['a black velvet frock coat with a high collar, a silk cravat, a dark red waistcoat, polished boots', 'a long black gown with a high lace collar and a velvet cape'],
      props: ['a silver-topped cane', 'a single candle in a silver holder'], hooks: ['the high upturned collar', 'the long cape pooling on the floor'],
      actions: ['standing at a tall window in moonlight', 'turning slowly from the shadows', 'descending a staircase, hand on the rail', 'sitting very still in a high-backed chair'] },
    { id: 'investigator', tr: 'Paranormal araştırmacı', en: 'paranormal investigator', g: 'horror', bg: ['horror', 'villages', 'residential'],
      wardrobe: ['a worn wax jacket, a knit sweater, corduroy trousers, muddy boots', 'a long dark parka, beanie, fingerless gloves'],
      props: ['a handheld EMF meter with a small red light', 'a flashlight held low'], hooks: ['the flashlight beam cutting the dark', 'the hood of the parka'],
      actions: ['sweeping a flashlight across a dark room', 'kneeling to listen at a floorboard', 'holding up the meter, its light flickering', 'backing slowly out of a doorway'] },
    { id: 'biotech', tr: 'Biyoteknoloji araştırmacısı', en: 'biotech researcher', g: 'scifi', bg: ['lab', 'solarpunk', 'micro'],
      wardrobe: ['a white lab coat over a black roll-neck, safety glasses pushed up, nitrile gloves', 'a sealed clean-room suit with a clear face shield'],
      props: ['a glowing sample vial', 'a tablet with a protein model'], hooks: ['the long lab coat', 'the clear face shield'],
      actions: ['holding a vial up to the light', 'looking into a microscope', 'typing notes, face lit by a screen', 'walking through an airlock'] },
    { id: 'racer', tr: 'Yarış pilotu', en: 'racing driver', g: 'ads', bg: ['roads', 'modern-leisure', 'ad-tech', 'arena'],
      wardrobe: ['a fireproof racing suit with plain colour panels, unzipped to the waist and tied by the sleeves, racing boots', 'a full racing suit zipped up, balaclava pulled down at the neck'],
      props: ['a full-face helmet held by the chin bar', 'racing gloves tucked into the suit'], hooks: ['the suit tied at the waist by the sleeves', 'the glossy full-face helmet'],
      actions: ['walking down the pit lane, helmet in hand', 'pulling on gloves, staring ahead', 'leaning on the car, catching breath', 'sitting in the cockpit, visor up'] },
    { id: 'watchmaker', tr: 'Saat ustası', en: 'master watchmaker', g: 'ads', bg: ['ad-luxury', 'modern-retail', 'historic'],
      wardrobe: ['a grey work apron over a white shirt with rolled sleeves, a loupe on a band, sleeve garters', 'a dark knit waistcoat, crisp shirt, reading glasses'],
      props: ['a watchmaker’s loupe', 'a fine pair of brass tweezers'], hooks: ['the loupe over one eye', 'the apron bib'],
      actions: ['setting a tiny gear with tweezers', 'holding a finished watch up to the light', 'leaning over the bench lamp', 'listening to a movement, eyes closed'] },
    { id: 'podcaster', tr: 'Podcast sunucusu', en: 'podcast host', g: 'modern', bg: ['modern-work', 'modern-home', 'filmset'],
      wardrobe: ['a heavyweight black tee, a dark overshirt, slim chinos, minimal sneakers', 'a fitted knit polo, tailored trousers, a simple steel watch'],
      props: ['a broadcast microphone on a boom arm', 'over-ear headphones'], hooks: ['the microphone arm crossing the frame', 'the headphones around the neck'],
      actions: ['leaning into the microphone mid-sentence', 'laughing back in the chair', 'making a point with an open hand', 'listening with the chin on the fist'] },
    { id: 'architect', tr: 'Mimar', en: 'visionary architect', g: 'modern', bg: ['modernarch', 'modern-city', 'solarpunk'],
      wardrobe: ['a black collarless jacket over a grey tee, black tapered trousers, minimal leather boots, thin round glasses', 'an oatmeal linen shirt with rolled sleeves, wide charcoal trousers, a hard hat clipped to the belt'],
      props: ['a rolled set of drawings under one arm', 'a small white architectural model in one hand'], hooks: ['the long collarless jacket line', 'the rolled drawings tucked under the arm'],
      actions: ['unrolling drawings on a concrete ledge', 'looking up at a building, one hand shading the eyes', 'turning the model slowly in the light', 'walking through an unfinished concrete hall'] },
    { id: 'speaker', tr: 'Sahne konuşmacısı / mentor', en: 'keynote speaker and business mentor', g: 'modern', bg: ['arena', 'modern-work', 'modernarch', 'filmset'],
      wardrobe: ['a black slim suit over a black tee, black sneakers, a thin headset microphone', 'a tailored navy blazer, white tee, dark jeans, white leather sneakers'],
      props: ['a thin headset microphone along the cheek', 'a small presentation clicker'], hooks: ['the clean single-colour suit silhouette under a spotlight', 'the open blazer in motion'],
      actions: ['walking across a stage, one hand gesturing', 'pausing at the edge of the stage, looking out', 'clicking to the next slide behind', 'stepping off stage, removing the headset'] },
  );

  /* ---------------- görünüm havuzları ---------------- */
  const L = CB.CHAR_LOOK;
  const add = (k, arr) => { L[k].push(...arr.filter((x) => !L[k].some((y) => JSON.stringify(y) === JSON.stringify(x)))); };
  add('build', ['rangy', 'compact and powerful', 'barrel-chested', 'long-limbed', 'slight and quick', 'heavy and strong']);
  add('origin', ['Central Asian', 'North African', 'Pacific Islander', 'Caribbean', 'Persian', 'Celtic', 'Balkan', 'Caucasian-highland', 'Indigenous American', 'Korean', 'Japanese', 'Brazilian', 'Ethiopian', 'Filipino', 'Levantine', 'Greek']);
  add('face', ['a long straight nose', 'a wide expressive mouth', 'hooded eyes with heavy lashes', 'a narrow pointed chin', 'deep vertical frown lines', 'full cheeks and a dimpled smile', 'angular hollow temples', 'a gap between the front teeth', 'a prominent aquiline nose', 'a square forehead and a short nose', 'almond eyes set slightly far apart', 'a small upturned nose', 'a high domed forehead', 'heavy-lidded sleepy eyes', 'a sharp widow’s peak', 'faint acne scars along the jaw', 'thick straight eyebrows that nearly meet', 'a soft double chin']);
  add('hairM', ['a man bun', 'long dreadlocks tied back', 'a high-top fade', 'a side part with a taper', 'tight cornrows', 'a receding hairline cut short', 'messy bed-head waves', 'a mohawk with shaved sides', 'curly hair to the shoulders', 'a pompadour', 'a long ponytail at the nape']);
  add('hairW', ['box braids to the waist', 'a shaved head', 'a voluminous afro', 'wolf-cut layers', 'two space buns', 'a sleek wet-look bob', 'a long side braid over the shoulder', 'finger waves', 'a curly undercut', 'short silver curls', 'a headscarf wrapped over the hair']);
  add('hairColor', ['jet black with a blue sheen', 'honey blond', 'strawberry blond', 'white', 'mahogany', 'dark roots fading to blond', 'pastel pink']);
  add('beard', ['a long braided beard', 'a chinstrap beard', 'mutton chops', 'a pencil moustache', 'a thick short boxed beard', 'a patchy uneven beard']);
  add('marks', ['a burn scar across the back of the left hand', 'a nose ring', 'a faded geometric tattoo on the forearm', 'a split eyebrow', 'vitiligo patches on the hands and neck', 'a single dimple', 'a scar along the jawline', 'heavy dark circles under the eyes', 'a beauty mark above the lip', 'an ear cuff of small silver rings', 'a crooked broken little finger', 'a bandaged knuckle', 'a calloused, ink-stained right hand', 'a hearing aid in the left ear', 'a reading-glasses chain around the neck', 'a faint scar at the hairline', 'sunburnt cheeks and nose', 'a prosthetic left forearm with clean matte finish']);
  add('accents', [['scarlet', '#D7263D'], ['coral', '#F26B5B'], ['amber', '#F5A524'], ['lemon', '#E8D23A'], ['lime', '#7CC242'], ['emerald', '#138A55'], ['mint', '#5FD1A6'], ['turquoise', '#16B5B0'], ['sky blue', '#4BA3E3'], ['navy', '#1F3A68'], ['indigo', '#3B2F8F'], ['lavender', '#9C8FD9'], ['plum', '#7A2F5C'], ['fuchsia', '#E2309B'], ['blush pink', '#E8A0B4'], ['oxblood', '#6B1A1F'], ['terracotta', '#C2603D'], ['mustard', '#C9A227'], ['olive', '#7A7A2E'], ['sage', '#8FA88A'], ['silver', '#BFC5CC'], ['gold', '#D4AF37'], ['bone', '#D9CFB8'], ['ink black', '#1A1C22']]);
  add('expressions', ['a slow knowing smile', 'contempt with one corner of the mouth', 'grief held back, eyes wet', 'fear, eyes wide and breath held', 'sly amusement, eyes narrowed', 'cold stare, no blink', 'tenderness, softened eyes', 'shock, mouth slightly open', 'disgust with the nose wrinkled', 'pride, chin lifted', 'confusion, head tilted', 'exhilaration, mouth open in a shout', 'boredom, eyelids heavy', 'suspicion, brows drawn together', 'relief, a long exhale', 'embarrassment, eyes cast down', 'defiance, jaw forward', 'awe, gaze lifted']);
  add('states', [
    ['muddy', 'Çamurlu', 'mud-caked: wet mud splashed to the knees and up one side, drying lighter at the edges, hands dirty'],
    ['burnt', 'İs / duman', 'smoke-stained: soot across the face and clothes, singed fabric edges, eyes red from smoke'],
    ['desert', 'Çöl tozu', 'sun-baked and dusty: fine sand in every fold, sun-bleached fabric, cracked lips, squinting'],
    ['night', 'Gece neon', 'lit by night neon: wet surfaces, coloured reflections on skin and fabric, rain beads on the shoulders'],
    ['injured', 'Bandajlı', 'bandaged: a clean cloth bandage around the forearm and a plaster on the brow, tired posture; no blood'],
    ['casual', 'Gündelik', 'off-duty: the same person in a plain tee, soft trousers and sneakers, same accessories'],
    ['ceremonial', 'Tören kıyafeti', 'ceremonial: the same costume in its finest version, pressed, polished, with an added sash and cape'],
    ['undercover', 'Kılık değiştirmiş', 'undercover: hood up, plain dark layers over the costume, a cap low over the eyes'],
    ['frozen', 'Donmuş', 'frost-bitten: ice crystals on the brows and lashes, frost on the fabric, breath clouding'],
    ['victory', 'Zafer anı', 'triumphant: clothes dishevelled from effort, sweat on the brow, a wide open smile, arms loose'],
    ['ghost', 'Hayalet ışığı', 'lit by a cold spectral glow from below, pale skin, eyes catching a blue-white light, costume unchanged'],
    ['gold', 'Altın kaplama', 'rendered as a living gold statue: skin and costume coated in brushed gold leaf, same pose and construction'],
  ]);

  /* ---------------- formatlar ---------------- */
  CB.FORMATS.push(['faceless', 'Faceless belgesel'], ['truecrime', 'Gerçek suç (kurgu)'], ['explainer', 'Açıklayıcı / eğitici'], ['music', 'Müzik klibi'],
    ['fight', 'Aksiyon / koreografi'], ['launch', 'Ürün lansmanı'], ['travel', 'Seyahat'], ['horror', 'Korku / gerilim'], ['transform', 'Önce / sonra dönüşüm'], ['podcast', 'Podcast klibi']);

  /* ---------------- yeni konseptler (12 → 60) ---------------- */
  CB.CONCEPTS.push(
    /* ---- reklam ---- */
    { f: 'ad', tr: 'Ofis Her Yerde', t: 'golden', log: '{P} aynı dizüstüyle imkânsız yerlerde çalışıyor: zirvede, çölde, yörüngede. Ofis artık bir yer değil.',
      hook: 'İlk kare: kar fırtınasında bir dağ zirvesinde açık bir dizüstü.', shots: [
        { bg: ['mountains'], act: '{P} sits on a rock at a windy summit typing on a laptop, scarf whipping in the wind', cam: 'orbit', snd: 'wind gusts, soft keyboard clicks', ost: 'Ofis:' },
        { bg: ['desert'], act: '{P} types at a small folding table alone on a sand ridge, the same laptop and posture', cam: 'xls', snd: 'wind over sand', ost: '' },
        { bg: ['underwater', 'coast'], act: '{P} glances up from the same laptop at a huge view, completely calm', cam: 'eye', snd: 'deep muffled ambience', ost: '' },
        { bg: ['modern-work'], act: '{P} closes the laptop in a bright minimal office and smiles to the side of camera', cam: 'detail', snd: 'lid click, room tone', ost: 'Neresi istersen.' }] },
    { f: 'ad', tr: 'Yedi Gün', log: 'Pazartesiden pazara tek bir fikir büyüyor: küçük bir odadan dev bir sahneye, her gün başka bir mekân.',
      hook: 'Ekranda "Pazartesi" ve küçük bir masa lambası.', shots: [
        { bg: ['modern-home'], act: '{P} writes one line on a sticky note under a small desk lamp at night', cam: 'detail', snd: 'pen on paper', ost: 'Pazartesi' },
        { bg: ['modern-work'], act: '{P} sticks the note on a glass wall now covered with notes, steps back to look', cam: 'track', snd: 'office hum', ost: 'Çarşamba' },
        { bg: ['modernarch', 'modern-city'], act: '{P} walks across a vast concrete plaza at dawn, coat moving', cam: 'est', snd: 'footsteps, distant city', ost: 'Cuma' },
        { bg: ['arena'], act: '{P} walks onto a huge empty stage under one spotlight and stops at the centre mark', cam: 'low', snd: 'a single deep boom, silence', ost: 'Pazar' }] },
    /* ---- kısa film ---- */
    { f: 'short', tr: 'İlk Müşteri', t: 'darknight', w: 'rain', log: 'Yağmurlu bir gece, boş bir ofis ve çalmayan bir telefon. {P} vazgeçmek üzereyken ekran yanıyor.',
      hook: 'İlk kare: ekranı karanlık bir telefon ve yanında soğumuş kahve.', shots: [
        { bg: ['modern-work'], act: '{P} sits alone at a desk in a dark office, staring at a phone lying face up', cam: 'window', snd: 'rain on glass, a clock ticking', ost: '' },
        { bg: ['modern-work'], act: '{P} stands up and reaches for the coat, giving up for the night', cam: 'eye', snd: 'chair creak', ost: '' },
        { bg: ['modern-work'], act: 'the phone lights up on the desk; {P} freezes halfway into the coat', cam: 'detail', snd: 'a single vibration', ost: '1 yeni mesaj' },
        { bg: ['modern-city'], act: '{P} walks out into the rain smiling, not bothering to close the coat', cam: 'low', snd: 'rain, traffic, a laugh', ost: 'Hepsi bir "evet"le başladı.' }] },
    { f: 'short', tr: 'Sessiz Mentor', t: 'moonnight', log: 'Gece boş bir kütüphanede {P} tek bir cümleyi tahtaya yazıyor. Sabah o cümle başka birinin yolunu değiştiriyor.',
      hook: 'İlk kare: karanlık kütüphanede tek bir lamba.', shots: [
        { bg: ['academy', 'public'], act: '{P} walks between tall bookshelves at night carrying a single lamp', cam: 'track', snd: 'old wood creaks, footsteps', ost: '' },
        { bg: ['academy'], act: '{P} writes one short line on a chalkboard, then sets the chalk down', cam: 'detail', snd: 'chalk scraping', ost: '' },
        { bg: ['academy', 'public'], act: '{P} turns off the lamp and leaves; moonlight falls across the empty desks', cam: 'sym', snd: 'door closing, silence', ost: '' },
        { bg: ['modern-city', 'modernarch'], act: '{P} watches the sunrise from a rooftop, coffee in hand', cam: 'silhouette', snd: 'birds, distant traffic', ost: 'Bazen tek cümle yeter.' }] },
    /* ---- fragman ---- */
    { f: 'trailer', tr: 'İmparatorluk Kuran', g: 'epic', log: 'Bir sarayın taht odasından savaş haritasına, oradan zirveye: {P} merkezli tarihî bir girişim destanı.',
      hook: 'İlk kare: altın ışıkta boş bir taht.', shots: [
        { bg: ['palace'], act: 'an empty throne in a vast golden hall; {P} walks past it without looking', cam: 'sym', snd: 'low choir, footsteps echoing', ost: 'Taht değil...' },
        { bg: ['anatolia', 'historic'], act: '{P} unrolls a large map on a wooden table in a candle-lit room', cam: 'high34', snd: 'parchment, a drumbeat', ost: '...vizyon.' },
        { bg: ['siege', 'battle-ancient'], act: '{P} stands on a fortress wall at dusk looking over the plain, banners moving', cam: 'tele', snd: 'wind, drums build', ost: '' },
        { bg: ['mountains', 'sky'], act: '{P} reaches a summit at sunrise and stops, coat moving in the wind', cam: 'orbit', snd: 'full orchestral swell', ost: 'YAKINDA' }] },
    { f: 'trailer', tr: 'Son Sınır', g: 'scifi', log: 'Bir yıldız gemisinin köprüsünden yabancı bir gezegenin yüzeyine: {P} insanlığın ilk girişimini uzayda kuruyor.',
      hook: 'İlk kare: pencerede dönen bir gezegen.', shots: [
        { bg: ['starship'], act: '{P} stands on a dim starship bridge looking at a planet through the viewport', cam: 'window', snd: 'engine hum', ost: '2099' },
        { bg: ['starship', 'space'], act: '{P} walks down a long white corridor as panels light up one by one', cam: 'sym', snd: 'rhythmic panel clicks', ost: '' },
        { bg: ['alien'], act: '{P} steps onto alien ground, dust lifting around the boots, two moons in the sky', cam: 'worm', snd: 'deep bass swell', ost: '' },
        { bg: ['space'], act: 'the starship turns slowly away from the planet; {P} is a small figure at the window', cam: 'xls', snd: 'silence, then one note', ost: 'SON SINIR' }] },
    /* ---- komedi ---- */
    { f: 'comedy', tr: 'Bu Bir E-posta Olabilirdi', log: 'Ortaçağ konsey salonunda uzun bir toplantı. Sonunda {P} tek cümle söylüyor: "Bu bir e-posta olabilirdi."',
      hook: 'İlk kare: devasa bir taş salonda tek bir boş sandalye.', shots: [
        { bg: ['palace', 'medievallife'], act: '{P} sits at the end of a long council table in a stone hall, chin on hand, bored', cam: 'sym', snd: 'murmuring voices, a gavel', ost: 'Toplantı: 4. saat' },
        { bg: ['palace', 'medievallife'], act: '{P} slowly lifts a phone above the table and checks the time', cam: 'detail', snd: 'a long sigh', ost: '' },
        { bg: ['palace', 'medievallife'], act: '{P} stands up, nods politely to the room and walks out', cam: 'track', snd: 'chair scrape, silence', ost: 'Bu bir e-posta olabilirdi.' }] },
    { f: 'comedy', tr: 'Yanlış Kitle', log: '{P} dev bir sahnede motivasyon konuşması yapıyor. Kamera dönüyor: dinleyiciler bir koyun sürüsü.',
      hook: 'İlk kare: spot ışığı altında tutkulu bir el hareketi.', shots: [
        { bg: ['arena', 'modern-leisure'], act: '{P} gestures passionately on a stage under a spotlight, mid-sentence', cam: 'low', snd: 'echoing voice, no words audible', ost: 'Hedef kitle:' },
        { bg: ['plains', 'villages'], act: '{P} stands on a hay bale in a green field still gesturing, a flock of sheep grazing, uninterested', cam: 'reverse', snd: 'sheep bleating, wind', ost: '' },
        { bg: ['plains', 'villages'], act: '{P} lowers the hand, looks at the sheep, then shrugs to camera', cam: 'eye', snd: 'one bleat', ost: 'Yanlış hedefleme.' }] },
    /* ---- çılgın konsept ---- */
    { f: 'crazy', tr: 'Ters Yerçekimi Ofisi', log: '{P} tavanda yürüyerek ofise giriyor. Kimse şaşırmıyor. Sonunda pencereden aşağı, gökyüzüne doğru "düşüyor".',
      hook: 'İlk kare: ters dönmüş bir ofis koridoru.', shots: [
        { bg: ['modern-work'], act: '{P} walks upside down along the ceiling of an office corridor, perfectly calm, coat hanging upward', cam: 'dutch', snd: 'normal footsteps', ost: '' },
        { bg: ['modern-work'], act: '{P}, upside down, pours coffee that flows up into the cup', cam: 'detail', snd: 'liquid pour reversed', ost: 'Kuralları kim koydu?' },
        { bg: ['sky', 'modern-city'], act: '{P} steps off a rooftop edge and drifts calmly up into the clouds, arms relaxed', cam: 'worm', snd: 'wind swell', ost: '' }] },
    { f: 'crazy', tr: 'Sonsuz Koridor', log: 'Her kapı başka bir on yıla açılıyor. {P} aynı adımla 1920’lerden 2090’lara yürüyor.',
      hook: 'İlk kare: dibi görünmeyen kapılarla dolu bir koridor.', shots: [
        { bg: ['noir', 'historic'], act: '{P} steps through a door into a smoky 1920s room, glances around, keeps walking', cam: 'pov', snd: 'gramophone jazz', ost: '1925' },
        { bg: ['dieselpunk', 'transport'], act: '{P} steps through the next door into a 1960s train station, same stride', cam: 'track', snd: 'station announcement echo', ost: '1965' },
        { bg: ['modern-city'], act: '{P} steps into a present-day street, same stride', cam: 'track', snd: 'traffic', ost: 'Bugün' },
        { bg: ['cyber', 'solarpunk'], act: '{P} steps into a future city and finally stops, smiling', cam: 'low', snd: 'synth swell', ost: '2090' }] },
    /* ---- meme ---- */
    { f: 'meme', tr: 'Sabah 5 Kulübü', t: 'bluehour', log: '"Herkes: sabah 5’te kalk. Ben:" — {P} mavi saatte bir uçurum kenarında, sakin.',
      hook: 'Üst yazı: "Herkes: sabah 5’te kalk."', shots: [
        { bg: ['modern-home'], act: 'an alarm clock showing 05:00 on a dark bedside table', cam: 'detail', snd: 'alarm beep', ost: 'Herkes: sabah 5’te kalk.' },
        { bg: ['mountains', 'coast'], act: '{P} stands at a cliff edge at blue hour, coffee in hand, already dressed, looking at the horizon', cam: 'silhouette', snd: 'wind, one bird', ost: 'Ben: zaten buradayım.' }] },
    { f: 'meme', tr: 'Pazartesi / Cuma', log: 'Aynı kişi, iki gün: pazartesi sabahı gri bir ofiste, cuma akşamı destansı bir manzarada.',
      hook: 'Ekran ikiye bölünmüş gibi başlayan iki kare.', shots: [
        { bg: ['modern-work'], act: '{P} stares at a screen under flat fluorescent light, motionless', cam: 'eye', snd: 'printer noise', ost: 'Pazartesi 09:00' },
        { bg: ['coast', 'mountains', 'sky'], act: '{P} in the same outfit stands in a wide golden landscape, arms open', cam: 'est', snd: 'epic music sting', ost: 'Cuma 18:00' }] },
    /* ---- faceless belgesel ---- */
    { f: 'faceless', tr: 'Bir Ticaret İmparatorluğunun Doğuşu', g: 'kodak', log: 'Anlatıcı sesli, yüzsüz bir belgesel: baharat yollarından büyük çarşıya, bir ticaret ağının yükselişi. {P} yalnızca arkadan ve siluet olarak görünüyor.',
      hook: 'İlk kare: kervan siluetleri ve "1453" yazısı.', shots: [
        { bg: ['desert', 'egypt'], act: 'a caravan crosses a dune at sunset; {P} walks at the front, seen only from behind', cam: 'xls', snd: 'wind, camel bells', ost: '1453' },
        { bg: ['anatolia', 'historic'], act: 'close on hands weighing spices on a brass scale in a covered bazaar, {P} out of focus behind', cam: 'detail', snd: 'bazaar murmur', ost: '' },
        { bg: ['coast', 'pirates'], act: 'cargo ships in a harbour at dawn; {P} stands on the quay in silhouette', cam: 'tele', snd: 'gulls, ropes creaking', ost: '' },
        { bg: ['palace'], act: '{P} walks away down a long tiled hall, back to camera', cam: 'sym', snd: 'footsteps, narrator pause', ost: 'Her ağ bir düğümle başlar.' }] },
    { f: 'faceless', tr: 'Paranın Kısa Tarihi', log: 'Takastan dijital paraya beş bin yıl: her çağ bir sahne, {P} her sahnede arkadan yürüyen bir gözlemci.',
      hook: 'İlk kare: kil tablet üzerinde parmak izi.', shots: [
        { bg: ['egypt', 'greco'], act: 'an ancient market of grain sacks and clay tablets; {P} walks through it seen from behind', cam: 'track', snd: 'market voices', ost: 'M.Ö. 3000' },
        { bg: ['greco', 'historic'], act: 'close on coins being struck in a small workshop, sparks of light on metal', cam: 'macro', snd: 'hammer taps', ost: '' },
        { bg: ['steampunk', 'historic'], act: '{P} walks between tall bank counters in a Victorian hall, back to camera', cam: 'sym', snd: 'ledger pages, a clock', ost: '1850' },
        { bg: ['cyber', 'modern-city'], act: '{P} stands at a window above a glowing city, the reflection of screens on the glass', cam: 'window', snd: 'electronic hum', ost: 'Bugün' }] },
    { f: 'faceless', tr: 'Kayıp Şehrin İzinde', w: 'mist', log: 'Ormanın içinde kaybolmuş bir şehrin izini süren yüzsüz bir keşif belgeseli. {P} fener ışığıyla ilerleyen bir figür.',
      hook: 'İlk kare: sisin içinden yükselen taş bir yüz.', shots: [
        { bg: ['jungle'], act: '{P} pushes through giant leaves, seen from behind, mist hanging in the air', cam: 'pov', snd: 'insects, dripping water', ost: '' },
        { bg: ['jungle', 'myth'], act: 'a huge moss-covered stone face appears through the mist; {P} stops small beneath it', cam: 'worm', snd: 'low drone', ost: 'Haritada yok.' },
        { bg: ['caves'], act: '{P} holds a lantern up in a carved tunnel, light sliding over old symbols', cam: 'track', snd: 'echoing drips', ost: '' },
        { bg: ['caves', 'sacred'], act: '{P} reaches a vast underground hall lit by a single shaft of daylight', cam: 'est', snd: 'choir-like wind', ost: 'Yoksa var mı?' }] },
    { f: 'faceless', tr: 'Disiplinin Bilimi', log: 'Beyindeki tek bir alışkanlık döngüsünün belgeseli: mikroskobik dünyadan zirveye, {P} siluet olarak.',
      hook: 'İlk kare: karanlıkta parlayan bir nöron ağı.', shots: [
        { bg: ['micro'], act: 'glowing neuron branches pulse in the dark like a living forest', cam: 'macro', snd: 'soft electrical crackle', ost: '21 gün' },
        { bg: ['lab'], act: '{P} in silhouette stands in front of a wall of brain scans', cam: 'silhouette', snd: 'machine hum', ost: '' },
        { bg: ['modern-home'], act: 'close on running shoes being laced at dawn, {P} out of frame above the knees', cam: 'detail', snd: 'laces, breath', ost: '' },
        { bg: ['mountains'], act: '{P} runs up a ridge trail at sunrise, a small figure against the light', cam: 'xls', snd: 'steady breathing, wind', ost: 'Tekrar = kimlik.' }] },
    /* ---- gerçek suç (kurgu) ---- */
    { f: 'truecrime', tr: 'Çalınan Fikir Dosyası', t: 'darknight', w: 'rain', g: 'noir', log: 'Kurgusal, mizahi bir kara film dosyası: bir girişim fikri çalındı. {P} iz süren dedektif.',
      hook: 'İlk kare: masada "DOSYA 017" yazan bir klasör.', shots: [
        { bg: ['noir', 'crime'], act: '{P} opens a thick case file under a desk lamp, smoke curling in the light', cam: 'high34', snd: 'rain, a typewriter far away', ost: 'Dosya 017' },
        { bg: ['noir', 'urban'], act: '{P} crouches on a wet street, picking up a crumpled sticky note with a pen', cam: 'low', snd: 'rain, distant siren', ost: '' },
        { bg: ['crime', 'modern-work'], act: '{P} pins the note to a wall of photos and red string, steps back', cam: 'track', snd: 'pin pressed into cork', ost: '' },
        { bg: ['noir'], act: '{P} looks straight past the lens and closes the file', cam: 'eye', snd: 'file slaps shut', ost: 'Fikir geri döndü.' }] },
    { f: 'truecrime', tr: 'Gece Treni', t: 'moonnight', g: 'neonoir', log: 'Kurgusal bir gece treni gizemi: kayıp bir çanta, üç vagon, bir ipucu. {P} soruşturmayı yürüten kişi.',
      hook: 'İlk kare: boş bir vagonda sallanan tutamaklar.', shots: [
        { bg: ['transport', 'vehicles'], act: '{P} walks slowly down an empty night train carriage, handles swaying', cam: 'sym', snd: 'rails clattering', ost: '03:12' },
        { bg: ['transport', 'vehicles'], act: '{P} kneels and finds a ticket stub under a seat', cam: 'detail', snd: 'paper rustle', ost: '' },
        { bg: ['transport', 'urban'], act: '{P} steps off onto a foggy platform, holding the ticket up to the light', cam: 'tele', snd: 'brakes hissing', ost: 'Son durak.' }] },
    { f: 'truecrime', tr: 'Boş Kasa', t: 'darknight', log: 'Kurgusal bir soygun sonrası: kasa boş, ama bir not bırakılmış. {P} sahneyi inceleyen müfettiş.',
      hook: 'İlk kare: aralık duran dev bir kasa kapısı.', shots: [
        { bg: ['crime', 'modernarch'], act: 'a huge round vault door stands ajar; {P} walks in with a flashlight', cam: 'frame', snd: 'heavy metal echo', ost: '' },
        { bg: ['crime'], act: '{P} sweeps the flashlight across empty steel shelves', cam: 'track', snd: 'flashlight click', ost: 'Kasa: boş.' },
        { bg: ['crime'], act: '{P} picks up a single folded note from the floor and reads it, one eyebrow rising', cam: 'detail', snd: 'paper unfolding', ost: '"Asıl hazine fikirdi."' }] },
    /* ---- açıklayıcı ---- */
    { f: 'explainer', tr: '3 Adımda Ajans', log: '{P} üç odadan geçiyor: her oda bir adım. Açıklayıcı ve hızlı.',
      hook: 'Ekranda büyük bir "1".', shots: [
        { bg: ['modern-home'], act: '{P} sits at a kitchen table with a laptop, counting on one finger toward camera', cam: 'eye', snd: 'a pop sound', ost: '1 · Beceri' },
        { bg: ['modern-work'], act: '{P} walks into a small office with two desks, holding up two fingers', cam: 'track', snd: 'pop', ost: '2 · İlk müşteri' },
        { bg: ['modernarch', 'modern-work'], act: '{P} walks into a large glass office full of light, three fingers raised', cam: 'est', snd: 'pop, rising synth', ost: '3 · Sistem' }] },
    { f: 'explainer', tr: 'Zaman Paradan Değerli', g: 'kodak', log: 'Dev dişlilerin içinde yürüyen {P}, zamanın nasıl harcandığını görsel bir makineyle anlatıyor.',
      hook: 'İlk kare: dönen dev bir pirinç dişli.', shots: [
        { bg: ['steampunk', 'industrial'], act: '{P} walks between enormous turning brass gears, small against them', cam: 'worm', snd: 'deep ticking', ost: '24 saat' },
        { bg: ['steampunk'], act: '{P} stops a small gear with one hand and the whole machine slows', cam: 'detail', snd: 'grinding slow-down', ost: '' },
        { bg: ['steampunk', 'historic'], act: '{P} looks up at a giant clock face, sunlight through it', cam: 'low', snd: 'one loud tick', ost: 'Nereye gidiyor?' }] },
    { f: 'explainer', tr: 'Bileşik Faiz Kartopu', t: 'morning', log: 'Dağdan yuvarlanan küçük bir kartopu her karede büyüyor. {P} yanında yürüyerek bileşik büyümeyi anlatıyor.',
      hook: 'İlk kare: avuç içinde küçük bir kartopu.', shots: [
        { bg: ['polar', 'mountains'], act: '{P} holds a small snowball in an open palm on a snowy slope', cam: 'detail', snd: 'crunching snow', ost: '%1' },
        { bg: ['polar', 'mountains'], act: '{P} sets the snowball rolling and walks beside it as it grows to knee height', cam: 'track', snd: 'snow rumble', ost: '' },
        { bg: ['polar', 'mountains'], act: '{P} stands small beside a snowball now as tall as a house', cam: 'est', snd: 'deep rumble stops', ost: '10 yıl sonra' }] },
    { f: 'explainer', tr: 'Odak Nasıl Çalışır', log: 'Beynin içinde bir yolculuk: dağınık ışıklar tek bir ışına dönüşüyor. {P} rehber.',
      hook: 'İlk kare: binlerce dağınık ışık noktası.', shots: [
        { bg: ['abstract', 'micro'], act: 'thousands of drifting points of light scatter in darkness', cam: 'est', snd: 'many soft chimes', ost: 'Dikkat dağınık.' },
        { bg: ['abstract'], act: '{P} stands in the dark and raises one hand; the points begin to align', cam: 'low', snd: 'chimes merge', ost: '' },
        { bg: ['abstract'], act: 'a single bright beam forms in front of {P}, lighting the face', cam: 'eye', snd: 'one clear tone', ost: 'Odak: tek ışın.' }] },
    /* ---- müzik klibi ---- */
    { f: 'music', tr: 'Gece Sürüşü', t: 'darknight', g: 'neon', log: 'Synthwave tadında bir gece sürüşü: neon şehir, boş otoyol, sabaha karşı sahil.',
      hook: 'İlk kare: ön camda kayan neon ışıklar.', shots: [
        { bg: ['vehicles', 'cyber'], act: '{P} drives at night, neon lights sliding across the face', cam: 'window', snd: 'synth bass line', ost: '' },
        { bg: ['roads'], act: 'an empty highway at night, tail lights streaking, {P} standing beside the car', cam: 'tele', snd: 'synth arpeggio', ost: '' },
        { bg: ['coast'], act: '{P} sits on the car bonnet facing the sea at dawn', cam: 'silhouette', snd: 'track fades into waves', ost: '' }] },
    { f: 'music', tr: 'Çöl Ritmi', t: 'golden', w: 'clear', log: 'Kum tepelerinde bir ritim: {P} ritme göre yürüyor, rüzgâr kumu dalgalandırıyor.',
      hook: 'İlk kare: kumda bir ayak izi, davul vuruşu.', shots: [
        { bg: ['desert'], act: '{P} walks along a dune ridge in rhythm, each step lifting sand', cam: 'track', snd: 'drum on each step', ost: '' },
        { bg: ['desert', 'africa'], act: '{P} spins once, coat flaring, sand spraying in the low sun', cam: 'orbit', snd: 'drum fill', ost: '' },
        { bg: ['desert'], act: '{P} stops at the top of the dune, chest rising, sun behind', cam: 'silhouette', snd: 'beat drops out, wind', ost: '' }] },
    { f: 'music', tr: 'Çatı Konseri', t: 'sunset', log: 'Şehrin en yüksek çatısında tek kişilik bir konser. Dinleyici: bütün şehir.',
      hook: 'İlk kare: çatı kenarında bir mikrofon standı.', shots: [
        { bg: ['modern-city', 'urban'], act: '{P} walks to a microphone stand at a rooftop edge at sunset', cam: 'track', snd: 'city ambience, guitar intro', ost: '' },
        { bg: ['modern-city', 'urban'], act: '{P} sings with eyes closed, the skyline glowing behind', cam: 'orbit', snd: 'vocal and guitar', ost: '' },
        { bg: ['modern-city'], act: 'wide over the city as lights switch on block by block below {P}', cam: 'drone', snd: 'chorus swells', ost: '' }] },
    { f: 'music', tr: 'Yağmurda Yavaş Çekim', t: 'darknight', w: 'rain', log: 'Neon yağmurun içinde yavaş bir ballad: {P} ıslak sokakta tek başına.',
      hook: 'İlk kare: su birikintisinde neon yansıması.', shots: [
        { bg: ['cyber', 'urban'], act: 'a neon sign reflected in a puddle, a footstep breaking it; {P} walks on', cam: 'puddle', snd: 'piano, rain', ost: '' },
        { bg: ['cyber', 'urban'], act: '{P} stands still in the rain, face up, eyes closed', cam: 'low', snd: 'piano swells', ost: '' },
        { bg: ['cyber', 'urban'], act: '{P} walks away under the neon, the street empty', cam: 'sym', snd: 'last piano note', ost: '' }] },
    /* ---- aksiyon / koreografi (silahsız, yaralanmasız) ---- */
    { f: 'fight', tr: 'Çatı Kovalamacası', t: 'afternoon', log: 'Silahsız bir parkur kovalamacası: {P} çatılar arasında koşuyor, atlıyor, sonunda gülerek duruyor.',
      hook: 'İlk kare: çatı kenarından atlayan bir siluet.', shots: [
        { bg: ['urban', 'modern-city'], act: '{P} sprints across a rooftop and vaults over a low wall', cam: 'track', snd: 'fast footsteps, breath', ost: '' },
        { bg: ['urban', 'southasia', 'latam'], act: '{P} leaps a narrow gap between two roofs, coat flying', cam: 'worm', snd: 'wind rush, a landing thud', ost: '' },
        { bg: ['urban'], act: '{P} rolls out of the landing and slides down a sloped roof', cam: 'orbit', snd: 'tiles scraping', ost: '' },
        { bg: ['urban', 'modern-city'], act: '{P} stops at the last edge, breathing hard, and laughs', cam: 'low', snd: 'heartbeat, city below', ost: 'Durmak yok.' }] },
    { f: 'fight', tr: 'Antrenman Montajı', g: 'war', log: 'Bir boks salonunda sabahın erken saatleri: kum torbası, ip, ter. Rakip yok, sadece disiplin.',
      hook: 'İlk kare: kum torbasına ilk yumruk ve toz.', shots: [
        { bg: ['arena', 'modern-leisure'], act: '{P} hits a heavy bag, dust shaking from it into a shaft of light', cam: 'detail', snd: 'thud, chain rattle', ost: '05:30' },
        { bg: ['arena', 'modern-leisure'], act: '{P} skips rope fast, the rope a blur', cam: 'low', snd: 'rope whipping', ost: '' },
        { bg: ['arena'], act: '{P} shadowboxes in an empty ring, footwork sharp', cam: 'orbit', snd: 'shoes squeaking, breath', ost: '' },
        { bg: ['arena'], act: '{P} leans on the ropes, sweat dripping, and nods once', cam: 'eye', snd: 'silence, one breath', ost: 'Rakip: dünkü sen.' }] },
    { f: 'fight', tr: 'Çöken Salon', w: 'fog', log: 'Çöken eski bir salonda {P} düşen molozlardan sıyrılıp çıkışa ulaşıyor. Kimse yaralanmıyor, sadece refleks.',
      hook: 'İlk kare: tavandan dökülen toz.', shots: [
        { bg: ['disaster', 'industrial'], act: 'dust pours from a cracking ceiling; {P} looks up and starts running', cam: 'worm', snd: 'deep groan of stone', ost: '' },
        { bg: ['disaster', 'industrial'], act: '{P} sidesteps as a beam crashes down beside, dust exploding outward', cam: 'track', snd: 'crash, debris', ost: '' },
        { bg: ['disaster', 'urban'], act: '{P} dives through the doorway into daylight as the hall settles behind', cam: 'frame', snd: 'rumble fading, birds', ost: '' }] },
    { f: 'fight', tr: 'Gölgeyle Düello', t: 'sunset', g: 'epic', log: 'Bir tapınak avlusunda {P} kendi gölgesiyle dövüşüyor. Gölge bir adım önde, sonunda selamlaşıyorlar.',
      hook: 'İlk kare: duvarda hareket eden bir gölge, figür kıpırdamıyor.', shots: [
        { bg: ['eastasia', 'sacred'], act: '{P} stands still in a temple courtyard while the long shadow on the wall moves first', cam: 'est', snd: 'wind chimes', ost: '' },
        { bg: ['eastasia', 'sacred'], act: '{P} mirrors the shadow in a fast sequence of blocks and kicks, robe flaring', cam: 'orbit', snd: 'cloth snapping', ost: '' },
        { bg: ['eastasia'], act: '{P} and the shadow bow to each other at the same moment', cam: 'sym', snd: 'one gong', ost: 'En zor rakip.' }] },
    /* ---- ürün lansmanı ---- */
    { f: 'launch', tr: 'Siyah Kutu', log: 'Boş bir stüdyoda podyum üzerinde siyah bir kutu. {P} kapağı kaldırıyor, ışık bütün seti dolduruyor.',
      hook: 'İlk kare: spot altında kapalı siyah kutu.', shots: [
        { bg: ['ad-podium'], act: 'a matte black box sits on a white podium under one spotlight', cam: 'prodfront', snd: 'low hum', ost: 'Yakında.' },
        { bg: ['ad-podium', 'ad-surreal'], act: '{P} walks into frame and rests one hand on the lid', cam: 'prod34', snd: 'footsteps on concrete', ost: '' },
        { bg: ['ad-surreal', 'ad-luxury'], act: '{P} lifts the lid and warm light floods the set', cam: 'prodhero', snd: 'a bright rising tone', ost: 'Şimdi.' }] },
    { f: 'launch', tr: 'Bir Dokunuşla', log: 'Bir uygulama dokunuşu dünyayı değiştiriyor: {P} ekrana dokunuyor, oda başka bir mekâna dönüşüyor.',
      hook: 'İlk kare: ekrana yaklaşan bir parmak.', shots: [
        { bg: ['modern-home', 'modern-work'], act: '{P} taps a phone screen once, looking at it with interest', cam: 'detail', snd: 'a soft tap', ost: '' },
        { bg: ['coast', 'mountains', 'modern-city'], act: '{P} now stands in a wide landscape holding the same phone, same pose', cam: 'eye', snd: 'a whoosh, ambience', ost: 'Tek dokunuş.' },
        { bg: ['ad-tech', 'ad-podium'], act: 'the phone rests on a podium in a clean studio, {P} out of focus behind', cam: 'macro', snd: 'a chime', ost: '' }] },
    { f: 'launch', tr: 'Lansman Sahnesi', log: 'Dev bir sahnede lansman: karanlık, tek spot, {P} ve arkasında yükselen bir ekran.',
      hook: 'İlk kare: karanlık bir salonda tek bir spot.', shots: [
        { bg: ['arena', 'filmset'], act: '{P} walks to the centre of a huge dark stage into one spotlight', cam: 'est', snd: 'audience murmur fades', ost: '' },
        { bg: ['arena', 'filmset'], act: '{P} clicks a small remote; a giant screen behind lights up white', cam: 'low', snd: 'a deep boom', ost: '' },
        { bg: ['arena'], act: '{P} looks out at the audience off screen and smiles', cam: 'reverse', snd: 'applause swells', ost: 'Tanıştırayım.' }] },
    /* ---- seyahat ---- */
    { f: 'travel', tr: 'Bir Günde Dört Kıta', log: 'Aynı sırt çantası, aynı adım, dört kıta: {P} her kesimde başka bir yerde yürüyor.',
      hook: 'İlk kare: yere konan bir sırt çantası.', shots: [
        { bg: ['southasia'], act: '{P} walks through a quiet morning street of an Asian old town, backpack on', cam: 'track', snd: 'street ambience', ost: 'Asya' },
        { bg: ['africa'], act: '{P} walks on a red dirt road at golden hour, same stride', cam: 'track', snd: 'wind, birds', ost: 'Afrika' },
        { bg: ['latam'], act: '{P} walks through a colourful colonial street, same stride', cam: 'track', snd: 'distant music', ost: 'Amerika' },
        { bg: ['historic', 'greco'], act: '{P} stops on old stone steps, sets the backpack down and looks back', cam: 'eye', snd: 'church bells', ost: 'Avrupa' }] },
    { f: 'travel', tr: 'Kapadokya Şafağı', t: 'morning', w: 'clear', g: 'pastel', log: 'Peri bacaları ve sıcak hava balonları arasında bir şafak. {P} bir tepede güneşi karşılıyor.',
      hook: 'İlk kare: yükselen ilk balon.', shots: [
        { bg: ['anatolia'], act: '{P} climbs a rocky hill at dawn, hot air balloons rising in the distance', cam: 'xls', snd: 'burner whoosh far away', ost: '' },
        { bg: ['anatolia'], act: '{P} sits on the edge of the rock, wrapped in a scarf, watching', cam: 'silhouette', snd: 'wind, birds', ost: '' },
        { bg: ['anatolia', 'villages'], act: '{P} walks down a stone village lane, sunlight spilling across', cam: 'track', snd: 'a rooster, footsteps', ost: 'Kapadokya' }] },
    { f: 'travel', tr: 'Kuzey Işıkları Altında', t: 'moonnight', log: 'Buz gibi bir gecede yeşil perdeler gökyüzünü dolduruyor. {P} donmuş bir gölün ortasında.',
      hook: 'İlk kare: gökyüzünde açılan yeşil bir perde.', shots: [
        { bg: ['polar'], act: '{P} walks onto a frozen lake under green aurora curtains, breath visible', cam: 'est', snd: 'ice creaking, silence', ost: '' },
        { bg: ['polar'], act: '{P} lies on the ice looking up, arms spread', cam: 'bird', snd: 'soft wind', ost: '' },
        { bg: ['polar', 'mountains'], act: '{P} sits by a small cabin, hands around a hot cup, aurora above', cam: 'silhouette', snd: 'fire crackle', ost: '' }] },
    { f: 'travel', tr: 'Eski Şehir Sokakları', t: 'afternoon', log: 'Taş sokaklar, çamaşır ipleri, kapı aralıkları: {P} kaybolmanın keyfini çıkarıyor.',
      hook: 'İlk kare: dar bir sokakta havalanan güvercinler.', shots: [
        { bg: ['historic', 'villages'], act: 'pigeons lift off a narrow stone lane as {P} walks through', cam: 'low', snd: 'wings flapping', ost: '' },
        { bg: ['historic', 'southasia', 'latam'], act: '{P} buys fruit from a small window, smiling', cam: 'eye', snd: 'chatter', ost: '' },
        { bg: ['historic', 'villages'], act: '{P} climbs steep steps toward a view of rooftops', cam: 'worm', snd: 'distant bells', ost: 'Kaybol.' }] },
    /* ---- korku / gerilim ---- */
    { f: 'horror', tr: 'Boş Otel', t: 'darknight', g: 'horror', log: '{P} terk edilmiş bir otelde bir gece geçiriyor. Koridorun ucunda ışıklar tek tek sönüyor.',
      hook: 'İlk kare: kendi kendine açılan bir otel kapısı.', shots: [
        { bg: ['residential', 'horror'], act: '{P} walks into a dusty hotel lobby holding a flashlight', cam: 'frame', snd: 'creaking floor', ost: '' },
        { bg: ['horror', 'residential'], act: 'lights go out one by one down a long corridor toward {P}', cam: 'sym', snd: 'clicks getting closer', ost: '' },
        { bg: ['horror', 'residential'], act: '{P} turns slowly to look behind; the corridor is empty', cam: 'eye', snd: 'silence, one breath', ost: 'Oda 237?' }] },
    { f: 'horror', tr: 'Sis Köyü', w: 'fog', t: 'overcast', g: 'horror', log: 'Haritada olmayan bir köy, yoğun sis, boş evler. {P} çıkış yolunu arıyor.',
      hook: 'İlk kare: sisin içinde sallanan bir salıncak.', shots: [
        { bg: ['villages', 'horror'], act: '{P} walks into a village swallowed by fog, an empty swing moving', cam: 'tele', snd: 'chains creaking', ost: '' },
        { bg: ['villages', 'horror'], act: '{P} looks through a dark window of an abandoned house', cam: 'window', snd: 'wind through gaps', ost: '' },
        { bg: ['villages', 'forest'], act: '{P} runs along a fog-filled road toward a faint light', cam: 'track', snd: 'footsteps, heartbeat', ost: '' }] },
    { f: 'horror', tr: 'Asansör', t: 'darknight', log: 'Gece yarısı boş bir plazada asansör hiç durmuyor. {P} kat düğmelerine bakıyor: 13.',
      hook: 'İlk kare: yanıp sönen bir asansör ışığı.', shots: [
        { bg: ['modern-work', 'modernarch'], act: '{P} steps into a lift in an empty office tower at night', cam: 'sym', snd: 'lift hum', ost: '' },
        { bg: ['modern-work'], act: 'the floor display climbs past the top floor; {P} watches it, still', cam: 'detail', snd: 'a ding, then another', ost: '13' },
        { bg: ['modern-work', 'horror'], act: 'the doors open on a dark empty floor; {P} does not step out', cam: 'pov', snd: 'silence', ost: '' }] },
    /* ---- önce / sonra ---- */
    { f: 'transform', tr: 'Sıfırdan Zirveye', log: 'Aynı hareket, iki zaman: {P} küçük bir odada ve yıllar sonra cam bir kulede aynı masaya oturuyor.',
      hook: 'İlk kare: tek ampullü küçük bir oda.', shots: [
        { bg: ['modern-home', 'residential'], act: '{P} sits down at a small cluttered desk under a single bulb', cam: 'eye', snd: 'chair creak', ost: 'Önce' },
        { bg: ['modernarch', 'modern-work'], act: '{P} sits down at a clean desk in a glass tower, same pose, same framing', cam: 'eye', snd: 'quiet hum', ost: 'Sonra' },
        { bg: ['modern-city'], act: '{P} looks out over the city from the tower window', cam: 'window', snd: 'wind on glass', ost: '' }] },
    { f: 'transform', tr: 'Kaos ve Düzen', log: 'Dağınık bir masa tek bir el hareketiyle düzene giriyor. Ardından bütün oda.',
      hook: 'İlk kare: kâğıt yığınları ve soğuk kahveler.', shots: [
        { bg: ['modern-home', 'modern-work'], act: 'a desk buried under papers and cups; {P} looks at it, sighs', cam: 'flatlay', snd: 'paper rustle', ost: 'Önce' },
        { bg: ['modern-home', 'modern-work'], act: '{P} sweeps a hand across; every item snaps into neat rows', cam: 'flatlay', snd: 'a satisfying click', ost: '' },
        { bg: ['modern-home', 'modern-work'], act: '{P} sits at the perfectly ordered desk in calm morning light', cam: 'eye', snd: 'birds outside', ost: 'Sonra' }] },
    { f: 'transform', tr: 'Dönen Kostüm', log: '{P} her dönüşte başka bir çağın kıyafetine bürünüyor: şövalye, kaptan, astronot, sonra yine kendisi.',
      hook: 'İlk kare: dönmeye başlayan bir figür.', shots: [
        { bg: ['medievallife', 'siege'], act: '{P} spins once and lands facing camera in a medieval setting, cloak settling', cam: 'eye', snd: 'whoosh, cloth', ost: '' },
        { bg: ['pirates', 'coast'], act: '{P} spins again and lands on a ship deck, same pose, same framing', cam: 'eye', snd: 'whoosh, waves', ost: '' },
        { bg: ['starship', 'space'], act: '{P} spins again and lands on a starship bridge, same pose', cam: 'eye', snd: 'whoosh, hum', ost: '' },
        { bg: ['filmset'], act: '{P} lands back on an empty film set in everyday clothes and grins', cam: 'eye', snd: 'whoosh, silence', ost: 'Tek kişi, her rol.' }] },
    { f: 'transform', tr: 'Harabeden Şehre', g: 'eterna', log: 'Bir kıyamet sonrası harabesi, {P}’in her adımında yeşil ve güneş enerjili bir şehre dönüşüyor.',
      hook: 'İlk kare: toz ve kırık camlar.', shots: [
        { bg: ['postapoc'], act: '{P} walks through a dusty ruined street, broken glass underfoot', cam: 'track', snd: 'wind, glass crunch', ost: 'Önce' },
        { bg: ['postapoc', 'solarpunk'], act: 'green vines spread up the walls around {P} with each step', cam: 'orbit', snd: 'growing rustle', ost: '' },
        { bg: ['solarpunk'], act: '{P} stands in a bright green city of solar gardens, smiling', cam: 'est', snd: 'birds, water', ost: 'Sonra' }] },
    /* ---- podcast ---- */
    { f: 'podcast', tr: 'Tek Soru', log: 'Podcast stüdyosunda tek bir soru soruluyor; cevap verirken arka plan cevabın görseline dönüşüyor.',
      hook: 'Ekranda soru: "Her şeyi kaybetsen ilk ne yaparsın?"', shots: [
        { bg: ['modern-work', 'filmset'], act: '{P} leans into a broadcast microphone, listening to a question off screen', cam: 'eye', snd: 'room tone, a chair creak', ost: 'Her şeyi kaybetsen?' },
        { bg: ['modern-work', 'filmset'], act: '{P} answers, one hand open, eyes steady', cam: 'detail', snd: 'voice, muffled', ost: '' },
        { bg: ['mountains', 'roads'], act: '{P} walks alone on an open road at dawn in the same clothes', cam: 'xls', snd: 'voice continues over wind', ost: '"Yürümeye başlarım."' }] },
    { f: 'podcast', tr: 'Gece Yarısı Bölümü', t: 'darknight', g: 'neonoir', log: 'Gece yarısı kaydedilen dürüst bir bölüm: kırmızı "ON AIR" ışığı, tek lamba, {P}.',
      hook: 'İlk kare: yanan bir "ON AIR" ışığı.', shots: [
        { bg: ['modern-work', 'modern-home'], act: 'a red on-air light switches on in a dark studio; {P} adjusts the headphones', cam: 'detail', snd: 'a click, a hum', ost: '' },
        { bg: ['modern-work', 'modern-home'], act: '{P} speaks quietly into the microphone, face lit by a single warm lamp', cam: 'eye', snd: 'soft voice, rain outside', ost: '' },
        { bg: ['modern-city'], act: 'the city at night seen through the studio window, {P} a reflection on the glass', cam: 'window', snd: 'voice fades', ost: '' }] },
    { f: 'podcast', tr: 'Boş Sandalye', log: 'Masada iki mikrofon, biri boş. {P} boş sandalyeye, yani "beş yıl önceki kendine" konuşuyor.',
      hook: 'İlk kare: boş bir sandalyeye dönük mikrofon.', shots: [
        { bg: ['modern-work', 'filmset'], act: 'two microphones on a table, one chair empty; {P} sits in the other', cam: 'sym', snd: 'room tone', ost: '5 yıl önceki sen' },
        { bg: ['modern-work', 'filmset'], act: '{P} speaks to the empty chair, leaning forward', cam: 'reverse', snd: 'voice, muffled', ost: '' },
        { bg: ['modern-work', 'filmset'], act: '{P} sits back and nods at the empty chair as if it answered', cam: 'eye', snd: 'silence', ost: 'Devam et.' }] }
  );

  /* yükleme anında doğrulama: bilinmeyen grup / kamera / ışık kimlikleri temizlenir (ör. eski 'dunes', 'tunnel') */
  (function sanitize() {
    const groups = new Set(CB.GROUPS.map((g) => g.id));
    const cams = new Set(CB.CAMERAS.map((x) => x.id));
    const times = new Set(CB.TIMES.ext.map((x) => x.id));
    const weath = new Set(CB.WEATHER.ext.map((x) => x.id));
    const CAM_FIX = { tunnel: 'sym' };
    CB.CONCEPTS.forEach((k) => {
      if (k.t && !times.has(k.t)) delete k.t;
      if (k.w && !weath.has(k.w)) delete k.w;
      if (k.g && !CB.GRADES[k.g]) delete k.g;
      k.shots.forEach((sh) => {
        sh.bg = sh.bg.filter((g) => groups.has(g));
        if (!cams.has(sh.cam)) sh.cam = CAM_FIX[sh.cam] || 'eye';
      });
    });
    CB.WORLDS.forEach((w) => { w.bg = w.bg.filter((g) => groups.has(g)); if (w.grade && !CB.GRADES[w.grade]) w.grade = 'natural'; });
    CB.ARCHETYPES.forEach((a) => { a.bg = a.bg.filter((g) => groups.has(g)); });
  })();
})();
