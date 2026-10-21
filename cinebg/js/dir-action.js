/* CineBG Studio — Yönetmen Masası: Dövüş / Aksiyon (GODSTOUCH + Cinema Studio 4 paneli).
   Kurallar godstouch-camera-director skill'inden: dört yasa (müzik yok, kahraman planı yok, kimlik, fizik),
   nedenli kamera doktrini, olay bütçesi (8 sn: 2–3, 15 sn: 3–4), blok sırası SHOT → CONSISTENCY,
   küresel kilit manifestosu + beat içi kilitler, CS4 panel sırası. PROMPT ve LOCK satırları kaynaktan aynen. */
(function () {
  const CB = window.CB;
  if (!CB || !CB.DIR) return;
  const U = CB.UI;
  const { el } = U;
  const put = (n, ...kids) => n.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));

  const BAN = 'Do not generate music, score, songs, instruments, drones, swelling or rising tones, sub-bass builds, dialogue, voices, narration or subtitles of any kind.';

  /* ---------- hareket kütüphanesi (camera-moves.md, scene-playbook.md §2, powers-and-films.md §7) ----------
     kind: lead = ana hareket, react = nedenli tepki (whip / ramp / insert), both = ikisi de olabilir; ramp: hız rampası */
  const FAM = {
    base: 'Temel (Bible sözlüğü)', mcu: 'Marvel / MCU', snyder: 'DCU / Snyder', wick: 'John Wick (gun-fu)', bat: 'Batman (Nolan / Reeves)',
    mk: 'Mortal Kombat', tf: 'Transformers (mecha)', pow: 'Süper güç arketipleri',
  };
  const M = [
    ['sideTrack', 'base', 'lead', 'Yan takip (arka-sol 1.5 m)', 'default fight follow', 'camera outpaced by the sprint, drifting rear-left and re-finding late', '{camera=handheld; pos=rear_left_1.5m;}'],
    ['lockOff', 'base', 'lead', 'Nefes alan sabit kadraj', 'tension before eruption, aftermath', 'breath beat, near-still, camera micro-drifts rear-left', '{camera=lock_off; micro_drift=on;}'],
    ['arc', 'mcu', 'lead', 'Çatışma etrafında yörünge', 'team-up brawls, a duel you want to feel "in the round", reveal of a second attacker mid-arc', 'camera arcs left around the locked pair, dragged by their spin, framing stays outside the overlap', '{camera=arc; radius=2m; cause=pivot_of_grapple; keep=outside_overlap; speed=match_subject; orbit_clean=0; hero_angle=0;}', { orbit: 1 }],
    ['whipHand', 'mcu', 'react', 'Whip-pan devri', 'many attackers, fast exchanges, tying separate hits into one continuous feel', 'offscreen crack snaps the camera right to the next attacker, blur trails, re-finds a beat late', '{camera=whip_pan; trigger=offscreen_impact; blur=on; reacquire=late; cut_count=0; stabilizer=0;}'],
    ['rampContact', 'mcu', 'react', 'Temasta hız rampası', 'the single "money" blow in an exchange; a catch, a block-break, a landing', 'time holds real, ramps to quarter-speed on the fist landing, snaps back as the body folds', '{speed_ramp=on; slow_window=contact_only; ramp=real>0.25x>real; hero_freeze=0;}', { ramp: 1 }],
    ['crashPush', 'mcu', 'both', 'Ani itme (crash push-in)', 'pre-impact tension, a villain\'s turn, a power charging up', 'camera lunges in on the cocked fist, pushed by the wind-up, holds tight through contact', '{camera=crash_push; cause=windup_pull; end=on_contact; snap_zoom=ok; hold=tight;}'],
    ['fakeOner', 'mcu', 'lead', 'Sahte tek plan (dikişli uzun çekim)', 'corridor clears, one-vs-many, showing stamina and geography without cutting away', 'unbroken follow down the corridor, camera bodychecked and re-steadied at each takedown, no visible cut', '{camera=fake_oner; move=continuous_follow; cuts=hidden; jostle=on; shot_count=1; motion=continuous;}'],
    ['heroRise', 'mcu', 'hero', 'Kahraman alçak açı yükselişi [YASAK]', 'AVOID under L2', 'AVOID — replace with an end-mid-motion beat at shoulder height, no upward triumph', '{hero_angle=0; low_hero_rise=0; three_point_landing=0; victory_freeze=0; end=mid_motion;}'],
    ['extremeRamp', 'snyder', 'react', 'Aşırı hız rampası (hızlı–yavaş–hızlı)', 'impacts you want mythic, a leap, a hammer-down, debris blooming', 'charge at full speed, collapse to slow-mo as the hammer meets the jaw, rip back to real on the recoil', '{speed_ramp=extreme; profile=fast>slow>fast; anchor=impact_frame; music=0;}', { ramp: 1 }],
    ['crashZoom', 'snyder', 'react', 'Crash zoom + sarsıntı', 'big single blows, ground-shaking landings, power discharges', 'camera snap-zooms onto the point of impact and shudders from the shock, dust jumping off the lens', '{camera=crash_zoom; shudder=on; cause=impact_shock; settle=late; hero_angle=0;}'],
    ['godsEye', 'snyder', 'lead', 'Tanrı gözü tepeden', 'establishing a melee\'s geography, a slam, a fallen body, scale of a crowd', 'locked overhead straight down, fighters read as shapes on the ground, slow drift only', '{camera=top_down; angle=90deg; move=slow_drift; framing=graphic; subject_read=silhouette;}'],
    ['slowOrbPush', 'snyder', 'lead', 'Yavaş yörüngesel itme', 'pre-fight tension, two powers sizing up, a threat approaching', 'camera creeps in and eases around them as they square up, breath held, before the first move', '{camera=slow_push+orbit; speed=crawl; cause=rising_tension; end=on_first_strike;}'],
    ['wideFollow', 'wick', 'lead', 'Tam boy geniş takip', 'any skilled-combat scene where the choreography IS the point; martial arts, gun-fu', 'wide follow keeps both fighters full-body in frame, gliding with them, never cutting in tight', '{camera=wide_follow; framing=full_body; move=steadicam_track; cut_in=0; readable=1;}', { glide: 1 }],
    ['roomClear', 'wick', 'lead', 'Kesintisiz oda temizliği', 'one-vs-many, a house/club clear, showing stamina and spatial control', 'single take flows with the shooter room to room, pivoting to each threat, reload in frame, no cut', '{camera=oner; move=flow_follow; shot_count=1; reload_visible=1; cut_count=0;}'],
    ['overheadSweep', 'wick', 'lead', 'Tepeden süpürme', 'vertical spaces, a descent, mapping a crowded room', 'camera sweeps directly above the stairwell, following the descent, muzzle-flash blooming below', '{camera=overhead_sweep; angle=top_down; move=track_descent; light=muzzle_flash;}'],
    ['weaponInsert', 'wick', 'react', 'Silah mekanizması insert', 'punctuation — the mechanical beat that resets tension between exchanges', 'snap to a tight insert on the mag-swap and slide-rack, then pull back out to the wide as he re-engages', '{camera=tight_insert; subject=weapon_only; duration=short; return=to_wide; identity_face=hold;}'],
    ['whipThreats', 'wick', 'react', 'İki tehdit arası whip-pan', 'two-front danger, a pivot-and-shoot, a sudden new attacker', 'camera whips with the turn of his aim to the second doorway, re-finds the new threat late', '{camera=whip_pan; cause=aim_redirect; reacquire=late; front_cross=0;}'],
    ['strobe', 'bat', 'lead', 'Namlu ışığı strobe dövüşü', 'dark-room dread, a stealth predator reveal, horror-tinged action', 'darkness, then each muzzle-flash reveals one more man down and the silhouette closer, black between beats', '{light=muzzle_flash_only; reveal=strobe; base_state=near_black; silhouette=on; identity=hold_on_flash;}'],
    ['victimPov', 'bat', 'lead', 'Kurban POV yakın kaos', 'fear as the point; a predator you barely see; a target being dismantled', 'tight jittery handheld from the goon\'s eyeline, half-glimpses of the attacker, hits land off-frame', '{camera=tight_handheld; pov=victim; legibility=low; glimpse=on; music=0;}'],
    ['lunge', 'bat', 'lead', 'Karanlıktan siluet atılışı', 'entrances, ambushes, first strike from cover', 'a black shape drops into frame from the dark, contact before any feature reads, then gone again', '{entrance=from_black; reveal=delayed; contact_first=1; face_read=late;}'],
    ['overShoulder', 'bat', 'lead', 'Omuz üstü boğuşma tuzağı', 'close grapples where you want intimacy without averaging two bodies into one', 'camera rides tight over the near shoulder, the second man framed clear beyond the arm, air kept between them', '{camera=over_shoulder; keep=outside_overlap; separation=on; body_merge=0; limb_fusion=0;}'],
    ['profile', 'mk', 'lead', 'Yandan 2.5D profil takibi', 'one-vs-one duels, a clear back-and-forth exchange, weapon duels', 'camera holds a flat side-on profile, tracking laterally along the fight line, both fighters full and separate', '{camera=side_profile; move=lateral_track; axis=fight_line; framing=full_body; separation=on;}'],
    ['xray', 'mk', 'both', 'Darbe ramı (X-ray kamerası)', 'the signature finishing blow, a bone-crunch, a decisive counter', 'camera rams to a hyper-close impact on the strike, shockwave through the body, then snaps back to the arena', '{camera=impact_ram; scale=hyper_close; window=single_blow; gore=0_unless_asked; return=to_wide;}'],
    ['finisherPush', 'mk', 'lead', 'Bitiriş sabit / yavaş itme', 'the kill blow, a fatality-style beat, the end of a duel', 'camera plants and pushes slow onto the finisher, everything else drops away, ending mid-motion', '{camera=slow_push; base=locked; subject=finisher; end=mid_motion; hero_freeze=0;}'],
    ['arenaWide', 'mk', 'lead', 'Arena kuruluş planı', 'scene opens; geography and stakes, before committing to close work', 'wide establishes the arena and both fighters\' ground, cold light, before the first exchange', '{camera=establishing_wide; show=arena+positions; move=slow_settle; palette=cold;}'],
    ['whipSnap', 'mk', 'react', 'İmza harekete whip + snap-zoom', 'a special move, an elemental attack, a named technique landing', 'camera whips onto the outstretched hand and snap-zooms as the ice erupts, wake trailing late', '{camera=whip+snap_zoom; trigger=signature_move; reacquire=late; hero_angle=0;}'],
    ['groundScale', 'tf', 'lead', 'Yer seviyesi ölçek kanıtı', 'selling size — the ONLY reliable way to prove a mech is massive', 'camera at street level, a car and running people in foreground, the two mechs slam together far above', '{camera=ground_level; height=human_eye; scale_ref=foreground_humans_cars; hero_angle=0; measured_scale=1;}'],
    ['orbitMech', 'tf', 'lead', 'Mecha çatışması etrafında yörünge', 'the centrepiece grapple, two mechs locked, showing mass from all sides', 'camera sweeps a low wide circle around the locked mechs, debris streaking past, dragged by their turn', '{camera=orbit; radius=large; height=low; cause=mech_pivot; debris=on; keep=outside_overlap;}', { orbit: 1 }],
    ['craneRise', 'tf', 'lead', 'Boy açılışı için vinç yükselişi (nedenli)', 'the first reveal of a mech\'s full scale — motivated by the event, not a hero pose', 'camera cranes up the body as the mech rises, dragged by the motion, full height filling out against the sky', '{camera=crane_rise; cause=mech_stands; reveal=full_height; motivated=1; hero_pose=0;}'],
    ['slowmoTransform', 'tf', 'react', 'Dönüşüm / enkaz ağır çekim', 'a transform beat, a wall/building destruction, a heavy landing', 'slow-mo as the panels fold and lock into the new form, concrete dust blooming a beat after impact', '{speed_ramp=on; window=transform_or_impact; debris=delayed; one_way_damage=1;}', { ramp: 1 }],
    ['whipThrown', 'tf', 'react', 'Fırlatılan gövdeye whip-pan', 'a throw, a knockback, a body sent through a building', 'camera whips to track the flung mech across the street and into the tower, wake and dust trailing late', '{camera=whip_track; subject=thrown_mech; impact=structure; debris=late; reacquire=late;}'],
    ['mechShoulder', 'tf', 'lead', 'İki mecha omuz üstü tuzak', 'close mech grapples, where morph/merge risk is highest', 'camera rides over the near mech\'s shoulder plate, the enemy framed clear past the arm, air kept between them', '{camera=over_shoulder; scale=mech; keep=outside_overlap; body_merge=0; silhouette=distinct;}'],
    ['sonicBoom', 'pow', 'lead', 'Ses duvarı kalkışı', 'the instant of takeoff / a flying charge — prove momentum and the shock it leaves', 'camera plants low as he drops into a crouch, then he rips up and past frame, shockwave ring blasting dust, wake buffeting the lens late', '{camera=flyby_hold; base=low_plant; subject_rips_past=1; shockwave=ring; wake=late; hero_angle=0;}'],
    ['speedIntercept', 'pow', 'react', 'Süper hız müdahalesi', 'the catch, the save, the last-instant block', 'whip-pan across the gap as he blurs in, ramp to slow the instant he catches her, snap back on the settle', '{camera=whip_pan+ramp; window=catch_only; blur=streak; reacquire=late;}', { ramp: 1 }],
    ['superPunch', 'pow', 'both', 'Şehir ölçekli süper yumruk', 'the decisive blow; city-scale impact', 'real speed into the swing, ram hyper-close on contact, the body fires through the wall, concrete collapse a full beat later', '{camera=impact_ram; scale=hyper_close; structural_damage=delayed; one_way=1; end=mid_motion;}'],
    ['heatVision', 'pow', 'lead', 'Isı bakışı (tutulan ışın)', 'a power-up stare, a beam exchange', 'slow push on the eyes as the glow builds, locked and steady, the beam\'s heat warping the air it crosses — no upward hero tilt', '{camera=slow_push; base=locked; subject=eyes; hero_angle=0; light=beam_bloom;}'],
    ['ricochet', 'pow', 'lead', 'Kalkan seken yol', 'a thrown-shield combo, clearing several enemies in one arc', 'camera whips along the shield\'s bounce path wall-to-man-to-man, each clang snapping it to the next hit, then back as it returns to his arm', '{camera=follow_projectile; path=ricochet; trigger=each_clang; return=to_hand; reacquire=late;}'],
    ['redirect', 'pow', 'lead', 'Momentum çevirme (dar alan)', 'confined brutal close combat; a many-on-one in a small space', 'over-shoulder in the cramped space, air kept between bodies, camera jostled by each redirect, strike-and-separate, never a held grapple', '{camera=over_shoulder; space=confined; keep=outside_overlap; body_merge=0; jostle=on;}'],
    ['yank', 'pow', 'lead', 'Kanca ipi çekişi', 'a pick-off, a vertical exit, snatching a target off their feet', 'the line fires, camera yanked hard after it as he\'s ripped up out of the light into black, the goon dragged screaming after', '{camera=yank_follow; cause=grapple_line; exit=into_black; reacquire=none;}', { vocal: 'one short scream from the dragged man' }],
    ['pickOff', 'pow', 'lead', 'Karanlıktan avlama', 'predator horror — the fear of the hunted, not the hunter', 'camera stays on the frightened cluster, a shape takes the man at the edge, darkness swallows him, the others spin to nothing', '{camera=hold_on_victims; subject=fear; predator=offscreen; light=near_black; music=0;}'],
  ];
  const MOVES = {};
  M.forEach(([id, fam, kind, tr, when, prompt, lock, x]) => { MOVES[id] = Object.assign({ id, fam, kind, tr, when, prompt, lock }, x || {}); });

  /* ---------- sahne × kamera matrisi (§3) + CS4 dövüş ön ayarları (cs4-panel.md §7) ---------- */
  const P = (genre, cam, lens, mm, f, tempo, light) => ({ genre, cam, lens, mm, f, tempo, light: light || '—' });
  /* olay metinleri: {A} {B} değişmez karakter belirteçleri; money = paralı vuruş; kind: impact / move / reveal / mech */
  const SCEN = {
    duel: {
      tr: 'Bire bir düello', en: 'an unarmed duel', lead: ['profile', 'sideTrack'], alt: ['overShoulder', 'arc', 'wideFollow'], react: ['rampContact', 'xray'],
      p: P('General', '35mm Film', 'Clean Sharp', '35mm', 'f/4', 'Single Shot'), emo: [['Anger', 2], ['Anger', 1]], cast: 2,
      ev: [
        { t: '{A} bursts in with a straight right' },
        { t: '{B} slips outside the punch and drives a hook into the ribs of {A}', money: 1, after: 'dust shaken off {A} blooms a beat after contact' },
        { t: '{A} is knocked two steps back along the fight line' },
        { t: '{A} plants and swings back; {B} steps out of range, air kept between them', end: 'the shot ends mid-motion with the swing still travelling' },
      ],
      damage: '{A} keeps favouring the ribs after the hit — the damage stays', sfx: 'shoes scuffing the ground, the snap of clothing, one dull thud as the hook lands, a sharp exhale',
      gap: 'two metres of air between them', hands: ['fists up', 'hands loose'],
    },
    many: {
      tr: 'Bire karşı çok', en: 'one fighter against a group of attackers', lead: ['fakeOner', 'roomClear'], alt: ['sideTrack', 'overShoulder', 'godsEye', 'redirect'], react: ['whipHand'],
      p: P('Action', '35mm Film', 'Clean Sharp', '14mm', 'f/4', 'Single Shot'), emo: [['Anger', 2], ['Fear', 2]], cast: 4, crowd: 1,
      ev: [
        { t: 'the first attacker rushes {A}; {A} checks him with a forearm and shoves him into the wall', after: 'plaster dust drops from the wall a beat after the body hits it' },
        { t: 'a second attacker lunges from the right; {A} turns his momentum and he drops past camera', whip: 1 },
        { t: '{A} drives a short elbow through the guard of the third attacker', money: 1 },
        { t: '{A} turns toward the doorway as the next attacker steps in', end: 'the shot ends mid-motion, {A} still turning' },
      ],
      damage: 'the first attacker stays down against the wall; {A} is breathing harder with every exchange', sfx: 'feet skidding, bodies hitting the wall, cloth tearing, short exhales',
      gap: 'the attackers spread around {A} at arm\'s length plus a step', hands: ['hands up, open', 'fists'],
    },
    grapple: {
      tr: 'Boğuşma / yakın mesafe', en: 'a close-quarters grapple', lead: ['overShoulder'], alt: ['arc', 'redirect'], react: ['xray', 'weaponInsert'],
      p: P('Action', '35mm Film', 'Clean Sharp', '35mm', 'f/4', 'Single Shot'), emo: [['Anger', 2], ['Fear', 1]], cast: 2,
      ev: [
        { t: '{B} clinches {A} around the waist, heads apart, air kept between their faces' },
        { t: '{A} frames a forearm across the collarbone of {B} and breaks the grip with a knee to the thigh', money: 1 },
        { t: '{B} stumbles back, the clinch broken — strike-and-separate', after: 'grit kicked up by the stumble settles a beat later' },
        { t: '{B} drives back in low; {A} pivots off the line and both bodies separate and clear', end: 'the shot ends mid-motion with {A} still turning' },
      ],
      damage: '{B} keeps the weight off the struck leg until the end', sfx: 'heavy breathing, fabric straining, a knee thudding into muscle, feet sliding',
      gap: 'one step of air between them', hands: ['guard high', 'arms reaching'],
    },
    chase: {
      tr: 'Kovalamaca', en: 'a foot chase', lead: ['sideTrack'], alt: ['fakeOner'], react: ['rampContact', 'whipHand'],
      p: P('Action', '35mm Film', 'Anamorphic', '14mm', 'f/4', 'Single Shot'), emo: [['Fear', 2], ['Anger', 2]], cast: 2,
      ev: [
        { t: '{A} sprints through the location, {B} two strides behind' },
        { t: '{A} vaults a waist-high obstacle, clearing it by a hand\'s width', money: 1, near: 1 },
        { t: '{B} clips the obstacle and stumbles, catching the ground with one hand', after: 'the knocked obstacle clatters down a beat later' },
        { t: '{A} cuts left out of the sight line of {B}', end: 'still running as the shot ends mid-motion' },
      ],
      damage: 'the obstacle {B} clipped stays knocked over', sfx: 'pounding footsteps, ragged breathing, the obstacle clattering, cloth flapping',
      gap: 'two strides between them', hands: ['arms pumping', 'arms pumping'],
    },
    gun: {
      tr: 'Karanlık oda çatışması', en: 'a dark-room firefight, hits landing off-frame', lead: ['strobe', 'roomClear'], alt: ['fakeOner', 'sideTrack', 'overShoulder', 'overheadSweep'], react: ['whipThreats', 'weaponInsert'],
      p: P('Noir', '35mm Film', 'Vintage Anamorphic', '35mm', 'f/4', 'Single Shot', 'Practicals'), emo: [['Anger', 1], ['Fear', 2]], cast: 2, dark: 1,
      ev: [
        { t: 'near-black; the first muzzle flash from the far doorway reveals {A} already moving along the wall', money: 1 },
        { t: 'the answering flashes from {A} light the room in strobes; between flashes {B} is driven back behind the door frame, every hit landing off-frame', after: 'splinters from the door frame fall a beat after each flash' },
        { t: '{A} swaps the magazine in frame — magazine out, magazine in, slide back, slide forward', insert: 1 },
        { t: '{A} pivots toward the second doorway and advances into the dark', whip: 1, end: 'still moving as the shot ends mid-motion' },
      ],
      damage: 'the splintered door frame stays splintered', sfx: 'sharp gunshots, brass casings ringing on the floor, a magazine clicking home, footsteps',
      gap: 'the length of the room between them', hands: ['a sidearm held low in both hands', 'a sidearm'],
    },
    power: {
      tr: 'Güç / darbe anı', en: 'a single superpower impact beat', lead: ['groundScale', 'crashPush', 'sonicBoom', 'heatVision'], alt: ['sideTrack', 'profile'], react: ['rampContact', 'xray', 'whipSnap', 'superPunch', 'crashZoom'],
      p: P('Action', '35mm Film', 'Anamorphic', '35mm', 'f/4', 'Single Shot'), emo: [['Anger', 3], ['Fear', 2]], cast: 2,
      ev: [
        { t: '{A} drops the weight into the stance, the charge gathering visibly in both hands, the air around them starting to warp' },
        { t: '{A} releases the strike into the raised guard of {B}', money: 1 },
        { t: 'a shockwave ring blasts dust outward across the ground; {B} skids back three metres, heels carving the surface', after: 'the ground cracks open a beat later' },
        { t: '{A} is already stepping forward through the falling dust', end: 'the shot ends mid-motion' },
      ],
      damage: 'the cracked ground and the carved heel marks stay', sfx: 'a deep thunderclap of impact, dust hissing, grit raining down, heavy breathing',
      gap: 'four metres between them', hands: ['hands drawn back at the hip', 'forearms crossed in a guard'],
    },
    entrance: {
      tr: 'Giriş / açılış', en: 'an entrance out of the dark', lead: ['lunge', 'strobe', 'craneRise'], alt: ['groundScale', 'arc', 'godsEye'], react: ['rampContact', 'whipHand'],
      p: P('Action', '35mm Film', 'Anamorphic', '35mm', 'f/4', 'Single Shot', 'Practicals'), emo: [['Trust', 1], ['Fear', 3]], cast: 2, dark: 1,
      ev: [
        { t: 'the location is near-black; only {B} is visible, scanning the dark' },
        { t: 'a black shape drops into frame from the dark and takes {B} down — contact before any feature reads', money: 1 },
        { t: '{B} hits the ground and slides out of the bottom of frame', after: 'dust lifts off the ground a beat later' },
        { t: '{A} straightens and steps through the haze toward frame-left, the face reading late', end: 'still moving as the shot ends mid-motion' },
      ],
      damage: '{B} stays down out of frame', sfx: 'a rush of cloth, one heavy impact, a body sliding on the ground, slow footsteps',
      gap: '{A} hidden in the dark three metres behind {B}', hands: ['hands empty', 'a flashlight'],
    },
    mech: {
      tr: 'Mecha / kaiju çarpışması', en: 'a clash between two giant mechs', lead: ['groundScale', 'orbitMech'], alt: ['mechShoulder', 'godsEye', 'craneRise'], react: ['whipThrown', 'slowmoTransform'],
      p: P('Epic', '35mm Film', 'Anamorphic', '14mm', 'f/11', 'Single Shot'), emo: [['Anger', 2], ['Fear', 3]], cast: 2, mech: 1,
      ev: [
        { t: 'in the foreground a car brakes hard and people run past at ground level; far above, {A} charges {B} across the open ground' },
        { t: '{A} slams its shoulder into the chest plate of {B}', money: 1 },
        { t: '{B} is flung across the ground into the nearest building', whip: 1, after: 'glass and concrete dust burst out of the building a beat after impact' },
        { t: '{A} pivots toward the building, the foreground people still running', end: 'the shot ends mid-motion' },
      ],
      damage: 'the broken building facade stays broken', sfx: 'metal groaning, a colossal impact, glass raining, car alarms, running footsteps',
      gap: 'a city block between them', hands: ['heavy fists clenched', 'long arms spread'],
    },
    finisher: {
      tr: 'Bitiriş vuruşu', en: 'the finishing blow of a fight', lead: ['finisherPush'], alt: ['profile', 'godsEye'], react: ['rampContact', 'xray'],
      p: P('Drama', '35mm Film', 'Vintage Anamorphic', '50mm', 'f/4', 'Calm', 'Soft Cross'), emo: [['Sadness', 2], ['Fear', 2]], cast: 2,
      ev: [
        { t: '{B} staggers in, guard low, favouring the earlier damage' },
        { t: '{A} sets both feet and drives the finishing strike into the guard of {B}', money: 1 },
        { t: '{B} folds and drops out of the bottom of frame', after: 'dust settles a beat late' },
        { t: '{A} is still travelling through the follow-through, breath heavy', end: 'the shot ends mid-motion' },
      ],
      damage: 'the earlier damage on both stays visible', sfx: 'ragged breathing, a single heavy impact, a body hitting the ground, grit settling',
      gap: 'one long step between them', hands: ['fists', 'guard low'],
    },
    aftermath: {
      tr: 'Sonrası (aftermath)', en: 'the aftermath of a fight', lead: ['sideTrack', 'lockOff'], alt: ['fakeOner', 'groundScale', 'godsEye', 'strobe'], react: [],
      p: P('Drama', '35mm Film', 'Vintage Anamorphic', '35mm', 'f/4', 'Calm', 'Window'), emo: [['Sadness', 2], ['Trust', 1]], cast: 2,
      ev: [
        { t: 'dust is still settling over the wreckage; {A} walks through it slowly, favouring one leg' },
        { t: '{A} kneels beside {B}, who sits against the broken wall, both breathing hard' },
        { t: 'a loose panel finally drops from above', money: 1, soft: 1, after: 'its dust drifts down a beat later' },
        { t: '{A} offers a hand and {B} takes it and starts to rise', end: 'the shot ends mid-breath, mid-motion' },
      ],
      damage: 'all wreckage from the fight stays as it is; nothing is repaired', sfx: 'settling debris, slow footsteps on rubble, heavy breathing, distant wind',
      gap: 'a few metres of rubble between them', hands: ['hands empty', 'one arm hugging the ribs'],
    },
  };

  const PANEL = {
    genre: ['General', 'Action', 'Epic', 'Drama', 'Comedy', 'Horror', 'Noir'],
    cam: ['Modern', '35mm Film', '8mm Film', 'DV Camcorder'],
    lens: ['Clean Sharp', 'Anamorphic', 'Vintage Anamorphic', 'Warm Vintage', 'Halation Vintage'],
    mm: ['8mm', '14mm', '35mm', '50mm', '75mm'],
    f: ['f/1.4', 'f/4', 'f/11'],
    tempo: ['Single Shot', 'Calm', 'Dynamic', 'Chaotic'],
    light: ['—', 'Contre-jour', 'Soft Cross', 'Practicals', 'Window', 'Overhead Fall', 'Silhouette'],
    era: ['—', '60s', '80s', '90s', '2000s', '2020s'],
    palette: ['Cold Steel tarzı', 'Film Colors', 'Nostalgic Blue', 'Black Gloss', 'Candy Pink', 'Panelden seç (50+)'],
    emo: ['Hope', 'Anger', 'Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust'],
  };
  const MM_TR = { '8mm': 'aşırı geniş, dünya kadrajda', '14mm': 'geniş ama kontrollü — aksiyon, kovalamaca', '35mm': 'doğal göz — güvenli varsayılan', '50mm': 'samimi, özne ayrışır', '75mm': 'sıkıştırılmış, yakın plan' };
  const DEF_TOK = { duel: ['the grey-coated brawler', 'the red-hooded fighter'], mech: ['the grey heavy-frame mech', 'the red long-armed mech'] };

  /* ---------- karakter belirteçleri ---------- */
  const archOf = (c) => CB.ARCHETYPES && (CB.ARCHETYPES.find((a) => a.id === c.arch) || CB.ARCHETYPES[0]);
  const noun = (c) => (c.gender === 'woman' ? 'woman' : c.gender === 'man' ? 'man' : 'person');
  function wardrobeOf(c) { const a = archOf(c); return a ? a.wardrobe[c.wardrobe % a.wardrobe.length] : ''; }
  function tokenOf(c) {
    const w = wardrobeOf(c).replace(/^an? /, '').split(/,| over | with /)[0].trim();
    return w ? `the ${noun(c)} in the ${w}` : `the ${noun(c)}`;
  }

  /* ---------- durum ---------- */
  const DEF = { scen: 'duel', lead: '', r1: '', r2: '', dur: 8, events: 3, ratio: '21:9', mode: 'cs4', look: 'live-action, 35mm film', first: 'plate', loc: '', charA: '', charB: '', tokA: '', tokB: '', crowd: 3, framing: 'full', p: null, emoA: null, emoB: null, era: '—', palette: 'Cold Steel tarzı' };
  let S = Object.assign({}, DEF, U.store.get('dirAction', {}));
  const save = () => U.store.set('dirAction', S);
  function scen() { return SCEN[S.scen] || SCEN.duel; }
  function ensure() {
    const sc = scen();
    if (!S.p) S.p = Object.assign({}, sc.p);
    if (!S.lead || !MOVES[S.lead]) S.lead = sc.lead[0];
    if (!S.emoA) S.emoA = sc.emo[0].slice();
    if (!S.emoB) S.emoB = sc.emo[1].slice();
    const max = S.dur > 8 ? 4 : 3, min = S.dur > 8 ? 3 : 2;
    S.events = Math.max(min, Math.min(max, +S.events || max));
  }
  function applyScenario(id) {
    const sc = SCEN[id]; S.scen = id; S.p = Object.assign({}, sc.p); S.lead = sc.lead[0];
    S.r1 = sc.react[0] || ''; S.r2 = ''; S.emoA = sc.emo[0].slice(); S.emoB = sc.emo[1].slice();
  }

  function castInfo(ctx) {
    const chars = ctx.chars();
    const find = (id) => chars.find((c) => c.id === id);
    const sc = scen();
    const def = DEF_TOK[S.scen] || DEF_TOK.duel;
    const one = (id, tok, i) => {
      const c = sc.mech ? null : find(id);
      const t = (tok || '').trim() || (c ? tokenOf(c) : def[i]);
      return { c, tok: t, wear: c ? wardrobeOf(c) : '', ref: c && c.kind === 'reference' };
    };
    return { A: one(S.charA, S.tokA, 0), B: one(S.charB, S.tokB, 1) };
  }

  /* ---------- prompt üretimi ---------- */
  const fill = (t, A, B) => t.replace(/\{A\}/g, A).replace(/\{B\}/g, B);
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const lockPairs = (lock) => lock.replace(/[{}]/g, '').split(';').map((x) => x.trim()).filter(Boolean).map((x) => x.split('=').map((y) => y.trim()));
  const cluster = (pairs) => '{' + pairs.map(([k, v]) => `${k}=${v}`).join('; ') + ';}';
  const r1 = (x) => Math.round(x * 2) / 2;
  const fmt = (x) => x.toFixed(1) + 's';

  function locationOf(ctx) {
    const cur = ctx.cur() || {};
    const s = cur.spec;
    if (S.loc.trim()) return { text: S.loc.trim(), light: '', weather: '', floor: 'the ground' };
    if (!s) return { text: 'an empty concrete parking level at night', light: 'one cold fluorescent tube overhead', weather: '', floor: 'bare concrete floor' };
    return { text: CB.locText(s.cat), light: s.time.en, weather: s.weather ? s.weather.en : '', floor: s.floor ? (s.floor.en || s.floor) : 'the ground', center: s.landmarks && s.landmarks.center, ctx: s.ctx };
  }

  function build(ctx) {
    ensure();
    const sc = scen(), lead = MOVES[S.lead];
    const { A, B } = castInfo(ctx);
    const loc = locationOf(ctx);
    const single = S.p.tempo === 'Single Shot' || S.p.tempo === 'Calm';
    const reacts = [S.r1, S.r2].filter((x, i, a) => x && MOVES[x] && a.indexOf(x) === i && x !== S.lead).map((x) => MOVES[x]);
    const assumptions = [];
    if (!ctx.chars().length && !sc.mech) assumptions.push('kayıtlı karakter yok, varsayılan belirteçler kullanıldı');
    if (!(ctx.cur() || {}).spec && !S.loc.trim()) assumptions.push('arka plan sahnesi yok, örnek mekân kullanıldı');

    /* olay seçimi: paralı vuruş ve son olay her zaman kalır */
    let evs = sc.ev.slice();
    while (evs.length > S.events) {
      const k = evs.findIndex((e, i) => !e.money && !e.end && i > 0);
      evs.splice(k < 0 ? 1 : k, 1);
    }
    /* tepkileri olaylara bağla */
    const att = evs.map(() => []);
    const moneyI = Math.max(0, evs.findIndex((e) => e.money));
    reacts.forEach((m) => {
      let i = moneyI;
      if (/whip/.test(m.lock) && !m.ramp) { i = evs.findIndex((e) => e.whip); if (i < 0) i = evs.findIndex((e, j) => j !== moneyI && !att[j].length); }
      if (/tight_insert/.test(m.lock)) { i = evs.findIndex((e) => e.insert); if (i < 0) i = Math.max(0, evs.length - 2); }
      if (i < 0) i = moneyI;
      att[i].push(m);
    });

    /* zaman çizelgesi: nefes beati + olaylar, paralı vuruşa daha çok süre */
    const D = S.dur;
    const breath = D > 8 ? 1.5 : 1.0;
    const w = evs.map((e) => (e.money ? 1.5 : 1));
    const tot = w.reduce((a, b) => a + b, 0);
    let t = breath; const ranges = [[0, breath]];
    evs.forEach((e, i) => { const e1 = i === evs.length - 1 ? D : r1(t + (D - breath) * w[i] / tot); ranges.push([t, e1]); t = e1; });

    /* küresel manifesto: lead + değişmezler; çakışan anahtarlar beat içine */
    const glob = new Map();
    const inlineLead = [];
    const reactCams = reacts.some((m) => lockPairs(m.lock).some(([k]) => k === 'camera'));
    lockPairs(lead.lock).forEach(([k, v]) => {
      if ((k === 'camera' && reactCams) || k === 'end' && v !== 'mid_motion') inlineLead.push([k, v]);
      else glob.set(k, v);
    });
    const twoBodies = sc.cast >= 2;
    const inv = [];
    if (twoBodies) inv.push(['separation', 'on'], ['keep', 'outside_overlap'], ['body_merge', '0'], ['limb_fusion', '0']);
    inv.push(['hero_angle', '0'], ['hero_freeze', '0'], ['end', 'mid_motion'], ['one_way_damage', '1'], ['music', '0']);
    if (single) inv.push(['shot_count', '1'], ['cut_count', '0']);
    if (/gun|power|finisher/.test(S.scen)) inv.push(['gore', '0_unless_asked']);
    inv.forEach(([k, v]) => { if (!glob.has(k)) glob.set(k, v); });
    /* eşanlamlıları tek yazıma indir */
    if (glob.has('one_way')) glob.delete('one_way');
    if (glob.has('slow_window')) glob.delete('slow_window');
    const syn = (pairs) => pairs.map(([k, v]) => [k === 'slow_window' ? 'window' : k === 'one_way' ? 'one_way_damage' : k === 'base_state' ? 'base' : k, k === 'slow_window' ? 'contact' : k === 'debris' && v === 'delayed' ? 'late' : v]);
    const globPairs = syn([...glob.entries()]);

    /* SHOT */
    const AT = A.tok, BT = B.tok;
    const who = sc.mech ? `${AT} and ${BT}` : sc.crowd ? `${AT} against ${S.crowd} attackers` : `${AT} and ${BT}`;
    const lines = [];
    lines.push('SHOT');
    lines.push(`${D}-second ${single ? 'single continuous take' : 'clip'}, ${S.ratio}. ${cap(sc.en)}; location: ${loc.text}. ${cap(who)}; the camera ${lead.prompt.replace(/^camera /, '')}.` + (S.mode === 'raw' ? ` Look: ${S.look}, ${S.p.lens.toLowerCase()} lens character, ${S.p.mm} focal length.` : ''));
    lines.push('');

    /* CAST AND FIRST FRAME */
    lines.push('CAST AND FIRST FRAME');
    const first = S.first === 'plate' ? '@Image 1 is the first frame: ' : S.first === 'refs' ? '<<<image_1>>> is the location reference; ' : '';
    const handsA = sc.hands[0], handsB = sc.hands[1];
    const wearA = A.wear ? `, wearing ${A.wear}` : '';
    const wearB = B.wear ? `, wearing ${B.wear}` : '';
    let inventory;
    if (sc.crowd) inventory = `${AT} stands at the centre of the frame${wearA}, ${handsA}; ${S.crowd} attackers in plain dark work clothes spread around ${AT}, ${fill(sc.gap, AT, BT)}`;
    else if (sc.mech) inventory = `${AT} stands far back at the left of the frame, ${handsA}; ${BT} stands at the right of the frame, ${handsB}; ${sc.gap}; a car and a few small people at ground level in the foreground`;
    else inventory = `${AT} stands at the left of the frame${wearA}, ${handsA}; ${BT} stands at the right of the frame${wearB}, ${handsB}; ${fill(sc.gap, AT, BT)}; both full-body`;
    const lightSrc = sc.dark ? 'near-black, the only light comes from flashes and one weak practical far behind' : loc.light ? `${loc.light}` : 'one cold practical light';
    const count = sc.mech ? 'Exactly two mechs exist in this video, plus a few small human figures in the foreground.' : sc.crowd ? `Exactly ${S.crowd + 1} people exist in this video.` : 'Exactly two people exist in this video.';
    lines.push(`${first}${cap(inventory)}; ${loc.floor}${loc.center ? `, ${loc.center} in the background` : ''}; ${lightSrc}.${S.first === 'plate' ? ' Use all of it exactly as shown.' : ''} ${count}`);
    lines.push('');

    /* CAMERA */
    lines.push('CAMERA');
    const camDur = lead.orbit ? (D < 10 ? ` The arc covers no more than 180° and takes the full ${D} seconds.` : ` The arc takes the full ${D} seconds.`) : /crane|push/.test(lead.lock) ? ` The move takes the full ${D} seconds.` : '';
    const glideRule = lead.glide ? ' The glide is caused by following the fighters; legibility is the point.' : ' Every camera move is pushed by their motion; it never glides on its own.';
    const height = sc.mech ? 'Camera height stays at street level' : S.scen === 'aftermath' ? 'Camera height stays at chest level' : 'Camera height stays at chest level';
    lines.push(`${cap(lead.prompt)}.${glideRule} ${height} and the ${S.p.mm} lens stays constant for all ${D} seconds.${camDur}`);
    lines.push('');

    /* BEATS */
    lines.push('BEATS');
    const subjOf = (e) => (/\{B\}/.test(e.t.split(/[;,]/)[0]) && !/\{A\}/.test(e.t.split(/[;,]/)[0]) ? BT : AT);
    const breathTxt = sc.dark ? 'breath beat: near-black, only a breath of movement in the dark' : sc.mech ? 'breath beat: both mechs near-still, servos ticking, weight shifting; the camera micro-drifts with the street' : `breath beat: ${sc.crowd ? `${AT} and the attackers` : 'both'} near-still, chests rising, weight shifting; the camera micro-drifts with the breath`;
    lines.push(`${fmt(ranges[0][0])}–${fmt(ranges[0][1])} — ${breathTxt}.`);
    lines.push(cluster([['micro_drift', 'on'], ...inlineLead]));
    evs.forEach((e, i) => {
      const [s0, s1] = ranges[i + 1];
      const parts = [cap(fill(e.t, AT, BT))];
      const keys = [];
      const ms = att[i];
      if (ms.length) {
        ms.forEach((m) => { parts.push(m.prompt); keys.push(...syn(lockPairs(m.lock)).filter(([k]) => !globPairs.some(([g, gv]) => g === k))); });
      } else if (!e.money || e.soft) {
        if (lead.glide) parts.push('the wide follow keeps everyone full-body, gliding with the motion');
        else if (/lock_off|slow_push|top_down|hold_on_victims|establishing_wide/.test(lead.lock)) parts.push('the camera holds its position, nudged only by the motion in frame');
        else { parts.push(`the camera is outpaced and re-finds ${subjOf(e)} a beat late`); keys.push(['speed', 'real'], ['reacquire', 'late']); }
      } else {
        parts.push(lead.glide ? 'the wide follow holds through the contact' : 'the camera is jolted by the contact and settles late');
        if (!lead.glide) keys.push(['jostle', 'on']);
      }
      if (e.after) { parts.push(fill(e.after, AT, BT)); if (!keys.some(([k]) => k === 'debris')) keys.push(['debris', 'late']); }
      if (e.end) { parts.push(fill(e.end, AT, BT)); keys.push(['end', 'mid_motion']); }
      lines.push(`${fmt(s0)}–${fmt(s1)} — ${parts.join('; ')}.`);
      const uniq = []; keys.forEach((kv) => { if (!uniq.some((u) => u[0] === kv[0])) uniq.push(kv); });
      if (uniq.length) lines.push(cluster(uniq));
    });
    lines.push('');

    /* PHYSICS */
    lines.push('PHYSICS');
    const mass = sc.mech ? 'Both mechs are colossal and heavy; every footfall cracks the asphalt and shakes the parked cars.' : `${sc.crowd ? 'Everyone is' : 'Both are'} heavy and grounded; feet bear the full weight on every step.`;
    lines.push(`${mass} Contact first: nothing cracks, sprays or sounds before contact. Consequence late: dust and debris arrive a beat after. ${sc.mech ? 'Loose cables and armour plates' : 'Loose elements — coats, hair, straps —'} lag every movement and settle late. ${cap(fill(sc.damage, AT, BT))}. Nothing floats or teleports.`);
    lines.push('');

    /* LIGHT */
    lines.push('LIGHT');
    let light;
    if (lead.id === 'strobe' || sc.dark) light = 'Muzzle flashes and one weak practical are the only light; near-black between flashes; hard rim on every silhouette.';
    else if (S.mode === 'cs4' && S.p.light !== '—') light = `${S.p.light} lighting from the panel, motivated by ${loc.light || 'the practical lights in the location'}; cooler metallic tones; hard shadows under ${sc.mech ? 'both mechs' : 'every figure'}.`;
    else light = `One key: ${loc.light || 'a cold practical overhead'}; cooler metallic tones; hard shadows under ${sc.mech ? 'both mechs' : 'every figure'}.`;
    if (loc.weather && !/clear/.test(loc.weather)) light += ` Atmosphere: ${loc.weather}.`;
    lines.push(light);
    lines.push('');

    /* AUDIO */
    lines.push('AUDIO');
    const vocal = [lead, ...reacts].map((m) => m.vocal).filter(Boolean);
    lines.push(`Diegetic only: ${sc.sfx}${loc.weather && /rain|snow|wind|storm|blizzard/.test(loc.weather) ? ', the weather in the location' : ''}.${vocal.length ? ` The one allowed vocal sound: ${vocal[0]}.` : ''} ${BAN}`);
    lines.push('');

    /* LOCK MANIFEST */
    lines.push('LOCK MANIFEST');
    lines.push(cluster(globPairs));
    lines.push('');

    /* CONSISTENCY */
    lines.push('CONSISTENCY');
    const castLine = sc.mech ? `Exactly two mechs: ${AT} and ${BT}. Neither changes shape, color or size.` : sc.crowd ? `Exactly ${S.crowd + 1} people: ${AT} and ${S.crowd} attackers. Nobody changes costume, face or size.` : `Exactly two people: ${AT} and ${BT}. Neither changes costume, face or size.`;
    const lookTail = S.mode === 'raw' ? ` ${cap(S.look)}.` : '';
    lines.push(`${castLine} ${cap(fill(sc.damage, AT, BT))}. ${single ? 'Single take, no cuts.' : 'Cuts only on action.'} Cooler metallic light.${lookTail}`);

    const prompt = lines.join('\n');

    /* CS4 paneli */
    const tagName = (x, L) => (x.c && x.c.name ? x.c.name : `${L} (${x.tok.replace(/^the /, '')})`);
    const panel = [
      `☐ 1 · Genre: ${S.p.genre}`,
      `☐ 2 · Camera: ${S.p.cam}`,
      `☐ 2 · Lens: ${S.p.lens}`,
      `☐ 2 · Focal length: ${S.p.mm} (${MM_TR[S.p.mm] || ''})`,
      `☐ 2 · Aperture: ${S.p.f}`,
      `☐ 2 · Palette: ${S.palette}`,
      `☐ 3 · Tempo: ${S.p.tempo}${single ? ' — prompt tek plan (cut_count=0) ile uyumlu' : ' — prompt kesmeye izin veriyor'}`,
      `☐ Lighting: ${S.p.light}`,
      S.era !== '—' ? `☐ Era: ${S.era}` : null,
      `☐ 4 · Emotion: @${tagName(A, 'A')} → ${S.emoA[0]} (${S.emoA[1]})`,
      sc.crowd ? `☐ 4 · Emotion: saldırganlar → ${S.emoB[0]} (${S.emoB[1]})` : `☐ 4 · Emotion: @${tagName(B, 'B')} → ${S.emoB[0]} (${S.emoB[1]})`,
      `☐ 5 · Prompt: aşağıdaki blok — yalnızca olan biteni anlatır, görünüm panelde.`,
      `Parametreler: ratio ${S.ratio} · duration ${D}s · 24 fps (Seedance sabit)`,
    ].filter(Boolean).join('\n');
    const raw = `ratio ${S.ratio} · duration ${D}s · resolution 720p · generate_audio true`;

    /* sonucu oku */
    const checks = [];
    checks.push(`1. Ana hareket gerçekleşti mi (${lead.tr})? → Olmadıysa CAMERA satırını kaynaktaki PROMPT satırıyla birebir bırak, başka hiçbir şeyi değiştirme ve tekrar gönder.`);
    if (twoBodies) checks.push(`2. Ayrışma ve kimlik: gövdeler birleşti mi, kostümler ve sayı tuttu mu? → Birleşme varsa başlangıç boşluğunu bir metre artır ve temas vuruşunu üst üste binme bölgesinin dışından at; kimlik kaydıysa ilk kare envanterini güçlendir.`);
    const rampM = [lead, ...reacts].find((m) => m.ramp);
    if (rampM) checks.push(`${checks.length + 1}. Ağır çekim yalnızca temas anında mı? → Yayıldıysa CAMERA'ya "only the instant of contact goes slow" cümlesini ekle.`);
    checks.push(`${checks.length + 1}. Enkaz geç mi geldi, plan hareketin ortasında mı bitti? → Poz verip donduysa son beat'in düzyazısına "still travelling as the shot ends" yaz.`);
    const read = checks.slice(0, 4).join('\n');

    return { prompt, panel, raw, read, assumptions, lead, reacts, sc, single, ranges, D, A, B };
  }

  /* ---------- lint (scripts/check_prompt.py'nin JS özeti) ---------- */
  const FRANCHISE = ['Batman', 'Superman', 'Wonder Woman', 'Spider-Man', 'Spiderman', 'Iron Man', 'Thor', 'Hulk', 'The Flash', 'Aquaman', 'Captain America', 'Black Panther', 'Avengers', 'Marvel', 'MCU', 'DCU', 'Transformers', 'Optimus', 'Bumblebee', 'Megatron', 'Mortal Kombat', 'Sub-Zero', 'John Wick', 'Matrix', 'Neo', 'Daredevil', 'Kingsman', 'Snyder', 'Stahelski', 'Nolan', 'Reeves', 'Joker', 'Invincible', 'Spider-Verse', 'Man of Steel', 'Godzilla'];
  const HERO = [/hero shot/i, /heroic/i, /hero angle/i, /low[- ]angle hero/i, /triumphant/i, /three[- ]point landing/i, /superhero landing/i, /victory (pose|freeze)/i, /strikes a pose/i, /power pose/i];
  const NEG = /\b(no|not|never|without|avoid|don't|do not|nothing|zero|kill)\b|=0\b/i;
  function lint(text, secs, tempo) {
    const E = [], W = [];
    const low = text.toLowerCase();
    const sentences = text.replace(/\{[^}]*\}/g, '').split(/[.\n;!?]|—/).filter((s) => s.trim());
    const pos = (re) => sentences.filter((s) => re.test(s) && !NEG.test(s));
    if (!/(no|not generate|never)[^.\n]{0,40}\bmusic\b|music=0/.test(low)) E.push('L1: müzik yasağı yok.');
    else if (!/sub-bass/.test(low)) W.push('L1: "swelling or rising tones, sub-bass builds" yasak listesinde yok.');
    HERO.forEach((re) => pos(re).forEach((s) => E.push('L2: kahraman kadrajı: "' + s.trim().slice(0, 80) + '"')));
    if (!/mid[- ]motion|mid[- ]swing|mid[- ]breath|still (travelling|traveling|moving)/.test(low)) E.push('L2: plan hareketin ortasında bitmiyor.');
    if (!/exactly (one|two|three|four|five|six|\d+)\b/.test(low)) W.push('L3: pozitif oyuncu sayısı yok ("Exactly two people exist…").');
    const names = FRANCHISE.filter((n) => new RegExp('(?<![\\w-])' + n.replace(/[-]/g, '\\-') + '(?![\\w-])').test(text));
    if (names.length) E.push('IP: prompt içinde marka/karakter adı: ' + names.join(', '));
    if (/@image/.test(low) && /<<<image_/.test(low)) E.push('Referans sözdizimi karışık: @Image ve <<<image_N>>> birlikte.');
    if (!/a beat (late|after)|arrives? late|blooms? late|debris=(late|delayed)|a full beat later|settles? late/.test(low)) W.push('L4: geç gelen sonuç (enkaz/toz) yok.');
    const R = [...text.matchAll(/(\d+(?:\.\d+)?)s\s*[–\-—]\s*(\d+(?:\.\d+)?)s/g)].map((m) => [+m[1], +m[2]]);
    if (R.length) {
      if (R[0][0] !== 0) E.push('Zaman: ilk aralık 0.0s ile başlamıyor.');
      for (let i = 1; i < R.length; i++) if (Math.abs(R[i - 1][1] - R[i][0]) > 1e-6) E.push(`Zaman: ${R[i - 1][1]}s ile ${R[i][0]}s arasında boşluk/çakışma.`);
      R.forEach(([a, b]) => { if (b <= a) E.push(`Zaman: ${a}–${b}s boş ya da ters.`); });
      if (secs && Math.abs(R[R.length - 1][1] - secs) > 1e-6) E.push(`Zaman: son aralık ${R[R.length - 1][1]}s'de bitiyor, klip ${secs}s.`);
      const ceil = secs <= 8 ? 5 : secs <= 15 ? 6 : 9;
      if (R.length > ceil) W.push(`Bütçe: ${secs}s içinde ${R.length} beat, tavan ${ceil}.`);
    }
    const slow = (text.match(/speed_ramp=(on|extreme)|whip_pan\+ramp/g) || []).length;
    if (slow > 1) W.push(`Rampa: ${slow} rampa var; yalnızca TEK vuruşu yavaşlat.`);
    if (/wide_follow|steadicam_track/.test(low) && /stabilizer=0|jostle=on/.test(low)) E.push('Kamera: wide_follow kayması stabilizer=0 / jostle=on ile birlikte.');
    if (/\b360\b|full circle|full orbit/.test(low) && secs < 10) W.push(`Kamera: ${secs}s içinde 360° yörünge; 10 sn altında ≤180° planla.`);
    if (/orbit|arcs? (left|right|around)/.test(low) && /close[- ]up on (their|both)|tight on (their|both) faces|faces fill/.test(low)) E.push('Anti-kombo: yörünge + sıkı yüz kadrajı.');
    if (!/\b(pushed|dragged|yanked|outpaced|snaps?|bodychecked|jostled|shudders?|knocked|whips? with|re-finds?|caused|cause=)\b/.test(low)) W.push('Kamera: fiziksel neden bulunamadı; etkiyi değil nedeni yaz.');
    const man = (text.split('LOCK MANIFEST')[1] || '').split('\n\n')[0];
    const gk = {};
    [...man.matchAll(/(\w+)=([^;}\s]+)/g)].forEach(([, k, v]) => { if (gk[k] && gk[k] !== v) E.push(`Kilit: manifesto ${k}=${gk[k]} ve ${k}=${v} birlikte.`); gk[k] = gk[k] || v; });
    if (gk.legibility === 'low' && gk.readable === '1') E.push('Kilit: legibility=low ile readable=1 çelişiyor.');
    if (gk.camera) {
      const bc = new Set([...text.split('LOCK MANIFEST')[0].matchAll(/camera=([^;}\s]+)/g)].map((m) => m[1]).filter((v) => v !== gk.camera));
      if (bc.size) W.push(`Kilit: küresel camera=${gk.camera} ama beat'ler ${[...bc].join(', ')} kullanıyor.`);
    }
    if ([['window', 'slow_window'], ['one_way_damage', 'one_way'], ['base', 'base_state']].some(([a, b]) => new RegExp('\\b' + a + '=').test(text) && new RegExp('\\b' + b + '=').test(text))) W.push('Kilit: eşanlamlı anahtarlar birlikte (tek yazım seç).');
    const noCut = /cut_count=0|shot_count=1|single (continuous )?take|unbroken|oner/.test(low);
    if (tempo && /chaotic|dynamic/i.test(tempo) && noCut) E.push(`Tempo "${tempo}" kesme ekler ama prompt tek plan istiyor; Single Shot seç.`);
    if (tempo === 'Single Shot' && /hard cut|cut to\b/.test(low)) E.push('Tempo "Single Shot" ama prompt kesme istiyor.');
    return { E: [...new Set(E)], W: [...new Set(W)] };
  }

  /* ---------- anti-kombo uyarıları (seçim anında) ---------- */
  function combos(b) {
    const out = [];
    const all = [b.lead, ...b.reacts];
    const ramps = all.filter((m) => m.ramp);
    if (ramps.length > 1) out.push('Birden fazla hız rampası seçildi — klipte tek rampa olmalı (paralı vuruş).');
    if (b.lead.glide && b.reacts.some((m) => /stabilizer=0|jostle=on/.test(m.lock))) out.push('Geniş takip (wide_follow) ile stabilizer=0 / jostle aynı planda olmaz.');
    if (b.lead.orbit && S.framing === 'tight') out.push('Anti-kombo: yörünge + sıkı yüz kadrajı iki yüzü birbirine morflar. Kadrajı tam boy yap.');
    if (b.reacts.length > 2) out.push('En fazla iki nedenli tepki.');
    if (S.scen === 'mech' && b.reacts.length && b.lead.orbit && S.dur <= 8) out.push('Mecha: zemin + yörünge + whip üç vektör — 15 sn ya da üç ayrı çekim olmalı.');
    if (!b.single && S.p.tempo !== 'Single Shot') out.push(`Tempo ${S.p.tempo}: prompt kesmeye izin verir; tek plan istiyorsan Single Shot.`);
    if (b.A.ref || b.B.ref) out.push('Referans kişi: Seedance referanslarında gerçek insan yüzüne izin yok. Kimlik için önce Soul ID ile üretilmiş kareyi @Image 1 ilk kare olarak kullan, prompt kişiyi isimle anmaz.');
    return out;
  }

  /* ---------- arayüz ---------- */
  function moveOptions(kinds, prefer) {
    const groups = {};
    Object.values(MOVES).filter((m) => kinds.includes(m.kind)).forEach((m) => { (groups[m.fam] = groups[m.fam] || []).push(m); });
    const opts = [];
    if (prefer && prefer.length) opts.push(['__pref', '— Bu sahne için önerilen —', prefer]);
    Object.keys(FAM).forEach((f) => groups[f] && opts.push([f, FAM[f], groups[f].map((m) => m.id)]));
    return opts;
  }
  function moveSelect(id, kinds, prefer, cur, onchange, none) {
    const s = el('select', { id });
    if (none) s.append(el('option', { value: '', text: '— yok —' }));
    moveOptions(kinds, prefer).forEach(([k, label, ids]) => {
      const g = el('optgroup', { label });
      ids.forEach((mid) => g.append(el('option', { value: k === '__pref' ? mid : mid, text: MOVES[mid].tr + (k === '__pref' ? ' ●' : '') })));
      s.append(g);
    });
    s.value = cur || '';
    s.addEventListener('change', () => onchange(s.value));
    return s;
  }

  function render(main, ctx) {
    ensure();
    const out = el('div', { class: 'dtool-out' });
    const form = el('div', { class: 'dtool-form' });
    const wrap = el('div', { class: 'dtool' }, form, out);
    main.append(el('div', { class: 'section' },
      el('h3', { text: 'Dövüş / Aksiyon — GODSTOUCH' }),
      el('p', { class: 'hint', text: 'Seedance 2.5 / Cinema Studio 4 için dövüş, kovalamaca, mecha ve süper güç planları. Her kamera hareketinin fiziksel bir nedeni var; müzik yok, kahraman planı yok, kimlik ve fizik kilitli.' })), wrap);

    const re = () => { save(); renderForm(); renderOut(); };
    const reOut = () => { save(); renderOut(); };
    function renderForm() {
      const sc = scen();
      const chars = ctx.chars();
      const charItems = [['', '— varsayılan belirteç —'], ...chars.map((c) => [c.id, `${c.name} · ${(archOf(c) || {}).tr || ''}`])];
      const P2 = (k, items) => U.select('da_' + k, items.map((x) => [x, x]), S.p[k], (v) => { S.p[k] = v; reOut(); });
      const emoSel = (key) => el('div', { class: 'row' },
        U.select('da_' + key + 'e', PANEL.emo.map((x) => [x, x]), S[key][0], (v) => { S[key][0] = v; reOut(); }),
        U.select('da_' + key + 'i', [['1', '1'], ['2', '2'], ['3', '3']], String(S[key][1]), (v) => { S[key][1] = +v; reOut(); }));
      const lead = MOVES[S.lead];
      put(form, 
        U.section('Sahne',
          el('div', { class: 'chips' },
            U.field('Sahne tipi', U.select('da_scen', Object.entries(SCEN).map(([k, v]) => [k, v.tr]), S.scen, (v) => { applyScenario(v); re(); })),
            U.field('Süre', U.select('da_dur', [['8', '8 sn (2–3 olay)'], ['15', '15 sn (3–4 olay)']], String(S.dur), (v) => { S.dur = +v; S.events = S.dur > 8 ? 4 : 3; re(); })),
            U.field('Olay sayısı', U.select('da_ev', (S.dur > 8 ? [3, 4] : [2, 3]).map((n) => [String(n), String(n)]), String(S.events), (v) => { S.events = +v; reOut(); })),
            U.field('Oran', U.select('da_ratio', [['21:9', '21:9'], ['16:9', '16:9'], ['9:16', '9:16'], ['2.39:1', '2.39:1']], S.ratio, (v) => { S.ratio = v; reOut(); })),
            sc.crowd ? U.field('Saldırgan sayısı', U.select('da_crowd', [['2', '2'], ['3', '3'], ['4', '4']], String(S.crowd), (v) => { S.crowd = +v; reOut(); })) : null,
            U.field('Kadraj', U.select('da_frm', [['full', 'Tam boy'], ['medium', 'Bel üstü'], ['tight', 'Sıkı yüz']], S.framing, (v) => { S.framing = v; reOut(); })))),
        U.section('Kamera (nedenli)',
          U.field('Ana hareket ●', moveSelect('da_lead', ['lead', 'both'], sc.lead.concat(sc.alt), S.lead, (v) => { S.lead = v; re(); })),
          el('p', { class: 'note', text: `${FAM[lead.fam]} · NE ZAMAN: ${lead.when}` }),
          el('div', { class: 'chips' },
            U.field('Nedenli tepki 1', moveSelect('da_r1', ['react', 'both'], sc.react, S.r1, (v) => { S.r1 = v; reOut(); }, true)),
            U.field('Nedenli tepki 2', moveSelect('da_r2', ['react', 'both'], sc.react, S.r2, (v) => { S.r2 = v; reOut(); }, true))),
          el('p', { class: 'hint', text: 'Bir ana hareket + en fazla iki nedenli tepki (whip, rampa, insert). Kahraman alçak açısı listede yok: L2 yasası.' })),
        U.section('Oyuncular',
          sc.mech ? el('p', { class: 'hint', text: 'Mecha sahnesinde karakter kaydı kullanılmaz; iki mecha için ayırt edici belirteç yaz.' }) : el('div', { class: 'chips' },
            U.field('A karakteri', U.select('da_ca', charItems, S.charA, (v) => { S.charA = v; reOut(); })),
            U.field(sc.crowd ? 'B (kullanılmaz)' : 'B karakteri', U.select('da_cb', charItems, S.charB, (v) => { S.charB = v; reOut(); }))),
          el('div', { class: 'chips' },
            U.field('A belirteci (isteğe bağlı)', U.input('da_ta', S.tokA, (v) => { S.tokA = v; reOut(); }, (DEF_TOK[S.scen] || DEF_TOK.duel)[0])),
            U.field('B belirteci (isteğe bağlı)', U.input('da_tb', S.tokB, (v) => { S.tokB = v; reOut(); }, (DEF_TOK[S.scen] || DEF_TOK.duel)[1]))),
          el('p', { class: 'hint', text: 'Belirteç her satırda aynı kelimelerle tekrarlanır (L3). İsim, marka ya da gerçek kişi adı yazma.' })),
        U.section('Mekân',
          U.field('Mekân (boşsa arka plan sekmesindeki sahne)', U.input('da_loc', S.loc, (v) => { S.loc = v; reOut(); }, (() => { const l = locationOf({ cur: ctx.cur }); return l.text; })())),
          U.field('İlk kare', U.select('da_first', [['plate', '@Image 1 ilk kare (arka plan plakası)'], ['refs', '<<<image_N>>> referans modu'], ['none', 'Referans yok']], S.first, (v) => { S.first = v; reOut(); }))),
        U.section('Cinema Studio 4 paneli',
          U.field('Mod', U.select('da_mode', [['cs4', 'CS4 paneli'], ['raw', 'Ham Seedance (STYLE satırı)']], S.mode, (v) => { S.mode = v; re(); })),
          el('div', { class: 'chips' },
            U.field('1 · Genre', P2('genre', PANEL.genre)),
            U.field('2 · Camera', P2('cam', PANEL.cam)),
            U.field('2 · Lens', P2('lens', PANEL.lens)),
            U.field('2 · Focal (mm)', P2('mm', PANEL.mm)),
            U.field('2 · Aperture', P2('f', PANEL.f)),
            U.field('2 · Palette', U.select('da_pal', PANEL.palette.map((x) => [x, x]), S.palette, (v) => { S.palette = v; reOut(); })),
            U.field('3 · Tempo', P2('tempo', PANEL.tempo)),
            U.field('Lighting', P2('light', PANEL.light)),
            U.field('Era', U.select('da_era', PANEL.era.map((x) => [x, x]), S.era, (v) => { S.era = v; reOut(); })),
            S.mode === 'raw' ? U.field('Görünüm (STYLE)', U.input('da_look', S.look, (v) => { S.look = v; reOut(); })) : null),
          el('div', { class: 'chips' },
            U.field('4 · Emotion — A', emoSel('emoA')),
            U.field(scen().crowd ? '4 · Emotion — saldırganlar' : '4 · Emotion — B', emoSel('emoB')))),
        el('div', { class: 'row' },
          U.btn('Sahne ön ayarını uygula', () => { applyScenario(S.scen); re(); }),
          U.btn('🎲 Rastgele', () => { randomize(ctx); re(); }, 'primary')));
    }
    function renderOut() {
      const b = build(ctx);
      const L = lint(b.prompt, b.D, S.mode === 'cs4' ? S.p.tempo : null);
      const warn = combos(b);
      const ok = !L.E.length;
      put(out, 
        b.assumptions.length ? el('p', { class: 'note', text: 'Varsayım: ' + b.assumptions.join('; ') + '.' }) : null,
        warn.length ? el('div', { class: 'dwarn' }, ...warn.map((w) => el('p', { text: '⚠ ' + w }))) : null,
        S.mode === 'cs4' ? U.pcard('CS4 paneli', 'kontrol listesi · sırayla', b.panel) : U.pcard('Parametre satırı', 'ham Seedance', b.raw),
        U.pcard('Prompt · GODSTOUCH', `${b.D} sn · ${b.lead.tr}`, b.prompt, 'PROMPT ve LOCK satırları kaynaktan birebir; yalnızca isimler yeniden giydirildi.'),
        el('article', { class: 'pcard dlint ' + (ok ? 'ok' : 'bad') },
          el('header', null, el('strong', { text: 'Kontrol (check_prompt)' }), el('span', { text: ok ? `hata yok · ${L.W.length} uyarı` : `${L.E.length} hata · ${L.W.length} uyarı` })),
          el('ul', null, ...(L.E.length || L.W.length ? [...L.E.map((x) => el('li', { class: 'e', text: 'HATA · ' + x })), ...L.W.map((x) => el('li', { class: 'w', text: 'UYARI · ' + x }))] : [el('li', { class: 'okl', text: 'Dört yasa, zaman aralıkları, kilit manifestosu ve tempo uyumlu.' })]))),
        U.pcard('Sonucu oku', 'üretimden önce planla', b.read, 'Bir hata → tek satır değiştir → tekrar gönder. Gönderim başına 3–4 üretim bekle; Seedance 2.5\'te seed yok.'),
        U.pcard('Moderasyon notu', 'güvenli kurgu', moderation(b)));
    }
    renderForm(); renderOut();
  }

  function moderation(b) {
    const lines = [
      '• Franchise ve kahraman adları yalnızca kamera dilini tarif eder; prompta girmez, karakterler yeniden üretilmez.',
      '• Tanınır benzerlikler Higgsfield "Not eligible" ön kontrolüne takılır; Seedance referanslarında gerçek insan yüzü kullanılmaz.',
      '• Temas vuruşu reddedilirse: teması kadraj dışına al (kurban POV, kadraj dışına inen vuruşlar), kurulumda kes ve sonucu göster ya da vuruşu el–nesne temasına çevir.',
      '• gore=0_unless_asked: kan yalnızca istenirse ve renk adıyla.',
    ];
    if (S.scen === 'gun') lines.push('• Silahlı sahne: "sidearm" ve "muzzle flash" kelimeleriyle yazıldı, vuruşlar kadraj dışında, yara ve kan yok. Ön kontrol yine reddederse çatışmayı strobe ışık + siluet anlatımına indir.');
    if (b.A.ref || b.B.ref) lines.push('• Referans kişi seçili: kimlik yalnızca Soul ID ile üretilmiş ilk kareden gelir, prompt kişiyi isimle anmaz ve yüzünü tarif etmez.');
    return lines.join('\n');
  }

  function randomize(ctx) {
    const keys = Object.keys(SCEN);
    applyScenario(U.pick(keys));
    const sc = scen();
    S.lead = U.pick(sc.lead.concat(sc.alt.slice(0, 1)));
    const reacts = sc.react.filter((id) => !(MOVES[S.lead].glide && /stabilizer=0|jostle=on/.test(MOVES[id].lock)));
    S.r1 = reacts.length ? U.pick(reacts) : '';
    const nonRamp = reacts.filter((id) => id !== S.r1 && !(MOVES[S.r1] && MOVES[S.r1].ramp && MOVES[id].ramp));
    S.r2 = nonRamp.length && Math.random() < 0.4 ? U.pick(nonRamp) : '';
    S.dur = Math.random() < 0.7 ? 8 : 15; S.events = S.dur > 8 ? 4 : 3;
    const ch = ctx.chars();
    if (ch.length) { S.charA = U.pick(ch).id; const rest = ch.filter((c) => c.id !== S.charA); S.charB = rest.length ? U.pick(rest).id : ''; }
    S.tokA = ''; S.tokB = '';
  }

  CB.DIR.register({ id: 'godstouch', tr: 'Dövüş / Aksiyon', sub: 'GODSTOUCH · CS4 paneli', group: 'Aksiyon & Sahne', render });
  CB.GODSTOUCH = { MOVES, SCEN, lint, build: (ctx) => build(ctx || CB.DIR.ctx) };
})();
