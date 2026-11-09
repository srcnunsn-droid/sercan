// Coğrafi katman (Natural Earth verisi, world-atlas). Sanatsal yüzeyden ayrı: düz renk kara, ince kıyı çizgisi.
import React from 'react';
import geo from '../data/geo.json';
import {C, FONT_LABEL, clamp} from '../theme';

export const P = geo.points as unknown as Record<string, [number, number]>;

export type MapCam = {x: number; y: number; z: number};

type Props = {
  cam: MapCam;
  draw?: number; // kıyı çizgisi çizimi 0..1
  fill?: number; // kara dolgusu 0..1
  wide?: number; // Avrupa-Afrika geniş katman görünürlüğü
  tanzania?: number; // bugünkü Tanzanya sınırı (kesikli)
  spheres?: number; // 1890 nüfuz alanları (yaklaşık)
  islandGlow?: number;
  graticule?: number;
  children?: React.ReactNode; // harita koordinatında ek katman
  rotate?: number;
};

const NS = {vectorEffect: 'non-scaling-stroke' as const};

export const GeoMap: React.FC<Props> = ({cam, draw = 1, fill = 1, wide = 0, tanzania = 0, spheres = 0, islandGlow = 0, graticule = 0.5, children, rotate = 0}) => {
  const tr = `translate(960 540) rotate(${rotate}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`;
  const dash = 6000;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id="hatchB" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform={`rotate(45) scale(${1 / cam.z})`}>
          <rect width="10" height="10" fill={C.deep} opacity={0.55} />
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.ivory} strokeWidth={2} opacity={0.5} />
        </pattern>
        <pattern id="hatchG" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform={`rotate(-45) scale(${1 / cam.z})`}>
          <rect width="10" height="10" fill={C.danger} opacity={0.45} />
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.ivory} strokeWidth={2} opacity={0.4} />
        </pattern>
      </defs>
      <g transform={tr}>
        {/* enlem/boylam ızgarası (her 2°) */}
        <g opacity={graticule * 0.35} stroke={C.brass} strokeWidth={1} {...NS}>
          {Array.from({length: 60}, (_, i) => {
            const lon = (i - 30) * 2 + 40;
            const x = 960 + (((lon - 39.2) * Math.PI) / 180) * geo.scale;
            return <line key={`v${i}`} x1={x} y1={-30000} x2={x} y2={30000} {...NS} />;
          })}
          {Array.from({length: 50}, (_, i) => {
            const lat = (i - 25) * 2;
            const yMerc = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
            const y = 540 - (yMerc(lat) - yMerc(-6.2)) * geo.scale;
            return <line key={`h${i}`} x1={-30000} y1={y} x2={30000} y2={y} {...NS} />;
          })}
        </g>
        <path d={geo.landWide} fill="#CDB896" opacity={fill} />
        {wide > 0 && (
          <g opacity={wide}>
            <path d={geo.landWide} fill="none" stroke={C.brassDark} strokeWidth={1.2} {...NS} />
            <path d={geo.uk} fill={C.deep} opacity={0.0 + 0.85 * clamp(wide * 2 - 1)} />
            <path d={geo.germany} fill={C.danger} opacity={0.0 + 0.8 * clamp(wide * 2 - 1)} />
          </g>
        )}
        <path d={geo.landRegion} fill="none" stroke={C.ivory} strokeWidth={1.8} strokeDasharray={`${dash}`} strokeDashoffset={dash * (1 - draw)} {...NS} opacity={1 - wide} />
        {spheres > 0 && (
          <g opacity={spheres}>
            <path d={geo.kenya} fill="url(#hatchB)" stroke={C.deep} strokeWidth={2} {...NS} />
            <path d={geo.uganda} fill="url(#hatchB)" stroke={C.deep} strokeWidth={2} {...NS} />
            <path d={geo.tanzania} fill="url(#hatchG)" stroke={C.danger} strokeWidth={2} {...NS} />
            <path d={geo.rwanda} fill="url(#hatchG)" stroke={C.danger} strokeWidth={2} {...NS} />
            <path d={geo.burundi} fill="url(#hatchG)" stroke={C.danger} strokeWidth={2} {...NS} />
          </g>
        )}
        {tanzania > 0 && <path d={geo.tanzania} fill="none" stroke={C.ivory} strokeWidth={2.2} strokeDasharray="8 7" opacity={tanzania} {...NS} />}
        {/* adalar (10m ayrıntı) */}
        <path d={geo.islands10} fill={islandGlow > 0 ? '#EFE4CC' : '#CDB896'} stroke={islandGlow > 0 ? C.brass : C.ivory} strokeWidth={1.5 + islandGlow * 1.5} opacity={Math.max(fill, islandGlow)} {...NS} />
        {children}
      </g>
    </svg>
  );
};

/** boylam/enlemden harita koordinatına (build_map.mjs ile aynı Mercator) */
export const ll = (lon: number, lat: number): [number, number] => {
  const m = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360));
  return [960 + ((lon - 39.2) * Math.PI / 180) * geo.scale, 540 - (m(lat) - m(-6.2)) * geo.scale];
};

/** harita koordinatından ekran koordinatına */
export const toScreen = (p: [number, number], cam: MapCam, rotate = 0): [number, number] => {
  const dx = (p[0] - cam.x) * cam.z, dy = (p[1] - cam.y) * cam.z;
  const a = (rotate * Math.PI) / 180;
  return [960 + dx * Math.cos(a) - dy * Math.sin(a), 540 + dx * Math.sin(a) + dy * Math.cos(a)];
};

export const MapLabel: React.FC<{x: number; y: number; text: string; o?: number; size?: number; color?: string; italic?: boolean; spacing?: number}> = ({x, y, text, o = 1, size = 26, color = C.ivory, italic, spacing = 6}) =>
  o <= 0.001 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o, fontFamily: FONT_LABEL, fontSize: size, fontWeight: 600, letterSpacing: spacing, color, fontStyle: italic ? 'italic' : 'normal', whiteSpace: 'nowrap', width: 'max-content', textShadow: '0 2px 10px rgba(5,14,20,0.8)'}}>
      {text}
    </div>
  );
