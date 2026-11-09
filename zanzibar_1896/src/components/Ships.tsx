// Gemi silüetleri (yandan). Su hattı y=0, pruva sağda. Sınıf özellikleri sadeleştirilmiştir:
//  - St George (Edgar sınıfı korumalı kruvazör): iki eğimli baca, iki direk (muharebe platformlu), mahmuz pruva
//  - Philomel / Racoon (küçük kruvazörler): iki baca
//  - Thrush / Sparrow (gambotlar): tek baca, üç direk
//  - Glasgow (Zanzibar kraliyet yatı): beyaz gövde, klipper pruva + cıvadra, tek baca, üç direk
import React from 'react';
import {C} from '../theme';

export type ShipKind = 'stgeorge' | 'cruiser' | 'cruiser3' | 'gunboat' | 'glasgow';
export const SHIP_LEN: Record<ShipKind, number> = {stgeorge: 560, cruiser: 400, cruiser3: 380, gunboat: 240, glasgow: 320};

type ShipProps = {kind: ShipKind; stroke?: string; sink?: number; flash?: number; gunAngle?: number; damaged?: number; haze?: number};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="hullG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2E3D44" />
      <stop offset="1" stopColor="#10181C" />
    </linearGradient>
    <linearGradient id="hullW" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F7F2E8" />
      <stop offset="1" stopColor="#CFC6B4" />
    </linearGradient>
    <linearGradient id="funG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9C8152" />
      <stop offset="0.45" stopColor="#C9AC74" />
      <stop offset="1" stopColor="#8E7448" />
    </linearGradient>
  </defs>
);

type Ctx = {stroke?: string};
const S = (c: Ctx, fill: string) => (c.stroke ? {fill: 'none', stroke: c.stroke, strokeWidth: 2} : {fill});

const Funnel: React.FC<{c: Ctx; x: number; w: number; h: number; base: number; rake?: number}> = ({c, x, w, h, base, rake = 8}) => (
  <g>
    <polygon points={`${x},${base} ${x + w},${base} ${x + w - rake},${base - h} ${x - rake},${base - h}`} {...S(c, 'url(#funG)')} />
    {!c.stroke && <polygon points={`${x - rake},${base - h} ${x + w - rake},${base - h} ${x + w - rake * 0.88},${base - h + 14} ${x - rake * 0.88},${base - h + 14}`} fill="#15130F" />}
    {!c.stroke && <polygon points={`${x - rake * 0.55},${base - h * 0.55} ${x + w - rake * 0.55},${base - h * 0.55} ${x + w - rake * 0.52},${base - h * 0.55 + 4} ${x - rake * 0.52},${base - h * 0.55 + 4}`} fill="#6E5A38" />}
  </g>
);

const Mast: React.FC<{c: Ctx; x: number; base: number; h: number; top?: boolean; yards?: number; rake?: number}> = ({c, x, base, h, top = false, yards = 0, rake = 5}) => {
  const col = c.stroke || '#221F1A';
  return (
    <g>
      <polygon points={`${x - 3},${base} ${x + 3},${base} ${x - rake + 1.2},${base - h} ${x - rake - 1.2},${base - h}`} fill={c.stroke ? 'none' : col} stroke={c.stroke} strokeWidth={c.stroke ? 1.5 : 0} />
      {top && <rect x={x - rake * 0.6 - 15} y={base - h * 0.6} width={30} height={10} rx={2} {...S(c, col)} />}
      {Array.from({length: yards}, (_, i) => {
        const yy = base - h * (0.5 + i * 0.16);
        const half = 34 - i * 7;
        return <line key={i} x1={x - rake * (0.5 + i * 0.16) - half} y1={yy} x2={x - rake * (0.5 + i * 0.16) + half} y2={yy} stroke={col} strokeWidth={2.4} />;
      })}
    </g>
  );
};

const Rigging: React.FC<{c: Ctx; pts: [number, number, number, number][]}> = ({c, pts}) =>
  c.stroke ? null : (
    <g stroke="#2A2620" strokeWidth={1} opacity={0.55}>
      {pts.map((p, i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} />
      ))}
    </g>
  );

const Boat: React.FC<{c: Ctx; x: number; y: number; w?: number}> = ({c, x, y, w = 34}) => (
  <path d={`M ${x} ${y} q ${w / 2} 9 ${w} 0 l -3 -6 h ${-w + 6} z`} {...S(c, '#EEE7D8')} />
);

export const Ship: React.FC<ShipProps> = ({kind, stroke, sink = 0, flash = 0, gunAngle = 0, damaged = 0}) => {
  const c: Ctx = {stroke};
  const L = SHIP_LEN[kind];
  let body: React.ReactNode;
  if (kind === 'stgeorge') {
    const deck = -46;
    body = (
      <g>
        <Rigging c={c} pts={[[135, deck - 250, 30, deck + 2], [135, deck - 250, 425, deck - 258], [425, deck - 258, 548, deck + 4], [135, deck - 250, 250, deck - 40]]} />
        <Mast c={c} x={140} base={deck} h={250} top />
        <Mast c={c} x={430} base={deck} h={262} top />
        <Funnel c={c} x={232} w={36} h={136} base={deck - 10} rake={12} />
        <Funnel c={c} x={320} w={36} h={136} base={deck - 10} rake={12} />
        {/* üst yapı, köprü, filikalar, vantilatörler */}
        <rect x={150} y={deck - 26} width={300} height={26} {...S(c, '#E4DCCB')} />
        {!stroke && Array.from({length: 14}, (_, i) => <rect key={i} x={160 + i * 20} y={deck - 18} width={8} height={7} fill="#4A4A44" />)}
        <rect x={405} y={deck - 52} width={62} height={26} {...S(c, '#E4DCCB')} />
        <line x1={398} y1={deck - 56} x2={474} y2={deck - 56} stroke={stroke || '#6B6556'} strokeWidth={2} />
        <Boat c={c} x={170} y={deck - 30} />
        <Boat c={c} x={278} y={deck - 30} w={30} />
        <Boat c={c} x={360} y={deck - 30} />
        {!stroke && [205, 300, 385].map((x) => <path key={x} d={`M ${x} ${deck - 26} v -18 q 0 -6 8 -8`} stroke="#C9C0AC" strokeWidth={5} fill="none" />)}
        {/* gövde: hafif sheer ve mahmuz pruva */}
        <path d={`M 4 -4 L 26 ${deck} Q 280 ${deck + 6} 532 ${deck - 2} L 556 ${deck + 4} L 552 -6 Q 548 6 532 12 L 24 12 Z`} {...S(c, 'url(#hullG)')} />
        {!stroke && <path d={`M 26 ${deck} Q 280 ${deck + 6} 532 ${deck - 2}`} stroke="#D8CFBC" strokeWidth={3} fill="none" />}
        {!stroke && Array.from({length: 9}, (_, i) => <circle key={i} cx={70 + i * 52} cy={-22} r={3.5} fill="#0A0F12" />)}
        {!stroke && <circle cx={520} cy={-30} r={6} fill="#0A0F12" />}
        <g transform={`rotate(${-gunAngle} 470 ${deck - 18})`}><rect x={468} y={deck - 23} width={78} height={9} rx={4} {...S(c, '#1E1E1C')} /></g>
        <g transform={`rotate(${-gunAngle} 118 ${deck - 12})`}><rect x={118} y={deck - 16} width={60} height={8} rx={3} {...S(c, '#1E1E1C')} /></g>
      </g>
    );
  } else if (kind === 'cruiser' || kind === 'cruiser3') {
    const deck = -36;
    body = (
      <g>
        <Rigging c={c} pts={[[78, deck - 196, 20, deck + 2], [78, deck - 196, 296, deck - 202], [296, deck - 202, 392, deck + 2]]} />
        <Mast c={c} x={80} base={deck} h={196} top={kind === 'cruiser'} yards={kind === 'cruiser3' ? 1 : 0} />
        <Mast c={c} x={300} base={deck} h={202} top={kind === 'cruiser'} yards={kind === 'cruiser3' ? 1 : 0} />
        {kind === 'cruiser3' && <Mast c={c} x={190} base={deck} h={150} />}
        <Funnel c={c} x={160} w={28} h={104} base={deck - 8} rake={9} />
        <Funnel c={c} x={224} w={28} h={104} base={deck - 8} rake={9} />
        <rect x={110} y={deck - 22} width={210} height={22} {...S(c, '#E4DCCB')} />
        <rect x={300} y={deck - 42} width={48} height={20} {...S(c, '#E4DCCB')} />
        <Boat c={c} x={126} y={deck - 26} w={28} />
        <Boat c={c} x={260} y={deck - 26} w={28} />
        <path d={`M 4 -4 L 20 ${deck} Q 200 ${deck + 5} 382 ${deck - 2} L 398 ${deck + 3} L 394 -4 Q 390 6 378 10 L 20 10 Z`} {...S(c, 'url(#hullG)')} />
        {!stroke && <path d={`M 20 ${deck} Q 200 ${deck + 5} 382 ${deck - 2}`} stroke="#D8CFBC" strokeWidth={2.5} fill="none" />}
        {!stroke && Array.from({length: 7}, (_, i) => <circle key={i} cx={50 + i * 48} cy={-18} r={3} fill="#0A0F12" />)}
        <g transform={`rotate(${-gunAngle} 336 ${deck - 14})`}><rect x={334} y={deck - 18} width={58} height={7} rx={3} {...S(c, '#1E1E1C')} /></g>
      </g>
    );
  } else if (kind === 'gunboat') {
    const deck = -28;
    body = (
      <g>
        <Rigging c={c} pts={[[36, deck - 150, 6, deck], [36, deck - 150, 118, deck - 160], [118, deck - 160, 196, deck - 142], [196, deck - 142, 236, deck]]} />
        <Mast c={c} x={40} base={deck} h={150} yards={2} />
        <Mast c={c} x={120} base={deck} h={160} yards={1} />
        <Mast c={c} x={200} base={deck} h={142} />
        <Funnel c={c} x={140} w={22} h={72} base={deck - 6} rake={6} />
        <rect x={64} y={deck - 16} width={118} height={16} {...S(c, '#E4DCCB')} />
        <Boat c={c} x={70} y={deck - 19} w={24} />
        <path d={`M 2 -2 L 12 ${deck} Q 120 ${deck + 4} 228 ${deck - 1} L 240 ${deck + 3} L 236 -2 Q 232 6 222 8 L 12 8 Z`} {...S(c, 'url(#hullG)')} />
        {!stroke && <path d={`M 12 ${deck} Q 120 ${deck + 4} 228 ${deck - 1}`} stroke="#D8CFBC" strokeWidth={2} fill="none" />}
        <g transform={`rotate(${-gunAngle} 196 ${deck - 10})`}><rect x={194} y={deck - 14} width={46} height={6} rx={3} {...S(c, '#1E1E1C')} /></g>
      </g>
    );
  } else {
    const deck = -34;
    body = (
      <g>
        <Rigging c={c} pts={[[66, deck - 200, 4, deck], [66, deck - 200, 146, deck - 214], [146, deck - 214, 228, deck - 180], [146, deck - 214, 370, -62], [228, deck - 180, 330, deck]]} />
        <Mast c={c} x={70} base={deck} h={200} yards={3} />
        <Mast c={c} x={150} base={deck} h={214} yards={3} />
        <Mast c={c} x={232} base={deck} h={180} yards={2} />
        <Funnel c={c} x={176} w={24} h={78} base={deck} rake={4} />
        <path d={`M 8 -6 L 0 ${deck} L 300 ${deck} Q 324 ${deck - 4} 342 ${deck - 12} L 332 ${deck + 2} Q 322 0 296 10 L 20 10 Z`} {...S(c, 'url(#hullW)')} />
        <line x1={300} y1={deck - 4} x2={372} y2={deck - 28} stroke={stroke || '#4A3F33'} strokeWidth={3} />
        {!stroke && <rect x={14} y={-22} width={300} height={4} fill={C.brassLight} />}
        {!stroke && <path d="M 326 -40 q 10 4 14 -6" stroke={C.brassLight} strokeWidth={3} fill="none" />}
        {!stroke && Array.from({length: 8}, (_, i) => <rect key={i} x={40 + i * 32} y={-14} width={10} height={7} fill="#2A2A26" />)}
        <g transform={`rotate(${-gunAngle} 262 ${deck - 6})`}><rect x={262} y={deck - 10} width={36} height={6} rx={3} {...S(c, '#1E1E1C')} /></g>
      </g>
    );
  }
  // batma: gemi yana yatar ve oturur; sığ suda direkler görünür kalır
  const tilt = sink * 8;
  const down = sink * 58;
  return (
    <g>
      <Defs />
      {sink > 0 && (
        <clipPath id={`wl-${kind}`}>
          <rect x={-200} y={-600} width={L + 500} height={600 + 4} />
        </clipPath>
      )}
      <g clipPath={sink > 0 ? `url(#wl-${kind})` : undefined}>
      <g transform={`translate(0 ${down}) rotate(${tilt} ${L * 0.55} 0)`}>
        {body}
        {damaged > 0 && !stroke && <ellipse cx={L * 0.45} cy={-30} rx={40 * damaged} ry={16 * damaged} fill="#1A1714" opacity={0.6} />}
      </g>
      </g>
      {flash > 0 && (
        <g opacity={flash}>
          <ellipse cx={L + 46} cy={kind === 'stgeorge' ? -64 : -46} rx={70} ry={26} fill="#FFDCA0" opacity={0.8} />
          <circle cx={L + 24} cy={kind === 'stgeorge' ? -64 : -46} r={18} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

/** Üstten görünüş ikonu (güç karşılaştırması haritası). */
export const ShipTop: React.FC<{len: number; beam?: number; color?: string; funnels?: number; masts?: number; white?: boolean}> = ({len, beam = 34, color = C.ivory, funnels = 2, masts = 2, white}) => (
  <g>
    <path d={`M ${-len / 2} ${-beam * 0.32} C ${-len / 2} ${-beam / 2}, ${len * 0.2} ${-beam / 2}, ${len / 2} 0 C ${len * 0.2} ${beam / 2}, ${-len / 2} ${beam / 2}, ${-len / 2} ${beam * 0.32} Z`} fill={white ? '#F4EEE2' : color} stroke={C.nightDeep} strokeWidth={2} />
    {Array.from({length: funnels}, (_, i) => (
      <ellipse key={i} cx={-((funnels - 1) * len * 0.09) + i * len * 0.18} cy={0} rx={beam * 0.24} ry={beam * 0.22} fill="#B89A62" stroke="#1E1A14" strokeWidth={2} />
    ))}
    {Array.from({length: masts}, (_, i) => (
      <circle key={i} cx={-len * 0.3 + (i * len * 0.6) / Math.max(1, masts - 1)} cy={0} r={3.5} fill="#1C2A31" />
    ))}
  </g>
);
