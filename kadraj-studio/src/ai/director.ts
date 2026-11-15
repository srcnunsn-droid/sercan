// YÖNETMEN — Türkçe doğal dil komutları → stüdyo eylemleri.
// Çevrimdışı kural motoru; anlamadığını yerel LLM'e (Ollama) aynı eylem şemasıyla sorar.
import { S } from '../store';
import { addMask, ellipseMask, rectMask } from '../engine/masks';
import type { EffectType, Panel, TransitionType } from '../types';
import { addAdjustmentLayer, addNullObject, addParticles, addGenClip, addTextClip, applyMotion, cutSilences, deleteSelected, duplicateSelected, freezeFrame, makeMusicAsset, makeSfxAsset, placeAsset, setAspect, splitSelected, ensureBuiltinLuts } from '../actions';
import { pause, play, seek } from '../engine/playback';
import { GRADE_PRESETS, MOTION_PRESETS, TEXT_STYLES, makeEffect } from '../engine/presets';
import { EFFECT_DEFS, TRANSITION_LABELS } from '../engine/effects';
import { MOODS, SFX_TYPES, type Mood, type SfxType } from '../engine/audioGen';
import { TEMPLATES, applyTemplate } from '../templates';
import { loadCfg, ollamaJson } from './providers';
import { projectDuration } from '../util';

export interface Command { id: string; label: string; hint?: string; keys: string; run: () => void | Promise<void> }

const lower = (s: string) => s.toLocaleLowerCase('tr').normalize('NFC');
const sel = () => { const s = S(); return s.project.clips.filter(c => s.selected.includes(c.id)); };
const forSel = (fn: (c: any) => void, msg: string) => { if (!sel().length) { S().notify('Önce bir klip seç'); return false; } S().set(d => { d.clips.forEach(c => { if (S().selected.includes(c.id)) fn(c); }); }); S().notify(msg); return true; };

export const COLORS: Record<string, string> = { kırmızı: '#ff2d3d', mavi: '#2f7bff', yeşil: '#2bd96b', sarı: '#ffd23f', turuncu: '#ff8a2a', mor: '#9b5cff', pembe: '#ff5fa2', beyaz: '#ffffff', siyah: '#000000', altın: '#e8b04a', gri: '#8a8a96', turkuaz: '#25d0c9', lacivert: '#1b2a6b' };

const EFFECT_WORDS: [RegExp, EffectType, Record<string, number | string>?][] = [
  [/glitch|bozulma/, 'glitch'], [/vinyet|kenar karart/, 'vignette'], [/gren|film greni|grain/, 'grain'], [/rgb|renk sapma|chromatic/, 'chroma'],
  [/vhs|tarama/, 'scanlines'], [/sinema band|letterbox|siyah band/, 'letterbox'], [/ışık sızıntı|light ?leak/, 'lightleak'], [/sars|titre|shake/, 'shake'],
  [/piksel/, 'pixelate'], [/siyah.?beyaz|gri ton/, 'grayscale'], [/sepya|eski foto/, 'sepia'], [/negatif|ters renk/, 'invert'],
  [/parla(ma|t)|glow|bloom/, 'glow'], [/keskin/, 'sharpen'], [/yeşil perde|chroma ?key|green ?screen|yeşili sil/, 'chromakey'], [/mavi perde/, 'chromakey', { key: '#0047ff' }],
  [/maske|spot|daire maske/, 'mask'], [/lut|filmik/, 'lut', { lut: 'lut_builtin_filmic' }], [/renk tekerle|grade|renk düzelt/, 'grade'],
];
const GRADE_WORDS: [RegExp, string][] = [[/teal|turuncu.?mavi|sinematik renk/, 'tealOrange'], [/noir|kara film/, 'noir'], [/vintage|retro film|nostalji/, 'vintage'], [/sıcak|altın saat|gün batımı/, 'warm'], [/soğuk|thriller/, 'cold'], [/vhs|80'?ler|retro/, 'vhs'], [/rüya|pastel/, 'dreamy'], [/sinema bandı|2\.39/, 'cinema']];
const TRANS_WORDS: [RegExp, TransitionType][] = [[/sol|fade|solma|kararma/, 'fade'], [/zoom|yakınlaş/, 'zoomIn'], [/blur|bulanık/, 'blur'], [/wipe|silme/, 'wipe'], [/döndür|spin/, 'spin'], [/flaş|flash|beyaz patla/, 'flash'], [/kaydır|slide/, 'slideLeft']];
const MOTION_WORDS: [RegExp, string][] = [[/ken ?burns|yavaş yaklaş|zoom ?in/, 'kenIn'], [/uzaklaş|zoom ?out/, 'kenOut'], [/sola pan|pan sol/, 'panL'], [/sağa pan|pan sağ/, 'panR'], [/push|dramatik yaklaş/, 'pushDrama'], [/pop|zıpla(t|y)a?rak gir/, 'popIn'], [/düş|yukarıdan/, 'dropIn'], [/süzül|float/, 'float'], [/dönerek/, 'spinIn'], [/punch|vuruş zoom/, 'speedRamp'], [/odak|netleş/, 'focusPull']];

const num = (s: string) => { const m = s.match(/(-?\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : NaN; };

/** Tek cümleyi çalıştırır. true = anlaşıldı */
async function runOne(raw: string): Promise<boolean> {
  const t = lower(raw.trim()); if (!t) return true;
  const s = S();
  // --- gezinme
  const panels: [RegExp, Panel][] = [[/fikir/, 'idea'], [/storyboard|senaryo/, 'story'], [/kurgu|editör|timeline/, 'editor'], [/ses stüdyo|müzik stüdyo/, 'audio'], [/ai motor|yapay zeka ayar/, 'ai'], [/dışa aktar|render|export|çıktı/, 'export'], [/ekosistem|yol haritası/, 'eco'], [/medya kütüphane/, 'media']];
  if (/(aç|git|göster|geç)$/.test(t) || /^(aç|git)/.test(t)) for (const [r, p] of panels) if (r.test(t)) { if (p !== 'editor') pause(); s.ui({ panel: p }); return true; }
  if (/^(render al|dışa aktar|export)/.test(t)) { pause(); s.ui({ panel: 'export' }); return true; }
  // --- oynatma
  if (/^(oynat|başlat|play)/.test(t)) { play(); return true; }
  if (/^(dur|durdur|pause)/.test(t)) { pause(); return true; }
  if (/(saniye|sn).*(git|atla)|^(\d+).*saniyeye/.test(t) && !isNaN(num(t))) { seek(num(t)); return true; }
  if (/başa (dön|git)/.test(t)) { seek(0); return true; }
  if (/sona (git|atla)/.test(t)) { seek(projectDuration(s.project)); return true; }
  if (/geri al/.test(t)) { s.undo(); return true; }
  if (/(ileri al|yinele)/.test(t)) { s.redo(); return true; }
  // --- format
  if (/(dikey|reels|shorts|tiktok|9:16)/.test(t) && /(yap|çevir|format|geç)/.test(t)) { setAspect(1080, 1920); s.notify('9:16 dikey format'); return true; }
  if (/(yatay|youtube|16:9)/.test(t) && /(yap|çevir|format|geç)/.test(t)) { setAspect(1920, 1080); s.notify('16:9 format'); return true; }
  if (/(kare|1:1|instagram post)/.test(t) && /(yap|çevir|format)/.test(t)) { setAspect(1080, 1080); return true; }
  if (/4k/.test(t) && /(yap|çevir|geç)/.test(t)) { setAspect(3840, 2160); return true; }
  // --- düzenleme
  if (/^(böl|kes)$|ikiye böl|burada böl|playhead.*böl/.test(t)) { splitSelected(); return true; }
  if (/sessiz(lik|likleri)?.*(kes|sil|temizle)|jump ?cut/.test(t)) { cutSilences(isNaN(num(t)) ? -38 : -Math.abs(num(t))); return true; }
  if (/(kare(yi)? dondur|freeze)/.test(t)) { await freezeFrame(isNaN(num(t)) ? 2 : num(t)); return true; }
  if (/^(sil|kaldır)$|seçil(i|eni) sil/.test(t)) { deleteSelected(); return true; }
  if (/çoğalt|kopyasını/.test(t)) { duplicateSelected(); return true; }
  if (/tümünü seç|hepsini seç/.test(t)) { s.ui({ selected: s.project.clips.map(c => c.id) }); return true; }
  // --- şablon
  for (const tp of TEMPLATES) { const key = lower(tp.label.replace(/^[^\p{L}]+/u, '').split(' (')[0]); if (t.includes(key) || (tp.id === 'ytintro' && /intro/.test(t)) || (tp.id === 'count' && /geri sayım/.test(t)) || (tp.id === 'sub' && /abone/.test(t)) || (tp.id === 'lower' && /alt bant|lower/.test(t)) || (tp.id === 'launch' && /lansman/.test(t)) || (tp.id === 'doc' && /belgesel açılış/.test(t))) { if (/(ekle|koy|yap|oluştur|şablon)/.test(t)) { await applyTemplate(tp.id); return true; } } }
  // --- metin
  if (/(yazı|metin|başlık)/.test(t) && /(rengi|renk)/.test(t)) { const c = Object.entries(COLORS).find(([k]) => t.includes(k)); if (c) return forSel(k => { if (k.text) k.text.color = c[1]; }, `Metin rengi: ${c[0]}`); }
  const tm = raw.match(/["“”'](.+?)["“”']/);
  if (/(yazı|başlık|metin|altyazı|text)/.test(t) && (/(ekle|koy|oluştur)/.test(t) || /\byaz$/.test(t))) {
    const txt = tm?.[1] ?? (raw.replace(/.*?(yazısı|başlığı|başlık|metni|yazı)\s*(ekle|koy|yaz)?\s*:?\s*/i, '').trim() || 'BAŞLIK');
    const style = /alt bant|lower/.test(t) ? 'lower' : /altyazı|caption/.test(t) ? 'caption' : /glitch/.test(t) ? 'glitch' : /zarif|serif/.test(t) ? 'elegant' : /meme/.test(t) ? 'meme' : /terminal|daktilo/.test(t) ? 'terminal' : 'hero';
    addTextClip(style, txt); return true;
  }
  if (/(yazıyı|metni|başlığı)?\s*(büyüt|küçült)/.test(t) && sel().some(c => c.kind === 'text') && /yazı|metin|başlık/.test(t)) { const k = /büyüt/.test(t) ? 1.25 : 0.8; return forSel(c => { if (c.text) c.text.size = Math.round(c.text.size * k); }, 'Yazı boyutu değişti'); }
  if (/ayar katman|adjustment/.test(t)) { addAdjustmentLayer(); return true; }
  // --- parçacıklar & çizim
  { const pm: [RegExp, string][] = [[/kar (yağ|ekle)|kar efekt/, 'snow'], [/konfeti/, 'confetti'], [/kıvılcım|spark/, 'sparks'], [/ateş|alev/, 'fire'], [/toz|bokeh parçac/, 'dust'], [/büyü|sihir|magic/, 'magic']];
    for (const [r, k] of pm) if (r.test(t) && !/sesi|sfx/.test(t)) { await addParticles(k); return true; } }
  if (/çizerek|draw.?on|trim path/.test(t)) return forSel(c => { if (c.shape) { c.shape.drawOn = isNaN(num(t)) ? 1.2 : num(t); if (!c.shape.strokeW) c.shape.strokeW = 6; } }, 'Çizerek belirme (trim paths)');
  if (/şablon galeri|tüm şablon|şablonları (aç|göster)/.test(t)) { pause(); s.ui({ panel: 'templates' }); return true; }
  // --- After Effects
  if (/null (nesne|ekle)|null object/.test(t)) { addNullObject(); return true; }
  if (/grafik edit|graph edit/.test(t)) { s.ui({ panel: 'editor', graph: true }); return true; }
  if (/kalem|bezier|maske çiz|pen tool/.test(t)) { s.ui({ panel: 'editor', tool: 'pen' }); s.notify('🖊 Kalem aracı: önizlemede tıklayarak maske çiz (Enter: kapat)'); return true; }
  if (/(elips|oval|daire|yuvarlak|dikdörtgen|kare|kutu) (yol )?maske/.test(t) && !/efekt/.test(t)) {
    const c = s.project.clips.find(k => k.id === s.selected[0]); if (!c) { s.notify('Önce bir katman seç'); return true; }
    const W = s.project.settings.width, H = s.project.settings.height; const rect = /dikdörtgen|kare|kutu/.test(t); const f = /yumuşa|feather/.test(t) ? (isNaN(num(t)) ? 60 : num(t)) : 0;
    addMask(c.id, n => ({ ...(rect ? rectMask(W * 0.5, H * 0.5, n) : ellipseMask(Math.min(W, H) * 0.6, Math.min(W, H) * 0.6, n)), feather: f, invert: /ters/.test(t) })); s.notify((rect ? 'Dikdörtgen' : 'Elips') + ' maske eklendi'); return true;
  }
  if (/maske(yi|leri)? (sil|kaldır|temizle)/.test(t)) return forSel(c => { delete c.masks; }, 'Maskeler kaldırıldı');
  if (/maske(yi)? (ters|çevir)/.test(t)) return forSel(c => { c.masks?.forEach((m: any) => { m.invert = !m.invert; }); }, 'Maske ters çevrildi');
  if (/maske/.test(t) && /(yumuşat|feather)/.test(t)) { const f = isNaN(num(t)) ? 60 : num(t); return forSel(c => { c.masks?.forEach((m: any) => { m.feather = f; }); }, `Maske yumuşatma ${f} px`); }
  if (/hareket bulanıklı|motion ?blur/.test(t)) return forSel(c => { c.motionBlur = !/kapat/.test(t); }, 'Hareket bulanıklığı ' + (/kapat/.test(t) ? 'kapalı' : 'açık'));
  if (/wiggle|titre[şs]im|el kamerası/.test(t)) { const f = /(\d+(?:[.,]\d+)?)\s*(hz|frek)/.exec(t); const a = /(\d+)\s*(px|piksel|genlik)/.exec(t); const fr = f ? parseFloat(f[1].replace(',', '.')) : 2, am = a ? +a[1] : 25;
    return forSel(c => { c.expr = { ...(c.expr ?? {}), x: `wiggle(${fr}, ${am})`, y: `wiggle(${fr}, ${am})` }; if (/dön|rotation/.test(t)) c.expr.rotation = `wiggle(${fr}, ${Math.max(1, am / 10)})`; }, `Wiggle ${fr} Hz · ${am} px`); }
  if (/sürekli dön|sonsuz dön|döndür(meye)? devam/.test(t)) { const sp = isNaN(num(t)) ? 90 : num(t); return forSel(c => { c.expr = { ...(c.expr ?? {}), rotation: `time*${sp}` }; }, `Sürekli dönüş ${sp}°/sn`); }
  if (/(döngü|loop)/.test(t) && /(yap|ekle|al)/.test(t)) return forSel(c => { c.expr = { ...(c.expr ?? {}) }; for (const k of Object.keys(c.kf)) (c.expr as any)[k] = /ping|git.?gel/.test(t) ? "loopOut('pingpong')" : 'loopOut()'; }, 'Keyframe döngüsü (loopOut)');
  if (/(ifade|expression)lar(ı)? (sil|kaldır|temizle)/.test(t)) return forSel(c => { delete c.expr; }, 'İfadeler kaldırıldı');
  if (/easy ease|yumuşat/.test(t)) return forSel(c => { for (const k of Object.keys(c.kf)) (c.kf as any)[k].forEach((f: any, i: number) => { if (i > 0) { f.e = 'bezier'; f.b = [0.33, 0, 0.67, 1]; } }); }, 'Easy Ease uygulandı');
  // --- arka plan / katman
  if (/(arka ?plan|zemin|fon)/.test(t) && /(ekle|koy|yap)/.test(t)) { const cs = Object.entries(COLORS).filter(([k]) => t.includes(k)).map(x => x[1]); if (cs.length >= 2 || /gradyan|geçişli/.test(t)) addGenClip('gradient', { color: cs[0] ?? '#1b1446', color2: cs[1] ?? '#e8475f' }); else addGenClip('solid', { color: cs[0] ?? '#111111' }); return true; }
  // --- ses
  if (/müzik/.test(t) && /(ekle|koy|üret|yap)/.test(t)) {
    const mood = (Object.keys(MOODS) as Mood[]).find(m => t.includes(m) || t.includes(lower(MOODS[m].label.split(' ')[0]))) ?? (s.project.idea?.style.music as Mood) ?? 'epik';
    const bpm = /(\d{2,3})\s*bpm/.test(t) ? num(t.match(/(\d{2,3})\s*bpm/)![0]) : MOODS[mood].bpm;
    const dur = Math.max(8, projectDuration(s.project) || 20); const bars = Math.max(2, Math.ceil(dur / (240 / bpm)));
    s.notify('Müzik besteleniyor…'); const a = await makeMusicAsset(mood, bpm, bars, 57, Math.floor(Math.random() * 999), { pad: true, bass: true, arp: true, drums: true }, MOODS[mood].label);
    const keepSel = S().selected; const tr = S().project.tracks.filter(x => x.kind === 'audio')[1]?.id; placeAsset(a, tr, 0); S().ui({ selected: keepSel }); S().notify(`Müzik eklendi: ${MOODS[mood].label} ${bpm} BPM`); return true;
  }
  const sfxHit = (Object.entries(SFX_TYPES) as [SfxType, string][]).find(([k, l]) => t.includes(k) || t.includes(lower(l.split(' ')[0])));
  if (sfxHit && /(\bses|sesi\b|\bsfx\b)/.test(t)) { const keepSel = S().selected; const a = await makeSfxAsset(sfxHit[0], ['drone', 'riser'].includes(sfxHit[0]) ? 3 : 1.4, Math.floor(Math.random() * 99), 1, sfxHit[1]); placeAsset(a); S().ui({ selected: keepSel }); S().notify(`SFX: ${sfxHit[1]}`); return true; }
  if (/(sesi|ses seviyesi).*(kıs|azalt)/.test(t)) return forSel(c => { c.volume = Math.max(0, c.volume * 0.6); }, 'Ses kısıldı');
  if (/(sesi|ses seviyesi).*(aç|artır|yükselt)/.test(t)) return forSel(c => { c.volume = Math.min(2, c.volume * 1.5); }, 'Ses açıldı');
  if (/sessize al|sesi kapat|mute/.test(t)) return forSel(c => { c.muted = true; }, 'Sessize alındı');
  if (/ducking|müziği kıs.*konuş|konuşurken/.test(t)) { S().set(d => { d.settings.duck = { on: !/kapat/.test(t), db: 12, voiceTrack: d.settings.duck?.voiceTrack }; }); s.notify('Otomatik ducking ' + (/kapat/.test(t) ? 'kapalı' : 'açık')); return true; }
  // --- renk grade
  for (const [r, k] of GRADE_WORDS) if (r.test(t) && /(yap|uygula|ver|olsun|grade|renk|görünüm|ekle)/.test(t)) return forSel(c => { c.effects = GRADE_PRESETS[k].fx(); }, `Grade: ${GRADE_PRESETS[k].label}`);
  if (/(parlak|aydınlat)/.test(t) && /(yap|artır)/.test(t)) return forSel(c => { c.effects.push(makeEffect('grade', { exposure: 0.4 })); }, 'Pozlama +0.4 EV');
  if (/(karart|koyulaştır)/.test(t)) return forSel(c => { c.effects.push(makeEffect('grade', { exposure: -0.5 })); }, 'Pozlama -0.5 EV');
  if (/(canlı|doygun)/.test(t) && /(yap|olsun)/.test(t)) return forSel(c => { c.effects.push(makeEffect('saturation', { v: 1.4 })); }, 'Doygunluk artırıldı');
  // --- efekt
  if (/(efekt|ekle|uygula|koy|ver)/.test(t)) for (const [r, e, over] of EFFECT_WORDS) if (r.test(t)) { if (e === 'lut') ensureBuiltinLuts(); return forSel(c => { c.effects.push(makeEffect(e, over)); }, `Efekt: ${EFFECT_DEFS[e].label}`); }
  if (/efektleri (sil|temizle|kaldır)/.test(t)) return forSel(c => { c.effects = []; }, 'Efektler temizlendi');
  // --- geçiş
  if (/geçiş/.test(t)) for (const [r, tr] of TRANS_WORDS) if (r.test(t)) { const d = isNaN(num(t)) ? 0.5 : num(t); return forSel(c => { if (!/çıkış/.test(t)) c.tIn = { type: tr, d }; if (!/giriş/.test(t)) c.tOut = { type: tr, d }; }, `Geçiş: ${TRANSITION_LABELS[tr]}`); }
  // --- hareket
  for (const [r, k] of MOTION_WORDS) if (r.test(t)) { if (!sel().length) { s.notify('Önce bir klip seç'); return true; } applyMotion(k); s.notify(`Hareket: ${MOTION_PRESETS[k].label}`); return true; }
  // --- hız / süre / opaklık
  if (/(yavaş çekim|slow ?mo)/.test(t)) return forSel(c => { const ns = 0.5; c.duration = c.duration * c.speed / ns; c.speed = ns; }, 'Yavaş çekim ×0.5');
  if (/(hızlandır|\d+ ?kat hız|x\d)/.test(t)) { const k = isNaN(num(t)) ? 2 : num(t); return forSel(c => { c.duration = c.duration * c.speed / k; c.speed = k; }, `Hız ×${k}`); }
  if (/süre(si)?/.test(t) && !isNaN(num(t))) return forSel(c => { c.duration = Math.max(0.1, num(t)); }, `Süre ${num(t)} sn`);
  if (/(opaklık|şeffaf)/.test(t)) { const v = isNaN(num(t)) ? 0.5 : num(t) > 1 ? num(t) / 100 : num(t); return forSel(c => { c.base.opacity = v; }, `Opaklık ${Math.round(v * 100)}%`); }
  if (/(büyüt|yakınlaştır)/.test(t)) return forSel(c => { c.base.scale *= 1.2; }, 'Ölçek ×1.2');
  if (/küçült/.test(t)) return forSel(c => { c.base.scale *= 0.8; }, 'Ölçek ×0.8');
  if (/ortala/.test(t)) return forSel(c => { c.base.x = 0; c.base.y = 0; }, 'Ortalandı');
  return false;
}

const ACTIONS_DOC = `Kullanılabilir komutlar (her biri tek Türkçe cümle): "yazı ekle \\"METİN\\"", "alt bant yazı ekle \\"METİN\\"", "<renk> arka plan ekle", "müzik ekle <epik|duygusal|enerjik|gerilim|lofi|karanlik|minimal> <N> bpm", "<whoosh|impact|riser|braam|pop|glitch|drone> sesi ekle", "<noir|vintage|teal|sıcak|soğuk|vhs|rüya> grade uygula", "<glitch|vinyet|gren|parlama|yeşil perde|maske> efekti ekle", "<solma|zoom|bulanık|flaş> geçiş ekle", "ken burns", "pop giriş", "yavaş çekim", "<N> saniyeye git", "böl", "sessizlikleri kes", "kareyi dondur", "dikey format yap", "<şablon adı> şablonu ekle", "oynat", "render al".`;

export async function direct(input: string): Promise<{ ok: number; fail: string[] }> {
  const parts = input.split(/\s*(?:,|;|\n|\bve sonra\b|\bsonra\b|\bardından\b)\s*/i).filter(Boolean);
  let ok = 0; const fail: string[] = [];
  for (const p of parts) { if (await runOne(p)) ok++; else fail.push(p); }
  if (fail.length) {
    const cfg = await loadCfg();
    if (cfg.ollama.enabled) {
      try {
        S().notify('Yönetmen yerel LLM’e danışıyor…');
        const r = await ollamaJson(cfg.ollama, `Sen bir video kurgu asistanısın. Kullanıcı isteğini aşağıdaki komut listesinden komutlara çevir. ${ACTIONS_DOC}\nİstek: "${fail.join(', ')}"\nSadece JSON döndür: {"commands": ["...", "..."]}`);
        const left: string[] = [];
        for (const c of r.commands ?? []) { if (await runOne(String(c))) ok++; else left.push(String(c)); }
        return { ok, fail: left };
      } catch { /* düş */ }
    }
  }
  return { ok, fail };
}

/** Komut paleti listesi (Ctrl+K) */
export function commandList(): Command[] {
  const panels: [Panel, string][] = [['idea', 'Fikir Laboratuvarı'], ['story', 'Storyboard'], ['media', 'Medya'], ['editor', 'Kurgu'], ['audio', 'Ses Stüdyosu'], ['ai', 'AI Motorları'], ['export', 'Dışa Aktar'], ['eco', 'Ekosistem']];
  return [
    ...panels.map(([p, l]) => ({ id: 'go-' + p, label: `Git: ${l}`, keys: l + ' git aç', run: () => { if (p !== 'editor') pause(); S().ui({ panel: p }); } })),
    { id: 'play', label: 'Oynat / durdur', hint: 'Space', keys: 'play oynat dur', run: () => (S().playing ? pause() : play()) },
    { id: 'split', label: 'Playhead’de böl', hint: 'S', keys: 'böl kes split', run: splitSelected },
    { id: 'del', label: 'Seçiliyi sil', hint: 'Del', keys: 'sil delete', run: () => deleteSelected() },
    { id: 'dup', label: 'Çoğalt', hint: 'Ctrl+D', keys: 'çoğalt duplicate', run: duplicateSelected },
    { id: 'silence', label: 'Sessizlikleri kes (jump-cut)', keys: 'sessizlik jump cut konuşma', run: () => cutSilences() },
    { id: 'freeze', label: 'Kareyi dondur (2 sn)', keys: 'freeze dondur kare', run: () => freezeFrame(2) },
    { id: 'v916', label: 'Format: 9:16 dikey', keys: 'reels shorts tiktok dikey', run: () => setAspect(1080, 1920) },
    { id: 'v169', label: 'Format: 16:9 yatay', keys: 'youtube yatay', run: () => setAspect(1920, 1080) },
    ...Object.entries(TEXT_STYLES).map(([k, v]) => ({ id: 'txt-' + k, label: `Metin ekle: ${v.label}`, keys: 'yazı metin başlık ' + v.label, run: () => { addTextClip(k, 'BAŞLIK'); } })),
    ...TEMPLATES.map(tp => ({ id: 'tpl-' + tp.id, label: `Şablon: ${tp.label.replace(/^\S+\s/, '')}`, keys: 'şablon template ' + tp.label + tp.desc, run: () => applyTemplate(tp.id) })),
    ...Object.entries(GRADE_PRESETS).map(([k, v]) => ({ id: 'gr-' + k, label: `Grade: ${v.label}`, keys: 'renk grade ' + v.label, run: () => { forSel(c => { c.effects = v.fx(); }, v.label); } })),
    ...(Object.keys(EFFECT_DEFS) as EffectType[]).map(e => ({ id: 'fx-' + e, label: `Efekt ekle: ${EFFECT_DEFS[e].label}`, keys: 'efekt ' + EFFECT_DEFS[e].label, run: () => { if (e === 'lut') ensureBuiltinLuts(); forSel(c => { c.effects.push(makeEffect(e, e === 'lut' ? { lut: 'lut_builtin_filmic' } : {})); }, EFFECT_DEFS[e].label); } })),
    ...Object.entries(MOTION_PRESETS).map(([k, v]) => ({ id: 'mo-' + k, label: `Hareket: ${v.label}`, keys: 'hareket animasyon ' + v.label, run: () => applyMotion(k) })),
    ...(Object.entries(SFX_TYPES) as [SfxType, string][]).map(([k, l]) => ({ id: 'sfx-' + k, label: `SFX ekle: ${l}`, keys: 'ses efekt sfx ' + l, run: async () => { const a = await makeSfxAsset(k, 1.5, 1, 1, l); placeAsset(a); } })),
  ];
}
