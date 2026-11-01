import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { ThreeParams } from '../content';
import type { LightRig } from '../model/types';
import { dirVector, shotAt } from '../engine/shot';
import { BONES, layoutFigures, worldJoints, type PoseId } from '../engine/figures';
import { SET_BY_ID, worldPrims, type PlacedProp } from '../engine/sets';
import { kelvinToRgb } from '../lib/color';

export type ViewMode = 'camera' | 'orbit' | 'top';
export interface Viewport3DHandle {
  snapshot(kind?: 'color' | 'depth'): Promise<Blob | null>;
  exportGlb(): Promise<Blob | null>;
}

export interface Viewport3DProps {
  params: ThreeParams; light: LightRig; t: number; aspect: number; view: ViewMode;
  figures: number; poses: PoseId[]; setId?: string; props?: PlacedProp[];
  weather?: 'clear' | 'overcast' | 'rain' | 'snow' | 'fog'; quality?: 'low' | 'high'; overlay?: boolean;
  onFps?: (fps: number) => void;
}

const coarse = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };
const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const MAX_OBJECTS = 400; // performance budget for set + props + mannequins

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(function Viewport3D(props, ref) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ update(p: Viewport3DProps): void; snapshot(kind: 'color' | 'depth'): Promise<Blob | null>; exportGlb(): Promise<Blob | null> } | null>(null);
  useImperativeHandle(ref, () => ({
    snapshot: (kind = 'color') => api.current?.snapshot(kind) ?? Promise.resolve(null),
    exportGlb: () => api.current?.exportGlb() ?? Promise.resolve(null),
  }));

  useEffect(() => {
    const el = host.current!;
    let low = props.quality === 'low' || coarse();
    const renderer = new THREE.WebGLRenderer({ antialias: !low, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    const setPixelRatio = () => renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 2));
    setPixelRatio();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', '3D sahne');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0d');
    const shotCam = new THREE.PerspectiveCamera(35, 1, 0.05, 200); shotCam.name = 'Shot_Camera';
    const freeCam = new THREE.PerspectiveCamera(45, 1, 0.05, 300);
    const topCam = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
    topCam.position.set(0, 40, 0); topCam.up.set(0, 0, -1); topCam.lookAt(0, 0, 0);

    const floorMat = new THREE.MeshStandardMaterial({ color: '#1d1b17', roughness: 0.92 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'Floor'; scene.add(floor);
    const grid = new THREE.GridHelper(40, 40, 0x6b5426, 0x2e2a22); (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.35; scene.add(grid);

    const hemi = new THREE.HemisphereLight(0x8090a0, 0x15110b, 0.55); scene.add(hemi);
    const key = new THREE.SpotLight(0xffffff, 140, 30, Math.PI / 4, 0.5, 1.4); key.name = 'Key';
    key.castShadow = true; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
    scene.add(key); scene.add(key.target);
    const rim = new THREE.SpotLight(0xffffff, 0, 30, Math.PI / 5, 0.6, 1.6); rim.name = 'Rim'; scene.add(rim); scene.add(rim.target);
    const keyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(keyBulb);
    const camHelper = new THREE.CameraHelper(shotCam); scene.add(camHelper);

    const setGroup = new THREE.Group(); setGroup.name = 'Set'; scene.add(setGroup);
    const figGroup = new THREE.Group(); figGroup.name = 'Mannequins'; scene.add(figGroup);
    const helpers = new Set<THREE.Object3D>([grid, keyBulb, camHelper]);
    const mats = [new THREE.MeshStandardMaterial({ color: '#d7b27a', roughness: 0.55 }), new THREE.MeshStandardMaterial({ color: '#8fa8cf', roughness: 0.55 }), new THREE.MeshStandardMaterial({ color: '#b48fc7', roughness: 0.55 })];
    const matCache = new Map<string, THREE.MeshStandardMaterial>();
    const matFor = (color: string, emissive?: string) => {
      const k = color + (emissive ?? '');
      if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.8, emissive: emissive ?? '#000000', emissiveIntensity: emissive ? 1.2 : 0 }));
      return matCache.get(k)!;
    };
    const disposeGroup = (g: THREE.Group) => { g.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); }); g.clear(); };

    const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - r), 4, 10), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      m.castShadow = true; m.receiveShadow = true; return m;
    };
    const buildFigures = (p: Viewport3DProps) => {
      disposeGroup(figGroup);
      const figs = layoutFigures({ count: p.figures, ots: p.params.ots, two: p.params.two, poses: p.poses });
      figs.forEach((f, n) => {
        const fg = new THREE.Group(); fg.name = `Mannequin_${n + 1}`;
        const J = worldJoints(f); const mat = mats[f.tint % mats.length];
        const v = (k: keyof typeof J) => new THREE.Vector3(...J[k]);
        for (const [a, b] of BONES) fg.add(limb(v(a), v(b), a === 'neck' ? 0.14 : 0.055, mat));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), mat); head.position.copy(v('head')); head.castShadow = true; fg.add(head);
        const yaw = (f.yawDeg * Math.PI) / 180;
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), v('head'), 0.45, 0xe3b450, 0.1, 0.06);
        helpers.add(arrow); fg.add(arrow);
        figGroup.add(fg);
      });
    };
    const buildSet = (p: Viewport3DProps) => {
      disposeGroup(setGroup);
      const def = SET_BY_ID[p.setId ?? 'platform'] ?? SET_BY_ID.platform;
      (scene.background as THREE.Color).set(def.sky);
      floorMat.color.set(def.floor);
      const prims = worldPrims(p.setId, p.props).slice(0, MAX_OBJECTS);
      for (const pr of prims) {
        let geo: THREE.BufferGeometry;
        if (pr.kind === 'box') geo = new THREE.BoxGeometry(...pr.size);
        else if (pr.kind === 'cyl') geo = new THREE.CylinderGeometry(pr.size[0], pr.size[0], pr.size[1], low ? 10 : 18);
        else if (pr.kind === 'cone') geo = new THREE.ConeGeometry(pr.size[0], pr.size[1], low ? 8 : 14);
        else geo = new THREE.PlaneGeometry(pr.size[0], pr.size[2]);
        const m = new THREE.Mesh(geo, matFor(pr.color, pr.emissive));
        m.position.set(...pr.pos); m.rotation.y = pr.rotY ?? 0; m.name = pr.name ?? pr.kind;
        m.castShadow = !low; m.receiveShadow = true;
        setGroup.add(m);
      }
    };

    // weather particles (rain / snow)
    const PCOUNT = low ? 600 : 1800;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) { pPos[i * 3] = Math.random() * 20 - 10; pPos[i * 3 + 1] = Math.random() * 9; pPos[i * 3 + 2] = Math.random() * 28 - 22; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xcfd8e6, size: 0.03, transparent: true, opacity: 0.7, depthWrite: false });
    const particles = new THREE.Points(pGeo, pMat); particles.name = 'Weather'; particles.visible = false; scene.add(particles);
    helpers.add(particles);

    let orbit = { yaw: 0.8, pitch: 0.45, dist: 9 };
    let current = props;
    let size = { w: 1, h: 1 };

    const applyLight = (l: LightRig) => {
      const [r, g, b] = kelvinToRgb(l.kelvin);
      key.color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
      const d = dirVector(l.direction);
      key.position.set(d[0] * 4, 1.4 + d[1] * 3, d[2] * 4);
      key.target.position.set(0, 1.3, 0);
      key.penumbra = l.hardness === 'sert' ? 0.08 : 0.9;
      key.shadow.radius = l.hardness === 'sert' ? 1 : 8;
      key.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024);
      keyBulb.position.copy(key.position); (keyBulb.material as THREE.MeshBasicMaterial).color.copy(key.color);
      if (l.secondary) {
        const [sr, sg, sb] = kelvinToRgb(l.secondary.kelvin);
        const s = dirVector(l.secondary.direction);
        rim.color.setRGB(sr / 255, sg / 255, sb / 255, THREE.SRGBColorSpace); rim.intensity = 80;
        rim.position.set(s[0] * 4, 1.5 + s[1] * 3, s[2] * 4); rim.target.position.set(0, 1.3, 0);
      } else rim.intensity = 0;
      const atm = l.atmosphere ?? 'none';
      const weatherFog = current.weather === 'fog';
      scene.fog = atm === 'none' && !weatherFog ? null : new THREE.FogExp2(new THREE.Color(r / 255 * 0.12, g / 255 * 0.12, b / 255 * 0.12), weatherFog || atm === 'fog' ? 0.09 : atm === 'smoke' ? 0.06 : 0.035);
    };

    const applyShot = (p: Viewport3DProps, aspect = p.aspect) => {
      const s = shotAt(p.params, p.t);
      shotCam.position.set(...s.pos);
      shotCam.up.set(0, 1, 0);
      if (Math.abs(s.pos[1] - s.target[1]) > 0.98 * Math.hypot(s.pos[0] - s.target[0], s.pos[1] - s.target[1], s.pos[2] - s.target[2])) shotCam.up.set(0, 0, -1);
      shotCam.lookAt(...s.target);
      shotCam.rotateZ((s.rollDeg * Math.PI) / 180);
      shotCam.fov = s.fovDeg; shotCam.aspect = aspect; shotCam.updateProjectionMatrix();
      camHelper.update();
    };

    const render = () => {
      const p = current;
      const showHelpers = p.view !== 'camera';
      helpers.forEach((h) => { if (h !== particles) h.visible = showHelpers; });
      particles.visible = p.weather === 'rain' || p.weather === 'snow';
      let cam: THREE.Camera = shotCam;
      if (p.view === 'orbit') {
        freeCam.position.set(Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist, 1 + Math.sin(orbit.pitch) * orbit.dist, Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist);
        freeCam.lookAt(0, 1, 0); cam = freeCam;
      } else if (p.view === 'top') cam = topCam;
      if (p.view === 'camera') {
        const vw = size.w, vh = size.h; let w = vw, h = vw / p.aspect;
        if (h > vh) { h = vh; w = vh * p.aspect; }
        renderer.setScissorTest(false); renderer.setClearColor(0x000000, 1); renderer.clear();
        renderer.setViewport((vw - w) / 2, (vh - h) / 2, w, h);
        renderer.setScissor((vw - w) / 2, (vh - h) / 2, w, h); renderer.setScissorTest(true);
      } else { renderer.setScissorTest(false); renderer.setViewport(0, 0, size.w, size.h); }
      renderer.render(scene, cam);
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      size = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
      renderer.setSize(size.w, size.h, false);
      renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
      freeCam.aspect = size.w / size.h; freeCam.updateProjectionMatrix();
      const a = size.w / size.h; topCam.left = -8 * a; topCam.right = 8 * a; topCam.updateProjectionMatrix();
      render();
    };

    let lastSetKey = '';
    const update = (p: Viewport3DProps) => {
      const figsChanged = p.figures !== current.figures || JSON.stringify(p.poses) !== JSON.stringify(current.poses) || p.params.ots !== current.params.ots || p.params.two !== current.params.two;
      if ((p.quality === 'low') !== low && p.quality) { low = p.quality === 'low'; setPixelRatio(); lastSetKey = ''; resize(); }
      current = p;
      if (figsChanged || !figGroup.children.length) buildFigures(p);
      const setKey = (p.setId ?? 'platform') + JSON.stringify(p.props ?? []) + low;
      if (setKey !== lastSetKey) { buildSet(p); lastSetKey = setKey; }
      pMat.size = p.weather === 'snow' ? 0.06 : 0.03; pMat.color.set(p.weather === 'snow' ? 0xffffff : 0xa8bcd6);
      applyLight(p.light); applyShot(p); render();
      ensureLoop();
    };

    // animation loop only while particles fall (render on demand otherwise); reports fps
    let raf = 0; let last = 0; let frames = 0; let fpsT = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      const fall = current.weather === 'snow' ? 1.2 : 9;
      const arr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PCOUNT; i++) {
        arr[i * 3 + 1] -= fall * dt;
        if (current.weather === 'snow') arr[i * 3] += Math.sin(now / 900 + i) * 0.004;
        if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] += 9;
      }
      pGeo.attributes.position.needsUpdate = true;
      render();
      frames++; if (now - fpsT > 1000) { current.onFps?.(Math.round((frames * 1000) / (now - fpsT))); frames = 0; fpsT = now; }
      raf = requestAnimationFrame(loop);
    };
    const ensureLoop = () => {
      const want = (current.weather === 'rain' || current.weather === 'snow') && !reduce() && document.visibilityState === 'visible';
      if (want && !raf) { last = 0; fpsT = performance.now(); raf = requestAnimationFrame(loop); }
      if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const onVis = () => ensureLoop();
    document.addEventListener('visibilitychange', onVis);

    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (current.view !== 'orbit' || !pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId)!; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) orbit.dist = Math.min(40, Math.max(2, orbit.dist * (pinch / d))); pinch = d;
      } else { orbit.yaw -= (e.clientX - prev.x) * 0.008; orbit.pitch = Math.min(1.45, Math.max(0.02, orbit.pitch + (e.clientY - prev.y) * 0.006)); }
      render();
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); pinch = 0; };
    const onWheel = (e: WheelEvent) => { if (current.view !== 'orbit') return; e.preventDefault(); orbit.dist = Math.min(40, Math.max(2, orbit.dist * (1 + Math.sign(e.deltaY) * 0.1))); render(); };
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('wheel', onWheel, { passive: false });

    const offscreen = async (kind: 'color' | 'depth'): Promise<Blob | null> => {
      const short = 1080; const w = current.aspect >= 1 ? Math.round(short * current.aspect) : short; const h = current.aspect >= 1 ? short : Math.round(short / current.aspect);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const r2 = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true });
      r2.shadowMap.enabled = true; r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = kind === 'depth' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
      helpers.forEach((x) => { x.visible = false; });
      applyShot(current, w / h);
      const prevBg = scene.background; const prevFog = scene.fog;
      if (kind === 'depth') {
        // near = white, far = black (the common convention for depth-conditioned image models)
        scene.overrideMaterial = new THREE.ShaderMaterial({
          uniforms: { near: { value: 0.5 }, far: { value: 25 } },
          vertexShader: 'varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
          fragmentShader: 'uniform float near; uniform float far; varying float vZ; void main(){ float d = 1.0 - clamp((vZ - near)/(far - near), 0.0, 1.0); gl_FragColor = vec4(vec3(pow(d, 1.6)), 1.0); }',
        });
        scene.background = new THREE.Color(0x000000); scene.fog = null;
      }
      r2.render(scene, shotCam);
      scene.overrideMaterial?.dispose(); scene.overrideMaterial = null; scene.background = prevBg; scene.fog = prevFog;
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
      r2.dispose();
      applyShot(current); render();
      return blob;
    };

    const exportGlb = async (): Promise<Blob | null> => {
      const root = new THREE.Scene(); root.name = 'SECO_Scene';
      const cloneClean = (g: THREE.Object3D) => { const c = g.clone(true); const drop: THREE.Object3D[] = []; c.traverse((o) => { if (o instanceof THREE.ArrowHelper) drop.push(o); }); drop.forEach((o) => o.removeFromParent()); return c; };
      root.add(cloneClean(setGroup)); root.add(cloneClean(figGroup)); root.add(floor.clone());
      const cam = shotCam.clone(); cam.name = 'Shot_Camera'; root.add(cam);
      const k = key.clone(); root.add(k); if (rim.intensity > 0) root.add(rim.clone());
      return new Promise((res) => {
        new GLTFExporter().parse(root, (out) => res(new Blob([out as ArrayBuffer], { type: 'model/gltf-binary' })), () => res(null), { binary: true });
      });
    };

    api.current = { update, snapshot: offscreen, exportGlb };
    const ro = new ResizeObserver(resize); ro.observe(el);
    update(props); resize();

    return () => {
      ro.disconnect(); cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      cv.removeEventListener('wheel', onWheel);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.(); });
      matCache.forEach((m) => m.dispose());
      renderer.dispose(); renderer.domElement.remove(); api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.update(props); });

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0 }}>
      {props.view === 'camera' && props.overlay !== false && (
        <div className="frame-guide" aria-hidden="true" style={{ aspectRatio: String(props.aspect) }}>
          <i className="safe" />
        </div>
      )}
    </div>
  );
});
