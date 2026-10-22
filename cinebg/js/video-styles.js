/* CineBG Studio v7 — video stilleri.
   Her stil: görüntü efektleri (vfx → post shader), grade üzerine yazılan değerler (look), ekran arayüzü (hud),
   tercih edilen kamera açıları (cams), önerilen oran (ar), video hızı (speed), elde titreme (shake) ve prompt satırı (en). */
(function () {
  const CB = window.CB;
  const V = (o) => Object.assign({ vfx: {}, look: {}, hud: '', cams: null, ar: '', speed: 1, shake: 0 }, o);
  CB.VIDEO_STYLES = [
    V({ id: 'none', tr: 'Standart', en: '' }),
    V({ id: 'cinematic', tr: 'Sinematik (anamorfik)', en: 'cinematic film still shot on anamorphic lenses, 2.39:1 widescreen, shallow depth of field, motivated practical lighting, oval bokeh and horizontal flares', look: { flare: 0.3, bloom: 0.45, halation: 0.25, vignette: 0.45 }, ar: '2.39', cams: ['est', 'low', 'sym', 'tele', 'silhouette', 'frame', 'scope', 'offcentre', 'offcentrer'] }),
    V({ id: 'trailer', tr: 'Film fragmanı', en: 'blockbuster trailer frame, epic scale, teal-and-orange grade, lens flares, letterboxed', look: { contrast: 1.2, saturation: 1.1, shadows: [-0.25, 0.05, 0.3], highlights: [0.3, 0.1, -0.2], flare: 0.45, bloom: 0.55 }, ar: '2.39', cams: ['est', 'low', 'worm', 'helicopter', 'tele', 'silhouette'] }),
    V({ id: 'vlog', tr: 'Vlog (elde, doğal)', en: 'handheld travel vlog look on a mirrorless camera, 16mm-equivalent wide lens at eye level, natural auto exposure, slightly warm, authentic and unpolished', look: { contrast: 0.98, saturation: 1.06, temperature: 0.08, fade: 0.04, vignette: 0.15, grain: 0.1, flare: 0.05 }, vfx: { fish: 0.15, sharp: 0.3 }, shake: 0.6, cams: ['eye', 'pov', 'normal50', 'carwin', 'threshold', 'corner'] }),
    V({ id: 'doc', tr: 'Belgesel', en: 'observational documentary look, natural available light, 35mm lens, honest colour, unobtrusive camera', look: { contrast: 1.04, saturation: 0.88, grain: 0.3, vignette: 0.3 }, shake: 0.25, cams: ['eye', 'normal50', 'tele', 'track'] }),
    V({ id: 'naturedoc', tr: 'Doğa belgeseli (IMAX)', en: 'nature documentary frame on IMAX large format, long telephoto compression, pristine detail, vivid natural colour', look: { saturation: 1.18, contrast: 1.08, grain: 0.08 }, vfx: { sharp: 0.25 }, cams: ['tele', 'xls', 'drone', 'heathaze', 'helicopter', 'est'] }),
    V({ id: 'music', tr: 'Müzik videosu', en: 'stylised music video frame, bold coloured light, atmospheric haze, lens flares, high contrast', look: { saturation: 1.3, contrast: 1.18, bloom: 0.75, flare: 0.5, ca: 0.4, halation: 0.35 }, cams: ['dutch', 'low', 'worm', 'gimbalroll', 'sym', 'fisheye'] }),
    V({ id: 'commercial', tr: 'Reklam filmi', en: 'high-end commercial look, polished glossy highlights, crisp detail, clean controlled colour', look: { contrast: 1.1, saturation: 1.08, grain: 0.05, vignette: 0.2 }, vfx: { sharp: 0.35 }, cams: ['sym', 'low', 'lowdolly', 'prodhero', 'prod34'] }),
    V({ id: 'drone', tr: 'Drone çekimi', en: 'aerial drone footage from high altitude, sweeping top-down and orbit views, crisp 4K detail', look: { saturation: 1.1, contrast: 1.06, grain: 0.04 }, vfx: { sharp: 0.25 }, cams: ['drone', 'bird', 'helicopter', 'satellite', 'orbit', 'crane'] }),
    V({ id: 'gopro', tr: 'Aksiyon kamerası', en: 'action camera point of view, ultra-wide fisheye distortion, punchy saturated colour, slight motion blur', look: { saturation: 1.25, contrast: 1.12, vignette: 0.35 }, vfx: { fish: 0.6, sharp: 0.4 }, shake: 0.9, cams: ['pov', 'worm', 'low', 'periscope', 'fisheye'] }),
    V({ id: 'phone', tr: 'Telefon (dikey)', en: 'shot on a smartphone, computational HDR look, deep focus, crisp detail, vertical framing', look: { contrast: 1.04, saturation: 1.12, fade: 0, grain: 0.04, vignette: 0.05, bloom: 0.25 }, vfx: { sharp: 0.55 }, ar: '9:16', shake: 0.35, cams: ['eye', 'pov', 'normal50', 'low'] }),
    V({ id: 'cctv', tr: 'Güvenlik kamerası', en: 'CCTV security camera footage from a high corner, wide-angle distortion, low resolution, washed-out monochrome, timestamp overlay', look: { saturation: 0.15, contrast: 1.25, grain: 0.6, vignette: 0.5, bloom: 0.15, flare: 0 }, vfx: { fish: 0.35, pix: 0.35, scan: 0.35, mono: 0.6, monoCol: [0.82, 0.95, 0.85] }, hud: 'cctv', cams: ['high34', 'corner', 'stairsdown', 'rooftop'] }),
    V({ id: 'vhs', tr: 'VHS kamera', en: '1990s VHS camcorder footage, smeared chroma, tracking noise lines, soft detail, date stamp in the corner', look: { fade: 0.15, saturation: 1.1, contrast: 0.92, bloom: 0.5, grain: 0.35 }, vfx: { bleed: 0.8, wobble: 0.6, scan: 0.25 }, hud: 'vhs', ar: '4:3', shake: 0.5, cams: ['eye', 'pov', 'normal50'] }),
    V({ id: 'super8', tr: 'Super 8 ev filmi', en: 'Super 8 home-movie footage, warm faded colour, heavy grain, gate weave, light leaks, soft vignette', look: { temperature: 0.2, fade: 0.12, saturation: 0.9, grain: 0.85, grainSize: 2.2, vignette: 0.75, halation: 0.35 }, vfx: { wobble: 0.25 }, ar: '4:3', shake: 0.45 }),
    V({ id: 'film16', tr: '16 mm film', en: '16mm film look, organic heavy grain, natural muted colour, soft highlights', look: { saturation: 0.85, grain: 0.6, grainSize: 1.7, vignette: 0.45, halation: 0.3 }, shake: 0.2 }),
    V({ id: 'found', tr: 'Found footage', en: 'found-footage camcorder recording at night, infrared night mode, shaky, noisy, REC indicator', look: { contrast: 1.15, grain: 0.8, vignette: 0.6 }, vfx: { nv: 0.35, bleed: 0.3 }, hud: 'rec', shake: 1, cams: ['pov', 'eye', 'threshold', 'corner'] }),
    V({ id: 'nightvision', tr: 'Gece görüşü', en: 'night-vision footage, green phosphor image, heavy noise, circular scope vignette', look: { grain: 0.75, vignette: 0.95, contrast: 1.15 }, vfx: { nv: 1, scan: 0.15 }, hud: 'nv', shake: 0.3 }),
    V({ id: 'thermal', tr: 'Termal kamera', en: 'thermal imaging camera view, false-colour heat map, crosshair overlay', look: { grain: 0.25, contrast: 1.1, bloom: 0.1, flare: 0 }, vfx: { thermal: 1 }, hud: 'thermal' }),
    V({ id: 'anime', tr: 'Anime arka planı', en: 'anime background art, cel-shaded flat colour areas, painterly clouds, crisp clean lines, vivid sky', look: { saturation: 1.3, contrast: 1.08, grain: 0, bloom: 0.45, ca: 0 }, vfx: { post: 0.55, sharp: 0.5 } }),
    V({ id: 'watercolor', tr: 'Suluboya animasyon', en: 'hand-painted animated film background, watercolour washes, soft edges, lush storybook detail', look: { saturation: 1.15, fade: 0.1, grain: 0.15, bloom: 0.35 }, vfx: { post: 0.3, halftone: 0.15 } }),
    V({ id: 'pixel', tr: 'Retro oyun (piksel)', en: '16-bit pixel art game background, limited palette, crisp square pixels, parallax layers', look: { grain: 0, ca: 0, vignette: 0, bloom: 0.2, saturation: 1.2 }, vfx: { pix: 0.85, post: 0.8 } }),
    V({ id: 'comic', tr: 'Çizgi roman', en: 'comic book panel art, halftone dots, bold inks, flat saturated colour', look: { saturation: 1.3, contrast: 1.2, grain: 0 }, vfx: { halftone: 0.7, post: 0.5, sharp: 0.6 } }),
    V({ id: 'noir', tr: 'Kara film', en: '1940s film noir, black and white, hard shadows, venetian-blind light, wet streets', look: { saturation: 0, contrast: 1.4, grain: 0.5, vignette: 0.65, bloom: 0.25 } }),
    V({ id: 'tiltshift', tr: 'Tilt-shift minyatür', en: 'tilt-shift miniature effect, a narrow band of focus, toy-like saturated colours, seen from above', look: { saturation: 1.35, contrast: 1.12 }, vfx: { tilt: 1 }, cams: ['tiltshift', 'bird', 'high34', 'drone', 'rooftop'] }),
    V({ id: 'polaroid', tr: 'Polaroid', en: 'instant film photograph, soft faded colours, cyan shadows, creamy highlights, white border', look: { fade: 0.22, saturation: 0.9, shadows: [-0.05, 0.08, 0.14], highlights: [0.12, 0.08, 0], grain: 0.3 }, hud: 'polaroid', ar: '1:1' }),
    V({ id: 'y2kcam', tr: "Y2K dijital kamera", en: 'early-2000s digital point-and-shoot photo, harsh on-camera flash, oversharpened, orange date stamp', look: { saturation: 1.15, contrast: 1.1, bloom: 0.2, grain: 0.15 }, vfx: { sharp: 0.75 }, hud: 'datestamp', ar: '4:3' }),
    V({ id: 'lofi', tr: 'Lo-fi estetik', en: 'lo-fi aesthetic, soft pastel tones, grainy, cozy nostalgic mood', look: { fade: 0.25, saturation: 0.85, grain: 0.5, bloom: 0.5, contrast: 0.92 } }),
    V({ id: 'news', tr: 'Haber B-roll', en: 'broadcast news B-roll, neutral colour, deep focus, stable tripod framing', look: { saturation: 0.95, contrast: 1.03, grain: 0.05, vignette: 0.1 }, vfx: { sharp: 0.3 }, cams: ['eye', 'normal50', 'tele', 'sym'] }),
    V({ id: 'timelapse', tr: 'Zaman atlamalı', en: 'timelapse, streaking clouds and light trails, locked-off tripod', speed: 18, cams: ['est', 'tele', 'rooftop', 'xls'] }),
    V({ id: 'slowmo', tr: 'Ağır çekim', en: 'high-frame-rate slow motion, every particle suspended in the air', speed: 0.25 }),
  ];
  CB.VSTYLE = Object.fromEntries(CB.VIDEO_STYLES.map((v) => [v.id, v]));

  /* prompt'lara stil satırı */
  CB.applyVideoStyle = function (P, s) {
    const vs = CB.VSTYLE[s.vstyle];
    if (!vs || !vs.en) return P;
    const line = vs.en.charAt(0).toUpperCase() + vs.en.slice(1) + '.';
    P.soul = line + ' ' + P.soul;
    P.oneshot = 'STYLE: ' + vs.en + '.\n' + P.oneshot;
    P.mj = P.mj.replace(/^/, vs.en + ', ');
    P.video = 'Style: ' + vs.en + '. ' + P.video;
    return P;
  };

  /* ekran arayüzü katmanı (önizleme + dışa aktarma) — t: saniye */
  const pad = (n, k) => String(Math.floor(n)).padStart(k || 2, '0');
  function stamp(seed) {
    const d = new Date(2000 + (seed % 25), (seed >> 5) % 12, 1 + ((seed >> 9) % 28), (seed >> 13) % 24, (seed >> 18) % 60);
    return d;
  }
  CB.drawHud = function (ctx, w, h, id, t, seed) {
    const vs = CB.VSTYLE[id];
    if (!vs || !vs.hud) return;
    const u = h / 1080, m = 48 * u;
    const d = stamp(seed >>> 0); d.setSeconds(d.getSeconds() + Math.floor(t));
    ctx.save();
    ctx.textBaseline = 'top';
    const mono = (px) => `600 ${px * u}px "IBM Plex Mono", ui-monospace, monospace`;
    const shadow = () => { ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4 * u; };
    if (vs.hud === 'cctv') {
      shadow(); ctx.fillStyle = 'rgba(240,240,240,.92)'; ctx.font = mono(34);
      ctx.fillText(`CAM ${pad((seed % 12) + 1)}`, m, m);
      ctx.textAlign = 'right';
      ctx.fillText(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`, w - m, m);
      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(229,72,77,.95)'; ctx.beginPath(); ctx.arc(m + 10 * u, h - m - 16 * u, 10 * u, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(240,240,240,.92)'; ctx.fillText('REC', m + 30 * u, h - m - 32 * u);
    } else if (vs.hud === 'vhs') {
      shadow(); ctx.fillStyle = '#f2f2f2'; ctx.font = mono(46);
      ctx.fillText('PLAY ▶', m, m);
      ctx.fillText(`SP ${pad(Math.floor(t / 3600))}:${pad((t / 60) % 60)}:${pad(t % 60)}`, m, m + 60 * u);
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()];
      ctx.fillText(`${mon} ${pad(d.getDate())} ${1990 + (seed % 10)}`, w - m, h - m - 56 * u);
      ctx.fillText(`${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`, w - m, h - m);
    } else if (vs.hud === 'rec' || vs.hud === 'nv') {
      // vizör köşeleri, REC ve zaman kodu
      ctx.strokeStyle = 'rgba(240,240,240,.85)'; ctx.lineWidth = 3 * u; const k = 70 * u;
      [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * k); ctx.lineTo(x, y); ctx.lineTo(x + sx * k, y); ctx.stroke(); });
      shadow(); ctx.font = mono(34);
      if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.arc(m + 40 * u, m + 42 * u, 12 * u, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(240,240,240,.92)'; ctx.fillText(vs.hud === 'nv' ? 'IR  NV-2' : 'REC', m + 64 * u, m + 24 * u);
      ctx.textAlign = 'right';
      ctx.fillText(`${pad(t / 3600)}:${pad((t / 60) % 60)}:${pad(t % 60)}:${pad((t * 24) % 24)}`, w - m - 24 * u, m + 24 * u);
      ctx.textBaseline = 'bottom'; ctx.fillText('▮▮▮▯  ISO 6400', w - m - 24 * u, h - m - 24 * u);
      if (vs.hud === 'nv') { ctx.strokeStyle = 'rgba(160,255,170,.55)'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(w / 2, h / 2, 40 * u, 0, 7); ctx.moveTo(w / 2 - 90 * u, h / 2); ctx.lineTo(w / 2 + 90 * u, h / 2); ctx.moveTo(w / 2, h / 2 - 90 * u); ctx.lineTo(w / 2, h / 2 + 90 * u); ctx.stroke(); }
    } else if (vs.hud === 'thermal') {
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.5 * u;
      ctx.beginPath(); ctx.moveTo(w / 2 - 60 * u, h / 2); ctx.lineTo(w / 2 - 15 * u, h / 2); ctx.moveTo(w / 2 + 15 * u, h / 2); ctx.lineTo(w / 2 + 60 * u, h / 2);
      ctx.moveTo(w / 2, h / 2 - 60 * u); ctx.lineTo(w / 2, h / 2 - 15 * u); ctx.moveTo(w / 2, h / 2 + 15 * u); ctx.lineTo(w / 2, h / 2 + 60 * u); ctx.stroke();
      shadow(); ctx.fillStyle = '#fff'; ctx.font = mono(30);
      ctx.fillText(`${(18 + (seed % 15) + Math.sin(t) * 0.4).toFixed(1)}°C`, w / 2 + 70 * u, h / 2 - 48 * u);
      const gx = w - m - 30 * u, gy = m, gh = h * 0.4, gr = ctx.createLinearGradient(0, gy + gh, 0, gy);
      ['#120030', '#5a0a8a', '#c4204a', '#ff7a1a', '#ffe36b', '#ffffff'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
      ctx.shadowBlur = 0; ctx.fillStyle = gr; ctx.fillRect(gx, gy, 22 * u, gh);
    } else if (vs.hud === 'datestamp') {
      ctx.font = `700 ${46 * u}px "IBM Plex Mono", monospace`; ctx.fillStyle = '#ff9a2e'; ctx.shadowColor = 'rgba(255,120,0,.6)'; ctx.shadowBlur = 8 * u;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(`'${pad((seed % 9) + 1)}  ${pad(d.getMonth() + 1)}  ${pad(d.getDate())}`, w - m * 1.4, h - m * 1.2);
    } else if (vs.hud === 'polaroid') {
      const b = Math.round(w * 0.05), bb = Math.round(h * 0.17);
      ctx.fillStyle = '#f3efe6';
      ctx.fillRect(0, 0, w, b); ctx.fillRect(0, 0, b, h); ctx.fillRect(w - b, 0, b, h); ctx.fillRect(0, h - bb, w, bb);
    }
    ctx.restore();
  };
})();
