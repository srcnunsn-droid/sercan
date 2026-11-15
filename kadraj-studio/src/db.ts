// IndexedDB: projeler + medya blob'ları (tamamen yerel, sunucu yok)
import type { Project } from './types';

let dbp: Promise<IDBDatabase> | null = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('kadraj-studio', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('projects'); d.createObjectStore('blobs'); d.createObjectStore('kv'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((res, rej) => { const t = d.transaction(store, mode); const q = fn(t.objectStore(store)); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
}

export const putBlob = (id: string, b: Blob) => tx('blobs', 'readwrite', s => s.put(b, id));
export const getBlob = (id: string) => tx<Blob | undefined>('blobs', 'readonly', s => s.get(id));
export const delBlob = (id: string) => tx('blobs', 'readwrite', s => s.delete(id));
export const saveProject = (p: Project) => tx('projects', 'readwrite', s => s.put(p, p.id));
export const loadProject = (id: string) => tx<Project | undefined>('projects', 'readonly', s => s.get(id));
export const deleteProject = (id: string) => tx('projects', 'readwrite', s => s.delete(id));
export const listProjects = () => tx<Project[]>('projects', 'readonly', s => s.getAll());
export const kvGet = <T,>(k: string) => tx<T | undefined>('kv', 'readonly', s => s.get(k));
export const kvSet = (k: string, v: unknown) => tx('kv', 'readwrite', s => s.put(v, k));
