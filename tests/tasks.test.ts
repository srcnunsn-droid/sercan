import { describe, expect, it } from 'vitest';
import { runTask, TASKS } from '../src/ai/tasks';
import type { AIProvider, TaskName } from '../src/ai/types';
import { TEXTURE_LINE } from '../src/content';

const fake = (answers: unknown[]): AIProvider & { calls: number } => {
  const p = { id: 'claude-artifact' as const, labelTr: 'test', calls: 0, async available() { return true; }, async json() { const a = answers[Math.min(p.calls, answers.length - 1)]; p.calls++; if (a instanceof Error || (a && typeof a === 'object' && 'code' in (a as any))) throw a; return a; } };
  return p;
};
const INPUTS: Record<TaskName, any> = {
  evaluatePrompt: { text: 'A mysterious man on a bridge', goal: 'x' },
  translateToEnglish: { text: 'yakın plan, soldan sıcak ışık' },
  tutor: { question: 'alt açı nedir', topic: 'kamera' },
  generateExercise: { topic: 'ışık', level: 1, weak: [] },
  suggestIdeas: { hint: 'veda' },
  writeStoryPlan: { idea: 'İstasyonda veda' },
  dialogueDoctor: { line: 'Gitmek zorunda mısın?', sec: 10 },
  continuityAudit: { parts: '1: night; 2: day' },
  diagnoseResult: { prompt: `Scene: x\n${TEXTURE_LINE}` },
  draftModelCard: { name: 'Yeni Model', docs: 'Video model, 8 seconds per clip, use @image1 references' },
  publishCopy: { title: 'İstasyonda veda (örnek)', template: 'Duygusal diyaloglu 30 sn', hook: 'İlk 3 saniye: el camda.', dialogue: ['Gitmek zorunda mısın?'], caption: '“Gitmek zorunda mısın?”', hashtags: ['#veda', '#yapayzeka'] },
};

describe('Claude task layer', () => {
  for (const name of Object.keys(TASKS) as TaskName[]) {
    it(`${name}: offline template output passes its own schema`, () => {
      const def = TASKS[name];
      expect(def.valid(def.template(INPUTS[name]))).toBe(true);
    });
  }
  it('uses a valid Claude answer', async () => {
    const p = fake([{ en: 'close-up, warm light from the left' }]);
    const r = await runTask(p, 'translateToEnglish', { text: 'test-valid' });
    expect(r.source).toBe('claude'); expect(p.calls).toBe(1);
  });
  it('retries once on an invalid shape, then falls back to the template', async () => {
    const p = fake([{ wrong: 1 }, { still: 'wrong' }]);
    const r = await runTask(p, 'translateToEnglish', { text: 'yakın plan test' });
    expect(p.calls).toBe(2); expect(r.source).toBe('template'); expect(r.value.en).toContain('close-up');
  });
  it('falls back immediately when Claude is not allowed', async () => {
    const p = fake([{ code: 'not_granted', message: 'no' }]);
    const r = await runTask(p, 'suggestIdeas', { hint: 'x' });
    expect(p.calls).toBe(1); expect(r.source).toBe('template'); expect(r.value.ideas.length).toBe(5);
  });
  it('never caches calls that carry images', async () => {
    const p = fake([{ problemsTr: ['yüz kaydı'], fixEn: 'fix', fixTr: 'düzelt' }]);
    await runTask(p, 'diagnoseResult', { prompt: 'p' }, { images: [new Blob(['x'], { type: 'image/png' })] });
    await runTask(p, 'diagnoseResult', { prompt: 'p' }, { images: [new Blob(['x'], { type: 'image/png' })] });
    expect(p.calls).toBe(2);
  });
  it('offline model card draft reads duration and reference syntax from the pasted docs', () => {
    const d = TASKS.draftModelCard.template(INPUTS.draftModelCard);
    expect(d).toMatchObject({ kind: 'video', partSec: 8, refSyntax: '@image-N' });
  });
});
