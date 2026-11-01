import { useRef, useState } from 'react';
import { useApp } from '../store/app';
import { saveFile, readFileText } from '../lib/files';
import { Icon } from '../ui/Icon';
import { Slate } from '../ui/misc';
import { PromptBlock } from '../ui/Prompt';
import { MODEL_CARDS } from '../content';
import { uid } from '../lib/text';
import { learnPatterns } from '../engine/notebook';
import type { Character, Location } from '../model/types';
import { t } from '../i18n';

export function Library() {
  const projects = useApp((s) => s.projects);
  const currentId = useApp((s) => s.currentId);
  const { openProject, newProject, deleteProject, importProject, toast, go } = useApp.getState();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [paste, setPaste] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const current = projects.find((p) => p.id === currentId)!;
  const [aq, setAq] = useState('');
  const [pq, setPq] = useState('');
  const edit = useApp((s) => s.edit);
  const norm = (x: string) => x.toLocaleLowerCase('tr');
  const chars = projects.flatMap((p) => p.characters.map((c) => ({ c, p })));
  const locs = projects.flatMap((p) => p.locations.map((l) => ({ l, p })));
  const match = (txt: string) => !aq.trim() || norm(txt).includes(norm(aq.trim()));
  const prompts = projects.flatMap((p) => p.prompts.map((b) => ({ b, p }))).filter(({ b }) => !pq.trim() || norm(`${b.label ?? ''} ${b.en} ${b.tags?.join(' ') ?? ''} ${b.resultNote ?? ''}`).includes(norm(pq.trim()))).sort((a, b) => b.b.createdAt - a.b.createdAt);
  const copyChar = (c: Character) => { edit('reuse char', (x) => { const { versions: _v, ...rest } = c; x.characters.push({ ...structuredClone(rest), id: uid('c_') }); }); toast(`${c.name} bu projeye eklendi.`, 'ok'); };
  const copyLoc = (l: Location) => { edit('reuse loc', (x) => { const { versions: _v, ...rest } = l; const id = uid('l_'); x.locations.push({ ...structuredClone(rest), id }); x.locationId = id; }); toast(`${l.name} bu projenin mekânı oldu.`, 'ok'); };

  const doImport = (text: string) => {
    setErr('');
    try { importProject(JSON.parse(text)); toast('Proje içe aktarıldı.', 'ok'); setPaste(''); }
    catch (e: any) { setErr(e?.message?.includes('JSON') ? 'Bu metin geçerli bir JSON değil.' : e?.message ?? 'İçe aktarılamadı.'); }
  };
  const exportOne = async (id: string) => {
    const p = projects.find((x) => x.id === id)!;
    const r = await saveFile(`${p.title.replace(/[^\p{L}\p{N}]+/gu, '-')}.seco.json`, JSON.stringify(p, null, 2));
    toast(r === 'declined' ? 'İndirme onaylanmadı.' : 'Proje dosyası hazırlandı.', r === 'declined' ? 'warn' : 'ok');
  };

  return (
    <>
      <header className="topbar">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">{projects.length} proje</span><h2>{t('library.title')}</h2></div>
        <div className="topbar-actions"><button className="btn primary" onClick={() => { newProject(); go('factory'); }}><Icon name="plus" size={16} /> {t('library.new')}</button></div>
      </header>

      <section className="grid three">
        {projects.map((p) => (
          <article key={p.id} className="tile" style={p.id === currentId ? { borderColor: 'var(--accent)' } : undefined}>
            <span className="eyebrow">{new Date(p.updatedAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <b style={{ fontSize: 'var(--fs-lg)' }}>{p.title}</b>
            <Slate items={[['Karakter', p.characters.length], ['Adım', `${p.factory.step}/9`], ['Oran', p.aspect]]} />
            <div className="row">
              <button className="btn sm primary" onClick={() => { openProject(p.id); go('factory'); }}>{p.id === currentId ? 'Açık' : 'Aç'}</button>
              <button className="btn sm" onClick={() => exportOne(p.id)}><Icon name="download" size={14} /> JSON</button>
              {confirm === p.id
                ? <><button className="btn sm danger" onClick={() => { deleteProject(p.id); setConfirm(null); toast('Proje silindi.', 'info'); }}>{t('common.confirmDelete')}</button><button className="btn sm ghost" onClick={() => setConfirm(null)}>{t('common.cancel')}</button></>
                : <button className="btn sm ghost danger" onClick={() => setConfirm(p.id)} aria-label={`${p.title} sil`}><Icon name="trash" size={14} /></button>}
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head"><h3>Varlık kütüphanesi</h3><input className="input" style={{ maxWidth: 320 }} aria-label="Varlık ara" placeholder="Ad ya da etiket ara" value={aq} onChange={(e) => setAq(e.target.value)} /></div>
        <p className="muted">Bütün projelerdeki karakterler ve mekânlar. Yeniden kullanmak için açık projeye kopyala.</p>
        <div className="grid three">
          {chars.filter(({ c }) => match(`${c.name} ${c.descriptionTr} ${(c.tags ?? []).join(' ')}`)).map(({ c, p }) => (
            <div className="tile" key={p.id + c.id}>
              <span className="eyebrow">Karakter · {p.title}</span><b>{c.name || 'İsimsiz'}</b>
              <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{c.descriptionTr}</span>
              <div className="row">{(c.tags ?? []).map((t) => <span key={t} className="chip static">{t}</span>)}<span className="chip static">{(c.versions ?? []).length} sürüm</span></div>
              {p.id !== currentId && <button className="btn sm" onClick={() => copyChar(c)}>Bu projeye kopyala</button>}
            </div>
          ))}
          {locs.filter(({ l }) => match(`${l.name} ${l.descriptionEn} ${(l.tags ?? []).join(' ')}`)).map(({ l, p }) => (
            <div className="tile" key={p.id + l.id}>
              <span className="eyebrow">Mekân · {p.title}</span><b>{l.name}</b>
              <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{l.descriptionEn}</span>
              {p.id !== currentId && <button className="btn sm" onClick={() => copyLoc(l)}>Bu projede kullan</button>}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h3>Kayıtlı promptlar · deneyim defteri</h3><input className="input" style={{ maxWidth: 320 }} aria-label="Prompt ara" placeholder="Ara: model, sahne, not" value={pq} onChange={(e) => setPq(e.target.value)} /></div>
        <p className="muted">Fabrika’dan kaydettiğin promptlar. Ürettikten sonra sonucu puanla ve not düş: iyi çalışan kalıplar burada birikir.</p>
        {(() => {
          const all = projects.flatMap((x) => x.prompts);
          const pats = MODEL_CARDS.map((c) => learnPatterns(all, c.id)).filter((x) => x.rated > 0);
          return pats.length > 0 && (
            <div className="grid two">{pats.map((x) => (
              <div className="tile" key={x.cardId}>
                <b>{MODEL_CARDS.find((c) => c.id === x.cardId)?.name}</b>
                <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{x.rated} puanlı prompt · {x.good} çok iyi · {x.bad} kötü</span>
                {x.keep.length > 0 && <div className="row"><span className="sev ok">İşe yarıyor</span>{x.keep.map((k) => <span key={k.text} className="chip static mono" style={{ fontSize: 12 }}>{k.text} ×{k.n}</span>)}</div>}
                {x.avoid.length > 0 && <div className="row"><span className="sev error">Kaçın</span>{x.avoid.map((k) => <span key={k.text} className="chip static mono" style={{ fontSize: 12 }}>{k.text} ×{k.n}</span>)}</div>}
                {!x.keep.length && !x.avoid.length && <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Kalıp için en az 2 benzer sonuç gerekiyor. Puanlamaya devam et.</span>}
              </div>
            ))}</div>
          );
        })()}
        {prompts.length === 0 ? <p className="empty">Henüz kayıtlı prompt yok. Fabrika → Video promptları → “Kütüphaneye kaydet”.</p> : prompts.slice(0, 30).map(({ b, p }) => (
          <div className="tile" key={b.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}><b>{b.label ?? MODEL_CARDS.find((c) => c.id === b.target)?.name}</b><span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{new Date(b.createdAt).toLocaleDateString('tr-TR')}</span></div>
            <PromptBlock en={b.en} tr={b.tr} />
            <div className="row">
              <span className="eyebrow">Sonuç</span>
              {([1, 2, 3] as const).map((r) => <button key={r} className="chip" aria-pressed={b.rating === r} onClick={() => { if (p.id !== currentId) useApp.getState().openProject(p.id); useApp.getState().edit('rate', (x) => { const it = x.prompts.find((y) => y.id === b.id); if (it) it.rating = r; }); }}>{['', 'Kötü', 'İdare eder', 'Çok iyi'][r]}</button>)}
            </div>
            <label className="field" htmlFor={`note-${b.id}`}><span>Sonuç notu</span><input id={`note-${b.id}`} className="input" value={b.resultNote ?? ''} placeholder="ör. yüz kaydı, ışık doğru geldi" onChange={(e) => { if (p.id !== currentId) useApp.getState().openProject(p.id); useApp.getState().edit('note', (x) => { const it = x.prompts.find((y) => y.id === b.id); if (it) it.resultNote = e.target.value; }); }} /></label>
          </div>
        ))}
      </section>

      <section className="grid two">
        <div className="panel">
          <h3>Varlıklar</h3>
          <p className="muted">{current.title} projesindeki karakter sheet’leri, mekân ve referans kareler. Sıra referans numarasını belirler.</p>
          {current.assets.length === 0 ? <p className="empty">Henüz varlık yok. Stüdyo’dan PNG referans kare alabilirsin.</p> : (
            <ul className="stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {current.assets.map((a) => <li key={a.id} className="row"><span className="chip static mono">{a.ref ?? '—'}</span>{a.label}<span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{a.kind}</span></li>)}
            </ul>
          )}
        </div>
        <div className="panel">
          <h3>Yedek ve içe aktarma</h3>
          <p className="muted">Depolama sıfırlanırsa emek kaybolmasın: projeyi JSON olarak sakla, istediğin zaman geri yükle. Eski sürümler otomatik yükseltilir.</p>
          <div className="row">
            <button className="btn" onClick={() => exportOne(currentId)}><Icon name="download" size={16} /> {t('library.export')}</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" size={16} /> Dosyadan yükle</button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) doImport(await readFileText(f)); e.target.value = ''; }} />
          </div>
          <label className="field" htmlFor="paste-json"><span>ya da JSON’u yapıştır</span><textarea id="paste-json" className="textarea mono" style={{ fontSize: 12 }} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder='{"schemaVersion": 2, "title": "…"}' /></label>
          <div><button className="btn primary" disabled={!paste.trim()} onClick={() => doImport(paste)}>{t('library.import')}</button></div>
          {err && <p className="feedback bad" role="alert">{err}</p>}
        </div>
      </section>
    </>
  );
}
