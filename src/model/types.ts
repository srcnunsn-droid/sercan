// SECO Film Atölyesi — scene graph & domain model.
// Every screen reads/writes the same Project graph; prompts are compiled from it.

export const SCHEMA_VERSION = 2;

export type Beat = 'durum' | 'catisma' | 'zirve';
export type Hardness = 'sert' | 'yumusak';
export type Dir = 'front' | 'left' | 'right' | 'back' | 'top' | 'bottom' | 'front-left' | 'front-right' | 'back-left' | 'back-right';
export type AngleId = string; // catalog id, e.g. "angle.low"
export type MotionId = string; // catalog id, e.g. "move.push-in"
export type Aspect = '16:9' | '9:16' | '1:1' | '4:5' | '2.39:1';

export interface CameraRig {
  angle: AngleId;          // vertical angle (catalog)
  framing: string;         // shot size (catalog), e.g. "size.medium"
  perspective?: string;    // e.g. "persp.ots", "persp.pov"
  lensMm: number;
  fStop: number;
  motion: MotionId;        // single camera move per part
  dutch?: boolean;
}

export interface LightRig {
  source: string;          // visible source: "window", "ceiling-lamp", "candle", "sun", "neon", "screen", "fire", "street-lamp"
  kelvin: number;
  hardness: Hardness;
  direction: Dir;
  secondary?: { source: string; kelvin: number; direction: Dir } | null;
  atmosphere?: 'none' | 'haze' | 'fog' | 'smoke' | 'dust';
}

export interface CharacterRef {
  characterId: string;
  pose: string;            // pose preset id
  action?: string;         // visible action, English or Turkish
  mask?: 'none' | 'eyes' | 'mouth' | 'full';
}

export interface DialogueLine {
  speaker: string;
  textTr: string;
  textEn?: string;
  atSec: number;
}

export interface AssetRef {
  assetId: string;
  ref: string;             // "@image-1"
}

export interface Part {
  id: string;
  index: 0 | 1 | 2;        // 3 x 10 s
  beat: Beat;
  scene: string;           // what happens, visible terms (Turkish allowed)
  sceneEn?: string;        // English version used by the compiler
  camera: CameraRig;
  light: LightRig;
  characters: CharacterRef[];
  dialogue: DialogueLine[];
  sound?: string;
  startFrame?: AssetRef;
}

export interface Character {
  id: string;
  name: string;
  descriptionTr: string;
  descriptionEn: string;   // visible traits only
  wardrobe: string;
  sheetPromptEn?: string;
  locked?: boolean;
}

export interface Location {
  id: string;
  name: string;
  descriptionEn: string;
  timeOfDay: 'dawn' | 'day' | 'golden-hour' | 'dusk' | 'night';
  weather: 'clear' | 'overcast' | 'rain' | 'snow' | 'fog';
  setId?: string;          // 3D set preset (engine/sets.ts)
  props?: { id: string; propId: string; pos: [number, number]; rotY: number }[];
}

export interface Asset {
  id: string;
  kind: 'character-sheet' | 'location' | 'start-frame' | 'reference' | 'other';
  label: string;
  ref?: string;            // "@image-N"
  note?: string;
  createdAt: number;
}

export interface PromptBundle {
  id: string;
  partId?: string;
  target: string;          // model card id
  en: string;
  tr: string;
  createdAt: number;
}

export interface Project {
  schemaVersion: number;
  id: string;
  title: string;
  template: string;
  aspect: Aspect;
  createdAt: number;
  updatedAt: number;
  characters: Character[];
  locations: Location[];
  locationId?: string;
  parts: Part[];
  assets: Asset[];
  prompts: PromptBundle[];
  factory: { step: number; visualsApproved: boolean };
  credits: { attempts: number; spent: number };
}

// Academy / progression
export interface Progress {
  xp: number;
  streak: number;
  lastDay: string;         // YYYY-MM-DD
  completedLessons: string[];
  unlockedLessons: string[];
  badges: string[];
  ruleHits: Record<string, number>; // rule id -> times violated (weak-spot map)
  favorites: string[];     // catalog ids
}

export type Severity = 'error' | 'warn' | 'tip';

export interface RuleResult {
  ruleId: string;
  severity: Severity;
  messageTr: string;
  fixTr: string;
  lessonId?: string;
  partIndex?: number;
  /** Corrected full text, for text rules that can repair themselves. */
  fixText?: string;
  /** Data describing a scene-graph repair; the store knows how to apply it. */
  graphFix?: GraphFix;
}

export type GraphFix =
  | { type: 'light-direction'; partIndex: number; direction: Dir }
  | { type: 'light-kelvin'; partIndex: number; kelvin: number }
  | { type: 'copy-light'; from: number; to: number }
  | { type: 'perspective'; partIndex: number; perspective?: string; framing?: string }
  | { type: 'motion'; partIndex: number; motion: string }
  | { type: 'mask'; partIndex: number; charIndex: number; mask: 'none' | 'eyes' | 'mouth' | 'full' };
