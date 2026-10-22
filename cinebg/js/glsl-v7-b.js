/* CineBG Studio v7-b — şehir ve iç mekân motorları: kütüphane, liminal koridor, havuz, gece pazarı, çatılar, liman, istasyon, stadyum.
   Hepsi gerçek 3B kameradır (u_cam.x yakınlaştırma / ayna, u_cam.y sapma ve yana kayma, u_cam.z yükseklik ve eğim, u_roll yatırma).
   Birimler metredir; yardımcılar her motorda b7_ önekiyle tekrar tanımlanır çünkü her motor ayrı derlenir. */
(function () {
  const CB = window.CB;

  const B7 = `
vec2 b7_screen(){
  vec2 q=rot(u_roll)*((gl_FragCoord.xy-.5*u_res)/u_res.y);
  if(u_cam.x<0.) q.x=-q.x;
  return q;
}
mat3 b7_look(vec3 ro, vec3 ta){
  vec3 ww=normalize(ta-ro);
  vec3 uu=normalize(cross(abs(ww.y)>.98?vec3(0,0,1):vec3(0,1,0),ww));
  return mat3(uu, cross(ww,uu), ww);
}
float b7_box(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float b7_rbox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
float b7_cyl(vec3 p, float r, float h){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
float b7_seg(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
// ışın üzerindeki bir noktaya olan en kısa uzaklık (parıltılar için)
float b7_glow(vec3 ro, vec3 rd, vec3 lp, float tmax, out float tl){ vec3 v=lp-ro; tl=dot(v,rd); if(tl<0.||tl>tmax) return 1e3; return length(v-rd*tl); }
vec3 b7_warm(){ return mix(vec3(1.,.74,.45),u_c[3],.2); }`;

  Object.assign(CB.ENGINES, {
    /* ------------------------------------------------------------------ */
    library3d: {
      name: '3B Kütüphane Salonu',
      params: ['Salon yüksekliği', 'Raf yoğunluğu', 'Galeri katı', 'Okuma lambaları', 'Işık huzmeleri', 'Gece', 'Koridor genişliği', 'Kamera yüksekliği'],
      glsl: B7 + `
float l7_W(){ return mix(1.8,4.2,u_p[6]); }
float l7_H(){ return mix(5.5,15.,u_p[0]); }
float l7_G(){ return l7_H()*.46; }
const float L7_SK=6.;   // tavan penceresi aralığı
// m: 0 zemin, 1 tavan, 2 raf dolabı, 3 kitap, 4 galeri, 5 masa, 6 lamba, 7 merdiven, 8 kiriş
float l7_map(vec3 p, out float m){
  float W=l7_W(), H=l7_H(), G=l7_G();
  float ax=abs(p.x);
  float d=p.y; m=0.;
  float ce=H-p.y; if(ce<d){ d=ce; m=1.; }
  // kirişler
  float bz=abs(mod(p.z,L7_SK)-L7_SK*.5)-.18;
  float beam=max(bz, H-.55-p.y); if(beam<d){ d=beam; m=8.; }
  // raf duvarı: düz kitap yüzeyi + öne çıkan raf tahtaları ve dikmeler
  float rowh=mix(.5,.36,u_p[1]);
  float wall=W-ax;
  if(wall<d){ d=wall; m=3.; }
  float yl=mod(p.y,rowh);
  float board=b7_box(vec3(ax-(W-.04), min(yl,rowh-yl), 0.), vec3(.05,.025,1e3));
  float zl=mod(p.z,1.25)-.625;
  float post=b7_box(vec3(ax-(W-.05), 0., abs(zl)-.625), vec3(.06,1e3,.035));
  float sb=max(min(board,post), p.y-H+.6);
  if(sb<d){ d=sb; m=2.; }
  // galeri balkonu ve korkuluk
  if(u_p[2]>.25){
    float gl=b7_box(vec3(ax-(W-.55), p.y-G, 0.), vec3(.56,.09,1e3));
    float rail=b7_box(vec3(ax-(W-1.08), p.y-(G+1.), 0.), vec3(.03,.03,1e3));
    float posts=b7_box(vec3(ax-(W-1.08), p.y-(G+.5), mod(p.z,1.4)-.7), vec3(.025,.5,.025));
    float g=min(gl,min(rail,posts)); if(g<d){ d=g; m=4.; }
  }
  // orta masalar ve yeşil abajurlar
  float tz=mod(p.z,9.)-4.5;
  float tb=b7_box(vec3(p.x, p.y-.74, tz), vec3(.55,.035,2.2));
  float tl=b7_box(vec3(abs(p.x)-.45, p.y-.37, abs(tz)-2.05), vec3(.04,.37,.04));
  float wide=step(2.5,W);
  float tab=min(tb,tl)+(1.-wide)*1e3; if(tab<d){ d=tab; m=5.; }
  vec3 lq=vec3(p.x, p.y-1.08, abs(tz)-1.1);
  float lamp=max(length(lq.xz*vec2(1.,.7))-.16+lq.y*.35, abs(lq.y)-.07);
  lamp=min(lamp, b7_cyl(lq+vec3(0.,.17,0.), .015,.17));
  if(lamp<d && u_p[3]>.05 && wide>.5){ d=lamp; m=6.; }
  // yürüyen merdiven: rafa yaslı iki dikme ve basamaklar
  float lz=mod(p.z+3.,13.)-6.5;
  float side=hash11(floor((p.z+3.)/13.)*1.7+(p.x<0.?5.:0.)+u_seed);
  if(side>.35){
    float top=min(3.6,G-.2);
    vec3 P=vec3(ax,p.y,lz);
    float r1=b7_seg(P, vec3(W-.75,0.,-.25), vec3(W-.06,top,-.25), .025);
    float r2=b7_seg(P, vec3(W-.75,0.,.25), vec3(W-.06,top,.25), .025);
    float yk=min((floor(p.y/.32)+.5)*.32, top-.1);
    float xk=W-.75+(yk/top)*.69;
    float rung=max(length(vec2(ax-xk,p.y-yk))-.018, abs(lz)-.25);
    float ld=min(min(r1,r2),rung);
    if(ld<d){ d=ld; m=7.; }
  }
  return d;
}
float l7_d(vec3 p){ float m; return l7_map(p,m); }
vec3 l7_sun(){ return normalize(vec3((hash11(u_seed*.41)-.5)*1.2, 1., (hash11(u_seed*.83)-.5)*.9)); }
// tavan pencerelerinden geçen güneş
float l7_lit(vec3 p){
  vec3 L=l7_sun(); float H=l7_H();
  vec3 hp=p+L*(H-p.y)/L.y;
  float wz=abs(mod(hp.z,L7_SK)-L7_SK*.5);
  float inz=smoothstep(.06,0.,wz-mix(1.,2.2,u_p[6]*.5+.3));
  float inx=smoothstep(.06,0.,abs(hp.x)-l7_W()*.55);
  float mull=1.-.8*smoothstep(.05,0.,abs(fract(hp.x*1.2)-.5)-.47);
  return inz*inx*mull;
}
float l7_march(vec3 ro, vec3 rd, out float m){
  float t=.02; m=-1.;
  for(int i=0;i<100;i++){
    float d=l7_map(ro+rd*t,m);
    if(d<.0015*t+.001) return t;
    t+=d*.9;
    if(t>80.) break;
  }
  m=-1.; return -1.;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float W=l7_W(), H=l7_H(), G=l7_G();
  float night=u_p[5];
  float hgt=mix(1.25,G+1.5,u_p[7]*u_p[7])+max(-u_cam.z,0.)*30.;
  hgt=clamp(hgt-max(u_cam.z,0.)*4.,.3,H-.8);
  float yaw=u_cam.y*1.8+(hash11(u_seed*.21)-.5)*.5;
  vec3 ro=vec3(clamp(u_cam.y*W*.9+(hash11(u_seed*.6)-.5)*W*.5,-W+.5,W-.5), hgt, hash11(u_seed*.33)*200.);
  float pitch=.05-sat((hgt-2.)/(H*.7))*.65+u_cam.z*1.5;
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.3*zm));
  float m;
  float t=l7_march(ro,rd,m);
  vec3 sunc=mix(vec3(1.,.92,.78),u_c[2],.35)*3.*(1.-night);
  vec3 warm=b7_warm();
  vec3 fogc=mix(mix(u_c[1],u_c[2],.45)*.55, u_c[0]*.5+warm*.03, night);
  vec3 col;
  if(t<0.) col=fogc;
  else {
    vec3 p=ro+rd*t;
    vec2 e=vec2(.002,0.);
    vec3 n=normalize(vec3(l7_d(p+e.xyy)-l7_d(p-e.xyy), l7_d(p+e.yxy)-l7_d(p-e.yxy), l7_d(p+e.yyx)-l7_d(p-e.yyx)));
    vec3 wood=mix(vec3(.28,.16,.08), u_c[1]*.6, .3);
    vec3 alb=wood;
    float emis=0.;
    if(m<.5){ vec2 b=fract(p.xz*vec2(1.5,.8)+vec2(0.,floor(p.x*1.5)*.5)); alb=mix(vec3(.32,.2,.12),u_c[1],.25)*(.75+.25*step(.04,b.x)*step(.03,b.y))*(.85+.3*vnoise(p.xz*vec2(3.,20.))); if(abs(p.x)<W*.45) alb=mix(alb, mix(u_c[3],vec3(.4,.08,.06),.5)*.5, .7); }
    else if(m<1.5){ alb=mix(u_c[2],vec3(.85,.8,.7),.5)*.6; float sk=step(abs(mod(p.z,L7_SK)-L7_SK*.5),mix(1.,2.2,u_p[6]*.5+.3))*step(abs(p.x),W*.55); emis=sk; }
    else if(m<2.5){ alb=wood*(.8+.2*vnoise(p.yz*vec2(8.,1.))); }
    else if(m<3.5){
      float rowh=mix(.5,.36,u_p[1]);
      float aa=exp(-t*.04);
      vec2 bk=vec2(floor(p.z/mix(.035,.06,hash12(vec2(floor(p.y/rowh),3.)))), floor(p.y/rowh));
      float h=hash12(bk+SEED2);
      vec3 bc=h<.25?vec3(.35,.08,.06):h<.45?vec3(.08,.18,.12):h<.6?vec3(.12,.12,.25):h<.75?mix(u_c[3],u_c[1],.5):h<.9?vec3(.45,.32,.18):u_c[2]*.6;
      float top=fract(p.y/rowh);
      float tall=mix(.55,.9,hash12(bk+7.));
      alb=mix(bc*(1.1+.5*hash12(bk+2.)), vec3(.02), step(tall,top));
      alb*=.85+.15*step(.15,fract(p.z/mix(.035,.06,hash12(vec2(bk.y,3.)))));
      alb+=vec3(.2,.16,.06)*step(.62,fract(top*7.))*step(fract(top*7.),.7)*step(top,tall);
      alb=mix(mix(u_c[1]*.3+vec3(.12,.07,.04),u_c[3]*.15,.3), alb, .35+.65*aa);
      if(p.y>H-.6) alb=wood*.7;
    }
    else if(m<4.5){ alb=wood*.8; }
    else if(m<5.5){ alb=wood*.9; }
    else if(m<6.5){ alb=vec3(.05,.35,.15); emis=step(n.y,-.2)*2.+.4; }
    else if(m<7.5){ alb=vec3(.35,.25,.15); }
    else alb=wood*.6;
    vec3 L=l7_sun();
    float sl=l7_lit(p+n*.01);
    if(sl>0.){ float mm; float ts=l7_march(p+n*.02, L, mm); if(ts>0. && (p+L*ts).y<H-.6) sl=0.; }
    vec3 c=alb*sunc*sl*max(dot(n,L),0.);
    // tavandan gelen yumuşak gök ışığı
    float sky=sat(.35+.65*n.y)*(.4+.6*smoothstep(0.,H,p.y));
    c+=alb*mix(mix(u_c[2],vec3(1.),.3)*.55, u_c[0]*.18, night)*sky;
    // okuma lambaları
    float lo=u_p[3]*mix(.35,1.,night)*step(2.5,W);
    float tz0=(floor(p.z/9.)+.5)*9.;
    for(int k=-1;k<=1;k++){
      for(int s=0;s<2;s++){
        vec3 lp=vec3(0.,1.02,tz0+float(k)*9.+(float(s)*2.-1.)*1.1);
        vec3 tl=lp-p; float dl=length(tl);
        c+=alb*warm*max(dot(n,tl/dl),0.)*lo*1.6/(1.+dl*dl*1.2);
      }
    }
    // gece avize parıltısı
    c+=alb*warm*night*.12*smoothstep(H*.3,H,p.y);
    float ao=sat(l7_d(p+n*.2)/.2)*.6+.4;
    col=c*ao;
    col+=emis*(m<1.5 ? mix(u_c[2],vec3(1.),.5)*2.2*(1.-night)+u_c[0]*.1*night : vec3(.2,1.,.4)*lo);
    col=mix(col, fogc, 1.-exp(-t*mix(.012,.05,u_p[4])));
  }
  // hacimsel huzmeler
  if(u_p[4]>.03 && night<.9){
    float tm=t<0.?60.:min(t,60.); float acc=0.;
    for(int i=0;i<22;i++){
      float s=(float(i)+hash12(gl_FragCoord.xy+fract(u_time)))/22.;
      vec3 sp=ro+rd*tm*s;
      acc+=l7_lit(sp)*(.55+.45*vnoise3(sp*1.5+vec3(0.,0.,u_time*.04)));
    }
    col+=sunc*acc/22.*min(tm,40.)*.022*u_p[4];
  }
  // lamba parıltıları
  float tz0=(floor(ro.z/9.)+.5)*9.;
  float tmax=t<0.?1e3:t+.05;
  for(int k=0;k<6;k++){
    for(int s=0;s<2;s++){
      vec3 lp=vec3(0.,1.02,tz0+float(k)*9.+(float(s)*2.-1.)*1.1);
      float tl; float dd=b7_glow(ro,rd,lp,tmax,tl);
      col+=warm*u_p[3]*step(2.5,W)*mix(.3,1.,night)*(exp(-dd*dd*90.)*.8+exp(-dd*3.)*.05)/(1.+tl*.04);
    }
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    corridor: {
      name: 'Liminal Koridor (otel / backrooms)',
      params: ['Koridor genişliği', 'Tavan yüksekliği', 'Kapı sıklığı', 'Floresan ışık', 'Titreme & sönük lamba', 'Halı deseni', 'Duvar kâğıdı (sarı backrooms)', 'Derinlik sisi'],
      glsl: B7 + `
float c7_W(){ return mix(.85,1.7,u_p[0]); }
float c7_H(){ return mix(2.35,3.4,u_p[1]); }
float c7_D(){ return mix(5.5,2.6,u_p[2]); }
const float C7_LP=2.6;
// m: 0 halı, 1 tavan, 2 duvar, 3 kapı, 4 kasa, 5 süpürgelik, 6 lamba paneli, 7 açıklık (karanlık)
float c7_map(vec3 p, out float m){
  float W=c7_W(), H=c7_H(), D=c7_D();
  float ax=abs(p.x);
  float side=p.x<0.?0.:1.;
  float d=p.y; m=0.;
  float ce=H-p.y; if(ce<d){ d=ce; m=1.; }
  float zz=p.z+side*D*.5;
  float id=floor(zz/D);
  float zl=zz-(id+.5)*D;
  float h=hash12(vec2(id,side)+SEED2);
  float open=step(.9,h); // ara sıra karanlık bir geçit
  float rec=b7_box(vec3(ax-(W+.09), p.y-1.05, zl), vec3(.1, 1.06, mix(.46,.75,open)));
  float wall=max(W-ax, -rec);
  if(open>.5) wall=max(W-ax, -b7_box(vec3(ax-(W+2.), p.y-1.1, zl), vec3(2.05, 1.1, .75)));
  if(wall<d){ d=wall; m=2.; }
  if(open<.5){
    float door=W+.1-ax; if(door<d && rec<0.){ d=door; m=3.; }
    float fr=b7_box(vec3(ax-(W-.015), p.y-1.08, zl), vec3(.03,1.12,.54));
    fr=max(fr, -b7_box(vec3(ax-(W-.015), p.y-1.05, zl), vec3(.05,1.06,.47)));
    if(fr<d){ d=fr; m=4.; }
  } else {
    float back=W+3.9-ax; if(back<d){ d=back; m=7.; }
  }
  float sk=max(W-.02-ax, p.y-.1); if(sk<d && rec>0.){ d=sk; m=5.; }
  vec3 lq=vec3(p.x, p.y-H, mod(p.z,C7_LP)-C7_LP*.5);
  float lp=b7_box(lq, vec3(.32,.03,.62)); if(lp<d){ d=lp; m=6.; }
  return d;
}
float c7_d(vec3 p){ float m; return c7_map(p,m); }
float c7_on(float id){
  float h=hash11(id*1.37+u_seed);
  float dead=step(h, u_p[4]*.35);
  float fl=step(1.-u_p[4]*.5, hash11(id*3.1+u_seed))*step(.5, hash11(floor(u_time*9.+id)));
  return (1.-dead)*(1.-fl*.85);
}
vec3 c7_light(){ return mix(mix(vec3(.92,1.,.92),vec3(1.,.95,.8),u_p[6]), u_c[2], .25); }
float c7_march(vec3 ro, vec3 rd, out float m){
  float t=.02; m=-1.;
  for(int i=0;i<100;i++){
    float d=c7_map(ro+rd*t,m);
    if(d<.001*t+.001) return t;
    t+=d*.95;
    if(t>90.) break;
  }
  m=-1.; return -1.;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float W=c7_W(), H=c7_H();
  float hgt=clamp(1.55-max(u_cam.z,0.)*6.+max(-u_cam.z,0.)*4.,.2,H-.25);
  float yaw=u_cam.y*1.3+(hash11(u_seed*.47)-.5)*.12;
  vec3 ro=vec3(clamp(u_cam.y*W*.7,-W+.25,W-.25), hgt, hash11(u_seed*.29)*300.);
  float pitch=max(-.03+u_cam.z*.8-sat((hgt-1.8)/1.2)*.25,-.32);
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.25*zm));
  float m; float t=c7_march(ro,rd,m);
  vec3 lc=c7_light()*mix(.4,1.6,u_p[3]);
  vec3 fogc=lc*.05+u_c[0]*.15;
  vec3 col=fogc;
  if(t>0.){
    vec3 p=ro+rd*t;
    vec2 e=vec2(.0015,0.);
    vec3 n=normalize(vec3(c7_d(p+e.xyy)-c7_d(p-e.xyy), c7_d(p+e.yxy)-c7_d(p-e.yxy), c7_d(p+e.yyx)-c7_d(p-e.yyx)));
    vec3 alb; float emis=0.;
    vec3 yel=mix(vec3(.78,.7,.42), mix(u_c[2],u_c[1],.3), .35);
    vec3 paper=mix(mix(u_c[2],vec3(.82,.78,.7),.5), yel, u_p[6]);
    if(m<.5){
      vec2 g=p.xz*vec2(2.2,2.2);
      float pat=step(.5,fract(g.x+floor(g.y)*.5))*step(.3,fract(g.y));
      float dia=smoothstep(.12,.0,abs(fract((p.x+p.z)*1.4)-.5)-.38);
      vec3 cpt=mix(mix(u_c[3],vec3(.35,.08,.08),.5), mix(u_c[1],vec3(.4,.35,.2),.5), u_p[6]);
      alb=cpt*(.55+.25*vnoise(p.xz*30.))*(1.-u_p[5]*.35*max(pat,dia));
      alb=mix(alb, cpt*1.4, u_p[5]*.4*step(abs(p.x),W*.6)*step(W*.5,abs(p.x)));
    } else if(m<1.5){ alb=mix(vec3(.8,.78,.72),paper,.4)*(.85+.15*step(.04,fract(p.x*1.6))*step(.04,fract(p.z*1.6))); }
    else if(m<2.5){ alb=paper*(.82+.18*step(.5,fract(p.z*4.+vnoise(p.yz*2.)*.2))*(1.-u_p[6]*.7))*(.9+.1*vnoise(p.yz*6.)); alb*=1.-.3*smoothstep(.95,1.05,p.y)*step(p.y,1.05); }
    else if(m<3.5){ float hd=hash12(vec2(floor(p.z/2.),p.x>0.?1.:0.)); alb=mix(mix(vec3(.3,.18,.1),u_c[1]*.5,.4), mix(u_c[3],vec3(.5),.5)*.6, step(.7,hd)); alb*=.85+.15*step(.08,abs(fract((p.y-.2)/.7)-.5)); emis=0.; }
    else if(m<4.5){ alb=vec3(.85,.83,.78)*.8; }
    else if(m<5.5){ alb=vec3(.25,.2,.15); }
    else if(m<6.5){ float id=floor(p.z/C7_LP); emis=c7_on(id)*step(n.y,-.5); alb=vec3(.9); }
    else { alb=vec3(.01); }
    vec3 c=vec3(0.);
    float base=floor(p.z/C7_LP);
    for(int k=-2;k<=2;k++){
      float id=base+float(k);
      vec3 lp=vec3(0.,H-.08,(id+.5)*C7_LP);
      vec3 tl=lp-p; float dl=length(tl);
      float ndl=max(dot(n,tl/dl),0.);
      float down=sat(tl.y/dl*1.2+.4);
      c+=alb*lc*ndl*down*c7_on(id)*1.4/(1.+dl*dl*.55);
    }
    float ao=sat(c7_d(p+n*.18)/.18)*.55+.45;
    ao*=1.-.3*smoothstep(.3,0.,min(p.y, W-abs(p.x)));
    c+=alb*fogc*.6;
    col=c*ao+emis*lc*1.8*(m>5.5&&m<6.5?1.:0.);
    col=mix(col, fogc, 1.-exp(-t*mix(.012,.09,u_p[7])));
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    pool: {
      name: 'Boş / Dolu Havuz (liminal)',
      params: ['Kapalı salon ↔ açık hava', 'Su seviyesi', 'Kostik ışık', 'Fayans tonu', 'Kulvar çizgileri', 'Gece', 'Pencere ışığı', 'Kamera yüksekliği'],
      glsl: B7 + `
const vec2 P7_B=vec2(5.,12.5);  // havuz yarı boyutu
const float P7_DEP=1.9;
float p7_in(){ return step(u_p[0],.5); }
float p7_lvl(){ return u_p[1]<.12 ? -10. : -P7_DEP+u_p[1]*(P7_DEP-.15); }
// m: 0 güverte, 1 havuz içi, 2 salon duvarı, 3 tavan, 4 krom merdiven, 5 pencere, 6 atlama bloğu
float p7_map(vec3 p, out float m){
  float d; m=0.;
  float slab=p.y;
  float basin=b7_box(p-vec3(0.,-P7_DEP*.5+.6,0.), vec3(P7_B.x, P7_DEP*.5+.6, P7_B.y));
  d=max(slab,-basin);
  if(-basin>slab-.001 && p.y<.0) m=1.;
  if(abs(p.x)<P7_B.x-.001 && abs(p.z)<P7_B.y-.001 && p.y<-.001) m=1.;
  float io=p7_in();
  if(io>.5){
    vec2 R=P7_B+vec2(4.5,6.);
    float wl=min(R.x-abs(p.x), R.y-abs(p.z));
    if(wl<d){ d=wl; m=2.; }
    float ce=7.5-p.y; if(ce<d){ d=ce; m=3.; }
  }
  // şezlonglar uzun kenar boyunca
  vec3 sq=vec3(abs(p.x)-(P7_B.x+2.3), p.y, mod(p.z,3.2)-1.6);
  float bed=b7_rbox(sq-vec3(0.,.35,0.), vec3(.35,.06,1.), .04);
  bed=min(bed, b7_rbox(vec3(sq.x, sq.y-.6+ (sq.z+.9)*.0, sq.z+.85)-vec3(0.,0.,0.), vec3(.35,.3,.05), .03));
  bed=max(bed, abs(p.z)-P7_B.y+.5);
  if(bed<d){ d=bed; m=6.; }
  if(io<.5){
    float hed=max(abs(p.x)-(P7_B.x+6.), -(abs(p.x)-(P7_B.x+5.)));
    hed=max(hed, p.y-1.6-.4*vnoise(p.xz*1.3));
    if(hed<d){ d=hed; m=7.; }
  }
  // merdivenler
  vec3 lq=vec3(abs(p.x)-(P7_B.x-.55), p.y, p.z-(P7_B.y-.05));
  float rail=min(b7_seg(lq, vec3(-.25,.85,0.), vec3(-.25,-.9,-.25), .03), b7_seg(lq, vec3(.25,.85,0.), vec3(.25,-.9,-.25), .03));
  rail=min(rail, min(b7_seg(lq, vec3(-.25,.85,0.), vec3(-.25,.85,.35), .03), b7_seg(lq, vec3(.25,.85,0.), vec3(.25,.85,.35), .03)));
  if(rail<d){ d=rail; m=4.; }
  // atlama blokları kısa kenarda
  vec3 bq=vec3(mod(p.x+1.25,2.5)-1.25, p.y-.35, p.z+P7_B.y+.4);
  float blk=max(b7_box(bq, vec3(.3,.35,.35)), abs(p.x)-P7_B.x+.6);
  if(blk<d){ d=blk; m=6.; }
  return d;
}
float p7_d(vec3 p){ float m; return p7_map(p,m); }
vec3 p7_sun(){ return normalize(vec3(.8+(hash11(u_seed*.3)-.5)*.6, mix(.35,.85,hash11(u_seed*.7)), (hash11(u_seed*.9)-.5)*1.2)); }
float p7_march(vec3 ro, vec3 rd, out float m){
  float t=.02; m=-1.;
  for(int i=0;i<96;i++){
    float d=p7_map(ro+rd*t,m);
    if(d<.001*t+.001) return t;
    t+=d*.95;
    if(t>160.) break;
  }
  m=-1.; return -1.;
}
vec3 p7_sky(vec3 rd){
  float n=u_p[5];
  vec3 s=mix(mix(u_c[2],vec3(.95),.3), mix(u_c[1],u_c[0],.3), pow(max(rd.y,0.),.6));
  s=mix(s, u_c[0]*.15+u_c[1]*.05, n);
  float sd=max(dot(rd,p7_sun()),0.);
  s+=mix(vec3(1.,.9,.75),u_c[2],.3)*(pow(sd,12.)*.3+pow(sd,300.)*2.)*(1.-n);
  s=mix(s, mix(u_c[1],u_c[2],.5)*.5, smoothstep(.02,-.02,rd.y));
  return s;
}
float p7_caust(vec2 p){
  float t=u_time*.4;
  float c=0.;
  vec2 q=p*1.6;
  for(int i=0;i<3;i++){
    q+=vec2(gnoise(q*.7+t+float(i)*3.1), gnoise(q*.7-t+float(i)*5.3))*.9;
    c+=pow(1.-abs(gnoise(q)*2.),6.);
    q*=1.7;
  }
  return c;
}
// pencerelerin olduğu duvar: +x
float p7_winlit(vec3 p){
  if(p7_in()<.5) return 1.;
  vec3 L=p7_sun();
  float R=P7_B.x+4.5;
  float tx=(R-p.x)/max(L.x,.05);
  vec3 hp=p+L*tx;
  float zc=mod(hp.z,4.)-2.;
  return smoothstep(.06,0.,abs(zc)-1.45)*smoothstep(.06,0.,abs(hp.y-4.2)-2.8)*step(0.,tx);
}
vec3 p7_shade(vec3 ro, vec3 rd, float t, float m, bool cheap){
  vec3 p=ro+rd*t;
  vec2 e=vec2(.002,0.);
  vec3 n=normalize(vec3(p7_d(p+e.xyy)-p7_d(p-e.xyy), p7_d(p+e.yxy)-p7_d(p-e.yxy), p7_d(p+e.yyx)-p7_d(p-e.yyx)));
  float night=u_p[5];
  vec3 tilec=mix(vec3(.85,.9,.9), mix(vec3(.25,.65,.75),u_c[3],.35), u_p[3]);
  vec3 alb=vec3(.8);
  if(m<.5){ vec2 g=fract(p.xz*2.); alb=mix(vec3(.82,.8,.76),u_c[2],.15)*(.82+.18*step(.04,g.x)*step(.04,g.y)); }
  else if(m<1.5){
    vec2 g=fract((abs(n.y)>.5?p.xz:(abs(n.x)>.5?p.zy:p.xy))*4.);
    alb=tilec*(.8+.2*step(.05,g.x)*step(.05,g.y))*(.9+.1*vnoise(p.xz*3.));
    float lane=step(abs(mod(p.x+1.25,2.5)-1.25),.12)*step(abs(p.z),P7_B.y-1.2)*step(n.y,.5+.5)*step(.5,n.y);
    alb=mix(alb, mix(vec3(.05,.12,.3),u_c[0],.3), lane*u_p[4]);
    float stain=smoothstep(.55,.85,fbm4(p.xz*.5+SEED2))*(1.-step(-10.,p7_lvl()));
    alb*=1.-stain*.35;
  }
  else if(m<2.5){ alb=mix(vec3(.75,.75,.72),tilec,.35)*(.9+.1*step(.04,fract(p.y*2.))); float win=smoothstep(.04,0.,abs(mod(p.z,4.)-2.)-1.45)*smoothstep(.04,0.,abs(p.y-4.2)-2.8)*step(0.,p.x); if(win>.5){ return mix(p7_sky(normalize(vec3(1.,.15,rd.z))), vec3(1.), .2)*mix(1.6,.15,night)+u_c[3]*.05*night; } }
  else if(m<3.5){ alb=vec3(.7); }
  else if(m<4.5){ alb=vec3(.9); }
  else if(m<6.5){ alb=mix(u_c[3],vec3(.9),.5); }
  else { alb=mix(vec3(.12,.3,.1),u_c[1],.3)*(.7+.5*vnoise(p.xy*4.+p.z)); }
  vec3 L=p7_sun();
  vec3 sunc=mix(vec3(1.,.93,.8),u_c[2],.3)*mix(2.2,1.,p7_in()*(1.-u_p[6]))*(1.-night);
  float sh=p7_winlit(p);
  if(!cheap && sh>0.){ float mm; float ts=p7_march(p+n*.02, L, mm); if(ts>0. && mm!=2.) sh=0.; }
  vec3 c=alb*sunc*sh*max(dot(n,L),0.)*mix(1.,mix(.4,1.4,u_p[6]),p7_in());
  vec3 amb=mix(mix(u_c[2],vec3(1.),.4)*.45, mix(u_c[1],u_c[3],.3)*.12, night);
  c+=alb*amb*(.5+.5*max(n.y,0.));
  // gece salon lambaları
  c+=alb*mix(vec3(.9,1.,1.),u_c[2],.3)*night*.35*p7_in()*(.6+.4*max(n.y,0.));
  // gece: havuz içi lambalar ve güverte ışığı
  if(m>.5&&m<1.5) c+=alb*mix(vec3(.4,.9,1.),u_c[3],.3)*night*.5*smoothstep(-.3,-1.6,p.y);
  if(m<.5||m>5.5) c+=alb*b7_warm()*night*.18*(1.-p7_in());
  float lv=p7_lvl();
  if(m>.5&&m<1.5 && n.y>.5){
    float k=u_p[2]*(lv>-9. ? 1.3 : .35)*(1.-night*.6);
    c+=alb*mix(vec3(.8,1.,1.),u_c[2],.3)*p7_caust(p.xz)*k*(.3+sh);
  }
  if(!cheap){ float ao=sat(p7_d(p+n*.25)/.25)*.5+.5; c*=ao; }
  return c;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float hgt=mix(1.4,4.5,u_p[7]*u_p[7])+max(-u_cam.z,0.)*40.;
  hgt=max(hgt-max(u_cam.z,0.)*5.,.25);
  float yaw=u_cam.y*1.8+(hash11(u_seed*.37)-.5)*.6;
  vec3 ro=vec3(-P7_B.x-1.6+u_cam.y*4.+(hash11(u_seed*.17)-.5)*1.5, hgt, -P7_B.y-2.+hash11(u_seed*.53)*3.);
  if(p7_in()>.5) ro.y=min(ro.y,6.8);
  float pitch=-.12-sat((hgt-2.)/20.)*.8+u_cam.z*1.4;
  vec3 ta=ro+vec3(sin(yaw+.35),pitch,cos(yaw+.35));
  mat3 cam=b7_look(ro, ta);
  vec3 rd=normalize(cam*vec3(q,1.2*zm));
  float m; float t=p7_march(ro,rd,m);
  float lv=p7_lvl();
  vec3 col;
  float tw=(lv-ro.y)/rd.y;
  vec3 wp=ro+rd*tw;
  bool hitw=lv>-9. && tw>0. && (t<0.||tw<t) && abs(wp.x)<P7_B.x && abs(wp.z)<P7_B.y;
  if(hitw){
    vec3 nn=normalize(vec3(gnoise(wp.xz*1.5+u_time*.3)*.05, 1., gnoise(wp.xz*1.5-u_time*.3+4.)*.05));
    vec3 rr=reflect(rd,nn);
    float m2; float t2=p7_march(wp+nn*.02,rr,m2);
    vec3 rc=t2<0.? (p7_in()>.5? u_c[0]*.2 : p7_sky(rr)) : p7_shade(wp,rr,t2,m2,true);
    vec3 tr=refract(rd,nn,.75);
    float m3; float t3=p7_march(wp+tr*.02,tr,m3);
    vec3 bc=t3<0.?vec3(0.):p7_shade(wp,tr,t3,m3,true);
    vec3 wc=mix(vec3(.15,.55,.6), u_c[3], .3);
    bc=bc*exp(-t3*vec3(.45,.12,.1))*mix(vec3(1.),wc*1.4,.5)+wc*u_p[5]*.25;
    float fr=.03+.97*pow(1.-max(-rd.y,0.),5.);
    col=mix(bc, rc, fr);
  } else if(t<0.){ col=p7_sky(rd); }
  else col=p7_shade(ro,rd,t,m,false);
  vec3 fogc=mix(mix(u_c[2],u_c[1],.4)*.6, u_c[0]*.2, u_p[5]);
  float tt=hitw?tw:(t<0.?200.:t);
  col=mix(col, fogc, (1.-exp(-tt*.008))*.6);
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    market: {
      name: 'Gece Pazarı & Sokak Tezgâhları',
      params: ['Tezgâh sıklığı', 'Fener dizileri', 'Tente renkleri', 'Buhar & duman', 'Gece', 'Islak zemin', 'Arka binalar', 'Kamera yüksekliği'],
      glsl: B7 + `
float k7_W(){ return 3.4; }
float k7_S(){ return mix(4.2,2.7,u_p[0]); }
const float K7_LS=4.5; // fener dizisi aralığı
// m: 0 zemin, 1 tezgâh, 2 tente, 3 direk, 4 bina, 5 kasa/mal
float k7_map(vec3 p, out float m, out vec2 cid){
  float W=k7_W(), S=k7_S();
  float ax=abs(p.x);
  float side=p.x<0.?0.:1.;
  float id=floor(p.z/S);
  float zl=p.z-(id+.5)*S;
  cid=vec2(id,side);
  float h=hash12(cid+SEED2);
  float d=p.y; m=0.;
  if(h>.12){
    float tb=b7_box(vec3(ax-(W+.75), p.y-.85, zl), vec3(.75,.06,S*.5-.25));
    float sk=b7_box(vec3(ax-(W+.75), p.y-.42, zl), vec3(.7,.42,S*.5-.3));
    float t2=min(tb,sk); if(t2<d){ d=t2; m=1.; }
    float aw=b7_box(vec3(ax-(W+.6), p.y-2.45+(ax-W-.6)*.35, zl), vec3(1.05,.025,S*.5-.12));
    if(aw<d){ d=aw; m=2.; }
    vec3 pq=vec3(ax-(W+.05), p.y-1.2, abs(zl)-(S*.5-.2));
    float po=b7_box(pq, vec3(.035,1.2,.035)); if(po<d){ d=po; m=3.; }
    // tezgâh üstü mallar
    vec3 gq=vec3(ax-(W+.7), p.y-.98, mod(zl,.45)-.225);
    float gd=b7_rbox(gq, vec3(.55,.06+.05*hash12(vec2(floor(zl/.45),id)),.17), .04);
    gd=max(gd, abs(zl)-S*.5+.4);
    if(gd<d){ d=gd; m=5.; }
  }
  float bh=mix(4.,13.,u_p[6])*(.6+.8*hash12(vec2(floor(p.z/7.),side)+3.));
  float bd=b7_box(vec3(ax-(W+4.5), p.y-bh*.5, 0.), vec3(2.5,bh*.5,1e3));
  if(bd<d){ d=bd; m=4.; }
  return d;
}
float k7_d(vec3 p){ float m; vec2 c; return k7_map(p,m,c); }
vec3 k7_awn(vec2 cid){
  float h=hash12(cid+5.);
  vec3 a=h<.3?vec3(.7,.1,.08):h<.55?vec3(.1,.35,.55):h<.75?vec3(.85,.6,.1):vec3(.15,.45,.25);
  return mix(a, u_c[3], .35*(1.-u_p[2]))*mix(.6,1.,u_p[2]);
}
float k7_march(vec3 ro, vec3 rd, float tmax, int n, out float m, out vec2 cid){
  float t=.02; m=-1.;
  for(int i=0;i<100;i++){
    if(i>=n) break;
    float d=k7_map(ro+rd*t,m,cid);
    if(d<.001*t+.001) return t;
    t+=d*.9;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 k7_sky(vec3 rd){
  float n=u_p[4];
  vec3 s=mix(mix(u_c[2],u_c[1],.35), mix(u_c[1],u_c[0],.5), pow(max(rd.y,0.),.5));
  s=mix(s, mix(u_c[0]*.2, u_c[1]*.15+u_c[3]*.05, smoothstep(.4,0.,rd.y)), n);
  return s;
}
// tezgâh altındaki ampul ışığı
vec3 k7_lamps(vec3 p, vec3 n){
  float W=k7_W(), S=k7_S();
  vec3 c=vec3(0.);
  float base=floor(p.z/S);
  for(int k=-1;k<=1;k++){
    for(int s=0;s<2;s++){
      vec2 cid=vec2(base+float(k), float(s));
      if(hash12(cid+SEED2)<=.12) continue;
      vec3 lp=vec3((float(s)*2.-1.)*(W+.7), 2.15, (cid.x+.5)*S);
      vec3 tl=lp-p; float dl=length(tl);
      vec3 lc=mix(b7_warm(), k7_awn(cid), .25);
      c+=lc*max(dot(n,tl/dl),0.)*2.2/(1.+dl*dl*.6);
    }
  }
  return c;
}
vec3 k7_shade(vec3 ro, vec3 rd, float t, float m, vec2 cid){
  vec3 p=ro+rd*t;
  vec2 e=vec2(.002,0.);
  vec3 n=normalize(vec3(k7_d(p+e.xyy)-k7_d(p-e.xyy), k7_d(p+e.yxy)-k7_d(p-e.yxy), k7_d(p+e.yyx)-k7_d(p-e.yyx)));
  float night=u_p[4];
  vec3 alb; vec3 em=vec3(0.);
  if(m<.5){ alb=vec3(.12)+u_c[0]*.1; vec2 g=fract(p.xz*vec2(1.,2.)+vec2(floor(p.z*2.)*.5,0.)); alb*=.75+.25*step(.04,g.x)*step(.04,g.y); alb*=.8+.3*vnoise(p.xz*4.); }
  else if(m<1.5){ alb=mix(vec3(.4,.28,.18),u_c[1],.3)*.8; }
  else if(m<2.5){ alb=k7_awn(cid)*(.8+.2*step(.5,fract(p.z*2.5))); em=k7_awn(cid)*night*.35*step(n.y,-.3); }
  else if(m<3.5){ alb=vec3(.1); }
  else if(m<4.5){
    alb=mix(u_c[1],vec3(lum(u_c[1])),.4)*.55*(.8+.2*vnoise(p.yz*3.));
    float fl=fract(p.y/3.); float wz=fract(p.z/2.3);
    float win=step(.3,fl)*step(fl,.8)*step(.2,wz)*step(wz,.8)*step(3.,p.y);
    float lit=step(.45,hash12(floor(vec2(p.z/2.3,p.y/3.))+cid.y*7.));
    alb=mix(alb,vec3(.03),win);
    em=mix(b7_warm(),u_c[3],.3)*win*lit*night*1.2;
    float sign=step(2.6,p.y)*step(p.y,3.)*step(.5,hash12(vec2(floor(p.z/5.),cid.y)));
    em+=mix(u_c[3],vec3(1.,.3,.4),hash12(vec2(floor(p.z/5.),9.)))*sign*night*2.;
  }
  else { float h=hash12(floor(p.xz*4.)+cid); alb=h<.3?vec3(.7,.15,.05):h<.6?vec3(.85,.6,.1):h<.8?vec3(.3,.5,.12):vec3(.6,.4,.3); alb*=.7; }
  vec3 L=normalize(vec3(.4,.7,.3));
  vec3 sunc=mix(vec3(1.,.9,.75),u_c[2],.3)*2.*(1.-night);
  float sh=1.;
  if(night<.9){ float mm; vec2 cc; if(k7_march(p+n*.02,L,30.,28,mm,cc)>0.) sh=0.; }
  vec3 c=alb*sunc*sh*max(dot(n,L),0.);
  c+=alb*mix(mix(u_c[2],u_c[1],.4)*.45, u_c[0]*.15+u_c[1]*.04, night)*(.5+.5*max(n.y,0.));
  c+=alb*k7_lamps(p,n)*mix(.25,1.,night);
  return c+em;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float W=k7_W();
  float hgt=mix(1.45,4.5,u_p[7]*u_p[7])+max(-u_cam.z,0.)*60.;
  hgt=max(hgt-max(u_cam.z,0.)*5.,.25);
  float yaw=u_cam.y*2.+(hash11(u_seed*.31)-.5)*.3;
  vec3 ro=vec3(clamp(u_cam.y*W+(hash11(u_seed*.77)-.5)*W*.6,-W+.6,W-.6), hgt, hash11(u_seed*.13)*400.);
  float pitch=-.02-sat((hgt-2.)/14.)*.6+u_cam.z*1.3;
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.4*zm));
  float m; vec2 cid;
  float t=k7_march(ro,rd,150.,100,m,cid);
  float night=u_p[4];
  vec3 col;
  vec3 fogc=mix(mix(u_c[2],u_c[1],.45)*.7, u_c[1]*.12+b7_warm()*.06, night);
  if(t<0.) col=k7_sky(rd);
  else {
    col=k7_shade(ro,rd,t,m,cid);
    vec3 p=ro+rd*t;
    if(m<.5 && u_p[5]>.05){
      vec3 nn=normalize(vec3(gnoise(p.xz*8.)*.05,1.,gnoise(p.xz*8.+3.)*.05));
      vec3 rr=reflect(rd,nn);
      float m2; vec2 c2;
      float t2=k7_march(p+vec3(0.,.02,0.),rr,60.,50,m2,c2);
      vec3 rc=t2<0.?k7_sky(rr):k7_shade(p,rr,t2,m2,c2);
      col=mix(col, rc, u_p[5]*(.3+.6*pow(1.-max(-rd.y,0.),4.)));
    }
    col=mix(col, fogc, 1.-exp(-t*.02));
  }
  // fener dizileri (sarkan katener) ve ampuller
  float tmax=t<0.?1e3:t;
  if(u_p[1]>.05){
    for(int i=0;i<12;i++){
      float zc=(floor(ro.z/K7_LS)+float(i)+1.)*K7_LS;
      float tz=(zc-ro.z)/rd.z;
      if(rd.z>.001 && tz>0. && tz<tmax){
        vec3 hp=ro+rd*tz;
        float span=W+.2;
        float cy=4.4-.9*(1.-pow(hp.x/span,2.));
        float pw=tz*PX*1.3/zm;
        float lw=.008+pw;
        col=mix(col, vec3(.02), step(abs(hp.x),span)*smoothstep(lw,lw*.4,abs(hp.y-cy))*.8*min(1.,.02/lw*1.5));
        // ampuller ip boyunca
        float bx=(floor(hp.x/.6)+.5)*.6;
        vec2 bp=vec2(bx, 4.4-.9*(1.-pow(bx/span,2.))-.12);
        float bd=length(hp.xy-bp);
        float hb=hash12(vec2(bx,zc));
        vec3 bc=mix(b7_warm(), hb<.33?vec3(1.,.25,.2):hb<.66?u_c[3]:vec3(1.,.8,.3), .6);
        col+=bc*u_p[1]*(smoothstep(.1+pw,.03,bd)*2.5+exp(-bd*5.)*.35)*step(abs(bx),span)*mix(.4,1.,night);
      }
    }
  }
  // buhar: tezgâh yüksekliğinde sıcak, ışıklı duman
  if(u_p[3]>.03){
    float tm=min(tmax,40.); float acc=0.;
    for(int i=0;i<16;i++){
      float s=(float(i)+hash12(gl_FragCoord.xy+fract(u_time)))/16.;
      vec3 sp=ro+rd*tm*s;
      float band=smoothstep(.5,0.,abs(abs(sp.x)-W-.4)-.8)*smoothstep(4.,1.,sp.y)*step(.0,sp.y);
      acc+=band*smoothstep(.45,.85,fbm3(sp*vec3(1.2,.8,1.2)+vec3(0.,-u_time*.3,0.)));
    }
    col+=mix(b7_warm(),vec3(1.),.3)*acc/16.*u_p[3]*mix(.4,1.4,night)*tm*.04;
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    rooftop: {
      name: 'Şehir Çatıları & Su Tankları',
      params: ['Çatı yoğunluğu', 'Su tankları', 'Antenler', 'Klima & kutular', 'Uzak silüet', 'Gece', 'Pus', 'Kamera yüksekliği'],
      glsl: B7 + `
const float R7_C=16.;   // blok aralığı
float r7_h(vec2 cid){
  float H0=24.*mix(.75,1.25,hash11(u_seed*.13));
  if(cid==vec2(0.)) return H0;
  float h=hash12(cid+SEED2);
  float hh=mix(10.,38.,pow(h,1.3))*mix(.6,1.3,u_p[0]);
  // yakın komşular alçak kalsın ki çatıdan manzara açılsın
  if(max(abs(cid.x),abs(cid.y))<1.5) hh=min(hh, H0-mix(2.,8.,hash12(cid+7.)));
  return hh;
}
// m: 0 sokak, 1 çatı, 2 cephe, 3 korkuluk, 4 tank, 5 anten, 6 kutu
float r7_map(vec3 p, out float m, out vec2 cid, out float bnd){
  vec2 c=floor(p.xz/R7_C); cid=c;
  vec2 l=p.xz-(c+.5)*R7_C;
  float H=r7_h(c);
  float hw=R7_C*.5-mix(3.2,1.6,u_p[0]);
  float d=p.y; m=0.;
  float bd=b7_box(vec3(l.x,p.y-H*.5,l.y), vec3(hw,H*.5,hw));
  if(bd<d){ d=bd; m=(p.y>H-.02)?1.:2.; }
  // parapet
  float pr=max(b7_box(vec3(l.x,p.y-(H+.45),l.y), vec3(hw,.45,hw)), -b7_box(vec3(l.x,p.y-(H+.5),l.y), vec3(hw-.25,.6,hw-.25)));
  if(pr<d){ d=pr; m=3.; }
  vec2 h2=hash22(c+SEED2+1.7);
  // su tankı ayaklar üstünde
  bool home=c==vec2(0.);
  if(h2.x<u_p[1] && !home){
    vec2 tp=(h2-.5)*hw*.9;
    vec3 tq=vec3(l.x-tp.x, p.y-(H+3.3), l.y-tp.y);
    float tank=b7_cyl(tq, 1.5, 1.4);
    float roof=max(length(tq.xz)-1.6+(tq.y-1.4)*1.2, abs(tq.y-1.65)-.25);
    vec3 lq=vec3(abs(tq.x)-1., tq.y+2.4, abs(tq.z)-1.);
    float legs=b7_box(lq, vec3(.08,1.,.08));
    float tk=min(min(tank,roof),legs); if(tk<d){ d=tk; m=4.; }
  }
  // anten direği
  if(h2.y<u_p[2] && !home){
    vec3 aq=vec3(l.x+hw*.6, p.y-H, l.y-hw*.5);
    float ah=mix(5.,14.,hash12(c+2.));
    float mast=max(length(aq.xz)-.06, abs(aq.y-ah*.5)-ah*.5);
    float bars=max(b7_box(vec3(aq.x, mod(aq.y,1.6)-.8, aq.z), vec3(.7,.025,.025)), aq.y-ah);
    bars=max(bars,-aq.y+ah*.4);
    float an=min(mast,bars); if(an<d){ d=an; m=5.; }
  }
  // klima kutuları ve merdiven kulesi
  if(u_p[3]>.1 && !home){
    vec3 bq=vec3(mod(l.x+.9,1.8)-.9, p.y-(H+.45), l.y+hw*.55);
    float ac=max(b7_box(bq, vec3(.6,.45,.5)), abs(l.x)-hw*mix(.2,.8,u_p[3]));
    float st=b7_box(vec3(l.x-hw*.55,p.y-(H+1.4),l.y+hw*.1), vec3(1.6,1.4,2.));
    float bx=min(ac,st); if(bx<d){ d=bx; m=6.; }
  }
  vec2 rp=(c+1.)*R7_C-p.xz, rn=p.xz-c*R7_C;
  bnd=min(min(rp.x,rp.y),min(rn.x,rn.y))+.05;
  return d;
}
float r7_d(vec3 p){ float m,b; vec2 c; return r7_map(p,m,c,b); }
vec3 r7_L(){ return normalize(vec3(hash11(u_seed*.4)*2.-1., mix(.25,.7,hash11(u_seed*.8)), .6)); }
float r7_march(vec3 ro, vec3 rd, float tmax, int n, out float m, out vec2 cid){
  float t=.02; m=-1.;
  for(int i=0;i<110;i++){
    if(i>=n) break;
    float b; float d=r7_map(ro+rd*t,m,cid,b);
    if(d<.001*t+.002) return t;
    t+=min(d,b)*.9;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 r7_sky(vec3 rd){
  float n=u_p[5];
  float y=max(rd.y,0.);
  vec3 s=mix(mix(u_c[2],u_c[1],.3)*1.1, mix(u_c[1],u_c[0],.45), pow(y,.55));
  s=mix(s, mix(u_c[1]*.3+u_c[3]*.12, u_c[0]*.2, pow(y,.4)), n);
  float sd=max(dot(rd,r7_L()),0.);
  s+=mix(vec3(1.,.88,.7),u_c[2],.4)*(pow(sd,8.)*.35+pow(sd,250.)*2.)*(1.-n);
  float cl=smoothstep(.1,.7,fbm4(rd.xz/max(rd.y,.04)*.3+SEED2))*smoothstep(0.,.3,rd.y);
  s=mix(s, mix(u_c[2],vec3(1.),.2)*mix(1.,.2,n), cl*.4);
  // uzak şehir silüeti
  float az=atan(rd.x,rd.z);
  float bx=floor(az*60.);
  float sk=mix(.01,.12,u_p[4])*(.3+.7*hash11(bx+u_seed))*step(.15,hash11(bx*1.3));
  sk+=mix(.0,.2,u_p[4])*step(.97,hash11(floor(az*14.)+3.))*(.6+.4*hash11(floor(az*14.)));
  float sil=step(rd.y,sk);
  vec3 sc=mix(mix(u_c[1],u_c[2],.35)*.7, u_c[0]*.15, n);
  vec2 wg=vec2(az*180.,rd.y*140.);
  sc+=mix(b7_warm(),u_c[3],.3)*n*step(.72,hash12(floor(wg)))*step(.25,fract(wg.x))*step(.3,fract(wg.y))*1.2*step(.008,sk-rd.y);
  return mix(s, sc, sil);
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float H0=r7_h(vec2(0.));
  float hgt=H0+mix(1.6,7.,u_p[7]*u_p[7])+max(-u_cam.z,0.)*120.;
  hgt=max(hgt-max(u_cam.z,0.)*6.,H0+.6);
  float yaw=u_cam.y*2.+hash11(u_seed*.57)*6.283;
  vec3 ro=vec3(R7_C*.5+(hash11(u_seed*.2)-.5)*5., hgt, R7_C*.5+(hash11(u_seed*.9)-.5)*5.);
  float pitch=-.06-sat((hgt-H0-3.)/60.)*.7+u_cam.z*1.4;
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.45*zm));
  float m; vec2 cid;
  float t=r7_march(ro,rd,400.,110,m,cid);
  float night=u_p[5];
  vec3 col;
  vec3 fogc=mix(mix(u_c[2],u_c[1],.4)*.9, u_c[0]*.25+u_c[3]*.04, night);
  if(t<0.) col=r7_sky(rd);
  else {
    vec3 p=ro+rd*t;
    vec2 e=vec2(.004,0.);
    vec3 n=normalize(vec3(r7_d(p+e.xyy)-r7_d(p-e.xyy), r7_d(p+e.yxy)-r7_d(p-e.yxy), r7_d(p+e.yyx)-r7_d(p-e.yyx)));
    float H=r7_h(cid);
    float hc=hash12(cid+4.);
    vec3 alb; vec3 em=vec3(0.);
    if(m<.5){ alb=vec3(.08); em=mix(b7_warm(),u_c[3],.3)*night*.15; }
    else if(m<1.5){ alb=mix(vec3(.32,.3,.28),u_c[1],.2)*(.75+.25*vnoise(p.xz*.8))*(.85+.15*step(.03,fract(p.x*.5))*step(.03,fract(p.z*.5))); }
    else if(m<2.5){
      alb=mix(mix(vec3(.45,.25,.18),vec3(.55,.52,.48),hc), u_c[1], .25)*(.8+.2*vnoise(p.xy*.6+p.z*.3));
      vec2 fw=vec2(abs(n.x)>.5?p.z:p.x, p.y);
      float win=step(.3,fract(fw.y/3.2))*step(fract(fw.y/3.2),.78)*step(.25,fract(fw.x/2.1))*step(fract(fw.x/2.1),.75);
      float lit=step(.5,hash12(floor(fw/vec2(2.1,3.2))+cid*3.));
      alb=mix(alb,vec3(.03),win*.8);
      em=mix(b7_warm(),u_c[2],.3)*win*lit*night*1.1;
    }
    else if(m<3.5){ alb=vec3(.4,.38,.35); }
    else if(m<4.5){ alb=mix(vec3(.38,.25,.15),u_c[1]*.6,.3)*(.85+.15*step(.5,fract(atan(p.x,p.z)*8.))); }
    else if(m<5.5){ alb=vec3(.15); float ah=mix(5.,14.,hash12(cid+2.)); float tip=step(H+ah-.35,p.y)*step(.5,fract(u_time*.7+hc)); em=vec3(1.,.05,.03)*tip*4.*night; }
    else { alb=vec3(.55,.55,.52); }
    vec3 L=r7_L();
    vec3 sunc=mix(vec3(1.,.9,.75),u_c[2],.35)*2.4*(1.-night*.95);
    float sh=1.;
    if(night<.92){ float mm; vec2 cc; if(r7_march(p+n*.03,L,120.,48,mm,cc)>0.) sh=0.; }
    vec3 c=alb*sunc*sh*max(dot(n,L),0.);
    c+=alb*mix(mix(u_c[2],u_c[1],.5)*.5, u_c[0]*.2+u_c[3]*.03, night)*(.45+.55*max(n.y,0.));
    col=c+em;
    col=mix(col, fogc, 1.-exp(-t*mix(.002,.02,u_p[6])));
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    harbor: {
      name: 'Liman, Rıhtım & Vinçler',
      params: ['Konteyner yığınları', 'Vinçler', 'Bağlı tekneler', 'Dalga', 'Gece', 'Sis', 'Uzak kıyı', 'Kamera yüksekliği'],
      glsl: B7 + `
const float H7_Q=8.;    // rıhtım kenarı (x)
const float H7_QH=2.2;
// m: 0 rıhtım, 1 konteyner, 2 vinç, 3 tekne gövdesi, 4 tekne kabini, 5 baba / lamba direği
float H7_B=1e3; // konteyner hücresi sınırına uzaklık (adım sınırı)
float h7_map(vec3 p, out float m, out vec3 cid){
  float d=1e3; m=-1.; cid=vec3(0.); H7_B=1e3;
  float qd=max(H7_Q-p.x, p.y-H7_QH); d=qd; m=0.;
  // konteyner yığınları
  vec3 cq=vec3(p.x-H7_Q-10., p.y-H7_QH, p.z);
  vec2 cell=vec2(floor(cq.x/2.7), floor(cq.z/13.));
  vec2 cl=vec2(cq.x-(cell.x+.5)*2.7, cq.z-(cell.y+.5)*13.);
  float hs=floor(hash12(cell+SEED2)*4.*u_p[0]+.6);
  if(cell.x>=-2. && cell.x<10.) H7_B=max(min(1.35-abs(cl.x), 6.5-abs(cl.y)),0.)+.05;
  if(cell.x>=-2. && cell.x<10. && hs>0.){
    float row=clamp(floor(cq.y/2.6),0.,hs-1.);
    float cb=b7_box(vec3(cl.x, cq.y-(row+.5)*2.6, cl.y), vec3(1.2,1.28,6.05));
    float stk=b7_box(vec3(cl.x, cq.y-hs*1.3, cl.y), vec3(1.22,hs*1.3,6.08));
    cb=max(stk, cb-.0);
    if(cb<d){ d=cb; m=1.; cid=vec3(cell,row); }
  }
  // portal vinçler
  if(u_p[1]>.1){
    float cz=mod(p.z,70.)-35.;
    vec3 vq=vec3(p.x-H7_Q-3., p.y-H7_QH, cz);
    float legs=b7_box(vec3(abs(vq.x-4.)-4., vq.y-18., abs(vq.z)-5.), vec3(.5,18.,.5));
    float top=b7_box(vec3(vq.x-2., vq.y-36., vq.z), vec3(12.,1.2,5.5));
    float boom=b7_box(vec3(vq.x+14., vq.y-34., vq.z), vec3(17.,.8,.9));
    float tie=b7_seg(vq, vec3(4.,44.,0.), vec3(-28.,34.5,0.), .18);
    float mast=b7_box(vec3(vq.x-4., vq.y-40., vq.z), vec3(.6,4.,.6));
    float cr=min(min(min(legs,top),min(boom,tie)),mast);
    cr=max(cr, -u_p[1]+.1+step(.5+ (1.-u_p[1])*.5, hash11(floor(p.z/70.)+u_seed))*1e3);
    if(cr<d){ d=cr; m=2.; }
  }
  // bağlı tekneler
  if(u_p[2]>.05){
    float bz=mod(p.z,32.)-16.;
    float bid=floor(p.z/32.);
    float hb=hash11(bid+u_seed*.7);
    if(hb<u_p[2]){
      float len=mix(8.,15.,hash11(bid*1.7));
      vec3 bq=vec3(p.x-(H7_Q-3.2), p.y, bz);
      float taper=1.-.5*smoothstep(len*.4,len,abs(bq.z));
      float hull=b7_rbox(vec3(bq.x/taper, bq.y-.2-bq.z*.0, bq.z), vec3(2.2,1.,len), .6);
      hull=max(hull, -p.y-.6);
      if(hull<d){ d=hull; m=3.; cid=vec3(bid,0.,0.); }
      float cab=b7_rbox(bq-vec3(0.,1.9,-len*.15), vec3(1.5,.9,len*.3), .15);
      float mst=b7_box(bq-vec3(0.,4.,len*.2), vec3(.08,3.,.08));
      float cb2=min(cab,mst);
      if(cb2<d){ d=cb2; m=4.; cid=vec3(bid,0.,0.); }
    }
  }
  vec3 bl=vec3(p.x-(H7_Q+.6), p.y-H7_QH, mod(p.z,12.)-6.);
  float bol=b7_cyl(bl-vec3(0.,.35,0.), .22, .35);
  float pole=b7_box(vec3(p.x-(H7_Q+1.5), p.y-H7_QH-4., mod(p.z+6.,24.)-12.), vec3(.08,4.,.08));
  float bb=min(bol,pole); if(bb<d){ d=bb; m=5.; }
  return d;
}
float h7_d(vec3 p){ float m; vec3 c; return h7_map(p,m,c); }
vec3 h7_L(){ return normalize(vec3(-.6+hash11(u_seed*.3)*.6, mix(.18,.6,hash11(u_seed*.6)), .7)); }
float h7_march(vec3 ro, vec3 rd, float tmax, int n, out float m, out vec3 cid){
  float t=.05; m=-1.;
  for(int i=0;i<110;i++){
    if(i>=n) break;
    float d=h7_map(ro+rd*t,m,cid);
    if(d<.002*t+.002) return t;
    t+=min(d,H7_B)*.9;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 h7_sky(vec3 rd){
  float n=u_p[4];
  float y=max(rd.y,0.);
  vec3 s=mix(mix(u_c[2],u_c[1],.3)*1.1, mix(u_c[1],u_c[0],.45), pow(y,.5));
  s=mix(s, mix(u_c[1]*.2+u_c[3]*.08, u_c[0]*.15, pow(y,.4)), n);
  float sd=max(dot(rd,h7_L()),0.);
  s+=mix(vec3(1.,.85,.65),u_c[2],.35)*(pow(sd,6.)*.4+pow(sd,300.)*2.5)*(1.-n);
  float cl=smoothstep(.1,.75,fbm4(rd.xz/max(rd.y,.04)*.25+SEED2))*smoothstep(0.,.3,rd.y);
  s=mix(s, mix(u_c[2],vec3(1.),.2)*mix(1.,.2,n), cl*.45);
  // uzak kıyı tepeleri ve ışıkları
  float az=atan(rd.x,rd.z);
  float hill=u_p[6]*(.015+.03*fbm4(vec2(az*3.,1.)+SEED2)+.01);
  float sil=step(rd.y,hill)*step(0.,rd.x+.3);
  vec3 sc=mix(mix(u_c[1],u_c[2],.3)*.6, u_c[0]*.12, n);
  sc+=b7_warm()*n*step(.85,hash12(floor(vec2(az*300.,rd.y*900.))))*1.5*smoothstep(hill,hill-.01,rd.y);
  return mix(s, sc, sil);
}
vec3 h7_shade(vec3 ro, vec3 rd, float t, float m, vec3 cid, bool cheap){
  vec3 p=ro+rd*t;
  vec2 e=vec2(.004,0.);
  vec3 n=normalize(vec3(h7_d(p+e.xyy)-h7_d(p-e.xyy), h7_d(p+e.yxy)-h7_d(p-e.yxy), h7_d(p+e.yyx)-h7_d(p-e.yyx)));
  float night=u_p[4];
  vec3 alb; vec3 em=vec3(0.);
  if(m<.5){ alb=vec3(.3,.29,.27)*(.7+.3*vnoise(p.xz*.7)); alb=mix(alb,vec3(.7,.6,.1),step(abs(p.x-H7_Q-.25),.08)*step(.5,n.y)); if(n.x<-.5) alb=vec3(.18,.17,.16)*(.8+.2*step(.5,fract(p.y*1.5))); }
  else if(m<1.5){
    float h=hash13(cid+u_seed);
    vec3 cc=h<.2?vec3(.55,.12,.08):h<.38?vec3(.1,.22,.45):h<.52?vec3(.5,.3,.15):h<.64?vec3(.15,.35,.25):h<.76?vec3(.8,.75,.7):h<.88?mix(u_c[3],vec3(.5),.3):vec3(.6,.5,.1);
    float aa=exp(-t*.012);
    float rib=abs(n.x)>.5 ? step(.5,fract(p.z*2.6)) : (abs(n.z)>.5 ? step(.5,fract(p.x*3.)) : 1.);
    alb=cc*(.8+.2*mix(.5,rib,aa))*(.85+.15*vnoise(p.yz*4.));
    alb*=1.-.5*smoothstep(.06,0.,abs(fract((p.y-H7_QH)/2.6)-.5)-.47)*aa;
  }
  else if(m<2.5){ alb=mix(vec3(.75,.55,.1),u_c[3],.3)*.8; em=vec3(1.,.15,.05)*night*step(39.,p.y-H7_QH)*step(.5,fract(u_time*.5))*2.; }
  else if(m<3.5){ float h=hash11(cid.x+u_seed); alb=mix(h<.4?vec3(.6,.1,.08):h<.7?vec3(.12,.25,.45):vec3(.85),vec3(.08),step(p.y,.25)); alb=mix(alb,vec3(.8),step(abs(p.y-1.),.08)); }
  else if(m<4.5){ alb=vec3(.82,.8,.75); float win=step(.4,fract(p.z*1.2))*step(abs(p.y-2.1),.25); alb=mix(alb,vec3(.05),win); em=b7_warm()*win*night*1.5; }
  else { alb=vec3(.15); }
  vec3 L=h7_L();
  vec3 sunc=mix(vec3(1.,.88,.7),u_c[2],.35)*2.3*(1.-night*.95);
  float sh=1.;
  if(!cheap && night<.92){ float mm; vec3 cc; if(h7_march(p+n*.04,L,150.,40,mm,cc)>0.) sh=0.; }
  vec3 c=alb*sunc*sh*max(dot(n,L),0.);
  c+=alb*mix(mix(u_c[2],u_c[1],.5)*.5, u_c[0]*.2+u_c[3]*.03, night)*(.45+.55*max(n.y,0.));
  // gece rıhtım ışıkları
  float lz=fract((p.z+6.)/24.)-.5;
  c+=alb*b7_warm()*night*1.8*exp(-(lz*lz*24.*24.*.04+pow(p.x-H7_Q-1.5,2.)*.04))*step(p.y,H7_QH+.1)*step(H7_Q-.1,p.x);
  return c+em;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float hgt=mix(2.,12.,u_p[7]*u_p[7])+max(-u_cam.z,0.)*200.;
  hgt=max(hgt-max(u_cam.z,0.)*8.,.6);
  float yaw=u_cam.y*2.+(hash11(u_seed*.61)-.5)*.6-.25;
  float hx=hash11(u_seed*.23);
  vec3 ro=vec3(hx<.6 ? H7_Q+1.2+hx*6. : H7_Q-8.-(hx-.6)*25., hgt, hash11(u_seed*.43)*500.);
  ro.x+=u_cam.y*20.;
  if(ro.x>H7_Q) ro.y=max(ro.y,H7_QH+1.6); else ro.y=max(ro.y,1.4);
  float pitch=-.05-sat((hgt-4.)/60.)*1.4+u_cam.z*1.3;
  if(hgt>20.) yaw+=.6;
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.4*zm));
  float m; vec3 cid;
  float t=h7_march(ro,rd,500.,110,m,cid);
  float night=u_p[4];
  vec3 fogc=mix(mix(u_c[2],u_c[1],.4)*.85, u_c[0]*.2+u_c[3]*.03, night);
  float tw=-ro.y/rd.y;
  float fk=mix(.002,.022,u_p[5])*mix(1.,.15,sat(ro.y/150.));
  vec3 col;
  if(tw>0. && (t<0.||tw<t)){
    vec3 wp=ro+rd*tw;
    float wv=mix(.02,.12,u_p[3]);
    vec2 g=wp.xz*.35;
    vec3 nn=normalize(vec3((gnoise(g+u_time*.15)+gnoise(g*2.3-u_time*.2)*.5)*wv, 1., (gnoise(g+7.+u_time*.12)+gnoise(g*2.1+3.-u_time*.18)*.5)*wv));
    vec3 rr=reflect(rd,nn);
    float m2; vec3 c2;
    float t2=h7_march(wp+vec3(0.,.05,0.),rr,300.,60,m2,c2);
    vec3 rc=t2<0.?h7_sky(rr):h7_shade(wp,rr,t2,m2,c2,true);
    vec3 deep=mix(u_c[0],mix(vec3(.05,.15,.18),u_c[1],.4),.5)*mix(.35,.08,night);
    float fr=.04+.96*pow(1.-max(-rd.y,0.),5.);
    col=mix(deep, rc, fr);
    col=mix(col, fogc, 1.-exp(-tw*fk));
  } else if(t<0.) col=h7_sky(rd);
  else {
    col=h7_shade(ro,rd,t,m,cid,false);
    col=mix(col, fogc, 1.-exp(-t*fk));
  }
  // rıhtım lambası parıltıları
  float tmax=t<0.?1e4:t;
  for(int i=0;i<8;i++){
    vec3 lp=vec3(H7_Q+1.5, H7_QH+8., (floor((ro.z+6.)/24.)+float(i))*24.-6.+12.);
    float tl; float dd=b7_glow(ro,rd,lp,tmax,tl);
    col+=b7_warm()*night*(exp(-dd*dd*8.)*1.2+exp(-dd*.8)*.05)/(1.+tl*.01);
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    station: {
      name: 'Tren İstasyonu & Peron',
      params: ['Çatı (sundurma → kemerli hol)', 'Işık dizisi', 'Ray sayısı', 'Bekleme bankları', 'Gece', 'Islak peron', 'Pus', 'Kamera yüksekliği'],
      glsl: B7 + `
float s7_T(){ return mix(1.,3.,floor(u_p[2]*2.99))*2.4; }   // ray yatağı yarı genişliği
const float S7_PW=6.;   // peron genişliği
const float S7_PH=1.05;
float s7_vault(){ return u_p[0]; }
float S7_RZ=0.; // kamera z: uzak rayları geometriden düşürmek için (aliasing)
// m: 0 balast, 1 ray, 2 peron, 3 kolon, 4 çatı, 5 bank, 6 ışık bandı, 7 kemer kaburga, 8 tabela
float s7_map(vec3 p, out float m){
  float T=s7_T();
  float ax=abs(p.x);
  float d=p.y+.05; m=0.;
  float pl=max(T-ax, p.y-S7_PH);
  pl=max(pl, ax-T-S7_PW-12.);
  if(pl<d){ d=pl; m=2.; }
  // raylar
  float tr=mod(p.x+1.2,2.4)-1.2;
  float rail=b7_box(vec3(abs(tr)-.72, p.y-.12, 0.), vec3(.035,.08,1e3));
  rail=max(rail, ax-T+.3);
  rail=max(rail, abs(p.z-S7_RZ)-55.);
  if(rail<d){ d=rail; m=1.; }
  float vt=s7_vault();
  if(vt<.5){
    // sundurma: kolonlar ve hafif eğimli çatı
    vec3 cq=vec3(ax-(T+S7_PW*.5), p.y-3.4, mod(p.z,9.)-4.5);
    float col=b7_box(cq, vec3(.14,2.4,.14));
    if(col<d){ d=col; m=3.; }
    float roof=b7_box(vec3(ax-(T+S7_PW*.5), p.y-5.9+(ax-T-S7_PW*.5)*.12, 0.), vec3(S7_PW*.62,.12,1e3));
    if(roof<d){ d=roof; m=4.; }
    float strip=b7_box(vec3(ax-(T+S7_PW*.5), p.y-5.68, mod(p.z,4.5)-2.25), vec3(.09,.04,1.6));
    if(strip<d){ d=strip; m=6.; }
  } else {
    // kemerli tren holü: büyük tonoz ve demir kaburgalar
    float R=T+S7_PW+3.;
    vec2 vc=vec2(p.x, p.y-6.);
    float shell=R+.25-length(vc);
    shell=max(shell,-(p.y-6.));
    if(p.y>6.) { if(shell<d){ d=shell; m=4.; } }
    else { float wl=R+.25-ax; if(wl<d){ d=wl; m=4.; } }
    float rib=max(abs(length(vc)-R)-.25, abs(mod(p.z,8.)-4.)-.18);
    rib=max(rib, -(p.y-6.)+.0);
    float rib2=max(abs(ax-R)-.25, abs(mod(p.z,8.)-4.)-.18); rib2=max(rib2,p.y-6.);
    float rb=min(rib,rib2); if(rb<d){ d=rb; m=7.; }
    float strip=b7_box(vec3(ax-(T+S7_PW*.5), p.y-5.2, mod(p.z,4.5)-2.25), vec3(.09,.04,1.6));
    if(strip<d){ d=strip; m=6.; }
  }
  // banklar
  if(u_p[3]>.1){
    vec3 bq=vec3(ax-(T+S7_PW*.62), p.y-S7_PH-.45, mod(p.z+6.,12.)-6.);
    float bn=min(b7_box(bq, vec3(.25,.04,1.)), b7_box(bq-vec3(.22,.28,0.), vec3(.03,.25,1.)));
    if(bn<d){ d=bn; m=5.; }
  }
  // asılı tabela kutuları (yazısız)
  vec3 sq=vec3(ax-(T+S7_PW*.35), p.y-4.2, mod(p.z,20.)-10.);
  float sg=b7_box(sq, vec3(.05,.28,1.1));
  if(sg<d){ d=sg; m=8.; }
  return d;
}
float s7_d(vec3 p){ float m; return s7_map(p,m); }
vec3 s7_L(){ return normalize(vec3((hash11(u_seed*.5)-.5)*1.4, mix(.3,.8,hash11(u_seed*.2)), .5)); }
float s7_march(vec3 ro, vec3 rd, float tmax, int n, out float m){
  float t=.02; m=-1.;
  for(int i=0;i<100;i++){
    if(i>=n) break;
    float d=s7_map(ro+rd*t,m);
    if(d<.001*t+.001) return t;
    t+=d*.9;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 s7_sky(vec3 rd){
  float n=u_p[4];
  vec3 s=mix(mix(u_c[2],u_c[1],.3)*1.1, mix(u_c[1],u_c[0],.45), pow(max(rd.y,0.),.5));
  s=mix(s, mix(u_c[1]*.2+u_c[3]*.06, u_c[0]*.15, max(rd.y,0.)), n);
  float sd=max(dot(rd,s7_L()),0.);
  s+=mix(vec3(1.,.88,.7),u_c[2],.35)*(pow(sd,8.)*.3+pow(sd,300.)*2.)*(1.-n);
  return s;
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float T=s7_T();
  float vt=s7_vault();
  float hgt=S7_PH+mix(1.55,3.5,u_p[7]*u_p[7])+max(-u_cam.z,0.)*(vt>.5?25.:60.);
  hgt=max(hgt-max(u_cam.z,0.)*6.,.4);
  if(vt>.5) hgt=min(hgt, 6.+T+S7_PW);
  else if(u_cam.z>-.15) hgt=min(hgt, 5.2);
  float side=hash11(u_seed*.33)<.5?-1.:1.;
  float yaw=u_cam.y*1.6+side*mix(.08,.35,hash11(u_seed*.73));
  vec3 ro=vec3(side*(T+mix(.8,S7_PW-1.,hash11(u_seed*.91)))+u_cam.y*T, hgt, floor(hash11(u_seed*.19)*40.)*9.+mix(-2.5,2.5,hash11(u_seed*.47)));
  S7_RZ=ro.z;
  if(abs(ro.x)<T) ro.y=max(ro.y,1.5);
  float pitch=-.04-sat((hgt-3.)/30.)*.7+u_cam.z*1.3;
  mat3 cam=b7_look(ro, ro+vec3(sin(yaw)*-side,pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.35*zm));
  float m; float t=s7_march(ro,rd,250.,100,m);
  float night=u_p[4];
  vec3 lc=mix(mix(vec3(1.,.95,.85),u_c[2],.3), b7_warm(), .3);
  vec3 fogc=mix(mix(u_c[2],u_c[1],.4)*.55, u_c[0]*.2+lc*.03, night);
  vec3 col;
  if(t<0.) col=s7_sky(rd);
  else {
    vec3 p=ro+rd*t;
    vec2 e=vec2(.002,0.);
    vec3 n=normalize(vec3(s7_d(p+e.xyy)-s7_d(p-e.xyy), s7_d(p+e.yxy)-s7_d(p-e.yxy), s7_d(p+e.yyx)-s7_d(p-e.yyx)));
    vec3 alb; float em=0.; float spec=0.;
    float ax=abs(p.x);
    float aa=exp(-t*.05);
    if(m<.5){ alb=vec3(.22,.2,.18)*(.6+.5*mix(.5,vnoise(p.xz*14.),aa)); float sl=step(.55,fract(p.z/.65))*step(abs(mod(p.x+1.2,2.4)-1.2),1.1); alb=mix(alb, vec3(.25,.18,.12), mix(.4,sl,aa)*.8); }
    else if(m<1.5){ alb=mix(vec3(.22,.2,.18)*.8, vec3(.35,.33,.32), aa); spec=.8*aa; }
    else if(m<2.5){
      alb=mix(vec3(.45,.43,.4),u_c[1],.2)*(.85+.15*step(.03,fract(p.x*1.6))*step(.03,fract(p.z*1.6)));
      alb=mix(alb, vec3(.85,.7,.1), step(abs(ax-T-.4),.08)*step(.5,n.y));
      if(n.y<.5) alb*=.5;
      spec=u_p[5]*step(.5,n.y);
    }
    else if(m<3.5){ alb=mix(vec3(.15,.25,.22),u_c[1],.4)*.7; }
    else if(m<4.5){ alb=vec3(.35); if(n.y<-.5){ alb*=.45*(.7+.3*step(.12,fract(p.z/1.5))); } if(vt>.5 && p.y>6.){ float gl=step(.1,abs(mod(p.z,8.)-4.)-.2)*step(.15,fract(atan(p.x,p.y-6.)*5.)); em=gl*(1.-night)*.55; alb=mix(alb,vec3(.6),gl); } }
    else if(m<5.5){ alb=mix(vec3(.4,.25,.12),u_c[3],.3); }
    else if(m<6.5){ alb=vec3(.9); em=mix(1.5,3.,night)*u_p[1]*step(n.y,-.5); }
    else if(m<7.5){ alb=vec3(.12,.14,.15); }
    else { alb=mix(vec3(.1,.15,.3),u_c[0],.3); em=night*.8*step(.5,abs(n.x)); }
    vec3 L=s7_L();
    vec3 sunc=mix(vec3(1.,.9,.75),u_c[2],.35)*2.2*(1.-night*.95);
    float sh=1.;
    if(night<.92){ float mm; float ts=s7_march(p+n*.02,L,60.,40,mm); if(ts>0.) sh=(vt>.5&&mm>3.5&&mm<4.5&&(p+L*ts).y>6.)?.55:0.; }
    vec3 c=alb*sunc*sh*max(dot(n,L),0.);
    c+=alb*mix(mix(u_c[2],u_c[1],.5)*.45, u_c[0]*.15, night)*(.45+.55*max(n.y,0.));
    // ışık bantlarının peron havuzları
    float zl=mod(p.z,4.5)-2.25;
    float hy=(vt>.5?5.2:5.68)-p.y;
    float pool=exp(-(zl*zl*.25+pow(ax-(T+S7_PW*.5),2.)*.18))*smoothstep(0.,1.,hy)/(1.+hy*hy*.08);
    c+=alb*lc*pool*u_p[1]*mix(.6,2.2,night);
    col=c+lc*em*(m>5.5&&m<6.5?1.:0.)+mix(u_c[2],vec3(1.),.4)*em*(m>3.5&&m<4.5?.8:0.)+mix(vec3(.5,.7,1.),u_c[3],.4)*em*(m>7.5?1.:0.);
    if(spec>.0){
      vec3 rr=reflect(rd,n);
      float m2; float t2=s7_march(p+n*.02,rr,80.,40,m2);
      vec3 rc=t2<0.?s7_sky(rr):(m2>5.5&&m2<6.5?lc*u_p[1]*2.5:fogc*.6);
      col=mix(col, rc, spec*.5*pow(1.-max(-rd.y,0.),3.));
    }
    col=mix(col, fogc, 1.-exp(-t*mix(.003,.025,u_p[6])));
  }
  return col;
}`,
    },

    /* ------------------------------------------------------------------ */
    stadium: {
      name: 'Boş Stadyum & Tribünler',
      params: ['Tribün eğimi', 'Tribün yüksekliği', 'Koltuk renkleri', 'Projektörler', 'Gece', 'Çim deseni', 'Çatı halkası', 'Kamera yüksekliği'],
      glsl: B7 + `
#define D7_A mix(vec2(70.,92.),vec2(44.,62.),u_p[0])   // kase iç elipsi (x, z): dik tribün = futbol stadı
float d7_Hm(){ return mix(14.,42.,u_p[1]); }
float d7_e(vec2 xz){ return length(xz/D7_A); }
float d7_h(vec2 xz){
  float e=d7_e(xz);
  float r=(e-1.)*length(D7_A)*.7;
  float h=r*mix(.45,.85,u_p[0]);
  h=clamp(h,0.,d7_Hm());
  float tier=.85;
  float k=fract(h/tier);
  return (floor(h/tier)+smoothstep(.0,.25,k))*tier*step(1.,e)+1.;
}
// m: 0 çim / pist, 1 tribün, 2 çatı, 3 projektör direği
float d7_map(vec3 p, out float m){
  float d=(p.y-d7_h(p.xz))*.42; m=d7_e(p.xz)<1.0?0.:1.;
  if(d7_e(p.xz)<1.) d=p.y-1.;
  float e=d7_e(p.xz);
  float Hm=d7_Hm();
  float ebk=1.+Hm/mix(.45,.85,u_p[0])/(length(D7_A)*.7);
  float back=(ebk+.03-e)*length(D7_A)*.5; back=max(back, p.y-(Hm+6.));
  if(-back<d && e>ebk){ }
  float wall=max(e-ebk-.02, -(e-ebk))*length(D7_A)*.5; wall=max(wall, p.y-Hm-5.);
  if(wall<d){ d=wall; m=1.; }
  if(u_p[6]>.15){
    float roofy=Hm+mix(8.,12.,u_p[6]);
    float er=max(e-ebk-.02, (ebk-.02-mix(.08,.3,u_p[6]))-e)*length(D7_A)*.5;
    float roof=max(abs(p.y-roofy)-.6, er);
    if(roof<d){ d=roof; m=2.; }
  }
  vec2 cq=vec2(abs(p.x)-D7_A.x*1.08*ebk*.92, abs(p.z)-D7_A.y*.92*ebk*.92);
  float mast=max(length(cq)-1.2, p.y-(Hm+38.));
  float bank=b7_box(vec3(cq.x+1.5, p.y-(Hm+40.), cq.y+1.5), vec3(4.,3.,4.));
  float ms=min(mast,bank); if(ms<d){ d=ms; m=3.; }
  return d;
}
float d7_d(vec3 p){ float m; return d7_map(p,m); }
vec3 d7_L(){ return normalize(vec3((hash11(u_seed*.4)-.5)*1.4, mix(.25,.7,hash11(u_seed*.8)), .6)); }
float d7_march(vec3 ro, vec3 rd, float tmax, int n, out float m){
  float t=.1; m=-1.;
  for(int i=0;i<120;i++){
    if(i>=n) break;
    float d=d7_map(ro+rd*t,m);
    if(abs(d)<.002*t+.003) return t;
    t+=max(d,.02)*.95;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 d7_sky(vec3 rd){
  float n=u_p[4];
  vec3 s=mix(mix(u_c[2],u_c[1],.3)*1.1, mix(u_c[1],u_c[0],.45), pow(max(rd.y,0.),.5));
  s=mix(s, mix(u_c[1]*.15+u_c[3]*.05, u_c[0]*.1, max(rd.y,0.)), n);
  float sd=max(dot(rd,d7_L()),0.);
  s+=mix(vec3(1.,.88,.7),u_c[2],.35)*(pow(sd,8.)*.3+pow(sd,300.)*2.)*(1.-n);
  float cl=smoothstep(.1,.75,fbm4(rd.xz/max(rd.y,.04)*.25+SEED2))*smoothstep(0.,.3,rd.y);
  return mix(s, mix(u_c[2],vec3(1.),.2)*mix(1.,.15,n), cl*.4);
}
vec3 d7_lights(int i){
  float Hm=d7_Hm();
  float ebk=1.+Hm/mix(.45,.85,u_p[0])/(length(D7_A)*.7);
  vec2 s=vec2(i==0||i==2?1.:-1., i<2?1.:-1.);
  return vec3(s.x*(D7_A.x*1.08*ebk*.92-1.5), Hm+40., s.y*(D7_A.y*.92*ebk*.92-1.5));
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=b7_screen();
  float zm=max(abs(u_cam.x),.01);
  float Hm=d7_Hm();
  float ang=hash11(u_seed*.27)*6.283+u_cam.y*1.2;
  float er=mix(1.04,1.25,u_p[7]);
  vec2 xz=vec2(sin(ang),cos(ang))*D7_A*er;
  float hgt=d7_h(xz)+1.3+max(-u_cam.z,0.)*300.;
  hgt=max(hgt-max(u_cam.z,0.)*8.,1.4);
  vec3 ro=vec3(xz.x, hgt, xz.y);
  vec3 ta=vec3(-xz.x*.25, 1.-sat((hgt-20.)/150.)*0.+mix(4.,-10.,sat(hgt/80.)), -xz.y*.25);
  ta.y+=u_cam.z*60.;
  mat3 cam=b7_look(ro, ta);
  vec3 rd=normalize(cam*vec3(q,1.25*zm));
  float m; float t=d7_march(ro,rd,700.,120,m);
  float night=u_p[4];
  vec3 flc=mix(vec3(.95,.97,1.),u_c[2],.2);
  vec3 col;
  vec3 fogc=mix(mix(u_c[2],u_c[1],.4)*.85, u_c[0]*.15+flc*.03, night);
  if(t<0.) col=d7_sky(rd);
  else {
    vec3 p=ro+rd*t;
    vec2 e=vec2(.03+t*.004,0.);
    vec3 n=normalize(vec3(d7_d(p+e.xyy)-d7_d(p-e.xyy), d7_d(p+e.yxy)-d7_d(p-e.yxy), d7_d(p+e.yyx)-d7_d(p-e.yyx)));
    vec3 alb; float em=0.;
    if(m<.5){
      bool pitch=abs(p.x)<34. && abs(p.z)<52.5;
      vec3 grass=mix(vec3(.12,.35,.1),u_c[1],.15);
      alb=pitch ? grass*(1.-.18*u_p[5]*step(.5,fract(p.z/9.))) : mix(vec3(.55,.2,.12),u_c[3],.3)*.8;
      if(pitch){
        float ln=0.;
        ln+=step(abs(abs(p.x)-34.),.12)+step(abs(abs(p.z)-52.5),.12)+step(abs(p.z),.12)*step(abs(p.x),34.);
        ln+=step(abs(length(p.xz)-9.15),.12);
        vec2 bx=vec2(abs(p.x),abs(p.z));
        ln+=step(abs(bx.x-20.15),.12)*step(36.,bx.y)+step(abs(bx.y-36.),.12)*step(bx.x,20.15);
        alb=mix(alb, vec3(.9), sat(ln));
      }
      alb*=.9+.1*vnoise(p.xz*.5);
    } else if(m<1.5){
      float az=atan(p.x,p.z);
      float sec=floor(az*6./3.1416+3.);
      float h=hash11(sec+u_seed*3.);
      vec3 sc=mix(mix(u_c[3],vec3(.6,.08,.06),.4), mix(u_c[1],vec3(.08,.2,.5),.5), step(.5,h));
      sc=mix(sc, mix(vec3(.85),u_c[2],.3), step(.82,h)*u_p[2]);
      sc=mix(vec3(.35), sc, .3+.7*u_p[2]);
      float aa=exp(-t*.012);
      float row=fract(p.y/.85);
      alb=sc*mix(.78,.55+.45*step(.35,row),aa)*mix(.92,.85+.15*step(.5,fract(az*120.)),aa);
      if(n.y<.3) alb*=mix(.85,.6,aa);
    } else if(m<2.5){ alb=vec3(.7,.72,.75); }
    else { alb=vec3(.4); em=step(Hm+37.,p.y)*step(abs(n.y),.5); }
    vec3 L=d7_L();
    vec3 sunc=mix(vec3(1.,.9,.75),u_c[2],.35)*2.4*(1.-night*.95);
    float sh=1.;
    if(night<.92){ float mm; if(d7_march(p+n*.1,L,300.,48,mm)>0.) sh=0.; }
    vec3 c=alb*sunc*sh*max(dot(n,L),0.);
    c+=alb*mix(mix(u_c[2],u_c[1],.5)*.45, u_c[0]*.12, night)*(.45+.55*max(n.y,0.));
    // projektör aydınlatması
    for(int i=0;i<4;i++){
      vec3 lp=d7_lights(i);
      vec3 tl=lp-p; float dl=length(tl);
      c+=alb*flc*max(dot(n,tl/dl),0.)*u_p[3]*mix(.25,1.,night)*9000./(dl*dl+2000.);
    }
    col=c+flc*em*u_p[3]*mix(1.5,6.,night);
    col=mix(col, fogc, 1.-exp(-t*.0018));
  }
  // projektör parıltısı ve huzmeler
  float tmax=t<0.?1e4:t;
  for(int i=0;i<4;i++){
    vec3 lp=d7_lights(i);
    float tl; float dd=b7_glow(ro,rd,lp,tmax,tl);
    col+=flc*u_p[3]*mix(.25,1.,night)*(exp(-dd*dd*.05)*1.6+exp(-dd*.06)*.12);
  }
  return col;
}`,
    },
  });
})();
