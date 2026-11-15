import { useEffect, useState } from 'react';
import { DEFAULT_CFG, comfyTest, loadCfg, ollamaTest, saveCfg, type ProviderCfg } from '../ai/providers';
import { S } from '../store';

const SAMPLE_WF = `{
  "3": {"class_type": "KSampler", "inputs": {"seed": "{{SEED}}", "steps": 25, "cfg": 6, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0]}},
  "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sdxl_base.safetensors"}},
  "5": {"class_type": "EmptyLatentImage", "inputs": {"width": "{{WIDTH}}", "height": "{{HEIGHT}}", "batch_size": 1}},
  "6": {"class_type": "CLIPTextEncode", "inputs": {"text": "{{PROMPT}}", "clip": ["4", 1]}},
  "7": {"class_type": "CLIPTextEncode", "inputs": {"text": "{{NEGATIVE}}", "clip": ["4", 1]}},
  "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
  "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "kadraj", "images": ["8", 0]}}
}`;

export function AIEngines() {
  const [c, setC] = useState<ProviderCfg>(DEFAULT_CFG); const [st, setSt] = useState<Record<string, string>>({});
  useEffect(() => { loadCfg().then(setC); }, []);
  const upd = (fn: (x: ProviderCfg) => void) => setC(o => { const n = structuredClone(o); fn(n); saveCfg(n); return n; });
  const test = async (k: string, f: () => Promise<string>) => { setSt(s => ({ ...s, [k]: '…' })); try { const r = await f(); setSt(s => ({ ...s, [k]: '✔ ' + r })); } catch (e) { setSt(s => ({ ...s, [k]: '✖ ' + (e as Error).message + ' (CORS / sunucu kapalı olabilir)' })); } };

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 6 }}><h2>🧠 AI Motorları</h2><span className="chip ok">Varsayılan: Prosedürel (yerel)</span></div>
      <p className="muted" style={{ maxWidth: 900 }}>Stüdyo hiçbir harici API olmadan tam çalışır. Daha güçlü üretim için <b>kendi bilgisayarında</b> çalışan açık kaynak sunucuları bağlayabilirsin — veriler makineden çıkmaz. İleride bulut API'leri de aynı katmana takılacak.</p>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="card col">
          <div className="row"><h3>Ollama — yerel LLM</h3><span className="sp" /><label className="row"><input type="checkbox" checked={c.ollama.enabled} onChange={e => upd(x => { x.ollama.enabled = e.target.checked; })} />Etkin</label></div>
          <span className="small dim">Senaryo, hook, shot listesi ve İngilizce prompt yazımı. Önerilen: qwen3, llama3.x, gemma3, mistral.</span>
          <div className="grid2"><input value={c.ollama.url} onChange={e => upd(x => { x.ollama.url = e.target.value; })} /><input value={c.ollama.model} onChange={e => upd(x => { x.ollama.model = e.target.value; })} /></div>
          <div className="row"><button onClick={() => test('o', async () => (await ollamaTest(c.ollama)).join(', ') || 'model yok')}>Bağlantıyı test et</button><span className="small">{st.o}</span></div>
          <div className="hint mono small">OLLAMA_ORIGINS="*" ollama serve<br />ollama pull qwen3:8b</div>
        </div>
        <div className="card col">
          <div className="row"><h3>Yerel TTS (OpenAI-uyumlu)</h3><span className="sp" /><label className="row"><input type="checkbox" checked={c.tts.enabled} onChange={e => upd(x => { x.tts.enabled = e.target.checked; })} />Etkin</label></div>
          <span className="small dim">Kokoro-FastAPI (port 8880), Chatterbox-TTS-Server, openedai-speech vb. — <span className="mono">POST /v1/audio/speech</span></span>
          <div className="grid3"><input value={c.tts.url} onChange={e => upd(x => { x.tts.url = e.target.value; })} /><input value={c.tts.model} onChange={e => upd(x => { x.tts.model = e.target.value; })} /><input value={c.tts.voice} onChange={e => upd(x => { x.tts.voice = e.target.value; })} /></div>
          <div className="hint mono small">docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu</div>
        </div>
        <div className="card col" style={{ gridColumn: '1/3' }}>
          <div className="row"><h3>ComfyUI — görsel & video üretimi</h3><span className="sp" /><label className="row"><input type="checkbox" checked={c.comfy.enabled} onChange={e => upd(x => { x.comfy.enabled = e.target.checked; })} />Etkin</label></div>
          <span className="small dim">Wan 2.x, LTX-Video/LTX-2, HunyuanVideo, Flux, SDXL… ComfyUI'de workflow'u kur → "Save (API Format)" ile JSON al → buraya yapıştır. Yer tutucular: <span className="mono">{'{{PROMPT}} {{NEGATIVE}} {{SEED}} {{WIDTH}} {{HEIGHT}} {{FRAMES}}'}</span></span>
          <div className="row"><input className="grow" value={c.comfy.url} onChange={e => upd(x => { x.comfy.url = e.target.value; })} /><button onClick={() => test('c', async () => { const r = await comfyTest(c.comfy); return (r.devices?.[0]?.name ?? 'OK'); })}>Test</button><span className="small">{st.c}</span></div>
          <div className="grid2">
            <div className="col"><label>Görsel workflow (API JSON)</label><textarea rows={8} className="mono small" value={c.comfy.imageWorkflow} onChange={e => upd(x => { x.comfy.imageWorkflow = e.target.value; })} /><button className="sm" onClick={() => upd(x => { x.comfy.imageWorkflow = SAMPLE_WF; })}>Örnek SDXL workflow yükle</button></div>
            <div className="col"><label>Video workflow (API JSON — Wan/LTX/Hunyuan)</label><textarea rows={8} className="mono small" value={c.comfy.videoWorkflow} onChange={e => upd(x => { x.comfy.videoWorkflow = e.target.value; })} /></div>
          </div>
          <div className="hint mono small">python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header "*"</div>
        </div>
        <div className="card col" style={{ gridColumn: '1/3', opacity: 0.8 }}>
          <h3>☁ Bulut API (ileride)</h3>
          <span className="muted small">Mimari hazır: sağlayıcı arayüzü (metin / görsel / video / ses) tek noktadan değişir. API anahtarları tarayıcıda tutulmamalı — küçük bir backend proxy ile bağlanacak. Kandidatlar: Seedance, Kling, Veo, Runway, ElevenLabs, Suno vb.</span>
          <button className="sm" style={{ alignSelf: 'start' }} onClick={() => S().ui({ panel: 'eco' })}>Ekosistem haritasına bak →</button>
        </div>
      </div>
    </div>
  );
}
