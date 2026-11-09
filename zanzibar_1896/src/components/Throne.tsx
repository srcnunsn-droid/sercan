// Saray kesiti: taht odası ve isim levhası. Portreler yüz içermeyen silüettir (doğrulanmış portre kullanılmadı).
import React from 'react';
import {C, FONT_LABEL, FONT_TITLE, clamp} from '../theme';

/** Taht odası (kesit görünüm). damage: 0..2 hasarlı görünüm korunur. */
export const ThroneRoom: React.FC<{name?: string; nameNext?: string; swap?: number; o?: number; damage?: number; glow?: number}> = ({name = '', nameNext = '', swap = 0, o = 1, damage = 0, glow = 0}) => {
  const W = 860, Hh = 420;
  return (
    <svg width={W} height={Hh + 120} viewBox={`0 0 ${W} ${Hh + 120}`} style={{overflow: 'visible', opacity: o}}>
      <defs>
        <linearGradient id="tr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A4752" />
          <stop offset="1" stopColor="#183440" />
        </linearGradient>
        <radialGradient id="tr-light" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#F4D9A0" stopOpacity={0.35 + glow * 0.2} />
          <stop offset="1" stopColor="#F4D9A0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={Hh} fill="url(#tr-wall)" />
      {/* kemerli nişler */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${70 + i * 170} ${Hh - 60} v -190 a 50 56 0 0 1 100 0 v 190 z`} fill="#10262F" stroke={C.brass} strokeWidth={2} opacity={i === 2 ? 0 : 0.85} />
      ))}
      <rect x={0} y={0} width={W} height={Hh} fill="url(#tr-light)" />
      {/* zemin ve halı */}
      <rect x={0} y={Hh - 60} width={W} height={60} fill="#8C7650" />
      <polygon points={`${W / 2 - 150},${Hh} ${W / 2 + 150},${Hh} ${W / 2 + 90},${Hh - 60} ${W / 2 - 90},${Hh - 60}`} fill={C.danger} opacity={0.75} />
      {/* taht */}
      <g transform={`translate(${W / 2} ${Hh - 62})`}>
        <path d="M -70 0 v -150 q 0 -40 40 -56 q 30 -12 30 -36 q 0 24 30 36 q 40 16 40 56 v 150 z" fill={C.brass} stroke="#5E4728" strokeWidth={3} />
        <path d="M -52 -10 v -130 q 0 -28 30 -40 q 22 -9 22 -24 q 0 15 22 24 q 30 12 30 40 v 130 z" fill="#7C2E25" />
        <rect x={-92} y={-62} width={184} height={30} rx={8} fill={C.brassLight} stroke="#5E4728" strokeWidth={3} />
        <rect x={-80} y={-32} width={20} height={32} fill={C.brass} />
        <rect x={60} y={-32} width={20} height={32} fill={C.brass} />
      </g>
      {/* hasar korunur: çatlaklar ve düşen sıva */}
      {damage > 0 && (
        <g opacity={clamp(damage)} stroke="#0B1820" strokeWidth={3} fill="none">
          <path d="M 120 0 l 30 60 l -20 40 l 40 70" />
          <path d="M 700 0 l -24 80 l 30 30 l -16 90" />
          <path d="M 420 0 l 10 40 l -20 30" />
        </g>
      )}
      {damage > 1 && <polygon points={`0,0 ${W},0 ${W},40 ${W - 120},70 ${W - 260},30 ${W - 420},80 ${W - 560},26 200,60 0,30`} fill={C.night} opacity={clamp(damage - 1)} />}
      {/* isim levhası */}
      <g transform={`translate(${W / 2} ${Hh + 54})`}>
        <rect x={-300} y={-40} width={600} height={80} fill="#1E1A14" stroke={C.brass} strokeWidth={3} />
        <clipPath id="plate-clip"><rect x={-296} y={-36} width={592} height={72} /></clipPath>
        <g clipPath="url(#plate-clip)">
          <text y={14 - swap * 80} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={800} fontSize={40} fill={C.ivory} letterSpacing={1.5}>{name}</text>
          {nameNext && <text y={94 - swap * 80} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={800} fontSize={40} fill={C.ivory} letterSpacing={1.5}>{nameNext}</text>}
        </g>
      </g>
    </svg>
  );
};

/** Yüzsüz silüet portre çerçevesi. */
export const Portrait: React.FC<{name: string; sub?: string; o?: number; accent?: string; dim?: number; ribbon?: number; size?: number}> = ({name, sub, o = 1, accent = C.brass, dim = 0, ribbon = 0, size = 1}) => {
  if (o <= 0.001) return null;
  return (
    <div style={{opacity: clamp(o * 1.2), transform: `scale(${(0.94 + 0.06 * o) * size})`, transformOrigin: 'center', width: 300, textAlign: 'center'}}>
      <svg width={300} height={330} viewBox="0 0 300 330">
        <ellipse cx={150} cy={160} rx={128} ry={150} fill={C.nightSoft} stroke={accent} strokeWidth={6} />
        <ellipse cx={150} cy={160} rx={116} ry={138} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.6} />
        <clipPath id={`pc-${name.length}`}><ellipse cx={150} cy={160} rx={114} ry={136} /></clipPath>
        <g clipPath={`url(#pc-${name.length})`} opacity={1 - dim * 0.55}>
          {/* sarık ve omuzlar: ayrıntısız, yüzsüz silüet */}
          <path d="M 105 118 q 4 -50 45 -54 q 41 4 45 54 q -20 -12 -45 -12 q -25 0 -45 12 z" fill="#D9CCB0" />
          <ellipse cx={150} cy={150} rx={38} ry={46} fill="#0E1E27" />
          <path d="M 40 330 q 10 -100 70 -116 q 40 14 80 0 q 60 16 70 116 z" fill="#0E1E27" />
        </g>
        {ribbon > 0 && <path d={`M 40 50 L ${40 + 220 * ribbon} ${50 + 220 * ribbon}`} stroke="#0B0B0B" strokeWidth={22} opacity={0.85} />}
      </svg>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 34, color: C.ivory, marginTop: 6, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{name}</div>
      {sub && <div style={{fontFamily: FONT_LABEL, fontWeight: 500, fontSize: 22, color: C.sand, marginTop: 6, lineHeight: 1.25}}>{sub}</div>}
    </div>
  );
};
