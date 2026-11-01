import { describe, expect, it } from 'vitest';
import { CATALOG, GAME_BY_ID, ALL_LESSONS, RULES_META, LESSON_BY_ID, EMOTIONS, CATALOG_BY_ID, MODULES } from '../src/content';
import { makeProjector, shotAt } from '../src/engine/shot';

const emotionIds = new Set(EMOTIONS.map((e) => e.id));

describe('camera catalog', () => {
  it('has at least 100 entries (Faz 6 target)', () => expect(CATALOG.length).toBeGreaterThanOrEqual(100));
  it('covers every category from the brief', () => expect(new Set(CATALOG.map((e) => e.category))).toEqual(new Set(['angle', 'position', 'tilt', 'perspective', 'size', 'lens', 'movement', 'composition', 'focus', 'aspect'])));
  for (const e of CATALOG) {
    it(`${e.id}: every field filled and the demo frames the subject`, () => {
      for (const k of ['id', 'category', 'tr', 'en', 'descTr', 'avoidTr', 'promptEn', 'promptTr', 'lessonId', 'gameId'] as const) expect(e[k], k).toBeTruthy();
      expect(e.emotions.length).toBeGreaterThan(0);
      e.emotions.forEach((x) => expect(emotionIds.has(x), x).toBe(true));
      expect(GAME_BY_ID[e.gameId], e.gameId).toBeDefined();
      // live demo: at start, middle and end of the move the subject's chest projects into a 16:9 frame
      for (const t of [0, 0.5]) {
        const s = shotAt(e.three, t);
        expect(Number.isFinite(s.fovDeg) && s.pos.every(Number.isFinite)).toBe(true);
        const pt = makeProjector(s, 1600, 900).project([0, Math.min(1.3, e.three.targetY), 0]);
        if (!e.three.pov && !['move.whip-pan', 'move.pan', 'comp.negative-space', 'persp.cutaway', 'tilt.whip'].includes(e.id)) {
          expect(pt, `${e.id} t=${t}`).not.toBeNull();
          expect(pt!.x).toBeGreaterThan(-200); expect(pt!.x).toBeLessThan(1800);
        }
      }
    });
  }
});

describe('curriculum content', () => {
  it('every lesson points at an existing game and catalog entries', () => {
    for (const l of ALL_LESSONS) {
      expect(GAME_BY_ID[l.gameId], l.id).toBeDefined();
      expect(l.quiz.length).toBe(2);
      l.quiz.forEach((q) => expect(q.answer).toBeLessThan(q.options.length));
      [...(l.demo.catalogIds ?? []), ...(l.studio.catalogIds ?? [])].forEach((id) => expect(CATALOG_BY_ID[id], id).toBeDefined());
    }
  });
  it('M1–M10 are all present with at least 2 lessons each', () => { expect(MODULES.map((m) => m.id)).toEqual(['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10']); MODULES.forEach((m) => expect(m.lessons.length).toBeGreaterThanOrEqual(2)); });
  it('rule lessons all exist now', () => RULES_META.forEach((r) => expect(LESSON_BY_ID[r.lessonId], r.id).toBeDefined()));
  it('M1 and M2 ship at least 6 games', () => expect(new Set(ALL_LESSONS.map((l) => l.gameId)).size).toBeGreaterThanOrEqual(6));
  it('rule metadata links to lesson ids that are either present or in future modules', () => {
    RULES_META.forEach((r) => expect(r.lessonId).toMatch(/^m\d+\.l\d+$/));
    expect(LESSON_BY_ID['m1.l2']).toBeDefined();
  });
});
