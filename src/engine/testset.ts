// Mini test set: 3 standard scenes compiled for any model card. The user runs them and ticks
// which rules the model honoured; results accumulate per card in prefs.testRuns.
import { emptyProject } from '../model/factory';
import type { Project } from '../model/types';
import { compilePart } from './compiler';

export const TEST_CHECKS = [
  { id: 'identity', tr: 'Kimlik korundu (aynı yüz)' },
  { id: 'single-move', tr: 'Tek kamera hareketi uygulandı' },
  { id: 'light', tr: 'Işık yönü ve rengi doğru' },
  { id: 'dialogue', tr: 'Replik ve zamanlama doğru' },
  { id: 'texture', tr: 'Doku doğal, yapay değil' },
] as const;
export type TestCheck = (typeof TEST_CHECKS)[number]['id'];
export interface TestRun { at: number; results: Record<string, Partial<Record<TestCheck, boolean>>> }

function scene(id: string, title: string, mut: (p: Project) => void): { id: string; titleTr: string; project: Project } {
  const p = emptyProject(title); p.id = 'test-' + id; mut(p); return { id, titleTr: title, project: p };
}

export const STANDARD_SCENES = [
  scene('portrait', 'Tek portre: pencere ışığı, yavaş yaklaşma', (p) => {
    p.characters = [{ id: 't1', name: 'Ada', descriptionTr: '35 yaşında kadın, kısa siyah saç', descriptionEn: '35-year-old woman, short black bob haircut, small scar on the chin', wardrobe: 'grey wool turtleneck' }];
    p.locations = [{ id: 'tl1', name: 'Oda', descriptionEn: 'small apartment room with a wooden table', timeOfDay: 'day', weather: 'overcast', setId: 'room' }]; p.locationId = 'tl1';
    const a = p.parts[0];
    a.sceneEn = 'She looks up from a letter at the table.';
    a.camera = { angle: 'angle.eye-level', framing: 'size.mcu', lensMm: 85, fStop: 1.8, motion: 'move.push-in' };
    a.light = { source: 'window', kelvin: 5600, hardness: 'yumusak', direction: 'left', secondary: null, atmosphere: 'none' };
    a.characters = [{ characterId: 't1', pose: 'sitting', action: 'lifts her eyes from the letter' }];
  }),
  scene('dialogue', 'İki kişilik diyalog: omuz üstü, replik', (p) => {
    p.characters = [
      { id: 't1', name: 'Can', descriptionTr: '', descriptionEn: '40-year-old man, shaved head, thick black eyebrows', wardrobe: 'brown leather jacket' },
      { id: 't2', name: 'Selin', descriptionTr: '', descriptionEn: '30-year-old woman, long red hair in a braid', wardrobe: 'white shirt' },
    ];
    p.locations = [{ id: 'tl1', name: 'Kafe', descriptionEn: 'quiet corner café with warm lamps', timeOfDay: 'night', weather: 'clear', setId: 'room' }]; p.locationId = 'tl1';
    const a = p.parts[0];
    a.sceneEn = 'Can leans forward across the table.';
    a.camera = { angle: 'angle.eye-level', framing: 'size.mcu', perspective: 'persp.ots', lensMm: 50, fStop: 2.8, motion: 'move.static' };
    a.light = { source: 'ceiling-lamp', kelvin: 3200, hardness: 'yumusak', direction: 'top', secondary: null, atmosphere: 'none' };
    a.characters = [{ characterId: 't1', pose: 'sitting', action: 'leans forward' }, { characterId: 't2', pose: 'sitting', action: 'holds a coffee cup' }];
    a.dialogue = [{ speaker: 'Can', textTr: 'Bunu bana neden şimdi söylüyorsun?', textEn: 'Why are you telling me this now?', atSec: 2 }];
  }),
  scene('action', 'Geniş aksiyon: koşu, el kamerası, yağmur', (p) => {
    p.characters = [{ id: 't1', name: 'Deniz', descriptionTr: '', descriptionEn: '25-year-old man, curly brown hair, athletic build', wardrobe: 'dark green rain jacket, black jeans' }];
    p.locations = [{ id: 'tl1', name: 'Sokak', descriptionEn: 'narrow city street with wet cobblestones', timeOfDay: 'night', weather: 'rain', setId: 'street' }]; p.locationId = 'tl1';
    const a = p.parts[0];
    a.sceneEn = 'Deniz runs toward the camera, splashing through puddles.';
    a.camera = { angle: 'angle.eye-level', framing: 'size.full', lensMm: 28, fStop: 4, motion: 'move.handheld' };
    a.light = { source: 'street-lamp', kelvin: 2200, hardness: 'sert', direction: 'back-right', secondary: null, atmosphere: 'haze' };
    a.characters = [{ characterId: 't1', pose: 'running', action: 'runs, jacket flapping' }];
  }),
];

export function compileTestSet(cardId: string) {
  return STANDARD_SCENES.map((s) => ({ ...s, compiled: compilePart(s.project, s.project.parts[0], cardId) }));
}

/** Pass rate per check across all recorded runs for a card (null = never tested). */
export function passRates(runs: TestRun[]): Record<TestCheck, number | null> {
  const out = {} as Record<TestCheck, number | null>;
  for (const c of TEST_CHECKS) {
    const vals = runs.flatMap((r) => Object.values(r.results).map((x) => x[c.id])).filter((v): v is boolean => typeof v === 'boolean');
    out[c.id] = vals.length ? vals.filter(Boolean).length / vals.length : null;
  }
  return out;
}
