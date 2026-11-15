import { useState } from 'react';
import { ECOSYSTEM, ROADMAP, type Status } from '../ai/ecosystem';

const COLORS: Record<Status, string> = { 'Entegre': 'ok', 'Adaptör hazır': 'ok', 'Yol haritası': 'acc', 'Referans': '' };

export function Ecosystem() {
  const cats = [...new Set(ECOSYSTEM.map(t => t.cat))]; const [cat, setCat] = useState(''); const [q, setQ] = useState('');
  const list = ECOSYSTEM.filter(t => (!cat || t.cat === cat) && (!q || (t.name + t.what + t.repo).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="page eco">
      <div className="row" style={{ marginBottom: 6 }}><h2>🧭 Ekosistem & Yol Haritası</h2><span className="chip">{ECOSYSTEM.length} açık kaynak proje</span></div>
      <p className="muted" style={{ maxWidth: 900 }}>GitHub’daki en işe yarar açık kaynak araçlar: stüdyoya nasıl bağlandıkları ve durumları. Lisanslar özettir — ticari kullanımdan önce reponun LICENSE dosyasını kontrol et.</p>
      <div className="grid2" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 16 }}>
        {ROADMAP.map(r => <div key={r.k} className="card"><h4 style={{ marginBottom: 8 }}>{r.k}</h4>{r.items.map(i => <div key={i} className="small" style={{ marginBottom: 4 }}>• {i}</div>)}</div>)}
      </div>
      <div className="row wrap" style={{ marginBottom: 10 }}>
        <button className={!cat ? 'on sm' : 'sm'} onClick={() => setCat('')}>Tümü</button>
        {cats.map(c => <button key={c} className={cat === c ? 'on sm' : 'sm'} onClick={() => setCat(c)}>{c}</button>)}
        <span className="sp" /><input placeholder="Ara…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table><thead><tr><th>Proje</th><th>Kategori</th><th>Ne işe yarar</th><th>Lisans</th><th>Donanım</th><th>Durum</th></tr></thead>
          <tbody>{list.map(t => <tr key={t.repo}>
            <td><b>{t.name}</b><br /><a className="small mono" style={{ color: 'var(--info)' }} href={`https://github.com/${t.repo}`} target="_blank" rel="noreferrer">{t.repo}</a></td>
            <td className="small muted">{t.cat}</td><td className="small">{t.what}</td><td className="small mono">{t.license}</td><td className="small">{t.hw ?? '—'}</td>
            <td><span className={'chip ' + COLORS[t.status]}>{t.status}</span></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
