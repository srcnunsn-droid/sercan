// EPISODE 01 — "Yanlış Cenaze". TIMING + STAGING DATA ONLY (absolute seconds). The engine reads this.
// Lines are placed from the REAL voice durations (data/ep-01-voice.js); block boundaries 30/60/90/120 never move.
// Key format: [t, partialState, dur=0.35, ease="power2.inOut"]
(function () {
  const M = window.GS.MORGUE;

  // ---------------- dialogue (word for word from the script) ----------------
  const lines = [
    { n: 1, speaker: "idil", start: 8.4, text: "Bir adım daha atarsan ipi çekerim." },
    { n: 2, speaker: "saren", start: 12.2, text: "Çekersen ikimizi de götürürler." },
    { n: 3, speaker: "idil", start: 16.0, text: "Seni getirdiler zaten." },
    { n: 4, speaker: "saren", start: 19.4, text: "Ayakta gelseydim kapını göremezdim." },
    { n: 5, speaker: "idil", start: 37.4, text: "O numarayı kim verdi?" },
    { n: 6, speaker: "saren", start: 39.95, text: "Baran." },
    { n: 7, speaker: "idil", start: 41.2, text: "Kardeşimin mezarını da mı açtınız?" },
    { n: 8, speaker: "saren", start: 44.3, text: "Mezarda değil. Beni sana gönderdi." },
    { n: 9, speaker: "idil", start: 48.0, text: "Yalan söylemeden önce adımı öğrenmişsin." },
    { n: 10, speaker: "saren", start: 51.6, cards: ["Beni dinlemeden de öldürebilirsin.", "Kâğıdı önce defterinle karşılaştır."] },
    { n: 11, speaker: "idil", start: 64.4, text: "Ölüm haberini dört yıl önce aldım." },
    { n: 12, speaker: "saren", start: 68.3, text: "Bedenini gördün mü?" },
    { n: 13, speaker: "idil", start: 70.0, text: "Görmeme izin vermediler." },
    { n: 14, speaker: "saren", start: 72.7, text: "Görseydin beni dinlemezdin." },
    { n: 15, speaker: "idil", start: 75.0, text: "Dört yıl sustu. Şimdi neden sen?" },
    { n: 16, speaker: "saren", start: 79.6, split: 1.75, cards: ["Elindeki anıyı çaldım.", "Kardeşin onu okuyabilecek kişinin sen olduğunu söyledi."] },
    { n: 17, speaker: "idil", start: 98.2, cards: ["Kardeşim yaşıyorsa onu göreceğim.", "Yaşamıyorsa seni teslim edeceğim."] },
    { n: 18, speaker: "saren", start: 104.1, text: "Anlaştık." },
    { n: 19, speaker: "idil", start: 105.3, text: "Anlaşmadık. İçeri gir." },
  ];

  // ---------------- reusable poses (data) ----------------
  const I = {
    stand: { armR: { sh: 6, el: 10, wr: 0, hand: "relaxed" }, armL: { sh: 4, el: 8, wr: 0, hand: "relaxed" }, lean: 0, rootY: 0, legR: { th: 0, kn: 0, ft: 0 }, legL: { th: 0, kn: 0, ft: 0 } },
    holdCord: { armL: { sh: 158, el: 28, wr: 0, hand: "grip" } },
    trayUp: { armR: { sh: 72, el: 48, wr: -20, hand: "grip" } },
    trayLow: { armR: { sh: 40, el: 50, wr: -10, hand: "grip" } },
  };
  const S = {
    lie: { rot: -90, x: M.sarenFeetX, y: -650, facing: "right", view: "three", eyes: "closed", noBlink: true, armR: { sh: 4, el: 4, hand: "relaxed" }, armL: { sh: -8, el: 4 }, legR: { th: 0, kn: 0 }, legL: { th: 0, kn: 0 }, skirt: { rot: 0, sy: 1 }, rootY: 0, lean: 0 },
    sit: { rot: 0, x: -10, y: -52, facing: "left", legR: { th: 88, kn: 88, ft: 0 }, legL: { th: 82, kn: 92, ft: 0 }, skirt: { rot: 74, sy: 0.55 }, lean: 4 },
    sitTalk: { armR: { sh: 18, el: 36, wr: 0, hand: "relaxed" }, armL: { sh: 4, el: 22, wr: 0, hand: "relaxed" }, tremble: 1.4 },
    kneel: { rot: 0, x: -150, y: 0, facing: "left", rootY: 224, legL: { th: -6, kn: 92, ft: -92 }, legR: { th: 82, kn: 84, ft: 2 }, skirt: { rot: 20, sy: 0.7 }, lean: 6 },
    openHands: { armR: { sh: 38, el: 62, wr: -22, hand: "open" }, armL: { sh: 26, el: 58, wr: -22, hand: "open" } },
  };
  const mix = (...a) => Object.assign({}, ...a.map((o) => JSON.parse(JSON.stringify(o))));

  // ---------------- characters ----------------
  const idil = {
    slot: "slotFront",
    keys: [
      [0, mix(I.stand, { x: -430, y: 0, facing: "right", head: { turn: 0.5, tilt: 4 }, armR: { sh: 58, el: 12, wr: 0, hand: "open" }, eyes: "wide", brows: "up", mouth: "small", look: [0.6, 0.4], lean: 6 }), 0],
      // S02: lunges toward the alarm cord, wrist still held
      [1.4, { lean: -12, armL: { sh: 150, el: 20, hand: "open" }, head: { turn: 0.1, tilt: -10 }, look: [-0.6, -1], legL: { th: -18, kn: 10 }, legR: { th: 14, kn: 4 } }, 0.25, "power3.out"],
      [2.3, { armL: { sh: 158, el: 28, hand: "grip" } }, 0.15],
      [3.4, { head: { turn: 0.5, tilt: 0 }, look: [0.8, 0.2], eyes: "wide", brows: "up" }, 0.2],
      // S05: freed; snatches the tray from the floor and raises it between them
      [5.8, { x: -560, armR: { sh: 20, el: 10, hand: "open" }, lean: 26, rootY: 40, legR: { th: 20, kn: 30 }, legL: { th: -12, kn: 34 }, look: [0.4, 1] }, 0.3, "power2.out"],
      [6.4, mix({ lean: -4, rootY: 0, legR: { th: 4, kn: 0 }, legL: { th: -4, kn: 0 }, look: [1, -0.2], mouth: "closed" }, I.trayUp), 0.45, "back.out(1.4)"],
      [7.1, { x: -700, eyes: "narrow", brows: "down", head: { turn: 0.45, tilt: 2 } }, 0.6],
      [8.0, { eyes: "open", brows: "down", look: [1, -0.3] }, 0.3],
      [11.5, { brows: "flat" }, 0.3],
      [15.2, { brows: "down", look: [1, -0.35] }, 0.3],
      [18.6, { eyes: "narrow", brows: "worried" }, 0.3],
      [22.8, { eyes: "open", brows: "neutral", look: [-0.4, -0.2] }, 0.3],
      [24.4, { look: [-0.2, -0.1], head: { turn: 0.25 } }, 0.4],
      [26.8, { look: [1, -0.2], head: { turn: 0.45 }, eyes: "narrow", brows: "down" }, 0.2],
      // S11: steps in, tray edge to his throat
      [27.6, { x: -360, armR: { sh: 88, el: 8, wr: -5, hand: "grip" }, lean: 8 }, 0.35, "power3.out"],
      // S12-S15: steps back, tray still raised
      [30.2, mix({ x: -620, lean: 0 }, I.trayUp), 0.6],
      [32.4, { look: [0.6, 0.8], head: { tilt: 8 }, eyes: "open", brows: "neutral" }, 0.3],
      [37.0, { look: [0.5, 1], eyes: "wide", brows: "up", head: { tilt: 10 } }, 0.25],
      [37.6, { armR: { sh: 55, el: 60, wr: 0 } }, 0.5],
      [39.8, { look: [1, -0.3], eyes: "open", brows: "worried", head: { tilt: 0 } }, 0.3],
      [41.1, { brows: "down", eyes: "narrow" }, 0.4],
      [44.1, { brows: "worried", eyes: "open" }, 0.3],
      [47.8, { brows: "down", eyes: "narrow", head: { tilt: -4 } }, 0.3],
      [51.7, { brows: "neutral", eyes: "open", head: { tilt: 0 } }, 0.3],
      [54.5, { look: [0.5, 0.9] }, 0.5],
      // S21: lowers the tray onto the table; the cord stays in her hand
      [58.0, { x: -640, armR: { sh: 46, el: 20, wr: 0, hand: "grip" }, lean: 10, look: [0.6, 1] }, 0.5],
      [58.8, mix({ lean: 0, look: [0.8, 0.2] }, { armR: { sh: 8, el: 14, hand: "relaxed" } }), 0.5],
      // S22: turns to the shelf behind her, pulls the old register
      [60.0, { facing: "left", head: { turn: 0.5 }, look: [1, -0.4] }, 0],
      [60.1, { x: -1010 }, 0.6, "power2.inOut"],
      [60.7, { armR: { sh: 112, el: 30, wr: 0, hand: "grip" }, lean: 6 }, 0.4],
      [61.3, { armR: { sh: 70, el: 60, wr: 0, hand: "grip" }, lean: 0 }, 0.45],
      [62.0, { facing: "right", x: -820, armR: { sh: 46, el: 70, hand: "grip" }, look: [0.6, 0.6] }, 0],
      [63.7, { look: [1, 0.5], eyes: "open", brows: "up" }, 0.2],
      [64.4, { brows: "worried", eyes: "half", look: [0.4, 0.8] }, 0.4],
      [66.6, { armR: { sh: 8, el: 14, hand: "relaxed" } }, 0.4],
      [67.8, { eyes: "open", look: [1, 0.6] }, 0.3],
      [69.9, { eyes: "half", brows: "worried", look: [0.3, 0.7] }, 0.3],
      [72.5, { eyes: "open", look: [1, 0.6] }, 0.3],
      [74.8, { brows: "down", eyes: "narrow", look: [1, 0.5] }, 0.3],
      [79.4, { brows: "worried", eyes: "open" }, 0.3],
      [84.0, { eyes: "wide", brows: "up" }, 0.4],
      [87.3, { head: { turn: 0.2 }, look: [1, -0.2] }, 0.15],
      // S33: stands still, waiting for him to run
      [90.0, { head: { turn: 0.45 }, look: [1, 0.6], eyes: "open", brows: "flat", still: true }, 0.3],
      [93.6, { still: false, look: [1, -0.1] }, 0.2],
      // S34: lets go of the cord
      [94.3, { armL: { sh: 10, el: 12, hand: "open" } }, 0.35, "power2.out"],
      // S35: ampule + paper into the coat
      [95.0, { armR: { sh: 50, el: 40, hand: "grip" }, lean: 8, look: [0.6, 1] }, 0.35],
      [95.5, { armR: { sh: 10, el: 120, wr: 20, hand: "grip" }, lean: 0 }, 0.35],
      [96.0, { armR: { sh: 6, el: 10, hand: "relaxed" } }, 0.25],
      // S35c: at the empty drawer, opens it
      [97.0, mix(I.stand, { x: 1220, facing: "right", armR: { sh: 70, el: 20, hand: "grip" }, look: [1, 0.4], head: { turn: 0.5 }, brows: "flat" }), 0],
      [97.6, { armR: { sh: 20, el: 12, hand: "relaxed" } }, 0.4],
      [98.0, { look: [1, 0.5], eyes: "open", brows: "flat" }, 0.2],
      [103.9, { brows: "down" }, 0.2],
      [105.1, { eyes: "narrow", brows: "flat" }, 0.2],
      // S40b: closes the lid, the cloth wrap in her hand
      [112.9, { armR: { sh: 40, el: 30, hand: "grip" }, armL: { sh: 70, el: 10, hand: "open" }, look: [1, 0.5] }, 0.3],
      [113.8, { armL: { sh: 4, el: 8, hand: "relaxed" }, armR: { sh: 14, el: 30, hand: "grip" } }, 0.4],
      [114.6, { head: { turn: 0.6 }, look: [1, -0.2], eyes: "wide", brows: "up" }, 0.25],
    ],
  };

  const saren = {
    slot: "slotGurney",
    keys: [
      [0, mix(S.lie, { armR: { sh: 168, el: 12, wr: 0, hand: "grip" } }), 0],
      // S03: eyes snap open (amber flash)
      [3.75, { eyes: "wide", noBlink: false, amber: 1, brows: "down", look: [0.2, -0.5] }, 0.06],
      [4.5, { amber: 0.25 }, 0.4],
      // S05 (cut covers lying -> sitting): presses the wounded left arm to the gurney with the healthy hand; fangs
      [5.8, mix(S.sit, { armL: { sh: 12, el: 8, wr: 0, hand: "relaxed" }, armR: { sh: 58, el: 78, wr: -10, hand: "open" }, head: { turn: 0.4, tilt: 6 }, eyes: "wide", amber: 1, mouth: "bared", brows: "down", look: [1, 0.1], maxMouth: "open" }), 0],
      [6.25, { amber: 0 }, 0.3],
      [6.4, { mouth: "closed", eyes: "open", brows: "neutral" }, 0.1],
      [7.2, mix(S.sitTalk, { look: [1, -0.2] }), 0.6],
      [11.8, { eyes: "half", brows: "neutral" }, 0.3],
      [15.2, { eyes: "open", brows: "worried" }, 0.3],
      [18.8, { eyes: "half", brows: "neutral", head: { tilt: -4 } }, 0.3],
      [22.9, { look: [-0.5, -0.2], head: { turn: 0.1 } }, 0.5],
      [24.6, { look: [-0.7, -0.3] }, 0.3],
      // S11: his gaze slides to her neck
      [26.9, { head: { turn: 0.45, tilt: 4 }, look: [1, 0.7], eyes: "open", amber: 0.5 }, 0.5],
      [27.7, { head: { tilt: -14, dy: -6 }, amber: 0.2, eyes: "half", look: [1, 0.2] }, 0.25, "power3.out"],
      // S12: turns his face away; pulls the cloth package from inside his coat, tosses it on the table
      [30.0, { head: { turn: -0.65, tilt: 4, dy: 0 }, amber: 0, look: [-0.6, 0.3] }, 0.4],
      [30.4, { armR: { sh: 30, el: 135, wr: 10, hand: "grip" } }, 0.4],
      [31.4, { armR: { sh: 10, el: 120, hand: "grip" } }, 0.4],
      [31.8, { armR: { sh: 70, el: 20, wr: -10, hand: "open" } }, 0.2, "power3.out"],
      [32.6, mix(S.sitTalk, { head: { turn: 0.3, tilt: 0 }, look: [1, 0.4] }), 0.6],
      [39.8, { head: { turn: 0.45 }, eyes: "open", brows: "neutral", look: [1, -0.1] }, 0.3],
      [44.1, { brows: "worried" }, 0.3],
      [51.7, { brows: "neutral", eyes: "half" }, 0.3],
      [53.0, mix(S.openHands, {}), 0.6],
      [56.0, mix(S.sitTalk, { eyes: "open" }), 0.8],
      // S24: steps down from the gurney; the left arm cannot carry the weight; the knee hits the floor
      [63.6, { x: -110, y: 0, legR: { th: 30, kn: 30 }, legL: { th: -10, kn: 10 }, skirt: { rot: 10, sy: 0.9 }, armL: { sh: 30, el: 10, hand: "open" }, armR: { sh: 20, el: 30 }, lean: 10 }, 0.3, "power2.in"],
      [63.95, mix(S.kneel, { armL: { sh: -10, el: 4, hand: "relaxed" }, armR: { sh: 46, el: 50, hand: "open" }, head: { tilt: 14 }, eyes: "closed", brows: "worried" }), 0.08, "power4.in"],
      [64.3, { head: { tilt: -6 }, eyes: "open", look: [1, -0.6], tremble: 2.2, armR: { sh: 20, el: 40, hand: "relaxed" } }, 0.5],
      [67.8, { look: [1, -0.7], brows: "neutral", head: { turn: 0.45, tilt: -10 } }, 0.3],
      [72.5, { eyes: "half", brows: "worried" }, 0.3],
      [79.4, { eyes: "open", brows: "neutral" }, 0.3],
      // S32: his eyes slide past her to the back exit
      [88.5, { look: [1, -0.35], head: { turn: 0.7, tilt: -4 } }, 0.5],
      [89.2, { look: [1, -0.1] }, 0.5],
      // S33: stays on the floor, both hands open and visible
      [90.0, mix(S.openHands, { look: [1, -0.6], head: { turn: 0.45, tilt: -8 }, eyes: "open", brows: "worried" }), 0.8],
      // S36-S38 (staged by the drawer): still kneeling, hands down
      [97.0, mix(S.kneel, S.sitTalk, { x: 1880, look: [1, -0.6], head: { turn: 0.45, tilt: -8 }, eyes: "open", brows: "neutral" }), 0],
      [104.0, { brows: "worried", eyes: "half" }, 0.2],
      [107.3, { hidden: true }, 0],
    ],
  };

  const tovan = {
    slot: "slotBack",
    keys: [
      [0, { hidden: true, x: M.door.x0 + 200, y: 0, facing: "left", eyes: "narrow", brows: "flat", still: true, breathAmp: 0.4, head: { turn: 0.3, tilt: 0 }, look: [0.6, 0], armR: { sh: -4, el: 6 }, armL: { sh: -2, el: 4 } }, 0],
      [114.5, { hidden: false, silhouette: 1 }, 0],
      [116.4, { silhouette: 0 }, 0],
      [117.0, { look: [0.4, 1], head: { tilt: 3 } }, 0.7, "power1.inOut"],
    ],
  };

  // ---------------- world props ----------------
  const T = M.table, Tx = (T.x0 + T.x1) / 2, Ty = T.top - 12;
  const G = M.gurney;
  const dropAt = [60, 70];
  const props = [
    { id: "tray", make: "tray", keys: [
      [0, { vis: 1, attach: "idil.R", at: [90, 0], angle: 10, scale: 1 }, 0],
      [0.8, { attach: null, slot: "slotFloor", at: [-300, 40], rot: 4, angle: 0 }, 0],
      [6.25, { attach: "idil.R", at: [0, 0], angle: 80, rot: 0 }, 0],
      [27.6, { angle: 12 }, 0.35],
      [30.2, { angle: 80 }, 0.5],
      [58.5, { attach: null, slot: "slotFront", at: [Tx - 40, Ty - 22], rot: 0, angle: 0 }, 0],
    ] },
    { id: "pkgTied", make: "package", arg: "tied", keys: [
      [0, { vis: 0 }, 0],
      [30.8, { vis: 1, attach: "saren.R", at: [0, 10], scale: 0.7 }, 0],
      [31.95, { attach: null, slot: "slotFront", at: [-120, -760], scale: 0.7, rot: 0 }, 0],
      [31.95, { at: [Tx + 10, Ty - 50], rot: -200 }, 0.5, "power1.in"],
      [32.5, { vis: 0 }, 0],
    ] },
    { id: "pkgOpen", make: "package", arg: "open", keys: [[0, { vis: 0 }, 0], [32.5, { vis: 1, slot: "slotFront", at: [Tx + 10, Ty - 14], scale: 0.75 }, 0], [95.8, { vis: 0 }, 0]] },
    { id: "ampule", make: "ampule", keys: [
      [0, { vis: 0 }, 0],
      [32.5, { vis: 1, slot: "slotFront", at: [Tx + 100, Ty - 10], rot: 90, scale: 0.9 }, 0],
      [95.2, { attach: "idil.R", at: [10, 0], rot: 0, scale: 0.9 }, 0],
      [95.8, { vis: 0 }, 0],
    ] },
    { id: "paper", make: "paperStrip", keys: [
      [0, { vis: 0 }, 0],
      [32.5, { vis: 1, slot: "slotFront", at: [Tx - 70, Ty - 6], rot: -3, scale: 0.55 }, 0],
      [37.6, { at: [Tx - 150, Ty - 6] }, 0.5],
      [38.1, { attach: "idil.R", at: [60, 30], rot: 0, scale: 0.55 }, 0],
      [58.5, { attach: null, slot: "slotFront", at: [Tx - 80, Ty - 4], rot: 2, scale: 0.55 }, 0],
      [95.2, { attach: "idil.R", at: [50, 40], rot: 0, scale: 0.55 }, 0],
      [95.8, { vis: 0 }, 0],
    ] },
    { id: "register", make: "registerClosed", keys: [
      [0, { vis: 0 }, 0],
      [61.3, { vis: 1, attach: "idil.R", at: [30, 40], scale: 0.85 }, 0],
      [66.8, { attach: null, slot: "slotFront", at: [Tx - 20, Ty - 50], rot: 0, scale: 0.85 }, 0],
    ] },
    { id: "sheetCover", make: "sheet", arg: "cover", keys: [[0, { vis: 1, slot: "slotGurney", at: [(G.x0 + G.x1) / 2 + 70, G.top - 4], scale: 1 }, 0], [5.8, { vis: 0 }, 0]] },
    { id: "sheetDraped", make: "sheet", arg: "draped", keys: [[0, { vis: 0 }, 0], [5.8, { vis: 1, slot: "slotGurney", at: [(G.x0 + G.x1) / 2 + 200, G.top - 4], scale: 0.7 }, 0], [64.1, { vis: 0 }, 0]] },
    { id: "splat", make: "dropSplat", keys: [[0, { vis: 0 }, 0], [5.35, { vis: 1, slot: "slotFloor", at: dropAt, scale: 1.4 }, 0]] },
    { id: "sheetFloor", make: "sheet", arg: "floor", keys: [
      [0, { vis: 0, stain: 0.01 }, 0],
      [64.1, { vis: 1, slot: "slotFloor", at: [300, -560], rot: -30, scale: 1.3, stain: 0.01 }, 0],
      [64.1, { at: [dropAt[0] - 60, dropAt[1] - 6], rot: 0 }, 0.5, "power2.in"],
      [64.7, { stain: 1 }, 5],
      [96.2, { at: [dropAt[0] + 10, dropAt[1] + 4] }, 0.6],
    ] },
    { id: "cloth", make: "package", arg: "wrap", keys: [[0, { vis: 0 }, 0], [112.9, { vis: 1, attach: "idil.R", at: [0, 10], scale: 0.55 }, 0]] },
  ];

  // ---------------- set animation ----------------
  const set_keys = [
    [0, { cordHand: null, cord: null, cordSway: 0, cart: -1, drawer: 0, door: 0, handle: 0, shelfRegister: 1, shadow: 0 }, 0],
    [2.3, { cordHand: "idil.L", cordSway: 60 }, 0],
    [24.3, { cart: 0 }, 0],
    [24.3, { cart: 1 }, 2.2, "none"],
    [26.6, { cart: -1 }, 0],
    [61.3, { shelfRegister: 0 }, 0],
    [87.3, { handle: 1 }, 0.15, "power2.in"],
    [87.9, { handle: 0 }, 0.3],
    [93.6, { handle: 1 }, 0.15, "power2.in"],
    [94.2, { handle: 0 }, 0.3],
    // the cord swings free after she lets go
    [94.3, { cordHand: null, cordSway: 120 }, 0],
    [94.3, { cordSway: -80 }, 0.35, "sine.inOut"],
    [94.65, { cordSway: 50 }, 0.35, "sine.inOut"],
    [95.0, { cordSway: -25 }, 0.4, "sine.inOut"],
    [95.4, { cordSway: 0 }, 0.5, "sine.inOut"],
    [97.1, { drawer: 1 }, 0.5, "power2.out"],
    [112.9, { drawer: 0 }, 1.2, "power2.inOut"],
    [114.35, { handle: 1 }, 0.15],
    [114.6, { door: 1 }, 1.0, "power2.out"],
    [115.0, { shadow: 0.6 }, 1.2],
  ];

  // ---------------- shots ----------------
  const CU = (who, t0, t1, extra) => Object.assign({ id: "", t0, t1, cam: Object.assign({ on: who + ".head", w: 520, oy: 70, push: 0.06 }, extra || {}) });
  const shots = [
    { id: "S01", t0: 0, t1: 1.4, scene: "grab", cam: { at: [40, -60], w: 1250, push: 0.1 }, shake: [0.82],
      p: [[0, { grab: 0.5, fall: 0, tug: 0 }, 0], [0, { grab: 1 }, 0.22, "power3.out"], [0.2, { tug: 1 }, 0.25], [0.45, { fall: 1 }, 0.4, "power2.in"]] },
    { id: "S02", t0: 1.4, t1: 3.4, cam: { on: "idil.chest", w: 1150, oy: -120, push: 0.05, drift: [-40, -30] } },
    { id: "S03", t0: 3.4, t1: 5.0, cam: { on: "saren.head", w: 380, push: 0.12 } },
    { id: "S04", t0: 5.0, t1: 5.8, scene: "drop", cam: { at: [-40, -250], w: 1400, push: 0.06 }, p: [[0, { fall: 0, splat: 0 }, 0], [5.0, { fall: 1 }, 0.35, "power2.in"], [5.35, { splat: 1 }, 0.12, "back.out(2)"]] },
    { id: "S05", t0: 5.8, t1: 8.0, cam: { at: [-330, -780], w: 1500, push: 0.05, hz: 1.25 } },
    CU("idil", 8.0, 11.8),
    CU("saren", 11.8, 15.2),
    CU("idil", 15.2, 18.8),
    CU("saren", 18.8, 24.2, { push: 0.08 }),
    { id: "S10a", t0: 24.2, t1: 25.6, cam: { at: [(M.door.x0 + M.door.x1) / 2, M.door.y0 + 290], w: 640, push: 0.04 } },
    { id: "S10b", t0: 25.6, t1: 26.8, cam: { on: "idil.handL", w: 460, oy: 60, push: 0.08 } },
    { id: "S11", t0: 26.8, t1: 30.0, cam: { at: [-200, -860], w: 950, push: 0.1, hz: 1.2 } },
    { id: "S12", t0: 30.0, t1: 32.5, cam: { on: "saren.chest", w: 1000, oy: -60, push: 0.05 } },
    { id: "S13", t0: 32.5, t1: 35.0, scene: "package", cam: { at: [0, 20], w: 1600, push: 0.08 },
      p: [[0, { land: 0, open: 0, amp: 0, paper: 0 }, 0], [32.5, { land: 1 }, 0.12, "power2.in"], [33.0, { open: 1 }, 0], [33.2, { amp: 1 }, 0.8, "power2.out"], [34.0, { paper: 1 }, 0.7, "power2.out"]] },
    { id: "S14", t0: 35.0, t1: 37.0, scene: "paper", cam: { at: [-60, 40], w: 1300, push: 0.12 }, p: [[0, { pull: 0, hand: 0 }, 0], [36.2, { hand: 1 }, 0.5]] },
    CU("idil", 37.0, 38.3, { push: 0.08 }),
    { id: "S15b", t0: 38.3, t1: 38.9, scene: "seal", cam: { at: [0, 0], w: 1300, push: 0.05 }, p: [[0, { thumb: 0 }, 0], [38.3, { thumb: 1 }, 0.6, "sine.inOut"]] },
    CU("idil", 38.9, 39.8),
    CU("saren", 39.8, 41.1, { push: 0.1 }),
    CU("idil", 41.1, 44.1),
    CU("saren", 44.1, 47.8),
    CU("idil", 47.8, 51.7),
    CU("saren", 51.7, 57.9, { push: -0.45 }),
    { id: "S21a", t0: 57.9, t1: 59.2, cam: { on: "idil.chest", w: 1150, oy: -60, push: 0.04 } },
    { id: "S21b", t0: 59.2, t1: 60.0, cam: { on: "idil.handL", w: 460, oy: 60, push: 0.06 } },
    { id: "S22", t0: 60.0, t1: 62.0, cam: { at: [-1150, -900], w: 1400, push: 0.05 } },
    { id: "S23", t0: 62.0, t1: 63.6, scene: "register", cam: { at: [180, -40], w: 1250, push: 0.22, drift: [120, 120] }, p: [[0, { flip: 0, dust: 0 }, 0], [62.0, { flip: 1 }, 0.45], [62.0, { dust: 1 }, 1.4]] },
    { id: "S24", t0: 63.6, t1: 65.0, cam: { at: [-420, -700], w: 2200, push: 0.03, hz: 1.05 }, shake: [64.0] },
    CU("idil", 65.0, 66.6),
    { id: "S25b", t0: 66.6, t1: 67.8, scene: "pageAmpule", cam: { at: [0, 0], w: 1500, push: 0.06 }, p: [[0, { turn: 0 }, 0], [66.7, { turn: 1 }, 0.8]] },
    CU("saren", 67.8, 69.9),
    CU("idil", 69.9, 72.5),
    CU("saren", 72.5, 74.8),
    CU("idil", 74.8, 79.4),
    CU("saren", 79.4, 87.2, { push: -0.4 }),
    { id: "S31", t0: 87.2, t1: 88.4, cam: { at: [M.door.handle[0] + 50, M.door.handle[1]], w: 520, push: 0.05 } },
    CU("saren", 88.4, 90.0, { w: 420, push: 0.1 }),
    { id: "S33", t0: 90.0, t1: 93.5, cam: { at: [-480, -680], w: 1550, push: 0.06, hz: 1.15 } },
    { id: "S34a", t0: 93.5, t1: 94.3, cam: { at: [M.door.handle[0] + 50, M.door.handle[1]], w: 520, push: 0.05 } },
    { id: "S34b", t0: 94.3, t1: 95.0, cam: { at: [M.cord.x + 60, -1000], w: 700, push: 0.04 } },
    { id: "S35a", t0: 95.0, t1: 96.2, cam: { on: "idil.chest", w: 1100, oy: -40, push: 0.05 } },
    { id: "S35b", t0: 96.2, t1: 97.0, scene: "foot", cam: { at: [0, 120], w: 1500, push: 0.05 }, p: [[0, { push: 0 }, 0], [96.25, { push: 1 }, 0.6, "power2.out"]] },
    { id: "S35c", t0: 97.0, t1: 98.0, cam: { at: [1430, -560], w: 1300, push: 0.05 } },
    CU("idil", 98.0, 103.9),
    CU("saren", 103.9, 105.1),
    CU("idil", 105.1, 107.3, { push: 0.1 }),
    { id: "S39", t0: 107.3, t1: 111.3, scene: "drawerSide", cam: { at: [-850, -300], pan: [-150, -260], w: 1900, push: 0.04, hz: 1.0 },
      p: [
        [0, { tray: 1, sar: { x: -1350, y: 300, rot: 0, facing: "right", rootY: 224, legL: { th: 82, kn: 84 }, legR: { th: -6, kn: 92, ft: -92 }, skirt: { rot: 20, sy: 0.7 }, armL: { sh: 20, el: 125, wr: 0, hand: "fist" }, armR: { sh: 70, el: 20, hand: "open" }, head: { turn: 0.4 }, look: [1, -0.2], brows: "worried", onTray: false } }, 0],
        // reaches for the drawer, rises (wounded arm held to the chest) and sits on the tray
        [107.6, { sar: { x: -1100, rootY: 0, legL: { th: 0, kn: 0 }, legR: { th: 0, kn: 0, ft: 0 }, skirt: { rot: 0, sy: 1 }, armR: { sh: 84, el: 10 } } }, 0.8],
        [108.5, { sar: { x: -860, y: 499, legL: { th: 88, kn: 88 }, legR: { th: 84, kn: 90 }, skirt: { rot: 70, sy: 0.55 }, armR: { sh: 20, el: 40, hand: "relaxed" }, look: [1, 0.2] } }, 0.6],
        // lies down along the tray, head toward the cabinet; the tray slides in
        [109.2, { sar: { x: -920, y: -100, rot: 90, facing: "left", legL: { th: 0, kn: 0 }, legR: { th: 0, kn: 0 }, skirt: { rot: 0, sy: 1 }, eyes: "half" } }, 0.55],
        [109.8, { sar: { x: 80, onTray: true } }, 0],
        [109.8, { tray: 0 }, 1.4, "power2.inOut"],
      ] },
    { id: "S40a", t0: 111.3, t1: 112.9, scene: "lidHand", cam: { at: [0, 60], w: 1900, push: 0.06 },
      p: [[0, { lid: 0.45, hand: 0, reach: 0, take: 0 }, 0], [111.4, { hand: 1 }, 0.4, "power2.out"], [111.8, { reach: 1 }, 0.4], [112.3, { take: 1 }, 0.4], [112.5, { lid: 1 }, 0.4]] },
    { id: "S40b", t0: 112.9, t1: 114.5, cam: { at: [1380, -520], w: 1350, push: 0.05 } },
    { id: "S41", t0: 114.5, t1: 116.5, cam: { at: [1700, -900], w: 2500, push: 0.04, hz: 1.05 } },
    { id: "S42", t0: 116.5, t1: 118.5, cam: { on: "tovan.head", w: 380, push: 0.08, oy: 10 } },
    { id: "S43", t0: 118.5, t1: 120.0, cam: { at: [dropAt[0] - 40, dropAt[1] - 40], w: 1300, push: 0.06, hz: 1.4 } },
  ];
  shots.forEach((s, i) => { if (!s.id) s.id = "S" + String(i + 1).padStart(2, "0") + "cu"; });

  window.GS_EP = {
    episode: 1,
    seed: 1,
    duration: 120,
    blocks: [0, 30, 60, 90],
    set: "morgue",
    lines,
    chars: { saren, idil, tovan },
    props,
    set_keys,
    shots,
    black: [],
    sfx: [
      // [time, file, gainDb]  (also listed in audio/cues-01.md). Files: Higgsfield SFX (audio/sfx_hf -> audio/sfx)
      [0.0, "cloth_grip", -2], [0.8, "tray_clang", 0], [1.5, "cord_rustle", -6], [5.3, "blood_drop", -4],
      [24.3, "cart_wheels", -4], [32.5, "package_thud", -1], [33.8, "ampule_clink", -4], [34.0, "paper_slide", -7],
      [38.1, "paper_slide", -10], [58.6, "package_thud", -9], [61.3, "register_pull", -3], [62.0, "page_flips", -5],
      [64.0, "knee_thud", 0], [64.15, "sheet_slide", -5], [66.7, "page_flips", -9], [87.3, "handle_click", 0],
      [93.6, "handle_click", 0], [94.3, "cord_drop", -4], [96.25, "sheet_slide", -8], [97.1, "drawer_rumble", -2],
      [109.8, "drawer_rumble", -5], [112.5, "lid_close", -2], [114.35, "handle_click", -3], [114.6, "door_open", -1],
    ],

    ambience: "amb_morgue",
  };
})();
