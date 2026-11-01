// Experience notebook: learns, per model card, which prompt phrases went with good results
// (rating 3) and which with bad ones (rating 1). Pure counting, no guessing.
import { TEXTURE_LINE } from '../content';
import type { PromptBundle } from '../model/types';

export function fragments(en: string): string[] {
  const out = new Set<string>();
  for (const raw of en.split('\n')) {
    const line = raw.replace(/^\s*(Scene|Camera|Characters|Light|Environment)\s*:\s*/i, '').trim();
    if (!line || line === TEXTURE_LINE || line.startsWith('{')) continue;
    for (let f of line.split(/[,;]\s*|\.\s+/)) {
      f = f.toLowerCase().replace(/@image-\d+\s*/g, '').replace(/[."“”]/g, '').trim();
      if (f.length >= 4 && f.length <= 80 && !/^\d+-second shot$/.test(f)) out.add(f);
    }
  }
  return [...out];
}

export interface Patterns { cardId: string; rated: number; good: number; bad: number; keep: { text: string; n: number }[]; avoid: { text: string; n: number }[] }

export function learnPatterns(prompts: PromptBundle[], cardId: string, minCount = 2): Patterns {
  const mine = prompts.filter((p) => p.target === cardId && p.rating);
  const good = new Map<string, number>(); const bad = new Map<string, number>();
  for (const p of mine) {
    const bucket = p.rating === 3 ? good : p.rating === 1 ? bad : null;
    if (!bucket) continue;
    for (const f of fragments(p.en)) bucket.set(f, (bucket.get(f) ?? 0) + 1);
  }
  const keep = [...good].filter(([f, n]) => n >= minCount && !bad.has(f)).map(([text, n]) => ({ text, n })).sort((a, b) => b.n - a.n).slice(0, 8);
  const avoid = [...bad].filter(([f, n]) => n >= minCount && !good.has(f)).map(([text, n]) => ({ text, n })).sort((a, b) => b.n - a.n).slice(0, 8);
  return { cardId, rated: mine.length, good: mine.filter((p) => p.rating === 3).length, bad: mine.filter((p) => p.rating === 1).length, keep, avoid };
}
