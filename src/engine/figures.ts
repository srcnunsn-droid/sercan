// Parametric stick mannequins: joints in metres, subject at origin facing +z.
import type { V3 } from './shot';

export type PoseId = 'standing' | 'sitting' | 'reaching' | 'hugging' | 'running' | 'recoiling';
export const POSES: { id: PoseId; tr: string }[] = [
  { id: 'standing', tr: 'Ayakta' }, { id: 'sitting', tr: 'Oturan' }, { id: 'reaching', tr: 'El uzatan' },
  { id: 'hugging', tr: 'Sarılan' }, { id: 'running', tr: 'Koşan' }, { id: 'recoiling', tr: 'Geri çekilen' },
];

export interface Figure { pos: V3; yawDeg: number; pose: PoseId; tint: number }
export type Joints = Record<'head' | 'neck' | 'pelvis' | 'lSh' | 'rSh' | 'lEl' | 'rEl' | 'lHa' | 'rHa' | 'lHip' | 'rHip' | 'lKn' | 'rKn' | 'lFt' | 'rFt', V3>;

const POSE_LOCAL: Record<PoseId, Joints> = {
  standing: { head: [0, 1.66, 0], neck: [0, 1.48, 0], pelvis: [0, 0.98, 0], lSh: [-0.2, 1.43, 0], rSh: [0.2, 1.43, 0], lEl: [-0.25, 1.15, 0], rEl: [0.25, 1.15, 0], lHa: [-0.27, 0.9, 0.04], rHa: [0.27, 0.9, 0.04], lHip: [-0.1, 0.95, 0], rHip: [0.1, 0.95, 0], lKn: [-0.11, 0.5, 0.02], rKn: [0.11, 0.5, 0.02], lFt: [-0.12, 0.04, 0.05], rFt: [0.12, 0.04, 0.05] },
  sitting: { head: [0, 1.22, 0], neck: [0, 1.05, 0], pelvis: [0, 0.52, 0], lSh: [-0.2, 1.0, 0], rSh: [0.2, 1.0, 0], lEl: [-0.24, 0.74, 0.08], rEl: [0.24, 0.74, 0.08], lHa: [-0.16, 0.58, 0.32], rHa: [0.16, 0.58, 0.32], lHip: [-0.1, 0.5, 0], rHip: [0.1, 0.5, 0], lKn: [-0.12, 0.52, 0.45], rKn: [0.12, 0.52, 0.45], lFt: [-0.12, 0.04, 0.5], rFt: [0.12, 0.04, 0.5] },
  reaching: { head: [0, 1.65, 0.04], neck: [0, 1.47, 0.02], pelvis: [0, 0.98, 0], lSh: [-0.2, 1.43, 0], rSh: [0.2, 1.43, 0], lEl: [-0.25, 1.15, 0], rEl: [0.24, 1.38, 0.3], lHa: [-0.27, 0.9, 0.04], rHa: [0.22, 1.36, 0.6], lHip: [-0.1, 0.95, 0], rHip: [0.1, 0.95, 0], lKn: [-0.11, 0.5, 0.02], rKn: [0.11, 0.5, 0.08], lFt: [-0.12, 0.04, 0.05], rFt: [0.12, 0.04, 0.2] },
  hugging: { head: [0, 1.64, 0.06], neck: [0, 1.46, 0.04], pelvis: [0, 0.98, 0], lSh: [-0.2, 1.42, 0.02], rSh: [0.2, 1.42, 0.02], lEl: [-0.3, 1.3, 0.25], rEl: [0.3, 1.3, 0.25], lHa: [-0.08, 1.32, 0.42], rHa: [0.08, 1.3, 0.42], lHip: [-0.1, 0.95, 0], rHip: [0.1, 0.95, 0], lKn: [-0.11, 0.5, 0.04], rKn: [0.11, 0.5, 0.04], lFt: [-0.12, 0.04, 0.05], rFt: [0.12, 0.04, 0.05] },
  running: { head: [0, 1.6, 0.18], neck: [0, 1.43, 0.13], pelvis: [0, 0.95, 0], lSh: [-0.2, 1.38, 0.1], rSh: [0.2, 1.38, 0.1], lEl: [-0.24, 1.14, -0.15], rEl: [0.24, 1.2, 0.3], lHa: [-0.24, 1.0, 0.05], rHa: [0.22, 1.34, 0.42], lHip: [-0.1, 0.92, 0], rHip: [0.1, 0.92, 0], lKn: [-0.11, 0.62, 0.38], rKn: [0.11, 0.45, -0.22], lFt: [-0.12, 0.25, 0.2], rFt: [0.12, 0.12, -0.5] },
  recoiling: { head: [0, 1.62, -0.16], neck: [0, 1.45, -0.1], pelvis: [0, 0.98, -0.02], lSh: [-0.2, 1.42, -0.08], rSh: [0.2, 1.42, -0.08], lEl: [-0.3, 1.35, 0.12], rEl: [0.3, 1.35, 0.12], lHa: [-0.22, 1.55, 0.25], rHa: [0.22, 1.55, 0.25], lHip: [-0.1, 0.95, 0], rHip: [0.1, 0.95, 0], lKn: [-0.11, 0.5, 0.02], rKn: [0.11, 0.5, -0.06], lFt: [-0.12, 0.04, 0.05], rFt: [0.12, 0.04, -0.25] },
};

export const BONES: [keyof Joints, keyof Joints][] = [
  ['neck', 'pelvis'], ['lSh', 'rSh'], ['lSh', 'lEl'], ['lEl', 'lHa'], ['rSh', 'rEl'], ['rEl', 'rHa'],
  ['lHip', 'rHip'], ['lHip', 'lKn'], ['lKn', 'lFt'], ['rHip', 'rKn'], ['rKn', 'rFt'],
];

export function worldJoints(f: Figure): Joints {
  const local = POSE_LOCAL[f.pose] ?? POSE_LOCAL.standing;
  const a = (f.yawDeg * Math.PI) / 180; const c = Math.cos(a), s = Math.sin(a);
  const out = {} as Joints;
  for (const k of Object.keys(local) as (keyof Joints)[]) {
    const [x, y, z] = local[k];
    out[k] = [f.pos[0] + x * c + z * s, f.pos[1] + y, f.pos[2] - x * s + z * c];
  }
  return out;
}

/** Lay out 1-3 figures for a framing. Subject A is always at the origin facing camera side (+z). */
export function layoutFigures(opts: { count: number; ots?: boolean; two?: boolean; poses?: PoseId[] }): Figure[] {
  const poses = opts.poses ?? [];
  const n = Math.max(1, opts.count);
  if (opts.ots && n >= 2) return [
    { pos: [0, 0, 0], yawDeg: 0, pose: poses[0] ?? 'standing', tint: 0 },
    { pos: [0.32, 0, 1.05], yawDeg: 180, pose: poses[1] ?? 'standing', tint: 1 },
  ];
  if ((opts.two || n >= 2) && n >= 2) {
    const figs: Figure[] = [
      { pos: [-0.5, 0, 0], yawDeg: 60, pose: poses[0] ?? 'standing', tint: 0 },
      { pos: [0.5, 0, 0], yawDeg: -60, pose: poses[1] ?? 'standing', tint: 1 },
    ];
    if (n >= 3) figs.push({ pos: [0, 0, -0.9], yawDeg: 0, pose: poses[2] ?? 'standing', tint: 2 });
    return figs;
  }
  return [{ pos: [0, 0, 0], yawDeg: 0, pose: poses[0] ?? 'standing', tint: 0 }];
}
