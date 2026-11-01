import { describe, expect, it } from 'vitest';
import { migrateProject, MigrationError } from '../src/model/migrate';
import { sampleProject } from '../src/model/factory';
import { SCHEMA_VERSION } from '../src/model/types';
import { scorePrompt } from '../src/engine/rubric';
import { offlineTranslate } from '../src/ai/tasks';
import { TEXTURE_LINE } from '../src/content';

describe('schema migration', () => {
  it('opens a v1 project and fills new blocks', () => {
    const v1: any = { ...sampleProject(), schemaVersion: 1 };
    delete v1.factory; delete v1.credits;
    const p = migrateProject(v1);
    expect(p.schemaVersion).toBe(SCHEMA_VERSION);
    expect(p.factory).toEqual({ step: 1, visualsApproved: false });
  });
  it('round-trips current projects through JSON', () => {
    const p = sampleProject();
    expect(migrateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it('rejects garbage and future versions', () => {
    expect(() => migrateProject('nope')).toThrow(MigrationError);
    expect(() => migrateProject({ ...sampleProject(), schemaVersion: 99 })).toThrow(MigrationError);
  });
});

describe('rubric and offline engine', () => {
  it('scores a complete prompt higher than a vague one', () => {
    const good = `Scene: a woman reads a letter.\nCamera: close-up, 85mm.\nCharacters: @image-1 woman in a wool coat.\nLight: soft candle light from the front left, warm amber 1900K, soft shadows to the right.\nEnvironment: small wooden room at night.\n${TEXTURE_LINE}`;
    const bad = 'epic beautiful mysterious scene, 4k masterpiece';
    expect(scorePrompt(good).score).toBeGreaterThan(80);
    expect(scorePrompt(bad).score).toBeLessThan(40);
  });
  it('offline translation maps cinema vocabulary', () => {
    expect(offlineTranslate('yakın plan, soldan sıcak ışık')).toContain('close-up');
  });
});
