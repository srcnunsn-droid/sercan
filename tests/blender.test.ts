import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { generateBpy } from '../src/engine/blender';
import { SETS, PROPS, worldPrims } from '../src/engine/sets';
import { rigParams } from '../src/engine/shot';
import { sampleProject } from '../src/model/factory';

describe('Blender bridge', () => {
  const p = sampleProject();
  const part = p.parts[2];
  const params = rigParams(part.camera, 9 / 16);
  const py = generateBpy({ title: p.title, params, light: part.light, aspect: 9 / 16, figures: 1, poses: ['standing'], prims: worldPrims('platform', p.locations[0].props), seconds: 10 });

  it('sets resolution, fps and the 10 s frame range', () => {
    expect(py).toContain('scene.render.resolution_x = 1080');
    expect(py).toContain('scene.render.resolution_y = 1920');
    expect(py).toContain('scene.frame_end = 240');
  });
  it('keyframes the camera move (crane rises) with the vertical 24 mm sensor', () => {
    const keys = [...py.matchAll(/^    \((\d+), \(([-\d.]+), ([-\d.]+), ([-\d.]+)\)/gm)].map((m) => ({ frame: +m[1], z: +m[4] }));
    expect(keys.length).toBe(9);
    expect(keys[0].frame).toBe(1); expect(keys.at(-1)!.frame).toBe(240);
    expect(keys.at(-1)!.z).toBeGreaterThan(keys[0].z + 2);
    expect(py).toContain('cam.data.sensor_height = 24');
  });
  it('builds set, props and mannequins', () => {
    expect(py).toContain('"train"');
    expect(py).toContain('bench_seat');
    expect(py).toContain('Mannequin_1');
  });
  it('is valid Python syntax (checked by the CI python if available)', () => {
    mkdirSync('node_modules/.cache', { recursive: true });
    writeFileSync('node_modules/.cache/seco-test.py', py);
    expect(py.split('\n').every((l) => !l.includes('undefined') && !l.includes('NaN'))).toBe(true);
  });
});

describe('sets and props', () => {
  it('has the seven location sets from the brief plus an empty studio', () => {
    expect(SETS.map((s) => s.id)).toEqual(expect.arrayContaining(['platform', 'street', 'room', 'forest', 'throne', 'bridge', 'cave']));
  });
  it('has the props from the brief', () => {
    expect(PROPS.map((s) => s.id)).toEqual(expect.arrayContaining(['bench', 'train', 'door', 'table', 'lamp', 'luggage']));
  });
  it('places props in world space with rotation', () => {
    const prims = worldPrims('empty', [{ id: 'x', propId: 'door', pos: [2, -3], rotY: Math.PI / 2 }]);
    expect(prims.length).toBe(2);
    expect(prims[0].pos[0]).toBeCloseTo(2); expect(prims[0].pos[2]).toBeCloseTo(-3);
  });
  it('keeps the subject area (around the origin) clear in every set', () => {
    for (const s of SETS) for (const q of s.prims) {
      const near = Math.abs(q.pos[0]) < 0.9 && q.pos[2] > -1.2 && q.pos[2] < 1.2 && q.pos[1] - q.size[1] / 2 < 1.8 && q.pos[1] + q.size[1] / 2 > 0.1;
      expect(near, `${s.id}/${q.name}`).toBe(false);
    }
  });
});
