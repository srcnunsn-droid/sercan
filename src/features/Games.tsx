import { useMemo, useState } from 'react';
import type { Game } from '../content';
import { CATALOG_BY_ID } from '../content';
import { FaceLight, FramePreview } from '../ui/FramePreview';
import { useApp } from '../store/app';
import { runRules } from '../engine/rules';

type Done = (score: number) => void;
const shuffle = <T,>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);

function SliderGame({ game, onDone }: { game: Extract<Game, { type: 'slider' }>; onDone: Done }) {
  const [i, setI] = useState(0);
  const r = game.rounds[i];
  const [v, setV] = useState(Math.round((r.min + r.max) / 2));
  const [res, setRes] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const addXp = useApp((s) => s.addXp);
  const check = () => { const ok = Math.abs(v - r.target) <= r.tolerance; setRes(ok); if (ok) { setScore((x) => x + 1); addXp(10); } };
  const next = () => { if (i + 1 >= game.rounds.length) { onDone((score) / game.rounds.length); return; } const n = game.rounds[i + 1]; setI(i + 1); setV(Math.round((n.min + n.max) / 2)); setRes(null); };
  return (
    <div className="stack">
      <p className="eyebrow">Tur {i + 1}/{game.rounds.length}</p>
      <h4>{r.askTr}</h4>
      <div className="grid two">
        <div className="viewport" style={{ aspectRatio: r.param === 'kelvin' ? '3 / 4' : '16 / 9', maxWidth: r.param === 'kelvin' ? 260 : '100%' }}>
          {r.param === 'kelvin'
            ? <FaceLight light={{ source: 'window', kelvin: v, hardness: 'yumusak', direction: 'front-left' }} />
            : <FramePreview params={{ height: 1.6, distance: 2.4 * (v / 50), targetY: 1.55, lensMm: v }} figures={1} overlays={false} />}
        </div>
        <div className="stack">
          <label className="field" htmlFor="game-slider"><span>{r.param === 'kelvin' ? 'Renk sıcaklığı' : 'Odak uzaklığı'}<em className="mono" style={{ fontStyle: 'normal' }}>{v}{r.param === 'kelvin' ? 'K' : ' mm'}</em></span>
            <input id="game-slider" type="range" min={r.min} max={r.max} step={r.step} value={v} disabled={res !== null} onChange={(e) => setV(Number(e.target.value))} />
          </label>
          {res === null ? <button className="btn primary" onClick={check}>Kontrol et</button> : (
            <>
              <p className={`feedback ${res ? 'good' : 'bad'}`}>{res ? 'Tam isabet! ' : `Hedef ${r.target}${r.param === 'kelvin' ? 'K' : ' mm'} civarıydı. `}{r.whyTr}</p>
              <button className="btn primary" onClick={next}>{i + 1 >= game.rounds.length ? 'Oyunu bitir' : 'Sonraki tur'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchGame({ game, onDone }: { game: Extract<Game, { type: 'match' }>; onDone: Done }) {
  const rights = useMemo(() => shuffle(game.pairs.map((p) => p.right)), [game.id]);
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState('');
  const addXp = useApp((s) => s.addXp);
  const pick = (right: string) => {
    if (left === null) return;
    const pair = game.pairs[left];
    if (pair.right === right) {
      const nd = { ...done, [left]: true }; setDone(nd); setMsg(pair.whyTr); setLeft(null); addXp(5);
      if (Object.keys(nd).length === game.pairs.length) setTimeout(() => onDone(Math.max(0, 1 - mistakes / game.pairs.length)), 700);
    } else { setWrong(right); setMistakes((m) => m + 1); setTimeout(() => setWrong(null), 600); }
  };
  return (
    <div className="stack">
      <p className="muted">Soldan birini, sonra sağdan eşini seç.</p>
      <div className="match">
        <div className="choices">{game.pairs.map((p, i) => <button key={p.left} className="choice" disabled={done[i]} data-state={done[i] ? 'right' : left === i ? 'picked' : undefined} onClick={() => setLeft(i)}>{p.left}</button>)}</div>
        <div className="choices">{rights.map((r) => { const used = game.pairs.some((p, i) => done[i] && p.right === r); return <button key={r} className="choice" disabled={used} data-state={used ? 'right' : wrong === r ? 'wrong' : undefined} onClick={() => pick(r)}>{r}</button>; })}</div>
      </div>
      {msg && <p className="feedback good">{msg}</p>}
    </div>
  );
}

export function ContradictionGame({ game, onDone }: { game: { items: { text: string; tr: string; bad: boolean; whyTr: string }[] }; onDone: Done }) {
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);
  const addXp = useApp((s) => s.addXp);
  const recordRuleHits = useApp((s) => s.recordRuleHits);
  const correct = game.items.filter((it, i) => !!marked[i] === it.bad).length;
  return (
    <div className="stack">
      <p className="muted">Çelişen cümlelere dokun, sonra kontrol et.</p>
      <div className="choices">
        {game.items.map((it, i) => {
          const state = checked ? (!!marked[i] === it.bad ? 'right' : 'wrong') : marked[i] ? 'picked' : undefined;
          return (
            <button key={i} className="choice" data-state={state} aria-pressed={!!marked[i]} disabled={checked} onClick={() => setMarked({ ...marked, [i]: !marked[i] })}>
              <span className="mono" style={{ fontSize: 13 }}>{it.text}</span><br /><span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{it.tr}</span>
              {checked && <><br /><span style={{ fontSize: 'var(--fs-sm)' }}>{it.bad ? '⚠ ' : '✓ '}{it.whyTr}</span></>}
            </button>
          );
        })}
      </div>
      {!checked ? <button className="btn primary" onClick={() => { setChecked(true); addXp(correct * 5); const missed = game.items.filter((it, i) => it.bad && !marked[i]); recordRuleHits(missed.flatMap((it) => runRules({ text: it.text }).filter((r) => r.ruleId !== 'text.texture-line').map((r) => r.ruleId))); }}>Kontrol et</button>
        : <><p className={`feedback ${correct === game.items.length ? 'good' : 'bad'}`}>{correct}/{game.items.length} doğru.</p><button className="btn primary" onClick={() => onDone(correct / game.items.length)}>Devam</button></>}
    </div>
  );
}

function DuelGame({ game, onDone }: { game: Extract<Game, { type: 'duel' }>; onDone: Done }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const addXp = useApp((s) => s.addXp);
  const r = game.rounds[i];
  const choose = (x: 'a' | 'b') => { if (pick) return; setPick(x); if (x === r.correct) { setScore((s) => s + 1); addXp(10); } };
  return (
    <div className="stack">
      <p className="eyebrow">Düello {i + 1}/{game.rounds.length}</p>
      <h4>{r.askTr}</h4>
      <div className="grid two">
        {(['a', 'b'] as const).map((k) => {
          const o = r[k]; const e = CATALOG_BY_ID[o.catalogId];
          const state = pick ? (k === r.correct ? 'right' : pick === k ? 'wrong' : undefined) : undefined;
          return (
            <button key={k} className="choice" data-state={state} onClick={() => choose(k)} style={{ padding: 8 }}>
              {e && <div className="viewport" style={{ aspectRatio: '16 / 9', marginBottom: 8, maxWidth: '100%' }}><FramePreview params={e.three} animate overlays={false} figures={e.three.two || e.three.ots ? 2 : 1} /></div>}
              <b>{o.label}</b>
            </button>
          );
        })}
      </div>
      {pick && <><p className={`feedback ${pick === r.correct ? 'good' : 'bad'}`}>{r.whyTr}</p>
        <button className="btn primary" onClick={() => { if (i + 1 >= game.rounds.length) onDone(score / game.rounds.length); else { setI(i + 1); setPick(null); } }}>{i + 1 >= game.rounds.length ? 'Oyunu bitir' : 'Sonraki'}</button></>}
    </div>
  );
}

export function GameRunner({ game, onDone }: { game: Game; onDone: Done }) {
  switch (game.type) {
    case 'slider': return <SliderGame game={game} onDone={onDone} />;
    case 'match': return <MatchGame game={game} onDone={onDone} />;
    case 'contradiction': return <ContradictionGame game={game} onDone={onDone} />;
    case 'duel': return <DuelGame game={game} onDone={onDone} />;
  }
}
