// All interface text lives in a language file. Turkish is the default; English is ready to fill in.
import tr from './tr.json';
import en from './en.json';

const DICTS: Record<string, Record<string, string>> = { tr, en };
let lang: 'tr' | 'en' = 'tr';
export const setLang = (l: 'tr' | 'en') => { lang = l; };
export function t(key: string): string {
  return DICTS[lang][key] ?? DICTS.tr[key] ?? key;
}
