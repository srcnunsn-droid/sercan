// ~38 profesyonel hareketli grafik tasarımı. Her biri 10 paletle çoğaltılır → ~380 hazır şablon.
import type { Design } from './lib';
import { K, adjust, fx, grad, isLight, nul, parts, shape, solid, text } from './lib';

const F = { head: 'Bebas Neue', body: 'Inter', serif: 'Playfair Display', mono: 'JetBrains Mono', impact: 'Arial Black' };
const T = (k: string, label: string, def: string, multiline = false) => ({ k, label, def, multiline });

export const DESIGNS: Design[] = [
  // ================= BAŞLIK / INTRO =================
  { id: 'expo-title', name: 'Expo Kayan Başlık', cat: 'Başlık & Intro', tags: 'title intro modern', dur: 5, fields: [T('title', 'Başlık', 'YENİ SEZON'), T('sub', 'Alt başlık', 'çok yakında')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 120),
    shape(c, { shape: 'rect', w: c.W * 1.2, h: 14 * c.u, fill: c.P.a }, { y: -110 * c.u, kf: { x: K([[0, -c.W * 1.3], [0.7, 0]]) }, mb: true }),
    shape(c, { shape: 'rect', w: c.W * 1.2, h: 14 * c.u, fill: c.P.a2 }, { y: 110 * c.u, kf: { x: K([[0.1, c.W * 1.3], [0.8, 0]]) }, mb: true }),
    text(c, c.V.title, { font: F.head, size: 210, weight: 400, anim: 'tracking', animD: 1.4 }, { start: 0.4, kf: { opacity: K([[0, 0], [0.4, 1]]), y: K([[0, 40 * c.u], [0.8, 0]]) } }),
    text(c, c.V.sub, { font: F.body, size: 40, weight: 500, color: c.P.dim, anim: 'fadeUp', animD: 0.6 }, { start: 1.1, y: 175 * c.u }),
    adjust(c, [fx('vignette', { amount: 0.45 }), fx('grain', { amount: 0.05 })]),
  ] },
  { id: 'mask-reveal', name: 'Maske Açılış', cat: 'Başlık & Intro', tags: 'reveal wipe clean', dur: 4.5, fields: [T('title', 'Başlık', 'KADRAJ'), T('sub', 'Alt başlık', 'hikâyeni anlat')], build: c => [
    solid(c, c.P.bg),
    shape(c, { shape: 'rect', w: 1000 * c.u, h: 260 * c.u, fill: c.P.a }, { kf: { scale: K([[0, 0.001, 'hold'], [0.05, 0.02], [0.6, 1]]), x: K([[0.6, 0], [1.3, 1100 * c.u, 'inout']]) }, mb: true }),
    text(c, c.V.title, { font: F.head, size: 230 }, { start: 0.9, kf: { opacity: K([[0, 0, 'hold'], [0.05, 1]]), scale: K([[0, 1.15], [1.2, 1]]) } }),
    shape(c, { shape: 'line', w: 520 * c.u, h: 4, stroke: c.P.a2, strokeW: 4, drawOn: 0.8 }, { start: 1.6, y: 150 * c.u }),
    text(c, c.V.sub, { font: F.serif, size: 48, weight: 600, color: c.P.dim, anim: 'blurIn', animD: 0.8 }, { start: 2, y: 210 * c.u }),
  ] },
  { id: 'ring-burst', name: 'Halka Patlaması', cat: 'Başlık & Intro', tags: 'circle burst energetic', dur: 4, fields: [T('title', 'Başlık', 'BOOM!')], build: c => [
    grad(c, c.P.bg2, c.P.bg, 90),
    ...[0, 1, 2, 3].map(i => shape(c, { shape: 'circle', w: 300 * c.u, h: 300 * c.u, fill: 'transparent', stroke: i % 2 ? c.P.a2 : c.P.a, strokeW: (14 - i * 3) * c.u }, { start: i * 0.12, kf: { scale: K([[0, 0.1], [1.4, 3.2 + i]]), opacity: K([[0, 1], [1.4, 0, 'in']]) }, name: 'ring' + i })),
    parts(c, 'sparks', { rate: 260, emitW: 20, emitH: 20, angle: 0, spread: 180, gravity: 300, color: c.P.a2, color2: c.P.a }, { dur: 1.2 }),
    text(c, c.V.title, { font: F.impact, size: 220, weight: 900, stroke: c.P.bg, strokeW: 10 }, { start: 0.15, kf: { scale: K([[0, 0], [0.5, 1, 'back']]), rotation: K([[0, -12], [0.6, 0, 'back']]) } }),
  ] },
  { id: 'split-panels', name: 'Ayrılan Paneller', cat: 'Başlık & Intro', tags: 'split doors reveal', dur: 4.5, fields: [T('title', 'Başlık', 'BÜYÜK AÇILIŞ'), T('sub', 'Alt başlık', '14 Kasım · İstanbul')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 160),
    text(c, c.V.title, { font: F.head, size: 190, anim: 'tracking', animD: 1.6 }, { start: 0.5 }),
    text(c, c.V.sub, { font: F.body, size: 38, weight: 600, color: c.P.a2 }, { start: 1, y: 140 * c.u, kf: { opacity: K([[0, 0], [0.5, 1]]) } }),
    shape(c, { shape: 'rect', w: c.W / 2 + 4, h: c.H, fill: c.P.a }, { x: -c.W / 4, kf: { x: K([[0.3, -c.W / 4], [1.2, -c.W * 0.8, 'inout']]) }, mb: true }),
    shape(c, { shape: 'rect', w: c.W / 2 + 4, h: c.H, fill: c.P.a }, { x: c.W / 4, kf: { x: K([[0.3, c.W / 4], [1.2, c.W * 0.8, 'inout']]) }, mb: true }),
  ] },
  { id: 'glitch-title', name: 'Glitch Başlık', cat: 'Başlık & Intro', tags: 'glitch cyber tech', dur: 4, fields: [T('title', 'Başlık', 'SİSTEM HATASI'), T('sub', 'Alt başlık', 'erişim reddedildi')], build: c => [
    solid(c, c.P.bg),
    shape(c, { shape: 'rect', w: c.W, h: 2, fill: c.P.a2 }, { op: 0.3, expr: { y: `((time*600) % ${Math.round(c.H)}) - ${Math.round(c.H / 2)}` } }),
    text(c, c.V.title, { font: F.impact, size: 150, weight: 900, anim: 'glitchIn', animD: 1 }, { fx: [fx('chroma', { px: 10 }), fx('glitch', { amount: 0.5, rate: 0.35 })], expr: { opacity: 'random() > 0.92 ? 0.3 : 1' } }),
    text(c, c.V.sub, { font: F.mono, size: 34, weight: 600, color: c.P.a2, anim: 'typewriter', animD: 1.2 }, { start: 1, y: 120 * c.u }),
    adjust(c, [fx('scanlines', { amount: 0.25 }), fx('vignette', { amount: 0.6 })]),
  ] },
  { id: 'cinema-letterbox', name: 'Sinematik Letterbox', cat: 'Sinematik', tags: 'film trailer elegant', dur: 6, fields: [T('title', 'Başlık', 'SON IŞIK'), T('sub', 'Alt başlık', 'bir kısa film')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 90),
    parts(c, 'dust', { color: c.P.a2, color2: c.P.a, emitW: c.W * 1.1, emitH: c.H }),
    text(c, c.V.title, { font: F.serif, size: 150, weight: 600, anim: 'blurIn', animD: 2 }, { start: 0.6, kf: { scale: K([[0, 1.08, 'linear'], [5.4, 1, 'linear']]) } }),
    text(c, c.V.sub.toUpperCase(), { font: F.body, size: 26, weight: 500, color: c.P.dim, anim: 'tracking', animD: 2 }, { start: 1.8, y: 120 * c.u }),
    adjust(c, [fx('letterbox', { ratio: 2.39 }), fx('grain', { amount: 0.08 }), fx('vignette', { amount: 0.5 })], { tIn: { type: 'fade', d: 1 } }),
  ] },
  { id: 'neon-sign', name: 'Neon Tabela', cat: 'Başlık & Intro', tags: 'neon glow night', dur: 5, fields: [T('title', 'Başlık', 'AÇIK'), T('sub', 'Alt başlık', '7/24 burada')], build: c => [
    solid(c, c.P.bg),
    shape(c, { shape: 'rect', w: 900 * c.u, h: 420 * c.u, fill: 'transparent', stroke: c.P.a2, strokeW: 8 * c.u, radius: 40 * c.u, drawOn: 1.2 }, { fx: [fx('glow', { amount: 1.1, radius: 26, threshold: 0.2 })] }),
    text(c, c.V.title, { font: F.head, size: 220, color: c.P.a }, { start: 0.9, fx: [fx('glow', { amount: 1.2, radius: 30, threshold: 0.2 })], expr: { opacity: 'time < 1.6 ? (noise(time*30) > 0 ? 1 : 0.15) : (random() > 0.97 ? 0.4 : 1)' } }),
    text(c, c.V.sub, { font: F.mono, size: 36, color: c.P.a2 }, { start: 1.8, y: 150 * c.u, fx: [fx('glow', { amount: 0.8, radius: 16, threshold: 0.2 })], kf: { opacity: K([[0, 0], [0.4, 1]]) } }),
  ] },
  { id: 'kinetic-words', name: 'Kinetik Kelimeler', cat: 'Kinetik Tipografi', tags: 'kinetic words fast', dur: 4.5, fields: [T('title', 'Cümle', 'HIZLI DÜŞÜN CESUR YAP')], build: c => {
    const words = c.V.title.split(/\s+/).filter(Boolean).slice(0, 8); const step = 3.2 / Math.max(1, words.length);
    return [solid(c, c.P.bg), ...words.map((w, i) => text(c, w, { font: F.head, size: 260, color: i % 2 ? c.P.a : c.P.text }, { start: i * step, dur: step + 0.02, kf: { scale: K([[0, 1.6], [0.25, 1]]), rotation: K([[0, i % 2 ? 8 : -8], [0.3, 0]]) }, mb: true })),
      text(c, c.V.title, { font: F.head, size: 120, maxW: 0.8, anim: 'pop', animD: 0.4 }, { start: words.length * step + 0.05 }), adjust(c, [fx('shake', { amount: 6, freq: 18 })], { dur: words.length * step })];
  } },
  { id: 'typewriter', name: 'Terminal Daktilo', cat: 'Kinetik Tipografi', tags: 'code hacker typewriter', dur: 5, fields: [T('title', 'Komut', '> proje başlatılıyor...'), T('sub', 'Çıktı', 'BAŞARILI ✓')], build: c => [
    solid(c, c.P.bg), shape(c, { shape: 'rect', w: 1200 * c.u * (c.portrait ? 0.85 : 1), h: 520 * c.u, fill: c.P.bg2, radius: 18 * c.u, stroke: c.P.a, strokeW: 2 }, { kf: { scale: K([[0, 0.9], [0.5, 1]]), opacity: K([[0, 0], [0.4, 1]]) } }),
    ...[0, 1, 2].map(i => shape(c, { shape: 'circle', w: 22 * c.u, h: 22 * c.u, fill: ['#ff5f57', '#febc2e', '#28c840'][i] }, { x: ((c.portrait ? -470 : -560) + i * 34) * c.u, y: -225 * c.u, start: 0.3 })),
    text(c, c.V.title, { font: F.mono, size: 52, color: c.P.a, anim: 'typewriter', animD: 2, align: 'left', maxW: c.portrait ? 0.85 : 0.55 }, { start: 0.6, y: -60 * c.u }),
    text(c, c.V.sub, { font: F.mono, size: 64, weight: 600, color: c.P.a2, anim: 'pop', animD: 0.4, align: 'left', maxW: c.portrait ? 0.85 : 0.55 }, { start: 3, y: 60 * c.u }),
    adjust(c, [fx('scanlines', { amount: 0.15 })]),
  ] },
  { id: 'logo-ring', name: 'Logo Halka Reveal', cat: 'Logo', tags: 'logo reveal brand', dur: 4.5, fields: [T('title', 'Marka', 'MARKA'), T('sub', 'Slogan', 'geleceği tasarla')], build: c => [
    grad(c, c.P.bg2, c.P.bg, 45),
    nul(c, 'logo', { kf: { rotation: K([[0, -90], [1.6, 0]]) } }),
    shape(c, { shape: 'circle', w: 360 * c.u, h: 360 * c.u, fill: 'transparent', stroke: c.P.a, strokeW: 10 * c.u, drawOn: 1.2 }, { parent: 'logo', fx: [fx('glow', { amount: 0.7, radius: 20 })] }),
    shape(c, { shape: 'polygon', points: 6, w: 200 * c.u, h: 200 * c.u, fill: c.P.a2 }, { start: 0.8, parent: 'logo', kf: { scale: K([[0, 0], [0.6, 1, 'back']]) }, expr: { rotation: 'time*30' } }),
    text(c, c.V.title, { font: F.head, size: 120, anim: 'tracking', animD: 1 }, { start: 1.4, y: 290 * c.u }),
    text(c, c.V.sub, { font: F.body, size: 30, color: c.P.dim }, { start: 2, y: 360 * c.u, kf: { opacity: K([[0, 0], [0.5, 1]]) } }),
  ] },
  { id: 'logo-sparks', name: 'Kıvılcımlı Logo', cat: 'Logo', tags: 'logo particles epic', dur: 4.5, fields: [T('title', 'Marka', 'STUDIO')], build: c => [
    solid(c, c.P.bg),
    parts(c, 'sparks', { rate: 300, angle: 0, spread: 180, gravity: 200, speed: 700, color: c.P.a2, color2: c.P.a, emitW: 400 * c.u, emitH: 40 }, { dur: 1.5, start: 0.6 }),
    shape(c, { shape: 'star', points: 4, w: 900 * c.u, h: 60 * c.u, fill: c.P.a2 }, { start: 0.6, dur: 0.8, kf: { scale: K([[0, 0], [0.15, 1], [0.8, 0, 'in']]) }, blend: 'lighter' }),
    text(c, c.V.title, { font: F.head, size: 240, anim: 'blurIn', animD: 0.9 }, { start: 0.65, fx: [fx('glow', { amount: 0.5 })], kf: { scale: K([[0, 1.3], [1.2, 1]]) } }),
    adjust(c, [fx('vignette', { amount: 0.6 })]),
  ] },
  // ================= ALT BANT =================
  { id: 'lt-modern', name: 'Modern Alt Bant', cat: 'Alt Bant', tags: 'lower third name', dur: 5, fields: [T('name', 'İsim', 'Ayşe Yılmaz'), T('role', 'Unvan', 'Yaratıcı Yönetmen')], build: c => { const x0 = -c.W / 2 + 120 * c.u + 280 * c.u, y0 = c.H / 2 - 190 * c.u; return [
    shape(c, { shape: 'rect', w: 10 * c.u, h: 110 * c.u, fill: c.P.a }, { x: x0 - 290 * c.u, y: y0, kf: { scale: K([[0, 0], [0.4, 1]]) }, tOut: { type: 'fade', d: 0.3 } }),
    shape(c, { shape: 'rect', w: 560 * c.u, h: 110 * c.u, fill: c.P.bg2 }, { x: x0, y: y0, op: 0.92, kf: { x: K([[0.1, x0 - 600 * c.u], [0.7, x0]]) }, tOut: { type: 'slideLeft', d: 0.4 } }),
    text(c, c.V.name, { font: F.body, size: 46, weight: 800, align: 'left', maxW: 0.28 }, { start: 0.4, x: x0 - 3 * c.u, y: y0 - 18 * c.u, kf: { opacity: K([[0, 0], [0.3, 1]]), x: K([[0, x0 - 40 * c.u], [0.5, x0 - 3 * c.u]]) }, tOut: { type: 'fade', d: 0.3 } }),
    text(c, c.V.role, { font: F.body, size: 28, weight: 500, color: c.P.a2, align: 'left', maxW: 0.28 }, { start: 0.6, x: x0 - 3 * c.u, y: y0 + 28 * c.u, kf: { opacity: K([[0, 0], [0.3, 1]]) }, tOut: { type: 'fade', d: 0.3 } }),
  ]; } },
  { id: 'lt-line', name: 'Çizgi Alt Bant', cat: 'Alt Bant', tags: 'lower third minimal line', dur: 5, fields: [T('name', 'İsim', 'Mehmet Kaya'), T('role', 'Unvan', 'Belgesel Yapımcısı')], build: c => { const y0 = c.H / 2 - 170 * c.u; return [
    shape(c, { shape: 'line', w: 520 * c.u, h: 2, stroke: c.P.a, strokeW: 3 * c.u, drawOn: 0.6 }, { y: y0, tOut: { type: 'fade', d: 0.3 } }),
    text(c, c.V.name.toUpperCase(), { font: F.body, size: 40, weight: 700, anim: 'tracking', animD: 0.9 }, { start: 0.3, y: y0 - 38 * c.u, tOut: { type: 'fade', d: 0.3 } }),
    text(c, c.V.role, { font: F.serif, size: 30, weight: 600, color: c.P.dim, anim: 'fadeUp', animD: 0.5 }, { start: 0.6, y: y0 + 36 * c.u, tOut: { type: 'fade', d: 0.3 } }),
  ]; } },
  { id: 'lt-pill', name: 'Etiket Alt Bant', cat: 'Alt Bant', tags: 'pill tag social', dur: 4.5, fields: [T('name', 'Kullanıcı', '@kadrajstudio'), T('role', 'Etiket', 'TAKİP ET')], build: c => { const y0 = c.H / 2 - 170 * c.u; return [
    shape(c, { shape: 'rect', w: 620 * c.u, h: 100 * c.u, fill: c.P.a, radius: 50 * c.u }, { y: y0, kf: { scale: K([[0, 0], [0.5, 1, 'back']]) }, tOut: { type: 'zoomIn', d: 0.3 } }),
    shape(c, { shape: 'rect', w: 200 * c.u, h: 64 * c.u, fill: c.P.text, radius: 32 * c.u }, { y: y0, x: 190 * c.u, start: 0.35, kf: { scale: K([[0, 0], [0.4, 1, 'back']]) }, tOut: { type: 'zoomIn', d: 0.3 } }),
    text(c, c.V.name, { font: F.body, size: 40, weight: 800, color: c.P.bg, align: 'left', maxW: 0.2 }, { start: 0.3, x: -100 * c.u, y: y0, kf: { opacity: K([[0, 0], [0.3, 1]]) }, tOut: { type: 'fade', d: 0.2 } }),
    text(c, c.V.role, { font: F.body, size: 26, weight: 900, color: c.P.a }, { start: 0.5, x: 190 * c.u, y: y0, kf: { opacity: K([[0, 0], [0.3, 1]]) }, tOut: { type: 'fade', d: 0.2 } }),
  ]; } },
  { id: 'lt-corner', name: 'Köşe Bilgi Kartı', cat: 'Alt Bant', tags: 'corner info location', dur: 5, fields: [T('name', 'Başlık', 'KAPADOKYA'), T('role', 'Detay', 'Nevşehir · 05:42')], build: c => { const x0 = c.W / 2 - 300 * c.u, y0 = -c.H / 2 + 140 * c.u; return [
    shape(c, { shape: 'rect', w: 460 * c.u, h: 150 * c.u, fill: c.P.bg, radius: 12 * c.u, stroke: c.P.a, strokeW: 2, drawOn: 0.8 }, { x: x0, y: y0, op: 0.9, tOut: { type: 'fade', d: 0.3 } }),
    shape(c, { shape: 'circle', w: 18 * c.u, h: 18 * c.u, fill: c.P.a }, { x: x0 - 190 * c.u, y: y0 - 30 * c.u, start: 0.4, expr: { opacity: 'sin(time*6) > 0 ? 1 : 0.3' } }),
    text(c, c.V.name, { font: F.head, size: 64, align: 'left', maxW: 0.2 }, { start: 0.5, x: x0 + 20 * c.u, y: y0 - 22 * c.u, kf: { opacity: K([[0, 0], [0.3, 1]]) }, tOut: { type: 'fade', d: 0.3 } }),
    text(c, c.V.role, { font: F.mono, size: 26, color: c.P.dim, align: 'left', maxW: 0.2, anim: 'typewriter', animD: 0.8 }, { start: 0.8, x: x0 + 20 * c.u, y: y0 + 34 * c.u, tOut: { type: 'fade', d: 0.3 } }),
  ]; } },
  // ================= SOSYAL MEDYA =================
  { id: 'subscribe', name: 'Abone Ol Butonu', cat: 'Sosyal Medya', tags: 'youtube subscribe bell', dur: 4, fields: [T('cta', 'Buton', 'ABONE OL')], build: c => { const y0 = c.H / 2 - 180 * c.u; return [
    shape(c, { shape: 'rect', w: 420 * c.u, h: 110 * c.u, fill: '#ff1f3d', radius: 16 * c.u }, { y: y0, kf: { scale: K([[0, 0], [0.45, 1, 'back'], [1.6, 1, 'hold'], [1.7, 0.92], [1.85, 1, 'back']]) }, tOut: { type: 'zoomIn', d: 0.3 }, name: 'btn' }),
    text(c, c.V.cta, { font: F.body, size: 46, weight: 900, color: '#ffffff' }, { start: 0.2, y: y0, kf: { opacity: K([[0, 0], [0.2, 1]]) }, tOut: { type: 'zoomIn', d: 0.3 } }),
    shape(c, { shape: 'triangle', w: 60 * c.u, h: 70 * c.u, fill: c.P.text }, { start: 1.1, x: 140 * c.u, y: y0 + 90 * c.u, rot: -20, kf: { x: K([[0, 400 * c.u], [0.5, 140 * c.u]]), y: K([[0, y0 + 300 * c.u], [0.5, y0 + 90 * c.u]]), scale: K([[0.55, 1], [0.6, 0.85], [0.75, 1]]) }, dur: 2 }),
    parts(c, 'confetti', { rate: 200, speed: 600, gravity: 800, size: 10, color: c.P.a, color2: c.P.a2, emitW: 200 * c.u }, { start: 1.7, dur: 1.4, y: y0 }),
  ]; } },
  { id: 'like-share', name: 'Beğen · Yorum · Paylaş', cat: 'Sosyal Medya', tags: 'like comment share', dur: 4, fields: [T('item1', '1', 'BEĞEN'), T('item2', '2', 'YORUM YAP'), T('item3', '3', 'PAYLAŞ')], build: c => { const y0 = c.H / 2 - 170 * c.u; const xs = c.portrait ? [0, 0, 0] : [-380, 0, 380]; const ys = c.portrait ? [-240, -120, 0] : [0, 0, 0]; return [
    ...[c.V.item1, c.V.item2, c.V.item3].flatMap((s, i) => [
      shape(c, { shape: 'rect', w: 330 * c.u, h: 90 * c.u, fill: i === 1 ? c.P.a2 : c.P.a, radius: 45 * c.u }, { x: xs[i] * c.u, y: y0 + ys[i] * c.u, start: i * 0.25, kf: { scale: K([[0, 0], [0.45, 1, 'back']]), y: K([[1.6 - i * 0.25, y0 + ys[i] * c.u], [1.75 - i * 0.25, y0 + (ys[i] - 20) * c.u], [1.95 - i * 0.25, y0 + ys[i] * c.u, 'back']]) }, tOut: { type: 'fade', d: 0.3 } }),
      text(c, s, { font: F.body, size: 34, weight: 900, color: c.P.bg }, { x: xs[i] * c.u, y: y0 + ys[i] * c.u, start: i * 0.25 + 0.15, kf: { opacity: K([[0, 0], [0.2, 1]]), y: K([[1.45, y0 + ys[i] * c.u], [1.6, y0 + (ys[i] - 20) * c.u], [1.8, y0 + ys[i] * c.u, 'back']]) }, tOut: { type: 'fade', d: 0.3 } }),
    ]),
  ]; } },
  { id: 'reels-hook', name: 'Reels Kanca Yazısı', cat: 'Sosyal Medya', tags: 'reels tiktok hook caption', dur: 3.5, fields: [T('title', 'Kanca', 'BUNU KİMSE SÖYLEMİYOR'), T('sub', 'Alt', '👇 sonuna kadar izle')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 160),
    shape(c, { shape: 'rect', w: (c.portrait ? 900 : 1300) * c.u, h: 300 * c.u, fill: c.P.a, radius: 24 * c.u }, { rot: -3, kf: { scale: K([[0, 0], [0.35, 1, 'back']]) }, y: -60 * c.u }),
    text(c, c.V.title, { font: F.impact, size: c.portrait ? 92 : 110, weight: 900, color: c.P.text, stroke: c.P.bg, strokeW: 10, maxW: c.portrait ? 0.78 : 0.62 }, { y: -60 * c.u, rot: -3, start: 0.15, kf: { scale: K([[0, 1.4], [0.3, 1]]) }, expr: { rotation: '-3 + wiggle(3, 1.2) - value' } }),
    text(c, c.V.sub, { font: F.body, size: 46, weight: 800, anim: 'wordByWord', animD: 0.8 }, { start: 0.9, y: 170 * c.u }),
  ] },
  { id: 'follow-cta', name: 'Takip Et CTA', cat: 'Sosyal Medya', tags: 'follow cta instagram', dur: 4, fields: [T('name', 'Hesap', '@kadrajstudio'), T('cta', 'Çağrı', 'Daha fazlası için takip et')], build: c => [
    grad(c, c.P.a, c.P.a2, 135),
    shape(c, { shape: 'circle', w: 220 * c.u, h: 220 * c.u, fill: c.P.bg, stroke: c.P.text, strokeW: 8 * c.u }, { y: -120 * c.u, kf: { scale: K([[0, 0], [0.5, 1, 'back']]) } }),
    text(c, c.V.name.replace('@', '').slice(0, 1).toUpperCase(), { font: F.head, size: 140, color: c.P.a }, { y: -115 * c.u, start: 0.3, kf: { scale: K([[0, 0], [0.4, 1, 'back']]) } }),
    text(c, c.V.name, { font: F.body, size: 60, weight: 900, color: c.P.bg, anim: 'fadeUp', animD: 0.5 }, { start: 0.6, y: 60 * c.u }),
    text(c, c.V.cta, { font: F.body, size: 34, weight: 600, color: c.P.bg, anim: 'fadeUp', animD: 0.5 }, { start: 0.9, y: 130 * c.u }),
  ] },
  // ================= GEÇİŞLER =================
  { id: 'tr-stripes', name: 'Şerit Geçiş', cat: 'Geçişler', tags: 'transition stripes wipe', dur: 1.4, fields: [], thumbT: 0.6, build: c => [0, 1, 2, 3].map(i => shape(c, { shape: 'rect', w: c.W * 1.6, h: c.H / 4 + 4, fill: [c.P.a, c.P.a2, c.P.bg2, c.P.a][i] }, { y: -c.H * 3 / 8 + (i * c.H) / 4, start: i * 0.05, dur: 1.2, kf: { x: K([[0, -c.W * 1.6, 'inout'], [0.5, 0, 'inout'], [1.1, c.W * 1.6, 'inout']]) }, mb: true })) },
  { id: 'tr-circle', name: 'Daire Geçiş', cat: 'Geçişler', tags: 'transition circle iris', dur: 1.3, fields: [], thumbT: 0.6, build: c => [
    shape(c, { shape: 'circle', w: 100, h: 100, fill: c.P.a2 }, { dur: 1.3, kf: { scale: K([[0, 0, 'inout'], [0.5, Math.hypot(c.W, c.H) / 92, 'inout'], [0.8, Math.hypot(c.W, c.H) / 92, 'hold'], [1.3, 0, 'inout']]) } }),
    shape(c, { shape: 'circle', w: 100, h: 100, fill: c.P.a }, { start: 0.1, dur: 1.1, kf: { scale: K([[0, 0, 'inout'], [0.45, Math.hypot(c.W, c.H) / 92, 'inout'], [0.65, Math.hypot(c.W, c.H) / 92, 'hold'], [1.1, 0, 'inout']]) } }),
  ] },
  { id: 'tr-flash', name: 'Flaş Zoom Geçiş', cat: 'Geçişler', tags: 'transition flash zoom punch', dur: 0.8, fields: [], thumbT: 0.35, build: c => [
    adjust(c, [fx('glow', { amount: 1.2, radius: 30, threshold: 0.3 })], { dur: 0.8, kf: { opacity: K([[0, 0], [0.35, 1], [0.8, 0]]) } }),
    solid(c, '#ffffff', { dur: 0.8, kf: { opacity: K([[0, 0, 'linear'], [0.3, 0.95, 'linear'], [0.8, 0, 'out']]) } }),
  ] },
  { id: 'tr-diagonal', name: 'Diyagonal Panel', cat: 'Geçişler', tags: 'transition diagonal slash', dur: 1.2, fields: [], thumbT: 0.5, build: c => [
    shape(c, { shape: 'rect', w: c.W * 0.7, h: c.H * 2.2, fill: c.P.a }, { rot: 20, dur: 1.1, kf: { x: K([[0, -c.W * 1.2, 'inout'], [1, c.W * 1.2, 'inout']]) }, mb: true }),
    shape(c, { shape: 'rect', w: c.W * 0.5, h: c.H * 2.2, fill: c.P.a2 }, { rot: 20, start: 0.1, dur: 1.1, kf: { x: K([[0, -c.W * 1.2, 'inout'], [1, c.W * 1.2, 'inout']]) }, mb: true }),
  ] },
  { id: 'tr-glitch', name: 'Glitch Geçiş', cat: 'Geçişler', tags: 'transition glitch rgb', dur: 0.7, fields: [], thumbT: 0.3, build: c => [
    adjust(c, [fx('glitch', { amount: 1, rate: 1 }), fx('chroma', { px: 22 }), fx('pixelate', { size: 10 })], { dur: 0.7 }),
  ] },
  // ================= İNFOGRAFİK =================
  { id: 'stat-counter', name: 'İstatistik Sayacı', cat: 'İnfografik', tags: 'number counter stat data', dur: 4.5, fields: [T('num', 'Sayı', '1250000'), T('label', 'Etiket', 'mutlu kullanıcı'), T('sub', 'Ek ifade', '+')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 120),
    text(c, '0', { font: F.head, size: 260, color: c.P.a, counter: { from: 0, to: Number(c.V.num) || 0, dec: 0, prefix: '', suffix: c.V.sub, dur: 2.2 } }, { y: -40 * c.u, kf: { scale: K([[0, 0.8], [0.6, 1]]) } }),
    shape(c, { shape: 'line', w: 600 * c.u, h: 2, stroke: c.P.a2, strokeW: 4 * c.u, drawOn: 1.4 }, { y: 100 * c.u, start: 0.3 }),
    text(c, c.V.label.toUpperCase(), { font: F.body, size: 40, weight: 700, color: c.P.text, anim: 'tracking', animD: 1.2 }, { start: 0.5, y: 160 * c.u }),
  ] },
  { id: 'progress', name: 'İlerleme Çubuğu', cat: 'İnfografik', tags: 'progress bar percent loading', dur: 4, fields: [T('num', 'Yüzde', '87'), T('label', 'Etiket', 'Müşteri memnuniyeti')], build: c => { const w = 1100 * c.u * c.hx * (c.portrait ? 1.6 : 1), pct = Math.min(100, Number(c.V.num) || 0) / 100; return [
    solid(c, c.P.bg),
    text(c, c.V.label, { font: F.body, size: 46, weight: 700, align: 'left', maxW: c.portrait ? 0.85 : 0.57 }, { y: -90 * c.u, kf: { opacity: K([[0, 0], [0.4, 1]]) } }),
    shape(c, { shape: 'rect', w, h: 40 * c.u, fill: c.P.bg2, radius: 20 * c.u }),
    shape(c, { shape: 'line', w: Math.max(1, w * pct - 40 * c.u), h: 2, stroke: c.P.a, strokeW: 40 * c.u, drawOn: 2, drawDelay: 0.3 }, { x: -w / 2 + (w * pct) / 2 }),
    text(c, '0', { font: F.head, size: 110, color: c.P.a2, counter: { from: 0, to: Number(c.V.num) || 0, dec: 0, prefix: '%', suffix: '', dur: 2, delay: 0.3 } }, { y: 110 * c.u, x: w / 2 - 100 * c.u }),
  ]; } },
  { id: 'quote', name: 'Alıntı Kartı', cat: 'İnfografik', tags: 'quote testimonial', dur: 6, fields: [T('quote', 'Alıntı', 'Hayal edebiliyorsan, yapabilirsin.', true), T('author', 'Kişi', 'Walt Disney')], build: c => [
    grad(c, c.P.bg2, c.P.bg, 200),
    text(c, '“', { font: F.serif, size: 420, color: c.P.a }, { x: -520 * c.u, y: -160 * c.u, op: 0.8, kf: { opacity: K([[0, 0], [0.6, 0.8]]), y: K([[0, -100 * c.u], [0.8, -160 * c.u]]) } }),
    text(c, c.V.quote, { font: F.serif, size: 78, weight: 600, anim: 'fadeUp', animD: 1.4, maxW: 0.7, lineH: 1.25 }, { start: 0.4 }),
    shape(c, { shape: 'line', w: 120 * c.u, h: 2, stroke: c.P.a2, strokeW: 3 * c.u, drawOn: 0.6 }, { start: 1.6, y: 190 * c.u }),
    text(c, '— ' + c.V.author, { font: F.body, size: 34, weight: 600, color: c.P.dim, anim: 'fadeUp', animD: 0.5 }, { start: 1.9, y: 240 * c.u }),
  ] },
  { id: 'bullets', name: 'Madde Listesi', cat: 'İnfografik', tags: 'list bullets steps', dur: 5, fields: [T('title', 'Başlık', '3 ADIMDA BAŞARI'), T('item1', 'Madde 1', 'Fikri yaz'), T('item2', 'Madde 2', 'Hikâyeyi kur'), T('item3', 'Madde 3', 'Paylaş ve büyü')], build: c => [
    solid(c, c.P.bg),
    text(c, c.V.title, { font: F.head, size: 110, color: c.P.a, anim: 'tracking', animD: 1 }, { y: -260 * c.u }),
    ...[c.V.item1, c.V.item2, c.V.item3].flatMap((s, i) => [
      shape(c, { shape: 'circle', w: 70 * c.u, h: 70 * c.u, fill: c.P.a2 }, { start: 0.6 + i * 0.4, x: (c.portrait ? -380 : -420) * c.u, y: (-60 + i * 130) * c.u, kf: { scale: K([[0, 0], [0.4, 1, 'back']]) } }),
      text(c, String(i + 1), { font: F.head, size: 50, color: c.P.bg }, { start: 0.7 + i * 0.4, x: (c.portrait ? -380 : -420) * c.u, y: (-58 + i * 130) * c.u }),
      text(c, s, { font: F.body, size: 54, weight: 700, align: 'left', maxW: c.portrait ? 0.62 : 0.38 }, { start: 0.75 + i * 0.4, x: c.portrait ? 40 * c.u : 0, y: (-60 + i * 130) * c.u, kf: { opacity: K([[0, 0], [0.4, 1]]), x: K([[0, 60 * c.u], [0.5, 0]]) } }),
    ]),
  ] },
  // ================= ARKA PLAN DÖNGÜLERİ =================
  { id: 'bg-blobs', name: 'Akışkan Gradyan', cat: 'Arka Plan', tags: 'background loop gradient blobs', dur: 10, fields: [], thumbT: 3, build: c => [
    grad(c, c.P.bg, c.P.bg2, 135),
    ...[0, 1, 2].map(i => shape(c, { shape: 'circle', w: 900 * c.u, h: 900 * c.u, fill: [c.P.a, c.P.a2, c.P.bg2][i] }, { blur: 140, op: isLight(c.P) ? 0.4 : 0.55, blend: isLight(c.P) ? 'multiply' : 'screen', expr: { x: `sin(time*${0.3 + i * 0.13} + ${i * 2}) * ${Math.round(c.W * 0.3)}`, y: `cos(time*${0.25 + i * 0.1} + ${i}) * ${Math.round(c.H * 0.3)}` } })),
    adjust(c, [fx('grain', { amount: 0.06 })]),
  ] },
  { id: 'bg-geo', name: 'Geometrik Döngü', cat: 'Arka Plan', tags: 'background loop geometric shapes', dur: 10, fields: [], thumbT: 2, build: c => [
    solid(c, c.P.bg), nul(c, 'merkez', { expr: { rotation: 'time*12' } }),
    ...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, r = (260 + (i % 3) * 140) * c.u; return shape(c, { shape: i % 3 === 0 ? 'triangle' : i % 3 === 1 ? 'polygon' : 'rect', points: 6, w: 90 * c.u, h: 90 * c.u, fill: 'transparent', stroke: i % 2 ? c.P.a : c.P.a2, strokeW: 4 * c.u }, { parent: 'merkez', x: Math.cos(a) * r, y: Math.sin(a) * r, expr: { rotation: `time*${i % 2 ? 40 : -60}`, scale: `1 + sin(time*2 + ${i})*0.15` } }); }),
  ] },
  { id: 'bg-stars', name: 'Yıldız Tozu', cat: 'Arka Plan', tags: 'background stars dust space', dur: 10, fields: [], thumbT: 6, build: c => [
    grad(c, c.P.bg, c.P.bg2, 90), parts(c, 'dust', { rate: 30, color: c.P.text, color2: c.P.a2, emitW: c.W * 1.1, emitH: c.H * 1.1, size: 4, sizeEnd: 9 }),
    parts(c, 'dust', { rate: 8, color: c.P.a, color2: c.P.a2, emitW: c.W, emitH: c.H, size: 18, sizeEnd: 40 }), adjust(c, [fx('vignette', { amount: 0.6 })]),
  ] },
  // ================= KUTLAMA =================
  { id: 'snow-scene', name: 'Kar Sahnesi', cat: 'Kutlama', tags: 'winter snow christmas new year', dur: 6, fields: [T('title', 'Başlık', 'MUTLU YILLAR'), T('sub', 'Alt', '2027')], build: c => [
    grad(c, c.P.bg2, c.P.bg, 90), parts(c, 'snow', { emitW: c.W * 1.2 }, { y: -c.H / 2 - 20 }),
    text(c, c.V.title, { font: F.serif, size: 150, weight: 800, anim: 'blurIn', animD: 1.4 }, { start: 0.5, fx: [fx('glow', { amount: 0.4 })] }),
    text(c, c.V.sub, { font: F.head, size: 120, color: c.P.a, anim: 'pop', animD: 0.5 }, { start: 1.6, y: 150 * c.u }),
  ] },
  { id: 'confetti', name: 'Konfeti Kutlama', cat: 'Kutlama', tags: 'celebration party congrats', dur: 5, fields: [T('title', 'Başlık', 'TEBRİKLER!'), T('sub', 'Alt', '100.000 abone')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 135),
    parts(c, 'confetti', { color: c.P.a, color2: c.P.a2, emitW: 100 }, { x: -c.W * 0.4, y: c.H * 0.45, dur: 2.5, start: 0.2 }),
    parts(c, 'confetti', { color: c.P.a2, color2: c.P.text, emitW: 100, seed: 9 }, { x: c.W * 0.4, y: c.H * 0.45, dur: 2.5, start: 0.3 }),
    text(c, c.V.title, { font: F.impact, size: 180, weight: 900, color: c.P.text, stroke: c.P.a, strokeW: 8 }, { start: 0.3, kf: { scale: K([[0, 0], [0.5, 1, 'back']]) }, expr: { rotation: 'sin(time*3)*2' } }),
    text(c, c.V.sub, { font: F.body, size: 54, weight: 800, color: c.P.a2, anim: 'fadeUp', animD: 0.5 }, { start: 0.9, y: 150 * c.u }),
  ] },
  // ================= SİNEMATİK =================
  { id: 'trailer', name: 'Fragman Başlığı', cat: 'Sinematik', tags: 'trailer epic dark', dur: 5, fields: [T('title', 'Başlık', 'KARANLIK ÇAĞ'), T('sub', 'Tarih', 'YAKINDA SİNEMALARDA')], build: c => [
    solid(c, '#000000'),
    shape(c, { shape: 'rect', w: c.W * 1.2, h: 3, fill: c.P.a2 }, { start: 0.3, dur: 0.6, kf: { scale: K([[0, 0], [0.3, 1]]), opacity: K([[0.3, 1], [0.6, 0]]) }, fx: [fx('glow', { amount: 1.2 })] }),
    text(c, c.V.title, { font: F.serif, size: 170, weight: 800, color: c.P.text, anim: 'tracking', animD: 4 }, { start: 0.6, kf: { scale: K([[0, 1.0, 'linear'], [4.4, 1.12, 'linear']]), opacity: K([[0, 0], [0.8, 1]]) }, fx: [fx('grade', { contrast: 1.3 })] }),
    text(c, c.V.sub, { font: F.body, size: 28, weight: 600, color: c.P.dim, anim: 'tracking', animD: 2 }, { start: 2.2, y: 150 * c.u }),
    adjust(c, [fx('letterbox', { ratio: 2.39 }), fx('grain', { amount: 0.1 }), fx('lightleak', { amount: 0.2, color: c.P.a })]),
  ] },
  { id: 'retro80', name: 'Retro 80ler', cat: 'Sinematik', tags: 'retro synthwave 80s vhs', dur: 5, fields: [T('title', 'Başlık', 'GECE SÜRÜŞÜ'), T('sub', 'Alt', 'VOL. 1')], build: c => [
    grad(c, '#12002a', '#3a0050', 90),
    shape(c, { shape: 'circle', w: 520 * c.u, h: 520 * c.u, fill: '#ffb347' }, { y: 60 * c.u, fx: [fx('glow', { amount: 0.6 })] }),
    ...Array.from({ length: 5 }, (_, i) => shape(c, { shape: 'rect', w: 560 * c.u, h: (10 + i * 6) * c.u, fill: '#3a0050' }, { y: (120 + i * 45) * c.u })),
    shape(c, { shape: 'rect', w: c.W, h: c.H / 2.4, fill: '#12002a' }, { y: c.H / 2 - c.H / 4.8 }),
    ...Array.from({ length: 8 }, (_, i) => shape(c, { shape: 'line', w: c.W * 1.2, h: 2, stroke: '#ff2e88', strokeW: 2 }, { y: c.H / 2 - c.H / 2.4, expr: { y: `${Math.round(c.H / 2 - c.H / 2.4)} + pow(((time*0.5 + ${i / 8}) % 1), 2) * ${Math.round(c.H / 2.4)}` } })),
    text(c, c.V.title, { font: F.impact, size: 150, weight: 900, color: '#ffffff', stroke: '#ff2e88', strokeW: 6, anim: 'pop', animD: 0.5 }, { y: -170 * c.u, rot: -6, fx: [fx('glow', { amount: 0.7 })] }),
    text(c, c.V.sub, { font: F.mono, size: 46, color: '#2de2e6', anim: 'typewriter', animD: 0.8 }, { y: -60 * c.u, start: 0.8 }),
    adjust(c, [fx('scanlines', { amount: 0.18 }), fx('chroma', { px: 3 })]),
  ] },
  // ================= OUTRO =================
  { id: 'end-screen', name: 'YouTube Bitiş Ekranı', cat: 'Outro', tags: 'end screen youtube outro', dur: 10, fields: [T('title', 'Başlık', 'İZLEMEYE DEVAM ET'), T('cta', 'Abone', 'ABONE OL')], build: c => [
    grad(c, c.P.bg, c.P.bg2, 135),
    text(c, c.V.title, { font: F.head, size: 100, anim: 'tracking', animD: 1 }, { y: -c.H * 0.36 }),
    ...[-1, 1].map((s, i) => shape(c, { shape: 'rect', w: (c.portrait ? 800 : 640) * c.u, h: (c.portrait ? 450 : 360) * c.u, fill: 'transparent', stroke: c.P.a, strokeW: 4 * c.u, radius: 16 * c.u, drawOn: 0.8, drawDelay: i * 0.2 }, { x: c.portrait ? 0 : s * 380 * c.u, y: c.portrait ? s * 270 * c.u : 0 })),
    shape(c, { shape: 'circle', w: 220 * c.u, h: 220 * c.u, fill: 'transparent', stroke: c.P.a2, strokeW: 6 * c.u, drawOn: 0.8 }, { y: c.H * 0.3, start: 0.5 }),
    text(c, c.V.cta, { font: F.body, size: 30, weight: 900, color: c.P.a2 }, { y: c.H * 0.3, start: 1, kf: { opacity: K([[0, 0], [0.3, 1]]) } }),
  ] },
  { id: 'thanks', name: 'Teşekkürler Outro', cat: 'Outro', tags: 'thanks outro credits', dur: 5, fields: [T('title', 'Başlık', 'TEŞEKKÜRLER'), T('sub', 'Alt', 'bir sonraki videoda görüşmek üzere')], build: c => [
    grad(c, c.P.bg2, c.P.bg, 60), parts(c, 'magic', { color: c.P.a, color2: c.P.a2, emitW: c.W, emitH: 40, angle: -90, spread: 30, rate: 40, life: 4 }, { y: c.H / 2 }),
    text(c, c.V.title, { font: F.head, size: 200, anim: 'tracking', animD: 1.6 }, { kf: { opacity: K([[0, 0], [1, 1]]) }, tOut: { type: 'blur', d: 0.8 } }),
    text(c, c.V.sub, { font: F.serif, size: 42, weight: 600, color: c.P.dim, anim: 'blurIn', animD: 1 }, { start: 1, y: 140 * c.u, tOut: { type: 'fade', d: 0.8 } }),
  ] },
  // ================= KİNETİK ek =================
  { id: 'stack-type', name: 'Yığın Tipografi', cat: 'Kinetik Tipografi', tags: 'stacked type bold poster', dur: 4, fields: [T('item1', 'Satır 1', 'DAHA'), T('item2', 'Satır 2', 'HIZLI'), T('item3', 'Satır 3', 'DAHA GÜÇLÜ')], build: c => [
    solid(c, c.P.bg),
    ...[c.V.item1, c.V.item2, c.V.item3].map((s, i) => text(c, s, { font: F.head, size: 200, color: i === 1 ? c.P.a : c.P.text }, { start: i * 0.25, y: (-190 + i * 190) * c.u, kf: { x: K([[0, (i % 2 ? 1 : -1) * c.W], [0.6, 0]]) }, mb: true })),
    shape(c, { shape: 'rect', w: 14 * c.u, h: 560 * c.u, fill: c.P.a2 }, { x: -620 * c.u, start: 0.8, kf: { scale: K([[0, 0], [0.5, 1]]) } }),
  ] },
  { id: 'circle-type', name: 'Dönen Rozet', cat: 'Logo', tags: 'badge rotating stamp', dur: 6, fields: [T('title', 'Rozet', 'YENİ'), T('sub', 'Çevre yazısı', '%100 YERLİ · ÜCRETSİZ · ')], build: c => [
    solid(c, c.P.bg),
    shape(c, { shape: 'star', points: 16, w: 520 * c.u, h: 520 * c.u, fill: c.P.a }, { expr: { rotation: 'time*20' }, kf: { scale: K([[0, 0], [0.6, 1, 'back']]) } }),
    shape(c, { shape: 'circle', w: 360 * c.u, h: 360 * c.u, fill: 'transparent', stroke: c.P.bg, strokeW: 6 * c.u, drawOn: 1 }, { start: 0.4 }),
    text(c, c.V.title, { font: F.head, size: 150, color: c.P.bg }, { start: 0.5, kf: { scale: K([[0, 0], [0.5, 1, 'back']]) }, expr: { rotation: 'sin(time*2)*6' } }),
    text(c, c.V.sub, { font: F.body, size: 28, weight: 800, color: c.P.text }, { y: 320 * c.u, start: 1, kf: { opacity: K([[0, 0], [0.5, 1]]) } }),
  ] },
  { id: 'callout', name: 'Callout Ok', cat: 'İnfografik', tags: 'callout pointer annotation', dur: 4, fields: [T('label', 'Etiket', 'Yeni özellik!')], build: c => [
    shape(c, { shape: 'circle', w: 60 * c.u, h: 60 * c.u, fill: 'transparent', stroke: c.P.a, strokeW: 6 * c.u }, { x: -200 * c.u, y: 120 * c.u, kf: { scale: K([[0, 0], [0.4, 1, 'back']]) }, expr: { scale: 'value * (1 + sin(time*5)*0.08)' } }),
    shape(c, { shape: 'line', w: 300 * c.u, h: 2, stroke: c.P.a, strokeW: 5 * c.u, drawOn: 0.5, drawDelay: 0.3 }, { x: -40 * c.u, y: 40 * c.u, rot: -28 }),
    shape(c, { shape: 'rect', w: 380 * c.u, h: 90 * c.u, fill: c.P.a, radius: 12 * c.u }, { x: 260 * c.u, y: -40 * c.u, start: 0.7, kf: { scale: K([[0, 0], [0.4, 1, 'back']]) } }),
    text(c, c.V.label, { font: F.body, size: 38, weight: 800, color: c.P.bg }, { x: 260 * c.u, y: -40 * c.u, start: 0.9, kf: { opacity: K([[0, 0], [0.2, 1]]) } }),
  ] },
];
