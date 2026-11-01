import { useMemo, useState } from 'react';
import { useApp, currentProvider } from '../store/app';
import { ALL_LESSONS, CATALOG_BY_ID, FUTURE_MODULES, GAME_BY_ID, GLOSSARY, INVISIBLE_WORDS, LIGHT_SOURCES, MODULES, RULES_META, TEXTURE_LINE, type Lesson } from '../content';
import { scorePrompt } from '../engine/rubric';
import { runRules } from '../engine/rules';
import { compilePart } from '../engine/compiler';
import { sampleProject } from '../model/factory';
import { runTask, type ExerciseOut } from '../ai/tasks';
import type { LightRig } from '../model/types';
import { FaceLight, FramePreview } from '../ui/FramePreview';
import { PromptBlock } from '../ui/Prompt';
import { RuleList } from '../ui/Rules';
import { Icon } from '../ui/Icon';
import { applyCatalogToPart } from './Studio';
import { ContradictionGame, GameRunner } from './Games';
import { buildCards, dueCards, grade } from '../engine/review';
import { t } from '../i18n';

const STEP_KEYS = ['demo', 'game', 'write', 'quiz', 'export'] as const;

function Demo({ lesson }: { lesson: Lesson }) {
  const [idx, setIdx] = useState(0);
  const [light, setLight] = useState<LightRig>({ source: 'candle', kelvin: 1900, hardness: 'yumusak', direction: 'front-left', secondary: null });
  const [text, setText] = useState('A ceiling lamp lights her face from below, cold blue candle glow.');
  const k = lesson.demo.kind;
  if (k === 'camera' && lesson.demo.catalogIds?.length) {
    const ids = lesson.demo.catalogIds; const e = CATALOG_BY_ID[ids[idx % ids.length]];
    return (
      <div className="stack">
        <p>{lesson.demo.textTr}</p>
        <div className="viewport" style={{ aspectRatio: '16 / 9', maxWidth: '100%' }}><FramePreview params={e.three} animate figures={e.three.two || e.three.ots ? 2 : 1} label={e.tr} /><div className="hud"><span className="hud-tag">{e.tr}</span><span className="hud-tag">{e.en}</span></div></div>
        <div className="row">{ids.map((id, i) => <button key={id} className="chip" aria-pressed={i === idx % ids.length} onClick={() => setIdx(i)}>{CATALOG_BY_ID[id].tr}</button>)}</div>
        <p className="muted">{e.descTr}</p>
      </div>
    );
  }
  if (k === 'light') return (
    <div className="grid two">
      <div className="viewport" style={{ aspectRatio: '3 / 4', maxWidth: 320 }}><FaceLight light={light} /></div>
      <div className="stack">
        <p>{lesson.demo.textTr}</p>
        <span className="eyebrow">Kaynak</span>
        <div className="row">{LIGHT_SOURCES.slice(0, 7).map((s) => <button key={s.id} className="chip" aria-pressed={light.source === s.id} onClick={() => setLight({ ...light, source: s.id, kelvin: s.kelvin, hardness: s.hardness, direction: s.allowed[0] as any })}>{s.tr}</button>)}</div>
        <span className="eyebrow">Yön</span>
        <div className="row">{(['left', 'front-left', 'front', 'right', 'top', 'bottom', 'back'] as const).map((d) => <button key={d} className="chip" aria-pressed={light.direction === d} onClick={() => setLight({ ...light, direction: d })}>{{ left: 'Sol', 'front-left': 'Sol ön', front: 'Ön', right: 'Sağ', top: 'Üst', bottom: 'Alt', back: 'Arka' }[d]}</button>)}</div>
        <span className="eyebrow">Sertlik</span>
        <div className="row">{(['sert', 'yumusak'] as const).map((h) => <button key={h} className="chip" aria-pressed={light.hardness === h} onClick={() => setLight({ ...light, hardness: h })}>{h === 'sert' ? 'Sert' : 'Yumuşak'}</button>)}</div>
      </div>
    </div>
  );
  if (k === 'boxes') {
    const p = sampleProject(); const c = compilePart(p, p.parts[0], 'universal');
    return (
      <div className="stack">
        <p>{lesson.demo.textTr}</p>
        <p className="feedback bad"><b>Dağınık:</b> “Sad epic goodbye at a train station, cinematic, beautiful light, 4k masterpiece”</p>
        <PromptBlock en={c.en} tr={c.tr} label="5 kutuya ayrılmış hâli" />
      </div>
    );
  }
  if (k === 'text') return (
    <div className="stack">
      <p>{lesson.demo.textTr}</p>
      {lesson.demo.exampleEn && <PromptBlock en={lesson.demo.exampleEn} tr={lesson.demo.exampleTr} label="Örnek" />}
    </div>
  );
  if (k === 'invisible') return (
    <div className="stack">
      <p>{lesson.demo.textTr}</p>
      <div className="grid two">{INVISIBLE_WORDS.filter((w) => w.lang === 'tr').slice(0, 6).map((w) => <div className="tile" key={w.word}><span className="sev error" style={{ alignSelf: 'start' }}>{w.word}</span><span>→ {w.visibleTr}</span><span className="mono muted" style={{ fontSize: 12 }}>{w.visibleEn}</span></div>)}</div>
    </div>
  );
  return (
    <div className="stack">
      <p>{lesson.demo.textTr}</p>
      <label className="field" htmlFor="demo-text"><span>Bir cümle yaz, bekçi anında okusun</span><textarea id="demo-text" className="textarea" value={text} onChange={(e) => setText(e.target.value)} /></label>
      <RuleList results={runRules({ text }).filter((r) => r.ruleId !== 'text.texture-line')} onFixText={setText} />
    </div>
  );
}

function Write({ lesson, onScored }: { lesson: Lesson; onScored: (n: number) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<{ reasonsTr: string[]; suggestionEn: string; suggestionTr: string; note?: string } | null>(null);
  const [scored, setScored] = useState(false);
  const recordRuleHits = useApp((s) => s.recordRuleHits);
  const addXp = useApp((s) => s.addXp);
  const r = useMemo(() => (scored ? scorePrompt(text) : null), [scored, text]);
  const evaluate = () => {
    const res = runRules({ text });
    recordRuleHits(res.filter((x) => x.severity !== 'tip').map((x) => x.ruleId));
    setScored(true);
    const s = scorePrompt(text).score;
    onScored(s);
    if (s >= 60) addXp(30, 'İyi prompt');
  };
  const askClaude = async () => {
    setBusy(true);
    try {
      const out = await runTask<{ reasonsTr: string[]; suggestionEn: string; suggestionTr: string }>(currentProvider(), 'evaluatePrompt', { text, goal: lesson.goalTr });
      setAi({ ...out.value, note: out.noteTr });
    } finally { setBusy(false); }
  };
  const L5 = { source: 'kaynak', direction: 'yön', color: 'renk', hardness: 'sertlik', shadow: 'gölge' } as const;
  const BX = { scene: 'Sahne', camera: 'Kamera', characters: 'Karakter', light: 'Işık', environment: 'Mekân' } as const;
  return (
    <div className="stack">
      <p className="feedback">{lesson.write.taskTr}</p>
      <label className="field" htmlFor="write-text"><span>Promptun (Türkçe ya da İngilizce)</span>
        <textarea id="write-text" className="textarea" value={text} onChange={(e) => { setText(e.target.value); setScored(false); }} placeholder={'Scene: …\nCamera: …\nCharacters: …\nLight: …\nEnvironment: …\n' + TEXTURE_LINE} />
      </label>
      <div className="row">
        <button className="btn primary" disabled={!text.trim()} onClick={evaluate}>Değerlendir</button>
        <button className="btn" disabled={!text.trim() || busy} onClick={askClaude}><Icon name="spark" size={16} /> {busy ? 'Claude düşünüyor…' : 'Claude’a da sor'}</button>
      </div>
      {r && (
        <div className="panel" style={{ background: 'var(--surface-2)' }}>
          <div className="statline"><b className="tabnum">{r.score}</b><span className="muted">/ 100 puan</span></div>
          <div className="row">{Object.entries(r.boxes).map(([k, v]) => <span key={k} className={`sev ${v ? 'ok' : 'error'}`}>{BX[k as keyof typeof BX]}</span>)}</div>
          <div className="row"><span className="eyebrow">Işığın 5 parçası</span>{Object.entries(r.light5).map(([k, v]) => <span key={k} className={`sev ${v ? 'ok' : 'warn'}`}>{L5[k as keyof typeof L5]}</span>)}</div>
          <RuleList results={runRules({ text })} onFixText={(x) => setText(x)} empty="Çelişki yok, doku satırı yerinde." />
        </div>
      )}
      {ai && (
        <div className="stack">
          {ai.note && <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{ai.note}</p>}
          <ul style={{ margin: 0, paddingLeft: 18 }}>{ai.reasonsTr.map((x) => <li key={x}>{x}</li>)}</ul>
          <PromptBlock en={ai.suggestionEn} tr={ai.suggestionTr} label="Önerilen sürüm (seninki değişmedi)" />
          <div><button className="btn sm" onClick={() => setText(ai.suggestionEn)}>Öneriyi metnime al</button></div>
        </div>
      )}
    </div>
  );
}

function Quiz({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const addXp = useApp((s) => s.addXp);
  const all = lesson.quiz.every((_, i) => ans[i] !== undefined);
  return (
    <div className="stack">
      {lesson.quiz.map((q, qi) => (
        <fieldset key={qi} className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 700, marginBottom: 8 }}>{qi + 1}. {q.qTr}</legend>
          <div className="choices">{q.options.map((o, oi) => {
            const picked = ans[qi] === oi; const done = ans[qi] !== undefined;
            return <button key={oi} className="choice" disabled={done} data-state={done ? (oi === q.answer ? 'right' : picked ? 'wrong' : undefined) : undefined} onClick={() => { setAns({ ...ans, [qi]: oi }); if (oi === q.answer) addXp(10); }}>{o}</button>;
          })}</div>
          {ans[qi] !== undefined && <p className={`feedback ${ans[qi] === q.answer ? 'good' : 'bad'}`}>{q.whyTr}</p>}
        </fieldset>
      ))}
      <div><button className="btn primary" disabled={!all} onClick={onDone}>{t('common.next')}</button></div>
    </div>
  );
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const [step, setStep] = useState(0);
  const openLesson = useApp((s) => s.openLesson);
  const completeLesson = useApp((s) => s.completeLesson);
  const unlockLesson = useApp((s) => s.unlockLesson);
  const progress = useApp((s) => s.progress);
  const addXp = useApp((s) => s.addXp);
  const editPart = useApp((s) => s.editPart);
  const go = useApp((s) => s.go);
  const toast = useApp((s) => s.toast);
  const [finished, setFinished] = useState(false);
  const game = GAME_BY_ID[lesson.gameId];
  const nextLesson = ALL_LESSONS[ALL_LESSONS.findIndex((l) => l.id === lesson.id) + 1];

  const finish = () => {
    if (!progress.completedLessons.includes(lesson.id)) { completeLesson(lesson.id); addXp(50, 'Ders tamamlandı'); }
    setFinished(true);
  };
  const exportToStudio = () => {
    editPart(0, (p) => {
      lesson.studio.catalogIds?.forEach((id) => CATALOG_BY_ID[id] && CATALOG_BY_ID[id].category !== 'aspect' && applyCatalogToPart(CATALOG_BY_ID[id], p));
      if (lesson.studio.light) p.light = { ...p.light, ...lesson.studio.light, direction: lesson.studio.light.direction as any };
    });
    finish();
    toast('Ders ayarları 1. parçaya aktarıldı.', 'ok');
    go('studio');
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">{lesson.id.toUpperCase()} · {lesson.minutes} dk</span><h3>{lesson.titleTr}</h3></div>
        <button className="btn sm ghost" onClick={() => openLesson(null)}>{t('common.close')}</button>
      </div>
      <p className="muted">{lesson.goalTr}</p>
      <div className="steps" role="list" aria-label="Ders adımları">
        {STEP_KEYS.map((k, i) => <div key={k} role="listitem" className="step" data-state={i < step || finished ? 'done' : i === step ? 'active' : 'todo'}><i />{t(`academy.steps.${k}`)}</div>)}
      </div>

      {finished ? (
        <div className="stack">
          <p className="feedback good"><b>Ders tamamlandı.</b> Rütbe puanın güncellendi.</p>
          {nextLesson && (
            progress.unlockedLessons.includes(nextLesson.id)
              ? <button className="btn primary" onClick={() => { openLesson(nextLesson.id); setStep(0); setFinished(false); }}>Sıradaki: {nextLesson.titleTr}</button>
              : <div className="tile"><span className="eyebrow">Öneri</span><p>Sıradaki konu: <b>{nextLesson.titleTr}</b>. {t('academy.suggestNext')}</p>
                  <div className="row"><button className="btn primary" onClick={() => { unlockLesson(nextLesson.id); openLesson(nextLesson.id); setStep(0); setFinished(false); }}>Başla</button><button className="btn" onClick={() => openLesson(null)}>Şimdilik burada kal</button></div></div>
          )}
        </div>
      ) : (
        <>
          {step === 0 && <Demo lesson={lesson} />}
          {step === 1 && game && <><h4>{game.titleTr}</h4><p className="muted">{game.introTr}</p><GameRunner key={game.id} game={game} onDone={() => setStep(2)} /></>}
          {step === 2 && <Write lesson={lesson} onScored={() => {}} />}
          {step === 3 && <Quiz lesson={lesson} onDone={() => setStep(4)} />}
          {step === 4 && (
            <div className="stack">
              <p>Öğrendiğini Stüdyo’da dene: ders ayarları projenin 1. parçasına aktarılır.</p>
              <div className="row"><button className="btn primary" onClick={exportToStudio}><Icon name="studio" /> Stüdyoya aktar</button><button className="btn" onClick={finish}>Aktarmadan bitir</button></div>
            </div>
          )}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>{t('common.back')}</button>
            {step < 4 && step !== 1 && step !== 3 && <button className="btn" onClick={() => setStep(step + 1)}>{t('common.next')} <Icon name="arrow" size={16} /></button>}
            {step === 1 && <button className="btn ghost" onClick={() => setStep(2)}>Oyunu atla</button>}
          </div>
        </>
      )}
    </section>
  );
}

function ExerciseLab() {
  const progress = useApp((s) => s.progress);
  const [ex, setEx] = useState<ExerciseOut | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const weak = Object.entries(progress.ruleHits).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const gen = async () => {
    setBusy(true);
    try {
      const out = await runTask<ExerciseOut>(currentProvider(), 'generateExercise', { topic: 'ışık ve kamera çelişkileri', level: Math.min(3, 1 + Math.floor(progress.xp / 400)), weak: weak.slice(0, 3) }, { noCache: true });
      setEx(out.value); setNote(out.source === 'claude' ? 'Claude yeni bir alıştırma üretti.' : out.noteTr ?? '');
    } finally { setBusy(false); }
  };
  return (
    <section className="panel">
      <div className="panel-head"><h3>Günlük meydan okuma</h3><button className="btn primary" disabled={busy} onClick={gen}><Icon name="spark" size={16} /> {busy ? 'Üretiliyor…' : t('academy.newExercise')}</button></div>
      <p className="muted">Zayıf noktalarına göre yeni bir çelişki avı. Claude yoksa şablon motoru hazırlar.</p>
      {note && <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{note}</p>}
      {ex && <><h4>{ex.titleTr}</h4><ContradictionGame key={JSON.stringify(ex.items)} game={ex} onDone={() => setEx(null)} /></>}
    </section>
  );
}

function ReviewCards() {
  const progress = useApp((s) => s.progress);
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const addXp = useApp((s) => s.addXp);
  const [shown, setShown] = useState(false);
  const cards = useMemo(() => buildCards(progress), [progress]);
  const due = dueCards(cards, prefs.reviewDue);
  const card = due[0];
  const answer = (knew: boolean) => {
    setPrefs((p) => { const g = grade(p.reviewBox, p.reviewDue, card.id, knew); p.reviewBox = g.box; p.reviewDue = g.due; });
    if (knew) addXp(3);
    setShown(false);
  };
  return (
    <section className="panel">
      <div className="panel-head"><h3>Tekrar kartları</h3><span className="chip static tabnum">{due.length} kart bugün</span></div>
      <p className="muted">Bildiğin kart daha seyrek gelir (1, 2, 4, 8, 16 gün). Bilemediğin yarın yine gelir. Zayıf noktaların öne alınır.</p>
      {!card ? <p className="feedback good">Bugünlük tekrar bitti. Yarın yeni kartlar gelecek.</p> : (
        <div className="tile" style={{ gap: 'var(--sp-3)' }}>
          <span className="eyebrow">{{ term: 'Terim', camera: 'Kamera', rule: 'Kural' }[card.kind]} · kutu {prefs.reviewBox[card.id] ?? 0}/5</span>
          <b style={{ fontSize: 'var(--fs-lg)' }}>{card.frontTr}</b>
          {card.frontEn && card.kind !== 'term' && <span className="mono muted" style={{ fontSize: 12 }}>{card.frontEn}</span>}
          {shown ? <>
            <p className="feedback good">{card.backTr}</p>
            <div className="row"><button className="btn primary" onClick={() => answer(true)}>Bildim</button><button className="btn" onClick={() => answer(false)}>Bilemedim</button></div>
          </> : <div><button className="btn primary" onClick={() => setShown(true)}>Cevabı göster</button></div>}
        </div>
      )}
    </section>
  );
}

function WeakMap() {
  const progress = useApp((s) => s.progress);
  const rows = RULES_META.map((m) => ({ m, n: progress.ruleHits[m.id] ?? 0 })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="panel">
      <h3>{t('academy.weakMap')}</h3>
      <p className="muted">Hangi kuralı ne sıklıkla çiğnediğin. Aynı kurallar Fabrika’da da seni uyarır.</p>
      <div className="stack">
        {rows.map(({ m, n }) => (
          <div className="weakbar" key={m.id}><span><b>{m.group}</b> · {m.whyTr}</span><div className="meter"><i style={{ width: `${(n / max) * 100}%`, background: n ? 'var(--warn)' : 'var(--surface-3)' }} /></div><span className="tabnum muted">{n}</span></div>
        ))}
      </div>
    </section>
  );
}

function Glossary() {
  const [q, setQ] = useState('');
  const [question, setQuestion] = useState('');
  const [ans, setAns] = useState<{ answerTr: string; followUpTr: string } | null>(null);
  const list = GLOSSARY.filter((g) => !q || `${g.en} ${g.tr} ${g.descTr}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')));
  return (
    <section className="panel">
      <h3>{t('academy.glossary')}</h3>
      <div className="grid two">
        <label className="field" htmlFor="gl-q"><span>Terim ara</span><input id="gl-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ör. bokeh, kenar ışığı" /></label>
        <form className="field" onSubmit={async (e) => { e.preventDefault(); if (!question.trim()) return; const out = await runTask<{ answerTr: string; followUpTr: string }>(currentProvider(), 'tutor', { question, topic: 'kamera ve ışık' }); setAns(out.value); }}>
          <label htmlFor="tutor-q" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--muted)' }}>Hocaya sor</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}><input id="tutor-q" className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Alt açı ne zaman kullanılır?" /><button className="btn primary" type="submit">Sor</button></div>
        </form>
      </div>
      {ans && <div className="feedback good"><p>{ans.answerTr}</p><p className="muted" style={{ marginTop: 6 }}>Mini soru: {ans.followUpTr}</p></div>}
      <div className="grid three">{list.map((g) => <div className="tile" key={g.en}><b>{g.tr}</b><span className="mono muted" style={{ fontSize: 12 }}>{g.en}</span><span style={{ fontSize: 'var(--fs-sm)' }}>{g.descTr}</span></div>)}</div>
    </section>
  );
}

export function Academy() {
  const active = useApp((s) => s.activeLessonId);
  const progress = useApp((s) => s.progress);
  const openLesson = useApp((s) => s.openLesson);
  const unlockLesson = useApp((s) => s.unlockLesson);
  const lesson = ALL_LESSONS.find((l) => l.id === active);
  const done = progress.completedLessons.length;
  return (
    <>
      <header className="topbar">
        <div className="stack" style={{ gap: 4 }}><span className="eyebrow">{done}/{ALL_LESSONS.length} ders · {progress.badges.length} rozet</span><h2>{t('academy.title')}</h2></div>
      </header>
      {lesson && <LessonPlayer key={lesson.id} lesson={lesson} />}
      <div className="grid two" style={{ alignItems: 'start' }}>
        {MODULES.map((m) => (
          <section className="panel" key={m.id}>
            <div className="panel-head"><div className="stack" style={{ gap: 4 }}><span className="eyebrow">{m.id.toUpperCase()}{progress.badges.includes(`badge.${m.id}`) && ' · 🏅 rozet'}</span><h3>{m.titleTr}</h3></div></div>
            <p className="muted">{m.subtitleTr}</p>
            <div className="stack" style={{ gap: 'var(--sp-2)' }}>
              {m.lessons.map((l, i) => {
                const st = progress.completedLessons.includes(l.id) ? 'done' : progress.unlockedLessons.includes(l.id) ? 'open' : 'locked';
                const prevDone = i === 0 ? (m.id === 'm1' || progress.completedLessons.includes(MODULES[MODULES.indexOf(m) - 1]?.lessons.at(-1)?.id ?? '')) : progress.completedLessons.includes(m.lessons[i - 1].id);
                return (
                  <div className="lessonrow" data-state={st} key={l.id}>
                    <span className="num">{st === 'done' ? '✓' : i + 1}</span>
                    <div><b>{l.titleTr}</b><p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{l.minutes} dk · {GAME_BY_ID[l.gameId]?.titleTr}</p></div>
                    {st === 'locked'
                      ? (prevDone ? <button className="btn sm" onClick={() => { unlockLesson(l.id); openLesson(l.id); }}>{t('academy.start')}</button> : <span className="muted" role="img" aria-label={t('academy.locked')}><Icon name="lock" size={18} /></span>)
                      : <button className={`btn sm ${st === 'open' ? 'primary' : ''}`} onClick={() => { openLesson(l.id); window.scrollTo({ top: 0 }); }}>{st === 'done' ? t('academy.review') : t('academy.start')}</button>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {FUTURE_MODULES.length > 0 && <section className="panel">
          <h3>Sıradaki modüller</h3>
          <div className="stack" style={{ gap: 'var(--sp-2)' }}>
            {FUTURE_MODULES.map((m) => <div className="lessonrow" data-state="locked" key={m.id}><span className="num">{m.id.slice(1)}</span><div><b>{m.titleTr}</b><p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{m.subtitleTr}</p></div><Icon name="lock" size={18} /></div>)}
          </div>
        </section>}
      </div>
      <ReviewCards />
      <ExerciseLab />
      <WeakMap />
      <Glossary />
    </>
  );
}
