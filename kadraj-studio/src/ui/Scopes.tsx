// Profesyonel video skopları: RGB histogram, luma dalga formu (waveform), vektörskop (cilt tonu çizgili)
import { useEffect, useRef, useState } from 'react';

type Kind = 'hist' | 'wave' | 'vector' | 'parade';
const SW = 256, SH = 144;

export function Scopes({ source }: { source: React.RefObject<HTMLCanvasElement> }) {
  const [kind, setKind] = useState<Kind>('wave'); const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const small = document.createElement('canvas'); small.width = SW; small.height = SH; const sx = small.getContext('2d', { willReadFrequently: true })!;
    const id = setInterval(() => {
      const src = source.current, out = cv.current; if (!src || !out) return;
      sx.drawImage(src, 0, 0, SW, SH); const d = sx.getImageData(0, 0, SW, SH).data;
      const o = out.getContext('2d')!; const W = out.width, H = out.height;
      o.fillStyle = '#0a0a0e'; o.fillRect(0, 0, W, H);
      o.strokeStyle = '#ffffff18'; o.lineWidth = 1;
      if (kind === 'hist') {
        const bins = [new Float32Array(256), new Float32Array(256), new Float32Array(256)];
        for (let i = 0; i < d.length; i += 4) { bins[0][d[i]]++; bins[1][d[i + 1]]++; bins[2][d[i + 2]]++; }
        const mx = Math.max(...bins.map(b => Math.max(...b.slice(1, 255)))) || 1;
        for (let g = 1; g < 4; g++) { o.beginPath(); o.moveTo((W * g) / 4, 0); o.lineTo((W * g) / 4, H); o.stroke(); }
        o.globalCompositeOperation = 'lighter';
        ['#ff3b3b', '#2fd35a', '#3b6bff'].forEach((col, ch) => { o.fillStyle = col + 'aa'; o.beginPath(); o.moveTo(0, H); for (let v = 0; v < 256; v++) o.lineTo((v / 255) * W, H - Math.min(1, Math.log1p(bins[ch][v]) / Math.log1p(mx)) * (H - 4)); o.lineTo(W, H); o.fill(); });
        o.globalCompositeOperation = 'source-over';
      } else if (kind === 'wave' || kind === 'parade') {
        for (let g = 0; g <= 4; g++) { const y = H - (g / 4) * (H - 8) - 4; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); o.fillStyle = '#ffffff40'; o.font = '9px Inter'; o.fillText(String(g * 25), 2, y - 2); }
        const img = o.getImageData(0, 0, W, H); const px = img.data; const add = (x: number, y: number, r: number, g: number, b: number) => { const k = ((y | 0) * W + (x | 0)) * 4; px[k] = Math.min(255, px[k] + r); px[k + 1] = Math.min(255, px[k + 1] + g); px[k + 2] = Math.min(255, px[k + 2] + b); };
        for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
          const i = (y * SW + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
          if (kind === 'wave') { const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; add((x / SW) * W, H - 4 - (l / 255) * (H - 8), 18, 40, 22); }
          else { const third = W / 3; const xx = (x / SW) * third; add(xx, H - 4 - (r / 255) * (H - 8), 60, 8, 8); add(third + xx, H - 4 - (g / 255) * (H - 8), 8, 50, 12); add(2 * third + xx, H - 4 - (b / 255) * (H - 8), 10, 18, 70); }
        }
        o.putImageData(img, 0, 0);
      } else {
        const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 6;
        o.beginPath(); o.arc(cx, cy, R, 0, 7); o.stroke(); o.beginPath(); o.moveTo(cx - R, cy); o.lineTo(cx + R, cy); o.moveTo(cx, cy - R); o.lineTo(cx, cy + R); o.stroke();
        // cilt tonu çizgisi (~123°)
        o.strokeStyle = '#ffb07c88'; o.beginPath(); o.moveTo(cx, cy); const a = (-123 * Math.PI) / 180; o.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); o.stroke();
        const toVS = (r: number, g: number, b: number) => { const cb = -0.168736 * r - 0.331264 * g + 0.5 * b, cr = 0.5 * r - 0.418688 * g - 0.081312 * b; return [cx + (cb / 128) * R, cy - (cr / 128) * R]; };
        [['R', 255, 0, 0], ['G', 0, 255, 0], ['B', 0, 0, 255], ['Cy', 0, 255, 255], ['Mg', 255, 0, 255], ['Yl', 255, 255, 0]].forEach(([l, r, g, b]) => { const [x, y] = toVS((r as number) * 0.75, (g as number) * 0.75, (b as number) * 0.75); o.strokeStyle = '#ffffff55'; o.strokeRect(x - 4, y - 4, 8, 8); o.fillStyle = '#ffffff70'; o.font = '9px Inter'; o.fillText(l as string, x + 6, y + 3); });
        const img = o.getImageData(0, 0, W, H); const px = img.data;
        for (let i = 0; i < d.length; i += 8) { const [x, y] = toVS(d[i], d[i + 1], d[i + 2]); const k = ((y | 0) * W + (x | 0)) * 4; if (k < 0 || k >= px.length) continue; px[k] = Math.min(255, px[k] + d[i] * 0.25 + 10); px[k + 1] = Math.min(255, px[k + 1] + d[i + 1] * 0.25 + 10); px[k + 2] = Math.min(255, px[k + 2] + d[i + 2] * 0.25 + 10); }
        o.putImageData(img, 0, 0);
      }
    }, 200);
    return () => clearInterval(id);
  }, [kind]);
  return (
    <div className="scopes">
      <div className="row" style={{ gap: 2 }}>{([['wave', 'Dalga'], ['parade', 'RGB Parade'], ['hist', 'Histogram'], ['vector', 'Vektör']] as const).map(([k, l]) => <button key={k} className={'sm ghost ' + (kind === k ? 'on' : '')} onClick={() => setKind(k)}>{l}</button>)}</div>
      <canvas ref={cv} width={kind === 'vector' ? 200 : 300} height={kind === 'vector' ? 200 : 160} />
    </div>
  );
}
