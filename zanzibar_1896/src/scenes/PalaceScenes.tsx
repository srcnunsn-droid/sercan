// Britanya etkisi (58–82 sn) ve taht anlaşmazlığı (82–132 sn): saray katmanları, kesit, taht ve portre çerçeveleri.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT_LABEL, FONT_TITLE, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {Harbor} from '../components/Harbor';
import {DateCard, Label, Title} from '../components/Base';
import {Portrait, ThroneRoom} from '../components/Throne';
import {S, E} from '../timeline';
import {Support} from './Opening';

const CAM_PALACE = {x: 1640, y: 470, z: 1.32};

/** basit ok/bağlantı çizgisi (ekran koordinatı) */
export const Link: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color?: string; dash?: boolean; label?: string; broken?: number}> = ({x1, y1, x2, y2, p, color = C.brass, dash, label, broken = 0}) => {
  if (p <= 0) return null;
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {broken > 0 ? (
        <g>
          <line x1={x1} y1={y1} x2={mx - 18 - broken * 20} y2={my - broken * 14} stroke={color} strokeWidth={5} />
          <line x1={mx + 18 + broken * 20} y1={my + broken * 14} x2={x2} y2={y2} stroke={color} strokeWidth={5} />
        </g>
      ) : (
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={5} strokeDasharray={dash ? '14 10' : undefined} />
      )}
      {p >= 1 && broken === 0 && <polygon points={`${x2},${y2} ${x2 - 16},${y2 - 9} ${x2 - 16},${y2 + 9}`} fill={color} transform={`rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI} ${x2} ${y2})`} />}
      {label && <text x={mx} y={my - 18} textAnchor="middle" fontFamily={FONT_LABEL} fontWeight={700} fontSize={26} letterSpacing={2} fill={color} style={{paintOrder: 'stroke'}} stroke={C.nightDeep} strokeWidth={6} opacity={clamp(p * 2)}>{label}</text>}
    </svg>
  );
};

const Chip: React.FC<{x: number; y: number; text: string; o: number; color?: string; fill?: string; size?: number}> = ({x, y, text, o, color = C.ivory, fill = 'rgba(10,28,39,0.85)', size = 30}) =>
  o <= 0.001 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.95 + 0.05 * o})`, opacity: clamp(o * 1.3), padding: '10px 22px', background: fill, border: `2px solid ${color}`, fontFamily: FONT_LABEL, fontWeight: 800, fontSize: size, letterSpacing: 2.5, color, whiteSpace: 'nowrap', width: 'max-content'}}>
      {text}
    </div>
  );

export const Etki: React.FC<{t: number}> = ({t}) => {
  const rise = prog(t, S('s12') - 1.0, S('s12') + 1.4, easeOut);
  const ghost = prog(t, S('s12') + 2.0, S('s12') + 3.4);
  const cam = {x: CAM_PALACE.x + (1 - rise) * 0, y: CAM_PALACE.y, z: CAM_PALACE.z};
  const out = prog(t, E('s16') + 0.2, E('s16') + 0.9);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{perspective: 1500, perspectiveOrigin: '50% 100%'}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 78%', transform: `rotateX(${(1 - rise) * 80}deg)`, opacity: clamp(rise * 1.5)}}>
          <Harbor t={t} cam={cam} palaceGhost={ghost} fleetVisible={false} glasgowOn={false} />
        </div>
      </AbsoluteFill>
      <Label x={905} y={235} text="Sultan" sub="unvan ve saray" o={window(t, S('s12') + 0.6, E('s16') + 0.4, 0.5, 0.5)} size={34} tick="down" tickLen={60} align="center" />
      <Label x={1460} y={210} text="Britanya etkisi" sub="yönetim üzerinde" o={window(t, S('s12') + 2.4, E('s16') + 0.4, 0.5, 0.5) * ghost} size={34} accent={C.deepSoft} tick="left" tickLen={60} />
      {/* Sultan Hamad: 1893 */}
      <div style={{position: 'absolute', left: 140, top: 250}}>
        <Portrait name="Sultan Hamad bin Thuwaini" sub="1893'te Britanya'nın desteğiyle tahta çıktı" o={window(t, S('s13') + 0.2, E('s16') + 0.4, 0.6, 0.5)} />
      </div>
      <DateCard x={290} y={170} main="1893" o={window(t, S('s13') + 0.4, E('s13') + 0.6, 0.5, 0.5)} scale={0.8} />
      <Label x={290} y={800} width={420} text="Kaynaklara göre" sub="Britanya'nın bölgedeki üstünlüğünü kabul etmesi bir nedendi" o={window(t, S('s14') + 0.3, E('s14') + 0.6, 0.5, 0.5)} size={24} align="center" />
      <Label x={290} y={800} text="Saltanat: yaklaşık 3 yıl" o={window(t, E('s14') + 0.7, E('s16') + 0.3, 0.5, 0.5)} size={24} align="center" />
      {/* taht = düzenin devamı */}
      <Link x1={1700} y1={880} x2={1050} y2={880} p={prog(t, S('s16') + 0.8, S('s16') + 2.0)} color={C.deepSoft} label="ONAY" />
      <Chip x={1760} y={880} text="BRİTANYA" o={window(t, S('s16') + 0.4, E('s16') + 0.4, 0.4, 0.5)} color="#7FB4B8" />
      <Chip x={920} y={880} text="TAHT" o={window(t, S('s16') + 1.6, E('s16') + 0.4, 0.4, 0.5)} color={C.brassLight} />
      <Title x={960} y={990} text="Tahtın sahibi = düzenin devamı" size={46} o={window(t, S('s16') + 2.6, E('s16') + 0.4, 0.5, 0.5)} />
      <AbsoluteFill style={{background: C.nightDeep, opacity: out}} />
    </AbsoluteFill>
  );
};

export const Taht: React.FC<{t: number}> = ({t}) => {
  // saray cephesi → çatı kalkar → taht odası
  const lift = prog(t, S('s20') - 0.2, S('s20') + 1.6, easeIO);
  const push = prog(t, S('s20') + 0.6, S('s20') + 2.4, easeIO);
  const roomIn = prog(t, S('s20') + 1.2, S('s20') + 2.4);
  const cam = {x: interp(push, [0, 1], [1640, 1610]), y: interp(push, [0, 1], [470, 520]), z: interp(push, [0, 1], [1.32, 2.6])};
  const inn = prog(t, 82.0, 82.8);
  const hamadO = window(t, 82.1, S('s20') + 0.4, 0.6, 0.6);
  const khalidName = prog(t, S('s20') + 2.0, S('s20') + 2.8);
  const crowd = prog(t, S('s23') + 4.0, S('s23') + 6.0);
  const persons = 1 - prog(t, S('s24') + 0.2, S('s24') + 1.2);
  const mech = window(t, S('s25') - 0.1, E('s26') + 0.6, 0.5, 0.6);
  const broken = prog(t, S('s25') + 3.0, S('s25') + 3.8);
  return (
    <AbsoluteFill style={{opacity: inn}}>
      <Harbor t={t} cam={cam} roofLift={lift} fleetVisible={false} glasgowOn={false} fogTop={roomIn * 0.65} />
      <Support t={t} a={82.0} b={86.2} clipFrom={8.0} still="hf/img1_palace.png" o={1 - prog(t, 85.6, 86.2)} push={0.03} />
      <DateCard x={300} y={120} top="SALI" main="25 AĞUSTOS 1896" o={window(t, 82.2, E('s18') + 0.4, 0.5, 0.5)} scale={0.8} />
      <div style={{position: 'absolute', left: 1340, top: 230}}>
        <Portrait name="Sultan Hamad" sub="25 Ağustos 1896'da öldü" o={hamadO} dim={prog(t, S('s17') + 1.0, S('s17') + 2.2)} ribbon={prog(t, S('s17') + 1.4, S('s17') + 2.4)} />
      </div>
      <div style={{position: 'absolute', left: 1490, top: 480, transform: `translate(-50%,-50%) rotate(-8deg) scale(${0.9 + 0.1 * prog(t, S('s18') + 1.8, S('s18') + 2.2, easeOut)})`, opacity: window(t, S('s18') + 1.8, S('s20') + 0.3, 0.2, 0.4), border: `4px solid ${C.danger}`, padding: '10px 22px', color: C.danger, fontFamily: FONT_LABEL, fontWeight: 900, fontSize: 30, letterSpacing: 3, background: 'rgba(10,28,39,0.8)', textAlign: 'center', width: 'max-content'}}>
        ZEHİRLENME İDDİASI
        <br />
        KANITLANMADI
      </div>
      {/* taht odası */}
      <div style={{position: 'absolute', left: 960, top: 560, transform: `translate(-50%,-50%) scale(${0.86 + 0.06 * roomIn})`, opacity: roomIn}}>
        <ThroneRoom name="KHALID BİN BARGHASH" o={1} glow={khalidName} swap={1 - khalidName} nameNext="" />
        {/* sarayda destekçi kalabalık (yüzsüz siluetler) */}
        <svg width={860} height={420} style={{position: 'absolute', left: 0, top: 0}} opacity={crowd * persons}>
          {Array.from({length: 26}, (_, i) => {
            const x = 30 + i * 31 + (i % 2) * 8;
            if (x > 300 && x < 560) return null;
            const y = 360 + (i % 3) * 8;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle cy={-34} r={9} fill="#0B1820" />
                <path d="M -13 0 q 0 -24 13 -24 q 13 0 13 24 z" fill="#0B1820" />
              </g>
            );
          })}
        </svg>
      </div>
      <Label x={960} y={150} text="Onay olmadan tahta geçti" o={window(t, S('s20') + 2.6, E('s20') + 0.6, 0.4, 0.5) * persons} size={32} align="center" accent={C.danger} />
      {/* Hamoud: Britanya'nın adayı, ayrı çerçevede */}
      <div style={{position: 'absolute', left: 1520, top: 250}}>
        <Portrait name="Hamoud bin Muhammed" sub="Britanya'nın desteklediği aday" o={window(t, S('s21') + 0.2, E('s23') + 0.6, 0.6, 0.6) * persons} accent="#7FB4B8" size={0.92} />
      </div>
      <Label x={300} y={330} width={420} text="Britanya'ya göre" sub="fazla bağımsız davranan biri" o={window(t, S('s22') + 0.2, E('s23') + 0.6, 0.5, 0.5) * persons} size={30} align="center" accent={C.deepSoft} />
      <Label x={300} y={560} width={420} text="Destekçilerine göre" sub="bazı anlatılara göre Avrupa müdahalesine karşı direnişin simgesi" o={window(t, S('s23') + 0.6, E('s23') + 0.6, 0.5, 0.5) * persons} size={30} align="center" accent={C.danger} />
      {/* kişiler → yetki */}
      <AbsoluteFill style={{background: C.nightDeep, opacity: mech * 0.72}} />
      <Title x={960} y={170} text={'Mesele: kişiler değil, yetki'} size={64} o={window(t, S('s24') + 0.4, S('s25') + 0.2, 0.5, 0.4)} />
      {mech > 0 && (
        <AbsoluteFill style={{opacity: mech}}>
          <Chip x={500} y={540} text="BRİTANYA ONAYI" o={1} color="#7FB4B8" size={34} />
          <Chip x={1420} y={540} text="TAHT" o={1} color={C.brassLight} size={34} />
          <Link x1={740} y1={540} x2={1320} y2={540} p={prog(t, S('s25') + 0.3, S('s25') + 1.6)} color={broken > 0 ? C.danger : C.brassLight} broken={broken} label={broken > 0 ? 'ONAYSIZ GEÇİŞ' : 'ONAY MEKANİZMASI'} />
          <Label x={960} y={700} width={1100} text="Kabul edilirse" sub="himaye düzeninin dayandığı onay anlamını yitirir" o={prog(t, S('s25') + 3.4, S('s25') + 4.2)} size={32} align="center" accent={C.danger} />
        </AbsoluteFill>
      )}
      <Title x={960} y={880} text="Tahta kim karar verecek?" size={78} o={window(t, S('s26') + 0.3, E('s26') + 0.8, 0.5, 0.6)} color={C.ivory} />
    </AbsoluteFill>
  );
};
