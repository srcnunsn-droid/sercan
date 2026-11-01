import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import type { ThreeParams } from '../content';
import type { LightRig } from '../model/types';
import { dirVector, shotAt } from '../engine/shot';
import { BONES, layoutFigures, worldJoints, type PoseId } from '../engine/figures';
import { kelvinToRgb } from '../lib/color';

export type ViewMode = 'camera' | 'orbit' | 'top';
export interface Viewport3DHandle { snapshot(): Promise<Blob | null> }

interface Props {
  params: ThreeParams; light: LightRig; t: number; aspect: number; view: ViewMode;
  figures: number; poses: PoseId[]; quality?: 'low' | 'high';
}

const coarse = () => { try { return matchMedia('(pointer: coarse)').matches; } catch { return false; } };

export const Viewport3D = forwardRef<Viewport3DHandle, Props>(function Viewport3D(props, ref) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ render(): void; snapshot(): Promise<Blob | null>; update(p: Props): void } | null>(null);

  useImperativeHandle(ref, () => ({ snapshot: () => api.current?.snapshot() ?? Promise.resolve(null) }));

  useEffect(() => {
    const el = host.current!;
    const low = props.quality === 'low' || coarse();
    const renderer = new THREE.WebGLRenderer({ antialias: !low, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', '3D sahne');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0d');
    const shotCam = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
    const freeCam = new THREE.PerspectiveCamera(45, 1, 0.05, 300);
    const topCam = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
    topCam.position.set(0, 40, 0); topCam.up.set(0, 0, -1); topCam.lookAt(0, 0, 0);

    // floor & set
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#1d1b17', roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(40, 40, 0x6b5426, 0x2e2a22); (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.45; scene.add(grid);
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#4a4436', roughness: 0.7 });
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.2, 3.4, 16);
    for (const z of [-3, -7, -11, -15, -19]) for (const x of [-2.6, 2.6]) {
      const m = new THREE.Mesh(pillarGeo, pillarMat); m.position.set(x, 1.7, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    }
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 40), new THREE.MeshStandardMaterial({ color: '#c9a24a', roughness: 0.5 }));
    edge.position.set(-3.4, 0.02, -8); scene.add(edge);

    // lights
    const hemi = new THREE.HemisphereLight(0x8090a0, 0x15110b, 0.55); scene.add(hemi);
    const key = new THREE.SpotLight(0xffffff, 140, 30, Math.PI / 4, 0.5, 1.4);
    key.castShadow = true; key.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024); key.shadow.bias = -0.0008;
    scene.add(key); scene.add(key.target);
    const rim = new THREE.SpotLight(0xffffff, 0, 30, Math.PI / 5, 0.6, 1.6); scene.add(rim); scene.add(rim.target);
    const keyBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(keyBulb);

    // camera body shown in free/top views
    const camHelper = new THREE.CameraHelper(shotCam); scene.add(camHelper);

    // mannequins
    const figGroup = new THREE.Group(); scene.add(figGroup);
    const mats = [new THREE.MeshStandardMaterial({ color: '#d7b27a', roughness: 0.55 }), new THREE.MeshStandardMaterial({ color: '#8fa8cf', roughness: 0.55 }), new THREE.MeshStandardMaterial({ color: '#b48fc7', roughness: 0.55 })];
    const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - r), 4, 10), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      m.castShadow = true; m.receiveShadow = true; return m;
    };
    const buildFigures = (p: Props) => {
      figGroup.children.forEach((c) => { (c as THREE.Mesh).geometry?.dispose(); });
      figGroup.clear();
      const figs = layoutFigures({ count: p.figures, ots: p.params.ots, two: p.params.two, poses: p.poses });
      for (const f of figs) {
        const J = worldJoints(f); const mat = mats[f.tint % mats.length];
        const v = (k: keyof typeof J) => new THREE.Vector3(...J[k]);
        for (const [a, b] of BONES) figGroup.add(limb(v(a), v(b), a === 'neck' ? 0.14 : 0.055, mat));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), mat); head.position.copy(v('head')); head.castShadow = true; figGroup.add(head);
        // gaze arrow (for OTS/POV reading)
        const yaw = (f.yawDeg * Math.PI) / 180;
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), v('head'), 0.45, 0xe3b450, 0.1, 0.06);
        figGroup.add(arrow);
      }
    };

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
      keyBulb.position.copy(key.position); (keyBulb.material as THREE.MeshBasicMaterial).color.copy(key.color);
      if (l.secondary) {
        const [sr, sg, sb] = kelvinToRgb(l.secondary.kelvin);
        const s = dirVector(l.secondary.direction);
        rim.color.setRGB(sr / 255, sg / 255, sb / 255, THREE.SRGBColorSpace); rim.intensity = 80;
        rim.position.set(s[0] * 4, 1.5 + s[1] * 3, s[2] * 4); rim.target.position.set(0, 1.3, 0);
      } else rim.intensity = 0;
      const atm = l.atmosphere ?? 'none';
      scene.fog = atm === 'none' ? null : new THREE.FogExp2(new THREE.Color(r / 255 * 0.12, g / 255 * 0.12, b / 255 * 0.12), atm === 'fog' ? 0.09 : atm === 'smoke' ? 0.06 : 0.035);
    };

    const applyShot = (p: Props) => {
      const s = shotAt(p.params, p.t);
      shotCam.position.set(...s.pos);
      shotCam.up.set(0, 1, 0);
      if (Math.abs(s.pos[1] - s.target[1]) > 0.98 * Math.hypot(s.pos[0] - s.target[0], s.pos[1] - s.target[1], s.pos[2] - s.target[2])) shotCam.up.set(0, 0, -1);
      shotCam.lookAt(...s.target);
      shotCam.rotateZ((s.rollDeg * Math.PI) / 180);
      shotCam.fov = s.fovDeg;
      shotCam.aspect = p.aspect;
      shotCam.far = 200; shotCam.updateProjectionMatrix();
      camHelper.update();
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

    const render = () => {
      const p = current;
      camHelper.visible = p.view !== 'camera';
      keyBulb.visible = p.view !== 'camera';
      figGroup.children.forEach((c) => { if (c instanceof THREE.ArrowHelper) c.visible = p.view !== 'camera'; });
      let cam: THREE.Camera = shotCam;
      if (p.view === 'orbit') {
        freeCam.position.set(Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist, 1 + Math.sin(orbit.pitch) * orbit.dist, Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.dist);
        freeCam.lookAt(0, 1, 0); cam = freeCam;
      } else if (p.view === 'top') cam = topCam;
      if (p.view === 'camera') {
        // letterbox to the project aspect inside the viewport
        const vw = size.w, vh = size.h; let w = vw, h = vw / p.aspect;
        if (h > vh) { h = vh; w = vh * p.aspect; }
        renderer.setScissorTest(false); renderer.setClearColor(0x000000, 1); renderer.clear();
        renderer.setViewport((vw - w) / 2, (vh - h) / 2, w, h);
        renderer.setScissor((vw - w) / 2, (vh - h) / 2, w, h); renderer.setScissorTest(true);
      } else {
        renderer.setScissorTest(false); renderer.setViewport(0, 0, size.w, size.h);
      }
      renderer.render(scene, cam);
    };

    const update = (p: Props) => {
      const figsChanged = p.figures !== current.figures || JSON.stringify(p.poses) !== JSON.stringify(current.poses) || p.params.ots !== current.params.ots || p.params.two !== current.params.two;
      current = p;
      if (figsChanged || !figGroup.children.length) buildFigures(p);
      applyLight(p.light); applyShot(p); render();
    };

    // pointer orbit (free view) — drag to rotate, wheel / pinch to zoom
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (current.view !== 'orbit' || !pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId)!; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) orbit.dist = Math.min(40, Math.max(2, orbit.dist * (pinch / d))); pinch = d;
      } else {
        orbit.yaw -= (e.clientX - prev.x) * 0.008; orbit.pitch = Math.min(1.45, Math.max(0.02, orbit.pitch + (e.clientY - prev.y) * 0.006));
      }
      render();
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); pinch = 0; };
    const onWheel = (e: WheelEvent) => { if (current.view !== 'orbit') return; e.preventDefault(); orbit.dist = Math.min(40, Math.max(2, orbit.dist * (1 + Math.sign(e.deltaY) * 0.1))); render(); };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const snapshot = async (): Promise<Blob | null> => {
      // render the shot camera at 1080 px on the short side into an offscreen target
      const short = 1080; const w = current.aspect >= 1 ? Math.round(short * current.aspect) : short; const h = current.aspect >= 1 ? short : Math.round(short / current.aspect);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const prevView = current.view; current = { ...current, view: 'camera' };
      camHelper.visible = false; keyBulb.visible = false;
      figGroup.children.forEach((ch) => { if (ch instanceof THREE.ArrowHelper) ch.visible = false; });
      const r2 = new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true });
      r2.shadowMap.enabled = true; r2.outputColorSpace = THREE.SRGBColorSpace; r2.toneMapping = THREE.ACESFilmicToneMapping;
      shotCam.aspect = w / h; shotCam.updateProjectionMatrix();
      r2.render(scene, shotCam);
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
      r2.dispose();
      current = { ...current, view: prevView }; applyShot(current); render();
      return blob;
    };

    api.current = { render, snapshot, update };
    const ro = new ResizeObserver(resize); ro.observe(el);
    update(props); resize();

    return () => {
      ro.disconnect();
      renderer.domElement.removeEventListener('wheel', onWheel);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.(); });
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.update(props); });

  return <div ref={host} style={{ position: 'absolute', inset: 0 }} />;
});
