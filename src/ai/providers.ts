import { capability } from '../lib/runtime';
import type { AIProvider } from './types';

/** Uses the claude.ai Artifact runtime (`sample` capability): runs on the viewer's own Claude account. */
export const claudeArtifactProvider: AIProvider = {
  id: 'claude-artifact',
  labelTr: 'Claude (claude.ai üzerinden)',
  async available() { return (await capability('sample')) !== null; },
  async json(prompt, opts) {
    const sample = await capability<any>('sample');
    if (!sample) throw { code: 'not_granted', message: 'sample unavailable' };
    return sample.json(prompt, { signal: opts?.signal, modelTier: opts?.quick ? 'quick' : 'default' });
  },
};

// The key lives only in memory for this session. It is never written to storage or into the code.
let sessionKey: string | null = null;
let sessionModel = 'claude-sonnet-5-5';
export const setSessionKey = (k: string | null, model?: string) => { sessionKey = k?.trim() || null; if (model) sessionModel = model; };
export const hasSessionKey = () => !!sessionKey;

/** Direct Messages API call with the user's own key. Works when the page is opened outside claude.ai
 *  (the Artifact frame blocks network calls to other hosts). */
export const apiKeyProvider: AIProvider = {
  id: 'api-key',
  labelTr: 'Kendi API anahtarım',
  async available() { return !!sessionKey; },
  async json(prompt, opts) {
    if (!sessionKey) throw { code: 'not_granted', message: 'no key' };
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: opts?.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': sessionKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: sessionModel, max_tokens: 2000, messages: [{ role: 'user', content: prompt + '\n\nReply with only JSON.' }] }),
    });
    if (!res.ok) throw { code: 'upstream_error', message: `HTTP ${res.status}` };
    const data = await res.json();
    const text: string = (data.content ?? []).map((b: any) => b.text ?? '').join('');
    return parseLooseJson(text);
  },
};

export const mockProvider: AIProvider = {
  id: 'mock',
  labelTr: 'Çevrimdışı şablon motoru',
  async available() { return true; },
  async json() { throw { code: 'use_template', message: 'mock answers come from the task templates' }; },
};

export function parseLooseJson(text: string): unknown {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  if (fence) { try { return JSON.parse(fence[1]); } catch { /* fall through */ } }
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
  throw { code: 'invalid_json', message: 'no json' };
}

export const PROVIDERS = [claudeArtifactProvider, apiKeyProvider, mockProvider];
