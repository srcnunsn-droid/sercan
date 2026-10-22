/* CineBG Studio v7 — doğa motorları (A).
   waterfall, glacier, coral, mushroom, bamboo, aerial 2B katmanlıdır ve MAIN'in kamera dönüşümünü alır.
   canyonarch (ışın ilerletme) ve saltflat (analitik düzlem) gerçek 3B kameradır:
   u_cam.x yakınlaştırma (eksi = ayna), u_cam.y sapma / yörünge, u_cam.z yükseklik ve eğim, u_roll yatırma. */
(function () {
  const CB = window.CB;

  const RAY = `
vec2 v7a_screen(){
  vec2 q=rot(u_roll)*((gl_FragCoord.xy-.5*u_res)/u_res.y);
  if(u_cam.x<0.) q.x=-q.x;
  return q;
}
mat3 v7a_look(vec3 ro, vec3 ta){
  vec3 ww=normalize(ta-ro);
  vec3 uu=normalize(cross(abs(ww.y)>.98?vec3(0,0,1):vec3(0,1,0),ww));
  return mat3(uu, cross(ww,uu), ww);
}`;

  /* paletten doğa tonları: yeşil bitki, kaya, su — palet rengine yaslanır ama doğal kalır */
  const TONES = `
vec3 v7a_norm(vec3 c){ return c/max(lum(c),.04); }
vec3 v7a_green(){ return mix(vec3(.16,.32,.12), v7a_norm(u_c[1])*.22, .35); }
vec3 v7a_rock(){ return mix(vec3(.32,.29,.26), v7a_norm(u_c[1])*.3, .4); }
vec3 v7a_sunc(){ return mix(vec3(1.,.86,.66), v7a_norm(u_c[2])*.9, .5); }
vec3 v7a_haze(){ return mix(u_c[1], u_c[2], .55); }
float v7a_vor(vec2 p, out vec2 cid){
  vec2 n=floor(p), f=fract(p); float d1=8., d2=8.;
  cid=n;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g=vec2(i,j); vec2 o=hash22(n+g+SEED2);
    vec2 r=g+o-f; float d=dot(r,r);
    if(d<d1){ d2=d1; d1=d; cid=n+g; } else if(d<d2) d2=d;
  }
  return sqrt(d2)-sqrt(d1);
}`;

  Object.assign(CB.ENGINES, {
    /* ---------------- ŞELALE ---------------- */
    waterfall: {
      name: 'Şelale & Nehir Vadisi',
      params: ['Şelale genişliği', 'Şelale yüksekliği', 'Akış hızı', 'Sis & serpinti', 'Kaya duvarları', 'Bitki örtüsü', 'Güneş ışığı', 'Gölet yansıması'],
      glsl: TONES + `
float wf_cx(){ return (hash11(SEED2.y)-.5)*.3; }
float wf_T(){ return mix(.0,.3,u_p[1]); }
float wf_top(float x){ float dx=x-wf_cx(); return wf_T()+dx*dx*.12+fbm4(vec2(x*3.,SEED2.x))*.04; }
float wf_pool(){ return -.26; }
float wf_w(float y){ return mix(.035,.2,u_p[0])*(1.+(wf_T()-y)*.4); }
vec3 wf_rockc(){ return mix(vec3(.46,.41,.36), v7a_norm(u_c[1])*.38, .3); }
vec3 wf_leaf(){ return mix(vec3(.18,.36,.14), v7a_norm(u_c[1])*.2, .25); }
vec3 wf_upper(vec2 uv){
  float t=u_time;
  float cx=wf_cx();
  float top=wf_top(uv.x);
  vec2 sp=vec2((hash11(SEED2.x*1.3)-.5)*A*.7, wf_T()+mix(.12,.38,u_p[6]));
  vec3 col=skyGrad(uv, wf_T()+.05, sp, .028, .35+.5*u_p[6]);
  vec3 haze=v7a_haze();
  for(int i=0;i<2;i++){
    float fi=float(i);
    float r=wf_T()+.1-fi*.05+fbm4(vec2(uv.x*(1.4+fi)+SEED2.x*3.+fi*7.,fi))*.14;
    vec3 rc=mix(wf_leaf()*.55*(.7+.6*(gnoise(uv*vec2(30.,60.)+fi)*.5+.5)), haze, .62-fi*.25);
    col=mix(col, rc*mix(1.,.8,smoothstep(r,r-.15,uv.y)), smoothstep(r+PX,r-PX,uv.y));
  }
  // uçurum yüzü
  float lit=mix(.45,1.15,u_p[6]);
  float strata=sin(uv.y*55.+fbm4(uv*vec2(4.,9.)+SEED2)*9.)*.5+.5;
  float cracks=ridged(vec2(uv.x*16.+SEED2.x, uv.y*2.), 4);
  vec3 rock=wf_rockc()*(.55+.35*strata)*(.65+.5*cracks);
  rock*=lit*(.55+.45*smoothstep(wf_pool(),top,uv.y));
  float dxf=abs(uv.x-cx);
  rock*=1.-.45*exp(-dxf*7.);                       // şelalenin arkası nemli ve koyu
  float moss=smoothstep(.5,.8, fbm4(uv*vec2(7.,5.)+SEED2)+.5)*u_p[5];
  rock=mix(rock, wf_leaf()*lit*(.6+.5*(gnoise(uv*60.)*.5+.5)), moss*.85);
  float face=smoothstep(top+PX*1.5, top-PX*1.5, uv.y);
  col=mix(col, rock, face);
  // üst kenar bitki örtüsü
  float veg=top+mix(.0,.07,u_p[5])*(.5+.8*fbm4(vec2(uv.x*14.,2.))+.3);
  float vm=smoothstep(veg+PX,veg-PX,uv.y)*step(top-.03,uv.y)*step(.05,u_p[5]);
  col=mix(col, wf_leaf()*lit*(.5+.7*(fbm4(uv*vec2(60.,90.))+.5)), vm);
  // şelale
  float w=wf_w(uv.y);
  float dx=abs(uv.x-cx-sin(uv.y*7.+SEED2.x)*.008);
  float body=smoothstep(w, w*.82, dx)*step(uv.y, top+.004);
  float sp2=mix(.5,2.6,u_p[2]);
  float streak=fbm(vec2((uv.x-cx)*34., uv.y*3.+t*sp2))*.5+.5;
  float fine=gnoise(vec2((uv.x-cx)*140., uv.y*10.+t*sp2*3.))*.5+.5;
  float cover=smoothstep(.22,.62,streak*.7+fine*.3)*(.55+.45*smoothstep(w,w*.3,dx));
  vec3 wcol=mix(vec3(.62,.7,.74), vec3(1.1,1.12,1.14), smoothstep(.45,.9,streak))*lit;
  wcol+=vec3(.25)*smoothstep(.012,.0,abs(uv.y-top+.006))*lit;   // kenar dudağı parıltısı
  col=mix(col, wcol, body*cover);
  // kenar serpintisi
  col=mix(col, vec3(.92,.95,1.)*lit, smoothstep(w*1.8, w, dx)*(1.-body)*.35*u_p[3]*step(uv.y,top)*(.5+.5*fbm4(uv*20.-t*.4)));
  return col;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  float py=wf_pool();
  float cx=wf_cx();
  vec3 col;
  if(uv.y>py){
    col=wf_upper(uv);
  } else {
    vec2 rp=vec2(uv.x+gnoise(vec2(uv.x*12., uv.y*70.+t*.8))*.014, 2.*py-uv.y);
    vec3 refl=wf_upper(rp);
    vec3 deep=mix(vec3(.04,.1,.09), u_c[0]*.5, .4);
    col=mix(deep, refl*.9, mix(.25,.85,u_p[7])*exp(-(py-uv.y)*2.5));
    float foam=smoothstep(.45,.85, fbm4(vec2((uv.x-cx)*9., uv.y*28.-t*.7))+.5)*exp(-abs(uv.x-cx)*3.5)*exp(-(py-uv.y)*7.);
    col=mix(col, vec3(.9,.93,.95), foam*.75);
  }
  // yan duvarlar (ön plan çerçevesi)
  float edgeL=-A*.5+mix(.08,.32,u_p[4])+fbm4(vec2(uv.y*4.,SEED2.x))*.08-(uv.y+.5)*.05;
  float edgeR=A*.5-mix(.08,.32,u_p[4])-fbm4(vec2(uv.y*4.,SEED2.y))*.08+(uv.y+.5)*.05;
  float side=max(smoothstep(edgeL+PX*2.,edgeL-PX*2.,uv.x), smoothstep(edgeR-PX*2.,edgeR+PX*2.,uv.x));
  vec3 sc=mix(wf_rockc()*.22, wf_leaf()*.35, smoothstep(.45,.7,fbm4(uv*9.)+.5)*u_p[5]);
  sc+=v7a_sunc()*.12*u_p[6]*smoothstep(.03,.0,abs(uv.x-edgeL))*step(0.,uv.y+.2);
  col=mix(col, sc*(.75+.35*(gnoise(uv*40.)*.5+.5)), side*step(.03,u_p[4]));
  // ön plan kayaları
  float rk=-.42+fbm4(vec2(uv.x*5.+SEED2.x,0.))*.12+.05*sin(uv.x*3.);
  col=mix(col, wf_rockc()*.22*(.6+.7*(fbm4(uv*25.)+.5)), smoothstep(rk+PX,rk-PX,uv.y)*step(.05,u_p[4]));
  // sis
  float mist=exp(-abs(uv.y-py-.04)*mix(12.,3.5,u_p[3]))*(.55+.45*fbm4(uv*vec2(3.,8.)+vec2(t*.04,-t*.08)));
  mist+=exp(-abs(uv.x-cx)*6.)*smoothstep(py+.25,py,uv.y)*.4;
  col=mix(col, mix(v7a_haze(),vec3(.95),.5)*.85, sat(mist*u_p[3]));
  col+=vec3(.9,.95,1.)*sparkles(uv, 70., u_p[3]*.25, .3)*.5;
  return col;
}`,
    },

    /* ---------------- BUZUL ---------------- */
    glacier: {
      name: 'Buzul Cephesi & Buzdağları',
      params: ['Buzul duvarı yüksekliği', 'Buz mavisi', 'Yüzen buz kütleleri', 'Arka dağlar', 'Su yansıması', 'Güneş yüksekliği', 'Yarık & çatlak', 'Sis'],
      glsl: TONES + `
float gc_hz(){ return -.08; }
vec3 gc_ice(float k){ return mix(vec3(.88,.95,1.), mix(vec3(.18,.52,.82), v7a_norm(u_c[3])*.35, .25), k); }
vec3 gc_upper(vec2 uv){
  float hz=gc_hz();
  vec2 sp=vec2((hash11(SEED2.x)-.5)*A*.7, hz+mix(.02,.36,u_p[5]));
  vec3 col=skyGrad(uv, hz, sp, .028, .7);
  vec3 haze=v7a_haze();
  // dağlar
  if(u_p[3]>.05){
    float r=hz+.08+ridged(vec2(uv.x*1.6+SEED2.x,0.),5)*.32*u_p[3];
    float m=smoothstep(r+PX,r-PX,uv.y);
    float snow=smoothstep(r-.08,r-.02,uv.y);
    vec3 mc=mix(v7a_rock()*.6, vec3(.92,.95,1.)*.9, snow*.8);
    mc=mix(mc, haze, .45);
    col=mix(col, mc, m);
  }
  // buzul duvarı
  float cx=(hash11(SEED2.y)-.5)*.6;
  float span=A*mix(.22,.5,hash11(SEED2.x*.7));
  float prof=1.-smoothstep(span*.5,span,abs(uv.x-cx));
  float wall=hz+mix(.06,.28,u_p[0])*prof*(.8+.3*sin((uv.x-cx)*3.))+fbm4(vec2(uv.x*9.,SEED2.x))*.03*prof;
  float wm=smoothstep(wall+PX,wall-PX,uv.y)*step(hz,uv.y);
  float str=ridged(vec2(uv.x*26.+SEED2.x, uv.y*1.8), 4);
  float crev=smoothstep(.75,.95, ridged(vec2(uv.x*14.+3., uv.y*.6), 3))*u_p[6];
  float k=mix(.25,.95,u_p[1])*(.55+.6*(1.-str))+crev*.6+smoothstep(wall,hz,uv.y)*.35;
  vec3 ice=gc_ice(sat(k));
  float lit=.6+.5*smoothstep(-.4,.4,uv.x-sp.x+.2)*mix(.6,1.,u_p[5]);
  ice*=lit*(.7+.3*str)*(1.-.35*smoothstep(hz+.04,hz,uv.y));
  ice*=1.-crev*.45;
  ice=mix(ice, vec3(1.05), smoothstep(wall-.015,wall,uv.y)*.6);
  col=mix(col, ice, wm);
  return col;
}
float gc_berg(vec2 p, vec2 c, float s, out float shade){
  // su çizgisine oturan düzensiz buz kütlesi
  vec2 q=(p-c)/s;
  float top=.35+fbm4(vec2(q.x*2.+c.x*9.,c.y*7.))*.5;
  float wdt=1.;
  float d=max(abs(q.x)-wdt*(1.-q.y*.25), q.y-top);
  d=max(d, -q.y);
  shade=sat(q.y/top);
  return d*s;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  float hz=gc_hz();
  vec3 col;
  if(uv.y>=hz){
    col=gc_upper(uv);
  } else {
    float dy=hz-uv.y;
    vec2 rp=vec2(uv.x+gnoise(vec2(uv.x*10., dy*120./(dy*4.+.2)+t*.4))*.01*u_p[4]*(1.+dy*4.), 2.*hz-uv.y);
    vec3 refl=gc_upper(rp);
    vec3 deep=mix(u_c[0], vec3(.03,.12,.18), .5);
    col=mix(deep, refl*.8, mix(.25,.85,u_p[4])*exp(-dy*2.));
    // kırık buz parçacıkları: su düzlemine perspektifle oturur
    vec2 gp=vec2(uv.x/dy, 1./dy)*vec2(.9,.35);
    vec2 g=gp*2.; vec2 id=floor(g);
    float bit=step(.8, hash12(id+SEED2))*smoothstep(.35,.15,length((fract(g)-.5)*vec2(1.,2.5)));
    float nearH=sat(dy*8.)*sat((.22-dy)*6.);
    col=mix(col, gc_ice(.25)*.85, bit*u_p[2]*.7*nearH);
    col=mix(col, gc_ice(.2)*.9, smoothstep(.74,.8,vnoise(gp*5.))*u_p[2]*.25*nearH);
  }
  // yüzen buzdağları (uzaktan yakına)
  for(int i=0;i<6;i++){
    float fi=float(i);
    if(fi>=1.+u_p[2]*5.5) break;
    float dpt=hash11(fi*3.1+SEED2.x);
    float y=hz-.01-dpt*.3;
    float s=mix(.03,.16,dpt)*(.6+hash11(fi*7.3+SEED2.y));
    float x=(hash11(fi*5.7+SEED2.y)-.5)*A*.95;
    float sh; float d=gc_berg(uv, vec2(x,y), s, sh);
    if(d<0.){
      vec3 ic=gc_ice(.15+.5*(1.-sh)+.2*vnoise(uv*80.));
      ic*=.8+.3*smoothstep(-s,s,uv.x-x);
      col=mix(col, ic, smoothstep(0.,-PX*1.5,d));
    }
    // yansıması
    float sh2; float dr=gc_berg(vec2(uv.x, 2.*y-uv.y), vec2(x,y), s, sh2);
    if(uv.y<y && dr<0.) col=mix(col, gc_ice(.5)*.45, .6*u_p[4]);
  }
  // sis
  float fogk=u_p[7]*exp(-abs(uv.y-hz)*5.)*(.6+.4*fbm4(uv*vec2(2.,6.)+t*.02));
  col=mix(col, mix(v7a_haze(),vec3(.9,.95,1.),.5), sat(fogk));
  return col;
}`,
    },

    /* ---------------- MERCAN ---------------- */
    coral: {
      name: 'Mercan Resifi & Lagün',
      params: ['Su yüzeyi (bölünmüş görüş)', 'Mercan yoğunluğu', 'Işık huzmeleri', 'Kostik desen', 'Balık sürüleri', 'Bulanıklık / derinlik', 'Mercan renk canlılığı', 'Akıntı'],
      glsl: TONES + `
float cr7_wl(){ return u_p[0]>.08 ? mix(-.05,.38,u_p[0]) : 2.; }
vec3 cr7_shallow(){ return mix(vec3(.08,.55,.62), v7a_norm(u_c[1])*.3, .25); }
vec3 cr7_deep(){ return mix(vec3(.01,.06,.16), u_c[0]*.6, .35); }
float cr7_caust(vec2 p){
  float t=u_time*.5;
  vec2 q=p*7.;
  float c=0.;
  for(int i=0;i<3;i++){ q=rot(1.1)*q+vec2(t,-t*.7); c+=abs(sin(q.x+sin(q.y))*sin(q.y*.9+sin(q.x*1.3))); }
  return pow(sat(1.-c/3.),5.)*4.;
}
vec3 cr7_coralc(float k){
  vec3 a=vec3(1.,.42,.3), b=vec3(1.,.32,.55), c=vec3(.62,.36,.95), d=vec3(1.,.78,.3);
  vec3 r=k<.25?mix(a,b,k*4.):k<.5?mix(b,c,(k-.25)*4.):k<.75?mix(c,d,(k-.5)*4.):mix(d,a,(k-.75)*4.);
  r=mix(r, v7a_norm(u_c[3])*.6, .3);
  return mix(vec3(lum(r)), r, mix(.25,1.4,u_p[6]));
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  float wl=cr7_wl()+sin(uv.x*12.+t*1.4)*.004;
  vec3 sh=cr7_shallow(), dp=cr7_deep();
  if(uv.y>wl){
    float hz=wl+.04;
    vec2 sp=vec2(.25*A, hz+.28);
    vec3 col=skyGrad(uv, hz, sp, .026, .6);
    float isl=hz+max(0., .07-abs(uv.x-.3)*.3+fbm4(vec2(uv.x*6.,3.))*.03);
    col=mix(col, mix(vec3(.15,.32,.14),u_c[0],.3), smoothstep(isl+PX,isl-PX,uv.y)*step(hz,uv.y+.002));
    if(uv.y<hz) col=mix(mix(sh,vec3(.5,.9,.95),.5), skyGrad(vec2(uv.x,2.*hz-uv.y),hz,sp,.03,.6), .4);
    return col;
  }
  float top=min(wl,.5);
  vec3 col=mix(dp, sh*.85, smoothstep(-.6, top+.25, uv.y)*.85);
  col=mix(col, dp, sat(u_p[5]*.6*smoothstep(.2,-.5,uv.y)));
  // ışık huzmeleri: yüzeyden yelpaze
  vec2 o=vec2(.15*A, top+.6);
  vec2 rdv=uv-o;
  float ang=atan(rdv.x, -rdv.y);
  float rays=pow(sat(fbm4(vec2(ang*9.+t*.04, 1.))+.45),3.)*smoothstep(-.55,top,uv.y);
  col+=mix(sh,vec3(.85,1.,1.),.6)*rays*u_p[2]*.38;
  // resif katmanları (uzak → yakın)
  for(int i=0;i<3;i++){
    float fi=float(i);
    float dk=1.-fi/2.;
    float base=-.12-fi*.13+fbm4(vec2(uv.x*(1.2+fi)+fi*5.+SEED2.x,fi))*.06;
    float sc=mix(.5,1.,fi/2.);
    // dallı mercan parmakları
    float F=mix(34.,14.,fi/2.);
    float fing=max(pow(abs(sin(uv.x*F+gnoise(vec2(uv.x*F*.3,fi))*3.)),12.), pow(abs(sin(uv.x*F*1.7+1.3+gnoise(vec2(uv.x*F*.5,fi+4.))*4.)),16.)*.7)*smoothstep(.3,.7,vnoise(vec2(uv.x*F*.1+fi*7.,fi)));
    fing*=.6+.4*gnoise(vec2(uv.x*F*2.,uv.y*20.));
    // yuvarlak beyin mercanları
    float mound=0.;
    vec2 cell=vec2(uv.x*mix(5.,2.5,fi/2.)+fi*3.3+SEED2.y, 0.);
    float cid=floor(cell.x); float cf=fract(cell.x)-.5;
    float rad=mix(.18,.42,hash11(cid*3.7+fi))*step(.3,hash11(cid*1.3+fi*2.));
    mound=sqrt(max(rad*rad-cf*cf,0.))*.55/mix(5.,2.5,fi/2.)*2.;
    float h=base+max(fing*mix(.05,.26,u_p[1])*sc, mound*mix(.4,1.2,u_p[1]));
    float m=smoothstep(h+PX*1.5,h-PX*1.5,uv.y);
    float k=fract(vnoise(vec2(uv.x*mix(3.,1.5,fi/2.)+fi*9.,fi))*1.7+fi*.31);
    vec3 cc=cr7_coralc(k);
    float up=sat((uv.y-base)/max(h-base,.01));
    cc*=.45+.75*up;
    cc*=.8+.3*(gnoise(uv*vec2(160.,120.)+fi)*.5+.5);              // polip dokusu
    cc*=.78+.22*sin(fbm4(uv*35.+fi)*22.);                          // beyin mercanı kıvrımları
    vec3 sand=mix(vec3(.44,.43,.36), v7a_norm(u_c[2])*.35, .2)*(.7+.3*(gnoise(uv*80.)*.5+.5))*mix(.6,1.,smoothstep(-.55,-.2,uv.y));
    vec3 g=mix(sand, cc, smoothstep(base+.004, base+.02, uv.y));
    g+=mix(sh,vec3(1.),.6)*cr7_caust(uv*vec2(1.,1.4)+fi)*u_p[3]*.14*(1.-dk*.6);
    g*=mix(vec3(.45,.75,1.), vec3(.9,.97,1.), fi/2.);              // suyun kırmızıyı yutması
    g=mix(g, mix(dp,sh,.55), dk*.65+u_p[5]*.25);
    col=mix(col, g, m);
  }
  // balık sürüleri
  for(int k=0;k<2;k++){
    float fk=float(k);
    vec2 c=vec2(sin(t*.07*(1.+fk)+fk*3.+SEED2.x)*A*.28, .02+fk*.14+sin(t*.13+fk)*.03);
    vec2 d=uv-c;
    vec2 g=(d+vec2(t*.01*(1.+fk),0.))*vec2(70.,110.);
    vec2 id=floor(g); vec2 f=fract(g)-.5-(hash22(id+fk*3.)-.5)*.6;
    float on=step(1.-u_p[4]*.45, hash12(id+fk*9.))*exp(-dot(d*vec2(1.,1.8),d*vec2(1.,1.8))*mix(30.,9.,u_p[4]));
    float fish=smoothstep(.2,.08,length(f*vec2(1.,2.4)));
    col=mix(col, mix(vec3(.8,.88,.95), v7a_norm(u_c[2])*.7, .3)*mix(.6,1.,smoothstep(-.3,.3,uv.y)), fish*on*.9);
  }
  col+=vec3(.8,.95,1.)*sparkles(uv+vec2(t*.01*u_p[7],0.), 60., .25+u_p[7]*.4, -.03)*.3;
  if(wl<1.){
    col=mix(col, mix(sh,vec3(.9,1.,1.),.6), smoothstep(.05,.0,wl-uv.y)*.4);
    col+=vec3(1.)*smoothstep(.003,.0,abs(uv.y-wl))*.7;
  }
  return col;
}`,
    },

    /* ---------------- MANTAR ORMANI ---------------- */
    mushroom: {
      name: 'Dev Mantar Ormanı',
      params: ['Mantar boyu', 'Mantar sayısı', 'Biyolüminesans', 'Spor parçacıkları', 'Sis katmanları', 'Zemin bitkileri', 'Kanopi ışığı', 'Renk sıcaklığı'],
      glsl: TONES + `
vec3 mu_glow(){ return mix(v7a_norm(u_c[3])*.6, vec3(.3,1.,.85), .35); }
// tek mantar: x merkez, taban y, boy h; dönen d<0 içinde; cap=1 şapka
float mu_one(vec2 p, vec2 b, float h, float bend, out float cap, out float under, out vec2 shd){
  float sx=p.x-b.x-bend*sin(sat((p.y-b.y)/h)*1.6)*h*.3;
  float sw=h*.07*(1.+.4*sat(1.-(p.y-b.y)/h));
  float stem=max(abs(sx)-sw, max(b.y-p.y, p.y-b.y-h));
  vec2 cq=vec2(p.x-b.x-bend*h*.3, p.y-b.y-h*.95);
  float R=h*mix(.35,.55,hash11(b.x*13.));
  float dome=length(cq*vec2(1.,1.8))-R;
  dome=max(dome, -cq.y-R*.08);
  cap=step(dome,stem);
  under=smoothstep(R*.25,-R*.05,cq.y)*step(dome,0.);
  shd=vec2(sx/sw, sat(cq.y/(R*.56))*(1.-.5*abs(cq.x)/R));
  return min(stem,dome);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  vec3 haze=mix(v7a_haze(), mu_glow()*.5, .25);
  // kanopi ve arka ışık
  vec3 col=mix(u_c[0]*.4, mix(u_c[1],u_c[2],.4)*.8, smoothstep(-.4,.5,uv.y)*u_p[6]+.1);
  col+=v7a_sunc()*exp(-length(uv-vec2(.15,.45))*2.5)*u_p[6]*.8;
  int N=int(3.+u_p[1]*5.);
  for(int L=0;L<4;L++){
    float fl=float(L);
    float dk=1.-fl/3.;            // 1 uzak … 0 yakın
    float gy=-.12-fl*.11;
    float sc=mix(.25,1.,fl/3.)*mix(.6,1.4,u_p[0]);
    // zemin
    float ground=gy+fbm4(vec2(uv.x*(2.+fl)+fl*9.,fl))*.04;
    vec3 gc=mix(v7a_green()*.35, u_c[0]*.3, .3)*(.6+.4*vnoise(uv*50.+fl));
    float cap, under; vec2 shd;
    float best=1e3, bc=0., bu=0.; vec2 bs=vec2(0.);
    for(int i=0;i<8;i++){
      if(i>=N) break;
      float fi=float(i);
      float hx=hash11(fi*7.1+fl*3.3+SEED2.x);
      float x=(hx-.5)*A*1.1+(fl-1.5)*.1;
      float h=sc*mix(.25,.6,hash11(fi*3.7+fl+SEED2.y));
      float bend=(hash11(fi*1.9+fl*5.)-.5);
      float d=mu_one(uv, vec2(x, ground-.01), h, bend, cap, under, shd);
      if(d<best){ best=d; bc=cap; bu=under; bs=shd; }
    }
    float m=smoothstep(PX*1.5,-PX*1.5,best);
    vec3 capc=mix(v7a_norm(u_c[3])*.35, v7a_norm(u_c[2])*.4, vnoise(uv*12.+fl));
    vec3 stemc=mix(vec3(.75,.7,.6), v7a_norm(u_c[2])*.5, .3)*.6;
    float stemS=.45+.6*sqrt(max(1.-bs.x*bs.x,0.))+.25*smoothstep(-.2,-1.,bs.x);
    float capS=.5+.7*bs.y;
    vec3 mc=mix(stemc*stemS, capc*capS, bc);
    mc*=mix(.7,1.,dk);
    // şapka benekleri
    mc=mix(mc, vec3(.9,.88,.8)*.7, bc*step(.86,vnoise(uv*vec2(70.,90.)+fl*3.))*.8);
    // alt yüz ışıması
    mc+=mu_glow()*bu*u_p[2]*1.6;
    mc=mix(mc, haze, dk*mix(.25,.75,u_p[4]));
    col=mix(col, mc, m);
    // ışıma halesi
    col+=mu_glow()*u_p[2]*.12*exp(-max(best,0.)*mix(60.,20.,dk))*(1.-m)*(1.-dk*.5);
    float gm=smoothstep(ground+PX,ground-PX,uv.y);
    vec3 gcl=gc*mix(1.,.55,smoothstep(ground,ground-.12,uv.y));
    col=mix(col, mix(gcl, haze, dk*mix(.45,.85,u_p[4])), gm);
    // zemin bitkileri
    float fern=step(uv.y, ground+.02*u_p[5]*abs(gnoise(vec2(uv.x*90.+fl*7.,fl))))*(1.-gm);
    col=mix(col, mix(v7a_green()*.5, haze, dk*.6), fern*u_p[5]);
    // katman sisi
    col=mix(col, haze, u_p[4]*.18*exp(-abs(uv.y-gy)*6.));
  }
  // sporlar
  col+=mix(mu_glow(), v7a_sunc(), .4)*sparkles(uv, 55., u_p[3]*.9, -.06)*(.6+u_p[2]);
  col+=mu_glow()*sparkles(uv*1.7+3., 110., u_p[3]*.7, -.03)*.5;
  col*=mix(vec3(.9,.95,1.1), vec3(1.1,.98,.85), u_p[7]);
  return col;
}`,
    },

    /* ---------------- BAMBU ---------------- */
    bamboo: {
      name: 'Sisli Bambu Ormanı',
      params: ['Sap yoğunluğu', 'Sap kalınlığı', 'Yapraklar', 'Sis', 'Işık huzmeleri', 'Rüzgar salınımı', 'Taş patika', 'Arka dağlar'],
      glsl: TONES + `
vec3 bb_green(){ return mix(vec3(.32,.46,.18), v7a_norm(u_c[1])*.32, .25); }
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  vec3 haze=mix(v7a_haze(), vec3(.8,.86,.8), .25);
  float hz=.08;
  vec2 sp=vec2((hash11(SEED2.x)-.5)*A*.5, .36);
  vec3 col=mix(skyGrad(uv, hz, sp, .03, .9), haze, .35);
  for(int i=0;i<3;i++){
    float fi=float(i);
    float r=hz+.05-fi*.04+fbm4(vec2(uv.x*(1.2+fi*.6)+fi*4.+SEED2.x,0.))*.24*u_p[7];
    col=mix(col, mix(bb_green()*.25, haze, .78-fi*.18), smoothstep(r+PX,r-PX,uv.y)*step(.04,u_p[7]));
  }
  float fogk=mix(.2,.75,u_p[3]);
  // orman zemini
  float gl=-.06;
  float gm=smoothstep(gl+PX,gl-PX,uv.y);
  vec3 floorc=mix(vec3(.2,.17,.1), bb_green()*.4, .4)*(.6+.5*(fbm4(uv*vec2(20.,60.))+.5));
  floorc=mix(floorc, haze, fogk*.5*smoothstep(-.5,gl,uv.y));
  col=mix(col, floorc, gm);
  // taş patika
  if(u_p[6]>.06){
    float d=gl-uv.y;
    float pw=.008+d*mix(.3,.7,u_p[6]);
    float px=sin(1./(d+.08)*.25+SEED2.x)*.06*d*4.;
    float path=smoothstep(pw,pw*.8,abs(uv.x-px))*step(uv.y,gl);
    vec2 g=vec2((uv.x-px)/(pw+.001)*2., 1./(d+.03)*1.4);
    vec2 cid; float e=v7a_vor(g, cid);
    vec3 pc=mix(vec3(.42,.42,.4), v7a_rock(), .4)*(.55+.4*hash12(cid))*mix(.55,1.,smoothstep(.0,.08,e));
    pc=mix(pc, bb_green()*.5, smoothstep(.06,.0,e)*.5);
    col=mix(col, mix(pc, haze, fogk*.4*smoothstep(-.3,gl,uv.y)), path*.95);
  }
  // bambu katmanları (uzak → yakın)
  for(int L=0;L<5;L++){
    float fl=float(L);
    float dk=1.-fl/4.;
    float base=gl-.01-fl*fl*.03;
    float freq=mix(30.,3.2,pow(fl/4.,.7))*mix(.6,1.4,u_p[0]);
    float sway=sin(t*.6+fl*1.7)*.004*u_p[5]*(1.+fl*1.5)*(uv.y-base);
    float gx=(uv.x+sway)*freq+fl*13.7+SEED2.x;
    float id=floor(gx);
    float fx=fract(gx);
    float pos=.25+.5*hash11(id*1.7+fl);
    float wdt=mix(.1,.28,u_p[1])*(.6+.6*hash11(id*3.1));
    float present=step(mix(.55,.1,u_p[0]), hash11(id*5.3+fl*2.));
    float d=(fx-pos)/wdt;
    float stalk=smoothstep(1.,.75,abs(d))*present*step(base,uv.y);
    float seg=mix(.14,.32,hash11(id*2.3))*mix(.35,1.6,fl/4.);
    float node=smoothstep(.035,.0,abs(fract((uv.y+hash11(id))/seg)-.5)-.465);
    float cyl=sqrt(max(1.-d*d,0.));
    vec3 sc=bb_green()*mix(.75,1.25,hash11(id*7.))*(.35+.75*cyl);
    sc*=mix(1.,.5,node);
    sc+=v7a_sunc()*.35*smoothstep(-.2,-.9,d)*u_p[4];
    sc=mix(sc*mix(.55,1.,dk), haze, dk*dk*fogk+dk*.08);
    col=mix(col, sc, stalk);
    // yaprak bulutları: sapların üst kısmında
    float lf=fbm4(vec2(uv.x*freq*.25+fl*7., uv.y*freq*.5)+vec2(t*.04*u_p[5],0.));
    float leaf=smoothstep(.3,.55, lf+.35)*u_p[2]*smoothstep(.05,.42,uv.y)*smoothstep(.6,.2,abs(d)*.2+.2);
    vec3 lc=bb_green()*(.5+.5*(gnoise(uv*freq*6.)*.5+.5));
    col=mix(col, mix(lc*mix(.6,1.,dk), haze, dk*dk*fogk+dk*.08), leaf*.9);
  }
  // ışık huzmeleri
  vec2 rd=uv-sp;
  float beams=pow(sat(fbm4(vec2(atan(rd.x,-rd.y)*7.,1.))+.4),4.)*smoothstep(.0,.9,length(rd));
  col+=v7a_sunc()*beams*u_p[4]*(.25+u_p[3]*.6)*.9;
  col+=v7a_sunc()*sparkles(uv, 60., u_p[4]*.3, -.02)*.35;
  return col;
}`,
    },

    /* ---------------- KUMTAŞI KEMER (3B) ---------------- */
    canyonarch: {
      name: '3B Kumtaşı Kemer & Doğal Köprü',
      params: ['Kemer açıklığı', 'Kemer kalınlığı', 'Kaya katmanları', 'Güneş açısı', 'Kum tepeleri', 'Uzak mesalar', 'Gökyüzü pusu', 'Erozyon dokusu'],
      glsl: RAY + TONES + `
vec3 ca_C(){ return vec3(0., 0., 9.); }
float ca_R(){ return mix(2.4,4.6,u_p[0]); }
float ca_r(){ return mix(.45,1.15,u_p[1]); }
float ca_ground(vec2 xz){ return (fbm4(xz*.08+SEED2)*1.4+.3)*u_p[4]+sin(xz.x*.15+xz.y*.05)*.2; }
float ca_ell(vec2 p, vec2 r){ float k=length(p/r); return (k-1.)*min(r.x,r.y); }
float ca_arch(vec3 p){
  vec3 q=p-ca_C();
  q.xz=rot(hash11(SEED2.x)*.6-.3)*q.xz;
  float R=ca_R(), th=ca_r();
  float H=R*mix(.7,1.05,hash11(SEED2.y*.3));
  float leg=(1.-sat(q.y/(H*.7)))*th*1.6;
  float outer=ca_ell(q.xy, vec2(R+th+leg, H+th*.8));
  float inner=ca_ell(q.xy-vec2(0.,-.4), vec2(R-th*.15, H-th*.2));
  float d=max(outer, -inner);
  d=max(d, abs(q.z)-th*mix(.9,1.6,hash11(SEED2.x*2.)));
  d=max(d, -p.y-1.);
  // aşınma: yatay oluklar ve kaba doku
  float groove=sin(p.y*mix(4.,9.,u_p[2])+fbm4(p.xz*.4)*4.)*.5+.5;
  d+=groove*.07*u_p[7]+(fbm3(p*1.1)-.5)*.3*u_p[7]+(vnoise3(p*4.)-.5)*.05;
  return d*.8;
}
float ca_mesa(vec3 p){
  // uzak mesa blokları
  vec3 q=p-vec3(-14.,0.,36.);
  float d=max(abs(q.x)-6., max(abs(q.z)-4., q.y-7.+fbm4(q.xz*.2)*1.5));
  vec3 q2=p-vec3(18.,0.,44.);
  d=min(d, max(abs(q2.x)-8., max(abs(q2.z)-5., q2.y-9.)));
  return d+(fbm3(p*.6)-.5)*1.2;
}
float ca_map(vec3 p, out float m){
  float g=p.y-ca_ground(p.xz);
  float a=ca_arch(p);
  float s=u_p[5]>.05 ? ca_mesa(p) : 1e3;
  m=0.; float d=g;
  if(a<d){ d=a; m=1.; }
  if(s<d){ d=s; m=2.; }
  return d;
}
float ca_d(vec3 p){ float m; return ca_map(p,m); }
vec3 ca_sun(){ float a=mix(.5,2.7,u_p[3])*(hash11(SEED2.y*1.7)>.5?1.:-1.); return normalize(vec3(sin(a), mix(.22,.6,hash11(SEED2.x*.9)), cos(a))); }
vec3 ca_sky(vec3 rd, vec3 L){
  float h=rd.y;
  vec3 sky=mix(mix(u_c[1],u_c[2],.55), mix(u_c[0],u_c[1],.35), smoothstep(-.02,.35,h));
  sky=mix(sky, v7a_haze(), u_p[6]*.6*exp(-max(h,0.)*6.));
  float sd=max(dot(rd,L),0.);
  sky+=v7a_sunc()*(pow(sd,600.)*20.+pow(sd,12.)*.4);
  return sky;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v7a_screen();
  float zm=max(abs(u_cam.x),.01);
  float yaw=u_cam.y*2.4+(hash11(SEED2.y)-.5)*.5;
  float dist=mix(11.,7.,sat(zm-1.));
  vec3 ta=ca_C()+vec3(0., ca_R()*.55, 0.);
  vec3 ro=ta+vec3(sin(yaw)*dist, 0., -cos(yaw)*dist);
  ro.y=1.2+max(-u_cam.z,0.)*45.-max(u_cam.z,0.)*2.;
  ro.y=max(ro.y, ca_ground(ro.xz)+.5);
  mat3 cam=v7a_look(ro, ta+vec3(0., u_cam.z*10., 0.));
  vec3 rd=normalize(cam*vec3(q, 1.6*zm));
  vec3 L=ca_sun();
  float t=.1, m=0.; bool hit=false;
  for(int i=0;i<96;i++){
    vec3 p=ro+rd*t;
    float d=ca_map(p,m);
    if(d<.002*t){ hit=true; break; }
    t+=d*.8;
    if(t>90.) break;
  }
  if(!hit) return ca_sky(rd,L);
  // ince ayar
  for(int i=0;i<4;i++){ float d=ca_d(ro+rd*t); t+=d*.6; }
  vec3 p=ro+rd*t;
  float e=.004*t+.01;
  vec3 n=normalize(vec3(ca_d(p+vec3(e,0,0))-ca_d(p-vec3(e,0,0)), ca_d(p+vec3(0,e,0))-ca_d(p-vec3(0,e,0)), ca_d(p+vec3(0,0,e))-ca_d(p-vec3(0,0,e))));
  float sh=1., st2=.08;
  for(int i=0;i<28;i++){ float h=ca_d(p+n*.02+L*st2); sh=min(sh, 10.*h/st2); st2+=clamp(h,.08,1.2); if(sh<.02||st2>30.) break; }
  sh=sat(sh);
  float ao=sat(ca_d(p+n*.5)/.5*.6+.4);
  vec3 stone=mix(vec3(.66,.33,.19), v7a_norm(u_c[3])*.4, .2);
  vec3 sand=mix(vec3(.76,.55,.37), v7a_norm(u_c[2])*.5, .2);
  float band=sin(p.y*mix(2.5,8.,u_p[2])+fbm4(p.xz*.3)*3.)*.5+.5;
  vec3 rockc=mix(stone*.75, mix(stone,vec3(.9,.7,.5),.35), band*mix(.4,1.,u_p[2]));
  rockc*=.8+.3*(gnoise(p.xy*6.+p.z)*.5+.5);
  vec3 alb=m==0. ? sand*(.75+.3*(gnoise(p.xz*2.)*.5+.5)) : rockc;
  vec3 sunc=v7a_sunc()*1.25;
  vec3 amb=mix(u_c[1], u_c[2], .4)*.32;
  float dif=sat(dot(n,L));
  vec3 col=alb*(sunc*dif*sh + amb*ao*(.6+.4*n.y) + sand*sunc*.25*sat(-n.y)*step(.5,m));
  float fog=1.-exp(-t*mix(.006,.03,u_p[6]));
  col=mix(col, ca_sky(rd,L)*.95, fog);
  return col;
}`,
    },

    /* ---------------- TUZ DÜZLÜĞÜ (3B analitik) ---------------- */
    saltflat: {
      name: '3B Aynalı Tuz Düzlüğü',
      params: ['Ayna suyu (yansıma)', 'Tuz poligonları', 'Ufuk dağları', 'Bulutlar', 'Güneş yüksekliği', 'Su dalgalanması', 'Araç izi', 'Ufuk pusu'],
      glsl: RAY + TONES + `
vec3 sf_sun(){ float e=mix(.02,.55,u_p[4]); float a=(hash11(SEED2.x)-.5)*1.4; return normalize(vec3(sin(a)*cos(e), sin(e), cos(a)*cos(e))); }
vec3 sf_sky(vec3 rd, vec3 L){
  float h=max(rd.y,0.);
  vec3 sky=mix(mix(u_c[1],u_c[2],.6)*1.05, u_c[0]*.75+u_c[1]*.25, smoothstep(0.,.3,h));
  sky=mix(sky, mix(u_c[1],u_c[3],.35)*.8, .35*exp(-abs(h-.06)*14.));
  float sd=max(dot(rd,L),0.);
  sky+=v7a_sunc()*(pow(sd,900.)*25.+pow(sd,10.)*.35+pow(sd,3.)*.1);
  // bulutlar: yüksek düzleme izdüşüm
  if(u_p[3]>.03 && rd.y>.005){
    vec2 cp=rd.xz/(rd.y+.16)*.75+SEED2*.1+vec2(u_time*.004,0.);
    float n=fbm(cp*2.2)+.25*fbm(cp*7.);
    float c=smoothstep(.05,.3,n+.32*u_p[3]-.22);
    float shade=sat(fbm(cp*2.2+vec2(.06,.04))-n+.5);
    vec3 cc=mix(mix(u_c[1],u_c[0],.4)*.8, mix(vec3(1.),v7a_sunc(),.5)*1.15, shade*.7+pow(sd,3.)*.5);
    sky=mix(sky, cc, c*smoothstep(.0,.05,rd.y));
  }
  // ufuk dağları (yön açısına göre)
  if(u_p[2]>.03){
    float az=atan(rd.x, rd.z);
    float mh=.004+ridged(vec2(az*3.+SEED2.x,0.),5)*.09*u_p[2]*(.4+.6*smoothstep(-.2,.3,fbm4(vec2(az*1.2,4.))));
    float m=smoothstep(mh+.002, mh-.002, rd.y);
    float mt=sat((mh-rd.y)/max(mh,.001));
    sky=mix(sky, mix(mix(u_c[0]*.6+u_c[1]*.4, v7a_haze(), .45+.4*u_p[7]), u_c[0]*.4, mt*.4), m);
  }
  sky=mix(sky, v7a_haze(), u_p[7]*.6*exp(-abs(rd.y)*25.));
  return sky;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v7a_screen();
  float zm=max(abs(u_cam.x),.01);
  float yaw=u_cam.y*2.4;
  vec3 ro=vec3(0., 1.4+max(-u_cam.z,0.)*120.-max(u_cam.z,0.)*4., 0.);
  ro.y=max(ro.y,.25);
  float pitch=-.02+u_cam.z*1.6;
  mat3 cam=v7a_look(ro, ro+vec3(sin(yaw), pitch, cos(yaw)));
  vec3 rd=normalize(cam*vec3(q, 1.6*zm));
  vec3 L=sf_sun();
  if(rd.y>=0.) return sf_sky(rd,L);
  float t=-ro.y/rd.y;
  vec3 p=ro+rd*t;
  // tuz kabuğu poligonları
  vec2 cid;
  float pscale=mix(.3,1.2,u_p[1])/(1.+ro.y*.06);
  float edge=v7a_vor(p.xz*pscale, cid);
  float aa=sat(1.-t*pscale*.012);
  float ridge=smoothstep(.08+.04*(1.-aa),.0,edge)*u_p[1];
  vec3 salt=mix(vec3(.8,.79,.76), v7a_norm(u_c[2])*.75, .15)*(.72+.18*hash12(cid))*(.85+.15*smoothstep(.0,.35,edge));
  salt=mix(salt, vec3(1.05), ridge*aa*.75);
  salt*=.92+.08*(gnoise(p.xz*4.)*.5+.5);
  // ince su tabakası: ayna yansıması
  vec3 n=vec3(0.,1.,0.);
  n.xz+=vec2(gnoise(p.xz*1.5+u_time*.1), gnoise(p.xz*1.5+7.-u_time*.1))*.03*u_p[5]*aa;
  n=normalize(n);
  vec3 rr=reflect(rd,n);
  vec3 refl=sf_sky(rr,L);
  float fr=.3+.7*pow(1.-max(-rd.y,0.),4.);
  float wpatch=fbm4(p.xz*.035+SEED2)+.5;
  float wet=sat(u_p[0]*1.4-.25+(wpatch-.5)*1.2)*(1.-ridge*.7*aa);
  vec3 lit=salt*(mix(u_c[1],u_c[2],.5)*.5+v7a_sunc()*max(L.y,0.)*.9);
  vec3 col=mix(lit, refl, sat(wet*fr*1.1));
  // araç izi
  if(u_p[6]>.05){ float tr=smoothstep(.12,.0,abs(abs(p.x-sin(p.z*.03)*2.)-.9))*u_p[6]*aa; col=mix(col, col*.55+salt*.1, tr*.6); }
  col=mix(col, sf_sky(vec3(rd.x,.001,rd.z),L), sat(1.-exp(-t*mix(.002,.02,u_p[7]))));
  return col;
}`,
    },

    /* ---------------- HAVADAN DESEN ---------------- */
    aerial: {
      name: 'Havadan Desenler (drone / uydu)',
      params: ['Tarla ölçeği', 'Nehir', 'Yollar', 'Kıyı & deniz', 'Orman lekeleri', 'Bulut gölgeleri', 'Yerleşim', 'Mevsim tonu'],
      glsl: TONES + `
vec3 ae_field(float h){
  vec3 g=v7a_green()*1.2, w=mix(vec3(.78,.62,.32), v7a_norm(u_c[2])*.5, .3), b=mix(vec3(.45,.33,.22), v7a_rock(), .3);
  vec3 c=h<.45?g*(.65+.7*h):h<.75?w*(.75+.35*h):b*(.8+.3*h);
  return mix(c, mix(w,vec3(.9,.75,.5),.3), u_p[7]*.6*step(.25,h));
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time;
  vec2 p=uv*mix(2.,6.,u_p[0])+SEED2*.3;
  // bölgesel yönelim: tarlalar farklı açılarda
  float ang=floor(fbm4(p*.25)*4.)*.5;
  vec2 pr=rot(ang)*p;
  vec2 sz=vec2(.6,.9)+vec2(hash12(floor(pr*.5)),hash12(floor(pr*.5)+3.))*.6;
  vec2 cid=floor(pr/sz); vec2 f=fract(pr/sz);
  float h=hash12(cid+SEED2);
  vec3 col=ae_field(h);
  // ekin sıraları
  float rowd=hash12(cid+5.)>.5?f.x:f.y;
  col*=.85+.15*sin(rowd*mix(40.,90.,hash12(cid+9.)));
  // sınır çitleri
  float bord=min(min(f.x,1.-f.x)*sz.x, min(f.y,1.-f.y)*sz.y);
  col=mix(col, v7a_green()*.35, smoothstep(.02,.0,bord)*.8);
  // orman
  float fo=fbm(p*.5+11.);
  float forest=smoothstep(.22-u_p[4]*.3,.26-u_p[4]*.3,fo)*step(.05,u_p[4]);
  vec2 tg=p*55.; vec2 tid=floor(tg);
  float tree=smoothstep(.5,.15,length(fract(tg)-.5-(hash22(tid)-.5)*.5));
  vec3 fc=v7a_green()*(.3+.45*tree)*(.8+.4*hash12(tid));
  col=mix(col, fc, forest);
  // nehir
  if(u_p[1]>.05){
    vec2 pc=uv*mix(2.,6.,u_p[0]);
    float rx=sin(pc.y*.9+SEED2.x)*.5+fbm4(vec2(pc.y*.6,SEED2.y))*1.2+(hash11(SEED2.x)-.5)*A;
    float rw=mix(.03,.16,u_p[1]);
    float rd=abs(pc.x-rx);
    vec3 rc=mix(u_c[0]*.5+vec3(.02,.06,.08), mix(u_c[1],u_c[2],.5)*.5, .3);
    col=mix(col, mix(vec3(.75,.68,.5),col,.4), smoothstep(rw*1.8,rw*1.2,rd));
    col=mix(col, rc, smoothstep(rw,rw*.7,rd));
  }
  // yollar
  if(u_p[2]>.05){
    vec2 pc=uv*mix(2.,6.,u_p[0]);
    float r1=abs(dot(pc, normalize(vec2(.35,1.)))-(hash11(SEED2.y)-.5)*1.5+sin(pc.y*.6)*.2);
    float r2=abs(dot(pc, normalize(vec2(1.,.2)))-(hash11(SEED2.x*3.)-.5)*1.2+fbm4(pc*.3)*.4);
    float road=min(r1,r2);
    col=mix(col, vec3(.55,.53,.5), smoothstep(.025,.012,road)*u_p[2]);
  }
  // yerleşim
  if(u_p[6]>.05){
    float town=smoothstep(.82-u_p[6]*.25,.9-u_p[6]*.25, fbm4(p*.35+5.)+.5);
    vec2 g=rot(ang)*p*16.; vec2 bid=floor(g); vec2 bf=fract(g);
    float roof=step(.45,hash12(bid))*smoothstep(.12,.2,min(min(bf.x,1.-bf.x),min(bf.y,1.-bf.y)));
    vec3 rc=mix(vec3(.65,.3,.22), vec3(.8), hash12(bid+2.));
    col=mix(col, rc*(.7+.3*bf.y), roof*town);
  }
  // kıyı ve deniz
  if(u_p[3]>.05){
    float cst=uv.x*.8+uv.y*.4+fbm(p*.4)*.6-mix(.9,-.3,u_p[3]);
    vec3 shallow=mix(vec3(.12,.5,.55), v7a_norm(u_c[3])*.35, .2), deep=mix(vec3(.02,.1,.2), u_c[0]*.6, .4);
    vec3 sea=mix(shallow, deep, sat(cst*3.));
    float surf=smoothstep(.012,.0,abs(cst-.006+sin(p.y*20.+t*.5)*.002));
    col=mix(col, mix(vec3(.85,.78,.6),col,.3), smoothstep(-.025,-.0,cst)*(1.-step(0.,cst)));
    col=mix(col, sea, step(0.,cst));
    col+=vec3(.9)*surf*.6;
  }
  // bulut gölgeleri
  float cs=fbm(uv*1.4+vec2(t*.01,0.)+SEED2);
  col*=1.-u_p[5]*.45*smoothstep(.1,.3,cs);
  col=mix(col, vec3(.95), smoothstep(.65,1.,u_p[5])*.7*smoothstep(.28,.5,fbm(uv*1.4+vec2(t*.01,0.)+SEED2+vec2(.15,.1))));
  // güneş tonu
  col*=mix(vec3(1.), v7a_sunc(), .35)*1.1;
  return col;
}`,
    },
  });
})();
