// KARAKTER TANIMLARI — bütün sahnelerde aynı görünüm/oran kullanılır.
'use strict';
const CHARS = (() => {
  const guard = {
    name: 'Muhafız', seed: 3, size: 1.0,
    skin: [188, 142, 118],
    head: { skin: [188, 142, 118], hair: [50, 39, 31], hairHi: [120, 110, 100], beard: true, beardCol: [52, 40, 32], beardLen: 0.045, beardAlpha: 0.92,
      eye: [85, 95, 88], tired: 0.75, age: 0.55, coldCheeks: 0.9, seed: 3, grey: 0.08 },
    tunic: [74, 88, 66], sleeve: [74, 88, 66], trousers: [62, 55, 48], boots: [72, 52, 36], bootH: 0.4,
    glove: [96, 70, 48], tornGlove: true, belt: [72, 46, 28], buckle: [118, 118, 124], hemFray: true,
    cloak: { col: [104, 95, 82], hem: 0.42, thick: 0.4, light: 1.3, pin: true, worn: true },
  };
  const king = {
    name: 'Kral', seed: 5, size: 1.01,
    skin: [204, 162, 138],
    head: { skin: [204, 162, 138], hair: [146, 141, 136], hairHi: [235, 235, 235], beard: true, beardCol: [138, 132, 126], grey: 0.55, beardLen: 0.08,
      crown: true, age: 0.7, seed: 5, eye: [88, 102, 118], coldCheeks: 0.3 },
    tunic: [46, 52, 70], sleeve: [46, 52, 70], embroidery: true, trousers: [36, 34, 38], boots: [34, 28, 26], bootH: 0.5, belly: 0.012,
    glove: [70, 48, 36], furCuff: true, fur: [112, 82, 56], belt: [30, 24, 22], buckle: [200, 160, 80], clasp: true,
    cloak: { col: [98, 28, 38], hem: 0.12, thick: 1.6, light: 0.6 },
  };
  const clerk = {
    name: 'Kâtip', seed: 9, size: 0.97,
    skin: [198, 160, 132],
    head: { skin: [198, 160, 132], hair: [70, 52, 38], beard: false, eye: [80, 70, 60], age: 0.3, seed: 9, recede: 0.4 },
    tunic: [82, 62, 46], sleeve: [82, 62, 46], robe: true, trousers: [60, 46, 36], boots: [50, 38, 30], bootH: 0.3,
    glove: null, belt: [50, 36, 26], buckle: [110, 105, 95],
  };
  clerk.glove = clerk.skin;
  const sentryA = {
    name: 'Nöbetçi A', seed: 11, size: 0.99,
    skin: [182, 140, 116],
    head: { skin: [182, 140, 116], hair: [70, 55, 40], beard: true, beardCol: [90, 70, 50], beardLen: 0.03, beardAlpha: 0.75, eye: [70, 80, 70], age: 0.35, seed: 11,
      hood: true, hoodCol: [86, 82, 74], coldCheeks: 0.8 },
    tunic: [68, 78, 64], sleeve: [68, 78, 64], trousers: [58, 52, 46], boots: [64, 48, 34], bootH: 0.45,
    glove: [88, 66, 46], belt: [66, 44, 28], buckle: [118, 118, 124],
    cloak: { col: [82, 78, 70], hem: 0.34, thick: 1.1, light: 0.9, pin: true },
  };
  const sentryB = JSON.parse(JSON.stringify(sentryA));
  Object.assign(sentryB, { name: 'Nöbetçi B', seed: 13, size: 1.03, skin: [196, 152, 126] });
  Object.assign(sentryB.head, { skin: [196, 152, 126], hair: [36, 30, 26], beardCol: [40, 33, 28], beardLen: 0.06, beardAlpha: 0.95, seed: 13, hoodCol: [74, 72, 68], age: 0.5 });
  sentryB.cloak.col = [74, 72, 68];

  // Temel duruş: mızraklı nöbet (yakın el mızrakta, mızrak dibi önde yerde)
  function guardStand(o = {}) {
    const lean = o.lean == null ? 0.02 : o.lean;
    const sp = { x: 0.2, y: 0 };
    return {
      hipY: (o.hipY == null ? RIG.ROOT_Y : o.hipY), lean, neck: o.neck || 0.04, shrug: o.shrug || 0,
      arms: {
        near: { ik: { x: 0.2, y: o.gripY || 1.08 }, hand: 'fist', handAng: Math.PI / 2 - 0.05, bend: -1 },
        far: { upper: -0.06, fore: 0.12, hand: 'relaxed', handRel: 0.05 },
      },
      legs: { near: { ik: { x: -0.05, y: B_ANK }, footAng: 0.04 }, far: { ik: { x: 0.08, y: B_ANK }, footAng: -0.02 } },
      spear: { a: { x: sp.x, y: 0.0 }, b: { x: sp.x + 0.0, y: 2.0 }, local: true },
    };
  }
  const B_ANK = 0.075;

  return { guard, king, clerk, sentryA, sentryB, guardStand, B_ANK };
})();
if (typeof module !== 'undefined') module.exports = CHARS;
