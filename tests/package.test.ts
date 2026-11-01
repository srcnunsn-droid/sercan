import { describe, expect, it } from 'vitest';
import { buildPackage, estimateCredits } from '../src/engine/package';
import { sampleProject } from '../src/model/factory';
import { compilePart } from '../src/engine/compiler';
import { runRules } from '../src/engine/rules';
import { applyCardOverrides, MODEL_CARDS, TEXTURE_LINE } from '../src/content';

const opts = { imageCardId: 'nano-banana-2', videoCardId: 'seedance-2', prices: {}, defaultPrice: { image: 2, video: 30 } };

describe('scene package (İstasyonda veda acceptance)', () => {
  const p = sampleProject();
  const md = buildPackage(p, opts);
  it('contains every production step in order', () => {
    const order = ['## 1. Karakter', '## 2. Mekân', '## 3. Başlangıç', '## 4. Video', '## Replikler', '## Kontrol listesi', '## Kredi'].map((h) => md.indexOf(h));
    expect(order.every((x) => x >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it('has 2 sheets + 1 location + 3 frames + 3 videos = 9 prompts, each ending with the texture line', () => {
    const blocks = [...md.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1]);
    expect(blocks.length).toBe(9);
    blocks.forEach((b) => expect(b.trim().endsWith(TEXTURE_LINE)).toBe(true));
  });
  it('estimates credits from the price table', () => {
    expect(estimateCredits(p, opts)).toMatchObject({ images: 6, videos: 3, total: 6 * 2 + 3 * 30 });
    expect(estimateCredits(p, { ...opts, prices: { 'seedance-2': 10 } }).videoCredits).toBe(30);
  });
  it('video parts after the first continue from the previous final frame', () => {
    expect(compilePart(p, p.parts[1], 'seedance-2').en).toContain('continues directly from the final frame');
    expect(compilePart(p, p.parts[0], 'seedance-2').en).not.toContain('continues directly');
  });
});

describe('model cards', () => {
  it('GPT Image gets a JSON prompt that passes the texture rule', () => {
    const p = sampleProject();
    const en = compilePart(p, p.parts[0], 'gpt-image').en;
    expect(JSON.parse(en).texture).toBe(TEXTURE_LINE);
    expect(runRules({ text: en }, ['text.texture-line'])).toEqual([]);
  });
  it('user overrides change the live card list and can be reset', () => {
    applyCardOverrides({ 'seedance-2': { partSec: 15, verified: true } });
    expect(MODEL_CARDS.find((c) => c.id === 'seedance-2')!.partSec).toBe(15);
    applyCardOverrides({});
    expect(MODEL_CARDS.find((c) => c.id === 'seedance-2')!.partSec).toBe(10);
  });
});
