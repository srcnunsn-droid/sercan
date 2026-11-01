import { describe, expect, it } from 'vitest';
import { pathAt, rigParams, rigStateAt, shotAt, describePath } from '../src/engine/shot';
import { compilePart } from '../src/engine/compiler';
import { runRules } from '../src/engine/rules';
import { generateBpy } from '../src/engine/blender';
import { sampleProject } from '../src/model/factory';
import type { CamKey } from '../src/model/types';

const K = (t: number, o: Partial<CamKey> = {}): CamKey => ({ t, yawDeg: 0, height: 1.6, distance: 3, lensMm: 50, targetY: 1.55, ...o });

describe('hand-drawn camera path', () => {
  it('interpolates between keys and holds outside them', () => {
    const keys = [K(0.2, { distance: 4 }), K(0.8, { distance: 2, ease: 'linear' })];
    expect(pathAt(keys, 0).distance).toBe(4);
    expect(pathAt(keys, 0.5).distance).toBeCloseTo(3);
    expect(pathAt(keys, 1).distance).toBe(2);
  });
  it('overrides the catalog move in rigParams and shotAt', () => {
    const p = sampleProject();
    const rig = { ...p.parts[0].camera, motion: 'move.orbit', path: [K(0, { yawDeg: 0 }), K(1, { yawDeg: 90, ease: 'linear' as const })] };
    const params = rigParams(rig);
    expect(params.move).toBe('path');
    const s = shotAt(params, 1);
    expect(s.pos[0]).toBeCloseTo(3); expect(s.pos[2]).toBeCloseTo(0);
    expect(rigStateAt(params, 0.5).yawDeg).toBeCloseTo(45);
  });
  it('describes the path in words for the prompt', () => {
    expect(describePath([K(0), K(1, { distance: 1.5 })]).en).toEqual(['the camera pushes in toward the subject']);
    expect(describePath([K(0), K(1, { yawDeg: -40 })]).tr[0]).toContain('sola 40 derece');
    expect(describePath([K(0), K(1)]).en[0]).toContain('holds');
  });
  it('compiles into the camera box instead of the catalog move', () => {
    const p = sampleProject();
    p.parts[0].camera.path = [K(0), K(1, { distance: 1.5 })];
    const c = compilePart(p, p.parts[0], 'seedance-2');
    expect(c.boxesEn.camera).toContain('pushes in'); expect(c.boxesEn.camera).not.toContain('locked-off');
  });
  it('flags a path that combines two moves (one move per part)', () => {
    const p = sampleProject();
    p.parts[0].camera.path = [K(0), K(1, { distance: 1.5, height: 4 })];
    const r = runRules({ project: p }, ['camera.single-move']);
    expect(r.length).toBe(1); expect(r[0].messageTr).toContain('2 hareket');
    p.parts[0].camera.path = [K(0), K(1, { distance: 1.5 })];
    expect(runRules({ project: p }, ['camera.single-move'])).toEqual([]);
  });
  it('the Blender export follows the path', () => {
    const p = sampleProject();
    const params = rigParams({ ...p.parts[0].camera, path: [K(0, { height: 1 }), K(1, { height: 5 })] });
    const py = generateBpy({ title: 't', params, light: p.parts[0].light, aspect: 1, figures: 1, poses: ['standing'], prims: [] });
    const zs = [...py.matchAll(/^    \(\d+, \(([-\d.]+), ([-\d.]+), ([-\d.]+)\)/gm)].map((m) => +m[3]);
    expect(zs[0]).toBeCloseTo(1); expect(zs.at(-1)).toBeCloseTo(5);
  });
});
