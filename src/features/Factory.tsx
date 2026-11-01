import { useState } from 'react';
import { useApp, currentProvider, DEFAULT_PRICE } from '../store/app';
import { buildPackage, estimateCredits } from '../engine/package';
import { saveFile, copyText } from '../lib/files';
import { CATALOG_BY_ID } from '../content';
import type { Project } from '../model/types';
import { MODEL_CARDS, TEMPLATES } from '../content';
import { compileCharacterSheet, compileLocation, compilePart, referenceMap } from '../engine/compiler';
import { runRules } from '../engine/rules';
import { runTask, type IdeasOut, type StoryOut } from '../ai/tasks';
import type { Location } from '../model/types';
import { PromptBlock } from '../ui/Prompt';
import { RuleList } from '../ui/Rules';
import { Icon } from '../ui/Icon';
import { Slate } from '../ui/misc';
import { countWords, uid } from '../lib/text';
import { t } from '../i18n';

const STEPS = ['Fikir', 'Hikâye ve duygu yayı', 'Karakter atölyesi', 'Mekân atölyesi', 'Başlangıç kareleri', 'Görsel onay kapısı', 'Video promptları', 'Düzeltme laboratuvarı', 'Yayın paketi'];
const BEAT_TR = { durum: 'Durum', catisma: 'Çatışma', zirve: 'Zirve' } as const;

function Field({ id, label, value, onChange, area, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  return (
    <label className="field" htmlFor={id}><span>{label}</span>
      {area ? <textarea id={id} className="textarea" style={{ minHeight: 80 }} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function StepNote({ step }: { step: number }) {
  const p = useApp((s) => s.project());
  const note = TEMPLATES.find((x) => x.id === p.template)?.stepNotesTr?.[String(step)];
  return note ? <p className="feedback"><b>{TEMPLATES.find((x) => x.id === p.template)?.tr}:</b> {note}</p> : null;
}

export function applyTemplate(x: Project) {
  const tp = TEMPLATES.find((t) => t.id === x.template);
  if (!tp?.defaults) return;
  tp.defaults.forEach((d, i) => {
    const part = x.parts[i]; if (!part) return;
    if (d.framing) part.camera.framing = d.framing;
    if (d.angle) part.camera.angle = d.angle;
    if (d.motion) part.camera.motion = d.motion;
    if (d.lensMm) part.camera.lensMm = d.lensMm;
  });
}

function StepIdea() {
  const p = useApp((s) => s.project());
  const edit = useApp((s) => s.edit);
  const [hint, setHint] = useState('');
  const [ideas, setIdeas] = useState<IdeasOut['ideas'] | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="stack">
      <Field id="f-title" label="Proje adı" value={p.title} onChange={(v) => edit('title', (x) => { x.title = v; })} />
      <label className="field" htmlFor="f-tpl"><span>Proje şablonu</span>
        <select id="f-tpl" className="select" value={p.template} onChange={(e) => edit('template', (x) => { x.template = e.target.value; })}>{TEMPLATES.map((tp) => <option key={tp.id} value={tp.id}>{tp.tr}</option>)}</select>
      </label>
      <p className="muted">{TEMPLATES.find((x) => x.id === p.template)?.hintTr}</p>
      <div className="row">
        <button className="btn" onClick={() => { edit('template flow', applyTemplate); const hint = TEMPLATES.find((x) => x.id === p.template)?.cardHint; if (hint) useApp.getState().setCard(hint); useApp.getState().toast('Şablonun kamera akışı 3 parçaya uygulandı.', 'ok'); }}>Şablon akışını uygula</button>
        <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{TEMPLATES.find((x) => x.id === p.template)?.defaults?.map((d) => CATALOG_BY_ID[d.motion ?? '']?.tr).filter(Boolean).join(' → ')}</span>
      </div>
      <label className="field" htmlFor="f-aspect"><span>Kadraj oranı</span>
        <select id="f-aspect" className="select" value={p.aspect} onChange={(e) => edit('aspect', (x) => { x.aspect = e.target.value as any; })}>{['9:16', '16:9', '1:1', '4:5', '2.39:1'].map((a) => <option key={a}>{a}</option>)}</select>
      </label>
      <div className="tile">
        <b>Fikir üret</b>
        <div className="row" style={{ flexWrap: 'nowrap' }}><input className="input" id="f-hint" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Tema ipucu: ör. ayrılık, intikam, ilk aşk" aria-label="Tema ipucu" /><button className="btn primary" disabled={busy} onClick={async () => { setBusy(true); try { const o = await runTask<IdeasOut>(currentProvider(), 'suggestIdeas', { hint: hint || 'serbest' }); setIdeas(o.value.ideas); } finally { setBusy(false); } }}><Icon name="spark" size={16} /> {busy ? '…' : 'Öner'}</button></div>
        {ideas && <div className="grid two">{ideas.map((i) => (
          <button key={i.titleTr} className="tile interactive" onClick={() => edit('idea', (x) => { x.title = i.titleTr; })}>
            <b>{i.titleTr}</b><span style={{ fontSize: 'var(--fs-sm)' }}>İlk 3 sn: {i.hookTr}</span><span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{i.whyTr} · {i.effort}</span>
          </button>))}</div>}
      </div>
    </div>
  );
}

function StepStory() {
  const p = useApp((s) => s.project());
  const editPart = useApp((s) => s.editPart);
  const cardId = useApp((s) => s.cardId);
  const [busy, setBusy] = useState<string | null>(null);
  const sec = MODEL_CARDS.find((c) => c.id === cardId)?.partSec ?? 10;
  const max = Math.round((14 * sec) / 10);
  const plan = async () => {
    setBusy('plan');
    try {
      const o = await runTask<StoryOut>(currentProvider(), 'writeStoryPlan', { idea: p.title });
      o.value.parts.forEach((pp, i) => editPart(i, (x) => { x.scene = pp.sceneTr; if (pp.sceneEn) x.sceneEn = pp.sceneEn; if (pp.camera?.startsWith('move.')) x.camera.motion = pp.camera; if (pp.dialogueTr) x.dialogue = [{ speaker: 'Karakter', textTr: pp.dialogueTr, atSec: 3 }]; }));
    } finally { setBusy(null); }
  };
  const translate = async (i: number) => {
    setBusy('tr' + i);
    try {
      const part = p.parts[i];
      const o = await runTask<{ en: string }>(currentProvider(), 'translateToEnglish', { text: part.scene });
      editPart(i, (x) => { x.sceneEn = o.value.en; });
      for (let d = 0; d < part.dialogue.length; d++) {
        const od = await runTask<{ en: string }>(currentProvider(), 'translateToEnglish', { text: part.dialogue[d].textTr });
        editPart(i, (x) => { x.dialogue[d].textEn = od.value.en; });
      }
    } finally { setBusy(null); }
  };
  return (
    <div className="stack">
      <div className="row"><button className="btn" disabled={!!busy} onClick={plan}><Icon name="spark" size={16} /> {busy === 'plan' ? 'Planlanıyor…' : 'Fikri 3 parçaya böl'}</button><span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Her parça {sec} sn, tek kamera hareketi, en fazla {max} kelime replik.</span></div>
      {p.parts.map((part, i) => (
        <div className="tile" key={part.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><Slate items={[['Parça', i + 1], ['Vuruş', TEMPLATES.find((x) => x.id === p.template)?.beatLabelsTr?.[i] ?? BEAT_TR[part.beat]], ['Süre', `${sec}s`]]} /><button className="btn sm" disabled={!!busy} onClick={() => translate(i)}>{busy === 'tr' + i ? 'Çevriliyor…' : 'İngilizceye çevir'}</button></div>
          <Field id={`s-tr-${i}`} label="Sahne (Türkçe, görünen şeyler)" area value={part.scene} onChange={(v) => editPart(i, (x) => { x.scene = v; })} />
          <Field id={`s-en-${i}`} label="Scene (English)" area value={part.sceneEn ?? ''} onChange={(v) => editPart(i, (x) => { x.sceneEn = v; })} />
          {part.dialogue.map((d, di) => {
            const n = countWords(d.textEn || d.textTr);
            return (
              <div className="grid two" key={di} style={{ gap: 'var(--sp-2)' }}>
                <Field id={`d-${i}-${di}`} label={`${d.speaker} · ${d.atSec}. sn`} value={d.textTr} onChange={(v) => editPart(i, (x) => { x.dialogue[di].textTr = v; })} />
                <div className="field"><span>Kelime</span><span className={`sev ${n > Math.round(16 * sec / 10) ? 'error' : n > max ? 'warn' : 'ok'}`} style={{ alignSelf: 'start', fontSize: 13 }}>{n} / {max}</span></div>
              </div>
            );
          })}
          <div><button className="btn sm ghost" onClick={() => editPart(i, (x) => { x.dialogue.push({ speaker: p.characters[0]?.name ?? 'Karakter', textTr: '', atSec: 3 }); })}><Icon name="plus" size={14} /> Replik ekle</button></div>
        </div>
      ))}
    </div>
  );
}

function StepCharacters() {
  const p = useApp((s) => s.project());
  const edit = useApp((s) => s.edit);
  const refs = referenceMap(p).characters;
  return (
    <div className="stack">
      <p className="muted">Karakter başına tek bir sheet promptu. Düz gri zemin, gölgesiz ışık; ışık sahnede kurulur, sheet’te kurulmaz.</p>
      {p.characters.map((c, i) => {
        const sheet = compileCharacterSheet(c);
        return (
          <div className="tile" key={c.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}><b>{refs[c.id]} · {c.name || 'İsimsiz'}</b><button className="btn sm ghost danger" onClick={() => edit('del char', (x) => { x.characters.splice(i, 1); x.parts.forEach((pp) => { pp.characters = pp.characters.filter((cc) => cc.characterId !== c.id); }); })}><Icon name="trash" size={14} /> Sil</button></div>
            <div className="grid two" style={{ gap: 'var(--sp-2)' }}>
              <Field id={`c-n-${i}`} label="Ad" value={c.name} onChange={(v) => edit('c', (x) => { x.characters[i].name = v; })} />
              <Field id={`c-w-${i}`} label="Kıyafet (İngilizce)" value={c.wardrobe} onChange={(v) => edit('c', (x) => { x.characters[i].wardrobe = v; })} />
              <Field id={`c-dt-${i}`} label="Görünüş (Türkçe)" area value={c.descriptionTr} onChange={(v) => edit('c', (x) => { x.characters[i].descriptionTr = v; })} />
              <Field id={`c-de-${i}`} label="Appearance (English, visible only)" area value={c.descriptionEn} onChange={(v) => edit('c', (x) => { x.characters[i].descriptionEn = v; })} />
            </div>
            <Field id={`c-tags-${i}`} label="Etiketler (virgülle)" value={(c.tags ?? []).join(', ')} onChange={(v) => edit('c', (x) => { x.characters[i].tags = v.split(',').map((t) => t.trim()).filter(Boolean); })} placeholder="dram, peron, kadın" />
            <div className="row">
              <button className="btn sm" onClick={() => edit('version', (x) => { const { versions, ...data } = x.characters[i]; x.characters[i].versions = [...(versions ?? []), { at: Date.now(), data: structuredClone(data) }].slice(-10); })}>Sürüm kaydet</button>
              {(c.versions ?? []).slice().reverse().map((v) => (
                <button key={v.at} className="chip" title="Bu sürüme dön" onClick={() => edit('restore', (x) => { const keep = x.characters[i].versions; x.characters[i] = { ...structuredClone(v.data), versions: keep }; })}>
                  ↺ {new Date(v.at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                </button>
              ))}
            </div>
            <PromptBlock en={sheet.en} tr={sheet.tr} label="Sheet promptu" />
            <RuleList results={runRules({ text: sheet.en + ' ' + c.descriptionEn }, ['char.invisible-word', 'safety.ip'])} empty="Görünmeyen kelime yok." />
          </div>
        );
      })}
      <div><button className="btn" onClick={() => edit('add char', (x) => { x.characters.push({ id: uid('c_'), name: '', descriptionTr: '', descriptionEn: '', wardrobe: '' }); })}><Icon name="plus" size={16} /> Karakter ekle</button></div>
    </div>
  );
}

function StepLocation() {
  const p = useApp((s) => s.project());
  const edit = useApp((s) => s.edit);
  const loc = p.locations.find((l) => l.id === p.locationId);
  if (!loc) return <div className="empty"><p>Henüz mekân yok.</p><button className="btn primary" onClick={() => edit('loc', (x) => { const id = uid('l_'); x.locations.push({ id, name: 'Yeni mekân', descriptionEn: '', timeOfDay: 'dusk', weather: 'clear' }); x.locationId = id; })}>Mekân ekle</button></div>;
  const i = p.locations.indexOf(loc);
  const c = compileLocation(loc);
  const set = (r: (l: Location) => void) => edit('loc', (x) => r(x.locations[i]));
  return (
    <div className="stack">
      <p className="muted">İnsansız mekân görseli. Zaman ve hava burada seçilir ve üç parçada da sabit kalır.</p>
      <div className="grid two" style={{ gap: 'var(--sp-2)' }}>
        <Field id="l-name" label="Ad" value={loc.name} onChange={(v) => set((l) => { l.name = v; })} />
        <Field id="l-desc" label="Description (English)" value={loc.descriptionEn} onChange={(v) => set((l) => { l.descriptionEn = v; })} />
        <label className="field" htmlFor="l-time"><span>Zaman</span><select id="l-time" className="select" value={loc.timeOfDay} onChange={(e) => set((l) => { l.timeOfDay = e.target.value as any; })}>{[['dawn', 'Şafak'], ['day', 'Gündüz'], ['golden-hour', 'Altın saat'], ['dusk', 'Alacakaranlık'], ['night', 'Gece']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="field" htmlFor="l-weather"><span>Hava</span><select id="l-weather" className="select" value={loc.weather} onChange={(e) => set((l) => { l.weather = e.target.value as any; })}>{[['clear', 'Açık'], ['overcast', 'Kapalı'], ['rain', 'Yağmur'], ['snow', 'Kar'], ['fog', 'Sis']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      </div>
      <PromptBlock en={c.en} tr={c.tr} label={`Mekân promptu · ${referenceMap(p).location}`} />
      <RuleList results={runRules({ project: p }, ['continuity.time-weather'])} empty="Parçalar mekânın zamanı ve havasıyla uyumlu." />
    </div>
  );
}

function StepFrames() {
  const p = useApp((s) => s.project());
  const refs = referenceMap(p);
  const imageCards = MODEL_CARDS.filter((c) => c.kind !== 'video');
  const [cardId, setCardId] = useState(imageCards.find((c) => c.id === 'nano-banana-2')?.id ?? imageCards[0].id);
  return (
    <div className="stack">
      <p className="muted">Referans sırası sabit: önce karakter sheet’leri, sonra mekân. Numaralar her parçada 1’den başlar; yalnızca o parçada görünenleri yükle ({refs.list.length} görsel toplam).</p>
      <label className="field" htmlFor="fr-card"><span>Görsel modeli</span><select id="fr-card" className="select" value={cardId} onChange={(e) => setCardId(e.target.value)}>{imageCards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      {p.parts.map((part, i) => { const c = compilePart(p, part, cardId); return <PromptBlock key={part.id} en={c.en} tr={c.tr} legend={c.legendTr} label={`Parça ${i + 1} başlangıç karesi`} />; })}
    </div>
  );
}

function StepGate() {
  const p = useApp((s) => s.project());
  const edit = useApp((s) => s.edit);
  const errors = runRules({ project: p }).filter((r) => r.severity === 'error');
  const checks = [
    ['Her karakterin sheet görseli üretildi', p.characters.length > 0],
    ['Mekân görseli üretildi', !!p.locationId],
    ['3 başlangıç karesi hazır', p.parts.every((x) => x.scene.trim())],
    ['Çelişki bekçisinde hata yok', errors.length === 0],
  ] as const;
  return (
    <div className="stack">
      <p>Önce görseller, sonra video. Kredi boşa gitmesin diye video adımı burada kilitli kalır.</p>
      <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>{checks.map(([l, ok]) => <li key={l} className="row"><span className={`sev ${ok ? 'ok' : 'warn'}`}>{ok ? 'Hazır' : 'Eksik'}</span>{l}</li>)}</ul>
      {errors.length > 0 && <RuleList results={errors} />}
      <label className="row tile" style={{ cursor: 'pointer' }}>
        <input type="checkbox" id="gate" checked={p.factory.visualsApproved} onChange={(e) => edit('gate', (x) => { x.factory.visualsApproved = e.target.checked; if (e.target.checked) x.factory.step = Math.max(x.factory.step, 7); })} style={{ width: 24, height: 24 }} />
        <b>{t('factory.gate')}</b>
      </label>
    </div>
  );
}

function StepVideo() {
  const p = useApp((s) => s.project());
  const cardId = useApp((s) => s.cardId);
  const prefs = useApp((s) => s.prefs);
  const { setCard, logCredit, edit, toast } = useApp.getState();
  const videoCards = MODEL_CARDS.filter((c) => c.kind !== 'image');
  const imageCards = MODEL_CARDS.filter((c) => c.kind !== 'video');
  const card = videoCards.find((c) => c.id === cardId) ?? videoCards[0];
  const [compare, setCompare] = useState<string[]>([]);
  const [imgCard, setImgCard] = useState(imageCards.find((c) => c.id === 'nano-banana-2')?.id ?? imageCards[0].id);
  const rules = runRules({ project: p, cardId: card.id });
  const price = (id: string, kind: 'image' | 'video') => prefs.creditPrices[id] ?? DEFAULT_PRICE[kind];
  const opts = { imageCardId: imgCard, videoCardId: card.id, prices: prefs.creditPrices, defaultPrice: DEFAULT_PRICE };
  const est = estimateCredits(p, opts);
  const limitsFor = (id: string, i: number) => {
    const c = MODEL_CARDS.find((x) => x.id === id)!; const part = p.parts[i]; const out: string[] = [];
    const sec = c.partSec ?? 10;
    const refs = part.characters.length + (p.locationId ? 1 : 0);
    if (refs > c.maxRefs) out.push(`${refs} referans > en fazla ${c.maxRefs}`);
    const last = Math.max(0, ...part.dialogue.map((d) => d.atSec + countWords(d.textEn || d.textTr) / 2.5));
    if (last > sec) out.push(`replik ${last.toFixed(1)} sn’de bitiyor > ${sec} sn`);
    const words = part.dialogue.reduce((a, d) => a + countWords(d.textEn || d.textTr), 0);
    if (words > Math.round(16 * sec / 10)) out.push(`${words} kelime ${sec} sn’ye sığmaz`);
    if (!c.dialogueSyntax && part.dialogue.length) out.push('bu model replik sözdizimi bilmiyor');
    return out;
  };
  const exportPackage = async (how: 'file' | 'copy') => {
    const md = buildPackage(p, opts);
    if (how === 'copy') { toast((await copyText(md)) ? 'Sahne paketi panoya kopyalandı.' : 'Kopyalanamadı; dosya olarak indir.', 'ok'); return; }
    const r = await saveFile(`${p.title.replace(/[^\p{L}\p{N}]+/gu, '-')}-sahne-paketi.md`, md, 'text/markdown');
    toast(r === 'declined' ? 'İndirme onaylanmadı.' : 'Sahne paketi hazır.', r === 'declined' ? 'warn' : 'ok');
  };
  return (
    <div className="stack">
      <StepNote step={7} />
      <div className="grid two">
        <label className="field" htmlFor="v-card"><span>Video modeli</span><select id="v-card" className="select" value={card.id} onChange={(e) => setCard(e.target.value)}>{videoCards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field" htmlFor="v-img"><span>Görsel modeli (paket için)</span><select id="v-img" className="select" value={imgCard} onChange={(e) => setImgCard(e.target.value)}>{imageCards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      </div>
      <div className="tile">
        <div className="row" style={{ justifyContent: 'space-between' }}><b>Sahne paketi</b><Slate items={[['Tahmin', `${est.total} kr`], ['Harcanan', p.credits.spent], ['Deneme', p.credits.attempts]]} /></div>
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{est.images} görsel × {price(imgCard, 'image')} + {est.videos} video × {price(card.id, 'video')} kredi. Fiyatları Ayarlar’dan düzenle.</p>
        <div className="row">
          <button className="btn primary" onClick={() => exportPackage('file')}><Icon name="download" size={16} /> Paketi indir (.md)</button>
          <button className="btn" onClick={() => exportPackage('copy')}><Icon name="copy" size={16} /> Hepsini kopyala</button>
          <button className="btn" onClick={() => logCredit({ cardId: imgCard, kind: 'image', credits: price(imgCard, 'image') })}>+ görsel üretildi</button>
          <button className="btn" onClick={() => logCredit({ cardId: card.id, kind: 'video', credits: price(card.id, 'video') })}>+ video üretildi</button>
        </div>
      </div>
      {!card.verified && <span className="badge-unverified">{card.name}: doğrulanmadı. {card.notesTr}</span>}
      <div className="row"><span className="eyebrow">Karşılaştır</span>{videoCards.filter((c) => c.id !== card.id).map((c) => <button key={c.id} className="chip" aria-pressed={compare.includes(c.id)} onClick={() => setCompare((x) => (x.includes(c.id) ? x.filter((y) => y !== c.id) : [...x, c.id].slice(-2)))}>{c.name}</button>)}</div>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Süreklilik: her parçanın son karesi sonrakinin başlangıç karesi olur.</p>
      {p.parts.map((part, i) => {
        const ids = [card.id, ...compare];
        return (
          <div key={part.id} className="stack">
            <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${ids.length > 1 ? 300 : 500}px), 1fr))` }}>
              {ids.map((id) => {
                const c = compilePart(p, part, id); const lim = limitsFor(id, i); const mc = MODEL_CARDS.find((x) => x.id === id)!;
                return (
                  <div key={id} className="stack">
                    <PromptBlock en={c.en} tr={c.tr} legend={c.legendTr} label={`Parça ${i + 1} · ${mc.name} · ${mc.partSec ?? 10} sn`} />
                    {lim.map((l) => <span key={l} className="sev warn" style={{ alignSelf: 'start' }}>{l}</span>)}
                    <div><button className="btn sm ghost" onClick={() => { edit('save prompt', (x) => { x.prompts.push({ id: uid('pb'), partId: part.id, target: id, en: c.en, tr: c.tr, createdAt: Date.now(), label: `${x.title} · Parça ${i + 1} · ${mc.name}` }); }); toast('Prompt kütüphaneye kaydedildi.', 'ok'); }}>Kütüphaneye kaydet</button></div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <h4>Çelişki bekçisi ve süreklilik</h4>
      <RuleList results={rules} />
    </div>
  );
}

export function Factory() {
  const p = useApp((s) => s.project());
  const edit = useApp((s) => s.edit);
  const [step, setStep] = useState(Math.min(p.factory.step, 7));
  const canOpen = (n: number) => n <= 6 || (n === 7 && p.factory.visualsApproved);
  const goStep = (n: number) => { if (!canOpen(n)) return; setStep(n); if (n > p.factory.step) edit('step', (x) => { x.factory.step = n; }); };
  return (
    <>
      <header className="topbar">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">{p.title}</span><h2>{t('factory.title')}</h2></div>
        <Slate items={[['Adım', `${step}/9`], ['Oran', p.aspect]]} />
      </header>
      <div className="wizard">
        <nav className="wsteps" aria-label="Üretim adımları">
          {STEPS.map((s, i) => {
            const n = i + 1; const locked = !canOpen(n) || n >= 8;
            return (
              <button key={s} className="wstep" aria-current={step === n ? 'step' : undefined} data-done={n < p.factory.step || (n === 6 && p.factory.visualsApproved)} disabled={locked} onClick={() => goStep(n)} title={n === 7 && !p.factory.visualsApproved ? t('factory.gateLocked') : undefined}>
                <span className="n">{n}</span>{s}{locked && <Icon name="lock" size={14} />}
              </button>
            );
          })}
        </nav>
        <section className="panel">
          <div className="panel-head"><h3>{step}. {STEPS[step - 1]}</h3></div>
          {step === 1 && <><StepNote step={1} /><StepIdea /></>}
          {step === 2 && <><StepNote step={2} /><StepStory /></>}
          {step === 3 && <><StepNote step={3} /><StepCharacters /></>}
          {step === 4 && <><StepNote step={4} /><StepLocation /></>}
          {step === 5 && <><StepNote step={5} /><StepFrames /></>}
          {step === 6 && <><StepNote step={6} /><StepGate /></>}
          {step === 7 && <StepVideo />}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>{t('common.back')}</button>
            {step < 7 && <button className="btn primary" disabled={!canOpen(step + 1)} onClick={() => goStep(step + 1)}>{step === 6 && !p.factory.visualsApproved ? t('factory.gateLocked') : <>{t('common.next')} <Icon name="arrow" size={16} /></>}</button>}
          </div>
          {step >= 7 && <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>8. Düzeltme laboratuvarı Faz 5’te, 9. Yayın paketi Faz 6’da açılacak.</p>}
        </section>
      </div>
    </>
  );
}
