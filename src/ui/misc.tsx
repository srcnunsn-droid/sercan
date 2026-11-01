import { Component, type ReactNode } from 'react';
import { GLOSSARY } from '../content';

export class ErrorBoundary extends Component<{ children: ReactNode; area: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(`[${this.props.area}]`, error); }
  render() {
    if (this.state.error) {
      return (
        <div className="panel" role="alert">
          <h3>{this.props.area} bölümü durdu</h3>
          <p className="muted">Uygulamanın geri kalanı çalışıyor. Projen kayıtlı. Bölümü yeniden açmayı dene.</p>
          <pre className="mono muted" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.message}</pre>
          <div><button className="btn primary" onClick={() => this.setState({ error: null })}>Yeniden aç</button></div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** English term with its Turkish explanation on hover/focus. */
export function Term({ en, children }: { en: string; children?: ReactNode }) {
  const g = GLOSSARY.find((x) => x.en.toLowerCase() === en.toLowerCase());
  if (!g) return <>{children ?? en}</>;
  return (
    <span className="term" tabIndex={0} role="note" aria-label={`${g.en}: ${g.tr}. ${g.descTr}`}>
      {children ?? en}
      <span className="tip" role="tooltip"><b>{g.tr}</b> · {g.descTr}</span>
    </span>
  );
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Slate({ items }: { items: [string, string | number][] }) {
  return <span className="slate">{items.map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}</span>;
}
