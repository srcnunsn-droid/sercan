// Rule engine: one deterministic checker shared by Academy (learn the rule) and Factory (get warned).
import { CARD_FALLBACK, cardMax } from './cards';
import { INVISIBLE_WORDS, LIGHT_BY_ID, RULES_META, TEXTURE_LINE, TEXTURE_LINE_TR, type RuleMeta } from '../content';
import type { Dir, GraphFix, Part, Project, RuleResult, Severity } from '../model/types';
import { anyWord, countWords, hasWord, lower, wordRegex } from '../lib/text';

export interface RuleCtx {
  text?: string;           // a prompt or a sentence the user wrote
  project?: Project;       // full scene graph
  cardId?: string;         // target model card
}

interface Hit { messageTr: string; partIndex?: number; fixText?: string; graphFix?: GraphFix; severity?: Severity }
type Check = (ctx: RuleCtx) => Hit[];

const META: Record<string, RuleMeta> = Object.fromEntries(RULES_META.map((r) => [r.id, r]));

// ---------- vocabularies ----------
const FACE_WORDS = ['smile', 'smiling', 'smiles', 'tears', 'frown', 'frowning', 'expression', 'eyebrows', 'eyebrow', 'lip', 'lips', 'face', 'gülümse', 'gülen', 'gözyaşı', 'kaş', 'ifade', 'dudak', 'yüz'];
const MOUTH_WORDS = ['smile', 'smiling', 'smiles', 'lip', 'lips', 'mouth', 'grin', 'gülümse', 'gülen', 'dudak', 'ağz', 'sırıt'];
const STILL_WORDS = ['walk', 'walks', 'walking', 'run', 'runs', 'running', 'enters', 'leaves', 'steps', 'turns', 'yürü', 'koş', 'gir', 'çık', 'dön', 'adım'];
const IP_WORDS = ['nike', 'adidas', 'coca-cola', 'pepsi', 'mcdonald', 'starbucks', 'marvel', 'disney', 'pixar', 'spider-man', 'spiderman', 'batman', 'superman', 'mickey mouse', 'pikachu', 'pokemon', 'harry potter', 'darth vader', 'star wars', 'elon musk', 'taylor swift', 'messi', 'ronaldo', 'brad pitt', 'iron man', 'gucci', 'louis vuitton', 'ferrari logo', 'apple logo'];
const CONFLICTS: [string[], string[]][] = [
  [['evlat edin', 'evlatlık'], ['üvey']],
  [['adopted', 'adoption'], ['stepson', 'stepdaughter', 'stepmother', 'stepfather', 'step-son', 'step-daughter']],
  [['ilk kez', 'ilk defa'], ['yine', 'tekrar', 'her zamanki gibi']],
  [['first time'], ['again', 'as always']],
  [['only child', 'tek çocuk'], ['my brother', 'my sister', 'kardeşim', 'ağabeyim', 'ablam']],
];
const MOVES: { key: string; re: RegExp }[] = [
  { key: 'whip', re: /whip[- ]pan|kamçı pan/giu },
  { key: 'dollyzoom', re: /dolly[- ]zoom|vertigo/giu },
  { key: 'push', re: /push(es|ing)?[- ]in/giu },
  { key: 'pull', re: /pull(s|ing)?[- ](out|back)/giu },
  { key: 'pan', re: /(?<!\p{L})(pan|pans|panning)(?!\p{L})/giu },
  { key: 'tilt', re: /(?<!\p{L})(tilt|tilts|tilting)(?!\p{L})/giu },
  { key: 'dolly', re: /(?<!\p{L})dolly(?!\p{L})/giu },
  { key: 'orbit', re: /(?<!\p{L})(orbit|orbits|orbiting|arc shot)(?!\p{L})/giu },
  { key: 'crane', re: /(?<!\p{L})(crane|jib)(?!\p{L})/giu },
  { key: 'truck', re: /(?<!\p{L})(truck|trucks|trucking)(?!\p{L})/giu },
  { key: 'zoom', re: /(?<!\p{L})(crash zoom|slow zoom|zooms? in|zooms? out)(?!\p{L})/giu },
  { key: 'drone', re: /(?<!\p{L})drone(?!\p{L})/giu },
  { key: 'follow', re: /(?<!\p{L})(follows|tracking shot)(?!\p{L})/giu },
];
const TR_MOVES: [string, string][] = [['push', 'yaklaş'], ['pull', 'uzaklaş'], ['pan', 'pan'], ['tilt', 'tilt'], ['crane', 'vinç'], ['crane', 'yüksel'], ['orbit', 'yörünge'], ['orbit', 'etrafında dön'], ['truck', 'yana kay'], ['follow', 'takip']];
const TIME_WORDS: { key: string; words: string[] }[] = [
  { key: 'night', words: ['night', 'midnight', 'moonlight', 'gece', 'gecenin', 'gece yarısı', 'ay ışığı'] },
  { key: 'day', words: ['noon', 'midday', 'sunny afternoon', 'öğle', 'öğlen', 'güneşli öğleden sonra'] },
  { key: 'golden-hour', words: ['golden hour', 'altın saat'] },
  { key: 'dusk', words: ['sunset', 'dusk', 'gün batımı', 'alacakaranlık'] },
  { key: 'dawn', words: ['dawn', 'sunrise', 'şafak', 'gün doğumu'] },
];
const WEATHER_WORDS: { key: string; words: string[] }[] = [
  { key: 'rain', words: ['rain', 'raining', 'rainy', 'yağmur', 'yağmurlu'] },
  { key: 'snow', words: ['snow', 'snowing', 'snowy', 'karlı', 'kar yağ'] },
  { key: 'fog', words: ['fog', 'foggy', 'sisli', 'sis'] },
  { key: 'clear', words: ['clear sky', 'cloudless', 'açık gökyüzü', 'bulutsuz'] },
];

const textOf = (p: Part) => [p.scene, p.sceneEn, ...p.characters.map((c) => c.action ?? ''), ...p.dialogue.map((d) => d.textEn || d.textTr)].join(' \n ');
const re = (r: RegExp, s: string) => { r.lastIndex = 0; return r.test(s); };
const textNoParams = (t: string) => t.replace(/\s--[a-z]+(\s+[^\s-][^\s]*)?/gi, '').trim();

// ---------- text checks ----------
const checks: Record<string, Check> = {
  'char.invisible-word': ({ text }) => {
    if (!text) return [];
    const hits: Hit[] = [];
    for (const w of INVISIBLE_WORDS) {
      if (!hasWord(text, w.word, w.lang === 'tr')) continue;
      const replacement = w.lang === 'tr' ? w.visibleTr : w.visibleEn;
      const fixText = text.replace(wordRegex(w.word, w.lang === 'tr'), replacement);
      hits.push({ messageTr: `“${w.word}” görünmeyen bir kelime. Görünür karşılığı: “${replacement}”.`, fixText });
    }
    return hits;
  },

  'text.texture-line': ({ text }) => {
    if (!text || !text.trim()) return [];
    const body = textNoParams(text);
    if (body.endsWith(TEXTURE_LINE) || body.endsWith(TEXTURE_LINE_TR)) return [];
    return [{ messageTr: 'Prompt doku satırıyla bitmiyor.', fixText: `${text.trimEnd()}\n${TEXTURE_LINE}` }];
  },

  'ref.order': ({ text, project, cardId }) => {
    const max = cardMax(cardId);
    const hits: Hit[] = [];
    if (text) {
      const nums = [...text.matchAll(/@image-(\d+)/g)].map((m) => Number(m[1]));
      const firstSeen = nums.filter((n, i) => nums.indexOf(n) === i);
      const sorted = [...firstSeen].sort((a, b) => a - b);
      const sequential = sorted.every((n, i) => n === i + 1);
      const ordered = firstSeen.every((n, i) => n === sorted[i]);
      if (firstSeen.length && (!sequential || !ordered)) hits.push({ messageTr: `Referanslar sıralı değil: ${firstSeen.map((n) => '@image-' + n).join(', ')}. 1'den başlayıp sırayla gitmeli.` });
      if (firstSeen.length > max) hits.push({ messageTr: `${firstSeen.length} referans var, bu model en fazla ${max} kabul ediyor.` });
    }
    if (project) {
      const count = project.characters.length + (project.locationId ? 1 : 0);
      if (count > max) hits.push({ messageTr: `Projede ${count} referans görsel var, hedef model en fazla ${max} kabul ediyor.` });
    }
    return hits;
  },

  'dialogue.logic': ({ text, project }) => {
    const texts = [text ?? '', ...(project?.parts.flatMap((p) => p.dialogue.map((d) => `${d.textTr} ${d.textEn ?? ''}`)) ?? [])];
    const hits: Hit[] = [];
    for (const t of texts) {
      if (!t.trim()) continue;
      for (const [a, b] of CONFLICTS) {
        const x = a.find((w) => lower(t).includes(lower(w)));
        const y = b.find((w) => lower(t).includes(lower(w)));
        if (x && y) hits.push({ messageTr: `“${x}” ile “${y}” aynı cümlede çelişiyor.` });
      }
    }
    return hits;
  },

  'safety.ip': ({ text, project }) => {
    const all = [text ?? '', ...(project ? project.parts.map(textOf) : []), ...(project?.characters.map((c) => c.descriptionEn + ' ' + c.wardrobe) ?? [])].join(' ');
    const w = anyWord(all, IP_WORDS);
    return w ? [{ messageTr: `“${w}” gerçek bir kişi, marka ya da telifli karakter olabilir.` }] : [];
  },

  // ---------- light ----------
  'light.source-direction': ({ text, project }) => {
    const hits: Hit[] = [];
    if (text) {
      const t = lower(text);
      const overhead = /(ceiling|overhead|tavan)/u.test(t);
      const below = /(from below|from underneath|under the chin|uplight|aşağıdan|alttan)/u.test(t);
      const sunBelow = /(sun|güneş)/u.test(t) && /(from below|aşağıdan)/u.test(t);
      if ((overhead && below) || sunBelow) hits.push({ messageTr: 'Tepedeki bir kaynak aşağıdan vuramaz.' });
    }
    project?.parts.forEach((p, i) => {
      const src = LIGHT_BY_ID[p.light.source];
      if (src && !src.allowed.includes(p.light.direction)) {
        hits.push({ partIndex: i, messageTr: `${i + 1}. parça: ${src.tr} ${dirTr(p.light.direction)} gelemez.`, graphFix: { type: 'light-direction', partIndex: i, direction: src.allowed[0] as Dir } });
      }
    });
    return hits;
  },

  'light.shadow-side': ({ text }) => {
    if (!text) return [];
    const t = lower(text);
    const en1 = /(light|lamp|window|sun|lit)[^.;]*from the (left|right)/u.exec(t);
    const en2 = /shadows?[^.;]{0,40}(to|on|toward) the (left|right)/u.exec(t);
    if (en1 && en2 && en1[2] === en2[2]) return [{ messageTr: `Işık ${en1[2] === 'left' ? 'soldan' : 'sağdan'} geliyor ama gölge de aynı tarafa düşüyor.` }];
    const tr1 = /(soldan|sağdan)/u.exec(t);
    const tr2 = /gölge[^.;]{0,40}(sola|sağa)/u.exec(t);
    if (tr1 && tr2 && ((tr1[1] === 'soldan' && tr2[1] === 'sola') || (tr1[1] === 'sağdan' && tr2[1] === 'sağa'))) return [{ messageTr: 'Işık ile gölge aynı tarafta. Gölge ışığın karşısına düşer.' }];
    return [];
  },

  'light.hardness-edge': ({ text }) => {
    if (!text) return [];
    const t = lower(text);
    const soft = /(soft|diffused)[\w\s-]{0,12}(light|glow|window)|overcast|yumuşak[\p{L}\s]{0,12}ışı|kapalı hava/u.test(t);
    const hard = /(hard light|harsh|direct sun|noon sun|sert ışık|sert öğle|sert güneş)/u.test(t);
    const sharpShadow = /(sharp|crisp|razor[- ]sharp|hard)[\w\s-]{0,12}shadows?|keskin[\p{L}\s]{0,15}gölge|jilet[\p{L}\s]{0,25}gölge/u.test(t);
    const softShadow = /(soft|blurry|faint|diffuse)[\w\s-]{0,12}shadows?|(silik|yumuşak|bulanık)[\p{L}\s]{0,15}gölge/u.test(t);
    if (soft && !hard && sharpShadow) return [{ messageTr: 'Yumuşak ışık keskin gölge bırakmaz.' }];
    if (hard && !soft && softShadow) return [{ messageTr: 'Sert ışık silik gölge bırakmaz.' }];
    return [];
  },

  'light.color-match': ({ text, project }) => {
    const hits: Hit[] = [];
    if (text) {
      const t = lower(text);
      if (/(candle|fire|flame|mum|ateş|alev)/u.test(t) && /(blue|cold|cool|icy|mavi|soğuk|buz)/u.test(t) && !/(screen|moon|ekran|ay ışığı|neon)/u.test(t))
        hits.push({ messageTr: 'Mum ve ateş turuncu yanar; mavi ya da soğuk olamaz.' });
      if (/(phone screen|screen glow|ekran)/u.test(t) && /(warm orange|amber|kehribar|sıcak turuncu)/u.test(t) && !/(candle|fire|mum|ateş|lamp|lamba)/u.test(t))
        hits.push({ messageTr: 'Ekran ışığı soğuk mavidir, turuncu değil.' });
    }
    project?.parts.forEach((p, i) => {
      const src = LIGHT_BY_ID[p.light.source];
      if (src && Math.abs(p.light.kelvin - src.kelvin) > Math.max(1200, src.kelvin * 0.3)) {
        hits.push({ partIndex: i, messageTr: `${i + 1}. parça: ${src.tr} yaklaşık ${src.kelvin}K yanar, ${p.light.kelvin}K yazılmış.`, graphFix: { type: 'light-kelvin', partIndex: i, kelvin: src.kelvin } });
      }
    });
    return hits;
  },

  // ---------- continuity ----------
  'continuity.light': ({ project }) => {
    if (!project || project.parts.length < 2) return [];
    const base = project.parts[0].light;
    return project.parts.slice(1).flatMap((p, k) => {
      const i = k + 1;
      if (p.light.source === base.source && p.light.direction === base.direction) return [];
      return [{ partIndex: i, messageTr: `${i + 1}. parçada ışık değişmiş (${LIGHT_BY_ID[p.light.source]?.tr ?? p.light.source}, ${dirTr(p.light.direction)}).`, graphFix: { type: 'copy-light', from: 0, to: i } as GraphFix }];
    });
  },

  'continuity.time-weather': ({ project }) => {
    if (!project) return [];
    const loc = project.locations.find((l) => l.id === project.locationId);
    if (!loc) return [];
    const hits: Hit[] = [];
    project.parts.forEach((p, i) => {
      const t = `${p.scene} ${p.sceneEn ?? ''}`;
      for (const g of TIME_WORDS) {
        const w = anyWord(t, g.words);
        if (w && g.key !== loc.timeOfDay) hits.push({ partIndex: i, messageTr: `${i + 1}. parçada “${w}” geçiyor ama mekânın zamanı farklı.` });
      }
      for (const g of WEATHER_WORDS) {
        const w = anyWord(t, g.words);
        if (w && g.key !== loc.weather) hits.push({ partIndex: i, messageTr: `${i + 1}. parçada “${w}” geçiyor ama mekânın havası farklı.` });
      }
    });
    return hits;
  },

  // ---------- camera ----------
  'camera.single-move': ({ text, project }) => {
    const hits: Hit[] = [];
    const count = (t: string) => {
      let s = t; const found: string[] = [];
      for (const m of MOVES) { if (re(m.re, s)) { found.push(m.key); m.re.lastIndex = 0; s = s.replace(m.re, ' '); } }
      // Turkish: "Kerem yaklaşıyor" is the actor moving; only sentences about the camera count.
      for (const sent of lower(t).split(/[.;!?\n]/u)) {
        if (!/kamera/u.test(sent)) continue;
        for (const [key, stem] of TR_MOVES) if (new RegExp(`(?<!\\p{L})${stem}`, 'u').test(sent) && !found.includes(key)) found.push(key);
      }
      return found;
    };
    if (text) {
      const f = count(text);
      if (f.length > 1) hits.push({ messageTr: `Bu metinde ${f.length} kamera hareketi var: ${f.join(', ')}. Bir parçada tek hareket olmalı.` });
    }
    project?.parts.forEach((p, i) => {
      const f = count(`${p.scene} ${p.sceneEn ?? ''}`);
      const graphMove = p.camera.motion && p.camera.motion !== 'move.static' ? 1 : 0;
      if (f.length + graphMove > 1) hits.push({ partIndex: i, messageTr: `${i + 1}. parçada birden fazla kamera hareketi var.` });
    });
    return hits;
  },

  'camera.pov-face': ({ text, project }) => {
    const hits: Hit[] = [];
    if (text && /(\bpov\b|point[- ]of[- ]view|bakış açısı)/iu.test(text)) {
      const w = anyWord(text, FACE_WORDS, true);
      if (w) hits.push({ messageTr: `POV'da bakan karakterin yüzü görünmez (“${w}”). Bu yüz bakılan kişiye aitse sorun yok.` });
    }
    project?.parts.forEach((p, i) => {
      if (p.camera.perspective !== 'persp.pov') return;
      const viewer = p.characters[0];
      const w = viewer?.action ? anyWord(viewer.action, FACE_WORDS, true) : null;
      if (w) hits.push({ partIndex: i, messageTr: `${i + 1}. parça POV ama bakan karakterin yüz ifadesi yazılmış (“${w}”).`, graphFix: { type: 'perspective', partIndex: i, perspective: 'persp.reaction', framing: 'size.cu' } });
    });
    return hits;
  },

  'camera.ots-two': ({ text, project }) => {
    const hits: Hit[] = [];
    if (text && /(over[- ]the[- ]shoulder|omuz üstü)/iu.test(text)) {
      const names = new Set((text.match(/@image-\d+/g) ?? []));
      const two = names.size >= 2 || /(two|both|each other|iki|ikisi|karşısındaki|across from|facing)/iu.test(text);
      if (!two) hits.push({ messageTr: 'Omuz üstü çekim yazılmış ama metinde ikinci karakter yok.' });
    }
    project?.parts.forEach((p, i) => {
      if (p.camera.perspective === 'persp.ots' && p.characters.length < 2)
        hits.push({ partIndex: i, messageTr: `${i + 1}. parça omuz üstü ama sahnede ${p.characters.length} karakter var.`, graphFix: { type: 'perspective', partIndex: i, perspective: undefined, framing: 'size.cu' } });
    });
    return hits;
  },

  'camera.motivated-move': ({ project }) => {
    if (!project) return [];
    const unmotivated = ['move.pan', 'move.orbit', 'move.truck', 'move.whip-pan'];
    return project.parts.flatMap((p, i) => {
      if (!unmotivated.includes(p.camera.motion) || !p.characters.length) return [];
      const still = p.characters.every((c) => ['standing', 'sitting'].includes(c.pose) && !anyWord(c.action ?? '', STILL_WORDS, true));
      const sceneMoves = anyWord(`${p.scene} ${p.sceneEn ?? ''}`, STILL_WORDS, true);
      return still && !sceneMoves ? [{ partIndex: i, messageTr: `${i + 1}. parçada karakterler duruyor ama kamera hareket ediyor.`, graphFix: { type: 'motion', partIndex: i, motion: 'move.push-in' } as GraphFix }] : [];
    });
  },

  // ---------- character ----------
  'char.mask-expression': ({ project }) => {
    if (!project) return [];
    return project.parts.flatMap((p, i) => p.characters.flatMap((c, ci) => {
      if (!c.mask || c.mask === 'none' || c.mask === 'eyes') return [];
      const words = c.mask === 'full' ? FACE_WORDS : MOUTH_WORDS;
      const w = anyWord(c.action ?? '', words, true);
      return w ? [{ partIndex: i, messageTr: `${i + 1}. parça: maske yüzü kapatıyor ama ifade yazılmış (“${w}”).`, graphFix: { type: 'mask', partIndex: i, charIndex: ci, mask: c.mask === 'full' ? 'eyes' : 'none' } as GraphFix }] : [];
    }));
  },

  'dialogue.length': ({ text, project, cardId }) => {
    const sec = cardSec(cardId);
    const comfy = Math.round((14 * sec) / 10);
    const tight = Math.round((16 * sec) / 10);
    const judge = (n: number, where: string, partIndex?: number): Hit[] =>
      n > tight ? [{ partIndex, severity: 'error', messageTr: `${where}${n} kelime: ${sec} saniyeye sığmaz (en fazla ${comfy} rahat).` }]
        : n > comfy ? [{ partIndex, severity: 'warn', messageTr: `${where}${n} kelime: sıkışık. ${comfy} kelimeye indir.` }] : [];
    const hits: Hit[] = [];
    if (text) {
      const quoted = [...text.matchAll(/["“”]([^"“”]+)["“”]/g)].map((m) => m[1]).join(' ');
      if (quoted) hits.push(...judge(countWords(quoted), 'Replik: '));
    }
    project?.parts.forEach((p, i) => {
      const n = p.dialogue.reduce((a, d) => a + countWords(d.textEn || d.textTr), 0);
      hits.push(...judge(n, `${i + 1}. parça replikleri: `, i));
    });
    return hits;
  },
};

function cardSec(cardId?: string) {
  return CARD_FALLBACK(cardId).partSec ?? 10;
}

const DIR_TR_SHORT: Record<string, string> = { front: 'önden', left: 'soldan', right: 'sağdan', back: 'arkadan', top: 'yukarıdan', bottom: 'aşağıdan', 'front-left': 'sol önden', 'front-right': 'sağ önden', 'back-left': 'sol arkadan', 'back-right': 'sağ arkadan' };
const dirTr = (d: string) => DIR_TR_SHORT[d] ?? d;

export const RULE_IDS = Object.keys(checks);

/** Run every rule (or a subset) and return results ordered by severity. */
export function runRules(ctx: RuleCtx, only?: string[]): RuleResult[] {
  const out: RuleResult[] = [];
  for (const id of only ?? RULE_IDS) {
    const meta = META[id];
    const check = checks[id];
    if (!meta || !check) continue;
    for (const h of check(ctx)) {
      out.push({ ruleId: id, severity: h.severity ?? meta.severity, messageTr: h.messageTr, fixTr: meta.fixTr, lessonId: meta.lessonId, partIndex: h.partIndex, fixText: h.fixText, graphFix: h.graphFix });
    }
  }
  const rank = { error: 0, warn: 1, tip: 2 } as const;
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export const ruleMeta = (id: string) => META[id];
