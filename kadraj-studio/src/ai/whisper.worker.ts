// Tarayıcıda Whisper (transformers.js + ONNX/WebGPU). Model ilk kullanımda Hugging Face'ten indirilir,
// sonra tarayıcı önbelleğinden çalışır — veri cihazdan çıkmaz.
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
let asr: any = null; let loaded = '';

self.onmessage = async (e: MessageEvent) => {
  const { audio, model, language } = e.data as { audio: Float32Array; model: string; language: string };
  try {
    if (!asr || loaded !== model) {
      const device = (navigator as any).gpu ? 'webgpu' : 'wasm';
      asr = await pipeline('automatic-speech-recognition', model, {
        device, dtype: device === 'webgpu' ? 'fp32' : 'q8',
        progress_callback: (p: any) => { if (p.status === 'progress') self.postMessage({ type: 'progress', file: p.file, progress: p.progress }); },
      } as any);
      loaded = model;
    }
    self.postMessage({ type: 'status', msg: 'Konuşma çözümleniyor…' });
    const out = await asr(audio, { return_timestamps: true, chunk_length_s: 30, stride_length_s: 5, language: language || null, task: 'transcribe' });
    self.postMessage({ type: 'done', text: out.text, chunks: out.chunks ?? [] });
  } catch (err) {
    self.postMessage({ type: 'error', msg: (err as Error).message });
  }
};
