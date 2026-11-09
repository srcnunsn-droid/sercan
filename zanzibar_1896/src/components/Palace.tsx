// Saray kompleksi (kıyı cephesi, yandan görünüş). Sabit kimlik: harem kanadı, ana saray, Beit al-Ajaib bloğu,
// önde deniz feneri kulesi, çatıda kırmızı bayrak. damage: 0 sağlam, 1 hasarlı, 2 ağır hasarlı (sürekli değer).
import React from 'react';
import {C, clamp, rand} from '../theme';

type Props = {
  damage?: number; // 0..2
  flag?: number; // 1 = bayrak direkte, 0 = bayrak düştü
  flagWave?: number; // zaman (sn) bayrak dalgalanması
  roofLift?: number; // 0..1 taht kesiti için çatı/üst kat yukarı ayrılır
  light?: number; // 0..1 sabah ışığı (arkadan)
  fire?: number; // 0..1 içeride kor ışığı
  idPrefix?: string;
  silhouette?: boolean; // sadece silüet (harita/çizgi geçişleri için)
  stroke?: string;
};

// Hasar "ısırıkları": her biri belirli bir eşikte görünür (deterministik)
const BITES: {x: number; y: number; r: number; th: number; part: string}[] = [];
for (let i = 0; i < 46; i++) {
  const part = i % 3 === 0 ? 'harem' : i % 3 === 1 ? 'main' : 'ajaib';
  const [x0, x1, yTop, yBot] = part === 'harem' ? [10, 210, -150, -20] : part === 'main' ? [210, 520, -240, -30] : [540, 760, -280, -40];
  BITES.push({x: x0 + rand(i * 3.1) * (x1 - x0), y: yTop + rand(i * 7.7) * (yBot - yTop) * 0.8, r: 12 + rand(i * 1.9) * 26, th: 0.15 + rand(i * 5.3) * 1.75, part});
}

const jag = (x0: number, x1: number, yTop: number, depth: number, seed: number, n = 14) => {
  // kırık üst kenar çizgisi
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const dy = depth * (0.25 + rand(seed + i * 2.3) * 0.75) * (i % 2 ? 1 : 0.55);
    pts.push(`${x.toFixed(1)},${(yTop + dy).toFixed(1)}`);
  }
  return pts.join(' ');
};

const Columns: React.FC<{x0: number; x1: number; y0: number; y1: number; n: number; color: string; w?: number}> = ({x0, x1, y0, y1, n, color, w = 4}) => (
  <g>
    {Array.from({length: n + 1}, (_, i) => (
      <rect key={i} x={x0 + ((x1 - x0) * i) / n - w / 2} y={y0} width={w} height={y1 - y0} fill={color} />
    ))}
  </g>
);

export const Palace: React.FC<Props> = ({damage = 0, flag = 1, flagWave = 0, roofLift = 0, light = 1, fire = 0, idPrefix = 'p', silhouette = false, stroke}) => {
  const wall = silhouette ? 'none' : '#E6DBC5';
  const wallShade = silhouette ? 'none' : '#C9B794';
  const shadow = silhouette ? 'none' : '#3B4E57';
  const deep = silhouette ? 'none' : C.nightSoft;
  const sw = stroke ? 2 : 0;
  const d1 = clamp(damage);
  const d2 = clamp(damage - 1);
  const maskId = `${idPrefix}-dmg`;
  const scorch = silhouette ? 0 : clamp(damage * 0.6);
  const lift = roofLift * 150;

  // ana sarayın üst kenarı: sağlamda düz, ağır hasarda kırık
  const mainTop = -240 + d2 * 0;
  return (
    <g>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-50} y={-420} width={900} height={460}>
          <rect x={-50} y={-420} width={900} height={460} fill="white" />
          {BITES.filter((b) => damage > b.th).map((b, i) => {
            const k = clamp((damage - b.th) / 0.25);
            const pts = Array.from({length: 9}, (_, j) => {
              const a = (j / 9) * Math.PI * 2;
              const rr = b.r * k * (0.45 + rand(i * 13.1 + j * 3.7) * 0.9);
              return `${(b.x + Math.cos(a) * rr * 1.2).toFixed(1)},${(b.y + Math.sin(a) * rr * 0.9).toFixed(1)}`;
            }).join(' ');
            return <polygon key={i} points={pts} fill="black" />;
          })}
          {/* ağır hasar: ana sarayın üst katı ve harem çatısı çöker */}
          {d2 > 0 && <polygon points={`200,-420 ${jag(205, 525, -250 + 95 * d2, 70 * d2, 11)} 525,-420`} fill="black" />}
          {d2 > 0 && <polygon points={`0,-420 ${jag(0, 215, -160 + 60 * d2, 45 * d2, 23, 10)} 215,-420`} fill="black" />}
          {d1 > 0.4 && <polygon points={`540,-420 ${jag(540, 765, -290 + 30 * d1 + 20 * d2, 26 * d1, 37, 12)} 765,-420`} fill="black" />}
        </mask>
        <linearGradient id={`${idPrefix}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFF4DC" stopOpacity={0.35 * light} />
        </linearGradient>
        <radialGradient id={`${idPrefix}-fire`} cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#FFB060" stopOpacity="0.9" />
          <stop offset="0.6" stopColor={C.danger} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.danger} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Beit al-Ajaib bloğu (arkada, biraz koyu) */}
      <g mask={`url(#${maskId})`}>
        <g stroke={stroke} strokeWidth={sw} fill="none">
          <rect x={540} y={-280} width={220} height={280} fill={silhouette ? 'none' : '#D9CCB0'} />
        </g>
        {!silhouette && (
          <g>
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <rect x={548} y={-268 + r * 88} width={204} height={60} fill={deep} opacity={0.82} />
                <Columns x0={552} x1={748} y0={-268 + r * 88} y1={-208 + r * 88} n={10} color="#E8DDC6" w={5} />
                <rect x={540} y={-210 + r * 88} width={220} height={7} fill="#E8DDC6" />
                <rect x={540} y={-268 + r * 88 - 4} width={220} height={5} fill={C.sandDark} />
              </g>
            ))}
            <rect x={532} y={-288} width={236} height={10} fill="#E8DDC6" />
          </g>
        )}

        {/* Harem kanadı */}
        <g stroke={stroke} strokeWidth={sw}>
          <rect x={0} y={-150} width={215} height={150} fill={wallShade} />
        </g>
        {!silhouette && (
          <g>
            {Array.from({length: 6}, (_, i) => (
              <path key={i} d={`M ${16 + i * 33} -6 v -46 a 13 13 0 0 1 26 0 v 46 z`} fill={shadow} opacity={0.9} />
            ))}
            {Array.from({length: 7}, (_, i) => (
              <rect key={i} x={18 + i * 28} y={-128} width={12} height={22} fill={shadow} opacity={0.85} />
            ))}
            {/* mazgallı parapet */}
            {Array.from({length: 14}, (_, i) => (
              <rect key={i} x={2 + i * 15.4} y={-162} width={9} height={13} fill={wallShade} />
            ))}
          </g>
        )}

        {/* Ana saray: üç katlı, sürekli verandalar */}
        <g transform={`translate(0 ${-lift})`} opacity={1 - roofLift * 0.15}>
          <g stroke={stroke} strokeWidth={sw}>
            <rect x={205} y={-240} width={320} height={100} fill={wall} />
          </g>
          {!silhouette && (
            <g>
              <rect x={213} y={-228} width={304} height={62} fill={deep} opacity={0.88} />
              <Columns x0={216} x1={514} y0={-228} y1={-166} n={16} color={C.ivory} w={5} />
              <rect x={205} y={-170} width={320} height={6} fill={C.ivory} />
              {Array.from({length: 20}, (_, i) => (
                <rect key={i} x={207 + i * 16} y={-254} width={10} height={15} fill={C.ivory} />
              ))}
              <rect x={198} y={-244} width={334} height={8} fill={C.sand} />
            </g>
          )}
        </g>
        <g stroke={stroke} strokeWidth={sw}>
          <rect x={205} y={-140} width={320} height={140} fill={wall} />
        </g>
        {!silhouette && (
          <g>
            <rect x={213} y={-130} width={304} height={56} fill={deep} opacity={0.88} />
            <Columns x0={216} x1={514} y0={-130} y1={-74} n={16} color={C.ivory} w={5} />
            <rect x={205} y={-78} width={320} height={6} fill={C.ivory} />
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M ${222 + i * 34} 0 v -44 a 12 12 0 0 1 24 0 v 44 z`} fill={shadow} opacity={0.9} />
            ))}
            {/* orta çıkıntı */}
            <rect x={340} y={-150} width={50} height={150} fill={C.ivory} />
            <rect x={350} y={-140} width={30} height={46} fill={shadow} />
            <rect x={350} y={-82} width={30} height={40} fill={shadow} />
            {/* arkadan sabah ışığı: sağ kenarlarda parıltı */}
            <rect x={205} y={-240} width={320} height={240} fill={`url(#${idPrefix}-rim)`} />
          </g>
        )}
        {/* kurum izleri (yalnızca ayakta kalan duvarlarda) */}
        {scorch > 0 && (
          <g opacity={scorch}>
            {BITES.filter((b) => damage > b.th).map((b, i) => (
              <ellipse key={i} cx={b.x} cy={b.y - b.r * 0.6} rx={b.r * 1.5} ry={b.r * 1.9} fill="#2B2A26" opacity={0.3} />
            ))}
          </g>
        )}
        {/* içerideki kor */}
        {fire > 0 && <ellipse cx={360} cy={-110} rx={240} ry={130} fill={`url(#${idPrefix}-fire)`} opacity={fire} />}
      </g>


      {/* Deniz feneri kulesi (önde). Ağır hasarda kırılır. */}
      <g transform="translate(470 0)">
        {(() => {
          const h = 330 - 200 * d2 - 40 * clamp(d1 - 0.5);
          return (
            <g stroke={stroke} strokeWidth={sw}>
              <polygon points={`-16,0 16,0 11,${-h} -11,${-h}`} fill={silhouette ? 'none' : '#E6DCC8'} />
              {!silhouette && d2 < 0.5 && (
                <g>
                  <rect x={-20} y={-h - 8} width={40} height={8} fill={C.sandDark} />
                  <rect x={-12} y={-h - 34} width={24} height={26} fill={C.nightSoft} />
                  <path d={`M -15 ${-h - 34} L 0 ${-h - 50} L 15 ${-h - 34} Z`} fill={C.sandDark} />
                </g>
              )}
              {!silhouette && d2 >= 0.5 && <polygon points={`-11,${-h} -4,${-h - 22} 3,${-h - 6} 11,${-h - 16} 11,${-h}`} fill="#E6DCC8" />}
            </g>
          );
        })()}
      </g>

      {/* Bayrak direği ve kırmızı bayrak (ana saray çatısı) */}
      <g transform={`translate(372 ${-256 - lift}) rotate(${(1 - flag) * 78} 0 0)`} opacity={flag > 0.02 ? 1 : 0}>
        <rect x={-2.5} y={-120} width={5} height={120} fill={silhouette ? 'none' : '#4A3F33'} stroke={stroke} strokeWidth={sw} />
        <path
          d={`M 2 -118 C ${22 + Math.sin(flagWave * 3) * 4} ${-124 + Math.sin(flagWave * 2.3) * 3}, ${44 + Math.sin(flagWave * 3.4 + 1) * 4} ${-112 + Math.sin(flagWave * 2.8) * 4}, ${66 + Math.sin(flagWave * 2.7 + 2) * 3} ${-118 + Math.sin(flagWave * 3.1) * 4} L ${66 + Math.sin(flagWave * 2.9 + 2) * 3} ${-78 + Math.sin(flagWave * 3.3) * 4} C ${44 + Math.sin(flagWave * 3.2 + 1) * 4} ${-72 + Math.sin(flagWave * 2.5) * 3}, ${22 + Math.sin(flagWave * 2.9) * 4} ${-84 + Math.sin(flagWave * 2.1) * 3}, 2 -78 Z`}
          fill={silhouette ? 'none' : C.danger}
          stroke={stroke}
          strokeWidth={sw}
        />
      </g>
    </g>
  );
};

/** Kıyı topları (saray önündeki savunma). silenced: 0..1 */
export const ShoreGuns: React.FC<{silenced?: number; n?: number; spacing?: number; stroke?: string}> = ({silenced = 0, n = 5, spacing = 120, stroke}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const off = clamp((silenced - i * 0.12) * 2);
      return (
        <g key={i} transform={`translate(${i * spacing} 0)`}>
          <rect x={-26} y={-18} width={52} height={18} fill={stroke ? 'none' : '#9F8C6B'} stroke={stroke} />
          <g transform={`rotate(${-8 + off * 25} -6 -20)`}>
            <rect x={-10} y={-25} width={44} height={9} rx={4} fill={stroke ? 'none' : '#2C2A27'} stroke={stroke} />
          </g>
          <circle cx={-6} cy={-18} r={9} fill={stroke ? 'none' : '#3A3530'} stroke={stroke} />
        </g>
      );
    })}
  </g>
);
