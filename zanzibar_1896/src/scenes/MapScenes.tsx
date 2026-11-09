// 26 – 60 sn: Saatin gravür çizgileri → Doğu Afrika kıyısı → Zanzibar → Avrupa başkentleri ve nüfuz alanları → limana geri dönüş.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT_LABEL, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {Clock, CX, CY, DATE_DEG, R_DIAL} from '../components/Clock';
import {GeoMap, MapCam, MapLabel, P, ll, toScreen} from '../components/GeoMap';
import {DateCard, Label, Title} from '../components/Base';
import {DialTopDown} from './Opening';
import {S, E} from '../timeline';

const ZT = P.zanzibarTown;
const UNG = P.unguja;
const WIDE = {x: -1900, y: -4300, z: 0.093};
const REGION = {x: 960, y: 520, z: 1};
const EA = {x: 840, y: 340, z: 0.42};
const ISLAND = {x: UNG[0] - 6, y: UNG[1] + 4, z: 4.2};

const lerpCam = (a: MapCam, b: MapCam, k: number): MapCam => {
  // zoom'u logaritmik uzayda karıştır (kamera hareketi doğal görünür)
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * k);
  // merkez, ekrandaki sabit noktayı koruyacak biçimde: basit yaklaşım
  const w = (1 / z - 1 / a.z) / (1 / b.z - 1 / a.z || 1);
  const ww = isFinite(w) ? clamp(w) : k;
  return {x: a.x + (b.x - a.x) * ww, y: a.y + (b.y - a.y) * ww, z};
};

const camAt = (t: number): MapCam => {
  const keys: [number, MapCam][] = [
    [26.0, REGION],
    [S('s07') + 0.2, REGION],
    [S('s07') + 2.6, {x: UNG[0] - 10, y: UNG[1], z: 2.2}],
    [S('s08') + 0.3, {x: UNG[0] - 10, y: UNG[1], z: 2.2}],
    [E('s08') + 0.1, WIDE],
    [S('s09') + 2.4, WIDE],
    [S('s09') + 4.6, EA],
    [S('s10') + 4.0, EA],
    [S('s11') + 1.2, WIDE],
    [S('s11') + 3.4, WIDE],
    [S('s12') - 0.4, ISLAND],
    [62, ISLAND],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, ca] = keys[i];
    const [tb, cb] = keys[i + 1];
    if (t <= tb) return lerpCam(ca, cb, easeIO(clamp((t - ta) / (tb - ta))));
  }
  return keys[keys.length - 1][1];
};

const Pulse: React.FC<{a: [number, number]; b: [number, number]; t: number; o: number; color: string; bend?: number; dash?: boolean; speed?: number}> = ({a, b, t, o, color, bend = 0.25, dash = true, speed = 0.5}) => {
  if (o <= 0) return null;
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend;
  const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const k = (t * speed) % 1;
  const px = (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * mx + k * k * b[0];
  const py = (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * my + k * k * b[1];
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeDasharray={dash ? '12 10' : undefined} vectorEffect="non-scaling-stroke" />
      <circle cx={px} cy={py} r={9} fill={color} />
    </g>
  );
};

export const MapScenes: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t);
  // saat → harita geçişi
  const clockFade = prog(t, 26.2, 27.8);
  const dialShrink = prog(t, 26.0, 28.2, easeIO);
  const draw = prog(t, 26.4, 29.4, easeIO);
  const fill = prog(t, 27.6, 29.0);
  const wide = prog(t, E('s08') - 2.2, E('s08') - 0.2) * (1 - prog(t, S('s09') + 2.6, S('s09') + 4.2)) + prog(t, S('s11') - 0.6, S('s11') + 1.0) * (1 - prog(t, S('s11') + 3.6, S('s11') + 5.0));
  const spheres = window(t, S('s09') + 3.6, E('s10') + 0.3, 0.8, 0.8);
  const tanz = window(t, S('s06') + 3.0, S('s07') + 1.0, 0.6, 0.6);
  const glow = prog(t, S('s07'), S('s07') + 1.0) * (1 - prog(t, S('s08') + 1.0, S('s08') + 2.0)) + prog(t, S('s12') - 2, S('s12'));
  // liman yükselişi (Etki bölümüne geçiş) – harita eğilir
  const rise = prog(t, S('s12') - 1.0, S('s12') + 1.4, easeIO);

  const zt = toScreen(ZT, cam);
  const ung = toScreen(UNG, cam);
  const lon = toScreen(P.london, cam);
  const ber = toScreen(P.berlin, cam);

  return (
    <AbsoluteFill style={{background: C.night}}>
      <AbsoluteFill style={{perspective: 1600, perspectiveOrigin: '50% 20%'}}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 50%', transform: `rotateX(${rise * 64}deg) translateY(${rise * 120}px)`, opacity: 1 - rise * 0.7}}>
          <GeoMap cam={cam} draw={draw} fill={fill} wide={wide} tanzania={tanz} spheres={spheres} islandGlow={glow} graticule={0.6 * fill}>
            <Pulse a={P.london} b={ZT} t={t} o={window(t, S('s09') + 0.4, S('s09') + 3.0, 0.5, 0.4) + window(t, S('s11') + 0.6, S('s11') + 5.0, 0.6, 0.6)} color={C.ivory} bend={0.18} />
            <Pulse a={P.berlin} b={ZT} t={t + 0.4} o={window(t, S('s09') + 0.8, S('s09') + 3.0, 0.5, 0.4) + window(t, S('s11') + 0.9, S('s11') + 5.0, 0.6, 0.6)} color={C.danger} bend={0.22} />
          </GeoMap>
        </div>
      </AbsoluteFill>

      {/* saat: gravür halkaları kıyı çizgisine dönüşürken söner, kadran Zanzibar'a küçülür */}
      {clockFade < 1 && (
        <AbsoluteFill style={{opacity: 1 - clockFade}}>
          <Clock t={t} minutes={8 * 60 + 52} stopped dateRot={-DATE_DEG[25]} red={0} engrave={1 - draw} dialChildren={null} gearsOn={1 - clockFade} />
        </AbsoluteFill>
      )}
      {dialShrink < 1 && (
        <div style={{position: 'absolute', left: CX - R_DIAL, top: CY - R_DIAL, width: R_DIAL * 2, height: R_DIAL * 2, borderRadius: '50%', overflow: 'hidden', transformOrigin: '50% 50%',
          transform: `translate(${(zt[0] - CX) * dialShrink}px, ${(zt[1] - CY) * dialShrink}px) scale(${1 - dialShrink * 0.985})`}}>
          <DialTopDown t={t} />
        </div>
      )}

      {/* etiketler: konum */}
      <MapLabel x={toScreen([660, 760], cam)[0]} y={toScreen([660, 760], cam)[1]} text="DOĞU AFRİKA" o={window(t, 28.4, S('s08') + 0.8, 0.6, 0.5) * (1 - wide)} size={36} color={C.night} />
      <MapLabel x={toScreen([1420, 640], cam)[0]} y={toScreen([1420, 640], cam)[1]} text="HİNT OKYANUSU" o={window(t, 28.8, S('s08') + 0.8, 0.6, 0.5) * (1 - wide)} size={30} italic color={C.sand} />
      <Label x={ung[0] + 70} y={ung[1] - 6} text="Zanzibar" sub="Unguja ve Pemba adaları" o={window(t, 29.0, S('s08') + 1.2, 0.5, 0.5) * (1 - wide)} size={34} tick="left" tickLen={46} />
      <Label x={toScreen(P.pemba, cam)[0] + 50} y={toScreen(P.pemba, cam)[1]} text="Pemba" o={window(t, 29.6, S('s07') + 0.3, 0.5, 0.5)} size={22} tick="left" tickLen={24} />
      <Label x={toScreen([700, 520], cam)[0]} y={toScreen([700, 520], cam)[1]} text="Bugün: Tanzanya" sub="kesikli çizgi: bugünkü sınır" o={tanz} size={28} align="center" />
      <DateCard x={zt[0] - 330} y={zt[1] - 150} top="1890'DAN BERİ" main="BRİTANYA HİMAYESİ" o={window(t, S('s07') + 0.3, E('s07') + 1.6, 0.5, 0.6)} />
      <Title x={960} y={150} text="Afrika'da nüfuz yarışı" size={64} o={window(t, S('s08') + 1.4, E('s08') + 0.3, 0.6, 0.5)} />

      {/* nüfuz: başkentler ve anlaşma */}
      <Label x={lon[0] - 18} y={lon[1]} text="Londra" o={window(t, S('s09') - 0.4, S('s09') + 3.4, 0.5, 0.5) + window(t, S('s11') + 0.4, S('s11') + 5.0, 0.5, 0.5)} size={30} align="right" tick="right" tickLen={14} />
      <Label x={ber[0] + 18} y={ber[1] + 4} text="Berlin" o={window(t, S('s09') - 0.2, S('s09') + 3.4, 0.5, 0.5) + window(t, S('s11') + 0.5, S('s11') + 5.0, 0.5, 0.5)} size={30} tick="left" tickLen={14} accent={C.danger} />
      <DateCard x={960} y={110} top="1890" main="BRİTANYA–ALMANYA ANLAŞMASI" o={window(t, S('s09') + 0.6, E('s10') + 0.2, 0.5, 0.6)} scale={0.86} />
      {/* nüfuz alanları (yaklaşık) */}
      <Label x={toScreen(ll(37.6, 1.2), cam)[0]} y={toScreen(ll(37.6, 1.2), cam)[1]} text="Britanya nüfuz alanı" o={spheres} size={30} align="center" accent={C.deep} />
      <Label x={toScreen(ll(34.4, -6.6), cam)[0]} y={toScreen(ll(34.4, -6.6), cam)[1]} text="Alman nüfuz alanı" o={spheres} size={30} align="center" />
      <Label x={960} y={1010} text="Yaklaşık alanlar · bugünkü sınırlar üzerinde gösterilmiştir" o={spheres * 0.9} size={20} align="center" color={C.sand} />
      <Label x={ung[0] + 60} y={ung[1] + 70} text="Himaye Almanya tarafından tanındı" o={window(t, S('s10') + 0.6, E('s10') + 0.4, 0.5, 0.5)} size={28} tick="left" tickLen={40} accent={C.ivory} />
      <Title x={960} y={950} text="Pazarlık Avrupa başkentlerinde" size={58} o={window(t, S('s11') + 1.0, E('s11') - 0.3, 0.6, 0.6)} />
      <Label x={960} y={1040} text="Harita verisi: Natural Earth" o={fill * (1 - rise) * 0.6} size={16} align="center" color={C.sand} />
    </AbsoluteFill>
  );
};
