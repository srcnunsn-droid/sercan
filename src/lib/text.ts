// Turkish-aware text helpers.
export const lower = (s: string) => s.toLocaleLowerCase('tr');

/** Word-boundary match that understands Turkish letters. `suffixes` lets "hüzünlü" match "hüzünlüydü". */
export function wordRegex(word: string, suffixes = false): RegExp {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}])${esc}${suffixes ? '\\p{L}*' : ''}(?![\\p{L}])`, 'giu');
}

export function hasWord(text: string, word: string, suffixes = false): boolean {
  return wordRegex(lower(word), suffixes).test(lower(text));
}

export function anyWord(text: string, words: string[], suffixes = false): string | null {
  for (const w of words) if (hasWord(text, w, suffixes)) return w;
  return null;
}

export function countWords(s: string): number {
  return s.trim().split(/\s+/u).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function today(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
