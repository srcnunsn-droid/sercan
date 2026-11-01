// Two-layer persistence:
// 1) localStorage: synchronous, per-browser cache. Every access is wrapped: it can be empty or throw.
// 2) Artifact `db` (per-viewer private path data/users/<id>/...): durable across devices when available.
import { capability } from './runtime';

const PREFIX = 'seco.';

export const local = {
  get<T>(key: string): T | null {
    try {
      const raw = globalThis.localStorage?.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch { return null; }
  },
  set(key: string, value: unknown): boolean {
    try { globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; }
  },
  remove(key: string) { try { globalThis.localStorage?.removeItem(PREFIX + key); } catch { /* ignore */ } },
};

export type CloudStatus = 'checking' | 'cloud' | 'local';

interface Envelope { json: string; updatedAt: number }

let userDoc: Promise<any | null> | null = null;

/** The viewer's private document root, or null when db/user are not available. */
function root(): Promise<any | null> {
  if (!userDoc) {
    userDoc = (async () => {
      const [db, user] = await Promise.all([capability('db'), capability('user')]);
      if (!db || !user) return null;
      const id = await user.id().catch(() => null);
      if (!id) return null;
      return db.doc(`data/users/${id}/workspace`);
    })().catch(() => null);
  }
  return userDoc;
}

export const cloud = {
  async available(): Promise<boolean> { return (await root()) !== null; },
  async get<T>(key: string): Promise<{ value: T; updatedAt: number } | null> {
    const r = await root();
    if (!r) return null;
    try {
      const snap = await r.collection('kv').doc(key).get();
      if (!snap.exists) return null;
      const d = snap.data() as Envelope;
      return { value: JSON.parse(d.json) as T, updatedAt: d.updatedAt };
    } catch { return null; }
  },
  async set(key: string, value: unknown, updatedAt = Date.now()): Promise<boolean> {
    const r = await root();
    if (!r) return false;
    try {
      const json = JSON.stringify(value);
      if (json.length > 240_000) return false; // db documents cap at 256 KiB
      await r.collection('kv').doc(key).set({ json, updatedAt });
      return true;
    } catch { return false; }
  },
  async delete(key: string) {
    const r = await root();
    try { await r?.collection('kv').doc(key).delete(); } catch { /* ignore */ }
  },
};

/** Debounced saver: writes local immediately-ish and cloud a little later. */
export function makeSaver(delayMs = 700) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return (key: string, value: unknown, onCloud?: (ok: boolean) => void) => {
    const t = timers.get(key);
    if (t) clearTimeout(t);
    timers.set(key, setTimeout(async () => {
      local.set(key, value);
      const ok = await cloud.set(key, value);
      onCloud?.(ok);
    }, delayMs));
  };
}
