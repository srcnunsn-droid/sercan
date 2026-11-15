// ==== Kadraj Studio — çekirdek veri modeli ====

export type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'backOut' | 'elastic' | 'bounce' | 'hold' | 'bezier';

export interface Keyframe { t: number; v: number; e: Easing; b?: [number, number, number, number] } // t: klip içi saniye; b: cubic-bezier (e='bezier')

export type AnimProp = 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'blur';
export const ANIM_PROPS: AnimProp[] = ['x', 'y', 'scale', 'rotation', 'opacity', 'blur'];

export interface Transform { x: number; y: number; scale: number; rotation: number; opacity: number; blur: number }

export type EffectType =
  | 'brightness' | 'contrast' | 'saturation' | 'hue' | 'grayscale' | 'sepia' | 'invert'
  | 'vignette' | 'grain' | 'chroma' | 'glitch' | 'letterbox' | 'tint' | 'lightleak' | 'shake' | 'pixelate' | 'scanlines'
  | 'grade' | 'lut' | 'chromakey' | 'mask' | 'sharpen' | 'glow';

export interface Effect { id: string; type: EffectType; on: boolean; p: Record<string, number | string> }

export type TransitionType = 'none' | 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoomIn' | 'zoomOut' | 'blur' | 'wipe' | 'spin' | 'flash';
export interface Transition { type: TransitionType; d: number }

export type TextAnim = 'none' | 'typewriter' | 'fadeUp' | 'pop' | 'blurIn' | 'tracking' | 'wordByWord' | 'glitchIn';

export interface TextProps {
  text: string; font: string; size: number; weight: number; color: string; align: 'left' | 'center' | 'right';
  stroke: string; strokeW: number; shadow: number; bg: string; bgPad: number; lineH: number; anim: TextAnim; animD: number; maxW: number;
  counter?: { from: number; to: number; dec: number; prefix: string; suffix: string; dur: number; delay?: number }; // animasyonlu sayaç
}

export type ClipKind = 'media' | 'text' | 'solid' | 'gradient' | 'shape' | 'adjust' | 'null' | 'particles';
export interface ShapeProps { shape: 'rect' | 'circle' | 'line' | 'triangle' | 'star' | 'polygon'; w: number; h: number; fill: string; stroke: string; strokeW: number; radius: number; drawOn?: number; drawDelay?: number; points?: number }
export interface ParticleProps { rate: number; life: number; speed: number; angle: number; spread: number; gravity: number; drag: number; size: number; sizeEnd: number; color: string; color2: string; shape: 'circle' | 'square' | 'spark' | 'confetti' | 'glow'; additive: boolean; turbulence: number; emitW: number; emitH: number; seed: number; spin: number }

// ---- Kalem (bezier) maskesi — AE tarzı, katman uzayında (merkez orijinli proje pikseli) ----
export interface MaskPt { x: number; y: number; ix: number; iy: number; ox: number; oy: number } // çapa + giriş/çıkış tutamaç ofsetleri
export interface MaskKey { t: number; pts: MaskPt[]; e: Easing; b?: [number, number, number, number] }  // maske yolu keyframe'i (t: klip içi sn)
export type MaskMode = 'add' | 'subtract' | 'intersect';
export interface Mask { id: string; name: string; on: boolean; closed: boolean; pts: MaskPt[]; mode: MaskMode; invert: boolean; feather: number; expand: number; opacity: number; kf?: MaskKey[] }

export interface Clip {
  id: string; trackId: string; kind: ClipKind; name: string;
  start: number; duration: number; in: number; speed: number;
  assetId?: string;
  base: Transform;
  kf: Partial<Record<AnimProp, Keyframe[]>>;
  fit: 'cover' | 'contain' | 'stretch';
  blend: GlobalCompositeOperation;
  effects: Effect[];
  tIn: Transition; tOut: Transition;
  text?: TextProps;
  shape?: ShapeProps;
  particles?: ParticleProps;
  color?: string; color2?: string; angle?: number;
  volume: number; fadeIn: number; fadeOut: number; muted?: boolean;
  crop?: { l: number; t: number; r: number; b: number };
  expr?: Partial<Record<AnimProp, string>>; // After Effects tarzı ifadeler
  parent?: string;                          // ebeveyn klip (parenting)
  motionBlur?: boolean;
  masks?: Mask[];                           // kalem maskeleri
}

export type TrackKind = 'video' | 'audio';
export interface Track { id: string; kind: TrackKind; name: string; muted: boolean; hidden: boolean; locked: boolean }

export type AssetKind = 'image' | 'video' | 'audio';
export interface Asset {
  id: string; kind: AssetKind; name: string; mime: string;
  duration: number; w: number; h: number; created: number;
  origin: 'import' | 'procedural' | 'ai';
  meta?: Record<string, unknown>;
}

export interface Shot {
  id: string; desc: string; size: string; move: string; lens: string; light: string;
  duration: number; vo: string; onscreen: string; sfx: string; prompt: string; negative: string; assetId?: string;
}
export interface Scene { id: string; title: string; beat: string; location: string; time: string; mood: string; shots: Shot[] }

export interface Idea {
  topic: string; format: string; tone: string; audience: string; duration: number; aspect: string; notes: string;
  logline: string; hooks: string[]; style: { palette: string[]; look: string; music: string; bpm: number; font: string }; cta: string;
}

export interface ProjectSettings { width: number; height: number; fps: number; bg: string; safeArea: boolean; duck?: { on: boolean; db: number; voiceTrack?: string } }

export interface Project {
  id: string; name: string; updated: number; version: 1;
  settings: ProjectSettings;
  idea: Idea | null;
  scenes: Scene[];
  assets: Asset[];
  tracks: Track[];
  clips: Clip[];
  markers: { t: number; label: string }[];
  luts?: { id: string; name: string; size: number; data: number[] }[];
  mode?: 'video' | 'image';
  paintRev?: number;
}

export type Panel = 'idea' | 'story' | 'media' | 'editor' | 'templates' | 'image' | 'audio' | 'ai' | 'export' | 'eco';
export type Tool = 'select' | 'pen' | 'brush' | 'eraser' | 'marquee' | 'ellipse' | 'lasso';
export interface Brush { color: string; size: number; hardness: number; opacity: number }
