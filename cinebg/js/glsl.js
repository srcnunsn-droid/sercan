/* CineBG Studio — GLSL kaynakları: ortak kütüphane, sahne motorları ve film son işlem geçişi.
   Her motor `vec3 scene(vec2 uv, vec2 st)` döndürür (lineer HDR renk).
   uv: yüksekliğe göre normalize, merkez (0,0), y ∈ [-0.5, 0.5]. st: 0..1 ekran koordinatı.
   u_p[0..7]: 0..1 aralığında motor parametreleri. u_c[0..3]: lineer palet (derin, orta, ışık, vurgu). */
(function () {
  const CB = (window.CB = window.CB || {});

  const VERT = `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  const COMMON = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_seed;
uniform float u_p[8];
uniform vec3 u_c[4];
uniform float u_enc;
out vec4 fragColor;

#define PI 3.14159265
#define TAU 6.28318531
#define A (u_res.x/u_res.y)
#define PX (1.0/u_res.y)
#define SEED2 vec2(u_seed*1.731+3.1, u_seed*2.417+7.7)

float sat(float x){ return clamp(x,0.,1.); }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float hash11(float p){ p=fract(p*.1031); p*=p+33.33; p*=p+p; return fract(p); }
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 hash22(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float hash13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }

float gnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  vec2 ga=hash22(i)*2.-1., gb=hash22(i+vec2(1,0))*2.-1., gc=hash22(i+vec2(0,1))*2.-1., gd=hash22(i+vec2(1,1))*2.-1.;
  float va=dot(ga,f), vb=dot(gb,f-vec2(1,0)), vc=dot(gc,f-vec2(0,1)), vd=dot(gd,f-vec2(1,1));
  return mix(mix(va,vb,u.x),mix(vc,vd,u.x),u.y);
}
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y);
}
float vnoise3(vec3 p){
  vec3 i=floor(p), f=fract(p); vec3 u=f*f*(3.-2.*f);
  float a=hash13(i), b=hash13(i+vec3(1,0,0)), c=hash13(i+vec3(0,1,0)), d=hash13(i+vec3(1,1,0));
  float e=hash13(i+vec3(0,0,1)), g=hash13(i+vec3(1,0,1)), h=hash13(i+vec3(0,1,1)), k=hash13(i+vec3(1,1,1));
  return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y), mix(mix(e,g,u.x),mix(h,k,u.x),u.y), u.z);
}
const mat2 M2 = mat2(1.6,1.2,-1.2,1.6);
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<6;i++){ s+=a*gnoise(p); p=M2*p; a*=.5; } return s; }
float fbm4(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*gnoise(p); p=M2*p; a*=.5; } return s; }
float fbm3(vec3 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*vnoise3(p); p=p*2.02+vec3(1.7,9.2,3.1); a*=.5; } return s; }
float ridged(vec2 p, int oct){
  float s=0., a=.5, w=1.;
  for(int i=0;i<7;i++){ if(i>=oct) break; float n=1.-abs(gnoise(p)*1.8); n*=n; s+=n*a*w; w=sat(n*1.4); p=M2*p+vec2(1.7,9.2); a*=.5; }
  return s;
}
float lum(vec3 c){ return dot(c, vec3(.2126,.7152,.0722)); }

vec3 starfield(vec2 uv, float amt){
  vec3 s=vec3(0);
  for(int i=0;i<3;i++){
    float sc=38.+float(i)*52.;
    vec2 g=uv*sc+float(i)*17.3+SEED2;
    vec2 id=floor(g), f=fract(g);
    float h=hash12(id);
    if(h<amt*.13){
      vec2 o=hash22(id+1.3)*.8+.1;
      float d=length(f-o)/sc;
      float r=.0007+.0011*pow(hash12(id+4.1),3.);
      float b=pow(hash12(id+9.2),5.)*4.+.12;
      float tw=.75+.25*sin(u_time*(1.+3.*hash12(id+2.))+h*50.);
      vec3 tint=mix(vec3(.65,.78,1.),vec3(1.,.85,.68),hash12(id+5.5));
      s+=tint*b*tw*exp(-d*d/(r*r));
    }
  }
  return s;
}
// gün batımı / gökyüzü gradyanı + güneş
vec3 skyGrad(vec2 uv, float hz, vec2 sun, float sunSize, float sunGlow){
  float h=uv.y-hz;
  vec3 sky=mix(u_c[1], u_c[0], smoothstep(-.02,.65,h));
  sky=mix(sky, u_c[1]*.6+u_c[3]*.4, .5*exp(-abs(h-.12)*7.));
  float sd=length(uv-sun);
  sky+=u_c[2]*(exp(-sd*mix(16.,4.,sunGlow))*1.3*sunGlow+exp(-sd*40.)*.6);
  sky+=u_c[2]*smoothstep(sunSize, sunSize-PX*2., sd)*8.;
  return sky;
}
float sparkles(vec2 uv, float scale, float dens, float speed){
  vec2 g=uv*scale+vec2(0., u_time*speed); vec2 id=floor(g), f=fract(g);
  float h=hash12(id+SEED2);
  if(h>dens*.1) return 0.;
  vec2 o=hash22(id+3.)*.8+.1; float d=length(f-o)/scale; float r=.0012+.0018*hash12(id+8.);
  return (.3+.7*hash12(id+1.))*exp(-d*d/(r*r))*(.6+.4*sin(u_time*3.+h*40.));
}
`;

  const MAIN = `
uniform vec4 u_wx;   // yağmur, kar, sis, kor
uniform vec4 u_wx2;  // kül, toz, şimşek, ışık sızıntısı
uniform vec3 u_cam;  // yakınlaştırma, kaydırma x, kaydırma y
float flake(vec2 uv, float scale, float speed, float drift, float sz, float dens, float sl){
  vec2 g=uv*scale; g.y+=u_time*speed; g.x+=sin(g.y*.35+sl)*drift;
  vec2 id=floor(g), f=fract(g); float h=hash12(id+sl);
  if(h>dens) return 0.;
  vec2 o=hash22(id+sl*2.)*.7+.15; float d=length(f-o)/scale;
  float r=sz*(.5+hash12(id+5.));
  return smoothstep(r, r*.35, d);
}
vec3 atmos(vec3 c, vec2 uv){
  float t=u_time;
  float L=lum(c);
  vec3 amb=mix(u_c[1], u_c[2], .35);
  if(u_wx.z>.001){
    float n=fbm4(uv*vec2(1.2,2.2)+vec2(t*.015,0.)+SEED2)*.5+.5;
    float k=u_wx.z*(.35+.65*n)*mix(.55,1.,smoothstep(.55,-.45,uv.y));
    c=mix(c, mix(amb,vec3(lum(amb)),.45)*.55+L*.15, sat(k*.8));
  }
  if(u_wx2.y>.001){
    float n=fbm4(uv*vec2(.8,4.)+vec2(t*.08,0.)+SEED2*1.3)*.5+.5;
    c=mix(c, mix(u_c[1],u_c[2],.5)*.7, sat(u_wx2.y*n*.6));
    c+=mix(u_c[2],vec3(1.),.3)*sparkles(uv*rot(1.4),80.,u_wx2.y,-.4)*.5;
  }
  if(u_wx.x>.001){
    vec3 rc=mix(amb, vec3(1.), .5)*.35;
    for(int i=0;i<3;i++){
      float fi=float(i);
      vec2 ru=uv*rot(.12+fi*.03);
      vec2 g=ru*vec2(70.+fi*45., 2.2+fi*.8)+vec2(fi*7.1, u_time*(9.+fi*4.));
      vec2 id=floor(g); vec2 f=fract(g); float h=hash12(id+fi*13.);
      float on=step(1.-u_wx.x*.35, h);
      float line=smoothstep(.12,.0,abs(f.x-.5-(hash12(id+3.)-.5)*.6))*smoothstep(0.,.25,f.y)*smoothstep(1.,.55,f.y);
      c+=rc*on*line*(.5+.5*u_wx.x)*(1.-fi*.25);
    }
    c=mix(c, amb*.4, u_wx.x*.12);
  }
  if(u_wx.y>.001){
    vec3 sc=mix(vec3(1.), amb, .25)*mix(.6,1.2,L+.3);
    float f=flake(uv,10.,.08,.6,.006,u_wx.y*.5,1.)+flake(uv,22.,.12,.5,.0035,u_wx.y*.5,7.)*.8+flake(uv,48.,.16,.4,.002,u_wx.y*.6,13.)*.6;
    c=mix(c, sc, sat(f));
  }
  if(u_wx2.x>.001){
    float f=flake(uv,14.,.03,.9,.004,u_wx2.x*.45,3.)+flake(uv,30.,.05,.7,.0025,u_wx2.x*.5,9.)*.7;
    c=mix(c, vec3(.42,.4,.38)*mix(.5,1.,L+.2), sat(f*.85));
  }
  if(u_wx.w>.001){
    vec3 ec=vec3(1.,.42,.12)*3.;
    c+=ec*(sparkles(uv*rot(-.25),36.,u_wx.w*.5,.12)+sparkles(uv*rot(.2),75.,u_wx.w*.4,.2)*.7+sparkles(uv,140.,u_wx.w*.4,.3)*.5);
    c+=vec3(1.,.35,.08)*u_wx.w*.08*smoothstep(.1,-.6,uv.y);
  }
  if(u_wx2.z>.001){
    float tb=floor(t*1.3);
    float fl=step(.72,hash11(tb+SEED2.x))*exp(-fract(t*1.3)*7.)*(.6+.4*step(.5,fract(t*9.)));
    c+=vec3(.75,.82,1.)*fl*u_wx2.z*(.35+sat(uv.y+.5))*1.4;
  }
  if(u_wx2.w>.001){
    vec2 lp=vec2(sin(t*.05+SEED2.x)*A*.5, .55);
    c+=mix(u_c[3],u_c[2],.4)*exp(-length((uv-lp)*vec2(.7,1.))*2.2)*u_wx2.w*1.2;
    c+=u_c[3]*smoothstep(.2,.9,((uv.x/A)+.5))*u_wx2.w*.15;
  }
  return c;
}
void main(){
  vec2 uv0=(gl_FragCoord.xy-.5*u_res)/u_res.y;
  vec2 uv=uv0/max(u_cam.x,.01)+u_cam.yz;
  vec2 st=(uv*u_res.y+.5*u_res)/u_res;
  vec3 c=scene(uv, st);
  c=atmos(max(c,0.), uv);
  c=max(c, 0.);
  if(c.r!=c.r||c.g!=c.g||c.b!=c.b) c=vec3(0.);
  if(u_enc>.5) c=sqrt(c/(1.+c));
  fragColor=vec4(c,1.);
}`;

  const POST = `#version 300 es
precision highp float;
uniform sampler2D u_a; uniform sampler2D u_b; uniform float u_mixw; uniform float u_enc;
uniform vec2 u_res; uniform float u_lod0; uniform float u_time;
uniform float u_exposure, u_contrast, u_sat, u_temp, u_tint, u_fade;
uniform vec3 u_shadow, u_high;
uniform float u_bloom, u_thr, u_flare, u_halation, u_ca, u_vig, u_grain, u_gsize, u_bars;
uniform vec3 u_flareCol;
out vec4 fragColor;
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y); }
vec3 dec(vec3 e){ if(u_enc>.5){ vec3 y=e*e; return y/max(1.-y, 1e-3); } return e; }
vec3 S(vec2 uv, float lod){ return dec(mix(textureLod(u_a,uv,lod).rgb, textureLod(u_b,uv,lod).rgb, u_mixw)); }
vec3 thr(vec3 c, float t){ float l=dot(c,vec3(.2126,.7152,.0722)); return c*max(l-t,0.)/max(l,1e-4); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 c=uv-.5;
  vec3 col;
  if(u_ca>.001){
    vec2 d=c*u_ca*.010;
    col=vec3(S(uv-d,0.).r, S(uv,0.).g, S(uv+d,0.).b);
  } else col=S(uv,0.);
  vec3 bl=vec3(0); float ws=0.;
  for(int i=0;i<6;i++){ float w=1./(1.+float(i)*.5); bl+=thr(S(uv,u_lod0+1.+float(i)),u_thr)*w; ws+=w; }
  col+=bl/ws*u_bloom*2.2;
  col+=vec3(1.,.32,.08)*max(lum3(S(uv,u_lod0+1.5))-u_thr,0.)*u_halation*.25;
  if(u_flare>.001){
    vec3 st=vec3(0); float lw=0.; float ar=u_res.y/u_res.x;
    for(int i=-18;i<=18;i++){ float fi=float(i); float w=exp(-abs(fi)*.12); st+=thr(S(uv+vec2(fi*.024*ar*1.6,0.),u_lod0+3.),u_thr*1.3)*w; lw+=w; }
    col+=st/lw*u_flareCol*u_flare*7.;
  }
  col*=exp2(u_exposure);
  col*=vec3(1.+u_temp*.22, 1.+u_tint*.12, 1.-u_temp*.22);
  col=aces(col);
  col=pow(col, vec3(1./2.2));
  float L=dot(col,vec3(.2126,.7152,.0722));
  col+=u_shadow*(1.-smoothstep(0.,.55,L))*.22 + u_high*smoothstep(.45,1.,L)*.22;
  col=clamp(col,0.,1.);
  vec3 sc=col*col*(3.-2.*col);
  col=mix(col, sc, clamp(u_contrast-1.,0.,1.)*1.6);
  col=mix(vec3(.5), col, min(u_contrast,1.)+ .0);
  L=dot(col,vec3(.2126,.7152,.0722));
  col=mix(vec3(L), col, u_sat);
  col=mix(vec3(u_fade*.13), vec3(1.-u_fade*.05), clamp(col,0.,1.));
  float r=length(c*vec2(1.,1.))*1.41;
  col*=1.-u_vig*smoothstep(.35,1.05,r)*.92;
  float px=u_res.y/1080.;
  vec2 gp=gl_FragCoord.xy/(px*max(u_gsize,.5));
  float t=floor(u_time*24.);
  float g=(vnoise(gp+vec2(t*37.1,t*11.7))+vnoise(gp*1.9+vec2(t*5.3,-t*23.))-1.);
  col+=g*u_grain*.16*(1.-L*.6);
  col+=(hash12(gl_FragCoord.xy+fract(u_time)*91.)-.5)/255.;
  if(u_bars>0.){ float ar=u_res.x/u_res.y; if(ar<u_bars){ float m=(1.-ar/u_bars)*.5; if(uv.y<m||uv.y>1.-m) col=vec3(0.); } }
  fragColor=vec4(clamp(col,0.,1.),1.);
}`.replace('uniform vec3 u_flareCol;', 'uniform vec3 u_flareCol;\nfloat lum3(vec3 c){ return dot(c, vec3(.2126,.7152,.0722)); }');

  /* ---------------- SAHNE MOTORLARI ---------------- */
  const E = {};

  E.nebula = {
    name: 'Derin Uzay Nebulası',
    params: ['Yoğunluk', 'Girdap', 'Yıldızlar', 'Çekirdek parlaklığı', 'Yakınlık', 'Toz bantları', 'Dönüş', 'Akış hızı'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.004+.03*u_p[7]);
  mat2 R=rot(u_p[6]*TAU);
  vec2 p=R*uv*(1.1+2.4*u_p[4])+SEED2;
  float wk=1.+3.*u_p[1];
  vec2 q=vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+wk*q+vec2(1.7,9.2)+.15*t), fbm(p+wk*q+vec2(8.3,2.8)-.12*t));
  float f=fbm(p+wk*r);
  float n=sat(f*1.7+.5);
  float dens=mix(.35,.8,u_p[0]);
  float neb=smoothstep(1.-dens-.2, 1.05, n);
  vec3 col=u_c[0]*.35*(1.-st.y*.4);
  vec3 c=mix(u_c[1], u_c[3], sat(length(q)*1.3));
  c=mix(c, u_c[2], sat(r.x*r.x*4.));
  col+=c*neb*neb*2.2;
  col+=u_c[2]*pow(neb,5.)*(1.+4.*u_p[3]);
  float dust=smoothstep(.0,.55, fbm(p*2.3+r*2.+11.)+.3);
  col*=mix(1., .2+.8*dust, u_p[5]);
  vec2 cp=(hash22(SEED2)-.5)*vec2(.7,.3);
  float cg=exp(-length(uv-cp)*mix(7.,2.5,u_p[3]));
  col+=u_c[2]*cg*(.15+u_p[3])*(.4+neb);
  col+=starfield(uv, .25+.75*u_p[2])*(1.-neb*.6);
  return col;
}`,
  };

  E.godrays = {
    name: 'Hacimsel Işık Huzmeleri',
    params: ['Kaynak X', 'Kaynak Y', 'Huzme sayısı', 'Huzme keskinliği', 'Erişim', 'Toz zerreleri', 'Sis', 'Parlaklık'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec2 L=vec2((u_p[0]-.5)*A*1.1, mix(.15,.72,u_p[1]));
  vec2 d=uv-L; float r=length(d); vec2 dir=d/max(r,1e-4);
  float t=u_time*.03;
  float cnt=mix(2.,14.,u_p[2]);
  float n=gnoise(dir*cnt+SEED2+t)*.8+gnoise(dir*cnt*2.7-SEED2+t*1.3)*.45+gnoise(dir*cnt*6.1+t*.7)*.2;
  float rays=pow(sat(.5+n), mix(1.2,6.,u_p[3]));
  float fall=exp(-r*mix(3.5,.7,u_p[4]));
  float fog=sat(.55+fbm(uv*2.2+SEED2+vec2(t,0.))*1.2);
  fog=mix(.7, fog, u_p[6]);
  vec3 col=mix(u_c[0]*.5, u_c[1]*.35, smoothstep(-.6,.6,uv.y))*fog;
  float br=.6+1.6*u_p[7];
  col+=u_c[2]*rays*fall*br*(.45+.75*fog);
  col+=u_c[3]*rays*fall*.15*fog;
  col+=u_c[2]*exp(-r*14.)*br*1.5+u_c[2]*exp(-r*45.)*3.;
  float sp=sparkles(uv*rot(.3), 46., u_p[5]*.6, -.02)+sparkles(uv, 90., u_p[5]*.5, -.035)*.6;
  col+=u_c[2]*sp*(rays*fall*3.+.05)*2.;
  return col;
}`,
  };

  E.mountains = {
    name: 'Sisli Dağ Silüetleri',
    params: ['Ufuk yüksekliği', 'Güneş X', 'Güneş yüksekliği', 'Güneş parıltısı', 'Katman sayısı', 'Engebe', 'Vadi sisi', 'Bulutlar'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.22,.08,u_p[0]);
  vec2 sun=vec2((u_p[1]-.5)*A*.8, hz+mix(-.02,.32,u_p[2]));
  vec3 sky=skyGrad(uv, hz, sun, .03, .3+.7*u_p[3]);
  float h=uv.y-hz;
  float cl=fbm(vec2(uv.x*1.3+u_time*.004, uv.y*7.)+SEED2);
  float cm=smoothstep(.0,.45,cl)*u_p[7]*smoothstep(.0,.25,h);
  sky=mix(sky, mix(u_c[0]*.6, u_c[2]*.9+u_c[1]*.3, exp(-length(uv-sun)*2.5)), cm*.75);
  vec3 col=sky;
  vec3 hzc=mix(u_c[1], u_c[2], .25*exp(-abs(uv.x-sun.x)*2.));
  int N=3+int(u_p[4]*4.99);
  for(int i=0;i<8;i++){
    if(i>=N) break;
    float fi=float(i)/float(N-1);
    float freq=mix(1.3,2.6,fi)*mix(.7,1.5,u_p[5]);
    float amp=mix(.07,.2,fi)*mix(.7,1.4,u_p[5]);
    float base=hz+mix(.01,-.42,fi);
    float x=uv.x*freq+float(i)*17.1+SEED2.x;
    float y=base+ridged(vec2(x, float(i)*3.7+SEED2.y), 6)*amp;
    float m=smoothstep(y+PX*1.5, y-PX*1.5, uv.y);
    vec3 lc=mix(hzc*.85, u_c[0]*.06, pow(fi,.7));
    float dy=y-uv.y;
    float mist=smoothstep(0., .12+.1*fi, dy)*u_p[6]*(1.-fi*.55);
    lc=mix(lc, hzc*(1.05-fi*.3), mist);
    lc+=u_c[2]*exp(-dy*90.)*.25*(1.-fi)*exp(-abs(uv.x-sun.x)*1.5);
    col=mix(col, lc, m);
  }
  return col;
}`,
  };

  E.city = {
    name: 'Neon Şehir Bokeh',
    params: ['Bokeh boyutu', 'Işık yoğunluğu', 'Pus', 'Yağmur', 'Diyafram (daire→altıgen)', 'Işık bandı yüksekliği', 'Renk karışımı', 'Bina siluetleri'],
    glsl: `
float bshape(vec2 d, float r, float hexk){
  vec2 a=abs(d); float hx=max(a.x*.866+a.y*.5, a.y);
  return mix(length(d), hx, hexk)/r;
}
vec3 bokehLayer(vec2 uv, float scale, float sizeK, float sl, float dens, float band){
  vec2 g=uv*scale; vec2 id=floor(g); vec3 acc=vec3(0);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 cid=id+vec2(i,j); float h=hash12(cid+sl);
    vec2 o=hash22(cid+sl*1.3);
    vec2 c=(cid+o)/scale;
    float bw=exp(-pow((c.y-band)*3.2,2.));
    if(h>dens*(.25+bw)) continue;
    float rad=(.35+.65*hash12(cid+5.))*sizeK/scale;
    float q=bshape(uv-c, rad, u_p[4]);
    float disk=smoothstep(1., .9-PX*2./rad, q);
    float ring=smoothstep(.7,1.,q)*disk;
    float k=hash12(cid+9.);
    vec3 cl=k<.45?u_c[2]:(k<.8?u_c[3]:mix(u_c[1]*2.,u_c[2],.5));
    cl=mix(cl, u_c[2], u_p[6]*.5*hash12(cid+2.));
    float br=.25+.9*pow(hash12(cid+3.),2.);
    acc+=cl*br*(disk*.5+ring*.55);
  }
  return acc;
}
vec3 scene(vec2 uv, vec2 st){
  float band=mix(-.3,.15,u_p[5]);
  vec3 col=mix(u_c[1]*.45, u_c[0]*.4, smoothstep(band-.3, .55, uv.y));
  col+=u_c[3]*.12*exp(-pow((uv.y-band)*3.,2.))*(.5+u_p[2]);
  float x=uv.x*6.+SEED2.x; float bh=band+.12+.35*pow(hash11(floor(x)),2.);
  float bm=smoothstep(bh+.03, bh-.03, uv.y)*u_p[7];
  col=mix(col, u_c[0]*.15, bm*.7);
  vec2 dr=vec2(u_time*.006,0.);
  float sz=mix(.5,1.2,u_p[0]);
  float dn=mix(.25,.9,u_p[1]);
  col+=bokehLayer(uv+dr, 5., sz*.95, 1.7, dn, band)*.7;
  col+=bokehLayer(uv+dr*1.6, 9., sz*.85, 13.1, dn, band)*.55;
  col+=bokehLayer(uv+dr*2.2, 16., sz*.7, 27.3, dn*.8, band)*.4;
  float hz=fbm(uv*1.5+SEED2+u_time*.01)*.5+.5;
  col=mix(col, u_c[1]*.5+u_c[3]*.1, u_p[2]*.35*hz*smoothstep(.6,-.4,uv.y));
  if(u_p[3]>.02){
    vec2 ru=uv*rot(.18); vec2 g=ru*vec2(90.,4.)+vec2(0.,u_time*5.);
    vec2 id=floor(g); float h=hash12(id+SEED2);
    float ln=step(.82,h)*smoothstep(.5,.0,abs(fract(g.x)-.5)*2.-.0)*smoothstep(0.,.3,fract(g.y))*smoothstep(1.,.6,fract(g.y));
    col+=mix(u_c[2],vec3(1.),.4)*ln*u_p[3]*.25;
  }
  return col;
}`,
  };

  E.ocean = {
    name: 'Okyanus Ufku',
    params: ['Ufuk yüksekliği', 'Güneş X', 'Güneş yüksekliği', 'Dalga ölçeği', 'Bulut', 'Pırıltı', 'Güneş parıltısı', 'Dalga hızı'],
    glsl: `
vec3 oceanSky(vec2 uv, float hz, vec2 sun){
  vec3 s=skyGrad(uv, hz, sun, .028, .3+.7*u_p[6]);
  float cl=fbm(vec2(uv.x*1.1+u_time*.003, (uv.y-hz)*5.)+SEED2);
  float cm=smoothstep(-.05,.4,cl)*u_p[4]*smoothstep(-.01,.12,uv.y-hz);
  vec3 cc=mix(u_c[0]*.5, u_c[2]*1.1+u_c[1]*.4, exp(-length(uv-sun)*2.)*.9+.1*smoothstep(.0,.4,cl));
  return mix(s, cc, cm*.8);
}
float wave(vec2 p){ return fbm4(p)+.35*gnoise(p*3.1+u_time*.3); }
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.22,.14,u_p[0]);
  vec2 sun=vec2((u_p[1]-.5)*A*.7, hz+mix(-.01,.3,u_p[2]));
  if(uv.y>hz) return oceanSky(uv, hz, sun);
  float dy=hz-uv.y; float z=1./(dy+.004);
  vec2 P=vec2(uv.x*z, z)*.18*mix(.5,2.,u_p[3])+vec2(SEED2.x, u_time*(.05+.3*u_p[7]));
  float e=.03; float h0=wave(P), hx=wave(P+vec2(e,0)), hy=wave(P+vec2(0,e));
  vec2 n=vec2(h0-hx, h0-hy)/e;
  float k=min(dy*3.,1.);
  vec2 ruv=vec2(uv.x+n.x*.05*k, hz+dy*.6+abs(n.y)*.12*k);
  vec3 refl=oceanSky(ruv, hz, sun);
  float fres=mix(.25,1.,exp(-dy*7.));
  vec3 sea=mix(u_c[0]*.04+u_c[1]*.015, refl*.85, fres);
  float colm=exp(-pow((uv.x-sun.x)/(.02+dy*.7),2.));
  float sp=smoothstep(.55,1.,gnoise(P*4.+n*2.)*.5+.5+n.x*.3);
  sea+=u_c[2]*colm*sp*u_p[5]*4.*smoothstep(-.1,.2,sun.y-hz+.1);
  sea=mix(sea, oceanSky(vec2(uv.x,hz+.002),hz,sun), exp(-dy*120.));
  return sea;
}`,
  };

  E.aurora = {
    name: 'Kuzey Işıkları',
    params: ['Perde yüksekliği', 'Dalgalanma', 'Işıma', 'Çizgilenme', 'Perde sayısı', 'Yıldızlar', 'Zemin / ağaç hattı', 'Hareket'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec3 col=mix(u_c[1]*.12, u_c[0]*.5, smoothstep(-.5,.5,uv.y));
  col+=starfield(uv, .2+.8*u_p[5]);
  float t=u_time*(.01+.06*u_p[7]);
  int N=1+int(u_p[4]*2.99);
  for(int i=0;i<3;i++){
    if(i>=N) break;
    float fi=float(i);
    float x=uv.x*(.7+.25*fi)+fi*4.3+SEED2.x;
    float base=mix(-.05,.22,u_p[0])+fi*.07+fbm4(vec2(x*1.8+t, fi))*(.2+.4*u_p[1]);
    float d=uv.y-base;
    float edge=smoothstep(-.012,.0,d);
    float up=exp(-max(d,0.)*mix(9.,3.,u_p[2]));
    float sx=x*3.+fbm4(vec2(x*1.5,t))*2.;
    float str=mix(1., .35+.65*(gnoise(vec2(sx*14.,t*3.))*.5+.5), u_p[3]);
    float k=edge*up*str;
    vec3 cl=mix(u_c[2], u_c[3], smoothstep(.0,.25,d));
    col+=cl*k*(1.2+u_p[2]*1.5)*(1.-fi*.25);
    col+=u_c[2]*exp(-abs(d)*120.)*edge*.3;
  }
  if(u_p[6]>.05){
    float gy=-.36+fbm4(vec2(uv.x*1.6+SEED2.y,1.))*.08;
    float cell=uv.x*55.; float cx=fract(cell)-.5; float th=hash11(floor(cell)+SEED2.x)*.07+.02;
    float tree=step(abs(cx), .45*(1.-(uv.y-gy)/th))*step(gy, uv.y)*step(uv.y, gy+th)*step(.35,hash11(floor(cell)*1.3));
    float g=smoothstep(gy+PX*1.5, gy-PX*1.5, uv.y);
    float m=max(g, tree)*smoothstep(0.,.1,u_p[6]);
    col=mix(col, u_c[0]*.02, m);
  }
  return col;
}`,
  };

  E.silk = {
    name: 'İpek Akış Degradesi',
    params: ['Ölçek', 'Akış', 'Parlaklık', 'Kıvrım', 'Vurgu rengi', 'Yumuşaklık', 'Açı', 'Hız'],
    glsl: `
float silkH(vec2 p){
  float t=u_time*.04*(.2+u_p[7]);
  for(int i=1;i<7;i++){
    float fi=float(i);
    p+=vec2(.55/fi*sin(fi*p.y*1.1+t+SEED2.x+.3*fi), .55/fi*sin(fi*p.x*.9+t*1.3+SEED2.y))*mix(.25,1.1,u_p[1]);
  }
  return .5+.5*sin(p.x*mix(1.,2.6,u_p[3])+p.y*.7);
}
vec3 scene(vec2 uv, vec2 st){
  vec2 p=rot(u_p[6]*TAU)*uv*mix(1.,3.2,u_p[0]);
  float e=.004; float h=silkH(p), hx=silkH(p+vec2(e,0)), hy=silkH(p+vec2(0,e));
  vec3 n=normalize(vec3((h-hx)/e, (h-hy)/e, mix(4.,14.,u_p[5])));
  vec3 L=normalize(vec3(-.4,.6,.7));
  float dif=sat(dot(n,L));
  float spec=pow(sat(dot(reflect(-L,n), vec3(0,0,1))), 30.)*u_p[2];
  vec3 col=mix(u_c[0]*.3, u_c[1], smoothstep(.0,1.,h));
  col=mix(col, u_c[3], u_p[4]*smoothstep(.55,1.,h)*.8);
  col*=.35+.9*dif;
  col+=u_c[2]*spec*2.5+u_c[2]*pow(h,6.)*.3*u_p[2];
  return col;
}`,
  };

  E.dunes = {
    name: 'Çöl Kum Tepeleri',
    params: ['Ufuk yüksekliği', 'Güneş X', 'Güneş yüksekliği', 'Kum tepesi sayısı', 'Sırt keskinliği', 'Sıcak pus', 'Kum dalgacıkları', 'Toz'],
    glsl: `
float duneY(float x, float fi, float k){ float n=gnoise(vec2(x, fi*5.1+SEED2.y)); float c=pow(1.-min(abs(n)*1.6,1.), mix(1.,2.2,k-.8)); return c*.75+gnoise(vec2(x*.35, fi*2.3+SEED2.x))*.5; }
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.2,.08,u_p[0]);
  vec2 sun=vec2((u_p[1]-.5)*A*.8, hz+mix(.0,.35,u_p[2]));
  vec3 col=skyGrad(uv, hz, sun, .035, .6);
  col=mix(col, u_c[1]*1.1, u_p[5]*.5*exp(-max(uv.y-hz,0.)*6.));
  float sdir=sign(sun.x+.0001);
  int N=3+int(u_p[3]*3.99);
  for(int i=0;i<7;i++){
    if(i>=N) break;
    float fi=float(i)/float(N-1);
    float freq=mix(1.1,2.2,fi); float amp=mix(.05,.17,fi);
    float base=hz+mix(.0,-.4,fi);
    float x=uv.x*freq+float(i)*9.7+SEED2.x;
    float k=mix(.8,1.6,u_p[4]);
    float y=base+duneY(x,float(i),k)*amp;
    float yx=base+duneY(x+.004,float(i),k)*amp;
    float slope=(yx-y)/.004*sdir;
    float m=smoothstep(y+PX*1.5, y-PX*1.5, uv.y);
    vec3 lit=mix(u_c[2]*.9, u_c[1]*1.2, .4);
    vec3 shd=lit*.42*mix(vec3(1.),u_c[3]/max(lum(u_c[3]),.05),.25)+u_c[0]*.1;
    float sdepth=sat(-slope*.6+.15)*amp*1.3;
    float dyc=y-uv.y;
    vec3 lc=mix(lit*(1.-sat(dyc/amp)*.35), shd, smoothstep(sdepth+PX*2., sdepth-PX*2., dyc));
    float rip=sin((uv.x*70.+uv.y*260.+gnoise(uv*8.+fi)*6.)*mix(1.,2.,fi))*.5+.5;
    lc*=1.-u_p[6]*.08*rip*fi*fi;
    float far=1.-fi;
    lc=mix(lc, col*.9+u_c[1]*.15, far*far*(.5+.4*u_p[5]));
    col=mix(col, lc, m);
  }
  float dust=fbm(uv*vec2(1.,3.)+vec2(u_time*.02,0.)+SEED2)*.5+.5;
  col=mix(col, u_c[1]*.8+u_c[2]*.2, u_p[7]*.35*dust*smoothstep(.2,-.3,uv.y-hz));
  return col;
}`,
  };

  E.anamorphic = {
    name: 'Anamorfik Işık & Flare',
    params: ['Işık sayısı', 'Çizgi uzunluğu', 'Hayalet yansımalar', 'Pus', 'Parlaklık', 'Dağılım', 'Bokeh', 'Hareket'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec3 col=mix(u_c[0]*.25, u_c[1]*.25, smoothstep(-.6,.6,uv.y))*(.4+.6*u_p[3]);
  col+=u_c[1]*.15*u_p[3]*(fbm(uv*1.5+SEED2)*.5+.5);
  int N=1+int(u_p[0]*9.);
  float t=u_time*.02*(.2+u_p[7]);
  for(int i=0;i<10;i++){
    if(i>=N) break;
    float fi=float(i);
    vec2 h=hash22(vec2(fi*3.1, 7.7)+SEED2);
    vec2 p=vec2((h.x-.5)*A*mix(.3,.95,u_p[5]), (h.y-.5)*mix(.15,.8,u_p[5]))+vec2(sin(t+fi),cos(t*.7+fi))*.02;
    vec2 d=uv-p;
    float br=(.4+hash11(fi+SEED2.x)*1.)*(.5+1.5*u_p[4]);
    vec3 lc=hash11(fi*7.+SEED2.y)<.6?u_c[2]:u_c[3];
    col+=lc*br*(exp(-length(d)*60.)*2.+exp(-length(d)*12.)*.35);
    float sl=mix(1.5,.25,u_p[1]);
    col+=mix(lc,u_c[3],.6)*br*exp(-abs(d.y)*mix(500.,160.,u_p[1]))*exp(-abs(d.x)*sl)*.9;
    if(u_p[2]>.02){
      for(int g=1;g<4;g++){
        float fg=float(g);
        vec2 gp=-p*(.35+fg*.45);
        float rr=.02+.03*fg*hash11(fi+fg);
        float q=length(uv-gp);
        col+=mix(u_c[3],u_c[2],fg/3.)*br*u_p[2]*.12*(smoothstep(rr,rr*.85,q)*.5+smoothstep(rr*.9,rr,q)*smoothstep(rr*1.05,rr,q));
      }
    }
  }
  if(u_p[6]>.02){
    vec2 g=uv*7.; vec2 id=floor(g);
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
      vec2 cid=id+vec2(i,j); if(hash12(cid+SEED2)>.25) continue;
      vec2 c=(cid+hash22(cid))/7.; float rr=.03+.05*hash12(cid+4.);
      float q=length(uv-c);
      col+=mix(u_c[2],u_c[3],hash12(cid+1.))*u_p[6]*.18*smoothstep(rr,rr*.88,q);
    }
  }
  return col;
}`,
  };

  E.smoke = {
    name: 'Duman & Mürekkep',
    params: ['Yoğunluk', 'Girdap', 'Sol ışık', 'Sağ ışık', 'Ölçek', 'Tutam inceliği', 'Kor parçacıkları', 'Hız'],
    glsl: `
float smokeD(vec2 p, float t){
  vec3 q=vec3(p, t);
  float w=fbm3(q*1.2+vec3(0,0,t*.5));
  vec2 pp=p+vec2(w,-w)*mix(.5,2.5,u_p[1]);
  float d=fbm3(vec3(pp*1.6, t*.8)+3.);
  float rd=1.-abs(d*2.-1.);
  return mix(d, pow(rd, mix(1.,6.,u_p[5])), u_p[5]*.8);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.02+.08*u_p[7]);
  vec2 p=uv*mix(1.,3.,u_p[4])+SEED2+vec2(0.,-t*.8);
  float d=smokeD(p,t);
  float dl=smokeD(p+vec2(-.04,.02),t);
  float dr=smokeD(p+vec2(.04,.02),t);
  float dens=smoothstep(mix(.7,.35,u_p[0]), 1., d);
  vec3 col=u_c[0]*.15*(1.-length(uv)*.6);
  float ll=sat((d-dl)*8.+.5)*smoothstep(.9,-.6,uv.x/A*2.);
  float lr=sat((d-dr)*8.+.5)*smoothstep(-.9,.6,uv.x/A*2.);
  col+=u_c[1]*dens*.35;
  col+=u_c[2]*dens*ll*(.3+2.2*u_p[2]);
  col+=u_c[3]*dens*lr*(.3+2.2*u_p[3]);
  col+=(u_c[2]+u_c[3])*pow(dens,3.)*.25;
  col+=mix(u_c[2],vec3(1.,.6,.25),.5)*(sparkles(uv,60.,u_p[6]*.35,.03)+sparkles(uv,120.,u_p[6]*.3,.05)*.6)*2.5;
  return col;
}`,
  };

  E.storm = {
    name: 'Fırtına Bulutları',
    params: ['Bulut örtüsü', 'Bulut ölçeği', 'Işık yarığı', 'Yarık X', 'Şimşek', 'Yağmur perdesi', 'Ufuk / zemin', 'Hareket'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.004+.03*u_p[7]);
  vec2 p=uv*vec2(1.,1.6)*mix(1.,2.6,u_p[1])+SEED2+vec2(t,0.);
  float c=fbm(p)+.5;
  float cl=fbm(p+vec2(.03,.05))+.5;
  float cov=mix(.75,.2,u_p[0]);
  float dens=smoothstep(cov-.2, cov+.35, c);
  float light=sat((c-cl)*9.+.5);
  vec2 gap=vec2((u_p[3]-.5)*A*.8, .2);
  float gd=length((uv-gap)*vec2(.8,1.3));
  vec3 sky=mix(u_c[1]*.3, u_c[2]*.7, exp(-gd*4.5)*u_p[2]);
  vec3 cloud=mix(u_c[0]*.06, u_c[1]*.4, light*light);
  cloud+=u_c[2]*exp(-gd*3.5)*u_p[2]*light*.6;
  vec3 col=mix(sky, cloud, dens);
  float tb=floor(u_time*.7+SEED2.x);
  float fl=step(.6,hash11(tb))*exp(-fract(u_time*.7)*6.);
  vec2 lp=vec2((hash11(tb+1.)-.5)*A*.8, hash11(tb+2.)*.3);
  float lg=exp(-length(uv-lp)*4.)*u_p[4]*(.35+fl*3.);
  col+=u_c[3]*lg*(.5+dens);
  if(u_p[5]>.02){
    float rv=fbm4(vec2(uv.x*4.+SEED2.x, 0.)+t*2.)*.5+.5;
    vec2 g=uv*rot(.08)*vec2(160.,6.)+vec2(0.,u_time*7.);
    float ln=step(.7,hash12(floor(g)))*smoothstep(.45,.0,abs(fract(g.x)-.5));
    col=mix(col, u_c[1]*.5, u_p[5]*rv*.35*smoothstep(.3,-.3,uv.y));
    col+=u_c[1]*ln*u_p[5]*.12;
  }
  if(u_p[6]>.05){
    float gy=-.38+mix(-.1,.1,u_p[6])+fbm4(vec2(uv.x*1.2+SEED2.y,3.))*.05;
    col=mix(col, u_c[0]*.03, smoothstep(gy+PX*1.5, gy-PX*1.5, uv.y));
  }
  return col;
}`,
  };

  E.forest = {
    name: 'Sisli Orman',
    params: ['Ağaç sıklığı', 'Katman sayısı', 'Sis yoğunluğu', 'Işık huzmesi', 'Huzme X', 'Gövde kalınlığı', 'Zemin sisi', 'Zerreler'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec2 L=vec2((u_p[4]-.5)*A, .7);
  vec3 bg=mix(u_c[1], u_c[0]*.6, smoothstep(-.4,.6,uv.y));
  bg+=u_c[2]*exp(-length(uv-L)*2.)*.5;
  vec2 d=uv-L; vec2 dir=normalize(d);
  float rays=pow(sat(.5+gnoise(dir*7.+SEED2)*.9+gnoise(dir*19.)*.3),3.)*exp(-length(d)*.9)*u_p[3];
  vec3 col=bg;
  int N=3+int(u_p[1]*4.99);
  for(int i=0;i<8;i++){
    if(i>=N) break;
    float fi=float(i)/float(N-1);
    float sc=mix(14.,3.,fi)*mix(.6,1.4,u_p[0]);
    float x=uv.x*sc+float(i)*13.7+SEED2.x;
    float wob=gnoise(vec2(x*.3, uv.y*2.+float(i)))*.12;
    float cx=fract(x+wob)-.5; float id=floor(x+wob);
    float present=step(.45, hash11(id+float(i)*3.1));
    float w=mix(.05,.16,hash11(id*1.7))*mix(.5,1.6,u_p[5])*(1.+ (.5-uv.y)*.15);
    float trunk=smoothstep(w+PX*sc*1.5, w-PX*sc*1.5, abs(cx+(hash11(id)-.5)*.5))*present;
    vec3 tc=mix(bg*.9, u_c[0]*.04, pow(fi,.6));
    tc=mix(tc, bg, (1.-fi)*u_p[2]*.75);
    col=mix(col, tc, trunk);
  }
  col+=u_c[2]*rays*.6*(.6+.4*u_p[2]);
  col*=1.-smoothstep(.25,.6,uv.y)*(fbm4(uv*vec2(3.,2.)+SEED2)*.5+.5)*.8;
  float gf=smoothstep(.0,-.45,uv.y)*u_p[6]*(fbm(uv*vec2(2.,5.)+SEED2+vec2(u_time*.01,0.))*.5+.6);
  col=mix(col, u_c[1]*1.1+u_c[2]*.1, gf*.7);
  col+=u_c[2]*sparkles(uv,70.,u_p[7]*.4,-.01)*(rays*4.+.2);
  return col;
}`,
  };

  E.planet = {
    name: 'Gezegen Ufku',
    params: ['Gezegen boyutu', 'Ufuk yüksekliği', 'Merkez X', 'Güneş açısı', 'Atmosfer', 'Yüzey dokusu', 'Gece şehir ışıkları', 'Yıldızlar'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float R=mix(1.2,4.,u_p[0]);
  float hz=mix(-.35,.1,u_p[1]);
  vec2 C=vec2((u_p[2]-.5)*A*.8, hz-R);
  vec2 q=uv-C; float d=length(q);
  float sa=mix(-.9,.9,u_p[3]);
  vec3 sunD=normalize(vec3(sin(sa), .35, -.25));
  vec2 sunP=C+vec2(sin(sa),cos(sa))*R*1.012;
  vec3 col=u_c[0]*.08+starfield(uv, .2+.8*u_p[7]);
  float atm=mix(30.,8.,u_p[4]);
  if(d<R){
    vec2 nq=q/R; vec3 n=vec3(nq, sqrt(max(1.-dot(nq,nq),0.)));
    float lit=sat(dot(n,sunD)*1.3+.1);
    vec2 tp=n.xy/(n.z+.35)*3.+SEED2;
    float tex=fbm(tp)*.5+.5; float clouds=smoothstep(.45,.8,fbm(tp*1.7+7.)*.5+.5);
    vec3 surf=mix(u_c[1]*.5, u_c[1]*1.2+u_c[3]*.2, tex*u_p[5]+.3*(1.-u_p[5]));
    surf=mix(surf, vec3(.9), clouds*.6*u_p[5]);
    col=surf*lit;
    float city=step(.78,vnoise(tp*14.))*smoothstep(.2,.0,lit)*u_p[6];
    col+=u_c[2]*city*.6;
    float rim=pow(1.-n.z, 3.);
    col+=u_c[3]*rim*(.3+lit*1.5)*u_p[4];
  } else {
    float h=d-R;
    float glow=exp(-h*atm);
    float toward=sat(dot(normalize(q), normalize(sunP-C))*.5+.5);
    col+=mix(u_c[3], u_c[2], toward*toward)*glow*(.25+1.6*pow(toward,4.))*u_p[4]*1.5;
  }
  float sd=length(uv-sunP);
  col+=u_c[2]*(exp(-sd*35.)*4.+exp(-sd*6.)*.5);
  col+=u_c[2]*exp(-abs(uv.y-sunP.y)*300.)*exp(-abs(uv.x-sunP.x)*2.)*.8;
  return col;
}`,
  };

  E.synthwave = {
    name: 'Retro Gün Batımı',
    params: ['Ufuk', 'Güneş boyutu', 'Güneş şeritleri', 'Izgara parlaklığı', 'Dağlar', 'Yıldızlar', 'Izgara hızı', 'Pus'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.2,.05,u_p[0]);
  vec3 col=mix(u_c[3]*.9, u_c[0]*.5, smoothstep(hz,hz+.55,uv.y));
  col+=starfield(uv, u_p[5])*smoothstep(hz+.1,hz+.4,uv.y);
  float sr=mix(.12,.3,u_p[1]); vec2 sp=vec2(0., hz+sr*.55);
  float sd=length(uv-sp);
  float sy=(uv.y-sp.y)/sr;
  float stripes=step(.0, sin((sy*18.+u_time*.5))-mix(-1.,.6,u_p[2])*smoothstep(.3,-1.,sy));
  vec3 sunc=mix(u_c[3]*1.4, u_c[2]*1.6, smoothstep(-1.,1.,sy));
  col+=u_c[3]*exp(-sd*4.)*.4;
  col=mix(col, sunc, smoothstep(sr, sr-PX*2., sd)*stripes*step(hz,uv.y));
  if(u_p[4]>.05){
    float my=hz+ridged(vec2(uv.x*2.5+SEED2.x, 1.),5)*.12*u_p[4];
    col=mix(col, u_c[0]*.4+u_c[3]*.05, smoothstep(my+PX*1.5,my-PX*1.5,uv.y)*step(hz,uv.y));
  }
  if(uv.y<hz){
    float dy=hz-uv.y; float z=1./dy;
    vec2 g=vec2(uv.x*z, z+u_time*mix(.2,2.,u_p[6]));
    vec2 gf=abs(fract(g*.5)-.5)/(fwidth(g*.5)+1e-4);
    float line=1.-min(min(gf.x,gf.y),1.);
    col=mix(u_c[0]*.15, u_c[1]*.2, exp(-dy*6.));
    col+=u_c[3]*line*(.4+u_p[3]*2.)*exp(-dy*1.5);
    col+=u_c[3]*exp(-dy*40.)*.8;
  }
  col=mix(col, u_c[3]*.5, u_p[7]*.35*exp(-abs(uv.y-hz)*10.));
  return col;
}`,
  };

  E.underwater = {
    name: 'Su Altı Işığı',
    params: ['Derinlik', 'Kostik desenler', 'Işık huzmeleri', 'Yüzey X', 'Partiküller', 'Bulanıklık', 'Zemin', 'Akıntı'],
    glsl: `
float caustic(vec2 p, float t){
  vec2 i=p; float c=1.;
  for(int n=0;n<4;n++){ float tt=t*(1.-3.5/float(n+1)); i=p+vec2(cos(tt-i.x)+sin(tt+i.y), sin(tt-i.y)+cos(tt+i.x)); c+=1./length(vec2(p.x/(sin(i.x+tt)/.005), p.y/(cos(i.y+tt)/.005))); }
  c/=4.; c=1.17-pow(c,1.4); return pow(abs(c),8.);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.1+.4*u_p[7]);
  float depth=mix(.4,1.6,u_p[0]);
  vec3 col=mix(u_c[0]*.2, u_c[1]*1.1, smoothstep(-.6,.6,uv.y)/depth);
  vec2 L=vec2((u_p[3]-.5)*A, .9);
  vec2 d=uv-L; vec2 dir=normalize(d);
  float rays=pow(sat(.5+gnoise(vec2(dir.x*18.+t*.4, t*.2)+SEED2)*.9),3.)*exp(-length(d)*mix(1.5,.6,u_p[2]))*u_p[2];
  col+=u_c[2]*rays*1.3;
  float gy=-.32;
  if(u_p[6]>.05 && uv.y<gy+.06){
    float gh=gy+fbm4(vec2(uv.x*3.+SEED2.x,0.))*.06*u_p[6];
    float m=smoothstep(gh+PX*1.5, gh-PX*1.5, uv.y);
    vec2 cp=vec2(uv.x*6./(1.+(gh-uv.y)*4.), (gh-uv.y)*14.)+SEED2;
    float cs=caustic(cp*1.2, t)*u_p[1];
    vec3 fl=mix(u_c[1]*.4, u_c[3]*.5, fbm4(cp)*.5+.5)*(.6+cs*1.5);
    col=mix(col, fl, m*u_p[6]);
  } else {
    col+=u_c[2]*caustic(uv*5.+SEED2, t)*.15*u_p[1]*smoothstep(-.2,.5,uv.y);
  }
  col+=mix(u_c[2],vec3(1.),.4)*(sparkles(uv,40.,u_p[4]*.4,.02)+sparkles(uv,90.,u_p[4]*.4,.03)*.6)*.7;
  col=mix(col, u_c[1]*.7, u_p[5]*.4*(fbm(uv*2.+t*.1)*.5+.5));
  return col;
}`,
  };

  E.battlefield = {
    name: 'Savaş Alanı',
    params: ['Duman yoğunluğu', 'Yangın parıltısı', 'Yıkıntı siluetleri', 'Kor & kıvılcım', 'Uzak patlamalar', 'Ufuk yüksekliği', 'Güneş / ay', 'Rüzgar'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.01+.05*u_p[7]);
  float hz=mix(-.3,-.02,u_p[5]);
  vec2 sun=vec2((hash11(SEED2.x)-.5)*A*.7, hz+.28);
  vec3 col=skyGrad(uv, hz, sun, .025, .4*u_p[6]+.1)*mix(.3,1.,u_p[6]);
  vec2 sp=uv*vec2(1.2,2.)+SEED2+vec2(t,-t*.3);
  float sm=fbm(sp)+.5; float sml=fbm(sp+vec2(.04,-.06))+.5;
  float sd=smoothstep(mix(.6,.05,u_p[0]), .9, sm);
  float fireL=exp(-max(uv.y-hz,0.)*mix(9.,3.,u_p[1]))*u_p[1];
  vec3 smk=mix(u_c[0]*.18, u_c[1]*.45, sat((sm-sml)*6.+.5));
  smk+=u_c[2]*fireL*.8*(1.-sd*.3);
  col=mix(col, smk, sd*.92);
  col+=u_c[2]*fireL*.35;
  for(int i=0;i<4;i++){
    float fi=float(i); float tb=floor(u_time*.25+fi*.37+SEED2.y);
    float fl=exp(-fract(u_time*.25+fi*.37)*4.)*step(.45,hash11(tb+fi));
    vec2 ep=vec2((hash11(tb*1.3+fi)-.5)*A*.9, hz+.01);
    col+=u_c[3]*exp(-length((uv-ep)*vec2(1.,1.8))*9.)*fl*u_p[4]*2.5;
  }
  if(u_p[2]>.05){
    float x=uv.x*9.+SEED2.x; float id=floor(x); float fx=fract(x);
    float h=hash11(id); float bh=hz+.02+pow(h,2.)*.18*u_p[2];
    float jag=gnoise(vec2(uv.x*60.,id))*.03+gnoise(vec2(uv.x*14.,id))*.05;
    float win=step(.5,fract(fx*5.))*step(.5,fract(uv.y*40.))*step(.75,hash12(vec2(id,floor(uv.y*40.))));
    float ruin=smoothstep(bh+jag+PX*1.5, bh+jag-PX*1.5, uv.y)*step(.3,h);
    vec3 rc=u_c[0]*.03+u_c[2]*win*fireL*.12;
    col=mix(col, rc, ruin);
    float x2=uv.x*3.+SEED2.y; float h2=hash11(floor(x2));
    float far=smoothstep(hz+.05+h2*.1*u_p[2]+PX, hz+.05+h2*.1*u_p[2]-PX, uv.y)*step(.5,h2);
    col=mix(col, mix(smk,u_c[0]*.1,.5), far*.6*(1.-ruin));
  }
  float gy=hz+fbm4(vec2(uv.x*2.+SEED2.x,5.))*.03-.01;
  float gm=smoothstep(gy+PX*1.5, gy-PX*1.5, uv.y);
  vec3 ground=u_c[0]*.04+u_c[2]*fireL*.08*(fbm4(uv*vec2(6.,30.))*.5+.5);
  ground=mix(ground, smk*.5, (1.-smoothstep(gy-.2,gy,uv.y))*.0+smoothstep(gy-.12,gy,uv.y)*.5*u_p[0]);
  col=mix(col, ground, gm);
  col+=mix(u_c[2],vec3(1.,.55,.2),.6)*(sparkles(uv*rot(-.3),55.,u_p[3]*.4,.06)+sparkles(uv,110.,u_p[3]*.35,.09)*.7)*3.;
  return col;
}`,
  };

  E.skyline = {
    name: 'Şehir Silueti',
    params: ['Ufuk yüksekliği', 'Bina yoğunluğu', 'Gökdelen yüksekliği', 'Pencere ışıkları', 'Pus', 'Ay / güneş', 'Katman sayısı', 'Su yansıması'],
    glsl: `
float bld(float x, float fi, out float idOut){
  float sc=mix(8.,26.,u_p[1])*(1.+fi*.6);
  float xx=x*sc+fi*31.+SEED2.x; float id=floor(xx); idOut=id;
  float h=hash11(id+fi*7.); float h2=hash11(id*1.7+3.);
  float base=pow(h,2.2)*mix(.12,.42,u_p[2])*(1.-fi*.45)+.02;
  if(h2>.9) base+=.08*(1.-fi*.5);
  float fx=fract(xx);
  if(h2>.82 && fx>.42 && fx<.58) base+=.05;
  return base;
}
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.32,-.05,u_p[0]);
  vec2 sun=vec2((hash11(SEED2.y)-.5)*A*.6, hz+.3);
  vec3 sky=skyGrad(uv, hz, sun, .03, .5*u_p[5]+.1);
  vec3 col=sky; vec2 p=uv;
  bool water=u_p[7]>.05 && uv.y<hz;
  if(water){ p.y=hz+(hz-uv.y)+gnoise(vec2(uv.x*30., uv.y*200.+u_time))*.004*(hz-uv.y)*20.; }
  int N=1+int(u_p[6]*2.99);
  for(int i=2;i>=0;i--){
    if(i>=N) continue;
    float fi=float(i);
    float id; float bh=bld(p.x, fi, id);
    float top=hz+bh;
    float m=smoothstep(top+PX*1.5, top-PX*1.5, p.y)*step(hz-.001,p.y);
    vec3 bc=mix(u_c[0]*.05, mix(sky,u_c[1]*.5,.5), fi*.45+u_p[4]*fi*.3);
    vec2 wg=vec2(p.x*mix(8.,26.,u_p[1])*(1.+fi*.6)*6., p.y*110.*(1.+fi*.5));
    float win=step(.35,fract(wg.x))*step(.4,fract(wg.y))*step(1.-u_p[3]*.6, hash12(floor(wg)+id));
    bc+=mix(u_c[2],u_c[3],hash12(floor(wg)*.3))*win*(1.-fi*.5)*.9;
    col=mix(col, bc, m);
  }
  col=mix(col, u_c[1]*.6+u_c[2]*.05, u_p[4]*.5*exp(-abs(uv.y-hz)*8.));
  if(water){ col*=.55; col=mix(col, u_c[0]*.1, smoothstep(0.,.3,hz-uv.y)*.5); }
  else if(uv.y<hz){ col=u_c[0]*.03; }
  return col;
}`,
  };

  E.hall = {
    name: 'İç Mekan Işık Salonu',
    params: ['Pencere sayısı', 'Pencere ışığı', 'Işık açısı', 'Toz & pus', 'Ön plan sütunları', 'Pencere yüksekliği', 'Zemin yansıması', 'Zerreler'],
    glsl: `
float winMask(vec2 p){
  float n=floor(mix(3.,7.99,u_p[0]));
  float span=A*.86;
  float x=(p.x+span*.5)/span*n;
  if(x<0.||x>n) return 0.;
  float fx=fract(x)-.5;
  float ww=.26;
  float y0=-.06, y1=mix(.18,.4,u_p[5]);
  float inX=step(abs(fx), ww);
  float ay=(p.y-y1)/(span/n);
  float arch=step(ay*ay+fx*fx*0.0+ (fx*fx)/(ww*ww)*ww*ww, ww*ww);
  float body=inX*step(y0,p.y)*step(p.y,y1);
  float top=step(y1,p.y)*step(length(vec2(fx, ay)), ww);
  float m=max(body, top);
  float mull=step(.025, abs(fx))*step(.02, abs(fract((p.y-y0)*9.)-.5));
  return m*mull;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*.01;
  float floorY=-.18;
  vec3 col=mix(u_c[0]*.05, u_c[1]*.12, smoothstep(-.5,.5,uv.y));
  float haze=fbm(uv*2.+SEED2+vec2(t,0.))*.5+.5;
  float w=winMask(uv);
  col=mix(col, u_c[2]*(1.2+2.*u_p[1])+u_c[3]*.15, w);
  vec2 Ls=vec2(mix(-1.,1.,u_p[2])*A*.55, 1.25);
  vec2 dir=normalize(Ls-uv);
  float acc=0.;
  for(int i=1;i<=24;i++){
    float fi=float(i);
    vec2 sp=uv+dir*fi*.028;
    acc+=winMask(sp)*(1.-fi/26.);
  }
  acc/=12.;
  float vol=acc*(.35+u_p[3]*.9*haze);
  col+=u_c[2]*vol*u_p[1]*1.6*(1.-w);
  if(uv.y<floorY){
    float fd=floorY-uv.y;
    vec3 fl=u_c[0]*.04+u_c[1]*.03;
    vec2 rp=vec2(uv.x, floorY+fd*1.2);
    fl+=u_c[2]*winMask(rp+vec2(gnoise(uv*vec2(4.,40.))*.01,0.))*u_p[6]*.6*exp(-fd*4.);
    fl+=u_c[2]*acc*u_p[1]*.9;
    col=mix(col, fl, smoothstep(floorY+PX, floorY-PX, uv.y));
  }
  if(u_p[4]>.05){
    float x=abs(uv.x)/(A*.5);
    float c=smoothstep(1.-u_p[4]*.22-PX*4., 1.-u_p[4]*.22, x);
    col=mix(col, u_c[0]*.01, c);
  }
  col+=u_c[3]*.04*haze*u_p[3];
  col+=u_c[2]*sparkles(uv,70.,u_p[7],-.005)*(vol*4.+.05);
  return col;
}`,
  };

  E.castle = {
    name: 'Kale & Kule Silüeti',
    params: ['Ufuk', 'Kale boyutu', 'Kule sayısı', 'Kale X', 'Sis', 'Ay / güneş', 'Pencere ışıkları', 'Kuşlar / kül'],
    glsl: `
float castleH(float x, float cx, float sz){
  float lx=(x-cx)/sz;
  if(abs(lx)>1.2) return -1.;
  float h=.10*smoothstep(1.2,.9,abs(lx));
  float n=mix(2.,7.,u_p[2]);
  float tid=floor((lx+1.2)*n*.5); float tf=fract((lx+1.2)*n*.5);
  float th=hash11(tid+SEED2.x)*.25+.1;
  float tw=step(.35,tf)*step(tf,.65);
  h=max(h, (th*smoothstep(1.2,.2,abs(lx))+.08)*tw);
  float spire=max(0., .06-abs(tf-.5)*.4)*tw*step(.5,hash11(tid*3.1));
  h+=spire;
  float bat=step(.5,fract(lx*60.))*.008;
  return h*sz*2.4+bat*(1.-tw);
}
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.3,-.05,u_p[0]);
  vec2 sun=vec2((u_p[3]>.5? -.25:.25)*A, hz+.28);
  vec3 col=skyGrad(uv, hz, sun, .045, .2+.6*u_p[5]);
  float cl=fbm(vec2(uv.x*1.4,uv.y*5.)+SEED2+u_time*.003);
  col=mix(col, u_c[0]*.4+u_c[1]*.2, smoothstep(.1,.5,cl)*.5);
  float ry=hz+ridged(vec2(uv.x*1.5+SEED2.x,2.),5)*.1+.04;
  float cx=(u_p[3]-.5)*A*.7; float sz=mix(.12,.35,u_p[1]);
  float ch=castleH(uv.x, cx, sz);
  float rid=ry+max(ch,0.)*step(0.,ch);
  float m=smoothstep(rid+PX*1.5, rid-PX*1.5, uv.y);
  vec3 sil=u_c[0]*.04;
  float win=step(.8,hash12(floor(uv*vec2(160.,90.))))*step(ry+.01,uv.y)*step(0.,ch)*u_p[6];
  sil+=u_c[2]*win*1.5;
  col=mix(col, sil, m);
  float fgy=hz-.12+fbm4(vec2(uv.x*2.5+SEED2.y,7.))*.08;
  col=mix(col, u_c[0]*.01, smoothstep(fgy+PX*1.5,fgy-PX*1.5,uv.y));
  float mist=smoothstep(.12,-.05,abs(uv.y-ry+.02))*u_p[4]*(fbm(uv*vec2(2.,6.)+u_time*.01)*.5+.6);
  col=mix(col, u_c[1]*.7+u_c[2]*.08, mist*.7);
  col+=u_c[1]*sparkles(uv,50.,u_p[7]*.3,.015)*.6;
  return col;
}`,
  };

  /* ---------- v2 motorları ---------- */
  const VORO = `
vec3 voro(vec2 x, float t){
  vec2 n=floor(x), f=fract(x); float md=8., md2=8.; vec2 mr=vec2(0);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g=vec2(i,j); vec2 o=hash22(n+g+SEED2); o=.5+.45*sin(t+TAU*o);
    vec2 r=g+o-f; float d=dot(r,r);
    if(d<md){ md2=md; md=d; mr=r; } else if(d<md2) md2=d;
  }
  return vec3(sqrt(md), sqrt(md2)-sqrt(md), hash12(n+floor(mr+f)));
}`;

  E.orbs = {
    name: 'Işık Küreleri & Degrade',
    params: ['Küre sayısı', 'Hareket genliği', 'Küre boyutu', 'Parlaklık', 'Doku', 'Işık çizgileri', 'Koyu zemin', 'Hız'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.02+.1*u_p[7]);
  vec3 col=u_c[0]*mix(.5,.08,u_p[6]);
  int N=3+int(u_p[0]*6.99);
  for(int i=0;i<10;i++){
    if(i>=N) break;
    float fi=float(i);
    vec2 h=hash22(vec2(fi*1.7,3.1)+SEED2);
    vec2 p=(h-.5)*vec2(A,1.)*.95+vec2(sin(t*(.6+h.x)+fi*2.1), cos(t*(.5+h.y)+fi*1.3))*.18*u_p[1];
    float r=mix(.12,.5,hash11(fi*3.7+SEED2.x))*mix(.6,1.5,u_p[2]);
    float k=mod(fi,4.);
    vec3 cl=k<1.?u_c[2]:(k<2.?u_c[1]*1.6:(k<3.?u_c[3]:mix(u_c[2],u_c[3],.5)));
    col+=cl*exp(-pow(length(uv-p)/r,2.)*2.2)*mix(.35,1.5,u_p[3]);
  }
  col*=1.+fbm(uv*2.5+t*.5+SEED2)*u_p[4]*.6;
  if(u_p[5]>.05){
    vec2 q=rot(.35)*uv; float l=0.;
    for(int i=0;i<4;i++){ float fi=float(i); l+=exp(-abs(q.y-(hash11(fi+SEED2.y)-.5)*.8-sin(q.x*1.5+t+fi)*.05)*mix(260.,90.,hash11(fi*2.)))*(.4+.6*hash11(fi+5.)); }
    col+=mix(u_c[2],vec3(1.),.4)*l*u_p[5]*.6;
  }
  return col;
}`,
  };

  E.rainglass = {
    name: 'Yağmurlu Cam',
    params: ['Damla yoğunluğu', 'Akan damlalar', 'Bokeh boyutu', 'Kırılma', 'Buğu', 'Işık yoğunluğu', 'Arka plan bulanıklığı', 'Akış hızı'],
    glsl: `
vec3 bgLights(vec2 uv){
  vec3 col=mix(u_c[1]*.35, u_c[0]*.4, smoothstep(-.5,.6,uv.y));
  for(int L=0;L<2;L++){
    float sc=mix(4.,9.,float(L)); vec2 g=uv*sc; vec2 id=floor(g);
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
      vec2 cid=id+vec2(i,j); float h=hash12(cid+float(L)*9.+SEED2);
      if(h>mix(.06,.3,u_p[5])) continue;
      vec2 c=(cid+hash22(cid+3.))/sc;
      float rad=(.25+.5*hash12(cid+5.))*mix(.5,1.3,u_p[2])/sc;
      float d=length(uv-c)/rad;
      float k=hash12(cid+8.);
      vec3 cl=k<.4?u_c[2]:(k<.75?u_c[3]:u_c[1]*2.);
      col+=cl*smoothstep(1.,mix(.9,.3,u_p[6]),d)*(.15+.45*hash12(cid+1.));
    }
  }
  return col;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.2+.8*u_p[7]);
  vec2 g=uv*mix(14.,34.,u_p[0]); vec2 id=floor(g); vec2 f=fract(g)-.5;
  vec2 o=(hash22(id+SEED2)-.5)*.6; float r=.06+.2*hash12(id+3.);
  float sd=length(f-o);
  float drop=smoothstep(r, r*.75, sd)*step(.35,hash12(id+7.));
  vec2 n=(f-o)/max(r,.01)*drop;
  float cx=uv.x*mix(4.,10.,u_p[1]); float cid=floor(cx); float fx=fract(cx)-.5;
  float hh=hash11(cid+SEED2.x);
  float y=fract(-t*(.05+.08*hh)+hh)*1.4-.7;
  vec2 dp=vec2((fx+sin(uv.y*20.+hh*9.)*.05)*.9, (uv.y-y)*mix(4.,10.,u_p[1])*.35);
  float rd=length(dp*vec2(1.,1.3));
  float run=smoothstep(.2,.14,rd)*step(.45,hh)*u_p[1];
  float trail=smoothstep(.06,.0,abs(fx))*smoothstep(y, y+.35, uv.y)*smoothstep(y+.6,y,uv.y)*step(.45,hh)*u_p[1];
  vec2 nr=dp/.2*run;
  vec2 N=n+nr;
  float m=max(drop, run);
  vec3 bg=bgLights(uv);
  vec3 refr=bgLights(uv-N*.12*mix(.3,1.5,u_p[3]));
  vec3 col=mix(bg, refr*1.15, m);
  col=mix(col, col*.7+mix(u_c[1],u_c[2],.3)*.18, u_p[4]*(1.-m)*(.6+.4*fbm(uv*3.+SEED2)));
  col+=vec3(1.)*pow(max(0.,1.-length(N-vec2(.3,.4))),6.)*m*.25;
  col+=mix(u_c[2],vec3(1.),.5)*trail*.08;
  return col;
}`,
  };

  E.fire = {
    name: 'Alev Duvarı & Yangın',
    params: ['Alev genişliği', 'Alev yüksekliği', 'Türbülans', 'Parlaklık', 'Duman', 'Ön plan siluetleri', 'Kor', 'Hız'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.25+.9*u_p[7]);
  vec2 p=uv*vec2(mix(1.6,4.,u_p[0]),1.5)+SEED2;
  float n=fbm(p+vec2(0.,-t*1.1))+.55*fbm(p*2.1+vec2(1.3,-t*2.));
  float h=uv.y+.5;
  float flame=sat(1.-h*mix(2.8,1.15,u_p[1])+n*mix(.55,1.3,u_p[2]));
  flame=pow(flame,1.6);
  vec3 col=u_c[0]*.08;
  vec3 fc=mix(u_c[3]*.5, mix(u_c[2]*1.2, u_c[2]*1.6+vec3(.5,.4,.3), smoothstep(.7,1.,flame)), smoothstep(.15,.6,flame));
  col+=fc*smoothstep(.04,.3,flame)*mix(.3,1.2,u_p[3]);
  col+=u_c[2]*exp(-h*2.5)*.35*u_p[3];
  float sm=fbm(uv*1.8+vec2(t*.05,-t*.25)+7.)*.5+.5;
  col=mix(col, u_c[0]*.15+u_c[1]*.12+fc*.05, smoothstep(.0,.6,h-mix(.75,.35,u_p[1]))*sm*u_p[4]);
  if(u_p[5]>.05){
    float gy=-.42+fbm4(vec2(uv.x*2.+SEED2.y,4.))*.05;
    float cell=uv.x*mix(9.,18.,u_p[5])+SEED2.x; float id=floor(cell); float fx=fract(cell)-.5;
    float th=mix(.12,.42,hash11(id))*(.6+.6*u_p[5]);
    float tri=step(abs(fx), .48*(1.-(uv.y-gy)/th))*step(gy,uv.y)*step(uv.y,gy+th)*step(.3,hash11(id*1.7));
    float trunk=step(abs(fx),.03)*step(uv.y,gy+th*.25)*step(.3,hash11(id*1.7));
    float ground=smoothstep(gy+PX*1.5,gy-PX*1.5,uv.y);
    col=mix(col, u_c[0]*.01, max(max(tri,trunk),ground));
  }
  col+=vec3(1.,.5,.15)*(sparkles(uv,50.,u_p[6]*.4,.35)+sparkles(uv*rot(.2),100.,u_p[6]*.3,.5)*.7)*3.;
  return col;
}`,
  };

  E.tunnel = {
    name: 'Sonsuz Koridor & Tünel',
    params: ['Işık halkası sıklığı', 'Panel çizgileri', 'Halka parlaklığı', 'Uç ışığı', 'Kesit (kare↔geniş)', 'Derinlik sisi', 'Merkez kayması', 'Hız'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec2 p=uv-vec2((u_p[6]-.5)*.3, 0.);
  float sx=mix(1.,.55,u_p[4]);
  float r=max(abs(p.x)*sx, abs(p.y));
  r=max(r,.002);
  float z=.22/r+u_time*mix(.05,.8,u_p[7])+SEED2.x;
  float side=abs(p.x)*sx>abs(p.y)?p.y/r:p.x*sx/r;
  float ring=smoothstep(.04,.0,abs(fract(z*mix(.6,2.5,u_p[0]))-.5)-.465);
  float panel=smoothstep(.04,.0,abs(fract(side*mix(2.,7.,u_p[1])*.5+.5)-.5)-.46);
  float seam=smoothstep(.03,.0,abs(fract(z*mix(.6,2.5,u_p[0])*4.)-.5)-.47);
  float depth=exp(-(.22/r)*mix(.15,.8,u_p[5]));
  vec3 wall=u_c[0]*.1+u_c[1]*.14*(.4+.6*vnoise(vec2(side*6.,z*3.)));
  wall+=u_c[1]*.12*(panel+seam*.5);
  vec3 col=wall*(.15+r*1.2)*depth;
  col+=u_c[2]*ring*mix(.25,1.1,u_p[2])*(.08+r*.9)*depth;
  float floorRefl=step(p.y,0.)*step(abs(p.x)*sx,abs(p.y))*.3;
  col+=u_c[2]*ring*floorRefl*depth*.4;
  col+=u_c[3]*exp(-r*mix(40.,9.,u_p[3]))*1.4;
  col+=u_c[3]*(1.-depth)*.12*u_p[5];
  return col;
}`,
  };

  E.canyon = {
    name: 'Kanyon & Kaya Yarığı',
    params: ['Yarık genişliği', 'Duvar katmanları', 'Tabaka çizgileri', 'Tepe ışığı', 'Işık huzmesi', 'Pus', 'Kıvrım', 'Zemin kumu'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec3 sky=mix(u_c[2]*.8, u_c[1]*.6, smoothstep(.2,.5,uv.y));
  vec3 col=sky;
  float w=mix(.05,.35,u_p[0]);
  int N=3+int(u_p[1]*3.99);
  for(int i=0;i<7;i++){
    if(i>=N) break;
    float fi=float(i)/float(N-1);
    float sp=w*(1.+ (1.-fi)*.9);
    float y=uv.y;
    float wob=fbm4(vec2(y*mix(2.,4.,u_p[6])+float(i)*7., float(i)+SEED2.x))*.25*mix(.4,1.4,u_p[6]);
    float jag=gnoise(vec2(y*30., float(i)))*.015;
    float xl=-sp+wob+jag, xr=sp+wob*.8-jag+fbm4(vec2(y*3.,float(i)+9.))*.12;
    float m=max(smoothstep(xl+PX*2.,xl-PX*2.,uv.x), smoothstep(xr-PX*2.,xr+PX*2.,uv.x));
    float strata=sin(y*mix(20.,60.,u_p[2])+fbm4(vec2(uv.x*3.,y*2.)+fi)*4.)*.5+.5;
    vec3 rock=mix(u_c[1]*.8, u_c[3]*.7, strata*.3)*(.85+.3*fbm4(vec2(uv.x*12.,y*20.)+fi));
    float topL=smoothstep(-.3,.5,y)*u_p[3];
    rock*=mix(.08,.9,topL)*mix(1.,.3,fi);
    rock=mix(rock, sky*.5, (1.-fi)*u_p[5]*.6);
    col=mix(col, rock, m);
  }
  float beam=exp(-abs(uv.x-(uv.y-.5)*.35)*mix(30.,8.,u_p[4]))*smoothstep(.5,-.5,uv.y)*u_p[4];
  col+=u_c[2]*beam*(.5+.5*fbm4(uv*4.+u_time*.02))*1.2;
  float gy=-.38+gnoise(vec2(uv.x*2.,3.))*.03;
  vec3 sand=mix(u_c[1]*.6, u_c[2]*.4, u_p[7])*(.6+.4*fbm4(uv*vec2(8.,30.)));
  col=mix(col, sand*.7+u_c[2]*beam*.4, smoothstep(gy+PX*2.,gy-PX*2.,uv.y));
  col+=u_c[2]*sparkles(uv,60.,u_p[4]*.5,.01)*beam*4.;
  return col;
}`,
  };

  E.cells = {
    name: 'Mikro Dünya & Hücreler',
    params: ['Hücre ölçeği', 'Zar parlaklığı', 'Çekirdek', 'Derin katman', 'Hareket', 'Biyolüminesans', 'Sıvı pus', 'Partiküller'],
    glsl: VORO + `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.05+.4*u_p[4]);
  vec3 col=u_c[0]*.15+u_c[1]*.1*(fbm(uv*1.5+SEED2)*.5+.5);
  vec3 v2=voro(uv*mix(2.,5.,u_p[0])*.6+vec2(t*.1,0.)+7.,t*.7);
  col+=u_c[1]*.35*exp(-v2.y*12.)*u_p[3];
  vec3 v=voro(uv*mix(2.,5.,u_p[0])+vec2(0.,t*.05),t);
  float mem=exp(-v.y*mix(40.,12.,u_p[1]));
  float nuc=smoothstep(.22,.12,v.x)*u_p[2];
  vec3 cc=mix(u_c[2],u_c[3],v.z);
  col+=cc*mem*mix(.4,1.8,u_p[1]);
  col+=cc*.08*(1.-v.x);
  col=mix(col, mix(u_c[3],u_c[2],.3)*1.2, nuc*.8);
  col+=cc*u_p[5]*.4*pow(sat(1.-v.x*1.8),3.);
  col=mix(col, u_c[1]*.3, u_p[6]*.4*(fbm(uv*2.-t*.1)*.5+.5));
  col+=mix(u_c[2],vec3(1.),.5)*sparkles(uv,70.,u_p[7],.02)*1.5;
  return col;
}`,
  };

  E.clouds = {
    name: 'Bulut Denizi',
    params: ['Ufuk', 'Güneş X', 'Güneş yüksekliği', 'Bulut kabarıklığı', 'Bulut ölçeği', 'Bulut kuleleri', 'Güneş parıltısı', 'Akış'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.15,.12,u_p[0]);
  vec2 sun=vec2((u_p[1]-.5)*A*.8, hz+mix(-.02,.35,u_p[2]));
  vec3 sky=skyGrad(uv, hz, sun, .03, .3+.7*u_p[6]);
  vec3 col=sky;
  if(u_p[5]>.05){
    float x=uv.x*2.+SEED2.x;
    float tw=hz+max(0.,fbm4(vec2(x,2.))+.15)*.35*u_p[5];
    float tm=smoothstep(tw+.01,tw-.02,uv.y)*step(hz-.01,uv.y);
    float sh=fbm(uv*vec2(4.,6.)+SEED2)*.5+.5;
    vec3 tc=mix(u_c[1]*.7, u_c[2]*1.3, sat(sh*1.2-.2)*exp(-length(uv-sun)*1.5)+.2*sh);
    col=mix(col, tc, tm*.95);
  }
  if(uv.y<hz){
    float dy=hz-uv.y; float z=1./(dy+.015);
    vec2 P=vec2(uv.x*z, z)*.12*mix(.5,2.,u_p[4])+vec2(SEED2.x, u_time*.02*(.2+u_p[7]));
    float c=fbm(P)+.5*fbm(P*2.3+3.);
    float cl=fbm(P+vec2(.05,.05))+.5*fbm((P+vec2(.05,.05))*2.3+3.);
    float lit=sat((c-cl)*6.*mix(.5,2.,u_p[3])+.5);
    vec3 base=mix(u_c[1]*.55, mix(u_c[2],vec3(1.),.4)*1.1, lit);
    base+=u_c[2]*exp(-abs(uv.x-sun.x)*2.)*exp(-dy*3.)*.6;
    float haze=exp(-dy*14.);
    col=mix(base*(.6+.4*smoothstep(-.4,.4,c)), sky, haze);
  }
  return col;
}`,
  };

  E.lava = {
    name: 'Lav & Magma Ovası',
    params: ['Çatlak ölçeği', 'Akış bükülmesi', 'Çatlak genişliği', 'Akkor parlaklık', 'Duman', 'Ufuk', 'Kor', 'Akış hızı'],
    glsl: VORO + `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.02+.15*u_p[7]);
  float hz=mix(-.05,.3,u_p[5]);
  vec3 col;
  if(uv.y>hz){
    float h=uv.y-hz;
    col=mix(u_c[0]*.25+u_c[3]*.12, u_c[0]*.12, smoothstep(0.,.5,h));
    float sm=fbm(uv*vec2(1.5,3.)+vec2(t,-t*.5)+SEED2)*.5+.5;
    col=mix(col, u_c[0]*.1+u_c[3]*.15*exp(-h*4.), u_p[4]*sm*.8);
    col+=u_c[2]*exp(-h*12.)*.4;
  } else {
    float dy=hz-uv.y; float z=1./(dy+.01);
    vec2 P=vec2(uv.x*z, z)*.35*mix(.6,2.,u_p[0])+vec2(0.,t)+SEED2;
    P+=vec2(fbm4(P*.4), fbm4(P*.4+3.))*u_p[1]*1.5;
    vec3 v=voro(P, 0.);
    float glow=exp(-v.y*mix(30.,6.,u_p[2]));
    float crust=fbm4(P*3.)*.5+.5;
    col=u_c[0]*.08*crust;
    col+=mix(u_c[3]*.8, u_c[2]*2.5, glow)*glow*mix(.6,3.,u_p[3]);
    col=mix(col, mix(u_c[3]*.6,u_c[2]*.5,.5), exp(-dy*10.)*.6);
  }
  col+=vec3(1.,.45,.12)*sparkles(uv,60.,u_p[6]*.4,.12)*3.;
  return col;
}`,
  };

  E.galaxy = {
    name: 'Sarmal Galaksi',
    params: ['Kol sayısı', 'Sarmal sıkılığı', 'Kol keskinliği', 'Çekirdek boyutu', 'Eğim', 'Yıldızlar', 'Dönüş', 'Toz şeritleri'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  vec2 p=rot(u_p[6]*TAU)*uv;
  p.y/=mix(.35,1.,u_p[4]);
  float r=length(p); float a=atan(p.y,p.x);
  float arms=floor(mix(2.,5.,u_p[0]));
  float s=sin(arms*(a-log(r+.02)*mix(1.5,4.5,u_p[1]))+u_time*.01);
  float arm=pow(sat(s*.5+.5), mix(1.,6.,u_p[2]));
  float disk=exp(-r*mix(6.,3.,u_p[3]));
  float dust=fbm(p*9.+SEED2)*.5+.5;
  vec3 col=u_c[0]*.08;
  col+=mix(u_c[3], u_c[1]*1.4, sat(r*2.5))*arm*disk*(.5+.9*dust)*1.6;
  col*=1.-u_p[7]*.7*smoothstep(.45,.75,fbm(p*14.+SEED2*2.)*.5+.5)*disk*2.;
  col+=u_c[2]*exp(-r*mix(30.,10.,u_p[3]))*2.2;
  col+=mix(u_c[2],vec3(1.),.3)*sparkles(p,90.,arm*disk*3.,0.)*2.;
  col+=starfield(uv, .2+.8*u_p[5]);
  return col;
}`,
  };

  CB.GLSL = { VERT, COMMON, MAIN, POST };
  CB.ENGINES = E;
})();
