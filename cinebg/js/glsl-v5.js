/* CineBG Studio v5 — yeni sahne motorları.
   3B motorlar (terrain3d, metro3d, room3d, crystal) podyum gibi gerçek kamera kullanır:
   u_cam.x yakınlaştırma (eksi = ayna), u_cam.y yörünge / sapma, u_cam.z yükseklik ve eğim, u_roll yatırma.
   2B motorlar (collage, ruins, archival) MAIN'in kamera dönüşümünü olduğu gibi alır. */
(function () {
  const CB = window.CB;

  /* 3B motorlar için ortak ışın kurulumu: ekran koordinatı → kamera ışını */
  const RAY = `
vec2 v5_screen(){
  vec2 q=rot(u_roll)*((gl_FragCoord.xy-.5*u_res)/u_res.y);
  if(u_cam.x<0.) q.x=-q.x;
  return q;
}
mat3 v5_look(vec3 ro, vec3 ta){
  vec3 ww=normalize(ta-ro);
  vec3 uu=normalize(cross(abs(ww.y)>.98?vec3(0,0,1):vec3(0,1,0),ww));
  return mat3(uu, cross(ww,uu), ww);
}`;

  Object.assign(CB.ENGINES, {
    terrain3d: {
      name: '3B Arazi (gerçek kamera)',
      params: ['Dağ yüksekliği', 'Engebe', 'Vadi genişliği', 'Kar çizgisi', 'Vadi sisi', 'Su seviyesi', 'Güneş yönü', 'Güneş yüksekliği'],
      glsl: RAY + `
float t3_h(vec2 p, int oct){
  vec2 q=p*.15+SEED2*.07;
  float r=ridged(q, oct);
  float b=gnoise(q*.33+3.1)*.5+.5;
  float vx=p.x+sin(p.y*.07+SEED2.x)*3.;
  float valley=smoothstep(.4, mix(2.,10.,u_p[2]), abs(vx));
  return (r*mix(.55,1.05,u_p[1])+b*.7)*mix(1.,4.6,u_p[0])*mix(.12,1.,valley)-.35;
}
vec3 t3_sun(){
  float az=mix(-1.1,1.1,u_p[6]), el=mix(.03,.62,u_p[7]);
  return normalize(vec3(sin(az)*cos(el), sin(el), cos(az)*cos(el)));
}
vec3 t3_sunc(){ return mix(vec3(1.), u_c[2]/max(lum(u_c[2]),.05), .55); }
vec3 t3_sky(vec3 rd, vec3 L){
  float y=max(rd.y,0.);
  vec3 s=mix(mix(u_c[1],u_c[2],.35)*1.1, u_c[0]*.9+u_c[1]*.1, pow(y,.55));
  s=mix(s, u_c[1]*.6+u_c[3]*.4, .45*exp(-y*14.));
  float sd=max(dot(rd,L),0.);
  vec3 sc=t3_sunc();
  s+=sc*u_c[2]*.0+sc*(pow(sd,6.)*.25+pow(sd,48.)*.5)*mix(.6,1.,lum(u_c[2]));
  s+=sc*smoothstep(.99955,.9998,sd)*7.;
  if(rd.y>0.){
    vec2 cp=rd.xz/(rd.y+.06)*1.4+SEED2+u_time*.01;
    float cl=smoothstep(.05,.6, fbm4(cp*.6)*.5+.5-.15);
    vec3 cc=mix(u_c[1]*.7, t3_sunc()*mix(u_c[2],vec3(1.),.4), .45+.4*pow(sd,4.));
    s=mix(s, cc, cl*.55*smoothstep(0.,.12,rd.y));
  }
  return s;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v5_screen();
  float zm=max(abs(u_cam.x),.01);
  vec3 L=t3_sun(); vec3 sc=t3_sunc();
  float wl=u_p[5]>.06 ? mix(-.5,1.1,u_p[5]) : -99.;
  vec3 ro=vec3(0., 0., hash11(u_seed*.37)*300.);
  ro.x=-sin(ro.z*.07+SEED2.x)*3.;
  float yaw=u_cam.y*2.3;
  float clr=mix(.55,.18,smoothstep(0.,.15,u_cam.z))+max(-u_cam.z,0.)*30.;
  ro.y=max(t3_h(ro.xz,4), wl)+clr;
  float pitch=-.05+u_cam.z*1.3;
  mat3 cam=v5_look(ro, ro+vec3(sin(yaw), pitch, cos(yaw)));
  vec3 rd=normalize(cam*vec3(q, 1.7*zm));
  // yükseklik alanında ışın ilerletme
  float t=.05, hit=0.;
  for(int i=0;i<110;i++){
    vec3 p=ro+rd*t;
    float d=p.y-t3_h(p.xz,4);
    if(d<.0015*t){ hit=1.; break; }
    if(t>80.) break;
    t+=max(d*.42, .004+.002*t);
  }
  float tw=(rd.y<0. && wl>-90.) ? (wl-ro.y)/rd.y : 1e5;
  bool water=tw>0. && (tw<t || hit<.5) && tw<80.;
  vec3 col;
  vec3 skyc=t3_sky(rd,L);
  if(hit<.5 && !water){
    col=skyc;
  } else {
    float tt=water?tw:t;
    vec3 p=ro+rd*tt;
    vec3 n;
    if(water){
      n=normalize(vec3(gnoise(p.xz*3.+u_time*.2)*.04, 1., gnoise(p.xz*3.+7.-u_time*.15)*.04));
      vec3 rr=reflect(rd,n);
      float fr=.04+.96*pow(1.-max(dot(n,-rd),0.),5.);
      vec3 deep=mix(u_c[0],u_c[1],.25)*.35;
      col=mix(deep, t3_sky(rr,L), fr*.9+.1);
      col+=sc*pow(max(dot(rr,L),0.),220.)*4.;
    } else {
      float e=.006+.0015*tt;
      float h0=t3_h(p.xz,6);
      n=normalize(vec3(t3_h(p.xz-vec2(e,0.),6)-t3_h(p.xz+vec2(e,0.),6), 2.*e, t3_h(p.xz-vec2(0.,e),6)-t3_h(p.xz+vec2(0.,e),6)));
      // yumuşak gölge
      float sh=1., s=.08;
      for(int i=0;i<22;i++){
        vec3 sp=p+L*s;
        float dh=sp.y-t3_h(sp.xz,4);
        sh=min(sh, 10.*dh/s);
        if(sh<.01) break;
        s+=max(dh*.6,.06);
        if(s>25.) break;
      }
      sh=sat(sh);
      float rn=fbm4(p.xz*1.7)*.5+.5;
      vec3 rock=mix(u_c[0]*.6+u_c[1]*.4, mix(u_c[1],u_c[2],.25), rn*.6)*.55;
      vec3 grass=mix(u_c[1], u_c[3], .3)*.35;
      vec3 alb=mix(rock, grass, smoothstep(.75,.92,n.y)*smoothstep(2.6,.4,h0));
      float snowl=mix(4.8,.3,u_p[3]);
      float sn=smoothstep(snowl-.3, snowl+.3, h0+n.y*.9+(rn-.5)*.8)*smoothstep(.45,.7,n.y);
      alb=mix(alb, mix(vec3(.92,.94,1.), u_c[2], .12), sn);
      float dif=max(dot(n,L),0.);
      vec3 amb=mix(u_c[0],u_c[1],.5)*.35*(.6+.4*n.y)+mix(u_c[1],u_c[2],.3)*.06;
      col=alb*(sc*dif*sh*2.1+amb);
      col+=alb*mix(u_c[1],u_c[3],.5)*.12*max(dot(n,-L*vec3(1,0,1)),0.);
    }
    // hava perspektifi + vadi sisi
    vec3 fogc=t3_sky(normalize(vec3(rd.x,.03,rd.z)),L);
    float fa=1.-exp(-tt*.018);
    float mid=ro.y+rd.y*tt*.5;
    float vf=u_p[4]*(1.-exp(-tt*.06))*exp(-max(mid-wl*step(-90.,wl)*0.,0.)*.55);
    col=mix(col, fogc, sat(fa*.85+vf*.9));
  }
  return col;
}`,
    },

    metro3d: {
      name: '3B Metropol (gerçek kamera)',
      params: ['Bina yüksekliği', 'Yoğunluk', 'Cadde genişliği', 'Pencere ışıkları', 'Pus', 'Islak zemin', 'Kamera yüksekliği', 'Işık yönü'],
      glsl: RAY + `
float m3_box(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float m3_W(){ return mix(.9,2.4,u_p[2]); }
float m3_hgt(vec2 id){
  float h=hash12(id+SEED2);
  float tall=pow(h,2.6);
  float keep=step(.1+.25*(1.-u_p[1]), hash12(id*1.7+SEED2+3.));
  return mix(.7,11.,tall)*mix(.45,1.35,u_p[0])*keep;
}
// d: mesafe, b: hücre sınırına mesafe (güvenli adım), id: hücre
float m3_map(vec3 p, out float bnd, out vec2 cid, out float hg){
  float S=1.6;
  float ax=abs(p.x)-m3_W();
  vec2 c=vec2(ax, p.z);
  vec2 id=floor(c/S); id.x=max(id.x,0.);
  vec2 q=c-(id+.5)*S;
  cid=id+vec2(p.x<0.?100.:0.,0.);
  float h=m3_hgt(cid); hg=h;
  float g=mix(.12,.3,hash12(cid+7.));
  float d=h>0. ? m3_box(vec3(q.x,p.y-h*.5,q.y), vec3(S*.5-g, h*.5, S*.5-g)) : 1e3;
  float bz=S*.5-abs(q.y);
  float bx=c.x<0. ? 1e3 : S*.5-abs(q.x);
  bnd=min(bx,bz)+.03;
  return min(d, p.y);
}
float m3_d(vec3 p){ float b; vec2 i; float h; return m3_map(p,b,i,h); }
vec3 m3_L(){ float a=mix(-1.3,1.3,u_p[7]); return normalize(vec3(sin(a),.55,cos(a)*.6+.35)); }
float m3_march(vec3 ro, vec3 rd, float tmax, int n, out vec2 cid, out float hg){
  float t=.01; cid=vec2(0.); hg=0.;
  for(int i=0;i<110;i++){
    if(i>=n) break;
    float b; vec3 p=ro+rd*t;
    float d=m3_map(p,b,cid,hg);
    if(d<.0008*t+.0005) return t;
    t+=min(d,b)*.9;
    if(t>tmax) break;
  }
  return -1.;
}
vec3 m3_sky(vec3 rd){
  float y=max(rd.y,0.);
  vec3 s=mix(mix(u_c[1],u_c[2],.3)*.9, u_c[0], pow(y,.5));
  s+=mix(u_c[3],u_c[2],.5)*.25*exp(-y*10.);
  float sd=max(dot(rd,m3_L()),0.);
  s+=mix(vec3(1.),u_c[2],.5)*(pow(sd,8.)*.3+pow(sd,90.)*.8)*lum(u_c[1])*3.;
  return s;
}
vec3 m3_shade(vec3 ro, vec3 rd, float t, vec2 cid, float hg, bool refl){
  vec3 p=ro+rd*t;
  vec3 L=m3_L();
  float night=u_p[3];
  vec3 haze=mix(u_c[1], mix(u_c[2],u_c[3],.3), .35)*.5;
  vec3 col;
  if(p.y<.002){
    float W=m3_W();
    float road=step(abs(p.x),W);
    vec3 alb=mix(vec3(.05), u_c[0]*.4, .5)*(.8+.4*vnoise(p.xz*8.));
    float lane=road*step(abs(p.x),.02)*step(.6,fract(p.z*1.2));
    alb+=vec3(.5,.45,.3)*lane*.15;
    float sh=1.;
    vec2 i2; float h2;
    if(!refl && m3_march(p+vec3(0,.01,0), L, 20., 40, i2, h2)>0.) sh=.25;
    col=alb*(mix(vec3(1.),u_c[2],.4)*max(L.y,0.)*sh*(1.-night*.85)*1.6+haze*.6);
    // sokak lambaları zemin havuzları
    float zz=fract(p.z*.42)-.5;
    float pool=exp(-(zz*zz*30.+pow(abs(p.x)-W+.2,2.)*8.))*night;
    col+=mix(u_c[3],vec3(1.,.7,.4),.5)*pool*.08;
  } else {
    vec3 e=vec3(.002,0,0);
    vec3 n=normalize(vec3(m3_d(p+e.xyy)-m3_d(p-e.xyy), m3_d(p+e.yxy)-m3_d(p-e.yxy), m3_d(p+e.yyx)-m3_d(p-e.yyx)));
    float hc=hash12(cid+11.);
    vec3 alb=mix(u_c[0]*.7+vec3(.04), mix(u_c[1],vec3(lum(u_c[1])),.5), .25+.5*hc)*.6;
    float side=abs(n.x)>.5 ? p.z : p.x;
    float fl=p.y*mix(18.,26.,hc), cl=side*mix(14.,22.,hash12(cid+3.));
    vec2 wi=vec2(floor(cl), floor(fl));
    float band=step(.5,fract(floor(cl)*.25+hc));
    float win=step(.12,fract(cl))*step(fract(cl),.88)*step(.25,fract(fl))*step(fract(fl),.85)*step(.5,1.-abs(n.y));
    win*=mix(1.,.0,step(.82,hash12(vec2(floor(cl*.25),floor(fl*.1))+cid)));
    float lit=step(1.-mix(.15,.6,night), hash12(floor(wi*vec2(.5,1.))+cid*7.3));
    float sh=1.;
    vec2 i2; float h2;
    if(!refl && m3_march(p+n*.01, L, 20., 32, i2, h2)>0.) sh=.2;
    float dif=max(dot(n,L),0.);
    alb*=.85+.3*band*(1.-step(.5,abs(n.y)));
    if(n.y>.8){ vec2 rg=fract(p.xz*5.+hc*7.); alb*=(.35+.35*vnoise(p.xz*14.))*(1.-.4*step(.7,rg.x)*step(.6,rg.y)); }
    col=alb*(mix(vec3(1.),u_c[2],.4)*dif*sh*(1.-night*.85)*1.8+haze*(.35+.45*n.y));
    vec3 wc=mix(mix(vec3(1.,.72,.42),u_c[2],.4), u_c[3], step(.82,hash12(wi+5.1+cid)));
    col=mix(col, m3_sky(reflect(rd,n))*.35+col*.4, win*(1.-night)*.6);
    col+=wc*win*lit*mix(.05,1.3,night*night)*(.4+.6*hash12(wi+cid));
    float top=smoothstep(hg-.02,hg,p.y)*step(.8,n.y);
    col+=mix(u_c[3],vec3(1,.2,.1),.5)*top*step(.7,hc)*night*.8;
  }
  float fo=1.-exp(-t*mix(.012,.07,u_p[4]));
  col=mix(col, haze*(1.+night*.4)+m3_sky(normalize(vec3(rd.x,.02,rd.z)))*.4, fo);
  return col;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v5_screen();
  float zm=max(abs(u_cam.x),.01);
  float hgt=mix(.1,2.5,u_p[6]*u_p[6])+max(-u_cam.z,0.)*32.;
  hgt=max(hgt-max(u_cam.z,0.)*1.5,.04);
  vec3 ro=vec3(u_cam.y*2., hgt, hash11(u_seed*.71)*400.);
  float yaw=u_cam.y*2.2;
  float pitch=mix(.12,-.45,sat((hgt-.4)/7.))+u_cam.z*1.4;
  mat3 cam=v5_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.6*zm));
  vec2 cid; float hg;
  float t=m3_march(ro,rd,90.,110,cid,hg);
  vec3 col;
  if(t<0.){
    col=m3_sky(rd);
    col=mix(col, mix(u_c[1], mix(u_c[2],u_c[3],.3), .35)*.5*(1.+u_p[3]*.4), exp(-max(rd.y,0.)*mix(30.,6.,u_p[4]))*.8);
  } else {
    col=m3_shade(ro,rd,t,cid,hg,false);
    vec3 p=ro+rd*t;
    if(p.y<.002 && u_p[5]>.08){
      vec3 rr=reflect(rd, normalize(vec3(gnoise(p.xz*20.)*.03,1.,gnoise(p.xz*20.+5.)*.03)));
      vec2 c2; float h2;
      float t2=m3_march(p+vec3(0,.005,0),rr,40.,60,c2,h2);
      vec3 rc=t2<0. ? m3_sky(rr) : m3_shade(p,rr,t2,c2,h2,true);
      float fr=.2+.8*pow(1.-max(-rd.y,0.),4.);
      col=mix(col, rc, fr*u_p[5]*.75);
    }
  }
  // sokak lambası parıltıları
  float W=m3_W();
  for(int i=0;i<12;i++){
    float fi=float(i);
    float z=(floor(ro.z*.42)+fi+1.)/.42;
    for(int s=0;s<2;s++){
      vec3 lp=vec3((float(s)*2.-1.)*(W-.15), .32, z);
      vec3 v=lp-ro; float tl=dot(v,rd);
      if(tl<0.) continue;
      float dd=length(v-rd*tl);
      col+=mix(vec3(1.,.75,.45),u_c[3],.35)*exp(-dd*dd/(tl*tl)*9000.)*u_p[3]*1.4/(1.+tl*.05);
    }
  }
  return col;
}`,
    },

    collage: {
      name: 'Yırtık Kâğıt Kolaj',
      params: ['Katman sayısı', 'Yırtık pürüzü', 'Beyaz lif kenarı', 'Yarım ton (halftone)', 'Suluboya gök', 'Güneş / ay kesiği', 'Kâğıt dokusu', 'Kaynama (on twos)'],
      glsl: `
float cl_edge(float x, float fi, float amp){
  float base=fbm4(vec2(x*mix(1.4,3.2,hash11(fi*3.1+SEED2.x))+fi*7.3, fi*1.7+SEED2.y))*amp;
  float tear=gnoise(vec2(x*55.+fi*13., fi))*.006*(1.+u_p[1]*2.)+gnoise(vec2(x*170., fi*3.))*.0025*(1.+u_p[1]*2.);
  return base+tear;
}
vec3 cl_paper(vec3 c, vec2 p, float fi){
  float g=vnoise(p*vec2(500.,70.)+fi*9.)*.5+vnoise(p*900.+fi)*.5;
  return c*(1.-u_p[6]*.14+g*u_p[6]*.18)*(.96+.06*(fbm4(p*4.+fi)*.5+.5));
}
vec3 scene(vec2 uv, vec2 st){
  float dr=floor(u_time*12.);
  vec3 white=mix(vec3(.96,.94,.9), u_c[2], .06);
  // suluboya gökyüzü
  vec2 bo=(hash22(vec2(dr,1.3))-.5)*.0018*u_p[7];
  vec2 u=uv+bo;
  float w=fbm(u*vec2(1.8,2.6)+SEED2);
  vec3 skyA=mix(u_c[2], white, .35), skyB=mix(u_c[1], u_c[2], .45);
  vec3 col=mix(skyA, skyB, smoothstep(-.25,.35,w+u.y*.6));
  float pe=1.-smoothstep(0.,.03,abs(w-.08));
  col*=1.-.18*pe*u_p[4];
  col=mix(white*.95, col, mix(.55,1.,u_p[4]));
  col=cl_paper(col,u,0.);
  // kesik güneş / ay
  if(u_p[5]>.1){
    vec2 sp=vec2((hash11(SEED2.x)-.5)*A*.55, mix(.08,.3,hash11(SEED2.y)));
    vec2 dv=u-sp; float an=atan(dv.y,dv.x);
    float r=mix(.06,.14,u_p[5])+gnoise(vec2(an*6.,1.))*.004+gnoise(vec2(an*25.,2.))*.002;
    float d=length(dv)-r;
    col*=1.-.25*smoothstep(.02,0.,d-.006)*step(0.,d);
    col=mix(col, white, smoothstep(.002,0.,d-.004));
    col=mix(col, cl_paper(mix(u_c[2],u_c[3],.25)*1.25,u,9.), smoothstep(.0015,0.,d));
  }
  // kâğıt bulutlar
  for(int k=0;k<2;k++){
    float fk=float(k);
    vec2 cp=vec2((hash11(fk*7.+SEED2.x)-.5)*A*.8, mix(.15,.38,hash11(fk*3.+SEED2.y)));
    vec2 dv=(u-cp)*vec2(.55,1.);
    float d=min(length(dv)-.05, min(length(dv-vec2(.045,-.01))-.04, length(dv+vec2(.05,.015))-.035));
    d+=gnoise(u*90.+fk)*.004;
    col*=1.-.2*smoothstep(.015,0.,d-.004)*step(0.,d);
    col=mix(col, cl_paper(white,u,fk+20.), smoothstep(.0015,0.,d));
  }
  // yırtık kâğıt katmanları (arkadan öne)
  int N=3+int(u_p[0]*3.99);
  for(int i=0;i<7;i++){
    if(i>=N) break;
    float fi=float(i), f=fi/max(float(N-1),1.);
    vec2 lb=(hash22(vec2(dr,fi+2.))-.5)*.0022*u_p[7];
    vec2 p=uv+lb+vec2(floor(u_time*12.)/12.*.004*(fi+1.),0.);
    float base=mix(.02,-.4,f)+(hash11(fi+SEED2.x)-.5)*.05;
    float amp=mix(.34,.1,f);
    float y=base+cl_edge(p.x,fi,amp);
    float ysh=base+cl_edge(p.x-.006,fi,amp)+.004;
    if(i==N-2){
      float tw=.045, tx=floor(p.x/tw);
      float th=hash11(tx+SEED2.x*3.);
      if(th>.45){
        float lx=abs(fract(p.x/tw)-.5)*tw;
        float tH=mix(.05,.13,hash11(tx*1.7+SEED2.y));
        float yb=base+cl_edge((tx+.5)*tw,fi,amp);
        float tri=yb+tH*(1.-lx/(tw*.42))+gnoise(vec2(p.x*120.,fi))*.003;
        if(lx<tw*.42){ y=max(y, tri); ysh=max(ysh, tri+.004); }
      }
    }
    // gölge (katman kalkık duruyor)
    float sd=p.y-ysh;
    col*=1.-.32*smoothstep(.022,0.,sd)*step(0.,sd);
    float d=y-p.y;
    if(d>0.){
      vec3 lc=mix(mix(u_c[1],u_c[2],.55), mix(u_c[0],u_c[1],.45), f);
      if(mod(fi+floor(SEED2.x),3.)<1.) lc=mix(lc, u_c[3], .55);
      lc=mix(lc, white, (1.-f)*.18);
      lc*=mix(1.05,.8,sat(d*4.));
      // yarım ton
      if(u_p[3]>.05 && mod(fi,2.)<1.){
        vec2 hp=rot(.785)*p*mix(160.,90.,u_p[3]);
        vec2 hc=fract(hp)-.5;
        float rad=sqrt(sat(d*3.5))*.42*u_p[3]+.05;
        lc*=1.-.35*smoothstep(rad,rad-.12,length(hc));
      }
      lc=cl_paper(lc,p,fi+3.);
      // beyaz lifli yırtık kenar
      float we=(.003+.013*u_p[2])*(.45+vnoise(vec2(p.x*38.+fi*5.,fi)));
      float fib=step(.62,vnoise(vec2(p.x*420.,p.y*30.+fi)))*smoothstep(we*1.3,we*.6,d);
      col=mix(lc, cl_paper(white,p,fi+11.), max(smoothstep(we+.0012,we,d), fib*.8));
    }
  }
  // genel kâğıt doku + kenar kararması
  col*=.94+.06*vnoise(uv*1200.);
  col*=1.-.25*smoothstep(.3,.75,length(uv*vec2(.8/max(A*.5,.5),1.)));
  return col*.9;
}`,
    },

    room3d: {
      name: '3B Salon & Pencere Huzmeleri',
      params: ['Pencere genişliği', 'Pencere bölmeleri', 'Sütunlar', 'Huzme yoğunluğu', 'Toz zerreleri', 'Güneş açısı', 'Tavan yüksekliği', 'Uzak kapı ışığı'],
      glsl: RAY + `
float r3_H(){ return mix(5.,10.,u_p[6]); }
float r3_map(vec3 p){
  float W=5., H0=r3_H();
  float d=min(p.y, W-abs(p.x));
  if(p.y>H0) d=min(d, W-length(vec2(p.x,p.y-H0)));
  d=min(d, 62.-p.z);
  if(u_p[2]>.12){
    float zz=mod(p.z, 4.)-2.;
    vec2 cq=vec2(abs(p.x)-(W-1.1), zz);
    float cr=.36+.12*smoothstep(.7,0.,p.y)+.1*smoothstep(H0-.8,H0,p.y);
    d=min(d, (length(cq)-cr)*.9);
  }
  return d;
}
float r3_win(float z, float y){
  float S=4., ww=mix(.7,2.3,u_p[0]), H0=r3_H();
  float lz=mod(z,S)-S*.5;
  float yt=H0-.6-ww*.5;
  float inside=step(abs(lz),ww*.5)*step(2.,y)*step(y,yt+ww*.5)*(y<yt?1.:step(length(vec2(lz,y-yt)),ww*.5));
  if(u_p[1]>.12){
    float nx=floor(mix(1.,4.,u_p[1]));
    float gx=abs(fract((lz/ww+.5)*nx)-.5), gy=abs(fract((y-2.)/ww*nx*.8)-.5);
    inside*=step(.07,min(gx,gy)/nx*2.);
  }
  return inside;
}
vec3 r3_L(){ float a=mix(-.9,.9,u_p[5]); return normalize(vec3(-cos(a)*.75, .62, sin(a)*.7)); }
float r3_lit(vec3 p, vec3 L){
  float s=(-5.-p.x)/L.x;
  if(s<0.) return 0.;
  vec3 h=p+L*s;
  return r3_win(h.z,h.y);
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v5_screen();
  float zm=max(abs(u_cam.x),.01);
  float H0=r3_H();
  vec3 ro=vec3(1.2+u_cam.y*4., clamp(1.7-u_cam.z*22.,.25,H0+2.5), 2.);
  float yaw=-.12+u_cam.y*1.8;
  float pitch=.06+u_cam.z*1.5-max(ro.y-3.,0.)*.05;
  mat3 cam=v5_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.5*zm));
  float t=.02;
  for(int i=0;i<90;i++){ float d=r3_map(ro+rd*t); if(d<.002*t) break; t+=d; if(t>70.) break; }
  t=min(t,70.);
  vec3 p=ro+rd*t;
  vec3 e=vec3(.004,0,0);
  vec3 n=normalize(vec3(r3_map(p+e.xyy)-r3_map(p-e.xyy), r3_map(p+e.yxy)-r3_map(p-e.yxy), r3_map(p+e.yyx)-r3_map(p-e.yyx)));
  vec3 L=r3_L();
  vec3 sc=mix(vec3(1.,.93,.8), u_c[2]/max(lum(u_c[2]),.05), .55);
  vec3 outside=mix(u_c[2], vec3(1.), .45)*2.6;
  vec3 col;
  float ao=sat(r3_map(p+n*.35)/.35)*.6+.4;
  if(abs(p.x+5.)<.02 && r3_win(p.z,p.y)>.5){
    col=outside;
  } else if(p.z>61.9){
    float dw=step(abs(p.x),1.6)*step(p.y,5.5);
    col=mix(mix(u_c[1],u_c[2],.3)*.12, outside*mix(.2,1.2,u_p[7]), dw);
  } else {
    float tile=mod(floor(p.x*.8)+floor(p.z*.8),2.);
    vec3 stone=mix(u_c[1], u_c[2], .4)*.55*(.85+.3*vnoise(p.xz*2.+p.y));
    vec3 alb=p.y<.01 ? mix(stone, stone*.7, tile) : stone*.9;
    float lit=r3_lit(p+n*.01, L);
    float dif=max(dot(n,L),0.);
    vec3 bounce=mix(u_c[1],u_c[2],.5)*.2*(.5+.5*n.y*(-1.)+.5);
    col=alb*(sc*dif*lit*3.2+bounce*ao+mix(u_c[0],u_c[1],.5)*.08);
    if(p.y<.01) col+=sc*lit*.15*pow(max(dot(reflect(rd,n),L),0.),8.);
  }
  // hacimsel huzmeler
  float acc=0.;
  float jit=hash12(gl_FragCoord.xy+fract(u_time)*13.);
  float tm=min(t,45.);
  for(int i=0;i<40;i++){
    float s=(float(i)+jit)/40.*tm;
    vec3 sp=ro+rd*s;
    float l=r3_lit(sp,L);
    if(l>0.){
      float dn=.6+.8*vnoise3(sp*1.4+vec3(0.,u_time*.05,0.));
      acc+=l*dn*exp(-s*.03);
    }
  }
  acc*=tm/40.;
  col+=sc*acc*.035*mix(.2,1.6,u_p[3]);
  float motes=sparkles(uv+vec2(0.,u_time*.004),110.,u_p[4],-.02)+sparkles(uv*1.3,60.,u_p[4]*.6,.01);
  col+=sc*motes*sat(acc*.08)*1.5;
  col=mix(col, mix(u_c[1],u_c[2],.3)*.15, 1.-exp(-t*.012));
  return col;
}`,
    },

    crystal: {
      name: 'Kristal & Buz Mağarası',
      params: ['Kristal yoğunluğu', 'Kristal boyu', 'Işıma', 'Kırılma parıltısı', 'Mağara genişliği', 'Uzak ağız ışığı', 'Buz (soğuk) ↔ ametist', 'Sis'],
      glsl: RAY + `
vec2 cr_path(float z){ return vec2(sin(z*.13+SEED2.x)*1.6, sin(z*.09+SEED2.y)*.6); }
float cr_R(){ return mix(2.,4.,u_p[4]); }
float cr_hex(vec2 p, float r){ const vec3 k=vec3(-.8660254,.5,.57735); p=abs(p); p-=2.*min(dot(k.xy,p),0.)*k.xy; p-=vec2(clamp(p.x,-k.z*r,k.z*r),r); return length(p)*sign(p.y); }
float cr_crys(vec3 p){
  float best=1e3;
  float S=1.3;
  float k0=floor(p.z/S);
  for(int j=-1;j<=1;j++){
    float k=k0+float(j);
    for(int m=0;m<2;m++){
      float h=hash12(vec2(k,float(m))+SEED2);
      if(h>mix(.3,.95,u_p[0])) continue;
      float zc=(k+.5)*S+(hash12(vec2(k,float(m)+4.))-.5)*S*.6;
      float a=mix(-2.9,-.25,hash12(vec2(k+.3,float(m)+1.)));
      if(hash12(vec2(k,float(m)+9.))<.3) a+=PI*.9;
      vec2 c=cr_path(zc);
      vec3 b=vec3(c+vec2(cos(a),sin(a))*cr_R()*.92, zc);
      vec3 ax=normalize(vec3(-cos(a),-sin(a),0.)+(vec3(hash12(vec2(k,2.)),hash12(vec2(k,3.)),hash12(vec2(k,5.)))-.5)*.9);
      float Lc=mix(.5,2.1,hash12(vec2(k,float(m)+6.)))*mix(.5,1.5,u_p[1]);
      float rc=Lc*.14;
      vec3 pl=p-b;
      float al=dot(pl,ax);
      vec3 u1=normalize(cross(ax,vec3(0.,0.,1.)+vec3(.01,0.,0.))); vec3 u2=cross(ax,u1);
      vec2 xy=vec2(dot(pl,u1),dot(pl,u2));
      float rr=rc*sat((Lc-al)/(rc*2.2));
      float d=max(cr_hex(xy,rr), max(-al, al-Lc))*.7;
      best=min(best,d);
    }
  }
  return best;
}
float cr_cave(vec3 p){
  vec2 c=cr_path(p.z);
  float R=cr_R()+(vnoise3(p*.7)-.5)*1.3+(vnoise3(p*2.2)-.5)*.35;
  float fy=c.y-cr_R()*.62;
  return min(R-length(p.xy-c), p.y-fy);
}
float cr_map(vec3 p, out float mat){
  float a=cr_cave(p), b=cr_crys(p);
  mat=b<a?1.:0.;
  return min(a,b);
}
vec3 cr_col(){ return mix(mix(u_c[3],u_c[2],.3)/max(lum(mix(u_c[3],u_c[2],.3)),.08)*.5, vec3(.45,.8,1.), (1.-u_p[6])*.75); }
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v5_screen();
  float zm=max(abs(u_cam.x),.01);
  float z0=hash11(u_seed*.53)*200.;
  vec2 c0=cr_path(z0);
  vec3 ro=vec3(c0.x+u_cam.y*2., c0.y-cr_R()*.62+1.3-u_cam.z*6., z0);
  ro.y=max(ro.y, c0.y-cr_R()*.62+.25);
  vec2 c1=cr_path(z0+4.);
  float yaw=u_cam.y*1.6;
  mat3 cam=v5_look(ro, vec3(c1.x+sin(yaw)*4., c1.y-.3+u_cam.z*6., z0+4.*cos(yaw)+.01));
  vec3 rd=normalize(cam*vec3(q,1.5*zm));
  vec3 cc=cr_col();
  float t=.02, mat=0., glow=0.;
  for(int i=0;i<100;i++){
    vec3 p=ro+rd*t;
    float dc=cr_crys(p), dv=cr_cave(p);
    float d=min(dc,dv); mat=dc<dv?1.:0.;
    glow+=exp(-dc*6.)*.025;
    if(d<.002*t) break;
    t+=d*.85;
    if(t>40.) break;
  }
  vec3 p=ro+rd*t;
  float fogd=1.-exp(-t*mix(.03,.12,u_p[7]));
  vec3 mouth=mix(u_c[2],vec3(1.),.4)*1.8*u_p[5];
  vec3 fogc=mix(u_c[0]*.15+cc*.04, mouth*.5, smoothstep(6.,35.,t)*u_p[5]);
  vec3 col;
  if(t>=40.){
    col=mix(fogc, mouth, .6);
  } else {
    float m;
    vec3 e=vec3(.003,0,0);
    vec3 n=normalize(vec3(cr_map(p+e.xyy,m)-cr_map(p-e.xyy,m), cr_map(p+e.yxy,m)-cr_map(p-e.yxy,m), cr_map(p+e.yyx,m)-cr_map(p-e.yyx,m)));
    float fr=pow(1.-abs(dot(n,-rd)),3.);
    if(mat>.5){
      vec3 rr=refract(rd,n,.72);
      float inner=vnoise3(p*3.+rr*2.5)*.7+vnoise3(p*9.-rr)*.3;
      col=cc*(.35+1.6*inner*inner)*mix(.4,1.4,u_p[2]);
      col+=mix(cc,vec3(1.),.6)*fr*1.2;
      col+=vec3(1.)*pow(max(dot(reflect(rd,n),normalize(vec3(.3,.8,.4))),0.),60.)*u_p[3]*3.;
    } else {
      float dcr=cr_crys(p);
      vec3 rk=mix(mix(u_c[0], u_c[1], .6), vec3(lum(u_c[1])), .35);
      vec3 rock=rk/max(lum(rk),.01)*.16*(.6+.8*vnoise3(p*4.));
      float wet=smoothstep(.5,.9,vnoise3(p*1.5));
      float cav=.5+.5*vnoise3(p*2.7);
      col=rock*(cc*exp(-dcr*.7)*1.6*mix(.4,1.4,u_p[2])+mix(mix(u_c[1],u_c[2],.3),cc,.4)*.3*cav+cc*.12*max(dot(n,-rd),0.)+mouth*.35*max(-n.z,0.));
      col+=cc*.2*pow(max(dot(reflect(rd,n),-rd),0.),30.)*wet*exp(-dcr);
    }
    col=mix(col, fogc, fogd);
  }
  col+=cc*glow*mix(.4,1.8,u_p[2]);
  col+=cc*sparkles(uv,90.,u_p[3]*.1,.0)*.6;
  return col;
}`,
    },

    ruins: {
      name: 'Antik Harabeler & Sütunlar',
      params: ['Ufuk yüksekliği', 'Güneş X', 'Güneş yüksekliği', 'Sütun sırası derinliği', 'Yıkım oranı', 'Arka tapınak', 'Bitki örtüsü', 'Altın pus'],
      glsl: `
const float RU_F=1.15, RU_CH=1.7, RU_HC=9.;
vec3 scene(vec2 uv, vec2 st){
  float hz=mix(-.22,.12,u_p[0]);
  vec2 sp=vec2(mix(-.75,.75,u_p[1])*A*.5, hz+mix(.015,.32,u_p[2]));
  vec3 col=skyGrad(uv, hz, sp, .032, .85);
  vec3 sunc=mix(vec3(1.,.8,.55), u_c[2]/max(lum(u_c[2]),.05), .5);
  vec3 haze=mix(u_c[1], u_c[2], .55);
  float vx=(hash11(SEED2.x)-.5)*.5;
  // uzak tepeler
  float hill=hz+.02+.05*(fbm4(vec2(uv.x*2.2+SEED2.x,1.))*.5+.5);
  if(uv.y<hill) col=mix(col, haze*.75, .85);
  // arka tapınak (kırık alınlık)
  if(u_p[5]>.2){
    float z=115., tx=vx+(hash11(SEED2.y)-.5)*30./z*RU_F;
    float s=RU_F/z;
    float b0=hz+(0.-RU_CH)*s, colTop=b0+11.*s, entT=colTop+1.6*s;
    float wd=12.*s;
    float x=uv.x-tx;
    float sty=step(abs(x),wd*1.08)*step(b0-1.2*s,uv.y)*step(uv.y,b0);
    float cols=step(abs(x),wd)*step(b0,uv.y)*step(uv.y,colTop)*step(.45,fract(x/(wd*2./7.)+.5));
    float brk=step(x, wd*mix(1.,-.2,u_p[4]*.7));
    float ent=step(abs(x),wd*1.04)*step(colTop,uv.y)*step(uv.y,entT)*brk;
    float ped=step(colTop+1.6*s,uv.y)*step(uv.y,entT+ (wd*1.04-abs(x))*.28)*step(abs(x),wd*1.04)*brk;
    float m=max(max(sty,cols*step(x,wd*mix(1.,.3,u_p[4]*.6))),max(ent,ped));
    col=mix(col, mix(haze*.8, sunc*.35+haze*.5, .3), m*.9);
  }
  float shadeG=0.;
  // zemin
  if(uv.y<hz){
    float z=RU_CH*RU_F/max(hz-uv.y,1e-4);
    float X=(uv.x-vx)*z/RU_F;
    float path=smoothstep(4.5,3.5,abs(X));
    vec3 grass=mix(u_c[1], u_c[3], .25)*.45*(.7+.6*vnoise(vec2(X,z)*.8));
    vec3 pav=mix(u_c[2],u_c[1],.55)*.55*(.85+.3*vnoise(vec2(X,z)*2.));
    float tl=max(smoothstep(.06,0.,abs(fract(X*.5)-.5)), smoothstep(.06,0.,abs(fract(z*.5)-.5)))*path;
    vec3 g=mix(grass, pav*(1.-.25*tl), path*(1.-u_p[6]*.5*vnoise(vec2(X,z)*.5)));
    // sütun gölgeleri (güneş arkada → gölgeler kameraya doğru)
    vec2 sd2=normalize(vec2(-(sp.x-vx)*2.2, -1.));
    float shl=RU_HC/max(tan(mix(.06,.7,u_p[2])),.05)*.4;
    float sh=0.;
    for(int i=0;i<16;i++){
      float fi=float(i);
      float zc=7.+fi*mix(3.,5.,u_p[3]);
      for(int r=0;r<2;r++){
        float Xc=(float(r)*2.-1.)*6.;
        float hb=1.-step(1.-u_p[4]*.6, hash12(vec2(fi,float(r))+SEED2))*.65;
        vec2 rel=vec2(X,z)-vec2(Xc,zc);
        float al=dot(rel,sd2);
        float pr=abs(rel.x*sd2.y-rel.y*sd2.x);
        sh=max(sh, step(0.,al)*step(al,shl*hb)*smoothstep(.55,.4,pr));
      }
    }
    shadeG=sh;
    float lit=1.-sh*.75;
    col=g*(sunc*lit*mix(.5,1.,u_p[2])*1.3+haze*.25);
    col=mix(col, haze*.8, 1.-exp(-z*.012*(1.+u_p[7]*2.)));
  }
  // sütun sıraları — uzaktan yakına
  vec3 Ld=normalize(vec3((sp.x-vx)*2.2,.35,.9));
  vec3 stone=mix(u_c[2], u_c[1], .45);
  for(int ii=15;ii>=0;ii--){
    float fi=float(ii);
    float zc=7.+fi*mix(3.,5.,u_p[3]);
    float s=RU_F/zc;
    for(int r=0;r<2;r++){
      float Xc=(float(r)*2.-1.)*6.;
      float hs=hash12(vec2(fi,float(r))+SEED2);
      float broken=step(1.-u_p[4]*.6, hs);
      if(hash12(vec2(fi,float(r)+5.)+SEED2)<u_p[4]*.25) continue;
      float hcol=RU_HC*(1.-broken*mix(.35,.85,hash12(vec2(fi+3.,float(r)))));
      float sx=vx+Xc*s, w=.5*s;
      float b0=hz-RU_CH*s, top=hz+(hcol-RU_CH)*s;
      float x=uv.x-sx;
      top+=broken*(gnoise(vec2(x/w*3.,fi))*.6*w);
      float capw=(1.-broken)*step(top-.55*s,uv.y)*1.4+step(uv.y,b0+.35*s)*1.3;
      float ww=w*max(capw,1.);
      if(abs(x)<ww && uv.y>b0 && uv.y<top+(1.-broken)*.15*s){
        float xn=clamp(x/w,-1.,1.);
        vec3 nn=vec3(xn,0.,-sqrt(1.-xn*xn));
        float lam=max(dot(nn,Ld),0.);
        float flute=.88+.12*cos(xn*22.);
        vec3 c=stone*flute*(sunc*lam*1.6+haze*.35+.04);
        c+=sunc*pow(lam,6.)*.6;
        float moss=u_p[6]*smoothstep(b0+2.*s*vnoise(vec2(x*40./w,fi)),b0,uv.y-.2*s);
        c=mix(c, mix(u_c[1],u_c[3],.3)*.35, moss*.7);
        c=mix(c, haze*.8, 1.-exp(-zc*.012*(1.+u_p[7]*2.)));
        col=c;
      }
      // arşitrav: iki sağlam sütun arası
      float zn=zc+mix(3.,5.,u_p[3]);
      if(ii<15 && broken<.5 && hash12(vec2(fi,float(r))+SEED2*1.3)>u_p[4]*.8){
        float s2=RU_F/zn;
        float sx2=vx+Xc*s2;
        float lo=min(sx,sx2), hi=max(sx,sx2);
        float tt=sat((uv.x-sx)/(sx2-sx));
        float tp=mix(hz+(RU_HC-RU_CH)*s, hz+(RU_HC-RU_CH)*s2, tt);
        float bh=mix(1.1*s,1.1*s2,tt);
        if(uv.x>lo && uv.x<hi && uv.y>tp && uv.y<tp+bh){
          vec3 c=stone*(sunc*.35+haze*.4)*(.9+.1*step(.5,fract((uv.y-tp)/bh*3.)));
          col=mix(c, haze*.8, 1.-exp(-zc*.012*(1.+u_p[7]*2.)));
        }
      }
    }
  }
  // ön plan: devrilmiş taş bloklar ve otlar
  for(int k=0;k<3;k++){
    float fk=float(k);
    vec2 c=vec2((hash11(fk*5.+SEED2.x)-.5)*A*.9, -.47+hash11(fk*3.1+SEED2.y)*.04);
    vec2 bs=vec2(.05+.04*hash11(fk*7.+SEED2.y), .025+.02*hash11(fk*2.+SEED2.x));
    vec2 dv=uv-c;
    float rough=gnoise(vec2(uv.x*80.,fk))*.004;
    if(abs(dv.x)<bs.x && dv.y>-bs.y && dv.y<bs.y+rough){
      float topf=step(bs.y-.008,dv.y);
      float sideL=sat(dv.x/bs.x*.5+.5);
      vec3 c2=stone*.5*(sunc*mix(.25,.9,topf)*mix(.6,1.,sideL)+haze*.2)*(.8+.4*vnoise(dv*120.));
      col=c2;
    }
  }
  float gr=-.5+.03+.09*u_p[6]*(fbm4(vec2(uv.x*18.,3.))*.5+.5)+.03*u_p[6]*gnoise(vec2(uv.x*90.,1.));
  if(uv.y<gr){ vec3 gc=mix(u_c[0],u_c[1],.3)*.25; col=mix(gc, gc+sunc*.15, smoothstep(gr-.03,gr,uv.y)); }
  // altın pus ve güneş saçılması
  col+=sunc*u_c[2]*.0+sunc*exp(-length((uv-sp)*vec2(.6,1.5))*3.)*u_p[7]*.5;
  return col;
}`,
    },

    archival: {
      name: 'Arşiv Editoryal (sepya, baskı)',
      params: ['Fotoğraf paneli', 'Yarım ton boyutu', 'Sepya ↔ duoton', 'Kinetik bloklar', 'Çizik & toz', 'Metin satırları', 'Kâğıt dokusu', 'Hareket'],
      glsl: `
float ar_photo(vec2 p){
  float hz=-.05+(hash11(SEED2.x)-.5)*.2;
  float sky=sat(.75-p.y*.4)+.25*(fbm4(p*vec2(2.,4.)+SEED2)*.5);
  float mt=hz+.12*(fbm4(vec2(p.x*2.5+SEED2.y,1.))*.5+.5)+.05*ridged(vec2(p.x*4.,2.)+SEED2,3);
  float v=p.y>mt ? sky : .18+.2*(fbm4(p*6.)*.5+.5)*smoothstep(mt-.4,mt,p.y);
  float sun=exp(-length(p-vec2(.15,mt+.12))*9.);
  return sat(v+sun*.5);
}
vec3 scene(vec2 uv, vec2 st){
  float tq=floor(u_time*12.)/12.;
  uv+=(hash22(vec2(tq*7.,3.))-.5)*.002*u_p[7];
  vec3 paper=mix(vec3(.80,.72,.56), u_c[2]/max(lum(u_c[2]),.1)*.62, .2);
  vec3 ink=mix(vec3(.06,.04,.03), u_c[0], .35);
  vec3 ink2=mix(ink, mix(u_c[3],u_c[1],.3)*.6, u_p[2]);
  float pt=fbm4(uv*5.+SEED2)*.5+.5;
  vec3 col=paper*(1.-u_p[6]*.18+pt*u_p[6]*.22)*(.97+.03*vnoise(uv*vec2(700.,90.)));
  // metin satırları
  if(u_p[5]>.1){
    float tx=(hash11(SEED2.y+2.)>.5?.22:-.48)*A, tw=.24*A;
    float row=floor(uv.y/.022);
    float ln=step(.55,fract(uv.y/.022))*step(tx,uv.x)*step(uv.x,tx+tw*mix(.4,1.,hash11(row+SEED2.x)))*step(abs(uv.y),.38);
    ln*=step(.12,hash11(row*3.+1.));
    float wb=step(.18,fract(uv.x*38.+hash11(row)*3.));
    col=mix(col, ink*1.4, ln*wb*.55*u_p[5]);
  }
  // fotoğraf paneli (yarım ton)
  vec2 pc=vec2((hash11(SEED2.x*1.3)-.5)*A*.2, (hash11(SEED2.y*.7)-.5)*.08);
  vec2 hs=vec2(mix(.28,.5,u_p[0])*A*.55, mix(.22,.36,u_p[0]));
  vec2 pp=(uv-pc)/hs;
  if(abs(pp.x)<1.06 && abs(pp.y)<1.08){
    col=mix(col, paper*1.12, .85);
    if(abs(pp.x)<1. && abs(pp.y)<1.){
      float cs=mix(.0035,.011,u_p[1]);
      vec2 g=rot(.785)*uv/cs;
      vec2 cid=floor(g)+.5;
      vec2 cw=(rot(-.785)*(cid*cs)-pc)/hs;
      float I=ar_photo(cw*vec2(1.,.6));
      I*=1.-.45*smoothstep(.6,1.4,length(pp));
      float r=sqrt(1.-I)*.62;
      float dot_=smoothstep(r+.08,r-.08,length(g-cid));
      vec3 dt=mix(paper*1.05, ink2, dot_);
      col=dt;
      col=mix(col, ink, step(.985,max(abs(pp.x),abs(pp.y)))*.8);
    }
  }
  // kinetik bloklar
  for(int k=0;k<3;k++){
    if(float(k)>=u_p[3]*3.5) break;
    float fk=float(k);
    vec2 bc=vec2((hash11(fk*4.1+SEED2.x)-.5)*A*.85+sin(tq*.6+fk*2.)*.04*u_p[7], (hash11(fk*2.3+SEED2.y)-.5)*.75);
    vec2 bs=vec2(mix(.05,.22,hash11(fk*9.+SEED2.x)), mix(.03,.12,hash11(fk*6.+SEED2.y)));
    vec2 q=abs(uv-bc)-bs;
    float m=step(max(q.x,q.y),0.);
    vec3 bcol=k==1? ink : mix(u_c[3], u_c[1], .2)*1.1;
    if(k==2){ vec2 g=rot(.3)*uv*120.; m*=step(length(fract(g)-.5), .32); }
    col=mix(col, col*bcol*1.6, m*.88);
  }
  // kayıt / kesim işaretleri
  vec2 rm=vec2(A*.5-.06,.44);
  vec2 dr=abs(uv-rm);
  col=mix(col, ink, (step(dr.x,.0012)*step(dr.y,.02)+step(dr.y,.0012)*step(dr.x,.02)+smoothstep(.002,.0,abs(length(uv-rm)-.012)))*.7);
  // film çizikleri ve toz
  if(u_p[4]>.05){
    for(int i=0;i<4;i++){
      float fi=float(i);
      float hx=hash11(tq*13.1+fi*7.);
      if(hx>u_p[4]*.8) continue;
      float x=(hash11(tq*3.7+fi)-.5)*A;
      float wv=sin(uv.y*9.+fi)*.003;
      float l=smoothstep(PX*1.5,0.,abs(uv.x-x-wv));
      col=mix(col, hash11(fi+tq)>.5?paper*1.3:ink, l*.6);
    }
    vec2 dg=floor(uv*u_res.y/3.);
    float dust=step(1.-u_p[4]*.0025, hash12(dg+floor(u_time*12.)*1.7));
    col=mix(col, ink, dust*.8);
  }
  col*=1.-.35*smoothstep(.35,.95,length(uv*vec2(.85/max(A*.5,.5),1.)));
  return col*.85;
}`,
    },
  });
})();
