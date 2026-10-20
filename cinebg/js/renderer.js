/* CineBG Studio — WebGL2 render motoru.
   Geçiş 1: sahne motoru → HDR doku (mipmap'li). Geçiş 2: film son işlem → ekran. */
(function () {
  const CB = (window.CB = window.CB || {});
  const G = CB.GLSL;

  class Renderer {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      const gl = canvas.getContext('webgl2', {
        antialias: false, alpha: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: !!opts.preserve,
        powerPreference: 'high-performance',
      });
      if (!gl) throw new Error('WebGL2 desteklenmiyor');
      this.gl = gl;
      this.hdr = !!gl.getExtension('EXT_color_buffer_float');
      this.maxSize = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_VIEWPORT_DIMS)[0]);
      this.programs = {};
      this.targets = [null, null];
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      this.post = this._program(G.VERT, G.POST);
    }

    _shader(type, src) {
      const gl = this.gl;
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('Shader hatası: ' + log);
      }
      return s;
    }

    _program(vs, fs) {
      const gl = this.gl;
      const p = gl.createProgram();
      gl.attachShader(p, this._shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, this._shader(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'a_pos');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Link hatası: ' + gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        const name = info.name.replace(/\[0\]$/, '');
        u[name] = gl.getUniformLocation(p, info.name);
      }
      return { p, u };
    }

    engineProgram(id) {
      if (!this.programs[id]) {
        const eng = CB.ENGINES[id];
        this.programs[id] = this._program(G.VERT, G.COMMON + eng.glsl + G.MAIN);
      }
      return this.programs[id];
    }

    _target(i, w, h) {
      const gl = this.gl;
      let t = this.targets[i];
      const wantHdr = this.hdr && !this.forceLdr;
      if (t && t.w === w && t.h === h && t.hdr === wantHdr) return t;
      if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const levels = Math.floor(Math.log2(Math.max(w, h))) + 1;
      gl.texStorage2D(gl.TEXTURE_2D, levels, wantHdr ? gl.RGBA16F : gl.RGBA8, w, h);
      if (gl.getError() === gl.OUT_OF_MEMORY && wantHdr) {
        gl.deleteTexture(tex);
        this.forceLdr = true;
        return this._target(i, w, h);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      t = { tex, fb, w, h, hdr: wantHdr };
      this.targets[i] = t;
      return t;
    }

    releaseTargets() {
      const gl = this.gl;
      this.targets.forEach((t) => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } });
      this.targets = [null, null];
    }

    _drawScene(target, prog, s, time) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.w, target.h);
      gl.useProgram(prog.p);
      gl.uniform2f(prog.u.u_res, target.w, target.h);
      gl.uniform1f(prog.u.u_time, time);
      gl.uniform1f(prog.u.u_seed, s.seedF);
      gl.uniform1fv(prog.u.u_p, s.params);
      gl.uniform3fv(prog.u.u_c, s.linColors);
      gl.uniform1f(prog.u.u_enc, target.hdr ? 0 : 1);
      const wx = s.atmos || {};
      gl.uniform4f(prog.u.u_wx, wx.rain || 0, wx.snow || 0, wx.fog || 0, wx.embers || 0);
      gl.uniform4f(prog.u.u_wx2, wx.ash || 0, wx.dust || 0, wx.lightning || 0, wx.leak || 0);
      const cam = s.cam || [1, 0, 0];
      gl.uniform3f(prog.u.u_cam, cam[0], cam[1], cam[2]);
      gl.uniform1f(prog.u.u_roll, cam[3] || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, target.tex);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    /* s: { engine, seedF, params[8], linColors[12], look{...} }
       loop: { length } → kusursuz döngü için iki zamanın çapraz geçişi */
    render(s, w, h, time, loop) {
      const gl = this.gl;
      w = Math.max(2, Math.min(this.maxSize, Math.round(w)));
      h = Math.max(2, Math.min(this.maxSize, Math.round(h)));
      if (this.canvas.width !== w) this.canvas.width = w;
      if (this.canvas.height !== h) this.canvas.height = h;
      gl.bindVertexArray(this.vao);
      const prog = this.engineProgram(s.engine);
      const a = this._target(0, w, h);
      let mixw = 0;
      let b = a;
      if (loop && loop.length > 0) {
        const tt = ((time % loop.length) + loop.length) % loop.length;
        mixw = tt / loop.length;
        this._drawScene(a, prog, s, tt);
        b = this._target(1, w, h);
        this._drawScene(b, prog, s, tt - loop.length);
      } else {
        this._drawScene(a, prog, s, time);
      }
      const P = this.post;
      const L = s.look;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(P.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex); gl.uniform1i(P.u.u_a, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, b.tex); gl.uniform1i(P.u.u_b, 1);
      gl.activeTexture(gl.TEXTURE0);
      const u = P.u;
      gl.uniform1f(u.u_mixw, mixw);
      gl.uniform1f(u.u_enc, a.hdr ? 0 : 1);
      gl.uniform2f(u.u_res, w, h);
      gl.uniform1f(u.u_lod0, Math.log2(h / 540));
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_exposure, L.exposure);
      gl.uniform1f(u.u_contrast, L.contrast);
      gl.uniform1f(u.u_sat, L.saturation);
      gl.uniform1f(u.u_temp, L.temperature);
      gl.uniform1f(u.u_tint, L.tint);
      gl.uniform1f(u.u_fade, L.fade);
      gl.uniform3fv(u.u_shadow, L.shadows);
      gl.uniform3fv(u.u_high, L.highlights);
      gl.uniform1f(u.u_bloom, L.bloom);
      gl.uniform1f(u.u_thr, L.threshold);
      gl.uniform1f(u.u_flare, L.flare);
      gl.uniform3fv(u.u_flareCol, L.flareColor);
      gl.uniform1f(u.u_halation, L.halation);
      gl.uniform1f(u.u_ca, L.ca);
      gl.uniform1f(u.u_vig, L.vignette);
      gl.uniform1f(u.u_grain, L.grain);
      gl.uniform1f(u.u_gsize, L.grainSize);
      gl.uniform1f(u.u_bars, L.bars || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return { w, h };
    }
  }

  CB.Renderer = Renderer;
})();
