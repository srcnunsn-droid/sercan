import { SCHEMA_VERSION, type Part, type Project, type Beat, type Progress } from './types';
import { uid } from '../lib/text';

const BEATS: Beat[] = ['durum', 'catisma', 'zirve'];

export function defaultPart(index: 0 | 1 | 2): Part {
  return {
    id: uid('p_'),
    index,
    beat: BEATS[index],
    scene: '',
    camera: { angle: 'angle.eye-level', framing: 'size.mcu', lensMm: 50, fStop: 2.8, motion: 'move.static' },
    light: { source: 'window', kelvin: 5600, hardness: 'yumusak', direction: 'front-left', secondary: null, atmosphere: 'none' },
    characters: [],
    dialogue: [],
  };
}

export function emptyProject(title = 'Yeni proje', template = 'emotional-dialogue'): Project {
  const now = Date.now();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uid('prj_'),
    title,
    template,
    aspect: '9:16',
    createdAt: now,
    updatedAt: now,
    characters: [],
    locations: [],
    parts: [defaultPart(0), defaultPart(1), defaultPart(2)],
    assets: [],
    prompts: [],
    factory: { step: 1, visualsApproved: false },
    credits: { attempts: 0, spent: 0 },
  };
}

/** The acceptance scene from the brief: "İstasyonda veda". Marked as an example. */
export function sampleProject(): Project {
  const p = emptyProject('İstasyonda veda (örnek)', 'emotional-dialogue');
  p.characters = [
    { id: 'c_elif', name: 'Elif', descriptionTr: '28 yaşında kadın, omuz hizasında koyu kahve dalgalı saç, ince yüz', descriptionEn: '28-year-old woman, shoulder-length dark brown wavy hair, narrow face, light freckles', wardrobe: 'camel wool coat, cream knit scarf' },
    { id: 'c_kerem', name: 'Kerem', descriptionTr: '30 yaşında erkek, kısa siyah saç, üç günlük sakal', descriptionEn: '30-year-old man, short black hair, three-day stubble, tired eyes', wardrobe: 'dark navy peacoat, grey wool sweater' },
  ];
  p.locations = [
    { id: 'l_peron', name: 'Eski tren peronu', descriptionEn: 'old stone train platform with cast-iron pillars, wet tiles, a waiting steam-free regional train', timeOfDay: 'dusk', weather: 'overcast', setId: 'platform', props: [{ id: 'pr1', propId: 'bench', pos: [1.8, -2.5], rotY: 0 }, { id: 'pr2', propId: 'luggage', pos: [-1.2, 0.6], rotY: 0.4 }] },
  ];
  p.locationId = 'l_peron';
  const [a, b, c] = p.parts;
  a.scene = 'Elif ve Kerem peronda karşı karşıya duruyor, tren kapısı açık.';
  a.sceneEn = 'Elif and Kerem stand facing each other on the platform, the train door is open behind her.';
  a.camera = { angle: 'angle.eye-level', framing: 'size.ms', perspective: 'persp.two-shot', lensMm: 40, fStop: 2.8, motion: 'move.static' };
  a.light = { source: 'overcast', kelvin: 6500, hardness: 'yumusak', direction: 'front-left', secondary: { source: 'street-lamp', kelvin: 2200, direction: 'back-right' }, atmosphere: 'haze' };
  a.characters = [{ characterId: 'c_elif', pose: 'standing', action: 'holds the strap of her bag with both hands' }, { characterId: 'c_kerem', pose: 'standing', action: 'hands in his coat pockets' }];
  a.dialogue = [{ speaker: 'Kerem', textTr: 'Gitmek zorunda mısın?', textEn: 'Do you really have to go?', atSec: 3 }];
  b.scene = 'Kerem bir adım yaklaşıyor, Elif gözlerini kaçırıyor.';
  b.sceneEn = 'Kerem steps closer, Elif looks down and away.';
  b.camera = { angle: 'angle.eye-level', framing: 'size.mcu', perspective: 'persp.ots', lensMm: 85, fStop: 1.8, motion: 'move.push-in' };
  b.light = { ...a.light };
  b.characters = [{ characterId: 'c_kerem', pose: 'standing', action: 'steps closer' }, { characterId: 'c_elif', pose: 'standing', action: 'lower lip trembling, eyes looking down' }];
  b.dialogue = [{ speaker: 'Elif', textTr: 'Kalırsam ikimiz de kayboluruz.', textEn: 'If I stay, we both get lost.', atSec: 4 }];
  c.scene = 'Elif trene biniyor, kapı kapanıyor, Kerem peronda yalnız kalıyor.';
  c.sceneEn = 'Elif boards the train, the door closes, Kerem stays alone on the platform.';
  c.camera = { angle: 'angle.high', framing: 'size.ws', lensMm: 28, fStop: 4, motion: 'move.crane' };
  c.light = { ...a.light };
  c.characters = [{ characterId: 'c_kerem', pose: 'standing', action: 'watches the train leave' }];
  c.dialogue = [];
  c.sound = 'train doors hiss, distant station announcement, wind';
  p.assets = [
    { id: 'a1', kind: 'character-sheet', label: 'Elif sheet', ref: '@image-1', createdAt: Date.now() },
    { id: 'a2', kind: 'character-sheet', label: 'Kerem sheet', ref: '@image-2', createdAt: Date.now() },
    { id: 'a3', kind: 'location', label: 'Peron', ref: '@image-3', createdAt: Date.now() },
  ];
  return p;
}

export function defaultProgress(): Progress {
  return {
    xp: 0, streak: 0, lastDay: '', completedLessons: [], unlockedLessons: ['m1.l1'],
    badges: [], ruleHits: {}, favorites: [],
  };
}
