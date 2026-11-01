// Content loader: lessons, games, catalog, rules, model cards live in JSON next to this file.
// The UI only reads them; adding a catalog entry is adding JSON, not code.
import angle from './catalog/camera/angle.json';
import position from './catalog/camera/position.json';
import tilt from './catalog/camera/tilt.json';
import perspective from './catalog/camera/perspective.json';
import size from './catalog/camera/size.json';
import lens from './catalog/camera/lens.json';
import movement from './catalog/camera/movement.json';
import composition from './catalog/camera/composition.json';
import focus from './catalog/camera/focus.json';
import aspect from './catalog/camera/aspect.json';
import invisibleWords from './invisible-words.json';
import lightSources from './light-sources.json';
import emotions from './emotions.json';
import glossary from './glossary.json';
import rulesMeta from './rules.json';
import modelCards from './model-cards/cards.json';
import templates from './templates.json';
import games from './games/games.json';
import m1 from './lessons/m1.json';
import m2 from './lessons/m2.json';
import m3 from './lessons/m3.json';
import m4 from './lessons/m4.json';
import m5 from './lessons/m5.json';
import m6 from './lessons/m6.json';
import m7 from './lessons/m7.json';
import m8 from './lessons/m8.json';
import m9 from './lessons/m9.json';
import m10 from './lessons/m10.json';

export interface ThreeParams {
  height: number; distance: number; targetY: number; lensMm: number;
  yawDeg?: number; rollDeg?: number; move?: string; offsetX?: number;
  ots?: boolean; pov?: boolean; two?: boolean;
}
export interface CatalogEntry {
  id: string; category: string; tr: string; en: string; descTr: string;
  emotions: string[]; avoidTr: string; promptEn: string; promptTr: string;
  variants: Record<string, string>; three: ThreeParams; mistakes: string[];
  lessonId: string; gameId: string;
  fStop?: number;          // focus entries set the aperture
  aspect?: string;         // aspect entries set the project frame
}
export interface InvisibleWord { word: string; lang: 'en' | 'tr'; visibleEn: string; visibleTr: string }
export interface LightSource { id: string; tr: string; en: string; kelvin: number; hardness: 'sert' | 'yumusak'; allowed: string[]; colorEn: string; colorTr: string }
export interface Emotion { id: string; tr: string; en: string }
export interface GlossaryEntry { en: string; tr: string; descTr: string }
export interface RuleMeta { id: string; group: string; severity: 'error' | 'warn' | 'tip'; whyTr: string; fixTr: string; lessonId: string }
export interface ModelCard {
  id: string; name: string; kind: 'image' | 'video' | 'both'; partSec: number | null; refSyntax: string;
  maxRefs: number; dialogueSyntax: string | null; wordLimit: number | null; weaknessesTr: string[];
  extraRulesTr: string[]; verified: boolean; lastVerified: string | null; notesTr: string;
}
export interface Template {
  id: string; tr: string; beats: string[]; hintTr: string;
  beatLabelsTr?: string[]; cardHint?: string;
  stepNotesTr?: Record<string, string>;
  defaults?: { framing?: string; angle?: string; motion?: string; lensMm?: number }[];
}

export type Game =
  | { id: string; type: 'slider'; titleTr: string; introTr: string; rounds: { param: 'kelvin' | 'lensMm'; min: number; max: number; step: number; target: number; tolerance: number; askTr: string; whyTr: string }[] }
  | { id: string; type: 'match'; titleTr: string; introTr: string; pairs: { left: string; right: string; whyTr: string }[] }
  | { id: string; type: 'contradiction'; titleTr: string; introTr: string; items: { text: string; tr: string; bad: boolean; whyTr: string }[] }
  | { id: string; type: 'duel'; titleTr: string; introTr: string; rounds: { askTr: string; a: { label: string; catalogId: string }; b: { label: string; catalogId: string }; correct: 'a' | 'b'; whyTr: string }[] };

export interface Lesson {
  id: string; titleTr: string; minutes: number; goalTr: string;
  demo: { kind: string; textTr: string; catalogIds?: string[]; exampleEn?: string; exampleTr?: string };
  gameId: string;
  write: { taskTr: string; focus: string[] };
  quiz: { qTr: string; options: string[]; answer: number; whyTr: string }[];
  studio: { catalogIds?: string[]; light?: { source: string; kelvin: number; hardness: 'sert' | 'yumusak'; direction: string } };
}
export interface Module { id: string; titleTr: string; subtitleTr: string; lessons: Lesson[] }

export const CATALOG: CatalogEntry[] = [
  ...angle, ...position, ...tilt, ...perspective, ...size, ...lens, ...movement, ...composition, ...focus, ...aspect,
] as CatalogEntry[];
export const CATALOG_BY_ID: Record<string, CatalogEntry> = Object.fromEntries(CATALOG.map((e) => [e.id, e]));
export const CATEGORY_TR: Record<string, string> = {
  angle: 'Dikey açı', position: 'Yatay konum', tilt: 'Eğim', perspective: 'Perspektif ve çekim tipi',
  size: 'Kadraj boyutu', lens: 'Lens', movement: 'Kamera hareketi', composition: 'Kompozisyon',
  focus: 'Odak ve derinlik', aspect: 'Kadraj oranı',
};

export const INVISIBLE_WORDS = invisibleWords as InvisibleWord[];
export const LIGHT_SOURCES = lightSources as LightSource[];
export const LIGHT_BY_ID: Record<string, LightSource> = Object.fromEntries(LIGHT_SOURCES.map((l) => [l.id, l]));
export const EMOTIONS = emotions as Emotion[];
export const GLOSSARY = glossary as GlossaryEntry[];
export const RULES_META = rulesMeta as RuleMeta[];
const BASE_CARDS: ModelCard[] = structuredClone(modelCards as ModelCard[]);
/** Live list used everywhere. User edits from Settings are applied in place via applyCardOverrides. */
export const MODEL_CARDS: ModelCard[] = structuredClone(BASE_CARDS);
export type CardOverride = Partial<Omit<ModelCard, 'id'>>;
export function applyCardOverrides(overrides: Record<string, CardOverride>, custom: ModelCard[] = []) {
  MODEL_CARDS.length = 0;
  for (const c of BASE_CARDS) MODEL_CARDS.push({ ...structuredClone(c), ...(overrides[c.id] ?? {}) });
  for (const c of custom) if (!MODEL_CARDS.some((x) => x.id === c.id)) MODEL_CARDS.push({ ...c, ...(overrides[c.id] ?? {}) });
}
export const baseCard = (id: string) => BASE_CARDS.find((c) => c.id === id);
export const TEMPLATES = templates as unknown as Template[];
export const GAMES = games as Game[];
export const GAME_BY_ID: Record<string, Game> = Object.fromEntries(GAMES.map((g) => [g.id, g]));

/** Modules in curriculum order (M1–M10). */
export const MODULES: Module[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10] as Module[];
export const FUTURE_MODULES: { id: string; titleTr: string; subtitleTr: string }[] = [];
export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);
export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

export const TEXTURE_LINE = 'No sharpen, no color bleeding, natural photographic texture.';
export const TEXTURE_LINE_TR = 'Keskinleştirme yok, renk taşması yok, doğal fotoğraf dokusu.';
