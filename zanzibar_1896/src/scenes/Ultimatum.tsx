// Ültimatom (132–189 sn) ve güç farkı (189–232 sn).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT_LABEL, FONT_TITLE, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {Harbor, PALACE} from '../components/Harbor';
import {Clock, CX, CY, DATE_DEG, R_BEZEL, R_DIAL} from '../components/Clock';
import {TopDown, TD_GLASGOW, TD_PALACE, TD_SHIPS} from '../components/TopDown';
import {DateCard, Label, Title} from '../components/Base';
import {DialHarbor} from './Opening';
import {Link} from './PalaceScenes';
import {S, E} from '../timeline';

export const Chip: React.FC<{x: number; y: number; text: string; o: number; color?: string; size?: number; sub?: string}> = ({x, y, text, o, color = C.ivory, size = 28, sub}) =>
  o <= 0.001 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.95 + 0.05 * o})`, opacity: clamp(o * 1.3), padding: '10px 22px', background: 'rgba(10,28,39,0.86)', border: `2px solid ${color}`, fontFamily: FONT_LABEL, color, whiteSpace: 'nowrap', width: 'max-content', textAlign: 'center'}}>
      <div style={{fontWeight: 800, fontSize: size, letterSpacing: 2.5}}>{text}</div>
      {sub && <div style={{fontWeight: 500, fontSize: size * 0.72, color: C.sand, marginTop: 4}}>{sub}</div>}
    </div>
  );

// harbor dünya → ekran
const W2S = (wx: number, wy: number, cam: {x: number; y: number; z: number}) => [960 + (wx - cam.x) * cam.z, 540 + (wy - cam.y) * cam.z];
const CONSULATE = {x: 760, y: 612};
const DIAL_CAM = {x: 1150, y: 600, z: 1};
const DIAL_S = 0.62;

/** Ültimatom şeridi: kadrandan geçer, halka boyunca sarılır, 09.00 işaretinde durur. Belgenin kopyası değildir. */
const Strip: React.FC<{p: number; t: number; red: number}> = ({p, t, red}) => {
  const R = R_BEZEL + 32;
  const y0 = CY + 26;
  const xr = CX + Math.sqrt(R * R - (y0 - CY) ** 2);
  const startAng = Math.atan2(y0 - CY, xr - CX);
  // düz kısım + saat yönünde yay (3 → 6 → 9)
  const d = `M -80 ${y0} L ${xr} ${y0} A ${R} ${R} 0 0 1 ${CX} ${CY + R} A ${R} ${R} 0 0 1 ${CX - R} ${CY}`;
  const L = xr + 80 + R * (Math.PI - startAng);
  const shown = L * p;
  const text = '27 AĞUSTOS 1896 · SAAT 09.00 · ';
  return (
    <g>
      <defs>
        <path id="strip-path" d={d} />
      </defs>
      <path d={d} fill="none" stroke={C.nightDeep} strokeWidth={52} strokeDasharray={`${shown} ${L + 100}`} opacity={0.92} />
      <path d={d} fill="none" stroke={red > 0.5 ? C.danger : C.brass} strokeWidth={54} strokeDasharray={`${shown} ${L + 100}`} opacity={0.9} style={{mixBlendMode: 'normal'}} strokeOpacity={0.0} />
      <path d={d} fill="none" stroke={red > 0.5 ? C.danger : C.brass} strokeWidth={2} strokeDasharray={`${shown} ${L + 100}`} transform="translate(0 -25)" opacity={0} />
      <mask id="strip-mask" maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}>
        <path d={d} fill="none" stroke="white" strokeWidth={56} strokeDasharray={`${shown} ${L + 100}`} />
      </mask>
      <g mask="url(#strip-mask)">
        <path d={d} fill="none" stroke={red > 0.5 ? '#3A1712' : '#1A2E38'} strokeWidth={52} />
        <path d={d} fill="none" stroke={red > 0.5 ? C.danger : C.brass} strokeWidth={52} strokeDasharray="2 0" opacity={0.18} />
        <text fontFamily={FONT_LABEL} fontWeight={800} fontSize={25} letterSpacing={4} fill={C.ivory} dy={9}>
          <textPath href="#strip-path" startOffset={-((t * 0) % 100)}>
            {text.repeat(12)}
          </textPath>
        </text>
      </g>
      {/* şerit başı */}
      {p > 0.01 && p < 0.999 && (() => {
        let hx, hy;
        if (shown <= xr + 80) { hx = -80 + shown; hy = y0; } else {
          const a = startAng + (shown - xr - 80) / R;
          hx = CX + R * Math.cos(a); hy = CY + R * Math.sin(a);
        }
        return <circle cx={hx} cy={hy} r={10} fill={C.ivory} />;
      })()}
    </g>
  );
};

export const Ultimatum: React.FC<{t: number}> = ({t}) => {
  const inn = prog(t, 132.0, 132.8);
  const fleet = prog(t, S('s29') - 0.2, S('s29') + 3.6, easeIO);
  const boats = prog(t, S('s30') + 0.2, S('s30') + 6.2, (x) => x);
  const landing = prog(t, S('s29') + 1.4, S('s29') + 4.2);
  // harbor (tam ekran) → kadran: S31 başında
  const toDial = prog(t, S('s31') - 0.8, S('s31') + 0.9, easeIO);
  const cam = {x: interp(toDial, [0, 1], [930, DIAL_CAM.x]), y: interp(toDial, [0, 1], [540, DIAL_CAM.y]), z: 1};
  const clockIn = prog(t, S('s31') + 0.3, S('s31') + 1.9, easeIO);
  const stripP = prog(t, S('s31') + 1.6, E('s36') - 1.0, (x) => x * (2 - x) * 0.25 + x * 0.75);
  const atNine = prog(t, E('s36') - 1.0, E('s36') - 0.6);
  const minutes = 8 * 60 + 15 + 43 * prog(t, S('s31') + 1.0, E('s36') - 1.0, (x) => x);
  const gearSlow = 1 - prog(t, E('s36') - 1.2, E('s36') + 0.6);
  const red = prog(t, S('s32'), S('s32') + 2) * 0.5 + atNine * 0.5;
  const [cx1, cy1] = W2S(CONSULATE.x + 40, CONSULATE.y - 40, cam);
  const [px1, py1] = W2S(PALACE.x + 120, PALACE.y - 120, cam);
  const linkRed = prog(t, S('s28') + 0.4, S('s28') + 1.4);
  const consul = (
    <g>
      <rect x={CONSULATE.x} y={CONSULATE.y - 58} width={92} height={60} fill="#EDE3CF" stroke="#8C7A5C" strokeWidth={2} />
      <rect x={CONSULATE.x - 4} y={CONSULATE.y - 64} width={100} height={8} fill="#C9B794" />
      {[0, 1, 2].map((i) => <rect key={i} x={CONSULATE.x + 12 + i * 26} y={CONSULATE.y - 46} width={12} height={18} fill="#3B4E57" />)}
      {/* karaya çıkan birlikler: kıyıya giden filikalar */}
      {landing > 0 && [0, 1, 2].map((i) => {
        const k = clamp(landing * 1.3 - i * 0.15);
        const x = 520 + i * 160 + (CONSULATE.x - 40 - (520 + i * 160)) * k;
        const y = 760 - i * 20 + (CONSULATE.y + 14 - (760 - i * 20)) * k;
        return <path key={i} d={`M ${x - 18} ${y} q 18 9 36 0 l -4 -6 h -28 z`} fill="#EEE7D8" opacity={k < 1 ? 1 : 0.8} />;
      })}
    </g>
  );
  return (
    <AbsoluteFill style={{opacity: inn}}>
      {/* tam ekran liman */}
      {clockIn < 1 && (
        <AbsoluteFill style={{transform: `scale(${interp(toDial, [0, 1], [1, 1])})`}}>
          <Harbor t={t} cam={cam} fleetOn={fleet} boats={boats} extraWorld={consul} sky="dawn" />
        </AbsoluteFill>
      )}
      {/* tam saat görünümü #2 */}
      {clockIn > 0 && (
        <AbsoluteFill>
          <AbsoluteFill style={{background: C.nightDeep, opacity: clockIn}} />
          <div style={{position: 'absolute', inset: 0, transform: `scale(${interp(clockIn, [0, 1], [1 / DIAL_S, 1])})`, transformOrigin: `${CX}px ${CY}px`, opacity: prog(t, S('s31') + 0.3, S('s31') + 0.6)}}>
            <Clock t={t} minutes={minutes} dateRot={-DATE_DEG[27]} red={red} gearSpeed={gearSlow} marker9={atNine} handsOpacity={prog(t, S('s31') + 1.2, S('s31') + 2.0)}
              dialChildren={<DialHarbor t={t} cam={DIAL_CAM} boats={1} />}
              strip={<Strip p={stripP} t={t} red={atNine} />} />
          </div>
          <AbsoluteFill style={{background: C.danger, mixBlendMode: 'multiply', opacity: atNine * 0.18}} />
        </AbsoluteFill>
      )}

      {/* etiketler */}
      <Label x={cx1 - 10} y={cy1 - 70} text="Britanya konsolosluğu" o={window(t, S('s27') + 0.4, E('s28') + 0.6, 0.5, 0.5)} size={28} tick="down" tickLen={36} align="center" />
      <Link x1={cx1 + 30} y1={cy1 - 10} x2={px1 - 20} y2={py1 + 30} p={prog(t, S('s27') + 2.6, S('s27') + 4.0) * (1 - prog(t, E('s28') + 0.4, E('s28') + 1.0))} color={linkRed > 0.5 ? C.danger : C.ivory} dash label={linkRed > 0.5 ? 'ASKERÎ TEHDİT' : 'DİPLOMASİ'} />
      <Chip x={600} y={170} text="SİYASİ BASKI → ASKERÎ TEHDİT" o={window(t, S('s28') + 0.8, E('s28') + 0.5, 0.4, 0.5)} color={C.danger} />
      <Label x={W2S(CONSULATE.x - 120, 690, cam)[0]} y={W2S(CONSULATE.x - 120, 690, cam)[1] + 40} text="Kıyıya denizciler ve deniz piyadeleri" o={window(t, S('s29') + 2.0, E('s29') + 0.5, 0.5, 0.5)} size={26} align="center" />
      <Chip x={960} y={160} text="SİVİL TEKNELER LİMANDAN ÇIKARILIYOR" o={window(t, S('s30') + 0.6, S('s30') + 4.0, 0.5, 0.5)} />
      <Title x={960} y={170} text="Liman çatışmaya hazırlanıyor" size={60} o={window(t, S('s30') + 4.2, E('s30') + 0.6, 0.5, 0.5)} />
      <DateCard x={960} y={120} top="SON SÜRE" main="27 AĞUSTOS · 09.00" o={window(t, S('s31') + 2.6, E('s31') + 1.2, 0.5, 0.6)} accent={C.danger} scale={0.82} />
      <Chip x={1590} y={180} text="SÜRE DOLARSA: ATEŞ" o={window(t, S('s32') + 0.3, E('s32') + 0.6, 0.4, 0.5)} color={C.danger} />
      <Chip x={330} y={330} text="SABAH" sub="Khalid görüşme istedi" o={window(t, S('s33') + 0.2, E('s33') + 0.6, 0.4, 0.5)} />
      <Chip x={1590} y={330} text="BRİTANYA" sub="önce ültimatom kabul edilmeli" o={window(t, S('s33') + 2.6, E('s33') + 0.6, 0.4, 0.5)} color="#7FB4B8" />
      <Chip x={1600} y={760} text="SARAYIN YANITI" sub="bayrak indirilmeyecek" o={window(t, S('s34') + 0.3, E('s35') + 0.4, 0.4, 0.5)} color={C.danger} />
      <Label x={1600} y={880} width={460} text="Aktarılan yanıt" sub="Britanya'nın gerçekten ateş açacağına inanılmıyordu" o={window(t, S('s35') + 0.3, E('s35') + 0.5, 0.4, 0.5)} size={24} align="center" />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}} opacity={window(t, S('s34') + 0.2, E('s35') + 0.4, 0.4, 0.5)}>
        <circle cx={960 + (PALACE.x + 372 * PALACE.s + 30 - DIAL_CAM.x) * DIAL_S} cy={540 + (PALACE.y - 330 * PALACE.s - DIAL_CAM.y) * DIAL_S} r={34} fill="none" stroke={C.danger} strokeWidth={4} />
      </svg>
      <Title x={960} y={110} text="Taht tartışması → silahlı çatışma" size={52} o={window(t, S('s36') + 0.6, E('s36') + 0.4, 0.5, 0.4)} />
      <Chip x={250} y={CY - 90} text="09.00" o={atNine * (1 - prog(t, E('s36') + 1.6, E('s36') + 2.2))} color={C.danger} size={40} />
    </AbsoluteFill>
  );
};

/** küçük köşe saati */
const Badge: React.FC<{m: number; red: number; o: number}> = ({m, red, o}) => {
  if (o <= 0) return null;
  const mm = Math.floor(m % 60), hh = Math.floor(m / 60);
  return (
    <div style={{position: 'absolute', right: 70, bottom: 60, opacity: o, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(10,28,39,0.85)', border: `2px solid ${red > 0.5 ? C.danger : C.brass}`, padding: '10px 20px'}}>
      <svg width={56} height={56} viewBox="-30 -30 60 60">
        <circle r={26} fill="none" stroke={red > 0.5 ? C.danger : C.brass} strokeWidth={3} />
        <line x1={0} y1={0} x2={0} y2={-21} stroke={C.ivory} strokeWidth={3} transform={`rotate(${(m % 60) * 6})`} />
        <line x1={0} y1={0} x2={0} y2={-13} stroke={C.ivory} strokeWidth={4} transform={`rotate(${((m / 60) % 12) * 30})`} />
      </svg>
      <div style={{fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 44, color: red > 0.5 ? C.danger : C.ivory}}>{`${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}`}</div>
    </div>
  );
};

export const Power: React.FC<{t: number}> = ({t}) => {
  // kamera dik açıya yükselir: kadrandaki liman eğilir → üstten harita
  const rise = prog(t, S('s37') - 0.6, S('s37') + 1.8, easeIO);
  const td = prog(t, S('s37') + 0.4, S('s37') + 1.8);
  const ships = prog(t, S('s38') + 0.2, S('s38') + 1.2);
  const lines = prog(t, S('s38') + 1.6, S('s38') + 3.6);
  const glas = window(t, S('s39') + 0.2, E('s39') + 0.4, 0.4, 0.5);
  const people = prog(t, S('s40') + 0.4, S('s40') + 2.2) * (1 - prog(t, S('s41') + 0.6, S('s41') + 1.6) * 0.65);
  const guns = prog(t, S('s42') + 0.2, S('s42') + 1.0);
  const cmp = window(t, S('s43') + 0.4, E('s43') + 2.2, 0.5, 0.5);
  const m = 8 * 60 + 58 + prog(t, E('s43') + 1.4, E('s43') + 2.6) * 2;
  const red = prog(t, E('s43') + 2.4, E('s43') + 2.6);
  const out = prog(t, 231.9, 232.3);
  return (
    <AbsoluteFill style={{background: C.nightDeep}}>
      <AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 0%', opacity: 1 - td}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 70%', transform: `rotateX(${rise * 70}deg) scale(${1 + rise * 0.6})`}}>
          <Clock t={t} minutes={8 * 60 + 58} dateRot={-DATE_DEG[27]} red={1} gearSpeed={0} stopped marker9={1} dialChildren={<DialHarbor t={t} cam={DIAL_CAM} boats={1} />} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: td * (1 - out)}}>
        <TopDown t={t} ships={ships > 0 ? 1 : 1} shipHighlight={window(t, S('s38') + 0.2, E('s38') + 0.6, 0.4, 0.5) + cmp * 0.6} labels={prog(t, S('s38') + 0.6, S('s38') + 2.0)} lines={lines * (0.35 + 0.65 * prog(t, S('s41') + 0.4, S('s41') + 1.4)) * (1 - glas * 0.6)} glasgow={1} palaceHighlight={prog(t, S('s42') + 1.8, S('s42') + 2.6)} guns={guns} people={people} />
      </AbsoluteFill>
      <Title x={960} y={92} text="Güç dengesi" size={56} o={window(t, S('s37') + 1.4, E('s37') + 0.8, 0.5, 0.5) * (1 - out)} />
      <Label x={70} y={1040} text="Konumlar şematiktir" o={td * 0.85 * (1 - out)} size={20} color={C.sand} />
      <Label x={TD_GLASGOW.x} y={TD_GLASGOW.y + 110} width={560} text="HHS Glasgow" sub="silahlı kraliyet yatı · yanında birkaç küçük tekne" o={glas} size={32} tick="up" tickLen={40} accent={C.ivory} align="center" />
      <Label x={TD_PALACE.x + TD_PALACE.w / 2} y={150} text="Saray çevresi" sub="bazı kaynaklara göre ~3.000 kişi, ~700'ü asker" o={window(t, S('s40') + 0.8, E('s41') + 0.3, 0.5, 0.5)} size={32} align="center" />
      <Chip x={700} y={330} text="BELİRLEYİCİ: ATEŞ GÜCÜ" o={window(t, S('s41') + 0.4, E('s41') + 0.5, 0.4, 0.5)} color={C.danger} size={32} />
      <Label x={TD_PALACE.x + 140} y={480} text="Kıyı topları" sub="savunmanın dayanağı" o={window(t, S('s42') + 0.4, E('s42') + 0.5, 0.4, 0.5)} size={30} tick="up" tickLen={46} accent={C.danger} />
      <Label x={TD_PALACE.x + TD_PALACE.w / 2} y={150} text="Saray yerinden oynayamaz" o={window(t, S('s42') + 1.8, E('s42') + 0.5, 0.4, 0.5)} size={32} align="center" />
      {cmp > 0 && (
        <AbsoluteFill style={{opacity: cmp}}>
          <Chip x={560} y={930} text="BİR FİLO" sub="5 savaş gemisi" o={1} color="#7FB4B8" size={36} />
          <div style={{position: 'absolute', left: 960, top: 930, transform: 'translate(-50%,-50%)', fontFamily: FONT_TITLE, fontSize: 60, color: C.ivory, fontWeight: 800}}>×</div>
          <Chip x={1360} y={930} text="BİR BİNA VE TOPLARI" sub="saray + kıyı topları" o={1} color={C.danger} size={36} />
        </AbsoluteFill>
      )}
      <Badge m={m} red={red} o={prog(t, S('s38'), S('s38') + 1) * (1 - out)} />
      <AbsoluteFill style={{background: C.danger, mixBlendMode: 'multiply', opacity: red * 0.25 * (1 - out)}} />
    </AbsoluteFill>
  );
};
