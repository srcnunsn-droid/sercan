import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store/app';
import { CATALOG, CATALOG_BY_ID, CATEGORY_TR, EMOTIONS, LIGHT_SOURCES, MODEL_CARDS, type CatalogEntry } from '../content';
import { compilePart, DIR_TR } from '../engine/compiler';
import { runRules } from '../engine/rules';
import { rigParams, shotAt } from '../engine/shot';
import { POSES, type PoseId } from '../engine/figures';
import type { Aspect, Dir, Part } from '../model/types';
import { FaceLight, FramePreview, renderPosePng } from '../ui/FramePreview';
import { PROPS, SETS, type PlacedProp } from '../engine/sets';
import { generateBpy } from '../engine/blender';
import { worldPrims } from '../engine/sets';
import { countWords, uid } from '../lib/text';
import type { Location, Project } from '../model/types';
import { Viewport3D, type ViewMode, type Viewport3DHandle } from '../ui/Viewport3D';
import { PromptBlock } from '../ui/Prompt';
import { RuleList } from '../ui/Rules';
import { Seg, Slate, Term } from '../ui/misc';
import { Icon } from '../ui/Icon';
import { saveFile } from '../lib/files';
import { kelvinHex } from '../lib/color';
import { t } from '../i18n';

export const ASPECT_NUM: Record<Aspect, number> = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1, '4:5': 4 / 5, '2.39:1': 2.39 };
const PROP_DEFAULT_POS: Record<string, [number, number]> = { bench: [1.8, -2.5], train: [-5.2, -6], door: [0, -3], table: [1.3, -1.4], lamp: [-1.6, -1.2], luggage: [-1.2, 0.6] };
/** The 3D set lives on the project's location (so time/weather stay shared with the Factory). */
export function ensureLocation(x: Project): Location {
  let loc = x.locations.find((l) => l.id === x.locationId);
  if (!loc) { loc = { id: uid('l_'), name: 'Mekân', descriptionEn: '', timeOfDay: 'dusk', weather: 'clear', setId: 'platform', props: [] }; x.locations.push(loc); x.locationId = loc.id; }
  return loc;
}
const WORDS_PER_SEC = 2.5;
const DIRS: Dir[] = ['front', 'front-left', 'left', 'back-left', 'back', 'back-right', 'right', 'front-right', 'top', 'bottom'];
const BEAT_TR = { durum: 'Durum', catisma: 'Çatışma', zirve: 'Zirve' } as const;
const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

function Select({ id, label, value, onChange, options, hint }: { id: string; label: React.ReactNode; value: string; onChange: (v: string) => void; options: { id: string; label: string }[]; hint?: string }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}{hint && <em className="mono" style={{ fontStyle: 'normal' }}>{hint}</em>}</span>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

const opts = (cat: string, none?: string) => [...(none ? [{ id: '', label: none }] : []), ...CATALOG.filter((e) => e.category === cat).map((e) => ({ id: e.id, label: `${e.tr} · ${e.en}` }))];

/** Applies a catalog entry to one part; aspect entries change the whole project frame. */
export function applyCatalogToProject(entry: CatalogEntry, project: Project, partIndex: number) {
  if (entry.category === 'aspect' && entry.aspect) { project.aspect = entry.aspect as Aspect; return; }
  const part = project.parts[partIndex]; if (part) applyCatalogToPart(entry, part);
}

export function applyCatalogToPart(entry: CatalogEntry, part: Part) {
  const c = part.camera;
  switch (entry.category) {
    case 'angle': c.angle = entry.id; break;
    case 'size': c.framing = entry.id; break;
    case 'perspective': c.perspective = entry.id; break;
    case 'lens': c.lensMm = entry.three.lensMm; break;
    case 'movement': c.motion = entry.id; break;
    case 'tilt': c.dutch = true; break;
    case 'focus': if (entry.fStop) c.fStop = entry.fStop; if (entry.three.lensMm >= 50) c.lensMm = entry.three.lensMm; break;
    case 'aspect': break; // project-level; see applyCatalogToProject
    default: {
      part.sceneEn = [part.sceneEn, entry.promptEn].filter(Boolean).join(', ');
      part.scene = [part.scene, entry.promptTr].filter(Boolean).join(', ');
    }
  }
}

function Lab() {
  const project = useApp((s) => s.project());
  const editPart = useApp((s) => s.editPart);
  const edit = useApp((s) => s.edit);
  const cardId = useApp((s) => s.cardId);
  const setCard = useApp((s) => s.setCard);
  const toast = useApp((s) => s.toast);
  const [pi, setPi] = useState(0);
  const [view, setView] = useState<ViewMode>('camera');
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [quality, setQuality] = useState<'high' | 'low'>('high');
  const [fps, setFps] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const vref = useRef<Viewport3DHandle>(null);
  const part = project.parts[pi] ?? project.parts[0];
  const card = MODEL_CARDS.find((c) => c.id === cardId)!;
  const sec = card.partSec ?? 10;
  const loc = project.locations.find((l) => l.id === project.locationId);
  const setId = loc?.setId ?? 'platform';
  const placed: PlacedProp[] = loc?.props ?? [];
  const weather = loc?.weather ?? 'clear';
  const editLoc = (r: (l: Location) => void) => edit('location', (x) => r(ensureLocation(x)));

  useEffect(() => {
    if (!playing) return;
    let raf = 0; const start = performance.now() - time * sec * 1000;
    const tick = (now: number) => {
      const tt = (now - start) / (sec * 1000);
      if (tt >= 1) { setTime(1); setPlaying(false); return; }
      setTime(tt); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const params = useMemo(() => rigParams(part.camera, ASPECT_NUM[project.aspect]), [JSON.stringify(part.camera), project.aspect]);
  const shot = shotAt(params, time);
  const compiled = useMemo(() => compilePart(project, part, cardId), [project, part, cardId]);
  const rules = useMemo(() => runRules({ project, cardId, text: compiled.en }), [project, cardId, compiled.en]);
  const partRules = rules.filter((r) => r.partIndex === undefined || r.partIndex === pi);
  const poses = part.characters.map((c) => c.pose as PoseId);
  const figCount = Math.max(1, part.characters.length);

  const set = (recipe: (p: Part) => void) => editPart(pi, recipe);
  const fileBase = `${project.title.replace(/[^\p{L}\p{N}]+/gu, '-')}-parca${pi + 1}`;
  const saveBlob = async (blob: Blob | null, name: string, mime: string, label: string, asAsset?: Parameters<Project['assets']['push']>[0]['kind']) => {
    if (!blob) { toast(`${label} hazırlanamadı.`, 'warn'); return; }
    const res = await saveFile(name, blob, mime);
    if (asAsset) edit('asset', (p) => { p.assets.push({ id: uid('a'), kind: asAsset, label: `Parça ${pi + 1} · ${label}`, createdAt: Date.now() }); });
    toast(res === 'declined' ? `${label} indirilmedi (onay verilmedi).` : `${label} hazır.`, res === 'declined' ? 'warn' : 'ok');
  };
  const exportAs = async (kind: 'png' | 'depth' | 'pose' | 'glb' | 'bpy') => {
    setBusy(kind);
    try {
      if (kind === 'pose') return await saveBlob(await renderPosePng({ params, figures: figCount, poses, aspect: ASPECT_NUM[project.aspect] }, time), `${fileBase}-poz.png`, 'image/png', 'Poz çizimi', 'reference');
      if (kind === 'bpy') {
        const py = generateBpy({ title: project.title, params, light: part.light, aspect: ASPECT_NUM[project.aspect], figures: figCount, poses, prims: worldPrims(setId, placed), seconds: sec });
        return await saveBlob(new Blob([py], { type: 'text/x-python' }), `${fileBase}-blender.py`, 'text/x-python', 'Blender betiği');
      }
      if (mode !== '3d') { toast('Bu çıktı 3D görünümden alınır; 3D’ye geç.', 'info'); return; }
      if (kind === 'glb') return await saveBlob((await vref.current?.exportGlb()) ?? null, `${fileBase}.glb`, 'model/gltf-binary', '.glb sahnesi');
      const blob = (await vref.current?.snapshot(kind === 'depth' ? 'depth' : 'color')) ?? null;
      await saveBlob(blob, `${fileBase}-${kind === 'depth' ? 'derinlik' : 'referans'}.png`, 'image/png', kind === 'depth' ? 'Derinlik haritası' : 'Referans kare', 'reference');
    } finally { setBusy(null); }
  };
  const dlgSegs = part.dialogue.map((d) => {
    const words = countWords(d.textEn || d.textTr); const dur = Math.max(0.6, words / WORDS_PER_SEC);
    return { d, words, start: d.atSec, dur, over: d.atSec + dur > sec };
  });

  return (
    <div className="grid two" style={{ alignItems: 'start' }}>
      <div className="stack lab-preview">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Seg label="Parça" value={String(pi)} onChange={(v) => { setPi(Number(v)); setTime(0); }} options={project.parts.map((p, i) => ({ id: String(i), label: `${i + 1} · ${BEAT_TR[p.beat]}` }))} />
          <Seg label="Önizleme" value={mode} onChange={setMode} options={[{ id: '3d', label: '3D' }, { id: '2d', label: '2D' }]} />
        </div>
        <div className="viewport" style={{ aspectRatio: project.aspect === '9:16' ? '4 / 5' : '16 / 10', maxWidth: '100%' }}>
          {mode === '3d'
            ? <Viewport3D ref={vref} params={params} light={part.light} t={time} aspect={ASPECT_NUM[project.aspect]} view={view} figures={figCount} poses={poses} setId={setId} props={placed} weather={weather} quality={quality} onFps={setFps} />
            : <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><div style={{ aspectRatio: String(ASPECT_NUM[project.aspect]), height: '100%', maxWidth: '100%' }}><FramePreview params={params} t={time} light={part.light} figures={figCount} poses={poses} setId={setId} props={placed} /></div></div>}
          <div className="hud">
            <span className="hud-tag">{project.aspect}</span>
            <span className="hud-tag">{Math.round(shot.lensMm)}mm · f/{part.camera.fStop}</span>
            <span className="hud-tag">00:{String(Math.floor(time * sec)).padStart(2, '0')}:{String(Math.floor((time * sec * 24) % 24)).padStart(2, '0')}</span>
            {fps !== null && mode === '3d' && (weather === 'rain' || weather === 'snow') && <span className="hud-tag">{fps} fps</span>}
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {mode === '3d' && <Seg label="Görünüm" value={view} onChange={setView} options={[{ id: 'camera', label: t('studio.view.camera') }, { id: 'orbit', label: t('studio.view.orbit') }, { id: 'top', label: t('studio.view.top') }]} />}
          <Seg label="Kalite" value={quality} onChange={setQuality} options={[{ id: 'high', label: 'Yüksek' }, { id: 'low', label: 'Mobil' }]} />
        </div>
        <div className="row" role="group" aria-label="Dışa aktarma">
          <button className="btn sm" disabled={!!busy} onClick={() => exportAs('png')}><Icon name="camera" size={16} /> Referans kare</button>
          <button className="btn sm" disabled={!!busy} onClick={() => exportAs('depth')}>Derinlik</button>
          <button className="btn sm" disabled={!!busy} onClick={() => exportAs('pose')}>Poz çizimi</button>
          <button className="btn sm" disabled={!!busy} onClick={() => exportAs('glb')}>.glb</button>
          <button className="btn sm" disabled={!!busy} onClick={() => exportAs('bpy')}>Blender .py</button>
        </div>
        <div className="timeline">
          <button className="btn iconbtn" aria-label={playing ? t('studio.pause') : t('studio.play')} onClick={() => { if (reduce()) { setTime(time >= 1 ? 0 : 1); return; } if (time >= 1) setTime(0); setPlaying(!playing); }}><Icon name={playing ? 'pause' : 'play'} /></button>
          <input type="range" min={0} max={1} step={0.001} value={time} onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)); }} aria-label="Zaman çizelgesi" id="timeline" />
          <span className="mono muted tabnum" style={{ fontSize: 12 }}>{(time * sec).toFixed(1)} / {sec}s</span>
        </div>
        <div className="stack" style={{ gap: 6 }} aria-label="Zaman çizelgesi şeritleri">
          <div className="strip-label"><span>Replik</span><span>{dlgSegs.reduce((a, x) => a + x.words, 0)} kelime</span></div>
          <div className="strip">
            {dlgSegs.map((x, i) => <span key={i} className={x.over ? 'err' : x.words > Math.round(14 * sec / 10) ? 'warn' : ''} style={{ left: `${(x.start / sec) * 100}%`, width: `${Math.min(100 - (x.start / sec) * 100, (x.dur / sec) * 100)}%` }} title={`${x.d.speaker}: ${x.d.textTr}`}>{x.d.speaker}: {x.d.textTr}</span>)}
            <i className="strip-head" style={{ left: `${time * 100}%` }} />
          </div>
          {dlgSegs.some((x) => x.over) && <p className="feedback bad" style={{ fontSize: 'var(--fs-xs)' }}>Bir replik {sec}. saniyeyi aşıyor: daha erken başlat ya da kısalt.</p>}
          <div className="strip-label"><span>Hareket</span></div>
          <div className="strip"><span className="alt" style={{ left: 0, width: '100%' }}>{CATALOG_BY_ID[part.camera.motion]?.tr ?? 'Sabit'}</span><i className="strip-head" style={{ left: `${time * 100}%` }} /></div>
          <div className="strip-label"><span>Ses</span></div>
          <div className="strip"><span style={{ left: 0, width: '100%', background: 'var(--surface-3)', color: 'var(--fg)' }}>{part.sound || 'Ortam sesi notu yok'}</span><i className="strip-head" style={{ left: `${time * 100}%` }} /></div>
          <label className="field" htmlFor="sound-note"><span>Ses notu</span><input id="sound-note" className="input" value={part.sound ?? ''} onChange={(e) => set((p) => { p.sound = e.target.value; })} placeholder="train doors hiss, distant announcement" /></label>
        </div>
        <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>
          Sahne özeti: {figCount} manken, kamera {CATALOG_BY_ID[part.camera.angle]?.tr.toLocaleLowerCase('tr')}, {CATALOG_BY_ID[part.camera.framing]?.tr.toLocaleLowerCase('tr')}, {part.camera.lensMm} mm; ışık {DIR_TR[part.light.direction]} {LIGHT_SOURCES.find((s) => s.id === part.light.source)?.tr.toLocaleLowerCase('tr')}. {view === 'orbit' && 'Sürükleyerek döndür, tekerlek ya da iki parmakla yakınlaş.'}
        </p>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-4)' }}>
        <section className="panel">
          <div className="panel-head"><h3><Icon name="camera" /> {t('studio.camera')}</h3><Slate items={[['Sahne', pi + 1], ['Çekim', part.characters.length || 1]]} /></div>
          <div className="grid two" style={{ gap: 'var(--sp-3)' }}>
            <Select id="cam-angle" label="Dikey açı" value={part.camera.angle} options={opts('angle')} onChange={(v) => set((p) => { p.camera.angle = v; })} />
            <Select id="cam-size" label="Kadraj boyutu" value={part.camera.framing} options={opts('size')} onChange={(v) => set((p) => { p.camera.framing = v; })} />
            <Select id="cam-persp" label={<Term en="over-the-shoulder">Perspektif</Term>} value={part.camera.perspective ?? ''} options={opts('perspective', 'Standart')} onChange={(v) => set((p) => { p.camera.perspective = v || undefined; })} />
            <Select id="cam-move" label={<Term en="push-in">Hareket (tek)</Term>} value={part.camera.motion} options={opts('movement')} onChange={(v) => set((p) => { p.camera.motion = v; })} />
          </div>
          <label className="field" htmlFor="cam-lens"><span><Term en="focal length">Lens</Term><em className="mono" style={{ fontStyle: 'normal' }}>{part.camera.lensMm} mm</em></span>
            <input id="cam-lens" type="range" min={14} max={200} step={1} value={part.camera.lensMm} onChange={(e) => set((p) => { p.camera.lensMm = Number(e.target.value); })} />
          </label>
          <label className="field" htmlFor="cam-f"><span><Term en="f-stop">Diyafram</Term><em className="mono" style={{ fontStyle: 'normal' }}>f/{part.camera.fStop}</em></span>
            <input id="cam-f" type="range" min={0} max={8} step={1} value={[1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22].indexOf(part.camera.fStop)} onChange={(e) => set((p) => { p.camera.fStop = [1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22][Number(e.target.value)]; })} />
          </label>
          <label className="row" style={{ gap: 8 }}><input type="checkbox" id="cam-dutch" checked={!!part.camera.dutch} onChange={(e) => set((p) => { p.camera.dutch = e.target.checked; })} style={{ width: 22, height: 22 }} /> Dutch açı (yatık kadraj)</label>
        </section>

        <section className="panel">
          <div className="panel-head"><h3><Icon name="light" /> {t('studio.light')}</h3><span className="chip static" style={{ borderColor: kelvinHex(part.light.kelvin) }}><i style={{ width: 10, height: 10, borderRadius: 99, background: kelvinHex(part.light.kelvin) }} /> {part.light.kelvin}K</span></div>
          <div className="grid two" style={{ gap: 'var(--sp-3)' }}>
            <div className="stack">
              <Select id="light-src" label={<Term en="key light">Kaynak</Term>} value={part.light.source} options={LIGHT_SOURCES.map((s) => ({ id: s.id, label: s.tr }))} onChange={(v) => set((p) => { const s = LIGHT_SOURCES.find((x) => x.id === v)!; p.light.source = v; p.light.kelvin = s.kelvin; p.light.hardness = s.hardness; if (!s.allowed.includes(p.light.direction)) p.light.direction = s.allowed[0] as Dir; })} />
              <Select id="light-dir" label="Yön" value={part.light.direction} options={DIRS.map((d) => ({ id: d, label: DIR_TR[d] }))} onChange={(v) => set((p) => { p.light.direction = v as Dir; })} />
              <label className="field" htmlFor="light-k"><span><Term en="Kelvin">Renk</Term><em className="mono" style={{ fontStyle: 'normal' }}>{part.light.kelvin}K</em></span>
                <input id="light-k" type="range" min={1500} max={10000} step={100} value={part.light.kelvin} onChange={(e) => set((p) => { p.light.kelvin = Number(e.target.value); })} style={{ background: 'linear-gradient(90deg,#ff8a1c,#ffd9a0,#fff,#bcd4ff,#9bbcff)', borderRadius: 99, height: 8 }} />
              </label>
              <Seg label="Sertlik" value={part.light.hardness} onChange={(v) => set((p) => { p.light.hardness = v; })} options={[{ id: 'sert', label: 'Sert' }, { id: 'yumusak', label: 'Yumuşak' }]} />
              <Select id="light-atm" label={<Term en="volumetric light">Atmosfer</Term>} value={part.light.atmosphere ?? 'none'} options={[{ id: 'none', label: 'Yok' }, { id: 'haze', label: 'Pus' }, { id: 'fog', label: 'Sis' }, { id: 'smoke', label: 'Duman' }, { id: 'dust', label: 'Toz' }]} onChange={(v) => set((p) => { p.light.atmosphere = v as any; })} />
              <Select id="light-2" label={<Term en="rim light">İkinci ışık</Term>} value={part.light.secondary?.source ?? ''} options={[{ id: '', label: 'Yok' }, ...LIGHT_SOURCES.map((s) => ({ id: s.id, label: s.tr }))]} onChange={(v) => set((p) => { const s = LIGHT_SOURCES.find((x) => x.id === v); p.light.secondary = s ? { source: s.id, kelvin: s.kelvin, direction: 'back-right' } : null; })} />
            </div>
            <div className="viewport" style={{ aspectRatio: '3 / 4', maxWidth: '100%' }}><FaceLight light={part.light} /></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h3>Mekân seti</h3><Seg label="Kadraj oranı" value={project.aspect} onChange={(v) => edit('aspect', (x) => { x.aspect = v; })} options={(['9:16', '16:9', '2.39:1', '1:1', '4:5'] as Aspect[]).map((a) => ({ id: a, label: a }))} /></div>
          <div className="row">{SETS.map((st) => <button key={st.id} className="chip" aria-pressed={setId === st.id} onClick={() => editLoc((l) => { l.setId = st.id; })}>{st.tr}</button>)}</div>
          <span className="eyebrow">Proplar</span>
          <div className="row">{PROPS.map((pd) => { const on = placed.some((x) => x.propId === pd.id); return <button key={pd.id} className="chip" aria-pressed={on} onClick={() => editLoc((l) => { const list = l.props ?? []; l.props = on ? list.filter((x) => x.propId !== pd.id) : [...list, { id: uid('pr'), propId: pd.id, pos: PROP_DEFAULT_POS[pd.id] ?? [1, -1], rotY: 0 }]; })}>{pd.tr}</button>; })}</div>
          <span className="eyebrow">Hava (üç parçada sabit)</span>
          <div className="row">{([['clear', 'Açık'], ['overcast', 'Kapalı'], ['rain', 'Yağmur'], ['snow', 'Kar'], ['fog', 'Sis']] as const).map(([w, l]) => <button key={w} className="chip" aria-pressed={weather === w} onClick={() => editLoc((x) => { x.weather = w; })}>{l}</button>)}</div>
        </section>

        <section className="panel">
          <div className="panel-head"><h3>Oyuncular ve sahne</h3></div>
          <div className="row">
            {project.characters.length === 0 && <span className="muted">Fabrika’da karakter ekleyince burada görünür.</span>}
            {project.characters.map((c) => {
              const on = part.characters.some((x) => x.characterId === c.id);
              return <button key={c.id} className="chip" aria-pressed={on} onClick={() => set((p) => { p.characters = on ? p.characters.filter((x) => x.characterId !== c.id) : [...p.characters, { characterId: c.id, pose: 'standing' }]; })}>{c.name}</button>;
            })}
          </div>
          {part.characters.map((cr, ci) => {
            const ch = project.characters.find((c) => c.id === cr.characterId);
            return (
              <div className="grid two" key={cr.characterId} style={{ gap: 'var(--sp-3)' }}>
                <Select id={`pose-${ci}`} label={`${ch?.name ?? '?'} · poz`} value={cr.pose} options={POSES.map((p) => ({ id: p.id, label: p.tr }))} onChange={(v) => set((p) => { p.characters[ci].pose = v; })} />
                <label className="field" htmlFor={`act-${ci}`}><span>Görünen hareket (İngilizce)</span><input id={`act-${ci}`} className="input" value={cr.action ?? ''} onChange={(e) => set((p) => { p.characters[ci].action = e.target.value; })} placeholder="holds the strap of her bag" /></label>
              </div>
            );
          })}
          <label className="field" htmlFor="scene-tr"><span>Sahne (Türkçe)</span><textarea id="scene-tr" className="textarea" style={{ minHeight: 70 }} value={part.scene} onChange={(e) => set((p) => { p.scene = e.target.value; })} /></label>
          <label className="field" htmlFor="scene-en"><span>Scene (English)</span><textarea id="scene-en" className="textarea" style={{ minHeight: 70 }} value={part.sceneEn ?? ''} onChange={(e) => set((p) => { p.sceneEn = e.target.value; })} /></label>
        </section>

        <section className="panel">
          <div className="panel-head"><h3>{t('studio.prompt')}</h3>
            <select className="select" style={{ width: 'auto' }} value={cardId} onChange={(e) => setCard(e.target.value)} aria-label="Hedef model">
              {MODEL_CARDS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {!card.verified && <span className="badge-unverified">Model kartı doğrulanmadı: değerleri Ayarlar’dan düzenleyebilirsin.</span>}
          <PromptBlock en={compiled.en} tr={compiled.tr} legend={compiled.legendTr} />
          <h4>Çelişki bekçisi</h4>
          <RuleList results={partRules} />
        </section>
      </div>
    </div>
  );
}

// ---------------- catalog ----------------
function CatalogCard({ e, selected, onOpen, onCompare, fav }: { e: CatalogEntry; selected: boolean; onOpen: () => void; onCompare: () => void; fav: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <article className="catcard" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="demo"><FramePreview params={e.three} animate={hover} t={hover ? undefined : 0.5} overlays={false} figures={e.three.two || e.three.ots ? 2 : 1} label={`${e.tr} demosu`} /></div>
      <div className="body">
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><h4>{e.tr}</h4>{fav && <Icon name="star" size={16} label="Favori" />}</div>
        <span className="en">{e.en}</span>
        <div className="row">
          <button className="btn sm primary" onClick={onOpen}>Aç</button>
          <button className="btn sm" aria-pressed={selected} onClick={onCompare}>{selected ? 'Karşılaştırmada' : 'Karşılaştır'}</button>
        </div>
      </div>
    </article>
  );
}

function Catalog() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [emo, setEmo] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const progress = useApp((s) => s.progress);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const editPart = useApp((s) => s.editPart);
  const toast = useApp((s) => s.toast);
  const [targetPart, setTargetPart] = useState(0);

  useEffect(() => {
    const h = (e: Event) => setOpenId((e as CustomEvent).detail);
    window.addEventListener('seco:catalog', h);
    return () => window.removeEventListener('seco:catalog', h);
  }, []);

  const list = CATALOG.filter((e) => {
    const n = q.trim().toLocaleLowerCase('tr');
    return (!n || `${e.tr} ${e.en} ${e.descTr}`.toLocaleLowerCase('tr').includes(n)) && (!cat || e.category === cat) && (!emo || e.emotions.includes(emo)) && (!favOnly || progress.favorites.includes(e.id));
  });
  const open = openId ? CATALOG_BY_ID[openId] : null;
  const suggestion = emo ? (['angle', 'size', 'lens', 'movement'] as const).map((c) => CATALOG.find((e) => e.category === c && e.emotions[0] === emo) ?? CATALOG.find((e) => e.category === c && e.emotions.includes(emo))).filter(Boolean) as CatalogEntry[] : [];

  return (
    <div className="stack" style={{ gap: 'var(--sp-4)' }}>
      <div className="panel">
        <div className="grid two" style={{ gap: 'var(--sp-3)' }}>
          <label className="field" htmlFor="cat-q"><span>Ara</span><input id="cat-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ör. omuz, lens, vinç" /></label>
          <label className="field" htmlFor="cat-emo"><span>Duygudan kamera öner</span>
            <select id="cat-emo" className="select" value={emo} onChange={(e) => setEmo(e.target.value)}><option value="">Duygu seç</option>{EMOTIONS.map((x) => <option key={x.id} value={x.id}>{x.tr}</option>)}</select>
          </label>
        </div>
        <div className="row">
          <button className="chip" aria-pressed={!cat} onClick={() => setCat('')}>Hepsi ({CATALOG.length})</button>
          {Object.entries(CATEGORY_TR).map(([id, tr]) => <button key={id} className="chip" aria-pressed={cat === id} onClick={() => setCat(cat === id ? '' : id)}>{tr}</button>)}
          <button className="chip" aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}><Icon name="star" size={14} /> Favoriler</button>
        </div>
        {suggestion.length > 0 && (
          <div className="feedback good">
            <b>{EMOTIONS.find((x) => x.id === emo)?.tr} için öneri:</b> {suggestion.map((s) => s.tr).join(' + ')}
            <div className="row" style={{ marginTop: 8 }}><button className="btn sm primary" onClick={() => { editPart(targetPart, (p) => suggestion.forEach((s) => applyCatalogToPart(s, p))); toast(`Öneri ${targetPart + 1}. parçaya uygulandı.`, 'ok'); }}>{targetPart + 1}. parçaya uygula</button></div>
          </div>
        )}
      </div>

      {compare.length > 0 && (
        <section className="panel">
          <div className="panel-head"><h3>Yan yana karşılaştırma</h3><button className="btn sm ghost" onClick={() => setCompare([])}>Temizle</button></div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(compare.length, 2)}, minmax(0, 1fr))` }}>
            {compare.map((id) => (
              <figure key={id} style={{ margin: 0 }} className="stack">
                <div className="viewport" style={{ aspectRatio: '16 / 9', maxWidth: '100%' }}><FramePreview params={CATALOG_BY_ID[id].three} animate figures={2} poses={['standing', 'standing']} /></div>
                <figcaption className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{CATALOG_BY_ID[id].tr}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {open && (
        <section className="panel" aria-label={`${open.tr} ayrıntısı`}>
          <div className="panel-head"><div className="stack" style={{ gap: 4 }}><span className="eyebrow">{CATEGORY_TR[open.category]}</span><h3>{open.tr}</h3><span className="mono muted">{open.en}</span></div><button className="btn sm ghost" onClick={() => setOpenId(null)}>{t('common.close')}</button></div>
          <div className="grid two">
            <div className="viewport" style={{ aspectRatio: '16 / 9', maxWidth: '100%' }}><FramePreview params={open.three} animate figures={open.three.two || open.three.ots ? 2 : 1} /></div>
            <div className="stack">
              <p>{open.descTr}</p>
              <div className="row">{open.emotions.map((x) => <span key={x} className="chip static">{EMOTIONS.find((e) => e.id === x)?.tr}</span>)}</div>
              <p className="feedback bad"><b>Ne zaman kullanma:</b> {open.avoidTr}</p>
              {open.mistakes.length > 0 && <ul className="muted" style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--fs-sm)' }}>{open.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>}
            </div>
          </div>
          <PromptBlock en={open.promptEn} tr={open.promptTr} label="Prompt cümlesi" />
          <div className="row">
            <Seg label="Hedef parça" value={String(targetPart)} onChange={(v) => setTargetPart(Number(v))} options={[0, 1, 2].map((i) => ({ id: String(i), label: `Parça ${i + 1}` }))} />
            <button className="btn primary" onClick={() => { useApp.getState().edit('catalog', (x) => applyCatalogToProject(open, x, targetPart)); toast(['position', 'composition'].includes(open.category) ? 'Cümle prompta eklendi.' : open.category === 'aspect' ? `Proje kadrajı ${open.aspect} oldu.` : 'Stüdyoya uygulandı.', 'ok'); }}>
              {['position', 'composition'].includes(open.category) ? 'Prompta ekle' : 'Stüdyoya uygula'}
            </button>
            <button className="btn" onClick={() => toggleFavorite(open.id)}><Icon name="star" size={16} /> {progress.favorites.includes(open.id) ? 'Favoriden çıkar' : 'Favorilere ekle'}</button>
          </div>
        </section>
      )}

      <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{list.length} kayıt. Kartın üzerine gelince demo oynar.</p>
      <div className="catgrid">
        {list.map((e) => (
          <CatalogCard key={e.id} e={e} fav={progress.favorites.includes(e.id)} selected={compare.includes(e.id)} onOpen={() => { setOpenId(e.id); window.scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' }); }}
            onCompare={() => setCompare((c) => (c.includes(e.id) ? c.filter((x) => x !== e.id) : [...c, e.id].slice(-4)))} />
        ))}
      </div>
    </div>
  );
}

export function Studio() {
  const [tab, setTab] = useState<'lab' | 'catalog'>('lab');
  const undo = useApp((s) => s.undo);
  const redo = useApp((s) => s.redo);
  const canUndo = useApp((s) => s.past.length > 0);
  const canRedo = useApp((s) => s.future.length > 0);
  useEffect(() => {
    const h = () => setTab('catalog');
    window.addEventListener('seco:catalog', h);
    return () => window.removeEventListener('seco:catalog', h);
  }, []);
  return (
    <>
      <header className="topbar">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">3D sahne · kamera · ışık</span><h2>{t('studio.title')}</h2></div>
        <div className="topbar-actions">
          <button className="btn iconbtn" aria-label={t('common.undo')} disabled={!canUndo} onClick={undo}><Icon name="undo" /></button>
          <button className="btn iconbtn" aria-label={t('common.redo')} disabled={!canRedo} onClick={redo}><Icon name="redo" /></button>
          <Seg label="Stüdyo sekmesi" value={tab} onChange={setTab} options={[{ id: 'lab', label: t('studio.lab') }, { id: 'catalog', label: `${t('studio.catalog')} · ${CATALOG.length}` }]} />
        </div>
      </header>
      {tab === 'lab' ? <Lab /> : <Catalog />}
    </>
  );
}
