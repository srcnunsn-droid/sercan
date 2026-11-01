// Spaced repetition (Leitner boxes 1..5). Cards come from the glossary, favourite catalog entries
// and the rules the learner breaks most often, so practice follows the weak-spot map.
import { CATALOG_BY_ID, GLOSSARY, RULES_META } from '../content';
import type { Progress } from '../model/types';

export interface ReviewCard { id: string; kind: 'term' | 'camera' | 'rule'; frontTr: string; frontEn?: string; backTr: string }
export const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const DAY = 86_400_000;

export function buildCards(progress: Progress): ReviewCard[] {
  const cards: ReviewCard[] = [];
  const weak = Object.entries(progress.ruleHits).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  for (const id of weak) {
    const m = RULES_META.find((r) => r.id === id); if (!m) continue;
    cards.push({ id: `r:${id}`, kind: 'rule', frontTr: `${m.group} kuralı: bu hatayı nasıl düzeltirsin?`, frontEn: m.fixTr, backTr: `${m.whyTr} Düzeltme: ${m.fixTr}` });
  }
  for (const id of progress.favorites) {
    const e = CATALOG_BY_ID[id]; if (!e) continue;
    cards.push({ id: `c:${id}`, kind: 'camera', frontTr: `“${e.en}” ne demek, hangi duyguyu verir?`, frontEn: e.promptEn, backTr: `${e.tr}: ${e.descTr}` });
  }
  for (const g of GLOSSARY) cards.push({ id: `g:${g.en}`, kind: 'term', frontTr: `“${g.en}” Türkçede ne demek?`, frontEn: g.en, backTr: `${g.tr}: ${g.descTr}` });
  return cards;
}

/** Due cards first (oldest due first), then up to `newPerDay` unseen cards. */
export function dueCards(cards: ReviewCard[], due: Record<string, number>, now = Date.now(), newPerDay = 5): ReviewCard[] {
  const seen = cards.filter((c) => due[c.id] !== undefined && due[c.id] <= now).sort((a, b) => due[a.id] - due[b.id]);
  const fresh = cards.filter((c) => due[c.id] === undefined).slice(0, newPerDay);
  return [...seen, ...fresh];
}

export function grade(box: Record<string, number>, due: Record<string, number>, id: string, knew: boolean, now = Date.now()) {
  const b = knew ? Math.min(5, (box[id] ?? 0) + 1) : 1;
  return { box: { ...box, [id]: b }, due: { ...due, [id]: now + INTERVAL_DAYS[b] * DAY } };
}
