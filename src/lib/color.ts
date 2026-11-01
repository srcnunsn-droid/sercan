/** Kelvin -> sRGB (Tanner Helland approximation). Returns [r,g,b] 0-255. */
export function kelvinToRgb(k: number): [number, number, number] {
  const t = Math.min(40000, Math.max(1000, k)) / 100;
  let r: number, g: number, b: number;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
  if (t >= 66) b = 255; else if (t <= 19) b = 0; else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return [c(r), c(g), c(b)];
}
export const rgbCss = ([r, g, b]: [number, number, number], a = 1) => `rgba(${r},${g},${b},${a})`;
export const kelvinHex = (k: number) => '#' + kelvinToRgb(k).map((v) => v.toString(16).padStart(2, '0')).join('');
