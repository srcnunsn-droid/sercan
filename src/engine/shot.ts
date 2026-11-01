// Shot math shared by the 2D frame preview, catalog demos and the 3D viewport.
import { CATALOG_BY_ID, type ThreeParams } from '../content';
import type { CameraRig, Dir } from '../model/types';

export type V3 = [number, number, number];
export interface Shot { pos: V3; target: V3; fovDeg: number; rollDeg: number; lensMm: number }

export const SENSOR_H = 24; // full-frame 36x24, vertical
export const lensToVFov = (mm: number) => (2 * Math.atan(SENSOR_H / 2 / mm) * 180) / Math.PI;

const rad = (d: number) => (d * Math.PI) / 180;

/** Base params for a rig: framing gives distance/targetY, angle gives elevation, perspective/position give yaw. */
export function rigParams(rig: CameraRig, aspect = 16 / 9): ThreeParams {
  const framing = CATALOG_BY_ID[rig.framing]?.three;
  const angle = CATALOG_BY_ID[rig.angle]?.three;
  const persp = rig.perspective ? CATALOG_BY_ID[rig.perspective]?.three : undefined;
  const base: ThreeParams = framing ? { ...framing } : { height: 1.6, distance: 2.4, targetY: 1.55, lensMm: 50 };
  // keep subject size constant when the lens changes: distance scales with focal length
  let distance = base.distance * (rig.lensMm / (framing?.lensMm ?? 50));
  // a two-shot must fit both people horizontally (about 1.7 m wide), which matters in vertical 9:16
  if (persp?.two) {
    const hHalf = Math.atan(Math.tan((lensToVFov(rig.lensMm) * Math.PI) / 360) * aspect);
    distance = Math.max(distance, 0.85 / Math.tan(hHalf));
  }
  let height = base.targetY;
  if (angle) {
    if (rig.angle === 'angle.top-down') height = base.targetY + distance;
    else {
      const elev = Math.atan2(angle.height - angle.targetY, Math.max(0.2, angle.distance));
      height = base.targetY + Math.tan(elev) * distance;
    }
  }
  return {
    ...base,
    distance,
    height,
    lensMm: rig.lensMm,
    yawDeg: persp?.yawDeg ?? 0,
    rollDeg: rig.dutch ? 20 : 0,
    move: CATALOG_BY_ID[rig.motion]?.three.move ?? 'static',
    ots: persp?.ots, pov: persp?.pov, two: persp?.two,
  };
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Camera at normalized time t (0..1) for the given params. Deterministic (handheld uses seeded noise). */
export function shotAt(p: ThreeParams, t = 0): Shot {
  let { distance, height, targetY, lensMm } = p;
  let yaw = p.yawDeg ?? 0;
  let roll = p.rollDeg ?? 0;
  let tx = p.offsetX ?? 0;
  let ty = targetY;
  const e = ease(Math.min(1, Math.max(0, t)));
  switch (p.move) {
    case 'push': distance *= 1 - 0.45 * e; break;
    case 'pull': distance *= 1 + 1.4 * e; break;
    case 'pan': tx += -1.2 + 2.4 * e; break;
    case 'tilt': ty = targetY - 0.9 + 0.9 * e; break;
    case 'truck': yaw += -25 + 50 * e; break;
    case 'truck-forward': distance *= 1 - 0.1 * Math.sin(e * Math.PI); break;
    case 'pedestal': height += 1.2 * e; ty += 0.3 * e; break;
    case 'crane': height += 4.5 * e; distance *= 1 + 0.8 * e; break;
    case 'orbit': yaw += 120 * e; break;
    case 'roll': roll += 360 * e; break;
    case 'handheld': { const n = Math.sin(t * 37) * 0.02 + Math.sin(t * 91) * 0.012; tx += n; height += Math.cos(t * 53) * 0.015; roll += Math.sin(t * 29) * 1.2; break; }
    case 'dollyzoom': { const k = 1 + 2.2 * e; distance *= k; lensMm *= k; break; }
    case 'whip': tx += e < 0.5 ? 0 : 6; break;
    case 'crashzoom': lensMm *= e > 0.55 ? 3.5 : 1; break;
    case 'drone': height += 8 * e; distance *= 1 + 1.5 * e; ty += 0.2 * e; break;
    case 'whiptilt': ty = e < 0.5 ? targetY : targetY + 3; break;
    case 'slowzoom': lensMm *= 1 + 0.8 * e; break;
    case 'fpv': height = Math.max(0.6, height - (height - 0.8) * e); distance *= 1 - 0.65 * e; yaw += 40 * e; break;
    case 'spin360': yaw += 360 * e; break;
  }
  const pos: V3 = [tx + Math.sin(rad(yaw)) * distance, height, Math.cos(rad(yaw)) * distance];
  if (p.distance < 0.05) { pos[0] = tx; pos[2] = 0.001; }
  return { pos, target: [tx, ty, 0], fovDeg: lensToVFov(lensMm), rollDeg: roll, lensMm };
}

/** Unit vector pointing FROM the subject TOWARD the light, for a named direction (subject faces +z). */
export function dirVector(d: Dir): V3 {
  const m: Record<Dir, V3> = {
    front: [0, 0.35, 1], back: [0, 0.4, -1], left: [-1, 0.3, 0.1], right: [1, 0.3, 0.1], top: [0, 1, 0.05], bottom: [0, -0.8, 0.6],
    'front-left': [-0.75, 0.45, 0.75], 'front-right': [0.75, 0.45, 0.75], 'back-left': [-0.7, 0.45, -0.7], 'back-right': [0.7, 0.45, -0.7],
  };
  const v = m[d]; const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
}

// ---- tiny projection for 2D previews ----
export interface Projector { project(p: V3): { x: number; y: number; z: number } | null }

export function makeProjector(s: Shot, w: number, h: number): Projector {
  const [cx, cy, cz] = s.pos; const [tx, ty, tz] = s.target;
  let fx = tx - cx, fy = ty - cy, fz = tz - cz; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  // up vector: world up unless looking straight down
  let ux = 0, uy = 1, uz = 0;
  if (Math.abs(fy) > 0.98) { ux = 0; uy = 0; uz = -1; }
  // right = f x up
  let rx = fy * uz - fz * uy, ry = fz * ux - fx * uz, rz = fx * uy - fy * ux; const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl;
  // true up = r x f
  let vx = ry * fz - rz * fy, vy = rz * fx - rx * fz, vz = rx * fy - ry * fx;
  const roll = rad(s.rollDeg); const cr = Math.cos(roll), sr = Math.sin(roll);
  const r2: V3 = [rx * cr + vx * sr, ry * cr + vy * sr, rz * cr + vz * sr];
  const u2: V3 = [vx * cr - rx * sr, vy * cr - ry * sr, vz * cr - rz * sr];
  [rx, ry, rz] = r2; [vx, vy, vz] = u2;
  const f = h / 2 / Math.tan(rad(s.fovDeg) / 2);
  return {
    project([x, y, z]) {
      const dx = x - cx, dy = y - cy, dz = z - cz;
      const depth = dx * fx + dy * fy + dz * fz;
      if (depth < 0.05) return null;
      const sx = dx * rx + dy * ry + dz * rz;
      const sy = dx * vx + dy * vy + dz * vz;
      return { x: w / 2 + (sx * f) / depth, y: h / 2 - (sy * f) / depth, z: depth };
    },
  };
}
