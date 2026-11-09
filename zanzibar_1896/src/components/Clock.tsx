// Anlatı düzeneği: içinde Zanzibar limanı bulunan saat. (Tarihsel bir nesne değildir; şematik sunum aracıdır.)
import React from 'react';
import {C, FONT_LABEL, FONT_TITLE, clamp, rand} from '../theme';

export const CX = 960, CY = 540;
export const R_DIAL = 360; // liman penceresi
export const R_BEZEL = 430;
export const R_RING = 492; // tarih halkası

const polar = (r: number, deg: number, cx = CX, cy = CY) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const gearPath = (r: number, teeth: number, depth = 14) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r - depth;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

export type ClockProps = {
  t: number;
  minutes?: number; // gün içi dakika (ibreler)
  dateRot?: number; // tarih halkası dönüşü (derece)
  dateLabels?: {deg: number; text: string; hot?: boolean}[];
  gearsOn?: number;
  gearSpeed?: number;
  stopped?: boolean;
  red?: number; // tehlike vurgusu
  dialChildren?: React.ReactNode; // HTML katman (liman)
  bezelOpacity?: number;
  timeline?: {p: number; marks: {deg: number; text: string}[]; arcFrom: number; arcTo: number} | null;
  engrave?: number; // kadranın ince çizgileri
  handsOpacity?: number;
  marker9?: number; // 09.00 işareti
  strip?: React.ReactNode; // SVG katmanı (ültimatom şeridi)
  outerOpacity?: number;
};

export const DATE_DEG = {25: -40, 26: 0, 27: 40} as const;

export const Clock: React.FC<ClockProps> = ({
  t, minutes = 8 * 60 + 20, dateRot = 0, dateLabels, gearsOn = 1, gearSpeed = 1, stopped = false, red = 0, dialChildren, bezelOpacity = 1,
  timeline = null, engrave = 1, handsOpacity = 1, marker9 = 0, strip, outerOpacity = 1,
}) => {
  const gearT = stopped ? 0 : t * gearSpeed;
  const mAng = (minutes % 60) * 6;
  const hAng = ((minutes / 60) % 12) * 30;
  const labels = dateLabels ?? [
    {deg: DATE_DEG[25], text: '25 AĞUSTOS'},
    {deg: DATE_DEG[26], text: '26 AĞUSTOS'},
    {deg: DATE_DEG[27], text: '27 AĞUSTOS', hot: true},
  ];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* arka mekanizma: dişliler (yalnızca saatin kendi hareketi; olaylara neden olmaz) */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}} opacity={gearsOn * outerOpacity}>
        <defs>
          <radialGradient id="gear-g" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor={C.brassLight} />
            <stop offset="1" stopColor={C.brassDark} />
          </radialGradient>
        </defs>
        {[
          {x: CX - 520, y: CY - 300, r: 150, n: 24, s: 1},
          {x: CX + 540, y: CY + 260, r: 190, n: 30, s: -0.8},
          {x: CX + 470, y: CY - 360, r: 95, n: 16, s: 1.5},
          {x: CX - 470, y: CY + 380, r: 120, n: 20, s: -1.2},
        ].map((g, i) => (
          <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${gearT * 6 * g.s})`} opacity={0.55}>
            <path d={gearPath(g.r, g.n)} fill="url(#gear-g)" stroke={C.brassDark} strokeWidth={2} />
            <circle r={g.r * 0.62} fill="none" stroke={C.brassDark} strokeWidth={3} />
            {Array.from({length: 5}, (_, k) => (
              <rect key={k} x={-5} y={-g.r * 0.6} width={10} height={g.r * 0.6} fill={C.brassDark} transform={`rotate(${k * 72})`} />
            ))}
            <circle r={g.r * 0.12} fill={C.brassDark} />
          </g>
        ))}
      </svg>

      {/* kadran penceresi: liman */}
      <div style={{position: 'absolute', left: CX - R_DIAL, top: CY - R_DIAL, width: R_DIAL * 2, height: R_DIAL * 2, borderRadius: '50%', overflow: 'hidden', background: C.night}}>
        {dialChildren}
      </div>

      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="bezel-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D3B07A" />
            <stop offset="0.35" stopColor={C.brass} />
            <stop offset="0.7" stopColor={C.brassDark} />
            <stop offset="1" stopColor="#8E6D3E" />
          </linearGradient>
          <radialGradient id="bezel-shade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
          <path id="ringpath" d={`M ${CX} ${CY - R_RING} a ${R_RING} ${R_RING} 0 1 1 -0.01 0`} />
        </defs>
        <g opacity={bezelOpacity}>
          {/* bezel */}
          <circle cx={CX} cy={CY} r={(R_BEZEL + R_DIAL) / 2 + 2} fill="none" stroke="url(#bezel-g)" strokeWidth={R_BEZEL - R_DIAL + 4} />
          <circle cx={CX} cy={CY} r={R_DIAL} fill="none" stroke="#3E2F1A" strokeWidth={5} />
          <circle cx={CX} cy={CY} r={R_BEZEL} fill="none" stroke="#5E4728" strokeWidth={3} />
          {/* gravür halkaları (konum bölümünde kıyı çizgisine dönüşür) */}
          <g opacity={engrave * 0.6} stroke="#5E4728" fill="none">
            {Array.from({length: 9}, (_, i) => (
              <circle key={i} cx={CX} cy={CY} r={R_DIAL + 8 + i * 7} strokeWidth={0.8} />
            ))}
          </g>
          {/* dakika işaretleri */}
          {Array.from({length: 60}, (_, i) => {
            const big = i % 5 === 0;
            const [x0, y0] = polar(R_BEZEL - 6, i * 6);
            const [x1, y1] = polar(R_BEZEL - (big ? 34 : 18), i * 6);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={big ? C.ink : '#3A2C18'} strokeWidth={big ? 5 : 2} />;
          })}
          {[12, 3, 6, 9].map((n) => {
            const [x, y] = polar(R_BEZEL - 56, n * 30);
            return (
              <text key={n} x={x} y={y + 14} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={800} fontSize={40} fill={C.ink}>
                {n}
              </text>
            );
          })}
          {/* 09.00 işareti */}
          {marker9 > 0 && (
            <g opacity={marker9}>
              {(() => {
                const [x, y] = polar(R_BEZEL + 4, 270);
                return (
                  <g>
                    <circle cx={x} cy={y} r={20 + 6 * marker9} fill={C.danger} />
                    <circle cx={x} cy={y} r={34 + 10 * marker9} fill="none" stroke={C.danger} strokeWidth={2} opacity={0.6} />
                  </g>
                );
              })()}
            </g>
          )}
          <circle cx={CX} cy={CY} r={R_BEZEL + 4} fill="url(#bezel-shade)" />
        </g>

        {/* tarih halkası */}
        <g opacity={outerOpacity}>
          <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke={C.brass} strokeWidth={1.5} opacity={0.6} />
          <circle cx={CX} cy={CY} r={R_RING + 44} fill="none" stroke={C.brass} strokeWidth={1} opacity={0.35} strokeDasharray="2 10" />
          {!timeline && (
            <g transform={`rotate(${dateRot} ${CX} ${CY})`}>
              {labels.map((l, i) => {
                const [x, y] = polar(R_RING + 22, l.deg);
                return (
                  <g key={i} transform={`translate(${x} ${y}) rotate(${l.deg})`}>
                    <text textAnchor="middle" y={10} fontFamily={FONT_LABEL} fontWeight={700} fontSize={26} letterSpacing={3} fill={l.hot && red > 0.3 ? C.danger : C.ivory}>
                      {l.text}
                    </text>
                  </g>
                );
              })}
              {Array.from({length: 36}, (_, i) => {
                const [x0, y0] = polar(R_RING - 4, i * 10);
                const [x1, y1] = polar(R_RING + 4, i * 10);
                return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.brass} strokeWidth={2} />;
              })}
            </g>
          )}
          {!timeline && (
            <g>
              <polygon points={`${CX - 12},${CY - R_RING - 58} ${CX + 12},${CY - R_RING - 58} ${CX},${CY - R_RING - 40}`} fill={red > 0.3 ? C.danger : C.brass} />
            </g>
          )}
          {timeline && (
            <g>
              {(() => {
                const a0 = timeline.arcFrom, a1 = timeline.arcFrom + (timeline.arcTo - timeline.arcFrom) * timeline.p;
                const [x0, y0] = polar(R_RING, a0);
                const [x1, y1] = polar(R_RING, a1);
                const large = a1 - a0 > 180 ? 1 : 0;
                return timeline.p > 0.001 ? <path d={`M ${x0} ${y0} A ${R_RING} ${R_RING} 0 ${large} 1 ${x1} ${y1}`} fill="none" stroke={C.sand} strokeWidth={8} strokeLinecap="round" /> : null;
              })()}
              {timeline.marks.map((m, i) => {
                const on = timeline.arcFrom + (timeline.arcTo - timeline.arcFrom) * timeline.p >= m.deg - 0.5;
                const [x, y] = polar(R_RING, m.deg);
                const [lx, ly] = polar(R_RING + 50, m.deg);
                return (
                  <g key={i} opacity={on ? 1 : 0.35}>
                    <circle cx={x} cy={y} r={10} fill={on ? C.ivory : C.night} stroke={C.sand} strokeWidth={3} />
                    <text x={lx} y={ly + 12} textAnchor="middle" fontFamily={FONT_LABEL} fontWeight={700} fontSize={30} fill={C.ivory} letterSpacing={1}>
                      {m.text}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </g>

        {strip}

        {/* ibreler: metal çizgi + su yansıması parıltısı */}
        <g opacity={handsOpacity}>
          <g transform={`rotate(${hAng} ${CX} ${CY})`}>
            <polygon points={`${CX - 9},${CY + 40} ${CX + 9},${CY + 40} ${CX + 5},${CY - 230} ${CX},${CY - 252} ${CX - 5},${CY - 230}`} fill="#1E1A14" stroke={C.brassLight} strokeWidth={1.5} />
          </g>
          <g transform={`rotate(${mAng} ${CX} ${CY})`}>
            <polygon points={`${CX - 6},${CY + 56} ${CX + 6},${CY + 56} ${CX + 3.5},${CY - R_BEZEL + 30} ${CX},${CY - R_BEZEL + 8} ${CX - 3.5},${CY - R_BEZEL + 30}`} fill="#26211A" stroke={C.brassLight} strokeWidth={1.5} />
            <line x1={CX + 1} y1={CY - 40} x2={CX + 1} y2={CY - R_BEZEL + 40} stroke="#F7E7C6" strokeWidth={1.4} opacity={0.35 + 0.35 * Math.sin(t * 2.1) ** 2} />
          </g>
          <circle cx={CX} cy={CY} r={18} fill={C.brass} stroke="#3E2F1A" strokeWidth={3} />
          <circle cx={CX} cy={CY} r={6} fill="#1E1A14" />
        </g>
      </svg>
    </div>
  );
};

export {polar};
export const seedJitter = (i: number) => rand(i);
export const clamp01 = clamp;
