import { useS, S } from '../store';
import type { AnimProp, Clip, EffectType, Easing, TransitionType, TextAnim } from '../types';
import { EASING_LABELS, exprErrors, transformAt, upsertKf } from '../engine/interp';
import { EFFECT_DEFS, FONTS, TEXT_ANIM_LABELS, TRANSITION_LABELS } from '../engine/effects';
import { GRADE_PRESETS, MOTION_PRESETS, TEXT_STYLES, makeEffect } from '../engine/presets';
import { applyMotion, ensureBuiltinLuts, importLutFile, setAspect, setParent } from '../actions';
import type { Draft } from 'immer';
import { MASK_MODE_LABELS, addMask, ellipseMask, maskKeyAt, rectMask, removeMask, toggleMaskAnim, toggleMaskKey } from '../engine/masks';
import { clipBounds } from '../engine/render';
import { seek } from '../engine/playback';
import type { Mask, MaskMode } from '../types';

const NO_LUTS: { id: string; name: string; size: number }[] = [];
const PROPS: { k: AnimProp; label: string; min: number; max: number; step: number }[] = [
  { k: 'x', label: 'Konum X', min: -2000, max: 2000, step: 1 }, { k: 'y', label: 'Konum Y', min: -2000, max: 2000, step: 1 },
  { k: 'scale', label: 'Ölçek', min: 0, max: 5, step: 0.01 }, { k: 'rotation', label: 'Dönüş °', min: -360, max: 360, step: 0.5 },
  { k: 'opacity', label: 'Opaklık', min: 0, max: 1, step: 0.01 }, { k: 'blur', label: 'Bulanıklık', min: 0, max: 60, step: 0.5 },
];

export const ASPECTS: [string, number, number][] = [['16:9 · 1080p', 1920, 1080], ['16:9 · 4K', 3840, 2160], ['16:9 · 720p', 1280, 720], ['9:16 · Reels/Shorts', 1080, 1920], ['1:1 · Kare', 1080, 1080], ['4:5 · Instagram', 1080, 1350], ['2.39:1 · Sinema', 1920, 804], ['21:9', 2560, 1080]];

export function Inspector() {
  const sel = useS(s => s.selected); const clip = useS(s => s.project.clips.find(c => c.id === s.selected[0]));
  if (!clip) return <ProjectSettings />;
  return <ClipInspector c={clip} multi={sel.length > 1} />;
}

function ProjectSettings() {
  const st = useS(s => s.project.settings); const name = useS(s => s.project.name);
  return (
    <div className="insp">
      <div className="sec"><div className="hd">Proje ayarları</div><div className="bd">
        <label>Ad</label><input value={name} onChange={e => S().set(d => { d.name = e.target.value; }, true)} />
        <label>Format</label>
        <select value={`${st.width}x${st.height}`} onChange={e => { const [w, h] = e.target.value.split('x').map(Number); setAspect(w, h); }}>
          {ASPECTS.map(([l, w, h]) => <option key={l} value={`${w}x${h}`}>{l}</option>)}
          {!ASPECTS.some(a => a[1] === st.width && a[2] === st.height) && <option value={`${st.width}x${st.height}`}>Özel {st.width}×{st.height}</option>}
        </select>
        <div className="row"><label>FPS</label><select value={st.fps} onChange={e => S().set(d => { d.settings.fps = Number(e.target.value); })}>{[24, 25, 30, 50, 60].map(f => <option key={f}>{f}</option>)}</select>
          <label>Arka plan</label><input type="color" value={st.bg} onChange={e => S().set(d => { d.settings.bg = e.target.value; }, true)} /></div>
      </div></div>
      <div className="hint">Bir klip seçerek dönüşüm, keyframe, efekt, renk düzenleme, geçiş, metin ve ses ayarlarını burada yapabilirsin.<br /><br />
        <b>Kısayollar:</b> Space oynat · S böl · Del sil · Shift+Del ripple · Ctrl+D çoğalt · Ctrl+C/V kopyala-yapıştır · Ctrl+A tümü · Ctrl+Z/Y geri/ileri · ←/→ kare · Shift+←/→ 1 sn · K keyframe · M işaret · Ctrl+tekerlek zoom</div>
    </div>
  );
}

function ClipInspector({ c, multi }: { c: Clip; multi: boolean }) {
  const time = useS(s => s.time);
  const local = time - c.start; const inside = local >= 0 && local <= c.duration;
  const T = transformAt(c, Math.min(Math.max(local, 0), c.duration));
  const asset = useS(s => s.project.assets.find(a => a.id === c.assetId));
  const up = (fn: (d: Draft<Clip>) => void, merge = true) => S().set(d => { const k = d.clips.find(x => x.id === c.id); if (k) fn(k); }, merge);

  const setProp = (k: AnimProp, v: number) => up(d => {
    if (d.kf[k]?.length) { const lt = Math.min(Math.max(local, 0), d.duration); d.kf[k] = upsertKf(d.kf[k], lt, v); }
    else d.base[k] = v;
  });
  const toggleKf = (k: AnimProp) => up(d => {
    const lt = Math.min(Math.max(local, 0), d.duration); const list = d.kf[k] ?? [];
    const at = list.find(f => Math.abs(f.t - lt) < 1 / 60);
    if (at) { d.kf[k] = list.filter(f => f !== at); if (!d.kf[k]!.length) { d.base[k] = at.v; delete d.kf[k]; } }
    else d.kf[k] = upsertKf(list, lt, T[k]);
  }, false);
  const kfAt = (k: AnimProp) => c.kf[k]?.find(f => Math.abs(f.t - local) < 1 / 60);
  const isAV = c.kind === 'media' && (asset?.kind === 'video' || asset?.kind === 'audio');
  const isVisual = !(c.kind === 'media' && asset?.kind === 'audio');

  return (
    <div className="insp">
      {multi && <div className="chip acc">Çoklu seçim — düzenleme ilk klibe uygulanır</div>}
      <div className="sec"><div className="hd">Klip · <span className="muted">{c.kind === 'media' ? asset?.kind : c.kind === 'adjust' ? 'ayar katmanı' : c.kind}</span></div>{c.kind === 'adjust' && <div className="hint" style={{ margin: 8 }}>Ayar katmanı: aşağıdaki efektler altındaki <b>tüm</b> katmanlara uygulanır. Bölgesel düzeltme için “Maske” efekti ekle; opaklık efektin şiddetidir.</div>}<div className="bd">
        <input value={c.name} onChange={e => up(d => { d.name = e.target.value; })} />
        <div className="grid2">
          <div className="col"><label>Başlangıç (sn)</label><input type="number" step={0.1} value={+c.start.toFixed(3)} onChange={e => up(d => { d.start = Math.max(0, Number(e.target.value)); })} /></div>
          <div className="col"><label>Süre (sn)</label><input type="number" step={0.1} value={+c.duration.toFixed(3)} onChange={e => up(d => { d.duration = Math.max(0.1, Number(e.target.value)); })} /></div>
        </div>
        {isAV && <div className="col"><label>Hız ×{c.speed.toFixed(2)}</label><input type="range" min={0.25} max={4} step={0.05} value={c.speed} onChange={e => up(d => { const ns = Number(e.target.value); d.duration = d.duration * d.speed / ns; d.speed = ns; })} /></div>}
        {isVisual && c.kind === 'media' && <details><summary className="small muted" style={{ cursor: 'pointer' }}>✂ Kırpma {c.crop && (c.crop.l || c.crop.t || c.crop.r || c.crop.b) ? '•' : ''}</summary>
          {(['l', 't', 'r', 'b'] as const).map(k => <div className="prop" key={k} style={{ gridTemplateColumns: '60px 1fr 46px' }}><label>{{ l: 'Sol', t: 'Üst', r: 'Sağ', b: 'Alt' }[k]}</label>
            <input type="range" min={0} max={0.95} step={0.005} value={c.crop?.[k] ?? 0} onChange={e => up(d => { d.crop ??= { l: 0, t: 0, r: 0, b: 0 }; d.crop[k] = Math.min(Number(e.target.value), 0.98 - (k === 'l' ? d.crop.r : k === 'r' ? d.crop.l : k === 't' ? d.crop.b : d.crop.t)); })} /><span className="small mono">{Math.round((c.crop?.[k] ?? 0) * 100)}%</span></div>)}
          <button className="sm" onClick={() => up(d => { delete d.crop; }, false)}>Kırpmayı sıfırla</button></details>}
        {isVisual && c.kind === 'media' && <div className="row"><label>Sığdır</label><select value={c.fit} onChange={e => up(d => { d.fit = e.target.value as Clip['fit']; })}><option value="cover">Doldur (kırp)</option><option value="contain">Sığdır</option><option value="stretch">Esnet</option></select></div>}
        {isVisual && <div className="row"><label>Karışım</label><select value={c.blend} onChange={e => up(d => { d.blend = e.target.value as GlobalCompositeOperation; })}>
          {['source-over', 'screen', 'multiply', 'overlay', 'lighter', 'soft-light', 'hard-light', 'difference', 'color-dodge', 'luminosity'].map(b => <option key={b}>{b}</option>)}</select></div>}
      </div></div>

      {isVisual && <AESection c={c} up={up} />}
      {isVisual && c.kind !== 'null' && <MaskSection c={c} up={up} local={Math.min(Math.max(local, 0), c.duration)} />}
      {isVisual && <div className="sec"><div className="hd">Dönüşüm & Keyframe {!inside && <span className="chip">playhead klip dışında</span>}</div><div className="bd">
        {PROPS.map(pr => {
          const has = !!c.kf[pr.k]?.length; const at = kfAt(pr.k);
          return (
            <div className="prop" key={pr.k}>
              <label>{pr.label}</label>
              <input type="range" min={pr.min} max={pr.max} step={pr.step} value={T[pr.k]} onChange={e => setProp(pr.k, Number(e.target.value))} />
              <input type="number" step={pr.step} value={+T[pr.k].toFixed(2)} onChange={e => setProp(pr.k, Number(e.target.value))} />
              <button className={'kf ' + (at ? 'at' : has ? 'has' : '')} title="Keyframe ekle/kaldır (K)" onClick={() => toggleKf(pr.k)}>◆</button>
              <button className={'kf ' + (c.expr?.[pr.k] !== undefined ? 'at' : '')} style={{ fontStyle: 'italic' }} title="Expression (AE ifadesi): wiggle, time, loopOut…" onClick={() => up(d => { d.expr ??= {}; if (d.expr[pr.k] !== undefined) delete d.expr[pr.k]; else d.expr[pr.k] = pr.k === 'rotation' ? 'time*90' : pr.k === 'opacity' ? 'value' : 'wiggle(2, 30)'; }, false)}>=</button>
              {c.expr?.[pr.k] !== undefined && <ExprBox c={c} k={pr.k} up={up} />}
            </div>
          );
        })}
        <KfEasing c={c} local={local} up={up} />
        <div className="row wrap">
          <select value="" onChange={e => { S().ui({ selected: [c.id] }); applyMotion(e.target.value); e.target.value = ''; }}><option value="">✦ Hareket preseti</option>{Object.entries(MOTION_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <button className="sm" onClick={() => up(d => { d.kf = {}; d.base = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 }; }, false)}>Sıfırla</button>
        </div>
      </div></div>}

      {c.kind === 'text' && c.text && <TextSection c={c} up={up} />}
      {(c.kind === 'solid' || c.kind === 'gradient') && <div className="sec"><div className="hd">Renk</div><div className="bd row wrap">
        <input type="color" value={c.color} onChange={e => up(d => { d.color = e.target.value; })} />
        {c.kind === 'gradient' && <><input type="color" value={c.color2} onChange={e => up(d => { d.color2 = e.target.value; })} /><label>Açı</label><input type="range" min={0} max={360} value={c.angle} onChange={e => up(d => { d.angle = Number(e.target.value); })} /></>}
      </div></div>}
      {c.kind === 'shape' && c.shape && <div className="sec"><div className="hd">Şekil</div><div className="bd">
        <select value={c.shape.shape} onChange={e => up(d => { d.shape!.shape = e.target.value as any; })}><option value="rect">Dikdörtgen</option><option value="circle">Elips</option><option value="triangle">Üçgen</option><option value="star">Yıldız</option><option value="polygon">Çokgen</option><option value="line">Çizgi</option></select>
        {(c.shape.shape === 'star' || c.shape.shape === 'polygon') && <div className="row"><label>Köşe</label><input type="number" min={3} max={24} value={c.shape.points ?? (c.shape.shape === 'star' ? 5 : 6)} onChange={e => up(d => { d.shape!.points = Math.max(3, Number(e.target.value)); })} /></div>}
        <div className="grid2"><div className="col"><label>✏ Çizerek belirme (sn)</label><input type="number" min={0} step={0.1} value={c.shape.drawOn ?? 0} onChange={e => up(d => { d.shape!.drawOn = Math.max(0, Number(e.target.value)); })} /></div>
          <div className="col"><label>Gecikme (sn)</label><input type="number" min={0} step={0.1} value={c.shape.drawDelay ?? 0} onChange={e => up(d => { d.shape!.drawDelay = Math.max(0, Number(e.target.value)); })} /></div></div>
        <div className="grid2"><div className="col"><label>Genişlik</label><input type="number" value={c.shape.w} onChange={e => up(d => { d.shape!.w = Number(e.target.value); })} /></div><div className="col"><label>Yükseklik</label><input type="number" value={c.shape.h} onChange={e => up(d => { d.shape!.h = Number(e.target.value); })} /></div></div>
        <div className="row"><label>Dolgu</label><input type="color" value={c.shape.fill} onChange={e => up(d => { d.shape!.fill = e.target.value; })} /><label>Kontur</label><input type="color" value={c.shape.stroke} onChange={e => up(d => { d.shape!.stroke = e.target.value; })} /><input type="number" style={{ width: 54 }} value={c.shape.strokeW} onChange={e => up(d => { d.shape!.strokeW = Number(e.target.value); })} /></div>
        <label>Köşe yarıçapı</label><input type="range" min={0} max={300} value={c.shape.radius} onChange={e => up(d => { d.shape!.radius = Number(e.target.value); })} />
      </div></div>}

      {c.kind === 'particles' && c.particles && <ParticleSection c={c} up={up} />}
      {isVisual && <EffectsSection c={c} up={up} />}

      {isVisual && <div className="sec"><div className="hd">Geçişler</div><div className="bd">
        {(['tIn', 'tOut'] as const).map(k => (
          <div className="row" key={k}><label style={{ width: 40 }}>{k === 'tIn' ? 'Giriş' : 'Çıkış'}</label>
            <select className="grow" value={c[k].type} onChange={e => up(d => { d[k].type = e.target.value as TransitionType; }, false)}>{Object.entries(TRANSITION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <input type="number" step={0.1} min={0.05} style={{ width: 60 }} value={c[k].d} onChange={e => up(d => { d[k].d = Math.max(0.05, Number(e.target.value)); })} />
          </div>))}
      </div></div>}

      {isAV && <div className="sec"><div className="hd">Ses</div><div className="bd">
        <div className="prop" style={{ gridTemplateColumns: '78px 1fr 54px' }}><label>Seviye</label><input type="range" min={0} max={2} step={0.01} value={c.volume} onChange={e => up(d => { d.volume = Number(e.target.value); })} /><span className="mono small">{Math.round(20 * Math.log10(Math.max(0.001, c.volume)))} dB</span></div>
        <div className="grid2"><div className="col"><label>Fade in (sn)</label><input type="number" step={0.1} min={0} value={c.fadeIn} onChange={e => up(d => { d.fadeIn = Math.max(0, Number(e.target.value)); })} /></div>
          <div className="col"><label>Fade out (sn)</label><input type="number" step={0.1} min={0} value={c.fadeOut} onChange={e => up(d => { d.fadeOut = Math.max(0, Number(e.target.value)); })} /></div></div>
        <label className="row"><input type="checkbox" checked={!!c.muted} onChange={e => up(d => { d.muted = e.target.checked; }, false)} /> Klibin sesini kapat</label>
      </div></div>}
    </div>
  );
}

function KfEasing({ c, local, up }: { c: Clip; local: number; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const all = (Object.keys(c.kf) as AnimProp[]).flatMap(k => (c.kf[k] ?? []).map(f => ({ k, f })));
  if (!all.length) return <div className="dim small">Keyframe yok. ◆ ile playhead konumuna keyframe ekle, playhead'i oynat, değeri değiştir — animasyon oluşur.</div>;
  const here = all.filter(x => Math.abs(x.f.t - local) < 1 / 60);
  const times = [...new Set(all.map(x => +x.f.t.toFixed(3)))].sort((a, b) => a - b);
  return (
    <div className="col">
      <div className="row wrap small">
        <span className="muted">Keyframe'ler:</span>
        {times.map(t => <button key={t} className={'sm ' + (Math.abs(t - local) < 1 / 60 ? 'on' : '')} onClick={() => S().ui({ time: c.start + t })}>{t.toFixed(2)}s</button>)}
      </div>
      {here.length > 0 && <div className="row"><label>Yumuşatma</label>
        <select value={here[0].f.e} onChange={e => up(d => { (Object.keys(d.kf) as AnimProp[]).forEach(k => d.kf[k]!.forEach(f => { if (Math.abs(f.t - local) < 1 / 60) f.e = e.target.value as Easing; })); }, false)}>
          {Object.entries(EASING_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>}
    </div>
  );
}

function TextSection({ c, up }: { c: Clip; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const t = c.text!;
  const set = <K extends keyof typeof t>(k: K, v: (typeof t)[K]) => up(d => { (d.text as any)[k] = v; });
  return (
    <div className="sec"><div className="hd">Metin & Tipografi</div><div className="bd">
      <textarea rows={3} value={t.text} onChange={e => { set('text', e.target.value); up(d => { d.name = e.target.value.slice(0, 24); }); }} />
      <select value="" onChange={e => { const st = TEXT_STYLES[e.target.value]; if (st) up(d => { Object.assign(d.text!, st.t); }, false); }}><option value="">Hazır stil uygula…</option>{Object.entries(TEXT_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      <div className="grid2">
        <select value={t.font} onChange={e => set('font', e.target.value)}>{FONTS.map(f => <option key={f} style={{ fontFamily: f }}>{f}</option>)}</select>
        <select value={t.weight} onChange={e => set('weight', Number(e.target.value))}>{[300, 400, 500, 600, 700, 800, 900].map(w => <option key={w}>{w}</option>)}</select>
      </div>
      <div className="prop" style={{ gridTemplateColumns: '78px 1fr 54px' }}><label>Boyut</label><input type="range" min={10} max={400} value={t.size} onChange={e => set('size', Number(e.target.value))} /><input type="number" value={t.size} onChange={e => set('size', Number(e.target.value))} /></div>
      <div className="prop" style={{ gridTemplateColumns: '78px 1fr 54px' }}><label>Satır genişliği</label><input type="range" min={0.2} max={1} step={0.01} value={t.maxW} onChange={e => set('maxW', Number(e.target.value))} /><span className="small">{Math.round(t.maxW * 100)}%</span></div>
      <div className="row wrap"><label>Renk</label><input type="color" value={t.color} onChange={e => set('color', e.target.value)} />
        <label>Kontur</label><input type="color" value={t.stroke} onChange={e => set('stroke', e.target.value)} /><input type="number" style={{ width: 48 }} min={0} value={t.strokeW} onChange={e => set('strokeW', Number(e.target.value))} />
        <label>Gölge</label><input type="number" style={{ width: 48 }} min={0} value={t.shadow} onChange={e => set('shadow', Number(e.target.value))} /></div>
      <div className="row"><label>Hizalama</label>{(['left', 'center', 'right'] as const).map(a => <button key={a} className={'sm ' + (t.align === a ? 'on' : '')} onClick={() => set('align', a)}>{a === 'left' ? '⟸' : a === 'center' ? '≡' : '⟹'}</button>)}
        <label>Zemin</label><input type="color" value={t.bg || '#000000'} onChange={e => set('bg', e.target.value)} /><button className="sm" onClick={() => set('bg', '')}>✕</button></div>
      <div className="row"><label>Animasyon</label><select className="grow" value={t.anim} onChange={e => set('anim', e.target.value as TextAnim)}>{Object.entries(TEXT_ANIM_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input type="number" step={0.1} style={{ width: 56 }} value={t.animD} onChange={e => set('animD', Math.max(0.05, Number(e.target.value)))} /></div>
    </div></div>
  );
}

function EffectsSection({ c, up }: { c: Clip; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const groups = ['Renk', 'Kompozit', 'Stil', 'Hareket', 'Bozulma'] as const;
  const luts = useS(st => st.project.luts) ?? NO_LUTS;
  return (
    <div className="sec"><div className="hd">Efektler & Renk düzenleme <span className="chip">{c.effects.length}</span></div><div className="bd">
      <div className="grid2">
        <select value="" onChange={e => { const t = e.target.value as EffectType; if (t) { if (t === 'lut') ensureBuiltinLuts(); up(d => { d.effects.push(makeEffect(t, t === 'lut' ? { lut: 'lut_builtin_filmic' } : {})); }, false); } }}>
          <option value="">+ Efekt ekle</option>
          {groups.map(g => <optgroup key={g} label={g}>{Object.entries(EFFECT_DEFS).filter(([, v]) => v.group === g).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>)}
        </select>
        <select value="" onChange={e => { const g = GRADE_PRESETS[e.target.value]; if (g) up(d => { d.effects = g.fx(); }, false); }}>
          <option value="">🎨 Grade preseti</option>{Object.entries(GRADE_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {c.effects.map((e, i) => (
        <div key={e.id} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 8, opacity: e.on ? 1 : 0.5 }}>
          <div className="row"><input type="checkbox" checked={e.on} onChange={ev => up(d => { d.effects[i].on = ev.target.checked; }, false)} /><b className="grow">{EFFECT_DEFS[e.type].label}</b>
            <button className="ghost sm" disabled={i === 0} onClick={() => up(d => { const [x] = d.effects.splice(i, 1); d.effects.splice(i - 1, 0, x); }, false)}>↑</button>
            <button className="ghost sm" onClick={() => up(d => { d.effects.splice(i, 1); }, false)}>✕</button></div>
          {EFFECT_DEFS[e.type].params.map(pd => (
            <div className="prop" key={pd.k} style={{ gridTemplateColumns: '70px 1fr 46px' }}>
              <label>{pd.label}</label>
              {pd.type === 'lut' ? <div className="row"><select className="grow" value={String(e.p[pd.k])} onChange={ev => up(d => { d.effects[i].p[pd.k] = ev.target.value; }, false)}><option value="">— LUT seç —</option>{luts.map(l => <option key={l.id} value={l.id}>{l.name} ({l.size}³)</option>)}</select>
                  <label className="sm" style={{ cursor: 'pointer', border: '1px solid var(--line2)', borderRadius: 6, padding: '2px 6px', color: 'var(--text)' }}>⬆<input type="file" accept=".cube" hidden onChange={async ev => { const f = ev.target.files?.[0]; if (!f) return; try { const id = await importLutFile(f); up(d => { d.effects[i].p[pd.k] = id; }, false); } catch (er) { S().notify((er as Error).message); } }} /></label></div>
              : pd.type === 'color' ? <input type="color" value={String(e.p[pd.k])} onChange={ev => up(d => { d.effects[i].p[pd.k] = ev.target.value; })} />
                : pd.type === 'select' ? <select value={String(e.p[pd.k])} onChange={ev => up(d => { d.effects[i].p[pd.k] = ev.target.value; })}>{pd.options!.map(o => <option key={o}>{o}</option>)}</select>
                  : <input type="range" min={pd.min} max={pd.max} step={pd.step} value={Number(e.p[pd.k])} onChange={ev => up(d => { d.effects[i].p[pd.k] = Number(ev.target.value); })} />}
              <span className="small mono">{pd.type ? '' : Number(e.p[pd.k]).toFixed(2)}</span>
            </div>))}
        </div>
      ))}
    </div></div>
  );
}

const EXPR_PRESETS: [string, string][] = [['wiggle(2, 30)', 'Titreşim (wiggle)'], ['time*90', 'Sürekli dönüş'], ['value + sin(time*3)*80', 'Salınım'], ['loopOut()', 'Döngü (cycle)'], ["loopOut('pingpong')", 'Git-gel döngü'], ['linear(t, 0, 1, 0, 1)', 'Doğrusal 0→1'], ['value + noise(time*0.5)*200', 'Yumuşak gürültü'], ['Math.round(wiggle(8, 4))', 'Sarsıntı (sert)']];
function ExprBox({ c, k, up }: { c: Clip; k: AnimProp; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const err = exprErrors.get(c.id + ':' + k);
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0 6px' }}>
      <div className="row"><span className="mono small" style={{ color: 'var(--acc2)' }}>ƒ</span>
        <input className="grow mono" style={{ fontSize: 12 }} value={c.expr?.[k] ?? ''} onChange={e => up(d => { d.expr![k] = e.target.value; })} spellCheck={false} />
        <select className="sm" value="" onChange={e => { const v = e.target.value; if (v) up(d => { d.expr![k] = v; }, false); }} style={{ width: 28 }}><option value="">…</option>{EXPR_PRESETS.map(([v, l]) => <option key={v} value={v}>{l}: {v}</option>)}</select></div>
      {err && <span className="small" style={{ color: 'var(--acc)' }}>⚠ {err}</span>}
    </div>
  );
}
function MaskSection({ c, up, local }: { c: Clip; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void; local: number }) {
  const tool = useS(s => s.tool); const maskId = useS(s => s.maskId); const masks = c.masks ?? [];
  const upM = (id: string, fn: (m: Draft<Mask>) => void, merge = true) => up(d => { const m = d.masks?.find(k => k.id === id); if (m) fn(m); }, merge);
  const preset = (kind: 'rect' | 'ellipse') => {
    const p = S().project; let w = p.settings.width * 0.6, h = p.settings.height * 0.6;
    if (c.kind !== 'adjust') { const b = clipBounds(p, { ...c, parent: undefined }, S().time); const sc = b.scale || 1; w = (b.w / sc) * 0.7; h = (b.h / sc) * 0.7; }
    addMask(c.id, n => (kind === 'rect' ? rectMask(w, h, n) : ellipseMask(w, h, n)));
  };
  return (
    <div className="sec"><div className="hd">🖊 Maskeler {masks.length > 0 && <span className="chip ok">{masks.length}</span>}</div><div className="bd">
      <div className="row wrap">
        <button className={'sm ' + (tool === 'pen' ? 'on' : '')} title="G" onClick={() => S().ui({ tool: tool === 'pen' ? 'select' : 'pen' })}>🖊 Kalemle çiz (G)</button>
        <button className="sm" onClick={() => preset('rect')}>+ Dikdörtgen</button><button className="sm" onClick={() => preset('ellipse')}>+ Elips</button>
      </div>
      {tool === 'pen' && <span className="small dim">Tıkla: nokta · sürükle: eğri · ilk noktaya tıkla / Enter: kapat · kenara tıkla: nokta ekle · Alt+tık: köşe↔yumuşak · Alt+tutamaç: kır · Del: nokta sil · Esc: çık</span>}
      {masks.map(m => { const key = maskKeyAt(m, local); const ks = m.kf ?? []; const prev = [...ks].reverse().find(k => k.t < local - 1e-3), next = ks.find(k => k.t > local + 1e-3);
        return (
        <div key={m.id} className="col" style={{ border: '1px solid ' + (m.id === maskId ? '#ffd23f' : 'var(--line2)'), borderRadius: 8, padding: 8 }} onPointerDown={() => { if (S().maskId !== m.id) S().ui({ maskId: m.id, maskPt: -1 }); }}>
          <div className="row">
            <input type="checkbox" checked={m.on} title="Aç/kapat" onChange={e => upM(m.id, k => { k.on = e.target.checked; }, false)} />
            <input className="grow" value={m.name} onChange={e => upM(m.id, k => { k.name = e.target.value; })} />
            <select value={m.mode} onChange={e => upM(m.id, k => { k.mode = e.target.value as MaskMode; }, false)}>{(Object.keys(MASK_MODE_LABELS) as MaskMode[]).map(k => <option key={k} value={k}>{MASK_MODE_LABELS[k]}</option>)}</select>
            <button className="sm" title="Maskeyi sil" onClick={() => removeMask(c.id, m.id)}>✕</button>
          </div>
          {!m.closed && <span className="chip acc">açık yol — kapatmak için ilk noktaya tıkla ya da Enter</span>}
          <div className="col"><label>Yumuşatma (feather) {m.feather.toFixed(0)} px</label><input type="range" min={0} max={300} step={1} value={m.feather} onChange={e => upM(m.id, k => { k.feather = Number(e.target.value); })} /></div>
          <div className="col"><label>Genişletme {m.expand.toFixed(0)} px</label><input type="range" min={-200} max={200} step={1} value={m.expand} onChange={e => upM(m.id, k => { k.expand = Number(e.target.value); })} /></div>
          <div className="col"><label>Maske opaklığı {(m.opacity * 100).toFixed(0)}%</label><input type="range" min={0} max={1} step={0.01} value={m.opacity} onChange={e => upM(m.id, k => { k.opacity = Number(e.target.value); })} /></div>
          <div className="row wrap">
            <label className="row"><input type="checkbox" checked={m.invert} onChange={e => upM(m.id, k => { k.invert = e.target.checked; }, false)} /> Ters çevir</label>
            <span className="sp" />
            {m.closed && <button className={'sm ' + (ks.length ? 'on' : '')} title="Maske yolu animasyonu: açıkken kalemle yaptığın her biçim değişikliği playhead'e keyframe yazar" onClick={() => toggleMaskAnim(c.id, m.id)}>⏱ Yol animasyonu</button>}
          </div>
          {ks.length > 0 && <div className="row">
            <button className="sm" disabled={!prev} onClick={() => prev && seek(c.start + prev.t)}>◀</button>
            <button className={'sm ' + (key ? 'on' : '')} title="Playhead'de yol keyframe'i ekle/sil" onClick={() => toggleMaskKey(c.id, m.id)}>◆</button>
            <button className="sm" disabled={!next} onClick={() => next && seek(c.start + next.t)}>▶</button>
            <span className="small dim">{ks.length} yol keyframe'i</span>
            {key && <select value={key.e === 'bezier' ? 'easeInOut' : key.e} title="Bu keyframe'e geliş eğrisi" onChange={e => upM(m.id, k => { const f = k.kf?.find(q => Math.abs(q.t - local) < 1 / 120); if (f) { f.e = e.target.value as Easing; delete f.b; } }, false)}>{(Object.keys(EASING_LABELS) as Easing[]).filter(k => k !== 'bezier').map(k => <option key={k} value={k}>{EASING_LABELS[k]}</option>)}</select>}
          </div>}
        </div>); })}
    </div></div>
  );
}
function AESection({ c, up }: { c: Clip; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const clips = useS(s => s.project.clips); const tracks = useS(s => s.project.tracks);
  const vids = new Set(tracks.filter(t => t.kind === 'video').map(t => t.id));
  const candidates = clips.filter(k => k.id !== c.id && vids.has(k.trackId) && k.kind !== 'adjust');
  return (
    <div className="sec"><div className="hd">⚙ After Effects {c.parent && <span className="chip ok">bağlı</span>}</div><div className="bd">
      <div className="row"><label style={{ width: 70 }}>Ebeveyn</label>
        <select className="grow" value={c.parent ?? ''} onChange={e => setParent(c.id, e.target.value || undefined)}>
          <option value="">— Yok —</option>{candidates.map(k => <option key={k.id} value={k.id}>{k.kind === 'null' ? '⊕ ' : ''}{k.kind === 'text' ? '𝐓 ' + (k.text?.text ?? '').slice(0, 20) : k.name}</option>)}</select></div>
      <label className="row"><input type="checkbox" checked={!!c.motionBlur} onChange={e => up(d => { d.motionBlur = e.target.checked; }, false)} /> Hareket bulanıklığı (180° shutter)</label>
      <span className="small dim">İfade için dönüşüm satırındaki <b>=</b> düğmesi. Kullanılabilir: time, t, value, wiggle(f,a), loopOut(), linear/ease(), sin, noise, valueAtTime(s).</span>
    </div></div>
  );
}

const PP: [keyof NonNullable<Clip['particles']>, string, number, number, number][] = [
  ['rate', 'Doğum/sn', 1, 600, 1], ['life', 'Ömür (sn)', 0.1, 15, 0.1], ['speed', 'Hız', 0, 2000, 5], ['angle', 'Yön °', -180, 180, 1], ['spread', 'Yayılım °', 0, 180, 1],
  ['gravity', 'Yerçekimi', -1500, 2000, 10], ['drag', 'Sürtünme', 0, 4, 0.05], ['turbulence', 'Türbülans', 0, 400, 1], ['size', 'Boyut', 0, 120, 0.5], ['sizeEnd', 'Son boyut', 0, 120, 0.5],
  ['emitW', 'Yayıcı genişlik', 0, 4000, 5], ['emitH', 'Yayıcı yükseklik', 0, 2400, 5], ['spin', 'Dönüş (konfeti)', 0, 1440, 10],
];
function ParticleSection({ c, up }: { c: Clip; up: (fn: (d: Draft<Clip>) => void, m?: boolean) => void }) {
  const P = c.particles!;
  return (
    <div className="sec"><div className="hd">✨ Parçacık sistemi <span className="chip">~{Math.round(P.rate * P.life)} canlı</span></div><div className="bd">
      <select value="" onChange={e => { const k = e.target.value; if (k) import('../engine/particles').then(m => up(d => { d.particles = { ...m.PARTICLE_PRESETS[k].p, seed: d.particles!.seed }; }, false)); }}><option value="">Preset uygula…</option>{['sparks', 'snow', 'confetti', 'fire', 'dust', 'magic'].map(k => <option key={k} value={k}>{k}</option>)}</select>
      <div className="row wrap"><label>Biçim</label><select value={P.shape} onChange={e => up(d => { d.particles!.shape = e.target.value as any; }, false)}>{['circle', 'glow', 'square', 'spark', 'confetti'].map(k => <option key={k}>{k}</option>)}</select>
        <input type="color" value={P.color} onChange={e => up(d => { d.particles!.color = e.target.value; })} /><input type="color" value={P.color2} onChange={e => up(d => { d.particles!.color2 = e.target.value; })} />
        <label className="row"><input type="checkbox" checked={P.additive} onChange={e => up(d => { d.particles!.additive = e.target.checked; }, false)} />Toplamalı</label></div>
      {PP.map(([k, l, mn, mx, st]) => <div className="prop" key={k} style={{ gridTemplateColumns: '92px 1fr 52px' }}><label>{l}</label><input type="range" min={mn} max={mx} step={st} value={Number(P[k])} onChange={e => up(d => { (d.particles as any)[k] = Number(e.target.value); })} /><input type="number" step={st} value={Number(P[k])} onChange={e => up(d => { (d.particles as any)[k] = Number(e.target.value); })} /></div>)}
      <button className="sm" onClick={() => up(d => { d.particles!.seed = Math.floor(Math.random() * 9999); }, false)}>🎲 Yeni varyasyon</button>
    </div></div>
  );
}
