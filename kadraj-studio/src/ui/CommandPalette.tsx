import { useEffect, useMemo, useRef, useState } from 'react';
import { commandList, direct } from '../ai/director';
import { S } from '../store';

const EXAMPLES = [
  '"YAZ GELDİ" başlık ekle, noir grade uygula, glitch efekti ekle',
  'müzik ekle enerjik 124 bpm',
  'dikey format yap, youtube intro şablonu ekle',
  'sessizlikleri kes',
  'ken burns, solma geçiş ekle',
  'whoosh sesi ekle, 5 saniyeye git',
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState(''); const [i, setI] = useState(0); const [busy, setBusy] = useState(false); const inp = useRef<HTMLInputElement>(null);
  const all = useMemo(commandList, []);
  const lq = q.toLocaleLowerCase('tr');
  const list = useMemo(() => !q ? all.slice(0, 40) : all.filter(c => lq.split(/\s+/).every(w => (c.label + ' ' + c.keys).toLocaleLowerCase('tr').includes(w))).slice(0, 40), [q]);
  useEffect(() => { inp.current?.focus(); }, []);
  const runDirect = async () => {
    setBusy(true); const r = await direct(q); setBusy(false);
    if (r.fail.length) S().notify(`${r.ok} komut uygulandı · anlaşılamayan: "${r.fail.join('", "')}"`); else S().notify(`🎬 Yönetmen: ${r.ok} komut uygulandı`);
    onClose();
  };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(list.length, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(0, x - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (i === 0 && q.trim()) runDirect(); else { const c = list[q.trim() ? i - 1 : i]; if (c) { onClose(); c.run(); } } }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0008', zIndex: 100, display: 'flex', justifyContent: 'center', paddingTop: '12vh' }} onPointerDown={onClose}>
      <div className="card" style={{ width: 'min(680px, 92vw)', maxHeight: '70vh', display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 30px 80px #000c' }} onPointerDown={e => e.stopPropagation()}>
        <div className="row" style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 18 }}>🎬</span>
          <input ref={inp} className="grow" style={{ fontSize: 15, border: 'none', background: 'transparent' }} placeholder="Yönetmene söyle… ya da komut ara (Türkçe, virgülle birden fazla)" value={q} onChange={e => { setQ(e.target.value); setI(0); }} onKeyDown={key} disabled={busy} />
          <span className="chip">Esc</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          {q.trim() && <div className={'row'} style={{ padding: '9px 14px', background: i === 0 ? 'var(--panel2)' : undefined, cursor: 'pointer' }} onClick={runDirect} onMouseEnter={() => setI(0)}>
            <b style={{ color: 'var(--acc)' }}>▶ Yönetmen:</b><span className="grow">“{q}”</span><span className="chip">Enter</span></div>}
          {list.map((c, k) => { const idx = q.trim() ? k + 1 : k; return (
            <div key={c.id} className="row" style={{ padding: '7px 14px', background: i === idx ? 'var(--panel2)' : undefined, cursor: 'pointer' }} onMouseEnter={() => setI(idx)} onClick={() => { onClose(); c.run(); }}>
              <span className="grow">{c.label}</span>{c.hint && <span className="chip">{c.hint}</span>}</div>); })}
          {!q && <div style={{ padding: 14, borderTop: '1px solid var(--line)' }}><h4 style={{ marginBottom: 6 }}>Örnek yönetmen komutları</h4>
            {EXAMPLES.map(e => <div key={e} className="small muted" style={{ cursor: 'pointer', padding: '3px 0' }} onClick={() => { setQ(e); setI(0); }}>› {e}</div>)}</div>}
        </div>
      </div>
    </div>
  );
}
