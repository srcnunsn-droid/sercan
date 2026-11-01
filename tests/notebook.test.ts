import { describe, expect, it } from 'vitest';
import { fragments, learnPatterns } from '../src/engine/notebook';
import { compileTestSet, passRates, STANDARD_SCENES } from '../src/engine/testset';
import { runRules } from '../src/engine/rules';
import { MODEL_CARDS, TEXTURE_LINE } from '../src/content';
import type { PromptBundle } from '../src/model/types';

const pb = (en: string, rating: 1 | 2 | 3, target = 'seedance-2'): PromptBundle => ({ id: Math.random().toString(), target, en, tr: '', createdAt: 0, rating });

describe('experience notebook', () => {
  it('splits prompts into phrase fragments and drops boilerplate', () => {
    const f = fragments(`Scene: 10-second shot. She runs.\nCamera: low angle, slow push-in toward the subject\n${TEXTURE_LINE}`);
    expect(f).toContain('low angle'); expect(f).toContain('slow push-in toward the subject');
    expect(f.some((x) => x.includes('no sharpen'))).toBe(false);
    expect(f.some((x) => x.includes('second shot'))).toBe(false);
  });
  it('keeps phrases that appear in 2+ good prompts and never in bad ones', () => {
    const p = learnPatterns([
      pb('Camera: low angle, slow push-in', 3), pb('Camera: low angle, static', 3),
      pb('Camera: crash zoom, low angle', 1), pb('Camera: crash zoom, dutch angle', 1),
      pb('Camera: low angle', 3, 'midjourney'),
    ], 'seedance-2');
    expect(p.rated).toBe(4); expect(p.good).toBe(2);
    expect(p.keep).toEqual([]); // 'low angle' also appeared in a bad prompt
    expect(p.avoid.map((x) => x.text)).toEqual(['crash zoom']);
  });
});

describe('mini test set', () => {
  it('compiles 3 standard scenes for every card, each clean of rule errors', () => {
    for (const c of MODEL_CARDS) {
      const set = compileTestSet(c.id);
      expect(set.length).toBe(3);
      for (const s of set) {
        expect(s.compiled.en.length).toBeGreaterThan(80);
        const errs = runRules({ project: s.project, cardId: c.id }).filter((r) => r.severity === 'error');
        expect(errs, `${c.id}/${s.id}`).toEqual([]);
      }
    }
  });
  it('dialogue scene uses over-the-shoulder with two characters, action scene has rain', () => {
    expect(STANDARD_SCENES[1].project.parts[0].characters.length).toBe(2);
    expect(STANDARD_SCENES[2].project.locations[0].weather).toBe('rain');
  });
  it('computes pass rates per check', () => {
    const r = passRates([{ at: 0, results: { portrait: { identity: true, light: false }, action: { identity: false } } }]);
    expect(r.identity).toBe(0.5); expect(r.light).toBe(0); expect(r.texture).toBeNull();
  });
});
