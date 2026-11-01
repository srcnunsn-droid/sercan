import { describe, expect, it } from 'vitest';
import { compilePart, compileCharacterSheet, referenceMap } from '../src/engine/compiler';
import { sampleProject } from '../src/model/factory';
import { TEXTURE_LINE, MODEL_CARDS } from '../src/content';
import { runRules } from '../src/engine/rules';

describe('prompt compiler', () => {
  const p = sampleProject();
  it('is deterministic', () => {
    expect(compilePart(p, p.parts[1], 'seedance-2')).toEqual(compilePart(p, p.parts[1], 'seedance-2'));
  });
  it('fills all 5 boxes and ends with the texture line', () => {
    const c = compilePart(p, p.parts[0], 'universal');
    for (const k of ['scene', 'camera', 'characters', 'light', 'environment'] as const) expect(c.boxesEn[k].length).toBeGreaterThan(5);
    expect(c.en.trim().endsWith(TEXTURE_LINE)).toBe(true);
  });
  it('orders references: character sheets first, then the location', () => {
    const r = referenceMap(p);
    expect(r.characters).toEqual({ c_elif: '@image-1', c_kerem: '@image-2' });
    expect(r.location).toBe('@image-3');
  });
  it('numbers references per part: only the images that part uploads, from @image-1', () => {
    const r = referenceMap(p, p.parts[2]); // only Kerem appears in part 3
    expect(r.characters).toEqual({ c_kerem: '@image-1' });
    expect(r.location).toBe('@image-2');
    expect(r.legendTr[0]).toContain('Kerem');
  });
  it('passes its own texture, reference and invisible-word rules for every model card', () => {
    for (const card of MODEL_CARDS) for (const part of p.parts) {
      const c = compilePart(p, part, card.id);
      const bad = runRules({ text: c.en, cardId: card.id }, ['text.texture-line', 'ref.order', 'char.invisible-word']);
      if (c.refs.length > card.maxRefs) {
        // more images than the model accepts: the guard must say so, and only that
        expect(bad.map((b) => b.messageTr).join(' '), card.id).toContain(`en fazla ${card.maxRefs}`);
      } else expect(bad, `${card.id} part ${part.index}`).toEqual([]);
    }
  });
  it('video cards get timestamped dialogue, image cards do not', () => {
    expect(compilePart(p, p.parts[0], 'seedance-2').en).toContain('at 0:03 Kerem says');
    expect(compilePart(p, p.parts[0], 'nano-banana-2').en).not.toContain('says');
  });
  it('midjourney gets --ar and --style raw', () => {
    expect(compilePart(p, p.parts[0], 'midjourney').en).toMatch(/--ar 9:16 --style raw$/);
  });
  it('character sheet is a single prompt on neutral grey with three panels', () => {
    const s = compileCharacterSheet(p.characters[0]);
    expect(s.en).toContain('Three panels');
    expect(s.en).toContain('mid-grey');
    expect(s.en.trim().endsWith(TEXTURE_LINE)).toBe(true);
  });
});
