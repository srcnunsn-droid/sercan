import { useApp, rankOf, nextRank } from '../store/app';
import { ALL_LESSONS, CATALOG_BY_ID, RULES_META } from '../content';
import { t } from '../i18n';
import { FramePreview } from '../ui/FramePreview';
import { Icon } from '../ui/Icon';
import { SaveIndicator } from '../App';
import { Slate } from '../ui/misc';
import { buildCards, dueCards } from '../engine/review';

const FACTORY_STEPS = ['Fikir', 'Hikâye', 'Karakter', 'Mekân', 'Kareler', 'Onay', 'Video', 'Düzeltme', 'Yayın'];

export function Home() {
  const progress = useApp((s) => s.progress);
  const project = useApp((s) => s.project());
  const go = useApp((s) => s.go);
  const openLesson = useApp((s) => s.openLesson);
  const rank = rankOf(progress.xp);
  const nr = nextRank(progress.xp);
  const pct = nr ? Math.round(((progress.xp - rank.min) / (nr.min - rank.min)) * 100) : 100;
  const next = ALL_LESSONS.find((l) => progress.unlockedLessons.includes(l.id) && !progress.completedLessons.includes(l.id));
  const proposed = !next ? ALL_LESSONS.find((l) => !progress.unlockedLessons.includes(l.id)) : null;
  const weak = Object.entries(progress.ruleHits).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const demo = CATALOG_BY_ID['move.push-in'];
  const prefs = useApp((s) => s.prefs);
  const reviews = dueCards(buildCards(progress), prefs.reviewDue).length;

  return (
    <>
      <header className="topbar">
        <span className="eyebrow">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <SaveIndicator />
      </header>

      <section className="hero">
        <div className="stack" style={{ justifyContent: 'center', gap: 'var(--sp-4)' }}>
          <span className="eyebrow">Sinema ve prompt akademisi · Görsel ve video fabrikası</span>
          <h1 className="hero-title">Öğren. Sahneyi <em>canlı</em> kur. Promptu al.</h1>
          <p className="muted" style={{ maxWidth: '58ch' }}>
            Kamera açısını ve ışığı seç, sahne anında değişsin. Prompt İngilizce çıkar, Türkçesi hemen altında durur. Çelişki bekçisi hatayı üretimden önce yakalar.
          </p>
          <div className="row">
            <button className="btn primary" onClick={() => { if (next) openLesson(next.id); go('academy'); }}><Icon name="academy" /> {next ? `Derse devam: ${next.titleTr}` : 'Akademiye git'}</button>
            <button className="btn" onClick={() => go('studio')}><Icon name="studio" /> Stüdyoyu aç</button>
          </div>
        </div>
        <div className="viewport" style={{ aspectRatio: '16 / 10', maxWidth: '100%' }}>
          <FramePreview params={demo.three} animate figures={2} poses={['standing', 'reaching']} label="Canlı demo: yavaş yaklaşma" light={{ source: 'golden-sun', kelvin: 3500, hardness: 'sert', direction: 'back-left', secondary: null }} />
          <div className="hud"><span className="hud-tag rec">● REC</span><span className="hud-tag">{demo.tr}</span><span className="hud-tag">{demo.three.lensMm}mm</span></div>
        </div>
      </section>

      <section className="grid three">
        <div className="panel">
          <span className="eyebrow">{t('home.today')}</span>
          {next ? (
            <>
              <h3>{next.titleTr}</h3>
              <p className="muted">{next.goalTr}</p>
              <div className="row"><span className="chip static">{next.minutes} dk</span><span className="chip static">5 adım</span></div>
              <button className="btn primary" onClick={() => { openLesson(next.id); go('academy'); }}>{t('common.start')}</button>
            </>
          ) : proposed ? (
            <>
              <h3>Sıradaki konu hazır</h3>
              <p className="muted">“{proposed.titleTr}” seni bekliyor. Karar senin; hazır olduğunda başla.</p>
              <button className="btn primary" onClick={() => go('academy')}>Akademiye git</button>
            </>
          ) : <p className="muted">Faz 1 dersleri bitti. Yeni modüller yolda.</p>}
        </div>

        <div className="panel">
          <span className="eyebrow">{t('home.continue')}</span>
          <h3 style={{ fontSize: 'var(--fs-lg)' }}>{project.title}</h3>
          <Slate items={[['Adım', `${project.factory.step}/9`], ['Parça', project.parts.length], ['Karakter', project.characters.length]]} />
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Sıradaki: {FACTORY_STEPS[project.factory.step - 1]}</p>
          <div className="row">
            <button className="btn primary" onClick={() => go('factory')}>Fabrikada aç</button>
            <button className="btn" onClick={() => go('studio')}>Stüdyoda aç</button>
          </div>
        </div>

        <div className="panel">
          <span className="eyebrow">{t('home.rank')}</span>
          <div className="statline"><b>{rank.tr}</b><span className="muted tabnum">{progress.xp} XP</span></div>
          <div className="meter" aria-label="Rütbe ilerlemesi"><i style={{ width: `${pct}%` }} /></div>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{nr ? `${nr.min - progress.xp} XP ${t('home.toNext')} (${nr.tr})` : 'En yüksek rütbe!'}</p>
          <div className="statline"><b className="tabnum">{progress.streak}</b><span className="muted">{t('home.days')} · {t('home.streak')}</span></div>
          <button className="btn sm" onClick={() => go('academy')}>{reviews} tekrar kartı bekliyor</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h3>{t('home.weak')}</h3><button className="btn sm ghost" onClick={() => go('academy')}>Haritayı aç <Icon name="arrow" size={16} /></button></div>
        {weak.length ? (
          <div className="stack">
            {weak.map(([id, n]) => {
              const m = RULES_META.find((r) => r.id === id);
              return (
                <div className="weakbar" key={id}>
                  <span>{m?.group}: {m?.whyTr}</span>
                  <div className="meter"><i style={{ width: `${Math.min(100, n * 20)}%`, background: 'var(--warn)' }} /></div>
                  <span className="tabnum muted">{n}</span>
                </div>
              );
            })}
          </div>
        ) : <p className="muted">{t('home.weakEmpty')}</p>}
      </section>
    </>
  );
}
