import { describe, expect, it } from 'vitest';
import { buildSrt, srtTime, hashtags, thumbnailPrompt, editList, hook, caption } from '../src/engine/publish';
import { buildCards, dueCards, grade, INTERVAL_DAYS } from '../src/engine/review';
import { sampleProject, defaultProgress } from '../src/model/factory';
import { TEXTURE_LINE } from '../src/content';
import { runRules } from '../src/engine/rules';

describe('publish package', () => {
  const p = sampleProject();
  it('formats SRT time', () => { expect(srtTime(63.5)).toBe('00:01:03,500'); });
  it('places subtitles on the absolute timeline across parts', () => {
    const srt = buildSrt(p, 10);
    expect(srt).toContain('1\n00:00:03,000 --> ');
    expect(srt).toContain('2\n00:00:14,000 --> ');
    expect(srt).toContain('Gitmek zorunda mısın?');
  });
  it('makes 12 or fewer unique hashtags including the title words', () => {
    const h = hashtags(p);
    expect(h.length).toBeLessThanOrEqual(12); expect(new Set(h).size).toBe(h.length);
    expect(h).toContain('#istasyonda');
  });
  it('thumbnail prompt is a single-face close-up, no text, texture line last, clean of rule errors', () => {
    const t = thumbnailPrompt(p, 'nano-banana-2');
    expect(t.en).toContain('Close-up'); expect(t.en).toContain('no text in the image');
    expect(t.en.trim().endsWith(TEXTURE_LINE)).toBe(true);
    expect(runRules({ text: t.en }).filter((r) => r.severity === 'error')).toEqual([]);
  });
  it('edit list covers every part and the total', () => {
    const e = editList(p, 10);
    expect(e.length).toBe(4); expect(e[3]).toContain('0:30');
  });
  it('hook and caption come from the scene', () => {
    expect(hook(p)).toContain('İlk 3 saniye');
    expect(caption(p)).toContain('Gitmek zorunda mısın?');
  });
});

describe('spaced repetition', () => {
  it('builds cards from weak rules, favourites and the glossary', () => {
    const pr = { ...defaultProgress(), ruleHits: { 'light.source-direction': 3 }, favorites: ['angle.low'] };
    const cards = buildCards(pr);
    expect(cards[0].id).toBe('r:light.source-direction');
    expect(cards.some((c) => c.id === 'c:angle.low')).toBe(true);
  });
  it('shows due cards first and limits new ones', () => {
    const cards = buildCards(defaultProgress());
    const now = 1_000_000;
    const due = { [cards[3].id]: now - 1 };
    const list = dueCards(cards, due, now, 5);
    expect(list[0].id).toBe(cards[3].id); expect(list.length).toBe(6);
  });
  it('moves cards up a box when known and back to box 1 when missed', () => {
    let s = grade({}, {}, 'x', true, 0);
    expect(s.box.x).toBe(1); expect(s.due.x).toBe(INTERVAL_DAYS[1] * 86_400_000);
    s = grade(s.box, s.due, 'x', true, 0); expect(s.box.x).toBe(2);
    s = grade(s.box, s.due, 'x', false, 0); expect(s.box.x).toBe(1);
  });
});
