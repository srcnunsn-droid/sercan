// Bombardıman (232–266 sn) ve kayıplar (266–291 sn). Hasar durumu ilerler ve sonraki sahnelerde korunur.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {C, FONT_LABEL, FONT_TITLE, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {FLEET, GLASGOW, Harbor, PALACE, muzzle, target} from '../components/Harbor';
import {Impact, MuzzleFlash, Tracer, shake} from '../components/Effects';
import {DateCard, Label, Title} from '../components/Base';
import {Chip} from './Ultimatum';
import {S, E} from '../timeline';
import {CLIP_B} from '../clips';
import {SHIP_LEN} from '../components/Ships';

// Atış çizelgesi (şematik; kaynaklarda dakika/saniye düzeyinde kayıt yoktur). İlk atışlar Racoon, Sparrow ve Thrush'tan.
const T0 = E('s45') + 0.05; // "kısa süre sonra": ilk atış anlatıcının cümlesinden hemen sonra
export const SALVOS: {t: number; ships: number[]; tg: number}[] = [
  {t: T0, ships: [2, 3, 4], tg: 0},
  {t: T0 + 1.3, ships: [1], tg: 1},
  {t: T0 + 2.5, ships: [0, 2], tg: 2},
  {t: T0 + 3.6, ships: [3, 4], tg: 5},
  {t: T0 + 4.8, ships: [1, 2], tg: 3},
  {t: T0 + 5.8, ships: [0], tg: 4},
  {t: S('s48') + 3.2, ships: [0], tg: -1}, // Glasgow'a karşılık
  {t: S('s48') + 4.0, ships: [0, 1], tg: -1},
  {t: S('s49') + 0.2, ships: [2, 3], tg: 6},
  {t: S('s49') + 1.6, ships: [1, 4], tg: 0},
  {t: S('s49') + 3.0, ships: [0, 2], tg: 2},
  {t: S('s50') + 0.1, ships: [3], tg: 4},
  {t: S('s50') + 0.9, ships: [4], tg: 99}, // bayrak direği
];
export const WAN_B = {a: S('s47') - 1.6, b: S('s47') - 1.6 + 7.0};
const GLASGOW_FIRE = S('s48') + 1.6;
const GLASGOW_HIT = S('s48') + 3.6;
const FLAG_FALL = S('s50') + 1.5;
const LAST_FIRE = S('s50') + 1.0;

export const damageAt = (t: number) => interp(t, [T0, T0 + 6.2, WAN_B.b, S('s49') + 3.6, E('s50')], [0, 0.65, 1.35, 1.9, 2.0], (x) => x);
export const glasgowSinkAt = (t: number) => 0.7 * prog(t, GLASGOW_HIT + 0.3, GLASGOW_HIT + 4.0, easeIO);
const flagAt = (t: number) => 1 - prog(t, FLAG_FALL, FLAG_FALL + 0.9, (x) => x * x);

const W2S = (wx: number, wy: number, cam: {x: number; y: number; z: number}) => [960 + (wx - cam.x) * cam.z, 540 + (wy - cam.y) * cam.z];

export const Bombard: React.FC<{t: number}> = ({t}) => {
  const camBase = {x: 900, y: 520, z: interp(prog(t, S('s48') - 0.6, S('s48') + 0.8), [0, 1], [1, 0.86])};
  const hits = [T0 + 0.6, GLASGOW_HIT, FLAG_FALL];
  const [sx, sy] = shake(t, hits, 7);
  const cam = camBase;
  const damage = damageAt(t);
  const sink = glasgowSinkAt(t);
  const flag = flagAt(t);
  const shipFlash = (i: number) => {
    let f = 0;
    for (const s of SALVOS) if (s.ships.includes(i)) f = Math.max(f, clamp(1 - (t - s.t) / 0.18) * (t >= s.t ? 1 : 0));
    return f;
  };
  const overlay = (
    <g>
      {SALVOS.flatMap((s, k) =>
        s.ships.map((i, j) => {
          const [mx, my] = muzzle(i);
          let tx: number, ty: number;
          if (s.tg === -1) { tx = GLASGOW.x + 150 * GLASGOW.s; ty = GLASGOW.y - 20; }
          else if (s.tg === 99) { tx = PALACE.x + 372 * PALACE.s; ty = PALACE.y - 300 * PALACE.s; }
          else [tx, ty] = target(s.tg + j);
          const at = s.t + j * 0.12;
          return (
            <g key={`${k}-${j}`}>
              <MuzzleFlash id={`m${k}${j}`} x={mx} y={my} t={t} at={at} dir={1} scale={FLEET[i].s} />
              <Tracer x0={mx} y0={my} x1={tx} y1={ty} t={t} at={at} dur={0.5} />
              <Impact id={`i${k}${j}`} x={tx} y={ty} t={t} at={at + 0.5} scale={0.9} />
            </g>
          );
        }),
      )}
      {/* Glasgow, amiral gemisi St George'a ateş açar */}
      {(() => {
        const gx = GLASGOW.x + 20, gy = GLASGOW.y - 22;
        const [sxg, syg] = [FLEET[0].x + SHIP_LEN.stgeorge * FLEET[0].s * 0.6, FLEET[0].y - 30];
        return (
          <g>
            <MuzzleFlash id="gl" x={gx} y={gy} t={t} at={GLASGOW_FIRE} dir={-1} scale={0.6} />
            <Tracer x0={gx} y0={gy} x1={sxg} y1={syg + 40} t={t} at={GLASGOW_FIRE} dur={0.9} color="#F2EBDD" />
          </g>
        );
      })()}
    </g>
  );
  const inWan = t >= WAN_B.a && t < WAN_B.b;
  const wanO = window(t, WAN_B.a, WAN_B.b, 0.35, 0.4);
  const [glx, gly] = W2S(GLASGOW.x + 160 * GLASGOW.s, GLASGOW.y - 110, cam);
  const [sgx, sgy] = W2S(FLEET[0].x + 300, FLEET[0].y - 300, cam);
  const quiet = prog(t, LAST_FIRE + 1.0, LAST_FIRE + 3.0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.01)`}}>
        <Harbor t={t} cam={cam} damage={damage} flag={flag} fire={clamp(damage - 0.3) * (1 - quiet * 0.5)} sky={damage > 0.3 ? 'smoke' : 'dawn'} burnSmoke={clamp(damage)} burnStart={T0 + 1} glasgowSink={sink} overlay={overlay} gunAngle={6} shipFlash={shipFlash} boats={1} />
      </AbsoluteFill>
      {inWan && (
        <AbsoluteFill style={{opacity: wanO}}>
          <Sequence from={Math.round(WAN_B.a * 30)} durationInFrames={Math.round((WAN_B.b - WAN_B.a) * 30) + 2} layout="none">
            <OffthreadVideo src={staticFile(CLIP_B)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.02 * prog(t, WAN_B.a, WAN_B.b)})`}} />
          </Sequence>
        </AbsoluteFill>
      )}
      <Chip x={240} y={110} text="09.00 · SÜRE DOLDU" o={window(t, S('s45') - 0.1, S('s45') + 3.6, 0.2, 0.5)} color={C.danger} size={30} />
      <Label x={W2S(target(0)[0], 0, cam)[0]} y={200} text="Saray" o={window(t, S('s46') + 0.3, WAN_B.a + 0.2, 0.4, 0.4)} size={30} tick="down" tickLen={70} align="center" accent={C.danger} />
      <Label x={W2S(PALACE.x + 100 * PALACE.s, 0, cam)[0]} y={330} text="Harem bölümü" o={window(t, S('s46') + 1.2, WAN_B.a + 0.2, 0.4, 0.4)} size={28} tick="down" tickLen={90} align="center" accent={C.danger} />
      <Label x={W2S(PALACE.x + 300, 0, cam)[0]} y={W2S(0, PALACE.y + 40, cam)[1] + 40} text="Savunan toplar" o={window(t, S('s46') + 2.0, WAN_B.a + 0.2, 0.4, 0.4)} size={28} tick="up" tickLen={30} align="center" accent={C.danger} />
      <Chip x={960} y={150} text="KIYI TOPLARI SUSTURULDU" o={window(t, S('s47') + 0.4, WAN_B.b - 2.8, 0.4, 0.4)} color={C.danger} />
      <Chip x={960} y={150} text="SARAY AĞIR HASAR GÖRDÜ" o={window(t, WAN_B.b - 2.6, WAN_B.b + 0.2, 0.4, 0.4)} color={C.danger} />
      <Label x={glx} y={gly - 30} text="HHS Glasgow" sub="kraliyet yatı" o={window(t, WAN_B.b - 0.1, E('s49') + 0.5, 0.4, 0.5)} size={30} tick="down" tickLen={50} align="center" accent={C.ivory} />
      <Label x={sgx} y={sgy} text="St George" sub="Britanya amiral gemisi" o={window(t, S('s48') + 1.0, GLASGOW_HIT + 2.0, 0.4, 0.5)} size={30} tick="down" tickLen={60} align="center" accent="#7FB4B8" />
      <Chip x={glx} y={gly + 210} text="BATIRILDI" o={window(t, GLASGOW_HIT + 1.6, E('s49') + 0.5, 0.3, 0.5)} color={C.danger} />
      <Title x={960} y={120} text="Karşılık verecek araç kalmadı" size={52} o={window(t, S('s49') + 0.6, E('s49') + 0.6, 0.5, 0.5)} />
      <Chip x={960} y={150} text="BAYRAK DÜŞTÜ · ATEŞ KESİLDİ" o={window(t, FLAG_FALL + 0.6, E('s51') + 1.4, 0.4, 0.6)} />
      <Label x={960} y={240} text="O sabah indirilmeyeceği bildirilen bayrak" o={window(t, S('s51') + 0.2, E('s51') + 1.4, 0.5, 0.6)} size={28} align="center" />
    </AbsoluteFill>
  );
};

export const Losses: React.FC<{t: number}> = ({t}) => {
  const end = 265.7;
  const dim = 1 - prog(t, S('s54') - 0.2, S('s54') + 1.2) * 0.6 + prog(t, S('s55'), S('s55') + 1) * 0.6;
  const boatsIn = prog(t, S('s54') + 0.2, S('s54') + 4.4);
  const arc = prog(t, S('s55') + 0.4, S('s55') + 2.2, easeOut);
  const long = prog(t, S('s56') - 0.2, S('s56') + 2.0, easeIO);
  const cam = {x: 900, y: 520, z: 0.86};
  const landing = (
    <g>
      {[0, 1, 2].map((i) => {
        const k = clamp(boatsIn * 1.2 - i * 0.12);
        const x0 = 300 + i * 250, y0 = 800 - i * 30;
        const x1 = PALACE.x - 60 + i * 70, y1 = PALACE.y + 16;
        return <path key={i} d={`M ${x0 + (x1 - x0) * k - 20} ${y0 + (y1 - y0) * k} q 20 10 40 0 l -4 -7 h -32 z`} fill="#EEE7D8" opacity={boatsIn > 0 ? 1 : 0} />;
      })}
    </g>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `saturate(${0.45 + 0.4 * (1 - dim)}) brightness(${0.55 + 0.35 * (1 - dim)})`}}>
        <Harbor t={t} cam={cam} damage={2} flag={0} sky="smoke" burnSmoke={0.75} burnStart={240} glasgowSink={0.7} boats={1} overlay={landing} fire={0.25} />
      </AbsoluteFill>
      {/* sayılar: okunması için sabit kalır */}
      <div style={{position: 'absolute', left: 620, top: 470, transform: 'translate(-50%,-50%)', opacity: window(t, S('s52') + 1.2, E('s53') + 1.4, 0.6, 0.6), textAlign: 'center', width: 'max-content'}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 900, fontSize: 220, color: C.ivory, lineHeight: 1}}>~500</div>
        <div style={{fontFamily: FONT_LABEL, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: C.sand, marginTop: 10}}>ZANZİBAR TARAFI</div>
        <div style={{fontFamily: FONT_LABEL, fontWeight: 500, fontSize: 28, color: C.ivory, marginTop: 6}}>ölü ya da yaralı</div>
      </div>
      <div style={{position: 'absolute', left: 1360, top: 470, transform: 'translate(-50%,-50%)', opacity: window(t, S('s53') + 0.2, E('s53') + 1.4, 0.5, 0.6), textAlign: 'center', width: 'max-content'}}>
        <div style={{fontFamily: FONT_TITLE, fontWeight: 900, fontSize: 220, color: C.ivory, lineHeight: 1}}>1</div>
        <div style={{fontFamily: FONT_LABEL, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: '#7FB4B8', marginTop: 10}}>BRİTANYA TARAFI</div>
        <div style={{fontFamily: FONT_LABEL, fontWeight: 500, fontSize: 28, color: C.ivory, marginTop: 6}}>yaralı bildirildi</div>
      </div>
      <Label x={960} y={150} text="Yangına müdahale için karaya çıkan denizciler" o={window(t, S('s54') + 0.6, E('s54') + 0.6, 0.5, 0.5)} size={30} align="center" />
      {/* kısa süre / uzun sonuç */}
      {arc > 0 && (
        <AbsoluteFill>
          <AbsoluteFill style={{background: C.nightDeep, opacity: 0.55 * prog(t, S('s55'), S('s55') + 1)}} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <circle cx={520} cy={560} r={170} fill="none" stroke={C.brass} strokeWidth={3} opacity={0.6} />
            {(() => {
              const a1 = 240 * arc;
              const r = 170;
              const p = (deg: number) => [520 + r * Math.sin((deg * Math.PI) / 180), 560 - r * Math.cos((deg * Math.PI) / 180)];
              const [x0, y0] = p(0), [x1, y1] = p(a1);
              return <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${a1 > 180 ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke={C.danger} strokeWidth={16} strokeLinecap="round" />;
            })()}
            <line x1={700} y1={560} x2={700 + 1180 * long} y2={560} stroke={C.sand} strokeWidth={10} strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', left: 520, top: 560, transform: 'translate(-50%,-50%)', fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 54, color: C.ivory, textAlign: 'center', width: 'max-content'}}>~40 dk<div style={{fontFamily: FONT_LABEL, fontSize: 24, fontWeight: 600, color: C.sand, letterSpacing: 2}}>ATEŞİN SÜRESİ</div></div>
          <Label x={1300} y={500} text="Siyasi sonuç" sub="çok daha uzun sürdü" o={long} size={40} align="center" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
