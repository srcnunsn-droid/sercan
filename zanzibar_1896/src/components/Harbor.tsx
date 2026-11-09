// Zanzibar limanı — deniz seviyesinden yan görünüş. Tüm sahnelerde aynı kıyı, saray ve gemi yerleşimi kullanılır.
import React from 'react';
import {C, clamp, noise1, rand} from '../theme';
import {Palace, ShoreGuns} from './Palace';
import {Ship, ShipKind, SHIP_LEN} from './Ships';
import {Smoke} from './Effects';

export const HORIZON = 612;
export const PALACE = {x: 1300, y: 642, s: 0.85};
// Gemiler: sabit kimlik ve demir yeri (yan görünüş). Sıra: soldan sağa.
export const FLEET: {name: string; kind: ShipKind; x: number; y: number; s: number}[] = [
  {name: 'St George', kind: 'stgeorge', x: -250, y: 872, s: 1.05},
  {name: 'Philomel', kind: 'cruiser', x: 300, y: 772, s: 0.8},
  {name: 'Racoon', kind: 'cruiser3', x: 565, y: 728, s: 0.68},
  {name: 'Sparrow', kind: 'gunboat', x: 822, y: 708, s: 0.62},
  {name: 'Thrush', kind: 'gunboat', x: 985, y: 697, s: 0.6},
];
export const GLASGOW = {name: 'Glasgow', kind: 'glasgow' as ShipKind, x: 1150, y: 684, s: 0.5};
// çizim sırası: uzaktan yakına
export const FLEET_ORDER = [4, 3, 2, 1, 0];

/** gemi namlusunun dünya koordinatı (atış efektleri için) */
export const muzzle = (i: number) => {
  const s = FLEET[i];
  const L = SHIP_LEN[s.kind];
  return [s.x + (L + 10) * s.s, s.y - (s.kind === 'stgeorge' ? 64 : s.kind === 'gunboat' ? 40 : 56) * s.s];
};
/** saraydaki hedef noktalar (dünya koordinatı) */
export const target = (k: number) => {
  const pts = [[0.42, -0.55], [0.15, -0.5], [0.72, -0.45], [0.3, -0.3], [0.58, -0.75], [0.08, -0.3], [0.5, -0.2]];
  const p = pts[k % pts.length];
  return [PALACE.x + p[0] * 760 * PALACE.s, PALACE.y + p[1] * 260 * PALACE.s];
};

export type HarborProps = {
  t: number;
  cam?: {x: number; y: number; z: number};
  damage?: number;
  flag?: number;
  fire?: number;
  fleetOn?: number; // 0..1 gemilerin limana girişi
  fleetVisible?: boolean;
  glasgowSink?: number;
  glasgowOn?: boolean;
  boats?: number; // sivil teknelerin limandan çıkışı 0..1
  sky?: 'dawn' | 'smoke' | 'calm';
  burnSmoke?: number; // kalıcı duman sütunları yoğunluğu
  burnStart?: number;
  overlay?: React.ReactNode; // dünya koordinatında ek katman
  lineArt?: number; // 0..1: çizgi çizime dönüşüm
  gunAngle?: number;
  shipFlash?: (i: number) => number;
  glasgowFlash?: number;
  fogTop?: number;
  dimShips?: number;
  roofLift?: number;
  palaceGhost?: number; // Britanya etkisi katmanı
  extraWorld?: React.ReactNode; // saraydan önce çizilen katman
};

const Waves: React.FC<{t: number; lineArt: number}> = ({t, lineArt}) => {
  const rows: React.ReactNode[] = [];
  let y = HORIZON + 6;
  let i = 0;
  while (y < 1300) {
    const depth = (y - HORIZON) / 470;
    const gap = 6 + depth * 34;
    const thick = 1 + depth * 3.2;
    const len = 30 + depth * 180;
    const speed = (8 + depth * 22) * (i % 2 ? 1 : -0.6);
    const segs: React.ReactNode[] = [];
    const spacing = len * 2.6;
    const off = ((t * speed + rand(i) * 900) % spacing + spacing) % spacing;
    for (let x = -600 - off; x < 2700; x += spacing) {
      const jitter = rand(i * 31 + Math.round((x + off) / spacing)) * len * 0.8;
      const yy = y + noise1(x * 0.004 + t * 0.4, i) * 2.5 * (1 + depth * 3);
      segs.push(<line key={x} x1={x + jitter} y1={yy} x2={x + jitter + len * (0.5 + rand(i + x) * 0.5)} y2={yy} />);
    }
    rows.push(
      <g key={i} stroke={lineArt > 0.5 ? C.brass : i % 3 === 0 ? '#5E8C8E' : '#2F646B'} strokeWidth={thick} strokeLinecap="round" opacity={0.35 + depth * 0.4}>
        {segs}
      </g>,
    );
    y += gap;
    i++;
  }
  return <g>{rows}</g>;
};

const Town: React.FC<{side: 'left' | 'right'; lineArt: number}> = ({side, lineArt}) => {
  // Stone Town silüeti: düz damlı yapılar, palmiyeler. Deterministik.
  const items: React.ReactNode[] = [];
  const x0 = side === 'left' ? -700 : 2010;
  const x1 = side === 'left' ? 1290 : 2900;
  let x = x0;
  let i = side === 'left' ? 0 : 100;
  while (x < x1) {
    const w = 40 + rand(i * 1.3) * 70;
    const h = 22 + rand(i * 2.1) * (side === 'left' ? 30 : 60) + (x > 1100 && x < 1300 ? 30 : 0);
    const fill = lineArt > 0.5 ? 'none' : i % 2 ? '#B9A88A' : '#A8977A';
    items.push(<rect key={`b${i}`} x={x} y={HORIZON + 8 - h} width={w} height={h} fill={fill} stroke={lineArt > 0.5 ? C.brass : 'none'} strokeWidth={1.5} />);
    if (lineArt <= 0.5) items.push(<rect key={`w${i}`} x={x + w * 0.3} y={HORIZON + 8 - h * 0.7} width={w * 0.15} height={h * 0.25} fill="#5C625E" opacity={0.6} />);
    if (rand(i * 9.1) > 0.72) {
      const px = x + w + 6;
      const ph = 60 + rand(i) * 40;
      items.push(
        <g key={`p${i}`} stroke={lineArt > 0.5 ? C.brass : '#3E4A3E'} strokeWidth={3} fill="none">
          <path d={`M ${px} ${HORIZON + 8} q 6 ${-ph * 0.5} 2 ${-ph}`} />
          {[-1, -0.4, 0.3, 1].map((a, j) => (
            <path key={j} d={`M ${px + 2} ${HORIZON + 8 - ph} q ${a * 18} -10 ${a * 34} 8`} strokeWidth={4} />
          ))}
        </g>,
      );
    }
    x += w + 2 + rand(i * 4.4) * 18;
    i++;
  }
  return <g opacity={0.95}>{items}</g>;
};

/** Sivil tekneler (dhow benzeri küçük yelkenliler), ültimatomda limandan çıkar. */
const Boats: React.FC<{p: number; t: number; lineArt: number}> = ({p, t, lineArt}) => (
  <g>
    {Array.from({length: 7}, (_, i) => {
      const bx = 300 + i * 190 + rand(i) * 60 - p * (900 + i * 120);
      const by = 640 + rand(i * 3) * 30;
      const bob = Math.sin(t * 1.4 + i) * 2;
      const s = 0.5 + rand(i * 7) * 0.2;
      const o = 1 - clamp((p - 0.6) * 2.5);
      return (
        <g key={i} transform={`translate(${bx} ${by + bob}) scale(${s})`} opacity={o}>
          <path d="M -40 0 L 44 0 L 30 14 L -30 14 Z" fill={lineArt > 0.5 ? 'none' : '#6B5A43'} stroke={lineArt > 0.5 ? C.brass : 'none'} strokeWidth={2} />
          <path d="M 0 -2 L 0 -70 L -44 -6 Z" fill={lineArt > 0.5 ? 'none' : '#E6DCC8'} stroke={lineArt > 0.5 ? C.brass : '#5A4A38'} strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

export const Harbor: React.FC<HarborProps> = ({
  t, cam = {x: 930, y: 540, z: 1}, damage = 0, flag = 1, fire = 0, fleetOn = 1, fleetVisible = true, glasgowSink = 0, glasgowOn = true,
  boats = -1, sky = 'dawn', burnSmoke = 0, burnStart = 0, overlay, lineArt = 0, gunAngle = 0, shipFlash, glasgowFlash = 0, fogTop = 0, dimShips = 0, roofLift = 0, palaceGhost = 0, extraWorld,
}) => {
  const la = lineArt > 0.5;
  const stroke = la ? C.brass : undefined;
  const skyTop = sky === 'smoke' ? '#1D2A30' : C.night;
  const skyMid = sky === 'smoke' ? '#4B4F4C' : sky === 'calm' ? '#3E5F66' : '#2C5560';
  const skyLow = sky === 'smoke' ? '#8C7E68' : sky === 'calm' ? '#C9B593' : C.sand;
  const z = cam.z;
  const tr = `translate(960 540) scale(${z}) translate(${-cam.x} ${-cam.y})`;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="hb-sky" gradientUnits="userSpaceOnUse" x1="0" y1={-260} x2="0" y2={HORIZON}>
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.5" stopColor={skyMid} />
          <stop offset="0.86" stopColor={skyLow} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <linearGradient id="hb-haze" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON - 140} x2="0" y2={HORIZON + 30}>
          <stop offset="0" stopColor={skyLow} stopOpacity="0" />
          <stop offset="0.75" stopColor={skyLow} stopOpacity="0.55" />
          <stop offset="1" stopColor={skyLow} stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hb-sea" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2={1150}>
          <stop offset="0" stopColor={sky === 'smoke' ? '#465A58' : '#3A777B'} />
          <stop offset="0.25" stopColor={C.deep} />
          <stop offset="1" stopColor={C.nightDeep} />
        </linearGradient>
        <radialGradient id="hb-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF1D2" stopOpacity={sky === 'smoke' ? 0.35 : 0.95} />
          <stop offset="0.25" stopColor="#F2D9A8" stopOpacity={sky === 'smoke' ? 0.25 : 0.55} />
          <stop offset="1" stopColor="#F2D9A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hb-refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.45" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-refl2" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2={1000}>
          <stop offset="0" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="hb-reflmask" maskUnits="userSpaceOnUse" x={-1500} y={HORIZON} width={5000} height={700}>
          <rect x={-1500} y={HORIZON} width={5000} height={700} fill="url(#hb-refl2)" />
        </mask>
      </defs>
      <g transform={tr}>
        {/* gökyüzü */}
        {!la && <rect x={-1500} y={-900} width={5000} height={HORIZON + 900 + 2} fill="url(#hb-sky)" />}
        {!la && <circle cx={1820} cy={380} r={sky === 'calm' ? 360 : 420} fill="url(#hb-sun)" />}
        {!la && (
          <g opacity={sky === 'smoke' ? 0.25 : 0.5}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={((i * 610 + t * (6 + i * 2)) % 3600) - 1200} y={190 + i * 62} width={900 + i * 140} height={3 + i * 2} rx={3} fill={i < 2 ? '#4E7880' : '#E2CDA4'} opacity={0.45} />
            ))}
          </g>
        )}
        {/* uzak kıyı */}
        <Town side="left" lineArt={lineArt} />
        <Town side="right" lineArt={lineArt} />
        {!la && <rect x={-1500} y={HORIZON - 140} width={5000} height={172} fill="url(#hb-haze)" />}
        {/* deniz */}
        {!la && <rect x={-1500} y={HORIZON} width={5000} height={1400} fill="url(#hb-sea)" />}
        {la && <line x1={-1500} y1={HORIZON} x2={3500} y2={HORIZON} stroke={C.brass} strokeWidth={2} />}
        {/* rıhtım */}
        <rect x={1180} y={PALACE.y - 6} width={1800} height={22} fill={la ? 'none' : '#9E8B6A'} stroke={stroke} strokeWidth={la ? 2 : 0} />
        {!la && <rect x={1180} y={PALACE.y + 14} width={1800} height={8} fill="#4F4636" opacity={0.6} />}
        {/* saray yansıması */}
        {!la && (
          <g mask="url(#hb-reflmask)" opacity={0.5}>
            <g transform={`translate(${PALACE.x} ${PALACE.y * 2 + 30}) scale(${PALACE.s} ${-PALACE.s})`}>
              <Palace damage={damage} flag={flag} flagWave={t} idPrefix="refl" light={0.5} />
            </g>
          </g>
        )}
        {!la && fleetVisible && (
          <g mask="url(#hb-reflmask)" opacity={0.42}>
            {FLEET.map((sh, i) => {
              const enter = clamp(fleetOn * 1.6 - i * 0.15);
              if (enter <= 0) return null;
              return (
                <g key={sh.name} transform={`translate(${sh.x + (1 - enter) * -900} ${sh.y + 14}) scale(${sh.s} ${-sh.s * 0.8})`}>
                  <Ship kind={sh.kind} />
                </g>
              );
            })}
            {glasgowOn && glasgowSink < 0.5 && (
              <g transform={`translate(${GLASGOW.x} ${GLASGOW.y + 12}) scale(${GLASGOW.s} ${-GLASGOW.s * 0.8})`}>
                <Ship kind="glasgow" />
              </g>
            )}
          </g>
        )}
        <Waves t={t} lineArt={lineArt} />
        {extraWorld}
        {palaceGhost > 0 && (
          <g transform={`translate(${PALACE.x + 34 * palaceGhost} ${PALACE.y - 34 * palaceGhost}) scale(${PALACE.s})`} opacity={palaceGhost * 0.9}>
            <Palace damage={damage} flag={0} silhouette stroke={C.deepSoft} idPrefix="ghost" />
          </g>
        )}
        {/* saray */}
        <g transform={`translate(${PALACE.x} ${PALACE.y}) scale(${PALACE.s})`}>
          <Palace damage={damage} flag={flag} flagWave={t} fire={fire} silhouette={la} stroke={stroke} idPrefix="main" roofLift={roofLift} />
        </g>
        <g transform={`translate(${PALACE.x + 140} ${PALACE.y - 4}) scale(0.62)`}>
          <ShoreGuns silenced={clamp(damage)} stroke={stroke} />
        </g>
        {burnSmoke > 0 && (
          <g opacity={burnSmoke}>
            <Smoke id="b1" x={PALACE.x + 330} y={PALACE.y - 150} t={t} start={burnStart} rate={2.5} life={10} wind={-34} rise={26} size={40} color="#2E3031" opacity={0.6} seed={3} />
            <Smoke id="b2" x={PALACE.x + 110} y={PALACE.y - 90} t={t} start={burnStart + 0.7} rate={2} life={9} wind={-30} rise={22} size={32} color="#3A3B3A" opacity={0.5} seed={7} />
            <Smoke id="b3" x={PALACE.x + 560} y={PALACE.y - 180} t={t} start={burnStart + 1.3} rate={1.6} life={9} wind={-36} rise={24} size={30} color="#4A4844" opacity={0.45} seed={11} />
          </g>
        )}
        {boats >= 0 && <Boats p={boats} t={t} lineArt={lineArt} />}
        {/* Glasgow */}
        {glasgowOn && (
          <g transform={`translate(${GLASGOW.x} ${GLASGOW.y + Math.sin(t * 1.1) * 1.5}) scale(${GLASGOW.s})`}>
            <Ship kind="glasgow" stroke={stroke} sink={glasgowSink} flash={glasgowFlash} />
          </g>
        )}
        {/* Britanya gemileri */}
        {fleetVisible && FLEET_ORDER.map((i) => {
          const s = FLEET[i];
          const enter = clamp(fleetOn * 1.6 - i * 0.15);
          const dx = (1 - enter) * -900;
          return (
            <g key={s.name} transform={`translate(${s.x + dx} ${s.y + Math.sin(t * 0.9 + i) * 2}) scale(${s.s})`} opacity={(enter > 0 ? 1 : 0) * (1 - dimShips * 0.6)}>
              <Ship kind={s.kind} stroke={stroke} gunAngle={gunAngle} flash={shipFlash ? shipFlash(i) : 0} />
            </g>
          );
        })}
        {overlay}
        {fogTop > 0 && <rect x={-1500} y={-900} width={5000} height={HORIZON + 900} fill={C.night} opacity={fogTop} />}
      </g>
    </svg>
  );
};
