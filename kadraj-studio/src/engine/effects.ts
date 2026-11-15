import type { EffectType, TransitionType, TextAnim } from '../types';

export interface ParamDef { k: string; label: string; min?: number; max?: number; step?: number; def: number | string; type?: 'color' | 'select' | 'lut'; options?: string[] }
export interface EffectDef { label: string; group: 'Renk' | 'Stil' | 'Hareket' | 'Bozulma' | 'Kompozit'; params: ParamDef[] }

export const EFFECT_DEFS: Record<EffectType, EffectDef> = {
  brightness: { label: 'Parlaklık', group: 'Renk', params: [{ k: 'v', label: 'Değer', min: 0, max: 3, step: 0.01, def: 1.15 }] },
  contrast: { label: 'Kontrast', group: 'Renk', params: [{ k: 'v', label: 'Değer', min: 0, max: 3, step: 0.01, def: 1.2 }] },
  saturation: { label: 'Doygunluk', group: 'Renk', params: [{ k: 'v', label: 'Değer', min: 0, max: 3, step: 0.01, def: 1.3 }] },
  hue: { label: 'Ton kaydırma', group: 'Renk', params: [{ k: 'deg', label: 'Derece', min: -180, max: 180, step: 1, def: 20 }] },
  grayscale: { label: 'Siyah-Beyaz', group: 'Renk', params: [{ k: 'v', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 1 }] },
  sepia: { label: 'Sepya', group: 'Renk', params: [{ k: 'v', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 0.7 }] },
  invert: { label: 'Negatif', group: 'Renk', params: [{ k: 'v', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 1 }] },
  tint: { label: 'Renk tonu / Grade', group: 'Renk', params: [{ k: 'color', label: 'Renk', type: 'color', def: '#ff9a3c' }, { k: 'amount', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 0.35 }, { k: 'mode', label: 'Karışım', type: 'select', options: ['soft-light', 'overlay', 'multiply', 'screen', 'color', 'hue'], def: 'soft-light' }] },
  vignette: { label: 'Vinyet', group: 'Stil', params: [{ k: 'amount', label: 'Koyuluk', min: 0, max: 1, step: 0.01, def: 0.6 }, { k: 'size', label: 'Boyut', min: 0.1, max: 1.2, step: 0.01, def: 0.65 }] },
  grain: { label: 'Film greni', group: 'Stil', params: [{ k: 'amount', label: 'Miktar', min: 0, max: 0.6, step: 0.01, def: 0.12 }] },
  letterbox: { label: 'Sinema bandı', group: 'Stil', params: [{ k: 'ratio', label: 'Oran', min: 1.5, max: 3, step: 0.01, def: 2.39 }] },
  lightleak: { label: 'Işık sızıntısı', group: 'Stil', params: [{ k: 'amount', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 0.5 }, { k: 'speed', label: 'Hız', min: 0, max: 2, step: 0.01, def: 0.4 }, { k: 'color', label: 'Renk', type: 'color', def: '#ff6a2a' }] },
  scanlines: { label: 'Tarama çizgisi (VHS)', group: 'Stil', params: [{ k: 'amount', label: 'Miktar', min: 0, max: 1, step: 0.01, def: 0.25 }, { k: 'gap', label: 'Aralık', min: 2, max: 12, step: 1, def: 4 }] },
  shake: { label: 'Kamera sarsıntısı', group: 'Hareket', params: [{ k: 'amount', label: 'Şiddet (px)', min: 0, max: 80, step: 1, def: 12 }, { k: 'freq', label: 'Frekans', min: 1, max: 40, step: 1, def: 14 }] },
  chroma: { label: 'Renk sapması (RGB split)', group: 'Bozulma', params: [{ k: 'px', label: 'Kayma (px)', min: 0, max: 40, step: 1, def: 6 }] },
  glitch: { label: 'Glitch', group: 'Bozulma', params: [{ k: 'amount', label: 'Şiddet', min: 0, max: 1, step: 0.01, def: 0.4 }, { k: 'rate', label: 'Sıklık', min: 0, max: 1, step: 0.01, def: 0.35 }] },
  grade: { label: 'Renk tekerlekleri (pro grade)', group: 'Renk', params: [
    { k: 'exposure', label: 'Pozlama (EV)', min: -3, max: 3, step: 0.01, def: 0 }, { k: 'contrast', label: 'Kontrast', min: 0.3, max: 2.5, step: 0.01, def: 1 },
    { k: 'saturation', label: 'Doygunluk', min: 0, max: 2.5, step: 0.01, def: 1 }, { k: 'temp', label: 'Sıcaklık', min: -1, max: 1, step: 0.01, def: 0 },
    { k: 'tint', label: 'Tint (yeşil↔mor)', min: -1, max: 1, step: 0.01, def: 0 }, { k: 'shadows', label: 'Gölgeler', min: -1, max: 1, step: 0.01, def: 0 },
    { k: 'highlights', label: 'Yüksek ışık', min: -1, max: 1, step: 0.01, def: 0 },
    { k: 'liftC', label: 'Lift rengi', type: 'color', def: '#3a6df0' }, { k: 'liftA', label: 'Lift miktarı', min: 0, max: 1, step: 0.01, def: 0 },
    { k: 'gammaC', label: 'Gamma rengi', type: 'color', def: '#3ac9a0' }, { k: 'gammaA', label: 'Gamma miktarı', min: 0, max: 1, step: 0.01, def: 0 },
    { k: 'gainC', label: 'Gain rengi', type: 'color', def: '#ff9a3c' }, { k: 'gainA', label: 'Gain miktarı', min: 0, max: 1, step: 0.01, def: 0 },
    { k: 'mix', label: 'Karışım', min: 0, max: 1, step: 0.01, def: 1 }] },
  lut: { label: '3D LUT (.cube)', group: 'Renk', params: [{ k: 'lut', label: 'LUT', type: 'lut', def: '' }, { k: 'amount', label: 'Yoğunluk', min: 0, max: 1, step: 0.01, def: 1 }] },
  chromakey: { label: 'Chroma key (yeşil perde)', group: 'Kompozit', params: [{ k: 'key', label: 'Anahtar renk', type: 'color', def: '#00ff00' }, { k: 'similarity', label: 'Benzerlik', min: 0, max: 1, step: 0.005, def: 0.35 }, { k: 'smooth', label: 'Yumuşaklık', min: 0, max: 1, step: 0.005, def: 0.12 }, { k: 'spill', label: 'Taşma temizliği', min: 0, max: 1, step: 0.01, def: 0.6 }] },
  mask: { label: 'Maske', group: 'Kompozit', params: [{ k: 'shape', label: 'Şekil', type: 'select', options: ['ellipse', 'rect'], def: 'ellipse' }, { k: 'mx', label: 'Merkez X', min: -0.5, max: 0.5, step: 0.005, def: 0 }, { k: 'my', label: 'Merkez Y', min: -0.5, max: 0.5, step: 0.005, def: 0 }, { k: 'mw', label: 'Genişlik', min: 0, max: 1.5, step: 0.005, def: 0.5 }, { k: 'mh', label: 'Yükseklik', min: 0, max: 1.5, step: 0.005, def: 0.6 }, { k: 'feather', label: 'Yumuşatma', min: 0, max: 200, step: 1, def: 40 }, { k: 'invert', label: 'Ters çevir', min: 0, max: 1, step: 1, def: 0 }] },
  glow: { label: 'Parlama (glow/bloom)', group: 'Stil', params: [{ k: 'amount', label: 'Miktar', min: 0, max: 1.5, step: 0.01, def: 0.6 }, { k: 'radius', label: 'Yarıçap', min: 2, max: 80, step: 1, def: 24 }, { k: 'threshold', label: 'Eşik', min: 0, max: 1, step: 0.01, def: 0.55 }] },
  sharpen: { label: 'Keskinleştir', group: 'Stil', params: [{ k: 'amount', label: 'Miktar', min: 0, max: 2, step: 0.01, def: 0.6 }] },
  pixelate: { label: 'Pikselleştir', group: 'Bozulma', params: [{ k: 'size', label: 'Blok', min: 2, max: 80, step: 1, def: 14 }] },
};

export const TRANSITION_LABELS: Record<TransitionType, string> = {
  none: 'Yok', fade: 'Solma', slideLeft: 'Kaydır ←', slideRight: 'Kaydır →', slideUp: 'Kaydır ↑', slideDown: 'Kaydır ↓',
  zoomIn: 'Zoom içeri', zoomOut: 'Zoom dışarı', blur: 'Bulanık geçiş', wipe: 'Silme (wipe)', spin: 'Döndür', flash: 'Flaş',
};

export const TEXT_ANIM_LABELS: Record<TextAnim, string> = {
  none: 'Yok', typewriter: 'Daktilo', fadeUp: 'Aşağıdan belir', pop: 'Pop', blurIn: 'Bulanıktan netleş', tracking: 'Harf aralığı daralt', wordByWord: 'Kelime kelime', glitchIn: 'Glitch giriş',
};

export const FONTS = ['Inter', 'Bebas Neue', 'Playfair Display', 'JetBrains Mono', 'Georgia', 'Arial Black', 'Impact', 'Courier New'];
