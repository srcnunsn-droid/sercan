// Location sets and props as plain primitives, so the 3D viewport, the 2D preview,
// the .glb export and the Blender script all build the same geometry.
import type { V3 } from './shot';

export type PrimKind = 'box' | 'cyl' | 'cone' | 'plane';
export interface Prim { kind: PrimKind; pos: V3; size: V3; color: string; rotY?: number; emissive?: string; name?: string; placedId?: string }
export interface SetDef { id: string; tr: string; en: string; sky: string; floor: string; prims: Prim[] }
export interface PropDef { id: string; tr: string; en: string; prims: Prim[] }

const box = (name: string, pos: V3, size: V3, color: string, extra: Partial<Prim> = {}): Prim => ({ kind: 'box', pos, size, color, name, ...extra });
const cyl = (name: string, pos: V3, r: number, h: number, color: string): Prim => ({ kind: 'cyl', pos, size: [r, h, r], color, name });
const cone = (name: string, pos: V3, r: number, h: number, color: string): Prim => ({ kind: 'cone', pos, size: [r, h, r], color, name });

function repeat<T>(n: number, f: (i: number) => T): T[] { return Array.from({ length: n }, (_, i) => f(i)); }

export const SETS: SetDef[] = [
  { id: 'empty', tr: 'Boş stüdyo', en: 'empty studio', sky: '#0a0a0d', floor: '#1d1b17', prims: [] },
  {
    id: 'platform', tr: 'Tren peronu', en: 'train platform', sky: '#121418', floor: '#2a2824',
    prims: [
      ...repeat(5, (i) => cyl(`pillar_l${i}`, [-2.6, 1.7, -3 - i * 4], 0.19, 3.4, '#4a4436')),
      ...repeat(5, (i) => cyl(`pillar_r${i}`, [2.6, 1.7, -3 - i * 4], 0.19, 3.4, '#4a4436')),
      box('platform_edge', [-3.4, 0.02, -8], [0.25, 0.04, 40], '#c9a24a'),
      box('track_bed', [-5.2, -0.4, -8], [3.2, 0.2, 40], '#141210'),
      box('train', [-5.2, 1.5, -10], [2.8, 3.2, 22], '#34404a'),
      box('canopy', [0, 3.5, -10], [7, 0.15, 24], '#2c2a26'),
    ],
  },
  {
    id: 'street', tr: 'Sokak', en: 'city street', sky: '#0d1016', floor: '#222326',
    prims: [
      ...repeat(4, (i) => box(`building_l${i}`, [-6, 4 + (i % 2) * 2, -4 - i * 7], [4, 8 + (i % 2) * 4, 6], i % 2 ? '#3a342e' : '#2f3236')),
      ...repeat(4, (i) => box(`building_r${i}`, [6, 5 + (i % 3), -6 - i * 7], [4, 10 + (i % 3) * 2, 6], i % 2 ? '#30343a' : '#3b352d')),
      box('sidewalk_l', [-3.4, 0.08, -10], [1.6, 0.16, 40], '#3a3a3a'),
      box('sidewalk_r', [3.4, 0.08, -10], [1.6, 0.16, 40], '#3a3a3a'),
      ...repeat(3, (i) => cyl(`lamp_post${i}`, [3.9, 2, -2 - i * 9], 0.06, 4, '#222')),
      ...repeat(3, (i) => box(`lamp_head${i}`, [3.6, 4, -2 - i * 9], [0.5, 0.15, 0.25], '#333', { emissive: '#ffb066' })),
    ],
  },
  {
    id: 'room', tr: 'Oda', en: 'small room', sky: '#0b0a09', floor: '#3a2c20',
    prims: [
      box('wall_back', [0, 1.5, -3], [7, 3, 0.1], '#5b5146'),
      box('wall_left', [-3.5, 1.5, 0], [0.1, 3, 6], '#544a40'),
      box('wall_right', [3.5, 1.5, 0], [0.1, 3, 6], '#544a40'),
      box('window', [-3.44, 1.7, -0.5], [0.02, 1.3, 1.1], '#9fb6d6', { emissive: '#9fb6d6' }),
      box('table', [1.4, 0.75, -1.6], [1.2, 0.06, 0.7], '#6b4a2f'),
      box('bed', [-1.8, 0.3, -1.8], [1.6, 0.5, 2.1], '#7b6f62'),
      box('ceiling', [0, 3.02, 0], [7, 0.05, 6], '#3a332c'),
    ],
  },
  {
    id: 'forest', tr: 'Orman', en: 'forest', sky: '#0b120d', floor: '#1f2a1a',
    prims: repeat(28, (i) => {
      const x = ((i * 37) % 22) - 11; const z = -2 - ((i * 53) % 26);
      if (Math.abs(x) < 1.6 && z > -6) return cyl(`trunk${i}`, [x + 3, 2.5, z - 4], 0.22, 5, '#3b2a1c');
      return cyl(`trunk${i}`, [x, 2.5, z], 0.2 + (i % 3) * 0.06, 5, '#3b2a1c');
    }).concat(repeat(28, (i) => {
      const x = ((i * 37) % 22) - 11; const z = -2 - ((i * 53) % 26);
      const sx = Math.abs(x) < 1.6 && z > -6 ? x + 3 : x; const sz = Math.abs(x) < 1.6 && z > -6 ? z - 4 : z;
      return cone(`canopy${i}`, [sx, 6, sz], 1.4, 3.5, '#24391f');
    })),
  },
  {
    id: 'throne', tr: 'Taht salonu', en: 'throne hall', sky: '#0d0a08', floor: '#2b2420',
    prims: [
      ...repeat(5, (i) => cyl(`column_l${i}`, [-3.5, 3.5, -2 - i * 3.5], 0.4, 7, '#6a6058')),
      ...repeat(5, (i) => cyl(`column_r${i}`, [3.5, 3.5, -2 - i * 3.5], 0.4, 7, '#6a6058')),
      box('carpet', [0, 0.01, -9], [1.8, 0.02, 18], '#6d1b1b'),
      box('dais', [0, 0.3, -18], [5, 0.6, 3], '#4a403a'),
      box('throne', [0, 1.6, -18.6], [1.4, 2.4, 0.8], '#8a6d2c'),
      box('back_wall', [0, 4, -20.5], [12, 8, 0.4], '#3a322c'),
    ],
  },
  {
    id: 'bridge', tr: 'Köprü', en: 'stone bridge', sky: '#0f1418', floor: '#0f2230',
    prims: [
      box('deck', [0, 0.0, -8], [3.4, 0.3, 30], '#5a554c'),
      box('rail_l', [-1.6, 0.6, -8], [0.2, 1, 30], '#6a645a'),
      box('rail_r', [1.6, 0.6, -8], [0.2, 1, 30], '#6a645a'),
      ...repeat(4, (i) => cyl(`lamp${i}`, [1.6, 1.8, -2 - i * 7], 0.05, 2.4, '#222')),
      box('water', [0, -2.5, -8], [60, 0.05, 60], '#0d2433'),
    ],
  },
  {
    id: 'cave', tr: 'Mağara', en: 'cave', sky: '#050505', floor: '#1b1814',
    prims: [
      ...repeat(10, (i) => box(`rock_l${i}`, [-3 - (i % 3) * 0.6, 1.5 + (i % 2), -1 - i * 2], [1.6, 3 + (i % 3), 2.2], '#2a2622', { rotY: i * 0.4 })),
      ...repeat(10, (i) => box(`rock_r${i}`, [3 + (i % 2) * 0.7, 1.5 + (i % 3) * 0.5, -1.5 - i * 2], [1.6, 3 + (i % 2) * 2, 2.2], '#2d2925', { rotY: -i * 0.3 })),
      box('ceiling_rock', [0, 4.5, -10], [9, 1.2, 22], '#201d1a'),
    ],
  },
];
export const SET_BY_ID: Record<string, SetDef> = Object.fromEntries(SETS.map((s) => [s.id, s]));

export const PROPS: PropDef[] = [
  { id: 'bench', tr: 'Bank', en: 'bench', prims: [box('seat', [0, 0.45, 0], [1.6, 0.08, 0.45], '#6b4a2f'), box('back', [0, 0.8, -0.2], [1.6, 0.5, 0.06], '#6b4a2f'), box('leg_l', [-0.7, 0.22, 0], [0.08, 0.45, 0.4], '#222'), box('leg_r', [0.7, 0.22, 0], [0.08, 0.45, 0.4], '#222')] },
  { id: 'train', tr: 'Tren vagonu', en: 'train carriage', prims: [box('body', [0, 1.6, 0], [2.8, 3.2, 12], '#34404a'), box('door', [1.41, 1.2, 0], [0.02, 2, 1.2], '#9fb6d6', { emissive: '#384a5a' })] },
  { id: 'door', tr: 'Kapı', en: 'door', prims: [box('frame', [0, 1.05, 0], [1.1, 2.1, 0.12], '#4a3b2c'), box('panel', [0, 1.0, 0.02], [0.9, 1.95, 0.05], '#6b5238')] },
  { id: 'table', tr: 'Masa', en: 'table', prims: [box('top', [0, 0.75, 0], [1.2, 0.05, 0.7], '#6b4a2f'), ...[-0.55, 0.55].flatMap((x) => [-0.3, 0.3].map((z) => box('leg', [x, 0.37, z], [0.05, 0.74, 0.05], '#4a3220')))] },
  { id: 'lamp', tr: 'Lamba', en: 'standing lamp', prims: [cyl('pole', [0, 0.8, 0], 0.03, 1.6, '#222'), cone('shade', [0, 1.65, 0], 0.25, 0.3, '#d8c08a')] },
  { id: 'luggage', tr: 'Bagaj arabası', en: 'luggage cart', prims: [box('base', [0, 0.25, 0], [0.7, 0.06, 1.1], '#555'), box('suitcase', [0, 0.55, 0.1], [0.5, 0.55, 0.3], '#7a3b2a'), box('suitcase2', [0, 0.45, -0.3], [0.45, 0.35, 0.35], '#2f4a5a'), box('handle', [0, 0.7, -0.55], [0.6, 0.9, 0.04], '#444')] },
];
export const PROP_BY_ID: Record<string, PropDef> = Object.fromEntries(PROPS.map((p) => [p.id, p]));

export interface PlacedProp { id: string; propId: string; pos: [number, number]; rotY: number }

/** All primitives in world space for a set + placed props. */
export function worldPrims(setId: string | undefined, props: PlacedProp[] = []): Prim[] {
  const set = SET_BY_ID[setId ?? 'platform'] ?? SET_BY_ID.platform;
  const out = [...set.prims];
  for (const pp of props) {
    const def = PROP_BY_ID[pp.propId]; if (!def) continue;
    const c = Math.cos(pp.rotY), s = Math.sin(pp.rotY);
    for (const p of def.prims) {
      const [x, y, z] = p.pos;
      out.push({ ...p, name: `${pp.propId}_${p.name ?? ''}`, placedId: pp.id, pos: [pp.pos[0] + x * c + z * s, y, pp.pos[1] - x * s + z * c], rotY: (p.rotY ?? 0) + pp.rotY });
    }
  }
  return out;
}
