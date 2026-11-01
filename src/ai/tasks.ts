// Claude task layer: schema-checked JSON in/out, one retry, then deterministic template fallback.
import system from '../prompts/_system.md?raw';
import tEvaluate from '../prompts/evaluatePrompt.md?raw';
import tTranslate from '../prompts/translateToEnglish.md?raw';
import tTutor from '../prompts/tutor.md?raw';
import tExercise from '../prompts/generateExercise.md?raw';
import tIdeas from '../prompts/suggestIdeas.md?raw';
import tStory from '../prompts/writeStoryPlan.md?raw';
import tDialogue from '../prompts/dialogueDoctor.md?raw';
import tContinuity from '../prompts/continuityAudit.md?raw';
import tDiagnose from '../prompts/diagnoseResult.md?raw';
import tCard from '../prompts/draftModelCard.md?raw';
import tPublish from '../prompts/publishCopy.md?raw';
import { GAME_BY_ID, CATALOG, INVISIBLE_WORDS, LIGHT_SOURCES, TEXTURE_LINE, TEXTURE_LINE_TR, type ModelCard } from '../content';
import { scorePrompt, type Rubric } from '../engine/rubric';
import { countWords, lower } from '../lib/text';
import type { AIProvider, TaskName } from './types';

const fill = (tpl: string, vars: Record<string, string | number>) =>
  system + '\n\n' + tpl.replace(/<!--.*?-->\n?/s, '').replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));

const isStr = (x: unknown): x is string => typeof x === 'string';
const isArr = Array.isArray;

interface TaskDef<I, O> {
  build(input: I): string;
  valid(x: any): x is O;
  template(input: I): O;
  quick?: boolean;
}

// ---------------- task definitions ----------------
export interface EvaluateIn { text: string; goal: string }
export interface EvaluateOut { rubric: Rubric; reasonsTr: string[]; suggestionEn: string; suggestionTr: string }

const evaluatePrompt: TaskDef<EvaluateIn, { reasonsTr: string[]; suggestionEn: string; suggestionTr: string }> = {
  build: ({ text, goal }) => fill(tEvaluate, { text, goal, rubric: JSON.stringify(scorePrompt(text)) }),
  valid: (x): x is any => x && isArr(x.reasonsTr) && x.reasonsTr.every(isStr) && isStr(x.suggestionEn) && isStr(x.suggestionTr),
  template: ({ text }) => {
    const r = scorePrompt(text);
    let en = text.trim();
    for (const w of INVISIBLE_WORDS) en = en.replace(new RegExp(`(?<![\\p{L}])${w.word}${w.lang === 'tr' ? '\\p{L}*' : ''}(?![\\p{L}])`, 'giu'), w.lang === 'tr' ? w.visibleTr : w.visibleEn);
    if (!r.texture) en = `${en}\n${TEXTURE_LINE}`;
    return { reasonsTr: r.tipsTr.slice(0, 4), suggestionEn: en, suggestionTr: 'Çevrimdışı öneri: görünmeyen kelimeler görünür karşılıklarıyla değiştirildi ve doku satırı eklendi.' };
  },
};

// Offline phrase-level translation: catalog, light sources and a small cinema dictionary.
const DICT: [string, string][] = [
  ...CATALOG.map((e) => [e.promptTr, e.promptEn] as [string, string]),
  ...CATALOG.map((e) => [lower(e.tr), lower(e.en)] as [string, string]),
  ...LIGHT_SOURCES.map((s) => [lower(s.tr), s.en] as [string, string]),
  ...INVISIBLE_WORDS.filter((w) => w.lang === 'tr').map((w) => [w.word, w.visibleEn] as [string, string]),
  ['peron', 'train platform'], ['tren', 'train'], ['köprü', 'bridge'], ['sokak', 'street'], ['oda', 'room'], ['orman', 'forest'],
  ['kadın', 'woman'], ['adam', 'man'], ['kız', 'girl'], ['çocuk', 'child'], ['yağmur', 'rain'], ['gece', 'night'], ['sis', 'fog'],
  ['yakın plan', 'close-up'], ['geniş plan', 'wide shot'], ['alt açı', 'low angle'], ['üst açı', 'high angle'],
  ['soldan', 'from the left'], ['sağdan', 'from the right'], ['arkadan', 'from behind'], ['yukarıdan', 'from above'], ['aşağıdan', 'from below'],
  ['sıcak', 'warm'], ['soğuk', 'cold'], ['sert ışık', 'hard light'], ['yumuşak ışık', 'soft light'], ['gölge', 'shadow'], [TEXTURE_LINE_TR, TEXTURE_LINE],
].sort((a, b) => b[0].length - a[0].length) as [string, string][];

export function offlineTranslate(text: string): string {
  let out = text;
  for (const [tr, en] of DICT) {
    if (!tr) continue;
    out = out.replace(new RegExp(`(?<![\\p{L}])${tr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'giu'), en);
  }
  return out;
}

const translateToEnglish: TaskDef<{ text: string }, { en: string }> = {
  build: ({ text }) => fill(tTranslate, { text }),
  valid: (x): x is { en: string } => x && isStr(x.en) && x.en.trim().length > 0,
  template: ({ text }) => ({ en: offlineTranslate(text) }),
};

const tutor: TaskDef<{ question: string; topic: string }, { answerTr: string; followUpTr: string }> = {
  quick: true,
  build: (i) => fill(tTutor, i),
  valid: (x): x is any => x && isStr(x.answerTr) && isStr(x.followUpTr),
  template: ({ question }) => {
    const q = lower(question);
    const hit = CATALOG.find((e) => q.includes(lower(e.tr).split(' ')[0]) || q.includes(lower(e.en).split(' ')[0]));
    return hit
      ? { answerTr: `${hit.tr}: ${hit.descTr} Ne zaman kullanma: ${hit.avoidTr}`, followUpTr: `Sence ${hit.tr} hangi duyguyu verir?` }
      : { answerTr: 'Çevrimdışı moddayım. Kamera, lens ya da ışık terimi sorarsan katalogdan anlatırım.', followUpTr: 'Örneğin “alt açı nedir?” diye sor.' };
  },
};

export interface ExerciseOut { titleTr: string; items: { text: string; tr: string; bad: boolean; whyTr: string }[] }
const generateExercise: TaskDef<{ topic: string; level: number; weak: string[] }, ExerciseOut> = {
  build: ({ topic, level, weak }) => fill(tExercise, { topic, level, weak: weak.join(', ') || 'yok' }),
  valid: (x): x is ExerciseOut => x && isStr(x.titleTr) && isArr(x.items) && x.items.length >= 3 && x.items.every((i: any) => isStr(i.text) && isStr(i.tr) && typeof i.bad === 'boolean' && isStr(i.whyTr)) && x.items.some((i: any) => i.bad),
  template: () => {
    const g = GAME_BY_ID['g.contradiction-hunter'];
    const items = g.type === 'contradiction' ? [...g.items].sort(() => Math.random() - 0.5) : [];
    return { titleTr: 'Çelişki avcısı (tekrar)', items };
  },
};

export interface IdeasOut { ideas: { titleTr: string; hookTr: string; whyTr: string; effort: string }[] }
const suggestIdeas: TaskDef<{ hint: string }, IdeasOut> = {
  build: (i) => fill(tIdeas, i),
  valid: (x): x is IdeasOut => x && isArr(x.ideas) && x.ideas.length > 0 && x.ideas.every((i: any) => isStr(i.titleTr) && isStr(i.hookTr)),
  template: () => ({ ideas: [
    { titleTr: 'İstasyonda veda', hookTr: 'Tren kapısı kapanırken cama bastırılmış bir el.', whyTr: 'Ayrılık evrensel; tek mekân, iki karakter.', effort: 'kolay' },
    { titleTr: 'Son mektup', hookTr: 'Mum ışığında titreyen bir zarfın mühür kırılıyor.', whyTr: 'Merak kancası; makro detaylar çok izlenir.', effort: 'kolay' },
    { titleTr: 'Yağmurda ilk karşılaşma', hookTr: 'İki şemsiye aynı anda çarpışıyor, su sıçrıyor.', whyTr: 'Romantik komedi açılışı, net bir an.', effort: 'orta' },
    { titleTr: 'Taht salonunda ihanet', hookTr: 'Kralın kadehine düşen tek bir damla.', whyTr: 'Short drama gerilimi, cliffhanger’a uygun.', effort: 'orta' },
    { titleTr: 'Stadyumda dönüş', hookTr: 'Tünelin karanlığından çıkan kramponlar, kalabalığın uğultusu.', whyTr: 'Kutlama reveal formatı; drone ifşa ile biter.', effort: 'zor' },
  ] }),
};

export interface StoryOut { parts: { beat: string; sceneTr: string; sceneEn: string; dialogueTr: string; camera: string }[] }
const writeStoryPlan: TaskDef<{ idea: string }, StoryOut> = {
  build: (i) => fill(tStory, i),
  valid: (x): x is StoryOut => x && isArr(x.parts) && x.parts.length === 3 && x.parts.every((p: any) => isStr(p.sceneTr) && isStr(p.camera)),
  template: ({ idea }) => ({ parts: [
    { beat: 'durum', sceneTr: `${idea}: karakterler ve mekân tanıtılıyor.`, sceneEn: '', dialogueTr: '', camera: 'move.static' },
    { beat: 'catisma', sceneTr: 'Aralarındaki sorun görünür bir eylemle ortaya çıkıyor.', sceneEn: '', dialogueTr: '', camera: 'move.push-in' },
    { beat: 'zirve', sceneTr: 'Karar anı: biri gidiyor ya da kalıyor.', sceneEn: '', dialogueTr: '', camera: 'move.crane' },
  ] }),
};

const dialogueDoctor: TaskDef<{ line: string; sec: number }, { lineTr: string; lineEn: string; words: number; notesTr: string[] }> = {
  quick: true,
  build: ({ line, sec }) => fill(tDialogue, { line, sec, max: Math.round(14 * sec / 10) }),
  valid: (x): x is any => x && isStr(x.lineTr) && isStr(x.lineEn) && isArr(x.notesTr),
  template: ({ line, sec }) => {
    const max = Math.round(14 * sec / 10);
    const words = countWords(line);
    const short = words > max ? line.split(/\s+/).slice(0, max).join(' ') + '…' : line;
    return { lineTr: short, lineEn: offlineTranslate(short), words, notesTr: words > max ? [`${words} kelime; ${max} kelimeye kısaltıldı. Doğal bitiş için kendin düzelt.`] : ['Uzunluk uygun.'] };
  },
};

const continuityAudit: TaskDef<{ parts: string }, { warnings: { partIndex: number; messageTr: string }[] }> = {
  build: (i) => fill(tContinuity, i),
  valid: (x): x is any => x && isArr(x.warnings),
  template: () => ({ warnings: [] }),
};

export interface DiagnoseOut { problemsTr: string[]; fixEn: string; fixTr: string }
const diagnoseResult: TaskDef<{ prompt: string }, DiagnoseOut> = {
  build: (i) => fill(tDiagnose, i),
  valid: (x): x is any => x && isArr(x.problemsTr) && isStr(x.fixEn),
  template: ({ prompt }) => {
    const body = prompt.replace(TEXTURE_LINE, '').trim();
    return {
      problemsTr: ['Çevrimdışı modda görsel incelenemiyor. Kareyi şu sırayla kendin kontrol et: yüz önceki karedekiyle aynı mı, ışık aynı yönden mi geliyor, eller ve parmaklar doğru mu, görüntüde yazı ya da bozulma var mı.'],
      fixEn: `${body}\nKeep exactly the same face and hair as @image-1. Keep the light direction and colour identical to the previous frame. Natural hands with five fingers. No text, no watermark.\n${TEXTURE_LINE}`,
      fixTr: 'Aynı yüz ve saç (@image-1), önceki karedeki ışık yönü ve rengi, doğal eller, yazı ve filigran yok.',
    };
  },
};

export type CardDraft = Omit<ModelCard, 'id' | 'verified' | 'lastVerified'>;
const draftModelCard: TaskDef<{ name: string; docs: string; existing?: string }, CardDraft> = {
  build: ({ name, docs, existing }) => fill(tCard, { name, docs: docs.slice(0, 12000), existing: existing ?? 'yok' }),
  valid: (x): x is CardDraft => x && isStr(x.name) && ['image', 'video', 'both'].includes(x.kind) && typeof x.maxRefs === 'number' && isStr(x.refSyntax) && isArr(x.weaknessesTr) && isArr(x.extraRulesTr) && isStr(x.notesTr),
  template: ({ name, docs }) => {
    const t = lower(docs);
    const video = /(video|second|saniye|\bsn\b|fps|motion|clip)/u.test(t);
    const secs = /(\d{1,2})\s?(s|sec|seconds|sn|saniye)\b/u.exec(t);
    return {
      name, kind: video ? 'video' : 'image', partSec: video ? (secs ? Number(secs[1]) : 10) : null,
      refSyntax: /@image-?\d/u.test(docs) ? '@image-N' : /--cref|--sref/u.test(docs) ? '--cref / --sref' : '@image-N',
      maxRefs: 3, dialogueSyntax: video ? 'Character says: "line"' : null, wordLimit: null,
      weaknessesTr: [], extraRulesTr: [],
      notesTr: 'Çevrimdışı taslak: yalnızca yapıştırdığın metinden tahmin edildi; süre ve referans sınırını kendi denemenle doğrula.',
    };
  },
};

export interface PublishIn { title: string; template: string; hook: string; dialogue: string[]; caption: string; hashtags: string[] }
export interface PublishOut { captionTr: string; titleIdeasTr: string[]; hashtags: string[]; commentQuestionTr: string }
const publishCopy: TaskDef<PublishIn, PublishOut> = {
  quick: true,
  build: ({ title, template, hook, dialogue }) => fill(tPublish, { title, template, hook, dialogue: dialogue.join(' / ') || 'yok' }),
  valid: (x): x is PublishOut => x && isStr(x.captionTr) && isArr(x.titleIdeasTr) && x.titleIdeasTr.every(isStr) && isArr(x.hashtags) && x.hashtags.length > 0 && x.hashtags.every((h: unknown) => isStr(h) && h.startsWith('#')) && isStr(x.commentQuestionTr),
  template: ({ title, caption, hashtags, dialogue }) => {
    const short = title.replace(/\(.*?\)/g, '').trim();
    return {
      captionTr: caption,
      titleIdeasTr: [short, dialogue[0] ? dialogue[0].split(' ').slice(0, 4).join(' ') : 'Son karar', 'Sonunu bekle'].map((x) => x.replace(/[?.!]$/, '')),
      hashtags,
      commentQuestionTr: 'Sen olsan kalır mıydın, gider miydin?',
    };
  },
};

export const TASKS: Record<TaskName, TaskDef<any, any>> = {
  evaluatePrompt, translateToEnglish, tutor, generateExercise, suggestIdeas, writeStoryPlan, dialogueDoctor, continuityAudit, diagnoseResult, draftModelCard, publishCopy,
};

// ---------------- runner ----------------
export interface RunResult<O> { value: O; source: 'claude' | 'template'; noteTr?: string }

const cache = new Map<string, unknown>();
export const callStats = { claude: 0, template: 0, cached: 0 };

export async function runTask<O = any>(provider: AIProvider, name: TaskName, input: any, opts: { signal?: AbortSignal; noCache?: boolean; images?: Blob[] } = {}): Promise<RunResult<O>> {
  const def = TASKS[name];
  const key = name + ':' + JSON.stringify(input);
  if (opts.images?.length) opts.noCache = true; // uploaded images are never cached or stored
  if (!opts.noCache && cache.has(key)) { callStats.cached++; return { value: cache.get(key) as O, source: 'claude' }; }
  const fallback = (noteTr: string): RunResult<O> => { callStats.template++; return { value: def.template(input), source: 'template', noteTr }; };
  if (provider.id === 'mock' || !(await provider.available())) return fallback('Çevrimdışı şablon motoru kullanıldı.');
  const prompt = def.build(input);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await provider.json(attempt === 0 ? prompt : prompt + '\n\nYour previous answer did not match the JSON shape. Follow it exactly.', { signal: opts.signal, quick: def.quick, images: opts.images });
      callStats.claude++;
      if (def.valid(out)) { if (!opts.noCache) cache.set(key, out); return { value: out as O, source: 'claude' }; }
    } catch (e: any) {
      if (e?.code === 'cancelled') throw e;
      if (['not_granted', 'sampling_disabled', 'rate_limited', 'session_expired', 'not_declared'].includes(e?.code)) {
        return fallback(e.code === 'rate_limited' ? 'Claude şu an yoğun; şablon motoru devrede. Biraz sonra tekrar dene.' : 'Claude kullanılamıyor; şablon motoru devrede.');
      }
    }
  }
  return fallback('Claude’un cevabı şemaya uymadı; şablon motoru kullanıldı.');
}
