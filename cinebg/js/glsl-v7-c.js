/* CineBG Studio v7 — stilize ve tür motorları: vaporwave, Y2K krom, gökyüzü adaları, Atlantis, mecha hangarı,
   rüya manzarası, mürekkep (wuxia) ve gök olayları. Hepsi 2B katmanlı; kamera kaydırma/yakınlaştırma MAIN'den gelir. */
(function () {
  const CB = window.CB;
  const E = {};

  E.vaporwave = {
    name: 'Vaporwave Gün Batımı',
    params: ['Ufuk yüksekliği', 'Güneş boyutu', 'Güneş bantları', 'Izgara yoğunluğu', 'Sütun & heykel', 'Palmiyeler', 'Pus', 'Hareket'],
    glsl: `
float vw_box(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float vw_column(vec2 p, float h, float w){
  float shaft=vw_box(p-vec2(0.,h*.5), vec2(w*(1.-.08*p.y/h),h*.5));
  float cap=vw_box(p-vec2(0.,h+w*.35), vec2(w*1.6,w*.35));
  float base=vw_box(p-vec2(0.,w*.3), vec2(w*1.5,w*.3));
  return min(min(shaft,cap),base);
}
float vw_bust(vec2 p, float s){
  // kaide üstünde klasik baş profili: kafatası, burun, çene, boyun
  float ped=vw_box(p-vec2(0.,s*.35), vec2(s*.5,s*.35));
  float top=vw_box(p-vec2(0.,s*.75), vec2(s*.6,s*.06));
  vec2 q=p-vec2(0.,s*1.45);
  float skull=length(q/vec2(.85,1.))-s*.42;
  float nose=max(vw_box((q-vec2(s*.42,-s*.02))*mat2(.9,-.44,.44,.9), vec2(s*.07,s*.12)), -q.y-s*.15);
  float jaw=length((q-vec2(s*.12,-s*.3))/vec2(1.2,.8))-s*.25;
  float neck=vw_box(p-vec2(-s*.02,s*.95), vec2(s*.17,s*.18));
  return min(min(min(ped,top),min(skull,nose)),min(jaw,neck));
}
float vw_palm(vec2 p, float h, float sd){
  float bend=.18*h;
  float x=p.x-bend*pow(sat(p.y/h),2.);
  float trunk=abs(x)-mix(.012,.006,sat(p.y/h))*h*4.;
  trunk=max(trunk, max(-p.y, p.y-h));
  vec2 c=p-vec2(bend,h);
  float fr=1e3;
  for(int i=0;i<7;i++){
    float a=-2.7+float(i)*.9+hash11(float(i)+sd)*.3;
    vec2 d=vec2(cos(a),sin(a));
    float t=clamp(dot(c,d),0.,h*.55);
    vec2 q=c-d*t; q.y+=t*t/(h*1.4);
    fr=min(fr, length(q)-.025*h*(1.-t/(h*.55))-.004);
  }
  return min(trunk,fr);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.02+.25*u_p[7]);
  float hz=mix(-.22,.12,u_p[0]);
  float h=uv.y-hz;
  vec3 top=u_c[0]*.9, mid=mix(u_c[3],u_c[1],.35), low=mix(u_c[2],u_c[3],.3);
  vec3 col=mix(mid, top, smoothstep(.0,.55,h));
  col=mix(low*1.3, col, smoothstep(-.02,.18,h));
  // güneş: alt yarısı yatay bantlarla kesik
  float R=mix(.12,.3,u_p[1]);
  vec2 sc=vec2(hash12(SEED2)*.3-.15, hz+R*.55);
  float sd=length(uv-sc);
  float band=1.;
  if(uv.y<sc.y){ float k=(sc.y-uv.y)/R; float f=fract(k*mix(4.,10.,u_p[2])+t*.6); band=step(k*k*.7*u_p[2]+.04, f); }
  vec3 sunc=mix(u_c[2]*1.6, u_c[3]*1.4, smoothstep(sc.y+R, sc.y-R, uv.y));
  float disc=smoothstep(R, R-PX*1.5, sd)*band*step(hz,uv.y);
  col=mix(col, sunc*2.4, disc);
  col+=u_c[3]*exp(-max(sd-R,0.)*7.)*.35*step(hz,uv.y);
  // uzak dağ siluetleri
  float mx=uv.x*2.5+SEED2.x;
  float mtn=hz+.04+.07*abs(sin(mx*1.3))*(.6+.4*gnoise(vec2(mx,.3)))+.03*gnoise(vec2(mx*3.,1.));
  float mt=smoothstep(mtn+PX, mtn-PX, uv.y)*step(hz,uv.y);
  col=mix(col, mix(u_c[0]*.4, u_c[3]*.35, .4), mt*.85);
  col+=u_c[3]*1.2*smoothstep(PX*2.,0.,abs(uv.y-mtn))*step(hz,uv.y)*.4;
  // perspektif ızgara zemin
  if(h<0.){
    float z=.12/max(-h,.002);
    vec2 g=vec2(uv.x*z, z+t*3.);
    float dens=mix(1.5,4.,u_p[3]);
    vec2 gg=g*dens;
    vec2 fw=fwidth(gg);
    vec2 dl=.5-abs(fract(gg)-.5);
    vec2 ln=(1.-smoothstep(vec2(0.), fw*1.5, dl-.012))*(1.-smoothstep(.25,.6,fw));
    float l=max(ln.x,ln.y);
    float fade=exp(-z*.05);
    vec3 fl=mix(u_c[0]*.18, u_c[0]*.3+u_c[1]*.08, sat(-h*3.));
    col=fl+u_c[3]*1.8*l*fade+mix(u_c[3],u_c[2],.5)*.5*exp(h*30.);
    col+=sunc*.45*exp(-abs(uv.x-sc.x)*6.)*exp(h*6.)*band;
  }
  // heykeller ve sütunlar
  if(u_p[4]>.15){
    vec2 q=uv-vec2(-A*.32, hz-.02);
    float s=mix(.06,.13,u_p[4]);
    float d=vw_column(q-vec2(-.08,0.), s*3.2, s*.18);
    d=min(d, vw_column(q-vec2(A*.62,0.), s*2.6, s*.16));
    d=min(d, vw_bust(q-vec2(.1,0.), s*.85));
    float m=smoothstep(PX*1.5,0.,d);
    vec3 sil=mix(u_c[0]*.15, u_c[1]*.5, sat((uv.y-hz)*4.));
    float rim=smoothstep(PX*3.,0.,abs(d+PX*2.))*sat(dot(normalize(vec2(1.,.3)), normalize(uv-sc+1e-4))*-1.+.4);
    col=mix(col, sil+u_c[3]*rim*.8, m);
  }
  if(u_p[5]>.15){
    float pd=1e3;
    pd=min(pd, vw_palm(uv-vec2(A*.42,hz-.03), mix(.25,.45,u_p[5]), 1.));
    pd=min(pd, vw_palm((uv-vec2(A*.33,hz-.03))*vec2(-1.,1.), mix(.18,.33,u_p[5]), 5.));
    col=mix(col, u_c[0]*.08, smoothstep(PX*1.5,0.,pd));
  }
  col=mix(col, low*1.1, u_p[6]*.55*exp(-abs(h)*14.));
  return col;
}`,
  };

  E.y2k = {
    name: 'Y2K Krom & Yanardöner',
    params: ['Blob sayısı', 'Blob boyutu', 'Krom ↔ yanardöner', 'Baloncuklar', 'Zemin ızgarası', 'Parlama', 'Arka plan tonu', 'Akış hızı'],
    glsl: `
vec3 y2_irid(float x){ return .5+.5*cos(TAU*(x+vec3(0.,.33,.67))); }
vec3 y2_env(vec2 n, float k){
  float y=n.y;
  vec3 chrome=mix(u_c[0]*.2, vec3(1.), smoothstep(-.1,.25,y))*mix(.35,1.,smoothstep(-.6,.0,y));
  chrome=mix(chrome, u_c[2]*1.1, smoothstep(.5,.95,y));
  chrome+=vec3(1.)*smoothstep(.03,.0,abs(y-.18))*1.2;
  vec3 ir=y2_irid(y*.8+n.x*.3+.1)*mix(.5,1.2,smoothstep(-.5,.6,y));
  ir=mix(ir, mix(u_c[3],u_c[2],.5)*1.2, .25);
  return mix(chrome, ir, k);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.03+.25*u_p[7]);
  vec3 bg=mix(mix(u_c[0], u_c[1], .35+.3*u_p[6]), mix(u_c[3], u_c[2], .4), smoothstep(-.5,.6,uv.y+.2*sin(uv.x*1.3+SEED2.x)));
  bg*=.55;
  // halkalar ve teknoloji ızgarası
  vec3 col=bg;
  float rings=abs(fract(length(uv-vec2(.25,.1))*6.-t*.3)-.5);
  col+=u_c[2]*.05*smoothstep(.04,0.,rings);
  if(u_p[4]>.1 && uv.y<-.18){
    float hh=-.18-uv.y; float z=.1/hh; vec2 g=vec2(uv.x*z, z-t)*2.;
    vec2 fw=fwidth(g); vec2 ln=smoothstep(fw*1.5,vec2(0.),abs(fract(g)-.5)-.47);
    col+=mix(u_c[3],u_c[2],.5)*max(ln.x,ln.y)*exp(-z*.15)*u_p[4]*1.3;
  }
  // metabol bloblar
  float f=0.; vec2 gr=vec2(0.);
  int N=2+int(u_p[0]*5.99);
  float rs=mix(.07,.16,u_p[1]);
  for(int i=0;i<8;i++){
    if(i>=N) break;
    float fi=float(i);
    vec2 h=hash22(vec2(fi*3.1,7.7)+SEED2);
    vec2 c=(h-.5)*vec2(A*.75,.6)+vec2(sin(t*(.7+h.x)+fi*2.),cos(t*(.6+h.y)+fi))*.07;
    float r=rs*(.6+.8*hash11(fi*5.3+SEED2.x));
    vec2 d=uv-c; float dd=dot(d,d)+1e-4;
    f+=r*r/dd; gr+=-2.*r*r*d/(dd*dd);
  }
  float e=smoothstep(1.,1.08,f);
  if(e>0.){
    vec2 n2=-gr*rs*.35/(f*f);
    float nl=length(n2); if(nl>.97) n2*=.97/nl;
    vec3 n=vec3(n2, sqrt(1.-dot(n2,n2)));
    vec3 env=y2_env(n.xy, u_p[2]);
    float fres=pow(1.-n.z,2.);
    vec3 bc=env*(.75+.5*fres);
    bc+=vec3(1.)*pow(sat(dot(n,normalize(vec3(-.4,.6,.7)))),60.)*3.*(.4+u_p[5]);
    col=mix(col, bc, e);
  }
  // baloncuklar
  if(u_p[3]>.05){
    for(int i=0;i<14;i++){
      float fi=float(i);
      if(fi>u_p[3]*14.) break;
      vec2 h=hash22(vec2(fi,2.3)+SEED2*1.7);
      vec2 c=vec2((h.x-.5)*A*.95, mod(h.y+t*.08*(.5+h.x),1.2)-.6);
      float r=mix(.015,.07,hash11(fi*1.7+SEED2.y));
      float d=length(uv-c);
      if(d<r+PX*2.){
        float k=d/r;
        float ring=smoothstep(.7,1.,k)*smoothstep(1.+PX/r*1.5,1.,k);
        vec3 ir=y2_irid(k*1.3+fi*.17+uv.y);
        col=mix(col, col*.85+ir*.6*ring+ir*.08, smoothstep(r+PX,r-PX,d));
        col+=vec3(1.)*smoothstep(.25,.0,length((uv-c)/r-vec2(-.35,.4)))*1.2;
      }
    }
  }
  col+=mix(u_c[3],u_c[2],.5)*.25*u_p[5]*exp(-length(uv-vec2(-.3,.25))*3.);
  return col;
}`,
  };

  E.skyship = {
    name: 'Gökyüzü Adaları & Hava Gemileri',
    params: ['Ada sayısı', 'Ada boyutu', 'Şelaleler', 'Hava gemileri', 'Bulut denizi', 'Güneş X', 'Güneş yüksekliği', 'Sis'],
    glsl: `
float sk_island(vec2 p, float w, float sd){
  // üst yüzey hafif kubbe, alt ters koni pürüzlü kaya
  float top=p.y-.04*w*(1.-pow(p.x/w,2.))-.012*w*gnoise(vec2(p.x/w*6.,sd));
  float x=abs(p.x)/w;
  float depth=w*mix(.45,.85,hash11(sd));
  float prof=pow(sat(1.-x),1.6)+.25*pow(sat(1.-abs(x-.35)*3.),2.)*hash11(sd+2.);
  float rough=.12*w*fbm4(vec2(p.x/w*7.+sd, p.y/w*4.))+.08*w*abs(sin(p.x/w*13.+sd));
  float bot=p.y+depth*prof+rough;
  float side=abs(p.x)-w*(1.+.12*sin(p.y/w*9.+sd));
  return max(max(top, -bot), side);
}
float sk_ship(vec2 p, float s){
  float env=length(p/vec2(s*1.,s*.32))-1.;
  float gon=max(abs(p.x+s*.05)-s*.28, abs(p.y+s*.42)-s*.07)/s;
  float fin=max(abs(p.x-s*.9)-s*.12, abs(p.y)-s*.28+ (p.x-s*.8)*.6)/s;
  float rope=max(abs(abs(p.x+.05*s)-s*.2)-s*.008, abs(p.y+s*.33)-s*.06)/s;
  return min(min(min(env,gon),fin),rope);
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*.02;
  vec2 sun=vec2(mix(-.6,.6,u_p[5])*A*.5, mix(-.05,.35,u_p[6]));
  vec3 col=skyGrad(uv, -.35, sun, .025, .8);
  col=mix(col, mix(u_c[2],u_c[1],.5), .25*smoothstep(.3,-.4,uv.y));
  // yüksek bulutlar
  float cl=fbm(uv*vec2(1.6,4.)+vec2(t,SEED2.y));
  col=mix(col, mix(u_c[2]*1.1, u_c[1], .3), smoothstep(.15,.5,cl)*.35*smoothstep(-.1,.4,uv.y));
  int N=2+int(u_p[0]*4.99);
  for(int L=0;L<3;L++){
    float fl=float(L);
    float depth=1.-fl*.33; // 1 uzak, ~.33 yakın
    float fog=mix(.75,.05,fl/2.)*mix(.5,1.2,u_p[7]);
    vec3 atm=mix(col, mix(u_c[2],u_c[1],.4), .0);
    for(int i=0;i<6;i++){
      if(i>=N) break;
      float fi=float(i)+fl*7.;
      vec2 h=hash22(vec2(fi,4.1)+SEED2);
      if(h.y<.25 && L<2) continue;
      float w=mix(.05,.12,u_p[1])*(.6+fl*.55)*(.6+.8*h.x);
      vec2 c=vec2((h.x-.5)*A*1.1, mix(-.2,.25,h.y)-fl*.08);
      c.y+=sin(t*3.+fi)*.006;
      vec2 p=uv-c;
      float d=sk_island(p, w, fi);
      float m=smoothstep(PX*1.5,-PX*.5,d);
      if(m>0.){
        float grass=smoothstep(.02*w,0.,-p.y)*step(-.03*w,p.y);
        vec3 rock=mix(u_c[0]*.5, u_c[1]*.55, sat(p.y/w*1.5+.8));
        rock*=.75+.35*fbm4(p/w*8.+fi);
        vec3 gc=mix(vec3(.18,.32,.12), u_c[3]*.5, .25);
        vec3 ic=mix(rock, gc*1.2, grass);
        ic+=u_c[2]*.25*sat(dot(normalize(vec2(p.x,.4*w)), normalize(sun-c)))*grass;
        // ağaç tepecikleri
        float tr=step(.6,vnoise(vec2(p.x/w*14.,fi)))*smoothstep(.0,.015*w,p.y+.0)*smoothstep(.06*w,.0,p.y-.0)*step(abs(p.x),w*.8);
        ic=mix(ic, gc*.6, tr*.8);
        ic=mix(ic, mix(u_c[2],u_c[1],.45)*.9, fog);
        col=mix(col, ic, m);
      }
      // şelale
      if(u_p[2]>.1 && hash11(fi*2.7)<u_p[2]){
        float wx=c.x+(hash11(fi*9.1)-.5)*w*1.2;
        float wl=abs(uv.x-wx);
        float below=c.y-uv.y;
        if(below>0. && below<.35){
          float fw=w*.04*(1.+below*5.);
          float fall=smoothstep(fw,0.,wl)*exp(-below*mix(9.,4.,u_p[2]));
          float streak=.6+.4*vnoise(vec2(uv.x*400.,uv.y*20.+u_time*3.));
          col=mix(col, mix(vec3(.9,.95,1.),u_c[2],.3)*(1.-fog*.5), fall*streak*(1.-m));
          col+=vec3(.8,.85,.9)*.15*exp(-below*3.)*smoothstep(fw*6.,0.,wl);
        }
      }
    }
    // hava gemileri
    if(u_p[3]>.1){
      for(int k=0;k<3;k++){
        float fk=float(k)+fl*3.;
        if(hash11(fk*4.4+SEED2.x)>u_p[3]) continue;
        vec2 h=hash22(vec2(fk,9.)+SEED2);
        float s=mix(.03,.075,h.x)*(.5+fl*.5);
        vec2 c=vec2(mod((h.x-.5)*A+t*(.4+h.y)+A*.5, A*1.2)-A*.6, mix(.05,.3,h.y)-fl*.05);
        float d=sk_ship(uv-c, s);
        float m=smoothstep(PX*1.5/s,0.,d);
        vec3 sc=mix(u_c[0]*.35, u_c[1]*.4, .5); sc+=u_c[2]*.3*smoothstep(.0,-.3,(uv.y-c.y)/s*-1.);
        col=mix(col, mix(sc, mix(u_c[2],u_c[1],.4), fog), m);
      }
    }
  }
  // bulut denizi
  float cs=mix(-.6,-.2,u_p[4]);
  float cn=fbm(vec2(uv.x*2.2+t*1.5, uv.y*5.)+SEED2)*.08;
  float sea=smoothstep(cs+cn+.04, cs+cn-.04, uv.y);
  vec3 seaC=mix(u_c[2]*1.05, u_c[1]*.8, sat((cs-uv.y)*3.));
  seaC+=u_c[2]*.6*exp(-length((uv-vec2(sun.x,cs))*vec2(1.,5.))*3.);
  col=mix(col, seaC, sea);
  return col;
}`,
  };

  E.atlantis = {
    name: 'Atlantis · Batık Şehir',
    params: ['Şehir yoğunluğu', 'Kubbeler', 'Sütunlar', 'Işık huzmeleri', 'Kabarcıklar', 'Derinlik sisi', 'Pencere ışıkları', 'Akıntı'],
    glsl: `
float at_box(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float at_building(vec2 p, float w, float sd){
  float k=hash11(sd);
  float h=w*mix(1.2,3.5,hash11(sd+1.));
  float body=at_box(p-vec2(0.,h*.5), vec2(w*.5,h*.5));
  float d=body;
  if(k<.45){ // kubbe
    float dome=length(p-vec2(0.,h))-w*.5; dome=max(dome,-(p.y-h));
    d=min(d,dome);
    d=min(d, at_box(p-vec2(0.,h+w*.62), vec2(w*.02,w*.12)));
  } else if(k<.75){ // üçgen alınlık
    float roof=max(abs(p.x)*.55+(p.y-h)-w*.28, -(p.y-h));
    d=min(d,roof);
  } else { // basamaklı kule
    d=min(d, at_box(p-vec2(0.,h+w*.35), vec2(w*.32,w*.35)));
    d=min(d, at_box(p-vec2(0.,h+w*.85), vec2(w*.16,w*.25)));
  }
  return d;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.03+.2*u_p[7]);
  vec3 deep=u_c[0]*.5+vec3(0.,.02,.04), shal=mix(u_c[1],u_c[2],.35);
  vec3 col=mix(deep, shal, smoothstep(-.6,.6,uv.y));
  col+=u_c[2]*.35*exp(-length((uv-vec2(.1,.7))*vec2(.6,1.))*2.);
  float floorY=-.3+.03*gnoise(vec2(uv.x*2.,SEED2.x));
  // katmanlı şehir
  for(int L=0;L<4;L++){
    float fl=float(L);
    float fog=mix(.85,.05,fl/3.)*mix(.6,1.2,u_p[5]);
    float base=floorY+.06-fl*.035;
    float cell=mix(.18,.09,u_p[0])*(1.+fl*.35);
    vec2 q=vec2(uv.x+fl*1.7+SEED2.x, uv.y-base);
    float id=floor(q.x/cell);
    float d=1e3; vec2 lp=vec2(0.);
    for(int j=-1;j<=1;j++){
      float cid=id+float(j);
      if(hash11(cid*1.31+fl*7.)>mix(.45,.95,u_p[0])) continue;
      vec2 p=vec2(q.x-(cid+.5)*cell, q.y);
      float w=cell*mix(.45,.85,hash11(cid+fl*3.));
      float bd=at_building(p, w, cid*3.7+fl);
      if(hash11(cid*2.9+fl)>1.-u_p[1]*.5){ float dome=length(p-vec2(0.,0.))-w*1.1; bd=min(bd,max(dome,-p.y)); }
      if(bd<d){ d=bd; lp=p/w; }
    }
    // sütun dizisi
    if(u_p[2]>.15 && L>=1){
      float cs=cell*.5;
      float cx=abs(fract(q.x/cs)-.5)*cs;
      float ch=cell*mix(1.,2.4,hash11(floor(q.x/cs)+fl*11.))*u_p[2];
      float col1=max(cx-cs*.09, max(-q.y, q.y-ch));
      float lint=max(abs(q.y-ch)-cs*.08, 0.)+step(hash11(floor(q.x/(cs*4.))+fl),.4)*1.;
      if(hash11(floor(q.x/(cs*6.))+fl*5.)<.5) d=min(d, min(col1, lint));
    }
    float m=smoothstep(PX*1.5,0.,d);
    if(m>0.){
      vec3 stone=mix(u_c[1]*.45, u_c[2]*.5, sat(lp.y*.3+.3));
      stone*=.7+.3*vnoise(uv*80.+fl);
      float alg=smoothstep(.55,.8,fbm4(uv*25.+fl))*.5;
      stone=mix(stone, mix(u_c[3],vec3(.1,.35,.2),.5)*.4, alg);
      // pencereler
      vec2 wg=fract(lp*vec2(3.,3.))-.5; float win=step(abs(wg.x),.12)*step(abs(wg.y),.2)*step(hash12(floor(lp*vec2(3.,3.))+fl*7.+SEED2), u_p[6]*.3)*step(1.5,float(L));
      stone+=u_c[3]*1.8*win*step(.1,lp.y)*step(abs(lp.x),.4);
      col=mix(col, mix(stone, mix(deep,shal,.45), fog), m);
    }
  }
  // deniz tabanı
  float fm=smoothstep(floorY+PX, floorY-PX, uv.y);
  if(fm>0.){
    float z=.08/max(floorY-uv.y+.02,.002);
    vec3 sand=mix(u_c[1]*.5, u_c[2]*.6, .4);
    float rip=.5+.5*sin(uv.x*z*14.+gnoise(vec2(uv.x*z,z)*2.)*4.);
    vec2 cp=vec2(uv.x*z, z)*3.;
    float ca=pow(sat(1.-abs(gnoise(cp+t)+gnoise(cp*1.7-t*.8))),6.);
    sand*=.7+.25*rip;
    sand+=u_c[2]*ca*.8*u_p[3];
    col=mix(col, mix(sand, mix(deep,shal,.4), sat(.6-z*.08)), fm);
  }
  // ışık huzmeleri
  if(u_p[3]>.05){
    float sx=uv.x+uv.y*.35;
    float rays=0.;
    for(int i=0;i<3;i++){ float fi=float(i); rays+=pow(sat(gnoise(vec2(sx*(6.+fi*5.)+fi*3.,t*.5+fi))),2.)*(1.-fi*.25); }
    col+=u_c[2]*rays*u_p[3]*.55*smoothstep(-.4,.6,uv.y);
  }
  // kabarcıklar ve askıda parçacık
  if(u_p[4]>.05){
    for(int i=0;i<3;i++){
      float fi=float(i);
      float sc=30.+fi*30.;
      vec2 g=vec2(uv.x*sc, uv.y*sc*.5-u_time*(1.+fi)*1.2);
      vec2 id=floor(g), f=fract(g);
      float h=hash12(id+fi*13.+SEED2);
      if(h<u_p[4]*.06){
        vec2 o=vec2(.5+.25*sin(g.y*1.3+h*20.), .5);
        float d=length((f-o)*vec2(1.,2.))/sc;
        float r=.0025+.003*hash12(id+3.);
        col+=mix(u_c[2],vec3(1.),.5)*smoothstep(r,r*.6,d)*.6*smoothstep(r*.2,r*.8,d)+vec3(1.)*smoothstep(r*.5,0.,length((f-o+vec2(.1,-.15))*vec2(1.,2.))/sc)*.4;
      }
    }
  }
  col+=sparkles(uv,90.,.6,-.03)*u_c[2]*.3;
  col=mix(col, deep*.6, smoothstep(.1,.75,length(uv*vec2(.6,1.)))*.35);
  return col;
}`,
  };

  E.mecha = {
    name: 'Mecha Hangarı',
    params: ['Robot boyutu', 'Robot sayısı', 'İskeleler', 'Çalışma ışıkları', 'Buhar', 'Göz ışığı', 'Duvar panelleri', 'Zemin yansıması'],
    glsl: `
float mc_box(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float mc_trap(vec2 p, float wt, float wb, float h){ float w=mix(wb,wt,sat(p.y/h+.5)); return max(abs(p.x)-w, abs(p.y)-h*.5); }
float mc_robot(vec2 p, float s, float sd){
  p/=s;
  float k=hash11(sd);
  float d=mc_trap(p-vec2(0.,.62), .42, .3, .5);                // gövde
  d=min(d, mc_box(p-vec2(0.,1.0), vec2(.13,.12)));             // kafa
  d=min(d, mc_trap(p-vec2(0.,1.13), .05, .17, .1));           // kask tepesi
  d=min(d, mc_box(p-vec2(0.,.3), vec2(.24,.08)));             // bel
  vec2 q=vec2(abs(p.x),p.y);
  d=min(d, mc_box(q-vec2(.56,.84), vec2(.2,.13))-.02);        // omuz zırhı
  d=min(d, mc_box(q-vec2(.58+.04*k,.5), vec2(.08,.25)));      // kol
  d=min(d, mc_box(q-vec2(.6+.06*k,.17), vec2(.11,.14)));      // el/önkol
  d=min(d, mc_box(q-vec2(.16,-.12), vec2(.1,.3)));            // uyluk
  d=min(d, mc_box(q-vec2(.18,-.62), vec2(.13,.24)));          // baldır
  d=min(d, mc_box(q-vec2(.2,-.9), vec2(.18,.05)));            // ayak
  if(k>.5) d=min(d, mc_box(q-vec2(.28,1.02), vec2(.02,.16))); // anten
  return d*s;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*.05;
  vec3 wallC=mix(u_c[0]*.6, u_c[1]*.35, .4);
  float floorY=-.36;
  vec3 col=wallC*(.35+.3*smoothstep(-.4,.5,uv.y));
  // duvar panelleri
  vec2 pg=uv*vec2(4.,3.)*mix(1.,2.,u_p[6])+SEED2;
  vec2 pf=fract(pg), pi=floor(pg);
  float seam=smoothstep(.03,.0,min(min(pf.x,1.-pf.x),min(pf.y,1.-pf.y)));
  col*=1.-.35*seam*u_p[6];
  col*=.85+.25*hash12(pi);
  col+=u_c[3]*.6*step(.93,hash12(pi+3.))*step(.4,pf.x)*step(pf.x,.6)*step(.45,pf.y)*step(pf.y,.5)*u_p[6];
  // tavan ışıkları ve konileri
  float lights=0.;
  for(int i=0;i<5;i++){
    float fi=float(i);
    float lx=(fi-2.)*A*.23+(hash11(fi+SEED2.x)-.5)*.05;
    vec2 lp=vec2(lx,.47);
    float cone=smoothstep(.0,.0,1.)*sat(1.-abs(uv.x-lx)/(.05+(lp.y-uv.y)*.32))*smoothstep(lp.y+.01,lp.y-.05,uv.y);
    lights+=cone*(.25+.75*hash11(fi*3.3))*u_p[3];
    col+=u_c[2]*3.*exp(-length((uv-lp)*vec2(1.,3.))*40.)*u_p[3];
  }
  col+=mix(u_c[2],vec3(1.,.95,.8),.4)*lights*.35;
  // robotlar
  int N=1+int(u_p[1]*2.99);
  float s=mix(.32,.62,u_p[0]);
  // arkadan aydınlatılmış pus: siluetler okunsun
  col+=mix(u_c[2],u_c[3],.3)*.35*exp(-abs(uv.y-.05)*3.)*(.5+.5*u_p[3]);
  for(int i=0;i<3;i++){
    if(i>=N) break;
    float fi=float(i);
    float x=N==1?0.:(fi/float(N-1)-.5)*A*.62;
    float sc=s*(i==1||N==1?1.:.82);
    vec2 base=vec2(x, floorY+sc*.98);
    float d=mc_robot(uv-base+vec2(0.,sc*.0), sc, fi+SEED2.x);
    float m=smoothstep(PX*1.5,0.,d);
    if(m>0.){
      vec2 lp=(uv-base)/sc;
      vec3 arm=mix(u_c[0]*.08, u_c[1]*.22+u_c[0]*.1, sat(lp.y*.5+.4));
      float plates=step(.94,fract(lp.y*7.+hash11(floor(lp.x*4.))))+step(.95,fract(lp.x*5.));
      arm*=1.-.35*sat(plates);
      arm+=u_c[2]*.08*pow(sat(1.-abs(lp.x)*1.6),3.);
      arm+=mix(u_c[2],vec3(1.),.3)*.35*lights*(.6+.4*sat(lp.y));
      vec2 gn=normalize(vec2(dFdx(d),dFdy(d))+1e-6);
      float band=smoothstep(-.012*sc,0.,d);
      float rim=band*sat(dot(gn, normalize(vec2(.35,1.))));
      float rim2=band*sat(dot(gn, normalize(vec2(-1.,.2))))*.5;
      arm+=mix(u_c[2],vec3(1.),.3)*1.2*rim+u_c[3]*.8*rim2;
      // göz
      float eye=smoothstep(.03,.0,mc_box(lp-vec2(0.,1.01), vec2(.09,.012)));
      arm=mix(arm, u_c[3]*4., eye*u_p[5]);
      // uyarı şeritleri
      float hz=step(.5,fract((lp.x+lp.y)*6.))*step(abs(lp.y-.3),.06)*step(abs(lp.x),.24);
      arm=mix(arm, mix(vec3(.9,.7,.1),vec3(.05),1.-hz)*.6, hz*.7);
      col=mix(col, arm, m);
    }
    col+=u_c[3]*u_p[5]*.6*exp(-length((uv-base-vec2(0.,1.01*sc))*vec2(.6,2.))/sc*6.);
  }
  // iskeleler
  if(u_p[2]>.1){
    for(int k=0;k<3;k++){
      float fk=float(k);
      if(fk>u_p[2]*3.) break;
      float y=mix(-.1,.32,fk/2.)+(hash11(fk+SEED2.y)-.5)*.06;
      float deck=smoothstep(PX*1.5,0.,abs(uv.y-y)-.007);
      float rail=smoothstep(PX*1.2,0.,abs(uv.y-y-.035)-.0018);
      float post=smoothstep(PX*1.2,0.,abs(fract(uv.x*12.+fk*.3)-.5)/12.-.0015)*step(y,uv.y)*step(uv.y,y+.035);
      float truss=smoothstep(PX*1.2,0.,abs(fract((uv.x+(uv.y-y)*.8)*10.)-.5)/10.-.001)*step(y-.03,uv.y)*step(uv.y,y);
      float g=max(max(deck,rail),max(post,truss*.8));
      col=mix(col, u_c[0]*.12+u_c[2]*.12*lights, g);
    }
  }
  // zemin
  if(uv.y<floorY){
    float z=.1/max(floorY-uv.y,.003);
    vec3 fl=mix(u_c[0]*.3, u_c[1]*.25, .3);
    float tiles=step(.96,fract(uv.x*z*1.5))+step(.96,fract(z*2.));
    fl*=1.-.3*tiles;
    float stripe=step(.5,fract((uv.x*z+z)*1.5))*smoothstep(.03,.0,abs(fract(z*.3)-.5)-.45);
    fl=mix(fl, vec3(.8,.6,.1)*.35, stripe*.5);
    // yansıma
    vec2 ruv=vec2(uv.x, 2.*floorY-uv.y);
    vec3 refl=wallC*.4+u_c[2]*lights*.2;
    fl=mix(fl, refl+u_c[3]*u_p[5]*.2*exp(-abs(uv.x)*4.), u_p[7]*.45*exp(-(floorY-uv.y)*6.));
    col=fl+u_c[2]*.25*lights;
  }
  // buhar
  if(u_p[4]>.05){
    vec2 sp=vec2(uv.x*2.5, uv.y*1.5-u_time*.06);
    float st2=fbm(sp+SEED2)*.5+.5;
    float mask=smoothstep(.15,-.4,uv.y)*u_p[4];
    col=mix(col, mix(wallC,u_c[2],.35)*(.8+lights), smoothstep(.45,.9,st2)*mask*.8);
  }
  return col;
}`,
  };

  E.dreamscape = {
    name: 'Rüya Manzarası',
    params: ['Ufuk yüksekliği', 'Süzülen merdivenler', 'Kapılar', 'Küreler', 'Bulutlar', 'Ayna zemin', 'Rüya ışığı', 'Süzülme'],
    glsl: `
float dr_box(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float dr_stairs(vec2 p, float s, int n){
  float d=1e3;
  for(int i=0;i<9;i++){ if(i>=n) break; float fi=float(i); d=min(d, dr_box(p-vec2(fi*s*1.,fi*s*.62), vec2(s*.5,s*.31+fi*0.))); }
  return d;
}
vec3 dr_sky(vec2 uv, float hz){
  float h=uv.y-hz;
  vec3 c=mix(mix(u_c[2],u_c[3],.35), mix(u_c[1],u_c[0],.3), smoothstep(-.05,.6,h));
  c+=u_c[2]*.6*exp(-abs(h)*10.);
  return c;
}
vec3 dr_layer(vec2 uv, float hz, float t, out float m){
  m=0.;
  vec3 col=vec3(0.);
  // bulutlar: yuvarlak kümeler
  if(u_p[4]>.05){
    for(int i=0;i<6;i++){
      float fi=float(i);
      if(fi>u_p[4]*6.) break;
      vec2 h=hash22(vec2(fi,1.9)+SEED2);
      vec2 c=vec2((h.x-.5)*A*1.1+sin(t+fi)*.03, hz+mix(.08,.42,h.y));
      float r=mix(.04,.09,hash11(fi+SEED2.y));
      float d=min(min(length(uv-c)-r, length(uv-c-vec2(r*1.1,-r*.25))-r*.75), length(uv-c+vec2(r*1.1,r*.3))-r*.7);
      d=max(d, -(uv.y-c.y+r*.55));
      float cm=smoothstep(PX*2.,-PX,d);
      vec3 cc=mix(u_c[2]*1.15, mix(u_c[3],u_c[1],.5), sat((c.y-uv.y)/r*.5+.5)*.5);
      col=mix(col,cc,cm); m=max(m,cm);
    }
  }
  // merdivenler
  if(u_p[1]>.1){
    for(int i=0;i<3;i++){
      float fi=float(i);
      if(fi>u_p[1]*3.) break;
      vec2 h=hash22(vec2(fi,6.2)+SEED2);
      float s=mix(.025,.05,h.y);
      vec2 o=vec2((h.x-.5)*A*.8, hz+mix(-.05,.2,hash11(fi*3.+SEED2.x))+sin(t*1.3+fi)*.01*u_p[7]);
      vec2 p=uv-o; if(h.x>.5) p.x=-p.x;
      float d=dr_stairs(p, s, 4+int(hash11(fi+2.)*4.));
      float sm=smoothstep(PX*1.5,0.,d);
      vec3 sc=mix(u_c[2]*1.05, u_c[1]*.7, smoothstep(.0,-s*.3,p.y-floor(p.x/s+.5)*s*.62+s*.3));
      col=mix(col, sc, sm); m=max(m,sm);
    }
  }
  // kapılar
  if(u_p[2]>.1){
    for(int i=0;i<3;i++){
      float fi=float(i);
      if(fi>u_p[2]*3.) break;
      vec2 h=hash22(vec2(fi,8.8)+SEED2);
      float s=mix(.06,.12,h.y);
      vec2 o=vec2((h.x-.5)*A*.9, hz+s*.0);
      vec2 p=uv-o;
      float frame=dr_box(p-vec2(0.,s), vec2(s*.42,s));
      float inner=dr_box(p-vec2(0.,s*.96), vec2(s*.34,s*.92));
      float fm=smoothstep(PX*1.5,0.,frame);
      float im=smoothstep(PX*1.5,0.,inner);
      vec3 fc=u_c[1]*.55;
      vec3 ic=mix(u_c[2]*2.2, u_c[3]*1.6, sat(p.y/(s*2.)))*(1.+u_p[6]);
      col=mix(col, mix(fc, ic, im), fm); m=max(m,fm);
      col+=ic*.15*exp(-length((p-vec2(0.,s))/vec2(.7,1.))/s*1.4)*(1.-fm);
    }
  }
  // küreler
  if(u_p[3]>.05){
    for(int i=0;i<5;i++){
      float fi=float(i);
      if(fi>u_p[3]*5.) break;
      vec2 h=hash22(vec2(fi,3.3)+SEED2*1.3);
      float r=mix(.02,.08,hash11(fi*7.+SEED2.y));
      vec2 c=vec2((h.x-.5)*A*.95, hz+r+mix(.0,.3,h.y)+sin(t*2.+fi*2.)*.015*u_p[7]);
      float d=length(uv-c);
      float sm=smoothstep(r+PX,r-PX,d);
      vec2 n=(uv-c)/r;
      float l=sat(dot(normalize(vec3(n,sqrt(sat(1.-dot(n,n))))), normalize(vec3(-.5,.6,.6))));
      vec3 sc=mix(u_c[1]*.4, mix(u_c[3],u_c[2],.4)*1.2, l)+u_c[2]*pow(l,30.)*2.;
      col=mix(col, sc, sm); m=max(m,sm);
    }
  }
  return col;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*(.05+.3*u_p[7]);
  float hz=mix(-.25,.05,u_p[0]);
  vec3 sky=dr_sky(uv, hz);
  // dev ay
  vec2 mc=vec2((hash12(SEED2)-.5)*A*.5, hz+.3);
  float mr=.09;
  sky=mix(sky, mix(u_c[2],vec3(1.),.4)*1.5, smoothstep(mr+PX,mr-PX,length(uv-mc))*.85);
  sky+=u_c[2]*.25*exp(-length(uv-mc)*5.)*u_p[6];
  vec3 col=sky;
  if(uv.y>=hz){
    float m; vec3 lc=dr_layer(uv,hz,t,m);
    col=mix(col, lc, m);
  } else {
    vec2 ruv=vec2(uv.x+sin(uv.y*80.+u_time)*.002*(1.-u_p[5]), 2.*hz-uv.y);
    float m; vec3 lc=dr_layer(ruv,hz,t,m);
    vec3 refl=mix(dr_sky(ruv,hz), lc, m);
    refl=mix(refl, mix(u_c[2],vec3(1.),.4)*1.5, smoothstep(mr+PX,mr-PX,length(ruv-mc))*.85);
    vec3 ground=mix(u_c[1]*.5, u_c[2]*.6, smoothstep(-.6,hz,uv.y));
    col=mix(ground, refl*.85, u_p[5]*smoothstep(-.7,hz,uv.y)*.9+.08);
    col*=1.-.15*smoothstep(.02,0.,abs(fract((hz-uv.y)*30./(hz-uv.y+.05))-.5));
  }
  col+=mix(u_c[2],u_c[3],.5)*.2*u_p[6]*exp(-abs(uv.y-hz)*12.);
  col+=sparkles(uv,60.,u_p[6]*1.5,.02)*u_c[2]*.6;
  return col;
}`,
  };

  E.wuxia = {
    name: 'Mürekkep Resmi · Wuxia Dağları',
    params: ['Dağ katmanları', 'Zirve keskinliği', 'Sis bantları', 'Köşk', 'Çam ağacı', 'Mürekkep yoğunluğu', 'Kâğıt dokusu', 'Kuşlar'],
    glsl: `
float wx_ridge(float x, float sd, float sharp){
  float h=0.;
  h+=.18*pow(1.-abs(gnoise(vec2(x*1.1+sd,sd))) ,mix(1.,3.,sharp));
  h+=.09*pow(1.-abs(gnoise(vec2(x*2.7+sd*2.,sd))) ,mix(1.,3.,sharp));
  h+=.03*gnoise(vec2(x*9.+sd,1.));
  // dik iğne dağlar
  float c=floor(x*2.+sd); float fx=fract(x*2.+sd)-.5;
  h+=sharp*.22*hash11(c+sd*3.)*exp(-fx*fx*mix(30.,90.,hash11(c)));
  return h;
}
float wx_pine(vec2 p, float s){
  p/=s;
  float trunk=max(abs(p.x+.15*sin(p.y*3.))-.03, max(-p.y, p.y-1.));
  float d=trunk;
  for(int i=0;i<5;i++){
    float fi=float(i);
    float y=.35+fi*.15;
    float w=(.5-fi*.07)*(1.+.3*sin(fi*7.));
    vec2 q=p-vec2(.15*sin(y*3.)+(mod(fi,2.)-.5)*.3, y);
    q.y-=.12*q.x*q.x/w;
    float b=length(q/vec2(w,.075))-1.;
    b+=.55*abs(gnoise(q*vec2(9.,22.)+fi))-.15;
    d=min(d,b*.07);
  }
  return d*s;
}
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*.01;
  // kâğıt
  vec3 paper=mix(vec3(.93,.89,.8), mix(u_c[2],vec3(.93,.89,.8),.75), .6);
  float fib=vnoise(uv*vec2(300.,40.))*.5+vnoise(uv*vec2(40.,300.))*.5;
  paper*=1.-u_p[6]*(.06*fib+.05*fbm4(uv*6.));
  vec3 ink=mix(vec3(.08,.08,.09), u_c[0]*.5, .25);
  vec3 col=paper;
  // gökte soluk güneş/ay
  vec2 sc=vec2((hash12(SEED2)-.5)*A*.6,.3);
  col=mix(col, mix(u_c[3],vec3(.8,.2,.15),.6), smoothstep(.045,.04,length(uv-sc))*.55);
  int N=2+int(u_p[0]*3.99);
  for(int L=0;L<6;L++){
    if(L>=N) break;
    float fl=float(L)/float(max(N-1,1)); // 0 uzak, 1 yakın
    float base=mix(.12,-.42,fl);
    float x=uv.x*mix(1.,2.2,fl)+float(L)*3.7+SEED2.x;
    float h=base+wx_ridge(x, float(L)*1.7+SEED2.y, u_p[1])*mix(.8,1.3,fl);
    float d=uv.y-h;
    if(d<0.){
      // mürekkep yıkama: tepede koyu, aşağı sise doğru açılır
      float wash=exp(d*mix(9.,4.,fl)*mix(1.5,.7,u_p[5]));
      float dry=smoothstep(.35,.75,vnoise(vec2(x*20.,uv.y*60.)))*.25;
      float edge=smoothstep(.012,0.,-d)*(.6+.4*vnoise(vec2(x*40.,1.)));
      float a=sat((wash*.75+edge*.5-dry*wash)*mix(.25,1.,fl)*mix(.6,1.2,u_p[5]));
      // kırışık dokusu
      a*=.85+.3*abs(gnoise(vec2(x*6.,uv.y*18.)));
      col=mix(col, ink, a);
    }
    // sis bandı
    float mist=exp(-pow((uv.y-(base-.02))*mix(14.,7.,u_p[2]),2.))*u_p[2];
    mist*=.7+.3*fbm4(vec2(uv.x*2.+t*3.,uv.y*6.+float(L)));
    col=mix(col, paper, sat(mist)*.9);
  }
  // köşk (kalkık saçaklı çatı)
  if(u_p[3]>.1){
    vec2 kp=uv-vec2(A*.18,-.02);
    float s=.06;
    vec2 q=kp/s;
    float roof=abs(q.y-.55-.25*q.x*q.x)-.08; roof=max(roof, abs(q.x)-1.1);
    float roof2=abs(q.y-1.05-.2*q.x*q.x)-.06; roof2=max(roof2, abs(q.x)-.75);
    float body=max(abs(q.x)-.6, abs(q.y-.2)-.32);
    float posts=max(abs(abs(q.x)-.45)-.05, abs(q.y-.2)-.35);
    float d=min(min(roof,roof2),min(body*1.+.0*posts,posts));
    float rock=length((kp-vec2(0.,-.06))/vec2(.12,.06))-1.;
    col=mix(col, ink*1.1, smoothstep(PX*1.5,0.,d*s)*min(1.,u_p[3]*1.6));
    col=mix(col, ink, smoothstep(.05,-.05,rock)*.6*u_p[3]);
  }
  // ön planda çam
  if(u_p[4]>.1){
    vec2 pp=uv-vec2(-A*.4,-.5);
    float d=wx_pine(pp, mix(.35,.6,u_p[4]));
    col=mix(col, ink*.8, smoothstep(.004,0.,d)*.95);
    float cliff=uv.y-(-.5+.12*exp(-pow((uv.x+A*.42)*5.,2.))+.03*gnoise(vec2(uv.x*8.,2.)));
    col=mix(col, ink, smoothstep(.005,-.005,cliff)*(.6+.4*vnoise(uv*50.)));
  }
  // kuşlar
  if(u_p[7]>.1){
    for(int i=0;i<7;i++){
      float fi=float(i);
      if(fi>u_p[7]*7.) break;
      vec2 h=hash22(vec2(fi,5.)+SEED2);
      vec2 c=vec2((h.x-.5)*A*.5+.15+t*3., .2+h.y*.15);
      vec2 p=(uv-c)*90.;
      float w=abs(p.y-.35*abs(p.x)+.3*p.x*p.x*.0)-.12; w=max(w, abs(p.x)-1.);
      col=mix(col, ink, smoothstep(.15,0.,w)*.8);
    }
  }
  return col*1.05;
}`,
  };

  E.eclipse = {
    name: 'Gök Olayları · Tutulma & Kuyrukluyıldız',
    params: ['Olay (tutulma / kuyrukluyıldız / kavuşum)', 'Gök cismi boyutu', 'Korona / kuyruk uzunluğu', 'Yıldızlar', 'Ufuk parıltısı', 'Arazi yüksekliği', 'Konum X', 'Samanyolu'],
    glsl: `
vec3 scene(vec2 uv, vec2 st){
  float t=u_time*.01;
  float hz=mix(-.42,-.12,u_p[5]);
  vec3 col=mix(u_c[0]*.25, u_c[1]*.3, smoothstep(.6,hz,uv.y));
  // samanyolu
  if(u_p[7]>.05){
    vec2 q=rot(.6+SEED2.x*.1)*uv;
    float band=exp(-pow(q.y*mix(5.,3.,u_p[7]),2.));
    float dust=fbm(q*vec2(3.,8.)+SEED2);
    col+=mix(u_c[2],u_c[3],.3)*band*(.25+.45*smoothstep(-.1,.5,dust))*u_p[7]*.5;
    col*=1.-band*smoothstep(.2,.6,fbm4(q*vec2(6.,14.)+3.))*.5*u_p[7];
    col+=starfield(uv*1.3, band*u_p[7]*1.5)*.6;
  }
  col+=starfield(uv, .2+.8*u_p[3]);
  // ufuk parıltısı (tutulmada 360° gün batımı)
  float glow=exp(-max(uv.y-hz,0.)*mix(14.,5.,u_p[4]));
  col+=mix(u_c[3],u_c[2],.4)*glow*mix(.2,1.2,u_p[4]);
  float mode=u_p[0];
  vec2 c=vec2(mix(-.35,.35,u_p[6])*A, mix(.1,.28,hash12(SEED2)));
  float R=mix(.035,.1,u_p[1]);
  if(mode<.34){
    // tam tutulma: siyah disk, korona ışınları, elmas yüzük
    vec2 d=uv-c; float r=length(d); float a=atan(d.y,d.x);
    float rays=pow(sat(gnoise(vec2(a*6.,SEED2.x))*.5+.5),2.)+.6*pow(sat(gnoise(vec2(a*17.,SEED2.y))*.5+.5),3.);
    float cor=exp(-(r-R)/(R*mix(.4,2.2,u_p[2])*(.5+rays)))*step(R,r);
    vec3 cc=mix(vec3(1.),u_c[2],.35);
    col+=cc*cor*1.6;
    col+=cc*exp(-(r-R)/(R*.08))*step(R,r)*2.5;
    col=mix(col, vec3(0.), smoothstep(R+PX,R-PX,r));
    vec2 dp=c+R*vec2(cos(2.3),sin(2.3));
    col+=vec3(1.)*exp(-length(uv-dp)*120.)*8.+vec3(1.)*exp(-length(uv-dp)*25.)*.6;
    col+=u_c[3]*smoothstep(.0,PX*2.,1.)*.0;
  } else if(mode<.67){
    // kuyrukluyıldız: baş + kavisli toz kuyruğu + düz iyon kuyruğu
    vec2 dir=normalize(vec2(.8,.45));
    vec2 d=uv-c;
    float along=dot(d,dir), perp=dot(d,vec2(-dir.y,dir.x));
    float L=mix(.3,.9,u_p[2]);
    float curve=perp+along*along*.35;
    float dustT=step(0.,along)*exp(-along/L*2.)*exp(-pow(curve/(.012+along*.12),2.));
    float ionT=step(0.,along)*exp(-along/(L*1.3)*1.5)*exp(-pow(perp/(.003+along*.02),2.));
    col+=mix(u_c[2],vec3(1.,.95,.85),.5)*dustT*1.4;
    col+=mix(u_c[3],vec3(.5,.7,1.),.5)*ionT*1.3;
    col+=vec3(1.)*exp(-length(d)/R*12.)*4.+mix(u_c[2],vec3(1.),.5)*exp(-length(d)/R*3.)*.8;
  } else {
    // kavuşum: hilal ay + iki parlak gezegen
    vec2 d=uv-c; float r=length(d);
    float moon=smoothstep(R+PX,R-PX,r);
    float shadow=smoothstep(R*1.02+PX,R*1.02-PX,length(d-vec2(R*.45,R*.18)));
    vec3 mc=mix(u_c[2],vec3(1.),.6)*1.6*(.85+.15*vnoise(d/R*6.));
    col=mix(col, mc, moon*(1.-shadow));
    col=mix(col, mc*.06, moon*shadow);
    col+=mix(u_c[2],vec3(1.),.5)*exp(-r/R*1.8)*.25;
    for(int i=0;i<2;i++){
      float fi=float(i);
      vec2 pp=c+vec2(-R*(2.2+fi*1.9), -R*(.6+fi*.9));
      vec3 pc=fi<.5?vec3(1.,.95,.85):mix(u_c[3],vec3(1.,.7,.5),.5);
      col+=pc*(exp(-length(uv-pp)*400.)*6.+exp(-length(uv-pp)*60.)*.3);
    }
  }
  // arazi silueti + yakın tepe
  float x=uv.x*1.6+SEED2.y;
  float ridge=hz+.06*ridged(vec2(x,.5),5)+.04*gnoise(vec2(x*4.,3.));
  float near=hz-.08+.05*fbm4(vec2(uv.x*2.5+SEED2.x,1.));
  float m1=smoothstep(PX,-PX,uv.y-ridge), m2=smoothstep(PX,-PX,uv.y-near);
  vec3 sil=u_c[0]*.12+mix(u_c[3],u_c[2],.4)*glow*.12;
  col=mix(col, sil, m1);
  col=mix(col, u_c[0]*.05, m2);
  // tek bir ağaç ya da kaya silueti
  vec2 tp=uv-vec2(-A*.3, near-.005);
  float tr=max(abs(tp.x)-.004, max(-tp.y, tp.y-.09));
  tr=min(tr, length((tp-vec2(0.,.11))/vec2(1.,.8))-.045+.012*gnoise(tp*60.));
  col=mix(col, u_c[0]*.04, smoothstep(PX,-PX,tr));
  return col;
}`,
  };

  Object.assign(CB.ENGINES, E);
})();
