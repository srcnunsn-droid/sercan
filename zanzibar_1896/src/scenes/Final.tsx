// Yönetim değişikliği (290–345 sn) ve final (345–394 sn).
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {C, FONT_LABEL, FONT_TITLE, clamp, easeIO, easeOut, interp, prog, window} from '../theme';
import {Harbor} from '../components/Harbor';
import {TopDown, TD_PALACE} from '../components/TopDown';
import {Clock, CX, CY, R_DIAL} from '../components/Clock';
import {ThroneRoom} from '../components/Throne';
import {DateCard, Label, Title} from '../components/Base';
import {Chip} from './Ultimatum';
import {DialHarbor} from './Opening';
import {S, E, DURATION_S} from '../timeline';
import {CLIP_C} from '../clips';

const CONSUL_DE = {x: 900, y: 230};

export const Rule: React.FC<{t: number}> = ({t}) => {
  const inn = prog(t, 290.5, 291.2);
  // 1) Khalid: Alman konsolosluğu → daha sonra Alman gemisi
  const mapO = 1 - prog(t, S('s58') - 0.4, S('s58') + 0.4);
  const p1 = prog(t, S('s57') + 0.6, S('s57') + 2.2, easeIO);
  const p2 = prog(t, S('s57') + 3.0, E('s57') + 0.3, easeIO);
  // 2) taht odası: isim değişir (hasar korunur)
  const roomO = window(t, S('s58') - 0.3, E('s59') + 0.6, 0.5, 0.6);
  const swap = prog(t, S('s58') + 0.6, S('s58') + 1.6, easeIO);
  // 3) zaman çizgisi
  const tlO = prog(t, E('s59') + 0.2, E('s59') + 1.0);
  const tlP = prog(t, S('s60') + 0.2, S('s60') + 3.0, easeIO);
  const tlP2 = prog(t, S('s61') + 0.4, S('s61') + 3.0, easeIO);
  const X = (year: number) => interp(year, [1890, 1902, 1963], [220, 820, 1700], (x) => x);
  const pts = [
    {y: 1890, l: 'Himaye'}, {y: 1893, l: 'Hamad'}, {y: 1896, l: 'Savaş · Hamoud'}, {y: 1902, l: ''}, {y: 1963, l: 'Bağımsızlık'},
  ];
  const lineEnd = tlP2 > 0 ? X(1902) + (X(1963) - X(1902)) * tlP2 : X(1890) + (X(1902) - X(1890)) * tlP;
  return (
    <AbsoluteFill style={{opacity: inn, background: C.nightDeep}}>
      <AbsoluteFill style={{opacity: mapO}}>
        <TopDown t={t} damage={2} glasgowSink={0.7} compass={1} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <rect x={CONSUL_DE.x - 40} y={CONSUL_DE.y - 28} width={80} height={56} fill="#EDE3CF" stroke={C.ink} strokeWidth={3} />
          <path d={`M ${TD_PALACE.x} ${TD_PALACE.y + 30} Q ${(TD_PALACE.x + CONSUL_DE.x) / 2} ${CONSUL_DE.y - 60} ${CONSUL_DE.x + 40} ${CONSUL_DE.y}`} fill="none" stroke={C.ivory} strokeWidth={5} strokeDasharray="10 9" pathLength={1} style={{strokeDasharray: `${p1} 1`}} />
          <path d={`M ${CONSUL_DE.x - 40} ${CONSUL_DE.y + 10} Q 520 360 ${220 - 300 * p2} 520`} fill="none" stroke="#9AA3A6" strokeWidth={4} strokeDasharray="8 10" opacity={p2 > 0 ? 1 : 0} />
          {p2 > 0 && (
            <g transform={`translate(${interp(p2, [0, 1], [700, -80])} ${interp(p2, [0, 1], [470, 560])}) rotate(-170)`}>
              <path d="M -45 -10 C -45 -16, 30 -16, 45 0 C 30 16, -45 16, -45 10 Z" fill="#7E8789" stroke={C.ink} strokeWidth={2} />
            </g>
          )}
        </svg>
        <Label x={CONSUL_DE.x} y={CONSUL_DE.y - 70} text="Alman konsolosluğu" o={window(t, S('s57') + 1.2, E('s57') + 0.4, 0.4, 0.4)} size={30} align="center" tick="down" tickLen={20} />
        <Label x={520} y={640} text="Daha sonra: Alman gemisiyle ayrıldı" o={window(t, S('s57') + 3.2, E('s57') + 0.4, 0.4, 0.4)} size={28} align="center" />
        <DateCard x={1600} y={940} main="KHALID" top="SIĞINDI" o={window(t, S('s57') + 0.3, E('s57') + 0.3, 0.4, 0.4)} scale={0.7} />
      </AbsoluteFill>
      {/* taht: hasar korunur, isim değişir */}
      <AbsoluteFill style={{opacity: roomO}}>
        <div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) scale(${0.98 - 0.4 * tlO}) translateY(${-tlO * 300}px)`}}>
          <ThroneRoom name="KHALID BİN BARGHASH" nameNext="HAMOUD BİN MUHAMMED" swap={swap} damage={2} glow={swap} />
        </div>
        <Title x={960} y={960} text="Tahtta: Britanya'nın istediği isim" size={56} o={window(t, S('s59') + 0.3, E('s59') + 0.5, 0.5, 0.5)} />
      </AbsoluteFill>
      {/* zaman çizgisi: siyasi sonuç */}
      {tlO > 0 && (
        <AbsoluteFill style={{opacity: tlO * (1 - prog(t, 344.2, 344.8))}}>
          <AbsoluteFill style={{opacity: 0.16, filter: 'saturate(0.4)'}}>
            <Harbor t={t} cam={{x: 930, y: 540, z: 1}} damage={2} flag={0} sky="calm" glasgowSink={0.7} burnSmoke={0.3} burnStart={290} boats={1} />
          </AbsoluteFill>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <line x1={X(1890)} y1={560} x2={X(1963)} y2={560} stroke={C.brass} strokeWidth={2} opacity={0.4} />
            <line x1={X(1890)} y1={560} x2={Math.max(X(1890), lineEnd)} y2={560} stroke={C.sand} strokeWidth={8} strokeLinecap="round" />
            {tlP > 0.3 && <rect x={X(1896)} y={540} width={(X(1902) - X(1896)) * clamp((tlP - 0.3) / 0.7)} height={40} fill={C.deepSoft} opacity={0.8} />}
            {pts.map((p, i) => {
              const on = (p.y <= 1902 && tlP * 12 + 1890 >= p.y) || (p.y === 1963 && tlP2 > 0.95);
              return (
                <g key={i} opacity={on ? 1 : 0.25}>
                  <circle cx={X(p.y)} cy={560} r={12} fill={on ? C.ivory : C.night} stroke={C.sand} strokeWidth={3} />
                  <text x={X(p.y)} y={520} textAnchor="middle" fontFamily={FONT_TITLE} fontWeight={800} fontSize={40} fill={C.ivory}>{p.y}</text>
                  <text x={X(p.y)} y={620} textAnchor="middle" fontFamily={FONT_LABEL} fontWeight={600} fontSize={24} fill={C.sand}>{p.l}</text>
                </g>
              );
            })}
          </svg>
          <Label x={(X(1896) + X(1902)) / 2} y={720} width={520} text="Hamoud · 6 yıl" sub="Britanya'nın güçlü etkisi altında" o={prog(t, S('s60') + 1.6, S('s60') + 2.6)} size={28} align="center" accent={C.deepSoft} />
          <Label x={(X(1902) + X(1963)) / 2} y={720} text="Himaye düzeni sürdü" o={prog(t, S('s61') + 1.0, S('s61') + 2.0)} size={28} align="center" />
          <Chip x={960} y={880} text="BAZI KAYNAKLARA GÖRE" sub="mermilerin ve yağmanın bedeli Khalid'in destekçilerinden talep edildi" o={window(t, S('s62') + 0.3, E('s62') + 0.5, 0.4, 0.5)} color={C.brassLight} />
          <Chip x={960} y={880} text="BAŞKA ANLATILARA GÖRE" sub="egemen bir Zanzibar devletinin sonunun işareti" o={window(t, S('s63') + 0.3, E('s63') + 0.5, 0.4, 0.5)} color={C.brassLight} />
          <Title x={960} y={200} text="Yerel yöneticiler için az seçenek" size={56} o={window(t, S('s64') + 0.6, E('s64') + 0.4, 0.5, 0.5)} />
          <Chip x={640} y={880} text="SULTAN UNVANI" sub="yerinde kaldı" o={window(t, S('s65') + 0.2, E('s65') + 0.4, 0.4, 0.5)} />
          <Chip x={1280} y={880} text="SON SÖZ" sub="Britanya'daydı" o={window(t, S('s65') + 2.0, E('s65') + 0.4, 0.4, 0.5)} color="#7FB4B8" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const WAN_C = {a: S('s70') + 1.6, b: S('s70') + 1.6 + 2.4};

export const Final: React.FC<{t: number}> = ({t}) => {
  const inn = prog(t, 344.4, 345.0);
  // başlık + ölçek
  const titleO = window(t, S('s68') + 0.2, E('s68') + 0.3, 0.6, 0.5);
  const shrink = prog(t, S('s68') + 4.0, S('s68') + 5.0, easeIO);
  // 38 / 45 dakika halkası
  const ringO = window(t, S('s69') - 0.2, WAN_C.a + 0.4, 0.5, 0.4);
  const a38 = prog(t, S('s69') + 1.0, S('s69') + 2.4, easeOut);
  const a45 = prog(t, S('s69') + 2.2, S('s69') + 3.6, easeOut);
  // açılıştaki açıya dönüş: hasarlı liman → saat
  const harborO = prog(t, WAN_C.b - 0.4, WAN_C.b);
  const pull = prog(t, WAN_C.b + 0.6, WAN_C.b + 4.2, easeIO);
  const stopT = WAN_C.b + 3.0;
  const minutes = 9 * 60 + Math.min(40, 30 + (t - (WAN_C.b)) * 4);
  const swap = prog(t, WAN_C.b + 4.8, WAN_C.b + 6.0, easeIO);
  const tl = prog(t, S('s71') + 2.0, E('s71') + 3.0, easeIO);
  const cta = prog(t, S('s72') - 0.2, S('s72') + 1.4, easeIO);
  const wanO = window(t, WAN_C.a, WAN_C.b, 0.5, 0.5);
  const dialCam = {x: 1150, y: 600, z: 1};
  return (
    <AbsoluteFill style={{opacity: inn, background: C.nightDeep}}>
      {/* arka plan: hasarlı liman (sakin) */}
      {t < WAN_C.a + 0.6 && (
        <AbsoluteFill style={{filter: 'saturate(0.7) brightness(0.5)'}}>
          <Harbor t={t} cam={{x: 930, y: 540, z: 1}} damage={2} flag={0} sky="calm" burnSmoke={0.4} burnStart={300} glasgowSink={0.7} boats={1} />
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', left: 960, top: interp(shrink, [0, 1], [500, 300]), transform: `translate(-50%,-50%) scale(${interp(shrink, [0, 1], [1, 0.6])})`, opacity: titleO, fontFamily: FONT_TITLE, fontWeight: 900, fontSize: 150, color: C.ivory, letterSpacing: 4, whiteSpace: 'nowrap', width: 'max-content', textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>
        “EN KISA SAVAŞ”
      </div>
      <Label x={640} y={560} text="Bir taht" o={titleO * prog(t, S('s68') + 5.0, S('s68') + 5.8)} size={48} align="center" />
      <Label x={1280} y={560} text="Yüzlerce insanın kaybı" o={titleO * prog(t, S('s68') + 6.0, S('s68') + 6.8)} size={48} align="center" accent={C.danger} />
      {ringO > 0 && (
        <AbsoluteFill style={{opacity: ringO}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <circle cx={960} cy={560} r={260} fill="rgba(10,28,39,0.7)" stroke={C.brass} strokeWidth={3} />
            {Array.from({length: 60}, (_, i) => {
              const a = (i * 6 * Math.PI) / 180;
              return <line key={i} x1={960 + 248 * Math.sin(a)} y1={560 - 248 * Math.cos(a)} x2={960 + (i % 5 ? 238 : 226) * Math.sin(a)} y2={560 - (i % 5 ? 238 : 226) * Math.cos(a)} stroke={C.brass} strokeWidth={i % 5 ? 2 : 4} />;
            })}
            {[{d: 38, r: 200, p: a38, c: C.sand}, {d: 45, r: 170, p: a45, c: C.danger}].map((k, i) => {
              const deg = k.d * 6 * k.p;
              const ex = 960 + k.r * Math.sin((deg * Math.PI) / 180), ey = 560 - k.r * Math.cos((deg * Math.PI) / 180);
              return k.p > 0 ? <path key={i} d={`M 960 ${560 - k.r} A ${k.r} ${k.r} 0 ${deg > 180 ? 1 : 0} 1 ${ex} ${ey}`} fill="none" stroke={k.c} strokeWidth={14} strokeLinecap="round" /> : null;
            })}
          </svg>
          <Label x={1300} y={420} text="38 dakika" sub="kimi kayıtlara göre" o={a38} size={36} accent={C.sand} tick="left" tickLen={40} />
          <Label x={1300} y={560} text="45 dakika" sub="kimilerine göre" o={a45} size={36} accent={C.danger} tick="left" tickLen={40} />
          <Label x={960} y={900} width={900} text="Neden farklı?" sub="gemilerin ateşi bıraktığı saatler farklı kaydedildi" o={prog(t, S('s69') + 4.0, S('s69') + 4.8)} size={28} align="center" />
          <Title x={960} y={540} text="≈ 40 dk" size={92} o={prog(t, S('s70') + 0.6, S('s70') + 1.2)} />
          <Label x={960} y={640} text="her hâlde bir saatten kısa" o={prog(t, S('s70') + 3.0, S('s70') + 3.6)} size={28} align="center" accent={C.danger} />
        </AbsoluteFill>
      )}
      {/* destek çekimi: hasarlı liman, açılıştaki açı */}
      {t >= WAN_C.a && t < WAN_C.b && (
        <AbsoluteFill style={{opacity: wanO}}>
          <Sequence from={Math.round(WAN_C.a * 30)} durationInFrames={Math.round((WAN_C.b - WAN_C.a) * 30) + 2} layout="none">
            <OffthreadVideo src={staticFile(CLIP_C)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Sequence>
          
        </AbsoluteFill>
      )}
      {/* geri çekiliş: liman yeniden saatin içinde */}
      {t >= WAN_C.b - 0.4 && (
        <AbsoluteFill style={{opacity: harborO}}>
          <div style={{position: 'absolute', inset: 0, transform: `translate(${-330 * cta}px, ${0}px) scale(${interp(pull, [0, 1], [1 / 0.62, 1]) * (1 - 0.12 * cta)})`, transformOrigin: `${CX}px ${CY}px`}}>
            <Clock t={t} minutes={minutes} stopped={t > stopT} gearSpeed={t > stopT ? 0 : 1} dateRot={0}
              dialChildren={<DialHarbor t={t} cam={dialCam} damage={2} flag={0} sky="calm" glasgowSink={0.7} burn={0.4} boats={1} />}
              bezelOpacity={prog(t, WAN_C.b + 0.2, WAN_C.b + 1.2)} outerOpacity={prog(t, WAN_C.b + 1.0, WAN_C.b + 2.0)} gearsOn={prog(t, WAN_C.b + 1.0, WAN_C.b + 2.4)} handsOpacity={prog(t, WAN_C.b + 1.4, WAN_C.b + 2.4)}
              timeline={{p: tl, arcFrom: -120, arcTo: 120, marks: [{deg: -120, text: '1896'}, {deg: -60, text: '1902'}, {deg: 120, text: '1963'}]}} />
            {/* taht levhası: isim değişir */}
            <div style={{position: 'absolute', left: CX, top: CY + R_DIAL - 92, transform: 'translate(-50%,-50%)', opacity: prog(t, WAN_C.b + 2.4, WAN_C.b + 3.2)}}>
              <div style={{width: 470, height: 64, background: '#1E1A14', border: `3px solid ${C.brass}`, overflow: 'hidden', position: 'relative'}}>
                {['KHALID BİN BARGHASH', 'HAMOUD BİN MUHAMMED'].map((n, i) => (
                  <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 10 + (i - swap) * 64, textAlign: 'center', fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 32, color: C.ivory}}>{n}</div>
                ))}
              </div>
            </div>
          </div>
          {/* abonelik ve bitiş ekranı alanı */}
          {cta > 0 && (
            <AbsoluteFill style={{opacity: cta}}>
              <div style={{position: 'absolute', left: 630, top: 1000, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 18, padding: '14px 34px', background: C.danger, borderRadius: 6, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', width: 'max-content'}}>
                <svg width={34} height={34} viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" fill={C.ivory} /></svg>
                <div style={{fontFamily: FONT_LABEL, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: C.ivory}}>ABONE OL</div>
              </div>
              {/* sonraki video için boş alan (YouTube bitiş ekranı öğesi buraya yerleştirilecek) */}
              <div style={{position: 'absolute', left: 1180, top: 330, width: 640, height: 360, border: `2px solid rgba(169,130,74,0.35)`, background: 'rgba(10,28,39,0.35)'}} />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const END = DURATION_S;
