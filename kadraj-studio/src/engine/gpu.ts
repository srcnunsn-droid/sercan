// GPU efekt motoru (WebGL2). Ağır piksel efektlerini shader'da çalıştırır; ardışık efektler tek
// zincirde ping-pong framebuffer ile işlenir (tek yükleme, tek geri çizim). WebGL2 yoksa CPU'ya düşer.
import type { Effect, Project } from '../types';
import { curves, findLut, hex, type GradeParams } from './color';

export const GPU_EFFECTS = new Set(['grade', 'lut', 'chromakey', 'sharpen', 'chroma']);

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const HEAD = `#version 300 es
precision highp float; precision highp sampler3D;
in vec2 uv; out vec4 o; uniform sampler2D u_tex; uniform vec2 u_px;
vec4 src(vec2 q){ return texture(u_tex, q); }
vec3 un(vec4 c){ return c.a > 0.0 ? c.rgb / c.a : vec3(0.0); }
`;
const FS: Record<string, string> = {
  grade: HEAD + `uniform sampler2D u_curve; uniform float u_sat; uniform float u_mix;
float cv(float v, float ch){ return texture(u_curve, vec2((clamp(v,0.0,1.0)*255.0+0.5)/256.0, 0.5))[int(ch)]; }
void main(){ vec4 c = src(uv); if (c.a <= 0.0) { o = vec4(0.0); return; } vec3 x = un(c);
  vec3 g = vec3(cv(x.r,0.0), cv(x.g,1.0), cv(x.b,2.0));
  float l = dot(g, vec3(0.2126,0.7152,0.0722)); g = l + (g - l) * u_sat; g = mix(x, g, u_mix);
  o = vec4(clamp(g,0.0,1.0) * c.a, c.a); }`,
  lut: HEAD + `uniform sampler3D u_lut; uniform float u_n; uniform float u_amt;
void main(){ vec4 c = src(uv); if (c.a <= 0.0) { o = vec4(0.0); return; } vec3 x = un(c);
  vec3 q = x * (u_n - 1.0) / u_n + 0.5 / u_n; vec3 g = texture(u_lut, q).rgb;
  o = vec4(mix(x, g, u_amt) * c.a, c.a); }`,
  chromakey: HEAD + `uniform vec2 u_key; uniform float u_s0; uniform float u_s1; uniform float u_spill; uniform int u_mode;
void main(){ vec4 c = src(uv); vec3 x = un(c) * 255.0;
  float cb = -0.168736*x.r - 0.331264*x.g + 0.5*x.b, cr = 0.5*x.r - 0.418688*x.g - 0.081312*x.b;
  float d = distance(vec2(cb,cr), u_key); float a = clamp((d - u_s0) / max(1.0, u_s1 - u_s0), 0.0, 1.0);
  vec3 y = x / 255.0;
  if (u_spill > 0.0 && a > 0.0) { if (u_mode == 0) { float m = max(y.r,y.b); if (y.g > m) y.g -= (y.g - m) * u_spill; } else if (u_mode == 1) { float m = max(y.r,y.g); if (y.b > m) y.b -= (y.b - m) * u_spill; } }
  float na = c.a * a; o = vec4(y * na, na); }`,
  sharpen: HEAD + `uniform float u_amt;
void main(){ vec4 c = src(uv); vec3 x = un(c);
  vec3 n = un(src(uv + vec2(0.0,u_px.y))) + un(src(uv - vec2(0.0,u_px.y))) + un(src(uv + vec2(u_px.x,0.0))) + un(src(uv - vec2(u_px.x,0.0)));
  vec3 r = x + (x - n * 0.25) * u_amt * 1.6; o = vec4(clamp(r,0.0,1.0) * c.a, c.a); }`,
  chroma: HEAD + `uniform float u_d;
void main(){ vec4 c = src(uv); vec4 r = src(uv + vec2(u_d * u_px.x, 0.0)); vec4 b = src(uv - vec2(u_d * u_px.x, 0.0));
  float a = max(c.a, max(r.a, b.a)); vec3 col = vec3(un(r).r * r.a, un(c).g * c.a, un(b).b * b.a);
  o = vec4(col, a); }`,
};

class Gpu {
  gl: WebGL2RenderingContext; cv: HTMLCanvasElement; progs = new Map<string, WebGLProgram>(); src: WebGLTexture; fb: { f: WebGLFramebuffer; t: WebGLTexture }[] = [];
  w = 0; h = 0; curveTex: WebGLTexture; lutTex = new Map<string, WebGLTexture>(); lost = false;
  constructor() {
    this.cv = document.createElement('canvas');
    const gl = this.cv.getContext('webgl2', { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true, antialias: false });
    if (!gl) throw new Error('WebGL2 yok');
    this.gl = gl;
    this.cv.addEventListener('webglcontextlost', () => { this.lost = true; });
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.src = this.tex(); this.curveTex = this.tex();
  }
  tex() { const g = this.gl, t = g.createTexture()!; g.bindTexture(g.TEXTURE_2D, t); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE); return t; }
  prog(k: string) {
    let p = this.progs.get(k); if (p) return p; const g = this.gl;
    const sh = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s) ?? 'shader'); return s; };
    p = g.createProgram()!; g.attachShader(p, sh(g.VERTEX_SHADER, VS)); g.attachShader(p, sh(g.FRAGMENT_SHADER, FS[k])); g.bindAttribLocation(p, 0, 'p'); g.linkProgram(p);
    if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(p) ?? 'link');
    this.progs.set(k, p); return p;
  }
  size(w: number, h: number) {
    if (w === this.w && h === this.h) return; const g = this.gl; this.w = w; this.h = h; this.cv.width = w; this.cv.height = h;
    this.fb.forEach(x => { g.deleteFramebuffer(x.f); g.deleteTexture(x.t); });
    this.fb = [0, 1].map(() => { const t = this.tex(); g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null); const f = g.createFramebuffer()!; g.bindFramebuffer(g.FRAMEBUFFER, f); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, t, 0); return { f, t }; });
    g.bindFramebuffer(g.FRAMEBUFFER, null);
  }
  lut3d(p: Project, id: string) {
    const l = findLut(p, id); if (!l) return null; const key = id + ':' + l.data.length; let t = this.lutTex.get(key); if (t) return { t, n: l.size };
    const g = this.gl; t = g.createTexture()!; g.bindTexture(g.TEXTURE_3D, t);
    const n = l.size, data = new Uint8Array(n * n * n * 4);
    for (let i = 0, j = 0; i < l.data.length; i += 3, j += 4) { data[j] = l.data[i] * 255; data[j + 1] = l.data[i + 1] * 255; data[j + 2] = l.data[i + 2] * 255; data[j + 3] = 255; }
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    g.texImage3D(g.TEXTURE_3D, 0, g.RGBA8, n, n, n, 0, g.RGBA, g.UNSIGNED_BYTE, data);
    [g.TEXTURE_MIN_FILTER, g.TEXTURE_MAG_FILTER].forEach(k => g.texParameteri(g.TEXTURE_3D, k, g.LINEAR));
    [g.TEXTURE_WRAP_S, g.TEXTURE_WRAP_T, g.TEXTURE_WRAP_R].forEach(k => g.texParameteri(g.TEXTURE_3D, k, g.CLAMP_TO_EDGE));
    this.lutTex.set(key, t); return { t, n };
  }
  /** layer canvas'ı efekt zincirinden geçirip sonucu yine layer'a yazar */
  run(layer: HTMLCanvasElement, x: CanvasRenderingContext2D, fxIn: Effect[], p: Project, s: number): boolean {
    const fx = fxIn.filter(e => e.type !== 'lut' || findLut(p, String(e.p.lut))); if (!fx.length) return false;
    const g = this.gl, W = layer.width, H = layer.height; this.size(W, H);
    g.viewport(0, 0, W, H); g.disable(g.BLEND);
    g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, this.src);
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, layer);
    g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
    let input = this.src; let ran = 0;
    fx.forEach((e, i) => {
      const last = i === fx.length - 1; const pr = this.prog(e.type); g.useProgram(pr);
      const u = (n: string) => g.getUniformLocation(pr, n);
      g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, input); g.uniform1i(u('u_tex'), 0); g.uniform2f(u('u_px'), 1 / W, 1 / H);
      const P = e.p;
      if (e.type === 'grade') {
        const [R, G, B] = curves(P as unknown as GradeParams); const d = new Uint8Array(256 * 4);
        for (let k = 0; k < 256; k++) { d[k * 4] = R[k]; d[k * 4 + 1] = G[k]; d[k * 4 + 2] = B[k]; d[k * 4 + 3] = 255; }
        g.activeTexture(g.TEXTURE1); g.bindTexture(g.TEXTURE_2D, this.curveTex); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false); g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, 256, 1, 0, g.RGBA, g.UNSIGNED_BYTE, d);
        g.uniform1i(u('u_curve'), 1); g.uniform1f(u('u_sat'), Number(P.saturation)); g.uniform1f(u('u_mix'), Number(P.mix));
      } else if (e.type === 'lut') {
        const L = this.lut3d(p, String(P.lut))!;
        g.activeTexture(g.TEXTURE2); g.bindTexture(g.TEXTURE_3D, L.t); g.uniform1i(u('u_lut'), 2); g.uniform1f(u('u_n'), L.n); g.uniform1f(u('u_amt'), Number(P.amount));
      } else if (e.type === 'chromakey') {
        const [kr, kg, kb] = hex(String(P.key)).map(v => v * 255);
        g.uniform2f(u('u_key'), -0.168736 * kr - 0.331264 * kg + 0.5 * kb, 0.5 * kr - 0.418688 * kg - 0.081312 * kb);
        const s0 = Number(P.similarity) * 120; g.uniform1f(u('u_s0'), s0); g.uniform1f(u('u_s1'), s0 + Math.max(1, Number(P.smooth) * 120)); g.uniform1f(u('u_spill'), Number(P.spill));
        g.uniform1i(u('u_mode'), kg >= kr && kg >= kb ? 0 : kb > kg && kb >= kr ? 1 : 2);
      } else if (e.type === 'sharpen') g.uniform1f(u('u_amt'), Number(P.amount));
      else if (e.type === 'chroma') g.uniform1f(u('u_d'), Math.round(Number(P.px) * s));
      const out = last ? null : this.fb[ran % 2];
      g.bindFramebuffer(g.FRAMEBUFFER, out ? out.f : null); g.drawArrays(g.TRIANGLES, 0, 3);
      if (out) input = out.t; ran++;
    });
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'copy'; x.globalAlpha = 1; x.filter = 'none'; x.drawImage(this.cv, 0, 0); x.restore();
    return true;
  }
}

let inst: Gpu | null | undefined;
let enabled = (() => { try { return localStorage.getItem('kadraj.gpu') !== '0'; } catch { return true; } })();
export function gpu(): Gpu | null {
  if (!enabled) return null;
  if (inst === undefined) { try { inst = new Gpu(); } catch (e) { console.warn('GPU motoru kapalı:', e); inst = null; } }
  if (inst?.lost) inst = null;
  return inst;
}
export function gpuAvailable() { return gpu() !== null; }
export function setGpuEnabled(on: boolean) { enabled = on; try { localStorage.setItem('kadraj.gpu', on ? '1' : '0'); } catch { /* */ } }
export function gpuEnabled() { return enabled; }
