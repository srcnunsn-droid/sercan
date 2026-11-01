// Thin, defensive bridge to the claude.ai Artifact runtime (window.claude.use).
// Every capability may be absent: outside claude.ai, in a preview, or declined by the viewer.
type Use = (name: string) => Promise<any | null>;

function getUse(): Use | null {
  const c = (globalThis as any).claude;
  return c && typeof c.use === 'function' ? (c.use.bind(c) as Use) : null;
}

const cache = new Map<string, Promise<any | null>>();

/** Resolves the capability namespace or null. Never throws. */
export function capability<T = any>(name: string): Promise<T | null> {
  if (!cache.has(name)) {
    const use = getUse();
    cache.set(name, use ? use(name).catch(() => null) : Promise.resolve(null));
  }
  return cache.get(name)! as Promise<T | null>;
}

export const inArtifact = () => getUse() !== null;
