// Blender bridge: emits a self-contained bpy script that rebuilds the same shot in real Blender
// (set primitives, mannequins, camera with keyframed move, key/rim lights, 10 s at 24 fps).
// Three.js is y-up; Blender is z-up: (x, y, z)three -> (x, -z, y)blender.
import type { ThreeParams } from '../content';
import type { LightRig } from '../model/types';
import { dirVector, shotAt, SENSOR_H, type V3 } from './shot';
import { BONES, layoutFigures, worldJoints, type PoseId } from './figures';
import type { Prim } from './sets';
import { kelvinToRgb } from '../lib/color';

const b = ([x, y, z]: V3): string => `(${f(x)}, ${f(-z)}, ${f(y)})`;
const f = (n: number) => (Math.round(n * 1000) / 1000).toFixed(3);
const rgb = (k: number) => { const [r, g, bl] = kelvinToRgb(k); return `(${f(r / 255)}, ${f(g / 255)}, ${f(bl / 255)})`; };
const hex = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return `(${f(((n >> 16) & 255) / 255)}, ${f(((n >> 8) & 255) / 255)}, ${f((n & 255) / 255)}, 1.0)`; };
const py = (s: string) => JSON.stringify(s);

export interface BlenderInput {
  title: string; params: ThreeParams; light: LightRig; aspect: number;
  figures: number; poses: PoseId[]; prims: Prim[]; seconds?: number; fps?: number;
}

export function generateBpy(i: BlenderInput): string {
  const fps = i.fps ?? 24; const seconds = i.seconds ?? 10; const frames = fps * seconds;
  const keys = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((t) => ({ frame: Math.round(1 + t * (frames - 1)), shot: shotAt(i.params, t) }));
  const figs = layoutFigures({ count: i.figures, ots: i.params.ots, two: i.params.two, poses: i.poses });
  const short = 1080;
  const resX = i.aspect >= 1 ? Math.round(short * i.aspect) : short;
  const resY = i.aspect >= 1 ? short : Math.round(short / i.aspect);
  const L = dirVector(i.light.direction);
  const keyPos: V3 = [L[0] * 4, 1.4 + L[1] * 3, L[2] * 4];
  const S = i.light.secondary ? dirVector(i.light.secondary.direction) : null;

  const lines: string[] = [];
  lines.push(
    `# SECO Film Atölyesi -> Blender (${i.title})`,
    '# Blender 3.6+ / 4.x: Scripting sekmesinde aç ve Run Script.',
    'import bpy, math',
    'from mathutils import Vector',
    '',
    'bpy.ops.object.select_all(action="SELECT")',
    'bpy.ops.object.delete()',
    'scene = bpy.context.scene',
    `scene.render.resolution_x = ${resX}`,
    `scene.render.resolution_y = ${resY}`,
    `scene.render.fps = ${fps}`,
    'scene.frame_start = 1',
    `scene.frame_end = ${frames}`,
    '',
    'def mat(name, rgba, emit=None):',
    '    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)',
    '    m.use_nodes = True',
    '    bsdf = m.node_tree.nodes.get("Principled BSDF")',
    '    bsdf.inputs["Base Color"].default_value = rgba',
    '    if emit is not None:',
    '        key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"',
    '        bsdf.inputs[key].default_value = emit',
    '        if "Emission Strength" in bsdf.inputs: bsdf.inputs["Emission Strength"].default_value = 3.0',
    '    return m',
    '',
    'def prim(kind, name, loc, size, rgba, rot_z=0.0, emit=None):',
    '    if kind == "box":',
    '        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)',
    '        o = bpy.context.object; o.scale = (size[0], size[2], size[1])',
    '    elif kind == "cyl":',
    '        bpy.ops.mesh.primitive_cylinder_add(radius=size[0], depth=size[1], location=loc)',
    '        o = bpy.context.object',
    '    else:',
    '        bpy.ops.mesh.primitive_cone_add(radius1=size[0], depth=size[1], location=loc)',
    '        o = bpy.context.object',
    '    o.name = name; o.rotation_euler[2] = rot_z',
    '    o.data.materials.append(mat(name + "_mat", rgba, emit))',
    '    return o',
    '',
    'def limb(a, b, r, m):',
    '    a, b = Vector(a), Vector(b)',
    '    d = b - a',
    '    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=max(d.length, 0.01), location=(a + b) / 2)',
    '    o = bpy.context.object',
    '    o.rotation_mode = "QUATERNION"',
    '    o.rotation_quaternion = d.to_track_quat("Z", "Y")',
    '    o.data.materials.append(m)',
    '    return o',
    '',
    '# floor',
    'bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))',
    'bpy.context.object.name = "Floor"',
    'bpy.context.object.data.materials.append(mat("Floor_mat", (0.11, 0.1, 0.09, 1.0)))',
    '',
    '# set and props',
  );
  for (const p of i.prims) {
    if (p.kind === 'plane') continue;
    lines.push(`prim(${py(p.kind)}, ${py(p.name ?? p.kind)}, ${b(p.pos)}, (${f(p.size[0])}, ${f(p.size[1])}, ${f(p.size[2])}), ${hex(p.color)}, ${f(p.rotY ?? 0)}${p.emissive ? `, ${hex(p.emissive)}` : ''})`);
  }
  lines.push('', '# mannequins');
  const tints = ['(0.84, 0.70, 0.48, 1.0)', '(0.56, 0.66, 0.81, 1.0)', '(0.70, 0.56, 0.78, 1.0)'];
  figs.forEach((fig, n) => {
    const J = worldJoints(fig);
    lines.push(`m${n} = mat("Mannequin_${n + 1}", ${tints[fig.tint % 3]})`);
    for (const [a, c] of BONES) lines.push(`limb(${b(J[a])}, ${b(J[c])}, ${a === 'neck' ? '0.14' : '0.055'}, m${n})`);
    lines.push(`bpy.ops.mesh.primitive_uv_sphere_add(radius=0.11, location=${b(J.head)})`, `bpy.context.object.name = "Head_${n + 1}"`, `bpy.context.object.data.materials.append(m${n})`);
  });
  lines.push(
    '',
    '# lights',
    `bpy.ops.object.light_add(type="SPOT", location=${b(keyPos)})`,
    'key = bpy.context.object; key.name = "Key"',
    `key.data.energy = 900; key.data.color = ${rgb(i.light.kelvin)}`,
    `key.data.shadow_soft_size = ${i.light.hardness === 'sert' ? '0.05' : '1.2'}`,
    'key.data.spot_size = math.radians(60)',
    `key.rotation_mode = "QUATERNION"; key.rotation_quaternion = (Vector((0, 0, 1.3)) - Vector(${b(keyPos)})).to_track_quat("-Z", "Y")`,
  );
  if (S && i.light.secondary) {
    const sp: V3 = [S[0] * 4, 1.5 + S[1] * 3, S[2] * 4];
    lines.push(
      `bpy.ops.object.light_add(type="SPOT", location=${b(sp)})`,
      'rim = bpy.context.object; rim.name = "Rim"',
      `rim.data.energy = 600; rim.data.color = ${rgb(i.light.secondary.kelvin)}; rim.data.shadow_soft_size = 0.4`,
      `rim.rotation_mode = "QUATERNION"; rim.rotation_quaternion = (Vector((0, 0, 1.3)) - Vector(${b(sp)})).to_track_quat("-Z", "Y")`,
    );
  }
  lines.push(
    'world = scene.world or bpy.data.worlds.new("World"); scene.world = world',
    'world.use_nodes = True',
    'world.node_tree.nodes["Background"].inputs[1].default_value = 0.05',
    '',
    '# camera: vertical 24 mm sensor, same lens and keyframed move as the Studio',
    'bpy.ops.object.camera_add()',
    'cam = bpy.context.object; cam.name = "Shot_Camera"; scene.camera = cam',
    'cam.data.sensor_fit = "VERTICAL"',
    `cam.data.sensor_height = ${SENSOR_H}`,
    'KEYS = [',
    ...keys.map((k) => `    (${k.frame}, ${b(k.shot.pos)}, ${b(k.shot.target)}, ${f(k.shot.lensMm)}, ${f(k.shot.rollDeg)}),`),
    ']',
    'for frame, loc, target, lens, roll in KEYS:',
    '    cam.location = loc',
    '    q = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y")',
    '    e = q.to_euler()',
    '    cam.rotation_euler = e',
    '    cam.rotation_euler.rotate_axis("Z", math.radians(roll))',
    '    cam.data.lens = lens',
    '    cam.keyframe_insert("location", frame=frame)',
    '    cam.keyframe_insert("rotation_euler", frame=frame)',
    '    cam.data.keyframe_insert("lens", frame=frame)',
    'scene.frame_set(1)',
    'print("SECO: sahne kuruldu")',
  );
  return lines.join('\n') + '\n';
}
