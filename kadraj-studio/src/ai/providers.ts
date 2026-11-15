// AI sağlayıcı katmanı. Varsayılan: Prosedürel (yerel, sıfır API).
// Opsiyonel yerel sunucular: Ollama (metin), ComfyUI (görsel/video), OpenAI-uyumlu TTS (Kokoro-FastAPI vb.).
// İleride bulut API'leri aynı arayüze takılır.
import { kvGet, kvSet } from '../db';

export interface ProviderCfg {
  ollama: { enabled: boolean; url: string; model: string };
  comfy: { enabled: boolean; url: string; imageWorkflow: string; videoWorkflow: string };
  tts: { enabled: boolean; url: string; model: string; voice: string };
  cloud: { enabled: boolean; name: string; url: string; note: string };
}

export const DEFAULT_CFG: ProviderCfg = {
  ollama: { enabled: false, url: 'http://localhost:11434', model: 'qwen3:8b' },
  comfy: { enabled: false, url: 'http://127.0.0.1:8188', imageWorkflow: '', videoWorkflow: '' },
  tts: { enabled: false, url: 'http://localhost:8880', model: 'kokoro', voice: 'af_heart' },
  cloud: { enabled: false, name: '', url: '', note: 'İleride: bulut video/görsel API (anahtar tarayıcıda değil, kendi backend proxy üzerinden saklanmalı).' },
};

export async function loadCfg(): Promise<ProviderCfg> { const c = await kvGet<ProviderCfg>('providers'); return { ...DEFAULT_CFG, ...(c ?? {}) }; }
export const saveCfg = (c: ProviderCfg) => kvSet('providers', c);

async function j(url: string, init?: RequestInit, ms = 120000) {
  const ac = new AbortController(); const to = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { ...init, signal: ac.signal }); if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r; } finally { clearTimeout(to); }
}

// ---- Ollama ----
export async function ollamaTest(c: ProviderCfg['ollama']) { const r = await j(`${c.url}/api/tags`, undefined, 4000); const d = await r.json(); return (d.models ?? []).map((m: { name: string }) => m.name) as string[]; }
export async function ollamaJson(c: ProviderCfg['ollama'], prompt: string): Promise<any> {
  const r = await j(`${c.url}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: c.model, prompt, format: 'json', stream: false, options: { temperature: 0.8 } }) }, 300000);
  const d = await r.json(); return JSON.parse(d.response);
}

// ---- ComfyUI ----
export async function comfyTest(c: ProviderCfg['comfy']) { const r = await j(`${c.url}/system_stats`, undefined, 4000); return r.json(); }
/** Workflow (API formatı) içindeki {{PROMPT}} {{NEGATIVE}} {{SEED}} {{WIDTH}} {{HEIGHT}} {{FRAMES}} yer tutucularını doldurup çalıştırır */
export async function comfyRun(c: ProviderCfg['comfy'], workflow: string, vars: Record<string, string | number>, onStatus: (s: string) => void): Promise<Blob[]> {
  let wf = workflow;
  for (const [k, v] of Object.entries(vars)) wf = wf.replaceAll(`"{{${k}}}"`, typeof v === 'number' ? String(v) : JSON.stringify(v)).replaceAll(`{{${k}}}`, String(v).replace(/"/g, '\\"'));
  const body = { prompt: JSON.parse(wf), client_id: 'kadraj-studio' };
  const r = await j(`${c.url}/prompt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const { prompt_id } = await r.json(); onStatus('Kuyrukta… ' + prompt_id);
  for (let i = 0; i < 1800; i++) {
    await new Promise(res => setTimeout(res, 1000));
    const h = await (await j(`${c.url}/history/${prompt_id}`)).json();
    const item = h[prompt_id]; if (!item) { onStatus(`Üretiliyor… ${i}s`); continue; }
    const files: { filename: string; subfolder: string; type: string }[] = [];
    Object.values(item.outputs ?? {}).forEach((o: any) => ['images', 'gifs', 'videos'].forEach(k => (o[k] ?? []).forEach((f: any) => files.push(f))));
    onStatus(`${files.length} çıktı indiriliyor…`);
    return Promise.all(files.map(async f => (await j(`${c.url}/view?filename=${encodeURIComponent(f.filename)}&subfolder=${encodeURIComponent(f.subfolder)}&type=${f.type}`)).blob()));
  }
  throw new Error('Zaman aşımı');
}

// ---- OpenAI-uyumlu TTS (Kokoro-FastAPI, openedai-speech, Chatterbox server vb.) ----
export async function ttsSpeak(c: ProviderCfg['tts'], text: string, voice?: string): Promise<Blob> {
  const r = await j(`${c.url}/v1/audio/speech`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: c.model, input: text, voice: voice || c.voice, response_format: 'wav' }) });
  const b = await r.blob(); return new Blob([b], { type: 'audio/wav' });
}
