import type { RuleResult } from '../model/types';
import { useApp } from '../store/app';
import { t } from '../i18n';
import { LESSON_BY_ID } from '../content';

const SEV_TR = { error: 'Hata', warn: 'Uyarı', tip: 'İpucu' } as const;

export function RuleList({ results, onFixText, empty }: { results: RuleResult[]; onFixText?: (text: string) => void; empty?: string }) {
  const applyFix = useApp((s) => s.applyFix);
  const go = useApp((s) => s.go);
  const openLesson = useApp((s) => s.openLesson);
  if (!results.length) return <p className="feedback good">{empty ?? 'Çelişki bekçisi: sorun yok.'}</p>;
  return (
    <ul className="rules" aria-label="Çelişki bekçisi">
      {results.map((r, i) => (
        <li className="rule" key={r.ruleId + i}>
          <span className={`sev ${r.severity}`}>{SEV_TR[r.severity]}</span>
          <div>
            <p>{r.messageTr}</p>
            <p className="why">{r.fixTr}</p>
          </div>
          <div className="rule-actions">
            {r.graphFix && <button className="btn sm primary" onClick={() => applyFix(r.graphFix!)}>{t('common.fix')}</button>}
            {r.fixText && onFixText && <button className="btn sm primary" onClick={() => onFixText(r.fixText!)}>{t('common.fix')}</button>}
            {r.lessonId && LESSON_BY_ID[r.lessonId] && (
              <button className="btn sm ghost" onClick={() => { openLesson(r.lessonId!); go('academy'); }}>{t('common.learnThis')}</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
