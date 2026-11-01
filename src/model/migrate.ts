import { SCHEMA_VERSION, type Project } from './types';
import { emptyProject } from './factory';

type Migration = (p: any) => any;

// Each entry upgrades from version N to N+1.
const MIGRATIONS: Record<number, Migration> = {
  // v1 had no factory/credits blocks and stored a single "aspect" string per part.
  1: (p) => ({
    ...p,
    factory: p.factory ?? { step: 1, visualsApproved: false },
    credits: p.credits ?? { attempts: 0, spent: 0 },
    aspect: p.aspect ?? '9:16',
    parts: (p.parts ?? []).map((part: any) => ({ ...part, dialogue: part.dialogue ?? [], characters: part.characters ?? [] })),
    schemaVersion: 2,
  }),
};

export class MigrationError extends Error {}

/** Opens a project JSON from any known schema version. Throws MigrationError for unknown/invalid input. */
export function migrateProject(input: unknown): Project {
  if (!input || typeof input !== 'object') throw new MigrationError('Dosya bir proje değil.');
  let p: any = { ...(input as object) };
  if (typeof p.schemaVersion !== 'number') p.schemaVersion = 1;
  if (p.schemaVersion > SCHEMA_VERSION) throw new MigrationError('Bu proje programın daha yeni bir sürümüyle kaydedilmiş.');
  while (p.schemaVersion < SCHEMA_VERSION) {
    const m = MIGRATIONS[p.schemaVersion];
    if (!m) throw new MigrationError(`Sürüm ${p.schemaVersion} için geçiş yok.`);
    p = m(p);
  }
  if (!Array.isArray(p.parts) || typeof p.title !== 'string') throw new MigrationError('Proje alanları eksik.');
  const base = emptyProject();
  return { ...base, ...p };
}
