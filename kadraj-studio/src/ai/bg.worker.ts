// Tarayıcıda arka plan silme (transformers.js). Model ilk kullanımda indirilir, sonra önbellekten çalışır.
import { pipeline, env, RawImage } from '@huggingface/transformers';
env.allowLocalModels = false;
let seg: any = null; let loaded = '';
self.onmessage = async (e: MessageEvent) => {
  const { blob, model } = e.data as { blob: Blob; model: string };
  try {
    if (!seg || loaded !== model) {
      const device = (navigator as any).gpu ? 'webgpu' : 'wasm';
      seg = await pipeline('background-removal', model, { device, dtype: 'fp32', progress_callback: (p: any) => { if (p.status === 'progress') self.postMessage({ type: 'progress', file: p.file, progress: p.progress }); } } as any);
      loaded = model;
    }
    self.postMessage({ type: 'status', msg: 'Dekupe ediliyor…' });
    const img = await RawImage.fromBlob(blob);
    const [out] = await seg(img);
    const rgba = out.channels === 4 ? out : out.rgba();
    self.postMessage({ type: 'done', data: new Uint8ClampedArray(rgba.data), width: rgba.width, height: rgba.height });
  } catch (err) { self.postMessage({ type: 'error', msg: (err as Error).message }); }
};
