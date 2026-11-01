import { useRef, useState } from 'react';
import { copyText } from '../lib/files';
import { t } from '../i18n';
import { Icon } from './Icon';

export function CopyButton({ text, targetRef, small }: { text: string; targetRef?: React.RefObject<HTMLElement | null>; small?: boolean }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fallback'>('idle');
  return (
    <button
      type="button"
      className={`btn ${small ? 'sm' : ''} copy`}
      aria-label={t('common.copy')}
      onClick={async () => {
        const ok = await copyText(text);
        if (!ok && targetRef?.current) {
          const range = document.createRange();
          range.selectNodeContents(targetRef.current);
          const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range);
        }
        setState(ok ? 'ok' : 'fallback');
        setTimeout(() => setState('idle'), 1800);
      }}
    >
      <Icon name={state === 'ok' ? 'check' : 'copy'} size={16} />
      <span className={small ? 'sr-only' : ''}>{state === 'ok' ? t('common.copied') : state === 'fallback' ? t('common.copyFallback') : t('common.copy')}</span>
    </button>
  );
}

/** English prompt with its Turkish meaning directly underneath, one-tap copy. */
export function PromptBlock({ en, tr, label, legend }: { en: string; tr?: string; label?: string; legend?: string[] }) {
  const ref = useRef<HTMLPreElement>(null);
  return (
    <div className="prompt">
      {label && <div className="prompt-label"><span className="eyebrow">{label}</span></div>}
      {legend && legend.length > 0 && <div className="row" role="group" aria-label="Yüklenecek referans görseller">{legend.map((l) => <span key={l} className="chip static mono" style={{ fontSize: 12 }}>{l}</span>)}</div>}
      <div style={{ position: 'relative' }}>
        <pre ref={ref} lang="en">{en}</pre>
        <CopyButton text={en} targetRef={ref} small />
      </div>
      {tr && <div className="tr" lang="tr"><span className="eyebrow">Türkçesi</span><br />{tr}</div>}
    </div>
  );
}
