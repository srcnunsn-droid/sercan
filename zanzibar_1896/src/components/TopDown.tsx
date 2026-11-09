// Limanın üstten şematik haritası. Yan görünüşle aynı düzen: kıyı üstte (doğu yukarı), gemiler soldan sağa aynı sırada.
import React from 'react';
import {C, FONT_LABEL, clamp, rand} from '../theme';
import {ShipTop} from './Ships';

export const TD_SHIPS = [
  {name: 'St George', x: 330, y: 840, len: 150, f: 2, m: 2},
  {name: 'Philomel', x: 590, y: 720, len: 112, f: 2, m: 2},
  {name: 'Racoon', x: 820, y: 620, len: 106, f: 2, m: 3},
  {name: 'Sparrow', x: 1030, y: 540, len: 70, f: 1, m: 3},
  {name: 'Thrush', x: 1185, y: 486, len: 68, f: 1, m: 3},
];
export const TD_GLASGOW = {x: 1340, y: 444, len: 84};
export const TD_PALACE = {x: 1430, y: 318, w: 250, h: 70};
export const TD_GUNS = [0, 1, 2, 3, 4].map((i) => ({x: 1350 + i * 70, y: 392}));

const COAST = 'M -400 380 L 120 372 C 300 362, 520 380, 760 370 C 920 362, 1060 382, 1200 386 C 1320 390, 1500 398, 1700 392 C 1880 386, 2050 360, 2400 340 L 2400 -400 L -400 -400 Z';

type Props = {
  t: number;
  ships?: number; // 0..1
  shipHighlight?: number; // 0..1
  glasgow?: number;
  glasgowSink?: number;
  palaceHighlight?: number;
  guns?: number;
  gunsSilenced?: number;
  people?: number;
  labels?: number;
  lines?: number; // atış yönü çizgileri (şematik)
  damage?: number;
  lineArt?: number; // yalnızca çizgi (dönüşüm anı)
  compass?: number;
};

export const TopDown: React.FC<Props> = ({t, ships = 1, shipHighlight = 0, glasgow = 1, glasgowSink = 0, palaceHighlight = 0, guns = 0, gunsSilenced = 0, people = 0, labels = 0, lines = 0, damage = 0, lineArt = 0, compass = 1}) => {
  const la = lineArt;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id="td-water" width="60" height="18" patternUnits="userSpaceOnUse">
          <path d="M 0 9 q 15 -6 30 0 t 30 0" stroke="#2B6870" strokeWidth={1.5} fill="none" opacity={0.6} />
        </pattern>
      </defs>
      <rect x={-200} y={-200} width={2400} height={1500} fill={la > 0.5 ? 'none' : C.deep} opacity={1 - la} />
      <rect x={-200} y={-200} width={2400} height={1500} fill="url(#td-water)" opacity={(1 - la) * 0.8} transform={`translate(${(t * 6) % 60} 0)`} />
      {/* kara */}
      <path d={COAST} fill={C.sand} opacity={1 - la} />
      <path d={COAST} fill="none" stroke={la > 0 ? C.brass : C.sandDark} strokeWidth={3} />
      {/* Stone Town blokları */}
      <g opacity={(1 - la) * 0.9}>
        {Array.from({length: 120}, (_, i) => {
          const x = -100 + (i % 24) * 92 + rand(i) * 30;
          const y = 40 + Math.floor(i / 24) * 62 + rand(i * 3) * 20;
          if (x > TD_PALACE.x - 40 && x < TD_PALACE.x + TD_PALACE.w + 20 && y > TD_PALACE.y - 60) return null;
          if (y > 330) return null;
          return <rect key={i} x={x} y={y} width={50 + rand(i * 7) * 30} height={34 + rand(i * 5) * 16} fill="#BCA785" stroke="#A48F6C" strokeWidth={1} />;
        })}
      </g>
      {/* saray kompleksi */}
      <g>
        <rect x={TD_PALACE.x} y={TD_PALACE.y} width={TD_PALACE.w} height={TD_PALACE.h} fill={la > 0.5 ? 'none' : damage > 1 ? '#8E836E' : C.ivory} stroke={palaceHighlight > 0 ? C.danger : la > 0 ? C.brass : '#7B6A50'} strokeWidth={2 + palaceHighlight * 4} />
        <rect x={TD_PALACE.x - 90} y={TD_PALACE.y + 12} width={86} height={50} fill={la > 0.5 ? 'none' : damage > 1.2 ? '#8E836E' : '#E4D7BC'} stroke={la > 0 ? C.brass : '#7B6A50'} strokeWidth={2} />
        <rect x={TD_PALACE.x + TD_PALACE.w + 6} y={TD_PALACE.y - 10} width={90} height={80} fill={la > 0.5 ? 'none' : '#DCCDB0'} stroke={la > 0 ? C.brass : '#7B6A50'} strokeWidth={2} />
        <circle cx={TD_PALACE.x + 120} cy={TD_PALACE.y + TD_PALACE.h + 14} r={7} fill={la > 0.5 ? 'none' : '#E6DCC8'} stroke={la > 0 ? C.brass : '#7B6A50'} strokeWidth={2} />
        {damage > 0 && la < 0.5 && Array.from({length: 9}, (_, i) => (
          <circle key={i} cx={TD_PALACE.x + 20 + rand(i * 9) * (TD_PALACE.w - 40)} cy={TD_PALACE.y + 10 + rand(i * 4) * 50} r={6 + rand(i) * 10} fill="#2B2A26" opacity={clamp(damage - i * 0.15) * 0.7} />
        ))}
      </g>
      {/* kıyı topları */}
      {guns > 0 && TD_GUNS.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y})`} opacity={guns}>
          <rect x={-14} y={-8} width={28} height={16} fill={gunsSilenced > i * 0.2 ? '#6B6458' : C.danger} stroke={C.nightDeep} strokeWidth={2} />
          <line x1={-6} y1={0} x2={-30} y2={10} stroke={C.nightDeep} strokeWidth={5} />
          {gunsSilenced > i * 0.2 && <path d="M -16 -14 L 16 14 M 16 -14 L -16 14" stroke={C.ivory} strokeWidth={3} />}
        </g>
      ))}
      {/* saray çevresindeki kalabalık (şematik nokta bulutu) */}
      {people > 0 && (
        <g opacity={people}>
          {Array.from({length: 160}, (_, i) => {
            const a = rand(i * 2.2) * Math.PI * 2;
            const r = 30 + rand(i * 5.5) * 150;
            const x = TD_PALACE.x + TD_PALACE.w / 2 + Math.cos(a) * r * 1.4;
            const y = TD_PALACE.y + 20 + Math.sin(a) * r * 0.45 - 40;
            if (y > 372) return null;
            return <circle key={i} cx={x} cy={y} r={3.2} fill={i % 4 === 0 ? C.danger : C.night} opacity={clamp(people * 2 - rand(i) * 1)} />;
          })}
        </g>
      )}
      {/* atış yönleri (şematik, menzil değeri yok) */}
      {lines > 0 && TD_SHIPS.map((s, i) => (
        <line key={i} x1={s.x + s.len / 2} y1={s.y} x2={s.x + s.len / 2 + (TD_PALACE.x + TD_PALACE.w / 2 - s.x - s.len / 2) * clamp(lines * 1.3 - i * 0.08)} y2={s.y + (TD_PALACE.y + 40 - s.y) * clamp(lines * 1.3 - i * 0.08)} stroke={C.danger} strokeWidth={3} strokeDasharray="10 8" opacity={0.85} />
      ))}
      {/* Glasgow */}
      {glasgow > 0 && (
        <g transform={`translate(${TD_GLASGOW.x} ${TD_GLASGOW.y}) rotate(-8)`} opacity={glasgow * (1 - glasgowSink * 0.65)}>
          {la > 0.5 ? <ellipse rx={TD_GLASGOW.len / 2} ry={12} fill="none" stroke={C.brass} strokeWidth={2} /> : <ShipTop len={TD_GLASGOW.len} beam={22} funnels={1} masts={3} white />}
        </g>
      )}
      {/* Britanya gemileri */}
      {TD_SHIPS.map((s, i) => {
        const on = clamp(ships * 1.5 - i * 0.12);
        return (
          <g key={s.name} transform={`translate(${s.x} ${s.y}) rotate(-12)`} opacity={on}>
            {shipHighlight > 0 && <ellipse rx={s.len * 0.7} ry={s.len * 0.32} fill="none" stroke={C.ivory} strokeWidth={2} opacity={shipHighlight} strokeDasharray="6 6" />}
            {la > 0.5 ? <ellipse rx={s.len / 2} ry={s.len * 0.13} fill="none" stroke={C.brass} strokeWidth={2} /> : <ShipTop len={s.len} beam={s.len * 0.2 + 8} funnels={s.f} masts={s.m} color="#2E3D44" />}
          </g>
        );
      })}
      {/* gemi adları */}
      {labels > 0 && (
        <g fontFamily={FONT_LABEL} fontWeight={700} fontSize={26} fill={C.ivory} letterSpacing={1}>
          {TD_SHIPS.map((s, i) => (
            <text key={s.name} x={s.x - s.len * 0.2} y={s.y + s.len * 0.2 + 42} opacity={clamp(labels * 1.6 - i * 0.12)} style={{paintOrder: 'stroke'}} stroke={C.nightDeep} strokeWidth={5}>
              {s.name.toUpperCase()}
            </text>
          ))}
        </g>
      )}
      {/* pusula: kuzey sola bakar (doğu yukarıda) */}
      {compass > 0 && (
        <g transform="translate(130 140)" opacity={compass * 0.9}>
          <circle r={50} fill="none" stroke={C.brass} strokeWidth={2} />
          <polygon points="-58,0 4,-10 4,10" fill={C.ivory} />
          <polygon points="58,0 -4,-10 -4,10" fill={C.brassDark} />
          <text x={-76} y={10} textAnchor="middle" fontFamily={FONT_LABEL} fontWeight={800} fontSize={28} fill={C.ivory}>K</text>
        </g>
      )}
    </svg>
  );
};
