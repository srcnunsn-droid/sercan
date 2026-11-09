// 0 – 26 sn: Saat ibresi makro → kadran içindeki liman → destek çekimleri → çizgi → kodlanmış harita → tarih halkası geri döner.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {C, FONT_TITLE, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {Clock, CX, CY, DATE_DEG, R_DIAL, polar} from '../components/Clock';
import {Harbor} from '../components/Harbor';
import {TopDown} from '../components/TopDown';
import {DateCard, Label} from '../components/Base';
import {S, E} from '../timeline';
import {CLIP_A, HAS_CLIPS} from '../clips';

/** Kadran içi içerik: yan görünüş liman (z ölçeğinde) */
export const DialHarbor: React.FC<{t: number; scale?: number; cam?: {x: number; y: number; z: number}; damage?: number; sky?: 'dawn' | 'smoke' | 'calm'; glasgowSink?: number; flag?: number; burn?: number; fleetOn?: number; boats?: number}> = ({t, scale = 0.62, cam = {x: 1150, y: 600, z: 1}, damage = 0, sky = 'dawn', glasgowSink = 0, flag = 1, burn = 0, fleetOn = 1, boats = -1}) => (
  <div style={{position: 'absolute', left: R_DIAL - 960, top: R_DIAL - 540, width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: '960px 540px'}}>
    <Harbor t={t} cam={cam} damage={damage} sky={sky} glasgowSink={glasgowSink} flag={flag} burnSmoke={burn} burnStart={0} fleetOn={fleetOn} boats={boats} />
  </div>
);

export const DialTopDown: React.FC<{t: number; scale?: number; damage?: number; glasgowSink?: number}> = ({t, scale = 0.5, damage = 0, glasgowSink = 0}) => (
  <div style={{position: 'absolute', left: R_DIAL - 960, top: R_DIAL - 540, width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: '960px 540px'}}>
    <TopDown t={t} damage={damage} glasgowSink={glasgowSink} compass={0} />
  </div>
);

/** Destek çekimi (WAN) veya klip yoksa referans görselinden yavaş kamera hareketi */
const Support: React.FC<{t: number; a: number; b: number; clipFrom: number; still: string; o?: number; push?: number}> = ({t, a, b, clipFrom, still, o = 1, push = 0.04}) => {
  if (t < a - 0.05 || t > b + 0.05 || o <= 0) return null;
  const k = (t - a) / (b - a);
  const style: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + push * k})`, filter: 'saturate(0.92) contrast(1.02)'};
  return (
    <AbsoluteFill style={{opacity: o}}>
      {HAS_CLIPS ? (
        <Sequence from={Math.round(a * 30)} durationInFrames={Math.round((b - a) * 30) + 3} layout="none">
          <OffthreadVideo src={staticFile(CLIP_A)} startFrom={Math.round(clipFrom * 30)} muted style={style} />
        </Sequence>
      ) : (
        <Img src={staticFile(still)} style={style} />
      )}
    </AbsoluteFill>
  );
};

export {Support};
export const Opening: React.FC<{t: number}> = ({t}) => {
  // --- 1) makro: ibre ve kadran içi deniz → ölçek değişimi
  const handMin = 8 * 60 + 40 + t * 0.35; // ibre yavaşça ilerler (şematik)
  const mAng = (handMin % 60) * 6;
  const [hx, hy] = polar(190, mAng);
  const pull = prog(t, 0.2, 4.6, easeIO);
  const dive = prog(t, 4.6, 6.4, (x) => x * x * x);
  const z = interp(pull, [0, 1], [7.5, 1]) * (1 + dive * 2.4);
  const camX = interp(pull, [0, 1], [hx, CX]) + dive * -120;
  const camY = interp(pull, [0, 1], [hy, CY]) + dive * 90;
  const clockO = 1 - prog(t, 6.0, 6.5);

  // --- 3) dönüşüm: 19.0–23.6
  const edgeIn = prog(t, 19.2, 20.4);
  const photoOut = prog(t, 20.2, 21.2);
  const tilt = prog(t, 20.8, 22.6, easeIO);
  const mapIn = prog(t, 21.4, 22.8);
  const mapColor = prog(t, 22.4, 23.2);
  // --- 4) kadrana geri çekiliş + tarih halkası 27 → 25
  const back = prog(t, 22.9, 24.3, easeIO);
  const backIn = prog(t, 22.9, 23.15);
  const rewind = prog(t, S('s05') + 4.6, S('s05') + 6.8, easeIO); // ~23.0–25.2
  const dateRot = -DATE_DEG[27] + (DATE_DEG[27] - DATE_DEG[25]) * rewind;

  const inMorph = t >= 19.0;
  return (
    <AbsoluteFill style={{background: C.nightDeep}}>
      {/* 1) saat makrosu ve geri çekiliş */}
      {t < 6.6 && (
        <AbsoluteFill style={{opacity: clockO}}>
          <div style={{position: 'absolute', inset: 0, transform: `translate(960px,540px) scale(${z}) translate(${-camX}px,${-camY}px)`, transformOrigin: '0 0'}}>
            <Clock t={t} minutes={handMin} dateRot={-DATE_DEG[27]} red={0.6} dialChildren={<DialHarbor t={t + 3} />} />
          </div>
          <Label x={960} y={1010} text="Zanzibar Limanı · Sabah" o={window(t, 2.6, 6.0, 0.6, 0.5)} size={30} align="center" />
        </AbsoluteFill>
      )}

      {/* 2) destek çekimleri: gemiler → saray → top → saray → saat → geniş liman */}
      <Support t={t} a={5.8} b={10.0} clipFrom={0.3} still="hf/img0_harbor.png" o={prog(t, 5.8, 6.5)} />
      <Support t={t} a={10.0} b={12.2} clipFrom={8.6} still="hf/img1_palace.png" />
      <Support t={t} a={12.2} b={14.6} clipFrom={16.0} still="hf/img2b_gun.png" />
      <Support t={t} a={14.6} b={16.0} clipFrom={10.8} still="hf/img1_palace.png" push={0.06} />
      {t >= 16.0 && t < 17.3 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', inset: 0, transform: `translate(960px,540px) scale(${2.6 + (t - 16) * 0.12}) translate(${-(CX - 230)}px,${-(CY - 20)}px)`, transformOrigin: '0 0'}}>
            <Clock t={t} minutes={8 * 60 + 52 + (t - 16) * 0.8} dateRot={-DATE_DEG[27]} red={1} marker9={0.8} dialChildren={<DialHarbor t={t} />} />
          </div>
          <AbsoluteFill style={{background: C.danger, mixBlendMode: 'multiply', opacity: 0.25}} />
        </AbsoluteFill>
      )}
      <Support t={t} a={17.3} b={20.2} clipFrom={22.1} still="hf/img0_harbor.png" o={1 - photoOut} push={0.02} />

      {/* "1 SAATTEN KISA" */}
      {t > 10.1 && t < 14.2 && (() => {
        const o = window(t, 10.2, 14.0, 0.35, 0.45);
        const w = prog(t, 10.4, 11.6, easeOut);
        return (
          <AbsoluteFill style={{pointerEvents: 'none'}}>
            <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(10,28,39,0.75) 0%, rgba(10,28,39,0) 55%)', opacity: o}} />
            <div style={{position: 'absolute', left: 960, top: 800, transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * w})`, opacity: o, fontFamily: FONT_TITLE, fontWeight: 900, fontSize: 168, color: C.ivory, letterSpacing: 6, whiteSpace: 'nowrap', width: 'max-content', textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>
              1 SAATTEN KISA
            </div>
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
              <line x1={960 - 560 * w} y1={912} x2={960 + 560 * w} y2={912} stroke={C.danger} strokeWidth={8} />
            </svg>
          </AbsoluteFill>
        );
      })()}

      {t >= 20.2 && t < 21.3 && <Img src={staticFile('hf/a25_still.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scale(1.04)', opacity: 1 - photoOut}} />}
      {/* 3) çizgiler → kodla çizilmiş liman haritası */}
      {inMorph && (
        <AbsoluteFill>
          <AbsoluteFill style={{background: C.night, opacity: photoOut}} />
          <AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 30%'}}>
            <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 60%', transform: `rotateX(${tilt * 62}deg) scale(${1 - tilt * 0.08})`, opacity: edgeIn * (1 - mapColor)}}>
              {HAS_CLIPS ? <Img src={staticFile('hf/edges_open.png')} style={{width: '100%', height: '100%'}} /> : <Harbor t={t} lineArt={1} />}
            </div>
          </AbsoluteFill>
          {/* harita: aynı düzen (gemiler solda, saray sağda) */}
          <AbsoluteFill style={{opacity: mapIn * (1 - backIn)}}>
            <TopDown t={t} lineArt={1 - mapColor} compass={mapColor} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* 4) haritayı taşıyan kadran: tam saat görünümü ve tarih halkası */}
      {t > 22.9 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${interp(back, [0, 1], [2, 1])})`, transformOrigin: `${CX}px ${CY}px`, opacity: backIn}}>
            <Clock t={t} minutes={8 * 60 + 52} stopped dateRot={dateRot} red={1 - rewind} dialChildren={<DialTopDown t={t} />} gearsOn={back} handsOpacity={prog(t, 23.8, 24.6)} />
          </div>
          <DateCard x={960} y={540 + 0} top="İKİ GÜN ÖNCE" main="25 AĞUSTOS 1896" o={window(t, 24.6, 27.5, 0.5, 0.6)} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
