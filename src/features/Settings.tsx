import { useEffect, useState } from 'react';
import { useApp, DEFAULT_PRICE, type Theme } from '../store/app';
import { baseCard, type ModelCard } from '../content';
import { today } from '../lib/text';
import { MODEL_CARDS } from '../content';
import { PROVIDERS, setSessionKey, hasSessionKey } from '../ai/providers';
import { callStats } from '../ai/tasks';
import { defaultProgress } from '../model/factory';
import { local } from '../lib/storage';
import { inArtifact } from '../lib/runtime';
import { Seg } from '../ui/misc';
import { t } from '../i18n';

export function Settings() {
  const theme = useApp((s) => s.theme);
  const providerId = useApp((s) => s.providerId);
  const cloud = useApp((s) => s.cloudStatus);
  const { setTheme, setProvider, toast } = useApp.getState();
  const [avail, setAvail] = useState<Record<string, boolean>>({});
  const [key, setKey] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => { Promise.all(PROVIDERS.map(async (p) => [p.id, await p.available()] as const)).then((xs) => setAvail(Object.fromEntries(xs))); }, [key]);

  return (
    <>
      <header className="topbar"><h2>{t('settings.title')}</h2></header>
      <section className="grid two">
        <div className="panel">
          <h3>{t('settings.theme')}</h3>
          <Seg<Theme> label="Tema" value={theme} onChange={setTheme} options={[{ id: 'system', label: 'Sistem' }, { id: 'dark', label: 'Koyu' }, { id: 'light', label: 'Açık' }]} />
          <h3>{t('settings.storage')}</h3>
          <p>{cloud === 'cloud' ? 'Projelerin ve ilerlemen claude.ai hesabına (sadece sana özel) kaydediliyor.' : 'Projelerin bu tarayıcıya kaydediliyor. Düzenli olarak JSON yedeği al.'}</p>
          {confirmReset
            ? <div className="row"><button className="btn danger" onClick={() => { useApp.setState({ progress: defaultProgress() }); local.remove('progress'); setConfirmReset(false); toast('İlerleme sıfırlandı.'); }}>Evet, XP ve dersleri sıfırla</button><button className="btn ghost" onClick={() => setConfirmReset(false)}>{t('common.cancel')}</button></div>
            : <div><button className="btn" onClick={() => setConfirmReset(true)}>İlerlemeyi sıfırla</button></div>}
        </div>

        <div className="panel">
          <h3>{t('settings.ai')}</h3>
          <p className="muted">Claude zorunlu değil. Bağlantı yoksa deterministik şablon motoru her promptu yine üretir.</p>
          <div className="choices">
            {PROVIDERS.map((p) => (
              <button key={p.id} className="choice" data-state={providerId === p.id ? 'picked' : undefined} aria-pressed={providerId === p.id} onClick={() => setProvider(p.id)}>
                <b>{p.labelTr}</b> <span className={`sev ${avail[p.id] ? 'ok' : 'warn'}`} style={{ marginLeft: 8 }}>{avail[p.id] ? 'hazır' : 'kapalı'}</span>
              </button>
            ))}
          </div>
          {providerId === 'api-key' && (
            <div className="stack">
              <label className="field" htmlFor="api-key"><span>API anahtarı (yalnızca bu oturumun belleğinde tutulur, hiçbir yere kaydedilmez)</span>
                <input id="api-key" className="input mono" type="password" autoComplete="off" value={key} onChange={(e) => { setKey(e.target.value); setSessionKey(e.target.value); }} placeholder="sk-ant-…" />
              </label>
              {inArtifact() && <p className="feedback bad">claude.ai içinde sayfa başka sunuculara bağlanamaz; anahtar yalnızca dosya kendi tarayıcında açıldığında çalışır. Burada “Claude (claude.ai üzerinden)” seçeneğini kullan.</p>}
              {hasSessionKey() && <p className="muted">Anahtar bellekte. Sayfayı kapatınca silinir.</p>}
            </div>
          )}
          <p className="muted mono" style={{ fontSize: 12 }}>Çağrı sayacı · Claude: {callStats.claude} · şablon: {callStats.template} · önbellek: {callStats.cached}</p>
        </div>
      </section>

      <ModelCards />
    </>
  );
}

function ModelCards() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const [open, setOpen] = useState<string | null>(null);
  const stale = (d: string | null) => !d || (Date.now() - new Date(d).getTime()) / 86_400_000 > 60;
  const patch = (id: string, v: Partial<ModelCard>) => setPrefs((p) => { p.cardOverrides[id] = { ...(p.cardOverrides[id] ?? {}), ...v }; });
  const cell = { padding: '8px 10px', borderBottom: '1px solid var(--line)' } as const;
  return (
    <section className="panel">
      <h3>{t('settings.models')}</h3>
      <p className="muted">Model özellikleri ezberden doldurulmadı: hepsi “doğrulanmadı” etiketli başlangıç değerleri. Kendi denemelerine göre düzelt, sonra “doğrulandı” işaretle. 60 günden eski doğrulama yeniden kontrol ister. Kredi fiyatları da senin hesabına göre düzenlenir.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-sm)' }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}>{['Model', 'Tür', 'Parça', 'En fazla ref.', 'Kredi/üretim', 'Durum', ''].map((h) => <th key={h} style={cell}>{h}</th>)}</tr></thead>
          <tbody>
            {MODEL_CARDS.map((c) => {
              const kind = c.kind === 'video' ? 'video' : 'image';
              return (
                <tr key={c.id}>
                  <td style={cell}><b>{c.name}</b><br /><span className="muted" style={{ fontSize: 12 }}>{c.notesTr}</span></td>
                  <td style={cell}>{{ image: 'Görsel', video: 'Video', both: 'Her ikisi' }[c.kind]}</td>
                  <td className="tabnum" style={cell}>{c.partSec ? `${c.partSec} sn` : '—'}</td>
                  <td className="tabnum" style={cell}>{c.maxRefs}</td>
                  <td style={cell}><input className="input tabnum" style={{ width: 90, minHeight: 36 }} type="number" min={0} aria-label={`${c.name} kredi`} value={prefs.creditPrices[c.id] ?? DEFAULT_PRICE[kind]} onChange={(e) => setPrefs((p) => { p.creditPrices[c.id] = Math.max(0, Number(e.target.value)); })} /></td>
                  <td style={cell}>{c.verified && !stale(c.lastVerified) ? <span className="sev ok">doğrulandı {c.lastVerified}</span> : <span className="badge-unverified">{c.verified ? 'tekrar doğrula' : 'doğrulanmadı'}</span>}</td>
                  <td style={cell}><button className="btn sm" onClick={() => setOpen(open === c.id ? null : c.id)}>{open === c.id ? 'Kapat' : 'Düzenle'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && (() => {
        const c = MODEL_CARDS.find((x) => x.id === open)!;
        return (
          <div className="tile">
            <b>{c.name}</b>
            <div className="grid three" style={{ gap: 'var(--sp-2)' }}>
              <label className="field" htmlFor="mc-sec"><span>Parça süresi (sn)</span><input id="mc-sec" className="input" type="number" min={1} value={c.partSec ?? ''} onChange={(e) => patch(c.id, { partSec: e.target.value ? Number(e.target.value) : null })} /></label>
              <label className="field" htmlFor="mc-refs"><span>En fazla referans</span><input id="mc-refs" className="input" type="number" min={0} value={c.maxRefs} onChange={(e) => patch(c.id, { maxRefs: Number(e.target.value) })} /></label>
              <label className="field" htmlFor="mc-syn"><span>Referans sözdizimi</span><input id="mc-syn" className="input mono" value={c.refSyntax} onChange={(e) => patch(c.id, { refSyntax: e.target.value })} /></label>
            </div>
            <label className="field" htmlFor="mc-notes"><span>Notlar</span><input id="mc-notes" className="input" value={c.notesTr} onChange={(e) => patch(c.id, { notesTr: e.target.value })} /></label>
            <div className="row">
              <button className="btn primary" onClick={() => patch(c.id, { verified: true, lastVerified: today() })}>Doğrulandı olarak işaretle</button>
              {baseCard(c.id) && <button className="btn ghost" onClick={() => setPrefs((p) => { delete p.cardOverrides[c.id]; })}>Başlangıç değerlerine dön</button>}
            </div>
          </div>
        );
      })()}
    </section>
  );
}
