import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_LABEL, FONT_TITLE, clamp} from '../theme';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const face = (fam: string, file: string, w: number) => `
@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(${staticFile(`fonts/${file}-latin-${w}-normal.woff2`)}) format('woff2');unicode-range:${LATIN};}
@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(${staticFile(`fonts/${file}-latin-ext-${w}-normal.woff2`)}) format('woff2');unicode-range:${LATIN_EXT};}`;

export const FONT_CSS = [700, 800, 900].map((w) => face('Playfair Display', 'playfair-display', w)).join('') +
  [400, 500, 600, 700, 800].map((w) => face('Inter', 'inter', w)).join('');

/** Yazı tiplerini yükler ve yüklenene kadar render'ı bekletir. */
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const probes = ['700 40px "Playfair Display"', '900 40px "Playfair Display"', '400 40px Inter', '600 40px Inter', '700 40px Inter'];
    Promise.all(probes.map((p) => document.fonts.load(p, 'ŞĞİıçöüÇÖÜ AZ09'))).then(() => document.fonts.ready).then(() => continueRender(handle));
  }, [handle]);
  return <style>{FONT_CSS}</style>;
};

/** Film greni + vinyet + kağıt dokusu: tüm sahneleri aynı yüzey dilinde birleştirir. */
export const Finish: React.FC<{grain?: number; vignette?: number; paper?: number}> = ({grain = 0.04, vignette = 0.55, paper = 0.06}) => {
  const f = useCurrentFrame();
  const g = Math.floor(f / 4) % 6; // gren 4 karede bir değişir (dosya boyutu / sıkıştırma dengesi)
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '125%', height: '130%', left: '-10%', top: '-12%', opacity: paper, mixBlendMode: 'overlay'}} />
      <Img src={staticFile(`tex/grain_${g}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: grain, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(5,14,20,${vignette}) 100%)`}} />
    </AbsoluteFill>
  );
};

type LabelProps = {
  x: number; y: number; text: string; sub?: string; o?: number; size?: number; color?: string;
  align?: 'left' | 'center' | 'right'; tick?: 'left' | 'right' | 'down' | 'up' | 'none'; tickLen?: number; accent?: string; width?: number;
};
/** Nesnenin yanında beliren bilgi etiketi (sans serif, telefon ekranında okunur boyutta). */
export const Label: React.FC<LabelProps> = ({x, y, text, sub, o = 1, size = 30, color = C.ivory, align = 'left', tick = 'none', tickLen = 60, accent = C.brass, width}) => {
  if (o <= 0.001) return null;
  const tx = align === 'left' ? 0 : align === 'right' ? -100 : -50;
  const reveal = clamp(o * 1.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}%, -50%)`, opacity: clamp(o * 1.2), fontFamily: FONT_LABEL, color, textAlign: align, width: width ?? 'max-content', whiteSpace: width ? 'normal' : 'nowrap'}}>
      {tick !== 'none' && (
        <div style={{position: 'absolute', background: accent,
          ...(tick === 'left' ? {right: '100%', top: '50%', width: tickLen * reveal, height: 2, marginRight: 14} : {}),
          ...(tick === 'right' ? {left: '100%', top: '50%', width: tickLen * reveal, height: 2, marginLeft: 14} : {}),
          ...(tick === 'down' ? {left: align === 'center' ? '50%' : 0, top: '100%', width: 2, height: tickLen * reveal, marginTop: 10} : {}),
          ...(tick === 'up' ? {left: align === 'center' ? '50%' : 0, bottom: '100%', width: 2, height: tickLen * reveal, marginBottom: 10} : {}),
        }} />
      )}
      <div style={{fontSize: size, fontWeight: 700, letterSpacing: size > 40 ? 1 : 2.2, textTransform: 'uppercase', textShadow: '0 2px 14px rgba(5,14,20,0.85)'}}>{text}</div>
      {sub && <div style={{fontSize: size * 0.72, fontWeight: 500, letterSpacing: 0.4, marginTop: 6, color: C.sand, textShadow: '0 2px 12px rgba(5,14,20,0.9)', textTransform: 'none'}}>{sub}</div>}
    </div>
  );
};

/** Başlık (serif, kademeli harf açılımı). */
export const Title: React.FC<{x: number; y: number; text: string; o?: number; size?: number; color?: string; align?: 'left' | 'center' | 'right'; spacing?: number; weight?: number; shadow?: boolean}> = ({x, y, text, o = 1, size = 96, color = C.ivory, align = 'center', spacing = 2, weight = 800, shadow = true}) => {
  if (o <= 0.001) return null;
  const tx = align === 'left' ? 0 : align === 'right' ? -100 : -50;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}%, -50%)`, fontFamily: FONT_TITLE, fontWeight: weight, fontSize: size, color, letterSpacing: spacing, whiteSpace: 'nowrap', width: 'max-content', textAlign: align, lineHeight: 1.05,
      opacity: clamp(o * 1.3), textShadow: shadow ? '0 4px 30px rgba(5,14,20,0.8)' : undefined}}>
      {text}
    </div>
  );
};

/** Tarih kartı: pirinç çerçeveli küçük kart. */
export const DateCard: React.FC<{x: number; y: number; top?: string; main: string; o?: number; accent?: string; scale?: number}> = ({x, y, top, main, o = 1, accent = C.brass, scale = 1}) => {
  if (o <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${scale * (0.96 + 0.04 * o)})`, opacity: clamp(o * 1.2), background: 'rgba(10,28,39,0.82)', border: `2px solid ${accent}`, padding: '16px 30px 18px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.45)', width: 'max-content'}}>
      {top && <div style={{fontFamily: FONT_LABEL, fontSize: 22, letterSpacing: 4, color: C.sand, fontWeight: 600, marginBottom: 4}}>{top}</div>}
      <div style={{fontFamily: FONT_TITLE, fontSize: 52, fontWeight: 800, color: C.ivory, letterSpacing: 1.5, whiteSpace: 'nowrap'}}>{main}</div>
    </div>
  );
};
