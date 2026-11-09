// Doğal Dünya (Natural Earth, world-atlas) verisinden SVG yol verisi üretir.
// Tek bir Mercator projeksiyonu: tüm görünümler aynı koordinat sisteminde, kamera zoom ile geçer.
import fs from 'node:fs';
import {geoMercator, geoPath, geoClipRectangle, geoIdentity} from 'd3-geo';
import {feature, mesh} from 'topojson-client';
const load = (f) => JSON.parse(fs.readFileSync(`node_modules/world-atlas/${f}`, 'utf8'));
const S = 8460; // 13° boylam ≈ 1920 px
const proj = geoMercator().center([39.2, -6.2]).scale(S).translate([960, 540]).precision(0.2);
const round = (d) => d && d.replace(/(\d+\.\d)\d+/g, '$1');
function clipPath(geo, lon0, lat0, lon1, lat1) {
  const p = geoMercator().center([39.2, -6.2]).scale(S).translate([960, 540]);
  const [x0, y0] = p([lon0, lat1]); const [x1, y1] = p([lon1, lat0]);
  const pc = {stream: (s) => p.stream(geoClipRectangle(x0, y0, x1, y1)(s))};
  // clipRectangle operates on projected coords: compose manually
  const comp = {stream: (s) => p.stream(geoClipRectangle(x0, y0, x1, y1)(s))};
  return round(geoPath({stream: (s) => proj.stream(geoClipRectangle(x0, y0, x1, y1)(s))})(geo));
}
const land50 = feature(load('land-50m.json'), load('land-50m.json').objects.land);
const land10 = feature(load('land-10m.json'), load('land-10m.json').objects.land);
const c50 = load('countries-50m.json');
const countries = feature(c50, c50.objects.countries).features;
const byName = (n) => countries.find((f) => f.properties.name === n);
const out = {};
out.landWide = clipPath(land50, -25, -42, 70, 66);
{ const p2 = geoMercator().center([39.2, -6.2]).scale(S).translate([960, 540]).precision(0.2);
  const [x0, y0] = p2([30, 4]); const [x1, y1] = p2([48, -14]);
  p2.clipExtent([[x0, y0], [x1, y1]]);
  out.landRegion = round(geoPath(p2)(land50)); }
for (const [k, n] of [['tanzania', 'Tanzania'], ['kenya', 'Kenya'], ['uganda', 'Uganda'], ['rwanda', 'Rwanda'], ['burundi', 'Burundi'], ['uk', 'United Kingdom'], ['germany', 'Germany']]) {
  const f = byName(n); if (!f) { console.error('missing', n); continue; }
  out[k] = clipPath(f, -25, -42, 70, 66);
}

const pts = {zanzibarTown: [39.188, -6.163], darEsSalaam: [39.28, -6.79], mombasa: [39.67, -4.04], london: [-0.13, 51.51], berlin: [13.40, 52.52], unguja: [39.33, -6.10], pemba: [39.78, -5.18], mafia: [39.70, -7.85]};
out.points = Object.fromEntries(Object.entries(pts).map(([k, v]) => [k, proj(v).map((x) => +x.toFixed(1))]));
// graticule-like latitude/longitude lines for the engraved surface (every 2°)
out.scale = S;
fs.writeFileSync('src/data/geo.json', JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, typeof v === 'string' ? v.length : v])));
// Adalar için 10m ayrıntı: düzlemsel Mercator (küresel kırpma yok), yalnızca bölgedeki küçük poligonlar
import {geoTransform} from 'd3-geo';
const planar = geoTransform({point(lon, lat) { const p = proj([lon, lat]); this.stream.point(p[0], p[1]); }});
const isl = [];
for (const poly of land10.features ? land10.features.flatMap((f) => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]) : land10.geometry.coordinates) {
  const ring = poly[0]; let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  for (const [x, y] of ring) { mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y); }
  if (mnx > 38.6 && mxx < 40.2 && mny > -8.6 && mxy < -4.6 && (mxx - mnx) < 1.2) isl.push({type: 'Polygon', coordinates: poly});
}
out.islands10 = round(geoPath(planar)({type: 'GeometryCollection', geometries: isl}));
fs.writeFileSync('src/data/geo.json', JSON.stringify(out));
console.log('islands', isl.length, out.islands10.length);
