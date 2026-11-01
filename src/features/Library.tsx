import { useRef, useState } from 'react';
import { useApp } from '../store/app';
import { saveFile, readFileText } from '../lib/files';
import { Icon } from '../ui/Icon';
import { Slate } from '../ui/misc';
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
