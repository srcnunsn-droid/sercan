import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ROUTES, routeFromHash, useApp, type Route } from './store/app';
import { t } from './i18n';
import { Icon } from './ui/Icon';
import { ErrorBoundary } from './ui/misc';
import { Home } from './features/Home';
import { CATALOG, ALL_LESSONS } from './content';

const Academy = lazy(() => import('./features/Academy').then((m) => ({ default: m.Academy })));
const Studio = lazy(() => import('./features/Studio').then((m) => ({ default: m.Studio })));
const Factory = lazy(() => import('./features/Factory').then((m) => ({ default: m.Factory })));
const Library = lazy(() => import('./features/Library').then((m) => ({ default: m.Library })));
const Settings = lazy(() => import('./features/Settings').then((m) => ({ default: m.Settings })));

const ICON: Record<Route, string> = { home: 'home', academy: 'academy', studio: 'studio', factory: 'factory', library: 'library', settings: 'settings' };

function useThemeAttr() {
  const theme = useApp((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', theme);
  }, [theme]);
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useApp.getState();
      const mod = e.ctrlKey || e.metaKey;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '');
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); s.togglePalette(); return; }
      if (e.key === 'Escape' && s.paletteOpen) { s.togglePalette(false); return; }
      if (typing) return;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); s.undo(); return; }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); s.redo(); return; }
      if (!mod && !e.altKey && /^[1-6]$/.test(e.key)) s.go(ROUTES[Number(e.key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function useHashRoute() {
  useEffect(() => {
    const read = () => { const r = routeFromHash(location.hash.replace('#', '')); if (r) useApp.setState({ route: r }); };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
}

function Palette() {
  const open = useApp((s) => s.paletteOpen);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const s = useApp.getState();
  const items = useMemo(() => {
    const base: { label: string; hint: string; run: () => void }[] = [
      ...ROUTES.map((r, i) => ({ label: t(`nav.${r}`), hint: `${i + 1}`, run: () => s.go(r) })),
      { label: 'Yeni proje', hint: 'Kütüphane', run: () => { s.newProject(); s.go('factory'); } },
      { label: 'Geri al', hint: 'Ctrl+Z', run: () => s.undo() },
      { label: 'Yinele', hint: 'Ctrl+Y', run: () => s.redo() },
      { label: 'Tema: koyu', hint: 'Ayarlar', run: () => s.setTheme('dark') },
      { label: 'Tema: açık', hint: 'Ayarlar', run: () => s.setTheme('light') },
      ...ALL_LESSONS.map((l) => ({ label: `Ders: ${l.titleTr}`, hint: l.id.toUpperCase(), run: () => { s.openLesson(l.id); s.go('academy'); } })),
      ...CATALOG.map((c) => ({ label: `${c.tr} · ${c.en}`, hint: 'Katalog', run: () => { useApp.setState({ route: 'studio' }); window.dispatchEvent(new CustomEvent('seco:catalog', { detail: c.id })); s.togglePalette(false); } })),
    ];
    const n = q.trim().toLocaleLowerCase('tr');
    return (n ? base.filter((i) => i.label.toLocaleLowerCase('tr').includes(n)) : base).slice(0, 40);
  }, [q]);
  useEffect(() => { setActive(0); }, [q]);
  if (!open) return null;
  const run = (i: number) => { items[i]?.run(); s.togglePalette(false); setQ(''); };
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Komut paleti" onMouseDown={(e) => { if (e.target === e.currentTarget) s.togglePalette(false); }}>
      <div className="palette">
        <input
          autoFocus id="palette-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('palette.placeholder')} aria-label="Komut ara"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            if (e.key === 'Enter') run(active);
          }}
        />
        <ul>
          {items.length === 0 && <li className="muted" style={{ padding: 16 }}>{t('palette.empty')}</li>}
          {items.map((it, i) => (
            <li key={it.label + i}><button data-active={i === active} onMouseEnter={() => setActive(i)} onClick={() => run(i)}><span>{it.label}</span><span className="kbd">{it.hint}</span></button></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return <div className="toasts" aria-live="polite">{toasts.map((x) => <div key={x.id} className={`toast ${x.kind}`}>{x.text}</div>)}</div>;
}

export function SaveIndicator() {
  const saveState = useApp((s) => s.saveState);
  const cloud = useApp((s) => s.cloudStatus);
  return (
    <span className="savepill" data-state={saveState} title={cloud === 'cloud' ? t('common.cloud') : t('common.local')}>
      <i /> {saveState === 'saving' ? t('common.saving') : t('common.saved')} · {cloud === 'cloud' ? 'hesap' : cloud === 'checking' ? '…' : 'tarayıcı'}
    </span>
  );
}

export function App() {
  const route = useApp((s) => s.route);
  const go = useApp((s) => s.go);
  useThemeAttr(); useShortcuts(); useHashRoute();
  useEffect(() => { useApp.getState().hydrateFromCloud(); }, []);

  const Page = { home: Home, academy: Academy, studio: Studio, factory: Factory, library: Library, settings: Settings }[route];
  return (
    <div className="shell">
      <nav className="rail" aria-label="Ana gezinme">
        <div className="brand"><span className="brand-mark" aria-hidden="true">SF</span><span className="brand-name">SECO Film<small>ATÖLYESİ</small></span></div>
        <div className="navlist">
          {ROUTES.map((r, i) => (
            <button key={r} className="navbtn" aria-current={route === r ? 'page' : undefined} onClick={() => go(r)}>
              <Icon name={ICON[r]} /> <span>{t(`nav.${r}`)}</span><span className="spacer" /><span className="kbd" aria-hidden="true">{i + 1}</span>
            </button>
          ))}
        </div>
        <div className="rail-foot">
          <SaveIndicator />
          <button className="btn sm ghost" onClick={() => useApp.getState().togglePalette(true)} style={{ justifyContent: 'space-between' }}><span>Komut paleti</span><span className="kbd">Ctrl K</span></button>
        </div>
      </nav>
      <main className="main" id="main">
        <div className="stage page-enter" key={route}>
          <ErrorBoundary area={t(`nav.${route}`)}>
            <Suspense fallback={<div className="skeleton" style={{ height: 320 }} role="status" aria-label="Yükleniyor" />}>
              <Page />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <nav className="tabbar" aria-label="Alt gezinme">
        {ROUTES.map((r) => (
          <button key={r} className="tabbtn" aria-current={route === r ? 'page' : undefined} onClick={() => go(r)}>
            <Icon name={ICON[r]} size={22} /><span>{t(`nav.${r}.short`)}</span>
          </button>
        ))}
      </nav>
      <Palette />
      <Toasts />
    </div>
  );
}
