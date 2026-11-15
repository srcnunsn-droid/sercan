// İlk açılış için vitrin projesi: tüm özellikleri gösteren 12 saniyelik intro
import { S } from './store';
import { defaultText, newClip, newProject } from './util';
import { assetFromBlob } from './engine/media';
import { genVisual } from './engine/visualGen';
import { genMusic, genSfx } from './engine/audioGen';
import { bufferToWav } from './engine/audio';
import { GRADE_PRESETS, TEXT_STYLES, makeEffect } from './engine/presets';
import { generateIdea } from './ai/ideaEngine';

export async function buildDemo() {
  S().notify('Demo hazırlanıyor…');
  const p = newProject('Demo · Kadraj Intro');
  const pal = ['#07060f', '#2a1660', '#ff4d6d', '#ffb347'];
  const [V3, V2, V1, A1, A2, A3] = p.tracks.map(t => t.id);
  const bg = await assetFromBlob(await genVisual('aurora', 1920, 1080, pal, 42), 'Aurora', 'image', 'procedural');
  const grid = await assetFromBlob(await genVisual('grid', 1920, 1080, pal, 7), 'Retro grid', 'image', 'procedural');
  const bokeh = await assetFromBlob(await genVisual('bokeh', 1920, 1080, pal, 3), 'Bokeh', 'image', 'procedural');
  const music = await assetFromBlob(bufferToWav(await genMusic('enerjik', 124, 6, 57, 11)), 'Müzik · Enerjik 124bpm', 'audio', 'procedural');
  const imp = await assetFromBlob(bufferToWav(await genSfx('impact', 2, 3)), 'SFX · Darbe', 'audio', 'procedural');
  const wh = await assetFromBlob(bufferToWav(await genSfx('whoosh', 1.2, 5)), 'SFX · Whoosh', 'audio', 'procedural');
  const rs = await assetFromBlob(bufferToWav(await genSfx('riser', 3.5, 2)), 'SFX · Riser', 'audio', 'procedural');
  p.assets.push(bg, grid, bokeh, music, imp, wh, rs);

  const c1 = newClip(V1, 'media', 0, 4.5, { assetId: bg.id, name: 'Aurora', kf: { scale: [{ t: 0, v: 1.25, e: 'linear' }, { t: 4.5, v: 1, e: 'easeOut' }], rotation: [{ t: 0, v: -3, e: 'linear' }, { t: 4.5, v: 0, e: 'easeOut' }] } });
  c1.effects = [makeEffect('grain', { amount: 0.1 }), makeEffect('vignette', { amount: 0.5 })];
  const c2 = newClip(V1, 'media', 4.5, 4, { assetId: grid.id, name: 'Retro grid', tIn: { type: 'zoomOut', d: 0.5 }, kf: { y: [{ t: 0, v: 40, e: 'linear' }, { t: 4, v: -40, e: 'linear' }], scale: [{ t: 0, v: 1.1, e: 'linear' }] } });
  c2.effects = GRADE_PRESETS.vhs.fx();
  const c3 = newClip(V1, 'media', 8.5, 4, { assetId: bokeh.id, name: 'Bokeh', tIn: { type: 'flash', d: 0.4 }, kf: { scale: [{ t: 0, v: 1, e: 'linear' }, { t: 4, v: 1.2, e: 'linear' }] }, tOut: { type: 'fade', d: 1 } });
  c3.effects = GRADE_PRESETS.tealOrange.fx();
  const t1 = newClip(V3, 'text', 0.6, 3.6, { name: 'KADRAJ', text: { ...defaultText('KADRAJ STUDIO'), ...TEXT_STYLES.hero.t, size: 210 }, tOut: { type: 'blur', d: 0.5 } });
  const t2 = newClip(V2, 'text', 1.6, 2.6, { name: 'alt', text: { ...defaultText('fikirden finale · tek stüdyo'), ...TEXT_STYLES.elegant.t, size: 56, color: '#ffd8a8' }, tOut: { type: 'fade', d: 0.4 } });
  t2.base.y = 150;
  const t3 = newClip(V3, 'text', 4.8, 3.4, { name: 'glitch', text: { ...defaultText('MOTION · EFEKT · SES'), ...TEXT_STYLES.glitch.t, size: 120 }, tIn: { type: 'none', d: 0.3 }, tOut: { type: 'slideLeft', d: 0.4 } });
  t3.effects = [makeEffect('chroma', { px: 8 })];
  const sh = newClip(V2, 'shape', 9, 3.2, { name: 'bant', shape: { shape: 'rect', w: 1100, h: 8, fill: '#ff4d6d', stroke: '#fff', strokeW: 0, radius: 4 }, kf: { scale: [{ t: 0, v: 0, e: 'linear' }, { t: 0.6, v: 1, e: 'easeOut' }] } });
  sh.base.y = 90;
  const t4 = newClip(V3, 'text', 9, 3.3, { name: 'cta', text: { ...defaultText('Şimdi senin hikâyen.'), ...TEXT_STYLES.hero.t, size: 130, anim: 'fadeUp', animD: 0.8 }, tOut: { type: 'fade', d: 0.8 } });
  const a1 = newClip(A2, 'media', 0, 12.4, { assetId: music.id, name: music.name, volume: 0.6, fadeIn: 0.3, fadeOut: 1.5, in: 0 });
  const a2 = newClip(A3, 'media', 0.55, 2, { assetId: imp.id, name: imp.name, volume: 0.9 });
  const a3 = newClip(A3, 'media', 4.1, 1.2, { assetId: wh.id, name: wh.name, volume: 0.8 });
  const a4 = newClip(A1, 'media', 5.1, 3.5, { assetId: rs.id, name: rs.name, volume: 0.6 });
  p.clips.push(c1, c2, c3, t1, t2, t3, sh, t4, a1, a2, a3, a4);
  p.markers.push({ t: 4.5, label: 'Drop' }, { t: 8.5, label: 'CTA' });
  const g = generateIdea({ topic: 'Yapay zekâ video stüdyosu tanıtımı', format: 'reklam', tone: 'Enerjik', audience: 'içerik üreticileri', duration: 30, aspect: '16:9 · 1080p', notes: '' }, 5);
  p.idea = g.idea; p.scenes = g.scenes;
  S().replace(p); S().ui({ panel: 'editor', selected: [] });
  S().notify('Demo hazır — Space ile oynat');
}
