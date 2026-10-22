/* CineBG Studio v6 — gündelik hayat motorları.
   street3d ve homeint gerçek 3B kameradır (u_cam.x yakınlaştırma / ayna, u_cam.y sapma, u_cam.z yükseklik ve eğim, u_roll yatırma).
   countryside 2B katmanlıdır; MAIN'in kamera dönüşümünü olduğu gibi alır. Birimler metredir. */
(function () {
  const CB = window.CB;

  const RAY = `
vec2 v6_screen(){
  vec2 q=rot(u_roll)*((gl_FragCoord.xy-.5*u_res)/u_res.y);
  if(u_cam.x<0.) q.x=-q.x;
  return q;
}
mat3 v6_look(vec3 ro, vec3 ta){
  vec3 ww=normalize(ta-ro);
  vec3 uu=normalize(cross(abs(ww.y)>.98?vec3(0,0,1):vec3(0,1,0),ww));
  return mat3(uu, cross(ww,uu), ww);
}
float v6_box(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float v6_rbox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }`;

  Object.assign(CB.ENGINES, {
    street3d: {
      name: '3B Sokak & Cadde (göz hizası)',
      params: ['Cadde genişliği', 'Bina yüksekliği', 'Dükkân & tabela ışığı', 'Gece', 'Islak zemin', 'Park etmiş araçlar', 'Pus', 'Kamera yüksekliği'],
      glsl: RAY + `
const float S3_L=9.;     // bina cephesi genişliği (cadde boyunca)
const float S3_SW=3.2;   // kaldırım genişliği
float s3_W(){ return mix(3.,7.5,u_p[0]); }
float s3_night(){ return u_p[3]; }
vec4 s3_cell(vec2 cid){ // x: geri çekilme, y: yükseklik, z: ara sokak, w: tente
  float h1=hash12(cid+SEED2), h2=hash12(cid*1.37+SEED2+4.1), h3=hash12(cid*2.11+SEED2+8.7), h4=hash12(cid*.71+SEED2+2.3);
  float setb=h1<.7 ? 0. : (h1-.7)*4.;
  float hg=mix(7.,26.,pow(h2,1.6))*mix(.45,1.6,u_p[1]);
  float gap=h3>.88 ? 2.2 : .04;
  return vec4(setb, hg, gap, step(.35,h4));
}
// m: 0 asfalt, 1 kaldırım, 2 bina, 3 tente, 4 araç, 5 direk
float s3_map(vec3 p, out float m, out vec2 cid, out float bnd){
  float W=s3_W();
  float side=p.x<0.?-1.:1.;
  float ax=abs(p.x);
  float id=floor(p.z/S3_L);
  float qz=p.z-(id+.5)*S3_L;
  cid=vec2(id, side);
  vec4 c=s3_cell(cid);
  float fx=W+S3_SW+c.x;
  float d=p.y; m=0.;
  float sw=max(W-ax, p.y-.16);
  if(sw<d){ d=sw; m=1.; }
  float bd=v6_box(vec3(ax-(fx+7.), p.y-c.y*.5, qz), vec3(7., c.y*.5, S3_L*.5-c.z));
  if(bd<d){ d=bd; m=2.; }
  if(c.w>.5){
    float aw=v6_box(vec3(ax-(fx-.75), p.y-3.25+(ax-fx)*.18, qz), vec3(.75,.04,S3_L*.5-c.z-.6));
    if(aw<d){ d=aw; m=3.; }
  }
  float hc=hash12(cid+19.3);
  if(hc<u_p[5]){
    float cz=qz-(hc-.5)*3.;
    vec3 cp=vec3(ax-(W-1.15), p.y, cz);
    float body=v6_rbox(cp-vec3(0.,.6,0.), vec3(.86,.3,2.15), .08);
    float cab=v6_rbox(cp-vec3(0.,1.1,-.2), vec3(.74,.24,1.05), .12);
    vec3 wq=vec3(abs(cp.x)-.72, cp.y-.33, abs(cp.z)-1.4);
    float wh=max(length(wq.yz)-.33, abs(wq.x)-.12);
    float car=min(min(body,cab),wh);
    if(car<d){ d=car; m=4.; }
  }
  float lz=qz+S3_L*.5-1.2;
  float pole=length(vec2(ax-(W+.35), lz))-.07;
  pole=max(pole, p.y-5.4);
  if(pole<d){ d=pole; m=5.; }
  bnd=S3_L*.5-abs(qz)+.05;
  return d;
}
float s3_d(vec3 p){ float m,b; vec2 c; return s3_map(p,m,c,b); }
vec3 s3_L(){ float a=hash11(u_seed*.37)*2.-1.; return normalize(vec3(a*.9, mix(.35,.75,hash11(u_seed*.91)), .45)); }
float s3_march(vec3 ro, vec3 rd, float tmax, int n, out float m, out vec2 cid){
  float t=.02; m=-1.; cid=vec2(0.);
  for(int i=0;i<110;i++){
    if(i>=n) break;
    float b; vec3 p=ro+rd*t;
    float d=s3_map(p,m,cid,b);
    if(d<.001*t+.002) return t;
    t+=min(d,b)*.92;
    if(t>tmax) break;
  }
  m=-1.; return -1.;
}
vec3 s3_sky(vec3 rd){
  float n=s3_night();
  float y=max(rd.y,0.);
  vec3 day=mix(mix(u_c[2],u_c[1],.35)*1.05, mix(u_c[1],u_c[0],.4), pow(y,.6));
  vec3 nit=mix(mix(u_c[1],u_c[3],.25)*.35, u_c[0]*.25, pow(y,.4));
  vec3 s=mix(day,nit,n);
  float sd=max(dot(rd,s3_L()),0.);
  s+=mix(vec3(1.,.9,.75),u_c[2],.4)*(pow(sd,10.)*.25+pow(sd,200.)*1.5)*(1.-n);
  float cl=smoothstep(.0,.6,fbm4(rd.xz/max(rd.y,.05)*.35+SEED2))*smoothstep(0.,.25,rd.y);
  s=mix(s, mix(u_c[2],vec3(lum(u_c[2])),.3)*mix(1.,.25,n), cl*.45);
  return s;
}
vec3 s3_norm(vec3 p){ vec2 e=vec2(.003,0.); return normalize(vec3(s3_d(p+e.xyy)-s3_d(p-e.xyy), s3_d(p+e.yxy)-s3_d(p-e.yxy), s3_d(p+e.yyx)-s3_d(p-e.yyx))); }
vec3 s3_signc(vec2 k){
  float h=hash12(k);
  return h<.33 ? u_c[3] : h<.6 ? mix(u_c[2],vec3(1.,.8,.5),.4) : h<.8 ? mix(u_c[3],vec3(.2,.9,1.),.5) : mix(u_c[3],vec3(1.,.25,.5),.5);
}
float s3_tb=0.; // yansımada ışının önceki yolu: desen bant sınırlaması toplam mesafeyi kullanır
// e: yayılan ışık (yansımada da görünsün diye ayrı tutulur)
vec3 s3_shade(vec3 ro, vec3 rd, float t, float m, vec2 cid, bool cheap){
  vec3 p=ro+rd*t;
  float n6=s3_night();
  float W=s3_W();
  vec3 L=s3_L();
  vec3 n=s3_norm(p);
  vec4 c=s3_cell(cid);
  float ax=abs(p.x);
  float fx=W+S3_SW+c.x;
  float qz=p.z-(floor(p.z/S3_L)+.5)*S3_L;
  vec3 sun=mix(vec3(1.,.93,.82),u_c[2],.35)*2.2*(1.-n6*.92);
  vec3 amb=mix(mix(u_c[1],u_c[2],.5)*.55, u_c[0]*.4+u_c[3]*.05, n6);
  vec3 alb=vec3(.3); vec3 e=vec3(0.);
  float rough=1.;
  // piksel ayak izi (metre): desenler bir pikselden küçülünce ortalamasına söner (moiré önleme)
  float pix=(t+s3_tb)*PX*1.6/max(abs(u_cam.x),.01)/max(sqrt(abs(dot(n,-rd))),.4);
  float bl=pix*1.5;
  if(m<.5){
    alb=vec3(.07)+u_c[0]*.15; alb*=.8+.4*vnoise(p.xz*3.);
    float fl=sat(.14/bl-.3);
    float dash=smoothstep(.07+bl,.07-bl*.2,abs(p.x))*mix(.55,step(.45,fract(p.z/6.)),sat(6./bl/4.))*fl;
    float edge=smoothstep(.06+bl,.06-bl*.2,abs(ax-(W-.35)))*fl;
    float xs=sat(1.1/bl/3.-.5);
    float xw=step(mod(floor(p.z/S3_L),6.),.5)*step(abs(qz+2.),2.)*step(ax,W-.5)*mix(.5,step(.5,fract(p.x*.9)),xs);
    alb=mix(alb, vec3(.75,.72,.65), max(max(dash,edge),xw)*.8);
  } else if(m<1.5){
    alb=mix(vec3(.42,.4,.38), mix(u_c[1],u_c[2],.5), .25);
    vec2 tl=fract(p.xz*1.6);
    float tf=sat(.6/bl/3.-.5);
    alb*=mix(.97,.8+.2*step(.06,tl.x)*step(.06,tl.y),tf);
    if(n.y<.5) alb*=.75;
  } else if(m<2.5){
    float hc=hash12(cid+11.);
    vec3 wall=mix(mix(u_c[1],vec3(lum(u_c[1])),.45), mix(u_c[2],vec3(.9,.85,.78),.5), hc*.8);
    wall=mix(wall, vec3(.55,.3,.22), step(.72,hash12(cid+2.9))*.6);
    alb=wall*(.75+.25*mix(.5,vnoise(p.yz*vec2(4.,2.)+hc*9.),sat(.25/bl-.5)));
    bool facade=abs(n.x)>.5;
    if(facade){
      float fl=floor(p.y/3.2);
      float wy=fract(p.y/3.2);
      float wz=fract((qz+S3_L*.5)/mix(1.8,2.6,hc));
      if(fl<.5){
        // dükkân vitrini ve tabela bandı
        float glass=step(.12,p.y)*step(p.y,2.55)*step(.12,fract((qz+S3_L*.5)/(S3_L*.5)))*step(fract((qz+S3_L*.5)/(S3_L*.5)),.9);
        float sign=step(2.68,p.y)*step(p.y,3.05)*step(abs(qz),S3_L*.5-c.z-.9);
        vec3 sc=s3_signc(cid+floor((qz+S3_L*.5)/(S3_L*.5)));
        float inside=.55+.45*smoothstep(.3,.7,vnoise(vec2(qz*.9,p.y*.6)+cid*5.))*(.75+.25*step(.5,fract(p.y*1.4)));
        alb=mix(alb, vec3(.02), glass*.85);
        rough=mix(1.,.15,glass);
        e+=mix(vec3(1.,.82,.6),sc,.35)*glass*inside*u_p[2]*mix(.35,2.2,n6);
        e+=sc*sign*u_p[2]*mix(.6,3.,n6)*(.85+.15*sin(u_time*3.+cid.x));
        alb=mix(alb, sc*.5, sign*.6);
      } else {
        float win=step(.25,wy)*step(wy,.82)*step(.18,wz)*step(wz,.82);
        float lit=step(1.-mix(.05,.55,n6), hash12(vec2(floor((qz+S3_L*.5)/2.2), fl)+cid*3.7));
        float wf=sat((2./bl-2.)/2.); // pencere hücresi ~3 pikselden küçükse ortalama
        win=mix(.37, win, wf); lit=mix(mix(.05,.55,n6), lit, wf);
        alb=mix(alb, vec3(.03), win*.85);
        rough=mix(1.,.2,win);
        e+=mix(vec3(1.,.72,.45),u_c[2],.3)*win*lit*mix(0.,1.4,n6)*(.5+.5*hash12(vec2(fl,wz)+cid));
        float ledge=mix(.0125,step(.95,wy)*.25,wf); alb*=1.-ledge;
      }
    }
  } else if(m<3.5){
    vec3 ac=s3_signc(cid+7.);
    alb=mix(ac,vec3(lum(ac)),.2)*.8*(.85+.15*step(.5,fract(qz*1.5)));
    e+=ac*u_p[2]*n6*.25*step(n.y,-.3);
  } else if(m<4.5){
    float hc=hash12(cid+31.);
    alb=mix(mix(u_c[3],u_c[1],hc), vec3(.08), step(.6,hash12(cid+4.)))*.7;
    rough=.25;
    float glassc=step(1.,p.y)*step(p.y,1.42);
    alb=mix(alb, vec3(.02), glassc);
    e+=vec3(1.,.15,.1)*n6*1.5*step(.9,abs(n.z))*step(.45,p.y)*step(p.y,.8);
  } else {
    alb=vec3(.06);
  }
  float sh=1.;
  if(!cheap && n6<.95){
    float ms; vec2 cs;
    if(s3_march(p+n*.02, L, 60., 36, ms, cs)>0.) sh=0.;
  }
  float dif=max(dot(n,L),0.);
  vec3 col=alb*(sun*dif*sh+amb*(.45+.55*max(n.y,0.)));
  // gece: sokak lambası havuzları ve vitrin taşması
  if(m<1.5 && n.y>.5){ // y eşiği yerine malzeme: yüzey toleransı kontur bantları yapmasın
    float lz=fract((p.z+1.2)/S3_L+.5)-.5;
    float pool=exp(-(lz*lz*S3_L*S3_L*.07+pow(ax-(W+.35),2.)*.18));
    col+=alb*mix(vec3(1.,.72,.42),u_c[3],.25)*pool*n6*4.;
    col+=alb*s3_signc(cid+1.)*exp(-max(fx-ax,0.)*.9)*u_p[2]*n6*1.4*step(W,ax);
  }
  if(!cheap){
    vec3 r=reflect(rd,n);
    float fr=pow(1.-max(dot(-rd,n),0.),5.)*.6+.04;
    col=mix(col, s3_sky(r)*.8, fr*(1.-rough)*.8);
  }
  col+=e;
  return col;
}
vec3 s3_fog(vec3 col, vec3 rd, float t){
  float n6=s3_night();
  vec3 fc=mix(mix(u_c[2],u_c[1],.45), mix(u_c[1],u_c[3],.2)*.35, n6);
  return mix(col, fc, 1.-exp(-t*mix(.004,.05,u_p[6]*u_p[6])));
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v6_screen();
  float zm=max(abs(u_cam.x),.01);
  float W=s3_W();
  float hgt=mix(1.1,6.,u_p[7]*u_p[7])+max(-u_cam.z,0.)*110.;
  hgt=max(hgt-max(u_cam.z,0.)*5.,.25);
  float yaw=u_cam.y*2.4;
  vec3 ro=vec3(u_cam.y*W*1.2+(hash11(u_seed*.3)-.5)*W*.6, hgt, hash11(u_seed*.71)*900.);
  float pitch=mix(.04,-.55,sat((hgt-2.)/30.))+u_cam.z*1.2;
  mat3 cam=v6_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.55*zm));
  float m; vec2 cid;
  float t=s3_march(ro,rd,260.,110,m,cid);
  vec3 col;
  if(t<0.) col=s3_sky(rd);
  else {
    col=s3_shade(ro,rd,t,m,cid,false);
    vec3 p=ro+rd*t;
    float wet=u_p[4]*(m<1.5 ? (m<.5?1.:.6) : 0.);
    if(wet>.05){
      // dalgacık normali piksel ayak izinden küçükse sönümlenir (kontur moiré'si önlenir)
      float pw=t*PX*1.6/max(abs(u_cam.x),.01)/max(-rd.y,.18);
      float ra=.04*sat(1.-pw*9./2.);
      vec3 nn=normalize(vec3(gnoise(p.xz*9.)*ra,1.,gnoise(p.xz*9.+3.)*ra));
      s3_tb=t;
      vec3 rr=reflect(rd,nn);
      float m2; vec2 c2;
      float t2=s3_march(p+vec3(0,.02,0),rr,120.,60,m2,c2);
      vec3 rc=t2<0. ? s3_sky(rr) : s3_fog(s3_shade(p,rr,t2,m2,c2,true),rr,t2);
      s3_tb=0.;
      float fr=.25+.75*pow(1.-max(-rd.y,0.),5.);
      col=mix(col, rc, fr*wet*.85);
    }
    col=s3_fog(col,rd,t);
  }
  if(t<0.) col=s3_fog(col,rd,260.)*.5+col*.5;
  // tel kablolar ve lamba parıltıları
  float n6=s3_night();
  float tmax=t<0.?1e4:t;
  for(int i=0;i<10;i++){
    float zc=(floor(ro.z/S3_L)+float(i)+1.)*S3_L-S3_L*.5+1.2;
    float tz=(zc-ro.z)/rd.z;
    if(rd.z>.001 && tz>0. && tz<tmax){
      vec3 hp=ro+rd*tz;
      float span=W+.35;
      float cy=5.6-1.1*(1.-pow(hp.x/span,2.));
      float pw=tz*PX*1.2/max(abs(u_cam.x),.01);
      float lw=.012+pw;
      float onc=step(abs(hp.x),span)*smoothstep(lw,lw*.4,abs(hp.y-cy))*min(1.,.02/lw*1.5);
      col=mix(col, vec3(.02), onc*.85*step(.55,hash11(float(i)+floor(ro.z/S3_L)+u_seed)));
    }
    for(int s=0;s<2;s++){
      vec3 lp=vec3((float(s)*2.-1.)*(W+.1), 5.3, zc);
      vec3 v=lp-ro; float tl=dot(v,rd);
      if(tl<0.||tl>tmax+2.) continue;
      float dd=length(v-rd*tl);
      col+=mix(vec3(1.,.78,.5),u_c[3],.25)*(exp(-dd*dd*40.)*1.5+exp(-dd*2.5)*.08)*n6/(1.+tl*.02);
    }
  }
  return col;
}`,
    },

    countryside: {
      name: '3B Kırsal Tepeler & Tarlalar (gerçek kamera)',
      params: ['Tepe yüksekliği', 'Tepe dalgalılığı', 'Tarla deseni (yeşil ↔ altın)', 'Ağaç sıraları', 'Yol / patika', 'Çiftlik evleri', 'Güneş yüksekliği', 'Bulut'],
      glsl: RAY + `
float cs_h0(vec2 x){ // yumuşak tepeler + uzak dağlar
  float amp=mix(8.,45.,u_p[0]);
  float f=mix(.0018,.0045,u_p[1]);
  float h=fbm4(x*f+SEED2)*amp*1.6+fbm4(x*f*2.3+SEED2.yx)*amp*.18;
  float far=smoothstep(900.,2600.,x.y);
  h+=far*(ridged(x*.0012+SEED2,4)*mix(140.,320.,hash11(u_seed*.5)));
  return h;
}
vec2 cs_road(float z){ return vec2(sin(z*.006+u_seed)*60.+sin(z*.017+2.*u_seed)*14., 0.); }
// tarla hücresi: döndürülmüş ızgara (bölgeye göre açı)
vec3 cs_field(vec2 x){
  float ang=(hash12(floor(x/380.)+SEED2)-.5)*1.2;
  vec2 r=rot(ang)*x;
  vec2 sz=vec2(mix(28.,70.,hash12(floor(r/220.)+3.)), mix(40.,110.,hash12(floor(r/260.)+7.)));
  vec2 id=floor(r/sz);
  vec2 f=fract(r/sz);
  return vec3(id.x*7.+id.y*13.+floor(r.x/220.), min(min(f.x,1.-f.x)*sz.x, min(f.y,1.-f.y)*sz.y), hash12(id+SEED2));
}
float cs_tree(vec2 x){ // çit ağaçları: sınır boyunca tümsekler
  if(u_p[3]<.05) return 0.;
  vec3 fd=cs_field(x);
  float near=sqrt(sat(1.-fd.y/2.4));
  float on=step(.35,hash11(fd.x*.37+3.));
  float crown=smoothstep(.3,.65,vnoise(x*.42))*(.75+.25*vnoise(x*1.6));
  return near*on*crown*mix(6.,12.,hash11(fd.x))*u_p[3];
}
float cs_h(vec2 x){
  float h=cs_h0(x);
  float rd=abs(x.x-cs_road(x.y).x);
  h-=smoothstep(8.,2.,rd)*.4*u_p[4];
  return h+cs_tree(x);
}
float cs_march(vec3 ro, vec3 rd, float tmax){
  float t=1., tp=1.;
  for(int i=0;i<110;i++){
    vec3 p=ro+rd*t;
    float d=p.y-cs_h(p.xz);
    if(d<0.){
      // ikili arama ile yüzeyi incelt: basamak / şerit izlerini önler
      float a=tp, b=t;
      for(int k=0;k<7;k++){ float m=.5*(a+b); vec3 q=ro+rd*m; if(q.y-cs_h(q.xz)<0.) b=m; else a=m; }
      return .5*(a+b);
    }
    if(d<.0015*t) return t;
    tp=t;
    t+=max(d*.4, .006*t);
    if(t>tmax) break;
  }
  return -1.;
}
vec3 cs_L(){ float a=(hash11(u_seed*.21)-.5)*2.; return normalize(vec3(sin(a), mix(.06,.7,u_p[6]), cos(a))); }
vec3 cs_sky(vec3 rd){
  vec3 L=cs_L();
  float y=max(rd.y,0.);
  vec3 low=mix(u_c[2], mix(u_c[3],u_c[2],.6), .35);
  vec3 col=mix(low, mix(u_c[1],u_c[0],.2), pow(y,.55));
  float sd=max(dot(rd,L),0.);
  col+=mix(vec3(1.,.95,.85),u_c[2],.4)*(pow(sd,6.)*.25+pow(sd,300.)*2.);
  vec2 cp=rd.xz/max(rd.y,.04)*.6+SEED2+vec2(u_time*.003,0.);
  float cl=fbm(cp)+.3*fbm(cp*3.);
  float cov=mix(.38,-.1,u_p[7]);
  float c=smoothstep(cov,cov+.2,cl)*smoothstep(.0,.12,rd.y);
  float lit=sat(.55+(fbm(cp+L.xz*.08)-cl)*5.);
  vec3 cc=mix(mix(u_c[1],vec3(lum(u_c[1])),.3)*.7, mix(vec3(1.),u_c[2],.3)*1.05, lit);
  return mix(col, cc, c*.9);
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v6_screen();
  float zm=max(abs(u_cam.x),.01);
  float z0=hash11(u_seed*.83)*4000.;
  vec2 rp=cs_road(z0);
  vec3 ro=vec3(rp.x+u_cam.y*40.+6., 0., z0);
  float gh=cs_h0(ro.xz);
  float hgt=mix(2.,30.,u_p[0]*.3)+max(-u_cam.z,0.)*900.;
  hgt=max(hgt-max(u_cam.z,0.)*20.,1.6);
  float yaw=u_cam.y*2.+(hash11(u_seed*.4)-.5)*.6;
  // önündeki tepeye gömülmesin: ileriye bakan noktaları örnekleyip bakış noktasını yükselt
  vec2 fw=vec2(sin(yaw),cos(yaw));
  float ah=gh;
  for(int i=1;i<5;i++) ah=max(ah, cs_h0(ro.xz+fw*float(i)*45.)-float(i)*6.);
  ro.y=max(gh,ah)+hgt;
  float pitch=mix(-.05,-.6,sat(hgt/250.))+u_cam.z*1.2;
  mat3 cam=v6_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.6*zm));
  vec3 L=cs_L();
  vec3 sunc=mix(vec3(1.,.93,.8),u_c[2],.4)*2.;
  float t=cs_march(ro,rd,6000.);
  vec3 col;
  vec3 haze=mix(mix(u_c[2],u_c[1],.35), cs_sky(normalize(vec3(rd.x,.03,rd.z))), .5);
  if(t<0.) col=cs_sky(rd);
  else {
    vec3 p=ro+rd*t;
    float e=max(.6,t*.006);
    vec3 n=normalize(vec3(cs_h(p.xz-vec2(e,0.))-cs_h(p.xz+vec2(e,0.)), 2.*e, cs_h(p.xz-vec2(0.,e))-cs_h(p.xz+vec2(0.,e))));
    float pix=t*PX*2./max(abs(u_cam.x),.01); // piksel ayak izi (metre)
    vec3 fd=cs_field(p.xz);
    float h=fd.z;
    float gold=u_p[2];
    vec3 green=mix(mix(u_c[1],vec3(.2,.36,.12),.6), vec3(.32,.45,.16), h);
    vec3 wheat=mix(mix(u_c[2],vec3(.8,.62,.28),.55), vec3(.62,.45,.22), h);
    vec3 alb=mix(green, wheat, step(1.-gold*.85, hash11(fd.x*.13+1.)));
    alb=mix(alb, vec3(.33,.24,.15), step(.92,hash11(fd.x*.29))*.8);
    float rows=.5+.5*sin(dot(p.xz, rot(h*3.)*vec2(.8,.6))*5.6);
    alb*=1.-.1*rows*sat(1.-pix/.6);
    alb*=.85+.3*vnoise(p.xz*.08);
    float tr=cs_tree(p.xz);
    float tw=smoothstep(.3,1.5,tr);
    float above=sat((ro.y-p.y)/120.); // tepeden bakışta çit çizgileri daha yumuşak
    vec3 leaf=mix(u_c[0],vec3(.08,.16,.06),.6)*(.6+.8*vnoise(p.xz*1.3+p.y*.7));
    alb=mix(alb, mix(leaf, alb*.55, above*.5), tw);
    // yol
    float rdd=abs(p.x-cs_road(p.z).x);
    alb=mix(alb, mix(vec3(.6,.55,.45),u_c[2],.25), smoothstep(3.5,2.5,rdd)*u_p[4]);
    // çiftlik evleri: düz yerlerde küçük beyaz bloklar + kırmızı çatı
    vec2 hc=floor(p.xz/160.);
    vec2 hp=p.xz-(hc+.5)*160.-(hash22(hc+SEED2)-.5)*90.;
    float isH=step(hash12(hc+9.),u_p[5]*.6);
    float bld=isH*step(max(abs(hp.x)-9.,abs(hp.y)-5.),0.);
    alb=mix(alb, mix(vec3(.85,.8,.75),vec3(.62,.2,.14),step(.5,n.y*fract(hp.x*.1+.5))), bld);
    float dif=max(dot(n,L),0.);
    float sh=1.;
    if(t<1500.){
      float ts=2.; vec3 sp=p+n*.5;
      for(int i=0;i<20;i++){ vec3 pp=sp+L*ts; float dd=pp.y-cs_h0(pp.xz); sh=min(sh, sat(dd/(ts*.25)+.6)); ts+=max(dd*.5,4.+ts*.1); if(ts>1200.) break; }
      sh=mix(sh, 1., sat((ro.y-p.y)/300.)*.5);
    }
    vec3 amb=mix(u_c[1],u_c[2],.5)*.35*(.6+.4*n.y);
    col=alb*(sunc*dif*sh+amb);
    col+=alb*sunc*.15*pow(1.-max(dot(n,-rd),0.),3.)*(1.-sh*.5);
  }
  float fo=1.-exp(-(t<0.?6000.:t)*mix(.00025,.0012,1.-u_p[6]*.5));
  if(t>0.) col=mix(col, haze, fo);
  return col;
}`,
    },

    homeint: {
      name: '3B Gündelik İç Mekân (oda & pencere)',
      params: ['Pencere boyu', 'Gün ↔ gece', 'Mobilya yoğunluğu', 'Lamba ışığı', 'Güneş huzmesi', 'Oda genişliği', 'Perde', 'Kamera yüksekliği'],
      glsl: RAY + `
const float H6_H=2.8;  // tavan
const float H6_D=7.5;  // derinlik (z: 0 → H6_D arka duvar)
float h6_W(){ return mix(2.2,4.2,u_p[5]); }
vec4 h6_win(){ // pencere: x merkez, yarı genişlik, alt y, üst y (arka duvarda)
  float hw=mix(.5,1.6,u_p[0]);
  float cx=(hash11(u_seed*.43)-.5)*(h6_W()-hw-.3)*1.4;
  return vec4(cx, hw, .85, min(.85+mix(1.,1.8,u_p[0]), H6_H-.25));
}
vec3 h6_lamp(){ float W=h6_W(); return vec3((hash11(u_seed*.77)<.5?-1.:1.)*(W-.6), 1.45, H6_D-1.8); }
// m: 0 zemin, 1 duvar, 2 tavan, 3 masa, 4 kanepe, 5 raf, 6 lamba, 7 halı, 8 perde
float h6_map(vec3 p, out float m){
  float W=h6_W();
  vec4 w=h6_win();
  float beyond=p.z-(H6_D+.25); // arka duvarın ötesinde oda yüzeyi yok, ışın dışarı kaçar
  float d=max(p.y, beyond); m=0.;
  float bw=abs(p.z-(H6_D+.125))-.125;
  // pencere boşluğu arka duvarı deler
  float hole=max(abs(p.x-w.x)-w.y, max(w.z-p.y, p.y-w.w));
  bw=max(bw, -hole);
  float wl=min(max(W-abs(p.x), beyond), bw);
  if(wl<d){ d=wl; m=1.; }
  float ce=max(H6_H-p.y, beyond); if(ce<d){ d=ce; m=2.; }
  float fd=u_p[2];
  // perdeler
  if(u_p[6]>.1){
    for(int s=0;s<2;s++){
      float sx=w.x+(float(s)*2.-1.)*(w.y+.15);
      float cu=v6_box(vec3(p.x-sx, p.y-(w.w+.15)*.5-.05, p.z-(H6_D-.12)), vec3(mix(.1,.35,u_p[6]), (w.w+.15)*.5, .03+.03*sin(p.x*40.)));
      if(cu<d){ d=cu; m=8.; }
    }
  }
  // halı
  float rug=max(v6_box(vec3(p.x, p.y, p.z-H6_D*.5), vec3(W*.55, .012, 1.3)), -p.y);
  if(rug<d){ d=rug; m=7.; }
  // masa
  if(fd>.15){
    vec3 tp=vec3(p.x-(hash11(u_seed*.55)-.5)*W*.6, p.y, p.z-H6_D*.48);
    float top=v6_box(tp-vec3(0.,.74,0.), vec3(.7,.025,.45));
    vec3 lq=vec3(abs(tp.x)-.62, tp.y-.37, abs(tp.z)-.38);
    float legs=v6_box(lq, vec3(.025,.37,.025));
    float tb=min(top,legs); if(tb<d){ d=tb; m=3.; }
  }
  // kanepe / yatak sol duvarda
  if(fd>.3){
    vec3 sp=vec3(p.x+W-.5, p.y, p.z-H6_D*.62);
    float seat=v6_rbox(sp-vec3(0.,.25,0.), vec3(.45,.22,1.), .08);
    float back=v6_rbox(sp-vec3(-.38,.55,0.), vec3(.1,.5,1.), .07);
    float arm=v6_rbox(vec3(sp.x,sp.y-.4,abs(sp.z)-.95), vec3(.45,.17,.08), .06);
    float so=min(min(seat,back),arm); if(so<d){ d=so; m=4.; }
  }
  // raf sağ duvarda
  if(fd>.5){
    vec3 rp=vec3(p.x-(W-.22), p.y-1., p.z-H6_D*.35);
    float sh=v6_box(rp, vec3(.2,1.,.7));
    float cut=v6_box(vec3(rp.x+.04, mod(rp.y+1.,.5)-.27, rp.z), vec3(.2,.2,.65));
    sh=max(sh,-cut); if(sh<d){ d=sh; m=5.; }
  }
  // ayaklı lamba
  vec3 lp=h6_lamp();
  vec3 q=p-vec3(lp.x,0.,lp.z);
  float pole=max(length(q.xz)-.025, p.y-lp.y);
  float shade=max(length(q.xz)-mix(.24,.14,(p.y-lp.y+.15)/.3), abs(p.y-lp.y)-.15);
  float base=v6_box(q-vec3(0.,.02,0.), vec3(.16,.02,.16));
  float la=min(min(pole,shade),base); if(la<d){ d=la; m=6.; }
  return d;
}
float h6_d(vec3 p){ float m; return h6_map(p,m); }
vec3 h6_sun(){ float a=(hash11(u_seed*.19)-.5)*1.3; return normalize(vec3(a, mix(.25,.7,hash11(u_seed*.61)), 1.)); }
float h6_march(vec3 ro, vec3 rd, out float m){
  float t=.01; m=-1.;
  for(int i=0;i<96;i++){
    float d=h6_map(ro+rd*t,m);
    if(d<.0015) return t;
    t+=d;
    if(t>30.) break;
  }
  m=-1.; return -1.;
}
// pencereden geçen güneş: p noktasından güneşe giden ışın arka duvar düzleminde pencerenin içinden geçiyor mu
float h6_sunlit(vec3 p){
  vec3 L=h6_sun(); vec4 w=h6_win();
  float tz=(H6_D-p.z)/L.z;
  if(tz<0.) return 0.;
  vec2 hp=p.xy+L.xy*tz;
  float inx=smoothstep(.04,0.,abs(hp.x-w.x)-w.y);
  float iny=smoothstep(.04,0.,max(w.z-hp.y, hp.y-w.w));
  // pencere kayıtları (çerçeve haçı)
  float mull=1.-.85*smoothstep(.035,.0,abs(hp.x-w.x))*step(.5,u_p[0])-.85*smoothstep(.035,0.,abs(hp.y-(w.z+w.w)*.5));
  // perde gölgesi
  float cur=1.-smoothstep(w.y-mix(.0,.6,u_p[6]), w.y, abs(hp.x-w.x))*.7*step(.1,u_p[6]);
  return inx*iny*mull*cur;
}
vec3 h6_outside(vec3 rd){
  float y=rd.y;
  vec3 sky=mix(mix(u_c[2],vec3(1.),.35), mix(u_c[1],u_c[2],.5), sat(y*2.));
  float hz=-.02;
  vec3 ground=mix(mix(u_c[1],vec3(.35,.45,.3),.4), sky, .35);
  vec3 c=mix(ground, sky, smoothstep(hz-.005,hz+.005,y));
  // karşı binalar ve ağaç hattı, pusla yumuşatılmış
  float bx=floor(rd.x*7.+u_seed*3.);
  float bh=hz+mix(.05,.28,hash11(bx))*step(.3,hash11(bx+4.));
  float tree=hz+.05+.05*fbm4(vec2(rd.x*14.,2.)+SEED2);
  float far=max(step(y,bh), step(y,tree));
  vec3 bc=mix(mix(u_c[1],u_c[2],.4), sky, .45);
  c=mix(c, bc*(.9+.1*step(.5,fract(y*40.))), far*.8);
  vec3 nite=mix(u_c[0]*.4, mix(u_c[1],u_c[3],.3)*.25, sat(1.-y*3.));
  nite+=u_c[3]*step(.97,hash12(floor(rd.xy*vec2(60.,90.))))*step(y,hz+.1)*.8;
  return mix(c*1.6, nite, u_p[1]);
}
vec3 scene(vec2 uv, vec2 st){
  vec2 q=v6_screen();
  float zm=max(abs(u_cam.x),.01);
  float W=h6_W();
  float hgt=mix(1.0,1.75,u_p[7])+max(-u_cam.z,0.)*5.;
  hgt=clamp(hgt-max(u_cam.z,0.)*3.,.25,H6_H-.15);
  float yaw=u_cam.y*1.6+(hash11(u_seed*.29)-.5)*.35;
  vec3 ro=vec3(clamp(u_cam.y*W*.8,-W+.4,W-.4)-sin(yaw)*.4, hgt, .45);
  float pitch=-.08-sat((hgt-1.8)/1.)*.5+u_cam.z*1.6;
  mat3 cam=v6_look(ro, ro+vec3(sin(yaw),pitch,cos(yaw)));
  vec3 rd=normalize(cam*vec3(q,1.15*zm));
  float m;
  float t=h6_march(ro,rd,m);
  float night=u_p[1];
  vec3 sunc=mix(vec3(1.,.9,.75),u_c[2],.35)*3.2*(1.-night);
  vec3 lampc=mix(vec3(1.,.66,.36),u_c[3],.2);
  vec3 lp=h6_lamp();
  vec3 col;
  if(t<0.){ col=h6_outside(rd); }
  else {
    vec3 p=ro+rd*t;
    vec2 e=vec2(.002,0.);
    vec3 n=normalize(vec3(h6_d(p+e.xyy)-h6_d(p-e.xyy), h6_d(p+e.yxy)-h6_d(p-e.yxy), h6_d(p+e.yyx)-h6_d(p-e.yyx)));
    vec3 alb;
    if(m<.5){ vec2 b=fract(p.xz*vec2(1.,4.)+vec2(0.,floor(p.x)*.37)); alb=mix(vec3(.45,.3,.18),u_c[1],.3)*(.8+.2*step(.03,b.y)*step(.02,b.x))*(.85+.3*vnoise(p.xz*vec2(2.,24.))); }
    else if(m<1.5){ alb=mix(mix(u_c[2],vec3(.92,.88,.82),.6), mix(u_c[1],vec3(lum(u_c[1])),.3), .25)*(.9+.1*vnoise(p.xy*3.+p.z)); alb*=1.-.35*step(p.y,.1); }
    else if(m<2.5){ alb=vec3(.85,.83,.8); }
    else if(m<3.5){ alb=mix(vec3(.35,.22,.13),u_c[0],.3); }
    else if(m<4.5){ alb=mix(u_c[3],u_c[1],.35)*.65; }
    else if(m<5.5){ alb=mix(vec3(.4,.3,.22),u_c[1],.3); float bk=step(.5,hash12(floor(p.zy*vec2(14.,2.)))); alb=mix(alb, mix(u_c[3],u_c[2],hash12(floor(p.zy*vec2(14.,2.))+3.))*.6, bk*step(abs(n.x),.5)); }
    else if(m<6.5){ alb=vec3(.9,.85,.75); }
    else if(m<7.5){ alb=mix(u_c[3],u_c[1],.5)*.55*(.85+.15*step(.5,fract(p.x*3.)*fract(p.z*3.)+.3)); }
    else { alb=mix(u_c[2],vec3(.95,.92,.85),.5); }
    // güneş lekesi (gölge için tek ışın)
    float sl=h6_sunlit(p+n*.01);
    if(sl>.0){ float mm; float ts=h6_march(p+n*.02, h6_sun(), mm); if(ts>0. && (p+h6_sun()*ts).z<H6_D-.25) sl=0.; }
    vec3 L=h6_sun();
    vec3 c=alb*sunc*sl*max(dot(n,L),0.);
    // pencereden gelen yumuşak gün ışığı (alan ışığı yaklaşımı)
    vec4 w=h6_win();
    vec3 wc=vec3(w.x,(w.z+w.w)*.5,H6_D);
    vec3 tw=wc-p; float dw=length(tw);
    float skyl=max(dot(n,tw/dw),0.)*(w.y*(w.w-w.z))/(1.+dw*dw*.35);
    c+=alb*mix(mix(u_c[2],vec3(1.),.4)*1.1, mix(u_c[1],u_c[0],.5)*.25, night)*skyl*.9;
    // lamba
    vec3 tl=lp-p; float dl=length(tl);
    float lo=u_p[3]*mix(.25,1.,night);
    c+=alb*lampc*max(dot(n,tl/dl),0.)*lo*2.2/(1.+dl*dl*.9);
    // ortam + basit AO
    float ao=sat(h6_d(p+n*.15)/.15)*.6+.4;
    c+=alb*mix(mix(u_c[1],u_c[2],.5)*.18, u_c[0]*.15+lampc*.03*lo, night)*ao;
    if(m>5.5&&m<6.5) c+=lampc*lo*1.6*smoothstep(lp.y-.2,lp.y,p.y);
    if(m>7.5) c+=alb*sunc*.12*(1.-night)*smoothstep(.3,0.,abs(p.x-w.x)-w.y);
    col=c;
  }
  // hacimsel huzme: görüş ışını boyunca güneş lekesi örnekleme
  if(u_p[4]>.03 && night<.9){
    float tm=t<0.?H6_D*1.4:t; float acc=0.;
    for(int i=0;i<20;i++){
      float s=(float(i)+hash12(gl_FragCoord.xy+u_time))/20.;
      vec3 sp=ro+rd*tm*s;
      acc+=h6_sunlit(sp)*(.6+.4*vnoise3(sp*3.+u_time*.05));
    }
    col+=sunc*acc/20.*tm*.05*u_p[4];
  }
  return col;
}`,
    },
  });
})();
